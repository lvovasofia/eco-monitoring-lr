import 'dotenv/config'; 
import app from './app.js';
import { connectDB } from './config/database.js';


const PORT = process.env.PORT || 3000;

try {
    await connectDB(); 
    const server = app.listen(PORT, () => {
        console.log(`Сервер запущено: http://localhost:${PORT}`);
    });


    process.on('SIGTERM', () => {
        server.close(() => process.exit(0));
    });
} catch (err) {
    console.error('Не вдалося запустити сервер:', err.message);
    process.exit(1);
}