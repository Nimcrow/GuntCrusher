async function fetchHotspots() {
    const location = document.getElementById('location').value;
    const radius = document.getElementById('radius').value * 1609; // Get radius from input
    const response = await fetch(`/hotspots?location=${location}&radius=${radius}`);
    const data = await response.json();
    const hotspots = data.businesses;
    const sortedHotspots = heapSort(hotspots, 'rating');
    displayHotspots(sortedHotspots);
}


function displayHotspots(hotspots) {
    const hotspotsList = document.getElementById('hotspots-list');
    hotspotsList.innerHTML = '';
    hotspots.forEach(hotspot => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${hotspot.name}</strong> - Rating: ${hotspot.rating}<br>Address: ${hotspot.address}<br>Category: ${hotspot.term}<br><br>`;
        hotspotsList.appendChild(li);
    });
}

function heapSort(arr, key) {
    let n = arr.length;

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(arr, n, i, key);
    }

    for (let i = n - 1; i >= 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        heapify(arr, i, 0, key);
    }

    return arr;
}

function heapify(arr, n, i, key) {
    let largest = i;
    let left = 2 * i + 1;
    let right = 2 * i + 2;

    if (left < n && arr[left][key] > arr[largest][key]) {
        largest = left;
    }

    if (right < n && arr[right][key] > arr[largest][key]) {
        largest = right;
    }

    if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        heapify(arr, n, largest, key);
    }
}

window.fetchHotspots = fetchHotspots;
