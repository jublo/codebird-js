/**
 * A Twitter library in JavaScript
 *
 * @package   codebird
 * @version   3.0.0-dev
 * @author    Jublo Solutions <support@jublo.net>
 * @copyright 2010-2016 Jublo Solutions <support@jublo.net>
 * @license   http://opensource.org/licenses/GPL-3.0 GNU Public License 3.0
 * @link      https://github.com/jublonet/codebird-php
 */

/* global window,
      document,
      navigator,
      Ti,
      ActiveXObject,
      module,
      define,
      require */

(() => {
  /**
   * A Twitter library in JavaScript
   *
   * @package codebird
   * @subpackage codebird-js
   */
  class Codebird {

    constructor() {
      /**
       * The OAuth consumer key of your registered app
       */
      this._oauth_consumer_key = null;

      /**
       * The corresponding consumer secret
       */
      this._oauth_consumer_secret = null;

      /**
       * The app-only bearer token. Used to authorize app-only requests
       */
      this._oauth_bearer_token = null;

      /**
       * The API endpoint base to use
       */
      this._endpoint_base = "https://api.twitter.com/";

      /**
       * The media API endpoint base to use
       */
      this._endpoint_base_media = "https://upload.twitter.com/";

      /**
       * The API endpoint to use
       */
      this._endpoint = `${this._endpoint_base}1.1/`;

      /**
       * The media API endpoint to use
       */
      this._endpoint_media = `${this._endpoint_base_media}1.1/`;

      /**
       * The API endpoint base to use
       */
      this._endpoint_oauth = this._endpoint_base;

      /**
       * API proxy endpoint
       */
      this._endpoint_proxy = "https://api.jublo.net/codebird/";

      /**
       * Whether to access the API via a proxy that is allowed by CORS
       * Assume that CORS is only necessary in browsers
       */
      this._use_proxy = (typeof navigator !== "undefined"
      && typeof navigator.userAgent !== "undefined"
      );

      /**
       * The Request or access token. Used to sign requests
       */
      this._oauth_token = null;

      /**
       * The corresponding request or access token secret
       */
      this._oauth_token_secret = null;

      /**
       * The current Codebird version
       */
      this._version = "3.0.0-dev";

      this.b64_alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    }

    /**
     * Sets the OAuth consumer key and secret (App key)
     *
     * @param string key    OAuth consumer key
     * @param string secret OAuth consumer secret
     *
     * @return void
     */
    setConsumerKey(key, secret) {
      this._oauth_consumer_key = key;
      this._oauth_consumer_secret = secret;
    }

    /**
     * Sets the OAuth2 app-only auth bearer token
     *
     * @param string token OAuth2 bearer token
     *
     * @return void
     */
    setBearerToken(token) {
      this._oauth_bearer_token = token;
    }

    /**
     * Gets the current Codebird version
     *
     * @return string The version number
     */
    getVersion() {
      return this._version;
    }

    /**
     * Sets the OAuth request or access token and secret (User key)
     *
     * @param string token  OAuth request or access token
     * @param string secret OAuth request or access token secret
     *
     * @return void
     */
    setToken(token, secret) {
      this._oauth_token = token;
      this._oauth_token_secret = secret;
    }

    /**
     * Forgets the OAuth request or access token and secret (User key)
     *
     * @return bool
     */
    logout() {
      this._oauth_token =
      this._oauth_token_secret = null;

      return true;
    }

    /**
     * Enables or disables CORS proxy
     *
     * @param bool use_proxy Whether to use CORS proxy or not
     *
     * @return void
     */
    setUseProxy(use_proxy) {
      this._use_proxy = !!use_proxy;
    }

    /**
     * Sets custom CORS proxy server
     *
     * @param string proxy Address of proxy server to use
     *
     * @return void
     */
    setProxy(proxy) {
      // add trailing slash if missing
      if (!proxy.match(/\/$/)) {
        proxy += "/";
      }
      this._endpoint_proxy = proxy;
    }

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
    _url(data) {
      if ((/boolean|number|string/).test(typeof data)) {
        return encodeURIComponent(data).replace(/!/g, "%21").replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A");
      } else {
        return "";
      }
    }

    /**
     * Gets the base64-encoded SHA1 hash for the given data
     *
     * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
     * in FIPS PUB 180-1
     * Based on version 2.1 Copyright Paul Johnston 2000 - 2002.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * Distributed under the BSD License
     * See http://pajhome.org.uk/crypt/md5 for details.
     *
     * @param string data The data to calculate the hash from
     *
     * @return string The hash
     */
    _sha1(e) {
      function n (e, b) {
        e[b >> 5] |= 128 << 24 - b % 32;
        e[(b + 64 >> 9 << 4) + 15] = b;
        for (var c = new Array(80), a = 1732584193, d = -271733879, h = -1732584194,
          k = 271733878, g = -1009589776, p = 0; p < e.length; p += 16) {
          for (var o = a, q = d, r = h, s = k, t = g, f = 0; 80 > f; f++) {
            let m;

            if (f < 16) {
              m = e[p + f];
            } else {
              m = c[f - 3] ^ c[f - 8] ^ c[f - 14] ^ c[f - 16];
              m = m << 1 | m >>> 31;
            }

            c[f] = m;
            m = l(l(a << 5 | a >>> 27, 20 > f ? d & h | ~d & k : 40 > f ? d ^
              h ^ k : 60 > f ? d & h | d & k | h & k : d ^ h ^ k), l(
                l(g, c[f]), 20 > f ? 1518500249 : 40 > f ? 1859775393 :
                  60 > f ? -1894007588 : -899497514));
            g = k;
            k = h;
            h = d << 30 | d >>> 2;
            d = a;
            a = m;
          }
          a = l(a, o);
          d = l(d, q);
          h = l(h, r);
          k = l(k, s);
          g = l(g, t);
        }
        return [a, d, h, k, g];
      }

      function l(e, b) {
        var c = (e & 65535) + (b & 65535);
        return (e >> 16) + (b >> 16) + (c >> 16) << 16 | c & 65535;
      }

      function q(e) {
        for (var b = [], c = (1 << g) - 1, a = 0; a < e.length * g; a += g) {
          b[a >> 5] |= (e.charCodeAt(a / g) & c) << 24 - a % 32;
        }
        return b;
      }
      var g = 8;

      let b = `${this._oauth_consumer_secret}&${null !== this._oauth_token_secret ?
        this._oauth_token_secret : ""}`;
      if (this._oauth_consumer_secret === null) {
        throw "To generate a hash, the consumer secret must be set.";
      }
      let c = q(b);
      if (c.length > 16) {
        c = n(c, b.length * g);
      }
      let bb = new Array(16);
      for (var a = new Array(16), d = 0; d < 16; d++) {
        a[d] = c[d] ^ 909522486;
        bb[d] = c[d] ^ 1549556828;
      }
      c = n(a.concat(q(e)), 512 + e.length * g);
      bb = n(bb.concat(c), 672);
      b = "";
      for (g = 0; g < 4 * bb.length; g += 3) {
        for (d = (bb[g >> 2] >> 8 * (3 - g % 4) & 255) << 16 | (bb[g + 1 >> 2] >>
          8 * (3 - (g + 1) % 4) & 255) << 8 | bb[g + 2 >> 2] >> 8 * (3 -
            (g + 2) % 4) & 255, e = 0; 4 > e; e++) {
          b = 8 * g + 6 * e > 32 * bb.length ? b + "=" : b +
            this.b64_alphabet.charAt(d >> 6 * (3 - e) & 63);
        }
      }
      return b;
    }

    /*
     * Gets the base64 representation for the given data
     *
     * http://phpjs.org
     * +   original by: Tyler Akins (http://rumkin.com)
     * +   improved by: Bayron Guevara
     * +   improved by: Thunder.m
     * +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
     * +   bugfixed by: Pellentesque Malesuada
     * +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
     * +   improved by: Rafał Kukawski (http://kukawski.pl)
     *
     * @param string data The data to calculate the base64 representation from
     *
     * @return string The base64 representation
     */
    _base64_encode(a) {
      let d, e, f, b, g = 0,
        h = 0,
        i = this.b64_alphabet,
        c = [];
      if (!a) {
        return a;
      }
      do {
        d = a.charCodeAt(g++);
        e = a.charCodeAt(g++);
        f = a.charCodeAt(g++);
        b = d << 16 | e << 8 | f;
        d = b >> 18 & 63;
        e = b >> 12 & 63;
        f = b >> 6 & 63;
        b &= 63;
        c[h++] = i.charAt(d) + i.charAt(e) + i.charAt(f) + i.charAt(b);
      } while (g < a.length);
      i = c.join("");
      a = a.length % 3;
      return (a ? i.slice(0, a - 3) : i) + "===".slice(a || 3);
    }

    /*
     * Builds a HTTP query string from the given data
     *
     * http://phpjs.org
     * +     original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
     * +     improved by: Legaev Andrey
     * +     improved by: Michael White (http://getsprink.com)
     * +     improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
     * +     improved by: Brett Zamir (http://brett-zamir.me)
     * +        revised by: stag019
     * +     input by: Dreamer
     * +     bugfixed by: Brett Zamir (http://brett-zamir.me)
     * +     bugfixed by: MIO_KODUKI (http://mio-koduki.blogspot.com/)
     *
     * @param string data The data to concatenate
     *
     * @return string The HTTP query
     */
    _http_build_query(e, f, b) {
      function g(c, a, d) {
        let b, e = [];
        if (a === true) {
          a = "1";
        } else if (a === false) {
          a = "0";
        }
        if (null !== a) {
          if (typeof a === "object") {
            for (b in a) {
              if (a.hasOwnProperty(b) && a[b] !== null) {
                e.push(g.call(this, c + "[" + b + "]", a[b], d));
              }
            }
            return e.join(d);
          }
          if (typeof a !== "function") {
            return this._url(c) + "=" + this._url(a);
          }
          throw "There was an error processing for http_build_query().";
        } else {
          return "";
        }
      }
      var d, c, h = [];
      if (!b) {
        b = "&";
      }
      for (c in e) {
        if (!e.hasOwnProperty(c)) {
          continue;
        }
        d = e[c];
        if (f && !isNaN(c)) {
          c = String(f) + c;
        }
        d = g.call(this, c, d, b);
        if (d !== "") {
          h.push(d);
        }
      }
      return h.join(b);
    }

    /**
     * Generates a (hopefully) unique random string
     *
     * @param int optional length The length of the string to generate
     *
     * @return string The random string
     */
    _nonce(length = 8) {
      if (length < 1) {
        throw "Invalid nonce length.";
      }
      let nonce = "";
      for (let i = 0; i < length; i++) {
        let character = Math.floor(Math.random() * 61);
        nonce += this.b64_alphabet.substring(character, character + 1);
      }
      return nonce;
    }

    /**
     * Sort array elements by key
     *
     * @param array input_arr The array to sort
     *
     * @return array The sorted keys
     */
    _ksort(input_arr) {
      let keys = [], sorter, k;

      sorter = (a, b) => {
        let a_float = parseFloat(a),
          b_float = parseFloat(b),
          a_numeric = a_float + "" === a,
          b_numeric = b_float + "" === b;
        if (a_numeric && b_numeric) {
          return a_float > b_float ? 1 : a_float < b_float ? -1 : 0;
        } else if (a_numeric && !b_numeric) {
          return 1;
        } else if (!a_numeric && b_numeric) {
          return -1;
        }
        return a > b ? 1 : a < b ? -1 : 0;
      };

      // Make a list of key names
      for (k in input_arr) {
        if (input_arr.hasOwnProperty(k)) {
          keys.push(k);
        }
      }
      keys.sort(sorter);
      return keys;
    }

    /**
     * Clone objects
     *
     * @param object obj    The object to clone
     *
     * @return object clone The cloned object
     */
    _clone(obj) {
      let clone = {};
      for (let i in obj) {
        if (typeof (obj[i]) === "object") {
          clone[i] = this._clone(obj[i]);
        } else {
          clone[i] = obj[i];
        }
      }
      return clone;
    }

    /**
     * Gets the XML HTTP Request object, trying to load it in various ways
     *
     * @return object The XMLHttpRequest object instance
     */
    _getXmlRequestObject() {
      let xml = null;
      // first, try the W3-standard object
      if (typeof window === "object"
        && window
        && typeof window.XMLHttpRequest !== "undefined"
        ) {
        xml = new window.XMLHttpRequest();
        // then, try Titanium framework object
      } else if (typeof Ti === "object"
        && Ti
        && typeof Ti.Network.createHTTPClient !== "undefined"
        ) {
        xml = Ti.Network.createHTTPClient();
        // are we in an old Internet Explorer?
      } else if (typeof ActiveXObject !== "undefined"
        ) {
        try {
          xml = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {
          throw "ActiveXObject object not defined.";
        }
        // now, consider RequireJS and/or Node.js objects
      } else if (typeof require === "function"
        && require
        ) {
        var XMLHttpRequest;
        // look for xmlhttprequest module
        try {
          XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
          xml = new XMLHttpRequest();
        } catch (e1) {
          // or maybe the user is using xhr2
          try {
            XMLHttpRequest = require("xhr2");
            xml = new XMLHttpRequest();
          } catch (e2) {
            throw "xhr2 object not defined, cancelling.";
          }
        }
      }
      return xml;
    }

    /**
     * Parse URL-style parameters into object
     *
     * version: 1109.2015
     * discuss at: http://phpjs.org/functions/parse_str
     * +   original by: Cagri Ekin
     * +   improved by: Michael White (http://getsprink.com)
     * +    tweaked by: Jack
     * +   bugfixed by: Onno Marsman
     * +   reimplemented by: stag019
     * +   bugfixed by: Brett Zamir (http://brett-zamir.me)
     * +   bugfixed by: stag019
     * -    depends on: urldecode
     * +   input by: Dreamer
     * +   bugfixed by: Brett Zamir (http://brett-zamir.me)
     * %        note 1: When no argument is specified, will put variables in global scope.
     *
     * @param string str String to parse
     * @param array array to load data into
     *
     * @return object
     */
    _parse_str(str, array) {
      var glue1 = "=",
        glue2 = "&",
        array2 = String(str).replace(/^&?([\s\S]*?)&?$/, "$1").split(glue2),
        i, j, chr, tmp, key, value, bracket, keys, evalStr,
        fixStr = str => {
          return decodeURIComponent(str).replace(/([\\"'])/g, "\\$1").replace(/\n/g, "\\n").replace(/\r/g, "\\r");
        };
      if (!array) {
        array = this.window;
      }

      for (i = 0; i < array2.length; i++) {
        tmp = array2[i].split(glue1);
        if (tmp.length < 2) {
          tmp = [tmp, ""];
        }
        key = fixStr(tmp[0]);
        value = fixStr(tmp[1]);
        while (key.charAt(0) === " ") {
          key = key.substr(1);
        }
        if (key.indexOf("\0") > -1) {
          key = key.substr(0, key.indexOf("\0"));
        }
        if (key && key.charAt(0) !== "[") {
          keys = [];
          bracket = 0;
          for (j = 0; j < key.length; j++) {
            if (key.charAt(j) === "[" && !bracket) {
              bracket = j + 1;
            } else if (key.charAt(j) === "]") {
              if (bracket) {
                if (!keys.length) {
                  keys.push(key.substr(0, bracket - 1));
                }
                keys.push(key.substr(bracket, j - bracket));
                bracket = 0;
                if (key.charAt(j + 1) !== "[") {
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
            if (chr === " " || chr === "." || chr === "[") {
              keys[0] = keys[0].substr(0, j) + "_" + keys[0].substr(j + 1);
            }
            if (chr === "[") {
              break;
            }
          }
          evalStr = "array";
          for (j = 0; j < keys.length; j++) {
            key = keys[j];
            if ((key !== "" && key !== " ") || j === 0) {
              key = `'${key}'`;
            } else {
              key = eval(evalStr + ".push([]);") - 1;
            }
            evalStr += `[${key}]`;
            if (j !== keys.length - 1 && eval("typeof " + evalStr) === "undefined") {
              eval(evalStr + " = [];");
            }
          }
          evalStr += " = '" + value + "';\n";
          eval(evalStr);
        }
      }
    }

    /**
     * Get allowed API methods, sorted by GET or POST
     * Watch out for multiple-method "account/settings"!
     *
     * @return array $apimethods
     */
    getApiMethods() {
      const httpmethods = {
        GET: [
          "account/settings",
          "account/verify_credentials",
          "application/rate_limit_status",
          "blocks/ids",
          "blocks/list",
          "collections/entries",
          "collections/list",
          "collections/show",
          "direct_messages",
          "direct_messages/sent",
          "direct_messages/show",
          "favorites/list",
          "followers/ids",
          "followers/list",
          "friends/ids",
          "friends/list",
          "friendships/incoming",
          "friendships/lookup",
          "friendships/lookup",
          "friendships/no_retweets/ids",
          "friendships/outgoing",
          "friendships/show",
          "geo/id/:place_id",
          "geo/reverse_geocode",
          "geo/search",
          "geo/similar_places",
          "help/configuration",
          "help/languages",
          "help/privacy",
          "help/tos",
          "lists/list",
          "lists/members",
          "lists/members/show",
          "lists/memberships",
          "lists/ownerships",
          "lists/show",
          "lists/statuses",
          "lists/subscribers",
          "lists/subscribers/show",
          "lists/subscriptions",
          "mutes/users/ids",
          "mutes/users/list",
          "oauth/authenticate",
          "oauth/authorize",
          "saved_searches/list",
          "saved_searches/show/:id",
          "search/tweets",
          "site",
          "statuses/firehose",
          "statuses/home_timeline",
          "statuses/mentions_timeline",
          "statuses/oembed",
          "statuses/retweeters/ids",
          "statuses/retweets/:id",
          "statuses/retweets_of_me",
          "statuses/sample",
          "statuses/show/:id",
          "statuses/user_timeline",
          "trends/available",
          "trends/closest",
          "trends/place",
          "user",
          "users/contributees",
          "users/contributors",
          "users/profile_banner",
          "users/search",
          "users/show",
          "users/suggestions",
          "users/suggestions/:slug",
          "users/suggestions/:slug/members"
        ],
        POST: [
          "account/remove_profile_banner",
          "account/settings__post",
          "account/update_delivery_device",
          "account/update_profile",
          "account/update_profile_background_image",
          "account/update_profile_banner",
          "account/update_profile_colors",
          "account/update_profile_image",
          "blocks/create",
          "blocks/destroy",
          "collections/create",
          "collections/destroy",
          "collections/entries/add",
          "collections/entries/curate",
          "collections/entries/move",
          "collections/entries/remove",
          "collections/update",
          "direct_messages/destroy",
          "direct_messages/new",
          "favorites/create",
          "favorites/destroy",
          "friendships/create",
          "friendships/destroy",
          "friendships/update",
          "lists/create",
          "lists/destroy",
          "lists/members/create",
          "lists/members/create_all",
          "lists/members/destroy",
          "lists/members/destroy_all",
          "lists/subscribers/create",
          "lists/subscribers/destroy",
          "lists/update",
          "media/upload",
          "mutes/users/create",
          "mutes/users/destroy",
          "oauth/access_token",
          "oauth/request_token",
          "oauth2/invalidate_token",
          "oauth2/token",
          "saved_searches/create",
          "saved_searches/destroy/:id",
          "statuses/destroy/:id",
          "statuses/filter",
          "statuses/lookup",
          "statuses/retweet/:id",
          "statuses/unretweet/:id",
          "statuses/update",
          "statuses/update_with_media", // deprecated, use media/upload
          "users/lookup",
          "users/report_spam"
        ]
      };
      return httpmethods;
    }

    /**
     * Promise helpers
     */

    /**
     * Get a deferred object
     */
    _getDfd() {
      if (typeof window !== "undefined") {
        if (typeof window.jQuery !== "undefined" && window.jQuery.Deferred) {
          return window.jQuery.Deferred();
        }
        if (typeof window.Q !== "undefined" && window.Q.defer) {
          return window.Q.defer();
        }
        if (typeof window.RSVP !== "undefined" && window.RSVP.defer) {
          return window.RSVP.defer();
        }
        if (typeof window.when !== "undefined" && window.when.defer) {
          return window.when.defer();
        }
      }
      if (typeof require !== "undefined") {
        let promise_class = false;
        try {
          promise_class = require("jquery");
        } catch (e) { }
        if (promise_class) {
          return promise_class.Deferred();
        }
        try {
          promise_class = require("q");
        } catch (e) { }
        if (!promise_class) {
          try {
            promise_class = require("rsvp");
          } catch (e) { }
        }
        if (!promise_class) {
          try {
            promise_class = require("when");
          } catch (e) { }
        }
        if (promise_class) {
          try {
            return promise_class.defer();
          } catch (e) { }
        }
      }
      return false;
    }

    /**
     * Get a promise from the dfd object
     */
    _getPromise(dfd) {
      if (typeof dfd.promise === "function") {
        return dfd.promise();
      }
      return dfd.promise; // object
    }

    /**
     * __call() helpers
     */

    /**
     * Parse given params, detect query-style params
     *
     * @param array|string params Parameters to parse
     *
     * @return array apiparams
     */
    _parseApiParams(params) {
      let apiparams = {};
      if (typeof params === "object") {
        apiparams = params;
      } else {
        this._parse_str(params, apiparams); //TODO
      }

      return apiparams;
    }

    /**
     * Replace null and boolean parameters with their string representations
     *
     * @param array apiparams Parameter array to replace in
     *
     * @return array apiparams
     */
    _stringifyNullBoolParams(apiparams) {
      for (let key in apiparams) {
        if (!apiparams.hasOwnProperty(key)) {
          continue;
        }
        let value = apiparams[key];
        if (value === null) {
          apiparams[key] = "null";
        } else if (value === true || value === false) {
          apiparams[key] = value ? "true" : "false";
        }
      }

      return apiparams;
    }

    /**
     * API method mapping: Replaces _ with / character
     *
     * @param string fn Function called
     *
     * @return string API method to call
     */
    _mapFnInsertSlashes(fn) {
      return fn.split("_").join("/");
    }

    /**
     * API method mapping: Restore _ character in named parameters
     *
     * @param string method API method to call
     *
     * @return string API method with restored underscores
     */
    _mapFnRestoreParamUnderscores(method) {
      const url_parameters_with_underscore = ["screen_name", "place_id"];
      let i, param, replacement_was;
      for (i = 0; i < url_parameters_with_underscore.length; i++) {
        param = url_parameters_with_underscore[i].toUpperCase();
        replacement_was = param.split("_").join("/");
        method = method.split(replacement_was).join(param);
      }

      return method;
    }


    /**
     * Maps called PHP magic method name to Twitter API method
     *
     * @param string $fn              Function called
     * @param array  $apiparams byref API parameters
     *
     * @return string[] (string method, string method_template)
     */
    _mapFnToApiMethod(fn, apiparams) {
      let method = "",
        param, i, j;

      // replace _ by /
      method = this._mapFnInsertSlashes(fn);

      // undo replacement for URL parameters
      method = this._mapFnRestoreParamUnderscores(method);

      // replace AA by URL parameters
      let method_template = method;
      const match = method.match(/[A-Z_]{2,}/);
      if (match) {
        for (i = 0; i < match.length; i++) {
          param = match[i];
          let param_l = param.toLowerCase();
          method_template = method_template.split(param).join(":" + param_l);
          if (typeof apiparams[param_l] === "undefined") {
            for (j = 0; j < 26; j++) {
              method_template = method_template.split(String.fromCharCode(65 + j)).join("_" + String.fromCharCode(97 + j));
            }
            throw `To call the templated method "${method_template}", specify the parameter value for "${param_l}".`;
          }
          method = method.split(param).join(apiparams[param_l]);
          delete apiparams[param_l];
        }
      }

      // replace A-Z by _a-z
      for (i = 0; i < 26; i++) {
        method = method.split(String.fromCharCode(65 + i)).join("_" + String.fromCharCode(97 + i));
        method_template = method_template.split(String.fromCharCode(65 + i)).join("_" + String.fromCharCode(97 + i));
      }

      return [method, method_template];
    }


    /**
     * Detects HTTP method to use for API call
     *
     * @param string method The API method to call
     * @param array  params The parameters to send along
     *
     * @return string The HTTP method that should be used
     */
    _detectMethod(method, params) {
      if (typeof params.httpmethod !== "undefined") {
        let httpmethod = params.httpmethod;
        delete params.httpmethod;
        return httpmethod;
      }

      // multi-HTTP method endpoints
      switch (method) {
        case "account/settings":
        case "account/login_verification_enrollment":
        case "account/login_verification_request":
          method = Object.keys(params).length ? `${method}__post` : method;
          break;
      }

      const apimethods = this.getApiMethods();
      for (let httpmethod in apimethods) {
        if (apimethods.hasOwnProperty(httpmethod)
          && apimethods[httpmethod].indexOf(method) > -1
          ) {
          return httpmethod;
        }
      }
      throw `Can't find HTTP method to use for "${method}".`;
    }

    /**
     * Detects if API call should use multipart/form-data
     *
     * @param string method The API method to call
     *
     * @return bool Whether the method should be sent as multipart
     */
    _detectMultipart(method) {
      const multiparts = [
      // Tweets
        "statuses/update_with_media",
        "media/upload",

      // Users
        "account/update_profile_background_image",
        "account/update_profile_image",
        "account/update_profile_banner"
      ];
      return multiparts.indexOf(method) > -1;
    }

    /**
     * Signature helper
     *
     * @param string httpmethod   Usually either 'GET' or 'POST' or 'DELETE'
     * @param string method       The API method to call
     * @param array  base_params  The signature base parameters
     *
     * @return string signature
     */
    _getSignature(httpmethod, method, keys, base_params) {
      // convert params to string
      let base_string = "", key, value;
      for (let i = 0; i < keys.length; i++) {
        key = keys[i];
        value = base_params[key];
        base_string += `${key}=${this._url(value)}&`;
      }
      base_string = base_string.substring(0, base_string.length - 1);
      return this._sha1(`${httpmethod}&${this._url(method)}&${this._url(base_string)}`);
    }

    /**
     * Generates the UNIX timestamp
     */
    _time() {
      Math.round(new Date().getTime() / 1000);
    }

    /**
     * Generates an OAuth signature
     *
     * @param string          httpmethod    Usually either 'GET' or 'POST' or 'DELETE'
     * @param string          method        The API method to call
     * @param array  optional params        The API call parameters, associative
     *
     * @return string Authorization HTTP header
     */
    _sign(httpmethod, method, params = {}) {
      if (this._oauth_consumer_key === null) {
        throw "To generate a signature, the consumer key must be set.";
      }
      const sign_params = {
        consumer_key: this._oauth_consumer_key,
        version: "1.0",
        timestamp: this._time(),
        nonce: this._nonce(),
        signature_method: "HMAC-SHA1"
      };
      let sign_base_params = {};
      for (var key in sign_params) {
        if (!sign_params.hasOwnProperty(key)) {
          continue;
        }
        let value = sign_params[key];
        sign_base_params[`oauth_${key}`] = this._url(value);
      }
      if (this._oauth_token !== null) {
        sign_base_params.oauth_token = this._url(this._oauth_token);
      }
      const oauth_params = this._clone(sign_base_params);
      for (key in params) {
        if (!params.hasOwnProperty(key)) {
          continue;
        }
        sign_base_params[key] = params[key];
      }
      let keys = this._ksort(sign_base_params);

      const signature = this._getSignature(httpmethod, method, keys, sign_base_params);

      params = oauth_params;
      params.oauth_signature = signature;
      keys = this._ksort(params);
      let authorization = "OAuth ";
      for (let i = 0; i < keys.length; i++) {
        key = keys[i];
        authorization += `${key}="${this._url(params[key])}", `;
      }
      return authorization.substring(0, authorization.length - 2);
    }

    /**
     * Build multipart request from upload params
     *
     * @param string method  The API method to call
     * @param array  params  The parameters to send along
     *
     * @return null|string The built multipart request body
     */
    _buildMultipart(method, params) {
      // well, files will only work in multipart methods
      if (!this._detectMultipart(method)) {
        return;
      }

      // only check specific parameters
      const possible_methods = [
          // Tweets
          "statuses/update_with_media",
          // Accounts
          "account/update_profile_background_image",
          "account/update_profile_image",
          "account/update_profile_banner"
        ];
      let possible_files = {
          // Tweets
          "statuses/update_with_media": "media[]",
          // Accounts
          "account/update_profile_background_image": "image",
          "account/update_profile_image": "image",
          "account/update_profile_banner": "banner"
        };
      // method might have files?
      if (possible_methods.indexOf(method) === -1) {
        return;
      }

      // check for filenames
      possible_files = possible_files[method].split(" ");

      const multipart_border = `--------------------${this._nonce()}`;
      let multipart_request = "";
      for (let key in params) {
        if (!params.hasOwnProperty(key)) {
          continue;
        }
        multipart_request +=
          `--${multipart_border}\r\nContent-Disposition: form-data; name="${key}"`;
        if (possible_files.indexOf(key) === -1) {
          multipart_request += "\r\nContent-Transfer-Encoding: base64";
        }
        multipart_request += `\r\n\r\n${params[key]}\r\n`;
      }
      multipart_request += `--${multipart_border}--`;
      return multipart_request;
    }

    /**
     * Detects if API call should use media endpoint
     *
     * @param string method The API method to call
     *
     * @return bool Whether the method is defined in media API
     */
    _detectMedia(method) {
      const medias = [
        "media/upload"
      ];
      return medias.indexOf(method) > -1;
    }

    /**
     * Detects if API call should use JSON body
     *
     * @param string method The API method to call
     *
     * @return bool Whether the method is defined as accepting JSON body
     */
    _detectJsonBody(method) {
      const json_bodies = [
        "collections/entries/curate"
      ];
      return json_bodies.indexOf(method) > -1;
    }

    /**
     * Builds the complete API endpoint url
     *
     * @param string method The API method to call
     *
     * @return string The URL to send the request to
     */
    _getEndpoint(method) {
      let url;
      if (method.substring(0, 5) === "oauth") {
        url = this._endpoint_oauth + method;
      } else if (this._detectMedia(method)) {
        url = this._endpoint_media + method + ".json";
      } else {
        url = this._endpoint + method + ".json";
      }
      return url;
    }

    /**
     * Parses the API reply to encode it in the set return_format
     *
     * @param string reply  The actual reply, JSON-encoded or URL-encoded
     *
     * @return array|object The parsed reply
     */
    _parseApiReply(reply) {
      if (typeof reply !== "string" || reply === "") {
        return {};
      }
      if (reply === "[]") {
        return [];
      }
      let parsed;
      try {
        parsed = JSON.parse(reply);
      } catch (e) {
        parsed = {};
        // assume query format
        let elements = reply.split("&");
        for (let i = 0; i < elements.length; i++) {
        let element = elements[i].split("=", 2);
        if (element.length > 1) {
            parsed[element[0]] = decodeURIComponent(element[1]);
        } else {
            parsed[element[0]] = null;
        }
        }
      }
      return parsed;
    }


    /**
     * Uncommon API methods
     */

    /**
     * Gets the OAuth authenticate URL for the current request token
     *
     * @return object Promise
     */
    oauth_authenticate(params = {}, callback = undefined, type = "authenticate") {
      const dfd = this._getDfd();
      if (typeof params.force_login === "undefined") {
        params.force_login = null;
      }
      if (typeof params.screen_name === "undefined") {
        params.screen_name = null;
      }
      if (["authenticate", "authorize"].indexOf(type) === -1) {
        type = "authenticate";
      }
      if (this._oauth_token === null) {
        const error = `To get the ${type} URL, the OAuth token must be set.`;
        if (dfd) {
          dfd.reject({ error });
          return this._getPromise(dfd);
        }
        throw error;
      }
      let url = `${this._endpoint_oauth}oauth/${type}?oauth_token=${this._url(this._oauth_token)}`;
      if (params.force_login === true) {
        url += "&force_login=1";
      }
      if (params.screen_name !== null) {
        url += `&screen_name=${params.screen_name}`;
      }
      if (typeof callback === "function") {
        callback(url);
      }
      if (dfd) {
        dfd.resolve({ reply: url });
        return this._getPromise(dfd);
      }
      // no promises
      return true;
    }

    /**
     * Gets the OAuth authorize URL for the current request token
     *
     * @return string The OAuth authorize URL
     */
    oauth_authorize(params, callback) {
      return this.oauth_authenticate(params, callback, "authorize");
    }

    /**
     * Gets the OAuth bearer token
     *
     * @return object Promise
     */
    oauth2_token(callback) {
      const dfd = this._getDfd();

      if (this._oauth_consumer_key === null) {
        const error = "To obtain a bearer token, the consumer key must be set.";
        if (dfd) {
          dfd.reject({ error });
          return this._getPromise(dfd);
        }
        throw error;
      }

      if (!dfd && typeof callback === "undefined") {
        callback = () => {};
      }

      const post_fields = "grant_type=client_credentials";
      let url = this._endpoint_oauth + "oauth2/token";

      if (this._use_proxy) {
        url = url.replace(
          this._endpoint_base,
          this._endpoint_proxy
          );
      }

      const xml = this._getXmlRequestObject();
      if (xml === null) {
        return;
      }
      xml.open("POST", url, true);
      xml.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xml.setRequestHeader(
        `${this._use_proxy ? "X-" : ""}Authorization`,
        "Basic " + this._base64_encode(`${this._oauth_consumer_key}:${this._oauth_consumer_secret}`)
        );

      xml.onreadystatechange = () => {
        if (xml.readyState >= 4) {
          let httpstatus = 12027;
          try {
            httpstatus = xml.status;
          } catch (e) { }
          let response = "";
          try {
            response = xml.responseText;
          } catch (e) { }
          let reply = this._parseApiReply(response);
          reply.httpstatus = httpstatus;
          if (httpstatus === 200) {
            this.setBearerToken(reply.access_token);
          }
          if (typeof callback === "function") {
            callback(reply);
          }
          if (dfd) {
            dfd.resolve({ reply });
          }
        }
      };
      // function called when an error occurs, including a timeout
      xml.onerror = e => {
        if (typeof callback === "function") {
          callback(null, e);
        }
        if (dfd) {
          dfd.reject(e);
        }
      };
      xml.timeout = 30000; // in milliseconds

      xml.send(post_fields);
      if (dfd) {
        return this._getPromise(dfd);
      }
    }

    /**
     * Calls the API using cURL
     *
     * @param string          httpmethod    The HTTP method to use for making the request
     * @param string          method        The API method to call
     * @param array  optional params        The parameters to send along
     * @param bool   optional multipart     Whether to use multipart/form-data
     * @param bool   optional app_only_auth Whether to use app-only bearer authentication
     * @param function        callback      The function to call with the API call result
     *
     * @return mixed The API reply, encoded in the set return_format
     */
    _callApi(
        httpmethod,
        method,
        params = {},
        multipart = false,
        app_only_auth = false,
        callback = () => {}
      ) {
      const dfd = this._getDfd();

      let url         = this._getEndpoint(method),
        authorization = null;

      const xml = this._getXmlRequestObject();
      if (xml === null) {
        return;
      }
      let post_fields;

      if (httpmethod === "GET") {
        let url_with_params = url;
        if (JSON.stringify(params) !== "{}") {
          url_with_params += "?" + this._http_build_query(params);
        }
        if (!app_only_auth) {
          authorization = this._sign(httpmethod, url, params);
        }

        if (this._use_proxy) {
          url_with_params = url_with_params.replace(
            this._endpoint_base,
            this._endpoint_proxy
            ).replace(
              this._endpoint_base_media,
              this._endpoint_proxy
              );
        }
        xml.open(httpmethod, url_with_params, true);
      } else {
        if (multipart) {
          if (!app_only_auth) {
            authorization = this._sign(httpmethod, url, {});
          }
          params = this._buildMultipart(method, params);
        } else if (this._detectJsonBody(method)) {
          authorization = this._sign(httpmethod, url, {});
          params = JSON.stringify(params);
        } else {
          if (!app_only_auth) {
            authorization = this._sign(httpmethod, url, params);
          }
          params = this._http_build_query(params);
        }
        post_fields = params;
        if (this._use_proxy || multipart) { // force proxy for multipart base64
          url = url.replace(
            this._endpoint_base,
            this._endpoint_proxy
            ).replace(
              this._endpoint_base_media,
              this._endpoint_proxy
              );
        }
        xml.open(httpmethod, url, true);
        if (multipart) {
          xml.setRequestHeader("Content-Type", "multipart/form-data; boundary="
            + post_fields.split("\r\n")[0].substring(2));
        } else if (this._detectJsonBody(method)) {
          xml.setRequestHeader("Content-Type", "application/json");
        } else {
          xml.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
      }
      if (app_only_auth) {
        if (this._oauth_consumer_key === null
          && this._oauth_bearer_token === null
          ) {
          const error = "To make an app-only auth API request, consumer key or bearer token must be set.";
          if (dfd) {
            dfd.reject({ error });
            return this._getPromise(dfd);
          }
          throw error;
        }
        // automatically fetch bearer token, if necessary
        if (this._oauth_bearer_token === null) {
          if (dfd) {
            return this.oauth2_token().then(() => {
              return this._callApi(httpmethod, method, params, multipart, app_only_auth, callback);
            });
          }
          this.oauth2_token(() => {
            this._callApi(httpmethod, method, params, multipart, app_only_auth, callback);
          });
          return;
        }
        authorization = "Bearer " + this._oauth_bearer_token;
      }
      if (authorization !== null) {
        xml.setRequestHeader(`${this._use_proxy ? "X-" : ""}Authorization`, authorization);
      }
      xml.onreadystatechange = () => {
        if (xml.readyState >= 4) {
          let httpstatus = 12027;
          try {
            httpstatus = xml.status;
          } catch (e) { }
          let response = "";
          try {
            response = xml.responseText;
          } catch (e) { }
          let reply = this._parseApiReply(response);
          reply.httpstatus = httpstatus;
          let rate = null;
          if (typeof xml.getResponseHeader !== "undefined"
            && xml.getResponseHeader("x-rate-limit-limit") !== ""
            ) {
            rate = {
              limit: xml.getResponseHeader("x-rate-limit-limit"),
              remaining: xml.getResponseHeader("x-rate-limit-remaining"),
              reset: xml.getResponseHeader("x-rate-limit-reset")
            };
          }
          if (typeof callback === "function") {
            callback(reply, rate);
          }
          if (dfd) {
            dfd.resolve({ reply, rate });
          }
        }
      };
      // function called when an error occurs, including a timeout
      xml.onerror = e => {
        if (typeof callback === "function") {
          callback(null, null, e);
        }
        if (dfd) {
          dfd.reject(e);
        }
      };
      xml.timeout = 30000; // in milliseconds

      xml.send(httpmethod === "GET" ? null : post_fields);
      if (dfd) {
        return this._getPromise(dfd);
      }
      return true;
    }

    /**
     * Main API handler working on any requests you issue
     *
     * @param string   fn            The member function you called
     * @param array    params        The parameters you sent along
     * @param function callback      The callback to call with the reply
     * @param bool     app_only_auth Whether to use app-only auth
     *
     * @return object Promise
     */
    __call(fn, params = {}, callback, app_only_auth = false) {
      if (typeof callback !== "function" && typeof params === "function") {
        callback = params;
        params = {};
        if (typeof callback === "boolean") {
          app_only_auth = callback;
        }
      } else if (typeof callback === "undefined") {
        callback = () => {};
      }
      switch (fn) {
        case "oauth_authenticate":
        case "oauth_authorize":
          return this[fn](params, callback);

        case "oauth2_token":
          return this[fn](callback);
      }

      // parse parameters
      let apiparams = this._parseApiParams(params);

      // stringify null and boolean parameters
      apiparams = this._stringifyNullBoolParams(apiparams);

      // reset token when requesting a new token (causes 401 for signature error on 2nd+ requests)
      if (fn === "oauth_requestToken") {
        this.setToken(null, null);
      }

      // map function name to API method
      const [method, method_template] = this._mapFnToApiMethod(fn, apiparams),
        httpmethod                    = this._detectMethod(method_template, apiparams),
        multipart                     = this._detectMultipart(method_template);

      return this._callApi(
          httpmethod,
          method,
          apiparams,
          multipart,
          app_only_auth,
          callback
        );
    }
  };

  if (typeof module === "object"
    && module
    && typeof module.exports === "object"
    ) {
    // Expose codebird as module.exports in loaders that implement the Node
    // module pattern (including browserify). Do not create the global, since
    // the user will be storing it themselves locally, and globals are frowned
    // upon in the Node module world.
    module.exports = Codebird;
  } else {
    // Otherwise expose codebird to the global object as usual
    if (typeof window === "object"
      && window) {
      window.Codebird = Codebird;
    }

    // Register as a named AMD module, since codebird can be concatenated with other
    // files that may use define, but not via a proper concatenation script that
    // understands anonymous AMD modules. A named AMD is safest and most robust
    // way to register. Lowercase codebird is used because AMD module names are
    // derived from file names, and codebird is normally delivered in a lowercase
    // file name. Do this after creating the global so that if an AMD module wants
    // to call noConflict to hide this version of codebird, it will work.
    if (typeof define === "function" && define.amd) {
      define("codebird", [], () => Codebird);
    }
  }

})();
