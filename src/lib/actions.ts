"use server";

import { db } from "@/db";
import { 
  patients, appointments, fees, cases, prescriptions, 
  followUps, feesSettings, clinicSettings, medicines 
} from "@/db/schema";
import { eq, like, or, desc, asc, and, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Generate unique registration number
function generateRegdNo(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `HMC/${year}/${random}`;
}

// Generate receipt number
function generateReceiptNo(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RCP/${timestamp}/${random}`;
}

// Generate prescription number
function generatePrescriptionNo(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `RX/${timestamp}`;
}

// ===== PATIENT ACTIONS =====

export async function registerPatient(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const mobileNo = formData.get("mobileNo") as string;
  const email = formData.get("email") as string;
  const gender = formData.get("gender") as string;
  const age = parseInt(formData.get("age") as string) || null;
  const dateOfBirth = formData.get("dateOfBirth") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const pincode = formData.get("pincode") as string;
  const occupation = formData.get("occupation") as string;
  const refBy = formData.get("refBy") as string;

  const regdNo = generateRegdNo();

  await db.insert(patients).values({
    regdNo,
    firstName,
    lastName,
    mobileNo,
    email,
    gender,
    age,
    dateOfBirth,
    address,
    city,
    pincode,
    occupation,
    refBy,
    isNewPatient: true,
  });

  revalidatePath("/patients");
  return { success: true, regdNo };
}

export async function searchPatients(query: string) {
  if (!query || query.length < 2) return [];

  const searchTerm = `%${query}%`;
  const results = await db
    .select()
    .from(patients)
    .where(
      or(
        like(patients.regdNo, searchTerm),
        like(patients.mobileNo, searchTerm),
        like(patients.firstName, searchTerm),
        like(patients.lastName, searchTerm)
      )
    )
    .limit(20);

  return results;
}

export async function getPatientById(id: number) {
  const result = await db
    .select()
    .from(patients)
    .where(eq(patients.id, id))
    .limit(1);
  return result[0] || null;
}

export async function updatePatient(id: number, formData: FormData) {
  await db
    .update(patients)
    .set({
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      mobileNo: formData.get("mobileNo") as string,
      email: formData.get("email") as string,
      gender: formData.get("gender") as string,
      age: parseInt(formData.get("age") as string) || null,
      dateOfBirth: formData.get("dateOfBirth") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      pincode: formData.get("pincode") as string,
      occupation: formData.get("occupation") as string,
      refBy: formData.get("refBy") as string,
      updatedAt: new Date(),
    })
    .where(eq(patients.id, id));

  revalidatePath("/patients");
  revalidatePath(`/patients/${id}`);
}

// ===== APPOINTMENT ACTIONS =====

export async function createAppointment(formData: FormData) {
  const patientId = parseInt(formData.get("patientId") as string);
  const appointmentDate = formData.get("appointmentDate") as string;
  const appointmentTime = formData.get("appointmentTime") as string;
  const appointmentType = formData.get("appointmentType") as string;
  const visitType = formData.get("visitType") as string || "clinic";
  const reason = formData.get("reason") as string;

  // Get current max token for the date
  const todayAppointments = await db
    .select()
    .from(appointments)
    .where(eq(appointments.appointmentDate, appointmentDate));

  const tokenNo = todayAppointments.length + 1;

  const regdNo = formData.get("regdNo") as string;

  await db.insert(appointments).values({
    patientId,
    regdNo,
    appointmentDate,
    appointmentTime,
    tokenNo,
    appointmentType,
    visitType,
    reason,
    appointmentStatus: "scheduled",
  });

  revalidatePath("/appointments");
  return { success: true, tokenNo };
}

export async function getAppointmentsByDate(date: string) {
  return await db
    .select({
      appointment: appointments,
      patient: patients,
    })
    .from(appointments)
    .leftJoin(patients, eq(appointments.patientId, patients.id))
    .where(eq(appointments.appointmentDate, date))
    .orderBy(asc(appointments.tokenNo));
}

export async function getAllAppointments() {
  return await db
    .select({
      appointment: appointments,
      patient: patients,
    })
    .from(appointments)
    .leftJoin(patients, eq(appointments.patientId, patients.id))
    .orderBy(desc(appointments.appointmentDate));
}

export async function rescheduleAppointment(id: number, newDate: string, newTime: string) {
  // Get current appointment
  const current = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, id))
    .limit(1);

  if (current[0]) {
    // Mark old appointment as rescheduled
    await db
      .update(appointments)
      .set({
        appointmentStatus: "rescheduled",
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id));

    // Create new appointment
    const todayAppointments = await db
      .select()
      .from(appointments)
      .where(eq(appointments.appointmentDate, newDate));

    await db.insert(appointments).values({
      patientId: current[0].patientId,
      regdNo: current[0].regdNo,
      appointmentDate: newDate,
      appointmentTime: newTime,
      tokenNo: todayAppointments.length + 1,
      appointmentType: current[0].appointmentType,
      appointmentStatus: "scheduled",
      rescheduledFrom: id,
    });
  }

  revalidatePath("/appointments");
}

export async function cancelAppointment(id: number, reason: string) {
  await db
    .update(appointments)
    .set({
      appointmentStatus: "cancelled",
      cancellationReason: reason,
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date(),
    })
    .where(eq(appointments.id, id));

  revalidatePath("/appointments");
}

export async function completeAppointment(id: number) {
  await db
    .update(appointments)
    .set({
      appointmentStatus: "completed",
      updatedAt: new Date(),
    })
    .where(eq(appointments.id, id));

  revalidatePath("/appointments");
}

// ===== CASE ACTIONS =====

export async function createCase(formData: FormData) {
  const patientId = parseInt(formData.get("patientId") as string);
  const appointmentId = parseInt(formData.get("appointmentId") as string) || null;
  const chiefComplaints = formData.get("chiefComplaints") as string;
  const history = formData.get("history") as string;
  const physicalFindings = formData.get("physicalFindings") as string;
  const symptoms = formData.get("symptoms") as string;
  const diagnosis = formData.get("diagnosis") as string;
  const prognosis = formData.get("prognosis") as string;
  const caseNotes = formData.get("caseNotes") as string;

  // Get case number
  const patientCases = await db
    .select()
    .from(cases)
    .where(eq(cases.patientId, patientId));

  const caseNo = patientCases.length + 1;

  await db.insert(cases).values({
    patientId,
    appointmentId,
    caseNo,
    chiefComplaints,
    history,
    physicalFindings,
    symptoms,
    diagnosis,
    prognosis,
    caseNotes,
    isFollowUp: false,
  });

  // Update patient to not new
  await db
    .update(patients)
    .set({ isNewPatient: false, updatedAt: new Date() })
    .where(eq(patients.id, patientId));

  revalidatePath("/cases");
  return { success: true, caseNo };
}

export async function createFollowUpCase(formData: FormData) {
  const patientId = parseInt(formData.get("patientId") as string);
  const appointmentId = parseInt(formData.get("appointmentId") as string) || null;
  const previousCaseId = parseInt(formData.get("previousCaseId") as string);
  const history = formData.get("history") as string;
  const symptoms = formData.get("symptoms") as string;
  const prognosisStatus = formData.get("prognosisStatus") as string;
  const followUpDate = formData.get("followUpDate") as string;
  const caseNotes = formData.get("caseNotes") as string;

  // Get case number
  const patientCases = await db
    .select()
    .from(cases)
    .where(eq(cases.patientId, patientId));

  const caseNo = patientCases.length + 1;

  await db.insert(cases).values({
    patientId,
    appointmentId,
    caseNo,
    history,
    symptoms,
    prognosisStatus,
    followUpDate,
    caseNotes,
    isFollowUp: true,
  });

  revalidatePath("/cases");
  return { success: true, caseNo };
}

export async function getCasesByPatient(patientId: number) {
  return await db
    .select()
    .from(cases)
    .where(eq(cases.patientId, patientId))
    .orderBy(desc(cases.createdAt));
}

export async function getAllCases() {
  return await db
    .select({
      case: cases,
      patient: patients,
    })
    .from(cases)
    .leftJoin(patients, eq(cases.patientId, patients.id))
    .orderBy(desc(cases.createdAt));
}

// ===== PRESCRIPTION ACTIONS =====

export async function createPrescription(formData: FormData) {
  const patientId = parseInt(formData.get("patientId") as string);
  const caseId = parseInt(formData.get("caseId") as string) || null;
  const appointmentId = parseInt(formData.get("appointmentId") as string) || null;
  const medicines = formData.get("medicines") as string;
  const dosage = formData.get("dosage") as string;
  const frequency = formData.get("frequency") as string;
  const duration = formData.get("duration") as string;
  const instructions = formData.get("instructions") as string;
  const language = formData.get("language") as string || "english";

  const prescriptionNo = generatePrescriptionNo();

  // Generate auto text
  const autoText = generateAutoText(medicines, dosage, frequency, duration, language);

  await db.insert(prescriptions).values({
    patientId,
    caseId,
    appointmentId,
    prescriptionNo,
    medicines,
    dosage,
    frequency,
    duration,
    instructions,
    autoText,
    language,
  });

  revalidatePath("/prescriptions");
  return { success: true, prescriptionNo };
}

function generateAutoText(medicines: string, dosage: string, frequency: string, duration: string, language: string): string {
  try {
    const meds = JSON.parse(medicines);
    const medsList = Array.isArray(meds) ? meds : [meds];
    
    if (language === "hindi") {
      return `भेज दवाइयाँ: ${medsList.join(", ")} \nखुराक: ${dosage} \nआवृत्ति: ${frequency} \nअवधि: ${duration}`;
    }
    return ` Medicines: ${medsList.join(", ")} \nDosage: ${dosage} \nFrequency: ${frequency} \nDuration: ${duration}`;
  } catch {
    return ` Medicines: ${medicines} \nDosage: ${dosage} \nFrequency: ${frequency} \nDuration: ${duration}`;
  }
}

export async function getPrescriptionsByPatient(patientId: number) {
  return await db
    .select()
    .from(prescriptions)
    .where(eq(prescriptions.patientId, patientId))
    .orderBy(desc(prescriptions.createdAt));
}

export async function markPrescriptionPrinted(id: number) {
  await db
    .update(prescriptions)
    .set({
      printed: true,
      printedAt: new Date().toISOString(),
      updatedAt: new Date(),
    })
    .where(eq(prescriptions.id, id));

  revalidatePath("/prescriptions");
}

// ===== FEES ACTIONS =====

export async function getFeesSettings() {
  const result = await db
    .select()
    .from(feesSettings)
    .where(eq(feesSettings.isActive, true))
    .limit(1);
  return result[0] || null;
}

export async function updateFeesSettings(formData: FormData) {
  const newPatientFee = parseInt(formData.get("newPatientFee") as string);
  const followUpFee = parseInt(formData.get("followUpFee") as string);
  const consultationFee = parseInt(formData.get("consultationFee") as string);

  // Deactivate old settings
  await db
    .update(feesSettings)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(feesSettings.isActive, true));

  // Create new settings
  await db.insert(feesSettings).values({
    newPatientFee,
    followUpFee,
    consultationFee,
  });

  revalidatePath("/settings");
}

export async function payFees(formData: FormData) {
  const patientId = parseInt(formData.get("patientId") as string);
  const appointmentId = parseInt(formData.get("appointmentId") as string) || null;
  const feeType = formData.get("feeType") as string;
  const amount = parseInt(formData.get("amount") as string);
  const paymentMode = formData.get("paymentMode") as string;
  const notes = formData.get("notes") as string;

  const receiptNo = generateReceiptNo();

  await db.insert(fees).values({
    patientId,
    appointmentId,
    feeType,
    amount,
    paymentMode,
    paymentStatus: "paid",
    receiptNo,
    notes,
  });

  revalidatePath("/fees");
  return { success: true, receiptNo };
}

export async function getFeesByPatient(patientId: number) {
  return await db
    .select()
    .from(fees)
    .where(eq(fees.patientId, patientId))
    .orderBy(desc(fees.createdAt));
}

export async function getAllFees() {
  return await db
    .select({
      fee: fees,
      patient: patients,
    })
    .from(fees)
    .leftJoin(patients, eq(fees.patientId, patients.id))
    .orderBy(desc(fees.createdAt));
}

export async function getFeesByDateRange(startDate: string, endDate: string) {
  return await db
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
}

export async function getFeesSummary(startDate?: string, endDate?: string) {
  const dateFilter = startDate && endDate
    ? and(gte(fees.feeDate, startDate), lte(fees.feeDate, endDate))
    : undefined;

  const result = await db
    .select({
      totalFees: sql<number>`COALESCE(SUM(${fees.amount}), 0)`,
      totalNewPatientFees: sql<number>`COALESCE(SUM(CASE WHEN ${fees.feeType} = 'new_patient' THEN ${fees.amount} ELSE 0 END), 0)`,
      totalFollowUpFees: sql<number>`COALESCE(SUM(CASE WHEN ${fees.feeType} = 'followup' THEN ${fees.amount} ELSE 0 END), 0)`,
      totalConsultationFees: sql<number>`COALESCE(SUM(CASE WHEN ${fees.feeType} = 'consultation' THEN ${fees.amount} ELSE 0 END), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(fees)
    .where(dateFilter);

  return result[0];
}

// ===== CLINIC SETTINGS ACTIONS =====

export async function getClinicSettings() {
  const result = await db
    .select()
    .from(clinicSettings)
    .limit(1);
  return result[0] || null;
}

export async function updateClinicSettings(formData: FormData) {
  const clinicName = formData.get("clinicName") as string;
  const doctorName = formData.get("doctorName") as string;
  const qualification = formData.get("qualification") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const footerText = formData.get("footerText") as string;
  const language = formData.get("language") as string || "english";

  const settings = await db
    .select()
    .from(clinicSettings)
    .limit(1);

  if (settings[0]) {
    await db
      .update(clinicSettings)
      .set({
        clinicName,
        doctorName,
        qualification,
        address,
        phone,
        email,
        footerText,
        language,
        updatedAt: new Date(),
      })
      .where(eq(clinicSettings.id, settings[0].id));
  } else {
    await db.insert(clinicSettings).values({
      clinicName,
      doctorName,
      qualification,
      address,
      phone,
      email,
      footerText,
      language,
    });
  }

  revalidatePath("/settings");
}

// ===== FOLLOW-UP ACTIONS =====

export async function createFollowUp(formData: FormData) {
  const patientId = parseInt(formData.get("patientId") as string);
  const caseId = parseInt(formData.get("caseId") as string) || null;
  const appointmentId = parseInt(formData.get("appointmentId") as string) || null;
  const followUpDate = formData.get("followUpDate") as string;
  const isFree = formData.get("isFree") === "true";
  const notes = formData.get("notes") as string;

  await db.insert(followUps).values({
    patientId,
    caseId,
    appointmentId,
    followUpDate,
    isFree,
    followUpStatus: "pending",
    notes,
  });

  revalidatePath("/followups");
}

export async function getFollowUpsByDate(date: string) {
  return await db
    .select({
      followUp: followUps,
      patient: patients,
    })
    .from(followUps)
    .leftJoin(patients, eq(followUps.patientId, patients.id))
    .where(eq(followUps.followUpDate, date));
}

export async function getAllFollowUps() {
  return await db
    .select({
      followUp: followUps,
      patient: patients,
    })
    .from(followUps)
    .leftJoin(patients, eq(followUps.patientId, patients.id))
    .orderBy(asc(followUps.followUpDate));
}

export async function completeFollowUp(id: number) {
  await db
    .update(followUps)
    .set({
      followUpStatus: "completed",
      updatedAt: new Date(),
    })
    .where(eq(followUps.id, id));

  revalidatePath("/followups");
}

// ===== DASHBOARD STATS =====

export async function getDashboardStats() {
  const today = new Date().toISOString().split('T')[0];
  
  const [todayAppointments, todayFees, totalPatients, pendingFollowUps] = await Promise.all([
    db.select().from(appointments).where(eq(appointments.appointmentDate, today)),
    db.select().from(fees).where(eq(fees.feeDate, today)),
    db.select().from(patients),
    db.select().from(followUps).where(eq(followUps.followUpDate, today)),
  ]);

  const todayFeesSum = todayFees.reduce((sum, f) => sum + f.amount, 0);

  return {
    todayAppointments: todayAppointments.length,
    todayFees: todayFeesSum,
    totalPatients: totalPatients.length,
    pendingFollowUps: pendingFollowUps.length,
  };
}
