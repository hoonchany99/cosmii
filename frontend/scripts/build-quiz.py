# quiz.html (Marissa v27) -> cosmii frontend/public/quiz/: app.html + portraits + og images.
import re, json, base64, shutil, sys, os
SRC = os.path.expanduser("~/team/marketing/outputs/2026-11-06-quiz/v27-trait")
OUT = os.path.expanduser("~/Desktop/Utopify/cosmii/.claude/worktrees/quiz/frontend/public/quiz")
SLUG = {"엘리자베스":"elizabeth","오디세우스":"odysseus","햄릿":"hamlet","파우스트":"faust","단테":"dante","그레고르 잠자":"gregor",
        "아킬레우스":"achilles","헥토르":"hector","코딜리아":"cordelia","페넬로페":"penelope","에픽테토스":"epictetus","마르쿠스 아우렐리우스":"marcus"}
OG = ["엘리자베스","오디세우스","햄릿","파우스트","단테","그레고르잠자","아킬레우스","헥토르","코딜리아","페넬로페","에픽테토스","마르쿠스아우렐리우스"]
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

# 2. og images with ascii names
for i, (name, slug) in enumerate(SLUG.items()):
    shutil.copy(f"{SRC}/og/og-{i:02d}-{OG[i]}.png", f"{OUT}/og/{slug}.png")

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
s = s.replace("</script>\n", "</script>\n</body></html>\n") if s.rstrip().endswith("</script>") else s
open(f"{OUT}/app.html", "w", encoding="utf-8").write(s)
print("app.html", len(s.encode()), "bytes")
