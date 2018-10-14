var tags = "";
var validExtensions = new Set(['png','jpg','gif']);
var pageLimit = 50;
var slideIndex = 0;
var downloadingPage = 1;
var downloading = false;
var jsonData = [];
var fallbackJson = JSON.parse('{"id":0,"file_url":"loading.png"}');
function search() {
	downloading = true;
	tags = document.getElementById('search-text').value;
	downloadingPage = 1;
	jsonData = [];
	var url = 'https://e621.net/post/index.json?tags=' + tags + '&page=' + downloadingPage + '&limit=' + pageLimit + '&callback=searchFinish';
	
	var oldScript = document.getElementById("search-json");
	oldScript.parentNode.removeChild(oldScript);
	
	var script = document.createElement('script');
	script.setAttribute("id", "search-json");
	script.src = url;
	document.getElementsByTagName('head')[0].appendChild(script);
}
function searchFinish( data ) {
	parseJson(data);
	downloading = false;
	slideIndex = 0;
	updateSlide();
	closeMenu();
}
function downloadNextJson() {
	downloading = true;
	downloadingPage++;
	var url = 'https://e621.net/post/index.json?tags=' + tags + '&page=' + downloadingPage + '&limit=' + pageLimit + '&callback=downloadFinish';
	
	var oldScript = document.getElementById("search-json");
	oldScript.parentNode.removeChild(oldScript);
	
	var script = document.createElement('script');
	script.setAttribute("id", "search-json");
	script.src = url;
	document.getElementsByTagName('head')[0].appendChild(script);
}
function downloadFinish( data ) {
	parseJson(data);
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
			downloadNextJson();
		return fallbackJson;
	}
}
function parseJson(data) {
	var start = jsonData.length;
	var i = 0,
	    j = 0;
	while (j < data.length) {
		if (validExtensions.has(data[j]['file_ext'])) {
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
	crrentSlide.setAttribute("src", getJson(slideIndex).file_url);
	document.getElementById('source-button').setAttribute("href", 'https://e621.net/post/show/' + getJson(slideIndex)['id']);
	updateCache();
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
		img.setAttribute("src", getJson(slideIndex + i + 1).file_url);
		cache.appendChild(img);
	}
	for (var i = 0; i < 10; i++) {
		var json = getJson(slideIndex - i - 1);
		if (json != 0) {
			var img = document.createElement('img');
			img.setAttribute("src", json.file_url);
			cache.appendChild(img);
		}
	}
}
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
