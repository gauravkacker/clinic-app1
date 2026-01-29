import { getAllAppointments, getAppointmentsByDate } from "@/lib/actions";
import { db } from "@/db";
import { appointments, patients } from "@/db/schema";
import { desc, asc, eq } from "drizzle-orm";
import Link from "next/link";
import { cancelAppointment, completeAppointment } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage({ searchParams }: { searchParams: { date?: string } }) {
  const selectedDate = searchParams.date || new Date().toISOString().split('T')[0];
  
  const appointmentsData = await db
    .select({
      appointment: appointments,
      patient: patients,
    })
    .from(appointments)
    .leftJoin(patients, eq(appointments.patientId, patients.id))
    .where(eq(appointments.appointmentDate, selectedDate))
    .orderBy(asc(appointments.tokenNo));

  const allAppointments = await getAllAppointments();

  // Group by date for calendar view
  const appointmentsByDate: Record<string, number> = {};
  allAppointments.forEach(({ appointment }) => {
    const date = appointment.appointmentDate;
    appointmentsByDate[date] = (appointmentsByDate[date] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage patient appointments</p>
        </div>
        <Link
          href="/appointments/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
        >
          + New Appointment
        </Link>
      </div>

      {/* Date Navigation */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <Link
            href={`/appointments?date=${new Date(Date.now() - 86400000).toISOString().split('T')[0]}`}
            className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
          >
            ← Previous Day
          </Link>
          <div className="text-center">
            <input
              type="date"
              defaultValue={selectedDate}
              onChange={(e) => {
                window.location.href = `/appointments?date=${e.target.value}`;
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <Link
            href={`/appointments?date=${new Date(Date.now() + 86400000).toISOString().split('T')[0]}`}
            className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
          >
            Next Day →
          </Link>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{appointmentsData.length}</p>
          <p className="text-sm text-blue-600">Total Appointments</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {appointmentsData.filter(a => a.appointment.appointmentStatus === 'completed').length}
          </p>
          <p className="text-sm text-green-600">Completed</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {appointmentsData.filter(a => a.appointment.appointmentStatus === 'scheduled').length}
          </p>
          <p className="text-sm text-yellow-600">Scheduled</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-600">
            {appointmentsData.filter(a => a.appointment.appointmentStatus === 'cancelled').length}
          </p>
          <p className="text-sm text-red-600">Cancelled</p>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Appointments for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h2>
        </div>
        {appointmentsData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Token</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointmentsData.map(({ appointment, patient }) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-800 font-bold text-lg">
                        #{appointment.tokenNo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {patient?.firstName} {patient?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{patient?.regdNo}</div>
                      <div className="text-sm text-gray-500">{patient?.mobileNo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {appointment.appointmentTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appointment.appointmentType === 'new' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {appointment.appointmentType === 'new' ? 'New' : 'Follow-up'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {appointment.visitType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={appointment.appointmentStatus} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-3">
                        {appointment.appointmentStatus === 'scheduled' && (
                          <>
                            <Link
                              href={`/cases/new?patientId=${appointment.patientId}&appointmentId=${appointment.id}`}
                              className="text-green-600 hover:text-green-900"
                            >
                              Start Case
                            </Link>
                            <form action={async () => {
                              'use server';
                              await completeAppointment(appointment.id);
                            }}>
                              <button className="text-blue-600 hover:text-blue-900">
                                Complete
                              </button>
                            </form>
                          </>
                        )}
                        <Link
                          href={`/patients/${patient?.regdNo}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Patient
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">📅</p>
            <p className="text-gray-500 text-lg">No appointments for this date</p>
            <Link
              href="/appointments/new"
              className="text-indigo-600 hover:text-indigo-800 mt-2 inline-block"
            >
              Book an appointment
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusClasses: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    rescheduled: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
