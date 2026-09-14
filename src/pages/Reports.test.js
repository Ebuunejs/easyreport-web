import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Reports from './Reports';
import api from '../api/axios';

jest.mock('../api/axios', () => ({ get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() }));
jest.mock('@mui/x-date-pickers/DatePicker', () => ({ DatePicker: () => <div>Datumswahl</div> }));
jest.mock('@mui/x-date-pickers/LocalizationProvider', () => ({ LocalizationProvider: ({ children }) => children }));

beforeEach(() => {
  jest.clearAllMocks();
  api.get.mockImplementation(url => Promise.resolve({ data: url === '/companies'
    ? [{ id: 2, name: 'Muster AG' }]
    : url === '/employees' ? [{ id: 1, company_id: 2, hourly_rate: '30.15', user: { name: 'Erika', surname: 'Muster' } }]
      : { data: [] } }));
  api.post.mockResolvedValue({ data: { data: {
    total_hours: 8, gross_salary: 241.2, total_deductions: 12.78, net_salary: 228.42,
    total_expenses: 25.5, payout: 253.92,
    deductions: [{ name: 'AHV', value: 5.3, unit: 'percent', amount: 12.78 }],
    expenses: [{ name: 'Fahrtspesen', amount: 25.5 }],
  } } });
});

async function selectOption(index, label) {
  fireEvent.mouseDown(screen.getAllByRole('combobox')[index]);
  fireEvent.click(await screen.findByRole('option', { name: label }));
}

async function openPayroll(type) {
  render(<Reports />);
  fireEvent.click(screen.getByRole('tab', { name: 'Neuen Bericht erstellen' }));
  await waitFor(() => expect(screen.getAllByRole('combobox')[0]).not.toHaveAttribute('aria-disabled', 'true'));
  await selectOption(0, 'Erika Muster');
  await selectOption(2, type);
}

test('company follows employee; hourly payroll includes editable rate, expenses and server preview', async () => {
  await openPayroll('Stundenlohnabrechnung');
  expect(screen.getByRole('combobox', { name: /Firma/ })).toHaveTextContent('Muster AG');
  expect(screen.getByLabelText(/Stundenlohn \(CHF\)/)).toHaveValue('30.15');
  fireEvent.click(screen.getByRole('button', { name: 'Spesen hinzufügen' }));
  fireEvent.change(screen.getByLabelText('Bezeichnung'), { target: { value: 'Fahrtspesen' } });
  fireEvent.change(screen.getByLabelText('Betrag (CHF)'), { target: { value: '25,50' } });
  fireEvent.click(screen.getByRole('button', { name: 'Lohnabrechnung berechnen' }));
  await screen.findByRole('table', { name: 'Lohnberechnung' });
  expect(api.post).toHaveBeenCalledWith('/reports/payroll-preview', expect.objectContaining({
    employee_id: 1, company_id: 2, report_type: 'hourly_payroll', hourly_rate: '30.15',
    expenses: [{ name: 'Fahrtspesen', amount: '25.50' }],
  }));
  expect(within(screen.getByRole('table', { name: 'Lohnberechnung' })).getByText('Auszahlungsbetrag')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/Stundenlohn \(CHF\)/), { target: { value: '35' } });
  expect(screen.queryByRole('table', { name: 'Lohnberechnung' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Spesen 1 löschen' }));
  expect(screen.queryByLabelText('Bezeichnung')).not.toBeInTheDocument();
});

test('fixed payroll submits monthly salary and company', async () => {
  await openPayroll('Fixlohnabrechnung');
  fireEvent.change(screen.getByLabelText(/Monatlicher Fixlohn/), { target: { value: '5000' } });
  fireEvent.click(screen.getByRole('button', { name: 'Bericht generieren' }));
  await screen.findByText('Bericht erfolgreich generiert!');
  expect(api.post).toHaveBeenCalledWith('/reports', expect.objectContaining({
    report_type: 'fixed_payroll', monthly_salary: '5000', company_id: 2, expenses: [],
  }));
});

const savedReport = {
  id: 42, employee_id: 1, report_type: 'fixed_payroll', status: 'generated',
  start_date: '2026-08-01', end_date: '2026-08-31', report_date: '2026-09-09',
  created_at: '2026-09-09T10:00:00', generated_at: '2026-09-09T10:00:00',
  description: 'Original', pdf_path: 'reports/original.pdf',
  employee: { company_id: 2, user: { name: 'Erika', surname: 'Muster' } },
  report_data: { company_id: 2, monthly_salary: 5000, expenses: [{ name: 'Fahrtspesen', amount: 25.5 }] },
};

function mockSavedReports() {
  const fallback = api.get.getMockImplementation();
  api.get.mockImplementation((url, config) => {
    if (url === '/reports') return Promise.resolve({ data: { data: [savedReport], total: 11 } });
    if (url === '/reports/42') return Promise.resolve({ data: savedReport });
    return fallback(url, config);
  });
}

test('pagination exposes other pages and edit saves the existing report', async () => {
  mockSavedReports();
  api.put.mockResolvedValue({ data: savedReport });
  render(<Reports />);
  await screen.findByText('11 Berichte');
  fireEvent.click(screen.getByRole('button', { name: 'Nächste Seite' }));
  await waitFor(() => expect(api.get).toHaveBeenCalledWith('/reports', expect.objectContaining({ params: expect.objectContaining({ page: 2 }) })));
  fireEvent.click(await screen.findByRole('button', { name: 'Bearbeiten' }));
  expect(await screen.findByLabelText(/Monatlicher Fixlohn/)).toHaveValue('5000');
  expect(screen.getByLabelText('Bezeichnung')).toHaveValue('Fahrtspesen');
  fireEvent.change(screen.getByLabelText(/Monatlicher Fixlohn/), { target: { value: '5500' } });
  fireEvent.click(screen.getByRole('button', { name: 'Änderungen speichern' }));
  await screen.findByText('Bericht und PDF erfolgreich aktualisiert!');
  expect(api.put).toHaveBeenCalledWith('/reports/42', expect.objectContaining({ monthly_salary: '5500', company_id: 2 }));
  expect(api.post).not.toHaveBeenCalled();
});

test('deletion requires confirmation and refreshes the list', async () => {
  mockSavedReports();
  api.delete.mockResolvedValue({});
  render(<Reports />);
  fireEvent.click(await screen.findByRole('button', { name: 'Löschen' }));
  expect(api.delete).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Endgültig löschen' }));
  await screen.findByText('Bericht gelöscht.');
  expect(api.delete).toHaveBeenCalledWith('/reports/42');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

test('list refresh failures are shown rather than silently leaving stale data', async () => {
  const fallback = api.get.getMockImplementation();
  api.get.mockImplementation((url, config) => url === '/reports' ? Promise.reject(new Error('Network')) : fallback(url, config));
  render(<Reports />);
  expect(await screen.findByText(/Berichtsliste konnte nicht aktualisiert/)).toBeInTheDocument();
});
