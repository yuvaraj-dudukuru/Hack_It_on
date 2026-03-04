import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function AddHackathonModal({ onClose, onHackathonAdded }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    externalUrl: '', // Link to the official hackathon site
    bannerUrl: ''    // Link to a banner image
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'hackathons'), {
        ...formData,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp()
      });
      onHackathonAdded();
      onClose();
    } catch (err) {
      console.error("Error adding hackathon:", err);
      setError('Failed to add hackathon. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 text-green-400">Add New Hackathon</h2>
        <p className="text-gray-400 mb-6 text-sm">
          Found a cool event? Add it so others can find teams for it.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-xs font-bold mb-2" htmlFor="name">Event Name *</label>
            <input type="text" id="name" value={formData.name} onChange={handleChange} required
              className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g., IvyHacks 2025" />
          </div>

          <div>
            <label className="block text-gray-300 text-xs font-bold mb-2" htmlFor="description">Description *</label>
            <textarea id="description" rows="3" value={formData.description} onChange={handleChange} required
              className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="What is this event about?" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-xs font-bold mb-2" htmlFor="startDate">Start Date *</label>
              <input type="date" id="startDate" value={formData.startDate} onChange={handleChange} required
                className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-bold mb-2" htmlFor="endDate">End Date *</label>
              <input type="date" id="endDate" value={formData.endDate} onChange={handleChange} required
                className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div>
             <label className="block text-gray-300 text-xs font-bold mb-2" htmlFor="externalUrl">Official Website URL</label>
             <input type="url" id="externalUrl" value={formData.externalUrl} onChange={handleChange}
               className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="https://..." />
          </div>

          <div>
             <label className="block text-gray-300 text-xs font-bold mb-2" htmlFor="bannerUrl">Banner Image URL (Optional)</label>
             <input type="url" id="bannerUrl" value={formData.bannerUrl} onChange={handleChange}
               className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="https://example.com/image.jpg" />
          </div>

          {error && <p className="text-red-500 text-xs italic">{error}</p>}

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-gray-300 hover:text-white transition">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded transition disabled:bg-gray-600">
              {loading ? 'Adding...' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddHackathonModal;