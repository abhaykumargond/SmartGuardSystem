// Initialize the map
const map = L.map('map').setView([28.6139, 77.2090], 11); // Centered on Delhi

// Add OpenStreetMap tiles with a custom style
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Sample data for flood-affected areas in Delhi
const floodZones = [
    { lat: 28.6139, lng: 77.2090, name: "Yamuna River Flood Zone", severity: "high", description: "Severe flooding along Yamuna River banks" },
    { lat: 28.7041, lng: 77.1025, name: "North Delhi Flood Zone", severity: "medium", description: "Moderate flooding in residential areas" },
    { lat: 28.5355, lng: 77.3910, name: "East Delhi Flood Zone", severity: "high", description: "Heavy flooding in low-lying areas" },
    { lat: 28.4595, lng: 77.0266, name: "South Delhi Flood Zone", severity: "low", description: "Light flooding in some areas" },
    { lat: 28.6692, lng: 77.4538, name: "East Delhi Flood Zone 2", severity: "medium", description: "Moderate flooding in commercial areas" }
];

// Sample data for safe locations in Delhi
const safeLocations = {
    shelter: [
        { lat: 28.6139, lng: 77.2090, name: "Yamuna Shelter", capacity: 200, distance: "1.5 km" },
        { lat: 28.7041, lng: 77.1025, name: "North Delhi Shelter", capacity: 150, distance: "2.3 km" },
        { lat: 28.5355, lng: 77.3910, name: "East Delhi Shelter", capacity: 180, distance: "1.8 km" },
        { lat: 28.4595, lng: 77.0266, name: "South Delhi Shelter", capacity: 120, distance: "2.5 km" }
    ],
    hospital: [
        { lat: 28.6139, lng: 77.2090, name: "AIIMS Hospital", beds: 500, distance: "2.1 km" },
        { lat: 28.7041, lng: 77.1025, name: "Safdarjung Hospital", beds: 400, distance: "2.8 km" },
        { lat: 28.5355, lng: 77.3910, name: "GTB Hospital", beds: 350, distance: "1.9 km" },
        { lat: 28.4595, lng: 77.0266, name: "Moolchand Hospital", beds: 300, distance: "2.4 km" }
    ]
};

// Create flood zone markers with severity-based styling
const floodMarkers = floodZones.map(zone => {
    const severityColors = {
        high: '#e74c3c',
        medium: '#f39c12',
        low: '#f1c40f'
    };
    
    const severitySizes = {
        high: 20,
        medium: 15,
        low: 10
    };
    
    return L.circleMarker([zone.lat, zone.lng], {
        radius: severitySizes[zone.severity],
        fillColor: severityColors[zone.severity],
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    }).bindPopup(`
        <div class="popup-content">
            <h3>${zone.name}</h3>
            <p><strong>Severity:</strong> ${zone.severity.toUpperCase()}</p>
            <p><strong>Description:</strong> ${zone.description}</p>
            <button onclick="showNearbySafeLocations(${zone.lat}, ${zone.lng})" class="action-button">
                Show Nearby Safe Locations
            </button>
            <button onclick="showEmergencyInfo()" class="action-button">
                Emergency Information
            </button>
        </div>
    `);
});

// Create safe location markers
const safeMarkers = {
    shelter: safeLocations.shelter.map(loc => {
        return L.circleMarker([loc.lat, loc.lng], {
            radius: 12,
            fillColor: '#2ecc71',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).bindPopup(`
            <div class="popup-content">
                <h3>${loc.name}</h3>
                <p><strong>Type:</strong> Shelter</p>
                <p><strong>Capacity:</strong> ${loc.capacity} people</p>
                <p><strong>Distance:</strong> ${loc.distance}</p>
                <button onclick="showRoute(${loc.lat}, ${loc.lng})" class="action-button">
                    Get Directions
                </button>
                <button onclick="showShelterInfo()" class="action-button">
                    Shelter Details
                </button>
            </div>
        `);
    }),
    hospital: safeLocations.hospital.map(loc => {
        return L.circleMarker([loc.lat, loc.lng], {
            radius: 12,
            fillColor: '#3498db',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).bindPopup(`
            <div class="popup-content">
                <h3>${loc.name}</h3>
                <p><strong>Type:</strong> Hospital</p>
                <p><strong>Available Beds:</strong> ${loc.beds}</p>
                <p><strong>Distance:</strong> ${loc.distance}</p>
                <button onclick="showRoute(${loc.lat}, ${loc.lng})" class="action-button">
                    Get Directions
                </button>
                <button onclick="showHospitalInfo()" class="action-button">
                    Hospital Details
                </button>
            </div>
        `);
    })
};

// Add flood markers to map
floodMarkers.forEach(marker => marker.addTo(map));

// Initialize routing control with custom styling
const routingControl = L.Routing.control({
    waypoints: [],
    routeWhileDragging: true,
    show: false,
    lineOptions: {
        styles: [
            {color: '#1a73e8', opacity: 0.8, weight: 5},
            {color: '#2ecc71', opacity: 0.8, weight: 5, dashArray: '5,10'}
        ]
    },
    createMarker: function(i, waypoint, n) {
        return L.marker(waypoint.latLng, {
            icon: L.divIcon({
                className: 'route-marker',
                html: `<div class="marker-${i === 0 ? 'start' : 'end'}"></div>`,
                iconSize: [20, 20]
            })
        });
    }
}).addTo(map);

// Add legend
const legend = L.control({position: 'bottomright'});
legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'legend');
    div.innerHTML = `
        <h4>Map Legend</h4>
        <div class="legend-item">
            <div class="legend-color" style="background: #e74c3c"></div>
            <span class="legend-text">High Risk Area</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #f39c12"></div>
            <span class="legend-text">Medium Risk Area</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #f1c40f"></div>
            <span class="legend-text">Low Risk Area</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #2ecc71"></div>
            <span class="legend-text">Shelter</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #3498db"></div>
            <span class="legend-text">Hospital</span>
        </div>
    `;
    return div;
};
legend.addTo(map);

// Handle location type selection
document.getElementById('safeLocationType').addEventListener('change', function(e) {
    const type = e.target.value;
    
    // Remove existing safe location markers
    Object.values(safeMarkers).flat().forEach(marker => {
        if (map.hasLayer(marker)) {
            map.removeLayer(marker);
        }
    });

    // Add selected type markers
    if (type === 'all') {
        Object.values(safeMarkers).flat().forEach(marker => marker.addTo(map));
    } else {
        safeMarkers[type].forEach(marker => marker.addTo(map));
    }
});

// Handle "Locate Me" button click
document.getElementById('locateMe').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const userLocation = [position.coords.latitude, position.coords.longitude];
            map.setView(userLocation, 13);
            
            // Add user location marker
            L.marker(userLocation, {
                icon: L.divIcon({
                    className: 'user-location',
                    html: '<div class="user-marker"></div>',
                    iconSize: [20, 20]
                })
            }).bindPopup('Your Location').addTo(map);
        });
    } else {
        alert('Geolocation is not supported by your browser');
    }
});

// Function to show nearby safe locations
window.showNearbySafeLocations = function(lat, lng) {
    // Remove existing safe location markers
    Object.values(safeMarkers).flat().forEach(marker => {
        if (map.hasLayer(marker)) {
            map.removeLayer(marker);
        }
    });

    // Add all safe locations
    Object.values(safeMarkers).flat().forEach(marker => marker.addTo(map));
    
    // Center map on the flood zone
    map.setView([lat, lng], 13);
    
    // Show route information
    document.getElementById('routeInfo').innerHTML = `
        <h3>Nearby Safe Locations</h3>
        <p>Showing all safe locations near the selected flood zone.</p>
        <p>Click on any safe location to get directions.</p>
    `;
};

// Function to show route to safe location
window.showRoute = function(lat, lng) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const userLocation = [position.coords.latitude, position.coords.longitude];
            
            // Set up routing
            routingControl.setWaypoints([
                L.latLng(userLocation[0], userLocation[1]),
                L.latLng(lat, lng)
            ]);
            
            // Show route information
            document.getElementById('routeInfo').innerHTML = `
                <h3>Route Information</h3>
                <p>Calculating the safest route to your destination...</p>
                <p>Please follow the blue line on the map.</p>
            `;
        });
    } else {
        alert('Geolocation is not supported by your browser');
    }
};

// Emergency information functions
window.showEmergencyInfo = function() {
    document.getElementById('routeInfo').innerHTML = `
        <h3>Emergency Information</h3>
        <p><strong>Emergency Numbers:</strong></p>
        <ul>
            <li>Police: 100</li>
            <li>Ambulance: 108</li>
            <li>Fire: 101</li>
            <li>Disaster Management: 1078</li>
        </ul>
        <p><strong>Safety Tips:</strong></p>
        <ul>
            <li>Stay on higher ground</li>
            <li>Avoid walking through flood water</li>
            <li>Follow evacuation orders</li>
            <li>Keep emergency supplies ready</li>
        </ul>
    `;
};

window.showShelterInfo = function() {
    document.getElementById('routeInfo').innerHTML = `
        <h3>Shelter Information</h3>
        <p><strong>What to bring:</strong></p>
        <ul>
            <li>Identification documents</li>
            <li>Medications</li>
            <li>Change of clothes</li>
            <li>Basic toiletries</li>
            <li>Important phone numbers</li>
        </ul>
        <p><strong>Services available:</strong></p>
        <ul>
            <li>Food and water</li>
            <li>Medical assistance</li>
            <li>Communication facilities</li>
            <li>Basic supplies</li>
        </ul>
    `;
};

window.showHospitalInfo = function() {
    document.getElementById('routeInfo').innerHTML = `
        <h3>Hospital Information</h3>
        <p><strong>Emergency Services:</strong></p>
        <ul>
            <li>24/7 Emergency Care</li>
            <li>Ambulance Services</li>
            <li>Medical Supplies</li>
            <li>Emergency Contact: 108</li>
        </ul>
        <p><strong>What to bring:</strong></p>
        <ul>
            <li>Medical records</li>
            <li>Insurance information</li>
            <li>List of medications</li>
            <li>Emergency contact numbers</li>
        </ul>
    `;
}; 
