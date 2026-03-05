interface EmailPayload {
  to: string;
  listingName: string;
}

interface VerificationEmailPayload extends EmailPayload {
  verificationCode: string;
  expiryDate: Date;
}

interface RejectionEmailPayload extends EmailPayload {
  reason: string;
}

interface AdminNotificationPayload {
  listingId: number;
  listingName: string;
  claimedBy: string;
  claimEmail: string;
  claimPhone: string;
}

// Stub email sender - logs to console instead of sending actual emails
// Replace with actual implementation using nodemailer, SendGrid, AWS SES, etc.
async function sendEmail(to: string, subject: string, html: string, text: string): Promise<void> {
  console.log(`[EMAIL] To: ${to}`);
  console.log(`[EMAIL] Subject: ${subject}`);
  console.log(`[EMAIL] Text: ${text.substring(0, 200)}...`);
  // In production, implement actual email sending here
  return Promise.resolve();
}

export async function sendClaimVerificationEmail({
  to,
  listingName,
  verificationCode,
  expiryDate,
}: VerificationEmailPayload): Promise<void> {
  const subject = `Verify your claim for ${listingName}`;
  const text = `
Hello,

Thank you for claiming your listing "${listingName}" on Spain English Directory.

Your verification code is: ${verificationCode}

Please enter this code on the verification page to confirm your claim. This code will expire on ${expiryDate.toLocaleString()}.

If you did not request this claim, please ignore this email.

Best regards,
Spain English Directory Team
  `;

  const html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>Verify Your Listing Claim</h2>
    <p>Hello,</p>
    <p>Thank you for claiming your listing <strong>"${listingName}"</strong> on Spain English Directory.</p>
    <p>Your verification code is:</p>
    <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">${verificationCode}</div>
    <p>This code will expire on <strong>${expiryDate.toLocaleString()}</strong>.</p>
  </div>`;

  await sendEmail(to, subject, html, text);
}

export async function sendClaimPendingApprovalEmail({
  to,
  listingName,
}: EmailPayload): Promise<void> {
  const subject = `Claim verification successful - Pending approval`;
  const text = `Your claim for "${listingName}" is now pending admin approval.`;
  const html = `<div><h2>✓ Verification Successful</h2><p>Your claim for <strong>"${listingName}"</strong> is pending admin approval.</p></div>`;
  await sendEmail(to, subject, html, text);
}

export async function sendClaimApprovedEmail({
  to,
  listingName,
}: EmailPayload): Promise<void> {
  const subject = `Your claim for ${listingName} has been approved!`;
  const text = `Congratulations! Your claim for "${listingName}" has been approved.`;
  const html = `<div><h2>🎉 Claim Approved!</h2><p>Your claim for <strong>"${listingName}"</strong> has been approved.</p></div>`;
  await sendEmail(to, subject, html, text);
}

export async function sendClaimRejectedEmail({
  to,
  listingName,
  reason,
}: RejectionEmailPayload): Promise<void> {
  const subject = `Update on your claim for ${listingName}`;
  const text = `Your claim for "${listingName}" could not be approved. Reason: ${reason}`;
  const html = `<div><h2>Claim Not Approved</h2><p>Your claim for <strong>"${listingName}"</strong> could not be approved.</p><p><strong>Reason:</strong> ${reason}</p></div>`;
  await sendEmail(to, subject, html, text);
}

export async function sendAdminClaimNotification({
  listingId,
  listingName,
  claimedBy,
  claimEmail,
  claimPhone,
}: AdminNotificationPayload): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@spainenglishdirectory.com';
  const subject = `New claim pending approval: ${listingName}`;
  const text = `Listing: ${listingName} (ID: ${listingId})\nClaimed By: ${claimedBy}\nEmail: ${claimEmail}\nPhone: ${claimPhone}`;
  const html = `<div><h2>New Claim Pending Approval</h2><p>Listing: ${listingName} (ID: ${listingId})<br/>Claimed By: ${claimedBy}<br/>Email: ${claimEmail}<br/>Phone: ${claimPhone}</p></div>`;
  await sendEmail(adminEmail, subject, html, text);
}
