// components/SectionWithCards.js
import React from "react";


const SectionWithCards = () => {
  return (
    <div className="min-h-screen bg-black px-6 py-12 flex flex-col items-center">
      {/* Título */}
      <h2 className="text-4xl lg:text-5xl font-bold text-yellow-500 mb-12 text-center">
        BARBER VIÑEDOS CONOCE NUESTROS SERVICIOS 
      </h2>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Card 1 */}
        <div
          className="bg-cover bg-center shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition duration-300"
          style={{
            backgroundImage: "url('/img/card_1.png')", // Imagen de fondo de la card 1
          }}
        >
          <div className="bg-black bg-opacity-50 p-6 h-full flex flex-col justify-between">
            <h3 className="text-2xl font-semibold text-yellow-500 mb-2">
              CORTE DE CABELLO
            </h3>
            <p className="text-gray-300 mb-4">
           
            </p>
            <button className="bg-yellow-500 text-black py-2 px-4 rounded-lg font-semibold hover:bg-yellow-600 transition">
              AGENDA TU CITA
            </button>
          </div>
        </div>

        {/* Card 2 */}
        <div
          className="bg-cover bg-center shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition duration-300"
          style={{
            backgroundImage: "url('/img/card_2.png')", // Imagen de fondo de la card 2
          }}
        >
          <div className="bg-black bg-opacity-50 p-6 h-full flex flex-col justify-between">
            <h3 className="text-2xl font-semibold text-yellow-500 mb-2">
              BARBA
            </h3>
            <p className="text-gray-300 mb-4">
            
            </p>
            <button className="bg-yellow-500 text-black py-2 px-4 rounded-lg font-semibold hover:bg-yellow-600 transition">
            AGENDA TU CITA
            </button>
          </div>
        </div>

        {/* Card 3 */}
        <div
          className="bg-cover bg-center shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition duration-300"
          style={{
            backgroundImage: "url('/img/card_3.png')", // Imagen de fondo de la card 3
          }}
        >
          <div className="bg-black bg-opacity-50 p-6 h-full flex flex-col justify-between">
            <h3 className="text-2xl font-semibold text-yellow-500 mb-2">
              SERVICIOS PREMIUM
            </h3>
            <p className="text-gray-300 mb-4">
              
            </p>
            <button className="bg-yellow-500 text-black py-2 px-4 rounded-lg font-semibold hover:bg-yellow-600 transition">
            AGENDA TU CITA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionWithCards;
