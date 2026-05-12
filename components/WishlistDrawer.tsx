"use client";

import { useWishlist } from '@/app/context/WishlistContext';
import { useCart } from '@/app/context/CartContext';
import { X, Heart, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

// تعريف نوع البيانات للمنتج
interface WishlistItem {
    id: string | number;
    name: string;
    price: number;
    image?: string;
    images?: string[];
}

export default function WishlistDrawer() {
    const { wishlist, removeFromWishlist, isWishlistOpen, setIsWishlistOpen } = useWishlist();
    const { addToCart, setIsCartOpen } = useCart();

    if (!isWishlistOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-[#4A3E31]/40 backdrop-blur-sm transition-opacity"
                onClick={() => setIsWishlistOpen(false)}
            />

            {/* Sidebar Content */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-8 border-b border-[#EDEAE5] flex justify-between items-center bg-[#FCFBF9]">
                    <div className="flex items-center gap-3">
                        <Heart className="text-[#A66C6C] fill-[#A66C6C]" size={20} />
                        <h2 className="text-xl font-serif text-[#4A3E31]">المفضلات</h2>
                        <span className="bg-[#EDEAE5] text-[#8B735B] text-[10px] font-black px-2 py-0.5 rounded-full">
                            {wishlist.length}
                        </span>
                    </div>
                    <button onClick={() => setIsWishlistOpen(false)} className="p-2 hover:bg-[#F7F3F0] rounded-full transition-colors">
                        <X size={20} className="text-[#A6998A]" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" dir="rtl">
                    {wishlist.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                            <Heart size={48} className="text-[#D4C3B3]" />
                            <p className="font-serif italic text-[#8B735B]">قائمة المفضلات فارغة حالياً</p>
                            <button
                                onClick={() => setIsWishlistOpen(false)}
                                className="text-xs font-black uppercase border-b border-[#8B735B] pb-1 text-[#4A3E31]"
                            >
                                اكتشفي مجموعتنا الآن
                            </button>
                        </div>
                    ) : (
                        wishlist.map((item: WishlistItem) => {
                            // تحديد رابط الصورة النهائي لضمان عدم تمرير undefined
                            const finalImage = item.image || item.images?.[0] || '/placeholder.png';

                            return (
                                <div key={item.id} className="flex gap-4 p-4 rounded-3xl border border-[#F7F3F0] hover:border-[#EDEAE5] transition-all group">
                                    <div className="w-24 h-32 relative rounded-2xl overflow-hidden shrink-0 border border-[#EDEAE5]">
                                        <Image src={finalImage} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <h3 className="text-sm font-black text-[#4A3E31] mb-1">{item.name}</h3>
                                            <p className="text-[#8B735B] font-serif italic text-xs">{item.price.toLocaleString()} ج.م</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    // الحل: نرسل كائن جديد يحتوي على القيمة المؤكدة للصورة
                                                    addToCart({
                                                        id: item.id,
                                                        name: item.name,
                                                        price: item.price,
                                                        image: finalImage, // القيمة هنا string يقيناً
                                                        quantity: 1,
                                                        size: 'M',
                                                        color: 'Gold'
                                                    });
                                                    removeFromWishlist(item.id);
                                                    setIsWishlistOpen(false);
                                                    setIsCartOpen(true);
                                                }}
                                                className="flex-1 bg-[#4A3E31] text-white text-[10px] font-black uppercase py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-all"
                                            >
                                                <ShoppingBag size={12} /> نقله للسلة
                                            </button>
                                            <button
                                                onClick={() => removeFromWishlist(item.id)}
                                                className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {wishlist.length > 0 && (
                    <div className="p-8 border-t border-[#EDEAE5] bg-[#FCFBF9]">
                        <button
                            onClick={() => setIsWishlistOpen(false)}
                            className="w-full py-4 border-2 border-[#4A3E31] text-[#4A3E31] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#4A3E31] hover:text-white transition-all flex items-center justify-center gap-3"
                        >
                            <ArrowLeft size={16} /> العودة للتسوق
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}