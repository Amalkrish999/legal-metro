export interface ParsedOCRData {
  manufacturerName: string;
  manufacturerAddress: string;
  commodityName: string;
  netQuantity: string;
  mrp: string;
  mfgDate: string;
  bestBeforeDate: string;
  consumerCareDetails: string;
  countryOfOrigin: string;
  fontSizeMm: string;
}

export function parseOCRText(text: string): ParsedOCRData {
  const result: ParsedOCRData = {
    manufacturerName: '',
    manufacturerAddress: '',
    commodityName: '',
    netQuantity: '',
    mrp: '',
    mfgDate: '',
    bestBeforeDate: '',
    consumerCareDetails: '',
    countryOfOrigin: '',
    fontSizeMm: ''
  };

  if (!text) return result;

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Best-effort Manufacturer guess (first couple of lines usually contain brand/manufacturer)
  if (lines.length > 0) {
    result.manufacturerName = lines[0];
  }
  if (lines.length > 1) {
    result.manufacturerAddress = lines[1];
  }

  // MRP: capture ONLY the number immediately after MRP/Rs./₹ — never grab the rest of the line
  // This prevents stray dots or numbers from adjacent text corrupting the cleaned value
  // e.g. "Rs. 185.00 (Inclusive of all taxes)" → captures "185.00" directly
  const mrpMatch = text.match(/(?:MRP|Rs\.?|₹)\s*[:\-]?\s*(\d+(?:\.\d{1,2})?)/i);
  if (mrpMatch && mrpMatch[1]) {
    result.mrp = mrpMatch[1].trim(); // already a clean "185.00" — no stripping needed
    console.log('[DEBUG ocrParser] MRP captured:', JSON.stringify(result.mrp));
    console.log('[DEBUG ocrParser] R5 regex on captured value:', /^\d+(\.\d{1,2})?$/.test(result.mrp));
  }

  // Net Quantity: look for numbers followed by g, kg, ml, l
  const netQtyMatch = text.match(/(\d+(\.\d+)?)\s*(g|kg|ml|l|gm)\b/i);
  if (netQtyMatch && netQtyMatch[0]) {
    result.netQuantity = netQtyMatch[0].trim();
  }

  // Mfg Date: look for date-like patterns (MM/YYYY, Month YYYY, DD/MM/YYYY)
  const mfgDateMatch = text.match(/(\d{1,2}[\/\-]\d{2,4}|[A-Za-z]+\s+\d{4})/);
  if (mfgDateMatch && mfgDateMatch[1]) {
    result.mfgDate = mfgDateMatch[1];
  }

  // Consumer Care: look for 10-11 digit phone number pattern or 1800 toll free
  const careMatch = text.match(/\b(1800[- \d]+|\d{10})\b/);
  if (careMatch && careMatch[1]) {
    result.consumerCareDetails = careMatch[1];
  }
  
  // Country of Origin
  const cooMatch = text.match(/(?:made in|product of|origin)\s*[:\-]?\s*([a-zA-Z\s]+)/i);
  if (cooMatch && cooMatch[1]) {
    // take the first word after the match to avoid grabbing the rest of the text
    const words = cooMatch[1].trim().split(/\s+/);
    result.countryOfOrigin = words.slice(0, 2).join(' ').replace(/[.,]/g, '');
  }

  // Try to find commodity name
  const nameMatch = text.match(/(?:Common Name|Product Name|Commodity)\s*[:\-]?\s*([^\n\r]+)/i);
  if (nameMatch && nameMatch[1]) {
    result.commodityName = nameMatch[1].trim();
  } else if (lines.length > 0) {
    result.commodityName = lines[0].trim(); // fallback to first line
  }

  return result;
}
