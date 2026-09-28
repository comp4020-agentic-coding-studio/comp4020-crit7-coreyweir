import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { addWorkingDays } from "./dates";
import { type Assessment, assessments, type Profile, profile, requests } from "./schema";

// One SQLite file is the app's whole persistent state. In production
// fly.toml points DATABASE_PATH at the machine's volume (/data), which is
// how state survives a reload and a redeploy; locally it defaults to an
// untracked file in .data/.
const path = process.env.DATABASE_PATH ?? "./.data/app.db";
mkdirSync(dirname(path), { recursive: true });

const client = new Database(path);
client.pragma("journal_mode = WAL");
client.pragma("foreign_keys = ON");

export const db = drizzle(client);

// Migrations run at boot, on whatever machine holds the volume — the
// recommended shape for SQLite on Fly, where there's no separate machine to
// run them from. The flow: edit src/lib/schema.ts, `pnpm db:generate`,
// commit the migration it writes to drizzle/.
migrate(db, { migrationsFolder: "./drizzle" });

export type { Assessment, Profile };
export type ProfileSummary = Omit<Profile, "eapFile">;

const ME = 1; // the one demo student

export const MIN_DAYS = 1;
export const MAX_DAYS = 20;

export function getProfile(): ProfileSummary {
  const row = db
    .select({
      id: profile.id,
      name: profile.name,
      uid: profile.uid,
      eapFileName: profile.eapFileName,
      eapFileType: profile.eapFileType,
      defaultDays: profile.defaultDays,
      defaultMessage: profile.defaultMessage,
    })
    .from(profile)
    .where(eq(profile.id, ME))
    .get();
  if (!row) throw new Error("profile row missing: the seed migration did not run");
  return row;
}

export function getEapFile(): { name: string; type: string; data: Buffer } | undefined {
  const row = db.select().from(profile).where(eq(profile.id, ME)).get();
  if (!row?.eapFile || !row.eapFileName) return undefined;
  return {
    name: row.eapFileName,
    type: row.eapFileType ?? "application/octet-stream",
    data: row.eapFile,
  };
}

export function saveProfile(
  fields: Pick<Profile, "name" | "uid" | "defaultDays" | "defaultMessage">,
  eap?: { name: string; type: string; data: Buffer },
): void {
  db.update(profile)
    .set({
      ...fields,
      ...(eap ? { eapFileName: eap.name, eapFileType: eap.type, eapFile: eap.data } : {}),
    })
    .where(eq(profile.id, ME))
    .run();
}

export function listAssessments(): Assessment[] {
  return db.select().from(assessments).orderBy(asc(assessments.dueAt)).all();
}

export function getAssessment(id: number): Assessment | undefined {
  return db.select().from(assessments).where(eq(assessments.id, id)).get();
}

/**
 * Both dates are derived here, on the server, from the assessments table:
 * nothing date-shaped from the request body is ever stored.
 */
export function createRequest(input: {
  assessment: Assessment;
  days: number;
  message: string;
  attachEap: boolean;
}): number {
  const eapFileName = input.attachEap ? (getProfile().eapFileName ?? null) : null;
  const row = db
    .insert(requests)
    .values({
      assessmentId: input.assessment.id,
      days: input.days,
      originalDue: input.assessment.dueAt,
      requestedDue: addWorkingDays(input.assessment.dueAt, input.days),
      message: input.message,
      eapFileName,
    })
    .returning({ id: requests.id })
    .get();
  return row.id;
}

const requestColumns = {
  id: requests.id,
  days: requests.days,
  originalDue: requests.originalDue,
  requestedDue: requests.requestedDue,
  message: requests.message,
  eapFileName: requests.eapFileName,
  createdAt: requests.createdAt,
  course: assessments.course,
  title: assessments.title,
};

export type RequestView = {
  id: number;
  days: number;
  originalDue: string;
  requestedDue: string;
  message: string;
  eapFileName: string | null;
  createdAt: string;
  course: string;
  title: string;
};

export function getRequest(id: number): RequestView | undefined {
  return db
    .select(requestColumns)
    .from(requests)
    .innerJoin(assessments, eq(requests.assessmentId, assessments.id))
    .where(eq(requests.id, id))
    .get();
}

export function listRequests(): RequestView[] {
  return db
    .select(requestColumns)
    .from(requests)
    .innerJoin(assessments, eq(requests.assessmentId, assessments.id))
    .orderBy(desc(requests.id))
    .all();
}
