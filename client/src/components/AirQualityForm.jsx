import { useState } from 'react';
import { createAirQuality, updateAirQuality } from '../services/airQualityApi.js';
import { validateMeasurement } from '../utils/validateMeasurement.js';
import './AirQualityForm.css';

function toLocalInputValue(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function emptyValues() {
  return {
    station_id: '',
    station_name: '',
    city: '',
    latitude: '',
    longitude: '',
    measured_at: toLocalInputValue(new Date()),
    pm25: '',
    pm10: '',
    temperature: '',
    humidity: '',
  };
}

function recordToValues(record) {
  const show = (v) => (v === null || v === undefined ? '' : String(v));
  return {
    station_id: record.station_id ?? '',
    station_name: record.station_name ?? '',
    city: record.city ?? '',
    latitude: show(record.latitude),
    longitude: show(record.longitude),
    measured_at: record.measured_at ? toLocalInputValue(record.measured_at) : toLocalInputValue(new Date()),
    pm25: show(record.pm25),
    pm10: show(record.pm10),
    temperature: show(record.temperature),
    humidity: show(record.humidity),
  };
}

function valuesToPayload(values, isEdit) {
  const optional = (v) => {
    if (v === '') return isEdit ? null : undefined;
    return Number(v);
  };
  return {
    station_id: values.station_id.trim(),
    station_name: values.station_name.trim(),
    city: values.city.trim(),
    latitude: Number(values.latitude),
    longitude: Number(values.longitude),
    measured_at: new Date(values.measured_at).toISOString(),
    pm25: Number(values.pm25),
    pm10: Number(values.pm10),
    temperature: optional(values.temperature),
    humidity: optional(values.humidity),
  };
}

const FIELDS = [
  { name: 'station_id', label: 'ID станції', type: 'text', placeholder: 'KYIV-001', required: true },
  { name: 'station_name', label: 'Назва станції', type: 'text', placeholder: 'Станція Оболонь', required: true },
  { name: 'city', label: 'Місто', type: 'text', placeholder: 'Київ', required: true },
  { name: 'measured_at', label: 'Дата і час вимірювання', type: 'datetime-local', required: true },
  { name: 'latitude', label: 'Широта', type: 'number', step: 'any', placeholder: '50.4501', required: true },
  { name: 'longitude', label: 'Довгота', type: 'number', step: 'any', placeholder: '30.5234', required: true },
  { name: 'pm25', label: 'PM2.5, мкг/м³', type: 'number', step: 'any', placeholder: '12.5', required: true },
  { name: 'pm10', label: 'PM10, мкг/м³', type: 'number', step: 'any', placeholder: '25', required: true },
  { name: 'temperature', label: 'Температура, °C', type: 'number', step: 'any', placeholder: 'необов’язково' },
  { name: 'humidity', label: 'Вологість, %', type: 'number', step: 'any', placeholder: 'необов’язково' },
];

function AirQualityForm({ record = null, onSuccess, onError, onCancel }) {
  const isEdit = Boolean(record);

  const [values, setValues] = useState(() => (record ? recordToValues(record) : emptyValues()));
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...values, [name]: value };
    setValues(next);
    if (submitted) setErrors(validateMeasurement(next));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setServerError('');

    const validationErrors = validateMeasurement(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = valuesToPayload(values, isEdit);
      const result = isEdit
        ? await updateAirQuality(record._id, payload)
        : await createAirQuality(payload);

      onSuccess?.(result.message || 'Операцію виконано успішно', result.data);

      if (!isEdit) {
        setValues(emptyValues());
        setSubmitted(false);
      }
    } catch (err) {
      setServerError(err.message);
      onError?.(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="aq-form" onSubmit={handleSubmit} noValidate>
      <h2 className="aq-form__title">
        {isEdit ? 'Редагування вимірювання' : 'Нове вимірювання'}
      </h2>

      {serverError && <div className="aq-form__server-error">{serverError}</div>}

      <div className="aq-form__grid">
        {FIELDS.map((field) => (
          <label key={field.name} className="aq-form__field">
            <span className="aq-form__label">
              {field.label}
              {field.required && <span className="aq-form__required"> *</span>}
            </span>
            <input
              name={field.name}
              type={field.type}
              step={field.step}
              placeholder={field.placeholder}
              value={values[field.name]}
              onChange={handleChange}
              disabled={saving}
              className={errors[field.name] ? 'aq-form__input aq-form__input--invalid' : 'aq-form__input'}
            />
            {errors[field.name] && <span className="aq-form__error">{errors[field.name]}</span>}
          </label>
        ))}
      </div>

      <div className="aq-form__actions">
        {onCancel && (
          <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={saving}>
            Скасувати
          </button>
        )}
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Збереження...' : isEdit ? 'Зберегти зміни' : 'Додати вимірювання'}
        </button>
      </div>
    </form>
  );
}

export default AirQualityForm;