/**
 * RABEYA'S CLOTH — Customer Homepage
 * Luxury fashion storefront with hero slider, search, flash sale,
 * best sellers, category gallery, and product grid.
 *
 * To use: drop into a Next.js or Vite + React project.
 * Google Fonts loaded via @import inside the style block.
 */

import { useState, useEffect, useRef } from "react";

// ─── Design Tokens ─────────────────────────────────────────────────────────
const C = {
  gold:      "#BFA054",
  goldLight: "#E2C97E",
  goldDark:  "#7A6330",
  cream:     "#FAF7F2",
  ivory:     "#F3EDE3",
  onyx:      "#111110",
  charcoal:  "#1E1D1B",
  slate:     "#5A5751",
  mist:      "#C8C3BB",
  blush:     "#C4796F",
  sage:      "#7A9E7E",
};

// ─── Static Data ────────────────────────────────────────────────────────────
const SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80",
    eyebrow: "New Arrivals 2025",
    title: "Draped in\nPure Elegance",
    sub: "Handcrafted silks from the finest looms of Bengal",
    cta: "Explore Collection",
  },
  {
    img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80",
    eyebrow: "Bridal Couture",
    title: "Your Wedding\nStory Begins",
    sub: "Bespoke lehengas and embroidered masterpieces",
    cta: "View Bridal Edit",
  },
  {
    img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80",
    eyebrow: "Festive Season",
    title: "Celebrate Every\nMoment",
    sub: "Premium kameez and festive suits for every occasion",
    cta: "Shop Festive",
  },
];

const CATEGORIES = [
  { name: "Saree",    count: 48, img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80" },
  { name: "Lehenga",  count: 29, img: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=500&q=80" },
  { name: "Kameez",   count: 63, img: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&q=80" },
  { name: "Abaya",    count: 34, img: "https://images.unsplash.com/photo-1600618538034-fc86e9a679f3?w=500&q=80" },
  { name: "Dupatta",  count: 55, img: "https://images.unsplash.com/photo-1594938298603-c8148c4b4da4?w=500&q=80" },
  { name: "Suits",    count: 41, img: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&q=80" },
];

const PRODUCTS = [
  { id:1,  name:"Royal Banarasi Silk",    price:12500, old:15000, cat:"Saree",   tag:"Best Seller", stars:5, sold:234, img:"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80" },
  { id:2,  name:"Zardozi Lehenga Set",    price:28000, old:35000, cat:"Lehenga", tag:"Flash Sale",  stars:5, sold:87,  img:"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=500&q=80" },
  { id:3,  name:"Chikankari Kameez",      price:4200,  old:5500,  cat:"Kameez",  tag:"New",         stars:4, sold:312, img:"https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&q=80" },
  { id:4,  name:"Embroidered Dupatta",    price:2800,  old:3500,  cat:"Dupatta", tag:"Sale",        stars:4, sold:156, img:"https://images.unsplash.com/photo-1594938298603-c8148c4b4da4?w=500&q=80" },
  { id:5,  name:"Premium Black Abaya",    price:6500,  old:8000,  cat:"Abaya",   tag:"Best Seller", stars:5, sold:198, img:"https://images.unsplash.com/photo-1600618538034-fc86e9a679f3?w=500&q=80" },
  { id:6,  name:"Georgette Silk Saree",   price:8900,  old:11000, cat:"Saree",   tag:"Flash Sale",  stars:4, sold:423, img:"https://images.unsplash.com/photo-1609713116726-96f6e76e3b0f?w=500&q=80" },
  { id:7,  name:"Silk Kameez Full Set",   price:5600,  old:7000,  cat:"Kameez",  tag:"New",         stars:5, sold:67,  img:"https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&q=80" },
  { id:8,  name:"Designer Lawn Suit",     price:9800,  old:12500, cat:"Suits",   tag:"Best Seller", stars:4, sold:289, img:"https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&q=80" },
];

const FLASH = PRODUCTS.filter(p => p.tag === "Flash Sale");
const BEST  = PRODUCTS.filter(p => p.tag === "Best Seller");
const ALL_CATS = ["All", ...CATEGORIES.map(c => c.name)];

// ─── Countdown Hook ─────────────────────────────────────────────────────────
function useCountdown(h = 5, m = 47, s = 22) {
  const [t, setT] = useState({ h, m, s });
  useEffect(() => {
    const id = setInterval(() => setT(prev => {
      if (prev.s > 0) return { ...prev, s: prev.s - 1 };
      if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
      if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
      return { h: 0, m: 0, s: 0 };
    }), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

// ─── Global CSS ─────────────────────────────────────────────────────────────
function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      :root {
        --gold: #BFA054; --gold-l: #E2C97E; --gold-d: #7A6330;
        --cream: #FAF7F2; --ivory: #F3EDE3; --onyx: #111110;
        --charcoal: #1E1D1B; --slate: #5A5751; --mist: #C8C3BB;
        --blush: #C4796F; --sage: #7A9E7E;
        --ease: cubic-bezier(.25,.46,.45,.94);
      }
      html { scroll-behavior: smooth; }
      body { font-family: 'Jost', sans-serif; background: var(--cream); color: var(--charcoal); overflow-x: hidden; }
      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 3px; }

      @keyframes fadeUp   { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:none; } }
      @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
      @keyframes shimmer  { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
      @keyframes kenBurns { from{transform:scale(1)} to{transform:scale(1.07)} }
      @keyframes ticker   { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      @keyframes ripple   { to{transform:scale(2.5);opacity:0} }

      .fade-up  { animation: fadeUp .7s var(--ease) both; }
      .fade-in  { animation: fadeIn .5s ease both; }
      .float    { animation: float 3.5s ease-in-out infinite; }

      .gold-txt {
        background: linear-gradient(120deg, var(--gold-d), var(--gold), var(--gold-l), var(--gold));
        background-size: 300%; -webkit-background-clip: text;
        -webkit-text-fill-color: transparent; background-clip: text;
        animation: shimmer 5s linear infinite;
      }

      /* Header */
      .site-header {
        position: fixed; top: 0; left: 0; right: 0; z-index: 900;
        transition: background .4s var(--ease), box-shadow .4s;
        padding: 0 6%;
      }
      .site-header.scrolled {
        background: rgba(250,247,242,.93); backdrop-filter: blur(18px);
        box-shadow: 0 1px 0 rgba(191,160,84,.18);
      }
      .header-inner {
        max-width: 1440px; margin: 0 auto; height: 72px;
        display: flex; align-items: center; gap: 32px;
      }

      /* Search */
      .search-wrap { position: relative; flex: 1; max-width: 460px; }
      .search-input {
        width: 100%; padding: 12px 48px 12px 22px;
        background: rgba(255,255,255,.9); border: 1.5px solid rgba(191,160,84,.25);
        border-radius: 50px; font-family: 'Jost', sans-serif; font-size: 14px;
        color: var(--charcoal); outline: none;
        transition: border-color .3s, box-shadow .3s;
      }
      .search-input:focus { border-color: var(--gold); box-shadow: 0 0 0 4px rgba(191,160,84,.1); }
      .search-input::placeholder { color: var(--mist); }
      .search-icon { position: absolute; right: 18px; top: 50%; transform: translateY(-50%); color: var(--gold); }
      .search-dropdown {
        position: absolute; top: calc(100% + 8px); left: 0; right: 0;
        background: #fff; border-radius: 18px;
        box-shadow: 0 24px 64px rgba(0,0,0,.13); overflow: hidden; z-index: 200;
        border: 1px solid rgba(191,160,84,.15);
      }
      .search-item {
        display: flex; align-items: center; gap: 14px; padding: 12px 18px;
        cursor: pointer; transition: background .2s;
      }
      .search-item:hover { background: rgba(191,160,84,.06); }

      /* Buttons */
      .btn-gold {
        display: inline-flex; align-items: center; gap: 8px;
        background: linear-gradient(135deg, var(--gold-d), var(--gold), var(--gold-l));
        background-size: 200%; border: none; color: #fff; border-radius: 50px;
        font-family: 'Jost', sans-serif; font-weight: 600; font-size: 12px;
        letter-spacing: 1.8px; text-transform: uppercase; cursor: pointer;
        transition: background-position .4s var(--ease), transform .3s, box-shadow .3s;
        padding: 13px 30px; position: relative; overflow: hidden;
      }
      .btn-gold:hover { background-position: right center; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(191,160,84,.38); }
      .btn-ghost {
        display: inline-flex; align-items: center; gap: 8px;
        background: transparent; border: 1.5px solid rgba(255,255,255,.55);
        color: #fff; border-radius: 50px; font-family: 'Jost', sans-serif;
        font-weight: 500; font-size: 12px; letter-spacing: 1.5px;
        text-transform: uppercase; cursor: pointer;
        transition: all .3s; padding: 11px 28px;
      }
      .btn-ghost:hover { background: rgba(255,255,255,.12); border-color: #fff; }
      .btn-outline-dark {
        display: inline-flex; align-items: center; gap: 8px;
        background: transparent; border: 1.5px solid rgba(191,160,84,.35);
        color: var(--slate); border-radius: 50px; font-family: 'Jost', sans-serif;
        font-weight: 500; font-size: 12px; letter-spacing: 1.2px;
        text-transform: uppercase; cursor: pointer;
        transition: all .35s; padding: 9px 22px;
      }
      .btn-outline-dark:hover { background: var(--gold); color: #fff; border-color: var(--gold); box-shadow: 0 4px 18px rgba(191,160,84,.3); }

      /* Nav icon button */
      .nav-icon-btn {
        display: flex; flex-direction: column; align-items: center;
        gap: 3px; background: none; border: none; cursor: pointer;
        padding: 8px 12px; border-radius: 12px; transition: all .3s;
        font-family: 'Jost', sans-serif; font-size: 9px; font-weight: 600;
        letter-spacing: 1px; text-transform: uppercase; color: var(--slate);
        position: relative;
      }
      .nav-icon-btn:hover { background: rgba(191,160,84,.08); color: var(--gold); }
      .nav-icon-btn.active { color: var(--gold); background: rgba(191,160,84,.1); }
      .notif { position: absolute; top: 5px; right: 8px; width: 17px; height: 17px; background: var(--blush); border-radius: 50%; font-size: 9px; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; }

      /* Ticker */
      .ticker-wrap { background: var(--onyx); overflow: hidden; white-space: nowrap; padding: 10px 0; }
      .ticker-inner { display: inline-block; animation: ticker 28s linear infinite; }
      .ticker-item { display: inline-block; padding: 0 40px; font-size: 11px; color: rgba(255,255,255,.55); letter-spacing: 2px; text-transform: uppercase; }
      .ticker-item span { color: var(--gold); margin: 0 8px; }

      /* Hero */
      .hero { position: relative; height: 88vh; min-height: 560px; overflow: hidden; }
      .hero-slide { position: absolute; inset: 0; transition: opacity .9s ease; }
      .hero-slide img { width: 100%; height: 100%; object-fit: cover; animation: kenBurns 10s ease forwards; }
      .hero-overlay { position: absolute; inset: 0; background: linear-gradient(105deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.18) 70%); }
      .hero-content { position: absolute; bottom: 14%; left: 7%; }
      .hero-eyebrow { font-size: 10px; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; color: var(--gold-l); display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
      .hero-eyebrow::before { content:''; display:block; width:36px; height:1px; background:var(--gold-l); }
      .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(44px, 6.5vw, 88px); font-weight: 400; color: #fff; line-height: 1.05; white-space: pre-line; margin-bottom: 20px; text-shadow: 0 4px 40px rgba(0,0,0,.3); }
      .hero-sub { font-size: 15px; color: rgba(255,255,255,.72); font-weight: 300; letter-spacing: .5px; margin-bottom: 36px; max-width: 440px; line-height: 1.6; }
      .hero-dots { position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; z-index: 10; }
      .hero-dot { border: none; cursor: pointer; border-radius: 4px; height: 8px; transition: all .4s var(--ease); background: rgba(255,255,255,.35); }

      /* Stats bar */
      .stats-bar { background: var(--charcoal); padding: 0 6%; }
      .stats-inner { max-width: 1440px; margin: 0 auto; display: grid; grid-template-columns: repeat(4,1fr); }
      .stat-item { padding: 22px 20px; text-align: center; border-right: 1px solid rgba(191,160,84,.12); }
      .stat-item:last-child { border-right: none; }
      .stat-val { font-family: 'Playfair Display', serif; font-size: 28px; color: var(--gold); font-weight: 500; }
      .stat-lbl { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,.38); margin-top: 4px; }

      /* Section header */
      .sec-hdr { text-align: center; margin-bottom: 52px; }
      .sec-eyebrow { font-size: 10px; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); margin-bottom: 14px; }
      .sec-title { font-family: 'Playfair Display', serif; font-size: clamp(30px, 4vw, 50px); font-weight: 400; color: var(--charcoal); }
      .sec-rule { display: flex; align-items: center; gap: 16px; margin: 16px auto 0; max-width: 320px; }
      .sec-rule::before, .sec-rule::after { content:''; flex:1; height:1px; background:linear-gradient(to right,transparent,var(--gold),transparent); }
      .sec-rule-dot { color: var(--gold); font-size: 18px; }

      /* Category grid */
      .cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px,1fr)); gap: 18px; }
      .cat-card { border-radius: 20px; overflow: hidden; position: relative; cursor: pointer; height: 240px; }
      .cat-card img { width: 100%; height: 100%; object-fit: cover; transition: transform .6s var(--ease); }
      .cat-card:hover img { transform: scale(1.08); }
      .cat-card-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.72) 0%, transparent 55%); display: flex; flex-direction: column; justify-content: flex-end; padding: 20px; }
      .cat-card-name { font-family: 'Playfair Display', serif; font-size: 22px; color: #fff; font-weight: 500; }
      .cat-card-count { font-size: 11px; color: var(--gold-l); margin-top: 4px; letter-spacing: 1px; }

      /* Filter pills */
      .pill-row { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-bottom: 44px; }
      .pill {
        padding: 9px 22px; border-radius: 50px; font-size: 12px; font-weight: 500;
        letter-spacing: .5px; cursor: pointer;
        border: 1.5px solid rgba(191,160,84,.3); color: var(--slate);
        background: #fff; transition: all .3s;
      }
      .pill:hover, .pill.on { background: var(--gold); color: #fff; border-color: var(--gold); box-shadow: 0 4px 16px rgba(191,160,84,.28); }

      /* Product card */
      .p-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px,1fr)); gap: 28px; }
      .p-card { background: #fff; border-radius: 18px; overflow: hidden; box-shadow: 0 6px 28px rgba(0,0,0,.08); transition: transform .4s var(--ease), box-shadow .4s; }
      .p-card:hover { transform: translateY(-8px); box-shadow: 0 20px 56px rgba(191,160,84,.18); }
      .p-img { position: relative; height: 290px; overflow: hidden; }
      .p-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .6s var(--ease); }
      .p-card:hover .p-img img { transform: scale(1.07); }
      .p-badge { position: absolute; top: 14px; left: 14px; padding: 4px 13px; border-radius: 20px; font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; z-index: 2; }
      .badge-flash { background: var(--blush); color: #fff; }
      .badge-best  { background: var(--gold);  color: #fff; }
      .badge-new   { background: var(--sage);  color: #fff; }
      .badge-sale  { background: var(--onyx);  color: var(--gold-l); }
      .p-wish { position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; background: rgba(255,255,255,.88); backdrop-filter: blur(10px); border: none; border-radius: 50%; cursor: pointer; font-size: 17px; display: flex; align-items: center; justify-content: center; z-index: 2; transition: transform .25s; }
      .p-wish:hover { transform: scale(1.18); }
      .p-wish.on { color: var(--blush); }
      .p-hover-bar { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,.68), transparent); padding: 20px 16px 16px; opacity: 0; transition: opacity .35s; display: flex; gap: 10px; }
      .p-card:hover .p-hover-bar { opacity: 1; }
      .p-body { padding: 20px 22px; }
      .p-cat { font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; }
      .p-name { font-family: 'Playfair Display', serif; font-size: 19px; font-weight: 500; color: var(--charcoal); margin-bottom: 8px; }
      .p-stars { color: var(--gold); font-size: 12px; letter-spacing: 2px; margin-bottom: 12px; }
      .p-price { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 600; color: var(--charcoal); }
      .p-old   { font-size: 13px; color: var(--mist); text-decoration: line-through; margin-left: 8px; }
      .p-disc  { font-size: 10px; font-weight: 700; background: rgba(196,121,111,.12); color: var(--blush); padding: 3px 10px; border-radius: 20px; margin-left: 6px; }
      .p-sold  { font-size: 11px; color: var(--slate); margin-top: 8px; }

      /* Flash sale */
      .flash-section { background: var(--onyx); padding: 80px 6%; }
      .flash-inner { max-width: 1440px; margin: 0 auto; }
      .flash-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 44px; gap: 20px; flex-wrap: wrap; }
      .countdown { display: flex; align-items: center; gap: 10px; }
      .cd-box { background: var(--gold); border-radius: 10px; padding: 10px 14px; min-width: 54px; text-align: center; }
      .cd-num { font-family: 'Playfair Display', serif; font-size: 26px; color: #fff; font-weight: 600; line-height: 1; }
      .cd-lbl { font-size: 8px; letter-spacing: 2px; color: rgba(255,255,255,.7); margin-top: 3px; text-transform: uppercase; }
      .cd-sep { font-size: 24px; color: var(--gold); font-weight: 700; }

      /* Best sellers strip */
      .bs-section { padding: 88px 6%; background: var(--ivory); }
      .bs-inner   { max-width: 1440px; margin: 0 auto; }

      /* General section */
      .gen-section { padding: 88px 6%; }
      .gen-inner   { max-width: 1440px; margin: 0 auto; }

      /* Marquee banner */
      .marquee-wrap { background: var(--gold); overflow: hidden; white-space: nowrap; padding: 14px 0; }
      .marquee-inner { display: inline-block; animation: ticker 20s linear infinite; }
      .marquee-item { display: inline-block; font-family: 'Playfair Display', serif; font-size: 15px; color: #fff; font-style: italic; padding: 0 40px; letter-spacing: 1px; }
      .marquee-dot { color: rgba(255,255,255,.5); }

      /* Footer */
      .footer { background: var(--charcoal); padding: 72px 6% 32px; }
      .footer-inner { max-width: 1440px; margin: 0 auto; }
      .footer-grid { display: grid; grid-template-columns: 1.6fr repeat(3,1fr); gap: 48px; margin-bottom: 60px; }
      .footer-brand { font-family: 'Playfair Display', serif; font-size: 26px; color: var(--gold); margin-bottom: 14px; }
      .footer-desc { font-size: 13px; color: rgba(255,255,255,.42); line-height: 1.9; }
      .footer-col-title { font-size: 9px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: var(--gold); margin-bottom: 20px; }
      .footer-link { font-size: 13px; color: rgba(255,255,255,.45); display: block; margin-bottom: 12px; cursor: pointer; transition: color .2s; }
      .footer-link:hover { color: var(--gold-l); }
      .footer-bottom { border-top: 1px solid rgba(191,160,84,.12); padding-top: 28px; display: flex; justify-content: space-between; align-items: center; }
      .footer-copy { font-size: 12px; color: rgba(255,255,255,.28); }
      .footer-socials { display: flex; gap: 16px; }
      .social-btn { width: 36px; height: 36px; border: 1px solid rgba(191,160,84,.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .3s; color: var(--mist); font-size: 14px; }
      .social-btn:hover { background: var(--gold); border-color: var(--gold); color: #fff; }

      @media (max-width: 768px) {
        .hero-content { left: 5%; bottom: 12%; }
        .stats-inner { grid-template-columns: repeat(2,1fr); }
        .footer-grid { grid-template-columns: 1fr 1fr; }
      }
    `}</style>
  );
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────
function Ico({ d, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
const PATHS = {
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  bag:    "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
  heart:  "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  user:   "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  chevR:  "M9 18l6-6-6-6",
};

// ─── Product Card ────────────────────────────────────────────────────────────
function PCard({ p, cart, setCart, wish, setWish }) {
  const isWish = wish.includes(p.id);
  const disc = Math.round((1 - p.price / p.old) * 100);
  const addCart = () => setCart(c => {
    const ex = c.find(i => i.id === p.id);
    return ex ? c.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...c, { ...p, qty: 1 }];
  });
  const tagClass = { "Flash Sale": "badge-flash", "Best Seller": "badge-best", "New": "badge-new", "Sale": "badge-sale" }[p.tag] || "badge-new";

  return (
    <div className="p-card fade-up">
      <div className="p-img">
        <img src={p.img} alt={p.name} loading="lazy" />
        <div className={`p-badge ${tagClass}`}>{p.tag}</div>
        <button className={`p-wish ${isWish ? "on" : ""}`} onClick={() => setWish(w => isWish ? w.filter(i => i !== p.id) : [...w, p.id])}>
          {isWish ? "♥" : "♡"}
        </button>
        <div className="p-hover-bar">
          <button className="btn-gold" style={{ flex: 1, justifyContent: "center", padding: "10px 0", fontSize: 11 }} onClick={addCart}>
            Add to Cart
          </button>
        </div>
      </div>
      <div className="p-body">
        <div className="p-cat">{p.cat}</div>
        <div className="p-name">{p.name}</div>
        <div className="p-stars">{"★".repeat(p.stars)}{"☆".repeat(5 - p.stars)}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span className="p-price">৳{p.price.toLocaleString()}</span>
          <span className="p-old">৳{p.old.toLocaleString()}</span>
          <span className="p-disc">-{disc}%</span>
        </div>
        <div className="p-sold">🔥 {p.sold} sold this week</div>
      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function Homepage() {
  const [slide, setSlide]   = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const [suggs, setSuggs]   = useState([]);
  const [activeCat, setActiveCat] = useState("All");
  const [cart, setCart]     = useState([]);
  const [wish, setWish]     = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const countdown = useCountdown(4, 22, 18);

  // Auto-advance slider
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  // Scroll detection for header
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 70);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Live search
  const handleSearch = (v) => {
    setSearch(v);
    setSuggs(v.length > 1 ? PRODUCTS.filter(p => p.name.toLowerCase().includes(v.toLowerCase())).slice(0, 5) : []);
  };

  const cartTotal = cart.reduce((a, i) => a + i.qty, 0);
  const filtered = activeCat === "All" ? PRODUCTS : PRODUCTS.filter(p => p.cat === activeCat);

  return (
    <>
      <Styles />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
        <div className="header-inner">
          {/* Logo */}
          <div style={{ cursor: "pointer", flexShrink: 0 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500, lineHeight: 1, background: `linear-gradient(120deg, ${C.goldDark}, ${C.gold}, ${C.goldLight})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Rabeya's
            </div>
            <div style={{ fontSize: 8, letterSpacing: 5, textTransform: "uppercase", color: scrolled ? C.mist : "rgba(255,255,255,.55)", marginTop: -2 }}>Cloth</div>
          </div>

          {/* Search */}
          <div className="search-wrap">
            <input className="search-input" placeholder="Search luxury fashion…" value={search} onChange={e => handleSearch(e.target.value)} />
            <div className="search-icon"><Ico d={PATHS.search} size={18} /></div>
            {suggs.length > 0 && (
              <div className="search-dropdown">
                {suggs.map(s => (
                  <div key={s.id} className="search-item" onClick={() => { setSearch(""); setSuggs([]); }}>
                    <img src={s.img} alt={s.name} style={{ width: 42, height: 42, borderRadius: 10, objectFit: "cover" }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.charcoal }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: C.gold, marginTop: 2 }}>৳{s.price.toLocaleString()}</div>
                    </div>
                    <div style={{ marginLeft: "auto", color: C.mist }}><Ico d={PATHS.chevR} size={16} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nav icons */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
            <button className="nav-icon-btn" style={{ color: scrolled ? C.slate : "rgba(255,255,255,.85)" }}>
              <Ico d={PATHS.user} size={20} />User
            </button>
            <button className="nav-icon-btn" style={{ color: scrolled ? C.slate : "rgba(255,255,255,.85)" }}>
              <Ico d={PATHS.heart} size={20} />
              {wish.length > 0 && <div className="notif">{wish.length}</div>}
              Wish
            </button>
            <button className="nav-icon-btn" style={{ color: scrolled ? C.slate : "rgba(255,255,255,.85)" }} onClick={() => setCartOpen(o => !o)}>
              <Ico d={PATHS.bag} size={20} />
              {cartTotal > 0 && <div className="notif">{cartTotal}</div>}
              Cart
            </button>
          </div>
        </div>
      </header>

      {/* ── Mini Cart Drawer ────────────────────────────────────────────── */}
      {cartOpen && (
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 380, background: "#fff", zIndex: 1000, boxShadow: "-24px 0 64px rgba(0,0,0,.18)", padding: "28px 28px", overflowY: "auto", animation: "fadeIn .3s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: C.charcoal }}>Cart ({cartTotal})</div>
            <button onClick={() => setCartOpen(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.slate }}>✕</button>
          </div>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: C.mist }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22 }}>Your cart is empty</div>
            </div>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} style={{ display: "flex", gap: 14, marginBottom: 20, padding: "14px", background: C.cream, borderRadius: 14 }}>
                  <img src={item.img} style={{ width: 70, height: 70, borderRadius: 10, objectFit: "cover" }} alt={item.name} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.charcoal }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: C.gold, marginTop: 4 }}>৳{item.price.toLocaleString()} × {item.qty}</div>
                  </div>
                  <button onClick={() => setCart(c => c.filter(i => i.id !== item.id))} style={{ background: "none", border: "none", cursor: "pointer", color: C.blush, fontSize: 18 }}>✕</button>
                </div>
              ))}
              <div style={{ borderTop: `1px solid rgba(191,160,84,.2)`, paddingTop: 20, marginTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 20 }}>
                  <span>Total</span>
                  <span style={{ color: C.gold }}>৳{cart.reduce((a, i) => a + i.price * i.qty, 0).toLocaleString()}</span>
                </div>
                <button className="btn-gold" style={{ width: "100%", justifyContent: "center", padding: 15, fontSize: 13 }}>Checkout</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Announcement Ticker ─────────────────────────────────────────── */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {["Free shipping on orders above ৳3000", "New arrivals every Friday", "Luxury packaging on all orders", "Express delivery in 48 hours", "Authentic handloom fabrics", "Easy 15-day returns"].map((t, i) => (
            <span key={i} className="ticker-item">{t}<span>✦</span></span>
          ))}
          {["Free shipping on orders above ৳3000", "New arrivals every Friday", "Luxury packaging on all orders", "Express delivery in 48 hours", "Authentic handloom fabrics", "Easy 15-day returns"].map((t, i) => (
            <span key={"b" + i} className="ticker-item">{t}<span>✦</span></span>
          ))}
        </div>
      </div>

      {/* ── Hero Slider ──────────────────────────────────────────────────── */}
      <div className="hero">
        {SLIDES.map((s, i) => (
          <div key={i} className="hero-slide" style={{ opacity: i === slide ? 1 : 0, pointerEvents: i === slide ? "auto" : "none" }}>
            <img src={s.img} alt={s.title} />
            <div className="hero-overlay" />
          </div>
        ))}
        <div className="hero-content fade-up">
          <div className="hero-eyebrow">{SLIDES[slide].eyebrow}</div>
          <h1 className="hero-title">{SLIDES[slide].title}</h1>
          <p className="hero-sub">{SLIDES[slide].sub}</p>
          <div style={{ display: "flex", gap: 16 }}>
            <button className="btn-gold">{SLIDES[slide].cta}</button>
            <button className="btn-ghost">View Lookbook</button>
          </div>
        </div>
        <div className="hero-dots">
          {SLIDES.map((_, i) => (
            <button key={i} className="hero-dot" onClick={() => setSlide(i)}
              style={{ width: i === slide ? 32 : 10, background: i === slide ? C.gold : "rgba(255,255,255,.35)" }} />
          ))}
        </div>
      </div>

      {/* ── Stats Bar ───────────────────────────────────────────────────── */}
      <div className="stats-bar">
        <div className="stats-inner">
          {[["100%", "Premium Fabrics"], ["12K+", "Happy Customers"], ["500+", "Collections"], ["48hrs", "Express Delivery"]].map(([v, l]) => (
            <div key={l} className="stat-item">
              <div className="stat-val">{v}</div>
              <div className="stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Marquee ─────────────────────────────────────────────────────── */}
      <div className="marquee-wrap">
        <div className="marquee-inner">
          {["Silk", "Banarasi", "Zardozi", "Chikankari", "Georgette", "Kantha", "Jamdani", "Muslin"].flatMap(t => [
            <span key={t} className="marquee-item">{t}</span>,
            <span key={t + "d"} className="marquee-item"><span className="marquee-dot">✦</span></span>
          ])}
          {["Silk", "Banarasi", "Zardozi", "Chikankari", "Georgette", "Kantha", "Jamdani", "Muslin"].flatMap(t => [
            <span key={"b" + t} className="marquee-item">{t}</span>,
            <span key={"b" + t + "d"} className="marquee-item"><span className="marquee-dot">✦</span></span>
          ])}
        </div>
      </div>

      {/* ── Categories ──────────────────────────────────────────────────── */}
      <div className="gen-section">
        <div className="gen-inner">
          <div className="sec-hdr">
            <div className="sec-eyebrow">Browse by Style</div>
            <h2 className="sec-title">Our Collections</h2>
            <div className="sec-rule"><span className="sec-rule-dot">✦</span></div>
          </div>
          <div className="cat-grid">
            {CATEGORIES.map((c, i) => (
              <div key={c.name} className="cat-card fade-up" style={{ animationDelay: `${i * 0.08}s` }}
                onClick={() => setActiveCat(c.name)}>
                <img src={c.img} alt={c.name} loading="lazy" />
                <div className="cat-card-overlay">
                  <div className="cat-card-name">{c.name}</div>
                  <div className="cat-card-count">{c.count} pieces</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Flash Sale ───────────────────────────────────────────────────── */}
      <div className="flash-section">
        <div className="flash-inner">
          <div className="flash-head">
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: C.blush, marginBottom: 8 }}>⚡ Limited Time Offer</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, color: "#fff", fontWeight: 400 }}>Flash Sale</h2>
            </div>
            <div className="countdown">
              {[[countdown.h, "HRS"], [countdown.m, "MIN"], [countdown.s, "SEC"]].map(([v, l], i) => (
                <>
                  {i > 0 && <div className="cd-sep">:</div>}
                  <div key={l} className="cd-box">
                    <div className="cd-num">{String(v).padStart(2, "0")}</div>
                    <div className="cd-lbl">{l}</div>
                  </div>
                </>
              ))}
            </div>
          </div>
          <div className="p-grid">
            {FLASH.map(p => <PCard key={p.id} p={p} cart={cart} setCart={setCart} wish={wish} setWish={setWish} />)}
          </div>
        </div>
      </div>

      {/* ── Best Sellers ─────────────────────────────────────────────────── */}
      <div className="bs-section">
        <div className="bs-inner">
          <div className="sec-hdr">
            <div className="sec-eyebrow">Customer Favourites</div>
            <h2 className="sec-title">Best Sellers</h2>
            <div className="sec-rule"><span className="sec-rule-dot">✦</span></div>
          </div>
          <div className="p-grid">
            {BEST.map(p => <PCard key={p.id} p={p} cart={cart} setCart={setCart} wish={wish} setWish={setWish} />)}
          </div>
        </div>
      </div>

      {/* ── Full Product Gallery ─────────────────────────────────────────── */}
      <div className="gen-section">
        <div className="gen-inner">
          <div className="sec-hdr">
            <div className="sec-eyebrow">The Gallery</div>
            <h2 className="sec-title">All Products</h2>
            <div className="sec-rule"><span className="sec-rule-dot">✦</span></div>
          </div>
          <div className="pill-row">
            {ALL_CATS.map(c => (
              <button key={c} className={`pill ${activeCat === c ? "on" : ""}`} onClick={() => setActiveCat(c)}>{c}</button>
            ))}
          </div>
          <div className="p-grid">
            {filtered.map((p, i) => (
              <div key={p.id} style={{ animationDelay: `${i * 0.07}s` }}>
                <PCard p={p} cart={cart} setCart={setCart} wish={wish} setWish={setWish} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">Rabeya's Cloth</div>
              <p className="footer-desc">Premium fashion for the discerning woman. Every thread tells a story of timeless elegance and artisan craft.</p>
            </div>
            {[
              { title: "Shop", links: ["New Arrivals", "Best Sellers", "Flash Sales", "Gift Cards"] },
              { title: "Help", links: ["Size Guide", "Returns", "Shipping", "FAQ"] },
              { title: "Company", links: ["About Us", "Careers", "Press", "Contact"] },
            ].map(col => (
              <div key={col.title}>
                <div className="footer-col-title">{col.title}</div>
                {col.links.map(l => <a key={l} className="footer-link">{l}</a>)}
              </div>
            ))}
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">© 2025 Rabeya's Cloth. All rights reserved.</div>
            <div className="footer-socials">
              {["f", "✦", "in", "▶"].map((s, i) => (
                <div key={i} className="social-btn">{s}</div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
