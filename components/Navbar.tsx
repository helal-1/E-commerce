"use client";

import { useEffect, useState, useRef } from 'react';
import { ShoppingBag, Search, User, Menu, X, Heart, Loader2, Home } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../app/context/CartContext';
import { useWishlist } from '../app/context/WishlistContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function Navbar() {
    const { cartCount, setIsCartOpen } = useCart();
    const { wishlist, setIsWishlistOpen } = useWishlist();
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

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
                setSearchResults(data || []);
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
            <nav className="w-full h-20 bg-white/95 backdrop-blur-md flex items-center justify-between px-6 md:px-12 border-b border-[#EDEAE5] sticky top-0 z-[60]" dir="rtl">

                {/* زر القائمة للموبايل (Sidebar Toggle Only) */}
                <div className="md:hidden flex items-center">
                    <button onClick={() => setIsMenuOpen(true)}>
                        <Menu className="w-6 h-6 text-[#4A3E31]" />
                    </button>
                </div>

                {/* روابط الديسك توب */}
                <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] text-[#8B735B] font-black">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="hover:text-[#4A3E31] transition-colors">
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* اللوجو */}
                <Link href="/" className="text-xl md:text-2xl font-serif tracking-[0.1em] text-[#4A3E31] absolute left-1/2 -translate-x-1/2">
                    ZELDA<span className="font-bold text-[#8B735B]">LINE</span>
                </Link>

                {/* الأيقونات (تظهر فقط في الديسك توب) */}
                <div className="hidden md:flex items-center gap-5">
                    {/* البحث الذكي */}
                    <div className="relative" ref={searchRef}>
                        <Search
                            className="w-5 h-5 cursor-pointer text-[#4A3E31] hover:text-[#8B735B] transition-colors"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                        />

                        {isSearchOpen && (
                            <div className="absolute top-12 -left-4 w-[450px] bg-white border-2 border-[#EDEAE5] shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2rem] p-5 animate-in fade-in zoom-in-95 duration-200">
                                <div className="relative mb-4">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="ابحثي عن قطعة فنية..."
                                        className="w-full bg-[#F7F3F0] border-none p-4 pr-12 rounded-2xl text-sm font-bold text-[#4A3E31] outline-none focus:ring-2 focus:ring-[#8B735B]/20 placeholder-[#A6998A]"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <Search className="absolute right-4 top-4 w-5 h-5 text-[#8B735B]" />
                                </div>
                                <div className="max-h-[350px] overflow-y-auto custom-scrollbar text-right">
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

                    {/* المفضلات */}
                    <div className="relative cursor-pointer group" onClick={() => setIsWishlistOpen(true)}>
                        <Heart className={`w-5 h-5 transition-colors ${wishlist.length > 0 ? 'text-[#A66C6C] fill-[#A66C6C]' : 'text-[#4A3E31] hover:text-[#A66C6C]'}`} />
                        {wishlist.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[#A66C6C] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm">
                                {wishlist.length}
                            </span>
                        )}
                    </div>

                    {/* المستخدم */}
                    <Link href={getTargetLink()}>
                        <div className="relative group">
                            <User className={`w-5 h-5 transition-all ${user ? 'text-[#8B735B] stroke-[2.5px]' : 'text-[#4A3E31] hover:text-[#8B735B]'}`} />
                            {user && role === 'admin' && (
                                <span className="absolute -top-2 -left-5 bg-[#4A3E31] text-[7px] text-white px-1.5 py-0.5 rounded-full font-black">ADMIN</span>
                            )}
                        </div>
                    </Link>

                    {/* السلة */}
                    <div className="relative cursor-pointer group" onClick={() => setIsCartOpen(true)}>
                        <ShoppingBag className="w-5 h-5 text-[#4A3E31] group-hover:text-[#8B735B] transition-colors" />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[#8B735B] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                {cartCount}
                            </span>
                        )}
                    </div>
                </div>
            </nav>

            {/* --- Mobile Bottom Navigation (الأيقونات السفلية) --- */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-t border-[#EDEAE5] z-[100] flex items-center justify-around px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]" dir="rtl">
                <Link href="/" className="flex flex-col items-center gap-1 text-[#A6998A] hover:text-[#4A3E31]">
                    <Home size={20} />
                    <span className="text-[8px] font-black uppercase tracking-tighter">الرئيسية</span>
                </Link>

                <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="flex flex-col items-center gap-1 text-[#A6998A] hover:text-[#4A3E31]">
                    <Search size={20} />
                    <span className="text-[8px] font-black uppercase tracking-tighter">البحث</span>
                </button>

                <button onClick={() => setIsWishlistOpen(true)} className="flex flex-col items-center gap-1 relative text-[#A6998A] hover:text-[#4A3E31]">
                    <Heart size={20} className={wishlist.length > 0 ? 'text-[#A66C6C] fill-[#A66C6C]' : ''} />
                    {wishlist.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#A66C6C] text-white text-[7px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                            {wishlist.length}
                        </span>
                    )}
                    <span className="text-[8px] font-black uppercase tracking-tighter">المفضلات</span>
                </button>

                <button onClick={() => setIsCartOpen(true)} className="flex flex-col items-center gap-1 relative text-[#A6998A] hover:text-[#4A3E31]">
                    <ShoppingBag size={20} />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#8B735B] text-white text-[7px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                            {cartCount}
                        </span>
                    )}
                    <span className="text-[8px] font-black uppercase tracking-tighter">السلة</span>
                </button>

                <Link href={getTargetLink()} className="flex flex-col items-center gap-1 text-[#A6998A] hover:text-[#4A3E31]">
                    <User size={20} className={user ? 'text-[#8B735B]' : ''} />
                    <span className="text-[8px] font-black uppercase tracking-tighter">حسابي</span>
                </Link>
            </div>

            {/* Mobile Search Overlay (عند الضغط على بحث في الموبايل) */}
            {isSearchOpen && (
                <div className="md:hidden fixed inset-0 z-[150] bg-white animate-in slide-in-from-bottom duration-300 p-6" dir="rtl">
                    <div className="flex items-center justify-between mb-8">
                        <span className="font-serif font-bold text-[#8B735B]">بحث زيلدا</span>
                        <button onClick={() => setIsSearchOpen(false)} className="p-2 bg-[#FCFBF9] rounded-full">
                            <X size={20} className="text-[#A6998A]" />
                        </button>
                    </div>
                    <div className="relative mb-6">
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
                    <div className="overflow-y-auto h-[calc(100vh-200px)]">
                        {isSearching ? (
                            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#8B735B]" /></div>
                        ) : searchResults.map(item => (
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

            {/* القائمة المنزلقة للموبايل (Sidebar للروابط فقط) */}
            <div className={`fixed inset-0 z-[110] transition-all duration-300 ${isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
                <div className="absolute inset-0 bg-[#4A3E31]/40 backdrop-blur-md" onClick={() => setIsMenuOpen(false)} />
                <div className={`absolute right-0 top-0 h-full w-[300px] bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-8 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-16">
                            <span className="font-serif font-bold text-2xl tracking-widest text-[#8B735B]">ZELDA</span>
                            <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FCFBF9] hover:bg-[#F7F3F0]">
                                <X className="w-5 h-5 text-[#A6998A]" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-xl font-serif text-[#4A3E31] border-b border-[#F7F3F0] pb-4 hover:pr-4 hover:text-[#8B735B] transition-all duration-300">
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                        <div className="mt-auto space-y-6 text-center">
                            <p className="text-[10px] text-[#A6998A] font-black uppercase tracking-[0.3em] italic">Luxury Redefined</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}