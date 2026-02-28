import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Camera, LayoutDashboard, MessageSquare, Users, 
  History, Upload, Loader2, LogOut, Send, UserCheck, ShieldAlert, Mail 
} from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('gallery');
  const [photos, setPhotos] = useState([]);
  const [identities, setIdentities] = useState([]);
  const [deliveryLogs, setDeliveryLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hello! I am your Drishyamitra assistant. Ask me anything about your detections.' }]);
  const [input, setInput] = useState('');

  const API_URL = "http://localhost:5000/api";

  // Activity 4.5 & 5.3: Syncing all data based on Active Tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === 'gallery') {
          const res = await axios.get(`${API_URL}/photos/list`);
          setPhotos(res.data);
        } else if (activeTab === 'people') {
          const res = await axios.get(`${API_URL}/photos/identities`);
          setIdentities(res.data);
        } else if (activeTab === 'logs') {
          const res = await axios.get(`${API_URL}/delivery/history`);
          setDeliveryLogs(res.data);
        }
      } catch (err) { 
        console.error("Backend offline - Check port 5000"); 
      }
    };
    fetchData();
  }, [activeTab]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setLoading(true);
    try {
      await axios.post(`${API_URL}/photos/upload`, fd);
      setActiveTab('gallery'); // Refresh gallery
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
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "AI brain disconnected." }]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white font-sans overflow-hidden">
      {/* Sidebar - Activity 4.1 */}
      <nav className="w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-10 text-blue-500">
            <Camera size={32} />
            <h1 className="text-xl font-black text-white tracking-tighter">DRISHYAMITRA</h1>
          </div>
          <button onClick={() => setActiveTab('gallery')} className={`flex items-center gap-3 p-3 w-full rounded-xl transition ${activeTab === 'gallery' ? 'bg-blue-600 shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:bg-gray-800'}`}><LayoutDashboard size={20}/> Dashboard</button>
          <button onClick={() => setActiveTab('people')} className={`flex items-center gap-3 p-3 w-full rounded-xl transition ${activeTab === 'people' ? 'bg-blue-600' : 'text-gray-400 hover:bg-gray-800'}`}><Users size={20}/> Identity Center</button>
          <button onClick={() => setActiveTab('logs')} className={`flex items-center gap-3 p-3 w-full rounded-xl transition ${activeTab === 'logs' ? 'bg-blue-600' : 'text-gray-400 hover:bg-gray-800'}`}><History size={20}/> Delivery Logs</button>
        </div>
        <button className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-950/30 rounded-xl transition mt-auto"><LogOut size={20}/> Logout</button>
      </nav>

      {/* Main UI Area */}
      <main className="flex-1 p-10 overflow-y-auto relative">
        
        {/* Activity 4.2: Dashboard & Photo Upload */}
        {activeTab === 'gallery' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold mb-8 text-gray-100">System Dashboard</h2>
            <div className="border-2 border-dashed border-gray-800 rounded-3xl p-16 text-center bg-gray-900/40 hover:border-blue-500 transition-all cursor-pointer group">
              <input type="file" id="u" className="hidden" onChange={handleUpload} />
              <label htmlFor="u" className="cursor-pointer flex flex-col items-center gap-4">
                {loading ? <Loader2 className="animate-spin text-blue-500" size={48}/> : <Upload size={48} className="text-gray-400 group-hover:text-blue-500 transition"/>}
                <p className="text-gray-300 font-medium tracking-wide">{loading ? 'AI analyzing faces...' : 'Upload Image to Start Detection'}</p>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
              {photos.map(p => (
                <div key={p.id} className="group bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl hover:border-blue-500/50 transition-all">
                  <img src={`http://localhost:5000${p.url}`} className="h-56 w-full object-cover grayscale-[30%] group-hover:grayscale-0 transition duration-500" alt="face" />
                  <div className="p-5 flex justify-between items-center bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${p.identity === 'Unknown' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-green-500 shadow-[0_0_10px_#22c55e]'}`} />
                      <span className="text-xs font-black text-gray-100 uppercase tracking-widest">{p.identity || 'Unknown'}</span>
                    </div>
                    <span className="text-[10px] text-gray-500">{new Date(p.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity 4.4: Identity Center */}
        {activeTab === 'people' && (
          <div className="max-w-6xl mx-auto animate-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-bold mb-8">Identity Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {identities.map((person, idx) => (
                <div key={idx} className="bg-gray-900 border border-gray-800 p-6 rounded-3xl flex items-center gap-5 hover:bg-gray-800/50 transition">
                  <div className="w-14 h-14 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center border border-blue-500/20">
                    <UserCheck size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{person.name}</h3>
                    <p className="text-xs text-gray-500 font-medium">Verified in {person.count} detections</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity 3.3/3.4: Delivery Logs View */}
        {activeTab === 'logs' && (
          <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold mb-8">Alert Delivery History</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-gray-800/50 text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                  <tr>
                    <th className="p-6">Recipient Contact</th>
                    <th className="p-6">Method</th>
                    <th className="p-6">Status</th>
                    <th className="p-6">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {deliveryLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-blue-500/5 transition">
                      <td className="p-6 font-semibold text-gray-200">{log.recipient}</td>
                      <td className="p-6">
                        <span className="flex items-center gap-2 text-xs">
                          {log.type === 'WhatsApp' ? <MessageSquare size={14} className="text-green-500"/> : <Mail size={14} className="text-blue-500"/>}
                          {log.type}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${log.status === 'Sent' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-6 text-gray-500 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Activity 4.3: AI Assistant */}
        <div className="fixed bottom-10 right-10 flex flex-col items-end gap-4 z-50">
          {chatOpen && (
            <div className="w-80 h-[500px] bg-gray-900 border border-gray-800 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 bg-blue-600 font-bold flex justify-between items-center">
                <div className="flex items-center gap-2"><MessageSquare size={18}/> <span>AI Security Assistant</span></div>
                <button onClick={() => setChatOpen(false)} className="hover:bg-blue-700 rounded-lg p-1">×</button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scrollbar-hide">
                {messages.map((m, i) => (
                  <div key={i} className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white ml-auto rounded-tr-none' : 'bg-gray-800 text-gray-300 rounded-tl-none border border-gray-700'}`}>
                    {m.content}
                  </div>
                ))}
              </div>
              <form onSubmit={handleChat} className="p-4 bg-gray-900 border-t border-gray-800 flex gap-2">
                <input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about security logs..." 
                  className="flex-1 bg-gray-800 border-none rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-blue-500 text-white"
                />
                <button type="submit" className="p-2 bg-blue-600 rounded-xl hover:bg-blue-500 transition"><Send size={18}/></button>
              </form>
            </div>
          )}
          <button 
            onClick={() => setChatOpen(!chatOpen)}
            className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 hover:rotate-12 transition-all active:scale-95"
          >
            <MessageSquare size={28} />
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;