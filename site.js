// Constants
let USER_AGENT = "Ilm's e621/1.0";
let CACHE_PRELOAD_SIZE = 20;
let CACHE_POSTLOAD_SIZE = 10;
let PAGE_LIMIT = 50;
let VALID_EXTENSIONS = new Set(['png','jpg','gif']);

// Global Variables
var tags = "";
var slideIndex = 0;
var downloadingPage = 1;
var downloading = false;
var endOfDownload = false;
var jsonData = [];
var sets = {"Owned": [], "Maintained": []};
var fallbackJson = JSON.parse('{"id":0,"file":{"url":"loading.png"}}');

// Authorization / Login
function saveLogin() {
	var username = document.getElementById('username').value;
	var apiKey = document.getElementById('api-key').value;
	window.localStorage.setItem('username', username);
	window.localStorage.setItem('api_key', apiKey);
	// For future use
	var auth = btoa(username + ':' + apiKey);
	window.localStorage.setItem('authorization', auth);
}
function getAuth() {
	return window.localStorage.getItem('authorization');
}
function getAuthHeaders() {
	var auth = getAuth();
	return (auth !== null) ? {Authorization: 'Basic ' + auth} : {};
}
function getLoginParameters() {
	var username = window.localStorage.getItem('username');
	var apiKey = window.localStorage.getItem('api_key');
	if (username !== null && apiKey !== null) {
		return {login: username, api_key: apiKey};
	} else {
		return {};
	}
}

// Searching
function search() {
	endOfDownload = false;
	downloading = true;
	tags = document.getElementById('search-text').value;
	if (tags == "")
		return;
	downloadingPage = 1;
	jsonData = [];
	
	var url = 'https://e621.net/posts.json';
	var params = {
		tags: tags,
		page: downloadingPage,
		limit: PAGE_LIMIT,
	};
	
	makeRequest(url, params, searchFinish);
}
function searchFinish( data ) {
	parseJson(data['posts']);
	downloading = false;
	slideIndex = 0;
	updateSlide();
	closeMenu();
}
function downloadNextJson() {
	downloading = true;
	downloadingPage++;
	
	var url = 'https://e621.net/posts.json';
	var params = {
		tags: tags,
		page: downloadingPage,
		limit: PAGE_LIMIT,
	};
	
	makeRequest(url, params, downloadFinish);
}
function downloadFinish( data ) {
	parseJson(data['posts']);
	downloading = false;
	updateSlide();
}
function getJson(index) {
	if (index < 0) {
		return fallbackJson;
	}
	if (index < jsonData.length) {
		return jsonData[index];
	} else {
		if (!downloading)
			if (!endOfDownload)
				downloadNextJson();
		return fallbackJson;
	}
}
function parseJson(data) {
	var start = jsonData.length;
	if (data.length == 0)
	{
		endOfDownload = true;
		return;
	}
	var i = 0,
	    j = 0;
	while (j < data.length) {
		if (VALID_EXTENSIONS.has(data[j]['file']['ext'])) {
			jsonData[start + i] = data[j];
			i++;
		}
		j++;
	}
}

// Current Slide
function updateSlide() {
	var crrentSlide = document.getElementById('current-image');
	crrentSlide.removeAttribute("src");
	crrentSlide.classList.remove("loaded");
	crrentSlide.onload = function () {
        document.getElementById('current-image').classList.add('loaded');       
    };
	crrentSlide.setAttribute("src", getJson(slideIndex).file.url);
	document.getElementById('source-button').setAttribute("href", 'https://e621.net/post/show/' + getJson(slideIndex)['id']);
	document.getElementById('add-set-button').classList.remove('adding');
	document.getElementById('add-set-button').classList.remove('added');
	if (getJson(slideIndex)['id'] == 0) {
		document.getElementById('add-set-button').classList.add('hide');
	} else {
		document.getElementById('add-set-button').classList.remove('hide');
	}
	document.getElementById('add-set-button').innerHTML = '➕';
	updateCache();
}

// Slide Controls
function nextSlide() {
	slideIndex += 1;
	updateSlide();
}
function prevSlide() {
	slideIndex -= 1;
	if (slideIndex < 0)
		slideIndex = 0;
	updateSlide();
}

// Menu Toggle Controls
function openMenu() {
	var slides = document.getElementById("slide-wrapper");
	slides.style.display = "none";
	var menu = document.getElementById("menu");
	menu.style.display = "block";
}
function closeMenu() {
	var menu = document.getElementById("menu");
	menu.style.display = "none";
	var slides = document.getElementById("slide-wrapper");
	slides.style.display = "block";
	setTimeout(() => {
		var controls = document.getElementById("slide-controls");
		controls.classList.add('hide');
	}, 1500);
}

// Image cache
// This is used to pre-load upcoming and previous images
function updateCache() {
	var cache = document.getElementById("cache");
	while (cache.firstChild) {
		cache.removeChild(cache.firstChild);
	}
	for (var i = 0; i < CACHE_PRELOAD_SIZE; i++) {
		var img = document.createElement('img');
		img.setAttribute("src", getJson(slideIndex + i + 1).file.url);
		cache.appendChild(img);
	}
	for (var i = 0; i < CACHE_POSTLOAD_SIZE; i++) {
		var json = getJson(slideIndex - i - 1);
		if (json != 0) {
			var img = document.createElement('img');
			img.setAttribute("src", json.file.url);
			cache.appendChild(img);
		}
	}
}

// Sets
function fetchUserSets() {
	
}
function addPostToSet() {
	var setID = 22987; // TODO add option for this
	var url = 'https://e621.net/post_sets/' + setID + '/add_posts.json';
	
	var fd = {'post_ids[]': getJson(slideIndex)['id']};
	
	makePostRequest(url, {}, fd, setFinish);
	document.getElementById('add-set-button').classList.remove('added');
	document.getElementById('add-set-button').classList.add('adding');
	document.getElementById('add-set-button').innerHTML = '🔃';
}
function setFinish() {
	document.getElementById('add-set-button').classList.remove('adding');
	document.getElementById('add-set-button').classList.add('added');
	document.getElementById('add-set-button').innerHTML = '☑️';
}

// Event Binding
document.getElementById('search-text').addEventListener("keyup", function(event) {
	//event.preventDefault();
	if (event.keyCode === 13) {
		document.getElementById('search-button').click();
	}
});
document.getElementById('search-button').addEventListener('click', function () {
    search();
});
document.getElementById('view-button').addEventListener('click', function () {
    closeMenu();
});
document.getElementById('next-button').addEventListener('click', function () {
    nextSlide();
});
document.getElementById('prev-button').addEventListener('click', function () {
    prevSlide();
});
document.getElementById('menu-button').addEventListener('click', function () {
    openMenu();
});
document.getElementById('add-set-button').addEventListener('click', function () {
    addPostToSet();
});
document.getElementById('save-login-button').addEventListener('click', function () {
	var username = document.getElementById('username').value;
	var apiKey = document.getElementById('api-key').value;
    saveLogin(username, apiKey);
});

// Keybindings
var LEFT_ARROW_KEY_ID = 37;
var RIGHT_ARROW_KEY_ID = 39;
var A_KEY_ID = 65;
var D_KEY_ID = 68;
document.addEventListener('keydown', function (e) {
	var key = e.which || e.keyCode;
	
	if (!(
		key == LEFT_ARROW_KEY_ID ||
		key == RIGHT_ARROW_KEY_ID ||
		key == A_KEY_ID ||
		key == D_KEY_ID))
	{
		return;
	}
    
	if (document.activeElement !== document.getElementById('search-text')) {

		if (key == LEFT_ARROW_KEY_ID || key == A_KEY_ID)
			prevSlide();
		if (key == RIGHT_ARROW_KEY_ID || key == D_KEY_ID)
			nextSlide();
	}
});

// Requests / AJAX
function getClientParamters() {
	return {_client: USER_AGENT};
}
function toURLParams(baseParams) {
	var clientParams = getClientParamters();
	var authParams = getLoginParameters();
	console.log(baseParams);
	console.log(clientParams);
	console.log(authParams);
	var urlParams = new URLSearchParams({...baseParams, ...clientParams, ...authParams});
	return '?' + urlParams.toString();
}
function makeRequest(url, parameters, callback) {
	$.ajax({
		url: url + toURLParams(parameters),
		crossDomain: true,
		dataType: 'json',
		success: callback
	});
}
function makePostRequest(url, parameters, formData, callback) {
	$.ajax({
		method: 'POST',
		url: url + toURLParams(parameters),
		data: formData,
		crossDomain: true,
		dataType: 'json',
		success: callback
	});
}
