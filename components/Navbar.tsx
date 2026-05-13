"use client";

import { useEffect, useState, useRef } from 'react';
import { ShoppingBag, Search, User, Menu, X, Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../app/context/CartContext';
import { useWishlist } from '../app/context/WishlistContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface SearchResultItem {
    id: string | number;
    name: string;
    price: number;
    images: string[];
}

export default function Navbar() {
    const { cartCount, setIsCartOpen } = useCart();
    const { wishlist, setIsWishlistOpen } = useWishlist();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // إضافة Padding أسفل الصفحة للموبايل لمنع تداخل الناف بار السفلي مع المحتوى
    useEffect(() => {
        document.body.classList.add('pb-16', 'md:pb-0');
        return () => document.body.classList.remove('pb-16', 'md:pb-0');
    }, []);

    // التحقق من المستخدم وصلاحياته
    useEffect(() => {
        const fetchUserData = async (currentUser: SupabaseUser | null) => {
            if (!currentUser) {
                setRole(null);
                return;
            }
            const { data } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single();
            setRole(data?.role || 'user');
        };

        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            fetchUserData(data.user);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const newUser = session?.user ?? null;
            setUser(newUser);
            fetchUserData(newUser);
        });

        return () => subscription.unsubscribe();
    }, []);

    // منطق البحث
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length > 1) {
                setIsSearching(true);
                const { data } = await supabase
                    .from('products')
                    .select('id, name, price, images')
                    .ilike('name', `%${searchQuery}%`)
                    .limit(5);
                setSearchResults((data as SearchResultItem[]) || []);
                setIsSearching(false);
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const getTargetLink = () => {
        if (!user) return "/login";
        return role === 'admin' ? "/admin" : "/profile";
    };

    const navLinks = [
        { name: 'الرئيسية', href: '/' },
        { name: 'المتجر', href: '/shop' },
        { name: 'المجموعات', href: '/collections' },
    ];

    return (
        <>
            {/* --- Navbar الرئيسي (Desktop & Tablet) --- */}
            <nav className="w-full h-20 bg-white/95 backdrop-blur-md flex items-center justify-between px-6 md:px-12 border-b border-[#EDEAE5] sticky top-0 z-[100]" dir="rtl">

                {/* الروابط (Desktop) */}
                <div className="hidden md:flex items-center gap-10 text-[11px] uppercase tracking-[0.2em] text-[#8B735B] font-bold">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="hover:text-[#4A3E31] transition-colors">{link.name}</Link>
                    ))}
                </div>

                {/* اللوجو */}
                <Link href="/" className="text-xl md:text-2xl font-serif tracking-widest text-[#4A3E31] absolute left-1/2 -translate-x-1/2">
                    ZELDA<span className="font-bold text-[#8B735B]">LINE</span>
                </Link>

                {/* أيقونات (Desktop) */}
                <div className="hidden md:flex items-center gap-6">
                    <button onClick={() => setIsSearchOpen(!isSearchOpen)}><Search size={20} className="text-[#4A3E31]" /></button>
                    <button onClick={() => setIsWishlistOpen(true)} className="relative">
                        <Heart size={20} className={wishlist.length > 0 ? 'fill-[#A66C6C] text-[#A66C6C]' : 'text-[#4A3E31]'} />
                    </button>
                    <Link href={getTargetLink()}><User size={20} className="text-[#4A3E31]" /></Link>
                    <button onClick={() => setIsCartOpen(true)} className="relative">
                        <ShoppingBag size={20} className="text-[#4A3E31]" />
                        {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-[#8B735B] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
                    </button>
                </div>
            </nav>

            {/* --- شريط التنقل السفلي (Mobile Only) --- */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#EDEAE5] z-[100] flex items-center justify-around shadow-lg" dir="rtl">
                {/* تم التأكد من دالة onClick هنا */}
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="flex flex-col items-center text-[#A6998A] active:scale-95 transition-transform"
                >
                    <Menu size={20} />
                    <span className="text-[8px] font-bold mt-1">القائمة</span>
                </button>

                <button onClick={() => { setIsSearchOpen(true); setSearchResults([]); setSearchQuery(""); }} className="flex flex-col items-center text-[#A6998A]"><Search size={20} /><span className="text-[8px] font-bold mt-1">بحث</span></button>

                <button onClick={() => setIsWishlistOpen(true)} className="flex flex-col items-center text-[#A6998A] relative">
                    <Heart size={20} className={wishlist.length > 0 ? 'fill-[#A66C6C] text-[#A66C6C]' : ''} />
                    <span className="text-[8px] font-bold mt-1">المفضلة</span>
                </button>

                <button onClick={() => setIsCartOpen(true)} className="flex flex-col items-center text-[#A6998A] relative">
                    <ShoppingBag size={20} />
                    {cartCount > 0 && <span className="absolute -top-1 right-2 bg-[#8B735B] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center">{cartCount}</span>}
                    <span className="text-[8px] font-bold mt-1">السلة</span>
                </button>

                <Link href={getTargetLink()} className="flex flex-col items-center text-[#A6998A]"><User size={20} /><span className="text-[8px] font-bold mt-1">حسابي</span></Link>
            </div>

            {/* --- شاشة البحث الكاملة (Mobile & Desktop Overlay) --- */}
            {isSearchOpen && (
                <div className="fixed inset-0 bg-white z-[200] p-6 flex flex-col animate-in fade-in duration-200" dir="rtl">
                    <div className="flex items-center justify-between mb-8">
                        <span className="font-serif text-xl font-bold text-[#4A3E31]">ابحث عن منتج</span>
                        <button onClick={() => setIsSearchOpen(false)} className="p-2 bg-[#F7F3F0] rounded-full"><X size={24} /></button>
                    </div>

                    <div className="relative w-full max-w-2xl mx-auto">
                        <input
                            autoFocus
                            type="text"
                            placeholder="اكتب اسم المنتج هنا..."
                            className="w-full p-4 pr-12 bg-[#F7F3F0] rounded-2xl outline-none font-bold text-[#4A3E31]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute right-4 top-4 text-[#8B735B]" size={20} />
                    </div>

                    <div className="mt-8 overflow-y-auto flex-1 max-w-2xl mx-auto w-full">
                        {isSearching && <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#8B735B]" /></div>}

                        <div className="grid gap-4">
                            {searchResults.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/product/${item.id}`}
                                    onClick={() => setIsSearchOpen(false)}
                                    className="flex items-center gap-4 p-3 bg-[#FCFBF9] border border-[#F7F3F0] rounded-2xl hover:bg-white transition-all active:scale-[0.98]"
                                >
                                    <div className="w-16 h-20 relative rounded-xl overflow-hidden shrink-0 border border-[#EDEAE5]">
                                        <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-[#4A3E31] text-sm">{item.name}</span>
                                        <span className="text-[#8B735B] font-serif italic text-xs">{item.price.toLocaleString()} ج.م</span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {searchQuery.length > 1 && !isSearching && searchResults.length === 0 && (
                            <p className="text-center text-gray-400 mt-10 font-serif italic">عذراً، لم نجد ما تبحث عنه.</p>
                        )}
                    </div>
                </div>
            )}

            {/* --- القائمة الجانبية (Mobile Sidebar) --- */}
            {/* تم رفع الـ z-index هنا إلى z-[400] لضمان الظهور فوق كل شيء */}
            <div className={`fixed inset-0 z-[200] transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                {/* الخلفية المظلمة */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />

                {/* محتوى القائمة */}
                <div className={`absolute  right-0 top-0 h-full w-100 bg-white shadow-2xl transition-transform duration-500 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-8 flex flex-col h-full" dir="rtl">
                        <div className="flex justify-between items-center mb-12">
                            <span className="font-serif font-bold text-2xl text-[#8B735B]">ZELDA</span>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-2 bg-[#F7F3F0] rounded-full active:scale-90 transition-transform"
                            >
                                <X size={20} className="text-[#4A3E31]" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-xl font-serif text-[#4A3E31] border-b border-[#F7F3F0] pb-4 active:text-[#8B735B]"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* تذييل بسيط للقائمة */}
                        <div className="mt-auto pt-10 text-center">
                            <p className="text-[10px] text-[#A6998A] font-bold tracking-widest uppercase">Zelda Line © 2026</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}