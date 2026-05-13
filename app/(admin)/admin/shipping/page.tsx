"use client";
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import {
    Truck,
    MessageCircle,
    Trash2,
    MapPin,
    User,
    Package,
    Loader2,
    Printer
} from 'lucide-react';

interface OrderItem {
    name: string;
    image?: string;
    images?: string[];
    size: string;
    color: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    customer_name: string;
    customer_phone: string;
    city: string;
    address: string;
    total_price: number;
    items: OrderItem[];
    created_at?: string;
}

export default function ShippingPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [showConfirm, setShowConfirm] = useState<{ show: boolean, id: string | null }>({ show: false, id: null });

    const fetchShippingOrders = useCallback(async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('status', 'completed')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching orders:", error.message);
            return [];
        }
        return (data as Order[]) || [];
    }, []);

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            setLoading(true);
            const data = await fetchShippingOrders();
            if (isMounted) {
                setOrders(data);
                setLoading(false);
            }
        };
        loadData();
        return () => { isMounted = false; };
    }, [fetchShippingOrders]);

    const removeOrder = async () => {
        if (!showConfirm.id) return;
        const orderId = showConfirm.id;
        const { error: deleteError } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (!deleteError) {
            setOrders(prev => prev.filter(o => o.id !== orderId));
            setShowConfirm({ show: false, id: null });
        } else {
            alert("حدث خطأ أثناء الحذف: " + deleteError.message);
        }
    };

    // دالة الطباعة الاحترافية باستخدام Iframe لتجنب أخطاء React Hooks Immutability
    const handlePrint = (orderId: string) => {
        const printContent = document.getElementById(`print-invoice-${orderId}`);
        if (!printContent) return;

        // إنشاء iframe مخفي للطباعة
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document || iframe.contentDocument;
        if (!doc) return;

        // إضافة المحتوى للـ iframe مع الستاييل
        const htmlContent = `
            <html dir="rtl">
                <head>
                    <title>Zelda Line Invoice</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        .p-10 { padding: 2.5rem; }
                        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; font-weight: 900; }
                        .font-black { font-weight: 900; }
                        .border-b-4 { border-bottom-width: 4px; }
                        .border-black { border-color: black; }
                        .flex { display: flex; }
                        .justify-between { justify-content: space-between; }
                        .items-center { align-items: center; }
                        .mb-8 { margin-bottom: 2rem; }
                        .bg-gray-50 { background-color: #f9fafb; }
                        .p-6 { padding: 1.5rem; }
                        .rounded-3xl { border-radius: 1.5rem; }
                        .grid { display: grid; }
                        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                        .gap-12 { gap: 3rem; }
                        .w-full { width: 100%; }
                        .bg-black { background-color: black; }
                        .text-white { color: white; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { text-align: right; padding: 12px; border-bottom: 1px solid #f3f4f6; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `;

        const iframeWindow = iframe.contentWindow;
        if (iframeWindow) {
            iframeWindow.document.open();
            iframeWindow.document.write(htmlContent);
            iframeWindow.document.close();

            // الانتظار قليلاً للتأكد من تحميل المحتوى ثم الطباعة
            setTimeout(() => {
                iframeWindow.focus();
                iframeWindow.print();
                document.body.removeChild(iframe);
            }, 500);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-[#FAFAFA] min-h-screen text-right font-sans" dir="rtl">

            <div className="max-w-6xl mx-auto">
                <header className="flex items-center gap-4 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="w-14 h-14 bg-black text-white rounded-3xl flex items-center justify-center shadow-2xl">
                        <Truck size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">قائمة الشحن</h1>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Shipping Management</p>
                    </div>
                </header>

                <main className="grid gap-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 text-gray-300">
                            <Loader2 className="animate-spin mb-4" size={40} />
                            <p className="font-bold">جاري تحميل الشحنات...</p>
                        </div>
                    ) : orders.map((order, index) => (
                        <div key={order.id}
                            style={{ animationDelay: `${index * 100}ms` }}
                            className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">

                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <User size={14} />
                                        <span className="text-[10px] font-black uppercase">Recipient</span>
                                    </div>
                                    <div>
                                        <p className="font-black text-lg text-gray-900 mb-2">{order.customer_name}</p>
                                        <p className="text-sm font-bold text-gray-400">{order.customer_phone}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <MapPin size={14} />
                                        <span className="text-[10px] font-black uppercase">Destination</span>
                                    </div>
                                    <div>
                                        <p className="font-black text-sm text-gray-900 mb-1">{order.city}</p>
                                        <p className="text-xs text-gray-400 font-medium leading-relaxed">{order.address}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 lg:col-span-1">
                                    <div className="flex items-center gap-2 text-gray-300 mb-2">
                                        <Package size={14} />
                                        <span className="text-[10px] font-black uppercase">Items</span>
                                    </div>
                                    <div className="space-y-3">
                                        {order.items?.map((item, i) => (
                                            <div key={`${order.id}-${i}`} className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-50 group hover:bg-white transition-all">
                                                <div className="w-12 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm relative">
                                                    <Image
                                                        src={(item.image || item.images?.[0]) || '/placeholder.png'}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-gray-800 line-clamp-1">{item.name}</span>
                                                    <div className="flex gap-2 mt-1.5">
                                                        <span className="text-[9px] font-black px-2 py-0.5 bg-white rounded-md border border-gray-100 text-gray-400 italic">M: {item.size}</span>
                                                        <span className="text-[9px] font-black px-2 py-0.5 bg-white rounded-md border border-gray-100 text-amber-900/40 uppercase">C: {item.color}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-300 uppercase">Total</span>
                                        <p className="font-black text-sm text-black">{order.total_price} EGP</p>
                                    </div>
                                </div>

                                <div className="flex lg:flex-col justify-center gap-4">
                                    <button
                                        onClick={() => handlePrint(order.id)}
                                        className="flex-1 flex items-center justify-center gap-3 bg-black text-white py-5 rounded-3xl font-black text-xs hover:bg-gray-800 transition-all shadow-xl active:scale-95"
                                    >
                                        <Printer size={20} /> طباعة البوليصة
                                    </button>

                                    <a
                                        href={`https://wa.me/${order.customer_phone.replace(/\D/g, '').replace(/^00/, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-3 bg-green-500 text-white py-5 rounded-3xl font-black text-xs hover:bg-green-600 transition-all shadow-xl shadow-green-500/20 active:scale-95"
                                    >
                                        <MessageCircle size={20} /> تواصل واتساب
                                    </a>

                                    <button
                                        onClick={() => setShowConfirm({ show: true, id: order.id })}
                                        className="flex-1 flex items-center justify-center gap-3 bg-white text-red-500 border-2 border-red-50 py-5 rounded-3xl font-black text-xs hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                    >
                                        <Trash2 size={20} /> إزالة الشحنة
                                    </button>
                                </div>
                            </div>

                            {/* مكون بوليصة الشحن (مخفي برمجياً عن الصفحة) */}
                            <div style={{ display: 'none' }}>
                                <div id={`print-invoice-${order.id}`} className="p-10 font-sans" dir="rtl">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid black', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                                        <div>
                                            <h1 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.05em' }}>ZELDA LINE</h1>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280', marginTop: '0.25rem', textTransform: 'uppercase' }}>Premium Fashion Label</p>
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <h2 style={{ fontSize: '1.25rem', fontWeight: 900 }}>بوليصة شحن</h2>
                                            <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#9ca3af' }}>Order ID: #{order.id.slice(0, 8)}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '2.5rem' }}>
                                        <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '1.5rem' }}>
                                            <h3 style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#9ca3af', marginBottom: '1rem' }}>بيانات المستلم</h3>
                                            <p style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.5rem' }}>{order.customer_name}</p>
                                            <p style={{ fontWeight: 'bold', color: '#4b5563' }}>{order.customer_phone}</p>
                                        </div>
                                        <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '1.5rem' }}>
                                            <h3 style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#9ca3af', marginBottom: '1rem' }}>عنوان التوصيل</h3>
                                            <p style={{ fontWeight: 900, marginBottom: '0.25rem' }}>{order.city}</p>
                                            <p style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.625 }}>{order.address}</p>
                                        </div>
                                    </div>

                                    <table style={{ width: '100%', marginBottom: '2.5rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid #f3f4f6', textAlign: 'right' }}>
                                                <th style={{ padding: '1rem 0', fontSize: '10px', fontWeight: 900, color: '#9ca3af' }}>المنتج</th>
                                                <th style={{ padding: '1rem 0', fontSize: '10px', fontWeight: 900, color: '#9ca3af', textAlign: 'center' }}>المقاس/اللون</th>
                                                <th style={{ padding: '1rem 0', fontSize: '10px', fontWeight: 900, color: '#9ca3af', textAlign: 'left' }}>الكمية</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items?.map((item, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                                                    <td style={{ padding: '1.25rem 0', fontWeight: 900, fontSize: '0.875rem' }}>{item.name}</td>
                                                    <td style={{ padding: '1.25rem 0', textAlign: 'center', fontSize: '0.75rem', fontWeight: 'bold', color: '#9ca3af' }}>{item.size} / {item.color}</td>
                                                    <td style={{ padding: '1.25rem 0', textAlign: 'left', fontWeight: 900 }}>{item.quantity || 1}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'black', color: 'white', padding: '2rem', borderRadius: '2rem' }}>
                                        <div>
                                            <p style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.5 }}>Total Amount</p>
                                            <p style={{ fontSize: '1.875rem', fontWeight: 900 }}>CASH ON DELIVERY</p>
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <p style={{ fontSize: '2.25rem', fontWeight: 900 }}>{order.total_price} EGP</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </main>
            </div>

            {/* Confirm Delete Modal */}
            {showConfirm.show && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowConfirm({ show: false, id: null })} />
                    <div className="relative bg-white w-full max-w-sm p-8 rounded-3xl shadow-2xl text-center animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900">حذف نهائي؟</h3>
                        <p className="text-gray-500 text-sm mt-2 mb-6">سيتم مسح البيانات تماماً من السجل.</p>
                        <div className="flex gap-3">
                            <button onClick={removeOrder} className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-black text-xs hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all">احذف</button>
                            <button onClick={() => setShowConfirm({ show: false, id: null })} className="flex-1 bg-gray-50 text-gray-400 py-4 rounded-2xl font-black text-xs">تراجع</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}