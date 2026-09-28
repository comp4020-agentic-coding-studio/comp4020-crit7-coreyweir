-- Stand-in for a Canvas feed. Due dates copied verbatim from the COMP4020
-- course API (/api/index.json, assessments/*.meta.due) on 2026-09-28.
INSERT INTO `assessments` (`course`, `title`, `due_at`) VALUES
  ('COMP4020', 'Assignment 1', '2026-08-17T12:00:00+10:00'),
  ('COMP4020', 'Assignment 2', '2026-09-21T12:00:00+10:00'),
  ('COMP4020', 'Final Project (Assignment 3)', '2026-11-09T12:00:00+11:00');
--> statement-breakpoint
-- The single demo student's profile, with the message they used to retype
-- on every request.
INSERT INTO `profile` (`id`, `name`, `uid`, `default_days`, `default_message`) VALUES
  (1, '', '', 5, 'I am requesting a 5 working day extension in line with the adjustments in my EAP, to allow me to complete the assignment to a reasonable standard.');
