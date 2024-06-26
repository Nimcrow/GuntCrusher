let map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map-container"), {
        center: { lat: 0, lng: 0 }, // Default center
        zoom: 10, // Default zoom level
    });
}

function addMarker(location) {
    new google.maps.Marker({
        position: location,
        map: map,
    });
}

// Initialize Google Maps
google.maps.event.addDomListener(window, "load", initMap);
