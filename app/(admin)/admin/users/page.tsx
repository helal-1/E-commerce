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
    Loader2,
    X,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

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

    // حالات مخصصة للتنبيهات والمودال
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState<{ show: boolean, id: string | null }>({ show: false, id: null });
    const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
        show: false,
        msg: '',
        type: 'success'
    });

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 4000);
    };

    const fetchProfiles = useCallback(async () => {
        try {
            const { data, error } = await supabase.from('profiles').select('*');
            if (error) throw error;
            return (data as Profile[]) || [];
        } catch (err: unknown) {
            console.error(err);
            return [];
        }
    }, []);

    const deleteUserProfile = async () => {
        const userId = showConfirmModal.id;
        if (!userId) return;

        setIsDeleting(userId);
        setShowConfirmModal({ show: false, id: null });

        try {
            const { error } = await supabase.from('profiles').delete().eq('id', userId);
            if (error) throw error;
            setProfiles(prev => prev.filter(p => p.id !== userId));
            showToast("تم إزالة العضو بنجاح من المجتمع", 'success');
        } catch (err: unknown) {
            showToast("فشل الإجراء: تأكد من صلاحيات قاعدة البيانات", 'error');
        } finally {
            setIsDeleting(null);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            setLoading(true);
            const data = await fetchProfiles();
            if (isMounted) {
                setProfiles(data);
                setLoading(false);
            }
        };
        loadData();

        const profilesChannel = supabase.channel('realtime-profiles-admin')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
                if (!isMounted) return;
                if (payload.eventType === 'INSERT') setProfiles((prev) => [payload.new as Profile, ...prev]);
                else if (payload.eventType === 'UPDATE') setProfiles((prev) => prev.map((p) => p.id === payload.new.id ? (payload.new as Profile) : p));
                else if (payload.eventType === 'DELETE') setProfiles((prev) => prev.filter((p) => p.id !== payload.old.id));
            }).subscribe();

        return () => { isMounted = false; supabase.removeChannel(profilesChannel); };
    }, [fetchProfiles]);

    const filteredUsers = profiles.filter(profile =>
        profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 bg-[#FCFBF9] min-h-screen text-right font-sans relative" dir="rtl">
            <div className="max-w-7xl mx-auto">

                {/* Custom Toast Notification */}
                {toast.show && (
                    <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] min-w-[320px] flex items-center gap-3 p-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top duration-300 ${toast.type === 'success' ? 'bg-white border-green-100 text-green-800' : 'bg-white border-red-100 text-red-800'}`}>
                        {toast.type === 'success' ? <CheckCircle2 className="text-green-500" /> : <AlertCircle className="text-red-500" />}
                        <p className="text-sm font-bold flex-1">{toast.msg}</p>
                        <button onClick={() => setToast({ ...toast, show: false })}><X size={18} /></button>
                    </div>
                )}

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-serif text-[#4A3E31] tracking-tight">إدارة المجتمع</h1>
                    <p className="text-[#8B735B] mt-1 text-sm font-medium italic">متابعة حسابات عشاق ZELDA LINE لحظياً.</p>
                </div>

                {/* Search & Stats */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8 font-bold">
                    <div className="relative flex-1">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B735B]" size={18} />
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو البريد..."
                            className="w-full pr-12 pl-4 py-4 bg-white border border-[#EDEAE5] rounded-3xl outline-none focus:ring-2 focus:ring-[#8B735B]/20 transition-all shadow-sm text-sm"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="bg-white border border-[#EDEAE5] p-4 px-8 rounded-3xl flex items-center gap-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#F7F3F0] rounded-full flex items-center justify-center text-[#8B735B] border border-[#EDEAE5] shadow-sm"><Users size={22} /></div>
                            <div>
                                <p className="text-[10px] font-black text-[#A6998A] uppercase tracking-widest leading-none mb-1">إجمالي الأعضاء</p>
                                <p className="text-2xl font-serif text-[#4A3E31] leading-none">{profiles.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block bg-white rounded-4xl border border-[#EDEAE5] shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-[#FCFBF9] border-b border-[#EDEAE5]">
                            <tr className="text-right">
                                <th className="p-6 text-xs font-black text-[#A6998A] uppercase tracking-wider">المستخدم</th>
                                <th className="p-6 text-xs font-black text-[#A6998A] uppercase tracking-wider">البريد الإلكتروني</th>
                                <th className="p-6 text-xs font-black text-[#A6998A] uppercase tracking-wider">الصلاحية</th>
                                <th className="p-6 text-xs font-black text-[#A6998A] uppercase tracking-wider text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F7F3F0]">
                            {loading ? (
                                <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin text-[#8B735B] mx-auto" /></td></tr>
                            ) : filteredUsers.map((profile) => (
                                <tr key={profile.id} className="hover:bg-[#FCFBF9]/50 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#F7F3F0] rounded-full flex items-center justify-center text-[#8B735B] font-black border border-[#EDEAE5] uppercase">{profile.full_name ? profile.full_name[0] : 'U'}</div>
                                            <div className="flex flex-col">
                                                <span className="font-serif text-[#4A3E31] text-base">{profile.full_name || "بدون اسم"}</span>
                                                <code className="text-[9px] text-[#A6998A]">ID: {profile.id.slice(0, 8)}</code>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-[#8B735B] text-sm italic">{profile.email}</td>
                                    <td className="p-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 w-fit ${profile.role === 'admin' ? 'bg-[#4A3E31] text-white' : 'bg-[#F7F3F0] text-[#8B735B]'}`}>
                                            {profile.role === 'admin' ? <ShieldCheck size={12} /> : <User size={12} />}
                                            {profile.role === 'admin' ? 'مدير النظام' : 'عميل'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-center">
                                        <button
                                            onClick={() => setShowConfirmModal({ show: true, id: profile.id })}
                                            disabled={isDeleting === profile.id}
                                            className="p-3 text-[#A6998A] hover:text-[#A66C6C] hover:bg-red-50 rounded-2xl transition-all"
                                        >
                                            {isDeleting === profile.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                    {filteredUsers.map((profile) => (
                        <div key={profile.id} className="bg-white p-5 rounded-3xl border border-[#EDEAE5] shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-[#F7F3F0] border border-[#EDEAE5] rounded-full flex items-center justify-center text-[#8B735B] uppercase font-black">{profile.full_name ? profile.full_name[0] : 'U'}</div>
                                    <div className="flex flex-col">
                                        <span className="font-serif text-[#4A3E31] leading-tight">{profile.full_name || "بدون اسم"}</span>
                                        <span className={`px-2 py-0.5 mt-1 rounded-md text-[9px] font-black w-fit ${profile.role === 'admin' ? 'bg-[#4A3E31] text-white' : 'bg-[#F7F3F0] text-[#8B735B]'}`}>{profile.role === 'admin' ? 'مدير' : 'عميل'}</span>
                                    </div>
                                </div>
                                <button onClick={() => setShowConfirmModal({ show: true, id: profile.id })} className="p-3 text-[#A66C6C] bg-red-50 rounded-2xl"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Custom Confirmation Modal */}
                {showConfirmModal.show && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-[#4A3E31]/40 backdrop-blur-md" onClick={() => setShowConfirmModal({ show: false, id: null })} />
                        <div className="relative bg-white w-full max-w-sm p-8 rounded-4xl shadow-2xl text-center animate-in zoom-in-95 duration-300">
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 size={32} /></div>
                            <h3 className="text-xl font-serif text-[#4A3E31]">تأكيد الحذف النهائي</h3>
                            <p className="text-gray-500 text-sm mt-2 mb-8">هل أنت متأكد من رغبتك في إزالة هذا العضو؟ لن يتمكن من تسجيل الدخول مرة أخرى.</p>
                            <div className="flex gap-3 font-bold">
                                <button onClick={deleteUserProfile} className="flex-1 bg-red-500 text-white py-4 rounded-2xl text-xs hover:bg-red-600 shadow-lg shadow-red-500/20">حذف الحساب</button>
                                <button onClick={() => setShowConfirmModal({ show: false, id: null })} className="flex-1 bg-[#F7F3F0] text-[#8B735B] py-4 rounded-2xl text-xs">تراجع</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}