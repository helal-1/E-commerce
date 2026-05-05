"use client";

import { useState, useEffect } from 'react';
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
// استيراد الـ Hook الخاص بالسلة
import { useCart } from '@/app/context/CartContext';

export default function ProductDetails() {
    const router = useRouter();
    const params = useParams();
    const { addToCart, setIsCartOpen } = useCart();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImg, setSelectedImg] = useState(0);
    const [selectedSize, setSelectedSize] = useState('M');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

    // جلب بيانات المنتج الحقيقية من Supabase
    useEffect(() => {
        const fetchProduct = async () => {
            if (!params.id) return;
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', params.id)
                    .single();

                if (error) throw error;
                setProduct(data);
                // تعيين اللون الافتراضي إذا وجد
                if (data.colors && data.colors.length > 0) {
                    setSelectedColor(data.colors[0]);
                }
            } catch (error: any) {
                console.error("Error fetching product:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [params.id]);

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
        <div className="h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-zinc-300" size={40} />
        </div>
    );

    if (!product) return (
        <div className="h-screen flex flex-col items-center justify-center text-center px-6">
            <h2 className="text-2xl font-serif mb-4">القطعة غير موجودة</h2>
            <Link href="/shop" className="text-zinc-500 underline underline-offset-4 font-black text-xs uppercase tracking-widest">العودة للمتجر</Link>
        </div>
    );

    return (
        <main className="min-h-screen bg-white pt-32 pb-20 px-6 md:px-12" dir="rtl">
            <div className="max-w-7xl mx-auto">

                {/* --- 1. شريط التنقل وزر العودة --- */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 border-b border-gray-50 pb-8">
                    <nav className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-400 order-2 md:order-1">
                        <Link href="/" className="hover:text-black transition-colors">الرئيسية</Link>
                        <ChevronLeft size={14} />
                        <Link href="/shop" className="hover:text-black transition-colors">المتجر</Link>
                        <ChevronLeft size={14} />
                        <span className="text-black">{product.name}</span>
                    </nav>

                    <button
                        onClick={() => router.push('/shop')}
                        className="flex items-center gap-4 text-sm font-black uppercase tracking-[0.2em] group order-1 md:order-2"
                    >
                        <span className="border-b-2 border-black pb-1">العودة للمتجر</span>
                        <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300">
                            <ArrowRight size={20} />
                        </div>
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-16">

                    {/* --- 2. معرض الصور --- */}
                    <div className="flex-1 space-y-6">
                        <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden rounded-[2.5rem] group shadow-sm">
                            <img
                                src={product.images?.[selectedImg] || 'https://via.placeholder.com/800x1000'}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            {product.images?.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setSelectedImg(prev => (prev > 0 ? prev - 1 : product.images.length - 1))}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-black hover:text-white"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                    <button
                                        onClick={() => setSelectedImg(prev => (prev < product.images.length - 1 ? prev + 1 : 0))}
                                        className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-black hover:text-white"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="flex gap-4 justify-center">
                            {product.images?.map((img: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImg(idx)}
                                    className={`relative w-20 aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all ${selectedImg === idx ? 'border-black scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                >
                                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* --- 3. تفاصيل المنتج --- */}
                    <div className="flex-1 space-y-10">
                        <div className="text-right space-y-4">
                            <div className="flex items-center gap-2 mb-2 text-amber-500 justify-end">
                                <span className="text-gray-400 text-xs font-bold ml-2">(45 تقييم للعملاء)</span>
                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                            </div>
                            <h1 className="text-5xl font-serif text-gray-900 leading-tight">{product.name}</h1>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">{product.price} ر.س</p>
                        </div>

                        <p className="text-gray-500 leading-loose text-lg text-right font-light">
                            {product.description || "لا يوجد وصف متاح لهذا المنتج حالياً."}
                        </p>

                        {/* اختيار اللون (يظهر فقط إذا كانت الألوان مسجلة في الداتابيز كـ Array) */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="space-y-5">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-right text-gray-400">اللون المختار: <span className="text-black">{selectedColor}</span></h4>
                                <div className="flex gap-4 justify-end">
                                    {product.colors.map((color: string) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-12 h-12 rounded-full border-4 transition-all hover:scale-110 ${selectedColor === color ? 'border-black ring-2 ring-gray-100' : 'border-white shadow-sm'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* اختيار المقاس */}
                        <div className="space-y-5 text-right">
                            <div className="flex justify-between items-end">
                                <button
                                    onClick={() => setIsSizeGuideOpen(true)}
                                    className="text-[10px] font-black uppercase tracking-widest text-amber-800 border-b border-amber-800 pb-1 hover:text-black hover:border-black transition-all"
                                >
                                    عرض دليل المقاسات
                                </button>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">المقاس</h4>
                            </div>
                            <div className="flex gap-3 justify-end">
                                {['S', 'M', 'L', 'XL'].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`w-16 h-16 rounded-2xl border-2 font-bold text-lg transition-all ${selectedSize === size ? 'bg-black text-white border-black shadow-xl -translate-y-1' : 'border-gray-100 text-gray-400 hover:border-black hover:text-black'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* التحكم في الكمية والإضافة */}
                        <div className="flex flex-col sm:flex-row gap-4 h-auto sm:h-20">
                            <div className="flex items-center border-2 border-gray-100 rounded-[1.5rem] px-6 py-4 sm:py-0 gap-8 justify-center">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-2xl font-light hover:text-amber-800">-</button>
                                <span className="font-black text-xl w-6 text-center">{quantity}</span>
                                <button onClick={() => setQuantity(q => q + 1)} className="text-2xl font-light hover:text-amber-800">+</button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-black text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-zinc-800 active:scale-95 transition-all shadow-2xl shadow-black/20 py-6 sm:py-0"
                            >
                                <ShoppingBag size={22} />
                                إضافة إلى الحقيبة
                            </button>
                            <button className="w-20 flex items-center justify-center border-2 border-gray-100 rounded-[1.5rem] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all py-6 sm:py-0">
                                <Heart size={28} />
                            </button>
                        </div>

                        {/* أيقونات الثقة */}
                        <div className="grid grid-cols-3 gap-6 pt-10 border-t border-gray-100">
                            {[
                                { icon: Truck, text: 'شحن سريع' },
                                { icon: RotateCcw, text: 'إرجاع سهل' },
                                { icon: ShieldCheck, text: 'دفع آمن' }
                            ].map((item, i) => (
                                <div key={i} className="text-center space-y-3">
                                    <item.icon className="mx-auto text-gray-300" size={24} />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.text}</p>
                                </div>
                            ))}
                        </div>

                        {/* المعلومات الإضافية */}
                        <div className="pt-6 space-y-4 text-right">
                            {[
                                { title: 'الخامة والعناية', content: product.material || 'مصنوع من مواد عالية الجودة. يُنصح بالتنظيف الجاف أو الغسل اليدوي بماء بارد.' },
                                { title: 'الشحن والتوصيل', content: 'توصيل مجاني للطلبات فوق 500 ر.س. يستغرق الشحن عادةً من 2-4 أيام عمل.' },
                                { title: 'سياسة الاسترجاع', content: 'يمكنك استبدال أو استرجاع المنتج خلال 14 يوماً من تاريخ الاستلام بشرط الحالة الأصلية.' }
                            ].map((detail, i) => (
                                <details key={i} className="group border-b border-gray-50 pb-6 outline-none">
                                    <summary className="flex justify-between items-center cursor-pointer list-none font-black text-gray-900 uppercase text-xs tracking-[0.2em] hover:text-amber-800 transition-colors">
                                        <span className="group-open:rotate-180 transition-transform duration-300 text-gray-300">↓</span>
                                        {detail.title}
                                    </summary>
                                    <p className="text-gray-500 text-sm mt-6 leading-relaxed font-light">{detail.content}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 4. مودال دليل المقاسات --- */}
            {isSizeGuideOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-10">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={() => setIsSizeGuideOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl p-10 md:p-16 shadow-2xl rounded-[3rem] overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setIsSizeGuideOpen(false)} className="absolute top-10 left-10 text-gray-300 hover:text-black transition-colors"><X size={32} /></button>

                        <div className="text-center mb-12 space-y-4">
                            <Ruler className="mx-auto text-amber-800" size={40} />
                            <h2 className="text-4xl font-serif text-gray-900">دليل مقاسات الملابس</h2>
                            <p className="text-gray-400 font-light">القياسات الموضحة أدناه بالسنتيمتر (cm)</p>
                        </div>

                        <div className="bg-gray-50 rounded-[2rem] p-8">
                            <table className="w-full text-center">
                                <thead className="border-b-2 border-gray-200 text-gray-900 font-black text-xs uppercase tracking-widest">
                                    <tr><th className="py-4">المقاس</th><th className="py-4">الصدر</th><th className="py-4">الخصر</th></tr>
                                </thead>
                                <tbody className="text-gray-600 font-bold">
                                    {[['S', '84-88', '66-70'], ['M', '92-96', '74-78'], ['L', '100-104', '82-86'], ['XL', '110-116', '92-98']].map(([s, c, w]) => (
                                        <tr key={s} className="border-b border-gray-100 hover:bg-white transition-colors">
                                            <td className="py-6 text-black font-black">{s}</td><td className="py-6">{c}</td><td className="py-6">{w}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button
                            onClick={() => setIsSizeGuideOpen(false)}
                            className="w-full mt-10 bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-all"
                        >
                            إغلاق الدليل
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}