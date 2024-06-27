let map;
let userMarker;
let hotspotMarker;

// Initialize the map
function initMap() {
    map = L.map('map').setView([51.505, -0.09], 13); // Default to London

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Get the user's location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            map.setView([lat, lng], 13);
            if (userMarker) {
                userMarker.setLatLng([lat, lng]);
            } else {
                userMarker = L.marker([lat, lng]).addTo(map)
                    .bindPopup('You are here').openPopup();
            }
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}
// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c; // Distance in km
    const distanceMiles = distanceKm * 0.621371; // Convert km to miles
    return distanceMiles;
}

// Helper function to convert degrees to radians
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}


async function fetchHotspots() {
    const location = document.getElementById('location').value;
    const radius = document.getElementById('radius').value * 1609; // Get radius from input
    const response = await fetch(`/hotspots?location=${location}&radius=${radius}`);
    const data = await response.json();
    const hotspots = data.businesses;

    // Calculate distances for each hotspot
    hotspots.forEach(hotspot => {
        const distance = calculateDistance(
            userMarker.getLatLng().lat,
            userMarker.getLatLng().lng,
            hotspot.coordinates.latitude,
            hotspot.coordinates.longitude
        );
        hotspot.distance = distance * 0.621371; // Convert km to miles
        hotspot.distance = parseFloat(hotspot.distance.toFixed(2)); // Round to 2 decimal places
    });

    // Sort hotspots by distance using heap sort
    const sortedHotspots = heapSort(hotspots, 'distance'); // Assuming 'distance' is the key for distance in each hotspot object

    // Debugging: Log sorted hotspots to console to check order
    console.log(sortedHotspots);

    // Display sorted hotspots
    displayHotspots(sortedHotspots);

    // Update the user marker based on the new start location
    const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`);
    const geocodeData = await geocodeResponse.json();
    if (geocodeData.length > 0) {
        const lat = geocodeData[0].lat;
        const lng = geocodeData[0].lon;
        map.setView([lat, lng], 13);
        if (userMarker) {
            userMarker.setLatLng([lat, lng]);
        } else {
            userMarker = L.marker([lat, lng]).addTo(map)
                .bindPopup('You are here').openPopup();
        }
    }

    // Update the hotspot marker for the first hotspot in the sorted list
    if (hotspotMarker) {
        map.removeLayer(hotspotMarker);
    }
    if (sortedHotspots.length > 0) {
        const firstHotspot = sortedHotspots[0];
        const latLng = [firstHotspot.coordinates.latitude, firstHotspot.coordinates.longitude];
        hotspotMarker = L.marker(latLng).addTo(map)
            .bindPopup(`<strong>${firstHotspot.name}</strong><br>Rating: ${firstHotspot.rating}<br>Address: ${firstHotspot.address}<br>Distance: ${firstHotspot.distance.toFixed(2)} miles`)
            .openPopup();
        map.setView(latLng, 13);
    }
}

function displayHotspots(hotspots) {
    const hotspotsList = document.getElementById('hotspots-list');
    hotspotsList.innerHTML = '';
    hotspots.forEach((hotspot, index) => {
        const distance = calculateDistance(
            userMarker.getLatLng().lat,
            userMarker.getLatLng().lng,
            hotspot.coordinates.latitude,
            hotspot.coordinates.longitude
        ); // Distance in kilometers

        hotspot.distance = distance * 0.621371; // Convert km to miles
        hotspot.distance = parseFloat(hotspot.distance.toFixed(2)); // Round to 2 decimal places

        const li = document.createElement('li');
        li.innerHTML = `<strong>${hotspot.name}</strong> - Rating: ${hotspot.rating}<br>Address: ${hotspot.address}<br>Category: ${hotspot.term}<br>Distance: ${hotspot.distance} miles<br><br>`;
        li.addEventListener('click', () => {
            updateHotspotMarker(hotspot);
        });
        hotspotsList.appendChild(li);
    });
}

function updateHotspotMarker(hotspot) {
    const latLng = [hotspot.coordinates.latitude, hotspot.coordinates.longitude];
    if (hotspotMarker) {
        hotspotMarker.setLatLng(latLng)
            .bindPopup(`<strong>${hotspot.name}</strong><br>Rating: ${hotspot.rating}<br>Address: ${hotspot.address}`)
            .openPopup();
    } else {
        hotspotMarker = L.marker(latLng).addTo(map)
            .bindPopup(`<strong>${hotspot.name}</strong><br>Rating: ${hotspot.rating}<br>Address: ${hotspot.address}`)
            .openPopup();
    }
    map.setView(latLng, 13);
}

function heapSort(arr, key) {
    let n = arr.length;

    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(arr, n, i, key);
    }

    // Heap sort
    for (let i = n - 1; i >= 0; i--) {
        // Swap root (max element) with last element
        [arr[0], arr[i]] = [arr[i], arr[0]];
        
        // Heapify root element
        heapify(arr, i, 0, key);
    }

    return arr;
}

function heapify(arr, n, i, key) {
    let largest = i;
    let left = 2 * i + 1;
    let right = 2 * i + 2;

    // Compare left child with root
    if (left < n && arr[left][key] > arr[largest][key]) {
        largest = left;
    }

    // Compare right child with root
    if (right < n && arr[right][key] > arr[largest][key]) {
        largest = right;
    }

    // Swap and heapify if root is not largest
    if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        heapify(arr, n, largest, key);
    }
}

window.onload = () => {
    initMap();
    getUserLocation();
};
