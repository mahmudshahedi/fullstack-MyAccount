import React, { useEffect, useState } from 'react';
import './Login.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '', captcha: '' });
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaKey, setCaptchaKey] = useState(Date.now());
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const loadCaptcha = async () => {
    setLoadingCaptcha(true);
    try {
      const res = await fetch(`/users/captcha?t=${Date.now()}`, {
        credentials: 'include',
        headers: { Accept: 'image/svg+xml' },
      });
      if (!res.ok) throw new Error('captcha status ' + res.status);
      const svgText = await res.text();
      setCaptchaSvg(svgText);
      setCaptchaKey(Date.now());
    } catch (err) {
      setCaptchaSvg('');
    } finally {
      setLoadingCaptcha(false);
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      loadCaptcha();
    }, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/users/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('invalid');
      const data = await res.json();

      const userPayload = {
        id: data.id,
        username: data.username,
        role: data.role,
        name: form.username,
      };
      localStorage.setItem('user', JSON.stringify(userPayload));
      onLogin(userPayload);
    } catch (err) {
      setError('Invalid username/password or captcha.');
    } finally {
      setForm(prev => ({ ...prev, captcha: '' }));
      loadCaptcha();
    }
  };

  return (
    <div className="wrapper">
      <div className="login-box">
        <form onSubmit={handleSubmit}>
          <h2>Login</h2>
          <div className="sub-heading">My Account App</div>

          <div className="input-box">
            <span className="icon"><i className="fa-solid fa-user" /></span>
            <input name="username" type="text" value={form.username} onChange={handleChange} required />
            <label>Username</label>
          </div>

          <div className="input-box">
            <span className="icon"><i className="fa-solid fa-lock" /></span>
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
            <label>Password</label>
          </div>

          <div className="captcha-block">
            <div className="captcha-section">
              <div
                key={captchaKey}
                className="captcha-image"
                dangerouslySetInnerHTML={{ __html: captchaSvg }}
              />
              <button type="button" className="reload" onClick={loadCaptcha} disabled={loadingCaptcha} aria-label="Reload captcha">
                {loadingCaptcha ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-rotate-right" />}
              </button>
            </div>

            <div className="input-box">
              <span className="icon"><i className="fa-solid fa-shield-halved" /></span>
              <input name="captcha" type="text" value={form.captcha} onChange={handleChange} required />
              <label>Captcha</label>
            </div>
          </div>

          <button type="submit">Login</button>
          {error ? <div className="error-text">{error}</div> : null}
        </form>
      </div>
    </div>
  );
}
