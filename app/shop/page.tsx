"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    Search,
    LayoutGrid,
    Columns4,
    X,
    Ruler,
    Heart,
    Eye,
    RotateCcw,
    Loader2
} from 'lucide-react';

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    colors?: string[];
    sizes?: string[];
    images?: string[];
    created_at: string;
}

const COLOR_MAP: { [key: string]: string } = {
    'white': 'bg-white border-gray-200',
    'black': 'bg-black',
    'navy': 'bg-[#000080]',
    'beige': 'bg-[#F5F5DC]',
    'red': 'bg-[#FF0000]',
    'blue': 'bg-[#0000FF]',
    'khaki': 'bg-[#C3B091]',
    'green': 'bg-[#008000]',
};

function ShopContent() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category');

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('grid-3');
    const [selectedColor, setSelectedColor] = useState('الكل');
    const [selectedSize, setSelectedSize] = useState('الكل');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [maxPrice, setMaxPrice] = useState(2000); // القيمة الافتراضية لفلتر السعر
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

    const [category, setCategory] = useState(() => {
        if (!initialCategory) return 'الكل';
        const categoryMap: { [key: string]: string } = {
            'essentials': 'الأساسيات',
            'occasions': 'فساتين',
            'new': 'جديد'
        };
        return categoryMap[initialCategory] || initialCategory;
    });

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) console.error("Error:", error);
            else setProducts(data || []);
            setLoading(false);
        };
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            (category === 'الكل' || p.category === category) &&
            (selectedColor === 'الكل' || (p.colors && p.colors.includes(selectedColor))) &&
            (selectedSize === 'الكل' || (p.sizes && p.sizes.includes(selectedSize))) &&
            (p.price <= maxPrice) && // فلترة السعر
            (p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        ).sort((a, b) => {
            if (sortBy === 'low-high') return a.price - b.price;
            if (sortBy === 'high-low') return b.price - a.price;
            return 0;
        });
    }, [products, category, selectedColor, selectedSize, searchQuery, sortBy, maxPrice]);

    const resetFilters = () => {
        setCategory('الكل');
        setSelectedSize('الكل');
        setSelectedColor('الكل');
        setSearchQuery('');
        setSortBy('default');
        setMaxPrice(2000);
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <Loader2 className="animate-spin text-amber-700 mb-4" size={40} />
            <p className="font-serif text-gray-400">يتم تحميل التشكيلة الفاخرة...</p>
        </div>
    );

    return (
        <main className="min-h-screen bg-white pt-28 pb-20 px-4 md:px-12" dir="rtl">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-gray-100 pb-8 gap-6">
                    <div className="flex items-center gap-8 w-full md:w-auto">
                        <h1 className="text-3xl md:text-5xl font-serif text-gray-900">المتجر</h1>
                        <div className="hidden lg:flex items-center gap-2 border-r pr-4 border-gray-200">
                            <button onClick={() => setView('grid-2')} className={`p-2 ${view === 'grid-2' ? 'text-black' : 'text-gray-300'}`}><LayoutGrid size={20} /></button>
                            <button onClick={() => setView('grid-3')} className={`p-2 ${view === 'grid-3' ? 'text-black' : 'text-gray-300'}`}><LayoutGrid size={24} /></button>
                            <button onClick={() => setView('grid-4')} className={`p-2 ${view === 'grid-4' ? 'text-black' : 'text-gray-300'}`}><Columns4 size={24} /></button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-stone-50 border-none py-3 px-6 rounded-full text-xs font-bold outline-none cursor-pointer"
                        >
                            <option value="default">الترتيب الافتراضي</option>
                            <option value="low-high">السعر: من الأقل</option>
                            <option value="high-low">السعر: من الأعلى</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Sidebar المطور مع فلتر السعر */}
                    <aside className="w-full lg:w-72 space-y-12">
                        {/* البحث */}
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 text-stone-400">البحث</h3>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="ابحثي عن قطعة..."
                                    className="w-full bg-stone-50 border-none py-4 px-10 rounded-2xl text-xs outline-none focus:ring-1 focus:ring-black/5 text-right"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Search className="absolute right-4 top-4 text-stone-400" size={16} />
                            </div>
                        </div>

                        {/* فلتر السعر الجديد */}
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">نطاق السعر</h3>
                                <span className="text-xs font-bold text-black">{maxPrice} ر.س</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="2000"
                                step="50"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                                className="w-full h-1 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-black"
                            />
                            <div className="flex justify-between mt-2 text-[9px] font-bold text-stone-400 uppercase">
                                <span>0 ر.س</span>
                                <span>2000 ر.س</span>
                            </div>
                        </div>

                        {/* التصنيفات */}
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">التصنيفات</h3>
                                <button onClick={resetFilters} className="text-[9px] font-bold text-red-500 flex items-center gap-1">
                                    <RotateCcw size={10} /> رسيت
                                </button>
                            </div>
                            <div className="flex flex-col gap-2">
                                {['الكل', 'فساتين', 'الأساسيات', 'جاكيتات', 'جديد'].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`text-xs px-5 py-4 rounded-2xl border text-right transition-all font-bold ${category === cat ? 'bg-black text-white' : 'bg-white border-stone-100 text-stone-500 hover:border-black'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* المقاسات */}
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 text-stone-400">المقاس</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {['S', 'M', 'L', 'XL'].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size === selectedSize ? 'الكل' : size)}
                                        className={`h-12 flex items-center justify-center rounded-xl border text-[10px] font-black transition-all ${selectedSize === size ? 'bg-black text-white' : 'border-stone-100 text-stone-400 hover:border-black'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setIsSizeGuideOpen(true)}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-stone-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                        >
                            <Ruler size={16} /> دليل القياسات
                        </button>
                    </aside>

                    {/* Products Grid */}
                    <div className={`flex-1 grid gap-8 ${view === 'grid-2' ? 'grid-cols-2' :
                        view === 'grid-4' ? 'grid-cols-2 lg:grid-cols-4' :
                            'grid-cols-2 lg:grid-cols-3'
                        }`}>
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="group relative animate-in fade-in duration-500">
                                <Link href={`/product/${product.id}`} className="block">
                                    <div className="relative aspect-[3/4] bg-stone-50 overflow-hidden mb-4 rounded-3xl">
                                        <Image
                                            src={product.images?.[0] || '/placeholder.jpg'}
                                            alt={product.name}
                                            fill
                                            sizes="(max-width: 768px) 50vw, 33vw"
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                            <button className="flex-1 bg-white text-black py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-1">
                                                <Eye size={12} /> عرض
                                            </button>
                                            <button className="p-3 bg-white text-black rounded-xl shadow-xl hover:text-red-500">
                                                <Heart size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right px-2">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-sm font-black text-gray-900">{product.price} ر.س</span>
                                            <h3 className="text-base font-serif text-gray-800 truncate max-w-[65%]">{product.name}</h3>
                                        </div>
                                        <div className="flex flex-row-reverse gap-1">
                                            {product.sizes?.map((size) => (
                                                <span key={size} className="text-[8px] font-bold border border-gray-100 px-1.5 py-0.5 rounded text-gray-400">
                                                    {size}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                        {filteredProducts.length === 0 && (
                            <div className="col-span-full text-center py-40">
                                <p className="text-stone-300 text-lg font-serif italic">عذراً، لا توجد نتائج تطابق خياراتكِ حالياً.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* دليل المقاسات */}
            {isSizeGuideOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSizeGuideOpen(false)} />
                    <div className="relative bg-white w-full max-w-lg p-8 rounded-3xl shadow-2xl animate-in zoom-in-95">
                        <button onClick={() => setIsSizeGuideOpen(false)} className="absolute top-4 left-4 text-gray-400 hover:text-black"><X size={24} /></button>
                        <h2 className="text-2xl font-serif text-center mb-8">دليل القياسات</h2>
                        <div className="overflow-hidden rounded-2xl border border-gray-100">
                            <table className="w-full text-center text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest">
                                    <tr><th className="py-3">المقاس</th><th className="py-3">الصدر</th><th className="py-3">الخصر</th></tr>
                                </thead>
                                <tbody>
                                    {[['S', '84-88', '66-70'], ['M', '92-96', '74-78'], ['L', '100-104', '82-86']].map(([s, c, w]) => (
                                        <tr key={s} className="border-b border-gray-50 text-stone-500 font-bold">
                                            <td className="py-4 text-black font-black">{s}</td><td className="py-4">{c}</td><td className="py-4">{w}</td>
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

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-serif text-stone-400">جاري التحميل...</div>}>
            <ShopContent />
        </Suspense>
    );
}