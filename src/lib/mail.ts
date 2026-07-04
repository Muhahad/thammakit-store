import nodemailer from "nodemailer";
import { SITE } from "@/config/site";
import { formatTHB } from "@/lib/utils";

/**
 * SMTP transporter (Resend / Mailtrap / Gmail app password all work).
 * Transactional emails: order confirmation, shipping notice, password reset,
 * review reminder.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: Number(process.env.SMTP_PORT ?? 465) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
});

async function send(to: string, subject: string, html: string) {
  return transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
}

/** Order confirmation email (sent after payment is confirmed). */
export async function sendOrderConfirmation(to: string, order: {
  orderNumber: string;
  total: number;
}) {
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:auto">
      <h2>ขอบคุณสำหรับคำสั่งซื้อ 🙏</h2>
      <p>คำสั่งซื้อ <strong>${order.orderNumber}</strong> ได้รับการยืนยันแล้ว</p>
      <p>ยอดรวม: <strong>${formatTHB(order.total)}</strong></p>
      <p><a href="${SITE.url}/orders">ดูสถานะคำสั่งซื้อ</a></p>
      <hr/><small>${SITE.name}</small>
    </div>`;
  return send(to, `ยืนยันคำสั่งซื้อ ${order.orderNumber} — ${SITE.name}`, html);
}

/** Shipping notification with carrier + tracking number. */
export async function sendShippingNotification(to: string, order: {
  orderNumber: string;
  carrier: string;
  trackingNumber: string;
  trackUrl: string;
}) {
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:auto">
      <h2>คำสั่งซื้อของคุณจัดส่งแล้ว 📦</h2>
      <p>คำสั่งซื้อ <strong>${order.orderNumber}</strong> ถูกจัดส่งผ่าน ${order.carrier}</p>
      <p>เลขพัสดุ: <strong>${order.trackingNumber}</strong></p>
      <p><a href="${order.trackUrl}">ติดตามพัสดุ</a></p>
    </div>`;
  return send(to, `จัดส่งแล้ว ${order.orderNumber} — ${SITE.name}`, html);
}

/** Password reset email. */
export async function sendPasswordReset(to: string, resetUrl: string) {
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:auto">
      <h2>รีเซ็ตรหัสผ่าน</h2>
      <p>คลิกลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่ (หมดอายุใน 1 ชั่วโมง)</p>
      <p><a href="${resetUrl}">ตั้งรหัสผ่านใหม่</a></p>
      <p>หากคุณไม่ได้ร้องขอ กรุณาเพิกเฉยต่ออีเมลนี้</p>
    </div>`;
  return send(to, `รีเซ็ตรหัสผ่าน — ${SITE.name}`, html);
}
