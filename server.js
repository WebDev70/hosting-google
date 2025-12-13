const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));
app.use(express.json());

// Endpoint to proxy search requests
app.post('/api/search', async (req, res) => {
    try {
        const response = await axios.post('https://api.usaspending.gov/api/v2/search/spending_by_award/', req.body, {
            headers: { 'Content-Type': 'application/json' }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error proxying search request:', error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({ 
            detail: 'Error proxying request to USA Spending API.',
            originalError: error.response ? error.response.data : null
        });
    }
});

// Endpoint to proxy count requests
app.post('/api/count', async (req, res) => {
    try {
        const response = await axios.post('https://api.usaspending.gov/api/v2/search/spending_by_award_count/', req.body, {
            headers: { 'Content-Type': 'application/json' }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error proxying count request:', error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({ 
            detail: 'Error proxying request to USA Spending API.',
            originalError: error.response ? error.response.data : null 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
