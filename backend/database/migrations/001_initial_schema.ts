import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Users table
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.enum('role', ['director', 'senior_auditor', 'auditor', 'management', 'board']).notNullable();
    table.enum('status', ['active', 'inactive', 'suspended']).defaultTo('active');
    table.string('phone');
    table.string('department');
    table.json('certifications'); // Store array of certifications (CPA, CIA, CISA, etc.)
    table.timestamp('last_login');
    table.timestamps(true, true);
  });

  // Audit Plans table
  await knex.schema.createTable('audit_plans', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('description');
    table.integer('year').notNullable();
    table.enum('status', ['draft', 'approved', 'in_progress', 'completed']).defaultTo('draft');
    table.integer('created_by').unsigned().references('id').inTable('users');
    table.integer('approved_by').unsigned().references('id').inTable('users');
    table.timestamp('approved_date');
    table.timestamps(true, true);
  });

  // Risk Assessments table
  await knex.schema.createTable('risk_assessments', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('description');
    table.string('area_assessed').notNullable();
    table.integer('inherent_risk_score').checkBetween([1, 10]);
    table.integer('residual_risk_score').checkBetween([1, 10]);
    table.enum('risk_level', ['low', 'medium', 'high', 'critical']);
    table.text('risk_factors');
    table.text('controls_identified');
    table.integer('assessed_by').unsigned().references('id').inTable('users');
    table.date('assessment_date');
    table.date('next_review_date');
    table.timestamps(true, true);
  });

  // Audit Engagements table
  await knex.schema.createTable('audit_engagements', (table) => {
    table.increments('id').primary();
    table.string('engagement_number').unique().notNullable();
    table.string('title').notNullable();
    table.text('objective');
    table.text('scope');
    table.integer('audit_plan_id').unsigned().references('id').inTable('audit_plans');
    table.integer('risk_assessment_id').unsigned().references('id').inTable('risk_assessments');
    table.integer('lead_auditor').unsigned().references('id').inTable('users');
    table.enum('status', ['planning', 'fieldwork', 'reporting', 'completed', 'cancelled']).defaultTo('planning');
    table.date('planned_start_date');
    table.date('planned_end_date');
    table.date('actual_start_date');
    table.date('actual_end_date');
    table.integer('budgeted_hours');
    table.integer('actual_hours');
    table.timestamps(true, true);
  });

  // Working Papers table
  await knex.schema.createTable('working_papers', (table) => {
    table.increments('id').primary();
    table.string('wp_reference').notNullable(); // WP1, WP2, etc.
    table.integer('engagement_id').unsigned().references('id').inTable('audit_engagements');
    table.string('title').notNullable();
    table.text('description');
    table.string('file_path');
    table.string('file_type');
    table.integer('file_size');
    table.integer('created_by').unsigned().references('id').inTable('users');
    table.integer('reviewed_by').unsigned().references('id').inTable('users');
    table.timestamp('reviewed_date');
    table.enum('review_status', ['draft', 'under_review', 'approved', 'needs_revision']).defaultTo('draft');
    table.text('review_comments');
    table.timestamps(true, true);
  });

  // Audit Findings table
  await knex.schema.createTable('audit_findings', (table) => {
    table.increments('id').primary();
    table.string('finding_number').notNullable();
    table.integer('engagement_id').unsigned().references('id').inTable('audit_engagements');
    table.string('title').notNullable();
    table.text('condition'); // What we found
    table.text('criteria'); // What should be
    table.text('cause'); // Why it happened
    table.text('effect'); // Impact/consequence
    table.text('recommendation');
    table.enum('severity', ['low', 'medium', 'high', 'critical']);
    table.enum('status', ['open', 'in_progress', 'resolved', 'closed']).defaultTo('open');
    table.integer('assigned_to').unsigned().references('id').inTable('users');
    table.date('target_date');
    table.date('resolved_date');
    table.text('management_response');
    table.timestamps(true, true);
  });

  // Audit Reports table
  await knex.schema.createTable('audit_reports', (table) => {
    table.increments('id').primary();
    table.integer('engagement_id').unsigned().references('id').inTable('audit_engagements');
    table.string('report_number').unique().notNullable();
    table.string('title').notNullable();
    table.text('executive_summary');
    table.text('background');
    table.text('objectives');
    table.text('scope');
    table.text('methodology');
    table.text('conclusions');
    table.enum('opinion', ['satisfactory', 'needs_improvement', 'unsatisfactory']);
    table.enum('status', ['draft', 'under_review', 'final']).defaultTo('draft');
    table.integer('prepared_by').unsigned().references('id').inTable('users');
    table.integer('reviewed_by').unsigned().references('id').inTable('users');
    table.date('issue_date');
    table.timestamps(true, true);
  });

  // Action Plans table (for tracking corrective actions)
  await knex.schema.createTable('action_plans', (table) => {
    table.increments('id').primary();
    table.integer('finding_id').unsigned().references('id').inTable('audit_findings');
    table.text('action_description').notNullable();
    table.integer('responsible_person').unsigned().references('id').inTable('users');
    table.date('target_completion_date');
    table.date('actual_completion_date');
    table.enum('status', ['pending', 'in_progress', 'completed', 'overdue']).defaultTo('pending');
    table.text('progress_notes');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('action_plans');
  await knex.schema.dropTableIfExists('audit_reports');
  await knex.schema.dropTableIfExists('audit_findings');
  await knex.schema.dropTableIfExists('working_papers');
  await knex.schema.dropTableIfExists('audit_engagements');
  await knex.schema.dropTableIfExists('risk_assessments');
  await knex.schema.dropTableIfExists('audit_plans');
  await knex.schema.dropTableIfExists('users');
}