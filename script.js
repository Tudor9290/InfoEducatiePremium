"use strict";

/* =============================================================
   UTILITY
   ============================================================= */
const $ = id => document.getElementById(id);

function sanitize(v){ return String(v||'').replace(/<[^>]*>/g,'').trim(); }
function wordCount(t){ return String(t||'').split(/\s+/).filter(Boolean).length; }
function hasNumber(t){ return /\d/.test(t); }
function hasEmail(t){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t); }
function isGarbage(t){
  const s=String(t||'').toLowerCase().replace(/\s+/g,'');
  if(!s||!/[a-z]/i.test(s))return true;
  if(/^(.)\1{4,}$/.test(s))return true;
  if(s.length<=4&&/^[a-z]+$/.test(s))return true;
  const l=s.replace(/[^a-z]/g,'');
  return l.length>=6&&new Set(l).size<=2;
}
function isMeaningful(t,minW=2,minL=5){
  if(!t||isGarbage(t))return false;
  return t.replace(/[^a-zA-Z]/g,'').length>=minL&&wordCount(t)>=minW;
}
function countItems(t){ return String(t||'').split(/[,;\n]/).map(s=>s.trim()).filter(s=>isMeaningful(s,1,2)).length; }
function hasActionVerb(t){
  return /\b(organized|organised|created|led|managed|coordinated|researched|designed|developed|built|presented|improved|supported|wrote|planned|negotiated|analyzed|analysed|volunteered|participated)\b/i.test(t);
}
function copyText(elId,btn){
  const el=$(elId); if(!el)return;
  navigator.clipboard.writeText(el.value||el.textContent||'').then(()=>{
    if(btn){const o=btn.textContent;btn.textContent=t('copied');setTimeout(()=>btn.textContent=o,1800);}
  });
}
function setScore(circleId,scoreId,pct){
  const deg=Math.round(Math.min(100,Math.max(0,pct))*3.6);
  $(circleId).style.background=`conic-gradient(var(--gold) ${deg}deg,rgba(255,255,255,0.10) 0deg)`;
  $(scoreId).textContent=Math.round(pct);
}
function addLi(listId,text,cls){
  const li=document.createElement('li');
  li.textContent=text;
  if(cls)li.className=cls;
  $(listId).appendChild(li);
}

/* =============================================================
   NAVIGATION
   ============================================================= */
const sections=document.querySelectorAll('.section');
const navBtns=document.querySelectorAll('.nav-btn');
const menuBtn=$('menuBtn');
const navMenu=$('navMenu');

function showSection(id){
  sections.forEach(s=>s.classList.remove('active'));
  $(id).classList.add('active');
  navMenu.classList.remove('open');
  menuBtn.setAttribute('aria-expanded','false');
  navBtns.forEach(b=>b.classList.toggle('active',b.dataset.section===id));
  window.scrollTo({top:0,behavior:'smooth'});
}
menuBtn.addEventListener('click',()=>{
  const open=navMenu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded',String(open));
});
document.addEventListener('click',e=>{
  if(!menuBtn.contains(e.target)&&!navMenu.contains(e.target)){
    navMenu.classList.remove('open');
    menuBtn.setAttribute('aria-expanded','false');
  }
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){navMenu.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');}
});

/* =============================================================
   DRAFT AUTOSAVE
   ============================================================= */
const EMAIL_FIELDS=['emailSender','emailTo','emailSubject','emailContext','emailRequest','emailDeadline'];
const CV_FIELDS=['cvName','cvTarget','cvEmail','cvPhone','cvLocation','cvLink','cvGoal','cvStrengths',
  'cvSchool','cvProgram','cvEducationDates','cvEducationDetails','cvTechnicalSkills','cvSoftSkills','cvLanguages'];

function saveDraft(key,fields,bannerId){
  try{
    const data={};
    fields.forEach(id=>{const el=$(id);if(el)data[id]=sanitize(el.value);});
    localStorage.setItem(key,JSON.stringify(data));
    const b=$(bannerId);
    if(b){b.classList.add('visible');setTimeout(()=>b.classList.remove('visible'),2000);}
  }catch(_){}
}
function loadDraft(key,fields){
  try{
    const raw=localStorage.getItem(key);
    if(!raw)return;
    const data=JSON.parse(raw);
    fields.forEach(id=>{const el=$(id);if(el&&data[id])el.value=data[id];});
  }catch(_){}
}
function setupAutosave(){
  function debounced(fn,delay){let tm;return()=>{clearTimeout(tm);tm=setTimeout(fn,delay);};}
  const saveEmail=debounced(()=>saveDraft('mp_email_draft',EMAIL_FIELDS,'emailDraftBanner'),1200);
  const saveCV=debounced(()=>saveDraft('mp_cv_draft',CV_FIELDS,'cvDraftBanner'),1200);
  EMAIL_FIELDS.forEach(id=>{const el=$(id);if(el)el.addEventListener('input',saveEmail);});
  CV_FIELDS.forEach(id=>{const el=$(id);if(el)el.addEventListener('input',saveCV);});
  loadDraft('mp_email_draft',EMAIL_FIELDS);
  loadDraft('mp_cv_draft',CV_FIELDS);
}

/* =============================================================
   I18N SYSTEM
   ============================================================= */
let currentLang='en';

const STRINGS={
  en:{
    /* nav */
    'skip-main':'Skip to main content',
    'brand-name':'Mr. Premium',
    'nav-email':'Email',
    'nav-cv':'CV',
    'nav-speaking':'Public Speaking',
    'nav-interview':'Interviews',
    'nav-extra':'Extracurricular',
    /* home */
    'home-eyebrow':'Student communication assistant',
    'home-h1':'Choose what you want to improve today.',
    'home-lead':'Mr. Premium helps high school and university students write formal emails, build better CVs, speak with confidence, prepare for interviews, and further help with their extracurricular activities.',
    'mascot-sub':'A polite, confident, and helpful guide, at your service.',
    'mascot-alt':'Mr. Premium Mascot (confident and well-dressed)',
    'choice-email-sub':'Write clear, polite academic emails.',
    'choice-cv-sub':'Build and improve your student CV.',
    'choice-speaking-sub':'Train structure, voice, and confidence.',
    'choice-interview-sub':'Practice common interview answers.',
    'choice-extra-sub':'Explore MUN and build your profile.',
    'hub-eyebrow':'Premium Learning Hub',
    'hub-h2':'Everything you need to prepare for, offering a premium experience.',
    'hub-lead':'A learning hub made for students who want to improve formal writing, applications, confidence, interviews, and extracurricular strategy.',
    'hub-01-title':'Formal Writing',
    'hub-01-desc':'Email formats, tone control, and clear requests.',
    'hub-02-title':'Application Profile',
    'hub-02-desc':'CV structure, skills, and education quality.',
    'hub-03-title':'Confidence Training',
    'hub-03-desc':'Public speaking tips, speech parts, and with a timer.',
    'hub-04-title':'Interview Readiness',
    'hub-04-desc':'View hints, helpful questions, and tips.',
    'hub-05-title':'Extracurricular Strategy',
    'hub-05-desc':'MUN writing, procedure, and resolution examples.',
    'hub-cta':'Enter →',
    'stat-modules':'core modules',
    'stat-tools':'interactive tools',
    'stat-focus':'student-focused',
    /* shared */
    'back-btn':'← Back',
    'draft-saved':'✓ Draft saved locally',
    'output-label':'Generated by Mr. Premium',
    'btn-clear':'Clear',
    'btn-hint':'Hint',
    'btn-reset-hints':'Reset hints',
    'btn-random-tip':'Random tip',
    'btn-start':'Start',
    'btn-pause':'Pause',
    'btn-resume':'Resume',
    'btn-reset':'Reset',
    'opt-optional':'(optional)',
    'copied':'Copied!',
    /* email section */
    'email-eyebrow':'Formal Email Helper',
    'email-h2':'Build, check, and improve a formal email.',
    'email-lead':'Fill in the details and Mr. Premium will generate a structured email, score it, and give you proper feedback.',
    'lbl-your-name':'Your name',
    'lbl-recipient':'Recipient',
    'lbl-purpose':'Purpose',
    'lbl-tone':'Tone',
    'lbl-subject':'Subject line',
    'lbl-context':'Context',
    'lbl-request':'Main request',
    'lbl-deadline':'Deadline / preferred time',
    'btn-generate-email':'Generate & check',
    'btn-copy-email':'Copy email',
    'email-score-title':'Email quality score',
    'email-score-hint':'Complete the form and press Generate & check.',
    'feedback-title':"Mr. Premium's feedback",
    'feedback-placeholder':'Your feedback will appear here.',
    'email-output-default':'Your formal email will appear here.',
    /* placeholders */
    'ph-alex':'Alex Popescu',
    'ph-professor':'Professor Smith',
    'ph-subject':'Request for meeting about my application',
    'ph-context':'Explain the situation briefly.',
    'ph-main-request':'What exactly do you need from the recipient?',
    'ph-deadline':'e.g. by Friday / before the interview',
    /* select options */
    'opt-ask':'Ask for information',
    'opt-meeting':'Request a meeting',
    'opt-assignment':'Send an assignment',
    'opt-apply':'Apply for an opportunity',
    'opt-apologise':'Apologise for a delay',
    'opt-followup':'Follow up politely',
    'opt-formal':'Formal',
    'opt-warm':'Warm but professional',
    'opt-concise':'Short and direct',
    /* cv section */
    'cv-eyebrow':'CV Builder & Analyser',
    'cv-h2':'Create a realistic student CV.',
    'cv-lead':'Build your CV step by step. Mr. Premium checks it with clear criteria and generates a clean draft.',
    'cv-sec1':'1. Personal details',
    'cv-sec2':'2. Profile',
    'cv-sec3':'3. Education',
    'cv-sec4':'4. Experience / activities',
    'cv-sec5':'5. Skills & languages',
    'lbl-full-name':'Full name',
    'lbl-target':'Target role / opportunity',
    'lbl-email':'Email',
    'lbl-phone':'Phone',
    'lbl-location':'City / country',
    'lbl-link':'LinkedIn / portfolio / GitHub',
    'lbl-career-goal':'Career goal',
    'lbl-strengths':'Main strengths',
    'lbl-school':'School / university',
    'lbl-program':'Profile / degree',
    'lbl-dates':'Dates',
    'lbl-edu-details':'Relevant achievements',
    'lbl-role':'Role',
    'lbl-org':'Organisation',
    'lbl-period':'Period',
    'lbl-actions':'What did you do?',
    'lbl-result':'Result / impact',
    'btn-add-exp':'+ Add experience',
    'lbl-tech-skills':'Technical skills',
    'lbl-soft-skills':'Soft skills',
    'lbl-languages':'Languages',
    'btn-analyse-cv':'Analyse & generate CV',
    'btn-copy-cv':'Copy CV',
    'cv-score-title':'CV quality score',
    'cv-score-hint':'Complete the form and press Analyse.',
    'cv-criteria-title':'Criteria breakdown',
    'cv-criteria-placeholder':'Analysis will appear here.',
    'cv-improvements-title':'Specific improvements',
    'cv-output-default':'Your generated CV will appear here.',
    /* cv placeholders */
    'ph-marketing-internship':'Marketing internship',
    'ph-bucharest':'Bucharest, Romania',
    'ph-career-goal':'What are you applying for and why?',
    'ph-strengths':'e.g. research, teamwork, public speaking, leadership',
    'ph-school':'Colegiul Național...',
    'ph-program':'Mathematics-Informatics',
    'ph-edu-dates':'2022 – present',
    'ph-edu-details':'informatics, olympiads, debate',
    'ph-role':'Marketing volunteer',
    'ph-org':'Robotics team / NGO',
    'ph-exp-dates':'2023 – present',
    'ph-actions':'Use action verbs: organised, created, led, researched, presented…',
    'ph-result':'e.g. attracted 3 sponsors, organised event for 120 students',
    'ph-tech-skills':'HTML, CSS, JavaScript, Excel, Canva, research',
    'ph-soft-skills':'communication, teamwork, leadership, time management',
    'ph-languages':'Romanian native, English B2, German B1',
    /* speaking section */
    'speaking-eyebrow':'Public Speaking Trainer',
    'speaking-h2':'Practice with a timer and speech hints.',
    'speaking-lead':'Use the 5-minute timer, get quick tips, and reveal the speech structure step by step.',
    'speaking-tips-title':'Quick speaking tips',
    'speaking-tips-sub':'Press the button for a random tip from Mr. Premium.',
    'speaking-tip-default':'Press the button to receive a speaking tip.',
    'timer-title':'Practice timer',
    'timer-sub':'Use this 5-minute timer to rehearse your speech.',
    'speech-hints-title':'Speech structure hints',
    'speech-hints-sub':'Reveal the parts one by one.',
    'speech-hint-default':'Press Hint to reveal Part 1: Introduction.',
    /* interview section */
    'interview-eyebrow':'Interview Coach',
    'interview-h2':'Practice with tips and answer hints.',
    'interview-lead':'Use quick interview tips and reveal the structure of a strong answer step by step.',
    'interview-tips-title':'Quick interview tips',
    'interview-tips-sub':'Press the button for a random tip from Mr. Premium.',
    'interview-tip-default':'Press the button to receive an interview tip.',
    'answer-hints-title':'Answer structure hints',
    'answer-hints-sub':'Reveal the parts of a strong answer one by one.',
    'interview-hint-default':'Press Hint to reveal Part 1: Understand the question.',
    'common-q-title':'Common interview question',
    'common-q-sub':'Generate a question and try to answer using the hints above.',
    'btn-new-question':'New question',
    'question-default':'Press New question to start practising.',
    /* extracurricular section */
    'extra-eyebrow':'Extracurricular Activities',
    'extra-h2':'Build skills outside the classroom.',
    'extra-lead':'This section covers activities that help students grow through leadership, research, debate, and real-world communication.',
    'mun-title':'Model United Nations',
    'mun-intro':'Model United Nations (MUN) is an academic simulation where students represent countries, debate global problems, and write diplomatic documents. It combines public speaking, research, negotiation, teamwork, and formal writing in one activity.',
    'mun-what-title':'What you do in MUN',
    'mun-what-1':'Represent a country or a delegation.',
    'mun-what-2':"Research a topic from that country's perspective.",
    'mun-what-3':'Write a position paper before the conference.',
    'mun-what-4':'Debate, negotiate, and form alliances during committee.',
    'mun-what-5':'Write and support resolutions that propose solutions.',
    'mun-why-title':'Why it helps self-development',
    'mun-why-1':'Improves confidence in public speaking.',
    'mun-why-2':'Builds research and critical thinking skills.',
    'mun-why-3':'Teaches diplomatic language and formal communication.',
    'mun-why-4':'Develops leadership, teamwork, and negotiation.',
    'mun-why-5':'Helps students understand international relations.',
    'mun-procedure-title':'Basic MUN procedure',
    'mun-procedure-text':"In a typical committee, delegates present their country's stance through speeches. They then debate, ask questions, negotiate in moderated and unmoderated caucuses, and write draft resolutions. At the end, delegates vote on the resolutions. The goal is not only to enhance public speaking skills, but also to cooperate and create realistic solutions.",
    'mun-pp-title':'Position paper example',
    'mun-res-title':'Resolution example',
    'mun-res-footer':"A resolution represents the committee's proposed solution to the topic. It helps delegates practise problem-solving, legal-style writing, teamwork, and persuasive negotiation, because the document must convince others to support it.",
    'footer-tagline':'Student Assistant Expert',
    /* dynamic feedback messages */
    'fb-nothing':'Nothing completed yet. Add at least recipient, subject, context and request.',
    'fb-add-name':'Add your name so the closing is complete.',
    'fb-add-recipient':'Add a clear recipient.',
    'fb-subject-specific':'Write a specific subject — avoid vague ones like "Question".',
    'fb-more-context':'Add more context so the recipient understands quickly.',
    'fb-add-context':'Add context — explain the situation in 2–3 sentences.',
    'fb-precise-request':'Make the request more precise — say exactly what you need.',
    'fb-add-request':'Add your main request — a formal email must clearly state what you need.',
    'fb-add-deadline':'Add a deadline or preferred time if relevant.',
    'fb-too-long':'The email may be too long — keep it concise.',
    'fb-no-exclamation':'Avoid exclamation marks in formal emails.',
    'fb-email-needs-structure':'Needs more structure. Add a subject, context and a clear request.',
    'fb-email-good-start':'Good start. Improve clarity and add any missing details.',
    'fb-email-strong':'Strong email. Check spelling and do a final read before sending.',
    'fb-email-excellent':'Excellent structure — clear subject, polite tone, context and request all included.',
    'fb-add-info-before':'Add information before generating.',
    /* cv feedback */
    'cv-no-input':'Add real CV information before analysing.',
    'cv-no-criteria':'No criteria could be evaluated.',
    'cv-nothing':'Nothing completed yet.',
    'cv-fb-name':'Use a real full name — no numbers.',
    'cv-fb-target':'Add a clear target role or opportunity.',
    'cv-fb-email':'Add a valid email address.',
    'cv-fb-phone':'Add a phone number.',
    'cv-fb-goal':'Write a real career goal of at least 10 words.',
    'cv-fb-strengths':'Add at least 3 relevant strengths.',
    'cv-fb-school':'Add a real school or university name.',
    'cv-fb-program':'Add your profile, degree or specialisation.',
    'cv-fb-dates':'Add education dates, e.g. 2022–present.',
    'cv-fb-edu-details':'Add relevant subjects or achievements.',
    'cv-fb-exp':'Add at least one experience, volunteering or club role.',
    'cv-fb-action-verbs':'Use stronger action verbs in experience.',
    'cv-fb-results':'Add results with numbers if possible.',
    'cv-fb-tech-skills':'Add at least 3 technical skills.',
    'cv-fb-soft-skills':'Add at least 3 soft skills.',
    'cv-fb-languages':'Add languages with levels, e.g. English B2.',
    'cv-fb-too-many-exp':'Keep only the most relevant experiences for a one-page CV.',
    'cv-advice-low':'Not ready yet — needs real information in all sections.',
    'cv-advice-mid':'Good base. Add stronger results and clearer impact.',
    'cv-advice-high':'Strong student CV. Polish the wording and tailor it to the opportunity.',
    'cv-fb-great':'Great structure. Check grammar, spacing and relevance of every bullet.',
    'cv-exp-alert':'Please fill in Role, Organisation and at least a brief description of what you did.',
    /* criteria labels */
    'crit-personal':'Personal details',
    'crit-profile':'Profile relevance',
    'crit-education':'Education',
    'crit-experience':'Experience & activities',
    'crit-skills':'Skills',
    'crit-languages':'Languages & formatting',
    'crit-pts':'pts',
    /* timer */
    'timer-up':'Time is up! Review your introduction, structure and conclusion.',
  },
  ro:{
    'skip-main':'Sari la conținutul principal',
    'brand-name':'Mr. Premium',
    'nav-email':'Email',
    'nav-cv':'CV',
    'nav-speaking':'Discurs Public',
    'nav-interview':'Interviuri',
    'nav-extra':'Extracurricular',
    'home-eyebrow':'Asistent pentru comunicarea elevilor',
    'home-h1':'Alege ce vrei să îmbunătățești astăzi.',
    'home-lead':'Mr. Premium îi ajută pe elevi și studenți să scrie emailuri formale, să creeze CV-uri mai bune, să vorbească încrezător, să se pregătească pentru interviuri și să își dezvolte activitățile extracurriculare.',
    'mascot-sub':'Un ghid politicos, încrezător și util, la dispoziția ta.',
    'mascot-alt':'Mascota Mr. Premium, încrezătoare și elegantă',
    'choice-email-sub':'Scrie emailuri academice clare și politicoase.',
    'choice-cv-sub':'Construiește și îmbunătățește CV-ul tău de elev.',
    'choice-speaking-sub':'Exersează structura, vocea și încrederea.',
    'choice-interview-sub':'Exersează răspunsuri pentru întrebări frecvente.',
    'choice-extra-sub':'Explorează MUN și construiește-ți profilul.',
    'hub-eyebrow':'Centrul Premium de Învățare',
    'hub-h2':'Tot ce ai nevoie ca să te pregătești, într-o experiență premium.',
    'hub-lead':'Un centru de învățare creat pentru elevii și studenții care vor să își îmbunătățească scrisul formal, încrederea, interviurile și strategia extracurriculară.',
    'hub-01-title':'Scriere Formală',
    'hub-01-desc':'Formate de email, controlul tonului și cereri clare.',
    'hub-02-title':'Profil de Aplicație',
    'hub-02-desc':'Structura CV-ului, abilități și calitatea educației.',
    'hub-03-title':'Antrenament pentru Încredere',
    'hub-03-desc':'Sfaturi pentru discurs, părțile discursului și cronometru.',
    'hub-04-title':'Pregătire pentru Interviu',
    'hub-04-desc':'Vezi indicii, întrebări utile și sfaturi.',
    'hub-05-title':'Strategie Extracurriculară',
    'hub-05-desc':'Scriere MUN, procedură și exemple de rezoluții.',
    'hub-cta':'Intră →',
    'stat-modules':'module principale',
    'stat-tools':'instrumente interactive',
    'stat-focus':'orientat spre elevi',
    'back-btn':'← Înapoi',
    'draft-saved':'✓ Ciorna salvată local',
    'output-label':'Generat de Mr. Premium',
    'btn-clear':'Șterge',
    'btn-hint':'Indiciu',
    'btn-reset-hints':'Resetează indiciile',
    'btn-random-tip':'Sfat aleatoriu',
    'btn-start':'Start',
    'btn-pause':'Pauză',
    'btn-resume':'Continuă',
    'btn-reset':'Resetare',
    'opt-optional':'(optional)',
    'copied':'Copiat!',
    'email-eyebrow':'Ajutor pentru Email Formal',
    'email-h2':'Construiește, verifică și îmbunătățește un email formal.',
    'email-lead':'Completează detaliile, iar Mr. Premium va genera un email structurat, îl va nota și îți va oferi feedback potrivit.',
    'lbl-your-name':'Numele tău',
    'lbl-recipient':'Destinatar',
    'lbl-purpose':'Scop',
    'lbl-tone':'Ton',
    'lbl-subject':'Subiect',
    'lbl-context':'Context',
    'lbl-request':'Cererea principală',
    'lbl-deadline':'Termen limită / moment preferat',
    'btn-generate-email':'Generează și verifică',
    'btn-copy-email':'Copiază emailul',
    'email-score-title':'Scorul calității emailului',
    'email-score-hint':'Completeaza formularul si apasa Generează și verifică.',
    'feedback-title':'Feedback-ul lui Mr. Premium',
    'feedback-placeholder':'Feedback-ul tău va apărea aici.',
    'email-output-default':'Emailul tău formal va apărea aici.',
    'ph-alex':'Alex Popescu',
    'ph-professor':'Profesorul Ionescu',
    'ph-subject':'Cerere de întâlnire despre aplicația mea',
    'ph-context':'Explică pe scurt situația.',
    'ph-main-request':'Ce ai nevoie exact de la destinatar?',
    'ph-deadline':'de ex. până vineri / înainte de interviu',
    'opt-ask':'Cere informații',
    'opt-meeting':'Solicită o întâlnire',
    'opt-assignment':'Trimite o temă',
    'opt-apply':'Aplică pentru o oportunitate',
    'opt-apologise':'Cere scuze pentru o întârziere',
    'opt-followup':'Revino politicos cu un mesaj',
    'opt-formal':'Formal',
    'opt-warm':'Cald, dar profesional',
    'opt-concise':'Scurt și direct',
    'cv-eyebrow':'Constructor și Analizator de CV',
    'cv-h2':'Creează un CV realist de elev sau student.',
    'cv-lead':'Construiește CV-ul pas cu pas. Mr. Premium îl verifică după criterii clare și generează o variantă curată.',
    'cv-sec1':'1. Detalii personale',
    'cv-sec2':'2. Profil',
    'cv-sec3':'3. Educație',
    'cv-sec4':'4. Experiență / activități',
    'cv-sec5':'5. Abilități și limbi',
    'lbl-full-name':'Nume complet',
    'lbl-target':'Rol / oportunitate vizata',
    'lbl-email':'Email',
    'lbl-phone':'Telefon',
    'lbl-location':'Oraș / țară',
    'lbl-link':'LinkedIn / portofoliu / GitHub',
    'lbl-career-goal':'Obiectiv profesional',
    'lbl-strengths':'Puncte forte principale',
    'lbl-school':'Școală / universitate',
    'lbl-program':'Profil / diplomă',
    'lbl-dates':'Perioada',
    'lbl-edu-details':'Realizări relevante',
    'lbl-role':'Rol',
    'lbl-org':'Organizație',
    'lbl-period':'Perioada',
    'lbl-actions':'Ce ai făcut?',
    'lbl-result':'Rezultat / impact',
    'btn-add-exp':'+ Adaugă experiență',
    'lbl-tech-skills':'Abilități tehnice',
    'lbl-soft-skills':'Abilități sociale',
    'lbl-languages':'Limbi',
    'btn-analyse-cv':'Analizează și generează CV-ul',
    'btn-copy-cv':'Copiază CV-ul',
    'cv-score-title':'Scorul calității CV-ului',
    'cv-score-hint':'Completează formularul și apasă Analizează.',
    'cv-criteria-title':'Evaluarea criteriilor',
    'cv-criteria-placeholder':'Analiza va apărea aici.',
    'cv-improvements-title':'Îmbunătățiri specifice',
    'cv-output-default':'CV-ul generat va apărea aici.',
    'ph-marketing-internship':'Internship in marketing',
    'ph-bucharest':'București, România',
    'ph-career-goal':'Pentru ce aplici și de ce?',
    'ph-strengths':'de ex. cercetare, lucru în echipă, discurs public, leadership',
    'ph-school':'Colegiul Național...',
    'ph-program':'Matematică-Informatică',
    'ph-edu-dates':'2022 – prezent',
    'ph-edu-details':'informatică, olimpiade, debate',
    'ph-role':'Voluntar marketing',
    'ph-org':'Echipa de robotică / ONG',
    'ph-exp-dates':'2023 – prezent',
    'ph-actions':'Folosește verbe de acțiune: organizat, creat, coordonat, cercetat, prezentat...',
    'ph-result':'de ex. ai atras 3 sponsori, ai organizat un eveniment pentru 120 de elevi',
    'ph-tech-skills':'HTML, CSS, JavaScript, Excel, Canva, cercetare',
    'ph-soft-skills':'comunicare, lucru în echipă, leadership, gestionarea timpului',
    'ph-languages':'Română nativ, Engleză B2, Germană B1',
    'speaking-eyebrow':'Antrenor pentru Discurs Public',
    'speaking-h2':'Exersează cu un cronometru și indicii pentru discurs.',
    'speaking-lead':'Folosește cronometrul de 5 minute, primește sfaturi rapide și descoperă structura discursului pas cu pas.',
    'speaking-tips-title':'Sfaturi rapide pentru discurs',
    'speaking-tips-sub':'Apasă butonul pentru un sfat aleatoriu de la Mr. Premium.',
    'speaking-tip-default':'Apasă butonul pentru a primi un sfat pentru discurs.',
    'timer-title':'Cronometru pentru exersare',
    'timer-sub':'Folosește acest cronometru de 5 minute pentru a-ți repeta discursul.',
    'speech-hints-title':'Indicii pentru structura discursului',
    'speech-hints-sub':'Descoperă părțile una câte una.',
    'speech-hint-default':'Apasă Indiciu pentru a vedea Partea 1: Introducerea.',
    'interview-eyebrow':'Antrenor pentru Interviu',
    'interview-h2':'Exersează cu sfaturi și indicii pentru răspunsuri.',
    'interview-lead':'Folosește sfaturi rapide pentru interviu și descoperă pas cu pas structura unui răspuns puternic.',
    'interview-tips-title':'Sfaturi rapide pentru interviu',
    'interview-tips-sub':'Apasă butonul pentru un sfat aleatoriu de la Mr. Premium.',
    'interview-tip-default':'Apasă butonul pentru a primi un sfat pentru interviu.',
    'answer-hints-title':'Indicii pentru structura răspunsului',
    'answer-hints-sub':'Descoperă părțile unui răspuns bun una câte una.',
    'interview-hint-default':'Apasă Indiciu pentru a vedea Partea 1: Înțelege întrebarea.',
    'common-q-title':'Întrebare frecventă de interviu',
    'common-q-sub':'Generează o întrebare și încearcă să răspunzi folosind indiciile de mai sus.',
    'btn-new-question':'Întrebare nouă',
    'question-default':'Apasa Întrebare nouă pentru a incepe exersarea.',
    'extra-eyebrow':'Activități Extracurriculare',
    'extra-h2':'Dezvoltă abilități în afara clasei.',
    'extra-lead':'Această secțiune acoperă activități care îi ajută pe elevi să crească prin leadership, cercetare, dezbatere și comunicare reală.',
    'mun-title':'Model United Nations',
    'mun-intro':'Model United Nations (MUN) este o simulare academică în care elevii reprezintă țări, dezbat probleme globale și scriu documente diplomatice. Combină discursul public, cercetarea, negocierea, munca în echipă și scrierea formală într-o singură activitate.',
    'mun-what-title':'Ce faci la MUN',
    'mun-what-1':'Reprezinți o țară sau o delegație.',
    'mun-what-2':'Cercetezi un subiect din perspectiva acelei țări.',
    'mun-what-3':'Scrii un position paper înainte de conferință.',
    'mun-what-4':'Dezbați, negociezi și formezi alianțe în comitet.',
    'mun-what-5':'Scrii și susții rezoluții care propun soluții.',
    'mun-why-title':'De ce ajută la dezvoltarea personală',
    'mun-why-1':'Îmbunătățește încrederea în discursul public.',
    'mun-why-2':'Dezvoltă abilități de cercetare și gândire critică.',
    'mun-why-3':'Te învață limbaj diplomatic și comunicare formală.',
    'mun-why-4':'Dezvoltă leadershipul, munca în echipă și negocierea.',
    'mun-why-5':'Ajută elevii să înțeleagă relațiile internaționale.',
    'mun-procedure-title':'Procedura MUN de bază',
    'mun-procedure-text':'Într-un comitet tipic, delegații prezintă poziția țării lor prin discursuri. Apoi dezbat, pun întrebări, negociază în caucusuri moderate și nemoderate și scriu drafturi de rezoluții. La final, delegații votează rezoluțiile. Scopul nu este doar îmbunătățirea discursului public, ci și cooperarea pentru a crea soluții realiste.',
    'mun-pp-title':'Exemplu de position paper',
    'mun-res-title':'Exemplu de rezoluție',
    'mun-res-footer':'O rezoluție reprezintă soluția propusă de comitet pentru subiect. Îi ajută pe delegați să exerseze rezolvarea problemelor, scrierea în stil juridic, munca în echipă și negocierea persuasivă, deoarece documentul trebuie să îi convingă pe ceilalți să îl susțină.',
    'footer-tagline':'Asistent Expert pentru Elevi',
    'fb-nothing':'Nu ai completat nimic încă. Adaugă cel puțin destinatarul, subiectul, contextul și cererea.',
    'fb-add-name':'Adaugă numele tău pentru ca încheierea să fie completă.',
    'fb-add-recipient':'Adaugă un destinatar clar.',
    'fb-subject-specific':'Scrie un subiect specific - evită variante vagi precum "Întrebare".',
    'fb-more-context':'Adaugă mai mult context pentru ca destinatarul să înțeleagă rapid.',
    'fb-add-context':'Adaugă context - explică situația în 2-3 propoziții.',
    'fb-precise-request':'Fă cererea mai precisă - spune exact ce ai nevoie.',
    'fb-add-request':'Adaugă cererea principală - un email formal trebuie să spună clar ce ai nevoie.',
    'fb-add-deadline':'Adaugă un termen limită sau un moment preferat, dacă este relevant.',
    'fb-too-long':'Emailul poate fi prea lung - păstrează-l concis.',
    'fb-no-exclamation':'Evită semnele de exclamare în emailurile formale.',
    'fb-email-needs-structure':'Are nevoie de mai multă structură. Adaugă subiect, context și o cerere clară.',
    'fb-email-good-start':'Început bun. Îmbunătățește claritatea și adaugă detaliile lipsă.',
    'fb-email-strong':'Email puternic. Verifică ortografia și recitește-l înainte de trimitere.',
    'fb-email-excellent':'Structură excelentă - subiect clar, ton politicos, context și cerere incluse.',
    'fb-add-info-before':'Adaugă informații înainte de generare.',
    'cv-no-input':'Adaugă informații reale pentru CV înainte de analiză.',
    'cv-no-criteria':'Nu s-a putut evalua niciun criteriu.',
    'cv-nothing':'Nu ai completat nimic încă.',
    'cv-fb-name':'Folosește un nume complet real - fără numere.',
    'cv-fb-target':'Adauga un rol sau o oportunitate clara.',
    'cv-fb-email':'Adaugă o adresă de email validă.',
    'cv-fb-phone':'Adaugă un număr de telefon.',
    'cv-fb-goal':'Scrie un obiectiv profesional real de cel puțin 10 cuvinte.',
    'cv-fb-strengths':'Adaugă cel puțin 3 puncte forte relevante.',
    'cv-fb-school':'Adaugă un nume real de școală sau universitate.',
    'cv-fb-program':'Adauga profilul, diploma sau specializarea.',
    'cv-fb-dates':'Adaugă perioada studiilor, de ex. 2022-prezent.',
    'cv-fb-edu-details':'Adaugă materii sau realizări relevante.',
    'cv-fb-exp':'Adaugă cel puțin o experiență, activitate de voluntariat sau rol într-un club.',
    'cv-fb-action-verbs':'Folosește verbe de acțiune mai puternice în experiență.',
    'cv-fb-results':'Adaugă rezultate cu numere, dacă este posibil.',
    'cv-fb-tech-skills':'Adaugă cel puțin 3 abilități tehnice.',
    'cv-fb-soft-skills':'Adaugă cel puțin 3 abilități sociale.',
    'cv-fb-languages':'Adaugă limbi cu niveluri, de ex. Engleză B2.',
    'cv-fb-too-many-exp':'Păstrează doar experiențele cele mai relevante pentru un CV de o pagină.',
    'cv-advice-low':'Nu este gata încă - are nevoie de informații reale în toate secțiunile.',
    'cv-advice-mid':'Bază bună. Adaugă rezultate mai puternice și impact mai clar.',
    'cv-advice-high':'CV de student puternic. Finisează exprimarea și adaptează-l oportunității.',
    'cv-fb-great':'Structură foarte bună. Verifică gramatica, spațierea și relevanța fiecărui punct.',
    'cv-exp-alert':'Completează rolul, organizația și cel puțin o descriere scurtă a ceea ce ai făcut.',
    'crit-personal':'Detalii personale',
    'crit-profile':'Relevanța profilului',
    'crit-education':'Educatie',
    'crit-experience':'Experiență și activități',
    'crit-skills':'Abilități',
    'crit-languages':'Limbi și formatare',
    'crit-pts':'puncte',
    'timer-up':'Timpul a expirat! Revizuiește introducerea, structura și concluzia.',
  }
};

/* Translation helper */
function t(key){ return (STRINGS[currentLang]&&STRINGS[currentLang][key])||STRINGS.en[key]||key; }

/* Apply all translations to DOM */
function applyI18n(){
  /* text content */
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key=el.getAttribute('data-i18n');
    el.textContent=t(key);
  });
  /* placeholders */
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
    el.placeholder=t(el.getAttribute('data-i18n-ph'));
  });
  /* aria-labels */
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>{
    el.setAttribute('aria-label',t(el.getAttribute('data-i18n-aria')));
  });
  /* alt text */
  document.querySelectorAll('[data-i18n-alt]').forEach(el=>{
    el.setAttribute('alt',t(el.getAttribute('data-i18n-alt')));
  });
  /* default pre/div text — only set if still showing default */
  document.querySelectorAll('[data-i18n-default]').forEach(el=>{
    const key=el.getAttribute('data-i18n-default');
    const enDefault=STRINGS.en[key];
    const roDefault=STRINGS.ro[key];
    const cur=el.textContent.trim();
    if(cur===enDefault||cur===roDefault||cur===''){
      el.textContent=t(key);
    }
  });
  /* page title */
  document.title=currentLang==='ro'
    ?'Mr. Premium - Asistent Expert pentru Elevi'
    :'Mr. Premium - Student Assistant Expert';
  document.documentElement.lang=currentLang;
  /* lang button */
  const lb=$('langToggle');
  if(lb){
    lb.textContent=currentLang==='ro'?'EN':'RO';
    lb.setAttribute('aria-label',currentLang==='ro'?'Schimbă limba în engleză':'Change language to Romanian');
  }
  /* pause/resume button */
  const prBtn=$('pauseResumeBtn');
  if(prBtn){prBtn.textContent=timerInterval?t('btn-pause'):t('btn-resume');}
}

function toggleLanguage(){
  currentLang=currentLang==='en'?'ro':'en';
  applyI18n();
}

/* =============================================================
   EMAIL MODULE
   ============================================================= */
function analyzeEmail(){
  const d={
    sender:   sanitize($('emailSender').value),
    recipient:sanitize($('emailTo').value),
    purpose:  $('emailPurpose').value,
    tone:     $('emailTone').value,
    subject:  sanitize($('emailSubject').value),
    context:  sanitize($('emailContext').value),
    request:  sanitize($('emailRequest').value),
    deadline: sanitize($('emailDeadline').value)
  };

  $('emailSuggestions').innerHTML='';

  if(!d.sender&&!d.recipient&&!d.subject&&!d.context&&!d.request){
    setScore('emailScoreCircle','emailScore',0);
    $('emailAdvice').textContent=t('fb-add-info-before');
    addLi('emailSuggestions',t('fb-nothing'),'sug-bad');
    $('emailOutput').textContent=t('email-output-default');
    return;
  }

  let score=0;
  if(d.sender){score+=8;}else addLi('emailSuggestions',t('fb-add-name'),'sug-warn');
  if(d.recipient){score+=10;}else addLi('emailSuggestions',t('fb-add-recipient'),'sug-warn');
  if(d.subject&&wordCount(d.subject)>=3){score+=12;}
  else addLi('emailSuggestions',t('fb-subject-specific'),'sug-bad');
  if(wordCount(d.context)>=18){score+=18;}
  else if(d.context){score+=9;addLi('emailSuggestions',t('fb-more-context'),'sug-warn');}
  else addLi('emailSuggestions',t('fb-add-context'),'sug-bad');
  if(wordCount(d.request)>=12){score+=22;}
  else if(d.request){score+=10;addLi('emailSuggestions',t('fb-precise-request'),'sug-warn');}
  else addLi('emailSuggestions',t('fb-add-request'),'sug-bad');
  if(d.deadline){score+=8;}else addLi('emailSuggestions',t('fb-add-deadline'),'sug-warn');
  if(d.context&&d.request&&d.recipient&&d.subject)score+=12;
  if((d.context+d.request).length>900){score-=8;addLi('emailSuggestions',t('fb-too-long'),'sug-warn');}
  if(/!/.test(d.context+d.request)){score-=5;addLi('emailSuggestions',t('fb-no-exclamation'),'sug-warn');}

  score=Math.round(Math.max(0,Math.min(100,score)));
  setScore('emailScoreCircle','emailScore',score);
  $('emailAdvice').textContent=score<45?t('fb-email-needs-structure'):score<75?t('fb-email-good-start'):t('fb-email-strong');
  if(!$('emailSuggestions').children.length)addLi('emailSuggestions',t('fb-email-excellent'),'sug-good');
  $('emailOutput').textContent=buildEmail(d);
}

function buildEmail(d){
  if(currentLang!=='ro'){
    const recipient=d.recipient||'Sir/Madam';
    const sender=d.sender||'[Your Name]';
    const subject=d.subject||getDefaultSubject(d.purpose);
    const context=d.context||'[Add context here.]';
    const request=d.request||'[Add your request here.]';
    const tones={
      formal:  ['I hope this message finds you well.','I would be grateful if you could','Thank you for your time and consideration.','Kind regards,'],
      warm:    ['I hope you are doing well.','I would really appreciate it if you could','Thank you very much for your help.','Best regards,'],
      concise: ['I am writing regarding the matter below.','Please','Thank you.','Regards,']
    };
    const tn=tones[d.tone]||tones.formal;
    const purposes={
      'ask for information':      ['ask for information regarding','clarify','This information would help me prepare properly.'],
      'request a meeting':        ['request a meeting regarding','discuss','A short meeting would help me understand the next steps.'],
      'send an assignment':       ['send my assignment regarding','review','Please let me know if additional information is needed.'],
      'apply for an opportunity': ['apply for the opportunity related to','consider my application because','I would be glad to provide any extra details.'],
      'apologise for a delay':    ['apologise for the delay regarding','understand that','I apologise for any inconvenience caused.'],
      'follow up politely':       ['politely follow up on','share updates about','This would help me plan my next steps.']
    };
    const [action,verb,extra]=purposes[d.purpose]||['write regarding','help with',''];
    const deadline=d.deadline?`\n\nIf possible, I would appreciate a response ${d.deadline}.`:'';
    return `Subject: ${subject}\n\nDear ${recipient},\n\n${tn[0]}\n\nI am writing to ${action} ${context}\n\n${tn[1]} ${verb} ${request}? ${extra}${deadline}\n\n${tn[2]}\n\n${tn[3]}\n${sender}`;
  }
  /* Romanian */
  const recipient=d.recipient||'Domnule/Doamnă';
  const sender=d.sender||'[Numele tău]';
  const subject=d.subject||getDefaultSubject(d.purpose);
  const context=d.context||'[Adaugă contextul aici.]';
  const request=d.request||'[Adaugă cererea aici.]';
  const tones={
    formal:  ['Sper ca acest mesaj să nu vă deranjeze.','V-aș fi recunoscător dacă ați putea','Vă mulțumesc pentru timpul și atenția ofertă.','Cu stimă,'],
    warm:    ['Sper că sunteți bine.','Aș aprecia foarte mult dacă ați putea','Vă mulțumesc mult pentru ajutor.','Cu respect,'],
    concise: ['Vă scriu în legătură cu aspectul de mai jos.','Vă rog să','Vă mulțumesc.','Cu stimă,']
  };
  const purposes={
    'ask for information':      ['solicita informații despre','clarifica','Aceste informații m-ar ajuta să mă pregătesc corespunzător.'],
    'request a meeting':        ['solicita o întâlnire despre','discuta','O întâlnire scurtă m-ar ajuta să înțeleg următorii pași.'],
    'send an assignment':       ['trimite tema mea despre','verifica','Vă rog să imi spuneti daca sunt necesare informatii suplimentare.'],
    'apply for an opportunity': ['aplica pentru oportunitatea legata de','lua în considerare aplicația mea deoarece','Aș fi bucuros să ofer detalii suplimentare.'],
    'apologise for a delay':    ['îmi cere scuze pentru întârzierea legată de','înțelege că','Îmi cer scuze pentru orice disconfort creat.'],
    'follow up politely':       ['reveni politicos asupra','împărtăși actualizări despre','Acest lucru m-ar ajuta să îmi planific următorii pași.']
  };
  const tn=tones[d.tone]||tones.formal;
  const [action,verb,extra]=purposes[d.purpose]||purposes['ask for information'];
  const deadline=d.deadline?`\n\nDacă este posibil, aș aprecia un răspuns ${d.deadline}.`:'';
  return `Subiect: ${subject}\n\nStimate Domn/Stimată Doamnă, ${recipient},\n\n${tn[0]}\n\nVă scriu pentru a ${action} ${context}\n\n${tn[1]} ${verb} ${request}? ${extra}${deadline}\n\n${tn[2]}\n\n${tn[3]}\n${sender}`;
}

function getDefaultSubject(purpose){
  const en={
    'ask for information':'Request for information',
    'request a meeting':'Meeting request',
    'send an assignment':'Assignment submission',
    'apply for an opportunity':'Application for opportunity',
    'apologise for a delay':'Apology for delay',
    'follow up politely':'Follow-up on previous message'
  };
  const ro={
    'ask for information':'Cerere de informații',
    'request a meeting':'Solicitare de întâlnire',
    'send an assignment':'Trimitere tema',
    'apply for an opportunity':'Aplicație pentru oportunitate',
    'apologise for a delay':'Scuze pentru întârziere',
    'follow up politely':'Revenire asupra mesajului anterior'
  };
  const map=currentLang==='ro'?ro:en;
  return map[purpose]||(purpose.charAt(0).toUpperCase()+purpose.slice(1));
}

function clearEmailForm(){
  EMAIL_FIELDS.forEach(id=>{const el=$(id);if(el)el.value='';});
  $('emailPurpose').value='ask for information';
  $('emailTone').value='formal';
  setScore('emailScoreCircle','emailScore',0);
  $('emailAdvice').textContent=t('email-score-hint');
  $('emailSuggestions').innerHTML='<li>'+t('feedback-placeholder')+'</li>';
  $('emailOutput').textContent=t('email-output-default');
  try{localStorage.removeItem('mp_email_draft');}catch(_){}
}

/* =============================================================
   CV MODULE
   ============================================================= */
let cvExperiences=[];

function addExperience(){
  const role=sanitize($('cvExpRole').value);
  const org=sanitize($('cvExpOrg').value);
  const period=sanitize($('cvExpPeriod').value);
  const actions=sanitize($('cvExpActions').value);
  const result=sanitize($('cvExpResult').value);
  if(!isMeaningful(role,1,3)||!isMeaningful(org,1,3)||!isMeaningful(actions,4,14)){
    alert(t('cv-exp-alert'));return;
  }
  cvExperiences.push({role,organization:org,period,actions,result});
  renderExpList();
  ['cvExpRole','cvExpOrg','cvExpPeriod','cvExpActions','cvExpResult'].forEach(id=>{const el=$(id);if(el)el.value='';});
}

function renderExpList(){
  const list=$('cvExperienceItems');list.innerHTML='';
  cvExperiences.forEach((item,i)=>{
    const li=document.createElement('li');
    li.textContent=`${item.role} ${currentLang==='ro'?'la':'at'} ${item.organization}${item.period?' ('+item.period+')':''}`;
    li.title=currentLang==='ro'?'Apasă pentru a elimina':'Click to remove';
    li.setAttribute('role','button');li.setAttribute('tabindex','0');
    li.addEventListener('click',()=>removeExp(i));
    li.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')removeExp(i);});
    list.appendChild(li);
  });
}
function removeExp(i){cvExperiences.splice(i,1);renderExpList();}

function analyzeCV(){
  const d={
    name:sanitize($('cvName').value),target:sanitize($('cvTarget').value),
    email:sanitize($('cvEmail').value),phone:sanitize($('cvPhone').value),
    location:sanitize($('cvLocation').value),link:sanitize($('cvLink').value),
    goal:sanitize($('cvGoal').value),strengths:sanitize($('cvStrengths').value),
    school:sanitize($('cvSchool').value),program:sanitize($('cvProgram').value),
    educationDates:sanitize($('cvEducationDates').value),educationDetails:sanitize($('cvEducationDetails').value),
    technicalSkills:sanitize($('cvTechnicalSkills').value),softSkills:sanitize($('cvSoftSkills').value),
    languages:sanitize($('cvLanguages').value),experiences:cvExperiences
  };

  $('cvSuggestions').innerHTML='';$('cvCriteria').innerHTML='';

  const hasInput=Object.values(d).filter(v=>!Array.isArray(v)).some(Boolean)||d.experiences.length;
  if(!hasInput){
    setScore('cvScoreCircle','cvScore',0);
    $('cvAdvice').textContent=t('cv-no-input');
    $('cvCriteria').innerHTML='<li class="crit-fail">'+t('cv-no-criteria')+'</li>';
    $('cvSuggestions').innerHTML='<li class="sug-bad">'+t('cv-nothing')+'</li>';
    $('cvPreview').textContent=t('cv-output-default');
    return;
  }

  function criterion(labelKey,pts,max){
    addLi('cvCriteria',`${t(labelKey)}: ${pts}/${max} ${t('crit-pts')}`,
      pts>=max*.75?'crit-pass':pts>0?'crit-mid':'crit-fail');
  }

  let score=0,pts;

  pts=0;
  if(isMeaningful(d.name,2,5)&&!hasNumber(d.name))pts+=4;else addLi('cvSuggestions',t('cv-fb-name'),'sug-bad');
  if(isMeaningful(d.target,2,8))pts+=4;else addLi('cvSuggestions',t('cv-fb-target'),'sug-warn');
  if(hasEmail(d.email))pts+=4;else addLi('cvSuggestions',t('cv-fb-email'),'sug-bad');
  if(d.phone&&hasNumber(d.phone))pts+=2;else addLi('cvSuggestions',t('cv-fb-phone'),'sug-warn');
  if(isMeaningful(d.location,1,4)||d.link.length>8)pts+=1;
  score+=pts;criterion('crit-personal',pts,15);

  pts=0;
  if(isMeaningful(d.goal,10,35))pts+=7;else addLi('cvSuggestions',t('cv-fb-goal'),'sug-warn');
  if(countItems(d.strengths)>=3)pts+=5;else addLi('cvSuggestions',t('cv-fb-strengths'),'sug-warn');
  if(d.target&&d.goal.toLowerCase().includes(d.target.split(' ')[0].toLowerCase()))pts+=3;
  score+=pts;criterion('crit-profile',pts,15);

  pts=0;
  if(isMeaningful(d.school,2,6))pts+=4;else addLi('cvSuggestions',t('cv-fb-school'),'sug-bad');
  if(isMeaningful(d.program,2,6))pts+=4;else addLi('cvSuggestions',t('cv-fb-program'),'sug-warn');
  if(hasNumber(d.educationDates)||/present|current|prezent/i.test(d.educationDates))pts+=3;else addLi('cvSuggestions',t('cv-fb-dates'),'sug-warn');
  if(isMeaningful(d.educationDetails,3,12))pts+=4;else addLi('cvSuggestions',t('cv-fb-edu-details'),'sug-warn');
  score+=pts;criterion('crit-education',pts,15);

  pts=0;
  if(d.experiences.length>0)pts+=10;else addLi('cvSuggestions',t('cv-fb-exp'),'sug-bad');
  if(d.experiences.some(e=>hasActionVerb(e.actions)))pts+=6;else if(d.experiences.length)addLi('cvSuggestions',t('cv-fb-action-verbs'),'sug-warn');
  if(d.experiences.some(e=>hasNumber(e.result)||isMeaningful(e.result,6,18)))pts+=6;else if(d.experiences.length)addLi('cvSuggestions',t('cv-fb-results'),'sug-warn');
  if(d.experiences.length>=2)pts+=3;
  score+=pts;criterion('crit-experience',pts,25);

  pts=0;
  const techCount=countItems(d.technicalSkills);
  const softCount=countItems(d.softSkills);
  if(techCount>=3)pts+=7;else addLi('cvSuggestions',t('cv-fb-tech-skills'),'sug-warn');
  if(softCount>=3)pts+=5;else addLi('cvSuggestions',t('cv-fb-soft-skills'),'sug-warn');
  if(techCount+softCount>=8)pts+=3;
  score+=pts;criterion('crit-skills',pts,15);

  pts=0;
  if(countItems(d.languages)>=2||/\b(native|nativ|b1|b2|c1|c2|a1|a2)\b/i.test(d.languages))pts+=6;else addLi('cvSuggestions',t('cv-fb-languages'),'sug-warn');
  if(score>=45)pts+=5;
  if(d.experiences.length<=5&&score>=45)pts+=4;
  else if(d.experiences.length>5)addLi('cvSuggestions',t('cv-fb-too-many-exp'),'sug-warn');
  score+=pts;criterion('crit-languages',pts,15);

  score=Math.round(Math.max(0,Math.min(100,score)));
  setScore('cvScoreCircle','cvScore',score);
  $('cvAdvice').textContent=score<40?t('cv-advice-low'):score<70?t('cv-advice-mid'):t('cv-advice-high');
  if(!$('cvSuggestions').children.length)addLi('cvSuggestions',t('cv-fb-great'),'sug-good');
  $('cvPreview').textContent=buildCV(d);
}

function buildCV(d){
  const contact=[d.email,d.phone,d.location,d.link].filter(Boolean).join(' | ');
  if(currentLang!=='ro'){
    const profile=d.goal&&d.strengths?`${d.goal}\nKey strengths: ${d.strengths}.`:d.goal||'[Write a focused 2-3 line profile.]';
    const expText=d.experiences.length
      ?d.experiences.map(e=>`${e.role} — ${e.organization}${e.period?' | '+e.period:''}\n- ${e.actions}${e.result?'\n  Impact: '+e.result:''}`).join('\n\n')
      :'[Add experience, volunteering, club activity or responsibility.]';
    return `${d.name||'[Full Name]'}\n${d.target||'[Target role / opportunity]'}\n${contact||'[Email | Phone | Location]'}\n\nPROFILE\n${profile}\n\nEDUCATION\n${d.school||'[School / University]'}${d.program?' — '+d.program:''}\n${d.educationDates||'[Dates]'}\n${d.educationDetails?'- '+d.educationDetails:'- [Add relevant subjects or achievements.]'}\n\nEXPERIENCE / ACTIVITIES\n${expText}\n\nSKILLS\nTechnical: ${d.technicalSkills||'[Technical skills]'}\nSoft skills: ${d.softSkills||'[Soft skills]'}\n\nLANGUAGES\n${d.languages||'[Languages and levels]'}`;
  }
  const profile=d.goal&&d.strengths?`${d.goal}\nPuncte forte: ${d.strengths}.`:d.goal||'[Scrie un profil concentrat de 2-3 rânduri.]';
  const expText=d.experiences.length
    ?d.experiences.map(e=>`${e.role} — ${e.organization}${e.period?' | '+e.period:''}\n- ${e.actions}${e.result?'\n  Impact: '+e.result:''}`).join('\n\n')
    :'[Adaugă experiență, voluntariat, activitate de club sau responsabilitate.]';
  return `${d.name||'[Nume complet]'}\n${d.target||'[Rol / oportunitate vizată]'}\n${contact||'[Email | Telefon | Locație]'}\n\nPROFIL\n${profile}\n\nEDUCAȚIE\n${d.school||'[Școală / Universitate]'}${d.program?' — '+d.program:''}\n${d.educationDates||'[Perioada]'}\n${d.educationDetails?'- '+d.educationDetails:'- [Adaugă materii sau realizări relevante.]'}\n\nEXPERIENȚĂ / ACTIVITĂȚI\n${expText}\n\nABILITĂȚI\nTehnice: ${d.technicalSkills||'[Abilități tehnice]'}\nSociale: ${d.softSkills||'[Abilități sociale]'}\n\nLIMBI\n${d.languages||'[Limbi și niveluri]'}`;
}

function clearCVForm(){
  [...CV_FIELDS,'cvExpRole','cvExpOrg','cvExpPeriod','cvExpActions','cvExpResult'].forEach(id=>{const el=$(id);if(el)el.value='';});
  cvExperiences=[];renderExpList();
  setScore('cvScoreCircle','cvScore',0);
  $('cvAdvice').textContent=t('cv-score-hint');
  $('cvCriteria').innerHTML='<li>'+t('cv-criteria-placeholder')+'</li>';
  $('cvSuggestions').innerHTML='<li>'+t('feedback-placeholder')+'</li>';
  $('cvPreview').textContent=t('cv-output-default');
  try{localStorage.removeItem('mp_cv_draft');}catch(_){}
}

/* =============================================================
   TIPS, HINTS & QUESTIONS
   ============================================================= */
const speakingTips={
  en:['Start with a clear opening sentence — not an apology.',
      'Do not read every word. Use keywords and speak naturally.',
      'Pause after important ideas. Silence signals confidence.',
      'Look at different parts of the audience, not just one person.',
      'Keep your hands relaxed and use small gestures to support your ideas.',
      'End with one strong final sentence, then stop.',
      'Speak slightly slower than in normal conversation.',
      'If you forget a sentence, return to your main idea and continue calmly.'],
  ro:['Începe cu o propoziție clară, nu cu o scuză.',
      'Nu citi fiecare cuvânt. Folosește idei-cheie și vorbește natural.',
      'Fa pauză dupa ideile importante. Pauza arata incredere.',
      'Privește mai multe zone ale publicului, nu doar o singură persoană.',
      'Ține mâinile relaxate și folosește gesturi mici pentru a susține ideile.',
      'Încheie cu o propoziție finală puternică, apoi oprește-te.',
      'Vorbește puțin mai lent decât într-o conversație normală.',
      'Dacă uiți o propoziție, revino la ideea principală și continuă calm.']
};
const interviewTips={
  en:['Answer the question directly before adding details.',
      'Use one concrete example instead of speaking generally.',
      'Do not memorise a full script — memorise the structure.',
      'Mention what you personally did, not just what the team did.',
      'End with a result, lesson or reason why the experience matters.',
      'A good answer is usually under two minutes.',
      'If you need a moment, pause and organise your thought.',
      'Use a calm voice and avoid rushing through key points.'],
  ro:['Răspunde direct la întrebare înainte să adaugi detalii.',
      'Folosește un exemplu concret în loc să vorbești general.',
      'Nu memora un discurs întreg - memorează structura.',
      'Menționează ce ai făcut tu personal, nu doar ce a făcut echipa.',
      'Încheie cu un rezultat, o lecție sau motivul pentru care experiența contează.',
      'Un răspuns bun are, de obicei, sub două minute.',
      'Dacă ai nevoie de un moment, fă o pauză și organizează-ți ideea.',
      'Folosește o voce calmă și evită să te grăbești prin punctele importante.']
};
const speechHints={
  en:[
    {title:'Part 1: Introduction',text:'Open with a hook, introduce the topic, and state your main message. The audience should understand immediately what you will talk about.'},
    {title:'Part 2: Main idea',text:'Explain your central message in simple words. One clear message is stronger than five unclear ones.'},
    {title:'Part 3: Supporting points',text:'Give 2–3 reasons that support your main idea. Each point should be short, logical and easy to remember.'},
    {title:'Part 4: Example or proof',text:'Add one example, fact, personal story or result to make your speech more convincing and less abstract.'},
    {title:'Part 5: Conclusion',text:'Return to your main message and end with a confident final sentence. Do not end suddenly or with "that is all".'},
    {title:'Part 6: Delivery',text:'Practise voice, pauses, eye contact and posture. A good speech must be delivered clearly, not just written well.'}
  ],
  ro:[
    {title:'Partea 1: Introducerea',text:'Începe cu un cârlig, prezintă subiectul și spune mesajul principal. Publicul trebuie să înțeleagă imediat despre ce vei vorbi.'},
    {title:'Partea 2: Ideea principala',text:'Explică mesajul central în cuvinte simple. Un mesaj clar este mai puternic decât cinci mesaje neclare.'},
    {title:'Partea 3: Argumente de susținere',text:'Oferă 2-3 motive care susțin ideea principală. Fiecare punct trebuie să fie scurt, logic și ușor de reținut.'},
    {title:'Partea 4: Exemplu sau dovadă',text:'Adaugă un exemplu, o informație, o poveste personală sau un rezultat pentru ca discursul să fie mai convingător și mai puțin abstract.'},
    {title:'Partea 5: Concluzia',text:'Revino la mesajul principal și încheie cu o propoziție finală sigură. Nu termina brusc sau cu "asta a fost tot".'},
    {title:'Partea 6: Livrarea',text:'Exersează vocea, pauzele, contactul vizual și postura. Un discurs bun trebuie livrat clar, nu doar scris bine.'}
  ]
};
const interviewHints={
  en:[
    {title:'Part 1: Understand the question',text:'Identify what the interviewer is really asking: motivation, teamwork, problem-solving or self-awareness.'},
    {title:'Part 2: Give short context',text:'Start with one short sentence explaining the situation. Do not spend too much time on background.'},
    {title:'Part 3: Explain your action',text:'Say clearly what you personally did. Use action verbs: organised, led, solved, improved, researched, presented.'},
    {title:'Part 4: Add result or impact',text:'Mention what changed because of your action. Use a number, result, feedback or visible improvement if possible.'},
    {title:'Part 5: Add a lesson',text:'Finish with what you learned and how it makes you better prepared for the opportunity.'},
    {title:'Part 6: Delivery',text:'Speak calmly, keep eye contact and avoid sounding robotic. A natural answer is stronger than a memorised paragraph.'}
  ],
  ro:[
    {title:'Partea 1: Înțelege întrebarea',text:'Identifică ce întreabă de fapt intervievatorul: motivație, lucru în echipă, rezolvare de probleme sau autocunoaștere.'},
    {title:'Partea 2: Oferă context scurt',text:'Începe cu o propoziție scurtă care explică situația. Nu petrece prea mult timp pe fundal.'},
    {title:'Partea 3: Explică acțiunea ta',text:'Spune clar ce ai făcut tu personal. Folosește verbe de acțiune: organizat, coordonat, rezolvat, îmbunătățit, cercetat, prezentat.'},
    {title:'Partea 4: Adaugă rezultat sau impact',text:'Menționează ce s-a schimbat datorită acțiunii tale. Folosește un număr, un rezultat, feedback sau o îmbunătățire vizibilă, dacă poți.'},
    {title:'Partea 5: Adaugă o lecție',text:'Încheie cu ce ai învățat și cum te face asta mai pregătit pentru oportunitate.'},
    {title:'Partea 6: Livrarea',text:'Vorbește calm, menține contactul vizual și evită să pari robotic. Un răspuns natural este mai puternic decât un paragraf memorat.'}
  ]
};
const interviewQuestions={
  en:['Tell me about yourself.',
      'Why are you interested in this opportunity?',
      'Describe a time when you worked in a team.',
      'Tell me about a challenge you overcame.',
      'What is one strength that makes you a good candidate?',
      'Describe a mistake you made and what you learned.',
      'Tell me about a project or activity you are proud of.',
      'How do you handle feedback?'],
  ro:['Spune-mi câteva lucruri despre tine.',
      'De ce ești interesat de această oportunitate?',
      'Descrie o situație în care ai lucrat într-o echipă.',
      'Povestește despre o provocare pe care ai depășit-o.',
      'Care este un punct forte care te face un candidat bun?',
      'Descrie o greșeală pe care ai făcut-o și ce ai învățat.',
      'Povestește despre un proiect sau o activitate de care ești mândru.',
      'Cum gestionezi feedback-ul?']
};

/* hint state */
const hintState={};

function showRandomTip(arrayName,outputId){
  const arr=(arrayName==='speakingTips'?speakingTips:interviewTips)[currentLang]||
            (arrayName==='speakingTips'?speakingTips:interviewTips)['en'];
  const el=$(outputId);if(!el)return;
  el.textContent=arr[Math.floor(Math.random()*arr.length)];
}

function showNextHint(arrayName,outputId,btnId){
  const hints=(arrayName==='speechHints'?speechHints:interviewHints)[currentLang]||
              (arrayName==='speechHints'?speechHints:interviewHints)['en'];
  const el=$(outputId);const btn=$(btnId);if(!el)return;
  if(!(outputId in hintState))hintState[outputId]=0;
  const idx=hintState[outputId];
  if(idx>=hints.length)return;
  if(!el.querySelector('.hint-block'))el.innerHTML='';
  const block=document.createElement('div');
  block.className='hint-block';
  block.innerHTML=`<strong>${hints[idx].title}</strong><span>${hints[idx].text}</span>`;
  el.appendChild(block);
  hintState[outputId]=idx+1;
  if(hintState[outputId]>=hints.length&&btn){btn.disabled=true;btn.textContent=currentLang==='ro'?'Toate indiciile afișate':'All hints shown';}
}

function resetHints(outputId,btnId){
  hintState[outputId]=0;
  const el=$(outputId);const btn=$(btnId);
  if(el){el.innerHTML='';el.textContent=t(outputId==='speechHintOutput'?'speech-hint-default':'interview-hint-default');}
  if(btn){btn.disabled=false;btn.textContent=t('btn-hint');}
}

function showRandomQuestion(){
  const arr=interviewQuestions[currentLang]||interviewQuestions.en;
  $('interviewPracticeQuestion').textContent=arr[Math.floor(Math.random()*arr.length)];
}

/* =============================================================
   TIMER
   ============================================================= */
const TIMER_SECONDS=300;
let timerSecs=TIMER_SECONDS;
let timerInterval=null;

function updateTimerDisplay(){
  const m=String(Math.floor(timerSecs/60)).padStart(2,'0');
  const s=String(timerSecs%60).padStart(2,'0');
  $('timer').textContent=`${m}:${s}`;
}

function updateTimerBtns(){
  const running=timerInterval!==null;
  const atStart=timerSecs===TIMER_SECONDS;
  $('startTimerBtn').disabled=running||!atStart;
  $('pauseResumeBtn').disabled=atStart;
  $('pauseResumeBtn').textContent=running?t('btn-pause'):t('btn-resume');
  $('resetTimerBtn').disabled=atStart;
}

function tick(){
  if(timerSecs>0){timerSecs--;updateTimerDisplay();updateTimerBtns();}
  else{
    clearInterval(timerInterval);timerInterval=null;updateTimerBtns();
    alert(t('timer-up'));
  }
}
function startTimer(){if(timerInterval||timerSecs!==TIMER_SECONDS)return;timerInterval=setInterval(tick,1000);updateTimerBtns();}
function togglePause(){
  if(timerSecs===TIMER_SECONDS)return;
  if(timerInterval){clearInterval(timerInterval);timerInterval=null;}
  else if(timerSecs>0){timerInterval=setInterval(tick,1000);}
  updateTimerBtns();
}
function resetTimer(){clearInterval(timerInterval);timerInterval=null;timerSecs=TIMER_SECONDS;updateTimerDisplay();updateTimerBtns();}

/* =============================================================
   INIT
   ============================================================= */
window.addEventListener('load',()=>{
  updateTimerDisplay();
  updateTimerBtns();
  setupAutosave();
  applyI18n();
  $('currentYear').textContent=new Date().getFullYear();
});