import express from 'express';

const app = express();

app.use(express.json());

app.get('/', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Worker server is running 🚀',
    });
});



app.get('/health', (_req, res) => {

    res.send('<p> abdul ahad patwary </p>');
    // res.status(200).json({
    //     status: 'ok',
    //     uptime: process.uptime(),
    //     timestamp: new Date().toISOString(),
    // });

    // res.write('chunk', (error: Error | null | undefined) => void {

    // })

    // res.on('close', (stream) => {
    //     console.log('data');
    // })

    // res.end();
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
