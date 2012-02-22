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
	doAddTrack: function (provider_id) {
		"use strict";
		$.ajax({
			type: "POST",
			url: "/add_track",
			data: "provider_id=" + provider_id + '&location_id=' + msfm.locationId(),
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
		var header = '<div style="text-align:center;"><a href="#homePage"><img border=0 src="/static/images/logo.png" width="300px" alt="logo" style="padding-top: 10px; padding-bottom: 3px;" /> </a><div>You\'re the DJ at this location</div></div>';
		$(".header").html(header);
	},
	bindPlaylist: function () {
		"use strict";

			
		var listing = [],
			cur_list = [],
			playing_icon = "",
			playing_class = "",
			changed_class = "",
			admin_info = "";
		
		$.each( $(".playlistItemButton"), function (index, plib) {
			cur_list[ $(plib).jqmData("playlist_item_id") ] = $(plib).jqmData("score");				
		});
		
		$.each(msfm.playlist, function (index, playlistitem) {
							
			if (playlistitem.currently_playing==1) {
				 playing_icon = "<img width='16px' src='/static/images/sound_icon.png' class='ui-li-icon' />";
				 playing_class = " playing";
			} else {
				playing_icon = playing_class = "";
			}
			
			if (msfm.isAdmin) {
				admin_info = "(" + playlistitem.playlist_item_id + ") ";
			} else {
				admin_info = "";
			}
			
			var old_pli_score = cur_list[playlistitem.playlist_item_id];
			
			if (typeof old_pli_score != "undefined") {
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
				'<li id="pli_' + playlistitem.playlist_item_id
				+ '" class="playlistItemButton'	+ playing_class + changed_class
				+ '" data-id="'	+ playlistitem.id
				+ '" data-playlist_item_id="' + playlistitem.playlist_item_id
				+ '" data-score="' + playlistitem.score
				+ '" data-time_sort="' + playlistitem.time_sort
				+ '" data-playlist_index="'	+ index	+ '">'
				+ playing_icon
				+ '<a style="padding: .7em 15px 0 15px;" href="javascript:void(0);">'
				+ '<span class="ui-li-count">' + playlistitem.score + '</span>'
				+ '<p><strong>'	+ playlistitem.artist + '</strong></p>'
				+ '<p>'	+ admin_info + playlistitem.title + '</p>'
				+ '</a></li>'
			);
			
		});
		
		var listing_joined = listing.join(""),
			final_items = $(listing_joined).detach();
		
		$('#venuePlaylist').empty().append(final_items).listview("refresh");
		
		$(".changed_new", '#venuePlaylist').effect("highlight", {color: "#e5e89b"}, 2500);
		$(".changed_up", '#venuePlaylist').effect("highlight", {color: "#a0e89b"}, 2500);
		$(".changed_down", '#venuePlaylist').effect("highlight", {color: "#e89b9b"}, 2500);
		$(".playing a", '#venuePlaylist').css("color", "green").css("padding", ".7em 32px 0");	
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
			data: "playlist_item_id=" + pli_id
				+ '&direction='	+ dir
				+ "&location_id=" + msfm.locationId(),
			success: function (data) {
				msfm.renderDialog("Voted!", "Thanks for the input!", "Ok!");
				var voted = window.localStorage.getItem(msfm.votedKeyName);
				if (! voted) {
					voted = [];
				} else {
					voted = JSON.parse(voted); //gotta break this out from the retrieval from localstorage or else android chokes
				}
				voted.push(pli_id);
				window.localStorage.setItem(msfm.votedKeyName, JSON.stringify(voted));
			}
		});
	},
	isAdmin: null,
	bindTrackSearchResults: function (tracklist) {
		"use strict";
		var listing = [];
		$.each(tracklist, function (index, track) {
			listing.push(	
				'<li class="trackButton"'+
				+ ' data-provider-id="'	+ track.provider_id
				+ '" data-index="' + index + '">'
				+ '<a href="javascript:void(0);" style="padding: .7em 15px 0 15px;"">'
				+ '<p><strong>'	+ track.artist + '</strong></p>'
				+ '<p>' + track.title + '</p></a></li>'
			);
		});
		
		$('#searchListing').empty().append(listing.join('')).listview("refresh");
	},
	trackSearch: function () {
		"use strict";
		var query = $("#trackSearch").val();
		if (query.length > 0) {
			msfm.spinnerStart();
			$.getJSON("/search/" + query, function (data) {
				msfm.playlist = data;
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

$(document).ready(function () {
	"use strict";
	msfm.LoadHeaders();
	
	$.getJSON("/playlist/" + msfm.locationId(), function (data) {
		msfm.playlist = data;
		msfm.bindPlaylist();
	});
	
	$.mobile.loadingMessage = "Workin' hard!";
	$.mobile.defaultPageTransition = "fade";
	
	$("#search").off("click.msfm", "#btnSubmitSearch");
	$("#search").on("click.msfm", "#btnSubmitSearch", msfm.trackSearch);
	
	$(document).on('pagebeforechange', function (event, data) {
		msfm.spinnerStop();
	});
	
	$('#homePage').on('pageshow', function () {
		"use strict";
		$.getJSON("/playlist/" + msfm.locationId(), function (data) {
			msfm.playlist = data;
			msfm.bindPlaylist();
		});
	});
	
	$("#search").on('click.msfm', '.trackButton', function() {
		"use strict";
		var data = msfm.playlist[$(this).jqmData('index')];
		msfm.buildTrackDetails(data, '#addTrackDetails');
		$('#addTrack').jqmData('provider-id', data.provider_id);
		$.mobile.changePage('#addTrack');
	});
	
	$('#homePage').on('click.msfm', "#addSongBtn", function () {
		"use strict";
		$('#searchListing').empty();
	})
	
	$('#homePage').on('click.msfm', ".playlistItemButton", function () {
		"use strict";
		var track_id = $(this).jqmData('id'),
			pli_id = $(this).jqmData('playlist_item_id'),
			playlist_index = $(this).jqmData('playlist_index'),
			arr = window.localStorage.getItem(msfm.votedKeyName),
			noVote = -1;
			
		if (arr) {
			arr = JSON.parse(arr);
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
	
	$("#addTrack").off('click.msfm', "#btnAddTrack");
	$("#addTrack").on('click.msfm', "#btnAddTrack", function () {
		"use strict";
		var provider_id = $('#addTrack').jqmData('provider-id');
		FB.getLoginStatus(function (response) {
			if (response.status === 'connected') {
				msfm.spinnerStart();
				msfm.doLogin(function () {
					msfm.doAddTrack(provider_id);
				});
			} else {
				$('#lnkShowLoginDialog').click();
			}
		});
	});
	
	$("#pleaseLogin").off('click.msfm', '#lnkFBLogin');
	$("#pleaseLogin").on('click.msfm', '#lnkFBLogin', function () {
		"use strict";
		msfm.doLogin(function () {
			$('#pleaseLogin').dialog('close');
			msfm.doAddTrack($('#addTrack').jqmData('provider-id'));
		});
	});
	
	$("#playlistItemDetails").off('click.msfm', "#btnUpVote");
	$("#playlistItemDetails").on('click.msfm', "#btnUpVote", function () {
		"use strict";
		msfm.disableVotingButtons();
		msfm.doVote($('#playlistItemDetails').jqmData('playlist_item_id'), 1);
	});
	
	$("#playlistItemDetails").off('click.msfm', "#btnDownVote");
	$("#playlistItemDetails").on('click.msfm', "#btnDownVote", function () {
		"use strict";
		msfm.disableVotingButtons();
		msfm.doVote($('#playlistItemDetails').jqmData('playlist_item_id'), -1);
	});
	
	$(document).on('pagebeforeshow', "#playlistItemDetails", function() {
		"use strict";
		$('#playlistItemDetailsTrackDetails').listview("refresh");
		msfm.enableVotingButtons();
	});
	
	$(document).on('pagebeforeshow', "#addTrack", function() {
		"use strict";
		$('#addTrackDetails').listview("refresh");
	});
	
	var jug = new Juggernaut;
	var vote_chan = "msfm:playlist:" + msfm.locationId();
	jug.subscribe(vote_chan, function(data){
		"use strict";
		msfm.playlist = JSON.parse(data);
		msfm.bindPlaylist();
	});
	
});
