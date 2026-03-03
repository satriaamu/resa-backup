import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function getUserFromToken(authHeader?: string) {
  try {
    if (!authHeader) return null;
    const token = authHeader.replace('Bearer ', '');
    const data = jwt.verify(token, JWT_SECRET) as any;
    return data;
  } catch (err) {
    return null;
  }
}