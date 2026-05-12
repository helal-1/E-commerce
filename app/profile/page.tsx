"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
    User,
    Package,
    LogOut,
    Shield,
    Clock,
    Truck,
    CheckCircle,
    MapPin,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface Order {
    id: string;
    status: string;
    total_price: number;
    created_at: string;
}

interface StatusDetail {
    text: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    accent: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [latestOrder, setLatestOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
            if (authError || !authUser) {
                router.push('/login');
                return;
            }
            setUser(authUser);
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', authUser.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!orderError && orderData) {
                setLatestOrder(orderData as Order);
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

    const getStatusDetails = (status: string): StatusDetail => {
        const statuses: Record<string, StatusDetail> = {
            'pending': { text: 'قيد المراجعة', icon: <Clock size={18} />, color: 'text-orange-700', bg: 'bg-orange-100', accent: 'bg-orange-500' },
            'shipped': { text: 'جاري التوصيل', icon: <Truck size={18} />, color: 'text-blue-700', bg: 'bg-blue-100', accent: 'bg-blue-500' },
            'completed': { text: 'تم التسليم', icon: <CheckCircle size={18} />, color: 'text-emerald-700', bg: 'bg-emerald-100', accent: 'bg-emerald-500' }
        };
        return statuses[status] || { text: 'تحت المعالجة', icon: <Package size={18} />, color: 'text-slate-700', bg: 'bg-slate-100', accent: 'bg-slate-500' };
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
            <div className="animate-pulse font-serif text-2xl text-[#8B735B]">Zeldaline...</div>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#FDFCFB] pt-40 pb-20 px-4 md:px-10" dir="rtl">
            <div className="max-w-6xl mx-auto mt-[-120px] bg-[#FDFCFB] rounded-[3rem] p-8 md:p-12">

                {/* Header Section */}
                <header className="mb-12 text-right">
                    <h1 className="text-4xl md:text-5xl font-serif text-[#4A3E31] mb-2">
                        أهلاً، <span className="text-[#8B735B]">{user?.user_metadata?.full_name?.split(' ')[0] || 'Mohamed'}</span>
                    </h1>
                    <p className="text-[#A6998A] text-lg italic">مساحتك الخاصة لمتابعة الأناقة</p>
                </header>

                {/* Grid Layout Fix */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* القائمة الجانبية (Right in RTL) */}
                    <aside className="w-full lg:w-72 order-2 lg:order-1">
                        <div className="bg-white p-6 rounded-3xl border border-[#EDEAE5] shadow-sm space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-[#FCFBF9]">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[10px] font-black uppercase text-[#A6998A]">حساب نشط</span>
                                </div>
                                <Shield size={16} className="text-[#8B735B]" />
                            </div>

                            <nav className="space-y-3">
                                <Link href="/shop" className="flex items-center justify-between p-4 rounded-xl bg-[#FCFBF9] text-[#4A3E31] font-bold text-xs hover:bg-[#8B735B] hover:text-white transition-all">
                                    <span>العودة للمتجر</span>
                                    <ArrowLeft size={14} />
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-between p-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all font-black text-xs"
                                >
                                    <span>تسجيل الخروج</span>
                                    <LogOut size={16} />
                                </button>
                            </nav>

                            <div className="pt-4 text-center border-t border-[#FCFBF9]">
                                <p className="text-[8px] text-[#D4C3B3] font-black uppercase leading-tight">
                                    زيلدا لاين - صناعة مصرية يدوية فاخرة
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* المحتوى الرئيسي (Left in RTL) */}
                    <div className="flex-1 space-y-8 order-1 lg:order-2 w-full">

                        {/* Info Cards Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <section className="bg-white p-6 rounded-3xl border border-[#EDEAE5] shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <User size={18} className="text-[#8B735B]" />
                                    <span className="text-[#4A3E31] font-black text-xs uppercase tracking-widest">بيانات الحساب</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between border-b border-[#FCFBF9] pb-2">
                                        <span className="text-[#A6998A] text-xs">الاسم:</span>
                                        <span className="text-[#4A3E31] font-bold text-sm">{user?.user_metadata?.full_name || "Mohamed"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#A6998A] text-xs">البريد:</span>
                                        <span className="text-[#4A3E31] font-mono text-sm truncate max-w-[150px]">{user?.email}</span>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white p-6 rounded-3xl border border-[#EDEAE5] shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <Package size={18} className="text-[#8B735B]" />
                                    <span className="text-[#4A3E31] font-black text-xs uppercase tracking-widest">آخر طلب</span>
                                </div>
                                {latestOrder ? (
                                    <div className="space-y-4">
                                        <div className={`p-3 rounded-xl text-center font-bold text-xs ${getStatusDetails(latestOrder.status).bg} ${getStatusDetails(latestOrder.status).color}`}>
                                            {getStatusDetails(latestOrder.status).text}
                                        </div>
                                        <div className="flex justify-between text-xs font-mono text-[#4A3E31]">
                                            <span>#{latestOrder.id.slice(0, 8).toUpperCase()}</span>
                                            <span className="text-[#A6998A] italic">{new Date(latestOrder.created_at).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center text-[#D4C3B3] text-xs italic py-4">لا توجد طلبات سابقة</p>
                                )}
                            </section>
                        </div>

                        {/* Large Status Card */}
                        <section className="bg-[#4A3E31] text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                                    <MapPin size={30} className="text-[#D4C3B3]" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-serif text-[#D4C3B3] mb-2 italic">عنوان التوصيل</h3>
                                    <p className="text-white/60 text-sm max-w-md mx-auto">
                                        سيتم التوصيل إلى العنوان المسجل في طلبك الأخير. يمكنك تعديل البيانات عند عمل طلب جديد.
                                    </p>
                                </div>
                                <div className="pt-6 border-t border-white/10 w-full flex justify-around">
                                    <div className="text-center">
                                        <p className="text-white/40 text-[10px] uppercase font-black">إجمالي المشتريات</p>
                                        <p className="text-xl font-black">{latestOrder?.total_price || 0} EGP</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white/40 text-[10px] uppercase font-black">العضوية</p>
                                        <p className="text-xl font-black text-[#D4C3B3]">Classic</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                        </section>
                    </div>

                </div>
            </div>
        </main>
    );
}