import { db } from "@/db";
import { fees, patients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getClinicSettings } from "@/lib/actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: { receiptNo: string } }) {
  const fee = await db
    .select({
      fee: fees,
      patient: patients,
    })
    .from(fees)
    .leftJoin(patients, eq(fees.patientId, patients.id))
    .where(eq(fees.receiptNo, params.receiptNo))
    .limit(1);

  if (!fee[0]) {
    notFound();
  }

  const { fee: payment, patient } = fee[0];
  const clinicSettings = await getClinicSettings();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-start print:hidden">
        <Link href="/fees" className="text-indigo-600 hover:text-indigo-800 text-sm mb-2 inline-block">
          ← Back to Fees
        </Link>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
        >
          🖨️ Print Receipt
        </button>
      </div>

      {/* Receipt Print View */}
      <div className="bg-white rounded-lg shadow p-8 print:shadow-none print:p-0">
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

        {/* Receipt Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">FEE RECEIPT</h2>
        </div>

        {/* Receipt Info */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Receipt No</p>
              <p className="font-mono font-medium">{payment.receiptNo}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">Date</p>
              <p className="font-medium">{payment.feeDate}</p>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="mb-6 border-t pt-4">
          <h3 className="font-medium text-gray-900 mb-2">Patient Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Name</p>
              <p className="font-medium">{patient?.firstName} {patient?.lastName}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Regd No</p>
              <p className="font-medium">{patient?.regdNo}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Mobile</p>
              <p className="font-medium">{patient?.mobileNo}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Payment Mode</p>
              <p className="font-medium capitalize">{payment.paymentMode}</p>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="mb-6 border-t pt-4">
          <h3 className="font-medium text-gray-900 mb-2">Payment Details</h3>
          <table className="w-full">
            <tbody>
              <tr className="border-b">
                <td className="py-2 text-gray-600 capitalize">{payment.feeType.replace('_', ' ')}</td>
                <td className="py-2 text-right font-medium">₹{payment.amount.toLocaleString()}</td>
              </tr>
              {payment.advanceAmount && payment.advanceAmount > 0 && (
                <tr className="border-b">
                  <td className="py-2 text-gray-600">Advance Paid</td>
                  <td className="py-2 text-right font-medium">₹{payment.advanceAmount.toLocaleString()}</td>
                </tr>
              )}
              <tr className="border-b">
                <td className="py-2 text-gray-600">Status</td>
                <td className="py-2 text-right font-medium capitalize">{payment.paymentStatus}</td>
              </tr>
              <tr className="text-lg">
                <td className="py-3 font-bold">Total</td>
                <td className="py-3 text-right font-bold text-green-600">₹{payment.amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount in Words */}
        <div className="mb-6 border-t pt-4">
          <p className="text-gray-500 text-sm">Amount (in words)</p>
          <p className="font-medium">
            {toWords(payment.amount)} Rupees Only
          </p>
        </div>

        {/* Notes */}
        {payment.notes && (
          <div className="mb-6 border-t pt-4">
            <p className="text-gray-500 text-sm">Notes</p>
            <p className="font-medium">{payment.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm">Received with thanks</p>
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

// Simple number to words converter for Indian Rupees
function toWords(n: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (n === 0) return 'Zero';
  
  const numStr = n.toString();
  const numLen = numStr.length;
  
  if (numLen <= 2) {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  }
  
  // For simplicity, return the number as string for amounts over 999
  return `Rupees ${n}`;
}
