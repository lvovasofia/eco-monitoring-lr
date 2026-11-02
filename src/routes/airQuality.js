
import express from 'express';
import mongoose from 'mongoose';
import { AirQuality } from '../model/AirQuality.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const {
            station_id,
            station_name,
            city,
            latitude,
            longitude,
            measured_at,
            pm25,
            pm10,
            temperature,
            humidity
        } = req.body;

        const newRecord = await AirQuality.create({
            station_id,
            station_name,
            city,
            latitude,
            longitude,
            measured_at,
            pm25,
            pm10,
            temperature,
            humidity
        });

        res.status(201).json({
            success: true,
            message: 'Вимірювання успішно додано',
            data: newRecord
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Помилка створення запису',
            error: error.message
        });
    }
});


router.get('/', async (req, res) => {
    try {
        const { city, station_id, limit = 50 } = req.query;

        const filter = {};

        if (city) {
            filter.city = {
                $regex: city,
                $options: 'i'
            };
        }

        if (station_id) {
            filter.station_id = station_id;
        }

        const parsedLimit = Math.min(
            Math.max(parseInt(limit, 10) || 50, 1),
            100
        );

        const records = await AirQuality.find(filter)
            .sort({ measured_at: -1 })
            .limit(parsedLimit);

        res.status(200).json({
            success: true,
            count: records.length,
            data: records
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Помилка отримання вимірювань',
            error: error.message
        });
    }
});



router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Некоректний ID запису'
            });
        }

        const record = await AirQuality.findById(req.params.id);

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Запис не знайдено'
            });
        }

        res.status(200).json({
            success: true,
            data: record
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Помилка отримання запису',
            error: error.message
        });
    }
});


router.put('/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Некоректний ID запису'
            });
        }

        const allowedFields = [
            'station_id',
            'station_name',
            'city',
            'latitude',
            'longitude',
            'measured_at',
            'pm25',
            'pm10',
            'temperature',
            'humidity'
        ];

        const updateData = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Немає даних для оновлення'
            });
        }

        const updatedRecord = await AirQuality.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedRecord) {
            return res.status(404).json({
                success: false,
                message: 'Запис не знайдено'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Вимірювання успішно оновлено',
            data: updatedRecord
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Помилка оновлення вимірювання',
            error: error.message
        });
    }
});



router.delete('/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Некоректний ID запису'
            });
        }

        const deletedRecord = await AirQuality.findByIdAndDelete(
            req.params.id
        );

        if (!deletedRecord) {
            return res.status(404).json({
                success: false,
                message: 'Запис не знайдено'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Вимірювання успішно видалено',
            data: deletedRecord
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Помилка видалення вимірювання',
            error: error.message
        });
    }
});

export default router;