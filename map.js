const THEME = 'theme';
const THEME_DARK = 'dark-v10';
const THEME_LIGHT = 'light-v10';

function toggleTheme() {
    let currentTheme = localStorage.getItem(THEME) || THEME_DARK;
    localStorage.setItem(THEME, currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK);
    window.location.reload();
}

function fitMap(map) {
    let bounds = [];
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker && !(layer instanceof L.MarkerCluster)) {
            bounds.push(layer._latlng);
        } else if (layer instanceof L.MarkerCluster) {
            layer.getAllChildMarkers().forEach(function(child) {
                console.log(child);
                bounds.push(child._latlng);
            });
        }
    });
    if (bounds.length > 0) {
        map.fitBounds(L.latLngBounds(bounds).pad(0.2));
    }
}

$(document).ready(function() {
    let currentTheme = localStorage.getItem(THEME) || THEME_DARK;

    let map = L.map('map', { attributionControl: false, zoomSnap: 0 });
    map.setView([22.5, 80], 5);

    let credits = L.control.attribution().addTo(map);
    credits.addAttribution('Made with <i class="fas fa-heart"></i> by Pavithra B');

    let mapboxApiKey = "pk.eyJ1IjoiYXNod2FudGhrdW1hciIsImEiOiJja3ZqaWRiMnIwcjNxMnZtdGMzdDV6NXd6In0.mnROzgnUQY5wheUA7i0HHA";
    let mapTileLayer = new L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/' + currentTheme + '/tiles/256/{z}/{x}/{y}?' +
        'access_token=' + mapboxApiKey, { maxNativeZoom: 18, maxZoom: 19 }
    );
    mapTileLayer.addTo(map);

    // Reset Map view
    L.easyButton('fa-crosshairs', function(btn, map) {
        fitMap(map);
    }, 'Center Map').addTo(map);

    // add theme toggle button on the map
    L.easyButton('fas fa-adjust', function() {
        toggleTheme();
    }, 'Toggle Theme').addTo(map);

    L.easyButton('fab fa-github', function() {
        window.open('https://github.com/pavisbalu/group-a1-ir-assignment-nov2021', '_new');
    }, 'View Source on Github').addTo(map);

    L.easyButton('fas fa-question', function() {
        tour();
    }, 'Show Help').addTo(map);

    const markers = L.markerClusterGroup({
        singleMarkerMode: true,
        animate: true,
        animateAddingMarkers: true,
        removeOutsideVisibleBounds: false,
    });

    new L.Control.Search({
        position: 'topright',
        initial: false,
        zoom: 5,
        marker: false,
        textPlaceholder: 'Search...                                                                                           ',
        url: "https://ir-assignment.herokuapp.com/search?q={s}",
        formatData: function(result) {
            let records = result.records.map(function(record) {
                return {
                    id: record.docId,
                    title: record.document.indexedFields.title,
                    description: record.document.indexedFields.description,
                    loc: [record.document.nonIndexedFields.latitude, record.document.nonIndexedFields.longitude],
                };
            }).reduce(function(prev, current) {
                prev[current.title] = current;
                return prev;
            }, {});

            return records;
        },
        moveToLocation: function(record, title, map) {
            let popupContent = `<div><h4>${title}</h4></div>`;
            let marker = L.marker(record.loc);
            let p = new L.Popup().setContent(popupContent);
            marker.bindPopup(p);
            markers.addLayer(marker);

            fitMap(map);
        },
    }).addTo(map);

    map.addLayer(markers);

    let introState = localStorage.getItem('intro');
    if (!introState) {
        tour();
    }
});

function tour() {
    let tour = introJs().setOptions({
        steps: [{
            title: "Welcome",
            intro: "This is the IR Assignment that was done by Group_A1 in November 2021. Let me quickly walk you through this interface. <p><em>You can also exit this guided tour by pressing <strong>ESC</strong> key.</em></p>"
        }, {
            title: "Search here",
            element: document.querySelector("div.leaflet-control-search.leaflet-control"),
            intro: "Click this icon to open a search bar to search for various locations around the world."
        }, {
            title: "Center Map",
            element: document.querySelector("button[title='Center Map']"),
            intro: "Center the map to show all the markers in a single view. It's useful when you've zoomed into a location and want to quickly fit all markers on the screen.",
        }, {
            title: "Toggle Theme",
            element: document.querySelector("button[title='Toggle Theme']"),
            intro: "Switch between Light and Dark Themes for the Map. Go ahead give it a try!",
        }]
    });
    tour.onexit(function() {
        localStorage.setItem('intro', 'true');
    });
    tour.start();
}