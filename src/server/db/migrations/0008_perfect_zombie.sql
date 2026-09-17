CREATE TABLE `company_site_page_section_experiences` (
	`id` text PRIMARY KEY NOT NULL,
	`section_id` text NOT NULL,
	`preset_key` text NOT NULL,
	`config` text NOT NULL,
	`fallback_2d_image_url` text NOT NULL,
	`fallback_2d_image_alt` text NOT NULL,
	`generated_by` text DEFAULT 'manual' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`section_id`) REFERENCES `company_site_page_sections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `company_site_page_section_experiences_section_id_idx` ON `company_site_page_section_experiences` (`section_id`);