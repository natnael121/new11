# ClinicCare Management System

A comprehensive clinic management system built with React, TypeScript, and Firebase.

## Features

- **Multi-role Authentication**: Support for receptionists, doctors, lab technicians, pharmacists, and administrators
- **Patient Management**: Complete patient registration, history tracking, and record management
- **Appointment Scheduling**: Calendar-based booking system with real-time updates
- **Doctor Dashboard**: Patient history, prescription writing, and lab test requests
- **Lab Management**: Test request handling and result entry system
- **Pharmacy Module**: Prescription management and inventory tracking
- **Admin Dashboard**: System analytics, user management, and billing oversight

## User Roles

### Receptionist
- Register new patients with comprehensive medical information
- Schedule and manage appointments
- Issue patient ID cards and numbers

### Doctor
- View complete patient medical history
- Write digital prescriptions
- Request laboratory tests
- Update diagnosis and treatment plans

### Lab Technician
- Process lab test requests from doctors
- Record test results directly into the system
- Manage laboratory workflow and priorities

### Pharmacist
- View and process digital prescriptions
- Confirm medication dispensing
- Manage pharmacy inventory and stock levels

### Admin
- Manage staff users and system access
- Monitor clinic operations via comprehensive dashboard
- Handle billing, payments, and insurance claims

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Routing**: React Router v6
- **Forms**: React Hook Form with Yup validation
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Firebase:
   - Create a new Firebase project at https://console.firebase.google.com
   - Enable Authentication and Firestore Database
   - Copy your Firebase configuration
   - Create a `.env` file based on `.env.example`
4. Set up Firestore collections and security rules
5. Start development server: `npm run dev`

## Firebase Setup

### Required Collections

The system requires the following Firestore collections:

- `users` - Staff user profiles with role-based access
- `patients` - Patient records with medical history
- `appointments` - Appointment scheduling and management
- `prescriptions` - Digital prescription management
- `lab_tests` - Laboratory test requests and results
- `medications` - Pharmacy inventory management
- `invoices` - Billing and payment tracking

### Security Rules

Implement Firestore security rules to ensure:
- Users can only access data relevant to their role
- Patient information is protected and audited
- Administrative functions are restricted to authorized users

### Authentication

The system uses Firebase Authentication with email/password sign-in. Create user accounts for each staff member with appropriate role assignments.

## Demo Setup

To set up demo data:

1. Create user accounts in Firebase Authentication
2. Add user profiles to the `users` collection with appropriate roles
3. Add sample patients, appointments, and other test data

## Environment Variables

Create a `.env` file with your Firebase configuration:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Security

The application implements Firebase security rules to ensure:
- Role-based access control
- Patient data privacy and protection
- Audit trails for all medical records
- Secure authentication and authorization

## License

Private - ClinicCare Management System