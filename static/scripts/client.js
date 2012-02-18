var msfm = {
	spinnerStart: function () {
		"use strict";
		$.mobile.showPageLoadingMsg();
	},
	spinnerStop: function () {
		"use strict";
		$.mobile.hidePageLoadingMsg();
	},
	locationId: function () {
		"use strict";
		if (!this.location_id) {
			var uri = new jsUri(window.location);
			this.location_id = uri.path().substr(uri.path().lastIndexOf("/") + 1, uri.path().length);
		}
		return this.location_id;
	},
	location_id: null,
	playlist: null,
	votedKeyName: "msfm.votedArr",
	renderDialog: function (title, msg, btnText) {
		"use strict";
		$("#diagTitle", '#diagNotification').html(title);
		$("#diagText", '#diagNotification').html(msg);
		$("#diagConfirm span", '#diagNotification').first().html(btnText);
		msfm.spinnerStop();
		$.mobile.changePage('#diagNotification', {transition: 'pop', reverse: false, changeHash: false});
	},
	trackSearch: function () {
		"use strict";
		var query = $("#trackSearch").val();
		if (query.length > 0) {
			msfm.spinnerStart();
			$.getJSON("/search/" + query, function (data) {
				bindTrackSearchResults(data);
				msfm.spinnerStop();
			});
		}
	},
	buildTrackDetails: function (track, selector) {
		"use strict";
		$(selector).empty();
		$(selector).append("<li>Artist: " + track.artist + '</li>');
		$(selector).append("<li>Song Title: " + track.title + '</li>');
		$(selector).append("<li>Album: " + track.album + "</li>");
		$(selector).append("<li>Length: " + track.length_friendly + "</li>");
		$(selector).listview("refresh");
	},
	isAdmin: null,
	doLogin: function (callbackFn) {
		"use strict";
		FB.login(function (response) {
			if(response.authResponse) {
				var fbid = response.authResponse.userID;
				var fbat = response.authResponse.accessToken;
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



loginComplete = function (loginResponse) {
	if (loginResponse) {
		$.mobile.changePage("#homePage");
	}
}

LoadHeaders = function () {
	var header = '<div style="text-align:center;"><a href="#homePage" data-transition="slide" data-direction="reverse"><img border=0 src="/static/images/logo.png" width="300px" alt="logo" style="padding-top: 10px; padding-bottom: 3px;" /> </a><div>You\'re the DJ for Mellow Mushroom</div></div>';
	$(".header").html(header);
}

bindPlaylist = function (event) {
	if($.mobile.activePage[0].id == "homePage") { //then bind and start auto-refreshing
		$.getJSON("/playlist/" + msfm.locationId(), function (data) {
				msfm.playlist = data;
				var listing = [];
				
				var cur_list = new Array();
				$.each($(".playlistItemButton"), function (index, pli) {
					cur_list[$(pli).jqmData("playlist_item_id")] = $(pli).jqmData("score");				
				});
				
				var playing_icon = "";
				var playing_class = "";
				var changed_class = "";
				var admin_info = "";
				
				$.each(data, function (index, playlistitem) {
									
					if(playlistitem.currently_playing==1) {
						 playing_icon = "<img width='16px' src='/static/images/sound_icon.png' class='ui-li-icon' />";
						 playing_class = " playing";
					} else {
						playing_icon = "";
						playing_class = "";
					}
					
					if(msfm.isAdmin) {
						admin_info = '(' + playlistitem.playlist_item_id + ') ';
					} else {
						admin_info = '';
					}
					
					var old_pli_score = cur_list[playlistitem.playlist_item_id];
					if(typeof old_pli_score != 'undefined') {
						if(old_pli_score != playlistitem.score) { changed_class = " changed"; } //score changed
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
					+ '<a style="padding: .7em 15px 0 15px;" href="javascript:void(0);">'
					+ '<span class="ui-li-count">'
					+ playlistitem.score
					+ '</span><p><strong>'
					+ playlistitem.artist
					+ '</strong></p><p>'
					+ admin_info
					+ playlistitem.title
					+ '</p></a></li>');	
				});
				var listing = listing.join('');
				
				final_items = $(listing).detach().sort(function (a, b) {
					if( $(a).jqmData("currently_playing") == 1 ) {
						return -1;
					} else if($(b).jqmData("currently_playing") == 1) {
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
				$(".playing a").css("color", "green").css("padding", ".7em 32px 0");
				window.setTimeout("bindPlaylist();", 3000);
		});
	}
}

$('#homePage').live('pageshow', function () {
	bindPlaylist();
});

//binds each button element in the <li> search results to the track details page
$('.playlistItemButton').live('click', function () {
	var track_id = $(this).jqmData('id');
	var pli_id = $(this).jqmData('playlist_item_id');
	var playlist_index = $(this).jqmData('playlist_index');
	
	var arr = JSON.parse(localStorage.getItem(msfm.votedKeyName));
	var noVote = -1;
	if(arr) {
		noVote = arr.indexOf(pli_id);
	}
	if(noVote>=0) {
		$("#alreadyVoted").show();
		$("#voteBtns").hide();
	} else {
		$("#alreadyVoted").hide();
		$("#voteBtns").show();
	}
	
	$('#playlistItemDetails').jqmData('id', track_id);
	$('#playlistItemDetails').jqmData('playlist_item_id', pli_id);
	$('#playlistItemDetails').jqmData('playlist_index', playlist_index);
	$.mobile.changePage('#playlistItemDetails');
});

function bindTrackSearchResults(tracklist) {
	var listing = [];
	$.each(tracklist, function (index, playlistitem) {
		listing.push('<li class="trackButton" data-id="'
		+ playlistitem.id
		+ '"><a href="javascript:void(0);" style="padding: .7em 15px 0 15px;""><p><strong>'
		+ playlistitem.artist
		+ '</strong></p><p>'
		+ playlistitem.title
		+ '</p></a></li>');
	});
	$('#searchListing').empty().append(listing.join('')).listview("refresh");
}

$("#btnAddTrack").unbind('click.msfm');
$("#btnAddTrack").live('click.msfm', function () {
	var track_id = $('#addTrack').jqmData('id');
	FB.getLoginStatus(function (response) {
		if (response.status === 'connected') {
			msfm.doLogin(function () {
				doAddTrack(track_id);
			});
		} else {
			$('#lnkShowLoginDialog').click();
		}
	});
});

$("#lnkFBLogin").unbind('click.msfm');
$("#lnkFBLogin").live('click.msfm', function () {
	msfm.doLogin(function () {
		$('#pleaseLogin').dialog('close');
		doAddTrack($('#addTrack').jqmData('id'));
	})
});

doAddTrack = function (track_id) {
	$.ajax({
		type: "POST",
		url: "/add_track",
		data: "track_id="
			+ track_id
			+ '&location_id='
			+ msfm.locationId(),
		complete: function (xhr) {
			if(xhr.status != 200) {
				msfm.renderDialog("Whoops!", jQuery.parseJSON(xhr.responseText).msg, "Home");
			}
		},
		success: function (data, textStatus, xhr) {
			msfm.renderDialog("Sweet!","Added your track", "OK!");
		}
	});
}

$("#btnUpVote").unbind('click.msfm');
$("#btnUpVote").live('click.msfm', function () { doVote(1); });

$("#btnDownVote").unbind('click.msfm');
$("#btnDownVote").live('click.msfm', function () { doVote(0); });	

function doVote(dir) {
	msfm.spinnerStart();
	var id = $('#playlistItemDetails').jqmData('playlist_item_id');
	$.ajax({
		type: "POST",
		url: "/vote",
		data: "playlist_item_id="
			+ id
			+ '&direction='
			+ dir,
		success: function (data) {
			msfm.renderDialog("Voted!", "Thanks for the input!", "Ok!");
			voted = JSON.parse(localStorage.getItem(msfm.votedKeyName));
			if (! voted) { voted = []; }
			voted.push(id);
			localStorage.setItem(msfm.votedKeyName, JSON.stringify(voted));
		}
	});
}

//sets up the track details page
$('#addTrack').live('pageshow', function (event) {
	$.getJSON("/track/" + $(this).jqmData('id'),
		function (data) {
			msfm.buildTrackDetails(data, '#addTrackDetails');
		}
	);
});

$('#playlistItemDetails').live('pageshow', function (event) {
	
	var data = msfm.playlist[$(this).jqmData('playlist_index')]
	var selector = '#playlistItemDetailsTrackDetails'
	
	msfm.buildTrackDetails(data, selector);
	
	$(selector).append("<li style='padding-left: 75px;'>Picked by "
						+ data.first_name + " "	+ data.last_name.substr(0,1)
						+ ". <img style='margin-left: 15px; margin-top: .7em;' src='"
						+ data.photo_url + "'></li>");
	$(selector).listview("refresh");	
});

//binds each button element in the <li> search results to the track details page
$('.trackButton').live('click', function () {
	var track_id = $(this).jqmData('id');
	$('#addTrack').jqmData('id', track_id);
	$.mobile.changePage('#addTrack');
});

$(document).ready(function () {
	LoadHeaders();
	
	$.mobile.loadingMessage = "Workin' hard!"
	
	$("#btnSubmitSearch").unbind('click.msfm');
	$("#btnSubmitSearch").bind('click.msfm', msfm.trackSearch);
	
	$(document).live('pagebeforechange', function (event, data) {
		msfm.spinnerStop();
	});
	
});