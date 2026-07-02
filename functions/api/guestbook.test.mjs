// 방명록 검증 로직 자체 체크. `node functions/api/guestbook.test.mjs`
// D1 을 최소한으로 흉내내는 stub 으로 onRequestPost 검증만 확인한다.
import assert from "node:assert";
import { onRequestPost } from "./guestbook.js";

const dbStub = {
  prepare() { return this; },
  bind() { return this; },
  async run() { return { success: true }; },
};

function req(payload) {
  return new Request("http://x/api/guestbook", {
    method: "POST",
    body: typeof payload === "string" ? payload : JSON.stringify(payload),
  });
}

// 정상
let r = await onRequestPost({ request: req({ name: "김하객", message: "축하해요" }), env: { DB: dbStub } });
assert.equal(r.status, 201);

// 빈 값 거부
r = await onRequestPost({ request: req({ name: " ", message: "" }), env: { DB: dbStub } });
assert.equal(r.status, 400);

// 글자 수 초과 거부 (스팸 방지)
r = await onRequestPost({ request: req({ name: "김하객", message: "x".repeat(501) }), env: { DB: dbStub } });
assert.equal(r.status, 400);

// 깨진 JSON 거부
r = await onRequestPost({ request: req("not json"), env: { DB: dbStub } });
assert.equal(r.status, 400);

console.log("ok");
