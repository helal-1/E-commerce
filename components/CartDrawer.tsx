"use client";

import { useEffect } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../app/context/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// تعريف الـ Interface لضمان توافق الأنواع وحل أخطاء TypeScript
interface CartItemData {
    id: string | number;
    name: string;
    price: number;
    quantity: number;
    size: string;
    color: string;
    image?: string;
    images?: string[];
}

export default function CartDrawer() {
    const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeItem, subtotal } = useCart();
    const router = useRouter();

    // منع التمرير في خلفية الصفحة عند فتح السلة لضمان تجربة مستخدم احترافية
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isCartOpen]);

    const handleCheckout = () => {
        setIsCartOpen(false);
        router.push('/checkout');
    };

    return (
        <div className={`fixed inset-0 z-[100] ${isCartOpen ? 'visible' : 'invisible'}`}>

            {/* الخلفية المظلمة - الآن تغطي الشاشة بالكامل z-index صحيح */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={() => setIsCartOpen(false)}
            />

            {/* محتوى السلة - تم تعديل التموضع ليكون في اليمين (أو اليسار حسب الرغبة) بشكل منسق */}
            <aside
                className={`fixed left-0 top-0 h-full w-full max-w-md bg-white shadow-[[-20px_0_50px_rgba(0,0,0,0.2)]] transition-transform duration-500 ease-in-out transform ${isCartOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col h-full bg-white" dir="rtl">

                    {/* Header منسق مع مسافات صحيحة */}
                    <div className="p-6 md:p-8 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                        <div className="flex flex-col">
                            <h2 className="text-xl md:text-2xl font-serif text-[#4A3E31]">سلة التسوق</h2>
                            <span className="text-[10px] text-[#8B735B] font-bold uppercase tracking-widest mt-1">
                                {cartItems.length} منتجات مختارة
                            </span>
                        </div>
                        <button
                            onClick={() => setIsCartOpen(false)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F7F3F0] text-[#A6998A] hover:text-black hover:rotate-90 transition-all duration-300"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* قائمة المنتجات مع خلفية نظيفة */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-white custom-scrollbar">
                        {cartItems.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-[#F7F3F0] rounded-full scale-150 animate-pulse" />
                                    <ShoppingBag size={40} strokeWidth={1} className="relative text-[#8B735B]" />
                                </div>
                                <div className="space-y-2 relative">
                                    <p className="font-serif italic text-lg text-[#4A3E31]">السلة فارغة حالياً</p>
                                    <p className="text-xs text-[#A6998A]">أضيفي بعض القطع الفنية لتبدأي رحلتك</p>
                                </div>
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="relative px-8 py-3 bg-[#4A3E31] text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-black transition-all"
                                >
                                    اكتشفي المجموعات
                                </button>
                            </div>
                        ) : (
                            cartItems.map((item: CartItemData) => (
                                <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-6 pb-6 border-b border-gray-50 last:border-0 group">
                                    {/* صورة المنتج مع تأثير عند الحوم */}
                                    <div className="w-20 h-28 md:w-24 md:h-32 bg-[#F7F3F0] rounded-2xl overflow-hidden shrink-0 relative">
                                        <Image
                                            src={(item.image || item.images?.[0]) || '/placeholder.png'}
                                            alt={item.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            sizes="96px"
                                        />
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between py-1 text-right">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-sm text-[#4A3E31] leading-tight">{item.name}</h4>
                                                <p className="text-[9px] text-[#8B735B] font-black uppercase mt-2 tracking-tighter">
                                                    {item.size} / {item.color}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id, item.size, item.color)}
                                                className="text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-center mt-4">
                                            <div className="flex items-center gap-3 bg-[#F7F3F0] px-3 py-1.5 rounded-full">
                                                <button onClick={() => updateQuantity(item.id, item.size, item.color, 1)} className="text-[#8B735B] hover:text-black">
                                                    <Plus size={12} />
                                                </button>
                                                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.size, item.color, -1)} className="text-[#8B735B] hover:text-black">
                                                    <Minus size={12} />
                                                </button>
                                            </div>
                                            <p className="font-black text-sm text-[#4A3E31] tracking-tighter">
                                                {(item.price * item.quantity).toLocaleString()} ج.م
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer ثابت في الأسفل بتصميم نظيف */}
                    {cartItems.length > 0 && (
                        <div className="p-8 border-t bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.03)] space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">المجموع الفرعي</span>
                                    <span className="font-black text-lg text-[#4A3E31]">{subtotal.toLocaleString()} ج.م</span>
                                </div>
                                <p className="text-[9px] text-[#8B735B] text-center italic">الأسعار شاملة ضريبة القيمة المضافة</p>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full bg-[#4A3E31] text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-[0.98]"
                            >
                                إتمام عملية الشراء
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}