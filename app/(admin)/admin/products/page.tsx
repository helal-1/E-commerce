"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Package,
    Image as ImageIcon,
    X
} from 'lucide-react';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // حالات الـ Edit Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) setProducts(data);
        setLoading(false);
    };

    useEffect(() => { fetchProducts(); }, []);

    // فتح نافذة التعديل
    const handleEditClick = (product: any) => {
        setEditingProduct({ ...product });
        setIsEditModalOpen(true);
    };

    // حفظ التعديلات في سوبابيس
    const handleUpdateProduct = async () => {
        const { error } = await supabase
            .from('products')
            .update({
                name: editingProduct.name,
                price: editingProduct.price,
                category: editingProduct.category
            })
            .eq('id', editingProduct.id);

        if (!error) {
            setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
            setIsEditModalOpen(false);
        } else {
            alert("حدث خطأ أثناء التحديث");
        }
    };

    const deleteProduct = async (id: string) => {
        if (window.confirm("حذف المنتج نهائياً؟")) {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (!error) setProducts(products.filter(p => p.id !== id));
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 bg-[#FAFAFA] min-h-screen relative" dir="rtl">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">المعرض</h1>
                        <p className="text-gray-500 mt-1 font-medium">تحكم في منتجات متجرك بكل سهولة.</p>
                    </div>
                    <button className="bg-black text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-lg active:scale-95">
                        <Plus size={20} /> إضافة منتج
                    </button>
                </div>

                {/* Search */}
                <div className="mb-8 relative max-w-md">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="ابحث عن منتج..."
                        className="w-full pr-12 pl-4 py-4 bg-white border border-gray-100 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-black/5 transition-all shadow-sm"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center py-20 text-gray-400 font-bold italic">جاري جلب البيانات...</div>
                    ) : filteredProducts.map((product) => (
                        <div key={product.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                            <div className="aspect-[4/5] bg-gray-50 relative overflow-hidden">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                    {product.category}
                                </div>
                            </div>

                            <div className="p-6 text-right">
                                <h3 className="font-black text-lg text-gray-900 mb-1 truncate">{product.name}</h3>
                                <p className="text-gray-400 text-sm font-black mb-4">{product.price} ر.س</p>

                                <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                                    <button onClick={() => handleEditClick(product)} className="flex-1 flex justify-center items-center gap-2 py-2 bg-gray-50 text-gray-600 hover:bg-black hover:text-white rounded-xl transition-all font-bold text-xs">
                                        <Edit size={14} /> تعديل
                                    </button>
                                    <button onClick={() => deleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Edit Modal --- */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative">
                        <button onClick={() => setIsEditModalOpen(false)} className="absolute top-6 left-6 text-gray-400 hover:text-black">
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-black mb-8 text-right">تعديل المنتج</h2>

                        <div className="space-y-6">
                            <div className="space-y-2 text-right">
                                <label className="text-xs font-black text-gray-400 mr-2">اسم المنتج</label>
                                <input
                                    type="text"
                                    value={editingProduct?.name}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                    className="w-full bg-gray-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 text-right font-bold"
                                />
                            </div>
                            <div className="space-y-2 text-right">
                                <label className="text-xs font-black text-gray-400 mr-2">السعر (ر.س)</label>
                                <input
                                    type="number"
                                    value={editingProduct?.price}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                    className="w-full bg-gray-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 text-right font-bold"
                                />
                            </div>

                            <button onClick={handleUpdateProduct} className="w-full bg-black text-white py-4 rounded-2xl font-black mt-4 hover:bg-zinc-800 transition-all">
                                حفظ التغييرات
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}