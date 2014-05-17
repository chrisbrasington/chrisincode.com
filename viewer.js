// create html links
function linkify(url, text) {

	return '<a href="'+url+'">'+text+'</a>';
}

// debug logging
function log(message, obj) {
    if(!debug) return

    // console logging    
    console.log(message);

    // logging to page: objects (skipped), urls, and text
    if(typeof(message) == 'object'){
        //$("#debug").append(JSON.stringify(message))
        return;
    }
    else if(typeof(message) == 'string'){
        if(message.substring(0,4) ==  'http') {
            //$('<i><a href="'+message+'">'+message+'</a></i>').appendTo($('#debug'));
            //$("#debug").append('<br />')
        }
        else {
            $("#debug").append(message);
            $("#debug").append('<br />');
        }
    }
    else {
    	// empty, newline 
        $("#debug").append(message);
        $("#debug").append('<br />');
    }
    if(typeof(obj)=='object')
    	log(obj);

}
function lol(message)
{
	$("#debug").append(message);
}

// done loading page
function doneLoading() {

    $('#loading').hide();
}

// add new div - overloaded
// one parameter: add to container
// two parameters: add child to parent container
function newDiv(parent, child) {
    if(!child)
        $('.container').append('<div id="'+parent+'"></div>');
    else
    {
         // avoid accidentally adding pound symbol
        if(child[0] == '#')
            child = child.substring(1);
        $('#'+parent).append('<div id="'+child+'"></div>');
    }
}

// html character escape
function htmlEsc(str) {
    return String(str)
            .replace(/['.& ]/g, '')
            .replace(/[!]/g,'');
}

// html replace
function htmlReplace(str) {
    return String(str)
            .replace(/[&]/g,'%26');
//            .replace(/[' &']/g,'%20';
}