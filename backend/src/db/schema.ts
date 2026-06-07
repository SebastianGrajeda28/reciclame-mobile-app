import { pgTable, uuid, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
});

export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  roleId: uuid("role_id").notNull().references(() => roles.id),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
});


export const educationalContent = pgTable("educational_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  contentType: text("content_type").notNull(),
  body: text("body").notNull(),
  imageUrl: text("image_url"),
  wasteTypeId: uuid("waste_type_id"),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export type EducationalContent = typeof educationalContent.$inferSelect;
export type NewEducationalContent = typeof educationalContent.$inferInsert;