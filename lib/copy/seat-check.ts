import type { GuideSeatCheckCopy } from "@/components/travel/GuideSeatCheck";

/**
 * Copy for the seat checker, shared by every page that offers it.
 *
 * The guide owned these strings first, inside its own per-locale UI object, and
 * still reads them from there. They were lifted here verbatim so the other
 * booking-intent pages could carry the checker too, and
 * `scripts/affiliate-checks.test.mjs` asserts the two copies stay identical —
 * a translation fixed in one place must not silently diverge in the other.
 */
export const SEAT_CHECK_COPY: Record<string, GuideSeatCheckCopy> = {
  en: {
    eyebrow: "Free seat checker",
    question: "Which way are you travelling?",
    dirToKyoto: "Tokyo → Kyoto / Osaka",
    dirToTokyo: "Kyoto / Osaka → Tokyo",
    result: "Sit on the {side} side — seat {seat}.",
    sideRight: "right",
    sideLeft: "left",
    greenCar: "In the Green Car, the Fuji-side window is usually seat {seat}.",
    bookNote: "Reserve that seat when you book — window seats near Shin-Fuji go first in high season.",
    book: "Book this seat on Klook",
    jrPassLead: "Adding Hiroshima or several long JR rides?",
    jrPassLink: "Check JR Pass options →",
  },
  de: {
    eyebrow: "Kostenlose Sitzplatzprüfung",
    question: "In welche Richtung fährst du?",
    dirToKyoto: "Tokio → Kyoto / Osaka",
    dirToTokyo: "Kyoto / Osaka → Tokio",
    result: "Setz dich auf die {side} Seite — Sitz {seat}.",
    sideRight: "rechte",
    sideLeft: "linke",
    greenCar: "Im Green Car ist das Fenster zur Fuji-Seite meist Sitz {seat}.",
    bookNote: "Reserviere den Sitz direkt bei der Buchung — Fensterplätze sind in der Hochsaison zuerst weg.",
    book: "Diesen Sitz auf Klook buchen",
    jrPassLead: "Kommt Hiroshima oder mehrere lange JR-Fahrten dazu?",
    jrPassLink: "JR-Pass-Optionen ansehen →",
  },
  es: {
    eyebrow: "Verificador gratuito",
    question: "¿En qué dirección viajas?",
    dirToKyoto: "Tokio → Kioto / Osaka",
    dirToTokyo: "Kioto / Osaka → Tokio",
    result: "Siéntate en el lado {side} — asiento {seat}.",
    sideRight: "derecho",
    sideLeft: "izquierdo",
    greenCar: "En el Green Car, la ventanilla del lado del Fuji suele ser el asiento {seat}.",
    bookNote: "Reserva ese asiento al comprar: las ventanillas se agotan primero en temporada alta.",
    book: "Reservar este asiento en Klook",
    jrPassLead: "¿Añades Hiroshima o varios trayectos largos de JR?",
    jrPassLink: "Ver opciones de JR Pass →",
  },
  fr: {
    eyebrow: "Vérificateur gratuit",
    question: "Dans quel sens voyagez-vous ?",
    dirToKyoto: "Tokyo → Kyoto / Osaka",
    dirToTokyo: "Kyoto / Osaka → Tokyo",
    result: "Asseyez-vous côté {side} — siège {seat}.",
    sideRight: "droit",
    sideLeft: "gauche",
    greenCar: "En Green Car, la fenêtre côté Fuji est généralement le siège {seat}.",
    bookNote: "Réservez ce siège dès l'achat : les places fenêtre partent en premier en haute saison.",
    book: "Réserver ce siège sur Klook",
    jrPassLead: "Vous ajoutez Hiroshima ou plusieurs longs trajets JR ?",
    jrPassLink: "Voir les options de JR Pass →",
  },
  ko: {
    eyebrow: "무료 좌석 확인",
    question: "어느 방향으로 이동하시나요?",
    dirToKyoto: "도쿄 → 교토 / 오사카",
    dirToTokyo: "교토 / 오사카 → 도쿄",
    result: "{side}쪽에 앉으세요 — {seat}석입니다.",
    sideRight: "오른",
    sideLeft: "왼",
    greenCar: "그린샤에서는 후지산 쪽 창가가 보통 {seat}석입니다.",
    bookNote: "예약할 때 그 좌석을 지정하세요. 성수기에는 창가부터 매진됩니다.",
    book: "Klook에서 이 좌석 예약",
    jrPassLead: "히로시마나 여러 장거리 JR 구간이 포함되나요?",
    jrPassLink: "JR 패스 옵션 보기 →",
  },
  "pt-BR": {
    eyebrow: "Verificador gratuito",
    question: "Em qual direção você viaja?",
    dirToKyoto: "Tóquio → Quioto / Osaka",
    dirToTokyo: "Quioto / Osaka → Tóquio",
    result: "Sente-se do lado {side} — assento {seat}.",
    sideRight: "direito",
    sideLeft: "esquerdo",
    greenCar: "No Green Car, a janela do lado do Fuji costuma ser o assento {seat}.",
    bookNote: "Reserve esse assento ao comprar — as janelas esgotam primeiro na alta temporada.",
    book: "Reservar este assento na Klook",
    jrPassLead: "Vai incluir Hiroshima ou vários trechos longos de JR?",
    jrPassLink: "Ver opções de JR Pass →",
  },
  ru: {
    eyebrow: "Бесплатная проверка места",
    question: "В каком направлении вы едете?",
    dirToKyoto: "Токио → Киото / Осака",
    dirToTokyo: "Киото / Осака → Токио",
    result: "Садитесь с {side} стороны — место {seat}.",
    sideRight: "правой",
    sideLeft: "левой",
    greenCar: "В Green Car окно со стороны Фудзи — обычно место {seat}.",
    bookNote: "Бронируйте это место сразу: в высокий сезон места у окна разбирают первыми.",
    book: "Забронировать это место на Klook",
    jrPassLead: "Добавляете Хиросиму или несколько длинных поездок JR?",
    jrPassLink: "Посмотреть варианты JR Pass →",
  },
  "zh-CN": {
    eyebrow: "免费座位查询",
    question: "您的行进方向是？",
    dirToKyoto: "东京 → 京都 / 大阪",
    dirToTokyo: "京都 / 大阪 → 东京",
    result: "请坐{side}侧 — {seat} 座位。",
    sideRight: "右",
    sideLeft: "左",
    greenCar: "绿色车厢中，富士山侧的靠窗座位通常是 {seat}。",
    bookNote: "订票时请指定该座位，旺季时靠窗座位最先售罄。",
    book: "在 Klook 预订此座位",
    jrPassLead: "要加上广岛或多段长途 JR 吗？",
    jrPassLink: "查看 JR Pass 选项 →",
  },
  "zh-TW": {
    eyebrow: "免費座位查詢",
    question: "您的行進方向是？",
    dirToKyoto: "東京 → 京都 / 大阪",
    dirToTokyo: "京都 / 大阪 → 東京",
    result: "請坐{side}側 — {seat} 座位。",
    sideRight: "右",
    sideLeft: "左",
    greenCar: "綠色車廂中，富士山側的窗邊通常是 {seat} 座位。",
    bookNote: "訂票時請指定該座位，旺季時靠窗座位最先售罄。",
    book: "在 Klook 預訂此座位",
    jrPassLead: "要加上廣島或多段長途 JR 嗎？",
    jrPassLink: "查看 JR Pass 選項 →",
  },
};

/** Falls back to English for a locale with no entry, never to an empty panel. */
export function seatCheckCopy(locale: string): GuideSeatCheckCopy {
  return SEAT_CHECK_COPY[locale] ?? SEAT_CHECK_COPY.en;
}

/**
 * The line offered to a reader travelling *into* Tokyo.
 *
 * October's numbers: the return leg took 22 clicks and booked nothing, while
 * the outbound booked 3 of 20. The return traveller has already bought the
 * round trip, so a second ticket is the wrong thing to sell them — but they are
 * on their way to Tokyo, and a Fuji day tour departs from there. Tours pay
 * 5.00% against rail's 1.3%, which is 741 yen a booking against 406.
 *
 * Owned by the component rather than each page's copy object, so every page
 * carrying the checker gets it without threading two more props.
 */
export type ReturnTourCopy = { lead: string; cta: string };

const RETURN_TOUR_COPY: Record<string, ReturnTourCopy> = {
  en: {
    lead: "Heading into Tokyo? Seeing Mt. Fuji up close is a day trip from there.",
    cta: "See Mt Fuji day tours on Klook",
  },
  de: {
    lead: "Sie fahren nach Tokio? Den Fuji aus der Nähe zu sehen ist von dort ein Tagesausflug.",
    cta: "Fuji-Tagestouren auf Klook ansehen",
  },
  es: {
    lead: "¿Vas hacia Tokio? Ver el Fuji de cerca es una excursión de un día desde allí.",
    cta: "Ver excursiones de un día al Fuji en Klook",
  },
  fr: {
    lead: "Vous allez à Tokyo ? Voir le Fuji de près est une excursion d'une journée depuis là-bas.",
    cta: "Voir les excursions au Fuji sur Klook",
  },
  ko: {
    lead: "도쿄로 가시나요? 후지산을 가까이에서 보는 건 도쿄에서 당일치기로 가능합니다.",
    cta: "Klook에서 후지산 당일 투어 보기",
  },
  "pt-BR": {
    lead: "Indo para Tóquio? Ver o Fuji de perto é um passeio de um dia a partir de lá.",
    cta: "Ver passeios de um dia ao Fuji na Klook",
  },
  ru: {
    lead: "Едете в Токио? Увидеть Фудзи вблизи можно за один день оттуда.",
    cta: "Однодневные туры к Фудзи на Klook",
  },
  "zh-CN": {
    lead: "要去东京？从东京出发，一天就能近距离看富士山。",
    cta: "在 Klook 查看富士山一日游",
  },
  "zh-TW": {
    lead: "要去東京？從東京出發，一天就能近距離看富士山。",
    cta: "在 Klook 查看富士山一日遊",
  },
};

export function returnTourCopy(locale: string): ReturnTourCopy {
  return RETURN_TOUR_COPY[locale] ?? RETURN_TOUR_COPY.en;
}
