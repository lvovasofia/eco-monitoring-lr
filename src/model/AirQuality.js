import { Schema, model } from 'mongoose';

// Показники, які передає станція. Вкладена схема без власного _id
const valuesSchema = new Schema({
  pm25:        { type: Number, min: [0, 'Концентрація не може бути від\'ємною'], max: 1000 },
  pm10:        { type: Number, min: [0, 'Концентрація не може бути від\'ємною'], max: 2000 },
  temperature: { type: Number, min: -50, max: 60 },
  humidity:    { type: Number, min: 0, max: 100 },
  no2_ug:      { type: Number, min: 0 }   // мкг/м³
}, { _id: false });

const airQualitySchema = new Schema({
  station_id:   { type: String, required: [true, 'ID станції обов\'язковий'], trim: true },
  station_name: { type: String, required: [true, 'Назва станції обов\'язкова'], trim: true },
  city:         { type: String, required: [true, 'Місто обов\'язкове'], trim: true, index: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }   // [довгота, широта]
  },
  measured_at: { type: Date, required: [true, 'Час вимірювання обов\'язковий'] },
  values:      { type: valuesSchema, required: true },
  aqi:         { type: Number, min: 0 },
  quality:     { type: String, enum: ['valid', 'suspect', 'invalid'], default: 'valid' },
  source:      { type: String, enum: ['saveecobot', 'openaq', 'manual'], default: 'saveecobot' }
}, { timestamps: { createdAt: 'received_at', updatedAt: false } });

// не дозволяє двох вимірювань однієї станції з однаковим часом
airQualitySchema.index({ station_id: 1, measured_at: -1 }, { unique: true });
airQualitySchema.index({ location: '2dsphere' });

export const AirQuality = model('AirQuality', airQualitySchema);