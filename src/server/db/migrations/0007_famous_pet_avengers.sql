CREATE TABLE `company_site_themes` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`primary_color` text,
	`secondary_color` text,
	`accent_color` text,
	`background_color` text,
	`heading_font` text,
	`body_font` text,
	`visual_style` text,
	`color_mode_preference` text,
	`spacing_density` text,
	`cta_visual_guidelines` text,
	`visual_references` text,
	`accessibility_requirements` text,
	`notes` text,
	`generated_by` text DEFAULT 'manual' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `company_site_themes_company_id_idx` ON `company_site_themes` (`company_id`);