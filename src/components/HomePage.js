import React from 'react';
import { useRouter } from 'next/router';


const HomePage = () => {
  const router = useRouter();

 // components/HomePage.js
const navigateToDateTimePicker = () => {
  router.push('/agenda');
};


  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-6"
      style={{
        backgroundImage: "url('/img/banner.png')", // Ruta de la imagen de fondo
      }}
    >
      <div className="max-w-7xl flex flex-col lg:flex-row items-center gap-10">
        {/* Texto */}
        <div className="text-center lg:text-left space-y-6 p-6 rounded-lg">
          <h1 className="text-4xl lg:text-6xl font-bold text-yellow-500">
            THE BARBER SHOP <br /> VIÑEDOS
          </h1>
          <p className="text-gray-300 text-lg"></p>
          <button
            className="bg-yellow-500 text-black py-3 px-6 rounded-lg font-semibold hover:bg-yellow-600 transition"
            onClick={navigateToDateTimePicker}
          >
            AGENDA TU CORTE
          </button>
        </div>

        {/* GIF */}
        <div className="flex justify-center">
          <img
            src="/img/gif.gif" // Ruta del GIF
            alt="Coffee Animation"
            className="max-w-sm lg:max-w-md"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
