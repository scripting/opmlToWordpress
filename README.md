# opmlToWordpress

A Node.js app that keeps outlines in sync with WordPress sites.

### How to

To run an instance of this app:

1. Download the contents of this repo.

2. Edit config.json, replace the values of username, siteurl, and password to match your wordpress.com login info. 

3. Change the value of opmlurl to point to a calendar-structured outline.

4. CD into the directory you downloaded. 

5. Run <i>npm install</i> at the command line. 

6. Then node <i>optowp.js</i> to launch the server.

### What is a calendar-structured outline?

It's an OPML file that's organized like a calendar in a particular way with headlines with the correct attributes. There is no spec for this, there probably should. You can easily create one using Drummer, see the blogging docs. or follow the example of the Scripting News OPML file, it is a calendar-structured OPML file. 

### Calling your server

If your server is at myoptowp.com and your outline is at hello.com/myoutline.opml, you'd call it this way:

http://myoptowp.com/ping?url=http://hello.com/myoutline.opml

It returns info about what it did. 

Note: this will only work if the outline you entered in step 3 above matches the outline you call it with in the URL above. 

### If you're using Drummer (todo)

You can set up a command in the Scripts menu to call the server to rebuild your WordPress posts with a simple call. I'll write this up in a bit. 

### Notes

We only rebuild posts that have changed since the last ping. 

### My instance

I'm running an instance of this app at optowp.scripting.com.

http://optowp.scripting.com/

If we're working together on something I'd be happy to set it up so you can use it. 

