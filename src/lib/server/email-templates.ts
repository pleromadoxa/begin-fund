/**
 * B.E.G.I.N transactional email templates — Zipper Mail.
 *
 * Every template returns { subject, html, text } (both bodies always, per
 * Zipper's inbox-placement guidance). Brand: emerald #062b20, gold #c9a54c,
 * ivory #faf7f0 — the same visual language as the web platform.
 */

const BRAND = "B.E.G.I.N";
const SIGNOFF = "Ministry of Commerce, Loveworld Kingdom";
const YEAR = new Date().getFullYear();

const APP_URL = () =>
  (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");

/** Escapes user-controlled text before it enters email HTML. */
const esc = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

interface LayoutOptions {
  preheader: string;
  heading: string;
  body: string; // HTML fragment
  button?: { label: string; href: string };
  footerNote?: string;
}

function layout({ preheader, heading, body, button, footerNote }: LayoutOptions): string {
  const buttonHtml = button
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0"><tr><td style="border-radius:8px;background:#c9a54c">
         <a href="${button.href}" style="display:inline-block;padding:13px 30px;font-size:14px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#062b20;text-decoration:none">${button.label}</a>
       </td></tr></table>`
    : "";
  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#f4f1e9;font-family:Georgia,'Times New Roman',serif">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1e9;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e7e1d3">
        <tr><td style="background:#062b20;padding:26px 36px">
          <p style="margin:0;font-size:20px;letter-spacing:0.35em;font-weight:700;color:#c9a54c">${BRAND.split("").join(" ")}</p>
          <p style="margin:6px 0 0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#9fb5ab">Powered by the Ministry of Commerce</p>
        </td></tr>
        <tr><td style="padding:36px">
          <h1 style="margin:0 0 18px;font-size:24px;line-height:1.3;color:#062b20">${heading}</h1>
          ${body}
          ${buttonHtml}
        </td></tr>
        <tr><td style="background:#062b20;padding:22px 36px">
          <p style="margin:0;font-size:12px;color:#9fb5ab;line-height:1.6">
            ${footerNote ?? "The Business Expansion and Growth Initiative — a $1M interest-free fund for entrepreneurs in the Loveworld Kingdom, Ghana."}<br/>
            © ${YEAR} ${SIGNOFF}. All rights reserved.<br/>
            Christ Embassy Accra Ghana Zone — Accra, Ghana
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const p = (html: string) =>
  `<p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3c4a43">${html}</p>`;

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

/** Sent the moment an applicant creates an account. */
export function welcomeEmail(name: string, businessName: string): EmailContent {
  const firstName = name.split(" ")[0] || "friend";
  const hFirst = esc(firstName);
  const hBusiness = esc(businessName);
  const dash = `${APP_URL()}/dashboard`;
  const apply = `${APP_URL()}/apply`;
  return {
    subject: `Welcome to ${BRAND}, ${firstName} — your business just took a step of faith`,
    html: layout({
      preheader: "Thank you for taking a step to grow your business and lift the Kingdom.",
      heading: `Welcome to ${BRAND}, ${hFirst}!`,
      body:
        p(`Thank you for taking a step to grow your business and take the Kingdom to the next level. Your account for <strong>${hBusiness}</strong> is now live.`) +
        p(`The Business Expansion and Growth Initiative is a <strong>$1,000,000 interest-free fund</strong> set in motion at the Loveworld Trade &amp; Investment Forum for brethren across Ghana — and it was set in motion for businesses like yours.`) +
        p(`<strong>What happens next:</strong><br/>1. Complete your funding application — it takes about 10 minutes.<br/>2. The Review Committee studies every application personally.<br/>3. Track your progress in real time from your dashboard.`),
      button: { label: "Start your application", href: apply },
      footerNote: `Questions? Simply reply to this email or visit your dashboard at ${dash}.`,
    }),
    text: `Welcome to ${BRAND}, ${firstName}!\n\nThank you for taking a step to grow your business and take the Kingdom to the next level. Your account for ${businessName} is now live.\n\nThe Business Expansion and Growth Initiative is a $1,000,000 interest-free fund set in motion at the Loveworld Trade & Investment Forum for brethren across Ghana.\n\nWhat happens next:\n1. Complete your funding application — it takes about 10 minutes.\n2. The Review Committee studies every application personally.\n3. Track your progress in real time from your dashboard.\n\nStart your application: ${apply}\n\n${SIGNOFF}`,
  };
}

/** Sent when an applicant requests a password reset. */
export function passwordResetEmail(name: string, token: string): EmailContent {
  const firstName = name.split(" ")[0] || "friend";
  const resetUrl = `${APP_URL()}/reset-password?token=${encodeURIComponent(token)}`;
  return {
    subject: `Reset your ${BRAND} password`,
    html: layout({
      preheader: "A secure link to reset your password — valid for 60 minutes.",
      heading: `Password reset requested`,
      body:
        p(`Hello ${esc(firstName)}, we received a request to reset the password for your ${BRAND} account.`) +
        p(`Tap the button below to choose a new password. This secure link expires in <strong>60 minutes</strong> and can be used once.`) +
        p(`If you did not request this, you can safely ignore this email — your account stays protected.`),
      button: { label: "Reset my password", href: resetUrl },
      footerNote: `For your security this link expires in 60 minutes. Need help? Reply to this email.`,
    }),
    text: `Hello ${firstName},\n\nWe received a request to reset the password for your ${BRAND} account.\n\nReset your password here (valid for 60 minutes, one use):\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.\n\n${SIGNOFF}`,
  };
}

/** Sent when the Review Committee approves an application. */
export function approvalEmail(
  name: string,
  businessName: string,
  tier: number | null,
  reference: string,
  amountRequested: number | null,
): EmailContent {
  const firstName = name.split(" ")[0] || "friend";
  const dash = `${APP_URL()}/dashboard`;
  const tierLine = tier
    ? `Your application has been approved for <strong>Tier ${tier}</strong> funding.`
    : `Your application has been approved for funding.`;
  const amountLine = amountRequested
    ? `<br/>Amount requested: <strong>GHS ${amountRequested.toLocaleString("en-US")}</strong>`
    : "";
  return {
    subject: `🎉 Approved — ${BRAND} funding for ${businessName}`,
    html: layout({
      preheader: "Your B.E.G.I.N funding application has been approved.",
      heading: `Congratulations, ${firstName} — you are approved!`,
      body:
        p(`Great news! The Review Committee has approved your ${BRAND} application for <strong>${businessName}</strong>.`) +
        p(`${tierLine}${amountLine}<br/>Reference: <strong>${reference}</strong>`) +
        p(`This is interest-free capital — 0% interest, up to 6 months, principal only — committed to helping you grow and take the Kingdom to the next level. Sign in to your dashboard for the full details and the next steps from the Ministry of Commerce.`),
      button: { label: "View your dashboard", href: dash },
      footerNote: `Disbursement details will follow on your dashboard. Congratulations once again from all of us at the Ministry of Commerce.`,
    }),
    text: `Congratulations, ${firstName} — you are approved!\n\nThe Review Committee has approved your ${BRAND} application for ${businessName}.\n${tier ? `Tier: Tier ${tier}\n` : ""}${amountRequested ? `Amount requested: GHS ${amountRequested.toLocaleString("en-US")}\n` : ""}Reference: ${reference}\n\nThis is interest-free capital — 0% interest, up to 6 months, principal only. Sign in to your dashboard for full details and next steps.\n\n${dash}\n\n${SIGNOFF}`,
  };
}

/** Sent when the committee marks an application not successful. */
export function rejectionEmail(
  name: string,
  businessName: string,
  reference: string,
): EmailContent {
  const firstName = name.split(" ")[0] || "friend";
  const dash = `${APP_URL()}/dashboard`;
  return {
    subject: `An update on your ${BRAND} application`,
    html: layout({
      preheader: "An update from the Review Committee.",
      heading: `An update on your application, ${firstName}`,
      body:
        p(`Thank you sincerely for applying to the ${BRAND} fund for <strong>${businessName}</strong> (reference <strong>${reference}</strong>).`) +
        p(`After prayerful review, the Committee was not able to approve this application for funding at this time. This is not a reflection of the value of your business — Kingdom enterprise is honoured, and we encourage you to grow, refine and apply again in a future cycle.`) +
        p(`Your dashboard remains open, and the Ministry of Commerce is cheering you on.`),
      button: { label: "Open your dashboard", href: dash },
    }),
    text: `Hello ${firstName},\n\nThank you sincerely for applying to the ${BRAND} fund for ${businessName} (reference ${reference}).\n\nAfter prayerful review, the Committee was not able to approve this application for funding at this time. This is not a reflection of the value of your business — we encourage you to grow, refine and apply again in a future cycle.\n\n${SIGNOFF}`,
  };
}

/** Sent when the committee asks the applicant for more information. */
export function moreInfoEmail(
  name: string,
  businessName: string,
  reference: string,
  request: string,
): EmailContent {
  const firstName = name.split(" ")[0] || "friend";
  const dash = `${APP_URL()}/dashboard`;
  return {
    subject: `Action needed — a quick question about your ${BRAND} application`,
    html: layout({
      preheader: "The Review Committee needs a little more information.",
      heading: `A quick question about your application, ${firstName}`,
      body:
        p(`The Review Committee is studying your application for <strong>${businessName}</strong> (reference <strong>${reference}</strong>) and needs one more detail before decisions are finalised.`) +
        p(`<strong>What they asked for:</strong><br/><em>${request}</em>`) +
        p(`Sign in to your dashboard to respond — the Committee reads every reply personally.`),
      button: { label: "Go to my dashboard", href: dash },
    }),
    text: `Hello ${firstName},\n\nThe Review Committee is studying your application for ${businessName} (reference ${reference}) and needs one more detail before decisions are finalised.\n\nWhat they asked for: ${request}\n\nSign in to your dashboard to respond.\n\n${dash}\n\n${SIGNOFF}`,
  };
}
