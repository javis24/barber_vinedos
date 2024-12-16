import React, { useState, useEffect } from "react";

const StyledDateTimePicker = () => {
  const [selectedDate, setSelectedDate] = useState(""); // Fecha seleccionada
  const [stationTimes, setStationTimes] = useState({
    Jesualdo: [],
    "Estacion-2": [],
    "Estacion-3": [],
  });
  const [selectedTimes, setSelectedTimes] = useState({
    Jesualdo: "",
    "Estacion-2": "",
    "Estacion-3": "",
  });
  const [userData, setUserData] = useState({ name: "", phone: "" });
  const [showPopup, setShowPopup] = useState(false);

  const stationMap = {
    Jesualdo: 1,
    "Estacion-2": 2,
    "Estacion-3": 3,
  };

  // Actualiza los horarios reservados cuando cambia la fecha
  useEffect(() => {
    if (selectedDate) {
      fetchReservedTimesForStations();
    }
  }, [selectedDate]);

  const fetchReservedTimesForStations = async () => {
    const newStationTimes = {};
    try {
      for (const station in stationMap) {
        const stationId = stationMap[station];
        const response = await fetch(
          `/api/appointments?station=${stationId}&date=${selectedDate}`
        );

        const data = await response.json();

        if (response.ok && Array.isArray(data.appointments)) {
          const reservedTimes = data.appointments.map((app) =>
            app.datetime.slice(0, 19) // Recorta la fecha para ignorar milisegundos
          );

          // Genera los horarios disponibles
          const availableTimes = generateAvailableTimes(selectedDate, reservedTimes);
          newStationTimes[station] = availableTimes;
        } else {
          console.warn(`No hay horarios para ${station}`);
          newStationTimes[station] = [];
        }
      }
      setStationTimes(newStationTimes);
    } catch (error) {
      console.error("Error al cargar los horarios:", error);
    }
  };

  const generateAvailableTimes = (date, reservedTimes) => {
    const times = [];
    const startHour = 11; // Inicio de horario (11 AM)
    const endHour = 20; // Fin de horario (8 PM)

    for (let hour = startHour; hour < endHour; hour++) {
      const datetime = `${date}T${hour.toString().padStart(2, "0")}:00:00`;
      const isReserved = reservedTimes.includes(datetime);

      times.push({
        datetime,
        label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`,
        disabled: isReserved,
      });
    }
    return times;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || Object.values(selectedTimes).every((time) => time === "")) {
      alert("Por favor completa todos los campos antes de continuar");
      return;
    }
    setShowPopup(true);
  };

  const handleConfirm = async () => {
    if (!userData.name || !userData.phone) {
      alert("Por favor ingresa tu nombre y número de teléfono");
      return;
    }

    try {
      for (const station in selectedTimes) {
        const time = selectedTimes[station];
        if (!time) continue;

        const response = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: userData.name,
            phone: userData.phone,
            datetime: time,
            station: stationMap[station],
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          alert(`Error al agendar cita para ${station}: ${data.error}`);
        }
      }

      alert("¡Citas agendadas con éxito!");
      setShowPopup(false);
      setUserData({ name: "", phone: "" });
      setSelectedTimes({ Jesualdo: "", "Estacion-2": "", "Estacion-3": "" });
      fetchReservedTimesForStations();
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
    }
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
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2 mb-4 bg-transparent border border-gray-300 rounded-lg text-green-500"
            min={new Date().toISOString().split("T")[0]}
            required
          />

          {Object.keys(stationMap).map((station) => (
            <div key={station} className="mb-4">
              <label className="block text-white mb-2">{station}</label>
              <select
                value={selectedTimes[station]}
                onChange={(e) =>
                  setSelectedTimes({ ...selectedTimes, [station]: e.target.value })
                }
                className="w-full px-4 py-2 bg-transparent border border-gray-300 rounded-lg text-green-500"
              >
                <option value="">Selecciona un horario</option>
                {stationTimes[station]?.map((slot, index) => (
                  <option
                    key={index}
                    value={slot.datetime}
                    disabled={slot.disabled}
                  >
                    {slot.label} {slot.disabled ? "(Reservado)" : ""}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <button
            type="submit"
            className="mt-4 w-full py-2 bg-green-500 text-white rounded-lg"
          >
            Confirmar Cita
          </button>
        </form>
      )}

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
              placeholder="Teléfono"
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

export default StyledDateTimePicker;
