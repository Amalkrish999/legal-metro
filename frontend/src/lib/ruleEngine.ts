export interface Rule {
  ruleId: string;
  name: string;
  field: string;
  validation: string;
  minValue?: number;
}

export interface RuleResult {
  ruleId: string;
  name: string;
  status: 'pass' | 'fail';
  note?: string;
}

export interface ComplianceResult {
  overallVerdict: 'Compliant' | 'Non-compliant';
  failedCount: number;
  results: RuleResult[];
}

export function runComplianceCheck(extractedData: Record<string, any>, rules: Rule[]): ComplianceResult {
  // --- STEP 2 TEST: Validate logic against known-good object, independent of OCR ---
  const testData = { mrp: "Rs. 185.00 (Inclusive of all taxes)", fontSizeMm: 2 };
  const testMrpCleaned = String(testData.mrp).replace(/[^0-9.]/g, '').trim();
  const testFontVal = Number(testData.fontSizeMm);
  console.log('[STEP 2 TEST] testMrpCleaned:', JSON.stringify(testMrpCleaned));
  console.log('[STEP 2 TEST] R5 regex result:', /^\d+(\.\d{1,2})?$/.test(testMrpCleaned));
  console.log('[STEP 2 TEST] fontSizeMm Number():', testFontVal, '>=1:', testFontVal >= 1);
  // --- END STEP 2 TEST ---

  // Clean MRP: strip EVERYTHING non-numeric except decimal point, then trim
  const data = { ...extractedData };
  const rawMrp = String(data.mrp || '');
  const cleanedMrp = rawMrp.replace(/[^0-9.]/g, '').trim();
  data.mrp = cleanedMrp;


  console.log('RAW mrp before cleaning:', JSON.stringify(rawMrp));
  console.log('CLEANED mrp:', JSON.stringify(cleanedMrp));
  console.log('R5 regex test result:', /^\d+(\.\d{1,2})?$/.test(cleanedMrp));
  console.log('RAW fontSizeMm:', JSON.stringify(data.fontSizeMm), typeof data.fontSizeMm);
  console.log('R9 check result:', Number(data.fontSizeMm) >= 1);

  const results: RuleResult[] = rules.map(rule => {
    const value = data[rule.field];
    
    let pass = false;
    let note = '';

    const stringValue = String(value || '').trim();

    switch (rule.validation) {
      case 'nonEmpty':
        pass = Boolean(stringValue);
        if (!pass) note = `Missing ${rule.name.toLowerCase()}`;
        break;

      case 'isCurrencyFormat':
        // STEP 1 logs — exact value entering R5
        console.log('extractedData.mrp (raw):', JSON.stringify(extractedData.mrp));
        console.log('typeof mrp:', typeof extractedData.mrp);
        console.log('cleanedMrp (after cleaning step):', JSON.stringify(cleanedMrp));
        console.log('cleanedMrp length:', cleanedMrp != null ? cleanedMrp.length : 'undefined/null');
        console.log('R5 regex test:', /^\d+(\.\d{1,2})?$/.test(cleanedMrp));
        // strictly ensure the string exactly matches standard currency format, no letters
        pass = stringValue !== '' && /^\d+(\.\d{1,2})?$/.test(stringValue);
        if (!pass) note = 'Invalid currency format';
        break;


      case 'isValidDate':
        // A simple check to ensure it looks like a date or month/year
        // e.g. "10-2026", "10-08-2026", "Oct 2026"
        // We'll just check if it's non-empty and has at least some numbers
        pass = Boolean(stringValue && /\d/.test(stringValue));
        if (!pass) note = 'Invalid date format';
        break;

      case 'minValue':
        // Use Number() instead of parseFloat to strictly fail on non-numeric strings like "2 mm"
        const numVal = Number(stringValue);
        pass = stringValue !== '' && !isNaN(numVal) && rule.minValue !== undefined && numVal >= rule.minValue;
        if (!pass) note = `Value below minimum of ${rule.minValue}`;
        break;

      case 'greaterThanZero':
        const amount = parseFloat(stringValue);
        pass = !isNaN(amount) && amount > 0;
        if (!pass) note = 'Must be greater than zero';
        break;

      default:
        pass = false;
        note = `Unknown validation: ${rule.validation}`;
    }

    return {
      ruleId: rule.ruleId,
      name: rule.name,
      status: pass ? 'pass' : 'fail',
      note: pass ? undefined : note
    };
  });

  const failedCount = results.filter(r => r.status === 'fail').length;
  
  return {
    overallVerdict: failedCount === 0 ? 'Compliant' : 'Non-compliant',
    failedCount,
    results
  };
}
