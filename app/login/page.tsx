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

    // لحل مشكلة الـ Hydration في Next.js
    useEffect(() => {
        setMounted(true);
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
                // 1. تسجيل الدخول
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                if (data?.user) {
                    // 2. جلب بيانات البروفايل لمعرفة الصلاحية
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('role, full_name')
                        .eq('id', data.user.id)
                        .single();

                    toast.success('تم تسجيل الدخول بنجاح', {
                        description: `مرحباً بك مجدداً ${profile?.full_name || ''}`,
                    });

                    // 3. التوجيه بناءً على الصلاحية (أدمن أو مستخدم عادي)
                    if (profile?.role === 'admin') {
                        router.push('/admin');
                    } else {
                        router.push('/'); // يذهب للصفحة الرئيسية
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
                        }
                    }
                });

                if (signUpError) throw signUpError;

                toast.success('تم إنشاء الحساب بنجاح', {
                    description: 'يمكنك الآن تسجيل الدخول إلى حسابك الجديد',
                });

                setIsLogin(true);
            }
        } catch (error: any) {
            toast.error('حدث خطأ في العملية', {
                description: error.message || 'يرجى التحقق من البيانات والمحاولة مرة أخرى',
            });
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6" dir="rtl">
            <Toaster position="top-center" dir="rtl" richColors />

            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">

                {/* الرأس والرجوع */}
                <div className="text-center space-y-2">
                    <Link href="/" className="inline-flex items-center text-xs font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-colors mb-6">
                        <ArrowRight size={14} className="ml-2" /> العودة للمتجر
                    </Link>
                    <h1 className="text-4xl font-serif text-gray-900">Zeldaline</h1>
                    <p className="text-gray-400 text-sm font-medium">
                        {isLogin ? 'مرحباً بعودتك! سجل دخولك للمتابعة' : 'أنشئ حسابك واستمتع بتجربة تسوق فريدة'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div className="space-y-2 text-right">
                            <label className="text-xs font-black text-gray-400 mr-2">الاسم الكامل</label>
                            <div className="relative">
                                <input
                                    name="fullName"
                                    required
                                    type="text"
                                    placeholder="الاسم بالكامل"
                                    className="w-full bg-gray-50 border-none p-4 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all text-right text-gray-900"
                                />
                                <User className="absolute right-4 top-4 text-gray-300" size={18} />
                            </div>
                        </div>
                    )}

                    {/* حقل البريد الإلكتروني */}
                    <div className="space-y-2 text-right">
                        <label className="text-xs font-black text-gray-400 mr-2">البريد الإلكتروني</label>
                        <div className="relative">
                            <input
                                name="email"
                                required
                                type="email"
                                placeholder="example@mail.com"
                                className="w-full bg-gray-50 border-none p-4 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all text-right text-gray-900"
                            />
                            <Mail className="absolute right-4 top-4 text-gray-300" size={18} />
                        </div>
                    </div>

                    {/* حقل كلمة المرور المطور */}
                    <div className="space-y-2 text-right">
                        <label className="text-xs font-black text-gray-400 mr-2">كلمة المرور</label>
                        <div className="relative">
                            <input
                                name="password"
                                required
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border-none p-4 pr-12 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all text-right text-gray-900"
                            />
                            {/* أيقونة القفل على اليمين */}
                            <Lock className="absolute right-4 top-4 text-gray-300" size={18} />

                            {/* زر إظهار الباسورد على اليسار */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-4 top-4 text-gray-300 hover:text-black transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {/* {isLogin && (
                            <button
                                type="button"
                                onClick={() => toast.info('يرجى التواصل مع الدعم الفني لاستعادة حسابك')}
                                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mt-2 mr-2"
                            >
                                نسيت كلمة المرور؟
                            </button>
                        )} */}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-zinc-800 transition-all shadow-xl active:scale-[0.98] disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                        className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                    >
                        {isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب بالفعل؟ سجل دخولك'}
                    </button>
                </div>

                <div className="pt-8 flex items-center justify-center gap-2 text-gray-300 text-[10px] font-black uppercase tracking-widest border-t border-gray-50">
                    <ShieldCheck size={14} />
                    <span>جميع البيانات محمية ومشفرة</span>
                </div>
            </div>
        </main>
    );
}