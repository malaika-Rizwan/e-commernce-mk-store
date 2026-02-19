import { NextResponse } from 'next/server';

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(
  message: string,
  status = 400,
  code?: string
) {
  return NextResponse.json(
    { success: false, error: message, ...(code && { code }) },
    { status }
  );
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return errorResponse(message, 401, 'UNAUTHORIZED');
}

export function forbiddenResponse(message = 'Forbidden') {
  return errorResponse(message, 403, 'FORBIDDEN');
}

export function notFoundResponse(message = 'Not found') {
  return errorResponse(message, 404, 'NOT_FOUND');
}

export function serverErrorResponse(message = 'Internal server error') {
  return errorResponse(message, 500, 'SERVER_ERROR');
}
