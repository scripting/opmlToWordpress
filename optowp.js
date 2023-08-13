var myProductName = "opmlToWordpress", myVersion = "0.4.0";

const fs = require ("fs");
const utils = require ("daveutils");
const davehttp = require ("davehttp");
const opml = require ("opml");
const wordpress = require ("wordpress"); 

var config = {
	port: process.env.PORT || 3231,
	flAllowAccessFromAnywhere: true, 
	flLogToConsole: true,
	users: new Array ()
	};

var stats = {
	savedPosts: new Array ()
	};
var flStatsChanged = true;
const fnameStats = "stats.json";

function statsChanged () {
	flStatsChanged = true;
	}
function readConfig (f, config, callback) {
	fs.readFile (f, function (err, jsontext) {
		if (!err) {
			try {
				var jstruct = JSON.parse (jsontext);
				for (var x in jstruct) {
					config [x] = jstruct [x];
					}
				}
			catch (err) {
				console.log ("Error reading " + f);
				}
			}
		callback ();
		});
	}

function notComment (item) { //11/5/20 by DW
	return (!utils.getBoolean (item.isComment));
	}
function getItemSubs (itemFromOutline) { //get the text from the subs
	var theText = "";
	if (itemFromOutline.subs !== undefined) {
		itemFromOutline.subs.forEach (function (item) {
			const itemText = (item.text === undefined) ? "" : "<p>" + item.text + "</p>\n" ;
			theText += itemText + getItemSubs (item);
			});
		}
	return (theText);
	}
function getRenderedText (theText) {
	return (theText); //placeholder
	}
function getSavedPost (siteurl, created) {
	var theSavedPost = undefined;
	stats.savedPosts.forEach (function (item) {
		if ((item.siteurl == siteurl) && (item.created == created)) {
			theSavedPost = item;
			}
		});
	return (theSavedPost);
	}
function postChanged (theNewPost, theSavedPost) {
	var flchanged = false;
	if ((theNewPost.title != theSavedPost.title) || (theNewPost.content != theSavedPost.content)) {
		flchanged = true;
		theSavedPost.title = theNewPost.title;
		theSavedPost.content = theNewPost.content;
		statsChanged ();
		}
	return (flchanged);
	}
function processOutline (theUser, theOutline, callback) {
	var theLog = new Array ();
	const client = wordpress.createClient ({
		url: theUser.siteurl,
		username: theUser.username,
		password: theUser.password
		});
	function getPostList () {
		var thePostList = new Array ();
		theOutline.opml.body.subs.forEach (function (theMonth) {
			if (theMonth.subs !== undefined) {
				theMonth.subs.forEach (function (theDay) {
					if (theDay.subs !== undefined) {
						theDay.subs.forEach (function (item) {
							if (notComment (item)) {
								if ((item.type !== undefined) && (item.type == "outline")) {
									thePostList.push (item);
									}
								}
							});
						}
					});
				}
			});
		return (thePostList);
		}
	function processPost (itemFromOutline, callback) {
		var thePost = {
			title: "",
			content: "",
			status: "publish" //omit this to create a draft that isn't published
			};
		if (itemFromOutline.subs === undefined) { //singular item
			thePost.content = getRenderedText (itemFromOutline.text);
			}
		else { //titled item
			thePost.title = itemFromOutline.text;
			thePost.content = getItemSubs (itemFromOutline);
			}
		var savedPost = getSavedPost (theUser.siteurl, itemFromOutline.created);
		if (savedPost === undefined) {
			client.newPost (thePost, function (err, idNewPost) {
				if (err) {
					callback (err);
					}
				else {
					const theSavedPost = {
						title: thePost.title,
						content: thePost.content,
						id: idNewPost,
						created: itemFromOutline.created,
						siteurl: theUser.siteurl
						}
					stats.savedPosts.push (theSavedPost);
					statsChanged ();
					callback (undefined, "newPost: id == " + idNewPost + ".");
					}
				});
			}
		else {
			if (postChanged (thePost, savedPost)) {
				client.editPost (savedPost.id, thePost, function (err) {
					if (err) {
						callback (err);
						}
					else {
						callback (undefined, "editPost: id == " + savedPost.id + ".");
						}
					});
				}
			else {
				callback ();
				}
			}
		}
	const thePostList = getPostList ();
	function doNextPost (ix) {
		if (ix < thePostList.length) {
			processPost (thePostList [ix], function (err, whatWeDid) {
				if (err) {
					theLog.push (err.message);
					}
				else {
					if (whatWeDid !== undefined) {
						theLog.push (whatWeDid);
						}
					}
				doNextPost (ix + 1);
				});
			}
		else {
			if (theLog.length == 0) {
				theLog.push ("Nothing new, nothing changed.");
				}
			callback (undefined, theLog);
			}
		}
	doNextPost (0);
	}

function handlePing (urlBlogOpml, callback) { 
	console.log ("handlePing: urlBlogOpml == " + urlBlogOpml);
	config.users.forEach (function (theUser) {
		if (theUser.opmlurl == urlBlogOpml) {
			console.log ("handlePing: theUser == " + utils.jsonStringify (theUser));
			opml.readOutline (theUser.opmlurl, function (err, theOutline) {
				if (err) {
					callback (err);
					}
				else {
					processOutline (theUser, theOutline, callback);
					}
				});
			}
		});
	}
function handleHttpRequest (theRequest) {
	var now = new Date ();
	const params = theRequest.params;
	const token = params.oauth_token;
	const secret = params.oauth_token_secret;
	function returnRedirect (url, code) { 
		var headers = {
			location: url
			};
		if (code === undefined) {
			code = 302;
			}
		theRequest.httpReturn (code, "text/plain", code + " REDIRECT", headers);
		}
		
	function returnPlainText (s) {
		theRequest.httpReturn (200, "text/plain", s.toString ());
		}
	function returnData (jstruct) {
		if (jstruct === undefined) {
			jstruct = {};
			}
		theRequest.httpReturn (200, "application/json", utils.jsonStringify (jstruct));
		}
	function returnJsontext (jsontext) { //9/14/22 by DW
		theRequest.httpReturn (200, "application/json", jsontext.toString ());
		}
	function returnError (jstruct) {
		theRequest.httpReturn (500, "application/json", utils.jsonStringify (jstruct));
		}
	function returnOpml (err, opmltext) {
		if (err) {
			returnError (err);
			}
		else {
			theRequest.httpReturn (200, "text/xml", opmltext);
			}
		}
	function httpReturn (err, returnedValue) {
		if (err) {
			returnError (err);
			}
		else {
			if (typeof returnedValue == "object") {
				returnData (returnedValue);
				}
			else {
				returnJsontext (returnedValue); //9/14/22 by DW
				}
			}
		}
	function xmlReturn (err, xmltext) { //9/17/22 by DW
		if (err) {
			returnError (err);
			}
		else {
			theRequest.httpReturn (200, "text/xml", xmltext);
			}
		}
	function callWithScreenname (callback) {
		davetwitter.getScreenName (token, secret, function (screenname) {
			if (screenname === undefined) {
				returnError ({message: "Can't do the thing you want because the accessToken is not valid."});    
				}
			else {
				callback (screenname);
				}
			});
		}
	switch (theRequest.method) {
		case "GET":
			switch (theRequest.lowerpath) {
				case "/now": 
					returnPlainText (new Date ().toString ());
					return (true);
				case "/ping": 
					handlePing (params.url, httpReturn);
					return (true);
				default: 
					return (false); //not consumed
				}
			break;
		}
	return (false); //not consumed
	}
function everySecond () {
	if (flStatsChanged) {
		fs.writeFile (fnameStats, utils.jsonStringify (stats), function (err) {
			if (err) {
				console.log ("writing stats.json: err.message == " + err.message);
				}
			});
		flStatsChanged = false;
		}
	}

readConfig (fnameStats, stats, function ()  {
	readConfig ("config.json", config, function ()  {
		davehttp.start (config, handleHttpRequest);
		setInterval (everySecond, 1000);
		});
	});




