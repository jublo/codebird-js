/**
 * A simple wrapper for the Twitter API
 *
 * @package codebird
 * @version 2.3.0-dev
 * @author J.M. <me@mynetx.net>
 * @copyright 2010-2013 J.M. <me@mynetx.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Define constants
 */
var IMAGETYPE_GIF = 1,
    IMAGETYPE_JPEG = 2,
    IMAGETYPE_PNG = 3;

/**
 * Array.indexOf polyfill
 */
if (! Array.indexOf) {
    Array.prototype.indexOf = function (obj, start) {
        for (var i = (start || 0); i < this.length; i++) {
            if (this[i] == obj) {
                return i;
            }
        }
      return -1;
    };
}

/**
 * A simple wrapper for the Twitter API
 *
 * @package codebird
 * @subpackage codebird-js
 */
var Codebird = function () {

    /**
     * The OAuth consumer key of your registered app
     */
    var _oauth_consumer_key = null;

    /**
     * The corresponding consumer secret
     */
    var _oauth_consumer_secret = null;

    /**
     * The API endpoint to use
     */
    var _endpoint = 'https://api.twitter.com/1.1/';

    /**
     * The API endpoint to use for OAuth requests
     */
    var _endpoint_oauth = 'https://api.twitter.com/';

    /**
     * The API endpoint to use for untransitioned methods
     */
    var _endpoint_old = 'https://api.twitter.com/1/';

    /**
     * The Request or access token. Used to sign requests
     */
    var _oauth_token = null;

    /**
     * The corresponding request or access token secret
     */
    var _oauth_token_secret = null;

    /**
     * The cache to use for the public timeline
     */
    var _statuses_public_timeline_cache = {
        timestamp: false,
        data: false
    };

    /**
     * The file formats that Twitter accepts as image uploads
     */
    var _supported_media_files = [IMAGETYPE_GIF, IMAGETYPE_JPEG, IMAGETYPE_PNG];

    /**
     * The current Codebird version
     */
    var _version = '2.3.0-dev';

    /**
     * Sets the OAuth consumer key and secret (App key)
     *
     * @param string key    OAuth consumer key
     * @param string secret OAuth consumer secret
     *
     * @return void
     */
    var setConsumerKey = function (key, secret) {
        _oauth_consumer_key = key;
        _oauth_consumer_secret = secret;
    };

    /**
     * Gets the current Codebird version
     *
     * @return string The version number
     */
    var getVersion = function () {
        return _version;
    };

    /**
     * Sets the OAuth request or access token and secret (User key)
     *
     * @param string token  OAuth request or access token
     * @param string secret OAuth request or access token secret
     *
     * @return void
     */
    var setToken = function (token, secret) {
        _oauth_token = token;
        _oauth_token_secret = secret;
    };

    /**
     * Parse URL-style parameters into object
     *
     * @param string str String to parse
     * @param array array to load data into
     *
     * @return object
     */
    function parse_str(str, array) {
        // Parses GET/POST/COOKIE data and sets global variables
        //
        // version: 1109.2015
        // discuss at: http://phpjs.org/functions/parse_str    // +   original by: Cagri Ekin
        // +   improved by: Michael White (http://getsprink.com)
        // +    tweaked by: Jack
        // +   bugfixed by: Onno Marsman
        // +   reimplemented by: stag019    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: stag019
        // -    depends on: urldecode
        // +   input by: Dreamer
        // +   bugfixed by: Brett Zamir (http://brett-zamir.me)    // %        note 1: When no argument is specified, will put variables in global scope.
        // *     example 1: var arr = {};
        // *     example 1: parse_str('first=foo&second=bar', arr);
        // *     results 1: arr == { first: 'foo', second: 'bar' }
        // *     example 2: var arr = {};    // *     example 2: parse_str('str_a=Jack+and+Jill+didn%27t+see+the+well.', arr);
        // *     results 2: arr == { str_a: "Jack and Jill didn't see the well." }
        var glue1 = '=',
            glue2 = '&',
            array2 = String(str).replace(/^&?([\s\S]*?)&?$/, '$1').split(glue2),
            i, j, chr, tmp, key, value, bracket, keys, evalStr, that = this,
            fixStr = function (str) {
                return that.urldecode(str).replace(/([\\"'])/g, '\\$1').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
            };
        if (!array) {
            array = this.window;
        }

        for (i = 0; i < array2.length; i++) {
            tmp = array2[i].split(glue1);
            if (tmp.length < 2) {
                tmp = [tmp, ''];
            }
            key = fixStr(tmp[0]);
            value = fixStr(tmp[1]);
            while (key.charAt(0) === ' ') {
                key = key.substr(1);
            }
            if (key.indexOf('\0') !== -1) {
                key = key.substr(0, key.indexOf('\0'));
            }
            if (key && key.charAt(0) !== '[') {
                keys = [];
                bracket = 0;
                for (j = 0; j < key.length; j++) {
                    if (key.charAt(j) === '[' && !bracket) {
                        bracket = j + 1;
                    } else if (key.charAt(j) === ']') {
                        if (bracket) {
                            if (!keys.length) {
                                keys.push(key.substr(0, bracket - 1));
                            }
                            keys.push(key.substr(bracket, j - bracket));
                            bracket = 0;
                            if (key.charAt(j + 1) !== '[') {
                                break;
                            }
                        }
                    }
                }
                if (!keys.length) {
                    keys = [key];
                }
                for (j = 0; j < keys[0].length; j++) {
                    chr = keys[0].charAt(j);
                    if (chr === ' ' || chr === '.' || chr === '[') {
                        keys[0] = keys[0].substr(0, j) + '_' + keys[0].substr(j + 1);
                    }
                    if (chr === '[') {
                        break;
                    }
                }
                evalStr = 'array';
                for (j = 0; j < keys.length; j++) {
                    key = keys[j];
                    if ((key !== '' && key !== ' ') || j === 0) {
                        key = "'" + key + "'";
                    } else {
                        key = eval(evalStr + '.push([]);') - 1;
                    }
                    evalStr += '[' + key + ']';
                    if (j !== keys.length - 1 && eval('typeof ' + evalStr) === 'undefined') {
                        eval(evalStr + ' = [];');
                    }
                }
                evalStr += " = '" + value + "';\n";
                eval(evalStr);
            }
        }
    }

    /**
     * Main API handler working on any requests you issue
     *
     * @param string fn    The member function you called
     * @param array params The parameters you sent along
     *
     * @return mixed The API reply encoded in the set return_format
     */

    var __call = function (fn, params, callback) {
        if (typeof params == 'undefined') {
            var params = {};
        }
        if (typeof this[fn] == 'function') {
            return this[fn](params);
        }
        if (typeof callback == 'undefined' && typeof params == 'function') {
            callback = params;
            params = {};
        } else if (typeof callback == 'undefined') {
            callback = function (reply) {};
        }
        // parse parameters
        var apiparams = {};
        if (typeof params == 'object') {
            apiparams = params;
        } else {
            parse_str(params, apiparams); //TODO
        }

        // map function name to API method
        var method = '';

        // replace _ by /
        var path = fn.split('_');
        for (var i = 0; i < path.length; i++) {
            if (i > 0) {
                method += '/';
            }
            method += path[i];
        }
        // undo replacement for URL parameters
        var url_parameters_with_underscore = ['screen_name'];
        for (i = 0; i < url_parameters_with_underscore.length; i++) {
            var param = url_parameters_with_underscore[i].toUpperCase();
            var replacement_was = param.split('_').join('/');
            method = method.split(replacement_was).join(param);
        }

        // replace AA by URL parameters
        var method_template = method;
        var match = [];
        if (match = method.match('/[A-Z_]{2,}/')) {
            for (var i = 0; i < match.length; i++) {
                var param = match[i];
                var param_l = param.toLowerCase();
                method_template = method_template.split(param).join(':' + param_l);
                if (typeof apiparams[param_l] != 'undefined') {
                    for (j = 0; j < 26; j++) {
                        method_template = method_template.split(String.fromCharCode(65 + j)).join('_' + String.fromCharCode(97 + j));
                    }
                    c('To call the templated method "' + method_template + '", specify the parameter value for "' + param_l + '".');
                }
                method = method.split(param).join(apiparams[param_l]);
                delete apiparams[param_l];
            }
        }

        // replace A-Z by _a-z
        for (i = 0; i < 26; i++) {
            method = method.split(String.fromCharCode(65 + i)).join('_' + String.fromCharCode(97 + i));
            method_template = method_template.split(String.fromCharCode(65 + i)).join('_' + String.fromCharCode(97 + i));
        }

        var httpmethod = _detectMethod(method_template, apiparams);
        var multipart = _detectMultipart(method_template);

        return _callApi(httpmethod, method, method_template, apiparams, multipart, callback);
    };

    /**
     * Uncommon API methods
     */

    /**
     * The public timeline is cached for 1 minute
     * API method wrapper
     *
     * @param mixed Any parameters are sent to __call, untouched
     *
     * @return mixed The API reply
     */
    var statuses_publicTimeline = function (mixed) {
        if (typeof mixed == 'undefined') {
            var mixed = null;
        }
        if (_statuses_public_timeline_cache['timestamp'] && _statuses_public_timeline_cache['timestamp'] + 60 > Math.round(new Date().getTime() / 1000)) {
            return _statuses_public_timeline_cache['data'];
        }
        var reply = __call('statuses_publicTimeline', arguments);
        if (reply.httpstatus == 200) {
            _statuses_public_timeline_cache = {
                timestamp: Math.round(new Date().getTime() / 1000),
                data: reply
            };
        }
        return reply;
    };

    /**
     * Gets the OAuth authenticate URL for the current request token
     *
     * @return string The OAuth authenticate URL
     */
    var oauth_authenticate = function () {
        if (_oauth_token == null) {
            c('To get the authenticate URL, the OAuth token must be set.');
        }
        return _endpoint_oauth + 'oauth/authenticate?oauth_token=' + _url(_oauth_token);
    };

    /**
     * Gets the OAuth authorize URL for the current request token
     *
     * @return string The OAuth authorize URL
     */
    var oauth_authorize = function () {
        if (_oauth_token == null) {
            c('To get the authorize URL, the OAuth token must be set.');
        }
        return _endpoint_oauth + 'oauth/authorize?oauth_token=' + _url(_oauth_token);
    };

    /**
     * Signing helpers
     */

    /**
     * URL-encodes the given data
     *
     * @param mixed data
     *
     * @return mixed The encoded data
     */
    var _url = function (data) {
        if (typeof data == 'array') {
            return array_map([ // TODO
            this, '_url'], data);
        } else if ((/boolean|number|string/).test(typeof data)) {
            return encodeURIComponent(data).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A');
        } else {
            return '';
        }
    }

    /**
     * Gets the base64-encoded SHA1 hash for the given data
     *
     * @param string data The data to calculate the hash from
     *
     * @return string The hash
     */
    var _sha1 = function (data) {
        if (_oauth_consumer_secret == null) {
            c('To generate a hash, the consumer secret must be set.');
        }
        if (typeof b64_hmac_sha1 != 'function') {
            c('To generate a hash, the Javascript SHA1.js must be available.');
        }
        b64pad = '=';
        return b64_hmac_sha1(_oauth_consumer_secret + '&' + (_oauth_token_secret != null ? _oauth_token_secret : ''), data);
    };

    /**
     * Generates a (hopefully) unique random string
     *
     * @param int optional length The length of the string to generate
     *
     * @return string The random string
     */
    var _nonce = function (length) {
        if (typeof length == 'undefined') {
            var length = 8;
        }
        if (length < 1) {
            c('Invalid nonce length.');
        }
        var nonce = '';
        for (var i = 0; i < length; i++) {
            var character = Math.floor(Math.random() * 61);
            nonce += '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.substring(character, character + 1);
        }
        return nonce;
    };

    /**
     * Sort an array by key
     *
     * @param array a The array to sort
     * @return array The sorted array
     */
    var _ksort = function (a) {
        var b = {},
        f = [],
            c, d, e = [];
        for (d in a) a.hasOwnProperty && f.push(d);
        f.sort(function (g, h) {
            if (g > h) return 1;
            if (g < h) return -1;
            return 0
        });
        for (c = 0; c < f.length; c++) {
            d = f[c];
            b[d] = a[d]
        }
        for (c in b) if (b.hasOwnProperty) e[c] = b[c];
        return e
    };

    /**
     * Generates an OAuth signature
     *
     * @param string          httpmethod Usually either 'GET' or 'POST' or 'DELETE'
     * @param string          method     The API method to call
     * @param array  optional params     The API call parameters, associative
     * @param bool   optional multipart  Whether the request is going to be multipart/form-data
     *
     * @return string The API call parameters including the signature
     *                If multipart, the Authorization HTTP header is returned
     */
    var _sign = function (httpmethod, method, params, multipart) {
        if (typeof params == 'undefined') {
            var params = {};
        }
        if (typeof multipart == 'undefined') {
            var multipart = false;
        }
        if (_oauth_consumer_key == null) {
            c('To generate a signature, the consumer key must be set.');
        }
        var sign_params = {
            consumer_key: _oauth_consumer_key,
            version: '1.0',
            timestamp: Math.round(new Date().getTime() / 1000),
            nonce: _nonce(),
            signature_method: 'HMAC-SHA1'
        };
        var sign_base_params = {};
        for (var key in sign_params) {
            var value = sign_params[key];
            sign_base_params['oauth_' + key] = _url(value);
        }
        if (_oauth_token != null) {
            sign_base_params['oauth_token'] = _url(_oauth_token);
        }
        for (var key in params) {
            var value = params[key];
            sign_base_params[key] = _url(value);
        }
        sign_base_params = _ksort(sign_base_params);
        var sign_base_string = '';
        for (var key in sign_base_params) {
            var value = sign_base_params[key];
            sign_base_string += key + '=' + value + '&';
        }
        sign_base_string = sign_base_string.substring(0, sign_base_string.length - 1);
        var signature = _sha1(httpmethod + '&' + _url(method) + '&' + _url(sign_base_string));
        if (multipart) {
            params = sign_base_params;
            params['oauth_signature'] = signature;
            params = _ksort(params);
            var authorization = 'Authorization: OAuth ';
            for (var key in params) {
                var value = params[key];
                authorization += key + '="' + _url(value) + '", ';
            }
            return authorization.substring(0, authorization.length - 2);
        }
        return (httpmethod == 'GET' ? method + '?' : '') + sign_base_string + '&oauth_signature=' + _url(signature);
    };

    /**
     * Detects HTTP method to use for API call
     *
     * @param string method The API method to call
     * @param array  params The parameters to send along
     *
     * @return string The HTTP method that should be used
     */
    var _detectMethod = function (method, params) {
        // multi-HTTP method endpoints
        switch(method) {
            case 'account/settings':
                method = params.length ? method + '__post' : method;
                break;
        }

        var httpmethods = {};
        httpmethods['GET'] = [
            // Timelines
            'statuses/mentions_timeline',
            'statuses/user_timeline',
            'statuses/home_timeline',
            'statuses/retweets_of_me',

            // Tweets
            'statuses/retweets/:id',
            'statuses/show/:id',
            'statuses/oembed',

            // Search
            'search/tweets',

            // Direct Messages
            'direct_messages',
            'direct_messages/sent',
            'direct_messages/show',

            // Friends & Followers
            'friends/ids',
            'followers/ids',
            'friendships/lookup',
            'friendships/incoming',
            'friendships/outgoing',
            'friendships/show',
            'friends/list',
            'followers/list',

            // Users
            'account/settings',
            'account/verify_credentials',
            'blocks/list',
            'blocks/ids',
            'users/lookup',
            'users/show',
            'users/search',
            'users/contributees',
            'users/contributors',
            'users/profile_banner',

            // Suggested Users
            'users/suggestions/:slug',
            'users/suggestions',
            'users/suggestions/:slug/members',

            // Favorites
            'favorites/list',

            // Lists
            'lists/list',
            'lists/statuses',
            'lists/memberships',
            'lists/subscribers',
            'lists/subscribers/show',
            'lists/members/show',
            'lists/members',
            'lists/show',
            'lists/subscriptions',

            // Saved searches
            'saved_searches/list',
            'saved_searches/show/:id',

            // Places & Geo
            'geo/id/:place_id',
            'geo/reverse_geocode',
            'geo/search',
            'geo/similar_places',

            // Trends
            'trends/place',
            'trends/available',
            'trends/closest',

            // OAuth
            'oauth/authenticate',
            'oauth/authorize',

            // Help
            'help/configuration',
            'help/languages',
            'help/privacy',
            'help/tos',
            'application/rate_limit_status',

            // Old
            'users/recommendations'
        ];
        httpmethods['POST'] = [
            // Tweets
            'statuses/destroy/:id',
            'statuses/update',
            'statuses/retweet/:id',
            'statuses/update_with_media',

            // Direct Messages
            'direct_messages/destroy',
            'direct_messages/new',

            // Friends & Followers
            'friendships/create',
            'friendships/destroy',
            'friendships/update',

            // Users
            'account/settings__post',
            'account/update_delivery_device',
            'account/update_profile',
            'account/update_profile_background_image',
            'account/update_profile_colors',
            'account/update_profile_image',
            'blocks/create',
            'blocks/destroy',
            'account/update_profile_banner',
            'account/remove_profile_banner',

            // Favorites
            'favorites/destroy',
            'favorites/create',

            // Lists
            'lists/members/destroy',
            'lists/subscribers/create',
            'lists/subscribers/destroy',
            'lists/members/create_all',
            'lists/members/create',
            'lists/destroy',
            'lists/update',
            'lists/create',
            'lists/members/destroy_all',

            // Saved Searches
            'saved_searches/create',
            'saved_searches/destroy/:id',

            // Places & Geo
            'geo/place',

            // Spam Reporting
            'users/report_spam',

            // OAuth
            'oauth/access_token',
            'oauth/request_token'
        ];
        for (var httpmethod in httpmethods) {
            var methods = httpmethods[httpmethod].join(' ');
            if (methods.indexOf(method) > -1) {
                return httpmethod;
            }
        }
        c('Can\'t find HTTP method to use for "' + method + '".');
    };

    /**
     * Detects if API call should use multipart/form-data
     *
     * @param string method The API method to call
     *
     * @return bool Whether the method should be sent as multipart
     */
    var _detectMultipart = function (method) {
        var multiparts = [
            // Tweets
            'statuses/update_with_media',

            // Users
            'account/update_profile_background_image',
            'account/update_profile_image',
            'account/update_profile_banner'
        ];
        return multiparts.indexOf(method) > -1;
    };

    /**
     * Detects if API call should use the old endpoint
     *
     * @param string method The API method to call
     *
     * @return bool Whether the method is defined in old API
     */
    var _detectOld = function (method) {
        var olds = [
            // Users
            'users/recommendations'
        ];
        return olds.indexOf(method) > -1;
    };

    /**
     * Builds the complete API endpoint url
     *
     * @param string method           The API method to call
     * @param string method_template  The API method template to call
     *
     * @return string The URL to send the request to
     */
    var _getEndpoint = function (method, method_template) {
        if (method.substring(0, 6) == 'oauth/') {
            url = _endpoint_oauth + method;
        } else if (_detectOld(method_template)) {
            url = _endpoint_old + method + '.json';
        } else {
            url = _endpoint + method + '.json';
        }
        return url;
    };

    /**
     * Calls the API using cURL
     *
     * @param string          httpmethod      The HTTP method to use for making the request
     * @param string          method          The API method to call
     * @param string          method_template The templated API method to call
     * @param array  optional params          The parameters to send along
     * @param bool   optional multipart       Whether to use multipart/form-data
     * @param function        callback        The function to call with the API call result
     *
     * @return mixed The API reply, encoded in the set return_format
     */

    var _callApi = function (httpmethod, method, method_template, params, multipart, callback) {
        if (typeof params == 'undefined') {
            var params = {};
        }
        if (typeof multipart == 'undefined') {
            var multipart = false;
        }
        if (typeof callback != 'function') {
            var callback = function (reply) {};
        }

        url = _getEndpoint(method, method_template);

        var xml;
        try {
            xml = new XMLHttpRequest();
        } catch (e) {
            xml = new ActiveXObject('Microsoft.XMLHTTP');
        }
        if (httpmethod == 'GET') {
            xml.open(httpmethod, _sign(httpmethod, url, params), true);
        } else {
            xml.open(httpmethod, url, true);
            if (multipart) {
                xml.setRequestHeader("Content-Type", "multipart/form-data");
                var authorization = _sign('POST', url, {}, true);
                xml.setRequestHeader("Authorization", authorization);
                xml.setRequestHeader("Expect", '');
                var post_fields = params;
            } else {
                xml.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                var post_fields = _sign('POST', url, params);
            }
        }
        xml.onreadystatechange = function () {
            if (xml.readyState >= 4) {
                var httpstatus = 12027;
                try {
                    httpstatus = xml.status;
                } catch (e) {}
                var reply = _parseApiReply(method_template, xml.responseText);
                reply.httpstatus = httpstatus;
                callback(reply);
            }
        };
        xml.send(httpmethod == "GET" ? null : post_fields);
        return true;
    };

    /**
     * Parses the API reply to encode it in the set return_format
     *
     * @param string method The method that has been called
     * @param string reply  The actual reply, JSON-encoded or URL-encoded
     *
     * @return array|object The parsed reply
     */
    var _parseApiReply = function (method, reply) {
        if (reply == '[]') {
            return [];
        }
        var parsed = false;
        try {
            parsed = JSON.parse(reply);
        } catch (e) {
            var elements = reply.split("&");
            parsed = {};
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i].split("=", 2);
                if (element.length > 1) {
                    parsed[element[0]] = unescape(element[1]);
                } else {
                    parsed[element[0]] = null;
                }
            }
        }
        return parsed;
    };

    return {
        setConsumerKey: setConsumerKey,
        getVersion: getVersion,
        setToken: setToken,
        __call: __call,
        statuses_publicTimeline: statuses_publicTimeline,
        oauth_authenticate: oauth_authenticate,
        oauth_authorize: oauth_authorize
    };
};