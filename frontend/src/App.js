import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, LayoutDashboard, MessageSquare, Users, History, Upload, Loader2, LogOut } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('gallery');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_URL = "http://localhost:5000/api";

  // Activity 5.3: Validate Integration
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/photos/list`);
        setPhotos(res.data);
      } catch (err) { console.error("Backend offline - Activity 5.1/5.3 check required."); }
    };
    fetchData();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setLoading(true);
    try {
      await axios.post(`${API_URL}/photos/upload`, fd);
      window.location.reload(); 
    } catch (err) { alert("Activity 3.1 Failure: Check DeepFace logs."); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white font-sans overflow-hidden">
      {/* Sidebar - Milestone 4 Design */}
      <nav className="w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-10 text-blue-500">
            <Camera size={32} />
            <h1 className="text-xl font-black text-white">DRISHYAMITRA</h1>
          </div>
          <button onClick={() => setActiveTab('gallery')} className={`flex items-center gap-3 p-3 w-full rounded-xl transition ${activeTab === 'gallery' ? 'bg-blue-600' : 'text-gray-400'}`}><LayoutDashboard size={20}/> Dashboard</button>
          <button onClick={() => setActiveTab('people')} className={`flex items-center gap-3 p-3 w-full rounded-xl transition ${activeTab === 'people' ? 'bg-blue-600' : 'text-gray-400'}`}><Users size={20}/> Identity Center</button>
          <button onClick={() => setActiveTab('logs')} className={`flex items-center gap-3 p-3 w-full rounded-xl transition ${activeTab === 'logs' ? 'bg-blue-600' : 'text-gray-400'}`}><History size={20}/> Delivery Logs</button>
        </div>
        <button className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-950/30 rounded-xl transition mt-auto"><LogOut size={20}/> Logout</button>
      </nav>

      {/* Main UI Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        {activeTab === 'gallery' && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">System Management</h2>
            <div className="border-2 border-dashed border-gray-800 rounded-3xl p-16 text-center bg-gray-900/40 hover:border-blue-500 transition-all cursor-pointer">
              <input type="file" id="u" className="hidden" onChange={handleUpload} />
              <label htmlFor="u" className="cursor-pointer flex flex-col items-center gap-4">
                {loading ? <Loader2 className="animate-spin text-blue-500" size={48}/> : <Upload size={48} className="text-gray-600"/>}
                <p className="text-gray-300 font-medium">{loading ? 'Processing Faces...' : 'Click to Upload and Detect'}</p>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {photos.map(p => (
                <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl hover:border-blue-500 transition">
                  <img src={`http://localhost:5000${p.url}`} className="h-44 w-full object-cover" alt="face" />
                  <div className="p-4 flex justify-between items-center">
                    <span className="text-[10px] font-black text-blue-500 uppercase">{p.identity || 'Unknown'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;