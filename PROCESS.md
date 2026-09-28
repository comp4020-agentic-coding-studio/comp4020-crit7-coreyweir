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
in for the Canvas integration I'd really appreciate (updating stale assessment deadlines is annoying),
and `requests`—which stores snapshots of both due dates.

The flow itself
([`0254912`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-coreyweir/commit/0254912))
has each form page handle its own POST, so a failed submit can re-render with
the student's input and a specific error (rule 3). The server recomputes both
dates and never reads one from the request body (rule 2).

## How I knew it was right

I knew it was right when I tested it. It admittedly wasn't the prettiest or most polished implementation,
but it solved the main frustration I have when requesting extensions. Actually running through the flow
confirmed that it felt better to me, and that was my primary goal.
