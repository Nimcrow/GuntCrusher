const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const API_URL = 'https://api.yelp.com/v3/businesses/search';

router.get('/', async (req, res) => {
    const location = req.query.location;
    const radius = req.query.radius || 9;
    const terms = ['restaurants', 'bookstores', 'museums', 'parks', 'zoos', 'arcades', 'escape games', 'theaters'];
    let results = [];

    try {
        for (let i = 0; i < terms.length; i++) {
            const response = await axios.get(API_URL, {
                headers: {Authorization: `Bearer ${process.env.MY_YELP_API_KEY}`,},
                params: {location: location,term: terms[i],radius: radius,},
            });

            // Holding information about the hotspots we're displaying which are the parameters shown below
            const businesses = response.data.businesses.map(business => ({
                name: business.name, rating: business.rating, address: business.location.display_address.join(', '), term: terms[i],coordinates: business.coordinates,
            }));

            // This is to output the hotspots and their information together as an array
            results = [...results, ...businesses];
        }
        res.json({ businesses: results });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
