"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Gift,
  Star,
  Plus,
  Camera,
  ArrowRight,
  Tag,
  MessageCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number;
  category: string;
  images: string[];
}

interface CategoryCard {
  name: string;
  image: string;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const CDN_URL =
  "https://mcliojobvbbepdmxqchs.supabase.co/storage/v1/object/public/products-images/";

const AUTOPLAY_MS = 6000;

const serif = { fontFamily: "'Playfair Display', Georgia, serif" } as const;
const sans = { fontFamily: "'Tajawal', sans-serif" } as const;

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────
const slides = [
  {
    kicker: "ZELDA LINE • مجموعة 2026",
    title: "فنُ",
    italic: "الحضور",
    desc: "حيث يلتقي هدوء التصميم بفخامة التفاصيل.. اكتشفي مجموعة «ميرا» لعام 2026.",
    cta: "تسوقي الآن",
    bg: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80",
  },
  {
    kicker: "ZELDA LINE • حرفيةٌ يدوية",
    title: "تفاصيلُ",
    italic: "الأناقة",
    desc: "كل غرزة تُحاك بحب، وكل قطعة تحمل توقيع الحِرفيّ.. أناقةٌ لا تُكرَّر.",
    cta: "اكتشفي الحرفة",
    bg: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1920&q=80",
  },
  {
    kicker: "ZELDA LINE • إصداراتٌ محدودة",
    title: "إصداراتٌ",
    italic: "نادرة",
    desc: "قطعٌ مختارةٌ بعناية، بكميّاتٍ محدودة لمن تعشقُ التفرّد والتميّز.",
    cta: "شاهدي المجموعة",
    bg: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1920&q=80",
  },
];

const VALUES = [
  { icon: <Truck size={24} />, title: "توصيل سريع", desc: "لكل المدن" },
  { icon: <ShieldCheck size={24} />, title: "جودة مضمونة", desc: "خامات فاخرة" },
  { icon: <Gift size={24} />, title: "تغليف ملكي", desc: "يصلك كهدية" },
  { icon: <Star size={24} />, title: "دفع آمن", desc: "خيارات متعددة" },
];

const TESTIMONIALS = [
  {
    initials: "س م",
    name: "سارة الماجد",
    role: "عميلة متميزة",
    text: "تجربة شراء استثنائية، جودة الأقمشة تفوق الوصف، والتغليف يجعلكِ تشعرين وكأنكِ تفتحين هدية ملكية.",
    featured: false,
  },
  {
    initials: "ن خ",
    name: "نورا الخليجي",
    role: "عميلة VIP",
    text: "كل قطعة اشتريتها من زيلدا أصبحت جزءاً لا يتجزأ من خزانتي. الخامات فاخرة والقصة تناسب كل مقاس بشكل مذهل.",
    featured: true,
  },
  {
    initials: "ل ع",
    name: "لينا العمري",
    role: "عميلة منتظمة",
    text: "التطريز اليدوي في الفستان الذي اخترته كان أدق وأجمل مما توقعت. زيلدا فن حقيقي بكل معنى الكلمة.",
    featured: false,
  },
];

const CRAFT_STEPS = [
  {
    step: "٠١",
    title: "انتقاءُ النسيج",
    label: "المواد الأولية",
    desc: "نسافرُ شرقاً وغرباً لنجلبَ لكِ أجودَ أنواع الكريب الكوري والحرير الطبيعي من أرقى المصادر العالمية.",
    tags: ["حرير طبيعي", "كريب كوري", "قطن مصري"],
    badge: "كوريا · إيطاليا · الهند",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8B735B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" />
        <path d="M2 12h20" />
      </svg>
    ),
  },
  {
    step: "٠٢",
    title: "القصُّ الهندسي",
    label: "يد الحِرفي",
    desc: "بأيدي خبراءٍ يفهمون تفاصيل القوام، نعتمدُ قصاتٍ تمنحكِ الراحةَ التامة مع الأناقة الكاملة في كل حركة.",
    tags: ["قصة مخصصة", "٤ مقاسات"],
    badge: "دقة هندسية",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8B735B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m3 3 18 18" />
        <path d="M9 3h6l2 4H7L9 3Z" />
        <path d="M3 21v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
      </svg>
    ),
  },
  {
    step: "٠٣",
    title: "التطريزُ اليدوي",
    label: "الإبداع اليدوي",
    desc: "غرزةٌ تلو الأخرى، تُحاكُ التفاصيلُ بكل حبّ لتخرجَ كل قطعة كلوحةٍ فنية لا تُكرَّر ولا تُنسى.",
    tags: ["تطريز يدوي", "فريد لكل قطعة"],
    badge: "+٢٠٠ ساعة لكل قطعة",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8B735B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
        <path d="M8 12h8" />
        <path d="M12 8v8" />
      </svg>
    ),
  },
];

const INSTA_IMAGES = [
  "/photo-1515886657613-9f3515b0c78f.jpeg",
  "/herobanner.png",
  "/photo-1490481651871-ab68de25d43d.jpeg",
  "/photo-1539109136881-3be0616acf4b.jpeg",
  "/pngtree-row-of-colorful-robes-hanging-on-a-rack-picture-image_15858673.jpg",
  "/photo-1509631179647-0177331693ae.jpeg",
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function getImageUrl(imagePath: string | null): string {
  if (!imagePath) return "/placeholder.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  return `${CDN_URL}${imagePath}`;
}

function finalPrice(price: number, discount = 0): number {
  return discount > 0 ? price - (price * discount) / 100 : price;
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/** Pill tag used in craft cards and product cards */
function TagPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        ...sans,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.1em",
        background: "#F3EFE9",
        color: "#8B735B",
        borderRadius: 100,
        padding: "3px 10px",
        border: "0.5px solid #EDEAE5",
      }}
    >
      {children}
    </span>
  );
}

/** Single testimonial card */
function TestimonialCard({ t }: { t: (typeof TESTIMONIALS)[number] }) {
  const dark = t.featured;
  return (
    <article
      className="relative transition-shadow duration-300 hover:shadow-[0_8px_40px_rgba(74,62,49,0.10)]"
      style={{
        background: dark ? "#4A3E31" : "#fff",
        border: `0.5px solid ${dark ? "#4A3E31" : "#EDEAE5"}`,
        borderRadius: 24,
        padding: "28px 24px 24px",
      }}
    >
      {/* Decorative quote mark */}
      <span
        aria-hidden="true"
        style={{
          ...serif,
          fontSize: 56,
          lineHeight: 1,
          color: dark ? "rgba(255,255,255,0.15)" : "#EDEAE5",
          position: "absolute",
          top: 6,
          right: 18,
          fontStyle: "italic",
          userSelect: "none",
        }}
      >
        &quot;
      </span>

      {/* Stars */}
      <div className="flex" style={{ gap: 3, marginBottom: 12 }} aria-label="تقييم ٥ نجوم">
        {Array.from({ length: 5 }).map((_, j) => (
          <span key={j} style={{ color: "#C9A96E", fontSize: 13 }} aria-hidden="true">★</span>
        ))}
      </div>

      <p style={{ ...sans, fontSize: 13, color: dark ? "rgba(255,255,255,0.80)" : "#6B5E50", lineHeight: 1.8, margin: "0 0 16px", fontWeight: 300 }}>
        {t.text}
      </p>

      <div className="flex items-center" style={{ gap: 12, marginTop: 12 }}>
        <div
          aria-hidden="true"
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: dark ? "rgba(255,255,255,0.12)" : "#EDE3D8",
            display: "flex", alignItems: "center", justifyContent: "center",
            ...sans, fontSize: 13, fontWeight: 700,
            color: dark ? "rgba(255,255,255,0.8)" : "#8B735B",
            border: `0.5px solid ${dark ? "rgba(255,255,255,0.2)" : "#D4C3B3"}`,
            flexShrink: 0,
          }}
        >
          {t.initials}
        </div>
        <div>
          <p style={{ ...sans, fontSize: 12, fontWeight: 700, color: dark ? "#fff" : "#4A3E31", margin: 0 }}>{t.name}</p>
          <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: dark ? "rgba(255,255,255,0.45)" : "#A6998A", margin: "1px 0 0" }}>
            {t.role}
          </p>
        </div>
      </div>
    </article>
  );
}

/** Single craft step card */
function CraftCard({ s }: { s: (typeof CRAFT_STEPS)[number] }) {
  return (
    <article
      className="transition-shadow duration-300 hover:shadow-[0_8px_40px_rgba(74,62,49,0.10)]"
      style={{ background: "#fff", border: "0.5px solid #EDEAE5", borderRadius: 20, overflow: "hidden" }}
    >
      {/* Visual area */}
      <div style={{ position: "relative", height: 220, background: "#F3EFE9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Icon + label */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#EDE3D8", border: "0.5px solid #D4C3B3", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {s.icon}
          </div>
          <span style={{ ...sans, fontSize: 10, color: "#A6998A", fontWeight: 500, letterSpacing: "0.1em" }}>
            {s.label}
          </span>
        </div>

        {/* Step number — absolute top-right */}
        <div
          aria-label={`الخطوة ${s.step}`}
          style={{
            position: "absolute", top: 14, right: 14,
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(255,255,255,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
            ...serif, fontStyle: "italic", fontSize: 15, color: "#4A3E31",
            border: "0.5px solid #EDEAE5",
          }}
        >
          {s.step}
        </div>

        {/* Origin badge — absolute bottom-left */}
        <span
          style={{
            position: "absolute", bottom: 12, left: 12,
            ...sans, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
            background: "#F3EFE9", color: "#8B735B",
            borderRadius: 100, padding: "3px 10px",
            border: "0.5px solid #EDEAE5",
          }}
        >
          {s.badge}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 20px 22px", textAlign: "right" }}>
        <h3 style={{ ...serif, fontSize: 17, fontStyle: "italic", color: "#4A3E31", margin: "0 0 8px", fontWeight: 400 }}>
          {s.title}
        </h3>
        <p style={{ ...sans, fontSize: 12, color: "#8B735B", lineHeight: 1.85, margin: 0, fontWeight: 300 }}>
          {s.desc}
        </p>
        <div style={{ marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {s.tags.map((tag) => <TagPill key={tag}>{tag}</TagPill>)}
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────
// Hero Slider (isolated component)
// ─────────────────────────────────────────────
function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    startRef.current = Date.now();
    // setProgress(0) removed to satisfy react-hooks purity lint
    // progress already initializes to 0 via useState


    const tick = (now: number) => {
      if (!pausedRef.current) {
        const elapsed = now - startRef.current;
        const p = Math.min(1, elapsed / AUTOPLAY_MS);
        setProgress(p);
        if (p >= 1) {
          setIndex((i) => (i + 1) % slides.length);
          return;
        }
      } else {
        startRef.current = now - progress * AUTOPLAY_MS;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const goTo = (i: number) => setIndex((i + slides.length) % slides.length);

  return (
    <section
      dir="rtl"
      aria-label="معرض الصور الرئيسي"
      className="relative w-full h-screen overflow-hidden bg-black"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
          style={{ opacity: i === index ? 1 : 0, zIndex: i === index ? 1 : 0 }}
          aria-hidden={i !== index}
        >
          <div
            className="absolute inset-0 transition-transform duration-[6000ms] ease-out"
            style={{
              backgroundImage: `url(${s.bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transform: i === index ? "scale(1.08)" : "scale(1)",
            }}
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

          <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
            <div
              className="max-w-5xl"
              style={{
                transform: i === index ? "translateY(0)" : "translateY(20px)",
                opacity: i === index ? 1 : 0,
                transition: "transform 900ms ease, opacity 900ms ease",
                transitionDelay: i === index ? "250ms" : "0ms",
              }}
            >
              <p className="text-white/60 uppercase mb-4" style={{ ...sans, fontSize: 12, letterSpacing: "0.5em", fontWeight: 700 }}>
                {s.kicker}
              </p>
              <h1 className="text-white mb-8 leading-none drop-shadow-2xl" style={{ ...serif, fontSize: "clamp(64px, 12vw, 144px)", fontWeight: 400 }}>
                {s.title}{" "}
                <em style={{ fontStyle: "italic", fontWeight: 300, color: "#d6d3d1" }}>{s.italic}</em>
              </h1>
              <p className="max-w-2xl mx-auto text-white/80 mb-12 leading-relaxed" style={{ ...sans, fontSize: 18, fontWeight: 300 }}>
                {s.desc}
              </p>
              <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                <Link
                  href="/shop"
                  className="group flex items-center gap-4 bg-white text-black px-12 py-5 rounded-full hover:bg-stone-200 transition-all shadow-2xl"
                  style={{ ...sans, fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase" }}
                >
                  {s.cta}
                  <ArrowRight size={16} className="group-hover:-translate-x-1 transition-transform rotate-180" aria-hidden="true" />
                </Link>
                <Link
                  href="/collections"
                  className="border border-white/30 bg-white/10 backdrop-blur-md text-white px-12 py-5 rounded-full hover:bg-white/20 transition-all"
                  style={{ ...sans, fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase" }}
                >
                  التشكيلات
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide counter */}
      <div className="absolute z-20 left-6 md:left-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4" style={sans} aria-hidden="true">
        <span style={{ ...serif, fontSize: 28, fontStyle: "italic", color: "#fff" }}>{String(index + 1).padStart(2, "0")}</span>
        <div className="w-px h-16 bg-white/30" />
        <span style={{ fontSize: 12, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)" }}>/ {String(slides.length).padStart(2, "0")}</span>
      </div>

      {/* Dot navigation */}
      <nav className="absolute z-20 right-6 md:right-10 top-1/2 -translate-y-1/2 flex flex-col gap-3" aria-label="التنقل بين الشرائح">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`الشريحة ${i + 1}`}
            aria-current={i === index ? "true" : "false"}
            className="block transition-all"
            style={{ width: 8, height: i === index ? 28 : 8, borderRadius: 100, background: i === index ? "#fff" : "rgba(255,255,255,0.35)" }}
          />
        ))}
      </nav>

      {/* Progress bar */}
      <div className="absolute z-20 bottom-0 left-0 right-0 h-[3px] bg-white/10" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-white" style={{ width: `${progress * 100}%`, transition: "width 80ms linear" }} />
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/40 animate-bounce" aria-hidden="true">
        <ChevronLeft className="-rotate-90" size={26} />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryCard[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ── Data fetching ──────────────────────────
  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, discount, category, images")
      .limit(8)
      .order("created_at", { ascending: false });

    if (data) setProducts(data as Product[]);
    if (error) console.error("fetchProducts error:", error);
  }, []);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase
      .from("products")
      .select("category, images")
      .order("created_at", { ascending: false });

    if (!data) return;

    const seen = new Map<string, string>();
    data.forEach((p) => {
      let imgs = p.images;
      if (typeof imgs === "string") {
        try { imgs = JSON.parse(imgs); } catch { imgs = [imgs]; }
      }
      const first = Array.isArray(imgs) ? imgs[0] : null;
      if (p.category && !seen.has(p.category) && first) {
        seen.set(p.category, first);
      }
    });

    setCategories(Array.from(seen.entries()).map(([name, image]) => ({ name, image })));
  }, []);

  // ── Effects ───────────────────────────────
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
      fetchProducts();
      fetchCategories();
    });

    const channel = supabase
      .channel("realtime-products-home")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        fetchProducts();
        fetchCategories();
      })
      .subscribe();

    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
      supabase.removeChannel(channel);
    };
  }, [fetchProducts, fetchCategories]);

  // ── Scroll handler for product rail ───────
  const scrollRail = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    scrollRef.current.scrollTo({
      left: dir === "left" ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  if (!mounted) return null;

  // ─────────────────────────────────────────
  return (
    <main className="w-full bg-white text-right font-sans overflow-x-hidden" dir="rtl">

{/* Floating UI */}
      <div
        className="z-50 flex flex-col gap-4 items-center"
        style={{ position: 'fixed', bottom: '90px', left: '24px' }}
      >
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 animate-in fade-in zoom-in-75"
          >
            <ArrowUp size={24} />
          </button>
        )}
        <a
          href="https://wa.me/201092882189"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:rotate-12 hover:scale-110 active:scale-95 transition-all duration-300"
        >
          <MessageCircle size={28} />
        </a>
      </div>

      {/* 1. Hero Slider */}
      <HeroSlider />

      {/* 2. Values Bar */}
      <section aria-label="مميزاتنا" className="py-12 bg-white border-b border-stone-100 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {VALUES.map((item) => (
            <div key={item.title} className="flex items-center gap-4 justify-center md:justify-start">
              <div className="text-stone-900" aria-hidden="true">{item.icon}</div>
              <div className="text-right">
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-900">{item.title}</h2>
                <p className="text-[10px] text-stone-400 font-bold mt-1 uppercase">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Curated Look */}
      <section aria-labelledby="curated-heading" className="py-32 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-24 items-center">
          <div className="w-full lg:w-1/2 relative group">
            <div className="relative aspect-4/5 w-4/5 rounded-[4rem] overflow-hidden shadow-2xl z-10">
              <Image src="/photo-1515886657613-9f3515b0c78f.jpeg" alt="إطلالة موسم زيلدا لاين" fill priority sizes="(max-width: 768px) 80vw, 40vw" className="object-cover" />
              <div className="absolute top-[30%] right-[40%]">
                <div className="w-8 h-8 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center animate-pulse cursor-pointer border border-white/50">
                  <Link href="/shop" aria-label="تسوقي هذه القطعة"><Plus size={16} className="text-white" /></Link>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-16 -left-8 w-2/3 aspect-square rounded-[3rem] overflow-hidden shadow-2xl z-20 border-8 border-white hidden md:block">
              <Image src="/photo-1483985988355-763728e1935b.jpeg" fill sizes="30vw" className="object-cover" alt="إطلالة ثانية" />
            </div>
          </div>

          <div className="w-full lg:w-1/2 space-y-10 text-right pr-0 lg:pr-12">
            <span className="text-stone-400 font-black tracking-widest text-xs uppercase italic">Curated Look</span>
            <h2 id="curated-heading" className="text-5xl md:text-7xl font-serif text-gray-900 leading-tight">
              تنسيقُ الموسم <br />
              <span className="italic text-stone-400 font-light">بأناملِ خبراؤنا</span>
            </h2>
            <p className="text-stone-500 text-xl leading-loose font-light italic border-r-4 border-stone-100 pr-8">
              &quot;لا نبيعُ قطعاً فحسب، بل نصممُ لكِ إطلالةً متكاملة تعبرُ عن ذوقكِ الرفيع. اخترنا لكِ مزيجاً من الخامات التي تتناغمُ لتعطيكِ الحضور الذي تستحقينه.&quot;
            </p>
            <Link href="/shop" className="inline-flex items-center gap-4 text-xs font-black uppercase tracking-widest border-b-2 border-black pb-2 hover:text-stone-500 transition-all">
              تسوقي الإطلالة
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Browse By Style — Desktop */}
      <section aria-labelledby="style-heading" className="py-8 px-6 md:px-12 bg-[#f0efed]">
        <div className="text-center mb-8">
          <h2 id="style-heading" className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#1a1a1a] mb-3" style={{ fontFamily: "Georgia, serif" }}>
            تصفحي حسب الستايل
          </h2>
          <div className="flex items-center justify-center gap-3" aria-hidden="true">
            <div style={{ height: "1px", width: "50px", backgroundColor: "rgba(0,0,0,0.2)" }} />
            <div style={{ height: "4px", width: "28px", backgroundColor: "#c0392b", borderRadius: "99px" }} />
            <div style={{ height: "1px", width: "50px", backgroundColor: "rgba(0,0,0,0.2)" }} />
          </div>
        </div>

        <div className="hidden md:block max-w-5xl mx-auto space-y-3">
          {[categories.slice(0, 4), categories.slice(4)].map((row, ri) =>
            row.length > 0 ? (
              <div key={ri} style={{ display: "grid", gridTemplateColumns: ri === 0 ? "1fr 1.6fr 1fr 1.6fr" : "1.6fr 1fr 1.6fr 1fr", gap: "10px" }}>
                {row.map((cat) => (
                  <Link
                    key={cat.name}
                    href={`/shop?category=${encodeURIComponent(cat.name)}`}
                    className="relative rounded-2xl overflow-hidden group cursor-pointer"
                    style={{ height: ri === 0 ? "220px" : "180px" }}
                    aria-label={`تصفح فئة ${cat.name}`}
                  >
                    <img src={cat.image} alt={cat.name} loading="lazy" className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <span className="absolute top-2 right-2 z-10 font-bold text-white text-xs px-3 py-1.5 rounded-lg animate-pulse" style={{ backgroundColor: "#c0392b", fontFamily: "Georgia, serif" }}>
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            ) : null
          )}
        </div>
      </section>

      {/* 4b. Browse By Style — Mobile scroll */}
      <div className="md:hidden bg-[#f0efed] pb-6 overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="flex gap-3 px-6" style={{ width: "max-content" }}>
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="relative flex-shrink-0 rounded-2xl overflow-hidden group"
              style={{ width: "160px", height: "200px" }}
              aria-label={`تصفح فئة ${cat.name}`}
            >
              <img src={cat.image} alt={cat.name} loading="lazy" className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <span className="absolute top-2 right-2 z-10 font-bold text-white text-xs px-2 py-1 rounded-lg animate-pulse" style={{ backgroundColor: "#c0392b", fontFamily: "Georgia, serif" }}>
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 5. New Arrivals */}
      <section aria-labelledby="new-arrivals-heading" className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-20 flex justify-between items-end">
          <div className="space-y-4">
            <h2 id="new-arrivals-heading" className="text-4xl md:text-5xl font-serif text-gray-900 italic">وصلنا حديثاً</h2>
            <div className="h-1 w-20 bg-black" />
          </div>
          <div className="flex gap-4">
            <button onClick={() => scrollRail("left")} aria-label="السابق" className="w-14 h-14 rounded-full border border-stone-200 flex items-center justify-center bg-white hover:bg-black hover:text-white transition-all shadow-sm">
              <ChevronRight size={24} />
            </button>
            <button onClick={() => scrollRail("right")} aria-label="التالي" className="w-14 h-14 rounded-full border border-stone-200 flex items-center justify-center bg-white hover:bg-black hover:text-white transition-all shadow-sm">
              <ChevronLeft size={24} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-10 px-6 md:px-12 no-scrollbar snap-x snap-mandatory scroll-smooth pb-12"
          style={{ scrollbarWidth: "none" }}
          role="list"
          aria-label="أحدث المنتجات"
        >
          {products.map((product) => {
            const disc = product.discount ?? 0;
            const hasDisc = disc > 0;
            const fp = finalPrice(product.price, disc);

            return (
              <Link
                href={`/product/${product.id}`}
                key={product.id}
                className="min-w-[320px] md:min-w-[400px] snap-center group"
                role="listitem"
                aria-label={`${product.name} - ${Math.round(fp).toLocaleString()} ج.م`}
              >
                <div className="relative aspect-3/4 overflow-hidden mb-6 rounded-[2.5rem] bg-stone-50 border border-stone-100 shadow-sm">
                  {hasDisc && (
                    <div className="absolute top-6 right-6 z-20 bg-red-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg animate-pulse" aria-label={`خصم ${disc}%`}>
                      خصم {disc}%
                    </div>
                  )}
                  <div className="absolute top-6 left-6 z-20 bg-white/80 backdrop-blur-md text-[#4A3E31] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border border-white/20">
                    {product.category}
                  </div>
                  <Image
                    src={getImageUrl(product.images?.[0] ?? null)}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 320px, 400px"
                    className="object-cover transition-all duration-1000 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
                  />
                  <div className="absolute bottom-6 left-6 right-6 translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl flex justify-between items-center shadow-2xl">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[#8B735B]">اكتشفي القطعة</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#4A3E31]">{fp.toLocaleString()} ج.م</span>
                          {hasDisc && <span className="text-[9px] text-gray-400 line-through">{product.price.toLocaleString()}</span>}
                        </div>
                      </div>
                      <Plus size={16} className="text-[#8B735B]" aria-hidden="true" />
                    </div>
                  </div>
                </div>
                <div className="text-center px-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h3 className="font-serif text-xl text-gray-900 uppercase tracking-tighter truncate">{product.name}</h3>
                    {hasDisc && (
                      <span className="flex items-center gap-1 text-[9px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                        <Tag size={8} aria-hidden="true" /> -{disc}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-sm font-black text-[#8B735B]">{Math.round(fp).toLocaleString()} ج.م</span>
                    {hasDisc && <del className="text-[10px] text-gray-400">{Math.round(product.price).toLocaleString()} ج.م</del>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 6. Instagram / Community Feed */}
      <section aria-label="مجتمع زيلدا لاين على إنستغرام" className="py-24 border-y border-stone-100 bg-white overflow-hidden">
        <div className="px-6 mb-12 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Camera size={24} aria-hidden="true" />
            <h2 className="text-xl md:text-2xl font-serif italic">إلهامٌ من مجتمعنا</h2>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">@ZELDALINE_SA</p>
        </div>
        <div className="flex gap-4 animate-scroll whitespace-nowrap" aria-hidden="true">
          {INSTA_IMAGES.map((src, i) => (
            <div key={i} className="relative w-64 h-64 md:w-80 md:h-80 shrink-0 rounded-3xl overflow-hidden group">
              <Image src={src} alt="" fill sizes="(max-width: 768px) 256px, 320px" className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
              <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={30} className="text-white" />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Brand Philosophy */}
      <section aria-labelledby="brand-heading" className="py-40 bg-white px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
     <div className="relative w-full min-h-[800px] h-[800px] rounded-[4rem] overflow-hidden shadow-2xl">

           <Image src="/photo-1539109136881-3be0616acf4b.jpeg" width={1200} height={800} className="w-full h-[800px] object-cover rounded-[4rem]" alt="..." />

          </div>
          <div className="space-y-12">
            <h2 id="brand-heading" className="text-5xl md:text-7xl font-serif text-gray-900 leading-tight italic font-light">
              الاحتشام هو أرقى <br /> أنواع التميز
            </h2>
            <div className="space-y-6">
              <blockquote className="text-stone-600 leading-loose text-xl font-light italic border-r-4 border-stone-200 pr-8">
                &quot;في زيلدا لاين، نحن لا نصمم الملابس، بل نصنع الثقة والوقار لكل امرأة تعتز بهويتها وتبحث عن التفرد.&quot;
              </blockquote>
              <div className="w-px h-16 bg-stone-100 mr-8" />
            </div>
            <Link href="/collections" className="inline-block bg-black text-white px-14 py-6 text-xs font-black uppercase tracking-[0.2em] rounded-full hover:bg-stone-800 transition-all shadow-xl">
              اكتشفي عالمنا
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Testimonials + Craft */}
      <section
        dir="rtl"
        aria-label="آراء العملاء وطريقة الصنع"
        className="border-y text-right"
        style={{ background: "#FCFBF9", borderColor: "#EDEAE5" }}
      >
        {/* Testimonials */}
        <div style={{ padding: "56px 32px 0" }}>
          <div className="text-center" style={{ marginBottom: 48 }}>
            <p style={{ ...sans, fontSize: 11, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: "#A6998A", marginBottom: 10 }}>
              Testimonials
            </p>
            <div className="flex justify-center" style={{ marginBottom: 16, gap: 3 }} aria-label="تقييم ٥ نجوم">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ color: "#C9A96E", fontSize: 13 }} aria-hidden="true">★</span>
              ))}
            </div>
            <h2 style={{ ...serif, fontSize: 15, fontStyle: "italic", color: "#4A3E31", fontWeight: 400, margin: "0 auto", maxWidth: 580, lineHeight: 1.5 }}>
              آراء عملائنا
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16, marginBottom: 16 }}>
            {TESTIMONIALS.map((t, i) => <TestimonialCard key={i} t={t} />)}
          </div>

          <div className="text-center" style={{ padding: "8px 0 44px" }}>
            <p style={{ ...sans, fontSize: 11, color: "#A6998A", fontWeight: 500 }}>
              +٢٤٠ مراجعة موثقة · متوسط التقييم{" "}
              <strong style={{ color: "#C9A96E", fontWeight: 700 }}>٤.٩ / ٥</strong>
            </p>
          </div>
        </div>

        <div style={{ height: "0.5px", background: "#EDEAE5", margin: "0 32px" }} role="separator" />

        {/* Our Craft */}
        <div style={{ padding: "56px 32px 60px" }}>
          <div className="text-center" style={{ marginBottom: 48 }}>
            <p style={{ ...sans, fontSize: 11, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: "#A6998A", marginBottom: 10 }}>
              Our Craft
            </p>
            <h2 style={{ ...serif, fontSize: 28, fontStyle: "italic", color: "#4A3E31", fontWeight: 400, margin: 0, lineHeight: 1.4 }}>
              كيف تُصنعُ قطعةُ زيلدا؟
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 20, marginBottom: 44 }}>
            {CRAFT_STEPS.map((s) => <CraftCard key={s.step} s={s} />)}
          </div>

          {/* CTA Bar */}
          <div
            className="flex flex-col md:flex-row items-center justify-between"
            style={{ background: "#4A3E31", borderRadius: 20, padding: "32px 36px", gap: 24 }}
          >
            <div>
              <p style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
                النتيجة
              </p>
              <p style={{ ...serif, fontSize: 20, fontStyle: "italic", color: "rgba(255,255,255,0.92)", fontWeight: 400, lineHeight: 1.4 }}>
                كل قطعة.. حكايةٌ تُحكى على قماش
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center transition-colors hover:bg-white/15"
              style={{ gap: 10, padding: "14px 32px", border: "0.5px solid rgba(255,255,255,0.3)", borderRadius: 100, ...sans, fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "#fff", whiteSpace: "nowrap", textTransform: "uppercase" }}
            >
              اكتشفي المعرض
              <ArrowLeft size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 text-right">
          <div className="md:col-span-2 space-y-8">
            <p className="text-4xl font-serif font-bold tracking-tighter uppercase">Zelda Line</p>
            <p className="text-stone-500 font-light leading-relaxed max-w-sm text-lg">
              وجهتكِ الأولى للملابس الإسلامية العصرية التي توازن بين الفخامة والوقار.
            </p>
          </div>
          <nav aria-label="روابط سريعة">
            <h3 className="font-black mb-8 text-xs uppercase tracking-widest text-stone-900">روابط سريعة</h3>
            <ul className="space-y-4 text-stone-400 text-sm font-bold">
              <li><Link href="/return-policy" className="hover:text-black transition-colors">سياسة الاستبدال</Link></li>
              <li><Link href="/about" className="hover:text-black transition-colors">من نحن</Link></li>
              <li><Link href="/faqs" className="hover:text-black transition-colors">الأسئلة الشائعة</Link></li>
            </ul>
          </nav>
          <address className="not-italic">
            <h3 className="font-black mb-8 text-xs uppercase tracking-widest text-stone-900">تواصل معنا</h3>
            <div className="space-y-4 text-stone-500 text-sm font-bold">
              <p><a href="mailto:info@zeldaline.com" className="hover:text-black transition-colors">info@zeldaline.com</a></p>
              <p dir="ltr"><a href="tel:+966500000000" className="hover:text-black transition-colors">+966 500 000 000</a></p>
            </div>
          </address>
        </div>
      </footer>

      <style jsx>{`
        @keyframes scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(50%); }
        }
        .animate-scroll {
          display: flex;
          animation: scroll 40s linear infinite;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}