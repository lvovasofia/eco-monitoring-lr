import express from 'express';
import { AirQuality } from '../model/AirQuality.js';
import { importSaveEcoBotData } from '../services/saveEcoBot.js';

const router = express.Router();

// Імпорт показників зі станції SaveEcoBot
router.post('/import/saveecobot', async (req, res) => {
    try {
        const record = await importSaveEcoBotData();

        res.status(200).json({
            success: true,
            message: 'Дані SaveEcoBot успішно імпортовано',
            data: record
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 1. CREATE (Створення нового вимірювання) - POST /api/air-quality
router.post('/', async (req, res) => {
    try {
        const { station_id, station_name, city, location, measured_at, values, aqi, quality, source } = req.body;
        
        const newRecord = new AirQuality({
            station_id,
            station_name,
            city,
            location,
            measured_at,
            values,
            aqi,
            quality,
            source
        });

        await newRecord.save();
        res.status(201).json({ success: true, data: newRecord });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 2. READ (Отримання всіх записів із фільтрацією за містом або станцією) - GET /api/air-quality
router.get('/', async (req, res) => {
    try {
        const { city, station_id, limit = 50 } = req.query;
        const filter = {};
        
        if (city) filter.city = { $regex: city, $options: 'i' };
        if (station_id) filter.station_id = station_id;

        const records = await AirQuality.find(filter)
            .sort({ measured_at: -1 })
            .limit(parseInt(limit));
            
        res.json({ 
            success: true, 
            count: records.length, 
            data: records 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. READ (Отримання конкретного запису за ID) - GET /api/air-quality/:id
router.get('/:id', async (req, res) => {
    try {
        const record = await AirQuality.findById(req.params.id);
        
        if (!record) {
            return res.status(404).json({ success: false, error: 'Запис не знайдено' });
        }
        
        res.json({ success: true, data: record });
    } catch (error) {
        res.status(400).json({ success: false, error: 'Некоректний ID' });
    }
});

// 4. UPDATE (Оновлення запису за ID) - PUT /api/air-quality/:id
router.put('/:id', async (req, res) => {
    try {
        const updatedRecord = await AirQuality.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        
        if (!updatedRecord) {
            return res.status(404).json({ success: false, error: 'Запис не знайдено' });
        }
        
        res.json({ success: true, data: updatedRecord });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 5. DELETE (Видалення запису за ID) - DELETE /api/air-quality/:id
router.delete('/:id', async (req, res) => {
    try {
        const deletedRecord = await AirQuality.findByIdAndDelete(req.params.id);
        
        if (!deletedRecord) {
            return res.status(404).json({ success: false, error: 'Запис не знайдено' });
        }
        
        res.json({ success: true, message: 'Запис успішно видалено' });
    } catch (error) {
        res.status(400).json({ success: false, error: 'Некоректний ID' });
    }
});

export default router;