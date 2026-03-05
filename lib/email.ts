// Email service for sending verification codes and notifications

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // In development, log to console
  if (process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY) {
    console.log('=== EMAIL WOULD BE SENT ===');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('===========================');
    return { success: true, messageId: `dev-${Date.now()}` };
  }

  // Production: integrate with your email provider
  try {
    // Dynamic import with error handling for missing resend package
    let resendModule: unknown;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      resendModule = require('resend');
    } catch {
      console.warn('Resend package not installed, logging email instead');
      console.log('=== EMAIL (resend not installed) ===');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('===========================');
      return { success: true, messageId: `no-resend-${Date.now()}` };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Resend = resendModule as any;
    const resend = new Resend.Resend(process.env.RESEND_API_KEY);
    
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@spainenglishdirectory.com',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: String(error) };
  }
}

export async function sendVerificationCode(email: string, code: string, listingName: string): Promise<boolean> {
  const result = await sendEmail({
    to: email,
    subject: `Verify your claim for ${listingName}`,
    text: `Your verification code is: ${code}\n\nThis code will expire in 30 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verify Your Listing Claim</h2>
        <p>You recently requested to claim <strong>${listingName}</strong> on Spain English Directory.</p>
        <p>Your verification code is:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #666;">This code will expire in 30 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });

  return result.success;
}

export async function sendClaimApprovedNotification(email: string, listingName: string): Promise<boolean> {
  const result = await sendEmail({
    to: email,
    subject: `Your claim for ${listingName} has been approved!`,
    text: `Great news! Your claim for ${listingName} has been approved. You can now manage your listing.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">Claim Approved! 🎉</h2>
        <p>Great news! Your claim for <strong>${listingName}</strong> has been approved.</p>
        <p>You can now manage your listing and update your business information.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
           style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
          Go to Dashboard
        </a>
      </div>
    `,
  });

  return result.success;
}

export async function sendClaimRejectedNotification(email: string, listingName: string, reason?: string): Promise<boolean> {
  const result = await sendEmail({
    to: email,
    subject: `Update on your claim for ${listingName}`,
    text: `Your claim for ${listingName} could not be approved.${reason ? ` Reason: ${reason}` : ''}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Claim Not Approved</h2>
        <p>We're sorry, but your claim for <strong>${listingName}</strong> could not be approved at this time.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>If you believe this is a mistake, please contact our support team.</p>
      </div>
    `,
  });

  return result.success;
}
