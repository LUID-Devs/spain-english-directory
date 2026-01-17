
import React, { useState, useRef } from "react";
import {
  useGetTaskAttachmentsQuery,
  useUploadAttachmentMutation,
  useDeleteAttachmentMutation,
  Attachment
} from "@/hooks/useApi";
import { useCurrentUser } from "@/stores/userStore";
import { useAuth } from "@/app/authProvider";
import { format } from "date-fns";
import {
  Paperclip,
  Upload,
  Download,
  Trash2,
  File,
  Image,
  FileText,
  FileAudio,
  FileVideo,
  Archive,
  X
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AttachmentsSectionProps {
  taskId: number;
}

const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({ taskId }) => {
  const { data: attachments, isLoading, error } = useGetTaskAttachmentsQuery(taskId);
  const [uploadAttachment, { isLoading: isUploading }] = useUploadAttachmentMutation();
  const [deleteAttachment, { isLoading: isDeleting }] = useDeleteAttachmentMutation();

  const auth = useAuth();
  const currentUserId = auth.user?.userId;

  // Get current user's database info to compare userId for ownership
  const { currentUser } = useCurrentUser();

  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList) => {
    if (!currentUserId) return;

    for (const file of Array.from(files)) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadedById', currentUserId);

      // Set upload progress - define progressKey outside try/catch
      const progressKey = `${file.name}-${Date.now()}`;
      setUploadProgress(prev => ({ ...prev, [progressKey]: 0 }));

      try {
        await uploadAttachment({ taskId, formData }).unwrap();

        // No refetch needed - optimistic update handles this

        // Clear progress on success
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[progressKey];
          return newProgress;
        });
      } catch (error) {
        console.error("Failed to upload attachment:", error);
        alert(`Failed to upload "${file.name}". Please try again.`);

        // Clear progress on error
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[progressKey];
          return newProgress;
        });
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDeleteAttachment = async (attachment: Attachment) => {
    if (!currentUserId) return;

    if (window.confirm(`Are you sure you want to delete "${attachment.fileName}"?`)) {
      try {
        await deleteAttachment({
          attachmentId: attachment.id,
          userId: currentUserId,
          taskId
        }).unwrap();

        // No refetch needed - optimistic update handles this
      } catch (error) {
        console.error("Failed to delete attachment:", error);
        alert("Failed to delete attachment. Please try again.");
      }
    }
  };

  const handleDownload = (attachment: Attachment) => {
    const downloadUrl = `${import.meta.env.VITE_API_BASE_URL}/attachments/${attachment.id}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = attachment.fileName || 'attachment';
    link.click();
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName?.toLowerCase().split('.').pop();

    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <Image className="h-4 w-4" aria-hidden="true" />;
      case 'pdf':
        return <FileText className="h-4 w-4" aria-hidden="true" />;
      case 'mp3':
      case 'wav':
      case 'ogg':
        return <FileAudio className="h-4 w-4" aria-hidden="true" />;
      case 'mp4':
      case 'mov':
      case 'avi':
        return <FileVideo className="h-4 w-4" aria-hidden="true" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive className="h-4 w-4" aria-hidden="true" />;
      default:
        return <File className="h-4 w-4" aria-hidden="true" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
        <p className="text-destructive">Failed to load attachments</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Paperclip className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground">
          Attachments ({attachments?.length || 0})
        </h3>
      </div>

      {/* Upload Area - Compact Version */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary/50"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex items-center justify-center gap-2">
          <Upload className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Drop files or{" "}
            <span className="text-primary hover:underline">browse</span>
            {" "}(max 10MB)
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.mp4,.mov,.mp3,.wav"
        />
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([key, progress]) => (
            <div key={key} className="bg-muted rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">
                  Uploading...
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ))}
        </div>
      )}

      {/* Attachments List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-8 h-8 bg-muted-foreground/20 rounded"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                    <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : attachments && attachments.length > 0 ? (
          attachments.map((attachment) => (
            <AttachmentItem
              key={attachment.id}
              attachment={attachment}
              currentUserId={currentUser?.userId}
              onDownload={() => handleDownload(attachment)}
              onDelete={() => handleDeleteAttachment(attachment)}
              isDeleting={isDeleting}
              getFileIcon={getFileIcon}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <Paperclip className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" aria-hidden="true" />
            <p className="text-muted-foreground">No attachments yet</p>
            <p className="text-sm text-muted-foreground/70">
              Upload files to share with your team
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface AttachmentItemProps {
  attachment: Attachment;
  currentUserId?: number;
  onDownload: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  getFileIcon: (fileName: string) => React.ReactNode;
}

const AttachmentItem: React.FC<AttachmentItemProps> = ({
  attachment,
  currentUserId,
  onDownload,
  onDelete,
  isDeleting,
  getFileIcon,
}) => {
  const isOwner = currentUserId && attachment.uploadedBy.userId === currentUserId;

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-accent transition-colors">
      {/* File Icon */}
      <div className="flex-shrink-0 p-2 bg-background rounded-lg">
        {getFileIcon(attachment.fileName)}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-foreground truncate">
            {attachment.fileName}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Uploaded by {attachment.uploadedBy.username}</span>
          {/* Add timestamp if available */}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onDownload}
          className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
          title="Download"
          aria-label="Download attachment"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
        </button>

        {isOwner && (
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 text-destructive hover:text-destructive/80 rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50"
            title="Delete"
            aria-label="Delete attachment"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AttachmentsSection;
