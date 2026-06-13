export interface VerificationEmailPayload {
  to: string;
  firstName: string;
  token: string;
}

export interface PasswordResetEmailPayload {
  to: string;
  firstName: string;
  token: string;
}

export interface EmailService {
  sendVerificationEmail(payload: VerificationEmailPayload): Promise<void>;
  sendPasswordResetEmail(payload: PasswordResetEmailPayload): Promise<void>;
}
