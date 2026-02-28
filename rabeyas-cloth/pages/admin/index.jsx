/**
 * RABEYA'S CLOTH — Admin Dashboard
 * Separate admin panel with stats, revenue chart, recent orders,
 * top products, and quick actions. Dark luxury aesthetic.
 *
 * Route: /admin  (Next.js: pages/admin/index.jsx)
 */

import { useState, useEffect, useRef } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  gold:     "#BFA054",
  goldL:    "#E2C97E",
  goldD:    "#7A6330",
  bg:       "#0E0D0C",
  surface:  "#161512",
  surfaceL: "#1E1C19",
  border:   "rgba(191,160,84,.14)",
  text:     "#EDE8DF",
  muted:    "rgba(237,232,223,.42)",
  blush:    "#C4796F",
  sage:     "#7A9E7E",
  slate:    "#8A847A",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const RECENT_ORDERS = [
  { id:"#RC-2041", customer:"Fatima Khan",   product:"Royal Banarasi Silk",   amount:12500, status:"Delivered",  date:"26 Feb" },
  { id:"#RC-2040", customer:"Nadia Islam",    product:"Zardozi Lehenga Set",   amount:28000, status:"Processing", date:"25 Feb" },
  { id:"#RC-2039", customer:"Sara Ahmed",     product:"Premium Black Abaya",   amount:6500,  status:"Shipped",    date:"24 Feb" },
  { id:"#RC-2038", customer:"Rima Hossain",   product:"Georgette Silk Saree",  amount:8900,  status:"Pending",    date:"23 Feb" },
  { id:"#RC-2037", customer:"Mitu Begum",     product:"Silk Kameez Full Set",  amount:5600,  status:"Delivered",  date:"22 Feb" },
  { id:"#RC-2036", customer:"Tahmina Akter",  product:"Embroidered Dupatta",   amount:2800,  status:"Cancelled",  date:"21 Feb" },
];

const TOP_PRODUCTS = [
  { name:"Georgette Silk Saree",  sold:423, revenue:3764700, cat:"Saree",   img:"https://images.unsplash.com/photo-1609713116726-96f6e76e3b0f?w=120&q=80" },
  { name:"Chikankari Kameez",     sold:312, revenue:1310400, cat:"Kameez",  img:"https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=120&q=80" },
  { name:"Designer Lawn Suit",    sold:289, revenue:2832200, cat:"Suits",   img:"https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=120&q=80" },
  { name:"Royal Banarasi Silk",   sold:234, revenue:2925000, cat:"Saree",   img:"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=120&q=80" },
];

// Mini sparkline data for each stat (last 7 days, normalized 0-100)
const SPARKLINES = {
  revenue: [62, 74, 58, 82, 78, 91, 100],
  orders:  [55, 68, 72, 60, 85, 78, 94],
  products:[70, 70, 75, 80, 80, 90, 95],
  customers:[50,60, 65, 72, 80, 88, 100],
};

// Revenue bar chart data (last 7 months)
const BAR_DATA = [
  { month:"Aug", val:280000 },
  { month:"Sep", val:340000 },
  { month:"Oct", val:420000 },
  { month:"Nov", val:510000 },
  { month:"Dec", val:630000 },
  { month:"Jan", val:580000 },
  { month:"Feb", val:482500 },
];
const BAR_MAX = Math.max(...BAR_DATA.map(d => d.val));

// ─── Global Styles ────────────────────────────────────────────────────────────
function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Jost:wght@300;400;500;600;700&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
      :root { color-scheme: dark; }
      html { scroll-behavior: smooth; }
      body { font-family: 'Jost', sans-serif; background: #0E0D0C; color: #EDE8DF; overflow-x: hidden; }
      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-thumb { background: #BFA054; border-radius: 3px; }

      @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
      @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      @keyframes shimmer { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }
      @keyframes barGrow { from{height:0} to{height:var(--h)} }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      @keyframes sparkDraw { from{stroke-dashoffset:200} to{stroke-dashoffset:0} }

      .fade-up { animation: fadeUp .65s cubic-bezier(.25,.46,.45,.94) both; }
      .fade-in { animation: fadeIn .4s ease both; }

      .gold-txt {
        background: linear-gradient(120deg, #7A6330, #BFA054, #E2C97E, #BFA054);
        background-size: 300%; -webkit-background-clip: text;
        -webkit-text-fill-color: transparent; background-clip: text;
        animation: shimmer 5s linear infinite;
      }

      /* Layout */
      .admin-wrap { display: flex; min-height: 100vh; }
      .sidebar { width: 256px; background: #161512; border-right: 1px solid rgba(191,160,84,.12); position: fixed; top:0; left:0; bottom:0; display:flex; flex-direction:column; z-index: 100; }
      .main { margin-left: 256px; flex:1; padding: 40px 44px; min-height: 100vh; }

      /* Sidebar */
      .sb-logo { padding: 32px 28px 24px; border-bottom: 1px solid rgba(191,160,84,.1); }
      .sb-logo-name { font-family: 'Playfair Display', serif; font-size: 21px; color: #BFA054; }
      .sb-logo-tag  { font-size: 8px; letter-spacing: 4px; color: rgba(191,160,84,.4); text-transform: uppercase; margin-top: 2px; }
      .sb-section   { padding: 20px 0 8px 28px; font-size: 9px; font-weight: 700; letter-spacing: 2.5px; color: rgba(237,232,223,.2); text-transform: uppercase; }
      .sb-item { display: flex; align-items: center; gap: 13px; padding: 13px 28px; font-size: 13px; font-weight: 500; color: rgba(237,232,223,.45); cursor: pointer; border-left: 3px solid transparent; transition: all .3s; letter-spacing: .3px; }
      .sb-item:hover { color: #BFA054; background: rgba(191,160,84,.05); border-left-color: rgba(191,160,84,.4); }
      .sb-item.active { color: #BFA054; background: rgba(191,160,84,.08); border-left-color: #BFA054; }
      .sb-badge { margin-left: auto; background: rgba(191,160,84,.15); color: #BFA054; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; }
      .sb-profile { padding: 20px 28px; border-top: 1px solid rgba(191,160,84,.1); margin-top: auto; display: flex; align-items: center; gap: 13px; }
      .sb-avatar { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #7A6330, #BFA054); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
      .sb-name  { font-size: 13px; font-weight: 600; color: #EDE8DF; }
      .sb-role  { font-size: 10px; color: rgba(237,232,223,.35); margin-top: 1px; letter-spacing: .5px; }

      /* Top bar */
      .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
      .page-title { font-family: 'Playfair Display', serif; font-size: 34px; font-weight: 400; }
      .page-date  { font-size: 12px; color: rgba(237,232,223,.4); margin-top: 4px; letter-spacing: .5px; }
      .top-actions { display: flex; align-items: center; gap: 16px; }
      .icon-btn { width: 42px; height: 42px; background: #1E1C19; border: 1px solid rgba(191,160,84,.14); border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: rgba(237,232,223,.55); transition: all .3s; position: relative; }
      .icon-btn:hover { border-color: #BFA054; color: #BFA054; }
      .notif-dot { position: absolute; top: 7px; right: 7px; width: 8px; height: 8px; background: #C4796F; border-radius: 50%; border: 2px solid #0E0D0C; }

      /* Buttons */
      .btn-gold { background: linear-gradient(135deg, #7A6330, #BFA054, #E2C97E); background-size: 200%; border: none; color: #fff; border-radius: 50px; font-family: 'Jost', sans-serif; font-weight: 600; font-size: 11px; letter-spacing: 1.8px; text-transform: uppercase; cursor: pointer; transition: all .35s; padding: 11px 24px; }
      .btn-gold:hover { background-position: right center; box-shadow: 0 6px 20px rgba(191,160,84,.35); }
      .btn-ghost { background: transparent; border: 1px solid rgba(191,160,84,.25); color: rgba(237,232,223,.6); border-radius: 50px; font-family: 'Jost', sans-serif; font-weight: 500; font-size: 11px; letter-spacing: 1.2px; text-transform: uppercase; cursor: pointer; transition: all .3s; padding: 9px 22px; }
      .btn-ghost:hover { border-color: #BFA054; color: #BFA054; }

      /* Stat cards */
      .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; margin-bottom: 28px; }
      .stat-card { background: #161512; border: 1px solid rgba(191,160,84,.12); border-radius: 18px; padding: 24px 26px; position: relative; overflow: hidden; transition: transform .35s, box-shadow .35s; }
      .stat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,.4); border-color: rgba(191,160,84,.28); }
      .stat-icon { width: 44px; height: 44px; border-radius: 13px; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; font-size: 20px; }
      .stat-val  { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 600; color: #EDE8DF; margin-bottom: 4px; }
      .stat-lbl  { font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(237,232,223,.38); margin-bottom: 16px; }
      .stat-delta { font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; }
      .delta-up   { background: rgba(122,158,126,.15); color: #7A9E7E; }
      .delta-down { background: rgba(196,121,111,.15); color: #C4796F; }
      .sparkline  { position: absolute; bottom: 0; right: 0; opacity: .18; }

      /* Chart */
      .chart-card { background: #161512; border: 1px solid rgba(191,160,84,.12); border-radius: 18px; padding: 28px; margin-bottom: 24px; }
      .chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
      .chart-title { font-family: 'Playfair Display', serif; font-size: 22px; color: #EDE8DF; margin-bottom: 4px; }
      .chart-sub { font-size: 12px; color: rgba(237,232,223,.35); }
      .bar-chart { display: flex; align-items: flex-end; gap: 14px; height: 180px; padding-top: 12px; }
      .bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 10px; height: 100%; justify-content: flex-end; }
      .bar { width: 100%; border-radius: 6px 6px 0 0; background: linear-gradient(to top, #7A6330, #BFA054); transition: height .8s cubic-bezier(.25,.46,.45,.94); position: relative; cursor: pointer; }
      .bar:hover::after { content: attr(data-tip); position: absolute; top: -36px; left: 50%; transform: translateX(-50%); background: #BFA054; color: #fff; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 8px; white-space: nowrap; }
      .bar-month { font-size: 10px; color: rgba(237,232,223,.35); letter-spacing: 1px; text-transform: uppercase; }

      /* Grid 2-col */
      .two-col { display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; }

      /* Table card */
      .table-card { background: #161512; border: 1px solid rgba(191,160,84,.12); border-radius: 18px; overflow: hidden; }
      .card-header { padding: 22px 26px; border-bottom: 1px solid rgba(191,160,84,.1); display: flex; justify-content: space-between; align-items: center; }
      .card-title { font-family: 'Playfair Display', serif; font-size: 20px; color: #EDE8DF; }
      table { width: 100%; border-collapse: collapse; }
      th { padding: 13px 20px; text-align: left; font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: rgba(191,160,84,.6); background: rgba(191,160,84,.04); }
      td { padding: 15px 20px; font-size: 13px; border-bottom: 1px solid rgba(191,160,84,.06); vertical-align: middle; }
      tr:last-child td { border-bottom: none; }
      tr:hover td { background: rgba(191,160,84,.03); }
      .order-id { font-weight: 700; color: #BFA054; font-size: 12px; }
      .s-badge { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 10px; font-weight: 700; letter-spacing: .5px; }
      .s-delivered  { background: rgba(122,158,126,.15); color: #7A9E7E; }
      .s-processing { background: rgba(191,160,84,.12); color: #BFA054; }
      .s-shipped    { background: rgba(138,132,122,.15); color: #8A847A; }
      .s-pending    { background: rgba(196,121,111,.12); color: #C4796F; }
      .s-cancelled  { background: rgba(196,121,111,.08); color: rgba(196,121,111,.7); }

      /* Top products card */
      .tp-item { display: flex; align-items: center; gap: 16px; padding: 16px 24px; border-bottom: 1px solid rgba(191,160,84,.06); transition: background .2s; cursor: pointer; }
      .tp-item:last-child { border-bottom: none; }
      .tp-item:hover { background: rgba(191,160,84,.03); }
      .tp-img { width: 50px; height: 50px; border-radius: 12px; object-fit: cover; }
      .tp-name { font-size: 13px; font-weight: 500; color: #EDE8DF; margin-bottom: 3px; }
      .tp-cat  { font-size: 10px; color: rgba(191,160,84,.6); letter-spacing: 1px; text-transform: uppercase; }
      .tp-bar-wrap { flex: 1; }
      .tp-bar-track { height: 4px; background: rgba(191,160,84,.1); border-radius: 2px; overflow: hidden; }
      .tp-bar-fill { height: 100%; background: linear-gradient(to right, #7A6330, #BFA054); border-radius: 2px; transition: width .8s cubic-bezier(.25,.46,.45,.94); }
      .tp-sold { font-size: 12px; font-weight: 600; color: #BFA054; white-space: nowrap; margin-left: 12px; }

      /* Quick actions */
      .qa-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 14px; padding: 20px 24px; }
      .qa-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: rgba(191,160,84,.05); border: 1px solid rgba(191,160,84,.1); border-radius: 14px; cursor: pointer; transition: all .3s; }
      .qa-item:hover { background: rgba(191,160,84,.1); border-color: rgba(191,160,84,.3); }
      .qa-icon { width: 36px; height: 36px; background: linear-gradient(135deg, #7A6330, #BFA054); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
      .qa-label { font-size: 12px; font-weight: 600; color: rgba(237,232,223,.7); letter-spacing: .5px; }

      @media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(2,1fr); } .two-col { grid-template-columns: 1fr; } }
    `}</style>
  );
}

// ─── Sparkline SVG ────────────────────────────────────────────────────────────
function Sparkline({ data, color = "#BFA054" }) {
  const w = 100, h = 48, pad = 4;
  const xs = data.map((_, i) => pad + (i / (data.length - 1)) * (w - 2 * pad));
  const ys = data.map(v => h - pad - (v / 100) * (h - 2 * pad));
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const area = `${path} L${xs[xs.length - 1]},${h} L${xs[0]},${h} Z`;
  return (
    <svg width={w} height={h} className="sparkline">
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace("#","")})`} />
      <path d={path} stroke={color} strokeWidth="2" fill="none"
        style={{ strokeDasharray: 200, strokeDashoffset: 200, animation: "sparkDraw .8s ease forwards .3s" }} />
    </svg>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive }) {
  const items = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "orders",    icon: "📦", label: "Orders",    badge: "5" },
    { id: "upload",    icon: "⬆️",  label: "Products" },
    { id: "customers", icon: "👥", label: "Customers" },
    { id: "analytics", icon: "📈", label: "Analytics" },
    { id: "settings",  icon: "⚙️",  label: "Settings" },
  ];
  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <div className="sb-logo-name">Rabeya's Cloth</div>
        <div className="sb-logo-tag">Admin Panel</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", paddingTop: 8 }}>
        <div className="sb-section">Navigation</div>
        {items.map(item => (
          <div key={item.id} className={`sb-item ${active === item.id ? "active" : ""}`} onClick={() => setActive(item.id)}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && <span className="sb-badge">{item.badge}</span>}
          </div>
        ))}
      </div>
      <div className="sb-profile">
        <div className="sb-avatar">👩</div>
        <div>
          <div className="sb-name">Rabeya Admin</div>
          <div className="sb-role">Super Admin</div>
        </div>
      </div>
    </aside>
  );
}

// ─── Main Dashboard Content ───────────────────────────────────────────────────
function DashboardContent() {
  const [animBars, setAnimBars] = useState(false);
  useEffect(() => { setTimeout(() => setAnimBars(true), 200); }, []);

  const stats = [
    { icon: "💰", label: "Total Revenue",   val: "৳4,82,500", delta: "+12.5%", up: true,  spark: SPARKLINES.revenue   },
    { icon: "📦", label: "Total Orders",    val: "1,248",     delta: "+8.2%",  up: true,  spark: SPARKLINES.orders    },
    { icon: "🏷️", label: "Products Listed", val: "342",       delta: "+24",    up: true,  spark: SPARKLINES.products  },
    { icon: "👥", label: "Customers",       val: "3,891",     delta: "+5.1%",  up: true,  spark: SPARKLINES.customers },
  ];

  return (
    <div>
      {/* Top Bar */}
      <div className="top-bar">
        <div>
          <h1 className="page-title">Welcome back, <span className="gold-txt">Rabeya</span></h1>
          <div className="page-date">{new Date().toLocaleDateString("en-BD", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</div>
        </div>
        <div className="top-actions">
          <div className="icon-btn">🔔<div className="notif-dot" /></div>
          <div className="icon-btn">✉️</div>
          <button className="btn-gold">+ New Product</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card fade-up" style={{ animationDelay: `${i * 0.09}s` }}>
            <div className="stat-icon" style={{ background: `linear-gradient(135deg, rgba(122,99,48,.3), rgba(191,160,84,.15))` }}>{s.icon}</div>
            <div className="stat-val">{s.val}</div>
            <div className="stat-lbl">{s.label}</div>
            <span className={`stat-delta ${s.up ? "delta-up" : "delta-down"}`}>{s.up ? "▲" : "▼"} {s.delta}</span>
            <Sparkline data={s.spark} />
          </div>
        ))}
      </div>

      {/* Revenue Bar Chart */}
      <div className="chart-card fade-up" style={{ animationDelay: ".32s" }}>
        <div className="chart-header">
          <div>
            <div className="chart-title">Monthly Revenue</div>
            <div className="chart-sub">Aug 2024 – Feb 2025</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-ghost">Export</button>
            <button className="btn-gold">Full Report</button>
          </div>
        </div>
        <div className="bar-chart">
          {BAR_DATA.map((d, i) => {
            const pct = (d.val / BAR_MAX) * 100;
            return (
              <div key={d.month} className="bar-wrap">
                <div
                  className="bar"
                  data-tip={`৳${(d.val / 1000).toFixed(0)}K`}
                  style={{ height: animBars ? `${pct}%` : "0%", transition: `height .8s cubic-bezier(.25,.46,.45,.94) ${i * 0.08}s` }}
                />
                <div className="bar-month">{d.month}</div>
              </div>
            );
          })}
        </div>
        {/* Y-axis labels */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", borderTop: "1px solid rgba(191,160,84,.08)", marginTop: 16 }}>
          {["৳0", "৳150K", "৳300K", "৳450K", "৳630K"].map(l => (
            <span key={l} style={{ fontSize: 10, color: "rgba(237,232,223,.25)", letterSpacing: 1 }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Bottom 2 columns */}
      <div className="two-col">
        {/* Recent Orders */}
        <div className="table-card fade-up" style={{ animationDelay: ".42s" }}>
          <div className="card-header">
            <div className="card-title">Recent Orders</div>
            <button className="btn-ghost" style={{ fontSize: 11, padding: "7px 18px" }}>View All</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  {["Order", "Customer", "Amount", "Status", "Date"].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map((o, i) => (
                  <tr key={i} style={{ animation: `fadeIn .4s ${i * 0.07}s ease both` }}>
                    <td><span className="order-id">{o.id}</span></td>
                    <td style={{ fontWeight: 500 }}>{o.customer}</td>
                    <td style={{ fontFamily: "'Playfair Display', serif", fontSize: 16 }}>৳{o.amount.toLocaleString()}</td>
                    <td><span className={`s-badge s-${o.status.toLowerCase()}`}>{o.status}</span></td>
                    <td style={{ color: "rgba(237,232,223,.38)", fontSize: 12 }}>{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: top products + quick actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Top Products */}
          <div className="table-card fade-up" style={{ animationDelay: ".5s" }}>
            <div className="card-header">
              <div className="card-title">Top Products</div>
              <span style={{ fontSize: 11, color: "rgba(191,160,84,.5)" }}>by sold</span>
            </div>
            {TOP_PRODUCTS.map((p, i) => {
              const pct = (p.sold / TOP_PRODUCTS[0].sold) * 100;
              return (
                <div key={i} className="tp-item">
                  <img className="tp-img" src={p.img} alt={p.name} loading="lazy" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="tp-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div className="tp-cat">{p.cat}</div>
                    <div className="tp-bar-wrap" style={{ marginTop: 8 }}>
                      <div className="tp-bar-track">
                        <div className="tp-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="tp-sold">{p.sold}</div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="table-card fade-up" style={{ animationDelay: ".58s" }}>
            <div className="card-header"><div className="card-title">Quick Actions</div></div>
            <div className="qa-grid">
              {[
                { icon:"📦", label:"Manage Orders" },
                { icon:"➕", label:"Upload Product" },
                { icon:"📊", label:"Analytics" },
                { icon:"💌", label:"Send Promo" },
              ].map((qa, i) => (
                <div key={i} className="qa-item">
                  <div className="qa-icon">{qa.icon}</div>
                  <div className="qa-label">{qa.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [active, setActive] = useState("dashboard");
  return (
    <>
      <Styles />
      <div className="admin-wrap">
        <Sidebar active={active} setActive={setActive} />
        <main className="main">
          {/* In a real Next.js app you'd route to separate pages.
              Here we keep the dashboard as the rendered content. */}
          <DashboardContent />
        </main>
      </div>
    </>
  );
}
