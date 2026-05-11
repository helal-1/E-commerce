import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { customerName, customerEmail, orderId, totalPrice } = await req.json();

        // فحص الإيميل
        if (!customerEmail || !customerEmail.includes("@")) {
            return NextResponse.json({ error: "Invalid Email" }, { status: 400 });
        }

        const { data, error } = await resend.emails.send({
            // السطر ده لازم يكون كدة بالظبط في الحساب المجاني
            from: "onboarding@resend.dev",
            // في الحساب المجاني، يفضل تبعت لإيميلك الشخصي اللي سجلت بيه (للتجربة فقط)
            to: [customerEmail],
            subject: `Zelda Line Order - #${orderId.slice(0, 8)}`,
            replyTo: "support@zeldaline.com", // لو العميل رد يجيلك هنا
            html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
          <h1 style="color: #4A3E31;">ZELDA LINE</h1>
          <p>مرحباً <strong>${customerName}</strong> ✨</p>
          <p>تم تأكيد طلبك رقم <strong>#${orderId.slice(0, 8)}</strong> بنجاح بقيمة <strong>${totalPrice} ج.م</strong>.</p>
          <p>شكراً لثقتك بنا ❤️</p>
        </div>
      `,
        });

        if (error) {
            console.error("Resend Error:", error);
            return NextResponse.json({ error }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
