/**
 * RABEYA'S CLOTH — Login Page
 * ─────────────────────────────────────────────────────────────
 * Route: /login  (Next.js: pages/login.jsx  or  app/login/page.jsx)
 *
 * Features:
 *  • Email + password login
 *  • "Sign in with Google" (Gmail OAuth via NextAuth or Firebase)
 *  • "Remember me for 30 days" — writes auth token to localStorage
 *    with a 30-day expiry timestamp; checked on every page load
 *  • Redirect to /checkout?return=true or homepage after login
 *  • Blocks checkout access if not authenticated (redirect guard)
 *
 * Auth persistence logic (bottom of file) is framework-agnostic
 * vanilla JS that you can plug into any auth provider callback.
 *
 * Google OAuth setup notes:
 *  1. Create a project in console.cloud.google.com
 *  2. Enable "Google+ API" and create OAuth 2.0 credentials
 *  3. Authorised redirect URI: https://yourdomain.com/api/auth/callback/google
 *  4. With NextAuth: providers: [GoogleProvider({ clientId, clientSecret })]
 *  5. With Firebase: signInWithPopup(auth, new GoogleAuthProvider())
 */

import { useState, useEffect } from "react";

// ─── Auth persistence helpers (30-day session) ───────────────────────────────
// These are exported so checkout.jsx and other pages can import them too.
export const AUTH_KEY = "rc_auth_session";
export const SESSION_DAYS = 30;

export function saveSession(user) {
  const expiry = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(AUTH_KEY, JSON.stringify({ user, expiry }));
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const { user, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) { clearSession(); return null; }
    return user;
  } catch { return null; }
}

export function clearSession() {
  localStorage.removeItem(AUTH_KEY);
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  gold: "#BFA054", goldL: "#E2C97E", goldD: "#7A6330",
  cream: "#FAF7F2", ivory: "#F3EDE3",
  onyx: "#0E0D0C", charcoal: "#1A1917",
  slate: "#5A5751", mist: "#C8C3BB",
  blush: "#C4796F", sage: "#7A9E7E",
};

// ─── Global CSS ───────────────────────────────────────────────────────────────
function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500;600;700&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { height: 100%; }
      body {
        font-family: 'Jost', sans-serif;
        background: ${C.onyx};
        color: ${C.charcoal};
        overflow: hidden;
      }

      /* ─── Animations ─────────────────────────── */
      @keyframes fadeUp    { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
      @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
      @keyframes shimmer   { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }
      @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
      @keyframes kenBurns  { from{transform:scale(1) translate(0,0)} to{transform:scale(1.1) translate(-2%,-2%)} }
      @keyframes ripple    { to{transform:scale(3);opacity:0} }
      @keyframes spin      { to{transform:rotate(360deg)} }
      @keyframes glowPulse { 0%,100%{box-shadow:0 0 0 0 rgba(191,160,84,.4)} 50%{box-shadow:0 0 0 14px rgba(191,160,84,0)} }

      .fade-up { animation: fadeUp .7s cubic-bezier(.25,.46,.45,.94) both; }
      .fade-in { animation: fadeIn .5s ease both; }
      .float   { animation: float 4s ease-in-out infinite; }

      .gold-txt {
        background: linear-gradient(120deg, ${C.goldD}, ${C.gold}, ${C.goldL}, ${C.gold});
        background-size: 300%;
        -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        animation: shimmer 5s linear infinite;
      }

      /* ─── Layout ──────────────────────────────── */
      .page { display: flex; height: 100vh; }

      /* Left panel: full-bleed fashion image */
      .left-panel {
        flex: 1.1; position: relative; overflow: hidden;
        display: flex; flex-direction: column; justify-content: flex-end;
      }
      .left-panel img {
        position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
        animation: kenBurns 14s ease-in-out alternate infinite;
      }
      .left-overlay {
        position: absolute; inset: 0;
        background: linear-gradient(160deg, rgba(10,9,8,.3) 0%, rgba(10,9,8,.75) 100%);
      }
      .left-content { position: relative; z-index: 2; padding: 0 52px 60px; }

      /* Right panel: form */
      .right-panel {
        width: 500px; flex-shrink: 0; background: ${C.cream};
        overflow-y: auto; display: flex; flex-direction: column;
        padding: 0;
      }
      .form-scroll { padding: 52px 52px 72px; flex: 1; display: flex; flex-direction: column; justify-content: center; }

      /* ─── Inputs ──────────────────────────────── */
      .field { margin-bottom: 20px; }
      .lbl {
        display: block; font-size: 9px; font-weight: 700;
        letter-spacing: 2px; text-transform: uppercase;
        color: ${C.slate}; margin-bottom: 9px;
      }
      .inp-wrap { position: relative; }
      .inp {
        width: 100%; background: #fff; border: 1.5px solid rgba(91,87,81,.15);
        border-radius: 14px; padding: 14px 48px 14px 18px;
        font-family: 'Jost', sans-serif; font-size: 14px; color: ${C.charcoal};
        outline: none; transition: border-color .3s, box-shadow .3s;
      }
      .inp:focus {
        border-color: ${C.gold};
        box-shadow: 0 0 0 4px rgba(191,160,84,.1);
      }
      .inp::placeholder { color: ${C.mist}; }
      .inp.error { border-color: ${C.blush}; }
      .inp-icon {
        position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
        color: ${C.mist}; pointer-events: none; font-size: 17px;
      }
      .inp-icon.clickable { pointer-events: auto; cursor: pointer; }
      .inp-icon.clickable:hover { color: ${C.gold}; }
      .err-msg { font-size: 11px; color: ${C.blush}; margin-top: 6px; display: flex; align-items: center; gap: 5px; }

      /* ─── Buttons ─────────────────────────────── */
      .btn-gold {
        width: 100%; padding: 16px; border: none; border-radius: 14px;
        background: linear-gradient(135deg, ${C.goldD}, ${C.gold}, ${C.goldL});
        background-size: 200%; color: #fff;
        font-family: 'Jost', sans-serif; font-weight: 700; font-size: 13px;
        letter-spacing: 2px; text-transform: uppercase; cursor: pointer;
        transition: all .35s cubic-bezier(.25,.46,.45,.94);
        position: relative; overflow: hidden;
        animation: glowPulse 3s ease-in-out infinite;
      }
      .btn-gold:hover {
        background-position: right center;
        transform: translateY(-2px);
        box-shadow: 0 12px 36px rgba(191,160,84,.4);
      }
      .btn-gold:active { transform: translateY(0); }
      .btn-gold:disabled { opacity: .6; cursor: not-allowed; animation: none; }
      /* Ripple on click */
      .btn-gold .ripple {
        position: absolute; border-radius: 50%;
        background: rgba(255,255,255,.35); width: 20px; height: 20px;
        margin-top: -10px; margin-left: -10px; animation: ripple .6s ease;
        pointer-events: none;
      }

      /* Google button */
      .btn-google {
        width: 100%; padding: 14px; border: 1.5px solid rgba(91,87,81,.2);
        border-radius: 14px; background: #fff; cursor: pointer;
        display: flex; align-items: center; justify-content: center; gap: 12px;
        font-family: 'Jost', sans-serif; font-weight: 600; font-size: 13px;
        color: ${C.charcoal}; transition: all .3s;
        box-shadow: 0 2px 12px rgba(0,0,0,.06);
      }
      .btn-google:hover {
        border-color: rgba(191,160,84,.4);
        box-shadow: 0 6px 24px rgba(0,0,0,.1);
        transform: translateY(-1px);
      }
      .google-icon { width: 20px; height: 20px; flex-shrink: 0; }

      /* Divider */
      .divider { display: flex; align-items: center; gap: 14px; margin: 24px 0; }
      .divider::before, .divider::after { content:''; flex:1; height:1px; background:rgba(91,87,81,.15); }
      .divider span { font-size: 11px; color: ${C.mist}; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; white-space: nowrap; }

      /* Checkbox */
      .check-row { display: flex; align-items: center; gap: 12px; cursor: pointer; }
      .check-box {
        width: 20px; height: 20px; border-radius: 6px; flex-shrink: 0;
        border: 1.5px solid rgba(91,87,81,.25); background: #fff;
        display: flex; align-items: center; justify-content: center;
        transition: all .25s; font-size: 12px; color: transparent;
      }
      .check-box.checked { background: ${C.gold}; border-color: ${C.gold}; color: #fff; }
      .check-label { font-size: 13px; color: ${C.slate}; }
      .check-label strong { color: ${C.gold}; }

      /* Loading spinner */
      .spinner { width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; display: inline-block; }

      /* Toast */
      .toast {
        position: fixed; bottom: 28px; right: 28px; z-index: 9999;
        background: ${C.charcoal}; border: 1px solid rgba(191,160,84,.2);
        border-radius: 16px; padding: 16px 22px;
        display: flex; align-items: center; gap: 13px;
        box-shadow: 0 20px 60px rgba(0,0,0,.4);
        animation: fadeUp .4s ease;
      }

      /* Ornamental line */
      .ornament { display: flex; align-items: center; gap: 12px; margin: 8px 0 24px; }
      .ornament::before, .ornament::after { content:''; flex:1; height:1px; background:linear-gradient(to right,transparent,rgba(191,160,84,.5),transparent); }
      .ornament span { color: ${C.gold}; font-size: 14px; }

      /* Floating shapes (left panel decoration) */
      .shape {
        position: absolute; border-radius: 50%; opacity: .08;
        background: ${C.gold};
      }

      /* Auth gate banner */
      .auth-gate {
        background: linear-gradient(135deg, rgba(191,160,84,.12), rgba(191,160,84,.05));
        border: 1px solid rgba(191,160,84,.2); border-radius: 14px;
        padding: 16px 20px; display: flex; align-items: center; gap: 13px;
        margin-bottom: 24px; animation: fadeIn .5s ease;
      }

      @media (max-width: 900px) {
        .left-panel { display: none; }
        .right-panel { width: 100%; }
      }
    `}</style>
  );
}

// ─── Google SVG Icon ──────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg className="google-icon" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// ─── Main Login Component ─────────────────────────────────────────────────────
export default function LoginPage() {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [remember, setRemember]   = useState(true);   // default ON — 30-day session
  const [loading, setLoading]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors]       = useState({});
  const [toast, setToast]         = useState(null);
  const [fromCheckout, setFromCheckout] = useState(false);

  // Check if user was redirected here from checkout (/login?checkout=1)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setFromCheckout(params.get("checkout") === "1");

      // Auto-login if valid session exists
      const existing = loadSession();
      if (existing) {
        // Already logged in — redirect to previous destination
        const dest = params.get("return") || "/";
        window.location.href = dest;
      }
    }
  }, []);

  // ── Form validation ────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!email.trim())           e.email    = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Please enter a valid email";
    if (!password)               e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Email/password login ───────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      /**
       * REAL IMPLEMENTATION (uncomment and replace mock below):
       *
       * Option A — NextAuth credentials:
       *   const result = await signIn("credentials", { email, password, redirect: false });
       *   if (result.error) throw new Error(result.error);
       *   const user = { email, name: email.split("@")[0] };
       *
       * Option B — Firebase:
       *   const { user } = await signInWithEmailAndPassword(auth, email, password);
       *
       * Option C — Custom API:
       *   const res = await fetch("/api/auth/login", { method:"POST", body: JSON.stringify({ email, password }) });
       *   const user = await res.json();
       */

      // ── Mock login (replace with real auth) ──────────────────────────────
      await new Promise(r => setTimeout(r, 1400));  // simulate network
      const mockUser = { id: "usr_001", name: "Customer", email, avatar: null };
      // ── End mock ──────────────────────────────────────────────────────────

      // Persist session to localStorage for 30 days if "remember me" is checked,
      // otherwise use sessionStorage (browser-session only).
      if (remember) {
        saveSession(mockUser);
      } else {
        // Session-only: expires when the tab closes
        sessionStorage.setItem("rc_session_temp", JSON.stringify(mockUser));
      }

      setToast({ type: "success", msg: "Welcome back! Redirecting…" });
      setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        window.location.href = params.get("return") || "/";
      }, 1000);
    } catch (err) {
      setErrors({ global: "Invalid email or password. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth login ─────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      /**
       * REAL IMPLEMENTATION (uncomment one):
       *
       * Option A — NextAuth:
       *   await signIn("google", { callbackUrl: fromCheckout ? "/checkout" : "/" });
       *   // NextAuth handles redirect & session automatically.
       *   // Add to pages/api/auth/[...nextauth].js:
       *   //   providers: [GoogleProvider({ clientId: process.env.GOOGLE_ID, clientSecret: process.env.GOOGLE_SECRET })]
       *
       * Option B — Firebase:
       *   const provider = new GoogleAuthProvider();
       *   const { user } = await signInWithPopup(auth, provider);
       *   const sessionUser = { id: user.uid, name: user.displayName, email: user.email, avatar: user.photoURL };
       *   if (remember) saveSession(sessionUser);
       */

      // ── Mock Google login ─────────────────────────────────────────────────
      await new Promise(r => setTimeout(r, 1600));
      const mockGoogleUser = {
        id: "usr_google_001", name: "Google User",
        email: "user@gmail.com", avatar: null, provider: "google",
      };
      // ── End mock ──────────────────────────────────────────────────────────

      saveSession(mockGoogleUser);  // always 30-day for social login
      setToast({ type: "success", msg: "Signed in with Google! Redirecting…" });
      setTimeout(() => {
        window.location.href = fromCheckout ? "/checkout" : "/";
      }, 900);
    } catch (err) {
      setErrors({ global: "Google sign-in failed. Please try again." });
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── Ripple animation on gold button click ──────────────────────────────────
  const addRipple = (e) => {
    const btn = e.currentTarget;
    const circle = document.createElement("span");
    const rect = btn.getBoundingClientRect();
    circle.className = "ripple";
    circle.style.left = `${e.clientX - rect.left}px`;
    circle.style.top  = `${e.clientY - rect.top}px`;
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  };

  return (
    <>
      <Styles />
      <div className="page">

        {/* ── LEFT PANEL: Editorial fashion image ─────────────────────── */}
        <div className="left-panel">
          <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85" alt="Rabeya's Cloth" />
          <div className="left-overlay" />

          {/* Floating decorative circles */}
          <div className="shape float" style={{ width:320, height:320, top:-80, right:-80, animationDelay:"0s" }} />
          <div className="shape float" style={{ width:180, height:180, bottom:200, left:-60, animationDelay:"1.5s" }} />

          <div className="left-content fade-up">
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:5, textTransform:"uppercase", color:C.goldL, marginBottom:16, display:"flex", alignItems:"center", gap:14 }}>
              <span style={{ display:"block", width:40, height:1, background:C.goldL }} />
              Luxury Fashion
            </div>
            <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:52, fontWeight:400, color:"#fff", lineHeight:1.08, marginBottom:20, textShadow:"0 4px 30px rgba(0,0,0,.3)" }}>
              Draped in<br /><em style={{ fontStyle:"italic", color:C.goldL }}>Pure Elegance</em>
            </h2>
            <p style={{ fontSize:15, color:"rgba(255,255,255,.62)", fontWeight:300, lineHeight:1.7, maxWidth:380 }}>
              Sign in to unlock your personal wishlist, track orders, and enjoy a curated shopping experience.
            </p>

            {/* Trust badges */}
            <div style={{ display:"flex", gap:20, marginTop:40 }}>
              {["🔒 Secure Login", "📦 Order Tracking", "♥ Saved Wishlist"].map(b => (
                <div key={b} style={{ fontSize:12, color:"rgba(255,255,255,.5)", background:"rgba(255,255,255,.06)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,.1)", borderRadius:24, padding:"8px 16px", fontWeight:500 }}>
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Form ────────────────────────────────────────── */}
        <div className="right-panel">
          <div className="form-scroll">

            {/* Brand mark */}
            <div style={{ marginBottom:36, textAlign:"center" }} className="fade-up">
              <div style={{ fontFamily:"'Playfair Display', serif", fontSize:30, fontWeight:500, background:`linear-gradient(120deg,${C.goldD},${C.gold},${C.goldL})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                Rabeya's Cloth
              </div>
              <div className="ornament"><span>✦</span></div>
              <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:28, fontWeight:400, color:C.charcoal, lineHeight:1.2 }}>
                Welcome back
              </h1>
              <p style={{ fontSize:13, color:C.slate, marginTop:8, lineHeight:1.6 }}>Sign in to your account to continue</p>
            </div>

            {/* Auth gate notice (shown when redirected from checkout) */}
            {fromCheckout && (
              <div className="auth-gate">
                <span style={{ fontSize:22 }}>🛍️</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.charcoal }}>Sign in to complete your order</div>
                  <div style={{ fontSize:12, color:C.slate, marginTop:2 }}>Your cart is saved and ready to checkout</div>
                </div>
              </div>
            )}

            {/* Global error */}
            {errors.global && (
              <div style={{ background:"rgba(196,121,111,.1)", border:"1px solid rgba(196,121,111,.25)", borderRadius:12, padding:"14px 16px", marginBottom:20, fontSize:13, color:C.blush, display:"flex", alignItems:"center", gap:10 }}>
                ⚠️ {errors.global}
              </div>
            )}

            {/* Google button */}
            <button className="btn-google fade-up" style={{ animationDelay:".1s" }} onClick={handleGoogleLogin} disabled={googleLoading}>
              {googleLoading ? <div className="spinner" style={{ borderColor:"rgba(0,0,0,.15)", borderTopColor:C.gold }} /> : <GoogleIcon />}
              <span>{googleLoading ? "Signing in…" : "Continue with Google"}</span>
            </button>

            <div className="divider fade-up" style={{ animationDelay:".15s" }}>
              <span>or sign in with email</span>
            </div>

            {/* Email/password form */}
            <form onSubmit={handleLogin} noValidate>
              <div className="field fade-up" style={{ animationDelay:".2s" }}>
                <label className="lbl">Email Address</label>
                <div className="inp-wrap">
                  <input className={`inp ${errors.email ? "error" : ""}`} type="email" placeholder="you@example.com"
                    value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }} />
                  <div className="inp-icon">✉</div>
                </div>
                {errors.email && <div className="err-msg">⚠ {errors.email}</div>}
              </div>

              <div className="field fade-up" style={{ animationDelay:".25s" }}>
                <label className="lbl">Password</label>
                <div className="inp-wrap">
                  <input className={`inp ${errors.password ? "error" : ""}`} type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password} onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }} />
                  <div className="inp-icon clickable" onClick={() => setShowPass(s => !s)}>
                    {showPass ? "🙈" : "👁"}
                  </div>
                </div>
                {errors.password && <div className="err-msg">⚠ {errors.password}</div>}
              </div>

              {/* Remember me + forgot password */}
              <div className="fade-up" style={{ animationDelay:".3s", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
                <div className="check-row" onClick={() => setRemember(r => !r)}>
                  <div className={`check-box ${remember ? "checked" : ""}`}>{remember && "✓"}</div>
                  <div className="check-label">
                    Remember me — <strong>30 days</strong>
                  </div>
                </div>
                <a href="/forgot-password" style={{ fontSize:12, color:C.gold, textDecoration:"none", fontWeight:600, letterSpacing:.5 }}>
                  Forgot password?
                </a>
              </div>

              <button className="btn-gold fade-up" style={{ animationDelay:".35s" }} type="submit" disabled={loading} onClick={addRipple}>
                {loading ? <div className="spinner" /> : "Sign In to Your Account"}
              </button>
            </form>

            {/* Sign up link */}
            <div className="fade-up" style={{ animationDelay:".42s", textAlign:"center", marginTop:28, fontSize:13, color:C.slate }}>
              Don't have an account?{" "}
              <a href="/signup" style={{ color:C.gold, fontWeight:700, textDecoration:"none", borderBottom:`1px solid rgba(191,160,84,.3)`, paddingBottom:1 }}>
                Create one free
              </a>
            </div>

            {/* Compliance note */}
            <div className="fade-up" style={{ animationDelay:".48s", textAlign:"center", marginTop:32, fontSize:11, color:C.mist, lineHeight:1.7 }}>
              By signing in you agree to our{" "}
              <a href="/terms" style={{ color:C.gold, textDecoration:"none" }}>Terms of Service</a>{" "}
              and{" "}
              <a href="/privacy" style={{ color:C.gold, textDecoration:"none" }}>Privacy Policy</a>.
              <br />Sessions are remembered for {SESSION_DAYS} days unless you sign out.
            </div>
          </div>
        </div>
      </div>

      {/* ── Toast notification ─────────────────────────────────────────── */}
      {toast && (
        <div className="toast">
          <span style={{ fontSize:22 }}>{toast.type === "success" ? "✅" : "⚠️"}</span>
          <div style={{ fontSize:14, fontWeight:600, color:"#fff" }}>{toast.msg}</div>
        </div>
      )}
    </>
  );
}
