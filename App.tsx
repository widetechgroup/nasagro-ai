
import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, Menu, X, Mic, Send, Camera, LogOut, ChevronRight, 
  Thermometer, CloudRain, Wind, Sprout, TrendingUp, CloudSun, 
  Share2, Info, BookOpen, UserCheck, ShieldCheck, Heart, Target, 
  CheckCircle2, Users, LayoutDashboard, Settings, Mail, Lock,
  Droplets, MessageSquare, Bug, Globe, Phone, Clock, MessageCircle
} from 'lucide-react';
import { NAV_ITEMS, TRANSLATIONS } from './constants';
import { Language, Theme, Crop, MarketPrice, UserProfile, AppState, Article, ForumPost } from './types';
import { getAgriAdviceWithReasoning, analyzePestImage, getCropResearch } from './services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Branding Component: Ant + Nasafari Text
const NasafariLogo = ({ className = "h-8" }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="relative">
      <Sprout className="text-[#2E7D32]" size={32} />
      <div className="absolute -top-1 -right-1 bg-[#FBC02D] rounded-full p-0.5">
        <Bug size={12} className="text-[#2E7D32]" />
      </div>
    </div>
    <div className="flex flex-col leading-none">
      <span className="text-xl font-black text-[#2E7D32] tracking-tighter">NASAFARI</span>
      <span className="text-[10px] font-bold text-[#2E7D32]/70 uppercase tracking-widest">Foundation</span>
    </div>
  </div>
);

export default function App() {
  const [lang, setLang] = useState<Language>('sw');
  const [theme, setTheme] = useState<Theme>('light');
  const [currentScreen, setCurrentScreen] = useState<AppState>('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setCurrentScreen('app');
    }
  }, []);

  const handleLogin = (u: UserProfile) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
    setCurrentScreen('app');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCurrentScreen('landing');
  };

  if (currentScreen === 'landing') return <LandingPage setLang={setLang} lang={lang} onStart={() => setCurrentScreen('auth')} t={t} />;
  if (currentScreen === 'auth') return <AuthScreen onLogin={handleLogin} onBack={() => setCurrentScreen('landing')} lang={lang} t={t} />;

  const currentThemeClasses = theme === 'dark' ? 'bg-darkBg text-white' : 'bg-softWhite text-gray-900';

  return (
    <div className={`min-h-screen flex ${currentThemeClasses} transition-all`}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static transition-transform duration-300 ease-in-out bg-primary text-white border-r border-green-700 shadow-2xl`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <NasafariLogo className="text-white invert brightness-0" />
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X /></button>
          </div>
          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.filter(item => !item.adminOnly || (user?.role === 'admin')).map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-white/10 text-accent font-bold shadow-sm' : 'hover:bg-green-700'}`}
              >
                {item.icon}
                <span>{lang === 'sw' ? item.labelSw : item.labelEn}</span>
              </button>
            ))}
          </nav>
          <div className="pt-6 border-t border-green-700">
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-red-300 hover:text-red-100"><LogOut size={20} /> <span>Logout</span></button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className={`h-16 flex items-center justify-between px-6 border-b transition-colors ${theme === 'dark' ? 'border-gray-800 bg-darkBg/80' : 'bg-white border-gray-200'} backdrop-blur-md sticky top-0 z-40`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg"><Menu /></button>
            <NasafariLogo className="hidden sm:flex" />
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setLang(lang === 'sw' ? 'en' : 'sw')} className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary">{lang === 'sw' ? 'English' : 'Kiswahili'}</button>
             <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2">{theme === 'light' ? '🌙' : '☀️'}</button>
             <div className="flex items-center gap-2 border-l pl-4">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-primary">{user?.name[0]}</div>
                <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === 'dashboard' && <Dashboard lang={lang} t={t} theme={theme} />}
          {activeTab === 'myfarm' && <MyFarm lang={lang} t={t} theme={theme} />}
          {activeTab === 'weather' && <WeatherModule lang={lang} t={t} theme={theme} />}
          {activeTab === 'pest' && <PestScanner lang={lang} t={t} theme={theme} />}
          {activeTab === 'market' && <MarketIntel lang={lang} t={t} theme={theme} />}
          {activeTab === 'chat' && <AIChat lang={lang} t={t} theme={theme} />}
          {activeTab === 'community' && <CommunityHub lang={lang} t={t} theme={theme} />}
          {activeTab === 'admin' && <AdminPanel lang={lang} t={t} theme={theme} />}
          {activeTab === 'settings' && <SettingsScreen lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} t={t} />}
        </div>
      </main>
    </div>
  );
}

// --- Specific Modular Components ---

function LandingPage({ onStart, lang, setLang, t }: any) {
  return (
    <div className="min-h-screen bg-softWhite flex flex-col font-sans overflow-x-hidden">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <NasafariLogo />
        <div className="flex items-center gap-4">
          <button onClick={() => setLang(lang === 'sw' ? 'en' : 'sw')} className="text-sm font-bold text-gray-500 uppercase tracking-widest">{lang === 'sw' ? 'English' : 'Kiswahili'}</button>
          <button onClick={onStart} className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition-all">Anza Sasa</button>
        </div>
      </nav>

      <div className="relative flex-1 flex flex-col items-center justify-center p-6 text-center max-w-5xl mx-auto py-24">
        {/* Real Agro Image Background simulation */}
        <div className="absolute inset-0 -z-10 opacity-10">
          <img src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="Garden" />
        </div>
        
        <div className="mb-8 p-3 bg-green-100 text-primary rounded-full px-6 text-sm font-bold animate-pulse">#1 Agri-Tech Innovation by Nasafari 🌍</div>
        <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-gray-900">
          Kilimo Bora Kinaanza <span className="text-primary">Hapa</span>
        </h2>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl">
          Huduma ya kwanza ya AI Tanzania inayolenga kumwinua mkulima mdogo kupitia utafiti, soko na kinga ya mazao.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
           <button onClick={onStart} className="bg-primary text-white px-10 py-4 rounded-full text-lg font-bold shadow-2xl hover:bg-green-700 transition-all">Anza Bure</button>
           <button className="bg-white border-2 border-gray-100 text-gray-600 px-10 py-4 rounded-full text-lg font-bold hover:bg-gray-50 transition-all">Soma Ripoti za Soko</button>
        </div>
      </div>

      <section className="bg-white py-24 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <Feature icon={<Target className="text-primary" />} title={t.vision} desc="Kuwa kitovu kikuu cha maarifa ya kilimo kidijitali barani Afrika ifikapo 2030." />
          <Feature icon={<Heart className="text-red-500" />} title={t.mission} desc="Kuongeza tija kwa mkulima kwa kutoa utambuzi wa wadudu na bei za soko kwa wakati halisi." />
          <Feature icon={<CheckCircle2 className="text-accent" />} title={t.objectives} desc="Kutoa elimu kwa wakulima zaidi ya elfu 50 kwa mwaka na kupunguza hasara za mavuno." />
        </div>
      </section>

      {/* Agro Experts Panel Section */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase mb-4 tracking-widest">
            <Clock size={14} /> Available: 08:00 - 17:00 EAT
          </div>
          <h3 className="text-4xl font-black mb-4">{t.experts}</h3>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">Wataalamu wa Nasafari Foundation wapo tayari kukusaidia kwa ushauri wa kitaalamu na uzoefu wa miaka mingi.</p>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
           <ExpertCard name="Dr. Anna Mushi" role="Mtaalamu wa Magonjwa" img="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300" />
           <ExpertCard name="Eng. Salim Juma" role="Mtaalamu wa Umwagiliaji" img="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300" />
           <ExpertCard name="Mama Faraja" role="Mtaalamu wa Masoko" img="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300" />
        </div>
      </section>

      <footer className="p-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 border-b border-white/10 pb-12">
           <div>
             <NasafariLogo className="text-white invert brightness-0 mb-6" />
             <p className="text-white/60 leading-relaxed">Nasafari Foundation imejitolea kuboresha maisha ya wakulima kupitia ubunifu wa kiteknolojia na ushirikiano.</p>
           </div>
           <div>
             <h5 className="font-bold text-lg mb-6">Mawasiliano</h5>
             <ul className="space-y-4 text-white/60">
                <li className="flex items-center gap-3"><Globe size={18} /> {t.website}</li>
                <li className="flex items-center gap-3"><Mail size={18} /> {t.email}</li>
                <li className="flex items-center gap-3"><Phone size={18} /> {t.phone}</li>
             </ul>
           </div>
           <div>
             <h5 className="font-bold text-lg mb-6">Ofisi Yetu</h5>
             <p className="text-white/60">{t.office}</p>
           </div>
        </div>
        <div className="text-center text-white/40 text-sm">
          {t.copyright}
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }: any) {
  return (
    <div className="flex flex-col items-center p-8 rounded-[2.5rem] bg-gray-50/50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100">
      <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-6 text-3xl shadow-sm">{icon}</div>
      <h4 className="text-xl font-black mb-2">{title}</h4>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function ExpertCard({ name, role, img }: any) {
  return (
    <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col items-center group hover:shadow-2xl transition-all relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <span className="w-3 h-3 bg-green-500 rounded-full inline-block animate-pulse"></span>
      </div>
      <img src={img} className="w-24 h-24 rounded-full mb-6 border-4 border-green-50 object-cover group-hover:scale-110 transition-transform" />
      <h5 className="font-black text-xl mb-1">{name}</h5>
      <p className="text-xs text-primary font-bold uppercase tracking-widest mb-6 px-4 py-1 bg-primary/5 rounded-full">{role}</p>
      <button className="w-full py-3 bg-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-primary hover:text-white transition-all">Chat Now</button>
    </div>
  );
}

function AuthScreen({ onLogin, onBack, t }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = () => {
    const role = email.includes('admin') ? 'admin' : 'user';
    onLogin({
      name: email.split('@')[0] || 'Guest Farmer',
      email: email,
      role: role,
      region: 'Mbeya',
      experience: 'Intermediate',
      isAuthenticated: true,
      subscription: 'Free'
    });
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md p-10 rounded-[3.5rem] shadow-2xl animate-slideUp">
        <div className="flex justify-center mb-8">
           <NasafariLogo />
        </div>
        <button onClick={onBack} className="text-gray-400 mb-8 flex items-center gap-2 hover:text-primary transition-all text-sm font-bold"><ChevronRight className="rotate-180" size={16} /> Back to Landing</button>
        <h2 className="text-4xl font-black mb-2">{isLogin ? t.login : t.signup}</h2>
        <p className="text-gray-400 mb-8 text-sm">Karibu katika kilimo chenye tija na teknolojia.</p>
        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Barua Pepe" className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-gray-50 focus:border-primary transition-all outline-none" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Nenosiri" className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-gray-50 focus:border-primary transition-all outline-none" />
          </div>
          <button onClick={submit} className="w-full bg-primary text-white py-5 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all mt-4">
            {isLogin ? t.login : t.signup}
          </button>
          <p className="text-center text-sm text-gray-500 mt-8">
            {isLogin ? "Huna akaunti ya Nasafari?" : "Tayari unayo akaunti?"} 
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-bold ml-1 hover:underline">{isLogin ? "Jisajili Hapa" : "Ingia Sasa"}</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Dashboard Module ---
function Dashboard({ t, theme }: any) {
  const chartData = [
    { name: 'Okt', revenue: 4200, yields: 3100 },
    { name: 'Nov', revenue: 3800, yields: 2900 },
    { name: 'Des', revenue: 5100, yields: 4500 },
    { name: 'Jan', revenue: 4800, yields: 4200 },
    { name: 'Feb', revenue: 6200, yields: 5800 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Uzalishaji" value="92%" subtitle="Juu ya wastani" color="bg-[#2E7D32]" icon={<Sprout />} />
        <StatCard title="Unyevu Udongo" value="45%" subtitle="Hali ya wastani" color="bg-[#1E88E5]" icon={<Droplets />} />
        <StatCard title="Mapato Halisi" value="3.1M" subtitle="Tsh mwezi huu" color="bg-[#F57C00]" icon={<TrendingUp />} />
        <StatCard title="Vimelea" value="Nunge" subtitle="Usalama upo" color="bg-[#D32F2F]" icon={<Bug />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`lg:col-span-2 p-10 rounded-[3rem] border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} shadow-sm`}>
          <h3 className="text-2xl font-black mb-8">Takwimu za Shamba 2026</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#333' : '#eee'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#2E7D32" fillOpacity={1} fill="url(#colorPrimary)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className={`p-10 rounded-[3rem] border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
          <h3 className="text-xl font-bold mb-6">Picha za Shamba</h3>
          <div className="space-y-4">
             <img src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=400" className="w-full h-32 object-cover rounded-2xl" alt="Corn" />
             <img src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=400" className="w-full h-32 object-cover rounded-2xl" alt="Farmer" />
             <div className="p-4 bg-primary/5 rounded-2xl text-center">
                <p className="text-xs font-bold text-primary">Sasisha Picha ya Leo</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Pest Scanner Module ---
function PestScanner({ lang, t, theme }: any) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = async (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        analyze((reader.result as string).split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyze = async (base64: string) => {
    setLoading(true);
    const res = await analyzePestImage(base64, lang);
    setResult(res);
    setLoading(false);
  };

  const shareResult = () => {
    const text = `Utambuzi wa Nasafari Mkulima:\nZao: ${result.diagnosis}\nMatibabu: ${result.treatment}\nConfidence: ${result.confidence}%`;
    if (navigator.share) {
      navigator.share({
        title: 'Nasafari Mkulima Result',
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(text);
      alert("Text copied to clipboard for sharing.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      <div className={`p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] border-2 border-dashed flex flex-col items-center justify-center min-h-[400px] transition-all bg-white shadow-2xl ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'border-gray-200'}`}>
        {!image ? (
          <label className="cursor-pointer flex flex-col items-center group text-center">
            <input type="file" capture="environment" className="hidden" onChange={handleFileChange} />
            <div className="w-24 h-24 md:w-28 md:h-28 bg-primary/10 text-primary rounded-[2.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform"><Camera size={48} /></div>
            <h3 className="text-2xl md:text-3xl font-black mb-3">Changanua Mmea Wako</h3>
            <p className="text-gray-400 max-w-sm text-sm md:text-base">Piga picha sehemu iliyoathirika ya mmea wako kupata utambuzi na matibabu ya AI papo hapo.</p>
          </label>
        ) : (
          <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            <div className="w-full lg:w-1/2 relative">
               <img src={image} className="w-full h-72 md:h-96 object-cover rounded-[2rem] md:rounded-[3rem] shadow-2xl" />
               <button onClick={() => {setImage(null); setResult(null);}} className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur rounded-full text-red-500 shadow-lg"><X /></button>
            </div>
            <div className="flex-1 w-full space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                   <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                   <p className="font-bold text-gray-400 italic">AI ya Nasafari inatafiti picha yako...</p>
                </div>
              ) : result && (
                <div className="animate-slideUp space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-1">{t.diagnosis}</h4>
                      <h3 className="text-2xl md:text-3xl font-black text-gray-900">{result.diagnosis}</h3>
                    </div>
                    <button onClick={shareResult} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-2xl font-bold shadow-lg hover:scale-105 transition-all w-full sm:w-auto justify-center">
                       <Share2 size={18} /> {t.share}
                    </button>
                  </div>
                  
                  <div className="p-6 md:p-8 bg-primary/5 rounded-[2rem] md:rounded-[2.5rem] border border-primary/10">
                     <h4 className="font-black text-primary mb-3 text-lg">{t.treatment}</h4>
                     <p className="text-gray-700 leading-relaxed text-sm md:text-base">{result.treatment}</p>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                     <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                       <div className="h-full bg-primary transition-all duration-1000" style={{width: `${result.confidence}%`}}></div>
                     </div>
                     <span className="text-xs font-black text-primary whitespace-nowrap">{result.confidence}% {t.confidence}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- AI Chat Module ---
function AIChat({ lang, theme, t }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeReasoning, setActiveReasoning] = useState<number | null>(null);

  const send = async () => {
    if (!input.trim()) return;
    const txt = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: txt }]);
    setLoading(true);

    const res = await getAgriAdviceWithReasoning(txt, lang);
    setMessages(prev => [...prev, { role: 'ai', text: res.advice, reasoning: res.reasoning, confidence: res.confidence }]);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-14rem)] flex flex-col gap-6">
       <div className={`flex-1 overflow-y-auto p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-xl'} space-y-8`}>
         {messages.length === 0 && (
           <div className="flex flex-col items-center justify-center h-full text-center text-gray-300">
             <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6"><MessageSquare size={48} className="opacity-20" /></div>
             <h4 className="text-xl font-bold mb-2">Msaidizi wa Nasafari</h4>
             <p className="max-w-xs mx-auto text-sm">Uliza chochote kuhusu kitalu, shamba, soko, au magonjwa ya mazao.</p>
           </div>
         )}
         {messages.map((m, i) => (
           <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-5 rounded-[1.5rem] max-w-[85%] shadow-sm ${m.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-100 dark:bg-gray-800 rounded-tl-none'}`}>
                 <p className="text-sm leading-relaxed font-medium">{m.text}</p>
                 {m.role === 'ai' && (
                   <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                     <button onClick={() => setActiveReasoning(activeReasoning === i ? null : i)} className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:opacity-70">
                       <Info size={14} /> {t.why_advice}
                     </button>
                     {activeReasoning === i && (
                       <div className="mt-4 bg-white/70 dark:bg-black/20 p-4 rounded-2xl text-xs text-gray-600 italic animate-fadeIn border border-primary/10">
                          <p className="mb-2">{m.reasoning}</p>
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                             <span className="font-black text-primary uppercase">Confidence: {m.confidence}%</span>
                          </div>
                       </div>
                     )}
                   </div>
                 )}
              </div>
           </div>
         ))}
         {loading && <div className="flex justify-start"><div className="p-4 bg-gray-50 rounded-2xl animate-pulse font-bold text-gray-400 text-sm">AI inatayarisha jibu...</div></div>}
       </div>
       <div className="flex gap-2 sm:gap-4">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Swali lako..." className="flex-1 px-6 py-4 rounded-[2rem] border-2 border-transparent focus:border-primary bg-white shadow-xl outline-none transition-all text-sm md:text-base" />
          <button onClick={send} className="p-4 md:p-5 bg-primary text-white rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all"><Send size={24} /></button>
       </div>
    </div>
  );
}

// --- My Farm Module ---
function MyFarm({ lang, theme, t }: any) {
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [research, setResearch] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchResearch = async (name: string) => {
    setLoading(true);
    const res = await getCropResearch(name, lang);
    setResearch(res);
    setLoading(false);
  };

  const cropSamples = [
    { name: 'Mahindi', img: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=400' },
    { name: 'Mpunga', img: 'https://images.unsplash.com/photo-1536633310180-2dc2bc41f2a3?auto=format&fit=crop&q=80&w=400' },
    { name: 'Nyanya', img: 'https://images.unsplash.com/photo-1590666014460-70f03264b36d?auto=format&fit=crop&q=80&w=400' }
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black">{t.my_farm}</h2>
          <p className="text-gray-400 text-sm">Dhibiti na ufanyie utafiti mazao yako kwa msaada wa AI.</p>
        </div>
        <button className="bg-primary text-white px-8 py-3 rounded-full font-black shadow-xl hover:scale-105 transition-all w-full sm:w-auto">+ Add New Crop</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {cropSamples.map(c => (
          <div key={c.name} onClick={() => {setSelectedCrop(c.name); fetchResearch(c.name);}} className="group cursor-pointer">
            <div className="relative h-56 md:h-64 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden mb-6 shadow-xl">
               <img src={c.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={c.name} />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 md:p-8">
                  <h4 className="text-2xl md:text-3xl font-black text-white">{c.name}</h4>
               </div>
               <div className="absolute top-4 right-4 bg-accent p-2 md:p-3 rounded-2xl text-primary shadow-lg"><Info size={24} /></div>
            </div>
          </div>
        ))}
      </div>

      {selectedCrop && (
        <div className={`p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] border animate-slideUp bg-white shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'border-gray-100'}`}>
           <div className="flex justify-between items-center mb-8 md:mb-12">
             <h3 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight">{t.crop_research}: <span className="text-primary">{selectedCrop}</span></h3>
             <button onClick={() => setSelectedCrop(null)} className="p-2 md:p-3 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X size={24} /></button>
           </div>
           {loading ? (
             <div className="animate-pulse space-y-8">
               <div className="h-24 md:h-32 bg-gray-50 rounded-[2rem]"></div>
               <div className="h-24 md:h-32 bg-gray-50 rounded-[2rem]"></div>
             </div>
           ) : research && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <ResearchItem label="Climate Conditions" value={research.climate} icon={<CloudSun />} />
                <ResearchItem label="Soil Requirements" value={research.soil} icon={<Sprout />} />
                <ResearchItem label="Common Pests" value={research.pests} icon={<Bug />} />
                <ResearchItem label="Expected Yield" value={research.yield} icon={<TrendingUp />} />
             </div>
           )}
        </div>
      )}
    </div>
  );
}

function ResearchItem({ label, value, icon }: any) {
  return (
    <div className="flex gap-4 md:gap-6 p-6 md:p-8 bg-gray-50/80 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100/50 hover:bg-white hover:shadow-xl transition-all">
       <div className="p-3 md:p-5 bg-white shadow-sm rounded-2xl md:rounded-3xl h-fit text-primary">{icon}</div>
       <div>
         <h5 className="font-black text-[10px] text-primary/40 uppercase tracking-widest mb-1 md:mb-2">{label}</h5>
         <p className="text-gray-800 leading-relaxed font-medium text-sm md:text-base">{value}</p>
       </div>
    </div>
  );
}

// --- Community Hub ---
function CommunityHub({ theme, t }: any) {
  const [view, setView] = useState<'articles' | 'forum' | 'chat'>('articles');
  const [chatMessages, setChatMessages] = useState<{user: string, text: string, time: string}[]>([
    { user: 'Hassan', text: 'Nimepata mavuno mazuri ya nyanya msimu huu!', time: '10:00' },
    { user: 'Anna', text: 'Hongera Hassan, ulitumia mbolea gani?', time: '10:05' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const sendChatMessage = () => {
    if(!chatInput.trim()) return;
    setChatMessages([...chatMessages, { user: 'Mimi', text: chatInput, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setChatInput('');
  };
  
  const articles: Article[] = [
    { id: '1', title: 'Kilimo cha Umwagiliaji: Mbinu za 2026', category: 'Teknolojia', excerpt: 'Jinsi ya kutumia vitambuzi vya unyevu kuokoa 40% ya maji yako na kuongeza tija...', content: '', author: 'Dr. Mushi', date: 'Okt 2024' },
    { id: '2', title: 'Soko la Nyanya: Kuelekea Mavuno Makubwa', category: 'Soko', excerpt: 'Uchambuzi wa mahitaji ya nyanya katika masoko ya mikoani kote Tanzania...', content: '', author: 'Mama Faraja', date: 'Nov 2024' },
    { id: '3', title: 'Mbolea ya Asili: Siri ya Mabingwa', category: 'Mbinu', excerpt: 'Mbinu mpya za kutengeneza mbolea bora nyumbani kwa gharama sifuri kabisa...', content: '', author: 'Juma K.', date: 'Des 2024' },
    // Fix: Add missing 'content' property to the 4th article object
    { id: '4', title: 'Mpunga wa Kisasa Iringa', category: 'Crop Specific', excerpt: 'Utafiti mpya wa mbegu za mpunga zinazovumilia hali ya hewa ya baridi...', content: '', author: 'Eng. Salim', date: 'Jan 2025' }
  ];

  return (
    <div className="space-y-8 md:space-y-10 animate-fadeIn">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <h2 className="text-3xl md:text-4xl font-black">{t.community}</h2>
        <div className="bg-gray-100 p-1.5 md:p-2 rounded-[1.5rem] md:rounded-[2rem] flex flex-wrap gap-1 md:gap-2 w-full xl:w-auto">
          <button onClick={() => setView('articles')} className={`flex-1 xl:flex-none px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-xs md:text-sm transition-all ${view === 'articles' ? 'bg-white shadow-lg text-primary' : 'text-gray-400'}`}>Articles</button>
          <button onClick={() => setView('forum')} className={`flex-1 xl:flex-none px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-xs md:text-sm transition-all ${view === 'forum' ? 'bg-white shadow-lg text-primary' : 'text-gray-400'}`}>Forums</button>
          <button onClick={() => setView('chat')} className={`flex-1 xl:flex-none px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-xs md:text-sm transition-all ${view === 'chat' ? 'bg-white shadow-lg text-primary' : 'text-gray-400'}`}>Peer Chat</button>
        </div>
      </div>

      {view === 'articles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
           {articles.map(art => (
             <div key={art.id} className="group bg-white rounded-[2.5rem] md:rounded-[3.5rem] border border-gray-100 p-8 md:p-10 shadow-sm hover:shadow-2xl transition-all flex flex-col">
                <div className="mb-6 overflow-hidden rounded-[2rem] h-40 md:h-48">
                   <img src={`https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=400&sig=${art.id}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Agro" />
                </div>
                <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full w-fit mb-4 md:mb-6">{art.category}</span>
                <h4 className="text-xl md:text-2xl font-black mb-4 flex-1 group-hover:text-primary transition-colors leading-tight">{art.title}</h4>
                <p className="text-gray-400 text-sm mb-6 md:mb-8 leading-relaxed line-clamp-3">{art.excerpt}</p>
                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs uppercase">{art.author[0]}</div>
                      <span className="text-xs font-bold text-gray-700">{art.author}</span>
                   </div>
                   <button className="text-primary font-black text-xs md:text-sm flex items-center gap-1 group/btn">Read More <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" /></button>
                </div>
             </div>
           ))}
        </div>
      )}

      {view === 'forum' && (
        <div className="max-w-4xl mx-auto space-y-6">
           <div className="bg-primary text-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-black">Nasafari Farmer Forum</h3>
                <p className="text-white/70 text-sm">Wasiliana na wakulima wengine kote Tanzania.</p>
              </div>
              <button className="bg-white text-primary px-8 py-3 rounded-full font-black shadow-lg text-sm w-full sm:w-auto">New Post</button>
           </div>
           {[1,2,3].map(i => (
             <div key={i} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm flex gap-4 md:gap-6 hover:shadow-xl transition-all">
                <div className="hidden sm:flex w-14 h-14 md:w-16 md:h-16 bg-gray-50 rounded-full items-center justify-center font-black text-gray-300">U{i}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-base md:text-lg">Mkulima_{i*42}</span>
                    <span className="text-[10px] md:text-xs font-bold text-gray-300">{i}h ago</span>
                  </div>
                  <p className="text-gray-600 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">Nimeona mabadiliko ya bei ya nyanya leo Tandale, imefika Tsh 28,000 kwa tenga moja. Masoko ya Iringa vipi?</p>
                  <div className="flex flex-wrap gap-4 text-[10px] md:text-xs font-black text-primary uppercase tracking-widest">
                     <button className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl">Reply (12)</button>
                     <button className="flex items-center gap-2 hover:bg-gray-50 px-4 py-2 rounded-xl">Like</button>
                  </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {view === 'chat' && (
        <div className="max-w-3xl mx-auto h-[500px] flex flex-col bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden">
           <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-primary flex items-center gap-2"><MessageCircle /> Live Peer Chat</h3>
              <span className="text-xs text-green-500 font-bold flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> 42 Online</span>
           </div>
           <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((m, idx) => (
                <div key={idx} className={`flex flex-col ${m.user === 'Mimi' ? 'items-end' : 'items-start'}`}>
                   <span className="text-[10px] font-black text-gray-400 mb-1 px-2">{m.user} • {m.time}</span>
                   <div className={`p-4 rounded-2xl max-w-[80%] text-sm ${m.user === 'Mimi' ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-100 text-gray-700 rounded-tl-none'}`}>
                      {m.text}
                   </div>
                </div>
              ))}
           </div>
           <div className="p-4 border-t border-gray-100 flex gap-2">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChatMessage()} placeholder="Zungumza na wakulima..." className="flex-1 px-6 py-3 rounded-full bg-gray-50 outline-none text-sm" />
              <button onClick={sendChatMessage} className="p-3 bg-primary text-white rounded-full"><Send size={18} /></button>
           </div>
        </div>
      )}
    </div>
  );
}

// --- Admin Panel Module ---
function AdminPanel({ theme }: any) {
  const stats = [
    { label: 'Total Users', value: '12,840', icon: <Users /> },
    { label: 'Active Sessions', value: '3,122', icon: <Clock /> },
    { label: 'Pest Scans', value: '45.2K', icon: <Bug /> },
    { label: 'Impact Est.', value: '84M+', icon: <TrendingUp /> }
  ];

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h2 className="text-3xl md:text-4xl font-black text-gray-900">Usimamizi wa Mfumo</h2>
        <div className="flex gap-2 w-full md:w-auto">
           <button className="flex-1 md:flex-none px-6 py-2 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Refresh</button>
           <button className="flex-1 md:flex-none px-6 py-2 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest">Reports</button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
         {stats.map(s => (
           <div key={s.label} className="p-6 md:p-10 bg-white border border-gray-100 rounded-[2.5rem] md:rounded-[3rem] shadow-xl flex flex-col items-center text-center group hover:bg-primary transition-all cursor-default">
              <div className="p-4 bg-primary/10 rounded-2xl w-fit mb-4 md:mb-6 text-primary group-hover:bg-white/20 group-hover:text-white transition-colors">{s.icon}</div>
              <span className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 group-hover:text-white/60">{s.label}</span>
              <span className="text-xl md:text-4xl font-black group-hover:text-white transition-colors">{s.value}</span>
           </div>
         ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl">
        <div className="p-8 md:p-10 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-gray-50/50">
          <h3 className="text-xl md:text-2xl font-black">Manage Farmer Base</h3>
          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input type="text" placeholder="Search user..." className="w-full pl-12 pr-6 py-3 rounded-2xl bg-white border outline-none text-sm" />
            </div>
            <button className="text-primary font-black uppercase text-[10px] tracking-widest hover:underline whitespace-nowrap">Manage Subscriptions</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
             <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
               <tr>
                 <th className="px-10 py-6">User / Farmer ID</th>
                 <th className="px-10 py-6">Current Plan</th>
                 <th className="px-10 py-6">Status</th>
                 <th className="px-10 py-6 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {[1,2,3,4,5].map(i => (
                 <tr key={i} className="hover:bg-gray-50/50 transition-all cursor-pointer">
                   <td className="px-10 py-8">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400">F{i}</div>
                        <div>
                           <div className="font-black text-gray-900 text-sm">Mkulima_{i*144}</div>
                           <div className="text-[10px] text-gray-300 font-bold tracking-tighter">ID: NAS-2026-{1000+i}</div>
                        </div>
                     </div>
                   </td>
                   <td className="px-10 py-8"><span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-widest">PREMIUM PRO</span></td>
                   <td className="px-10 py-8"><div className="flex items-center gap-2 text-green-500 font-black text-[10px] uppercase"><UserCheck size={14}/> Verified</div></td>
                   <td className="px-10 py-8 text-right">
                     <div className="flex justify-end gap-2">
                       <button className="p-2.5 bg-gray-100 rounded-xl text-gray-400 hover:text-primary transition-all"><Settings size={16}/></button>
                       <button className="p-2.5 bg-red-50 rounded-xl text-red-400 hover:text-red-600 transition-all"><X size={16}/></button>
                     </div>
                   </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Shared Utility Components ---
function WeatherModule({ theme, t }: any) {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      <div className={`p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] border flex flex-col lg:flex-row gap-10 md:gap-12 items-center bg-white shadow-2xl ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'border-gray-100'}`}>
         <div className="text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[9px] md:text-[10px] mb-4 bg-primary/5 px-4 py-1 rounded-full"><Clock size={12}/> Updated 2 mins ago</div>
            <h3 className="text-6xl md:text-7xl font-black text-primary mb-2">28°C</h3>
            <p className="text-xl md:text-2xl font-bold text-gray-500 mb-8">{t.office.split(',')[0]}, TZ <span className="text-gray-300">| Kisongo</span></p>
            <div className="flex flex-col sm:flex-row gap-4">
               <WeatherDetail icon={<CloudRain />} label="Humidity" value="65%" />
               <WeatherDetail icon={<Wind />} label="Wind Speed" value="12km/h" />
            </div>
         </div>
         <div className="w-full lg:w-1/2 grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
            {['Leo', 'Kesho', 'J3', 'J4'].map((day, i) => (
              <div key={day} className={`p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] text-center border transition-all ${i === 0 ? 'bg-primary text-white shadow-2xl scale-110' : 'bg-gray-50 border-transparent hover:border-primary/20'}`}>
                 <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-60">{day}</span>
                 <div className={`my-3 md:my-4 ${i === 0 ? 'text-accent' : 'text-primary'}`}><CloudSun size={24} className="mx-auto" /></div>
                 <span className="text-xl md:text-2xl font-black">2{4+i}°</span>
              </div>
            ))}
         </div>
      </div>
      <div className="p-8 md:p-10 bg-primary/5 rounded-[2.5rem] md:rounded-[3rem] border border-primary/10">
         <h4 className="font-black text-primary uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2"><Globe size={14} /> Nasafari AI Smart Advisory</h4>
         <p className="text-gray-700 leading-relaxed font-medium text-sm md:text-base">Wiki ijayo inatarajiwa kuwa na jua kali maeneo ya nyanda za juu kusini. Ni vyema kuongeza kiasi cha maji kwenye mashamba ya nyanya na mpunga kuanzia kesho asubuhi kuzuia kupauka kwa majani.</p>
      </div>
    </div>
  );
}

function WeatherDetail({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 bg-gray-50 p-4 md:p-6 rounded-[2rem] flex-1 border border-transparent hover:border-primary/10 transition-all">
      <div className="text-primary bg-white p-2.5 md:p-3 rounded-2xl shadow-sm">{icon}</div>
      <div>
        <div className="text-[9px] md:text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1">{label}</div>
        <div className="font-black text-base md:text-lg leading-none">{value}</div>
      </div>
    </div>
  );
}

function MarketIntel({ theme, t }: any) {
  const items = [
    { name: 'Mahindi', price: 'Tsh 85,000', location: 'Dar-Tandale', trend: 'up' },
    { name: 'Mpunga', price: 'Tsh 120,000', location: 'Dodoma', trend: 'down' },
    { name: 'Nyanya', price: 'Tsh 28,000', location: 'Mbeya-Uyole', trend: 'up' },
    { name: 'Vitunguu', price: 'Tsh 45,000', location: 'Arusha-Soko Kuu', trend: 'up' }
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black">{t.market_highlights}</h2>
          <p className="text-gray-400 text-sm">Bei halisi kutoka masoko ya kitaifa leo.</p>
        </div>
        <div className="px-5 py-2 bg-accent rounded-full text-primary text-[10px] font-black uppercase animate-pulse">Live Updates Active</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {items.map(item => (
          <div key={item.name} className={`p-8 md:p-10 rounded-[3rem] md:rounded-[3.5rem] border flex items-center justify-between transition-all group hover:scale-[1.02] hover:shadow-2xl ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className="flex items-center gap-4 md:gap-6">
              <div className={`p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-sm ${item.trend === 'up' ? 'bg-green-50 text-green-600' : item.trend === 'down' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
                <TrendingUp className={item.trend === 'down' ? 'rotate-180' : ''} size={28} />
              </div>
              <div>
                <h4 className="text-xl md:text-2xl font-black">{item.name}</h4>
                <p className="text-[10px] md:text-xs font-bold text-gray-400">{item.location}</p>
              </div>
            </div>
            <div className="text-right">
               <div className="text-xl md:text-3xl font-black text-primary whitespace-nowrap">{item.price}</div>
               <div className="text-[9px] md:text-[10px] text-gray-400 uppercase font-black tracking-widest">Kwa Gunia / Tenga</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
         <img src="https://images.unsplash.com/photo-1590666014460-70f03264b36d?auto=format&fit=crop&q=80&w=600" className="rounded-[2.5rem] md:rounded-[3rem] h-56 md:h-64 object-cover shadow-xl" alt="Tomato Market" />
         <img src="https://images.unsplash.com/photo-1536633310180-2dc2bc41f2a3?auto=format&fit=crop&q=80&w=600" className="rounded-[2.5rem] md:rounded-[3rem] h-56 md:h-64 object-cover shadow-xl" alt="Rice Fields" />
      </div>
    </div>
  );
}

function SettingsScreen({ lang, setLang, theme, setTheme, t }: any) {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
       <div className={`p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-2xl'} space-y-8 md:space-y-10`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div>
               <h4 className="text-xl md:text-2xl font-black">Lugha ya Programu</h4>
               <p className="text-xs md:text-sm text-gray-400">Badili Kiswahili au Kiingereza.</p>
             </div>
             <div className="flex bg-gray-50 p-2 rounded-[1.5rem] gap-2 w-full sm:w-auto">
                <button onClick={() => setLang('sw')} className={`flex-1 sm:flex-none px-6 py-3 rounded-2xl text-[10px] font-black transition-all ${lang === 'sw' ? 'bg-white shadow-xl text-primary' : 'text-gray-400'}`}>SW</button>
                <button onClick={() => setLang('en')} className={`flex-1 sm:flex-none px-6 py-3 rounded-2xl text-[10px] font-black transition-all ${lang === 'en' ? 'bg-white shadow-xl text-primary' : 'text-gray-400'}`}>EN</button>
             </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-8 md:pt-10 border-t border-gray-50 gap-4">
             <div>
               <h4 className="text-xl md:text-2xl font-black">Mandhari</h4>
               <p className="text-xs md:text-sm text-gray-400">Chagua mandhari ya Giza au Mchana.</p>
             </div>
             <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="w-full sm:w-auto p-4 md:p-5 bg-gray-100 rounded-[1.5rem] md:rounded-[2rem] hover:scale-105 transition-all text-xs font-black text-gray-500">
                {theme === 'light' ? '🌙 Night Mode' : '☀️ Day Mode'}
             </button>
          </div>
       </div>
       <div className="text-center">
          <button className="text-red-400 font-black uppercase text-[9px] tracking-widest hover:text-red-600 transition-all">Delete My Nasafari Account</button>
       </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, color, icon }: any) {
  return (
    <div className={`p-8 md:p-10 rounded-[3rem] md:rounded-[4rem] text-white shadow-2xl relative overflow-hidden group hover:scale-[1.05] transition-transform duration-500 ${color}`}>
      <div className="absolute -right-8 -bottom-8 opacity-20 group-hover:scale-150 transition-transform duration-700">
        {React.cloneElement(icon as React.ReactElement, { size: 120 })}
      </div>
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="p-2.5 md:p-3 bg-white/30 backdrop-blur rounded-2xl">{icon}</div>
        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">{title}</span>
      </div>
      <div className="text-4xl md:text-5xl font-black mb-2">{value}</div>
      <div className="text-[10px] md:text-sm opacity-80 font-bold tracking-tight">{subtitle}</div>
    </div>
  );
}
