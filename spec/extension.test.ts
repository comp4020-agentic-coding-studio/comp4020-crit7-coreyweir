import { describe, expect, inject, it } from "vitest";
import { addWorkingDays } from "../src/lib/dates";

// The promises this app makes in place of the PowerBI form, checked against
// the running server (CLAUDE.md rules 1–3).
const baseUrl = inject("baseUrl");

// Astro checks form POSTs carry a same-origin Origin header (CSRF
// protection); browsers send it automatically, a bare fetch doesn't.
const post = (path: string, body: URLSearchParams | FormData) =>
  fetch(new URL(path, baseUrl), {
    method: "POST",
    headers: { origin: baseUrl },
    body,
    redirect: "manual",
  });
const page = async (path: string) => (await fetch(new URL(path, baseUrl))).text();

const A2 = "2026-09-21T12:00:00+10:00"; // COMP4020 Assignment 2, from the course API

describe("working days", () => {
  it("skips the weekend", () => {
    // Friday 25 Sept + 1 working day = Monday 28 Sept
    expect(addWorkingDays("2026-09-25T12:00:00+10:00", 1)).toBe("2026-09-28T12:00:00+10:00");
  });

  it("gives five working days on Assignment 2 as the following Monday", () => {
    expect(addWorkingDays(A2, 5)).toBe("2026-09-28T12:00:00+10:00");
  });

  it("keeps noon as noon across the daylight-saving change", () => {
    // DST starts Sunday 4 Oct 2026; Thu 1 Oct + 5 working days = Thu 8 Oct, now +11
    expect(addWorkingDays("2026-10-01T12:00:00+10:00", 5)).toBe("2026-10-08T12:00:00+11:00");
  });
});

describe("say it once", () => {
  it("prefills the saved message and default days on a new request", async () => {
    const html = await page("/");
    expect(html).toContain("in line with the adjustments in my EAP");
    expect(html).toMatch(/name="days"[^>]*value="5"/);
  });

  it("keeps an uploaded EAP and offers it on the next request", async () => {
    const form = new FormData();
    form.set("name", "Spec Student");
    form.set("uid", "u1234567");
    form.set("defaultDays", "5");
    form.set("defaultMessage", "Saved default message for the spec.");
    form.set("eap", new File(["%PDF-1.4 spec"], "my-eap.pdf", { type: "application/pdf" }));
    const res = await post("/profile/", form);
    expect(res.status).toBe(303);

    const html = await page("/");
    expect(html).toContain("my-eap.pdf");
    expect(html).toContain("Saved default message for the spec.");

    const file = await fetch(new URL("/api/eap", baseUrl));
    expect(await file.text()).toBe("%PDF-1.4 spec");
  });
});

describe("a request", () => {
  const assessmentId = async () => {
    const html = await page("/");
    const match = html.match(/<option value="(\d+)"[^>]*>COMP4020 Assignment 2/);
    if (!match) throw new Error("Assignment 2 is not offered");
    return match[1];
  };

  it("persists, with the due date computed by the server, across a reload", async () => {
    const res = await post(
      "/",
      new URLSearchParams({
        assessmentId: await assessmentId(),
        days: "5",
        message: "spec request",
        attachEap: "on",
        // a forged date must be ignored (rule 2)
        requestedDue: "2030-01-01T00:00:00+10:00",
        originalDue: "2030-01-01T00:00:00+10:00",
      }),
    );
    expect(res.status).toBe(303);
    const location = res.headers.get("location") ?? "";
    expect(location).toMatch(/^\/requests\/\d+\/\?submitted=1$/);

    const reloaded = await page(location.replace("?submitted=1", ""));
    expect(reloaded).toContain("Monday 21 September 2026");
    expect(reloaded).toContain("Monday 28 September 2026");
    expect(reloaded).not.toContain("2030");
    expect(reloaded).toContain("my-eap.pdf");
    expect(reloaded).toContain("spec request");

    expect(await page("/requests/")).toContain(location.split("/")[2]);
  });

  it("refuses a bad submission with the reason, keeping what was typed", async () => {
    const res = await post(
      "/",
      new URLSearchParams({ assessmentId: await assessmentId(), days: "0", message: "keep me" }),
    );
    expect(res.status).toBe(422);
    const html = await res.text();
    expect(html).toContain("Nothing was submitted");
    expect(html).toContain("whole number of working days");
    expect(html).toContain("keep me");
  });
});
