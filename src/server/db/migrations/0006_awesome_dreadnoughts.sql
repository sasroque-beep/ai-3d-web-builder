CREATE TABLE `company_site_page_section_copies` (
	`id` text PRIMARY KEY NOT NULL,
	`section_id` text NOT NULL,
	`headline` text,
	`subheadline` text,
	`body` text,
	`cta_label` text,
	`social_proof_text` text,
	`notes` text,
	`generated_by` text DEFAULT 'manual' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`section_id`) REFERENCES `company_site_page_sections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `company_site_page_section_copies_section_id_idx` ON `company_site_page_section_copies` (`section_id`);