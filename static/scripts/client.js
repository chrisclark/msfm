var msfm = {
	locationId: function() {
		if (!this.location_id){
			var uri = new jsUri(window.location);
			this.location_id = uri.path().substr(uri.path().lastIndexOf("/") + 1, uri.path().length);
		}
		return this.location_id;
	},
	location_id: null,
	playlist: null,
	
	doLogin: function(callbackFn) {
		FB.login(function(response){
			if(response.authResponse){
				fbid = response.authResponse.userID;
				fbat = response.authResponse.accessToken;
				$.ajax({
					type: "POST",
					url: "/login",
					data: "fbid="
						+ fbid
						+ '&location_id='
						+ msfm.locationId()
						+ '&fbat='
						+ fbat,
					success: callbackFn
				});
				
			} else {
				alert("Please log in"); 
			}
		});
	}
	
};

function spinnerStart() { $.mobile.showPageLoadingMsg(); }
function spinnerStop() { $.mobile.hidePageLoadingMsg(); }

loginComplete = function(loginResponse) {
	var l = 2;
	if (loginResponse) {
		$.mobile.changePage("#homePage");
	}
}

LoadHeaders = function() {
	var header = '<div style="text-align:center;"><a href="#homePage" data-transition="slide" data-direction="reverse"><img border=0 src="/static/images/logo.png" width="300px" alt="logo" style="padding-top: 5px;" /> </a><div>You\'re picking music for Mellow Mushroom</div></div>';
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
	$.getJSON("/playlist/" + msfm.locationId(), function(data) {
			msfm.playlist = data;
			var listing = [];
			$.each(data, function(index, playlistitem) {
				listing.push('<li class="playlistItemButton" data-id="'
				+ playlistitem.track_id
				+ '" data-playlist_item_id="'
				+ playlistitem.playlist_item_id
				+ '" data-score="'
				+ playlistitem.score
				+ '" data-playlist_index="'
				+ index
				+ '"><a href="javascript:void(0);">'
				+ '<span class="ui-li-count">'
				+ playlistitem.score
				+ '</span>'
				+ playlistitem.artist
				+ ' - '
				+ playlistitem.title
				+ ' ('
				+ playlistitem.album
				+')'
				+ '</a></li>');
			});
			listing = listing.join('');
			
			final_items = $(listing).detach().sort(function(a, b){
				return $(b).jqmData("score") - $(a).jqmData("score");
			});
			
			$('#venuePlaylist').empty().append(final_items).listview("refresh");
	});
}

$('#homePage').live('pageshow', bindPlaylist);

//binds each button element in the <li> search results to the track details page
$('.playlistItemButton').live('click', function() {
	var track_id = $(this).jqmData('id');
	var pli_id = $(this).jqmData('playlist_item_id');
	var playlist_index = $(this).jqmData('playlist_index');
	$('#playlistItemDetails').jqmData('id', track_id);
	$('#playlistItemDetails').jqmData('playlist_item_id', pli_id);
	$('#playlistItemDetails').jqmData('playlist_index', playlist_index);
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
		+ ' ('
		+ playlistitem.album
		+ ')'
		+ '</a></li>');
	});
	$('#searchListing').empty().append(listing.join('')).listview("refresh");
	spinnerStop();
}

$("#btnMarkPlayed").unbind('click.msfm');
$("#btnMarkPlayed").live('click.msfm', function() {
	pli_id = $(".playlistItemButton").first().jqmData("playlist_item_id");
	$.ajax({
		type: "POST",
		url: "/mark_played",
		data: "id=" + pli_id,
		success: function(data){
			spinnerStop();
			location.reload();
		}
	});
});

$("#btnAddTrack").unbind('click.msfm');
$("#btnAddTrack").live('click.msfm', function(){
	track_id = $('#addTrack').jqmData('id');
	FB.getLoginStatus(function(response) {
		if (response.status === 'connected') {
			msfm.doLogin(function(){
				doAddTrack(track_id);
			});
		} else {
			$('#lnkShowLoginDialog').click();
		}
	});
});

$("#lnkFBLogin").unbind('click.msfm');
$("#lnkFBLogin").live('click.msfm', function(){
	msfm.doLogin(function(){$('#pleaseLogin').dialog('close');})
});

doAddTrack = function(track_id){
	spinnerStart();
		$.ajax({
			type: "POST",
			url: "/add_track",
			data: "track_id="
				+ track_id
				+ '&location_id='
				+ msfm.locationId(),
			success: function(data){
				spinnerStop();
				$('#lnkAddTrackDialog').click();
			}
		});
}

$("#btnUpVote").unbind('click.msfm');
$("#btnUpVote").live('click.msfm', function(){ doVote(1); });

$("#btnDownVote").unbind('click.msfm');
$("#btnDownVote").live('click.msfm', function(){ doVote(0); });	

function doVote(dir) {
	spinnerStart();
	$.ajax({
		type: "POST",
		url: "/vote",
		data: "playlist_item_id="
			+ $('#playlistItemDetails').jqmData('playlist_item_id')
			+ '&direction='
			+ dir,
		success: function(data){
			spinnerStop();
			$('#lnkConfirmVote').click();
		}
	});
}

//sets up the track details page
$('#addTrack').live('pageshow', function(event){
	spinnerStart();
	$.getJSON("/track/" + $(this).jqmData('id'),
		function(data){
			buildTrackDetails(data, '#addTrackDetails');
			var player = $("#zen .player");
			player.jPlayer("setMedia", {mp3: data.url});
			spinnerStop();
		}
	);
});

$('#playlistItemDetails').live('pageshow', function(event){
	data = msfm.playlist[$(this).jqmData('playlist_index')]
	spinnerStart();
	selector = '#playlistItemDetailsTrackDetails'
	buildTrackDetails(data, selector);
	$(selector).append("<li style='padding-left: 75px;'>Picked by "
						+ data.first_name + " "	+ data.last_name.substr(0,1)
						+ ". <img style='margin-left: 15px; margin-top: .7em;' src='"
						+ data.photo_url + "'></li>");
	$(selector).listview("refresh");
	spinnerStop();
});

buildTrackDetails = function(track, selector){
	$(selector).empty();
	$(selector).append("<li>Artist: " + track.artist + '</li>');
	$(selector).append("<li>Title: " + track.title + '</li>');
	$(selector).append("<li>Album: " + track.album + "</li>");
	$(selector).append("<li>Length: " + track.length_friendly + "</li>");
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
	
	$(document).live('pagebeforechange', function(event, data) {
		spinnerStop();
	});
	
	bindPlaylist(msfm.locationId());
	
});