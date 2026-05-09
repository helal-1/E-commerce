"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Loader2, TrendingUp, Users, Package, ShoppingBag,
    ArrowUpRight, Calendar, Heart
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<any[]>([]);
    const [statusData, setStatusData] = useState<any[]>([]);
    const [statsData, setStatsData] = useState({ sales: 0, orders: 0, users: 0, products: 0 });

    // الألوان الجديدة (ألوان خيوط وأقمشة فاخرة)
    const COLORS = {
        primary: "#8B735B", // ذهبي مطفي / برونزي
        secondary: "#D4C3B3", // بيج فاتح
        accent: "#4A5D4E", // زيتي هادئ (يدل على الفخامة)
        danger: "#A66C6C", // وردي غامق للملغي
    };

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const { count: uCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
                const { count: pCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
                const { data: oData } = await supabase.from('orders').select('total_price, created_at, status');

                const totalSales = oData?.reduce((acc, o) => acc + (o.total_price || 0), 0) || 0;

                const timeline = oData?.reduce((acc: any, o: any) => {
                    const day = new Date(o.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
                    acc[day] = (acc[day] || 0) + o.total_price;
                    return acc;
                }, {});
                setChartData(Object.keys(timeline).map(date => ({ date, amount: timeline[date] })));

                const statuses = oData?.reduce((acc: any, o: any) => {
                    acc[o.status] = (acc[o.status] || 0) + 1;
                    return acc;
                }, {});
                setStatusData([
                    { name: 'مكتمل', value: statuses['completed'] || 0, color: COLORS.accent },
                    { name: 'قيد الانتظار', value: statuses['pending'] || 0, color: COLORS.primary },
                    { name: 'ملغي', value: statuses['cancelled'] || 0, color: COLORS.danger },
                ]);

                setStatsData({ sales: totalSales, orders: oData?.length || 0, users: uCount || 0, products: pCount || 0 });
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen gap-4 bg-[#FCFBF9]">
            <Loader2 className="animate-spin text-[#8B735B]" size={40} />
            <p className="text-sm font-serif italic text-[#8B735B]">يتم تحضير لوحة الإبداع...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-10 bg-[#FCFBF9]" dir="rtl">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-serif text-[#4A3E31] tracking-tight">موجز الإبداع</h1>
                    <p className="text-[#8B735B] font-medium italic">إحصائيات تليق بفن التطريز اليدوي.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#EDEAE5] shadow-sm">
                    <Calendar size={16} className="text-[#8B735B]" />
                    <span className="text-xs font-bold text-[#4A3E31]">تقرير الشهر الحالي</span>
                </div>
            </header>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "إجمالي المبيعات", val: statsData.sales, icon: <ShoppingBag />, bg: "bg-[#F7F3F0]", text: "text-[#8B735B]" },
                    { label: "طلبات الحب", val: statsData.orders, icon: <Heart />, bg: "bg-[#F0F4F1]", text: "text-[#4A5D4E]" },
                    { label: "عشاق البراند", val: statsData.users, icon: <Users />, bg: "bg-[#F9F5F6]", text: "text-[#A66C6C]" },
                    { label: "قطع فنية", val: statsData.products, icon: <Package />, bg: "bg-[#F2F2F2]", text: "text-[#555555]" }
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-[#EDEAE5] shadow-sm relative overflow-hidden group hover:border-[#8B735B] transition-all">
                        <div className="flex justify-between items-start">
                            <div className={`p-3 ${s.bg} ${s.text} rounded-2xl transition-all group-hover:scale-110`}>
                                {s.icon}
                            </div>
                            <span className="text-[10px] font-bold text-[#8B735B] bg-[#F7F3F0] px-2 py-1 rounded-full flex items-center">
                                نمو <ArrowUpRight size={10} className="mr-1" />
                            </span>
                        </div>
                        <div className="mt-6">
                            <p className="text-[#A6998A] text-[10px] font-black uppercase tracking-widest">{s.label}</p>
                            <h3 className="text-2xl font-serif text-[#4A3E31] mt-1">{s.val.toLocaleString()}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Curve */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-[#EDEAE5] shadow-sm">
                    <h3 className="text-xl font-serif text-[#4A3E31] mb-10">منحنى المبيعات اليدوية</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="silkGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B735B" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#8B735B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" hide />
                                <Tooltip
                                    content={({ active, payload }) => (
                                        active && payload && (
                                            <div className="bg-[#4A3E31] text-[#F7F3F0] p-4 rounded-2xl shadow-xl">
                                                <p className="text-[10px] opacity-70 mb-1">{payload[0].payload.date}</p>
                                                <p className="text-sm font-bold">{payload[0].value?.toLocaleString()} ج.م</p>
                                            </div>
                                        )
                                    )}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#8B735B"
                                    strokeWidth={4}
                                    fill="url(#silkGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribution Chart */}
                <div className="bg-white p-8 rounded-[3rem] border border-[#EDEAE5] shadow-sm">
                    <h3 className="text-xl font-serif text-[#4A3E31] mb-6">حالات الطلبات</h3>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={10} dataKey="value">
                                    {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 mt-6">
                        {statusData.map((s, i) => (
                            <div key={i} className="flex justify-between items-center bg-[#FCFBF9] p-3 rounded-2xl border border-[#F7F3F0]">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }}></div>
                                    <span className="text-xs font-bold text-[#8B735B]">{s.name}</span>
                                </div>
                                <span className="text-xs font-black text-[#4A3E31]">{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}