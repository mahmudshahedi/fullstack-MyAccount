import React, { useState, useEffect } from 'react';
import './EditUserModal.css';

function EditUserModal({ isOpen, onClose, userId, onSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'USER'
  });
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
        setFormData({
          username: user.username || '',
          password: '',
          name: user.name || '',
          email: user.email || '',
          role: user.role || 'USER'
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Prepare body - only include password if it's provided
      const body = {
        username: formData.username,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        requesterRole: currentUser.role
      };

      if (formData.password && formData.password.trim() !== '') {
        body.password = formData.password;
      }

      const response = await fetch(`/users/edit/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update user' }));
        throw new Error(errorData.message || 'Failed to update user');
      }

      // Reset password field and close modal
      setFormData({
        ...formData,
        password: ''
      });
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
    <div className="edit-user-modal-backdrop" onClick={handleBackdropClick}>
      <div className="edit-user-modal-container" onClick={(e) => e.stopPropagation()}>
        <header className="edit-user-modal-header">
          <h2 className="edit-user-modal-title">Edit User</h2>
        </header>

        <div className="edit-user-modal-content">
          {fetching ? (
            <div className="edit-user-loading">Loading user data...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="edit-user-form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Enter username"
                />
              </div>

              <div className="edit-user-form-group">
                <label htmlFor="password">Password (leave blank to keep current)</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password (optional)"
                />
              </div>

              <div className="edit-user-form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter name"
                />
              </div>

              <div className="edit-user-form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter email"
                />
              </div>

              <div className="edit-user-form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="USER">USER</option>
                </select>
              </div>

              {error && <div className="edit-user-error">{error}</div>}

              <div className="edit-user-form-actions">
                <button
                  type="button"
                  className="edit-user-btn edit-user-btn-cancel"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="edit-user-btn edit-user-btn-submit"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditUserModal;


