import nodemailer from "nodemailer";
import { logger } from "./logger";

const EMAIL_FROM = process.env["EMAIL_USER"] ?? "zentrivex669@gmail.com";
const EMAIL_PASS = process.env["EMAIL_PASS"];

function getAppUrl(): string {
  return (process.env["APP_URL"] || "https://zentrivex-invest.vercel.app").replace(/\/$/, "");
}

const APP_URL = getAppUrl();

function createTransport() {
  if (!EMAIL_PASS) {
    logger.warn("EMAIL_PASS not set — email sending disabled");
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_FROM, pass: EMAIL_PASS },
  });
}

const transporter = createTransport();

// ─── Base template ─────────────────────────────────────────────────────────

function baseTemplate(content: string, previewText = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Zentrivex</title>
</head>
<body style="margin:0;padding:0;background:#040f0e;font-family:Arial,Helvetica,sans-serif;">
${previewText ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${previewText}</div>` : ""}
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#040f0e;min-height:100vh;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">

      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#051a17 0%,#061f1b 100%);border:1px solid #1a3530;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#d97706;border-radius:10px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                  <span style="color:#000;font-weight:900;font-size:18px;">Z</span>
                </td>
                <td style="padding-left:10px;vertical-align:middle;">
                  <span style="color:#ffffff;font-size:20px;font-weight:900;letter-spacing:-0.5px;">Zentrivex</span>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>

      <!-- Body -->
      <tr><td style="background:#061410;border-left:1px solid #1a3530;border-right:1px solid #1a3530;padding:40px;">
        ${content}
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#040f0e;border:1px solid #1a3530;border-top:none;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
        <p style="color:#4a6b60;font-size:12px;margin:0 0 8px;">© 2026 Zentrivex Ltd. All rights reserved.</p>
        <p style="color:#4a6b60;font-size:11px;margin:0;">This email was sent from a no-reply address. Do not reply.</p>
        <p style="color:#4a6b60;font-size:11px;margin:8px 0 0;">Zentrivex · Real Estate &amp; Stock Market Investments</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function heading(text: string) {
  return `<h1 style="color:#ffffff;font-size:24px;font-weight:900;margin:0 0 8px;letter-spacing:-0.5px;">${text}</h1>`;
}

function subheading(text: string) {
  return `<p style="color:#7db8a8;font-size:14px;margin:0 0 28px;">${text}</p>`;
}

function para(text: string) {
  return `<p style="color:#a0c4b8;font-size:15px;line-height:1.6;margin:0 0 16px;">${text}</p>`;
}

function divider() {
  return `<div style="height:1px;background:#1a3530;margin:28px 0;"></div>`;
}

function infoRow(label: string, value: string, highlight = false) {
  return `<tr>
    <td style="padding:10px 14px;color:#7db8a8;font-size:13px;border-bottom:1px solid #0d2420;">${label}</td>
    <td style="padding:10px 14px;color:${highlight ? "#d97706" : "#ffffff"};font-size:13px;font-weight:${highlight ? "700" : "500"};text-align:right;border-bottom:1px solid #0d2420;">${value}</td>
  </tr>`;
}

function infoTable(rows: string) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#040f0e;border:1px solid #1a3530;border-radius:10px;overflow:hidden;margin:20px 0;">
    ${rows}
  </table>`;
}

function alertBox(type: "success" | "warning" | "danger", text: string) {
  const colors = {
    success: { bg: "#0a2e1e", border: "#166534", icon: "✓", iconBg: "#16a34a", text: "#86efac" },
    warning: { bg: "#2a1f00", border: "#854d0e", icon: "!", iconBg: "#ca8a04", text: "#fde047" },
    danger: { bg: "#2a0808", border: "#7f1d1d", icon: "✕", iconBg: "#dc2626", text: "#fca5a5" },
  };
  const c = colors[type];
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:${c.bg};border:1px solid ${c.border};border-radius:10px;margin:20px 0;">
    <tr>
      <td style="padding:16px;vertical-align:top;width:40px;">
        <div style="background:${c.iconBg};color:#000;font-weight:900;font-size:14px;width:24px;height:24px;border-radius:50%;text-align:center;line-height:24px;">${c.icon}</div>
      </td>
      <td style="padding:16px 16px 16px 0;color:${c.text};font-size:14px;line-height:1.5;">${text}</td>
    </tr>
  </table>`;
}

function button(text: string, url: string) {
  return `<div style="text-align:center;margin:28px 0 8px;">
    <a href="${url}" style="display:inline-block;background:#d97706;color:#000000;font-weight:700;font-size:15px;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">${text}</a>
  </div>`;
}

// ─── Email send utility ─────────────────────────────────────────────────────

export async function sendEmail(to: string, subject: string, html: string) {
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from: `"Zentrivex" <${EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    logger.info({ to, subject }, "Email sent");
  } catch (err) {
    logger.error({ err, to, subject }, "Failed to send email");
  }
}

// ─── Templates ─────────────────────────────────────────────────────────────

export function emailWelcome(firstName: string, email: string) {
  const content = `
    ${heading("Welcome to Zentrivex! 🎉")}
    ${subheading("Your investment account has been created")}
    ${para(`Hi <strong style="color:#fff;">${firstName}</strong>, welcome aboard! You now have full access to Zentrivex's real estate and stock market investment platform.`)}
    ${alertBox("success", "Your account is active and ready. Browse our investment plans and start building wealth today.")}
    ${divider()}
    <p style="color:#7db8a8;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Account Details</p>
    ${infoTable(
      infoRow("Name", firstName) +
      infoRow("Email", email) +
      infoRow("Account Status", "Active ✓", true)
    )}
    ${para("To start investing, complete your KYC verification and make your first deposit. Our team reviews deposits within 24 hours.")}
    ${button("Go to Dashboard →", "${APP_URL}/dashboard")}
  `;
  return baseTemplate(content, `Welcome ${firstName}! Your Zentrivex account is ready.`);
}

export function emailDepositSubmitted(firstName: string, amount: number, method: string, date: Date) {
  const content = `
    ${heading("Deposit Submitted")}
    ${subheading("We've received your deposit request")}
    ${para(`Hi <strong style="color:#fff;">${firstName}</strong>, your deposit has been received and is pending review. Our team will process it within 24 hours.`)}
    ${infoTable(
      infoRow("Amount", `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, true) +
      infoRow("Payment Method", method) +
      infoRow("Date", date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })) +
      infoRow("Status", "Pending Review")
    )}
    ${alertBox("warning", "Please do not make duplicate payments while your deposit is under review. You will be notified once it is approved.")}
    ${button("Track Your Deposit", "${APP_URL}/dashboard/deposit")}
  `;
  return baseTemplate(content, `Deposit of $${amount} received — under review`);
}

export function emailDepositApproved(firstName: string, amount: number, newBalance: number) {
  const content = `
    ${heading("Deposit Approved ✓")}
    ${subheading("Funds have been credited to your account")}
    ${para(`Great news, <strong style="color:#fff;">${firstName}</strong>! Your deposit has been approved and your account balance has been updated.`)}
    ${alertBox("success", `<strong>$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong> has been added to your investment account.`)}
    ${infoTable(
      infoRow("Deposit Amount", `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, true) +
      infoRow("New Balance", `$${newBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, true) +
      infoRow("Status", "Approved ✓")
    )}
    ${para("Your capital is now ready to be deployed. Browse our investment plans to start generating returns.")}
    ${button("Browse Investment Plans", "${APP_URL}/dashboard/plans")}
  `;
  return baseTemplate(content, `Deposit approved — $${amount} credited to your account`);
}

export function emailDepositRejected(firstName: string, amount: number, reason: string) {
  const content = `
    ${heading("Deposit Rejected")}
    ${subheading("Your deposit could not be processed")}
    ${para(`Hi <strong style="color:#fff;">${firstName}</strong>, unfortunately your deposit request has been rejected.`)}
    ${infoTable(
      infoRow("Amount", `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`) +
      infoRow("Status", "Rejected")
    )}
    ${alertBox("danger", `<strong>Reason:</strong> ${reason}`)}
    ${para("If you believe this is an error or need assistance, please contact our support team with your transaction details.")}
    ${button("Try Again", "${APP_URL}/dashboard/deposit")}
  `;
  return baseTemplate(content, `Deposit rejected — action required`);
}

export function emailWithdrawalSubmitted(firstName: string, amount: number, address: string, date: Date) {
  const shortAddr = address.length > 20 ? `${address.slice(0, 12)}...${address.slice(-6)}` : address;
  const content = `
    ${heading("Withdrawal Request Received")}
    ${subheading("Your withdrawal is being processed")}
    ${para(`Hi <strong style="color:#fff;">${firstName}</strong>, we've received your withdrawal request. Our team will process it within 24–48 hours.`)}
    ${infoTable(
      infoRow("Amount", `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, true) +
      infoRow("Destination", shortAddr) +
      infoRow("Date", date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })) +
      infoRow("Status", "Processing")
    )}
    ${alertBox("warning", "Please ensure your withdrawal address is correct. Transactions to incorrect addresses cannot be reversed.")}
    ${button("View Withdrawal Status", "${APP_URL}/dashboard/withdraw")}
  `;
  return baseTemplate(content, `Withdrawal of $${amount} is being processed`);
}

export function emailWithdrawalApproved(firstName: string, amount: number, address: string) {
  const shortAddr = address.length > 20 ? `${address.slice(0, 12)}...${address.slice(-6)}` : address;
  const content = `
    ${heading("Withdrawal Approved ✓")}
    ${subheading("Your funds are on their way")}
    ${para(`Great news, <strong style="color:#fff;">${firstName}</strong>! Your withdrawal has been approved and sent to your destination address.`)}
    ${alertBox("success", `<strong>$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong> has been sent to ${shortAddr}`)}
    ${infoTable(
      infoRow("Amount Sent", `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, true) +
      infoRow("Destination", shortAddr) +
      infoRow("Status", "Completed ✓")
    )}
    ${para("Network transfer times vary. Crypto withdrawals typically confirm within 30–60 minutes. Bank wire transfers may take 1–3 business days.")}
    ${button("View Transaction History", "${APP_URL}/dashboard/transactions")}
  `;
  return baseTemplate(content, `Withdrawal of $${amount} has been sent`);
}

export function emailWithdrawalRejected(firstName: string, amount: number, reason: string) {
  const content = `
    ${heading("Withdrawal Rejected")}
    ${subheading("Your withdrawal could not be processed")}
    ${para(`Hi <strong style="color:#fff;">${firstName}</strong>, we were unable to process your withdrawal request. Your funds have been returned to your account balance.`)}
    ${infoTable(
      infoRow("Amount", `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`) +
      infoRow("Status", "Rejected — Funds Returned")
    )}
    ${alertBox("danger", `<strong>Reason:</strong> ${reason}`)}
    ${para("Your balance has been restored. If you believe this is an error or need further assistance, please contact support.")}
    ${button("Go to Dashboard", "${APP_URL}/dashboard")}
  `;
  return baseTemplate(content, `Withdrawal rejected — funds returned to your balance`);
}

export function emailInvestmentPurchased(firstName: string, planName: string, amount: number, roiPercent: number, endDate: Date) {
  const estimatedProfit = amount * (roiPercent / 100);
  const totalReturn = amount + estimatedProfit;
  const content = `
    ${heading("Investment Active 🚀")}
    ${subheading("Your investment plan has been activated")}
    ${para(`Excellent, <strong style="color:#fff;">${firstName}</strong>! Your capital has been deployed and is now actively generating returns.`)}
    ${infoTable(
      infoRow("Plan", planName, true) +
      infoRow("Amount Invested", `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`) +
      infoRow("ROI", `${roiPercent}%`, true) +
      infoRow("Est. Profit", `$${estimatedProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, true) +
      infoRow("Est. Total Return", `$${totalReturn.toLocaleString("en-US", { minimumFractionDigits: 2 })}`) +
      infoRow("Maturity Date", endDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))
    )}
    ${alertBox("success", "Your investment is now generating returns. You will receive an email and a balance credit when your investment matures.")}
    ${button("Track Your Investment", "${APP_URL}/dashboard/investments")}
  `;
  return baseTemplate(content, `${planName} investment activated — ${roiPercent}% ROI`);
}

export function emailProfitCredited(firstName: string, planName: string, principal: number, profit: number, totalReturn: number) {
  const content = `
    ${heading("Profit Credited 💰")}
    ${subheading("Your investment has matured and returns have been paid")}
    ${para(`Congratulations, <strong style="color:#fff;">${firstName}</strong>! Your <strong style="color:#d97706;">${planName}</strong> investment has matured. Your principal and profits have been credited to your account.`)}
    ${alertBox("success", `<strong style="color:#86efac;">$${totalReturn.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong> has been added to your balance.`)}
    ${infoTable(
      infoRow("Plan", planName, true) +
      infoRow("Principal Returned", `$${principal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`) +
      infoRow("Profit Earned", `$${profit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, true) +
      infoRow("Total Credited", `$${totalReturn.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, true)
    )}
    ${para("Reinvest your returns to compound your wealth. Our premium plans offer up to 42.5% ROI.")}
    ${button("Reinvest Now", "${APP_URL}/dashboard/plans")}
  `;
  return baseTemplate(content, `$${profit.toLocaleString()} profit credited — your investment matured!`);
}

export function emailReferralBonus(firstName: string, referredName: string, bonusAmount: number, newBalance: number) {
  const content = `
    ${heading("Referral Bonus Earned 🎁")}
    ${subheading("Someone you invited just made their first deposit")}
    ${para(`Great news, <strong style="color:#fff;">${firstName}</strong>! <strong style="color:#fff;">${referredName}</strong>, who joined Zentrivex using your referral link, just made their first deposit — and you've earned a referral bonus.`)}
    ${alertBox("success", `<strong style="color:#86efac;">$${bonusAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong> has been added to your account balance.`)}
    ${infoTable(
      infoRow("Referral Bonus", `$${bonusAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, true) +
      infoRow("New Balance", `$${newBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, true)
    )}
    ${para("Keep sharing your referral link to keep earning bonuses every time a friend invests.")}
    ${button("View Your Referrals", "${APP_URL}/dashboard/referrals")}
  `;
  return baseTemplate(content, `Referral bonus earned — $${bonusAmount.toLocaleString()} credited!`);
}

export function emailKycSubmitted(firstName: string) {
  const content = `
    ${heading("KYC Submitted for Review")}
    ${subheading("Your verification documents are under review")}
    ${para(`Hi <strong style="color:#fff;">${firstName}</strong>, thank you for submitting your identity verification. Our compliance team typically reviews KYC submissions within 24–48 hours.`)}
    ${alertBox("warning", "Do not submit duplicate applications while your current one is under review. You will be notified by email once the review is complete.")}
    ${para("KYC verification is required before making withdrawals and accessing premium investment plans.")}
    ${button("View KYC Status", "${APP_URL}/dashboard/kyc")}
  `;
  return baseTemplate(content, `KYC submitted — under review`);
}

export function emailKycApproved(firstName: string) {
  const content = `
    ${heading("Identity Verified ✓")}
    ${subheading("Your KYC has been approved")}
    ${para(`Congratulations, <strong style="color:#fff;">${firstName}</strong>! Your identity has been verified and your account is now fully unlocked.`)}
    ${alertBox("success", "Your account is now fully verified. You can now access all investment plans and process withdrawals without restrictions.")}
    ${para("With full access enabled, explore our high-yield investment plans and start building your portfolio today.")}
    ${button("Explore Investment Plans", "${APP_URL}/dashboard/plans")}
  `;
  return baseTemplate(content, `KYC Approved — your account is fully verified!`);
}

export function emailKycRejected(firstName: string, reason: string) {
  const content = `
    ${heading("KYC Verification Failed")}
    ${subheading("Your documents could not be verified")}
    ${para(`Hi <strong style="color:#fff;">${firstName}</strong>, we were unable to verify your identity documents. Please review the reason below and resubmit.`)}
    ${alertBox("danger", `<strong>Reason:</strong> ${reason}`)}
    ${para("Please ensure your documents are:")}
    <ul style="color:#a0c4b8;font-size:14px;line-height:2;margin:0 0 20px;padding-left:20px;">
      <li>Clear and legible (not blurry or cropped)</li>
      <li>Valid and not expired</li>
      <li>Matching the personal information in your account</li>
      <li>Government-issued (passport, national ID, or driver's license)</li>
    </ul>
    ${button("Resubmit KYC", "${APP_URL}/dashboard/kyc")}
  `;
  return baseTemplate(content, `KYC rejected — please resubmit your documents`);
}
