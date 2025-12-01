
import React, { useState, useCallback } from "react";
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
import RichTextEditor from "@/components/RichTextEditor";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';


interface CommentsSectionProps {
  taskId: number;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ taskId }) => {
  const { data: comments, isLoading, error } = useGetTaskCommentsQuery(taskId);
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Handle image upload for rich text editor
  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const result = await uploadCommentImage({ formData });
      const response = await result.unwrap();
      toast.success("Image uploaded");
      return response.imageUrl;
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error("Failed to upload image");
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  }, [uploadCommentImage]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    // Check if content has actual text or images (not just empty HTML tags)
    const hasContent = newComment.trim().length > 0 && newComment !== '<p></p>';

    if (!hasContent || !currentUserId) return;

    try {
      const result = await createComment({
        taskId,
        text: newComment,
        userId: currentUserId,
      });
      await result.unwrap();
      setNewComment("");
      // No refetch needed - optimistic update handles this
    } catch (error) {
      console.error("Failed to create comment:", error);
      toast.error("Failed to post comment");
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  };

  const handleSaveEdit = async (commentId: number) => {
    const hasContent = editingText.trim().length > 0 && editingText !== '<p></p>';
    if (!hasContent || !currentUserId) return;

    try {
      const result = await updateComment({
        commentId,
        text: editingText,
        userId: currentUserId,
        taskId,
      });
      await result.unwrap();
      setEditingCommentId(null);
      setEditingText("");
      // No refetch needed - optimistic update handles this
    } catch (error) {
      console.error("Failed to update comment:", error);
      toast.error("Failed to update comment");
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
        const result = await deleteComment({ commentId, userId: currentUserId, taskId });
        await result.unwrap();
        // No refetch needed - optimistic update handles this
      } catch (error) {
        console.error("Failed to delete comment:", error);
        toast.error("Failed to delete comment");
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
        <RichTextEditor
          content={newComment}
          onChange={setNewComment}
          onImageUpload={handleImageUpload}
          placeholder="Add a comment... (paste an image with Ctrl+V)"
          className="comment-editor"
        />

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Image className="h-4 w-4" />
            Paste image with Ctrl+V
          </div>
          <button
            type="submit"
            disabled={(!newComment.trim() || newComment === '<p></p>') || isCreating || isUploadingImage}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploadingImage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isCreating ? "Posting..." : isUploadingImage ? "Uploading..." : "Post Comment"}
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
              onImageUpload={handleImageUpload}
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

      <style>{`
        .comment-editor .ProseMirror {
          min-height: 80px;
        }
      `}</style>
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
  onImageUpload: (file: File) => Promise<string>;
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
  onImageUpload,
  isUpdating,
  isDeleting,
}) => {
  const isOwner = currentUserId === comment.userId;
  const timeAgo = format(new Date(comment.createdAt), "PPp");

  // Check if content is HTML (contains tags) or plain text
  const isHtmlContent = comment.text.includes('<') && comment.text.includes('>');

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
            <RichTextEditor
              content={editingText}
              onChange={onEditingTextChange}
              onImageUpload={onImageUpload}
              placeholder="Edit your comment..."
              className="comment-edit-editor"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={onSaveEdit}
                disabled={!editingText.trim() || editingText === '<p></p>' || isUpdating}
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
            <style>{`
              .comment-edit-editor .ProseMirror {
                min-height: 60px;
              }
            `}</style>
          </div>
        ) : (
          <div className="space-y-2">
            {isHtmlContent ? (
              <div
                className="text-gray-700 dark:text-gray-300 comment-content"
                dangerouslySetInnerHTML={{ __html: comment.text }}
              />
            ) : (
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {comment.text}
              </div>
            )}
            {/* Legacy image support for old comments with separate imageUrl */}
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

      <style>{`
        .comment-content p {
          margin: 0 0 8px 0;
        }
        .comment-content p:last-child {
          margin-bottom: 0;
        }
        .comment-content img {
          max-width: 100%;
          max-height: 300px;
          border-radius: 8px;
          margin: 8px 0;
        }
        .comment-content ul,
        .comment-content ol {
          padding-left: 24px;
          margin: 8px 0;
        }
        .comment-content li {
          margin: 4px 0;
        }
        .comment-content strong {
          font-weight: 600;
        }
        .comment-content em {
          font-style: italic;
        }
        .comment-content code {
          background: rgba(0, 0, 0, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 13px;
        }
        .dark .comment-content code {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default CommentsSection;
