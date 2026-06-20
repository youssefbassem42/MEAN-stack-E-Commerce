import type { EmailService } from '../../application/ports/email.service.js';
import { env } from '../config/env.js';

const createHtmlTemplate = (title: string, firstName: string, actionUrl: string, actionLabel: string) => `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:12px;">
    <h2 style="color:#f97316;margin-top:0;">${title}</h2>
    <p>Hello ${firstName},</p>
    <p>Please click the button below to complete the request:</p>
    <div style="margin:24px 0;">
      <a href="${actionUrl}" style="background-color:#f97316;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:bold;display:inline-block;">${actionLabel}</a>
    </div>
    <p style="font-size:12px;color:#6b7280;margin-top:24px;">If you're having trouble clicking the button, copy and paste this URL into your web browser:</p>
    <p style="font-size:12px;color:#6b7280;word-break:break-all;">${actionUrl}</p>
  </div>
`;

export class BrevoEmailService implements EmailService {
  public async sendVerificationEmail(payload: { to: string; firstName: string; token: string }) {
    const actionUrl = `${env.clientOrigin}/auth/verify-email?token=${payload.token}`;
    await this.sendEmail({
      to: payload.to,
      subject: 'Verify your email address',
      htmlContent: createHtmlTemplate('Verify your email address', payload.firstName, actionUrl, 'Verify Email'),
    });
  }

  public async sendPasswordResetEmail(payload: { to: string; firstName: string; token: string }) {
    const actionUrl = `${env.clientOrigin}/auth/reset-password?token=${payload.token}`;
    await this.sendEmail({
      to: payload.to,
      subject: 'Reset your password',
      htmlContent: createHtmlTemplate('Reset your password', payload.firstName, actionUrl, 'Reset Password'),
    });
  }

  private async sendEmail(input: { to: string; subject: string; htmlContent: string }) {
    if (!env.brevoApiKey) {
      console.warn(`[EMAIL BACKUP] To: ${input.to} | Subject: ${input.subject}`);
      console.log(`[EMAIL BACKUP] HTML Content:\n${input.htmlContent}\n`);
      return;
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': env.brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          name: env.brevoSenderName,
          email: env.brevoSenderEmail,
        },
        to: [{ email: input.to }],
        subject: input.subject,
        htmlContent: input.htmlContent,
      }),
    });

    if (!response.ok) {
      throw new Error(`Brevo email request failed with status ${response.status}`);
    }
  }
}
