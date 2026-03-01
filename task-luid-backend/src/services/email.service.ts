import nodemailer from "nodemailer";
import { ExternalUser, TaskExternalShare } from "../types/taskShare.types";

// Email configuration
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@taskluid.com";
const APP_URL = process.env.APP_URL || "https://app.taskluid.com";

/**
 * Create email transporter
 */
function createTransporter() {
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn("SMTP credentials not configured. Email notifications will be logged only.");
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

/**
 * Send email to external user when they are invited to view a task
 */
export async function sendExternalShareInvitation(
  externalUser: ExternalUser,
  share: TaskExternalShare,
  taskTitle: string,
  sharedByUsername: string
): Promise<{ success: boolean; error?: string }> {
  const transporter = createTransporter();
  
  const shareUrl = `${APP_URL}/shared-task?taskId=${share.taskId}&token=${externalUser.token}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">You've been invited to view a task</h2>
      
      <p>Hi ${externalUser.name || externalUser.email},</p>
      
      <p><strong>${sharedByUsername}</strong> has invited you to view the following task:</p>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #333;">${taskTitle}</h3>
      </div>
      
      <p>You can access this task using the link below:</p>
      
      <a href="${shareUrl}" 
         style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; 
                text-decoration: none; border-radius: 6px; margin: 20px 0;">
        View Task
      </a>
      
      <p style="color: #666; font-size: 14px;">
        Or copy and paste this link into your browser:<br>
        <a href="${shareUrl}" style="color: #3b82f6;">${shareUrl}</a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      
      <p style="color: #666; font-size: 12px;">
        This is an automated message from TaskLuid. You received this because someone shared a task with you.
        If you believe this was sent in error, you can safely ignore this email.
      </p>
    </div>
  `;

  const textContent = `
    You've been invited to view a task
    
    Hi ${externalUser.name || externalUser.email},
    
    ${sharedByUsername} has invited you to view the following task: ${taskTitle}
    
    You can access this task using the link below:
    ${shareUrl}
    
    ---
    This is an automated message from TaskLuid.
  `;

  // Log email for debugging
  console.log("=".repeat(60));
  console.log("EXTERNAL SHARE INVITATION EMAIL");
  console.log("To:", externalUser.email);
  console.log("Subject:", `Task shared with you: ${taskTitle}`);
  console.log("Share URL:", shareUrl);
  console.log("=".repeat(60));

  if (!transporter) {
    // In development without SMTP, just log and return success
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: `"TaskLuid" <${FROM_EMAIL}>`,
      to: externalUser.email,
      subject: `Task shared with you: ${taskTitle}`,
      text: textContent,
      html: htmlContent,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send email notification" };
  }
}

/**
 * Send notification when external user's access is revoked
 */
export async function sendAccessRevokedNotification(
  externalUser: ExternalUser,
  taskTitle: string,
  sharedByUsername: string
): Promise<{ success: boolean; error?: string }> {
  const transporter = createTransporter();
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Task access revoked</h2>
      
      <p>Hi ${externalUser.name || externalUser.email},</p>
      
      <p>Your access to the following task has been revoked by <strong>${sharedByUsername}</strong>:</p>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0; color: #333;">${taskTitle}</h3>
      </div>
      
      <p>If you believe this was done in error, please contact the person who shared the task with you.</p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      
      <p style="color: #666; font-size: 12px;">
        This is an automated message from TaskLuid.
      </p>
    </div>
  `;

  const textContent = `
    Task access revoked
    
    Hi ${externalUser.name || externalUser.email},
    
    Your access to the following task has been revoked by ${sharedByUsername}:
    ${taskTitle}
    
    If you believe this was done in error, please contact the person who shared the task with you.
  `;

  // Log email for debugging
  console.log("=".repeat(60));
  console.log("ACCESS REVOKED NOTIFICATION EMAIL");
  console.log("To:", externalUser.email);
  console.log("Subject:", `Access revoked: ${taskTitle}`);
  console.log("=".repeat(60));

  if (!transporter) {
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: `"TaskLuid" <${FROM_EMAIL}>`,
      to: externalUser.email,
      subject: `Access revoked: ${taskTitle}`,
      text: textContent,
      html: htmlContent,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send email notification" };
  }
}

export default {
  sendExternalShareInvitation,
  sendAccessRevokedNotification,
};
