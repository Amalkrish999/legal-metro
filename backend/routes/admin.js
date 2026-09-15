const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

router.get('/overview', async (req, res) => {
  try {
    const db = await getDb();
    const scope = req.query.scope || 'All India';
    
    const states = await db.all('SELECT * FROM states');
    let totalScans = 0;
    let totalViolations = 0;
    
    states.forEach(s => {
      totalScans += s.scansDone;
      totalViolations += s.violationsFound;
    });

    const activeRegs = await db.get('SELECT COUNT(*) as count FROM registrations WHERE status = "Active"');

    res.json({
      totalScans: totalScans + 45000, // mock scale
      violations: totalViolations + 7500,
      complianceRate: Math.round(((totalScans - totalViolations) / totalScans) * 100),
      activeRegistrations: activeRegs.count + 2300,
      stateData: states
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/states', async (req, res) => {
  try {
    const db = await getDb();
    const states = await db.all('SELECT * FROM states ORDER BY complianceRate DESC');
    res.json(states);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/ecommerce', async (req, res) => {
  try {
    const db = await getDb();
    const ecom = await db.all('SELECT * FROM ecommerce_violations');
    res.json(ecom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/circulars', async (req, res) => {
  try {
    const db = await getDb();
    const circs = await db.all('SELECT * FROM circulars ORDER BY date DESC');
    res.json(circs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/registrations', async (req, res) => {
  try {
    const db = await getDb();
    // Prioritize Importers
    const regs = await db.all('SELECT * FROM registrations ORDER BY type = "Importer" DESC, id DESC');
    res.json(regs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
