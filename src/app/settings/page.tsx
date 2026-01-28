"use client";

import { useState, useEffect } from "react";
import { updateClinicSettings, updateFeesSettings, getClinicSettings, getFeesSettings } from "@/lib/actions";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [clinicSettings, setClinicSettings] = useState<any>(null);
  const [feesSettings, setFeesSettings] = useState<any>(null);

  const [clinicForm, setClinicForm] = useState({
    clinicName: "",
    doctorName: "",
    qualification: "",
    address: "",
    phone: "",
    email: "",
    footerText: "",
    language: "english",
  });

  const [feesForm, setFeesForm] = useState({
    newPatientFee: "",
    followUpFee: "",
    consultationFee: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const [clinic, fees] = await Promise.all([
      getClinicSettings(),
      getFeesSettings(),
    ]);
    
    if (clinic) {
      setClinicForm({
        clinicName: clinic.clinicName || "",
        doctorName: clinic.doctorName || "",
        qualification: clinic.qualification || "",
        address: clinic.address || "",
        phone: clinic.phone || "",
        email: clinic.email || "",
        footerText: clinic.footerText || "",
        language: clinic.language || "english",
      });
    }
    
    if (fees) {
      setFeesForm({
        newPatientFee: fees.newPatientFee?.toString() || "",
        followUpFee: fees.followUpFee?.toString() || "",
        consultationFee: fees.consultationFee?.toString() || "",
      });
    }

    setClinicSettings(clinic);
    setFeesSettings(fees);
  }

  async function handleClinicSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    Object.entries(clinicForm).forEach(([key, value]) => {
      formData.append(key, value);
    });

    await updateClinicSettings(formData);
    setMessage("Clinic settings updated successfully!");
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  }

  async function handleFeesSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    Object.entries(feesForm).forEach(([key, value]) => {
      formData.append(key, value);
    });

    await updateFeesSettings(formData);
    setMessage("Fee settings updated successfully!");
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure your clinic settings</p>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {message}
        </div>
      )}

      {/* Clinic Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Clinic Information</h2>
        <form onSubmit={handleClinicSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clinic Name *
              </label>
              <input
                type="text"
                value={clinicForm.clinicName}
                onChange={(e) => setClinicForm({ ...clinicForm, clinicName: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor Name *
              </label>
              <input
                type="text"
                value={clinicForm.doctorName}
                onChange={(e) => setClinicForm({ ...clinicForm, doctorName: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualification
              </label>
              <input
                type="text"
                value={clinicForm.qualification}
                onChange={(e) => setClinicForm({ ...clinicForm, qualification: e.target.value })}
                placeholder="e.g., BHMS, MD (Homoeopathy)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={clinicForm.phone}
                onChange={(e) => setClinicForm({ ...clinicForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={clinicForm.email}
                onChange={(e) => setClinicForm({ ...clinicForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Language
              </label>
              <select
                value={clinicForm.language}
                onChange={(e) => setClinicForm({ ...clinicForm, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="english">English</option>
                <option value="hindi">हिन्दी (Hindi)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={clinicForm.address}
                onChange={(e) => setClinicForm({ ...clinicForm, address: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Footer Text (for receipts/prescriptions)
              </label>
              <input
                type="text"
                value={clinicForm.footerText}
                onChange={(e) => setClinicForm({ ...clinicForm, footerText: e.target.value })}
                placeholder="e.g., Get well soon!"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {loading ? "Saving..." : "Save Clinic Settings"}
            </button>
          </div>
        </form>
      </div>

      {/* Fee Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Fee Structure</h2>
        <form onSubmit={handleFeesSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Patient Fee (₹) *
              </label>
              <input
                type="number"
                value={feesForm.newPatientFee}
                onChange={(e) => setFeesForm({ ...feesForm, newPatientFee: e.target.value })}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Follow-up Fee (₹) *
              </label>
              <input
                type="number"
                value={feesForm.followUpFee}
                onChange={(e) => setFeesForm({ ...feesForm, followUpFee: e.target.value })}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consultation Fee (₹) *
              </label>
              <input
                type="number"
                value={feesForm.consultationFee}
                onChange={(e) => setFeesForm({ ...feesForm, consultationFee: e.target.value })}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {loading ? "Saving..." : "Save Fee Settings"}
            </button>
          </div>
        </form>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">System Information</h2>
        <div className="text-sm text-gray-600 space-y-2">
          <p>Homoeopathic Clinic Management System</p>
          <p>Version 1.0.0</p>
          <p>Built with Next.js, React, and Drizzle ORM</p>
        </div>
      </div>
    </div>
  );
}
