// generic JSON request and callbacks
function getJSON(url, callBack) {
	log(url);
	$.ajax({
	        url: url,
            type: "get",
            crossDomain: true,
	        dataType: 'json',
	        success: function(data){
	        	if(typeof(callBack) =='function')
	        		callBack(data);
	        	else if(typeof(callBack) =='object')
	        	{
	        		for(c in callBack) {
	        			callBack[c](data);
	        		}
	        	}
	        	else
	        	{
	        		log('no callback specified');
	        		log(data);
	        		log(url);
	        		log(typeof(callBack));
	        		log(callBack);
	        	}
	        },
		error: function(r) { 
			log('retrieve JSON - failure') ;
		}
	});
}

// generic JSONP request and callbacks
function getJSONP(url) {
    $.ajax({
        url:url,
        type:'GET',
        dataType: 'jsonp',
        success: function(data){
	        	if(typeof(callBack) =='function')
	        		callBack(data);
	        	else
	        	{
	        		log('no callback specified');
	        		log(data);
	        	}
	        },
		error: function(r) { 
			log('retrieve JSONP - failure') ;
		}
    });
}

// call will determine which API is being called
function call(params,callBack) {
	if(params.api)
	{
		if(typeof(params.api) != 'function')
			throw('pass API param as a function!');
		else
			params.api(params,callBack);
	}
	else
		getJSON(params.url,params.callBack);
}