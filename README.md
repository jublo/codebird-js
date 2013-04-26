codebird-js
Copyright (C) 2011-2013 J.M. <me@mynetx.net>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.


This is the JScript version of the Codebird library.
It was originally introduced in the Tweet2PSM Messenger Plus! script.
When using in other JScript environments (such as node.js),
you should modify the way how calls to external servers are done.

Quick setup for read-only apps
==============================

Here is a quick setup for JavaScript. Check the functions to find out the fill-ins.

```javascript
var cb = new Codebird();
cb.setConsumerKey("<fill in>","<fill in>");
cb.setToken('<fill in>','<fill in>');  
	
cb.__call('statuses/userTimeline', {
    'screen_name' : '<fill in>',
    'count': '3'
    },
    tweets_callback
);

function tweets_callback (result)
{
 	// do something with the result 
}
```

**Heads up** 
Because the Consumer Key and Token Secret are available in the code 
it is important that you configure your app as read-only at Twitter.
