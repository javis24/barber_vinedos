import React, { useState, useEffect } from 'react';

const StyledDateTimePicker = () => {
  const [dateOptions, setDateOptions] = useState([]); // Horarios disponibles
  const [selectedDateTime, setSelectedDateTime] = useState(''); // Horario seleccionado
  const [showPopup, setShowPopup] = useState(false); // Estado para mostrar el popup
  const [showSummary, setShowSummary] = useState(false); // Estado para mostrar el resumen
  const [userData, setUserData] = useState({ name: '', phone: '' }); // Datos del usuario

  // Obtener horarios disponibles al cargar el componente
  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch('/api/appointments?slots=true'); // Endpoint para obtener horarios disponibles
      const data = await response.json();
      if (response.ok) {
        setDateOptions(data.slots); // Establecer horarios disponibles
      } else {
        console.error('Error al obtener horarios:', data.error);
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDateTime) {
      alert('Por favor selecciona un horario');
      return;
    }
    setShowPopup(true); // Mostrar popup para capturar datos adicionales
  };

  // Confirmar y guardar la cita
  const handleConfirm = async () => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          phone: userData.phone,
          datetime: selectedDateTime,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('¡Cita agendada con éxito!');
        setShowPopup(false);
        setShowSummary(true); // Mostrar resumen de la cita
      } else {
        alert(data.error || 'Error al agendar la cita.');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      alert('Error al conectar con el servidor.');
    }
  };

  // Calcular la hora límite para cancelar la cita
  const calculateCancelDeadline = () => {
    const appointmentDate = new Date(selectedDateTime);
    appointmentDate.setMinutes(appointmentDate.getMinutes() - 30);
    return appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="grid place-items-center p-8">
      {/* Formulario principal */}
      {!showSummary && (
        <form
          className="w-80 h-[472px] p-6 bg-gray-900 shadow-[0_15px_60px] shadow-green-500 outline outline-1 outline-green-600 rounded-lg"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col items-center text-center mb-10">
            <h1 className="text-green-500 font-semibold text-4xl">Agendar Cita</h1>
            <p className="text-white text-lg mt-4">Seleccione Fecha y Hora</p>
          </div>
          <div className="space-y-6">
            <div className="relative w-full">
              <select
                className="w-full px-4 py-3 bg-transparent border border-gray-300 rounded-lg text-green-500 text-sm outline-none focus:border-green-500"
                value={selectedDateTime}
                onChange={(e) => setSelectedDateTime(e.target.value)}
                required
              >
                <option value="">Seleccione una opción</option>
                {dateOptions.map((option, index) => (
                  <option key={index} value={option.datetime} className="text-black">
                    {option.label} {/* Mostrar la fecha y hora en formato legible */}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="w-full py-3 text-green-500 font-semibold text-lg bg-transparent border border-green-500 rounded-lg transition-all duration-300 hover:bg-green-500 hover:text-gray-900"
            >
              Confirmar Cita
            </button>
          </div>
        </form>
      )}

      {/* Popup para capturar datos adicionales */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-80 p-6 bg-gray-900 shadow-lg rounded-lg text-center">
            <h2 className="text-green-500 font-semibold text-2xl mb-4">Detalles de la Cita</h2>
            <p className="text-white mb-4">Fecha y Hora: {selectedDateTime}</p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className="w-full px-4 py-2 bg-transparent border border-gray-300 rounded-lg text-green-500 text-sm outline-none focus:border-green-500"
                required
              />
              <input
                type="text"
                placeholder="Número de Celular"
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                className="w-full px-4 py-2 bg-transparent border border-gray-300 rounded-lg text-green-500 text-sm outline-none focus:border-green-500"
                required
              />
            </div>
            <div className="flex justify-around mt-6">
              <button
                onClick={() => setShowPopup(false)}
                className="py-2 px-4 bg-transparent border border-gray-300 text-white rounded-lg hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="py-2 px-4 bg-green-500 text-gray-900 font-semibold rounded-lg hover:bg-green-600"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resumen de la cita */}
      {showSummary && (
        <div className="w-80 p-6 bg-gray-900 shadow-lg rounded-lg text-center">
          <h2 className="text-green-500 font-semibold text-2xl mb-4">Resumen de la Cita</h2>
          <p className="text-white mb-2">Fecha y Hora: {selectedDateTime}</p>
          <p className="text-white mb-2">Nombre: {userData.name}</p>
          <p className="text-white mb-2">Número de Celular: {userData.phone}</p>
          <p className="text-yellow-400 mt-4">
            Puedes cancelar tu cita hasta las {calculateCancelDeadline()} el día de la cita.
          </p>
        </div>
      )}
    </div>
  );
};

export default StyledDateTimePicker;
