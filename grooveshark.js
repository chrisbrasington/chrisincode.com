/**
 * @author chris
 */
function grooveshark()
{
	log('grooveshark API call method'); log();
	url = 'http://api.grooveshark.com/ws3.php?sig=';
	
	url += key['groovesharkSecret'];
	
	//{'method': 'addUserFavoriteSong', 'parameters': {'songID': 0}, 'header': {'wsKey': 'key', 'sessionID': 'sessionID'}} ;
	
	gKey = key['grooveshark'];
	log(gKey);
	secret = key['groovesharkSecret'];
	log(secret);
	
	test = 
	'http://api.grooveshark.com/ws/3.0/?sig=a890c4a11ef023b90b77d503bd00af2a';
	
	test +=
	'{"method":"getUserIDFromUsername","header":{"wsKey":"lastfm_chris","secret":"0f15a3ea12bd6bbd3fccb35ef4100d"},"parameters":{"username":"raylinth"}}';
	
	
	
	log(linkify(url,url));
	log();
	log(Date());	
}
