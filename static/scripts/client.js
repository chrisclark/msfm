trackSearch = function() {
	$.getJSON("/search/" + $("#trackSearch").val(), function(data) {
		bindTrackSearchResults(data);
	});
}

function bindTrackSearchResults(playlist){
	var listing = [];
	
	$.each(playlist, function(index, track){
		listing.push('<li class="trackButton" data-id="'
					+ track.id
					+ '"><a href="javascript:void(0);">'
					+ track.artist
					+ ' - '
					+ track.title
					+ '</a></li>')
	});
	
	$('#searchListing').empty().append(listing.join('')).listview("refresh");
}

$('#trackDetail').live('pageshow', function(event){
	$.getJSON("/track/" + $(this).jqmData('track_id'), function(track) {
		$("#trackDetails").empty();
		$("#trackDetails").append("<li>Artist: " + track.artist + '</li>');
		$("#trackDetails").append("<li>Title: " + track.title + '</li>');
		$("#trackDetails").append("<li>Length: " + track.length + " seconds </li>");
		$("#trackDetails").listview("refresh");
	});
	$("#btnAddTrack").click(function(){
		$.ajax({
			type: "POST",
			url: "/addTrack",
			data: "track_id=" + $("#trackDetail").jqmData('track_id')
		});
	});
});

$('.trackButton').live('click', function() {
	var track_id = $(this).jqmData('id');
	$('#trackDetail').jqmData('track_id', track_id);
	$.mobile.changePage('#trackDetail');
});

$(document).ready(function() {
	$("#btnSubmitSearch").click(trackSearch);
});