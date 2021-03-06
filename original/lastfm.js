var debug = true
var refresh = 0 //30000
var artCount = 0

// api keys
var key = new Object()
key['lastfm'] = '774632169e435ce88f4f48a0d377cf25'

// initialize
function init() {
    // toggle debugging
    if(debug) {
        log('debugging enabled - WARNING THERE BE DRAGONS')
        log('refresh interval set to '+refresh/1000+' seconds')
    }
    else {
        $('#debug').hide()
    }

    // set refresh interval
    if(refresh > 0)
        setInterval(function(){loop()},refresh);

    // user area
    newDiv('users')
    newDiv('albumArt')
    newDiv('albumArt','currentArt')
    newDiv('artistPeriod')
    newDiv('artist')

    // append user sections to page body
    for(record in obj) {
        // create user elements per name in array  
        newDiv ('users',obj[record].name)
        $('#'+obj[record].name).append('<a href="http://last.fm/user/'+
            obj[record].userAccounts.lastfm+'">'+
            obj[record].name+'</a>...')
    }
}

// add new div - overloaded
// one parameter: add to container
// two parameters: add child to parent container
function newDiv(parent, child) {
    if(!child)
        $('.container').append('<div id="'+parent+'"></div>')
    else
    {
         // avoid accidentally adding pound symbol
        if(child[0] == '#')
            child = child.substring(1)
        $('#'+parent).append('<div id="'+child+'"></div>')
    }
}

// on loop
function loop() {
    $('#debug').empty()
    log('refresh '+Date()+'<br />')

    // make api calls for each name
	for(record in obj) {
        // get recent last FM played tracks
        call({api:'lastfm', method:'user.getRecentTracks', user: obj[record].userAccounts.lastfm, limit: 2});
	}
}

// debug logging
function log(message,overrule) {
    if(!debug) return

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

    // determine which API is being called
    if(vars.api == 'lastfm')
        call_lastfm(vars)
    else if(object.artisttracks) {
        gotArtistTracks(object)
    }
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

    // debug, log API call verbose
    if(debug)
    {
        var callLog = 'call to '
        callLog+='<a href="'+url+'">url</a> |'
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

        log(callLog)
    }

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
    // top artist callback
    else if(object.topartists) {
        var name = findUserAccount('lastfm',object.topartists["@attr"].user)
        log('received: '+name+' lastFM top artists')
        log(object)
        gotLastFMartists(object,name)
    }
    // single artist & tracks callback
    else if(object.artisttracks) {
        gotArtistTracks(object)
    }
    // failure message
	else {
		log('ERROR or callback undefined')
		log(object)
	}	
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

// save new recieved data for person
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
    var lastfm
    for(record in obj) {
        if(obj[record].name == name) {
            lastfm = obj[record].userAccounts.lastfm
        }
    }

    recenttrackDiv = '#'+name+'_recenttrack'
    newDiv('users',recenttrackDiv)

    // current or last played
    if(object.recenttracks.track[0]["@attr"] && object.recenttracks.track[0]["@attr"].nowplaying) 
        $(recenttrackDiv).append('Currently listening to ');
	else 
		$(recenttrackDiv).append('Last listened to ')

    // song and artist links
    $('<i><a href="'+object.recenttracks.track[0].url+'">'+object.recenttracks.track[0].name+'</a></i>').appendTo($(recenttrackDiv));
    $(recenttrackDiv).append(' by ');
    $('<a href="'+object.recenttracks.track[0].url.split('/_/')[0]+'">'+object.recenttracks.track[0].artist["#text"]+'.</a>').appendTo($(recenttrackDiv));

    addArt(object) 

    return true
}

// last FM top artists
function gotLastFMartists(object,name) {
    // duration (currently statically last week)
    $('#artistPeriod').append('Top Artists for the last week')
    var type =  object.topartists["@attr"].type
    log('top artist interval: '+type)

    var flip = false
    var max,min
    max = object.topartists.artist[0].playcount
    min = object.topartists.artist[object.topartists.artist.length-1].playcount

    // for each artists 
    for(a in object.topartists.artist) {

        // determine size threshold for font
        size = parseInt(object.topartists.artist[a].playcount)
        size += 8 
        if(size > 40) size=40
        log(object.topartists.artist[a].name+', '+object.topartists.artist[a].playcount+' plays, (font size: '+Math.round(size)+')')

        // add new artist to page
        newArtist = '#'+htmlEsc(object.topartists.artist[a].name)
        newDiv('artist',newArtist)
        $(newArtist).append('<a href="'+object.topartists.artist[a].url+'">'+newArtist.substring(1)+'</a>')
        $(newArtist).css('height',size-size/6+'px')
        $(newArtist).css('font-size',size)
        $(newArtist).css('margin','2px')
        if(flip){
           $(newArtist).css('font-style','italic')
        }
        flip = !flip //flop

        // call for last FM last song listened to of..
        call({api:'lastfm', method:'user.getArtistTracks', user: obj[record].userAccounts.lastfm, artist:htmlReplace(object.topartists.artist[a].name),limit:1});
    }

}

function gotArtistTracks(object) {
    log(object)
    if(object.artisttracks["@attr"].items > 1) {
        $('#'+htmlEsc(object.artisttracks["@attr"].artist)).append(
        ' - <a href="'+object.artisttracks.track.url+'" style="color:gray">'+object.artisttracks.track.name+'</a>'
        )
        addArt(object)
    }
    else {
        $('#'+htmlEsc(object.artisttracks["@attr"].artist)).append(
        ' - '+object.artisttracks.track.name
        )
        $('#'+htmlEsc(object.artisttracks["@attr"].artist)).css('height','100%')
        addArt(object)
    } 
}

// generic add art
function addArt(object) {
    // recently or currently played
    if(object.recenttracks) {
        if(object.recenttracks.track[0]){
            addCurrentArtToPage(
                'current',
                object.recenttracks.track[0].image[3]["#text"],
                300,
                object.recenttracks.track[0].url

            )
        }
        else if(object.recenttracks.track){
            addCurrentArtToPage(
                'current',
                object.recenttracks.track.image[3]["#text"],
                300,
                object.recenttracks.track.url
            )
        }
    }
    // artist in general
    else if (object.artisttracks) {
      if(object.artisttracks.track[0]) {
            addArtToPage(
                htmlEsc(object.artisttracks.track[0].name),
                object.artisttracks.track[0].image[2]["#text"],126,
                object.artisttracks.track[0].url
            )
      }
      else if (object.artisttracks.track) {
            addArtToPage(
                htmlEsc(object.artisttracks.track.name),
                object.artisttracks.track.image[2]["#text"],126,
                object.artisttracks.track.url
            )
      }
    }
}

// add art to specific page element
function addArtToPage(div,img,size,url) {
    div = htmlEsc(div)

    if(img =='')
        return

    artCount += 1
    if(artCount >21)
        return

    if(!size) size = 126

    newDiv('albumArt',div)
    div = '#'+div
    $(div).css('height',size*0.8)
    $(div).css('width',size*0.8)
    $(div).css('margin-right','30px')

    $(div).css('float','left')
    $(div).append('<a href="'+url+'"><img src="'+img+'" height="'+size*0.8+'" width="'+size*0.8+'" style="float:left;"></a>')
}

// handle current differently (size and static placement)
function addCurrentArtToPage(div,img,size,url) {
    if(img =='')
        return

    $('#currentArt').html(
      '<a href="'+url+'"><img src="'+img+'" height="'+size*0.8+'" width="'+size*0.8+'" style="float:left;"></a>'
      )
}


function htmlReplace(str) {
    return String(str)
            .replace(/[&]/g,'%26')
//            .replace(/[' &']/g,'%20')
}

function htmlEsc(str) {
    return String(str)
            .replace(/['.& ]/g, '')
            .replace(/[!]/g,'');
}







