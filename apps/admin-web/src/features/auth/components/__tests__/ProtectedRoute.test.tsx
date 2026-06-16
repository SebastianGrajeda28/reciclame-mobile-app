import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import { ProtectedRoute } from "../ProtectedRoute";

vi.mock("@/shared/context/UserContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/shared/components/AppLoadingScreen", () => ({
  default: () => <div data-testid="loading-screen" />,
}));

import { useUser } from "@/shared/context/UserContext";

const mockUseUser = useUser as ReturnType<typeof vi.fn>;

function renderWithRouter(allowedRoles?: string[]) {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
          <Route path="/dashboard" element={<div data-testid="protected-content" />} />
        </Route>
        <Route path="/login" element={<div data-testid="login-page" />} />
        <Route path="/unauthorized" element={<div data-testid="unauthorized-page" />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("shows loading screen while auth state resolves", () => {
    mockUseUser.mockReturnValue({ account: null, loading: true });

    renderWithRouter();

    expect(screen.getByTestId("loading-screen")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("redirects to /login when not authenticated", () => {
    mockUseUser.mockReturnValue({ account: null, loading: false });

    renderWithRouter();

    expect(screen.getByTestId("login-page")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("renders protected content for authenticated user with no role restriction", () => {
    mockUseUser.mockReturnValue({
      account: { id: "u1", email: "user@test.com", name: "User", role: "VIEWER" },
      loading: false,
    });

    renderWithRouter();

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  it("renders content when user role matches allowedRoles", () => {
    mockUseUser.mockReturnValue({
      account: { id: "u1", email: "admin@test.com", name: "Admin", role: "ADMIN" },
      loading: false,
    });

    renderWithRouter(["ADMIN", "MANAGER"]);

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  it("redirects to /unauthorized when user role is not in allowedRoles", () => {
    mockUseUser.mockReturnValue({
      account: { id: "u1", email: "viewer@test.com", name: "Viewer", role: "VIEWER" },
      loading: false,
    });

    renderWithRouter(["ADMIN"]);

    expect(screen.getByTestId("unauthorized-page")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("redirects to /unauthorized when account has null role and roles are restricted", () => {
    mockUseUser.mockReturnValue({
      account: { id: "u1", email: "norole@test.com", name: "NoRole", role: null },
      loading: false,
    });

    renderWithRouter(["ADMIN"]);

    expect(screen.getByTestId("unauthorized-page")).toBeInTheDocument();
  });
});
