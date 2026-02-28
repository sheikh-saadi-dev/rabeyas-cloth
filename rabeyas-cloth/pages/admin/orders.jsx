/**
 * RABEYA'S CLOTH — Order Management Page
 * Separate admin page for viewing, filtering, and updating all orders.
 * Includes search, status filters, detail drawer, and bulk actions.
 *
 * Route: /admin/orders  (Next.js: pages/admin/orders.jsx)
 */

import { useState, useEffect } from "react";

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

// ─── Mock Orders ──────────────────────────────────────────────────────────────
const ALL_ORDERS = [
  { id:"#RC-2041", customer:"Fatima Khan",    email:"fatima@mail.com",   product:"Royal Banarasi Silk",  cat:"Saree",   qty:1, amount:12500, status:"Delivered",  date:"2025-02-26", city:"Dhaka",     img:"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=120&q=80" },
  { id:"#RC-2040", customer:"Nadia Islam",    email:"nadia@mail.com",    product:"Zardozi Lehenga Set",  cat:"Lehenga", qty:1, amount:28000, status:"Processing", date:"2025-02-25", city:"Chittagong", img:"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=120&q=80" },
  { id:"#RC-2039", customer:"Sara Ahmed",     email:"sara@mail.com",     product:"Premium Black Abaya",  cat:"Abaya",   qty:2, amount:13000, status:"Shipped",    date:"2025-02-24", city:"Sylhet",     img:"https://images.unsplash.com/photo-1600618538034-fc86e9a679f3?w=120&q=80" },
  { id:"#RC-2038", customer:"Rima Hossain",   email:"rima@mail.com",     product:"Georgette Silk Saree", cat:"Saree",   qty:1, amount:8900,  status:"Pending",    date:"2025-02-23", city:"Rajshahi",   img:"https://images.unsplash.com/photo-1609713116726-96f6e76e3b0f?w=120&q=80" },
  { id:"#RC-2037", customer:"Mitu Begum",     email:"mitu@mail.com",     product:"Silk Kameez Full Set", cat:"Kameez",  qty:1, amount:5600,  status:"Delivered",  date:"2025-02-22", city:"Dhaka",      img:"https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=120&q=80" },
  { id:"#RC-2036", customer:"Tahmina Akter",  email:"tahmina@mail.com",  product:"Embroidered Dupatta",  cat:"Dupatta", qty:3, amount:8400,  status:"Cancelled",  date:"2025-02-21", city:"Comilla",    img:"https://images.unsplash.com/photo-1594938298603-c8148c4b4da4?w=120&q=80" },
  { id:"#RC-2035", customer:"Layla Rahman",   email:"layla@mail.com",    product:"Chikankari Kameez",    cat:"Kameez",  qty:2, amount:8400,  status:"Shipped",    date:"2025-02-20", city:"Narsingdi",  img:"https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=120&q=80" },
  { id:"#RC-2034", customer:"Sumaiya Khatun", email:"sumaiya@mail.com",  product:"Designer Lawn Suit",   cat:"Suits",   qty:1, amount:9800,  status:"Processing", date:"2025-02-19", city:"Khulna",     img:"https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=120&q=80" },
  { id:"#RC-2033", customer:"Parveen Noor",   email:"parveen@mail.com",  product:"Royal Banarasi Silk",  cat:"Saree",   qty:2, amount:25000, status:"Delivered",  date:"2025-02-18", city:"Barishal",   img:"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=120&q=80" },
  { id:"#RC-2032", customer:"Tania Begum",    email:"tania@mail.com",    product:"Zardozi Lehenga Set",  cat:"Lehenga", qty:1, amount:28000, status:"Pending",    date:"2025-02-17", city:"Dhaka",      img:"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=120&q=80" },
];

const STATUSES = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const STATUS_COLORS = {
  Delivered:  { bg:"rgba(122,158,126,.12)", text:"#7A9E7E" },
  Processing: { bg:"rgba(191,160,84,.12)",  text:"#BFA054" },
  Shipped:    { bg:"rgba(138,132,122,.12)", text:"#8A847A" },
  Pending:    { bg:"rgba(196,121,111,.12)", text:"#C4796F" },
  Cancelled:  { bg:"rgba(196,121,111,.07)", text:"rgba(196,121,111,.65)" },
};

const STATUS_NEXT = {
  Pending: "Processing", Processing: "Shipped", Shipped: "Delivered", Delivered: null, Cancelled: null,
};

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

      @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
      @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      @keyframes slideRight { from{transform:translateX(100%)} to{transform:translateX(0)} }
      @keyframes shimmer { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }
      .fade-up { animation: fadeUp .6s cubic-bezier(.25,.46,.45,.94) both; }

      .gold-txt {
        background: linear-gradient(120deg, #7A6330, #BFA054, #E2C97E, #BFA054);
        background-size: 300%; -webkit-background-clip: text;
        -webkit-text-fill-color: transparent; background-clip: text;
        animation: shimmer 5s linear infinite;
      }

      /* Layout */
      .page-wrap { display: flex; min-height: 100vh; }
      .sidebar { width: 256px; background: #161512; border-right: 1px solid rgba(191,160,84,.12); position: fixed; top:0; left:0; bottom:0; display:flex; flex-direction:column; z-index: 100; }
      .content { margin-left: 256px; flex:1; padding: 40px 44px; }

      /* Sidebar */
      .sb-logo { padding: 30px 28px 22px; border-bottom: 1px solid rgba(191,160,84,.1); }
      .sb-logo-name { font-family: 'Playfair Display', serif; font-size: 20px; color: #BFA054; }
      .sb-logo-tag  { font-size: 8px; letter-spacing: 4px; color: rgba(191,160,84,.35); text-transform: uppercase; margin-top: 2px; }
      .sb-section   { padding: 18px 0 8px 28px; font-size: 9px; font-weight: 700; letter-spacing: 2.5px; color: rgba(237,232,223,.18); text-transform: uppercase; }
      .sb-item { display: flex; align-items: center; gap: 13px; padding: 13px 28px; font-size: 13px; font-weight: 500; color: rgba(237,232,223,.4); cursor: pointer; border-left: 3px solid transparent; transition: all .3s; }
      .sb-item:hover { color: #BFA054; background: rgba(191,160,84,.05); border-left-color: rgba(191,160,84,.4); }
      .sb-item.active { color: #BFA054; background: rgba(191,160,84,.08); border-left-color: #BFA054; }
      .sb-badge { margin-left: auto; background: rgba(196,121,111,.25); color: #C4796F; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; }
      .sb-profile { padding: 18px 28px; border-top: 1px solid rgba(191,160,84,.1); margin-top: auto; display: flex; align-items: center; gap: 13px; }
      .sb-avatar { width: 38px; height: 38px; border-radius: 11px; background: linear-gradient(135deg, #7A6330, #BFA054); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }

      /* Buttons */
      .btn-gold { background: linear-gradient(135deg, #7A6330, #BFA054, #E2C97E); background-size: 200%; border: none; color: #fff; border-radius: 50px; font-family: 'Jost', sans-serif; font-weight: 600; font-size: 11px; letter-spacing: 1.6px; text-transform: uppercase; cursor: pointer; transition: all .35s; padding: 10px 22px; }
      .btn-gold:hover { background-position: right center; box-shadow: 0 6px 20px rgba(191,160,84,.32); }
      .btn-ghost { background: transparent; border: 1px solid rgba(191,160,84,.22); color: rgba(237,232,223,.55); border-radius: 50px; font-family: 'Jost', sans-serif; font-weight: 500; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; transition: all .3s; padding: 9px 20px; }
      .btn-ghost:hover { border-color: #BFA054; color: #BFA054; }
      .btn-danger { background: rgba(196,121,111,.12); border: 1px solid rgba(196,121,111,.25); color: #C4796F; border-radius: 50px; font-family: 'Jost', sans-serif; font-weight: 600; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; transition: all .3s; padding: 9px 20px; }
      .btn-danger:hover { background: rgba(196,121,111,.22); }

      /* Top bar */
      .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 36px; }
      .page-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 400; }
      .page-sub   { font-size: 12px; color: rgba(237,232,223,.38); margin-top: 4px; }

      /* Summary pills */
      .summary-strip { display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
      .sum-pill { background: #161512; border: 1px solid rgba(191,160,84,.12); border-radius: 14px; padding: 14px 20px; display: flex; align-items: center; gap: 12px; flex: 1; min-width: 150px; transition: all .3s; cursor: pointer; }
      .sum-pill:hover { border-color: rgba(191,160,84,.3); }
      .sum-pill.on  { border-color: #BFA054; background: rgba(191,160,84,.06); }
      .sum-num { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 500; }
      .sum-lbl { font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(237,232,223,.38); margin-top: 2px; }
      .sum-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

      /* Toolbar */
      .toolbar { display: flex; gap: 14px; margin-bottom: 22px; align-items: center; flex-wrap: wrap; }
      .search-box { position: relative; flex: 1; min-width: 220px; }
      .search-inp { width: 100%; background: #161512; border: 1px solid rgba(191,160,84,.18); border-radius: 50px; padding: 11px 44px 11px 18px; font-family: 'Jost', sans-serif; font-size: 13px; color: #EDE8DF; outline: none; transition: border-color .3s, box-shadow .3s; }
      .search-inp:focus { border-color: #BFA054; box-shadow: 0 0 0 3px rgba(191,160,84,.1); }
      .search-inp::placeholder { color: rgba(237,232,223,.25); }
      .search-ico { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: rgba(191,160,84,.5); font-size: 16px; }
      .filter-sel { background: #161512; border: 1px solid rgba(191,160,84,.18); border-radius: 50px; padding: 11px 18px; font-family: 'Jost', sans-serif; font-size: 13px; color: rgba(237,232,223,.7); outline: none; cursor: pointer; }
      .filter-sel:focus { border-color: #BFA054; }
      option { background: #1E1C19; }

      /* Table */
      .table-wrap { background: #161512; border: 1px solid rgba(191,160,84,.12); border-radius: 20px; overflow: hidden; }
      .table-head-row { display: flex; justify-content: space-between; align-items: center; padding: 20px 28px; border-bottom: 1px solid rgba(191,160,84,.1); }
      .table-count { font-size: 13px; color: rgba(237,232,223,.38); }
      table { width: 100%; border-collapse: collapse; }
      thead th { padding: 14px 20px; text-align: left; font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: rgba(191,160,84,.5); background: rgba(191,160,84,.03); white-space: nowrap; }
      tbody td { padding: 16px 20px; font-size: 13px; border-bottom: 1px solid rgba(191,160,84,.06); vertical-align: middle; }
      tbody tr:last-child td { border-bottom: none; }
      tbody tr:hover td { background: rgba(191,160,84,.025); cursor: pointer; }
      .order-id { font-weight: 700; font-size: 12px; color: #BFA054; }
      .customer-cell { display: flex; align-items: center; gap: 11px; }
      .cust-avatar { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, #1E1C19, #2C2A25); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
      .cust-name  { font-weight: 500; color: #EDE8DF; }
      .cust-email { font-size: 11px; color: rgba(237,232,223,.35); margin-top: 2px; }
      .prod-cell { display: flex; align-items: center; gap: 10px; }
      .prod-thumb { width: 40px; height: 40px; border-radius: 10px; object-fit: cover; }
      .prod-name  { font-size: 13px; font-weight: 500; color: #EDE8DF; }
      .prod-cat   { font-size: 10px; color: rgba(191,160,84,.55); letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }
      .amt { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 500; }
      .s-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 700; letter-spacing: .5px; white-space: nowrap; }
      .action-cell { display: flex; gap: 8px; align-items: center; }
      .tbl-btn { padding: 6px 14px; border-radius: 20px; font-size: 10px; font-weight: 600; letter-spacing: .8px; text-transform: uppercase; cursor: pointer; transition: all .25s; border: 1px solid; }
      .tbl-btn-primary { background: rgba(191,160,84,.1); border-color: rgba(191,160,84,.25); color: #BFA054; }
      .tbl-btn-primary:hover { background: rgba(191,160,84,.2); }
      .tbl-btn-ghost { background: transparent; border-color: rgba(237,232,223,.1); color: rgba(237,232,223,.4); }
      .tbl-btn-ghost:hover { border-color: rgba(237,232,223,.25); color: rgba(237,232,223,.7); }

      /* Detail drawer */
      .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 500; animation: fadeIn .3s ease; backdrop-filter: blur(4px); }
      .drawer { position: fixed; right: 0; top: 0; bottom: 0; width: 460px; background: #161512; border-left: 1px solid rgba(191,160,84,.14); z-index: 600; overflow-y: auto; animation: slideRight .35s cubic-bezier(.25,.46,.45,.94); padding: 36px 32px; }
      .drawer-close { position: absolute; top: 24px; right: 24px; width: 36px; height: 36px; background: rgba(237,232,223,.06); border: none; border-radius: 10px; cursor: pointer; color: rgba(237,232,223,.5); font-size: 18px; display: flex; align-items: center; justify-content: center; transition: all .25s; }
      .drawer-close:hover { background: rgba(196,121,111,.15); color: #C4796F; }
      .drawer-label { font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: rgba(191,160,84,.5); margin-bottom: 6px; }
      .drawer-val { font-size: 14px; color: #EDE8DF; font-weight: 500; }
      .info-row { padding: 14px 0; border-bottom: 1px solid rgba(191,160,84,.08); }
      .info-row:last-child { border-bottom: none; }
      .timeline { padding: 0; list-style: none; }
      .tl-item { display: flex; gap: 16px; padding-bottom: 24px; position: relative; }
      .tl-item:last-child { padding-bottom: 0; }
      .tl-item::before { content:''; position: absolute; left: 17px; top: 34px; bottom: 0; width: 1px; background: rgba(191,160,84,.15); }
      .tl-item:last-child::before { display: none; }
      .tl-dot { width: 34px; height: 34px; border-radius: 50%; border: 2px solid rgba(191,160,84,.3); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; background: #1E1C19; }
      .tl-dot.done { border-color: #7A9E7E; background: rgba(122,158,126,.15); }
      .tl-dot.current { border-color: #BFA054; background: rgba(191,160,84,.12); }
      .tl-title { font-size: 13px; font-weight: 600; color: #EDE8DF; margin-bottom: 3px; }
      .tl-date  { font-size: 11px; color: rgba(237,232,223,.35); }

      /* Status select */
      .status-sel { background: #1E1C19; border: 1px solid rgba(191,160,84,.2); border-radius: 10px; padding: 11px 16px; font-family: 'Jost', sans-serif; font-size: 13px; color: #EDE8DF; outline: none; width: 100%; margin-top: 8px; cursor: pointer; }
      .status-sel:focus { border-color: #BFA054; }

      /* Pagination */
      .pagination { display: flex; align-items: center; justify-content: space-between; padding: 20px 28px; border-top: 1px solid rgba(191,160,84,.1); }
      .page-info { font-size: 12px; color: rgba(237,232,223,.35); }
      .page-btns { display: flex; gap: 8px; }
      .page-btn { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .25s; border: 1px solid rgba(191,160,84,.14); background: transparent; color: rgba(237,232,223,.5); }
      .page-btn:hover { border-color: #BFA054; color: #BFA054; }
      .page-btn.active { background: #BFA054; border-color: #BFA054; color: #fff; }

      @media (max-width: 900px) { .drawer { width: 100%; } }
    `}</style>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function OrderManagement() {
  const [orders, setOrders]       = useState(ALL_ORDERS);
  const [statusFilter, setStatus] = useState("All");
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState(null);   // opened order detail
  const [page, setPage]           = useState(1);
  const PER_PAGE = 7;

  // Compute summary counts
  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === "All" ? ALL_ORDERS.length : ALL_ORDERS.filter(o => o.status === s).length;
    return acc;
  }, {});

  // Filter + search
  const visible = orders.filter(o => {
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || o.customer.toLowerCase().includes(q) || o.id.toLowerCase().includes(q) || o.product.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const pageCount = Math.ceil(visible.length / PER_PAGE);
  const paginated = visible.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Advance status
  const advanceStatus = (id) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const next = STATUS_NEXT[o.status];
      return next ? { ...o, status: next } : o;
    }));
    if (selected?.id === id) {
      const next = STATUS_NEXT[selected.status];
      if (next) setSelected(s => ({ ...s, status: next }));
    }
  };

  // Status dot color map
  const dotColor = { Delivered: C.sage, Processing: C.gold, Shipped: C.slate, Pending: C.blush, Cancelled: "rgba(196,121,111,.4)" };

  const SIDEBAR_ITEMS = [
    { icon:"📊", label:"Dashboard", id:"dashboard" },
    { icon:"📦", label:"Orders",    id:"orders",   badge: counts["Pending"] + counts["Processing"] },
    { icon:"⬆️",  label:"Products", id:"upload" },
    { icon:"👥", label:"Customers", id:"customers" },
    { icon:"📈", label:"Analytics", id:"analytics" },
    { icon:"⚙️",  label:"Settings",  id:"settings" },
  ];

  return (
    <>
      <Styles />
      <div className="page-wrap">

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside className="sidebar">
          <div className="sb-logo">
            <div className="sb-logo-name">Rabeya's Cloth</div>
            <div className="sb-logo-tag">Admin Panel</div>
          </div>
          <div style={{ flex:1, overflowY:"auto", paddingTop:8 }}>
            <div className="sb-section">Navigation</div>
            {SIDEBAR_ITEMS.map(item => (
              <div key={item.id} className={`sb-item ${item.id === "orders" ? "active" : ""}`}>
                <span style={{ fontSize:16 }}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge > 0 && <span className="sb-badge">{item.badge}</span>}
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

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="content">

          {/* Header */}
          <div className="top-bar fade-up">
            <div>
              <h1 className="page-title">Order <span className="gold-txt">Management</span></h1>
              <div className="page-sub">{visible.length} orders found · Last updated just now</div>
            </div>
            <div style={{ display:"flex", gap:12 }}>
              <button className="btn-ghost">Export CSV</button>
              <button className="btn-gold">Print Report</button>
            </div>
          </div>

          {/* Summary pills */}
          <div className="summary-strip fade-up" style={{ animationDelay:".08s" }}>
            {["All","Pending","Processing","Shipped","Delivered","Cancelled"].map(s => (
              <div key={s} className={`sum-pill ${statusFilter === s ? "on" : ""}`} onClick={() => { setStatus(s); setPage(1); }}>
                <div className="sum-dot" style={{ background: dotColor[s] || C.gold }} />
                <div>
                  <div className="sum-num" style={{ color: statusFilter === s ? C.gold : C.text }}>{counts[s]}</div>
                  <div className="sum-lbl">{s}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="toolbar fade-up" style={{ animationDelay:".15s" }}>
            <div className="search-box">
              <input className="search-inp" placeholder="Search orders, customers, products…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
              <div className="search-ico">🔍</div>
            </div>
            <select className="filter-sel" value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="filter-sel">
              <option>Newest First</option>
              <option>Oldest First</option>
              <option>Amount ↓</option>
              <option>Amount ↑</option>
            </select>
          </div>

          {/* Table */}
          <div className="table-wrap fade-up" style={{ animationDelay:".22s" }}>
            <div className="table-head-row">
              <span className="table-count">Showing {Math.min(paginated.length, PER_PAGE)} of {visible.length} orders</span>
              <button className="btn-ghost" style={{ fontSize:11, padding:"7px 18px" }}>Bulk Update</button>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table>
                <thead>
                  <tr>
                    {["Order ID","Customer","Product","Amount","Status","Date","Action"].map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign:"center", padding:"60px 0", color:"rgba(237,232,223,.25)", fontSize:15 }}>No orders found</td></tr>
                  ) : paginated.map((o, i) => {
                    const sc = STATUS_COLORS[o.status] || STATUS_COLORS.Pending;
                    const next = STATUS_NEXT[o.status];
                    return (
                      <tr key={o.id} style={{ animation:`fadeUp .5s ${i * 0.05}s both` }} onClick={() => setSelected(o)}>
                        <td><span className="order-id">{o.id}</span></td>
                        <td>
                          <div className="customer-cell">
                            <div className="cust-avatar">👤</div>
                            <div>
                              <div className="cust-name">{o.customer}</div>
                              <div className="cust-email">{o.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="prod-cell">
                            <img className="prod-thumb" src={o.img} alt={o.product} loading="lazy" />
                            <div>
                              <div className="prod-name" style={{ maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{o.product}</div>
                              <div className="prod-cat">Qty: {o.qty}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="amt">৳{o.amount.toLocaleString()}</span></td>
                        <td><span className="s-badge" style={{ background:sc.bg, color:sc.text }}>{o.status}</span></td>
                        <td style={{ color:"rgba(237,232,223,.35)", fontSize:12 }}>{o.date}</td>
                        <td onClick={e => e.stopPropagation()}>
                          <div className="action-cell">
                            {next && (
                              <button className="tbl-btn tbl-btn-primary" onClick={() => advanceStatus(o.id)}>
                                → {next}
                              </button>
                            )}
                            <button className="tbl-btn tbl-btn-ghost" onClick={() => setSelected(o)}>View</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="pagination">
              <div className="page-info">Page {page} of {pageCount || 1}</div>
              <div className="page-btns">
                <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</button>
                {Array.from({ length: pageCount }, (_, i) => (
                  <button key={i} className={`page-btn ${page === i + 1 ? "active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                ))}
                <button className="page-btn" onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount}>→</button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Detail Drawer ──────────────────────────────────────────────── */}
      {selected && (
        <>
          <div className="drawer-overlay" onClick={() => setSelected(null)} />
          <div className="drawer">
            <button className="drawer-close" onClick={() => setSelected(null)}>✕</button>

            {/* Header */}
            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:C.gold, marginBottom:8 }}>Order Details</div>
              <div style={{ fontFamily:"'Playfair Display', serif", fontSize:28, color:C.text, marginBottom:6 }}>{selected.id}</div>
              <span className="s-badge" style={{ background:STATUS_COLORS[selected.status]?.bg, color:STATUS_COLORS[selected.status]?.text, fontSize:11 }}>
                {selected.status}
              </span>
            </div>

            {/* Product */}
            <div style={{ display:"flex", gap:16, background:C.surfL, borderRadius:16, padding:16, marginBottom:24 }}>
              <img src={selected.img} alt={selected.product} style={{ width:72, height:72, borderRadius:12, objectFit:"cover" }} />
              <div>
                <div style={{ fontSize:14, fontWeight:500, color:C.text, marginBottom:4 }}>{selected.product}</div>
                <div style={{ fontSize:11, color:C.gold, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>{selected.cat} · Qty {selected.qty}</div>
                <div style={{ fontFamily:"'Playfair Display', serif", fontSize:22, color:C.text }}>৳{selected.amount.toLocaleString()}</div>
              </div>
            </div>

            {/* Info rows */}
            <div style={{ marginBottom:24 }}>
              {[
                { label:"Customer Name", val:selected.customer },
                { label:"Email",         val:selected.email },
                { label:"Delivery City", val:selected.city },
                { label:"Order Date",    val:selected.date },
              ].map(r => (
                <div key={r.label} className="info-row">
                  <div className="drawer-label">{r.label}</div>
                  <div className="drawer-val">{r.val}</div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:C.gold, marginBottom:20 }}>Order Timeline</div>
              <ul className="timeline">
                {[
                  { label:"Order Placed",     done: true,    icon:"✓" },
                  { label:"Processing",        done: ["Processing","Shipped","Delivered"].includes(selected.status), icon:"⚙️" },
                  { label:"Shipped",           done: ["Shipped","Delivered"].includes(selected.status), icon:"🚚" },
                  { label:"Delivered",         done: selected.status === "Delivered", icon:"🏠" },
                ].map((step, i) => (
                  <li key={i} className="tl-item">
                    <div className={`tl-dot ${step.done ? "done" : ""} ${!step.done && ["Processing","Shipped","Delivered","Pending"].includes(selected.status) && i === ["Order Placed","Processing","Shipped","Delivered"].findIndex(l => l === step.label) ? "current" : ""}`}>
                      {step.icon}
                    </div>
                    <div style={{ paddingTop:4 }}>
                      <div className="tl-title" style={{ color: step.done ? C.sage : "rgba(237,232,223,.4)" }}>{step.label}</div>
                      <div className="tl-date">{step.done ? selected.date : "—"}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Update Status */}
            <div style={{ background:C.surfL, borderRadius:16, padding:20, marginBottom:20 }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:C.gold, marginBottom:4 }}>Update Status</div>
              <select className="status-sel" value={selected.status} onChange={e => {
                const ns = e.target.value;
                setOrders(prev => prev.map(o => o.id === selected.id ? { ...o, status: ns } : o));
                setSelected(s => ({ ...s, status: ns }));
              }}>
                {["Pending","Processing","Shipped","Delivered","Cancelled"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Actions */}
            <div style={{ display:"flex", gap:12 }}>
              <button className="btn-gold" style={{ flex:1 }}>Save Changes</button>
              <button className="btn-danger">Cancel Order</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
