"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const router = express_1.default.Router();
// Get all risk assessments
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { risk_level, area } = req.query;
        let query = (0, database_1.default)('risk_assessments')
            .select('risk_assessments.*', 'users.first_name as assessor_first_name', 'users.last_name as assessor_last_name')
            .leftJoin('users', 'risk_assessments.assessed_by', 'users.id');
        if (risk_level) {
            query = query.where('risk_assessments.risk_level', risk_level);
        }
        if (area) {
            query = query.where('risk_assessments.area_assessed', 'like', `%${area}%`);
        }
        const risks = await query.orderBy('risk_assessments.inherent_risk_score', 'desc');
        res.json(risks);
    }
    catch (error) {
        console.error('Get risk assessments error:', error);
        res.status(500).json({ message: 'Error fetching risk assessments' });
    }
});
// Create new risk assessment
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('director', 'senior_auditor', 'auditor'), async (req, res) => {
    try {
        const { title, description, area_assessed, inherent_risk_score, residual_risk_score, risk_factors, controls_identified, assessment_date, next_review_date } = req.body;
        const userId = req.user.id;
        // Determine risk level based on residual risk score
        let risk_level;
        if (residual_risk_score >= 8)
            risk_level = 'critical';
        else if (residual_risk_score >= 6)
            risk_level = 'high';
        else if (residual_risk_score >= 4)
            risk_level = 'medium';
        else
            risk_level = 'low';
        const [riskId] = await (0, database_1.default)('risk_assessments').insert({
            title,
            description,
            area_assessed,
            inherent_risk_score,
            residual_risk_score,
            risk_level,
            risk_factors,
            controls_identified,
            assessed_by: userId,
            assessment_date,
            next_review_date
        });
        res.status(201).json({ id: riskId, message: 'Risk assessment created successfully' });
    }
    catch (error) {
        console.error('Create risk assessment error:', error);
        res.status(500).json({ message: 'Error creating risk assessment' });
    }
});
// Get risk heat map data
router.get('/heatmap', auth_1.authenticateToken, async (req, res) => {
    try {
        const riskData = await (0, database_1.default)('risk_assessments')
            .select('area_assessed', 'inherent_risk_score', 'residual_risk_score', 'risk_level')
            .where('assessment_date', '>=', database_1.default.raw('date("now", "-1 year")'))
            .orderBy('residual_risk_score', 'desc');
        // Group by risk level for summary
        const riskSummary = await (0, database_1.default)('risk_assessments')
            .select('risk_level')
            .count('* as count')
            .groupBy('risk_level');
        res.json({
            heat_map_data: riskData,
            risk_summary: riskSummary
        });
    }
    catch (error) {
        console.error('Get risk heatmap error:', error);
        res.status(500).json({ message: 'Error fetching risk heatmap data' });
    }
});
// Update risk assessment
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('director', 'senior_auditor', 'auditor'), async (req, res) => {
    try {
        const riskId = req.params.id;
        const { title, description, area_assessed, inherent_risk_score, residual_risk_score, risk_factors, controls_identified, next_review_date } = req.body;
        // Determine risk level based on residual risk score
        let risk_level;
        if (residual_risk_score >= 8)
            risk_level = 'critical';
        else if (residual_risk_score >= 6)
            risk_level = 'high';
        else if (residual_risk_score >= 4)
            risk_level = 'medium';
        else
            risk_level = 'low';
        await (0, database_1.default)('risk_assessments')
            .where('id', riskId)
            .update({
            title,
            description,
            area_assessed,
            inherent_risk_score,
            residual_risk_score,
            risk_level,
            risk_factors,
            controls_identified,
            next_review_date,
            updated_at: new Date()
        });
        res.json({ message: 'Risk assessment updated successfully' });
    }
    catch (error) {
        console.error('Update risk assessment error:', error);
        res.status(500).json({ message: 'Error updating risk assessment' });
    }
});
// Get specific risk assessment
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const riskId = req.params.id;
        const risk = await (0, database_1.default)('risk_assessments')
            .select('risk_assessments.*', 'users.first_name as assessor_first_name', 'users.last_name as assessor_last_name')
            .leftJoin('users', 'risk_assessments.assessed_by', 'users.id')
            .where('risk_assessments.id', riskId)
            .first();
        if (!risk) {
            return res.status(404).json({ message: 'Risk assessment not found' });
        }
        res.json(risk);
    }
    catch (error) {
        console.error('Get risk assessment error:', error);
        res.status(500).json({ message: 'Error fetching risk assessment' });
    }
});
exports.default = router;
