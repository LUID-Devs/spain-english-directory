import React, { useState } from 'react';
import { FormTemplate, FormField } from '../services/apiService';
import { CustomFieldRenderer } from './CustomFieldRenderer';

interface FormTemplateSelectorProps {
  templates: FormTemplate[];
  selectedTemplateId: number | null;
  onSelectTemplate: (templateId: number | null) => void;
  customFieldValues: Record<string, any>;
  onCustomFieldChange: (fieldId: number, value: any) => void;
  disabled?: boolean;
}

export const FormTemplateSelector: React.FC<FormTemplateSelectorProps> = ({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  customFieldValues,
  onCustomFieldChange,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  
  // Filter templates that have at least one custom field
  const templatesWithFields = templates.filter(t => t.fields.length > 0);
  
  if (templatesWithFields.length === 0) {
    return null; // Don't show if no templates with fields
  }

  return (
    <div className="space-y-4">
      <div className="border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] p-4">
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
          Task Template (Optional)
        </label>
        
        <select
          value={selectedTemplateId || ''}
          onChange={(e) => onSelectTemplate(e.target.value ? Number(e.target.value) : null)}
          disabled={disabled}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        >
          <option value="">No template (standard task)</option>
          {templatesWithFields.map(template => (
            <option key={template.id} value={template.id}>
              {template.name} {template.isSystem ? '(System)' : ''}
            </option>
          ))}
        </select>
        
        {selectedTemplate && (
          <p className="mt-2 text-sm text-[var(--color-text-tertiary)]">
            {selectedTemplate.description || `${selectedTemplate.fields.length} custom field(s)`}
          </p>
        )}
      </div>

      {selectedTemplate && selectedTemplate.fields.length > 0 && (
        <div className="border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-[var(--color-text-primary)]">
              Custom Fields
            </h4>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
          
          {(isExpanded || selectedTemplate.fields.length <= 3) && (
            <div className="space-y-4">
              {selectedTemplate.fields
                .sort((a, b) => a.order - b.order)
                .map((field: FormField) => (
                  <CustomFieldRenderer
                    key={field.id}
                    field={field}
                    value={customFieldValues[field.id]}
                    onChange={(value) => onCustomFieldChange(field.id, value)}
                    disabled={disabled}
                  />
                ))}
            </div>
          )}
          
          {!isExpanded && selectedTemplate.fields.length > 3 && (
            <p className="text-sm text-[var(--color-text-tertiary)]">
              {selectedTemplate.fields.length} fields hidden. Click Expand to see all.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Compact version for inline use
interface CompactTemplateSelectorProps {
  templates: FormTemplate[];
  selectedTemplateId: number | null;
  onSelectTemplate: (templateId: number | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const CompactTemplateSelector: React.FC<CompactTemplateSelectorProps> = ({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  disabled = false,
  placeholder = 'Select a template...',
}) => {
  return (
    <select
      value={selectedTemplateId || ''}
      onChange={(e) => onSelectTemplate(e.target.value ? Number(e.target.value) : null)}
      disabled={disabled}
      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
    >
      <option value="">{placeholder}</option>
      {templates.map(template => (
        <option key={template.id} value={template.id}>
          {template.name} {template.isSystem ? '(System)' : ''} - {template.fields.length} field(s)
        </option>
      ))}
    </select>
  );
};

export default FormTemplateSelector;
