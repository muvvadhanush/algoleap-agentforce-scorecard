// ═══════════════════════════════════════
//  Assessment Data Types & API Fetcher
//  Data is loaded from backend API
// ═══════════════════════════════════════

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ── Types ──
export interface Persona {
    id: string; icon: string; label: string; sub: string;
    color: string; bg: string; desc: string; tags: string[];
}

export interface Level {
    s: number; l: string; d: string;
}

export interface Dimension {
    id: string; name: string; icon: string; q: string; levels: Level[];
}

export interface Tier {
    min: number; label: string; color: string; bg: string;
}

export interface NextStep {
    t: string; d: string;
}

export interface AssessmentData {
    personas: Persona[];
    clouds: string[];
    dimensions: Record<string, Dimension[]>;
    tiers: Tier[];
    industryUseCases: Record<string, string[]>;
    tierDescriptions: Record<string, Record<string, string>>;
    nextSteps: Record<string, Record<string, NextStep[]>>;
}

// ── API Fetch ──
export async function fetchAssessmentData(): Promise<AssessmentData> {
    const res = await fetch(`${API_URL}/questions`);
    if (!res.ok) {
        console.warn("API fetch failed, using fallback data");
        return FALLBACK_DATA;
    }
    return res.json();
}

// ── Utility Functions (work with any data set) ──
export const getTier = (score: number, tiers: Tier[]): Tier => {
    return tiers.find(t => score >= t.min) || tiers[tiers.length - 1];
};

export const getTierDesc = (
    score: number, personaId: string,
    tierDescriptions: Record<string, Record<string, string>>
): string => {
    const tbl = tierDescriptions[personaId];
    if (!tbl) return "";
    for (const t of [28, 21, 15, 0]) {
        if (score >= t) return tbl[String(t)] || "";
    }
    return tbl["0"] || "";
};

export const getNextSteps = (
    score: number, pid: string,
    nextSteps: Record<string, Record<string, NextStep[]>>
): NextStep[] => {
    const tbl = nextSteps[pid];
    if (!tbl) return [];
    for (const t of [28, 21, 15, 0]) {
        if (score >= t) return tbl[String(t)] || [];
    }
    return tbl["0"] || [];
};

// ═══════════════════════════════════════
//  FALLBACK DATA (used when API is down)
//  This is a copy of the data from
//  backend/src/data/assessment.json
// ═══════════════════════════════════════
const FALLBACK_DATA: AssessmentData = {
    personas: [
        { id: 'business', icon: '📈', label: 'Revenue & CX Leader', sub: 'Sales · Service · Marketing · Revenue Ops', color: '#1565C0', bg: '#E3F2FD', desc: 'For leaders focused on revenue growth, customer experience, and team productivity.', tags: ['VP Sales', 'VP Customer Service', 'VP Marketing', 'CRO', 'VP Revenue Ops', 'Director Digital Channels'] },
        { id: 'technical', icon: '⚙️', label: 'Platform & Architecture Owner', sub: 'CRM · Salesforce · Enterprise Apps · Business Systems', color: '#2D5A27', bg: '#E8F5E3', desc: 'For technical leaders who own the Salesforce platform, integrations, and data architecture.', tags: ['Head of CRM', 'Salesforce Architect', 'Director Enterprise Apps', 'Head of Business Systems', 'Director CRM'] },
        { id: 'ai', icon: '🧠', label: 'AI & Innovation Leader', sub: 'AI Strategy · Automation · Digital Transformation', color: '#6A1B9A', bg: '#F3E5F5', desc: 'For leaders evaluating AI readiness and driving intelligent automation initiatives.', tags: ['Director AI/ML', 'Head of Intelligent Automation', 'Director Digital Transformation', 'Head of Innovation'] },
    ],
    clouds: ['Sales Cloud', 'Service Cloud', 'Marketing Cloud', 'Commerce Cloud', 'Experience Cloud', 'Data Cloud', 'Other'],
    dimensions: {
        business: [
            { id: 'completeness', name: 'Customer Context Availability', icon: '👤', q: 'When your reps, agents, or marketers engage a customer, do they have the full picture — or are they flying blind?', levels: [{ s: 1, l: 'Flying Blind', d: 'Reps frequently lack basic customer info.' }, { s: 2, l: 'Partial View', d: 'Some customer data exists but reps regularly need to ask.' }, { s: 3, l: 'Decent Coverage', d: 'Most records have core info, but secondary details have gaps.' }, { s: 4, l: 'Strong Context', d: 'Comprehensive customer profile available.' }, { s: 5, l: 'Full 360 View', d: 'Complete customer context at every touchpoint.' }] },
            { id: 'accuracy', name: 'Data Trust & Reliability', icon: '🎯', q: 'Do your teams trust the data in Salesforce?', levels: [{ s: 1, l: 'Low Trust', d: 'Teams distrust CRM data.' }, { s: 2, l: 'Spotty', d: 'Sometimes accurate.' }, { s: 3, l: 'Acceptable', d: 'Generally reliable.' }, { s: 4, l: 'High Trust', d: 'Source of truth.' }, { s: 5, l: 'Gold Standard', d: 'Continuously validated.' }] },
            { id: 'connectivity', name: 'Cross-Team Visibility', icon: '🔗', q: 'Can teams see each other\'s customer data?', levels: [{ s: 1, l: 'Siloed', d: 'No shared view.' }, { s: 2, l: 'Some Sharing', d: 'Few integrations.' }, { s: 3, l: 'Partial', d: 'Core systems share.' }, { s: 4, l: 'Well Connected', d: 'Good visibility.' }, { s: 5, l: 'Unified', d: 'Same view real-time.' }] },
            { id: 'identity', name: 'Customer Recognition', icon: '🪪', q: 'Is the customer recognised across channels?', levels: [{ s: 1, l: 'No Recognition', d: 'Strangers across channels.' }, { s: 2, l: 'Basic', d: 'Email matching.' }, { s: 3, l: 'Developing', d: 'Single channel.' }, { s: 4, l: 'Strong', d: 'Most touchpoints.' }, { s: 5, l: 'Seamless', d: 'Single profile.' }] },
            { id: 'semantic', name: 'Process Documentation', icon: '📋', q: 'Could an AI replicate your top performer?', levels: [{ s: 1, l: 'Tribal Knowledge', d: 'In heads only.' }, { s: 2, l: 'Informal', d: 'Outdated playbooks.' }, { s: 3, l: 'Partial', d: 'Core documented.' }, { s: 4, l: 'Well Documented', d: 'Clear processes.' }, { s: 5, l: 'AI-Transferable', d: 'Ready for AI training.' }] },
            { id: 'governance', name: 'Operational Discipline', icon: '🛡️', q: 'Who keeps data accurate over time?', levels: [{ s: 1, l: 'No Ownership', d: 'Nobody owns it.' }, { s: 2, l: 'Reactive', d: 'Fix when broken.' }, { s: 3, l: 'Emerging', d: 'Someone responsible.' }, { s: 4, l: 'Proactive', d: 'Regular reviews.' }, { s: 5, l: 'Continuous', d: 'Automated monitoring.' }] },
            { id: 'usecase', name: 'AI Vision & Readiness', icon: '🤖', q: 'Where would AI agents make the biggest impact?', levels: [{ s: 1, l: 'No Clarity', d: 'No specific ideas.' }, { s: 2, l: 'General Interest', d: 'General ideas.' }, { s: 3, l: 'Identified', d: '2-3 use cases.' }, { s: 4, l: 'Business Case Ready', d: 'ROI estimates.' }, { s: 5, l: 'Ready to Execute', d: 'Scoped and budgeted.' }] },
        ],
        technical: [
            { id: 'completeness', name: 'Data Completeness', icon: '📊', q: 'Are key objects fully populated?', levels: [{ s: 1, l: 'Critical Gaps', d: '<50% populated.' }, { s: 2, l: 'Partial', d: '50-70%.' }, { s: 3, l: 'Moderate', d: '70-85%.' }, { s: 4, l: 'Strong', d: '85-95%.' }, { s: 5, l: 'Excellent', d: '95%+.' }] },
            { id: 'accuracy', name: 'Data Accuracy', icon: '🎯', q: 'What is your duplicate rate?', levels: [{ s: 1, l: 'No Audits', d: 'No process.' }, { s: 2, l: 'Ad Hoc', d: 'Occasional.' }, { s: 3, l: 'Periodic', d: 'Quarterly.' }, { s: 4, l: 'Proactive', d: 'Monthly.' }, { s: 5, l: 'Automated', d: 'Real-time.' }] },
            { id: 'connectivity', name: 'Data Connectivity', icon: '🔗', q: 'How are systems integrated?', levels: [{ s: 1, l: 'Siloed', d: 'Disconnected.' }, { s: 2, l: 'Manual', d: 'CSV imports.' }, { s: 3, l: 'Partial', d: 'REST APIs.' }, { s: 4, l: 'Well Connected', d: 'MuleSoft.' }, { s: 5, l: 'Unified', d: 'Data Cloud.' }] },
            { id: 'identity', name: 'Identity Resolution', icon: '🪪', q: 'Can you match customers across systems?', levels: [{ s: 1, l: 'No Matching', d: 'No unified ID.' }, { s: 2, l: 'Basic', d: 'Email only.' }, { s: 3, l: 'Developing', d: 'Rules configured.' }, { s: 4, l: 'Advanced', d: 'Multi-key.' }, { s: 5, l: 'Mature', d: 'Data Cloud active.' }] },
            { id: 'semantic', name: 'Metadata Readiness', icon: '🏗️', q: 'Is your data model documented?', levels: [{ s: 1, l: 'Undocumented', d: 'No dictionary.' }, { s: 2, l: 'Informal', d: 'Outdated docs.' }, { s: 3, l: 'Documented', d: 'Partially current.' }, { s: 4, l: 'Well Structured', d: 'Conventions enforced.' }, { s: 5, l: 'AI-Ready', d: 'DMOs defined.' }] },
            { id: 'governance', name: 'Governance Maturity', icon: '🛡️', q: 'Do you have data ownership and SLAs?', levels: [{ s: 1, l: 'None', d: 'No governance.' }, { s: 2, l: 'Informal', d: 'Basic controls.' }, { s: 3, l: 'Emerging', d: 'Stewards identified.' }, { s: 4, l: 'Established', d: 'Formal program.' }, { s: 5, l: 'Optimised', d: 'CoE-driven.' }] },
            { id: 'usecase', name: 'AI Use Case Clarity', icon: '🤖', q: 'Have you identified Agentforce use cases?', levels: [{ s: 1, l: 'No Vision', d: 'No use cases.' }, { s: 2, l: 'Exploring', d: 'High-level ideas.' }, { s: 3, l: 'Defined', d: '2-3 use cases.' }, { s: 4, l: 'Validated', d: 'ROI mapped.' }, { s: 5, l: 'Ready to Build', d: 'Scoped and aligned.' }] },
        ],
        ai: [
            { id: 'completeness', name: 'Training Data', icon: '📊', q: 'Is there sufficient data for AI?', levels: [{ s: 1, l: 'Insufficient', d: 'Sparse data.' }, { s: 2, l: 'Partial', d: 'Significant gaps.' }, { s: 3, l: 'Workable', d: 'Standard scenarios OK.' }, { s: 4, l: 'Strong', d: '90%+ coverage.' }, { s: 5, l: 'AI-Optimised', d: 'Comprehensive.' }] },
            { id: 'accuracy', name: 'Data Signal Reliability', icon: '🎯', q: 'How reliable are data signals?', levels: [{ s: 1, l: 'Unreliable', d: 'Untrustworthy.' }, { s: 2, l: 'Noisy', d: 'Low confidence.' }, { s: 3, l: 'Acceptable', d: 'Mostly accurate.' }, { s: 4, l: 'High Fidelity', d: 'Clean and validated.' }, { s: 5, l: 'Precision-Grade', d: 'Minimal hallucination.' }] },
            { id: 'connectivity', name: 'Data Unification', icon: '🔗', q: 'How unified is your data landscape?', levels: [{ s: 1, l: 'Fragmented', d: '5+ disconnected.' }, { s: 2, l: 'Partial', d: 'Blind spots.' }, { s: 3, l: 'Core Connected', d: 'Primary integrated.' }, { s: 4, l: 'Broadly Unified', d: 'Central platform.' }, { s: 5, l: 'Fully Unified', d: 'Data Cloud connected.' }] },
            { id: 'identity', name: 'Entity Resolution', icon: '🪪', q: 'Can systems resolve to a single identity?', levels: [{ s: 1, l: 'No Resolution', d: 'Different entities.' }, { s: 2, l: 'Basic', d: 'Exact email only.' }, { s: 3, l: 'Improving', d: 'Multi-field.' }, { s: 4, l: 'Strong', d: 'Fuzzy logic.' }, { s: 5, l: 'Intelligent', d: 'Continuous learning.' }] },
            { id: 'semantic', name: 'Knowledge Structure', icon: '🏗️', q: 'Can AI understand your data model?', levels: [{ s: 1, l: 'Unstructured', d: 'Cryptic fields.' }, { s: 2, l: 'Loosely Structured', d: 'Inconsistent.' }, { s: 3, l: 'Structured', d: 'Well-labelled.' }, { s: 4, l: 'Semantically Rich', d: 'Documented relationships.' }, { s: 5, l: 'LLM-Optimised', d: 'DMOs defined.' }] },
            { id: 'governance', name: 'AI Governance', icon: '🛡️', q: 'Do you have AI guardrails?', levels: [{ s: 1, l: 'No Framework', d: 'No AI policy.' }, { s: 2, l: 'Ad Hoc', d: 'Basic controls.' }, { s: 3, l: 'Emerging', d: 'Starting guardrails.' }, { s: 4, l: 'Structured', d: 'Formal guardrails.' }, { s: 5, l: 'AI-Governed', d: 'Comprehensive.' }] },
            { id: 'usecase', name: 'AI Use Case Maturity', icon: '🤖', q: 'Where on the AI adoption curve?', levels: [{ s: 1, l: 'Curiosity', d: 'General interest.' }, { s: 2, l: 'Ideation', d: 'Brainstorming.' }, { s: 3, l: 'Evaluation', d: 'Under evaluation.' }, { s: 4, l: 'Planning', d: 'Prioritised.' }, { s: 5, l: 'Execution Ready', d: 'Budget allocated.' }] },
        ],
    },
    tiers: [
        { min: 28, label: 'Ready to Pilot', color: '#2D7A3A', bg: '#E8F5E3' },
        { min: 21, label: 'Foundation Strong', color: '#5B8C3F', bg: '#F0F7EC' },
        { min: 15, label: 'Gaps to Address', color: '#D4930D', bg: '#FFF8E1' },
        { min: 0, label: 'Start with Data First', color: '#C62828', bg: '#FFEBEE' },
    ],
    industryUseCases: {
        'Enterprise Services & Professional Services': ['Client 360 Agent', 'Case Deflection Automation', 'Automated Proposals', 'AI Scheduling Assistant'],
        'Manufacturing & Industrial': ['Dealer Portal Agent', 'Predictive Maintenance Agent', 'Order Management Agent'],
        'Technology & SaaS': ['Churn Prediction Agent', 'Automated Onboarding', 'Self-Service Support Agent'],
        'Financial Services & Insurance': ['Compliance Agent', 'KYC Automation', 'Claim Processing Agent', 'Advisor Assistant'],
        'Healthcare & Life Sciences': ['Patient Scheduling Agent', 'Care Plan Automation', 'Referral Management Agent'],
        'Retail & Consumer Goods': ['Personalised Shopping Agent', 'Returns Automation', 'Loyalty Programme Agent'],
    },
    tierDescriptions: {
        business: { '28': 'Your organisation has the data foundation to launch Agentforce.', '21': 'Solid base, but specific gaps could undermine AI performance.', '15': 'Meaningful gaps would limit Agentforce ROI.', '0': 'Data needs significant work before AI agents can deliver value.' },
        technical: { '28': 'Platform and data architecture are ready for Agentforce.', '21': 'Well-positioned but specific technical gaps need attention.', '15': 'Significant data architecture gaps exist.', '0': 'Substantial data infrastructure work required.' },
        ai: { '28': 'Data maturity positions you to deploy Agentforce with confidence.', '21': 'Strong ambition, closing gaps will improve reliability.', '15': 'AI vision is ahead of data reality.', '0': 'Data infrastructure not yet in place for AI.' },
    },
    nextSteps: {
        business: { '28': [{ t: 'Agent Impact Workshop', d: 'Identify highest-ROI processes.' }, { t: 'Quick-Start Pilot', d: 'First agent live in 6-8 weeks.' }, { t: 'Measure & Scale', d: 'Define success metrics.' }], '21': [{ t: 'Data Sprint', d: 'Close gaps in 2-4 weeks.' }, { t: 'Prioritise Use Cases', d: 'Align to strongest data.' }, { t: 'Phased Pilot', d: 'Start with strongest domain.' }], '15': [{ t: 'Data Readiness Assessment', d: '2-week assessment.' }, { t: 'Cross-Team Alignment', d: 'Break down silos.' }, { t: 'AI Roadmap', d: '6-12 month plan.' }], '0': [{ t: 'Full Assessment', d: 'Comprehensive data unification.' }, { t: 'CRM Health Check', d: 'Ensure Salesforce delivers value.' }, { t: 'Quick Wins', d: 'Immediate improvements.' }] },
        technical: { '28': [{ t: 'Agentforce Quick Start', d: 'Agent design in 6-8 weeks.' }, { t: 'Action Library', d: 'Build reusable actions.' }, { t: 'Advanced Architecture', d: 'Multi-agent orchestration.' }], '21': [{ t: 'Data Cloud Sprint', d: 'Close gaps in 2-4 weeks.' }, { t: 'Use Case Scoping', d: 'Design agent topics.' }, { t: 'Quick Start + Foundation', d: '8-12 week engagement.' }], '15': [{ t: 'Data Cloud Foundation', d: '4-6 week setup.' }, { t: 'Architecture Review', d: 'Assess landscape.' }, { t: 'Governance Framework', d: 'Establish ownership.' }], '0': [{ t: 'Full Assessment', d: 'Map all data sources.' }, { t: 'Data Cloud Foundation', d: '6-8 week build.' }, { t: 'Platform Optimisation', d: 'Fix technical debt.' }] },
        ai: { '28': [{ t: 'Accelerated Build', d: 'Move to agent design.' }, { t: 'AI Governance', d: 'Output monitoring.' }, { t: 'Innovation Pipeline', d: 'Use case backlog.' }], '21': [{ t: 'AI Readiness Sprint', d: 'Close data gaps.' }, { t: 'Evaluation Workshop', d: 'Validate feasibility.' }, { t: 'Pilot Design', d: 'Controlled pilot.' }], '15': [{ t: 'Data-First Strategy', d: 'Build infrastructure.' }, { t: 'AI Maturity Assessment', d: 'Evaluate readiness.' }, { t: 'Phased Roadmap', d: '6-12 month sequencing.' }], '0': [{ t: 'Data Foundation', d: 'Invest in unifying data.' }, { t: 'AI Readiness Baseline', d: 'Establish current state.' }, { t: 'Quick Win ID', d: 'Simpler automation wins.' }] },
    },
};
