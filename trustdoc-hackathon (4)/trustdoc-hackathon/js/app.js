// TRUSTDOC Application Controller & State Engine (Connected to FastAPI Backend)

class TrustDocApp {
  constructor() {
    this.currentContractId = "msa-2026";
    this.currentStep = 1;
    this.extractor = new ClauseExtractor();
    this.diffEngine = new ContractDiffEngine();
    this.riskEngine = new RiskAssessmentEngine();

    this.reviewerDecisions = {}; // clauseId -> { action: "Approve" | "Reject" | "Flag", note: "" }
    this.auditLogList = [];

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadContract(this.currentContractId);
    this.logAudit("TRUSTDOC Application initialized and connected to FastAPI backend.");
  }

  bindEvents() {
    // Contract Selector
    document.getElementById('contractSelect').addEventListener('change', (e) => {
      this.currentContractId = e.target.value;
      this.loadContract(this.currentContractId);
      this.logAudit(`Switched contract pair to: ${e.target.value}`);
    });

    // Stepper Navigation clicks
    document.querySelectorAll('.step-item').forEach(item => {
      item.addEventListener('click', () => {
        const step = parseInt(item.getAttribute('data-step'));
        this.goToStep(step);
      });
    });

    // Live Scenario Simulator Controls
    const simRole = document.getElementById('simRole');
    const simTolerance = document.getElementById('simTolerance');
    const simDealSlider = document.getElementById('simDealSlider');
    const simJurisdiction = document.getElementById('simJurisdiction');

    const triggerRecalc = () => {
      const dealVal = parseInt(simDealSlider.value);
      let dealText = `₹${dealVal.toLocaleString()}`;
      if (dealVal >= 10000000) {
        dealText = `₹${(dealVal / 10000000).toFixed(1)} Crore${dealVal > 10000000 ? 's' : ''}`;
      } else if (dealVal >= 100000) {
        dealText = `₹${(dealVal / 100000).toFixed(0)} Lakhs`;
      }
      document.getElementById('simDealValDisplay').innerText = dealText;
      this.recalculateScenario();
    };

    simRole.addEventListener('change', triggerRecalc);
    simTolerance.addEventListener('change', triggerRecalc);
    simDealSlider.addEventListener('input', triggerRecalc);
    simJurisdiction.addEventListener('change', triggerRecalc);

    // AI Prompts Tab Button
    document.getElementById('btnPromptsTab').addEventListener('click', () => {
      this.showPromptsStudio();
    });

    // Export Button
    document.getElementById('btnExportReport').addEventListener('click', () => {
      this.exportReport();
    });

    // Drag and Drop File Upload
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--primary)';
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.style.borderColor = 'var(--border-glow)';
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--border-glow)';
      if (e.dataTransfer.files.length > 0) {
        this.handleFileUpload(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFileUpload(e.target.files[0]);
      }
    });
  }

  loadContract(contractId) {
    const contract = CONTRACT_DATASET.find(c => c.id === contractId);
    if (!contract) return;

    this.activeContractPair = contract;
    this.activeV1Clauses = contract.v1.clauses;
    this.activeV2Clauses = contract.v2.clauses;

    // Render V1 and V2 Text Previews
    document.getElementById('v1Title').innerText = contract.v1.version;
    document.getElementById('v2Title').innerText = contract.v2.version;
    document.getElementById('v1PreviewText').innerText = contract.v1.fullText;
    document.getElementById('v2PreviewText').innerText = contract.v2.fullText;

    // Run Engine Analysis
    this.recalculateScenario();
  }

  async handleFileUpload(file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      this.activeContractPair = {
        id: data.doc_id,
        title: file.name,
        category: "Uploaded Legal Document",
        v1: { version: "Original Baseline", fullText: data.fullText, clauses: data.clauses },
        v2: { version: "Parsed Analysis", fullText: data.fullText, clauses: data.clauses }
      };

      this.activeV1Clauses = data.clauses;
      this.activeV2Clauses = data.clauses;

      document.getElementById('v1Title').innerText = `Uploaded: ${file.name}`;
      document.getElementById('v2Title').innerText = `Backend Parsed Analysis`;
      document.getElementById('v1PreviewText').innerText = data.fullText;
      document.getElementById('v2PreviewText').innerText = data.fullText;

      this.logAudit(`Uploaded file to FastAPI backend: ${file.name}`);
      this.recalculateScenario();
      this.goToStep(2);

    } catch (err) {
      console.warn("Backend upload failed, using client fallback:", err);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const extractedClauses = this.extractor.parseDocumentText(text);

        this.activeContractPair = {
          id: "custom-upload",
          title: file.name,
          category: "Uploaded Legal Document",
          v1: { version: "Original Baseline", fullText: text, clauses: extractedClauses },
          v2: { version: "Parsed Analysis", fullText: text, clauses: extractedClauses }
        };

        this.activeV1Clauses = extractedClauses;
        this.activeV2Clauses = extractedClauses;

        document.getElementById('v1Title').innerText = `Uploaded: ${file.name}`;
        document.getElementById('v2Title').innerText = `Parsed Document Analysis`;
        document.getElementById('v1PreviewText').innerText = text;
        document.getElementById('v2PreviewText').innerText = text;

        this.recalculateScenario();
        this.goToStep(2);
      };
      reader.readAsText(file);
    }
  }

  async recalculateScenario() {
    const conditions = {
      partyRole: document.getElementById('simRole').value,
      riskTolerance: document.getElementById('simTolerance').value,
      dealValue: parseInt(document.getElementById('simDealSlider').value),
      targetJurisdiction: document.getElementById('simJurisdiction').value
    };

    try {
      const res = await fetch('/api/risk-assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clauses: this.activeV2Clauses, conditions })
      });
      this.riskResult = await res.json();
    } catch (err) {
      console.warn("FastAPI backend connection error, using client risk engine:", err);
      this.riskResult = this.riskEngine.evaluateDocument(this.activeV2Clauses, conditions);
    }

    // Update Header Risk Badge
    const headerBadge = document.getElementById('headerRiskBadge');
    headerBadge.className = `risk-badge ${this.riskResult.aggregateRating.class}`;
    headerBadge.innerText = `${this.riskResult.aggregateRating.label.toUpperCase()} (${this.riskResult.aggregateScore}/100)`;

    // Render Step Views
    this.renderClauses();
    this.renderDiff();
    this.renderRiskMatrix();
    this.renderEvidenceView();
    this.renderReviewerWorkflow();
    this.renderScenarioFeed();
  }

  renderScenarioFeed() {
    const feed = document.getElementById('simFeed');
    feed.innerHTML = '';

    let impactLogs = [];
    this.riskResult.evaluatedClauses.forEach(c => {
      if (c.scenarioImpact && c.scenarioImpact.length > 0) {
        c.scenarioImpact.forEach(imp => impactLogs.push(`• <strong>[${c.category}]</strong> ${imp}`));
      }
    });

    if (impactLogs.length === 0) {
      feed.innerHTML = `<div>Standard conditions active. No severe scenario triggers.</div>`;
    } else {
      impactLogs.slice(0, 8).forEach(log => {
        const item = document.createElement('div');
        item.style.padding = '4px 0';
        item.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        item.innerHTML = log;
        feed.appendChild(item);
      });
    }
  }

  renderClauses() {
    const container = document.getElementById('clauseListContainer');
    container.innerHTML = '';

    this.riskResult.evaluatedClauses.forEach(c => {
      const card = document.createElement('div');
      card.className = 'glass-card';
      card.style.padding = '1.25rem';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <div>
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--secondary);">SECTION ${c.section}</span>
            <h3 style="font-size: 1rem; font-weight: 700; color: white;">${c.title}</h3>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="risk-badge badge-low" style="font-size: 0.65rem;">Cat: ${c.category}</span>
            <span class="risk-badge ${this.riskEngine.getRiskBadge(c.dynamicRiskScore).class}">
              ${c.dynamicRiskLevel} (${c.dynamicRiskScore}/100)
            </span>
          </div>
        </div>
        <div class="contract-box" style="max-height: 120px; font-size: 0.78rem;">${c.text}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">
          Lines ${c.startLine}-${c.endLine} | Confidence: ${c.confidence ? (c.confidence * 100).toFixed(0) : 95}%
        </div>
      `;
      container.appendChild(card);
    });
  }

  async renderDiff() {
    const container = document.getElementById('diffContainer');
    container.innerHTML = '';

    try {
      const res = await fetch('/api/diff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ v1_clauses: this.activeV1Clauses, v2_clauses: this.activeV2Clauses })
      });
      const data = await res.json();

      data.diffs.forEach(d => {
        const card = document.createElement('div');
        card.className = 'glass-card';
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
            <div>
              <span class="risk-badge badge-high" style="text-transform: uppercase;">Status: ${d.status}</span>
              <strong style="margin-left: 0.5rem;">Section ${d.v2Clause.section}: ${d.v2Clause.title}</strong>
            </div>
            <div style="font-weight: 700; color: ${d.riskDelta > 0 ? 'var(--risk-critical)' : 'var(--risk-low)'};">
              Risk Delta: ${d.riskDelta > 0 ? '+' : ''}${d.riskDelta} pts
            </div>
          </div>
          <div class="contract-box" style="max-height: 200px;">${d.diffHtml}</div>
        `;
        container.appendChild(card);
      });
    } catch (err) {
      const diffs = this.diffEngine.compareVersions(this.activeV1Clauses, this.activeV2Clauses);
      diffs.forEach(d => {
        const card = document.createElement('div');
        card.className = 'glass-card';
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
            <div>
              <span class="risk-badge badge-high" style="text-transform: uppercase;">Status: ${d.status}</span>
              <strong style="margin-left: 0.5rem;">Section ${d.v2Clause.section}: ${d.v2Clause.title}</strong>
            </div>
            <div style="font-weight: 700; color: ${d.riskDelta > 0 ? 'var(--risk-critical)' : 'var(--risk-low)'};">
              Risk Delta: ${d.riskDelta > 0 ? '+' : ''}${d.riskDelta} pts
            </div>
          </div>
          <div class="contract-box" style="max-height: 200px;">${d.diffHtml}</div>
        `;
        container.appendChild(card);
      });
    }
  }

  renderRiskMatrix() {
    document.getElementById('riskScoreLarge').innerText = this.riskResult.aggregateScore;
    document.getElementById('riskRatingLarge').innerText = `${this.riskResult.aggregateRating.label.toUpperCase()} RISK`;
    document.getElementById('riskRatingLarge').className = `risk-badge ${this.riskResult.aggregateRating.class}`;

    const bars = document.getElementById('categoryBars');
    bars.innerHTML = '';

    Object.entries(this.riskResult.categoryScores).forEach(([cat, score]) => {
      const badge = this.riskEngine.getRiskBadge(score);
      const row = document.createElement('div');
      row.innerHTML = `
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">
          <span>${cat}</span>
          <span style="color: ${badge.color}">${score}% (${badge.label})</span>
        </div>
        <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
          <div style="width: ${score}%; height: 100%; background: ${badge.color}; transition: width 0.4s ease;"></div>
        </div>
      `;
      bars.appendChild(row);
    });
  }

  renderEvidenceView() {
    const container = document.getElementById('evidenceContainer');
    container.innerHTML = '';

    this.riskResult.evaluatedClauses.forEach(c => {
      if (c.dynamicRiskScore >= 35) {
        const badge = this.riskEngine.getRiskBadge(c.dynamicRiskScore);
        const card = document.createElement('div');
        card.className = 'evidence-card';
        card.style.borderLeftColor = badge.color;

        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-weight: 700; font-size: 0.95rem;">Section ${c.section}: ${c.title}</div>
            <span class="risk-badge ${badge.class}">${badge.label} (${c.dynamicRiskScore}/100)</span>
          </div>

          <div class="evidence-quote">
            <strong style="color: var(--secondary);">Raw Evidence (Lines ${c.startLine}-${c.endLine}):</strong><br>
            "${c.evidence || c.text}"
          </div>

          <div class="plain-translation">
            <strong style="color: var(--primary);"><i data-lucide="message-square"></i> Plain Business Language Translation:</strong><br>
            ${c.plainExplanation || c.riskExplanation || "This clause creates operational exposure that should be negotiated."}
          </div>

          <div style="background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.2); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.82rem;">
            <strong style="color: var(--risk-low);"><i data-lucide="shield-check"></i> Recommended Counter-Proposal Wording:</strong><br>
            "${c.recommendation || "Negotiate standard mutual provisions with reasonable caps."}"
          </div>
        `;
        container.appendChild(card);
      }
    });

    lucide.createIcons();
  }

  renderReviewerWorkflow() {
    const container = document.getElementById('reviewerContainer');
    container.innerHTML = '';

    this.riskResult.evaluatedClauses.forEach(c => {
      const decision = this.reviewerDecisions[c.id] || { action: "Pending", note: "" };
      const card = document.createElement('div');
      card.className = 'glass-card';
      card.style.padding = '1.25rem';

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <div>
            <strong>Section ${c.section}: ${c.title}</strong>
            <span class="risk-badge ${this.riskEngine.getRiskBadge(c.dynamicRiskScore).class}" style="margin-left: 0.5rem;">
              ${c.dynamicRiskLevel} (${c.dynamicRiskScore})
            </span>
          </div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--secondary);">
            Decision: <span style="text-transform: uppercase; color: var(--primary);">${decision.action}</span>
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
          <button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.75rem; border-color: #22c55e;" onclick="TRUSTDOC_APP.setReviewerDecision('${c.id}', 'Approve')">
            <i data-lucide="check" style="width: 14px; color: #22c55e;"></i> Approve Clause
          </button>
          <button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.75rem; border-color: #ef4444;" onclick="TRUSTDOC_APP.setReviewerDecision('${c.id}', 'Reject')">
            <i data-lucide="x" style="width: 14px; color: #ef4444;"></i> Reject Clause
          </button>
          <button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.75rem; border-color: #eab308;" onclick="TRUSTDOC_APP.setReviewerDecision('${c.id}', 'Escalate to Legal')">
            <i data-lucide="flag" style="width: 14px; color: #eab308;"></i> Escalate to Legal
          </button>
        </div>
      `;
      container.appendChild(card);
    });

    lucide.createIcons();
  }

  async setReviewerDecision(clauseId, action) {
    this.reviewerDecisions[clauseId] = { action, timestamp: new Date().toLocaleTimeString() };
    this.logAudit(`Reviewer set decision for clause [${clauseId}] -> ${action}`);

    try {
      await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clauseId, action, note: "Reviewer action recorded" })
      });
    } catch (err) {
      console.warn("Review decision backend call warning:", err);
    }

    this.renderReviewerWorkflow();
  }

  logAudit(msg) {
    const time = new Date().toLocaleTimeString();
    this.auditLogList.unshift(`[${time}] ${msg}`);
    const logEl = document.getElementById('auditLog');
    if (logEl) {
      logEl.innerHTML = this.auditLogList.map(l => `<div>${l}</div>`).join('');
    }
  }

  goToStep(stepNumber) {
    this.currentStep = stepNumber;

    document.querySelectorAll('.step-item').forEach(el => {
      const s = parseInt(el.getAttribute('data-step'));
      if (s === stepNumber) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    document.querySelectorAll('.step-section').forEach(sec => {
      sec.classList.remove('active-section');
    });

    const targetSec = document.getElementById(`step${stepNumber}`);
    if (targetSec) {
      targetSec.classList.add('active-section');
    }

    lucide.createIcons();
  }

  showPromptsStudio() {
    document.querySelectorAll('.step-section').forEach(sec => sec.classList.remove('active-section'));
    document.getElementById('stepPrompts').classList.add('active-section');

    const container = document.getElementById('promptsListContainer');
    container.innerHTML = '';

    PROMPT_STUDIO.forEach(p => {
      const card = document.createElement('div');
      card.className = 'glass-card';
      card.innerHTML = `
        <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--secondary); margin-bottom: 0.5rem;">${p.name}</h3>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;"><strong>Purpose:</strong> ${p.purpose}</div>
        
        <div style="font-size: 0.75rem; font-weight: 700; color: var(--primary); margin-bottom: 0.25rem;">SYSTEM PROMPT:</div>
        <div class="contract-box" style="margin-bottom: 1rem; max-height: 180px;">${p.systemPrompt}</div>

        <div style="font-size: 0.75rem; font-weight: 700; color: var(--secondary); margin-bottom: 0.25rem;">SAMPLE USER PROMPT:</div>
        <div class="contract-box" style="max-height: 100px;">${p.sampleUserPrompt}</div>
      `;
      container.appendChild(card);
    });
  }

  exportReport() {
    window.print();
  }
}

// Global App Instance
let TRUSTDOC_APP;
window.addEventListener('DOMContentLoaded', () => {
  TRUSTDOC_APP = new TrustDocApp();
});
