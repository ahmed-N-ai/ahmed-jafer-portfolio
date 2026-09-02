function copyEmail(e){
    e.preventDefault();
    navigator.clipboard.writeText('ahmed.jafer.ai@gmail.com').then(()=>{
      const toast = document.getElementById('toast');
      toast.classList.add('show');
      setTimeout(()=>toast.classList.remove('show'), 2200);
    });
  }

  function openLightbox(src){
    document.getElementById('lightbox-img').src = src;
    document.getElementById('lightbox').classList.add('open');
  }
  function closeLightbox(){
    document.getElementById('lightbox').classList.remove('open');
  }
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') closeLightbox();
  });

  function toggleTheme(){
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');
    icon.innerHTML = isDark
      ? '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>'
      : '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>';
  }

  function toggleProject(id){
    document.getElementById(id).classList.toggle('open');
  }

  // Scroll-spy for nav active state
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navlinks a');
  const spy = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        navLinks.forEach(l=>l.classList.remove('active'));
        const active = document.querySelector('.navlinks a[href="#'+entry.target.id+'"]');
        if(active) active.classList.add('active');
      }
    });
  }, {rootMargin:'-40% 0px -50% 0px'});
  sections.forEach(s=>spy.observe(s));

  // Interactive data-network background
  (function(){
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let w, h, cols, rows, spacing = 46;
    let dots = [];
    let mouse = { x: -9999, y: -9999, active:false };

    function resize(){
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      cols = Math.ceil(w / spacing) + 1;
      rows = Math.ceil(h / spacing) + 1;
      dots = [];
      for(let r=0; r<rows; r++){
        for(let c=0; c<cols; c++){
          dots.push({ x: c*spacing, y: r*spacing, col:c, row:r });
        }
      }
    }

    function dotAt(col,row){
      if(col<0||row<0||col>=cols||row>=rows) return null;
      return dots[row*cols+col];
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e)=>{
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
    });
    window.addEventListener('mouseleave', ()=>{ mouse.active = false; });
    window.addEventListener('touchmove', (e)=>{
      if(e.touches[0]){ mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; mouse.active = true; }
    }, {passive:true});

    resize();

    function draw(t){
      ctx.clearRect(0,0,w,h);
      const radius = 170;

      for(let i=0;i<dots.length;i++){
        const d = dots[i];
        const breathe = 0.10 + 0.05*Math.sin(t/2200 + (d.row+d.col)*0.35);
        let boost = 0;
        if(mouse.active){
          const dx = d.x-mouse.x, dy = d.y-mouse.y;
          const dist = Math.sqrt(dx*dx+dy*dy);
          if(dist < radius) boost = (1 - dist/radius) * 0.55;
        }
        const alpha = Math.min(breathe + boost, 0.65);
        d.alpha = alpha;

        // connect right + below neighbor
        const right = dotAt(d.col+1, d.row);
        const below = dotAt(d.col, d.row+1);
        if(right){
          ctx.strokeStyle = `rgba(47,95,222,${Math.max(alpha,right.alpha||0)*0.55})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(d.x,d.y); ctx.lineTo(right.x,right.y); ctx.stroke();
        }
        if(below){
          ctx.strokeStyle = `rgba(47,95,222,${Math.max(alpha,below.alpha||0)*0.55})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(d.x,d.y); ctx.lineTo(below.x,below.y); ctx.stroke();
        }
      }

      for(let i=0;i<dots.length;i++){
        const d = dots[i];
        ctx.fillStyle = `rgba(47,95,222,${d.alpha})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.alpha>0.4 ? 2.4 : 1.6, 0, Math.PI*2);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  })();

  // Animated number counters (trigger on scroll into view)
  (function(){
    const counters = document.querySelectorAll('.counter');
    const format = (n) => n >= 1000 ? n.toLocaleString('en-US') : n;
    const animate = (el) => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();
      function tick(now){
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = format(Math.floor(eased * target)) + suffix;
        if(progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, {threshold:0.6});
    counters.forEach(c=>obs.observe(c));
  })();

  // Radar chart reveal on scroll
  (function(){
    const radar = document.getElementById('radar-data');
    if(!radar) return;
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          radar.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {threshold:0.4});
    obs.observe(radar);
  })();

  // 3D tilt effect on project cards
  (function(){
    const cards = document.querySelectorAll('.project');
    cards.forEach(card=>{
      card.addEventListener('mousemove', (e)=>{
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const midX = rect.width / 2;
        const midY = rect.height / 2;
        const rotateY = ((x - midX) / midX) * 3;
        const rotateX = -((y - midY) / midY) * 3;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
      });
      card.addEventListener('mouseleave', ()=>{
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  })();


// Respect saved theme preference
(function(){
  const saved=localStorage.getItem('portfolio-theme');
  if(saved==='dark') document.documentElement.classList.add('dark');
})();
const originalToggleTheme=window.toggleTheme;
window.toggleTheme=function(){
  originalToggleTheme();
  localStorage.setItem('portfolio-theme',document.documentElement.classList.contains('dark')?'dark':'light');
};


// Responsive navigation
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('navlinks');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }));
});
