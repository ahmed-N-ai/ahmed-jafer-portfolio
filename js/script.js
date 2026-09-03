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
  const btn = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }));
});

// Scroll progress bar
window.addEventListener('scroll', () => {
  const bar = document.getElementById('scroll-progress');
  if(!bar) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  bar.style.width = pct + '%';
});

// Custom cursor
(function(){
  if(window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    document.body.appendChild(cursor);
    window.addEventListener('mousemove', (e)=>{
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('a, button, .project, .service-card').forEach(el=>{
      el.addEventListener('mouseenter', ()=>cursor.classList.add('grow'));
      el.addEventListener('mouseleave', ()=>cursor.classList.remove('grow'));
    });
  }
})();

// Typing effect on hero tagline
function typeLeadText(text){
  const el = document.getElementById('typed-lead');
  if(!el) return;
  el.setAttribute('data-full-text', text);
  let i = 0;
  function type(){
    if(i <= text.length){
      el.innerHTML = text.slice(0, i);
      i++;
      setTimeout(type, 18);
    }
  }
  type();
}
(function(){
  const el = document.getElementById('typed-lead');
  if(!el) return;
  typeLeadText(el.getAttribute('data-full-text'));
})();

// ---------- Language toggle (EN / AR) ----------
const translations = {
  en: {
    nav_about: "About",
    nav_skills: "Skills",
    nav_experience: "Experience",
    nav_services: "Services",
    nav_projects: "Projects",
    nav_process: "Process",
    nav_cta: "Get in touch",
    hero_badge: "Available for freelance work",
    hero_eyebrow: "Data Analyst",
    hero_title: "Turning raw data into decisions you can act on.",
    hero_lead: "Computer Science & AI student specializing in Data Analytics — I clean messy datasets and build dashboards in Excel and Power BI that make your numbers make sense.",
    hero_btn_work: "View my work",
    hero_btn_contact: "Get in touch",
    hero_btn_cv: "Download CV",
        chart_raw: "Raw data",
    chart_clear: "Clear insight",
    about_tag: "About",
    about_h2: "Why I do this",
    about_p1: "I used to wonder why a shop owner would bother keeping records of every single sale — my best guess was that it was just in case a customer needed a refund, or something went wrong. It wasn't until I actually stepped into this field that I understood what that data really was: not just a backup plan, but the raw material behind almost every decision happening around us, in every business, at every scale.",
    about_p2: "Today, as a Computer Science & AI student specializing in Data Analytics and a Data Analytics Trainee at DEPI, I clean raw datasets, build interactive Power BI dashboards, and use Excel, SQL, and Python to uncover the story hidden behind the numbers.",
    about_usp: "I help small business owners turn messy spreadsheets into dashboards they can actually use — backed by a real Data Science background and hands-on training, not just tutorials.",
    about_based_label: "Based in",
    about_based_value: "Egypt",
    about_study_label: "Studying",
    about_study_value: "CS & AI — Menoufia University",
    about_current_label: "Currently",
    about_current_value: "Data Analytics Trainee, DEPI",
    edu_tag: "Education",
    edu_h2: "Academic foundation",
    edu_date: "2nd Year — In Progress",
    edu_title: "B.Sc. Computer Science & Artificial Intelligence",
    edu_org: "Menoufia National University — GPA 3.63 / 4.0"
  },
  ar: {
    nav_about: "نبذة عني",
    nav_skills: "المهارات",
    nav_experience: "الخبرة",
    nav_services: "الخدمات",
    nav_projects: "المشاريع",
    nav_process: "طريقة العمل",
    nav_cta: "تواصل معي",
    hero_badge: "متاح للعمل الحر",
    hero_eyebrow: "محلل بيانات",
    hero_title: "تحويل البيانات الخام إلى قرارات يمكنك التصرف بناءً عليها",
    hero_lead: "طالب علوم حاسب وذكاء اصطناعي متخصص في تحليل البيانات، بنظّف البيانات الفوضوية وأبني لوحات بيانات تفاعلية في Excel وPower BI تخلي أرقامك مفهومة.",
    hero_btn_work: "شاهد أعمالي",
    hero_btn_contact: "تواصل معي",
    hero_btn_cv: "تحميل السيرة الذاتية",
    chart_raw: "بيانات خام",
    chart_clear: "رؤية واضحة",
    about_tag: "نبذة عني",
    about_h2: "ليه بعمل الشغلانة دي",
    about_p1: "كنت مش فاهم ليه صاحب متجر يهتم إنه يحتفظ بسجل لكل عملية بيع — كان أقصى تفسير عندي إنها مجرد نسخة احتياطية لو حصل استرجاع أو حصل خطأ. لحد ما دخلت المجال ده فعليًا وفهمت إيه هي البيانات دي حقيقةً: مش مجرد نسخة احتياطية، لكنها المادة الخام اللي بتحرك تقريبًا كل قرار بيتاخد حوالينا، في كل شركة، بأي حجم.",
    about_p2: "دلوقتي، كطالب علوم حاسب وذكاء اصطناعي متخصص في تحليل البيانات ومتدرب تحليل بيانات في DEPI، بنظّف البيانات الخام، وأبني لوحات بيانات تفاعلية في Power BI، وبستخدم Excel وSQL وPython عشان أكتشف القصة المخفية خلف الأرقام.",
    about_usp: "بساعد أصحاب المشاريع الصغيرة يحولوا جداول البيانات الفوضوية إلى لوحات بيانات فعلاً بيستخدموها — بخلفية حقيقية في علم البيانات وتدريب عملي، مش مجرد كورسات نظرية.",
    about_based_label: "مقيم في",
    about_based_value: "مصر",
    about_study_label: "بدرس",
    about_study_value: "علوم حاسب وذكاء اصطناعي — جامعة المنوفية",
    about_current_label: "حاليًا",
    about_current_value: "متدرب تحليل بيانات، DEPI",
    edu_tag: "التعليم",
    edu_h2: "الأساس الأكاديمي",
    edu_date: "السنة الثانية — قيد الدراسة",
    edu_title: "بكالوريوس علوم حاسب وذكاء اصطناعي",
    edu_org: "جامعة المنوفية الأهلية — تقدير تراكمي 3.63 / 4.0"
  }
};

function applyLanguage(lang){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if(translations[lang] && translations[lang][key] !== undefined){
      if(el.id === 'typed-lead'){
        typeLeadText(translations[lang][key]);
      } else {
        el.textContent = translations[lang][key];
      }
    }
  });
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  const label = document.getElementById('lang-label');
  if(label) label.textContent = lang === 'ar' ? 'EN' : 'AR';
  localStorage.setItem('portfolio-lang', lang);
}

function toggleLang(){
  const current = document.documentElement.getAttribute('lang') === 'ar' ? 'ar' : 'en';
  applyLanguage(current === 'ar' ? 'en' : 'ar');
}

(function(){
  const saved = localStorage.getItem('portfolio-lang');
  if(saved === 'ar') applyLanguage('ar');
})();