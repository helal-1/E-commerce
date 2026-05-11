"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Users,
    Search,
    Mail,
    ShieldCheck,
    User,
    Trash2,
    UserCircle,
    Loader2
} from 'lucide-react';

// تعريف نوع البيانات للبروفايل
interface Profile {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at?: string;
}

export default function UsersPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchProfiles = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*');

            if (error) throw error;
            setProfiles(data || []);
        } catch (err: any) {
            console.error("خطأ:", err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfiles();

        // تفعيل التحديث اللحظي للمستخدمين
        const profilesChannel = supabase
            .channel('realtime-profiles-admin')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'profiles' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setProfiles((prev) => [payload.new as Profile, ...prev]);
                    }
                    else if (payload.eventType === 'UPDATE') {
                        setProfiles((prev) =>
                            prev.map((p) => p.id === payload.new.id ? (payload.new as Profile) : p)
                        );
                    }
                    else if (payload.eventType === 'DELETE') {
                        setProfiles((prev) => prev.filter((p) => p.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(profilesChannel);
        };
    }, [fetchProfiles]);

    const filteredUsers = profiles.filter(profile =>
        profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 bg-[#FCFBF9] min-h-screen" dir="rtl">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8 text-right">
                    <h1 className="text-2xl md:text-3xl font-serif text-[#4A3E31] tracking-tight">إدارة المجتمع</h1>
                    <p className="text-[#8B735B] mt-1 text-sm font-medium italic">متابعة حسابات عشاق ZELDA LINE لحظياً.</p>
                </div>

                {/* Search & Stats Card */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B735B]" size={18} />
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو البريد..."
                            className="w-full pr-12 pl-4 py-4 bg-white border border-[#EDEAE5] rounded-3xl outline-none focus:ring-2 focus:ring-[#8B735B]/20 transition-all shadow-sm font-medium text-sm text-[#4A3E31]"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="bg-white border border-[#EDEAE5] p-4 px-8 rounded-3xl flex items-center justify-between lg:justify-start gap-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#F7F3F0] rounded-full flex items-center justify-center text-[#8B735B] shrink-0 border border-[#EDEAE5]">
                                <Users size={22} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-[#A6998A] uppercase tracking-widest">إجمالي الأعضاء</p>
                                <p className="text-2xl font-serif text-[#4A3E31] leading-none">{profiles.length}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full animate-pulse">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-[10px] font-bold text-green-700">اتصال مباشر</span>
                        </div>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block bg-white rounded-4xl border border-[#EDEAE5] shadow-sm overflow-hidden">
                    <table className="w-full text-right">
                        <thead className="bg-[#FCFBF9] border-b border-[#EDEAE5]">
                            <tr>
                                <th className="p-6 text-xs font-black text-[#A6998A] uppercase tracking-wider">المستخدم</th>
                                <th className="p-6 text-xs font-black text-[#A6998A] uppercase tracking-wider">البريد الإلكتروني</th>
                                <th className="p-6 text-xs font-black text-[#A6998A] uppercase tracking-wider">الصلاحية</th>
                                <th className="p-6 text-xs font-black text-[#A6998A] uppercase tracking-wider text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F7F3F0]">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="animate-spin text-[#8B735B]" size={30} />
                                            <span className="text-[#8B735B] font-serif italic">جاري تحميل البيانات...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.map((profile) => (
                                <tr key={profile.id} className="hover:bg-[#FCFBF9]/50 transition-colors group animate-in fade-in duration-500">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#F7F3F0] rounded-full flex items-center justify-center text-[#8B735B] font-black text-sm border border-[#EDEAE5] shadow-sm shrink-0">
                                                {profile.full_name ? profile.full_name[0].toUpperCase() : <UserCircle size={20} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-serif text-[#4A3E31] text-base">{profile.full_name || "بدون اسم"}</span>
                                                <code className="text-[9px] text-[#A6998A] font-mono mt-0.5">ID: {profile.id.slice(0, 8)}</code>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 font-medium text-[#8B735B] text-sm italic">
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="opacity-40" />
                                            {profile.email}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 w-fit ${profile.role === 'admin' ? 'bg-[#4A3E31] text-white' : 'bg-[#F7F3F0] text-[#8B735B]'}`}>
                                            {profile.role === 'admin' ? <ShieldCheck size={12} /> : <User size={12} />}
                                            {profile.role === 'admin' ? 'مدير النظام' : 'عميل'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-center">
                                        <button className="p-3 text-[#A6998A] hover:text-[#A66C6C] hover:bg-red-50 rounded-2xl transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#8B735B]" /></div>
                    ) : filteredUsers.map((profile) => (
                        <div key={profile.id} className="bg-white p-5 rounded-3xl border border-[#EDEAE5] shadow-sm space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-[#F7F3F0] rounded-full flex items-center justify-center text-[#8B735B] font-black text-lg border border-[#EDEAE5] shadow-sm">
                                        {profile.full_name ? profile.full_name[0].toUpperCase() : <UserCircle size={24} />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-serif text-[#4A3E31] text-lg">{profile.full_name || "بدون اسم"}</span>
                                        <span className={`px-2 py-0.5 mt-1 rounded-md text-[9px] font-black w-fit ${profile.role === 'admin' ? 'bg-[#4A3E31] text-white' : 'bg-[#F7F3F0] text-[#8B735B]'}`}>
                                            {profile.role === 'admin' ? 'مدير' : 'عميل'}
                                        </span>
                                    </div>
                                </div>
                                <button className="p-3 text-[#A66C6C] bg-red-50/50 rounded-2xl">
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="pt-4 border-t border-[#F7F3F0] space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[#A6998A] font-bold uppercase tracking-widest text-[9px]">البريد الإلكتروني</span>
                                    <span className="text-[#4A3E31] font-medium italic">{profile.email}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[#A6998A] font-bold uppercase tracking-widest text-[9px]">رقم المعرف</span>
                                    <code className="text-[#A6998A] font-mono text-[10px] bg-[#FCFBF9] px-2 py-0.5 rounded border border-[#EDEAE5]">#{profile.id.slice(0, 8)}</code>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredUsers.length === 0 && !loading && (
                    <div className="text-center py-24 bg-white rounded-4xl mt-6 border border-dashed border-[#EDEAE5]">
                        <p className="text-[#8B735B] font-serif italic">لا توجد مقتنيات بشرية مطابقة لبحثك.</p>
                    </div>
                )}
            </div>
        </div>
    );
}