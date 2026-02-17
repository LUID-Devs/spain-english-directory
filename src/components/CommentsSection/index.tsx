
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
import { Button } from "@/components/ui/button";
import { sanitizeHtmlContent } from "@/lib/utils";

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

  // Show loading state when retrying (isLoading takes precedence over error)
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-foreground">Comments</h3>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    const isAuthError = error.message?.includes('sign in') || error.message?.includes('Authentication');
    const isNetworkError = error.message?.includes('Network') || error.message?.includes('connection');
    
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <MessageSquare className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-destructive font-medium">
              {isAuthError ? 'Authentication Required' : isNetworkError ? 'Connection Issue' : 'Failed to load comments'}
            </p>
            <p className="text-destructive/80 text-sm mt-1">{error.message || 'An unknown error occurred'}</p>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => refetch()}
                className="text-sm px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Try again
              </button>
              {isAuthError && (
                <a
                  href="/auth/login"
                  className="text-sm text-primary hover:text-primary/80 underline"
                >
                  Go to login
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground">
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
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Image className="h-4 w-4" aria-hidden="true" />
            Paste image with Ctrl+V
          </div>
          <Button
            type="submit"
            disabled={(!newComment.trim() || newComment === '<p></p>') || isCreating || isUploadingImage}
          >
            {isUploadingImage ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4 mr-2" aria-hidden="true" />
            )}
            {isCreating ? "Posting\u2026" : isUploadingImage ? "Uploading\u2026" : "Post Comment"}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
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
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" aria-hidden="true" />
            <p className="text-muted-foreground">No comments yet</p>
            <p className="text-sm text-muted-foreground/70">Be the first to add a comment!</p>
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

  return (
    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
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
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">
              {comment.user.username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-foreground">
            {comment.user.username}
          </span>
          <span className="text-xs text-muted-foreground">
            {timeAgo}
          </span>
          {comment.createdAt !== comment.updatedAt && (
            <span className="text-xs text-muted-foreground/70">
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
              <Button
                size="sm"
                onClick={onSaveEdit}
                disabled={!editingText.trim() || editingText === '<p></p>' || isUpdating}
              >
                <Check className="h-3 w-3 mr-1" aria-hidden="true" />
                {isUpdating ? "Saving\u2026" : "Save"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onCancelEdit}
                disabled={isUpdating}
              >
                <X className="h-3 w-3 mr-1" aria-hidden="true" />
                Cancel
              </Button>
            </div>
            <style>{`
              .comment-edit-editor .ProseMirror {
                min-height: 60px;
              }
            `}</style>
          </div>
        ) : (
          <div className="space-y-2">
            <div
              className="text-foreground/80 comment-content"
              dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(comment.text) }}
            />
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
                  className="max-w-full max-h-64 rounded-lg border border-border hover:opacity-90 transition-opacity cursor-pointer"
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
              className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded hover:bg-accent transition-colors"
            >
              <Edit3 className="h-3 w-3" aria-hidden="true" />
              Edit
            </button>
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="flex items-center gap-1 px-2 py-1 text-xs text-destructive hover:text-destructive/80 rounded hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3 w-3" aria-hidden="true" />
              {isDeleting ? "Deleting\u2026" : "Delete"}
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
          background: hsl(var(--muted));
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
};

export default CommentsSection;
