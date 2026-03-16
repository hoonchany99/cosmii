"""Seed handcrafted demo lessons for The Divine Comedy by Dante Alighieri."""
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

BOOK_ID = "e40c0e43"

COVER_URL = "https://covers.openlibrary.org/b/isbn/9780142437223-L.jpg"


def ensure_book():
    """Ensure book entry exists in DB."""
    sb = get_supabase()
    sb.table("books").upsert({
        "id": BOOK_ID,
        "title": "신곡",
        "author": "단테 알리기에리",
        "color": "#dc2626",
    }).execute()
    print("✓ Ensured book entry exists")


def ensure_cover():
    """Download Divine Comedy cover and update DB."""
    covers_dir = settings.covers_dir
    covers_dir.mkdir(parents=True, exist_ok=True)

    cover_path = covers_dir / f"{BOOK_ID}.jpg"
    if not cover_path.exists():
        print("Downloading Divine Comedy cover image...")
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
        "author": "단테 알리기에리",
    }).eq("id", BOOK_ID).execute()
    print("  ✓ Updated book cover_url & author in DB")


# ═══════════════════════════════════════════════════════════════════
# 레슨 콘텐츠 — 처음 읽는 사람에게 설명하듯 친절하고 자세하게
# ═══════════════════════════════════════════════════════════════════

LESSONS = [
    # ══════════════════════════════════════════
    # 1부: 여행의 시작 (서곡)
    # ══════════════════════════════════════════

    # ── 서곡 (Part 1/2) ──
    {
        "title": "어두운 숲에서 길을 잃다 — 인생의 한가운데에서",
        "chapter": "Prologue",
        "chapter_title": "서곡",
        "part": 1, "total_parts": 2,
        "spark": "인생의 딱 절반에서, 단테는 갑자기 깨어난다 — 어두운 숲 한가운데에.",
        "dialogue": [
            {"speaker": "cosmii", "text": "반가워! 오늘부터 단테의 '신곡'을 같이 읽어볼 거야. 이 작품은 700년 전에 쓰였는데, 읽다 보면 소름이 돋아 — 지금 우리 이야기 같거든.", "highlight": None},
            {"speaker": "cosmii", "text": "신곡의 첫 문장이 이거야. 「우리 인생길 한가운데에서, 올바른 길을 잃고서, 나는 어두운 숲에 처해 있었네.」 단테가 35세일 때의 이야기야. 왜 35세냐면 — 성경에서 인생은 70이라고 했거든. 딱 절반인 거야.", "highlight": "인생길 한가운데"},
            {"speaker": "cosmii", "text": "생각해봐. 앞만 보고 달려왔는데, 어느 날 퍽 하고 정신 차려보니 어두운 숲 속에서 길을 잃고 있는 거야. 나는 누구지? 여긴 어디지? 우리도 이런 순간 있잖아. 열심히 살아왔는데 갑자기 '이게 맞나?' 싶어지는 그 순간.", "highlight": "나는 누구, 여긴 어디"},
            {"speaker": "cosmii", "text": "숲에서 빠져나가려고 하는데, 길을 가로막는 세 마리 짐승이 나타나. 첫 번째는 표범 — 탐욕을 상징해. 두 번째는 사자 — 권력욕이야. 세 번째는 이리 — 색욕. 내가 인생에서 길을 잃게 만든 것들이 딱 이 세 가지야.", "highlight": "세 마리 짐승"},
            {"speaker": "cosmii", "text": "단테의 인생에도 이유가 있었어. 실제로 단테는 피렌체의 정치가였는데, 정치 싸움에 휘말려서 고향에서 추방당해. 사랑했던 여자도 일찍 죽었고. 권력, 탐욕, 욕망에 둘러싸인 어두운 숲 속에 있었던 거야.", "highlight": "단테의 실제 인생"},
            {"speaker": "cosmii", "text": "그때! 어둠 속에서 그림자 하나가 나타나. 단테가 외쳐 — '사람이신가요? 좀 도와주세요!' 그 그림자가 이렇게 대답해. 「한때는 사람이었네. 지금은 아니지만.」 이탈리아에서는 모르는 사람이 없을 정도로 유명한 명대사야.", "highlight": "한때는 사람이었네"}
        ],
        "quizzes": [
            {
                "question": "단테가 '어두운 숲'에서 길을 잃은 것은 인생의 몇 세에 해당할까?",
                "options": ["20세 — 청춘의 방황", "35세 — 인생의 딱 절반", "50세 — 노년의 시작", "70세 — 인생의 끝"],
                "correct_index": 1,
                "explanation": "성경에서 인생은 70이라고 했기에, 그 절반인 35세에 단테는 자기 인생을 돌아보게 돼. 인생의 한가운데에서 길을 잃은 거야."
            },
            {
                "question": "단테의 앞을 가로막는 세 짐승이 상징하는 것은?",
                "options": ["용기, 지혜, 사랑", "탐욕, 권력욕, 색욕", "과거, 현재, 미래", "지옥, 연옥, 천국"],
                "correct_index": 1,
                "explanation": "표범은 탐욕, 사자는 권력욕, 이리는 색욕을 상징해. 인간이 올바른 길에서 벗어나게 만드는 세 가지 유혹이야."
            }
        ],
        "cliffhanger": "어둠 속에서 나타난 그림자의 정체는? 단테보다 1200년 앞서 살았던 전설적인 인물이야."
    },

    # ── 서곡 (Part 2/2) ──
    {
        "title": "베르길리우스의 손을 잡다 — 지옥으로의 초대",
        "chapter": "Prologue",
        "chapter_title": "서곡",
        "part": 2, "total_parts": 2,
        "spark": "1200년 전의 위대한 시인이 단테의 손을 잡고 말한다 — '나를 따라와.'",
        "dialogue": [
            {"speaker": "cosmii", "text": "어둠 속에서 나타난 그림자, 정체가 밝혀져. 로마 최고의 시인 베르길리우스야! 단테보다 약 1200년 전에 살았던 사람이야. 단테가 평생 존경한 문학의 스승이지.", "highlight": "베르길리우스"},
            {"speaker": "cosmii", "text": "쉽게 비유하면 — 내가 인생에서 길을 잃고 있을 때, 세종대왕이나 이순신 장군의 환영이 나타나서 내 손을 잡아주는 거야. 상상이 돼? 그 감동이 단테에게는 베르길리우스인 거야.", "highlight": None},
            {"speaker": "cosmii", "text": "베르길리우스가 이렇게 말해. '나를 따라와. 널 여기서 꺼내주는 방법이 있어.' 근데 그 방법이 뭐냐면 — 지옥을 직접 보여주겠다는 거야! 어두운 숲에서 빠져나오려면, 오히려 더 깊은 어둠을 통과해야 한다는 거지.", "highlight": "더 깊은 어둠을 통과"},
            {"speaker": "cosmii", "text": "이게 신곡의 핵심 구조야. 지옥 → 연옥 → 천국, 이 세 세계를 여행하는 거야. 지옥은 지구 속 깊이 파인 깔때기 모양이고, 연옥은 바다 위에 솟은 산이고, 천국은 하늘 위의 별들이야.", "highlight": "지옥 → 연옥 → 천국"},
            {"speaker": "cosmii", "text": "왜 지옥부터일까? 생각해보면 당연해. 인간이 무엇을 잘못하고 있는지(지옥), 어떻게 고칠 수 있는지(연옥), 그래서 어디에 도달할 수 있는지(천국) — 이 순서로 보여주는 거야. 인생의 GPS 같은 거지.", "highlight": None},
            {"speaker": "cosmii", "text": "그리고 여기서 중요한 장치가 하나 있어. 지옥과 연옥의 안내자는 베르길리우스(이성과 지혜의 상징)인데, 천국의 안내자는 다른 사람이야. 누군지는 나중에 밝혀져 — 단테의 인생에서 가장 특별한 존재. 자, 이제 지옥으로 내려가보자!", "highlight": "두 명의 안내자"}
        ],
        "quizzes": [
            {
                "question": "베르길리우스가 단테에게 제안한 '어두운 숲을 빠져나오는 방법'은?",
                "options": ["숲 밖으로 도망치기", "지옥을 직접 통과하며 진실을 보기", "기도를 열심히 하기", "세 짐승을 물리치기"],
                "correct_index": 1,
                "explanation": "더 깊은 어둠(지옥)을 통과해야 빛(천국)에 도달할 수 있어. 문제를 피하는 게 아니라 직면해야 한다는 게 신곡의 핵심 메시지야."
            },
            {
                "question": "신곡의 세 세계를 올바른 순서로 나열한 것은?",
                "options": ["천국 → 연옥 → 지옥", "연옥 → 지옥 → 천국", "지옥 → 연옥 → 천국", "지옥 → 천국 → 연옥"],
                "correct_index": 2,
                "explanation": "지옥(인간의 죄) → 연옥(죄를 씻는 과정) → 천국(구원)의 순서야. 어둠에서 출발해서 빛으로 나아가는 여정이지."
            }
        ],
        "cliffhanger": "지옥의 입구에 도착했어. 그 간판에 적힌 문장 — 역사상 가장 유명한 경고 중 하나야."
    },

    # ══════════════════════════════════════════
    # 2부: 지옥 상층 (1~5단계)
    # ══════════════════════════════════════════

    # ── 지옥 상층 (Part 1/2) ──
    {
        "title": "모든 희망을 버려라 — 지옥의 문과 1단계 림보",
        "chapter": "Inferno Upper",
        "chapter_title": "지옥 상층",
        "part": 1, "total_parts": 2,
        "spark": "지옥 입구의 간판 — '이곳에 들어오는 자, 모든 희망을 버려라.'",
        "dialogue": [
            {"speaker": "cosmii", "text": "드디어 지옥 입구에 도착했어. 간판에 뭐라고 써 있을까? 「이곳에 들어오는 자, 모든 희망을 버려라.」 이 한 줄이 전하는 메시지 — 희망이 없는 곳, 꿈이 없는 곳, 비전이 없는 곳. 그곳이 지옥이야.", "highlight": "모든 희망을 버려라"},
            {"speaker": "cosmii", "text": "이 문장 기억해둬. 나중에 천국과 대비될 때 소름 돋을 거야. 자, 지옥은 총 9단계로 나뉘어 있어. 깔때기 모양으로 점점 아래로 내려가면서 죄가 무거워지는 구조야.", "highlight": "9단계 지옥"},
            {"speaker": "cosmii", "text": "1단계는 '림보'라는 곳이야. '가장자리'라는 뜻인데 — 여기에는 가장 죄가 가벼운 사람들이 있어. 비명은 없어. 대신 끊임없는 탄식이 이어지고 있어.", "highlight": "림보"},
            {"speaker": "cosmii", "text": "근데 가보니까 — 세상에! 소크라테스가 있어. 플라톤이 있어. 아리스토텔레스가 있어! 인류 역사상 가장 위대한 철학자들이 여기 모여 있는 거야. 성벽 안에서 서로 대화하면서.", "highlight": "소크라테스, 플라톤"},
            {"speaker": "cosmii", "text": "왜 이 위대한 사람들이 지옥에 있을까? 이유가 있어 — 이들은 예수 이전에 살았거나, 기독교가 아닌 다른 종교를 믿었던 사람들이야. 덕망은 높았지만 '올바른 신앙'이 없었기 때문에 천국에 갈 수 없었던 거야. 고통은 없지만 신을 볼 수 없는 곳.", "highlight": "덕은 있지만 신앙은 없는"},
            {"speaker": "cosmii", "text": "이게 중세 기독교 세계관이야. 아무리 훌륭해도 세례를 받지 않으면 천국에 갈 수 없다는 거지. 현대의 시각에서 보면 좀 불공평해 보이는데, 당시에는 이게 당연한 상식이었어. 그리고 재미있는 건 — 베르길리우스도 바로 이 림보 출신이야!", "highlight": "베르길리우스의 고향"}
        ],
        "quizzes": [
            {
                "question": "지옥 1단계 '림보'에 소크라테스, 플라톤 같은 위인들이 있는 이유는?",
                "options": ["대단한 죄를 지어서", "기독교 이전에 살았거나 다른 종교를 믿어서", "지식을 탐했기 때문에", "겸손하지 못해서"],
                "correct_index": 1,
                "explanation": "림보에 있는 이들은 덕망은 높았지만 기독교 신앙이 없었어. 중세 세계관에서 세례를 받지 않으면 천국에 갈 수 없었기 때문에 이곳에 머무는 거야."
            },
            {
                "question": "지옥 입구의 '모든 희망을 버려라'가 의미하는 것은?",
                "options": ["체력을 아끼라는 뜻", "희망, 꿈, 비전이 없는 곳이 바로 지옥이라는 뜻", "겸손해야 한다는 뜻", "조용히 하라는 뜻"],
                "correct_index": 1,
                "explanation": "지옥은 희망이 없는 곳이야. 이 문장은 나중에 천국(무한한 희망과 빛)과 대비되면서 신곡 전체의 구조를 보여주는 핵심 메시지야."
            }
        ],
        "cliffhanger": "림보를 지나 더 아래로 내려가면, 바람이 부는 2단계가 나타나. 여기서 단테는 눈물을 터뜨려."
    },

    # ── 지옥 상층 (Part 2/2) ──
    {
        "title": "파올로와 프란체스카 — 사랑이 지옥에 떨어질 때",
        "chapter": "Inferno Upper",
        "chapter_title": "지옥 상층",
        "part": 2, "total_parts": 2,
        "spark": "'가장 비참할 때, 빛났던 과거를 회상하는 것보다 아픈 일은 없습니다.'",
        "dialogue": [
            {"speaker": "cosmii", "text": "2단계로 내려가면 수문장이 기다리고 있어. 미노스라는 괴물이야. 고대 그리스 크레타섬의 전설적인 심판관인데, 여기서 꼬리로 죄의 무게를 달아. 꼬리를 두 번 감으면 2단계, 세 번이면 3단계... 이런 식으로 죄인을 배분하는 거야.", "highlight": "미노스"},
            {"speaker": "cosmii", "text": "재미있는 건 — 신곡의 지옥 세계관은 기독교인데, 지옥 문을 지키는 수문장들은 전부 고대 그리스 로마 신화의 괴물이야. 이게 르네상스의 시작이야. 중세 기독교에 고대 그리스 로마를 가져와서 붙인 거지.", "highlight": "기독교 + 그리스 신화"},
            {"speaker": "cosmii", "text": "2단계는 '애욕의 지옥'이야. 여기서는 거센 바람이 불어. 죽은 망자들이 바람에 끝없이 휩쓸려 다니는 거야. 클레오파트라도 여기 있어 — 자신의 아름다움을 이용해 불륜을 저질렀으니까.", "highlight": "애욕의 바람"},
            {"speaker": "cosmii", "text": "그런데 바람에 날리다가 남녀 한 쌍이 다가와. '나는 파올로, 나는 프란체스카' 라고 해. 단테가 깜짝 놀라 — 당시 이탈리아에서 엄청나게 유명했던 실화의 주인공들이거든!", "highlight": "파올로와 프란체스카"},
            {"speaker": "cosmii", "text": "이야기는 이래. 프란체스카가 한 영주에게 시집을 갔는데, 그 남편의 동생 파올로와 눈이 맞은 거야. 결국 남편이 알아내서 둘 다 죽여버려. 그들이 여기서 영원히 바람에 휩쓸리고 있는 거야.", "highlight": None},
            {"speaker": "cosmii", "text": "프란체스카가 단테에게 이렇게 말해. 「내가 지금 가장 비참할 때, 빛났던 과거를 회상하는 것보다 아픈 일은 없습니다.」 이거 진짜 우리 삶에서도 겪는 거잖아. 잘 나가다가 바닥에 떨어졌을 때, 그때를 회상하는 그 고통. 단테가 여기서 눈물이 터져. 너무 공감해서 울다가 기절까지 해.", "highlight": "가장 아픈 회상"}
        ],
        "quizzes": [
            {
                "question": "프란체스카의 명대사 '비참할 때 빛났던 과거를 회상하는 것보다 아픈 일은 없다'가 의미하는 것은?",
                "options": ["과거를 잊어야 한다는 뜻", "행복했던 기억이 현재의 고통을 더 크게 만든다는 뜻", "과거가 중요하지 않다는 뜻", "미래만 생각하라는 뜻"],
                "correct_index": 1,
                "explanation": "과거의 행복한 기억이 오히려 현재의 비참함을 더 극심하게 만들어. 지옥에서 영원히 고통받는 그들에게 한때의 사랑은 가장 아픈 기억이 된 거야."
            },
            {
                "question": "신곡에서 지옥의 수문장들이 그리스 로마 신화 캐릭터인 이유는?",
                "options": ["단테가 그리스 로마를 싫어해서", "중세 기독교에 고대 문화를 결합한 르네상스적 시도", "역사적 사실이어서", "독자를 즐겁게 하려고"],
                "correct_index": 1,
                "explanation": "단테는 기독교 세계관에 고대 그리스 로마 신화를 가져와 결합했어. 이것이 중세에서 르네상스로 넘어가는 시대 정신을 보여주는 거야."
            }
        ],
        "cliffhanger": "단테는 기절에서 깨어나 더 아래로 내려가. 3단계부터 7단계까지, 인간의 다양한 욕망이 기다리고 있어."
    },

    # ══════════════════════════════════════════
    # 3부: 지옥 중층~하층 (3~7단계)
    # ══════════════════════════════════════════

    # ── 지옥 중층 (Part 1/2) ──
    {
        "title": "탐욕에서 분노까지 — 3~5단계의 지옥",
        "chapter": "Inferno Middle",
        "chapter_title": "지옥 중층",
        "part": 1, "total_parts": 2,
        "spark": "머리 셋 달린 케르베로스가 지키는 3단계, 돌을 밀며 싸우는 4단계, 분노가 끓어오르는 5단계.",
        "dialogue": [
            {"speaker": "cosmii", "text": "기절에서 깨어나니 3단계야. 여기는 폭식의 지옥이야. 먹고 먹고 또 먹던 사람들이 오는 곳. 근데 여기 수문장이 장난 아니야 — 머리가 세 개 달린 케르베로스!", "highlight": "케르베로스"},
            {"speaker": "cosmii", "text": "케르베로스가 이빨을 드러내고 있는데, 망자들이 들어오면 잡아 뜯어 먹어. 베르길리우스가 진흙을 한 주먹 퍼서 케르베로스 입에 던져! 괴물이 진흙 먹느라 정신없는 사이에 슬쩍 지나가는 거야.", "highlight": None},
            {"speaker": "cosmii", "text": "여기서 '폭식'은 단순히 많이 먹는 게 아니야. 중세 시대에 왕이나 귀족이 호화롭게 먹고 마신다는 건 — 그만큼 백성들의 것을 착취한다는 거야. 탐욕스러운 착취자들의 지옥이라고 보면 돼.", "highlight": "폭식 = 착취"},
            {"speaker": "cosmii", "text": "4단계로 내려가면 — 낭비와 인색의 지옥이야. 양쪽에서 사람들이 거대한 바위를 밀어. 한쪽은 살아생전에 돈만 모았던 구두쇠들, 반대쪽은 돈을 물 쓰듯 낭비했던 사람들. 서로 부딪치면서 싸우고 또 밀고... 영원히 반복해.", "highlight": "구두쇠 vs 낭비꾼"},
            {"speaker": "cosmii", "text": "뒤에서 들려오는 소리가 있어. '돈을 애써 모아야 돼!' '돈을 써야 돼!' 서로 정반대를 외치면서 영원히 충돌하고 있는 거야. 돈에 집착하든 돈을 함부로 쓰든, 결국 같은 지옥이라는 메시지.", "highlight": None},
            {"speaker": "cosmii", "text": "5단계는 분노의 지옥이야. 항상 분노에 가득 차 있던 사람들이 진흙탕에서 서로 물어뜯고 있어. 여기까지가 '자제력을 잃은 죄'들이야. 6단계부터는 성격이 완전히 달라져 — 의도를 가지고 남에게 해를 끼친 사람들의 영역이거든.", "highlight": "분노의 진흙탕"}
        ],
        "quizzes": [
            {
                "question": "4단계에서 구두쇠와 낭비꾼이 같은 지옥에 있는 이유는?",
                "options": ["둘 다 돈과 관련돼서", "돈에 집착하든 낭비하든, 결국 돈에 지배당한 것은 같기 때문에", "자리가 부족해서", "단테가 실수해서"],
                "correct_index": 1,
                "explanation": "돈을 너무 아끼든 너무 쓰든, 결국 '돈'에 삶이 지배당한 거야. 극단은 서로 반대 같지만 본질은 같다는 게 단테의 메시지야."
            },
            {
                "question": "3단계 '폭식의 지옥'이 단순히 '많이 먹은 죄'가 아닌 이유는?",
                "options": ["음식이 부족한 시대라서", "중세에 호화로운 식사는 백성 착취를 의미했기 때문에", "건강 문제 때문에", "종교적 금식 규정 때문에"],
                "correct_index": 1,
                "explanation": "중세 시대에 왕과 귀족의 호화로운 식사는 백성들의 것을 착취한 결과야. 단테는 단순한 식탐이 아니라 탐욕과 착취를 비판한 거야."
            }
        ],
        "cliffhanger": "6단계부터는 분위기가 확 바뀌어. 교황과 추기경들이 지옥에 있다니 — 단테의 용기가 대단해."
    },

    # ── 지옥 하층 (Part 2/2) ──
    {
        "title": "교황도 지옥에 간다 — 6~7단계, 이교도와 폭력",
        "chapter": "Inferno Middle",
        "chapter_title": "지옥 중층",
        "part": 2, "total_parts": 2,
        "spark": "교황, 추기경, 주교가 지옥에 있다 — 700년 전 단테의 폭로.",
        "dialogue": [
            {"speaker": "cosmii", "text": "6단계는 이교도의 지옥이야. 1단계 림보에도 이교도가 있었잖아? 거기는 덕을 쌓은 이교도였고, 여기는 덕을 쌓지 못한 이교도들이 고통받는 곳이야.", "highlight": None},
            {"speaker": "cosmii", "text": "근데 여기서 단테가 폭탄을 터뜨려. 교황이 여기 있어! 추기경도, 주교도! 성직자들이 지옥에 있는 거야. 700년 전에 현직 교황을 지옥에 넣는 소설을 쓴 거야 — 이 용기가 진짜 대단해.", "highlight": "교황이 지옥에"},
            {"speaker": "cosmii", "text": "이것이 단테가 그려낸 르네상스의 정신이야. 기존의 중세 기독교 권력, 부패한 교회를 정면으로 비판한 거야. 지금 우리 사회를 보는 것 같지 않아?", "highlight": "권력 비판"},
            {"speaker": "cosmii", "text": "7단계로 내려가면 폭력의 지옥이야. 여기는 세 종류로 나뉘어. 첫 번째 — 타인에게 폭력을 행사한 자들. 이 사람들은 펄펄 끓는 피의 강에 잠겨 있어. 머리를 내밀면 위에서 켄타우로스가 화살을 쏴. 다시 들어가면 뜨겁고, 나오면 화살이 날아오고 — 영원히.", "highlight": "피의 강"},
            {"speaker": "cosmii", "text": "두 번째는 자기 자신에게 폭력을 행사한 자들, 즉 자해한 사람들의 지옥이야. 이 사람들은 나무가 되어 있어. 베르길리우스가 '가지를 하나 꺾어봐' 하는데, 꺾는 순간 피가 흘러. 나뭇가지 하나하나가 사람인 거야.", "highlight": "나무가 된 사람들"},
            {"speaker": "cosmii", "text": "세 번째는 신에게 폭력을 행사한 자들 — 신성모독자들이야. 뜨거운 모래 위에서 불비가 내려. 마치 건식 사우나인데 영원히 나갈 수 없는 거야. 여기까지가 7단계. 근데 아직도 더 나쁜 놈들이 아래에 있어.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "단테가 교황과 추기경을 지옥에 넣은 것이 의미하는 바는?",
                "options": ["기독교를 부정하는 것", "부패한 종교 권력을 정면으로 비판한 것", "역사적 사실을 기록한 것", "단순한 유머"],
                "correct_index": 1,
                "explanation": "단테는 기독교 자체를 부정한 게 아니라, 부패한 성직자들을 비판한 거야. 중세의 권력에 맞서 진실을 말한 것이 신곡의 혁명적인 점이야."
            },
            {
                "question": "7단계 폭력의 지옥이 세 종류로 나뉘는 기준은?",
                "options": ["폭력의 강도", "타인·자신·신에 대한 폭력의 대상", "시대순", "무기의 종류"],
                "correct_index": 1,
                "explanation": "7단계는 폭력의 '대상'에 따라 세 구역으로 나뉘어. 타인에게(피의 강), 자신에게(나무 숲), 신에게(불비) — 각각 다른 형벌이 기다리고 있어."
            }
        ],
        "cliffhanger": "8단계부터는 단순한 폭력이 아니야. 사기, 위조, 배신 — 지능을 써서 남을 속인 자들의 지옥이야."
    },

    # ══════════════════════════════════════════
    # 4부: 지옥 최하층 (8~9단계)
    # ══════════════════════════════════════════

    # ── 지옥 최하층 (Part 1/2) ──
    {
        "title": "사기꾼의 열 구덩이 — 8단계 지옥의 잔혹함",
        "chapter": "Inferno Lower",
        "chapter_title": "지옥 최하층",
        "part": 1, "total_parts": 2,
        "spark": "몸이 정수리부터 갈라지고, 한 바퀴 돌면 상처가 아물고, 다시 갈라지고 — 영원히.",
        "dialogue": [
            {"speaker": "cosmii", "text": "8단계 지옥은 구덩이가 열 개야. 사기꾼, 위조범, 연금술사, 성직매매자, 인신매매범... 지능을 이용해서 남을 속인 모든 자들이 여기 모여 있어.", "highlight": "열 개의 구덩이"},
            {"speaker": "cosmii", "text": "여기서 가장 충격적인 장면을 알려줄게. 분열을 조장한 자들의 구덩이야. 악마가 칼로 망자의 정수리부터 아래까지 쭉 갈라. 몸이 둘로 갈라지는 거야. 창자가 매달리고, 내장이 드러나고...", "highlight": "분열자의 형벌"},
            {"speaker": "cosmii", "text": "단테의 묘사가 소름끼쳐. 「나는 터부터 방귀 끼는 곳까지 찢어진 어떤 자를 보았는데, 두 다리 사이에 창자가 매달려 있고, 내장이 드러났으며, 먹은 것을 똥으로 만드는 축 처진 주머니도 나타났다.」 잔인하지만 엄청나게 생생해.", "highlight": "단테의 생생한 묘사"},
            {"speaker": "cosmii", "text": "가장 끔찍한 건 — 한 바퀴 돌아오는 동안 상처가 아물어. 그러면 또 갈라져. 이걸 영원히 반복하는 거야. 끝나지 않는 고통.", "highlight": "끝나지 않는 반복"},
            {"speaker": "cosmii", "text": "근데 이렇게 갈라지고 있는 사람이 누군지 아나? 무함마드야. 이슬람교의 창시자. 그리고 4대 칼리프 알리도 여기 있어. 단테의 시각에서는 — 기독교 세계를 분열시킨 장본인이니까.", "highlight": "무함마드"},
            {"speaker": "cosmii", "text": "성직매매 구덩이에는 교황이 또 나와. 6단계에서도 교황이 있었는데 여기도! 거꾸로 처박혀서 불에 타고 있어. 단테가 당시 사회의 부패를 얼마나 미워했는지 느껴지지?", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "8단계 지옥의 '분열자 구덩이'에서 형벌이 특히 잔혹한 이유는?",
                "options": ["한 번만 당하고 끝나서", "몸이 갈라졌다가 아물었다가를 영원히 반복해서", "불에 타서", "물에 빠져서"],
                "correct_index": 1,
                "explanation": "상처가 아물어야 또 갈라질 수 있으니까, 고통이 영원히 반복돼. 끝나지 않는 고통이야말로 단테가 그린 지옥의 본질이야."
            },
            {
                "question": "단테가 무함마드를 '분열자의 지옥'에 넣은 이유는?",
                "options": ["이슬람이 나빠서", "단테의 시각에서 기독교 세계를 분열시킨 장본인이라고 봤기 때문에", "역사적 사실이어서", "이유 없이"],
                "correct_index": 1,
                "explanation": "단테의 중세 기독교 시각에서 이슬람의 등장은 기독교 세계의 분열이었어. 객관적 사실이 아니라 당시의 세계관을 반영한 거야."
            }
        ],
        "cliffhanger": "8단계도 무시무시하지만, 9단계는 차원이 달라. 지옥의 가장 밑바닥에는 누가 있을까?"
    },

    # ── 지옥 최하층 (Part 2/2) ──
    {
        "title": "루시퍼의 세 얼굴 — 지옥의 가장 밑바닥",
        "chapter": "Inferno Lower",
        "chapter_title": "지옥 최하층",
        "part": 2, "total_parts": 2,
        "spark": "지옥 9단계를 지키는 것은 그리스 괴물이 아니라 — 루시퍼 그 자신이다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "드디어 마지막, 9단계 지옥이야. 지금까지는 그리스 로마 신화의 괴물들이 수문장이었잖아? 여기는 달라. 특별한 존재가 지키고 있어 — 루시퍼. 타락한 천사, 악마의 왕이야.", "highlight": "루시퍼"},
            {"speaker": "cosmii", "text": "루시퍼가 어떻게 생겼냐면 — 얼굴이 세 개야. 각각 다른 색이야. 신의 삼위일체(성부·성자·성령)의 뒤틀린 반영이야. 신이 세 위격으로 사랑을 나타내듯, 루시퍼는 세 얼굴로 배신을 상징하는 거야.", "highlight": "세 얼굴"},
            {"speaker": "cosmii", "text": "9단계의 죄목은 — 배신이야. 자기와 가까웠던 사람, 자기를 믿어준 사람을 배신한 자들이 오는 지옥이야. 단테에게 가장 무거운 죄는 폭력도 살인도 아닌 '배신'인 거야.", "highlight": "배신자의 지옥"},
            {"speaker": "cosmii", "text": "루시퍼의 세 입에서 각각 한 명씩 물어뜯기고 있어. 오른쪽 입에는 브루투스 — 시저를 암살한 자. 왼쪽 입에는 카시우스 — 브루투스와 공모한 자. 그리고 가운데 입에는...", "highlight": None},
            {"speaker": "cosmii", "text": "유다. 예수를 배신한 유다가 가운데에서 물어뜯기고 있어. 배신의 대명사. 시저를 배신한 브루투스와 카시우스, 예수를 배신한 유다 — 자기를 가장 사랑해준 사람을 배신한 자들이 지옥의 최하층에 있는 거야.", "highlight": "유다, 브루투스, 카시우스"},
            {"speaker": "cosmii", "text": "이 시점에서 단테는 완전히 지쳐 있어. '제발 여기서 꺼내 주세요' 하는 상태야. 그런데 베르길리우스가 루시퍼의 거대한 다리를 타고 올라가기 시작해. 지구의 핵을 뚫고 반대편으로 나가는 거야!", "highlight": "탈출의 시작"}
        ],
        "quizzes": [
            {
                "question": "단테가 '배신'을 지옥의 가장 밑바닥에 놓은 이유는?",
                "options": ["배신이 가장 흔해서", "자기를 믿어준 사람에 대한 배신이 인간이 저지를 수 있는 가장 무거운 죄라고 봤기 때문에", "성경에 그렇게 나와서", "특별한 이유 없이"],
                "correct_index": 1,
                "explanation": "단테에게 가장 무거운 죄는 폭력이나 살인이 아니라 '신뢰의 배신'이야. 가까운 사람, 믿어준 사람을 배신하는 것이 인간성을 가장 크게 파괴하는 행위라고 본 거야."
            },
            {
                "question": "루시퍼의 세 얼굴이 상징하는 것은?",
                "options": ["과거, 현재, 미래", "삼위일체의 뒤틀린 반영 — 배신의 상징", "세 가지 원소", "세 종류의 지옥"],
                "correct_index": 1,
                "explanation": "신의 삼위일체가 사랑을 상징하듯, 루시퍼의 세 얼굴은 그것의 정반대인 배신을 상징해. 사랑의 뒤틀린 거울인 거야."
            }
        ],
        "cliffhanger": "루시퍼의 다리를 타고 지구를 뚫고 나온 단테. 그곳에서 처음으로 보는 것은 — 별이야."
    },

    # ══════════════════════════════════════════
    # 5부: 연옥
    # ══════════════════════════════════════════

    # ── 연옥 (Part 1/2) ──
    {
        "title": "드디어 별이 보이다 — 지옥을 빠져나온 단테",
        "chapter": "Purgatorio",
        "chapter_title": "연옥",
        "part": 1, "total_parts": 2,
        "spark": "지옥 입구에서 '희망을 버려라'고 했는데 — 지옥을 빠져나오니 별이 보인다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "루시퍼의 다리를 타고, 지구의 핵을 뚫고 올라와서... 드디어 지표로 나왔어! 그리고 단테가 처음으로 본 것 — 바람이 있고, 물이 있고, 별이 있었다.", "highlight": "별이 보이다"},
            {"speaker": "cosmii", "text": "여기서 소름 돋는 대비가 나와. 지옥 입구에서 뭐라고 했어? '모든 희망을 버려라.' 희망이 없는 곳이 지옥이었잖아. 그런데 지옥을 빠져나오니 — 별이 보여. 별은 뭘 상징할까? 희망이야, 꿈이야, 미래야.", "highlight": "희망의 귀환"},
            {"speaker": "cosmii", "text": "여기가 연옥이야. 연옥은 어떤 곳이냐면 — 지옥에 떨어지지는 않았지만, 천국에 갈 만큼 선행을 하지 못한 사람들이 있는 곳이야. 지옥처럼 영원한 고통은 아니야. 죄를 씻으면 천국에 갈 수 있어.", "highlight": "연옥이란"},
            {"speaker": "cosmii", "text": "연옥은 바다 위에 솟은 거대한 산이야. 7개의 단이 있는데, 각 단계에서 하나씩 죄를 씻어. 7대 죄악 — 교만, 질투, 분노, 나태, 탐욕, 폭식, 색욕. 산 정상까지 올라가면서 하나씩 벗어나는 거야.", "highlight": "7대 죄악의 산"},
            {"speaker": "cosmii", "text": "지옥과 결정적으로 다른 점 — 여기는 '끝'이 있어! 지옥은 영원한 고통이지만, 연옥은 씻어내면 끝나. 그리고 패스트트랙도 있어 — 살아있는 가족들이 기도를 해주면 더 빨리 올라갈 수 있대!", "highlight": "끝이 있는 고통"},
            {"speaker": "cosmii", "text": "이게 신곡의 아름다운 메시지야. 지옥 = 희망 없음, 연옥 = 희망 있음, 천국 = 희망의 완성. 인생에서도 마찬가지잖아. 지옥 같은 순간도 '끝이 있다'고 믿으면 버틸 수 있어.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "지옥과 연옥의 가장 결정적인 차이는?",
                "options": ["고통의 강도", "지옥은 영원하지만 연옥은 죄를 씻으면 끝난다는 점", "위치의 차이", "인원수의 차이"],
                "correct_index": 1,
                "explanation": "지옥의 고통은 영원하지만, 연옥의 고통에는 '끝'이 있어. 죄를 씻어내면 천국으로 올라갈 수 있다는 희망이 있는 곳이야."
            },
            {
                "question": "지옥 탈출 후 단테가 처음 본 '별'이 상징하는 것은?",
                "options": ["밤이 되었다는 뜻", "희망, 꿈, 미래", "방향을 잃었다는 뜻", "신의 분노"],
                "correct_index": 1,
                "explanation": "지옥은 '희망을 버린 곳'이었어. 거기서 빠져나와 별을 본다는 건 다시 희망을 되찾았다는 의미야. 어둠을 통과해야 빛을 볼 수 있다는 거지."
            }
        ],
        "cliffhanger": "연옥의 산 정상에서 베르길리우스가 갑자기 이별을 고해. '난 여기까지야.'"
    },

    # ── 연옥 (Part 2/2) ──
    {
        "title": "스승의 이별 — 베르길리우스가 떠나다",
        "chapter": "Purgatorio",
        "chapter_title": "연옥",
        "part": 2, "total_parts": 2,
        "spark": "지옥부터 함께한 스승이 '난 여기까지야'라고 말하고 사라진다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "베르길리우스의 손을 잡고 연옥의 산을 계속 올라가. 그런데 산 정상 가까이에서 — 베르길리우스가 멈춰. '난 여기까지야. 다른 안내자가 올 거야.'", "highlight": "난 여기까지야"},
            {"speaker": "cosmii", "text": "왜 베르길리우스가 더 갈 수 없을까? 기억나지? 베르길리우스는 림보 출신이야. 기독교 이전에 살았던 사람이라 천국에 갈 수 없어. 이성과 지혜만으로는 갈 수 있는 한계가 있다는 거야.", "highlight": "이성의 한계"},
            {"speaker": "cosmii", "text": "'스승님, 어디 가세요? 어디 가세요?' 단테가 매달리는데 — 베르길리우스가 사라져. 지옥의 공포 속에서도 함께했던 스승이 떠나는 순간이야. 이 장면 진짜 마음 아파.", "highlight": None},
            {"speaker": "cosmii", "text": "그런데 갑자기 하늘에서 천사들이 내려와! 빛나는 옥좌를 만들어. 그리고 신성한 빛에 둘러싸인 한 여인이 앉아. 완전히 다른 차원의 존재가 나타난 거야.", "highlight": "빛나는 존재"},
            {"speaker": "cosmii", "text": "이 여인이 누군지 맞춰봐. 구원자? 천사? 아니야 — 베아트리체야. 단테가 평생 사랑한 여인! 실제로 단테는 9살 때 베아트리체를 처음 보고 평생 사랑했어. 그런데 그녀는 25세에 일찍 세상을 떠났지.", "highlight": "베아트리체"},
            {"speaker": "cosmii", "text": "이제 단테의 천국 안내자는 베르길리우스(이성)가 아니라 베아트리체(사랑)야. 이성만으로는 갈 수 없는 곳, 사랑만이 인도할 수 있는 곳이 천국이라는 거야. 이게 신곡의 가장 아름다운 메시지 중 하나야.", "highlight": "이성 → 사랑"}
        ],
        "quizzes": [
            {
                "question": "베르길리우스가 천국까지 갈 수 없는 근본적 이유는?",
                "options": ["체력이 부족해서", "이성과 지혜만으로는 천국(사랑의 영역)에 도달할 수 없기 때문에", "단테와 싸워서", "시간이 없어서"],
                "correct_index": 1,
                "explanation": "베르길리우스는 '이성과 지혜'의 상징이야. 이성만으로는 도달할 수 있는 한계가 있고, 천국은 사랑의 영역이라 '사랑의 상징'인 베아트리체가 인도해야 하는 거야."
            },
            {
                "question": "천국의 안내자가 베아트리체인 것이 의미하는 바는?",
                "options": ["여성이 더 뛰어나서", "궁극적 구원은 이성이 아니라 사랑을 통해 이루어진다는 뜻", "베아트리체가 길을 잘 알아서", "특별한 의미 없음"],
                "correct_index": 1,
                "explanation": "지옥과 연옥은 이성(베르길리우스)으로 통과할 수 있지만, 천국은 사랑(베아트리체)만이 인도할 수 있어. 궁극적 구원의 힘은 사랑이라는 게 신곡의 핵심이야."
            }
        ],
        "cliffhanger": "베아트리체의 손을 잡고 천국으로 올라가는 단테. 거기서 보는 것은 — 끝없는 별빛이야."
    },

    # ══════════════════════════════════════════
    # 6부: 천국
    # ══════════════════════════════════════════

    # ── 천국 (Part 1/2) ──
    {
        "title": "무수한 별빛 속으로 — 천국의 비전",
        "chapter": "Paradiso",
        "chapter_title": "천국",
        "part": 1, "total_parts": 2,
        "spark": "지옥은 '희망을 버려라'였다면 — 천국은 무수한 별빛, 끝없는 희망이다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "드디어 천국이야! 베아트리체의 손을 잡고 올라가는 순간 — 모든 것이 빛이야. 무수한 별, 빛나는 별채, 끝없는 광채. 지옥의 어둠과 완전히 반대야.", "highlight": "무수한 별빛"},
            {"speaker": "cosmii", "text": "여기서 신곡의 구조가 완벽하게 대비돼. 지옥 입구 — '모든 희망을 버려라.' 지옥 탈출 — 별이 보인다. 천국 — 무수히 빛나는 별. 어둠 → 한 줄기 빛 → 무한한 빛. 이 여정이 바로 인간의 구원이야.", "highlight": "어둠에서 빛으로"},
            {"speaker": "cosmii", "text": "천국도 9단계로 나뉘어. 각 단계마다 점점 더 밝아져. 그런데 지옥처럼 고통이 있는 게 아니라, 올라갈수록 기쁨과 빛이 커지는 거야. 너무 밝아서 오히려 정신이 혼미해질 정도야.", "highlight": "9단계 천국"},
            {"speaker": "cosmii", "text": "재미있는 건 — 지옥에서는 사람들이 구체적인 형벌을 받고 있었잖아. 천국에서는 사람들이 점점 빛 자체가 돼. 개인의 형체가 사라지고 순수한 빛으로 변해가는 거야. 자아가 사라지고 더 큰 것과 하나가 되는 경험.", "highlight": "빛이 되는 사람들"},
            {"speaker": "cosmii", "text": "그리고 베아트리체가 점점 더 아름다워져. 올라갈수록 더 밝게 빛나. 단테가 '너무 아름다워서 눈을 뜰 수가 없다'고 표현해. 사랑이 천국에서 더 완전해지는 거야.", "highlight": None},
            {"speaker": "cosmii", "text": "여기서 느끼는 건 이거야 — 지옥에서는 개인의 '죄'가 구체적이었잖아. 천국에서는 개인이 '빛' 속에 녹아들어. 지옥은 자기중심적인 곳이고, 천국은 자기를 넘어서는 곳이야.", "highlight": "자기를 넘어서기"}
        ],
        "quizzes": [
            {
                "question": "신곡에서 '지옥→연옥→천국'의 빛의 변화를 올바르게 설명한 것은?",
                "options": ["어둠 → 어둠 → 어둠", "빛 → 어둠 → 빛", "완전한 어둠 → 별빛(희망) → 무한한 빛", "빛 → 빛 → 더 큰 빛"],
                "correct_index": 2,
                "explanation": "지옥은 완전한 어둠(희망 없음), 지옥 탈출 후 별이 보이고(희망의 시작), 천국은 무한한 빛(희망의 완성)이야. 어둠에서 빛으로의 여정이 신곡의 구조야."
            },
            {
                "question": "천국에서 사람들이 '빛 자체가 되어간다'는 것의 의미는?",
                "options": ["물리적으로 빛나는 것", "자아를 넘어서 더 큰 존재와 하나가 되는 경험", "눈이 부셔서", "죽었기 때문에"],
                "correct_index": 1,
                "explanation": "지옥은 자기중심적 고통의 장소이고, 천국은 자기를 넘어서는 곳이야. 개인이 빛 속에 녹아든다는 건 사랑과 신성 안에서 자아가 확장되는 경험이야."
            }
        ],
        "cliffhanger": "천국의 가장 높은 곳에서 베아트리체가 단테에게 마지막으로 남기는 말이 있어."
    },

    # ── 천국 (Part 2/2) ──
    {
        "title": "이것을 꼭 기억해서 전해줘 — 신곡의 마지막 노래",
        "chapter": "Paradiso",
        "chapter_title": "천국",
        "part": 2, "total_parts": 2,
        "spark": "베아트리체의 마지막 말 — '이것을 기억해서 사람들에게 꼭 전해줘.'",
        "dialogue": [
            {"speaker": "cosmii", "text": "천국의 가장 높은 곳에서, 빛이 너무 강렬해서 단테의 정신이 흐려져 가. 그리고 그 빛의 중심에서 — 단테는 신을 본다. 무한한 빛의 한 점. 더 이상 개별적인 모습은 안 보이고, 모든 것이 하나의 거대한 빛 속에 녹아들어.", "highlight": "무한한 빛의 한 점"},
            {"speaker": "cosmii", "text": "그때 베아트리체가 단테의 손을 잡고 말해. '단테, 이것을 꼭 기억해서, 뒤의 사람들에게 꼭 이야기를 남겨줘야 해.' 이게 신곡 전체의 존재 이유야. 단테가 이 여행을 한 건 — 기록해서 전하기 위해서.", "highlight": "기억해서 전해줘"},
            {"speaker": "cosmii", "text": "자, 신곡 전체를 돌아보자. 인생의 한가운데에서 길을 잃은 단테 — 어두운 숲, 세 마리 짐승, 베르길리우스의 손. 지옥의 9단계를 하나하나 내려가면서 인간의 죄를 직시하고.", "highlight": None},
            {"speaker": "cosmii", "text": "지옥을 빠져나와 별을 보고, 연옥에서 죄를 씻고, 스승과 이별하고. 베아트리체를 만나 사랑의 인도로 천국에 올라. 그리고 마침내 — 모든 것이 빛이 되는 곳에 도달해.", "highlight": "전체 여정 정리"},
            {"speaker": "cosmii", "text": "그리고 신곡의 마지막 한 줄. 이탈리아 문학 역사상 가장 유명한 문장이야. 「태양과 별들을 움직이는 사랑」 — 이 거대한 우주를 움직이는 힘이 뭐냐면, 사랑이라는 거야. 어둠을 통과하면 빛이 있고, 그 빛의 정체는 결국 사랑이야. 이것이 신곡의 핵심이야.", "highlight": "태양과 별들을 움직이는 사랑"},
            {"speaker": "cosmii", "text": "700년 전에 쓰인 이 작품이 아직도 읽히는 이유가 바로 이거야. 우리 모두 인생의 어두운 숲에서 길을 잃을 때가 있잖아. 그때 단테가 말해주는 거야 — 어둠을 피하지 마, 통과해. 그러면 별이 보일 거야. 같이 읽느라 정말 수고했어!", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "베아트리체가 '이것을 기억해서 전해줘'라고 한 것의 의미는?",
                "options": ["비밀을 지키라는 뜻", "단테의 여행은 기록하여 후세에 전하기 위한 것이었다는 뜻", "베아트리체를 잊지 말라는 뜻", "다시 오라는 뜻"],
                "correct_index": 1,
                "explanation": "신곡 전체가 존재하는 이유야. 단테가 지옥·연옥·천국을 여행한 건, 그 경험을 기록해서 세상 사람들에게 전하기 위해서였어."
            },
            {
                "question": "신곡 전체를 관통하는 핵심 메시지를 한 줄로 요약하면?",
                "options": ["지옥이 무서우니 착하게 살아라", "어둠을 피하지 않고 통과하면, 반드시 빛(희망)에 도달한다", "사랑은 영원하다", "종교를 믿어야 한다"],
                "correct_index": 1,
                "explanation": "인생의 어둠(지옥)을 피하지 않고 직면하고 통과하면, 희망(연옥)을 거쳐 빛(천국)에 도달한다는 거야. 이것이 700년간 사랑받은 신곡의 핵심이야."
            }
        ],
        "cliffhanger": ""
    },
]


# ═══════════════════════════════════════════════════════════════════
# English translations — natural, casual Cosmii tone
# ═══════════════════════════════════════════════════════════════════

TRANSLATIONS_EN = {
    # ── Lesson 0: Lost in the Dark Wood ──
    0: {
        "title": "Lost in the Dark Wood — At the Midpoint of Life",
        "chapter_title": "Prologue",
        "spark": "Right at the halfway point of his life, Dante suddenly wakes up — smack in the middle of a dark forest.",
        "cliffhanger": "Who's the shadow that appeared from the darkness? A legendary figure who lived 1,200 years before Dante.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Hey there! Starting today, we're diving into Dante's 'Divine Comedy' together. This thing was written 700 years ago, but honestly? It'll give you chills — because it feels like it's about us.", "highlight": None},
            {"speaker": "cosmii", "text": "Here's the very first line: 'Midway upon the journey of our life, I found myself within a forest dark, for the straightforward path had been lost.' Dante was 35 when this kicks off. Why 35? Because the Bible says a human life is 70 years — so 35 is the exact halfway point.", "highlight": "midway upon the journey"},
            {"speaker": "cosmii", "text": "Think about it. You've been charging forward your whole life, and then one day — BAM — you snap out of it and realize you're lost in a dark forest. Who am I? Where even is this? We've all had that moment, right? You've been hustling hard, and suddenly you're like... 'Wait, is this even the right path?'", "highlight": "who am I, where is this"},
            {"speaker": "cosmii", "text": "So Dante tries to find his way out, but three beasts block his path. First — a leopard, symbolizing greed. Second — a lion, representing the hunger for power. Third — a she-wolf, standing for lust. These are the three things that knock us off the right path in life.", "highlight": "three beasts"},
            {"speaker": "cosmii", "text": "And this wasn't just fiction for Dante — it was personal. In real life, he was a politician in Florence who got caught up in a brutal political war and was exiled from his own city. The woman he loved died young. He was literally surrounded by power, greed, and desire — trapped in his own dark wood.", "highlight": "Dante's real life"},
            {"speaker": "cosmii", "text": "Then — out of nowhere — a shadow appears in the darkness. Dante cries out: 'Are you a person? Please, help me!' And the shadow replies: 'Once I was a man. Now I am not.' In Italy, this line is as iconic as 'To be or not to be' is in English.", "highlight": "once I was a man"},
        ],
        "quizzes": [
            {
                "question": "At what age does Dante find himself lost in the 'dark wood'?",
                "options": ["20 — the restlessness of youth", "35 — the exact midpoint of life", "50 — the onset of old age", "70 — the end of life"],
                "correct_index": 1,
                "explanation": "The Bible says a human life is 70 years, so the midpoint is 35. That's when Dante takes a hard look at his life. Lost right at the halfway mark."
            },
            {
                "question": "What do the three beasts blocking Dante's path symbolize?",
                "options": ["Courage, wisdom, and love", "Greed, hunger for power, and lust", "Past, present, and future", "Hell, Purgatory, and Paradise"],
                "correct_index": 1,
                "explanation": "The leopard is greed, the lion is the thirst for power, and the she-wolf is lust. These are the three temptations that lead us off the right path."
            },
        ],
    },

    # ── Lesson 1: Taking Virgil's Hand ──
    1: {
        "title": "Taking Virgil's Hand — An Invitation to Hell",
        "chapter_title": "Prologue",
        "spark": "A great poet from 1,200 years ago takes Dante by the hand and says — 'Follow me.'",
        "cliffhanger": "They've arrived at the gates of Hell. The inscription on those gates — one of the most famous warnings in all of history.",
        "dialogue": [
            {"speaker": "cosmii", "text": "The mysterious shadow reveals himself — it's Virgil! The greatest poet of ancient Rome, who lived about 1,200 years before Dante. He was Dante's lifelong literary hero.", "highlight": "Virgil"},
            {"speaker": "cosmii", "text": "Let me put it this way — imagine you're at rock bottom, totally lost in life, and suddenly the ghost of Shakespeare or Leonardo da Vinci appears and takes your hand. Can you picture it? That's what Virgil meant to Dante.", "highlight": None},
            {"speaker": "cosmii", "text": "Virgil says: 'Follow me. There's a way out of here.' But here's the twist — his plan is to show Dante Hell itself! To escape the dark wood, you have to go through an even deeper darkness. Mind-blowing, right?", "highlight": "through deeper darkness"},
            {"speaker": "cosmii", "text": "And this is the core structure of the Divine Comedy: Hell → Purgatory → Paradise — a journey through all three realms. Hell is a funnel-shaped pit deep inside the earth, Purgatory is a mountain rising from the sea, and Paradise is up among the stars.", "highlight": "Hell → Purgatory → Paradise"},
            {"speaker": "cosmii", "text": "Why start with Hell? It actually makes perfect sense. First you see what humans are doing wrong (Hell), then how to fix it (Purgatory), and finally where you can end up (Paradise). It's basically a GPS for the soul.", "highlight": None},
            {"speaker": "cosmii", "text": "And here's a key detail: Virgil — symbolizing reason and wisdom — guides Dante through Hell and Purgatory, but someone else takes over for Paradise. Who? That'll be revealed later — the most special person in Dante's entire life. Alright, let's head down into Hell!", "highlight": "two guides"},
        ],
        "quizzes": [
            {
                "question": "What was Virgil's plan to get Dante out of the dark wood?",
                "options": ["Flee the forest", "Walk straight through Hell and face the truth", "Pray really hard", "Fight the three beasts"],
                "correct_index": 1,
                "explanation": "To reach the light (Paradise), you have to pass through the deepest darkness (Hell). The Divine Comedy's core message: don't avoid your problems — face them head-on."
            },
            {
                "question": "What is the correct order of the three realms in the Divine Comedy?",
                "options": ["Paradise → Purgatory → Hell", "Purgatory → Hell → Paradise", "Hell → Purgatory → Paradise", "Hell → Paradise → Purgatory"],
                "correct_index": 2,
                "explanation": "Hell (human sin) → Purgatory (cleansing sin) → Paradise (salvation). The journey moves from darkness to light."
            },
        ],
    },

    # ── Lesson 2: Abandon All Hope, Limbo ──
    2: {
        "title": "'Abandon All Hope' — The Gates of Hell and Limbo",
        "chapter_title": "Upper Hell",
        "spark": "The sign at Hell's entrance — 'Abandon all hope, ye who enter here.'",
        "cliffhanger": "Past Limbo and further down, the wind-swept second circle appears. This is where Dante bursts into tears.",
        "dialogue": [
            {"speaker": "cosmii", "text": "We've finally made it to Hell's entrance. What's written on the gate? 'Abandon all hope, ye who enter here.' Let that sink in — a place with no hope, no dreams, no future. THAT is what Hell is.", "highlight": "abandon all hope"},
            {"speaker": "cosmii", "text": "Remember that line — it's going to hit completely different when we contrast it with Paradise later. So here's the layout: Hell has 9 circles total, shaped like a funnel going deeper and deeper underground. The further down you go, the heavier the sins.", "highlight": "9 circles of Hell"},
            {"speaker": "cosmii", "text": "Circle 1 is called 'Limbo.' It means 'the edge' — and the people here committed the lightest offenses. There's no screaming. Instead, there's an endless chorus of sighs.", "highlight": "Limbo"},
            {"speaker": "cosmii", "text": "But then you look around and — wait, WHAT?! Socrates is here. Plato is here. Aristotle is here! The greatest philosophers in human history, all gathered together, having conversations behind the walls of a noble castle.", "highlight": "Socrates, Plato"},
            {"speaker": "cosmii", "text": "Why are these incredible people in Hell? Here's the thing — they lived before Jesus, or they followed a different faith. They were incredibly virtuous, but they lacked the 'right faith,' so they couldn't enter Paradise. No pain, but no sight of God either.", "highlight": "virtuous but without faith"},
            {"speaker": "cosmii", "text": "That's the medieval Christian worldview for you. No matter how great you were, no baptism meant no Paradise. From a modern perspective it seems pretty unfair, but back then it was just... accepted reality. And here's the kicker — Virgil himself is FROM Limbo! It's literally his home.", "highlight": "Virgil's home"},
        ],
        "quizzes": [
            {
                "question": "Why are figures like Socrates and Plato in Circle 1 (Limbo)?",
                "options": ["They committed terrible sins", "They lived before Christianity or followed a different faith", "They pursued knowledge too greedily", "They lacked humility"],
                "correct_index": 1,
                "explanation": "Limbo's residents were highly virtuous but lacked Christian faith. In the medieval worldview, without baptism you couldn't enter Paradise, so they remain here."
            },
            {
                "question": "What does 'Abandon all hope, ye who enter here' at Hell's gate really mean?",
                "options": ["Save your energy", "A place without hope, dreams, or future IS Hell", "Be humble", "Keep quiet"],
                "correct_index": 1,
                "explanation": "Hell is the absence of hope. This inscription later contrasts powerfully with Paradise (infinite hope and light), revealing the entire architecture of the Divine Comedy."
            },
        ],
    },

    # ── Lesson 3: Paolo and Francesca ──
    3: {
        "title": "Paolo and Francesca — When Love Lands You in Hell",
        "chapter_title": "Upper Hell",
        "spark": "'There is no greater sorrow than to recall happy times when you're in misery.' — It hits different when you've lived it, right?",
        "cliffhanger": "Dante wakes from his faint and keeps descending. From Circle 3 to Circle 7, every shade of human desire awaits.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Down in Circle 2, there's a gatekeeper waiting — Minos, a monstrous judge. In Greek mythology he was the legendary king of Crete, but here he uses his tail to weigh sins. Two tail-wraps means Circle 2, three means Circle 3... that's how he sorts the damned.", "highlight": "Minos"},
            {"speaker": "cosmii", "text": "Here's what's fascinating — the Divine Comedy's Hell is Christian, but ALL the gatekeepers are monsters from Greek and Roman mythology. This is basically the birth of the Renaissance right here. Dante took ancient Greco-Roman culture and fused it with medieval Christianity.", "highlight": "Christianity + Greek myth"},
            {"speaker": "cosmii", "text": "Circle 2 is the circle of lust. Fierce winds rage here, sweeping the dead souls around endlessly. Cleopatra's here too — because she used her beauty for illicit affairs.", "highlight": "the winds of lust"},
            {"speaker": "cosmii", "text": "Two souls come drifting toward Dante on the wind — a man and a woman. 'I am Paolo. I am Francesca.' Dante is stunned — they were the real-life protagonists of one of Italy's most famous scandals!", "highlight": "Paolo and Francesca"},
            {"speaker": "cosmii", "text": "Here's the story: Francesca was married off to a nobleman, but she fell in love with his brother, Paolo. When the husband found out, he killed them both. Now they're swept by the winds together for all eternity.", "highlight": None},
            {"speaker": "cosmii", "text": "Francesca tells Dante: 'There is no greater sorrow than to recall happy times when in misery.' Real talk — we've all felt that, haven't we? When you've fallen from a high point and you can't stop remembering the good days? That pain. Dante is so moved he starts crying, and he cries so hard he actually passes out.", "highlight": "the cruelest memory"},
        ],
        "quizzes": [
            {
                "question": "What does Francesca's famous line — 'There is no greater sorrow than to recall happy times when in misery' — mean?",
                "options": ["You should forget the past", "Happy memories make present suffering even more unbearable", "The past doesn't matter", "Only think about the future"],
                "correct_index": 1,
                "explanation": "When you're suffering, memories of past happiness actually amplify the pain. For souls condemned to eternal torment, the memory of once having been in love becomes their cruelest torture."
            },
            {
                "question": "Why are Hell's gatekeepers characters from Greek and Roman mythology?",
                "options": ["Dante disliked Greco-Roman culture", "It was a Renaissance move — blending ancient culture with medieval Christianity", "It's historically accurate", "Just to entertain readers"],
                "correct_index": 1,
                "explanation": "Dante fused Christian theology with Greco-Roman mythology, reflecting the transitional spirit from the Middle Ages into the Renaissance."
            },
        ],
    },

    # ── Lesson 4: Gluttony to Wrath, Circles 3–5 ──
    4: {
        "title": "From Gluttony to Wrath — Circles 3 Through 5",
        "chapter_title": "Middle Hell",
        "spark": "Three-headed Cerberus guards Circle 3, stone-pushers clash in Circle 4, and rage boils over in Circle 5.",
        "cliffhanger": "From Circle 6 onward, the mood shifts entirely. Popes and cardinals in Hell — Dante had guts, no question.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Dante comes to in Circle 3 — the circle of gluttony. This is where the people who consumed, consumed, consumed end up. And the gatekeeper? Absolutely terrifying — it's Cerberus, the three-headed dog!", "highlight": "Cerberus"},
            {"speaker": "cosmii", "text": "Cerberus is snarling with all three heads, ripping souls apart as they come in. Virgil grabs a fistful of mud and chucks it straight into Cerberus's mouths. While the beast is busy chewing mud, they slip right past. Pretty clever, honestly.", "highlight": None},
            {"speaker": "cosmii", "text": "Now, 'gluttony' here isn't just about overeating. In medieval times, when kings and nobles feasted lavishly, it meant they were exploiting the common people to fund those banquets. Think of this circle as punishment for greedy exploitation, not just big appetites.", "highlight": "gluttony = exploitation"},
            {"speaker": "cosmii", "text": "Circle 4 — hoarders versus spenders. People on both sides are pushing enormous boulders at each other. On one side: the misers who hoarded every penny in life. On the other: the reckless spenders who blew through everything. They crash, fight, push again... forever.", "highlight": "hoarders vs. spenders"},
            {"speaker": "cosmii", "text": "You can hear them screaming at each other: 'Why do you hoard?!' 'Why do you waste?!' Yelling the exact opposite things while colliding for eternity. Whether you cling to money or throw it away — same Hell. That's Dante's point.", "highlight": None},
            {"speaker": "cosmii", "text": "Circle 5 is the circle of wrath. People who lived consumed by rage are locked in a muddy swamp, tearing at each other. This wraps up the 'sins of incontinence' — the failure of self-control. From Circle 6 on, it's a whole different ballgame: sins committed with deliberate intent.", "highlight": "the swamp of wrath"},
        ],
        "quizzes": [
            {
                "question": "Why are the hoarders and the spenders punished in the SAME circle?",
                "options": ["Both involve money", "Whether you hoard or waste, you're equally enslaved by money", "Hell ran out of space", "Dante made a mistake"],
                "correct_index": 1,
                "explanation": "Hoarding obsessively or spending recklessly — either way, money controls your life. Dante's message: opposites that seem different can share the exact same fundamental flaw."
            },
            {
                "question": "Why does the 'circle of gluttony' represent more than just overeating?",
                "options": ["Food was scarce back then", "In medieval times, lavish feasting meant exploiting the common people", "Health concerns", "Religious fasting rules"],
                "correct_index": 1,
                "explanation": "For medieval kings and nobles, extravagant dining was only possible through the exploitation of their subjects. Dante wasn't criticizing big appetites — he was condemning greed and exploitation."
            },
        ],
    },

    # ── Lesson 5: Even Popes Go to Hell ──
    5: {
        "title": "Even Popes Go to Hell — Circles 6 & 7, Heresy and Violence",
        "chapter_title": "Middle Hell",
        "spark": "Popes, cardinals, bishops — all in Hell. Dante's exposé, 700 years ago.",
        "cliffhanger": "From Circle 8, it's no longer just brute force. Fraud, forgery, betrayal — the hell of those who used their intellect to deceive.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Circle 6 is the heretics' zone. Remember Limbo in Circle 1? Those were the virtuous non-believers. Here in Circle 6, it's the non-believers who WEREN'T virtuous — and they're suffering for it.", "highlight": None},
            {"speaker": "cosmii", "text": "But here's where Dante drops a bombshell. There's a POPE down here. Cardinals too! Bishops! Clergy — in Hell! 700 years ago, Dante literally wrote the sitting Pope into Hell. The sheer audacity? Absolutely legendary.", "highlight": "popes in Hell"},
            {"speaker": "cosmii", "text": "This is the Renaissance spirit Dante captured. He directly challenged medieval Church power and called out corruption head-on. Sound familiar? Kind of like calling out institutional corruption today, right?", "highlight": "speaking truth to power"},
            {"speaker": "cosmii", "text": "Circle 7 is the circle of violence, split into three zones. Zone one: those who were violent against others. They're submerged in a boiling river of blood. Stick your head up? Centaurs shoot you with arrows. Stay under? You're boiling alive. Head up — arrows. Head down — boiling. Forever.", "highlight": "the river of blood"},
            {"speaker": "cosmii", "text": "Zone two: those who were violent against themselves. They've been turned into trees. Virgil says, 'Break off a branch.' Dante snaps one — and it bleeds. Every single branch, every twig — is a person.", "highlight": "people turned to trees"},
            {"speaker": "cosmii", "text": "Zone three: those who were violent against God — the blasphemers. They lie on burning sand as fire rains from above. Imagine an eternal sauna you can never leave. That's Circle 7 — and believe it or not, there are even worse souls below.", "highlight": None},
        ],
        "quizzes": [
            {
                "question": "What's the significance of Dante putting popes and cardinals in Hell?",
                "options": ["He was rejecting Christianity", "He was directly criticizing corrupt religious authority", "He was recording historical facts", "It was just humor"],
                "correct_index": 1,
                "explanation": "Dante didn't reject Christianity — he called out corrupt clergy. Speaking truth to power in the Middle Ages is what makes the Divine Comedy so revolutionary."
            },
            {
                "question": "How is Circle 7 (violence) divided into three zones?",
                "options": ["By intensity of violence", "By target: against others, against oneself, against God", "Chronologically", "By type of weapon"],
                "correct_index": 1,
                "explanation": "Circle 7 is organized by the target of violence: others (river of blood), oneself (the forest of trees), God (rain of fire). Each zone has its own fitting punishment."
            },
        ],
    },

    # ── Lesson 6: The Ten Ditches of Fraud ──
    6: {
        "title": "The Ten Ditches of Fraud — Circle 8's Brutality",
        "chapter_title": "Lower Hell",
        "spark": "Split open from crown to groin, they walk one lap and heal, then get split open again — for all eternity.",
        "cliffhanger": "Circle 8 is nightmarish, but Circle 9 is on a completely different level. Who's waiting at the very bottom of Hell?",
        "dialogue": [
            {"speaker": "cosmii", "text": "Circle 8 has ten separate ditches. Fraudsters, forgers, alchemists, corrupt clergy selling sacred offices, human traffickers... everyone who used their brains to deceive others is gathered here.", "highlight": "ten ditches"},
            {"speaker": "cosmii", "text": "Let me tell you about the most shocking scene — the ditch for those who sowed division. A demon takes a sword and slices a soul from the top of their head all the way down. The body splits in two. Intestines dangling, organs exposed...", "highlight": "the schismatics' punishment"},
            {"speaker": "cosmii", "text": "Dante's description is absolutely visceral: 'I saw one ripped open from chin to where we fart — between his legs his guts spilled out, the vital organs visible, including the wretched sack that turns what we swallow into waste.' Brutal? Yes. But impossibly vivid.", "highlight": "Dante's vivid imagery"},
            {"speaker": "cosmii", "text": "The worst part? As they walk one full lap around the ditch, the wound heals completely. And then — they get split open again. Over and over. Forever. Pain that never, ever ends.", "highlight": "the endless cycle"},
            {"speaker": "cosmii", "text": "And who's being split apart? Muhammad — the founder of Islam. And Ali, the fourth Caliph, is here too. From Dante's medieval Christian perspective, they were the ones who divided the Christian world.", "highlight": "Muhammad"},
            {"speaker": "cosmii", "text": "Oh, and there's ANOTHER pope in the simony ditch — the one for clergy who sold spiritual privileges. Remember the pope back in Circle 6? Here's another one! Jammed in upside down, feet on fire. You can really feel how much Dante despised the corruption of his era.", "highlight": None},
        ],
        "quizzes": [
            {
                "question": "What makes the punishment in the 'schismatics' ditch' of Circle 8 especially horrifying?",
                "options": ["It only happens once", "The wound heals and then they're split open again — endlessly", "They're burned", "They're drowned"],
                "correct_index": 1,
                "explanation": "The wound has to heal so it can be inflicted again. Unending, cyclical agony — that's the true horror of Dante's Hell."
            },
            {
                "question": "Why did Dante place Muhammad in the 'schismatics' ditch'?",
                "options": ["Because Islam is bad", "From Dante's medieval Christian viewpoint, Islam divided the Christian world", "It's historically accurate", "No particular reason"],
                "correct_index": 1,
                "explanation": "From Dante's medieval perspective, the rise of Islam represented a schism in the Christian world. This isn't objective fact — it reflects the worldview of the era."
            },
        ],
    },

    # ── Lesson 7: Lucifer's Three Faces ──
    7: {
        "title": "Lucifer's Three Faces — The Very Bottom of Hell",
        "chapter_title": "Lower Hell",
        "spark": "Guarding the 9th circle isn't a Greek monster — it's Lucifer himself.",
        "cliffhanger": "Climbing down Lucifer's legs and tunneling through the earth, Dante emerges on the other side. The first thing he sees — stars.",
        "dialogue": [
            {"speaker": "cosmii", "text": "We've finally reached the very last level — Circle 9. Up until now, Greek and Roman mythological creatures guarded each circle, right? Not this one. Something special is here — Lucifer. The fallen angel. The king of all evil.", "highlight": "Lucifer"},
            {"speaker": "cosmii", "text": "What does Lucifer look like? He's got three faces, each a different color. They're a twisted mirror of the Holy Trinity (Father, Son, Holy Spirit). Where God's three persons represent love, Lucifer's three faces represent betrayal.", "highlight": "three faces"},
            {"speaker": "cosmii", "text": "The sin of Circle 9? Betrayal. This is where you end up if you betrayed someone close to you — someone who trusted you. For Dante, the heaviest sin isn't murder or violence. It's betrayal.", "highlight": "the traitors' Hell"},
            {"speaker": "cosmii", "text": "Each of Lucifer's three mouths is gnawing on someone. In the right mouth — Brutus, the man who assassinated Julius Caesar. In the left — Cassius, Brutus's co-conspirator. And in the center mouth...", "highlight": None},
            {"speaker": "cosmii", "text": "Judas. The man who betrayed Jesus, being chewed apart right in the center. Brutus and Cassius betrayed Caesar; Judas betrayed Christ. The common thread? They each betrayed the person who loved and trusted them most. That's why they're at the absolute bottom.", "highlight": "Judas, Brutus, Cassius"},
            {"speaker": "cosmii", "text": "At this point, Dante is completely spent. He's basically begging: 'Please, just get me out of here.' But then Virgil starts climbing down Lucifer's massive legs. They tunnel through the center of the earth and come out on the other side!", "highlight": "the escape begins"},
        ],
        "quizzes": [
            {
                "question": "Why did Dante place betrayal at the very bottom of Hell?",
                "options": ["Betrayal is the most common sin", "Betraying someone who trusted you is the gravest sin a person can commit", "The Bible says so", "No particular reason"],
                "correct_index": 1,
                "explanation": "For Dante, the heaviest sin isn't violence or murder — it's the betrayal of trust. Turning on someone who loved and believed in you is the ultimate destruction of what makes us human."
            },
            {
                "question": "What do Lucifer's three faces symbolize?",
                "options": ["Past, present, and future", "A twisted mirror of the Holy Trinity — symbolizing betrayal", "Three elements", "Three types of Hell"],
                "correct_index": 1,
                "explanation": "The Holy Trinity represents divine love; Lucifer's three faces are its dark inversion — the embodiment of betrayal. He's the anti-God, a mirror of love turned inside out."
            },
        ],
    },

    # ── Lesson 8: Stars at Last ──
    8: {
        "title": "Stars at Last — Escaping Hell",
        "chapter_title": "Purgatory",
        "spark": "At Hell's gate it said 'Abandon all hope' — but emerging from Hell, Dante sees the stars.",
        "cliffhanger": "At the summit of Purgatory's mountain, Virgil suddenly says farewell. 'This is as far as I can go.'",
        "dialogue": [
            {"speaker": "cosmii", "text": "Climbing down Lucifer's legs, tunneling through the center of the earth... they finally break through to the surface. And the first things Dante sees? Wind. Water. Stars.", "highlight": "stars at last"},
            {"speaker": "cosmii", "text": "Here's where you get absolute goosebumps from the contrast. What did it say at Hell's entrance? 'Abandon all hope.' Hell was the place where hope didn't exist. But now, climbing out of Hell — Dante sees stars. And what do stars represent? Hope. Dreams. The future.", "highlight": "hope returns"},
            {"speaker": "cosmii", "text": "Welcome to Purgatory. So what is it exactly? It's for people who weren't bad enough for Hell but weren't good enough for Paradise. Unlike Hell, the suffering here isn't eternal. Cleanse your sins, and you CAN make it to Paradise.", "highlight": "what is Purgatory"},
            {"speaker": "cosmii", "text": "Purgatory is a massive mountain rising from the sea. It has 7 terraces, and on each one you shed one of the Seven Deadly Sins — pride, envy, wrath, sloth, greed, gluttony, lust. You climb the mountain and leave each sin behind.", "highlight": "mountain of the Seven Deadly Sins"},
            {"speaker": "cosmii", "text": "The crucial difference from Hell? There's an END! Hell is eternal suffering, but Purgatory has a finish line. And there's even a fast track — if your living family members pray for you, you can ascend faster!", "highlight": "suffering with an end"},
            {"speaker": "cosmii", "text": "This is the beautiful message of the Divine Comedy. Hell = no hope. Purgatory = hope exists. Paradise = hope fulfilled. And honestly, isn't life the same way? Even the most hellish moments become bearable when you believe they'll eventually end.", "highlight": None},
        ],
        "quizzes": [
            {
                "question": "What is THE key difference between Hell and Purgatory?",
                "options": ["The intensity of pain", "Hell is eternal, but Purgatory ends once sins are cleansed", "Their location", "The number of souls"],
                "correct_index": 1,
                "explanation": "Hell's torment is forever, but Purgatory's suffering has an end. Once you've purged your sins, you ascend to Paradise. That's the hope that makes all the difference."
            },
            {
                "question": "What do the 'stars' Dante sees after escaping Hell symbolize?",
                "options": ["Nighttime has arrived", "Hope, dreams, the future", "He's lost again", "God's anger"],
                "correct_index": 1,
                "explanation": "Hell was the place where all hope was abandoned. Emerging to see stars means hope has been restored. You have to pass through the darkness to see the light."
            },
        ],
    },

    # ── Lesson 9: Virgil's Farewell ──
    9: {
        "title": "The Teacher's Farewell — Virgil Departs",
        "chapter_title": "Purgatory",
        "spark": "The guide who's been with Dante since Hell says 'This is as far as I go' — and vanishes.",
        "cliffhanger": "Taking Beatrice's hand, Dante ascends into Paradise. What awaits him there — endless starlight.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Hand in hand with Virgil, Dante keeps climbing Purgatory's mountain. But near the summit — Virgil stops. 'This is as far as I can go. Another guide will come for you.'", "highlight": "this is as far as I go"},
            {"speaker": "cosmii", "text": "Why can't Virgil go further? Remember — he's from Limbo. He lived before Christianity, so he can't enter Paradise. Reason and wisdom alone can only take you so far.", "highlight": "the limits of reason"},
            {"speaker": "cosmii", "text": "'Master, where are you going? Don't leave me!' Dante clings to him, pleading — but Virgil fades away. The teacher who stayed by his side through every horror of Hell... gone. This scene genuinely breaks your heart.", "highlight": None},
            {"speaker": "cosmii", "text": "Then suddenly — angels descend from the sky! They form a radiant throne. And seated upon it, bathed in divine light — a woman. An entirely different order of being has arrived.", "highlight": "a radiant being"},
            {"speaker": "cosmii", "text": "Wanna guess who she is? A savior? An angel? Nope — it's Beatrice. The love of Dante's entire life! In real life, Dante first saw Beatrice when he was just 9 years old and loved her until the day he died. She passed away young, at only 25.", "highlight": "Beatrice"},
            {"speaker": "cosmii", "text": "So Dante's Paradise guide isn't Virgil (reason) — it's Beatrice (love). Reason can't reach Paradise; only love can lead you there. That's one of the most beautiful messages in the entire Divine Comedy.", "highlight": "reason → love"},
        ],
        "quizzes": [
            {
                "question": "What's the fundamental reason Virgil can't continue to Paradise?",
                "options": ["He ran out of stamina", "Reason and wisdom alone can't reach Paradise — the domain of love", "He and Dante had a fight", "He ran out of time"],
                "correct_index": 1,
                "explanation": "Virgil represents reason and wisdom. But reason has its limits — Paradise is the realm of love, and only Beatrice, the symbol of love, can guide Dante there."
            },
            {
                "question": "What does it mean that Beatrice — not Virgil — guides Dante through Paradise?",
                "options": ["Women are superior", "Ultimate salvation comes through love, not reason", "Beatrice knew the way better", "No particular meaning"],
                "correct_index": 1,
                "explanation": "Hell and Purgatory can be navigated with reason (Virgil), but Paradise requires love (Beatrice). The ultimate force of salvation is love — that's the heart of the Divine Comedy."
            },
        ],
    },

    # ── Lesson 10: Infinite Starlight ──
    10: {
        "title": "Into Infinite Starlight — The Vision of Paradise",
        "chapter_title": "Paradise",
        "spark": "Hell said 'Abandon all hope' — Paradise is infinite starlight, boundless hope.",
        "cliffhanger": "At the very highest point of Paradise, Beatrice has one final thing to tell Dante.",
        "dialogue": [
            {"speaker": "cosmii", "text": "We've made it to Paradise! The moment Dante takes Beatrice's hand and begins to rise — everything is light. Infinite stars, shining spheres, boundless radiance. The polar opposite of Hell's darkness.", "highlight": "infinite starlight"},
            {"speaker": "cosmii", "text": "This is where the Divine Comedy's structure achieves perfect symmetry. Hell's entrance: 'Abandon all hope.' Escaping Hell: Dante sees stars. Paradise: infinite, blazing starlight. Darkness → a glimmer of light → boundless light. That progression IS the journey of human salvation.", "highlight": "from darkness to light"},
            {"speaker": "cosmii", "text": "Paradise also has 9 levels, each brighter than the last. But unlike Hell, where suffering intensifies as you descend, here joy and light grow as you ascend. It gets so bright that Dante's mind starts to blur.", "highlight": "9 levels of Paradise"},
            {"speaker": "cosmii", "text": "Here's what's wild — in Hell, people had specific physical torments, right? In Paradise, people gradually become light itself. Individual forms dissolve into pure radiance. The self fades away, merging with something infinitely greater.", "highlight": "people becoming light"},
            {"speaker": "cosmii", "text": "And Beatrice grows more beautiful with every level they climb. She shines brighter and brighter. Dante says he literally can't look at her anymore — she's too beautiful. Love itself becomes more perfect in Paradise.", "highlight": None},
            {"speaker": "cosmii", "text": "Here's the takeaway — in Hell, individual 'sins' were concrete and personal. In Paradise, individuals dissolve into light. Hell is the place of ego. Paradise is the place of transcending the self.", "highlight": "transcending the self"},
        ],
        "quizzes": [
            {
                "question": "Which correctly describes the progression of light across Hell → Purgatory → Paradise?",
                "options": ["Darkness → darkness → darkness", "Light → darkness → light", "Total darkness → starlight (hope) → infinite light", "Light → light → brighter light"],
                "correct_index": 2,
                "explanation": "Hell is total darkness (no hope), escaping Hell brings starlight (the beginning of hope), and Paradise is infinite light (hope fulfilled). The journey from darkness to light IS the structure of the Divine Comedy."
            },
            {
                "question": "What does it mean that people 'become light itself' in Paradise?",
                "options": ["They physically glow", "They transcend the self and merge with something greater", "It's too bright to see", "They're dead"],
                "correct_index": 1,
                "explanation": "Hell is ego-driven suffering; Paradise is about transcending the self. Becoming light means expanding beyond individual identity into divine love."
            },
        ],
    },

    # ── Lesson 11: The Final Canto ──
    11: {
        "title": "'Remember This and Tell the World' — The Final Canto",
        "chapter_title": "Paradise",
        "spark": "Beatrice's final words — 'Remember this, and make sure you tell the world.'",
        "cliffhanger": "",
        "dialogue": [
            {"speaker": "cosmii", "text": "At the very peak of Paradise, the light is so intense that Dante's mind begins to fade. And at the center of that light — Dante glimpses God. A single point of infinite radiance. Individual forms are gone — everything has melted into one immense, singular light.", "highlight": "a point of infinite light"},
            {"speaker": "cosmii", "text": "That's when Beatrice takes Dante's hand and says: 'Dante, remember all of this. You MUST write it down and leave it for those who come after you.' This is the entire reason the Divine Comedy exists. Dante made this journey so he could share it with the world.", "highlight": "remember and tell others"},
            {"speaker": "cosmii", "text": "Let's look back at the whole journey. Dante, lost at the midpoint of his life — the dark wood, the three beasts, Virgil extending his hand. Descending through Hell's 9 circles, staring human sin straight in the face.", "highlight": None},
            {"speaker": "cosmii", "text": "Escaping Hell to see the stars. Climbing Purgatory to cleanse his sins. Saying goodbye to his beloved teacher. Meeting Beatrice, and ascending through Paradise on the wings of love. Until finally — reaching the place where everything becomes light.", "highlight": "the complete journey"},
            {"speaker": "cosmii", "text": "And then — the very last line of the entire poem. The most famous sentence in all of Italian literature: 'the love that moves the sun and the other stars.' The force that drives this whole universe? It's love. Face the darkness, push through, and you'll reach the light. And that light, at its core, is love. That's the Divine Comedy's ultimate message.", "highlight": "the love that moves the sun and the other stars"},
            {"speaker": "cosmii", "text": "That's why a work written 700 years ago still resonates today. We've all been lost in our own dark wood at some point, right? In those moments, Dante is whispering to us — don't avoid the darkness. Walk through it. The stars will be waiting on the other side. Thanks for going on this journey with me — you were awesome!", "highlight": None},
        ],
        "quizzes": [
            {
                "question": "What does Beatrice mean when she says 'Remember this and tell others'?",
                "options": ["Keep it a secret", "Dante's journey was meant to be recorded and shared with the world", "Don't forget Beatrice", "Come back again"],
                "correct_index": 1,
                "explanation": "This is the reason the entire Divine Comedy exists. Dante traveled through Hell, Purgatory, and Paradise so he could write it all down and pass the message on to the world."
            },
            {
                "question": "If you had to summarize the entire Divine Comedy in one sentence, which fits best?",
                "options": ["Hell is scary, so be good", "Face the darkness instead of running — and you will reach the light", "Love is eternal", "You must believe in religion"],
                "correct_index": 1,
                "explanation": "Face life's darkness head-on, push through, and you'll find hope on the way to the light. That's the message that has endured for 700 years."
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

        chapter_ko = lesson["chapter_title"]
        chapter_en = en.get("chapter_title", lesson["chapter"])

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

        print(f"  ✓ Lesson {idx+1}: {lesson['title']}")

    print(f"\nDone! Inserted {len(LESSONS)} lessons with quizzes.")


if __name__ == "__main__":
    main()
