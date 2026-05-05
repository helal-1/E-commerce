"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Package,
    Clock,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Search,
    Filter,
    MoreVertical
} from 'lucide-react';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // جلب الطلبات من سوبابيس
    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) setOrders(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // تحديث حالة الطلب
    // تحديث حالة الطلب
    const updateStatus = async (orderId: string, newStatus: string) => {
        // 1. التحديث في سوبابيس فعلياً
        const { data, error } = await supabase
            .from('orders')
            .update({ status: newStatus }) // هنا بنغير الحالة لـ completed أو cancelled
            .eq('id', orderId)
            .select(); // نطلب منه يرجع الداتا اللي اتعدلت للتأكيد

        if (error) {
            console.error("خطأ في تحديث الداتابيز:", error.message);
            alert("الداتا مسمعتش في السيرفر: " + error.message);
            return;
        }

        if (data) {
            console.log("تم التحديث بنجاح في الداتابيز:", data);

            // 2. تحديث الواجهة عشان الطلب يختفي فوراً
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
        }
    };

    // تعديل الفلتر عشان يعرض فقط الطلبات "قيد الانتظار" 
    // ويخفي الطلبات اللي تم اعتمادها أو إلغاؤها
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_phone.includes(searchTerm);

        const isPending = order.status === 'pending'; // 👈 الشرط ده اللي هيخفي الطلب بعد الضغط

        return matchesSearch && isPending;
    });

    return (
        <div className="p-8 bg-[#FAFAFA] min-h-screen" dir="rtl">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">إدارة الطلبات</h1>
                        <p className="text-gray-500 mt-1 font-medium">تابع طلبات العملاء وحالات الشحن من هنا.</p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="بحث باسم العميل أو الرقم..."
                                className="w-full pr-10 pl-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-6 text-sm font-black text-gray-400 uppercase tracking-widest">الطلب</th>
                                    <th className="p-6 text-sm font-black text-gray-400 uppercase tracking-widest">العميل</th>
                                    <th className="p-6 text-sm font-black text-gray-400 uppercase tracking-widest">التفاصيل</th>
                                    <th className="p-6 text-sm font-black text-gray-400 uppercase tracking-widest">الإجمالي</th>
                                    <th className="p-6 text-sm font-black text-gray-400 uppercase tracking-widest">الحالة</th>
                                    <th className="p-6 text-sm font-black text-gray-400 uppercase tracking-widest">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan={6} className="p-10 text-center text-gray-400 font-bold">جاري تحميل الطلبات...</td></tr>
                                ) : filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center text-black">
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">#{order.id.slice(0, 8)}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">
                                                        {new Date(order.created_at).toLocaleDateString('ar-EG')}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <p className="font-bold text-sm">{order.customer_name}</p>
                                            <p className="text-xs text-gray-500">{order.customer_phone}</p>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-xs space-y-1">
                                                <p className="text-gray-600 truncate max-w-[150px] font-medium">{order.city} - {order.address}</p>
                                                <p className="text-black font-black">{order.items?.length || 0} منتجات</p>
                                            </div>
                                        </td>
                                        <td className="p-6 font-black text-sm text-gray-900">
                                            {order.total_price} ر.س
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'completed' ? 'bg-green-50 text-green-600' :
                                                    order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                                        'bg-orange-50 text-orange-600'
                                                }`}>
                                                {order.status === 'completed' ? 'مكتمل' :
                                                    order.status === 'cancelled' ? 'ملغي' : 'قيد الانتظار'}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateStatus(order.id, 'completed')}
                                                    className="p-2 hover:bg-green-50 text-gray-400 hover:text-green-600 rounded-lg transition-colors"
                                                    title="اعتماد الطلب"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(order.id, 'cancelled')}
                                                    className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                                                    title="إلغاء الطلب"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}