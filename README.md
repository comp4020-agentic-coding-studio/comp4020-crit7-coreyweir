# ANU extension requests, rebuilt

A replacement for ANU's extension request form, built for a student with an
Education Access Plan (EAP). The current form is a PowerBI form, and for an EAP
student every request is the same ritual: attach the same document again, type
out the same "requesting a 5 working day extension in line with the adjustments
in my EAP" message again, correct a due date that doesn't come from Canvas and
is often wrong, and then get an error message at the end even though the
request went through.

Here you upload your EAP and write your usual message **once**, on
[My EAP & defaults](/profile/). Every request after that is: pick the
assessment, check the prefilled form, submit. The due date comes with the
assessment and the new due date is calculated for you. When you submit, you
land on the saved request, not on an error.

## What good looks like here

Good means the form never asks for something it already knows, and never tells
you something that isn't true. Each rule answers one of the PowerBI form's
failures, and the rules are in `CLAUDE.md`:

- **Say it once.** The EAP document, usual day count and usual message live in
  a profile and prefill every request. You can still edit the message for a
  one-off. _Enforced_ by `spec/extension.test.ts` ("say it once").
- **Due dates are never typed.** Assessments and their due dates come from a
  table that stands in for a Canvas feed. It's seeded with COMP4020's real due
  dates, copied from the course website's API. The requested date is computed
  on the server in working days (weekends skipped, time of day kept, daylight
  saving handled). A date forged into the POST is ignored. _Enforced_: unit
  tests for the working-day maths, and an HTTP test that forges a date.
- **Only honest outcomes.** A successful submit redirects to the saved request,
  rendered from the database, so reloading shows the same thing and it appears
  under [My requests](/requests/). A failed submit says which field failed and
  keeps what you typed. _Enforced_: persistence-across-reload and bad-submission
  tests.
- **Works without JavaScript.** Plain forms that POST and redirect. The only
  script is a live preview of the new due date. _Judgement call_, checked by
  hand.

What I chose not to build: logins (there is one demo student), the convenor's
side of the workflow (approving and declining), public holidays in the
working-day count (the form says so), and a real Canvas integration. The
seeded `assessments` table is where one would plug in.
