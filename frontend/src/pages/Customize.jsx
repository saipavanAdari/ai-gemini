import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { userDataContext } from '../context/UserContext';
import { FaUpload } from "react-icons/fa6";
import { IoMdArrowRoundBack } from 'react-icons/io';

import image1 from '../assets/image1.png';
import image2 from '../assets/image2.png';
import image3 from '../assets/image3.png';
import image4 from '../assets/image4.png';
import image5 from '../assets/image5.png';
import image6 from '../assets/image6.png';
import image7 from '../assets/image7.png';

const initialImages = [image1, image2, image3, image4, image5, image6, image7];

const Customize = () => {
  const { setFrontendImage, setBackendImage, selectedImage, setSelectedImage } =
    useContext(userDataContext);

  const navigate = useNavigate();
  const [previewUrls, setPreviewUrls] = useState(initialImages.map((i) => i));

  const handleUpload = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);

      const newPreview = [...previewUrls];
      newPreview[index] = fileUrl;
      setPreviewUrls(newPreview);

      setBackendImage(file);
      setFrontendImage(null);
      setSelectedImage(fileUrl);
    }
  };

  const handleSelect = (img) => {
    setSelectedImage(img);
    navigate("/customize2");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 py-12 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)] pointer-events-none"></div>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-8 text-white hover:text-pink-300 transition-colors duration-300"
      >
        <IoMdArrowRoundBack size={26} />
        <span className="text-lg font-semibold tracking-wide">Back</span>
      </button>

      <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-400 drop-shadow-md">
        Customize Your Selection
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {previewUrls.map((img, index) => (
          <div
            key={index}
            className={`relative group flex flex-col items-center p-4 rounded-2xl transition-all duration-500 shadow-xl hover:shadow-2xl hover:scale-105 
              ${selectedImage === img
                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 border-4 border-pink-300'
                : 'bg-gray-900/40 border-2 border-gray-700/60 backdrop-blur-md'}
            `}
          >
            <Card image={img} onClick={() => handleSelect(img)} selected={selectedImage === img} />

            <label className="mt-4 w-14 h-14 rounded-full flex items-center justify-center border-2 border-pink-400 bg-gradient-to-br from-purple-600 to-pink-600 text-white text-2xl cursor-pointer hover:scale-110 hover:shadow-lg hover:shadow-pink-500/40 transition-all duration-300">
              <FaUpload />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUpload(e, index)}
              />
            </label>

            {selectedImage === img && (
              <span className="absolute top-3 right-3 text-xs font-semibold text-white bg-pink-600 px-2 py-1 rounded-full shadow-md">
                Selected
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Customize;
