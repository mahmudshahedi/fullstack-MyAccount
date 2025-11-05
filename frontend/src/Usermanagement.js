import React, { useState, useEffect } from 'react';
import './Usermanagement.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import DeleteUserModal from './DeleteUserModal';

// User Management Modal Component
function Usermanagement({ isOpen, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Fetch users from API when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Fetch all users from backend API
  const fetchUsers = async () => {
    setLoading(true);
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
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handlers for modals
  const handleAddUser = () => {
    setIsAddModalOpen(true);
  };

  const handleEditUser = (userId) => {
    setSelectedUserId(userId);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (userId) => {
    setSelectedUserId(userId);
    setIsDeleteModalOpen(true);
  };

  // Refresh users list after successful operations
  const handleModalSuccess = () => {
    fetchUsers();
  };

  if (!isOpen) return null;

  return (
    <div className="um-modal-backdrop" onClick={handleBackdropClick}>
      <div className="um-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <header className="um-modal-header">
          <h2 className="um-modal-title">User Management</h2>
        </header>

        {/* Modal Content */}
        <div className="um-modal-content">
          {/* Add User Button */}
          <div className="um-add-user-section">
            <button className="c-button" onClick={handleAddUser} type="button">
              <span className="c-main">
                <span className="c-ico">
                  <span className="c-blur"></span>
                  <span className="ico-text">+</span>
                </span>
                Add User
              </span>
            </button>
          </div>

          {/* Users Table */}
          <div className="um-table-container">
            {loading ? (
              <div className="um-loading">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="um-empty">No users found</div>
            ) : (
              <table className="um-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user._id || user.id}>
                      <td>{index + 1}</td>
                      <td>{user.username || 'N/A'}</td>
                      <td>{user.role || 'N/A'}</td>
                      <td className="um-actions-cell">
                        <button
                          className="um-action-btn um-edit-btn"
                          onClick={() => handleEditUser(user._id || user.id)}
                          type="button"
                          aria-label="Edit user"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="um-action-btn um-delete-btn"
                          onClick={() => handleDeleteUser(user._id || user.id)}
                          type="button"
                          aria-label="Delete user"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
        onSuccess={handleModalSuccess}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}

export default Usermanagement;


