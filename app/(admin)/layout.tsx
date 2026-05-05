"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    LayoutDashboard,
    ShoppingBag,
    PlusCircle,
    Users,
    ClipboardList,
    LogOut,
    Menu,
    X
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // حالة القائمة للموبايل

    const menuItems = [
        { name: "الإحصائيات", icon: <LayoutDashboard size={20} />, href: "/admin" },
        { name: "الطلبات", icon: <ClipboardList size={20} />, href: "/admin/orders" },
        { name: "المنتجات", icon: <ShoppingBag size={20} />, href: "/admin/products" },
        { name: "إضافة منتج", icon: <PlusCircle size={20} />, href: "/admin/add-product" },
        { name: "المستخدمين", icon: <Users size={20} />, href: "/admin/users" },
    ];

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            router.push("/");
            router.refresh();
        } else {
            alert("حدث خطأ أثناء تسجيل الخروج");
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50" dir="rtl">

            {/* زر القائمة للموبايل - يظهر فقط في الشاشات الصغيرة */}
            <div className="md:hidden fixed top-4 right-4 z-[60]">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 bg-black text-white rounded-lg shadow-xl"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar - القائمة الجانبية (تدعم الموبايل والديسك توب) */}
            <aside className={`
                fixed inset-y-0 right-0 z-50 w-64 bg-black text-white p-6 transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} 
                md:translate-x-0 md:sticky md:top-0 md:h-screen
            `}>
                <div className="mb-10 text-2xl font-serif tracking-widest text-center border-b border-zinc-800 pb-6">
                    ZELDA<span className="text-amber-600">ADMIN</span>
                </div>

                <nav className="space-y-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)} // إغلاق القائمة عند الضغط في الموبايل
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-800 transition-all text-sm font-medium text-gray-300 hover:text-white"
                        >
                            {item.icon}
                            {item.name}
                        </Link>
                    ))}

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 p-3 w-full rounded-xl hover:bg-red-900/20 text-red-400 transition-all text-sm font-medium mt-10 group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>خروج من الإدارة</span>
                    </button>
                </nav>
            </aside>

            {/* الخلفية المعتمة عند فتح المنيو في الموبايل */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content - المحتوى المتغير */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
                {/* مساحة فارغة في الأعلى للموبايل فقط لتعويض مكان زر المنيو */}
                <div className="h-12 md:hidden" />
                {children}
            </main>
        </div>
    );
}