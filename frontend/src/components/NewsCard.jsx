import React from 'react';
import { Calendar } from 'lucide-react';

const NewsCard = ({ data }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
      <div className={`h-48 w-full ${data.img} flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform duration-500`}>
        {/* Placeholder for Image */}
        <span className="text-sm">Image Placeholder</span>
      </div>
      <div className="p-5">
        <div className="flex items-center text-xs text-red-800 font-bold mb-2 uppercase tracking-wider">
          <span className="bg-red-50 px-2 py-0.5 rounded">{data.tag}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-3 leading-snug line-clamp-2 group-hover:text-red-800 transition-colors">
          {data.title}
        </h3>
        <div className="flex items-center text-gray-400 text-sm">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{data.date}</span>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;