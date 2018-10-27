var tags = "";
var validExtensions = new Set(['png','jpg','gif']);
var pageLimit = 50;
var slideIndex = 0;
var downloadingPage = 1;
var downloading = false;
var currentWatchIDs = [];
var jsonData = [];
var fallbackJson = JSON.parse('{"id":0,"file_url":"loading.png"}');
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function search() {
	downloading = true;
	tags = document.getElementById('search-text').value;
	if (tags == "")
		return;
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
function downloadWatchJson(index) {
	var wTag = getCookie("watchTag"+index);
	var callback = "downloadWatchFinish" + index;
	var url = 'https://e621.net/post/index.json?tags=' + wTag + '&page=1&limit=320&callback=' + callback;
	var script = document.createElement('script');
	script.setAttribute("id", "watch-json-"+index);
	script.src = url;
	document.getElementsByTagName('head')[0].appendChild(script);
	window[callback] = function (data) {
		var wLast = getCookie("watchLast"+index);
		var wCurrent = getCookie("watchCurrent"+index);
		var i = 0,
			j = 0;
		while (j < data.length) {
			if (validExtensions.has(data[j]['file_ext'])) {
				if (i == 0)
					currentWatchIDs[index] = data[j]['id'];
				if (data[j]['id'] == wLast) {
					updateWatch(index, i)
					return;
				}
				i++;
			}
			j++;
		}
		updateWatch(index, "" + i + "+")
	};
}
function updateWatch(index, alertCount) {
	var watch = document.getElementById('watch-'+index);
	for (var i = 0; i < watch.childNodes.length; i++) {
		if (watch.childNodes[i].className == "watch-alert") {
			var wAlert = watch.childNodes[i];
			wAlert.innerHTML = alertCount;
			break;
		}
	}
}
function addNewWatch(){
	var wTag = document.getElementById('add-watch-text').value;
	if (wTag == "")
		return;
	var watchCount = parseInt(getCookie("watchCount"));
	setCookie("watchTag"+watchCount, wTag, 366);
	loadWatch(watchCount, getCookie("watchTag"+watchCount));
	downloadWatchJson(watchCount);
	watchCount += 1;
	setCookie("watchCount", watchCount, 366);
}
function loadWatch(index, wTag) {
	if (wTag == "")
		return;
	var watches = document.getElementById('watches');
	var watch = document.createElement('div');
	watch.classList.add('watch');
	watch.setAttribute("id", "watch-"+index);
	var wAlert = document.createElement('div');
	wAlert.classList.add('watch-alert');
	wAlert.innerHTML = "-";
	watch.appendChild(wAlert);
	var wRemove = document.createElement('button');
	wRemove.classList.add('watch-remove');
	wRemove.innerHTML = "X";
	wRemove.addEventListener('click', function () {
		watchRemove(index);
	});
	watch.appendChild(wRemove);
	var wSearch = document.createElement('button');
	wSearch.classList.add('watch-go');
	wSearch.innerHTML = "Search";
	wSearch.addEventListener('click', function () {
		watchSearch(index);
	});
	watch.appendChild(wSearch);
	var wText = document.createElement('div');
	wText.classList.add('watch-text');
	wText.innerHTML = wTag;
	watch.appendChild(wText);
	watches.appendChild(watch);
}
function loadAllWatches() {
	console.log(getCookie("watchCount"));
	var watchCount = parseInt(getCookie("watchCount"));
	if (watchCount === null || watchCount === "") {
		setCookie("watchCount", 0, 366);
		return;
	}
	for (var i = 0; i < watchCount; i++) {
		var wTag = getCookie("watchTag"+i);
		if (wTag == "")
			continue;
		loadWatch(i, wTag);
		downloadWatchJson(i);
	}
}
function watchSearch(index) {
	setCookie("watchLast"+index, currentWatchIDs[index], 366);
	document.getElementById('search-text').value = getCookie("watchTag"+index);
	search();
	updateWatch(index, 0);
}
function watchRemove(index) {
	var watch = document.getElementById('watch-'+index);
	watch.parentNode.removeChild(watch);
	setCookie("watchLast"+index, "", 0);
	setCookie("watchTag"+index, "", 0);
}
function resetWatches() {
	var watchCount = parseInt(getCookie("watchCount"));
	setCookie("watchCount", 0, 366);
	var watches = document.getElementById('watches');
	while (watches.firstChild) {
		watches.removeChild(watches.firstChild);
	}
	for (var i = 0; i < watchCount; i++) {
		setCookie("watchLast"+i, "", 0);
		setCookie("watchTag"+i, "", 0);
		var watch = document.getElementById('watch-json-'+i);
		watch.parentNode.removeChild(watch);
	}
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
document.getElementById('add-watch-button').addEventListener('click', function () {
    addNewWatch();
});
document.getElementById('reset-watch-button').addEventListener('click', function () {
    resetWatches();
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

// -----------

loadAllWatches();
