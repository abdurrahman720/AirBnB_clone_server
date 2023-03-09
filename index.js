const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

app.use(cors())
app.use(express.json());



app.get('/', (req, res) => {
    res.json('test ok')
});

const uri = process.env.MONGO_URL


mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));


app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    res.json({name: name, email: email, password: password})
})

app.listen(4000)