import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Patients table - unique registration numbers
export const patients = sqliteTable("patients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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
  isNewPatient: integer("is_new_patient", { mode: "boolean" }).default(true),
  registrationDate: text("registration_date").$defaultFn(() => new Date().toISOString()),
  notes: text("notes"),
  status: text("status").default("active"), // active, inactive
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Appointments table - slots, tokens, booking
export const appointments = sqliteTable("appointments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Fees table - advance fees, payment tracking
export const fees = sqliteTable("fees", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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
  feeDate: text("fee_date").$defaultFn(() => new Date().toISOString().split('T')[0]),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Cases table - case taking module
export const cases = sqliteTable("cases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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
  isFollowUp: integer("is_follow_up", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Prescriptions table
export const prescriptions = sqliteTable("prescriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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
  isCombination: integer("is_combination", { mode: "boolean" }).default(false),
  printed: integer("printed", { mode: "boolean" }).default(false),
  printedAt: text("printed_at"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Medicines master table
export const medicines = sqliteTable("medicines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category"), // Mother tincture, 6x, 30, 200, 1M, etc.
  potency: text("potency"),
  form: text("form"), // liquid, tablet, globules
  manufacturer: text("manufacturer"),
  stock: integer("stock").default(0),
  minStock: integer("min_stock").default(10),
  unit: text("unit").default("ml"),
  price: integer("price").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Follow-ups table
export const followUps = sqliteTable("follow_ups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: integer("patient_id").references(() => patients.id),
  caseId: integer("case_id").references(() => cases.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  followUpDate: text("follow_up_date").notNull(),
  followUpStatus: text("follow_up_status").default("pending"), // pending, completed, missed
  isFree: integer("is_free_followup", { mode: "boolean" }).default(false), // Free followup
  isPaid: integer("is_paid_followup", { mode: "boolean" }).default(false), // Paid followup
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Fees settings table
export const feesSettings = sqliteTable("fees_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  newPatientFee: integer("new_patient_fee").notNull(),
  followUpFee: integer("follow_up_fee").notNull(),
  consultationFee: integer("consultation_fee").notNull(),
  advancePayment: integer("advance_payment").default(0),
  effectiveDate: text("effective_date").$defaultFn(() => new Date().toISOString()),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Clinic settings table
export const clinicSettings = sqliteTable("clinic_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clinicName: text("clinic_name").notNull(),
  doctorName: text("doctor_name").notNull(),
  qualification: text("qualification"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  logo: text("logo"),
  footerText: text("footer_text"),
  language: text("language").default("english"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
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
