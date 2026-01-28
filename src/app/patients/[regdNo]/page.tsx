import { db } from "@/db";
import { patients, appointments, cases, prescriptions, fees } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PatientDetailPage({ params }: { params: { regdNo: string } }) {
  const patient = await db
    .select()
    .from(patients)
    .where(eq(patients.regdNo, params.regdNo))
    .limit(1);

  if (!patient[0]) {
    notFound();
  }

  const [patientAppointments, patientCases, patientPrescriptions, patientFees] = await Promise.all([
    db.select().from(appointments).where(eq(appointments.patientId, patient[0].id)).orderBy(desc(appointments.appointmentDate)),
    db.select().from(cases).where(eq(cases.patientId, patient[0].id)).orderBy(desc(cases.createdAt)),
    db.select().from(prescriptions).where(eq(prescriptions.patientId, patient[0].id)).orderBy(desc(prescriptions.createdAt)),
    db.select().from(fees).where(eq(fees.patientId, patient[0].id)).orderBy(desc(fees.createdAt)),
  ]);

  const totalFees = patientFees.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Link href="/patients" className="text-indigo-600 hover:text-indigo-800 text-sm mb-2 inline-block">
            ← Back to Patients
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {patient[0].firstName} {patient[0].lastName}
          </h1>
          <p className="text-gray-600 mt-1 font-mono">{patient[0].regdNo}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/appointments/new?patientId=${patient[0].id}&regdNo=${patient[0].regdNo}`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Book Appointment
          </Link>
          <Link
            href={`/cases/new?patientId=${patient[0].id}`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            New Case
          </Link>
        </div>
      </div>

      {/* Patient Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-500">Mobile</dt>
              <dd className="font-medium">{patient[0].mobileNo}</dd>
            </div>
            {patient[0].email && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Email</dt>
                <dd className="font-medium">{patient[0].email}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-500">Age</dt>
              <dd className="font-medium">{patient[0].age || "-"} years</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Gender</dt>
              <dd className="font-medium capitalize">{patient[0].gender || "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Occupation</dt>
              <dd className="font-medium">{patient[0].occupation || "-"}</dd>
            </div>
          </dl>
        </div>

        {/* Address Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-gray-500 text-sm">Full Address</dt>
              <dd className="font-medium">{patient[0].address || "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">City</dt>
              <dd className="font-medium">{patient[0].city || "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Pincode</dt>
              <dd className="font-medium">{patient[0].pincode || "-"}</dd>
            </div>
          </dl>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-500">Patient Type</dt>
              <dd>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  patient[0].isNewPatient ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                }`}>
                  {patient[0].isNewPatient ? "New" : "Follow-up"}
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Total Visits</dt>
              <dd className="font-medium">{patientAppointments.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Total Cases</dt>
              <dd className="font-medium">{patientCases.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Total Prescriptions</dt>
              <dd className="font-medium">{patientPrescriptions.length}</dd>
            </div>
            <div className="flex justify-between border-t pt-3">
              <dt className="text-gray-500">Total Fees Paid</dt>
              <dd className="font-bold text-green-600">₹{totalFees.toLocaleString()}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
            <Link href={`/appointments?patientId=${patient[0].id}`} className="text-indigo-600 text-sm">
              View All →
            </Link>
          </div>
          {patientAppointments.length > 0 ? (
            <div className="space-y-3">
              {patientAppointments.slice(0, 5).map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{apt.appointmentDate} at {apt.appointmentTime}</p>
                    <p className="text-sm text-gray-500">
                      Token #{apt.tokenNo} • {apt.appointmentType}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    apt.appointmentStatus === "completed" ? "bg-green-100 text-green-800" :
                    apt.appointmentStatus === "cancelled" ? "bg-red-100 text-red-800" :
                    "bg-blue-100 text-blue-800"
                  }`}>
                    {apt.appointmentStatus}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No appointments yet</p>
          )}
        </div>

        {/* Recent Cases */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Cases</h2>
            <Link href={`/cases?patientId=${patient[0].id}`} className="text-indigo-600 text-sm">
              View All →
            </Link>
          </div>
          {patientCases.length > 0 ? (
            <div className="space-y-3">
              {patientCases.slice(0, 5).map((caseItem) => (
                <div key={caseItem.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Case #{caseItem.caseNo}</p>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {caseItem.chiefComplaints || "No complaints recorded"}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      caseItem.isFollowUp ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                    }`}>
                      {caseItem.isFollowUp ? "Follow-up" : "Initial"}
                    </span>
                  </div>
                  {caseItem.prognosisStatus && (
                    <p className="text-sm text-gray-500 mt-2">
                      Prognosis: <span className="font-medium capitalize">{caseItem.prognosisStatus}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No cases yet</p>
          )}
        </div>
      </div>

      {/* Recent Prescriptions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Prescriptions</h2>
          <Link href={`/prescriptions?patientId=${patient[0].id}`} className="text-indigo-600 text-sm">
            View All →
          </Link>
        </div>
        {patientPrescriptions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">RX No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicines</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Language</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patientPrescriptions.slice(0, 5).map((rx) => (
                  <tr key={rx.id}>
                    <td className="px-4 py-3 font-mono text-sm">{rx.prescriptionNo}</td>
                    <td className="px-4 py-3 text-sm">{new Date(rx.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate">{rx.medicines}</td>
                    <td className="px-4 py-3 text-sm capitalize">{rx.language}</td>
                    <td className="px-4 py-3">
                      <Link href={`/prescriptions/${rx.id}`} className="text-indigo-600 hover:text-indigo-900 text-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No prescriptions yet</p>
        )}
      </div>
    </div>
  );
}
