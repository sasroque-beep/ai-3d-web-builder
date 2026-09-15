CREATE TABLE `company_site_page_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`page_id` text NOT NULL,
	`section_key` text NOT NULL,
	`name` text NOT NULL,
	`objective` text,
	`cta_reference` text,
	`position` integer NOT NULL,
	`generated_by` text DEFAULT 'manual' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`page_id`) REFERENCES `company_site_pages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `company_site_page_sections_page_id_section_key_idx` ON `company_site_page_sections` (`page_id`,`section_key`);--> statement-breakpoint
CREATE TABLE `company_site_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`objective` text,
	`journey_stage` text,
	`position` integer NOT NULL,
	`generated_by` text DEFAULT 'manual' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `company_site_pages_company_id_slug_idx` ON `company_site_pages` (`company_id`,`slug`);