// TRUSTDOC Contract Dataset — Indian & International Legal Framework
// Real-world sample contracts with detailed clause breakdowns, version diffs, and risk metadata.

const CONTRACT_DATASET = [
  {
    id: "msa-2026",
    title: "Master Services Agreement (India IT/SaaS MSA)",
    category: "IT & Software Services (India)",
    v1: {
      version: "v1.0 (Standard Indian Baseline)",
      author: "Internal Legal Operations (India)",
      date: "2026-01-15",
      fullText: `MASTER SERVICES AGREEMENT

1. SERVICES AND DELIVERABLES
1.1 Provider shall perform the IT services ("Services") specified in each Statement of Work ("SOW") in accordance with the Indian Contract Act, 1872. Provider warrants that all Services will be performed in a professional, workmanlike manner consistent with industry standards in India.
1.2 Delivery timelines set forth in the SOW are subject to mutual written agreement.

2. FEES, TAXES AND PAYMENT TERMS
2.1 Client shall pay all undisputed invoices within thirty (30) days of receipt ("Payment Due Date"). Payments shall be made in Indian Rupees (INR ₹) plus applicable Goods and Services Tax (GST @ 18%).
2.2 Late payments shall accrue interest at 1.0% per month (12% per annum) under applicable Indian commercial law.

3. CONFIDENTIALITY & DATA PRIVACY
3.1 Each party agrees to protect Confidential Information and comply with the Digital Personal Data Protection (DPDP) Act, 2023 and IT Act, 2000.
3.2 Confidentiality obligations shall survive termination for a period of three (3) years.

4. INDEMNIFICATION
4.1 Provider agrees to defend, indemnify, and hold harmless Client and its directors from third-party claims arising out of Provider's gross negligence or direct infringement of third-party Indian patents or copyrights.
4.2 Client agrees to indemnify Provider against third-party claims arising from unauthorized modification of Deliverables by Client.

5. LIMITATION OF LIABILITY
5.1 EXCEPT FOR BREACH OF CONFIDENTIALITY OR STATUTORY DATA PROTECTION OBLIGATIONS, NEITHER PARTY SHALL BE LIABLE FOR ANY CONSEQUENTIAL, INDIRECT, OR SPECIAL DAMAGES.
5.2 TOTAL AGGREGATE LIABILITY OF EITHER PARTY SHALL BE STRICTLY LIMITED TO TOTAL FEES PAID BY CLIENT TO PROVIDER IN THE PRECEDING TWELVE (12) MONTHS.

6. TERMINATION
6.1 Either party may terminate this Agreement or any SOW for convenience upon sixty (60) days written notice.
6.2 Either party may terminate immediately upon written notice if the other party breaches material obligations and fails to cure within thirty (30) days.

7. INTELLECTUAL PROPERTY RIGHTS
7.1 All custom Deliverables created specifically for Client under an SOW shall vest exclusively in Client upon receipt of full payment.
7.2 Provider retains all ownership of pre-existing background IP and frameworks.

8. GOVERNING LAW AND DISPUTE RESOLUTION
8.1 This Agreement shall be governed by and construed in accordance with the laws of the Republic of India.
8.2 Any dispute or difference arising out of or in connection with this Agreement shall be referred to and finally resolved by binding arbitration in Mumbai, India in accordance with the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration shall be Mumbai, Maharashtra, and courts in Mumbai shall have exclusive jurisdiction.`,
      clauses: [
        {
          id: "c-1.1",
          section: "1.1",
          title: "Standard of Performance & Indian Contract Act Compliance",
          category: "Performance Warranty",
          startLine: 3,
          endLine: 4,
          text: `Provider shall perform the IT services ("Services") specified in each Statement of Work ("SOW") in accordance with the Indian Contract Act, 1872. Provider warrants that all Services will be performed in a professional, workmanlike manner consistent with industry standards in India.`,
          riskLevel: "Low",
          riskScore: 10,
          params: { warrantyPeriod: "Standard", standard: "Workmanlike", act: "Indian Contract Act 1872" },
          summary: "Standard service warranty compliant with Indian Contract Act."
        },
        {
          id: "c-2.1",
          section: "2.1",
          title: "Payment Terms (INR ₹ & GST 18%)",
          category: "Payment Terms",
          startLine: 7,
          endLine: 8,
          text: `Client shall pay all undisputed invoices within thirty (30) days of receipt ("Payment Due Date"). Payments shall be made in Indian Rupees (INR ₹) plus applicable Goods and Services Tax (GST @ 18%).`,
          riskLevel: "Low",
          riskScore: 15,
          params: { paymentDays: 30, currency: "INR ₹", gstRate: "18%" },
          summary: "Standard 30-day payment term in INR with GST compliance."
        },
        {
          id: "c-3.1",
          section: "3.1",
          title: "DPDP Act 2023 & IT Act 2000 Compliance",
          category: "Confidentiality",
          startLine: 11,
          endLine: 12,
          text: `Each party agrees to protect Confidential Information and comply with the Digital Personal Data Protection (DPDP) Act, 2023 and IT Act, 2000.`,
          riskLevel: "Low",
          riskScore: 10,
          params: { statutoryFramework: "DPDP Act 2023 & IT Act 2000" },
          summary: "Compliance with Indian privacy laws (DPDP Act 2023 & IT Act)."
        },
        {
          id: "c-4.1",
          section: "4.1",
          title: "Provider Indemnification Obligation",
          category: "Indemnification",
          startLine: 15,
          endLine: 16,
          text: `Provider agrees to defend, indemnify, and hold harmless Client and its directors from third-party claims arising out of Provider's gross negligence or direct infringement of third-party Indian patents or copyrights.`,
          riskLevel: "Low",
          riskScore: 20,
          params: { scope: "Gross negligence & IP infringement", capped: true },
          summary: "Balanced indemnity covering Provider negligence and IP claims."
        },
        {
          id: "c-5.2",
          section: "5.2",
          title: "Aggregate Liability Cap (12 Months Fees)",
          category: "Limitation of Liability",
          startLine: 20,
          endLine: 21,
          text: `TOTAL AGGREGATE LIABILITY OF EITHER PARTY SHALL BE STRICTLY LIMITED TO TOTAL FEES PAID BY CLIENT TO PROVIDER IN THE PRECEDING TWELVE (12) MONTHS.`,
          riskLevel: "Low",
          riskScore: 15,
          params: { capMultiplier: "12 months fees", capType: "Mutual" },
          summary: "Standard mutual liability cap tied to 12 months fees paid."
        },
        {
          id: "c-6.1",
          section: "6.1",
          title: "Termination for Convenience (60 Days)",
          category: "Termination & Renewal",
          startLine: 23,
          endLine: 24,
          text: `Either party may terminate this Agreement or any SOW for convenience upon sixty (60) days written notice.`,
          riskLevel: "Low",
          riskScore: 10,
          params: { noticePeriodDays: 60, mutual: true },
          summary: "Mutual 60-day notice period for convenience termination."
        },
        {
          id: "c-8.2",
          section: "8.2",
          title: "Arbitration & Jurisdiction (Mumbai, Maharashtra)",
          category: "Governing Law & Jurisdiction",
          startLine: 28,
          endLine: 30,
          text: `Any dispute or difference arising out of or in connection with this Agreement shall be referred to and finally resolved by binding arbitration in Mumbai, India in accordance with the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration shall be Mumbai, Maharashtra, and courts in Mumbai shall have exclusive jurisdiction.`,
          riskLevel: "Low",
          riskScore: 5,
          params: { governingLaw: "India", seat: "Mumbai", act: "Arbitration & Conciliation Act 1996" },
          summary: "Standard Indian governing law with arbitration seat in Mumbai under 1996 Act."
        }
      ]
    },
    v2: {
      version: "v2.0 (Counterparty Unfavorable Redline)",
      author: "Vendor External Counsel",
      date: "2026-02-01",
      fullText: `MASTER SERVICES AGREEMENT

1. SERVICES AND DELIVERABLES
1.1 Provider shall perform services ("Services") specified in SOW. PROVIDER EXPRESSLY DISCLAIMS ALL WARRANTIES UNDER THE INDIAN CONTRACT ACT 1872 OR ANY OTHER STATUTE.
1.2 Milestones set forth in SOW are target estimates only.

2. FEES AND PAYMENT TERMS
2.1 Client shall pay all invoices within seven (7) days of invoice date. Late payments shall accrue interest at 3.0% per month (36% per annum). Failure to pay within 7 days entitles Provider to immediately suspend all Services and lock Client data without prior notice.
2.2 Client shall pay all bank transfer fees and an additional mandatory 18% administrative fee on expenses.

3. CONFIDENTIALITY
3.1 Confidentiality obligations shall expire six (6) months after signing, notwithstanding any provisions of the DPDP Act 2023 or IT Act.

4. INDEMNIFICATION
4.1 CLIENT SHALL DEFEND, INDEMNIFY AND HOLD HARMLESS PROVIDER, ITS PROMOTERS, AND SUBCONTRACTORS FROM ANY CLAIMS, LOSSES, DEMANDS, AND LEGAL FEES ARISING OUT OF THE SERVICES, EVEN IF CAUSED BY PROVIDER'S OWN WILFUL MISCONDUCT OR NEGLIGENCE.
4.2 Provider shall have no indemnification obligation of any kind to Client.

5. LIMITATION OF LIABILITY
5.1 IN NO EVENT SHALL PROVIDER BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.
5.2 PROVIDER'S TOTAL AGGREGATE LIABILITY SHALL BE STRICTLY CAPPED AT ₹50,000 (FIFTY THOUSAND RUPEES) IN TOTAL FOR ALL CLAIMS COMBINED.

6. TERMINATION
6.1 Provider may terminate for convenience on three (3) days notice. Client may only terminate on one hundred eighty (180) days notice and payment of ₹25,000,000 (Rupees 2.5 Crores) cancellation penalty.

7. INTELLECTUAL PROPERTY
7.1 Provider retains exclusive ownership of all Deliverables, code, custom software, and reports. Client is granted a revocable temporary license during the Term only.

8. GOVERNING LAW AND DISPUTE RESOLUTION
8.1 This Agreement shall be governed by the laws of the Cayman Islands, and Client consents to exclusive jurisdiction and venue in George Town, Cayman Islands, and waives all rights to litigate or arbitrate in Indian Courts or under the Arbitration and Conciliation Act 1996.`,
      clauses: [
        {
          id: "c-1.1-v2",
          section: "1.1",
          title: "Complete Statutory Warranty Disclaimer",
          category: "Performance Warranty",
          startLine: 3,
          endLine: 4,
          text: `Provider shall perform services ("Services") specified in SOW. PROVIDER EXPRESSLY DISCLAIMS ALL WARRANTIES UNDER THE INDIAN CONTRACT ACT 1872 OR ANY OTHER STATUTE.`,
          riskLevel: "High",
          riskScore: 75,
          changeType: "modified",
          params: { warrantyPeriod: "None", disclaimer: "Indian Contract Act Disclaimed" },
          summary: "Completely disclaims all statutory warranties under Indian Contract Act 1872.",
          evidence: "PROVIDER EXPRESSLY DISCLAIMS ALL WARRANTIES UNDER THE INDIAN CONTRACT ACT 1872...",
          plainExplanation: "The vendor is refusing to give any legal guarantee under the Indian Contract Act. If their software breaks your operations, you cannot claim breach of warranty.",
          recommendation: "Revert to standard Indian Contract Act warranty for professional workmanlike performance."
        },
        {
          id: "c-2.1-v2",
          section: "2.1",
          title: "Strict 7-Day Payment & 36% Interest Rate",
          category: "Payment Terms",
          startLine: 7,
          endLine: 9,
          text: `Client shall pay all invoices within seven (7) days of invoice date. Late payments shall accrue interest at 3.0% per month (36% per annum). Failure to pay within 7 days entitles Provider to immediately suspend all Services and lock Client data without prior notice.`,
          riskLevel: "High",
          riskScore: 72,
          changeType: "modified",
          params: { paymentDays: 7, lateInterestRate: "3.0%/mo (36%/yr)", suspensionRight: "Immediate + Data Lock" },
          summary: "7-day payment window with punitive 36% per annum interest and data locking rights.",
          evidence: "7-day payment term, 3.0% monthly interest (36% p.a.), and immediate data locking.",
          plainExplanation: "You only get 7 days to clear invoices. If delayed, they charge 36% annual interest and can lock your business out of your own data without notice.",
          recommendation: "Negotiate net 30 days for payment, capping late interest at 1.0%/mo (12% p.a.) and prohibiting data locking."
        },
        {
          id: "c-3.1-v2",
          section: "3.1",
          title: "6-Month Truncated Confidentiality",
          category: "Confidentiality",
          startLine: 12,
          endLine: 13,
          text: `Confidentiality obligations shall expire six (6) months after signing, notwithstanding any provisions of the DPDP Act 2023 or IT Act.`,
          riskLevel: "High",
          riskScore: 68,
          changeType: "modified",
          params: { survivalMonths: 6 },
          summary: "Confidentiality protection expires after just 6 months, undermining DPDP Act 2023 protections.",
          evidence: "Confidentiality obligations shall expire six (6) months after signing...",
          plainExplanation: "Your business secrets and customer data shared with the vendor will lose confidentiality protection after only 6 months.",
          recommendation: "Ensure confidentiality protection survives for at least 3 to 5 years post-termination, with personal data protected per DPDP Act 2023."
        },
        {
          id: "c-4.1-v2",
          section: "4.1",
          title: "Uncapped Client Indemnity for Vendor Misconduct",
          category: "Indemnification",
          startLine: 15,
          endLine: 17,
          text: `CLIENT SHALL DEFEND, INDEMNIFY AND HOLD HARMLESS PROVIDER, ITS PROMOTERS, AND SUBCONTRACTORS FROM ANY CLAIMS, LOSSES, DEMANDS, AND LEGAL FEES ARISING OUT OF THE SERVICES, EVEN IF CAUSED BY PROVIDER'S OWN WILFUL MISCONDUCT OR NEGLIGENCE.`,
          riskLevel: "Critical",
          riskScore: 98,
          changeType: "modified",
          params: { scope: "Uncapped Client indemnity covering Provider Wilful Misconduct", capped: false },
          summary: "Forces Client to pay all losses even if caused by vendor's own wilful misconduct!",
          evidence: "CLIENT SHALL INDEMNIFY... EVEN IF CAUSED BY PROVIDER'S OWN WILFUL MISCONDUCT OR NEGLIGENCE.",
          plainExplanation: "If the vendor intentionally acts maliciously or commits gross negligence, YOU are forced to pay for their legal defense and damages.",
          recommendation: "REJECT IMMEDIATELY. Require mutual indemnification under Indian law, excluding wilful misconduct."
        },
        {
          id: "c-5.2-v2",
          section: "5.2",
          title: "Token ₹50,000 Liability Cap for Vendor",
          category: "Limitation of Liability",
          startLine: 21,
          endLine: 22,
          text: `PROVIDER'S TOTAL AGGREGATE LIABILITY SHALL BE STRICTLY CAPPED AT ₹50,000 (FIFTY THOUSAND RUPEES) IN TOTAL FOR ALL CLAIMS COMBINED.`,
          riskLevel: "Critical",
          riskScore: 95,
          changeType: "modified",
          params: { capAmount: "₹50,000 INR", capScope: "All claims aggregate" },
          summary: "Caps vendor liability at a trivial ₹50,000 INR regardless of contract value.",
          evidence: "STRICTLY CAPPED AT ₹50,000 (FIFTY THOUSAND RUPEES) IN TOTAL...",
          plainExplanation: "Even on a multi-crore contract, the vendor will never pay more than ₹50,000 in total damages if they break the contract or leak data.",
          recommendation: "Cap liability mutually at 12 months fees paid (or minimum ₹50 Lakhs / ₹5 Crores depending on deal size)."
        },
        {
          id: "c-6.1-v2",
          section: "6.1",
          title: "180-Day Notice & ₹2.5 Crore Penalty Fee for Client",
          category: "Termination & Renewal",
          startLine: 24,
          endLine: 26,
          text: `Provider may terminate for convenience on three (3) days notice. Client may only terminate on one hundred eighty (180) days notice and payment of ₹25,000,000 (Rupees 2.5 Crores) cancellation penalty.`,
          riskLevel: "High",
          riskScore: 85,
          changeType: "modified",
          params: { providerNotice: "3 days", clientNotice: "180 days", penalty: "₹2.5 Crores (INR 25,000,000)" },
          summary: "Provider can exit in 3 days; Client locked for 180 days plus forced ₹2.5 Crore penalty.",
          evidence: "Provider: 3 days notice. Client: 180 days notice + ₹2.5 Crores penalty fee.",
          plainExplanation: "The vendor can leave in 3 days, but if you want to cancel, you must give 6 months notice AND pay a ₹2.5 Crore cancellation fine.",
          recommendation: "Restore mutual 60-day notice for convenience without any early termination penalty."
        },
        {
          id: "c-8.1-v2",
          section: "8.1",
          title: "Offshore Cayman Islands Forum (Stripping Indian Courts)",
          category: "Governing Law & Jurisdiction",
          startLine: 29,
          endLine: 31,
          text: `This Agreement shall be governed by the laws of the Cayman Islands, and Client consents to exclusive jurisdiction and venue in George Town, Cayman Islands, and waives all rights to litigate or arbitrate in Indian Courts or under the Arbitration and Conciliation Act 1996.`,
          riskLevel: "Critical",
          riskScore: 92,
          changeType: "modified",
          params: { governingLaw: "Cayman Islands", forum: "George Town, Cayman Islands", IndianCourtsWaived: true },
          summary: "Strips Indian courts and Indian Arbitration Act jurisdiction, forcing offshore Cayman litigation.",
          evidence: "Governed by laws of Cayman Islands... waives all rights to litigate in Indian Courts or under Arbitration Act 1996.",
          plainExplanation: "For an Indian company, forcing dispute resolution to the Cayman Islands creates prohibitive litigation costs and deprives you of Indian court protections.",
          recommendation: "Revert governing law to Republic of India with arbitration seat in Mumbai, Delhi, Bengaluru, or GIFT City under the Arbitration Act 1996."
        }
      ]
    }
  },

  {
    id: "nda-2026",
    title: "Non-Disclosure Agreement (India NDA)",
    category: "Corporate & Commercial (India)",
    v1: {
      version: "v1.0 (Mutual Indian NDA)",
      author: "Legal Operations (India)",
      date: "2026-01-10",
      fullText: `MUTUAL NON-DISCLOSURE AGREEMENT

1. PURPOSE
The parties wish to explore a potential business transaction in India ("Purpose").

2. CONFIDENTIALITY OBLIGATIONS
Each party shall hold the other party's confidential information in confidence under the Information Technology Act, 2000 and DPDP Act 2023.

3. JURISDICTION
Governed by Indian Law with jurisdiction in New Delhi, India under the Arbitration and Conciliation Act, 1996.`,
      clauses: [
        {
          id: "nda-c1",
          section: "2.0",
          title: "Mutual Confidentiality & IT Act Compliance",
          category: "Confidentiality",
          startLine: 4,
          endLine: 5,
          text: `Each party shall hold the other party's confidential information in confidence under the Information Technology Act, 2000 and DPDP Act 2023.`,
          riskLevel: "Low",
          riskScore: 10,
          summary: "Standard mutual confidentiality under Indian privacy laws."
        }
      ]
    },
    v2: {
      version: "v2.0 (Unilateral Penal NDA)",
      author: "Counterparty Legal",
      date: "2026-01-20",
      fullText: `UNILATERAL NON-DISCLOSURE AGREEMENT

1. OBLIGATIONS OF RECEIVING PARTY
Receiving Party shall hold Disclosing Party's information confidential indefinitely. Any breach shall entitle Disclosing Party to liquidated damages of ₹1,00,00,000 (Rupees 1 Crore) per disclosure under Section 74 of the Indian Contract Act 1872.

2. EXCLUSION OF DISCLOSING PARTY OBLIGATIONS
Disclosing Party owes no duty of confidentiality regarding information received from Receiving Party.`,
      clauses: [
        {
          id: "nda-c2-v2",
          section: "1.0",
          title: "Indefinite Duration & ₹1 Crore Liquidated Damages",
          category: "Confidentiality",
          startLine: 3,
          endLine: 4,
          text: `Receiving Party shall hold Disclosing Party's information confidential indefinitely. Any breach shall entitle Disclosing Party to liquidated damages of ₹1,00,00,000 (Rupees 1 Crore) per disclosure under Section 74 of the Indian Contract Act 1872.`,
          riskLevel: "Critical",
          riskScore: 90,
          changeType: "added",
          summary: "Indefinite confidentiality duration with harsh ₹1 Crore penalty per breach.",
          evidence: "Liquidated damages of ₹1,00,00,000 (Rupees 1 Crore) per disclosure under Section 74 Indian Contract Act.",
          plainExplanation: "A single inadvertent disclosure could trigger a ₹1 Crore penalty claim under Section 74 of the Indian Contract Act.",
          recommendation: "Remove liquidated damages clause. Cap liability at actual proven direct loss."
        }
      ]
    }
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONTRACT_DATASET };
}
