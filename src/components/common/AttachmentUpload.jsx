import { useState, useRef, useEffect } from 'react';
import { PaperclipIcon, PlusIcon, XIcon } from '../icons/Icons';
import './AttachmentUpload.css';

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

const formatBytes = (bytes) => {
  const kb = bytes / 1024;
  return kb < 1024
    ? `${Math.round(kb)} KB`
    : `${(kb / 1024).toFixed(1)} MB`;
};

const AttachmentUpload = ({
  onUploadComplete,
  entityType = 'leave-request',
  entityId,
  maxFiles = 5,
  accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  disabled = false,
  isRequired = false,
  uploadRef,
}) => {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const uploadMethodsRef = useRef(null);

  // Expose upload methods to parent via ref
  useEffect(() => {
    if (uploadRef) {
      uploadMethodsRef.current = {
        upload: handleUpload,
      };
      uploadRef(uploadMethodsRef.current);
    }
  }, [uploadRef, entityId, files]);

  const handleAddFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;

    if (files.length + picked.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    const tooBig = picked.find((file) => file.size > MAX_FILE_BYTES);
    if (tooBig) {
      setError(`"${tooBig.name}" exceeds the 10 MB attachment limit.`);
      return;
    }

    setError('');
    setFiles((prev) => [...prev, ...picked]);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadToStorage = (file, uploadUrl, requiredHeaders = {}) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: progress,
          }));
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

  const handleUpload = async (initUpload, confirmUpload) => {
    if (!entityId) {
      setError('Entity ID is required for upload.');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress({});

    try {
      const uploadedAttachments = [];

      for (const file of files) {
        try {
          // Step 1: Initialize upload
          const initResponse = await initUpload(entityId, file.name, file.type, file.size);
          const responseData = initResponse?.data || initResponse;
          const { attachmentId, uploadUrl, requiredHeaders } = responseData || {};

          if (!uploadUrl || !attachmentId) {
            throw new Error('Invalid upload response from server');
          }

          // Step 2: Upload directly to storage
          await uploadToStorage(file, uploadUrl, requiredHeaders);

          // Step 3: Confirm upload
          const confirmResponse = await confirmUpload(entityId, attachmentId);
          uploadedAttachments.push(confirmResponse?.data || confirmResponse);
        } catch (err) {
          throw new Error(`Failed to upload ${file.name}: ${err.message}`);
        }
      }

      setFiles([]);
      setUploadProgress({});
      
      if (onUploadComplete) {
        onUploadComplete(uploadedAttachments);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload files.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="attachment-upload">
      <label>
        Attach Document {isRequired ? '*' : '(Optional)'}
      </label>

      {files.length > 0 && (
        <ul className="attachment-upload-file-list">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`}>
              <PaperclipIcon width={14} height={14} />
              <div className="attachment-upload-file-info">
                <span className="attachment-upload-file-name">{file.name}</span>
                <span className="attachment-upload-file-size">{formatBytes(file.size)}</span>
                {uploadProgress[file.name] !== undefined && (
                  <div className="attachment-upload-progress">
                    <div
                      className="attachment-upload-progress-bar"
                      style={{ width: `${uploadProgress[file.name]}%` }}
                    />
                    <span className="attachment-upload-progress-text">
                      {uploadProgress[file.name]}%
                    </span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label="Remove file"
                disabled={disabled || uploading}
              >
                <XIcon width={13} height={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="attachment-upload-add-file"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading || files.length >= maxFiles}
      >
        <PlusIcon width={14} height={14} />
        Add {files.length > 0 ? 'Another' : ''} File
      </button>

      {error && (
        <div className="attachment-upload-error">{error}</div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={handleAddFiles}
        accept={accept}
        disabled={disabled || uploading}
      />
    </div>
  );
};

export default AttachmentUpload;