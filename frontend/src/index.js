import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Myaccount from './Myaccount';
import Login from './Login';

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));

  return user ? <Myaccount user={user} /> : <Login onLogin={setUser} />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
