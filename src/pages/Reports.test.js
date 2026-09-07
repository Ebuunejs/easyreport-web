import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Reports from './Reports';
import api from '../api/axios';

jest.mock('../api/axios', () => ({ get: jest.fn(), post: jest.fn() }));
jest.mock('@mui/x-date-pickers/DatePicker', () => ({ DatePicker: () => <div>Datumswahl</div> }));
jest.mock('@mui/x-date-pickers/LocalizationProvider', () => ({ LocalizationProvider: ({ children }) => children }));

beforeEach(() => {
  jest.clearAllMocks();
  api.get.mockImplementation(url => Promise.resolve({ data: url === '/companies'
    ? [{ id: 2, name: 'Muster AG' }]
    : url === '/public/employees' ? [{ id: 1, company_id: 2, hourly_rate: '30.15', user: { name: 'Erika', surname: 'Muster' } }]
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
