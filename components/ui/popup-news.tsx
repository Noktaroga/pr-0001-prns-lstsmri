import React, { useState, useEffect } from 'react';

interface PopupNewsProps {
  open: boolean;
  onClose: () => void;
}

interface NewsItem {
  date: string;
  title: string;
  comment: string;
}

export const PopupNews: React.FC<PopupNewsProps> = ({ open, onClose }) => {
  const [socialsCollapsed] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    if (open) {
  fetch('http://localhost:3001/api/whatsnew')
        .then(res => res.json())
        .then(setNews)
        .catch(() => setNews([]));
    }
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="nov-modal"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        minHeight: '100vh',
        minWidth: '100vw',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="novTitle"
      aria-describedby="novDesc"
    >
      <style>{`
        :root{--c-bg:#0b0b11;--c-panel:#121222;--c-panel-2:#1a1a2e;--c-accent:#c84b7a;--c-accent-2:#7f5af0;--c-text:#f2f3f7;--c-muted:#a9abc2;--radius:16px;--shadow:0 8px 30px rgba(0,0,0,.5);}
        .nov-backdrop{position:absolute;inset:0;background:rgba(8,8,14,.72);backdrop-filter:blur(6px);}
  .nov-dialog{position:relative;width:980px;height:600px;max-width:94vw;max-height:92vh;background:linear-gradient(135deg,var(--c-panel),var(--c-panel-2));border-radius:var(--radius);box-shadow:var(--shadow);overflow:hidden;outline:none;}
        .nov-grid{display:grid;grid-template-columns:360px 1fr;}
        @media (max-width:860px){.nov-grid{grid-template-columns:1fr;}}
        .nov-left{position:relative;background:radial-gradient(80% 80% at 50% 60%,rgba(200,75,122,.18),transparent 60%);}
              .nov-figure-wrap{position:absolute;inset:0;display:grid;place-items:center center;height:100%;padding:20px;}
          .nov-figure{width:88%;height:88%;max-height:100%;filter:drop-shadow(0 12px 24px rgba(200,75,122,.35));animation:floaty 6s ease-in-out infinite;}
        @keyframes floaty{0%{transform:translateY(0)}50%{transform:translateY(-6px)}100%{transform:translateY(0)}}
  .nov-right{display:flex;flex-direction:column;justify-content:center;gap:18px;padding:22px 22px 12px 22px;min-height:600px;height:100%;}
        .nov-header{display:flex;align-items:center;justify-content:space-between;gap:12px;}
        .nov-title{font-size:clamp(18px,2.2vw,26px);letter-spacing:.2px;}
        .nov-close{appearance:none;border:0;background:transparent;color:var(--c-muted);font-size:22px;cursor:pointer;line-height:1;padding:6px;border-radius:10px;}
        .nov-close:focus-visible{outline:3px solid var(--c-accent);outline-offset:2px;}
        .nov-scroll{position:relative;overflow:auto;padding:14px;border-radius:14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);}
        .nov-scroll::-webkit-scrollbar{width:10px}
        .nov-scroll::-webkit-scrollbar-thumb{background:linear-gradient(var(--c-accent),var(--c-accent-2));border-radius:10px;}
        .nov-scroll h3{margin:0 0 6px 0;font-size:16px;color:#e7e7fb;}
        .nov-scroll p{margin:0 0 10px 0;color:var(--c-muted);line-height:1.5}
        .nov-tag{display:inline-block;font-size:12px;background:rgba(127,90,240,.18);color:#d6ccff;border:1px solid rgba(127,90,240,.4);padding:4px 8px;border-radius:999px;margin:0 8px 8px 0}
        .nov-hands{position:relative;display:flex;align-items:flex-end;justify-content:center;height:78px;}
        .nov-hands svg{position:absolute;bottom:-6px;width:72%;max-width:540px;filter:drop-shadow(0 6px 12px rgba(0,0,0,.45));}
        .nov-socials{display:flex;gap:12px;flex-wrap:wrap;align-items:center;}
        .nov-follow{font-size:14px;color:var(--c-muted);margin-right:8px}
        .soc-btn{--ring:rgba(200,75,122,.4);appearance:none;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:var(--c-text);display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:999px;cursor:pointer;transform:translateZ(0);}
        .soc-btn svg{width:18px;height:18px}
        .soc-btn:hover{border-color:rgba(255,255,255,.2)}
        .soc-btn:active{transform:translateY(1px)}
        .nov-socials[data-collapsed="true"] .soc-btn{max-width:0;padding:10px 0;overflow:hidden;opacity:0;transition:all .4s ease,opacity .3s ease;}
        .nov-socials[data-collapsed="false"] .soc-btn{max-width:200px;opacity:1;padding:10px 14px;}
        .enter{animation:popIn .35s ease forwards}
        @keyframes popIn{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}
        @media(prefers-reduced-motion:reduce){.nov-figure{animation:none}.enter{animation:none}.nov-socials .soc-btn{transition:none}}
      `}</style>
      <div className="nov-backdrop" onClick={onClose}></div>
      <div className="nov-dialog enter" tabIndex={-1}>
        <div className="nov-grid">
          <div className="nov-left" aria-hidden="true">
            <div className="nov-figure-wrap">
              <img src="./dist/popup.png" alt="Popup" className="nov-figure" style={{ width: '95%', height: '80%' }} />
            </div>
          </div>
          <div className="nov-right">
            <div className="nov-scroll" id="novDesc" style={{maxHeight:'260px',overflowY:'auto'}}>
              {news.length === 0 ? (
                <span className="nov-tag">No news available</span>
              ) : (
                news.map((item, idx) => (
                  <div key={idx} style={{marginBottom:'18px'}}>
                    <span className="nov-tag">{item.date}</span>
                    <h3>{item.title}</h3>
                    <p>{item.comment}</p>
                  </div>
                ))
              )}
            </div>
            <div className="nov-hands" aria-hidden="true">
              <svg viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="handG" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#c84b7a"/>
                    <stop offset="100%" stopColor="#7f5af0"/>
                  </linearGradient>
                </defs>
                <path d="M40 160c40-10 80-40 120-40 40 0 80 30 120 30 40 0 80-30 120-30 40 0 80 30 120 30 40 0 80-30 120-30 40 0 80 30 120 30v30H40z" fill="url(#handG)" fillOpacity="0.65"/>
                <path d="M80 170c20-16 40-28 60-28 30 0 60 24 90 24s60-24 90-24 60 24 90 24 60-24 90-24 60 24 90 24" stroke="rgba(255,255,255,.25)" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'10px',flexWrap:'wrap',padding:'0 2px 10px 2px'}}>
              <div className="nov-socials" id="novSocials">
                <span className="nov-follow">Follow us</span>
                <a className="soc-btn" href="#" aria-label="X/Twitter">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.7 2h3.1l-6.8 7.7 8 10.3h-6.2l-4.8-6.1-5.5 6.1H1.2l7.3-8.1L1 2h6.3l4.3 5.6L18.7 2z"/></svg>
                  <span>@xpornsters</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
