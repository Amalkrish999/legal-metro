const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

// Helper to construct scope query based on rank and scope
const getScopeQuery = (scope, role) => {
  if (role === 'Controller') {
    return { condition: "status = 'escalated_to_controller'", params: [] };
  }
  if (role === 'Additional Controller') {
    return { condition: "zone = ? AND status = 'escalated_to_additional'", params: [scope] };
  }
  if (role === 'Deputy Controller') {
    return { condition: "district = ? AND status = 'escalated_to_deputy'", params: [scope] };
  }
  if (role === 'Assistant Controller') {
    return { condition: "district = ? AND status = 'pending_review'", params: [scope] };
  }
  
  // Fallback
  return { condition: '1=1', params: [] };
};

// GET /overview
router.get('/overview', async (req, res) => {
  try {
    const db = await getDb();
    const { scope, role } = req.query;
    const { condition, params } = getScopeQuery(scope, role);
    
    // Overview can use the specific scope condition, but maybe we want to show all in scope for total count
    // The prompt says "queue queries filter by district/zone AND status".
    // For general total metrics in overview, we'll just show everything matching the base scope constraint if we want,
    // but we can just use the strict condition. Actually, let's keep the condition strict for pending, but relaxed for totals if needed.
    // For simplicity, we just use the condition for pending, and for totals we strip the status part.
    const baseCondition = condition.split(' AND status')[0] || '1=1';

    const scansCount = await db.get(`SELECT COUNT(*) as count FROM scans WHERE ${baseCondition}`, ...params);
    const pendingCount = await db.get(`SELECT COUNT(*) as count FROM scans WHERE ${condition}`, ...params);
    const violCount = await db.get(`SELECT COUNT(*) as count FROM scans WHERE (verdict = 'Non-compliant' OR status = 'Violation') AND ${baseCondition}`, ...params);
    
    // For active inspectors, just return all active for now or filtered by scope
    const inspectorsCount = await db.get(`SELECT COUNT(*) as count FROM inspectors WHERE status = 'Active'`);

    // Fetch last 5 recent submissions in scope
    const recentScans = await db.all(`SELECT * FROM scans WHERE ${baseCondition} ORDER BY timestamp DESC LIMIT 5`, ...params);
    
    // Parse violations and audit log for recent scans
    const parsedRecent = recentScans.map(s => ({
      ...s,
      violations: s.violations ? JSON.parse(s.violations) : [],
      auditLog: s.auditLog ? JSON.parse(s.auditLog) : []
    }));

    const total = scansCount.count || 0;
    const violations = violCount.count || 0;
    const complianceRate = total === 0 ? 100 : Math.round(((total - violations) / total) * 100);

    res.json({
      totalScans: total,
      pendingReviews: pendingCount.count || 0,
      violations,
      complianceRate,
      activeInspectors: inspectorsCount.count || 0,
      recentSubmissions: parsedRecent
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /pending-reviews
router.get('/pending-reviews', async (req, res) => {
  try {
    const db = await getDb();
    const { scope, role } = req.query;
    const { condition, params } = getScopeQuery(scope, role);

    const scans = await db.all(`
      SELECT * FROM scans 
      WHERE ${condition} 
      ORDER BY timestamp DESC
    `, ...params);
    
    const parsedScans = scans.map(s => ({
      ...s,
      violations: s.violations ? JSON.parse(s.violations) : [],
      auditLog: s.auditLog ? JSON.parse(s.auditLog) : [],
      ruleResults: s.ruleResults ? JSON.parse(s.ruleResults) : []
    }));
    res.json(parsedScans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /reviews/:id
router.patch('/reviews/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { action, reason, reviewerId, reviewerName, reviewerRole } = req.body;
    
    const scan = await db.get('SELECT * FROM scans WHERE id = ?', req.params.id);
    if (!scan) return res.status(404).json({ error: 'Not found' });

    let newStatus = scan.status;
    if (action === 'approve') newStatus = 'approved';
    if (action === 'reject') newStatus = 'rejected';
    if (action === 'return') newStatus = 'returned_for_correction';
    if (action === 'escalate') {
      if (reviewerRole === 'Assistant Controller') newStatus = 'escalated_to_deputy';
      else if (reviewerRole === 'Deputy Controller') newStatus = 'escalated_to_additional';
      else if (reviewerRole === 'Additional Controller') newStatus = 'escalated_to_controller';
    }

    const currentAuditLog = scan.auditLog ? JSON.parse(scan.auditLog) : [];
    const newLogEntry = {
      action,
      actor: reviewerName ? `${reviewerName} (${reviewerId})` : reviewerId,
      timestamp: new Date().toISOString(),
      remarks: reason || ''
    };
    currentAuditLog.push(newLogEntry);

    // Also update verdict if rejected
    let newVerdict = scan.verdict;
    if (action === 'reject') newVerdict = 'Non-compliant';
    else if (action === 'approve' && scan.verdict !== 'Non-compliant') newVerdict = 'Compliant';

    await db.run(
      'UPDATE scans SET status = ?, verdict = ?, auditLog = ? WHERE id = ?', 
      [newStatus, newVerdict, JSON.stringify(currentAuditLog), req.params.id]
    );

    res.json({ message: 'Review processed successfully', status: newStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /inspectors/performance
router.get('/inspectors/performance', async (req, res) => {
  try {
    const db = await getDb();
    const { scope, role } = req.query;
    const { condition, params } = getScopeQuery(scope, role);
    const baseCondition = condition.split(' AND status')[0] || '1=1';

    // Aggregate scans by inspectorId
    const rows = await db.all(`
      SELECT 
        inspectorId,
        COUNT(*) as totalScans,
        SUM(CASE WHEN status IN ('pending_review', 'escalated_to_deputy', 'escalated_to_additional', 'escalated_to_controller') THEN 1 ELSE 0 END) as pendingReviews,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedCount,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejectedCount
      FROM scans
      WHERE ${baseCondition}
      GROUP BY inspectorId
    `, ...params);

    // In a real app we'd join with the inspectors table to get names.
    // For now we'll just mock it or parse the inspectorId.
    const performance = rows.map(r => ({
      inspectorId: r.inspectorId,
      name: `Officer ${r.inspectorId}`, // Placeholder name
      totalScans: r.totalScans,
      pendingReviews: r.pendingReviews,
      approvedCount: r.approvedCount,
      rejectedCount: r.rejectedCount,
      avgTurnaround: '2.5 hrs' // Mock turnaround time
    }));

    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /districts/summary
router.get('/districts/summary', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(`
      SELECT 
        district,
        COUNT(*) as totalScans,
        SUM(CASE WHEN verdict = 'Non-compliant' OR status = 'Violation' THEN 1 ELSE 0 END) as violations
      FROM scans
      GROUP BY district
      HAVING district IS NOT NULL AND district != ''
    `);

    const summary = rows.map(r => ({
      district: r.district,
      totalScans: r.totalScans,
      complianceRate: r.totalScans === 0 ? 100 : Math.round(((r.totalScans - r.violations) / r.totalScans) * 100)
    }));

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
