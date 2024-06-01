const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to Database'))
.catch((error) => console.error('Database connection error:', error));

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de la API
app.get('/api/events', (req, res) => {
    // Aquí agregarás el código para obtener eventos de la base de datos
    res.send('Obtener eventos');
});

app.post('/api/events', (req, res) => {
    // Aquí agregarás el código para agregar un nuevo evento a la base de datos
    res.send('Agregar evento');
});

app.put('/api/events/:id', (req, res) => {
    // Aquí agregarás el código para actualizar un evento existente en la base de datos
    res.send('Actualizar evento');
});

app.delete('/api/events/:id', (req, res) => {
    // Aquí agregarás el código para eliminar un evento de la base de datos
    res.send('Eliminar evento');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
