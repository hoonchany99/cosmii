# quiz.html (Marissa v27) -> cosmii frontend/public/quiz/: app.html + portraits + og images.
import re, json, base64, shutil, sys, os
SRC = os.path.expanduser("~/team/marketing/outputs/2026-11-06-quiz/v27-trait")
OUT = os.path.expanduser("~/Desktop/Utopify/cosmii/.claude/worktrees/quiz/frontend/public/quiz")
# The handoff table (Marissa) is the one list: slug, name, og title/description/image.
ROWS = []
for line in open(f"{SRC}/handoff-vercel.md", encoding="utf-8"):
    c = [x.strip() for x in line.strip().strip("|").split("|")]
    if len(c) == 5 and re.fullmatch(r"[a-z]+", c[0]) and c[0] != "slug":
        ROWS.append(dict(slug=c[0], name=c[1], title=c[2], line=c[3], og=c[4]))
SLUG = {r["name"]: r["slug"] for r in ROWS}
s = open(f"{SRC}/quiz.html", encoding="utf-8").read()
os.makedirs(f"{OUT}/p", exist_ok=True); os.makedirs(f"{OUT}/og", exist_ok=True)

# 1. portraits: base64 -> files, only the 12 the quiz shows
m = re.search(r"const PORT=(\{.*?\});", s, re.S)
port = json.loads(m.group(1))
keep = {}
for name, slug in SLUG.items():
    p = port[name]
    head, b64 = p["src"].split(",", 1)
    assert head == "data:image/jpeg;base64"
    open(f"{OUT}/p/{slug}.jpg", "wb").write(base64.b64decode(b64))
    keep[name] = {**p, "src": f"/quiz/p/{slug}.jpg"}
s = s[:m.start()] + "const PORT=" + json.dumps(keep, ensure_ascii=False) + ";" + s[m.end():]

# 2. og images with ascii names, and the server's table
for r in ROWS:
    shutil.copy(f"{SRC}/og/{r['og']}", f"{OUT}/og/{r['slug']}.png")
LIB = OUT.replace("/public/quiz", "/src/lib/quiz-results.ts")
open(LIB, "w", encoding="utf-8").write(
    "// Made by scripts/build-quiz.py from Marissa's handoff table; edit there, not here.\n"
    "export const QUIZ_RESULTS: Record<string, { name: string; title: string; line: string }> = "
    + json.dumps({r["slug"]: {"name": r["name"], "title": r["title"], "line": r["line"]} for r in ROWS}, ensure_ascii=False, indent=2) + ";\n")

# 3. head: the server fills <!--HEAD--> per address
s = s.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "", 1)
s = s.replace("<title>나는 고전 속 누구와 닮았을까?</title>",
  '<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<!--HEAD-->', 1)

def sub(old, new):
    global s
    assert s.count(old) == 1, old[:60]
    s = s.replace(old, new)

# 4. a result can be opened by its address (/quiz/r/<slug>), with no answers behind it
sub("const app=document.getElementById('app');let st;",
    "const app=document.getElementById('app');let st;\nconst SLUG=" + json.dumps(SLUG, ensure_ascii=False) + ";const DIRECT=window.__QUIZ_RESULT__||null;")
sub("function back(){clearTimeout(window.anT);const v=st.view;",
    "function back(){clearTimeout(window.anT);if(st.direct){location.href='/quiz';return}const v=st.view;")
sub("function result(){st.view='result';const a=st.a;const nm=pick(),r=D[nm];",
    "function result(direct){st.view='result';st.direct=!!direct;const a=st.a;const nm=direct||pick(),r=D[nm];")
sub("const ci=C.indexOf(nm),pts=DQ.map(", "const ci=C.indexOf(nm),pts=direct?[]:DQ.map(")
sub("const g=Object.keys(a).reduce(", "const g=direct?0:Object.keys(a).reduce(")
sub("<section class=\"rmeta\" aria-label=\"분석 기준\"><h3>이 답이 크게 닮았어</h3><dl>${meta.map(m=>`<div><dt>${esc(m[0])}</dt><dd>${esc(m[1])}</dd></div>`).join('')}</dl></section>",
    "${meta.length?`<section class=\"rmeta\" aria-label=\"분석 기준\"><h3>이 답이 크게 닮았어</h3><dl>${meta.map(m=>`<div><dt>${esc(m[0])}</dt><dd>${esc(m[1])}</dd></div>`).join('')}</dl></section>`:''}")
sub("<br>(퀴즈 링크)</p>", "<br>${esc(location.origin)}/quiz/r/${SLUG[name]}</p>")
# 5. share: the system share sheet with the result's address (handoff 공유 문구, ct=quiz_share)
sub("document.getElementById('share').onclick=()=>toast(\"시안이에요. 실제에서는 공유 창이 열려요\");",
    "document.getElementById('share').onclick=async()=>{const url=location.origin+'/quiz/r/'+SLUG[name]+'?ct=quiz_share';const text=name+' — 『'+book+'』 속 인물\\n'+r.nick+'\\n\\n고전 속에서 나와 닮은 사람 찾기';"
    "try{if(navigator.share){await navigator.share({text,url});return}}catch(e){if(e&&e.name==='AbortError')return}"
    "try{await navigator.clipboard.writeText(text+'\\n'+url);toast('링크를 복사했어')}catch(e){toast(url)}};")
sub("document.getElementById('again').onclick=start;", "document.getElementById('again').onclick=()=>{if(st.direct){location.href='/quiz';return}start()};")
sub("document.getElementById('bk').onclick=back;\nstart();",
    "document.getElementById('bk').onclick=back;\nif(DIRECT&&D[DIRECT]){st={a:{},i:0,view:'result'};result(DIRECT)}else start();")
# 6. a result opened by its address is someone else's result (Marissa 11/10):
#    no progress or back, 「고전 속 인물」, 「나도 해 보기」, no email line.
sub("app.innerHTML=head(NT(),NT())+`<article class=\"slide res rep\"><p class=\"kick\">분석 리포트</p>",
    "app.innerHTML=head(direct?0:NT(),direct?0:NT())+`<article class=\"slide res rep\"><p class=\"kick\">${direct?'고전 속 인물':'분석 리포트'}</p>")
sub('<button class="btn sec" id="again">다시 하기</button>', '<button class="btn sec" id="again">${direct?\'나도 해 보기\':\'다시 하기\'}</button>')
sub('<p class="note">같은 내용을 이메일로도 보내 드려요(시안은 발송하지 않아요). ', '<p class="note">${direct?\'\':\'같은 내용을 이메일로도 보내 드려요(시안은 발송하지 않아요). \'}')
sub("document.getElementById('again').onclick=", "if(direct)document.getElementById('bk').hidden=true;\n document.getElementById('again').onclick=")
s = s.replace("</script>\n", "</script>\n</body></html>\n") if s.rstrip().endswith("</script>") else s
open(f"{OUT}/app.html", "w", encoding="utf-8").write(s)
print("app.html", len(s.encode()), "bytes")
