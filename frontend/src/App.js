import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Camera, Upload, Image, Edit, MessageSquare, LogOut, ArrowRight, 
  Mail, Lock, User, Eye, EyeOff, Send, Loader2, Trash2,
  Home, LayoutDashboard, History, Settings 
} from 'lucide-react';

function App() {
  const [page, setPage] = useState('home'); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authData, setAuthData] = useState({ email: '', username: '', password: '' });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const fileInputRef = useRef(null);
  const API_URL = "http://localhost:5000/api";

  const handleAuth = async (e, type) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = type === 'signup' ? '/auth/signup' : '/auth/login';
      const res = await axios.post(`${API_URL}${endpoint}`, authData);
      
      if (type === 'login') {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.username); // Save username for the profile tab
        setPage('app'); 
      } else {
        alert("Account created! Please log in.");
        setAuthData({ email: '', username: '', password: '' }); 
        setPage('login');
      }
    } catch (err) { 
      const serverMsg = err.response?.data?.message;
      const fallbackMsg = type === 'signup' ? "Sign Up Failed." : "Invalid Credentials.";
      alert(serverMsg || fallbackMsg); 
    } finally { 
      setLoading(false); 
    }
  };

  const fetchPhotos = () => {
    axios.get(`${API_URL}/photos/list`).then(res => setPhotos(res.data)).catch(err => console.log(err));
  };

  useEffect(() => {
    if (page === 'app') fetchPhotos();
  }, [page, activeTab]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      await axios.post(`${API_URL}/photos/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Photo uploaded successfully!");
      fetchPhotos(); 
      setActiveTab('gallery'); 
    } catch (err) {
      alert("Upload failed. Make sure your backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // --- 1. HOME VIEW ---
  if (page === 'home') return (
    <div className="min-h-screen bg-gradient-to-br from-[#1d4ed8] to-[#1e40af] flex flex-col items-center justify-center text-white text-center p-6">
      <div className="bg-white/20 p-6 rounded-2xl mb-8"><Camera size={48} /></div>
      <h1 className="text-7xl font-bold mb-4">Drishyamitra</h1>
      <p className="text-xl mb-12 font-medium">Professional Photography Platform</p>
      <div className="flex gap-6">
        <button onClick={() => setPage('signup')} className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold flex items-center gap-2 hover:shadow-2xl transition-all">Get Started Free <ArrowRight size={20} /></button>
        <button onClick={() => setPage('login')} className="bg-white/10 border border-white/20 px-10 py-4 rounded-xl font-bold">Login</button>
      </div>
    </div>
  );

  // --- 2. AUTH VIEW ---
  if (page === 'login' || page === 'signup') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 animate-in zoom-in-95">
        <h2 className="text-4xl font-black text-center text-slate-800 mb-2">Drishyamitra</h2>
        <p className="text-center text-slate-400 mb-10 font-medium">{page === 'signup' ? 'Create your account' : 'Welcome Back'}</p>
        
        <form onSubmit={(e) => handleAuth(e, page)} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
            <input type="email" value={authData.email} placeholder="you@example.com" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900 font-medium" onChange={e => setAuthData({...authData, email: e.target.value})} required />
          </div>

          {page === 'signup' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
              <input type="text" value={authData.username} placeholder="username" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900 font-medium" onChange={e => setAuthData({...authData, username: e.target.value})} required />
            </div>
          )}

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
            <input type={showPassword ? "text" : "password"} value={authData.password} placeholder="••••••••" className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900 font-medium" onChange={e => setAuthData({...authData, password: e.target.value})} required />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </div>
          </div>

          <button type="submit" className="w-full bg-[#475569] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-700 transition-all">
            {loading ? <Loader2 className="animate-spin mx-auto"/> : (page === 'signup' ? 'Sign Up' : 'Login')}
          </button>
          
          <p className="text-center text-sm mt-8 cursor-pointer font-bold text-slate-800" onClick={() => { setPage(page === 'signup' ? 'login' : 'signup'); setAuthData({ email: '', username: '', password: '' }); setShowPassword(false); }}>
            {page === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </p>
        </form>
      </div>
    </div>
  );

  // --- 3. DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} accept="image/*" />

      {/* NEW NAVIGATION BAR */}
      <nav className="bg-white border-b px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        
        {/* Left: Logo Area */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg"><Camera size={22}/></div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-900 leading-tight">Drishyamitra</span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide">Professional Photography</span>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <div className="hidden lg:flex items-center gap-1">
          <button onClick={() => { setPage('home'); setAuthData({ email: '', username: '', password: '' }); }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-50 font-medium text-sm transition-all"><Home size={16}/> Home</button>
          
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}><LayoutDashboard size={16}/> Dashboard</button>
          
          <button onClick={() => setActiveTab('gallery')} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${activeTab === 'gallery' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}><Image size={16}/> Gallery</button>
          
          <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-50 font-medium text-sm transition-all"><Upload size={16}/> Upload</button>
          
          <button onClick={() => setChatOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-50 font-medium text-sm transition-all"><MessageSquare size={16}/> AI Chat</button>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-50 font-medium text-sm transition-all"><Edit size={16}/> Editor</button>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-50 font-medium text-sm transition-all"><History size={16}/> History</button>
        </div>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
            <div className="bg-blue-600 text-white p-1.5 rounded-full"><User size={14}/></div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-slate-900 leading-none">{localStorage.getItem('username') || 'User1'}</span>
              <span className="text-[10px] text-slate-500 font-medium mt-1">Photographer</span>
            </div>
          </div>
          <Settings size={20} className="text-slate-400 cursor-pointer hover:text-slate-600" />
          <LogOut size={20} className="text-slate-400 cursor-pointer hover:text-red-500" onClick={() => { setPage('home'); setAuthData({ email: '', username: '', password: '' }); localStorage.clear(); }} />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-10 animate-in fade-in duration-500">
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm mb-10 flex justify-between items-center">
          <div>
            <h2 className="text-5xl font-black text-slate-900 mb-2">Welcome back, {localStorage.getItem('username') || 'User1'}!</h2>
            <p className="text-slate-500 font-medium text-xl opacity-80">Ready to capture amazing memories?</p>
          </div>
          <div className="bg-blue-600 text-white px-8 py-5 rounded-2xl font-bold shadow-xl shadow-blue-500/20">Portfolio Status <span className="bg-white/20 px-3 py-1 rounded-lg ml-2">{photos.length} Photos</span></div>
        </div>
        
        {loading && <div className="text-center py-4 text-blue-600 font-bold flex justify-center items-center gap-2"><Loader2 className="animate-spin" /> Uploading to server...</div>}

        {activeTab === 'dashboard' && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <ActionCard icon={<Upload />} label="Upload" sub="Add new photos" onClick={() => fileInputRef.current.click()} />
            <ActionCard icon={<Image />} label="Gallery" sub="Browse collection" onClick={() => setActiveTab('gallery')} />
            <ActionCard icon={<Edit />} label="Editor" sub="AI enhancement" />
            <ActionCard icon={<MessageSquare />} label="AI Chat" sub="Get assistance" onClick={() => setChatOpen(true)} />
          </div>
        )}

        {activeTab === 'gallery' && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 animate-in slide-in-from-right-4">
            {photos.length === 0 ? (
              <p className="text-slate-400 col-span-full text-center py-10 font-medium">No photos yet. Go to Dashboard and click Upload!</p>
            ) : (
              photos.map(p => (
                <div key={p.id} className="bg-white p-3 rounded-[2rem] shadow-sm border border-slate-100 group">
                  <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden mb-3">
                    <img src={`${API_URL.replace('/api', '')}${p.url}`} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="p"/>
                  </div>
                  <div className="flex justify-between items-center px-1"><span className="text-[9px] font-bold text-slate-400">{p.identity}</span><Trash2 size={12} className="text-red-400 cursor-pointer"/></div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Floating Chat Assistant */}
      {chatOpen && (
        <div className="fixed bottom-10 right-10 w-96 h-[550px] bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 border border-slate-100">
          <div className="p-6 bg-[#f97316] text-white flex justify-between items-center shadow-lg"><div className="flex items-center gap-3"><MessageSquare size={24}/><span className="text-xl font-bold">Chat Assistant</span></div><button onClick={() => setChatOpen(false)}>×</button></div>
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-orange-50/20 text-xs font-medium text-slate-700 leading-relaxed">
             Hello! I am ready to help you manage your portfolio.
          </div>
          <div className="p-4 border-t border-slate-100 flex gap-2"><input placeholder="Type your message..." className="flex-1 bg-slate-50 border rounded-xl px-4 py-2 text-sm outline-none text-slate-900"/><button className="p-2 bg-[#f97316] text-white rounded-xl shadow-lg shadow-orange-500/30"><Send size={18}/></button></div>
        </div>
      )}
    </div>
  );
}

const ActionCard = ({ icon, label, sub, onClick }) => (
  <div onClick={onClick} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group">
    <div className="bg-blue-600/5 text-blue-600 p-5 rounded-2xl mb-5 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">{icon}</div>
    <h3 className="font-bold text-slate-900 text-lg mb-1">{label}</h3>
    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{sub}</p>
  </div>
);

export default App;