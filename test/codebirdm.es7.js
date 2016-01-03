import CodebirdT from "./codebirdt";

/**
 * A Twitter library in JavaScript
 *
 * @package   codebird-test
 * @version   3.0.0-dev
 * @author    Jublo Solutions <support@jublo.net>
 * @copyright 2010-2016 Jublo Solutions <support@jublo.net>
 * @license   http://opensource.org/licenses/GPL-3.0 GNU Public License 3.0
 * @link      https://github.com/jublonet/codebird-php
 */

/**
 * A Twitter library in JavaScript
 *
 * @package codebird-test
 */
export default class CodebirdM extends CodebirdT {

  constructor() {
    super();
    /**
     * Mock API replies
     */
    this._mock_replies = {
      default: {
        httpstatus: 404,
        reply: "{\"errors\":[{\"message\":\"Sorry, that page does not exist\",\"code\":34}]}"
      },
      "GET https://api.twitter.com/1.1/users/show.json?screen_name=TwitterAPI": {
        httpstatus: 200,
        reply: "{\"id\":6253282,\"id_str\":\"6253282\",\"name\":\"Twitter API\",\"screen_name\":\"twitterapi\",\"location\":\"San Francisco, CA\",\"profile_location\":null,\"description\":\"The Real Twitter API. I tweet about API changes, service issues and happily answer questions about Twitter and our API. Don't get an answer? It's on my website.\",\"url\":\"http:\/\/t.co\/78pYTvWfJd\",\"entities\":{\"url\":{\"urls\":[{\"url\":\"http:\/\/t.co\/78pYTvWfJd\",\"expanded_url\":\"http:\/\/dev.twitter.com\",\"display_url\":\"dev.twitter.com\",\"indices\":[0,22]}]},\"description\":{\"urls\":[]}},\"protected\":false,\"followers_count\":4993679,\"friends_count\":48,\"listed_count\":13001,\"created_at\":\"Wed May 23 06:01:13 +0000 2007\",\"favourites_count\":27,\"utc_offset\":-28800,\"time_zone\":\"Pacific Time (US & Canada)\",\"geo_enabled\":true,\"verified\":true,\"statuses_count\":3553,\"lang\":\"en\",\"status\":{\"created_at\":\"Tue Nov 24 08:56:07 +0000 2015\",\"id\":669077021138493440,\"id_str\":\"669077021138493440\",\"text\":\"Additional 64-bit entity ID migration coming in Feb 2016 https:\/\/t.co\/eQIGvw1rsJ\",\"source\":\"\u003ca href=\\\"https:\/\/about.twitter.com\/products\/tweetdeck\\\" rel=\\\"nofollow\\\"\u003eTweetDeck\u003c\/a\u003e\",\"truncated\":false,\"in_reply_to_status_id\":null,\"in_reply_to_status_id_str\":null,\"in_reply_to_user_id\":null,\"in_reply_to_user_id_str\":null,\"in_reply_to_screen_name\":null,\"geo\":null,\"coordinates\":null,\"place\":null,\"contributors\":null,\"retweet_count\":67,\"favorite_count\":79,\"entities\":{\"hashtags\":[],\"symbols\":[],\"user_mentions\":[],\"urls\":[{\"url\":\"https:\/\/t.co\/eQIGvw1rsJ\",\"expanded_url\":\"https:\/\/twittercommunity.com\/t\/migration-of-twitter-core-entities-to-64-bit-ids\/56881\",\"display_url\":\"twittercommunity.com\/t\/migration-of\u2026\",\"indices\":[57,80]}]},\"favorited\":false,\"retweeted\":false,\"possibly_sensitive\":false,\"lang\":\"en\"},\"contributors_enabled\":false,\"is_translator\":false,\"is_translation_enabled\":false,\"profile_background_color\":\"C0DEED\",\"profile_background_image_url\":\"http:\/\/pbs.twimg.com\/profile_background_images\/656927849\/miyt9dpjz77sc0w3d4vj.png\",\"profile_background_image_url_https\":\"https:\/\/pbs.twimg.com\/profile_background_images\/656927849\/miyt9dpjz77sc0w3d4vj.png\",\"profile_background_tile\":true,\"profile_image_url\":\"http:\/\/pbs.twimg.com\/profile_images\/2284174872\/7df3h38zabcvjylnyfe3_normal.png\",\"profile_image_url_https\":\"https:\/\/pbs.twimg.com\/profile_images\/2284174872\/7df3h38zabcvjylnyfe3_normal.png\",\"profile_banner_url\":\"https:\/\/pbs.twimg.com\/profile_banners\/6253282\/1431474710\",\"profile_link_color\":\"0084B4\",\"profile_sidebar_border_color\":\"C0DEED\",\"profile_sidebar_fill_color\":\"DDEEF6\",\"profile_text_color\":\"333333\",\"profile_use_background_image\":true,\"has_extended_profile\":false,\"default_profile\":false,\"default_profile_image\":false,\"following\":true,\"follow_request_sent\":false,\"notifications\":false}"
      },
      "POST https://api.twitter.com/oauth2/token": {
        httpstatus: 200,
        reply: "{\"token_type\":\"bearer\",\"access_token\":\"VqiO0n2HrKE\"}"
      }
    };

    this.xml = {
      readyState: 4,
      open: (httpmethod, url) => {
        this.xml.httpmethod = httpmethod;
        this.xml.url = url;
        const key = `${httpmethod} ${url}`;
        if (this._mock_replies.hasOwnProperty(key)) {
          this.xml.status       = this._mock_replies[key].httpstatus;
          this.xml.responseText = this._mock_replies[key].reply;
        } else {
          this.xml.status       = this._mock_replies.default.httpstatus;
          this.xml.responseText = this._mock_replies.default.reply;
        }
      },
      setRequestHeader: () => true,
      onreadystatechange: () => false,
      send: function () {
        setTimeout(this.onreadystatechange, 200);
      }
    };
  }

  _getXmlRequestObject() {
    return this.xml;
  };
}
