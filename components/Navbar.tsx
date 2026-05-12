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

    // --- حل مشكلة التداخل (إضافة Padding لجسم الصفحة) ---
    useEffect(() => {
        document.body.classList.add('pb-16', 'md:pb-0');
        return () => {
            document.body.classList.remove('pb-16', 'md:pb-0');
        };
    }, []);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                setRole(profile?.role || 'user');
            }
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();
                setRole(profile?.role || 'user');
            } else {
                setRole(null);
            }
        });

        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            subscription.unsubscribe();
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
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
        return () => clearTimeout(delayDebounceFn);
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
            {/* Desktop & Tablet Top Navbar */}
            <nav className="w-full h-20 bg-white/95 backdrop-blur-md flex items-center justify-between px-6 md:px-12 border-b border-[#EDEAE5] sticky top-0 z-[100]" dir="rtl">

                {/* روابط الديسك توب */}
                <div className="hidden md:flex items-center gap-10 text-[11px] uppercase tracking-[0.25em] text-[#8B735B] font-bold">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="flex flex-col items-center group transition-all duration-300 hover:tracking-[0.35em]"
                        >
                            <span className="group-hover:text-[#4A3E31] transition-colors duration-300">{link.name}</span>
                            {/* النقطة الفاخرة */}
                            <span className="w-2 h-3 bg-[#b2702e] rounded-full opacity-0 translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-1"></span>
                        </Link>
                    ))}
                </div>

                {/* اللوجو */}
                <Link href="/" className="text-xl md:text-2xl font-serif tracking-widest text-[#4A3E31] absolute left-1/2 -translate-x-1/2">
                    ZELDA<span className="font-bold text-[#8B735B]">LINE</span>
                </Link>

                {/* الأيقونات */}
                <div className="hidden md:flex items-center gap-5">
                    {/* البحث الذكي - تم تعديله ليكون عريضاً */}
                    <div className="relative" ref={searchRef}>
                        <Search
                            className="w-5 h-5 cursor-pointer text-[#4A3E31] hover:text-[#8B735B] transition-colors"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                        />
                        {isSearchOpen && (
                            /* تم تعديل العرض هنا ليكون w-[450px] وضبط التموضع ليكون واسعاً */
                            <div className="absolute top-12 left-0 w-[450px] bg-white border border-[#EDEAE5] shadow-2xl rounded-3xl p-6 animate-in fade-in zoom-in-95 duration-200 z-[60]">
                                <div className="relative mb-4">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="ابحثي عن قطعة فنية..."
                                        className="w-full bg-[#F7F3F0] border-none p-4 pr-12 rounded-2xl text-sm font-bold text-[#4A3E31] outline-none"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <Search className="absolute right-4 top-4 w-5 h-5 text-[#8B735B]" />
                                </div>
                                <div className="max-h-96 overflow-y-auto custom-scrollbar text-right">
                                    {isSearching ? (
                                        <div className="flex justify-center p-6"><Loader2 className="animate-spin text-[#8B735B]" size={24} /></div>
                                    ) : searchResults.length > 0 ? (
                                        <div className="flex flex-col gap-2">
                                            {searchResults.map(item => (
                                                <Link key={item.id} href={`/product/${item.id}`} onClick={() => setIsSearchOpen(false)} className="flex items-center gap-4 p-3 hover:bg-[#F7F3F0] rounded-2xl transition-all group">
                                                    <div className="w-14 h-14 relative rounded-xl overflow-hidden shrink-0 border border-[#EDEAE5]">
                                                        <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-sm font-black text-[#4A3E31] group-hover:text-[#8B735B] transition-colors">{item.name}</span>
                                                        <span className="text-xs font-serif italic text-[#8B735B]">{item.price.toLocaleString()} ج.م</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : searchQuery.length > 1 && (
                                        <p className="text-center py-8 text-sm text-[#4A3E31] font-serif italic">لم نجد نتائج</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <button onClick={() => setIsWishlistOpen(true)} className="relative group">
                        <Heart className={`w-5 h-5 transition-colors ${wishlist.length > 0 ? 'text-[#A66C6C] fill-[#A66C6C]' : 'text-[#4A3E31] hover:text-[#A66C6C]'}`} />
                        {wishlist.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[#A66C6C] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm">
                                {wishlist.length}
                            </span>
                        )}
                    </button>

                    <Link href={getTargetLink()}>
                        <div className="relative group">
                            <User className={`w-5 h-5 transition-all ${user ? 'text-[#8B735B] stroke-[2.5px]' : 'text-[#4A3E31] hover:text-[#8B735B]'}`} />
                        </div>
                    </Link>

                    <button onClick={() => setIsCartOpen(true)} className="relative group">
                        <ShoppingBag className="w-5 h-5 text-[#4A3E31] group-hover:text-[#8B735B] transition-colors" />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[#8B735B] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </nav>

            {/* --- Mobile Bottom Navigation --- */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-[#EDEAE5] z-50 flex items-center justify-around px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]" dir="rtl">
                <button onClick={() => setIsMenuOpen(true)} className="flex flex-col items-center gap-1 text-[#A6998A]">
                    <Menu size={20} />
                    <span className="text-[8px] font-black uppercase">القائمة</span>
                </button>

                <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="flex flex-col items-center gap-1 text-[#A6998A]">
                    <Search size={20} />
                    <span className="text-[8px] font-black uppercase">البحث</span>
                </button>

                <button onClick={() => setIsWishlistOpen(true)} className="flex flex-col items-center gap-1 relative text-[#A6998A]">
                    <Heart size={20} className={wishlist.length > 0 ? 'text-[#A66C6C] fill-[#A66C6C]' : ''} />
                    <span className="text-[8px] font-black uppercase">المفضلات</span>
                </button>

                <button onClick={() => setIsCartOpen(true)} className="flex flex-col items-center gap-1 relative text-[#A6998A]">
                    <div className="relative">
                        <ShoppingBag size={20} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[#8B735B] text-white text-[7px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                                {cartCount}
                            </span>
                        )}
                    </div>
                    <span className="text-[8px] font-black uppercase">السلة</span>
                </button>

                <Link href={getTargetLink()} className="flex flex-col items-center gap-1 text-[#A6998A]">
                    <User size={20} className={user ? 'text-[#8B735B]' : ''} />
                    <span className="text-[8px] font-black uppercase">حسابي</span>
                </Link>
            </div>

            {/* Mobile Search Overlay */}
            {isSearchOpen && (
                <div className="md:hidden fixed inset-0 z-[100] bg-white p-6" dir="rtl">
                    <div className="flex items-center justify-between mb-8">
                        <span className="font-serif font-bold text-[#8B735B]">البحث</span>
                        <button onClick={() => setIsSearchOpen(false)} className="p-2 bg-[#FCFBF9] rounded-full">
                            <X size={20} className="text-[#A6998A]" />
                        </button>
                    </div>
                    <input
                        autoFocus
                        type="text"
                        placeholder="ابحثي..."
                        className="w-full bg-[#F7F3F0] p-4 rounded-2xl outline-none mb-6 font-bold"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="overflow-y-auto h-[calc(100vh-200px)]">
                        {searchResults.map(item => (
                            <Link key={item.id} href={`/product/${item.id}`} onClick={() => setIsSearchOpen(false)} className="flex items-center gap-4 p-4 border-b border-[#F7F3F0]">
                                <div className="w-16 h-16 relative rounded-xl overflow-hidden shrink-0 border border-[#EDEAE5]">
                                    <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-[#4A3E31]">{item.name}</span>
                                    <span className="text-xs font-serif italic text-[#8B735B]">{item.price.toLocaleString()} ج.م</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Sidebar Menu */}
            <div className={`fixed inset-0 z-[110] transition-all duration-300 ${isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
                <div className={`absolute right-0 top-0 h-full w-75 bg-white shadow-2xl transition-transform duration-500 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-8 flex flex-col h-full" dir="rtl">
                        <div className="flex justify-between items-center mb-16">
                            <span className="font-serif font-bold text-2xl text-[#8B735B]">ZELDA</span>
                            <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FCFBF9]">
                                <X className="w-5 h-5 text-[#A6998A]" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-xl font-serif text-[#4A3E31] border-b border-[#F7F3F0] pb-4">
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}