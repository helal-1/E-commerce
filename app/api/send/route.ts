import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { customerName, customerEmail, orderId, totalPrice } = await req.json();

        const data = await resend.emails.send({
            from: "Zelda Line <onboarding@resend.dev>", // بعدين تقدر تربطه بدومين موقعك
            to: [customerEmail],
            subject: `تم تأكيد طلبك بنجاح - #${orderId.slice(0, 8)}`,
            html: `
        <div dir="rtl" style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 20px;">
          <h1 style="color: #4A3E31; text-align: center;">ZELDA LINE</h1>
          <hr />
          <p>مرحباً <strong>${customerName}</strong> ✨</p>
          <p>يسعدنا إبلاغك بأنه تم تأكيد طلبك رقم <strong>#${orderId.slice(0, 8)}</strong> بنجاح.</p>
          <div style="background: #F7F3F0; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <p style="margin: 0;">إجمالي الطلب: <strong>${totalPrice} ج.م</strong></p>
          </div>
          <p>نحن الآن نقوم بتجهيز قطعتك الفنية بكل حب، وسنتواصل معكِ قريباً عند الشحن.</p>
          <p style="color: #8B735B;">شكراً لثقتك بنا ❤️</p>
        </div>
      `,
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error });
    }
}
