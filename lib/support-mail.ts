import "server-only";

type SupportAttachment = {
  content: string;
  filename: string;
};

export async function sendSupportEmail({
  attachments,
  html,
  replyTo,
  subject,
  text,
}: {
  attachments: SupportAttachment[];
  html: string;
  replyTo: string;
  subject: string;
  text: string;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.SUPPORT_FROM_EMAIL?.trim();
  const to = process.env.SUPPORT_EMAIL?.trim() || "nuvorate.contact@gmail.com";

  if (!apiKey || !from) {
    throw new Error("Support mail is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: replyTo,
      subject,
      text,
      html,
      attachments,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Support mail delivery failed.");
  }
}

export function isSupportMailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.SUPPORT_FROM_EMAIL?.trim());
}
