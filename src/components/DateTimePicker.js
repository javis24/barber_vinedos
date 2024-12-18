import React, { useState, useEffect } from 'react';

const CreateReservation = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStation, setSelectedStation] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [userData, setUserData] = useState({ name: '', phone: '' });
  const [showPopup, setShowPopup] = useState(false);

  const stationOptions = ['Estación-1', 'Estación-2', 'Estación-3'];

  // Obtener horarios disponibles cuando se selecciona estación y fecha
  useEffect(() => {
    if (selectedDate && selectedStation) {
      fetchAvailableTimes();
    } else {
      setAvailableTimes([]); // Limpiar horarios si falta algún campo
      setSelectedTime('');
    }
  }, [selectedDate, selectedStation]);

  const fetchAvailableTimes = async () => {
    try {
      const response = await fetch(
        `/api/appointments/available?date=${selectedDate}&station=${selectedStation}`
      );
      const data = await response.json();
      setAvailableTimes(data.times || []);
    } catch (error) {
      console.error('Error al obtener horarios disponibles:', error);
      alert('No se pudieron cargar los horarios. Intente nuevamente.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedStation || !selectedTime) {
      alert('Por favor, completa todos los campos antes de continuar.');
      return;
    }
    setShowPopup(true);
  };

  const handleConfirm = async () => {
    const reservationData = {
      date: selectedDate,
      station: selectedStation,
      time: selectedTime,
      name: userData.name,
      phone: userData.phone,
    };

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData),
      });

      if (response.ok) {
        alert('Reserva confirmada con éxito');
        resetForm();
      } else {
        alert('Error al crear la reserva');
      }
    } catch (error) {
      console.error('Error al crear la reserva:', error);
    }
  };

  const resetForm = () => {
    setShowPopup(false);
    setSelectedDate('');
    setSelectedStation('');
    setSelectedTime('');
    setAvailableTimes([]);
    setUserData({ name: '', phone: '' });
  };

  return (
    <div className="grid place-items-center p-8">
      {!showPopup && (
        <form
          className="w-80 p-6 bg-gray-900 shadow-lg rounded-lg"
          onSubmit={handleSubmit}
        >
          <h1 className="text-green-500 font-semibold text-2xl mb-4">
            Selecciona Fecha y Horario
          </h1>

          {/* Input de Fecha */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2 mb-4 bg-transparent border border-gray-300 rounded-lg text-green-500"
            min={new Date().toISOString().split('T')[0]}
            required
          />

          {/* Selección de Estación */}
          <div className="mb-4">
            <label className="block text-white mb-2">Estación</label>
            <select
              value={selectedStation}
              onChange={(e) => {
                setSelectedStation(e.target.value);
                setSelectedTime(''); // Reiniciar la hora seleccionada
              }}
              className="w-full px-4 py-2 bg-transparent border border-gray-300 rounded-lg text-green-500"
            >
              <option value="">Selecciona una estación</option>
              {stationOptions.map((station, index) => (
                <option key={index} value={station}>
                  {station}
                </option>
              ))}
            </select>
          </div>

          {/* Horarios Disponibles */}
          {availableTimes.length > 0 && (
            <div className="mb-4">
              <label className="block text-white mb-2">Horarios Disponibles</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-4 py-2 bg-transparent border border-gray-300 rounded-lg text-green-500"
                required
              >
                <option value="">Selecciona un horario</option>
                {availableTimes.map((time, index) => (
                  <option key={index} value={time.time} disabled={time.reserved}>
                    {time.time} {time.reserved ? '(Reservado)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Botón Confirmar */}
          <button
            type="submit"
            className="mt-4 w-full py-2 bg-green-500 text-white rounded-lg"
          >
            Confirmar Citaa
          </button>
        </form>
      )}

      {/* Popup de Confirmación */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-80 p-6 bg-gray-900 rounded-lg text-center">
            <h2 className="text-green-500 font-semibold text-2xl mb-4">
              Detalles de la Cita
            </h2>
            <input
              type="text"
              placeholder="Nombre"
              value={userData.name}
              onChange={(e) =>
                setUserData({ ...userData, name: e.target.value })
              }
              className="w-full mb-4 px-4 py-2 bg-transparent border border-gray-300 rounded-lg text-green-500"
              required
            />
            <input
              type="text"
              placeholder="Teléfono WhatsApp"
              value={userData.phone}
              onChange={(e) =>
                setUserData({ ...userData, phone: e.target.value })
              }
              className="w-full px-4 py-2 bg-transparent border border-gray-300 rounded-lg text-green-500"
              required
            />
            <button
              onClick={handleConfirm}
              className="mt-4 w-full py-2 bg-green-500 text-white rounded-lg"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateReservation;
