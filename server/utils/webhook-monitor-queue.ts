/**
 * Webhook Submission Monitor Queue
 * 
 * This module maintains a queue of recent form submissions and their webhook payloads
 * for real-time analysis of field population and mapping.
 */

// Store recent submissions for analysis
interface SubmissionRecord {
  id: string;
  timestamp: number;
  formType: 'quote' | 'final';
  originalData: any;
  webhookPayload: any;
  diagnosticLog: string[];
  success: boolean;
  response?: {
    status: number;
    body: string;
  };
}

// Maximum number of submissions to keep in the queue
const MAX_QUEUE_SIZE = 20;

// Submission queue
const submissionQueue: SubmissionRecord[] = [];

/**
 * Add a new submission record to the queue
 */
export function recordSubmission(
  formType: 'quote' | 'final',
  originalData: any,
  webhookPayload: any,
  diagnosticLog: string[],
  success: boolean,
  response?: { status: number; body: string }
): string {
  // Generate a unique ID for this submission
  const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  
  // Create the submission record
  const record: SubmissionRecord = {
    id,
    timestamp: Date.now(),
    formType,
    originalData,
    webhookPayload,
    diagnosticLog,
    success,
    response
  };
  
  // Add to the queue
  submissionQueue.unshift(record);
  
  // Trim the queue if it's too long
  if (submissionQueue.length > MAX_QUEUE_SIZE) {
    submissionQueue.pop();
  }
  
  return id;
}

/**
 * Get all submission records
 */
export function getAllSubmissions(): SubmissionRecord[] {
  return submissionQueue;
}

/**
 * Get a specific submission by ID
 */
export function getSubmissionById(id: string): SubmissionRecord | undefined {
  return submissionQueue.find(submission => submission.id === id);
}

/**
 * Get recent submissions of a specific type
 */
export function getSubmissionsByType(type: 'quote' | 'final'): SubmissionRecord[] {
  return submissionQueue.filter(submission => submission.formType === type);
}

/**
 * Get overall statistics about submissions
 */
export function getSubmissionStats(): {
  total: number;
  successful: number;
  failed: number;
  quoteCount: number;
  finalCount: number;
  mostRecentTime: number | null;
} {
  const total = submissionQueue.length;
  const successful = submissionQueue.filter(s => s.success).length;
  const failed = total - successful;
  const quoteCount = submissionQueue.filter(s => s.formType === 'quote').length;
  const finalCount = submissionQueue.filter(s => s.formType === 'final').length;
  const mostRecentTime = submissionQueue.length > 0 ? submissionQueue[0].timestamp : null;
  
  return {
    total,
    successful,
    failed,
    quoteCount,
    finalCount,
    mostRecentTime
  };
}

/**
 * Clear all submissions from the queue
 */
export function clearSubmissions(): void {
  submissionQueue.length = 0;
}