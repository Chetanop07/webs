require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // IMPORTANT
app.use(cors());

// MongoDB connection (LOCAL)
mongoose.connect('mongodb://127.0.0.1:27017/tourismDB')
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

// Models
const User = mongoose.model('User', {name:String,email:String,password:String});
const Booking = mongoose.model('Booking', {name:String,email:String,destination:String});
const Review = mongoose.model('Review', {place:String,rating:Number,review:String});
const Contact = mongoose.model('Contact', {name:String,phone:String,service:String,message:String});

// Register
app.post('/register', async (req,res)=>{
    console.log("Data received:", req.body); 

    const hashed = await bcrypt.hash(req.body.password,10);
    await new User({...req.body,password:hashed}).save();

    console.log("User saved");  
    res.send("Registered Successfully");
});

// Login
app.post('/login', async (req,res)=>{
    const user = await User.findOne({email:req.body.email});
    if(user && await bcrypt.compare(req.body.password,user.password)){
        res.send("Login Success");
    } else {
        res.send("Invalid Credentials");
    }
});

// Booking
app.post('/submit', async (req,res)=>{
    await new Booking(req.body).save();
    res.send("Booking Saved");
});

// Review
app.post('/review', async (req,res)=>{
    await new Review(req.body).save();
    res.send("Review Added");
});

// Contact
app.post('/contact', async (req,res)=>{
    await new Contact(req.body).save();
    res.send("Contact Saved");
});

// Admin APIs
app.get('/admin/users', async (req,res)=> res.json(await User.find()));
app.get('/admin/bookings', async (req,res)=> res.json(await Booking.find()));
app.get('/admin/reviews', async (req,res)=> res.json(await Review.find()));
app.get('/admin/contacts', async (req,res)=> res.json(await Contact.find()));
app.get('/', (req,res)=>{
    res.send("Server is working 🚀");
});

mongoose.connect('mongodb+srv://chetan:bawa420@cluster0.ehw3von.mongodb.net/tourismDB?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=>console.log("✅ Atlas Connected"))
.catch(err=>console.log("❌ ERROR:", err));

mongoose.connection.on('connected', ()=>{
    console.log("🔥 DB Name:", mongoose.connection.name);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));