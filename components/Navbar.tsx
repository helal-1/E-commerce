"use client";

import { useEffect, useState, useRef } from 'react';
import { ShoppingBag, Search, User, Menu, X, Heart, Loader2, ArrowRight } from 'lucide-react';
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

    useEffect(() => {
        document.body.classList.add('pb-16', 'md:pb-0');
        return () => document.body.classList.remove('pb-16', 'md:pb-0');
    }, []);

    useEffect(() => {
        const fetchUserData = async (currentUser: SupabaseUser | null) => {
            if (!currentUser) { setRole(null); return; }
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
            {/* --- Navbar الرئيسي --- */}
            <nav className="w-full h-20 bg-white/95 backdrop-blur-md flex items-center justify-between px-6 md:px-12 border-b border-[#EDEAE5] sticky top-0 z-[100]" dir="rtl">

        <>
  <style>{`
    .nav-link { position: relative; display: inline-block; padding-bottom: 6px; }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0;
      height: 1px; width: 100%;
      background: #C9A87C;
      transform: scaleX(0);
      transform-origin: right;
      transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
    }
    .nav-link:hover { color: #4A3E31; transform: translateY(-2px); }
    .nav-link:hover::after { transform: scaleX(1); transform-origin: left; }
  `}</style>

  <div className="hidden md:flex items-center gap-10 text-[11px] uppercase tracking-[0.2em] text-[#8B735B] font-bold">
    {navLinks.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        className="nav-link text-lg transition-all duration-300"
      >
        {link.name}
      </Link>
    ))}
  </div>
</>

                <Link href="/" className="text-xl md:text-2xl font-serif tracking-widest text-[#4A3E31] absolute left-1/2 -translate-x-1/2">
                    ZELDA<span className="font-bold text-[#8B735B]">LINE</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <button onClick={() => setIsSearchOpen(true)}><Search size={20} className="text-[#4A3E31]" /></button>
                    <button onClick={() => setIsWishlistOpen(true)} className="relative">
                        <Heart size={20} className={wishlist.length > 0 ? 'fill-[#A66C6C] text-[#A66C6C]' : 'text-[#4A3E31]'} />
                    </button>
                    <Link href={getTargetLink()}><User size={20} className="text-[#4A3E31]" /></Link>
                    <button onClick={() => setIsCartOpen(true)} className="relative">
                        <ShoppingBag size={20} className="text-[#4A3E31]" />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[#8B735B] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </nav>

            {/* --- شريط التنقل السفلي (Mobile) --- */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#EDEAE5] z-[100] flex items-center justify-around shadow-lg" dir="rtl">
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="flex flex-col items-center text-[#A6998A] active:scale-95 transition-transform"
                >
                    <Menu size={20} />
                    <span className="text-[8px] font-bold mt-1">القائمة</span>
                </button>

                <button
                    onClick={() => { setIsSearchOpen(true); setSearchResults([]); setSearchQuery(""); }}
                    className="flex flex-col items-center text-[#A6998A]"
                >
                    <Search size={20} />
                    <span className="text-[8px] font-bold mt-1">بحث</span>
                </button>

                <button onClick={() => setIsWishlistOpen(true)} className="flex flex-col items-center text-[#A6998A] relative">
                    <Heart size={20} className={wishlist.length > 0 ? 'fill-[#A66C6C] text-[#A66C6C]' : ''} />
                    <span className="text-[8px] font-bold mt-1">المفضلة</span>
                </button>

                <button onClick={() => setIsCartOpen(true)} className="flex flex-col items-center text-[#A6998A] relative">
                    <ShoppingBag size={20} />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 right-2 bg-[#8B735B] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                            {cartCount}
                        </span>
                    )}
                    <span className="text-[8px] font-bold mt-1">السلة</span>
                </button>

                <Link href={getTargetLink()} className="flex flex-col items-center text-[#A6998A]">
                    <User size={20} />
                    <span className="text-[8px] font-bold mt-1">حسابي</span>
                </Link>
            </div>

            {/* ══════════════════════════════════════
                مودال البحث
            ══════════════════════════════════════ */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/45 backdrop-blur-xl animate-in fade-in duration-300" dir="rtl">

                    {/* ستارة الخلفية */}
                    <div className="absolute inset-0 cursor-zoom-out" onClick={() => setIsSearchOpen(false)} />

                    {/* المربع الرئيسي */}
                    <div
                        className="relative w-full pt-2 max-w-md md:max-w-xl flex flex-col max-h-[480px] overflow-hidden animate-in zoom-in-95 duration-300"
                        style={{ background: '#fff', borderRadius: '20px', border: '1px solid #F0EBE4' }}
                    >
                        {/* شريط ذهبي علوي */}
                        <div style={{ height: '2px', background: '#C9A87C', opacity: 0.5 }} />

                        {/* الهيدر */}
                        <div
                            className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0"
                            style={{ background: '#fff', borderBottom: '1px solid #F5F0EA' }}
                        >
                            <div>
                                <p className="m-0 text-sm font-medium" style={{ color: '#3A2E22' }}>البحث</p>
                                <p className="m-0 mt-0.5" style={{ fontSize: '10px', color: '#B0A090', letterSpacing: '0.1em' }}>
                                    ZELDA LINE SEARCH
                                </p>
                            </div>
                            <button
                                onClick={() => setIsSearchOpen(false)}
                                className="flex items-center justify-center transition-colors duration-200"
                                style={{
                                    width: '30px', height: '30px', borderRadius: '50%',
                                    border: '1px solid #EDE8E2', background: '#fff', color: '#9C8F82',
                                    cursor: 'pointer'
                                }}
                                aria-label="إغلاق"
                            >
                                <X size={13} />
                            </button>
                        </div>

                        {/* حقل البحث */}
                        <div className="px-6 pt-4 shrink-0" style={{ background: '#fff' }}>
                            <div className="relative">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="ما الذي تبحثين عنه اليوم؟"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full text-sm text-right outline-none transition-all duration-200"
                                    style={{
                                        padding: '11px 40px 11px 14px',
                                        borderRadius: '10px',
                                        border: '1px solid #EDE8E2',
                                        background: '#FDFBF8',
                                        color: '#3A2E22',
                                        direction: 'rtl',
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = '#C9A87C')}
                                    onBlur={(e) => (e.target.style.borderColor = '#EDE8E2')}
                                />
                                <Search
                                    size={15}
                                    className="absolute top-1/2 -translate-y-1/2"
                                    style={{ right: '13px', color: '#C9A87C' }}
                                />
                            </div>
                        </div>

                        {/* قائمة النتائج */}
                        <div
                            className="flex-1 overflow-y-auto flex flex-col min-h-0"
                            style={{ padding: '10px 16px 16px', gap: '1px', background: '#fff', scrollbarWidth: 'none' }}
                        >
                            {/* حالة التحميل */}
                            {isSearching && (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <Loader2 className="animate-spin" size={22} style={{ color: '#C9A87C' }} />
                                    <span style={{ fontSize: '10px', letterSpacing: '0.08em', color: '#B0A090' }}>
                                        جاري البحث في المتجر...
                                    </span>
                                </div>
                            )}

                            {/* نتائج البحث */}
                            {!isSearching && searchResults.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/product/${item.id}`}
                                    onClick={() => setIsSearchOpen(false)}
                                    className="flex items-center justify-between group transition-colors duration-150"
                                    style={{ padding: '10px', borderRadius: '10px', background: '#fff' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = '#FDFAF6')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                                >
                                    <div className="flex items-center gap-3" style={{ direction: 'rtl' }}>
                                        <div
                                            className="shrink-0 overflow-hidden"
                                            style={{
                                                width: '42px', height: '50px', borderRadius: '8px',
                                                border: '1px solid #EDE8E2', background: '#FDFAF6'
                                            }}
                                        >
                                            <img
                                                src={item.images[0]}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="text-right">
                                            <p className="m-0 text-xs font-medium md:text-sm" style={{ color: '#3A2E22' }}>
                                                {item.name}
                                            </p>
                                            <p className="m-0 mt-1 italic" style={{ fontSize: '12px', color: '#C9A87C' }}>
                                                {item.price.toLocaleString()} ج.م
                                            </p>
                                        </div>
                                    </div>

                                    <ArrowRight
                                        size={13}
                                        className="rotate-180 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        style={{ color: '#C9B8A8', flexShrink: 0 }}
                                    />
                                </Link>
                            ))}

                            {/* حالة عدم وجود نتائج */}
                            {searchQuery.length > 1 && !isSearching && searchResults.length === 0 && (
                                <div className="text-center py-10">
                                    <p className="m-0 text-xs" style={{ color: '#7A6A5A' }}>لم نجد قطعاً تطابق بحثك</p>
                                    <p className="m-0 mt-1" style={{ fontSize: '10px', color: '#B0A090', letterSpacing: '0.08em' }}>
                                        TRY A DIFFERENT SEARCH
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- القائمة الجانبية (Mobile Sidebar) --- */}
            <div className={`fixed inset-0 z-[200] transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
                <div className={`absolute right-0 top-0 h-full w-100 bg-white shadow-2xl transition-transform duration-500 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
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
                        <div className="mt-auto pt-10 text-center">
                            <p className="text-[10px] text-[#A6998A] font-bold tracking-widest uppercase">Zelda Line © 2026</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}