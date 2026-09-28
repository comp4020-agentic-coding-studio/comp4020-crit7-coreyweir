# Harness: ANU extension request, rebuilt

The app replaces ANU's PowerBI extension request form for a student with an
Education Access Plan (EAP). Every rule below comes from a specific failure of
the current form; if a change would reintroduce one, stop and say so.

## Rules

1. **Say it once.** Anything the student states the same way on every request
   (their EAP document, their usual extension length, their usual message) is
   stored once in the profile and prefilled on each new request. Never make
   the student re-upload or re-type what the app already holds.
2. **Due dates are never typed.** The original due date comes from the
   `assessments` table (the stand-in for a Canvas feed, seeded from the
   COMP4020 course API), never from a form field. The requested due date is
   computed on the server from the original due date plus N working days.
   Don't trust either date if it arrives in a POST body.
3. **Only honest outcomes.** A successful submit redirects to a page that
   renders the saved row from the database, so it reloads correctly. A failed
   submit re-renders the form with the specific field that failed and keeps
   what the student typed. No generic error messages, and no error after a
   success.
4. **Schema is ground truth.** Change `src/lib/schema.ts`, run
   `pnpm db:generate`, and commit the migration with it. Never hand-edit a
   generated migration. Seed data goes in a separate custom migration.
5. **Works without JavaScript.** Plain HTML forms that POST and redirect.
   Client-side JS may only enhance a page.
6. **Keep the checks green.** Run `pnpm check` before every commit. Any route
   you add goes in `spec/routes.ts`. Every promise above that can be checked
   mechanically has a test in `spec/`.

## Out of scope

Authentication (there is one demo student), the staff/convenor side of the
workflow, public holidays in the working-day count (weekends only; this is
stated in the UI), and real Canvas integration.
