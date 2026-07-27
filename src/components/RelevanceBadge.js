import { escapeHtml } from '../utils/format.js';
import { getRelevanceBadge } from '../engine/catalogRelevance.js';

export function RelevanceBadge(item = {}) {
  const badge = getRelevanceBadge(item.relevance || item.catalogScope);
  const score = item.relevanceScore === undefined ? '' : ` · ${Number(item.relevanceScore).toFixed(0)}`;
  const title = item.relevanceReason ? ` title="${escapeHtml(item.relevanceReason)}"` : '';
  return `<span class="badge ${escapeHtml(badge.tone)}"${title}>${escapeHtml(badge.label)}${escapeHtml(score)}</span>`;
}
