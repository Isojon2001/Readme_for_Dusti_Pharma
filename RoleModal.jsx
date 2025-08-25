import React, { useState } from 'react';

function RoleModal({ user, onClose, onSave }) {
  const [selectedRole, setSelectedRole] = useState(user?.Роль || '');

  const handleSubmit = () => {
    if (!selectedRole) return;
    onSave(user.id, selectedRole);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Изменить роль</h2>
        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
          <option value="">Выберите роль</option>
          <option value="admin">Администратор</option>
          <option value="moderator">Модератор</option>
        </select>
        <div className="modal-actions">
          <button onClick={handleSubmit}>Сохранить</button>
          <button onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
}

export default RoleModal;
