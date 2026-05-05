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
    UserCircle
} from 'lucide-react';

export default function UsersPage() {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchProfiles = async () => {
        setLoading(true);
        // جلب البيانات من جدول profiles
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) setProfiles(data);
        setLoading(false);
    };

    useEffect(() => { fetchProfiles(); }, []);

    // تصفية البحث ليشمل الاسم أو الإيميل
    const filteredUsers = profiles.filter(profile =>
        profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 bg-[#FAFAFA] min-h-screen" dir="rtl">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-gray-900">إدارة المستخدمين</h1>
                    <p className="text-gray-500 mt-1 font-medium">التحكم في صلاحيات وبيانات الحسابات المسجلة.</p>
                </div>

                {/* Search & Stats Card */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو البريد الإلكتروني..."
                            className="w-full pr-12 pl-4 py-4 bg-white border border-gray-100 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-black/5 transition-all shadow-sm font-medium"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="bg-white border border-gray-100 p-4 px-8 rounded-[1.5rem] flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase">إجمالي الأعضاء</p>
                            <p className="text-xl font-black">{profiles.length}</p>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
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
                                    <tr><td colSpan={4} className="p-10 text-center text-gray-400 font-bold italic">جاري تحميل المستخدمين...</td></tr>
                                ) : filteredUsers.map((profile) => (
                                    <tr key={profile.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600 font-black text-sm border-2 border-white shadow-sm overflow-hidden">
                                                    {/* إذا وجد اسم نعرض أول حرف، وإلا أيقونة مستخدم */}
                                                    {profile.full_name ? (
                                                        profile.full_name[0].toUpperCase()
                                                    ) : (
                                                        <UserCircle size={24} className="text-zinc-300" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-gray-900 text-sm">
                                                        {profile.full_name || "بدون اسم"}
                                                    </span>
                                                    <code className="text-[9px] text-gray-400 font-mono mt-0.5">
                                                        ID: {profile.id.slice(0, 8)}...
                                                    </code>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-6 font-bold text-gray-500 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} className="text-gray-300 group-hover:text-black transition-colors" />
                                                {profile.email}
                                            </div>
                                        </td>

                                        <td className="p-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 w-fit shadow-sm ${profile.role === 'admin'
                                                    ? 'bg-black text-white'
                                                    : 'bg-zinc-100 text-zinc-600'
                                                }`}>
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
                </div>

                {filteredUsers.length === 0 && !loading && (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] mt-6 border border-dashed border-gray-200">
                        <p className="text-gray-400 font-bold">لا يوجد مستخدمين بهذا الاسم أو الإيميل</p>
                    </div>
                )}
            </div>
        </div>
    );
}