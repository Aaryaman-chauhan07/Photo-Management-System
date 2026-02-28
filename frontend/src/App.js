import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Camera, Upload, Image, Edit, MessageSquare, Heart, 
  Share2, Settings, LogOut, ArrowRight, Send, Mail, Lock, 
  User, Eye, Search, Bell, History, Loader2, UserCheck, ShieldAlert 
} from 'lucide-react';

function App() {
  // 1. Navigation & State Management
  const [currentPage, setCurrentPage] = useState('home'); // home, login, signup, app
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // 2. Data State
  const [photos, setPhotos] = useState([]);
  const [identities, setIdentities] = useState([]);
  const [deliveryLogs, setDeliveryLogs] = useState([]);
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hello! I am your Intelligent Photo Assistant.' }]);
  const [input, setInput] = useState('');

  const API_URL = "http://localhost:5000/api";

  // 3. Fetch Logic for Backend Integration
  useEffect(() => {
    if (currentPage === 'app') {
      const fetchData = async () => {
        try {
          const [pRes, iRes, lRes] = await Promise.all([
            axios.get(`${API_URL}/photos/list`),
            axios.get(`${API_URL}/photos/identities`),
            axios.get(`${API_URL}/delivery/history`)
          ]);
          setPhotos(pRes.data);
          setIdentities(iRes.data);
          setDeliveryLogs(lRes.data);
        } catch (err) { console.error("Backend offline - Check port 5000"); }
      };
      fetchData();
    }
  }, [currentPage, activeTab]);

  // 4. Action Handlers
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setLoading(true);
    try {
      await axios.post(`${API_URL}/photos/upload`, fd);
      const res = await axios.get(`${API_URL}/photos/list`);
      setPhotos(res.data);
      setActiveTab('gallery');
    } catch (err) { alert("Detection Failed."); }
    finally { setLoading(false); }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!input) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    try {
      const res = await axios.post(`${API_URL}/chat/ask`, { query: input });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) { setMessages(prev => [...prev, { role: 'assistant', content: "AI brain disconnected." }]); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentPage('home');
    setActiveTab('dashboard');
  };

  // --- VIEW 1: HOME PAGE ---
  if (currentPage === 'home') return (
    <div className="min-h-screen bg-gradient-to-br from-[#1d4ed8] via-[#3b82f6] to-[#1e40af] flex flex-col items-center justify-center text-white px-6 text-center animate-in fade-in duration-700">
      <div className="bg-white/20 p-6 rounded-2xl backdrop-blur-md mb-8 border border-white/10 shadow-xl">
        <Camera size={48} />
      </div>
      <h1 className="text-7xl font-bold tracking-tight mb-4">Drishyamitra</h1>
      <p className="text-xl font-medium text-blue-100 mb-8 opacity-90">Professional Photography Platform</p>
      <p className="max-w-2xl text-lg text-blue-50/70 leading-relaxed mb-12">
        Transform your photography workflow with AI-powered tools, smart organization, and seamless sharing across multiple platforms.
      </p>
      <div className="flex gap-6">
        <button onClick={() => setCurrentPage('signup')} className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold flex items-center gap-2 hover:shadow-2xl transition-all active:scale-95">
          Get Started Free <ArrowRight size={20} />
        </button>
        <button onClick={() => setCurrentPage('login')} className="bg-white/10 border border-white/20 px-10 py-4 rounded-xl font-bold hover:bg-white/20 transition-all">Login</button>
      </div>
    </div>
  );

  // --- VIEW 2: AUTH PAGES ---
  if (currentPage === 'login' || currentPage === 'signup') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 animate-in zoom-in-95">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-slate-800 mb-2">Drishyamitra</h2>
          <p className="text-slate-400 font-medium">
            {currentPage === 'signup' ? 'Create your account' : 'Your Intelligent Photo Assistant'}
          </p>
        </div>
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setCurrentPage('app'); }}>
          <div className="relative">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Email Address</label>
            <Mail className="absolute left-4 top-[38px] text-slate-300" size={18}/><input type="email" placeholder="you@example.com" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500" required />
          </div>
          {currentPage === 'signup' && (
            <div className="relative">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Username</label>
              <User className="absolute left-4 top-[38px] text-slate-300" size={18}/><input placeholder="username" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500" required />
            </div>
          )}
          <div className="relative">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Password</label>
            <Lock className="absolute left-4 top-[38px] text-slate-300" size={18}/><input type="password" placeholder="••••••••" className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500" required /><Eye className="absolute right-4 top-[38px] text-slate-300 cursor-pointer" size={18}/>
          </div>
          <button type="submit" className="w-full bg-[#475569] text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-700 transition-all shadow-lg active:scale-95">
            {currentPage === 'signup' ? 'Sign Up' : 'Login'}
          </button>
          <p className="text-center text-sm text-slate-500 mt-8">
            {currentPage === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <span onClick={() => setCurrentPage(currentPage === 'signup' ? 'login' : 'signup')} className="text-slate-800 font-bold cursor-pointer hover:underline">
              {currentPage === 'signup' ? 'Sign in' : 'Sign up'}
            </span>
          </p>
        </form>
      </div>
    </div>
  );

  // --- VIEW 3: MAIN APP (DASHBOARD) ---
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      {/* Horizontal Navbar */}
      <nav className="bg-white border-b border-slate-100 px-8 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-blue-600 font-bold cursor-pointer" onClick={() => setCurrentPage('home')}>
            <div className="bg-blue-600 p-1.5 rounded-lg text-white"><Camera size={20}/></div>
            <span className="text-xl tracking-tighter text-slate-900 uppercase">Drishyamitra</span>
          </div>
          <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <button onClick={() => setCurrentPage('home')} className="hover:text-blue-600">Home</button>
            <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg' : 'hover:text-blue-600'}>Dashboard</button>
            <button onClick={() => setActiveTab('gallery')} className={activeTab === 'gallery' ? 'text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg' : 'hover:text-blue-600'}>Gallery</button>
            <button onClick={() => setActiveTab('people')} className={activeTab === 'people' ? 'text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg' : 'hover:text-blue-600'}>People</button>
            <button onClick={() => setActiveTab('logs')} className={activeTab === 'logs' ? 'text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg' : 'hover:text-blue-600'}>Logs</button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
              <div className="w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center text-[10px] font-bold shadow-md">U1</div>
              <span className="text-slate-900 font-bold text-xs">User1</span>
            </div>
            <LogOut size={20} className="text-slate-300 cursor-pointer hover:text-red-500" onClick={handleLogout} />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-10 animate-in fade-in duration-500">
        {activeTab === 'dashboard' && (
          <>
            {/* Welcome Banner */}
            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-5xl font-black text-slate-900 mb-2 tracking-tight">Welcome back, User1!</h2>
                <p className="text-slate-500 font-medium text-xl">Ready to capture and create amazing memories?</p>
                <p className="text-slate-400 text-xs mt-4">📅 Monday, November 3, 2025</p>
              </div>
              <div className="bg-blue-600 text-white px-8 py-5 rounded-2xl font-bold flex items-center gap-4 shadow-xl shadow-blue-500/20">
                Portfolio Status <span className="bg-white/20 px-3 py-1.5 rounded-xl text-sm">{photos.length} Photos</span>
              </div>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <label className="bg-white p-10 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all">
                <input type="file" className="hidden" onChange={handleUpload} />
                <div className="bg-blue-600/5 text-blue-600 p-5 rounded-2xl mb-5 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {loading ? <Loader2 className="animate-spin"/> : <Upload />}
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Upload</h3>
                <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-1">Add new photos</p>
              </label>
              <ActionCard icon={<Image />} label="Gallery" sub="Browse collection" onClick={() => setActiveTab('gallery')} />
              <ActionCard icon={<Edit />} label="Editor" sub="AI enhancement" />
              <ActionCard icon={<MessageSquare />} label="AI Chat" sub="Get assistance" onClick={() => setChatOpen(true)} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Total Photos" value={photos.length} icon={<Image size={24}/>} />
              <StatCard label="Identities" value={identities.length} icon={<UserCheck size={24}/>} />
              <StatCard label="Alerts Sent" value={deliveryLogs.length} icon={<Bell size={24}/>} />
              <StatCard label="Favorites" value="8" icon={<Heart size={24}/>} />
            </div>
          </>
        )}

        {/* Gallery View (Activity 4.2) */}
        {activeTab === 'gallery' && (
          <div className="animate-in slide-in-from-right-4 duration-500 space-y-8">
            <h2 className="text-3xl font-black text-slate-900">My Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {photos.map(p => (
                <div key={p.id} className="bg-white p-3 rounded-[2rem] shadow-sm border border-slate-100 group">
                  <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden mb-3 relative">
                    <img src={`${API_URL}/../../${p.url}`} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="p"/>
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-[8px] px-2 py-1 rounded-md backdrop-blur-md">
                      {p.identity || 'Unknown'}
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-bold text-slate-400">2.43 MB</span>
                    <button className="text-[9px] font-black text-red-500 uppercase border border-red-50 px-2 py-1 rounded-lg hover:bg-red-50">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Identity Center View (Activity 4.4) */}
        {activeTab === 'people' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-right-4">
            {identities.map((p, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:bg-blue-50/30 transition">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-xl shadow-lg">{p.name[0]}</div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg">{p.name}</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{p.count} Verified Detections</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delivery Logs View (Activity 3.3) */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm animate-in slide-in-from-bottom-4">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <tr><th className="p-8">Recipient</th><th className="p-8">Method</th><th className="p-8">Status</th><th className="p-8">Time</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deliveryLogs.map(log => (
                  <tr key={log.id} className="text-sm hover:bg-slate-50 transition">
                    <td className="p-8 font-bold text-slate-900">{log.recipient}</td>
                    <td className="p-8"><span className="flex items-center gap-2">{log.type === 'WhatsApp' ? <MessageSquare size={14} className="text-green-500"/> : <Mail size={14} className="text-blue-500"/>}{log.type}</span></td>
                    <td className="p-8"><span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black">{log.status.toUpperCase()}</span></td>
                    <td className="p-8 text-slate-400 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Floating AI Chat Assistant (Activity 4.3) */}
      <div className="fixed bottom-10 right-10 z-50">
        {chatOpen && (
          <div className="w-80 h-[500px] bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 border border-slate-100">
            <div className="p-6 bg-[#f97316] text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-3"><MessageSquare size={24}/><span className="text-xl font-black tracking-tighter">AI Assistant</span></div>
              <button onClick={() => setChatOpen(false)} className="text-2xl hover:scale-125 transition">×</button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-orange-50/20 scrollbar-hide text-xs leading-relaxed">
              {messages.map((m, i) => (
                <div key={i} className={`p-4 rounded-[1.5rem] max-w-[90%] font-medium shadow-sm ${m.role === 'user' ? 'bg-[#f97316] text-white ml-auto rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                  {m.content}
                </div>
              ))}
            </div>
            <form onSubmit={handleChat} className="p-5 bg-white border-t border-slate-100 flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-xs outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"/>
              <button type="submit" className="p-3 bg-[#f97316] text-white rounded-2xl shadow-lg shadow-orange-500/30 hover:scale-110 transition active:scale-95"><Send size={18}/></button>
            </form>
          </div>
        )}
        <button onClick={() => setChatOpen(!chatOpen)} className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(37,99,235,0.4)] hover:scale-110 hover:rotate-12 transition-all active:scale-95"><MessageSquare size={30}/></button>
      </div>
    </div>
  );
}

// --- SHARED UI COMPONENTS ---
const ActionCard = ({ icon, label, sub, onClick }) => (
  <div onClick={onClick} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all">
    <div className="bg-blue-600/5 text-blue-600 p-5 rounded-2xl mb-5 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">{icon}</div>
    <h3 className="font-bold text-slate-900 text-lg mb-1">{label}</h3>
    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">{sub}</p>
  </div>
);

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm text-center flex flex-col items-center group hover:bg-blue-50/20 transition-all">
    <div className="text-blue-600/30 mb-5 group-hover:text-blue-600 transition-all">{icon}</div>
    <div className="text-4xl font-black text-slate-900 mb-1">{value}</div>
    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
  </div>
);

export default App;