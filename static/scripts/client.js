var msfm = {
	flashMessage : "",
	isNewFlash : false,
	spinnerStart : function() {"use strict";
		$.mobile.showPageLoadingMsg();
	},
	spinnerStop : function() {"use strict";
		$.mobile.hidePageLoadingMsg();
	},
	locationId : function() {"use strict";
		if(!this.location_id) {
			var uri = new jsUri(window.location);
			this.location_id = uri.path().substr(uri.path().lastIndexOf("/") + 1, uri.path().length);
		}
		return this.location_id;
	},
	location_id : null,
	playlist : null,
	votedKeyName : "msfm.votedArr2",
	renderDialog : function(title, msg, btnText) {"use strict";
		$("#diagTitle", '#diagNotification').html(title);
		$("#diagText", '#diagNotification').html(msg);
		$("#diagConfirm span", '#diagNotification').first().html(btnText);
		msfm.spinnerStop();
		$.mobile.changePage('#diagNotification', {
			transition : 'slidedown',
			reverse : false,
			changeHash : true
		});
	},
	loginAction : null,
	doAddTrack : function(provider_id, special) {"use strict";
		if(provider_id) {
			$.ajax({
				type : "POST",
				url : "/add_track",
				data : "provider_id=" + provider_id + '&location_id=' + msfm.locationId() + '&special=' + special,
				complete : function(xhr) {
					if(xhr.status != 200) {
						msfm.renderDialog("Whoops!", jQuery.parseJSON(xhr.responseText).msg, "Home");
					}
				},
				success : function(data, textStatus, xhr) {
					msfm.renderDialog("Sweet!", "Added your track", "OK!");
				}
			});
		} else {
			msfm.renderDialog("Hrm...", "Somethin' weird happened. Let's try that again.", "Home");
		}
	},
	buildTrackDetails : function(track, selector) {"use strict";
		$(selector).empty();
		$(selector).append("<li><img src='" + track.art_url + "' style='padding-top: 3px; max-width: 95px;' />" + "<h2>" + track.artist + "</h2>" + "<p><strong>" + track.title + "</strong></p>" + "<p>Album: " + track.album + "</p>" + "</li>"); 
		//+ "<p class='ui-li-aside' style='width: 15%;'>" + track.length_friendly + "</p>" 
		
	},
	bindPlaylist : function() {"use strict";
		var listing = [], cur_list = [], icon = "", except_class = "", changed_class = "", admin_info = "", dir = 0, li_id = "";
		//will be used to indicate currently playing song, so joyride can hook in

		$.each($(".playlistItemButton"), function(index, plib) {
			cur_list[$(plib).jqmData("playlist_item_id")] = $(plib).jqmData("score");
		});

		$.each(msfm.playlist, function(index, playlistitem) {
			li_id = 'pli_' + playlistitem.playlist_item_id;
			icon = except_class = "";
			if(playlistitem.currently_playing) {
				icon = "<img width='16px' src='/static/images/sound_icon.png' class='ui-li-icon' />";
				except_class = " playing";
				li_id = "playing_pli";
			} else if (playlistitem.special) {
				icon = "<img width='16px' src='/static/images/lock.png' class='ui-li-icon' />";
				except_class = " special"
			} else if(msfm.getVoted()[playlistitem.playlist_item_id]) {
				dir = msfm.getVoted()[playlistitem.playlist_item_id];
				if(dir > 0) {
					icon = "<img width='16px' src='/static/images/thumbup.png' class='ui-li-icon' />";
				} else {
					icon = "<img width='16px' src='/static/images/thumbdown.png' class='ui-li-icon' />";
				}
			}
			admin_info = "";
			if(msfm.isAdmin) {
				admin_info = "(" + playlistitem.playlist_item_id + ") ";
			}

			var old_pli_score = cur_list[playlistitem.playlist_item_id];

			if( typeof old_pli_score != "undefined") {
				if(old_pli_score == playlistitem.score) {
					changed_class = "";
				} else if(old_pli_score < playlistitem.score) {
					changed_class = " changed_up";
				} else if(old_pli_score > playlistitem.score) {
					changed_class = " changed_down";
				}
			} else {
				changed_class = " changed_new";
			}

			listing.push('<li id="' + li_id + '" class="playlistItemButton' + except_class + changed_class + '" data-id="' + playlistitem.id + '" data-playlist_item_id="' + playlistitem.playlist_item_id + '" data-score="' + playlistitem.score + '" data-time_sort="' + playlistitem.time_sort + '" data-playlist_index="' + index + '">' + icon + '<a style="padding: .7em 15px 0 35px;" href="javascript:void(0);">' + '<span class="ui-li-count">' + playlistitem.score + '</span>' + '<p><strong>' + playlistitem.artist + '</strong></p>' + '<p>' + admin_info + playlistitem.title + '</p>' + '</a></li>');

		});
		var listing_joined = listing.join(""), final_items = $(listing_joined).detach();

		$('#venuePlaylist').empty().append(final_items).listview("refresh");

		$(".changed_new", '#venuePlaylist').effect("highlight", {
			color : "#e5e89b"
		}, 2500);
		$(".changed_up", '#venuePlaylist').effect("highlight", {
			color : "#a0e89b"
		}, 2500);
		$(".changed_down", '#venuePlaylist').effect("highlight", {
			color : "#e89b9b"
		}, 2500);
		$(".playing a", '#venuePlaylist').css("color", "green").css("padding", ".7em 32px 0");
	},
	doFlash : function() {"use strict";
		$("#flash").show();
		if(msfm.isNewFlash) {
			$("#flash").effect("highlight", {
				color : "#e5e89b"
			}, 4000);
			setTimeout("msfm.doFlash();", 4000);
		}
	},
	disableVotingButtons : function() {"use strict";
		$('#btnUpVote').attr("disabled", "disabled");
		$('#btnDownVote').attr("disabled", "disabled");
	},
	enableVotingButtons : function() {"use strict";
		$('#btnUpVote').removeAttr("disabled");
		$('#btnDownVote').removeAttr("disabled");
	},
	doVote : function(pli_id, dir) {"use strict";
		$.ajax({
			type : "POST",
			url : "/vote",
			data : "playlist_item_id=" + pli_id + '&direction=' + dir + "&location_id=" + msfm.locationId(),
		});
		//just assume the vote went through and show the dialog. No need to wait on the server.
		var voted = msfm.getVoted();
			voted[pli_id] = dir;
			window.localStorage.setItem(msfm.votedKeyName, JSON.stringify(voted));
		msfm.renderDialog("Voted!", "Thanks for the input!", "Ok!");
	},
	isAdmin : false,
	getVoted : function() {"use strict";
		var ret = window.localStorage.getItem(msfm.votedKeyName);
		if(!ret) {
			ret = [];
		} else {
			ret = JSON.parse(ret);
		}
		return ret;
	},
	bindTrackSearchResults : function(tracklist) {"use strict";
		var listing = [];
		$.each(tracklist, function(index, track) {
			listing.push('<li class="trackButton"' + +' data-provider-id="' + track.provider_id + '" data-index="' + index + '">' + '<a href="javascript:void(0);" style="padding: .7em 15px 0 15px;"">' + '<p><strong>' + track.artist + '</strong></p>' + '<p>' + track.title + '</p></a></li>');
		});

		$('#searchListing').empty().append(listing.join('')).listview("refresh");
	},
	trackSearch : function(query) {"use strict";
		if(query.length > 0) {
			msfm.spinnerStart();
			$.getJSON("/search/" + query, function(data) {
				msfm.playlist = data;
				msfm.bindTrackSearchResults(data);
				msfm.spinnerStop();
			});
		}
	},
	requireLogin : function(callbackFn) {"use strict";
		msfm.spinnerStart();
		FB.getLoginStatus(function(response) {
			if(response.status === 'connected') {
				msfm.doLogin(response, callbackFn);
			} else {
				msfm.loginAction = callbackFn;
				//this is kind of ghetto. Stash away the callback so the login screen can get it later
				$("#btnFBLogin").removeAttr("disabled");
				$.mobile.changePage('#pleaseLogin', {
					transition : 'slidedown',
					reverse : false,
					changeHash : false
				});
			}
		});
	},
	doLogin : function(resp, callbackFn) {
		"use strict";
		var fbid = resp.authResponse.userID, fbat = resp.authResponse.accessToken, msg = "";

		$.ajax({
			type : "POST",
			url : "/login",
			data : "fbid=" + fbid + '&location_id=' + msfm.locationId() + '&fbat=' + fbat + '&method=facebook',
			complete : function(xhr) {
				if(xhr.status != 200) {
					msg = jQuery.parseJSON(xhr.responseText).msg;
					msfm.renderDialog("Whoops!", msg, "Home");
				}
			},
			success : function(data) {
				msfm.isAdmin = JSON.parse(data).admin;
				callbackFn();
			}
		});
	},
	doFBLogin : function(callbackFn) {
		"use strict";
		FB.login(function(response) {
			msfm.spinnerStart();
			if(response.authResponse) {
				msfm.doLogin(response, callbackFn);
			} else {
				msfm.renderDialog("Hrm...", "You gotta log in buddy.", "Home");
			}
		}, {
			scope : 'email'
		});
	},
	drawLeaderboard : function(hrs, callback) {
		"use strict";
		msfm.spinnerStart();
		var listing = []
			,ct = 1;
		$.getJSON("/leaderboard/" + msfm.locationId() + "?hours=" + hrs, function(data){
			$.each(data, function(index, user) {
				listing.push("<li><a id='fbLink' target='_blank' href='http://facebook.com/" + user.facebook_id + "'>" + "<img src='" + user.photo_url + "'><h3>" + ct + ". "  + user.first_name + " " + user.last_name + ".</h3><p>" + user.score +  " points</p></a></li>");
				ct = ct + 1;	
			});
			var listing_joined = listing.join(""),
				final_items = $(listing_joined).detach();
			$('#leaderboardDetails').empty().append(final_items);
			msfm.spinnerStop();
			callback();	
		});
	}
};

$(document).ready(function() {"use strict";

	$.getJSON("/playlist/" + msfm.locationId(), function(data) {
		msfm.playlist = data;
		msfm.bindPlaylist();
		if($.mobile.activePage.prop("id") == "homePage"){
			$(window).joyride({
				'tipLocation': 'bottom', // 'top' or 'bottom' in relation to parent
				'scrollSpeed': 300, // Page scrolling speed in milliseconds
				'timer': 0, // 0 = no timer, all other numbers = timer in milliseconds
				'startTimerOnClick': false, // true or false - true requires clicking the first button start the timer
				'nextButton': true, // true or false to control whether a next button is used
				'tipAnimation': 'pop', // 'pop' or 'fade' in each tip
				'tipAnimationFadeSpeed': 300, // when tipAnimation = 'fade' this is speed in milliseconds for the transition
				'cookieMonster': false, // true or false to control whether cookies are used
				'cookieName': 'JoyRide', // Name the cookie you'll use
				'cookieDomain': false, // Will this cookie be attached to a domain, ie. '.notableapp.com'
				'tipContainer': 'body', // Where will the tip be attached if not inline
				'inline': false, // true or false, if true the tip will be attached after the element
				'tipContent': '#joyRideTipContent', // What is the ID of the <ol> you put the content in
				'postRideCallback': function(){window.scrollTo(0, 0);} // A possible method to call once the tour closes (canceled or complete)
			});
		}
	});

	$.getJSON("/flash/" + msfm.locationId(), function(data) {
		if(data && data != "") {
			msfm.isNewFlash = true;
			msfm.flashMessage = data;
			$("#txtFlash").val(msfm.flashMessage);
			msfm.doFlash();
		}
	});
	
	if(msfm.isAdmin) {
		$("#adminPanel").show();
	}

	$.mobile.defaultPageTransition = "fade";

	$("#search").on("click.msfm", "#btnSubmitSearch", function() {
		var query = $("#trackSearch").val();
		msfm.trackSearch(query);
	});

	$(document).on('pagebeforechange', function(event, data) {
		msfm.spinnerStop();
		$(".joyride-tip-guide").hide();
		if(msfm.isAdmin) {
			$(".adminPanel").show();
		}
	});

	$('#homePage').on('pageshow', function() {
		$.getJSON("/playlist/" + msfm.locationId(), function(data) {
			msfm.playlist = data;
			msfm.bindPlaylist();
		});
	});

	$("#search").on('click.msfm', '.trackButton', function() {
		var data = msfm.playlist[$(this).jqmData('index')];
		msfm.buildTrackDetails(data, '#addTrackDetails');
		$('#addTrack').jqmData('provider-id', data.provider_id);
		$("#chkSpecial").removeAttr("checked");
		$.mobile.changePage('#addTrack');
	});

	$('#homePage').on('click.msfm', "#addSongBtn", function() {
		$('#searchListing').empty();
	});

	$('#homePage').on('click.msfm', ".playlistItemButton", function() {
		var track_id = $(this).jqmData('id'),
			pli_id = $(this).jqmData('playlist_item_id'), 
			playlist_index = $(this).jqmData('playlist_index'),
			arr = window.localStorage.getItem(msfm.votedKeyName),
			vote = false;

		if(arr) {
			vote = JSON.parse(arr)[pli_id];
		}
		if(vote && !msfm.isAdmin) {
			$("#alreadyVoted").show();
			$("#voteBtns").hide();
		} else {
			$("#alreadyVoted").hide();
			$("#voteBtns").show();
		}

		$('#playlistItemDetails').jqmData('playlist_item_id', pli_id);

		var data = msfm.playlist[playlist_index], selector = '#playlistItemDetailsTrackDetails';

		msfm.buildTrackDetails(data, selector);

		$(selector).append("<li><a id='fbLink' target='_blank' href='http://facebook.com/" + data.facebook_id + "'>" + "<img src='" + data.photo_url + "'><h1>Picked by <strong>" + data.first_name + " " + data.last_name + "</strong></h1></a></li>");

		$.mobile.changePage('#playlistItemDetails');
	});
	
	$('#homePage').on('click.msfm', "#leaderboardBtn", function() {
		msfm.drawLeaderboard($("#leaderboard-select").val(), function(){
			$.mobile.changePage('#leaderboard');
		});
	});
	
	$('#leaderboard').on('change.msfm', "#leaderboard-select", function() {
		msfm.drawLeaderboard($("#leaderboard-select").val(), function(){
			$('#leaderboardDetails').listview("refresh");
		});
	});

	$("#addTrack").on('click.msfm', "#btnAddTrack", function() {
		var provider_id = $('#addTrack').jqmData('provider-id');
		msfm.requireLogin(function() {
			msfm.doAddTrack(provider_id, $("#chkSpecial").is(':checked'));
		});
	});

	$("#pleaseLogin").on('click.msfm', '#btnFBLogin', function() {
		$("#btnFBLogin").attr("disabled", "disabled");
		msfm.doFBLogin(function() {
			msfm.loginAction();
			$("#btnFBLogin").removeAttr("disabled");
		});
	});

	$("#homePage").on('click.msfm', "#flash", function() {
		msfm.renderDialog("Specials", msfm.flashMessage, "Got it!");
		msfm.isNewFlash = false;
	});

	$("#playlistItemDetails").on('click.msfm', "#btnUpVote", function() {
		msfm.disableVotingButtons();
		msfm.doVote($('#playlistItemDetails').jqmData('playlist_item_id'), 1);
	});

	$("#playlistItemDetails").on('click.msfm', "#btnDownVote", function() {
		msfm.disableVotingButtons();
		msfm.doVote($('#playlistItemDetails').jqmData('playlist_item_id'), -1);
	});

	$(document).on('pagebeforeshow', "#playlistItemDetails", function() {
		$('#playlistItemDetailsTrackDetails').listview("refresh");
		msfm.enableVotingButtons();
	});

	$(document).on('pagebeforeshow', "#addTrack", function() {
		$('#addTrackDetails').listview("refresh");
		$("#chkSpecial").checkboxradio("refresh");
	});
	
	$(document).on('pagebeforeshow', "#leaderboard", function() {
		$('#leaderboardDetails').listview("refresh");
	});
		
	//$("#chkExplicit").click( function(){
	//if( $(this).is(':checked') ) alert("checked")
	//});

	var jug = new Juggernaut;
	jug.subscribe("msfm:playlist:" + msfm.locationId(), function(data) {
		if($.mobile.activePage.prop("id") == "homePage") {
			msfm.playlist = JSON.parse(data);
			msfm.bindPlaylist();
		}
	});

	jug.subscribe("msfm:marketing:" + msfm.locationId(), function(data) {
		msfm.flashMessage = data;
		$("#txtFlash").val(msfm.flashMessage);

		//if we're already flashing, doing it again will cause setTimeout issues
		msfm.isNewFlash = (msfm.flashMessage != "" && !msfm.isNewFlash);
		if($.mobile.activePage.prop("id") == "homePage") {//otherwise this will be handled in the playlist bind
			msfm.doFlash();
		}
	});
});
