import { Schema, model } from 'mongoose';

const airQualitySchema = new Schema({
  station_id:   { type: String, required: true, trim: true },
  station_name: { type: String, required: true, trim: true },
  city:         { type: String, required: true, trim: true },

  latitude:  { type: Number, required: true, min: -90,  max: 90 },
  longitude: { type: Number, required: true, min: -180, max: 180 },

  measured_at: { type: Date, default: Date.now },

  pm25: { type: Number, required: true, min: 0 },
  pm10: { type: Number, required: true, min: 0 },
  temperature: { type: Number },
  humidity:    { type: Number, min: 0, max: 100 }
}, {
  timestamps: true 
});

export const AirQuality = model('AirQuality', airQualitySchema);