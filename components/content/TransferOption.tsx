"use client";

import { Check, Clock, Luggage, Wallet, Zap } from "lucide-react";
import { TransferOptionCard } from "@/components/airport/AirportTransferUi";
import type { AffiliateClickParams } from "@/lib/analytics";
import { getAirportRouteUiCopy } from "@/lib/content/airport-transfer-i18n";
import { getAffiliateConfig, getAffUrl, getReadyAffUrl } from "@/src/affiliateLinks";

type TransferOptionProps = {
  name: string;
  bookingMode?: "affiliate_booking" | "no_booking_ic_card" | "taxi_stand" | "private_transfer" | "comparison_only";
  badge: "fastest" | "easiest" | "cheapest";
  duration: string;
  cost: string;
  pros: string[];
  cons: string[];
  luggageFriendly: boolean;
  lateOk: boolean;
  bookingLink?: string;
  bookingLabel?: string;
  locale?: string;
  pagePath?: string;
  placement?: AffiliateClickParams["placement"];
};

const legacyAirportTransferUrl = getAffUrl("airportTransfer");
const naritaLimousineBusUrl = getAffUrl("naritaLimousineBus") ?? getAffUrl("limousineBus");
const hanedaLimousineBusUrl = getAffUrl("hanedaLimousineBus");
const kixLimousineBusUrl = getAffUrl("kixLimousineBus");
const jrHarukaUrl = getAffUrl("jrHaruka");
const nankaiRapitUrl = getAffUrl("nankaiRapit");
const naritaPrivateTransferUrl = getAffUrl("naritaPrivateTransfer");
const hanedaPrivateTransferUrl = getAffUrl("hanedaPrivateTransfer");
const airportPrivateTransferUrl = getAffUrl("airportPrivateTransfer");

function normalizedName(name: string) {
  return name.toLowerCase();
}

function isPrivateTransfer(name: string) {
  const text = normalizedName(name);
  return text.includes("private");
}

function isNormalTaxi(name: string) {
  const text = normalizedName(name);
  return text.includes("taxi") && !text.includes("private");
}

function isAirportBus(name: string) {
  const text = normalizedName(name);
  return text.includes("bus") || text.includes("limousine");
}

function isAirportTrain(name: string) {
  const text = normalizedName(name);
  return (
    text.includes("narita express") ||
    text.includes("n'ex") ||
    text.includes("skyliner") ||
    text.includes("monorail") ||
    text.includes("haruka") ||
    text.includes("nankai") ||
    text.includes("keisei") ||
    text.includes("keikyu") ||
    text.includes("jr")
  );
}

function isNankaiRapit(name: string) {
  const text = normalizedName(name);
  return text.includes("rapi:t") || text.includes("rapit");
}

function isNoReservationLocalOption(name: string) {
  const text = normalizedName(name);
  return (
    text.includes("kansai airport rapid") ||
    text.includes("nankai airport express") ||
    text.includes("keisei access express") ||
    text.includes("keisei main line") ||
    text.includes("keikyu line") ||
    text.includes("local")
  );
}

function deriveBookingMode(name: string, explicitMode?: TransferOptionProps["bookingMode"]): NonNullable<TransferOptionProps["bookingMode"]> {
  if (explicitMode) return explicitMode;
  if (isPrivateTransfer(name)) return "private_transfer";
  if (isNormalTaxi(name)) return "taxi_stand";
  if (isNoReservationLocalOption(name)) return "no_booking_ic_card";
  if (
    normalizedName(name).includes("narita express") ||
    normalizedName(name).includes("n'ex") ||
    normalizedName(name).includes("skyliner") ||
    normalizedName(name).includes("haruka") ||
    isNankaiRapit(name) ||
    isAirportBus(name)
  ) {
    return "affiliate_booking";
  }
  return "no_booking_ic_card";
}

function actionTitleForOption(name: string) {
  const text = normalizedName(name);
  if (text.includes("private")) return "Private airport transfer";
  if (text.includes("narita express") || text.includes("n'ex")) return "Book or compare Narita Express";
  if (text.includes("skyliner")) return "Book or compare Skyliner";
  if (text.includes("haruka")) return "Book or compare JR Haruka";
  if (isAirportBus(name)) return "Book or compare airport bus";
  return "Book or compare this route";
}

const actionTitleText: Record<string, Record<string, string>> = {
  en: {
    private: "Private airport transfer",
    nex: "Book or compare Narita Express",
    skyliner: "Book or compare Skyliner",
    haruka: "Book or compare JR Haruka",
    monorail: "Book or compare Tokyo Monorail",
    bus: "Book or compare airport bus",
    default: "Book or compare this route",
  },
  es: { private: "Transfer privado de aeropuerto", nex: "Reservar o comparar Narita Express", skyliner: "Reservar o comparar Skyliner", haruka: "Reservar o comparar JR Haruka", monorail: "Reservar o comparar Tokyo Monorail", bus: "Reservar o comparar bus de aeropuerto", default: "Reservar o comparar esta ruta" },
  "pt-BR": { private: "Transfer privado de aeroporto", nex: "Reservar ou comparar Narita Express", skyliner: "Reservar ou comparar Skyliner", haruka: "Reservar ou comparar JR Haruka", monorail: "Reservar ou comparar Tokyo Monorail", bus: "Reservar ou comparar onibus de aeroporto", default: "Reservar ou comparar esta rota" },
  ko: { private: "공항 private transfer", nex: "Narita Express 예약 또는 비교", skyliner: "Skyliner 예약 또는 비교", haruka: "JR Haruka 예약 또는 비교", monorail: "Tokyo Monorail 예약 또는 비교", bus: "공항버스 예약 또는 비교", default: "이 경로 예약 또는 비교" },
  "zh-TW": { private: "私人機場接送", nex: "預訂或比較 Narita Express", skyliner: "預訂或比較 Skyliner", haruka: "預訂或比較 JR Haruka", monorail: "預訂或比較 Tokyo Monorail", bus: "預訂或比較機場巴士", default: "預訂或比較這條路線" },
  "zh-CN": { private: "私人机场接送", nex: "预订或比较 Narita Express", skyliner: "预订或比较 Skyliner", haruka: "预订或比较 JR Haruka", monorail: "预订或比较 Tokyo Monorail", bus: "预订或比较机场巴士", default: "预订或比较这条路线" },
  fr: { private: "Transfert aeroport prive", nex: "Reserver ou comparer Narita Express", skyliner: "Reserver ou comparer Skyliner", haruka: "Reserver ou comparer JR Haruka", monorail: "Reserver ou comparer Tokyo Monorail", bus: "Reserver ou comparer le bus aeroport", default: "Reserver ou comparer cette route" },
  de: { private: "Privater Flughafentransfer", nex: "Narita Express buchen oder vergleichen", skyliner: "Skyliner buchen oder vergleichen", haruka: "JR Haruka buchen oder vergleichen", monorail: "Tokyo Monorail buchen oder vergleichen", bus: "Flughafenbus buchen oder vergleichen", default: "Diese Route buchen oder vergleichen" },
  ru: { private: "Частный трансфер из аэропорта", nex: "Забронировать или сравнить Narita Express", skyliner: "Забронировать или сравнить Skyliner", haruka: "Забронировать или сравнить JR Haruka", monorail: "Забронировать или сравнить Tokyo Monorail", bus: "Забронировать или сравнить автобус аэропорта", default: "Забронировать или сравнить маршрут" },
};

const bookActionTitleText: Record<string, Record<string, string>> = {
  en: {
    private: "Private airport transfer",
    nex: "Book Narita Express",
    skyliner: "Book Skyliner",
    haruka: "Book JR Haruka",
    nankai: "Book Nankai Rapi:t",
    monorail: "Book Tokyo Monorail",
    bus: "Book airport bus",
    default: "Book this route",
  },
  es: { private: "Transfer privado de aeropuerto", nex: "Reservar Narita Express", skyliner: "Reservar Skyliner", haruka: "Reservar JR Haruka", nankai: "Reservar Nankai Rapi:t", monorail: "Reservar Tokyo Monorail", bus: "Reservar bus de aeropuerto", default: "Reservar esta ruta" },
  "pt-BR": { private: "Transfer privado de aeroporto", nex: "Reservar Narita Express", skyliner: "Reservar Skyliner", haruka: "Reservar JR Haruka", nankai: "Reservar Nankai Rapi:t", monorail: "Reservar Tokyo Monorail", bus: "Reservar onibus de aeroporto", default: "Reservar esta rota" },
  ko: { private: "공항 private transfer", nex: "Narita Express 예약", skyliner: "Skyliner 예약", haruka: "JR Haruka 예약", nankai: "Nankai Rapi:t 예약", monorail: "Tokyo Monorail 예약", bus: "공항버스 예약", default: "이 경로 예약" },
  "zh-TW": { private: "私人機場接送", nex: "預訂 Narita Express", skyliner: "預訂 Skyliner", haruka: "預訂 JR Haruka", nankai: "預訂 Nankai Rapi:t", monorail: "預訂 Tokyo Monorail", bus: "預訂機場巴士", default: "預訂這條路線" },
  "zh-CN": { private: "私人机场接送", nex: "预订 Narita Express", skyliner: "预订 Skyliner", haruka: "预订 JR Haruka", nankai: "预订 Nankai Rapi:t", monorail: "预订 Tokyo Monorail", bus: "预订机场巴士", default: "预订这条路线" },
  fr: { private: "Transfert aeroport prive", nex: "Reserver Narita Express", skyliner: "Reserver Skyliner", haruka: "Reserver JR Haruka", nankai: "Reserver Nankai Rapi:t", monorail: "Reserver Tokyo Monorail", bus: "Reserver le bus aeroport", default: "Reserver cette route" },
  de: { private: "Privater Flughafentransfer", nex: "Narita Express buchen", skyliner: "Skyliner buchen", haruka: "JR Haruka buchen", nankai: "Nankai Rapi:t buchen", monorail: "Tokyo Monorail buchen", bus: "Flughafenbus buchen", default: "Diese Route buchen" },
  ru: { private: "Частный трансфер из аэропорта", nex: "Забронировать Narita Express", skyliner: "Забронировать Skyliner", haruka: "Забронировать JR Haruka", nankai: "Забронировать Nankai Rapi:t", monorail: "Забронировать Tokyo Monorail", bus: "Забронировать автобус аэропорта", default: "Забронировать маршрут" },
};

function localizedActionTitle(name: string, locale?: string, canCompare = false) {
  const text = canCompare
    ? (actionTitleText[locale ?? "en"] ?? actionTitleText.en)
    : (bookActionTitleText[locale ?? "en"] ?? bookActionTitleText.en);
  const normalized = normalizedName(name);
  if (normalized.includes("private")) return text.private;
  if (normalized.includes("narita express") || normalized.includes("n'ex")) return text.nex;
  if (normalized.includes("skyliner")) return text.skyliner;
  if (normalized.includes("haruka")) return text.haruka;
  if (isNankaiRapit(name)) return text.nankai ?? text.default;
  if (normalized.includes("monorail")) return text.monorail ?? text.default;
  if (isAirportBus(name)) return text.bus;
  return text.default;
}

function transportTypeForOption(name: string) {
  if (isPrivateTransfer(name)) return "private_transfer";
  if (isAirportBus(name)) return "airport_bus";
  if (isAirportTrain(name)) return "airport_train";
  return undefined;
}

const routeOmioIds: Record<string, string> = {
  "/airport-transfers/narita-to-shinjuku": "omioNaritaAirportToShinjuku",
  "/airport-transfers/narita-to-tokyo-station": "omioNaritaAirportToTokyo",
  "/airport-transfers/narita-to-ueno": "omioNaritaAirportToUeno",
  "/airport-transfers/narita-to-asakusa": "omioNaritaAirportToAsakusa",
  "/airport-transfers/haneda-to-shinjuku": "omioHanedaAirportToShinjuku",
  "/airport-transfers/haneda-to-tokyo-station": "omioHanedaAirportToTokyo",
  "/airport-transfers/haneda-to-ueno": "omioHanedaAirportToUeno",
  "/airport-transfers/haneda-to-asakusa": "omioHanedaAirportToAsakusa",
};

function omioForOption(name: string, pagePath?: string) {
  if (isPrivateTransfer(name)) return null;
  if (isNormalTaxi(name)) return null;
  if (isNoReservationLocalOption(name)) return null;
  if (!isAirportBus(name) && !isAirportTrain(name)) return null;
  const linkId = pagePath ? routeOmioIds[pagePath] : undefined;
  if (!linkId) return null;
  const config = getAffiliateConfig(linkId);
  if (config?.urlSpecificity !== "route_search_prefilled" && config?.urlSpecificity !== "route_specific_page") return null;
  const href = getReadyAffUrl(linkId);
  if (!href) return null;
  return { href, linkId, transportType: "airport_route_compare" };
}

function linkIdForKlookOption(name: string, pagePath?: string) {
  const text = normalizedName(name);
  if (text.includes("narita express") || text.includes("n'ex")) return "nex";
  if (text.includes("skyliner")) return "keiseiSkyliner";
  if (text.includes("haruka")) return "jrHaruka";
  if (isNankaiRapit(name)) return "nankaiRapit";
  if (isPrivateTransfer(name)) {
    if (pagePath?.includes("narita")) return "naritaPrivateTransfer";
    if (pagePath?.includes("haneda")) return "hanedaPrivateTransfer";
    return "airportPrivateTransfer";
  }
  if (text.includes("limousine") || text.includes("bus")) {
    if (pagePath?.includes("narita")) return "naritaLimousineBus";
    if (pagePath?.includes("haneda")) return "hanedaLimousineBus";
    if (pagePath?.includes("kansai") || pagePath?.includes("kyoto") || pagePath?.includes("osaka")) return "kixLimousineBus";
    return undefined;
  }
  if (text.includes("monorail")) return "hanedaMonorail";
  return undefined;
}

function configuredKlookHrefForOption(name: string, pagePath?: string) {
  const text = normalizedName(name);
  if (text.includes("haruka")) return jrHarukaUrl;
  if (isNankaiRapit(name)) return nankaiRapitUrl;
  if (isPrivateTransfer(name)) {
    if (pagePath?.includes("narita")) return naritaPrivateTransferUrl ?? airportPrivateTransferUrl;
    if (pagePath?.includes("haneda")) return hanedaPrivateTransferUrl ?? airportPrivateTransferUrl;
    return airportPrivateTransferUrl;
  }
  if (isAirportBus(name)) {
    if (pagePath?.includes("narita")) return naritaLimousineBusUrl;
    if (pagePath?.includes("haneda")) return hanedaLimousineBusUrl;
    if (pagePath?.includes("kansai") || pagePath?.includes("kyoto") || pagePath?.includes("osaka")) return kixLimousineBusUrl;
  }
  return undefined;
}

function validKlookBookingLink(name: string, href?: string, pagePath?: string, bookingMode?: TransferOptionProps["bookingMode"]) {
  const effectiveBookingMode = deriveBookingMode(name, bookingMode);
  if (effectiveBookingMode === "no_booking_ic_card" || effectiveBookingMode === "taxi_stand" || effectiveBookingMode === "comparison_only") return undefined;
  if (isNoReservationLocalOption(name)) return undefined;
  const configuredHref = configuredKlookHrefForOption(name, pagePath);
  if (configuredHref) return configuredHref;
  if (!href) return undefined;
  if (effectiveBookingMode === "private_transfer" && href === legacyAirportTransferUrl) return undefined;
  if (isAirportBus(name) && href === naritaLimousineBusUrl && !pagePath?.includes("narita")) return undefined;
  return href;
}

const badgeConfig = {
  fastest: { label: "Fastest", icon: Zap },
  easiest: { label: "Easiest with luggage", icon: Check },
  cheapest: { label: "Cheapest", icon: Wallet },
};

const tagText: Record<string, Record<string, string>> = {
  en: {
    luggageFriendly: "Luggage friendly",
    luggageDifficult: "Luggage difficult",
    lateOk: "Late arrival OK",
    endsEarly: "Ends early evening",
  },
  "pt-BR": {
    luggageFriendly: "Bom com bagagem",
    luggageDifficult: "Dificil com bagagem",
    lateOk: "Serve para chegada tarde",
    endsEarly: "Termina cedo",
  },
  es: {
    luggageFriendly: "Comodo con equipaje",
    luggageDifficult: "Dificil con equipaje",
    lateOk: "Sirve para llegada tarde",
    endsEarly: "Termina temprano",
  },
  ko: {
    luggageFriendly: "짐 이동 편함",
    luggageDifficult: "짐 이동 어려움",
    lateOk: "늦은 도착 가능",
    endsEarly: "저녁 일찍 종료",
  },
  "zh-TW": {
    luggageFriendly: "行李友善",
    luggageDifficult: "行李較不方便",
    lateOk: "適合晚到",
    endsEarly: "傍晚較早結束",
  },
  "zh-CN": {
    luggageFriendly: "行李友好",
    luggageDifficult: "行李较不方便",
    lateOk: "适合晚到",
    endsEarly: "傍晚较早结束",
  },
  fr: {
    luggageFriendly: "Pratique avec bagages",
    luggageDifficult: "Difficile avec bagages",
    lateOk: "OK arrivee tardive",
    endsEarly: "Se termine tot",
  },
  de: {
    luggageFriendly: "Gepaeckfreundlich",
    luggageDifficult: "Schwierig mit Gepaeck",
    lateOk: "Spaete Ankunft OK",
    endsEarly: "Endet frueh",
  },
  ru: {
    luggageFriendly: "Удобно с багажом",
    luggageDifficult: "Сложно с багажом",
    lateOk: "Подходит для позднего прилета",
    endsEarly: "Заканчивается рано",
  },
};

const optionListText: Record<string, {
  pros: {
    fastest: string;
    cheapest: string;
    luggage: string;
    light: string;
    late: string;
    daytime: string;
    bookable: string;
    noBooking: string;
  };
  cons: {
    expensive: string;
    transfer: string;
    traffic: string;
    luggage: string;
    late: string;
    schedule: string;
  };
  cost: {
    usually: string;
    often: string;
    depending: string;
  };
}> = {
  en: {
    pros: { fastest: "Fast travel time after landing", cheapest: "Keeps transfer cost low", luggage: "Easier with large luggage", light: "Good when traveling light", late: "Can work for later arrivals", daytime: "Good for daytime arrivals", bookable: "Can be booked in advance", noBooking: "No advance booking needed" },
    cons: { expensive: "Costs more than local trains", transfer: "May require station transfers", traffic: "Traffic can add time", luggage: "Harder with large luggage", late: "Check final departures", schedule: "Schedule can be less flexible" },
    cost: { usually: "usually around", often: "often around", depending: "depending on" },
  },
  "pt-BR": {
    pros: { fastest: "Tempo de viagem rapido apos o pouso", cheapest: "Mantem o custo baixo", luggage: "Mais facil com malas grandes", light: "Bom se voce viaja leve", late: "Pode funcionar para chegadas mais tarde", daytime: "Bom para chegadas durante o dia", bookable: "Pode ser reservado com antecedencia", noBooking: "Nao precisa reservar antes" },
    cons: { expensive: "Custa mais que trens locais", transfer: "Pode exigir baldeacoes em estacoes", traffic: "Transito pode aumentar o tempo", luggage: "Mais dificil com malas grandes", late: "Confira os ultimos horarios", schedule: "Horario pode ser menos flexivel" },
    cost: { usually: "geralmente cerca de", often: "frequentemente cerca de", depending: "dependendo de" },
  },
  es: {
    pros: { fastest: "Tiempo rapido despues de aterrizar", cheapest: "Mantiene bajo el coste del traslado", luggage: "Mas facil con maletas grandes", light: "Bueno si viajas ligero", late: "Puede servir para llegadas tardias", daytime: "Bueno para llegadas durante el dia", bookable: "Se puede reservar con antelacion", noBooking: "No requiere reserva previa" },
    cons: { expensive: "Cuesta mas que trenes locales", transfer: "Puede requerir transbordos en estaciones", traffic: "El trafico puede sumar tiempo", luggage: "Mas dificil con maletas grandes", late: "Revisa los ultimos horarios", schedule: "El horario puede ser menos flexible" },
    cost: { usually: "normalmente alrededor de", often: "a menudo alrededor de", depending: "segun" },
  },
  ko: {
    pros: { fastest: "도착 후 이동 시간이 빠름", cheapest: "이동 비용을 낮게 유지", luggage: "큰 짐이 있을 때 더 편함", light: "짐이 적을 때 좋음", late: "늦은 도착에도 가능할 수 있음", daytime: "낮 도착에 좋음", bookable: "사전 예약 가능", noBooking: "사전 예약 필요 없음" },
    cons: { expensive: "일반 전철보다 비쌀 수 있음", transfer: "역 환승이 필요할 수 있음", traffic: "교통 상황에 따라 시간이 늘어남", luggage: "큰 짐이 있으면 더 어려움", late: "막차 시간을 확인해야 함", schedule: "시간표가 덜 유연할 수 있음" },
    cost: { usually: "보통 약", often: "대개 약", depending: "조건에 따라" },
  },
  "zh-TW": {
    pros: { fastest: "落地後移動時間較快", cheapest: "能壓低交通費", luggage: "大型行李較方便", light: "適合輕裝旅行", late: "可能適合較晚抵達", daytime: "適合白天抵達", bookable: "可事先預訂", noBooking: "不需要事先預訂" },
    cons: { expensive: "比一般電車貴", transfer: "可能需要車站轉乘", traffic: "交通狀況可能增加時間", luggage: "大型行李較不方便", late: "需要確認末班時間", schedule: "班次彈性可能較低" },
    cost: { usually: "通常約", often: "多半約", depending: "視" },
  },
  "zh-CN": {
    pros: { fastest: "落地后移动时间较快", cheapest: "能压低交通费", luggage: "大型行李较方便", light: "适合轻装旅行", late: "可能适合较晚抵达", daytime: "适合白天抵达", bookable: "可事先预订", noBooking: "不需要事先预订" },
    cons: { expensive: "比普通电车贵", transfer: "可能需要车站换乘", traffic: "交通状况可能增加时间", luggage: "大型行李较不方便", late: "需要确认末班时间", schedule: "班次弹性可能较低" },
    cost: { usually: "通常约", often: "多半约", depending: "视" },
  },
  fr: {
    pros: { fastest: "Temps de trajet rapide apres l'atterrissage", cheapest: "Garde le cout du transfert bas", luggage: "Plus simple avec de grosses valises", light: "Bien si vous voyagez leger", late: "Peut fonctionner pour les arrivees tardives", daytime: "Bien pour les arrivees en journee", bookable: "Peut etre reserve a l'avance", noBooking: "Pas de reservation necessaire" },
    cons: { expensive: "Plus cher que les trains locaux", transfer: "Peut demander des correspondances", traffic: "Le trafic peut ajouter du temps", luggage: "Plus difficile avec de grosses valises", late: "Verifiez les derniers departs", schedule: "Horaires parfois moins flexibles" },
    cost: { usually: "generalement autour de", often: "souvent autour de", depending: "selon" },
  },
  de: {
    pros: { fastest: "Schnelle Fahrzeit nach der Landung", cheapest: "Haelt Transferkosten niedrig", luggage: "Einfacher mit grossen Koffern", light: "Gut mit wenig Gepaeck", late: "Kann fuer spaete Ankunft passen", daytime: "Gut fuer Ankunft am Tag", bookable: "Kann vorab gebucht werden", noBooking: "Keine Vorabbuchung noetig" },
    cons: { expensive: "Teurer als lokale Zuege", transfer: "Kann Umstiege am Bahnhof erfordern", traffic: "Verkehr kann Zeit kosten", luggage: "Schwieriger mit grossen Koffern", late: "Letzte Abfahrten pruefen", schedule: "Fahrplan kann weniger flexibel sein" },
    cost: { usually: "normalerweise etwa", often: "oft etwa", depending: "je nach" },
  },
  ru: {
    pros: { fastest: "Быстрое время в пути после прилета", cheapest: "Помогает снизить стоимость трансфера", luggage: "Удобнее с крупным багажом", light: "Хорошо, если вы едете налегке", late: "Может подойти для позднего прилета", daytime: "Хорошо для дневного прилета", bookable: "Можно забронировать заранее", noBooking: "Предварительное бронирование не нужно" },
    cons: { expensive: "Дороже местных поездов", transfer: "Могут потребоваться пересадки", traffic: "Пробки могут увеличить время", luggage: "Сложнее с крупным багажом", late: "Проверьте последние отправления", schedule: "Расписание может быть менее гибким" },
    cost: { usually: "обычно около", often: "часто около", depending: "в зависимости от" },
  },
};

function optionTag(locale: string | undefined, key: keyof (typeof tagText)["en"]) {
  return (tagText[locale ?? "en"] ?? tagText.en)[key];
}

function localizeCost(cost: string, locale?: string) {
  const text = optionListText[locale ?? "en"] ?? optionListText.en;
  if ((locale ?? "en") === "en") return cost;
  return cost
    .replace("usually around", text.cost.usually)
    .replace("often around", text.cost.often)
    .replace("depending on", text.cost.depending);
}

function localizedPros(locale: string | undefined, badge: TransferOptionProps["badge"], luggageFriendly: boolean, lateOk: boolean, bookable: boolean) {
  if ((locale ?? "en") === "en") return null;
  const text = optionListText[locale ?? "en"] ?? optionListText.en;
  return [
    badge === "fastest" ? text.pros.fastest : badge === "cheapest" ? text.pros.cheapest : text.pros.luggage,
    luggageFriendly ? text.pros.luggage : text.pros.light,
    lateOk ? text.pros.late : text.pros.daytime,
    bookable ? text.pros.bookable : text.pros.noBooking,
  ];
}

function localizedCons(locale: string | undefined, badge: TransferOptionProps["badge"], luggageFriendly: boolean, lateOk: boolean, name: string) {
  if ((locale ?? "en") === "en") return null;
  const text = optionListText[locale ?? "en"] ?? optionListText.en;
  return [
    badge === "cheapest" ? text.cons.transfer : badge === "easiest" && isAirportBus(name) ? text.cons.traffic : text.cons.expensive,
    luggageFriendly ? text.cons.schedule : text.cons.luggage,
    lateOk ? text.cons.traffic : text.cons.late,
  ];
}

function bestForCopy(badge: TransferOptionProps["badge"], luggageFriendly: boolean, lateOk: boolean, locale?: string) {
  const ui = getAirportRouteUiCopy(locale);
  if (badge === "fastest") return ui.bestFor.fastest;
  if (badge === "cheapest") return ui.bestFor.cheapest;
  if (luggageFriendly && lateOk) return ui.bestFor.luggageLate;
  if (luggageFriendly) return ui.bestFor.luggage;
  return ui.bestFor.default;
}

export function TransferOption({
  name, badge, duration, cost, pros, cons,
  luggageFriendly, lateOk, bookingLink, bookingLabel = "Book ticket", locale = "en", pagePath, placement = "airport_transfer", bookingMode: explicitBookingMode,
}: TransferOptionProps) {
  const ui = getAirportRouteUiCopy(locale);
  const bookingMode = deriveBookingMode(name, explicitBookingMode);
  const b = badgeConfig[badge];
  const BadgeIcon = b.icon;
  const effectiveBookingLink = validKlookBookingLink(name, bookingLink, pagePath, bookingMode);
  const omio = bookingMode === "affiliate_booking" && effectiveBookingLink ? omioForOption(name, pagePath) : null;
  const transportType = transportTypeForOption(name);
  const providerCtas = effectiveBookingLink
    ? [
        {
          href: effectiveBookingLink,
          label: "Klook",
          pagePath,
          locale,
          provider: "klook" as const,
          linkId: linkIdForKlookOption(name, pagePath),
          product: bookingMode === "private_transfer" ? "airport_private_transfer" : isAirportBus(name) ? "airport_bus" : "airport_train",
          transportType,
        },
        ...(omio
          ? [
              {
                href: omio.href,
                label: "Omio",
                pagePath,
                locale,
                provider: "omio" as const,
                linkId: omio.linkId,
                product: "airport_route_compare",
                transportType: omio.transportType,
              },
            ]
          : []),
      ]
    : [];

  return (
    <TransferOptionCard
      title={name}
      time={duration}
      price={localizeCost(cost, locale)}
      bestFor={bestForCopy(badge, luggageFriendly, lateOk, locale)}
      pros={localizedPros(locale, badge, luggageFriendly, lateOk, Boolean(effectiveBookingLink)) ?? pros}
      cons={localizedCons(locale, badge, luggageFriendly, lateOk, name) ?? cons}
      tags={[
        { label: ui.badges[badge] ?? b.label, tone: badge === "fastest" ? "amber" : badge === "easiest" ? "green" : "slate", icon: <BadgeIcon className="h-3 w-3" /> },
        { label: luggageFriendly ? optionTag(locale, "luggageFriendly") : optionTag(locale, "luggageDifficult"), tone: luggageFriendly ? "green" : "slate", icon: <Luggage className="h-3 w-3" /> },
        { label: lateOk ? optionTag(locale, "lateOk") : optionTag(locale, "endsEarly"), tone: lateOk ? "green" : "amber", icon: <Clock className="h-3 w-3" /> },
      ]}
      ctas={providerCtas}
      actionTitle={localizedActionTitle(name, locale, providerCtas.some((item) => item.provider === "omio")) || actionTitleForOption(name)}
      helperText={
        providerCtas.length > 1
          ? ui.helperBoth
          : effectiveBookingLink
            ? ui.helperKlook
            : undefined
      }
      note={
        effectiveBookingLink
          ? undefined
          : bookingMode === "taxi_stand"
            ? "No advance booking needed - use taxi stand"
            : bookingMode === "private_transfer"
              ? ui.preBook
              : bookingMode === "no_booking_ic_card" || bookingLabel.includes("IC card")
                ? ui.noBookingIc
                : bookingLabel || ui.noBooking
      }
      placement={placement}
      prosLabel={ui.pros}
      consLabel={ui.cons}
    />
  );
}
