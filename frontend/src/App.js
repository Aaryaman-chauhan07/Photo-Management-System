import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Camera, Upload as UploadIcon, Image as ImageIcon, MessageSquare, 
  Settings, LogOut, Edit, Home, LayoutDashboard, History, 
  ChevronRight, Mail, Lock, User, Eye, EyeOff, Send, Trash2, 
  TrendingUp, Heart, Share2, Award 
} from 'lucide-react';

const BASE_URL = "http://localhost:5000";
const API_URL = `${BASE_URL}/api`;

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); 
  const [authMode, setAuthMode] = useState('login'); 
  const [activeTab, setActiveTab] = useState('dashboard'); 
  
  const [authData, setAuthData] = useState({ email: '', username: '', fullname: '', password: '', confirmPassword: '' });
  const [photos, setPhotos] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentUsername, setCurrentUsername] = useState(localStorage.getItem('username') || '');
  
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', text: 'Hello! I am Drishyamitra AI. How can I assist you with your photos today?' }
  ]);

  const fileInputRef = useRef(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (authMode === 'signup' && authData.password !== authData.confirmPassword) {
      alert("Passwords do not match!"); return;
    }
    setLoading(true);
    try {
      const endpoint = authMode === 'signup' ? '/auth/signup' : '/auth/login';
      const res = await axios.post(`${API_URL}${endpoint}`, {
        email: authData.email,
        username: authData.username || authData.email.split('@')[0],
        password: authData.password
      });
      if (authMode === 'login') {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.username);
        setCurrentUsername(res.data.username); 
        setCurrentView('app');
      } else { 
        alert("Account Created Successfully! Please login."); 
        setAuthMode('login'); 
      }
    } catch (err) { alert("Authentication Failed. Verify backend is running."); } 
    finally { setLoading(false); }
  };

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const pRes = await axios.get(`${API_URL}/photos/list`, { headers: { Authorization: `Bearer ${token}` } });
      setPhotos(pRes.data);
      
      const hRes = await axios.get(`${API_URL}/history`, { headers: { Authorization: `Bearer ${token}` } });
      setHistoryLogs(hRes.data);
    } catch (e) { console.error("Failed to fetch data", e); }
  };

  useEffect(() => {
    if (currentView === 'app') {
      fetchData();
      setCurrentUsername(localStorage.getItem('username') || '');
    }
  }, [currentView, activeTab]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/photos/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      fetchData();
      setActiveTab('gallery');
    } catch (e) { alert("Upload Failed."); } 
    finally { setLoading(false); }
  };

  const handleDeletePhoto = async (photoId) => {
    if(!window.confirm("Are you sure you want to delete this photo?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/photos/${photoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPhotos(photos.filter(p => p.id !== photoId));
      fetchData(); 
    } catch (err) { 
      console.error(err);
      alert("Delete failed."); 
    }
  };

  // The new Label function
  const handleLabelFace = async (photoId) => {
    const name = window.prompt("Who is in this photo?");
    if (!name) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/photos/${photoId}/label`, { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); // Refreshes gallery to show the new name
    } catch (err) { 
      alert("Failed to label face. Check backend."); 
    }
  };

  const handleChatSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { role: 'user', text: chatInput }]);
    const currentInput = chatInput;
    setChatInput('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/chat`, 
        { message: currentInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatMessages(prev => [...prev, { role: 'bot', text: res.data.reply }]);
    } catch (e) {
      console.error("Chat Error:", e.response ? e.response.data : e.message);
      setChatMessages(prev => [...prev, { role: 'bot', text: 'Error: Could not reach the AI. Check your backend terminal for details.' }]);
    }
  };

  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-800 to-blue-600 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="z-10 flex flex-col items-center">
          <div className="bg-white/20 p-4 rounded-2xl mb-6 backdrop-blur-sm">
            <Camera size={48} className="text-white" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">Drishyamitra</h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 font-light">Professional Photography Platform</p>
          <p className="max-w-2xl text-blue-100/80 mb-12 text-sm md:text-base leading-relaxed">
            Transform your photography workflow with AI-powered tools, smart organization, and seamless sharing across multiple platforms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => { setAuthMode('signup'); setCurrentView('auth'); }} className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors">
              Get Started Free <ChevronRight size={18} />
            </button>
            <button onClick={() => { setAuthMode('login'); setCurrentView('auth'); }} className="bg-transparent border border-white/30 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'auth') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-slate-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Drishyamitra</h2>
            <p className="text-slate-500 font-medium">
              {authMode === 'signup' ? 'Create your account' : 'Your Intelligent Photo Assistant'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#5c6b89] mb-1.5 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0abc0]" size={20} />
                <input 
                  type="email" 
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#cbd5e1] rounded-[14px] text-slate-800 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] outline-none transition-all" 
                  onChange={e => setAuthData({...authData, email: e.target.value})} 
                  required 
                />
              </div>
            </div>

            {authMode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-bold text-[#5c6b89] mb-1.5 ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0abc0]" size={20} />
                    <input 
                      type="text" 
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#cbd5e1] rounded-[14px] text-slate-800 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] outline-none transition-all" 
                      onChange={e => setAuthData({...authData, username: e.target.value})} 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#5c6b89] mb-1.5 ml-1">Full Name (Optional)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className="w-full px-4 py-3.5 bg-white border border-[#cbd5e1] rounded-[14px] text-slate-800 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] outline-none transition-all" 
                      onChange={e => setAuthData({...authData, fullname: e.target.value})} 
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-[#5c6b89] mb-1.5 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0abc0]" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full pl-12 pr-12 py-3.5 bg-white border border-[#cbd5e1] rounded-[14px] text-slate-800 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] outline-none transition-all" 
                  onChange={e => setAuthData({...authData, password: e.target.value})} 
                  required 
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a0abc0] hover:text-slate-600" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-bold text-[#5c6b89] mb-1.5 ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0abc0]" size={20} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#cbd5e1] rounded-[14px] text-slate-800 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] outline-none transition-all" 
                    onChange={e => setAuthData({...authData, confirmPassword: e.target.value})} 
                    required 
                  />
                </div>
              </div>
            )}

            <button type="submit" className="w-full bg-[#475569] hover:bg-[#334155] text-white py-4 rounded-[14px] font-bold mt-8 transition-colors shadow-lg">
              {loading ? 'Processing...' : (authMode === 'signup' ? 'Sign Up' : 'Login')}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            {authMode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <span className="font-bold text-slate-800 cursor-pointer hover:underline" onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}>
              {authMode === 'signup' ? 'Sign in' : 'Sign up'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} accept="image/*" />

      <nav className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg"><Camera size={20} className="text-white" /></div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight">Drishyamitra</h1>
            <p className="text-[10px] text-slate-500 font-medium">Professional Photography</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <NavButton icon={<Home size={16}/>} label="Home" active={false} onClick={() => setActiveTab('dashboard')} />
          <NavButton icon={<LayoutDashboard size={16}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavButton icon={<ImageIcon size={16}/>} label="Gallery" active={activeTab === 'gallery'} onClick={() => setActiveTab('gallery')} />
          <NavButton icon={<UploadIcon size={16}/>} label="Upload" active={activeTab === 'upload'} onClick={() => setActiveTab('upload')} />
          <NavButton icon={<MessageSquare size={16}/>} label="AI Chat" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
          <NavButton icon={<Edit size={16}/>} label="Editor" active={false} />
          <NavButton icon={<History size={16}/>} label="History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <div className="bg-blue-600 text-white p-1 rounded-full"><User size={16}/></div>
            <div className="text-left leading-tight pr-2">
              <p className="text-xs font-bold text-slate-800">{currentUsername || 'User1'}</p>
              <p className="text-[9px] text-slate-500 font-medium">Photographer</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600"><Settings size={20} /></button>
          <button onClick={() => { localStorage.clear(); setCurrentView('landing'); }} className="text-slate-400 hover:text-red-500"><LogOut size={20} /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm">
              <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome back, {currentUsername || 'User1'}!</h2>
                <p className="text-slate-500 mb-4">Ready to capture and create amazing memories?</p>
                <div className="text-sm text-slate-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Monday, November 3, 2025</div>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-medium">Portfolio Status</p>
                  <p className="font-bold text-slate-800">{photos.length} Photos</p>
                </div>
                <div className="bg-blue-600 p-3 rounded-xl text-white shadow-md"><Award size={24}/></div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
              <ActionCard icon={<UploadIcon size={28}/>} color="bg-blue-600" title="Upload" subtitle="Add new photos" onClick={() => setActiveTab('upload')} />
              <ActionCard icon={<ImageIcon size={28}/>} color="bg-blue-500" title="Gallery" subtitle="Browse collection" onClick={() => setActiveTab('gallery')} />
              <ActionCard icon={<Edit size={28}/>} color="bg-green-500" title="Editor" subtitle="AI enhancement" />
              <ActionCard icon={<MessageSquare size={28}/>} color="bg-orange-500" title="AI Chat" subtitle="Get assistance" onClick={() => setActiveTab('chat')} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <StatCard icon={<ImageIcon/>} value={photos.length} label="Total Photos" color="text-blue-600" />
              <StatCard icon={<TrendingUp/>} value="12" label="This Month" color="text-blue-500" />
              <StatCard icon={<Heart/>} value="8" label="Favorites" color="text-green-500" />
              <StatCard icon={<Share2/>} value="24" label="Shared" color="text-orange-500" />
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-600 p-2 rounded-lg text-white"><UploadIcon size={20}/></div>
                <div>
                  <h3 className="font-bold text-slate-800">Quick Upload</h3>
                  <p className="text-xs text-slate-500">Add photos to your portfolio</p>
                </div>
              </div>
              
              <div 
                onClick={() => fileInputRef.current.click()} 
                className="border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all mb-6"
              >
                <div className="bg-blue-600 p-4 rounded-xl text-white mb-4"><Camera size={32}/></div>
                <h4 className="font-bold text-slate-800 text-lg mb-2">Drop your photos here or click to browse</h4>
                <p className="text-slate-400 text-sm">Supports JPG, PNG, HEIC up to 50MB</p>
              </div>

              <button onClick={() => fileInputRef.current.click()} className="w-full bg-[#93A5F5] hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-colors">
                Upload Photo
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg text-white"><Camera size={16}/></div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Recent Photos</h3>
                    <p className="text-xs text-slate-500">Your latest captures</p>
                  </div>
                </div>
                <button onClick={() => setActiveTab('gallery')} className="text-xs font-bold border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50">View All ({photos.length})</button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {photos.slice(0, 6).map(p => (
                  <img key={p.id} src={`${BASE_URL}/${p.url}`} className="w-32 h-32 rounded-xl object-cover shrink-0 border border-slate-100" alt="recent" />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">My Photos</h2>
              <button onClick={() => setActiveTab('upload')} className="bg-[#10b981] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#059669] flex items-center gap-2 shadow-sm">
                <UploadIcon size={16}/> Upload Photos
              </button>
            </div>

            <div className="flex gap-4 mb-8">
              <input type="text" placeholder="Filter by event..." className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 shadow-sm" />
              <input type="text" placeholder="Filter by location..." className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 shadow-sm" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {photos.map(p => (
                <div key={p.id} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <img src={`${BASE_URL}/${p.url}`} className="w-full aspect-[4/3] object-cover rounded-xl mb-3 border border-slate-100" alt="gallery" />
                  <p className="text-[10px] text-slate-500 truncate mb-1">{p.url.split('/').pop()}</p>
                  
                  {/* Shows the Identity here */}
                  <p className="text-[10px] text-slate-800 font-bold mb-2 uppercase tracking-widest">{p.identity || 'Unknown Face'}</p>
                  
                  {/* The Side-by-Side Label and Delete Buttons */}
                  <div className="mt-auto flex gap-2 w-full pt-2 border-t border-slate-100">
                    <button 
                      onClick={() => handleLabelFace(p.id)}
                      className="flex-1 py-2 flex justify-center items-center gap-1 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Edit size={12}/> Label
                    </button>
                    <button 
                      onClick={() => handleDeletePhoto(p.id)}
                      className="flex-1 py-2 flex justify-center items-center gap-1 text-[#f56565] bg-[#fff5f5] hover:bg-[#fed7d7] rounded-lg text-xs font-bold transition-colors"
                    >
                      <Trash2 size={12}/> Delete
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Activity History</h2>
            <div className="bg-white rounded-[1.5rem] shadow-sm overflow-hidden border border-slate-200">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Activity Type</th>
                    <th className="p-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Status</th>
                    <th className="p-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyLogs.length === 0 ? (
                    <tr><td colSpan="3" className="p-6 text-center text-slate-400 text-sm font-medium">No history available yet.</td></tr>
                  ) : (
                    historyLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-6 font-bold text-slate-800 text-sm">{log.type}</td>
                        <td className="p-6"><span className="bg-[#e6f4ea] text-[#1e8e3e] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wide">{log.status}</span></td>
                        <td className="p-6 text-slate-500 font-medium text-sm">{log.time}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="max-w-3xl mx-auto border-[3px] border-[#4A72F6] rounded-[2rem] bg-[#FEF6E4] p-2 md:p-6 h-[75vh] flex flex-col shadow-lg animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-6 px-4 pt-2">
              <MessageSquare className="text-orange-500" size={28} />
              <h2 className="text-2xl font-bold text-[#E65C00]">Chat Assistant</h2>
            </div>
            
            <div className="flex-1 bg-white rounded-3xl p-6 overflow-y-auto space-y-4 shadow-sm border border-slate-100">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 text-sm font-medium leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-[#E65C00] text-white rounded-tr-sm' 
                      : msg.isSystem 
                        ? 'bg-slate-50 text-slate-500 w-full text-center text-xs'
                        : 'bg-[#F1F5F9] text-slate-700 rounded-tl-sm'}`}
                  >
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleChatSend} className="mt-4 flex gap-3 px-2 pb-2">
              <input 
                value={chatInput} 
                onChange={e => setChatInput(e.target.value)} 
                className="flex-1 p-4 bg-white border border-slate-200 rounded-xl outline-none text-slate-700 shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" 
                placeholder="Type your message..." 
              />
              <button type="submit" className="bg-[#EFA776] hover:bg-[#E65C00] text-white p-4 rounded-xl shadow-sm transition-colors">
                <Send size={20} />
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors
        ${active ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
    >
      {icon} <span className="hidden lg:inline">{label}</span>
    </button>
  );
}

function ActionCard({ icon, color, title, subtitle, onClick }) {
  return (
    <div 
      onClick={onClick} 
      className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-all group"
    >
      <div className={`${color} text-white p-4 rounded-2xl mb-4 group-hover:-translate-y-1 transition-transform`}>
        {icon}
      </div>
      <h3 className="font-bold text-slate-800 text-lg mb-1">{title}</h3>
      <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
    </div>
  );
}

function StatCard({ icon, value, label, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col items-center shadow-sm">
      <div className={`p-3 rounded-xl bg-slate-50 mb-3 ${color}`}>
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-800 mb-1">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}