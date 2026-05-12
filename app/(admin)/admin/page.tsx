"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Loader2, Users, Package, ShoppingBag,
 Heart
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

interface OrderRow {
    total_price: number;
    created_at: string;
    status: string;
}

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<{ date: string; amount: number }[]>([]);
    const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([]);
    const [statsData, setStatsData] = useState({ sales: 0, orders: 0, users: 0, products: 0 });

    const COLORS = useMemo(() => ({
        primary: "#8B735B",
        accent: "#4A5D4E",
        danger: "#A66C6C",
    }), []);

    // 1. الدالة لجلب البيانات (بدون setLoading بداخلها لتجنب الخطأ)
    const fetchStats = useCallback(async () => {
        try {
            const { count: uCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: pCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
            const { data: oData } = await supabase.from('orders').select('total_price, created_at, status');

            const orders = (oData as OrderRow[]) || [];
            const totalSales = orders.reduce((acc, o) => acc + (Number(o.total_price) || 0), 0);

            const dailyData: Record<string, number> = {};
            const sortedOrders = [...orders].sort((a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );

            sortedOrders.forEach(order => {
                const date = new Date(order.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });
                dailyData[date] = (dailyData[date] || 0) + (Number(order.total_price) || 0);
            });

            const formattedChart = Object.keys(dailyData).map(key => ({
                date: key,
                amount: dailyData[key]
            }));

            const statuses = orders.reduce((acc: Record<string, number>, o) => {
                acc[o.status] = (acc[o.status] || 0) + 1;
                return acc;
            }, {});

            return {
                chart: formattedChart,
                status: [
                    { name: 'مكتمل', value: statuses['completed'] || 0, color: COLORS.accent },
                    { name: 'قيد الانتظار', value: statuses['pending'] || 0, color: COLORS.primary },
                    { name: 'ملغي', value: statuses['cancelled'] || 0, color: COLORS.danger },
                ],
                stats: { sales: totalSales, orders: orders.length, users: uCount || 0, products: pCount || 0 }
            };

        } catch (e) {
            console.error("Dashboard Error:", e);
            return null;
        }
    }, [COLORS]);

    // 2. الـ useEffect المصلح تماماً
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            // بدأ التحميل هنا (Async)
            const result = await fetchStats();
            if (isMounted && result) {
                setChartData(result.chart);
                setStatusData(result.status);
                setStatsData(result.stats);
                setLoading(false); // انتهاء التحميل
            }
        };

        loadData();

        const channel = supabase.channel('dashboard-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, loadData)
            .subscribe();

        return () => {
            isMounted = false;
            supabase.removeChannel(channel);
        };
    }, [fetchStats]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#FCFBF9]">
            <Loader2 className="animate-spin text-[#8B735B]" size={35} />
            <p className="text-xs font-bold text-[#8B735B] mt-4">جاري تحضير الإحصائيات...</p>
        </div>
    );

    return (
        <div className="space-y-8 bg-[#FCFBF9] min-h-screen p-4 text-right font-sans" dir="rtl">
            <header className="flex flex-col md:flex-row justify-between gap-4">
                <h1 className="text-3xl font-black text-[#4A3E31] font-serif uppercase tracking-tighter">موجز الإبداع</h1>
                <div className="bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm flex items-center gap-2 w-fit">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-gray-400">DATA SYNC ACTIVE</span>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "إجمالي المبيعات", val: statsData.sales, icon: <ShoppingBag size={20} />, color: "text-[#8B735B]", bg: "bg-amber-50", suffix: "ج.م" },
                    { label: "طلبات الحب", val: statsData.orders, icon: <Heart size={20} />, color: "text-red-700", bg: "bg-red-50", suffix: "" },
                    { label: "عشاق البراند", val: statsData.users, icon: <Users size={20} />, color: "text-blue-700", bg: "bg-blue-50", suffix: "" },
                    { label: "قطع فنية", val: statsData.products, icon: <Package size={20} />, color: "text-zinc-700", bg: "bg-zinc-100", suffix: "" },
                ].map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm group hover:border-[#8B735B] transition-all">
                        <div className={`${item.bg} ${item.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                            {item.icon}
                        </div>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{item.label}</p>
                        <h3 className="text-2xl font-black text-[#4A3E31] mt-1">{item.val.toLocaleString()} <span className="text-xs font-bold">{item.suffix}</span></h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* منحنى المبيعات */}
                <div className="lg:col-span-2 bg-white p-8 rounded-4xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-black text-[#4A3E31] mb-8 font-serif">تحليل المبيعات الفني</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {chartData.length > 0 ? (
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8B735B" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8B735B" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A6998A', fontWeight: 'bold' }} />
                                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', textAlign: 'right' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#8B735B"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorAmt)"
                                        animationDuration={1500}
                                        dot={{ r: 4, fill: '#8B735B', strokeWidth: 2, stroke: '#fff' }}
                                    />
                                </AreaChart>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-200 italic text-sm">بانتظار مبيعات جديدة...</div>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* الرسم الدائري */}
                <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-black text-[#4A3E31] mb-8 font-serif">حالات المقتنيات</h3>
                    <div className="h-[250px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-black text-gray-300">TOTAL</span>
                            <span className="text-2xl font-black text-[#4A3E31]">{statsData.orders}</span>
                        </div>
                    </div>
                    <div className="mt-8 space-y-3">
                        {statusData.map((s, i) => (
                            <div key={i} className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                                    <span className="text-xs font-bold text-gray-500">{s.name}</span>
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