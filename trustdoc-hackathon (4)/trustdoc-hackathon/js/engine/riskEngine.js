// TRUSTDOC Dynamic Multi-Factor Risk & Scenario Engine (India & International)

class RiskAssessmentEngine {
  constructor() {
    this.defaultConditions = {
      partyRole: "client", // client | provider
      riskTolerance: "strict", // strict | standard | aggressive
      dealValue: 10000000, // numerical INR ₹ (e.g. ₹1 Crore = 10,000,000)
      targetJurisdiction: "Mumbai" // Mumbai | Delhi | Bengaluru | GIFT City | Delaware | Cayman Islands
    };
  }

  evaluateDocument(clauses, conditions = {}) {
    const activeConditions = { ...this.defaultConditions, ...conditions };
    let totalScore = 0;
    let weightedCount = 0;

    const categoryScores = {
      "Indemnification": 0,
      "Limitation of Liability": 0,
      "Termination & Renewal": 0,
      "Governing Law & Jurisdiction": 0,
      "IP & Data Rights": 0,
      "Payment Terms": 0,
      "Confidentiality": 0,
      "Performance Warranty": 0
    };

    const categoryCounts = {};
    Object.keys(categoryScores).forEach(cat => categoryCounts[cat] = 0);

    const evaluatedClauses = clauses.map(clause => {
      const evalResult = this.evaluateClauseRisk(clause, activeConditions);
      categoryScores[clause.category] = (categoryScores[clause.category] || 0) + evalResult.dynamicScore;
      categoryCounts[clause.category] = (categoryCounts[clause.category] || 0) + 1;

      totalScore += evalResult.dynamicScore;
      weightedCount++;

      return {
        ...clause,
        dynamicRiskScore: evalResult.dynamicScore,
        dynamicRiskLevel: evalResult.dynamicLevel,
        riskExplanation: evalResult.reasoning,
        scenarioImpact: evalResult.scenarioImpact
      };
    });

    // Compute Category Averages
    Object.keys(categoryScores).forEach(cat => {
      const count = categoryCounts[cat] || 1;
      categoryScores[cat] = Math.round(categoryScores[cat] / count);
    });

    const aggregateScore = Math.min(100, Math.round(totalScore / (weightedCount || 1)));
    const aggregateRating = this.getRiskBadge(aggregateScore);

    return {
      aggregateScore,
      aggregateRating,
      categoryScores,
      evaluatedClauses,
      conditions: activeConditions
    };
  }

  evaluateClauseRisk(clause, conditions) {
    let score = clause.riskScore || 20;
    let reasoning = [];
    let scenarioImpact = [];

    // 1. Role Adaptation Logic (Client vs Provider)
    if (clause.category === "Indemnification") {
      if (conditions.partyRole === "client") {
        if (clause.text.includes("CLIENT SHALL DEFEND") || clause.text.includes("WILFUL MISCONDUCT OR NEGLIGENCE")) {
          score = 98;
          reasoning.push("Critical: Unilateral Client indemnity covering Provider's negligence or wilful misconduct.");
          scenarioImpact.push("Role [Client]: Maximum Risk Escalation (+60 pts)");
        }
      } else if (conditions.partyRole === "provider") {
        if (clause.text.includes("CLIENT SHALL DEFEND")) {
          score = 15; // Favorable for Provider
          reasoning.push("Favorable to Provider: Client holds Provider harmless.");
          scenarioImpact.push("Role [Provider]: Risk Dropped (-80 pts - Favorable to you)");
        }
      }
    }

    if (clause.category === "Limitation of Liability") {
      if (conditions.partyRole === "client") {
        if (clause.text.includes("₹50,000") || clause.text.includes("$10,000") || clause.text.includes("1 MONTH")) {
          score = 95;
          reasoning.push("Severe token cap on Provider liability relative to deal size.");
          scenarioImpact.push("Role [Client]: High Risk due to token liability cap (+50 pts)");
        }
      } else if (conditions.partyRole === "provider") {
        if (clause.text.includes("₹50,000") || clause.text.includes("$10,000")) {
          score = 20;
          reasoning.push("Provider exposure strictly capped at token amount.");
          scenarioImpact.push("Role [Provider]: Protects Provider from liability (-70 pts)");
        }
      }

      // Deal Value Scaling (e.g. ₹1 Crore+ deal vs ₹50,000 cap)
      if (conditions.dealValue >= 10000000 && (clause.text.includes("₹50,000") || clause.text.includes("$10,000"))) {
        score = Math.min(100, score + 10);
        const dealFormatted = this.formatCurrencyINR(conditions.dealValue);
        scenarioImpact.push(`Deal Size [${dealFormatted}]: Severe disparity with ₹50,000 liability cap (+10 pts)`);
      }
    }

    // 2. Risk Tolerance Adjustment
    if (conditions.riskTolerance === "strict") {
      score = Math.min(100, Math.round(score * 1.15));
      scenarioImpact.push("Tolerance [Strict]: +15% penalty multiplier applied.");
    } else if (conditions.riskTolerance === "aggressive") {
      score = Math.max(5, Math.round(score * 0.75));
      scenarioImpact.push("Tolerance [Aggressive]: -25% tolerance discount applied.");
    }

    // 3. Indian & International Jurisdiction Impact
    if (clause.category === "Governing Law & Jurisdiction") {
      const indianVenues = ["Mumbai", "Delhi", "Bengaluru", "GIFT City"];
      const targetIsIndian = indianVenues.includes(conditions.targetJurisdiction);

      if (clause.text.includes("Cayman Islands")) {
        if (targetIsIndian) {
          score = 92;
          reasoning.push("Offshore Cayman Islands jurisdiction deprives Indian entity of Indian Courts and Indian Arbitration Act 1996 protections.");
          scenarioImpact.push(`Jurisdiction Disparity [Target: ${conditions.targetJurisdiction} (India) vs Clause: Cayman Islands]: Critical Risk (+50 pts)`);
        } else {
          score = 30;
          scenarioImpact.push("Jurisdiction Matched offshore preference.");
        }
      } else if (clause.text.includes("Mumbai") || clause.text.includes("India")) {
        if (targetIsIndian) {
          score = 10;
          reasoning.push("Standard Indian governing law and Indian arbitration seat.");
          scenarioImpact.push(`Jurisdiction Matched Indian target: ${conditions.targetJurisdiction} (-20 pts)`);
        }
      }
    }

    const dynamicLevel = this.getRiskBadge(score).label;
    return { dynamicScore: score, dynamicLevel, reasoning: reasoning.join(" "), scenarioImpact };
  }

  formatCurrencyINR(amount) {
    if (amount >= 10000007) return `₹${(amount / 10000000).toFixed(1)} Crores`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} Lakhs`;
    return `₹${amount.toLocaleString()}`;
  }

  getRiskBadge(score) {
    if (score >= 80) return { label: "Critical", class: "badge-critical", color: "#ef4444" };
    if (score >= 60) return { label: "High", class: "badge-high", color: "#f97316" };
    if (score >= 35) return { label: "Medium", class: "badge-medium", color: "#eab308" };
    return { label: "Low", class: "badge-low", color: "#22c55e" };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RiskAssessmentEngine };
}
