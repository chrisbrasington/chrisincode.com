// user info
// name is used to dynamically create page elements when content is received
// each API call gets a page element under the user parent
obj = [ 
        {'name':'Christopher', 
            'userAccounts':
            {
                'lastfm':'raylinth',
            },
            'receivedData':
            {}
        }
      ];

// thundercats ho!
$(document).ready(function() {

    init();

	// make api calls for each name
	for(record in obj) {
        // get recent last FM played tracks
        call({api:'lastfm', method:'user.getRecentTracks', user: obj[record].userAccounts.lastfm, limit: 2});
        call({api:'lastfm', method:'user.getTopArtists', user: obj[record].userAccounts.lastfm, period:'7day',limit:50});
	}
});
