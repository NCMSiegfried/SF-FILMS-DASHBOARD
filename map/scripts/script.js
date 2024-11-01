// Initialize  map
var map = L.map('map',{
    zoomControl: false,
    zoomSnap: 0,
    wheelDebounceTime: 100,
    zoomDelta:0.5,
    wheelPxPerZoomLevel:80,
    scrollWheelZoom: false
    }).setView([37.76, -122.48], 12.5);
map.scrollWheelZoom = true;

//position zoom buttons on top right
L.control.zoom({
    position:'topright',
}).addTo(map);

//Set Map Bounds
var bayAreaBounds = [
    [36.8, -123.3],
    [38.6, -121.5]
];
map.setMaxBounds(bayAreaBounds);

//Add 'smooth dark' tile layer from stadia maps with min zoom
L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=8ff5f85d-e7f5-44fa-90bd-df95edd37619', {
  minZoom: 10,
  attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
}).addTo(map);

//create variables for map markers
var defaultMarkerOptions = {
    radius: 3,
    fillColor: "#e6409e", //purplish
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
//create highlight colors
var highlightMarkerOptions = {
    radius: 5,
    fillColor: "#ffde21", //yellowish
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 1
};

var highlightedLayer = null;
var geojsonData;
var namesData;
// Store references to markers by ID
var markers = {};

//FILTER VARIABLES
var uniqueDirectors = new Set();
var uniqueProdCompanies = new Set();
var uniqueDistributors = new Set();
var uniqueWriters = new Set();
var uniqueGenres = new Set();
var uniqueStars = new Set();

var selectedDirector = null;
var selectedProdCompany = null;
var selectedDistributor = null;
var selectedWriter = null;
var selectedGenre = null;
var selectedStar = null;


var uniqueDirectorsSelected = new Set();
var uniqueProdCompaniesSelected = new Set();
var uniqueDistributorsSelected = new Set();
var uniqueWritersSelected = new Set();
var uniqueGenresSelected = new Set();
var uniqueStarsSelected = new Set();


var filterIndexing = new Set();

//SLIDE SHOW FUNCTIONS
// Next/previous controls
var slideIndex = 1;
var timer = null;

function clickNextButton() {
    document.querySelector('.next').click();
}

function plusSlides(n) {
  clearTimeout(timer);
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  clearTimeout(timer);
  showSlides(slideIndex = n);
}

//function showSlides(n) {
//  var i;
//  var slides = document.getElementsByClassName("slide");
//  if (n > slides.length) {
//    slideIndex = 1
//  }
//  if (n < 1) {
//    slideIndex = slides.length
//  }
//  for (i = 0; i < slides.length; i++) {
//    slides[i].style.display = "none";
//  }
//  slides[slideIndex-1].style.display = "block";
//}


function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("slide");
  if (n==undefined){n = ++slideIndex}
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  slides[slideIndex-1].style.display = "block";
  timer = setTimeout(showSlides, 6000);
  resetHighlight();
  console.log(n, markers)
  if (n == 1 | n == 16) {
  highlightedLayer = markers[1844];
  } else if (n==2){
  highlightedLayer = markers[1]
  }else if (n==3){
  highlightedLayer = markers[638]
  }else if (n==4){
  highlightedLayer = markers[1557]
  }else if (n==5){
  highlightedLayer = markers[428]
  }else if (n==6){
  highlightedLayer = markers[1520]
  }else if (n==7){
  highlightedLayer = markers[2077]
  }else if (n==8){
  highlightedLayer = markers[525]
  }else if (n==9){
  highlightedLayer = markers[1887]
  }else if (n==10){
  highlightedLayer = markers[1757]
  }else if (n==11){
  highlightedLayer = markers[19]
  }else if (n==12){
  highlightedLayer = markers[1854]
  }else if (n==13){
  highlightedLayer = markers[737]
  }else if (n==14){
  highlightedLayer = markers[1885]
  }else if (n==15){
  highlightedLayer = markers[370]
  }

  highlightedLayer.setStyle(highlightMarkerOptions);
}

//TRIAL: POPULATE DROP DOWNS DYNAMICALLY
function populateDropdown(dropdownId, dataSet, savedValue) {
    const dropdown = document.getElementById(dropdownId);
    const sortedData = Array.from(dataSet).sort();
    dropdown.length = 0;
    const option = document.createElement("option");
    option.value = '';
    if (dropdownId == "directorFilter"){
        option.text = 'Select Director';
        dropdown.appendChild(option);
    } else if (dropdownId == "prodCompanyFilter"){
        option.text = 'Select Production Company';
        dropdown.appendChild(option);
    } else if (dropdownId == "distributorFilter"){
        option.text = 'Select Distributor';
        dropdown.appendChild(option);
    } else if (dropdownId == "writerFilter"){
        option.text = 'Select Writer';
        dropdown.appendChild(option);
    } else if (dropdownId == "genreFilter"){
        option.text = 'Select Genre';
        dropdown.appendChild(option);
    } else if (dropdownId == "starFilter"){
        option.text = 'Select Actor/Actress';
        dropdown.appendChild(option);
    }
    //console.log(dropdownId, dataSet, savedValue, dropdown)
    dropdown.appendChild(option);
    sortedData.forEach(function(item) {
        const option = document.createElement("option");
        option.value = item;
        option.text = item;
        dropdown.appendChild(option);
    });
    if (savedValue) {
        dropdown.value = savedValue;
    }
}

// Use the function to populate both dropdowns
function populateDropDowns() {
    populateDropdown("directorFilter", uniqueDirectors, selectedDirector);
    populateDropdown("prodCompanyFilter", uniqueProdCompanies, selectedProdCompany);
    populateDropdown("distributorFilter", uniqueDistributors, selectedDistributor);
    populateDropdown("writerFilter", uniqueWriters, selectedWriter);
    populateDropdown("genreFilter", uniqueGenres, selectedGenre);
    populateDropdown("starFilter", uniqueStars, selectedStar);
}

// Function to filter markers based on the selected director or production company
function filterMarkers(director, prodCompany, distributor, writer, genre, star) {
    uniqueProdCompaniesSelected.clear();
    uniqueDirectorsSelected.clear();
    uniqueDistributorsSelected.clear();
    uniqueWritersSelected.clear();
    uniqueGenresSelected.clear();
    uniqueStarsSelected.clear()

    // Clear the existing layers before applying the filter
    map.eachLayer(function(layer) {
        if (layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
        }
    });
    // Add the filtered markers
    L.geoJSON(geojsonData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, defaultMarkerOptions);
        },
        filter: function(feature) {
            // Show all markers if no filters are selected
            if (!director && !prodCompany && !distributor && !writer && !genre && !star) return true;

            // Check each filter condition independently
            let matchesDirector = true;
            let matchesProdCompany = true;
            let matchesDistributor = true;
            let matchesWriter = true;
            let matchesGenre = true;
            let matchesStar = true;

            // Check for director match if a director is specified
            if (director) {
                matchesDirector = feature.properties.director1_name === director || feature.properties.director2_name === director;
            }

            // Check for production company match if a production company is specified
            if (prodCompany) {
                matchesProdCompany = feature.properties["Production Company"] === prodCompany;
            }

            // Check for distributor match if a distributor is specified
            if (distributor) {
                matchesDistributor = feature.properties.Distributor === distributor;
            }

            // Check for writer match if a writer is specified
            if (writer) {
                matchesWriter = feature.properties.writer1_name === writer ||
                                feature.properties.writer2_name === writer ||
                                feature.properties.writer3_name === writer;
            }
            if (genre) {
                if (feature.properties.genres){
                    matchesGenre = feature.properties.genres.includes(genre);
                } else {
                    matchesGenre = false;
                }
            }
            if (star) {
                matchesStar = feature['properties']['Actor 1'] === star ||
                    feature['properties']['Actor 2'] === star ||
                    feature['properties']['Actor 3'] === star;
                console.log(star)
            }
            // Return true only if all specified filters match
            return matchesDirector && matchesProdCompany && matchesDistributor && matchesWriter && matchesGenre && matchesStar;
        },
        onEachFeature: function (feature, layer) {
            if (feature.properties.director1_name) {
                uniqueDirectorsSelected.add(feature.properties.director1_name);
            }
            if (feature.properties.director2_name) {
                uniqueDirectorsSelected.add(feature.properties.director2_name);
            }
            uniqueProdCompaniesSelected.add(feature.properties["Production Company"]);
            uniqueDistributorsSelected.add(feature.properties.Distributor);
            if (feature.properties.writer1_name) {
                uniqueWritersSelected.add(feature.properties.writer1_name);
            }
            if (feature.properties.writer2_name) {
                uniqueWritersSelected.add(feature.properties.writer2_name);
            }
            if (feature.properties.writer3_name) {
                uniqueWritersSelected.add(feature.properties.writer3_name);
            }
            if (feature.properties.genres) {
                let genres = feature.properties.genres
                genres = genres.split(',')
                genres.forEach(function (item, index){
                uniqueGenresSelected.add(item.trim())
                })
            }
            if (feature['properties']['Actor 1']) {
                uniqueStarsSelected.add(feature['properties']['Actor 1']);
            }
            if (feature['properties']['Actor 2']) {
                uniqueWritersSelected.add(feature['properties']['Actor 2']);
            }
            if (feature['properties']['Actor 3']) {
                uniqueWritersSelected.add(feature['properties']['Actor 3']);
            }
            // Add click event to highlight the marker and update the side panel
            layer.on('click', function () {
                resetHighlight();
                highlightedLayer = layer;
                layer.setStyle(highlightMarkerOptions);
                var coords = feature.geometry.coordinates;
                var properties = feature.properties;
                updateSidePanel(properties, coords, namesData);
            });
        }
    }).addTo(map);

    // Update dropdowns with the unique values collected
    populateDropdown("prodCompanyFilter", uniqueProdCompaniesSelected, selectedProdCompany);
    populateDropdown("directorFilter", uniqueDirectorsSelected, selectedDirector);
    populateDropdown("distributorFilter", uniqueDistributorsSelected, selectedDistributor);
    populateDropdown("writerFilter", uniqueWritersSelected, selectedWriter);
    populateDropdown("genreFilter", uniqueGenresSelected, selectedGenre);
    populateDropdown("starFilter", uniqueStarsSelected, selectedStar);

    // Log the updated sets for debugging
    console.log("Filtered Production Companies:", uniqueProdCompaniesSelected);
    console.log("Filtered Directors:", uniqueDirectorsSelected);
    console.log("Filtered Distributor:", uniqueDistributorsSelected);
    console.log("Filtered Writer:", uniqueWritersSelected);
    console.log("Filtered Genre:", uniqueGenresSelected);
    console.log("Filtered Star:", uniqueStarsSelected);
}

// Function to reset the highlight of all markers
function resetHighlight() {
    if (highlightedLayer) {
        highlightedLayer.setStyle(defaultMarkerOptions);
        highlightedLayer = null;
    }
}
//function for pop up
function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

// Function to update the side panel with default content on page load
function sidePanelHome() {
    var sidePanel = document.getElementById('sidePanel');
    sidePanel.innerHTML = `
        <h2>San Francisco Films Map</h2>
        <p>Click on any marker to view film details.</p>
        <div class="slideShowContainer">
            <div class="slide fade">
                <div class="numbertext">1 / 15</div>
                <img id="homeImage" src="images/_HomePanelImages/BullitChaseIMG.jpg" alt="Image 1">
                <p>Bullit, 1968</p>
                <p>Much of the famed Bullit car chase scene was filmed on Taylor Street</p>
            </div>
            <div class="slide fade">
                <div class="numbertext">2 / 15</div>
                <img id="homeImage" src="images/_HomePanelImages/ExperimentInTerror_FishermansWharf.jpeg" alt="Image 2">
                <p>Experiment in Terror, 1962</p>
                <p>Blake Edward's thriller noir showing Fisherman's Wharf and Pier 49 back when it was actually used for fishing</p>
            </div>
            <div class="slide fade">
                <div class="numbertext">3 / 15</div>
                <img id="homeImage" src="images/_HomePanelImages/Vertigo_Fort_Point.jpg" alt="Image 3">
                <p>Vertigo</p>
                <p>Alfred Hitchcock's '</p>
            </div>
            <div class="slide fade">
                <div class="numbertext">4 / 15</div>
                <img id="homeImage" src="images/_HomePanelImages/AlwaysBeMyMaybe_Pier7.png" alt="Image 4">
            </div>
            <div class="slide fade">
                <div class="numbertext">5 / 15</div>
                <img id="homeImage" src="images/_HomePanelImages/ChanIsMissing.png" alt="Image 5">
            </div>
            <div class="slide fade">
                <div class="numbertext">6 / 15</div>
                <img id="homeImage" src="images/_HomePanelImages/HaroldMaude_SutroBaths.png" alt="Image 6">
            </div>
            <div class="slide fade">
                <div class="numbertext">7 / 15</div>
                <img id="homeImage" src="images/_HomePanelImages/HERBIERIDESAGAINIMG.jpg" alt="Image 7">
            </div>
            <div class="slide fade">
                <div class="numbertext">8 / 15</div>
                <img id="homeImage" src="images/_HomePanelImages/houseOnTelegraphHill.jpeg" alt="Image 8">
            </div>
            <div class="slide fade">
                <div class="numbertext">9 / 15</div>
                <img id="homeImage" src="images/_HomePanelImages/InvasionOfTheBodySnatchers_DeptofHealth.png" alt="Image 9">
            </div>
            <div class="slide fade">
                <div class="numbertext">10 / 15</div>
                <img id="homeImage" src="images/_HomePanelImages/PalJoey_SprecklesMansion.jpeg" alt="Image 10">
            </div>
            <div class="slide fade">
                <div class="numbertext">11 / 15</div>
                <img id="homeImage" src="images/_HomePanelImages/PursuitofHappyness_GlenParkSubway.png" alt="Image 11">
            </div>
            <div class="slide fade">
                <div class="numbertext">12 / 15</div>
                <img id="homeImage" src="images/_HomePanelImages/StarTrekGoldenGateBridge.png" alt="Image 12">
            </div>
            <div class="slide fade">
                <div class="numbertext">13 / 15</div>
                <img id="homeImage" src="images/_HomePanelImages/STEVEMCQUEEN_TaylorSt.jpg" alt="Image 13">
            </div>
            <div class="slide fade">
                <div class="numbertext">14 / 15</div>
                <img id="homeImage" src="images/_HomePanelImages/TheConversation_FinancialDistrict.jpg" alt="Image 14">
            </div>
            <div class="slide fade">
                <div class="numbertext">15 / 15</div>
                <img id="homeImage" src="images/_HomePanelImages/TheLineUpWarMemoralOpera.jpeg" alt="Image 15">
            </div>
            <a class="prev" id="prev" onclick="plusSlides(-1)">&#10094;</a>
            <a class="next" id="next" onclick="plusSlides(1)">&#10095;</a>

        <div id="slider"></div>

        </div>
        <p>Or add a filter</p>
        <div id="filterContainer">
            <select class= "dropdown hidden" id="directorFilter">
            </select>
            <select class= "dropdown hidden" id="prodCompanyFilter">
            </select>
            <select class= "dropdown hidden" id="distributorFilter">
            </select>
            </select>
            <select class= "dropdown hidden" id="writerFilter">
            </select>
            </select>
            <select class= "dropdown hidden" id="genreFilter">
            </select>
            <select class= "dropdown hidden" id="starFilter">
            </select>
        </div>
        <div id="filterSelectorContainer">
            <br/>
            <select class="dropdown" id="filterSelector">
                <option value="">--Add Filter--</option>
                <option value="directorFilter">Director</option>
                <option value="prodCompanyFilter">Production Company</option>
                <option value="distributorFilter">Distributor</option>
                <option value="writerFilter">Writer</option>
                <option value="genreFilter">Genre</option>
                <option value="starFilter">Actor/Actress</option>
            </select>
        </div>
        <br/>
        <button id="reset-filter">
            Reset Filter
        </button>
    `;
    populateDropDowns();
    document.getElementById('directorFilter').addEventListener('change', function() {
        selectedDirector = this.value;
        filterMarkers(selectedDirector, selectedProdCompany, selectedDistributor, selectedWriter, selectedGenre, selectedStar);
    });
    document.getElementById('prodCompanyFilter').addEventListener('change', function() {
        selectedProdCompany = this.value;
        filterMarkers(selectedDirector, selectedProdCompany, selectedDistributor, selectedWriter, selectedGenre, selectedStar);
    });
    document.getElementById('distributorFilter').addEventListener('change', function() {
        selectedDistributor = this.value;
        filterMarkers(selectedDirector, selectedProdCompany, selectedDistributor, selectedWriter, selectedGenre, selectedStar);
    });
    document.getElementById('writerFilter').addEventListener('change', function() {
        selectedWriter = this.value;
        filterMarkers(selectedDirector, selectedProdCompany, selectedDistributor, selectedWriter, selectedGenre, selectedStar);
    });
    document.getElementById('genreFilter').addEventListener('change', function() {
        selectedGenre = this.value;
        filterMarkers(selectedDirector, selectedProdCompany, selectedDistributor, selectedWriter, selectedGenre, selectedStar);
    });
    document.getElementById('starFilter').addEventListener('change', function() {
        selectedStar = this.value;
        filterMarkers(selectedDirector, selectedProdCompany, selectedDistributor, selectedWriter, selectedGenre, selectedStar);
    });
    document.getElementById('reset-filter').addEventListener('click', function() {
        selectedDirector = null;
        selectedProdCompany = null;
        selectedDistributor = null;
        selectedWriter = null;
        selectedGenre = null;
        selectedStar = null;
        populateDropDowns();
        filterMarkers(selectedDirector, selectedProdCompany, selectedDistributor, selectedWriter, selectedGenre, selectedStar);
    });
    if (selectedDirector || selectedProdCompany || selectedDistributor || selectedWriter || selectedGenre || selectedStar){
        filterMarkers(selectedDirector, selectedProdCompany, selectedDistributor, selectedWriter, selectedGenre, selectedStar);
    };
    if (filterIndexing.size > 0) {
        filterIndexing.forEach((val) => {
          const dropdown = document.getElementById(val);
          document.getElementById(val).style.display = 'block';
          document.getElementById('filterContainer').appendChild(dropdown);
          document.getElementById('filterSelector').querySelector(`option[value="${val}"]`).remove();
        });
    }
    document.getElementById('filterSelector').addEventListener('change', function() {
        const selectedValue = this.value;
        const selectedDropdown = document.getElementById(selectedValue);
        //Show filter and append it to filterContainer div
        document.getElementById(selectedValue).style.display = 'block';
        document.getElementById('filterContainer').appendChild(selectedDropdown);
        // add selected value to 'filterIndexing' set to reload filters when back button is pressed
        filterIndexing.add(selectedValue);
        // remove selected value from the filterSelector
        this.querySelector(`option[value="${selectedValue}"]`).remove();
    });
    showSlides(slideIndex);
}

function updateSidePanel(properties, coords, namesData) {
    var sidePanel = document.getElementById('sidePanel');
    sidePanel.innerHTML = `
        <button class= "back-button" id="back-button">
            <span class="arrow"></span> Back
        </button>
        <p><a href="https://www.imdb.com/title/${properties.tconst}/" target= "_blank" rel="noopener noreferrer">
            <img id= "selectedImage" src="images/${properties.tconst}/Image_1.jpg"/>
        </a></p>
        <table>
            <thead>
                <tr>
                    <th class="th-text th-header" scope="col" style= "color:#F5F5F5; font-size:150%; background-color: #707070" colspan="2"><div style= "border: 2px solid #505050;margin: -5pt;">${properties.Title || ''}</div></th>
                </tr>
            </thead>
            <tbody id="detailsTableBody">
            </tbody>
        </table>
        <div class="MoreInfoButton">
            <button id="MoreInfoButton">More Information</button>
        </div>
    `;
    appendMovieTable(properties);
    // Adding event listeners for directors links
    document.querySelectorAll('.director-link').forEach(function(element) {
        element.addEventListener('click', function() {
            var nconst = this.getAttribute('data-nconst');
            showNameDetails(properties, coords, nconst, namesData);
        });
    });
    document.querySelectorAll('.actor-link').forEach(function(element) {
        element.addEventListener('click', function() {
            var nconst = this.getAttribute('data-nconst');
            showNameDetails(properties, coords, nconst, namesData);
        });
    });

    // Add event listener to the "More Information" button
    document.getElementById('MoreInfoButton').addEventListener('click', function() {
        // Hide the "More Information" button
        this.style.display = 'none';
        // Show additional details in the side panel
        showMoreDetails(properties, coords, namesData);
    });

    // Add event listener to the "Back" button
    document.getElementById('back-button').addEventListener('click', function() {
        // Go back to the default side panel content
        sidePanelHome();
        resetHighlight();
    });
}

function appendMovieTable(properties) {
    var tableBody = document.getElementById('detailsTableBody');

    function addRowWithSlideDown(label, value, delay, idx) {
        var row = tableBody.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = `<strong>${label}</strong>`;
        cell2.innerHTML = value;
        cell1.classList.add('cell1-text');
        cell2.classList.add('cell2-text');
    }
    let delay = 0;
    let idx = 0;
    if (properties['Release Year']) {
        addRowWithSlideDown("Release Year", properties['Release Year']);
    }
    if (properties['Season']) {
        addRowWithSlideDown("Season", properties['Season']);
    }
    if (properties['Episode']) {
        addRowWithSlideDown("Episode", properties['Episode']);
    }
    if (properties.director1_name) {
        var directorNames = `
            <span class="director-link" data-nconst="${properties.director1_nconst}">${properties.director1_name}</span>
            ${properties.director2_name ? `, <span class="director-link" data-nconst="${properties.director2_nconst}">${properties.director2_name}</span>` : ''}
        `;
        addRowWithSlideDown("Director(s)", directorNames);
    }
    if (properties['Actor 1']) {
        var actorNames = `
            <span class="actor-link" data-nconst="${properties.actor1nconst}">${properties['Actor 1']}</span>
            ${properties['Actor 2'] ? `, <span class="actor-link" data-nconst="${properties.actor2nconst}">${properties['Actor 2']}</span>` : ''}
            ${properties['Actor 3'] ? `, <span class="actor-link" data-nconst="${properties.actor3nconst}">${properties['Actor 3']}</span>` : ''}
        `;
        addRowWithSlideDown("Stars", actorNames);
    }
    if (properties.genres) {
        addRowWithSlideDown("Genre(s)", properties.genres);
    }
    if (properties.Locations) {
        addRowWithSlideDown("Location", properties.Locations);
    }
}

function showMoreDetails(properties, coords, namesData) {
    var testing = properties.director1_nconst;
    console.log("Additional data loaded:", testing);
    console.log("Additional data loaded:", properties);

    var tableBody = document.getElementById('detailsTableBody');

    // Function to add a new row with slide-down animation
    function addRowWithSlideDown(label, value, delay, idx) {
        var row = tableBody.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = `<strong>${label}</strong>`;
        cell2.innerHTML = value;
        cell1.classList.add('cell1-text');
        cell2.classList.add('cell2-text');
    }
    let delay = 0;
    let idx = 0;

    if (properties['Production Company']) {
        addRowWithSlideDown("Production Company", properties['Production Company']);
    }

    if (properties.Distributor) {
        addRowWithSlideDown("Distributor", properties.Distributor);
    }

    if (properties.run_time) {
        addRowWithSlideDown("Run Time", properties.run_time + " minutes");
    }

    if (properties.avg_rating) {
        addRowWithSlideDown("Average IMDB Rating", properties.avg_rating);
    }

    if (properties.numVotes_comma) {
        addRowWithSlideDown("Number of IMDB Votes", properties.numVotes_comma);
    }

    if (properties.writer1_name) {
        var writerNames = `
            <span class="writer-link" data-nconst="${properties.writer1_nconst}">${properties.writer1_name}</span>
            ${properties.writer2_name ? `, <span class="writer-link" data-nconst="${properties.writer2_nconst}">${properties.writer2_name}</span>` : ''}
            ${properties.writer3_name ? `, <span class="writer-link" data-nconst="${properties.writer3_nconst}">${properties.writer3_name}</span>` : ''}
        `;
        addRowWithSlideDown("Writer(s)", writerNames);
    }

    // Adding event listeners for writers links
    document.querySelectorAll('.writer-link').forEach(function(element) {
        element.addEventListener('click', function() {
            var nconst = this.getAttribute('data-nconst');
            showNameDetails(properties, coords, nconst, namesData);
        });
    });

    // Add event listener to the "Back" button
    document.getElementById('back-button').addEventListener('click', function() {
        // Go back to the previous state of the side panel
        sidePanelHome();
        resetHighlight();
    });
}


function appendNameTable(nconst, namesData) {
    var tableBody = document.getElementById('detailsTableBody');
    if (namesData[nconst].birthYear && namesData[nconst].birthYear !== 'null') {
        var row = tableBody.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = "<strong>Born</strong>";
        cell2.innerHTML = namesData[nconst].birthYear;
        cell1.classList.add('cell1-text');
        cell2.classList.add('cell2-text');
    }
    if (namesData[nconst].deathYear && namesData[nconst].deathYear !== 'null') {
        var row = tableBody.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = "<strong>Death</strong>";
        cell2.innerHTML = namesData[nconst].deathYear;
        cell1.classList.add('cell1-text');
        cell2.classList.add('cell2-text');
    }
    if (namesData[nconst].primaryProfession && namesData[nconst].primaryProfession !== 'null') {
        var row = tableBody.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = "<strong>Primary Professions</strong>";
        cell2.innerHTML = namesData[nconst].primaryProfession;
        cell1.classList.add('cell1-text');
        cell2.classList.add('cell2-text');
    }
    if (namesData[nconst].KnowForTitleNames && namesData[nconst].primaryProfession !== 'null') {
        var row = tableBody.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = "<strong>Notable Works:</strong>";
        cell2.innerHTML = namesData[nconst].KnowForTitleNames;
        cell1.classList.add('cell1-text');
        cell2.classList.add('cell2-text');
    }
}

function showNameDetails(properties, coords, nconst, namesData) {
    // Check if the nconst exists in namesData and access the primaryName
    if (namesData[nconst]) {
        var sidePanel = document.getElementById('sidePanel');
        sidePanel.innerHTML = `
            <button class= "back-button" id="back-button">
                <span class="arrow"></span> Back
            </button>
            <p><a href="https://www.imdb.com/name/${nconst}/" target= "_blank" rel="noopener noreferrer">
                <img id="selectedImage" src="images/${nconst}/Image_1.jpg"/>
            </a></p>
            <table>
                <thead>
                    <tr>
                        <th class="th-text th-header" scope="col" style= "color:#F5F5F5; font-size:150%; background-color: #707070" colspan="2"><div style= "border: 2px solid #505050;margin: -5pt;">${namesData[nconst].primaryName}</div></th>
                    </tr>
                </thead>
                <tbody id="detailsTableBody">
                </tbody>
            </table>
        `;
        appendNameTable(nconst, namesData);

        // Add event listener to the "Back" button
        document.getElementById('back-button').addEventListener('click', function() {
            // Go back to the previous side panel state with film details
            updateSidePanel(properties, coords, namesData);
            document.getElementById( 'MoreInfoButton' ).style.display = 'none';
            showMoreDetails(properties, coords, namesData);
        });
    } else {
        console.error("Director details not found for nconst:", nconst);
    }
}
// Load the additional JSON file
$.getJSON("https://raw.githubusercontent.com/NCMSiegfried/SF-FILMS-DASHBOARD/refs/heads/main/map/data/Names.json", function(data) {
    namesData = data;
    console.log("Additional data loaded:", namesData);
}).fail(function(jqXHR, textStatus, errorThrown) {
    console.error('Error loading JSON: ' + textStatus, errorThrown);
});

// Load GeoJSON from github, pass data through functions
$.getJSON("https://raw.githubusercontent.com/NCMSiegfried/SF-FILMS-DASHBOARD/main/map/data/data.geojson", function(data) {
    geojsonData = data;
    // Load GeoJSON data into the map
    var geojsonLayer = L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, defaultMarkerOptions);
        },
        onEachFeature: function (feature, layer) {
            if (feature.properties) {
                markers[feature.properties.unique_id] = layer;
            }
            if (feature.properties.director1_name) {
                uniqueDirectors.add(feature.properties.director1_name);
            }
            if (feature.properties.director2_name) {
                uniqueDirectors.add(feature.properties.director2_name);
            }
            if (feature["properties"]["Production Company"]) {
                uniqueProdCompanies.add(feature["properties"]["Production Company"]);
            }
            if (feature.properties.Distributor) {
                uniqueDistributors.add(feature.properties.Distributor);
            }
            if (feature.properties.writer1_name) {
                uniqueWriters.add(feature.properties.writer1_name);
            }
            if (feature.properties.writer2_name) {
                uniqueWriters.add(feature.properties.writer2_name);
            }
            if (feature.properties.writer3_name) {
                uniqueWriters.add(feature.properties.writer3_name);
            }
            if (feature.properties.genres) {
                let genres = feature.properties.genres
                genres = genres.split(',')
                genres.forEach(function (item, index){
                uniqueGenres.add(item.trim())
                })
            }
            if (feature["properties"]["Actor 1"]) {
                uniqueStars.add(feature["properties"]["Actor 1"]);
            }
            if (feature["properties"]["Actor 2"]) {
                uniqueStars.add(feature["properties"]["Actor 2"]);
            }
            if (feature["properties"]["Actor 3"]) {
                uniqueStars.add(feature["properties"]["Actor 3"]);
            }
            // Attach click event listener to each feature (point)
            layer.on('click', function () {
                resetHighlight(); // Reset highlight of previously selected marker
                highlightedLayer = layer; // Set the currently clicked layer as highlighted
                layer.setStyle(highlightMarkerOptions);
                var coords = feature.geometry.coordinates;
                var properties = feature.properties;
                // Update the side panel when the point is clicked
                updateSidePanel(properties, coords, namesData);
            });
        }
    }).addTo(map);
    sidePanelHome();
}).fail(function() {
    console.error('Error loading GeoJSON file');
});


// Prevent map clicks when interacting with the side panel
document.getElementById('sidePanel').addEventListener('mouseover', function(event) {
    map.dragging.disable();  // Stops event from bubbling to the map
    map.doubleClickZoom.disable();
    map.touchZoom.disable();
});
// Enable map clicks again when mouse is outside of panel
document.getElementById('sidePanel').addEventListener('mouseout', function(event) {
    map.dragging.enable();  // Stops event from bubbling to the map
    map.doubleClickZoom.enable();
    map.touchZoom.enable();
//    map.scrollWheelZoom.enable() //FIX
});

