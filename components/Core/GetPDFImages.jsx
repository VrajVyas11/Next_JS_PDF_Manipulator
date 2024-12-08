"use client";
import React, { useState } from 'react';
import Image from 'next/image';

const GetPDFImages = () => {
  const [imageFile, setImageFile] = useState(null);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setImageFile(file);
    } else {
      setError('Please upload a PDF file.');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setImageFile(file);
    } else {
      setError('Please upload a PDF file.');
    }
  };

  const handleContinue = async () => {
    setIsProcessing(true)
    const formData = new FormData();
    formData.append('pdf', imageFile);
    await fetch('/api/ExtractImages', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          const base64Images = data.images.map((image, index) => {
            const imageData = image.data;
            const byteNumbers = Object.values(imageData);
            const byteArray = new Uint8Array(byteNumbers);
            const base64String = btoa(Uint8ToString(byteArray));

            return { id: index, url: `data:image/jpeg;base64,${base64String}` };
          });

          setImages(base64Images);
          setError(null);
        }
      })
      .catch((err) => {
        console.error('Error uploading file:', err);
        setError('Error uploading file.');
      });
    setIsProcessing(false)
  };

  const Uint8ToString = (u8a) => {
    const CHUNK_SZ = 0x8000;
    let c = [];
    for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
      c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
    }
    return c.join('');
  };

  const handleImageError = (id) => {
    setImages((prevImages) => prevImages.filter((image) => image.id !== id));
  };

  // console.log(isProcessing)
  return (
    <div className="flex flex-col  items-center border-t-0 border-[1px] border-gray-200 w-full sm:w-fit mx-auto bg-opacity-40 bg-[#1a1a1a] backdrop-blur-lg shadow-inner rounded-3xl text-white mb-16">
      <div className="text-white mb-10 text-xl sm:text-2xl lg:text-3xl border-0 rounded-3xl rounded-b-none border-y-[1px] border-gray-200 text-center h-fit w-full backdrop-blur-lg bg-opacity-90 bg-[#1a1a1a] overflow-hidden font-extrabold tracking-wider shadow-[inset_0_0_30px_rgba(0,0,0,1)]">
        <h3 className="text-lg sm:text-xl lg:text-3xl font-extrabold px-6 sm:px-10 lg:px-16 w-full p-3 sm:p-4 lg:p-5 text-center rounded-t-3xl">
          Extract Images from PDF
        </h3>
      </div>
      <div
        className={`border-4 border-dashed p-4 sm:p-5 lg:p-6 h-28 sm:h-32 lg:h-36 rounded-lg w-[90%] sm:w-full max-w-sm lg:max-w-md bg-gray-800 flex items-center justify-center cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:border-blue-700 ${dragActive ? 'border-blue-400' : 'border-gray-600'
          }`}
        onDragOver={handleDrag}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input
          id="fileInput"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-gray-400 text-center text-sm sm:text-base">
          {imageFile ? imageFile.name : 'Drag & Drop or click to upload an image'}
        </p>
      </div>
      {imageFile && !isProcessing && (
        <button
          className="px-4 sm:px-6 lg:px-8 mt-6 lg:mt-10 py-2 sm:py-3 lg:py-4 w-fit bg-blue-500 text-white font-mono shadow-lg tracking-wide rounded-lg hover:bg-blue-600 transition duration-300 font-extrabold ease-in-out disabled:opacity-50"
          onClick={handleContinue}
        >
          Extract
        </button>
      )}
      {isProcessing && !error && (
        <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 mt-6 lg:mt-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <div className="grid grid-cols-1 mb-6 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-[90%] sm:w-[95%] lg:w-[600px] lg:px-4 mt-6 sm:mt-8 lg:mt-9">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative group border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="w-full aspect-square overflow-hidden">
              <Image
                src={image.url}
                alt={`PDF Image ${image.id}`}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                onError={() => handleImageError(image.id)}
                width={400}
                height={400}
              />
            </div>
            <div className="p-2 flex justify-center">
              <a
                href={image.url}
                download={`PDFImage_${image.id}.jpg`}
                className="mt-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md text-xs sm:text-sm font-semibold shadow-md hover:bg-blue-700 transition-colors duration-300"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>

  );
};

export default GetPDFImages;
