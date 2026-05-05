"use client";

import { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const fullName = formData.get('fullName') as string;

        try {
            if (isLogin) {
                // 1. تسجيل الدخول الأساسي
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                if (data?.user) {
                    // 2. فحص صلاحية المستخدم (Admin أم User) من الجدول اللي جهزناه
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', data.user.id)
                        .single();

                    if (profileError) throw profileError;

                    // 3. التوجيه بناءً على الصلاحية
                    if (profile?.role === 'admin') {
                        router.push('/admin'); // توجيه للأدمن
                    } else {
                        router.push('/'); // توجيه لليوزر العادي
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

                alert("تم إنشاء الحساب بنجاح! يمكنك الدخول الآن.");
                setIsLogin(true);
            }
        } catch (error: any) {
            alert(error.message || "حدث خطأ ما");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6" dir="rtl">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">

                {/* الشعار والترحيب */}
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
                                    placeholder="محمد مراد"
                                    className="w-full bg-gray-50 border-none p-4 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all text-right text-gray-900"
                                />
                                <User className="absolute right-4 top-4 text-gray-300" size={18} />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2 text-right">
                        <label className="text-xs font-black text-gray-400 mr-2">البريد الإلكتروني</label>
                        <div className="relative">
                            <input
                                name="email"
                                required
                                type="email"
                                placeholder="name@example.com"
                                className="w-full bg-gray-50 border-none p-4 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all text-right text-gray-900"
                            />
                            <Mail className="absolute right-4 top-4 text-gray-300" size={18} />
                        </div>
                    </div>

                    <div className="space-y-2 text-right">
                        <label className="text-xs font-black text-gray-400 mr-2">كلمة المرور</label>
                        <div className="relative">
                            <input
                                name="password"
                                required
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border-none p-4 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all text-right text-gray-900"
                            />
                            <Lock className="absolute right-4 top-4 text-gray-300" size={18} />
                        </div>
                        {isLogin && (
                            <button type="button" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mt-2 mr-2">نسيت كلمة المرور؟</button>
                        )}
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
                                {isLogin ? 'دخول' : 'إنشاء حساب'}
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
                    <span>بياناتك محمية ومشفرة</span>
                </div>
            </div>
        </main>
    );
}