CREATE TABLE `company_strategies` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`marketing_objective` text,
	`conversion_objective` text,
	`target_audience` text,
	`pain_points` text,
	`desires` text,
	`value_proposition` text,
	`differentiators` text,
	`objections` text,
	`sales_arguments` text,
	`communication_tone` text,
	`main_offer` text,
	`desired_conversion_actions` text,
	`ctas` text,
	`journey_discovery` text,
	`journey_consideration` text,
	`journey_decision` text,
	`journey_conversion` text,
	`journey_post_conversion` text,
	`generated_by` text DEFAULT 'manual' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `company_strategies_company_id_idx` ON `company_strategies` (`company_id`);