// Filename - index.js

// Importing the required modules
const http = require("http");
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies

// Connect to the SQLite database
const db = new sqlite3.Database("./test.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
});

// Connect to the databaseCreate a table if it doesn't exist (uncomment if needed)
const sql = `CREATE TABLE IF NOT EXISTS Inventory (
    EntryID INTEGER PRIMARY KEY AUTOINCREMENT,
    Title TEXT NOT NULL,
    Author TEXT NOT NULL,
    Genre TEXT,
    PublicationDate DATE,
    ISBN TEXT UNIQUE
);`;
db.run(sql);


app.post('/addBook', (req, res) => {
    const data = req.body; // Destructure data from req.body
    console.log(req.body);
    // Check for required fields
    
    const sql = `INSERT INTO Inventory (Title, Author, Genre, PublicationDate, ISBN) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [data.title, data.author, data.genre, data.publication_date, data.ibsn], function(err) {
            if (err) {
                console.log(err);
            return res.status(500).json({ error: err.message }); // Send error response
        }
        res.status(201).json({ message: "Book added successfully", id: this.lastID }); // Respond with success
    });
    console.log("added");
});

// Get all books
app.get('/getall', (req, res) => {
    const sql = `SELECT * FROM Inventory`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message }); // Send error response
        }
        res.json(rows); // Respond with the retrieved rows
    });
});

 
//filter the books
app.post('/filter', (req, res) => {
    
   const data = req.body;
   console.log(data);

   
    let sql = 'SELECT * FROM INVENTORY WHERE 1=1';  
    const params = [];
 
    if (data.author) {
        sql += ' AND AUTHOR = ?';
        params.push(data.author);
    }
    if (data.title) {
        sql += ' AND TITLE = ?';
        params.push(data.title);
    }
    if (data.genre) {
        sql += ' AND GENRE = ?';
        params.push(data.genre);
    }
    if (data.publication_date) {
        sql += ' AND PUBLICATIONDATE = ?';
        params.push(data.publication_date);
    }

    // Execute the query with the parameters
    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        res.json(rows); // Return the filtered rows
    });
});


// Creating the HTTP server
const server = http.createServer(app);

// Server listening to port 3000
server.listen(8080, () => {
    console.log("Server is Running on http://localhost:3000");
});
