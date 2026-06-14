import { vi } from "vitest";
import { signInWithEmail, signOutCurrentUser, getCurrentSession } from "../authService";

const mockAuth = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: { auth: mockAuth },
}));

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signInWithEmail", () => {
    it("resolves without error on successful sign-in", async () => {
      mockAuth.signInWithPassword.mockResolvedValue({ error: null });

      await expect(signInWithEmail("user@test.com", "pass123")).resolves.toBeUndefined();
      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: "user@test.com",
        password: "pass123",
      });
    });

    it("throws with Supabase error message on failure", async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        error: { message: "Invalid login credentials" },
      });

      await expect(signInWithEmail("bad@test.com", "wrong")).rejects.toThrow(
        "Invalid login credentials"
      );
    });
  });

  describe("signOutCurrentUser", () => {
    it("resolves without error on successful sign-out", async () => {
      mockAuth.signOut.mockResolvedValue({ error: null });

      await expect(signOutCurrentUser()).resolves.toBeUndefined();
      expect(mockAuth.signOut).toHaveBeenCalled();
    });

    it("throws with Supabase error message on failure", async () => {
      mockAuth.signOut.mockResolvedValue({ error: { message: "Network error" } });

      await expect(signOutCurrentUser()).rejects.toThrow("Network error");
    });
  });

  describe("getCurrentSession", () => {
    it("returns session when one exists", async () => {
      const fakeSession = { user: { id: "u1" }, access_token: "tok" };
      mockAuth.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });

      const result = await getCurrentSession();

      expect(result).toBe(fakeSession);
    });

    it("returns null when no session exists", async () => {
      mockAuth.getSession.mockResolvedValue({ data: { session: null }, error: null });

      const result = await getCurrentSession();

      expect(result).toBeNull();
    });

    it("throws when Supabase returns an error", async () => {
      mockAuth.getSession.mockResolvedValue({ data: { session: null }, error: { message: "Session fetch failed" } });

      await expect(getCurrentSession()).rejects.toThrow("Session fetch failed");
    });
  });
});
