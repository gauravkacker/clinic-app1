import { db } from "@/db";
import { patients, appointments, fees, cases, prescriptions } from "@/db/schema";
import { desc, gte, lte, eq, sql, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const today = new Date().toISOString().split('T')[0];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

  // Get statistics
  const [totalPatientsResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(patients);

  const [newPatientsThisMonth] = await db
    .select({ count: sql<number>`count(*)` })
    .from(patients)
    .where(gte(patients.registrationDate, startOfMonth));

  const [totalAppointmentsResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(appointments);

  const [appointmentsThisMonth] = await db
    .select({ count: sql<number>`count(*)` })
    .from(appointments)
    .where(and(gte(appointments.appointmentDate, startOfMonth), lte(appointments.appointmentDate, endOfMonth)));

  const [totalCasesResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(cases);

  const [casesThisMonth] = await db
    .select({ count: sql<number>`count(*)` })
    .from(cases)
    .where(gte(cases.createdAt, startOfMonth));

  const [totalPrescriptionsResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(prescriptions);

  const [prescriptionsThisMonth] = await db
    .select({ count: sql<number>`count(*)` })
    .from(prescriptions)
    .where(gte(prescriptions.createdAt, startOfMonth));

  // Get monthly revenue
  const [monthlyRevenue] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${fees.amount}), 0)`,
    })
    .from(fees)
    .where(and(gte(fees.feeDate, startOfMonth), lte(fees.feeDate, endOfMonth)));

  // Get daily revenue for chart (last 7 days)
  const last7DaysRevenue = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    const [dayRevenue] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${fees.amount}), 0)`,
      })
      .from(fees)
      .where(eq(fees.feeDate, date));
    last7DaysRevenue.push({
      date,
      label: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      amount: dayRevenue?.total || 0,
    });
  }

  const maxAmount = Math.max(...last7DaysRevenue.map(d => d.amount), 1);

  // Get revenue by fee type
  const revenueByType = await db
    .select({
      feeType: fees.feeType,
      total: sql<number>`COALESCE(SUM(${fees.amount}), 0)`,
    })
    .from(fees)
    .where(and(gte(fees.feeDate, startOfMonth), lte(fees.feeDate, endOfMonth)))
    .groupBy(fees.feeType);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">Clinic analytics and statistics</p>
      </div>

      {/* Monthly Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Monthly Overview - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{newPatientsThisMonth?.count || 0}</p>
            <p className="text-sm text-blue-600">New Patients</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">₹{(monthlyRevenue?.total || 0).toLocaleString()}</p>
            <p className="text-sm text-green-600">Revenue</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{appointmentsThisMonth?.count || 0}</p>
            <p className="text-sm text-purple-600">Appointments</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-3xl font-bold text-orange-600">{casesThisMonth?.count || 0}</p>
            <p className="text-sm text-orange-600">Cases</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue (Last 7 Days)</h2>
          <div className="space-y-3">
            {last7DaysRevenue.map((day) => (
              <div key={day.date} className="flex items-center">
                <span className="w-12 text-sm text-gray-500">{day.label}</span>
                <div className="flex-1 mx-4">
                  <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${Math.max((day.amount / maxAmount) * 100, 1)}%`
                      }}
                    />
                  </div>
                </div>
                <span className="w-20 text-right text-sm font-medium">₹{day.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Fee Type</h2>
          <div className="space-y-4">
            {revenueByType.map((item) => (
              <div key={item.feeType} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-3 ${
                    item.feeType === 'new_patient' ? 'bg-green-500' :
                    item.feeType === 'followup' ? 'bg-blue-500' :
                    'bg-orange-500'
                  }`} />
                  <span className="capitalize">{item.feeType?.replace('_', ' ')}</span>
                </div>
                <span className="font-medium">₹{(item.total || 0).toLocaleString()}</span>
              </div>
            ))}
            {revenueByType.length === 0 && (
              <p className="text-gray-500 text-center">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* All-time Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All-time Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-700">{totalPatientsResult?.count || 0}</p>
            <p className="text-sm text-gray-600">Total Patients</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-700">{totalAppointmentsResult?.count || 0}</p>
            <p className="text-sm text-gray-600">Total Appointments</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-700">{totalCasesResult?.count || 0}</p>
            <p className="text-sm text-gray-600">Total Cases</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-700">{totalPrescriptionsResult?.count || 0}</p>
            <p className="text-sm text-gray-600">Total Prescriptions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
