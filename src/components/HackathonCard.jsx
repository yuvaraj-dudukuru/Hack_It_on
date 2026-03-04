import React from 'react';
import { Link } from 'react-router-dom';

// This is a "presentational" component. It just receives data (props)
// and displays it. It has no logic of its own.

function HackathonCard({ hackathon }) {
  // The 'hackathon' prop will be an object like:
  // { id: "...", name: "...", description: "...", startDate: "..." }

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-green-400 mb-2">{hackathon.name}</h2>
        <p className="text-gray-300 mb-4 h-20 overflow-hidden">
          {hackathon.description}
        </p>
        
        <div className="flex justify-between items-center text-sm text-gray-400 mb-6">
          <span>
            <strong>Starts:</strong> {hackathon.startDate}
          </span>
          <span>
            <strong>Ends:</strong> {hackathon.endDate}
          </span>
        </div>

        <Link
          to={`/hackathon/${hackathon.id}`}
          className="w-full text-center block bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none transition duration-300"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default HackathonCard;