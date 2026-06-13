export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenService {
  issueTokens(payload: { userId: string; email: string }): TokenPair;
  verifyAccessToken(token: string): { userId: string; email: string };
  verifyRefreshToken(token: string): { userId: string; email: string };
  hashToken(token: string): string;
  compareTokenHash(token: string, hash: string): boolean;
  generateRandomToken(length?: number): string;
}
