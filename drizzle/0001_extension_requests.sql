CREATE TABLE `assessments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`course` text NOT NULL,
	`title` text NOT NULL,
	`due_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`uid` text DEFAULT '' NOT NULL,
	`eap_file_name` text,
	`eap_file_type` text,
	`eap_file` blob,
	`default_days` integer DEFAULT 5 NOT NULL,
	`default_message` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`assessment_id` integer NOT NULL,
	`days` integer NOT NULL,
	`original_due` text NOT NULL,
	`requested_due` text NOT NULL,
	`message` text NOT NULL,
	`eap_file_name` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON UPDATE no action ON DELETE no action
);
