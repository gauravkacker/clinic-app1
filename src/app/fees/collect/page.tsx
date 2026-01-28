"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { payFees, searchPatients, getFeesSettings } from "@/lib/actions";

export default function CollectFeesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<{
    id: number;
    regdNo: string;
    firstName: string;
    lastName: string;
  } | null>(null);
  const [feesSettings, setFeesSettings] = useState<any>(null);

  const preselectedPatientId = searchParams.get("patientId");
  const preselectedAppointmentId = searchParams.get("appointmentId");
  const preselectedFeeType = searchParams.get("feeType");

  useEffect(() => {
    loadFeesSettings();
  }, []);

  async function loadFeesSettings() {
    const settings = await getFeesSettings();
    setFeesSettings(settings);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.length < 2) return;
    
    const results = await searchPatients(searchQuery);
    setSearchResults(results);
  }

  async function handleSubmit(formData: FormData) {
    if (!selectedPatient) {
      setError("Please select a patient");
      return;
    }

    setLoading(true);
    setError("");

    formData.append("patientId", selectedPatient.id.toString());
    if (preselectedAppointmentId) {
      formData.append("appointmentId", preselectedAppointmentId);
    }

    try {
      const result = await payFees(formData);
      if (result.success) {
        router.push(`/fees/receipt/${result.receiptNo}`);
      } else {
        setError("Failed to process payment. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const defaultAmount = preselectedFeeType === 'new_patient' 
    ? feesSettings?.newPatientFee 
    : feesSettings?.followUpFee || feesSettings?.consultationFee || 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Collect Fees</h1>
          <p className="text-gray-600 mt-1">Process patient payments</p>
        </div>
        <a href="/fees" className="text-indigo-600 hover:text-indigo-800">
          ← Back to Fees
        </a>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Patient Selection */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
            Select Patient
          </h2>
          
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Regd No, Mobile, or Name..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Search
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
              {searchResults.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => {
                    setSelectedPatient({
                      id: patient.id,
                      regdNo: patient.regdNo,
                      firstName: patient.firstName,
                      lastName: patient.lastName,
                    });
                    setSearchResults([]);
                    setSearchQuery("");
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{patient.regdNo} • {patient.mobileNo}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedPatient && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-indigo-900">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </p>
                <p className="text-sm text-indigo-600">{selectedPatient.regdNo}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* Fee Details */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
            Payment Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee Type *
              </label>
              <select
                name="feeType"
                required
                defaultValue={preselectedFeeType || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Fee Type</option>
                <option value="new_patient">New Patient Fee</option>
                <option value="followup">Follow-up Fee</option>
                <option value="consultation">Consultation Fee</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                name="amount"
                required
                min="0"
                defaultValue={defaultAmount}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Mode *
              </label>
              <select
                name="paymentMode"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Payment Mode</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="feeDate"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                rows={2}
                placeholder="Any additional notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Fee Settings Info */}
        {feesSettings && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Current Fee Structure</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">New Patient</p>
                <p className="font-medium">₹{feesSettings.newPatientFee}</p>
              </div>
              <div>
                <p className="text-gray-500">Follow-up</p>
                <p className="font-medium">₹{feesSettings.followUpFee}</p>
              </div>
              <div>
                <p className="text-gray-500">Consultation</p>
                <p className="font-medium">₹{feesSettings.consultationFee}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={loading || !selectedPatient}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 font-medium"
          >
            {loading ? "Processing..." : "Process Payment"}
          </button>
        </div>
      </form>
    </div>
  );
}
