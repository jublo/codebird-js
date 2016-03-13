const tape = require("tape"),
  _test = require("tape-promise"),
  test = _test(tape), // decorate tape
  CodebirdT = require("./codebirdt");

function getCB() {
  var cb = new CodebirdT.default;
  cb.setConsumerKey("123", "456");

  return cb;
}

test("Tests statuses/update", function (t) {
  const cb = getCB();
  t.plan(1);

  cb.setToken("123", "456");
  return cb.__call(
    "statuses_update",
    {"status": "Whohoo, I just tweeted!"}
  ).then(function (reply, rate, err) {
    t.deepEqual(
      reply,
      {
        rate: {
          limit: null, remaining: null, reset: null
        },
        reply: {
          errors: [
            { code: 215, message: "Bad Authentication data." }
          ],
          httpstatus: 400
        }
      }
    )
  });
});
