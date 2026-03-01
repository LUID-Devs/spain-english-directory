/** Form field types supported in form templates */
export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'url'
  | 'email';

/** Option for select/multiselect fields */
export interface FormFieldOption {
  id?: number;
  label: string;
  value: string;
  color?: string;
  order?: number;
}

/** Form field definition */
export interface FormField {
  id: number;
  templateId: number;
  name: string;
  key: string;
  fieldType: FormFieldType;
  description?: string;
  isRequired: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  regexPattern?: string;
  placeholder?: string;
  helpText?: string;
  order: number;
  defaultValue?: any;
  options: FormFieldOption[];
  createdAt: string;
  updatedAt: string;
}

/** Project assignment for a form template */
export interface FormTemplateProjectAssignment {
  id: number;
  templateId: number;
  projectId: number;
  createdAt: string;
  project?: {
    id: number;
    name: string;
  };
}

/** Form Template entity */
export interface FormTemplate {
  id: number;
  name: string;
  description?: string;
  organizationId: number;
  isActive: boolean;
  isSystem: boolean;
  defaultStatus?: string;
  defaultPriority: string;
  defaultAssigneeId?: number;
  fields: FormField[];
  projectAssignments: FormTemplateProjectAssignment[];
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    userId: number;
    username: string;
    profilePictureUrl?: string;
  };
}

/** Create form template request */
export interface CreateFormTemplateRequest {
  name: string;
  description?: string;
  defaultStatus?: string;
  defaultPriority?: string;
  defaultAssigneeId?: number;
  isActive?: boolean;
  fields?: CreateFormFieldRequest[];
  projectIds?: number[];
}

/** Create form field request */
export interface CreateFormFieldRequest {
  name: string;
  key?: string;
  fieldType: FormFieldType;
  description?: string;
  isRequired?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  regexPattern?: string;
  placeholder?: string;
  helpText?: string;
  order?: number;
  defaultValue?: any;
  options?: FormFieldOption[];
}

/** Update form template request */
export interface UpdateFormTemplateRequest {
  name?: string;
  description?: string;
  defaultStatus?: string;
  defaultPriority?: string;
  defaultAssigneeId?: number;
  isActive?: boolean;
}

/** Update form field request */
export interface UpdateFormFieldRequest {
  name?: string;
  key?: string;
  description?: string;
  isRequired?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  regexPattern?: string;
  placeholder?: string;
  helpText?: string;
  order?: number;
  defaultValue?: any;
  options?: FormFieldOption[];
}

/** Apply template to create task request */
export interface ApplyTemplateRequest {
  projectId: number;
  organizationId: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assigneeId?: number;
  customFieldValues?: Record<string, any>;
}

/** Validation result for form template */
export interface FormTemplateValidationResult {
  valid: boolean;
  error?: string;
}

/** Pagination options for listing templates */
export interface TemplatePaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

/** Filter options for listing templates */
export interface TemplateFilterOptions {
  isActive?: boolean;
  isSystem?: boolean;
  projectId?: number;
  searchQuery?: string;
}

/** List templates response */
export interface ListTemplatesResponse {
  success: boolean;
  templates: FormTemplate[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/** Field reorder request */
export interface ReorderFieldsRequest {
  fieldOrders: { id: number; order: number }[];
}
