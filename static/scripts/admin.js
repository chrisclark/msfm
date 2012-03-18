var msfmAdmin = {
	trackAction: function(pli_id, action, callback){
		"use strict";
		$.ajax({
			type: "POST",
			url: action,
			data: "playlist_item_id=" + pli_id + '&location_id=' + msfm.locationId(),
			success: function() { if(callback){callback();} }
		});
	},
	publishFlash: function(message) {
		"use strict";
		$.ajax({
			type: "POST",
			url: "/venue_flash",
			data: "message=" + message + '&location_id=' + msfm.locationId()
		});
	}
};

$(document).ready(function(){
	"use strict";
	
	$("#homePage").on('click.msfm', '#btnBumpGrind', function(){
		var pli_id = $(".playlistItemButton").first().jqmData("playlist_item_id"),
			next_pli_id = $(".playlistItemButton").first().next().jqmData("playlist_item_id")
		
		msfmAdmin.trackAction(pli_id, "/mark_played", function(){
			msfmAdmin.trackAction(next_pli_id, "/mark_playing");
		});
	});
	
	$("#playlistItemDetails").on('click.msfm', "#btnBump", function(){
		var pli_id = $('#playlistItemDetails').jqmData('playlist_item_id');
		msfmAdmin.trackAction(pli_id, "/bump");
		$.mobile.changePage("#homePage");
	});
		
	$("#playlistItemDetails").on('click.msfm', "#btnMarkPlaying", function(){
		var pli_id = $('#playlistItemDetails').jqmData('playlist_item_id');
		msfmAdmin.trackAction(pli_id, "/mark_playing");
		$.mobile.changePage("#homePage");
	});
	
	$("#homePage").on('click.msfm', "#btnFlash", function(){
		msfmAdmin.publishFlash($("#txtFlash").val());
	});

});
