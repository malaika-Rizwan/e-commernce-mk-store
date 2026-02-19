import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response';

const MAX_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const PRODUCTS_FOLDER = 'mk-store/products';

const productTransformation = [
  { width: 1000, crop: 'limit' as const },
  { quality: 'auto' as const },
  { fetch_format: 'auto' as const },
];

function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET)
  );
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    if (!isCloudinaryConfigured()) {
      return errorResponse(
        'Image upload is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env.local',
        503
      );
    }

    const formData = await request.formData();
    const folder = (formData.get('folder') as string) ?? PRODUCTS_FOLDER;

    const multiple = formData.getAll('files');
    const files: File[] = multiple.length
      ? (multiple as File[])
      : formData.get('file')
        ? [formData.get('file') as File]
        : [];

    if (!files.length) {
      return errorResponse('No file(s) provided', 400);
    }
    if (files.length > MAX_FILES) {
      return errorResponse(`Maximum ${MAX_FILES} files per request`, 400);
    }

    const useProductTransformation = folder === PRODUCTS_FOLDER || folder.startsWith('mk-store/');
    const transformation = useProductTransformation ? productTransformation : undefined;

    const uploads: { url: string; public_id: string }[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return errorResponse(`File ${file.name || 'unknown'} exceeds 5MB limit`, 400);
      }
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
        const result = await uploadImage(base64, {
          folder: folder || PRODUCTS_FOLDER,
          transformation,
        });
        uploads.push({ url: result.secure_url, public_id: result.public_id });
      } catch (err) {
        console.error('Upload single file error:', err);
        return errorResponse(
          err instanceof Error ? err.message : `Failed to upload ${file.name || 'file'}`,
          500
        );
      }
    }

    return successResponse({ uploads });
  } catch (err) {
    console.error('Upload error:', err);
    const message =
      err instanceof Error ? err.message : 'Image upload failed. Check server logs.';
    return errorResponse(message, 500);
  }
}
