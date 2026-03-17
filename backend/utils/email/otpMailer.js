/**
 * utils/email/otpMailer.js
 * AI Resume Analyser — OTP Email Sender
 */

import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcryptjs";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      `Email credentials missing.\n` +
      `GMAIL_USER: ${user ? "set ✅" : "MISSING ❌"}\n` +
      `GMAIL_APP_PASSWORD: ${pass ? "set ✅" : "MISSING ❌"}`
    );
  }

  console.log("📧 Initializing Gmail SMTP...");
  console.log("GMAIL_USER:", user);
  console.log("APP_PASSWORD length:", pass.length);

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user,
      pass
    }
  });

  // Verify SMTP connection once
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ SMTP connection failed:", error.message);
    } else {
      console.log("✅ Gmail SMTP ready");
    }
  });

  return transporter;
}

export function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

export async function hashOTP(otp) {
  return bcrypt.hash(otp, 10);
}

export async function verifyOTP(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

export async function sendVerifyEmail(to, name, otp) {
  const mailer = getTransporter();

  console.log("🔐 Sending verification OTP:", otp); // dev debugging

  const info = await mailer.sendMail({
    from: `"AI Resume Analyser" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Verify your email — AI Resume Analyser",
    html: buildEmailTemplate({
      title: "Verify Your Email",
      heading: `Hi ${name}! 👋`,
      body: "Use the OTP below to verify your email address. It expires in <strong>10 minutes</strong>.",
      otp,
      note: "If you didn't create an account, you can safely ignore this email."
    })
  });

  console.log("📨 Email sent:", info.messageId);
}

export async function sendLoginOTP(to, name, otp) {
  const mailer = getTransporter();

  console.log("🔐 Sending login OTP:", otp); // dev debugging

  const info = await mailer.sendMail({
    from: `"AI Resume Analyser" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Your login code — AI Resume Analyser",
    html: buildEmailTemplate({
      title: "Login Verification",
      heading: `Welcome back, ${name}!`,
      body: "Use the OTP below to complete your login. It expires in <strong>10 minutes</strong>.",
      otp,
      note: "If you didn't try to log in, please change your password immediately."
    })
  });

  console.log("📨 Email sent:", info.messageId);
}

function buildEmailTemplate({ title, heading, body, otp, note }) {
  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><title>${title}</title></head>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
          style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
          <tr>
            <td style="background:#6366f1;padding:28px 40px;">
              <p style="margin:0;color:#fff;font-size:20px;font-weight:700;">
                🧠 AI Resume Analyser
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px 28px;">
              <h2 style="margin:0 0 12px;font-size:22px;color:#111827;">${heading}</h2>
              <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">${body}</p>

              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;
                          padding:24px;text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6b7280;
                           letter-spacing:1.5px;text-transform:uppercase;">
                  Your One-Time Password
                </p>

                <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:12px;
                           color:#6366f1;font-family:'Courier New',monospace;">
                  ${otp}
                </p>

                <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">
                  Valid for 10 minutes · Do not share this code
                </p>
              </div>

              <p style="margin:0;font-size:13px;color:#9ca3af;border-top:1px solid #f3f4f6;
                         padding-top:20px;line-height:1.6;">
                ${note}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 40px;background:#f9fafb;border-top:1px solid #f3f4f6;">
              <p style="margin:0;font-size:12px;color:#d1d5db;text-align:center;">
                © ${new Date().getFullYear()} AI Resume Analyser · Built with ❤️
              </p>
            </td>
          </tr>

        </table>
      </td></tr>
    </table>
  </body>
  </html>`;
}