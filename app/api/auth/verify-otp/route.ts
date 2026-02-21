export async function POST() {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'OTP verification is no longer required. You can sign in with your account.',
    }),
    {
      status: 410,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
