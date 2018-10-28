const tape = require("tape"),
  _test = require("tape-promise"),
  test = _test(tape), // decorate tape
  CodebirdT = require("./codebirdt"),
  CodebirdM = require("./codebirdm");

function getCB(mock) {
  if (typeof mock === "undefined") {
    var mock = false;
  }
  var cb = mock ? new CodebirdM.default() : new CodebirdT.default();
  cb.setConsumerKey("123", "456");

  return cb;
}

test("Tests setConsumerKey", function(t) {
  const cb = getCB();
  t.plan(2);

  t.equal(cb.get("_oauth_consumer_key"), "123");
  t.equal(cb.get("_oauth_consumer_secret"), "456");
});

test("Tests setBearerToken", function(t) {
  const cb = getCB();
  t.plan(1);

  let token = "some bearer token to test";
  cb.setBearerToken(token);
  t.equal(cb.get("_oauth_bearer_token"), token);
});

test("Tests getVersion", function(t) {
  const cb = getCB();
  t.plan(1);

  t.ok(cb.getVersion().match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/));
});

test("Tests setToken", function(t) {
  const cb = getCB();
  t.plan(2);

  cb.setToken("567", "789");

  t.equal(cb.get("_oauth_token"), "567");
  t.equal(cb.get("_oauth_token_secret"), "789");
});

test("Tests setUseProxy", function(t) {
  const cb = getCB();
  t.plan(5);

  cb.setUseProxy(1);
  t.equal(cb.get("_use_proxy"), true);
  cb.setUseProxy(0);
  t.equal(cb.get("_use_proxy"), false);
  cb.setUseProxy(true);
  t.equal(cb.get("_use_proxy"), true);
  cb.setUseProxy(false);
  t.equal(cb.get("_use_proxy"), false);
  cb.setUseProxy("test");
  t.equal(cb.get("_use_proxy"), true);
});

test("Tests setProxy", function(t) {
  const cb = getCB();
  t.plan(3);

  t.equal(cb.get("_endpoint_proxy"), "https://api.jublo.net/codebird/");
  cb.setProxy("/test");
  t.equal(cb.get("_endpoint_proxy"), "/test/");
  cb.setProxy("/test2/");
  t.equal(cb.get("_endpoint_proxy"), "/test2/");
});

test("Tests statuses/update", function(t) {
  const cb = getCB();
  t.plan(1);

  cb.setToken("123", "456");
  return cb
    .__call("statuses_update", { status: "Whohoo, I just tweeted!" })
    .then(function(reply, rate, err) {
      t.deepEqual(reply, {
        rate: {
          limit: null,
          remaining: null,
          reset: null
        },
        reply: {
          errors: [{ code: 89, message: "Invalid or expired token." }],
          httpstatus: 401
        }
      });
    });
});

test("Tests reply XML detection", function(t) {
  const cb = getCB(true);
  t.plan(1);

  cb.setToken("123", "456");
  return cb
    .__call("oauth_requestToken", {
      oauth_callback: "http://www.example.com/#xml_detection"
    })
    .then(function(reply, rate, err) {
      t.deepEqual(reply, {
        reply: {
          errors: {
            "415":
              "Callback URL not approved for this client application. Approved callback URLs can be adjusted in your application settings"
          },
          httpstatus: 401
        },
        rate: null
      });
    });
});

test("Tests logout method", function(t) {
  const cb = getCB(true);
  t.plan(4);

  cb.setToken("123", "456");

  t.equal(cb.get("_oauth_token"), "123");
  t.equal(cb.get("_oauth_token_secret"), "456");

  return cb.logout().then(function() {
    t.equal(cb.get("_oauth_token"), null);
    t.equal(cb.get("_oauth_token_secret"), null);
  });
});
