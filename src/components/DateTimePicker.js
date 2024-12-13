import React, { useState, useEffect } from "react";

const StyledDateTimePicker = () => {
  const [selectedDate, setSelectedDate] = useState(""); // Fecha seleccionada
  const [timeOptions, setTimeOptions] = useState([]); // Horarios disponibles según la fecha
  const [reservedTimes, setReservedTimes] = useState([]); // Horarios ya reservados
  const [selectedTime, setSelectedTime] = useState(""); // Horario seleccionado
  const [selectedStation, setSelectedStation] = useState(""); // Estación seleccionada
  const [showPopup, setShowPopup] = useState(false); // Popup para datos adicionales
  const [userData, setUserData] = useState({ name: "", phone: "" }); // Datos del usuario

  useEffect(() => {
    if (selectedDate && selectedStation) {
      fetchReservedTimes();
    }
  }, [selectedDate, selectedStation]);

  const fetchReservedTimes = async () => {
    try {
      const response = await fetch(
        `/api/appointments?station=${selectedStation}&date=${selectedDate}`
      );
      const data = await response.json();
      if (response.ok) {
        setReservedTimes(data.appointments || []);
        generateAvailableTimes(selectedDate, data.appointments || []);
      } else {
        console.error("Error al obtener horarios reservados:", data.error);
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
    }
  };

  const generateAvailableTimes = (date, reserved) => {
    const times = [];
    const dayOfWeek = new Date(date).getDay();
    const start = "11:00";
    const end = dayOfWeek === 0 ? "18:00" : "21:00";

    let currentTime = new Date(`${date}T${start}:00-06:00`);
    const limit = new Date(`${date}T${end}:00-06:00`);

    while (currentTime < limit) {
      const datetimeISO = currentTime.toISOString();
      times.push({
        value: datetimeISO,
        label: new Intl.DateTimeFormat("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(currentTime),
        disabled: reserved.some((r) => r.datetime === datetimeISO),
      });
      currentTime = new Date(currentTime.getTime() + 60 * 60000);
    }

    setTimeOptions(times);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !selectedStation) {
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
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userData.name,
          phone: userData.phone,
          datetime: selectedTime,
          station: selectedStation,
        }),
      });

      if (response.ok) {
        alert("¡Cita agendada con éxito!");

        // Formatear la fecha y hora para el mensaje de WhatsApp
        const formattedDate = new Date(selectedTime).toLocaleString("es-MX", {
          timeZone: "America/Mexico_City",
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        // Crear el mensaje para WhatsApp
        const message = `Nueva cita agendada:
  - Nombre: ${userData.name}
  - Teléfono: ${userData.phone}
  - Estación: ${selectedStation}
  - Día y hora: ${formattedDate}`;
        const adminPhone = "528711372181";
        const whatsappURL = `https://wa.me/${adminPhone}?text=${encodeURIComponent(
          message
        )}`;

        // Abrir WhatsApp en una nueva pestaña
        window.open(whatsappURL, "_blank");

        // Reiniciar el formulario y actualizar horarios
        setShowPopup(false);
        setUserData({ name: "", phone: "" });
        setSelectedStation("");
        setSelectedDate("");
        setSelectedTime("");
        fetchReservedTimes(); // Actualizar horarios reservados
      } else {
        const data = await response.json();
        alert(data.error || "Error al agendar la cita.");
      }
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
          <h1 className="text-green-500 font-semibold text-4xl mb-4">
            Selecciona la Estación, Fecha y Horario
          </h1>
          <div className="space-y-4">
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="w-full px-4 py-2 bg-transparent border border-gray-300 rounded-lg text-green-500"
              required
            >
              <option value="">Selecciona una estación</option>
              <option value="Jesualdo">Jesualdo</option>
              <option value="Estación 2">Estación 2</option>
              <option value="Estación 3">Estación 3</option>
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 bg-transparent border border-gray-300 rounded-lg text-green-500"
              min={new Date().toISOString().split("T")[0]}
              required
              disabled={!selectedStation}
            />

            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-4 py-2 bg-transparent border border-gray-300 rounded-lg text-green-500"
              required
              disabled={!selectedDate}
            >
              <option value="">Selecciona un horario</option>
              {timeOptions.map((option, index) => (
                <option key={index} value={option.value} disabled={option.disabled}>
                  {option.label} {option.disabled ? "(Reservado)" : ""}
                </option>
              ))}
            </select>
          </div>
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
