import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SidebarItem({ icon: Icon, label, to }) {
  const { user } = useAuth();
  const role =
    user?.Роль?.toLowerCase() ||
    user?.ВидКонтрагента?.toLowerCase() ||
    user?.counterparty_type?.toLowerCase();

  const isModerator = role === 'moderator';
  const allowedForModerator = ['/mobile', '/calls'];

  if (isModerator && !allowedForModerator.includes(to)) {
    return null;
  }

  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          isActive ? 'sidebar-link active' : 'sidebar-link'
        }
      >
        {Icon && <Icon size={20} />}
        <span>{label}</span>
      </NavLink>
    </li>
  );
}

export default SidebarItem;