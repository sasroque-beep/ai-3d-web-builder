import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const companies = sqliteTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  segment: text("segment").notNull(),
  relationshipType: text("relationship_type", {
    enum: ["client", "lead"],
  })
    .notNull()
    .default("lead"),
  origin: text("origin", {
    enum: ["manual", "public_research"],
  })
    .notNull()
    .default("manual"),
  city: text("city"),
  state: text("state"),
  website: text("website"),
  socialMedia: text("social_media"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  description: text("description"),
  mainProducts: text("main_products"),
  targetAudience: text("target_audience"),
  mainGoal: text("main_goal"),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
});

export type CompanyRow = typeof companies.$inferSelect;
export type NewCompanyRow = typeof companies.$inferInsert;
