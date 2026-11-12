import { useEffect, useState } from "react";
import AirQualityTable from "./components/AirQualityTable.jsx";
import { getAirQuality } from "./services/airQualityApi.js";
import "./App.css";

function App() {
  const [records, setRecords] = useState([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  }, [city]);

  return (
    <main className="app">
      <header className="app-header">
        <h1>Екологічний моніторинг</h1>
        <p>Моніторинг якості повітря в містах України</p>
      </header>

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
          <AirQualityTable records={records} />
        </>
      )}
    </main>
  );
}

export default App;
