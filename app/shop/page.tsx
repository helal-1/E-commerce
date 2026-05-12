"use client";

import { useState, useMemo, useEffect, Suspense, useCallback } from 'react';
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
    Loader2,
    ArrowRight,
    ArrowLeft,
    Tag
} from 'lucide-react';
import { useWishlist } from '@/app/context/WishlistContext';

interface Product {
    id: string;
    name: string;
    price: number;
    discount?: number; // الحقل الجديد للخصم (نسبة مئوية)
    category: string;
    colors?: string[];
    sizes?: string[];
    images: string[];
    created_at: string;
}

function ShopContent() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category');

    const { wishlist, addToWishlist } = useWishlist();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('grid-3');
    const [selectedSize, setSelectedSize] = useState('الكل');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [maxPrice, setMaxPrice] = useState(50000);
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 6;

    // تثبيت التصنيف الابتدائي بدون Effect متكرر
    const [category, setCategory] = useState(() => {
        if (!initialCategory) return 'الكل';
        const categoryMap: { [key: string]: string } = {
            'essentials': 'الأساسيات',
            'occasions': 'فساتين',
            'new': 'جديد'
        };
        return categoryMap[initialCategory] || initialCategory;
    });

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts((data as Product[]) || []);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            if (isMounted) await fetchProducts();
        };
        load();

        const shopChannel = supabase
            .channel('shop-live-updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                (payload) => {
                    if (!isMounted) return;
                    if (payload.eventType === 'INSERT') {
                        setProducts((prev) => [payload.new as Product, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setProducts((prev) =>
                            prev.map((p) => (p.id === payload.new.id ? (payload.new as Product) : p))
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            isMounted = false;
            supabase.removeChannel(shopChannel);
        };
    }, [fetchProducts]);

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            (category === 'الكل' || p.category === category) &&
            (selectedSize === 'الكل' || (p.sizes && p.sizes.includes(selectedSize))) &&
            (p.price <= maxPrice) &&
            (p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        ).sort((a, b) => {
            if (sortBy === 'low-high') return a.price - b.price;
            if (sortBy === 'high-low') return b.price - a.price;
            return 0;
        });
    }, [products, category, selectedSize, searchQuery, sortBy, maxPrice]);

    const safeCurrentPage = useMemo(() => {
        const total = Math.ceil(filteredProducts.length / productsPerPage);
        return currentPage > total ? 1 : currentPage;
    }, [filteredProducts.length, currentPage]);

    const indexOfLastProduct = safeCurrentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCategoryChange = (cat: string) => {
        setCategory(cat);
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setCategory('الكل');
        setSelectedSize('الكل');
        setSearchQuery('');
        setSortBy('default');
        setMaxPrice(50000);
        setCurrentPage(1);
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FCFBF9]">
            <Loader2 className="animate-spin text-[#8B735B] mb-4" size={40} />
            <p className="font-serif italic text-[#8B735B]">يتم تحضير التشكيلة الفاخرة...</p>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#FCFBF9] pt-28 pb-20 px-4 md:px-12" dir="rtl">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-[#EDEAE5] pb-8 gap-6">
                    <div className="flex items-center gap-8 w-full md:w-auto">
                        <h1 className="text-3xl md:text-5xl font-serif text-[#4A3E31]">المعرض</h1>
                        <div className="hidden lg:flex items-center gap-2 border-r pr-4 border-[#EDEAE5]">
                            <button onClick={() => setView('grid-2')} className={`p-2 transition-colors ${view === 'grid-2' ? 'text-[#8B735B]' : 'text-stone-300'}`}><LayoutGrid size={20} /></button>
                            <button onClick={() => setView('grid-3')} className={`p-2 transition-colors ${view === 'grid-3' ? 'text-[#8B735B]' : 'text-stone-300'}`}><LayoutGrid size={24} /></button>
                            <button onClick={() => setView('grid-4')} className={`p-2 transition-colors ${view === 'grid-4' ? 'text-[#8B735B]' : 'text-stone-300'}`}><Columns4 size={24} /></button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[9px] font-bold text-green-700">تحديث مباشر</span>
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                            className="bg-white border border-[#EDEAE5] py-3 px-6 rounded-full text-xs font-bold outline-none cursor-pointer text-[#4A3E31]"
                        >
                            <option value="default">الترتيب الافتراضي</option>
                            <option value="low-high">السعر: من الأقل</option>
                            <option value="high-low">السعر: من الأعلى</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    <aside className="w-full lg:w-72 space-y-10">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 text-[#A6998A]">البحث</h3>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="ابحثي عن قطعة فنية..."
                                    className="w-full bg-white border border-[#EDEAE5] py-4 px-10 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-[#8B735B]/10 transition-all text-right text-[#4A3E31]"
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                />
                                <Search className="absolute right-4 top-4 text-[#D4C3B3]" size={16} />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#A6998A]">نطاق السعر</h3>
                                <span className="text-xs font-bold text-[#4A3E31]">{maxPrice} ج.م</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="50000"
                                step="100"
                                value={maxPrice}
                                onChange={(e) => { setMaxPrice(parseInt(e.target.value)); setCurrentPage(1); }}
                                className="w-full h-1 bg-[#EDEAE5] rounded-lg appearance-none cursor-pointer accent-[#8B735B]"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#A6998A]">التصنيفات</h3>
                                <button onClick={resetFilters} className="text-[9px] font-bold text-[#A66C6C] flex items-center gap-1 hover:opacity-70 transition-opacity">
                                    <RotateCcw size={10} /> إعادة ضبط
                                </button>
                            </div>
                            <div className="flex flex-col gap-2">
                                {['الكل', 'فساتين', 'الأساسيات', 'جاكيتات', 'جديد'].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategoryChange(cat)}
                                        className={`text-xs px-5 py-4 rounded-2xl border text-right transition-all font-bold ${category === cat ? 'bg-[#4A3E31] text-white border-[#4A3E31] shadow-lg shadow-[#4A3E31]/20' : 'bg-white border-[#EDEAE5] text-[#8B735B] hover:border-[#8B735B]'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 text-[#A6998A]">المقاس</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {['S', 'M', 'L', 'XL'].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size === selectedSize ? 'الكل' : size)}
                                        className={`h-12 flex items-center justify-center rounded-xl border text-[10px] font-black transition-all ${selectedSize === size ? 'bg-[#8B735B] text-white border-[#8B735B]' : 'bg-white border-[#EDEAE5] text-[#D4C3B3] hover:border-[#8B735B]'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setIsSizeGuideOpen(true)}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-[#4A3E31] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-[#4A3E31]/10"
                        >
                            <Ruler size={16} /> دليل القياسات
                        </button>
                    </aside>

                    <div className="flex-1 flex flex-col">
                        <div className={`grid gap-8 ${view === 'grid-2' ? 'grid-cols-2' :
                            view === 'grid-4' ? 'grid-cols-2 lg:grid-cols-4' :
                                'grid-cols-2 lg:grid-cols-3'
                            }`}>
                            {currentProducts.map((product) => {
                                const isLiked = wishlist.some((item) => item.id === product.id);
                                // حساب السعر بعد الخصم
                                const discountedPrice = product.discount
                                    ? product.price - (product.price * (product.discount / 100))
                                    : product.price;

                                return (
                                    <div key={product.id} className="group relative animate-in fade-in duration-700">
                                        <div className="relative aspect-3/4 bg-[#F7F3F0] overflow-hidden mb-4 rounded-4xl border border-[#EDEAE5]/50 group-hover:border-[#8B735B]/30 transition-all duration-500">
                                            {/* شارة الخصم على الصورة */}
                                            {product.discount && product.discount > 0 && (
                                                <div className="absolute top-4 right-4 z-20 bg-red-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg animate-bounce">
                                                    خصم {product.discount}%
                                                </div>
                                            )}

                                            {/* اسم القسم على الصورة */}
                                            <div className="absolute top-4 left-4 z-20 bg-white/80 backdrop-blur-md text-[#4A3E31] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border border-white/20">
                                                {product.category}
                                            </div>

                                            <Link href={`/product/${product.id}`} className="block h-full">
                                                <Image
                                                    src={product.images?.[0] || '/placeholder.jpg'}
                                                    alt={product.name}
                                                    fill
                                                    sizes="(max-width: 768px) 50vw, 33vw"
                                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                                />
                                            </Link>
                                            <div className="absolute inset-0 bg-[#4A3E31]/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500">
                                                <Link href={`/product/${product.id}`} className="flex-1 bg-white/90 backdrop-blur-md text-[#4A3E31] py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-2 hover:bg-[#4A3E31] hover:text-white transition-all">
                                                    <Eye size={14} /> اكتشفي
                                                </Link>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        addToWishlist({ ...product, images: product.images || [] });
                                                    }}
                                                    className={`p-3.5 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl transition-all ${isLiked ? 'text-[#A66C6C]' : 'text-[#4A3E31] hover:text-[#A66C6C]'}`}
                                                >
                                                    <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="text-right px-2">
                                            <Link href={`/product/${product.id}`}>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h3 className="text-lg font-serif text-[#4A3E31] group-hover:text-[#8B735B] transition-colors truncate">{product.name}</h3>
                                                        {/* نسبة الخصم بجانب الاسم */}
                                                        {product.discount && (
                                                            <span className="flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100 shrink-0">
                                                                <Tag size={10} /> -{product.discount}%
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <span className="text-base font-black text-[#8B735B]">
                                                            {discountedPrice.toLocaleString()} ج.م
                                                        </span>
                                                        {/* السعر القديم إذا وجد خصم */}
                                                        {product.discount && (
                                                            <span className="text-xs text-[#A6998A] line-through decoration-[#8B735B]/50">
                                                                {product.price.toLocaleString()} ج.م
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                            <div className="flex flex-row-reverse gap-1 mt-2">
                                                {product.sizes?.map((size) => (
                                                    <span key={size} className="text-[8px] font-black border border-[#EDEAE5] px-2 py-0.5 rounded-md text-[#D4C3B3] bg-white">{size}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/*Pagination UI */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-3 mt-16 pt-10 border-t border-[#EDEAE5]">
                                <button
                                    disabled={safeCurrentPage === totalPages}
                                    onClick={() => paginate(safeCurrentPage + 1)}
                                    className="p-3 rounded-xl border border-[#EDEAE5] text-[#8B735B] disabled:opacity-20 disabled:cursor-not-allowed hover:bg-[#4A3E31] hover:text-white transition-all shadow-sm"
                                >
                                    <ArrowRight size={20} />
                                </button>
                                <div className="flex gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => paginate(i + 1)}
                                            className={`w-10 h-10 md:w-12 md:h-12 rounded-xl text-xs font-black transition-all ${safeCurrentPage === i + 1 ? 'bg-[#4A3E31] text-white shadow-xl shadow-[#4A3E31]/20' : 'bg-white text-[#8B735B] border border-[#EDEAE5]'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    disabled={safeCurrentPage === 1}
                                    onClick={() => paginate(safeCurrentPage - 1)}
                                    className="p-3 rounded-xl border border-[#EDEAE5] text-[#8B735B] disabled:opacity-20 disabled:cursor-not-allowed hover:bg-[#4A3E31] hover:text-white transition-all shadow-sm"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                            </div>
                        )}
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-40 bg-white rounded-4xl border border-dashed border-[#EDEAE5]">
                                <p className="text-[#8B735B] text-lg font-serif italic">عذراً، لا توجد قطع فنية تطابق اختياراتكِ حالياً.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* دليل المقاسات Modal */}
            {isSizeGuideOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#4A3E31]/40 backdrop-blur-md" onClick={() => setIsSizeGuideOpen(false)} />
                    <div className="relative bg-white w-full max-w-lg p-8 rounded-[2.5rem] shadow-2xl border border-[#EDEAE5]">
                        <button onClick={() => setIsSizeGuideOpen(false)} className="absolute top-6 left-6 text-[#D4C3B3] hover:text-[#4A3E31] transition-colors"><X size={24} /></button>
                        <h2 className="text-2xl font-serif text-center mb-8 text-[#4A3E31]">دليل القياسات الفني</h2>
                        <div className="overflow-hidden rounded-2xl border border-[#F7F3F0]">
                            <table className="w-full text-center text-sm">
                                <thead className="bg-[#FCFBF9] border-b border-[#F7F3F0] text-[10px] font-black uppercase tracking-widest text-[#A6998A]">
                                    <tr><th className="py-4">المقاس</th><th className="py-4">الصدر (سم)</th><th className="py-4">الخصر (سم)</th></tr>
                                </thead>
                                <tbody>
                                    {[
                                        ['S', '84-88', '66-70'],
                                        ['M', '92-96', '74-78'],
                                        ['L', '100-104', '82-86'],
                                        ['XL', '108-112', '90-94']
                                    ].map(([s, c, w]) => (
                                        <tr key={s} className="border-b border-[#F7F3F0] text-[#8B735B] font-bold">
                                            <td className="py-4 text-[#4A3E31] font-black">{s}</td>
                                            <td className="py-4">{c}</td>
                                            <td className="py-4">{w}</td>
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
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FCFBF9]"><Loader2 className="animate-spin text-[#8B735B]" size={40} /></div>}>
            <ShopContent />
        </Suspense>
    );
}