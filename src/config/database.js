import mongoose from 'mongoose';

export async function connectDB() {
    // Слухачі подій для зручного виведення статусу в консоль
    mongoose.connection.on('connected', () => console.log('MongoDB: З\'єднання встановлено успішно'));
    mongoose.connection.on('error', err => console.error('MongoDB Помилка:', err.message));
    mongoose.connection.on('disconnected', () => console.warn('MongoDB: З\'єднання втрачено'));

    try {
        // Підключення до бази за допомогою рядка з .env
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000 // Не чекати довше 5 секунд, якщо кластер недоступний
        });
    } catch (err) {
        console.error('MongoDB Критична помилка підключення:', err.message);
        process.exit(1); // Зупиняємо сервер, якщо база недоступна
    }
}