import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return unauthorizedResponse();

    if (!OPENAI_API_KEY) {
      return errorResponse('OpenAI API key is not configured', 500);
    }

    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const description = typeof body?.description === 'string' ? body.description.trim() : '';

    if (!name) return errorResponse('Product name is required', 400);

    const prompt = description
      ? `High-quality, professional product photography of: ${name}. ${description}. Clean white or neutral background, studio lighting, realistic, 4k, e-commerce product image.`
      : `High-quality, professional product photography of: ${name}. Clean white or neutral background, studio lighting, realistic, 4k, e-commerce product image.`;

    const openaiRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-2',
        prompt,
        n: 1,
        size: '1024x1024',
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.json().catch(() => ({}));
      const msg = (err as { error?: { message?: string } })?.error?.message ?? 'OpenAI request failed';
      return errorResponse(msg, openaiRes.status);
    }

    const data = (await openaiRes.json()) as { data?: Array<{ url?: string }> };
    const imageUrl = data.data?.[0]?.url;
    if (!imageUrl) return errorResponse('No image URL in OpenAI response', 500);

    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) return errorResponse('Failed to fetch generated image', 500);
    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = `data:image/png;base64,${buffer.toString('base64')}`;

    const uploadResult = await uploadImage(base64, {
      folder: 'e-commerce/products',
    });

    return successResponse({ url: uploadResult.secure_url });
  } catch (err) {
    console.error('Generate product image error:', err);
    return serverErrorResponse();
  }
}
