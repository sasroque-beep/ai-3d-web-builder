import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const companies = sqliteTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  segment: text("segment").notNull(),
  relationshipType: text("relationship_type", {
    enum: ["client", "lead"],
  })
    .notNull()
    .default("lead"),
  origin: text("origin", {
    enum: ["manual", "public_research"],
  })
    .notNull()
    .default("manual"),
  city: text("city"),
  state: text("state"),
  website: text("website"),
  socialMedia: text("social_media"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  description: text("description"),
  mainProducts: text("main_products"),
  targetAudience: text("target_audience"),
  mainGoal: text("main_goal"),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
});

export type CompanyRow = typeof companies.$inferSelect;
export type NewCompanyRow = typeof companies.$inferInsert;

export const ENRICHMENT_FIELD_KEYS = [
  "tradeName",
  "businessHours",
  "apparentAudience",
  "differentiators",
  "additionalInfo",
] as const;

export const companyEnrichmentFields = sqliteTable(
  "company_enrichment_fields",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id),
    fieldKey: text("field_key", { enum: ENRICHMENT_FIELD_KEYS }).notNull(),
    value: text("value"),
    source: text("source"),
    status: text("status", {
      enum: ["confirmed", "unverified", "missing"],
    }).notNull(),
    collectedAt: text("collected_at").notNull(),
    createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
    updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("company_enrichment_fields_company_id_field_key_idx").on(
      table.companyId,
      table.fieldKey,
    ),
  ],
);

export type CompanyEnrichmentFieldRow =
  typeof companyEnrichmentFields.$inferSelect;
export type NewCompanyEnrichmentFieldRow =
  typeof companyEnrichmentFields.$inferInsert;

export const DIGITAL_MATURITY_LEVELS = [
  "none",
  "basic",
  "intermediate",
  "advanced",
] as const;

export const companyDiagnostics = sqliteTable(
  "company_diagnostics",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id),
    summary: text("summary"),
    niche: text("niche"),
    valueProposition: text("value_proposition"),
    differentiators: text("differentiators"),
    strengths: text("strengths"),
    weaknesses: text("weaknesses"),
    opportunities: text("opportunities"),
    risksOrGaps: text("risks_or_gaps"),
    marketingOpportunities: text("marketing_opportunities"),
    conversionOpportunities: text("conversion_opportunities"),
    digitalMaturity: text("digital_maturity", {
      enum: DIGITAL_MATURITY_LEVELS,
    }),
    recommendations: text("recommendations"),
    generatedBy: text("generated_by", { enum: ["manual", "ai"] })
      .notNull()
      .default("manual"),
    createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
    updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("company_diagnostics_company_id_idx").on(table.companyId),
  ],
);

export type CompanyDiagnosticRow = typeof companyDiagnostics.$inferSelect;
export type NewCompanyDiagnosticRow = typeof companyDiagnostics.$inferInsert;

export const companyStrategies = sqliteTable(
  "company_strategies",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id),
    marketingObjective: text("marketing_objective"),
    conversionObjective: text("conversion_objective"),
    targetAudience: text("target_audience"),
    painPoints: text("pain_points"),
    desires: text("desires"),
    valueProposition: text("value_proposition"),
    differentiators: text("differentiators"),
    objections: text("objections"),
    salesArguments: text("sales_arguments"),
    communicationTone: text("communication_tone"),
    mainOffer: text("main_offer"),
    desiredConversionActions: text("desired_conversion_actions"),
    ctas: text("ctas"),
    journeyDiscovery: text("journey_discovery"),
    journeyConsideration: text("journey_consideration"),
    journeyDecision: text("journey_decision"),
    journeyConversion: text("journey_conversion"),
    journeyPostConversion: text("journey_post_conversion"),
    generatedBy: text("generated_by", { enum: ["manual", "ai"] })
      .notNull()
      .default("manual"),
    createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
    updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("company_strategies_company_id_idx").on(table.companyId),
  ],
);

export type CompanyStrategyRow = typeof companyStrategies.$inferSelect;
export type NewCompanyStrategyRow = typeof companyStrategies.$inferInsert;

export const companySitePlans = sqliteTable(
  "company_site_plans",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id),
    mainGoal: text("main_goal"),
    conversionGoal: text("conversion_goal"),
    priorityAudience: text("priority_audience"),
    siteValueProposition: text("site_value_proposition"),
    featuredOffer: text("featured_offer"),
    primaryCta: text("primary_cta"),
    secondaryCtas: text("secondary_ctas"),
    communicationPriorities: text("communication_priorities"),
    objectionsToAddress: text("objections_to_address"),
    socialProofNeeded: text("social_proof_needed"),
    trustElements: text("trust_elements"),
    requiredFeatures: text("required_features"),
    requiredIntegrations: text("required_integrations"),
    leadCaptureRequirements: text("lead_capture_requirements"),
    contactRequirements: text("contact_requirements"),
    conversionRequirements: text("conversion_requirements"),
    contentRequirements: text("content_requirements"),
    visualRequirements: text("visual_requirements"),
    experience3dOpportunities: text("experience_3d_opportunities"),
    journeyStagesToSupport: text("journey_stages_to_support"),
    strategicNotes: text("strategic_notes"),
    generatedBy: text("generated_by", { enum: ["manual", "ai"] })
      .notNull()
      .default("manual"),
    createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
    updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("company_site_plans_company_id_idx").on(table.companyId),
  ],
);

export type CompanySitePlanRow = typeof companySitePlans.$inferSelect;
export type NewCompanySitePlanRow = typeof companySitePlans.$inferInsert;

export const JOURNEY_STAGE_KEYS = [
  "discovery",
  "consideration",
  "decision",
  "conversion",
  "post_conversion",
] as const;

export const companySitePages = sqliteTable(
  "company_site_pages",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    objective: text("objective"),
    journeyStage: text("journey_stage", { enum: JOURNEY_STAGE_KEYS }),
    position: integer("position").notNull(),
    generatedBy: text("generated_by", { enum: ["manual", "ai"] })
      .notNull()
      .default("manual"),
    createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
    updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("company_site_pages_company_id_slug_idx").on(
      table.companyId,
      table.slug,
    ),
  ],
);

export type CompanySitePageRow = typeof companySitePages.$inferSelect;
export type NewCompanySitePageRow = typeof companySitePages.$inferInsert;

export const companySitePageSections = sqliteTable(
  "company_site_page_sections",
  {
    id: text("id").primaryKey(),
    pageId: text("page_id")
      .notNull()
      .references(() => companySitePages.id),
    sectionKey: text("section_key").notNull(),
    name: text("name").notNull(),
    objective: text("objective"),
    ctaReference: text("cta_reference"),
    position: integer("position").notNull(),
    generatedBy: text("generated_by", { enum: ["manual", "ai"] })
      .notNull()
      .default("manual"),
    createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
    updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("company_site_page_sections_page_id_section_key_idx").on(
      table.pageId,
      table.sectionKey,
    ),
  ],
);

export type CompanySitePageSectionRow =
  typeof companySitePageSections.$inferSelect;
export type NewCompanySitePageSectionRow =
  typeof companySitePageSections.$inferInsert;

export const companySitePageSectionCopies = sqliteTable(
  "company_site_page_section_copies",
  {
    id: text("id").primaryKey(),
    sectionId: text("section_id")
      .notNull()
      .references(() => companySitePageSections.id),
    headline: text("headline"),
    subheadline: text("subheadline"),
    body: text("body"),
    ctaLabel: text("cta_label"),
    socialProofText: text("social_proof_text"),
    notes: text("notes"),
    generatedBy: text("generated_by", { enum: ["manual", "ai"] })
      .notNull()
      .default("manual"),
    createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
    updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("company_site_page_section_copies_section_id_idx").on(
      table.sectionId,
    ),
  ],
);

export type CompanySitePageSectionCopyRow =
  typeof companySitePageSectionCopies.$inferSelect;
export type NewCompanySitePageSectionCopyRow =
  typeof companySitePageSectionCopies.$inferInsert;

export const COLOR_MODE_KEYS = ["light", "dark", "both"] as const;

export const SPACING_DENSITY_KEYS = [
  "compact",
  "comfortable",
  "spacious",
] as const;

export const companySiteThemes = sqliteTable(
  "company_site_themes",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id),
    primaryColor: text("primary_color"),
    secondaryColor: text("secondary_color"),
    accentColor: text("accent_color"),
    backgroundColor: text("background_color"),
    headingFont: text("heading_font"),
    bodyFont: text("body_font"),
    visualStyle: text("visual_style"),
    colorModePreference: text("color_mode_preference", {
      enum: COLOR_MODE_KEYS,
    }),
    spacingDensity: text("spacing_density", { enum: SPACING_DENSITY_KEYS }),
    ctaVisualGuidelines: text("cta_visual_guidelines"),
    visualReferences: text("visual_references"),
    accessibilityRequirements: text("accessibility_requirements"),
    notes: text("notes"),
    generatedBy: text("generated_by", { enum: ["manual", "ai"] })
      .notNull()
      .default("manual"),
    createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
    updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("company_site_themes_company_id_idx").on(table.companyId),
  ],
);

export type CompanySiteThemeRow = typeof companySiteThemes.$inferSelect;
export type NewCompanySiteThemeRow = typeof companySiteThemes.$inferInsert;
