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
	doAddTrack: function (track_id) {
		"use strict";
		$.ajax({
			type: "POST",
			url: "/add_track",
			data: "track_id=" + track_id + '&location_id=' + msfm.locationId(),
			complete: function (xhr) {
				if (xhr.status != 200) {
					msfm.renderDialog("Whoops!", jQuery.parseJSON(xhr.responseText).msg, "Home");
				}
			},
			success: function (data, textStatus, xhr) {
				msfm.renderDialog("Sweet!", "Added your track", "OK!");
			}
		});
	},
	buildTrackDetails: function (track, selector) {
		"use strict";
		$(selector).empty();
		$(selector).append("<li>Artist: " + track.artist + '</li>');
		$(selector).append("<li>Song Title: " + track.title + '</li>');
		$(selector).append("<li>Album: " + track.album + "</li>");
		$(selector).append("<li>Length: " + track.length_friendly + "</li>");
	},
	LoadHeaders: function () {
		"use strict";
		var header = '<div style="text-align:center;"><a href="#homePage" data-transition="slide" data-direction="reverse"><img border=0 src="/static/images/logo.png" width="300px" alt="logo" style="padding-top: 10px; padding-bottom: 3px;" /> </a><div>You\'re the DJ for Mellow Mushroom</div></div>';
		$(".header").html(header);
	},
	bindPlaylist: function (event) {
		"use strict";
		if ($.mobile.activePage[0].id == "homePage") { //then bind and start auto-refreshing
			$.getJSON("/playlist/" + msfm.locationId(), function (data) {
				msfm.playlist = data;
				
				var listing = [],
					cur_list = [],
					playing_icon = "",
					playing_class = "",
					changed_class = "",
					admin_info = "";
				
				$.each( $(".playlistItemButton"), function (index, plib) {
					cur_list[ $(plib).jqmData("playlist_item_id") ] = $(plib).jqmData("score");				
				});
				
				$.each(data, function (index, playlistitem) {
									
					if (playlistitem.currently_playing==1) {
						 playing_icon = "<img width='16px' src='/static/images/sound_icon.png' class='ui-li-icon' />";
						 playing_class = " playing";
					} else {
						playing_icon = "";
						playing_class = "";
					}
					
					if (msfm.isAdmin) {
						admin_info = '(' + playlistitem.playlist_item_id + ') ';
					} else {
						admin_info = '';
					}
					
					var old_pli_score = cur_list[playlistitem.playlist_item_id];
					
					if (typeof old_pli_score != 'undefined') {
						if (old_pli_score == playlistitem.score){
							changed_class = "";
						} else if (old_pli_score < playlistitem.score) {
							changed_class = " changed_up";
						} else if (old_pli_score > playlistitem.score) {
							changed_class = " changed_down";
						}
					} else {
						changed_class = " changed_new"; //it's a new track
					}
					
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
				var listing_joined = listing.join('');
				
				var final_items = $(listing_joined).detach().sort(function (a, b) {
					if ( $(a).jqmData("currently_playing") == 1 ) {
						return -1;
					} else if ($(b).jqmData("currently_playing") == 1) {
						return 1;
					} else {
						var ascore = $(a).jqmData("score");
						var bscore = $(b).jqmData("score");
						if (ascore == bscore) {
							return $(a).jqmData("time_sort") - $(b).jqmData("time_sort");
						}
						return bscore - ascore;
					}
				});
				
				$('#venuePlaylist').empty().append(final_items).listview("refresh");
				
				$(".changed_new").effect("highlight", {color: "#e5e89b"}, 2000);
				$(".changed_up").effect("highlight", {color: "#a0e89b"}, 2000);
				$(".changed_down").effect("highlight", {color: "#e89b9b"}, 2000);
				
				$(".playing a").css("color", "green").css("padding", ".7em 32px 0");
				window.setTimeout("msfm.bindPlaylist();", 3000);
			});
		}
	},
	disableVotingButtons: function () {
		$('#btnUpVote').attr("disabled", "disabled");
		$('#btnDownVote').attr("disabled", "disabled");
	},
	enableVotingButtons: function () {
		$('#btnUpVote').removeAttr("disabled");
		$('#btnDownVote').removeAttr("disabled");
	},
	doVote: function (pli_id , dir) {
		"use strict";
		$.ajax({
			type: "POST",
			url: "/vote",
			data: "playlist_item_id="
				+ pli_id
				+ '&direction='
				+ dir,
			success: function (data) {
				msfm.renderDialog("Voted!", "Thanks for the input!", "Ok!");
				var voted = JSON.parse(localStorage.getItem(msfm.votedKeyName));
				if (! voted) { voted = []; }
				voted.push(pli_id);
				localStorage.setItem(msfm.votedKeyName, JSON.stringify(voted));
			}
		});
	},
	isAdmin: null,
	bindTrackSearchResults: function (tracklist) {
		"use strict";
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
	},
	trackSearch: function () {
		"use strict";
		var query = $("#trackSearch").val();
		if (query.length > 0) {
			msfm.spinnerStart();
			$.getJSON("/search/" + query, function (data) {
				msfm.bindTrackSearchResults(data);
				msfm.spinnerStop();
			});
		}
	},
	doLogin: function (callbackFn) {
		"use strict";
		FB.login(function (response) {
			if (response.authResponse) {
				var fbid = response.authResponse.userID,
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

$('#homePage').live('pageshow', function () {
	"use strict";
	msfm.bindPlaylist();
});

$('.playlistItemButton').live('click', function () {
	"use strict";
	var track_id = $(this).jqmData('id'),
		pli_id = $(this).jqmData('playlist_item_id'),
		playlist_index = $(this).jqmData('playlist_index'),
		arr = JSON.parse(localStorage.getItem(msfm.votedKeyName)),
		noVote = -1;
		
	if (arr) {
		noVote = arr.indexOf(pli_id);
	}
	if (noVote>=0) {
		$("#alreadyVoted").show();
		$("#voteBtns").hide();
	} else {
		$("#alreadyVoted").hide();
		$("#voteBtns").show();
	}
	
	$('#playlistItemDetails').jqmData('playlist_item_id', pli_id);
	
	var data = msfm.playlist[playlist_index],
		selector = '#playlistItemDetailsTrackDetails';
	
	msfm.buildTrackDetails(data, selector);
	
	$(selector).append("<li style='padding-left: 75px;'>Picked by "
						+ data.first_name + " "	+ data.last_name.substr(0,1)
						+ ". <img style='margin-left: 15px; margin-top: .7em;' src='"
						+ data.photo_url + "'></li>");
	
	$.mobile.changePage('#playlistItemDetails');
});

$("#playlistItemDetails").live('pagebeforeshow', function() {
	$('#playlistItemDetailsTrackDetails').listview("refresh");
	msfm.enableVotingButtons();
});

$("#btnAddTrack").unbind('click.msfm');
$("#btnAddTrack").live('click.msfm', function () {
	"use strict";
	var track_id = $('#addTrack').jqmData('id');
	FB.getLoginStatus(function (response) {
		if (response.status === 'connected') {
			msfm.doLogin(function () {
				msfm.doAddTrack(track_id);
			});
		} else {
			$('#lnkShowLoginDialog').click();
		}
	});
});

$("#lnkFBLogin").unbind('click.msfm');
$("#lnkFBLogin").live('click.msfm', function () {
	"use strict";
	msfm.doLogin(function () {
		$('#pleaseLogin').dialog('close');
		msfm.doAddTrack($('#addTrack').jqmData('id'));
	});
});

$("#btnUpVote").unbind('click.msfm');
$("#btnUpVote").live('click.msfm', function () {
	"use strict";
	msfm.disableVotingButtons();
	msfm.doVote($('#playlistItemDetails').jqmData('playlist_item_id'), 1);
});

$("#btnDownVote").unbind('click.msfm');
$("#btnDownVote").live('click.msfm', function () {
	"use strict";
	msfm.disableVotingButtons();
	msfm.doVote($('#playlistItemDetails').jqmData('playlist_item_id'), 0);
});	

//sets up the track details page
$('#addTrack').live('pageshow', function (event) {
	"use strict";
	$.getJSON("/track/" + $(this).jqmData('id'),
		function (data) {
			msfm.buildTrackDetails(data, '#addTrackDetails');
			$('#addTrackDetails').listview("refresh");
		}
	);
});

//binds each button element in the <li> search results to the track details page
$('.trackButton').live('click', function () {
	"use strict";
	var track_id = $(this).jqmData('id');
	$('#addTrack').jqmData('id', track_id);
	$.mobile.changePage('#addTrack');
});

$(document).ready(function () {
	"use strict";
	msfm.LoadHeaders();
	
	$.mobile.loadingMessage = "Workin' hard!";
	
	$("#btnSubmitSearch").unbind('click.msfm');
	$("#btnSubmitSearch").bind('click.msfm', msfm.trackSearch);
	
	$(document).live('pagebeforechange', function (event, data) {
		msfm.spinnerStop();
	});	
});