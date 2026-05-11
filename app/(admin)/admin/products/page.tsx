"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';

// تعريف نوع المنتج
interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    images: string[];
    created_at?: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // نظام التنبيهات المطور
    const [alert, setAlert] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
        show: false,
        msg: '',
        type: 'success'
    });

    // حالات الـ Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 4;

    // حالات الـ Edit Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // دالة إظهار التنبيه
    const showAlert = (msg: string, type: 'success' | 'error') => {
        setAlert({ show: true, msg, type });
        setTimeout(() => setAlert({ show: false, msg: '', type: 'success' }), 4000);
    };

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) setProducts(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProducts();

        const productsChannel = supabase
            .channel('realtime-products')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setProducts((prev) => [payload.new as Product, ...prev]);
                    }
                    else if (payload.eventType === 'UPDATE') {
                        setProducts((prev) =>
                            prev.map(p => p.id === payload.new.id ? (payload.new as Product) : p)
                        );
                    }
                    else if (payload.eventType === 'DELETE') {
                        setProducts((prev) => prev.filter(p => p.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(productsChannel);
        };
    }, [fetchProducts]);

    const handleEditClick = (product: Product) => {
        setEditingProduct({ ...product });
        setIsEditModalOpen(true);
    };

    const handleUpdateProduct = async () => {
        if (!editingProduct) return;

        const { error } = await supabase
            .from('products')
            .update({
                name: editingProduct.name,
                price: editingProduct.price,
                category: editingProduct.category
            })
            .eq('id', editingProduct.id);

        if (!error) {
            setIsEditModalOpen(false);
            showAlert("تم تحديث بيانات القطعة بنجاح", 'success');
        } else {
            showAlert("فشل التحديث: " + error.message, 'error');
        }
    };

    const deleteProduct = async (id: string) => {
        // بديل لـ confirm باستخدام التنبيه المخصص أو تأكيد بسيط
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
            showAlert("خطأ في الحذف: " + error.message, 'error');
        } else {
            showAlert("تم حذف المنتج نهائياً من المعرض", 'success');
        }
    };

    // فلترة المنتجات بناءً على البحث
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // حسابات الترقيم (Pagination Logic)
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="p-4 md:p-8 bg-[#FCFBF9] min-h-screen relative" dir="rtl">
            <div className="max-w-7xl mx-auto">

                {/* نظام التنبيهات المخصص (Custom Toast) */}
                {alert.show && (
                    <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] min-w-[320px] flex items-center gap-3 p-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top duration-300 ${alert.type === 'success' ? 'bg-white border-green-100 text-green-800' : 'bg-white border-red-100 text-red-800'
                        }`}>
                        {alert.type === 'success' ? <CheckCircle2 className="text-green-500" /> : <AlertCircle className="text-red-500" />}
                        <p className="text-sm font-bold flex-1">{alert.msg}</p>
                        <button onClick={() => setAlert({ ...alert, show: false })} className="opacity-50 hover:opacity-100 transition-opacity">
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-serif text-[#4A3E31] tracking-tight">المعرض المباشر</h1>
                        <p className="text-[#8B735B] mt-1 font-medium italic text-sm">إدارة مقتنيات زيلدا لاين وتحديثها لحظياً.</p>
                    </div>
                    <button className="w-full md:w-auto bg-[#4A3E31] text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95">
                        <Plus size={20} /> إضافة قطعة جديدة
                    </button>
                </div>

                {/* Search */}
                <div className="mb-10 relative max-w-md">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B735B]" size={18} />
                    <input
                        type="text"
                        placeholder="ابحث عن اسم القطعة..."
                        className="w-full pr-12 pl-4 py-4 bg-white border border-[#EDEAE5] rounded-3xl outline-none focus:ring-2 focus:ring-[#8B735B]/20 transition-all shadow-sm font-medium"
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // العودة للصفحة الأولى عند البحث
                        }}
                    />
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 min-h-[400px]">
                    {loading ? (
                        <div className="col-span-full flex flex-col items-center py-20 gap-4">
                            <Loader2 className="animate-spin text-[#8B735B]" size={30} />
                            <p className="text-[#8B735B] font-serif italic">جاري جلب المعرض...</p>
                        </div>
                    ) : currentProducts.map((product) => (
                        <div key={product.id} className="bg-white rounded-4xl border border-[#EDEAE5] shadow-sm overflow-hidden group hover:shadow-xl hover:border-[#8B735B]/30 transition-all duration-500 animate-in fade-in zoom-in-95">
                            <div className="aspect-[4/5] bg-[#F7F3F0] relative overflow-hidden">
                                <img
                                    src={product.images && product.images[0] ? product.images[0] : "/placeholder.png"}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-[#4A3E31] tracking-widest shadow-sm">
                                    {product.category}
                                </div>
                            </div>

                            <div className="p-6 text-right">
                                <h3 className="font-serif text-xl text-[#4A3E31] mb-1 truncate">{product.name}</h3>
                                <p className="text-[#8B735B] text-sm font-black mb-6">{product.price.toLocaleString()} ج.م</p>

                                <div className="flex items-center gap-2 pt-4 border-t border-[#F7F3F0]">
                                    <button
                                        onClick={() => handleEditClick(product)}
                                        className="flex-1 flex justify-center items-center gap-2 py-3 bg-[#FCFBF9] text-[#8B735B] hover:bg-[#8B735B] hover:text-white rounded-2xl transition-all font-bold text-xs border border-[#EDEAE5]"
                                    >
                                        <Edit size={14} /> تعديل
                                    </button>
                                    <button
                                        onClick={() => deleteProduct(product.id)}
                                        className="p-3 text-[#A66C6C] hover:bg-[#A66C6C] hover:text-white rounded-2xl transition-all border border-transparent hover:border-[#A66C6C]"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-16 pb-10">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => paginate(currentPage - 1)}
                            className="p-3 rounded-xl border border-[#EDEAE5] text-[#8B735B] disabled:opacity-20 hover:bg-[#4A3E31] hover:text-white transition-all shadow-sm"
                        >
                            <ChevronRight size={20} />
                        </button>

                        <div className="flex gap-2">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => paginate(i + 1)}
                                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1
                                            ? 'bg-[#4A3E31] text-white shadow-lg'
                                            : 'bg-white text-[#8B735B] border border-[#EDEAE5] hover:border-[#8B735B]'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => paginate(currentPage + 1)}
                            className="p-3 rounded-xl border border-[#EDEAE5] text-[#8B735B] disabled:opacity-20 hover:bg-[#4A3E31] hover:text-white transition-all shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    </div>
                )}

                {filteredProducts.length === 0 && !loading && (
                    <div className="text-center py-24 bg-white rounded-4xl border border-dashed border-[#EDEAE5]">
                        <p className="text-[#8B735B] font-serif italic">لا توجد قطع فنية تطابق هذا البحث.</p>
                    </div>
                )}
            </div>

            {/* --- Edit Modal --- */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-[#4A3E31]/40 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-4xl p-8 md:p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => setIsEditModalOpen(false)} className="absolute top-6 left-6 text-[#8B735B] hover:text-[#4A3E31] transition-colors">
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-serif text-[#4A3E31] mb-8 text-right">تعديل القطعة الفنية</h2>

                        <div className="space-y-6">
                            <div className="space-y-2 text-right">
                                <label className="text-xs font-black text-[#A6998A] mr-2">اسم المنتج</label>
                                <input
                                    type="text"
                                    value={editingProduct?.name || ''}
                                    onChange={(e) => editingProduct && setEditingProduct({ ...editingProduct, name: e.target.value })}
                                    className="w-full bg-[#FCFBF9] border border-[#EDEAE5] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#8B735B]/20 text-right font-bold text-[#4A3E31]"
                                />
                            </div>
                            <div className="space-y-2 text-right">
                                <label className="text-xs font-black text-[#A6998A] mr-2">السعر (ج.م)</label>
                                <input
                                    type="number"
                                    value={editingProduct?.price || 0}
                                    onChange={(e) => editingProduct && setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                                    className="w-full bg-[#FCFBF9] border border-[#EDEAE5] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#8B735B]/20 text-right font-bold text-[#4A3E31]"
                                />
                            </div>

                            <button onClick={handleUpdateProduct} className="w-full bg-[#4A3E31] text-white py-5 rounded-2xl font-bold mt-4 hover:bg-black transition-all shadow-lg shadow-[#4A3E31]/20">
                                حفظ التغييرات الفنية
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}