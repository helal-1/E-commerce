import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// مفتاح HMAC السري تجده في لوحة تحكم Paymob لتأمين البيانات القادمة
const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET || "";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // الأرقام والبيانات اللي بنحتاجها لفك تشفير ومطابقة الـ HMAC
        const { obj } = body;
        if (!obj) return NextResponse.json({ status: "ignored" }, { status: 400 });

        // الترتيب الإجباري من Paymob لحساب الـ HMAC والتأكد أن الإشعار حقيقي ومش هكر
        const hmacData = 
            obj.amount_cents +
            obj.created_at +
            obj.currency +
            obj.error_occured +
            obj.has_parent_transaction +
            obj.id +
            obj.integration_id +
            obj.is_3d_secure +
            obj.is_auth +
            obj.is_capture +
            obj.is_voided +
            obj.is_refunded +
            obj.order.id +
            obj.owner +
            obj.pending +
            obj.source_data.pan +
            obj.source_data.sub_type +
            obj.source_data.type +
            obj.success;

        // حساب الـ Hash محلياً ومقارنته باللي جاي من سيرفر Paymob
        const calculatedHmac = crypto
            .createHmac('sha512', PAYMOB_HMAC_SECRET)
            .update(hmacData)
            .digest('hex');

        const receivedHmac = request.headers.get('x-hmac') || new URL(request.url).searchParams.get('hmac');

        // إذا كنت في وضع التست وتريد التخطي السريع يمكنك تعطيل هذا الشرط مؤقتاً
        if (PAYMOB_HMAC_SECRET && calculatedHmac !== receivedHmac) {
            return NextResponse.json({ error: "تم رفض التوقيع الأمني - Unauthorized HMAC" }, { status: 401 });
        }

        // نجيب الـ Paymob Order ID عشان نحدث بيه الأوردر المقابل في الـ Supabase
        const paymobOrderId = obj.order.id.toString();

        if (obj.success === true && obj.pending === false) {
            // الدفع نجح! نحدث حالة الطلب في جدولك لـ success
            const { error: dbError } = await supabase
                .from('orders')
                .update({ status: 'success' })
                .eq('payment_id', paymobOrderId);

            if (dbError) throw dbError;
            console.log(`✅ تم تحديث الطلب رقم ${paymobOrderId} بنجاح إلى success.`);
        } else {
            // الدفع فشل
            await supabase
                .from('orders')
                .update({ status: 'failed' })
                .eq('payment_id', paymobOrderId);
            console.log(`❌ فشلت عملية الدفع للطلب رقم ${paymobOrderId}.`);
        }

        return NextResponse.json({ status: "success" });

    } catch (error: unknown) {
        console.error("🔴 Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}