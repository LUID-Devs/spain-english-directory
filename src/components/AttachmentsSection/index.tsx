"use client";

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
          userId: currentUserId 
        }).unwrap();
      } catch (error) {
        console.error("Failed to delete attachment:", error);
        alert("Failed to delete attachment. Please try again.");
      }
    }
  };

  const handleDownload = (attachment: Attachment) => {
    const downloadUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/attachments/${attachment.id}`;
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
        return <Image className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'mp3':
      case 'wav':
      case 'ogg':
        return <FileAudio className="h-4 w-4" />;
      case 'mp4':
      case 'mov':
      case 'avi':
        return <FileVideo className="h-4 w-4" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
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
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">Failed to load attachments</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Paperclip className="h-5 w-5 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Attachments ({attachments?.length || 0})
        </h3>
      </div>

      {/* Upload Area - Compact Version */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex items-center justify-center gap-2">
          <Upload className="h-5 w-5 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Drop files or{" "}
            <span className="text-blue-500 hover:text-blue-600">browse</span>
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
            <div key={key} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Uploading...
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
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
                <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
            <Paperclip className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No attachments yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
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
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      {/* File Icon */}
      <div className="flex-shrink-0 p-2 bg-white dark:bg-gray-700 rounded-lg">
        {getFileIcon(attachment.fileName)}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-gray-900 dark:text-white truncate">
            {attachment.fileName}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Uploaded by {attachment.uploadedBy.username}</span>
          {/* Add timestamp if available */}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onDownload}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Download"
        >
          <Download className="h-4 w-4" />
        </button>
        
        {isOwner && (
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AttachmentsSection;