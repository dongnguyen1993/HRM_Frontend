export interface SystemSettingsConfig {
  sessionTimeoutMinutes: number;
  maxFailedAttempts: number;
  passwordExpiryDays: number;
  smtpHost?: string;
  smtpPort: number;
  smtpEmail?: string;
  smtpPassword?: string;
  enableSsl: boolean;
  userCodePrefix: string;
  userCodeNextNumber: number;
  updatedAt?: string;
  updatedBy?: string;
}
