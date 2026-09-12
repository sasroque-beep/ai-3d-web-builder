CREATE TABLE `company_enrichment_fields` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`field_key` text NOT NULL,
	`value` text,
	`source` text,
	`status` text NOT NULL,
	`collected_at` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `company_enrichment_fields_company_id_field_key_idx` ON `company_enrichment_fields` (`company_id`,`field_key`);