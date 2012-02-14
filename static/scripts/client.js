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
	votedKeyName: "msfm.votedArr",
	renderDialog: function(title, msg, btnText){
		$("#diagTitle", '#diagNotification').html(title);
		$("#diagText", '#diagNotification').html(msg);
		$("#diagConfirm span", '#diagNotification').first().html(btnText);
		spinnerStop();
		$.mobile.changePage('#diagNotification', {transition: 'pop', reverse: false, changeHash: false});
	},
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
	if($.mobile.activePage[0].id == "homePage"){ //then bind and start auto-refreshing
		$.getJSON("/playlist/" + msfm.locationId(), function(data) {
				msfm.playlist = data;
				var listing = [];
				
				var cur_list = new Array();
				$.each($(".playlistItemButton"), function(index, pli){
					cur_list[$(pli).jqmData("playlist_item_id")] = $(pli).jqmData("score");				
				});
				
				var playing_icon = "";
				var playing_class = "";
				var changed_class = "";
				
				$.each(data, function(index, playlistitem) {
									
					if(playlistitem.currently_playing==1){
						 playing_icon = "<img src='/static/images/sound_icon.png' class='ui-li-icon' />";
						 playing_class = " playing";
					} else {
						playing_icon = "";
						playing_class = "";
					}
					
					var old_pli_score = cur_list[playlistitem.playlist_item_id];
					if(typeof old_pli_score != 'undefined'){
						if(old_pli_score != playlistitem.score){ changed_class = " changed"; } //score changed
					} else { changed_class = " changed"; } //it's a new track
					listing.push(
					'<li class="playlistItemButton'
					+ changed_class
					+ playing_class
					+ '" data-id="'
					+ playlistitem.id
					+ '" data-playlist_item_id="'
					+ playlistitem.playlist_item_id
					+ '" data-score="'
					+ playlistitem.score
					+ '" data-currently_playing="'
					+ playlistitem.currently_playing
					+ '" data-time_sort="'
					+ playlistitem.time_sort
					+ '" data-playlist_index="'
					+ index
					+ '">'
					+ playing_icon
					+ '<a href="javascript:void(0);">'
					+ '<span class="ui-li-count">'
					+ playlistitem.score
					+ '</span>'
					+ playlistitem.artist
					+ ' - '
					+ playlistitem.title
					+ ' ('
					+ playlistitem.album
					+ ')'
					+ '</a></li>');	
				});
				var listing = listing.join('');
				
				final_items = $(listing).detach().sort(function(a, b){
					if( $(a).jqmData("currently_playing") == 1 ){
						return -1;
					} else if($(b).jqmData("currently_playing") == 1){
						return 1;
					} else {
						var ascore = $(a).jqmData("score");
						var bscore = $(b).jqmData("score");
						if(ascore == bscore) {
							return $(a).jqmData("time_sort") - $(b).jqmData("time_sort");
						}
						return bscore - ascore;
					}
				});
				
				$('#venuePlaylist').empty().append(final_items).listview("refresh");
				
				$(".changed").effect("highlight", {color: "#EFBB63"}, 2000);
				$(".playing a").css("color", "green");
				$(".playing a").css("padding-left", "32px");
				window.setTimeout("bindPlaylist();", 3000);
		});
	}
}

$('#homePage').live('pageshow', function(){
	bindPlaylist();
	//always hide this stuff and let the vote page show things appropriately
	$("#alreadyVoted").hide();
	$("#btnUpVote").parent('.ui-btn').hide();
	$("#btnDownVote").parent('.ui-btn').hide();
});

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
		+ playlistitem.id
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

$("#btnAddTrack").unbind('click.msfm');
$("#btnAddTrack").live('click.msfm', function(){
	var track_id = $('#addTrack').jqmData('id');
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
		complete: function(xhr){
			if(xhr.status != 200){
				msfm.renderDialog("Whoops!", jQuery.parseJSON(xhr.responseText).msg, "Home");
			}
		},
		success: function(data, textStatus, xhr){
			msfm.renderDialog("Sweet!","Added your track", "OK!");
		}
	});
}

$("#btnUpVote").unbind('click.msfm');
$("#btnUpVote").live('click.msfm', function(){ doVote(1); });

$("#btnDownVote").unbind('click.msfm');
$("#btnDownVote").live('click.msfm', function(){ doVote(0); });	

function doVote(dir) {
	spinnerStart();
	var id = $('#playlistItemDetails').jqmData('playlist_item_id');
	$.ajax({
		type: "POST",
		url: "/vote",
		data: "playlist_item_id="
			+ id
			+ '&direction='
			+ dir,
		success: function(data){
			msfm.renderDialog("Voted!", "Thanks for the input!", "Ok!");
			voted = JSON.parse(localStorage.getItem(msfm.votedKeyName));
			if (! voted){ voted = []; }
			voted.push(id);
			localStorage.setItem(msfm.votedKeyName, JSON.stringify(voted));
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
	spinnerStart();
	
	var arr = JSON.parse(localStorage.getItem(msfm.votedKeyName));
	var noVote = -1;
	if(arr){ noVote = arr.indexOf($(this).jqmData('playlist_item_id')); }
	
	var data = msfm.playlist[$(this).jqmData('playlist_index')]
	var selector = '#playlistItemDetailsTrackDetails'
	
	buildTrackDetails(data, selector);
	
	$(selector).append("<li style='padding-left: 75px;'>Picked by "
						+ data.first_name + " "	+ data.last_name.substr(0,1)
						+ ". <img style='margin-left: 15px; margin-top: .7em;' src='"
						+ data.photo_url + "'></li>");
	$(selector).listview("refresh");
	
	if(noVote>=0){
		$("#alreadyVoted").show();
	} else {
		$("#btnUpVote").parents('.ui-btn').show();
		$("#btnDownVote").parents('.ui-btn').show();
	}
	
	spinnerStop();
});

buildTrackDetails = function(track, selector){
	$(selector).empty();
	$(selector).append("<li>Artist: " + track.artist + '</li>');
	$(selector).append("<li>Song Title: " + track.title + '</li>');
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
	
});