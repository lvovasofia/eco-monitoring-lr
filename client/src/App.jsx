import { useCallback, useEffect, useState } from "react";
import AirQualityTable from "./components/AirQualityTable.jsx";
import AirQualityForm from "./components/AirQualityForm.jsx";
import DeleteConfirm from "./components/DeleteConfirm.jsx";
import Notification from "./components/Notification.jsx";
import { getAirQuality } from "./services/airQualityApi.js";
import "./components/buttons.css";
import "./App.css";

function App() {
  const [records, setRecords] = useState([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const data = await getAirQuality(city);

        if (!cancelled) {
          setRecords(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [city, reloadKey]);

  const selectedRecord = records.find((record) => record._id === selectedId) ?? null;

  const reloadData = () => setReloadKey((key) => key + 1);
  const notify = (type, message) => setNotification({ type, message });
  const closeNotification = useCallback(() => setNotification(null), []);

  const openCreateForm = () => {
    setEditingRecord(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEditForm = (record) => {
    setEditingRecord(record);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRecord(null);
  };

  const handleSaved = (message) => {
    notify("success", message);
    closeForm();
    reloadData();
  };

  const handleDeleted = (message, deleted) => {
    notify("success", message);
    setDeletingRecord(null);
    setSelectedId(null);
    if (editingRecord && deleted && editingRecord._id === deleted._id) {
      closeForm();
    }
    reloadData();
  };

  const handleError = (message) => notify("error", message);

  return (
    <main className="app">
      <header className="app-header">
        <h1>Екологічний моніторинг</h1>
        <p>Моніторинг якості повітря в містах України</p>
      </header>

      {showForm && (
        <AirQualityForm
          key={editingRecord ? editingRecord._id : "new"}
          record={editingRecord}
          onSuccess={handleSaved}
          onError={handleError}
          onCancel={closeForm}
        />
      )}

      <div className="filters">
        <label htmlFor="city">Фільтр за містом:</label>

        <input
          id="city"
          type="text"
          placeholder="Введіть назву міста"
          value={city}
          onChange={(event) => setCity(event.target.value)}
        />
      </div>

      {loading ? (
        <p>Завантаження даних...</p>
      ) : error ? (
        <p className="error">Помилка: {error}</p>
      ) : (
        <>
          <p className="records-count">
            Кількість записів в таблиці: {records.length}
          </p>
          <AirQualityTable
            records={records}
            selectedId={selectedId}
            onSelect={(record) => setSelectedId(record._id)}
          />
        </>
      )}

      <div className="selection-bar">
        <button
          type="button"
          className="btn btn--primary"
          onClick={openCreateForm}
        >
          + Додати вимірювання
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          disabled={!selectedRecord}
          onClick={() => openEditForm(selectedRecord)}
        >
          Редагувати
        </button>
        <button
          type="button"
          className="btn btn--danger"
          disabled={!selectedRecord}
          onClick={() => setDeletingRecord(selectedRecord)}
        >
          Видалити
        </button>
      </div>

      <DeleteConfirm
        record={deletingRecord}
        onDeleted={handleDeleted}
        onError={handleError}
        onCancel={() => setDeletingRecord(null)}
      />

      <Notification notification={notification} onClose={closeNotification} />
    </main>
  );
}

export default App;