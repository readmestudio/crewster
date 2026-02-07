import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export type AuthProvider = 'email' | 'kakao';

export interface JWTPayload {
  userId: string;
  kakaoId?: string;  // Optional - only for Kakao login
  authProvider: AuthProvider;
  subscriptionPlan?: 'free' | 'pro';
  subscriptionStatus?: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d',
  });
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
