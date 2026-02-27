import React, { useState, useEffect, useRef } from 'react';
import api, { uploadPhoto, sendMessage } from './api';

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [messages, setMessages] = useState([{ role: 'ai', text: 'Drishyamitra Dashboard Active!' }]);
  const chatEnd = useRef(null);

  const fetchPhotos = async (person = "") => {
    try {
        const res = await api.get(`/photos/list${person ? `?person=${person}` : ''}`);
        setPhotos(res.data);
    } catch (e) { console.error("Server Down"); }
  };

  useEffect(() => { fetchPhotos(); }, []);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleUpload = async (e) => {
    const fd = new FormData();
    fd.append('file', e.target.files[0]);
    try {
        await uploadPhoto(fd);
        fetchPhotos();
    } catch (err) { alert("Upload Failed: Check if backend is running"); }
  };

  const onChat = async (e) => {
    e.preventDefault();
    const input = e.target.chat.value;
    setMessages(p => [...p, { role: 'user', text: input }]);
    e.target.reset();
    const res = await sendMessage(input);
    if (res.data.action === "search") {
      fetchPhotos(res.data.person);
      setMessages(p => [...p, { role: 'ai', text: `Filtering for ${res.data.person}...` }]);
    } else {
      setMessages(p => [...p, { role: 'ai', text: res.data.response }]);
    }
  };

  return (
    <div className="p-10 flex gap-10 bg-gray-50 min-h-screen">
      <div className="w-2/3">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">DRISHYAMITRA</h1>
        <div className="bg-white p-6 rounded shadow-sm mb-8">
          <input type="file" onChange={handleUpload} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {photos.map(p => (
            <div key={p.id} className="bg-white p-2 rounded shadow">
              <img src={`http://localhost:5000${p.url}`} className="h-40 w-full object-cover rounded" alt="img" />
              <div className="mt-2 text-xs flex justify-between">
                <span>{p.people.join(', ') || 'Unknown'}</span>
                <button className="text-blue-500" onClick={async () => {
                   const n = prompt("Name?");
                   if(n) { await api.post('/photos/label', {photo_id: p.id, name: n}); fetchPhotos(); }
                }}>Tag</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-1/3 bg-white p-4 rounded-xl shadow-lg flex flex-col h-[600px]">
        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.map((m, i) => <div key={i} className={`p-2 rounded ${m.role==='user'?'bg-blue-600 text-white':'bg-gray-100'}`}>{m.text}</div>)}
          <div ref={chatEnd} />
        </div>
        <form onSubmit={onChat} className="mt-4 flex gap-2">
          <input name="chat" className="flex-1 border p-2 rounded" placeholder="Ask..." />
          <button className="bg-blue-600 text-white px-4 rounded">Send</button>
        </form>
      </div>
    </div>
  );
}