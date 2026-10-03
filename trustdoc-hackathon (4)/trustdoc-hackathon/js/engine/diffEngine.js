// TRUSTDOC Version Diff & Smart Redline Engine

class ContractDiffEngine {
  constructor() {}

  // Compares two clause lists across versions
  compareVersions(v1Clauses, v2Clauses) {
    const diffMap = [];

    // Map by section or category matching
    v2Clauses.forEach(v2c => {
      const matchingV1 = v1Clauses.find(v1c => v1c.section === v2c.section || v1c.category === v2c.category);
      if (matchingV1) {
        const textDiff = this.computeWordDiff(matchingV1.text, v2c.text);
        const riskDelta = v2c.riskScore - matchingV1.riskScore;
        diffMap.push({
          v1Clause: matchingV1,
          v2Clause: v2c,
          status: matchingV1.text === v2c.text ? "unchanged" : "modified",
          riskDelta: riskDelta,
          diffHtml: textDiff.html,
          additionsCount: textDiff.additions,
          deletionsCount: textDiff.deletions
        });
      } else {
        diffMap.push({
          v1Clause: null,
          v2Clause: v2c,
          status: "added",
          riskDelta: v2c.riskScore,
          diffHtml: `<ins class="diff-add">${this.escapeHtml(v2c.text)}</ins>`,
          additionsCount: v2c.text.split(' ').length,
          deletionsCount: 0
        });
      }
    });

    return diffMap;
  }

  computeWordDiff(text1, text2) {
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);

    let html = "";
    let additions = 0;
    let deletions = 0;

    // Fast word-level diff approximation for legal redline rendering
    const set1 = new Set(words1.map(w => w.toLowerCase()));
    const set2 = new Set(words2.map(w => w.toLowerCase()));

    words2.forEach(w => {
      const cleanW = w.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      if (cleanW && !set1.has(cleanW)) {
        html += `<ins class="diff-add">${this.escapeHtml(w)} </ins>`;
        additions++;
      } else {
        html += `<span>${this.escapeHtml(w)} </span>`;
      }
    });

    words1.forEach(w => {
      const cleanW = w.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      if (cleanW && !set2.has(cleanW)) {
        html += `<del class="diff-del">${this.escapeHtml(w)} </del>`;
        deletions++;
      }
    });

    return { html, additions, deletions };
  }

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ContractDiffEngine };
}
