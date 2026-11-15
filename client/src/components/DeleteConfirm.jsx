import { useEffect, useState } from 'react';
import { deleteAirQuality } from '../services/airQualityApi.js';
import './DeleteConfirm.css';


function DeleteConfirm({ record, onDeleted, onError, onCancel }) {
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!record) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape' && !deleting) onCancel?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [record, deleting, onCancel]);

  if (!record) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      const result = await deleteAirQuality(record._id);
      onDeleted?.(result.message || 'Вимірювання видалено', result.data);
    } catch (err) {
      onError?.(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const date = record.measured_at
    ? new Date(record.measured_at).toLocaleString('uk-UA')
    : '—';

  return (
    <div className="dc-overlay" onClick={() => !deleting && onCancel?.()}>
      <div className="dc-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="dc-dialog__title">Видалити вимірювання?</h3>

        <dl className="dc-dialog__details">
          <dt>Станція</dt>
          <dd>{record.station_name} ({record.station_id})</dd>
          <dt>Місто</dt>
          <dd>{record.city}</dd>
          <dt>Дата</dt>
          <dd>{date}</dd>
          <dt>PM2.5 / PM10</dt>
          <dd>{record.pm25} / {record.pm10} мкг/м³</dd>
        </dl>

        <p className="dc-dialog__warning">Цю дію неможливо скасувати.</p>

        <div className="dc-dialog__actions">
          <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={deleting}>
            Скасувати
          </button>
          <button type="button" className="btn btn--danger" onClick={handleConfirm} disabled={deleting}>
            {deleting ? 'Видалення...' : 'Видалити'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirm;