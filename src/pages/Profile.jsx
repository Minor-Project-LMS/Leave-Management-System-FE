import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProfileInfoCard from '../components/profile/ProfileInfoCard';
import EditableInfoCard from '../components/profile/EditableInfoCard';
import ChangePasswordCard from '../components/profile/ChangePasswordCard';
import AccountInfoCard from '../components/profile/AccountInfoCard';
import PrivacyBanner from '../components/profile/PrivacyBanner';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EMPLOYEE_PORTAL, MANAGER_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { env } from '../config/env';
import { mockUserProfile } from '../utils/mockData';
import './Profile.css';

const USE_MOCK = env.useMockData;
const MAX_AVATAR_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

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
  const location = useLocation();

  const { user, logout } = useAuth();

  // This page is shared between the Employee Portal (/profile) and the
  // Manager Portal (/manager/profile) — managers get the same profile
  // experience as employees, just with the manager's nav/breadcrumb chrome.
  const isManagerContext = location.pathname.startsWith('/manager');
  const portal = isManagerContext ? MANAGER_PORTAL : EMPLOYEE_PORTAL;
  const dashboardPath = isManagerContext ? '/manager/dashboard' : '/dashboard';
  const dashboardLabel = isManagerContext ? 'Manager Dashboard' : 'Dashboard';

  useRoleRedirect(isManagerContext ? 'manager' : 'employee');

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

  const uploadToBlobStorage = (file, uploadUrl, requiredHeaders = {}) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          // Could add progress state here if needed
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        // This is typically a CORS error
        reject(new Error('CORS error: Network error during upload to blob storage'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was cancelled'));
      });

      xhr.open('PUT', uploadUrl);
      
      // Set required headers from the pre-signed URL response
      Object.entries(requiredHeaders).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
      
      xhr.send(file);
    });
  };

  const handleChangePhoto = async (file) => {
    // Validate file size
    if (file.size > MAX_AVATAR_BYTES) {
      setError('Photo exceeds the 10 MB size limit.');
      return;
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP).');
      return;
    }

    setUploadingPhoto(true);

    try {
      if (USE_MOCK) {
        const localUrl = URL.createObjectURL(file);

        setProfile((prev) => ({
          ...prev,
          avatarUrl: localUrl,
        }));
      } else {
        // Use direct-to-storage upload for avatars
        const uploadUrlResponse = await apiService.initAvatarUpload(
          file.name,
          file.type,
          file.size
        );

        // Handle different response structures - might be direct or wrapped in 'data'
        const responseData = uploadUrlResponse?.data || uploadUrlResponse;
        
        const { attachmentId, uploadUrl, requiredHeaders } = responseData || {};

        if (!uploadUrl) {
          throw new Error('Upload URL not received from server');
        }

        if (!attachmentId) {
          throw new Error('Attachment ID not received from server');
        }

        await uploadToBlobStorage(file, uploadUrl, requiredHeaders);
        const confirmedAvatar = await apiService.confirmAvatarUpload(attachmentId);

        setProfile((prev) => ({
          ...prev,
          avatarUrl:
            confirmedAvatar?.avatarUrl ??
            confirmedAvatar?.data?.avatarUrl ??
            prev.avatarUrl,
        }));
      }
    } catch (err) {
      // If CORS error occurs, fall back to direct upload through backend
      if (err.message && (err.message.includes('CORS') || err.message.includes('Network error') || err.message.includes('Failed to fetch'))) {
        console.warn('CORS error detected for avatar upload, falling back to direct upload');
        try {
          const directUploadResponse = await apiService.uploadAvatarDirect(file);
          
          setProfile((prev) => ({
            ...prev,
            avatarUrl:
              directUploadResponse?.avatarUrl ??
              directUploadResponse?.data?.avatarUrl ??
              prev.avatarUrl,
          }));
        } catch (directErr) {
          setError(
            getErrorMessage(directErr, 'Failed to upload photo.')
          );
        }
      } else {
        setError(
          getErrorMessage(err, 'Failed to upload photo.')
        );
      }
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
          label: dashboardLabel,
          path: dashboardPath,
        },
        {
          label: 'Profile',
        },
      ]}
      portalLabel={portal.portalLabel}
      navItems={portal.navItems}
      searchPlaceholder={portal.searchPlaceholder}
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