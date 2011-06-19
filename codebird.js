/*  codebird-js
 *  Copyright (C) 2011 Jo Michael <me@mynetx.net>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var Codebird = (function () {
    var _version = "1.1.2816.2016",
        endpoint = "https://api.twitter.com/1/",
        key = {},
        token = {},
        ReturnFormats = {
            Object: 1,
            String: 2
        },
        ReturnFormat = null,
        Init = function () {
            ReturnFormat = ReturnFormats.Object
        },
        Url = function (a) {
            return encodeURIComponent(a).replace(/\!/g, "%21").replace(/\*/g, "%2A").replace(/\'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29")
        },
        SortArray = function (a) {
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
        },
        SHA1 = function (a) {
            b64pad = "=";
            return b64_hmac_sha1(key.s + "&" + (token.s ? token.s : ""), a)
        },
        Timestamp = function () {
            return Math.floor((new Date).getTime() / 1E3)
        },
        Nonce = function (a) {
            for (var b = "", f = 0; f < a; ++f) {
                var c = Math.floor(Math.random() * 61);
                b += "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".substring(c, c + 1)
            }
            return b
        },
        Sign = function (a, b, f) {
            var c = {
                consumer_key: key.k,
                version: "1.0",
                timestamp: Timestamp(),
                nonce: Nonce(6),
                signature_method: "HMAC-SHA1"
            },
                d = {};
            for (var e in c) d["oauth_" + e] = Url(c[e]);
            if (token.k) d.oauth_token = Url(token.k);
            for (e in f) d[e] = Url(f[e]);
            var c = "";
            d = SortArray(d);
            for (e in d) {
                c += e + "=" + d[e] + "&";
            }
            f = SHA1(a + "&" + Url(b) + "&" + Url(c.substring(0, c.length - 1)));
            return ((a == "GET" ? b + "?" : "") + c + "oauth_signature=" + Url(f));
        },
        CallApi = function (x, a, b, f, c) {
            if (c && !token.k) f(401, {});
            else {
                a = a.substring(0, 6) == "oauth/" ? "https://api.twitter.com/" + a : endpoint + a + ".json";
                var e = new ActiveXObject("Microsoft.XMLHTTP");
                if (x == "GET") e.open("GET", Sign("GET", a, b), true);
                else {
                    e.open("POST", a, true);
                    e.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                }
                e.onreadystatechange = function () {
                    if (!(e.readyState < 4)) {
                        var g = 12027;
                        try {
                            g = e.status
                        } catch (h) {}
                        ReturnFormat == ReturnFormats.Object ? (f ||
                        function () {})(g, ParseApiReply(e.responsetext)) : (f ||
                        function () {})(g, e.responsetext)
                    }
                };
                e.send(x == "GET" ? null : Sign("POST", a, b))
            }
        },
        CallApiGet = function (a, b, f, c) {
            CallApi("GET", a, b, f, c);
        },
        CallApiPost = function (a, b, f, c) {
            CallApi("POST", a, b, f, c);
        },
        ParseApiReply = function (a) {
            var b = {};
            try {
                b = eval("(" + a + ")")
            } catch (f) {
                if (a) {
                    a = a.split("&");
                    for (var c = 0; c < a.length; c++) {
                        var d = a[c].split("=");
                        b[d[0]] = d[1]
                    }
                }
            }
            return b
        },
        PublicTimelineCache = {
            timestamp: null,
            data: null
        };
    Init();
    var objPublic = {
        Init: Init,
        ReturnFormats: ReturnFormats,
        Url: Url,
        SetReturnFormat: function (a) {
            ReturnFormat = a
        },
        SetKey: function (a) {
            key = a
        },
        SetToken: function (a) {
            token = a
        },
        SetEndpoint: function (a) {
            endpoint = a
        },
        Account: {
            EndSession: function () {
                token = {}
            },
            RateLimitStatus: function (a) {
                CallApiGet("account/rate_limit_status", {}, a, true)
            },
            UpdateDeliveryDevice: function (a, b) {
                CallApiPost("account/update_delivery_device", a, b, true)
            },
            UpdateProfile: function (a, b) {
                CallApiPost("account/update_profile", a, b, true)
            },
            UpdateProfileColors: function (a, b) {
                CallApiPost("account/update_profile_colors", a, b, true)
            },
            UpdateProfileBackgroundImage: function (a, b) {
                throw new Exception("Account.UpdateProfileBackgroundImage: Requires OAuth with multipart POST. You know how? Tell me.");
            },
            UpdateProfileImage: function (a, b) {
                throw new Exception("Account.UpdateProfileImage: Requires OAuth with multipart POST. You know how? Tell me.");
            },
            VerifyCredentials: function (a) {
                CallApiGet("account/verify_credentials", {
                    suppress_response_codes: true
                }, a, true)
            }
        },
        Blocks: {
            Blocking: function (a, b) {
                CallApiGet("blocks/blocking", a, b, true)
            },
            BlockingIds: function (a, b) {
                CallApiGet("blocks/blocking/ids", a, b, true)
            },
            Create: function (a, b) {
                if (!a.id) throw new Exception("Blocks.Create: Missing parameter id.");
                CallApiPost("blocks/create/" + a.id, a, b, true)
            },
            Destroy: function (a, b) {
                if (!a.id) throw new Exception("Blocks.Destroy: Missing parameter id.");
                CallApiPost("blocks/destroy/" + a.id, a, b, true)
            },
            Exists: function (a, b) {
                if (!a.id) throw new Exception("Blocks.Exists: Missing parameter id.");
                CallApiGet("blocks/exists/" + a.id, a, b, true)
            }
        },
        DirectMessages: function (a, b) {
            CallApiGet("direct_messages", a, b, true)
        },
        Favorites: function (a, b) {
            CallApiGet("favorites", a, b, true)
        },
        Followers: {
            Ids: function (a, b) {
                CallApiGet("followers/ids", a, b, true)
            }
        },
        Friends: {
            Ids: function (a, b) {
                CallApiGet("friends/ids", a, b, true)
            }
        },
        Friendships: {
            Create: function (a, b) {
                if (!a.id) throw new Exception("Friendships.Create: Missing parameter id.");
                CallApiPost("friendships/create/" + a.id, a, b, true)
            },
            Destroy: function (a, b) {
                if (!a.id) throw new Exception("Friendships.Destroy: Missing parameter id.");
                CallApiPost("friendships/destroy/" + a.id, a, b, true)
            },
            Exists: function (a, b) {
                CallApiGet("friendships/exists", a, b, true)
            },
            Show: function (a, b) {
                CallApiGet("friendships/show", a, b, true)
            }
        },
        Geo: {
            Id: function (a, b) {
                if (!a.id) throw new Exception("Geo.Id: Missing parameter id.");
                CallApiGet("geo/id" + a.id, a, b, false)
            },
            NearbyPlaces: function (a, b) {
                CallApiGet("geo/nearby_places", a, b, true)
            },
            Place: function (a, b) {
                CallApiPost("geo/place", a, b, true)
            },
            ReverseGeocode: function (a, b) {
                CallApiGet("geo/reverse_geocode", a, b, false)
            },
            Search: function (a, b) {
                CallApiGet("geo/search", a, b, false)
            },
            SimilarPlaces: function (a, b) {
                CallApiGet("geo/similar_places", a, b, false)
            }
        },
        Help: {
            Test: function (a) {
                CallApiGet("help/test", {}, a, false)
            }
        },
        Legal: {
            Privacy: function (a) {
                CallApiGet("legal/privacy", {}, a, false)
            },
            Tos: function (a) {
                CallApiGet("legal/tos", {}, a, false)
            }
        },
        Notifications: {
            Follow: function (a, b) {
                if (!a.id) throw new Exception("Notifications.Follow: Missing parameter id.");
                CallApiPost("notifications/follow/" + a.id, a, b, true)
            },
            Leave: function (a, b) {
                if (!a.id) throw new Exception("Notifications.Leave: Missing parameter id.");
                CallApiPost("notifications/leave/" + a.id, a, b, true)
            }
        },
        Oauth: {
            RequestToken: function (a) {
                CallApiGet("oauth/request_token", {}, a, false)
            },
            Authorize: function () {
                return "https://twitter.com/oauth/authorize?oauth_token=" + token.k;
            },
            AccessToken: function (a, b) {
                CallApiPost("oauth/access_token", a, b, true)
            }
        },
        ReportSpam: function (a, b) {
            CallApiPost("report_spam", a, b, true)
        },
        SavedSearches: function (a, b) {
            CallApiGet("saved_searches", a, b, true)
        },
        Statuses: {
            DestroyId: function (a, b) {
                if (!a.id) throw new Exception("Statuses.DestroyId: Missing parameter id.");
                CallApiPost("statuses/destroy/" + a.id, {}, b, true)
            },
            Followers: function (a, b) {
                CallApiGet("statuses/followers", a, b, true)
            },
            Friends: function (a, b) {
                CallApiGet("statuses/friends", a, b, true)
            },
            FriendsTimeline: function (a, b) {
                CallApiGet("statuses/friends_timeline", a, b, true)
            },
            HomeTimeline: function (a, b) {
                CallApiGet("statuses/home_timeline", a, b, true)
            },
            Id: {
                RetweetedBy: function (a, b) {
                    if (!a.id) throw new Exception("Statuses.Id.RetweetedBy: Missing parameter id.");
                    CallApiGet("statuses/" + a.id + "/retweeted_by", a, b, true)
                },
                RetweetedByIds: function (a, b) {
                    if (!a.id) throw new Exception("Statuses.Id.RetweetedByIds: Missing parameter id.");
                    CallApiGet("statuses/" + a.id + "/retweeted_by/ids", a, b, true)
                }
            },
            Mentions: function (a, b) {
                CallApiGet("statuses/mentions", a, b, true)
            },
            PublicTimeline: function (a) {
                PublicTimelineCache.timestamp && PublicTimelineCache.timestamp + 60 > Timestamp() ? a(200, PublicTimelineCache.data) : CallApiGet("statuses/public_timeline", {},

                function (b, f) {
                    if (b == 200) PublicTimelineCache = {
                        timestamp: Timestamp(),
                        data: f
                    };
                    a(b, f)
                }, true)
            },
            Retweet: {
                Id: function (a, b) {
                    if (!a.id) throw new Exception("Statuses.Retweet.Id: Missing parameter id.");
                    CallApiPost("statuses/retweet/" + a.id, {}, b, true)
                }
            },
            Retweets: {
                Id: function (a, b) {
                    if (!a.id) throw new Exception("Statuses.Retweets.Id: Missing parameter id.");
                    CallApiGet("statuses/retweets/" + a.id, a, b, true)
                }
            },
            RetweetedByMe: function (a, b) {
                CallApiGet("statuses/retweeted_by_me", a, b, true)
            },
            RetweetedToMe: function (a, b) {
                CallApiGet("statuses/retweeted_to_me", a, b, true)
            },
            RetweetsOfMe: function (a, b) {
                CallApiGet("statuses/retweets_of_me", a, b, true)
            },
            Show: {
                Id: function (a, b) {
                    if (!a.id) throw new Exception("Statuses.Show.Id: Missing parameter id.");
                    CallApiGet("statuses/show/" + a.id, {}, b, true)
                }
            },
            Update: function (a, b) {
                CallApiPost("statuses/update", a, b, true)
            },
            UserTimeline: function (a, b) {
                CallApiGet("statuses/user_timeline", a, b, true)
            }
        },
        ReportSpam: function (a, b) {
            CallApiPost("report_spam", a, b, true)
        },
        Trends: function (a, b) {
            CallApiGet("trends", a, b, false)
        },
        User: {
            ListId: {
                Members: {
                    Delete: function (a, b) {
                        if (!a.user) throw new Exception("User.ListId.Members: Missing parameter user.");
                        if (!a.list_id) throw new Exception("User.ListId.Members: Missing parameter list_id.");
                        a._method = "DELETE";
                        CallApiPost(a.user + "/" + a.list_id + "/members", a, b, true)
                    },
                    Get: function (a, b) {
                        if (!a.user) throw new Exception("User.ListId.Members: Missing parameter user.");
                        if (!a.list_id) throw new Exception("User.ListId.Members: Missing parameter list_id.");
                        CallApiGet(a.user + "/" + a.list_id + "/members", a, b, true)
                    },
                    Post: function (a, b) {
                        if (!a.user) throw new Exception("User.ListId.Members: Missing parameter user.");
                        if (!a.list_id) throw new Exception("User.ListId.Members: Missing parameter list_id.");
                        CallApiPost(a.user + "/" + a.list_id + "/members", a, b, true)
                    },
                    Id: function (a, b) {
                        if (!a.user) throw new Exception("User.ListId.Members.Id: Missing parameter user.");
                        if (!a.list_id) throw new Exception("User.ListId.Members.Id: Missing parameter list_id.");
                        if (!a.id) throw new Exception("User.ListId.Members.Id: Missing parameter id.");
                        CallApiGet(a.user + "/" + a.list_id + "/members/" + a.id, a, b, true)
                    }
                },
                CreateAll: function (a, b) {
                    if (!a.user) throw new Exception("User.ListId.CreateAll: Missing parameter user.");
                    if (!a.list_id) throw new Exception("User.ListId.CreateAll: Missing parameter list_id.");
                    CallApiPost(a.user + "/" + a.list_id + "/create_all", a, b, true)
                },
                Subscribers: {
                    Delete: function (a, b) {
                        if (!a.user) throw new Exception("User.ListId.Subscribers: Missing parameter user.");
                        if (!a.list_id) throw new Exception("User.ListId.Subscribers: Missing parameter list_id.");
                        a._method = "DELETE";
                        CallApiPost(a.user + "/" + a.list_id + "/subscribers", a, b, true)
                    },
                    Get: function (a, b) {
                        if (!a.user) throw new Exception("User.ListId.Subscribers: Missing parameter user.");
                        if (!a.list_id) throw new Exception("User.ListId.Subscribers: Missing parameter list_id.");
                        CallApiGet(a.user + "/" + a.list_id + "/subscribers", a, b, true)
                    },
                    Post: function (a, b) {
                        if (!a.user) throw new Exception("User.ListId.Subscribers: Missing parameter user.");
                        if (!a.list_id) throw new Exception("User.ListId.Subscribers: Missing parameter list_id.");
                        CallApiPost(a.user + "/" + a.list_id + "/subscribers", a, b, true)
                    },
                    Id: function (a, b) {
                        if (!a.user) throw new Exception("User.ListId.Subscribers.Id: Missing parameter user.");
                        if (!a.list_id) throw new Exception("User.ListId.Subscribers.Id: Missing parameter list_id.");
                        if (!a.id) throw new Exception("User.ListId.Subscribers.Id: Missing parameter id.");
                        CallApiGet(a.user + "/" + a.list_id + "/subscribers/" + a.id, a, b, true)
                    }
                }
            },
            Lists: {
                Get: function (a, b) {
                    if (!a.user) throw new Exception("User.Lists: Missing parameter user.");
                    CallApiGet(a.user + "/lists", a, b, true)
                },
                Post: function (a, b) {
                    if (!a.user) throw new Exception("User.Lists: Missing parameter user.");
                    CallApiPost(a.user + "/lists", a, b, true)
                },
                Id: {
                    Delete: function (a, b) {
                        if (!a.user) throw new Exception("User.Lists.Id: Missing parameter user.");
                        if (!a.id) throw new Exception("User.Lists.Id: Missing parameter id.");
                        a._method = "DELETE";
                        CallApiPost(a.user + "/lists/" + a.id, a, b, true)
                    },
                    Get: function (a, b) {
                        if (!a.user) throw new Exception("User.Lists.Id: Missing parameter user.");
                        if (!a.id) throw new Exception("User.Lists.Id: Missing parameter id.");
                        CallApiGet(a.user + "/lists/" + a.id, a, b, true)
                    },
                    Post: function (a, b) {
                        if (!a.user) throw new Exception("User.Lists.Id: Missing parameter user.");
                        if (!a.id) throw new Exception("User.Lists.Id: Missing parameter id.");
                        CallApiPost(a.user + "/lists/" + a.id, a, b, true)
                    },
                    Statuses: function (a, b) {
                        if (!a.user) throw new Exception("User.Lists.Id.Statuses: Missing parameter user.");
                        if (!a.id) throw new Exception("User.Lists.Id.Statuses: Missing parameter id.");
                        CallApiGet(a.user + "/lists/" + a.id + "/statuses", a, b, false)
                    }
                },
                Memberships: function (a, b) {
                    if (!a.user) throw new Exception("User.Lists.Memberships: Missing parameter user.");
                    CallApiGet(a.user + "/lists/memberships", a, b, true)
                },
                Subscriptions: function (a, b) {
                    if (!a.user) throw new Exception("User.Lists.Subscriptions: Missing parameter user.");
                    CallApiGet(a.user + "/lists/subscriptions", a, b, true)
                }
            }
        },
        Users: {
            Lookup: function (a, b) {
                CallApiGet("users/lookup", a, b, true)
            },
            ProfileImage: {
                ScreenName: function (a, b) { /* TODO: This API call returns a 302 redirect. We need to find out how to handle. */
                    if (!a.screen_name) throw new Exception("Users.ProfileImage.ScreenName: Missing parameter screen_name.");
                    CallApiGet("users/profile_image/" + a.screen_name, a, b, false)
                }
            },
            Search: function (a, b) {
                CallApiGet("users/search", a, b, true)
            },
            Show: function (a, b) {
                CallApiGet("users/show", a, b, true)
            },
            Suggestions_: function (a, b) {
                CallApiGet("users/suggestions", a, b, true)
            },
            Suggestions: {
                Slug: function (a, b) {
                    if (!a.slug) throw new Exception("Users.Suggestions.Slug: Missing parameter slug.");
                    CallApiGet("users/suggestions/" + a.slug, a, b, false)
                }
            }
        }
    };
    var objPublic2 = {
        DirectMessages: {
            Destroy: function (a, b) {
                if (!a.id) throw new Exception("DirectMessages.Destroy: Missing parameter id.");
                CallApiPost("direct_messages/destroy/" + a.id, {}, b, true)
            },
            New: function (a, b) {
                CallApiPost("direct_messages/new", a, b, true)
            },
            Sent: function (a, b) {
                CallApiGet("direct_messages/sent", a, b, true)
            }
        },
        Favorites: {
            Create: function (a, b) {
                if (!a.id) throw new Exception("Favorites.Create: Missing parameter id.");
                CallApiPost("favorites/create/" + a.id, a, b, true)
            },
            Destroy: function (a, b) {
                if (!a.id) throw new Exception("Favorites.Destroy: Missing parameter id.");
                CallApiPost("favorites/destroy/" + a.id, a, b, true)
            },
            Favorites: function (a, b) {
                CallApiGet("favorites", a, b, true)
            }
        },
        SavedSearches: {
            Destroy: function (a, b) {
                if (!a.id) throw new Exception("SavedSearches.Destroy: Missing parameter id.");
                CallApiPost("saved_searches/destroy/" + a.id, {}, b, true)
            },
            Create: function (a, b) {
                CallApiPost("saved_searches/create", a, b, true)
            },
            SavedSearches: function (a, b) {
                CallApiGet("saved_searches", a, b, true)
            },
            Show: function (a, b) {
                if (!a.id) throw new Exception("SavedSearches.Show: Missing parameter id.");
                CallApiGet("saved_searches/show/" + a.id, {}, b, true)
            }
        },
        Trends: {
            Available: function (a, b) {
                CallApiGet("trends/available", a, b, false)
            },
            Current: function (a, b) {
                CallApiGet("trends/current", a, b, false)
            },
            Daily: function (a, b) {
                CallApiGet("trends/daily", a, b, false)
            },
            Weekly: function (a, b) {
                CallApiGet("trends/weekly", a, b, false)
            },
            Woeid: function (a, b) {
                if (!a.woeid) throw new Exception("Trends.Woeid: Missing parameter woeid.");
                CallApiGet("trends/" + a.woeid, a, b, false)
            }
        }
    };
    for (var strMergeNode in objPublic2) {
        for (var strMergeFn in objPublic2[strMergeNode]) {
            objPublic[strMergeNode][strMergeFn] = objPublic2[strMergeNode][strMergeFn];
        }
    }

    return objPublic;
})();