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
        },
      ];

var debug = true
var refresh = 30000

var art = 0

// api keys
var key = new Object()
key['lastfm'] = '774632169e435ce88f4f48a0d377cf25'

// thundercats ho!
$(document).ready(function() {

    if(debug) {
        $("#debug").append('debugging enabled - WARNING THERE BE DRAGONS<br />')
        $("#debug").append('refresh interval set to '+refresh/1000+' seconds<br />')
        log(obj)
    }
    else {
        $('#debug').hide()
    }
    // append user sections to page body
	for(record in obj) {
        // create page div elements per name in array  
        $('#users').append('<div id="'+obj[record].name+'"></div><br />')
        $('#'+obj[record].name).append('<a href="http://last.fm/user/'+
            obj[record].userAccounts.lastfm+'">'+
            obj[record].name+'</a>...')
    }

    setInterval(function(){loop()},refresh);

	// make api calls for each name
	for(record in obj) {
        // get recent last FM played tracks
        call({api:'lastfm', method:'user.getRecentTracks', user: obj[record].userAccounts.lastfm, limit: 2});
        call({api:'lastfm', method:'user.getTopArtists', user: obj[record].userAccounts.lastfm, period:'7day',limit:50});
	}
});
