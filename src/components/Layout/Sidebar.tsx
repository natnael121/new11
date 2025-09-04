import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Stethoscope, 
  TestTube, 
  Pill, 
  CreditCard, 
  Settings,
  UserPlus,
  ClipboardList,
  BarChart3,
  LogOut,
  Heart
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  user: User;
  onSignOut: () => void;
}

const roleMenus = {
  receptionist: [
    { to: '/patients', icon: Users, label: 'Patients' },
    { to: '/appointments', icon: Calendar, label: 'Appointments' },
  ],
  doctor: [
    { to: '/patients', icon: Users, label: 'Patients' },
    { to: '/appointments', icon: Calendar, label: 'My Appointments' },
    { to: '/prescriptions', icon: Pill, label: 'Prescriptions' },
    { to: '/lab-requests', icon: TestTube, label: 'Lab Requests' },
  ],
  triage_officer: [
    { to: '/triage', icon: Heart, label: 'Triage Queue' },
    { to: '/patients', icon: Users, label: 'Patients' },
    { to: '/appointments', icon: Calendar, label: 'Appointments' },
  ],
  lab_technician: [
    { to: '/lab-tests', icon: TestTube, label: 'Lab Tests' },
    { to: '/lab-results', icon: ClipboardList, label: 'Results Entry' },
  ],
  pharmacist: [
    { to: '/prescriptions', icon: Pill, label: 'Prescriptions' },
    { to: '/inventory', icon: ClipboardList, label: 'Inventory' },
  ],
  admin: [
    { to: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { to: '/users', icon: Users, label: 'Staff Management' },
    { to: '/patients', icon: Users, label: 'Patients' },
    { to: '/appointments', icon: Calendar, label: 'Appointments' },
  ],
};

export function Sidebar({ user, onSignOut }: SidebarProps) {
  const menuItems = roleMenus[user.role] || [];

  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ClinicCare</h1>
            <p className="text-sm text-gray-500">Management System</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="text-sm text-gray-500">Signed in as</div>
        <div className="font-semibold text-gray-900">{user.first_name} {user.last_name}</div>
        <div className="text-sm text-blue-600 capitalize">{user.role.replace('_', ' ')}</div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onSignOut}
          className="flex items-center space-x-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}