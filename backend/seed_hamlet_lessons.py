"""Seed handcrafted demo lessons for Hamlet by William Shakespeare."""
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

BOOK_ID = "2021cd07"

COVER_URL = "https://covers.openlibrary.org/b/isbn/9780743477123-L.jpg"


def ensure_book():
    sb = get_supabase()
    sb.table("books").upsert({
        "id": BOOK_ID,
        "title": "햄릿",
        "author": "윌리엄 셰익스피어",
        "color": "#10b981",
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
        "author": "윌리엄 셰익스피어",
    }).eq("id", BOOK_ID).execute()
    print("  ✓ Updated book cover_url & author in DB")


# ══════════════════════════════════════════════════════════════
# LESSONS — Korean content
# ══════════════════════════════════════════════════════════════

LESSONS = [

    # ══════════════════════════════════════════
    # 1부: 엘시노어 성의 비밀
    # ══════════════════════════════════════════

    # ── Ch.1 엘시노어 성의 비밀 (Part 1/2) ──
    {
        "title": "덴마크 왕자 햄릿 — 아버지는 죽고, 어머니는 배신했다",
        "chapter": "Ch.1 The Ghost of Elsinore",
        "chapter_title": "엘시노어 성의 비밀",
        "part": 1, "total_parts": 2,
        "spark": "아버지의 장례식이 끝난 지 한 달도 안 돼서, 어머니가 작은아버지와 결혼했다. 그리고 왕좌는 나 대신 작은아버지에게 돌아갔다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "자, 햄릿. 이름은 다들 알지? 덴마크의 왕자야. 근데 이 사람 하면 뭐가 떠올라? 우유부단함의 아이콘, 'To be or not to be'. 오늘은 이 비극의 시작부터 끝까지 같이 가볼 거야.", "highlight": None},
            {"speaker": "cosmii", "text": "배경은 12세기 덴마크, 수도 엘시노어 성이야. 햄릿은 독일 비텐베르크에서 유학 중이었는데, 아버지의 갑작스러운 죽음 소식을 듣고 고향으로 돌아와.", "highlight": "엘시노어 성"},
            {"speaker": "cosmii", "text": "아버지가 어떻게 돌아가셨냐면 — 정원에서 낮잠을 주무시다가 뱀에게 물려서 급서하셨다는 거야. 정원에서 낮잠 자다 뱀에 물렸다고? 황당하지?", "highlight": "뱀에 물려 죽다"},
            {"speaker": "cosmii", "text": "근데 더 황당한 건 이거야. 아버지가 돌아가시면 왕세자인 내가 왕이 되어야 하잖아? 그런데 작은아버지 클로디어스가 왕이 된 거야.", "highlight": "왕좌를 빼앗기다"},
            {"speaker": "cosmii", "text": "그것만이 아니야. 아버지 장례식이 끝나고 채 한 달도 안 돼서 — 어머니 거트루드가 작은아버지 클로디어스와 결혼을 해버려. 시동생이랑!", "highlight": "한 달 만의 재혼"},
            {"speaker": "cosmii", "text": "햄릿의 심정을 상상해봐. 아버지는 갑자기 죽고, 왕위는 뺏기고, 어머니는 작은아버지와 재혼하고. 이 모든 게 한 달 안에 벌어진 거야. 이 상태에서 보초병들이 찾아와 — '왕자님, 드릴 말씀이 있습니다.'", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "햄릿의 아버지는 공식적으로 어떻게 사망한 것으로 알려졌는가?",
                "options": ["전투 중 전사", "정원에서 낮잠 중 뱀에 물려 급서", "병으로 사망", "독을 마시고 사망"],
                "correct_index": 1,
                "explanation": "공식적으로는 정원에서 낮잠을 자다가 뱀에게 물려 급서했다고 알려졌어. 하지만 진실은 훨씬 끔찍하지."
            },
            {
                "question": "햄릿이 고향에 돌아와서 겪은 충격적인 일은?",
                "options": ["친구가 배신한 것", "작은아버지가 왕이 되고 어머니가 그와 재혼한 것", "성이 불타버린 것", "유학을 못 가게 된 것"],
                "correct_index": 1,
                "explanation": "아버지가 죽자 왕위는 작은아버지 클로디어스에게 돌아갔고, 어머니 거트루드는 장례식 한 달도 안 돼서 클로디어스와 재혼했어."
            }
        ],
        "cliffhanger": "보초병들이 전해준 소식이 뭐냐고? 한밤중에 성벽 위에서 죽은 왕의 유령이 나타난다는 거야. 햄릿은 직접 확인하러 가기로 해."
    },

    # ── Ch.1 엘시노어 성의 비밀 (Part 2/2) ──
    {
        "title": "유령이 전한 진실 — 네 아버지는 살해당한 것이다",
        "chapter": "Ch.1 The Ghost of Elsinore",
        "chapter_title": "엘시노어 성의 비밀",
        "part": 2, "total_parts": 2,
        "spark": "'아들아, 나는 뱀에 물려 죽은 게 아니다. 네 작은아버지 클로디어스가 내 귀에 독을 부었다. 내가 네 아들이면, 복수해줘라.'",
        "dialogue": [
            {"speaker": "cosmii", "text": "보초병들이 말한 게 사실이었어. 한밤중 엘시노어 성벽에서, 보초를 서던 세 사람이 은밀하게 이야기를 나눠 — '오늘도 그가 나타날까?' '진짜라니까, 내가 직접 봤어.'", "highlight": "보초병들의 목격"},
            {"speaker": "cosmii", "text": "소식을 듣고 햄릿의 절친 호레이쇼가 확인하러 가. 자정 무렵 종소리와 함께 — 유령이 나타나. 갑옷을 입은 모습, 죽은 왕과 똑같은 얼굴. 호레이쇼는 소름이 끼쳐서 햄릿에게 달려가 — '직접 보셔야 합니다!'", "highlight": "호레이쇼"},
            {"speaker": "cosmii", "text": "햄릿이 직접 성벽으로 가. 자정, 유령이 나타나. 아버지와 똑같아. 유령이 햄릿에게 손짓을 해 — 따라오라고. 친구들이 말리지만 햄릿은 뒤를 쫓아가.", "highlight": None},
            {"speaker": "cosmii", "text": "유령이 입을 열어 — '아들아, 나는 뱀에 물려 죽은 게 아니다. 네 작은아버지 클로디어스가 내가 잠든 사이에 귀에 독을 부었다. 나는 죄를 회개하지 못한 채 죽었기에, 유령이 되어 구천을 떠도는 것이다.'", "highlight": "귀에 독을 부었다"},
            {"speaker": "cosmii", "text": "그리고 유령이 마지막으로 이렇게 말해 — '내가 네 아버지라면, 복수해줘라.' 이 한마디가 햄릿의 운명을 바꿔.", "highlight": "복수해줘라"},
            {"speaker": "cosmii", "text": "지금 햄릿의 머릿속을 상상해봐. 죽은 아버지의 유령이 나타나서, 작은아버지가 범인이라고 말해. 그 작은아버지가 지금 왕이고, 어머니의 남편이야. 심증은 있는데 물증은 없어. 어떻게 할 거야?", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "유령이 밝힌 왕의 진짜 사인은?",
                "options": ["뱀에게 물려 죽었다", "전쟁에서 전사했다", "클로디어스가 잠든 사이 귀에 독을 부었다", "음식에 독을 탔다"],
                "correct_index": 2,
                "explanation": "유령은 클로디어스가 자신이 잠든 사이에 귀에 독을 부어 살해했다고 밝혀. '뱀에 물렸다'는 건 거짓이었던 거야."
            },
            {
                "question": "유령이 구천을 떠도는 이유는?",
                "options": ["복수를 위해서", "죄를 회개하지 못한 채 죽었기 때문에", "왕위를 되찾기 위해서", "아들이 보고 싶어서"],
                "correct_index": 1,
                "explanation": "갑자기 살해당했기 때문에 죄를 회개할 기회가 없었어. 그래서 성불하지 못하고 유령이 되어 떠도는 거야."
            }
        ],
        "cliffhanger": "심증은 있는데 물증은 없어. 상대는 나라의 왕이야. 햄릿은 어떤 전략을 택할까? 바로 — 미친 척하기."
    },

    # ══════════════════════════════════════════
    # 2부: 광기의 가면
    # ══════════════════════════════════════════

    # ── Ch.2 광기의 가면 (Part 1/3) ──
    {
        "title": "미친 척하는 왕자 — 햄릿의 위장 전략",
        "chapter": "Ch.2 The Mask of Madness",
        "chapter_title": "광기의 가면",
        "part": 1, "total_parts": 3,
        "spark": "심증은 있지만 물증이 없다. 상대는 군대를 거느린 왕이다. 시간을 벌기 위한 햄릿의 선택 — 미친 척하기.",
        "dialogue": [
            {"speaker": "cosmii", "text": "자, 햄릿 입장에서 생각해봐. 작은아버지가 아버지를 죽인 건 거의 확실해. 근데 상대가 누구야? 왕이야. 군대를 가지고 있어. 내가 당장 '네가 범인이지!' 하면? 나만 죽어.", "highlight": None},
            {"speaker": "cosmii", "text": "그래서 햄릿이 뭘 하냐면 — 미친 척해. 완벽하게. 궁궐이 발칵 뒤집혀. '왕자님이 미치셨다!' 왜 미친 거냐? 모두가 궁금해하기 시작해.", "highlight": "미친 척하기"},
            {"speaker": "cosmii", "text": "이때 중요한 인물이 등장해. 오필리어. 햄릿의 썸녀... 아니, 사랑하는 여인이야. 오필리어의 아버지 폴로니어스는 왕을 보좌하는 대신이야.", "highlight": "오필리어"},
            {"speaker": "cosmii", "text": "폴로니어스가 딸에게 물어 — '혹시 요즘 왕자님 만난 적 있니?' 오필리어가 대답해 — '왕자님이 새파랗게 질린 얼굴로, 무릎을 부들부들 떨면서 저한테 달려드셨어요.'", "highlight": "오필리어의 증언"},
            {"speaker": "cosmii", "text": "폴로니어스가 묻지 — '그전에 그 사람이 구혼했니?' '네, 엄청나게 사랑을 구했는데, 아버지 말씀대로 꿋꿋하게 거절했어요.' — 폴로니어스는 확신해 — '우리 딸이 사랑을 안 받아줘서 미친 거야!'", "highlight": "사랑 때문에 미쳤다?"},
            {"speaker": "cosmii", "text": "폴로니어스는 이 사실을 왕에게 보고해. 클로디어스도 '사랑 때문에 미쳤구나'라고 믿기 시작해. 햄릿의 위장이 완벽하게 먹히고 있는 거야. 그 사이에 햄릿은 진짜 복수 계획을 세우고 있어.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "햄릿이 미친 척한 이유는?",
                "options": ["정말로 미쳐서", "오필리어에게 차여서", "복수 계획을 세울 시간을 벌기 위해", "왕위에 관심이 없어서"],
                "correct_index": 2,
                "explanation": "상대가 군대를 가진 왕이니까 당장 행동하면 죽어. 미친 척해서 경계심을 풀게 하고, 그 사이에 복수 계획을 세우는 전략이야."
            },
            {
                "question": "폴로니어스가 햄릿이 미친 이유라고 판단한 것은?",
                "options": ["아버지의 죽음 때문에", "왕위를 빼앗겨서", "오필리어가 사랑을 거절해서", "유령을 봐서"],
                "correct_index": 2,
                "explanation": "오필리어가 아버지 말대로 햄릿의 사랑을 거절했거든. 폴로니어스는 '실연 때문에 미친 거다'라고 확신해. 햄릿의 위장이 완벽히 먹힌 거야."
            }
        ],
        "cliffhanger": "미친 척한 건 먹혀들었어. 근데 클로디어스도 가만있진 않아. 햄릿의 옛 친구 둘을 스파이로 보내거든. 그리고 폴로니어스도 직접 나서는데 — 햄릿의 '미친 말'이 이 노인을 완전히 뒤흔들어 놓아."
    },

    # ── Ch.2 광기의 가면 (Part 3/3) ──
    {
        "title": "사느냐 죽느냐 — 연극 속의 진실",
        "chapter": "Ch.2 The Mask of Madness",
        "chapter_title": "광기의 가면",
        "part": 3, "total_parts": 3,
        "spark": "'사느냐 죽느냐, 그것이 문제로다 — 가혹한 운명의 화살을 그대로 맞을 것이냐, 아니면 고난의 바다에 맞서 싸워 끝장을 낼 것이냐.'",
        "dialogue": [
            {"speaker": "cosmii", "text": "여기서 셰익스피어 역사상 가장 유명한 대사가 나와 — 'To be, or not to be, that is the question.' 사느냐 죽느냐, 그것이 문제로다.", "highlight": "To be or not to be"},
            {"speaker": "cosmii", "text": "'가혹한 운명의 화살을 있는 그대로 맞아야 하는 건지, 아니면 고난의 바다에 맞서 싸워서 끝장을 내야 하는 건지.' — 이건 단순히 자살 고민이 아니야. '이 썩어빠진 세상에 순응할 것이냐, 맞서 싸울 것이냐'는 실존적 질문이야.", "highlight": "실존적 질문"},
            {"speaker": "cosmii", "text": "이 독백 직후에 오필리어가 나타나. 하지만 햄릿은 미친 척을 유지해야 해. 사랑하는 사람에게 일부러 가혹한 말을 퍼부어 — '수녀원에 가라(Get thee to a nunnery)!' 오필리어는 상처받고 울지.", "highlight": "수녀원에 가라"},
            {"speaker": "cosmii", "text": "그리고 며칠 뒤, 햄릿의 복수 계획이 실행돼. 궁중 광대들을 불러모아서 직접 시나리오를 써. 제목은 '쥐덫(The Mousetrap)'. 내용이 뭐냐면 — 어느 나라 왕이 정원에서 잠들었는데, 동생이 귀에 독을 부어서 죽이고 왕비와 결혼한다는 이야기.", "highlight": "쥐덫"},
            {"speaker": "cosmii", "text": "햄릿이 친구 호레이쇼에게 부탁해 — '이 연극을 보는 동안 클로디어스 표정이 어떻게 변하는지 잘 지켜봐줘.' 연극이 시작되고, 왕이 잠든 장면이 나오고, 동생이 귀에 독을 붓는 장면이 나오는데...", "highlight": None},
            {"speaker": "cosmii", "text": "클로디어스의 손이 부들부들 떨리기 시작해. 그리고 독 붓는 장면에서 — '못 참겠다!' 벌떡 일어나서 나가버려. 그 순간 햄릿이 확신해 — '작은아버지가 진범이다.' 심증이 확증이 된 거야!", "highlight": "확신의 순간"}
        ],
        "quizzes": [
            {
                "question": "햄릿이 연극 '쥐덫'을 만든 목적은?",
                "options": ["궁중 오락을 위해", "클로디어스의 반응을 관찰해 범행을 확인하기 위해", "오필리어에게 보여주려고", "배우가 되고 싶어서"],
                "correct_index": 1,
                "explanation": "아버지의 죽음과 똑같은 내용의 연극을 보여주고 클로디어스의 반응을 관찰한 거야. 왕이 못 참고 나가면서 심증이 확증으로 바뀐 거지."
            },
            {
                "question": "'To be or not to be' 독백의 핵심 의미는?",
                "options": ["단순한 자살 고민", "먹느냐 안 먹느냐의 고민", "썩어빠진 세상에 순응할 것이냐 맞서 싸울 것이냐의 실존적 질문", "연극을 할 것인가 말 것인가"],
                "correct_index": 2,
                "explanation": "단순한 삶과 죽음의 문제가 아니라, 부조리한 현실에 순응할 것이냐 맞서 싸울 것이냐를 묻는 셰익스피어 최고의 실존적 질문이야."
            }
        ],
        "cliffhanger": "범인이 확실해졌어. 그런데 복수의 절호의 기회가 왔을 때, 햄릿은 칼을 거둬. 왜? 이게 바로 햄릿이 '우유부단'이라고 불리는 결정적 장면이야."
    },

    # ══════════════════════════════════════════
    # 3부: 엇갈린 복수
    # ══════════════════════════════════════════

    # ── Ch.3 엇갈린 복수 (Part 1/4) ──
    {
        "title": "기도하는 원수 — 햄릿은 왜 칼을 거두었나",
        "chapter": "Ch.3 The Tangled Revenge",
        "chapter_title": "엇갈린 복수",
        "part": 1, "total_parts": 4,
        "spark": "원수와 단둘이 있는 방. 칼을 꽂으면 끝이다. 그런데 햄릿은 칼을 거두고 돌아간다. 이유? 상대가 기도 중이었기 때문에.",
        "dialogue": [
            {"speaker": "cosmii", "text": "연극에서 들통난 클로디어스. 그날 밤, 양심의 가책을 느끼고 기도를 하게 돼. '내 죄의 악취가 하늘까지 올라가는구나. 인류 최초로 형제를 죽인 카인의 저주를 받고 있다.'", "highlight": "클로디어스의 기도"},
            {"speaker": "cosmii", "text": "클로디어스도 괴로운 거야. '이 피 묻은 손에 자비로운 하늘의 비가 내릴 만큼의 빗물이 있을까?' — 셰익스피어가 악당에게도 인간적 고뇌를 부여하는 순간이야.", "highlight": "악당의 고뇌"},
            {"speaker": "cosmii", "text": "그때 마침 햄릿이 지나가다가 클로디어스가 홀로 기도하는 걸 봐. 원수와 단둘이. 칼을 꽂으면 끝이야. 너라면 어떻게 하겠어?", "highlight": None},
            {"speaker": "cosmii", "text": "햄릿은... 칼을 거둬. 안 죽여. 왜? 지금 기도하는 사람을 죽이면 회개한 상태로 죽는 거잖아? 그러면 천국에 가. 근데 우리 아버지는? 회개할 기회도 없이 죽어서 유령이 되어 구천을 떠도는데?", "highlight": "칼을 거두다"},
            {"speaker": "cosmii", "text": "'육신에는 복수할 수 있지만, 영혼에는 복수할 수 없다.' 그래서 햄릿은 결정해 — '저놈이 더 큰 죄를 지을 때, 그때 죽이자.' 이게 바로 햄릿이 '우유부단의 대명사'가 된 장면이야.", "highlight": "우유부단의 대명사"},
            {"speaker": "cosmii", "text": "아이러니가 뭔지 알아? 클로디어스는 사실 이 기도에서도 진심으로 회개하지 못했어. 기도를 마치면서 이렇게 말하거든 — '말은 하늘로 올라가지만, 마음은 땅에 머문다.' 빈 기도였던 거야. 햄릿이 그냥 죽였어도 됐어!", "highlight": "빈 기도"}
        ],
        "quizzes": [
            {
                "question": "햄릿이 기도 중인 클로디어스를 죽이지 않은 이유는?",
                "options": ["겁이 나서", "기도 중에 죽으면 회개한 상태로 천국에 갈 수 있어서, 영혼까지 복수가 안 되니까", "칼이 없어서", "클로디어스가 범인이 아닐 수도 있어서"],
                "correct_index": 1,
                "explanation": "기도(회개) 중에 죽이면 천국에 갈 수 있잖아. 자기 아버지는 회개 없이 죽어서 유령이 됐는데, 원수에게 천국을 보내줄 수는 없다는 논리야."
            },
            {
                "question": "클로디어스 기도 장면의 아이러니는?",
                "options": ["진심으로 회개해서 선해진 것", "사실 기도가 빈 기도여서 햄릿이 그냥 죽였어도 됐다는 것", "기도를 하지 않은 것", "햄릿이 기도를 함께 한 것"],
                "correct_index": 1,
                "explanation": "클로디어스는 '말은 하늘로 올라가지만 마음은 땅에 머문다'고 했어. 진심이 아닌 빈 기도였으니, 햄릿이 그때 죽였어도 영혼 복수가 됐을 거야."
            }
        ],
        "cliffhanger": "기도 장면을 지나친 햄릿은 어머니 방으로 향해. 어머니에게 진실을 따지러. 그런데 커튼 뒤에 누군가가 숨어 있었어."
    },

    # ── Ch.3 엇갈린 복수 (Part 2/4) ──
    {
        "title": "커튼 뒤의 비극 — 폴로니어스의 죽음",
        "chapter": "Ch.3 The Tangled Revenge",
        "chapter_title": "엇갈린 복수",
        "part": 2, "total_parts": 4,
        "spark": "어머니와 말다툼 중에 커튼 뒤에서 '사람 살려!'라는 소리가 들렸다. 햄릿은 칼을 뽑아 커튼을 찔렀다. 쓰러진 건 클로디어스가 아니었다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "폴로니어스가 왕에게 제안해 — '제가 왕비와 햄릿의 대화를 커튼 뒤에서 엿들어 보겠습니다.' 그리고 왕비의 방 커튼 뒤에 숨어.", "highlight": "커튼 뒤의 폴로니어스"},
            {"speaker": "cosmii", "text": "햄릿이 어머니 방에 들어와서 따져 — '어머니, 이 초상화 보세요. 이 사람이 진짜 아버지예요. 그리고 이놈은요? 짐승만도 못한 지금의 남편이에요. 어머니는 어떻게 그렇게 경박하게 재혼하셨어요?'", "highlight": "두 초상화"},
            {"speaker": "cosmii", "text": "어머니가 당황해서 소리를 질러 — '날 죽이려는 거야!' 그 순간 커튼 뒤에서 폴로니어스가 외쳐 — '사람 살려!'", "highlight": None},
            {"speaker": "cosmii", "text": "햄릿이 '웬 쥐새끼냐!' 하면서 칼을 뽑아 커튼을 찔러. 커튼 뒤에서 쓰러진 건... 클로디어스가 아니라 오필리어의 아버지 폴로니어스였어. 사랑하는 여인의 아버지를 죽인 거야.", "highlight": "폴로니어스의 죽음"},
            {"speaker": "cosmii", "text": "그래도 햄릿은 멈추지 않아. 어머니에게 두 초상화를 들이밀며 — '이 사람이 진짜 남편이에요. 어머니의 눈이 어디 붙었어요? 부끄러운 줄 아세요!' 어머니가 울면서 — '제발 그만해라, 네 말이 비수가 되어 가슴에 꽂힌다!'", "highlight": "비수가 되어"},
            {"speaker": "cosmii", "text": "그때 아버지의 유령이 다시 나타나 — '햄릿, 뭘 하는 거야? 어머니를 괴롭히지 말라고 했잖아.' 하지만 어머니 눈에는 유령이 안 보여. '봐라, 완전히 미친 거야!' — 어머니는 아들이 진짜 미쳤다고 확신해버려.", "highlight": "유령의 재등장"}
        ],
        "quizzes": [
            {
                "question": "햄릿이 커튼을 찔러 죽인 사람은?",
                "options": ["클로디어스", "호레이쇼", "오필리어의 아버지 폴로니어스", "오필리어"],
                "correct_index": 2,
                "explanation": "커튼 뒤에 숨어서 대화를 엿듣던 폴로니어스를 죽인 거야. 클로디어스인 줄 알고 찔렀는데, 사랑하는 여인의 아버지를 죽여버린 비극이지."
            },
            {
                "question": "햄릿이 어머니에게 두 초상화를 보여주며 한 것은?",
                "options": ["미술 감상을 권유한 것", "돌아가신 아버지와 지금 남편을 비교하며 재혼을 비난한 것", "선물을 드린 것", "장식을 바꿔달라고 한 것"],
                "correct_index": 1,
                "explanation": "아버지의 고귀한 모습과 '짐승만도 못한' 클로디어스를 비교하면서, 어머니의 경박한 재혼을 격렬하게 비난한 거야."
            }
        ],
        "cliffhanger": "폴로니어스를 죽인 대가는 가혹해. 클로디어스는 햄릿을 영국으로 추방하기로 결정하거든. 그런데 영국행 편지에는 끔찍한 비밀이 숨어 있어."
    },

    # ══════════════════════════════════════════
    # 4부: 죽음의 결투
    # ══════════════════════════════════════════

    # ── Ch.4 죽음의 결투 (Part 1/3) ──
    {
        "title": "오필리어의 죽음 — 복수의 부메랑",
        "chapter": "Ch.4 The Final Duel",
        "chapter_title": "죽음의 결투",
        "part": 1, "total_parts": 3,
        "spark": "아버지를 잃고 실성한 오필리어는 꽃을 들고 노래를 부르다가 시냇물에 빠져 죽는다. 햄릿의 복수가 부메랑이 되어 돌아오기 시작한다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "오필리어의 오빠 레어티즈. 프랑스에서 검술을 공부하고 있었는데, 아버지가 죽었다는 소식에 급히 돌아와. 왕에게 따져 — '우리 아버지를 왜 죽였습니까! 복수해주십시오!'", "highlight": "레어티즈의 귀환"},
            {"speaker": "cosmii", "text": "클로디어스가 교묘하게 말해 — '자네 아버지를 죽인 건 내가 아니야. 바로 그 미친 놈 햄릿이지. 복수의 칼날은 그를 향해야 해.' 레어티즈는 분노에 타올라.", "highlight": "클로디어스의 조종"},
            {"speaker": "cosmii", "text": "그때 왕비가 달려와 — '오필리어가... 물에 빠져 죽었습니다.' 아버지를 잃고 실성해버린 오필리어. 꽃을 들고 노래를 부르며 떠돌다가, 시냇물에 빠져서 그대로 가라앉은 거야.", "highlight": "오필리어의 죽음"},
            {"speaker": "cosmii", "text": "레어티즈의 심정을 생각해봐 — 아버지는 햄릿에게 살해당하고, 여동생은 그 충격으로 실성해서 물에 빠져 죽고. 모든 게 햄릿 때문이야.", "highlight": None},
            {"speaker": "cosmii", "text": "클로디어스가 레어티즈에게 제안해 — '검술 시합을 통해서 햄릿을 제거하세. 자네는 진검에 독을 바르고, 햄릿에게는 연습용 칼을 줘.' 레어티즈가 동의해 — '그리고 칼끝에 독을 바르겠습니다.'", "highlight": "독이 묻은 검"},
            {"speaker": "cosmii", "text": "클로디어스는 보험까지 들어 — '내가 포도주에도 독을 타겠다. 검술이 실패하면, 목이 마른 햄릿이 포도주를 마시게 될 거야.' 이중 장치. 독검과 독술. 함정이 완성됐어.", "highlight": "이중 함정"}
        ],
        "quizzes": [
            {
                "question": "오필리어가 죽은 원인은?",
                "options": ["전투에서 죽었다", "독을 먹었다", "아버지의 죽음으로 실성한 뒤 물에 빠져 죽었다", "병으로 사망했다"],
                "correct_index": 2,
                "explanation": "아버지 폴로니어스가 햄릿에게 살해당한 충격으로 실성해서, 꽃을 들고 노래를 부르며 떠돌다가 시냇물에 빠져 죽은 거야."
            },
            {
                "question": "클로디어스와 레어티즈가 햄릿을 죽이기 위해 준비한 이중 함정은?",
                "options": ["독이 묻은 진검과 독이 든 포도주", "함정 구덩이와 화살", "화재와 암살자", "독이 든 음식과 뱀"],
                "correct_index": 0,
                "explanation": "레어티즈는 독을 바른 진검을, 클로디어스는 독이 든 포도주를 준비해. 검술이 실패하면 포도주로 죽이는 이중 장치야."
            }
        ],
        "cliffhanger": "무대는 결투장으로 옮겨져. 독검과 독술이 준비된 곳. 그런데 이 독은 예상치 못한 방향으로 퍼져나가게 돼."
    },

    # ── Ch.4 죽음의 결투 (Part 2/3) ──
    {
        "title": "독이 퍼진 경기장 — 모두가 쓰러지다",
        "chapter": "Ch.4 The Final Duel",
        "chapter_title": "죽음의 결투",
        "part": 2, "total_parts": 3,
        "spark": "독검, 독술, 그리고 운명의 장난. 결투장에서 독은 예상치 못한 방향으로 퍼져나가고, 무대 위에 서 있던 모든 사람이 쓰러진다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "결투 전, 햄릿이 레어티즈에게 진심으로 사과해 — '여보게 레어티즈, 자네의 효심과 명예심에 반감을 산 일은 나의 광기 때문이었네. 자네 아버지를 죽인 건 내가 아니라 내 속의 광기였다고.' 레어티즈의 마음이 약간 누그러져.", "highlight": "햄릿의 사과"},
            {"speaker": "cosmii", "text": "결투가 시작돼. 첫 번째 판 — 햄릿이 1점을 따! 클로디어스의 표정이 굳어. '목마르겠다, 마셔라' — 독이 든 포도주를 권하지만 햄릿은 거절해.", "highlight": None},
            {"speaker": "cosmii", "text": "그때 왕비 거트루드가 일어나서 아들의 땀을 닦아주며 — '아이고 우리 아들, 목마르겠구나' 하면서 그 독이 든 포도주 잔을 가져다 마셔버려! 클로디어스가 막으려 하지만 이미 늦었어.", "highlight": "왕비가 독주를 마시다"},
            {"speaker": "cosmii", "text": "세 번째 판에서 레어티즈가 독검으로 햄릿을 찔러 상처를 입혀. 그리고 뒤엉키는 와중에 칼이 바뀌어 — 이번에는 햄릿이 독검으로 레어티즈를 찔러!", "highlight": "칼이 바뀌다"},
            {"speaker": "cosmii", "text": "왕비가 쓰러지며 외쳐 — '포도주에 독이 들어 있었다!' 죽어가는 레어티즈가 고백해 — '왕비도, 나도, 당신도... 전부 왕의 계략이었소. 칼끝의 독도, 잔 속의 독도 전부!' — 햄릿이 마침내 독검으로 클로디어스를 찔러 — '정의의 칼을 받아라!'", "highlight": "최후의 복수"},
            {"speaker": "cosmii", "text": "죽어가는 레어티즈가 햄릿에게 — '우리 둘 다 죽어가네요. 서로 용서합시다.' 그리고 햄릿이 마지막 숨을 쉬며 친구 호레이쇼에게 — '끝까지 살아남아서, 인간의 욕망과 권력이 얼마나 많은 사람에게 비극을 가져오는지 후세에 꼭 전해주게.' 그렇게 햄릿이 눈을 감아.", "highlight": "후세에 전해주게"}
        ],
        "quizzes": [
            {
                "question": "독이 든 포도주를 마신 사람은 누구인가?",
                "options": ["햄릿", "레어티즈", "왕비 거트루드", "호레이쇼"],
                "correct_index": 2,
                "explanation": "클로디어스가 햄릿을 위해 준비한 독주를, 아들의 땀을 닦아주던 왕비 거트루드가 마셔버린 거야. 자신의 아내마저 자기 독으로 죽인 거지."
            },
            {
                "question": "햄릿이 호레이쇼에게 남긴 마지막 부탁은?",
                "options": ["복수를 이어달라는 것", "왕이 되라는 것", "살아남아서 이 비극을 후세에 전해달라는 것", "오필리어의 무덤에 꽃을 놓아달라는 것"],
                "correct_index": 2,
                "explanation": "'인간의 욕망과 권력이 얼마나 많은 사람에게 비극을 가져오는지 후세에 전해달라' — 이게 햄릿의 유언이야. 그래서 이 이야기가 지금까지 전해지는 거지."
            }
        ],
        "cliffhanger": "모두가 쓰러진 무대 위. 나팔 소리가 울리고, 노르웨이 왕자 포틴브라스가 도착해. 그리고 호레이쇼가 입을 열어 — 이 비극을 세상에 전하기 시작해."
    },
]


# ══════════════════════════════════════════════════════════════
# TRANSLATIONS_EN — English translations
# ══════════════════════════════════════════════════════════════

TRANSLATIONS_EN = {
    0: {
        "title": "Prince Hamlet of Denmark — Father Dead, Mother's Betrayal",
        "chapter_title": "The Ghost of Elsinore",
        "spark": "Less than a month after his father's funeral, his mother married his uncle. And the throne went to that uncle instead of him.",
        "cliffhanger": "What did the guards tell him? A ghost — the dead king's ghost — has been appearing on the castle walls at midnight. Hamlet decides to see for himself.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Hamlet. Everyone knows the name. The Prince of Denmark. But what comes to mind? The icon of indecisiveness, 'To be or not to be.' Today we're going through this tragedy from start to finish.", "highlight": None},
            {"speaker": "cosmii", "text": "The setting is 12th-century Denmark, Elsinore Castle. Hamlet was studying abroad in Wittenberg, Germany, when he received the shocking news of his father's sudden death and rushed home.", "highlight": "Elsinore Castle"},
            {"speaker": "cosmii", "text": "How did his father die? The official story: he was napping in the garden when a snake bit him fatally. Napping in a garden, killed by a snake? Absurd, right?", "highlight": "Killed by a snake"},
            {"speaker": "cosmii", "text": "But here's the truly outrageous part. When the king dies, the crown prince becomes king, right? But instead, Uncle Claudius took the throne.", "highlight": "Throne stolen"},
            {"speaker": "cosmii", "text": "That's not all. Less than a month after the funeral, his mother Gertrude married Uncle Claudius. Her brother-in-law!", "highlight": "Remarried within a month"},
            {"speaker": "cosmii", "text": "Imagine Hamlet's state of mind. Father suddenly dead, throne stolen, mother remarried to the uncle — all within a month. In this state, the guards come to him: 'Your Highness, we need to tell you something.'", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "How was Hamlet's father officially reported to have died?",
                "options": ["Killed in battle", "Bitten by a snake while napping in the garden", "Died of illness", "Died by drinking poison"],
                "correct_index": 1,
                "explanation": "The official story was that he was bitten by a snake while napping in the garden. But the truth is far more horrifying."
            },
            {
                "question": "What shocking situation did Hamlet find upon returning home?",
                "options": ["His friend had betrayed him", "His uncle became king and his mother married the uncle", "The castle had burned down", "He was barred from studying abroad"],
                "correct_index": 1,
                "explanation": "When his father died, the throne went to Uncle Claudius, and mother Gertrude remarried Claudius less than a month after the funeral."
            }
        ],
    },
    1: {
        "title": "The Ghost's Truth — Your Father Was Murdered",
        "chapter_title": "The Ghost of Elsinore",
        "spark": "'Son, I was not killed by a snake. Your uncle Claudius poured poison in my ear while I slept. If you are my son, avenge me.'",
        "cliffhanger": "He suspects the truth but has no proof. His opponent is the king. What strategy does Hamlet choose? To feign madness.",
        "dialogue": [
            {"speaker": "cosmii", "text": "What the guards said was true. At midnight on Elsinore's walls, three guards whisper nervously — 'Will he appear tonight?' 'I'm telling you, I saw it with my own eyes.'", "highlight": "The guards' sighting"},
            {"speaker": "cosmii", "text": "Hamlet's best friend Horatio goes to verify. Near midnight, with the tolling of bells — a ghost appears. Wearing armor, with the dead king's exact face. Horatio rushes to Hamlet — 'You must see this yourself!'", "highlight": "Horatio"},
            {"speaker": "cosmii", "text": "Hamlet goes to the walls himself. At midnight, the ghost appears. Identical to his father. It beckons — follow me. Despite his friends' warnings, Hamlet follows.", "highlight": None},
            {"speaker": "cosmii", "text": "The ghost speaks: 'Son, I was not killed by a snake. Your uncle Claudius poured poison in my ear while I slept. I died without repenting my sins, so I wander as a ghost, unable to find rest.'", "highlight": "Poison in the ear"},
            {"speaker": "cosmii", "text": "And the ghost's final words: 'If you are my son, avenge me.' This single sentence changes Hamlet's fate forever.", "highlight": "Avenge me"},
            {"speaker": "cosmii", "text": "Imagine what's going through Hamlet's mind. His dead father's ghost reveals that his uncle is the murderer. That uncle is now the king and his mother's husband. He suspects it's true but has zero proof. What would you do?", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "What was the real cause of the king's death, according to the ghost?",
                "options": ["Bitten by a snake", "Killed in war", "Claudius poured poison in his ear while he slept", "Poisoned food"],
                "correct_index": 2,
                "explanation": "The ghost revealed that Claudius poured poison into his ear while he slept. The 'snake bite' story was a lie."
            },
            {
                "question": "Why does the ghost wander as a spirit?",
                "options": ["To seek revenge", "Because he died without the chance to repent his sins", "To reclaim the throne", "Because he misses his son"],
                "correct_index": 1,
                "explanation": "He was suddenly murdered, so he had no chance to repent. Unable to find peace, he wanders as a ghost."
            }
        ],
    },
    2: {
        "title": "The Mad Prince — Hamlet's Disguise Strategy",
        "chapter_title": "The Mask of Madness",
        "spark": "He suspects the truth but has no proof. His opponent is a king with an army. Hamlet's choice to buy time: pretend to be insane.",
        "cliffhanger": "The madness act is working. But Claudius isn't sitting still — he sends two of Hamlet's old friends as spies. And Polonius steps in himself, only to be rattled to the core by Hamlet's 'mad' words.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Put yourself in Hamlet's shoes. His uncle almost certainly murdered his father. But who's the opponent? The king. With an army. If Hamlet accuses him outright? He's dead.", "highlight": None},
            {"speaker": "cosmii", "text": "So what does Hamlet do? He feigns madness. Perfectly. The palace is in uproar — 'The prince has gone mad!' Why? Everyone starts speculating.", "highlight": "Feigning madness"},
            {"speaker": "cosmii", "text": "Enter an important character: Ophelia. Hamlet's love interest. Her father Polonius is the king's chief advisor.", "highlight": "Ophelia"},
            {"speaker": "cosmii", "text": "Polonius asks his daughter: 'Have you seen the prince lately?' Ophelia answers: 'He came to me with a face pale as death, his knees trembling, and threw himself at me.'", "highlight": "Ophelia's testimony"},
            {"speaker": "cosmii", "text": "Polonius presses: 'Did he ever court you?' 'Yes, he declared his love passionately, but I firmly rejected him as you told me to.' Polonius is convinced — 'He went mad because our daughter rejected his love!'", "highlight": "Mad from heartbreak?"},
            {"speaker": "cosmii", "text": "Polonius reports to the king. Claudius also buys it — 'Lovesick madness.' Hamlet's disguise is working perfectly. Meanwhile, he's secretly planning his real revenge.", "highlight": None}
        ],
        "quizzes": [
            {
                "question": "Why did Hamlet pretend to be mad?",
                "options": ["He really was mad", "Ophelia rejected him", "To buy time for plotting his revenge", "He didn't care about the throne"],
                "correct_index": 2,
                "explanation": "His enemy was a king with an army. Acting mad lowers their guard while Hamlet secretly plots his revenge."
            },
            {
                "question": "What did Polonius conclude was the cause of Hamlet's madness?",
                "options": ["His father's death", "Losing the throne", "Ophelia rejecting his love", "Seeing the ghost"],
                "correct_index": 2,
                "explanation": "After hearing that Ophelia rejected Hamlet's love on his orders, Polonius was convinced heartbreak drove Hamlet mad. The disguise worked perfectly."
            }
        ],
    },
    3: {
        "title": "To Be or Not to Be — Truth Through Theater",
        "chapter_title": "The Mask of Madness",
        "spark": "To be or not to be, that is the question — whether \u2019tis nobler to suffer the slings and arrows of outrageous fortune, or take arms against a sea of troubles and end them.",
        "cliffhanger": "The culprit is confirmed. But when the perfect opportunity for revenge arrives, Hamlet sheathes his sword. Why? This is THE scene that makes him the icon of indecision.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Here comes the most famous line in all of Shakespeare: 'To be, or not to be, that is the question.'", "highlight": "To be or not to be"},
            {"speaker": "cosmii", "text": "\"Whether \u2019tis nobler to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles, and by opposing end them.\" This isn't simply about suicide — it's an existential question: submit to this rotten world, or fight back?", "highlight": "Existential question"},
            {"speaker": "cosmii", "text": "Right after this soliloquy, Ophelia appears. But Hamlet must maintain his act. He hurls cruel words at the woman he loves — 'Get thee to a nunnery!' Ophelia is devastated.", "highlight": "Get thee to a nunnery"},
            {"speaker": "cosmii", "text": "Days later, Hamlet's plan unfolds. He gathers the court actors and writes a script himself. Title: 'The Mousetrap.' The plot? A king falls asleep in a garden, his brother pours poison in his ear, kills him, and marries the queen.", "highlight": "The Mousetrap"},
            {"speaker": "cosmii", "text": "Hamlet tells Horatio: 'Watch Claudius's face closely during this play.' The performance begins. The sleeping king scene plays out, the brother pours the poison...", "highlight": None},
            {"speaker": "cosmii", "text": "Claudius's hands begin to tremble. And at the poisoning scene — 'I can't bear this!' He leaps up and storms out. In that moment, Hamlet has his proof — 'My uncle IS the murderer.' Suspicion has become certainty!", "highlight": "The moment of certainty"}
        ],
        "quizzes": [
            {
                "question": "Why did Hamlet create the play 'The Mousetrap'?",
                "options": ["For court entertainment", "To observe Claudius's reaction and confirm his guilt", "To impress Ophelia", "He wanted to be an actor"],
                "correct_index": 1,
                "explanation": "He staged a play mirroring his father's murder and watched Claudius's reaction. When the king stormed out, suspicion became certainty."
            },
            {
                "question": "What is the core meaning of the 'To be or not to be' soliloquy?",
                "options": ["A simple contemplation of suicide", "Whether to eat or not", "An existential question about submitting to an unjust world or fighting against it", "Whether to perform a play or not"],
                "correct_index": 2,
                "explanation": "It's not merely about life and death — it's Shakespeare's greatest existential question: accept a corrupt reality or resist it?"
            }
        ],
    },
    4: {
        "title": "The Praying Enemy — Why Hamlet Sheathed His Sword",
        "chapter_title": "The Tangled Revenge",
        "spark": "Alone with his enemy. One thrust of the sword ends it all. But Hamlet walks away — because Claudius was praying.",
        "cliffhanger": "Passing the prayer scene, Hamlet heads to his mother's chamber to confront her. But someone is hiding behind the curtain.",
        "dialogue": [
            {"speaker": "cosmii", "text": "After being exposed by the play, Claudius feels the weight of guilt and begins to pray: 'O, my offence is rank, it smells to heaven. I bear the primal eldest curse — a brother's murder.'", "highlight": "Claudius's prayer"},
            {"speaker": "cosmii", "text": "Even Claudius suffers. 'Is there not rain enough in the sweet heavens to wash this cursed hand white as snow?' Shakespeare gives even the villain genuine human anguish.", "highlight": "The villain's anguish"},
            {"speaker": "cosmii", "text": "Then Hamlet passes by and sees Claudius praying alone. The enemy, alone and defenseless. One sword thrust ends everything. What would you do?", "highlight": None},
            {"speaker": "cosmii", "text": "Hamlet... sheathes his sword. He doesn't kill him. Why? If he kills a man mid-prayer, that man dies in a state of repentance — and goes to heaven. But Hamlet's father? He died without repentance and wanders in purgatory.", "highlight": "Sheathes his sword"},
            {"speaker": "cosmii", "text": "'I can avenge the body, but not the soul.' So Hamlet decides: 'I'll wait until he commits another sin.' THIS is the scene that forever brands Hamlet as the epitome of indecision.", "highlight": "Icon of indecision"},
            {"speaker": "cosmii", "text": "Here's the irony: Claudius wasn't truly repenting. After the prayer he admits: 'My words fly up, my thoughts remain below. Words without thoughts never to heaven go.' It was an empty prayer. Hamlet could have killed him!", "highlight": "Empty prayer"}
        ],
        "quizzes": [
            {
                "question": "Why didn't Hamlet kill Claudius during prayer?",
                "options": ["He was afraid", "Killing someone during repentance would send them to heaven — he couldn't avenge his father's soul", "He had no weapon", "He wasn't sure Claudius was guilty"],
                "correct_index": 1,
                "explanation": "If Claudius dies while repenting, he goes to heaven. But Hamlet's father died unrepentant and ended up in purgatory. Hamlet couldn't grant his enemy heaven."
            },
            {
                "question": "What is the irony of Claudius's prayer scene?",
                "options": ["He truly repented and became good", "The prayer was empty — Hamlet could have killed him after all", "He never prayed", "Hamlet joined in prayer"],
                "correct_index": 1,
                "explanation": "Claudius admitted: 'My words fly up, my thoughts remain below.' It was an empty prayer. Had Hamlet struck, the soul revenge would have worked too."
            }
        ],
    },
    5: {
        "title": "Tragedy Behind the Curtain — Polonius's Death",
        "chapter_title": "The Tangled Revenge",
        "spark": "During a confrontation with his mother, someone behind the curtain cries 'Help!' Hamlet draws his sword and stabs through the curtain. It wasn't Claudius.",
        "cliffhanger": "Killing Polonius comes at a steep price. Claudius decides to ship Hamlet off to England. But the letter he sends along carries a deadly secret.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Polonius proposes to the king: 'Let me hide behind the curtain and eavesdrop on Hamlet and the queen.' He conceals himself behind the drapes in the queen's chamber.", "highlight": "Polonius behind the curtain"},
            {"speaker": "cosmii", "text": "Hamlet bursts in and confronts his mother: 'Look at this portrait, Mother. THIS was your true husband. And this? This beast, your current one. How could you remarry so shamelessly?'", "highlight": "Two portraits"},
            {"speaker": "cosmii", "text": "Gertrude, terrified, cries out: 'Are you going to kill me?!' At that moment, Polonius screams from behind the curtain — 'Help! Help!'", "highlight": None},
            {"speaker": "cosmii", "text": "Hamlet shouts 'A rat!' and drives his sword through the curtain. Behind it falls... not Claudius, but Ophelia's father Polonius. He killed his beloved's father.", "highlight": "Polonius's death"},
            {"speaker": "cosmii", "text": "Hamlet doesn't stop. He thrusts the two portraits at his mother: 'THIS was your husband. Where are your eyes, Mother? Have you no shame?' She weeps: 'Stop! Your words are daggers plunging into my heart!'", "highlight": "Words like daggers"},
            {"speaker": "cosmii", "text": "Then the father's ghost reappears: 'Hamlet! What are you doing? I told you not to torment your mother.' But Gertrude can't see the ghost. 'See? He's truly mad!' — she becomes convinced her son has genuinely lost his mind.", "highlight": "Ghost reappears"}
        ],
        "quizzes": [
            {
                "question": "Who did Hamlet kill behind the curtain?",
                "options": ["Claudius", "Horatio", "Ophelia's father Polonius", "Ophelia"],
                "correct_index": 2,
                "explanation": "Polonius was hiding behind the curtain to eavesdrop. Hamlet thought it might be Claudius and stabbed through — killing his beloved's father instead."
            },
            {
                "question": "What did Hamlet do by showing his mother two portraits?",
                "options": ["Invited her to appreciate art", "Compared his noble father to the 'beastly' Claudius, condemning her remarriage", "Gave her a gift", "Asked her to redecorate"],
                "correct_index": 1,
                "explanation": "He compared his father's noble image with the 'beastly' Claudius, furiously condemning his mother's hasty, shameless remarriage."
            }
        ],
    },
    6: {
        "title": "Ophelia's Death — Revenge Boomerangs",
        "chapter_title": "The Final Duel",
        "spark": "Driven mad by her father's death, Ophelia wanders singing with flowers, then drowns in a stream. Hamlet's revenge begins to boomerang.",
        "cliffhanger": "The stage shifts to the dueling ground. Poisoned sword, poisoned wine. But the poison will spread in directions no one expected.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Ophelia's brother Laertes was studying fencing in France. He rushes home upon hearing his father was killed. He demands of the king: 'Who killed my father? I demand justice!'", "highlight": "Laertes returns"},
            {"speaker": "cosmii", "text": "Claudius manipulates him cunningly: 'I didn't kill your father. That madman Hamlet did. Your blade of vengeance should point at him.' Laertes burns with fury.", "highlight": "Claudius's manipulation"},
            {"speaker": "cosmii", "text": "Then the queen rushes in: 'Ophelia has... drowned.' Driven mad by her father's death, Ophelia wandered singing with flowers, then fell into a stream and sank without struggle.", "highlight": "Ophelia's death"},
            {"speaker": "cosmii", "text": "Think about what Laertes is feeling — his father murdered by Hamlet, his sister driven insane from the shock and drowned. All because of Hamlet.", "highlight": None},
            {"speaker": "cosmii", "text": "Claudius proposes to Laertes: 'Challenge Hamlet to a fencing match. Use a real, poisoned blade while Hamlet gets a practice foil.' Laertes agrees: 'And I'll coat the tip with poison.'", "highlight": "Poisoned sword"},
            {"speaker": "cosmii", "text": "Claudius takes out insurance: 'I'll also poison the wine. If the sword fails, thirsty Hamlet will drink.' Double trap — poisoned blade and poisoned wine. The stage is set.", "highlight": "Double trap"}
        ],
        "quizzes": [
            {
                "question": "What caused Ophelia's death?",
                "options": ["Killed in battle", "Drank poison", "Went mad after her father's murder and drowned", "Died of illness"],
                "correct_index": 2,
                "explanation": "Driven mad by Polonius's murder at Hamlet's hands, Ophelia wandered with flowers, singing, until she fell into a stream and drowned."
            },
            {
                "question": "What double trap did Claudius and Laertes set for Hamlet?",
                "options": ["A poisoned sword and poisoned wine", "A pit trap and arrows", "Fire and an assassin", "Poisoned food and a snake"],
                "correct_index": 0,
                "explanation": "Laertes would use a poisoned sword, and Claudius would have poisoned wine as backup — a deadly double trap."
            }
        ],
    },
    7: {
        "title": "Poison Spreads — Everyone Falls",
        "chapter_title": "The Final Duel",
        "spark": "Poisoned sword, poisoned wine, and fate's cruel hand. Poison spreads in every direction across the dueling ground, and everyone standing on that stage falls.",
        "cliffhanger": "Everyone lies fallen on the stage. A trumpet sounds as Prince Fortinbras of Norway arrives. And Horatio begins to speak — to tell the world the story of this tragedy.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Before the duel, Hamlet sincerely apologizes to Laertes: 'What I have done to wound your honor and stir your resentment was my madness speaking. I did not kill your father — my madness did.' Laertes softens somewhat.", "highlight": "Hamlet's apology"},
            {"speaker": "cosmii", "text": "The duel begins. First bout — Hamlet scores! Claudius's face hardens. 'You must be thirsty, drink!' He pushes the poisoned wine, but Hamlet refuses.", "highlight": None},
            {"speaker": "cosmii", "text": "Then Queen Gertrude rises to wipe her son's sweat: 'My poor boy, you must be parched.' She picks up the poisoned wine goblet and drinks it! Claudius tries to stop her but it's too late.", "highlight": "Queen drinks the poison"},
            {"speaker": "cosmii", "text": "In the third bout, Laertes wounds Hamlet with the poisoned blade. In the scuffle, the swords switch — and Hamlet wounds Laertes with the poisoned blade in return!", "highlight": "Swords switched"},
            {"speaker": "cosmii", "text": "The queen collapses: 'The drink! The drink! I am poisoned!' Dying Laertes confesses: 'The queen, me, and you — all the king's doing. The blade's poison, the wine's poison — all his scheme!' Hamlet finally drives the poisoned sword into Claudius: 'The point envenomed too? Then, venom, do thy work!'", "highlight": "The final revenge"},
            {"speaker": "cosmii", "text": "Dying Laertes asks Hamlet: 'We're both dying. Let's forgive each other.' With his final breath, Hamlet tells his friend Horatio: 'Stay alive, and tell the world how human greed and power brought tragedy to all.' And Hamlet closes his eyes forever.", "highlight": "Tell the world"}
        ],
        "quizzes": [
            {
                "question": "Who drank the poisoned wine?",
                "options": ["Hamlet", "Laertes", "Queen Gertrude", "Horatio"],
                "correct_index": 2,
                "explanation": "The wine Claudius prepared for Hamlet was drunk by Queen Gertrude as she lovingly wiped her son's sweat. His own wife killed by his own poison."
            },
            {
                "question": "What was Hamlet's final request to Horatio?",
                "options": ["Continue the revenge", "Become king", "Survive and tell this tragedy to future generations", "Place flowers on Ophelia's grave"],
                "correct_index": 2,
                "explanation": "'Tell the world how greed and power brought tragedy to all' — that's Hamlet's dying wish. And it's why this story has been told for over 400 years."
            }
        ],
    },
}


# ══════════════════════════════════════════════════════════════
# NEW LESSONS — Korean content (to be inserted into LESSONS)
# Key: 0=Lesson A (index 3), 1=Lesson B (index 7),
#      2=Lesson C (index 8), 3=Lesson D (index 11)
# ══════════════════════════════════════════════════════════════

NEW_LESSONS_KO = [

    # ── NEW A: Ch.2 광기의 가면 (Part 2/3) — R&G, 생선장수, Words ──
    {
        "title": "생선장수와 스파이들 — 햄릿의 날카로운 언어 무기",
        "chapter": "Ch.2 The Mask of Madness",
        "chapter_title": "광기의 가면",
        "part": 2, "total_parts": 3,
        "spark": "클로디어스가 햄릿의 옛 친구 둘을 불러들였다. 스파이 역할이다. 그런데 햄릿은 진짜 미쳤을까? 이 남자의 '미친 말'에는 칼날이 숨어 있다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "클로디어스가 불안해지기 시작했어. '미친 왕자'의 진짜 원인을 알고 싶은 거야. 그래서 비밀 병기를 꺼내 — 햄릿의 대학 동기 둘을 불러. 로젠크란츠와 길든스턴이야.", "highlight": "로젠크란츠와 길든스턴"},
            {"speaker": "cosmii", "text": "이 둘의 임무? '옛 친구처럼 다가가서, 왕자가 왜 미쳤는지 알아내라.' 친구를 스파이로 보낸 거야. 클로디어스가 얼마나 햄릿을 경계하는지 알 수 있지?", "highlight": "친구를 스파이로"},
            {"speaker": "cosmii", "text": "근데 햄릿이 바보야? 이 두 녀석이 오자마자 바로 알아챘어 — '너희 스스로 왔어, 아니면 불려왔어?' 둘이 우물쭈물하자 — '아, 왕이 보낸 거구나.' 완벽하게 간파해.", "highlight": "간파"},
            {"speaker": "cosmii", "text": "한편 폴로니어스가 햄릿에게 다가오는데, 햄릿이 미친 척하면서 신경전을 벌여. 폴로니어스가 말을 걸면 — '당신 생선장수(fishmonger)지?' 폴로니어스가 당황해 — '생선장수라뇨?' 이게 사실 '뚜쟁이'라는 뜻도 있거든. 딸을 미끼로 보낸 걸 꼬집은 거야.", "highlight": "생선장수(fishmonger)"},
            {"speaker": "cosmii", "text": "폴로니어스가 물어 — '뭘 읽고 계시죠?' 햄릿의 대답 — '말, 말, 말(Words, words, words).' 이게 단순히 미친 대답 같지? 하지만 속뜻은 — '당신들의 말은 전부 빈 말이야. 의미 없는 소리.' 미친 척하면서 진실을 던지는 거야.", "highlight": "Words, words, words"},
            {"speaker": "cosmii", "text": "폴로니어스가 혼잣말로 이러거든 — 'Though this be madness, yet there is method in it(미쳤긴 한데, 그 속에 뭔가 질서가 있어).' 이 한 줄이 핵심이야. 햄릿의 '광기'는 날카로운 무기야. 미친 말 속에 진실을 숨기고, 상대를 시험하고, 적을 교란시키는 전략이지.", "highlight": "미친 속에 질서가 있다"}
        ],
        "quizzes": [
            {
                "question": "클로디어스가 로젠크란츠와 길든스턴을 부른 이유는?",
                "options": ["햄릿의 유학을 도와주려고", "햄릿이 미친 진짜 이유를 알아내기 위해 스파이로 보낸 것", "궁정 연회를 준비하려고", "햄릿에게 검술을 가르치려고"],
                "correct_index": 1,
                "explanation": "클로디어스가 햄릿의 옛 친구를 이용해 왕자가 미친 원인을 캐내려 한 거야. 친구의 탈을 쓴 스파이지."
            },
            {
                "question": "햄릿이 폴로니어스에게 '생선장수(fishmonger)'라고 부른 이유는?",
                "options": ["정말 생선장수로 착각해서", "미친 척하면서 딸을 미끼로 보낸 걸 꼬집은 것", "생선을 좋아해서", "아무 뜻 없는 미친 말"],
                "correct_index": 1,
                "explanation": "Fishmonger에는 '뚜쟁이'라는 속뜻이 있어. 폴로니어스가 딸 오필리어를 미끼로 써서 햄릿을 떠보게 한 걸 정확히 꿰뚫은 거야. 미친 척하면서 날카로운 칼날을 꽂은 거지."
            }
        ],
        "cliffhanger": "로젠크란츠와 길든스턴은 간파당하고, 폴로니어스는 농락당했어. 근데 미친 척만으로는 부족해. 햄릿에게 진짜 필요한 건 물증이야. 그때 마침 떠돌이 극단이 성에 도착하는데 — 햄릿의 눈이 번쩍 뜨여."
    },

    # ── NEW B: Ch.3 엇갈린 복수 (Part 3/4) — 영국행, 편지 바꿔치기 ──
    {
        "title": "영국으로 보내진 왕자 — 편지 바꿔치기와 포틴브라스의 그림자",
        "chapter": "Ch.3 The Tangled Revenge",
        "chapter_title": "엇갈린 복수",
        "part": 3, "total_parts": 4,
        "spark": "클로디어스가 햄릿을 영국으로 보낸다. 표면적 이유는 '기분전환'. 진짜 이유? 봉인된 편지 안에 '이 사람을 죽여라'라고 쓰여 있다.",
        "dialogue": [
            {"speaker": "cosmii", "text": "폴로니어스를 죽인 햄릿. 클로디어스 입장에서는 이제 더 이상 방치할 수 없어. '미친 왕자'가 사람까지 죽였으니까. 근데 함부로 처벌도 못 해 — 국민들이 햄릿을 사랑하거든. 그래서 묘수를 내.", "highlight": None},
            {"speaker": "cosmii", "text": "'영국에 보내서 기분 전환을 시켜주겠다!' 듣기엔 배려 같지? 하지만 클로디어스가 로젠크란츠와 길든스턴에게 봉인된 편지를 맡겨. 영국 왕에게 보내는 거야. 내용은? '이 편지를 들고 온 자를 즉시 처형하라.' 햄릿의 사형 집행 영장이야.", "highlight": "봉인된 편지"},
            {"speaker": "cosmii", "text": "배 위에서 잠 못 이루던 햄릿. 불안한 예감에 로젠크란츠의 가방을 뒤져서 편지를 발견해. 열어보니까 — '이자를 죽여라.' 자기 사형 명령서야! 소름이 돋지?", "highlight": "사형 명령서 발견"},
            {"speaker": "cosmii", "text": "햄릿이 뭘 하냐면 — 편지를 바꿔 써. '이 편지를 들고 온 두 사람을 즉시 처형하라.' 로젠크란츠와 길든스턴의 이름을 넣은 거야. 그리고 아버지의 국새로 봉인해. 이 친구들, 자기가 들고 가는 편지가 자기 사형 명령서인 줄도 모르고 영국 왕에게 바쳤다가 죽어.", "highlight": "편지 바꿔치기"},
            {"speaker": "cosmii", "text": "영국으로 가는 길에 햄릿은 노르웨이 왕자 포틴브라스의 군대를 마주쳐. 포틴브라스는 하찮은 땅 한 조각을 차지하려고 2만 대군을 이끌고 행군 중이야. 햄릿이 충격을 받아 — '저 사람은 달걀 껍데기만 한 땅을 위해 2만 명을 전쟁에 보내는데, 나는 아버지가 살해당하고 왕좌를 빼앗겨도 아직 이러고 있다고?'", "highlight": "포틴브라스의 군대"},
            {"speaker": "cosmii", "text": "그리고 햄릿의 마지막 위대한 독백이 나와 — 'How all occasions do inform against me(모든 상황이 나를 꾸짖는구나).' '진정한 위대함이란, 지푸라기 같은 이유로도 싸우는 것. 나에게는 아버지의 복수라는 명분이 있는데, 왜 나는 아직도 머뭇거리고 있는 건가.' 이때부터 햄릿이 달라져. 결심이 서기 시작해.", "highlight": "모든 상황이 나를 꾸짖는구나"}
        ],
        "quizzes": [
            {
                "question": "클로디어스가 영국에 보낸 봉인 편지의 내용은?",
                "options": ["햄릿을 환대해달라는 부탁", "무역 협상 제안", "편지를 가져온 자를 즉시 처형하라는 명령", "동맹 체결 요청"],
                "correct_index": 2,
                "explanation": "겉으로는 '기분 전환'이라고 했지만, 봉인 편지의 진짜 내용은 '이자를 죽여라'는 사형 명령이었어. 로젠크란츠와 길든스턴은 이 사실을 모른 채 편지를 운반한 거야."
            },
            {
                "question": "햄릿이 포틴브라스의 군대를 보고 느낀 것은?",
                "options": ["전쟁이 무섭다는 공포", "하찮은 땅을 위해서도 행동하는 포틴브라스를 보며 자신의 우유부단함을 반성", "노르웨이와 동맹을 맺고 싶다는 생각", "군대에 입대하고 싶다는 충동"],
                "correct_index": 1,
                "explanation": "달걀 껍데기만 한 땅을 위해서도 싸우는 포틴브라스를 보면서, 아버지를 잃고도 머뭇거리는 자신을 부끄러워한 거야. 이 순간이 햄릿의 전환점이야."
            }
        ],
        "cliffhanger": "햄릿이 영국에서 돌아오는 사이, 덴마크에서는 끔찍한 일이 벌어지고 있었어. 아버지를 잃은 오필리어가 완전히 무너져내리고 있거든."
    },

    # ── NEW C: Ch.3 엇갈린 복수 (Part 4/4) — 오필리어 광기, 무덤 ──
    {
        "title": "미친 꽃과 해골 — 오필리어의 광기와 요릭의 두개골",
        "chapter": "Ch.3 The Tangled Revenge",
        "chapter_title": "엇갈린 복수",
        "part": 4, "total_parts": 4,
        "spark": "'로즈마리는 기억, 팬지는 생각을 뜻해요...' 실성한 오필리어가 꽃을 나눠주며 노래를 부른다. 그리고 무덤 위에서 햄릿은 해골을 들어올린다 — '불쌍한 요릭!'",
        "dialogue": [
            {"speaker": "cosmii", "text": "아버지가 죽었어. 사랑했던 남자의 손에. 오필리어는 완전히 무너져내려. 궁정에 나타나는데, 눈빛이 이상해. 머리는 헝클어지고, 노래를 부르기 시작해 — '그분은 죽었어요, 아가씨, 죽었답니다. 머리맡에 풀이 자라고, 발치에 돌이 놓였지요.'", "highlight": "오필리어의 광기"},
            {"speaker": "cosmii", "text": "오필리어가 꽃을 하나씩 나눠줘. 이게 그냥 미친 행동이 아니야. 각 꽃에 뜻이 있거든. 로즈마리는 기억, 팬지는 생각, 회향은 아첨, 매발톱꽃은 불륜, 데이지는 순수. 그리고 제비꽃은 — '아버지가 돌아가신 뒤로 제비꽃은 모두 시들었어요.' 제비꽃은 충실함이야. 충실함이 죽었다는 거지.", "highlight": "꽃의 언어"},
            {"speaker": "cosmii", "text": "왕비 앞에서 매발톱꽃을 건넨 건 — 불륜에 대한 비난이야. 클로디어스에게 회향을 준 건 — 아첨꾼이라는 뜻이고. 미쳤다고? 이 여자는 미친 채로 진실을 말하고 있는 거야. 햄릿의 '미친 척'과 오필리어의 '진짜 광기'가 거울처럼 대비돼.", "highlight": "미친 채로 진실을 말하다"},
            {"speaker": "cosmii", "text": "장면이 바뀌어. 교회 묘지. 두 명의 무덤지기가 농담을 주고받으며 새 무덤을 파고 있어. 거기에 햄릿과 호레이쇼가 지나가다 멈추지. 무덤에서 해골 하나가 굴러 나와 — 햄릿이 집어 들어.", "highlight": "무덤 장면"},
            {"speaker": "cosmii", "text": "'이게 누구 해골이냐?' 무덤지기가 대답해 — '궁정 광대 요릭이요.' 햄릿이 해골을 들어올리며 — '아아, 불쌍한 요릭! 나는 그를 알았네, 호레이쇼. 끝없이 유쾌하고, 기발한 상상력의 소유자였지. 나를 등에 수천 번 업어줬어.' — 이게 셰익스피어에서 가장 유명한 장면 중 하나야.", "highlight": "불쌍한 요릭!"},
            {"speaker": "cosmii", "text": "'이 입술이 나를 수천 번 입 맞춰줬는데, 이제 어디 있지?' 왕도, 광대도, 미녀도 — 결국 흙으로 돌아가. 알렉산더 대왕도 죽으면 흙이 되어서 맥주통 마개가 될 수도 있어. 그때 장례 행렬이 다가와 — 누구 장례식이냐고? 오필리어야. 레어티즈가 울부짖고, 햄릿이 뛰어나와 — '나도 오필리어를 사랑했다! 오빠의 사랑 4만 배를 합쳐도 내 사랑에 못 미쳐!' 이 순간 햄릿의 존재가 세상에 드러나.", "highlight": "오필리어의 장례식"}
        ],
        "quizzes": [
            {
                "question": "오필리어가 꽃을 나눠준 행동의 의미는?",
                "options": ["그냥 미친 짓", "정원 가꾸기", "각 꽃의 상징적 의미를 통해 궁정 사람들의 죄를 폭로한 것", "선물을 나눠준 것"],
                "correct_index": 2,
                "explanation": "매발톱꽃(불륜), 회향(아첨), 제비꽃(충실함의 죽음) — 오필리어는 미친 상태에서도 각 꽃의 상징을 통해 진실을 말하고 있었어. 미친 채로 가장 날카로운 비판을 한 거지."
            },
            {
                "question": "무덤 장면에서 햄릿이 요릭의 해골을 보며 깨달은 것은?",
                "options": ["무덤에 보물이 있다는 것", "왕이든 광대든 결국 모두 죽어서 흙으로 돌아간다는 것", "요릭이 아직 살아있다는 것", "해골을 수집해야 한다는 것"],
                "correct_index": 1,
                "explanation": "어린 시절 자신을 업어주던 궁정 광대도 결국 해골이 됐어. 왕도, 영웅도, 미녀도 모두 같은 운명이야. 죽음 앞에서는 누구나 평등하다는 걸 깨달은 거지."
            }
        ],
        "cliffhanger": "오필리어의 장례식에서 정체가 드러난 햄릿. 이제 클로디어스도, 레어티즈도 — 모두가 알아. 왕자가 돌아왔다는 걸. 그리고 클로디어스의 마지막 함정이 가동되기 시작해."
    },

    # ── NEW D: Ch.4 죽음의 결투 (Part 3/3) — 포틴브라스, 호레이쇼, 의미 ──
    {
        "title": "호레이쇼의 약속 — 왜 우리는 아직도 햄릿을 읽는가",
        "chapter": "Ch.4 The Final Duel",
        "chapter_title": "죽음의 결투",
        "part": 3, "total_parts": 3,
        "spark": "모두가 쓰러진 무대 위. 나팔 소리와 함께 노르웨이 왕자 포틴브라스가 도착한다. 호레이쇼가 입을 열어 — '아직 모르는 세상에게, 내가 이 모든 이야기를 전하겠습니다.'",
        "dialogue": [
            {"speaker": "cosmii", "text": "무대 위에 시체가 가득해. 클로디어스, 거트루드, 레어티즈, 그리고 햄릿까지. 덴마크 왕실이 전멸한 거야. 이 혼란의 한가운데 나팔 소리가 울려. 노르웨이 왕자 포틴브라스가 군대를 이끌고 도착해.", "highlight": "포틴브라스의 도착"},
            {"speaker": "cosmii", "text": "포틴브라스가 텅 빈 왕좌에 앉아. 이 남자, 기억나? 하찮은 땅을 위해서도 2만 대군을 움직이는 행동의 사나이. 햄릿이 생각만 하고 주저하는 동안, 포틴브라스는 행동했어. 결국 아무것도 안 하고 왕좌를 차지한 건 — 이 사람이야. 셰익스피어의 아이러니지.", "highlight": "행동의 사나이"},
            {"speaker": "cosmii", "text": "호레이쇼. 이 사람이야말로 진짜 영웅일 수 있어. 햄릿이 죽을 때 따라 죽으려고 독잔을 들었는데, 햄릿이 빼앗아 — '제발 살아남아줘. 이 비극의 진실을 세상에 전해야 할 사람은 너야.' 호레이쇼가 약속해 — '아직 모르는 세상에게, 내가 이 모든 이야기를 전하겠습니다.'", "highlight": "이야기를 전하다"},
            {"speaker": "cosmii", "text": "자, 여기서 크게 한 발 물러서 보자. 햄릿은 왜 400년이 넘도록 읽히는 걸까? 이 작품의 핵심 질문은 — '아는 것과 행동하는 것 사이의 간극'이야. 햄릿은 진실을 알아. 하지만 행동하지 못해. 왜? 너무 많이 생각하니까.", "highlight": "아는 것과 행동하는 것"},
            {"speaker": "cosmii", "text": "우리도 햄릿이야. 해야 할 일을 알면서 미루고, 정의로운 걸 알면서 침묵하고, 사랑한다는 걸 알면서 말하지 못해. 'To be or not to be'가 400년간 울리는 이유는 — 이게 햄릿만의 질문이 아니라 인간이라면 누구나 마주하는 질문이기 때문이야.", "highlight": "우리 모두의 질문"},
            {"speaker": "cosmii", "text": "셰익스피어는 답을 주지 않아. 행동하라고도, 기다리라고도 안 해. 대신 거울을 들이밀어 — '너라면 어떻게 하겠어?' 그리고 호레이쇼가 약속을 지켰듯이 — 이 이야기는 지금 이 순간, 너에게까지 전해진 거야. 400년 넘게. 불쌍한 요릭의 해골처럼 우리 모두 언젠가 흙이 될 테지만, 이야기는 남아.", "highlight": "이야기는 남는다"}
        ],
        "quizzes": [
            {
                "question": "포틴브라스가 마지막에 왕좌를 차지한 것이 상징하는 바는?",
                "options": ["운이 좋았을 뿐이다", "생각만 하는 햄릿과 달리 행동하는 자가 결국 세상을 차지한다는 아이러니", "노르웨이가 군사적으로 강했기 때문이다", "클로디어스가 미리 양위한 것이다"],
                "correct_index": 1,
                "explanation": "햄릿은 진실을 알았지만 행동하지 못했고, 포틴브라스는 하찮은 이유로도 행동했어. 결국 빈 왕좌를 차지한 건 행동한 사람이야. 셰익스피어가 던진 강력한 아이러니지."
            },
            {
                "question": "햄릿이 400년 넘게 읽히는 가장 핵심적인 이유는?",
                "options": ["잔인한 장면이 많아서", "'아는 것과 행동하는 것 사이의 간극'이라는 보편적 인간 질문을 다루기 때문", "왕족 이야기라서", "셰익스피어가 유명해서"],
                "correct_index": 1,
                "explanation": "해야 할 일을 알면서 못 하는 것, 진실을 알면서 침묵하는 것 — 이건 400년 전이나 지금이나 모든 인간이 겪는 딜레마야. 그래서 햄릿은 영원한 거울이야."
            }
        ],
        "cliffhanger": ""
    },
]


# ══════════════════════════════════════════════════════════════
# NEW TRANSLATIONS_EN — English translations for new lessons
# ══════════════════════════════════════════════════════════════

NEW_TRANSLATIONS_EN = {
    0: {
        "title": "Fishmongers and Spies — Hamlet's Razor-Sharp Wit",
        "chapter_title": "The Mask of Madness",
        "spark": "Claudius summoned two of Hamlet's old college friends as spies. But is Hamlet really mad? Hidden inside his 'crazy talk' are razor blades.",
        "cliffhanger": "Rosencrantz and Guildenstern have been exposed. Polonius has been played. But pretending to be mad isn't enough — Hamlet needs hard proof. Just then, a troupe of traveling actors arrives at the castle, and Hamlet's eyes light up.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Claudius is getting nervous. He wants to know the real cause behind the 'mad prince.' So he plays his secret card — he summons two of Hamlet's college buddies: Rosencrantz and Guildenstern.", "highlight": "Rosencrantz and Guildenstern"},
            {"speaker": "cosmii", "text": "Their mission? 'Approach him as old friends and find out why he's gone mad.' He sent friends as spies. That's how threatened Claudius feels by Hamlet.", "highlight": "Friends as spies"},
            {"speaker": "cosmii", "text": "But is Hamlet a fool? The second these two show up, he sees right through them: 'Were you sent for? Or did you come of your own free will?' They stammer and dodge, and Hamlet nails it — 'Ah, the king sent you.' Completely busted.", "highlight": "Sees through them"},
            {"speaker": "cosmii", "text": "Meanwhile, Polonius approaches Hamlet, and Hamlet plays his mad act like a fiddle. When Polonius speaks, Hamlet fires: 'You are a fishmonger.' Polonius is baffled — 'A fishmonger?' The word was Elizabethan slang for a pimp. Hamlet is jabbing at Polonius for using his daughter as bait.", "highlight": "Fishmonger"},
            {"speaker": "cosmii", "text": "Polonius asks: 'What do you read, my lord?' Hamlet's reply: 'Words, words, words.' Sounds like gibberish from a madman, right? But the real meaning — 'Everything you people say is empty noise. Meaningless words.' He drops truth bombs disguised as madness.", "highlight": "Words, words, words"},
            {"speaker": "cosmii", "text": "Polonius mutters to himself: 'Though this be madness, yet there is method in it.' This one line is the key. Hamlet's 'madness' is a precision weapon — hiding truth inside crazy talk, testing people, keeping his enemies off-balance. Genius.", "highlight": "Method in the madness"}
        ],
        "quizzes": [
            {
                "question": "Why did Claudius summon Rosencrantz and Guildenstern?",
                "options": ["To help Hamlet with his studies", "To spy on Hamlet and discover the real cause of his madness", "To organize a court celebration", "To teach Hamlet fencing"],
                "correct_index": 1,
                "explanation": "Claudius used Hamlet's old friends as spies to uncover the real reason behind his madness. Friends in disguise — actually intelligence agents."
            },
            {
                "question": "Why did Hamlet call Polonius a 'fishmonger'?",
                "options": ["He genuinely mistook him for one", "To mock Polonius for using his daughter as bait while pretending to be mad", "He liked fish", "It was meaningless mad talk"],
                "correct_index": 1,
                "explanation": "'Fishmonger' was Elizabethan slang for a pimp. Hamlet was taking a razor-sharp stab at Polonius for sending Ophelia to spy on him — all while maintaining his mad disguise."
            }
        ],
    },
    1: {
        "title": "The Prince Shipped to England — Swapped Letters and Fortinbras's Shadow",
        "chapter_title": "The Tangled Revenge",
        "spark": "Claudius ships Hamlet to England. The official reason: 'a change of scenery.' The real reason? A sealed letter that reads: 'Kill this man immediately.'",
        "cliffhanger": "While Hamlet makes his way back from England, something terrible has been unfolding in Denmark. Ophelia, devastated by her father's death, is falling apart completely.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Hamlet has killed Polonius. Claudius can't ignore this anymore — the 'mad prince' has now killed a man. But he can't punish Hamlet openly either — the people love him. So he devises a cunning plan.", "highlight": None},
            {"speaker": "cosmii", "text": "'Send him to England for a change of scenery!' Sounds caring, right? But Claudius hands Rosencrantz and Guildenstern a sealed letter for the English king. The contents? 'Execute the bearer of this letter immediately.' It's Hamlet's death warrant.", "highlight": "Sealed letter"},
            {"speaker": "cosmii", "text": "On the ship, sleepless Hamlet follows a gut feeling and searches Rosencrantz's bag. He finds the letter, opens it — 'Kill this man.' His own execution order. Imagine that chill running down your spine.", "highlight": "Discovers the death warrant"},
            {"speaker": "cosmii", "text": "So what does Hamlet do? He rewrites the letter: 'Execute the two men bearing this letter immediately.' He swaps in Rosencrantz and Guildenstern's names and seals it with his father's royal signet. These two deliver their own death warrant to the English king without ever knowing — and they're executed.", "highlight": "The letter swap"},
            {"speaker": "cosmii", "text": "On the way to England, Hamlet encounters the army of Norwegian Prince Fortinbras — 20,000 soldiers marching to seize a worthless scrap of land. Hamlet is shaken: 'This man leads 20,000 to war over an eggshell, while I — with a murdered father and a stolen throne — am still standing here doing nothing?'", "highlight": "Fortinbras's army"},
            {"speaker": "cosmii", "text": "Then comes Hamlet's last great soliloquy: 'How all occasions do inform against me.' 'True greatness is fighting even for a straw when honor's at the stake. I have a father killed and a mother stained, yet I stand idle.' From this moment, something shifts in Hamlet. He's done hesitating.", "highlight": "How all occasions inform against me"}
        ],
        "quizzes": [
            {
                "question": "What was in the sealed letter Claudius sent to England?",
                "options": ["A request to welcome Hamlet warmly", "A trade negotiation proposal", "An order to immediately execute the letter's bearer", "An alliance request"],
                "correct_index": 2,
                "explanation": "Behind the 'change of scenery' excuse, the sealed letter ordered Hamlet's immediate execution. Rosencrantz and Guildenstern carried it unknowingly."
            },
            {
                "question": "What did Hamlet feel upon seeing Fortinbras's army?",
                "options": ["Fear of war", "Shame at his own inaction compared to Fortinbras fighting for even a worthless scrap of land", "A desire to ally with Norway", "An urge to enlist in the army"],
                "correct_index": 1,
                "explanation": "Seeing Fortinbras lead 20,000 men to fight over an eggshell of land, Hamlet was ashamed of his own hesitation despite having a murdered father. This was his turning point."
            }
        ],
    },
    2: {
        "title": "Mad Flowers and a Skull — Ophelia's Madness and Yorick's Bones",
        "chapter_title": "The Tangled Revenge",
        "spark": "'There's rosemary, that's for remembrance. And there is pansies, that's for thoughts...' A deranged Ophelia hands out flowers while singing. And at a grave, Hamlet lifts a skull — 'Alas, poor Yorick!'",
        "cliffhanger": "Hamlet has revealed himself at Ophelia's funeral. Now Claudius and Laertes both know — the prince is back. And Claudius's final trap begins to take shape.",
        "dialogue": [
            {"speaker": "cosmii", "text": "Her father is dead. Killed by the man she loved. Ophelia shatters completely. She appears at court with wild eyes and tangled hair, singing — 'He is dead and gone, lady, he is dead and gone. At his head a grass-green turf, at his heels a stone.'", "highlight": "Ophelia's madness"},
            {"speaker": "cosmii", "text": "Ophelia hands out flowers one by one. This isn't random madness — each flower carries meaning. Rosemary for remembrance, pansies for thoughts, fennel for flattery, columbine for adultery, daisies for innocence. And violets? 'I would give you some violets, but they withered all when my father died.' Violets mean faithfulness. Faithfulness has died.", "highlight": "The language of flowers"},
            {"speaker": "cosmii", "text": "She gives columbine to the queen — an accusation of adultery. Fennel to Claudius — calling him a flatterer. Mad? This woman is speaking truth through madness. Hamlet's 'performed madness' and Ophelia's 'real madness' mirror each other perfectly.", "highlight": "Speaking truth through madness"},
            {"speaker": "cosmii", "text": "Scene change. A churchyard. Two gravediggers crack jokes as they dig a fresh grave. Hamlet and Horatio pass by and stop. A skull rolls out of the earth — Hamlet picks it up.", "highlight": "The graveyard scene"},
            {"speaker": "cosmii", "text": "'Whose skull is this?' The gravedigger answers: 'Yorick, the king's jester.' Hamlet lifts the skull: 'Alas, poor Yorick! I knew him, Horatio — a fellow of infinite jest, of most excellent fancy. He hath borne me on his back a thousand times.' One of Shakespeare's most iconic moments.", "highlight": "Alas, poor Yorick!"},
            {"speaker": "cosmii", "text": "'Where be your gibes now? Your gambols? Your flashes of merriment?' King or jester, beauty or beast — all return to dust. Alexander the Great died and became clay, perhaps stopping a beer barrel. Then a funeral procession approaches — whose funeral? Ophelia's. Laertes wails in grief, and Hamlet leaps forward: 'I loved Ophelia! Forty thousand brothers could not with all their quantity of love make up my sum!' His cover is blown.", "highlight": "Ophelia's funeral"}
        ],
        "quizzes": [
            {
                "question": "What was the significance of Ophelia handing out flowers?",
                "options": ["Just mad behavior", "Gardening", "Each flower's symbolic meaning exposed the sins of the court", "Giving gifts"],
                "correct_index": 2,
                "explanation": "Columbine for adultery, fennel for flattery, dead violets for dead faithfulness — even in madness, Ophelia used each flower's symbolism to speak devastating truth."
            },
            {
                "question": "What did Hamlet realize while holding Yorick's skull?",
                "options": ["That treasure was buried in the grave", "That king or clown, all end as dust in the earth", "That Yorick was still alive", "That he should collect skulls"],
                "correct_index": 1,
                "explanation": "The court jester who once carried young Hamlet on his back is now a bare skull. Kings, heroes, beauties — all share the same fate. Before death, everyone is equal."
            }
        ],
    },
    3: {
        "title": "Horatio's Promise — Why We Still Read Hamlet",
        "chapter_title": "The Final Duel",
        "spark": "The stage is littered with bodies. A trumpet sounds as Norwegian Prince Fortinbras arrives. Horatio speaks: 'Let me speak to the yet unknowing world how these things came about.'",
        "cliffhanger": "",
        "dialogue": [
            {"speaker": "cosmii", "text": "The stage is covered in corpses. Claudius, Gertrude, Laertes, Hamlet. The Danish royal house is extinct. In the middle of this carnage, a trumpet blares. Norwegian Prince Fortinbras marches in with his army.", "highlight": "Fortinbras arrives"},
            {"speaker": "cosmii", "text": "Fortinbras takes the empty throne. Remember this man? The one who marched 20,000 soldiers to fight over a worthless patch of land. While Hamlet thought and hesitated, Fortinbras acted. The one who claims the throne without lifting a finger at court — the man of action. Shakespeare's ultimate irony.", "highlight": "The man of action"},
            {"speaker": "cosmii", "text": "Horatio. He might be the real hero. When Hamlet dies, Horatio reaches for the poisoned cup to follow him. But Hamlet snatches it away: 'Please, stay alive. You must tell the world the truth.' Horatio promises: 'Let me speak to the yet unknowing world how these things came about.'", "highlight": "Tell the story"},
            {"speaker": "cosmii", "text": "Now let's step way back. Why has Hamlet been read for over 400 years? The core question of this play is the gap between knowing and doing. Hamlet knows the truth. But he can't act on it. Why? Because he thinks too much.", "highlight": "Knowing vs. doing"},
            {"speaker": "cosmii", "text": "We are all Hamlet. We know what we should do but procrastinate. We know what's right but stay silent. We know we love someone but never say it. 'To be or not to be' has echoed for four centuries because it isn't just Hamlet's question — it's a question every human being faces.", "highlight": "A question for all of us"},
            {"speaker": "cosmii", "text": "Shakespeare doesn't give us answers. He doesn't say act or wait. Instead, he holds up a mirror: 'What would YOU do?' And just as Horatio kept his promise — this story has reached you, right now, across more than 400 years. Like poor Yorick's skull, we'll all return to dust someday. But the story survives.", "highlight": "The story survives"}
        ],
        "quizzes": [
            {
                "question": "What does Fortinbras claiming the throne at the end symbolize?",
                "options": ["He was simply lucky", "The irony that the man of action inherits the world while the thinker destroyed himself", "Norway was militarily stronger", "Claudius abdicated in advance"],
                "correct_index": 1,
                "explanation": "Hamlet knew the truth but couldn't act. Fortinbras acted over trivial reasons. In the end, the empty throne goes to the one who acts. Shakespeare's devastating irony."
            },
            {
                "question": "What is the most fundamental reason Hamlet has been read for over 400 years?",
                "options": ["It has many violent scenes", "It addresses the universal human dilemma of knowing what's right but failing to act", "It's about royalty", "Shakespeare is famous"],
                "correct_index": 1,
                "explanation": "Knowing what we should do but failing to do it, knowing the truth but staying silent — this dilemma is as real today as it was 400 years ago. That's why Hamlet is an eternal mirror."
            }
        ],
    },
}

# ══════════════════════════════════════════════════════════════
# Merge new lessons into LESSONS at correct positions
# ══════════════════════════════════════════════════════════════

# Update existing lessons' part/total_parts before insertion
LESSONS[2]["part"] = 1; LESSONS[2]["total_parts"] = 3   # 미친 척 → 1/3
LESSONS[3]["part"] = 3; LESSONS[3]["total_parts"] = 3   # 사느냐 죽느냐 → 3/3
LESSONS[4]["part"] = 1; LESSONS[4]["total_parts"] = 4   # 기도하는 원수 → 1/4
LESSONS[5]["part"] = 2; LESSONS[5]["total_parts"] = 4   # 커튼 뒤의 비극 → 2/4
LESSONS[6]["part"] = 1; LESSONS[6]["total_parts"] = 3   # 오필리어 죽음 → 1/3
LESSONS[7]["part"] = 2; LESSONS[7]["total_parts"] = 3   # 독이 퍼진 경기장 → 2/3

# Insert new lessons at correct positions (insert in reverse order to keep indices stable)
LESSONS.insert(6, NEW_LESSONS_KO[2])   # NEW C: 미친 꽃과 해골 → index 7 (before Ch.4)
LESSONS.insert(6, NEW_LESSONS_KO[1])   # NEW B: 영국으로 보내진 왕자 → index 6 (before Ch.4)
LESSONS.insert(3, NEW_LESSONS_KO[0])   # NEW A: 생선장수와 스파이들 → index 3
LESSONS.append(NEW_LESSONS_KO[3])      # NEW D: 호레이쇼의 약속 → last

# Build final TRANSLATIONS_EN with correct indices
# Original indices shift: 0→0, 1→1, 2→2, [NEW A]=3, 3→4, 4→5, 5→6, [NEW B]=7, [NEW C]=8, 6→9, 7→10, [NEW D]=11
_old_en = dict(TRANSLATIONS_EN)
TRANSLATIONS_EN.clear()
TRANSLATIONS_EN[0] = _old_en[0]
TRANSLATIONS_EN[1] = _old_en[1]
TRANSLATIONS_EN[2] = _old_en[2]
TRANSLATIONS_EN[3] = NEW_TRANSLATIONS_EN[0]  # NEW A
TRANSLATIONS_EN[4] = _old_en[3]
TRANSLATIONS_EN[5] = _old_en[4]
TRANSLATIONS_EN[6] = _old_en[5]
TRANSLATIONS_EN[7] = NEW_TRANSLATIONS_EN[1]  # NEW B
TRANSLATIONS_EN[8] = NEW_TRANSLATIONS_EN[2]  # NEW C
TRANSLATIONS_EN[9] = _old_en[6]
TRANSLATIONS_EN[10] = _old_en[7]
TRANSLATIONS_EN[11] = NEW_TRANSLATIONS_EN[3] # NEW D


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
