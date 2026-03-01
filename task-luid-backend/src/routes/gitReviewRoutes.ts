import { Router } from 'express';
import * as controller from '../controllers/gitReviewController';

const router = Router();

// ==================== REVIEW STATE ====================
router.get('/git/tasks/:taskId/pull-requests/:prId/review', controller.getReviewState);
router.post('/git/tasks/:taskId/pull-requests/:prId/review', controller.saveReviewState);
router.delete('/git/tasks/:taskId/pull-requests/:prId/review', controller.deleteReviewState);

// ==================== DIFF ====================
router.get('/git/pull-requests/:prId/diff', controller.getPRDiff);

// ==================== COMMENTS ====================
router.get('/git/pull-requests/:prId/comments', controller.getInlineComments);
router.post('/git/pull-requests/:prId/comments', controller.createInlineComment);
router.put('/git/comments/:commentId', controller.updateInlineComment);
router.delete('/git/comments/:commentId', controller.deleteInlineComment);
router.post('/git/comments/:commentId/resolve', controller.resolveInlineComment);

// ==================== REVIEW REQUESTS ====================
router.get('/git/pull-requests/:prId/review-requests', controller.getReviewRequests);
router.get('/git/review-requests/pending', controller.getPendingReviewRequests);
router.post('/git/pull-requests/:prId/request-review', controller.createReviewRequest);
router.post('/git/review-requests/:requestId/respond', controller.respondToReviewRequest);

// ==================== AI REVIEW ====================
router.get('/git/pull-requests/:prId/ai-review', controller.getAIReviewResults);
router.post('/git/pull-requests/:prId/ai-review', controller.startAIReview);

// ==================== SUMMARY ====================
router.get('/git/pull-requests/:prId/review-summary', controller.getPRReviewSummary);

// ==================== DEFAULT CHECKLIST ====================
router.get('/git/default-checklist', controller.getDefaultChecklist);

export default router;
