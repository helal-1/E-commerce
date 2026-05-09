"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Users,
    Search,
    Mail,
    ShieldCheck,
    User,
    Trash2,
    UserCircle,
} from 'lucide-react';

export default function UsersPage() {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                // .order('created_at', { ascending: false });

            if (error) throw error;
            setProfiles(data || []);
        } catch (err: any) {
            console.error("خطأ:", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfiles(); }, []);

    const filteredUsers = profiles.filter(profile =>
        profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 bg-[#FAFAFA] min-h-screen" dir="rtl">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8 text-right">
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900">إدارة المستخدمين</h1>
                    <p className="text-gray-500 mt-1 text-sm font-medium">التحكم في صلاحيات وبيانات الحسابات المسجلة.</p>
                </div>

                {/* Search & Stats Card */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو البريد..."
                            className="w-full pr-12 pl-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all shadow-sm font-medium text-sm"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="bg-white border border-gray-100 p-4 px-6 rounded-2xl flex items-center justify-between lg:justify-start gap-4 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white shrink-0">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase">إجمالي الأعضاء</p>
                                <p className="text-xl font-black">{profiles.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Table - Hidden on Mobile */}
                <div className="hidden md:block bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-wider">المستخدم</th>
                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-wider">البريد الإلكتروني</th>
                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-wider">الصلاحية</th>
                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-wider text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={4} className="p-10 text-center text-gray-400 font-bold italic">جاري التحميل...</td></tr>
                            ) : filteredUsers.map((profile) => (
                                <tr key={profile.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600 font-black text-sm border border-zinc-200 shadow-sm shrink-0">
                                                {profile.full_name ? profile.full_name[0].toUpperCase() : <UserCircle size={20} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-900 text-sm">{profile.full_name || "بدون اسم"}</span>
                                                <code className="text-[9px] text-gray-400 font-mono mt-0.5">ID: {profile.id.slice(0, 8)}</code>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 font-bold text-gray-500 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="text-gray-300" />
                                            {profile.email}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 w-fit ${profile.role === 'admin' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                                            {profile.role === 'admin' ? <ShieldCheck size={12} /> : <User size={12} />}
                                            {profile.role === 'admin' ? 'مدير النظام' : 'عميل'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-center">
                                        <button className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards View - Hidden on Desktop */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <p className="text-center p-10 text-gray-400 font-bold italic">جاري التحميل...</p>
                    ) : filteredUsers.map((profile) => (
                        <div key={profile.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600 font-black text-lg border border-zinc-200 shadow-sm">
                                        {profile.full_name ? profile.full_name[0].toUpperCase() : <UserCircle size={24} />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-gray-900 text-base">{profile.full_name || "بدون اسم"}</span>
                                        <span className={`px-2 py-0.5 mt-1 rounded-md text-[9px] font-black w-fit ${profile.role === 'admin' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                                            {profile.role === 'admin' ? 'مدير' : 'عميل'}
                                        </span>
                                    </div>
                                </div>
                                <button className="p-2.5 text-red-100 bg-red-50/50 text-red-600 rounded-xl">
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="pt-4 border-t border-gray-50 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-400 font-bold uppercase tracking-tighter">البريد الإلكتروني</span>
                                    <span className="text-gray-900 font-medium">{profile.email}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-400 font-bold uppercase tracking-tighter">المعرف</span>
                                    <code className="text-gray-400 font-mono text-[10px] bg-gray-50 px-2 py-0.5 rounded">#{profile.id.slice(0, 8)}</code>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredUsers.length === 0 && !loading && (
                    <div className="text-center py-16 bg-white rounded-[2rem] mt-6 border border-dashed border-gray-200">
                        <p className="text-gray-400 font-bold">لا توجد نتائج مطابقة لبحثك</p>
                    </div>
                )}
            </div>
        </div>
    );
}