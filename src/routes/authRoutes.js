const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = mongoose.model('User');

const router = express.Router();

router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = new User({ email, password });
        await user.save();

        const token = jwt.sign({ userId: user.id }, 'MY_SECRET_KEY');
        res.send({
            token,
            email: user.email,
            msg: 'User registered successfully',
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(422).send('Email is already in use');
        }
        if (err.errors && err.errors.email) {
            return res.status(422).send(err.errors.email.message);
        }
        if (err.errors && err.errors.password) {
            return res.status(422).send(err.errors.password.message);
        }
        return res.status(500).send('Something went wrong');
    }
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res
            .status(422)
            .send({ error: 'Must provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(422).send({ error: 'Email not found' });
    }

    try {
        await user.comparePassword(password);

        const token = jwt.sign({ userId: user._id }, 'MY_SECRET_KEY');
        res.send({ token });
    } catch (err) {
        return res.status(422).send({ error: 'Invalid password or email' });
    }
});

module.exports = router;
