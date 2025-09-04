export const USER_ROLES = {
  RECEPTIONIST: 'receptionist',
  DOCTOR: 'doctor', 
  LAB_TECHNICIAN: 'lab_technician',
  PHARMACIST: 'pharmacist',
  ADMIN: 'admin',
  TRIAGE_OFFICER: 'triage_officer',
} as const;

export const TRIAGE_PRIORITY_LEVELS = [
  { value: 'emergency', label: 'Emergency (Red)', color: 'bg-red-500' },
  { value: 'urgent', label: 'Urgent (Orange)', color: 'bg-orange-500' },
  { value: 'semi_urgent', label: 'Semi-Urgent (Yellow)', color: 'bg-yellow-500' },
  { value: 'standard', label: 'Standard (Green)', color: 'bg-green-500' },
  { value: 'non_urgent', label: 'Non-Urgent (Blue)', color: 'bg-blue-500' },
];

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
} as const;

export const PRESCRIPTION_STATUS = {
  PENDING: 'pending',
  DISPENSED: 'dispensed',
} as const;

export const LAB_TEST_STATUS = {
  REQUESTED: 'requested',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  INSURANCE: 'insurance',
} as const;

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export const LAB_TEST_TYPES = [
  { value: 'blood', label: 'Blood Test' },
  { value: 'urine', label: 'Urine Test' },
  { value: 'x_ray', label: 'X-Ray' },
  { value: 'mri', label: 'MRI' },
  { value: 'ct_scan', label: 'CT Scan' },
  { value: 'other', label: 'Other' },
];

export const CARD_STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'expired', label: 'Expired', color: 'bg-red-100 text-red-800' },
  { value: 'suspended', label: 'Suspended', color: 'bg-gray-100 text-gray-800' },
];