import React, { useState } from 'react';
import { Upload, MessageSquare, History, Image as ImageIcon } from 'lucide-react';
import ChatWindow from './components/ChatWindow';
import PhotoGrid from './components/PhotoGrid';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('photos');

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            {/* Sidebar Navigation */}
            <nav className="w-20 border-r border-gray-800 flex flex-col items-center py-8 space-y-8">
                <button onClick={() => setActiveTab('photos')}><ImageIcon /></button>
                <button onClick={() => setActiveTab('chat')}><MessageSquare /></button>
                <button onClick={() => setActiveTab('history')}><History /></button>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 p-8 overflow-auto">
                {activeTab === 'photos' && <PhotoGrid />}
                {activeTab === 'chat' && <ChatWindow />}
                {activeTab === 'history' && <div>Delivery History Logs...</div>}
            </main>
        </div>
    );
};

export default Dashboard;