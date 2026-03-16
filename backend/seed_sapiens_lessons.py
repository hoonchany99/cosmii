"""Seed handcrafted demo lessons for Sapiens by Yuval Noah Harari."""
import json
import random
import ssl
import uuid
import os
import sys
import urllib.request
from pathlib import Path

sys.path.insert(0, os.path.dirname(__file__))
os.chdir(os.path.dirname(__file__))

from app.db import get_supabase
from app.config import settings

BOOK_ID = "45b77580"

COVER_URL = "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg"


def ensure_book():
    """Ensure book entry exists in DB."""
    sb = get_supabase()
    sb.table("books").upsert({
        "id": BOOK_ID,
        "title": "사피엔스",
        "author": "유발 하라리",
        "color": "#e67e22",
    }).execute()
    print("✓ Ensured book entry exists")


def ensure_cover():
    """Download Sapiens cover and update DB."""
    covers_dir = settings.covers_dir
    covers_dir.mkdir(parents=True, exist_ok=True)

    cover_path = covers_dir / f"{BOOK_ID}.jpg"
    if not cover_path.exists():
        print("Downloading Sapiens cover image...")
        try:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            req = urllib.request.Request(COVER_URL, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, context=ctx) as resp:
                cover_path.write_bytes(resp.read())
            print(f"  ✓ Saved cover to {cover_path}")
        except Exception as e:
            print(f"  ✗ Failed to download cover: {e}")
            return

    sb = get_supabase()
    sb.table("books").update({
        "cover_url": f"/covers/{BOOK_ID}.jpg",
        "author": "유발 하라리",
    }).eq("id", BOOK_ID).execute()
    print("  ✓ Updated book cover_url & author in DB")


# ═══════════════════════════════════════════════════════════════════
# 레슨 콘텐츠 — 처음 읽는 사람에게 설명하듯 친절하고 자세하게
# ═══════════════════════════════════════════════════════════════════

LESSONS = [
    # ══════════════════════════════════════════
    # 1부: 인지 혁명
    # ══════════════════════════════════════════

    # ── Ch.1 인지 혁명 (Part 1/3) ──
    {
        "title": "조상 놈의 역사 — 호모 사피엔스의 어두운 비밀",
        "chapter": "Ch.1 The Cognitive Revolution",
        "chapter_title": "인지 혁명",
        "part": 1, "total_parts": 3,
        "spark": "우리 조상은 '조상님'이 아니라 '조상 놈'이었다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "반가워! 오늘부터 유발 하라리의 '사피엔스'를 같이 읽어볼 거야. 이 책은 한마디로 — 별볼일 없었던 원시인들이 어떻게 지구의 주인이 됐는지를 풀어놓은 책이야.", "highlight": None},
            {"speaker": "cosmii", "text": "먼저 충격적인 사실부터 알려줄게. 하라리는 우리 조상을 '조상님'이 아니라 사실상 '조상 놈'이라고 불러. 왜냐면 — 호모 사피엔스의 선조는 '형제 살인범'이거든. 그것도 한 사람을 실수로 죽인 게 아니라, 조직적으로 다른 인류 종들을 집단 학살한 거야.", "highlight": "형제 살인범"},
            {"speaker": "cosmii", "text": "우리가 교과서에서 봤던 그 유명한 그림 있잖아. 원숭이 → 오스트랄로피테쿠스 → 호모 에렉투스 → 네안데르탈인 → 호모 사피엔스. 마치 한 줄로 진화한 것처럼 그려져 있지? 하라리는 이 그림을 완전히 부정해.", "highlight": "교과서의 거짓말"},
            {"speaker": "cosmii", "text": "실제로는 이 종들이 동시에 살았어! 사촌지간이었던 거야. 셰퍼드, 시추, 치와와가 같이 사는 것처럼, 여러 인류 종이 지구에 공존했어. 네안데르탈인, 호모 에렉투스, 호모 플로레시엔시스... 최소 6종 이상이 동시에 살았다고.", "highlight": "공존한 인류들"},
            {"speaker": "cosmii", "text": "그런데 호모 사피엔스가 나타나면서 다른 형제들이 하나둘씩 사라졌어. 우연이 아니야. 하라리의 표현대로라면, 사피엔스가 가는 곳마다 다른 인류 종이 멸종했어. 수만 년에 걸친 조직적 집단 학살이었던 거지.", "highlight": "집단 학살"},
            {"speaker": "cosmii", "text": "결국 우리 호모 사피엔스만 살아남았고, 지구의 유일한 인류가 됐어. 그래서 하라리가 던지는 질문이 이거야 — '도대체 별볼일 없었던 이 원시인들이, 어떻게 지구의 주인이 될 수 있었을까?' 이 질문이 사피엔스 전체를 끌고 가는 핵심이야.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "하라리가 교과서의 '인류 진화 그림'을 부정하는 이유는?",
                "options": ["진화 자체를 부정해서", "여러 인류 종이 동시에 공존했기 때문에", "원숭이에서 진화하지 않아서", "그림이 너무 오래되었으니까"],
                "correct_index": 1,
                "explanation": "교과서의 일직선 진화 그림과 달리, 실제로는 네안데르탈인, 호모 에렉투스 등 여러 인류 종이 동시에 지구에 공존했어. 사피엔스가 이들을 멸종시키고 유일한 인류가 된 거야."
            },
            {
                "question": "하라리가 호모 사피엔스를 '형제 살인범'이라 부르는 이유는?",
                "options": ["가족 간 싸움이 많아서", "다른 인류 종을 조직적으로 멸종시켰기 때문에", "동물을 사냥해서", "전쟁을 많이 해서"],
                "correct_index": 1,
                "explanation": "호모 사피엔스와 같은 시대에 살았던 네안데르탈인 등 다른 인류 종들은 사피엔스가 확장하면서 모두 사라졌어. 하라리는 이것을 조직적 집단 학살이라 표현해."
            }
        ],
        "cliffhanger": "그런데 사피엔스가 다른 인류 종보다 특별히 강하거나 똑똑했던 건 아니야. 진짜 비밀은 따로 있어."
    },

    # ── Ch.1 인지 혁명 (Part 2/3) ──
    {
        "title": "뒷담화가 세상을 바꿨다 — 인지 혁명의 시작",
        "chapter": "Ch.1 The Cognitive Revolution",
        "chapter_title": "인지 혁명",
        "part": 2, "total_parts": 3,
        "spark": "인간이 지구의 주인이 된 비밀은 근육도, 도구도 아닌 '뒷담화'에 있다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "자, 지난 레슨에서 사피엔스가 별볼일 없었다고 했잖아. 그럼 도대체 어떻게 지구의 주인이 됐을까? 흔히 생각하는 답은 — '인간은 지능이 높으니까, 도구를 잘 만드니까!' 이건데.", "highlight": None},
            {"speaker": "cosmii", "text": "재미있는 게, 조선후기의 정약용도 비슷한 말을 했어. '인간은 사자 같은 발톱도 없고, 뱀 같은 독도 없고, 독수리 같은 날개도 없는데 만물의 영장인 건 도구를 쓰기 때문이다.' 이게 지금까지의 상식이었어.", "highlight": "정약용의 답"},
            {"speaker": "cosmii", "text": "하라리는 이걸 뒤집어. '아니, 진짜 비밀은 뒷담화에 있다!' 뒷담화? 응, 뒷담화. 처음 듣고 나도 '뭐야 이게' 했는데, 듣다 보면 소름이 돋아.", "highlight": "뒷담화의 힘"},
            {"speaker": "cosmii", "text": "비교를 해보자. 침팬지 한 마리와 인간 한 명을 무인도에 풀어놓으면 누가 생존 가능성이 높을까? 침팬지야. 신체적으로 인간은 침팬지한테 상대가 안 돼. 스튜디오에 암컷 침팬지 한 마리를 넣고 인간 여섯 명과 싸움을 붙이면? 인간이 뜯어 먹혀.", "highlight": "침팬지 vs 인간"},
            {"speaker": "cosmii", "text": "그런데! 침팬지 만 마리 vs 인간 만 명의 전쟁을 치르면? 이건 인간이 이겨. 압도적으로. 왜? 인간은 조직적으로 협력하는 동물이거든. 개개인은 별거 아닌데, 뭉치면 엄청난 유연한 협력을 만들어내.", "highlight": "협력의 동물"},
            {"speaker": "cosmii", "text": "그럼 그 '뭉치는 힘'은 어디서 오느냐? 여기서 뒷담화가 등장해. 뒷담화라는 건 — 직접 만나보지 않은 사람에 대해 '그 사람 믿을 만해', '그 사람은 조심해'라고 정보를 나누는 거야. 이게 인간만의 특기야.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "침팬지 한 마리 vs 인간 한 명의 싸움에서 이기는 쪽은?",
                "options": ["인간", "침팬지", "비긴다", "상황에 따라 다르다"],
                "correct_index": 1,
                "explanation": "신체적으로 인간은 침팬지보다 약해. 하지만 만 명 단위의 전쟁에서는 인간이 이겨. 개체의 힘이 아니라 집단 협력이 인간의 진짜 무기야."
            },
            {
                "question": "하라리가 '도구'보다 더 중요하다고 본 인간의 핵심 능력은?",
                "options": ["빠른 달리기", "조직적이고 유연한 협력 능력", "큰 뇌의 크기", "불을 다루는 기술"],
                "correct_index": 1,
                "explanation": "도구도 중요하지만, 하라리가 보는 진짜 비밀은 수만 명이 유연하게 협력하는 능력이야. 이 협력을 가능하게 한 것이 뒷담화, 즉 인지 혁명이야."
            }
        ],
        "cliffhanger": "근데 뒷담화만으로는 150명까지밖에 못 뭉쳐. 수만 명을 뭉치게 한 진짜 비밀은 더 충격적이야."
    },

    # ── Ch.1 인지 혁명 (Part 3/3) ──
    {
        "title": "허구를 믿는 유일한 동물 — 사피엔스의 초능력",
        "chapter": "Ch.1 The Cognitive Revolution",
        "chapter_title": "인지 혁명",
        "part": 3, "total_parts": 3,
        "spark": "존재하지 않는 것을 집단적으로 믿는 능력, 이것이 인지 혁명이다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "뒷담화의 한계는 150명이야. 인간이 개인적으로 알 수 있는 사람은 대략 150명 정도거든. 그런데 인간은 수만 명, 수백만 명이 협력하잖아. 이건 어떻게 가능할까?", "highlight": None},
            {"speaker": "cosmii", "text": "하라리의 답은 이거야 — 인간은 존재하지도 않고, 만져보지도 않고, 경험해 보지도 못한 '허구'를 믿는 본성이 있어. 이걸 '인지 혁명'이라고 불러.", "highlight": "인지 혁명"},
            {"speaker": "cosmii", "text": "예를 들어볼게. '대한민국'이라는 나라를 만져볼 수 있어? 없지. '삼성'이라는 회사는? 건물은 있지만 '회사' 자체는 만질 수 없어. '인권'은? '법'은? 전부 눈에 보이지 않는 허구야. 그런데 우리 모두가 이것을 '진짜'라고 믿잖아!", "highlight": "눈에 보이지 않는 것들"},
            {"speaker": "cosmii", "text": "침팬지한테 '니가 열심히 일하면 죽어서 바나나 천국에 갈 수 있어'라고 말하면 믿을까? 절대 안 믿어. 그런데 인간은 이런 이야기를 믿어. 그리고 그 믿음 하나로 처음 보는 수만 명의 사람들과 유연하게 협력할 수 있는 거야.", "highlight": "침팬지는 못 하는 것"},
            {"speaker": "cosmii", "text": "이게 진짜 소름인 게 — 돈, 국가, 종교, 법률, 회사... 인간 세상을 지탱하는 거의 모든 것이 사실은 '허구'라는 거야. 실체가 없어. 근데 모두가 함께 믿으니까 작동하는 거지.", "highlight": "모든 것이 허구"},
            {"speaker": "cosmii", "text": "하라리의 핵심 주장을 정리하면 — 사피엔스가 지구의 주인이 된 건 강해서도, 똑똑해서도, 도구 때문도 아니야. '존재하지 않는 허구를 집단적으로 믿는 능력' 때문이야. 이 능력 덕분에 처음 보는 사람과도 협력할 수 있었고, 그 협력이 세상을 바꾼 거야. 여기까지가 1부 인지 혁명의 핵심이야!", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "하라리가 말하는 '인지 혁명'의 핵심은 무엇일까?",
                "options": ["도구를 만드는 능력", "불을 사용하는 능력", "존재하지 않는 허구를 집단적으로 믿는 능력", "언어를 사용하는 능력"],
                "correct_index": 2,
                "explanation": "인지 혁명의 핵심은 허구를 믿는 능력이야. 국가, 돈, 종교 같은 허구를 공유함으로써 처음 보는 사람끼리도 대규모 협력이 가능해진 거야."
            },
            {
                "question": "다음 중 하라리의 관점에서 '허구'에 해당하지 않는 것은?",
                "options": ["대한민국", "삼성", "인권", "바위"],
                "correct_index": 3,
                "explanation": "바위는 물리적으로 존재하는 실체야. 반면 국가, 회사, 인권은 인간이 집단적으로 믿기 때문에만 존재하는 허구지. 이 허구 덕분에 대규모 협력이 가능한 거야."
            }
        ],
        "cliffhanger": "인지 혁명으로 뭉친 사피엔스가 다음으로 한 일은 — 농사. 그런데 하라리는 이걸 '역사상 최대의 사기극'이라고 불러."
    },

    # ══════════════════════════════════════════
    # 2부: 농업 혁명
    # ══════════════════════════════════════════

    # ── Ch.2 농업 혁명 (Part 1/3) ──
    {
        "title": "역사상 최대의 사기극 — 농업 혁명의 진실",
        "chapter": "Ch.2 The Agricultural Revolution",
        "chapter_title": "농업 혁명",
        "part": 1, "total_parts": 4,
        "spark": "농업은 인간의 축복이 아니라 '역사상 최대의 사기극'이었다?",
        "dialogue": [
            {"speaker": "cosmii", "text": "2부 농업 혁명이야. 여기서 하라리가 던지는 폭탄 — '농업은 인간 역사상 최대의 사기극이다.' 처음에 이거 듣고 '뭔 소리야?' 했는데, 들으면 들을수록 빠져들어.", "highlight": "역사상 최대의 사기극"},
            {"speaker": "cosmii", "text": "우리의 상식부터 점검해보자. 농업 혁명은 축복이다, 맞지? 정착할 수 있게 됐고, 사냥하러 안 뛰어다녀도 되고, 삶이 안정됐으니까. 우리 모두 그렇게 배웠잖아.", "highlight": None},
            {"speaker": "cosmii", "text": "근데 하라리의 시각은 정반대야. 상상해봐. 구석기 시대 사람들이 이런 생각을 해. '씨앗을 뿌리면 곡식이 자라겠지? 그러면 안정적으로 식량이 공급되겠네? 위험하게 짐승 쫓아다니지 않아도 되고, 여가 시간도 많아지겠다!' — 이거 완전히 말도 안 되는 착각이었어.", "highlight": "달콤한 착각"},
            {"speaker": "cosmii", "text": "실제로 어떻게 됐냐면? 농사를 짓기 시작하니까 아침 해 뜰 때부터 해질 때까지 쉬지 않고 일해야 했어. 옛날 사냥하던 시절에는 하루 서너 시간만 일하면 됐거든! 오히려 구석기 시대 사람들이 여가 시간이 더 많았다는 거야.", "highlight": "더 많은 노동"},
            {"speaker": "cosmii", "text": "게다가 한자리에 앉아서 계속 농사를 짓다 보니 아이를 계속 낳게 돼. 인구가 폭발적으로 증가해. 인구가 늘어나면 더 많은 식량이 필요하고, 더 많은 농사를 지어야 하고... 끝없는 악순환에 빠지는 거야.", "highlight": "인구 폭발"},
            {"speaker": "cosmii", "text": "하라리의 표현이 기가 막혀 — '인간이 밀을 길들인 게 아니라, 밀이 인간을 길들인 거다.' 밀의 입장에서 보면 인간은 자기를 위해 아침부터 저녁까지 땀 흘리며 일해주는 노예야. 누가 누구를 길들인 건지 한번 생각해봐.", "highlight": "밀의 노예"}
        ],
        "quizzes": [
            {
                "question": "하라리에 따르면 구석기 시대와 비교해 농업 시대 인간의 노동 시간은?",
                "options": ["크게 줄어들었다", "비슷했다", "오히려 크게 늘어났다", "기록이 없어 알 수 없다"],
                "correct_index": 2,
                "explanation": "구석기 시대 수렵 채집인은 하루 서너 시간만 일했지만, 농업을 시작한 후에는 해 뜰 때부터 해질 때까지 일해야 했어. 농업이 인간의 삶을 더 고되게 만든 거야."
            },
            {
                "question": "'밀이 인간을 길들였다'는 하라리의 표현이 의미하는 것은?",
                "options": ["밀이 지능을 가지고 있다는 뜻", "인간이 밀을 위해 봉사하는 노예가 되었다는 뜻", "밀 농사가 쉽다는 뜻", "밀이 자연적으로 퍼졌다는 뜻"],
                "correct_index": 1,
                "explanation": "밀의 관점에서 보면 인간은 자기를 위해 땅을 갈고, 물을 주고, 잡초를 뽑아주는 노예야. 인간이 밀을 길들인 것 같지만, 사실은 밀이 인간의 삶을 지배하게 된 거야."
            }
        ],
        "cliffhanger": "노동만 늘어난 게 아니야. 농업은 인간의 몸과 건강까지 완전히 망가뜨렸어."
    },

    # ── Ch.2 농업 혁명 (Part 2/3) ──
    {
        "title": "몸이 망가진 인류 — 농업이 가져온 질병과 불평등",
        "chapter": "Ch.2 The Agricultural Revolution",
        "chapter_title": "농업 혁명",
        "part": 2, "total_parts": 4,
        "spark": "농업은 인간의 몸을 작게 만들고, 면역력을 무너뜨렸다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "지난 레슨에서 농업이 노동 시간을 늘렸다고 했지? 오늘은 더 충격적인 얘기야. 농업이 인간의 '몸' 자체를 망가뜨렸다는 거야.", "highlight": None},
            {"speaker": "cosmii", "text": "구석기 시대 수렵 채집인은 다양하게 먹었어. 오늘은 사슴 고기, 내일은 딸기, 모레는 물고기... 영양 균형이 자연스럽게 맞았지. 그런데 농사를 지으면서? 쌀만 먹고, 밀만 먹어. 심각한 영양 불균형이 생긴 거야.", "highlight": "영양 불균형"},
            {"speaker": "cosmii", "text": "그 결과가 뭐냐면 — 몸이 작아졌어. 진짜로. 고고학적 증거가 있어. 농업 이전 인류의 뼈가 농업 이후보다 더 크고 튼튼해. 면역력도 떨어져서 질병에 취약해졌고.", "highlight": "작아진 몸"},
            {"speaker": "cosmii", "text": "여기서 더 무서운 게 나와. 농사를 지으려면 가축이 필요하잖아. 소, 돼지, 닭... 이 가축들과 함께 살면서 인간은 온갖 질병에 노출돼. 메르스, 조류독감, 돼지독감 — 이런 전염병이 전부 가축에서 왔어. 가뜩이나 면역력이 떨어졌는데 가축에서 오는 균 때문에 더 아프기 시작한 거야.", "highlight": "가축이 가져온 질병"},
            {"speaker": "cosmii", "text": "그리고 구석기 시대에는 전쟁이 없었어. 다툼은 있었겠지만 조직적 전쟁은 필요가 없었지. 왜? 재산이 없으니까! 먹고 싶으면 사냥하고, 이동하면 되니까. 그런데 농업이 시작되면서 '내 땅', '내 곡식'이 생겼고, 그걸 지키거나 빼앗기 위한 전쟁이 시작된 거야.", "highlight": "전쟁의 시작"},
            {"speaker": "cosmii", "text": "정리하면 — 농업 이전의 인간이 사실 더 건강하고, 여가 시간도 많고, 전쟁도 없었어. 농업이 가져온 건 더 많은 노동, 더 나빠진 건강, 전쟁, 불평등이야. 그래서 하라리가 '사기극'이라고 부르는 거야.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "농업 이후 인간의 건강이 나빠진 주요 원인은?",
                "options": ["운동 부족", "단일 작물 위주 식단에 의한 영양 불균형과 가축 전염병", "스트레스 증가", "수면 부족"],
                "correct_index": 1,
                "explanation": "농업 이후 쌀이나 밀 같은 단일 작물만 먹으면서 영양 불균형이 생겼고, 가축과 함께 살면서 전염병에 노출됐어. 이 두 가지가 인간의 건강을 크게 악화시킨 거야."
            },
            {
                "question": "구석기 시대에 조직적 전쟁이 없었던 이유는?",
                "options": ["인구가 너무 적어서", "빼앗을 재산이 없었으니까", "무기가 없어서", "모두 친척이어서"],
                "correct_index": 1,
                "explanation": "수렵 채집 시대에는 '내 것'이라는 개념이 약했어. 재산이 없으니 빼앗을 것도 없고, 전쟁을 할 이유가 없었지. 농업으로 재산이 생기면서 전쟁도 시작된 거야."
            }
        ],
        "cliffhanger": "인간에게만 재앙이었을까? 하라리는 농업이 지구 전체에게 불행이었다고 말해."
    },

    # ── Ch.2 농업 혁명 (Part 3/3) ──
    {
        "title": "지구 전체의 불행 — 번식이 곧 성공일까?",
        "chapter": "Ch.2 The Agricultural Revolution",
        "chapter_title": "농업 혁명",
        "part": 3, "total_parts": 4,
        "spark": "번식의 관점에서 가장 성공한 생명은 인간이 아니라 닭이다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "오늘은 시야를 좀 넓혀볼 거야. 농업 혁명이 인간에게만 영향을 준 게 아니야. 하라리는 '지구상의 모든 종에게 엄청난 불행'이었다고 말해.", "highlight": None},
            {"speaker": "cosmii", "text": "생각해봐. 과거에 지구를 지배하던 야생 동물들 — 코끼리, 사자, 기린, 곰... 이 아이들이 지금 어디 있어? 동물원이야. 내셔널 지오그래픽 다큐멘터리 안에서만 존재하는 거야.", "highlight": "사라진 야생"},
            {"speaker": "cosmii", "text": "여기서 하라리가 아주 신선한 질문을 던져. '번식으로만 종의 성공을 이야기한다면, 이 지구상에서 가장 성공한 건 뭘까?' 인간? 아니. 인간은 지금 약 80억이야.", "highlight": None},
            {"speaker": "cosmii", "text": "가장 성공한 건 — 닭이야! 290억 마리. 그 다음이 소 10억 마리, 양 10억 마리, 돼지 10억 마리. 옛날에는 별로 찾아볼 수 없었던 야생 돼지가 지금은 10억 마리나 있는 거야.", "highlight": "290억 마리의 닭"},
            {"speaker": "cosmii", "text": "근데 잠깐 — 닭이 '성공'했다고 말할 수 있을까? 닭의 삶을 봐. 좁은 케이지에 갇혀서, 달걀을 낳다가, 살이 찌면 도축돼. 번식은 성공했지만 개체 하나하나의 삶은 역사상 최악이야. 소도, 돼지도 마찬가지.", "highlight": "번식 ≠ 행복"},
            {"speaker": "cosmii", "text": "하라리의 결론이 이거야 — 농업 혁명은 인간을 밀의 노예로 만들었고, 야생 동물을 멸종 위기로 몰았고, 가축은 번식만 성공한 비참한 존재로 만들었어. 결국 인간이 자기 필요에 따라 지구의 모든 생명을 재편한 거야. 그리고 자기들이 지구의 주인으로 자리잡았다는 이야기.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "하라리의 관점에서 '번식으로만 종의 성공을 측정'하면 가장 성공한 동물은?",
                "options": ["인간 (80억)", "닭 (290억)", "소 (10억)", "개미"],
                "correct_index": 1,
                "explanation": "순수하게 개체 수로만 보면 닭이 약 290억 마리로 가장 많아. 하지만 하라리는 이것이 진짜 '성공'인지 의문을 제기해 — 번식은 성공했지만 삶의 질은 최악이니까."
            },
            {
                "question": "농업 혁명이 가축에게 미친 영향을 가장 잘 설명한 것은?",
                "options": ["가축의 삶이 더 안전하고 행복해졌다", "번식은 폭발적으로 늘었지만 개체의 삶은 비참해졌다", "야생보다 수명이 길어졌다", "가축에게는 별 영향이 없었다"],
                "correct_index": 1,
                "explanation": "가축은 인간 덕분에 종으로서는 번식에 성공했지만, 개체 하나하나의 삶은 좁은 공간에 갇혀 도축되는 비참한 것이야. 번식의 성공이 행복과 같지 않다는 거야."
            }
        ],
        "cliffhanger": "농업이 만든 건 불행뿐이 아니야. 왕과 노예, 신분과 계급도 만들어냈어. 다음은 '상상의 질서' 이야기야."
    },

    # ── Ch.2 농업 혁명 — 상상의 질서 (Part 4/4) ──
    {
        "title": "상상의 질서 — 왕과 노예는 왜 생겼을까?",
        "chapter": "Ch.2 The Agricultural Revolution",
        "chapter_title": "농업 혁명",
        "part": 4, "total_parts": 4,
        "spark": "함무라비 법전은 '사람은 태어날 때부터 불평등하다'고 했고, 미국 독립선언서는 '모든 사람은 평등하다'고 했다. 둘 다 상상이다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "농업 혁명이 가져온 건 노동과 질병만이 아니야. 더 무서운 게 있어 — 바로 '계급'이야. 왕, 귀족, 평민, 노예... 이런 신분 제도가 어디서 왔을까?", "highlight": None},
            {"speaker": "cosmii", "text": "하라리가 아주 날카로운 비교를 해. 기원전 1776년 함무라비 법전 — '상급자와 하급자는 태어날 때부터 다르다. 노예는 재산이다.' 그리고 서기 1776년 미국 독립선언서 — '모든 인간은 평등하게 창조되었다.' 완전히 반대되는 주장이지?", "highlight": "두 개의 1776년"},
            {"speaker": "cosmii", "text": "여기서 하라리의 폭탄 — 둘 다 틀렸어. 아니, 정확히 말하면 둘 다 '상상'이야. 인간이 태어날 때부터 불평등하다? 생물학적으로 근거 없어. 모든 인간이 평등하다? 이것도 생물학적 사실이 아니야. '평등'이라는 개념 자체가 인간이 만든 허구야.", "highlight": "둘 다 상상이다"},
            {"speaker": "cosmii", "text": "그럼 왕과 노예는 왜 생긴 거야? 농업 때문이야. 수렵 채집 시대에는 재산이 없었으니 계급도 없었어. 그런데 농업이 시작되면서 '잉여 식량'이 생겼고, 이걸 관리할 사람이 필요해졌어. 그게 왕이 된 거야. 그리고 밭을 갈 사람이 필요했고, 그게 노예가 된 거야.", "highlight": "잉여가 만든 계급"},
            {"speaker": "cosmii", "text": "카스트 제도, 인종 차별, 성별 차별... 하라리에 따르면 이 모든 것이 '상상의 질서'야. 생물학적 근거가 아니라, 사람들이 집단적으로 '그렇다고 믿기 때문에' 유지되는 거야. 1부에서 배운 '허구를 믿는 능력'이 여기서 어두운 면을 보여주는 거지.", "highlight": "상상의 질서"},
            {"speaker": "cosmii", "text": "결국 핵심은 이거야 — 인간 사회의 불평등은 '자연스러운 것'이 아니야. 농업이 잉여를 만들고, 잉여가 계급을 만들고, 그 계급을 유지하기 위해 '상상의 질서'가 탄생한 거야. 우리가 당연하다고 생각하는 많은 사회 규칙들이 사실은 허구 위에 서 있어.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "함무라비 법전과 미국 독립선언서의 공통점으로 하라리가 지적한 것은?",
                "options": ["둘 다 정의로운 법이다", "둘 다 생물학적 사실에 기반한다", "둘 다 '상상의 질서'이며 허구다", "둘 다 유럽에서 만들어졌다"],
                "correct_index": 2,
                "explanation": "함무라비 법전의 '불평등'도, 독립선언서의 '평등'도 생물학적 사실이 아니야. 둘 다 인간이 만든 상상의 질서야. 어떤 질서를 '진실'로 받아들이느냐는 시대와 문화에 따라 달라지는 거지."
            },
            {
                "question": "농업 혁명 이후 계급이 생긴 근본적 원인은?",
                "options": ["인간의 본성이 불평등해서", "잉여 식량이 생기면서 관리자(왕)와 노동자(노예)가 필요해졌기 때문에", "신이 계급을 정해줘서", "전쟁에서 진 쪽이 노예가 돼서"],
                "correct_index": 1,
                "explanation": "수렵 채집 시대에는 재산이 없어서 계급도 없었어. 농업이 잉여 식량을 만들면서 이를 관리하는 사람(왕)과 생산하는 사람(노예)이 나뉘었고, 이 구조를 유지하기 위해 상상의 질서가 만들어진 거야."
            }
        ],
        "cliffhanger": "농업이 만든 상상의 질서가 수천 년간 유지됐어. 이제 전 세계를 하나로 통합하는 이야기로 넘어가자."
    },

    # ══════════════════════════════════════════
    # 3부: 인류의 통합
    # ══════════════════════════════════════════

    # ── Ch.3 인류의 통합 (Part 1/3) ──
    {
        "title": "돈이라는 위대한 허구 — 색종이의 마법",
        "chapter": "Ch.3 The Unification of Humankind",
        "chapter_title": "인류의 통합",
        "part": 1, "total_parts": 3,
        "spark": "전 세계 돈을 합치면 60조 달러인데, 실제 존재하는 건 6조뿐이다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "3부에서는 인류가 어떻게 통합됐는지를 다뤄. 기원전후 1~3세기, 전화기도 없고 인터넷도 없던 시절에 수백만 명이 어떻게 하나의 연합체를 만들 수 있었을까?", "highlight": None},
            {"speaker": "cosmii", "text": "하라리는 3가지 방법을 제시해. 첫 번째 — 돈, 두 번째 — 제국, 세 번째 — 종교. 이 세 가지의 공통점이 뭔지 알아? 전부 '실체하지 않는다'는 거야.", "highlight": "세 가지 통합의 도구"},
            {"speaker": "cosmii", "text": "먼저 돈 이야기부터 하자. 질문 하나 — 돈이 실체해? '당연하지, 지갑에 있잖아' 할 수 있는데, 잠깐. '돈'과 '화폐'는 달라. 돈은 사물의 가치를 뜻하고, 화폐는 그 가치를 담는 그릇이야.", "highlight": "돈 vs 화폐"},
            {"speaker": "cosmii", "text": "화폐의 역사를 보면 재미있어. 선사시대에는 조개껍데기였고, 세월이 지나면서 금이 되고, 은이 되고, 지금은 종이에 색칠한 걸 화폐라고 부르지. 생각해보면 진짜 웃겨 — 우리가 목숨 걸고 벌고 있는 게 사실 색종이야!", "highlight": "색종이의 마법"},
            {"speaker": "cosmii", "text": "더 충격적인 건 이거야. 하라리에 따르면 전 세계에 유통되는 돈이 약 60조 달러인데, 실제로 지폐와 동전으로 존재하는 건 6조뿐이야. 나머지 54조 달러는? 은행 컴퓨터에 찍힌 숫자일 뿐이야. 실체가 없어!", "highlight": "54조 달러의 허구"},
            {"speaker": "cosmii", "text": "결국 돈이란 건 '신용'이야. 이 색종이가 이만큼의 가치가 있다는 걸 서로 믿어야만 돈이 작동하는 거야. 1부에서 배운 '허구를 집단적으로 믿는 능력'이 여기서 또 나오는 거지! 돈은 인류 역사상 가장 성공한 허구야.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "전 세계 유통되는 돈 약 60조 달러 중 실제 지폐·동전으로 존재하는 금액은?",
                "options": ["약 60조 달러 전부", "약 30조 달러", "약 6조 달러", "약 1조 달러"],
                "correct_index": 2,
                "explanation": "실제 물리적으로 존재하는 돈은 약 6조 달러뿐이야. 나머지 54조 달러는 은행 컴퓨터의 숫자로만 존재해. 돈의 대부분은 실체가 없는 허구인 거야."
            },
            {
                "question": "돈이 작동하기 위해 가장 필수적인 것은?",
                "options": ["금의 뒷받침", "정부의 강제력", "사람들 사이의 집단적 신용과 믿음", "종이의 품질"],
                "correct_index": 2,
                "explanation": "돈은 '이것이 가치가 있다'는 집단적 믿음 위에 서 있어. 모두가 믿는 순간 색종이가 가치를 갖고, 믿음이 사라지면 돈도 사라지지. 이것이 신용의 본질이야."
            }
        ],
        "cliffhanger": "돈 다음으로 인류를 통합한 것은 제국이야. 근데 제국이 '양날의 검'이라니?"
    },

    # ── Ch.3 인류의 통합 (Part 2/3) ──
    {
        "title": "제국은 양날의 검 — 파괴자인가 건설자인가",
        "chapter": "Ch.3 The Unification of Humankind",
        "chapter_title": "인류의 통합",
        "part": 2, "total_parts": 3,
        "spark": "제국주의는 침략과 착취의 역사이면서, 동시에 문명의 유산이기도 하다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "제국이라고 하면 어떤 느낌이 들어? 일본 제국주의, 침략, 착취, 지배... 대부분 부정적인 이미지지? 나도 그래.", "highlight": None},
            {"speaker": "cosmii", "text": "하라리도 제국의 폭력성을 부정하지 않아. 그런데 여기서 논란이 되는 관점을 하나 던져. '제국은 양날의 검과 같아서, 상당히 우리에게 많은 유산을 남겨줬다.'", "highlight": "양날의 검"},
            {"speaker": "cosmii", "text": "예를 들어 영국 제국주의를 보자. 영국이 인도를 지배한 건 분명히 나쁜 거야. 착취하고 억압했으니까. 그런데 영국이 결국 물러난 후에, 영국인들이 깔아놓은 철도, 만들어놓은 법률 체계, 구축한 행정 시스템... 이것들이 인도의 근대화에 기여한 측면도 있다는 거야.", "highlight": "영국과 인도"},
            {"speaker": "cosmii", "text": "이 주장은 실제로 엄청난 욕을 먹었어. 전 세계적으로. '식민지 지배를 정당화하냐'는 비판이 쏟아졌지. 당연히 민감한 주제야. 하라리도 제국주의가 '좋았다'고 말하는 게 아니야.", "highlight": "논란"},
            {"speaker": "cosmii", "text": "하라리가 하고 싶은 말은 이거야 — 역사를 '선 vs 악'의 단순한 구도로만 보면 안 된다는 것. 제국은 파괴하기도 했지만 동시에 건설하기도 했어. 도로, 법률, 언어, 문화... 지금 우리가 사용하는 많은 것들이 제국의 유산이야.", "highlight": None},
            {"speaker": "cosmii", "text": "핵심은 — 제국이 인류를 '통합'시켰다는 사실이야. 로마 제국이 유럽을 하나로, 몽골 제국이 아시아를 하나로, 대영 제국이 전 세계를 하나로 연결했어. 좋든 나쁘든, 제국은 인류가 서로 섞이고 통합되는 가장 강력한 메커니즘이었다는 거야.", "highlight": "통합의 메커니즘"}
        ],
        "quizzes": [
            {
                "question": "하라리가 제국을 '양날의 검'이라고 표현한 이유는?",
                "options": ["전쟁에서 검을 많이 썼으니까", "침략과 착취를 했지만 동시에 문명적 유산도 남겼기 때문에", "제국이 두 개로 나뉘어서", "좋기만 했으니까"],
                "correct_index": 1,
                "explanation": "제국은 한쪽으로는 침략과 착취를 했지만, 다른 한쪽으로는 철도, 법률, 행정 시스템 같은 유산을 남겼어. 역사를 단순한 선악 구도로만 보면 안 된다는 게 하라리의 주장이야."
            },
            {
                "question": "하라리가 보는 제국의 역사적 역할은?",
                "options": ["인류 문화를 파괴한 것", "인류를 분열시킨 것", "좋든 나쁘든 인류를 통합시킨 가장 강력한 메커니즘", "자연환경을 보호한 것"],
                "correct_index": 2,
                "explanation": "하라리는 제국이 도덕적으로 좋다고 말하는 게 아니야. 다만 로마, 몽골, 대영 제국 등이 인류를 서로 연결하고 통합시키는 가장 강력한 역할을 했다는 역사적 사실을 말하는 거야."
            }
        ],
        "cliffhanger": "세 번째 통합의 도구는 종교야. 만져본 적도, 만나본 적도 없는 신을 위해 사람들은 죽고 죽인다."
    },

    # ── Ch.3 인류의 통합 (Part 3/3) ──
    {
        "title": "보이지 않는 신의 힘 — 종교와 통합의 완성",
        "chapter": "Ch.3 The Unification of Humankind",
        "chapter_title": "인류의 통합",
        "part": 3, "total_parts": 3,
        "spark": "신을 만져 본 사람도, 만나 본 사람도 없는데 — 그 신을 위해 죽고 죽인다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "인류 통합의 세 번째 도구, 종교야. 하라리의 시각이 또 신선해 — 종교도 돈이나 제국처럼 '허구를 집단적으로 믿는 것'의 연장선이라는 거야.", "highlight": None},
            {"speaker": "cosmii", "text": "생각해봐. 신을 만져 본 사람? 없어. 만나 본 사람? 없어. 식사해 본 적? 당연히 없지. 그런데 그 신을 위해서 사람들은 헌금을 바치고, 전쟁을 벌이고, 죽고 죽여. 십자군 전쟁이 대표적이지.", "highlight": "보이지 않는 신"},
            {"speaker": "cosmii", "text": "하라리의 핵심 포인트는 — 종교가 나쁘다는 게 아니야. '존재하지 않는 것을 믿고 따르는 것은 인간만의 독특한 본성'이라는 거야. 1부에서 배운 인지 혁명이 여기서 또 나와!", "highlight": "인간만의 본성"},
            {"speaker": "cosmii", "text": "종교의 힘이 뭐냐면 — 한 번도 만난 적 없는 수백만 명의 사람들이 같은 신을 믿는 것만으로 하나가 돼. 기독교인끼리, 이슬람교도끼리, 불교도끼리. 국경을 넘어, 언어를 넘어, 인종을 넘어 연결돼.", "highlight": "국경을 넘는 연결"},
            {"speaker": "cosmii", "text": "자, 3부를 정리해보자. 돈 — 모두가 가치를 믿으니까 작동하는 허구. 제국 — 강제로든 자발적으로든 사람들을 하나로 묶는 체제. 종교 — 보이지 않는 존재를 함께 믿으며 연결되는 공동체. 이 세 가지의 공통점은? 전부 실체가 없다는 거야.", "highlight": "세 가지의 공통점"},
            {"speaker": "cosmii", "text": "결국 인류를 통합한 것은 물리적인 힘이 아니라 '상상의 질서'야. 인간은 허구를 믿는 능력으로 뭉쳤고, 돈과 제국과 종교라는 허구로 전 세계를 하나로 연결한 거야. 대단하면서도 좀 무섭지 않아?", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "돈, 제국, 종교의 공통점으로 하라리가 지적한 것은?",
                "options": ["모두 유럽에서 시작됨", "모두 실체하지 않는 허구라는 것", "모두 평화를 가져왔다는 것", "모두 한 사람이 만들었다는 것"],
                "correct_index": 1,
                "explanation": "돈, 제국, 종교 모두 물리적 실체가 없어. 사람들이 집단적으로 '믿기 때문에' 존재하는 허구야. 이것이 인류를 통합한 세 가지 도구의 공통점이야."
            },
            {
                "question": "종교가 인류 통합에 기여한 방식은?",
                "options": ["같은 언어를 쓰게 만들어서", "같은 보이지 않는 존재를 믿음으로써 국경을 넘어 연결시켜서", "군사력으로 통합해서", "같은 음식을 먹게 해서"],
                "correct_index": 1,
                "explanation": "종교는 국경, 언어, 인종을 넘어서 같은 신을 믿는 것만으로 수백만 명을 하나로 묶었어. 한 번도 만난 적 없는 사람들이 같은 공동체가 되는 거야."
            }
        ],
        "cliffhanger": "인지 혁명으로 뭉치고, 농업으로 정착하고, 돈·제국·종교로 통합한 사피엔스. 이제 과학이라는 최강 무기를 손에 넣어."
    },

    # ══════════════════════════════════════════
    # 4부: 과학 혁명
    # ══════════════════════════════════════════

    # ── Ch.4 과학 혁명 (Part 1/5) ──
    {
        "title": "무지의 발견 — 500년 잠에서 깨어나다",
        "chapter": "Ch.4 The Scientific Revolution",
        "chapter_title": "과학 혁명",
        "part": 1, "total_parts": 5,
        "spark": "1100년에 잠든 사람이 1600년에 깨어나면 놀라지 않지만, 1500년에 잠든 사람이 2000년에 깨어나면 기절한다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "4부, 과학 혁명이야. 여기서 하라리가 아주 재미있는 사고 실험을 해. 이거 진짜 소름이야.", "highlight": None},
            {"speaker": "cosmii", "text": "기원후 1100년쯤에 살던 한 사람이 500년 동안 긴 잠을 잤어. 1600년에 깨어남. 그러면 이 사람이 세상을 보고 크게 놀랄까? 하라리의 답은 — '별로 안 놀란다.' 왜? 1100년이나 1600년이나 세상이 거의 안 변했거든.", "highlight": "500년의 잠 ①"},
            {"speaker": "cosmii", "text": "비유하면 고려시대에 잠든 사람이 조선시대에 깨어나도 크게 놀라지 않을 거야. 여전히 말 타고 다니고, 농사짓고, 왕이 다스리고. 기본적인 삶의 모습은 비슷하니까.", "highlight": None},
            {"speaker": "cosmii", "text": "그런데! 1500년에 콜럼버스를 따라 항해하던 선원이 잠이 들었어. 500년 뒤인 2000년에 아이폰 벨소리에 잠을 깨. 이 사람은 어떨까? '여기가 천국인가, 지옥인가' 하고 기절할 거야.", "highlight": "500년의 잠 ②"},
            {"speaker": "cosmii", "text": "똑같은 500년인데 왜 이렇게 다를까? 그 사이에 '과학 혁명'이 일어났기 때문이야. 인류 역사에서 지난 500년은 그 이전 수만 년보다 더 많이 변했어.", "highlight": "500년의 차이"},
            {"speaker": "cosmii", "text": "하라리가 과학 혁명의 출발점으로 꼽는 건 '무지의 발견'이야. 이전의 인류는 '우리가 모르는 게 있다'는 사실조차 몰랐어. 종교가 모든 답을 갖고 있다고 믿었으니까. 그런데 과학 혁명이 시작되면서 — '우리는 모른다, 그러니 알아내자' 이 태도가 등장한 거야. 이 작은 변화가 세상을 뒤집었어.", "highlight": "무지의 발견"}
        ],
        "quizzes": [
            {
                "question": "하라리의 사고 실험에서 1100년→1600년의 변화가 크지 않은 이유는?",
                "options": ["인구가 너무 적어서", "과학 혁명이 아직 일어나지 않아 삶의 방식이 거의 같았기 때문에", "전쟁이 없어서", "같은 왕이 다스려서"],
                "correct_index": 1,
                "explanation": "과학 혁명 이전에는 수백 년이 지나도 삶의 기본 방식이 거의 변하지 않았어. 여전히 농사짓고, 말 타고, 왕이 다스리는 세상이었지. 과학 혁명 이후에야 폭발적 변화가 시작된 거야."
            },
            {
                "question": "하라리가 말하는 과학 혁명의 출발점은?",
                "options": ["증기기관의 발명", "'우리는 모른다'는 무지의 인정", "화약의 발명", "인쇄술의 발달"],
                "correct_index": 1,
                "explanation": "'우리가 모든 답을 알고 있다'에서 '우리는 모른다, 그러니 알아내자'로 태도가 바뀐 것이 과학 혁명의 출발이야. 이 '무지의 발견'이 인류의 폭발적 발전을 이끈 거야."
            }
        ],
        "cliffhanger": "과학 혁명이 시작됐지만, 과학만으로는 세상이 안 바뀌어. '돈'이 필요했어. 자본주의의 마법이 시작된다."
    },

    # ── Ch.4 과학 혁명 (Part 2/5) ──
    {
        "title": "자본주의의 마법 — 신용이 만드는 미래",
        "chapter": "Ch.4 The Scientific Revolution",
        "chapter_title": "과학 혁명",
        "part": 2, "total_parts": 5,
        "spark": "자본주의 이전에 경제는 '제로섬 게임'이었다. 누군가 부자가 되면 누군가는 가난해져야 했다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "과학 혁명 이야기를 이어가보자. 과학만으로 세상이 바뀐 건 아니야. 하라리가 강조하는 핵심 공식이 있어 — '과학 + 제국 + 자본주의 = 현대 세계'. 오늘은 이 중 자본주의 이야기야.", "highlight": None},
            {"speaker": "cosmii", "text": "자본주의 이전의 경제를 상상해봐. 옛날 사람들은 경제를 '파이'에 비유했어. 파이의 크기는 정해져 있으니까, 내가 더 먹으면 네가 덜 먹어야 해. 제로섬 게임이야. 부자가 되려면 누군가를 착취해야 했어.", "highlight": "제로섬 게임"},
            {"speaker": "cosmii", "text": "그런데 자본주의가 등장하면서 완전히 새로운 개념이 나타나. 바로 '신용(credit)'이야. 제빵사가 은행에서 돈을 빌려서 가게를 확장하고, 더 많이 벌어서 이자까지 갚아. 파이 자체가 커진 거야! 이건 혁명적인 발상이었어.", "highlight": "신용의 마법"},
            {"speaker": "cosmii", "text": "핵심이 뭐냐면 — '미래에 대한 신뢰'야. 내일이 오늘보다 나을 거라고 믿으니까 투자할 수 있고, 투자하니까 진짜로 내일이 나아지는 거야. 과학이 '무지의 인정'에서 시작됐다면, 자본주의는 '미래에 대한 신뢰'에서 시작된 거야.", "highlight": "미래에 대한 신뢰"},
            {"speaker": "cosmii", "text": "하라리는 과학-제국-자본주의가 피드백 루프를 형성한다고 봐. 자본이 탐험에 투자하면 → 새 영토 발견 → 과학적 지식 확대 → 더 많은 부 → 더 많은 투자. 이 순환이 지난 500년을 만든 엔진이야.", "highlight": "피드백 루프"},
            {"speaker": "cosmii", "text": "그런데 어두운 면도 있어. 대서양 노예무역은 '사업'이었어. 투자자들이 돈을 모아서 아프리카인을 사고, 아메리카 농장에서 일시키고, 설탕을 팔아 이익을 남겼지. 자본주의의 논리가 인간을 상품으로 만든 거야. 하라리는 이걸 '자본주의의 원죄'라고 불러.", "highlight": "자본주의의 원죄"}
        ],
        "quizzes": [
            {
                "question": "자본주의 이전의 경제가 '제로섬 게임'이었다는 것은 무슨 의미일까?",
                "options": ["모두가 평등했다는 뜻", "경제의 파이 크기가 고정되어 있어서, 누군가 부자가 되면 누군가는 가난해져야 한다는 뜻", "돈이 존재하지 않았다는 뜻", "무역이 없었다는 뜻"],
                "correct_index": 1,
                "explanation": "제로섬 게임은 전체 부의 크기가 정해져 있어서, 한 사람이 더 가져가면 다른 사람은 덜 가져야 하는 상황이야. 자본주의는 신용을 통해 이 파이 자체를 키울 수 있다는 혁명적 발상을 가져왔어."
            },
            {
                "question": "하라리가 말하는 '과학-제국-자본주의 피드백 루프'의 핵심은?",
                "options": ["세 가지가 서로 경쟁한다는 것", "자본이 탐험에 투자하고, 탐험이 지식을 넓히고, 지식이 부를 만드는 순환", "과학이 제국을 파괴한다는 것", "자본주의가 과학을 방해한다는 것"],
                "correct_index": 1,
                "explanation": "자본이 탐험과 연구에 투자 → 새로운 발견 → 과학적 지식 확대 → 더 많은 부 창출 → 다시 투자. 이 피드백 루프가 지난 500년 폭발적 성장의 엔진이야."
            }
        ],
        "cliffhanger": "자본주의가 엔진을 만들었다면, 그 엔진을 가장 잘 활용한 건 유럽이야. 근데 왜 하필 유럽이었을까?"
    },

    # ── Ch.4 과학 혁명 (Part 3/5) ──
    {
        "title": "경쟁이 만든 신세계 — 유럽은 어떻게 강대국이 됐나",
        "chapter": "Ch.4 The Scientific Revolution",
        "chapter_title": "과학 혁명",
        "part": 3, "total_parts": 5,
        "spark": "화약, 나침반, 종이를 발명한 건 중국인데 — 그걸 활용해서 세계를 지배한 건 유럽이다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "여기서 하라리가 아주 매력적인 질문을 던져. '역사상 가장 못 살았던 서유럽 사람들이 어떻게 과학 혁명과 산업 혁명의 중심이 될 수 있었을까?'", "highlight": None},
            {"speaker": "cosmii", "text": "중국의 3대 발명을 생각해봐. 화약, 나침반, 종이(혹은 인쇄술). 전부 중국이 먼저 발명했어. 그런데 이것들을 활용해서 세계를 지배한 건 유럽이야. 왜?", "highlight": "중국의 3대 발명"},
            {"speaker": "cosmii", "text": "하라리의 설명은 이래. 당시 명나라 중국은 세계 최강이었어. 부러울 게 없었지. 그러니까 '우리가 뭘 더 알아야 해?' 이런 태도였어. 반면 유럽은? 가난하고 약했어. 그래서 절박했지.", "highlight": "중국의 자만 vs 유럽의 절박"},
            {"speaker": "cosmii", "text": "유럽의 핵심은 '분열에서 오는 경쟁'이야. 유럽은 하나의 제국이 아니라 수십 개의 작은 나라로 나뉘어 있었거든. 포르투갈, 스페인, 영국, 프랑스... 이들이 서로 경쟁했어. 콜럼버스의 이야기가 대표적이야.", "highlight": "분열이 낳은 경쟁"},
            {"speaker": "cosmii", "text": "포르투갈이 아프리카를 돌아 인도까지 가는 항로를 개척하자, 스페인은 초조해졌어. '우리도 뭔가 해야 해!' 이때 콜럼버스가 나타나서 '서쪽으로 가면 인도에 도착할 수 있어요!'라고 제안한 거야. 스페인의 이사벨 여왕이 이 도박에 투자했고, 결국 아메리카를 발견했지.", "highlight": "콜럼버스의 도박"},
            {"speaker": "cosmii", "text": "핵심을 정리하면 — 중국은 최강이라서 변화가 필요 없다고 느꼈고, 유럽은 약했기에 '무지를 인정'하고 탐험에 나섰어. 분열은 경쟁을 낳았고, 경쟁은 탐험을 낳았고, 탐험은 과학 혁명으로 이어졌어. 아이러니하게도 유럽의 약점이 강점이 된 거야.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "하라리가 과학 혁명이 유럽에서 시작된 핵심 이유로 꼽은 것은?",
                "options": ["유럽인이 더 똑똑해서", "유럽의 분열이 경쟁을 만들고, 경쟁이 탐험과 혁신을 만들어서", "유럽의 기후가 좋아서", "유럽에 금이 많아서"],
                "correct_index": 1,
                "explanation": "유럽은 수십 개의 작은 나라로 분열되어 있었고, 이 분열이 치열한 경쟁을 만들었어. 경쟁 속에서 무지를 인정하고 새로운 것을 찾아 나선 것이 과학 혁명의 출발이야."
            },
            {
                "question": "중국이 화약·나침반·종이를 발명하고도 세계를 지배하지 못한 이유는?",
                "options": ["기술력이 부족해서", "세계 최강이라 변화의 필요성을 못 느꼈기 때문에", "전쟁에 져서", "인구가 부족해서"],
                "correct_index": 1,
                "explanation": "명나라 중국은 세계 최강이라 부러울 것이 없었어. '알아야 할 것이 없다'는 자만이 혁신을 막은 반면, 가난한 유럽은 절박해서 탐험하고 혁신했지."
            }
        ],
        "cliffhanger": "인지 혁명, 농업 혁명, 과학 혁명... 이 모든 발전 끝에 — 우리는 정말 행복해졌을까?"
    },

    # ── Ch.4 과학 혁명 (Part 4/5) ──
    {
        "title": "우리는 행복해졌을까? — 사피엔스의 철학적 질문",
        "chapter": "Ch.4 The Scientific Revolution",
        "chapter_title": "과학 혁명",
        "part": 4, "total_parts": 5,
        "spark": "인류의 모든 발전에도 불구하고 — 중세 농부보다 더 행복한 걸까?",
        "dialogue": [
            {"speaker": "cosmii", "text": "인지 혁명, 농업 혁명, 과학 혁명... 사피엔스는 엄청난 발전을 이뤘어. 그런데 하라리가 책 끝부분에서 아주 불편한 질문을 던져 — '그래서 우리는 행복해졌을까?'", "highlight": None},
            {"speaker": "cosmii", "text": "진지하게 생각해봐. 지금 평범한 중산층은 루이 14세보다 좋은 의료 서비스를 받고, 더 다양한 음식을 먹고, 더 따뜻한 집에 살아. 그런데 — 루이 14세보다 더 행복할까? 하라리의 답은 '아마 아닐 것'이야.", "highlight": "루이 14세보다 행복할까?"},
            {"speaker": "cosmii", "text": "왜냐하면 행복은 '객관적 조건'이 아니라 '기대치'에 의해 결정되거든. 에어컨이 없던 시절에는 부채만 있어도 행복했어. 그런데 지금은 에어컨이 1도만 안 맞아도 짜증나잖아. 조건은 나아졌는데 기대치가 더 빨리 올라간 거야.", "highlight": "기대치의 함정"},
            {"speaker": "cosmii", "text": "하라리는 여기서 생물학적 설명도 해. 행복은 결국 세로토닌, 도파민 같은 신경전달물질의 문제야. 복권에 당첨되든, 승진을 하든, 잠시 도파민이 올라갔다가 다시 원래 수준으로 돌아와. 이걸 '쾌락의 쳇바퀴'라고 불러.", "highlight": "쾌락의 쳇바퀴"},
            {"speaker": "cosmii", "text": "그리고 하라리가 불교를 언급해. 불교의 핵심은 '쾌락을 쫓지 말라'는 거야. 행복은 좋은 감정을 더 많이 느끼는 게 아니라, 좋고 나쁜 감정에 덜 휘둘리는 것에서 온다고. 2500년 전 붓다가 이미 알고 있었던 걸 현대 과학이 뒤늦게 확인하고 있는 거야.", "highlight": "붓다의 통찰"},
            {"speaker": "cosmii", "text": "하라리가 남기는 질문은 이거야 — 사피엔스는 지구를 정복하고, 과학으로 신의 힘을 얻었는데, 정작 '우리가 뭘 원하는지'조차 모르고 있어. 힘은 커졌는데 방향을 모르는 거야. 이게 사피엔스의 가장 위험한 상태일지도 몰라.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "하라리에 따르면 현대인이 중세인보다 반드시 더 행복하지 않은 이유는?",
                "options": ["현대의 스트레스가 더 크기 때문에", "행복은 객관적 조건이 아니라 기대치에 의해 결정되기 때문에", "현대의 음식이 더 나빠서", "중세에는 전쟁이 없어서"],
                "correct_index": 1,
                "explanation": "조건이 나아져도 기대치가 함께 올라가기 때문에 행복은 늘지 않아. 에어컨 없던 시절에는 부채로도 만족했지만, 지금은 에어컨이 조금만 안 맞아도 불만이지. 이게 '기대치의 함정'이야."
            },
            {
                "question": "하라리가 불교를 언급하면서 강조한 행복의 핵심은?",
                "options": ["더 많이 소유하면 행복해진다", "쾌락을 쫓지 않고 감정에 덜 휘둘리는 것이 행복이다", "종교를 믿으면 행복해진다", "명상을 하면 부자가 된다"],
                "correct_index": 1,
                "explanation": "불교의 핵심은 쾌락을 쫓는 것이 고통의 원인이라는 거야. 행복은 좋은 감정을 더 많이 느끼는 게 아니라, 감정에 덜 휘둘리는 상태에서 온다고. 현대 과학도 이걸 뒷받침하고 있어."
            }
        ],
        "cliffhanger": "행복의 답을 찾지 못한 사피엔스가 마지막으로 향하는 곳 — 신이 되려는 문 앞이야."
    },

    # ── Ch.4 과학 혁명 (Part 5/5) ──
    {
        "title": "호모 데우스 — 신이 되려는 인간",
        "chapter": "Ch.4 The Scientific Revolution",
        "chapter_title": "과학 혁명",
        "part": 5, "total_parts": 5,
        "spark": "사피엔스의 마지막 질문 — 우리는 천국의 문을 열 것인가, 지옥의 문을 열 것인가.",
        "dialogue": [
            {"speaker": "cosmii", "text": "사피엔스의 마지막 이야기야. 하라리는 지금까지의 여정을 이렇게 정리해 — 인지 혁명으로 뭉치고, 농업 혁명으로 번식하고, 돈과 제국과 종교로 통합하더니, 과학으로 중무장하게 된 거야.", "highlight": None},
            {"speaker": "cosmii", "text": "그리고 하라리는 충격적인 표현을 써. '사피엔스가 아니라 이제는 호모 데우스다.' 데우스는 라틴어로 '신'이라는 뜻이야. 인간은 신이 되려 한다는 거야.", "highlight": "호모 데우스"},
            {"speaker": "cosmii", "text": "과장이 아니야. 생각해봐. 2시간이면 미국에 갈 수 있어 (비행기). 달에 발자국을 찍었어. 신의 영역이라고 생각했던 '탄생'과 '죽음'까지 과학이 관장하기 시작했어. 시험관 아기, 유전자 편집, 수명 연장... 옛날 사람이 보면 완전히 신의 능력이지.", "highlight": "신의 능력을 가진 인간"},
            {"speaker": "cosmii", "text": "그런데 하라리가 여기서 경고를 해. '우리는 신의 능력을 가졌지만, 신의 지혜는 갖지 못했다.' 핵무기를 만들 능력은 있지만 그걸 현명하게 쓸 지혜가 있나? 기후변화를 일으킬 힘은 있지만 그걸 해결할 지혜가 있나?", "highlight": "능력은 있지만 지혜는 없다"},
            {"speaker": "cosmii", "text": "사피엔스의 마지막 문장이 이거야 — '우리 인간은 천국과 지옥으로 나뉘는 갈림길에 서 있다. 역사는 우리의 종말에 대해서 아직 결정되지 않았고, 일련의 우연들은 우리를 어느 쪽으로도 이끌 수 있다.'", "highlight": "천국인가 지옥인가"},
            {"speaker": "cosmii", "text": "이게 사피엔스 전체의 결론이야. 별볼일 없었던 원시인이 인지 혁명으로 지구의 주인이 됐어. 농업 혁명으로 정착했고, 돈·제국·종교로 통합했고, 과학 혁명으로 신의 능력을 얻었어. 그런데 이 엄청난 힘을 어디로 쓸 건지는 아직 정해지지 않았어. 천국의 문을 열 수도, 지옥으로 가는 문을 열 수도 있어. 그 선택은 지금 살아있는 우리, 호모 사피엔스의 몫이야. 같이 읽느라 정말 수고했어!", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "'호모 데우스'에서 '데우스'의 뜻은?",
                "options": ["현명한 인간", "신", "새로운 종", "기계"],
                "correct_index": 1,
                "explanation": "데우스는 라틴어로 '신'이야. 호모 데우스는 '신이 된 인간'이라는 뜻으로, 과학 기술로 신적인 능력을 얻은 현대 인간을 표현한 거야."
            },
            {
                "question": "사피엔스가 마지막에 던지는 핵심 질문은?",
                "options": ["인간은 언제 멸종할까?", "신의 능력을 가진 인간이 천국을 열 것인가 지옥을 열 것인가?", "다음 진화는 무엇일까?", "돈이 사라질까?"],
                "correct_index": 1,
                "explanation": "사피엔스의 마지막 질문은 — 신의 능력을 손에 넣은 인간이 그 힘을 현명하게 쓸 것인가, 파괴적으로 쓸 것인가야. 그 선택은 아직 결정되지 않았어."
            }
        ],
        "cliffhanger": ""
    },
]


# ═══════════════════════════════════════════════════════════════════
# English translations — natural, casual Cosmii tone
# ═══════════════════════════════════════════════════════════════════

TRANSLATIONS_EN = {
    # ── Lesson 0: Killer ancestors, multiple human species ──
    0: {
        "title": "A History of Killer Ancestors — Homo Sapiens' Dark Secret",
        "chapter_title": "The Cognitive Revolution",
        "spark": "Harari doesn't see our ancestors as noble forebears — he calls them straight-up murderers.",
        "cliffhanger": "But here's the thing — Sapiens weren't particularly stronger or smarter than the other species. The real secret is something else entirely.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Hey there! Starting today, we're diving into Yuval Noah Harari's Sapiens together. In a nutshell, this book is about how a bunch of unremarkable apes ended up ruling the entire planet.", "highlight": None},
            {"speaker": "cosmii", "text": "Let's start with a shocker. Harari doesn't see our ancestors as noble forebears — he basically calls them serial killers. And not the 'oops, I accidentally killed someone' kind. We're talking systematic genocide of other human species.", "highlight": "Sibling killers"},
            {"speaker": "cosmii", "text": "You know that famous textbook illustration? Monkey \u2192 Australopithecus \u2192 Homo erectus \u2192 Neanderthal \u2192 Homo sapiens — all lined up like a neat evolutionary march? Harari says that picture is a total lie.", "highlight": "The textbook lie"},
            {"speaker": "cosmii", "text": "In reality, these species lived at the same time! They were cousins. Think of it like German Shepherds, Shih Tzus, and Chihuahuas all living together — multiple human species coexisted on Earth. Neanderthals, Homo erectus, Homo floresiensis... at least six different species, all alive simultaneously.", "highlight": "Coexisting human species"},
            {"speaker": "cosmii", "text": "But then Homo sapiens showed up, and one by one, the others vanished. This wasn't a coincidence. As Harari puts it, everywhere Sapiens went, other human species went extinct. It was systematic genocide spanning tens of thousands of years.", "highlight": "Systematic genocide"},
            {"speaker": "cosmii", "text": "In the end, only Homo sapiens survived — the last humans standing on Earth. So here's the question Harari poses: 'How did these totally unremarkable primates become the rulers of the planet?' That question drives the entire book.", "highlight": None},
        ],
        "quizzes": [
            {
                "question": "Why does Harari reject the textbook 'march of human evolution' illustration?",
                "options": ["He rejects evolution itself", "Multiple human species actually coexisted at the same time", "Humans didn't evolve from apes", "The illustration is just too old"],
                "correct_index": 1,
                "explanation": "Unlike the textbook's neat single-file progression, multiple human species — Neanderthals, Homo erectus, and others — actually lived on Earth at the same time. Sapiens wiped them out and became the sole surviving human species.",
            },
            {
                "question": "Why does Harari call Homo sapiens 'sibling killers'?",
                "options": ["Because of frequent family feuds", "Because they systematically drove other human species to extinction", "Because they hunted animals", "Because they fought many wars"],
                "correct_index": 1,
                "explanation": "Other human species that lived alongside Homo sapiens — like Neanderthals — all disappeared as Sapiens expanded. Harari describes this as systematic genocide over tens of thousands of years.",
            },
        ],
    },

    # ── Lesson 1: Gossip theory, chimps vs humans, cooperation ──
    1: {
        "title": "Gossip Changed the World — The Birth of the Cognitive Revolution",
        "chapter_title": "The Cognitive Revolution",
        "spark": "The secret to humans ruling the Earth isn't muscles or tools — it's gossip.",
        "cliffhanger": "But gossip only works for groups up to about 150 people. The real secret behind uniting tens of thousands? That's even more mind-blowing.",
        "dialogue": [
            {"speaker": "cosmii", "text": "So last lesson, we said Sapiens were pretty unremarkable. Then how on earth did they end up ruling the planet? The obvious answer would be: 'Humans are smart! They make great tools!' Right?", "highlight": None},
            {"speaker": "cosmii", "text": "Fun fact: even Jeong Yak-yong, a famous 18th-century Korean scholar, said something similar. 'Humans have no claws like lions, no venom like snakes, no wings like eagles — yet they rule all creatures because they use tools.' That was the conventional wisdom for a long time.", "highlight": "The conventional answer"},
            {"speaker": "cosmii", "text": "Harari flips this on its head. 'No, the real secret is gossip!' Gossip? Yep, gossip. I know — I thought 'what?!' too when I first heard it. But stick with me, because it'll give you chills.", "highlight": "The power of gossip"},
            {"speaker": "cosmii", "text": "Let's do a comparison. Drop one chimp and one human on a deserted island — who's more likely to survive? The chimp. Physically, humans are no match. Put one female chimp in a room with six humans in a fight? The humans get torn apart.", "highlight": "Chimp vs. human"},
            {"speaker": "cosmii", "text": "But! Pit ten thousand chimps against ten thousand humans in a war? Humans win. By a landslide. Why? Because humans cooperate on a massive, flexible scale. Individually we're nothing special, but together we create incredible organized collaboration.", "highlight": "The cooperative animal"},
            {"speaker": "cosmii", "text": "So where does this 'power of unity' come from? Enter gossip. Gossip means sharing information about people you haven't met — 'That guy's trustworthy,' 'Watch out for her.' This is a uniquely human skill.", "highlight": None},
        ],
        "quizzes": [
            {
                "question": "In a one-on-one fight, who wins — a chimp or a human?",
                "options": ["Human", "Chimp", "It's a tie", "It depends on the situation"],
                "correct_index": 1,
                "explanation": "Physically, humans are weaker than chimps. But in a war of ten thousand vs. ten thousand, humans win overwhelmingly. It's not individual strength — it's collective cooperation that's humanity's real weapon.",
            },
            {
                "question": "What does Harari consider more important than tools as humanity's key ability?",
                "options": ["Running speed", "Large-scale flexible cooperation", "Brain size", "Mastery of fire"],
                "correct_index": 1,
                "explanation": "Tools matter, but Harari's real answer is the ability for tens of thousands to cooperate flexibly. What made this cooperation possible was gossip — the Cognitive Revolution.",
            },
        ],
    },

    # ── Lesson 2: Believing in fiction, imagined orders ──
    2: {
        "title": "The Only Animal That Believes in Fiction — Sapiens' Superpower",
        "chapter_title": "The Cognitive Revolution",
        "spark": "The ability to collectively believe in things that don't exist — that's the Cognitive Revolution.",
        "cliffhanger": "With the Cognitive Revolution under their belts, Sapiens made their next big move — farming. But Harari calls it 'history's biggest fraud.'",
        "dialogue": [
            {"speaker": "cosmii", "text": "Gossip has a limit: about 150 people. That's roughly how many individuals a human can personally know. But humans cooperate in groups of thousands, even millions. How is that possible?", "highlight": None},
            {"speaker": "cosmii", "text": "Harari's answer: humans have an innate ability to believe in 'fictions' — things that don't exist, can't be touched, and have never been experienced. He calls this the 'Cognitive Revolution.'", "highlight": "The Cognitive Revolution"},
            {"speaker": "cosmii", "text": "Think about it. Can you touch 'the United States' as a country? Nope. What about 'Apple' the corporation? The offices exist, but the 'company' itself? Untouchable. 'Human rights'? 'The law'? All invisible fictions. And yet we all treat them as absolutely real!", "highlight": "Invisible things"},
            {"speaker": "cosmii", "text": "Try telling a chimp: 'Work hard now and when you die, you'll go to Banana Heaven.' Would it believe you? Not a chance. But humans buy into stories like that all the time. And that shared belief is exactly what lets millions of strangers cooperate flexibly.", "highlight": "What chimps can't do"},
            {"speaker": "cosmii", "text": "Here's what's truly mind-blowing — money, nations, religions, laws, corporations... almost everything holding human civilization together is actually fiction. None of it physically exists. It only works because everyone believes in it together.", "highlight": "Everything is fiction"},
            {"speaker": "cosmii", "text": "So here's Harari's big takeaway: Sapiens didn't conquer the Earth by being stronger, smarter, or better with tools. It was the ability to collectively believe in fictions that don't exist. That ability let us cooperate with total strangers, and that cooperation changed the world. And that wraps up Part 1 — the Cognitive Revolution!", "highlight": None},
        ],
        "quizzes": [
            {
                "question": "What is the core of Harari's 'Cognitive Revolution'?",
                "options": ["The ability to make tools", "The ability to use fire", "The ability to collectively believe in fictions that don't exist", "The ability to use language"],
                "correct_index": 2,
                "explanation": "The Cognitive Revolution is all about believing in fictions. By sharing fictions like nations, money, and religion, even complete strangers can cooperate on a massive scale.",
            },
            {
                "question": "Which of the following is NOT a 'fiction' in Harari's view?",
                "options": ["The United States", "Apple Inc.", "Human rights", "A rock"],
                "correct_index": 3,
                "explanation": "A rock physically exists. Nations, corporations, and human rights, on the other hand, only exist because humans collectively believe in them. It's these shared fictions that enable large-scale cooperation.",
            },
        ],
    },

    # ── Lesson 3: Agriculture as history's biggest fraud ──
    3: {
        "title": "History's Biggest Fraud — The Truth About the Agricultural Revolution",
        "chapter_title": "The Agricultural Revolution",
        "spark": "Agriculture wasn't humanity's blessing — it was 'history's biggest fraud'?",
        "cliffhanger": "But it wasn't just more work. Farming absolutely wrecked the human body too.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Welcome to Part 2 — the Agricultural Revolution. Here's Harari's bombshell: 'Agriculture is the biggest fraud in human history.' When I first heard that, I thought 'you can't be serious.' But the more you listen, the more it pulls you in.", "highlight": "History's biggest fraud"},
            {"speaker": "cosmii", "text": "Let's check our assumptions first. The Agricultural Revolution was a blessing, right? Humans could settle down, stop running after prey, and live stable lives. That's what we all learned in school.", "highlight": None},
            {"speaker": "cosmii", "text": "Harari sees it the exact opposite way. Imagine Stone Age people thinking: 'If we plant seeds, crops will grow! We'll have a steady food supply! No more chasing dangerous animals! More free time!' — this turned out to be a completely delusional fantasy.", "highlight": "A sweet delusion"},
            {"speaker": "cosmii", "text": "Here's what actually happened: once farming started, people had to work from sunrise to sunset without rest. Back in the hunting days? They only worked three or four hours a day! Stone Age people actually had way more leisure time than farmers.", "highlight": "More labor"},
            {"speaker": "cosmii", "text": "On top of that, staying in one place and farming meant having more babies. Population exploded. More people meant needing more food, which meant more farming... an endless vicious cycle.", "highlight": "Population explosion"},
            {"speaker": "cosmii", "text": "Harari's line here is brilliant: 'Humans didn't domesticate wheat — wheat domesticated humans.' From wheat's perspective, humans are slaves who toil from dawn to dusk on its behalf. So who really domesticated whom? Think about that.", "highlight": "Slaves to wheat"},
        ],
        "quizzes": [
            {
                "question": "According to Harari, how did working hours change from the Stone Age to the agricultural era?",
                "options": ["Decreased significantly", "Stayed about the same", "Actually increased dramatically", "There's no way to know"],
                "correct_index": 2,
                "explanation": "Hunter-gatherers only worked three to four hours a day, but after farming began, people had to labor from sunrise to sunset. Agriculture actually made life much harder.",
            },
            {
                "question": "What does Harari mean by 'Wheat domesticated humans'?",
                "options": ["That wheat has intelligence", "That humans became slaves serving wheat's interests", "That wheat farming was easy", "That wheat spread naturally"],
                "correct_index": 1,
                "explanation": "From wheat's perspective, humans are servants who plow the soil, water the fields, and pull weeds — all for wheat's benefit. We think we domesticated wheat, but really, wheat ended up dominating our lives.",
            },
        ],
    },

    # ── Lesson 4: Bodies ruined by farming, disease, war begins ──
    4: {
        "title": "Broken Bodies — How Farming Brought Disease and Inequality",
        "chapter_title": "The Agricultural Revolution",
        "spark": "Agriculture made human bodies smaller and destroyed our immune systems.",
        "cliffhanger": "Was farming a disaster only for humans? Harari says it was a catastrophe for the entire planet.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Last lesson, we talked about how farming increased working hours. Today's story is even more shocking — agriculture literally wrecked the human body.", "highlight": None},
            {"speaker": "cosmii", "text": "Hunter-gatherers ate a diverse diet. Deer today, berries tomorrow, fish the day after — naturally balanced nutrition. But once farming took over? Rice, rice, rice. Wheat, wheat, wheat. Severe nutritional imbalance.", "highlight": "Nutritional imbalance"},
            {"speaker": "cosmii", "text": "The result? Human bodies actually got smaller. Seriously — there's archaeological evidence. Skeletons from before agriculture are bigger and sturdier than those from after. Immune systems weakened too, making people way more vulnerable to disease.", "highlight": "Shrinking bodies"},
            {"speaker": "cosmii", "text": "And here's where it gets really scary. Farming required livestock — cows, pigs, chickens. Living alongside these animals exposed humans to all kinds of diseases. MERS, bird flu, swine flu — these epidemics all came from livestock. Already-weakened immune systems plus animal-borne pathogens? Recipe for disaster.", "highlight": "Diseases from livestock"},
            {"speaker": "cosmii", "text": "Oh, and there were no organized wars in the Stone Age. Occasional fights, sure, but not systematic warfare. Why? No property! If you were hungry, you hunted. If resources ran out, you moved on. But once farming created 'my land' and 'my grain,' wars to protect or seize them were inevitable.", "highlight": "The birth of war"},
            {"speaker": "cosmii", "text": "So to sum it up — pre-agricultural humans were actually healthier, had more free time, and lived without war. What farming brought was more labor, worse health, warfare, and inequality. That's why Harari calls it a fraud.", "highlight": None},
        ],
        "quizzes": [
            {
                "question": "What was the main cause of declining health after the Agricultural Revolution?",
                "options": ["Lack of exercise", "Nutritional imbalance from single-crop diets and diseases from livestock", "Increased stress", "Sleep deprivation"],
                "correct_index": 1,
                "explanation": "After farming began, people ate mostly one crop like rice or wheat, causing nutritional imbalance. Living with livestock exposed them to epidemics. These two factors severely damaged human health.",
            },
            {
                "question": "Why was there no organized warfare in the Stone Age?",
                "options": ["The population was too small", "There was no property worth fighting over", "There were no weapons", "Everyone was related"],
                "correct_index": 1,
                "explanation": "In hunter-gatherer times, the concept of 'mine' barely existed. No property meant nothing to fight over, so there was no reason for war. Once farming created property, warfare followed.",
            },
        ],
    },

    # ── Lesson 5: Earth's suffering, chicken as most "successful" species ──
    5: {
        "title": "A Planet's Misery — Does Reproduction Equal Success?",
        "chapter_title": "The Agricultural Revolution",
        "spark": "By sheer numbers, the most 'successful' species on Earth isn't humans — it's chickens.",
        "cliffhanger": "Farming didn't just bring misery — it created kings, slaves, and entire class systems. Next up: the 'imagined order.'",
        "dialogue": [
            {"speaker": "cosmii", "text": "Today we're zooming out. The Agricultural Revolution didn't just affect humans. Harari says it was 'an enormous catastrophe for every species on Earth.'", "highlight": None},
            {"speaker": "cosmii", "text": "Think about it. The great wild animals that once roamed the Earth — elephants, lions, giraffes, bears... where are they now? In zoos. They basically only exist inside National Geographic documentaries.", "highlight": "The vanished wild"},
            {"speaker": "cosmii", "text": "Here's where Harari asks a brilliant question: 'If we measure a species' success purely by reproduction, what's the most successful creature on Earth?' Humans? Nope. There are about 8 billion of us.", "highlight": None},
            {"speaker": "cosmii", "text": "The winner is — chickens! 29 billion of them. Then cattle at 1 billion, sheep at 1 billion, pigs at 1 billion. Wild boar used to be rare, but now there are a billion domesticated pigs on the planet.", "highlight": "29 billion chickens"},
            {"speaker": "cosmii", "text": "But wait — can we really call chickens 'successful'? Look at their lives. Crammed into tiny cages, laying eggs until they're fat enough, then slaughtered. Their species reproduced like crazy, but each individual chicken's life is the worst in history. Same goes for cows and pigs.", "highlight": "Reproduction \u2260 happiness"},
            {"speaker": "cosmii", "text": "Harari's conclusion: the Agricultural Revolution turned humans into slaves of wheat, pushed wild animals toward extinction, and turned livestock into miserable creatures whose only 'success' is reproduction. In the end, humans reshaped every living thing on Earth to suit their own needs — and crowned themselves rulers of the planet.", "highlight": None},
        ],
        "quizzes": [
            {
                "question": "According to Harari, if we measure species success purely by reproduction, which animal is most successful?",
                "options": ["Humans (8 billion)", "Chickens (29 billion)", "Cattle (1 billion)", "Ants"],
                "correct_index": 1,
                "explanation": "By raw population numbers, chickens lead with about 29 billion. But Harari questions whether that's real 'success' — they reproduced enormously, but each individual chicken's quality of life is abysmal.",
            },
            {
                "question": "Which best describes the Agricultural Revolution's impact on livestock?",
                "options": ["Livestock became safer and happier", "Reproduction exploded but individual lives became miserable", "Lifespans increased compared to the wild", "It had little effect on livestock"],
                "correct_index": 1,
                "explanation": "Thanks to humans, livestock species boomed in population. But each individual animal lives crammed in tight spaces before being slaughtered. Reproductive success doesn't equal happiness.",
            },
        ],
    },

    # ── Lesson 6: Imagined Order — kings, slaves, Hammurabi vs Declaration ──
    6: {
        "title": "The Imagined Order — Why Kings and Slaves Were Invented",
        "chapter_title": "The Agricultural Revolution",
        "spark": "Hammurabi's Code (1776 BC) says people are born unequal. The US Declaration (1776 AD) says all are created equal. Both are imagined.",
        "cliffhanger": "The imagined order created by agriculture held for thousands of years. Next: how Sapiens unified the entire world.",
        "dialogue": [
            {"speaker": "cosmii", "text": "The Agricultural Revolution didn't just bring labor and disease. Something even scarier emerged — social classes. Kings, nobles, commoners, slaves... where did these hierarchies come from?", "highlight": None},
            {"speaker": "cosmii", "text": "Harari draws a razor-sharp comparison. Hammurabi's Code from 1776 BC: 'Superiors and inferiors are different by birth. Slaves are property.' Then the US Declaration of Independence from 1776 AD: 'All men are created equal.' Completely opposite claims, right?", "highlight": "Two 1776s"},
            {"speaker": "cosmii", "text": "Here's Harari's bombshell — they're both wrong. Or more precisely, they're both imagined. Humans are unequal by birth? No biological basis for that. All humans are equal? That's not a biological fact either. 'Equality' itself is a fiction humans invented.", "highlight": "Both are imagined"},
            {"speaker": "cosmii", "text": "So why did kings and slaves emerge? Agriculture. In hunter-gatherer times, there was no property, so there were no classes. But once farming produced food surpluses, someone needed to manage them — that became the king. And someone needed to work the fields — that became the slave.", "highlight": "Surplus created hierarchy"},
            {"speaker": "cosmii", "text": "Caste systems, racial discrimination, gender inequality... according to Harari, all of these are 'imagined orders.' They're maintained not by biology, but because people collectively believe in them. The 'fiction-believing ability' from Part 1? Here's its dark side.", "highlight": "The imagined order"},
            {"speaker": "cosmii", "text": "The bottom line: inequality in human society isn't 'natural.' Agriculture created surpluses, surpluses created classes, and classes were maintained by imagined orders. Many of the social rules we take for granted are actually built on fiction.", "highlight": None},
        ],
        "quizzes": [
            {
                "question": "What does Harari say Hammurabi's Code and the US Declaration of Independence have in common?",
                "options": ["Both are just laws", "Both are based on biological facts", "Both are 'imagined orders' — fictions", "Both were created in Europe"],
                "correct_index": 2,
                "explanation": "Hammurabi's 'inequality' and the Declaration's 'equality' are both imagined — neither has a biological basis. Which order gets accepted as 'truth' depends on the era and culture.",
            },
            {
                "question": "What was the fundamental cause of social classes emerging after the Agricultural Revolution?",
                "options": ["Human nature is inherently unequal", "Food surpluses required managers (kings) and laborers (slaves)", "God ordained the hierarchy", "The losers of wars became slaves"],
                "correct_index": 1,
                "explanation": "In hunter-gatherer times, no property meant no classes. Once farming created food surpluses, someone had to manage them (kings) and someone had to produce them (slaves). Imagined orders were then created to maintain this structure.",
            },
        ],
    },

    # ── Lesson 7: Money as a fiction (60 trillion vs 6 trillion) ──
    7: {
        "title": "The Great Fiction Called Money — The Magic of Colored Paper",
        "chapter_title": "The Unification of Humankind",
        "spark": "All the money in the world adds up to $60 trillion — but only $6 trillion of it physically exists.",
        "cliffhanger": "After money, the next force that unified humanity was empire. But what does it mean for empire to be a 'double-edged sword'?",
        "dialogue": [
            {"speaker": "cosmii", "text": "Part 3 is about how humanity became unified. In the first few centuries AD — no phones, no internet — how did millions of people form unified societies?", "highlight": None},
            {"speaker": "cosmii", "text": "Harari identifies three tools: first — money, second — empire, third — religion. Guess what they all have in common? None of them physically exist.", "highlight": "Three tools of unification"},
            {"speaker": "cosmii", "text": "Let's start with money. Quick question — does money physically exist? 'Obviously, it's in my wallet,' you might say. Hold on. There's a difference between 'money' and 'currency.' Money is the value of things; currency is the vessel that holds that value.", "highlight": "Money vs. currency"},
            {"speaker": "cosmii", "text": "The history of currency is fascinating. In prehistoric times, it was seashells. Then gold, then silver, and now we call colored pieces of paper 'money.' When you think about it, it's actually hilarious — the thing we'd kill to earn is basically colored paper!", "highlight": "The magic of colored paper"},
            {"speaker": "cosmii", "text": "Here's the truly shocking part. According to Harari, about $60 trillion circulates worldwide, but only $6 trillion exists as actual bills and coins. The other $54 trillion? Just numbers on a bank's computer screen. No physical reality whatsoever!", "highlight": "The $54 trillion fiction"},
            {"speaker": "cosmii", "text": "So money is really just 'trust.' This piece of colored paper is only worth something because everyone agrees it is. Remember that ability to 'collectively believe in fiction' from Part 1? Here it is again! Money is the most successful fiction in human history.", "highlight": None},
        ],
        "quizzes": [
            {
                "question": "Out of approximately $60 trillion circulating worldwide, how much exists as physical bills and coins?",
                "options": ["All $60 trillion", "About $30 trillion", "About $6 trillion", "About $1 trillion"],
                "correct_index": 2,
                "explanation": "Only about $6 trillion exists physically. The remaining $54 trillion lives only as numbers on bank computers. Most money is a fiction with no physical form.",
            },
            {
                "question": "What's the most essential thing for money to work?",
                "options": ["Gold backing", "Government force", "Collective trust and belief among people", "Quality of the paper"],
                "correct_index": 2,
                "explanation": "Money stands on the collective belief that 'this has value.' The moment everyone believes, colored paper gains worth. The moment belief disappears, money disappears too. That's the essence of trust.",
            },
        ],
    },

    # ── Lesson 8: Empires as double-edged swords ──
    8: {
        "title": "Empire as a Double-Edged Sword — Destroyer or Builder?",
        "chapter_title": "The Unification of Humankind",
        "spark": "Imperialism is a history of invasion and exploitation — but also a legacy of civilization.",
        "cliffhanger": "The third tool of unification is religion. People kill and die for a god they've never seen or touched.",
        "dialogue": [
            {"speaker": "cosmii", "text": "When you hear 'empire,' what comes to mind? Colonialism, invasion, exploitation, domination... mostly negative images, right? Same here.", "highlight": None},
            {"speaker": "cosmii", "text": "Harari doesn't deny empire's violence. But he throws in a controversial perspective: 'Empire is like a double-edged sword — it actually left us a considerable legacy.'", "highlight": "Double-edged sword"},
            {"speaker": "cosmii", "text": "Take the British Empire, for example. Britain's domination of India was clearly wrong — exploitation and oppression. But after the British left, the railroads they built, the legal systems they established, the administrative structures they set up... these did contribute to India's modernization.", "highlight": "Britain and India"},
            {"speaker": "cosmii", "text": "This argument got absolutely roasted worldwide. 'Are you justifying colonial rule?' — the criticism was fierce. It's obviously a sensitive topic. And Harari isn't saying imperialism was 'good.'", "highlight": "Controversy"},
            {"speaker": "cosmii", "text": "What Harari's really saying is this: we can't view history through a simple 'good vs. evil' lens. Empires destroyed, but they also built. Roads, laws, languages, cultures... many things we use today are legacies of empire.", "highlight": None},
            {"speaker": "cosmii", "text": "The key point is that empires unified humanity. The Roman Empire unified Europe, the Mongol Empire unified Asia, the British Empire connected the entire world. Like it or not, empire was the most powerful mechanism through which humans mixed and merged.", "highlight": "The mechanism of unification"},
        ],
        "quizzes": [
            {
                "question": "Why does Harari call empire a 'double-edged sword'?",
                "options": ["Because they used lots of swords in wars", "Because empires invaded and exploited, but also left behind civilizational legacies", "Because empires split into two parts", "Because empires were purely beneficial"],
                "correct_index": 1,
                "explanation": "On one side, empires invaded and exploited. On the other, they left legacies like railroads, legal systems, and governance. Harari's point is that we shouldn't reduce history to a simple good-vs-evil narrative.",
            },
            {
                "question": "What does Harari see as the historical role of empire?",
                "options": ["Destroying human culture", "Dividing humanity", "The most powerful mechanism for unifying humanity, for better or worse", "Protecting the natural environment"],
                "correct_index": 2,
                "explanation": "Harari isn't saying empires were morally good. He's pointing out the historical fact that Rome, the Mongols, Britain, and others served as the most powerful forces connecting and unifying people across the globe.",
            },
        ],
    },

    # ── Lesson 9: Religion as unifying fiction ──
    9: {
        "title": "The Power of an Invisible God — Religion Completes the Unification",
        "chapter_title": "The Unification of Humankind",
        "spark": "No one has ever touched or met God — yet people kill and die in God's name.",
        "cliffhanger": "United by the Cognitive Revolution, settled by agriculture, bound together by money, empire, and religion — Sapiens now picked up the ultimate weapon: science.",
        "dialogue": [
            {"speaker": "cosmii", "text": "The third tool of human unification: religion. Harari's take is fresh yet again — religion, like money and empire, is just an extension of 'collectively believing in fiction.'", "highlight": None},
            {"speaker": "cosmii", "text": "Think about it. Has anyone ever touched God? Nope. Met God? Nope. Had lunch with God? Obviously not. Yet in God's name, people donate their wealth, wage wars, kill, and die. The Crusades are a prime example.", "highlight": "An invisible God"},
            {"speaker": "cosmii", "text": "Harari's core point isn't that religion is bad. It's that 'believing in and following something that doesn't exist is a uniquely human trait.' There's the Cognitive Revolution from Part 1 showing up again!", "highlight": "A uniquely human trait"},
            {"speaker": "cosmii", "text": "Here's religion's real power: millions of people who've never met each other become one community simply by believing in the same god. Christians with Christians, Muslims with Muslims, Buddhists with Buddhists. Connected across borders, languages, and races.", "highlight": "Connection beyond borders"},
            {"speaker": "cosmii", "text": "Let's wrap up Part 3. Money — a fiction that works because everyone believes it has value. Empire — a system that binds people together, by force or by choice. Religion — a community united by shared belief in an invisible being. What do all three have in common? None of them physically exist.", "highlight": "What all three share"},
            {"speaker": "cosmii", "text": "Ultimately, what unified humanity wasn't physical force — it was 'imagined orders.' Humans used their ability to believe in fiction to band together, and through the fictions of money, empire, and religion, they connected the entire world. Pretty amazing — and a little terrifying, don't you think?", "highlight": None},
        ],
        "quizzes": [
            {
                "question": "What common thread does Harari identify among money, empire, and religion?",
                "options": ["They all originated in Europe", "They're all fictions with no physical reality", "They all brought peace", "They were all created by one person"],
                "correct_index": 1,
                "explanation": "Money, empire, and religion have no physical substance. They exist only because people collectively believe in them. That's the common thread among humanity's three great unifying tools.",
            },
            {
                "question": "How did religion contribute to unifying humanity?",
                "options": ["By making everyone speak the same language", "By connecting people across borders through shared belief in an invisible being", "By unifying through military force", "By making everyone eat the same food"],
                "correct_index": 1,
                "explanation": "Religion connected millions who'd never met by giving them a shared god to believe in. It transcended borders, languages, and races to forge a single community.",
            },
        ],
    },

    # ── Lesson 10: Discovery of ignorance, 500-year sleep experiment ──
    10: {
        "title": "The Discovery of Ignorance — Waking from a 500-Year Sleep",
        "chapter_title": "The Scientific Revolution",
        "spark": "Someone who fell asleep in 1100 and woke in 1600 wouldn't be shocked — but someone who fell asleep in 1500 and woke in 2000 would faint.",
        "cliffhanger": "The Scientific Revolution started — but science alone doesn't change the world. You need money. Enter the magic of capitalism.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Part 4 — the Scientific Revolution. Harari runs a brilliant thought experiment here. Seriously, this one gave me goosebumps.", "highlight": None},
            {"speaker": "cosmii", "text": "Imagine someone living around 1100 AD falls into a deep sleep for 500 years and wakes up in 1600. Would they be shocked by the world? Harari's answer: 'Not really.' Why? Because the world barely changed between 1100 and 1600.", "highlight": "500-year sleep #1"},
            {"speaker": "cosmii", "text": "It's like someone from medieval England waking up in Renaissance England. Sure, some things changed, but people still rode horses, farmed the land, and were ruled by kings. The basic fabric of life was pretty much the same.", "highlight": None},
            {"speaker": "cosmii", "text": "But! Imagine a sailor traveling with Columbus around 1500 falls asleep and wakes up in 2000 to the sound of an iPhone alarm. What happens? They'd probably think 'Am I in heaven or hell?' and pass out on the spot.", "highlight": "500-year sleep #2"},
            {"speaker": "cosmii", "text": "Same 500 years — so why the massive difference? Because the Scientific Revolution happened in between. The last 500 years of human history saw more change than the previous tens of thousands combined.", "highlight": "The 500-year difference"},
            {"speaker": "cosmii", "text": "Harari pinpoints the starting point of the Scientific Revolution as the 'discovery of ignorance.' Before that, humanity didn't even know it didn't know things. Religion had all the answers, end of story. But then came a new attitude: 'We don't know — so let's find out.' That small shift flipped the entire world upside down.", "highlight": "The discovery of ignorance"},
        ],
        "quizzes": [
            {
                "question": "In Harari's thought experiment, why wasn't the change from 1100 to 1600 dramatic?",
                "options": ["The population was too small", "The Scientific Revolution hadn't happened yet, so life was essentially the same", "There were no wars", "The same king was ruling"],
                "correct_index": 1,
                "explanation": "Before the Scientific Revolution, life barely changed even over centuries. People still farmed, rode horses, and lived under monarchs. It was only after the Scientific Revolution that explosive change began.",
            },
            {
                "question": "What does Harari identify as the starting point of the Scientific Revolution?",
                "options": ["The invention of the steam engine", "The admission of ignorance: 'We don't know'", "The invention of gunpowder", "The development of the printing press"],
                "correct_index": 1,
                "explanation": "The shift from 'We have all the answers' to 'We don't know — let's find out' was the spark that ignited the Scientific Revolution. This 'discovery of ignorance' drove humanity's explosive progress.",
            },
        ],
    },

    # ── Lesson 11: Capitalism & Credit — zero-sum to growth ──
    11: {
        "title": "The Magic of Capitalism — How Credit Creates the Future",
        "chapter_title": "The Scientific Revolution",
        "spark": "Before capitalism, the economy was a 'zero-sum game.' For someone to get richer, someone else had to get poorer.",
        "cliffhanger": "Capitalism built the engine — but Europe was the one that used it best. Why Europe of all places?",
        "dialogue": [
            {"speaker": "cosmii", "text": "Let's continue the Scientific Revolution story. Science alone didn't change the world. Harari highlights a key formula: 'Science + Empire + Capitalism = the modern world.' Today's topic is capitalism.", "highlight": None},
            {"speaker": "cosmii", "text": "Imagine the pre-capitalist economy. People thought of the economy as a fixed pie — since the pie's size is set, if I eat more, you eat less. A zero-sum game. Getting rich meant exploiting someone.", "highlight": "The zero-sum game"},
            {"speaker": "cosmii", "text": "Then capitalism introduced a revolutionary concept: credit. A baker borrows money from a bank, expands her shop, earns more, and pays back with interest. The pie itself grew! This was a revolutionary idea.", "highlight": "The magic of credit"},
            {"speaker": "cosmii", "text": "The key? Trust in the future. Because we believe tomorrow will be better than today, we invest — and because we invest, tomorrow actually does get better. If science began with 'admitting ignorance,' capitalism began with 'trusting the future.'", "highlight": "Trust in the future"},
            {"speaker": "cosmii", "text": "Harari sees science, empire, and capitalism forming a feedback loop. Capital funds exploration \u2192 new territories discovered \u2192 scientific knowledge expands \u2192 more wealth \u2192 more investment. This cycle was the engine behind the last 500 years of explosive growth.", "highlight": "The feedback loop"},
            {"speaker": "cosmii", "text": "But there's a dark side. The Atlantic slave trade was a business venture. Investors pooled money to buy Africans, forced them to work on American plantations, sold the sugar, and pocketed the profits. Capitalism's logic turned human beings into commodities. Harari calls this 'capitalism's original sin.'", "highlight": "Capitalism's original sin"},
        ],
        "quizzes": [
            {
                "question": "What does it mean that the pre-capitalist economy was a 'zero-sum game'?",
                "options": ["Everyone was equal", "The economic pie was fixed — for someone to get richer, someone else had to get poorer", "Money didn't exist", "There was no trade"],
                "correct_index": 1,
                "explanation": "In a zero-sum game, total wealth is fixed, so one person's gain is another's loss. Capitalism's revolutionary idea was that credit could grow the pie itself — the economy could expand.",
            },
            {
                "question": "What's the core of Harari's 'science-empire-capitalism feedback loop'?",
                "options": ["The three compete with each other", "Capital funds exploration, exploration expands knowledge, knowledge creates wealth — in a reinforcing cycle", "Science destroys empires", "Capitalism hinders science"],
                "correct_index": 1,
                "explanation": "Capital invests in exploration and research \u2192 new discoveries \u2192 scientific knowledge grows \u2192 more wealth created \u2192 reinvestment. This feedback loop was the engine of the last 500 years of explosive growth.",
            },
        ],
    },

    # ── Lesson 12: Why Europe, not China — competition from fragmentation ──
    12: {
        "title": "Competition Built the New World — How Europe Became a Superpower",
        "chapter_title": "The Scientific Revolution",
        "spark": "China invented gunpowder, the compass, and paper — but Europe used them to conquer the world.",
        "cliffhanger": "Cognitive Revolution, Agricultural Revolution, Scientific Revolution... after all this progress — are we actually happier?",
        "dialogue": [
            {"speaker": "cosmii", "text": "Harari asks a fascinating question here: 'How did the people of Western Europe — historically among the poorest on Earth — become the epicenter of the Scientific and Industrial Revolutions?'", "highlight": None},
            {"speaker": "cosmii", "text": "Consider China's three great inventions: gunpowder, the compass, and paper (or printing). China invented them all. Yet it was Europe that used these inventions to dominate the world. Why?", "highlight": "China's three inventions"},
            {"speaker": "cosmii", "text": "Harari's explanation goes like this: Ming Dynasty China was the world's unrivaled superpower. They had nothing to envy. So their attitude was, 'What else is there to learn?' Meanwhile, Europe was poor and weak — and therefore desperate.", "highlight": "China's complacency vs. Europe's desperation"},
            {"speaker": "cosmii", "text": "Europe's secret weapon was 'competition born from fragmentation.' Europe wasn't one unified empire — it was dozens of small, rival nations. Portugal, Spain, England, France... all competing fiercely. The story of Columbus is a perfect example.", "highlight": "Fragmentation bred competition"},
            {"speaker": "cosmii", "text": "When Portugal opened a sea route to India by sailing around Africa, Spain panicked. 'We need to do something!' That's when Columbus showed up pitching: 'Sail west and we'll reach India!' Queen Isabella of Spain took the gamble, and they stumbled upon the Americas.", "highlight": "Columbus's gamble"},
            {"speaker": "cosmii", "text": "Here's the bottom line: China was so powerful it saw no need for change. Europe was weak, so it 'admitted its ignorance' and set out to explore. Fragmentation created competition, competition drove exploration, and exploration led to the Scientific Revolution. Ironically, Europe's greatest weakness became its greatest strength.", "highlight": None},
        ],
        "quizzes": [
            {
                "question": "What does Harari identify as the key reason the Scientific Revolution began in Europe?",
                "options": ["Europeans were smarter", "Europe's fragmentation created competition, which drove exploration and innovation", "Europe had a better climate", "Europe had more gold"],
                "correct_index": 1,
                "explanation": "Europe was fragmented into dozens of small, competing nations. This fierce competition pushed them to admit their ignorance and explore the unknown — and that was the spark of the Scientific Revolution.",
            },
            {
                "question": "Why did China fail to dominate the world despite inventing gunpowder, the compass, and paper?",
                "options": ["Insufficient technology", "As the world's superpower, China saw no need for change", "Military defeats", "Insufficient population"],
                "correct_index": 1,
                "explanation": "Ming Dynasty China was so dominant that it felt no need to innovate. This complacency stifled progress, while poor, desperate Europe charged ahead with exploration and innovation.",
            },
        ],
    },

    # ── Lesson 13: The Happiness Question — are we happier? ──
    13: {
        "title": "Are We Happier? — Sapiens' Philosophical Question",
        "chapter_title": "The Scientific Revolution",
        "spark": "Despite all of humanity's progress — are we actually happier than a medieval peasant?",
        "cliffhanger": "Unable to find the answer to happiness, Sapiens head toward the final frontier — the door to becoming gods.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Cognitive Revolution, Agricultural Revolution, Scientific Revolution... Sapiens achieved incredible progress. But near the end of the book, Harari asks a deeply uncomfortable question: 'So are we actually happier?'", "highlight": None},
            {"speaker": "cosmii", "text": "Think about it seriously. An average middle-class person today gets better healthcare than Louis XIV, eats more varied food, and lives in a warmer house. But — are they happier than Louis XIV? Harari's answer: 'Probably not.'", "highlight": "Happier than Louis XIV?"},
            {"speaker": "cosmii", "text": "That's because happiness isn't determined by objective conditions — it's determined by expectations. When there were no air conditioners, a simple fan made you happy. Now, if the AC is off by just one degree, you're annoyed. Conditions improved, but expectations rose even faster.", "highlight": "The expectations trap"},
            {"speaker": "cosmii", "text": "Harari also gives a biological explanation. Happiness ultimately comes down to neurotransmitters like serotonin and dopamine. Win the lottery, get a promotion — dopamine spikes briefly, then drops right back to baseline. This is called the 'hedonic treadmill.'", "highlight": "The hedonic treadmill"},
            {"speaker": "cosmii", "text": "Then Harari brings up Buddhism. Buddhism's core teaching is 'stop chasing pleasure.' Happiness isn't about feeling more good emotions — it's about being less controlled by all emotions, good and bad. What the Buddha figured out 2,500 years ago, modern science is only now confirming.", "highlight": "The Buddha's insight"},
            {"speaker": "cosmii", "text": "The question Harari leaves us with: Sapiens conquered the Earth and gained godlike powers through science, yet they don't even know what they actually want. The power keeps growing, but the direction is missing. That might be Sapiens' most dangerous state of all.", "highlight": None},
        ],
        "quizzes": [
            {
                "question": "According to Harari, why aren't modern people necessarily happier than medieval people?",
                "options": ["Modern stress is greater", "Happiness is determined by expectations, not objective conditions", "Modern food is worse", "There were no wars in medieval times"],
                "correct_index": 1,
                "explanation": "Even as conditions improve, expectations rise just as fast — so happiness doesn't increase. A fan was satisfying when there were no ACs, but now even a slightly off AC frustrates us. That's the 'expectations trap.'",
            },
            {
                "question": "What key point about happiness did Harari emphasize through Buddhism?",
                "options": ["Owning more brings happiness", "Happiness comes from not chasing pleasure and being less ruled by emotions", "Religious belief brings happiness", "Meditation makes you rich"],
                "correct_index": 1,
                "explanation": "Buddhism's core insight is that chasing pleasure causes suffering. True happiness comes not from feeling more good emotions, but from being less controlled by all emotions. Modern science backs this up.",
            },
        ],
    },

    # ── Lesson 14: Homo Deus — humans becoming gods ──
    14: {
        "title": "Homo Deus — Humans Becoming Gods",
        "chapter_title": "The Scientific Revolution",
        "spark": "The final question of Sapiens: will we open the gates of heaven, or the gates of hell?",
        "cliffhanger": "",
        "dialogue": [
            {"speaker": "cosmii", "text": "This is the final chapter of Sapiens. Harari sums up the entire journey: the Cognitive Revolution united us, the Agricultural Revolution multiplied us, money-empire-religion unified us, and science armed us to the teeth.", "highlight": None},
            {"speaker": "cosmii", "text": "Then Harari drops a bombshell phrase: 'We're no longer Homo sapiens — we're becoming Homo Deus.' 'Deus' is Latin for 'god.' Humans are trying to become gods.", "highlight": "Homo Deus"},
            {"speaker": "cosmii", "text": "This isn't hyperbole. Think about it. We can reach the other side of the world in hours (airplanes). We've left footprints on the moon. We're taking over domains once reserved for God — birth and death. Test-tube babies, gene editing, life extension... to someone from the past, these are literally divine powers.", "highlight": "Humans with godlike powers"},
            {"speaker": "cosmii", "text": "But here's Harari's warning: 'We have the power of gods, but not the wisdom of gods.' We can build nuclear weapons, but do we have the wisdom to use them responsibly? We can cause climate change, but do we have the wisdom to fix it?", "highlight": "Power without wisdom"},
            {"speaker": "cosmii", "text": "The very last line of Sapiens goes like this: 'We stand at a crossroads between heaven and hell. History has not yet decided our fate, and a string of coincidences could tip us in either direction.'", "highlight": "Heaven or hell"},
            {"speaker": "cosmii", "text": "That's the conclusion of the entire book. Unremarkable primates became rulers of Earth through the Cognitive Revolution. They settled down through the Agricultural Revolution, unified through money, empire, and religion, and gained godlike powers through the Scientific Revolution. But where we point that incredible power? That's still undecided. We could open the gates of heaven — or the gates of hell. The choice belongs to us, the living Homo sapiens. Thanks for reading this together — you crushed it!", "highlight": None},
        ],
        "quizzes": [
            {
                "question": "What does 'Deus' mean in 'Homo Deus'?",
                "options": ["Wise human", "God", "New species", "Machine"],
                "correct_index": 1,
                "explanation": "'Deus' is Latin for 'god.' Homo Deus means 'god-man' — Harari's term for modern humans who've gained godlike abilities through science and technology.",
            },
            {
                "question": "What is the ultimate question Sapiens poses at the end?",
                "options": ["When will humans go extinct?", "Will humans with godlike power open the gates of heaven or the gates of hell?", "What's the next stage of evolution?", "Will money disappear?"],
                "correct_index": 1,
                "explanation": "The final question of Sapiens is whether humans will use their godlike powers wisely or destructively. The answer hasn't been written yet — it's up to us.",
            },
        ],
    },
}


def main():
    sb = get_supabase()

    ensure_book()
    ensure_cover()

    existing = sb.table("lessons").select("id").eq("book_id", BOOK_ID).execute().data
    if existing:
        lesson_ids = [l["id"] for l in existing]
        for lid in lesson_ids:
            sb.table("quizzes").delete().eq("lesson_id", lid).execute()
        sb.table("lessons").delete().eq("book_id", BOOK_ID).execute()
        print(f"Deleted {len(existing)} existing lessons")

    for idx, lesson in enumerate(LESSONS):
        lesson_id = str(uuid.uuid4())
        en = TRANSLATIONS_EN.get(idx, {})

        ch = lesson["chapter"]
        ch_parts = ch.split(" ", 1)
        chapter_ko = f"{ch_parts[0]} {lesson['chapter_title']}" if len(ch_parts) > 1 else lesson["chapter_title"]
        chapter_en = ch

        def _shuffle(quiz, rng):
            opts = list(quiz["options"])
            answer = opts[quiz["correct_index"]]
            perm = list(range(len(opts)))
            rng.shuffle(perm)
            new_opts = [opts[i] for i in perm]
            return {**quiz, "options": new_opts, "correct_index": new_opts.index(answer)}

        ko_quizzes = []
        en_quizzes = []
        for qi, q in enumerate(lesson["quizzes"]):
            ko_quizzes.append(_shuffle(q, random.Random(idx * 100 + qi)))
        for qi, q in enumerate(en.get("quizzes", [])):
            en_quizzes.append(_shuffle(q, random.Random(idx * 100 + qi)))

        content = {
            "title": lesson["title"],
            "title_ko": lesson["title"],
            "title_en": en.get("title", ""),
            "chapter": lesson["chapter"],
            "chapter_ko": chapter_ko,
            "chapter_en": chapter_en,
            "chapter_title": lesson["chapter_title"],
            "chapter_title_ko": lesson["chapter_title"],
            "chapter_title_en": en.get("chapter_title", ""),
            "part": lesson["part"],
            "total_parts": lesson["total_parts"],
            "spark": lesson["spark"],
            "spark_ko": lesson["spark"],
            "spark_en": en.get("spark", ""),
            "dialogue": lesson["dialogue"],
            "dialogue_ko": lesson["dialogue"],
            "dialogue_en": en.get("dialogue", []),
            "quizzes": ko_quizzes,
            "quizzes_ko": ko_quizzes,
            "quizzes_en": en_quizzes,
            "cliffhanger": lesson["cliffhanger"],
            "cliffhanger_ko": lesson["cliffhanger"],
            "cliffhanger_en": en.get("cliffhanger", ""),
        }

        sb.table("lessons").insert({
            "id": lesson_id,
            "book_id": BOOK_ID,
            "order_index": idx,
            "title": lesson["title"],
            "lesson_type": "dialogue",
            "content_json": json.dumps(content, ensure_ascii=False),
        }).execute()

        for quiz in ko_quizzes:
            sb.table("quizzes").insert({
                "id": str(uuid.uuid4()),
                "lesson_id": lesson_id,
                "question": quiz["question"],
                "options_json": json.dumps(quiz["options"], ensure_ascii=False),
                "correct_index": quiz["correct_index"],
                "explanation": quiz["explanation"],
            }).execute()

        print(f"  \u2713 Lesson {idx+1}: {lesson['title']}")

    print(f"\nDone! Inserted {len(LESSONS)} lessons with quizzes.")


if __name__ == "__main__":
    main()
