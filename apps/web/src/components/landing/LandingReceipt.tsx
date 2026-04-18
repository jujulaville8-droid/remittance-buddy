// @ts-nocheck
'use client'

import { useEffect } from 'react'

/**
 * LandingReceipt — editorial landing with interactive receipt calculator.
 * Ported from the design bundle as a single client component. CSS + body
 * are embedded verbatim; the JS is mirrored in the useEffect below.
 */

const CSS = String.raw`
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
:root{
  --coral:#B35940;--coral-hover:#9A4833;--coral-soft:#F5E6DF;--coral-ink:#4A1E14;
  --teal:#0F8373;--teal-soft:#E4F3EF;--teal-ink:#0A4A40;
  --gold:#E6A93A;--gold-soft:#FAEFD6;--gold-ink:#5A3C06;
  --danger:#C8321F;
  --ink-900:#12100E;--ink-700:#3A3632;--ink-500:#6B645C;--ink-400:#958D82;--ink-300:#C6BFB5;--ink-200:#E6DFD3;--ink-100:#F2ECDF;
  --bg-cream:#F8F2E3;--bg-paper:#FBF7EC;--bg-white:#FFFFFF;--bg-ink:#14110D;
  --font-display:'Instrument Serif','Iowan Old Style',Georgia,serif;
  --font-sans:'Instrument Sans',ui-sans-serif,system-ui,sans-serif;
  --font-mono:'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace;
  --ease-out:cubic-bezier(0.22,1,0.36,1);
  --dur-fast:160ms;--dur-base:320ms;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;scroll-snap-type:y mandatory;scroll-padding-top:96px}
body{
  margin:0;font-family:var(--font-sans);font-size:15px;line-height:23px;
  color:var(--bg-cream);background:var(--ink-900);
  -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;
}
h1,h2,h3,h4{margin:0;font-weight:400}
.tab,.num{font-variant-numeric:tabular-nums}
.kicker{font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:var(--coral)}
.meta{font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:var(--ink-400)}

/* Grain overlay */
body::before{
  content:"";position:fixed;inset:0;pointer-events:none;z-index:1;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 0.96  0 0 0 0 0.90  0 0 0 0.04 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  opacity:0.5;mix-blend-mode:screen;
}
main,nav,footer{position:relative;z-index:2}
main{overflow-x:clip}

/* =========================================================================
   NAV — dark
   ========================================================================= */
nav.top{
  position:sticky;top:0;z-index:50;
  background:rgba(20,17,13,0.82);
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  border-bottom:1px solid rgba(248,242,227,0.12);
}
nav.top .wrap{
  max-width:1280px;margin:0 auto;padding:14px 32px;
  display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:32px;
}
.wordmark{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--bg-cream)}
.wordmark .mk{
  width:28px;height:28px;border-radius:8px;background:var(--bg-cream);
  color:var(--ink-900);display:grid;place-items:center;
  font-family:var(--font-display);font-size:18px;line-height:1;transform:translateY(-1px);
}
.wordmark .nm{font-family:var(--font-display);font-size:22px;letter-spacing:-0.01em}
nav.top .links{display:flex;gap:28px;justify-content:center}
nav.top .links a{color:rgba(248,242,227,0.7);text-decoration:none;font-size:14px;font-weight:500;transition:color var(--dur-fast) var(--ease-out);position:relative;padding:4px 0}
nav.top .links a::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:var(--coral);transform:scaleX(0);transform-origin:left;transition:transform var(--dur-base) var(--ease-out)}
nav.top .links a:hover{color:var(--bg-cream)}
nav.top .links a:hover::after{transform:scaleX(1)}
nav.top .actions{display:flex;gap:10px;align-items:center}

.btn{
  display:inline-flex;align-items:center;gap:8px;
  padding:10px 18px;border-radius:999px;font-size:14px;font-weight:500;
  text-decoration:none;border:1px solid transparent;cursor:pointer;
  transition:all var(--dur-fast) var(--ease-out);font-family:inherit;
}
.btn-ghost-inv{color:rgba(248,242,227,0.9)}
.btn-ghost-inv:hover{background:rgba(248,242,227,0.08)}
.btn-coral{background:var(--coral);color:#fff;padding:12px 22px}
.btn-coral:hover{background:var(--coral-hover);transform:translateY(-1px)}
.btn-cream{background:var(--bg-cream);color:var(--ink-900);padding:12px 22px}
.btn-cream:hover{background:#fff;transform:translateY(-1px)}
.btn-outline-inv{border-color:rgba(248,242,227,0.25);color:var(--bg-cream)}
.btn-outline-inv:hover{background:var(--bg-cream);color:var(--ink-900);border-color:var(--bg-cream)}
.btn-outline-ink{border-color:var(--ink-300);color:var(--ink-900)}
.btn-outline-ink:hover{background:var(--ink-900);color:var(--bg-cream);border-color:var(--ink-900)}
.btn-ink{background:var(--ink-900);color:var(--bg-cream);padding:12px 22px}
.btn-ink:hover{background:#000}

/* =========================================================================
   HERO — dark, receipt-centric
   ========================================================================= */
.hero{
  max-width:1280px;margin:0 auto;padding:64px 32px 80px;
  display:grid;grid-template-columns:1.4fr 1fr;gap:48px;align-items:center;
  position:relative;
}
.hero::before{
  content:"";position:absolute;inset:-5% -10%;z-index:-1;
  background:
    radial-gradient(ellipse at 20% 30%, rgba(179,89,64,0.14), transparent 55%),
    radial-gradient(ellipse at 85% 70%, rgba(230,169,58,0.08), transparent 50%);
  pointer-events:none;
}
.hero .eyebrow{
  display:inline-flex;align-items:center;gap:10px;
  padding:6px 14px 6px 8px;border-radius:999px;
  background:rgba(248,242,227,0.06);border:1px solid rgba(248,242,227,0.15);
  font-size:12px;font-weight:500;color:rgba(248,242,227,0.85);
}
.hero .eyebrow .dot{width:8px;height:8px;border-radius:50%;background:var(--teal);position:relative}
.hero .eyebrow .dot::after{content:"";position:absolute;inset:-4px;border-radius:50%;background:var(--teal);opacity:0.3;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:0.3;transform:scale(1)}50%{opacity:0;transform:scale(2)}}

.hero h1{
  font-family:var(--font-display);font-size:clamp(44px,6.4vw,88px);
  line-height:0.96;letter-spacing:-0.025em;margin-top:28px;color:var(--bg-cream);
  text-wrap:balance;
}
.hero h1 em{font-style:italic;color:var(--coral)}
.hero h1 .strike{
  position:relative;display:inline-block;color:rgba(248,242,227,0.45);
  font-style:italic;white-space:nowrap;
}
.hero h1 .strike::after{
  content:"";position:absolute;left:-2%;right:-2%;top:56%;height:3px;
  background:var(--coral);transform:rotate(-2deg);border-radius:2px;
  box-shadow:0 0 0 1px rgba(20,17,13,0.15);
}
.hero .sub{
  margin-top:28px;font-size:18px;line-height:28px;color:rgba(248,242,227,0.72);
  max-width:500px;
}
.hero .ctas{display:flex;gap:12px;margin-top:36px;align-items:center;flex-wrap:wrap}
.hero .ctas .btn-coral{padding:16px 26px;font-size:15px}
.hero .ctas .btn-outline-inv{padding:15px 22px;font-size:15px}
.hero .ctas .meta-inline{
  font-size:13px;color:rgba(248,242,227,0.55);display:flex;align-items:center;gap:6px;margin-left:4px;
}
.hero .ctas .meta-inline svg{width:14px;height:14px;stroke:var(--teal)}

/* ---- The receipt ---- */
.receipt-wrap{position:relative;display:flex;justify-content:center;align-items:center;min-height:560px}
.receipt{
  position:relative;width:100%;max-width:440px;
  background:var(--bg-cream);color:var(--ink-900);
  padding:36px 36px 44px;
  font-family:var(--font-mono);font-size:13px;line-height:22px;
  box-shadow:
    0 48px 96px -28px rgba(0,0,0,0.55),
    0 18px 36px -14px rgba(0,0,0,0.32),
    inset 0 0 0 1px rgba(20,17,13,0.06);
  transform:rotate(-1.6deg);
  transition:transform var(--dur-base) var(--ease-out);
}
.receipt-wrap:hover .receipt{transform:rotate(-0.8deg) translateY(-4px)}
/* Torn edges */
.receipt::before,.receipt::after{
  content:"";position:absolute;left:0;right:0;height:14px;
  background:
    linear-gradient(135deg,transparent 50%,var(--bg-ink) 50%) 0 0/14px 14px,
    linear-gradient(45deg,transparent 50%,var(--bg-ink) 50%) 0 0/14px 14px;
}
.receipt::before{top:-14px;background-position:0 100%,7px 100%;transform:scaleY(-1)}
.receipt::after{bottom:-14px}

.receipt .rc-head{text-align:center;border-bottom:1px dashed var(--ink-300);padding-bottom:18px;margin-bottom:18px}
.receipt .rc-head .logo{
  font-family:var(--font-display);font-size:26px;letter-spacing:-0.01em;line-height:1;
}
.receipt .rc-head .sub{
  font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:var(--ink-500);
  margin-top:6px;
}
.receipt .rc-meta{
  display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;
  font-size:11px;color:var(--ink-700);margin-bottom:18px;
}
.receipt .rc-meta .l{color:var(--ink-500);text-transform:uppercase;letter-spacing:0.1em;font-size:9px}
.receipt .divider{
  border:0;border-top:1px dashed var(--ink-300);margin:14px 0;
}
.receipt .line{display:flex;justify-content:space-between;align-items:baseline;padding:4px 0}
.receipt .line .l{color:var(--ink-700)}
.receipt .line .v{font-weight:500;color:var(--ink-900)}
.receipt .line.faded .v{color:var(--ink-500);text-decoration:line-through}
.receipt .line.deduct .v{color:var(--danger)}
.receipt .line.total{
  padding:12px 0;margin-top:8px;
  border-top:2px solid var(--ink-900);border-bottom:2px solid var(--ink-900);
}
.receipt .line.total .l{font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:var(--ink-500)}
.receipt .line.total .v{
  font-family:var(--font-display);font-size:44px;letter-spacing:-0.02em;line-height:1;color:var(--ink-900);
  display:inline-block;padding:2px 8px;margin:-2px -8px;border-radius:6px;
}
.receipt .line.total .v em{color:var(--coral);font-style:italic}
@keyframes totalFlash{
  0%{background:var(--coral-soft);transform:scale(1.02)}
  60%{background:var(--coral-soft);transform:scale(1.02)}
  100%{background:transparent;transform:scale(1)}
}
.receipt .line.total .v.flash{animation:totalFlash 900ms var(--ease-out);transform-origin:right center}
.receipt .saved-line{
  display:flex;justify-content:space-between;align-items:center;
  margin-top:12px;padding:10px 0;
  border-top:1px dashed var(--ink-300);
  border-bottom:1px dashed var(--ink-300);
}
.receipt .saved-line .l{font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--ink-500);font-weight:600}
.receipt .saved-line .v{font-family:var(--font-display);font-size:22px;color:var(--ink-900);letter-spacing:-0.01em;line-height:1;font-variant-numeric:tabular-nums}
.receipt .saved-line .v em{color:var(--coral);font-style:italic;margin-right:1px}
.receipt .rc-foot{
  margin-top:22px;text-align:center;
  font-size:10px;letter-spacing:0.1em;color:var(--ink-500);
}
.receipt .rc-foot .stamp{
  display:inline-block;margin-top:8px;padding:4px 10px;
  border:1px solid var(--teal-ink);color:var(--teal-ink);
  font-size:9px;letter-spacing:0.2em;text-transform:uppercase;
  transform:rotate(-4deg);font-weight:600;
}
.receipt .barcode{
  margin-top:18px;height:28px;display:flex;gap:2px;
}
.receipt .barcode span{flex:1;background:var(--ink-900);border-radius:1px}
.receipt .barcode span:nth-child(3n){flex:2}
.receipt .barcode span:nth-child(5n){flex:0.5;background:transparent}
.receipt .barcode span:nth-child(7n){flex:1.5}

/* Amount input — the receipt becomes a calculator */
.rc-input-row{
  display:flex;justify-content:space-between;align-items:flex-end;gap:16px;
  padding:6px 0 4px;
}
.rc-input-label{font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:var(--ink-500);padding-bottom:8px;font-weight:600}
.rc-input-wrap{display:inline-flex;align-items:baseline;gap:2px;position:relative}
.rc-input-prefix{font-family:var(--font-display);font-size:36px;line-height:1;color:var(--ink-900);letter-spacing:-0.02em}
.rc-input{
  font-family:var(--font-display);font-size:40px;line-height:1;letter-spacing:-0.02em;
  color:var(--ink-900);background:transparent;border:0;outline:none;
  width:7ch;max-width:160px;text-align:right;
  border-bottom:2px dashed var(--ink-300);padding:2px 0;
  caret-color:var(--coral);font-variant-numeric:tabular-nums;
  transition:border-color var(--dur-fast) var(--ease-out);
}
.rc-input:focus{border-bottom-color:var(--ink-900);border-bottom-style:solid}
.rc-input::-webkit-outer-spin-button,.rc-input::-webkit-inner-spin-button{appearance:none;margin:0}

/* Provider picker — live-ranked, clickable rows */
.rc-providers{
  margin:14px 0 12px;padding:10px 0;
  border-top:1px dashed var(--ink-300);border-bottom:1px dashed var(--ink-300);
  display:flex;flex-direction:column;gap:2px;
}
.rc-p{
  display:grid;grid-template-columns:14px 1fr auto;gap:12px;align-items:center;
  padding:8px 10px;border-radius:8px;cursor:pointer;
  background:transparent;border:0;width:100%;font-family:inherit;
  text-align:left;color:inherit;
  transition:background var(--dur-fast) var(--ease-out);
}
.rc-p:hover{background:var(--bg-paper)}
.rc-p.is-active{background:var(--coral-soft)}
.rc-p-sel{
  width:14px;height:14px;border-radius:50%;
  border:1.5px solid var(--ink-400);position:relative;
  transition:border-color var(--dur-fast) var(--ease-out);
}
.rc-p.is-active .rc-p-sel{border-color:var(--coral)}
.rc-p.is-active .rc-p-sel::after{
  content:"";position:absolute;inset:2px;border-radius:50%;background:var(--coral);
}
.rc-p-name{font-size:12px;color:var(--ink-900);font-weight:500;display:flex;align-items:center;flex-wrap:wrap;gap:6px}
.rc-p-pick{
  font-style:normal;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;
  color:var(--coral);font-weight:700;padding:2px 6px;
  border:1px solid var(--coral);border-radius:3px;
}
.rc-p-amt{font-family:var(--font-display);font-size:19px;letter-spacing:-0.01em;line-height:1;font-variant-numeric:tabular-nums;color:var(--ink-900)}
.rc-p-amt.strike{text-decoration:line-through;color:var(--ink-500)}

/* CTA inside receipt */
.rc-cta{
  margin-top:16px;width:100%;
  display:inline-flex;align-items:center;justify-content:center;gap:10px;
  padding:14px 20px;background:var(--ink-900);color:var(--bg-cream);
  border:0;border-radius:12px;cursor:pointer;
  font-family:var(--font-sans);font-size:14px;font-weight:600;letter-spacing:0.01em;
  transition:all var(--dur-fast) var(--ease-out);
}
.rc-cta:hover{background:var(--coral);color:#fff;transform:translateY(-1px);box-shadow:0 10px 20px -8px rgba(179,89,64,0.4)}
.rc-cta svg{width:16px;height:16px;transition:transform var(--dur-fast) var(--ease-out)}
.rc-cta:hover svg{transform:translateX(3px)}

.rc-guarantee{
  margin-top:10px;text-align:center;
  font-size:10px;letter-spacing:0.14em;text-transform:uppercase;
  color:var(--ink-500);font-weight:600;
}
.rc-guarantee em{font-style:normal;color:var(--coral)}

/* "Competitor receipt" behind as ghost */
.ghost-receipt{
  position:absolute;top:-24px;right:-120px;width:240px;
  background:rgba(248,242,227,0.08);border:1px dashed rgba(248,242,227,0.3);
  padding:18px;font-family:var(--font-mono);font-size:10px;line-height:18px;
  color:rgba(248,242,227,0.5);transform:rotate(5deg);z-index:-1;
  transition:transform var(--dur-base) var(--ease-out);
}
.receipt-wrap:hover .ghost-receipt{transform:rotate(6.5deg) translateY(-2px)}
.ghost-receipt .t{font-family:var(--font-display);font-size:18px;color:rgba(248,242,227,0.6);letter-spacing:-0.01em}
.ghost-receipt .hr{border:0;border-top:1px dashed rgba(248,242,227,0.25);margin:8px 0}
.ghost-receipt .line{display:flex;justify-content:space-between;padding:2px 0}
.ghost-receipt .line .v{color:rgba(248,242,227,0.7)}
.ghost-receipt .line.final .v{color:var(--danger);text-decoration:line-through}
.ghost-receipt::after{
  content:"vs.";position:absolute;left:-28px;top:40%;
  font-family:var(--font-display);font-size:42px;font-style:italic;
  color:var(--coral);transform:rotate(-12deg);
}

/* Floating stamp */
.hero-stamp{
  position:absolute;top:4%;left:-14%;z-index:3;
  background:var(--coral);color:#fff;
  padding:10px 14px;border-radius:4px;
  font-family:var(--font-display);font-size:16px;line-height:18px;letter-spacing:-0.01em;
  transform:rotate(-9deg);
  box-shadow:0 14px 28px -10px rgba(20,17,13,0.35), 0 4px 8px rgba(20,17,13,0.12);
  max-width:140px;text-align:center;
  transition:transform var(--dur-base) var(--ease-out);
}
.receipt-wrap:hover .hero-stamp{transform:rotate(-6deg) translateY(-2px)}
.hero-stamp .k{display:block;font-family:var(--font-sans);font-size:8px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.85);margin-bottom:3px}
.hero-stamp .lock-num{display:block;font-family:var(--font-display);font-size:24px;line-height:1;letter-spacing:-0.02em;font-variant-numeric:tabular-nums}

/* =========================================================================
   TICKER under hero — live rates scrolling
   ========================================================================= */
.ticker{
  border-top:1px solid rgba(248,242,227,0.12);
  border-bottom:1px solid rgba(248,242,227,0.12);
  background:rgba(248,242,227,0.03);
  overflow:hidden;position:relative;
  padding:20px 0;
}
.ticker .track{
  display:flex;gap:48px;width:max-content;
  animation:scroll 40s linear infinite;
  align-items:center;
}
.ticker .chip{
  display:flex;align-items:baseline;gap:10px;white-space:nowrap;
  font-family:var(--font-mono);font-size:12px;color:rgba(248,242,227,0.7);
  font-variant-numeric:tabular-nums;
}
.ticker .chip .n{font-family:var(--font-display);font-size:20px;color:var(--bg-cream);letter-spacing:-0.01em;font-family:var(--font-sans);font-weight:500}
.ticker .chip .r{color:var(--bg-cream);font-weight:500}
.ticker .chip.up .d{color:var(--teal)}
.ticker .chip.down .d{color:var(--coral)}
.ticker .chip .dot-m{width:4px;height:4px;border-radius:50%;background:rgba(248,242,227,0.3)}
@keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* =========================================================================
   SWITCH TO CREAM — the rest of the page lives here
   ========================================================================= */
.cream-wrap{background:var(--bg-cream);color:var(--ink-900);position:relative;z-index:2}
.cream-wrap::before{
  content:"";position:absolute;inset:0;pointer-events:none;z-index:0;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.07  0 0 0 0 0.065  0 0 0 0 0.055  0 0 0 0.05 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  opacity:0.6;mix-blend-mode:multiply;
}
.cream-wrap > *{position:relative;z-index:1}

/* =========================================================================
   SPLIT-SCREEN COMPARISON
   ========================================================================= */
.split{
  max-width:1280px;margin:0 auto;padding:88px 32px 96px;
}
.split .head{max-width:760px;margin-bottom:64px}
.split .head .kicker{color:var(--coral)}
.split .head h2{
  font-family:var(--font-display);font-size:clamp(44px,5.5vw,76px);
  line-height:0.98;letter-spacing:-0.025em;margin-top:20px;
}
.split .head h2 em{color:var(--coral);font-style:italic}

.split .grid{display:grid;grid-template-columns:1fr auto 1fr;gap:28px;align-items:stretch}
.pill{position:relative;border-radius:24px;padding:40px 36px;overflow:hidden;display:flex;flex-direction:column}
.pill .k{font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase}
.pill .who{font-family:var(--font-display);font-size:36px;letter-spacing:-0.02em;line-height:1;margin-top:10px}
.pill .rows{margin-top:24px;display:flex;flex-direction:column;gap:8px;flex:1}
.pill .r{
  display:flex;justify-content:space-between;align-items:baseline;
  padding:12px 0;border-bottom:1px dashed;
}
.pill .r:last-child{border-bottom:none}
.pill .r .l{font-size:13px;font-weight:500}
.pill .r .v{font-family:var(--font-display);font-size:22px;letter-spacing:-0.01em;line-height:1;font-variant-numeric:tabular-nums}
.pill .bottom{
  margin-top:16px;padding-top:20px;border-top:2px solid;
  display:flex;justify-content:space-between;align-items:baseline;
}
.pill .bottom .l{font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase}
.pill .bottom .v{font-family:var(--font-display);font-size:48px;letter-spacing:-0.02em;line-height:1;font-variant-numeric:tabular-nums}
.pill .tag{
  position:absolute;top:22px;right:22px;
  font-family:var(--font-mono);font-size:10px;letter-spacing:0.14em;text-transform:uppercase;
  padding:5px 10px;border:1px solid;border-radius:4px;font-weight:500;
}

.pill.them{
  background:var(--bg-paper);color:var(--ink-900);
  border:1px solid var(--ink-200);
}
.pill.them .k{color:var(--ink-500)}
.pill.them .r{border-color:var(--ink-200)}
.pill.them .r .v.bad{color:var(--danger)}
.pill.them .bottom{border-color:var(--ink-400)}
.pill.them .bottom .l{color:var(--ink-500)}
.pill.them .bottom .v{color:var(--ink-900)}
.pill.them .tag{color:var(--ink-500);border-color:var(--ink-300)}

.pill.us{
  background:var(--ink-900);color:var(--bg-cream);
}
.pill.us .k{color:var(--coral)}
.pill.us .r{border-color:rgba(248,242,227,0.18)}
.pill.us .r .v.good{color:var(--teal)}
.pill.us .bottom{border-color:var(--coral)}
.pill.us .bottom .l{color:var(--coral)}
.pill.us .bottom .v em{color:var(--coral);font-style:italic}
.pill.us .tag{color:var(--coral);border-color:var(--coral)}

.split .vs{
  align-self:center;width:72px;height:72px;border-radius:50%;
  background:var(--coral);color:#fff;
  display:grid;place-items:center;
  font-family:var(--font-display);font-style:italic;font-size:28px;
  box-shadow:0 18px 36px -14px rgba(20,17,13,0.28), 0 0 0 6px var(--bg-cream), 0 0 0 7px rgba(179,89,64,0.12);
  transform:rotate(-6deg);
  position:relative;
  transition:transform var(--dur-base) var(--ease-out);
}
.split:hover .vs{transform:rotate(-2deg) scale(1.04)}

.split .diff{
  grid-column:1/-1;margin-top:28px;
  padding:28px 36px;border-radius:20px;
  background:var(--coral);color:#fff;
  display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap;
}
.split .diff .t{font-family:var(--font-display);font-size:32px;line-height:1.1;letter-spacing:-0.02em;max-width:700px}
.split .diff .t em{font-style:italic;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:6px}
.split .diff .big{font-family:var(--font-display);font-size:72px;letter-spacing:-0.03em;line-height:1;font-variant-numeric:tabular-nums}

/* =========================================================================
   TRUST STATS (big number grid)
   ========================================================================= */
.stats{
  max-width:1280px;margin:0 auto;padding:0 32px 120px;
}
.stats .grid{
  display:grid;grid-template-columns:repeat(4,1fr);
  border:1px solid var(--ink-200);border-radius:24px;overflow:hidden;
  background:var(--bg-white);
}
.stats .cell{
  padding:36px;border-right:1px solid var(--ink-200);
  display:flex;flex-direction:column;gap:8px;position:relative;
  transition:background var(--dur-base) var(--ease-out);
}
.stats .cell::before{
  content:"";position:absolute;left:0;right:0;top:0;height:2px;
  background:var(--coral);transform:scaleX(0);transform-origin:left;
  transition:transform var(--dur-base) var(--ease-out);
}
.stats .cell:hover{background:var(--bg-paper)}
.stats .cell:hover::before{transform:scaleX(1)}
.stats .cell:last-child{border-right:none}
.stats .cell .k{font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:var(--ink-500)}
.stats .cell .v{font-family:var(--font-display);font-size:56px;letter-spacing:-0.025em;line-height:1;font-variant-numeric:tabular-nums}
.stats .cell .v em{color:var(--coral);font-style:italic}
.stats .cell .d{font-size:13px;line-height:19px;color:var(--ink-500);margin-top:6px}

/* =========================================================================
   HOW IT WORKS — magazine columns
   ========================================================================= */
.how{max-width:1280px;margin:0 auto;padding:0 32px 120px}
.how .head{max-width:760px;margin-bottom:64px}
.how .head h2{font-family:var(--font-display);font-size:clamp(40px,5vw,68px);line-height:0.98;letter-spacing:-0.025em;margin-top:18px}
.how .head h2 em{color:var(--coral);font-style:italic}
.how .cols{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-top:1px solid var(--ink-200)}
.how .col{
  padding:36px 28px 36px 0;border-right:1px solid var(--ink-200);
  display:flex;flex-direction:column;
}
.how .col:last-child{border-right:none}
.how .col:not(:first-child){padding-left:28px}
.how .col .n{
  font-family:var(--font-display);font-size:110px;letter-spacing:-0.03em;line-height:0.9;color:var(--ink-900);font-variant-numeric:tabular-nums;
}
.how .col .n em{color:var(--coral);font-style:italic}
.how .col h3{font-family:var(--font-display);font-size:30px;letter-spacing:-0.02em;line-height:1.05;margin-top:18px}
.how .col p{font-size:15px;line-height:23px;color:var(--ink-700);margin-top:14px}
.how .col .pill-tag{
  margin-top:22px;display:inline-flex;align-items:center;gap:8px;width:fit-content;
  padding:6px 12px;border-radius:999px;background:var(--ink-100);
  font-size:11px;font-weight:600;color:var(--ink-700);letter-spacing:0.05em;
}
.how .col .pill-tag .dot{width:6px;height:6px;border-radius:50%;background:var(--teal)}

/* =========================================================================
   CORRIDORS — as departures board
   ========================================================================= */
.corridors{
  background:var(--ink-900);color:var(--bg-cream);
  padding:88px 32px 96px;
  border-top:1px solid var(--ink-200);
}
.corridors .wrap{max-width:1280px;margin:0 auto}
.corridors .head{
  display:grid;grid-template-columns:1fr 1fr;gap:48px;margin-bottom:56px;align-items:end;
}
.corridors .head .kicker{color:var(--coral)}
.corridors .head h2{font-family:var(--font-display);font-size:clamp(40px,5vw,68px);line-height:0.98;letter-spacing:-0.025em;margin-top:16px}
.corridors .head h2 em{color:var(--coral);font-style:italic}
.corridors .head p{font-size:17px;line-height:26px;color:rgba(248,242,227,0.65);max-width:480px}

.board{
  background:rgba(248,242,227,0.03);border:1px solid rgba(248,242,227,0.15);
  border-radius:20px;overflow:hidden;
}
.board .board-head{
  display:grid;grid-template-columns:60px 1.4fr 1fr 1fr 0.7fr 0.6fr;gap:20px;
  padding:16px 28px;border-bottom:1px solid rgba(248,242,227,0.15);
  font-family:var(--font-mono);font-size:10px;letter-spacing:0.14em;text-transform:uppercase;
  color:rgba(248,242,227,0.45);
}
.board .row{
  display:grid;grid-template-columns:60px 1.4fr 1fr 1fr 0.7fr 0.6fr;gap:20px;
  padding:22px 28px;border-bottom:1px solid rgba(248,242,227,0.1);
  align-items:center;font-family:var(--font-mono);font-size:13px;
  transition:background var(--dur-fast) var(--ease-out);
  position:relative;
}
.board .row::before{
  content:"";position:absolute;left:0;top:0;bottom:0;width:2px;
  background:var(--coral);transform:scaleY(0);transform-origin:center;
  transition:transform var(--dur-base) var(--ease-out);
}
.board .row:last-child{border-bottom:none}
.board .row:hover{background:rgba(248,242,227,0.04)}
.board .row:hover::before{transform:scaleY(1)}
.board .row.soon:hover::before{transform:scaleY(0)}
.board .row .code{
  font-family:var(--font-display);font-size:20px;letter-spacing:-0.01em;color:var(--coral);
  line-height:1;
}
.board .row .name{font-family:var(--font-display);font-size:26px;letter-spacing:-0.015em;color:var(--bg-cream);line-height:1.1}
.board .row .pair{color:rgba(248,242,227,0.6);font-size:12px}
.board .row .rate{font-family:var(--font-sans);font-size:20px;color:var(--bg-cream);font-variant-numeric:tabular-nums;font-weight:500}
.board .row .spread{color:rgba(248,242,227,0.55)}
.board .row .status{
  display:inline-flex;align-items:center;gap:6px;
  font-family:var(--font-mono);font-size:10px;letter-spacing:0.14em;text-transform:uppercase;
  color:var(--teal);
}
.board .row .status .dot{width:6px;height:6px;border-radius:50%;background:var(--teal);animation:pulse 2s infinite}
.board .row .status.soon{color:var(--gold)}
.board .row .status.soon .dot{background:var(--gold);animation:none}
.board .row.soon{opacity:0.5}
.board .row.soon .name,.board .row.soon .code{color:rgba(248,242,227,0.5)}

.corridors .cta-row{
  margin-top:32px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;
}
.corridors .cta-row .live-count{
  display:flex;align-items:center;gap:10px;
  font-family:var(--font-mono);font-size:12px;color:rgba(248,242,227,0.55);
}
.corridors .cta-row .live-count .dot{width:8px;height:8px;border-radius:50%;background:var(--teal);animation:pulse 2s infinite}

/* =========================================================================
   TESTIMONIALS — pegboard of torn tickets
   ========================================================================= */
.testis{max-width:1280px;margin:0 auto;padding:88px 32px 72px}
.testis .head{max-width:720px;margin-bottom:72px}
.testis .head h2{font-family:var(--font-display);font-size:clamp(40px,5vw,68px);line-height:0.98;letter-spacing:-0.025em;margin-top:18px}
.testis .head h2 em{color:var(--coral);font-style:italic}
.testis .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px;align-items:start}
.ticket{
  background:var(--bg-paper);padding:28px 28px 24px;
  border:1px solid var(--ink-200);border-radius:4px;
  box-shadow:0 12px 28px -10px rgba(20,17,13,0.12);
  position:relative;
  transition:transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out);
}
.ticket:hover{box-shadow:0 20px 40px -14px rgba(20,17,13,0.18)}
.ticket:nth-child(1):hover{transform:rotate(-0.5deg) translateY(-4px)}
.ticket:nth-child(2):hover{transform:translateY(16px) rotate(0deg)}
.ticket:nth-child(3):hover{transform:rotate(0.2deg) translateY(-4px)}
/* Torn top edge */
.ticket::before{
  content:"";position:absolute;top:-8px;left:-1px;right:-1px;height:10px;
  background:
    linear-gradient(135deg,transparent 50%,var(--bg-cream) 50%) 0 0/12px 10px,
    linear-gradient(45deg,transparent 50%,var(--bg-cream) 50%) 0 0/12px 10px;
}
/* Paper holes */
.ticket::after{
  content:"";position:absolute;top:-12px;left:22px;width:16px;height:16px;border-radius:50%;
  background:var(--bg-cream);box-shadow:inset 0 1px 0 rgba(0,0,0,0.06);
}
.ticket:nth-child(1){transform:rotate(-1.5deg)}
.ticket:nth-child(2){transform:translateY(20px) rotate(1deg)}
.ticket:nth-child(3){transform:rotate(-0.8deg)}

.ticket .top{
  display:flex;justify-content:space-between;align-items:center;
  padding-bottom:12px;border-bottom:1px dashed var(--ink-300);
  margin-bottom:16px;
}
.ticket .top .ref{
  font-family:var(--font-mono);font-size:10px;letter-spacing:0.14em;
  color:var(--ink-500);text-transform:uppercase;
}
.ticket .top .amount{
  font-family:var(--font-display);font-size:22px;letter-spacing:-0.01em;
  color:var(--teal-ink);line-height:1;font-variant-numeric:tabular-nums;
}
.ticket .stars{display:flex;gap:2px;color:var(--gold);margin-bottom:12px}
.ticket .stars svg{width:12px;height:12px;fill:var(--gold);stroke:none}
.ticket blockquote{
  font-family:var(--font-display);font-size:22px;line-height:1.22;
  letter-spacing:-0.01em;color:var(--ink-900);margin:0;
}
.ticket blockquote em{color:var(--coral);font-style:italic}
.ticket .who{
  margin-top:22px;padding-top:16px;border-top:1px dashed var(--ink-300);
  display:flex;align-items:center;gap:12px;
}
.ticket .who .av{
  width:36px;height:36px;border-radius:50%;display:grid;place-items:center;
  font-family:var(--font-display);color:#fff;font-size:15px;letter-spacing:-0.01em;
}
.ticket .who .m{font-size:13px;line-height:1.3;color:var(--ink-700)}
.ticket .who .m b{display:block;color:var(--ink-900);font-weight:600}

/* =========================================================================
   BUDDY PLUS — punch-card aesthetic
   ========================================================================= */
.plus{max-width:1280px;margin:0 auto;padding:0 32px 120px}
.plus .card{
  background:var(--bg-paper);border:1px solid var(--ink-200);
  border-radius:28px;padding:72px;position:relative;overflow:hidden;
}
.plus .card::before{
  content:"";position:absolute;top:0;right:-80px;width:360px;height:360px;
  background:radial-gradient(circle,rgba(179,89,64,0.12),transparent 65%);
  pointer-events:none;
}
.plus .grid{display:grid;grid-template-columns:1.1fr 1fr;gap:72px;align-items:center;position:relative}
.plus .kicker{color:var(--coral)}
.plus h2{font-family:var(--font-display);font-size:clamp(40px,5vw,64px);line-height:1;letter-spacing:-0.025em;margin-top:20px}
.plus h2 em{color:var(--coral);font-style:italic}
.plus p{font-size:16px;line-height:25px;color:var(--ink-700);margin-top:20px;max-width:480px}
.plus .actions{margin-top:28px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}

.punch-card{
  background:var(--ink-900);color:var(--bg-cream);
  border-radius:20px;padding:36px;
  box-shadow:0 24px 48px -16px rgba(20,17,13,0.35);
  transform:rotate(1.5deg);position:relative;
}
.punch-card .k{font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--coral)}
.punch-card .name{font-family:var(--font-display);font-size:32px;letter-spacing:-0.015em;margin-top:10px;line-height:1.05}
.punch-card .name em{color:var(--coral);font-style:italic}
.punch-card ul{list-style:none;margin:24px 0 0;padding:0;display:flex;flex-direction:column;gap:10px}
.punch-card li{display:flex;align-items:flex-start;gap:12px;font-size:14px;line-height:20px;color:rgba(248,242,227,0.82)}
.punch-card li svg{width:16px;height:16px;stroke:var(--coral);flex-shrink:0;margin-top:2px}
.punch-card .price{
  margin-top:24px;padding-top:20px;border-top:1px dashed rgba(248,242,227,0.25);
  display:flex;align-items:baseline;gap:10px;
}
.punch-card .price .v{font-family:var(--font-display);font-size:44px;letter-spacing:-0.02em;line-height:1;font-variant-numeric:tabular-nums}
.punch-card .price .per{color:rgba(248,242,227,0.5);font-size:13px}

/* =========================================================================
   SECURITY
   ========================================================================= */
.security{border-top:1px solid var(--ink-200);border-bottom:1px solid var(--ink-200);background:var(--bg-paper)}
.security .wrap{max-width:1280px;margin:0 auto;padding:56px 32px;display:grid;grid-template-columns:auto 1fr auto;gap:48px;align-items:center}
.security .lead{display:flex;align-items:center;gap:16px}
.security .seal{width:56px;height:56px;border-radius:14px;background:var(--ink-900);color:var(--bg-cream);display:grid;place-items:center}
.security .seal svg{width:24px;height:24px;stroke:var(--coral)}
.security .lead .t{font-family:var(--font-display);font-size:22px;letter-spacing:-0.01em;line-height:1.2}
.security .lead .t em{color:var(--coral);font-style:italic}
.security .lead .s{font-size:12.5px;color:var(--ink-500);line-height:18px;margin-top:4px}
.security .badges{display:flex;gap:12px;flex-wrap:wrap}
.security .badge{
  font-family:var(--font-mono);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;
  color:var(--ink-700);padding:8px 12px;border:1px solid var(--ink-300);border-radius:8px;
}

/* =========================================================================
   APP DOWNLOAD
   ========================================================================= */
.app{max-width:1280px;margin:0 auto;padding:88px 32px 96px;display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center}
.app .copy .kicker{color:var(--coral)}
.app .copy h2{font-family:var(--font-display);font-size:clamp(40px,5vw,68px);line-height:0.98;letter-spacing:-0.025em;margin-top:18px}
.app .copy h2 em{color:var(--coral);font-style:italic}
.app .copy p{font-size:16px;line-height:25px;color:var(--ink-700);margin-top:20px;max-width:480px}
.app .stores{margin-top:28px;display:flex;gap:12px;flex-wrap:wrap}
.store{
  display:inline-flex;align-items:center;gap:12px;
  padding:14px 20px;background:var(--ink-900);color:var(--bg-cream);
  border-radius:14px;text-decoration:none;
  transition:all var(--dur-fast) var(--ease-out);
}
.store:hover{background:#000;transform:translateY(-2px)}
.store svg{width:22px;height:22px;fill:currentColor}
.store .st{display:flex;flex-direction:column;line-height:1.1}
.store .st .lil{font-size:10px;color:rgba(248,242,227,0.6);letter-spacing:0.08em;text-transform:uppercase}
.store .st .big{font-family:var(--font-display);font-size:18px;letter-spacing:-0.01em;margin-top:3px}

.phone{
  position:relative;width:100%;max-width:360px;margin:0 auto;
  aspect-ratio:9/18;background:var(--ink-900);border-radius:44px;border:10px solid var(--ink-900);
  box-shadow:0 40px 80px -30px rgba(20,17,13,0.35);overflow:hidden;
}
.phone .screen{position:absolute;inset:0;background:var(--bg-cream);padding:28px 20px;display:flex;flex-direction:column;gap:16px}
.phone .status{display:flex;justify-content:space-between;font-size:11px;font-weight:600;color:var(--ink-900);font-variant-numeric:tabular-nums}
.phone .greet{font-family:var(--font-display);font-size:28px;letter-spacing:-0.02em;line-height:1.1;margin-top:8px}
.phone .greet em{color:var(--coral);font-style:italic}
.phone .amt-card{background:var(--ink-900);color:var(--bg-cream);border-radius:22px;padding:20px}
.phone .amt-card .k{font-size:9px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:rgba(248,242,227,0.55)}
.phone .amt-card .v{font-family:var(--font-display);font-size:42px;letter-spacing:-0.02em;line-height:1;margin-top:6px;font-variant-numeric:tabular-nums}
.phone .amt-card .v .peso{color:var(--coral);font-style:italic}
.phone .amt-card .tiny{font-size:11px;color:rgba(248,242,227,0.55);margin-top:12px;display:flex;justify-content:space-between}
.phone .row-p{display:flex;justify-content:space-between;align-items:center;padding:14px;background:#fff;border:1px solid var(--ink-200);border-radius:14px}
.phone .row-p .left{display:flex;align-items:center;gap:10px}
.phone .row-p .logo{width:30px;height:30px;border-radius:8px;display:grid;place-items:center;font-size:11px;font-weight:600}
.phone .row-p .n{font-weight:600;font-size:13px}
.phone .row-p .get{font-family:var(--font-display);font-size:18px;letter-spacing:-0.01em;font-variant-numeric:tabular-nums}

/* =========================================================================
   FAQ
   ========================================================================= */
.faq{max-width:1280px;margin:0 auto;padding:0 32px 120px;display:grid;grid-template-columns:1fr 1.4fr;gap:96px;align-items:start}
.faq .head .kicker{color:var(--coral)}
.faq .head h2{font-family:var(--font-display);font-size:clamp(40px,5vw,60px);line-height:0.98;letter-spacing:-0.025em;margin-top:16px}
.faq .head h2 em{color:var(--coral);font-style:italic}
.faq .head p{font-size:15px;color:var(--ink-700);margin-top:16px;line-height:23px}
.faq .list{border-top:1px solid var(--ink-200)}
.faq details{border-bottom:1px solid var(--ink-200);padding:22px 0}
.faq summary{
  list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px;
  font-family:var(--font-display);font-size:22px;letter-spacing:-0.01em;color:var(--ink-900);
  transition:color var(--dur-fast) var(--ease-out);
}
.faq summary:hover{color:var(--coral)}
.faq summary::-webkit-details-marker{display:none}
.faq summary .plus-ic{
  width:28px;height:28px;border-radius:50%;border:1px solid var(--ink-300);
  display:grid;place-items:center;transition:all var(--dur-base) var(--ease-out);flex-shrink:0;
  font-family:var(--font-sans);font-size:16px;color:var(--ink-900);line-height:1;
}
.faq summary:hover .plus-ic{border-color:var(--coral);color:var(--coral)}
.faq details[open] summary{color:var(--ink-900)}
.faq details[open] summary .plus-ic{background:var(--ink-900);color:var(--bg-cream);border-color:var(--ink-900);transform:rotate(45deg)}
.faq details p{margin:14px 0 0;font-size:14.5px;line-height:22px;color:var(--ink-700);max-width:640px;font-family:var(--font-sans);animation:faqOpen var(--dur-base) var(--ease-out)}
@keyframes faqOpen{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}

/* =========================================================================
   FINAL CTA — return to dark
   ========================================================================= */
.final-cta{background:var(--ink-900);color:var(--bg-cream);padding:88px 32px 96px;position:relative;overflow:hidden;border-top:1px solid var(--ink-200)}
.final-cta::before{
  content:"";position:absolute;inset:0;
  background:radial-gradient(ellipse at 15% 50%, rgba(179,89,64,0.2), transparent 45%);
}
.final-cta .wrap{max-width:1280px;margin:0 auto;position:relative;display:grid;grid-template-columns:1.2fr 1fr;gap:48px;align-items:end}
.final-cta .kicker{color:var(--coral)}
.final-cta h2{font-family:var(--font-display);font-size:clamp(52px,6.8vw,104px);line-height:0.94;letter-spacing:-0.03em;margin-top:18px;text-wrap:balance}
.final-cta h2 em{color:var(--coral);font-style:italic}
.final-cta .side p{font-size:17px;line-height:26px;color:rgba(248,242,227,0.7);max-width:420px}
.final-cta .actions{margin-top:28px;display:flex;gap:12px;flex-wrap:wrap}
.final-cta .actions .btn-coral{padding:16px 28px;font-size:15px}

/* =========================================================================
   FOOTER — dark
   ========================================================================= */
footer{background:var(--ink-900);color:var(--bg-cream);border-top:1px solid rgba(248,242,227,0.12);padding:72px 32px 40px}
footer .wrap{max-width:1280px;margin:0 auto}
footer .top{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr 1fr;gap:48px}
footer .brand p{font-size:13px;color:rgba(248,242,227,0.55);line-height:20px;margin-top:16px;max-width:320px}
footer .col h4{font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:rgba(248,242,227,0.5);margin-bottom:16px}
footer .col ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
footer .col a{text-decoration:none;color:var(--bg-cream);font-size:14px;transition:color var(--dur-fast)}
footer .col a:hover{color:var(--coral)}
footer .btm{margin-top:56px;padding-top:28px;border-top:1px solid rgba(248,242,227,0.12);display:flex;justify-content:space-between;flex-wrap:wrap;gap:16px;font-size:12px;color:rgba(248,242,227,0.45)}
footer .btm .curs{font-family:var(--font-mono);letter-spacing:0.08em;text-transform:uppercase}

/* Scroll reveal — panels that settle into place */
.reveal{opacity:0;transform:translateY(48px) scale(0.985);transition:opacity 720ms var(--ease-out), transform 720ms var(--ease-out)}
.reveal.is-in{opacity:1;transform:none}

/* Stagger — how-it-works columns */
.how .col.reveal:nth-child(1){transition-delay:0ms}
.how .col.reveal:nth-child(2){transition-delay:100ms}
.how .col.reveal:nth-child(3){transition-delay:200ms}

/* Stagger — stats cells */
.stats .cell.reveal:nth-child(1){transition-delay:0ms}
.stats .cell.reveal:nth-child(2){transition-delay:80ms}
.stats .cell.reveal:nth-child(3){transition-delay:160ms}
.stats .cell.reveal:nth-child(4){transition-delay:240ms}

/* Stagger — corridors board rows (departures cascade) */
.board .row.reveal{transition-duration:560ms}
.board .row.reveal:nth-child(2){transition-delay:40ms}
.board .row.reveal:nth-child(3){transition-delay:90ms}
.board .row.reveal:nth-child(4){transition-delay:140ms}
.board .row.reveal:nth-child(5){transition-delay:190ms}
.board .row.reveal:nth-child(6){transition-delay:240ms}
.board .row.reveal:nth-child(7){transition-delay:290ms}
.board .row.reveal:nth-child(8){transition-delay:340ms}
.board .row.reveal:nth-child(9){transition-delay:390ms}

@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important}
  .reveal{opacity:1;transform:none}
  html{scroll-snap-type:none}
}

/* Scroll snap — panels catch at section boundaries (proximity, not jail) */
.hero, .split, .stats, .how, .corridors, .testis, .plus, .app, .faq, .final-cta, footer{
  scroll-snap-align:start;
}
/* Short / transitional bands opt out so they don't cause awkward mid-page halts */
.ticker, .security{scroll-snap-align:none}

/* Mobile */
@media (max-width: 960px){
  .hero{grid-template-columns:1fr;gap:48px;padding:48px 20px 60px}
  .receipt-wrap{min-height:auto}
  .ghost-receipt{display:none}
  .hero-stamp{left:auto;right:0;top:-10px}
  .split{padding:80px 20px}
  .split .grid{grid-template-columns:1fr;gap:20px}
  .split .vs{margin:0 auto;transform:rotate(-6deg)}
  .split .diff{padding:24px}
  .split .diff .big{font-size:48px}
  .stats .grid{grid-template-columns:1fr 1fr}
  .stats .cell{border-bottom:1px solid var(--ink-200)}
  .stats .cell:nth-child(2n){border-right:none}
  .how .cols{grid-template-columns:1fr}
  .how .col{border-right:none;border-bottom:1px solid var(--ink-200);padding:28px 0 28px 0 !important}
  .corridors{padding:72px 20px}
  .corridors .head{grid-template-columns:1fr;gap:24px}
  .board{overflow-x:auto}
  .board .board-head,.board .row{grid-template-columns:60px 200px 120px 120px 90px 90px;min-width:680px}
  .testis{padding:80px 20px}
  .testis .grid{grid-template-columns:1fr;gap:32px}
  .ticket:nth-child(n){transform:none}
  .plus .card{padding:40px 28px}
  .plus .grid{grid-template-columns:1fr;gap:40px}
  .security .wrap{grid-template-columns:1fr;gap:24px}
  .app{grid-template-columns:1fr;gap:40px;padding:80px 20px}
  .faq{grid-template-columns:1fr;gap:32px;padding:0 20px 80px}
  .final-cta .wrap{grid-template-columns:1fr;gap:32px}
  footer .top{grid-template-columns:1fr 1fr;gap:32px}
  nav.top .links{display:none}
}
`

const HTML = String.raw`

<!-- ===== NAV ===== -->
<nav class="top" data-screen-label="Nav">
  <div class="wrap">
    <a href="/" class="wordmark"><span class="mk">R</span><span class="nm">Remittance Buddy</span></a>
    <div class="links">
      <a href="/compare">Compare</a>
      <a href="#how">How it works</a>
      <a href="#corridors">Corridors</a>
      <a href="/pricing">Buddy Plus</a>
      <a href="#faq">FAQ</a>
    </div>
    <div class="actions">
      <a href="/sign-in" class="btn btn-ghost-inv">Sign in</a>
      <a href="/compare" class="btn btn-coral">Compare rates →</a>
    </div>
  </div>
</nav>

<main>

<!-- ===== HERO ===== -->
<section class="hero" data-screen-label="01 Hero">
  <div>
    <div class="eyebrow"><span class="dot"></span>Live rates · 11 corridors · Next refresh in <span class="tab" id="refresh-timer">0:42</span></div>

    <h1>
      The receipt <em>doesn't lie</em>.<br/>
      <span class="strike">Western Union</span> does.
    </h1>

    <p class="sub">
      Every remittance provider says "low fees, great rates". We compare all twelve — live, every 60 seconds — and show you the actual pesos your family will hold. Nothing estimated. Nothing spun.
    </p>

    <div class="ctas">
      <a href="/compare" class="btn btn-coral">Compare rates now →</a>
      <a href="#how" class="btn btn-outline-inv">See how it works</a>
      <span class="meta-inline">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Free · no account needed
      </span>
    </div>
  </div>

  <div class="receipt-wrap">
    <div class="hero-stamp">
      <span class="k">Rate locked</span>
      <span class="lock-num" id="rate-lock-timer">30:00</span>
    </div>

    <!-- Ghost competitor receipt -->
    <div class="ghost-receipt" aria-hidden="true">
      <div class="t">Western Union</div>
      <div class="hr"></div>
      <div class="line"><span>You send</span><span class="v">$<span id="g-send">500</span></span></div>
      <div class="line"><span>Rate</span><span class="v">₱<span id="g-rate">55.42</span></span></div>
      <div class="line"><span>Fee</span><span class="v">$<span id="g-fee">5.00</span></span></div>
      <div class="hr"></div>
      <div class="line final"><span>Recipient gets</span><span class="v">₱<span id="g-receive">27,432</span></span></div>
    </div>

    <!-- Main receipt — live, typing-style -->
    <div class="receipt">
      <div class="rc-head">
        <div class="logo">Remittance Buddy</div>
        <div class="sub">Ref RB-<span id="refCode">0427A</span> · <span id="dateStamp">Oct 14 · 09:41 PDT</span></div>
      </div>

      <div class="rc-meta">
        <div><div class="l">Sender</div>Maricel C. · NYC</div>
        <div><div class="l">Recipient</div>Mama · Batangas</div>
        <div><div class="l">Method</div>GCash</div>
        <div><div class="l">Corridor</div>USD → PHP</div>
      </div>

      <hr class="divider"/>

      <div class="rc-input-row">
        <span class="rc-input-label">You send</span>
        <div class="rc-input-wrap">
          <span class="rc-input-prefix">$</span>
          <input type="text" inputmode="decimal" class="rc-input" id="r-amount" value="500" aria-label="Amount to send in USD" />
        </div>
      </div>

      <div class="rc-providers" role="radiogroup" aria-label="Choose provider">
        <button type="button" class="rc-p is-active" data-idx="0" role="radio" aria-checked="true">
          <span class="rc-p-sel"></span>
          <span class="rc-p-name">Remitly <em class="rc-p-pick">Buddy's pick</em></span>
          <span class="rc-p-amt tab">₱28,268</span>
        </button>
        <button type="button" class="rc-p" data-idx="1" role="radio" aria-checked="false">
          <span class="rc-p-sel"></span>
          <span class="rc-p-name">Wise</span>
          <span class="rc-p-amt tab">₱27,966</span>
        </button>
        <button type="button" class="rc-p" data-idx="2" role="radio" aria-checked="false">
          <span class="rc-p-sel"></span>
          <span class="rc-p-name">Western Union</span>
          <span class="rc-p-amt tab strike">₱27,432</span>
        </button>
      </div>

      <div class="line"><span class="l">Rate via <span id="r-provider">Remitly</span></span><span class="v tab">₱<span id="r-rate">56.82</span> / $1</span></div>
      <div class="line deduct"><span class="l">Provider fee</span><span class="v tab">−$<span id="r-provider-fee">0.00</span></span></div>
      <div class="line deduct"><span class="l">Buddy platform fee (0.5%)</span><span class="v tab">−$<span id="r-platform-fee">2.50</span></span></div>

      <div class="line total">
        <span class="l">Mama gets</span>
        <span class="v">₱<em><span class="tab" id="r-receive">28,268</span></em></span>
      </div>

      <div class="saved-line">
        <span class="l">More than Western Union</span>
        <span class="v tab"><em>+</em>₱<span id="r-saved">831</span></span>
      </div>

      <button type="button" class="rc-cta" id="rc-cta">
        <span>Send via <span id="rc-cta-name">Remitly</span></span>
        <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>

      <div class="rc-guarantee"><em>₱50</em> best-price guarantee · 30-min rate lock</div>

      <div class="barcode" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
    </div>
  </div>
</section>

<!-- ===== TICKER ===== -->
<div class="ticker" aria-label="Live provider rates">
  <div class="track" id="ticker-track"></div>
</div>

<div class="cream-wrap">

  <!-- ===== SPLIT-SCREEN COMPARISON ===== -->
  <section class="split" id="split" data-screen-label="02 Split comparison">
    <div class="head">
      <div class="kicker">The math, side by side</div>
      <h2>Same $500, <em>1,307 more pesos</em> in mama's hands.</h2>
    </div>

    <div class="grid">
      <div class="pill them">
        <span class="tag">The big one</span>
        <span class="k">With Western Union</span>
        <span class="who">Sending $500.</span>
        <div class="rows">
          <div class="r"><span class="l">Rate</span><span class="v bad">₱55.42</span></div>
          <div class="r"><span class="l">Transfer fee</span><span class="v bad">$5.00</span></div>
          <div class="r"><span class="l">FX spread (hidden)</span><span class="v bad">$11.80</span></div>
          <div class="r"><span class="l">Delivery</span><span class="v">2 hours · cash pickup</span></div>
        </div>
        <div class="bottom">
          <span class="l">Mama receives</span>
          <span class="v">₱27,437</span>
        </div>
      </div>

      <div class="vs" aria-hidden="true">vs.</div>

      <div class="pill us">
        <span class="tag">Buddy's pick</span>
        <span class="k">With Buddy → Remitly</span>
        <span class="who">Same $500.</span>
        <div class="rows">
          <div class="r"><span class="l">Rate</span><span class="v good">₱56.82</span></div>
          <div class="r"><span class="l">Provider fee</span><span class="v good">$0.00</span></div>
          <div class="r"><span class="l">Buddy platform fee</span><span class="v good">$2.50</span></div>
          <div class="r"><span class="l">Delivery</span><span class="v">2 min · direct to GCash</span></div>
        </div>
        <div class="bottom">
          <span class="l">Mama receives</span>
          <span class="v"><em>₱28,268</em></span>
        </div>
      </div>

      <div class="diff">
        <div class="t">That's a week of groceries, <em>every payday</em>. Multiply it by the 12 sends she's making this year.</div>
        <div class="big">+$276 / yr</div>
      </div>
    </div>
  </section>

  <!-- ===== STATS ===== -->
  <section class="stats" data-screen-label="03 Stats">
    <div class="grid">
      <div class="cell">
        <span class="k">Senders this month</span>
        <span class="v num" data-count-to="47218">47,218</span>
        <span class="d">Kabayans using live data to beat the system.</span>
      </div>
      <div class="cell">
        <span class="k">Saved this year</span>
        <span class="v num">$<span data-count-to="2400000">2.4M</span></span>
        <span class="d">Pesos that stayed with families, not providers.</span>
      </div>
      <div class="cell">
        <span class="k">Average save / send</span>
        <span class="v num"><em>$<span data-count-to="23">23</span></em></span>
        <span class="d">Enough to cover mama's weekly groceries.</span>
      </div>
      <div class="cell">
        <span class="k">Rate refresh</span>
        <span class="v num"><span data-count-to="60">60</span>s</span>
        <span class="d">Not cached. Live quotes from every provider.</span>
      </div>
    </div>
  </section>

  <!-- ===== HOW IT WORKS ===== -->
  <section class="how" id="how" data-screen-label="04 How it works">
    <div class="head">
      <div class="kicker" style="color:var(--coral)">Three steps · About 90 seconds</div>
      <h2>Type an amount. We do the <em>mathematical donkey work</em>.</h2>
    </div>
    <div class="cols">
      <div class="col">
        <div class="n">0<em>1</em></div>
        <h3>Tell us the amount.</h3>
        <p>$100, $500, $1,000 — or any number in between. Pick your corridor and how mama wants to receive it. No account, no friction, no upsell.</p>
        <span class="pill-tag"><span class="dot"></span>No signup required</span>
      </div>
      <div class="col">
        <div class="n">0<em>2</em></div>
        <h3>We rank twelve providers.</h3>
        <p>Live quotes, every 60 seconds, from every major remittance rail. Fees, FX spread, delivery time — all exposed. We show the math because we're confident in it.</p>
        <span class="pill-tag"><span class="dot"></span>Refreshed 0:37 ago</span>
      </div>
      <div class="col">
        <div class="n">0<em>3</em></div>
        <h3>Send through the best route.</h3>
        <p>One tap. You save an average of $23 per transfer vs. the provider most kabayans use by default. Rate locked for 30 minutes. Your family holds more pesos. That's it.</p>
        <span class="pill-tag"><span class="dot"></span>Avg delivery: 4 min</span>
      </div>
    </div>
  </section>
</div>

<!-- ===== CORRIDORS — dark board ===== -->
<section class="corridors" id="corridors" data-screen-label="05 Corridors">
  <div class="wrap">
    <div class="head">
      <div>
        <div class="kicker">Corridors · Departures board</div>
        <h2>Eleven corridors live. <em>Three more boarding</em>.</h2>
      </div>
      <p>The US-PH route is our main engine, but we've tuned every corridor the diaspora actually uses — GCash, Maya, BDO, BPI, Landbank — all live, all ranked.</p>
    </div>

    <div class="board">
      <div class="board-head">
        <span>Code</span>
        <span>Corridor</span>
        <span>Live rate</span>
        <span>Best provider</span>
        <span>Spread</span>
        <span>Status</span>
      </div>

      <div class="row">
        <span class="code">US→PH</span>
        <span><div class="name">United States → Philippines</div><div class="pair">USD · PHP</div></span>
        <span class="rate tab">₱56.82</span>
        <span>Remitly</span>
        <span class="spread tab">0.30%</span>
        <span class="status"><span class="dot"></span>On time</span>
      </div>
      <div class="row">
        <span class="code">UK→PH</span>
        <span><div class="name">United Kingdom → Philippines</div><div class="pair">GBP · PHP</div></span>
        <span class="rate tab">₱72.14</span>
        <span>Wise</span>
        <span class="spread tab">0.42%</span>
        <span class="status"><span class="dot"></span>On time</span>
      </div>
      <div class="row">
        <span class="code">SG→PH</span>
        <span><div class="name">Singapore → Philippines</div><div class="pair">SGD · PHP</div></span>
        <span class="rate tab">₱42.38</span>
        <span>Remitly</span>
        <span class="spread tab">0.28%</span>
        <span class="status"><span class="dot"></span>On time</span>
      </div>
      <div class="row">
        <span class="code">AE→PH</span>
        <span><div class="name">UAE → Philippines</div><div class="pair">AED · PHP</div></span>
        <span class="rate tab">₱15.48</span>
        <span>Sendwave</span>
        <span class="spread tab">0.35%</span>
        <span class="status"><span class="dot"></span>On time</span>
      </div>
      <div class="row">
        <span class="code">SA→PH</span>
        <span><div class="name">Saudi Arabia → Philippines</div><div class="pair">SAR · PHP</div></span>
        <span class="rate tab">₱15.14</span>
        <span>Xoom</span>
        <span class="spread tab">0.41%</span>
        <span class="status"><span class="dot"></span>On time</span>
      </div>
      <div class="row">
        <span class="code">CA→PH</span>
        <span><div class="name">Canada → Philippines</div><div class="pair">CAD · PHP</div></span>
        <span class="rate tab">₱41.92</span>
        <span>Wise</span>
        <span class="spread tab">0.38%</span>
        <span class="status"><span class="dot"></span>On time</span>
      </div>
      <div class="row">
        <span class="code">AU→PH</span>
        <span><div class="name">Australia → Philippines</div><div class="pair">AUD · PHP</div></span>
        <span class="rate tab">₱37.60</span>
        <span>WorldRemit</span>
        <span class="spread tab">0.45%</span>
        <span class="status"><span class="dot"></span>On time</span>
      </div>
      <div class="row soon">
        <span class="code">MX→PH</span>
        <span><div class="name">Mexico → Philippines</div><div class="pair">MXN · PHP</div></span>
        <span class="rate">—</span>
        <span>—</span>
        <span class="spread">—</span>
        <span class="status soon"><span class="dot"></span>Q2 2026</span>
      </div>
    </div>

    <div class="cta-row">
      <span class="live-count"><span class="dot"></span>Next refresh in 0:23 · 11 live corridors</span>
      <a href="#" class="btn btn-outline-inv">Request your corridor →</a>
    </div>
  </div>
</section>

<div class="cream-wrap">

  <!-- ===== TESTIMONIALS ===== -->
  <section class="testis" data-screen-label="06 Testimonials">
    <div class="head">
      <div class="kicker">Kabayan voices · 4.9 / 5 from 1,240 senders</div>
      <h2>Real transfers. <em>Real ₱</em>.</h2>
    </div>
    <div class="grid">
      <div class="ticket">
        <div class="top">
          <span class="ref">Ref · RB-4418C</span>
          <span class="amount">+₱84.22 saved</span>
        </div>
        <div class="stars">
          <svg viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg><svg viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg><svg viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg><svg viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg><svg viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg>
        </div>
        <blockquote>"Naka-save ako ng <em>$84 last month</em> lang. Same $500, same GCash — Buddy found a route my bank never showed me."</blockquote>
        <div class="who">
          <div class="av" style="background:var(--coral)">MC</div>
          <div class="m"><b>Maricel C.</b>RN · Queens, NY · → Batangas</div>
        </div>
      </div>

      <div class="ticket">
        <div class="top">
          <span class="ref">Ref · RB-8821D</span>
          <span class="amount">+₱312 saved</span>
        </div>
        <div class="stars">
          <svg viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg><svg viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg><svg viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg><svg viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg><svg viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg>
        </div>
        <blockquote>"I send AED 2,000 every second Friday. The <em>rate alerts</em> mean I don't stare at my phone anymore — Buddy just tells me when to go."</blockquote>
        <div class="who">
          <div class="av" style="background:var(--teal)">JR</div>
          <div class="m"><b>Jomari R.</b>Civil engineer · Dubai · → Cebu</div>
        </div>
      </div>

      <div class="ticket">
        <div class="top">
          <span class="ref">Ref · RB-2209B</span>
          <span class="amount">+₱1,140 saved</span>
        </div>
        <div class="stars">
          <svg viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg><svg viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg><svg viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg><svg viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg><svg viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg>
        </div>
        <blockquote>"I was sending with Western Union for 8 years. <em>Parang na-loko ako</em> all along. This app finally shows the actual math."</blockquote>
        <div class="who">
          <div class="av" style="background:var(--gold-ink);color:var(--gold-soft)">LD</div>
          <div class="m"><b>Lorna D.</b>Caregiver · Toronto · → Iloilo</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== BUDDY PLUS ===== -->
  <section class="plus" id="plus" data-screen-label="07 Buddy Plus">
    <div class="card">
      <div class="grid">
        <div>
          <div class="kicker">Buddy Plus · Loyalty</div>
          <h2>For the ones who send <em>every payday</em>.</h2>
          <p>Built for regular senders — lock in lower FX, get first access to new corridors, earn credit every time you refer a kabayan who's still paying the Western Union tax.</p>
          <div class="actions">
            <a href="/pricing" class="btn btn-ink">Join Buddy Plus →</a>
            <a href="/sign-up" class="btn btn-outline-ink">Refer &amp; earn</a>
          </div>
        </div>
        <div class="punch-card">
          <div class="k">Plus member</div>
          <div class="name">Unlimited sends. <em>Zero Buddy fee</em>.</div>
          <ul>
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>0% Buddy fee on every transfer</li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>$25 credit per kabayan you refer</li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>Priority support · Tagalog + English</li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>First access to new corridors</li>
          </ul>
          <div class="price"><span class="v">$4.99</span><span class="per">/ month · cancel anytime</span></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== SECURITY ===== -->
  <section class="security">
    <div class="wrap">
      <div class="lead">
        <div class="seal">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><path d="M12 22s8-4.5 8-12V5l-8-3-8 3v5c0 7.5 8 12 8 12z" stroke-linecap="round" stroke-linejoin="round"/><path d="m9 12 2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div>
          <div class="t">Licensed, audited, <em>BSP-registered</em>.</div>
          <div class="s">Your transfer is protected every step of the way.</div>
        </div>
      </div>
      <div class="badges">
        <span class="badge">BSP — PH</span>
        <span class="badge">FinCEN MSB</span>
        <span class="badge">FCA UK</span>
        <span class="badge">SOC 2 · Type II</span>
        <span class="badge">256-bit TLS</span>
      </div>
      <a href="#" class="btn btn-outline-ink">Security details →</a>
    </div>
  </section>

  <!-- ===== APP DOWNLOAD ===== -->
  <section class="app" data-screen-label="08 App download">
    <div class="copy">
      <div class="kicker">Mobile app · iOS &amp; Android</div>
      <h2>Magpadala <em>sa likod ng bahay</em>, in under a minute.</h2>
      <p>Set a recipient once. Lock in your favorite corridors. Compare, tap, done — from the bus, from the break room, from your sofa at 2am when you remember mama needs her pamasko.</p>
      <div class="stores">
        <a href="#" class="store">
          <svg viewBox="0 0 384 512"><path d="M318 272c-1-78 63-115 66-117-36-53-92-60-112-61-47-5-92 28-116 28-24 0-61-27-100-27-51 1-99 30-125 76-54 92-14 229 38 304 26 37 56 77 96 76 39-2 53-25 99-25 46 0 59 25 100 24 41-1 67-37 92-74 29-43 41-85 42-87-1 0-80-31-80-117zM241 116c21-26 36-62 32-98-31 1-69 21-91 46-20 22-37 58-32 93 35 3 71-17 91-41z"/></svg>
          <span class="st"><span class="lil">Download on the</span><span class="big">App Store</span></span>
        </a>
        <a href="#" class="store">
          <svg viewBox="0 0 512 512"><path d="M48 55v402c0 12 14 19 24 12l330-198c10-6 10-20 0-26L72 43c-10-7-24 0-24 12zm340 190l-60 36-66-66 66-66 60 36c9 5 9 55 0 60zm-80 48L88 435c-10 6-20-1-20-11V88c0-10 10-17 20-11l220 128-80 88 80 100z"/></svg>
          <span class="st"><span class="lil">Get it on</span><span class="big">Google Play</span></span>
        </a>
      </div>
    </div>
    <div class="phone" aria-hidden="true">
      <div class="screen">
        <div class="status"><span>9:41</span><span>●●● 5G ▪</span></div>
        <div class="greet">Magandang umaga, <em>Maricel</em>.</div>
        <div class="amt-card">
          <div class="k">Mama's GCash will get</div>
          <div class="v"><span class="peso">₱</span>28,410</div>
          <div class="tiny"><span>$500 USD sent</span><span>2 min delivery</span></div>
        </div>
        <div class="row-p">
          <div class="left"><div class="logo" style="background:#FEE8D9;color:#A33F00">RE</div><div class="n">Remitly</div></div>
          <div class="get">₱28,410</div>
        </div>
        <div class="row-p">
          <div class="left"><div class="logo" style="background:#E1F2EB;color:#0A4A40">WI</div><div class="n">Wise</div></div>
          <div class="get">₱28,084</div>
        </div>
        <div class="row-p">
          <div class="left"><div class="logo" style="background:#FAE3DE;color:#7A1C0B">WE</div><div class="n">Western U.</div></div>
          <div class="get">₱27,782</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== FAQ ===== -->
  <section class="faq" id="faq" data-screen-label="09 FAQ">
    <div class="head">
      <div class="kicker">FAQ · We reply fast</div>
      <h2>The ones you <em>actually ask</em>.</h2>
      <p>Message us — a real person in Manila or NYC replies within a few hours.</p>
    </div>
    <div class="list">
      <details open>
        <summary>Is Remittance Buddy free? <span class="plus-ic">+</span></summary>
        <p>Yes, completely free to compare. We charge a flat 0.5% platform fee only when you choose to send through our rail — shown on screen before you confirm. If you pick an affiliate provider instead, we earn a referral fee from them, not from you.</p>
      </details>
      <details>
        <summary>How do you get the live rates? <span class="plus-ic">+</span></summary>
        <p>We pull directly from each provider's public quote endpoint, refreshing every 60 seconds. We show the mid-market rate, the provider's offered rate, and the implied FX spread — nothing estimated or padded.</p>
      </details>
      <details>
        <summary>Why Philippines first? <span class="plus-ic">+</span></summary>
        <p>The US → Philippines corridor has unique mechanics — GCash as the dominant wallet, provincial bank routing rules, typical send amounts of $100–$1,000. Generic comparison tools rank providers using global averages and get it wrong. We tuned for this corridor first.</p>
      </details>
      <details>
        <summary>Do I need an account? <span class="plus-ic">+</span></summary>
        <p>No. You can compare rates and get a recommendation without signing up. A free account just saves recipients, tracks your sends, and unlocks rate alerts.</p>
      </details>
      <details>
        <summary>Which providers do you cover? <span class="plus-ic">+</span></summary>
        <p>Wise, Remitly, Western Union, Xoom, MoneyGram, WorldRemit, Ria, Revolut, Zelle, PayPal, Sendwave, Payoneer — and more every quarter. Tell us if we're missing one you use; we prioritise by demand.</p>
      </details>
      <details>
        <summary>Is my money safe? <span class="plus-ic">+</span></summary>
        <p>We're BSP-registered in the Philippines, FinCEN-registered as an MSB in the US, and FCA-authorised in the UK. All transfers clear through licensed money transmitters, never through us directly. SOC 2 Type II audited.</p>
      </details>
    </div>
  </section>

</div><!-- /cream-wrap -->

<!-- ===== FINAL CTA ===== -->
<section class="final-cta" data-screen-label="10 Final CTA">
  <div class="wrap">
    <div>
      <div class="kicker">Stop losing pesos</div>
      <h2>Send smarter,<br/><em>every payday</em>.</h2>
    </div>
    <div class="side">
      <p>Free to compare. No account needed. Join 47,218 kabayans using live data to beat the system — and send more home every month.</p>
      <div class="actions">
        <a href="/compare" class="btn btn-coral">Compare rates now →</a>
        <a href="#how" class="btn btn-outline-inv">See how it works</a>
      </div>
    </div>
  </div>
</section>

</main>

<!-- ===== FOOTER ===== -->
<footer data-screen-label="11 Footer">
  <div class="wrap">
    <div class="top">
      <div class="brand">
        <a href="/" class="wordmark"><span class="mk">R</span><span class="nm">Remittance Buddy</span></a>
        <p>Building financial transparency for the global diaspora. Every cent counts when it's going home.</p>
      </div>
      <div class="col">
        <h4>Product</h4>
        <ul>
          <li><a href="/compare">Compare rates</a></li>
          <li><a href="#how">How it works</a></li>
          <li><a href="/alerts">Rate alerts</a></li>
          <li><a href="/family">Family hub</a></li>
          <li><a href="/extension-privacy">Chrome extension</a></li>
        </ul>
      </div>
      <div class="col">
        <h4>Corridors</h4>
        <ul>
          <li><a href="/compare?corridor=US-PH">US → Philippines</a></li>
          <li><a href="/compare?corridor=UK-PH">UK → Philippines</a></li>
          <li><a href="/compare?corridor=SG-PH">Singapore → PH</a></li>
          <li><a href="/compare?corridor=AE-PH">UAE → Philippines</a></li>
          <li><a href="/compare">Request a corridor</a></li>
        </ul>
      </div>
      <div class="col">
        <h4>Company</h4>
        <ul>
          <li><a href="/pricing">Pricing</a></li>
          <li><a href="/sign-up">Sign up</a></li>
          <li><a href="/sign-in">Sign in</a></li>
        </ul>
      </div>
      <div class="col">
        <h4>Legal</h4>
        <ul>
          <li><a href="/privacy">Privacy</a></li>
          <li><a href="/terms">Terms</a></li>
        </ul>
      </div>
    </div>
    <div class="btm">
      <span>© 2026 Remittance Buddy Technologies Inc. · A comparison tool, not a money transmitter.</span>
      <span class="curs">Made for the diaspora · USD · PHP · GBP · AED · SGD</span>
    </div>
  </div>
</footer>

`

export default function LandingReceipt() {
  useEffect(() => {
    // ===== Ticker =====
    const TICKER = [
      { n: 'Remitly',        r: '₱56.82', d: '+0.12%', dir: 'up'   },
      { n: 'Wise',           r: '₱56.65', d: '+0.04%', dir: 'up'   },
      { n: 'Xoom',           r: '₱56.45', d: '−0.03%', dir: 'down' },
      { n: 'Western Union',  r: '₱55.42', d: '−0.28%', dir: 'down' },
      { n: 'MoneyGram',      r: '₱56.31', d: '+0.02%', dir: 'up'   },
      { n: 'WorldRemit',     r: '₱56.48', d: '+0.07%', dir: 'up'   },
      { n: 'Ria',            r: '₱56.18', d: '−0.11%', dir: 'down' },
      { n: 'Revolut',        r: '₱56.51', d: '+0.05%', dir: 'up'   },
      { n: 'Sendwave',       r: '₱56.39', d: '+0.01%', dir: 'up'   },
      { n: 'Payoneer',       r: '₱55.92', d: '−0.22%', dir: 'down' },
      { n: 'PayPal',         r: '₱54.88', d: '−1.2%',  dir: 'down' },
    ]
    const chipT = (p) => `<div class="chip ${p.dir}"><span class="n">${p.n}</span><span class="r">${p.r}</span><span class="dot-m"></span><span class="d">${p.d}</span></div>`
    const tt = document.getElementById('ticker-track')
    if (tt) tt.innerHTML = [...TICKER, ...TICKER].map(chipT).join('')

    // ===== Calculator =====
    const PROVIDERS = [
      { id: 'remitly', name: 'Remitly',        rate: 56.82, fee: 0.00, delivery: '2 min',  pick: true },
      { id: 'wise',    name: 'Wise',           rate: 56.65, fee: 3.80, delivery: '20 min'             },
      { id: 'wu',      name: 'Western Union',  rate: 55.42, fee: 5.00, delivery: '2 hr',   strike: true },
    ]
    const WU_IDX = PROVIDERS.findIndex((p) => p.id === 'wu')
    let amount = 500
    let selected = 0

    const amountEl      = document.getElementById('r-amount')
    const rateEl        = document.getElementById('r-rate')
    const providerEl    = document.getElementById('r-provider')
    const providerFeeEl = document.getElementById('r-provider-fee')
    const platformFeeEl = document.getElementById('r-platform-fee')
    const receiveEl     = document.getElementById('r-receive')
    const savedEl       = document.getElementById('r-saved')
    const ctaNameEl     = document.getElementById('rc-cta-name')
    const refreshEl     = document.getElementById('refresh-timer')
    const rateLockEl    = document.getElementById('rate-lock-timer')
    const totalV        = document.querySelector('.receipt .line.total .v')
    const providerRows  = Array.from(document.querySelectorAll('.rc-p'))

    const fmt = (n) => n.toLocaleString('en-US')
    const pad = (n) => n.toString().padStart(2, '0')

    function computePeso(amt, idx) {
      const p = PROVIDERS[idx]
      const platformFee = p.id === 'wu' ? 0 : amt * 0.005
      const net = Math.max(0, amt - p.fee - platformFee)
      return { peso: Math.round(net * p.rate), platformFee, ...p }
    }

    function flashTotal() {
      if (!totalV) return
      totalV.classList.remove('flash')
      void totalV.offsetWidth
      totalV.classList.add('flash')
    }

    function render() {
      providerRows.forEach((row, i) => {
        const r = computePeso(amount, i)
        const amtEl = row.querySelector('.rc-p-amt')
        if (amtEl) amtEl.textContent = '₱' + fmt(r.peso)
        const active = i === selected
        row.classList.toggle('is-active', active)
        row.setAttribute('aria-checked', active ? 'true' : 'false')
      })
      const sel = computePeso(amount, selected)
      const wu  = computePeso(amount, WU_IDX)
      if (rateEl)        rateEl.textContent        = sel.rate.toFixed(2)
      if (providerEl)    providerEl.textContent    = sel.name
      if (providerFeeEl) providerFeeEl.textContent = sel.fee.toFixed(2)
      if (platformFeeEl) platformFeeEl.textContent = sel.platformFee.toFixed(2)
      if (receiveEl)     receiveEl.textContent     = fmt(sel.peso)
      const saved = Math.max(0, sel.peso - wu.peso)
      if (savedEl)       savedEl.textContent       = fmt(saved)
      if (ctaNameEl)     ctaNameEl.textContent     = sel.name
      const gSend = document.getElementById('g-send'); if (gSend) gSend.textContent = Math.round(amount).toLocaleString()
      const gRate = document.getElementById('g-rate'); if (gRate) gRate.textContent = PROVIDERS[WU_IDX].rate.toFixed(2)
      const gFee  = document.getElementById('g-fee');  if (gFee)  gFee.textContent  = PROVIDERS[WU_IDX].fee.toFixed(2)
      const gReceive = document.getElementById('g-receive'); if (gReceive) gReceive.textContent = fmt(wu.peso)
    }

    const onAmountInput = (e) => {
      const raw = e.target.value.replace(/[^\d.]/g, '')
      const n = parseFloat(raw)
      amount = isNaN(n) ? 0 : Math.min(n, 100000)
      e.target.value = raw
      render()
    }
    amountEl?.addEventListener('input', onAmountInput)

    const rowOffs = []
    providerRows.forEach((row) => {
      const handler = () => {
        const idx = +(row.dataset.idx || '0')
        if (idx !== selected) {
          selected = idx
          render()
          flashTotal()
        }
      }
      row.addEventListener('click', handler)
      rowOffs.push(() => row.removeEventListener('click', handler))
    })

    const cta = document.getElementById('rc-cta')
    const onCta = () => flashTotal()
    cta?.addEventListener('click', onCta)

    render()

    // ===== Hero timers =====
    let refreshSeconds = 42
    let lockSeconds = 30 * 60

    function refreshRates() {
      PROVIDERS.forEach((p) => { p.rate = +(p.rate + (Math.random() * 0.1 - 0.05)).toFixed(2) })
      render()
      flashTotal()
    }

    const tickerInterval = setInterval(() => {
      refreshSeconds--
      if (refreshSeconds < 0) { refreshSeconds = 60; refreshRates() }
      if (refreshEl) refreshEl.textContent = `0:${pad(refreshSeconds)}`
      lockSeconds--
      if (lockSeconds < 0) lockSeconds = 30 * 60
      if (rateLockEl) rateLockEl.textContent = `${pad(Math.floor(lockSeconds / 60))}:${pad(lockSeconds % 60)}`
    }, 1000)

    // ===== Count-up on scroll =====
    const countEls = document.querySelectorAll('[data-count-to]')
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        const el = e.target
        if (el.dataset.done) return
        el.dataset.done = '1'
        const target = +(el.dataset.countTo || '0')
        const dur = 1400
        const t0 = performance.now()
        const isBig = target >= 100000
        ;(function tick(now) {
          const p = Math.min(1, (now - t0) / dur)
          const eased = 1 - Math.pow(1 - p, 3)
          const v = target * eased
          if (isBig) el.textContent = (v / 1000000).toFixed(1) + 'M'
          else if (target > 1000) el.textContent = Math.round(v).toLocaleString()
          else el.textContent = String(Math.round(v))
          if (p < 1) requestAnimationFrame(tick)
        })(t0)
        countIO.unobserve(el)
      })
    }, { threshold: 0.3 })
    countEls.forEach((el) => countIO.observe(el))

    // ===== Section reveal =====
    const revealTargets = document.querySelectorAll(
      '.split .head, .split .grid, .stats .cell, .how .head, .how .col, .corridors .head, .board .row, .testis .head, .testis .grid, .plus .card, .security .wrap, .app .copy, .app .phone, .faq .head, .faq .list, .final-cta .wrap'
    )
    revealTargets.forEach((el) => el.classList.add('reveal'))
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in')
          revealIO.unobserve(e.target)
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    revealTargets.forEach((el) => revealIO.observe(el))

    return () => {
      clearInterval(tickerInterval)
      countIO.disconnect()
      revealIO.disconnect()
      amountEl?.removeEventListener('input', onAmountInput)
      rowOffs.forEach((off) => off())
      cta?.removeEventListener('click', onCta)
    }
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div dangerouslySetInnerHTML={{ __html: HTML }} />
    </>
  )
}
