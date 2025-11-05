import React, { useState } from 'react';
import './Myaccount.css';
import Usermanagement from './Usermanagement';

function Myaccount({ user }) {
  const currentUser = user || { username: 'Guest', role: 'USER' };
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
      sessionStorage.clear();
    } catch (error) {
      console.error('Error during logout:', error);
    }
    window.location.reload();
  };

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const isAdmin = currentUser.role === 'ADMIN';
  const isUser = currentUser.role === 'USER';

  const canSeeSuperAdminCard = isSuperAdmin;
  const canSeeAdminCard = isSuperAdmin || isAdmin;
  const canSeeUsersCard = isSuperAdmin || isAdmin || isUser;

  const renderCardContent = (canSee) => (canSee ? (
    <div className="card-content-text">Card content</div>
  ) : (
    <div className="card-access-denied">Access denied</div>
  ));

  return (
    <div className="App">
      <main className="main-card" role="main" aria-label="Dashboard">
        <header className="main-header">
          <div className="header-left-actions">
            <button className="Btn" onClick={handleLogout} aria-label="Logout">
              <div className="sign">
                <svg viewBox="0 0 512 512" aria-hidden="true"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path></svg>
              </div>
              <div className="text">Logout</div>
            </button>
            {isSuperAdmin && (
              <button 
                className="um-btn" 
                type="button" 
                aria-label="User Management"
                onClick={() => setIsUserManagementOpen(true)}
              >
                User Management
              </button>
            )}
          </div>
          <div className="header-greeting">Hi, {currentUser.username}</div>
        </header>

        <section className="cards-area" aria-label="Role cards">
          <div className="card role-card dark" aria-live="polite">
            <h2>Super Admin Card</h2>
            <small className="card-visibility">Only Super Admin can see</small>
            {renderCardContent(canSeeSuperAdminCard)}
          </div>

          <div className="card role-card dark" aria-live="polite">
            <h2>Admin Card</h2>
            <small className="card-visibility">Only Admin and Super can see</small>
            {renderCardContent(canSeeAdminCard)}
          </div>

          <div className="card role-card dark" aria-live="polite">
            <h2>Users Card</h2>
            <small className="card-visibility">Super Admin, Admin and Users can see</small>
            {renderCardContent(canSeeUsersCard)}
          </div>
        </section>
      </main>
      
      {/* User Management Modal */}
      <Usermanagement 
        isOpen={isUserManagementOpen} 
        onClose={() => setIsUserManagementOpen(false)} 
      />
    </div>
  );
}

export default Myaccount;
