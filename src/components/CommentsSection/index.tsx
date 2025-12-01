
import React, { useState, useRef, useCallback } from "react";
import {
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useUploadCommentImageMutation,
  Comment
} from "@/hooks/useApi";
import { useGetTaskCommentsQuery } from "@/hooks/useApi";
import { useCurrentUser } from "@/stores/userStore";
import { useAuth } from "@/app/authProvider";
import { format } from "date-fns";
import { MessageSquare, Send, Edit3, Trash2, X, Check, Image, Loader2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';


interface CommentsSectionProps {
  taskId: number;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ taskId }) => {
  const { data: comments, isLoading, error, refetch } = useGetTaskCommentsQuery(taskId);
  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();
  const [uploadCommentImage] = useUploadCommentImageMutation();

  const auth = useAuth();
  const currentUserId = auth.user?.userId;

  // Get current user's database info to compare userId for ownership
  const { currentUser } = useCurrentUser();

  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  // Image paste state
  const [pastedImage, setPastedImage] = useState<{ file: File; preview: string } | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle paste event for images
  const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          // Create preview URL
          const preview = URL.createObjectURL(file);
          setPastedImage({ file, preview });

          // Upload image immediately
          setIsUploadingImage(true);
          try {
            const formData = new FormData();
            formData.append('image', file);
            const result = await uploadCommentImage({ formData });
            const response = await result.unwrap();
            setUploadedImageUrl(response.imageUrl);
          } catch (error) {
            console.error("Failed to upload image:", error);
            // Clear preview on error
            URL.revokeObjectURL(preview);
            setPastedImage(null);
          } finally {
            setIsUploadingImage(false);
          }
        }
        break;
      }
    }
  }, [uploadCommentImage]);

  // Remove pasted image
  const handleRemoveImage = useCallback(() => {
    if (pastedImage?.preview) {
      URL.revokeObjectURL(pastedImage.preview);
    }
    setPastedImage(null);
    setUploadedImageUrl(null);
  }, [pastedImage]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasText = newComment.trim().length > 0;
    const hasImage = uploadedImageUrl !== null;

    if ((!hasText && !hasImage) || !currentUserId) return;

    try {
      const result = await createComment({
        taskId,
        text: newComment.trim(),
        userId: currentUserId, // Send cognitoId, backend will resolve to database userId
        imageUrl: uploadedImageUrl || undefined,
      });
      await result.unwrap();
      setNewComment("");
      handleRemoveImage();
      refetch();
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  };

  const handleSaveEdit = async (commentId: number) => {
    if (!editingText.trim() || !currentUserId) return;

    try {
      const result = await updateComment({
        commentId,
        text: editingText.trim(),
        userId: currentUserId, // Send cognitoId, backend will resolve to database userId
      });
      await result.unwrap();
      setEditingCommentId(null);
      setEditingText("");
      refetch();
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!currentUserId) return;

    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        const result = await deleteComment({ commentId, userId: currentUserId }); // Send cognitoId, backend will resolve to database userId
        await result.unwrap();
        refetch();
      } catch (error) {
        console.error("Failed to delete comment:", error);
      }
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">Failed to load comments</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Comments ({comments?.length || 0})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onPaste={handlePaste}
            placeholder="Add a comment... (paste an image with Ctrl+V)"
            rows={3}
            maxLength={1000}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-secondary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {newComment.length}/1000
          </div>
        </div>

        {/* Pasted Image Preview */}
        {pastedImage && (
          <div className="relative inline-block">
            <img
              src={pastedImage.preview}
              alt="Pasted image preview"
              className="max-h-40 rounded-lg border border-gray-300 dark:border-gray-600"
            />
            {isUploadingImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            )}
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Image className="h-4 w-4" />
            Paste image with Ctrl+V
          </div>
          <button
            type="submit"
            disabled={(!newComment.trim() && !uploadedImageUrl) || isCreating || isUploadingImage}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            {isCreating ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUser?.userId}
              isEditing={editingCommentId === comment.id}
              editingText={editingText}
              onEditingTextChange={setEditingText}
              onEdit={() => handleEditComment(comment)}
              onSaveEdit={() => handleSaveEdit(comment.id)}
              onCancelEdit={handleCancelEdit}
              onDelete={() => handleDeleteComment(comment.id)}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No comments yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Be the first to add a comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface CommentItemProps {
  comment: Comment;
  currentUserId?: number;
  isEditing: boolean;
  editingText: string;
  onEditingTextChange: (text: string) => void;
  onEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  isEditing,
  editingText,
  onEditingTextChange,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  isUpdating,
  isDeleting,
}) => {
  const isOwner = currentUserId === comment.userId;
  const timeAgo = format(new Date(comment.createdAt), "PPp");

  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {comment.user.profilePictureUrl ? (
          <img
            src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${comment.user.profilePictureUrl}`}
            alt={comment.user.username}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {comment.user.username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-gray-900 dark:text-white">
            {comment.user.username}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {timeAgo}
          </span>
          {comment.createdAt !== comment.updatedAt && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              (edited)
            </span>
          )}
        </div>

        {/* Comment Text and Image */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editingText}
              onChange={(e) => onEditingTextChange(e.target.value)}
              rows={3}
              maxLength={1000}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-secondary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={onSaveEdit}
                disabled={!editingText.trim() || isUpdating}
                className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 text-sm"
              >
                <Check className="h-3 w-3" />
                {isUpdating ? "Saving..." : "Save"}
              </button>
              <button
                onClick={onCancelEdit}
                disabled={isUpdating}
                className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {comment.text && (
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {comment.text}
              </div>
            )}
            {comment.imageUrl && (
              <a
                href={`${API_BASE_URL}${comment.imageUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={`${API_BASE_URL}${comment.imageUrl}`}
                  alt="Comment attachment"
                  className="max-w-full max-h-64 rounded-lg border border-gray-200 dark:border-gray-700 hover:opacity-90 transition-opacity cursor-pointer"
                />
              </a>
            )}
          </div>
        )}

        {/* Actions */}
        {isOwner && !isEditing && (
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Edit3 className="h-3 w-3" />
              Edit
            </button>
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3 w-3" />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;