artCount = 0;

// lastFM API caller
// callback passed in
function lastfm(params, callBack)
{
	// remove function call to this function
	delete(params['api']);

	url = 'http://ws.audioscrobbler.com/2.0/?';
	url += 'api_key='+key.lastfm;
	url += '&format=json';

	// build dynamic part of api call
	for(p in params) {
		url += '&'+p+'='+params[p];
	}

	log('lastfm call to: '+linkify(url,'url'));

	call({url:url,callBack:callBack});
}

// get friends callback
function friendsCallback(obj)
{
	log("I am the friends callback");
	log(obj);
}

// recent tracks callback
function recentTracksCallback (obj)
{
	// get recent track information
	user = obj.recenttracks["@attr"].user;
	artist = obj.recenttracks.track[0].artist["#text"];
	track = obj.recenttracks.track[0].name;
	url = obj.recenttracks.track[0].url;
	div = '#'+findUserAccount('lastfm',user);	
	if(obj.recenttracks.track[0]["@attr"])
		nowPlaying = true;
	else
		nowPlaying = false;

	log('received recent tracks for '+div.substring(1),obj);

	// add to page
	// user currently or last listened to...
	$(div).append(linkify('http://last.fm/user/'+user,div.substring(1))+'...');
	div += '_recenttrack';
	newDiv('users',div);
	if(typeof(nowPlaying)=='obj')
		$(div).append('Currentling listening to ');
	else
		$(div).append('Last listened to ');
	$(div).append(linkify(url,track));
	$(div).append(' by ');
	$(div).append(linkify('http://last.fm/music/'+htmlEsc(artist),artist));
}

// top artists callback
function topArtistCallback (obj)
{
	// user information
	newDiv('artist');
	user = obj.topartists["@attr"].user;
	name = findUserAccount('lastfm',obj.topartists["@attr"].user);
    log('received: lastFM top artists for '+name, obj);

	// duration (currently statically last week)
    //$('#artistPeriod').append('Top Artists for the last week')
    var type =  obj.topartists["@attr"].type;
    log('top artist interval: '+type);
    
    // max/min font sizes
    var flip = false;
    var max,min;
    max = obj.topartists.artist[0].playcount;
    min = obj.topartists.artist[obj.topartists.artist.length-1].playcount;

    // for each artists 
    for(a in obj.topartists.artist) {

    	// artist information
    	artist = obj.topartists.artist[a].name;
    	playCount = obj.topartists.artist[a].playcount;

        // determine size threshold for font
        size = parseInt(playCount);
        size += 8 ;
        if(size > 30) size=30;
        log(artist+', '+playCount+' plays, (font size: '+Math.round(size)+')');

        // add new artist to page
        newArtist = '#'+htmlEsc(obj.topartists.artist[a].name);
        newDiv('artist',newArtist);
        $(newArtist).append('<a href="'+obj.topartists.artist[a].url+'">'+newArtist.substring(1)+'</a>');
        $(newArtist).css('height',size-size/6+'px');
        $(newArtist).css('font-size',size);
        $(newArtist).css('margin','2px');
        //$(newArtist).css('padding-left','100px')
        //$(newArtist).css('float','left')
        if(flip){
           $(newArtist).css('font-style','italic');
        }
        flip = !flip; //flop

        // call for last FM last song listened to of..
        call({	api:lastfm, 
        		method:'user.getArtistTracks', 
        		user: user, 
        		artist:htmlReplace(obj.topartists.artist[a].name),
        		limit:1},
        		artistTrackCallback
        	);
    }
}

function wtfCallback(obj)
{
	log('wtf');
	log(obj);
}


// track callback
function artistTrackCallback(obj) {
    // track information
    track = obj.artisttracks.track.name;
    if(track.indexOf('(')> -1 );
	    track = track.split('(')[0];
    if(track.indexOf('-')> -1 );
	    track = track.split('-')[0];


    artist = htmlEsc(obj.artisttracks["@attr"].artist);
    url = obj.artisttracks.track.url;

    if(obj.artisttracks["@attr"].items > 1) {
        $('#'+artist).append(
        ' - <a href="'+url+'" style="color:gray">'+track+'</a>'
        );
        addArt(obj);
    }
    else {
        $('#'+artist).append(' - '+track);
        $('#'+artist).css('height','100%');
        addArt(obj);
    } 

    log('received '+artist+': '+track,obj);
}

// generic add art
function addArt(obj) {
    // recently or currently played
    if(obj.recenttracks) {
        if(obj.recenttracks.track[0]){
            addCurrentArtToPage(
                'current',
                obj.recenttracks.track[0].image[3]["#text"],
                300,
                obj.recenttracks.track[0].url
            );
        }
        else if(obj.recenttracks.track){
            addCurrentArtToPage(
                'current',
                obj.recenttracks.track.image[3]["#text"],
                300,
                obj.recenttracks.track.url
            );
        }
    }
    // artist in general
    else if (obj.artisttracks) {
      if(obj.artisttracks.track[0]) {
            addArtToPage(
                htmlEsc(obj.artisttracks.track[0].name),
                obj.artisttracks.track[0].image[2]["#text"],126,
                obj.artisttracks.track[0].url
            );
      }
      else if (obj.artisttracks.track) {
            addArtToPage(
                htmlEsc(obj.artisttracks.track.name),
                obj.artisttracks.track.image[2]["#text"],126,
                obj.artisttracks.track.url
            );
      }
    }
}

// add art to specific page element
function addArtToPage(div,img,size,url) {
    div = htmlEsc(div);

    if(img =='')
        return;

    artCount += 1;

    if(artCount >11)
        return;

    if(!size) size = 126;

    newDiv('albumArt',div);
    div = '#'+div;
    $(div).css('height',size*0.8);
    $(div).css('width',size*0.8);
    $(div).css('margin-right','30px');

    $(div).css('float','left');
    $(div).append('<a href="'+url+'"><img src="'+img+'" height="'+size*0.8+'" width="'+size*0.8+'" style="float:left;"></a>');
}

// handle current differently (size and static placement)
function addCurrentArtToPage(div,img,size,url) {
    if(img =='')
        return;

    $('#currentArt').html(
      '<a href="'+url+'"><img src="'+img+'" height="'+size*0.8+'" width="'+size*0.8+'" style="float:left;"></a>'
     );
}

// top artist callback chart
function topArtistChartCallback(obj)
{
	polarChart = $("#polarChart").get(0).getContext("2d");
    var myNewChart = new Chart(polarChart);

	data = [];

    colors = 
    [
		'#1d0843',
		'#2e1243',
		'#401c44',
		'#512644',
		'#623044',
		'#743a45',
		'#854445',
		'#964d45',
		'#b96146',
		'#ca6b46',
		'#db7546',
		'#ed7f47',
		'#fe8947'
    ];

    count = 0;

    for(a in obj.topartists.artist) {
        n = obj.topartists.artist[a].name;
        val = obj.topartists.artist[a].playcount;
        //log(name + ' - '+ count)
        //plays[name] = count
        data.push({name:n,value:val*10,color:colors[count%10]});
        if(count > 8)
            break;
        count = count + 1;
    }


    /*
    data = [
    {
        value: 30,
        color:"#F7464A"
    },
    {
        value : 50,
        color : "#E2EAE9"
    },
    {
        value : 100,
        color : "#D4CCC5"
    },
    {
        value : 40,
        color : "#949FB1"
    },
    {
        value : 120,
        color : "#4D5360"
    }

    ]
    */

    polarCustomOptions = {
                
    //Boolean - Whether we show the scale above or below the chart segments
    scaleOverlay : true,
    
    //Boolean - If we want to override with a hard coded scale
    scaleOverride : false,
    
    //** Required if scaleOverride is true **
    //Number - The number of steps in a hard coded scale
    scaleSteps : null,
    //Number - The value jump in the hard coded scale
    scaleStepWidth : null,
    //Number - The centre starting value
    scaleStartValue : null,
    
    //Boolean - Show line for each value in the scale
    scaleShowLine : true,
    
    //String - The colour of the scale line
    scaleLineColor : "rgba(0,0,0,.1)",
    
    //Number - The width of the line - in pixels
    scaleLineWidth : 1,
    
    //Boolean - whether we should show text labels
    scaleShowLabels : true,
    
    //Interpolated JS string - can access value
    scaleLabel : "<%=value/10%>",
    
    //String - Scale label font declaration for the scale label
    scaleFontFamily : "'Arial'",
    
    //Number - Scale label font size in pixels  
    scaleFontSize : 12,
    
    //String - Scale label font weight style    
    scaleFontStyle : "normal",
    
    //String - Scale label font colour  
    scaleFontColor : "#666",
    
    //Boolean - Show a backdrop to the scale label
    scaleShowLabelBackdrop : true,
    
    //String - The colour of the label backdrop 
    scaleBackdropColor : "rgba(255,255,255,0.75)",
    
    //Number - The backdrop padding above & below the label in pixels
    scaleBackdropPaddingY : 2,
    
    //Number - The backdrop padding to the side of the label in pixels  
    scaleBackdropPaddingX : 2,

    //Boolean - Stroke a line around each segment in the chart
    segmentShowStroke : true,
    
    //String - The colour of the stroke on each segement.
    segmentStrokeColor : "#fff",
    
    //Number - The width of the stroke value in pixels  
    segmentStrokeWidth : 2,
    
    //Boolean - Whether to animate the chart or not
    animation : true,
    
    //Number - Amount of animation steps
    animationSteps : 100,
    
    //String - Animation easing effect.
    animationEasing : "easeOutBounce",

    //Boolean - Whether to animate the rotation of the chart
    animateRotate : true,
    
    //Boolean - Whether to animate scaling the chart from the centre
    animateScale : false,

    //Function - This will fire when the animation of the chart is complete.
    onAnimationComplete : null,

    
};




    new Chart(polarChart).PolarArea(data, polarCustomOptions);
    //log(JSON.stringify(data))


    for(d in data) {
        log(data[d].name + ' listened to ' + data[d].value/10 + ' - color value: ' + data[d].color);
        

        $('#polarChartInfo').append('<div class="color-box" style="background-color: '+data[d].color+'; height:10px; width:10px; float:left;"></div>');
        $('#polarChartInfo').append(data[d].name);
        $('#polarChartInfo').append('<br />'); // you're such a hack job of a web dev sometimes

    }
}
