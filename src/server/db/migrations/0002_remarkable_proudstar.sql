CREATE TABLE `company_diagnostics` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`summary` text,
	`niche` text,
	`value_proposition` text,
	`differentiators` text,
	`strengths` text,
	`weaknesses` text,
	`opportunities` text,
	`risks_or_gaps` text,
	`marketing_opportunities` text,
	`conversion_opportunities` text,
	`digital_maturity` text,
	`recommendations` text,
	`generated_by` text DEFAULT 'manual' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `company_diagnostics_company_id_idx` ON `company_diagnostics` (`company_id`);