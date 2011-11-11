function showLogin(){ $("#FBLogout").hide(); $("#FBLogin").show(); }  
   	   
function showLogout() { $("#FBLogout").show(); $("#FBLogin").hide(); }  

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
	$.getJSON("/search/" + $("#trackSearch").val(), function(data) {
		bindTrackSearchResults(data);
	});
}

loadPlaylist = function (event) {
	$.getJSON("/playlist/" + location_id, function(data) {
			var listing = [];
			$.each(data, function(index, playlistitem) {
				listing.push('<li class="trackButton" data-show-add-button="False" data-id="'
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
	});
}

function bindTrackSearchResults(tracklist){
	var listing = [];
	$.each(tracklist, function(index, playlistitem) {
		listing.push('<li class="trackButton" data-show-add-button="True" data-id="'
		+ playlistitem.track_id
		+ '"><a href="javascript:void(0);">'
		+ playlistitem.artist
		+ ' - '
		+ playlistitem.title
		+ '</a></li>');
	});
	$('#searchListing').empty().append(listing.join('')).listview("refresh");
}

$('#homePage').live('pageshow', loadPlaylist);

//sets up the track details page
$('#trackDetail').live('pageshow', function(event){
	track_id = $(this).jqmData('id');
	
	//retrieve track details and then build the UI
	$.getJSON("/track/" + track_id, buildTrackDetails);
	
	if($(this).jqmData('show_add_button')) {
		$("#divAddTrack").show();
		$("#btnAddTrack").unbind('click.msfm');
		$("#btnAddTrack").bind('click.msfm', function(){
			$.ajax({
				type: "POST",
				url: "/add_track",
				data: "track_id="
					+ track_id
					+ '&location_id='
					+ location_id,
				success: function(data){ $('#lnkAddTrackDialog').click();}
			});
		});	
	}
	
});

buildTrackDetails = function(track){
	$("#trackDetails").empty();
	$("#trackDetails").append("<li>Artist: " + track.artist + '</li>');
	$("#trackDetails").append("<li>Title: " + track.title + '</li>');
	$("#trackDetails").append("<li>Length: " + track.length_seconds + " seconds </li>");
	$("#trackDetails").listview("refresh");
	
	var player = $("#zen .player");
	player.jPlayer("setMedia", {mp3: track.url});
}

//binds each button element in the <li> search results to the track details page
$('.trackButton').live('click', function() {
	var track_id = $(this).jqmData('id');
	$('#trackDetail').jqmData('id', track_id);
	
	var show_add_button = $(this).jqmData('show-add-button');
	$('#trackDetail').jqmData('show_add_button', show_add_button);
	
	$.mobile.changePage('#trackDetail');
});

$(document).ready(function() {
	$("#btnSubmitSearch").click(trackSearch);
	loadPlaylist(location_id);
});