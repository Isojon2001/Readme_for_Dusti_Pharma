import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: loginByToken } = useAuth();

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(
        'http://api.dustipharma.tj:1212/api/v1/app/auth/sign-in',
        { login, password }
      );

      const { token, ...user } = response.data.payload || {};

      if (!token || !user) {
        setError('Некорректный ответ от сервера');
        return;
      }
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      loginByToken(user, token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Ошибка входа:', err);
      if (err.response?.status === 401) {
        setError('Неверный номер телефона или пароль');
      } else {
        setError('Ошибка подключения к серверу');
      }
    }
  };

  return (
    <div className="registration">
      <form onSubmit={handleSubmit}>
        <div className="registration_paragraph">
          <h1>Авторизоваться</h1>
          <p>Введите ваши данные для входа</p>
        </div>

        <div className="forms">
          <div className="form">
            <input
              type="text"
              placeholder="Номер телефона"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              name="login"
              required
            />
          </div>

          <div className="form eyes">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              name="password"
              required
            />
            <span onClick={togglePassword}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <div className="registration_forgot">
            <label>
              <input type="checkbox" name="rememberMe" /> Запомнить меня
            </label>
            <a href="#">Забыли пароль?</a>
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <button type="submit">Войти</button>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
