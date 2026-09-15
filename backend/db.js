const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let dbPromise = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: path.join(__dirname, 'database.sqlite'),
      driver: sqlite3.Database
    }).then(async (db) => {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS scans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          productName TEXT,
          location TEXT,
          timestamp TEXT,
          status TEXT,
          imageUrl TEXT,
          manufacturer TEXT,
          netQuantity TEXT,
          mrp TEXT,
          mfgDate TEXT,
          bbDate TEXT,
          customerCare TEXT,
          countryOfOrigin TEXT,
          verdict TEXT,
          violations TEXT,
          inspectorId TEXT,
          district TEXT,
          zone TEXT,
          quantityVerified BOOLEAN,
          measuredQuantity TEXT,
          quantityPassed BOOLEAN,
          observations TEXT,
          ruleResults TEXT,
          auditLog TEXT
        );

        CREATE TABLE IF NOT EXISTS inspectors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          officerId TEXT,
          district TEXT,
          zone TEXT,
          status TEXT,
          scansDone INTEGER,
          violationsFound INTEGER,
          avgResponse TEXT,
          lastActive TEXT
        );

        CREATE TABLE IF NOT EXISTS registrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          companyName TEXT,
          regNo TEXT,
          type TEXT,
          address TEXT,
          district TEXT,
          status TEXT
        );

        CREATE TABLE IF NOT EXISTS enforcements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          companyName TEXT,
          violationType TEXT,
          noticeDate TEXT,
          status TEXT,
          remarks TEXT
        );

        CREATE TABLE IF NOT EXISTS states (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          controllerName TEXT,
          scansDone INTEGER,
          violationsFound INTEGER,
          complianceRate INTEGER,
          lastUpdated TEXT
        );

        CREATE TABLE IF NOT EXISTS ecommerce_violations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          platform TEXT,
          product TEXT,
          seller TEXT,
          violationType TEXT,
          status TEXT,
          isCrossState BOOLEAN
        );

        CREATE TABLE IF NOT EXISTS circulars (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          date TEXT,
          applicableStates TEXT
        );
      `);
      
      // Migrate existing DB: add new columns if missing
      const cols = await db.all("PRAGMA table_info(scans)");
      const colNames = cols.map((c) => c.name);
      if (!colNames.includes('quantityVerified'))  await db.run('ALTER TABLE scans ADD COLUMN quantityVerified BOOLEAN');
      if (!colNames.includes('measuredQuantity'))  await db.run('ALTER TABLE scans ADD COLUMN measuredQuantity TEXT');
      if (!colNames.includes('quantityPassed'))    await db.run('ALTER TABLE scans ADD COLUMN quantityPassed BOOLEAN');
      if (!colNames.includes('observations'))      await db.run('ALTER TABLE scans ADD COLUMN observations TEXT');
      if (!colNames.includes('ruleResults'))       await db.run('ALTER TABLE scans ADD COLUMN ruleResults TEXT');
      if (!colNames.includes('inspectorId'))       await db.run('ALTER TABLE scans ADD COLUMN inspectorId TEXT');
      if (!colNames.includes('district'))          await db.run('ALTER TABLE scans ADD COLUMN district TEXT');
      if (!colNames.includes('zone'))              await db.run('ALTER TABLE scans ADD COLUMN zone TEXT');
      if (!colNames.includes('auditLog'))          await db.run('ALTER TABLE scans ADD COLUMN auditLog TEXT');

      // Insert some dummy data if empty
      const count = await db.get('SELECT COUNT(*) as count FROM scans');
      if (count.count === 0) {
        const dummyScans = [
          {
            productName: "Parle-G Gold 1kg",
            location: "Connaught Place, New Delhi",
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            status: "Compliant",
            imageUrl: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500&q=80",
            manufacturer: "Parle Products Pvt. Ltd.",
            netQuantity: "1 kg",
            mrp: "₹ 150.00",
            mfgDate: "10-Aug-2026",
            bbDate: "10-Feb-2027",
            customerCare: "1800-123-456",
            countryOfOrigin: "India",
            verdict: "Compliant",
            violations: "[]",
            quantityVerified: false,
            measuredQuantity: "",
            quantityPassed: true,
            observations: ""
          },
          {
            productName: "Local Brand Honey 500g",
            location: "Karol Bagh Market, New Delhi",
            timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
            status: "Violation",
            imageUrl: "https://images.unsplash.com/photo-1587049352847-8d4e8b4cb7e3?w=500&q=80",
            manufacturer: "Unknown",
            netQuantity: "500 g",
            mrp: "₹ 200.00",
            mfgDate: "Not Printed",
            bbDate: "Not Printed",
            customerCare: "Not Printed",
            countryOfOrigin: "India",
            verdict: "Non-compliant",
            violations: JSON.stringify([
              { rule: "Rule 6(1)(a)", description: "Manufacturer details missing", pass: false },
              { rule: "Rule 6(1)(d)", description: "Month and year of manufacture not printed", pass: false }
            ]),
            quantityVerified: true,
            measuredQuantity: "480 g",
            quantityPassed: false,
            observations: "Product weight is significantly lower than declared."
          },
          {
            productName: "Premium Basmati Rice 5kg",
            location: "Vasant Kunj, New Delhi",
            timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
            status: "Review",
            imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80",
            manufacturer: "Agro Foods Ltd.",
            netQuantity: "5 kg",
            mrp: "₹ 950.00",
            mfgDate: "15-Jul-2026",
            bbDate: "15-Jul-2028",
            customerCare: "customercare@agrofoods.com",
            countryOfOrigin: "India",
            verdict: "Compliant",
            violations: "[]",
            quantityVerified: true,
            measuredQuantity: "5.02 kg",
            quantityPassed: true,
            observations: ""
          }
        ];
        
        for (const scan of dummyScans) {
          await db.run(`
            INSERT INTO scans (
              productName, location, timestamp, status, imageUrl, 
              manufacturer, netQuantity, mrp, mfgDate, bbDate, 
              customerCare, countryOfOrigin, verdict, violations, inspectorId, district, zone,
              quantityVerified, measuredQuantity, quantityPassed, observations
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'LMO-DL-104', 'South Delhi', 'Delhi Zone', ?, ?, ?, ?)
          `, Object.values(scan));
        }
      }

      // Seed Inspectors
      const insCount = await db.get('SELECT COUNT(*) as count FROM inspectors');
      if (insCount.count === 0) {
        const dummyInspectors = [
          ['Ramesh Kumar', 'LMO-DL-104', 'South Delhi', 'Zone 1', 'Active', 145, 23, '2.4 hrs', new Date().toISOString()],
          ['Sita Sharma', 'LMO-DL-105', 'South Delhi', 'Zone 1', 'Active', 112, 18, '1.8 hrs', new Date(Date.now() - 3600000).toISOString()],
          ['Amit Patel', 'LMO-DL-108', 'North Delhi', 'Zone 2', 'Active', 89, 11, '3.2 hrs', new Date(Date.now() - 86400000).toISOString()],
          ['Priya Singh', 'LMO-DL-112', 'East Delhi', 'Zone 3', 'On Leave', 210, 45, '2.1 hrs', new Date(Date.now() - 86400000 * 5).toISOString()]
        ];
        for (const ins of dummyInspectors) {
          await db.run(`INSERT INTO inspectors (name, officerId, district, zone, status, scansDone, violationsFound, avgResponse, lastActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, ins);
        }
      }

      // Seed Registrations
      const regCount = await db.get('SELECT COUNT(*) as count FROM registrations');
      if (regCount.count === 0) {
        const dummyRegs = [
          ['Agro Foods Ltd.', 'LM/DL/2026/012', 'Manufacturer', 'Vasant Kunj, New Delhi', 'South Delhi', 'Active'],
          ['Parle Products Pvt. Ltd.', 'LM/MH/2023/889', 'Manufacturer', 'Mumbai', 'Outside State', 'Active'],
          ['Delhi Packers Inc.', 'LM/DL/2024/055', 'Packer', 'Okhla, New Delhi', 'South Delhi', 'Expired'],
          ['Global Imports', 'LM/DL/2025/112', 'Importer', 'Karol Bagh, New Delhi', 'Central Delhi', 'Under Review']
        ];
        for (const reg of dummyRegs) {
          await db.run(`INSERT INTO registrations (companyName, regNo, type, address, district, status) VALUES (?, ?, ?, ?, ?, ?)`, reg);
        }
      }

      // Seed Enforcements
      const enfCount = await db.get('SELECT COUNT(*) as count FROM enforcements');
      if (enfCount.count === 0) {
        const dummyEnfs = [
          ['Local Brand Honey', 'Missing Manufacturer Details', new Date(Date.now() - 86400000 * 2).toISOString(), 'Issued', 'Waiting for response'],
          ['Delhi Packers Inc.', 'Net Quantity Shortage', new Date(Date.now() - 86400000 * 15).toISOString(), 'Responded', 'Hearing scheduled next week'],
          ['Agro Foods Ltd.', 'MRP Overcharging', new Date(Date.now() - 86400000 * 45).toISOString(), 'Closed', 'Penalty of ₹50,000 recovered']
        ];
        for (const enf of dummyEnfs) {
          await db.run(`INSERT INTO enforcements (companyName, violationType, noticeDate, status, remarks) VALUES (?, ?, ?, ?, ?)`, enf);
        }
      }

      // Seed States
      const stateCount = await db.get('SELECT COUNT(*) as count FROM states');
      if (stateCount.count === 0) {
        const dummyStates = [
          ['Maharashtra', 'Sanjay Kumar', 14500, 2100, 85, new Date().toISOString()],
          ['Delhi', 'Vikram Singh', 12300, 1800, 85, new Date().toISOString()],
          ['Karnataka', 'Priya Reddy', 11200, 1400, 87, new Date().toISOString()],
          ['Gujarat', 'Amit Shah', 9800, 1100, 89, new Date().toISOString()],
          ['Tamil Nadu', 'R. Krishnan', 10500, 1600, 85, new Date().toISOString()]
        ];
        for (const state of dummyStates) {
          await db.run(`INSERT INTO states (name, controllerName, scansDone, violationsFound, complianceRate, lastUpdated) VALUES (?, ?, ?, ?, ?, ?)`, state);
        }
      }

      // Seed E-commerce Violations
      const ecomCount = await db.get('SELECT COUNT(*) as count FROM ecommerce_violations');
      if (ecomCount.count === 0) {
        const dummyEcom = [
          ['Amazon', 'Imported Olive Oil', 'Global Traders', 'Missing MRP & Importer Address', 'Pending', true],
          ['Flipkart', 'Local Electronics', 'Delhi Gadgets', 'No Manufacturer details', 'Forwarded', false],
          ['Meesho', 'Cosmetics Set', 'Beauty Hub', 'Expired BB Date', 'Resolved', true],
          ['Blinkit', 'Packaged Snacks', 'QuickMart', 'Net Quantity Shortage', 'Pending', false]
        ];
        for (const ecom of dummyEcom) {
          await db.run(`INSERT INTO ecommerce_violations (platform, product, seller, violationType, status, isCrossState) VALUES (?, ?, ?, ?, ?, ?)`, ecom);
        }
      }

      // Seed Circulars
      const circCount = await db.get('SELECT COUNT(*) as count FROM circulars');
      if (circCount.count === 0) {
        const dummyCircs = [
          ['Amendment to Rule 4 - QR Code implementation', new Date(Date.now() - 86400000 * 10).toISOString(), 'All India'],
          ['Special Drive for Festive Season Sweets', new Date(Date.now() - 86400000 * 45).toISOString(), 'North Zone'],
          ['Guidelines for E-commerce Packaging', new Date(Date.now() - 86400000 * 120).toISOString(), 'All India']
        ];
        for (const circ of dummyCircs) {
          await db.run(`INSERT INTO circulars (title, date, applicableStates) VALUES (?, ?, ?)`, circ);
        }
      }

      return db;
    });
  }
  return dbPromise;
}

module.exports = { getDb };
