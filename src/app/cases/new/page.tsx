"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createCase, createFollowUpCase, getCasesByPatient } from "@/lib/actions";

export default function NewCasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [previousCases, setPreviousCases] = useState<any[]>([]);
  const [language, setLanguage] = useState("english");

  const preselectedPatientId = searchParams.get("patientId");
  const preselectedAppointmentId = searchParams.get("appointmentId");

  useEffect(() => {
    if (preselectedPatientId) {
      setPatientId(parseInt(preselectedPatientId));
      loadPreviousCases(parseInt(preselectedPatientId));
    }
  }, [preselectedPatientId]);

  async function loadPreviousCases(pid: number) {
    const cases = await getCasesByPatient(pid);
    setPreviousCases(cases);
    if (cases.length > 0) {
      setIsFollowUp(true);
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    if (!patientId) {
      setError("Please select a patient");
      setLoading(false);
      return;
    }

    formData.append("patientId", patientId.toString());
    if (preselectedAppointmentId) {
      formData.append("appointmentId", preselectedAppointmentId);
    }

    try {
      let result;
      if (isFollowUp && previousCases.length > 0) {
        formData.append("previousCaseId", previousCases[0].id.toString());
        result = await createFollowUpCase(formData);
      } else {
        result = await createCase(formData);
      }

      if (result.success) {
        router.push(`/cases`);
      } else {
        setError("Failed to create case. Please try again.");
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
          <h1 className="text-3xl font-bold text-gray-900">
            {isFollowUp ? "Follow-up Case" : "New Case"}
          </h1>
          <p className="text-gray-600 mt-1">Record patient case details</p>
        </div>
        <a href="/cases" className="text-indigo-600 hover:text-indigo-800">
          ← Back to Cases
        </a>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Language Toggle */}
        <div className="flex justify-end">
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

        {/* Case Type Indicator */}
        {previousCases.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">
                  This patient has {previousCases.length} previous case(s)
                </p>
                <p className="text-sm text-blue-700">
                  This will be recorded as a follow-up case
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFollowUp(!isFollowUp);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {isFollowUp ? "Create as new case instead" : "Create as follow-up"}
              </button>
            </div>
          </div>
        )}

        {/* Chief Complaints */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
            {language === "hindi" ? "मुख्य शिकायतें" : "Chief Complaints"}
          </h2>
          <textarea
            name="chiefComplaints"
            rows={3}
            placeholder={language === "hindi" 
              ? "मरीज की मुख्य शिकायतें लिखें..." 
              : "Enter patient's chief complaints..."
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* History */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
            {language === "hindi" ? "पूरा इतिहास" : "Case History"}
          </h2>
          <textarea
            name="history"
            rows={6}
            placeholder={language === "hindi" 
              ? "मरीज का विस्तृत इतिहास लिखें (मौजूदा शिकायत, पुरानी बीमारियाँ, पारिवारिक इतिहास, आदि)..." 
              : "Enter detailed case history (present complaint, past illnesses, family history, etc.)..."
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Symptoms Tagging */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
            {language === "hindi" ? "लक्षण टैगिंग" : "Symptoms Tagging"}
          </h2>
          <textarea
            name="symptoms"
            rows={4}
            placeholder={language === "hindi" 
              ? "मुख्य लक्षणों को टैग करें (जैसे: सिरदर्द, बुखार, खाँसी, आदि)..." 
              : "Tag key symptoms (e.g., headache, fever, cough, etc.)..."
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            {language === "hindi" 
              ? "लक्षणों को अलग-अलग लाइनों या कॉमा से अलग करें"
              : "Separate symptoms by new lines or commas"
            }
          </p>
        </div>

        {/* Physical Findings */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
            {language === "hindi" ? "शारीरिक परीक्षण" : "Physical Findings"}
          </h2>
          <textarea
            name="physicalFindings"
            rows={3}
            placeholder={language === "hindi" 
              ? "शारीरिक परीक्षण के निष्कर्ष..." 
              : "Physical examination findings..."
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Diagnosis & Prognosis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
              {language === "hindi" ? "निदान" : "Diagnosis"}
            </h2>
            <textarea
              name="diagnosis"
              rows={3}
              placeholder={language === "hindi" 
                ? "निदान लिखें..." 
                : "Enter diagnosis..."
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
              {language === "hindi" ? "पूर्वानुमान" : "Prognosis"}
            </h2>
            <textarea
              name="prognosis"
              rows={3}
              placeholder={language === "hindi" 
                ? "पूर्वानुमान लिखें..." 
                : "Enter prognosis..."
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Follow-up Date */}
        {isFollowUp && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
              {language === "hindi" ? "अगली विज़िट" : "Next Follow-up"}
            </h2>
            <input
              type="date"
              name="followUpDate"
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        )}

        {/* Prognosis Status (for follow-ups) */}
        {isFollowUp && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
              {language === "hindi" ? "स्थिति" : "Current Status"}
            </h2>
            <select
              name="prognosisStatus"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="improving">
                {language === "hindi" ? "बेहतर हो रहा है" : "Improving"}
              </option>
              <option value="stable">
                {language === "hindi" ? "स्थिर" : "Stable"}
              </option>
              <option value="worsening">
                  {language === "hindi" ? "बिगड़ रहा है" : "Worsening"}
                </option>
            </select>
          </div>
        )}

        {/* Additional Notes */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
            {language === "hindi" ? "अतिरिक्त नोट्स" : "Additional Notes"}
          </h2>
          <textarea
            name="caseNotes"
            rows={3}
            placeholder={language === "hindi" 
              ? "कोई अतिरिक्त नोट्स..." 
              : "Any additional notes..."
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
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 font-medium"
          >
            {loading 
              ? (language === "hindi" ? "सहेज रहा है..." : "Saving...") 
              : (language === "hindi" ? "केस सहेजें" : "Save Case")
            }
          </button>
        </div>
      </form>
    </div>
  );
}
