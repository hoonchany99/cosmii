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
            {"speaker": "cosmii", "text": "숲에서 빠져나가려고 하는데, 길을 가로막는 세 마리 짐승이 나타나. 첫 번째는 표범 — 색욕을 상징해. 두 번째는 사자 — 교만이야. 세 번째는 이리 — 탐욕. 내가 인생에서 길을 잃게 만든 것들이 딱 이 세 가지야.", "highlight": "세 마리 짐승"},
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
                "options": ["용기, 지혜, 사랑", "색욕, 교만, 탐욕", "과거, 현재, 미래", "지옥, 연옥, 천국"],
                "correct_index": 1,
                "explanation": "표범은 색욕, 사자는 교만, 이리는 탐욕을 상징해. 인간이 올바른 길에서 벗어나게 만드는 세 가지 유혹이야."
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
        "cliffhanger": "6단계부터는 분위기가 확 바뀌어. 이단자, 폭력자 — 지옥이 점점 깊어져."
    },

    # ── 지옥 하층 (Part 2/2) ──
    {
        "title": "이단자와 폭력의 지옥 — 6~7단계",
        "chapter": "Inferno Middle",
        "chapter_title": "지옥 중층",
        "part": 2, "total_parts": 2,
        "spark": "기독교인이면서 교리를 부정한 자들이 불타는 무덤에 갇혀 있다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "6단계는 이단자의 지옥이야. 1단계 림보에는 세례를 받지 못한 이교도들이 있었지? 여기 6단계는 달라 — 기독교인이면서 교리를 부정한 이단자들이 불타는 무덤에 갇혀 있어.", "highlight": None},
            {"speaker": "cosmii", "text": "여기서 단테는 피렌체의 정적 파리나타를 만나. 정치적으로 적이었지만, 위풍당당한 모습으로 그려져 있어. 단테가 대단한 점은 — 적조차 존엄하게 묘사했다는 거야. 하지만 더 깊은 곳에서는 교황까지 지옥에 넣어. 그 용기는 곧 보게 될 거야.", "highlight": "파리나타"},
            {"speaker": "cosmii", "text": "이것이 단테가 그려낸 르네상스의 정신이야. 종교적 권위든, 정치적 권력이든 — 죄를 지으면 지옥에 간다. 누구도 예외가 아니야.", "highlight": "권력 비판"},
            {"speaker": "cosmii", "text": "7단계로 내려가면 폭력의 지옥이야. 여기는 세 종류로 나뉘어. 첫 번째 — 타인에게 폭력을 행사한 자들. 이 사람들은 펄펄 끓는 피의 강에 잠겨 있어. 머리를 내밀면 위에서 켄타우로스가 화살을 쏴. 다시 들어가면 뜨겁고, 나오면 화살이 날아오고 — 영원히.", "highlight": "피의 강"},
            {"speaker": "cosmii", "text": "두 번째는 자기 자신에게 폭력을 행사한 자들, 즉 자해한 사람들의 지옥이야. 이 사람들은 나무가 되어 있어. 베르길리우스가 '가지를 하나 꺾어봐' 하는데, 꺾는 순간 피가 흘러. 나뭇가지 하나하나가 사람인 거야.", "highlight": "나무가 된 사람들"},
            {"speaker": "cosmii", "text": "세 번째는 신에게 폭력을 행사한 자들 — 신성모독자들이야. 뜨거운 모래 위에서 불비가 내려. 마치 건식 사우나인데 영원히 나갈 수 없는 거야. 여기까지가 7단계. 근데 아직도 더 나쁜 놈들이 아래에 있어.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "6단계 이단자의 지옥에서 단테가 보여주는 태도는?",
                "options": ["적을 무조건 비하함", "정적 파리나타조차 존엄하게 묘사하며, 죄 앞에 누구도 예외 없음을 보여줌", "이단자를 동정함", "지옥을 유머러스하게 그림"],
                "correct_index": 1,
                "explanation": "단테는 정치적 적인 파리나타도 위풍당당하게 그렸어. 하지만 죄를 지으면 누구든 — 나중에 밝혀지지만 교황조차 — 지옥에 간다는 게 단테의 혁명적 관점이야."
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
            {"speaker": "cosmii", "text": "단테의 묘사가 소름끼쳐. 「나는 턱부터 방귀 끼는 곳까지 찢어진 어떤 자를 보았는데, 두 다리 사이에 창자가 매달려 있고, 내장이 드러났으며, 먹은 것을 똥으로 만드는 축 처진 주머니도 나타났다.」 잔인하지만 엄청나게 생생해.", "highlight": "단테의 생생한 묘사"},
            {"speaker": "cosmii", "text": "가장 끔찍한 건 — 한 바퀴 돌아오는 동안 상처가 아물어. 그러면 또 갈라져. 이걸 영원히 반복하는 거야. 끝나지 않는 고통.", "highlight": "끝나지 않는 반복"},
            {"speaker": "cosmii", "text": "근데 이렇게 갈라지고 있는 사람이 누군지 아나? 무함마드야. 이슬람교의 창시자. 그리고 4대 칼리프 알리도 여기 있어. 단테의 시각에서는 — 기독교 세계를 분열시킨 장본인이니까.", "highlight": "무함마드"},
            {"speaker": "cosmii", "text": "성직매매 구덩이에는 교황이 있어! 교황 니콜라우스 3세가 거꾸로 처박혀서 발이 불에 타고 있어. 700년 전에 현직 교황을 지옥에 넣는 소설을 쓴 거야 — 단테의 용기가 진짜 대단해.", "highlight": None}
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
            {"speaker": "cosmii", "text": "드디어 천국이야! 베아트리체의 손을 잡고 올라가는 순간 — 모든 것이 빛이야. 무수한 별, 빛나는 별들, 끝없는 광채. 지옥의 어둠과 완전히 반대야.", "highlight": "무수한 별빛"},
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
            {"speaker": "cosmii", "text": "그리고 신곡의 마지막 한 줄. 이탈리아 문학 역사상 가장 유명한 문장이야. 「태양과 다른 별들을 움직이는 사랑」 — 이 거대한 우주를 움직이는 힘이 뭐냐면, 사랑이라는 거야. 어둠을 통과하면 빛이 있고, 그 빛의 정체는 결국 사랑이야. 이것이 신곡의 핵심이야.", "highlight": "태양과 다른 별들을 움직이는 사랑"},
            {"speaker": "cosmii", "text": "700년 전에 쓰인 이 작품이 아직도 읽히는 이유가 바로 이거야. 우리 모두 인생의 어두운 숲에서 길을 잃을 때가 있잖아. 그때 단테가 말해주는 거야 — 어둠을 피하지 마, 통과해. 그러면 별이 보일 거야.", "highlight": None}
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
        "cliffhanger": "지옥에서 천국까지, 큰 그림을 봤어. 이제 빠르게 지나쳤던 장면들을 깊이 들여다볼 차례야. 먼저 지옥 8단계로 돌아가자 — 역사상 가장 아름다운 연설이 울려 퍼지는 불꽃 속으로."
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
            {"speaker": "cosmii", "text": "So Dante tries to find his way out, but three beasts block his path. First — a leopard, symbolizing lust. Second — a lion, representing pride. Third — a she-wolf, standing for greed. These are the three things that knock us off the right path in life.", "highlight": "three beasts"},
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
                "options": ["Courage, wisdom, and love", "Lust, pride, and greed", "Past, present, and future", "Hell, Purgatory, and Paradise"],
                "correct_index": 1,
                "explanation": "The leopard is lust, the lion is pride, and the she-wolf is greed. These are the three temptations that lead us off the right path."
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
        "cliffhanger": "From Circle 6 onward, the mood shifts entirely. Heretics, the violent — Hell just keeps getting deeper.",
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

    # ── Lesson 5: Heretics and the Violent ──
    5: {
        "title": "Heretics and the Violent — Circles 6 & 7",
        "chapter_title": "Middle Hell",
        "spark": "Christians who denied their own doctrine burn in open tombs. Below them, three kinds of violence get three kinds of punishment.",
        "cliffhanger": "From Circle 8, it's no longer just brute force. Fraud, forgery, betrayal — the hell of those who used their intellect to deceive.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Circle 6 is the heretics' zone. Remember Limbo had unbaptized pagans? Circle 6 is different — these are Christians who denied Church doctrine, trapped in burning tombs.", "highlight": None},
            {"speaker": "cosmii", "text": "Here Dante meets Farinata — his political enemy from Florence. But even though they're rivals, Dante depicts him standing tall and proud in his burning tomb. What's remarkable is this: Dante portrays even his enemies with dignity. But as we'll see deeper down, not even popes are spared.", "highlight": "Farinata"},
            {"speaker": "cosmii", "text": "This is the Renaissance spirit Dante captured. Whether it's religious authority or political power — if you sinned, you go to Hell. No one gets a free pass.", "highlight": "speaking truth to power"},
            {"speaker": "cosmii", "text": "Circle 7 is the circle of violence, split into three zones. Zone one: those who were violent against others. They're submerged in a boiling river of blood. Stick your head up? Centaurs shoot you with arrows. Stay under? You're boiling alive. Head up — arrows. Head down — boiling. Forever.", "highlight": "the river of blood"},
            {"speaker": "cosmii", "text": "Zone two: those who were violent against themselves. They've been turned into trees. Virgil says, 'Break off a branch.' Dante snaps one — and it bleeds. Every single branch, every twig — is a person.", "highlight": "people turned to trees"},
            {"speaker": "cosmii", "text": "Zone three: those who were violent against God — the blasphemers. They lie on burning sand as fire rains from above. Imagine an eternal sauna you can never leave. That's Circle 7 — and believe it or not, there are even worse souls below.", "highlight": None},
        ],
        "quizzes": [
            {
                "question": "What does Dante's portrayal of his enemy Farinata in Circle 6 reveal about his approach?",
                "options": ["He mocks all his enemies", "He depicts even rivals with dignity, but no one — not even popes — escapes judgment for their sins", "He sympathizes with heretics", "He treats Hell as comedy"],
                "correct_index": 1,
                "explanation": "Dante gave Farinata a dignified portrayal despite being political rivals. But his larger point is unflinching: sin earns punishment regardless of status — as we'll see with popes deeper in Hell."
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
            {"speaker": "cosmii", "text": "And in the simony ditch — where corrupt clergy who sold spiritual privileges are punished — there's a POPE. Pope Nicholas III, jammed in upside down with his feet on fire. 700 years ago, Dante wrote a sitting pope into Hell. The sheer audacity is legendary.", "highlight": None},
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
        "cliffhanger": "We've seen the full arc — from Hell to Paradise. Now it's time to dive deeper into the scenes we flew past. Back to Circle 8 of Hell — into the flames where history's most beautiful speech echoes.",
        "dialogue": [
            {"speaker": "cosmii", "text": "At the very peak of Paradise, the light is so intense that Dante's mind begins to fade. And at the center of that light — Dante glimpses God. A single point of infinite radiance. Individual forms are gone — everything has melted into one immense, singular light.", "highlight": "a point of infinite light"},
            {"speaker": "cosmii", "text": "That's when Beatrice takes Dante's hand and says: 'Dante, remember all of this. You MUST write it down and leave it for those who come after you.' This is the entire reason the Divine Comedy exists. Dante made this journey so he could share it with the world.", "highlight": "remember and tell others"},
            {"speaker": "cosmii", "text": "Let's look back at the whole journey. Dante, lost at the midpoint of his life — the dark wood, the three beasts, Virgil extending his hand. Descending through Hell's 9 circles, staring human sin straight in the face.", "highlight": None},
            {"speaker": "cosmii", "text": "Escaping Hell to see the stars. Climbing Purgatory to cleanse his sins. Saying goodbye to his beloved teacher. Meeting Beatrice, and ascending through Paradise on the wings of love. Until finally — reaching the place where everything becomes light.", "highlight": "the complete journey"},
            {"speaker": "cosmii", "text": "And then — the very last line of the entire poem. The most famous sentence in all of Italian literature: 'the love that moves the sun and the other stars.' The force that drives this whole universe? It's love. Face the darkness, push through, and you'll reach the light. And that light, at its core, is love. That's the Divine Comedy's ultimate message.", "highlight": "the love that moves the sun and the other stars"},
            {"speaker": "cosmii", "text": "That's why a work written 700 years ago still resonates today. We've all been lost in our own dark wood at some point, right? In those moments, Dante is whispering to us — don't avoid the darkness. Walk through it. The stars will be waiting on the other side.", "highlight": None},
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


# ═══════════════════════════════════════════════════════════════════
# 추가 레슨 12–23: 인페르노 심층 + 연옥 전체 + 천국 전체
# ═══════════════════════════════════════════════════════════════════

NEW_LESSONS_KO = [
    # ══════════════════════════════════════════
    # 인페르노 심층 (2 lessons)
    # ══════════════════════════════════════════

    # ── Lesson 12: 율리시즈 (Inferno XXVI) ──
    {
        "title": "율리시즈의 마지막 항해 — 지식을 향한 금지된 열망",
        "chapter": "Inferno Depths",
        "chapter_title": "지옥 심층",
        "part": 1, "total_parts": 2,
        "spark": "「너희는 짐승처럼 살려고 태어난 게 아니라, 덕과 지식을 따르기 위해 태어난 것이다.」 — 지옥에서 울려 퍼지는 가장 아름다운 연설.",
        "dialogue": [
            {"speaker": "cosmii", "text": "자, 이제부터 빠르게 지나쳤던 장면들을 깊이 파볼 거야. 먼저 지옥 8단계로 돌아가자. 사기꾼의 지옥 안에 특별한 구덩이가 있어. '사악한 조언자'들의 구덩이야. 망자들은 불꽃에 감싸여 있어 — 몸은 안 보이고 불꽃만 보여. 갈라진 불꽃 하나가 흔들리고 있는데... 그 안에 율리시즈가 있어.", "highlight": "사악한 조언자"},
            {"speaker": "cosmii", "text": "율리시즈, 즉 오디세우스야. 트로이 목마를 만든 그 사람! 그리스 신화에서 가장 머리 좋은 영웅이지. 근데 왜 지옥에? 천재적인 언변으로 사람들을 속이고 조종했기 때문이야. 머리를 나쁜 데 쓴 거야.", "highlight": "율리시즈"},
            {"speaker": "cosmii", "text": "단테가 이야기를 들려달라고 해. 율리시즈가 말하기 시작해 — 트로이 전쟁이 끝나고 집에 돌아갈 수 있었는데, 안 돌아갔어. 늙은 동료들과 배를 돌려서 미지의 세계로 향한 거야. 집보다 모험이 더 끌렸던 거지.", "highlight": None},
            {"speaker": "cosmii", "text": "그때 율리시즈가 동료들에게 한 연설이 이거야. 「형제들이여! 수만 가지 위험을 지나 서쪽에 이른 우리가 아닌가. 너희는 짐승처럼 살려고 태어난 게 아니라, 덕과 지식을 따르기 위해 태어난 것이다.」 이 대사, 700년이 지났는데 아직도 소름 돋아.", "highlight": "짐승처럼 살지 말라"},
            {"speaker": "cosmii", "text": "동료들이 감동해서 헤라클레스의 기둥 — 지브롤터 해협, 인간이 넘어서는 안 되는 금지된 경계 — 을 넘어버려. 석 달을 항해하다 거대한 산이 보여 — 그게 연옥산이야! 하지만 기뻐할 틈도 없이 폭풍이 일어나서 배가 뒤집혀. 전원 익사.", "highlight": "금지된 경계를 넘다"},
            {"speaker": "cosmii", "text": "여기서 단테의 천재성이 빛나. 율리시즈의 연설은 진짜 아름다워. 우리 마음을 울려. 근데 그게 바로 그의 죄야 — 아름다운 말로 사람들을 죽음으로 이끈 거거든. 지식을 향한 열망은 숭고하지만, 그것이 금지된 경계를 넘을 때 파멸이 온다는 거야.", "highlight": "아름다움과 파멸의 공존"}
        ],
        "quizzes": [
            {
                "question": "율리시즈가 8단계 지옥에 있는 이유는?",
                "options": ["전쟁을 너무 많이 해서", "탁월한 언변으로 사람들을 속이고 죽음으로 이끈 '사악한 조언자'이기 때문에", "바다를 건넜기 때문에", "신을 모독해서"],
                "correct_index": 1,
                "explanation": "율리시즈의 죄는 단순한 거짓말이 아니야. 천재적인 언변으로 동료들을 감동시켜 죽음의 항해로 이끈 거야. 아름다운 말 뒤에 숨겨진 기만이 '사악한 조언자'의 죄야."
            },
            {
                "question": "율리시즈의 연설이 특별한 이유는?",
                "options": ["역사적으로 실제 있었던 연설이라서", "연설 자체는 아름답고 감동적이지만, 그것이 바로 사람들을 파멸로 이끈 도구이기 때문에", "가장 짧은 연설이라서", "신에 대한 찬양이 담겨서"],
                "correct_index": 1,
                "explanation": "「짐승처럼 살지 말고 지식을 따르라」는 말은 우리 마음까지 울려. 하지만 그 아름다운 말이 동료들을 금지된 경계 너머로 이끌어 죽게 만들었어. 아름다움과 파멸이 한 문장에 공존하는 거야."
            }
        ],
        "cliffhanger": "8단계보다 더 아래, 얼어붙은 9단계. 그곳에서 단테는 역사상 가장 잔인한 이야기를 듣게 돼."
    },

    # ── Lesson 13: 우골리노 (Inferno XXXIII) ──
    {
        "title": "우골리노 백작 — 지옥에서 가장 잔인한 이야기",
        "chapter": "Inferno Depths",
        "chapter_title": "지옥 심층",
        "part": 2, "total_parts": 2,
        "spark": "얼어붙은 지옥 최하층, 한 남자가 다른 남자의 두개골을 영원히 갉아먹고 있다. 그 이유를 들으면 — 눈물이 멈추지 않아.",
        "dialogue": [
            {"speaker": "cosmii", "text": "9단계 지옥, 얼음의 호수 코키투스. 배신자들의 지옥이야. 그 얼음 속에서 단테가 끔찍한 장면을 목격해 — 한 남자가 다른 남자의 뒤통수를 이빨로 갉아먹고 있어. 짐승처럼.", "highlight": "코키투스의 얼음"},
            {"speaker": "cosmii", "text": "단테가 다가가서 물어. '왜 그러는 겁니까?' 갉아먹던 남자가 고개를 들어. 입에서 피가 흘러. 「내 이야기를 들으면, 울면서도 이해할 것이다.」 그가 우골리노 백작이야. 그리고 그가 갉아먹고 있는 건 — 자기를 배신한 루지에리 대주교의 두개골이야.", "highlight": "우골리노 백작"},
            {"speaker": "cosmii", "text": "우골리노는 피사의 권력자였어. 정적 루지에리에게 배신당해서 탑에 감금돼. 혼자가 아니야 — 아들 둘과 손자 둘, 총 네 명의 어린아이들과 함께. 그리고 탑의 문이 못으로 박혀 잠겨. 음식은 들어오지 않아.", "highlight": "감금된 탑"},
            {"speaker": "cosmii", "text": "며칠이 지나고, 아이들이 배고프다고 울어. 우골리노가 아무것도 해줄 수가 없어. 아들이 이렇게 말해 — 「아버지, 우리를 드세요. 이 비참한 살을 당신이 입히셨으니, 당신이 벗기세요.」 이 대사에서 심장이 찢어져.", "highlight": "아이들의 절규"},
            {"speaker": "cosmii", "text": "하나씩, 하나씩 아이들이 죽어가. 눈앞에서. 우골리노는 이미 눈이 먼 채 더듬거리며 죽은 아이들의 이름을 부르고 있어. 그리고 마지막 줄 — 「그 후로 슬픔보다 굶주림이 더 강했다.」 이 한 줄이 700년간 논쟁이야.", "highlight": "슬픔보다 굶주림이"},
            {"speaker": "cosmii", "text": "결국 아이들의 시체를 먹었다는 뜻인지, 아니면 슬픔으로는 죽지 못하고 굶주림으로 죽었다는 뜻인지 — 단테는 답을 주지 않아. 그리고 우골리노는 자기를 배신한 루지에리의 두개골을 영원히 갉아먹고 있어. 지옥의 형벌이 잔인한 게 아니라, 인간이 인간에게 한 짓이 잔인한 거야.", "highlight": "답 없는 마지막 줄"}
        ],
        "quizzes": [
            {
                "question": "우골리노의 마지막 말 「슬픔보다 굶주림이 더 강했다」가 700년간 논쟁인 이유는?",
                "options": ["번역이 어려워서", "굶어 죽었다는 뜻인지 아이들의 시체를 먹었다는 뜻인지 해석이 갈리기 때문에", "문법이 틀려서", "단테가 실수로 쓴 문장이라서"],
                "correct_index": 1,
                "explanation": "이 한 줄은 의도적으로 모호해. '슬픔으로 못 죽고 굶어 죽었다'인지, '결국 굶주림에 아이들을 먹었다'인지 — 단테는 답을 주지 않아. 그 모호함이 오히려 더 잔혹한 거야."
            },
            {
                "question": "우골리노 에피소드가 신곡에서 특별한 이유는?",
                "options": ["가장 짧은 에피소드라서", "지옥의 형벌이 아니라 인간이 인간에게 한 잔인함이 핵심이기 때문에", "코믹한 장면이라서", "단테가 직접 겪은 이야기라서"],
                "correct_index": 1,
                "explanation": "우골리노의 고통은 지옥의 형벌에서 오는 게 아니야. 정적에게 배신당하고 아이들이 눈앞에서 죽어가는 걸 지켜봐야 했던 — 인간의 잔혹함이 핵심이야. 지옥보다 더 지옥 같은 현실."
            }
        ],
        "cliffhanger": "지옥의 어둠을 뒤로하고, 이제 연옥으로. 지옥을 빠져나온 단테가 보는 것은 — 새벽빛과 바다 위의 거대한 산."
    },

    # ══════════════════════════════════════════
    # 연옥 (5 lessons)
    # ══════════════════════════════════════════

    # ── Lesson 14: 연옥 입구 (Purgatorio I-IX) ──
    {
        "title": "연옥의 문 앞에서 — 새로운 시작",
        "chapter": "Purgatorio Lower",
        "chapter_title": "연옥 하층",
        "part": 1, "total_parts": 1,
        "spark": "지옥에서 빠져나온 단테 앞에 새로운 세계가 펼쳐져 — 바다 위에 솟은 연옥산, 그리고 그 입구를 지키는 의외의 인물.",
        "dialogue": [
            {"speaker": "cosmii", "text": "지옥의 출구를 빠져나오니 — 새벽이야! 하늘에 금성이 빛나고 있어. 지옥은 영원한 어둠이었잖아. 여기는 하늘이 있고, 바람이 있고, 빛이 있어. 단테가 다시 태어난 기분인 거야.", "highlight": "새벽의 금성"},
            {"speaker": "cosmii", "text": "연옥산 입구를 지키는 사람이 누구게? 카토야 — 로마 공화정의 수호자, 카이사르에 맞서 싸운 사람이야. 자유가 무너지는 걸 보고 자결했거든. 이교도인데 왜 연옥의 수호자일까? 단테는 카토를 '자유를 위해 목숨을 바친 사람'으로 봤기 때문이야.", "highlight": "카토"},
            {"speaker": "cosmii", "text": "해변에서 기다리고 있으면 — 바다 위에서 하얀 빛이 다가와. 천사가 모는 배야! 배 안에 연옥으로 오는 영혼들이 타고 있어. 찬송가를 부르며 해변에 내려. 지옥과 완전 다른 분위기지?", "highlight": "천사의 배"},
            {"speaker": "cosmii", "text": "근데 아직 연옥산에 바로 올라갈 수 없어. 입구 앞에 '전연옥' 구역이 있거든. 여기에는 너무 늦게 회개한 사람들이 있어 — 살아있을 때 마지막 순간에야 겨우 회개한 영혼들.", "highlight": "전연옥"},
            {"speaker": "cosmii", "text": "파문당한 자들, 게으른 자들, 그리고 '군주들의 계곡'이 있어. 살아생전 나라를 다스리느라 바빠서 영혼을 돌보지 않은 왕들이 모여 있어. 권력이 있었어도 영혼의 구원에는 도움이 안 됐다는 거야.", "highlight": "군주들의 계곡"},
            {"speaker": "cosmii", "text": "핵심 메시지는 이거야 — 「기다린 만큼 기다려야 한다.」 살아있을 때 회개를 미룬 만큼, 연옥 입구에서 그만큼의 시간을 기다려야 해. 인생에서 미룬 것들은 결국 나중에 대가를 치르게 된다는 거지.", "highlight": "미룬 만큼 기다린다"}
        ],
        "quizzes": [
            {
                "question": "전연옥에서 영혼들이 기다려야 하는 이유는?",
                "options": ["자리가 부족해서", "살아있을 때 회개를 미룬 만큼 그 시간만큼 기다려야 하기 때문에", "벌을 받는 중이라서", "천사가 허락하지 않아서"],
                "correct_index": 1,
                "explanation": "연옥의 원칙은 '미룬 만큼 기다린다'야. 마지막 순간에야 회개한 영혼들은 살아있을 때 미룬 시간만큼 입구에서 대기해야 해. 미루기의 대가인 거지."
            },
            {
                "question": "이교도인 카토가 연옥의 수호자인 이유는?",
                "options": ["가장 강한 전사여서", "자유를 위해 목숨을 바쳤기에 단테가 도덕적 자유의 상징으로 봤기 때문에", "기독교로 개종해서", "단테와 친구여서"],
                "correct_index": 1,
                "explanation": "카토는 공화정의 자유를 지키기 위해 목숨을 바친 인물이야. 이교도임에도 불구하고 '자유의지'의 상징으로 연옥 입구에 세운 거야. 연옥은 자유의지로 정화를 선택하는 곳이니까."
            }
        ],
        "cliffhanger": "드디어 연옥산의 문을 지나 첫 번째 단으로 올라가. 교만한 자들이 거대한 돌을 등에 지고 있어."
    },

    # ── Lesson 15: 교만에서 분노까지 (Purgatorio X-XVII) ──
    {
        "title": "교만에서 분노까지 — 연옥 1~3단",
        "chapter": "Purgatorio Middle",
        "chapter_title": "연옥 중층",
        "part": 1, "total_parts": 1,
        "spark": "지옥에서는 형벌을 '당하지만', 연옥에서는 형벌을 '선택한다' — 이것이 결정적 차이야.",
        "dialogue": [
            {"speaker": "cosmii", "text": "연옥 첫 번째 단 — 교만이야. 영혼들이 등에 엄청나게 무거운 돌을 지고 허리를 90도로 구부리며 걷고 있어. 하늘을 볼 수 없어. 교만했던 사람들이 강제로 고개를 숙이는 거야.", "highlight": "교만의 짐"},
            {"speaker": "cosmii", "text": "여기서 지옥과 결정적으로 다른 점이 있어. 지옥에서는 형벌을 '당하는' 거잖아? 연옥에서는 영혼들이 자발적으로 이 고통을 감내해. 왜? 이걸 통과하면 천국에 갈 수 있으니까. 목적이 있는 고통, 희망이 있는 고통이야.", "highlight": "자발적 선택"},
            {"speaker": "cosmii", "text": "바닥에 아름다운 대리석 조각이 새겨져 있어. 겸손의 예시들이야 — 성모 마리아의 겸손, 다윗 왕이 하나님 앞에서 춤추는 장면. 고개를 숙여야만 볼 수 있는 예술작품이야. 교만의 반대, 겸손을 배우라는 거지.", "highlight": "대리석의 겸손"},
            {"speaker": "cosmii", "text": "두 번째 단은 질투야. 영혼들의 눈꺼풀이 철사로 꿰매져 있어. 볼 수가 없어. 살아있을 때 남의 것을 탐내며 눈을 돌렸던 사람들이, 이제 아무것도 볼 수 없게 된 거야. 서로 어깨를 기대고 앉아서 기도해.", "highlight": "철사로 꿰맨 눈"},
            {"speaker": "cosmii", "text": "세 번째 단은 분노야. 엄청나게 짙은 연기가 가득해. 한 치 앞도 안 보여. 분노에 눈이 멀었던 사람들이, 연기에 눈이 멀어 아무것도 볼 수 없는 거야. 그 연기 속에서 평화의 기도를 부르고 있어.", "highlight": "분노의 연기"},
            {"speaker": "cosmii", "text": "패턴이 보이지? 연옥의 형벌은 전부 '반대로 뒤집기'야. 교만 → 강제로 고개 숙임. 질투 → 눈을 못 뜸. 분노 → 앞을 못 봄. 이 모든 건 치유를 위한 과정이야. 병원에서 아픈 수술을 받는 것처럼 — 나을 수 있다는 희망이 있으니까 견디는 거야.", "highlight": "반대로 뒤집기"}
        ],
        "quizzes": [
            {
                "question": "연옥에서 영혼들이 고통을 견디는 이유는?",
                "options": ["어쩔 수 없어서", "이 고통을 통과하면 천국에 갈 수 있기에 자발적으로 선택하는 것이기 때문에", "지옥보다 덜 아파서", "시간이 지나면 자동으로 끝나서"],
                "correct_index": 1,
                "explanation": "지옥의 고통은 목적 없는 영원한 형벌이지만, 연옥의 고통은 정화를 위한 자발적 선택이야. 끝이 있고 목적이 있으니까 견딜 수 있는 거야."
            },
            {
                "question": "연옥 2단에서 질투한 자들의 눈이 철사로 꿰매진 이유는?",
                "options": ["벌을 주기 위해", "남의 것을 탐내며 눈을 돌렸으니 이제 볼 수 없게 하여 서로에게 의지하게 하기 위해", "어둠이 무서우니까", "눈을 보호하려고"],
                "correct_index": 1,
                "explanation": "살아있을 때 남의 것을 탐내며 시기했던 눈이 닫혀. 볼 수 없으니 서로에게 기대야 하고, 그 과정에서 질투의 반대인 형제애를 배우게 되는 거야."
            }
        ],
        "cliffhanger": "4번째 단부터는 또 다른 죄들이 기다려. 나태한 자, 탐욕스러운 자, 그리고 마지막에는 불의 벽이 나타나."
    },

    # ── Lesson 16: 나태에서 색욕까지 (Purgatorio XVIII-XXVI) ──
    {
        "title": "나태에서 색욕까지 — 연옥 4~7단",
        "chapter": "Purgatorio Upper",
        "chapter_title": "연옥 상층",
        "part": 1, "total_parts": 1,
        "spark": "연옥 산 후반부. 게으른 자들이 미친 듯이 달리고, 탐욕스러운 자들이 엎드려 울고, 마지막에는 불의 벽을 통과해야 해.",
        "dialogue": [
            {"speaker": "cosmii", "text": "네 번째 단은 나태야. 살아있을 때 게을렀던 영혼들이 뭘 하고 있냐면 — 쉬지 않고 미친 듯이 달리고 있어! 「빨리! 빨리! 사랑에 게을렀던 시간을 낭비할 수 없어!」라고 외치면서. 게으름의 반대 — 끊임없는 움직임으로 정화하는 거야.", "highlight": "달리는 나태자들"},
            {"speaker": "cosmii", "text": "다섯 번째 단은 탐욕이야. 영혼들이 땅에 완전히 엎드려 있어. 얼굴이 바닥에 닿아 있어. 살아있을 때 물질에만 눈이 갔던 사람들이, 이제 하늘을 올려다볼 수 없게 된 거야. 울면서 시편을 읊고 있어.", "highlight": "엎드린 탐욕자들"},
            {"speaker": "cosmii", "text": "여기서 시인 스타티우스를 만나! 로마 시인인데, 연옥에서 죄를 다 씻고 천국으로 올라가려는 참이야. 베르길리우스의 시를 읽고 기독교로 개종했다는 설정이야. 스승의 작품이 제자를 구원한 거지.", "highlight": "스타티우스"},
            {"speaker": "cosmii", "text": "여섯 번째 단은 폭식이야. 향기로운 과일나무 앞을 지나가는데 — 손이 닿질 않아. 배가 고파 죽겠는데 음식은 눈앞에 있고, 먹을 수는 없어. 영혼들이 뼈만 남아서 눈자위가 보석 빠진 반지처럼 움푹 들어가 있어.", "highlight": "손 닿지 않는 과일"},
            {"speaker": "cosmii", "text": "일곱 번째 단, 마지막 — 색욕이야. 여기는 불길이야. 불 속을 걸어서 통과해야 해. 단테가 무서워서 한 발짝도 못 떼고 있어. 베르길리우스가 말해 — 「이 불 뒤에 베아트리체가 있어.」 그 말 한 마디에 단테가 불 속으로 들어가.", "highlight": "불의 벽"},
            {"speaker": "cosmii", "text": "연옥의 모든 단을 통과했어! 산 정상에 도착하면 — 에덴동산이야. 지상 낙원. 꽃이 피고 새가 노래하는 완벽한 숲. 여기서 단테의 인생을 바꿀 이별과 재회가 동시에 일어나.", "highlight": "지상 낙원 도착"}
        ],
        "quizzes": [
            {
                "question": "단테가 연옥 마지막 불의 벽을 통과할 수 있었던 이유는?",
                "options": ["불이 뜨겁지 않아서", "베르길리우스가 「이 불 뒤에 베아트리체가 있다」고 말했기 때문에", "다른 길이 없어서", "천사가 도와줘서"],
                "correct_index": 1,
                "explanation": "사랑이 두려움을 이긴 거야. 베아트리체를 다시 만날 수 있다는 희망이 불의 공포를 넘게 해줬어. 사랑이 모든 고통을 견딜 힘을 준다는 연옥의 핵심 메시지야."
            },
            {
                "question": "연옥 4단에서 나태한 자들이 '쉬지 않고 달리는' 이유는?",
                "options": ["운동이 건강에 좋아서", "살아있을 때 게을렀으므로 그 반대인 끊임없는 움직임으로 정화하기 때문에", "도망치고 있어서", "경주를 하고 있어서"],
                "correct_index": 1,
                "explanation": "연옥의 형벌은 '반대로 뒤집기' 원칙이야. 게으르게 살았던 사람들은 쉬지 않고 달리면서 나태의 반대인 열정을 배우는 거야."
            }
        ],
        "cliffhanger": "지상 낙원에서 베르길리우스가 조용히 이별을 고해. 그리고 빛 속에서 베아트리체가 나타나 — 하지만 다정한 재회가 아니야."
    },

    # ── Lesson 17: 베르길리우스의 이별 (Purgatorio XXVII-XXX) ──
    {
        "title": "베르길리우스의 이별 — 스승이 더 이상 갈 수 없는 곳",
        "chapter": "Earthly Paradise",
        "chapter_title": "지상 낙원",
        "part": 1, "total_parts": 2,
        "spark": "연옥 정상, 지상 낙원. 스승이 조용히 사라지고, 빛 속에서 나타난 베아트리체는 — 단테를 따뜻하게 안아주지 않아. 울면서 단테를 꾸짖어.",
        "dialogue": [
            {"speaker": "cosmii", "text": "불의 벽을 통과하고 연옥 산 정상에 도착했어. 지상 낙원, 에덴동산이야. 꽃이 피고, 새가 노래하고, 맑은 시냇물이 흐르고 있어. 완벽한 아름다움이야.", "highlight": "에덴동산"},
            {"speaker": "cosmii", "text": "그런데 베르길리우스가 멈춰. 이번에는 진짜 마지막이야. 「네 의지는 이제 자유롭고, 올바르고, 건전하다. 네 자신이 네 왕관이고 미트라야.」 이제 스승이 필요 없다는 선언이야. 쓸쓸하지만, 단테가 성장했다는 뜻이기도 해.", "highlight": "네 자신이 네 왕관"},
            {"speaker": "cosmii", "text": "단테가 뒤를 돌아보는데 — 베르길리우스가 없어. 사라졌어. 「베르길리우스! 베르길리우스!」 소리쳐 불러도 대답이 없어. 어둠의 지옥에서부터 함께했던 스승이, 아무 말 없이 떠나버린 거야.", "highlight": None},
            {"speaker": "cosmii", "text": "단테가 눈물을 흘리는 그때 — 하늘에서 빛의 행렬이 내려와. 꽃비가 날리고 천사들이 노래해. 녹색, 흰색, 빨간색 옷을 입은 한 여인이 빛의 수레에 앉아 나타나. 베아트리체야!", "highlight": "빛의 수레"},
            {"speaker": "cosmii", "text": "여기서 감동적인 재회를 기대하잖아? 포옹! 눈물! 근데 아니야. 베아트리체가 단테를 보자마자 — 「나를 똑바로 봐. 맞아, 나는 베아트리체야. 넌 어떻게 여기 올 생각을 했니?」 단테를 꾸짖는 거야.", "highlight": "베아트리체의 질책"},
            {"speaker": "cosmii", "text": "베아트리체가 죽은 후, 단테가 올바른 길에서 벗어났거든. 다른 여자들에게 마음을 주고, 세속적인 것들에 빠져들었어. 재회의 기쁨이 아니라 — 정산의 시간이야. 사랑하는 사람이기 때문에 더 엄격한 거야. 이게 진짜 사랑이야.", "highlight": "사랑의 엄격함"}
        ],
        "quizzes": [
            {
                "question": "베르길리우스가 마지막으로 남긴 '네 자신이 네 왕관이다'의 의미는?",
                "options": ["단테에게 왕위를 물려주는 것", "스승의 인도 없이 스스로 판단할 수 있을 만큼 성장했다는 뜻", "이별이 슬프다는 표현", "지상 낙원의 왕이 되라는 뜻"],
                "correct_index": 1,
                "explanation": "이 선언은 교육의 완성이야. 스승이 더 이상 필요 없을 정도로 제자가 성장했다는 거야. 쓸쓸하지만 가장 아름다운 졸업장이야."
            },
            {
                "question": "베아트리체가 재회하자마자 단테를 꾸짖은 이유는?",
                "options": ["단테가 너무 늦게 와서", "베아트리체가 죽은 후 단테가 방탕했기에 사랑하기 때문에 더 엄격하게 질책한 것", "베르길리우스를 데려와서", "단테의 옷차림이 마음에 안 들어서"],
                "correct_index": 1,
                "explanation": "재회는 포옹이 아니라 정산이야. 사랑하는 사람이기에 더 엄격하게 질책하는 거야. 진짜 사랑은 감싸주는 게 아니라 바로잡아주는 거야."
            }
        ],
        "cliffhanger": "단테가 눈물로 고백한 후, 두 개의 강에서 씻김을 받아. 하나는 죄를 잊게 하고, 하나는 선한 기억을 되살려."
    },

    # ── Lesson 18: 지상 낙원 (Purgatorio XXXI-XXXIII) ──
    {
        "title": "지상 낙원 — 레테와 에우노에 강",
        "chapter": "Earthly Paradise",
        "chapter_title": "지상 낙원",
        "part": 2, "total_parts": 2,
        "spark": "죄를 잊는 강 레테, 선한 기억을 되살리는 강 에우노에. 두 강에서 씻김을 받은 단테는 — '별들을 향해 올라갈 준비가 된' 사람으로 다시 태어나.",
        "dialogue": [
            {"speaker": "cosmii", "text": "베아트리체의 꾸짖음 앞에서 단테가 무너져. 자기 잘못을 고백하면서 울어. 진심으로 회개하는 거야. 베아트리체가 말해 — 「네 눈물을 다른 칼에 대비해 두어라. 아직 부족하다.」 엄하지만 필요한 과정이야.", "highlight": "단테의 고백"},
            {"speaker": "cosmii", "text": "두 개의 강이 나타나. 첫 번째는 레테 강 — 그리스 신화의 망각의 강이지? 여기서는 죄의 기억을 씻어주는 강이야. 단테가 이 강물에 잠기면 자기가 지은 죄의 기억이 사라져. 깨끗한 백지 상태가 돼.", "highlight": "레테 — 죄의 망각"},
            {"speaker": "cosmii", "text": "두 번째는 에우노에 강 — 이건 단테가 창조한 강이야. 그리스 신화에는 없어. '좋은 기억'이라는 뜻인데, 이 강물을 마시면 자기가 했던 선한 일들의 기억이 생생하게 되살아나. 죄는 잊고, 선함은 기억하는 거야.", "highlight": "에우노에 — 선한 기억"},
            {"speaker": "cosmii", "text": "이 설정이 천재적이지 않아? 완전한 정화란 — 나쁜 기억을 지우는 것만이 아니라, 좋은 기억을 되살리는 것까지 필요하다는 거야. 두 개가 세트야. 하나만으로는 부족해.", "highlight": None},
            {"speaker": "cosmii", "text": "이 사이에 거대한 알레고리 행렬이 지나가. 교회 역사를 상징하는 장면들이야 — 수레, 독수리, 여우, 용이 나타나면서 교회의 부패와 타락을 풍자해. 천국 직전에서까지 교회 권력을 비판하는 단테의 용기!", "highlight": "교회 비판"},
            {"speaker": "cosmii", "text": "두 강에서 씻김을 받은 단테. 연옥편의 마지막 줄이 이거야 — 「나는 순수하고 깨끗해져서, 별들을 향해 올라갈 준비가 되었다.」 '별'로 끝나. 지옥편도 '별'로 끝났고, 연옥편도 '별'로 끝나. 천국편도 '별'로 끝나. 세 편 모두가.", "highlight": "별들을 향해"}
        ],
        "quizzes": [
            {
                "question": "레테 강과 에우노에 강이 둘 다 필요한 이유는?",
                "options": ["하나는 뜨겁고 하나는 차가워서", "완전한 정화에는 죄를 잊는 것과 선한 기억을 되살리는 것 둘 다 필요하기 때문에", "하나는 들어가고 하나는 마시는 거라서", "장식적 요소일 뿐이라서"],
                "correct_index": 1,
                "explanation": "단테의 천재적 통찰이야. 나쁜 것을 지우는 것만으로는 부족해. 좋은 것을 되살려야 비로소 완전한 정화가 이루어지는 거야. 두 강은 반드시 세트야."
            },
            {
                "question": "신곡의 지옥편, 연옥편, 천국편이 모두 '별(stelle)'로 끝나는 이유는?",
                "options": ["우연의 일치", "별은 희망과 신성을 상징하며 세 편 모두가 궁극적으로 빛을 향한 여정임을 보여주기 때문에", "단테가 천문학자여서", "운율을 맞추기 위해"],
                "correct_index": 1,
                "explanation": "단테는 의도적으로 세 편 모두를 '별'로 끝냈어. 지옥을 빠져나와 보는 별, 연옥을 오르며 다가가는 별, 천국에서 도달하는 별 — 어둠에서 빛으로의 여정이 이 한 단어에 압축되어 있어."
            }
        ],
        "cliffhanger": "별을 향해 올라간 단테. 베아트리체와 함께 천국의 문을 열어. 달의 하늘부터 시작되는 아홉 겹의 천국이 펼쳐져."
    },

    # ══════════════════════════════════════════
    # 천국 (5 lessons)
    # ══════════════════════════════════════════

    # ── Lesson 19: 달에서 태양까지 (Paradiso I-XIV) ──
    {
        "title": "달에서 태양까지 — 천국의 첫 네 하늘",
        "chapter": "Paradiso Lower",
        "chapter_title": "천국 하층",
        "part": 1, "total_parts": 1,
        "spark": "천국의 모든 영혼은 완벽하게 행복해 — 다만 그 빛의 밝기가 다를 뿐이야.",
        "dialogue": [
            {"speaker": "cosmii", "text": "천국은 아홉 겹의 하늘로 구성돼 있어. 각 하늘에 행성이 하나씩 있고, 영혼들이 나타나서 단테를 맞이해. 첫 번째 하늘은 달이야.", "highlight": "아홉 겹의 하늘"},
            {"speaker": "cosmii", "text": "달의 하늘에서 피카르다라는 여성을 만나. 수녀가 되려 했는데 강제로 결혼당한 사람이야. 서원을 지키지 못한 죄로 가장 낮은 하늘에 있어. 단테가 물어 — 「더 높은 곳에 가고 싶지 않아요?」", "highlight": "피카르다"},
            {"speaker": "cosmii", "text": "피카르다의 대답이 천국의 핵심이야. 「우리의 뜻은 사랑의 힘에 의해 평화로워졌습니다. 우리가 가진 것 이상을 원하지 않아요.」 천국의 모든 영혼은 자기 자리에서 완벽하게 행복해. 지옥은 영원한 불만, 천국은 완벽한 만족.", "highlight": "완벽한 만족"},
            {"speaker": "cosmii", "text": "수성의 하늘 — 명예를 위해 선을 행한 사람들. 금성의 하늘 — 사랑의 열정이 넘쳤던 영혼들. 올라갈수록 빛이 강해져. 영혼들이 점점 더 밝게 빛나.", "highlight": None},
            {"speaker": "cosmii", "text": "네 번째, 태양의 하늘 — 지혜로운 신학자들이 모여 있어! 토마스 아퀴나스, 솔로몬... 인류 역사상 가장 위대한 지성들이야. 빛나는 영혼들이 원을 그리며 단테를 둘러싸고 춤을 춰. 지옥에서 만났던 위인들은 탄식했는데, 천국의 위인들은 춤추고 노래해.", "highlight": "춤추는 신학자들"},
            {"speaker": "cosmii", "text": "그리고 베아트리체가 올라갈수록 점점 더 아름다워져. 빛이 강해져서 직접 보기가 힘들어져. 단테가 계속 말해 — 「그녀의 미소가 너무 밝아서 눈이 타버릴 것 같다.」 사랑이 빛으로 표현되는 거야.", "highlight": "베아트리체의 미소"}
        ],
        "quizzes": [
            {
                "question": "피카르다가 「더 높은 곳을 원하지 않는다」고 말한 것이 의미하는 바는?",
                "options": ["포기한 것", "천국의 모든 영혼은 자기 자리에서 완벽하게 행복하며 불만이 없다는 천국의 본질", "겸손의 미덕", "올라갈 수 없어서"],
                "correct_index": 1,
                "explanation": "이것이 천국의 핵심 원리야. 모든 영혼이 자기 자리에서 완벽한 행복을 느껴. '더 원한다'는 개념 자체가 없어. 지옥이 영원한 불만이라면, 천국은 완벽한 만족이야."
            },
            {
                "question": "천국에서 영혼들이 빛으로 나타나는 이유는?",
                "options": ["물리적 현상이라서", "신의 사랑을 반영하며 높은 하늘에 있을수록 더 밝게 빛나기 때문에", "단테의 눈이 나빠서", "장식적 효과"],
                "correct_index": 1,
                "explanation": "천국의 영혼들은 신의 사랑을 거울처럼 반영해. 더 완전하게 반영하는 영혼일수록 더 밝게 빛나는 거야. 빛의 밝기가 곧 사랑의 깊이인 셈이야."
            }
        ],
        "cliffhanger": "다섯 번째 하늘, 화성에서 단테는 가족의 비밀을 알게 돼 — 증조할아버지가 나타나 단테의 미래를 예언해."
    },

    # ── Lesson 20: 화성에서 토성까지 (Paradiso XV-XXII) ──
    {
        "title": "화성에서 토성까지 — 전사, 정의, 명상",
        "chapter": "Paradiso Middle",
        "chapter_title": "천국 중층",
        "part": 1, "total_parts": 1,
        "spark": "화성에서 만난 단테의 증조할아버지 카치아귀다. 그가 예언하는 단테의 미래 — 「다른 사람의 빵이 얼마나 짠지 알게 될 것이다.」",
        "dialogue": [
            {"speaker": "cosmii", "text": "다섯 번째 하늘, 화성이야. 신앙을 위해 싸운 전사들이 있어. 빛나는 영혼들이 거대한 십자가 모양을 만들어 — 그 십자가에서 찬송가가 울려 퍼져. 아름다워서 단테가 넋을 잃어.", "highlight": "빛의 십자가"},
            {"speaker": "cosmii", "text": "십자가에서 한 영혼이 빠르게 다가와. 「오, 나의 피여! 오, 넘치도록 부어진 하나님의 은총이여!」 카치아귀다 — 단테의 증조할아버지야! 150년 전 십자군 전쟁에서 전사한 사람이야.", "highlight": "카치아귀다"},
            {"speaker": "cosmii", "text": "카치아귀다가 옛날 피렌체를 회상해. 소박하고 정직했던 시절. 그리고 지금의 부패한 피렌체를 한탄해. 여기서 단테의 개인적 아픔이 나와 — 카치아귀다가 단테의 추방을 예언해.", "highlight": None},
            {"speaker": "cosmii", "text": "「너는 네가 가장 사랑하는 것들을 떠나게 될 것이다. 다른 사람의 집 계단이 얼마나 딛기 힘든지, 다른 사람의 빵이 얼마나 짠지 알게 될 것이다.」 고향에서 쫓겨나 남의 집에 얹혀살게 된다는 거야. 실제 단테의 삶이 그랬어.", "highlight": "다른 사람의 빵"},
            {"speaker": "cosmii", "text": "여섯 번째 하늘은 목성, 정의로운 통치자들의 하늘이야. 영혼들이 모여서 거대한 독수리 형상을 만들어! 이 독수리가 하나의 목소리로 정의란 무엇인지 말해 — 개별 영혼이 아니라 하나의 공동체로 말하는 거야.", "highlight": "정의의 독수리"},
            {"speaker": "cosmii", "text": "일곱 번째 하늘은 토성, 명상가들의 하늘이야. 황금 사다리가 하늘 높이 뻗어 있어 — 끝이 안 보여. 성 베드로 다미아누스 같은 명상의 대가들이 여기 있어. 여기서부터 소리가 사라져. 천국이 너무 높아서 음악조차 초월하는 영역이야.", "highlight": "황금 사다리"}
        ],
        "quizzes": [
            {
                "question": "카치아귀다의 예언 「다른 사람의 빵이 얼마나 짠지」가 의미하는 것은?",
                "options": ["빵이 맛없다는 뜻", "고향에서 추방되어 남의 도움으로 살아야 하는 망명의 쓰라림", "소금이 비싸다는 뜻", "건강 조언"],
                "correct_index": 1,
                "explanation": "이 예언은 단테의 실제 삶을 그대로 반영해. 피렌체에서 추방당해 이탈리아를 떠돌며 귀족들의 도움으로 살았던 단테. '남의 빵의 짠맛'은 의지하며 사는 쓸쓸함과 수치를 표현한 거야."
            },
            {
                "question": "목성의 하늘에서 영혼들이 독수리 형상을 이루어 '하나의 목소리'로 말하는 의미는?",
                "options": ["독수리가 로마의 상징이라서", "정의는 개인이 아닌 공동체가 함께 이룰 때 완성된다는 의미", "새를 좋아해서", "장식적 효과"],
                "correct_index": 1,
                "explanation": "개별 영혼이 아니라 하나의 독수리로 합쳐져 말한다는 건, 진정한 정의는 개인의 판단이 아니라 공동체의 조화 속에서 실현된다는 단테의 메시지야."
            }
        ],
        "cliffhanger": "여덟 번째 하늘, 항성천. 여기서 단테는 졸업 시험을 치러 — 성 베드로, 성 야고보, 성 요한이 직접 출제하는 시험이야."
    },

    # ── Lesson 21: 항성천의 시험 (Paradiso XXIII-XXVI) ──
    {
        "title": "항성천의 시험 — 믿음, 소망, 사랑",
        "chapter": "Paradiso Upper",
        "chapter_title": "천국 상층",
        "part": 1, "total_parts": 1,
        "spark": "천국의 가장 높은 곳에서 성인 세 명이 단테를 시험해 — 주제는 믿음, 소망, 사랑. 영적 여정의 졸업 시험이야.",
        "dialogue": [
            {"speaker": "cosmii", "text": "여덟 번째 하늘, 항성천이야. 개별 행성이 아니라 별들의 세계야. 여기서 엄청난 이벤트가 벌어져 — 성인 세 명이 단테에게 시험을 출제해. 마치 영적 여정의 박사 논문 구술시험이야!", "highlight": "영적 구술시험"},
            {"speaker": "cosmii", "text": "첫 번째 시험관 — 성 베드로. 주제는 '믿음'이야. 「믿음이란 무엇인가?」 단테가 대답해 — 「믿음은 바라는 것들의 실체이며, 보이지 않는 것들의 증거입니다.」 성 베드로가 만족해서 단테 주위를 세 바퀴 돌아. 합격!", "highlight": "성 베드로의 시험"},
            {"speaker": "cosmii", "text": "두 번째 시험관 — 성 야고보. 주제는 '소망'이야. 「소망이란 무엇이며, 네 안에 그것이 어떻게 빛나고 있는가?」 단테가 대답해 — 소망은 미래의 영광에 대한 확실한 기대라고. 합격!", "highlight": "성 야고보의 시험"},
            {"speaker": "cosmii", "text": "세 번째 시험관 — 성 요한. 주제는 '사랑'이야. 가장 중요한 시험이지. 「네 사랑은 어디에서 비롯되었는가?」 단테가 대답해 — 모든 선의 근원인 하나님, 그리고 이 세상의 아름다운 것들이 신의 사랑을 반영하고 있음을 깨달았기 때문이라고.", "highlight": "성 요한의 시험"},
            {"speaker": "cosmii", "text": "세 시험을 모두 통과한 후 — 아담이 나타나! 인류 최초의 인간이야. 에덴동산에서의 경험을 이야기해. 낙원에서 보낸 시간이 겨우 여섯 시간이었다고. 최초의 언어에 대해서도 말해줘.", "highlight": "아담의 등장"},
            {"speaker": "cosmii", "text": "이 시험의 의미가 뭘까? 지옥은 죄를 '보는' 여정, 연옥은 죄를 '씻는' 여정이었어. 천국의 이 시험은 — 배운 것을 증명하는 여정이야. 믿음, 소망, 사랑 — 기독교 세 핵심 덕목을 단테가 완전히 체화했는지 확인하는 거야.", "highlight": "여정의 증명"}
        ],
        "quizzes": [
            {
                "question": "천국의 세 시험이 믿음→소망→사랑 순서인 이유는?",
                "options": ["알파벳 순서", "믿음이 기초가 되고 소망이 이어지며 사랑이 가장 위대한 덕목이기에 마지막으로 시험하는 것", "시험관의 나이순", "특별한 이유 없음"],
                "correct_index": 1,
                "explanation": "고린도전서에 「믿음, 소망, 사랑, 이 세 가지는 항상 있을 것인데 그 중의 제일은 사랑이라」고 써 있어. 가장 중요한 사랑이 마지막 시험인 건 클라이맥스를 위해서야."
            },
            {
                "question": "단테가 '사랑의 근원'으로 답한 것은?",
                "options": ["베아트리체", "모든 선의 근원인 하나님과 세상의 아름다운 것들이 신의 사랑을 반영한다는 깨달음", "가족", "이탈리아"],
                "correct_index": 1,
                "explanation": "단테의 사랑은 개인적 감정에서 시작하지만 궁극적으로는 신의 사랑을 인식하는 것으로 확장돼. 세상의 모든 아름다움이 신의 사랑의 반영이라는 깨달음이 핵심이야."
            }
        ],
        "cliffhanger": "아홉 번째 하늘을 지나 — 드디어 모든 하늘 너머의 세계, 지고천. 거기서 단테는 영원한 빛의 장미를 본다."
    },

    # ── Lesson 22: 천상의 장미 (Paradiso XXVII-XXXI) ──
    {
        "title": "천상의 장미 — 모든 축복받은 영혼이 모인 곳",
        "chapter": "Empyrean",
        "chapter_title": "지고천",
        "part": 1, "total_parts": 2,
        "spark": "모든 하늘 너머, 지고천. 축복받은 영혼들이 거대한 장미 모양의 원형극장에 모여 있고, 그 중심에 — 눈이 멀 정도의 빛이 있어.",
        "dialogue": [
            {"speaker": "cosmii", "text": "아홉 번째 하늘, 원동천을 지나. 여기는 물질 세계의 끝이야. 그 너머에 — 지고천, 엠피레오가 있어. 시간도 공간도 초월한 순수한 빛의 세계야.", "highlight": "지고천"},
            {"speaker": "cosmii", "text": "단테가 지고천에 들어서는 순간 — 빛의 강이 나타나. 빛이 물처럼 흘러. 그 강 양쪽에 보석 같은 꽃들이 피어 있고, 불꽃이 꽃 사이를 날아다녀. 단테가 빛의 강에 눈을 담그면 — 세상이 변해.", "highlight": "빛의 강"},
            {"speaker": "cosmii", "text": "빛의 강이 거대한 원으로 변해. 그 원이 — 천상의 장미야. 축복받은 영혼들이 거대한 장미 모양의 원형극장에 앉아 있어. 수천, 수만의 영혼이 빛으로 빛나면서 하나의 완벽한 꽃 모양을 이루고 있어.", "highlight": "천상의 장미"},
            {"speaker": "cosmii", "text": "그리고 여기서 또 한 번의 이별이 와. 베아트리체가 조용히 자기 자리로 돌아가. 단테가 올려다보면 — 장미의 한 꽃잎에 베아트리체가 앉아서 미소 짓고 있어. 그녀도 더 이상 갈 수 없는 거야.", "highlight": "베아트리체의 이별"},
            {"speaker": "cosmii", "text": "새로운 안내자가 나타나 — 성 베르나르도. 성모 마리아에 대한 헌신으로 유명한 수도사야. 왜 베르나르도냐면 — 마지막 단계, 신을 직접 보기 위해서는 사랑을 넘어서 기도와 은총이 필요하거든.", "highlight": "성 베르나르도"},
            {"speaker": "cosmii", "text": "이성(베르길리우스) → 사랑(베아트리체) → 은총(성 베르나르도). 세 안내자의 교체가 신곡 전체의 메시지를 보여줘. 이성만으로는 한계가 있고, 사랑으로 더 높이 갈 수 있지만, 궁극적으로 신을 보기 위해서는 은총이 필요하다는 거야.", "highlight": "세 안내자"}
        ],
        "quizzes": [
            {
                "question": "천상의 장미가 '장미' 형태인 것의 의미는?",
                "options": ["단테가 꽃을 좋아해서", "축복받은 모든 영혼이 하나의 아름다운 공동체를 이루며 중심의 빛을 향해 열려 있음을 상징", "중세에 장미가 비싸서", "특별한 의미 없음"],
                "correct_index": 1,
                "explanation": "장미의 꽃잎들이 중심을 향해 열려 있듯, 축복받은 영혼들이 신의 빛을 중심으로 하나의 완벽한 공동체를 이루고 있어. 개별 영혼이면서 동시에 하나인 거야."
            },
            {
                "question": "신곡의 세 안내자 — 베르길리우스, 베아트리체, 성 베르나르도 — 가 상징하는 것은?",
                "options": ["과거, 현재, 미래", "이성, 사랑, 은총 — 인간이 신에게 도달하는 세 단계", "세 가지 학문", "세 가지 언어"],
                "correct_index": 1,
                "explanation": "이성으로 지옥·연옥을 통과하고, 사랑으로 천국을 오르고, 은총으로 신을 직접 보는 단계까지. 이 세 단계가 신곡 전체의 구조야."
            }
        ],
        "cliffhanger": "모든 안내자의 인도를 마치고, 단테는 마침내 신의 얼굴을 본다. 700년 전, 인간이 신을 묘사한 가장 경이로운 시도."
    },

    # ── Lesson 23: 신의 얼굴 (Paradiso XXXII-XXXIII) ──
    {
        "title": "신의 얼굴 — 모든 여정의 끝",
        "chapter": "Empyrean",
        "chapter_title": "지고천",
        "part": 2, "total_parts": 2,
        "spark": "세 개의 빛나는 원, 그 안에 인간의 얼굴. 단테는 본 것을 설명하려 하지만 — 언어가 무너져.",
        "dialogue": [
            {"speaker": "cosmii", "text": "성 베르나르도가 성모 마리아에게 기도해. 신곡에서 가장 아름다운 기도 중 하나야. 「처녀이면서 어머니인 분이여, 당신 아들의 딸이여」로 시작해. 모순적인 표현인데, 그 모순이 신비의 핵심이야. 마리아가 기도를 들어줘 — 단테의 눈이 열려.", "highlight": "마리아에게의 기도"},
            {"speaker": "cosmii", "text": "그리고 단테가 드디어 본다 — 세 개의 빛나는 원이야. 서로 다른 색인데 같은 크기야. 삼위일체 — 성부, 성자, 성령. 하나이면서 셋이고, 셋이면서 하나인 신비.", "highlight": "세 개의 원"},
            {"speaker": "cosmii", "text": "두 번째 원 안에서 — 인간의 얼굴이 보여. 성육신이야. 신이 인간이 되었다는 기독교의 핵심 교리가 빛의 이미지로 나타난 거야. 수학자가 원의 넓이를 구하려는 것처럼, 아무리 해도 완전히 이해할 수 없어.", "highlight": "빛 속의 인간 얼굴"},
            {"speaker": "cosmii", "text": "그리고 단테의 언어가 무너져. 「보았으나 말할 수 없다」 — 이것이 가장 정직한 고백이야. 14,000행이 넘는 시를 써온 천재적 시인이, 마지막 순간에 '언어로는 표현할 수 없다'고 항복하는 거야.", "highlight": "언어의 한계"},
            {"speaker": "cosmii", "text": "마지막 순간, 단테의 의지와 욕망이 — 균일하게 회전하는 바퀴처럼 — 하나의 힘에 의해 움직여져. 그리고 신곡 100칸토, 14,233행의 마지막 줄. 「태양과 다른 별들을 움직이는 사랑(L'amor che move il sole e l'altre stelle).」", "highlight": "마지막 한 줄"},
            {"speaker": "cosmii", "text": "이 한 줄이 모든 걸 말해. 우주를 움직이는 힘은 사랑이야. 어두운 숲에서 시작해서, 지옥의 밑바닥을 통과하고, 연옥의 불을 지나고, 천국의 별빛을 올라서 — 마침내 이 한 단어에 도달한 거야. 사랑. 100칸토의 여정이 이 한 줄로 완성돼. 함께 읽어줘서 진심으로 고마워!", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "단테가 신을 보고 '언어로 표현할 수 없다'고 한 것의 의미는?",
                "options": ["단테의 실력이 부족해서", "인간의 언어로는 담을 수 없는 경험이 존재한다는 정직한 고백이자 역설적으로 그 경험의 위대함을 보여주는 것", "글자 수 제한 때문에", "검열 때문에"],
                "correct_index": 1,
                "explanation": "14,000행이 넘는 시를 써온 천재 시인이 마지막에 '말할 수 없다'고 하는 것 자체가, 그 경험이 얼마나 언어를 초월하는지를 역설적으로 증명해. 침묵이 가장 강력한 표현이 되는 순간이야."
            },
            {
                "question": "신곡의 마지막 줄 '태양과 다른 별들을 움직이는 사랑'이 의미하는 것은?",
                "options": ["태양계의 물리법칙", "우주를 움직이는 근본적 힘은 사랑이며 단테의 100칸토 여정 전체가 이 깨달음을 위한 것이었다는 것", "별자리 이야기", "천문학 지식"],
                "correct_index": 1,
                "explanation": "어두운 숲에서 시작한 여정이 이 한 줄에 도달해. 지옥의 어둠, 연옥의 고통, 천국의 빛 — 모든 것을 관통하는 궁극의 힘은 '사랑'이라는 거야. 700년간 읽히는 이유가 바로 이 한 줄에 있어."
            }
        ],
        "cliffhanger": ""
    },
]


# ═══════════════════════════════════════════════════════════════════
# English translations for new lessons — natural, casual Cosmii tone
# ═══════════════════════════════════════════════════════════════════

NEW_TRANSLATIONS_EN = {
    # ── Lesson 12: Ulysses' Last Voyage ──
    0: {
        "title": "Ulysses' Last Voyage — The Forbidden Thirst for Knowledge",
        "chapter_title": "Inferno Depths",
        "spark": "'You were not made to live as brutes, but to pursue virtue and knowledge.' — The most beautiful speech ever delivered in Hell.",
        "cliffhanger": "Below Circle 8, the frozen depths of Circle 9. There, Dante will hear the cruelest story in all of Hell.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Alright, now we're going to dig deep into the scenes we flew past before. Let's head back to Circle 8 of Hell. In the circle of fraud, there's a special ditch for 'evil counselors.' The damned here are wrapped in flames — no bodies visible, just flickering fire. One split flame sways back and forth... and inside it is Ulysses.", "highlight": "evil counselors"},
            {"speaker": "cosmii", "text": "Ulysses — aka Odysseus. The guy who built the Trojan Horse! The cleverest hero in all of Greek mythology. So why is he in Hell? Because he used his brilliant gift for persuasion to manipulate and deceive people. Genius put to terrible use.", "highlight": "Ulysses"},
            {"speaker": "cosmii", "text": "Dante asks him to tell his story. Ulysses begins — after the Trojan War, he could have gone home. But he didn't. He turned his ship around with his aging crew and sailed toward the unknown. Adventure called louder than home.", "highlight": None},
            {"speaker": "cosmii", "text": "And here's the speech he gave his men: 'Brothers! We've passed through ten thousand dangers to reach the West. You were not made to live as brutes, but to pursue virtue and knowledge!' This line, written 700 years ago, still gives me chills every single time.", "highlight": "not made to live as brutes"},
            {"speaker": "cosmii", "text": "His crew was so moved that they sailed past the Pillars of Hercules — the Strait of Gibraltar, the forbidden boundary humans weren't supposed to cross. Three months out, they spotted a massive mountain — that's Mount Purgatory! But before they could celebrate, a whirlpool swallowed the ship. Everyone drowned.", "highlight": "crossing the forbidden boundary"},
            {"speaker": "cosmii", "text": "This is where Dante's genius shines. Ulysses' speech is genuinely beautiful. It moves us. But that's exactly his sin — he used beautiful words to lead people to their deaths. The thirst for knowledge is noble, but when it crosses forbidden boundaries, destruction follows.", "highlight": "beauty and destruction coexist"},
        ],
        "quizzes": [
            {
                "question": "Why is Ulysses in Circle 8 of Hell?",
                "options": ["He fought too many wars", "As an 'evil counselor' who used his brilliant eloquence to deceive people and lead them to death", "He crossed the ocean", "He blasphemed against God"],
                "correct_index": 1,
                "explanation": "Ulysses' sin wasn't simple lying — he used his genius-level persuasion to inspire his crew into a fatal voyage. The beauty of his words masked deadly deception. That's what makes an 'evil counselor.'"
            },
            {
                "question": "What makes Ulysses' speech so remarkable?",
                "options": ["It's a historically documented speech", "The speech itself is beautiful and inspiring, but it's also the very tool that led his men to their doom", "It's the shortest speech in the poem", "It contains praise for God"],
                "correct_index": 1,
                "explanation": "'Don't live as brutes — pursue knowledge!' — those words move even us, the readers. But that beautiful speech is exactly what led his crew across a forbidden boundary to their deaths. Beauty and destruction coexist in one sentence."
            },
        ],
    },

    # ── Lesson 13: Count Ugolino ──
    1: {
        "title": "Count Ugolino — The Cruelest Story in All of Hell",
        "chapter_title": "Inferno Depths",
        "spark": "In the frozen pit of Hell's lowest depths, one man gnaws eternally on another man's skull. Once you hear why — the tears won't stop.",
        "cliffhanger": "Leaving Hell's darkness behind, Dante heads to Purgatory. What awaits him — dawn light and a great mountain rising from the sea.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Circle 9 — the frozen lake of Cocytus. The traitors' Hell. In that ice, Dante witnesses something horrific: one man gnawing on the back of another man's skull. Like an animal.", "highlight": "the ice of Cocytus"},
            {"speaker": "cosmii", "text": "Dante approaches and asks: 'Why are you doing this?' The gnawing man lifts his head. Blood drips from his mouth. 'If you hear my story, you will weep — and understand.' This is Count Ugolino. And the skull he's gnawing? It belongs to Archbishop Ruggieri — the man who betrayed him.", "highlight": "Count Ugolino"},
            {"speaker": "cosmii", "text": "Ugolino was a powerful lord in Pisa. His political rival, Archbishop Ruggieri, betrayed him and had him locked in a tower. Not alone — with his two sons and two grandsons, four young children total. The door was nailed shut. No food was sent in.", "highlight": "the sealed tower"},
            {"speaker": "cosmii", "text": "Days passed. The children cried from hunger. Ugolino could do nothing. One of his sons said: 'Father, eat us. You gave us this wretched flesh — now take it back.' That line will rip your heart straight out of your chest.", "highlight": "the children's plea"},
            {"speaker": "cosmii", "text": "One by one, the children died. Right before his eyes. Ugolino, already blind, groped around calling their names. And then the final line: 'Then hunger proved more powerful than grief.' That single sentence has been debated for 700 years.", "highlight": "hunger proved more powerful"},
            {"speaker": "cosmii", "text": "Did he eat his children's bodies? Or did he simply die of starvation because grief alone couldn't kill him? Dante never gives us the answer. And now Ugolino gnaws on Ruggieri's skull for all eternity. The cruelty of Hell's punishment isn't the point here — the cruelty that humans inflict on each other is.", "highlight": "the unanswered question"},
        ],
        "quizzes": [
            {
                "question": "Why has Ugolino's final line — 'Then hunger proved more powerful than grief' — been debated for 700 years?",
                "options": ["Translation difficulties", "It's ambiguous whether he starved to death or was driven to eat his children's bodies", "It has a grammatical error", "Dante wrote it by accident"],
                "correct_index": 1,
                "explanation": "The line is intentionally ambiguous. Did hunger kill him because grief couldn't? Or did hunger drive him to... something unspeakable? Dante never tells us. And that deliberate silence makes it even more devastating."
            },
            {
                "question": "What makes the Ugolino episode so powerful within the Divine Comedy?",
                "options": ["It's the shortest episode", "The real horror isn't Hell's punishment but the cruelty humans inflict on each other", "It's a comedic scene", "Dante experienced it firsthand"],
                "correct_index": 1,
                "explanation": "Ugolino's suffering doesn't come from Hell's torments — it comes from being betrayed by his rival and watching his children die before his eyes. The real hell was what humans did to him. Reality was worse than Hell."
            },
        ],
    },

    # ── Lesson 14: Before Purgatory's Gate ──
    2: {
        "title": "Before Purgatory's Gate — A New Beginning",
        "chapter_title": "Lower Purgatory",
        "spark": "A new world unfolds before Dante — a great mountain rising from the sea, and a surprising figure guarding its entrance.",
        "cliffhanger": "Finally past the gate and climbing onto the first terrace. The proud are carrying massive stones on their backs.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Climbing out of Hell's exit — it's dawn! Venus is shining in the sky. Hell was eternal darkness, remember? Here there's sky, wind, light. Dante feels like he's been born again.", "highlight": "Venus at dawn"},
            {"speaker": "cosmii", "text": "Guess who's guarding the entrance to Mount Purgatory? Cato — the defender of the Roman Republic who fought against Julius Caesar. He took his own life rather than see freedom die. But wait, he's pagan — why is he the guardian here? Because Dante saw him as someone who gave his life for freedom.", "highlight": "Cato"},
            {"speaker": "cosmii", "text": "While waiting on the beach — a white light approaches across the water. It's a boat steered by an angel! Inside are souls arriving at Purgatory, singing hymns as they step ashore. Totally different vibe from Hell, right?", "highlight": "the angel's boat"},
            {"speaker": "cosmii", "text": "But you can't climb the mountain just yet. Before the gate there's 'Ante-Purgatory' — a waiting zone for souls who repented too late. People who only managed to repent at the very last moment of their lives.", "highlight": "Ante-Purgatory"},
            {"speaker": "cosmii", "text": "There are the excommunicated, the negligent, and the 'Valley of the Princes' — kings who were so busy ruling their kingdoms that they neglected their souls. All that power did nothing for their spiritual salvation.", "highlight": "Valley of the Princes"},
            {"speaker": "cosmii", "text": "Here's the key message: 'You must wait as long as you made others wait.' If you put off repentance in life, you wait that same amount of time at Purgatory's gate. The things you procrastinate on always come back around.", "highlight": "wait as long as you delayed"},
        ],
        "quizzes": [
            {
                "question": "Why must souls in Ante-Purgatory wait before entering?",
                "options": ["Not enough room", "They must wait as long as they delayed repentance in life", "They're being punished", "The angel won't allow it"],
                "correct_index": 1,
                "explanation": "Purgatory's principle: you wait as long as you procrastinated. Souls who only repented at the last moment must spend that same delay waiting at the gate. Procrastination has its price."
            },
            {
                "question": "Why is pagan Cato the guardian of Purgatory?",
                "options": ["He was the strongest warrior", "He gave his life for freedom, so Dante saw him as the symbol of moral liberty", "He converted to Christianity", "He was Dante's friend"],
                "correct_index": 1,
                "explanation": "Cato sacrificed his life to protect republican freedom. Despite being pagan, Dante placed him at Purgatory's entrance as the symbol of free will — because Purgatory is where souls freely choose their own purification."
            },
        ],
    },

    # ── Lesson 15: Pride to Wrath ──
    3: {
        "title": "From Pride to Wrath — Purgatory Terraces 1 Through 3",
        "chapter_title": "Middle Purgatory",
        "spark": "In Hell you 'suffer' punishment. In Purgatory you 'choose' it. That's the game-changing difference.",
        "cliffhanger": "From terrace 4 onward, more sins await. The slothful, the greedy, and at the end — a wall of fire.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Purgatory's first terrace — pride. The souls here are carrying enormously heavy stones on their backs, bent over at a 90-degree angle. They can't look up at the sky. People who lived with their heads held too high are now forced to bow.", "highlight": "the weight of pride"},
            {"speaker": "cosmii", "text": "Here's the game-changer compared to Hell. In Hell, punishment is inflicted ON you. In Purgatory, souls voluntarily endure it. Why? Because passing through this suffering means they get to reach Paradise. This is pain with a purpose. Pain with hope.", "highlight": "voluntary choice"},
            {"speaker": "cosmii", "text": "The ground beneath their feet is carved with beautiful marble reliefs — examples of humility. The Virgin Mary's humility. King David dancing before God. But you can only see this art if you bow your head. The opposite of pride — humility — carved right where only the humble can see it.", "highlight": "marble humility"},
            {"speaker": "cosmii", "text": "Terrace 2 is envy. The souls here have their eyelids sewn shut with iron wire. They literally cannot see. People who spent their lives coveting what others had now can't see anything at all. They sit leaning on each other's shoulders, praying together.", "highlight": "eyes sewn shut"},
            {"speaker": "cosmii", "text": "Terrace 3 is wrath. It's filled with impossibly thick smoke — you can't see a hand in front of your face. People who were blinded by rage now literally can't see through the smoke. And in that darkness, they're singing prayers of peace.", "highlight": "the smoke of wrath"},
            {"speaker": "cosmii", "text": "See the pattern? Every punishment in Purgatory is an inversion. Pride → forced to bow. Envy → can't see. Wrath → blinded by smoke. And all of it is healing. Like painful surgery at a hospital — you endure it because you know you'll recover.", "highlight": "the inversion principle"},
        ],
        "quizzes": [
            {
                "question": "Why do souls in Purgatory endure their suffering?",
                "options": ["They have no choice", "They voluntarily choose it because passing through leads to Paradise", "It hurts less than Hell", "It ends automatically over time"],
                "correct_index": 1,
                "explanation": "Hell's suffering is purposeless and eternal. Purgatory's suffering is a voluntary choice toward purification. It has an end and a goal — that's why it's bearable. The difference is hope."
            },
            {
                "question": "Why are the envious souls' eyes sewn shut with wire on terrace 2?",
                "options": ["As punishment", "They spent their lives coveting others' possessions, so now they can't see and must learn to rely on each other", "They're afraid of the dark", "To protect their eyes"],
                "correct_index": 1,
                "explanation": "Eyes that spent a lifetime looking enviously at what others had are now sealed shut. Without sight, they must lean on each other — and in doing so, they learn the opposite of envy: brotherhood."
            },
        ],
    },

    # ── Lesson 16: Sloth to Lust ──
    4: {
        "title": "From Sloth to Lust — Purgatory Terraces 4 Through 7",
        "chapter_title": "Upper Purgatory",
        "spark": "The second half of the mountain. The lazy run endlessly, the greedy lie face-down weeping, and at the very end — a wall of fire to walk through.",
        "cliffhanger": "In the Earthly Paradise, Virgil quietly says goodbye. And out of the light, Beatrice appears — but this is no tender reunion.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Terrace 4 is sloth. What are the lazy souls doing? Running flat-out without stopping! Shouting: 'Faster! Faster! We can't waste any more time — we were lazy with love!' The opposite of laziness — constant motion — is how they purify themselves.", "highlight": "the running slothful"},
            {"speaker": "cosmii", "text": "Terrace 5 is greed. Souls lie completely face-down on the ground, noses in the dirt. People who only looked down at material things in life now can't look up at the sky. They're weeping while reciting psalms.", "highlight": "the prostrate greedy"},
            {"speaker": "cosmii", "text": "Here Dante meets the poet Statius! A Roman poet who's just finished cleansing his sins and is about to ascend to Paradise. The twist? He converted to Christianity after reading Virgil's poetry. The master's work saved the student.", "highlight": "Statius"},
            {"speaker": "cosmii", "text": "Terrace 6 is gluttony. Fragrant fruit trees line the path, but the souls can't reach them. They're starving — the food is right there — but they can't eat. The souls are so emaciated their eye sockets look like rings with the gems missing.", "highlight": "unreachable fruit"},
            {"speaker": "cosmii", "text": "Terrace 7, the final one — lust. This is a wall of fire. You have to walk straight through the flames. Dante is frozen with fear, can't take a single step. Virgil says: 'Beatrice is on the other side of this fire.' That one sentence sends Dante straight into the blaze.", "highlight": "the wall of fire"},
            {"speaker": "cosmii", "text": "Every terrace cleared! When they reach the mountain's summit — it's the Garden of Eden. The Earthly Paradise. Flowers blooming, birds singing, a perfect forest. And here, something that will change Dante's life: a farewell and a reunion happen at the same time.", "highlight": "the Earthly Paradise"},
        ],
        "quizzes": [
            {
                "question": "What finally made Dante walk through the wall of fire on the last terrace?",
                "options": ["The fire wasn't hot", "Virgil told him 'Beatrice is on the other side'", "There was no other path", "An angel helped him"],
                "correct_index": 1,
                "explanation": "Love conquered fear. The hope of seeing Beatrice again overpowered the terror of fire. That's Purgatory's core message in one scene — love gives you the strength to endure any suffering."
            },
            {
                "question": "Why are the slothful souls on terrace 4 running nonstop?",
                "options": ["Exercise is healthy", "They were lazy in life, so the opposite — relentless motion — is how they purify themselves", "They're running away", "It's a race"],
                "correct_index": 1,
                "explanation": "Purgatory's punishments follow the 'inversion' principle. People who were lazy learn the opposite — passionate, tireless movement — as their path to purification."
            },
        ],
    },

    # ── Lesson 17: Virgil's Farewell ──
    5: {
        "title": "Virgil's Farewell — Where the Teacher Can Go No Further",
        "chapter_title": "Earthly Paradise",
        "spark": "At the summit of Purgatory, the Earthly Paradise. The teacher quietly vanishes, and Beatrice appears in a blaze of light — but she doesn't embrace Dante. She scolds him through tears.",
        "cliffhanger": "After his tearful confession, Dante is cleansed in two rivers. One erases the memory of sin. The other restores the memory of good.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Through the wall of fire and up to the summit of Mount Purgatory — the Earthly Paradise. The Garden of Eden itself. Flowers blooming, birds singing, crystal streams flowing. Absolute perfection.", "highlight": "the Garden of Eden"},
            {"speaker": "cosmii", "text": "But Virgil stops. This time it's really the end. 'Your will is now free, upright, and sound. You are your own crown and your own miter.' He's declaring that Dante no longer needs a teacher. Bittersweet — but it means Dante has truly grown.", "highlight": "you are your own crown"},
            {"speaker": "cosmii", "text": "Dante turns around — and Virgil is gone. Just gone. 'Virgil! Virgil!' he cries out. No answer. The teacher who stood by his side through every horror of Hell has left without a word.", "highlight": None},
            {"speaker": "cosmii", "text": "As tears stream down Dante's face — a procession of light descends from the sky. Flower petals rain down, angels sing. A woman dressed in green, white, and red sits upon a chariot of light. It's Beatrice!", "highlight": "the chariot of light"},
            {"speaker": "cosmii", "text": "You'd expect a heartwarming reunion, right? Hugs, happy tears? Nope. Beatrice looks at Dante and says: 'Look at me. Yes, I am Beatrice. How dare you come here? Don't you know that to climb the mountain of happiness, you must BE happy?' She's scolding him.", "highlight": "Beatrice's rebuke"},
            {"speaker": "cosmii", "text": "After Beatrice died, Dante strayed from the right path. He gave his heart to other women, got lost in worldly pursuits. This isn't a joyful reunion — it's a reckoning. She's harsh BECAUSE she loves him. That's what real love looks like.", "highlight": "love's severity"},
        ],
        "quizzes": [
            {
                "question": "What does Virgil's final declaration — 'You are your own crown' — mean?",
                "options": ["He's handing Dante a kingdom", "Dante has grown enough to guide himself without a teacher", "He's expressing sadness about parting", "Dante should rule the Earthly Paradise"],
                "correct_index": 1,
                "explanation": "This is the completion of education. The student has grown to the point where the teacher is no longer needed. It's bittersweet, but it's the most beautiful diploma anyone could receive."
            },
            {
                "question": "Why does Beatrice scold Dante immediately upon reuniting?",
                "options": ["Dante arrived too late", "After her death Dante strayed from the right path, and she rebukes him harshly because she truly loves him", "She didn't like that he brought Virgil", "She didn't approve of his outfit"],
                "correct_index": 1,
                "explanation": "The reunion is a reckoning, not a hug. Beatrice is harsh because she loves him. Real love doesn't coddle — it sets you straight."
            },
        ],
    },

    # ── Lesson 18: The Earthly Paradise ──
    6: {
        "title": "The Earthly Paradise — The Rivers Lethe and Eunoe",
        "chapter_title": "Earthly Paradise",
        "spark": "Lethe erases the memory of sin. Eunoe restores the memory of good. Cleansed in both rivers, Dante is reborn — 'pure and ready to climb to the stars.'",
        "cliffhanger": "Ascending toward the stars, Dante opens the gates of Paradise with Beatrice. Nine celestial spheres unfold, starting from the Moon.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Facing Beatrice's rebuke, Dante breaks down. He confesses his failings through tears. True, sincere repentance. Beatrice tells him: 'Save your tears for another blade. They are not yet enough.' Harsh, but necessary.", "highlight": "Dante's confession"},
            {"speaker": "cosmii", "text": "Two rivers appear. The first is the river Lethe — you know it from Greek mythology as the river of forgetting? Here it washes away the memory of sin. When Dante is immersed in its waters, every memory of his wrongdoing dissolves. A clean slate.", "highlight": "Lethe — forgetting sin"},
            {"speaker": "cosmii", "text": "The second is the river Eunoe — and this one Dante invented. It doesn't exist in Greek mythology. It means 'good memory.' Drink from this river and your memories of every good deed you've ever done come flooding back, vivid and alive. Forget the bad, remember the good.", "highlight": "Eunoe — remembering good"},
            {"speaker": "cosmii", "text": "Isn't that genius? Complete purification isn't just erasing bad memories — it also requires restoring the good ones. You need both rivers. One alone isn't enough.", "highlight": None},
            {"speaker": "cosmii", "text": "Between the two rivers, a massive allegorical procession passes by — symbolizing the history of the Church. A chariot, an eagle, a fox, a dragon — each representing the Church's corruption and decline. Even on the doorstep of Paradise, Dante is criticizing Church power. That courage.", "highlight": "Church critique"},
            {"speaker": "cosmii", "text": "Cleansed in both rivers, Dante stands renewed. The very last line of Purgatorio: 'I came back pure and ready to climb to the stars.' It ends with the word 'stars.' Inferno ended with 'stars.' Purgatorio ends with 'stars.' Paradiso will end with 'stars.' All three.", "highlight": "ready for the stars"},
        ],
        "quizzes": [
            {
                "question": "Why are BOTH the rivers Lethe and Eunoe necessary?",
                "options": ["One is hot and one is cold", "Complete purification requires both forgetting sin and restoring the memory of good", "One is for swimming, the other for drinking", "They're just decorative"],
                "correct_index": 1,
                "explanation": "Dante's brilliant insight: erasing the bad isn't enough. You must also restore the good. Only when both happen together is purification truly complete. The two rivers are always a set."
            },
            {
                "question": "Why do Inferno, Purgatorio, and Paradiso ALL end with the word 'stars' (stelle)?",
                "options": ["Coincidence", "Stars symbolize hope and the divine — all three books are ultimately a journey toward light", "Dante was an astronomer", "For the sake of rhyme"],
                "correct_index": 1,
                "explanation": "Dante deliberately ended all three books with 'stars.' The stars you see leaving Hell, the stars you approach climbing Purgatory, the stars you reach in Paradise — the entire journey from darkness to light is compressed into that one word."
            },
        ],
    },

    # ── Lesson 19: Moon to Sun ──
    7: {
        "title": "From the Moon to the Sun — The First Four Heavens",
        "chapter_title": "Lower Paradise",
        "spark": "Every soul in Paradise is perfectly happy — they just shine at different levels of brightness.",
        "cliffhanger": "In the fifth heaven, Mars, Dante discovers a family secret — his great-great-grandfather appears and prophesies Dante's future.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Paradise is made up of nine concentric heavens, each containing a planet. Souls appear in each heaven to greet Dante. The first heaven? The Moon.", "highlight": "nine heavens"},
            {"speaker": "cosmii", "text": "In the Moon's heaven, Dante meets a woman named Piccarda. She wanted to become a nun but was forced into marriage. Because she couldn't keep her vow, she's in the lowest heaven. Dante asks her: 'Don't you wish you were higher up?'", "highlight": "Piccarda"},
            {"speaker": "cosmii", "text": "Piccarda's answer IS the key to all of Paradise: 'Our wills have been made peaceful by the power of love. We do not desire anything beyond what we have.' Every soul in Paradise is perfectly happy exactly where they are. Hell is eternal dissatisfaction. Paradise is perfect contentment.", "highlight": "perfect contentment"},
            {"speaker": "cosmii", "text": "Mercury's heaven — souls who did good for the sake of fame. Venus's heaven — souls who burned with the passion of love. With each sphere, the light grows stronger. The souls shine brighter and brighter.", "highlight": None},
            {"speaker": "cosmii", "text": "The fourth heaven — the Sun — is where the great theologians gather! Thomas Aquinas, Solomon... the greatest minds in human history. Luminous souls form a circle around Dante and dance. In Hell, the great figures sighed. In Paradise, they dance and sing.", "highlight": "the dancing theologians"},
            {"speaker": "cosmii", "text": "And Beatrice grows more beautiful with every level they climb. The light intensifies until looking directly at her becomes almost impossible. Dante keeps saying: 'Her smile is so radiant it could burn my eyes.' Love expressed as pure light.", "highlight": "Beatrice's smile"},
        ],
        "quizzes": [
            {
                "question": "What does Piccarda mean when she says 'I don't desire anything higher'?",
                "options": ["She's given up", "Every soul in Paradise is perfectly happy in its place — desiring more doesn't exist", "It's a virtue of humility", "She can't ascend"],
                "correct_index": 1,
                "explanation": "This is THE core principle of Paradise. Every soul experiences perfect happiness exactly where it is. The concept of 'wanting more' simply doesn't exist. If Hell is eternal dissatisfaction, Paradise is absolute fulfillment."
            },
            {
                "question": "Why do souls in Paradise appear as light?",
                "options": ["A physical phenomenon", "They reflect God's love, and the higher the heaven, the brighter they shine", "Dante's eyesight was poor", "Decorative effect"],
                "correct_index": 1,
                "explanation": "Souls in Paradise reflect God's love like mirrors. The more perfectly they reflect it, the brighter they shine. Brightness equals depth of love."
            },
        ],
    },

    # ── Lesson 20: Mars to Saturn ──
    8: {
        "title": "From Mars to Saturn — Warriors, Justice, Contemplation",
        "chapter_title": "Middle Paradise",
        "spark": "Dante's great-great-grandfather Cacciaguida, met in Mars, prophesies Dante's future: 'You will learn how salty another person's bread tastes.'",
        "cliffhanger": "The eighth heaven — the Fixed Stars. Here Dante faces his final exams. Saints Peter, James, and John are the examiners.",
        "dialogue": [
            {"speaker": "cosmii", "text": "The fifth heaven — Mars. This is where warriors who fought for faith reside. Luminous souls form the shape of a massive cross — and from that cross, hymns resound. It's so beautiful Dante is speechless.", "highlight": "the cross of light"},
            {"speaker": "cosmii", "text": "One soul rockets toward him from the cross. 'O my blood! O grace of God poured overflowing!' It's Cacciaguida — Dante's great-great-grandfather! He died in the Crusades about 150 years earlier.", "highlight": "Cacciaguida"},
            {"speaker": "cosmii", "text": "Cacciaguida reminisces about old Florence — a simpler, more honest time. He laments the city's current corruption. And then comes Dante's deepest personal wound — Cacciaguida prophesies Dante's exile.", "highlight": None},
            {"speaker": "cosmii", "text": "'You shall leave behind everything you love most dearly. You will learn how hard it is to climb another person's stairs, and how salty another person's bread tastes.' Exiled from home, surviving on others' charity. And that's exactly what happened to Dante in real life.", "highlight": "another person's bread"},
            {"speaker": "cosmii", "text": "The sixth heaven is Jupiter — the heaven of just rulers. The souls assemble into the shape of a giant eagle! This eagle speaks with a single voice about what justice truly means. Not individual souls speaking, but a community speaking as one.", "highlight": "the Eagle of Justice"},
            {"speaker": "cosmii", "text": "The seventh heaven is Saturn — the heaven of contemplatives. A golden ladder stretches upward into infinity — its top can't be seen. Saints like Peter Damian reside here. From this point, sound disappears. Paradise is so high that it transcends even music.", "highlight": "the golden ladder"},
        ],
        "quizzes": [
            {
                "question": "What does Cacciaguida's prophecy — 'how salty another person's bread tastes' — mean?",
                "options": ["The bread is bad", "The bitterness of exile — being driven from home and surviving on others' charity", "Salt was expensive", "Health advice"],
                "correct_index": 1,
                "explanation": "This prophecy directly mirrors Dante's real life. Exiled from Florence, he wandered Italy living off noble patrons' generosity. 'The saltiness of another's bread' captures the loneliness and shame of depending on others."
            },
            {
                "question": "What does it mean that souls in Jupiter form an eagle and speak with 'one voice'?",
                "options": ["The eagle is Rome's symbol", "True justice is achieved not by individuals alone but by a community in harmony", "They like birds", "Decorative effect"],
                "correct_index": 1,
                "explanation": "Individual souls merging into one eagle that speaks with one voice means genuine justice isn't about one person's judgment — it's realized through the harmony of community. That's Dante's message."
            },
        ],
    },

    # ── Lesson 21: The Exams in the Fixed Stars ──
    9: {
        "title": "The Exams in the Fixed Stars — Faith, Hope, and Love",
        "chapter_title": "Upper Paradise",
        "spark": "At the highest reaches of Paradise, three saints test Dante — on faith, hope, and love. This is the PhD defense of the spiritual journey.",
        "cliffhanger": "Past the ninth heaven — at last, the realm beyond all heavens: the Empyrean. There, Dante sees the eternal Rose of Light.",
        "dialogue": [
            {"speaker": "cosmii", "text": "The eighth heaven — the Fixed Stars. We're past individual planets now; this is the realm of stars themselves. And here, something huge happens: three saints give Dante an exam. Think of it as the PhD oral defense for his entire spiritual journey!", "highlight": "the spiritual PhD defense"},
            {"speaker": "cosmii", "text": "First examiner — Saint Peter. Subject: Faith. 'What is faith?' Dante answers: 'Faith is the substance of things hoped for, the evidence of things not seen.' Quoting Hebrews directly. Saint Peter is so pleased he circles Dante three times. Pass!", "highlight": "Saint Peter's exam"},
            {"speaker": "cosmii", "text": "Second examiner — Saint James. Subject: Hope. 'What is hope, and how does it shine within you?' Dante answers: Hope is the sure expectation of future glory. He backs it up with psalms and scripture. Pass!", "highlight": "Saint James's exam"},
            {"speaker": "cosmii", "text": "Third examiner — Saint John. Subject: Love. The most important test. 'Where does your love come from?' Dante answers: from God, the source of all goodness, and from the realization that everything beautiful in this world reflects God's love.", "highlight": "Saint John's exam"},
            {"speaker": "cosmii", "text": "After passing all three — Adam appears! The very first human being. He talks about his time in the Garden of Eden — he only spent six hours there before the Fall. He even discusses the first language ever spoken.", "highlight": "Adam appears"},
            {"speaker": "cosmii", "text": "What do these exams mean? Hell was about SEEING sin. Purgatory was about CLEANSING sin. These exams in Paradise are about PROVING what you've learned. Faith, hope, love — the three theological virtues — and Dante must demonstrate he's fully internalized them all.", "highlight": "proving the journey"},
        ],
        "quizzes": [
            {
                "question": "Why are the three exams given in the order faith → hope → love?",
                "options": ["Alphabetical order", "Faith is the foundation, hope follows, and love — the greatest virtue — comes last as the climax", "By the examiners' age", "No particular reason"],
                "correct_index": 1,
                "explanation": "1 Corinthians says: 'And now these three remain: faith, hope, and love. But the greatest of these is love.' Love comes last because it's the most important — the ultimate climax."
            },
            {
                "question": "What did Dante identify as the 'source of love'?",
                "options": ["Beatrice", "God as the source of all goodness, and the realization that the world's beauty reflects God's love", "Family", "Italy"],
                "correct_index": 1,
                "explanation": "Dante's love starts personal but expands to the cosmic. Everything beautiful in the world is a reflection of God's love — recognizing that is the core of his answer."
            },
        ],
    },

    # ── Lesson 22: The Celestial Rose ──
    10: {
        "title": "The Celestial Rose — Where All Blessed Souls Gather",
        "chapter_title": "Empyrean",
        "spark": "Beyond all the heavens, the Empyrean. Blessed souls sit in a vast rose-shaped amphitheater, and at its center — a point of blinding light.",
        "cliffhanger": "With all guides' work complete, Dante finally sees the face of God. The most awe-inspiring attempt in 700 years to describe the divine.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Past the ninth heaven — the Primum Mobile — we reach the end of the material universe. Beyond it lies the Empyrean. A world of pure light that transcends time and space.", "highlight": "the Empyrean"},
            {"speaker": "cosmii", "text": "The moment Dante enters the Empyrean — a river of light appears. Light flowing like water. On both banks, jewel-like flowers bloom and sparks dart between the petals. When Dante dips his eyes into the river of light — everything transforms.", "highlight": "the river of light"},
            {"speaker": "cosmii", "text": "The river of light reshapes into an enormous circle. That circle is the Celestial Rose. Blessed souls sit in a vast, rose-shaped amphitheater. Tens of thousands of souls, each one shining, forming one perfect flower.", "highlight": "the Celestial Rose"},
            {"speaker": "cosmii", "text": "And here comes another farewell. Beatrice quietly returns to her seat. Dante looks up — and there she is, on one petal of the rose, smiling down at him. Even she can go no further.", "highlight": "Beatrice's farewell"},
            {"speaker": "cosmii", "text": "A new guide appears — Saint Bernard of Clairvaux, the monk famous for his devotion to the Virgin Mary. Why Bernard? Because this final step — directly seeing God — requires something beyond even love. It requires prayer and divine grace.", "highlight": "Saint Bernard"},
            {"speaker": "cosmii", "text": "Reason (Virgil) → Love (Beatrice) → Grace (Saint Bernard). The succession of three guides tells the entire story of the Divine Comedy. Reason has limits; love takes you higher; but to see God, you ultimately need God's own grace.", "highlight": "three guides"},
        ],
        "quizzes": [
            {
                "question": "What does the rose shape of the Celestial Rose symbolize?",
                "options": ["Dante liked flowers", "All blessed souls form one beautiful community opening toward the central light of God", "Roses were expensive in medieval times", "No particular meaning"],
                "correct_index": 1,
                "explanation": "Just as a rose's petals open toward its center, all blessed souls are oriented around the divine light at the center, forming one perfect community. Individual yet unified."
            },
            {
                "question": "What do the Divine Comedy's three guides — Virgil, Beatrice, Saint Bernard — symbolize?",
                "options": ["Past, present, future", "Reason, love, and grace — the three stages of reaching God", "Three academic disciplines", "Three languages"],
                "correct_index": 1,
                "explanation": "Reason (Virgil) navigates Hell and Purgatory. Love (Beatrice) ascends through Paradise. Grace (Saint Bernard) enables the final vision of God. These three stages ARE the structure of the Divine Comedy."
            },
        ],
    },

    # ── Lesson 23: The Face of God ──
    11: {
        "title": "The Face of God — The End of All Journeys",
        "chapter_title": "Empyrean",
        "spark": "Three shining circles, and within one — a human face. Dante tries to describe what he sees, but language itself collapses.",
        "cliffhanger": "",
        "dialogue": [
            {"speaker": "cosmii", "text": "Saint Bernard prays to the Virgin Mary — one of the most beautiful prayers in all of the Comedy. It opens: 'Virgin Mother, daughter of your Son.' A paradox, but that paradox IS the heart of the mystery. Mary answers the prayer — and Dante's eyes are opened.", "highlight": "the prayer to Mary"},
            {"speaker": "cosmii", "text": "And then Dante finally sees it — three shining circles of light. Different colors, same size. The Holy Trinity — Father, Son, Holy Spirit. One and three. Three and one. The ultimate mystery.", "highlight": "three circles"},
            {"speaker": "cosmii", "text": "Within the second circle — a human face appears. The Incarnation. The core Christian doctrine that God became human, rendered as an image of light. Dante tries to understand it — like a mathematician trying to square the circle — but it's beyond comprehension.", "highlight": "a human face in the light"},
            {"speaker": "cosmii", "text": "And then Dante's language breaks down. 'I saw, but I cannot tell.' This is the most honest confession in the entire poem. A genius poet who spent 14,000 lines describing everything — and at the final moment he surrenders: 'Words cannot capture this.'", "highlight": "the limits of language"},
            {"speaker": "cosmii", "text": "In the final moment, Dante's will and desire — like a wheel spinning in perfect balance — are moved by a single force. And then comes the very last line of the entire Comedy — all 100 cantos, 14,233 lines — ending with: 'The Love that moves the sun and the other stars.'", "highlight": "the final line"},
            {"speaker": "cosmii", "text": "That one line says everything. The force that drives the entire universe is love. Starting from a dark wood, descending to the pit of Hell, passing through Purgatory's fire, climbing through Paradise's starlight — Dante's entire journey arrives at a single word: Love. 100 cantos. One word. Thank you so, so much for reading this with me!", "highlight": None},
        ],
        "quizzes": [
            {
                "question": "What does it mean that Dante — after 14,000 lines — says 'I cannot express what I saw'?",
                "options": ["Dante lacked skill", "Some experiences genuinely transcend human language — and his admission paradoxically proves the experience's magnitude", "He ran out of space", "Censorship"],
                "correct_index": 1,
                "explanation": "A genius poet who described everything for 14,000 lines admitting 'I can't say it' at the very end — that silence itself proves how far beyond words the experience is. Sometimes silence is the most powerful expression."
            },
            {
                "question": "What does the final line — 'the Love that moves the sun and the other stars' — mean?",
                "options": ["Solar system physics", "The fundamental force driving the universe is love, and Dante's entire 100-canto journey was undertaken to arrive at this realization", "A constellation story", "Astronomical knowledge"],
                "correct_index": 1,
                "explanation": "The journey that began in a dark wood ends here. Through Hell's darkness, Purgatory's pain, Paradise's light — the ultimate force behind it all is Love. This single line is why the poem has been read for 700 years."
            },
        ],
    },
}


LESSONS.extend(NEW_LESSONS_KO)
TRANSLATIONS_EN.update({12 + k: v for k, v in NEW_TRANSLATIONS_EN.items()})


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
