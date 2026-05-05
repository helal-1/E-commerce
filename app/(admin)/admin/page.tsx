"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [statsData, setStatsData] = useState({
        sales: 0,
        orders: 0,
        users: 0,
        products: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // 1. جلب عدد المستخدمين من جدول profiles
                const { count: usersCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true });

                // 2. جلب عدد المنتجات من جدول products
                const { count: productsCount } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true });

                // 3. جلب عدد الطلبات وإجمالي المبيعات (بافتراض وجود جدول باسم orders)
                // لو الجدول لسه مش موجود، القيم هتفضل 0 عشان الكود ميعملش Error
                const { data: ordersData } = await supabase
                    .from('orders')
                    .select('total_price');

                const totalSales = ordersData?.reduce((acc, order) => acc + (order.total_price || 0), 0) || 0;
                const totalOrders = ordersData?.length || 0;

                setStatsData({
                    sales: totalSales,
                    orders: totalOrders,
                    users: usersCount || 0,
                    products: productsCount || 0,
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const stats = [
        { title: "إجمالي المبيعات", value: `${statsData.sales.toLocaleString()} ر.س`, growth: "+12%", color: "text-green-600" },
        { title: "عدد الطلبات", value: statsData.orders.toString(), growth: "+5", color: "text-blue-600" },
        { title: "المستخدمين", value: statsData.users.toString(), growth: `+${statsData.users}`, color: "text-amber-600" },
        { title: "المنتجات", value: statsData.products.toString(), growth: "مستقر", color: "text-gray-600" },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin text-amber-700" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">لوحة التحكم</h1>
                    <p className="text-gray-500 text-sm">أهلاً بك يا محمد، إليك ملخص أداء المتجر اليوم من قاعدة البيانات.</p>
                </div>
            </header>

            {/* شبكة الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-2 hover:shadow-md transition-shadow">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{stat.title}</p>
                        <div className="flex justify-between items-end">
                            <span className="text-2xl font-black text-gray-900">{stat.value}</span>
                            <span className={`text-[10px] font-bold ${stat.color} bg-gray-50 px-2 py-1 rounded-lg`}>
                                {stat.growth}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* رسم بياني تخيلي أو جدول أحدث الطلبات */}
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm h-64 flex flex-col items-center justify-center text-gray-400 gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                    📈
                </div>
                <p className="text-sm font-medium">هنا سيتم ربط الرسم البياني للمبيعات لاحقاً</p>
            </div>
        </div>
    );
}