$("#btnMarkPlayed").unbind('click.msfm');
$("#btnMarkPlayed").live('click.msfm', function() {
	pli_id = $(".playlistItemButton").first().jqmData("playlist_item_id");
	$.ajax({
		type: "POST",
		url: "/mark_played",
		data: "id=" + pli_id,
		success: function(data){
			location.reload();
		}
	});
});

$("#btnMarkPlaying").unbind('click.msfm');
$("#btnMarkPlaying").live('click.msfm', function() {
	pli_id = $(".playlistItemButton").first().jqmData("playlist_item_id");
	$.ajax({
		type: "POST",
		url: "/mark_playing",
		data: "playlist_item_id=" + pli_id + '&location_id=' + msfm.locationId(),
		success: function(data){
			location.reload();
		}
	});
});