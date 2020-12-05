var tags = "";
var validExtensions = new Set(['png','jpg','gif']);
var pageLimit = 50;
var slideIndex = 0;
var downloadingPage = 1;
var downloading = false;
var endOfDownload = false;
var jsonData = [];
var fallbackJson = JSON.parse('{"id":0,"file":{"url":"loading.png"}}');
function getLoginExtension() {
	var username = window.localStorage.getItem('username');
	var apiKey = window.localStorage.getItem('api_key');
	console.log('reading');
	console.log(username);
	console.log(apiKey);
	if (username !== null && apiKey !== null) {
		return '&login=' + username + '&api_key=' + apiKey;
	} else {
		return '';
	}
}
function saveLogin(username, apiKey) {
	window.localStorage.setItem('username', username);
	window.localStorage.setItem('api_key', apiKey);
	console.log('writing');
	console.log(username);
	console.log(apiKey);
}
function search() {
	endOfDownload = false;
	downloading = true;
	tags = document.getElementById('search-text').value;
	if (tags == "")
		return;
	downloadingPage = 1;
	jsonData = [];
	var url = 'https://e621.net/posts.json?tags=' + tags + '&page=' + downloadingPage + '&limit=' + pageLimit + '&_client=Ilm%27s%20e621%2F1.0' + getLoginExtension();
	
	makeRequest(url, searchFinish);
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
	var url = 'https://e621.net/posts.json?tags=' + tags + '&page=' + downloadingPage + '&limit=' + pageLimit + '&_client=Ilm%27s%20e621%2F1.0' + getLoginExtension();
	
	makeRequest(url, downloadFinish);
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
		if (validExtensions.has(data[j]['file']['ext'])) {
			jsonData[start + i] = data[j];
			i++;
		}
		j++;
	}
}
function updateSlide() {
	var crrentSlide = document.getElementById('current-image');
	//crrentSlide.removeAttribute("src");
	crrentSlide.classList.remove("loaded");
	crrentSlide.onload = function () {
        document.getElementById('current-image').classList.add('loaded');       
    };
	crrentSlide.setAttribute("src", getJson(slideIndex).file.url);
	document.getElementById('source-button').setAttribute("href", 'https://e621.net/post/show/' + getJson(slideIndex)['id']);
	document.getElementById('add-set-button').classList.remove('adding');
	if (getJson(slideIndex)['id'] == 0) {
		document.getElementById('add-set-button').classList.add('hide');
	} else {
		document.getElementById('add-set-button').classList.remove('hide');
	}
	document.getElementById('add-set-button').innerHTML = '➕';
	updateCache();
}
function addPostToSet() {
	var setID = 22987; // TODO add option for this
	var url = 'https://e621.net/post_sets/' + setID + '/add_posts.json?_client=Ilm%27s%20e621%2F1.0' + getLoginExtension();
	
	//var fd = new FormData();
	//fd.append( 'post_ids[]', getJson(slideIndex)['id'] );
	var fd = {'post_ids[]': getJson(slideIndex)['id']}
	
	makePostRequest(url, setFinish, fd);
	document.getElementById('add-set-button').classList.add('adding');
	document.getElementById('add-set-button').innerHTML = '🔃';
}
function setFinish() {
	document.getElementById('add-set-button').classList.remove('adding');
	document.getElementById('add-set-button').classList.add('added');
	document.getElementById('add-set-button').innerHTML = '☑️';
}
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
function updateCache() {
	var cache = document.getElementById("cache");
	while (cache.firstChild) {
		cache.removeChild(cache.firstChild);
	}
	for (var i = 0; i < 20; i++) {
		var img = document.createElement('img');
		img.setAttribute("src", getJson(slideIndex + i + 1).file.url);
		cache.appendChild(img);
	}
	for (var i = 0; i < 10; i++) {
		var json = getJson(slideIndex - i - 1);
		if (json != 0) {
			var img = document.createElement('img');
			img.setAttribute("src", json.file.url);
			cache.appendChild(img);
		}
	}
}
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
function makeRequest(url, callback) {
	$.ajax({
		url: url,
		crossDomain: true,
		dataType: 'json',
		success: callback
	});
}
function makePostRequest(url, callback, formData) {
	$.ajax({
		method: 'POST',
		url: url,
		data: formData,
		crossDomain: true,
		dataType: 'json',
		success: callback
	});
}

// -----------

