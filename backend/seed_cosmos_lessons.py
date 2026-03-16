"""Seed handcrafted demo lessons for Cosmos by Carl Sagan."""
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

BOOK_ID = "afd7a4b0"

COVER_URL = "https://covers.openlibrary.org/b/isbn/9780345539434-L.jpg"


def ensure_book():
    sb = get_supabase()
    sb.table("books").upsert({
        "id": BOOK_ID,
        "title": "코스모스",
        "author": "칼 세이건",
        "color": "#8b5cf6",
    }).execute()
    print("✓ Ensured book entry exists")


def ensure_cover():
    covers_dir = settings.covers_dir
    covers_dir.mkdir(parents=True, exist_ok=True)
    cover_path = covers_dir / f"{BOOK_ID}.jpg"
    if not cover_path.exists():
        try:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            req = urllib.request.Request(COVER_URL, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, context=ctx) as resp:
                cover_path.write_bytes(resp.read())
            print(f"  ✓ Saved cover to {cover_path}")
        except Exception as e:
            print(f"  ⚠ Could not download cover: {e}")

    sb = get_supabase()
    sb.table("books").update({
        "cover_url": f"/covers/{BOOK_ID}.jpg",
        "author": "칼 세이건",
    }).eq("id", BOOK_ID).execute()
    print("  ✓ Updated book cover_url & author in DB")


# ══════════════════════════════════════════════════════════════
# LESSONS — Korean content
# ══════════════════════════════════════════════════════════════

LESSONS = [

    # ══════════════════════════════════════════
    # 1부: 우주의 바닷가
    # ══════════════════════════════════════════

    # ── Ch.1 우주의 바닷가 (Part 1/2) ──
    {
        "title": "코스모스 달력 — 138억 년을 하루에 압축하면",
        "chapter": "Ch.1 The Shores of the Cosmic Ocean",
        "chapter_title": "우주의 바닷가",
        "part": 1, "total_parts": 2,
        "spark": "138억 년 우주 역사를 1년 달력에 압축하면, 인류의 모든 역사는 12월 31일 밤 11시 59분 59초에 시작된다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "코스모스의 시작은 이 질문이야 — 우주는 대체 얼마나 오래됐을까? 칼 세이건은 이걸 실감나게 설명하려고 기가 막힌 비유를 만들어. '코스모스 달력'이야.", "highlight": None},
            {"speaker": "cosmii", "text": "138억 년 우주 역사를 1년 달력에 압축해봐. 1월 1일 자정 — 빅뱅. 칠흑 같은 어둠 속에 고밀도 에너지가 응축돼 있다가 뻥 하고 대폭발이 일어나. 이걸 우리는 빅뱅이라고 불러.", "highlight": "빅뱅"},
            {"speaker": "cosmii", "text": "폭발의 파편들이 퍼져나가면서 뭉치기 시작해. 10억 년쯤 지나면 거대한 덩어리들이 형성되는데 — 은하야. 우리 은하에만 별이 1,000억~4,000억 개가 있어. 그중 하나가 태양이고, 태양 주변을 수금지화목토천해가 돌고 있지.", "highlight": "은하의 탄생"},
            {"speaker": "cosmii", "text": "지구에 생명이 처음 등장한 건 9월쯤이야. 공룡은 12월 25일에 나타나고, 12월 30일에 멸종해. 그리고 인류? 12월 31일 밤 10시 30분에 겨우 등장해.", "highlight": "12월 31일의 인류"},
            {"speaker": "cosmii", "text": "인류 문명의 모든 역사 — 피라미드, 로마, 세계대전, 스마트폰까지 — 이 모든 게 12월 31일 마지막 1초 안에 들어가. 이게 우주에서 인간이 차지하는 시간이야.", "highlight": "마지막 1초"},
            {"speaker": "cosmii", "text": "칼 세이건은 이 광활한 우주 속 지구를 뭐라고 불렀을까? '창백한 푸른 점(Pale Blue Dot)'. 보이저 1호가 64억 km 밖에서 찍은 지구 사진 — 먼지보다 작은 점 하나. 그게 우리가 사는 곳이야.", "highlight": "창백한 푸른 점"}
        ],
        "quizzes": [
            {
                "question": "코스모스 달력에서 인류가 등장하는 시점은?",
                "options": ["1월 1일", "12월 31일 밤 10시 30분경", "6월 15일", "12월 25일"],
                "correct_index": 1,
                "explanation": "138억 년을 1년으로 압축하면, 인류는 12월 31일 밤 10시 30분에 겨우 등장해. 인류 문명 전체는 마지막 1초 안에 들어갈 정도로 우주에서 우리의 시간은 짧아."
            },
            {
                "question": "'창백한 푸른 점'은 무엇을 가리키는 말인가?",
                "options": ["달", "지구", "금성", "화성"],
                "correct_index": 1,
                "explanation": "보이저 1호가 64억 km 밖에서 찍은 사진에서 지구는 먼지보다 작은 점으로 보였어. 칼 세이건은 이걸 '창백한 푸른 점'이라고 불렀지."
            }
        ],
        "cliffhanger": "우리가 이 광활한 우주의 먼지 같은 존재라면 — 왜 그렇게 많은 나라들이 국기에 별을 그려 넣었을까? 다음은 '별에서 온 그대' 이야기야."
    },

    # ── Ch.1 우주의 바닷가 (Part 2/2) ──
    {
        "title": "별에서 온 그대 — 우리 몸은 별의 잔해로 만들어졌다",
        "chapter": "Ch.1 The Shores of the Cosmic Ocean",
        "chapter_title": "우주의 바닷가",
        "part": 2, "total_parts": 2,
        "spark": "미국 국기에는 별이 50개, 중국은 5개, 브라질에는 아예 별자리가 그려져 있다. 인간은 왜 이렇게 별에 집착할까?",
        "dialogue": [
            {"speaker": "cosmii", "text": "세계 국기를 한번 봐봐. 미국 국기에는 별 50개, 터키와 이스라엘에는 1개, 중국은 5개, 브라질에는 아예 하늘의 별자리가 그려져 있어. 그리고 우리나라 태극기? 우주의 원리 자체를 담고 있지.", "highlight": "국기 속의 별"},
            {"speaker": "cosmii", "text": "인간은 선사시대부터 별을 바라봤어. 우리나라 고인돌 위에도 별자리가 새겨져 있거든. 수만 년 전부터 인류는 밤하늘을 그리워하고 있었던 거야.", "highlight": "고인돌의 별자리"},
            {"speaker": "cosmii", "text": "근데 왜? 칼 세이건의 대답이 소름이 돋아 — '우리가 별에서 왔기 때문이다.' 이건 시적인 표현이 아니야. 과학적 사실이야.", "highlight": None},
            {"speaker": "cosmii", "text": "우리 몸을 구성하는 탄소, 질소, 산소, 철 — 이 원소들은 전부 별 내부의 핵융합에서 만들어진 거야. 별이 죽으면서 폭발할 때(초신성 폭발) 이 원소들이 우주로 흩뿌려져. 그게 모여서 지구가 됐고, 생명이 됐고, 너와 내가 된 거야.", "highlight": "별의 원소"},
            {"speaker": "cosmii", "text": "칼 세이건의 명문장이야 — 'We are made of star stuff(우리는 별의 먼지로 만들어졌다).' 네 몸의 철은 수십억 년 전 죽은 별의 내부에 있었어. 네 피에 흐르는 철분이 별의 심장에서 왔다는 거야.", "highlight": "We are star stuff"},
            {"speaker": "cosmii", "text": "그러니까 밤하늘의 별을 보면서 그리움을 느끼는 건 당연해. 그건 고향을 그리워하는 거거든. 우리는 모두 별의 아들이자 딸이니까.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "칼 세이건이 'We are made of star stuff'라고 한 이유는?",
                "options": ["인간이 별처럼 빛나서", "인간 몸의 원소가 별 내부의 핵융합에서 만들어졌기 때문에", "인간이 별을 좋아하니까", "별이 인간을 창조했다는 신화 때문에"],
                "correct_index": 1,
                "explanation": "탄소, 질소, 산소, 철 등 우리 몸의 원소는 별 내부 핵융합으로 만들어졌어. 별이 폭발하면서 흩뿌려진 원소가 모여 지구와 생명이 된 거야."
            },
            {
                "question": "한국의 고인돌에서 발견된 것은?",
                "options": ["고대 문자", "별자리 새김", "동물 그림", "지도"],
                "correct_index": 1,
                "explanation": "한국의 고인돌 위에 별자리가 새겨져 있어. 선사시대부터 인류는 밤하늘을 관측하고 기록했다는 증거야."
            }
        ],
        "cliffhanger": "별의 자식인 인류가 처음으로 과학적으로 밤하늘을 연구하기 시작한 곳이 있어. 지금으로부터 2,500년 전, 에게해의 보석 같은 섬들에서."
    },

    # ══════════════════════════════════════════
    # 2부: 과학의 탄생
    # ══════════════════════════════════════════

    # ── Ch.2 과학의 탄생 (Part 1/3) ──
    {
        "title": "이오니아의 각성 — 과학이 처음 싹튼 곳",
        "chapter": "Ch.2 The Backbone of Night",
        "chapter_title": "과학의 탄생",
        "part": 1, "total_parts": 3,
        "spark": "2,500년 전 그리스 남부와 터키가 맞닿는 바다에 보석 같은 섬들이 있었다. 여기서 인류 최초로 '세상은 신이 아니라 자연법칙으로 움직인다'는 생각이 태어났다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "인간이 밤하늘을 올려다본 건 수만 년 전부터야. 하지만 대부분 종교적 접근이었지 — 별은 신의 뜻이라고 생각했으니까. 그렇다면 인간이 언제부터 '과학적으로' 하늘을 보기 시작했을까?", "highlight": None},
            {"speaker": "cosmii", "text": "지금으로부터 약 2,500년 전. 그리스 남부와 터키가 맞닿는 에게해에 작지만 보석 같은 섬들이 있었어. 이곳을 '이오니아'라고 불러. 바로 여기서 인류의 과학이 태어난 거야.", "highlight": "이오니아"},
            {"speaker": "cosmii", "text": "이오니아 사람들이 어떤 혁명적인 생각을 했냐면 — '세상에 일어나는 현상은 신이 아니라 자연의 법칙으로 설명할 수 있다.' 비가 오는 건 제우스가 화난 게 아니라 물의 순환 때문이라는 거야.", "highlight": "자연법칙"},
            {"speaker": "cosmii", "text": "칼 세이건은 이걸 '이오니아의 각성'이라고 불러. 왜 하필 여기였을까? 이오니아는 무역의 중심지였거든. 이집트, 페르시아, 바빌론의 지식이 이 섬들로 흘러들어왔어. 다양한 문화가 만나면서 '어느 신이 맞는 거야?' 하는 의문이 자연스럽게 생긴 거지.", "highlight": "무역과 다문화"},
            {"speaker": "cosmii", "text": "놀라운 건 이 시대에 이미 '지구는 둥글다', '지구가 태양 주위를 돈다'는 생각이 있었다는 거야. 2,500년 전에! 코페르니쿠스보다 2,000년이나 앞서서!", "highlight": "2,000년 앞선 생각"},
            {"speaker": "cosmii", "text": "칼 세이건이 가장 아끼는 시대가 바로 이 이오니아야. 인류가 처음으로 미신 대신 이성을 선택한 순간. 과학의 진짜 출발점이지.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "이오니아에서 과학이 태어날 수 있었던 핵심 이유는?",
                "options": ["왕이 과학을 명령해서", "무역 중심지라 다양한 문화가 만나면서 기존 신화에 의문이 생겼기 때문에", "큰 도서관이 있어서", "날씨가 좋아서 별이 잘 보였기 때문에"],
                "correct_index": 1,
                "explanation": "이오니아는 이집트, 페르시아, 바빌론의 지식이 교류하는 무역 중심지였어. 다양한 신화가 충돌하면서 '세상을 자연법칙으로 설명하자'는 생각이 태어난 거야."
            },
            {
                "question": "'이오니아의 각성'이 의미하는 것은?",
                "options": ["그리스가 군사적으로 강해진 것", "인류가 최초로 미신 대신 자연법칙으로 세상을 설명하기 시작한 것", "이오니아에서 최초의 문자가 만들어진 것", "바다를 탐험하기 시작한 것"],
                "correct_index": 1,
                "explanation": "이오니아의 각성은 인류가 처음으로 신의 뜻이 아닌 자연의 법칙으로 세상을 이해하려 한 지적 혁명이야."
            }
        ],
        "cliffhanger": "이오니아에서 최초의 과학자들이 등장해. 세상의 근원은 물이라고 한 사람, 지구가 둥글다고 주장한 사람. 다음은 그 전설적인 인물들 이야기야."
    },

    # ── Ch.2 과학의 탄생 (Part 2/3) ──
    {
        "title": "탈레스에서 피타고라스까지 — 최초의 과학자들",
        "chapter": "Ch.2 The Backbone of Night",
        "chapter_title": "과학의 탄생",
        "part": 2, "total_parts": 3,
        "spark": "탈레스는 태양과 막대기 두 개만으로 피라미드 높이를 계산했다. 피타고라스는 '코스모스'라는 단어를 처음 쓴 사람이다 — 칼 세이건이 아니라.",
        "dialogue": [
            {"speaker": "cosmii", "text": "이오니아에서 최초의 과학자이자 철학자가 등장해. 탈레스. 이 사람이 뭐라고 했냐면 — '세상의 근원은 물이다.' 윤리 시간에 배웠지? 근데 중요한 건 답이 아니야. 질문 자체가 혁명이야.", "highlight": "탈레스"},
            {"speaker": "cosmii", "text": "'세상은 무엇으로 이루어져 있는가?' — 이 질문은 '신이 만들었다'를 거부하고, 물질적 원인을 찾겠다는 선언이야. 탈레스는 태양과 막대기의 그림자만으로 피라미드 높이를 계산했어. 지금도 다른 행성의 산 높이를 재는 데 같은 원리를 써.", "highlight": "그림자로 피라미드 측정"},
            {"speaker": "cosmii", "text": "그리고 또 한 명의 거인이 나타나. 피타고라스. 수학자이자 과학자이자 철학자야. 이 사람이 최초로 '지구는 둥글다'는 개념을 주장해.", "highlight": "피타고라스"},
            {"speaker": "cosmii", "text": "그리고 피타고라스가 최초로 쓴 단어가 있어 — '코스모스(Cosmos)'. 우주는 혼돈이 아니라 질서(코스모스)로 움직인다는 뜻이야. 이 책의 제목이 여기서 온 거야. 칼 세이건이 아니라 피타고라스가 먼저 쓴 단어라니!", "highlight": "코스모스의 어원"},
            {"speaker": "cosmii", "text": "데모크리토스라는 사람도 있어. 이 사람은 '세상은 더 이상 쪼갤 수 없는 작은 입자로 이루어져 있다'고 주장해. 그걸 '아토모스(atom, 원자)'라고 불렀어. 2,400년 전에 원자론을 제시한 거야!", "highlight": "데모크리토스와 원자"},
            {"speaker": "cosmii", "text": "이오니아의 과학자들이 이만큼 대단했어. 지구가 둥글고, 태양 주위를 돌고, 세상은 원자로 이루어져 있다 — 이 모든 걸 2,000년 뒤에야 '재발견'하게 돼. 그런데 왜 중간에 사라졌을까?", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "'코스모스(Cosmos)'라는 단어를 최초로 사용한 사람은?",
                "options": ["칼 세이건", "피타고라스", "탈레스", "아리스토텔레스"],
                "correct_index": 1,
                "explanation": "피타고라스가 '우주는 혼돈이 아니라 질서로 움직인다'는 의미로 코스모스라는 단어를 최초로 사용했어. 칼 세이건의 책 제목은 여기서 온 거야."
            },
            {
                "question": "데모크리토스가 2,400년 전에 주장한 것은?",
                "options": ["지구가 평평하다", "세상은 더 이상 쪼갤 수 없는 입자(원자)로 이루어져 있다", "별은 신의 눈이다", "우주는 무한히 팽창한다"],
                "correct_index": 1,
                "explanation": "데모크리토스는 모든 물질이 '아토모스(atom)'라는 최소 입자로 이루어져 있다고 주장했어. 현대 원자론의 원조야."
            }
        ],
        "cliffhanger": "이 놀라운 과학적 전통이 갑자기 사라져. 그 원인은 의외로 사회 구조에 있었어. 실험을 '천한 것'으로 본 사람들이 과학을 죽인 거야."
    },

    # ── Ch.2 과학의 탄생 (Part 3/3) ──
    {
        "title": "노예가 죽인 과학 — 실험은 천한 것이라는 편견",
        "chapter": "Ch.2 The Backbone of Night",
        "chapter_title": "과학의 탄생",
        "part": 3, "total_parts": 3,
        "spark": "플라톤과 아리스토텔레스 — '우리 과학자들이 하늘에 관심을 갖는 건 좋지만, 직접 관측하거나 실험하는 것은 노예에게 맡겨야 한다.'",
        "dialogue": [
            {"speaker": "cosmii", "text": "칼 세이건이 가장 분노하는 대목이 여기야. 이오니아의 눈부신 과학이 왜 사라졌을까? 전쟁 때문이 아니야. 사회 구조 때문이야.", "highlight": None},
            {"speaker": "cosmii", "text": "과학은 수많은 실험을 통해 진리에 도달하는 건데, 그리스 사회에서 실험을 뭐라고 생각했냐면 — '노동'이야. 귀족이 할 일이 아니라는 거지.", "highlight": "실험 = 노동"},
            {"speaker": "cosmii", "text": "플라톤이나 아리스토텔레스 같은 대철학자들도 이랬어 — '우리 과학자들이 하늘에 관심을 갖는 것까진 좋지만, 직접 관측하거나 실험하는 것은 노예에게 맡겨야 한다.' 생각만 하고 손은 더럽히지 않겠다는 거야.", "highlight": "플라톤의 편견"},
            {"speaker": "cosmii", "text": "이게 왜 치명적이냐면 — 과학은 '가설 → 실험 → 검증' 이 과정이 핵심이거든. 실험을 빼버리면 그냥 철학이야. 아무리 논리적인 가설이라도 실험 없이는 진짜인지 확인할 수 없어.", "highlight": "실험 없는 과학"},
            {"speaker": "cosmii", "text": "결과적으로 그리스 과학은 쇠퇴해. 관측과 실험을 천시한 대가야. 칼 세이건은 이걸 두고 이렇게 한탄해 — '이오니아의 불꽃이 꺼지면서, 인류는 1,000년 이상의 암흑기를 맞이한다.'", "highlight": "1,000년 암흑기"},
            {"speaker": "cosmii", "text": "이건 먼 옛날 이야기가 아니야. 지금도 '실용적인 것은 천하다'거나 '이론만이 고급이다'라는 편견이 있잖아. 칼 세이건은 이 교훈을 절대 잊지 말라고 경고해.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "이오니아 과학이 쇠퇴한 근본적 원인은?",
                "options": ["전쟁으로 과학자들이 죽어서", "실험과 관측을 노예의 일로 천시하는 사회 구조 때문에", "자연재해로 도서관이 파괴돼서", "종교가 과학을 금지해서"],
                "correct_index": 1,
                "explanation": "그리스 사회에서 실험을 '노동'으로 천시했어. 가설만 세우고 직접 검증하지 않으니 과학이 발전할 수 없었던 거야."
            },
            {
                "question": "칼 세이건이 강조한 과학의 핵심 과정은?",
                "options": ["기도 → 계시 → 믿음", "가설 → 실험 → 검증", "관찰 → 추측 → 토론", "독서 → 암기 → 시험"],
                "correct_index": 1,
                "explanation": "가설을 세우고 실험으로 검증하는 과정이 과학의 핵심이야. 실험을 빼면 과학은 그냥 철학이 되어버려."
            }
        ],
        "cliffhanger": "그리스 과학이 사라진 뒤, 기원전 300년경 새로운 과학의 중심지가 나타나. 알렉산더 대왕이 자신의 이름을 붙인 도시 — 알렉산드리아."
    },

    # ══════════════════════════════════════════
    # 3부: 알렉산드리아
    # ══════════════════════════════════════════

    # ── Ch.3 알렉산드리아 (Part 1/2) ──
    {
        "title": "알렉산드리아 도서관 — 인류 최초의 데이터베이스",
        "chapter": "Ch.3 Alexandria",
        "chapter_title": "알렉산드리아",
        "part": 1, "total_parts": 2,
        "spark": "알렉산드리아 항구에 배가 들어오면, 검문관이 제일 먼저 회수하는 것은 무기가 아니라 '책'이었다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "기원전 300년경, 이오니아의 과학이 꺼진 뒤 새로운 핫스팟이 나타나. 이집트의 알렉산드리아야. 알렉산더 대왕이 자기 이름을 붙인 도시지.", "highlight": "알렉산드리아"},
            {"speaker": "cosmii", "text": "알렉산더 대왕의 특징이 뭐냐면 — 개방적이야. 다종교, 다문화를 포용하는 오픈 마인드가 있었어. 징기스칸도 그렇고, 제국을 건설한 사람들의 공통점이 이거야.", "highlight": "개방적 제국"},
            {"speaker": "cosmii", "text": "알렉산더는 알렉산드리아를 '지구의 지식 허브'로 만들고 싶었어. 엄청난 재정적, 행정적 지원을 쏟아붓지. 그래서 세워진 게 역사상 가장 위대한 도서관 — 알렉산드리아 도서관이야.", "highlight": "지식 허브"},
            {"speaker": "cosmii", "text": "이 도서관이 지식을 모은 방법이 기가 막혀. 유럽, 아시아, 아프리카의 중심인 알렉산드리아 항구에 무역선이 들어오잖아? 검문검색할 때 무기가 아니라 '모든 기록물'을 회수해. 책이든, 두루마리든, 지도든!", "highlight": "책을 회수하다"},
            {"speaker": "cosmii", "text": "회수한 기록을 필사해서 사본은 돌려주고, 원본은 도서관에 보관했어. 이렇게 무려 50만 권의 데이터베이스가 쌓였어. 2,300년 전에 인류 최초의 지식 아카이브를 만든 거야.", "highlight": "50만 권"},
            {"speaker": "cosmii", "text": "여기서 에라토스테네스라는 천재가 막대기 두 개만으로 지구의 둘레를 계산해. 실제 값과 오차가 1% 이내야! 2,200년 전에! 실험과 관측의 힘이 바로 이거야.", "highlight": "에라토스테네스"}
        ],
        "quizzes": [
            {
                "question": "알렉산드리아 도서관이 지식을 수집한 독특한 방법은?",
                "options": ["학자들에게 직접 쓰게 했다", "항구에 입항하는 배에서 모든 기록물을 회수했다", "다른 나라 도서관을 약탈했다", "왕이 직접 여행하며 수집했다"],
                "correct_index": 1,
                "explanation": "알렉산드리아 항구에 들어오는 배에서 모든 기록물을 회수하고 필사해서 원본은 보관했어. 이렇게 50만 권의 데이터베이스가 만들어진 거야."
            },
            {
                "question": "에라토스테네스가 2,200년 전에 측정한 것은?",
                "options": ["태양까지의 거리", "지구의 둘레", "달의 크기", "빛의 속도"],
                "correct_index": 1,
                "explanation": "에라토스테네스는 막대기 두 개와 그림자의 각도만으로 지구 둘레를 계산했어. 실제 값과 오차 1% 이내라니 놀랍지?"
            }
        ],
        "cliffhanger": "50만 권의 인류 지식이 한곳에 모여 있었어. 그런데 이 모든 게 사라져. 불에 타서, 방치돼서, 파괴돼서. 인류 역사상 가장 큰 지적 비극이야."
    },

    # ── Ch.3 알렉산드리아 (Part 2/2) ──
    {
        "title": "불타버린 50만 권 — 되찾을 수 없는 지식",
        "chapter": "Ch.3 Alexandria",
        "chapter_title": "알렉산드리아",
        "part": 2, "total_parts": 2,
        "spark": "로마 시대, 프톨레마이오스가 '지구가 우주의 중심'이라는 천동설을 만들었고, 기독교가 이것을 채택했다. 그리고 50만 권의 지식은 재가 됐다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "알렉산드리아의 황금기가 끝나고 로마 시대가 되면서 상황이 달라져. 프톨레마이오스라는 과학자이자 점성술가가 등장해.", "highlight": "프톨레마이오스"},
            {"speaker": "cosmii", "text": "이미 이오니아 시대부터 '지구가 태양 주위를 돈다'는 학설이 있었는데, 프톨레마이오스는 이걸 무시하고 '천동설'을 만들어. 지구가 우주의 중심이고, 태양이 지구 주위를 돈다는 모형이야.", "highlight": "천동설"},
            {"speaker": "cosmii", "text": "왜 이 틀린 모형이 채택됐을까? 로마의 기독교가 좋아했거든. '신이 만든 인간이 우주의 중심'이라는 교리와 딱 맞았으니까. 천동설은 1,400년간 절대적 진리로 군림해.", "highlight": "기독교와 천동설"},
            {"speaker": "cosmii", "text": "그리고 알렉산드리아 도서관의 50만 권은... 전부 사라져. 전쟁, 방화, 방치로. 칼 세이건은 이 대목에서 이렇게 이야기해 — '그 안에 도대체 어떤 내용들이 있었는지 보고 싶어서 미치겠다.'", "highlight": "보고 싶어서 미치겠다"},
            {"speaker": "cosmii", "text": "사라진 50만 권 속에 뭐가 있었을까? 아리스타르코스의 태양중심설 원본? 에라토스테네스의 세계 지도? 우리가 1,000년 뒤에야 재발견한 지식이 이미 그 안에 있었을 수도 있어.", "highlight": "잃어버린 지식"},
            {"speaker": "cosmii", "text": "이게 바로 칼 세이건이 코스모스를 쓴 이유이기도 해. 지식은 한 번 사라지면 되돌릴 수 없어. 과학을 억압하고, 책을 불태우고, 진실을 외면하면 — 인류 전체가 퇴보한다는 경고야.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "프톨레마이오스의 천동설이 1,400년간 유지된 이유는?",
                "options": ["실험적으로 완벽히 증명돼서", "기독교 교리와 맞아떨어졌기 때문에", "다른 학자들이 모두 동의해서", "태양이 실제로 지구를 돌아서"],
                "correct_index": 1,
                "explanation": "'신이 만든 인간이 우주의 중심'이라는 기독교 교리와 천동설이 맞아떨어졌거든. 과학적 근거가 아니라 종교적 이유로 채택된 거야."
            },
            {
                "question": "칼 세이건이 알렉산드리아 도서관의 파괴를 이야기하며 전하려는 메시지는?",
                "options": ["도서관은 필요 없다", "지식은 한 번 사라지면 되돌릴 수 없으니 과학을 억압하면 인류가 퇴보한다", "로마가 위대했다", "종교가 항상 옳다"],
                "correct_index": 1,
                "explanation": "50만 권의 지식이 사라지면서 인류는 1,000년 이상의 암흑기를 겪었어. 과학을 억압하고 지식을 파괴하면 인류 전체가 퇴보한다는 강력한 경고야."
            }
        ],
        "cliffhanger": "암흑기가 1,000년 넘게 이어져. 그러다 16세기, 독일에서 한 위대한 과학자가 태어나면서 과학이 다시 불꽃을 피워. 요하네스 케플러."
    },

    # ══════════════════════════════════════════
    # 4부: 과학의 부활
    # ══════════════════════════════════════════

    # ── Ch.4 과학의 부활 (Part 1/2) ──
    {
        "title": "케플러와 뉴턴 — 우주의 법칙을 찾아서",
        "chapter": "Ch.4 The Harmony of Worlds",
        "chapter_title": "과학의 부활",
        "part": 1, "total_parts": 2,
        "spark": "뉴턴은 태양을 너무 사랑한 나머지 망원경으로 직접 태양을 응시했다. 눈이 타들어가는 줄 알면서도.",
        "dialogue": [
            {"speaker": "cosmii", "text": "1,000년 넘는 암흑기 끝에 16세기, 과학이 다시 싹트기 시작해. 독일인 요하네스 케플러가 태어난 거야.", "highlight": "케플러"},
            {"speaker": "cosmii", "text": "케플러는 티코 브라헤의 방대한 관측 데이터를 분석해서 놀라운 결론을 내려 — 행성은 원이 아니라 타원으로 태양 주위를 돈다! 이게 '케플러의 행성 운동 법칙'이야. 1,400년간 군림하던 천동설의 종말이지.", "highlight": "타원 궤도"},
            {"speaker": "cosmii", "text": "케플러의 영향을 받아 더 위대한 과학자가 나타나. 아이작 뉴턴. 이 사람이 만든 게 뭐냐면 — 미적분, 만유인력의 법칙, 광학 이론. 혼자서!", "highlight": "뉴턴"},
            {"speaker": "cosmii", "text": "칼 세이건이 책에서 뉴턴의 일화를 소개하는데 소름이 돋아. 뉴턴은 태양에 미치도록 관심이 많았어. 어떻게 관찰할까? 망원경으로 직접 태양을 쳐다봐. 눈이 타들어가는 줄 알면서도!", "highlight": "태양에 대한 집착"},
            {"speaker": "cosmii", "text": "급기야 거울에 태양빛을 반사시켜서 바라보는 위험천만한 짓까지 해. 여러 번 시력을 잃을 뻔했어. 태양을 떠올리면 이것저것 궁금해서 견딜 수가 없었다고 해.", "highlight": None},
            {"speaker": "cosmii", "text": "뉴턴의 만유인력 법칙 덕분에 인류는 처음으로 '우주가 법칙으로 움직인다'는 걸 수학으로 증명할 수 있게 돼. 사과가 떨어지는 이유와 행성이 도는 이유가 같은 힘이라니!", "highlight": "만유인력"}
        ],
        "quizzes": [
            {
                "question": "케플러가 발견한 것은?",
                "options": ["빛의 속도", "행성이 타원 궤도로 태양 주위를 돈다는 것", "지구의 나이", "원자의 구조"],
                "correct_index": 1,
                "explanation": "케플러는 관측 데이터 분석을 통해 행성이 원이 아닌 타원으로 태양 주위를 돈다는 것을 발견했어. 1,400년간의 천동설이 무너지는 순간이야."
            },
            {
                "question": "뉴턴의 만유인력 법칙이 혁명적인 이유는?",
                "options": ["사과만 설명할 수 있어서", "지구에서만 적용돼서", "사과가 떨어지는 것과 행성이 도는 것이 같은 힘임을 보여줬기 때문에", "종교와 일치해서"],
                "correct_index": 2,
                "explanation": "일상의 사과 떨어짐과 우주의 행성 운동이 같은 '만유인력'이라는 하나의 법칙으로 설명된다는 게 혁명이야. 우주가 수학적 법칙으로 움직인다는 증거지."
            }
        ],
        "cliffhanger": "뉴턴에게는 절친한 친구가 한 명 있었어. 혜성을 연구하는 사람. 1531년, 1607년, 1682년에 나타난 혜성이 같은 혜성이라고 주장한 그 사람은?"
    },

    # ── Ch.4 과학의 부활 (Part 2/2) ──
    {
        "title": "핼리 혜성 — 76년마다 찾아오는 우주의 시계",
        "chapter": "Ch.4 The Harmony of Worlds",
        "chapter_title": "과학의 부활",
        "part": 2, "total_parts": 2,
        "spark": "1531년, 1607년, 1682년에 나타난 혜성이 전부 같은 혜성이라고 한 사람. 그리고 1758년에 다시 올 것이라고 예언했다. 그 예언은 적중했다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "뉴턴의 절친이 있어. 에드먼드 핼리. 혜성을 연구하는 사람이야. 핼리가 놀라운 주장을 해 — 1531년, 1607년, 1682년에 나타난 혜성이 전부 같은 혜성이라는 거야!", "highlight": "에드먼드 핼리"},
            {"speaker": "cosmii", "text": "약 76년 주기로 태양 주위를 도는 하나의 혜성이라고. 그리고 예언해 — '1758년에 이 혜성이 다시 나타날 것이다.' 핼리는 이 예언의 결과를 보지 못하고 세상을 떠나.", "highlight": "76년 주기"},
            {"speaker": "cosmii", "text": "그리고 1758년, 정말로 그 혜성이 나타나! 죽은 사람의 예언이 적중한 거야. 사람들은 이 혜성에 그의 이름을 붙여 — '핼리 혜성'. 과학이 미래를 예측할 수 있다는 걸 온 세상에 증명한 순간이야.", "highlight": "예언의 적중"},
            {"speaker": "cosmii", "text": "그리고 1986년, 핼리의 말에 따라 정확하게 핼리 혜성이 나타났어. 이번에는 인류가 우주선을 보내서 랑데뷰(만남)를 시도했지. 혜성과 인류의 첫 만남이야!", "highlight": "1986년 랑데뷰"},
            {"speaker": "cosmii", "text": "다음 방문은 2061년경이야. 그때 네가 몇 살이든, 밤하늘을 올려다보면 76년 전에도, 152년 전에도, 똑같이 빛나고 있었을 그 혜성을 볼 수 있어.", "highlight": "2061년"},
            {"speaker": "cosmii", "text": "핼리 혜성의 의미는 이거야 — 우주는 예측 가능한 법칙으로 움직인다. 과학은 미래를 볼 수 있는 유일한 도구다. 76년마다 어김없이 찾아오는 혜성이 그 증거야.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "핼리 혜성이 과학적으로 중요한 이유는?",
                "options": ["가장 큰 혜성이라서", "과학이 미래를 예측할 수 있음을 증명했기 때문에", "지구에 충돌할 위험이 있어서", "매일 볼 수 있어서"],
                "correct_index": 1,
                "explanation": "핼리가 예언한 대로 1758년에 혜성이 나타났어. 과학적 법칙으로 미래를 정확하게 예측할 수 있다는 것을 온 세상에 보여준 사건이야."
            },
            {
                "question": "핼리 혜성의 다음 방문 예정 시기는?",
                "options": ["2030년경", "2045년경", "2061년경", "2100년경"],
                "correct_index": 2,
                "explanation": "핼리 혜성은 약 76년 주기로 태양 주위를 돌아. 마지막 방문이 1986년이었으니 다음은 2061년경이야."
            }
        ],
        "cliffhanger": "과학의 부활 이후, 인류는 드디어 우주로 탐사선을 보내기 시작해. 첫 번째 관심은 지구와 가장 비슷해 보이는 쌍둥이 행성 — 금성이었어."
    },

    # ══════════════════════════════════════════
    # 5부: 태양계 탐험
    # ══════════════════════════════════════════

    # ── Ch.5 태양계 탐험 (Part 1/2) ──
    {
        "title": "금성, 지옥이 된 쌍둥이 — 온실효과의 경고",
        "chapter": "Ch.5 Heaven and Hell",
        "chapter_title": "태양계 탐험",
        "part": 1, "total_parts": 2,
        "spark": "금성은 지구와 크기, 질량이 거의 같은 쌍둥이 행성이다. 그런데 표면 온도는 462°C. 칼 세이건은 지구를 '천국', 금성을 '지옥'이라고 불렀다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "인류가 우주로 탐사선을 쏘기 시작하면서 가장 먼저 관심을 가진 행성이 있어. 금성이야. 왜? 지구와 크기, 질량이 거의 같은 쌍둥이 행성이거든.", "highlight": "금성"},
            {"speaker": "cosmii", "text": "'쌍둥이 행성이면 생명체도 있지 않을까?' 사람들은 기대에 부풀었어. 그런데 탐사선이 도착해서 보니...", "highlight": None},
            {"speaker": "cosmii", "text": "표면 온도 462°C! 납이 녹는 온도야. 대기압은 지구의 90배. 황산 구름이 하늘을 뒤덮고 있어. 지구의 쌍둥이가 지옥이었던 거야.", "highlight": "462°C"},
            {"speaker": "cosmii", "text": "왜 이렇게 됐을까? 이산화탄소 때문이야. 금성의 대기 96%가 이산화탄소야. 태양열이 들어오면 나가질 못해. 이게 바로 '온실효과'야. 금성은 온실효과가 폭주한 결과물이야.", "highlight": "온실효과"},
            {"speaker": "cosmii", "text": "칼 세이건은 여기서 경고를 날려. 이산화탄소가 적당히 있으면 지구는 따뜻하게 유지돼. 너무 없으면 빙하기가 와. 그런데 화석연료를 계속 태워서 이산화탄소가 높아지면? 우리도 금성처럼 될 수 있어.", "highlight": "지구에 대한 경고"},
            {"speaker": "cosmii", "text": "칼 세이건은 지구를 '천국', 금성을 '지옥'이라고 불러. 이 책이 1980년에 나왔다는 거 알아? 기후변화를 40년 넘게 전에 이미 경고한 거야.", "highlight": "1980년의 경고"}
        ],
        "quizzes": [
            {
                "question": "지구의 쌍둥이 금성이 '지옥'이 된 원인은?",
                "options": ["태양에 너무 가까워서", "이산화탄소에 의한 폭주 온실효과", "화산 폭발", "소행성 충돌"],
                "correct_index": 1,
                "explanation": "금성 대기의 96%가 이산화탄소야. 태양열이 갇혀서 나가지 못하는 '온실효과'가 폭주한 결과로 표면 온도가 462°C가 된 거야."
            },
            {
                "question": "칼 세이건이 금성을 통해 전하려는 메시지는?",
                "options": ["금성은 아름다운 행성이다", "화석연료를 계속 태우면 지구도 금성처럼 될 수 있다", "금성에 이주해야 한다", "이산화탄소는 나쁘기만 하다"],
                "correct_index": 1,
                "explanation": "금성은 온실효과가 폭주한 결과야. 칼 세이건은 화석연료 사용으로 이산화탄소가 계속 늘면 지구도 금성의 운명을 따를 수 있다고 경고했어."
            }
        ],
        "cliffhanger": "금성이 지옥이라면, 화성은? 사람들은 외계인이 화성에 있을 거라고 기대했어. 그리고 탐사선이 화성에 착륙해서 보낸 첫 영상에 칼 세이건은 넋을 잃었어."
    },

    # ── Ch.5 태양계 탐험 (Part 2/2) ──
    {
        "title": "화성의 지평선 — 붉은 행성에서 만난 감동",
        "chapter": "Ch.5 Heaven and Hell",
        "chapter_title": "태양계 탐험",
        "part": 2, "total_parts": 2,
        "spark": "바이킹 탐사선이 보내온 화성의 첫 영상을 보고 칼 세이건은 이렇게 적었다 — '넋을 잃고 바라봤다. 이건 외계의 세상이 아니라는 생각이 들었다.'",
        "dialogue": [
            {"speaker": "cosmii", "text": "금성이 지옥이라면, 사람들의 희망은 화성으로 옮겨갔어. H.G. 웰스의 소설 '우주전쟁'에서도 외계인은 항상 화성에서 오잖아. 화성에 생명체가 있을지도 모른다는 기대가 컸어.", "highlight": "화성에 대한 기대"},
            {"speaker": "cosmii", "text": "소련의 탐사선 마르스는 실패해. 하지만 미국의 바이킹이 화성에 착륙해서 성공적으로 영상을 보내오기 시작해. 인류 최초로 다른 행성의 땅을 본 거야!", "highlight": "바이킹 착륙"},
            {"speaker": "cosmii", "text": "칼 세이건이 그 첫 영상을 보고 적은 글이 이래 — '그만 넋을 잃고 바라봤다. 이건 외계의 세상이 아니라는 생각이 들었다. 지구상의 어느 풍경과 다를 바 없는 바위와 모래 언덕들이 무심하게 놓여 있었다.'", "highlight": "넋을 잃다"},
            {"speaker": "cosmii", "text": "'지평선 너머에는 높은 산이 자리잡고 있었다. 화성은 그저 하나의 장소일 뿐이었다. 머리가 하얗게 센 광산 채굴꾼이 노새를 끌면서 모래 언덕 너머로 나타나더라도, 놀라지 않았을 것이다.' — 이게 외계 행성에서 느낀 감동이야.", "highlight": "하나의 장소"},
            {"speaker": "cosmii", "text": "결국 바이킹 탐사선은 화성에서 생명체의 확실한 증거를 찾지 못했어. 하지만 칼 세이건은 실망하지 않아. 오히려 이렇게 말해 — '아직 찾지 못한 것이지, 없다는 게 아니다.'", "highlight": None},
            {"speaker": "cosmii", "text": "화성은 수십억 년 전에는 물이 흘렀던 흔적이 있어. 생명이 있었을 가능성은 아직 열려 있는 거야. 그리고 이 질문은 더 큰 질문으로 이어져 — 이 광활한 우주에 우리만 있는 걸까?", "highlight": "열린 가능성"}
        ],
        "quizzes": [
            {
                "question": "칼 세이건이 화성의 첫 영상을 보고 느낀 감정은?",
                "options": ["공포", "실망", "외계가 아닌 친숙한 풍경에 대한 경이감", "분노"],
                "correct_index": 2,
                "explanation": "칼 세이건은 화성의 바위와 모래 언덕이 지구와 다르지 않다는 것에 넋을 잃었어. '화성은 그저 하나의 장소일 뿐'이라는 표현에서 우주의 보편성에 대한 경이를 느낄 수 있어."
            },
            {
                "question": "바이킹 탐사선의 화성 탐사 결과는?",
                "options": ["외계 생명체를 발견했다", "확실한 생명체 증거는 못 찾았지만 물의 흔적이 있었다", "화성에 도착하지 못했다", "화성이 금성처럼 뜨거웠다"],
                "correct_index": 1,
                "explanation": "바이킹은 생명체의 확실한 증거를 못 찾았지만, 화성에 과거 물이 흘렀던 흔적이 있어. 생명의 가능성은 아직 열려 있어."
            }
        ],
        "cliffhanger": "화성에서 생명을 못 찾았다면 — 이 거대한 우주에 우리만 있는 걸까? 외계 지적 생명체가 있을 확률을 계산하는 공식이 있어. 드레이크 방정식이야."
    },

    # ══════════════════════════════════════════
    # 6부: 별과 생명
    # ══════════════════════════════════════════

    # ── Ch.6 별과 생명 (Part 1/2) ──
    {
        "title": "별의 일생 — 탄생과 죽음, 그리고 우리",
        "chapter": "Ch.6 Stars and Life",
        "chapter_title": "별과 생명",
        "part": 1, "total_parts": 2,
        "spark": "별도 태어나고, 살고, 죽는다. 그리고 별이 죽을 때 뿌려진 원소가 모여 새로운 별과 행성과 생명이 된다. 우주는 거대한 재활용 시스템이다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "별은 영원하지 않아. 별도 태어나고, 살다가, 죽어. 칼 세이건은 별의 일생을 인간의 삶에 비유해. 아기 별에서 청년 별, 노년 별까지.", "highlight": "별의 일생"},
            {"speaker": "cosmii", "text": "별이 태어나는 곳은 '성운'이야. 거대한 가스와 먼지 구름이 중력으로 뭉치면서 중심부가 뜨거워지면 — 핵융합이 시작되면서 별이 탄생해. 수소가 헬륨으로 바뀌면서 빛과 열을 내는 거야.", "highlight": "별의 탄생"},
            {"speaker": "cosmii", "text": "태양 같은 중간 크기 별은 약 100억 년을 살아. 우리 태양은 지금 약 46억 살이니까, 아직 절반 정도 남은 셈이야. 한숨 돌려도 돼.", "highlight": None},
            {"speaker": "cosmii", "text": "하지만 태양보다 훨씬 큰 별은 연료를 빠르게 태워서 수백만 년 만에 폭발적으로 죽어. 이게 '초신성 폭발'이야. 이 폭발이 우주에서 가장 밝은 사건 중 하나야.", "highlight": "초신성 폭발"},
            {"speaker": "cosmii", "text": "그런데 여기서 마법이 일어나. 별 내부에서 핵융합으로 만들어진 무거운 원소들 — 탄소, 산소, 철, 금까지 — 이게 초신성 폭발 때 우주로 뿌려져. 그리고 이 원소들이 다시 모여서 새로운 별, 행성, 생명이 되는 거야.", "highlight": "우주의 재활용"},
            {"speaker": "cosmii", "text": "칼 세이건이 'We are star stuff'라고 한 게 바로 이거야. 네 몸의 철분은 수십억 년 전 죽은 별의 심장에 있었어. 별이 죽어야 우리가 살 수 있는 거야. 우주는 거대한 재활용 시스템이야.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "초신성 폭발이 생명에 중요한 이유는?",
                "options": ["지구를 따뜻하게 해줘서", "별 내부에서 만들어진 무거운 원소들이 우주로 뿌려져 새로운 생명의 재료가 되기 때문에", "새로운 별을 파괴해서", "빛이 예뻐서"],
                "correct_index": 1,
                "explanation": "별 내부의 핵융합으로 만들어진 탄소, 산소, 철 같은 원소가 초신성 폭발 때 우주로 뿌려져. 이것이 모여 새로운 행성과 생명의 재료가 되는 거야."
            },
            {
                "question": "우리 태양의 대략적인 나이와 남은 수명은?",
                "options": ["10억 살, 곧 죽음", "46억 살, 약 50억 년 남음", "100억 살, 거의 끝", "1억 살, 99억 년 남음"],
                "correct_index": 1,
                "explanation": "태양은 약 46억 살이고, 중간 크기 별의 수명이 약 100억 년이니까 아직 50억 년 정도 남아 있어."
            }
        ],
        "cliffhanger": "별이 죽어야 우리가 산다 — 그렇다면 이 광활한 우주에 생명이 또 있을까? 외계 지적 생명체의 존재 확률을 계산하는 공식이 있어."
    },

    # ── Ch.6 별과 생명 (Part 2/2) ──
    {
        "title": "외계인은 어디에? — 우주의 침묵",
        "chapter": "Ch.6 Stars and Life",
        "chapter_title": "별과 생명",
        "part": 2, "total_parts": 2,
        "spark": "우리 은하에만 별이 수천억 개인데, 왜 아무도 연락이 없을까? 이것을 '페르미 역설'이라고 한다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "우리 은하에만 별이 수천억 개야. 관측 가능한 우주에 은하가 2조 개 이상이고. 이 어마어마한 수에서 지적 생명체가 우리뿐이라고? 확률적으로 말이 안 돼.", "highlight": "수천억 개의 별"},
            {"speaker": "cosmii", "text": "1961년, 천문학자 프랭크 드레이크가 이 확률을 계산하는 공식을 만들어. '드레이크 방정식'이야. 별의 수, 행성을 가진 별의 비율, 생명이 탄생할 확률, 지적 생명체로 진화할 확률... 이걸 곱하면 우리 은하에만 수천~수백만 개의 문명이 있을 수 있어.", "highlight": "드레이크 방정식"},
            {"speaker": "cosmii", "text": "그런데 물리학자 엔리코 페르미가 날카롭게 물어 — '그렇다면 그들은 다 어디에 있는 거야?(Where is everybody?)' 이게 유명한 '페르미 역설'이야.", "highlight": "페르미 역설"},
            {"speaker": "cosmii", "text": "외계인이 존재한다면, 왜 연락이 없을까? 여러 가설이 있어. 너무 멀어서, 아직 기술이 부족해서, 혹은 — 칼 세이건이 우려하는 시나리오 — 모든 문명은 핵무기 같은 자멸 기술을 개발한 뒤 스스로 파멸할 수도 있다는 거야.", "highlight": "자멸 가설"},
            {"speaker": "cosmii", "text": "할리우드 영화에서 외계인은 항상 인간을 닮았잖아. 칼 세이건은 이걸 비판해. 진짜 외계 생명체는 우리와 완전히 다른 형태일 수 있어. 오징어처럼 생겼을 수도, 가스 형태일 수도, 우리가 상상도 못 할 모습일 수도 있어.", "highlight": None},
            {"speaker": "cosmii", "text": "칼 세이건은 SETI(외계 지적 생명체 탐색) 프로젝트를 적극 지지했어. 우주에 '안녕하세요'라고 인사하는 전파를 보내고, 답을 기다리는 거야. 아직 답은 없지만, 찾는 것 자체가 인류의 위대한 도전이라고.", "highlight": "SETI"}
        ],
        "quizzes": [
            {
                "question": "페르미 역설이란?",
                "options": ["외계인이 존재하지 않는다는 증명", "우주에 지적 생명체가 많을 확률이 높은데 왜 아무 연락도 없느냐는 모순", "지구가 우주의 중심이라는 주장", "빛보다 빠른 이동이 불가능하다는 법칙"],
                "correct_index": 1,
                "explanation": "우주에 수많은 별과 행성이 있으니 지적 생명체가 있을 확률이 높은데, 왜 아무 신호도 접촉도 없느냐는 모순을 페르미 역설이라고 해."
            },
            {
                "question": "칼 세이건이 우려한 '문명이 연락이 없는 이유'는?",
                "options": ["외계인은 수줍음이 많아서", "모든 문명이 핵무기 같은 자멸 기술을 개발한 뒤 스스로 파멸할 수 있어서", "우주가 너무 좁아서", "외계인은 지구에 관심이 없어서"],
                "correct_index": 1,
                "explanation": "칼 세이건은 고도로 발전한 문명이 핵무기 같은 자멸 기술을 개발한 뒤 스스로 파멸하는 시나리오를 우려했어. 이건 지구에 대한 경고이기도 해."
            }
        ],
        "cliffhanger": "외계인의 존재 여부는 아직 모르지만, 확실한 건 하나 있어. 지금 이 순간, 지구를 대변할 수 있는 건 우리뿐이라는 거야."
    },

    # ══════════════════════════════════════════
    # 7부: 칼 세이건의 유언
    # ══════════════════════════════════════════

    # ── Ch.7 칼 세이건의 유언 (Part 1/1) ──
    {
        "title": "누가 지구를 대변할 것인가 — 칼 세이건의 유언",
        "chapter": "Ch.7 Who Speaks for Earth?",
        "chapter_title": "칼 세이건의 유언",
        "part": 1, "total_parts": 1,
        "spark": "'우리는 종으로서 인류를 사랑해야 하며, 지구에게 충성해야 한다. 아니면 그 누가 우리의 지구를 대변해줄 수 있겠는가?'",
        "dialogue": [
            {"speaker": "cosmii", "text": "코스모스의 마지막 장 제목이야 — '누가 지구를 대변할 것인가?(Who Speaks for Earth?)' 이게 이 책 전체를 관통하는 질문이야.", "highlight": "마지막 질문"},
            {"speaker": "cosmii", "text": "칼 세이건은 이렇게 이야기해 — '우리는 종으로서 인류를 사랑해야 하며, 지구에게 충성해야 한다. 아니면 그 누가 우리의 지구를 대변해줄 수 있겠는가?'", "highlight": "인류에 대한 사랑"},
            {"speaker": "cosmii", "text": "'우리의 생존은 우리 자신만이 이룩한 업적이 아니다. 그러므로 오늘을 사는 우리는, 인류를 여기에 있게 한 코스모스에게 감사해야 할 것이다.' — 이게 코스모스의 마지막 메시지야.", "highlight": "코스모스에게 감사하라"},
            {"speaker": "cosmii", "text": "생각해봐. 빅뱅이 일어나고, 별이 태어나고 죽으면서 원소를 뿌리고, 그 원소가 모여 지구가 되고, 40억 년 동안 생명이 진화해서 여기 우리가 있는 거야. 이 모든 우연의 연쇄가 너를 만든 거야.", "highlight": None},
            {"speaker": "cosmii", "text": "칼 세이건은 마지막 죽는 순간까지 책을 쓰다가, 1996년에 세상을 떠나. 그토록 사랑하고 꿈꿔오던 하늘의 별이 되어 다시 우주로 돌아간 거야.", "highlight": "1996년"},
            {"speaker": "cosmii", "text": "칼 세이건은 환경, 평화, 그리고 우주를 향한 꿈을 평생 가르쳤어. '인류의 스승'이라고 불릴 만한 사람이야. 이 한 마디를 기억해 — 우리는 별의 먼지로 만들어졌고, 코스모스의 자녀이며, 이 지구를 대변할 수 있는 건 오직 우리뿐이야.", "highlight": "별의 먼지, 코스모스의 자녀"}
        ],
        "quizzes": [
            {
                "question": "코스모스 마지막 장의 제목이자 핵심 질문은?",
                "options": ["우주는 얼마나 큰가?", "누가 지구를 대변할 것인가?", "외계인은 존재하는가?", "별은 몇 개인가?"],
                "correct_index": 1,
                "explanation": "'Who Speaks for Earth?(누가 지구를 대변할 것인가?)' — 이 질문이 코스모스 전체를 관통하는 메시지야. 지구를 대변할 수 있는 건 우리뿐이라는 뜻이야."
            },
            {
                "question": "칼 세이건이 코스모스를 통해 전하려는 궁극적 메시지는?",
                "options": ["우주는 무섭고 위험하다", "과학은 일부 천재만의 것이다", "우리는 코스모스의 자녀이며, 인류와 지구를 사랑하고 지켜야 한다", "외계인을 빨리 찾아야 한다"],
                "correct_index": 2,
                "explanation": "우리는 별의 먼지로 만들어졌고, 코스모스의 자녀야. 그러므로 인류를 사랑하고 지구를 지켜야 한다 — 이게 칼 세이건이 평생 전한 메시지야."
            }
        ],
        "cliffhanger": ""
    },
]


# ══════════════════════════════════════════════════════════════
# TRANSLATIONS_EN — English translations
# ══════════════════════════════════════════════════════════════

TRANSLATIONS_EN = {
    0: {
        "title": "The Cosmic Calendar — 13.8 Billion Years in a Single Day",
        "chapter_title": "The Shores of the Cosmic Ocean",
        "spark": "Compress the 13.8-billion-year history of the universe into one calendar year: all of human history begins at 11:59:59 PM on December 31st.",
        "cliffhanger": "If we're just specks of dust in this vast cosmos — why have so many nations drawn stars on their flags? Next: the story of 'star stuff.'",
        "dialogue": [
            {"speaker": "cosmii", "text": "Cosmos opens with this question — just how old IS the universe? Carl Sagan created an ingenious analogy to make it click: the 'Cosmic Calendar.'", "highlight": None},
            {"speaker": "cosmii", "text": "Compress the 13.8-billion-year history of the universe into one calendar year. January 1st, midnight — the Big Bang. In pitch-black darkness, ultra-dense energy explodes outward. We call this the Big Bang.", "highlight": "Big Bang"},
            {"speaker": "cosmii", "text": "The debris spreads and clumps together. After about a billion years, massive structures form — galaxies. Our galaxy alone has 100 to 400 billion stars. One of them is the Sun, orbited by Mercury, Venus, Earth, Mars, and the rest.", "highlight": "Birth of galaxies"},
            {"speaker": "cosmii", "text": "Life first appears on Earth around September. Dinosaurs show up on December 25th and go extinct on December 30th. And humans? We barely arrive at 10:30 PM on December 31st.", "highlight": "December 31st humans"},
            {"speaker": "cosmii", "text": "All of human civilization — the Pyramids, Rome, World Wars, smartphones — fits within the final second of December 31st. That's how much time humanity occupies in the universe.", "highlight": "The last second"},
            {"speaker": "cosmii", "text": "What did Carl Sagan call Earth in this vast cosmos? A 'Pale Blue Dot.' Voyager 1 took a photo from 6.4 billion km away — Earth was a speck smaller than dust. That's where we live.", "highlight": "Pale Blue Dot"}
        ],
        "quizzes": [
            {
                "question": "On the Cosmic Calendar, when do humans appear?",
                "options": ["January 1st", "Around 10:30 PM on December 31st", "June 15th", "December 25th"],
                "correct_index": 1,
                "explanation": "Compressing 13.8 billion years into one year, humans barely show up at 10:30 PM on December 31st. All of civilization fits in the final second."
            },
            {
                "question": "What does the 'Pale Blue Dot' refer to?",
                "options": ["The Moon", "Earth", "Venus", "Mars"],
                "correct_index": 1,
                "explanation": "Voyager 1's photo from 6.4 billion km away showed Earth as a speck smaller than dust. Sagan called it the 'Pale Blue Dot.'"
            }
        ],
    },
    1: {
        "title": "Children of the Stars — Our Bodies Are Made of Stellar Remains",
        "chapter_title": "The Shores of the Cosmic Ocean",
        "spark": "The US flag has 50 stars, China has 5, and Brazil has actual constellations on its flag. Why are humans so obsessed with stars?",
        "cliffhanger": "The children of stars first began studying the night sky scientifically about 2,500 years ago, on jewel-like islands in the Aegean Sea.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Look at the world's flags. The US has 50 stars, Turkey and Israel each have 1, China has 5, and Brazil has actual constellations. South Korea's Taegeuk? It encodes the very principles of the cosmos.", "highlight": "Stars on flags"},
            {"speaker": "cosmii", "text": "Humans have gazed at stars since prehistoric times. Korean dolmens have constellations carved into them. For tens of thousands of years, humanity has longed for the night sky.", "highlight": "Dolmen constellations"},
            {"speaker": "cosmii", "text": "But why? Carl Sagan's answer gives you goosebumps: 'Because we CAME from the stars.' This isn't poetic license. It's scientific fact.", "highlight": None},
            {"speaker": "cosmii", "text": "The carbon, nitrogen, oxygen, and iron in our bodies — ALL of it was forged inside stars through nuclear fusion. When stars die in supernova explosions, these elements scatter into space. They gathered to form Earth, life, and you and me.", "highlight": "Stellar elements"},
            {"speaker": "cosmii", "text": "Here's Sagan's legendary quote: 'We are made of star stuff.' The iron in your body was once inside the core of a star that died billions of years ago. The iron in your blood came from a star's heart.", "highlight": "We are star stuff"},
            {"speaker": "cosmii", "text": "So when you look at the night sky and feel a strange longing — that's natural. You're longing for home. We are all sons and daughters of the stars.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "Why did Carl Sagan say 'We are made of star stuff'?",
                "options": ["Because humans shine like stars", "Because the elements in our bodies were forged through nuclear fusion inside stars", "Because humans like stars", "Because of mythology about stars creating humans"],
                "correct_index": 1,
                "explanation": "Carbon, nitrogen, oxygen, iron — the elements in our bodies were forged inside stars. When stars explode, these scatter into space and eventually form planets and life."
            },
            {
                "question": "What was found on Korean dolmens?",
                "options": ["Ancient writing", "Star constellation carvings", "Animal drawings", "Maps"],
                "correct_index": 1,
                "explanation": "Korean dolmens have constellation carvings, proving that humanity has been observing and recording the night sky since prehistoric times."
            }
        ],
    },
    2: {
        "title": "The Ionian Awakening — Where Science Was Born",
        "chapter_title": "The Birth of Science",
        "spark": "2,500 years ago, on jewel-like islands where southern Greece meets Turkey, humanity first conceived the idea that the world runs on natural laws, not divine whims.",
        "cliffhanger": "The first scientists emerged from Ionia. The man who said everything is water, the man who declared Earth is round. Next: these legendary figures.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Humans have looked up at the sky for tens of thousands of years. But mostly through religion — stars were the will of the gods. So when did humans first look at the sky SCIENTIFICALLY?", "highlight": None},
            {"speaker": "cosmii", "text": "About 2,500 years ago. In the Aegean Sea where southern Greece meets Turkey, there were small, jewel-like islands. This region was called 'Ionia.' And right here, human science was born.", "highlight": "Ionia"},
            {"speaker": "cosmii", "text": "What revolutionary idea did the Ionians have? 'The phenomena of the world can be explained by natural laws, not gods.' Rain isn't Zeus being angry — it's the water cycle.", "highlight": "Natural laws"},
            {"speaker": "cosmii", "text": "Sagan calls this the 'Ionian Awakening.' Why here specifically? Ionia was a trade hub. Knowledge from Egypt, Persia, and Babylon flowed into these islands. When different mythologies clashed, people naturally asked: 'Which god is right?' — and started looking for non-divine explanations.", "highlight": "Trade and multiculturalism"},
            {"speaker": "cosmii", "text": "Amazingly, people in this era already thought Earth was round and orbited the Sun. 2,500 years ago! Two thousand years before Copernicus!", "highlight": "2,000 years ahead"},
            {"speaker": "cosmii", "text": "This Ionian period is Sagan's favorite era. The moment humanity first chose reason over superstition. The true starting point of science.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "What was the key reason science was born in Ionia?",
                "options": ["A king ordered it", "As a trade hub, diverse cultures clashed and prompted questions beyond mythology", "They had a great library", "The weather was good for stargazing"],
                "correct_index": 1,
                "explanation": "Ionia was a trade crossroads where Egyptian, Persian, and Babylonian knowledge intersected. When different myths collided, people began seeking natural explanations."
            },
            {
                "question": "What does the 'Ionian Awakening' mean?",
                "options": ["Greece becoming militarily powerful", "Humanity first explaining the world through natural laws instead of superstition", "The first writing system being invented in Ionia", "The beginning of ocean exploration"],
                "correct_index": 1,
                "explanation": "The Ionian Awakening was the intellectual revolution where humanity first tried to understand the world through nature's laws, not divine will."
            }
        ],
    },
    3: {
        "title": "From Thales to Pythagoras — The First Scientists",
        "chapter_title": "The Birth of Science",
        "spark": "Thales calculated a pyramid's height using nothing but the Sun and two sticks. Pythagoras coined the word 'Cosmos' — not Carl Sagan.",
        "cliffhanger": "This amazing scientific tradition suddenly vanished. The cause was surprisingly social. People who viewed experiments as 'beneath them' killed science.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Ionia produces the first scientist-philosopher. Thales. What did he say? 'The origin of everything is water.' You learned this in ethics class, right? But the answer doesn't matter. The QUESTION was the revolution.", "highlight": "Thales"},
            {"speaker": "cosmii", "text": "'What is the world made of?' — this question rejects 'God made it' and declares the intent to find material causes. Thales calculated pyramid heights using just sunlight and shadow. We still use the same principle to measure mountains on other planets.", "highlight": "Measuring pyramids with shadows"},
            {"speaker": "cosmii", "text": "Then another giant appears. Pythagoras. Mathematician, scientist, philosopher. He was the first to argue that Earth is spherical.", "highlight": "Pythagoras"},
            {"speaker": "cosmii", "text": "And Pythagoras coined a word: 'Cosmos.' The universe moves in order (cosmos), not chaos. That's where this book's title comes from. Not Carl Sagan — Pythagoras used the word first!", "highlight": "Origin of 'Cosmos'"},
            {"speaker": "cosmii", "text": "There's also Democritus. He argued that everything is made of tiny, indivisible particles. He called them 'atomos' — atoms. He proposed atomic theory 2,400 years ago!", "highlight": "Democritus and atoms"},
            {"speaker": "cosmii", "text": "The Ionian scientists were THIS brilliant. Earth is round, orbits the Sun, and is made of atoms — all of this was 'rediscovered' 2,000 years later. But why did it disappear in between?", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "Who first used the word 'Cosmos'?",
                "options": ["Carl Sagan", "Pythagoras", "Thales", "Aristotle"],
                "correct_index": 1,
                "explanation": "Pythagoras first used 'Cosmos' to mean the universe moves in order, not chaos. Carl Sagan's book title comes from this ancient word."
            },
            {
                "question": "What did Democritus propose 2,400 years ago?",
                "options": ["Earth is flat", "Everything is made of indivisible particles called atoms", "Stars are the eyes of gods", "The universe expands infinitely"],
                "correct_index": 1,
                "explanation": "Democritus argued all matter consists of 'atomos' (atoms) — the smallest indivisible units. He's the forefather of modern atomic theory."
            }
        ],
    },
    4: {
        "title": "How Slavery Killed Science — The Prejudice Against Experiments",
        "chapter_title": "The Birth of Science",
        "spark": "Plato and Aristotle: 'It's fine for us scholars to take interest in the heavens, but actual observation and experimentation should be left to slaves.'",
        "cliffhanger": "After Greek science died, around 300 BC a new center of science emerged. A city Alexander the Great named after himself — Alexandria.",
        "dialogue": [
            {"speaker": "cosmii", "text": "This is where Carl Sagan gets most furious. Why did Ionia's brilliant science vanish? Not because of war. Because of social structure.", "highlight": None},
            {"speaker": "cosmii", "text": "Science advances through experiments that test hypotheses. But Greek society viewed experiments as 'labor' — beneath the dignity of nobles.", "highlight": "Experiments = labor"},
            {"speaker": "cosmii", "text": "Even great philosophers like Plato and Aristotle said things like: 'It's fine for scholars to be interested in the heavens, but direct observation and experimentation should be left to slaves.' Think, but don't get your hands dirty.", "highlight": "Plato's prejudice"},
            {"speaker": "cosmii", "text": "Why is this fatal? Because science's core process is hypothesis → experiment → verification. Remove experiments and it's just philosophy. No matter how logical a hypothesis is, you can't confirm it without testing.", "highlight": "Science without experiments"},
            {"speaker": "cosmii", "text": "As a result, Greek science declined. The price of dismissing observation and experimentation. Sagan laments: 'When Ionia's flame went out, humanity entered over 1,000 years of darkness.'", "highlight": "1,000 years of darkness"},
            {"speaker": "cosmii", "text": "This isn't ancient history. Even today, there's prejudice that 'practical work is beneath you' or 'only theory is sophisticated.' Sagan warns us never to forget this lesson.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "What was the root cause of Ionian science's decline?",
                "options": ["Scientists died in wars", "A social structure that viewed experiments as slave labor", "Libraries were destroyed by natural disasters", "Religion banned science"],
                "correct_index": 1,
                "explanation": "Greek society viewed experiments as 'labor' unworthy of nobles. Without hands-on verification, science couldn't advance."
            },
            {
                "question": "What core scientific process did Carl Sagan emphasize?",
                "options": ["Prayer → revelation → faith", "Hypothesis → experiment → verification", "Observation → speculation → debate", "Reading → memorization → exams"],
                "correct_index": 1,
                "explanation": "Hypothesis, experiment, verification — that's the heart of science. Remove experiments and science becomes mere philosophy."
            }
        ],
    },
    5: {
        "title": "The Library of Alexandria — Humanity's First Database",
        "chapter_title": "Alexandria",
        "spark": "When ships entered Alexandria's harbor, inspectors didn't confiscate weapons first — they confiscated BOOKS.",
        "cliffhanger": "500,000 scrolls of human knowledge gathered in one place. Then it all vanished. Burned, neglected, destroyed. The greatest intellectual tragedy in human history.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Around 300 BC, after Ionian science faded, a new hotspot emerged: Alexandria, Egypt. The city Alexander the Great named after himself.", "highlight": "Alexandria"},
            {"speaker": "cosmii", "text": "What set Alexander apart? He was open-minded. He embraced multiple religions and cultures. Genghis Khan was similar — empire builders share this trait of openness.", "highlight": "Open-minded empire"},
            {"speaker": "cosmii", "text": "Alexander wanted Alexandria to be Earth's 'knowledge hub.' He poured in massive funding and support. The result: the greatest library in history — the Library of Alexandria.", "highlight": "Knowledge hub"},
            {"speaker": "cosmii", "text": "The library's collection method was genius. Alexandria sat at the crossroads of Europe, Asia, and Africa. When trade ships entered the harbor, inspectors confiscated ALL written materials — books, scrolls, maps, everything!", "highlight": "Confiscating books"},
            {"speaker": "cosmii", "text": "They'd copy the confiscated texts, return the copies, and keep the originals. This built a database of 500,000 scrolls. 2,300 years ago, they created humanity's first knowledge archive.", "highlight": "500,000 scrolls"},
            {"speaker": "cosmii", "text": "Here, a genius named Eratosthenes calculated Earth's circumference using just two sticks. His answer was within 1% of the actual value! 2,200 years ago! That's the power of observation and experiment.", "highlight": "Eratosthenes"}
        ],
        "quizzes": [
            {
                "question": "What was the Library of Alexandria's unique collection method?",
                "options": ["Scholars wrote everything themselves", "They confiscated all written materials from ships entering the harbor", "They raided other countries' libraries", "The king traveled and collected personally"],
                "correct_index": 1,
                "explanation": "Ships entering Alexandria's harbor had all written materials confiscated. The originals were kept and copies returned, building a 500,000-scroll database."
            },
            {
                "question": "What did Eratosthenes measure 2,200 years ago?",
                "options": ["Distance to the Sun", "Earth's circumference", "Size of the Moon", "Speed of light"],
                "correct_index": 1,
                "explanation": "Eratosthenes calculated Earth's circumference using two sticks and shadow angles — within 1% accuracy. Remarkable for 2,200 years ago!"
            }
        ],
    },
    6: {
        "title": "500,000 Scrolls Burned — Knowledge Lost Forever",
        "chapter_title": "Alexandria",
        "spark": "In the Roman era, Ptolemy created the geocentric model claiming Earth was the center of the universe. Christianity adopted it. Then 500,000 scrolls turned to ash.",
        "cliffhanger": "Over 1,000 years of darkness followed. Then in the 16th century, a great scientist was born in Germany, reigniting science's flame. Johannes Kepler.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Alexandria's golden age ended as the Roman era began. Enter Ptolemy — scientist and astrologer.", "highlight": "Ptolemy"},
            {"speaker": "cosmii", "text": "The heliocentric model — Earth orbiting the Sun — already existed since Ionian times. But Ptolemy ignored it and created the 'geocentric model': Earth at the center, the Sun revolving around it.", "highlight": "Geocentric model"},
            {"speaker": "cosmii", "text": "Why was this wrong model adopted? Roman Christianity loved it. 'Humans, created by God, are the center of the universe' — it fit the doctrine perfectly. The geocentric model reigned for 1,400 years.", "highlight": "Christianity and geocentrism"},
            {"speaker": "cosmii", "text": "And the Library of Alexandria's 500,000 scrolls... all gone. War, arson, neglect. Carl Sagan says at this point: 'I desperately wish I could see what was in those scrolls.'", "highlight": "Desperate to see them"},
            {"speaker": "cosmii", "text": "What was lost? Aristarchus's original heliocentric writings? Eratosthenes's world maps? Knowledge that humanity only 'rediscovered' 1,000 years later may have already existed in those scrolls.", "highlight": "Lost knowledge"},
            {"speaker": "cosmii", "text": "This is exactly why Sagan wrote Cosmos. Once knowledge is destroyed, it can never be recovered. Suppress science, burn books, deny truth — and all of humanity regresses. That's his warning.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "Why did Ptolemy's geocentric model survive for 1,400 years?",
                "options": ["It was perfectly proven by experiments", "It aligned with Christian doctrine", "All other scholars agreed", "The Sun actually orbits Earth"],
                "correct_index": 1,
                "explanation": "The doctrine that 'God's creation, humanity, is the center of the universe' aligned with geocentrism. It was adopted for religious, not scientific, reasons."
            },
            {
                "question": "What message does Sagan convey through the Library of Alexandria's destruction?",
                "options": ["Libraries are unnecessary", "Once knowledge is destroyed it can never be recovered — suppressing science causes humanity to regress", "Rome was great", "Religion is always right"],
                "correct_index": 1,
                "explanation": "500,000 scrolls lost, and humanity entered 1,000+ years of darkness. Sagan's powerful warning: destroy knowledge and all civilization suffers."
            }
        ],
    },
    7: {
        "title": "Kepler and Newton — Discovering the Laws of the Universe",
        "chapter_title": "The Revival of Science",
        "spark": "Newton loved the Sun so much he stared at it through a telescope — knowing full well his eyes could burn.",
        "cliffhanger": "Newton had a best friend who studied comets. He claimed the comets of 1531, 1607, and 1682 were all the same one. Who was he?",
        "dialogue": [
            {"speaker": "cosmii", "text": "After over 1,000 years of darkness, science began to stir again in the 16th century. Johannes Kepler was born in Germany.", "highlight": "Kepler"},
            {"speaker": "cosmii", "text": "Kepler analyzed Tycho Brahe's vast observation data and reached a stunning conclusion — planets orbit the Sun in ELLIPSES, not circles! This is 'Kepler's Laws of Planetary Motion.' The end of 1,400 years of geocentrism.", "highlight": "Elliptical orbits"},
            {"speaker": "cosmii", "text": "Inspired by Kepler, an even greater scientist emerged: Isaac Newton. What did he create? Calculus, the law of universal gravitation, and the theory of optics. All by himself!", "highlight": "Newton"},
            {"speaker": "cosmii", "text": "Sagan shares a Newton anecdote that gives you chills. Newton was obsessed with the Sun. How to observe it? He stared at it directly through a telescope. Knowing his eyes could burn!", "highlight": "Obsession with the Sun"},
            {"speaker": "cosmii", "text": "He even reflected sunlight off mirrors to stare at it — a recklessly dangerous act. He nearly lost his sight multiple times. He said he simply couldn't resist his curiosity about the Sun.", "highlight": None},
            {"speaker": "cosmii", "text": "Thanks to Newton's law of universal gravitation, humanity could finally PROVE mathematically that the universe runs on laws. The reason an apple falls and the reason planets orbit — the same force!", "highlight": "Universal gravitation"}
        ],
        "quizzes": [
            {
                "question": "What did Kepler discover?",
                "options": ["The speed of light", "That planets orbit the Sun in ellipses", "Earth's age", "The structure of atoms"],
                "correct_index": 1,
                "explanation": "Kepler's analysis of observation data revealed planets follow elliptical orbits around the Sun — ending 1,400 years of geocentrism."
            },
            {
                "question": "Why was Newton's law of universal gravitation revolutionary?",
                "options": ["It only explains apples", "It only applies on Earth", "It showed a falling apple and orbiting planets obey the same force", "It agreed with religion"],
                "correct_index": 2,
                "explanation": "The everyday falling of an apple and the cosmic motion of planets — explained by one law. Proof that the universe runs on mathematical laws."
            }
        ],
    },
    8: {
        "title": "Halley's Comet — The Cosmic Clock That Visits Every 76 Years",
        "chapter_title": "The Revival of Science",
        "spark": "One man noticed comets in 1531, 1607, and 1682 were the same. He predicted it would return in 1758. He died before seeing it — but it came right on schedule.",
        "cliffhanger": "After science's revival, humanity finally began sending probes into space. The first target was Earth's twin — Venus.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Newton had a close friend: Edmund Halley. A comet researcher. Halley made a bold claim — the comets of 1531, 1607, and 1682 were all the SAME comet!", "highlight": "Edmund Halley"},
            {"speaker": "cosmii", "text": "A single comet orbiting the Sun every ~76 years. He predicted: 'This comet will return in 1758.' Halley passed away before seeing the result.", "highlight": "76-year cycle"},
            {"speaker": "cosmii", "text": "Then in 1758, the comet appeared right on schedule! A dead man's prediction came true. They named it 'Halley's Comet.' The moment that proved science can predict the future.", "highlight": "Prediction fulfilled"},
            {"speaker": "cosmii", "text": "In 1986, exactly as Halley foretold, the comet returned. This time, humanity sent spacecraft for a rendezvous — humanity's first close encounter with a comet!", "highlight": "1986 rendezvous"},
            {"speaker": "cosmii", "text": "The next visit is around 2061. Whatever age you are then, look up at the night sky — you'll see the same comet that shone 76 years before, and 152 years before that.", "highlight": "2061"},
            {"speaker": "cosmii", "text": "Halley's Comet means this: the universe runs on predictable laws. Science is the only tool that can see the future. A comet faithfully returning every 76 years is the proof.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "Why is Halley's Comet scientifically important?",
                "options": ["It's the largest comet", "It proved science can accurately predict the future", "It might hit Earth", "You can see it every day"],
                "correct_index": 1,
                "explanation": "Halley predicted the comet's return in 1758, and it appeared right on schedule — proving to the world that scientific laws can accurately predict the future."
            },
            {
                "question": "When is Halley's Comet's next expected visit?",
                "options": ["Around 2030", "Around 2045", "Around 2061", "Around 2100"],
                "correct_index": 2,
                "explanation": "Halley's Comet orbits the Sun roughly every 76 years. Last visit was 1986, so the next is around 2061."
            }
        ],
    },
    9: {
        "title": "Venus, the Twin Turned Hell — A Warning About the Greenhouse Effect",
        "chapter_title": "Exploring the Solar System",
        "spark": "Venus is Earth's near-twin in size and mass. But its surface is 462°C. Sagan called Earth 'heaven' and Venus 'hell.'",
        "cliffhanger": "If Venus is hell, what about Mars? People hoped aliens lived there. When the first probe landed and sent images back, Carl Sagan was stunned.",
        "dialogue": [
            {"speaker": "cosmii", "text": "When humanity started launching probes, the first planet they were most curious about was Venus. Why? It's nearly identical to Earth in size and mass — a true twin planet.", "highlight": "Venus"},
            {"speaker": "cosmii", "text": "'If it's Earth's twin, maybe there's life!' People were thrilled with anticipation. But when the probe arrived...", "highlight": None},
            {"speaker": "cosmii", "text": "Surface temperature: 462°C! Hot enough to melt lead. Atmospheric pressure 90 times Earth's. Sulfuric acid clouds blanket the sky. Earth's twin turned out to be hell.", "highlight": "462°C"},
            {"speaker": "cosmii", "text": "Why? Carbon dioxide. Venus's atmosphere is 96% CO2. Solar heat gets in but can't escape. That's the 'greenhouse effect.' Venus is what happens when the greenhouse effect runs away.", "highlight": "Greenhouse effect"},
            {"speaker": "cosmii", "text": "Sagan fires a warning here. Some CO2 keeps Earth warm — too little and we'd have an ice age. But if we keep burning fossil fuels and CO2 keeps rising? We could end up like Venus.", "highlight": "Warning for Earth"},
            {"speaker": "cosmii", "text": "Sagan called Earth 'heaven' and Venus 'hell.' Remember — this book came out in 1980. He warned about climate change over 40 years ago.", "highlight": "1980 warning"}
        ],
        "quizzes": [
            {
                "question": "What turned Earth's twin Venus into 'hell'?",
                "options": ["Too close to the Sun", "Runaway greenhouse effect from carbon dioxide", "Volcanic eruptions", "Asteroid impact"],
                "correct_index": 1,
                "explanation": "Venus's atmosphere is 96% CO2. Solar heat gets trapped and can't escape — a runaway greenhouse effect that pushed surface temps to 462°C."
            },
            {
                "question": "What message does Sagan convey through Venus?",
                "options": ["Venus is beautiful", "If we keep burning fossil fuels, Earth could become like Venus", "We should move to Venus", "CO2 is always bad"],
                "correct_index": 1,
                "explanation": "Venus is a runaway greenhouse effect in action. Sagan warned that continued fossil fuel use could push Earth toward Venus's fate."
            }
        ],
    },
    10: {
        "title": "The Martian Horizon — Moved by the Red Planet",
        "chapter_title": "Exploring the Solar System",
        "spark": "Seeing Viking's first images from Mars, Carl Sagan wrote: 'I stared, spellbound. It didn't feel like an alien world.'",
        "cliffhanger": "No life found on Mars — but then, are we alone in this vast universe? There's actually a formula to calculate the probability of intelligent alien life.",
        "dialogue": [
            {"speaker": "cosmii", "text": "If Venus is hell, hope shifted to Mars. In H.G. Wells's 'The War of the Worlds,' aliens always come from Mars. Expectations for life on Mars ran high.", "highlight": "Hopes for Mars"},
            {"speaker": "cosmii", "text": "The Soviet Mars probes failed. But America's Viking successfully landed and began sending back images. For the first time, humanity saw another planet's surface!", "highlight": "Viking landing"},
            {"speaker": "cosmii", "text": "Here's what Sagan wrote about those first images: 'I stared, spellbound. It didn't feel like an alien world. Rocks and sand dunes no different from any landscape on Earth lay there, indifferent.'", "highlight": "Spellbound"},
            {"speaker": "cosmii", "text": "'Beyond the horizon, tall mountains stood. Mars was simply a place. If a grizzled miner had come over the dune leading a mule, I wouldn't have been surprised.' — That's the emotion of seeing an alien planet.", "highlight": "Simply a place"},
            {"speaker": "cosmii", "text": "Ultimately, Viking found no definitive evidence of life on Mars. But Sagan wasn't disappointed. He said: 'We haven't found it yet — that doesn't mean it's not there.'", "highlight": None},
            {"speaker": "cosmii", "text": "Mars shows evidence of water flowing billions of years ago. The possibility of past life remains open. And this question leads to an even bigger one — in this vast universe, are we really alone?", "highlight": "Open possibility"}
        ],
        "quizzes": [
            {
                "question": "What did Carl Sagan feel when he saw Mars's first images?",
                "options": ["Fear", "Disappointment", "Awe at how familiar and non-alien it looked", "Anger"],
                "correct_index": 2,
                "explanation": "Sagan was spellbound by how Mars's rocks and dunes looked no different from Earth landscapes. 'Mars was simply a place' — expressing wonder at the universe's universality."
            },
            {
                "question": "What was Viking's Mars exploration result?",
                "options": ["Found alien life", "No definitive life evidence, but traces of ancient water", "Failed to reach Mars", "Mars was as hot as Venus"],
                "correct_index": 1,
                "explanation": "Viking found no definitive life evidence but Mars shows signs of past water flow. The possibility of ancient life remains open."
            }
        ],
    },
    11: {
        "title": "The Lives of Stars — Birth, Death, and Us",
        "chapter_title": "Stars and Life",
        "spark": "Stars are born, live, and die. When they die, the elements they scatter gather to form new stars, planets, and life. The cosmos is a vast recycling system.",
        "cliffhanger": "If stars must die for us to live — then in this vast cosmos, is there other life? There's an equation that calculates the probability.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Stars aren't eternal. They're born, live, and die. Sagan compares a star's life to a human's — baby star to young star to elderly star.", "highlight": "Lives of stars"},
            {"speaker": "cosmii", "text": "Stars are born in nebulae. Vast clouds of gas and dust collapse under gravity, the core heats up, and nuclear fusion ignites — a star is born. Hydrogen fuses into helium, releasing light and heat.", "highlight": "Star birth"},
            {"speaker": "cosmii", "text": "A medium star like our Sun lives about 10 billion years. Our Sun is currently ~4.6 billion years old, so it has roughly half its life left. You can relax.", "highlight": None},
            {"speaker": "cosmii", "text": "But stars much larger than the Sun burn through fuel fast and die explosively after just millions of years. That's a 'supernova' — one of the brightest events in the universe.", "highlight": "Supernova"},
            {"speaker": "cosmii", "text": "Here's where the magic happens. Heavy elements forged inside stars — carbon, oxygen, iron, even gold — are scattered into space during the supernova. These elements then gather to form new stars, planets, and life.", "highlight": "Cosmic recycling"},
            {"speaker": "cosmii", "text": "This is exactly what Sagan meant by 'We are star stuff.' The iron in your blood was once inside the heart of a star that died billions of years ago. Stars must die for us to live. The cosmos is a vast recycling system.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "Why are supernova explosions important for life?",
                "options": ["They warm Earth", "Heavy elements forged inside stars scatter into space and become raw materials for new life", "They destroy new stars", "They look beautiful"],
                "correct_index": 1,
                "explanation": "Elements like carbon, oxygen, and iron forged through stellar fusion scatter during supernovae. These become the building blocks for new planets and life."
            },
            {
                "question": "Roughly how old is our Sun, and how long does it have left?",
                "options": ["1 billion years old, about to die", "4.6 billion years old, ~5 billion years left", "10 billion years old, nearly done", "100 million years old, 9.9 billion years left"],
                "correct_index": 1,
                "explanation": "Our Sun is about 4.6 billion years old. Medium stars live ~10 billion years, so there are roughly 5 billion years remaining."
            }
        ],
    },
    12: {
        "title": "Where Are the Aliens? — The Silence of the Cosmos",
        "chapter_title": "Stars and Life",
        "spark": "Our galaxy alone has hundreds of billions of stars. So why hasn't anyone called? This is known as the 'Fermi Paradox.'",
        "cliffhanger": "Whether or not aliens exist, one thing is certain: right now, we are the only ones who can speak for Earth.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Our galaxy alone has hundreds of billions of stars. The observable universe has over 2 trillion galaxies. With those staggering numbers, can we really be the only intelligent life? Statistically, it seems impossible.", "highlight": "Hundreds of billions of stars"},
            {"speaker": "cosmii", "text": "In 1961, astronomer Frank Drake created a formula to calculate this probability: the 'Drake Equation.' Multiply the number of stars, the fraction with planets, the probability of life, intelligence, and civilization — there could be thousands to millions of civilizations in our galaxy alone.", "highlight": "Drake Equation"},
            {"speaker": "cosmii", "text": "But physicist Enrico Fermi asked pointedly: 'Then where IS everybody?' This famous question is the 'Fermi Paradox.'", "highlight": "Fermi Paradox"},
            {"speaker": "cosmii", "text": "If aliens exist, why no contact? Many hypotheses exist. Too far away, insufficient technology, or — Sagan's feared scenario — every civilization develops self-destructive technology like nuclear weapons and annihilates itself.", "highlight": "Self-destruction hypothesis"},
            {"speaker": "cosmii", "text": "Hollywood aliens always look human. Sagan critiques this. Real alien life could be completely different — squid-like, gaseous, or beyond anything we can imagine.", "highlight": None},
            {"speaker": "cosmii", "text": "Sagan championed SETI — the Search for Extraterrestrial Intelligence. Sending 'hello' radio signals into space and waiting for a reply. No answer yet, but Sagan said the search itself is humanity's great endeavor.", "highlight": "SETI"}
        ],
        "quizzes": [
            {
                "question": "What is the Fermi Paradox?",
                "options": ["Proof that aliens don't exist", "The contradiction that intelligent life should be abundant yet we've received zero contact", "The claim that Earth is the center of the universe", "A law that faster-than-light travel is impossible"],
                "correct_index": 1,
                "explanation": "With countless stars and planets, intelligent life should be likely — yet there's been zero signal or contact. This contradiction is the Fermi Paradox."
            },
            {
                "question": "What was Sagan's feared reason for cosmic silence?",
                "options": ["Aliens are shy", "Every civilization develops self-destructive technology and may annihilate itself", "The universe is too small", "Aliens aren't interested in Earth"],
                "correct_index": 1,
                "explanation": "Sagan feared that advanced civilizations might develop weapons like nukes and destroy themselves. This is also a warning about our own planet."
            }
        ],
    },
    13: {
        "title": "Who Speaks for Earth? — Carl Sagan's Final Message",
        "chapter_title": "Carl Sagan's Legacy",
        "spark": "'We must love humanity as a species, and be loyal to our planet. If not us, who can speak for Earth?'",
        "cliffhanger": "",
        "dialogue": [
            {"speaker": "cosmii", "text": "The final chapter of Cosmos is titled: 'Who Speaks for Earth?' This is THE question running through the entire book.", "highlight": "The final question"},
            {"speaker": "cosmii", "text": "Sagan writes: 'We must love humanity as a species, and be loyal to our planet. If not us, who can speak for Earth?'", "highlight": "Love for humanity"},
            {"speaker": "cosmii", "text": "'Our survival is not solely our own achievement. Therefore, those of us alive today should be grateful to the Cosmos that brought humanity into being.' — That's the final message of Cosmos.", "highlight": "Be grateful to the Cosmos"},
            {"speaker": "cosmii", "text": "Think about it. The Big Bang happened, stars were born and died scattering elements, those elements formed Earth, and life evolved for 4 billion years until here we are. This entire chain of cosmic coincidences made you.", "highlight": None},
            {"speaker": "cosmii", "text": "Carl Sagan kept writing until his very last days and passed away in 1996. He became one of those stars he loved and dreamed about, returning to the cosmos.", "highlight": "1996"},
            {"speaker": "cosmii", "text": "Sagan spent his life teaching about the environment, peace, and the dream of reaching the stars. He truly deserves the title 'teacher of humanity.' Remember this: we are made of star stuff, we are children of the cosmos, and we are the only ones who can speak for this Earth.", "highlight": "Star stuff, children of the cosmos"}
        ],
        "quizzes": [
            {
                "question": "What is the title and central question of Cosmos's final chapter?",
                "options": ["How big is the universe?", "Who Speaks for Earth?", "Do aliens exist?", "How many stars are there?"],
                "correct_index": 1,
                "explanation": "'Who Speaks for Earth?' — this question runs through all of Cosmos. Only we can advocate for our planet."
            },
            {
                "question": "What is Carl Sagan's ultimate message through Cosmos?",
                "options": ["The universe is scary and dangerous", "Science is only for a few geniuses", "We are children of the cosmos, and we must love and protect humanity and Earth", "We need to find aliens quickly"],
                "correct_index": 2,
                "explanation": "We're made of star stuff, children of the cosmos. Therefore we must love humanity and protect Earth — that's Sagan's lifelong message."
            }
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

        print(f"  ✓ Lesson {idx+1}: {lesson['title']}")

    print(f"\nDone! Inserted {len(LESSONS)} lessons with quizzes.")


if __name__ == "__main__":
    main()
