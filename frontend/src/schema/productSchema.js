// src/schema/productSchema.js
export const productTableColumns = [
  { key: 'id', label: 'Id', isSortable: true },
  { key: 'name', label: 'Name', isSortable: true },
  { key: 'description', label: 'Description', isSortable: true },
  { key: 'quantity', label: 'Quantity', isSortable: true }
];

export const productFormFields = [
  { key: 'id', type: 'hidden' },
  { key: 'name', label: 'Name', type: 'text', validation: { required: false } },
  { key: 'description', label: 'Description', type: 'text', validation: { required: false } },
  { key: 'quantity', label: 'Quantity', type: 'number', validation: { required: false } }
];

export const initialProductForm = {
  name: '',
  description: '',
  quantity: 0,
  createdAt: '',
  updatedAt: '',
};
