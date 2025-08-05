"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const router = express_1.default.Router();
// Get dashboard overview data
router.get('/overview', auth_1.authenticateToken, async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        // Get audit statistics
        const auditStats = await (0, database_1.default)('audit_engagements')
            .select('status')
            .count('* as count')
            .whereRaw('CAST(substr(created_at, 1, 4) AS INTEGER) = ?', [currentYear])
            .groupBy('status');
        // Get risk assessments
        const riskStats = await (0, database_1.default)('risk_assessments')
            .select('risk_level')
            .count('* as count')
            .groupBy('risk_level');
        // Get findings by severity
        const findingStats = await (0, database_1.default)('audit_findings')
            .select('severity', 'status')
            .count('* as count')
            .groupBy('severity', 'status');
        // Get recent activities (last 10 engagements)
        const recentEngagements = await (0, database_1.default)('audit_engagements')
            .select('audit_engagements.id', 'audit_engagements.title', 'audit_engagements.engagement_number', 'audit_engagements.status', 'audit_engagements.planned_start_date', 'audit_engagements.planned_end_date', 'users.first_name', 'users.last_name')
            .leftJoin('users', 'audit_engagements.lead_auditor', 'users.id')
            .orderBy('audit_engagements.created_at', 'desc')
            .limit(10);
        // Get overdue actions
        const overdueActions = await (0, database_1.default)('action_plans')
            .select('action_plans.id', 'action_plans.action_description', 'action_plans.target_completion_date', 'audit_findings.title as finding_title', 'audit_engagements.title as engagement_title')
            .join('audit_findings', 'action_plans.finding_id', 'audit_findings.id')
            .join('audit_engagements', 'audit_findings.engagement_id', 'audit_engagements.id')
            .where('action_plans.status', '!=', 'completed')
            .where('action_plans.target_completion_date', '<', new Date())
            .orderBy('action_plans.target_completion_date', 'asc')
            .limit(5);
        // Calculate completion rates
        const totalEngagements = await (0, database_1.default)('audit_engagements')
            .whereRaw('CAST(substr(created_at, 1, 4) AS INTEGER) = ?', [currentYear])
            .count('* as count')
            .first();
        const completedEngagements = await (0, database_1.default)('audit_engagements')
            .where('status', 'completed')
            .whereRaw('CAST(substr(created_at, 1, 4) AS INTEGER) = ?', [currentYear])
            .count('* as count')
            .first();
        const completionRate = Number(totalEngagements?.count) ?
            (Number(completedEngagements?.count) / Number(totalEngagements?.count)) * 100 : 0;
        res.json({
            audit_statistics: auditStats,
            risk_statistics: riskStats,
            finding_statistics: findingStats,
            recent_engagements: recentEngagements,
            overdue_actions: overdueActions,
            metrics: {
                total_engagements: Number(totalEngagements?.count) || 0,
                completed_engagements: Number(completedEngagements?.count) || 0,
                completion_rate: Math.round(completionRate),
                year: currentYear
            }
        });
    }
    catch (error) {
        console.error('Dashboard overview error:', error);
        res.status(500).json({ message: 'Error fetching dashboard data' });
    }
});
// Get user-specific dashboard data
router.get('/my-tasks', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        // Get engagements where user is lead auditor
        const myEngagements = await (0, database_1.default)('audit_engagements')
            .select('id', 'title', 'engagement_number', 'status', 'planned_start_date', 'planned_end_date')
            .where('lead_auditor', userId)
            .where('status', '!=', 'completed')
            .orderBy('planned_start_date', 'asc');
        // Get action plans assigned to user
        const myActionPlans = await (0, database_1.default)('action_plans')
            .select('action_plans.id', 'action_plans.action_description', 'action_plans.target_completion_date', 'action_plans.status', 'audit_findings.title as finding_title', 'audit_engagements.title as engagement_title')
            .join('audit_findings', 'action_plans.finding_id', 'audit_findings.id')
            .join('audit_engagements', 'audit_findings.engagement_id', 'audit_engagements.id')
            .where('action_plans.responsible_person', userId)
            .where('action_plans.status', '!=', 'completed')
            .orderBy('action_plans.target_completion_date', 'asc');
        // Get working papers pending review (if user has review permissions)
        const pendingReviews = await (0, database_1.default)('working_papers')
            .select('working_papers.id', 'working_papers.title', 'working_papers.wp_reference', 'working_papers.created_at', 'audit_engagements.title as engagement_title', 'users.first_name', 'users.last_name')
            .join('audit_engagements', 'working_papers.engagement_id', 'audit_engagements.id')
            .join('users', 'working_papers.created_by', 'users.id')
            .where('working_papers.review_status', 'under_review')
            .where('working_papers.reviewed_by', userId);
        res.json({
            my_engagements: myEngagements,
            my_action_plans: myActionPlans,
            pending_reviews: pendingReviews
        });
    }
    catch (error) {
        console.error('My tasks error:', error);
        res.status(500).json({ message: 'Error fetching user tasks' });
    }
});
exports.default = router;
