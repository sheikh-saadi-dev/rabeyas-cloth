/**
 * RABEYA'S CLOTH — Sign Up Page
 * ─────────────────────────────────────────────────────────────
 * Route: /signup  (Next.js: pages/signup.jsx  or  app/signup/page.jsx)
 *
 * Features:
 *  • Full name, email, password, confirm-password registration
 *  • "Sign up with Google" (one-click, pre-fills name + email)
 *  • Client-side real-time field validation with inline error messages
 *  • Password strength meter (visual bar)
 *  • On success: saves 30-day session to localStorage, redirects
 *  • Imports saveSession() from login.jsx — shared auth utility
 */

import { useState, useEffect, useRef } from "react";
// In a real project: import { saveSession } from "./5-login";
// Inlined here so this file is self-contained:

const AUTH_KEY = "rc_auth_session";
const SESSION_DAYS = 30;
function saveSession(user) {
  const expiry = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(AUTH_KEY, JSON.stringify({ user, expiry }));
}
function loadSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const { user, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) { localStorage.removeItem(AUTH_KEY); return null; }
    return user;
  } catch { return null; }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function passwordStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: "Too short",  color: "#C4796F" },
    { label: "Weak",       color: "#C4796F" },
    { label: "Fair",       color: "#E8C97E" },
    { label: "Good",       color: "#7A9E7E" },
    { label: "Strong",     color: "#7A9E7E" },
    { label: "Excellent",  color: "#7A9E7E" },
  ];
  return { score, ...levels[Math.min(score, 5)] };
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  gold: "#BFA054", goldL: "#E2C97E", goldD: "#7A6330",
  cream: "#FAF7F2", ivory: "#F3EDE3",
  onyx: "#0E0D0C", charcoal: "#1A1917",
  slate: "#5A5751", mist: "#C8C3BB",
  blush: "#C4796F", sage: "#7A9E7E",
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500;600;700&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
      html, body { height:100%; }
      body { font-family:'Jost',sans-serif; background:${C.onyx}; color:${C.charcoal}; }

      @keyframes fadeUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
      @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
      @keyframes shimmer   { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }
      @keyframes kenBurns  { from{transform:scale(1)} to{transform:scale(1.1)} }
      @keyframes spin      { to{transform:rotate(360deg)} }
      @keyframes barFill   { from{width:0} to{width:var(--w)} }
      @keyframes float     { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-10px) rotate(3deg)} }
      @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }
      @keyframes glowPulse { 0%,100%{box-shadow:0 0 0 0 rgba(191,160,84,.4)} 50%{box-shadow:0 0 0 14px rgba(191,160,84,0)} }
      @keyframes checkBounce { 0%{transform:scale(0) rotate(-10deg)} 70%{transform:scale(1.2) rotate(3deg)} 100%{transform:scale(1)} }

      .fade-up { animation: fadeUp .7s cubic-bezier(.25,.46,.45,.94) both; }

      .gold-txt {
        background: linear-gradient(120deg,${C.goldD},${C.gold},${C.goldL},${C.gold});
        background-size:300%; -webkit-background-clip:text;
        -webkit-text-fill-color:transparent; background-clip:text;
        animation: shimmer 5s linear infinite;
      }

      /* Layout */
      .page { display:flex; min-height:100vh; }
      .left-panel {
        flex:1; position:relative; overflow:hidden;
        display:flex; flex-direction:column; justify-content:flex-end;
      }
      .left-panel img {
        position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
        animation: kenBurns 16s ease-in-out alternate infinite;
      }
      .left-overlay {
        position:absolute; inset:0;
        background:linear-gradient(160deg,rgba(10,9,8,.25) 0%,rgba(10,9,8,.8) 100%);
      }
      .left-content { position:relative; z-index:2; padding:0 52px 60px; }
      .right-panel {
        width:520px; flex-shrink:0; background:${C.cream};
        overflow-y:auto; display:flex; flex-direction:column;
      }
      .form-scroll { padding:48px 52px 72px; flex:1; display:flex; flex-direction:column; justify-content:center; }

      /* Form fields */
      .field { margin-bottom:18px; }
      .lbl { display:block; font-size:9px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:${C.slate}; margin-bottom:8px; }
      .inp-wrap { position:relative; }
      .inp {
        width:100%; background:#fff; border:1.5px solid rgba(91,87,81,.15);
        border-radius:14px; padding:13px 46px 13px 18px;
        font-family:'Jost',sans-serif; font-size:14px; color:${C.charcoal};
        outline:none; transition:border-color .3s, box-shadow .3s;
      }
      .inp:focus { border-color:${C.gold}; box-shadow:0 0 0 4px rgba(191,160,84,.1); }
      .inp::placeholder { color:${C.mist}; }
      .inp.valid { border-color:rgba(122,158,126,.4); }
      .inp.error { border-color:${C.blush}; }
      .inp-icon {
        position:absolute; right:15px; top:50%; transform:translateY(-50%);
        font-size:16px; color:${C.mist}; pointer-events:none;
      }
      .inp-icon.clickable { pointer-events:auto; cursor:pointer; }
      .inp-icon.clickable:hover { color:${C.gold}; }
      .inp-valid-icon { position:absolute; right:15px; top:50%; transform:translateY(-50%); animation:checkBounce .4s ease; }
      .err-msg { font-size:11px; color:${C.blush}; margin-top:6px; }
      .hint-msg { font-size:11px; color:${C.mist}; margin-top:5px; }

      /* Password strength */
      .strength-bar-wrap { display:flex; gap:4px; margin-top:8px; }
      .strength-seg { height:3px; flex:1; border-radius:2px; background:rgba(91,87,81,.12); overflow:hidden; }
      .strength-fill { height:100%; border-radius:2px; transition:width .4s ease, background-color .4s; }
      .strength-label { font-size:10px; font-weight:600; letter-spacing:1px; margin-top:5px; text-transform:uppercase; }

      /* Two columns */
      .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }

      /* Buttons */
      .btn-gold {
        width:100%; padding:16px; border:none; border-radius:14px;
        background:linear-gradient(135deg,${C.goldD},${C.gold},${C.goldL});
        background-size:200%; color:#fff;
        font-family:'Jost',sans-serif; font-weight:700; font-size:13px;
        letter-spacing:2px; text-transform:uppercase; cursor:pointer;
        transition:all .35s; position:relative; overflow:hidden;
        animation: glowPulse 3s ease-in-out infinite;
      }
      .btn-gold:hover { background-position:right center; transform:translateY(-2px); box-shadow:0 12px 36px rgba(191,160,84,.4); }
      .btn-gold:disabled { opacity:.6; cursor:not-allowed; animation:none; }
      .btn-google {
        width:100%; padding:14px; border:1.5px solid rgba(91,87,81,.18);
        border-radius:14px; background:#fff; cursor:pointer;
        display:flex; align-items:center; justify-content:center; gap:12px;
        font-family:'Jost',sans-serif; font-weight:600; font-size:13px;
        color:${C.charcoal}; transition:all .3s;
        box-shadow:0 2px 12px rgba(0,0,0,.06);
      }
      .btn-google:hover { border-color:rgba(191,160,84,.4); box-shadow:0 6px 24px rgba(0,0,0,.1); transform:translateY(-1px); }
      .btn-google:disabled { opacity:.6; cursor:not-allowed; }

      /* Divider */
      .divider { display:flex; align-items:center; gap:14px; margin:22px 0; }
      .divider::before,.divider::after { content:''; flex:1; height:1px; background:rgba(91,87,81,.15); }
      .divider span { font-size:11px; color:${C.mist}; font-weight:500; letter-spacing:1px; text-transform:uppercase; white-space:nowrap; }

      /* Terms checkbox */
      .check-row { display:flex; align-items:flex-start; gap:12px; cursor:pointer; }
      .check-box {
        width:20px; height:20px; border-radius:6px; flex-shrink:0; margin-top:1px;
        border:1.5px solid rgba(91,87,81,.25); background:#fff;
        display:flex; align-items:center; justify-content:center;
        transition:all .25s; font-size:12px; color:transparent; min-width:20px;
      }
      .check-box.checked { background:${C.gold}; border-color:${C.gold}; color:#fff; }

      /* Spinner */
      .spinner { width:20px; height:20px; border:2.5px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; display:inline-block; }

      /* Ornamental divider */
      .ornament { display:flex; align-items:center; gap:12px; margin:8px 0 20px; }
      .ornament::before,.ornament::after { content:''; flex:1; height:1px; background:linear-gradient(to right,transparent,rgba(191,160,84,.4),transparent); }

      /* Benefits strip on left panel */
      .benefit-item { display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid rgba(255,255,255,.08); }
      .benefit-item:last-child { border-bottom:none; }
      .benefit-icon { width:38px; height:38px; background:rgba(191,160,84,.15); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }

      /* Toast */
      .toast { position:fixed; bottom:28px; right:28px; z-index:9999; background:${C.charcoal}; border:1px solid rgba(191,160,84,.2); border-radius:16px; padding:16px 22px; display:flex; align-items:center; gap:13px; box-shadow:0 20px 60px rgba(0,0,0,.4); animation:fadeUp .4s ease; }

      /* Shape decoration */
      .shape { position:absolute; border-radius:50%; opacity:.07; background:${C.gold}; animation:float 5s ease-in-out infinite; }

      @media (max-width:900px) { .left-panel { display:none; } .right-panel { width:100%; } }
    `}</style>
  );
}

// ─── Google Icon ──────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SignupPage() {
  const [form, setForm]           = useState({ firstName:"", lastName:"", email:"", password:"", confirm:"" });
  const [touched, setTouched]     = useState({});  // which fields have been interacted with
  const [showPass, setShowPass]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms]   = useState(false);
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [toast, setToast]             = useState(null);
  const [globalError, setGlobalError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (typeof window !== "undefined" && loadSession()) {
      window.location.href = "/";
    }
  }, []);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setGlobalError("");
  };
  const touch = (key) => setTouched(t => ({ ...t, [key]: true }));

  // ── Per-field validation (runs live after field is touched) ───────────────
  const fieldErrors = {
    firstName: !form.firstName.trim() ? "First name is required" : "",
    lastName:  !form.lastName.trim()  ? "Last name is required"  : "",
    email: !form.email.trim()
      ? "Email is required"
      : !/\S+@\S+\.\S+/.test(form.email) ? "Invalid email address" : "",
    password: !form.password
      ? "Password is required"
      : form.password.length < 8 ? "Minimum 8 characters" : "",
    confirm: !form.confirm
      ? "Please confirm your password"
      : form.confirm !== form.password ? "Passwords do not match" : "",
  };

  const showErr   = (key) => touched[key] && fieldErrors[key];
  const isValid   = (key) => touched[key] && !fieldErrors[key] && form[key];
  const formOk    = Object.values(fieldErrors).every(v => !v) && agreeTerms;
  const strength  = passwordStrength(form.password);

  // ── Email/password registration ───────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    // Touch all fields to show any remaining errors
    setTouched({ firstName:true, lastName:true, email:true, password:true, confirm:true });
    if (!formOk) return;

    setLoading(true);
    setGlobalError("");
    try {
      /**
       * REAL IMPLEMENTATION — replace mock with one of:
       *
       * Option A — Firebase:
       *   const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
       *   await updateProfile(user, { displayName: `${form.firstName} ${form.lastName}` });
       *
       * Option B — NextAuth credentials (custom register endpoint):
       *   const res = await fetch("/api/auth/register", {
       *     method: "POST",
       *     headers: { "Content-Type": "application/json" },
       *     body: JSON.stringify({ name: `${form.firstName} ${form.lastName}`, email: form.email, password: form.password }),
       *   });
       *   if (!res.ok) throw new Error(await res.text());
       *
       * Option C — Supabase:
       *   const { user, error } = await supabase.auth.signUp({ email: form.email, password: form.password });
       */

      // ── Mock registration ─────────────────────────────────────────────────
      await new Promise(r => setTimeout(r, 1500));
      if (form.email === "test@test.com") throw new Error("Email already exists");
      const newUser = { id:"usr_new_001", name:`${form.firstName} ${form.lastName}`, email:form.email, avatar:null };
      // ── End mock ──────────────────────────────────────────────────────────

      saveSession(newUser);
      setToast({ type:"success", msg:"Account created! Welcome to Rabeya's Cloth 🎉" });
      setTimeout(() => { window.location.href = "/"; }, 1200);
    } catch (err) {
      setGlobalError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth registration ──────────────────────────────────────────────
  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setGlobalError("");
    try {
      /**
       * REAL IMPLEMENTATION — Google auto-creates the account on first login.
       *
       * NextAuth (handles new user creation automatically):
       *   await signIn("google", { callbackUrl: "/" });
       *
       * Firebase:
       *   const provider = new GoogleAuthProvider();
       *   const { user } = await signInWithPopup(auth, provider);
       *   const sessionUser = { id: user.uid, name: user.displayName, email: user.email, avatar: user.photoURL };
       *   saveSession(sessionUser);
       */

      // ── Mock ─────────────────────────────────────────────────────────────
      await new Promise(r => setTimeout(r, 1600));
      const googleUser = { id:"usr_google_002", name:"Google User", email:"user@gmail.com", avatar:null, provider:"google" };
      // ── End mock ─────────────────────────────────────────────────────────

      saveSession(googleUser);
      setToast({ type:"success", msg:"Signed up with Google! Welcome to Rabeya's Cloth 🎉" });
      setTimeout(() => { window.location.href = "/"; }, 1000);
    } catch (err) {
      setGlobalError("Google sign-up failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <Styles />
      <div className="page">

        {/* ── LEFT PANEL ──────────────────────────────────────────────── */}
        <div className="left-panel">
          <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=85" alt="Fashion" />
          <div className="left-overlay" />
          <div className="shape" style={{ width:250, height:250, top:-50, right:-50, animationDelay:"0s" }} />
          <div className="shape" style={{ width:140, height:140, bottom:150, left:-30, animationDelay:"2s" }} />

          <div className="left-content fade-up">
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:5, textTransform:"uppercase", color:C.goldL, marginBottom:16, display:"flex", alignItems:"center", gap:14 }}>
              <span style={{ display:"block", width:40, height:1, background:C.goldL }} />
              Join the Family
            </div>
            <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:46, fontWeight:400, color:"#fff", lineHeight:1.1, marginBottom:28, textShadow:"0 4px 30px rgba(0,0,0,.3)" }}>
              Your Style,<br /><em style={{ color:C.goldL }}>Elevated</em>
            </h2>

            {/* Benefits */}
            {[
              { icon:"✦", title:"Exclusive Member Pricing", sub:"Up to 30% off for registered customers" },
              { icon:"📦", title:"Real-time Order Tracking", sub:"Know exactly where your order is" },
              { icon:"♥",  title:"Permanent Wishlist",       sub:"Save items across any device" },
              { icon:"🎁", title:"Birthday Surprises",       sub:"Special gift on your special day" },
            ].map(b => (
              <div key={b.title} className="benefit-item">
                <div className="benefit-icon">{b.icon}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:"#fff", marginBottom:2 }}>{b.title}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,.45)" }}>{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────── */}
        <div className="right-panel">
          <div className="form-scroll">

            {/* Brand mark */}
            <div style={{ marginBottom:32, textAlign:"center" }} className="fade-up">
              <div style={{ fontFamily:"'Playfair Display', serif", fontSize:28, fontWeight:500, background:`linear-gradient(120deg,${C.goldD},${C.gold},${C.goldL})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                Rabeya's Cloth
              </div>
              <div className="ornament"><span>✦</span></div>
              <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:26, fontWeight:400, color:C.charcoal }}>
                Create your account
              </h1>
              <p style={{ fontSize:13, color:C.slate, marginTop:8 }}>Join thousands of happy customers</p>
            </div>

            {/* Global error */}
            {globalError && (
              <div style={{ background:"rgba(196,121,111,.1)", border:"1px solid rgba(196,121,111,.25)", borderRadius:12, padding:"13px 16px", marginBottom:18, fontSize:13, color:C.blush }}>
                ⚠️ {globalError}
              </div>
            )}

            {/* Google Sign Up */}
            <button className="btn-google fade-up" style={{ animationDelay:".08s" }} onClick={handleGoogleSignup} disabled={googleLoading}>
              {googleLoading ? <div className="spinner" style={{ borderColor:"rgba(0,0,0,.15)", borderTopColor:C.gold }} /> : <GoogleIcon />}
              <span>{googleLoading ? "Connecting…" : "Sign up with Google"}</span>
            </button>

            <div className="divider fade-up" style={{ animationDelay:".13s" }}>
              <span>or fill in the form</span>
            </div>

            {/* Registration form */}
            <form onSubmit={handleSignup} noValidate>
              {/* Name row */}
              <div className="grid-2 fade-up" style={{ animationDelay:".18s" }}>
                <div className="field">
                  <label className="lbl">First Name</label>
                  <div className="inp-wrap">
                    <input className={`inp ${showErr("firstName") ? "error" : isValid("firstName") ? "valid" : ""}`}
                      placeholder="Fatima"
                      value={form.firstName}
                      onChange={e => set("firstName", e.target.value)}
                      onBlur={() => touch("firstName")} />
                    {isValid("firstName") && <div className="inp-valid-icon">✅</div>}
                  </div>
                  {showErr("firstName") && <div className="err-msg">⚠ {fieldErrors.firstName}</div>}
                </div>
                <div className="field">
                  <label className="lbl">Last Name</label>
                  <div className="inp-wrap">
                    <input className={`inp ${showErr("lastName") ? "error" : isValid("lastName") ? "valid" : ""}`}
                      placeholder="Khan"
                      value={form.lastName}
                      onChange={e => set("lastName", e.target.value)}
                      onBlur={() => touch("lastName")} />
                    {isValid("lastName") && <div className="inp-valid-icon">✅</div>}
                  </div>
                  {showErr("lastName") && <div className="err-msg">⚠ {fieldErrors.lastName}</div>}
                </div>
              </div>

              {/* Email */}
              <div className="field fade-up" style={{ animationDelay:".23s" }}>
                <label className="lbl">Email Address</label>
                <div className="inp-wrap">
                  <input className={`inp ${showErr("email") ? "error" : isValid("email") ? "valid" : ""}`}
                    type="email" placeholder="you@example.com"
                    value={form.email}
                    onChange={e => set("email", e.target.value)}
                    onBlur={() => touch("email")} />
                  {isValid("email") && <div className="inp-valid-icon">✅</div>}
                </div>
                {showErr("email") && <div className="err-msg">⚠ {fieldErrors.email}</div>}
              </div>

              {/* Password */}
              <div className="field fade-up" style={{ animationDelay:".28s" }}>
                <label className="lbl">Password</label>
                <div className="inp-wrap">
                  <input className={`inp ${showErr("password") ? "error" : isValid("password") ? "valid" : ""}`}
                    type={showPass ? "text" : "password"} placeholder="Minimum 8 characters"
                    value={form.password}
                    onChange={e => set("password", e.target.value)}
                    onBlur={() => touch("password")} />
                  <div className="inp-icon clickable" onClick={() => setShowPass(s => !s)}>
                    {showPass ? "🙈" : "👁"}
                  </div>
                </div>
                {/* Strength meter — shown as soon as user types */}
                {form.password && (
                  <div style={{ animation:"slideDown .3s ease" }}>
                    <div className="strength-bar-wrap">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="strength-seg">
                          <div className="strength-fill"
                            style={{ width: strength.score >= i ? "100%" : "0%", background: strength.color }} />
                        </div>
                      ))}
                    </div>
                    <div className="strength-label" style={{ color: strength.color }}>
                      {strength.label}
                    </div>
                  </div>
                )}
                {showErr("password") && <div className="err-msg">⚠ {fieldErrors.password}</div>}
                {!showErr("password") && <div className="hint-msg">Use letters, numbers & symbols for a stronger password</div>}
              </div>

              {/* Confirm Password */}
              <div className="field fade-up" style={{ animationDelay:".33s" }}>
                <label className="lbl">Confirm Password</label>
                <div className="inp-wrap">
                  <input className={`inp ${showErr("confirm") ? "error" : isValid("confirm") ? "valid" : ""}`}
                    type={showConfirm ? "text" : "password"} placeholder="Repeat your password"
                    value={form.confirm}
                    onChange={e => set("confirm", e.target.value)}
                    onBlur={() => touch("confirm")} />
                  <div className="inp-icon clickable" onClick={() => setShowConfirm(s => !s)}>
                    {showConfirm ? "🙈" : "👁"}
                  </div>
                </div>
                {showErr("confirm") && <div className="err-msg">⚠ {fieldErrors.confirm}</div>}
                {isValid("confirm") && form.confirm === form.password && (
                  <div style={{ fontSize:11, color:C.sage, marginTop:6 }}>✅ Passwords match</div>
                )}
              </div>

              {/* Terms agreement */}
              <div className="field fade-up" style={{ animationDelay:".38s" }}>
                <div className="check-row" onClick={() => setAgreeTerms(a => !a)}>
                  <div className={`check-box ${agreeTerms ? "checked" : ""}`}>{agreeTerms && "✓"}</div>
                  <div style={{ fontSize:12, color:C.slate, lineHeight:1.6 }}>
                    I agree to the{" "}
                    <a href="/terms" style={{ color:C.gold, textDecoration:"none", fontWeight:600 }} onClick={e => e.stopPropagation()}>Terms of Service</a>
                    {" & "}
                    <a href="/privacy" style={{ color:C.gold, textDecoration:"none", fontWeight:600 }} onClick={e => e.stopPropagation()}>Privacy Policy</a>.
                    Your session stays active for <strong style={{ color:C.gold }}>30 days</strong>.
                  </div>
                </div>
              </div>

              <button className="btn-gold fade-up" style={{ animationDelay:".43s", marginTop:4 }}
                type="submit" disabled={loading || !agreeTerms}>
                {loading ? <div className="spinner" /> : "Create My Account"}
              </button>
            </form>

            {/* Sign in link */}
            <div className="fade-up" style={{ animationDelay:".5s", textAlign:"center", marginTop:24, fontSize:13, color:C.slate }}>
              Already have an account?{" "}
              <a href="/login" style={{ color:C.gold, fontWeight:700, textDecoration:"none", borderBottom:`1px solid rgba(191,160,84,.3)`, paddingBottom:1 }}>
                Sign in
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast">
          <span style={{ fontSize:24 }}>🎉</span>
          <div style={{ fontSize:14, fontWeight:600, color:"#fff" }}>{toast.msg}</div>
        </div>
      )}
    </>
  );
}
