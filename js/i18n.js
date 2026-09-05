/* ═══════════════════════════════════════════════
   MULTILINGUAL i18n ENGINE
   Languages: English (en), Hindi (hi), Tamil (ta), Telugu (te)
═══════════════════════════════════════════════ */

const TRANSLATIONS = {
  en: {
    nav_features: 'Features', nav_roles: 'Roles', nav_about: 'About',
    nav_contact: 'Contact', nav_live: 'Live Platform', nav_getstarted: 'Get Started →',
    badge: 'CareLink — Remote Family Healthcare',
    hero_h1: 'Connect Your Parents<br>to World-Class Care',
    hero_sub: 'Book hospital appointments, arrange verified pickup & drop, consult top doctors online, and deliver medicines — all managed from your phone, even from 1000 km away.',
    btn_role: 'Choose Your Role', btn_how: 'How It Works',
    stat_families: 'Families Served', stat_hospitals: 'Partner Hospitals',
    stat_drivers: 'Verified Drivers', stat_pharmacies: 'Partner Pharmacies', stat_rating: 'Average Rating',
    role_eyebrow: 'Choose Your Role', role_title: 'Who are you?',
    role_sub: 'Select your role to access your personalized dashboard with everything you need.',
    enter_dashboard: 'Enter Dashboard →',
    footer_copy: '© 2026 CareLink Healthcare Platform · All rights reserved',
  },
  hi: {
    nav_features: 'विशेषताएं', nav_roles: 'भूमिकाएं', nav_about: 'हमारे बारे में',
    nav_contact: 'संपर्क करें', nav_live: 'लाइव प्लेटफॉर्म', nav_getstarted: 'शुरू करें →',
    badge: 'केयरलिंक — दूरस्थ पारिवारिक स्वास्थ्य सेवा',
    hero_h1: 'अपने माता-पिता को<br>विश्वस्तरीय देखभाल से जोड़ें',
    hero_sub: 'अस्पताल की अपॉइंटमेंट बुक करें, पिकअप और ड्रॉप की व्यवस्था करें, ऑनलाइन डॉक्टर से परामर्श लें और दवाइयां घर पहुंचाएं।',
    btn_role: 'अपनी भूमिका चुनें', btn_how: 'यह कैसे काम करता है',
    stat_families: 'परिवार सेवित', stat_hospitals: 'साझेदार अस्पताल',
    enter_dashboard: 'डैशबोर्ड खोलें →',
    footer_copy: '© 2026 CareLink स्वास्थ्य प्लेटफॉर्म · सर्वाधिकार सुरक्षित',
  },
  ta: {
    nav_features: 'அம்சங்கள்', nav_roles: 'பாத்திரங்கள்', nav_about: 'எங்களைப் பற்றி',
    nav_contact: 'தொடர்பு கொள்ளுங்கள்', nav_live: 'நேரடி தளம்', nav_getstarted: 'தொடங்குங்கள் →',
    badge: 'கேர்லிங்க் — தொலைதூர குடும்ப சுகாதாரம்',
    hero_h1: 'உங்கள் பெற்றோரை<br>சிறந்த சேவையுடன் இணைக்கவும்',
    hero_sub: 'மருத்துவமனை சந்திப்புகளை பதிவு செய்யுங்கள், பிக்அப் மற்றும் டிராப் ஏற்பாடு செய்யுங்கள்.',
    enter_dashboard: 'டாஷ்போர்டு திறக்கவும் →',
    footer_copy: '© 2026 CareLink சுகாதார தளம் · அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை',
  },
  te: {
    nav_features: 'లక్షణాలు', nav_roles: 'పాత్రలు', nav_about: 'మా గురించి',
    nav_contact: 'సంప్రదించండి', nav_live: 'లైవ్ ప్లాట్‌ఫాం', nav_getstarted: 'ప్రారంభించండి →',
    badge: 'కేర్‌లింక్ — రిమోట్ ఫ్యామిలీ హెల్త్‌కేర్',
    hero_h1: 'మీ తల్లిదండ్రులను<br>ప్రపంచ స్థాయి సేవతో అనుసంధానించండి',
    hero_sub: 'ఆసుపత్రి అపాయింట్‌మెంట్లు బుక్ చేయండి, పిక్అప్ & డ్రాప్ ఏర్పాటు చేయండి.',
    enter_dashboard: 'డాష్‌బోర్డ్ తెరవండి →',
    footer_copy: '© 2026 CareLink హెల్త్‌కేర్ ప్లాట్‌ఫాం · అన్ని హక్కులు రక్షించబడ్డాయి',
  }
};

let currentLang = 'en';

const LANG_META = {
  en: { flag: '🇬🇧', label: 'EN', bodyClass: '' },
  hi: { flag: '🇮🇳', label: 'HI', bodyClass: 'lang-hi' },
  ta: { flag: '🏴', label: 'TA', bodyClass: 'lang-ta' },
  te: { flag: '🏴', label: 'TE', bodyClass: 'lang-te' },
};

function toggleLangDropdown(e) {
  if (e) e.stopPropagation();
  const el = document.getElementById('langSwitcher');
  if (el) el.classList.toggle('open');
}

document.addEventListener('click', function() {
  const el = document.getElementById('langSwitcher');
  if (el) el.classList.remove('open');
});

function setLang(lang) {
  if (!TRANSLATIONS[lang]) return;
  currentLang = lang;
  const t = TRANSLATIONS[lang];
  const meta = LANG_META[lang];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.innerHTML = t[key];
  });

  const flagEl = document.getElementById('currentLangFlag');
  const labelEl = document.getElementById('currentLangLabel');
  if (flagEl) flagEl.textContent = meta.flag;
  if (labelEl) labelEl.textContent = meta.label;

  const langSwitcher = document.getElementById('langSwitcher');
  if (langSwitcher) langSwitcher.classList.remove('open');
}
