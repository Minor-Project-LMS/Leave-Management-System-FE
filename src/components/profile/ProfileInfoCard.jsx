import AvatarUpload from '../common/AvatarUpload';
import { getAvatarColor, getInitials } from '../../utils/avatarColor';
import './ProfileInfoCard.css';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

// All fields here are HR-managed (per UserProfileUpdate — only `phone` is
// self-editable, and there's no edit affordance in the design for this
// card), so everything renders as a disabled/read-only field.
const ProfileInfoCard = ({ profile, onChangePhoto, uploadingPhoto }) => {
  const color = getAvatarColor(profile.fullName);

  const handleAvatarUpload = async (file, localPreview) => {
    await onChangePhoto?.(file);
  };

  return (
    <div className="profile-info-card">
      <div className="widget-header">
        <h3>Profile Information</h3>
      </div>

      <div className="profile-info-body">
        <div className="profile-info-photo-col">
          <AvatarUpload
            currentAvatarUrl={profile.avatarUrl}
            onUploadComplete={handleAvatarUpload}
            disabled={uploadingPhoto}
            size={120}
          />
        </div>

        <div className="profile-info-grid">
          <div className="form-field">
            <label>Full Name</label>
            <input type="text" value={profile.fullName || ''} readOnly />
          </div>
          <div className="form-field">
            <label>Employee ID</label>
            <input type="text" value={profile.employeeCode || ''} readOnly />
          </div>
          <div className="form-field">
            <label>Email Address</label>
            <input type="text" value={profile.email || ''} readOnly />
          </div>
          <div className="form-field">
            <label>Phone Number</label>
            <input type="text" value={profile.phone || ''} readOnly />
          </div>
          <div className="form-field">
            <label>Department</label>
            <input type="text" value={profile.departmentName || ''} readOnly />
          </div>
          <div className="form-field">
            <label>Designation</label>
            <input type="text" value={profile.designation || ''} readOnly />
          </div>
          <div className="form-field">
            <label>Date of Joining</label>
            <input type="text" value={formatDate(profile.dateOfJoining)} readOnly />
          </div>
          <div className="form-field">
            <label>Reporting Manager</label>
            <input type="text" value={profile.reportsToName || '—'} readOnly />
          </div>
          <div className="form-field">
            <label>Work Location</label>
            <input type="text" value={profile.workLocation || ''} readOnly />
          </div>
          <div className="form-field">
            <label>Employee Type</label>
            <input type="text" value={profile.employmentType || ''} readOnly />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoCard;
