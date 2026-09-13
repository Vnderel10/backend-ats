import express from 'express';
import postsRoutes from './routes/posts/posts.routes';
import categoryRoutes from './routes/category/category.routes';

const app = express();
const PORT = 5000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send("Hello World");
});

app.use('/api', postsRoutes);
app.use('/api', categoryRoutes);

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('>>> app.listen callback selesai, server harusnya tetap hidup');
});

server.on('error', (err) => {
    console.error('>>> SERVER ERROR:', err);
});