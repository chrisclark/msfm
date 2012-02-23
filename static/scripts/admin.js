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
	}
};

$(document).ready(function(){
	"use strict";
	
	$("#homePage").on('click.msfm', "#btnMarkTopPlayed", function(){
		msfmAdmin.markPlayed($(".playlistItemButton").first().jqmData("playlist_item_id"));
	});
	
	$("#homePage").on('click.msfm', "#btnMarkPlayed", function(){
		msfmAdmin.markPlayed($("#pli_id").val());
	});
	
	$("#homePage").on('click.msfm', "#btnMarkPlaying", function(){
		var pli_id = $(".playlistItemButton").first().jqmData("playlist_item_id");
		msfmAdmin.markPlaying(pli_id);
	});
});
