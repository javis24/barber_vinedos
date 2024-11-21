import React, { useState, useEffect } from "react";

const StyledDateTimePicker = () => {
  const [days, setDays] = useState([
    { value: "lunes", label: "Lunes" },
    { value: "martes", label: "Martes" },
    { value: "miercoles", label: "Miércoles" },
    { value: "jueves", label: "Jueves" },
    { value: "viernes", label: "Viernes" },
    { value: "sabado", label: "Sábado" },
  ]);
  const [day, setDay] = useState(""); // Día seleccionado
  const [timeOptions, setTimeOptions] = useState([]); // Horarios disponibles según el día
  const [reservedTimes, setReservedTimes] = useState([]); // Horarios ya reservados
  const [selectedTime, setSelectedTime] = useState(""); // Horario seleccionado
  const [showPopup, setShowPopup] = useState(false); // Popup para datos adicionales
  const [userData, setUserData] = useState({ name: "", phone: "" }); // Datos del usuario

  // Obtener horarios reservados al cargar el componente
  useEffect(() => {
    fetchReservedTimes();
  }, []);

  useEffect(() => {
    // Generar horarios según el día seleccionado
    if (day) {
      const availableTimes = generateAvailableTimes(day);
      setTimeOptions(availableTimes);
    }
  }, [day, reservedTimes]);

  const fetchReservedTimes = async () => {
    try {
      const response = await fetch("/api/appointments"); // Consulta a la API para obtener horarios reservados
      const data = await response.json();
      if (response.ok) {
        // Normaliza las fechas de los horarios reservados al formato ISO
        const times = data.appointments.map((appointment) =>
          new Date(appointment.datetime).toISOString()
        );
        setReservedTimes(times); // Guardar horarios reservados
      } else {
        console.error("Error al obtener horarios reservados:", data.error);
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
    }
  };
  
  const generateAvailableTimes = (selectedDay) => {
    const times = [];
    const start = "11:00";
    const end = selectedDay === "sabado" ? "18:30" : "19:30";
  
    // Determinar la fecha base del día seleccionado
    const currentDate = new Date();
    const dayOffset = days.findIndex((d) => d.value === selectedDay);
    currentDate.setDate(currentDate.getDate() + ((dayOffset + 1) - currentDate.getDay())); // Ajusta al día correcto
  
    const dateBase = currentDate.toISOString().split("T")[0]; // Fecha en formato YYYY-MM-DD
  
    let currentTime = new Date(`${dateBase}T${start}:00`);
    const limit = new Date(`${dateBase}T${end}:00`);
  
    while (currentTime <= limit) {
      const datetime = currentTime.toISOString(); // Formato ISO completo
  
      times.push({
        value: datetime,
        label: `${selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)} - ${currentTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        disabled: reservedTimes.includes(datetime), // Comparar con horarios reservados
      });
  
      currentTime = new Date(currentTime.getTime() + 30 * 60000); // Incrementar 30 minutos
    }
  
    return times;
  };
  
  

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!day || !selectedTime) {
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
      const selectedDateTimeUTC = new Date(selectedTime).toISOString();
  
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userData.name,
          phone: userData.phone,
          datetime: selectedDateTimeUTC,
        }),
      });
  
      if (response.ok) {
        alert("¡Cita agendada con éxito!");
  
        // Corregir formato de hora según zona horaria local
        const formattedDate = new Date(selectedTime).toLocaleString("es-MX", {
          timeZone: "America/Mexico_City",
          weekday: "long",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
  
        const message = `Nueva cita agendada:
          - Nombre: ${userData.name}
          - Teléfono: ${userData.phone}
          - Día y hora: ${formattedDate}`;
        const adminPhone = "528711372181";
        const whatsappURL = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
  
        // Abrir WhatsApp en una nueva pestaña
        window.open(whatsappURL);
  
        setShowPopup(false);
        setUserData({ name: "", phone: "" });
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
            Selecciona el Día y Horario
          </h1>
          <div className="space-y-4">
            {/* Selección de día */}
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full px-4 py-2 bg-transparent border border-gray-300 rounded-lg text-green-500"
              required
            >
              <option value="">Selecciona un día</option>
              {days.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Selección de horario */}
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-4 py-2 bg-transparent border border-gray-300 rounded-lg text-green-500"
              required
              disabled={!day} // Deshabilitar si no se selecciona un día
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

      {/* Popup para capturar datos */}
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
