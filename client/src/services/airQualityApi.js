
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
