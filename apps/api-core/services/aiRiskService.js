/**
 * Enterprise AI Safety & Risk Evaluation Engine.
 * Scans generated texts for PII/PHI leakages, analyzes citations, and generates risk metrics.
 */

/**
 * Scans a generated response string and returns a risk score profile
 */
export function evaluateOutputRisks(generatedText, citationsList = []) {
  const logs = [];
  let piiDetected = false;
  let phiDetected = false;

  // 1. PII Scan Filters
  const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/; // Social Security Number
  const phonePattern = /\b\d{3}-\d{3}-\d{4}\b/; // Phone formats
  
  if (ssnPattern.test(generatedText)) {
    piiDetected = true;
    logs.push('[RISK WARNING] Potential SSN pattern leaked in generated output');
  }
  if (phonePattern.test(generatedText)) {
    piiDetected = true;
    logs.push('[RISK WARNING] Telephone pattern leaked in output');
  }

  // 2. PHI Medical Scan Filters
  const patientNamePatterns = /\bPatient\s+[A-Z][a-z]+\b/;
  const medicalIdPatterns = /\bMRN\d{6,10}\b/; // Medical Record Number e.g. MRN1234567

  if (patientNamePatterns.test(generatedText)) {
    phiDetected = true;
    logs.push('[RISK WARNING] Patient identity string exposed (HIPAA violation risk)');
  }
  if (medicalIdPatterns.test(generatedText)) {
    phiDetected = true;
    logs.push('[RISK WARNING] Medical Record Number (MRN) identifier exposed');
  }

  // 3. Calculate Citation Score
  // Verified references check inside generated text
  let matchingCitations = 0;
  for (const cite of citationsList) {
    if (generatedText.toLowerCase().includes(cite.toLowerCase())) {
      matchingCitations++;
    }
  }
  
  const citationScore = citationsList.length > 0 ? Math.round((matchingCitations / citationsList.length) * 100) : 100;

  // 4. Calculate Overall Risk Score
  let riskScore = 10; // Base score (out of 100, lower is better)
  if (piiDetected) riskScore += 30;
  if (phiDetected) riskScore += 40;
  if (citationScore < 50) riskScore += 20;

  let toxicityScore = 0;
  if (generatedText.includes('unsafe') || generatedText.includes('invalid')) {
    toxicityScore = 15;
  }

  return {
    riskScore, // 0 - 100 (lower is better)
    citationScore, // 0 - 100 (higher is better)
    confidenceScore: Math.max(10, 100 - riskScore), // 0 - 100 (higher is better)
    piiFound: piiDetected,
    phiFound: phiDetected,
    toxicityScore,
    logs
  };
}
