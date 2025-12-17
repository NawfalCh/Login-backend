// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db'); // Importiert unsere db.js

const app = express();
const PORT = process.env.PORT || 3000;

// Die URL aus der .env Datei laden
const allowedOrigin = process.env.FRONTEND_URL;

app.use(cors({
    origin: allowedOrigin, 
  optionsSuccessStatus: 200
})); // Erlaubt Angular Zugriff
app.use(bodyParser.json()); // Erlaubt JSON im Body

// ---------------------------------------------------------
// API 1: Email & Passwort empfangen -> User erstellen
// ---------------------------------------------------------
app.get('/', (req, res) => {
  res.send('Hello from my App!');
})

app.post('/api/register-step1', async (req, res) => {
  const { email, password } = req.body;

  // Einfache Validierung
  if (!email || !password) {
    return res.status(400).json({ error: 'Email und Passwort sind erforderlich' });
  }

  try {
    // SQL: User einfügen und die neue ID zurückgeben
    const sql = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING userid';
    const values = [email, password];
    
    const result = await db.query(sql, values);
    const newUserId = result.rows[0].userid;

    console.log(`User erstellt mit ID: ${newUserId}`);

    // Wir senden die ID zurück an Angular, damit Angular sie für Schritt 2 nutzen kann
    res.status(201).json({ 
      message: 'User angelegt', 
      userId: newUserId 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Datenbankfehler beim Speichern' });
  }
});

// ---------------------------------------------------------
// API 2: Verifikationscode empfangen -> User updaten
// ---------------------------------------------------------
app.post('/api/register-step2', async (req, res) => {
  const { userId, verifycode } = req.body;

  if (!userId || !verifycode) {
    return res.status(400).json({ error: 'User ID und Code sind erforderlich' });
  }

  try {
    // SQL: Den Code beim passenden User speichern
    const sql = 'UPDATE users SET verifycode = $1 WHERE userid = $2';
    const values = [verifycode, userId];

    const result = await db.query(sql, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User nicht gefunden' });
    }

    console.log(`Code für User ${userId} gespeichert: ${verifycode}`);

    res.status(200).json({ message: 'Verifikation erfolgreich gespeichert' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Datenbankfehler beim Update' });
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});