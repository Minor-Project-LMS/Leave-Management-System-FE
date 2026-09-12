import { useState } from 'react';
import { DownloadIcon, FileTextIcon, XIcon } from '../icons/Icons';
import { apiService } from '../../services/api';
import './AttachmentList.css';

const AttachmentList = ({
  attachments = [],
  onDownload,
  onDelete,
  showDelete = false,
  disabled = false,
}) => {
  const [downloading, setDownloading] = useState({});
  const [error, setError] = useState('');

  const getFileIcon = (contentType) => {
    // For now, we'll use FileTextIcon for all attachment types
    // Could be enhanced to show different icons based on content type
    return FileTextIcon;
  };

  const handleDownload = async (attachment, entityType, entityId) => {
    setDownloading((prev) => ({ ...prev, [attachment.id]: true }));
    setError('');

    try {
      let downloadUrl = attachment.downloadUrl;

      // If no fresh download URL, fetch one
      if (!downloadUrl) {
        let response;
        if (entityType === 'leave-request') {
          response = await apiService.getLeaveRequestAttachment(entityId, attachment.id);
        } else if (entityType === 'comp-off') {
          response = await apiService.getCompOffAttachment(entityId, attachment.id);
        }

        downloadUrl = response?.downloadUrl || response?.data?.downloadUrl;
      }

      if (downloadUrl) {
        // Open in new tab for download
        window.open(downloadUrl, '_blank');
        
        if (onDownload) {
          onDownload(attachment);
        }
      } else {
        throw new Error('Download URL not available');
      }
    } catch (err) {
      setError(`Failed to download ${attachment.fileName}: ${err.message}`);
    } finally {
      setDownloading((prev) => ({ ...prev, [attachment.id]: false }));
    }
  };

  const handleDelete = (attachment) => {
    if (onDelete) {
      onDelete(attachment);
    }
  };

  if (attachments.length === 0) {
    return (
      <div className="attachment-list-empty">
        No attachments
      </div>
    );
  }

  return (
    <div className="attachment-list">
      {error && (
        <div className="attachment-list-error">{error}</div>
      )}
      
      <ul className="attachment-list-items">
        {attachments.map((attachment) => {
          const isDownloading = downloading[attachment.id];

          return (
            <li key={attachment.id} className="attachment-list-item">
              <FileTextIcon width={16} height={16} className="attachment-list-icon" />
              <div className="attachment-list-info">
                <span className="attachment-list-name">{attachment.fileName}</span>
                <span className="attachment-list-meta">
                  {attachment.uploadedAt && new Date(attachment.uploadedAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="attachment-list-actions">
                <button
                  type="button"
                  className="attachment-list-btn download"
                  onClick={() => handleDownload(attachment)}
                  disabled={disabled || isDownloading}
                  aria-label="Download attachment"
                >
                  <DownloadIcon width={14} height={14} />
                  {isDownloading ? 'Downloading...' : 'Download'}
                </button>
                
                {showDelete && (
                  <button
                    type="button"
                    className="attachment-list-btn delete"
                    onClick={() => handleDelete(attachment)}
                    disabled={disabled}
                    aria-label="Delete attachment"
                  >
                    <XIcon width={14} height={14} />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AttachmentList;