import { v2 as cloudinary } from 'cloudinary';

// Support either CLOUDINARY_URL (single var) or the three separate vars
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ url: process.env.CLOUDINARY_URL });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export interface UploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

export async function uploadImage(
  file: string | Buffer,
  options?: {
    folder?: string;
    transformation?: Array<Record<string, unknown>>;
  }
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(file as string, {
    folder: options?.folder ?? 'e-commerce',
    transformation: options?.transformation,
  });
  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
    width: result.width ?? 0,
    height: result.height ?? 0,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
