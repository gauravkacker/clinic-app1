CREATE TABLE `appointments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` integer,
	`regd_no` text NOT NULL,
	`appointment_date` text NOT NULL,
	`appointment_time` text NOT NULL,
	`token_no` integer,
	`appointment_type` text NOT NULL,
	`appointment_status` text DEFAULT 'scheduled',
	`visit_type` text DEFAULT 'clinic',
	`reason` text,
	`rescheduled_from` integer,
	`cancelled_at` text,
	`cancellation_reason` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` integer,
	`appointment_id` integer,
	`case_no` integer NOT NULL,
	`chief_complaints` text,
	`history` text,
	`physical_findings` text,
	`investigation` text,
	`symptoms` text,
	`diagnosis` text,
	`prognosis` text,
	`prognosis_status` text,
	`follow_up_date` text,
	`case_notes` text,
	`is_follow_up` integer DEFAULT false,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `clinic_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clinic_name` text NOT NULL,
	`doctor_name` text NOT NULL,
	`qualification` text,
	`address` text,
	`phone` text,
	`email` text,
	`logo` text,
	`footer_text` text,
	`language` text DEFAULT 'english',
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `fees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` integer,
	`appointment_id` integer,
	`fee_type` text NOT NULL,
	`amount` integer NOT NULL,
	`payment_mode` text NOT NULL,
	`payment_status` text DEFAULT 'paid',
	`advance_amount` integer DEFAULT 0,
	`due_amount` integer DEFAULT 0,
	`receipt_no` text,
	`notes` text,
	`fee_date` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fees_receipt_no_unique` ON `fees` (`receipt_no`);--> statement-breakpoint
CREATE TABLE `fees_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`new_patient_fee` integer NOT NULL,
	`follow_up_fee` integer NOT NULL,
	`consultation_fee` integer NOT NULL,
	`advance_payment` integer DEFAULT 0,
	`effective_date` text,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `follow_ups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` integer,
	`case_id` integer,
	`appointment_id` integer,
	`follow_up_date` text NOT NULL,
	`follow_up_status` text DEFAULT 'pending',
	`is_free_followup` integer DEFAULT false,
	`is_paid_followup` integer DEFAULT false,
	`notes` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `medicines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text,
	`potency` text,
	`form` text,
	`manufacturer` text,
	`stock` integer DEFAULT 0,
	`min_stock` integer DEFAULT 10,
	`unit` text DEFAULT 'ml',
	`price` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`regd_no` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`mobile_no` text NOT NULL,
	`email` text,
	`gender` text,
	`age` integer,
	`date_of_birth` text,
	`address` text,
	`city` text,
	`pincode` text,
	`occupation` text,
	`ref_by` text,
	`is_new_patient` integer DEFAULT true,
	`registration_date` text,
	`notes` text,
	`status` text DEFAULT 'active',
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `patients_regd_no_unique` ON `patients` (`regd_no`);--> statement-breakpoint
CREATE TABLE `prescriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` integer,
	`case_id` integer,
	`appointment_id` integer,
	`prescription_no` text NOT NULL,
	`medicines` text NOT NULL,
	`dosage` text,
	`frequency` text,
	`duration` text,
	`instructions` text,
	`auto_text` text,
	`language` text DEFAULT 'english',
	`is_combination` integer DEFAULT false,
	`printed` integer DEFAULT false,
	`printed_at` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `prescriptions_prescription_no_unique` ON `prescriptions` (`prescription_no`);