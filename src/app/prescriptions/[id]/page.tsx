import { db } from "@/db";
import { prescriptions, patients, cases } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getClinicSettings } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function PrescriptionDetailPage({ params }: { params: { id: string } }) {
  const prescriptionId = parseInt(params.id);
  
  const prescription = await db
    .select({
      prescription: prescriptions,
      patient: patients,
    })
    .from(prescriptions)
    .leftJoin(patients, eq(prescriptions.patientId, patients.id))
    .where(eq(prescriptions.id, prescriptionId))
    .limit(1);

  if (!prescription[0]) {
    notFound();
  }

  const { prescription: rx, patient } = prescription[0];
  const clinicSettings = await getClinicSettings();

  // Parse medicines from JSON string
  let medicinesList: string[] = [];
  try {
    medicinesList = JSON.parse(rx.medicines);
  } catch {
    medicinesList = [rx.medicines];
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <Link href="/prescriptions" className="text-indigo-600 hover:text-indigo-800 text-sm mb-2 inline-block">
          ← Back to Prescriptions
        </Link>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium print:hidden"
          >
            🖨️ Print
          </button>
          <button
            onClick={() => {
              const content = document.getElementById('prescription-content');
              if (content) {
                const printWindow = window.open('', '_blank');
                printWindow?.document.write(content.innerHTML);
                printWindow?.document.close();
                printWindow?.print();
              }
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium print:hidden"
          >
            📄 PDF
          </button>
        </div>
      </div>

      {/* Prescription Print View */}
      <div id="prescription-content" className="bg-white rounded-lg shadow p-8 print:shadow-none print:p-0">
        {/* Clinic Header */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {clinicSettings?.clinicName || "Homoeopathic Clinic"}
          </h1>
          <p className="text-gray-600">
            {clinicSettings?.doctorName || "Dr. "} {clinicSettings?.qualification && `(${clinicSettings.qualification})`}
          </p>
          {clinicSettings?.address && (
            <p className="text-gray-500 text-sm">{clinicSettings.address}</p>
          )}
          {clinicSettings?.phone && (
            <p className="text-gray-500 text-sm">Ph: {clinicSettings.phone}</p>
          )}
        </div>

        {/* Prescription Info */}
        <div className="flex justify-between mb-6">
          <div>
            <p className="font-medium">Patient: {patient?.firstName} {patient?.lastName}</p>
            <p className="text-gray-600">Regd No: {patient?.regdNo}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">RX No: {rx.prescriptionNo}</p>
            <p className="text-gray-600">Date: {new Date(rx.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Medicines Table */}
        <div className="mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="text-left py-2 w-12">Sr</th>
                <th className="text-left py-2">Medicine</th>
                <th className="text-left py-2 w-32">Potency</th>
                <th className="text-left py-2">Dosage</th>
              </tr>
            </thead>
            <tbody>
              {medicinesList.map((medicine, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-3">{index + 1}</td>
                  <td className="py-3 font-medium">{medicine}</td>
                  <td className="py-3">{rx.dosage || "-"}</td>
                  <td className="py-3">{rx.frequency || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dosage Instructions */}
        {rx.dosage && (
          <div className="mb-4">
            <p className="font-medium">Dosage: {rx.dosage}</p>
          </div>
        )}

        {rx.frequency && (
          <div className="mb-4">
            <p className="font-medium">Frequency: {rx.frequency}</p>
          </div>
        )}

        {rx.duration && (
          <div className="mb-4">
            <p className="font-medium">Duration: {rx.duration}</p>
          </div>
        )}

        {rx.instructions && (
          <div className="mb-6">
            <p className="font-medium">Instructions:</p>
            <p className="text-gray-700">{rx.instructions}</p>
          </div>
        )}

        {/* Auto Text */}
        {rx.autoText && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <pre className="whitespace-pre-wrap text-sm font-mono">{rx.autoText}</pre>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300">
          <div className="flex justify-between">
            <div>
              {rx.language === "hindi" ? (
                <p className="text-gray-600 text-sm">
                  आगे की दवाई लेने से पहले अपने डॉक्टर से सलाह लें।
                </p>
              ) : (
                <p className="text-gray-600 text-sm">
                  Consult your doctor before taking further medicines.
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-medium">{clinicSettings?.doctorName || "Dr. "}</p>
              <p className="text-gray-500 text-sm">Signature</p>
            </div>
          </div>
        </div>

        {clinicSettings?.footerText && (
          <p className="text-center text-gray-500 text-xs mt-4">{clinicSettings.footerText}</p>
        )}
      </div>
    </div>
  );
}
