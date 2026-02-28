import React from 'react';
import { Upload, Image, Edit, MessageSquare, Heart, Share2, Settings, LogOut, Camera } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 text-slate-800">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-10 bg-white px-6 py-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 text-blue-600 font-bold">
          <Camera size={24}/> <span className="text-xl tracking-tighter">DRISHYAMITRA</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
          <span className="text-blue-600 cursor-pointer">Home</span>
          <span className="cursor-pointer">Dashboard</span>
          <span className="cursor-pointer">Gallery</span>
          <span className="cursor-pointer">AI Chat</span>
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl">
             <div className="w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center text-xs">U1</div>
             <span className="text-slate-900 font-bold">User1</span>
          </div>
          <Settings size={20} className="cursor-pointer text-slate-400" />
          <LogOut size={20} className="cursor-pointer text-slate-400" />
        </div>
      </div>

      {/* Hero Welcome */}
      <div className="max-w-7xl mx-auto bg-white p-10 rounded-3xl border border-slate-100 shadow-sm mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-slate-900 mb-2">Welcome back, User1!</h2>
          <p className="text-slate-500 font-medium text-lg">Ready to capture and create amazing memories?</p>
          <p className="text-slate-400 text-sm mt-3 flex items-center gap-2">📅 Monday, November 3, 2025</p>
        </div>
        <div className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg">
          Portfolio Status <span className="bg-white/20 px-3 py-1 rounded-lg">17 Photos</span>
        </div>
      </div>

      {/* Main Action Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <ActionCard icon={<Upload />} label="Upload" sub="Add new photos" />
        <ActionCard icon={<Image />} label="Gallery" sub="Browse collection" />
        <ActionCard icon={<Edit />} label="Editor" sub="AI enhancement" />
        <ActionCard icon={<MessageSquare />} label="AI Chat" sub="Get assistance" />
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard label="Total Photos" value="17" icon={<Image />} />
        <StatCard label="This Month" value="12" icon={<Image />} />
        <StatCard label="Favorites" value="8" icon={<Heart />} />
        <StatCard label="Shared" value="24" icon={<Share2 />} />
      </div>
    </div>
  );
};

const ActionCard = ({ icon, label, sub }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group cursor-pointer hover:shadow-md transition-all">
    <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
      {icon}
    </div>
    <h3 className="font-bold text-slate-900">{label}</h3>
    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">{sub}</p>
  </div>
);

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
    <div className="text-blue-600 flex justify-center mb-4 opacity-50">{icon}</div>
    <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
  </div>
);

export default Dashboard;