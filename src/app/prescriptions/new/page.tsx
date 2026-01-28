"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createPrescription, searchPatients } from "@/lib/actions";

export default function NewPrescriptionPage() {
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
  const [language, setLanguage] = useState("english");
  const [isCombination, setIsCombination] = useState(false);
  
  // Medicine entries
  const [medicines, setMedicines] = useState([{ name: "", potency: "", dosage: "" }]);

  const preselectedPatientId = searchParams.get("patientId");
  const preselectedCaseId = searchParams.get("caseId");
  const preselectedAppointmentId = searchParams.get("appointmentId");

  useEffect(() => {
    if (preselectedPatientId) {
      // Could load patient details here
    }
  }, [preselectedPatientId]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.length < 2) return;
    
    const results = await searchPatients(searchQuery);
    setSearchResults(results);
  }

  function addMedicine() {
    setMedicines([...medicines, { name: "", potency: "", dosage: "" }]);
  }

  function removeMedicine(index: number) {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index));
    }
  }

  function updateMedicine(index: number, field: string, value: string) {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  }

  async function handleSubmit(formData: FormData) {
    if (!selectedPatient) {
      setError("Please select a patient");
      return;
    }

    setLoading(true);
    setError("");

    formData.append("patientId", selectedPatient.id.toString());
    formData.append("medicines", JSON.stringify(medicines.map(m => m.name)));
    formData.append("language", language);
    formData.append("isCombination", isCombination.toString());
    
    if (preselectedCaseId) formData.append("caseId", preselectedCaseId);
    if (preselectedAppointmentId) formData.append("appointmentId", preselectedAppointmentId);

    try {
      const result = await createPrescription(formData);
      if (result.success) {
        router.push(`/prescriptions/${result.prescriptionNo}`);
      } else {
        setError("Failed to create prescription. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Prescription</h1>
          <p className="text-gray-600 mt-1">Create a new prescription</p>
        </div>
        <a href="/prescriptions" className="text-indigo-600 hover:text-indigo-800">
          ← Back to Prescriptions
        </a>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Language Toggle */}
        <div className="flex justify-end gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLanguage("english")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                language === "english" 
                  ? "bg-indigo-600 text-white" 
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage("hindi")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                language === "hindi" 
                  ? "bg-indigo-600 text-white" 
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

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

        {/* Medicines */}
        <div>
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              {language === "hindi" ? "दवाइयाँ" : "Medicines"}
            </h2>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isCombination}
                onChange={(e) => setIsCombination(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">
                {language === "hindi" ? "कॉम्बिनेशन" : "Combination"}
              </span>
            </label>
          </div>

          {medicines.map((medicine, index) => (
            <div key={index} className="flex gap-4 mb-4 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  value={medicine.name}
                  onChange={(e) => updateMedicine(index, "name", e.target.value)}
                  placeholder={language === "hindi" ? "दवाई का नाम" : "Medicine name"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="w-32">
                <select
                  value={medicine.potency}
                  onChange={(e) => updateMedicine(index, "potency", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Potency</option>
                  <option value="Ø">Mother Tincture (Ø)</option>
                  <option value="3x">3x</option>
                  <option value="6x">6x</option>
                  <option value="30">30</option>
                  <option value="200">200</option>
                  <option value="1M">1M</option>
                  <option value="10M">10M</option>
                  <option value="CM">CM</option>
                </select>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={medicine.dosage}
                  onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                  placeholder={language === "hindi" ? "खुराक (जैसे 4 बार/दिन)" : "Dosage (e.g., 4 times/day)"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {medicines.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMedicine(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addMedicine}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            + Add Another Medicine
          </button>
        </div>

        {/* Dosage Pattern */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
            {language === "hindi" ? "खुराक पैटर्न" : "Dosage Pattern"}
          </h2>
          <textarea
            name="dosage"
            rows={3}
            placeholder={language === "hindi" 
              ? "खुराक के बारे में विस्तृत निर्देश..." 
              : "Detailed dosage instructions..."
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Frequency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
              {language === "hindi" ? "आवृत्ति" : "Frequency"}
            </h2>
            <select
              name="frequency"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Frequency</option>
              <option value="Once daily">
                {language === "hindi" ? "दिन में एक बार" : "Once daily"}
              </option>
              <option value="Twice daily">
                {language === "hindi" ? "दिन में दो बार" : "Twice daily"}
              </option>
              <option value="Thrice daily">
                {language === "hindi" ? "दिन में तीन बार" : "Thrice daily"}
              </option>
              <option value="Four times daily">
                {language === "hindi" ? "दिन में चार बार" : "Four times daily"}
              </option>
              <option value="Every hourly">
                {language === "hindi" ? "हर घंटे" : "Every hour"}
              </option>
              <option value="Every 2 hours">
                {language === "hindi" ? "हर 2 घंटे" : "Every 2 hours"}
              </option>
              <option value="As needed">
                {language === "hindi" ? "आवश्यकतानुसार" : "As needed"}
              </option>
              <option value="At bedtime">
                {language === "hindi" ? "सोने से पहले" : "At bedtime"}
              </option>
            </select>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
              {language === "hindi" ? "अवधि" : "Duration"}
            </h2>
            <select
              name="duration"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Duration</option>
              <option value="3 days">{language === "hindi" ? "3 दिन" : "3 days"}</option>
              <option value="5 days">{language === "hindi" ? "5 दिन" : "5 days"}</option>
              <option value="7 days">{language === "hindi" ? "7 दिन" : "7 days"}</option>
              <option value="10 days">{language === "hindi" ? "10 दिन" : "10 days"}</option>
              <option value="15 days">{language === "hindi" ? "15 दिन" : "15 days"}</option>
              <option value="1 month">{language === "hindi" ? "1 महीना" : "1 month"}</option>
              <option value="2 months">{language === "hindi" ? "2 महीने" : "2 months"}</option>
              <option value="Until finished">
                {language === "hindi" ? "खत्म होने तक" : "Until finished"}
              </option>
            </select>
          </div>
        </div>

        {/* Instructions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
            {language === "hindi" ? "विशेष निर्देश" : "Special Instructions"}
          </h2>
          <textarea
            name="instructions"
            rows={3}
            placeholder={language === "hindi" 
              ? "कोई विशेष निर्देश (जैसे खाली पेट, भोजन के बाद, आदि)..." 
              : "Any special instructions (e.g., empty stomach, after food, etc.)..."
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !selectedPatient}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 font-medium"
          >
            {loading ? "Saving..." : "Create Prescription"}
          </button>
        </div>
      </form>
    </div>
  );
}
