/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import {
    ShoppingBag,
    Heart,
    ShieldCheck,
    Truck,
    RotateCcw,
    ChevronLeft,
    ArrowRight,
    X,
    Loader2,
    Tag,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import { useWishlist } from '@/app/context/WishlistContext';

// --- تعريف الأنواع (Interface) ---
interface Product {
    id: string;
    name: string;
    price: number;
    discount?: number;
    category: string;
    description: string;
    images: string[];
    colors: string[];
    sizes: string[]; 
    material?: string;
}

export default function ProductDetails() {
    const router = useRouter();
    const params = useParams();
    const { addToCart, setIsCartOpen } = useCart();
    const { wishlist, addToWishlist } = useWishlist();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImg, setSelectedImg] = useState(0);
    const [selectedSize, setSelectedSize] = useState(''); 
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [isDescExpanded, setIsDescExpanded] = useState(false);

    // حالة التنبيه المخصص (Custom Alert)
    const [alert, setAlert] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
        show: false,
        msg: '',
        type: 'success'
    });

    const isLiked = wishlist.some((item) => item.id === params.id);

    // دالة إظهار التنبيه الفخم
    const showAlert = (msg: string, type: 'success' | 'error') => {
        setAlert({ show: true, msg, type });
        setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    const fetchProduct = useCallback(async () => {
        if (!params.id) return;
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', params.id)
                .single();

            if (error) throw error;

            const fetchedProduct = data as Product;
            setProduct(fetchedProduct);

            // ضبط القيم الافتراضية بناءً على البيانات القادمة من السيرفر
            if (fetchedProduct.colors && fetchedProduct.colors.length > 0) {
                setSelectedColor(fetchedProduct.colors[0]);
            }
            if (fetchedProduct.sizes && fetchedProduct.sizes.length > 0) {
                setSelectedSize(fetchedProduct.sizes[0]);
            }
        } catch (error: unknown) {
            console.error("Error:", (error as Error).message);
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            if (isMounted) await fetchProduct();
        };
        loadData();

        const productChannel = supabase
            .channel(`product-${params.id}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'products', filter: `id=eq.${params.id}` },
                (payload) => {
                    if (isMounted) setProduct(payload.new as Product);
                }
            )
            .subscribe();

        return () => {
            isMounted = false;
            supabase.removeChannel(productChannel);
        };
    }, [params.id, fetchProduct]);

    const handleAddToCart = () => {
        if (!product) return;

        // تحقق من اختيار المقاس قبل الإضافة
        if (!selectedSize && product.sizes && product.sizes.length > 0) {
            showAlert("جميلتي، يرجى اختيار المقاس أولاً", 'error');
            return;
        }

        const discountValue = product.discount ?? 0;
        const rawFinalPrice = discountValue > 0
            ? product.price - (product.price * discountValue / 100)
            : product.price;

        // تقريب السعر المضاف للسلة ليكون رقماً صحيحاً مية بالمية متوافقاً مع العرض
        const finalPrice = Math.round(rawFinalPrice);

        addToCart({
            id: product.id,
            name: product.name,
            price: finalPrice,
            image: product.images?.[0] || '',
            color: selectedColor,
            size: selectedSize,
            quantity: quantity
        });

        showAlert("تمت إضافة القطعة لحقيبة تسوقك بنجاح", 'success');
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

    const discountVal = product.discount ?? 0;
    const hasDiscount = discountVal > 0;
    const rawDiscountedPrice = hasDiscount
        ? product.price - (product.price * discountVal / 100)
        : product.price;

    // إزالة الكسور نهائياً من العرض باستخدام التقريب الصحيح لأقرب جنيه
    const roundedPrice = Math.round(product.price);
    const roundedDiscountedPrice = Math.round(rawDiscountedPrice);

    return (
        <main className="min-h-screen bg-[#FCFBF9] pt-32 pb-20 px-6 md:px-12 relative" dir="rtl">

            {/* Custom Alert - التنبيه المخصص */}
            {alert.show && (
                <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[300] min-w-[320px] flex items-center gap-3 p-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top duration-300 ${alert.type === 'success' ? 'bg-white border-green-100 text-green-800' : 'bg-white border-red-100 text-red-800'
                    }`}>
                    {alert.type === 'success' ? <CheckCircle2 className="text-green-500" /> : <AlertCircle className="text-red-500" />}
                    <p className="text-sm font-bold flex-1">{alert.msg}</p>
                    <button onClick={() => setAlert(prev => ({ ...prev, show: false }))} className="opacity-50 hover:opacity-100 transition-opacity">
                        <X size={18} />
                    </button>
                </div>
            )}

            <div className="max-w-7xl mx-auto">

                {/* Navigation Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 border-b border-[#EDEAE5] pb-8">
                    <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#A6998A] order-2 md:order-1">
                        <Link href="/" className="hover:text-[#4A3E31] text-2xl transition-colors">الرئيسية</Link>
                        <ChevronLeft size={18} />
                        <Link href="/shop" className="hover:text-[#4A3E31] text-2xl transition-colors">المتجر</Link>
                        <ChevronLeft size={18} />
                 <span className="text-[#4A3E31] text-lg md:text-2xl">
  {product.name}
</span>
                    </nav>

                    <button onClick={() => router.push('/shop')} className="flex items-center gap-4 text-2xl font-black uppercase tracking-[0.2em] group order-1 md:order-2 text-[#4A3E31]">
                        <span className="border-b-2 border-[#4A3E31] pb-1 group-hover:border-[#8B735B]">العودة للمتجر</span>
                        <div className="w-12 h-12 rounded-full border border-[#EDEAE5] flex items-center justify-center group-hover:bg-[#4A3E31] group-hover:text-white transition-all duration-500">
                            <ArrowRight size={20} />
                        </div>
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Gallery Section */}
                    <div className="flex-1 space-y-6">
                        <div className="relative aspect-3/4 bg-[#F7F3F0] rounded-4xl overflow-hidden border border-[#EDEAE5] group shadow-sm">
                            {hasDiscount && (
                                <div className="absolute top-6 right-6 z-20 bg-red-600 text-white px-4 py-2 rounded-full text-xs font-black shadow-2xl animate-pulse flex items-center gap-2">
                                    <Tag size={14} /> خصم {discountVal}%
                                </div>
                            )}
                            <div className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur-md text-[#4A3E31] px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-white/20">
                                {product.category}
                            </div>

                            <Image
                                src={product.images?.[selectedImg] || '/placeholder.jpg'}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                        </div>
                        <div className="flex gap-4 justify-center">
                            {product.images?.map((img: string, idx: number) => (
                                <button key={idx} onClick={() => setSelectedImg(idx)} className={`relative w-20 aspect-3/4 rounded-2xl overflow-hidden border-2 transition-all ${selectedImg === idx ? 'border-[#8B735B] scale-105 shadow-md' : 'border-transparent opacity-40 hover:opacity-100'}`}>
                                    <Image src={img} alt="thumbnail" fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 space-y-8 h-auto overflow-visible">
                        <div className="text-right space-y-4">
                            <div className="flex items-center justify-between">
                                <h1 className="text-5xl font-serif text-[#4A3E31] leading-tight">{product.name}</h1>
                                {hasDiscount && (
                                  <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded-md text-[12px] font-black border border-red-100 whitespace-nowrap">
  عرض محدود
</span>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <p className="text-4xl font-black text-[#8B735B] tracking-tighter">
                                    {roundedDiscountedPrice.toLocaleString()} ج.م
                                </p>
                                {hasDiscount && (
                                    <del className="text-xl text-[#A6998A] line-through decoration-[#8B735B]/40">
                                        {roundedPrice.toLocaleString()} ج.م
                                    </del>
                                )}
                            </div>
                        </div>

                        {/* وصف القطعة */}
                        <div className="text-right space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A6998A]">وصف القطعة</h4>
                            <div className="relative h-auto overflow-visible">
                                <p
                                    className={`text-[#8B735B] leading-loose text-lg font-serif italic transition-all duration-700 ease-in-out ${!isDescExpanded ? 'max-h-32 overflow-hidden' : 'max-h-full'}`}
                                    style={{
                                        WebkitMaskImage: !isDescExpanded ? 'linear-gradient(to bottom, black 50%, transparent 100%)' : 'none'
                                    }}
                                >
                                    {product.description || "قطعة فنية مشغولة يدوياً بكل حب من زيلدا لاين."}
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
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="space-y-6 text-right pt-4">
                                <div className="flex justify-between items-end border-b border-[#F7F3F0] pb-4">
                                    <button onClick={() => setIsSizeGuideOpen(true)} className="text-[10px] font-black uppercase text-[#8B735B] border-b border-[#8B735B] hover:text-[#4A3E31] transition-colors">دليل القياسات</button>
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#A6998A]">المقاس المطلوب</h4>
                                </div>
                                <div className="flex gap-3 justify-end flex-wrap">
                                    {product.sizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`min-w-[4rem] h-16 px-4 rounded-2xl border-2 font-bold transition-all duration-300 ${selectedSize === size ? 'bg-[#4A3E31] text-white border-[#4A3E31] shadow-xl' : 'border-[#EDEAE5] text-[#D4C3B3] hover:border-[#8B735B]'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* التحكم في الكمية والإضافة */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <div className="flex justify-center items-center border-2 border-[#EDEAE5] rounded-3xl px-8 py-4 bg-white shadow-sm gap-10">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-2xl text-[#A6998A] transition-colors hover:text-[#4A3E31]">-</button>
                                <span className="font-black text-xl text-[#4A3E31]">{quantity}</span>
                                <button onClick={() => setQuantity(q => q + 1)} className="text-2xl text-[#A6998A] transition-colors hover:text-[#4A3E31]">+</button>
                            </div>
                            <button onClick={handleAddToCart} className="flex-1 bg-[#4A3E31] text-white rounded-3xl font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-2xl shadow-[#4A3E31]/20 py-6">
                                <ShoppingBag size={22} /> إضافة للحقيبة
                            </button>
                            <button
                                onClick={() => {
                                    if (product) {
                                        addToWishlist(product);
                                        showAlert(isLiked ? "تمت إزالة القطعة من المفضلة" : "تمت إضافة القطعة للمفضلة", 'success');
                                    }
                                }}
                                className={`w-20 flex items-center justify-center border-2 rounded-3xl transition-all py-6 ${isLiked ? 'border-[#A66C6C] bg-red-50 text-[#A66C6C]' : 'border-[#EDEAE5] bg-white text-[#4A3E31] hover:bg-red-50 hover:text-[#A66C6C]'}`}
                            >
                                <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
                            </button>
                        </div>

                        {/* أيقونات الثقة */}
                        <div className="grid grid-cols-3 gap-6 pt-12 border-t border-[#EDEAE5]">
                            {[
                                { icon: Truck, text: 'توصيل منزلي' },
                                { icon: RotateCcw, text: 'استبدال مرن' },
                                { icon: ShieldCheck, text: 'منتج أصلي' }
                            ].map((item, i) => (
                                <div key={i} className="text-center space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-[#F7F3F0] flex items-center justify-center mx-auto transition-transform hover:scale-110">
                                        <item.icon className="text-[#8B735B]" size={20} />
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#A6998A]">{item.text}</p>
                                </div>
                            ))}
                        </div>

                        {/* تفاصيل إضافية */}
                        <div className="pt-6 space-y-4 text-right">
                            {[
                                { title: 'الخامة والعناية بالقطعة', content: product.material || 'تنظيف جاف فقط للحفاظ على جودة التطريز.' },
                                { title: 'تفاصيل الشحن والتوصيل', content: 'يتم التجهيز بعناية وشحن القطعة خلال 2-5 أيام عمل.' },
                                { title: 'سياسة الاستبدال والاسترجاع', content: 'استبدال مرن خلال 14 يوماً لضمان رضاكِ التام.' }
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

            {/* Size Guide Modal - مودال دليل القياسات */}
            {isSizeGuideOpen && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center px-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-[#4A3E31]/60 backdrop-blur-md" onClick={() => setIsSizeGuideOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-lg p-10 rounded-4xl border border-[#EDEAE5] shadow-2xl animate-in zoom-in duration-300">
                        <button onClick={() => setIsSizeGuideOpen(false)} className="absolute top-6 left-6 text-[#D4C3B3] hover:text-[#4A3E31] transition-colors">
                            <X size={28} />
                        </button>
                        <h2 className="text-3xl font-serif text-center mb-8 text-[#4A3E31]">دليل القياسات الفني</h2>
                        <div className="bg-[#FCFBF9] rounded-3xl overflow-hidden border border-[#F7F3F0]">
                            <p className="p-6 text-center text-[#8B735B] font-serif italic leading-relaxed">
                                المقاسات المعروضة تتبع المعايير العالمية الراقية. <br />
                                في حال كان المنتج من فئة "الأحذية"، يرجى اختيار مقاسك المعتاد بناءً على الأرقام المعروضة.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}