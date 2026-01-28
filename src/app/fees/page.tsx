import { getAllFees, getFeesSummary, getFeesByDateRange } from "@/lib/actions";
import Link from "next/link";
import { db } from "@/db";
import { fees, patients } from "@/db/schema";
import { desc, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function FeesPage({ searchParams }: { searchParams: { startDate?: string; endDate?: string } }) {
  const startDate = searchParams.startDate || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const endDate = searchParams.endDate || new Date().toISOString().split('T')[0];

  const feesData = await db
    .select({
      fee: fees,
      patient: patients,
    })
    .from(fees)
    .leftJoin(patients, eq(fees.patientId, patients.id))
    .where(
      and(
        gte(fees.feeDate, startDate),
        lte(fees.feeDate, endDate)
      )
    )
    .orderBy(desc(fees.createdAt));

  const summary = await getFeesSummary(startDate, endDate);

  const totalNewPatient = feesData
    .filter(f => f.fee.feeType === 'new_patient')
    .reduce((sum, f) => sum + f.fee.amount, 0);
  
  const totalFollowUp = feesData
    .filter(f => f.fee.feeType === 'followup')
    .reduce((sum, f) => sum + f.fee.amount, 0);
  
  const totalConsultation = feesData
    .filter(f => f.fee.feeType === 'consultation')
    .reduce((sum, f) => sum + f.fee.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fees & Billing</h1>
          <p className="text-gray-600 mt-1">Track payments and revenue</p>
        </div>
        <Link
          href="/fees/collect"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          + Collect Fees
        </Link>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <form className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              defaultValue={startDate}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              defaultValue={endDate}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-600">₹{summary.totalFees?.toLocaleString() || 0}</p>
          <p className="text-sm text-green-600">Total Collection</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">₹{totalNewPatient.toLocaleString()}</p>
          <p className="text-sm text-blue-600">New Patient Fees</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">₹{totalFollowUp.toLocaleString()}</p>
          <p className="text-sm text-purple-600">Follow-up Fees</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-orange-600">₹{totalConsultation.toLocaleString()}</p>
          <p className="text-sm text-orange-600">Consultation Fees</p>
        </div>
      </div>

      {/* Fees Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Transactions ({feesData.length})
          </h2>
        </div>
        {feesData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Receipt No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fee Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Payment Mode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feesData.map(({ fee, patient }) => (
                  <tr key={fee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-indigo-600">
                      {fee.receiptNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {patient?.firstName} {patient?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{patient?.regdNo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        fee.feeType === 'new_patient' ? 'bg-green-100 text-green-800' :
                        fee.feeType === 'followup' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      } capitalize`}>
                        {fee.feeType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">
                      ₹{fee.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                      {fee.paymentMode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {fee.feeDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/fees/receipt/${fee.receiptNo}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Receipt
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">💰</p>
            <p className="text-gray-500 text-lg">No transactions found</p>
            <Link
              href="/fees/collect"
              className="text-indigo-600 hover:text-indigo-800 mt-2 inline-block"
            >
              Collect first payment
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
