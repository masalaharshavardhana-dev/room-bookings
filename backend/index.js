const express = require("express");
const app = express();
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const cors = require("cors");

app.use(express.json());
app.use(cors());

const db_path = path.join(__dirname, "meeting_rooms.db");
let db;
const PORT = 8000;

const initializeDatabaseAndServer = async () => {
    try {
        db = await open({
            filename: db_path,
            driver: sqlite3.Database,
        });
        await db.exec(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                start_time TEXT,
                end_time TEXT
            );
        `);

        console.log("Database connected successfully");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.log("Error initializing database: ", error);
    }
};

initializeDatabaseAndServer();
app.post("/rooms", async (req, res) => {
    const { start_time, end_time } = req.body;

    try {
        const overlapQuery = `
            SELECT * FROM bookings 
            WHERE (start_time < ? AND end_time > ?)
        `;
        
        const existingBooking = await db.get(overlapQuery, [end_time, start_time]);

        if (existingBooking) {
            return res.status(400).json({ 
                error: "Conflict", 
                message: "The Requested Room is already booked for the selected time slot." 
            });
        }

        const insertQuery = `
            INSERT INTO bookings (start_time, end_time)
            VALUES (?, ?)
        `;
        await db.run(insertQuery, [start_time, end_time]);
        
        res.status(201).json({ message: "Room booked successfully" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/all-bookings", async (req, res) => {
    try {
        const bookings = await db.all("SELECT * FROM bookings");
        res.json(bookings);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
