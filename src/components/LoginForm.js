import { useState } from 'react';
import api from '../services/api';
import '../styles/LoginForm.css';

const LoginForm = ({ onLogin, isOpen, onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        const response = await api.post('/auth/register', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
        const { token, id, username, email } = response.data;
        const user = { id, username, email };
        if (onLogin) onLogin(token, user);
        if (onClose) onClose();
      } else {
        const response = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password,
        });
        const { token, id, username, email, profilePicture } = response.data;
        const user = { id, username, email, profilePicture };
        if (onLogin) onLogin(token, user);
        if (onClose) onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (typeof isOpen !== 'undefined' && !isOpen) return null;

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="login-close" onClick={onClose}>
          <span className="material-icons">close</span>
        </button>

        <div className="login-header">
          <img src="/logo.jpg" alt="Vibehind" className="login-logo" />
          <h2 className="login-title">
            {isRegister ? 'Vibehind\'e Katıl' : 'Vibehind\'e Hoş Geldin'}
          </h2>
          <p className="login-subtitle">
            {isRegister ? 'Yeni bir hesap oluştur' : 'Hesabına giriş yap'}
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <div className="form-group">
              <label>
                <span className="material-icons">person</span>
                Kullanıcı Adı
              </label>
              <input
                type="text"
                name="username"
                placeholder="Kullanıcı adını gir"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          )}
          
          <div className="form-group">
            <label>
              <span className="material-icons">email</span>
              E-posta
            </label>
            <input
              type="email"
              name="email"
              placeholder="E-posta adresini gir"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>
              <span className="material-icons">lock</span>
              Şifre
            </label>
            <input
              type="password"
              name="password"
              placeholder="Şifreni gir"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="login-submit-btn" disabled={isLoading}>
            {isLoading ? (isRegister ? 'Kaydediliyor...' : 'Giriş yapılıyor...') : (isRegister ? '💖 Hesap Oluştur' : '💖 Giriş Yap')}
          </button>
        </form>

        <div className="login-divider">
          <span>veya</span>
        </div>

        <div className="social-login">
          <button className="social-btn google">
            <svg className="google-logo" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
              <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
              <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
              <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
            </svg>
            Google ile Devam Et
          </button>
          
          <button className="social-btn apple">
            <svg className="apple-logo" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M16.93 10.27c-.02-2.23 1.82-3.3 1.9-3.35-1.04-1.52-2.65-1.73-3.22-1.75-1.37-.14-2.67.81-3.37.81-.7 0-1.78-.79-2.93-.77-1.51.02-2.9.88-3.68 2.23-1.57 2.73-.4 6.77 1.13 8.99.75 1.09 1.64 2.31 2.81 2.27 1.14-.05 1.57-.74 2.95-.74 1.38 0 1.77.74 2.93.72 1.21-.02 1.99-1.1 2.74-2.2.87-1.27 1.22-2.5 1.24-2.56-.03-.01-2.38-.91-2.4-3.65zM14.43 3.21c.62-.75 1.04-1.79.93-2.83-.9.04-1.98.6-2.62 1.35-.57.66-1.07 1.72-.94 2.73 1 .08 2.01-.5 2.63-1.25z"/>
            </svg>
            Apple ile Devam Et
          </button>
        </div>

        <div className="login-footer">
          <p>
            {isRegister ? 'Zaten hesabın var mı?' : 'Hesabın yok mu?'}
            <button type="button" className="toggle-form-btn" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
