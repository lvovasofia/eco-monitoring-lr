const CITY_PATTERN = /^[\p{L}\s'’.-]+$/u;

function isEmpty(value) {
  return value === '' || value === null || value === undefined;
}

function checkNumber(value, { label, min, max, required }) {
  if (isEmpty(value)) {
    return required ? `${label}: обов'язкове поле` : null;
  }
  const num = Number(value);
  if (Number.isNaN(num)) return `${label}: має бути числом`;
  if (min !== undefined && num < min) return `${label}: не менше ${min}`;
  if (max !== undefined && num > max) return `${label}: не більше ${max}`;
  return null;
}

export function validateMeasurement(values) {
  const errors = {};

  if (isEmpty(values.station_id.trim())) {
    errors.station_id = "ID станції: обов'язкове поле";
  } else if (values.station_id.trim().length > 50) {
    errors.station_id = 'ID станції: не довше 50 символів';
  }

  if (isEmpty(values.station_name.trim())) {
    errors.station_name = "Назва станції: обов'язкове поле";
  } else if (values.station_name.trim().length < 2) {
    errors.station_name = 'Назва станції: щонайменше 2 символи';
  }

  if (isEmpty(values.city.trim())) {
    errors.city = "Місто: обов'язкове поле";
  } else if (!CITY_PATTERN.test(values.city.trim())) {
    errors.city = 'Місто: лише літери, пробіл, дефіс або апостроф';
  }

  const numberRules = {
    latitude:    { label: 'Широта', min: -90, max: 90, required: true },
    longitude:   { label: 'Довгота', min: -180, max: 180, required: true },
    pm25:        { label: 'PM2.5', min: 0, max: 1000, required: true },
    pm10:        { label: 'PM10', min: 0, max: 1000, required: true },
    temperature: { label: 'Температура', min: -60, max: 60, required: false },
    humidity:    { label: 'Вологість', min: 0, max: 100, required: false },
  };

  for (const [field, rule] of Object.entries(numberRules)) {
    const message = checkNumber(values[field], rule);
    if (message) errors[field] = message;
  }

  if (!errors.pm25 && !errors.pm10 && Number(values.pm25) > Number(values.pm10)) {
    errors.pm25 = 'PM2.5 не може перевищувати PM10';
  }

  if (isEmpty(values.measured_at)) {
    errors.measured_at = "Дата вимірювання: обов'язкове поле";
  } else {
    const date = new Date(values.measured_at);
    if (Number.isNaN(date.getTime())) {
      errors.measured_at = 'Некоректна дата';
    } else if (date.getTime() > Date.now() + 5 * 60 * 1000) {
      errors.measured_at = 'Дата вимірювання не може бути в майбутньому';
    }
  }

  return errors;
}