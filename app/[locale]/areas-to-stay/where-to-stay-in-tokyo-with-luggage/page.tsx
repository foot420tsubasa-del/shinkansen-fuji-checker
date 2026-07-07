import type { Metadata } from "next";
import { Luggage, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { SiteFooter } from "@/components/content/SiteFooter";
import { FujiseatAreaLogic } from "@/components/content/FujiseatAreaLogic";
import { ProviderChoiceCTA, type ProviderChoiceButton } from "@/components/affiliate/ProviderChoiceCTA";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { AdSlot } from "@/components/ads/AdSlot";
import { getAlternates } from "@/i18n/hreflang";
import { getHotelLink, getTripHotelConfig, type HotelAreaKey } from "@/lib/hotel-links";
import { SiteHeader } from "../../components/SiteHeader";

type Props = {
  params: Promise<{ locale: string }>;
};

const pagePath = "/areas-to-stay/where-to-stay-in-tokyo-with-luggage";

type LuggageArea = {
  title: string;
  bestFor: string;
  watchOut: string;
  goodIf: string;
  notIdealIf: string;
};

type LuggageHotelBaseArea = {
  title: string;
  goodIf: string;
  avoidIf: string;
  logic: string;
  hotelKey: HotelAreaKey;
};

type LuggageCopy = {
  metadataTitle: string;
  metadataDescription: string;
  breadcrumbHome: string;
  breadcrumbStay: string;
  breadcrumbTokyo: string;
  breadcrumbCurrent: string;
  eyebrow: string;
  title: string;
  intro: string;
  quickTitle: string;
  quickBody: string;
  factorsTitle: string;
  factors: Array<[string, string]>;
  luggageOptionEyebrow: string;
  luggageOptionTitle: string;
  luggageOptionBody: string;
  deliveryCards: Array<[string, string]>;
  checklistTitle: string;
  checklist: string[];
  dayBagTitle: string;
  dayBagBody: string;
  sourcesTitle: string;
  airportTransferLink: string;
  hotelBaseLink: string;
  hotelExamplesLink: string;
  areaLogicTitle: string;
  labels: {
    bestFor: string;
    watchOut: string;
    goodIf: string;
    notIdealIf: string;
  };
  areas: LuggageArea[];
  famousTitle: string;
  famousBody: string;
  nextTitle: string;
  nextBody: string;
  stayGuideLink: string;
  finderCtaLabel: string;
  continueTitle: string;
  continueLinks: Array<[string, string]>;
};

const luggageCopyByLocale: Record<string, LuggageCopy> = {
  en: {
    metadataTitle: "Where to Stay in Tokyo With Luggage: Airport, Stations and Hotel Area Tips",
    metadataDescription:
      "Traveling in Tokyo with large suitcases? Learn how airport access, station size, elevators, Shinkansen plans, and hotel room size should affect where you stay.",
    breadcrumbHome: "Home",
    breadcrumbStay: "Where to stay",
    breadcrumbTokyo: "Tokyo",
    breadcrumbCurrent: "Tokyo with luggage",
    eyebrow: "Tokyo luggage planning",
    title: "Where to Stay in Tokyo With Luggage",
    intro: "Tokyo is easy to travel around, but large suitcases can make the wrong hotel area feel stressful. The best base is not always the biggest or most famous station.",
    quickTitle: "Quick answer",
    quickBody: "If you have large luggage, choose your Tokyo hotel area by airport access, elevator access, station complexity, walking distance, and Shinkansen plans. A famous station can be convenient, but a calmer nearby area or simpler route may be easier for your first night.",
    factorsTitle: "What matters most with luggage",
    factors: [
      ["Airport arrival", "Narita and Haneda can point you toward different parts of Tokyo. Your first hotel area should match your arrival route, especially if you land late."],
      ["Station complexity", "Large stations can be convenient but tiring with suitcases. Check exits, elevators, and walking distance before booking."],
      ["Shinkansen plans", "If you take an early Shinkansen to Kyoto or Osaka, your Tokyo base can affect your morning stress as much as your train seat."],
      ["Room size", "A room that works for one small bag may feel tight with two large suitcases. Check square meters and bed setup before booking."],
      ["Quiet nights", "Nightlife areas can be fun to visit but not always ideal as a sleep base."],
    ],
    luggageOptionEyebrow: "Luggage option",
    luggageOptionTitle: "Option: send your luggage from the airport to your hotel",
    luggageOptionBody: "Airport luggage delivery can reduce the stress of crossing Tokyo with large suitcases. Yamato / Hands-Free Travel counters and JAL ABC airport counters may support delivery or storage, where available. Treat this as an option to check at the airport, not a guaranteed service: destination coverage, cut-off times, counter hours, and delivery windows vary by airport, counter, and service.",
    deliveryCards: [
      ["Airport → hotel delivery", "Yamato Airport TA-Q-BIN counters may let you send luggage from airport counters onward, and JAL ABC lists airport-to-hotel delivery services from arrival counters. Same-day hotel delivery may be available in limited cases, but check the counter, service area, and deadline before relying on it."],
      ["Hotel → airport delivery", "Some services also support sending luggage back to an airport before departure. Yamato notes that airport delivery can require advance timing, and JAL ABC has hotel-to-airport service pages for some airports. Confirm the deadline with your hotel front desk or the delivery counter."],
      ["Store luggage before check-in", "Yamato baggage storage counters may let you store bags at selected stations, airports, or commercial areas. This can help if you arrive before hotel check-in, but storage availability, business hours, and pick-up timing vary by counter."],
    ],
    checklistTitle: "Before you use delivery",
    checklist: [
      "Confirm the hotel name, address, and reservation name.",
      "Ask whether the hotel front desk accepts luggage delivery before check-in.",
      "Check the airport counter, destination coverage, cut-off time, and expected delivery window.",
      "For JAL ABC Hotel Baggage Delivery, check whether the 14:00 hotel-delivery deadline applies to your airport and service.",
      "For Yamato same-day delivery, check whether the counter actually offers same-day delivery for your destination.",
    ],
    dayBagTitle: "Keep a small day bag",
    dayBagBody: "Carry passports, medicine, chargers, valuables, and overnight essentials with you. Luggage delivery can be especially useful if you arrive before hotel check-in or travel with family or multiple suitcases.",
    sourcesTitle: "Official sources to check",
    airportTransferLink: "Airport transfer guide",
    hotelBaseLink: "Tokyo hotel base guide",
    hotelExamplesLink: "Local hotel examples",
    areaLogicTitle: "Major area logic with luggage",
    labels: { bestFor: "Best for", watchOut: "Watch out", goodIf: "Good if", notIdealIf: "Not ideal if" },
    areas: [
      { title: "Shinjuku", bestFor: "Transport choice and nightlife.", watchOut: "Huge station scale and lively nightlife blocks can feel tiring with luggage.", goodIf: "You want maximum route choice and do not mind a busier base.", notIdealIf: "You want the calmest first night or dislike large station navigation." },
      { title: "Ueno / Asakusa side", bestFor: "Narita access and calmer arrival nights.", watchOut: "Some routes rely more on subway transfers.", goodIf: "You want practical Narita access, old-town atmosphere, or a less intense base.", notIdealIf: "You need the easiest possible Shinkansen morning." },
      { title: "Tokyo Station side", bestFor: "Early Shinkansen and clean logistics.", watchOut: "Can feel businesslike and often less local at night.", goodIf: "You want to reduce luggage stress before Kyoto or Osaka.", notIdealIf: "You want nightlife or a neighborhood feel outside the hotel." },
      { title: "East Tokyo", bestFor: "Calmer neighborhoods and repeat visitors.", watchOut: "Not always the default first-time base.", goodIf: "You value quieter streets, coffee, riverside walks, and a local feel.", notIdealIf: "You need the simplest first-night arrival route." },
    ],
    famousTitle: "Do not choose only by famous station names",
    famousBody: "A famous station is not always the easiest place to sleep. With luggage, the easier choice may be the area with the simpler walking route, clearer exits, better elevator access, and a room size that works for your group.",
    nextTitle: "Next step: compare Tokyo hotel areas",
    nextBody: "Use this luggage logic with the Tokyo stay area guide before comparing hotels. The right hotel base depends on airport access, walking distance, station complexity, room size, and your Shinkansen plans.",
    stayGuideLink: "Open Tokyo stay area guide",
    finderCtaLabel: "Compare areas by luggage, airport & Shinkansen access",
    continueTitle: "Continue planning",
    continueLinks: [["/areas-to-stay/tokyo-first-time", "Tokyo stay area guide"], ["/areas-to-stay/tokyo-hotel-room-size-guide", "Room size guide"], ["/airport-transfers", "Airport transfers"], ["/local-hotel-picks", "Local hotel examples"], ["/guide", "Shinkansen Seat E guide"]],
  },
  "pt-BR": {
    metadataTitle: "Onde ficar em Tokyo com bagagem: aeroporto, estações e áreas de hotel",
    metadataDescription: "Viajando por Tokyo com malas grandes? Entenda como aeroporto, tamanho da estação, elevadores, Shinkansen e tamanho do quarto afetam onde ficar.",
    breadcrumbHome: "Início",
    breadcrumbStay: "Onde ficar",
    breadcrumbTokyo: "Tokyo",
    breadcrumbCurrent: "Tokyo com bagagem",
    eyebrow: "Planejamento de bagagem em Tokyo",
    title: "Onde ficar em Tokyo com bagagem",
    intro: "Tokyo é fácil de circular, mas malas grandes podem tornar a área errada do hotel estressante. A melhor base nem sempre é a maior ou mais famosa estação.",
    quickTitle: "Resposta rápida",
    quickBody: "Com bagagem grande, escolha sua área em Tokyo por acesso ao aeroporto, elevadores, complexidade da estação, distância a pé e planos de Shinkansen. Uma estação famosa pode ser conveniente, mas uma área mais calma próxima ou uma rota mais simples pode ser melhor na primeira noite.",
    factorsTitle: "O que mais importa com bagagem",
    factors: [["Chegada do aeroporto", "Narita e Haneda podem apontar para partes diferentes de Tokyo. Sua primeira área de hotel deve combinar com a rota de chegada, especialmente se você chegar tarde."], ["Complexidade da estação", "Estações grandes são convenientes, mas cansativas com malas. Verifique saídas, elevadores e distância a pé antes de reservar."], ["Planos de Shinkansen", "Se você pega um Shinkansen cedo para Kyoto ou Osaka, sua base em Tokyo pode afetar a manhã tanto quanto o assento."], ["Tamanho do quarto", "Um quarto bom para uma mala pequena pode ficar apertado com duas malas grandes. Verifique metros quadrados e camas."], ["Noites calmas", "Áreas de vida noturna são divertidas para visitar, mas nem sempre ideais para dormir."]],
    luggageOptionEyebrow: "Opção de bagagem",
    luggageOptionTitle: "Opção: envie sua bagagem do aeroporto para o hotel",
    luggageOptionBody: "Entrega de bagagem do aeroporto pode reduzir o estresse de atravessar Tokyo com malas grandes. Balcões Yamato / Hands-Free Travel e JAL ABC podem oferecer entrega ou guarda-volumes, quando disponível. Trate como uma opção a confirmar no aeroporto, não como serviço garantido: cobertura, prazos, horários e janelas de entrega variam.",
    deliveryCards: [["Aeroporto → hotel", "Balcões Yamato Airport TA-Q-BIN podem permitir envio de bagagem a partir do aeroporto, e a JAL ABC lista serviços de aeroporto para hotel. Entrega no mesmo dia pode existir em casos limitados; confirme balcão, área e prazo."], ["Hotel → aeroporto", "Alguns serviços também enviam bagagem ao aeroporto antes da partida. Pode exigir antecedência. Confirme o prazo com o hotel ou balcão."], ["Guardar bagagem antes do check-in", "Balcões Yamato podem guardar bagagem em estações, aeroportos ou áreas comerciais selecionadas. Disponibilidade, horários e retirada variam."]],
    checklistTitle: "Antes de usar entrega",
    checklist: ["Confirme nome, endereço e nome da reserva do hotel.", "Pergunte se a recepção aceita bagagem antes do check-in.", "Confira balcão, cobertura, prazo e janela de entrega.", "Na JAL ABC Hotel Baggage Delivery, confirme se o prazo de 14:00 vale para seu aeroporto e serviço.", "Na entrega no mesmo dia da Yamato, confirme se o balcão oferece o serviço para seu destino."],
    dayBagTitle: "Leve uma bolsa pequena",
    dayBagBody: "Leve passaportes, remédios, carregadores, objetos de valor e itens essenciais para uma noite. A entrega de bagagem ajuda especialmente antes do check-in ou com família e várias malas.",
    sourcesTitle: "Fontes oficiais para verificar",
    airportTransferLink: "Guia de transfer do aeroporto",
    hotelBaseLink: "Guia de base hoteleira em Tokyo",
    hotelExamplesLink: "Exemplos de hotéis locais",
    areaLogicTitle: "Lógica das principais áreas com bagagem",
    labels: { bestFor: "Melhor para", watchOut: "Atenção", goodIf: "Bom se", notIdealIf: "Não ideal se" },
    areas: [
      { title: "Shinjuku", bestFor: "Opções de transporte e vida noturna.", watchOut: "Estação enorme e áreas movimentadas cansam com malas.", goodIf: "Você quer máxima flexibilidade e aceita uma base agitada.", notIdealIf: "Você quer a primeira noite mais calma ou não gosta de estações grandes." },
      { title: "Ueno / Asakusa", bestFor: "Acesso a Narita e noites mais calmas.", watchOut: "Algumas rotas dependem mais de metrô.", goodIf: "Você quer Narita prático, atmosfera antiga ou base menos intensa.", notIdealIf: "Você precisa da manhã de Shinkansen mais simples possível." },
      { title: "Tokyo Station", bestFor: "Shinkansen cedo e logística limpa.", watchOut: "Pode parecer comercial e menos local à noite.", goodIf: "Você quer reduzir estresse com malas antes de Kyoto ou Osaka.", notIdealIf: "Você quer vida noturna ou sensação de bairro." },
      { title: "East Tokyo", bestFor: "Bairros calmos e repetentes.", watchOut: "Nem sempre é a base padrão para primeira viagem.", goodIf: "Você valoriza ruas calmas, cafés, rios e clima local.", notIdealIf: "Você precisa da chegada mais simples na primeira noite." },
    ],
    famousTitle: "Não escolha só por nomes famosos de estações",
    famousBody: "Uma estação famosa nem sempre é o lugar mais fácil para dormir. Com bagagem, pode ser melhor uma área com rota a pé simples, saídas claras, elevadores e quarto adequado ao grupo.",
    nextTitle: "Próximo passo: compare áreas de hotel em Tokyo",
    nextBody: "Use esta lógica de bagagem com o guia de áreas de Tokyo antes de comparar hotéis. A base certa depende de aeroporto, caminhada, estação, tamanho do quarto e Shinkansen.",
    stayGuideLink: "Abrir guia de áreas de Tokyo",
    finderCtaLabel: "Compare áreas por bagagem, aeroporto e acesso ao Shinkansen",
    continueTitle: "Continue planejando",
    continueLinks: [["/areas-to-stay/tokyo-first-time", "Guia de áreas de Tokyo"], ["/areas-to-stay/tokyo-hotel-room-size-guide", "Guia de tamanho do quarto"], ["/airport-transfers", "Transfers do aeroporto"], ["/local-hotel-picks", "Exemplos de hotéis"], ["/guide", "Guia Seat E do Shinkansen"]],
  },
  es: {
    metadataTitle: "Dónde alojarse en Tokio con equipaje: aeropuerto, estaciones y zonas",
    metadataDescription: "¿Viajas por Tokio con maletas grandes? Aprende cómo aeropuerto, tamaño de estación, ascensores, Shinkansen y habitación afectan dónde alojarte.",
    breadcrumbHome: "Inicio", breadcrumbStay: "Dónde alojarse", breadcrumbTokyo: "Tokio", breadcrumbCurrent: "Tokio con equipaje",
    eyebrow: "Planificación de equipaje en Tokio", title: "Dónde alojarse en Tokio con equipaje",
    intro: "Tokio es fácil de recorrer, pero las maletas grandes pueden hacer que una zona de hotel equivocada se sienta estresante. La mejor base no siempre es la estación más grande o famosa.",
    quickTitle: "Respuesta rápida", quickBody: "Con equipaje grande, elige tu zona por acceso al aeropuerto, ascensores, complejidad de estación, distancia a pie y planes de Shinkansen. Una estación famosa puede ser práctica, pero una zona más tranquila cercana o una ruta más simple puede ser mejor para la primera noche.",
    factorsTitle: "Lo más importante con equipaje",
    factors: [["Llegada desde el aeropuerto", "Narita y Haneda pueden apuntar a partes distintas de Tokio. Tu primera zona debe encajar con la ruta de llegada, sobre todo si aterrizas tarde."], ["Complejidad de estación", "Las estaciones grandes son útiles, pero cansan con maletas. Revisa salidas, ascensores y distancia a pie antes de reservar."], ["Planes de Shinkansen", "Si tomas un Shinkansen temprano a Kioto u Osaka, tu base en Tokio afecta la mañana tanto como el asiento."], ["Tamaño de habitación", "Una habitación válida para una bolsa pequeña puede sentirse apretada con dos maletas grandes. Revisa metros cuadrados y camas."], ["Noches tranquilas", "Las zonas de vida nocturna son divertidas para visitar, pero no siempre ideales para dormir."]],
    luggageOptionEyebrow: "Opción de equipaje", luggageOptionTitle: "Opción: enviar tu equipaje del aeropuerto al hotel",
    luggageOptionBody: "La entrega de equipaje desde el aeropuerto puede reducir el estrés de cruzar Tokio con maletas grandes. Los mostradores Yamato / Hands-Free Travel y JAL ABC pueden ofrecer entrega o almacenamiento, donde esté disponible. Confírmalo en el aeropuerto: cobertura, horarios límite y ventanas de entrega varían.",
    deliveryCards: [["Aeropuerto → hotel", "Yamato Airport TA-Q-BIN puede permitir enviar equipaje desde mostradores del aeropuerto, y JAL ABC lista servicios hacia hoteles. La entrega el mismo día puede existir en casos limitados; confirma mostrador, zona y plazo."], ["Hotel → aeropuerto", "Algunos servicios también envían equipaje al aeropuerto antes de salir. Puede requerir antelación. Confirma el plazo con el hotel o mostrador."], ["Guardar equipaje antes del check-in", "Algunos mostradores Yamato permiten guardar equipaje en estaciones, aeropuertos o zonas comerciales. Disponibilidad, horarios y recogida varían."]],
    checklistTitle: "Antes de usar entrega", checklist: ["Confirma nombre, dirección y nombre de reserva del hotel.", "Pregunta si recepción acepta equipaje antes del check-in.", "Revisa mostrador, cobertura, hora límite y ventana de entrega.", "En JAL ABC Hotel Baggage Delivery, confirma si el plazo de 14:00 aplica a tu aeropuerto y servicio.", "En entrega Yamato el mismo día, confirma si el mostrador la ofrece para tu destino."],
    dayBagTitle: "Lleva una bolsa pequeña", dayBagBody: "Lleva pasaportes, medicinas, cargadores, objetos de valor y esenciales para pasar la noche. La entrega de equipaje puede ayudar antes del check-in o con familia y varias maletas.",
    sourcesTitle: "Fuentes oficiales para revisar", airportTransferLink: "Guía de traslado de aeropuerto", hotelBaseLink: "Guía de base hotelera en Tokio", hotelExamplesLink: "Ejemplos de hoteles locales",
    areaLogicTitle: "Lógica de zonas principales con equipaje", labels: { bestFor: "Mejor para", watchOut: "Cuidado", goodIf: "Bueno si", notIdealIf: "No ideal si" },
    areas: [{ title: "Shinjuku", bestFor: "Opciones de transporte y vida nocturna.", watchOut: "La escala de la estación y zonas animadas cansan con equipaje.", goodIf: "Quieres máxima flexibilidad y no te importa una base movida.", notIdealIf: "Quieres la primera noche más tranquila o no te gustan estaciones grandes." }, { title: "Ueno / Asakusa", bestFor: "Acceso a Narita y noches más tranquilas.", watchOut: "Algunas rutas dependen más del metro.", goodIf: "Quieres acceso práctico a Narita, ambiente antiguo o base menos intensa.", notIdealIf: "Necesitas la mañana de Shinkansen más simple." }, { title: "Tokyo Station", bestFor: "Shinkansen temprano y logística limpia.", watchOut: "Puede sentirse comercial y menos local por la noche.", goodIf: "Quieres reducir estrés con maletas antes de Kioto u Osaka.", notIdealIf: "Quieres vida nocturna o sensación de barrio." }, { title: "East Tokyo", bestFor: "Barrios tranquilos y viajeros repetidores.", watchOut: "No siempre es la base predeterminada para primera visita.", goodIf: "Valoras calles tranquilas, cafés, ríos y ambiente local.", notIdealIf: "Necesitas la llegada más simple la primera noche." }],
    famousTitle: "No elijas solo por nombres de estaciones famosas", famousBody: "Una estación famosa no siempre es el lugar más fácil para dormir. Con equipaje, puede ser mejor una zona con ruta a pie simple, salidas claras, ascensores y una habitación adecuada.",
    nextTitle: "Siguiente paso: compara zonas hoteleras de Tokio", nextBody: "Usa esta lógica de equipaje con la guía de zonas de Tokio antes de comparar hoteles. La base correcta depende de aeropuerto, caminata, estación, tamaño de habitación y Shinkansen.",
    stayGuideLink: "Abrir guía de zonas de Tokio", finderCtaLabel: "Compara zonas por equipaje, aeropuerto y acceso al Shinkansen", continueTitle: "Continuar planificación", continueLinks: [["/areas-to-stay/tokyo-first-time", "Guía de zonas de Tokio"], ["/areas-to-stay/tokyo-hotel-room-size-guide", "Guía de tamaño de habitación"], ["/airport-transfers", "Traslados de aeropuerto"], ["/local-hotel-picks", "Ejemplos de hoteles"], ["/guide", "Guía Seat E del Shinkansen"]],
  },
  ko: {
    metadataTitle: "짐이 있을 때 도쿄 어디에 묵을까: 공항, 역, 호텔 지역 팁",
    metadataDescription: "큰 캐리어가 있다면 공항 접근, 역 규모, 엘리베이터, 신칸센 일정, 객실 크기가 도쿄 숙소 지역 선택에 영향을 줍니다.",
    breadcrumbHome: "홈", breadcrumbStay: "숙소 지역", breadcrumbTokyo: "도쿄", breadcrumbCurrent: "짐이 있는 도쿄",
    eyebrow: "도쿄 짐 동선 계획", title: "짐이 있을 때 도쿄 어디에 묵을까",
    intro: "도쿄는 이동하기 쉽지만 큰 캐리어가 있으면 잘못 고른 호텔 지역이 스트레스로 느껴질 수 있습니다. 가장 큰 역이나 유명한 역이 항상 가장 쉬운 숙소 base는 아닙니다.",
    quickTitle: "빠른 답변", quickBody: "짐이 많다면 공항 접근, 엘리베이터, 역 복잡도, 도보 거리, 신칸센 계획을 기준으로 도쿄 호텔 지역을 고르세요. 유명 역은 편리할 수 있지만, 더 차분한 근처 지역이나 단순한 경로가 첫날 밤에는 더 쉬울 수 있습니다.",
    factorsTitle: "짐이 있을 때 가장 중요한 것",
    factors: [["공항 도착", "나리타와 하네다는 도쿄의 다른 지역으로 이어질 수 있습니다. 특히 늦게 도착한다면 첫 호텔 지역은 도착 경로와 맞아야 합니다."], ["역 복잡도", "큰 역은 편리하지만 캐리어가 있으면 피곤합니다. 예약 전 출구, 엘리베이터, 도보 거리를 확인하세요."], ["신칸센 계획", "이른 신칸센으로 교토나 오사카에 간다면 도쿄 숙소 위치가 아침 스트레스에 영향을 줍니다."], ["객실 크기", "작은 가방 하나에는 괜찮은 방도 큰 캐리어 두 개에는 답답할 수 있습니다. ㎡와 침대 구성을 확인하세요."], ["조용한 밤", "유흥가는 방문하기 재미있지만 잠자는 base로 항상 좋지는 않습니다."]],
    luggageOptionEyebrow: "짐 옵션", luggageOptionTitle: "옵션: 공항에서 호텔로 짐 보내기",
    luggageOptionBody: "공항 수하물 배송은 큰 캐리어를 들고 도쿄를 이동하는 부담을 줄일 수 있습니다. Yamato / Hands-Free Travel 카운터와 JAL ABC 공항 카운터는 가능한 곳에서 배송 또는 보관을 지원할 수 있습니다. 보장된 서비스가 아니라 공항에서 확인할 옵션으로 보세요. 지역, 마감 시간, 카운터 운영, 배송 시간은 달라집니다.",
    deliveryCards: [["공항 → 호텔 배송", "Yamato Airport TA-Q-BIN 카운터에서 공항 출발 배송이 가능할 수 있고, JAL ABC는 도착 카운터의 호텔 배송 서비스를 안내합니다. 당일 배송은 제한적으로 가능할 수 있으니 카운터, 지역, 마감 시간을 확인하세요."], ["호텔 → 공항 배송", "일부 서비스는 출국 전 호텔에서 공항으로 짐을 보낼 수도 있습니다. 사전 시간이 필요할 수 있으므로 호텔 프런트나 카운터에서 마감 시간을 확인하세요."], ["체크인 전 짐 보관", "일부 Yamato 카운터는 역, 공항, 상업 시설에서 짐 보관을 지원할 수 있습니다. 이용 가능 여부, 영업시간, 수령 시간은 카운터마다 다릅니다."]],
    checklistTitle: "배송 전 확인할 것", checklist: ["호텔 이름, 주소, 예약자 이름을 확인하세요.", "체크인 전 호텔 프런트가 짐 배송을 받을 수 있는지 물어보세요.", "공항 카운터, 배송 가능 지역, 마감 시간, 예상 배송 시간을 확인하세요.", "JAL ABC Hotel Baggage Delivery는 14:00 호텔 배송 마감이 해당 공항/서비스에 적용되는지 확인하세요.", "Yamato 당일 배송은 해당 카운터가 목적지까지 서비스를 제공하는지 확인하세요."],
    dayBagTitle: "작은 당일 가방을 준비하세요", dayBagBody: "여권, 약, 충전기, 귀중품, 하룻밤 필수품은 직접 들고 다니세요. 체크인 전 도착하거나 가족/여러 캐리어와 이동할 때 수하물 배송이 특히 유용할 수 있습니다.",
    sourcesTitle: "확인할 공식 출처", airportTransferLink: "공항 이동 가이드", hotelBaseLink: "도쿄 호텔 base 가이드", hotelExamplesLink: "로컬 호텔 예시",
    areaLogicTitle: "짐이 있을 때 주요 지역 판단", labels: { bestFor: "좋은 점", watchOut: "주의", goodIf: "이럴 때 좋음", notIdealIf: "이럴 때 비추천" },
    areas: [{ title: "Shinjuku", bestFor: "교통 선택지와 밤 문화.", watchOut: "큰 역 규모와 활기찬 유흥가는 짐이 있으면 피곤할 수 있습니다.", goodIf: "최대 경로 선택지를 원하고 붐비는 base도 괜찮다면.", notIdealIf: "가장 조용한 첫날 밤이나 큰 역 이동을 피하고 싶다면." }, { title: "Ueno / Asakusa", bestFor: "나리타 접근과 차분한 도착 밤.", watchOut: "일부 경로는 지하철 환승 의존도가 높습니다.", goodIf: "나리타 접근, 옛 도쿄 분위기, 덜 복잡한 base를 원한다면.", notIdealIf: "가장 쉬운 신칸센 아침 동선이 필요하다면." }, { title: "Tokyo Station", bestFor: "이른 신칸센과 깔끔한 물류.", watchOut: "밤에는 비즈니스 지구 느낌이고 지역감이 약할 수 있습니다.", goodIf: "교토나 오사카 이동 전 짐 스트레스를 줄이고 싶다면.", notIdealIf: "밤 문화나 동네 분위기를 원한다면." }, { title: "East Tokyo", bestFor: "차분한 동네와 재방문자.", watchOut: "첫 도쿄 숙소의 기본 선택지는 아닐 수 있습니다.", goodIf: "조용한 거리, 카페, 강변, 로컬 분위기를 중시한다면.", notIdealIf: "첫날 가장 단순한 도착 경로가 필요하다면." }],
    famousTitle: "유명한 역 이름만 보고 고르지 마세요", famousBody: "유명한 역이 항상 잠자기 쉬운 곳은 아닙니다. 짐이 있다면 더 단순한 도보 경로, 명확한 출구, 엘리베이터, 그룹에 맞는 객실이 있는 지역이 더 쉬울 수 있습니다.",
    nextTitle: "다음 단계: 도쿄 호텔 지역 비교", nextBody: "호텔을 비교하기 전에 이 짐 동선 논리를 도쿄 숙소 지역 가이드와 함께 사용하세요. 적절한 base는 공항 접근, 도보 거리, 역 복잡도, 객실 크기, 신칸센 계획에 따라 달라집니다.",
    stayGuideLink: "도쿄 숙소 지역 가이드 열기", finderCtaLabel: "짐·공항·신칸센 접근성으로 지역 비교", continueTitle: "계속 계획하기", continueLinks: [["/areas-to-stay/tokyo-first-time", "도쿄 숙소 지역 가이드"], ["/areas-to-stay/tokyo-hotel-room-size-guide", "객실 크기 가이드"], ["/airport-transfers", "공항 이동"], ["/local-hotel-picks", "로컬 호텔 예시"], ["/guide", "신칸센 Seat E 가이드"]],
  },
  "zh-TW": {
    metadataTitle: "帶行李時東京住哪裡：機場、車站與飯店區域提示",
    metadataDescription: "帶大型行李箱遊東京時，機場交通、車站規模、電梯、新幹線計畫與房間大小都會影響住宿區域選擇。",
    breadcrumbHome: "首頁", breadcrumbStay: "住宿區域", breadcrumbTokyo: "東京", breadcrumbCurrent: "帶行李的東京",
    eyebrow: "東京行李動線規劃", title: "帶行李時東京住哪裡",
    intro: "東京交通方便，但大型行李箱會讓錯誤的飯店區域變得很累。最佳住宿基地不一定是最大或最有名的車站。",
    quickTitle: "快速答案", quickBody: "如果有大型行李，請用機場交通、電梯、車站複雜度、步行距離和新幹線計畫來選東京飯店區域。有名車站可能方便，但第一晚更安靜的附近區域或更簡單的路線可能更輕鬆。",
    factorsTitle: "帶行李時最重要的事",
    factors: [["機場抵達", "成田和羽田可能適合東京不同區域。尤其晚到時，第一晚飯店區域應配合抵達路線。"], ["車站複雜度", "大車站方便，但拖行李會累。預訂前確認出口、電梯與步行距離。"], ["新幹線計畫", "若要搭早班新幹線去京都或大阪，東京住宿位置會影響早晨壓力。"], ["房間大小", "一個小包可接受的房間，遇到兩個大行李箱可能很擠。確認㎡和床型。"], ["安靜夜晚", "夜生活區適合去玩，但不一定適合睡覺。"]],
    luggageOptionEyebrow: "行李選項", luggageOptionTitle: "選項：從機場把行李送到飯店",
    luggageOptionBody: "機場行李配送可減少拖大型行李穿越東京的壓力。Yamato / Hands-Free Travel 櫃檯與 JAL ABC 機場櫃檯在可用處可能支援配送或寄放。請把它視為到機場確認的選項，而非保證服務；區域、截止時間、櫃檯時間和配送時段會依機場與服務不同。",
    deliveryCards: [["機場 → 飯店配送", "Yamato Airport TA-Q-BIN 櫃檯可能可從機場寄送行李，JAL ABC 也列有到飯店的服務。當日配送可能只在有限情況可用，請先確認櫃檯、區域和截止時間。"], ["飯店 → 機場配送", "部分服務也可在離境前將行李送回機場。可能需要提前安排，請向飯店櫃檯或配送櫃檯確認截止時間。"], ["入住前寄放行李", "部分 Yamato 櫃檯可在車站、機場或商業設施寄放行李。可用性、營業時間和取件時間依櫃檯不同。"]],
    checklistTitle: "使用配送前確認", checklist: ["確認飯店名稱、地址和預約姓名。", "詢問飯店櫃檯是否可在入住前接收行李。", "確認機場櫃檯、配送區域、截止時間和預計送達時段。", "JAL ABC Hotel Baggage Delivery 請確認14:00飯店配送截止是否適用。", "Yamato 當日配送請確認該櫃檯是否支援你的目的地。"],
    dayBagTitle: "準備小隨身包", dayBagBody: "護照、藥品、充電器、貴重物品和過夜必需品請隨身攜帶。若入住前抵達、家庭旅行或多個行李箱，行李配送尤其有幫助。",
    sourcesTitle: "可確認的官方來源", airportTransferLink: "機場交通指南", hotelBaseLink: "東京飯店基地指南", hotelExamplesLink: "在地飯店例子",
    areaLogicTitle: "帶行李時主要區域邏輯", labels: { bestFor: "適合", watchOut: "注意", goodIf: "如果你想要", notIdealIf: "不適合如果" },
    areas: [{ title: "Shinjuku", bestFor: "交通選擇和夜生活。", watchOut: "巨大車站和熱鬧街區拖行李會累。", goodIf: "想要最多路線選擇且不介意熱鬧基地。", notIdealIf: "想要最安靜的第一晚或不喜歡大型車站。"}, { title: "Ueno / Asakusa", bestFor: "成田交通和較安靜抵達夜晚。", watchOut: "部分路線較依賴地下鐵轉乘。", goodIf: "想要實用成田交通、老東京氣氛或較不緊張的基地。", notIdealIf: "需要最簡單的新幹線早晨。"}, { title: "Tokyo Station", bestFor: "早班新幹線和清楚物流。", watchOut: "夜晚較商務、在地感較弱。", goodIf: "想在去京都或大阪前降低行李壓力。", notIdealIf: "想要夜生活或街區感。"}, { title: "East Tokyo", bestFor: "安靜街區和重遊旅客。", watchOut: "不一定是首次東京的預設基地。", goodIf: "重視安靜街道、咖啡、河邊和在地感。", notIdealIf: "第一晚需要最簡單抵達路線。"}],
    famousTitle: "不要只看有名車站名稱", famousBody: "有名車站不一定是最容易睡覺的地方。帶行李時，步行路線較簡單、出口清楚、有電梯、房間大小合適的區域可能更好。",
    nextTitle: "下一步：比較東京飯店區域", nextBody: "比較飯店前，請把這套行李邏輯和東京住宿區域指南一起使用。適合的基地取決於機場交通、步行距離、車站複雜度、房間大小和新幹線計畫。",
    stayGuideLink: "打開東京住宿區域指南", finderCtaLabel: "依行李、機場與新幹線便利度比較區域", continueTitle: "繼續規劃", continueLinks: [["/areas-to-stay/tokyo-first-time", "東京住宿區域指南"], ["/areas-to-stay/tokyo-hotel-room-size-guide", "房間大小指南"], ["/airport-transfers", "機場交通"], ["/local-hotel-picks", "在地飯店例子"], ["/guide", "新幹線 Seat E 指南"]],
  },
  "zh-CN": {
    metadataTitle: "带行李时东京住哪里：机场、车站和酒店区域提示",
    metadataDescription: "带大行李箱游东京时，机场交通、车站规模、电梯、新干线计划和房间大小都会影响住宿区域选择。",
    breadcrumbHome: "首页", breadcrumbStay: "住宿区域", breadcrumbTokyo: "东京", breadcrumbCurrent: "带行李的东京",
    eyebrow: "东京行李动线规划", title: "带行李时东京住哪里",
    intro: "东京交通方便，但大行李箱会让错误的酒店区域变得很累。最佳住宿基地不一定是最大或最有名的车站。",
    quickTitle: "快速答案", quickBody: "如果有大行李，请按机场交通、电梯、车站复杂度、步行距离和新干线计划来选择东京酒店区域。知名车站可能方便，但第一晚更安静的附近区域或更简单的路线可能更轻松。",
    factorsTitle: "带行李时最重要的事",
    factors: [["机场抵达", "成田和羽田可能适合东京不同区域。尤其晚到时，第一晚酒店区域应配合抵达路线。"], ["车站复杂度", "大车站方便，但拖行李会累。预订前确认出口、电梯和步行距离。"], ["新干线计划", "如果要搭早班新干线去京都或大阪，东京住宿位置会影响早晨压力。"], ["房间大小", "一个小包可接受的房间，遇到两个大行李箱可能很挤。确认㎡和床型。"], ["安静夜晚", "夜生活区适合游玩，但不一定适合睡觉。"]],
    luggageOptionEyebrow: "行李选项", luggageOptionTitle: "选项：从机场把行李送到酒店",
    luggageOptionBody: "机场行李配送可减少拖大行李穿越东京的压力。Yamato / Hands-Free Travel 柜台和 JAL ABC 机场柜台在可用处可能支持配送或寄存。请把它视为到机场确认的选项，而非保证服务；覆盖区域、截止时间、柜台时间和配送时段会因机场与服务而不同。",
    deliveryCards: [["机场 → 酒店配送", "Yamato Airport TA-Q-BIN 柜台可能可从机场寄送行李，JAL ABC 也列有到酒店的服务。当日配送可能只在有限情况可用，请先确认柜台、区域和截止时间。"], ["酒店 → 机场配送", "部分服务也可在离境前将行李送回机场。可能需要提前安排，请向酒店前台或配送柜台确认截止时间。"], ["入住前寄存行李", "部分 Yamato 柜台可在车站、机场或商业设施寄存行李。可用性、营业时间和取件时间因柜台而异。"]],
    checklistTitle: "使用配送前确认", checklist: ["确认酒店名称、地址和预约姓名。", "询问酒店前台是否可在入住前接收行李。", "确认机场柜台、配送区域、截止时间和预计送达时段。", "JAL ABC Hotel Baggage Delivery 请确认14:00酒店配送截止是否适用。", "Yamato 当日配送请确认该柜台是否支持你的目的地。"],
    dayBagTitle: "准备小随身包", dayBagBody: "护照、药品、充电器、贵重物品和过夜必需品请随身携带。如果入住前抵达、家庭旅行或有多个行李箱，行李配送尤其有帮助。",
    sourcesTitle: "可确认的官方来源", airportTransferLink: "机场交通指南", hotelBaseLink: "东京酒店基地指南", hotelExamplesLink: "本地酒店示例",
    areaLogicTitle: "带行李时主要区域逻辑", labels: { bestFor: "适合", watchOut: "注意", goodIf: "如果你想要", notIdealIf: "不适合如果" },
    areas: [{ title: "Shinjuku", bestFor: "交通选择和夜生活。", watchOut: "巨大车站和热闹街区拖行李会累。", goodIf: "想要最多路线选择且不介意热闹基地。", notIdealIf: "想要最安静的第一晚或不喜欢大型车站。" }, { title: "Ueno / Asakusa", bestFor: "成田交通和较安静抵达夜晚。", watchOut: "部分路线较依赖地铁换乘。", goodIf: "想要实用成田交通、老东京氛围或较不紧张的基地。", notIdealIf: "需要最简单的新干线早晨。" }, { title: "Tokyo Station", bestFor: "早班新干线和清楚物流。", watchOut: "夜晚较商务、在地感较弱。", goodIf: "想在去京都或大阪前降低行李压力。", notIdealIf: "想要夜生活或街区感。" }, { title: "East Tokyo", bestFor: "安静街区和重游旅客。", watchOut: "不一定是首次东京的默认基地。", goodIf: "重视安静街道、咖啡、河边和在地感。", notIdealIf: "第一晚需要最简单抵达路线。" }],
    famousTitle: "不要只看有名车站名称", famousBody: "有名车站不一定是最容易睡觉的地方。带行李时，步行路线较简单、出口清楚、有电梯、房间大小合适的区域可能更好。",
    nextTitle: "下一步：比较东京酒店区域", nextBody: "比较酒店前，请把这套行李逻辑和东京住宿区域指南一起使用。合适的基地取决于机场交通、步行距离、车站复杂度、房间大小和新干线计划。",
    stayGuideLink: "打开东京住宿区域指南", finderCtaLabel: "按行李、机场与新干线便利度比较区域", continueTitle: "继续规划", continueLinks: [["/areas-to-stay/tokyo-first-time", "东京住宿区域指南"], ["/areas-to-stay/tokyo-hotel-room-size-guide", "房间大小指南"], ["/airport-transfers", "机场交通"], ["/local-hotel-picks", "本地酒店示例"], ["/guide", "新干线 Seat E 指南"]],
  },
  fr: {
    metadataTitle: "Où loger à Tokyo avec des bagages : aéroport, gares et quartiers",
    metadataDescription: "Avec de grosses valises à Tokyo, l'aéroport, la taille des gares, les ascenseurs, le Shinkansen et la chambre changent le choix du quartier.",
    breadcrumbHome: "Accueil", breadcrumbStay: "Où loger", breadcrumbTokyo: "Tokyo", breadcrumbCurrent: "Tokyo avec bagages",
    eyebrow: "Planifier Tokyo avec bagages", title: "Où loger à Tokyo avec des bagages",
    intro: "Tokyo est facile à parcourir, mais de grosses valises peuvent rendre un mauvais quartier d'hôtel stressant. La meilleure base n'est pas toujours la plus grande ou la plus célèbre gare.",
    quickTitle: "Réponse rapide", quickBody: "Avec de gros bagages, choisissez votre quartier selon l'accès aéroport, les ascenseurs, la complexité de la gare, la marche à pied et vos plans Shinkansen. Une gare célèbre peut être pratique, mais un quartier voisin plus calme ou un trajet plus simple peut être meilleur la première nuit.",
    factorsTitle: "Ce qui compte le plus avec des bagages",
    factors: [["Arrivée aéroport", "Narita et Haneda orientent vers des zones différentes de Tokyo. Le premier quartier d'hôtel doit correspondre à votre arrivée, surtout si vous arrivez tard."], ["Complexité des gares", "Les grandes gares sont pratiques mais fatigantes avec des valises. Vérifiez sorties, ascenseurs et distance à pied."], ["Plans Shinkansen", "Un Shinkansen tôt vers Kyoto ou Osaka rend votre base à Tokyo aussi importante que votre siège."], ["Taille de chambre", "Une chambre suffisante pour un petit sac peut être serrée avec deux grosses valises. Vérifiez les mètres carrés et les lits."], ["Nuits calmes", "Les quartiers animés sont agréables à visiter, mais pas toujours idéaux pour dormir."]],
    luggageOptionEyebrow: "Option bagages", luggageOptionTitle: "Option : envoyer vos bagages de l'aéroport à l'hôtel",
    luggageOptionBody: "La livraison de bagages depuis l'aéroport peut réduire le stress de traverser Tokyo avec de grosses valises. Les comptoirs Yamato / Hands-Free Travel et JAL ABC peuvent proposer livraison ou stockage là où c'est disponible. Vérifiez sur place : couverture, horaires limites et fenêtres de livraison varient.",
    deliveryCards: [["Aéroport → hôtel", "Les comptoirs Yamato Airport TA-Q-BIN peuvent permettre l'envoi depuis l'aéroport, et JAL ABC liste des services vers les hôtels. La livraison le jour même peut être limitée ; vérifiez comptoir, zone et délai."], ["Hôtel → aéroport", "Certains services permettent aussi d'envoyer les bagages à l'aéroport avant le départ. Confirmez le délai avec l'hôtel ou le comptoir."], ["Stocker les bagages avant le check-in", "Certains comptoirs Yamato stockent les bagages dans des gares, aéroports ou zones commerciales. Disponibilité, horaires et retrait varient."]],
    checklistTitle: "Avant d'utiliser la livraison", checklist: ["Confirmez nom, adresse et nom de réservation de l'hôtel.", "Demandez si la réception accepte les bagages avant le check-in.", "Vérifiez comptoir, zone couverte, heure limite et fenêtre de livraison.", "Pour JAL ABC Hotel Baggage Delivery, vérifiez si la limite de 14:00 s'applique.", "Pour Yamato le jour même, vérifiez si le comptoir dessert votre destination."],
    dayBagTitle: "Gardez un petit sac", dayBagBody: "Gardez passeports, médicaments, chargeurs, objets de valeur et essentiels pour la nuit. La livraison est utile avant le check-in, en famille ou avec plusieurs valises.",
    sourcesTitle: "Sources officielles à vérifier", airportTransferLink: "Guide transfert aéroport", hotelBaseLink: "Guide base hôtel à Tokyo", hotelExamplesLink: "Exemples d'hôtels locaux",
    areaLogicTitle: "Logique des grands quartiers avec bagages", labels: { bestFor: "Idéal pour", watchOut: "Attention", goodIf: "Bien si", notIdealIf: "Moins idéal si" },
    areas: [{ title: "Shinjuku", bestFor: "Choix de transport et vie nocturne.", watchOut: "La taille de la gare et les blocs animés fatiguent avec des valises.", goodIf: "Vous voulez le plus de choix et acceptez une base animée.", notIdealIf: "Vous voulez la première nuit la plus calme." }, { title: "Ueno / Asakusa", bestFor: "Accès Narita et nuits plus calmes.", watchOut: "Certains trajets reposent davantage sur le métro.", goodIf: "Vous voulez Narita pratique, atmosphère ancienne ou base moins intense.", notIdealIf: "Vous voulez le matin Shinkansen le plus simple." }, { title: "Tokyo Station", bestFor: "Shinkansen tôt et logistique claire.", watchOut: "Peut sembler business et moins local le soir.", goodIf: "Vous voulez réduire le stress bagages avant Kyoto ou Osaka.", notIdealIf: "Vous voulez vie nocturne ou ambiance de quartier." }, { title: "East Tokyo", bestFor: "Quartiers calmes et voyageurs qui reviennent.", watchOut: "Pas toujours la base par défaut d'un premier séjour.", goodIf: "Vous aimez rues calmes, cafés, rivières et ambiance locale.", notIdealIf: "Vous avez besoin de l'arrivée la plus simple." }],
    famousTitle: "Ne choisissez pas seulement un nom de gare célèbre", famousBody: "Une gare célèbre n'est pas toujours l'endroit le plus facile pour dormir. Avec des bagages, un trajet à pied simple, des sorties claires, des ascenseurs et une bonne taille de chambre comptent davantage.",
    nextTitle: "Étape suivante : comparer les quartiers hôteliers de Tokyo", nextBody: "Utilisez cette logique bagages avec le guide des quartiers de Tokyo avant de comparer les hôtels. La bonne base dépend de l'aéroport, de la marche, de la gare, de la chambre et du Shinkansen.",
    stayGuideLink: "Ouvrir le guide des quartiers de Tokyo", finderCtaLabel: "Comparez les quartiers selon les bagages, l'aéroport et l'accès au Shinkansen", continueTitle: "Continuer la planification", continueLinks: [["/areas-to-stay/tokyo-first-time", "Guide des quartiers de Tokyo"], ["/areas-to-stay/tokyo-hotel-room-size-guide", "Guide taille de chambre"], ["/airport-transfers", "Transferts aéroport"], ["/local-hotel-picks", "Exemples d'hôtels"], ["/guide", "Guide Seat E Shinkansen"]],
  },
  de: {
    metadataTitle: "Wo in Tokyo mit Gepäck übernachten: Flughafen, Bahnhöfe und Hotelgegenden",
    metadataDescription: "Mit großen Koffern in Tokyo beeinflussen Flughafen, Bahnhofskomplexität, Aufzüge, Shinkansen-Pläne und Zimmergröße die Wahl der Unterkunft.",
    breadcrumbHome: "Start", breadcrumbStay: "Unterkunft", breadcrumbTokyo: "Tokyo", breadcrumbCurrent: "Tokyo mit Gepäck",
    eyebrow: "Tokyo Gepäckplanung", title: "Wo in Tokyo mit Gepäck übernachten",
    intro: "Tokyo ist leicht zu bereisen, aber große Koffer können die falsche Hotelgegend stressig machen. Die beste Basis ist nicht immer der größte oder bekannteste Bahnhof.",
    quickTitle: "Kurzantwort", quickBody: "Mit viel Gepäck solltest du die Hotelgegend nach Flughafenzugang, Aufzügen, Bahnhofskomplexität, Fußweg und Shinkansen-Plänen wählen. Ein berühmter Bahnhof kann praktisch sein, aber eine ruhigere nahe Gegend oder einfachere Route kann für die erste Nacht leichter sein.",
    factorsTitle: "Was mit Gepäck am wichtigsten ist",
    factors: [["Flughafenankunft", "Narita und Haneda führen zu unterschiedlichen Teilen Tokyos. Die erste Hotelgegend sollte zur Ankunftsroute passen, besonders bei später Ankunft."], ["Bahnhofskomplexität", "Große Bahnhöfe sind praktisch, aber mit Koffern ermüdend. Prüfe Ausgänge, Aufzüge und Fußweg vor der Buchung."], ["Shinkansen-Pläne", "Bei einem frühen Shinkansen nach Kyoto oder Osaka beeinflusst deine Tokyo-Basis den Morgenstress."], ["Zimmergröße", "Ein Zimmer für eine kleine Tasche kann mit zwei großen Koffern eng werden. Prüfe Quadratmeter und Betten."], ["Ruhige Nächte", "Ausgehviertel sind toll zum Besuchen, aber nicht immer ideal zum Schlafen."]],
    luggageOptionEyebrow: "Gepäckoption", luggageOptionTitle: "Option: Gepäck vom Flughafen zum Hotel senden",
    luggageOptionBody: "Gepäcklieferung vom Flughafen kann den Stress großer Koffer in Tokyo reduzieren. Yamato / Hands-Free Travel Schalter und JAL ABC Flughafenschalter können Lieferung oder Aufbewahrung anbieten, wo verfügbar. Prüfe es vor Ort: Zielgebiete, Annahmeschluss, Öffnungszeiten und Lieferfenster variieren.",
    deliveryCards: [["Flughafen → Hotel", "Yamato Airport TA-Q-BIN Schalter können Versand vom Flughafen ermöglichen; JAL ABC listet Hotel-Lieferdienste ab Ankunftsschaltern. Lieferung am selben Tag kann begrenzt verfügbar sein; prüfe Schalter, Gebiet und Frist."], ["Hotel → Flughafen", "Einige Dienste senden Gepäck auch vor der Abreise zurück zum Flughafen. Das kann Vorlauf brauchen. Bestätige Fristen mit Hotel oder Schalter."], ["Gepäck vor Check-in lagern", "Einige Yamato-Schalter lagern Gepäck an Bahnhöfen, Flughäfen oder Einkaufsbereichen. Verfügbarkeit, Öffnungszeiten und Abholung variieren."]],
    checklistTitle: "Vor der Nutzung prüfen", checklist: ["Hotelname, Adresse und Reservierungsname bestätigen.", "Fragen, ob die Rezeption Gepäck vor Check-in annimmt.", "Schalter, Zielgebiet, Annahmeschluss und Lieferfenster prüfen.", "Bei JAL ABC Hotel Baggage Delivery prüfen, ob 14:00 als Frist gilt.", "Bei Yamato Same-day Delivery prüfen, ob der Schalter dein Ziel bedient."],
    dayBagTitle: "Kleine Tagestasche behalten", dayBagBody: "Pässe, Medikamente, Ladegeräte, Wertsachen und Übernachtungsbedarf selbst mitnehmen. Gepäcklieferung hilft besonders vor Check-in, mit Familie oder mehreren Koffern.",
    sourcesTitle: "Offizielle Quellen prüfen", airportTransferLink: "Flughafentransfer-Guide", hotelBaseLink: "Tokyo Hotelbasis-Guide", hotelExamplesLink: "Lokale Hotelbeispiele",
    areaLogicTitle: "Logik der Hauptgebiete mit Gepäck", labels: { bestFor: "Gut für", watchOut: "Achtung", goodIf: "Gut wenn", notIdealIf: "Weniger ideal wenn" },
    areas: [{ title: "Shinjuku", bestFor: "Verkehrsauswahl und Nachtleben.", watchOut: "Riesiger Bahnhof und lebhafte Blöcke ermüden mit Gepäck.", goodIf: "Du maximale Routenwahl willst und Trubel akzeptierst.", notIdealIf: "Du die ruhigste erste Nacht oder wenig Bahnhofskomplexität willst." }, { title: "Ueno / Asakusa", bestFor: "Narita-Zugang und ruhigere Ankunftsnächte.", watchOut: "Einige Routen hängen stärker von U-Bahn-Umstiegen ab.", goodIf: "Du praktischen Narita-Zugang, altes Tokyo oder weniger Intensität willst.", notIdealIf: "Du den einfachsten Shinkansen-Morgen brauchst." }, { title: "Tokyo Station", bestFor: "Früher Shinkansen und klare Logistik.", watchOut: "Kann geschäftlich wirken und abends weniger lokal.", goodIf: "Du Gepäckstress vor Kyoto oder Osaka reduzieren willst.", notIdealIf: "Du Nachtleben oder Nachbarschaftsgefühl willst." }, { title: "East Tokyo", bestFor: "Ruhigere Viertel und Wiederholungsbesucher.", watchOut: "Nicht immer die Standardbasis für Erstbesucher.", goodIf: "Du ruhige Straßen, Cafes, Flusswege und lokales Gefühl schätzt.", notIdealIf: "Du die einfachste erste Ankunft brauchst." }],
    famousTitle: "Nicht nur nach berühmten Bahnhofsnamen wählen", famousBody: "Ein berühmter Bahnhof ist nicht immer der einfachste Ort zum Schlafen. Mit Gepäck können einfache Fußwege, klare Ausgänge, Aufzüge und passende Zimmergröße wichtiger sein.",
    nextTitle: "Nächster Schritt: Hotelgebiete in Tokyo vergleichen", nextBody: "Nutze diese Gepäcklogik mit dem Tokyo-Unterkunftsguide, bevor du Hotels vergleichst. Die richtige Basis hängt von Flughafen, Fußweg, Bahnhof, Zimmergröße und Shinkansen-Plänen ab.",
    stayGuideLink: "Tokyo Unterkunfts-Guide öffnen", finderCtaLabel: "Gebiete nach Gepäck, Flughafen & Shinkansen-Anbindung vergleichen", continueTitle: "Weiter planen", continueLinks: [["/areas-to-stay/tokyo-first-time", "Tokyo Unterkunfts-Guide"], ["/areas-to-stay/tokyo-hotel-room-size-guide", "Zimmergrößen-Guide"], ["/airport-transfers", "Flughafentransfers"], ["/local-hotel-picks", "Hotelbeispiele"], ["/guide", "Shinkansen Seat E Guide"]],
  },
  ru: {
    metadataTitle: "Где остановиться в Токио с багажом: аэропорт, станции и районы",
    metadataDescription: "С большими чемоданами в Токио аэропорт, станции, лифты, Shinkansen и размер номера влияют на выбор района отеля.",
    breadcrumbHome: "Главная", breadcrumbStay: "Где остановиться", breadcrumbTokyo: "Токио", breadcrumbCurrent: "Токио с багажом",
    eyebrow: "Планирование багажа в Токио", title: "Где остановиться в Токио с багажом",
    intro: "По Токио легко перемещаться, но большие чемоданы могут сделать неправильный район отеля стрессовым. Лучшая база не всегда самая большая или известная станция.",
    quickTitle: "Короткий ответ", quickBody: "С большим багажом выбирайте район по доступу из аэропорта, лифтам, сложности станции, расстоянию пешком и планам Shinkansen. Известная станция удобна, но более спокойный район рядом или простой маршрут могут быть легче в первую ночь.",
    factorsTitle: "Что важнее всего с багажом",
    factors: [["Прилет из аэропорта", "Narita и Haneda могут вести к разным частям Токио. Первый район отеля должен совпадать с маршрутом прибытия, особенно при позднем прилете."], ["Сложность станции", "Большие станции удобны, но утомляют с чемоданами. Проверьте выходы, лифты и путь пешком до бронирования."], ["Планы Shinkansen", "Если рано едете Shinkansen в Киото или Осаку, база в Токио влияет на утренний стресс."], ["Размер номера", "Номер для маленькой сумки может быть тесным с двумя большими чемоданами. Проверьте метры и кровати."], ["Тихие ночи", "Районы ночной жизни интересны для прогулок, но не всегда хороши для сна."]],
    luggageOptionEyebrow: "Опция багажа", luggageOptionTitle: "Опция: отправить багаж из аэропорта в отель",
    luggageOptionBody: "Доставка багажа из аэропорта может снизить стресс от поездки по Токио с большими чемоданами. Стойки Yamato / Hands-Free Travel и JAL ABC могут предлагать доставку или хранение там, где услуга доступна. Это не гарантия: зона, дедлайн, часы стойки и время доставки зависят от аэропорта и сервиса.",
    deliveryCards: [["Аэропорт → отель", "Стойки Yamato Airport TA-Q-BIN могут позволять отправку из аэропорта, а JAL ABC указывает услуги доставки в отели. Доставка в тот же день возможна ограниченно; проверьте стойку, зону и срок."], ["Отель → аэропорт", "Некоторые сервисы также отправляют багаж в аэропорт перед вылетом. Может потребоваться запас времени. Уточните срок в отеле или на стойке."], ["Хранение до check-in", "Некоторые стойки Yamato хранят багаж на станциях, в аэропортах или торговых зонах. Доступность, часы и получение зависят от стойки."]],
    checklistTitle: "Перед использованием доставки", checklist: ["Подтвердите название отеля, адрес и имя бронирования.", "Уточните, принимает ли ресепшен багаж до check-in.", "Проверьте стойку, зону доставки, дедлайн и ожидаемое окно доставки.", "Для JAL ABC Hotel Baggage Delivery проверьте, применяется ли дедлайн 14:00.", "Для Yamato same-day delivery проверьте, обслуживает ли стойка ваш пункт назначения."],
    dayBagTitle: "Возьмите маленькую сумку", dayBagBody: "Паспорта, лекарства, зарядки, ценности и вещи на ночь держите при себе. Доставка багажа особенно полезна до check-in, с семьей или несколькими чемоданами.",
    sourcesTitle: "Официальные источники", airportTransferLink: "Гид по трансферу из аэропорта", hotelBaseLink: "Гид по базе отеля в Токио", hotelExamplesLink: "Примеры местных отелей",
    areaLogicTitle: "Логика основных районов с багажом", labels: { bestFor: "Лучше для", watchOut: "Учтите", goodIf: "Подходит если", notIdealIf: "Не идеально если" },
    areas: [{ title: "Shinjuku", bestFor: "Выбор транспорта и ночная жизнь.", watchOut: "Огромная станция и оживленные кварталы утомляют с багажом.", goodIf: "Нужен максимум маршрутов и не пугает шумная база.", notIdealIf: "Нужна самая спокойная первая ночь или вы не любите большие станции." }, { title: "Ueno / Asakusa", bestFor: "Доступ к Narita и более спокойный вечер прибытия.", watchOut: "Некоторые маршруты сильнее зависят от метро.", goodIf: "Нужен практичный Narita, старый Токио или менее напряженная база.", notIdealIf: "Нужно самое простое утро Shinkansen." }, { title: "Tokyo Station", bestFor: "Ранний Shinkansen и простая логистика.", watchOut: "Может быть деловой и менее локальной вечером.", goodIf: "Хотите снизить стресс с багажом перед Киото или Осакой.", notIdealIf: "Нужна ночная жизнь или атмосфера района." }, { title: "East Tokyo", bestFor: "Спокойные районы и повторные поездки.", watchOut: "Не всегда стандартная база для первой поездки.", goodIf: "Важны тихие улицы, кафе, река и локальная атмосфера.", notIdealIf: "Нужен самый простой приезд в первую ночь." }],
    famousTitle: "Не выбирайте только по известному названию станции", famousBody: "Известная станция не всегда самое простое место для сна. С багажом важнее простой пеший маршрут, понятные выходы, лифты и подходящий размер номера.",
    nextTitle: "Следующий шаг: сравнить районы отелей Токио", nextBody: "Используйте эту логику багажа вместе с гидом по районам Токио перед сравнением отелей. Правильная база зависит от аэропорта, пешего пути, станции, размера номера и планов Shinkansen.",
    stayGuideLink: "Открыть гид по районам Токио", finderCtaLabel: "Сравнить районы по багажу, аэропорту и доступу к Синкансэну", continueTitle: "Продолжить планирование", continueLinks: [["/areas-to-stay/tokyo-first-time", "Гид по районам Токио"], ["/areas-to-stay/tokyo-hotel-room-size-guide", "Гид по размеру номера"], ["/airport-transfers", "Трансферы из аэропорта"], ["/local-hotel-picks", "Примеры отелей"], ["/guide", "Гид Shinkansen Seat E"]],
  },
};

function providerChoices(...providers: Array<ProviderChoiceButton | null | undefined>) {
  return providers.filter((provider): provider is ProviderChoiceButton => Boolean(provider));
}

function hotelProviderChoices(areaKey: HotelAreaKey, placement: ProviderChoiceButton["placement"]) {
  const hotel = getHotelLink(areaKey);
  const config = getTripHotelConfig(areaKey);
  const tripHref = hotel.provider === "trip" ? hotel.href : config.tripUrl;
  const tripTrackingHref = hotel.provider === "trip" ? hotel.trackingHref : config.tripUrl;

  return providerChoices(
    tripHref
      ? {
          label: "Trip.com",
          href: tripHref,
          trackingHref: tripTrackingHref,
          provider: "trip",
          product: "hotel",
          linkId: `hotelArea.${areaKey}.trip`,
          placement,
          variant: "primary",
          category: "hotel",
        }
      : null,
  );
}

const luggageHotelBaseAreas: LuggageHotelBaseArea[] = [
  {
    title: "Ueno",
    goodIf: "Narita access, museums, practical rail connections, and a less intense first night.",
    avoidIf: "You want the simplest possible early Shinkansen morning.",
    logic: "Useful with luggage because Narita access is strong and Tokyo Station is still reachable.",
    hotelKey: "ueno",
  },
  {
    title: "Asakusa",
    goodIf: "Old Tokyo atmosphere, calmer nights, and an east-side base after arrival.",
    avoidIf: "You need JR-centered movement or dislike checking subway exits.",
    logic: "Good for a slower first night, but confirm subway routing, elevators, and walking distance.",
    hotelKey: "asakusa",
  },
  {
    title: "Tokyo Station / Ginza",
    goodIf: "Early Shinkansen, first/last Tokyo nights, and luggage-heavy rail days.",
    avoidIf: "You want nightlife or a softer neighborhood feel.",
    logic: "Practical for Kyoto or Osaka rail days. Check station side and hotel walking route carefully.",
    hotelKey: "tokyoStation",
  },
  {
    title: "Oshiage / East Tokyo",
    goodIf: "Narita-side access, Skytree / Asakusa plans, and calmer arrival nights.",
    avoidIf: "You want Shinjuku or Shibuya nightlife as your main evening focus.",
    logic: "A luggage-friendly east-side search area when your first-night route points away from giant hubs.",
    hotelKey: "oshiage",
  },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const copy = luggageCopyByLocale[locale] ?? luggageCopyByLocale.en;
  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates(pagePath, locale),
  };
}

export default async function WhereToStayInTokyoWithLuggagePage({ params }: Props) {
  const { locale } = await params;
  const copy = luggageCopyByLocale[locale] ?? luggageCopyByLocale.en;

  return (
    <main className="min-h-screen bg-[#f7f4ec]">
      <SiteHeader />
      <Container className="py-10 md:py-14">
        <Breadcrumb
          items={[
            { href: "/", label: copy.breadcrumbHome },
            { href: "/areas-to-stay", label: copy.breadcrumbStay },
            { href: "/areas-to-stay/tokyo-first-time", label: copy.breadcrumbTokyo },
            { label: copy.breadcrumbCurrent },
          ]}
        />

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#106b43]">{copy.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
            {copy.intro}
          </p>
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
            <h2 className="text-xl font-semibold text-slate-950">{copy.quickTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {copy.quickBody}
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-slate-950">{copy.factorsTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {copy.factors.map(([title, body]) => (
              <article key={title} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                <Luggage className="h-5 w-5 text-[#106b43]" aria-hidden="true" />
                <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <FujiseatAreaLogic
          sourcePage={pagePath}
          placement="luggage_page_area_logic"
          locale={locale}
          className="mt-10"
        />

        <section className="mt-10 rounded-[24px] border border-sky-100 bg-sky-50/70 p-6 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">{copy.luggageOptionEyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{copy.luggageOptionTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {copy.luggageOptionBody}
            </p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {copy.deliveryCards.map(([title, body]) => (
              <article key={title} className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
                <h3 className="font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
              <h3 className="font-semibold text-slate-950">{copy.checklistTitle}</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                {copy.checklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
              <h3 className="font-semibold text-slate-950">{copy.dayBagTitle}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {copy.dayBagBody}
              </p>
            </article>
          </div>
          <div className="mt-5 rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-slate-950">{copy.sourcesTitle}</h3>
            <div className="mt-3 grid gap-2 text-sm leading-6 md:grid-cols-2">
              <a className="font-semibold text-sky-700 underline underline-offset-4" href="https://www.global-yamato.com/en/hands-free-travel/" target="_blank" rel="noopener noreferrer">
                Yamato Hands-Free Travel
              </a>
              <a className="font-semibold text-sky-700 underline underline-offset-4" href="https://faq-en.kuronekoyamato.co.jp/app/answers/detail/a_id/4021/~/please-tell-me-the-procedure-of-using-airport-ta-q-bin" target="_blank" rel="noopener noreferrer">
                Yamato Airport TA-Q-BIN FAQ
              </a>
              <a className="font-semibold text-sky-700 underline underline-offset-4" href="https://www.jalabc.com/en/hands-freetravel.html" target="_blank" rel="noopener noreferrer">
                JAL ABC Airport Baggage Delivery
              </a>
              <a className="font-semibold text-sky-700 underline underline-offset-4" href="https://www.jalabc.com/en/hands-freetravel/hotel-baggage-delivery.html" target="_blank" rel="noopener noreferrer">
                JAL ABC Hotel Baggage Delivery
              </a>
              <a className="font-semibold text-sky-700 underline underline-offset-4" href="https://www.jal.co.jp/uk/en/offers/same-day-delivery-service/" target="_blank" rel="noopener noreferrer">
                JAL Same-day Delivery
              </a>
            </div>
          </div>
          <AdSlot placement="luggage_guide_after_delivery" format="horizontal" />
          <div className="mt-5 flex flex-wrap gap-2">
            <TrackedInternalLink
              href="/airport-transfers"
              sourcePage={pagePath}
              placement="luggage_pack_cta"
              label="Airport transfer guide"
              locale={locale}
              className="inline-flex min-h-10 items-center rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-50"
            >
              {copy.airportTransferLink} →
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/areas-to-stay/tokyo-first-time#hotel-base-matrix"
              sourcePage={pagePath}
              placement="luggage_pack_cta"
              label="Tokyo hotel base guide"
              locale={locale}
              className="inline-flex min-h-10 items-center rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-[#106b43] transition-colors hover:bg-emerald-50"
            >
              {copy.hotelBaseLink} →
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/local-hotel-picks"
              sourcePage={pagePath}
              placement="luggage_pack_cta"
              label="Local hotel examples"
              locale={locale}
              className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              {copy.hotelExamplesLink} →
            </TrackedInternalLink>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-slate-950">{copy.areaLogicTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {copy.areas.map((area) => (
              <article key={area.title} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-950">{area.title}</h3>
                <dl className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
                  <div>
                    <dt className="font-semibold text-slate-900">{copy.labels.bestFor}</dt>
                    <dd>{area.bestFor}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">{copy.labels.watchOut}</dt>
                    <dd>{area.watchOut}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">{copy.labels.goodIf}</dt>
                    <dd>{area.goodIf}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">{copy.labels.notIdealIf}</dt>
                    <dd>{area.notIdealIf}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">Hotel base decision</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Best hotel base areas with luggage</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Compare broad station areas first, then open hotel booking sites. With large suitcases, check exact station distance, elevator access, room size, bed setup, and the walking route before booking.
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {luggageHotelBaseAreas.map((area) => {
              const choices = hotelProviderChoices(area.hotelKey, "luggage_page_area_cta");
              return (
                <article key={area.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <h3 className="text-lg font-semibold text-slate-950">{area.title}</h3>
                  <dl className="mt-3 grid gap-2 text-sm leading-6">
                    <div>
                      <dt className="font-semibold text-[#106b43]">Good if</dt>
                      <dd className="text-slate-700">{area.goodIf}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-amber-700">Who should avoid it</dt>
                      <dd className="text-slate-700">{area.avoidIf}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-900">Luggage / station logic</dt>
                      <dd className="text-slate-700">{area.logic}</dd>
                    </div>
                  </dl>
                  <ProviderChoiceCTA
                    actionLabel={`Compare hotels in ${area.title}`}
                    description="Broad area search only. Check exact station distance, room size, bed setup, and latest price on the provider site."
                    providers={choices}
                    pagePath={pagePath}
                    locale={locale}
                    area={area.title}
                    city="Tokyo"
                    className="mt-4"
                  />
                </article>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { href: "/areas-to-stay/tokyo-stay-area-index", label: "Open Tokyo Stay Finder" },
              { href: "/areas-to-stay/tokyo-first-time", label: "Tokyo first-time hotel base guide" },
              { href: "/airport-transfers", label: "Airport transfers by hotel area" },
              { href: "/local-hotel-picks#hotel-examples-matrix", label: "Local hotel examples" },
            ].map((link) => (
              <TrackedInternalLink
                key={link.href}
                href={link.href}
                sourcePage={pagePath}
                placement="luggage_page_area_cta"
                label={link.label}
                locale={locale}
                className="inline-flex min-h-9 items-center rounded-xl bg-slate-700 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
              >
                {link.label} →
              </TrackedInternalLink>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#106b43]" aria-hidden="true" />
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">{copy.famousTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {copy.famousBody}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[24px] border border-emerald-100 bg-emerald-50/70 p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">{copy.nextTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
            {copy.nextBody}
          </p>
          {/*
            The Finder is the tool that ranks the 36 areas by luggage-friendliness,
            station complexity, and airport/Shinkansen access — the exact factors
            this luggage guide describes. Lead with it, then keep the existing
            first-time guide link as the secondary option (nothing removed).
          */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <TrackedInternalLink
              href="/areas-to-stay/tokyo-stay-area-index"
              sourcePage={pagePath}
              placement="luggage_next_finder_cta"
              label="Compare areas by luggage in the Finder"
              locale={locale}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#2E7D5B] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#246449]"
            >
              {copy.finderCtaLabel} →
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/areas-to-stay/tokyo-first-time"
              sourcePage={pagePath}
              placement="luggage_pack_cta"
              label="Tokyo stay area guide"
              locale={locale}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#106b43] underline underline-offset-4"
            >
              {copy.stayGuideLink} →
            </TrackedInternalLink>
          </div>
        </section>

        <section className="mt-10 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">{copy.continueTitle}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            {copy.continueLinks.map(([href, label]) => (
              <TrackedInternalLink
                key={href}
                href={href}
                sourcePage={pagePath}
                placement="luggage_pack_cta"
                label={label}
                locale={locale}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-900 transition-colors hover:bg-white"
              >
                {label} →
              </TrackedInternalLink>
            ))}
          </div>
        </section>
      </Container>
      <SiteFooter />
    </main>
  );
}
