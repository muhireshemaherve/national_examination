const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5000;
const SECRET = "your_secret_key";

app.use(express.json());
app.use(cors());

// --- DATABASE CONNECTION ---
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // Add your MySQL password here
    database: "carservicedb"
});

db.connect((err) => {
    if (err) return console.error("DB Connection Error: " + err.message);
    console.log("✅ MySQL Connected Successfully...");
});

// --- AUTH MIDDLEWARE ---
// Use this to protect routes: app.get('/path', verifyToken, (req, res) => { ... })
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: "No token provided" });

    jwt.verify(token.split(" ")[1], SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Unauthorized" });
        req.userId = decoded.id;
        next();
    });
};

// --- USER ROUTES ---
app.post('/api/users/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
        db.query(sql, [email, hashedPassword], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "User Registered Successfully" });
        });
    } catch (error) {
        res.status(500).json({ error: "Server Error during registration" });
    }
});

app.post('/api/users/login', (req, res) => {
    const { email, password } = req.body;
    
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "User not found" });

        const match = await bcrypt.compare(password, results[0].password);
        if (!match) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: results[0].user_id }, SECRET, { expiresIn: '1h' });
        res.json({ message: "Login Success", token });
    });
});

// --- CAR ROUTES ---
app.get('/api/cars/get', (req, res) => {
    db.query('SELECT * FROM cars', (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

app.post('/api/cars/add', (req, res) => {
    const { plate_number, type, model, manufacturing_year, driver_phone, mechanic_name } = req.body;
    const sql = 'INSERT INTO cars (plate_number, type, model, manufacturing_year, driver_phone, mechanic_name) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [plate_number, type, model, manufacturing_year, driver_phone, mechanic_name], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Car added successfully" });
    });
});

// --- SERVICES ROUTES ---
app.get('/api/services/get', (req, res) => {
    db.query('SELECT * FROM services', (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

app.post('/api/services/add', (req, res) => {
    const { service_code, service_name, service_price } = req.body;
    const sql = 'INSERT INTO services (service_code, service_name, service_price) VALUES (?, ?, ?)';
    db.query(sql, [service_code, service_name, service_price], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Service type added" });
    });
});

// --- SERVICE RECORDS ---
app.get('/api/records/get', (req, res) => {
    db.query('SELECT * FROM service_records', (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

app.post('/api/records/add', (req, res) => {
    const { record_number, service_id, service_date, description } = req.body;
    const sql = 'INSERT INTO service_records (record_number, service_id, service_date, description) VALUES (?, ?, ?, ?)';
    db.query(sql, [record_number, service_id, service_date, description], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Record created successfully" });
    });
});

app.delete('/api/records/delete/:record_id', (req, res) => {
    const { record_id } = req.params;
    // Delete payments first to maintain referential integrity
    db.query("DELETE FROM payments WHERE record_id = ?", [record_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.query("DELETE FROM service_records WHERE record_id = ?", [record_id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Record and associated payments deleted" });
        });
    });
});

// --- PAYMENTS ROUTES ---
app.post('/api/payments/add', (req, res) => {
    const { record_id, car_id, amount_paid, payment_date } = req.body;
    const sql = 'INSERT INTO payments (record_id, car_id, amount_paid, payment_date) VALUES (?, ?, ?, ?)';
    db.query(sql, [record_id, car_id, amount_paid, payment_date], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Payment logged", id: result.insertId });
    });
});

app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
