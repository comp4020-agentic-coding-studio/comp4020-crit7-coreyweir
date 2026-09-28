import { sql } from "drizzle-orm";
import { blob, int, sqliteTable, text } from "drizzle-orm/sqlite-core";

// The schema is the ground truth for the database. To change it: edit here,
// run `pnpm db:generate` to turn the diff into a migration under drizzle/,
// and commit both — the migration applies automatically when the server
// boots (see src/lib/db.ts), locally and deployed. Never edit the database
// by hand: state on the deployed volume outlives every deploy, and the
// migration trail is what keeps old state and new code compatible.

// The things a student with an EAP says identically on every request, stored
// once. There is one demo student, so this table holds a single row (id 1).
export const profile = sqliteTable("profile", {
  id: int().primaryKey(),
  name: text().notNull().default(""),
  uid: text().notNull().default(""),
  eapFileName: text("eap_file_name"),
  eapFileType: text("eap_file_type"),
  eapFile: blob("eap_file", { mode: "buffer" }),
  defaultDays: int("default_days").notNull().default(5),
  defaultMessage: text("default_message").notNull().default(""),
});

// The stand-in for a Canvas feed: due dates come from here, never from a form.
export const assessments = sqliteTable("assessments", {
  id: int().primaryKey({ autoIncrement: true }),
  course: text().notNull(),
  title: text().notNull(),
  dueAt: text("due_at").notNull(), // ISO 8601 with offset
});

export const requests = sqliteTable("requests", {
  id: int().primaryKey({ autoIncrement: true }),
  assessmentId: int("assessment_id")
    .notNull()
    .references(() => assessments.id),
  days: int().notNull(),
  // snapshots, so a later change to the assessment doesn't rewrite history
  originalDue: text("original_due").notNull(),
  requestedDue: text("requested_due").notNull(),
  message: text().notNull(),
  eapFileName: text("eap_file_name"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export type Profile = typeof profile.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type ExtensionRequest = typeof requests.$inferSelect;
