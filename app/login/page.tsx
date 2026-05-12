"use client";

import { useState, useEffect } from 'react';
import {
    Mail,
    Lock,
    User,
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    Loader2,
    Eye,
    EyeOff
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    // حل مشكلة الـ setState في الـ Effect
    useEffect(() => {
        let isAlive = true;
        if (isAlive) {
            setMounted(true);
        }
        return () => { isAlive = false; };
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const fullName = formData.get('fullName') as string;

        try {
            if (isLogin) {
                // تسجيل الدخول
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                if (data?.user) {
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('role, full_name')
                        .eq('id', data.user.id)
                        .single();

                    if (profileError) {
                        router.push('/');
                    } else {
                        toast.success('تم تسجيل الدخول بنجاح', {
                            description: `مرحباً بك مجدداً ${profile?.full_name || ''}`,
                        });

                        if (profile?.role === 'admin') {
                            router.push('/admin');
                        } else {
                            router.push('/');
                        }
                    }
                    router.refresh();
                }

            } else {
                // إنشاء حساب جديد
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            display_name: fullName
                        }
                    }
                });

                if (signUpError) throw signUpError;

                if (signUpData.user) {
                    toast.success('تم إنشاء الحساب بنجاح!', {
                        description: 'يمكنك الآن الدخول باستخدام بياناتك.',
                    });
                    setIsLogin(true);
                }
            }
        } catch (error: unknown) { // حل مشكلة الـ any هنا
            const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
            toast.error('حدث خطأ', {
                description: errorMessage || 'يرجى المحاولة مرة أخرى',
            });
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <main className="min-h-screen bg-[#FCFBF9] flex items-center justify-center p-6 text-right font-sans" dir="rtl">
            <Toaster position="top-center" dir="rtl" richColors />

            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-4xl shadow-sm border border-[#EDEAE5]">

                <div className="text-center space-y-2">
                    <Link href="/" className="inline-flex items-center text-xs font-black uppercase tracking-[0.3em] text-[#8B735B] hover:text-black transition-colors mb-6">
                        <ArrowRight size={14} className="ml-2" /> العودة للمتجر
                    </Link>
                    <h1 className="text-4xl font-serif text-[#4A3E31]">Zeldaline</h1>
                    <p className="text-[#8B735B] text-sm font-medium">
                        {isLogin ? 'مرحباً بعودتك! سجل دخولك للمتابعة' : 'أنشئ حسابك واستمتع بتجربة تسوق فريدة'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="text-xs font-black text-[#A6998A] mr-2">الاسم الكامل</label>
                            <div className="relative">
                                <input
                                    name="fullName"
                                    required={!isLogin}
                                    type="text"
                                    placeholder="الاسم الثلاثي"
                                    className="w-full bg-[#FCFBF9] border-none p-4 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-[#8B735B]/20 transition-all text-right text-[#4A3E31] font-medium"
                                />
                                <User className="absolute right-4 top-4 text-[#D4C3B3]" size={18} />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-black text-[#A6998A] mr-2">البريد الإلكتروني</label>
                        <div className="relative">
                            <input
                                name="email"
                                required
                                type="email"
                                placeholder="example@mail.com"
                                className="w-full bg-[#FCFBF9] border-none p-4 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-[#8B735B]/20 transition-all text-right text-[#4A3E31] font-medium"
                            />
                            <Mail className="absolute right-4 top-4 text-[#D4C3B3]" size={18} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-[#A6998A] mr-2">كلمة المرور</label>
                        <div className="relative">
                            <input
                                name="password"
                                required
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full bg-[#FCFBF9] border-none p-4 pr-12 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-[#8B735B]/20 transition-all text-right text-[#4A3E31] font-medium"
                            />
                            <Lock className="absolute right-4 top-4 text-[#D4C3B3]" size={18} />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-4 top-4 text-[#D4C3B3] hover:text-[#8B735B] transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#4A3E31] text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-xl active:scale-[0.98] disabled:bg-[#D4C3B3] disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
                                <ArrowLeft size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center pt-4">
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-xs font-black uppercase tracking-widest text-[#8B735B] hover:text-[#4A3E31] transition-colors"
                    >
                        {isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب بالفعل؟ سجل دخولك'}
                    </button>
                </div>

                <div className="pt-8 flex items-center justify-center gap-2 text-[#D4C3B3] text-[10px] font-black uppercase tracking-widest border-t border-[#F7F3F0]">
                    <ShieldCheck size={14} />
                    <span>جميع البيانات محمية ومشفرة</span>
                </div>
            </div>
        </main>
    );
}