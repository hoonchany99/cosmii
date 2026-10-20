// The line Cosmii wrote for whoever needs each book - the same 29 lines the
// app carries in src/data/hidden-books.ts. They are addressed to the reader
// rather than about the book, which is what makes them worth putting on a
// shared link: a blurb says what a book is, and this says who it is for.
//
// Kept here as a copy rather than read from the database: they are editorial
// constants that change when someone rewrites one, and a book page that has
// to wait on a second query to draw its own first line is the wrong trade.
export const BOOK_NOTES: Record<string, string> = {
  cl_odyssey: "집에 돌아가는 길이 유난히 멀게 느껴지는 너에게",
  cl_iliad: "화가 나서 스스로도 멈출 수 없었던 적이 있는 너에게",
  g_art_of_war: "싸우지 않고 이기는 법이 궁금한 너에게",
  cl_symposium: "사랑이 대체 뭔지 밤새 이야기하고 싶은 너에게",
  cl_republic: "정직하게 사는 게 손해 같아서 억울한 너에게",
  cl_politics: "사람은 왜 혼자 살 수 없는지 궁금한 너에게",
  cl_ethics: "잘 산다는 게 뭔지 한 번쯤 따져보고 싶은 너에게",
  cl_letters_stoic: "시간이 늘 모자란다고 느끼는 너에게",
  cl_enchiridion: "어쩔 수 없는 일 때문에 잠 못 드는 너에게",
  c_meditations: "하루를 버티고 나서 스스로에게 할 말이 필요한 너에게",
  e40c0e43: "인생의 한가운데서 길을 잃은 것 같은 너에게",
  cl_utopia: "지금과 다른 세상을 상상해보고 싶은 너에게",
  cl_discourses: "잘 굴러가던 조직이 왜 무너지는지 궁금한 너에게",
  cl_prince: "착하기만 해서는 안 되는 자리에 선 너에게",
  "2021cd07": "해야 할 일을 알면서도 계속 미루고 있는 너에게",
  cl_macbeth: "갖고 싶은 게 생겨서 마음이 조급해진 너에게",
  cl_lear: "달콤한 말과 진심을 구별하기 어려운 너에게",
  cl_faust: "다 해봤는데도 뭔가 채워지지 않는 너에게",
  cl_pride: "첫인상으로 사람을 판단했다가 후회한 적 있는 너에게",
  cl_frankenstein: "만들어놓고 책임지지 못한 게 마음에 걸리는 너에게",
  c_crime: "머릿속 생각이 너무 커져서 무서웠던 적이 있는 너에게",
  cl_ivan_ilyich: "남들 보기엔 괜찮은데 왠지 허전한 너에게",
  c_metamorphosis: "아침에 일어나기가 유난히 무거운 날이 계속되는 너에게",
  f_gatsby: "한 사람을 위해 모든 걸 걸어본 적 있는 너에게",
  f_little_prince: "어른이 되면서 뭔가 잃어버린 것 같은 너에게",
  c_animal_farm: "처음 약속과 달라진 규칙이 불편한 너에게",
  f_1984: "누가 늘 지켜보는 것 같아 피곤한 너에게",
  bc977bab: "남들이 정해준 길이 갑자기 낯설어진 너에게",
  f_stranger: "슬퍼해야 할 때 슬프지 않아서 당황한 너에게",
};

/** The line, or nothing for a book that has none. */
export function bookNote(id: string): string | null {
  return BOOK_NOTES[id] ?? null;
}
