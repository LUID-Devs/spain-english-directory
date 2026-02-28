// Advanced Filters with AND/OR Logic
// This module provides powerful filtering capabilities with nested condition groups

// V1: Client-side only filtering (legacy, backward compatible)
export { AdvancedFilters as default } from "./index-original";
export { AdvancedFilters } from "./index-original";
export type { FilterCriteria, FilterType, SavedFilter, DateRange } from "./index-original";

// V2: Full server-side AND/OR logic with nested groups
export { AdvancedFiltersV2 } from "./index-v2";
export type { AdvancedTaskFilter, FieldCondition, ConditionGroup, FilterOperator, TaskFilterField } from "@/services/advancedFilterApi";
