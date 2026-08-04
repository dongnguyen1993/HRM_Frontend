export interface SignInLogItem {
  tokenId: number;
  userId: number;
  userCode: string;
  fullName: string;
  email: string;
  plant: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: string;
  isRevoked: boolean;
  createdAt: string;
  sessionStatus: number; // 1: Active, 0: Revoked, 2: Expired
}
