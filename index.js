const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

app.use(cors({
    credentials: true,
    origin: 'http://192.168.0.103:5173'
}));
app.use(express.json());
app.use(cookieParser());

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'vdhahgdarh536vd';

app.get('/', (req, res) => {
    res.json('test ok')
});

const uri = process.env.MONGO_URL
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Database'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));


app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userDoc = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt)
        });
        res.json(userDoc);
    }
    catch (e) {
        res.status(422).json(e);
    }

})


app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const userDoc = await User.findOne({ email: email })
    if (userDoc) {
        const passwordCheck = bcrypt.compareSync(password, userDoc.password);
        if (passwordCheck) {
            jwt.sign({ email: userDoc.email, id: userDoc._id }, jwtSecret, {}, (err,token) => {
                if (err) throw err
                else {
                    res.cookie('token', token).send(userDoc);
                }
            })
            
        }
        else {
            res.status(422).json("password not valid")
        }
    }
    else {
        res.json('not found')
    }
})

app.get('/profile', async (req, res) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {},async (err, data) => {
            if (err) throw err
            else {
            const {email, name, _id} = await User.findById(data.id)
                res.json({email, name, _id})
            }
        })
    }
    else {
        res.json(null)
    }
 
})

app.post('/logout', async (req, res) => {
    res.cookie('token', '').json(true);
})


app.listen(4000)