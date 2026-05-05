"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
    User,
    Mail,
    Package,
    LogOut,
    Shield,
    Clock,
    Truck,
    CheckCircle,
    MapPin
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [latestOrder, setLatestOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);

            // 1. التأكد من هوية المستخدم
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

            if (authError || !authUser) {
                router.push('/login');
                return;
            }

            setUser(authUser);

            // 2. جلب أحدث طلب باستخدام .maybeSingle() لتجنب خطأ الـ Single record
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', authUser.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle(); // دي أهم تعديل، بترجع null لو مفيش بيانات بدل ما تعمل Error

            if (!orderError && orderData) {
                setLatestOrder(orderData);
            }

            setLoading(false);
        };

        fetchUserData();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const getStatusDetails = (status: string) => {
        const statuses: any = {
            'pending': { text: 'قيد المراجعة', icon: <Clock size={20} />, color: 'text-orange-600', bg: 'bg-orange-50' },
            'shipped': { text: 'جاري التوصيل', icon: <Truck size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
            'completed': { text: 'تم التسليم', icon: <CheckCircle size={20} />, color: 'text-green-600', bg: 'bg-green-50' }
        };
        return statuses[status] || { text: 'تحت المعالجة', icon: <Package size={20} />, color: 'text-gray-600', bg: 'bg-gray-50' };
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
            <div className="animate-pulse font-serif text-2xl text-gray-400">Zeldaline...</div>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#FAFAFA] pt-32 pb-20 px-6" dir="rtl">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-10">

                    <div className="flex-1 space-y-8 text-right">
                        <header className="space-y-2">
                            <h1 className="text-4xl font-serif text-gray-900">
                                مرحباً، {user?.user_metadata?.full_name || 'عميلنا العزيز'}
                            </h1>
                            <p className="text-gray-400">إليك تفاصيل حسابك وحالة طلبك الأخير</p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* المعلومات الشخصية */}
                            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
                                <div className="flex items-center gap-3 text-gray-900 font-black text-sm uppercase tracking-widest">
                                    <User size={18} className="text-amber-700" />
                                    <span>المعلومات الشخصية</span>
                                </div>
                                <div className="space-y-4 font-medium">
                                    <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                        <span className="text-gray-400 text-xs">الاسم:</span>
                                        <span className="text-sm">{user?.user_metadata?.full_name || "غير مسجل"}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-xs">البريد:</span>
                                        <span className="text-sm font-mono">{user?.email}</span>
                                    </div>
                                </div>
                            </section>

                            {/* حالة الطلب الأخير */}
                            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 text-gray-900 font-black text-sm uppercase tracking-widest mb-6">
                                    <Package size={18} className="text-amber-700" />
                                    <span>أحدث طلب</span>
                                </div>
                                {latestOrder ? (
                                    <div className="space-y-4">
                                        <div className={`flex items-center gap-3 p-4 rounded-2xl ${getStatusDetails(latestOrder.status).bg} ${getStatusDetails(latestOrder.status).color}`}>
                                            {getStatusDetails(latestOrder.status).icon}
                                            <span className="font-black text-xs">{getStatusDetails(latestOrder.status).text}</span>
                                        </div>
                                        <div className="flex justify-between items-center px-2">
                                            <span className="text-gray-400 text-xs">رقم الأوردر:</span>
                                            <span className="font-mono font-bold text-xs">#{latestOrder.id.slice(0, 8)}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-4 text-gray-400 gap-2">
                                        <Clock size={20} className="opacity-20" />
                                        <p className="text-[10px] italic">لا توجد طلبات نشطة</p>
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* تفاصيل الطلب الكبير */}
                        <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 text-center space-y-6">
                            {latestOrder ? (
                                <div className="space-y-6">
                                    <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-900 border border-zinc-100">
                                        <MapPin size={28} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-black text-xl text-zinc-900">جاهز للتوصيل</h3>
                                        <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
                                            طلبك الآن في مرحلة {getStatusDetails(latestOrder.status).text}. سنرسل لك رسالة تأكيد فور تحرك المندوب.
                                        </p>
                                    </div>
                                    <div className="pt-8 border-t border-gray-50 grid grid-cols-2 gap-4">
                                        <div className="text-right p-4 bg-zinc-50 rounded-2xl">
                                            <p className="text-gray-400 text-[10px] uppercase font-black mb-1">المبلغ الإجمالي</p>
                                            <p className="font-black text-xl text-black">{latestOrder.total_price} <span className="text-xs">ر.س</span></p>
                                        </div>
                                        <div className="text-right p-4 bg-zinc-50 rounded-2xl">
                                            <p className="text-gray-400 text-[10px] uppercase font-black mb-1">التاريخ</p>
                                            <p className="font-bold text-sm text-black">
                                                {new Date(latestOrder.created_at).toLocaleDateString('ar-EG')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-10">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200 mb-6">
                                        <Package size={40} />
                                    </div>
                                    <h3 className="font-black text-xl mb-2">ابدأ رحلتك مع زيلدا</h3>
                                    <p className="text-gray-400 text-sm mb-8">لم تقم بإجراء أي طلبات حتى الآن.</p>
                                    <Link href="/shop" className="inline-block bg-black text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                                        تصفح المتجر
                                    </Link>
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className="w-full md:w-64">
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm sticky top-32">
                            <div className="flex items-center gap-3 mb-8 px-2 border-b border-gray-50 pb-4">
                                <Shield size={16} className="text-green-600" />
                                <span className="text-[10px] font-black uppercase text-gray-400">حساب نشط</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-between p-5 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all font-black text-sm group"
                            >
                                <span>خروج</span>
                                <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}