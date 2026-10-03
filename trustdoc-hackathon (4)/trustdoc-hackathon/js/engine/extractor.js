// TRUSTDOC Clause Extraction & Parsing Engine

class ClauseExtractor {
  constructor() {
    this.categories = [
      "Indemnification",
      "Limitation of Liability",
      "Termination & Renewal",
      "Governing Law & Jurisdiction",
      "IP & Data Rights",
      "Payment Terms",
      "Confidentiality",
      "Performance Warranty"
    ];
  }

  // Parses uploaded raw text or extracts from dataset
  parseDocumentText(rawText) {
    const lines = rawText.split('\n');
    const clauses = [];
    let currentClause = null;
    let lineNumber = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Section header detection regex (e.g., "1. SERVICES AND DELIVERABLES", "4.1 Provider agrees...")
      const sectionMatch = line.match(/^(\d+(\.\d+)?)\s+(.*)/);
      if (sectionMatch) {
        const secNum = sectionMatch[1];
        const titleText = sectionMatch[3];

        if (secNum.includes('.')) {
          if (currentClause) {
            clauses.push(currentClause);
          }
          const category = this.categorizeText(line);
          currentClause = {
            id: `extracted-${secNum}`,
            section: secNum,
            title: titleText.length > 50 ? titleText.substring(0, 50) + "..." : titleText,
            category: category,
            startLine: i + 1,
            endLine: i + 1,
            text: line,
            riskLevel: "Low",
            riskScore: 10,
            confidence: 0.92,
            summary: `Section ${secNum} extracted clause.`
          };
        }
      } else if (currentClause) {
        currentClause.text += " " + line;
        currentClause.endLine = i + 1;
      }
    }

    if (currentClause) {
      clauses.push(currentClause);
    }

    return clauses.length > 0 ? clauses : this.generateFallbackClauses(rawText);
  }

  categorizeText(text) {
    const lower = text.toLowerCase();
    if (lower.includes("indemnif") || lower.includes("hold harmless")) return "Indemnification";
    if (lower.includes("liabilit") || lower.includes("consequential") || lower.includes("aggregate")) return "Limitation of Liability";
    if (lower.includes("terminat") || lower.includes("expire") || lower.includes("notice period")) return "Termination & Renewal";
    if (lower.includes("governing law") || lower.includes("jurisdiction") || lower.includes("court") || lower.includes("arbitration")) return "Governing Law & Jurisdiction";
    if (lower.includes("intellectual property") || lower.includes("patent") || lower.includes("copyright") || lower.includes("work made for hire")) return "IP & Data Rights";
    if (lower.includes("pay") || lower.includes("fee") || lower.includes("invoice") || lower.includes("interest")) return "Payment Terms";
    if (lower.includes("confidential") || lower.includes("secret") || lower.includes("disclose")) return "Confidentiality";
    return "Performance Warranty";
  }

  generateFallbackClauses(text) {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    return [
      {
        id: "ext-1",
        section: "1.0",
        title: "Parsed Document Sample",
        category: "General Provisions",
        startLine: 1,
        endLine: Math.min(lines.length, 10),
        text: lines.slice(0, 10).join('\n'),
        riskLevel: "Medium",
        riskScore: 40,
        confidence: 0.88,
        summary: "Parsed uploaded document text."
      }
    ];
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ClauseExtractor };
}
