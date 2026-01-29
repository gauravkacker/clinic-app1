import { pgTable, text, integer, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Patients table - unique registration numbers
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  regdNo: text("regd_no").notNull().unique(), // Unique registration number
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  mobileNo: text("mobile_no").notNull(),
  email: text("email"),
  gender: text("gender"), // male, female, other
  age: integer("age"),
  dateOfBirth: text("date_of_birth"),
  address: text("address"),
  city: text("city"),
  pincode: text("pincode"),
  occupation: text("occupation"),
  refBy: text("ref_by"), // Reference by
  isNewPatient: integer("is_new_patient").default(1), // 1 = true, 0 = false
  registrationDate: text("registration_date").default(new Date().toISOString()),
  notes: text("notes"),
  status: text("status").default("active"), // active, inactive
  createdAt: text("created_at").default(new Date().toISOString()),
  updatedAt: text("updated_at").default(new Date().toISOString()),
});

// Appointments table - slots, tokens, booking
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id),
  regdNo: text("regd_no").notNull(),
  appointmentDate: text("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  tokenNo: integer("token_no"),
  appointmentType: text("appointment_type").notNull(), // new, followup
  appointmentStatus: text("appointment_status").default("scheduled"), // scheduled, completed, cancelled, rescheduled
  visitType: text("visit_type").default("clinic"), // clinic, online
  reason: text("reason"),
  rescheduledFrom: integer("rescheduled_from"), // Previous appointment ID
  cancelledAt: text("cancelled_at"),
  cancellationReason: text("cancellation_reason"),
  createdAt: text("created_at").default(new Date().toISOString()),
  updatedAt: text("updated_at").default(new Date().toISOString()),
});

// Fees table - advance fees, payment tracking
export const fees = pgTable("fees", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  feeType: text("fee_type").notNull(), // new_patient, followup, consultation, advance
  amount: integer("amount").notNull(),
  paymentMode: text("payment_mode").notNull(), // cash, card, upi, cheque
  paymentStatus: text("payment_status").default("paid"), // paid, pending, refunded
  advanceAmount: integer("advance_amount").default(0), // Advance payment
  dueAmount: integer("due_amount").default(0),
  receiptNo: text("receipt_no").unique(),
  notes: text("notes"),
  feeDate: text("fee_date").default(new Date().toISOString().split('T')[0]),
  createdAt: text("created_at").default(new Date().toISOString()),
  updatedAt: text("updated_at").default(new Date().toISOString()),
});

// Cases table - case taking module
export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  caseNo: integer("case_no").notNull(),
  chiefComplaints: text("chief_complaints"), // JSON string of complaints
  history: text("history"), // Free text case entry
  physicalFindings: text("physical_findings"),
  investigation: text("investigation"),
  symptoms: text("symptoms"), // JSON for symptoms tagging
  diagnosis: text("diagnosis"),
  prognosis: text("prognosis"), // Tracking prognosis
  prognosisStatus: text("prognosis_status"), // improving, stable, worsening
  followUpDate: text("follow_up_date"),
  caseNotes: text("case_notes"), // Additional notes
  isFollowUp: integer("is_follow_up").default(0), // 1 = true, 0 = false
  createdAt: text("created_at").default(new Date().toISOString()),
  updatedAt: text("updated_at").default(new Date().toISOString()),
});

// Prescriptions table
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id),
  caseId: integer("case_id").references(() => cases.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  prescriptionNo: text("prescription_no").notNull().unique(),
  medicines: text("medicines").notNull(), // JSON of medicines
  dosage: text("dosage"), // JSON of dosage patterns
  frequency: text("frequency"),
  duration: text("duration"),
  instructions: text("instructions"),
  autoText: text("auto_text"), // Auto generated text
  language: text("language").default("english"),
  isCombination: integer("is_combination").default(0), // 1 = true, 0 = false
  printed: integer("printed").default(0), // 1 = true, 0 = false
  printedAt: text("printed_at"),
  createdAt: text("created_at").default(new Date().toISOString()),
  updatedAt: text("updated_at").default(new Date().toISOString()),
});

// Medicines master table
export const medicines = pgTable("medicines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category"), // Mother tincture, 6x, 30, 200, 1M, etc.
  potency: text("potency"),
  form: text("form"), // liquid, tablet, globules
  manufacturer: text("manufacturer"),
  stock: integer("stock").default(0),
  minStock: integer("min_stock").default(10),
  unit: text("unit").default("ml"),
  price: integer("price").default(0),
  isActive: integer("is_active").default(1), // 1 = true, 0 = false
  createdAt: text("created_at").default(new Date().toISOString()),
  updatedAt: text("updated_at").default(new Date().toISOString()),
});

// Follow-ups table
export const followUps = pgTable("follow_ups", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id),
  caseId: integer("case_id").references(() => cases.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  followUpDate: text("follow_up_date").notNull(),
  followUpStatus: text("follow_up_status").default("pending"), // pending, completed, missed
  isFree: integer("is_free_followup").default(0), // 1 = true, 0 = false
  isPaid: integer("is_paid_followup").default(0), // 1 = true, 0 = false
  notes: text("notes"),
  createdAt: text("created_at").default(new Date().toISOString()),
  updatedAt: text("updated_at").default(new Date().toISOString()),
});

// Fees settings table
export const feesSettings = pgTable("fees_settings", {
  id: serial("id").primaryKey(),
  newPatientFee: integer("new_patient_fee").notNull(),
  followUpFee: integer("follow_up_fee").notNull(),
  consultationFee: integer("consultation_fee").notNull(),
  advancePayment: integer("advance_payment").default(0),
  effectiveDate: text("effective_date").default(new Date().toISOString()),
  isActive: integer("is_active").default(1), // 1 = true, 0 = false
  createdAt: text("created_at").default(new Date().toISOString()),
  updatedAt: text("updated_at").default(new Date().toISOString()),
});

// Clinic settings table
export const clinicSettings = pgTable("clinic_settings", {
  id: serial("id").primaryKey(),
  clinicName: text("clinic_name").notNull(),
  doctorName: text("doctor_name").notNull(),
  qualification: text("qualification"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  logo: text("logo"),
  footerText: text("footer_text"),
  language: text("language").default("english"),
  createdAt: text("created_at").default(new Date().toISOString()),
  updatedAt: text("updated_at").default(new Date().toISOString()),
});

// Relations
export const patientsRelations = relations(patients, ({ many }) => ({
  appointments: many(appointments),
  fees: many(fees),
  cases: many(cases),
  prescriptions: many(prescriptions),
  followUps: many(followUps),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
}));

export const casesRelations = relations(cases, ({ one }) => ({
  patient: one(patients, {
    fields: [cases.patientId],
    references: [patients.id],
  }),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  patient: one(patients, {
    fields: [prescriptions.patientId],
    references: [patients.id],
  }),
}));

export const feesRelations = relations(fees, ({ one }) => ({
  patient: one(patients, {
    fields: [fees.patientId],
    references: [patients.id],
  }),
}));
