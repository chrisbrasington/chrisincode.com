// user info
// name is used to dynamically create page elements when content is received
// each API call gets a page element under the user parent
obj = [ 
        {'name':'Christopher', 
            'userAccounts':
            {
                'lastfm':'raylinth',
                'steam':'raylinth'
            },
            'receivedData':
            {}
        },

        {'name':'Geddy', 
            'userAccounts':
            {
                'lastfm':'Eclisiast',
            },
            'receivedData':
            {}
        },
        /*  {'name':'Jimbo',
            'userAccounts':
            {
                'lastfm':'sk8ordietryin',
            },
            'receivedData':
            {}
        },
        */
      ];

var debug = true 
var refresh = 30000


// api keys
var key = new Object()
key['lastfm'] = '774632169e435ce88f4f48a0d377cf25'
key['metrolyrics'] = '1234567890123456789012345678901234567890'

// thundercats ho!
$(document).ready(function() {

    if(debug)
        $("#debug").append('debugging enabled (F12 for console log, shows objects)<br />')
        $("#debug").append('WARNING THERE BE DRAGONS!!!<br />')
        $("#debug").append('refresh interval set to '+refresh/1000+' seconds<br /><br />')
    log(obj)

    // append user sections to page body
	for(record in obj) {
        // create page div elements per name in array  
        $('#users').append('<div id="'+obj[record].name+'"></div><br />')
        $('#'+obj[record].name).append(obj[record].name+'...')
    }

    setInterval(function(){loop()},refresh);

	// make api calls for each name
	for(record in obj) {
        // get recent last FM played tracks
        call({api:'lastfm', method:'user.getRecentTracks', user: obj[record].userAccounts.lastfm, limit: 2});
	}
});

function loop() {
    $('#debug').empty()
    log('refresh '+Date()+'<br />')

    //divsAdded = []
    // make api calls for each name
	for(record in obj) {
        // get recent last FM played tracks
        call({api:'lastfm', method:'user.getRecentTracks', user: obj[record].userAccounts.lastfm, limit: 2});
	}
}

// debug logging
function log(message,overrule) {
    if(!overrule && !debug) return

    // console logging    
    console.log(message)

    // logging to page: objects (skipped), urls, and text
    if(typeof(message) == 'object'){
        //$("#debug").append(JSON.stringify(message))
        return
    }
    else if(typeof(message) == 'string'){
        if(message.substring(0,4) ==  'http') {
            //$('<i><a href="'+message+'">'+message+'</a></i>').appendTo($('#debug'));
            //$("#debug").append('<br />')
        }
        else {
            $("#debug").append(message)
            $("#debug").append('<br />')
        }
    }
    else {
        $("#debug").append(message)
        $("#debug").append('<br />')
    }

}

// call will determine which API is being called
function call(vars) {
    // I'm gonna demand an API and method defined 
	if(!vars.api || !vars.method) return

    // debug informationon call parameters
    var callLog = 'call to : '
    for(v in vars) 
        callLog += v+':'+vars[v]+' | '
    //log(callLog)

    // determine which API is being called
    if(vars.api == 'lastfm')
        call_lastfm(vars)
    else if(vars.api == 'metrolyrics')
        call_lyrics(vars.artist,vars.song)
    else {
        log('unknown API call '+vars.api)
        log(vars)
    }
}

// call LAST FM will build api url based on parameters
function call_lastfm(vars) {

    // let's smart log the API call to documentation
    var doc = 'http://www.last.fm/api/show/'
    doc += vars.method

    // build static part of api call
	var url = 'http://ws.audioscrobbler.com/2.0/?'
	url += 'api_key='+key.lastfm
	url += '&format=json'

	// build dynamic part of api call
	for(v in vars) {
		url += '&'+v+'='+vars[v]
	}

    var callLog = 'call to | '
    for(v in vars) { 
        callLog+=v+':'
        if(v == 'method') {
            callLog+= '<a href="http://www.last.fm/api/show/'+vars[v]+'">'+vars[v]+'</a>'
        }
        else if(v == 'api') {
            callLog+= '<a href="http://www.last.fm/api">'+vars[v]+'</a>'
        }
        else if(v == 'user') {
            callLog+= '<a href="http://www.last.fm/user/'+vars[v]+'">'+vars[v]+'</a>'
            
        }
        else  
            callLog += vars[v]
        callLog += ' | '
    }
    callLog+='<a href="'+url+'">url</a>'

    log(callLog)

	//make api call
	getJSON(url)
}


// get all url parameters - not used 
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

// generic JSON request and callbacks
function getJSON(url) {
	log(url)
	$.ajax({
	        url: url,
            type: "get",
            crossDomain: true,
	        dataType: 'json',
	        success: successCallback,
		error: function(r) { 
			log('retrieve JSON - failure') 
		}	
	});
}

// generic JSONP request and callbacks
// FUCKING PADDING
function getJSONP(url) {
    $.ajax({
        url:url,
        type:'GET',
        dataType: 'jsonp',
        success: successCallback,
        error: function(request, status, error) { 
			log('retrieve JSONP - failure') 
        }
    });
}

// generic successful callback
function successCallback(object) {

    // last fm recent tracks callback
	if(object.recenttracks) {
        var name = findUserAccount('lastfm',object.recenttracks["@attr"].user)
        log('received: '+name+' lastFM recent tracks')

        var nowplaying  
        if(object.recenttracks.track[0]["@attr"])
            nowplaying = 'true'
        else
            nowplaying = 'false'

        // save current song so assocation of lyrics can be made to user
        if(saveReceived(
            {'song': object.recenttracks.track[0].name.toLowerCase(),
             'artist': object.recenttracks.track[0].artist["#text"].toLowerCase(),
             'nowplaying': nowplaying
            ,
            },'lastfm',name
        )) {
            gotLastFMrecent(object, name)		
        }
        else {
            log('already saved')
        }
	}
    else if(object.searchType) {
        //gotLyrics(object)

        // save lyrics to user with song
        var name = findUserWithSong(object.items[0].title,object.items[0].artist)

        saveReceived(
            object.items[0],
            'lyrics',
            name
        )
        log('received lyrics for '+object.items[0].title+' by '+object.items[0].artist+
                ' (associated to '+name+')')

        var div = '#'+name+'_lyrics'
        $('#'+name).append('<div id="'+name+'_lyrics"></div>')

        //divsAdded.push(div)



        // add lyrics to page
        $(div).append('<br />')

        var lyrics = object.items[0].snippet.replace(/[\n\r]/g,'<br />')
        if(lyrics.substring([lyrics.length-6],lyrics.length) != '<br />')
            lyrics += '<br />'

        $(div).append(lyrics)

        $('<a href="'+object.items[0].url+'">...</a>').appendTo($(div));
        $(div).css({'marginLeft':'40px'})
    }
    // failure message
	else {
		log('ERROR or callback undefined')
		log(object)
		//$('#error').append('error :(')
	}	

	//log(object)
    $('#loading').hide()
}

// determine name associated with api call
// useful to associate to dynamic page elements
function findUserAccount(attr,val){
    for(record in obj) {
        if(obj[record].userAccounts[attr] == val)
            return (obj[record].name)
    }
    return 'UNKNOWN' 
}

// determine name associated with song/artist
// useful when trying to associate lyrics to user
function findUserWithSong(song,artist) {
    for(record in obj) {
        if(obj[record].receivedData.lastfm.song == song.toLowerCase() &&
           obj[record].receivedData.lastfm.artist == artist.toLowerCase() ) 
            return obj[record].name
    }
    return 'UNKNOWN'
}

// check if received data is already saved so it can be ignored
function checkSaved(addObject,category,name){

    for(record in obj) {
        if(obj[record].name == name) {
            if(obj[record].receivedData[category]){
                if(JSON.stringify(obj[record].receivedData[category]) == JSON.stringify(addObject)) {
                    return true
                }
            }
        }
    }
    return false
}
// add to person obj array for future reference
function saveReceived(addObject,category,name){

    if(checkSaved(addObject,category,name))
        return false

    for(record in obj) {
        if(obj[record].name == name) {
            obj[record].receivedData[category] = addObject
            log('saving..')
            log(obj)
            return true
        }
    }
}
// last FM recent tracks callback
function gotLastFMrecent(object, name) {


    // name_recenttrack page element
    var div = '#'+name+'_recenttrack'
    $(div).remove()
    $('#'+name+'_lyrics').remove()
    $('#'+name).append('<div id="'+name+'_recenttrack"></div>')
    //divsAdded.push(div)


    // current or last played
    if(object.recenttracks.track[0]["@attr"] && object.recenttracks.track[0]["@attr"].nowplaying) 
        $(div).append('Currently listening to ');
	else 
		$(div).append('Last listened to ')

    // song and artist links
    $('<i><a href="'+object.recenttracks.track[0].url+'">'+object.recenttracks.track[0].name+'</a></i>').appendTo($(div));
    $(div).append(' by ');
    $('<a href="'+object.recenttracks.track[0].url.split('/_/')[0]+'">'+object.recenttracks.track[0].artist["#text"]+'.</a>').appendTo($(div));

    // get lyrics
    call({api:'metrolyrics', method:'lyrics', 
        artist: object.recenttracks.track[0].artist["#text"], 
        song: object.recenttracks.track[0].name});

    return true
}

// get lyrics
function call_lyrics(artist,song){

	var url = 'http://api.metrolyrics.com/v1/search/lyrics/?find='
    url += artist+'%20'+song
    url += '&X-API-KEY='+key['metrolyrics']
    url = url.replace(' ','%20')
    url = url.replace(' ','%20')
    url += '&format=jsonp'     

    log('http://api.metrolyrics.com/v1/method/Lyrics')

    log(url)

    var callLog = 'call to | '
    callLog+= 'api:<a href="http://api.metrolyrics.com">metrolyrics</a> | '
    callLog+= 'method:<a href="http://api.metrolyrics.com/v1/method/Lyrics">lyrics</a> | '
    callLog+= 'artist: '+artist+' | '
    callLog+= 'song: '+song+' | '
    callLog+='<a href="'+url+'">url</a>'

    log(callLog)


    getJSONP(url)

}













