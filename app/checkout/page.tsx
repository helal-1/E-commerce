"use client";
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // استيراد مكون الصورة المطور
import {
    MapPin,
    Phone,
    User,
    Mail,
    ArrowRight,
    CheckCircle2,
    ShoppingBag,
    Truck
} from 'lucide-react';

// تعريف الأنواع لمنع خطأ any
interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    size: string;
    color: string;
}

export default function CheckoutPage() {
    const { cartItems, subtotal, clearCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [orderCompleted, setOrderCompleted] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        city: '',
        address: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cartItems.length === 0) return;

        setLoading(true);

        try {
            const { error } = await supabase
                .from('orders')
                .insert([{
                    customer_name: formData.name,
                    customer_phone: formData.phone,
                    customer_email: formData.email,
                    city: formData.city,
                    address: formData.address,
                    total_price: subtotal,
                    status: 'pending',
                    items: cartItems
                }])
                .select();

            if (error) throw error;

            setOrderCompleted(true);
            clearCart();

            setTimeout(() => {
                router.push('/');
            }, 5000);

        } catch (error: unknown) {
            const err = error as Error;
            alert("حدث خطأ أثناء إتمام الطلب: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (orderCompleted) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4" dir="rtl">
                <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500">
                        <CheckCircle2 size={48} strokeWidth={1.5} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter">تم استلام طلبك!</h1>
                    <p className="text-gray-500 leading-relaxed font-medium">
                        شكراً لكِ على اختيار Zelda Line. ستصلك رسالة تأكيد على البريد الإلكتروني <span className="text-black font-bold">{formData.email}</span> فور مراجعة الطلب.
                    </p>
                    <div className="pt-4">
                        <button onClick={() => router.push('/')} className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors border-b border-gray-200 pb-1">
                            العودة للتسوق
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-20 font-sans" dir="rtl">
            <div className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-900">
                        <ArrowRight size={22} />
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Checkout</span>
                        <h1 className="text-lg font-serif font-black text-gray-900">إتمام الشراء</h1>
                    </div>
                    <div className="w-10" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    <div className="lg:col-span-7 space-y-8">
                        <section className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                            <h2 className="text-lg font-black mb-8 flex items-center gap-4 text-gray-900">
                                <span className="w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center text-xs shadow-lg shadow-black/20">01</span>
                                تفاصيل المستلم
                            </h2>

                            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 mr-2 uppercase tracking-widest text-right block">الاسم الكامل</label>
                                        <div className="relative">
                                            <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                            <input
                                                required
                                                type="text"
                                                className="w-full pr-12 pl-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black/5 focus:ring-0 outline-none transition-all text-sm font-bold text-right"
                                                placeholder="الاسم كما يظهر في البطاقة"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 mr-2 uppercase tracking-widest text-right block">رقم الهاتف</label>
                                        <div className="relative">
                                            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                            <input
                                                required
                                                type="tel"
                                                className="w-full pr-12 pl-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black/5 focus:ring-0 outline-none transition-all text-sm font-bold text-right"
                                                placeholder="01xxxxxxxxx"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 mr-2 uppercase tracking-widest text-right block">البريد الإلكتروني</label>
                                    <div className="relative">
                                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <input
                                            required
                                            type="email"
                                            className="w-full pr-12 pl-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black/5 focus:ring-0 outline-none transition-all text-sm font-bold text-right"
                                            placeholder="example@domain.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 mr-2 uppercase tracking-widest text-right block">المحافظة / المدينة</label>
                                        <div className="relative">
                                            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                            <input
                                                required
                                                type="text"
                                                className="w-full pr-12 pl-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black/5 focus:ring-0 outline-none transition-all text-sm font-bold text-right"
                                                placeholder="القاهرة، الإسكندرية..."
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 mr-2 uppercase tracking-widest text-right block">العنوان التفصيلي</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black/5 focus:ring-0 outline-none transition-all text-sm font-bold text-right"
                                            placeholder="رقم الشقة، الدور، اسم الشارع"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </form>
                        </section>

                        <section className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm">
                            <h2 className="text-lg font-black mb-8 flex items-center gap-4 text-gray-900">
                                <span className="w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center text-xs shadow-lg shadow-black/20">02</span>
                                طريقة الدفع
                            </h2>
                            <div className="relative group cursor-pointer">
                                <div className="p-6 border-2 border-black rounded-4xl flex justify-between items-center bg-black/5 transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/10">
                                            <Truck size={24} />
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-sm text-gray-900">الدفع عند الاستلام</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">Cash on delivery</p>
                                        </div>
                                    </div>
                                    <div className="w-6 h-6 border-[3px] border-black rounded-full flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 bg-black rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-2xl sticky top-32">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-lg font-black text-gray-900">ملخص الحقيبة</h2>
                                <ShoppingBag size={20} className="text-gray-300" />
                            </div>

                            <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 mb-8 custom-scrollbar">
                                {cartItems.map((item: CartItem) => (
                                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-5 group">
                                        <div className="w-20 h-24 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100 relative">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="flex-1 text-right py-1">
                                            <h4 className="font-bold text-xs text-gray-900 mb-1 leading-relaxed">{item.name}</h4>
                                            <p className="text-[10px] text-gray-400 font-black mb-2 uppercase tracking-tighter">
                                                Size: {item.size} / Qty: {item.quantity}
                                            </p>
                                            <p className="font-black text-sm text-gray-900">{item.price * item.quantity} ج.م</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 border-t border-gray-50 pt-6">
                                <div className="flex justify-between text-gray-400 font-bold text-xs uppercase tracking-widest">
                                    <span>المجموع</span>
                                    <span className="text-gray-900">{subtotal} ج.م</span>
                                </div>
                                <div className="flex justify-between text-gray-400 font-bold text-xs uppercase tracking-widest">
                                    <span>الشحن</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between text-2xl font-black pt-6 text-gray-900">
                                    <span className="font-serif italic text-lg text-gray-400">Total</span>
                                    <span>{subtotal} <span className="text-xs font-black mr-1">EGP</span></span>
                                </div>
                            </div>

                            <button
                                form="checkout-form"
                                type="submit"
                                disabled={loading || cartItems.length === 0}
                                className="w-full bg-black text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all shadow-xl shadow-black/10 active:scale-[0.98] mt-10 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </span>
                                ) : (
                                    "تأكيد الطلب الآن"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}