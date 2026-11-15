
const API_URL = 'http://localhost:3000/api/air-quality';

export async function getAirQuality(city = '') {
  const params = new URLSearchParams();

  if (city.trim()) {
    params.set('city', city.trim());
  }

  const url = params.toString()
    ? `${API_URL}?${params.toString()}`
    : API_URL;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Помилка сервера: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error('Некоректна відповідь API');
  }

  return result.data;
}


async function sendRequest(url, method, body) {
  let response;

  try {
    response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Сервер не відповідає.');
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    const details = result.error ? `: ${result.error}` : '';
    throw new Error(`${result.message || `Помилка сервера: ${response.status}`}${details}`);
  }

  return result;
}

export function createAirQuality(measurement) {
  return sendRequest(API_URL, 'POST', measurement);
}

export function updateAirQuality(id, measurement) {
  return sendRequest(`${API_URL}/${id}`, 'PUT', measurement);
}

export function deleteAirQuality(id) {
  return sendRequest(`${API_URL}/${id}`, 'DELETE');
}