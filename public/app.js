// 음악 토글 (자동재생 차단 우회: 사용자 탭 시 재생)
const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("musicBtn");
musicBtn.addEventListener("click", () => {
  if (bgm.paused) {
    bgm.play();
    musicBtn.classList.add("playing");
  } else {
    bgm.pause();
    musicBtn.classList.remove("playing");
  }
});

// 사진 캐러셀
new Swiper(".swiper", {
  loop: true,
  pagination: { el: ".swiper-pagination" },
});

// 카카오 지도 — 주소를 좌표로 변환해서 마커 표시
const VENUE_ADDRESS = "서울 구로구 새말로 97"; // 신도림테크노마트
kakao.maps.load(() => {
  const mapEl = document.getElementById("map");
  const geocoder = new kakao.maps.services.Geocoder();
  geocoder.addressSearch(VENUE_ADDRESS, (result, status) => {
    if (status !== kakao.maps.services.Status.OK) return; // 주소 못 찾으면 조용히 skip
    const pos = new kakao.maps.LatLng(result[0].y, result[0].x);
    const map = new kakao.maps.Map(mapEl, { center: pos, level: 3 });
    new kakao.maps.Marker({ position: pos, map });
  });
});

// 방명록
const gbList = document.getElementById("gbList");
const gbForm = document.getElementById("gbForm");

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

async function loadGuestbook() {
  const res = await fetch("/api/guestbook");
  const items = await res.json();
  gbList.innerHTML = items
    .map(
      (it) =>
        `<li><strong>${escapeHtml(it.name)}</strong><span>${escapeHtml(it.message)}</span></li>`
    )
    .join("");
}

gbForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("gbName").value.trim();
  const message = document.getElementById("gbMessage").value.trim();
  if (!name || !message) return;

  const res = await fetch("/api/guestbook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, message }),
  });
  if (res.ok) {
    gbForm.reset();
    loadGuestbook();
  } else {
    const { error } = await res.json().catch(() => ({}));
    alert(error || "등록 실패");
  }
});

loadGuestbook();
