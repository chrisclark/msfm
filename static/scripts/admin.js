var msfmAdmin = {
	markPlayed: function(pli_id){
		"use strict";
		$.ajax({
			type: "POST",
			url: "/mark_played",
			data: "id=" + pli_id,
			success: function(data){
				location.reload();
			}
		});
	},
	markPlaying: function(pli_id) {
		$.ajax({
			type: "POST",
			url: "/mark_playing",
			data: "playlist_item_id=" + pli_id + '&location_id=' + msfm.locationId(),
			success: function(data){
				location.reload();
			}
		});
	}
};

$(document).ready(function(){
	"use strict";
	msfm.isAdmin = true;
	
	$("#homePage").off('click.msfm', "#btnMarkTopPlayed");
	$("#homePage").on('click.msfm', "#btnMarkTopPlayed", function(){
		"use strict";
		msfmAdmin.markPlayed($(".playlistItemButton").first().jqmData("playlist_item_id"));
	});
	
	$("#homePage").off('click.msfm', "#btnMarkPlayed");
	$("#homePage").on('click.msfm', "#btnMarkPlayed", function(){
		"use strict";
		msfmAdmin.markPlayed($("#pli_id").val());
	});
	
	$("#homePage").off('click.msfm', "#btnMarkPlaying");
	$("#homePage").on('click.msfm', "#btnMarkPlaying", function(){
		"use strict";
		var pli_id = $(".playlistItemButton").first().jqmData("playlist_item_id");
		msfmAdmin.markPlaying(pli_id);
	});
});
