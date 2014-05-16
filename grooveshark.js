receivedTracks = 0;

function groove(user)
{
	        // get top artists
        call({  api:lastfm, 
                method:'user.getTopArtists', 
                user: model[user].userAccounts.lastfm, 
                period:'7day',
                limit:5},
            [grooveLastFMTopArtists]
        );
}

function grooveLastFMTopArtists(obj)
{
	user = findUserAccount(obj.topartists["@attr"].user);
	size = obj.topartists["@attr"].perPage;
	type = obj.topartists["@attr"].type;
	log('retrieved top '+size+' artists in '+type+' for '+user);
	
	model[user].receivedData.topartists = obj.topartists;	
	log("(stored)");
	grooveLastFMTopSongs();
}

function grooveLastFMTopSongs()
{
	receivedTracks = 0;
	
	// create model area for tracks
	model[record].receivedData.tracks = {};

	for(record in model)
	{
		for(artist in model[record].receivedData.topartists.artist)
		{
			//log(model[record].receivedData.topartists.artist[artist].name);
			
			// call for last FM last song listened to of..
        	call({	api:lastfm, 
        		method:'user.getArtistTracks', 
        		user: model[record].userAccounts.lastfm, 
        		artist:htmlReplace(model[record].receivedData.topartists.artist[artist].name),
        		limit:1},
        		grooveLastFMTrack
        	);
		}
	}
	
}

function grooveLastFMTrack(obj)
{
	artist = obj.artisttracks["@attr"].artist;
	trackData = obj.artisttracks.track;
	log('received track: '+artist+' - '+trackData.name);
	
	model[record].receivedData.tracks[artist] = trackData;
	log("(stored)");
	
	receivedTracks = receivedTracks + 1;
	if(receivedTracks>=5)
		groovePlayList();
}

function groovePlayList()
{
	log();
	log('received enough songs ('+receivedTracks+')');
	log('building playlist...');
	log();
	log(model);
	
	playlist = {};
	
	for(record in model)
	{
		for(artist in model[record].receivedData.tracks)
		{
			track = model[record].receivedData.tracks[artist].name;
			log(artist+': '+track);
			playlist[artist] = track;
		}
	}
	log(playlist);
	log();
	log("okay, playlist built. now how the fuck do I talk to "+linkify('http://developers.grooveshark.com/docs/public_api/v3/','grooveshark?'));

}






