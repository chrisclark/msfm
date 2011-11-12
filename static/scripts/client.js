function showLogin(){ $("#FBLogout").hide(); $("#FBLogin").show(); }  
function showLogout() { $("#FBLogout").show(); $("#FBLogin").hide(); }  
function spinnerStart() { $.mobile.pageLoading(); }
function spinnerStop() { $.mobile.pageLoading(true); }

FBAuthChange = function(response) {
	if (response.status == 'connected') { 
		showLogout();
		fbid = $("#fbid").val(response.authResponse.userID);
		$.ajax({
			type: "POST",
			url: "/login",
			data: "fbid="
				+ fbid
				+ '&location_id='
				+ location_id
		});
	} else {
		showLogin();
	}
}

trackSearch = function() {
	spinnerStart();
	$.getJSON("/search/" + $("#trackSearch").val(), function(data) {
		bindTrackSearchResults(data);
		spinnerStop(true);
	});
}

bindPlaylist = function (event) {
	spinnerStart()
	$.getJSON("/playlist/" + location_id, function(data) {
			var listing = [];
			$.each(data, function(index, playlistitem) {
				listing.push('<li class="playlistItemButton" data-id="'
				+ playlistitem.track_id
				+ '"><a href="javascript:void(0);">'
				+ '<span class="ui-li-count">'
				+ playlistitem.score
				+ '</span>'
				+ playlistitem.artist
				+ ' - '
				+ playlistitem.title
				+ '</a></li>');
			});
			$('#venuePlaylist').empty().append(listing.join('')).listview("refresh");
			spinnerStop();
	});
}

$('#homePage').live('pageshow', bindPlaylist);

//binds each button element in the <li> search results to the track details page
$('.playlistItemButton').live('click', function() {
	var track_id = $(this).jqmData('id');
	$('#playlistItemDetails').jqmData('id', track_id);
	$.mobile.changePage('#playlistItemDetails');
});

function bindTrackSearchResults(tracklist){
	spinnerStart();
	var listing = [];
	$.each(tracklist, function(index, playlistitem) {
		listing.push('<li class="trackButton" data-id="'
		+ playlistitem.track_id
		+ '"><a href="javascript:void(0);">'
		+ playlistitem.artist
		+ ' - '
		+ playlistitem.title
		+ '</a></li>');
	});
	$('#searchListing').empty().append(listing.join('')).listview("refresh");
	spinnerStop();
}

$("#btnAddTrack").unbind('click.msfm');
$("#btnAddTrack").live('click.msfm', function(){
	spinnerStart();
	$.ajax({
		type: "POST",
		url: "/add_track",
		data: "track_id="
			+ track_id
			+ '&location_id='
			+ location_id,
		success: function(data){
			spinnerStop();
			$('#lnkAddTrackDialog').click();
		}
	});
});

//sets up the track details page
$('#addTrack').live('pageshow', function(event){
	$.getJSON("/track/" + $(this).jqmData('id'),
		function(data){
			spinnerStart();
			buildTrackDetails(data, '#addTrackDetails');
			var player = $("#zen .player");
			player.jPlayer("setMedia", {mp3: data.url});
			spinnerStop();
		}
	);
});

$('#playlistItemDetails').live('pageshow', function(event){
	$.getJSON("/track/" + $(this).jqmData('id'), function(data){
		spinnerStart();
		buildTrackDetails(data, '#playlistItemDetailsTrackDetails');
		spinnerStop();
	});
});

buildTrackDetails = function(track, selector){
	$(selector).empty();
	$(selector).append("<li>Artist: " + track.artist + '</li>');
	$(selector).append("<li>Title: " + track.title + '</li>');
	$(selector).append("<li>Length: " + track.length_seconds + " seconds </li>");
	$(selector).listview("refresh");
}

//binds each button element in the <li> search results to the track details page
$('.trackButton').live('click', function() {
	var track_id = $(this).jqmData('id');
	$('#addTrack').jqmData('id', track_id);
	$.mobile.changePage('#addTrack');
});

$(document).ready(function() {
	$("#btnSubmitSearch").unbind('click.msfm');
	$("#btnSubmitSearch").bind('click.msfm', trackSearch);
	bindPlaylist(location_id);
});