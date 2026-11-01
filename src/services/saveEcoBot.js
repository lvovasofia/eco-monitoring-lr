
import { AirQuality } from '../model/AirQuality.js';

export async function importSaveEcoBotData() {
    // Отримуємо дані зі станції SaveEcoBot
    const response = await fetch(process.env.SAVEECOBOT_JSON_URL);

    if (!response.ok) {
        throw new Error(`Помилка SaveEcoBot API: ${response.status}`);
    }

    const data = await response.json();

    // Перетворюємо масив показників на об'єкт
    const measurements = {};

    for (const item of data.last_data) {
        measurements[item.phenomenon] = Number(item.value);
    }

    // Формуємо запис відповідно до нашої MongoDB-моделі
    const record = {
        station_id: String(data.id),
        station_name: data.sensor_name,
        city: data.city_name,

        location: {
            type: 'Point',
            coordinates: [
                Number(data.longitude),
                Number(data.latitude)
            ]
        },

        measured_at: new Date(data.last_measurement_at),

        values: {
            pm25: measurements.pm25,
            pm10: measurements.pm10,
            temperature: measurements.temperature,
            humidity: measurements.humidity
        },

        aqi: Number(data.aqi),
        quality: data.aqi_is_old ? 'suspect' : 'valid',
        source: 'saveecobot'
    };

    // Оновлюємо існуючий запис або створюємо новий
    const savedRecord = await AirQuality.findOneAndUpdate(
        {
            station_id: record.station_id,
            measured_at: record.measured_at
        },
        { $set: record },
        {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true
        }
    );

    return savedRecord;
}
