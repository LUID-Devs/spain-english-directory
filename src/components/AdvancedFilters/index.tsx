// Advanced Filters Components
// Provides both the legacy flat filter UI and the new nested group builder

export { AdvancedFilters } from './index-original';
export { AdvancedFilters as AdvancedFiltersLegacy } from './index-original';
export { AdvancedFilterBuilder } from '../AdvancedFilterBuilder';

// Default export is the new builder with nested group support
export { AdvancedFilterBuilder as default } from '../AdvancedFilterBuilder';

// Re-export AdvancedFiltersV2 for advanced AND/OR filtering
export { AdvancedFiltersV2 } from './index-v2';
