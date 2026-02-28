import React from 'react';
import { Camera, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1d4ed8] via-[#3b82f6] to-[#1e40af] flex flex-col items-center justify-center text-white px-6 text-center">
      {/* Centered Camera Icon Badge */}
      <div className="bg-white/20 p-6 rounded-2xl backdrop-blur-md mb-8 shadow-xl border border-white/10">
        <Camera size={48} />
      </div>
      
      <h1 className="text-7xl font-bold tracking-tight mb-4">Drishyamitra</h1>
      <p className="text-xl font-medium text-blue-100 mb-8">Professional Photography Platform</p>
      
      <p className="max-w-2xl text-lg text-blue-50/70 leading-relaxed mb-12">
        Transform your photography workflow with AI-powered tools, smart organization, and seamless sharing across multiple platforms.
      </p>

      {/* Buttons */}
      <div className="flex gap-6">
        <Link to="/signup" className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold flex items-center gap-2 hover:shadow-2xl transition-all">
          Get Started Free <ArrowRight size={20} />
        </Link>
        <button className="bg-white/10 border border-white/20 px-10 py-4 rounded-xl font-bold hover:bg-white/20 transition-all">
          Learn More
        </button>
      </div>
    </div>
  );
};

export default Home;