import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import {
  createToken,
  create2FAChallengeToken,
  verify2FAChallengeToken,
  setAuthCookie,
  removeAuthCookie,
  getSession,
} from '@/lib/auth';
import {
  sendVerificationEmail,
  sendPasswordResetEmail as sendPasswordResetEmailNodemailer,
  sendWelcomeEmail,
  sendAdminNewUserAlert,
} from '@/lib/nodemailer';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verify2FASchema,
  enable2FASchema,
  disable2FASchema,
} from '@/lib/validations/auth';
import type { NextRequest } from 'next/server';

function validationError(issues: { message: string }[]): NextResponse {
  const message = issues.map((i) => i.message).join('. ');
  return errorResponse(message, 400);
}

export async function register(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.errors.map((e) => ({ message: e.message })));
    }
    const { email, password, name } = parsed.data;
    const emailLower = email.toLowerCase().trim();

    await connectDB();
    const existing = await User.findOne({ email: emailLower }).select('_id');
    if (existing) {
      return errorResponse('Email already registered', 409);
    }

    const user = await User.create({
      email: emailLower,
      password,
      name,
      isVerified: false,
    });
    const verificationToken = user.getVerificationToken();
    const verificationCode = user.setVerificationCode();

    // 1. Save OTP to MongoDB (otp, otpExpire, verificationCode, etc.)
    await user.save({ validateBeforeSave: false });

    // 2. Return immediately — no waiting for email (fast response, no delay)
    const payload = {
      message: 'OTP sent to your email',
      _id: user._id,
      email: user.email,
      name: user.name,
      requiresVerification: true,
    };

    // 3. Send OTP email in background (does not block response)
    sendVerificationEmail({
      email: user.email,
      userName: user.name,
      verificationToken,
      verificationCode,
    })
      .then((sent) => {
        if (!sent) console.warn('[Auth] OTP email not sent. Check SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local.');
      })
      .catch((e) => console.error('[Auth] OTP email error:', e));

    sendAdminNewUserAlert({
      name: user.name,
      email: user.email,
      registeredAt: user.createdAt ?? new Date(),
    }).catch((e) => console.error('[Auth] Admin new user alert failed:', e));

    return successResponse(payload, 201);
  } catch (err) {
    console.error('Auth register error:', err);
    return serverErrorResponse();
  }
}

export async function login(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.errors.map((e) => ({ message: e.message })));
    }
    const { email, password } = parsed.data;
    const emailLower = email.toLowerCase().trim();

    await connectDB();
    const user = await User.findOne({ email: emailLower }).select('+password');
    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return errorResponse('Invalid email or password', 401);
    }

    if (user.isVerified === false) {
      return errorResponse('Please verify your email first', 403);
    }

    if (user.twoFactorEnabled) {
      const tempToken = await create2FAChallengeToken(user._id.toString());
      return successResponse({
        requiresTwoFactor: true,
        tempToken,
        message: 'Enter the 6-digit code from your authenticator app.',
      });
    }

    const token = await createToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    await setAuthCookie(token);

    return successResponse({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    console.error('Auth login error:', err);
    return serverErrorResponse();
  }
}

export async function logout(): Promise<NextResponse> {
  await removeAuthCookie();
  return successResponse({ message: 'Logged out' });
}

export async function me(): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    await connectDB();
    const user = await User.findById(session.userId).select('-password').lean();
    if (!user) return unauthorizedResponse();

    return successResponse({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    });
  } catch (err) {
    console.error('Auth me error:', err);
    return serverErrorResponse();
  }
}

export async function forgotPassword(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.errors.map((e) => ({ message: e.message })));
    }
    const { email } = parsed.data;

    await connectDB();
    const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpire');
    if (!user) {
      // Don't reveal whether email exists (security best practice)
      return successResponse({
        message: 'If an account exists with this email, you will receive a reset link.',
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmailNodemailer({
      email: user.email,
      resetToken,
      userName: user.name,
    });

    return successResponse({
      message: 'If an account exists with this email, you will receive a reset link.',
    });
  } catch (err) {
    console.error('Auth forgot password error:', err);
    return serverErrorResponse();
  }
}

export async function verifyEmail(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : '';
    const code = typeof body?.code === 'string' ? body.code.replace(/\D/g, '') : '';

    let user: Awaited<ReturnType<typeof User.findOne>> = null;

    if (email && code.length === 6) {
      await connectDB();
      user = await User.findOne({ email }).select('+verificationCode +verificationCodeExpires');
      if (!user) {
        return errorResponse('Invalid email or code', 400);
      }
      if (!user.verificationCode || user.verificationCode !== code) {
        return errorResponse('Invalid verification code', 400);
      }
      const expires = (user as { verificationCodeExpires?: Date }).verificationCodeExpires;
      if (!expires || new Date(expires) < new Date()) {
        return errorResponse('Verification code has expired. Please sign up again or request a new code.', 400);
      }
    } else if (token) {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      await connectDB();
      user = await User.findOne({
        verificationToken: hashedToken,
        verificationTokenExpires: { $gt: new Date() },
      }).select('+verificationToken +verificationTokenExpires');
      if (!user) {
        return errorResponse('Invalid or expired verification link', 400);
      }
    } else {
      return errorResponse('Enter the 6-digit code from your email, or use the verification link', 400);
    }

    if (!user) {
      return errorResponse('Verification failed', 400);
    }

    await user.clearVerificationToken();

    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (e) {
      console.error('Welcome email failed:', e);
    }

    const jwt = await createToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    await setAuthCookie(jwt);

    return successResponse({
      message: 'Email verified successfully',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Auth verify email error:', err);
    return serverErrorResponse();
  }
}

/** Verify OTP: accept email + otp, set isVerified = true, clear otp fields. Used by /api/auth/verify-otp */
export async function verifyOtp(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : '';
    const otp = typeof body?.otp === 'string' ? body.otp.replace(/\D/g, '').slice(0, 6) : '';

    if (!email || otp.length !== 6) {
      return errorResponse('Email and 6-digit OTP are required', 400);
    }

    await connectDB();
    const user = await User.findOne({ email }).select('+otp +otpExpire');
    if (!user) {
      return errorResponse('Invalid email or OTP', 400);
    }

    const userOtp = (user as { otp?: string }).otp;
    const otpExpire = (user as { otpExpire?: Date }).otpExpire;
    if (!userOtp || userOtp !== otp) {
      return errorResponse('Invalid OTP', 400);
    }
    if (!otpExpire || new Date(otpExpire) < new Date()) {
      return errorResponse('OTP has expired. Please request a new one.', 400);
    }

    await user.clearVerificationToken();

    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (e) {
      console.error('Welcome email failed:', e);
    }

    const jwt = await createToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    await setAuthCookie(jwt);

    return successResponse({
      message: 'Email verified successfully',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Auth verify OTP error:', err);
    return serverErrorResponse();
  }
}

export async function resendVerificationCode(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : '';
    if (!email) {
      return errorResponse('Email is required', 400);
    }

    await connectDB();
    const user = await User.findOne({ email }).select('+verificationCode +verificationCodeExpires');
    if (!user) {
      return errorResponse('No account found with this email', 404);
    }
    if (user.isVerified) {
      return errorResponse('This account is already verified. You can sign in.', 400);
    }

    const verificationToken = user.getVerificationToken();
    const verificationCode = user.setVerificationCode();
    await user.save({ validateBeforeSave: false });

    let sent = false;
    try {
      sent = await sendVerificationEmail({
        email: user.email,
        userName: user.name,
        verificationToken,
        verificationCode,
      });
    } catch (e) {
      console.error('Resend verification email failed:', e);
    }

    return successResponse({
      message: sent ? 'A new verification code was sent to your email.' : 'Account found, but email could not be sent. Check SMTP configuration.',
      emailSent: sent,
    });
  } catch (err) {
    console.error('Auth resend verification error:', err);
    return serverErrorResponse();
  }
}

export async function resetPassword(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.errors.map((e) => ({ message: e.message })));
    }
    const { token, password } = parsed.data;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    await connectDB();
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() },
    }).select('+password +resetPasswordToken +resetPasswordExpire');

    if (!user) {
      return errorResponse('Invalid or expired reset token', 400);
    }

    user.password = password;
    await user.clearResetPasswordToken();

    const jwt = await createToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    await setAuthCookie(jwt);

    return successResponse({
      message: 'Password reset successful',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Auth reset password error:', err);
    return serverErrorResponse();
  }
}

const OTP_RATE_LIMIT = { windowMs: 15 * 60 * 1000, max: 5 };

export async function verifyTwoFactor(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = verify2FASchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.errors.map((e) => ({ message: e.message })));
    }
    const { tempToken, otp } = parsed.data;

    const challenge = await verify2FAChallengeToken(tempToken);
    if (!challenge) {
      return errorResponse('Session expired. Please sign in again.', 401);
    }

    const { rateLimit } = await import('@/lib/rate-limit');
    const { success } = rateLimit(`2fa:${challenge.userId}`, 'auth:otp', {
      windowMs: OTP_RATE_LIMIT.windowMs,
      max: OTP_RATE_LIMIT.max,
    });
    if (!success) {
      return errorResponse('Too many attempts. Try again in 15 minutes.', 429);
    }

    await connectDB();
    const user = await User.findById(challenge.userId).select('+twoFactorSecret');
    if (!user?.twoFactorSecret) {
      return errorResponse('Invalid session. Please sign in again.', 401);
    }

    const valid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: otp,
      window: 1,
    });
    if (!valid) {
      return errorResponse('Invalid or expired code. Try again.', 401);
    }

    const token = await createToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    await setAuthCookie(token);

    return successResponse({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    console.error('Auth verify 2FA error:', err);
    return serverErrorResponse();
  }
}

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'E-Commerce';

export async function setup2FA(): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    await connectDB();
    const user = await User.findById(session.userId).select('+twoFactorSecret');
    if (!user) return unauthorizedResponse();
    if (user.twoFactorEnabled) {
      return errorResponse('Two-factor authentication is already enabled.', 400);
    }

    const secret = speakeasy.generateSecret({
      name: `${APP_NAME} (${user.email})`,
      length: 20,
    });
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url!);

    user.twoFactorSecret = secret.base32;
    await user.save({ validateBeforeSave: false });

    return successResponse({
      qrCodeDataUrl,
      secret: secret.base32,
      message: 'Scan the QR code with your authenticator app, then enter the 6-digit code to enable 2FA.',
    });
  } catch (err) {
    console.error('Auth setup 2FA error:', err);
    return serverErrorResponse();
  }
}

export async function enable2FA(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const parsed = enable2FASchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.errors.map((e) => ({ message: e.message })));
    }
    const { otp } = parsed.data;

    const { rateLimit } = await import('@/lib/rate-limit');
    const { success } = rateLimit(`2fa-enable:${session.userId}`, 'auth:otp', {
      windowMs: OTP_RATE_LIMIT.windowMs,
      max: OTP_RATE_LIMIT.max,
    });
    if (!success) {
      return errorResponse('Too many attempts. Try again in 15 minutes.', 429);
    }

    await connectDB();
    const user = await User.findById(session.userId).select('+twoFactorSecret');
    if (!user) return unauthorizedResponse();
    if (user.twoFactorEnabled) {
      return errorResponse('Two-factor authentication is already enabled.', 400);
    }
    if (!user.twoFactorSecret) {
      return errorResponse('Please complete the 2FA setup first (scan QR code).', 400);
    }

    const valid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: otp,
      window: 1,
    });
    if (!valid) {
      return errorResponse('Invalid or expired code. Try again.', 401);
    }

    user.twoFactorEnabled = true;
    await user.save({ validateBeforeSave: false });

    return successResponse({
      message: 'Two-factor authentication is now enabled.',
    });
  } catch (err) {
    console.error('Auth enable 2FA error:', err);
    return serverErrorResponse();
  }
}

export async function disable2FA(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const parsed = disable2FASchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.errors.map((e) => ({ message: e.message })));
    }
    const { password } = parsed.data;

    await connectDB();
    const user = await User.findById(session.userId).select('+password +twoFactorSecret');
    if (!user) return unauthorizedResponse();
    if (!user.twoFactorEnabled) {
      return errorResponse('Two-factor authentication is not enabled.', 400);
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return errorResponse('Incorrect password.', 401);
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save({ validateBeforeSave: false });

    return successResponse({
      message: 'Two-factor authentication has been disabled.',
    });
  } catch (err) {
    console.error('Auth disable 2FA error:', err);
    return serverErrorResponse();
  }
}
