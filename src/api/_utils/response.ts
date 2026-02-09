import { VercelRequest, VercelResponse } from "@vercel/node";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Send success response
 */
export function sendSuccess<T>(
  res: VercelResponse,
  data: T,
  status: number = 200,
) {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  return res.status(status).json(response);
}

/**
 * Send error response
 */
export function sendError(
  res: VercelResponse,
  error: string,
  status: number = 400,
) {
  const response: ApiResponse = {
    success: false,
    error,
  };
  return res.status(status).json(response);
}

/**
 * Send validation error
 */
export function sendValidationError(res: VercelResponse, errors: any) {
  return res.status(400).json({
    success: false,
    error: "Validation error",
    details: errors,
  });
}

/**
 * Handle method not allowed
 */
export function methodNotAllowed(
  res: VercelResponse,
  allowedMethods: string[],
) {
  res.setHeader("Allow", allowedMethods.join(", "));
  return sendError(
    res,
    `Método no permitido. Métodos permitidos: ${allowedMethods.join(", ")}`,
    405,
  );
}

/**
 * CORS headers for API
 */
export function setCorsHeaders(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
  );
}

/**
 * Handle OPTIONS request for CORS
 */
export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }

  return false;
}
