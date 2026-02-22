import React from 'react';
import { FormField, FormFieldOption } from '../services/apiService';

interface CustomFieldRendererProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2',
  lg: 'px-4 py-3 text-lg',
};

export const CustomFieldRenderer: React.FC<CustomFieldRendererProps> = ({
  field,
  value,
  onChange,
  disabled = false,
  size = 'md',
}) => {
  const baseInputClass = `w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

  const renderLabel = () => (
    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
      {field.name}
      {field.isRequired && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  const renderHelpText = () => {
    if (!field.helpText) return null;
    return (
      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{field.helpText}</p>
    );
  };

  const renderValidationError = () => {
    // Validation is handled at the form level
    return null;
  };

  switch (field.fieldType) {
    case 'text':
      return (
        <div className="space-y-1">
          {renderLabel()}
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={baseInputClass}
            minLength={field.minLength}
            maxLength={field.maxLength}
          />
          {renderHelpText()}
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-1">
          {renderLabel()}
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={`${baseInputClass} min-h-[100px] resize-y`}
            minLength={field.minLength}
            maxLength={field.maxLength}
          />
          {renderHelpText()}
        </div>
      );

    case 'number':
      return (
        <div className="space-y-1">
          {renderLabel()}
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
            placeholder={field.placeholder}
            disabled={disabled}
            className={baseInputClass}
            min={field.minValue}
            max={field.maxValue}
          />
          {renderHelpText()}
        </div>
      );

    case 'date':
      return (
        <div className="space-y-1">
          {renderLabel()}
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
            className={baseInputClass}
          />
          {renderHelpText()}
        </div>
      );

    case 'select':
      return (
        <div className="space-y-1">
          {renderLabel()}
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
            className={baseInputClass}
          >
            <option value="">Select...</option>
            {field.options?.map((option: FormFieldOption) => (
              <option key={option.id || option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {renderHelpText()}
        </div>
      );

    case 'multiselect':
      const selectedValues = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-1">
          {renderLabel()}
          <div className={`${baseInputClass} max-h-[150px] overflow-y-auto`}>
            {field.options?.map((option: FormFieldOption) => (
              <label
                key={option.id || option.value}
                className="flex items-center gap-2 py-1 px-1 hover:bg-[var(--color-surface-hover)] rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selectedValues, option.value]);
                    } else {
                      onChange(selectedValues.filter((v: string) => v !== option.value));
                    }
                  }}
                  disabled={disabled}
                  className="rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                />
                <span className="text-sm text-[var(--color-text-primary)]">{option.label}</span>
              </label>
            ))}
          </div>
          {renderHelpText()}
        </div>
      );

    case 'checkbox':
      return (
        <div className="space-y-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
            />
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              {field.name}
              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
            </span>
          </label>
          {renderHelpText()}
        </div>
      );

    case 'url':
      return (
        <div className="space-y-1">
          {renderLabel()}
          <input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || 'https://...'}
            disabled={disabled}
            className={baseInputClass}
          />
          {renderHelpText()}
        </div>
      );

    case 'email':
      return (
        <div className="space-y-1">
          {renderLabel()}
          <input
            type="email"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || 'email@example.com'}
            disabled={disabled}
            className={baseInputClass}
          />
          {renderHelpText()}
        </div>
      );

    default:
      return (
        <div className="text-sm text-[var(--color-text-tertiary)]">
          Unknown field type: {field.fieldType}
        </div>
      );
  }
};

// Display-only version for read-only views
interface CustomFieldDisplayProps {
  field: FormField;
  value: any;
}

export const CustomFieldDisplay: React.FC<CustomFieldDisplayProps> = ({ field, value }) => {
  const displayValue = () => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-[var(--color-text-tertiary)] italic">—</span>;
    }

    switch (field.fieldType) {
      case 'checkbox':
        return value ? 'Yes' : 'No';
      
      case 'select':
        const option = field.options?.find((o: FormFieldOption) => o.value === value);
        return option?.label || value;
      
      case 'multiselect':
        const values = Array.isArray(value) ? value : [value];
        return values.map((v: string) => {
          const opt = field.options?.find((o: FormFieldOption) => o.value === v);
          return opt?.label || v;
        }).join(', ');
      
      case 'url':
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] hover:underline"
          >
            {value}
          </a>
        );
      
      case 'email':
        return (
          <a
            href={`mailto:${value}`}
            className="text-[var(--color-accent)] hover:underline"
          >
            {value}
          </a>
        );
      
      default:
        return String(value);
    }
  };

  return (
    <div className="py-2">
      <dt className="text-sm font-medium text-[var(--color-text-secondary)]">{field.name}</dt>
      <dd className="mt-1 text-sm text-[var(--color-text-primary)]">{displayValue()}</dd>
    </div>
  );
};

export default CustomFieldRenderer;
