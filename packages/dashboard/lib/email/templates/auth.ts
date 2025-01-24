export const emailTemplates = {
  confirmEmail: {
    subject: 'Confirm your email - Veyla AI',
    html: (confirmLink: string) => `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .button {
              background-color: #4F46E5;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 4px;
              display: inline-block;
              margin: 16px 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to Veyla AI!</h1>
            <p>Thank you for signing up. Please confirm your email address to get started.</p>
            <a href="${confirmLink}" class="button">
              Confirm Email
            </a>
            <p>If you didn't create an account with Veyla AI, you can safely ignore this email.</p>
            <p>
              Best regards,<br>
              The Veyla AI Team
            </p>
          </div>
        </body>
      </html>
    `,
  },
  resetPassword: {
    subject: 'Reset your password - Veyla AI',
    html: (resetLink: string) => `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .button {
              background-color: #4F46E5;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 4px;
              display: inline-block;
              margin: 16px 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Reset Your Password</h1>
            <p>We received a request to reset your password. Click the button below to choose a new password:</p>
            <a href="${resetLink}" class="button">
              Reset Password
            </a>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <p>
              Best regards,<br>
              The Veyla AI Team
            </p>
          </div>
        </body>
      </html>
    `,
  },
};
