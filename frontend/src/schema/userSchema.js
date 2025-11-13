// src/schema/userSchema.js
export const userTableColumns = [
  { key: 'id', label: 'Id', isSortable: true },
  { key: 'username', label: 'Username', isSortable: true },
  { key: 'displayName', label: 'Display Name', isSortable: true },
  { key: 'roleId', label: 'Role Id', isSortable: true },
  { key: 'roleName', label: 'Role Name', isSortable: true },
  { key: 'isActive', label: 'Is Active', isSortable: true }
];

export const userFormFields = [
  { key: 'id', type: 'hidden' },
  { key: 'username', label: 'Username', type: 'text', validation: { required: false } },
  { key: 'displayName', label: 'Display Name', type: 'text', validation: { required: false } },
  { key: 'roleId', label: 'Role Id', type: 'number', validation: { required: false } },
  { key: 'roleName', label: 'Role Name', type: 'text', validation: { required: false } },
  { key: 'isActive', label: 'Is Active', type: 'text', validation: { required: false } }
];

export const initialUserForm = {
  username: '',
  displayName: '',
  roleId: 0,
  roleName: '',
  isActive: '',
};
