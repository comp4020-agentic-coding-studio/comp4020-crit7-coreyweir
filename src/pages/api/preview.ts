import type { APIRoute } from "astro";
import { addWorkingDays, formatDue } from "../../lib/dates";
import { getAssessment, MAX_DAYS, MIN_DAYS } from "../../lib/db";

// Read-only preview of the extended due date, for the form's live hint.
export const GET: APIRoute = ({ url }) => {
  const assessment = getAssessment(Number(url.searchParams.get("assessmentId")));
  const days = Number(url.searchParams.get("days"));
  if (!assessment || !Number.isInteger(days) || days < MIN_DAYS || days > MAX_DAYS) {
    return new Response(JSON.stringify({ error: "bad assessment or day count" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  const iso = addWorkingDays(assessment.dueAt, days);
  return Response.json({ iso, requestedDue: formatDue(iso) });
};
