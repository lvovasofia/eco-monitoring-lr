import mongoose from 'mongoose';

export async function connectDB() {
    
    mongoose.connection.on('connected', () => console.log('MongoDB: З\'єднання встановлено успішно'));
    mongoose.connection.on('error', err => console.error('MongoDB Помилка:', err.message));
    mongoose.connection.on('disconnected', () => console.warn('MongoDB: З\'єднання втрачено'));

    try {
     
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000 
        });
    } catch (err) {
        console.error('MongoDB Критична помилка підключення:', err.message);
        process.exit(1); 
    }
}