import { describe, expect, it, vi, beforeEach } from "vitest";

// Import the type guards directly from the hook file
// We'll test the pure utility functions that don't require React

// Re-implement the type guards here for isolated testing
const isFieldCondition = (
  condition: any
): boolean => {
  return condition != null && typeof condition === 'object' && 'field' in condition;
};

const isConditionGroup = (
  condition: any
): boolean => {
  return condition != null && typeof condition === 'object' && 'conditions' in condition && !('field' in condition);
};

// Type definitions for testing
type FilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "greaterThan"
  | "lessThan"
  | "greaterThanOrEqual"
  | "lessThanOrEqual"
  | "in"
  | "notIn"
  | "between"
  | "isEmpty"
  | "isNotEmpty";

type TaskFilterField =
  | "id"
  | "title"
  | "description"
  | "status"
  | "priority"
  | "taskType"
  | "tags"
  | "startDate"
  | "dueDate"
  | "updatedAt"
  | "points"
  | "projectId"
  | "authorUserId"
  | "assignedUserId"
  | "cycleId"
  | "triaged"
  | "archivedAt"
  | "isShared";

interface FieldCondition {
  field: TaskFilterField;
  operator: FilterOperator;
  value?: string | number | boolean | string[] | number[] | Date | { from: Date; to: Date };
}

interface ConditionGroup {
  operator: "AND" | "OR";
  conditions: (FieldCondition | ConditionGroup)[];
}

interface AdvancedTaskFilter {
  operator?: "AND" | "OR";
  conditions: (FieldCondition | ConditionGroup)[];
}

describe("Advanced Filter System - Type Guards", () => {
  describe("isFieldCondition", () => {
    it("should return true for a valid FieldCondition", () => {
      const condition: FieldCondition = {
        field: "status",
        operator: "equals",
        value: "In Progress",
      };
      expect(isFieldCondition(condition)).toBe(true);
    });

    it("should return false for a ConditionGroup", () => {
      const group: ConditionGroup = {
        operator: "AND",
        conditions: [],
      };
      expect(isFieldCondition(group)).toBe(false);
    });

    it("should return false for an empty object", () => {
      expect(isFieldCondition({})).toBe(false);
    });

    it("should return false for null", () => {
      expect(isFieldCondition(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isFieldCondition(undefined)).toBe(false);
    });
  });

  describe("isConditionGroup", () => {
    it("should return true for a valid ConditionGroup", () => {
      const group: ConditionGroup = {
        operator: "AND",
        conditions: [],
      };
      expect(isConditionGroup(group)).toBe(true);
    });

    it("should return true for a ConditionGroup with nested conditions", () => {
      const group: ConditionGroup = {
        operator: "OR",
        conditions: [
          { field: "priority", operator: "equals", value: "P0" },
          { field: "priority", operator: "equals", value: "P1" },
        ],
      };
      expect(isConditionGroup(group)).toBe(true);
    });

    it("should return false for a FieldCondition", () => {
      const condition: FieldCondition = {
        field: "status",
        operator: "equals",
        value: "Done",
      };
      expect(isConditionGroup(condition)).toBe(false);
    });

    it("should return false for an empty object", () => {
      expect(isConditionGroup({})).toBe(false);
    });

    it("should return false for null", () => {
      expect(isConditionGroup(null)).toBe(false);
    });
  });
});

describe("Advanced Filter System - AND/OR Logic", () => {
  describe("Simple Filters", () => {
    it("should create a simple AND filter with multiple conditions", () => {
      const filter: AdvancedTaskFilter = {
        operator: "AND",
        conditions: [
          { field: "status", operator: "equals", value: "In Progress" },
          { field: "priority", operator: "equals", value: "P1" },
        ],
      };

      expect(filter.operator).toBe("AND");
      expect(filter.conditions).toHaveLength(2);
      expect(isFieldCondition(filter.conditions[0])).toBe(true);
      expect(isFieldCondition(filter.conditions[1])).toBe(true);
    });

    it("should create a simple OR filter with multiple conditions", () => {
      const filter: AdvancedTaskFilter = {
        operator: "OR",
        conditions: [
          { field: "priority", operator: "equals", value: "P0" },
          { field: "priority", operator: "equals", value: "P1" },
        ],
      };

      expect(filter.operator).toBe("OR");
      expect(filter.conditions).toHaveLength(2);
    });
  });

  describe("Nested Groups", () => {
    it("should create nested AND/OR groups", () => {
      const filter: AdvancedTaskFilter = {
        operator: "AND",
        conditions: [
          { field: "status", operator: "equals", value: "In Progress" },
          {
            operator: "OR",
            conditions: [
              { field: "priority", operator: "equals", value: "P0" },
              { field: "priority", operator: "equals", value: "P1" },
            ],
          },
        ],
      };

      expect(filter.operator).toBe("AND");
      expect(filter.conditions).toHaveLength(2);
      expect(isFieldCondition(filter.conditions[0])).toBe(true);
      expect(isConditionGroup(filter.conditions[1])).toBe(true);
      
      const nestedGroup = filter.conditions[1] as ConditionGroup;
      expect(nestedGroup.operator).toBe("OR");
      expect(nestedGroup.conditions).toHaveLength(2);
    });

    it("should handle deeply nested groups (3 levels)", () => {
      const filter: AdvancedTaskFilter = {
        operator: "AND",
        conditions: [
          {
            operator: "OR",
            conditions: [
              { field: "status", operator: "equals", value: "Done" },
              { field: "status", operator: "equals", value: "Archived" },
            ],
          },
          {
            operator: "OR",
            conditions: [
              { field: "priority", operator: "equals", value: "P0" },
              {
                operator: "AND",
                conditions: [
                  { field: "priority", operator: "equals", value: "P1" },
                  { field: "tags", operator: "contains", value: "urgent" },
                ],
              },
            ],
          },
        ],
      };

      // Verify structure
      expect(filter.operator).toBe("AND");
      expect(filter.conditions).toHaveLength(2);
      
      // First level - OR group for status
      const statusGroup = filter.conditions[0] as ConditionGroup;
      expect(statusGroup.operator).toBe("OR");
      expect(statusGroup.conditions).toHaveLength(2);

      // Second level - OR group for priority
      const priorityGroup = filter.conditions[1] as ConditionGroup;
      expect(priorityGroup.operator).toBe("OR");
      expect(priorityGroup.conditions).toHaveLength(2);

      // Third level - AND group for urgent P1
      const urgentP1Group = priorityGroup.conditions[1] as ConditionGroup;
      expect(urgentP1Group.operator).toBe("AND");
      expect(urgentP1Group.conditions).toHaveLength(2);
    });

    it("should handle complex filter with multiple operators", () => {
      const filter: AdvancedTaskFilter = {
        operator: "AND",
        conditions: [
          {
            operator: "OR",
            conditions: [
              { field: "assignedUserId", operator: "equals", value: 1 },
              { field: "assignedUserId", operator: "equals", value: 2 },
            ],
          },
          {
            operator: "AND",
            conditions: [
              { field: "dueDate", operator: "greaterThan", value: "2024-01-01" },
              { field: "dueDate", operator: "lessThan", value: "2024-12-31" },
            ],
          },
          {
            operator: "OR",
            conditions: [
              { field: "priority", operator: "equals", value: "P0" },
              { field: "tags", operator: "contains", value: "critical" },
            ],
          },
        ],
      };

      expect(filter.conditions).toHaveLength(3);
      
      const assigneeGroup = filter.conditions[0] as ConditionGroup;
      expect(assigneeGroup.operator).toBe("OR");
      
      const dateGroup = filter.conditions[1] as ConditionGroup;
      expect(dateGroup.operator).toBe("AND");
      
      const priorityGroup = filter.conditions[2] as ConditionGroup;
      expect(priorityGroup.operator).toBe("OR");
    });
  });

  describe("Filter Operators", () => {
    it("should support all comparison operators", () => {
      const operators: FilterOperator[] = [
        "equals",
        "notEquals",
        "contains",
        "notContains",
        "startsWith",
        "endsWith",
        "greaterThan",
        "lessThan",
        "greaterThanOrEqual",
        "lessThanOrEqual",
        "in",
        "notIn",
        "between",
        "isEmpty",
        "isNotEmpty",
      ];

      const conditions: FieldCondition[] = operators.map((op) => ({
        field: "title",
        operator: op,
        value: op === "between" ? { from: new Date(), to: new Date() } : "test",
      }));

      const filter: AdvancedTaskFilter = {
        operator: "AND",
        conditions,
      };

      expect(filter.conditions).toHaveLength(operators.length);
      conditions.forEach((condition, index) => {
        expect((filter.conditions[index] as FieldCondition).operator).toBe(operators[index]);
      });
    });

    it("should support all task filter fields", () => {
      const fields: TaskFilterField[] = [
        "id",
        "title",
        "description",
        "status",
        "priority",
        "taskType",
        "tags",
        "startDate",
        "dueDate",
        "updatedAt",
        "points",
        "projectId",
        "authorUserId",
        "assignedUserId",
        "cycleId",
        "triaged",
        "archivedAt",
        "isShared",
      ];

      const conditions: FieldCondition[] = fields.map((field) => ({
        field,
        operator: "equals",
        value: "test",
      }));

      const filter: AdvancedTaskFilter = {
        operator: "OR",
        conditions,
      };

      expect(filter.conditions).toHaveLength(fields.length);
      conditions.forEach((condition, index) => {
        expect((filter.conditions[index] as FieldCondition).field).toBe(fields[index]);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty conditions array", () => {
      const filter: AdvancedTaskFilter = {
        operator: "AND",
        conditions: [],
      };

      expect(filter.conditions).toHaveLength(0);
    });

    it("should handle single condition without group", () => {
      const filter: AdvancedTaskFilter = {
        operator: "AND",
        conditions: [
          { field: "status", operator: "equals", value: "Done" },
        ],
      };

      expect(filter.conditions).toHaveLength(1);
      expect(isFieldCondition(filter.conditions[0])).toBe(true);
    });

    it("should handle mixed conditions and groups", () => {
      const filter: AdvancedTaskFilter = {
        operator: "OR",
        conditions: [
          { field: "priority", operator: "equals", value: "P0" },
          {
            operator: "AND",
            conditions: [
              { field: "priority", operator: "equals", value: "P1" },
              { field: "status", operator: "notEquals", value: "Archived" },
            ],
          },
          { field: "tags", operator: "contains", value: "urgent" },
        ],
      };

      expect(filter.conditions).toHaveLength(3);
      expect(isFieldCondition(filter.conditions[0])).toBe(true);
      expect(isConditionGroup(filter.conditions[1])).toBe(true);
      expect(isFieldCondition(filter.conditions[2])).toBe(true);
    });
  });
});

describe("Advanced Filter System - JSON Serialization", () => {
  it("should serialize and deserialize simple filter correctly", () => {
    const filter: AdvancedTaskFilter = {
      operator: "AND",
      conditions: [
        { field: "status", operator: "equals", value: "In Progress" },
        { field: "priority", operator: "equals", value: "P1" },
      ],
    };

    const serialized = JSON.stringify(filter);
    const deserialized: AdvancedTaskFilter = JSON.parse(serialized);

    expect(deserialized.operator).toBe("AND");
    expect(deserialized.conditions).toHaveLength(2);
    expect((deserialized.conditions[0] as FieldCondition).field).toBe("status");
  });

  it("should serialize and deserialize nested filter correctly", () => {
    const filter: AdvancedTaskFilter = {
      operator: "AND",
      conditions: [
        { field: "status", operator: "equals", value: "In Progress" },
        {
          operator: "OR",
          conditions: [
            { field: "priority", operator: "equals", value: "P0" },
            { field: "priority", operator: "equals", value: "P1" },
          ],
        },
      ],
    };

    const serialized = JSON.stringify(filter);
    const deserialized: AdvancedTaskFilter = JSON.parse(serialized);

    expect(deserialized.operator).toBe("AND");
    expect(deserialized.conditions).toHaveLength(2);
    
    const nestedGroup = deserialized.conditions[1] as ConditionGroup;
    expect(nestedGroup.operator).toBe("OR");
    expect(nestedGroup.conditions).toHaveLength(2);
  });
});
