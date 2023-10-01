const express = require('express');
const {urlencoded, json} = require("express");
const cors = require("cors");


const app = express();
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cors());


const port = 5000;

const users = [];


app.get('/api/check', (req, res) => {
    const num = req.query.phoneNumber;

    if (!num || !isValidPhoneNumber(num) || num.length < 11) {
        return res.status(400).json({errors: 'Not valid number'})
    }

    const found =  users.filter(a => a.phoneNumber === num);
    return  res.send({
        hasAccount: !!found.length,
    })
});

app.post('/api/register', (req, res) => {
    const { phoneNumber, password, name, email } = req.body;
    if (!phoneNumber || !password || !name || !email || !isValidPhoneNumber(phoneNumber) ) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const newUser = { phoneNumber, password, name, email };
    users.push(newUser);

    res.json({ success: true, user: newUser });
});

app.post('/api/login', (req, res) => {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
        return res.status(400).json({ error: 'Phone number and password are required' });
    }

    const user = users.find(u => u.phoneNumber === phoneNumber);

    if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    res.json({ success: true, user });
});


app.post('/api/recover-password', (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    const user = users.find(u => u.phoneNumber === phoneNumber);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    user.password = generateRandomPassword();

    res.json({ success: true, user });
});




app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});



function isValidPhoneNumber(input) {
    if (input === null || input === undefined) return false

    return /^\+\d{1,3}\s?\(?\d{1,4}\)?[-.\s]?\d{1,3}[-.\s]?\d{1,2}[-.\s]?\d{1,2}$/.test(input)
}

function generateRandomPassword() {
    const length = 8;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let newPassword = '';
    for (let i = 0; i < length; i++) {
        newPassword += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return newPassword;
}