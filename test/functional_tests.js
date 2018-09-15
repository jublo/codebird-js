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
