import React from 'react';
import { useUploadQueueStore, UploadItem } from '@/stores/uploadQueueStore';
import { 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle, 
  RotateCcw, 
  File,
  Image,
  Paperclip,
  Loader2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Individual upload item component
const UploadItemRow: React.FC<{
  upload: UploadItem;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
}> = ({ upload, onCancel, onRetry }) => {
  const getIcon = () => {
    switch (upload.type) {
      case 'comment-image':
      case 'description-image':
        return <Image className="h-4 w-4" />;
      case 'attachment':
        return <Paperclip className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const getStatusIcon = () => {
    switch (upload.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'retrying':
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (upload.status) {
      case 'completed':
        return 'Done';
      case 'failed':
        return upload.retryCount >= upload.maxRetries ? 'Failed' : `Retrying (${upload.retryCount}/${upload.maxRetries})`;
      case 'retrying':
        return `Retrying ${upload.retryCount}/${upload.maxRetries}...`;
      case 'uploading':
        return `${upload.progress}%`;
      case 'pending':
        return 'Waiting...';
      default:
        return '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isDone = upload.status === 'completed';
  const isFailed = upload.status === 'failed' && upload.retryCount >= upload.maxRetries;
  const canRetry = upload.status === 'failed' && upload.retryCount < upload.maxRetries;
  const canCancel = upload.status === 'pending' || upload.status === 'uploading';

  return (
    <div className={cn(
      "flex items-center gap-3 p-2 rounded-lg transition-colors",
      isDone && "bg-green-50/50 dark:bg-green-950/20",
      isFailed && "bg-destructive/5"
    )}>
      {/* Icon */}
      <div className="flex-shrink-0 p-1.5 bg-muted rounded-md">
        {getIcon()}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {upload.file.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(upload.file.size)} • {getStatusText()}
        </p>
        
        {/* Progress bar for active uploads */}
        {(upload.status === 'uploading' || upload.status === 'retrying') && (
          <Progress 
            value={upload.progress} 
            className="h-1 mt-1.5"
          />
        )}
        
        {/* Error message */}
        {isFailed && upload.error && (
          <p className="text-xs text-destructive mt-1 truncate">
            {upload.error}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {canRetry && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onRetry(upload.id)}
            title="Retry upload"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
        
        {canCancel && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onCancel(upload.id)}
            title="Cancel upload"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
        
        {getStatusIcon()}
      </div>
    </div>
  );
};

// Main upload progress component
export const UploadProgressIndicator: React.FC = () => {
  const uploads = useUploadQueueStore((state) => state.uploads);
  const removeUpload = useUploadQueueStore((state) => state.removeUpload);
  const retryUpload = useUploadQueueStore((state) => state.retryUpload);
  const clearCompleted = useUploadQueueStore((state) => state.clearCompleted);

  // Don't show if no uploads
  if (uploads.length === 0) {
    return null;
  }

  const activeUploads = uploads.filter(u => 
    u.status === 'uploading' || u.status === 'pending' || u.status === 'retrying'
  );
  const completedUploads = uploads.filter(u => u.status === 'completed');
  const failedUploads = uploads.filter(u => 
    u.status === 'failed' && u.retryCount >= u.maxRetries
  );
  
  const totalProgress = uploads.length > 0
    ? Math.round(uploads.reduce((sum, u) => sum + u.progress, 0) / uploads.length)
    : 0;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
      <div className="bg-background border rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {activeUploads.length > 0 
                ? `Uploading ${activeUploads.length} file${activeUploads.length !== 1 ? 's' : ''}...`
                : completedUploads.length > 0 && failedUploads.length === 0
                  ? 'All uploads complete'
                  : 'Uploads finished'
              }
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {activeUploads.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {totalProgress}%
              </span>
            )}
            
            {completedUploads.length > 0 && activeUploads.length === 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={clearCompleted}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Overall progress bar for active uploads */}
        {activeUploads.length > 0 && (
          <div className="px-3 pt-2">
            <Progress value={totalProgress} className="h-1" />
          </div>
        )}

        {/* Upload list */}
        <div className="max-h-64 overflow-y-auto p-2 space-y-1">
          {uploads.map((upload) => (
            <UploadItemRow
              key={upload.id}
              upload={upload}
              onCancel={removeUpload}
              onRetry={retryUpload}
            />
          ))}
        </div>

        {/* Summary footer */}
        {(completedUploads.length > 0 || failedUploads.length > 0) && activeUploads.length === 0 && (
          <div className="px-3 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
            {completedUploads.length > 0 && (
              <span className="text-green-600 dark:text-green-400">
                {completedUploads.length} succeeded
              </span>
            )}
            {completedUploads.length > 0 && failedUploads.length > 0 && ' • '}
            {failedUploads.length > 0 && (
              <span className="text-destructive">
                {failedUploads.length} failed
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Compact version for inline use
export const CompactUploadIndicator: React.FC<{
  uploadIds: string[];
  className?: string;
}> = ({ uploadIds, className }) => {
  const uploads = useUploadQueueStore((state) => 
    state.uploads.filter(u => uploadIds.includes(u.id))
  );

  if (uploads.length === 0) {
    return null;
  }

  const totalProgress = uploads.length > 0
    ? Math.round(uploads.reduce((sum, u) => sum + u.progress, 0) / uploads.length)
    : 0;

  const hasFailed = uploads.some(u => u.status === 'failed' && u.retryCount >= u.maxRetries);
  const isComplete = uploads.every(u => u.status === 'completed');
  const isActive = uploads.some(u => u.status === 'uploading' || u.status === 'pending');

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {isComplete ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : hasFailed ? (
        <AlertCircle className="h-4 w-4 text-destructive" />
      ) : (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      )}
      
      <div className="flex-1">
        <Progress value={totalProgress} className="h-1.5 w-20" />
      </div>
      
      <span className="text-xs text-muted-foreground">
        {totalProgress}%
      </span>
    </div>
  );
};

// Hook for using the progress indicator
export function useUploadProgress() {
  const uploads = useUploadQueueStore((state) => state.uploads);
  
  return {
    UploadProgressIndicator,
    hasActiveUploads: uploads.some(u => 
      u.status === 'uploading' || u.status === 'pending'
    ),
    uploadCount: uploads.length,
  };
}
