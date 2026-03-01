import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  GripVertical, 
  Save,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService, CreateFormFieldRequest } from '@/services/apiService';
import { useAuth } from '@/app/authProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FieldEditorProps {
  field: Partial<CreateFormFieldRequest> & { tempId?: string };
  index: number;
  onUpdate: (index: number, updates: Partial<CreateFormFieldRequest>) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
}

const FIELD_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select' },
  { value: 'multiselect', label: 'Multi Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'url', label: 'URL' },
  { value: 'email', label: 'Email' },
];

const PRIORITY_OPTIONS = [
  { value: 'P0', label: 'P0 - Urgent' },
  { value: 'P1', label: 'P1 - High' },
  { value: 'P2', label: 'P2 - Medium' },
  { value: 'P3', label: 'P3 - Low' },
];

function FieldEditor({ field, index, onUpdate, onRemove, onMove, isFirst, isLast }: FieldEditorProps) {
  const [isExpanded, setIsExpanded] = useState(!field.name);
  const needsOptions = field.fieldType === 'select' || field.fieldType === 'multiselect';

  const addOption = () => {
    const currentOptions = field.options || [];
    onUpdate(index, {
      options: [...currentOptions, { label: `Option ${currentOptions.length + 1}`, value: `option_${currentOptions.length + 1}` }]
    });
  };

  const updateOption = (optIndex: number, updates: { label?: string; value?: string }) => {
    const currentOptions = field.options || [];
    const newOptions = [...currentOptions];
    newOptions[optIndex] = { ...newOptions[optIndex], ...updates };
    onUpdate(index, { options: newOptions });
  };

  const removeOption = (optIndex: number) => {
    const currentOptions = field.options || [];
    onUpdate(index, { options: currentOptions.filter((_, i) => i !== optIndex) });
  };

  return (
    <Card className="mb-4">
      <CardHeader className="py-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              disabled={isFirst}
              onClick={() => onMove(index, 'up')}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              disabled={isLast}
              onClick={() => onMove(index, 'down')}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          
          <GripVertical className="h-5 w-5 text-[var(--color-text-tertiary)]" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[var(--color-text-primary)]">
                {field.name || 'Untitled Field'}
              </span>
              {field.isRequired && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {FIELD_TYPE_OPTIONS.find(t => t.value === field.fieldType)?.label || field.fieldType}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => onRemove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Field Name *</Label>
              <Input
                value={field.name || ''}
                onChange={(e) => onUpdate(index, { name: e.target.value })}
                placeholder="e.g., Steps to Reproduce"
              />
            </div>

            <div>
              <Label>Field Type *</Label>
              <Select
                value={field.fieldType}
                onValueChange={(value) => onUpdate(index, { fieldType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={field.isRequired || false}
                  onCheckedChange={(checked) => onUpdate(index, { isRequired: checked })}
                />
                <Label>Required Field</Label>
              </div>
            </div>

            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={field.description || ''}
                onChange={(e) => onUpdate(index, { description: e.target.value })}
                placeholder="Help text to guide users"
                rows={2}
              />
            </div>

            <div>
              <Label>Placeholder</Label>
              <Input
                value={field.placeholder || ''}
                onChange={(e) => onUpdate(index, { placeholder: e.target.value })}
                placeholder="e.g., Enter the reproduction steps..."
              />
            </div>

            <div>
              <Label>Help Text</Label>
              <Input
                value={field.helpText || ''}
                onChange={(e) => onUpdate(index, { helpText: e.target.value })}
                placeholder="Additional guidance"
              />
            </div>

            {needsOptions && (
              <div className="md:col-span-2">
                <Label>Options</Label>
                <div className="space-y-2 mt-2">
                  {(field.options || []).map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <Input
                        value={option.label}
                        onChange={(e) => updateOption(optIndex, { label: e.target.value })}
                        placeholder="Label"
                        className="flex-1"
                      />
                      <Input
                        value={option.value}
                        onChange={(e) => updateOption(optIndex, { value: e.target.value })}
                        placeholder="Value"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => removeOption(optIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function FormTemplateBuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isEditing = !!id;

  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [defaultPriority, setDefaultPriority] = useState('P2');
  const [isActive, setIsActive] = useState(true);
  const [fields, setFields] = useState<(Partial<CreateFormFieldRequest> & { tempId: string })[]>([]);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isEditing && id) {
      loadTemplate(parseInt(id, 10));
    }
  }, [id]);

  const loadTemplate = async (templateId: number) => {
    try {
      setIsLoading(true);
      const result = await apiService.getFormTemplate(templateId);
      const template = result.template;

      setTemplateName(template.name);
      setTemplateDescription(template.description || '');
      setDefaultPriority(template.defaultPriority || 'P2');
      setIsActive(template.isActive);
      setFields(template.fields.map((field) => ({
        ...field,
        tempId: `field-${field.id}`,
      })));
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Failed to load template');
      navigate('/dashboard/form-templates');
    } finally {
      setIsLoading(false);
    }
  };

  const addField = () => {
    const newField: Partial<CreateFormFieldRequest> & { tempId: string } = {
      tempId: `temp-${Date.now()}`,
      name: '',
      fieldType: 'text',
      isRequired: false,
      order: fields.length,
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<CreateFormFieldRequest>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setFields(newFields);
  };

  const validate = (): boolean => {
    const newErrors: string[] = [];

    if (!templateName.trim()) {
      newErrors.push('Template name is required');
    }

    fields.forEach((field, index) => {
      if (!field.name?.trim()) {
        newErrors.push(`Field ${index + 1}: Name is required`);
      }
      if ((field.fieldType === 'select' || field.fieldType === 'multiselect') && (!field.options || field.options.length === 0)) {
        newErrors.push(`Field ${index + 1} (${field.name || 'Untitled'}): Select fields must have at least one option`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    if (!user?.organizationId) {
      toast.error('You must be logged in to save templates');
      return;
    }

    setIsSaving(true);

    try {
      const templateData = {
        name: templateName.trim(),
        description: templateDescription.trim() || undefined,
        defaultPriority,
        isActive,
        fields: fields.map((field, index) => ({
          name: field.name!,
          fieldType: field.fieldType!,
          description: field.description,
          isRequired: field.isRequired,
          minLength: field.minLength,
          maxLength: field.maxLength,
          minValue: field.minValue,
          maxValue: field.maxValue,
          regexPattern: field.regexPattern,
          placeholder: field.placeholder,
          helpText: field.helpText,
          order: index,
          defaultValue: field.defaultValue,
          options: field.options,
        })),
      };

      if (isEditing && id) {
        await apiService.updateFormTemplate(parseInt(id, 10), {
          name: templateData.name,
          description: templateData.description,
          defaultPriority: templateData.defaultPriority,
          isActive: templateData.isActive,
        });
        toast.success('Template updated successfully');
      } else {
        await apiService.createFormTemplate(user.organizationId, templateData);
        toast.success('Template created successfully');
      }

      navigate('/dashboard/form-templates');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--color-surface)] rounded w-1/4"></div>
          <div className="h-32 bg-[var(--color-surface)] rounded"></div>
          <div className="h-64 bg-[var(--color-surface)] rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/form-templates')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              {isEditing ? 'Edit Template' : 'Create Template'}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Please fix the following errors:</span>
          </div>
          <ul className="list-disc list-inside text-sm text-red-600">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Bug Report Template"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Describe when and how this template should be used"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Default Priority</Label>
                  <Select value={defaultPriority} onValueChange={setDefaultPriority}>
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Form Fields
              </h2>
              <Button onClick={addField} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-12 bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-lg">
                <p className="text-[var(--color-text-secondary)] mb-4">
                  No fields added yet. Add fields to your template.
                </p>
                <Button onClick={addField} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Field
                </Button>
              </div>
            ) : (
              <div>
                {fields.map((field, index) => (
                  <FieldEditor
                    key={field.tempId}
                    field={field}
                    index={index}
                    onUpdate={updateField}
                    onRemove={removeField}
                    onMove={moveField}
                    isFirst={index === 0}
                    isLast={index === fields.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
              Preview
            </h3>
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium mb-4">{templateName || 'Untitled Template'}</h4>
                <div className="space-y-3">
                  {fields.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-tertiary)]">
                      No fields added yet.
                    </p>
                  ) : (
                    fields.map((field, i) => (
                      <div key={i} className="text-sm">
                        <span className="text-[var(--color-text-secondary)]">
                          {field.name || 'Untitled'}
                          {field.isRequired && <span className="text-red-500">*</span>}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
