import React, { useState, useEffect } from 'react';
import './DeleteUserModal.css';

function DeleteUserModal({ isOpen, onClose, userId, onSuccess }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  // Fetch user data when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchUserData();
    }
  }, [isOpen, userId]);

  const fetchUserData = async () => {
    setFetching(true);
    setError('');
    try {
      const response = await fetch('/users', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const users = await response.json();
      const user = users.find(u => (u._id || u.id) === userId);

      if (user) {
        setUserInfo({
          username: user.username || 'N/A',
          role: user.role || 'N/A'
        });
      } else {
        setError('User not found');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Failed to load user data');
    } finally {
      setFetching(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setLoading(true);

    try {
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(`/users/delete/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requesterRole: currentUser.role
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete user' }));
        throw new Error(errorData.message || 'Failed to delete user');
      }

      onSuccess();
      onClose();
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="delete-user-modal-backdrop" onClick={handleBackdropClick}>
      <div className="delete-user-modal-container" onClick={(e) => e.stopPropagation()}>
        <header className="delete-user-modal-header">
          <h2 className="delete-user-modal-title">Delete User</h2>
        </header>

        <div className="delete-user-modal-content">
          {fetching ? (
            <div className="delete-user-loading">Loading user data...</div>
          ) : error && !userInfo ? (
            <div className="delete-user-error">{error}</div>
          ) : (
            <>
              <div className="delete-user-warning">
                <i className="fas fa-exclamation-triangle"></i>
                <p>Are you sure you want to delete this user?</p>
              </div>

              {userInfo && (
                <div className="delete-user-info">
                  <div className="delete-user-info-item">
                    <span className="delete-user-info-label">Username:</span>
                    <span className="delete-user-info-value">{userInfo.username}</span>
                  </div>
                  <div className="delete-user-info-item">
                    <span className="delete-user-info-label">Role:</span>
                    <span className="delete-user-info-value">{userInfo.role}</span>
                  </div>
                </div>
              )}

              <div className="delete-user-note">
                This action cannot be undone.
              </div>

              {error && <div className="delete-user-error">{error}</div>}

              <div className="delete-user-form-actions">
                <button
                  type="button"
                  className="delete-user-btn delete-user-btn-cancel"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="delete-user-btn delete-user-btn-delete"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DeleteUserModal;


