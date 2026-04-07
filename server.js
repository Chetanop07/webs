require('dotenv').config();
const mongoose = require('mongoose');

// Single declaration with fallback
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tourismDB';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));
const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));


// ----------------- Models -----------------
const User = mongoose.model('User', { name: String, email: String, password: String, createdAt: { type: Date, default: Date.now } });
const Booking = mongoose.model('Booking', { name: String, email: String, destination: String, createdAt: { type: Date, default: Date.now } });
const Review = mongoose.model('Review', { place: String, rating: Number, review: String, createdAt: { type: Date, default: Date.now } });
const Contact = mongoose.model('Contact', { name: String, phone: String, service: String, message: String, createdAt: { type: Date, default: Date.now } });

// ----------------- Routes -----------------

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Register
app.post('/register', async (req, res) => {
    try {
        console.log("Register data:", req.body);
        const hashed = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({ ...req.body, password: hashed });
        await newUser.save();
        res.send("User registered successfully!");
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).send("Error registering user");
    }
});

// Login
app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user && await bcrypt.compare(req.body.password, user.password)) {
            res.send("Login Success");
        } else {
            res.status(400).send("Invalid Credentials");
        }
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send("Server error");
    }
});

// Booking
app.post('/submit', async (req, res) => {
    try {
        await new Booking(req.body).save();
        res.send("Booking Saved");
    } catch (err) {
        console.error("Booking error:", err);
        res.status(500).send("Error saving booking");
    }
});

// Review
app.post('/review', async (req, res) => {
    try {
        await new Review(req.body).save();
        res.send("Review Added");
    } catch (err) {
        console.error("Review error:", err);
        res.status(500).send("Error adding review");
    }
});

// Contact
app.post('/contact', async (req, res) => {
    try {
        await new Contact(req.body).save();
        res.send("Contact Saved");
    } catch (err) {
        console.error("Contact error:", err);
        res.status(500).send("Error saving contact");
    }
});

// Admin APIs
app.get('/admin/users', async (req, res) => res.json(await User.find()));
app.get('/admin/bookings', async (req, res) => res.json(await Booking.find()));
app.get('/admin/reviews', async (req, res) => res.json(await Review.find()));
app.get('/admin/contacts', async (req, res) => res.json(await Contact.find()));

// ----------------- Start Server -----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));