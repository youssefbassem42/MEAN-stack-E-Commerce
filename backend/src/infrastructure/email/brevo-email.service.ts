import type { EmailService } from '../../application/ports/email.service.js';
import { env } from '../config/env.js';

const createHtmlTemplate = (title: string, firstName: string, token: string) => `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
    <h2>${title}</h2>
    <p>Hello ${firstName},</p>
    <p>${token}</p>
  </div>
`;

export class BrevoEmailService implements EmailService {
  public async sendVerificationEmail(payload: { to: string; firstName: string; token: string }) {
    await this.sendEmail({
      to: payload.to,
      subject: 'Verify your email address',
      htmlContent: createHtmlTemplate('Verify your email address', payload.firstName, payload.token),
    });
  }

  public async sendPasswordResetEmail(payload: { to: string; firstName: string; token: string }) {
    await this.sendEmail({
      to: payload.to,
      subject: 'Reset your password',
      htmlContent: createHtmlTemplate('Reset your password', payload.firstName, payload.token),
    });
  }

  private async sendEmail(input: { to: string; subject: string; htmlContent: string }) {
    if (!env.brevoApiKey) {
      console.warn(`Skipping Brevo email send to ${input.to} because BREVO_API_KEY is not configured.`);
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
