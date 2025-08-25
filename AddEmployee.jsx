import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Breadcrumb from '../components/Breadcrumb';
import '../index.css';

function AddEmployee() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    confirm: '',
    role: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const { name, phone, password, confirm, role } = form;
    if (!name || !phone || !password || !confirm || !role) return 'Заполните все поля';
    if (password !== confirm) return 'Пароли не совпадают';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!token) {
      setError('Токен не найден. Авторизуйтесь заново.');
      return;
    }

    const payload = {
      counterparty_type: form.role,
      name: form.name,
      numberPhone: form.phone,
      password: form.password,
    };

    try {
      const response = await fetch('http://api.dustipharma.tj:1212/api/v1/app/admin/users', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        const message = result?.message || `Ошибка: ${response.status}`;
        throw new Error(message);
      }

      setSuccess('Сотрудник успешно добавлен');
      navigate('/RoleAndRoot', { state: { refresh: true } });

    } catch (err) {
      console.error('Ошибка при добавлении:', err.message);
      setError(`${err.message}`);
    }
  };

  return (
    <div className="add-employee-page">
      <Breadcrumb
        className="category_breadcrumb"
        items={[
          { label: 'RoleAndRoot', to: '/RoleAndRoot' },
          { label: 'Добавление сотрудника' },
        ]}
      />

      <div className="addEmployee_paragraph">
        <div>
          <h1>Роли и права</h1>
          <p>Добавьте сотрудников с полными правами администратора, ограничьте доступ по разделам</p>
        </div>
        <div className="category_btn">
          <button type="button" onClick={() => navigate('/RoleAndRoot')}>Отменить</button>
          <button type="submit" form="add-employee-form">Сохранить</button>
        </div>
      </div>

      <form id="add-employee-form" onSubmit={handleSubmit} className="add-form">
        <div className="left-form">
          <h4>Данные сотрудника</h4>

          <label>Ф.И.О</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required />

          <label>Номер телефона</label>
          <input type="tel" name="phone" value={form.phone} onChange={handleChange} required />

          <label>Пароль</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required />

          <label>Подтвердите пароль</label>
          <input type="password" name="confirm" value={form.confirm} onChange={handleChange} required />
        </div>

        <div className="right-form">
          <h4>Системные роли</h4>
          <div className="radio-form">
            {['admin', 'moderator'].map((role) => (
              <label key={role} className="radio-option">
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={form.role === role}
                  onChange={handleChange}
                />
                <span className="custom-radio-check">✔</span>
                <div>
                  <h1>{role === 'admin' ? 'Администратор' : 'Модератор'}</h1>
                  <p>
                    {role === 'admin'
                      ? 'Все права к CRM системе: добавление, удаление, редактирование, доступы'
                      : 'Доступ к Panel Mobile App и Журналу Звонков'}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </form>

      {(error || success) && (
        <div className="form-feedback">
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
      )}
    </div>
  );
}

export default AddEmployee;
