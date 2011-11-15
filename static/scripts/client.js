var msfm = {
	locationId: function() {
		if (!this.location_id){
			var uri = new jsUri(window.location);
			this.location_id = uri.path().replace("/", "");
		}
		return this.location_id;
	},
	location_id: null,
	
};

checkAuth = function() {
	FB.getLoginStatus(FBAuthChange);
}

function spinnerStart() { $.mobile.pageLoading(); }
function spinnerStop() { $.mobile.pageLoading(true); }

loginComplete = function(loginResponse) {
	var l = 2;
	if (loginResponse) {
		$.mobile.changePage("#homePage");
	}
}

FBAuthChange = function(response) {
	if (response.status == 'connected') { 
		fbid = $("#fbid").val(response.authResponse.userID);
		$.ajax({
			type: "POST",
			url: "/login",
			data: "fbid="
				+ fbid
				+ '&location_id='
				+ msfm.locationId()
				+ '&fbat='
				+ response.authResponse.accessToken,
			success: loginComplete
		});
	} else {
		$.mobile.changePage("#login");
	}
}

LoadHeaders = function() {
	var header = '<div style="text-align:center;"><a href="#homePage"><img border=0 src="/static/images/logo.png" width="300px" alt="logo" style="padding-top: 5px;" /> </a><div>You\'re picking music for XYZ</div></div>';
	$(".header").html(header)
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
	$.getJSON("/playlist/" + msfm.locationId(), function(data) {
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
			+ $('#addTrack').jqmData('id')
			+ '&location_id='
			+ msfm.locationId(),
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
	LoadHeaders();
	$("#btnSubmitSearch").unbind('click.msfm');
	$("#btnSubmitSearch").bind('click.msfm', trackSearch);
	bindPlaylist(msfm.locationId());
});