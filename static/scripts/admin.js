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
	}	
};

$(document).ready(function(){
	"use strict";
	msfm.isAdmin = true;
});

$("#btnMarkTopPlayed").unbind('click.msfm');
$("#btnMarkTopPlayed").live('click.msfm', function(){
	"use strict";
	msfmAdmin.markPlayed($(".playlistItemButton").first().jqmData("playlist_item_id"));
});

$("#btnMarkPlayed").unbind('click.msfm');
$("#btnMarkPlayed").live('click.msfm', function(){
	"use strict";
	msfmAdmin.markPlayed($("#pli_id").val());
});

$("#btnMarkPlaying").unbind('click.msfm');
$("#btnMarkPlaying").live('click.msfm', function() {
	"use strict";
	var pli_id = $(".playlistItemButton").first().jqmData("playlist_item_id");
	$.ajax({
		type: "POST",
		url: "/mark_playing",
		data: "playlist_item_id=" + pli_id + '&location_id=' + msfm.locationId(),
		success: function(data){
			location.reload();
		}
	});
});