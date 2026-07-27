export const PROPOSAL_DETAIL_LEVELS = ['brief', 'zones', 'detailed', 'internal'];
export const PROPOSAL_GROUPING_MODES = ['sections', 'zones', 'flat'];

export const defaultProposalOptions = {
  preset: 'zones',
  detailLevel: 'zones',
  groupingMode: 'zones',
  showZoneBreakdown: true,
  showEquipmentNames: false,
  showQuantities: true,
  showUnitPrices: false,
  showSectionPrices: true,
  showVat: true,
  includeOptionalItems: true,
  includeAssumptions: true,
  includeExclusions: true,
  includeTimeline: true,
  includeWarranty: true,
  includePaymentTerms: true
};

export const proposalPresets = {
  brief: {
    label: 'Краткое КП',
    options: { preset: 'brief', detailLevel: 'brief', groupingMode: 'sections', showZoneBreakdown: false, showEquipmentNames: false, showQuantities: false, showUnitPrices: false, showSectionPrices: true }
  },
  zones: {
    label: 'КП по зонам',
    options: { preset: 'zones', detailLevel: 'zones', groupingMode: 'zones', showZoneBreakdown: true, showEquipmentNames: false, showQuantities: true, showUnitPrices: false, showSectionPrices: true }
  },
  detailed: {
    label: 'Подробное КП',
    options: { preset: 'detailed', detailLevel: 'detailed', groupingMode: 'zones', showZoneBreakdown: true, showEquipmentNames: true, showQuantities: true, showUnitPrices: true, showSectionPrices: true }
  },
  internal: {
    label: 'Внутреннее согласование',
    options: { preset: 'internal', detailLevel: 'internal', groupingMode: 'sections', showZoneBreakdown: true, showEquipmentNames: true, showQuantities: true, showUnitPrices: true, showSectionPrices: true }
  }
};

export function normalizeProposalOptions(input = {}) {
  const base = {...defaultProposalOptions, ...(input || {})};
  if (!PROPOSAL_DETAIL_LEVELS.includes(base.detailLevel)) base.detailLevel = defaultProposalOptions.detailLevel;
  if (!PROPOSAL_GROUPING_MODES.includes(base.groupingMode)) base.groupingMode = defaultProposalOptions.groupingMode;
  base.preset = base.preset || presetFromOptions(base);
  return base;
}

export function applyProposalPreset(current = {}, preset = 'zones') {
  const presetConfig = proposalPresets[preset] || proposalPresets.zones;
  return normalizeProposalOptions({...defaultProposalOptions, ...current, ...presetConfig.options});
}

export function presetFromOptions(options = {}) {
  if (options.detailLevel === 'brief') return 'brief';
  if (options.detailLevel === 'detailed') return 'detailed';
  if (options.detailLevel === 'internal') return 'internal';
  return 'zones';
}
