const VIEW = 'view';
const VIEW_GROUPED = 'grouped';
const VIEW_CLUSTERED = 'clustered';
const THEME = 'theme';
const THEME_DARK = 'dark-v10';
const THEME_LIGHT = 'light-v10';

function toggleTheme() {
    let currentTheme = localStorage.getItem(THEME) || THEME_DARK;
    localStorage.setItem(THEME, currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK);
    window.location.reload();
}

function toggleView() {
    let currentView = localStorage.getItem(VIEW) || VIEW_GROUPED;
    localStorage.setItem(VIEW, currentView === VIEW_GROUPED ? VIEW_CLUSTERED : VIEW_GROUPED);
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
    let currentTheme = localStorage.getItem(THEME) || THEME_LIGHT;
    let currentView = localStorage.getItem(VIEW) || VIEW_GROUPED;

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

    // add view toggle button on the map
    L.easyButton('fa-users-cog', function() {
        toggleView();
    }, 'Change View').addTo(map);

    // add theme toggle button on the map
    L.easyButton('fas fa-adjust', function() {
        toggleTheme();
    }, 'Toggle Theme').addTo(map);

    // add view toggle button on the map
    L.easyButton('fa-user-plus', function() {
        window.open('https://docs.google.com/spreadsheets/d/1inOlpl1oS7AYQpcGSMVH7WmQMMDmyRCrkVmWihc4KpU/edit#gid=0', '_new');
    }, 'Add Members').addTo(map);

    L.easyButton('fab fa-github', function() {
        window.open('https://github.com/pavisbalu/ben10-locations', '_new');
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

    // // NB: Might want to delete this URL with the API Key after the demo / it has served it's purpose
    // let searchUrl = "https://ir-assignment.herokuapp.com/search?q=india";

    // $.getJSON(searchUrl, function(result) {
    //     // console.log(result);
    //     let results = result.records.map(function(record) {
    //         return {
    //             title: record.document.indexedFields.title,
    //             description: record.document.indexedFields.description,
    //             latitude: record.document.nonIndexedFields.latitude,
    //             longitude: record.document.nonIndexedFields.longitude,
    //         };
    //     });


    //     let markers = L.markerClusterGroup({ singleMarkerMode: true });

    //     results.forEach(function(r) {
    //         let popupContent = `<div><h4>${r.title}</h4></div>`;
    //         let marker = L.marker([r.latitude, r.longitude]);
    //         let p = new L.Popup().setContent(popupContent);
    //         marker.bindPopup(p);
    //         markers.addLayer(marker);
    //     });

    //     map.addLayer(markers);


    //     fitMap(map);
    // });

    // let introState = localStorage.getItem('intro');
    // if (!introState) {
    //     tour();
    // }
});

function tour() {
    let tour = introJs().setOptions({
        steps: [{
            title: "Welcome",
            element: document.querySelector("div.leaflet-top.leaflet-left"),
            intro: "Hello 👋, Apart from the map on the right, you also have various controls available here. <p><em>You can also exit this guided tour by pressing <strong>ESC</strong> key.</em></p>"
        }, {
            title: "Center Map",
            element: document.querySelector("button[title='Center Map']"),
            intro: "Center the map to show all the markers in a single view. It's useful when you've zoomed into a location and want to quickly fit all markers on the screen.",
        }, {
            title: "Toggle Views",
            element: document.querySelector("button[title='Change View']"),
            intro: "Switch between Grouped vs Clustered View. <p>Grouped View shows all members grouped by city, Clustered view clusters individual markers by their distance on the screen.</p><p><em> My personal preferance is Clustered View.</em></p>",
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

function addMarkersByCluster(members, map) {
    let markers = L.markerClusterGroup({ singleMarkerMode: true });
    let pops = [];

    members.map(function(member) {
        let popupContent = `<div><h4>${member.name}</h4></div>`;
        let marker = L.marker([member.latitude, member.longitude]);
        let p = new L.Popup({ autoClose: false, closeOnClick: false }).setContent(popupContent);
        pops.push(marker.bindPopup(p));
        markers.addLayer(marker);
    });

    map.addLayer(markers);

    // attempt to pre-open the pop-ups wherever possible
    pops.forEach(function(p) {
        p.openPopup();
    });
}

function addMarkersByGroupingMembersByCity(members, map) {
    let groupedMembersByCity = _.groupBy(members, 'city');
    let cities = _.allKeys(groupedMembersByCity).map(function(city) {
        let membersInCurrentCity = groupedMembersByCity[city];
        let first = _.head(membersInCurrentCity);
        return {
            city: first.city,
            latitude: first.latitude,
            longitude: first.longitude,
        }
    });
    let cityToLatLongs = cities.reduce((obj, item) => (obj[item.city] = item, obj), {});

    _.allKeys(groupedMembersByCity).map(function(city) {
        let membersInCurrentCity = groupedMembersByCity[city];
        let name = membersInCurrentCity.map(function(member) {
            return member.name
        }).join("<br>");

        let cityPosition = cityToLatLongs[city];

        let popupContent = `<div><h4>${name}</h4></div>`;
        let pos = [cityPosition.latitude, cityPosition.longitude];
        let marker = L.marker(pos);
        let p = new L.Popup({ autoClose: false, closeOnClick: false })
            .setContent(popupContent);
        marker.bindPopup(p).addTo(map).openPopup();
    });
}