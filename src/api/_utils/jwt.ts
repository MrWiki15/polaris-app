import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "your-refresh-secret-key-change-in-production";

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface RefreshTokenPayload extends TokenPayload {
  tokenType: "refresh";
}

/**
 * Generate access token (expires in 24 hours)
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h",
  });
}

/**
 * Generate refresh token (expires in 30 days)
 */
export function generateRefreshToken(payload: TokenPayload): string {
  const refreshPayload: RefreshTokenPayload = {
    ...payload,
    tokenType: "refresh",
  };
  return jwt.sign(refreshPayload, JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error("Token inválido o expirado");
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(
      token,
      JWT_REFRESH_SECRET,
    ) as RefreshTokenPayload;
    if (decoded.tokenType !== "refresh") {
      throw new Error("Token type inválido");
    }
    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    throw new Error("Refresh token inválido o expirado");
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}
