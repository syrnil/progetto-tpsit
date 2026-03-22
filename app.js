const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// MIDDLEWARE: Servono per far capire al server i dati dei form e i file statici
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

const LOG_FILE = './log.json';

// Inizializza il file se non esiste (crea un array vuoto)
if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, JSON.stringify([]));
}

// ROTTA 1: Pagina principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ROTTA 2: Legge i dati dal file JSON e li invia al browser
app.get('/api/logs', (req, res) => {
    const dati = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    res.json(dati);
});

// ROTTA 3: Riceve i dati dal form e li salva nel file JSON
app.post('/api/add', (req, res) => {
    const elenco = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    
    const nuovoLog = {
        id: Date.now(), // Usiamo il timestamp come ID univoco
        studente: req.body.studente,
        attivita: req.body.attivita,
        data: new Date().toLocaleString('it-IT')
    };

    elenco.push(nuovoLog);
    fs.writeFileSync(LOG_FILE, JSON.stringify(elenco, null, 2));
    res.redirect('/'); // Ricarica la pagina per vedere il nuovo log
});

// ROTTA 4: Cancella un'attività in base all'ID
app.get('/api/delete/:id', (req, res) => {
    let elenco = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    const idDaCancellare = parseInt(req.params.id);
    
    // Filtriamo l'elenco tenendo tutto tranne l'id selezionato
    elenco = elenco.filter(item => item.id !== idDaCancellare);
    
    fs.writeFileSync(LOG_FILE, JSON.stringify(elenco, null, 2));
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server attivo su http://localhost:${PORT}`);
});
