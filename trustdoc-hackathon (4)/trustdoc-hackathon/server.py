# TRUSTDOC — FastAPI Backend with SQLite Document Database
# High-performance legal document analysis API with full SQLite persistence.

import os
import json
import re
import difflib
import shutil
import sqlite3
from typing import List, Dict, Any
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

app = FastAPI(title="TRUSTDOC High-Performance Legal Backend & DB", version="3.0.0")

# --- CORS & BASE PATHS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
DB_PATH = os.path.join(BASE_DIR, "trustdoc.db")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- SQLITE DATABASE INITIALIZATION ---
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Table 1: Documents
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            filename TEXT,
            full_text TEXT,
            category TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Table 2: Document Analyses (Clauses & Risk Results)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            doc_id TEXT,
            aggregate_score INTEGER,
            aggregate_rating TEXT,
            conditions_json TEXT,
            clauses_json TEXT,
            category_scores_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(doc_id) REFERENCES documents(id)
        )
    ''')

    # Table 3: Reviewer Audit Log
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            doc_id TEXT,
            clause_id TEXT,
            action TEXT,
            note TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()

init_db()

# --- PRE-COMPILED CATEGORY KEYWORDS FOR FAST MATCHING ---
CATEGORIES_PATTERNS = {
    "Confidentiality": re.compile(r"confidential|non-disclosure|nda|secret|dpdp|privacy", re.IGNORECASE),
    "Indemnification": re.compile(r"indemnify|indemnification|hold harmless|defend|third-party claim", re.IGNORECASE),
    "Liability": re.compile(r"liability|liable|limitation of liability|aggregate cap|consequential damage", re.IGNORECASE),
    "Termination": re.compile(r"terminate|termination|expire|notice period|cure period", re.IGNORECASE),
    "Payment": re.compile(r"payment|invoice|fees|gst|inr|rupees|late interest", re.IGNORECASE),
    "Governing Law": re.compile(r"governing law|jurisdiction|arbitration|court|mumbai|delhi|bengaluru|forum", re.IGNORECASE),
    "IP Rights": re.compile(r"intellectual property|ip rights|ownership|work made for hire|patent|copyright", re.IGNORECASE),
    "Data Protection": re.compile(r"data protection|personal data|gdpr|dpdp act|it act", re.IGNORECASE)
}

PLAIN_EXPLANATIONS = {
    "Liability": "You could pay unlimited damages. Standard commercial practice caps liability to 12 months fees paid.",
    "Indemnification": "You have to pay for all losses of the counterparty, even if caused by their own negligence.",
    "Governing Law": "Disputes are forced into an expensive foreign forum, increasing litigation costs for an Indian entity.",
    "Termination": "The counterparty can exit on short notice without penalty, while you face locked-in early termination fines.",
    "Confidentiality": "Confidentiality protection expires prematurely, exposing business secrets and DPDP regulated data.",
    "Payment": "Short 7-day payment window with high penalty interest rates (36% p.a.) and unilateral data locking rights.",
    "IP Rights": "Vendor claims exclusive ownership of custom code and deliverables paid for by Client.",
    "Data Protection": "Non-compliant data protection terms under the Digital Personal Data Protection (DPDP) Act, 2023."
}

# --- ULTRA-FAST LOGIC ENGINES ---
def fast_extract_clauses(full_text: str) -> List[Dict[str, Any]]:
    clauses = []
    current_section = 1
    raw_chunks = re.split(r'\n\s*\n|(?:Section|Clause)\s+(\d+[\.\d+]*)', full_text)
    clean_chunks = [c.strip() for c in raw_chunks if c and len(c.strip()) > 35]

    for i, chunk in enumerate(clean_chunks[:12]):
        cat = "Payment"
        for category_name, pattern in CATEGORIES_PATTERNS.items():
            if pattern.search(chunk):
                cat = category_name
                break

        clauses.append({
            "id": f"clause-{current_section}",
            "title": f"{cat} Clause",
            "section": f"{current_section}.0",
            "category": cat,
            "text": chunk[:1000],
            "startLine": i * 4 + 1,
            "endLine": i * 4 + len(chunk.split('\n')),
            "confidence": 0.95,
            "evidence": chunk[:280]
        })
        current_section += 1

    return clauses

def fast_risk_engine(clauses: List[Dict[str, Any]], conditions: Dict[str, Any]) -> Dict[str, Any]:
    deal_value = int(conditions.get('dealValue', 10000000))
    jurisdiction = str(conditions.get('targetJurisdiction', 'Mumbai'))
    role = str(conditions.get('partyRole', 'client'))
    tolerance = str(conditions.get('riskTolerance', 'strict'))

    category_scores = {k: 25 for k in CATEGORIES_PATTERNS.keys()}
    evaluated_clauses = []

    for c in clauses:
        base_score = c.get('riskScore', 35)
        scenario_impacts = []
        cat = c.get('category', 'Payment')
        text_lower = c.get('text', '').lower()

        if cat in ["Liability", "Indemnification"] and deal_value >= 50000000:
            base_score += 25
            deal_crores = deal_value / 10000000
            scenario_impacts.append(f"High deal value ₹{deal_crores:.1f}Cr amplifies liability exposure (+25 pts)")

        if jurisdiction in ["Cayman Islands", "Delaware"] and any(k in text_lower for k in ["india", "mumbai", "delhi", "bengaluru", "cayman"]):
            base_score += 20
            scenario_impacts.append(f"Foreign venue ({jurisdiction}) increases enforcement costs (+20 pts)")

        if role == "client" and cat == "Indemnification" and ("client shall defend" in text_lower or "negligence" in text_lower):
            base_score += 25
            scenario_impacts.append("Unilateral client indemnity covering vendor negligence (+25 pts)")
        elif role == "provider" and cat == "Indemnification" and "client shall defend" in text_lower:
            base_score = max(15, base_score - 45)
            scenario_impacts.append("Role [Provider]: Client holds Provider harmless (-45 pts - Favorable)")

        if tolerance == "strict":
            base_score += 10
            scenario_impacts.append("Tolerance [Strict]: +10 penalty applied")
        elif tolerance == "aggressive":
            base_score = max(10, base_score - 20)

        base_score = min(100, max(0, base_score))
        category_scores[cat] = max(category_scores.get(cat, 0), base_score)

        evaluated_clauses.append({
            **c,
            "dynamicRiskScore": base_score,
            "dynamicRiskLevel": "CRITICAL" if base_score >= 80 else "HIGH" if base_score >= 60 else "MEDIUM" if base_score >= 35 else "LOW",
            "plainExplanation": c.get('plainExplanation') or PLAIN_EXPLANATIONS.get(cat, "This clause creates operational exposure that should be negotiated."),
            "recommendation": c.get('recommendation') or f"Amend to mutual clause with liability capped at deal value and arbitration in Mumbai under Arbitration Act 1996.",
            "scenarioImpact": scenario_impacts,
            "riskExplanation": f"Detected {cat} risk with score {base_score}/100"
        })

    aggregate_score = int(sum(category_scores.values()) / len(category_scores)) if category_scores else 40
    
    label = "Critical" if aggregate_score >= 80 else "High" if aggregate_score >= 60 else "Medium" if aggregate_score >= 35 else "Low"
    badge_class = "badge-critical" if aggregate_score >= 80 else "badge-high" if aggregate_score >= 60 else "badge-medium" if aggregate_score >= 35 else "badge-low"
    color = "#ef4444" if aggregate_score >= 80 else "#f97316" if aggregate_score >= 60 else "#eab308" if aggregate_score >= 35 else "#22c55e"

    return {
        "aggregateScore": aggregate_score,
        "aggregateRating": {
            "label": label,
            "class": badge_class,
            "color": color
        },
        "categoryScores": category_scores,
        "evaluatedClauses": evaluated_clauses
    }

# --- PACT REQUEST MODELS ---
class TextIn(BaseModel):
    fullText: str

class RiskIn(BaseModel):
    doc_id: str = "doc-default"
    clauses: List[Dict[str, Any]]
    conditions: Dict[str, Any]

class DiffIn(BaseModel):
    v1_clauses: List[Dict[str, Any]]
    v2_clauses: List[Dict[str, Any]]

# --- API ENDPOINTS WITH DATABASE PERSISTENCE ---

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload Document & Persist to SQLite DB"""
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    extracted_text = ""
    if file.filename.endswith(".pdf"):
        try:
            import fitz
            doc = fitz.open(file_path)
            extracted_text = "\n".join([page.get_text() for page in doc])
        except Exception:
            extracted_text = open(file_path, 'r', errors='ignore').read()
    elif file.filename.endswith(".docx"):
        try:
            import docx
            doc = docx.Document(file_path)
            extracted_text = "\n".join([p.text for p in doc.paragraphs])
        except Exception:
            extracted_text = open(file_path, 'r', errors='ignore').read()
    else:
        extracted_text = open(file_path, 'r', errors='ignore').read()

    clauses = fast_extract_clauses(extracted_text)

    # Save to SQLite DB
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT OR REPLACE INTO documents (id, filename, full_text, category) VALUES (?, ?, ?, ?)",
        (file.filename, file.filename, extracted_text, "Uploaded Legal Document")
    )
    conn.commit()
    conn.close()

    return JSONResponse(content={
        "doc_id": file.filename,
        "fullText": extracted_text[:10000],
        "clauses": clauses
    })

@app.post("/api/extract")
def extract_text(inp: TextIn):
    return JSONResponse(content={"clauses": fast_extract_clauses(inp.fullText)})

@app.post("/api/risk-assess")
def assess_risk(inp: RiskIn):
    """Dynamic Risk Assessment & Persist Analysis to SQLite DB"""
    result = fast_risk_engine(inp.clauses, inp.conditions)

    # Persist Analysis to Database
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO analyses (doc_id, aggregate_score, aggregate_rating, conditions_json, clauses_json, category_scores_json)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                inp.doc_id,
                result["aggregateScore"],
                result["aggregateRating"]["label"],
                json.dumps(inp.conditions),
                json.dumps(result["evaluatedClauses"]),
                json.dumps(result["categoryScores"])
            )
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print("DB Analysis save error:", e)

    return JSONResponse(content=result)

@app.post("/api/diff")
def compare_diff(inp: DiffIn):
    diff_results = []
    for v2 in inp.v2_clauses:
        v1_match = next((x for x in inp.v1_clauses if x.get('section') == v2.get('section')), None)
        if not v1_match:
            diff_results.append({
                "status": "ADDED",
                "v2Clause": v2,
                "riskDelta": 15,
                "diffHtml": f'<span class="diff-add">{v2.get("text", "")}</span>'
            })
            continue

        sm = difflib.SequenceMatcher(None, v1_match.get('text', ''), v2.get('text', ''))
        html_out = []
        for op, i1, i2, j1, j2 in sm.get_opcodes():
            if op == 'equal':
                html_out.append(v1_match['text'][i1:i2])
            elif op == 'delete':
                html_out.append(f'<span class="diff-del">{v1_match["text"][i1:i2]}</span>')
            elif op == 'insert':
                html_out.append(f'<span class="diff-add">{v2["text"][j1:j2]}</span>')
            elif op == 'replace':
                html_out.append(f'<span class="diff-del">{v1_match["text"][i1:i2]}</span><span class="diff-add">{v2["text"][j1:j2]}</span>')

        text_delta = len(v2.get('text', '')) - len(v1_match.get('text', ''))
        diff_results.append({
            "status": "MODIFIED" if text_delta != 0 else "UNCHANGED",
            "v2Clause": v2,
            "riskDelta": 10 if text_delta > 0 else 0,
            "diffHtml": "".join(html_out)
        })

    return JSONResponse(content={"diffs": diff_results})

@app.post("/api/explain")
def explain_clause(clause: Dict[str, Any]):
    cat = clause.get("category", "Liability")
    return JSONResponse(content={
        "evidence": clause.get("text", "")[:300],
        "plainExplanation": PLAIN_EXPLANATIONS.get(cat, "This clause creates operational exposure that should be negotiated."),
        "recommendation": f"Amend to standard mutual terms with cap tied to contract value and arbitration in Mumbai."
    })

@app.post("/api/review")
def record_review(data: Dict[str, Any]):
    """Persist Reviewer Decision to SQLite Database"""
    doc_id = data.get('docId', 'msa-2026')
    clause_id = data.get('clauseId', 'c-1')
    action = data.get('action', 'Approved')
    note = data.get('note', '')

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO reviews (doc_id, clause_id, action, note) VALUES (?, ?, ?, ?)",
            (doc_id, clause_id, action, note)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print("DB Review save error:", e)

    return JSONResponse(content={
        "status": "saved_to_sqlite_db",
        "audit": f"[{clause_id}] -> {action} (Saved to SQLite DB)"
    })

# --- DATABASE REST API ENDPOINTS ---
@app.get("/api/db/documents")
def get_db_documents():
    """List all saved documents from SQLite Database"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, filename, category, created_at FROM documents ORDER BY created_at DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return JSONResponse(content={"documents": rows})

@app.get("/api/db/reviews/{doc_id}")
def get_db_reviews(doc_id: str):
    """Get all reviewer decisions for a document from SQLite Database"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT clause_id, action, note, timestamp FROM reviews WHERE doc_id = ? ORDER BY timestamp DESC", (doc_id,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return JSONResponse(content={"doc_id": doc_id, "reviews": rows})

@app.get("/api/prompts")
def get_prompts():
    prompts_path = os.path.join(BASE_DIR, "js", "engine", "prompts.js")
    if os.path.exists(prompts_path):
        return FileResponse(prompts_path)
    return JSONResponse(content={"prompts": []})

# --- STATIC FILES FRONTEND ---
css_path = os.path.join(BASE_DIR, "css")
js_path = os.path.join(BASE_DIR, "js")

if os.path.exists(css_path):
    app.mount("/css", StaticFiles(directory=css_path), name="css")
if os.path.exists(js_path):
    app.mount("/js", StaticFiles(directory=js_path), name="js")

@app.get("/")
def root():
    return FileResponse(os.path.join(BASE_DIR, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="warning")
