import { useEffect } from 'react';
import './Notification.css';

function Notification({ notification, onClose, duration = 4000 }) {
  useEffect(() => {
    if (!notification) return undefined;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [notification, onClose, duration]);

  if (!notification) return null;

  const { type, message } = notification;

  return (
    <div className={`notification notification--${type}`}>
      <span className="notification__icon">{type === 'success' ? '✓' : '!'}</span>
      <span className="notification__message">{message}</span>
      <button type="button" className="notification__close" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

export default Notification;