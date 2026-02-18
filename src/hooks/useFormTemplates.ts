import { useState, useEffect, useCallback } from 'react';
import { apiService, FormTemplate, FormField, CreateFormTemplateRequest, CreateFormFieldRequest } from '../services/apiService';

interface UseFormTemplatesOptions {
  organizationId: number | null;
  includeSystem?: boolean;
  isActive?: boolean;
}

export function useFormTemplates(options: UseFormTemplatesOptions) {
  const { organizationId, includeSystem = true, isActive } = options;
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    if (!organizationId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getFormTemplates(organizationId, includeSystem, isActive);
      setTemplates(response.templates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, [organizationId, includeSystem, isActive]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async (data: CreateFormTemplateRequest) => {
    if (!organizationId) throw new Error('Organization ID required');
    
    const response = await apiService.createFormTemplate(organizationId, data);
    setTemplates(prev => [response.template, ...prev]);
    return response.template;
  };

  const updateTemplate = async (templateId: number, data: Partial<CreateFormTemplateRequest>) => {
    const response = await apiService.updateFormTemplate(templateId, data);
    setTemplates(prev => prev.map(t => t.id === templateId ? response.template : t));
    return response.template;
  };

  const deleteTemplate = async (templateId: number) => {
    await apiService.deleteFormTemplate(templateId);
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const assignTemplateToProjects = async (templateId: number, projectIds: number[]) => {
    const response = await apiService.assignTemplateToProjects(templateId, projectIds);
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, projectAssignments: response.assignments } : t
    ));
    return response.assignments;
  };

  const applyTemplate = async (templateId: number, data: {
    projectId: number;
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    assigneeId?: number;
    dueDate?: string;
    tags?: string[];
    customFields?: Record<string, any>;
  }) => {
    if (!organizationId) throw new Error('Organization ID required');
    
    const response = await apiService.applyTemplate(templateId, {
      ...data,
      organizationId,
    });
    return response.task;
  };

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    assignTemplateToProjects,
    applyTemplate,
  };
}

export function useFormTemplate(templateId: number | null) {
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplate = useCallback(async () => {
    if (!templateId) {
      setTemplate(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getFormTemplate(templateId);
      setTemplate(response.template);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch template');
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  const addField = async (data: CreateFormFieldRequest) => {
    if (!templateId) throw new Error('Template ID required');
    
    const response = await apiService.createFormField(templateId, data);
    setTemplate(prev => prev ? {
      ...prev,
      fields: [...prev.fields, response.field].sort((a, b) => a.order - b.order)
    } : null);
    return response.field;
  };

  const updateField = async (fieldId: number, data: Partial<CreateFormFieldRequest>) => {
    const response = await apiService.updateFormField(fieldId, data);
    setTemplate(prev => prev ? {
      ...prev,
      fields: prev.fields.map(f => f.id === fieldId ? response.field : f).sort((a, b) => a.order - b.order)
    } : null);
    return response.field;
  };

  const deleteField = async (fieldId: number) => {
    await apiService.deleteFormField(fieldId);
    setTemplate(prev => prev ? {
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId)
    } : null);
  };

  const reorderFields = async (fieldOrders: { id: number; order: number }[]) => {
    if (!templateId) throw new Error('Template ID required');
    
    const response = await apiService.reorderFormFields(templateId, fieldOrders);
    setTemplate(prev => prev ? { ...prev, fields: response.fields } : null);
    return response.fields;
  };

  return {
    template,
    loading,
    error,
    refetch: fetchTemplate,
    addField,
    updateField,
    deleteField,
    reorderFields,
  };
}

export function useTaskCustomFields(taskId: number | null) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchValues = useCallback(async () => {
    if (!taskId) {
      setValues({});
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getTaskCustomFieldValues(taskId);
      const valuesMap: Record<string, any> = {};
      response.values.forEach(v => {
        valuesMap[v.fieldId] = v.value;
      });
      setValues(valuesMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch custom field values');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchValues();
  }, [fetchValues]);

  const updateValues = async (customFields: Record<string, any>) => {
    if (!taskId) throw new Error('Task ID required');
    
    const response = await apiService.updateTaskCustomFieldValues(taskId, customFields);
    const valuesMap: Record<string, any> = {};
    response.values.forEach(v => {
      valuesMap[v.fieldId] = v.value;
    });
    setValues(valuesMap);
    return response.values;
  };

  return {
    values,
    loading,
    error,
    refetch: fetchValues,
    updateValues,
  };
}
