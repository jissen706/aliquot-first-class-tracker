/**
 * Stub for email notifications. MVP: log to console and optionally store in DB.
 * Replace with real email (SendGrid, Resend, etc.) later.
 */
export async function notifyEmail(params: {
  to: string;
  subject: string;
  body: string;
}): Promise<void> {
  // eslint-disable-next-line no-console
  console.log("[EMAIL STUB]", { to: params.to, subject: params.subject, body: params.body.slice(0, 200) });
}
