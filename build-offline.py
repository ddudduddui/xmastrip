# -*- coding: utf-8 -*-
"""offline.html 을 만든다 — 인터넷도 서비스워커도 필요 없는 단일 파일.

index.html 을 고친 뒤 이 스크립트를 다시 돌리면 offline.html 이 갱신된다.
    python -I build-offline.py
"""
import io, os, re, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))


def read(name):
    with open(os.path.join(HERE, name), encoding='utf-8') as f:
        return f.read()


src = read('index.html')
css = read(os.path.join('vendor', 'leaflet.css'))
js = read(os.path.join('vendor', 'leaflet.js'))

out = src

# ── ① 외부 파일 참조를 걷어낸다 (단일 파일에는 옆에 둘 파일이 없다) ──
out = re.sub(r'\s*<link rel="apple-touch-icon"[^>]*>', '', out)
out = re.sub(r'\s*<link rel="icon"[^>]*>', '', out)
out = re.sub(r'\s*<link rel="manifest"[^>]*>', '', out)

# ── ② 서비스워커 등록 코드 제거 ──
i = out.find('/* ══════════════ 오프라인 ══════════════ */')
if i > 0:
    j = out.find('</script>', i)
    out = out[:i] + '/* 단일 파일판 — 서비스워커를 쓰지 않는다 */\n' + out[j:]

# ── ③ leaflet 을 통째로 심는다 ──
#    앱의 loadLeaflet() 은 window.L 이 이미 있으면 그대로 쓴다
mark = '</head>'
assert out.count(mark) >= 1
inject = (
    '<style>/* leaflet.css (내장) */\n' + css + '\n</style>\n'
    '<script>/* leaflet.js (내장) */\n' + js + '\n</script>\n'
)
out = out.replace(mark, inject + mark, 1)

# ── ④ 단일 파일임을 표시 ──
out = out.replace(
    '<div id="offstat" class="note">확인 중…</div>',
    '<div id="offstat" class="note">📄 <b>단일 파일판입니다.</b> 인터넷 없이 그냥 열립니다 — '
    '서비스워커도 캐시도 필요 없습니다.<br>'
    '⚠️ 일정이 바뀌면 <b>새 파일을 다시 받아야</b> 합니다. 자동 갱신은 안 됩니다.<br>'
    '지도 그림(타일)만 인터넷이 필요합니다 — 구글지도 오프라인 지도로 대신하세요.</div>', 1)
out = re.sub(r'<div class="btns" style="margin-top:8px">.*?</div>\n  </div>',
             '</div>', out, count=1, flags=re.S)

with open(os.path.join(HERE, 'offline.html'), 'w', encoding='utf-8') as f:
    f.write(out)

print('offline.html 생성 완료 — %.0f KB' % (len(out.encode('utf-8')) / 1024))
