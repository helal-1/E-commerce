"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
    ShoppingBag,
    Heart,
    ShieldCheck,
    Truck,
    RotateCcw,
    ChevronRight,
    ChevronLeft,
    Star,
    ArrowRight,
    X,
    Ruler,
    Loader2
} from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import { useWishlist } from '@/app/context/WishlistContext'; // استيراد سياق المفضلات

export default function ProductDetails() {
    const router = useRouter();
    const params = useParams();
    const { addToCart, setIsCartOpen } = useCart();
    const { wishlist, addToWishlist } = useWishlist(); // جلب وظائف المفضلات

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImg, setSelectedImg] = useState(0);
    const [selectedSize, setSelectedSize] = useState('M');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [isDescExpanded, setIsDescExpanded] = useState(false);

    // التحقق إذا كان المنتج الحالي في المفضلات
    const isLiked = wishlist.some((item: any) => item.id === params.id);

    const fetchProduct = useCallback(async () => {
        if (!params.id) return;
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', params.id)
                .single();

            if (error) throw error;
            setProduct(data);

            if (!selectedColor && data.colors && data.colors.length > 0) {
                setSelectedColor(data.colors[0]);
            }
        } catch (error: any) {
            console.error("Error:", error.message);
        } finally {
            setLoading(false);
        }
    }, [params.id, selectedColor]);

    useEffect(() => {
        fetchProduct();

        const productChannel = supabase
            .channel(`product-${params.id}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'products', filter: `id=eq.${params.id}` },
                (payload) => {
                    setProduct(payload.new);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(productChannel);
        };
    }, [params.id, fetchProduct]);

    const handleAddToCart = () => {
        if (!product) return;
        const itemToAdd = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0],
            color: selectedColor,
            size: selectedSize,
            quantity: quantity
        };
        addToCart(itemToAdd);
        setIsCartOpen(true);
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#FCFBF9]">
            <Loader2 className="animate-spin text-[#8B735B]" size={40} />
            <p className="font-serif italic text-[#8B735B] mt-4">جاري تحميل التفاصيل الفاخرة...</p>
        </div>
    );

    if (!product) return (
        <div className="h-screen flex flex-col items-center justify-center text-center px-6">
            <h2 className="text-3xl font-serif mb-4 text-[#4A3E31]">القطعة غير موجودة</h2>
            <Link href="/shop" className="text-[#8B735B] underline">العودة للمتجر</Link>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#FCFBF9] pt-32 pb-20 px-6 md:px-12" dir="rtl">
            <div className="max-w-7xl mx-auto">

                {/* Navigation Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 border-b border-[#EDEAE5] pb-8">
                    <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#A6998A] order-2 md:order-1">
                        <Link href="/" className="hover:text-[#4A3E31] transition-colors">الرئيسية</Link>
                        <ChevronLeft size={12} />
                        <Link href="/shop" className="hover:text-[#4A3E31] transition-colors">المتجر</Link>
                        <ChevronLeft size={12} />
                        <span className="text-[#4A3E31]">{product.name}</span>
                    </nav>

                    <button onClick={() => router.push('/shop')} className="flex items-center gap-4 text-sm font-black uppercase tracking-[0.2em] group order-1 md:order-2 text-[#4A3E31]">
                        <span className="border-b-2 border-[#4A3E31] pb-1 group-hover:border-[#8B735B]">العودة للمتجر</span>
                        <div className="w-12 h-12 rounded-full border border-[#EDEAE5] flex items-center justify-center group-hover:bg-[#4A3E31] group-hover:text-white transition-all duration-500">
                            <ArrowRight size={20} />
                        </div>
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Gallery Section */}
                    <div className="flex-1 space-y-6">
                        <div className="relative aspect-[3/4] bg-[#F7F3F0] rounded-4xl overflow-hidden border border-[#EDEAE5] group shadow-sm">
                            <img src={product.images?.[selectedImg]} alt={product.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                        </div>
                        <div className="flex gap-4 justify-center">
                            {product.images?.map((img: string, idx: number) => (
                                <button key={idx} onClick={() => setSelectedImg(idx)} className={`relative w-20 aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all ${selectedImg === idx ? 'border-[#8B735B] scale-105 shadow-md' : 'border-transparent opacity-40 hover:opacity-100'}`}>
                                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 space-y-8 h-auto overflow-visible">
                        <div className="text-right space-y-4">
                            <h1 className="text-5xl font-serif text-[#4A3E31] leading-tight">{product.name}</h1>
                            <p className="text-3xl font-black text-[#8B735B] tracking-tighter">{product.price.toLocaleString()} ج.م</p>
                        </div>

                        {/* --- قسم الوصف المحدث بدون سكرول نهائياً --- */}
                        <div className="text-right space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A6998A]">وصف القطعة</h4>
                            <div className="relative h-auto overflow-visible">
                                <p
                                    className={`text-[#8B735B] leading-loose text-lg font-serif italic transition-all duration-700 ease-in-out ${!isDescExpanded ? 'max-h-[120px] overflow-hidden' : 'max-h-[2000px]'
                                        }`}
                                    style={{
                                        maskImage: !isDescExpanded ? 'linear-gradient(to bottom, black 50%, transparent 100%)' : 'none',
                                        WebkitMaskImage: !isDescExpanded ? 'linear-gradient(to bottom, black 50%, transparent 100%)' : 'none'
                                    }}
                                >
                                    {product.description || "قطعة فنية مشغولة يدوياً بكل حب، تعكس فخامة التطريز المصري الأصيل من زيلدا لاين."}
                                </p>

                                <button
                                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                                    className="text-[#4A3E31] text-xs font-black mt-4 underline underline-offset-4 hover:text-[#8B735B] transition-colors relative z-10"
                                >
                                    {isDescExpanded ? 'إخفاء التفاصيل' : 'قراءة الوصف بالكامل'}
                                </button>
                            </div>
                        </div>

                        {/* اختيار اللون */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="space-y-4 text-right pt-4">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#A6998A]">اللون المختار: <span className="text-[#4A3E31]">{selectedColor}</span></h4>
                                <div className="flex gap-4 justify-end">
                                    {product.colors.map((color: string) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-10 h-10 rounded-full border-4 transition-all hover:scale-110 ${selectedColor === color ? 'border-[#8B735B] ring-4 ring-[#8B735B]/10' : 'border-white shadow-md'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* اختيار المقاس */}
                        <div className="space-y-6 text-right pt-4">
                            <div className="flex justify-between items-end border-b border-[#F7F3F0] pb-4">
                                <button onClick={() => setIsSizeGuideOpen(true)} className="text-[10px] font-black uppercase text-[#8B735B] border-b border-[#8B735B] hover:text-[#4A3E31] transition-colors">دليل القياسات</button>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#A6998A]">المقاس المطلوب</h4>
                            </div>
                            <div className="flex gap-3 justify-end">
                                {['S', 'M', 'L', 'XL'].map(size => (
                                    <button key={size} onClick={() => setSelectedSize(size)} className={`w-16 h-16 rounded-2xl border-2 font-bold transition-all duration-300 ${selectedSize === size ? 'bg-[#4A3E31] text-white border-[#4A3E31] shadow-xl' : 'border-[#EDEAE5] text-[#D4C3B3] hover:border-[#8B735B]'}`}>{size}</button>
                                ))}
                            </div>
                        </div>

                        {/* التحكم في الكمية والإضافة */}
                        <div className="flex flex-col sm:flex-row gap-4 h-auto sm:h-20 pt-6">
                            <div className="flex items-center border-2 border-[#EDEAE5] rounded-3xl px-8 py-4 sm:py-0 gap-10 bg-white shadow-sm">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-2xl text-[#A6998A]">-</button>
                                <span className="font-black text-xl text-[#4A3E31]">{quantity}</span>
                                <button onClick={() => setQuantity(q => q + 1)} className="text-2xl text-[#A6998A]">+</button>
                            </div>
                            <button onClick={handleAddToCart} className="flex-1 bg-[#4A3E31] text-white rounded-3xl font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-2xl shadow-[#4A3E31]/20 py-6 sm:py-0">
                                <ShoppingBag size={22} /> إضافة للحقيبة
                            </button>
                            {/* زر المفضلة المفعل */}
                            <button
                                onClick={() => addToWishlist(product)}
                                className={`w-20 flex items-center justify-center border-2 rounded-3xl transition-all py-6 sm:py-0 ${isLiked ? 'border-[#A66C6C] bg-red-50 text-[#A66C6C]' : 'border-[#EDEAE5] bg-white text-[#4A3E31] hover:bg-red-50 hover:text-[#A66C6C]'}`}
                            >
                                <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
                            </button>
                        </div>

                        {/* أيقونات الثقة */}
                        <div className="grid grid-cols-3 gap-6 pt-12 border-t border-[#EDEAE5]">
                            {[{ icon: Truck, text: 'توصيل منزلي' }, { icon: RotateCcw, text: 'استبدال مرن' }, { icon: ShieldCheck, text: 'منتج أصلي' }].map((item, i) => (
                                <div key={i} className="text-center space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-[#F7F3F0] flex items-center justify-center mx-auto">
                                        <item.icon className="text-[#8B735B]" size={20} />
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#A6998A]">{item.text}</p>
                                </div>
                            ))}
                        </div>

                        {/* Accordions */}
                        <div className="pt-6 space-y-4 text-right">
                            {[
                                { title: 'الخامة والعناية بالقطعة', content: product.material || 'هذه القطعة مصنوعة من أجود أنواع الأقمشة المصرية. يُنصح بالتنظيف الجاف للحفاظ على جودة التطريز اليدوي.' },
                                { title: 'تفاصيل الشحن والتوصيل', content: 'تحتاج القطع الفنية إلى وقت للتحضير. التوصيل خلال 2-5 أيام عمل.' },
                                { title: 'سياسة الاستبدال والاسترجاع', content: 'يمكنكِ استبدال المنتج خلال 14 يوماً من تاريخ الاستلام.' }
                            ].map((detail, i) => (
                                <details key={i} className="group border-b border-[#EDEAE5] pb-6 outline-none">
                                    <summary className="flex justify-between items-center cursor-pointer list-none font-bold text-[#4A3E31] uppercase text-[10px] tracking-[0.2em] hover:text-[#8B735B] transition-colors">
                                        <span className="group-open:rotate-180 transition-transform duration-300 text-[#D4C3B3]">↓</span>
                                        {detail.title}
                                    </summary>
                                    <p className="text-[#A6998A] text-sm mt-6 leading-relaxed font-serif italic">{detail.content}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Size Guide Modal */}
            {isSizeGuideOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-[#4A3E31]/60 backdrop-blur-md" onClick={() => setIsSizeGuideOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-lg p-10 rounded-4xl animate-in zoom-in-95 border border-[#EDEAE5]">
                        <button onClick={() => setIsSizeGuideOpen(false)} className="absolute top-6 left-6 text-[#D4C3B3] hover:text-[#4A3E31] transition-colors"><X size={28} /></button>
                        <h2 className="text-3xl font-serif text-center mb-8 text-[#4A3E31]">دليل القياسات الفني</h2>
                        <div className="bg-[#FCFBF9] rounded-3xl overflow-hidden border border-[#F7F3F0]">
                            <table className="w-full text-center">
                                <thead className="border-b border-[#EDEAE5] text-[#A6998A] font-black text-[10px] uppercase">
                                    <tr><th className="py-4">المقاس</th><th className="py-4">الصدر (سم)</th><th className="py-4">الخصر (سم)</th></tr>
                                </thead>
                                <tbody className="text-[#8B735B] font-bold">
                                    {[['S', '84-88', '66-70'], ['M', '92-96', '74-78'], ['L', '100-104', '82-86'], ['XL', '110-116', '92-98']].map(([s, c, w]) => (
                                        <tr key={s} className="border-b border-[#F7F3F0]">
                                            <td className="py-4 text-[#4A3E31] font-black">{s}</td><td>{c}</td><td>{w}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}