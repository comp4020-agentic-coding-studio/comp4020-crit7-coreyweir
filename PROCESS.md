# Process overview

## What I built

A full-stack replacement for ANU's PowerBI extension request form, shaped
around my own experience of it as a student with an EAP. `README.md` explains
what it is and what good means here.

## How I got here

I started by asking the agent for fast ideas that fit the brief. I picked the
extension form over its suggestions because it's the ANU system that costs me
the most, and I gave the agent the failures directly:

> I have an EAP: it doesn't save that. I always have to attach the same
> document, write out a generic 'requesting a 5 working day extension in line
> with the adjustments in my EAP…' message, correct the due date because it
> doesn't hook into Canvas and is often wrong, then get an erroneous error
> message at the end.

Before any code, those four failures became the four rules in `CLAUDE.md`
([`f8fbe63`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-coreyweir/commit/f8fbe63)).
Everything after that was built against them.

The schema came next
([`bb4ad45`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-coreyweir/commit/bb4ad45)):
a single-row `profile` for what's said once, an `assessments` table standing
in for Canvas, and `requests`, which stores snapshots of both due dates.
Grounding: the seed due dates were copied from the course website's API rather
than made up. The working-day maths is a pure function so it could be tested
on its own, including across the October daylight-saving change.
drizzle-kit's rename prompt needs an interactive terminal, so dropping the
starter's guestbook table went in as its own migration after the new tables
were created, rather than hand-editing generated SQL.

The flow itself
([`0254912`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-coreyweir/commit/0254912))
has each form page handle its own POST, so a failed submit can re-render with
the student's input and a specific error (rule 3). The server recomputes both
dates and never reads one from the request body (rule 2).

## How I knew it was right

The spec tests
([`3a849df`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-coreyweir/commit/3a849df))
drive the built server over HTTP. They upload an EAP and check it's offered on
the next request, forge a due date and check it's ignored, reload the
confirmation page and check the request is still there, and send a bad day
count and check the reply is a specific error with the message kept. The
starter's invariants (landmarks, one `h1`, axe) cover every page in
`spec/routes.ts`.
