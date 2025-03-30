require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

app.use(express.json());

app.get('/get-place-photo', async (req, res) => {
    try {
        const { placeName, city } = req.query;
        if (!placeName || !city) {
            return res.status(400).json({ error: 'Missing placeName or city' });
        }

        // Find Place API Request
        const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(placeName + ', ' + city)}&inputtype=textquery&fields=place_id&key=${GOOGLE_API_KEY}`;
        const findPlaceResponse = await axios.get(findPlaceUrl);
        const placeId = findPlaceResponse.data.candidates[0]?.place_id;

        if (!placeId) {
            return res.status(404).json({ error: 'Place not found' });
        }

        // Get Photo Reference
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_API_KEY}`;
        const detailsResponse = await axios.get(detailsUrl);
        const photoReference = detailsResponse.data.result.photos?.[0]?.photo_reference;

        if (!photoReference) {
            return res.status(404).json({ error: 'No photos available' });
        }

        // Construct Photo URL
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${GOOGLE_API_KEY}`;
        res.json({ photoUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
