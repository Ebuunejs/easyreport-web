import api from '../api/axios';

const PayrollDeductionService = {
  async getAll() {
    const response = await api.get('/payroll-deductions');
    return response.data.data;
  },
  async save(row) {
    const payload = { booking_number: row.booking_number?.trim() || null, name: row.name.trim(), value: row.value.replace(',', '.'), unit: row.unit };
    const response = row.id
      ? await api.put(`/payroll-deductions/${row.id}`, payload)
      : await api.post('/payroll-deductions', payload);
    return response.data.data;
  },
  async remove(id) {
    await api.delete(`/payroll-deductions/${id}`);
  },
};

export default PayrollDeductionService;
