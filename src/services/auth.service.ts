const API_URL = 'http://localhost:4000/api';

export const loginService = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Credenciales incorrectas');
  return data;
};

export const registerService = async (
  nombre: string,
  apellido: string,
  email: string,
  password: string
) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, apellido, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al registrar');
  return data;
};