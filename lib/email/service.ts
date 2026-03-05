import { ContactFormData } from '@/types';
import { Professional } from '@/types';

// Mock email service - logs to console for development
// Replace with real SMTP service in production

export async function sendLeadEmail(
  professional: Professional,
  leadData: ContactFormData
): Promise<boolean> {
  try {
    console.log('=================================');
    console.log('📧 LEAD EMAIL TO PROFESSIONAL');
    console.log('=================================');
    console.log(`To: ${professional.email}`);
    console.log(`Subject: New Lead: ${leadData.name} is interested in your services`);
    console.log('');
    console.log(`Hello ${professional.name},`);
    console.log('');
    console.log('You have received a new inquiry from the Spain English Directory:');
    console.log('');
    console.log('Contact Details:');
    console.log(`  Name: ${leadData.name}`);
    console.log(`  Email: ${leadData.email}`);
    if (leadData.phone) console.log(`  Phone: ${leadData.phone}`);
    if (leadData.serviceInterest) console.log(`  Service Interest: ${leadData.serviceInterest}`);
    console.log('');
    console.log('Message:');
    console.log(leadData.message);
    console.log('=================================');
    
    return true;
  } catch (error) {
    console.error('Failed to send lead email:', error);
    return false;
  }
}

export async function sendConfirmationEmail(
  leadData: ContactFormData,
  professionalName: string
): Promise<boolean> {
  try {
    console.log('=================================');
    console.log('📧 CONFIRMATION EMAIL TO USER');
    console.log('=================================');
    console.log(`To: ${leadData.email}`);
    console.log(`Subject: Your inquiry to ${professionalName} has been sent`);
    console.log('');
    console.log(`Hello ${leadData.name},`);
    console.log('');
    console.log(`Your inquiry to ${professionalName} has been sent successfully.`);
    console.log('');
    console.log('They will contact you shortly at:');
    console.log(`  Email: ${leadData.email}`);
    if (leadData.phone) console.log(`  Phone: ${leadData.phone}`);
    console.log('');
    console.log('Your Message:');
    console.log(leadData.message);
    console.log('=================================');
    
    return true;
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    return false;
  }
}
