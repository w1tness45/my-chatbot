// Minimal floating chat widget (web-only)
(function(){
  const BOOKING_URL = "https://cal.com/your-handle"; // change to your link or leave
  const SERVICE_AREA = "Your city + 10 miles";
  const PRICE_LINE = "Most jobs $100–$300. Service call $75.";
  const API_BASE = ""; // same origin

  // Styles
  const style = document.createElement('style');
  style.textContent = `
    #jb-chat-btn{position:fixed;right:20px;bottom:20px;z-index:99999;border:none;border-radius:9999px;padding:12px 16px;cursor:pointer;background:#111;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.18);}
    #jb-chat-panel{position:fixed;right:20px;bottom:80px;width:320px;max-height:60vh;background:#fff;border-radius:16px;box-shadow:0 12px 32px rgba(0,0,0,.22);overflow:hidden;display:none;z-index:99999;border:1px solid #eee;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;}
    #jb-chat-header{padding:12px 14px;font-weight:600;border-bottom:1px solid #eee}
    #jb-chat-body{padding:12px;overflow-y:auto;max-height:46vh}
    .jb-bubble{margin:8px 0;padding:10px 12px;border-radius:12px;line-height:1.35}
    .jb-bot{background:#f5f7fb}
    .jb-user{background:#e8f5ff;margin-left:40px}
    #jb-chat-input{display:flex;border-top:1px solid #eee}
    #jb-input{flex:1;padding:10px 12px;border:0;outline:0}
    #jb-send{padding:10px 14px;border:0;cursor:pointer;background:transparent}
    .jb-link{color:#0a66c2;text-decoration:underline;cursor:pointer}
  `;
  document.head.appendChild(style);

  // Elements
  const btn = document.createElement('button');
  btn.id = 'jb-chat-btn';
  btn.textContent = '💬 Chat';
  document.body.appendChild(btn);

  const panel = document.createElement('div');
  panel.id = 'jb-chat-panel';
  panel.innerHTML = `
    <div id="jb-chat-header">We’re here to help</div>
    <div id="jb-chat-body"></div>
    <div id="jb-chat-input">
      <input id="jb-input" placeholder="Type your question…" />
      <button id="jb-send">Send</button>
    </div>`;
  document.body.appendChild(panel);

  const body = panel.querySelector('#jb-chat-body');
  const input = panel.querySelector('#jb-input');
  const sendBtn = panel.querySelector('#jb-send');

  function bot(text, html=false){ const b=document.createElement('div'); b.className='jb-bubble jb-bot'; b[html?'innerHTML':'textContent']=text; body.appendChild(b); body.scrollTop=body.scrollHeight; }
  function user(text){ const b=document.createElement('div'); b.className='jb-bubble jb-user'; b.textContent=text; body.appendChild(b); body.scrollTop=body.scrollHeight; }

  let leadMode=false;

  function greet(){
    bot("👋 Hi! I can answer quick questions, book you in, or take a message.");
    bot("Try: price • area • book • quote");
  }

  btn.onclick = ()=>{ panel.style.display = panel.style.display==='none'?'block':'none'; if(panel.style.display==='block' && !body.hasChildNodes()) greet(); };
  sendBtn.onclick = send;
  input.addEventListener('keydown', e=>{ if(e.key==='Enter') send(); });

  function send(){
    const val=input.value.trim(); if(!val) return;
    user(val); input.value='';

    if(leadMode){
      leadMode=false;
      fetch(`${API_BASE}/api/lead`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({payload:val})});
      bot("Thanks! We’ve received your details. ");
      bot(`Want to pick a time now? <span class="jb-link" onclick="window.open('${BOOKING_URL}','_blank')">Book here</span>`, true);
      return;
    }

    const q=val.toLowerCase();
    if(q.includes('price')||q.includes('cost')) return bot(PRICE_LINE);
    if(q.includes('area')||q.includes('service')||q.includes('where')) return bot(`We serve ${SERVICE_AREA}.`);
    if(q.includes('book')||q.includes('schedule')||q.includes('appointment')) return bot(`Tap to choose a time: <span class="jb-link" onclick="window.open('${BOOKING_URL}','_blank')">Book now</span>`, true);
    if(q.includes('quote')||q.includes('estimate')){ leadMode=true; return bot("Please enter: Name, phone/email, short job description, city."); }

    // fallback: ask backend FAQ
    fetch(`${API_BASE}/api/faq?q=`+encodeURIComponent(val)).then(r=>r.json()).then(d=>{
      if(d && d.answer){ bot(d.answer); bot(`Need to proceed? <span class="jb-link" onclick="window.open('${BOOKING_URL}','_blank')">Book now</span>`, true); }
      else bot("I can help with price, area, booking, or a quick quote.");
    }).catch(()=> bot("Server not reachable right now."));
  }

  // auto-open after a few seconds (desktop)
  setTimeout(()=>{ if(window.innerWidth>768){ panel.style.display='block'; greet(); } }, 4000);
})();