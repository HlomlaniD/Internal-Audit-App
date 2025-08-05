import express from 'express';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

// Get all audit plans
router.get('/plans', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { year, status } = req.query;
    
    let query = db('audit_plans')
      .select(
        'audit_plans.*',
        'creator.first_name as creator_first_name',
        'creator.last_name as creator_last_name',
        'approver.first_name as approver_first_name',
        'approver.last_name as approver_last_name'
      )
      .leftJoin('users as creator', 'audit_plans.created_by', 'creator.id')
      .leftJoin('users as approver', 'audit_plans.approved_by', 'approver.id');

    if (year) {
      query = query.where('audit_plans.year', year);
    }
    if (status) {
      query = query.where('audit_plans.status', status);
    }

    const plans = await query.orderBy('audit_plans.year', 'desc');
    res.json(plans);
  } catch (error) {
    console.error('Get audit plans error:', error);
    res.status(500).json({ message: 'Error fetching audit plans' });
  }
});

// Create new audit plan
router.post('/plans', authenticateToken, authorizeRoles('director', 'senior_auditor'), async (req: AuthenticatedRequest, res) => {
  try {
    const { title, description, year } = req.body;
    const userId = req.user!.id;

    const [planId] = await db('audit_plans').insert({
      title,
      description,
      year,
      created_by: userId,
      status: 'draft'
    });

    res.status(201).json({ id: planId, message: 'Audit plan created successfully' });
  } catch (error) {
    console.error('Create audit plan error:', error);
    res.status(500).json({ message: 'Error creating audit plan' });
  }
});

// Get all audit engagements
router.get('/engagements', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { status, year, plan_id } = req.query;
    
    let query = db('audit_engagements')
      .select(
        'audit_engagements.*',
        'lead.first_name as lead_first_name',
        'lead.last_name as lead_last_name',
        'audit_plans.title as plan_title',
        'risk_assessments.risk_level'
      )
      .leftJoin('users as lead', 'audit_engagements.lead_auditor', 'lead.id')
      .leftJoin('audit_plans', 'audit_engagements.audit_plan_id', 'audit_plans.id')
      .leftJoin('risk_assessments', 'audit_engagements.risk_assessment_id', 'risk_assessments.id');

    if (status) {
      query = query.where('audit_engagements.status', status);
    }
    if (year) {
      query = query.whereRaw('CAST(substr(audit_engagements.created_at, 1, 4) AS INTEGER) = ?', [year]);
    }
    if (plan_id) {
      query = query.where('audit_engagements.audit_plan_id', plan_id);
    }

    const engagements = await query.orderBy('audit_engagements.created_at', 'desc');
    res.json(engagements);
  } catch (error) {
    console.error('Get engagements error:', error);
    res.status(500).json({ message: 'Error fetching audit engagements' });
  }
});

// Create new audit engagement
router.post('/engagements', authenticateToken, authorizeRoles('director', 'senior_auditor'), async (req: AuthenticatedRequest, res) => {
  try {
    const {
      title,
      objective,
      scope,
      audit_plan_id,
      risk_assessment_id,
      lead_auditor,
      planned_start_date,
      planned_end_date,
      budgeted_hours
    } = req.body;

    // Generate engagement number (format: YYYY-NNN)
    const year = new Date().getFullYear();
    const countResult = await db('audit_engagements')
      .whereRaw('CAST(substr(created_at, 1, 4) AS INTEGER) = ?', [year])
      .count('* as count')
      .first();
    
    const sequence = (Number(countResult?.count) || 0) + 1;
    const engagement_number = `${year}-${sequence.toString().padStart(3, '0')}`;

    const [engagementId] = await db('audit_engagements').insert({
      engagement_number,
      title,
      objective,
      scope,
      audit_plan_id,
      risk_assessment_id,
      lead_auditor,
      planned_start_date,
      planned_end_date,
      budgeted_hours,
      status: 'planning'
    });

    res.status(201).json({ 
      id: engagementId, 
      engagement_number,
      message: 'Audit engagement created successfully' 
    });
  } catch (error) {
    console.error('Create engagement error:', error);
    res.status(500).json({ message: 'Error creating audit engagement' });
  }
});

// Get working papers for an engagement
router.get('/engagements/:id/working-papers', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const engagementId = req.params.id;

    const workingPapers = await db('working_papers')
      .select(
        'working_papers.*',
        'creator.first_name as creator_first_name',
        'creator.last_name as creator_last_name',
        'reviewer.first_name as reviewer_first_name',
        'reviewer.last_name as reviewer_last_name'
      )
      .leftJoin('users as creator', 'working_papers.created_by', 'creator.id')
      .leftJoin('users as reviewer', 'working_papers.reviewed_by', 'reviewer.id')
      .where('working_papers.engagement_id', engagementId)
      .orderBy('working_papers.wp_reference');

    res.json(workingPapers);
  } catch (error) {
    console.error('Get working papers error:', error);
    res.status(500).json({ message: 'Error fetching working papers' });
  }
});

// Create working paper
router.post('/engagements/:id/working-papers', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const engagementId = req.params.id;
    const { title, description, wp_reference } = req.body;
    const userId = req.user!.id;

    const [wpId] = await db('working_papers').insert({
      engagement_id: engagementId,
      title,
      description,
      wp_reference,
      created_by: userId,
      review_status: 'draft'
    });

    res.status(201).json({ id: wpId, message: 'Working paper created successfully' });
  } catch (error) {
    console.error('Create working paper error:', error);
    res.status(500).json({ message: 'Error creating working paper' });
  }
});

// Get findings for an engagement
router.get('/engagements/:id/findings', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const engagementId = req.params.id;

    const findings = await db('audit_findings')
      .select(
        'audit_findings.*',
        'assigned.first_name as assigned_first_name',
        'assigned.last_name as assigned_last_name'
      )
      .leftJoin('users as assigned', 'audit_findings.assigned_to', 'assigned.id')
      .where('audit_findings.engagement_id', engagementId)
      .orderBy('audit_findings.finding_number');

    res.json(findings);
  } catch (error) {
    console.error('Get findings error:', error);
    res.status(500).json({ message: 'Error fetching audit findings' });
  }
});

// Create audit finding
router.post('/engagements/:id/findings', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const engagementId = req.params.id;
    const {
      title,
      condition,
      criteria,
      cause,
      effect,
      recommendation,
      severity,
      assigned_to,
      target_date
    } = req.body;

    // Generate finding number
    const countResult = await db('audit_findings')
      .where('engagement_id', engagementId)
      .count('* as count')
      .first();
    
    const sequence = (Number(countResult?.count) || 0) + 1;
    const finding_number = `F${sequence.toString().padStart(2, '0')}`;

    const [findingId] = await db('audit_findings').insert({
      engagement_id: engagementId,
      finding_number,
      title,
      condition,
      criteria,
      cause,
      effect,
      recommendation,
      severity,
      assigned_to,
      target_date,
      status: 'open'
    });

    res.status(201).json({ 
      id: findingId, 
      finding_number,
      message: 'Audit finding created successfully' 
    });
  } catch (error) {
    console.error('Create finding error:', error);
    res.status(500).json({ message: 'Error creating audit finding' });
  }
});

export default router;