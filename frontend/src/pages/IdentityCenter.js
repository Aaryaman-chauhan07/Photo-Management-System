import React, { useState, useEffect } from 'react';
import axios from 'axios';

const IdentityCenter = () => {
  const [identities, setIdentities] = useState([]);

  useEffect(() => {
    // Activity 5.3: Fetching recognized identities from Flask
    axios.get('http://localhost:5000/api/photos/identities')
      .then(res => setIdentities(res.data))
      .catch(err => console.error("Identity Fetch Error:", err));
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Identity Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {identities.map((person) => (
          <div key={person.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                {person.name[0]}
              </div>
              <div>
                <h3 className="font-semibold">{person.name}</h3>
                <p className="text-sm text-gray-400">Total Detections: {person.count}</p>
              </div>
            </div>
            <button className="w-full mt-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition">
              View Logs
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IdentityCenter;