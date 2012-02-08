$("#btnMarkPlayed").unbind('click.msfm');
$("#btnMarkPlayed").live('click.msfm', function() {
	pli_id = $(".playlistItemButton").first().jqmData("playlist_item_id");
	$.ajax({
		type: "POST",
		url: "/mark_played",
		data: "id=" + pli_id,
		success: function(data){
			spinnerStop();
			location.reload();
		}
	});
});