"use client";

import { useEffect, useState } from 'react';
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../app/context/CartContext';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
    const { cartCount, setIsCartOpen } = useCart();
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // حالة القائمة للموبايل

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

        return () => subscription.unsubscribe();
    }, []);

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
            <nav className="w-full h-20 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 md:px-12 border-b border-gray-100 sticky top-0 z-50" dir="rtl">

                {/* زر القائمة للموبايل */}
                <div className="md:hidden flex items-center">
                    <button onClick={() => setIsMenuOpen(true)}>
                        <Menu className="w-6 h-6 text-gray-700" />
                    </button>
                </div>

                {/* روابط الديسك توب */}
                <div className="hidden md:flex items-center gap-8 text-[12px] uppercase tracking-[0.2em] text-gray-500 font-black">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="hover:text-black transition-colors">
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* اللوجو */}
                <Link href="/" className="text-xl md:text-2xl font-serif tracking-[0.1em] text-gray-900">
                    ZELDA<span className="font-bold text-amber-700">LINE</span>
                </Link>

                {/* الأيقونات */}
                <div className="flex items-center gap-5">
                    <Search className="w-5 h-5 cursor-pointer text-gray-600 hover:text-black" />

                    <Link href={getTargetLink()}>
                        <div className="relative group">
                            <User className={`w-5 h-5 transition-all ${user ? (role === 'admin' ? 'text-red-600 stroke-[2.5px]' : 'text-amber-700 stroke-[2.5px]') : 'text-gray-600'}`} />
                            {user && role === 'admin' && (
                                <span className="absolute -top-2 -left-2 bg-red-600 text-[8px] text-white px-1 rounded-sm font-bold tracking-tighter">ADMIN</span>
                            )}
                        </div>
                    </Link>

                    <div className="relative cursor-pointer group" onClick={() => setIsCartOpen(true)}>
                        <ShoppingBag className="w-5 h-5 text-gray-600 group-hover:text-black" />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-amber-700 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                {cartCount}
                            </span>
                        )}
                    </div>
                </div>
            </nav>

            {/* القائمة المنزلقة للموبايل (Mobile Sidebar) */}
            <div className={`fixed inset-0 z-[100] transition-visibility duration-300 ${isMenuOpen ? 'visible' : 'invisible'}`}>
                {/* Overlay الخلفية المعتمة */}
                <div
                    className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsMenuOpen(false)}
                />

                {/* القائمة نفسها */}
                <div className={`absolute right-0 top-0 h-full w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-6 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-12">
                            <span className="font-serif font-bold text-xl tracking-widest text-amber-700">ZELDA</span>
                            <button onClick={() => setIsMenuOpen(false)}>
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-lg font-black text-gray-800 border-b border-gray-50 pb-4 hover:text-amber-700"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="mt-auto pb-10">
                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">فخامة تليق بكِ</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}