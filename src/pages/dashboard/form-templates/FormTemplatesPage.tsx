import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  Copy,
  LayoutTemplate,
  ChevronDown,
  Check,
  X,
  GripVertical,
  Settings,
  FileText,
  Layers,
  Calendar,
  Hash,
  ToggleLeft,
  Link,
  Mail,
  List,
  AlignLeft,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  FolderOpen,
} from 'lucide-react';
import { useFormTemplates, useFormTemplate } from '@/hooks/useFormTemplates';
import { useAuth } from '@/app/authProvider';
import { useDebounce } from '@/hooks/useDebounce';
import { apiService, FormTemplate, FormField, FormFieldType } from '@/services/apiService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Field type icons mapping
const fieldTypeIcons: Record<FormFieldType, React.ReactNode> = {
  text: <FileText className="h-4 w-4" />,
  textarea: <AlignLeft className="h-4 w-4" />,
  number: <Hash className="h-4 w-4" />,
  date: <Calendar className="h-4 w-4" />,
  select: <List className="h-4 w-4" />,
  multiselect: <Layers className="h-4 w-4" />,
  checkbox: <ToggleLeft className="h-4 w-4" />,
  url: <Link className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
};

const fieldTypeLabels: Record<FormFieldType, string> = {
  text: 'Text',
  textarea: 'Long Text',
  number: 'Number',
  date: 'Date',
  select: 'Dropdown',
  multiselect: 'Multi-select',
  checkbox: 'Checkbox',
  url: 'URL',
  email: 'Email',
};

interface TemplateFormData {
  name: string;
  description: string;
  isActive: boolean;
}

interface FieldFormData {
  name: string;
  fieldType: FormFieldType;
  isRequired: boolean;
  helpText: string;
  placeholder: string;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  options?: { value: string; label: string }[];
}

const defaultFieldFormData: FieldFormData = {
  name: '',
  fieldType: 'text',
  isRequired: false,
  helpText: '',
  placeholder: '',
  options: [],
};

const FormTemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrganization } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const { templates, loading, error, refetch, createTemplate, updateTemplate, deleteTemplate } = useFormTemplates({
    organizationId: activeOrganization?.id || null,
    includeSystem: true,
  });

  const { template: selectedTemplate, loading: templateLoading, addField, updateField, deleteField, reorderFields } = useFormTemplate(selectedTemplateId);

  const [templateFormData, setTemplateFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    isActive: true,
  });

  const [fieldFormData, setFieldFormData] = useState<FieldFormData>(defaultFieldFormData);

  // Filter templates based on search and tab
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                         template.description?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesTab = activeTab === 'all' ? true :
                      activeTab === 'system' ? template.isSystem :
                      activeTab === 'custom' ? !template.isSystem :
                      activeTab === 'active' ? template.isActive :
                      !template.isActive;
    return matchesSearch && matchesTab;
  });

  // Handlers
  const handleCreateTemplate = async () => {
    try {
      await createTemplate(templateFormData);
      toast.success('Template created successfully');
      setIsCreateModalOpen(false);
      setTemplateFormData({ name: '', description: '', isActive: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create template');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplateId) return;
    try {
      await updateTemplate(selectedTemplateId, templateFormData);
      toast.success('Template updated successfully');
      setIsEditModalOpen(false);
      setSelectedTemplateId(null);
      setTemplateFormData({ name: '', description: '', isActive: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update template');
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplateId) return;
    try {
      await deleteTemplate(selectedTemplateId);
      toast.success('Template deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedTemplateId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete template');
    }
  };

  const openEditModal = (template: FormTemplate) => {
    setSelectedTemplateId(template.id);
    setTemplateFormData({
      name: template.name,
      description: template.description || '',
      isActive: template.isActive,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (templateId: number) => {
    setSelectedTemplateId(templateId);
    setIsDeleteModalOpen(true);
  };

  const handleAddField = async () => {
    if (!selectedTemplateId) return;
    try {
      await addField(fieldFormData);
      toast.success('Field added successfully');
      setIsFieldModalOpen(false);
      setFieldFormData(defaultFieldFormData);
      setEditingField(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add field');
    }
  };

  const handleUpdateField = async () => {
    if (!editingField) return;
    try {
      await updateField(editingField.id, fieldFormData);
      toast.success('Field updated successfully');
      setIsFieldModalOpen(false);
      setFieldFormData(defaultFieldFormData);
      setEditingField(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update field');
    }
  };

  const handleDeleteField = async (fieldId: number) => {
    if (!confirm('Are you sure you want to delete this field?')) return;
    try {
      await deleteField(fieldId);
      toast.success('Field deleted successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete field');
    }
  };

  const openFieldModal = (field?: FormField) => {
    if (field) {
      setEditingField(field);
      setFieldFormData({
        name: field.name,
        fieldType: field.fieldType,
        isRequired: field.isRequired,
        helpText: field.helpText || '',
        placeholder: field.placeholder || '',
        minLength: field.minLength,
        maxLength: field.maxLength,
        minValue: field.minValue,
        maxValue: field.maxValue,
        options: field.options?.map(o => ({ value: o.value, label: o.label })) || [],
      });
    } else {
      setEditingField(null);
      setFieldFormData(defaultFieldFormData);
    }
    setIsFieldModalOpen(true);
  };

  const handleMoveField = async (fieldId: number, direction: 'up' | 'down') => {
    if (!selectedTemplate || !selectedTemplate.fields) return;
    
    const fields = [...selectedTemplate.fields].sort((a, b) => a.order - b.order);
    const index = fields.findIndex(f => f.id === fieldId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    
    // Swap orders
    const temp = fields[index].order;
    fields[index].order = fields[newIndex].order;
    fields[newIndex].order = temp;
    
    try {
      await reorderFields(fields.map(f => ({ id: f.id, order: f.order })));
      toast.success('Field order updated');
    } catch (err) {
      toast.error('Failed to reorder fields');
    }
  };

  const addOption = () => {
    setFieldFormData(prev => ({
      ...prev,
      options: [...(prev.options || []), { value: '', label: '' }],
    }));
  };

  const updateOption = (index: number, key: 'value' | 'label', value: string) => {
    setFieldFormData(prev => ({
      ...prev,
      options: prev.options?.map((opt, i) => i === index ? { ...opt, [key]: value } : opt) || [],
    }));
  };

  const removeOption = (index: number) => {
    setFieldFormData(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || [],
    }));
  };

  const duplicateTemplate = async (template: FormTemplate) => {
    try {
      await createTemplate({
        name: `${template.name} (Copy)`,
        description: template.description,
        isActive: template.isActive,
        fields: template.fields.map(f => ({
          name: f.name,
          fieldType: f.fieldType,
          isRequired: f.isRequired,
          helpText: f.helpText,
          placeholder: f.placeholder,
          order: f.order,
          minLength: f.minLength,
          maxLength: f.maxLength,
          minValue: f.minValue,
          maxValue: f.maxValue,
          options: f.options,
        })),
      });
      toast.success('Template duplicated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to duplicate template');
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load templates</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Form Templates</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage structured task templates with custom fields
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted" />
              <CardContent className="h-20" />
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <LayoutTemplate className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">No templates found</h3>
          <p className="text-muted-foreground mt-1">
            {searchQuery ? 'Try adjusting your search' : 'Create your first template to get started'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsCreateModalOpen(true)} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <Card 
              key={template.id} 
              className={cn(
                "group cursor-pointer transition-all hover:shadow-md",
                selectedTemplateId === template.id && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedTemplateId(template.id === selectedTemplateId ? null : template.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <LayoutTemplate className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {template.isSystem && (
                          <Badge variant="secondary" className="text-xs">System</Badge>
                        )}
                        <Badge variant={template.isActive ? "default" : "secondary"} className="text-xs">
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditModal(template); }}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); duplicateTemplate(template); }}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      {!template.isSystem && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); openDeleteModal(template.id); }}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {template.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {template.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Layers className="h-4 w-4" />
                    {template.fields.length} fields
                  </span>
                  {template.projectAssignments?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <FolderOpen className="h-4 w-4" />
                      {template.projectAssignments.length} projects
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Template Detail Panel */}
      {selectedTemplateId && selectedTemplate && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedTemplate.name}</CardTitle>
                <CardDescription>
                  {selectedTemplate.description || 'No description'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditModal(selectedTemplate)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Template
                </Button>
                <Button size="sm" onClick={() => openFieldModal()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedTemplate.fields.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                <Layers className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No fields yet</p>
                <Button variant="link" onClick={() => openFieldModal()}>
                  Add your first field
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedTemplate.fields
                  .sort((a, b) => a.order - b.order)
                  .map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          disabled={index === 0}
                          onClick={() => handleMoveField(field.id, 'up')}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          disabled={index === selectedTemplate.fields.length - 1}
                          onClick={() => handleMoveField(field.id, 'down')}
                        >
                          <ChevronDownIcon className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                        {fieldTypeIcons[field.fieldType]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{field.name}</span>
                          {field.isRequired && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{fieldTypeLabels[field.fieldType]}</span>
                          {field.helpText && (
                            <span className="truncate">• {field.helpText}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => openFieldModal(field)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteField(field.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Template Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setTemplateFormData({ name: '', description: '', isActive: true });
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditModalOpen ? 'Edit Template' : 'Create Template'}</DialogTitle>
            <DialogDescription>
              {isEditModalOpen ? 'Update your form template details' : 'Create a new form template for structured task creation'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={templateFormData.name}
                onChange={(e) => setTemplateFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Bug Report, Feature Request"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={templateFormData.description}
                onChange={(e) => setTemplateFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this template is for..."
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={templateFormData.isActive}
                onCheckedChange={(checked) => setTemplateFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateModalOpen(false);
              setIsEditModalOpen(false);
              setTemplateFormData({ name: '', description: '', isActive: true });
            }}>
              Cancel
            </Button>
            <Button 
              onClick={isEditModalOpen ? handleUpdateTemplate : handleCreateTemplate}
              disabled={!templateFormData.name.trim()}
            >
              {isEditModalOpen ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTemplate}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Field Modal */}
      <Dialog open={isFieldModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsFieldModalOpen(false);
          setFieldFormData(defaultFieldFormData);
          setEditingField(null);
        }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingField ? 'Edit Field' : 'Add Field'}</DialogTitle>
            <DialogDescription>
              {editingField ? 'Update field configuration' : 'Add a custom field to your template'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fieldName">Field Name *</Label>
              <Input
                id="fieldName"
                value={fieldFormData.name}
                onChange={(e) => setFieldFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Priority, Severity, Steps to Reproduce"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fieldType">Field Type *</Label>
              <Select
                value={fieldFormData.fieldType}
                onValueChange={(value: FormFieldType) => setFieldFormData(prev => ({ ...prev, fieldType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="textarea">Long Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="select">Dropdown</SelectItem>
                  <SelectItem value="multiselect">Multi-select</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="helpText">Help Text</Label>
              <Input
                id="helpText"
                value={fieldFormData.helpText}
                onChange={(e) => setFieldFormData(prev => ({ ...prev, helpText: e.target.value }))}
                placeholder="Additional context for this field..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder</Label>
              <Input
                id="placeholder"
                value={fieldFormData.placeholder}
                onChange={(e) => setFieldFormData(prev => ({ ...prev, placeholder: e.target.value }))}
                placeholder="Hint text shown when empty..."
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isRequired">Required Field</Label>
              <Switch
                id="isRequired"
                checked={fieldFormData.isRequired}
                onCheckedChange={(checked) => setFieldFormData(prev => ({ ...prev, isRequired: checked }))}
              />
            </div>

            {/* Type-specific options */}
            {(fieldFormData.fieldType === 'text' || fieldFormData.fieldType === 'textarea') && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minLength">Min Length</Label>
                  <Input
                    id="minLength"
                    type="number"
                    value={fieldFormData.minLength || ''}
                    onChange={(e) => setFieldFormData(prev => ({ ...prev, minLength: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLength">Max Length</Label>
                  <Input
                    id="maxLength"
                    type="number"
                    value={fieldFormData.maxLength || ''}
                    onChange={(e) => setFieldFormData(prev => ({ ...prev, maxLength: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder="255"
                  />
                </div>
              </div>
            )}

            {fieldFormData.fieldType === 'number' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minValue">Min Value</Label>
                  <Input
                    id="minValue"
                    type="number"
                    value={fieldFormData.minValue || ''}
                    onChange={(e) => setFieldFormData(prev => ({ ...prev, minValue: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxValue">Max Value</Label>
                  <Input
                    id="maxValue"
                    type="number"
                    value={fieldFormData.maxValue || ''}
                    onChange={(e) => setFieldFormData(prev => ({ ...prev, maxValue: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  />
                </div>
              </div>
            )}

            {(fieldFormData.fieldType === 'select' || fieldFormData.fieldType === 'multiselect') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-2">
                  {fieldFormData.options?.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="Value"
                        value={option.value}
                        onChange={(e) => updateOption(index, 'value', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Label"
                        value={option.label}
                        onChange={(e) => updateOption(index, 'label', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {(!fieldFormData.options || fieldFormData.options.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No options added. Click "Add Option" to create some.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsFieldModalOpen(false);
              setFieldFormData(defaultFieldFormData);
              setEditingField(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={editingField ? handleUpdateField : handleAddField}
              disabled={!fieldFormData.name.trim() || 
                ((fieldFormData.fieldType === 'select' || fieldFormData.fieldType === 'multiselect') && 
                 (!fieldFormData.options || fieldFormData.options.length === 0))}
            >
              {editingField ? 'Update' : 'Add'} Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormTemplatesPage;
