// Cloudflare Pages Functions — /api/guestbook
// GET  -> 최근 방명록 목록
// POST -> 방명록 등록 { name, message }

const MAX_NAME = 20;
const MAX_MESSAGE = 500;

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT id, name, message, created_at FROM guestbook ORDER BY id DESC LIMIT 100"
  ).all();
  return Response.json(results);
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const message = (body.message ?? "").trim();

  // 입력 검증 = 스팸/DB오염 방지의 신뢰경계. 절대 생략 금지.
  if (!name || !message) {
    return Response.json({ error: "이름과 메시지를 입력하세요" }, { status: 400 });
  }
  if (name.length > MAX_NAME || message.length > MAX_MESSAGE) {
    return Response.json({ error: "글자 수 초과" }, { status: 400 });
  }

  await env.DB.prepare("INSERT INTO guestbook (name, message) VALUES (?, ?)")
    .bind(name, message)
    .run();

  return Response.json({ ok: true }, { status: 201 });
}
