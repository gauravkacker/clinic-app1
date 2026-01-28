"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createAppointment, searchPatients } from "@/lib/actions";

export default function NewAppointmentPage() {
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

  const preselectedPatientId = searchParams.get("patientId");
  const preselectedRegdNo = searchParams.get("regdNo");

  useEffect(() => {
    if (preselectedPatientId && preselectedRegdNo) {
      setSelectedPatient({
        id: parseInt(preselectedPatientId),
        regdNo: preselectedRegdNo,
        firstName: "",
        lastName: "",
      });
    }
  }, [preselectedPatientId, preselectedRegdNo]);

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
    formData.append("regdNo", selectedPatient.regdNo);

    try {
      const result = await createAppointment(formData);
      if (result.success) {
        router.push(`/appointments?date=${formData.get("appointmentDate")}`);
      } else {
        setError("Failed to create appointment. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-600 mt-1">Schedule a new appointment</p>
        </div>
        <a href="/appointments" className="text-indigo-600 hover:text-indigo-800">
          ← Back to Appointments
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
          
          {!selectedPatient && (
            <div className="space-y-4">
              <div className="flex gap-4">
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
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        patient.isNewPatient ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {patient.isNewPatient ? "New" : "Follow-up"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
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

        {/* Appointment Details */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
            Appointment Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Date *
              </label>
              <input
                type="date"
                name="appointmentDate"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Time *
              </label>
              <select
                name="appointmentTime"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Time</option>
                <option value="09:00">09:00 AM</option>
                <option value="09:30">09:30 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="12:30">12:30 PM</option>
                <option value="14:00">02:00 PM</option>
                <option value="14:30">02:30 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="15:30">03:30 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="16:30">04:30 PM</option>
                <option value="17:00">05:00 PM</option>
                <option value="17:30">05:30 PM</option>
                <option value="18:00">06:00 PM</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Type *
              </label>
              <select
                name="appointmentType"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="new">New Patient</option>
                <option value="followup">Follow-up</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visit Type
              </label>
              <select
                name="visitType"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="clinic">Clinic Visit</option>
                <option value="online">Online Consultation</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Visit
              </label>
              <textarea
                name="reason"
                rows={2}
                placeholder="Brief description of the complaint or reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={loading || !selectedPatient}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 font-medium"
          >
            {loading ? "Booking..." : "Book Appointment"}
          </button>
        </div>
      </form>
    </div>
  );
}
