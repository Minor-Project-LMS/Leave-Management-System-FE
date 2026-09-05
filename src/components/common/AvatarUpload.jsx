import { useState, useRef, useEffect } from 'react';
import { CameraIcon, XIcon } from '../icons/Icons';
import './AvatarUpload.css';

const MAX_AVATAR_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

const AvatarUpload = ({
  currentAvatarUrl,
  onUploadComplete,
  disabled = false,
  size = 120,
}) => {
  const [previewUrl, setPreviewUrl] = useState(currentAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPreviewUrl(currentAvatarUrl);
  }, [currentAvatarUrl]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    setError('');

    // Create preview
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    // Upload the file
    handleUpload(file, localPreview);
  };

  const uploadToStorage = (file, uploadUrl, requiredHeaders = {}) => {
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
        reject(new Error('Network error during upload to storage'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was cancelled'));
      });

      xhr.open('PUT', uploadUrl);
      Object.entries(requiredHeaders).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
      xhr.send(file);
    });
  };

  const handleUpload = async (file, localPreview) => {
    setUploading(true);

    try {
      // This will be called with the actual upload functions from parent
      if (onUploadComplete) {
        await onUploadComplete(file, localPreview);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload photo.');
      // Revert to original avatar on error
      setPreviewUrl(currentAvatarUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="avatar-upload" style={{ width: size, height: size }}>
      <div
        className="avatar-upload-preview"
        style={{ width: size, height: size }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Profile avatar"
            style={{ width: size, height: size }}
          />
        ) : (
          <div
            className="avatar-upload-placeholder"
            style={{ width: size, height: size, fontSize: size / 3 }}
          >
            {getInitials('User')}
          </div>
        )}
        
        {!disabled && (
          <button
            type="button"
            className="avatar-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            aria-label="Change photo"
          >
            <CameraIcon width={16} height={16} />
          </button>
        )}
      </div>

      {error && (
        <div className="avatar-upload-error">{error}</div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        hidden
        onChange={handleFileSelect}
        disabled={disabled || uploading}
      />
    </div>
  );
};

export default AvatarUpload;