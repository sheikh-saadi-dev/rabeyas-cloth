/**
 * RABEYA'S CLOTH — Checkout Page
 * ─────────────────────────────────────────────────────────────
 * Route: /checkout  (Next.js: pages/checkout.jsx  or  app/checkout/page.jsx)
 *
 * CRITICAL AUTH LOGIC:
 *  • On mount, reads localStorage for a valid rc_auth_session token
 *  • If no valid session → redirects to /login?checkout=1&return=/checkout
 *  • If session found   → shows the checkout form, pre-fills name/email
 *  • The session expiry is checked every time this page loads
 *
 * CHECKOUT STEPS:
 *  1. Delivery Details  (name, address, city, phone)
 *  2. Payment Method    (cash on delivery, bKash, card)
 *  3. Review & Confirm  (order summary + place order)
 *
 * BROWSER SESSION (30-day persistence):
 *  The auth session is stored as:
 *  localStorage["rc_auth_session"] = { user: {...}, expiry: <unix ms> }
 *  This is set by login/signup. The checkout page only READS it.
 */

import { useState, useEffect } from "react";

// ─── Auth session helpers (same as login.jsx) ─────────────────────────────────
const AUTH_KEY = "rc_auth_session";

function loadSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const { user, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) { localStorage.removeItem(AUTH_KEY); return null; }
    return user;
  } catch { return null; }
}

function clearSession() { localStorage.removeItem(AUTH_KEY); }

// ─── Mock cart (in a real app this comes from context/zustand/redux) ─────────
const MOCK_CART = [
  { id:1, name:"Royal Banarasi Silk",  price:12500, qty:1, cat:"Saree",   img:"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=120&q=80" },
  { id:2, name:"Embroidered Dupatta",  price:2800,  qty:2, cat:"Dupatta", img:"https://images.unsplash.com/photo-1594938298603-c8148c4b4da4?w=120&q=80" },
];

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  gold:"#BFA054", goldL:"#E2C97E", goldD:"#7A6330",
  cream:"#FAF7F2", ivory:"#F3EDE3",
  onyx:"#0E0D0C", charcoal:"#1A1917",
  slate:"#5A5751", mist:"#C8C3BB",
  blush:"#C4796F", sage:"#7A9E7E",
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500;600;700&display=swap');

      *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
      html { scroll-behavior:smooth; }
      body { font-family:'Jost',sans-serif; background:${C.ivory}; color:${C.charcoal}; }
      ::-webkit-scrollbar { width:5px; }
      ::-webkit-scrollbar-thumb { background:${C.gold}; border-radius:3px; }

      /* ─── Animations ──────────────────────────────────────────────────── */
      @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
      @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
      @keyframes shimmer  { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }
      @keyframes spin     { to{transform:rotate(360deg)} }
      @keyframes glowPulse{ 0%,100%{box-shadow:0 0 0 0 rgba(191,160,84,.4)} 50%{box-shadow:0 0 0 14px rgba(191,160,84,0)} }
      @keyframes successPop { 0%{opacity:0;transform:scale(.7)} 60%{transform:scale(1.05)} 100%{opacity:1;transform:scale(1)} }
      @keyframes confetti  { 0%{transform:translateY(0) rotate(0);opacity:1} 100%{transform:translateY(120px) rotate(360deg);opacity:0} }

      .fade-up { animation:fadeUp .65s cubic-bezier(.25,.46,.45,.94) both; }
      .fade-in { animation:fadeIn .4s ease both; }

      .gold-txt {
        background:linear-gradient(120deg,${C.goldD},${C.gold},${C.goldL},${C.gold});
        background-size:300%; -webkit-background-clip:text;
        -webkit-text-fill-color:transparent; background-clip:text;
        animation:shimmer 5s linear infinite;
      }

      /* ─── Auth Gate Screen (shown while checking session) ─────────────── */
      .auth-screen {
        min-height:100vh; display:flex; align-items:center; justify-content:center;
        background:${C.onyx}; flex-direction:column; gap:20px;
      }
      .auth-spinner { width:40px; height:40px; border:3px solid rgba(191,160,84,.2); border-top-color:${C.gold}; border-radius:50%; animation:spin .8s linear infinite; }

      /* ─── Header ──────────────────────────────────────────────────────── */
      .site-header {
        background:#fff; border-bottom:1px solid rgba(191,160,84,.15);
        padding:0 5%; position:sticky; top:0; z-index:100;
        box-shadow:0 2px 20px rgba(0,0,0,.06);
      }
      .header-inner { max-width:1300px; margin:0 auto; height:68px; display:flex; align-items:center; justify-content:space-between; }
      .logo-name { font-family:'Playfair Display',serif; font-size:24px; font-weight:500; background:linear-gradient(120deg,${C.goldD},${C.gold},${C.goldL}); -webkit-background-clip:text; -webkit-text-fill-color:transparent; cursor:pointer; }
      .logo-tag  { font-size:7px; letter-spacing:5px; color:${C.mist}; text-transform:uppercase; margin-top:-4px; }
      .header-user { display:flex; align-items:center; gap:12px; }
      .user-avatar { width:38px; height:38px; background:linear-gradient(135deg,${C.goldD},${C.gold}); border-radius:12px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:15px; }
      .user-name { font-size:13px; font-weight:500; color:${C.charcoal}; }
      .user-email { font-size:11px; color:${C.mist}; }
      .signout-btn { background:none; border:1px solid rgba(91,87,81,.18); border-radius:20px; padding:6px 14px; font-family:'Jost',sans-serif; font-size:11px; color:${C.slate}; cursor:pointer; transition:all .25s; letter-spacing:.5px; }
      .signout-btn:hover { border-color:${C.blush}; color:${C.blush}; }

      /* ─── Progress Stepper ────────────────────────────────────────────── */
      .stepper { display:flex; align-items:center; justify-content:center; padding:28px 0; max-width:500px; margin:0 auto; }
      .step { display:flex; align-items:center; gap:10px; }
      .step-num { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; flex-shrink:0; transition:all .4s; }
      .step-num.done    { background:${C.sage}; color:#fff; }
      .step-num.current { background:${C.gold}; color:#fff; box-shadow:0 4px 18px rgba(191,160,84,.4); }
      .step-num.future  { background:rgba(91,87,81,.1); color:${C.mist}; }
      .step-text { font-size:11px; font-weight:600; letter-spacing:1px; text-transform:uppercase; }
      .step-text.done    { color:${C.sage}; }
      .step-text.current { color:${C.gold}; }
      .step-text.future  { color:${C.mist}; }
      .step-line { width:60px; height:1px; background:rgba(91,87,81,.18); margin:0 8px; flex-shrink:0; }
      .step-line.done { background:${C.sage}; }

      /* ─── Main layout ─────────────────────────────────────────────────── */
      .checkout-wrap { max-width:1200px; margin:0 auto; padding:0 5% 80px; display:grid; grid-template-columns:1fr 400px; gap:40px; align-items:start; }

      /* ─── Form cards ──────────────────────────────────────────────────── */
      .form-card { background:#fff; border-radius:20px; padding:32px; box-shadow:0 4px 28px rgba(0,0,0,.07); margin-bottom:24px; border:1px solid rgba(191,160,84,.08); }
      .card-title { font-family:'Playfair Display',serif; font-size:22px; color:${C.charcoal}; margin-bottom:4px; }
      .card-sub { font-size:12px; color:${C.slate}; margin-bottom:28px; }

      /* ─── Fields ──────────────────────────────────────────────────────── */
      .field { margin-bottom:18px; }
      .field:last-child { margin-bottom:0; }
      .lbl { display:block; font-size:9px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:${C.slate}; margin-bottom:8px; }
      .inp-wrap { position:relative; }
      .inp {
        width:100%; background:${C.ivory}; border:1.5px solid rgba(91,87,81,.14);
        border-radius:12px; padding:13px 16px;
        font-family:'Jost',sans-serif; font-size:14px; color:${C.charcoal};
        outline:none; transition:border-color .3s, box-shadow .3s;
      }
      .inp:focus { border-color:${C.gold}; box-shadow:0 0 0 4px rgba(191,160,84,.1); background:#fff; }
      .inp::placeholder { color:${C.mist}; }
      .inp.error { border-color:${C.blush}; }
      .inp-prefix-wrap { display:flex; background:${C.ivory}; border:1.5px solid rgba(91,87,81,.14); border-radius:12px; overflow:hidden; transition:border-color .3s; }
      .inp-prefix-wrap:focus-within { border-color:${C.gold}; box-shadow:0 0 0 4px rgba(191,160,84,.1); }
      .prefix-label { padding:0 14px; background:rgba(191,160,84,.06); border-right:1px solid rgba(91,87,81,.12); font-size:13px; font-weight:600; color:${C.gold}; display:flex; align-items:center; }
      .inp-bare { flex:1; background:transparent; border:none; padding:13px 14px; font-family:'Jost',sans-serif; font-size:14px; color:${C.charcoal}; outline:none; }
      .inp-bare::placeholder { color:${C.mist}; }
      .err-msg { font-size:11px; color:${C.blush}; margin-top:5px; }

      .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
      .grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }

      /* ─── Payment options ─────────────────────────────────────────────── */
      .pay-option { display:flex; align-items:center; gap:16px; padding:18px 20px; border:1.5px solid rgba(91,87,81,.14); border-radius:16px; cursor:pointer; transition:all .3s; background:${C.ivory}; margin-bottom:12px; }
      .pay-option.selected { border-color:${C.gold}; background:rgba(191,160,84,.05); }
      .pay-option:hover:not(.selected) { border-color:rgba(191,160,84,.3); }
      .pay-radio { width:20px; height:20px; border-radius:50%; border:2px solid rgba(91,87,81,.25); display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .25s; }
      .pay-radio.on { border-color:${C.gold}; }
      .pay-radio.on::after { content:''; width:10px; height:10px; background:${C.gold}; border-radius:50%; }
      .pay-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
      .pay-name { font-size:14px; font-weight:600; color:${C.charcoal}; }
      .pay-desc { font-size:12px; color:${C.slate}; margin-top:2px; }
      .pay-badge { margin-left:auto; font-size:10px; font-weight:700; padding:3px 10px; border-radius:20px; }

      /* Card input area */
      .card-fields { background:${C.ivory}; border-radius:14px; padding:20px; margin-top:12px; border:1px solid rgba(91,87,81,.1); animation:fadeIn .35s ease; }

      /* ─── Order summary (sticky right) ───────────────────────────────── */
      .summary-card { background:#fff; border-radius:20px; padding:28px; box-shadow:0 4px 28px rgba(0,0,0,.07); position:sticky; top:90px; border:1px solid rgba(191,160,84,.1); }
      .summary-title { font-family:'Playfair Display',serif; font-size:22px; color:${C.charcoal}; margin-bottom:24px; }
      .cart-item { display:flex; gap:14px; margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid rgba(91,87,81,.08); align-items:flex-start; }
      .cart-item:last-child { border-bottom:none; }
      .item-img { width:64px; height:64px; border-radius:12px; object-fit:cover; flex-shrink:0; }
      .item-name { font-size:13px; font-weight:500; color:${C.charcoal}; margin-bottom:3px; }
      .item-cat  { font-size:10px; color:${C.gold}; letter-spacing:1.5px; text-transform:uppercase; }
      .item-qty  { font-size:11px; color:${C.slate}; margin-top:3px; }
      .item-price { font-family:'Playfair Display',serif; font-size:17px; color:${C.charcoal}; margin-left:auto; white-space:nowrap; }
      .summary-row { display:flex; justify-content:space-between; padding:8px 0; font-size:13px; color:${C.slate}; }
      .summary-divider { height:1px; background:rgba(191,160,84,.12); margin:8px 0; }
      .summary-total { display:flex; justify-content:space-between; }
      .total-label { font-family:'Playfair Display',serif; font-size:20px; color:${C.charcoal}; }
      .total-amount { font-family:'Playfair Display',serif; font-size:24px; font-weight:600; color:${C.gold}; }
      .promo-wrap { display:flex; gap:10px; margin-bottom:20px; }
      .promo-inp { flex:1; background:${C.ivory}; border:1.5px solid rgba(191,160,84,.2); border-radius:12px; padding:11px 14px; font-family:'Jost',sans-serif; font-size:13px; color:${C.charcoal}; outline:none; transition:border-color .3s; }
      .promo-inp:focus { border-color:${C.gold}; }
      .promo-inp::placeholder { color:${C.mist}; }
      .promo-btn { padding:11px 20px; background:transparent; border:1.5px solid rgba(191,160,84,.3); border-radius:12px; font-family:'Jost',sans-serif; font-size:12px; font-weight:600; color:${C.gold}; cursor:pointer; transition:all .25s; letter-spacing:.8px; }
      .promo-btn:hover { background:rgba(191,160,84,.1); }

      /* ─── Place order button ───────────────────────────────────────────── */
      .btn-place {
        width:100%; padding:17px; border:none; border-radius:14px;
        background:linear-gradient(135deg,${C.goldD},${C.gold},${C.goldL});
        background-size:200%; color:#fff;
        font-family:'Jost',sans-serif; font-weight:700; font-size:13px;
        letter-spacing:2px; text-transform:uppercase; cursor:pointer;
        transition:all .35s; animation:glowPulse 3s ease-in-out infinite;
        margin-top:20px;
      }
      .btn-place:hover { background-position:right center; transform:translateY(-2px); box-shadow:0 12px 36px rgba(191,160,84,.38); animation:none; }
      .btn-place:disabled { opacity:.6; cursor:not-allowed; animation:none; }

      .btn-back { background:none; border:1.5px solid rgba(91,87,81,.18); border-radius:14px; padding:13px 24px; font-family:'Jost',sans-serif; font-size:12px; font-weight:600; color:${C.slate}; cursor:pointer; transition:all .3s; letter-spacing:1px; text-transform:uppercase; }
      .btn-back:hover { border-color:rgba(191,160,84,.4); color:${C.gold}; }
      .btn-next { padding:13px 32px; border:none; border-radius:14px; background:linear-gradient(135deg,${C.goldD},${C.gold}); color:#fff; font-family:'Jost',sans-serif; font-weight:700; font-size:12px; letter-spacing:1.8px; text-transform:uppercase; cursor:pointer; transition:all .35s; }
      .btn-next:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(191,160,84,.35); }

      /* ─── Success screen ──────────────────────────────────────────────── */
      .success-screen { min-height:100vh; display:flex; align-items:center; justify-content:center; background:${C.cream}; }
      .success-card { text-align:center; max-width:560px; padding:60px 52px; background:#fff; border-radius:28px; box-shadow:0 24px 80px rgba(0,0,0,.1); border:1px solid rgba(191,160,84,.12); animation:successPop .7s cubic-bezier(.34,1.56,.64,1); position:relative; overflow:hidden; }
      .success-icon { width:80px; height:80px; background:linear-gradient(135deg,${C.goldD},${C.gold}); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:36px; margin:0 auto 24px; }
      .confetti-dot { position:absolute; width:8px; height:8px; border-radius:50%; }

      /* ─── Security badges ─────────────────────────────────────────────── */
      .trust-row { display:flex; justify-content:center; gap:16px; flex-wrap:wrap; margin-top:20px; }
      .trust-item { font-size:11px; color:${C.slate}; display:flex; align-items:center; gap:5px; }

      /* ─── Spinner ──────────────────────────────────────────────────────── */
      .spinner { width:20px; height:20px; border:2.5px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; display:inline-block; }

      @media (max-width:960px) {
        .checkout-wrap { grid-template-columns:1fr; }
        .summary-card { position:static; }
      }
    `}</style>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function Stepper({ current }) {
  const steps = ["Delivery", "Payment", "Review"];
  return (
    <div className="stepper">
      {steps.map((label, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "current" : "future";
        return (
          <div key={label} className="step">
            {i > 0 && <div className={`step-line ${n <= current ? "done" : ""}`} />}
            <div className={`step-num ${state}`}>{state === "done" ? "✓" : n}</div>
            <div className={`step-text ${state}`}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Confetti decoration ──────────────────────────────────────────────────────
function Confetti() {
  const dots = [
    { left:"15%", top:"10%", bg:C.gold,  delay:"0s"  },
    { left:"85%", top:"8%",  bg:C.blush, delay:".1s" },
    { left:"25%", top:"5%",  bg:C.sage,  delay:".2s" },
    { left:"75%", top:"12%", bg:C.goldL, delay:".15s"},
    { left:"50%", top:"3%",  bg:C.gold,  delay:".05s"},
    { left:"40%", top:"7%",  bg:C.blush, delay:".3s" },
    { left:"60%", top:"6%",  bg:C.sage,  delay:".25s"},
  ];
  return dots.map((d, i) => (
    <div key={i} className="confetti-dot"
      style={{ left:d.left, top:d.top, background:d.bg, animation:`confetti 1.2s ${d.delay} ease forwards` }} />
  ));
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CheckoutPage() {
  /* ── Auth state ── */
  const [authState, setAuthState] = useState("checking"); // "checking" | "ok" | "denied"
  const [user, setUser]           = useState(null);

  /* ── Cart ── */
  const [cart] = useState(MOCK_CART);
  // In real app: const { cart } = useCart();

  /* ── Multi-step ── */
  const [step, setStep]     = useState(1);
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  /* ── Form: Delivery ── */
  const [delivery, setDelivery] = useState({ fullName:"", phone:"", address:"", city:"", area:"", notes:"" });
  const [deliveryErrors, setDeliveryErrors] = useState({});

  /* ── Form: Payment ── */
  const [payMethod, setPayMethod] = useState("cod");
  const [card, setCard]           = useState({ number:"", name:"", expiry:"", cvv:"" });
  const [bkash, setBkash]         = useState({ number:"", txn:"" });
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  // ── CRITICAL: Check auth session on mount ────────────────────────────────
  // This is the guard that blocks unauthenticated users from checkout.
  useEffect(() => {
    const sessionUser = loadSession();
    if (!sessionUser) {
      // No valid session — save return URL and redirect to login
      // The ?checkout=1 parameter tells the login page to show a special banner
      // The ?return=/checkout tells login where to send the user after sign-in
      setTimeout(() => {
        window.location.href = "/login?checkout=1&return=/checkout";
      }, 1200); // small delay so user sees the "checking" animation
      setAuthState("denied");
    } else {
      setUser(sessionUser);
      // Pre-fill delivery name from user profile
      setDelivery(d => ({ ...d, fullName: sessionUser.name || "" }));
      setAuthState("ok");
    }
  }, []);

  // ── Pricing calculations ─────────────────────────────────────────────────
  const subtotal  = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const shipping  = subtotal >= 5000 ? 0 : 120;
  const packaging = 150;  // luxury packaging fee
  const discount  = promoApplied ? Math.round(subtotal * 0.1) : 0;  // 10% promo
  const total     = subtotal + shipping + packaging - discount;

  // ── Delivery validation ──────────────────────────────────────────────────
  const validateDelivery = () => {
    const e = {};
    if (!delivery.fullName.trim())    e.fullName = "Full name required";
    if (!delivery.phone.trim())       e.phone    = "Phone number required";
    else if (!/^01[3-9]\d{8}$/.test(delivery.phone.replace(/\s/g,""))) e.phone = "Enter a valid BD number (01XXXXXXXXX)";
    if (!delivery.address.trim())     e.address  = "Delivery address required";
    if (!delivery.city.trim())        e.city     = "City required";
    setDeliveryErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && !validateDelivery()) return;
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Place order ──────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      /**
       * REAL IMPLEMENTATION — call your orders API:
       *   const res = await fetch("/api/orders", {
       *     method: "POST",
       *     headers: { "Content-Type": "application/json" },
       *     body: JSON.stringify({ userId: user.id, cart, delivery, payMethod, total }),
       *   });
       *   const { orderId } = await res.json();
       */

      // ── Mock: simulate order creation (replace with real API) ─────────
      await new Promise(r => setTimeout(r, 2000));
      const newOrderId = `#RC-${Math.floor(2000 + Math.random() * 9000)}`;
      // ── End mock ────────────────────────────────────────────────────────

      setOrderId(newOrderId);
      setSuccess(true);
    } catch (err) {
      alert("Order failed. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === "RABEYA10") {
      setPromoApplied(true);
    } else {
      alert("Invalid promo code.");
    }
  };

  // ── AUTH CHECKING SCREEN ──────────────────────────────────────────────────
  // Shown for ~1.2s while we verify the localStorage token
  if (authState === "checking" || authState === "denied") {
    return (
      <>
        <Styles />
        <div className="auth-screen">
          <div className="auth-spinner" />
          <div style={{ fontFamily:"'Playfair Display', serif", fontSize:20, color:C.gold }}>
            {authState === "denied" ? "Redirecting to sign in…" : "Verifying your session…"}
          </div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,.35)", marginTop:-8 }}>
            {authState === "denied" ? "Please sign in to continue checkout" : "One moment please"}
          </div>
        </div>
      </>
    );
  }

  // ── SUCCESS SCREEN ────────────────────────────────────────────────────────
  if (success) {
    return (
      <>
        <Styles />
        <div className="success-screen">
          <div className="success-card">
            <Confetti />
            <div className="success-icon">🎉</div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:34, color:C.charcoal, marginBottom:8 }}>
              Order Placed!
            </h1>
            <div style={{ fontSize:13, color:C.slate, lineHeight:1.7, marginBottom:20 }}>
              Thank you, <strong style={{ color:C.gold }}>{user?.name}</strong>! Your order <strong>{orderId}</strong> has been confirmed.<br/>
              You'll receive an SMS + email confirmation shortly.
            </div>
            <div style={{ background:C.ivory, borderRadius:16, padding:"16px 24px", marginBottom:28, display:"inline-block" }}>
              <div style={{ fontSize:11, color:C.mist, letterSpacing:1.5, textTransform:"uppercase", marginBottom:4 }}>Order Total</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:32, color:C.gold }}>৳{total.toLocaleString()}</div>
            </div>
            <div>
              <button className="btn-next" style={{ width:"100%", marginBottom:12 }} onClick={() => window.location.href="/"}>
                Continue Shopping
              </button>
              <button className="btn-back" style={{ width:"100%" }} onClick={() => window.location.href="/orders"}>
                Track My Order
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── MAIN CHECKOUT UI ──────────────────────────────────────────────────────
  return (
    <>
      <Styles />

      {/* Header */}
      <header className="site-header">
        <div className="header-inner">
          <div onClick={() => window.location.href="/"}>
            <div className="logo-name">Rabeya's Cloth</div>
            <div className="logo-tag">Secure Checkout</div>
          </div>
          {/* Logged-in user indicator */}
          <div className="header-user">
            <div className="user-avatar">
              {user?.avatar
                ? <img src={user.avatar} style={{ width:"100%", borderRadius:12 }} alt="" />
                : (user?.name?.[0] || "U")}
            </div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
            <button className="signout-btn" onClick={() => { clearSession(); window.location.href="/login"; }}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Stepper */}
      <Stepper current={step} />

      {/* Main grid */}
      <div className="checkout-wrap">

        {/* ── LEFT: Form steps ───────────────────────────────────────────── */}
        <div>

          {/* ── STEP 1: Delivery Details ──────────────────────────────── */}
          {step === 1 && (
            <div className="fade-up">
              <div className="form-card">
                <div className="card-title">Delivery Details</div>
                <div className="card-sub">Where should we send your order?</div>

                <div className="grid-2">
                  <div className="field">
                    <label className="lbl">Full Name <span style={{ color:C.blush }}>*</span></label>
                    <input className={`inp ${deliveryErrors.fullName ? "error" : ""}`}
                      placeholder="Fatima Khan"
                      value={delivery.fullName}
                      onChange={e => setDelivery(d => ({ ...d, fullName:e.target.value }))} />
                    {deliveryErrors.fullName && <div className="err-msg">⚠ {deliveryErrors.fullName}</div>}
                  </div>
                  <div className="field">
                    <label className="lbl">Phone Number <span style={{ color:C.blush }}>*</span></label>
                    <div className="inp-prefix-wrap">
                      <div className="prefix-label">+880</div>
                      <input className="inp-bare"
                        placeholder="01XXXXXXXXX"
                        value={delivery.phone}
                        onChange={e => setDelivery(d => ({ ...d, phone:e.target.value }))} />
                    </div>
                    {deliveryErrors.phone && <div className="err-msg">⚠ {deliveryErrors.phone}</div>}
                  </div>
                </div>

                <div className="field">
                  <label className="lbl">Street Address <span style={{ color:C.blush }}>*</span></label>
                  <input className={`inp ${deliveryErrors.address ? "error" : ""}`}
                    placeholder="House no, road, block, area"
                    value={delivery.address}
                    onChange={e => setDelivery(d => ({ ...d, address:e.target.value }))} />
                  {deliveryErrors.address && <div className="err-msg">⚠ {deliveryErrors.address}</div>}
                </div>

                <div className="grid-3">
                  <div className="field">
                    <label className="lbl">City <span style={{ color:C.blush }}>*</span></label>
                    <select className="inp" style={{ appearance:"none" }}
                      value={delivery.city}
                      onChange={e => setDelivery(d => ({ ...d, city:e.target.value }))}>
                      <option value="">Select city</option>
                      {["Dhaka","Chittagong","Sylhet","Rajshahi","Khulna","Barishal","Comilla","Narsingdi"].map(c => <option key={c}>{c}</option>)}
                    </select>
                    {deliveryErrors.city && <div className="err-msg">⚠ {deliveryErrors.city}</div>}
                  </div>
                  <div className="field">
                    <label className="lbl">Area / Thana</label>
                    <input className="inp" placeholder="e.g. Gulshan" value={delivery.area}
                      onChange={e => setDelivery(d => ({ ...d, area:e.target.value }))} />
                  </div>
                  <div className="field">
                    <label className="lbl">Postal Code</label>
                    <input className="inp" placeholder="1212" />
                  </div>
                </div>

                <div className="field">
                  <label className="lbl">Delivery Notes <span style={{ fontSize:9, color:C.mist }}>(optional)</span></label>
                  <textarea className="inp" rows={3} style={{ resize:"vertical" }}
                    placeholder="Apartment floor, landmark, preferred delivery time…"
                    value={delivery.notes}
                    onChange={e => setDelivery(d => ({ ...d, notes:e.target.value }))} />
                </div>
              </div>

              <div style={{ display:"flex", justifyContent:"flex-end" }}>
                <button className="btn-next" onClick={handleNextStep}>Continue to Payment →</button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Payment Method ─────────────────────────────────── */}
          {step === 2 && (
            <div className="fade-up">
              <div className="form-card">
                <div className="card-title">Payment Method</div>
                <div className="card-sub">Choose your preferred way to pay</div>

                {/* Cash on Delivery */}
                <div className={`pay-option ${payMethod === "cod" ? "selected" : ""}`} onClick={() => setPayMethod("cod")}>
                  <div className={`pay-radio ${payMethod === "cod" ? "on" : ""}`} />
                  <div className="pay-icon" style={{ background:"rgba(122,158,126,.12)" }}>💵</div>
                  <div>
                    <div className="pay-name">Cash on Delivery</div>
                    <div className="pay-desc">Pay in cash when your order arrives</div>
                  </div>
                  <div className="pay-badge" style={{ background:"rgba(122,158,126,.12)", color:C.sage }}>Most Popular</div>
                </div>

                {/* bKash */}
                <div className={`pay-option ${payMethod === "bkash" ? "selected" : ""}`} onClick={() => setPayMethod("bkash")}>
                  <div className={`pay-radio ${payMethod === "bkash" ? "on" : ""}`} />
                  <div className="pay-icon" style={{ background:"rgba(226,0,116,.08)" }}>📱</div>
                  <div>
                    <div className="pay-name">bKash</div>
                    <div className="pay-desc">Mobile banking — instant confirmation</div>
                  </div>
                  <div className="pay-badge" style={{ background:"rgba(226,0,116,.08)", color:"#e20074", fontSize:10, fontWeight:700 }}>bKash</div>
                </div>
                {payMethod === "bkash" && (
                  <div className="card-fields">
                    <div className="grid-2">
                      <div className="field">
                        <label className="lbl">bKash Number</label>
                        <input className="inp" placeholder="01XXXXXXXXX" value={bkash.number}
                          onChange={e => setBkash(b => ({ ...b, number:e.target.value }))} />
                      </div>
                      <div className="field">
                        <label className="lbl">Transaction ID</label>
                        <input className="inp" placeholder="TXN ID after payment" value={bkash.txn}
                          onChange={e => setBkash(b => ({ ...b, txn:e.target.value }))} />
                      </div>
                    </div>
                    <div style={{ fontSize:12, color:C.slate, background:`rgba(191,160,84,.06)`, borderRadius:10, padding:"10px 14px" }}>
                      📞 Send money to <strong style={{ color:C.gold }}>01XXXXXXXXX</strong> with order ID as reference, then enter the transaction ID above.
                    </div>
                  </div>
                )}

                {/* Card */}
                <div className={`pay-option ${payMethod === "card" ? "selected" : ""}`} onClick={() => setPayMethod("card")}>
                  <div className={`pay-radio ${payMethod === "card" ? "on" : ""}`} />
                  <div className="pay-icon" style={{ background:"rgba(66,133,244,.08)" }}>💳</div>
                  <div>
                    <div className="pay-name">Debit / Credit Card</div>
                    <div className="pay-desc">Visa, Mastercard, AMEX — SSL secured</div>
                  </div>
                  <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
                    {["V","M","A"].map(b => (
                      <div key={b} style={{ width:28, height:20, background:C.ivory, border:`1px solid rgba(91,87,81,.15)`, borderRadius:4, fontSize:9, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", color:C.slate }}>{b}</div>
                    ))}
                  </div>
                </div>
                {payMethod === "card" && (
                  <div className="card-fields">
                    <div className="field">
                      <label className="lbl">Card Number</label>
                      <input className="inp" placeholder="1234 5678 9012 3456" maxLength={19}
                        value={card.number} onChange={e => {
                          const v = e.target.value.replace(/\D/g,"").slice(0,16);
                          setCard(c => ({ ...c, number: v.replace(/(.{4})/g,"$1 ").trim() }));
                        }} />
                    </div>
                    <div className="field">
                      <label className="lbl">Name on Card</label>
                      <input className="inp" placeholder="FATIMA KHAN"
                        value={card.name} onChange={e => setCard(c => ({ ...c, name:e.target.value.toUpperCase() }))} />
                    </div>
                    <div className="grid-2">
                      <div className="field">
                        <label className="lbl">Expiry Date</label>
                        <input className="inp" placeholder="MM / YY" maxLength={7}
                          value={card.expiry} onChange={e => {
                            let v = e.target.value.replace(/\D/g,"").slice(0,4);
                            if (v.length > 2) v = v.slice(0,2) + " / " + v.slice(2);
                            setCard(c => ({ ...c, expiry:v }));
                          }} />
                      </div>
                      <div className="field">
                        <label className="lbl">CVV</label>
                        <input className="inp" placeholder="•••" maxLength={4} type="password"
                          value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv:e.target.value.replace(/\D/g,"").slice(0,4) }))} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-next" onClick={handleNextStep}>Review Order →</button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Review & Confirm ───────────────────────────────── */}
          {step === 3 && (
            <div className="fade-up">
              {/* Delivery summary */}
              <div className="form-card">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                  <div className="card-title" style={{ marginBottom:0 }}>Delivery Address</div>
                  <button onClick={() => setStep(1)} style={{ background:"none", border:"none", color:C.gold, fontSize:13, fontWeight:600, cursor:"pointer" }}>Edit</button>
                </div>
                <div style={{ background:C.ivory, borderRadius:14, padding:"16px 20px", fontSize:13, lineHeight:1.8, color:C.slate }}>
                  <div style={{ fontWeight:600, color:C.charcoal, fontSize:15, marginBottom:4 }}>{delivery.fullName}</div>
                  <div>{delivery.address}{delivery.area && `, ${delivery.area}`}</div>
                  <div>{delivery.city}</div>
                  <div style={{ color:C.gold, fontWeight:500, marginTop:4 }}>📞 +880 {delivery.phone}</div>
                  {delivery.notes && <div style={{ marginTop:8, fontStyle:"italic", color:C.mist }}>{delivery.notes}</div>}
                </div>
              </div>

              {/* Payment summary */}
              <div className="form-card">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <div className="card-title" style={{ marginBottom:0 }}>Payment</div>
                  <button onClick={() => setStep(2)} style={{ background:"none", border:"none", color:C.gold, fontSize:13, fontWeight:600, cursor:"pointer" }}>Edit</button>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:12, background:C.ivory, borderRadius:14, padding:"14px 18px" }}>
                  <div style={{ fontSize:24 }}>
                    {payMethod === "cod" ? "💵" : payMethod === "bkash" ? "📱" : "💳"}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:C.charcoal }}>
                      {payMethod === "cod" ? "Cash on Delivery" : payMethod === "bkash" ? `bKash — ${bkash.number}` : `Card ending ${card.number.slice(-4)}`}
                    </div>
                    <div style={{ fontSize:12, color:C.sage }}>✅ Payment method confirmed</div>
                  </div>
                </div>
              </div>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <button className="btn-back" onClick={() => setStep(2)}>← Back</button>
              </div>

              <button className="btn-place" onClick={handlePlaceOrder} disabled={placing}>
                {placing ? <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12 }}><div className="spinner" /> Processing your order…</div>
                  : `Place Order • ৳${total.toLocaleString()}`}
              </button>

              <div className="trust-row">
                {["🔒 SSL Secured", "📦 Free Returns", "✅ Verified Seller", "🚚 Fast Delivery"].map(t => (
                  <div key={t} className="trust-item">{t}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Sticky order summary ────────────────────────────────── */}
        <div>
          <div className="summary-card fade-up" style={{ animationDelay:".12s" }}>
            <div className="summary-title">Your Order</div>

            {/* Cart items */}
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <img className="item-img" src={item.img} alt={item.name} loading="lazy" />
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="item-name">{item.name}</div>
                  <div className="item-cat">{item.cat}</div>
                  <div className="item-qty">Qty: {item.qty}</div>
                </div>
                <div className="item-price">৳{(item.price * item.qty).toLocaleString()}</div>
              </div>
            ))}

            {/* Promo code */}
            <div className="promo-wrap">
              <input className="promo-inp" placeholder="Promo code (try RABEYA10)"
                value={promoCode} onChange={e => setPromoCode(e.target.value)} disabled={promoApplied} />
              <button className="promo-btn" onClick={applyPromo} disabled={promoApplied}>
                {promoApplied ? "✓ Applied" : "Apply"}
              </button>
            </div>

            {/* Price breakdown */}
            <div className="summary-divider" />
            <div className="summary-row"><span>Subtotal</span><span>৳{subtotal.toLocaleString()}</span></div>
            <div className="summary-row">
              <span>Shipping</span>
              <span style={{ color:shipping === 0 ? C.sage : undefined }}>
                {shipping === 0 ? "✓ Free" : `৳${shipping}`}
              </span>
            </div>
            <div className="summary-row"><span>Luxury Packaging</span><span>৳{packaging}</span></div>
            {promoApplied && (
              <div className="summary-row" style={{ color:C.sage }}>
                <span>🎉 Promo (RABEYA10)</span><span>-৳{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="summary-divider" />
            <div className="summary-total">
              <div className="total-label">Total</div>
              <div className="total-amount">৳{total.toLocaleString()}</div>
            </div>

            {/* Estimated delivery */}
            <div style={{ background:C.ivory, borderRadius:14, padding:"14px 16px", marginTop:20, display:"flex", gap:12, alignItems:"flex-start" }}>
              <div style={{ fontSize:22 }}>🚚</div>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:C.charcoal }}>Estimated Delivery</div>
                <div style={{ fontSize:12, color:C.gold, fontWeight:700, marginTop:2 }}>3–5 Business Days</div>
                <div style={{ fontSize:11, color:C.slate, marginTop:2 }}>Express: 48 hours available at checkout</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
