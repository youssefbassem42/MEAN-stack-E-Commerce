import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import type { TokenService } from '../../application/ports/token.service.js';
import { env } from '../config/env.js';

export class JwtTokenService implements TokenService {
  public issueTokens(payload: { userId: string; email: string }) {
    const accessToken = jwt.sign(payload, env.accessTokenSecret, {
      expiresIn: env.accessTokenTtl as StringValue,
    });
    const refreshToken = jwt.sign(payload, env.refreshTokenSecret, {
      expiresIn: env.refreshTokenTtl as StringValue,
    });

    return { accessToken, refreshToken };
  }

  public verifyAccessToken(token: string) {
    return jwt.verify(token, env.accessTokenSecret) as { userId: string; email: string };
  }

  public verifyRefreshToken(token: string) {
    return jwt.verify(token, env.refreshTokenSecret) as { userId: string; email: string };
  }

  public hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  public compareTokenHash(token: string, hash: string) {
    return this.hashToken(token) === hash;
  }

  public generateRandomToken(length = 32) {
    return randomBytes(length).toString('hex');
  }
}
