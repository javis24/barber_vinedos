import { useEffect, useState } from "react";

export default function Registros() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("/api/appointments");
        const data = await response.json();

        if (response.ok) {
          console.log(data); // Verifica la respuesta aquí
          setAppointments(data.appointments);
        } else {
          alert("Error al cargar los registros");
        }
      } catch (error) {
        console.error("Error al cargar los registros:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const sendWhatsAppMessage = (phone, name) => {
    if (!phone) {
      alert("El número de teléfono no está disponible.");
      return;
    }

    const message = `Hola ${name}, queremos confirmar tu cita en nuestra barbería. Por favor responde este mensaje si tienes alguna duda.`;
    const whatsappURL = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white text-lg">Cargando registros...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-center text-3xl font-bold mb-8">Registros de Citas</h1>
      <div className="overflow-x-auto">
        <table className="table-auto w-full bg-gray-800 rounded-lg shadow-lg">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-4 py-2">Nombre del Cliente</th>
              <th className="px-4 py-2">Teléfono</th>
              <th className="px-4 py-2">Fecha y Hora de la Cita</th>
              <th className="px-4 py-2">Estatus de la Cita</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="border-t border-gray-600">
                <td className="px-4 py-2 text-center">
                  {appointment.Client ? appointment.Client.name : "N/A"}
                </td>
                <td className="px-4 py-2 text-center">
                  {appointment.Client ? appointment.Client.phone : "N/A"}
                </td>
                <td className="px-4 py-2 text-center">
                  {new Date(appointment.datetime).toLocaleString("es-MX", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-4 py-2 text-center capitalize">
                  {appointment.status}
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() =>
                      sendWhatsAppMessage(
                        appointment.Client?.phone,
                        appointment.Client?.name
                      )
                    }
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    WhatsApp
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
