debug = true;

// intialization
function init() {
    doneLoading();
    if(!debug)
        $('#footer').hide();
}

// thundercats ho!
$(document).ready(function() {
    init();

    // loop users
    for(record in model) {
		groove(record);
    }
});

// find user in model based on api account
function findUserAccount(attr,val){
    for(record in model) {
        if(model[record].userAccounts[attr] == val)
            return (record);
    }
    return 'UNKNOWN' ;
}
