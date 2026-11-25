/* @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import App from './App';
import api from './api';

vi.mock('./api', () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn(), put: vi.fn() } }));
const day = 86400000;
const product = { _id: 'p1', name: 'Organic Apples', category: 'Fruits', price: 3.5, unit: 'kg', stock: 20, farmer: { _id: 'f1', farmName: 'Green Farm' }, seasonStart: new Date(Date.now()-30*day).toISOString(), seasonEnd: new Date(Date.now()+30*day).toISOString() };
const future = { ...product, _id: 'p2', name: 'Summer Peaches', seasonStart: new Date(Date.now()+60*day).toISOString(), seasonEnd: new Date(Date.now()+90*day).toISOString() };
const slot = { _id: 's1', date: new Date(Date.now()+day).toISOString().slice(0,10), window: 'Morning 8-12', capacity: 10, booked: 0 };
function open(path, buyer = false) {
  window.history.replaceState({}, '', path);
  if (buyer) {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ _id: 'b1', name: 'Test Buyer', role: 'buyer' }));
  }
  return render(<App />);
}
async function addApple(user) {
  // Select the product by its visible name, then scope the button to its card.
  const name = await screen.findByText('Organic Apples');
  await user.click(within(name.closest('article')).getByRole('button', { name: 'Add', exact: true }));
}
beforeEach(() => {
  localStorage.clear();
  vi.resetAllMocks();
  vi.stubGlobal('scrollTo', vi.fn());
  api.get.mockImplementation(async url => ({ data: url === '/products' ? [product, future] : url === '/slots' ? [slot] : [] }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('Farm-to-Table Frontend Tests', () => {
  it('1. Renders login form correctly', () => {
    open('/login');
    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password (8+ characters)')).toBeInTheDocument();
  });
  it('2. Displays invalid login error', async () => {
    api.post.mockRejectedValue({ response: { data: { message: 'Invalid credentials' } } });
    const user = userEvent.setup(); open('/login');
    await user.type(screen.getByPlaceholderText('Email address'), 'buyer@example.com');
    await user.type(screen.getByPlaceholderText('Password (8+ characters)'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: 'Log in', exact: true }));
    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith('/auth/login', expect.objectContaining({ email: 'buyer@example.com', password: 'wrongpassword' }));
  });
  it('3. Displays required farmer registration fields', async () => {
    const user = userEvent.setup(); open('/register');
    expect(screen.queryByPlaceholderText('Farm name')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /I want to sell/ }));
    expect(screen.getByPlaceholderText('Farm name')).toBeRequired();
  });
  it('4. Displays available products', async () => {
    open('/shop');
    expect(await screen.findByText('Organic Apples')).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/products');
  });
  it('5. Filters out-of-season products in the catalogue', async () => {
    const user = userEvent.setup(); open('/shop');
    await screen.findByText('Organic Apples');
    const filter = screen.getByRole('checkbox', { name: /In season now/ });
    expect(filter).toBeChecked();
    expect(screen.queryByText('Summer Peaches')).not.toBeInTheDocument();
    await user.click(filter);
    expect(await screen.findByText('Summer Peaches')).toBeInTheDocument();
    expect(within(screen.getByText('Summer Peaches').closest('article')).getByRole('button', { name: 'Unavailable' })).toBeDisabled();
  });
  it('6. Adds product to shopping cart', async () => {
    const user = userEvent.setup(); open('/shop', true);
    await addApple(user);
    expect(screen.getByRole('link', { name: 'Cart', exact: true })).toHaveTextContent('1');
    await user.click(screen.getByRole('link', { name: 'Cart', exact: true }));
    expect(screen.getByRole('heading', { name: 'Your cart' })).toBeInTheDocument();
    expect(screen.getByText('Organic Apples')).toBeInTheDocument();
  });
  it('7. Calculates cart total correctly', async () => {
    const user = userEvent.setup(); open('/shop', true);
    await addApple(user);
    await user.click(screen.getByRole('link', { name: 'Cart', exact: true }));
    await user.click(screen.getByRole('button', { name: '+', exact: true }));
    expect(screen.getByText('Total', { exact: true }).parentElement).toHaveTextContent('€7.00');
    expect(screen.getByRole('link', { name: 'Cart', exact: true })).toHaveTextContent('2');
  });
  it('8. Requires delivery details before checkout', async () => {
    const user = userEvent.setup(); open('/shop', true);
    await addApple(user);
    await user.click(screen.getByRole('link', { name: 'Cart', exact: true }));
    const button = screen.getByRole('button', { name: /Place order/ });
    expect(button).toBeDisabled();
    await screen.findByRole('option', { name: /Morning 8-12/ });
    await user.selectOptions(screen.getByRole('combobox'), 's1');
    expect(button).toBeDisabled();
    await user.type(screen.getByPlaceholderText('Street, town, county, Eircode'), '123 Test Street');
    expect(button).toBeEnabled();
  });
});
