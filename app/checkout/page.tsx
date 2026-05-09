"use client";

import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation'; // للتوجيه بعد الطلب
import {
    ChevronDown,
    Truck,
    MapPin,
    Phone,
    User,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
    const { cartItems, subtotal, clearCart } = useCart(); // أضفنا clearCart هنا
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    // 1. جلب بيانات المستخدم عند تحميل الصفحة لربط الطلب
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, []);

    const shipping = subtotal > 500 ? 0 : 35;
    const total = subtotal + shipping;

    const sendToWhatsApp = (formData: any) => {
        const phoneNumber = "201092882189";

        let itemsList = "";
        cartItems.forEach((item: any, index: number) => {
            itemsList += `${index + 1}- *${item.name}*\n`;
            itemsList += `   المقاس: ${item.size} | اللون: ${item.color}\n`;
            itemsList += `   الكمية: ${item.quantity} × ${item.price} = *${item.quantity * item.price} EGY*\n`;
            itemsList += `--------------------------\n`;
        });

        const message = `🛍️ *طلب جديد من Zeldaline*
--------------------------
👤 *بيانات العميل:*
• الاسم: ${formData.name}
• الجوال: ${formData.phone}
• العنوان: ${formData.address}
• المدينة: ${formData.city}

🛒 *تفاصيل المنتجات:*
--------------------------
${itemsList}
💰 *الحساب الإجمالي:*
• المجموع الفرعي: ${subtotal} EGY
• الشحن: ${shipping === 0 ? 'مجاني' : shipping + ' EGY'}
• *الإجمالي النهائي: ${total} EGY*

💳 *طريقة الدفع:* الدفع عند الاستلام
--------------------------
تم الإرسال من الموقع ✨`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (cartItems.length === 0) return;

        setIsSubmitting(true);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const customerData = {
            name: formData.get('fullName'),
            phone: formData.get('phoneNumber'),
            address: formData.get('address'),
            city: formData.get('city'),
        };

        try {
            // 2. حفظ الطلب في قاعدة البيانات مع الـ user_id
            const { error } = await supabase.from('orders').insert([{
                user_id: user?.id, // الربط التقني بالحساب
                customer_name: customerData.name,
                customer_phone: customerData.phone,
                address: customerData.address,
                city: customerData.city,
                total_price: total,
                items: cartItems,
                status: 'pending'
            }]);

            if (error) throw error;

            // 3. الخطوات المضافة لتحسين تجربة المستخدم
            sendToWhatsApp(customerData); // إرسال الواتساب
            clearCart(); // تفريغ السلة فوراً
            router.push('/profile'); // توجيه المستخدم لصفحة حسابه لرؤية الطلب
            router.refresh();

        } catch (error) {
            console.error("Error:", error);
            // في حالة الخطأ، نرسل واتساب أيضاً لضمان وصول الطلب لك
            sendToWhatsApp(customerData);
            clearCart();
            router.push('/profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#FAFAFA] pt-32 pb-20 px-6 md:px-12" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-serif mb-12 text-right">إتمام الشراء</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-7 space-y-8">
                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-10">
                            <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-black">1</div>
                                    <h2 className="text-xl font-black">تفاصيل الشحن</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 text-right">
                                        <label className="text-xs font-black text-gray-400 mr-2">الاسم الكامل</label>
                                        <div className="relative">
                                            <input name="fullName" required type="text" placeholder="الاسم الكامل" className="w-full bg-gray-50 border-none p-4 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all text-right" />
                                            <User className="absolute right-4 top-4 text-gray-300" size={18} />
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-right">
                                        <label className="text-xs font-black text-gray-400 mr-2">رقم الجوال</label>
                                        <div className="relative">
                                            <input name="phoneNumber" required type="tel" placeholder="05xxxxxxxx" className="w-full bg-gray-50 border-none p-4 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all text-right font-mono" />
                                            <Phone className="absolute right-4 top-4 text-gray-300" size={18} />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2 text-right">
                                        <label className="text-xs font-black text-gray-400 mr-2">العنوان</label>
                                        <div className="relative">
                                            <input name="address" required type="text" placeholder="الحي، الشارع، رقم المنزل" className="w-full bg-gray-50 border-none p-4 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all text-right" />
                                            <MapPin className="absolute right-4 top-4 text-gray-300" size={18} />
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-right">
                                        <label className="text-xs font-black text-gray-400 mr-2">المحافظة</label>
                                        <div className="relative">
                                            <select
                                                name="governorate"
                                                required
                                                defaultValue="" // الطريقة الصحيحة بدلاً من selected على option
                                                className="w-full bg-gray-50 border-none p-4 pr-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all text-right text-gray-900 appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>اختر المحافظة</option>

                                                {/* محافظات مصر بالترتيب */}
                                                <option value="القاهرة">القاهرة</option>
                                                <option value="الجيزة">الجيزة</option>
                                                <option value="الإسكندرية">الإسكندرية</option>
                                                <option value="الدقهلية">الدقهلية</option>
                                                <option value="البحر الأحمر">البحر الأحمر</option>
                                                <option value="البحيرة">البحيرة</option>
                                                <option value="الفيوم">الفيوم</option>
                                                <option value="الغربية">الغربية</option>
                                                <option value="الإسماعيلية">الإسماعيلية</option>
                                                <option value="المنوفية">المنوفية</option>
                                                <option value="القليوبية">القليوبية</option>
                                                <option value="الوادي الجديد">الوادي الجديد</option>
                                                <option value="السويس">السويس</option>
                                                <option value="الشرقية">الشرقية</option>
                                                <option value="بورسعيد">بورسعيد</option>
                                                <option value="دمياط">دمياط</option>
                                                <option value="مطروح">مطروح</option>
                                                <option value="كفر الشيخ">كفر الشيخ</option>
                                                <option value="بني سويف">بني سويف</option>
                                                <option value="المنيا">المنيا</option>
                                                <option value="أسيوط">أسيوط</option>
                                                <option value="سوهاج">سوهاج</option>
                                                <option value="قنا">قنا</option>
                                                <option value="الأقصر">الأقصر</option>
                                                <option value="أسوان">أسوان</option>
                                                <option value="شمال سيناء">شمال سيناء</option>
                                                <option value="جنوب سيناء">جنوب سيناء</option>
                                            </select>

                                            {/* أيقونة السهم لتعويض الـ appearance-none وجعل الشكل فاخر */}
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                                                <ChevronDown size={18} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-black">2</div>
                                    <h2 className="text-xl font-black">الدفع</h2>
                                </div>
                                <div className="p-6 border-2 border-black rounded-2xl bg-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-5 h-5 rounded-full border-4 border-black bg-white"></div>
                                        <span className="font-bold">الدفع عند الاستلام</span>
                                    </div>
                                    <Truck size={20} className="text-gray-400" />
                                </div>
                            </section>
                        </form>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="sticky top-32 space-y-8">
                            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                                <h3 className="text-xl font-black mb-8 text-right border-b pb-6">ملخص الحقيبة</h3>
                                <div className="space-y-6 max-h-[300px] overflow-y-auto mb-8">
                                    {cartItems.map((item: any, idx: number) => (
                                        <div key={idx} className="flex gap-4 items-center flex-row-reverse">
                                            <div className="w-16 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                                                <img src={item.img || item.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 text-right">
                                                <h4 className="font-bold text-sm">{item.name}</h4>
                                                <p className="text-[10px] text-gray-400 font-black uppercase">{item.size} | {item.color}</p>
                                                <p className="text-sm font-black">{item.price} ر.س</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 border-t pt-8 font-bold">
                                    <div className="flex justify-between text-gray-500">
                                        <span>{subtotal} EGY</span>
                                        <span>المجموع الفرعي</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>{shipping === 0 ? 'مجاني' : `${shipping} EGY`}</span>
                                        <span>الشحن</span>
                                    </div>
                                    <div className="flex justify-between text-2xl font-black text-gray-900 pt-4 border-t border-dashed mt-4">
                                        <span>{total} EGY</span>
                                        <span>الإجمالي</span>
                                    </div>
                                </div>

                                <button
                                    form="checkout-form"
                                    disabled={isSubmitting || cartItems.length === 0}
                                    className="w-full mt-10 bg-black text-white py-6 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-zinc-800 transition-all disabled:bg-gray-100"
                                >
                                    {isSubmitting ? 'جاري الحفظ...' : 'تأكيد الطلب عبر واتساب'}
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}