/**
 * RABEYA'S CLOTH — Product Upload Page
 * Separate admin page for uploading new products with category,
 * images, pricing, variants, and rich descriptions.
 *
 * Route: /admin/upload  (Next.js: pages/admin/upload.jsx)
 */

import { useState, useRef } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  gold:    "#BFA054",
  goldL:   "#E2C97E",
  goldD:   "#7A6330",
  bg:      "#0E0D0C",
  surface: "#161512",
  surfL:   "#1E1C19",
  border:  "rgba(191,160,84,.14)",
  text:    "#EDE8DF",
  muted:   "rgba(237,232,223,.42)",
  blush:   "#C4796F",
  sage:    "#7A9E7E",
  slate:   "#8A847A",
};

const CATEGORIES = ["Saree","Lehenga","Kameez","Abaya","Dupatta","Suits","Tops","Accessories"];
const TAGS       = ["New Arrival","Best Seller","Flash Sale","Sale","Limited Edition","Trending"];
const FABRICS    = ["Pure Silk","Georgette","Chiffon","Cotton","Linen","Banarasi Brocade","Muslin","Lawn"];
const SIZES      = ["XS","S","M","L","XL","XXL","Free Size"];
const COLORS_OPT = ["Ruby Red","Royal Blue","Ivory White","Forest Green","Midnight Black","Blush Pink","Golden Yellow","Dusty Rose","Emerald"];

// ─── Styles ───────────────────────────────────────────────────────────────────
function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Jost:wght@300;400;500;600;700&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
      html { scroll-behavior: smooth; }
      body { font-family: 'Jost', sans-serif; background: #0E0D0C; color: #EDE8DF; overflow-x: hidden; }
      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-thumb { background: #BFA054; border-radius: 3px; }

      @keyframes fadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
      @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
      @keyframes shimmer  { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }
      @keyframes pulse    { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
      @keyframes checkPop { 0%{transform:scale(0)} 60%{transform:scale(1.3)} 100%{transform:scale(1)} }
      @keyframes borderPulse { 0%,100%{border-color:rgba(191,160,84,.3)} 50%{border-color:rgba(191,160,84,.8)} }

      .fade-up { animation: fadeUp .65s cubic-bezier(.25,.46,.45,.94) both; }

      .gold-txt {
        background: linear-gradient(120deg, #7A6330, #BFA054, #E2C97E, #BFA054);
        background-size: 300%; -webkit-background-clip: text;
        -webkit-text-fill-color: transparent; background-clip: text;
        animation: shimmer 5s linear infinite;
      }

      /* Layout */
      .page-wrap { display: flex; min-height: 100vh; }
      .sidebar { width: 256px; background: #161512; border-right: 1px solid rgba(191,160,84,.12); position: fixed; top:0; left:0; bottom:0; display:flex; flex-direction:column; z-index: 100; }
      .content { margin-left: 256px; flex:1; padding: 40px 48px 80px; max-width: 1320px; }

      /* Sidebar */
      .sb-logo { padding: 30px 28px 22px; border-bottom: 1px solid rgba(191,160,84,.1); }
      .sb-logo-name { font-family: 'Playfair Display', serif; font-size: 20px; color: #BFA054; }
      .sb-logo-tag  { font-size: 8px; letter-spacing: 4px; color: rgba(191,160,84,.35); text-transform: uppercase; margin-top: 2px; }
      .sb-section   { padding: 18px 0 8px 28px; font-size: 9px; font-weight: 700; letter-spacing: 2.5px; color: rgba(237,232,223,.18); text-transform: uppercase; }
      .sb-item { display: flex; align-items: center; gap: 13px; padding: 13px 28px; font-size: 13px; font-weight: 500; color: rgba(237,232,223,.4); cursor: pointer; border-left: 3px solid transparent; transition: all .3s; }
      .sb-item:hover { color: #BFA054; background: rgba(191,160,84,.05); border-left-color: rgba(191,160,84,.4); }
      .sb-item.active { color: #BFA054; background: rgba(191,160,84,.08); border-left-color: #BFA054; }
      .sb-profile { padding: 18px 28px; border-top: 1px solid rgba(191,160,84,.1); margin-top: auto; display: flex; align-items: center; gap: 13px; }
      .sb-avatar { width: 38px; height: 38px; border-radius: 11px; background: linear-gradient(135deg, #7A6330, #BFA054); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }

      /* Buttons */
      .btn-gold { background: linear-gradient(135deg, #7A6330, #BFA054, #E2C97E); background-size: 200%; border: none; color: #fff; border-radius: 50px; font-family: 'Jost', sans-serif; font-weight: 600; font-size: 12px; letter-spacing: 1.8px; text-transform: uppercase; cursor: pointer; transition: all .35s; padding: 12px 28px; display: inline-flex; align-items: center; gap: 8px; }
      .btn-gold:hover { background-position: right center; box-shadow: 0 8px 28px rgba(191,160,84,.38); transform: translateY(-1px); }
      .btn-gold:active { transform: translateY(0); }
      .btn-ghost { background: transparent; border: 1px solid rgba(191,160,84,.22); color: rgba(237,232,223,.55); border-radius: 50px; font-family: 'Jost', sans-serif; font-weight: 500; font-size: 12px; letter-spacing: 1.2px; text-transform: uppercase; cursor: pointer; transition: all .3s; padding: 10px 24px; }
      .btn-ghost:hover { border-color: #BFA054; color: #BFA054; }

      /* Section card */
      .form-card { background: #161512; border: 1px solid rgba(191,160,84,.12); border-radius: 20px; padding: 32px; margin-bottom: 24px; transition: border-color .3s; }
      .form-card:focus-within { border-color: rgba(191,160,84,.28); }
      .card-title { font-family: 'Playfair Display', serif; font-size: 21px; color: #EDE8DF; margin-bottom: 4px; }
      .card-sub   { font-size: 12px; color: rgba(237,232,223,.35); margin-bottom: 28px; }

      /* Form fields */
      .field { margin-bottom: 22px; }
      .field:last-child { margin-bottom: 0; }
      .label { display: block; font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: rgba(191,160,84,.6); margin-bottom: 9px; }
      .inp, .textarea, .sel {
        width: 100%; background: #1E1C19; border: 1.5px solid rgba(191,160,84,.16);
        border-radius: 12px; padding: 13px 16px; font-family: 'Jost', sans-serif;
        font-size: 13px; color: #EDE8DF; outline: none;
        transition: border-color .3s, box-shadow .3s;
      }
      .inp:focus, .textarea:focus, .sel:focus { border-color: #BFA054; box-shadow: 0 0 0 3px rgba(191,160,84,.1); }
      .inp::placeholder, .textarea::placeholder { color: rgba(237,232,223,.2); }
      .textarea { resize: vertical; min-height: 110px; line-height: 1.65; }
      .sel { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23BFA054' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; background-size: 16px; padding-right: 40px; }
      option { background: #1E1C19; }
      .inp-prefix { display: flex; align-items: center; background: #1E1C19; border: 1.5px solid rgba(191,160,84,.16); border-radius: 12px; overflow: hidden; transition: border-color .3s, box-shadow .3s; }
      .inp-prefix:focus-within { border-color: #BFA054; box-shadow: 0 0 0 3px rgba(191,160,84,.1); }
      .prefix { padding: 13px 14px; font-size: 14px; font-weight: 600; color: #BFA054; background: rgba(191,160,84,.06); border-right: 1px solid rgba(191,160,84,.14); white-space: nowrap; }
      .inp-bare { flex:1; background: transparent; border: none; padding: 13px 14px; font-family: 'Jost', sans-serif; font-size: 13px; color: #EDE8DF; outline: none; }
      .inp-bare::placeholder { color: rgba(237,232,223,.2); }

      /* Two / three column grid */
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
      .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; }

      /* Checkbox chips (sizes, colors) */
      .chip-row { display: flex; flex-wrap: wrap; gap: 10px; }
      .chip { padding: 8px 18px; border-radius: 50px; font-size: 12px; font-weight: 500; cursor: pointer; border: 1.5px solid rgba(191,160,84,.18); color: rgba(237,232,223,.5); background: transparent; transition: all .25s; user-select: none; letter-spacing: .5px; }
      .chip:hover { border-color: rgba(191,160,84,.4); color: rgba(237,232,223,.8); }
      .chip.on { background: rgba(191,160,84,.12); border-color: #BFA054; color: #BFA054; }
      .chip.on::before { content: "✓ "; }

      /* Image upload zone */
      .drop-zone { border: 2px dashed rgba(191,160,84,.28); border-radius: 18px; padding: 52px 28px; text-align: center; background: rgba(191,160,84,.025); cursor: pointer; transition: all .35s; position: relative; }
      .drop-zone:hover { border-color: #BFA054; background: rgba(191,160,84,.05); }
      .drop-zone.drag { border-color: #BFA054; background: rgba(191,160,84,.08); animation: borderPulse 1.2s ease infinite; }
      .drop-icon { font-size: 48px; margin-bottom: 16px; display: block; animation: pulse 2.5s ease-in-out infinite; }
      .drop-title { font-family: 'Playfair Display', serif; font-size: 22px; color: #EDE8DF; margin-bottom: 8px; }
      .drop-sub   { font-size: 13px; color: rgba(237,232,223,.35); margin-bottom: 22px; line-height: 1.6; }

      /* Image preview grid */
      .img-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px,1fr)); gap: 14px; margin-top: 20px; }
      .img-thumb { position: relative; border-radius: 14px; overflow: hidden; aspect-ratio: 3/4; background: #1E1C19; }
      .img-thumb img { width: 100%; height: 100%; object-fit: cover; }
      .img-remove { position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; background: rgba(0,0,0,.7); border: none; border-radius: 8px; color: #C4796F; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all .2s; }
      .img-remove:hover { background: rgba(196,121,111,.3); }
      .img-primary { position: absolute; bottom: 8px; left: 8px; background: rgba(191,160,84,.9); color: #fff; font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 3px 8px; border-radius: 6px; }

      /* Pricing preview */
      .price-preview { background: linear-gradient(135deg, #1E1C19, #161512); border: 1px solid rgba(191,160,84,.2); border-radius: 18px; padding: 28px; }
      .pp-title { font-family: 'Playfair Display', serif; font-size: 18px; color: rgba(191,160,84,.7); margin-bottom: 20px; }
      .pp-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(191,160,84,.07); }
      .pp-row:last-child { border-bottom: none; }
      .pp-label { font-size: 11px; color: rgba(237,232,223,.35); letter-spacing: 1px; text-transform: uppercase; }
      .pp-val   { font-family: 'Playfair Display', serif; font-size: 18px; color: #EDE8DF; }
      .pp-disc  { background: rgba(122,158,126,.12); color: #7A9E7E; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }

      /* Progress steps */
      .steps { display: flex; align-items: center; gap: 0; margin-bottom: 40px; }
      .step { display: flex; align-items: center; gap: 10px; flex: 1; }
      .step-circle { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; transition: all .3s; }
      .step-circle.done    { background: #7A9E7E; color: #fff; }
      .step-circle.current { background: #BFA054; color: #fff; }
      .step-circle.pending { background: rgba(191,160,84,.1); color: rgba(237,232,223,.3); border: 1.5px solid rgba(191,160,84,.2); }
      .step-label { font-size: 11px; font-weight: 600; letter-spacing: .5px; text-transform: uppercase; }
      .step-label.done    { color: #7A9E7E; }
      .step-label.current { color: #BFA054; }
      .step-label.pending { color: rgba(237,232,223,.25); }
      .step-line { flex: 1; height: 1px; background: rgba(191,160,84,.15); }

      /* Toast */
      .toast { position: fixed; bottom: 36px; right: 36px; background: #1E1C19; border: 1px solid rgba(122,158,126,.3); border-radius: 16px; padding: 18px 24px; display: flex; align-items: center; gap: 14px; box-shadow: 0 20px 60px rgba(0,0,0,.5); animation: fadeUp .4s ease; z-index: 1000; }
      .toast-icon { width: 36px; height: 36px; background: rgba(122,158,126,.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; animation: checkPop .5s cubic-bezier(.34,1.56,.64,1) both; }
      .toast-title { font-size: 14px; font-weight: 600; color: #EDE8DF; margin-bottom: 2px; }
      .toast-sub   { font-size: 12px; color: rgba(237,232,223,.4); }

      /* Character counter */
      .char-count { font-size: 11px; color: rgba(237,232,223,.25); text-align: right; margin-top: 6px; }
      .char-count.warn { color: #C4796F; }

      /* Required star */
      .req { color: #C4796F; }

      @media (max-width: 900px) { .grid-2, .grid-3 { grid-template-columns: 1fr; } }
    `}</style>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar() {
  const items = [
    { icon:"📊", label:"Dashboard",  id:"dashboard" },
    { icon:"📦", label:"Orders",     id:"orders" },
    { icon:"⬆️",  label:"Products",  id:"upload",  active: true },
    { icon:"👥", label:"Customers",  id:"customers" },
    { icon:"📈", label:"Analytics",  id:"analytics" },
    { icon:"⚙️",  label:"Settings",   id:"settings" },
  ];
  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <div className="sb-logo-name">Rabeya's Cloth</div>
        <div className="sb-logo-tag">Admin Panel</div>
      </div>
      <div style={{ flex:1, overflowY:"auto", paddingTop:8 }}>
        <div className="sb-section">Navigation</div>
        {items.map(item => (
          <div key={item.id} className={`sb-item ${item.active ? "active" : ""}`}>
            <span style={{ fontSize:16 }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div className="sb-profile">
        <div className="sb-avatar">👩</div>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:C.text }}>Rabeya Admin</div>
          <div style={{ fontSize:10, color:"rgba(237,232,223,.3)" }}>Super Admin</div>
        </div>
      </div>
    </aside>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductUpload() {
  const fileRef = useRef(null);

  // Form state — all fields in a single object for clarity
  const [form, setForm] = useState({
    name: "", category: "Saree", tag: "New Arrival", fabric: "Pure Silk",
    price: "", oldPrice: "", stock: "", sku: "",
    description: "", careInstructions: "",
    sizes: [], colors: [],
  });
  const [images, setImages]   = useState([]);  // { url, name }[]
  const [drag, setDrag]       = useState(false);
  const [step, setStep]       = useState(1);   // 1=details, 2=media, 3=pricing, 4=done
  const [toast, setToast]     = useState(false);
  const [errors, setErrors]   = useState({});

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Toggle chips
  const toggleChip = (key, val) => setForm(f => ({
    ...f,
    [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val],
  }));

  // Handle file input / drop
  const handleFiles = (files) => {
    const newImgs = Array.from(files).map(file => ({
      url: URL.createObjectURL(file), name: file.name,
    }));
    setImages(prev => [...prev, ...newImgs].slice(0, 8));
  };

  const onDrop = (e) => {
    e.preventDefault(); setDrag(false);
    handleFiles(e.dataTransfer.files);
  };

  // Pricing helpers
  const price    = parseFloat(form.price)    || 0;
  const oldPrice = parseFloat(form.oldPrice) || 0;
  const disc     = oldPrice > 0 && price > 0 ? Math.round((1 - price / oldPrice) * 100) : 0;

  // Simple validation
  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = "Product name is required";
    if (!form.price)           e.price    = "Sale price is required";
    if (!form.description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Submit
  const handlePublish = () => {
    if (!validate()) return;
    setToast(true);
    setStep(4);
    setTimeout(() => setToast(false), 4000);
  };

  const STEPS = [
    { n:1, label:"Details" },
    { n:2, label:"Media" },
    { n:3, label:"Pricing" },
  ];

  const descLen = form.description.length;

  return (
    <>
      <Styles />
      <div className="page-wrap">
        <Sidebar />

        <main className="content">
          {/* Page Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:36 }} className="fade-up">
            <div>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:C.gold, marginBottom:8 }}>Admin / Products</div>
              <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:34, fontWeight:400 }}>
                Upload <span className="gold-txt">New Product</span>
              </h1>
              <p style={{ fontSize:13, color:"rgba(237,232,223,.38)", marginTop:6 }}>Add a new item to your luxury catalogue</p>
            </div>
            <div style={{ display:"flex", gap:12, marginTop:8 }}>
              <button className="btn-ghost">Save Draft</button>
              <button className="btn-gold" onClick={handlePublish}>✦ Publish</button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="steps fade-up" style={{ animationDelay:".08s" }}>
            {STEPS.map((s, i) => (
              <div key={s.n} className="step" style={{ flex: i < STEPS.length - 1 ? 1 : "none" }}>
                <div className={`step-circle ${step > s.n ? "done" : step === s.n ? "current" : "pending"}`}>
                  {step > s.n ? "✓" : s.n}
                </div>
                <div className={`step-label ${step > s.n ? "done" : step === s.n ? "current" : "pending"}`}>{s.label}</div>
                {i < STEPS.length - 1 && <div className="step-line" />}
              </div>
            ))}
          </div>

          {/* ── MAIN FORM GRID ─────────────────────────────────────────── */}
          <div style={{ display:"grid", gridTemplateColumns:"1.35fr 1fr", gap:24, alignItems:"start" }}>

            {/* LEFT COLUMN */}
            <div>

              {/* ① Basic Details */}
              <div className="form-card fade-up" style={{ animationDelay:".16s" }}>
                <div className="card-title">Product Details</div>
                <div className="card-sub">Core information that appears on the product listing page</div>

                <div className="field">
                  <label className="label">Product Name <span className="req">*</span></label>
                  <input className="inp" placeholder="e.g. Royal Banarasi Silk Saree" value={form.name}
                    onChange={e => set("name", e.target.value)} />
                  {errors.name && <div style={{ fontSize:11, color:C.blush, marginTop:6 }}>{errors.name}</div>}
                </div>

                <div className="grid-2">
                  <div className="field">
                    <label className="label">Category <span className="req">*</span></label>
                    <select className="sel" value={form.category} onChange={e => set("category", e.target.value)}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label className="label">Tag / Badge</label>
                    <select className="sel" value={form.tag} onChange={e => set("tag", e.target.value)}>
                      {TAGS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label className="label">Fabric Material</label>
                  <select className="sel" value={form.fabric} onChange={e => set("fabric", e.target.value)}>
                    {FABRICS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>

                <div className="field">
                  <label className="label">Description <span className="req">*</span></label>
                  <textarea className="textarea" placeholder="Describe the product's story, craftsmanship, and unique features…" value={form.description}
                    onChange={e => set("description", e.target.value)} />
                  <div className={`char-count ${descLen > 1800 ? "warn" : ""}`}>{descLen} / 2000</div>
                  {errors.description && <div style={{ fontSize:11, color:C.blush, marginTop:4 }}>{errors.description}</div>}
                </div>

                <div className="field">
                  <label className="label">Care Instructions</label>
                  <textarea className="textarea" style={{ minHeight:80 }} placeholder="e.g. Dry clean only. Do not wring. Store in breathable cloth bag." value={form.careInstructions}
                    onChange={e => set("careInstructions", e.target.value)} />
                </div>
              </div>

              {/* ② Variants */}
              <div className="form-card fade-up" style={{ animationDelay:".22s" }}>
                <div className="card-title">Variants & Availability</div>
                <div className="card-sub">Select all sizes and colour options for this product</div>

                <div className="field">
                  <label className="label">Available Sizes</label>
                  <div className="chip-row">
                    {SIZES.map(s => (
                      <div key={s} className={`chip ${form.sizes.includes(s) ? "on" : ""}`}
                        onClick={() => toggleChip("sizes", s)}>{s}</div>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label className="label">Available Colours</label>
                  <div className="chip-row">
                    {COLORS_OPT.map(c => (
                      <div key={c} className={`chip ${form.colors.includes(c) ? "on" : ""}`}
                        onClick={() => toggleChip("colors", c)}>{c}</div>
                    ))}
                  </div>
                </div>

                <div className="grid-2">
                  <div className="field">
                    <label className="label">Stock Quantity</label>
                    <input className="inp" type="number" placeholder="e.g. 25" value={form.stock}
                      onChange={e => set("stock", e.target.value)} />
                  </div>
                  <div className="field">
                    <label className="label">SKU / Product Code</label>
                    <input className="inp" placeholder="e.g. RC-SAR-001" value={form.sku}
                      onChange={e => set("sku", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* ③ Image Upload */}
              <div className="form-card fade-up" style={{ animationDelay:".28s" }}>
                <div className="card-title">Product Images</div>
                <div className="card-sub">Upload up to 8 high-resolution images. First image is the cover.</div>

                {/* Drop zone */}
                <div
                  className={`drop-zone ${drag ? "drag" : ""}`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={onDrop}
                >
                  <span className="drop-icon">📷</span>
                  <div className="drop-title">Drop images here</div>
                  <div className="drop-sub">
                    or click to browse files<br />
                    PNG, JPG, WEBP — up to 10 MB each
                  </div>
                  <button className="btn-ghost" style={{ pointerEvents:"none" }}>Browse Files</button>
                  <input ref={fileRef} type="file" multiple accept="image/*" style={{ display:"none" }}
                    onChange={e => handleFiles(e.target.files)} />
                </div>

                {/* Preview */}
                {images.length > 0 && (
                  <div className="img-grid">
                    {images.map((img, i) => (
                      <div key={i} className="img-thumb">
                        <img src={img.url} alt={img.name} />
                        {i === 0 && <div className="img-primary">Cover</div>}
                        <button className="img-remove" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div>

              {/* Pricing Card */}
              <div className="form-card fade-up" style={{ animationDelay:".2s" }}>
                <div className="card-title">Pricing</div>
                <div className="card-sub">Set sale and original prices to show discounts</div>

                <div className="field">
                  <label className="label">Sale Price <span className="req">*</span></label>
                  <div className="inp-prefix">
                    <div className="prefix">৳</div>
                    <input className="inp-bare" type="number" placeholder="e.g. 12500" value={form.price}
                      onChange={e => set("price", e.target.value)} />
                  </div>
                  {errors.price && <div style={{ fontSize:11, color:C.blush, marginTop:6 }}>{errors.price}</div>}
                </div>

                <div className="field">
                  <label className="label">Original / MRP Price</label>
                  <div className="inp-prefix">
                    <div className="prefix">৳</div>
                    <input className="inp-bare" type="number" placeholder="e.g. 15000" value={form.oldPrice}
                      onChange={e => set("oldPrice", e.target.value)} />
                  </div>
                </div>

                {/* Live pricing preview */}
                <div className="price-preview" style={{ marginTop:8 }}>
                  <div className="pp-title">Price Preview</div>
                  <div className="pp-row">
                    <span className="pp-label">Sale Price</span>
                    <span className="pp-val">{price > 0 ? `৳${price.toLocaleString()}` : "—"}</span>
                  </div>
                  <div className="pp-row">
                    <span className="pp-label">Original Price</span>
                    <span className="pp-val" style={{ color:"rgba(237,232,223,.35)", textDecoration:"line-through", fontSize:15 }}>
                      {oldPrice > 0 ? `৳${oldPrice.toLocaleString()}` : "—"}
                    </span>
                  </div>
                  <div className="pp-row">
                    <span className="pp-label">Customer Saves</span>
                    <span className="pp-val" style={{ fontSize:16 }}>
                      {disc > 0 ? `৳${(oldPrice - price).toLocaleString()}` : "—"}
                    </span>
                  </div>
                  {disc > 0 && (
                    <div style={{ marginTop:16, textAlign:"center" }}>
                      <span className="pp-disc">🎉 {disc}% OFF applied</span>
                    </div>
                  )}
                </div>
              </div>

              {/* SEO & Visibility */}
              <div className="form-card fade-up" style={{ animationDelay:".26s" }}>
                <div className="card-title">Visibility & SEO</div>
                <div className="card-sub">Control how this product appears online</div>

                <div className="field">
                  <label className="label">Product Status</label>
                  <select className="sel">
                    <option>Published — Visible on storefront</option>
                    <option>Draft — Hidden from customers</option>
                    <option>Archived — Removed from catalogue</option>
                  </select>
                </div>

                <div className="field">
                  <label className="label">SEO Meta Title</label>
                  <input className="inp" placeholder="Leave blank to auto-generate" />
                </div>

                <div className="field">
                  <label className="label">SEO Description</label>
                  <textarea className="textarea" style={{ minHeight:80 }} placeholder="Short description for search engines (150–160 chars recommended)" />
                </div>
              </div>

              {/* Shipping */}
              <div className="form-card fade-up" style={{ animationDelay:".32s" }}>
                <div className="card-title">Shipping Details</div>
                <div className="card-sub">Logistics and delivery information</div>

                <div className="grid-2">
                  <div className="field">
                    <label className="label">Weight (grams)</label>
                    <input className="inp" type="number" placeholder="e.g. 450" />
                  </div>
                  <div className="field">
                    <label className="label">Delivery Class</label>
                    <select className="sel">
                      <option>Standard (3–5 days)</option>
                      <option>Express (48 hrs)</option>
                      <option>Same Day</option>
                    </select>
                  </div>
                </div>

                <div className="field" style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:500, color:C.text }}>Free Shipping</div>
                    <div style={{ fontSize:11, color:"rgba(237,232,223,.35)", marginTop:2 }}>Override default shipping cost</div>
                  </div>
                  <div style={{ position:"relative" }}>
                    <input type="checkbox" id="free-ship" style={{ display:"none" }} />
                    <label htmlFor="free-ship" style={{ display:"block", width:48, height:26, background:"rgba(191,160,84,.15)", borderRadius:13, cursor:"pointer", border:"1.5px solid rgba(191,160,84,.25)", position:"relative", transition:"all .3s" }}>
                      <span style={{ display:"block", width:18, height:18, background:"#BFA054", borderRadius:"50%", position:"absolute", top:3, left:3, transition:"all .3s" }} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="fade-up" style={{ animationDelay:".38s", display:"flex", flexDirection:"column", gap:12 }}>
                <button className="btn-gold" style={{ width:"100%", justifyContent:"center", padding:16, fontSize:13 }} onClick={handlePublish}>
                  ✦ Publish to Store
                </button>
                <button className="btn-ghost" style={{ width:"100%", padding:14 }}>
                  Save as Draft
                </button>
                <div style={{ textAlign:"center", fontSize:11, color:"rgba(237,232,223,.25)", letterSpacing:.5 }}>
                  Products are reviewed within 2 minutes before going live
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Success Toast ───────────────────────────────────────────────── */}
      {toast && (
        <div className="toast">
          <div className="toast-icon">✓</div>
          <div>
            <div className="toast-title">Product Published!</div>
            <div className="toast-sub">{form.name || "New Product"} is now live on the storefront</div>
          </div>
          <button onClick={() => setToast(false)} style={{ background:"none", border:"none", color:"rgba(237,232,223,.35)", cursor:"pointer", fontSize:18, marginLeft:12 }}>✕</button>
        </div>
      )}
    </>
  );
}
