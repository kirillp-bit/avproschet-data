import { buildClientProposalView } from '../engine/proposalBuilder.js';
import { ProposalPreview } from '../components/ProposalPreview.js';
import { escapeHtml } from '../utils/format.js';
import { downloadText } from '../utils/dom.js';

export function proposalHtml(project, settings = null, proposalOptions = null) {
  const view = buildClientProposalView(project, settings, proposalOptions);
  return ProposalPreview(view);
}

export function buildStandaloneProposalHtml(project, settings = null, proposalOptions = null) {
  const view = buildClientProposalView(project, settings, proposalOptions);
  const doc = ProposalPreview(view);
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(view.documentInfo.title)} · ${escapeHtml(view.projectInfo.name)}</title><style>${standaloneStyles()}</style></head><body>${doc}<script>window.addEventListener('load',()=>document.body.classList.add('ready'));</script></body></html>`;
}

export function downloadProposalHtml(project, settings = null, proposalOptions = null) {
  downloadText(safeFileName(`AVPROSCHET_${project.name || 'proposal'}_${dateStamp()}.html`), buildStandaloneProposalHtml(project, settings, proposalOptions), 'text/html');
}

function standaloneStyles() {
  return `body{margin:0;background:#eef1f4;color:#101410;font:14px/1.5 Arial,sans-serif}.proposalDocument{max-width:980px;margin:28px auto;background:white;padding:42px;border-radius:24px;box-shadow:0 20px 70px rgba(0,0,0,.12)}.proposalCover{display:grid;grid-template-columns:220px 1fr;gap:32px;border-bottom:3px solid #5eb0ff;padding-bottom:24px;margin-bottom:24px}.proposalLogo{display:flex;gap:12px;align-items:center}.proposalLogo span{width:58px;height:58px;border-radius:18px;background:#5eb0ff;display:grid;place-items:center;font-weight:900}.proposalLogo strong{font-size:24px}.proposalMeta h1{margin:0;font-size:34px}.proposalMeta p{font-size:20px;margin:8px 0 18px}.proposalMeta dl{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:0}.proposalMeta div{border:1px solid #dde3ea;border-radius:14px;padding:10px}.proposalMeta dt{color:#5f6b7a;font-size:12px}.proposalMeta dd{margin:0;font-weight:700}.proposalSection{margin:26px 0}.proposalSection h2{font-size:22px;margin:0 0 12px}.proposalSection h3{margin:0 0 8px}.proposalTable{width:100%;border-collapse:collapse;margin-bottom:14px}.proposalTable th,.proposalTable td{border:1px solid #dde3ea;padding:9px;text-align:left;vertical-align:top}.proposalTable th{background:#f2f5f8}.proposalTable tfoot td{font-weight:800}.zoneBreakdown,.financialGrid,.timelineGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.proposalZone,.financialGrid div,.timelineGrid div,.proposalNotice{border:1px solid #dde3ea;border-radius:16px;padding:12px}.proposalZone{display:flex;justify-content:space-between;gap:12px}.proposalZone small,.financialGrid span,.timelineGrid span,.muted{color:#5f6b7a}.financialGrid .accent{background:#5eb0ff;border-color:#3d8fd9}.financialGrid strong{font-size:20px}.termsGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.proposalFooter{border-top:1px solid #dde3ea;margin-top:30px;padding-top:14px;display:flex;justify-content:space-between;color:#5f6b7a}.proposalRequisites{border:1px solid #dde3ea;border-radius:16px;padding:14px;margin-top:26px;background:#f5f8fb;break-inside:avoid}.proposalRequisites h3{margin:0 0 8px;font-size:14px}.proposalRequisites p{margin:3px 0;font-size:12px;color:#5f6b7a}.pageAvoid{break-inside:avoid}@page{size:A4;margin:14mm}@media print{body{background:white}.proposalDocument{box-shadow:none;margin:0;max-width:none;border-radius:0;padding:0}.pageAvoid{break-inside:avoid}.proposalCover{break-inside:avoid}}@media(max-width:760px){.proposalDocument{margin:0;border-radius:0;padding:18px}.proposalCover,.zoneBreakdown,.financialGrid,.timelineGrid,.termsGrid,.proposalMeta dl{grid-template-columns:1fr}}`;
}

export function safeFileName(name) {
  return String(name).replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, '_').slice(0, 140);
}
export function dateStamp(date = new Date()) { return date.toISOString().slice(0,10); }
