import React, { useEffect, useState } from 'react';
import { LayoutGrid, Users, User } from 'lucide-react';
import SidebarItem from './SidebarItem';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../index.css';

function MobileApp() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    if (!token) return;

    fetch('http://api.dustipharma.tj:1212/api/v1/app/profile/users', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        const payload = data.payload;
        if (Array.isArray(payload)) {
          setProfile(payload[0] || null);
        } else if (typeof payload === 'object') {
          setProfile(payload);
        } else {
          console.warn('Неподдерживаемый формат профиля:', payload);
        }
      })
      .catch(error => {
        console.error('Ошибка при загрузке профиля:', error);
      });
  }, [token]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        'http://api.dustipharma.tj:1212/api/v1/app/categories/all',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const payload = response.data.payload.data;

      if (Array.isArray(payload)) {
        const safeCategories = payload.map(item => ({
          id: item.id,
          name: item.name ?? 'Без названия',
          description: item.description ?? '',
        }));
        setCategories(safeCategories);
      } else {
        console.error('Неправильная структура данных:', payload);
      }
    } catch (error) {
      console.error('Ошибка при получении категорий:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div>
          <div className="sidebar_logo">
            <img src="./Dusti_pharma.png" width="40" height="40" alt="logo" />
            <h2>Дусти фарма</h2>
          </div>

          <div className="sidebar-menu">
            <SidebarItem icon={LayoutGrid} label="Статистика" to="/dashboard" />
            <SidebarItem icon={() => <img src="./Icons-3.svg" alt="Роли и права" />} label="Роли и права" to="/RoleAndRoot" />
            <SidebarItem icon={Users} label="Partner" to="/Partner" />
            <SidebarItem icon={() => <img src="./Icons-4.svg" alt="MobileApp" />} label="Панель MobileApp" to="/mobile" />
            <SidebarItem icon={() => <img src="./call.svg" width={20} height={20} alt="Звонки" />} label="Журнал звонков" to="/calls" />
          </div>
        </div>

        <div className="sidebar_block">
          <p>Служба поддержки</p>
          <div className="sidebar_user">
            <div className="logo_flex">
              <div className="logo_user"><User className="user-icon"/></div>
              <div className="logo_profile">
                <h3>{profile?.['Наименование']?.trim() || 'Имя не указано'}</h3>
                <p>{profile?.['ВидКонтрагента']?.trim() || 'Филиал не указан'}</p>
              </div>
                <button onClick={handleLogout} className="logout-btn">Выйти</button>
            </div>
          </div>
        </div>
      </aside>

      <main className="content">
        <div className="panel_content">
          <h2>Панель MobileApp</h2>
          <div className="panel_mobile">
            <div className="panel_button">
              <h4>Управление категориями</h4>
              <div className="panel_btn">
                <button type="button">Все категории</button>
                <button type="button" onClick={() => navigate('/add-category')}>Добавить</button>
              </div>
            </div>

            <div className="panel_button">
              <h4>Push-Уведомления</h4>
              <div className="panel_btn">
                <button type="button">История</button>
                <button type="button">Добавить</button>
              </div>
            </div>

            <div className="panel_button">
              <h4>Управление блоками</h4>
              <div className="panel_btn">
                <button type="button">История</button>
                <button type="button" onClick={() => navigate('/add-category')}>Добавить</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MobileApp;
