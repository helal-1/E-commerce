import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;

export async function POST(request: Request) {
    let customerData: any = {};
    
    try {
        const body = await request.json();
        const { 
            customer_name, 
            customer_phone, 
            customer_email, 
            address, 
            city, 
            total_price, 
            items, 
            user_id,
            idempotency_key 
        } = body;
        
        customerData = body;

        // 1. تحقق مبدئي من المفاتيح
        if (!PAYMOB_API_KEY || !INTEGRATION_ID || PAYMOB_API_KEY.includes("تستبدل") || INTEGRATION_ID.includes("رقم")) {
            console.warn("⚠️ مفاتيح Paymob غير مكتملة. التبديل للوضع الآمن.");
            return await handleSandboxFallback(customerData);
        }

        // 2. طلب الـ Authentication Token
        const authResponse = await fetch('https://accept.paymob.com/api/auth/tokens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
            cache: 'no-store'
        });
        
        if (!authResponse.ok) {
            console.error("🔴 فشل توكن Paymob، تحويل تلقائي للوضع التجريبي لعدم تعطيل المبيعات.");
            return await handleSandboxFallback(customerData);
        }
        
        const authData = await authResponse.json();
        const authToken = authData.token;

        // 3. تسجيل الأوردر داخل سيستم Paymob
        const orderResponse = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                auth_token: authToken,
                delivery_needed: "false",
                amount_cents: Math.round(total_price * 100),
                currency: "EGP",
                items: []
            }),
            cache: 'no-store'
        });
        
        if (!orderResponse.ok) return await handleSandboxFallback(customerData);
        const orderData = await orderResponse.json();
        const paymobOrderId = orderData.id;

        // 4. توليد مفتاح الدفع (Payment Key)
        const paymentKeyResponse = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                auth_token: authToken,
                amount_cents: Math.round(total_price * 100),
                expiration: 3600,
                order_id: paymobOrderId,
                billing_data: {
                    apartment: "NA", floor: "NA", building: "NA", street: "NA",
                    postal_code: "NA", city: city || "Cairo", country: "EG",
                    first_name: customer_name.split(' ')[0] || "Customer",
                    last_name: customer_name.split(' ')[1] || "User",
                    email: customer_email || "customer@example.com",
                    phone_number: customer_phone
                },
                currency: "EGP",
                integration_id: INTEGRATION_ID
            }),
            cache: 'no-store'
        });
        
        if (!paymentKeyResponse.ok) return await handleSandboxFallback(customerData);
        const paymentKeyData = await paymentKeyResponse.json();
        const paymentToken = paymentKeyData.token;

        const orderKey = idempotency_key || paymobOrderId.toString();

        // 🔒 الحل الأبدي والذكي لمنع التكرار وحل مشكلة الـ Constraint:
        // نتحقق أولاً لو كان الأوردر مسجلاً بالفعل في قاعدة البيانات من ضغطة سابقة أو ويب هوك سريع
        const { data: existingOrder } = await supabase
            .from('orders')
            .select('*')
            .eq('payment_id', orderKey)
            .maybeSingle();

        let supabaseOrder = existingOrder;

        if (!supabaseOrder) {
            // لو مش موجود، بنعمل insert كحالة pending عادية ونقفل العملية
            const { data: newOrder, error: dbError } = await supabase
                .from('orders')
                .insert([{
                    customer_name,
                    customer_phone,
                    customer_email,
                    city,
                    address,
                    total_price: Math.round(total_price),
                    items,
                    status: 'pending',
                    user_id: user_id || null,
                    payment_id: orderKey
                }])
                .select()
                .single();

            if (dbError) throw dbError;
            supabaseOrder = newOrder;
        }

        // 6. طلب رابط تحويل المحفظة الإلكترونية
        const walletResponse = await fetch('https://accept.paymob.com/api/acceptance/void_refund/execute_pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: {
                    identifier: customer_phone,
                    subtype: "WALLET"
                },
                payment_token: paymentToken
            }),
            cache: 'no-store'
        });
        
        const walletData = await walletResponse.json();
        const redirectUrl = walletData.iframe_redirection_url || walletData.pending_url;

        return NextResponse.json({ 
            success: true, 
            redirectUrl: redirectUrl || null, 
            orderId: supabaseOrder.id 
        });

    } catch (error: unknown) {
        console.error("🔴 خطأ غير متوقع:", error);
        return await handleSandboxFallback(customerData);
    }
}

async function handleSandboxFallback(data: any) {
    try {
        const { customer_name, customer_phone, customer_email, address, city, total_price, items, user_id, idempotency_key } = data;
        
        if (!customer_name) {
            return NextResponse.json({ success: false, message: "البيانات المرسلة غير مكتملة" }, { status: 400 });
        }

        const fallbackKey = idempotency_key || ("PAYMOB_TEST_" + Math.floor(Math.random() * 1000000));

        // التحقق في وضع الساند بوكس أيضاً لمنع تكرار البيانات
        const { data: existingOrder } = await supabase
            .from('orders')
            .select('*')
            .eq('payment_id', fallbackKey)
            .maybeSingle();

        let supabaseOrder = existingOrder;

        if (!supabaseOrder) {
            const { data: newOrder, error: dbError } = await supabase
                .from('orders')
                .insert([{
                    customer_name,
                    customer_phone,
                    customer_email,
                    city,
                    address,
                    total_price: Math.round(total_price),
                    items,
                    status: 'pending',
                    user_id: user_id || null,
                    payment_id: fallbackKey
                }])
                .select()
                .single();

            if (dbError) throw dbError;
            supabaseOrder = newOrder;
        }

        return NextResponse.json({ 
            success: true, 
            redirectUrl: null, 
            orderId: supabaseOrder.id 
        });
    } catch (dbErr: any) {
        return NextResponse.json({ success: false, message: dbErr.message }, { status: 500 });
    }
}