// src/schema/roleSchema.js
export const roleTableColumns = [
  { key: 'id', label: 'Id', isSortable: true },
  { key: 'name', label: 'Name', isSortable: true },
  { key: 'description', label: 'Description', isSortable: true },
  { key: 'permissions', label: 'Permissions', isSortable: true },
  { key: 'userCount', label: 'User Count', isSortable: true }
];

export const roleFormFields = [
  { key: 'id', type: 'hidden' },
  { key: 'name', label: 'Name', type: 'text', validation: { required: false } },
  { key: 'description', label: 'Description', type: 'text', validation: { required: false } },
  { key: 'permissions', label: 'Permissions', type: 'text', validation: { required: false } },
  { key: 'userCount', label: 'User Count', type: 'number', validation: { required: false } }
];

export const initialRoleForm = {
  name: '',
  description: '',
  permissions: '',
  userCount: 0,
};
