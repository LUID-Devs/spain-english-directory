// Email notification utility
// In production, this would integrate with SendGrid, AWS SES, or similar

interface ClaimEmailData {
  listingName: string;
  verificationCode: string;
  claimEmail: string;
  claimedBy: string;
}

interface ApprovalEmailData {
  listingName: string;
  claimEmail: string;
  claimedBy: string;
  approved: boolean;
}

export async function sendVerificationEmail(data: ClaimEmailData): Promise<boolean> {
  // TODO: Implement actual email sending
  console.log(`[EMAIL] Verification email to ${data.claimEmail}`);
  console.log(`  Subject: Verify your claim for ${data.listingName}`);
  console.log(`  Code: ${data.verificationCode}`);
  return true;
}

export async function sendAdminNotificationEmail(listingName: string): Promise<boolean> {
  // TODO: Implement actual email sending to admin
  console.log(`[EMAIL] Admin notification for verified claim`);
  console.log(`  Subject: New verified claim for ${listingName}`);
  return true;
}

export async function sendApprovalEmail(data: ApprovalEmailData): Promise<boolean> {
  // TODO: Implement actual email sending
  const status = data.approved ? 'approved' : 'rejected';
  console.log(`[EMAIL] Claim ${status} notification to ${data.claimEmail}`);
  console.log(`  Subject: Your claim for ${data.listingName} has been ${status}`);
  return true;
}
