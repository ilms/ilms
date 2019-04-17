var validTypes = '1,2,3,4,13,14';
var slideIndex = 0;
var fileIndex = 0;
var downloadingPage = 1;
var downloading = false;
var jsonData = [];
var fallbackJson = JSON.parse('{"submission_id":0,"files":[]}');
var sid = "";
var userID = 0;
var rid = "";
function guestLogin() {
	var url = 'https://inkbunny.net/api_login.php?username=guest&callback=loginCallback';

	var oldScript = document.getElementById("login-json");
	oldScript.parentNode.removeChild(oldScript);
	
	var script = document.createElement('script');
	script.setAttribute("id", "login-json");
	script.src = url;
	document.getElementsByTagName('head')[0].appendChild(script);
}
function login() {
	var username = document.getElementById('login-username').value;
	var password = document.getElementById('login-password').value;
	var url = 'https://inkbunny.net/api_login.php?username='+username+'&password='+password+'&callback=loginCallback';

	var oldScript = document.getElementById("login-json");
	oldScript.parentNode.removeChild(oldScript);
	
	var script = document.createElement('script');
	script.setAttribute("id", "login-json");
	script.src = url;
	document.getElementsByTagName('head')[0].appendChild(script);
}
function loginCallback( data ) {
	var oldScript = document.getElementById("login-json");
	oldScript.parentNode.removeChild(oldScript);

	if ('error_code' in data) {
		document.getElementById('login-username').value = "";
		document.getElementById('login-password').value = "";
		return;
	}

	sid = data['sid'];
	userID = data['user_id'];

	console.log(data);

	var login = document.getElementById("login");
	login.style.display = "none";
	var search = document.getElementById("search");
	search.style.display = "block";
}
function searchFavorites() {
	downloading = true;
	downloadingPage = 1;
	jsonData = [];
	var url = 'https://inkbunny.net/api_search.php?sid='+sid+'&favs_user_id='+userID+'&get_rid=yes&callback=getSubmissionDetails';
	
	var oldScript = document.getElementById("search-json");
	oldScript.parentNode.removeChild(oldScript);
	
	var script = document.createElement('script');
	script.setAttribute("id", "search-json");
	script.src = url;
	document.getElementsByTagName('head')[0].appendChild(script);
}
function search() {
	downloading = true;
	var text = document.getElementById('search-text').value;
	downloadingPage = 1;
	jsonData = [];
	var url = 'https://inkbunny.net/api_search.php?sid='+sid+'&text='+text+'&get_rid=yes&callback=getSubmissionDetails';
	
	var oldScript = document.getElementById("search-json");
	oldScript.parentNode.removeChild(oldScript);
	
	var script = document.createElement('script');
	script.setAttribute("id", "search-json");
	script.src = url;
	document.getElementsByTagName('head')[0].appendChild(script);
}
function getSubmissionDetails( data ) {
	var submission_ids = getSubmissionIDs(data);
	rid = data['rid']
	var url = 'https://inkbunny.net/api_submissions.php?sid='+sid+'&submission_ids='+submission_ids+'&callback=searchFinish';

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
function getSubmissionIDs( data ) {
	var submission_ids = '';
	for (var i = 0; i < data['submissions'].length; i++)
	{
		if (i > 0)
		{
			submission_ids += ',';
		}
		submission_ids += data['submissions'][i]['submission_id'];
	}
	return submission_ids;
}
function downloadNextJson() {
	downloading = true;
	downloadingPage++;
	var url = 'https://inkbunny.net/api_search.php?sid=' + sid + '&page=' + downloadingPage + '&rid=' + rid + '&callback=getDownloadSubmissionDetails';
	
	var oldScript = document.getElementById("search-json");
	oldScript.parentNode.removeChild(oldScript);
	
	var script = document.createElement('script');
	script.setAttribute("id", "search-json");
	script.src = url;
	document.getElementsByTagName('head')[0].appendChild(script);
}
function getDownloadSubmissionDetails( data ) {
	var submission_ids = getSubmissionIDs(data);
	var url = 'https://inkbunny.net/api_submissions.php?sid='+sid+'&submission_ids='+submission_ids+'&callback=downloadFinish';

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
	while (j < data['submissions'].length) {
		if (true) { // Add manual blacklisting here
			jsonData[start + i] = {
				"submission_id": data['submissions'][j]['submission_id'],
				"files": []
			};
			for (var f = 0; f < data['submissions'][j]['files'].length; f++) {
				jsonData[start + i]['files'][f] = data['submissions'][j]['files'][f]['file_url_full'];
			}
			i++;
		}
		j++;
	}
}
function updateSlide() {
	console.log(''+slideIndex+':'+fileIndex);
	var crrentSlide = document.getElementById('current-image');
	//crrentSlide.removeAttribute("src");
	crrentSlide.classList.remove("loaded");
	crrentSlide.onload = function () {
        document.getElementById('current-image').classList.add('loaded');       
    };
	crrentSlide.setAttribute("src", getJson(slideIndex)['files'][fileIndex]);
	document.getElementById('source-button').setAttribute("href", 'https://inkbunny.net/s/' + getJson(slideIndex)['submission_id']);
	updateCache();
}
function nextSlide() {
	slideIndex += 1;
	fileIndex = 0;
	updateSlide();
}
function prevSlide() {
	slideIndex -= 1;
	fileIndex = 0;
	if (slideIndex < 0)
		slideIndex = 0;
	updateSlide();
}
function maxFileIndex(slideIndex) {
	return getJson(slideIndex)['files'].length - 1;
}
function nextFile() {
	fileIndex += 1;
	console.log(getJson(slideIndex));
	var max = maxFileIndex(slideIndex);
	if (fileIndex > max)
	{
		fileIndex = max;
	}
	updateSlide();
}
function prevFile() {
	fileIndex -= 1;
	if (fileIndex < 0)
	fileIndex = 0;
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
		var files = getJson(slideIndex + i + 1)['files'];
		for (var j = 0; j < files.length; j++)
		{
			var img = document.createElement('img');
			img.setAttribute("src", files[j]);
			cache.appendChild(img);
		}
	}
	for (var i = 0; i < 10; i++) {
		var files = getJson(slideIndex - i - 1)['files'];
		if (files != 0) {
			for (var j = 0; j < files.length; j++)
			{
				var img = document.createElement('img');
				img.setAttribute("src", files[j]);
				cache.appendChild(img);
			}
		}
	}
}
document.getElementById('login-button').addEventListener('click', function () {
    login();
});
document.getElementById('login-guest-button').addEventListener('click', function () {
    guestLogin();
});
document.getElementById('search-text').addEventListener("keyup", function(event) {
	//event.preventDefault();
	if (event.keyCode === 13) {
		document.getElementById('search-button').click();
	}
});
document.getElementById('search-button').addEventListener('click', function () {
    search();
});
document.getElementById('favorites-button').addEventListener('click', function () {
    searchFavorites();
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
document.getElementById('up-button').addEventListener('click', function () {
    prevFile();
});
document.getElementById('down-button').addEventListener('click', function () {
    nextFile();
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
