var host = "";
var tags = "";
var pageLimit = 100;
var slideIndex = 0;
var downloadingPage = 1;
var jsonData = JSON.parse('{}');
var fallbackJson = JSON.parse('{"id":546281,"tags":"2014 4_fingers anthro black_nose blue_eyes blue_fur canine computer cute dog doing_it_wrong english_text fur glue green_background green_fur hi_res humor husky image_macro lol_comments male mammal meme multicolored_fur nekohaiku nude playful profanity reaction_image screwdriver simple_background sitting smile solo table tailtippedfennec text tools watermark white_fur wire yellow_fur","locked_tags":null,"description":"A meme piece that i got of my sona from the tailtippedfennec","created_at":{"json_class":"Time","s":1413420945,"n":322813000},"creator_id":48206,"author":"nekohaiku","change":11694694,"source":"http://www.furaffinity.net/user/nekohaiku/","score":546,"fav_count":1293,"md5":"900e98af5b512ba1a5f8a1a9885c1ef1","file_size":190487,"file_url":"https://static1.e621.net/data/90/0e/900e98af5b512ba1a5f8a1a9885c1ef1.jpg","file_ext":"jpg","preview_url":"https://static1.e621.net/data/preview/90/0e/900e98af5b512ba1a5f8a1a9885c1ef1.jpg","preview_width":112,"preview_height":150,"sample_url":"https://static1.e621.net/data/sample/90/0e/900e98af5b512ba1a5f8a1a9885c1ef1.jpg","sample_width":600,"sample_height":800,"rating":"s","status":"active","width":960,"height":1280,"has_comments":true,"has_notes":false,"has_children":false,"children":"","parent_id":null,"artist":["tailtippedfennec"],"sources":["http://www.furaffinity.net/user/nekohaiku/","http://www.furaffinity.net/view/14623039/","https://d.facdn.net/art/nekohaiku/1411684352.nekohaiku_1410248255.nekohaiku_neko__1__by_playful_foxe-d7yh5oj.jpg"]}');
function search() {
	host = document.getElementById('host-text').value;
	tags = document.getElementById('search-text').value;
	downloadingPage = 1;
	jsonData = JSON.parse('{}');
	var url = 'https://' + host + '/post/index.json?tags=' + tags + '&page=' + downloadingPage + '&limit=' + pageLimit + '&callback=searchFinish';
	
	var oldScript = document.getElementById("search-json");
	oldScript.parentNode.removeChild(oldScript);
	
	var script = document.createElement('script');
	script.setAttribute("id", "search-json");
	script.src = url;
	document.getElementsByTagName('head')[0].appendChild(script);
}
function searchFinish( data ) {
	jsonData[downloadingPage] = data;
	slideIndex = 0;
	updateSlide();
	closeMenu();
}
function downloadJson(page) {
	downloadingPage = page;
	var url = 'https://' + host + '/post/index.json?tags=' + tags + '&page=' + downloadingPage + '&limit=' + pageLimit + '&callback=downloadFinish';
	
	var oldScript = document.getElementById("search-json");
	oldScript.parentNode.removeChild(oldScript);
	
	var script = document.createElement('script');
	script.setAttribute("id", "search-json");
	script.src = url;
	document.getElementsByTagName('head')[0].appendChild(script);
}
function downloadFinish( data ) {
	jsonData[downloadingPage] = data;
}
function getJson(index) {
	var post = index % pageLimit;
	var page = ((index - post) / pageLimit) + 1;
	if (jsonData.hasOwnProperty(page)) {
		return jsonData[page][post];
	} else {
		downloadJson(page);
		return fallbackJson;
	}
}
function updateSlide() {
	document.getElementById('current-image').setAttribute("src", getJson(slideIndex).file_url);
	document.getElementById('source-button').setAttribute("href", 'https://' + host + '/post/show/' + getJson(slideIndex)['id']);
	preload();
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
}
function preload() {
	for (var i = 0; i < 10; i++)
		document.getElementById('next-image-'+i).setAttribute("src", getJson(slideIndex + i + 1).file_url);
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
