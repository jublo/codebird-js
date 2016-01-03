const tape = require("tape"),
  _test = require("tape-promise"),
  test = _test(tape), // decorate tape
  CodebirdT = require("./codebirdt");

function getCB() {
  return new CodebirdT.default;
}

test("Tests _detectMethod", function (t) {
  const cb = getCB();

  t.throws(
    function () {
      cb.call("_detectMethod", ["non-existent", {}]);
    },
    /^Can't find HTTP method to use for "non-existent".$/
  );

  // forced httpmethod
  t.equal(
    cb.call("_detectMethod", ["doesnt-matter", {httpmethod: "DELETE"}]),
    "DELETE"
  );

  // normal detection
  t.equal(
    cb.call("_detectMethod", ["search/tweets", {}]),
    "GET"
  );
  t.equal(
    cb.call("_detectMethod", ["statuses/update", {}]),
    "POST"
  );
  t.equal(
    cb.call("_detectMethod", ["statuses/destroy/:id", {}]),
    "POST"
  );

  // parameter-based detection
  t.equal(
    cb.call("_detectMethod", ["account/settings", {}]),
    "GET"
  );
  t.equal(
    cb.call("_detectMethod", ["account/settings", {test: 12}]),
    "POST"
  );

  t.end();
});

test("Tests _detectMultipart", function (t) {
  const cb = getCB();

  t.false(cb.call("_detectMultipart", ["statuses/update"]));
  t.true(cb.call("_detectMultipart", ["statuses/update_with_media"]));
  t.true(cb.call("_detectMultipart", ["media/upload"]));

  t.end();
});

test("Tests _detectMedia", function (t) {
  const cb = getCB();

  t.false(cb.call("_detectMedia", ["statuses/update"]));
  t.true(cb.call("_detectMedia", ["media/upload"]));

  t.end();
});

test("Tests _getEndpoint", function (t) {
  const cb = getCB();

  t.equal(
    cb.call("_getEndpoint", ["statuses/update", "statuses/update"]),
    "https://api.twitter.com/1.1/statuses/update.json"
  );
  t.equal(
    cb.call("_getEndpoint", ["oauth/authenticate", "oauth/authenticate"]),
    "https://api.twitter.com/oauth/authenticate"
  );
  t.equal(
    cb.call("_getEndpoint", ["oauth2/token", "oauth2/token"]),
    "https://api.twitter.com/oauth2/token"
  );
  t.equal(
    cb.call("_getEndpoint", ["media/upload", "media/upload"]),
    "https://upload.twitter.com/1.1/media/upload.json"
  );

  t.end();
});
