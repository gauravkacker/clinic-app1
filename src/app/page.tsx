import { getDashboardStats, getAppointmentsByDate, getAllFees } from "@/lib/actions";
import Link from "next/link";

export default async function Dashboard() {
  const stats = await getDashboardStats();
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = await getAppointmentsByDate(today);
  const recentFees = await getAllFees();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your clinic management system</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon="📅"
          color="blue"
          link="/appointments"
        />
        <StatCard
          title="Today's Revenue"
          value={`₹${stats.todayFees.toLocaleString()}`}
          icon="💰"
          color="green"
          link="/fees"
        />
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon="👥"
          color="purple"
          link="/patients"
        />
        <StatCard
          title="Pending Follow-ups"
          value={stats.pendingFollowUps}
          icon="⏰"
          color="orange"
          link="/cases"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton href="/patients/new" label="New Patient" icon="➕" />
          <QuickActionButton href="/appointments/new" label="Book Appointment" icon="📝" />
          <QuickActionButton href="/prescriptions/new" label="New Prescription" icon="💊" />
          <QuickActionButton href="/fees/collect" label="Collect Fees" icon="💵" />
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Today's Appointments</h2>
          <Link href="/appointments" className="text-indigo-600 hover:text-indigo-800 text-sm">
            View All →
          </Link>
        </div>
        {todayAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Token</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todayAppointments.slice(0, 10).map(({ appointment, patient }) => (
                  <tr key={appointment.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        #{appointment.tokenNo}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {patient?.firstName} {patient?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{patient?.regdNo}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {appointment.appointmentTime}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appointment.appointmentType === 'new' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {appointment.appointmentType === 'new' ? 'New' : 'Follow-up'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={appointment.appointmentStatus} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link 
                        href={`/appointments/${appointment.id}`}
                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">📭</p>
            <p>No appointments scheduled for today</p>
            <Link href="/appointments/new" className="text-indigo-600 hover:text-indigo-800 mt-2 inline-block">
              Book an appointment
            </Link>
          </div>
        )}
      </div>

      {/* Recent Fees */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Payments</h2>
          <Link href="/fees" className="text-indigo-600 hover:text-indigo-800 text-sm">
            View All →
          </Link>
        </div>
        {recentFees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentFees.slice(0, 5).map(({ fee, patient }) => (
                  <tr key={fee.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">
                      {fee.receiptNo}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {patient?.firstName} {patient?.lastName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {fee.feeType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{fee.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {fee.feeDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">💵</p>
            <p>No recent payments</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, link }: { 
  title: string; 
  value: string | number; 
  icon: string; 
  color: string;
  link: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <Link href={link} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-lg p-3 ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Link>
  );
}

function QuickActionButton({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link 
      href={href}
      className="flex flex-col items-center justify-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
    >
      <span className="text-2xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-indigo-700">{label}</span>
    </Link>
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
