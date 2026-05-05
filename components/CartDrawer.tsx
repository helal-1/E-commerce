"use client";
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../app/context/CartContext';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
    // جلب الدوال المحدثة التي تستقبل (id, size, color)
    const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeItem, subtotal } = useCart();
    const router = useRouter();

    const handleCheckout = () => {
        setIsCartOpen(false);
        router.push('/checkout');
    };

    return (
        <div className={`fixed inset-0 z-[200] ${isCartOpen ? 'visible' : 'invisible'}`}>
            {/* الخلفية المظلمة */}
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={() => setIsCartOpen(false)}
            />

            {/* محتوى السلة */}
            <div className={`absolute left-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-500 transform ${isCartOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full" dir="rtl">
                    {/* Header */}
                    <div className="p-8 border-b flex justify-between items-center">
                        <h2 className="text-xl font-serif">سلة التسوق ({cartItems.length})</h2>
                        <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-black transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* قائمة المنتجات */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                        {cartItems.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                                <ShoppingBag size={48} strokeWidth={1} />
                                <p>السلة فارغة حالياً</p>
                            </div>
                        ) : (
                            cartItems.map((item: any) => (
                                // التعديل: استخدام مفتاح فريد يجمع الـ ID والمواصفات
                                <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-6 border-b border-gray-50 pb-6 last:border-0">
                                    <div className="w-24 h-32 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                                        <img src={item.image || item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div className="flex justify-between items-start text-right">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-sm text-gray-900">{item.name}</h4>
                                                {/* إظهار المواصفات بوضوح */}
                                                <p className="text-[10px] text-amber-800 font-black uppercase mt-1">
                                                    المقاس: {item.size} | اللون: {item.color}
                                                </p>
                                            </div>
                                            {/* التعديل: تمرير المواصفات عند الحذف */}
                                            <button
                                                onClick={() => removeItem(item.id, item.size, item.color)}
                                                className="text-gray-300 hover:text-red-500 transition-colors mr-2"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-center mt-4">
                                            <div className="flex items-center gap-4 bg-gray-50 px-3 py-1 rounded-lg">
                                                {/* التعديل: تمرير المواصفات عند التحديث */}
                                                <button onClick={() => updateQuantity(item.id, item.size, item.color, 1)} className="hover:text-black text-gray-400">
                                                    <Plus size={14} />
                                                </button>
                                                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.size, item.color, -1)} className="hover:text-black text-gray-400">
                                                    <Minus size={14} />
                                                </button>
                                            </div>
                                            <p className="font-black text-sm text-gray-900">{item.price * item.quantity} ر.س</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {cartItems.length > 0 && (
                        <div className="p-8 border-t space-y-6 bg-gray-50/50">
                            <div className="flex justify-between items-center font-black text-lg">
                                <span className="font-serif text-gray-500">المجموع الفرعي</span>
                                <span>{subtotal} ر.س</span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full bg-black text-white py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl active:scale-[0.98]"
                            >
                                إتمام عملية الشراء
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}