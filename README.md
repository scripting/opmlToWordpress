# opmlToWordpress

A Node.js app that keeps outlines in sync with WordPress sites.

### Dislcaimer

### How to

To run an instance of this app:

1. Download the contents of this repo.

2. Edit config.json, replace the values of username, siteurl, and password to match your wordpress.com login info. 

3. Change the value of opmlurl to point to a calendar-structured outline. (See <a href="https://github.com/scripting/opmlToWordpress#what-is-a-calendar-structured-outline">below</a>.)

4. CD into the directory you downloaded. 

5. Run <i>npm install</i> at the command line. 

6. Then node <i>optowp.js</i> to launch the server.

### What is a calendar-structured outline?

It's an OPML file that's organized like a calendar in a particular way with headlines with the correct attributes. There is no spec for this, there probably should. You can easily create one using <a href="https://drummer.land/">Drummer</a>, see the <a href="http://docserver.scripting.com/drummer/blogging.opml">blogging docs</a>. or follow the <a href="https://github.com/scripting/Scripting-News/tree/master/blog/opml">example</a> of the Scripting News OPML files, it is a calendar-structured OPML file. 

### Calling your server

If your server is at myoptowp.com and your outline is at hello.com/myoutline.opml, you'd call it this way:

http://myoptowp.com/ping?url=http://hello.com/myoutline.opml

Note: this will only work if the outline you entered in step 3 above matches the outline you call it with. 

### If you're using Drummer

Assuming you have created a public outline, and followed the instructions in the Blogging docs to add an initial post, add a command to your Scripts menu in Drummer, with the title <i>Publish to WordPress.</i> Under the title, enter the following script.

```JavaScriptvar urlOutline = opml.getHeaders ().urlPublic;if (urlOutline === undefined) {	dialog.alert ("Can't publish your outline because it doesn't have an \"urlPublic\" head-level attribute.");	}else { //ping the server	console.log (http.readUrl ("http://optowp.scripting.com/ping?url=" + urlOutline)); 	speaker.beep ()	}```

When you've added or modified a post, choose the command, and your WordPress site should have rebuilt. 

### Notes

* We only rebuild posts that have changed since the last ping. 

* A ping returns information about what it did, which new posts were created and which posts were updated. If nothing changed, it reports that too. 

* I'm running an instance of this app at optowp.scripting.com. If we're working together on something I'd be happy to set it up so you can ping it. 

* Thanks to <a href="https://www.manton.org/">Manton Reece</a>. I just copied the way he did the interface between Drummer and micro.blog. 

