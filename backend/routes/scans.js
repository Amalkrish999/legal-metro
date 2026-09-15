const express = require('express');
const multer = require('multer');
const path = require('path');
const { getDb } = require('../db');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const scans = await db.all('SELECT * FROM scans ORDER BY timestamp DESC');
    const parsedScans = scans.map(s => ({
      ...s,
      violations: s.violations ? JSON.parse(s.violations) : []
    }));
    res.json(parsedScans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const db = await getDb();
    const data = req.body;
    const images = req.files ? req.files.map(f => `http://localhost:3001/uploads/${f.filename}`) : [];
    const imageUrl = images.length > 0 ? images[0] : (data.imageUrl || '');

    const districtToZone = {
      'Coimbatore': 'Coimbatore Zone',
      'Tiruppur': 'Coimbatore Zone',
      'Erode': 'Coimbatore Zone',
      'Nilgiris': 'Coimbatore Zone',
      'South Delhi': 'Delhi Zone'
    };
    const zone = districtToZone[data.district] || (data.district ? data.district + ' Zone' : 'Unknown Zone');

    const { lastID } = await db.run(`
      INSERT INTO scans (
        productName, location, timestamp, status, imageUrl, 
        manufacturer, netQuantity, mrp, mfgDate, bbDate, 
        customerCare, countryOfOrigin, verdict, violations, inspectorId, district, zone,
        quantityVerified, measuredQuantity, quantityPassed, observations, ruleResults, auditLog
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.productName || 'Unknown Product',
      data.location || 'Unknown Location',
      data.timestamp || new Date().toISOString(),
      data.status || 'Pending',
      imageUrl,
      data.manufacturer || '',
      data.netQuantity || '',
      data.mrp || '',
      data.mfgDate || '',
      data.bbDate || '',
      data.customerCare || '',
      data.countryOfOrigin || '',
      data.verdict || 'Compliant',
      data.violations || '[]',
      data.inspectorId || 'LMO-DL-104',
      data.district || 'South Delhi',
      zone,
      data.quantityVerified === 'true' || data.quantityVerified === true ? 1 : 0,
      data.measuredQuantity || '',
      data.quantityPassed === 'true' || data.quantityPassed === true ? 1 : 0,
      data.observations || '',
      data.ruleResults || '[]',
      JSON.stringify([{
        action: 'submitted',
        actor: data.inspectorId || 'LMO-DL-104',
        timestamp: new Date().toISOString(),
        remarks: 'Report submitted for review.'
      }])
    ]);

    const responseData = {
      success: true,
      id: lastID,
      productName: data.productName || 'Unknown Product',
      location: data.location || 'Unknown Location',
      timestamp: data.timestamp || new Date().toISOString(),
      status: data.status || 'Pending',
      imageUrl,
      manufacturer: data.manufacturer || '',
      netQuantity: data.netQuantity || '',
      mrp: data.mrp || '',
      mfgDate: data.mfgDate || '',
      bbDate: data.bbDate || '',
      customerCare: data.customerCare || '',
      countryOfOrigin: data.countryOfOrigin || '',
      verdict: data.verdict || 'Compliant',
      violations: data.violations || '[]',
      inspectorId: data.inspectorId || 'LMO-DL-104',
      district: data.district || 'South Delhi',
      zone,
      quantityVerified: data.quantityVerified === 'true' || data.quantityVerified === true ? 1 : 0,
      measuredQuantity: data.measuredQuantity || '',
      quantityPassed: data.quantityPassed === 'true' || data.quantityPassed === true ? 1 : 0,
      observations: data.observations || '',
      ruleResults: data.ruleResults || '[]',
      auditLog: JSON.stringify([{ action: 'submitted', actor: data.inspectorId || 'LMO-DL-104', timestamp: new Date().toISOString(), remarks: 'Report submitted for review.' }]),
      message: 'Scan saved successfully'
    };

    console.log('Scan saved, returning:', JSON.stringify({ id: lastID, message: 'Scan saved successfully', rawResult: { lastID } }));
    res.status(201).json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const scan = await db.get('SELECT * FROM scans WHERE id = ?', req.params.id);
    if (!scan) return res.status(404).json({ error: 'Not found' });
    
    scan.violations = scan.violations ? JSON.parse(scan.violations) : [];
    res.json(scan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/status', async (req, res) => {
    try {
        const db = await getDb();
        const { status } = req.body;
        
        const scan = await db.get('SELECT auditLog FROM scans WHERE id = ?', req.params.id);
        let auditLog = scan && scan.auditLog ? JSON.parse(scan.auditLog) : [];
        
        if (status === 'pending_review' || status === 'Pending') {
            auditLog.push({
                action: 'resubmitted',
                actor: req.user ? req.user.name || req.user.officerId : 'Inspector',
                timestamp: new Date().toISOString(),
                remarks: 'Report resubmitted for review.'
            });
        }
        
        await db.run('UPDATE scans SET status = ?, auditLog = ? WHERE id = ?', [status, JSON.stringify(auditLog), req.params.id]);
        res.json({ message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
