var msfmAdmin = {
	markPlayed: function(pli_id){
		"use strict";
		$.ajax({
			type: "POST",
			url: "/mark_played",
			data: "id=" + pli_id + '&location_id=' + msfm.locationId(),
		});
	},
	markPlaying: function(pli_id) {
		"use strict";
		$.ajax({
			type: "POST",
			url: "/mark_playing",
			data: "playlist_item_id=" + pli_id + '&location_id=' + msfm.locationId(),
		});
	},
	publishFlash: function(message) {
		"use strict";
		$.ajax({
			type: "POST",
			url: "/venue_flash",
			data: "message=" + message + '&location_id=' + msfm.locationId(),
		});
	}
};

$(document).ready(function(){
	"use strict";
	
	$("#playlistItemDetails").on('click.msfm', "#btnMarkPlayed", function(){
		msfmAdmin.markPlayed($('#playlistItemDetails').jqmData('playlist_item_id'));
		$.mobile.changePage("#homePage");
	});
	
	$("#homePage").on('click.msfm', "#btnFlash", function(){
		msfmAdmin.publishFlash($("#txtFlash").val());
	});
	
	$("#homePage").on('click.msfm', "#btnMarkPlaying", function(){
		var pli_id = $(".playlistItemButton").first().jqmData("playlist_item_id");
		msfmAdmin.markPlaying(pli_id);
	});
});
