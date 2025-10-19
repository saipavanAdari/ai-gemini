import React from 'react';

const Card = ({ image, onClick, selected }) => {
  return (
    <div
      onClick={onClick}
      className={`relative w-48 h-48 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 transform hover:scale-105 shadow-lg 
        ${selected
          ? 'border-4 border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-[2px]'
          : 'border-2 border-gray-700 bg-gradient-to-br from-gray-800/80 to-gray-900/70 backdrop-blur-md'
        }
      `}
    >
      <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-900">
        <img
          src={image}
          alt="card"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {selected && (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 backdrop-blur-[1px] rounded-2xl"></div>
      )}
    </div>
  );
};

export default Card;
