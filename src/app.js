import express from 'express';
import cors from 'cors';
import airQualityRouter from './routes/airQuality.js'; // 1. Імпортуємо роутер

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ success: true, message: 'Сервер екологічного моніторингу працює!' });
});

app.use('/api/air-quality', airQualityRouter);

// Обробник помилки 404 (якщо маршрут не знайдено)
app.use((req, res) => {
    res.status(404).json({ success: false, error: `Маршрут ${req.originalUrl} не існує` });
});

// Головний обробник помилок (має рівно 4 аргументи)
app.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || 500;
    res.status(status).json({
        success: false,
        error: status === 500 ? 'Внутрішня помилка сервера' : err.message
    });
});

export default app;