import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * POST /api/newsletter  { email }
 * No email-service provider is wired up yet, so signups are validated and logged.
 * Replace the console.log with a call to your ESP (Klaviyo, Mailchimp, Resend…).
 */
export async function POST(request: Request) {
  let email: unknown;
  try {
    ({ email } = (await request.json()) as { email?: unknown });
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (typeof email !== 'string' || email.length > 254 || !EMAIL.test(email.trim())) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  console.log(`[newsletter] signup: ${email.trim().toLowerCase()}`);
  return NextResponse.json({ ok: true });
}
