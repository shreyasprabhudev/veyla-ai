import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  attachments?: {
    content: string;
    filename: string;
    type: string;
    disposition: 'attachment' | 'inline';
  }[];
};

export const sendEmail = async ({
  to,
  subject,
  html,
  attachments,
}: EmailOptions) => {
  try {
    console.log('📧 Sending email to:', to);
    
    const msg = {
      to,
      from: process.env.SMTP_SENDER!,
      subject,
      html,
      attachments,
    };

    await sgMail.send(msg);
    console.log('✅ Email sent successfully to:', to);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Email send error:', error?.response?.body || error);
    return { 
      success: false, 
      error: error?.response?.body || error 
    };
  }
};
