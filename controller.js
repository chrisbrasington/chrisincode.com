debug = false;

// intialization
function init() {
    doneLoading();
    if(!debug)
        $('#footer').hide();
}

polarChart;

// thundercats ho!
$(document).ready(function() {
    init();

    // create page elements
    newDiv('users');
    newDiv('albumArt');
    newDiv('albumArt','currentArt');
    newDiv('artist');
    //newDiv('artist','artistPeriod')
    
    // loop users
    for(record in model) {

        // user area
        newDiv('users', model[record].name);

        // get recent tracks
        call({  api:lastfm, 
                method:'user.getRecentTracks', 
                user: model[record].userAccounts.lastfm, 
                limit: 2},
            recentTracksCallback
        );

        // get top artists
        call({  api:lastfm, 
                method:'user.getTopArtists', 
                user: model[record].userAccounts.lastfm, 
                period:'7day',
                limit:50},
            [topArtistCallback, topArtistChartCallback]
        );
    }
});

// find user in model based on api account
function findUserAccount(attr,val){
    for(record in model) {
        if(model[record].userAccounts[attr] == val)
            return (model[record].name);
    }
    return 'UNKNOWN' ;
}
