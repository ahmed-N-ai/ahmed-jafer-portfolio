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



// Typing effect on hero tagline
let typeLeadToken = 0;
function typeLeadText(text){
  const el = document.getElementById('typed-lead');
  if(!el) return;
  el.setAttribute('data-full-text', text);
  typeLeadToken++;
  const myToken = typeLeadToken;
  let i = 0;
  function type(){
    if(myToken !== typeLeadToken) return;
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
    nav_education: "Education",
    nav_achievements: "Achievements",
    nav_process: "Process",
    nav_proof: "What you get",
    nav_faq: "FAQ",
    nav_testimonials: "Testimonials",
    nav_contact: "Contact",
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
    edu_org: "Menoufia National University — GPA 3.63 / 4.0",
    skills_tag: "Skills",
    skills_h2: "What I bring to your data",
    skills_1_title: "Data Cleaning (Excel Power Query)",
    skills_1_desc: "I find and fix missing values, duplicates, and inconsistent records so your data is accurate and ready for real analysis — not guesswork.",
    skills_2_title: "Dashboard Development (Power BI)",
    skills_2_desc: "I build interactive dashboards with KPI cards, regional visuals, and slicers so you can explore your business data yourself, in real time.",
    skills_3_title: "Data Visualization (Pivot Tables & Charts)",
    skills_3_desc: "I turn raw spreadsheets into Pivot Tables, Pivot Charts, and Slicers that surface trends at a glance instead of buried in rows of numbers.",
    skills_4_title: "SQL",
    skills_4_desc: "I query and organize structured data efficiently to answer specific business questions directly from your database.",
    skills_5_title: "Python",
    skills_5_desc: "I use Python for data cleaning and analysis on larger or more complex datasets that go beyond spreadsheet limits.",
    skills_counter_excel: "Excel Projects",
    skills_counter_powerbi: "Power BI Projects",
    skills_counter_sql: "SQL Projects",
    skills_counter_python: "Python Projects",
    exp_tag: "Work Experience",
    exp_h2: "Where I've applied it",
    exp_date: "July 2025 — Present",
    exp_title: "Data Analytics Trainee",
    exp_org: "DEPI (Digital Egypt Pioneers Initiative), Round 5 — Skills Dynamix",
    exp_li1: "Cleaned and structured real-world style datasets using Excel Power Query, resolving missing values and duplicates.",
    exp_li2: "Built multiple Power BI dashboards with KPI cards, regional visuals, and slicers.",
    exp_li3: "Reduced manual data preparation time by applying Pivot Tables, Pivot Charts, and Slicers.",
    exp_li4: "Trained hands-on in Excel, Power BI, Tableau, SQL, and Python.",
    services_tag: "Services",
    services_h2: "How I can help",
    services_1_title: "Excel Dashboard Creation",
    services_1_desc: "Clear, interactive Excel dashboards with Pivot Tables, Pivot Charts, and Slicers — see your sales, operations, or performance data at a glance.",
    services_2_title: "Power BI Dashboard Development",
    services_2_desc: "Interactive Power BI dashboards with KPI cards, regional visuals, and filters, giving you a live view of your business to support faster decisions.",
    services_3_title: "Data Cleaning & Preparation",
    services_3_desc: "Messy datasets cleaned and structured — missing values, duplicates, and formatting issues fixed — so your data is ready to analyze.",
    projects_tag: "Projects",
    projects_h2: "Selected work",
    proj_toggle_label: "Quick overview",
    proj_full_case_link: "Full case study →",
    proj_label_challenge: "Challenge",
    proj_label_solution: "Solution",
    proj_label_result: "Result",
    proj1_title: "Superstore Sales Dashboard",
    proj1_desc: "Cleaned and modeled a ~10,000-row retail dataset spread across three related tables, then built a fully interactive Excel dashboard on top of it.",
    proj1_challenge: "The client handed over ~10,000 rows of orders data split across three separate tables — orders, returns, and regional managers — with no relationships between them and missing values scattered across several columns, including a postal code missing for an entire region.",
    proj1_solution: "I explored the raw data first to understand the business behind it, then used Power Query to clean it systematically. For the missing postal code, I checked whether the region had one at all — when several possible codes came up, I didn't guess; I confirmed the exact value with the client directly before entering it. I restructured the Orders table into a proper dimension-and-fact model, removed duplicated fields, and connected all three tables into a Star Schema with clean one-to-many relationships. I then wrote DAX measures to keep the dashboard fast, and built PivotTables, PivotCharts, KPI cards, and linked slicers focused mainly on sales performance.",
    proj1_result: "A fast, well-structured dashboard built on a clean data model — with every value traceable and confirmed, not filled in by guesswork. It was also the largest dataset I'd worked with at that point, and a real step up in handling data at scale.",
    proj2_title: "Sales Dashboard",
    proj2_desc: "Built a complete Power BI dashboard from a ~3,000-row dataset that didn't even have a sales column to begin with.",
    proj2_challenge: "This dataset was a different kind of challenge: around 3,000 rows brought into Power Query, with a very large number of missing values throughout — and no explicit sales column at all. The raw data only had unit price and quantity sold per order.",
    proj2_solution: "I first explored the data to understand the business behind it, then built a proper Sales column myself by multiplying unit price by quantity. After cleaning the missing values, I split the data into dimension and fact tables using the same Star Schema approach as before, loaded the model into Power BI, and wrote DAX measures on top of it. I then built the dashboard: KPI cards for sales, orders, and customers, a monthly sales trend, a top-customers ranking, a product-line breakdown, a deal-size donut chart, a territory comparison, and a country map.",
    proj2_result: "A full sales dashboard built from data where the core metric — sales — didn't exist yet and had to be constructed first. It pushed me to think about the data model, not just the visuals, before building anything.",
    ach_tag: "Achievements",
    ach_h2: "Credentials",
    ach_badge_title: "Data Fundamentals",
    ach_badge_issuer: "IBM SkillsBuild — Issued Aug 12, 2026",
    ach_verify_link: "Verify credential →",
    process_tag: "My process",
    process_h2: "From messy data to a decision-ready view",
    process_1_title: "Understand",
    process_1_desc: "Explore the raw tables, business context, missing fields, and the questions the dashboard needs to answer.",
    process_2_title: "Clean",
    process_2_desc: "Use Power Query and structured transformations to handle missing values, duplicates, formatting, and preparation.",
    process_3_title: "Model",
    process_3_desc: "Separate facts and dimensions where appropriate and build clear relationships before visual design.",
    process_4_title: "Analyze",
    process_4_desc: "Create reusable measures and analysis logic so the numbers stay consistent across the dashboard.",
    process_5_title: "Visualize",
    process_5_desc: "Turn the analysis into focused KPI cards, trends, comparisons, rankings, and filters that answer business questions.",
    process_6_title: "Communicate",
    process_6_desc: "Document the decisions, surface insights, and make the final output easy for another person to understand and use.",
    proof_tag: "What you get",
    proof_h2: "Built for clarity, not decoration",
    proof_1_title: "Clean foundations",
    proof_1_desc: "Data preparation and modeling come before visual polish, so the dashboard has a dependable structure underneath it.",
    proof_2_title: "Business-first visuals",
    proof_2_desc: "KPIs, trends, rankings, categories, geography, and filters are selected to make the analysis easier to use and explain.",
    proof_3_title: "Traceable decisions",
    proof_3_desc: "When a value is uncertain, it should be verified or clearly documented—not quietly guessed.",
    faq_tag: "FAQ",
    faq_h2: "Before we work together",
    faq_q1: "What kind of data work do you handle?",
    faq_a1: "Data cleaning and preparation, Excel dashboards, Power BI dashboards, data modeling, visualization, and analysis based on the tools and experience presented on this portfolio.",
    faq_q2: "Can you work with messy Excel files?",
    faq_a2: "Yes. Cleaning and structuring messy spreadsheet data is one of the core workflows demonstrated in the featured projects.",
    faq_q3: "Do you provide the source files?",
    faq_a3: "For the projects where files are available, the portfolio links to the project resources. For new client work, the deliverables can be agreed before the project starts.",
    faq_q4: "Do you build Power BI dashboards from raw data?",
    faq_a4: "Yes. The featured Power BI case study demonstrates the workflow from raw fields through cleaning, metric construction, modeling, DAX, and dashboard design.",
    testi_tag: "Testimonials",
    testi_h2: "What people say",
    testi_loading: "Loading feedback…",
    testi_form_h3: "Leave your feedback",
    testi_name_placeholder: "Your name",
    testi_message_placeholder: "Your feedback...",
    testi_submit_btn: "Submit Feedback",
    contact_h2: "Have messy data sitting in a spreadsheet?",
    contact_p: "Let's talk about turning it into a dashboard you can actually use to make decisions.",
    contact_email_btn: "Email me",
    contact_viewcv_btn: "View CV",
    contact_gmail: "Gmail",
    contact_copy: "Copy",
    contact_whatsapp: "WhatsApp",
    contact_call: "Call",
    contact_linkedin: "LinkedIn",
    footer_text: "© 2026 Ahmed Nasser Jafer. Built with care, one dataset at a time.",
    site_status_text: "Available for data analytics projects",
    toast_copied: "Email copied to clipboard!"
  },
  ar: {
    nav_about: "نبذة عني",
    nav_skills: "المهارات",
    nav_experience: "الخبرة",
    nav_services: "الخدمات",
    nav_projects: "المشاريع",
      nav_education: "التعليم",
    nav_achievements: "الإنجازات",
    nav_process: "طريقة العمل",
    nav_proof: "إيه اللي هتاخده",
    nav_faq: "الأسئلة الشائعة",
    nav_testimonials: "آراء العملاء",
    nav_contact: "تواصل",
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
     edu_org: "جامعة المنوفية الأهلية — تقدير تراكمي 3.63 / 4.0",
    skills_tag: "المهارات",
    skills_h2: "إيه اللي بقدمهولك في بياناتك",
    skills_1_title: "تنظيف البيانات (Excel Power Query)",
    skills_1_desc: "بكتشف وبصلّح القيم الناقصة والتكرارات والسجلات غير المتسقة عشان بياناتك تبقى دقيقة وجاهزة لتحليل حقيقي — مش تخمين.",
    skills_2_title: "بناء لوحات البيانات (Power BI)",
    skills_2_desc: "بابني لوحات بيانات تفاعلية فيها KPI cards ورسومات إقليمية وفلاتر عشان تقدر تستكشف بيانات شركتك بنفسك بشكل لحظي.",
    skills_3_title: "تصور البيانات (Pivot Tables و Charts)",
    skills_3_desc: "بحوّل الجداول الخام إلى Pivot Tables وPivot Charts وSlicers تظهر الاتجاهات من نظرة واحدة بدل ما تكون مدفونة في صفوف أرقام.",
    skills_4_title: "SQL",
    skills_4_desc: "بستعلم وبنظّم البيانات المهيكلة بكفاءة عشان أجاوب على أسئلة عمل محددة مباشرة من قاعدة البيانات.",
    skills_5_title: "Python",
    skills_5_desc: "بستخدم Python لتنظيف وتحليل البيانات الأكبر أو الأكثر تعقيدًا اللي بتتخطى حدود جداول البيانات.",
    skills_counter_excel: "مشاريع Excel",
    skills_counter_powerbi: "مشاريع Power BI",
    skills_counter_sql: "مشاريع SQL",
    skills_counter_python: "مشاريع Python",
    exp_tag: "الخبرة",
    exp_h2: "فين طبّقت اللي بعرفه",
    exp_date: "يوليو 2025 — حتى الآن",
    exp_title: "متدرب تحليل بيانات",
    exp_org: "DEPI (مبادرة رواد مصر الرقمية)، الدفعة 5 — Skills Dynamix",
    exp_li1: "نظّفت وهيكلت بيانات واقعية باستخدام Excel Power Query، وحليت مشاكل القيم الناقصة والتكرارات.",
    exp_li2: "بنيت أكتر من لوحة بيانات في Power BI فيها KPI cards ورسومات إقليمية وslicers.",
    exp_li3: "قلّلت وقت تجهيز البيانات اليدوي عن طريق استخدام Pivot Tables وPivot Charts وSlicers.",
    exp_li4: "اتدربت عمليًا على Excel وPower BI وTableau وSQL وPython.",
    services_tag: "الخدمات",
    services_h2: "إزاي أقدر أساعدك",
    services_1_title: "إنشاء لوحات بيانات في Excel",
    services_1_desc: "لوحات بيانات تفاعلية وواضحة في Excel فيها Pivot Tables وPivot Charts وSlicers — تشوف مبيعاتك وعملياتك وأدائك من نظرة واحدة.",
    services_2_title: "بناء لوحات بيانات في Power BI",
    services_2_desc: "لوحات بيانات تفاعلية في Power BI فيها KPI cards ورسومات إقليمية وفلاتر، بتديك رؤية لحظية لشركتك تدعم قراراتك بشكل أسرع.",
    services_3_title: "تنظيف وتجهيز البيانات",
    services_3_desc: "بيانات فوضوية بتتنظف وتتهيكل — القيم الناقصة والتكرارات ومشاكل التنسيق بتتصلح — عشان بياناتك تبقى جاهزة للتحليل.",
    projects_tag: "المشاريع",
    projects_h2: "أعمال مختارة",
    proj_toggle_label: "نظرة سريعة",
    proj_full_case_link: "دراسة الحالة كاملة ←",
    proj_label_challenge: "التحدي",
    proj_label_solution: "الحل",
    proj_label_result: "النتيجة",
    proj1_title: "لوحة بيانات مبيعات Superstore",
    proj1_desc: "نظّفت ونمذجت داتا بيع بالتجزئة حوالي 10,000 صف موزعة على 3 جداول مترابطة، وبنيت عليها لوحة بيانات تفاعلية بالكامل في Excel.",
    proj1_challenge: "العميل سلّمني حوالي 10,000 صف من بيانات الطلبات موزعة على 3 جداول منفصلة — الطلبات، المرتجعات، ومديري المناطق — من غير أي علاقات بينهم، وقيم ناقصة منتشرة في أكتر من عمود، من ضمنها كود بريدي ناقص لمنطقة كاملة.",
    proj1_solution: "استكشفت البيانات الخام الأول عشان أفهم طبيعة العمل ورا الأرقام، وبعدين استخدمت Power Query عشان أنظفها بشكل منهجي. بالنسبة للكود البريدي الناقص، تأكدت الأول لو المنطقة أصلاً ليها كود، ولما ظهرلي أكتر من احتمال، مخمّنتش — أكدت القيمة الصح مباشرة مع العميل قبل ما أدخلها. أعدت هيكلة جدول الطلبات لموديل dimension-and-fact صحيح، شلت الحقول المكررة، وربطت الجداول التلاتة بـ Star Schema بعلاقات one-to-many نضيفة. بعدين كتبت مقاييس DAX عشان اللوحة تفضل سريعة، وبنيت PivotTables وPivotCharts وKPI cards وslicers مترابطة مركّزة أساسًا على أداء المبيعات.",
    proj1_result: "لوحة بيانات سريعة وكويسة الهيكلة مبنية على موديل بيانات نضيف — كل قيمة فيها ممكن تتبعها ومؤكدة، مش متعبأة بالتخمين. وكانت كمان أكبر داتا اشتغلت عليها لحد وقتها، وخطوة حقيقية قدام في التعامل مع البيانات بحجم أكبر.",
    proj2_title: "لوحة بيانات مبيعات",
    proj2_desc: "بنيت لوحة بيانات كاملة في Power BI من داتا حوالي 3,000 صف مكانش فيها أصلاً عمود مبيعات.",
    proj2_challenge: "الداتا دي كانت تحدي من نوع مختلف: حوالي 3,000 صف اتنقلوا لـ Power Query، وفيهم عدد كبير جدًا من القيم الناقصة في كل مكان — ومفيش عمود مبيعات صريح خالص. الداتا الخام كان فيها بس سعر الوحدة والكمية المباعة لكل طلب.",
    proj2_solution: "استكشفت البيانات الأول عشان أفهم طبيعة العمل، وبعدين بنيت عمود Sales صح بنفسي بضرب سعر الوحدة في الكمية. بعد ما نظفت القيم الناقصة، قسّمت البيانات لجداول dimension وfact بنفس أسلوب Star Schema اللي استخدمته قبل كده، حمّلت الموديل في Power BI، وكتبت مقاييس DAX عليه. بعدين بنيت اللوحة: KPI cards للمبيعات والطلبات والعملاء، اتجاه شهري للمبيعات، ترتيب لأفضل العملاء، تحليل حسب خط المنتج، رسم دائري لحجم الصفقات، مقارنة بين المناطق، وخريطة دول.",
    proj2_result: "لوحة بيانات مبيعات كاملة اتبنت من داتا مكانش فيها أصلاً المقياس الأساسي — المبيعات — وكان لازم أبنيه الأول. الموضوع خلاني أفكر في موديل البيانات، مش بس الشكل المرئي، قبل ما أبني أي حاجة.",
    ach_tag: "الإنجازات",
    ach_h2: "الشهادات",
    ach_badge_title: "أساسيات البيانات",
    ach_badge_issuer: "IBM SkillsBuild — صدرت في 12 أغسطس 2026",
    ach_verify_link: "تأكيد الشهادة ←",
    process_tag: "طريقة عملي",
    process_h2: "من بيانات فوضوية لرؤية جاهزة لاتخاذ القرار",
    process_1_title: "الفهم",
    process_1_desc: "استكشاف الجداول الخام وسياق العمل والحقول الناقصة والأسئلة اللي اللوحة محتاجة تجاوب عليها.",
    process_2_title: "التنظيف",
    process_2_desc: "استخدام Power Query والتحويلات المنظمة للتعامل مع القيم الناقصة والتكرارات والتنسيق والتجهيز.",
    process_3_title: "النمذجة",
    process_3_desc: "فصل الحقائق عن الأبعاد لما يكون مناسب، وبناء علاقات واضحة قبل التصميم المرئي.",
    process_4_title: "التحليل",
    process_4_desc: "بناء مقاييس ومنطق تحليل قابل لإعادة الاستخدام عشان الأرقام تفضل متسقة في كل اللوحة.",
    process_5_title: "التصور",
    process_5_desc: "تحويل التحليل لـ KPI cards مركّزة، واتجاهات، ومقارنات، وترتيبات، وفلاتر بتجاوب على أسئلة العمل.",
    process_6_title: "التواصل",
    process_6_desc: "توثيق القرارات، وإظهار أهم الملاحظات، وخلي الناتج النهائي سهل الفهم والاستخدام لأي شخص تاني.",
    proof_tag: "إيه اللي هتاخده",
    proof_h2: "مبني عشان يكون واضح، مش بس شكل",
    proof_1_title: "أساس نضيف",
    proof_1_desc: "تجهيز البيانات والنمذجة بيسبقوا الشكل المرئي، عشان اللوحة يبقى تحتها هيكل يعتمد عليه.",
    proof_2_title: "رسومات مبنية على احتياج العمل",
    proof_2_desc: "الـKPIs والاتجاهات والترتيبات والفئات والجغرافيا والفلاتر بتتختار عشان التحليل يبقى أسهل في الاستخدام والشرح.",
    proof_3_title: "قرارات قابلة للتتبع",
    proof_3_desc: "لما تكون القيمة مش متأكد منها، لازم تتأكد أو توثق بوضوح — مش تتخمن بصمت.",
    faq_tag: "الأسئلة الشائعة",
    faq_h2: "قبل ما نشتغل مع بعض",
    faq_q1: "إيه نوع شغل البيانات اللي بتتعامل معاه؟",
    faq_a1: "تنظيف وتجهيز البيانات، لوحات بيانات في Excel، لوحات بيانات في Power BI، نمذجة البيانات، التصور، والتحليل بناءً على الأدوات والخبرة الموضحة في البورتفوليو ده.",
    faq_q2: "تقدر تشتغل على ملفات Excel فوضوية؟",
    faq_a2: "أيوه. تنظيف وهيكلة بيانات جداول البيانات الفوضوية من أهم الـ workflows اللي ظاهرة في المشاريع المعروضة.",
    faq_q3: "بتوفر ملفات المصدر؟",
    faq_a3: "بالنسبة للمشاريع اللي فيها ملفات متاحة، البورتفوليو بيربطك بمصادر المشروع. للشغل الجديد مع عميل، الـ deliverables ممكن نتفق عليها قبل ما المشروع يبدأ.",
    faq_q4: "بتبني لوحات بيانات Power BI من بيانات خام؟",
    faq_a4: "أيوه. دراسة حالة Power BI المعروضة بتوضح الـ workflow بالكامل من الحقول الخام للتنظيف، لبناء المقاييس، للنمذجة، لـ DAX، لتصميم اللوحة.",
    testi_tag: "آراء العملاء",
    testi_h2: "الناس بتقول إيه",
    testi_loading: "جاري تحميل الآراء…",
    testi_form_h3: "اكتب رأيك",
    testi_name_placeholder: "اسمك",
    testi_message_placeholder: "رأيك...",
    testi_submit_btn: "إرسال الرأي",
    contact_h2: "عندك بيانات فوضوية متكدسة في جدول بيانات؟",
    contact_p: "يلا نتكلم عن تحويلها للوحة بيانات تقدر فعلاً تستخدمها لاتخاذ قراراتك.",
    contact_email_btn: "ابعتلي إيميل",
    contact_viewcv_btn: "شاهد السيرة الذاتية",
    contact_gmail: "جيميل",
    contact_copy: "نسخ",
    contact_whatsapp: "واتساب",
    contact_call: "اتصال",
    contact_linkedin: "لينكدإن",
    footer_text: "© 2026 أحمد ناصر جعفر. اتبنى بعناية، مجموعة بيانات في كل مرة.",
    site_status_text: "متاح لمشاريع تحليل البيانات",
    toast_copied: "تم نسخ الإيميل!"
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
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    const key = el.getAttribute('data-i18n-placeholder');
    if(translations[lang] && translations[lang][key] !== undefined){
      el.setAttribute('placeholder', translations[lang][key]);
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