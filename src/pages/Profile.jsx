import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProfileInfoCard from '../components/profile/ProfileInfoCard';
import EditableInfoCard from '../components/profile/EditableInfoCard';
import ChangePasswordCard from '../components/profile/ChangePasswordCard';
import AccountInfoCard from '../components/profile/AccountInfoCard';
import PrivacyBanner from '../components/profile/PrivacyBanner';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EMPLOYEE_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { env } from '../config/env';
import { mockUserProfile } from '../utils/mockData';
import './Profile.css';

const USE_MOCK = env.useMockData;

const getErrorMessage = (err, fallback) => {
  if (typeof err === 'string') return err;

  if (err?.response?.data?.error?.message) {
    return err.response.data.error.message;
  }

  if (typeof err?.message === 'string') {
    return err.message;
  }

  return fallback;
};

const formatDate = (iso) => {
  if (!iso) return '';

  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const PERSONAL_FIELDS = [
  {
    key: 'dateOfBirth',
    label: 'Date of Birth',
    type: 'date',
    format: formatDate,
  },
  {
    key: 'gender',
    label: 'Gender',
    type: 'select',
    options: ['Male', 'Female', 'Other', 'Prefer not to say'],
  },
  {
    key: 'bloodGroup',
    label: 'Blood Group',
    type: 'select',
    options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  {
    key: 'address',
    label: 'Address',
    type: 'text',
  },
];

const EMERGENCY_FIELDS = [
  {
    key: 'name',
    label: 'Contact Name',
    type: 'text',
  },
  {
    key: 'relationship',
    label: 'Relationship',
    type: 'text',
  },
  {
    key: 'phone',
    label: 'Phone Number',
    type: 'text',
  },
  {
    key: 'email',
    label: 'Email Address',
    type: 'text',
  },
];

const Profile = () => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  useRoleRedirect('employee');

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');

    if (USE_MOCK) {
      setProfile(mockUserProfile);
      setLoading(false);
      return;
    }

    try {
      const res = await apiService.getCurrentUser();

      /*
       * Backend response:
       *
       * {
       *   "success": true,
       *   "data": {
       *     "id": 5,
       *     "name": "Neha Gupta",
       *     "email": "neha.gupta@demo.com",
       *     "employeeCode": "EMP003",
       *     "departmentName": "Finance",
       *     "managerName": "Priya Verma",
       *     ...
       *   }
       * }
       *
       * ProfileInfoCard expects:
       * fullName
       * employeeCode
       * departmentName
       * reportsToName
       */

      const userData = res?.data || {};

      const normalizedProfile = {
        ...userData,

        // Backend "name" -> frontend "fullName"
        fullName: userData.name || '',

        // Backend "managerName" -> frontend "reportsToName"
        reportsToName:
          userData.managerName ||
          userData.reportsToName ||
          '—',
      };

      setProfile(normalizedProfile);
    } catch (err) {
      setError(
        getErrorMessage(err, 'Failed to load your profile.')
      );

      setProfile(mockUserProfile);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleChangePhoto = async (file) => {
    setUploadingPhoto(true);

    try {
      if (USE_MOCK) {
        const localUrl = URL.createObjectURL(file);

        setProfile((prev) => ({
          ...prev,
          avatarUrl: localUrl,
        }));
      } else {
        const res = await apiService.uploadMyAvatar(file);

        setProfile((prev) => ({
          ...prev,
          avatarUrl:
            res?.avatarUrl ??
            res?.data?.avatarUrl ??
            prev.avatarUrl,
        }));
      }
    } catch (err) {
      setError(
        getErrorMessage(err, 'Failed to upload photo.')
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const savePersonalInfo = async (draft) => {
    const payload = {
      dateOfBirth: draft.dateOfBirth,
      gender: draft.gender,
      bloodGroup: draft.bloodGroup,
      address: draft.address,
    };

    if (USE_MOCK) {
      setProfile((prev) => ({
        ...prev,
        ...payload,
      }));

      return;
    }

    const updated = await apiService.updateProfile(payload);

    const updatedData = updated?.data || updated || {};

    setProfile((prev) => ({
      ...prev,
      ...updatedData,
    }));
  };

  const saveEmergencyContact = async (draft) => {
    const payload = {
      emergencyContact: {
        ...draft,
      },
    };

    if (USE_MOCK) {
      setProfile((prev) => ({
        ...prev,
        emergencyContact: draft,
      }));

      return;
    }

    const updated = await apiService.updateProfile(payload);

    setProfile((prev) => ({
      ...prev,
      emergencyContact:
        updated?.data?.emergencyContact ??
        updated?.emergencyContact ??
        draft,
    }));
  };

  const handleChangePassword = async (
    currentPassword,
    newPassword
  ) => {
    if (USE_MOCK) {
      await new Promise((resolve) =>
        setTimeout(resolve, 600)
      );

      return;
    }

    await apiService.changeMyPassword(
      currentPassword,
      newPassword
    );
  };

  if (loading || !profile) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <p>Loading Profile...</p>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Profile"
      breadcrumbs={[
        {
          label: 'Dashboard',
          path: '/dashboard',
        },
        {
          label: 'Profile',
        },
      ]}
      portalLabel={EMPLOYEE_PORTAL.portalLabel}
      navItems={EMPLOYEE_PORTAL.navItems}
      searchPlaceholder={EMPLOYEE_PORTAL.searchPlaceholder}
      user={user}
      onLogout={handleLogout}
    >
      {error && (
        <div className="dashboard-error-banner">
          {error} — showing sample data instead.
        </div>
      )}

      <div className="profile-layout">
        <div className="profile-main-col">

          {/* Profile Information */}
          <div className="dashboard-panel">
            <ProfileInfoCard
              profile={profile}
              onChangePhoto={handleChangePhoto}
              uploadingPhoto={uploadingPhoto}
            />
          </div>

          {/* Change Password */}
          <div className="dashboard-panel">
            <ChangePasswordCard
              onSubmit={handleChangePassword}
            />
          </div>
        </div>

        <div className="profile-sidebar-col">

          {/* Personal Information */}
          <div className="dashboard-panel">
            <EditableInfoCard
              title="Personal Information"
              fields={PERSONAL_FIELDS}
              values={{
                dateOfBirth: profile.dateOfBirth,
                gender: profile.gender,
                bloodGroup: profile.bloodGroup,
                address: profile.address,
              }}
              onSave={savePersonalInfo}
            />
          </div>

          {/* Emergency Contact */}
          <div className="dashboard-panel">
            <EditableInfoCard
              title="Emergency Contact"
              fields={EMERGENCY_FIELDS}
              values={{
                name: profile.emergencyContact?.name,
                relationship:
                  profile.emergencyContact?.relationship,
                phone: profile.emergencyContact?.phone,
                email: profile.emergencyContact?.email,
              }}
              onSave={saveEmergencyContact}
            />
          </div>

          {/* Account Information */}
          <div className="dashboard-panel">
            <AccountInfoCard profile={profile} />
          </div>
        </div>
      </div>

      <PrivacyBanner />
    </DashboardLayout>
  );
};

export default Profile;