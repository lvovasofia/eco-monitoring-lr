
function AirQualityTable({ records }) {
  if (records.length === 0) {
    return <p>Немає даних для відображення.</p>;
  }

  const formatValue = (record, field) => {
    return record[field] ?? record.values?.[field] ?? '—';
  };

  return (
    <div className="table-container">
      <table className="air-quality-table">
        <thead>
          <tr>
            <th>Станція</th>
            <th>Місто</th>
            <th>PM2.5 (мкг/м³)</th>
            <th>PM10 (мкг/м³)</th>
            <th>Температура (°C)</th>
            <th>Вологість (%)</th>
            <th>Дата вимірювання</th>
          </tr>
        </thead>

        <tbody>
          {records.map((record) => (
            <tr key={record._id}>
              <td>{record.station_name}</td>
              <td>{record.city}</td>
              <td>{formatValue(record, 'pm25')}</td>
              <td>{formatValue(record, 'pm10')}</td>
              <td>{formatValue(record, 'temperature')}</td>
              <td>{formatValue(record, 'humidity')}</td>
              <td>
                {record.measured_at
                  ? new Date(record.measured_at).toLocaleString('uk-UA')
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AirQualityTable;
