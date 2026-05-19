import type { TransferPage } from "@/lib/content/transfers";
import type { TripPick } from "@/lib/trip-picks";

type AirportLocale = "en" | "pt-BR" | "es" | "ko" | "zh-TW" | "zh-CN" | "fr" | "de" | "ru";

const supportedLocales: AirportLocale[] = ["en", "pt-BR", "es", "ko", "zh-TW", "zh-CN", "fr", "de", "ru"];

function normalizeLocale(locale?: string): AirportLocale {
  return supportedLocales.includes(locale as AirportLocale) ? (locale as AirportLocale) : "en";
}

type HubCopy = {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  breadcrumbHome: string;
  breadcrumbCurrent: string;
  heroLabel: string;
  heroTitle: string;
  heroBody: string;
  heroPrimary: string;
  heroSecondary: string;
  heroImageAlt: string;
  quickLabel: string;
  quickTitle: string;
  quickAnswers: Array<{ title: string; copy: string; label: string }>;
  chooseLabel: string;
  chooseTitle: string;
  airportCards: {
    narita: { title: string; body: string; imageAlt: string };
    haneda: { title: string; body: string; imageAlt: string };
    kansai: { title: string; body: string; imageAlt: string };
  };
  problemLabel: string;
  problemTitle: string;
  problems: Array<{ title: string; body: string; label: string }>;
  allRoutesLabel: string;
  allRoutesTitle: string;
  lateArrival: string;
  continueLabel: string;
  continueCards: Array<{ title: string; body: string }>;
};

type RouteUiCopy = {
  breadcrumb: string;
  recommended: string;
  luggageNote: string;
  lateArrival: string;
  quickAnswer: string;
  compareTitle: string;
  compareBody: string;
  fareDisclaimer: string;
  luggageLabel: string;
  luggageBody: string;
  lateQuestion: string;
  arrivalTitle: string;
  arrivalCta: string;
  nextCards: Array<{ title: string; body: string; label: string }>;
  badges: Record<"fastest" | "easiest" | "cheapest", string>;
  bestFor: {
    fastest: string;
    cheapest: string;
    luggageLate: string;
    luggage: string;
    default: string;
  };
  pros: string;
  cons: string;
  helperBoth: string;
  helperKlook: string;
  noBooking: string;
  noBookingIc: string;
  preBook: string;
  actionDefault: string;
  compareRouteTitle: string;
  compareRouteBody: string;
};

const hubCopies: Record<AirportLocale, HubCopy> = {
  en: {
    metaTitle: "Airport Transfers in Japan — Narita, Haneda and Kansai Airport | fujiseat",
    metaDescription: "Compare airport transfer options for Tokyo and Kansai, including Narita, Haneda, and Kansai Airport routes to Shinjuku, Asakusa, Kyoto, Namba and Umeda.",
    ogTitle: "Airport Transfers in Japan — Narita, Haneda & Kansai",
    ogDescription: "Compare airport transfer options for Tokyo and Kansai. Narita, Haneda, and KIX routes compared.",
    breadcrumbHome: "Home",
    breadcrumbCurrent: "Airport Transfers",
    heroLabel: "Arrival transfer guide",
    heroTitle: "Airport Transfers in Japan",
    heroBody: "Choose your first route from Narita, Haneda, or Kansai Airport before booking your hotel area. The best option depends on luggage, arrival time, and where you stay.",
    heroPrimary: "Start with Tokyo airport routes",
    heroSecondary: "See Kansai Airport routes",
    heroImageAlt: "Airport arrivals and transfer planning in Japan",
    quickLabel: "Quick answer",
    quickTitle: "Start with where you sleep on night one",
    quickAnswers: [
      { title: "Staying in Shinjuku", copy: "Narita Express is simple from Narita. From Haneda, trains or limousine bus are usually easier.", label: "Narita to Shinjuku" },
      { title: "Staying in Ueno / Asakusa", copy: "Narita can be very practical. Skyliner or direct Keisei/Asakusa Line routes often work well.", label: "Narita to Ueno / Asakusa" },
      { title: "Taking an early Shinkansen", copy: "Tokyo Station can reduce luggage stress before Kyoto or Osaka train days.", label: "Tokyo stay area guide" },
      { title: "Landing late", copy: "Check last trains and airport hotels before booking a hotel far from the airport.", label: "Late arrival guides" },
    ],
    chooseLabel: "Choose your arrival airport",
    chooseTitle: "Match the airport to your first hotel area",
    airportCards: {
      narita: { title: "Narita Airport", body: "Further from central Tokyo, but strong for Ueno, Asakusa, Tokyo Station, and Shinjuku with the right route.", imageAlt: "Narita Airport arrivals transfer area" },
      haneda: { title: "Haneda Airport", body: "Closer to central Tokyo. Good for Shinjuku, Tokyo Station, Asakusa, Ueno, and late arrivals.", imageAlt: "Haneda Airport arrivals transfer area" },
      kansai: { title: "Kansai Airport", body: "Gateway to Kyoto and Osaka. Choose Haruka, Nankai, bus, or transfer based on your first hotel area.", imageAlt: "Kansai Airport arrivals transfer area" },
    },
    problemLabel: "Choose by travel problem",
    problemTitle: "Route decisions that matter after landing",
    problems: [
      { title: "Heavy luggage", body: "Prioritize direct trains, airport buses, or private transfer over the cheapest stairs-and-transfer route.", label: "Compare luggage-friendly routes" },
      { title: "Late arrival", body: "Check the last-train risk before choosing a hotel far from the airport.", label: "Open late arrival guide" },
      { title: "First-time Tokyo", body: "Choose the airport route together with your first Tokyo base.", label: "Choose Tokyo stay area" },
      { title: "Kyoto first night", body: "If you land at KIX and sleep in Kyoto, compare Haruka, bus, and transfer options.", label: "KIX to Kyoto" },
      { title: "Osaka food/nightlife base", body: "Namba is often the practical first target for food and evening energy.", label: "KIX to Namba" },
      { title: "Shinkansen next day", body: "Tokyo Station can make luggage and early Kyoto or Osaka departures easier.", label: "Stay before Shinkansen" },
    ],
    allRoutesLabel: "All transfer route guides",
    allRoutesTitle: "Keep every existing route easy to reach",
    lateArrival: "Late arrival",
    continueLabel: "Continue planning",
    continueCards: [
      { title: "Choose where to stay", body: "Pick the city and hotel area before booking." },
      { title: "Get Japan eSIM", body: "Set up maps and transit before landing." },
      { title: "Check Shinkansen seat", body: "Find the Fuji-side seat before booking rail." },
      { title: "Open 7-day itinerary", body: "Connect arrival, Tokyo, Fuji, Kyoto, and Osaka." },
    ],
  },
  "pt-BR": {
    metaTitle: "Traslados de aeroporto no Japao — Narita, Haneda e Kansai | fujiseat",
    metaDescription: "Compare opcoes de traslado de aeroporto para Tokyo e Kansai, incluindo rotas de Narita, Haneda e Kansai para Shinjuku, Asakusa, Kyoto, Namba e Umeda.",
    ogTitle: "Traslados de aeroporto no Japao — Narita, Haneda e Kansai",
    ogDescription: "Compare opcoes de traslado em Tokyo e Kansai. Rotas de Narita, Haneda e KIX.",
    breadcrumbHome: "Inicio",
    breadcrumbCurrent: "Traslados de aeroporto",
    heroLabel: "Guia de chegada",
    heroTitle: "Traslados de aeroporto no Japao",
    heroBody: "Escolha sua primeira rota a partir de Narita, Haneda ou Kansai antes de reservar a area do hotel. A melhor opcao depende da bagagem, horario de chegada e onde voce vai ficar.",
    heroPrimary: "Ver rotas dos aeroportos de Tokyo",
    heroSecondary: "Ver rotas do Aeroporto de Kansai",
    heroImageAlt: "Chegadas de aeroporto e planejamento de traslado no Japao",
    quickLabel: "Resposta rapida",
    quickTitle: "Comece por onde voce vai dormir na primeira noite",
    quickAnswers: [
      { title: "Ficando em Shinjuku", copy: "O Narita Express e simples saindo de Narita. De Haneda, trem ou limousine bus costuma ser mais facil.", label: "Narita para Shinjuku" },
      { title: "Ficando em Ueno / Asakusa", copy: "Narita pode ser muito pratico. Skyliner ou rotas diretas Keisei/Asakusa Line costumam funcionar bem.", label: "Narita para Ueno / Asakusa" },
      { title: "Shinkansen cedo", copy: "Tokyo Station pode reduzir o estresse com bagagem antes de ir para Kyoto ou Osaka.", label: "Guia de areas em Tokyo" },
      { title: "Chegada tarde", copy: "Confira os ultimos trens e hoteis de aeroporto antes de reservar longe do aeroporto.", label: "Guias de chegada tarde" },
    ],
    chooseLabel: "Escolha o aeroporto de chegada",
    chooseTitle: "Combine o aeroporto com a area do primeiro hotel",
    airportCards: {
      narita: { title: "Aeroporto de Narita", body: "Mais longe do centro de Tokyo, mas bom para Ueno, Asakusa, Tokyo Station e Shinjuku com a rota certa.", imageAlt: "Area de chegada e traslado do Aeroporto de Narita" },
      haneda: { title: "Aeroporto de Haneda", body: "Mais perto do centro de Tokyo. Bom para Shinjuku, Tokyo Station, Asakusa, Ueno e chegadas tardias.", imageAlt: "Area de chegada e traslado do Aeroporto de Haneda" },
      kansai: { title: "Aeroporto de Kansai", body: "Entrada para Kyoto e Osaka. Escolha Haruka, Nankai, onibus ou transfer conforme a primeira area de hotel.", imageAlt: "Area de chegada e traslado do Aeroporto de Kansai" },
    },
    problemLabel: "Escolha pelo problema da viagem",
    problemTitle: "Decisoes de rota importantes depois do pouso",
    problems: [
      { title: "Bagagem pesada", body: "Priorize trens diretos, onibus de aeroporto ou transfer privado em vez da rota mais barata com escadas e baldeacoes.", label: "Comparar rotas faceis com bagagem" },
      { title: "Chegada tarde", body: "Confira o risco do ultimo trem antes de escolher um hotel longe do aeroporto.", label: "Abrir guia de chegada tarde" },
      { title: "Primeira vez em Tokyo", body: "Escolha a rota do aeroporto junto com sua primeira base em Tokyo.", label: "Escolher area em Tokyo" },
      { title: "Primeira noite em Kyoto", body: "Se voce chega em KIX e dorme em Kyoto, compare Haruka, onibus e transfer.", label: "KIX para Kyoto" },
      { title: "Comida/noite em Osaka", body: "Namba costuma ser o primeiro destino pratico para comida e energia noturna.", label: "KIX para Namba" },
      { title: "Shinkansen no dia seguinte", body: "Tokyo Station pode facilitar bagagem e partidas cedo para Kyoto ou Osaka.", label: "Hospedar antes do Shinkansen" },
    ],
    allRoutesLabel: "Todos os guias de traslado",
    allRoutesTitle: "Mantenha todas as rotas existentes faceis de encontrar",
    lateArrival: "Chegada tarde",
    continueLabel: "Continuar planejando",
    continueCards: [
      { title: "Escolher onde ficar", body: "Escolha cidade e area do hotel antes de reservar." },
      { title: "Comprar eSIM do Japao", body: "Prepare mapas e transporte antes do pouso." },
      { title: "Ver assento do Shinkansen", body: "Encontre o lado do Fuji antes de reservar o trem." },
      { title: "Abrir roteiro de 7 dias", body: "Conecte chegada, Tokyo, Fuji, Kyoto e Osaka." },
    ],
  },
  es: {
    metaTitle: "Traslados de aeropuerto en Japon — Narita, Haneda y Kansai | fujiseat",
    metaDescription: "Compara traslados de aeropuerto para Tokyo y Kansai, incluidas rutas desde Narita, Haneda y Kansai a Shinjuku, Asakusa, Kyoto, Namba y Umeda.",
    ogTitle: "Traslados de aeropuerto en Japon — Narita, Haneda y Kansai",
    ogDescription: "Compara opciones de traslado para Tokyo y Kansai. Rutas de Narita, Haneda y KIX.",
    breadcrumbHome: "Inicio",
    breadcrumbCurrent: "Traslados de aeropuerto",
    heroLabel: "Guia de traslado de llegada",
    heroTitle: "Traslados de aeropuerto en Japon",
    heroBody: "Elige tu primera ruta desde Narita, Haneda o Kansai antes de reservar la zona del hotel. La mejor opcion depende del equipaje, la hora de llegada y donde te alojes.",
    heroPrimary: "Empezar con rutas de Tokyo",
    heroSecondary: "Ver rutas del Aeropuerto de Kansai",
    heroImageAlt: "Llegadas de aeropuerto y planificacion de traslados en Japon",
    quickLabel: "Respuesta rapida",
    quickTitle: "Empieza por donde duermes la primera noche",
    quickAnswers: [
      { title: "Alojamiento en Shinjuku", copy: "Narita Express es sencillo desde Narita. Desde Haneda, trenes o limousine bus suelen ser mas faciles.", label: "Narita a Shinjuku" },
      { title: "Alojamiento en Ueno / Asakusa", copy: "Narita puede ser muy practico. Skyliner o rutas directas Keisei/Asakusa Line suelen funcionar bien.", label: "Narita a Ueno / Asakusa" },
      { title: "Shinkansen temprano", copy: "Tokyo Station puede reducir el estres con equipaje antes de ir a Kyoto u Osaka.", label: "Guia de zonas de Tokyo" },
      { title: "Llegada tarde", copy: "Revisa ultimos trenes y hoteles de aeropuerto antes de reservar lejos del aeropuerto.", label: "Guias de llegada tarde" },
    ],
    chooseLabel: "Elige tu aeropuerto de llegada",
    chooseTitle: "Relaciona el aeropuerto con la primera zona de hotel",
    airportCards: {
      narita: { title: "Aeropuerto de Narita", body: "Mas lejos del centro de Tokyo, pero fuerte para Ueno, Asakusa, Tokyo Station y Shinjuku con la ruta adecuada.", imageAlt: "Zona de llegadas y traslados del Aeropuerto de Narita" },
      haneda: { title: "Aeropuerto de Haneda", body: "Mas cerca del centro de Tokyo. Bueno para Shinjuku, Tokyo Station, Asakusa, Ueno y llegadas tardias.", imageAlt: "Zona de llegadas y traslados del Aeropuerto de Haneda" },
      kansai: { title: "Aeropuerto de Kansai", body: "Puerta de entrada a Kyoto y Osaka. Elige Haruka, Nankai, bus o transfer segun la primera zona de hotel.", imageAlt: "Zona de llegadas y traslados del Aeropuerto de Kansai" },
    },
    problemLabel: "Elige segun tu problema de viaje",
    problemTitle: "Decisiones de ruta importantes al aterrizar",
    problems: [
      { title: "Equipaje pesado", body: "Prioriza trenes directos, buses de aeropuerto o transfer privado frente a la ruta mas barata con escaleras y transbordos.", label: "Comparar rutas faciles con equipaje" },
      { title: "Llegada tarde", body: "Revisa el riesgo del ultimo tren antes de elegir un hotel lejos del aeropuerto.", label: "Abrir guia de llegada tarde" },
      { title: "Primera vez en Tokyo", body: "Elige la ruta del aeropuerto junto con tu primera base en Tokyo.", label: "Elegir zona de Tokyo" },
      { title: "Primera noche en Kyoto", body: "Si aterrizas en KIX y duermes en Kyoto, compara Haruka, bus y transfer.", label: "KIX a Kyoto" },
      { title: "Comida/noche en Osaka", body: "Namba suele ser el primer objetivo practico para comida y ambiente nocturno.", label: "KIX a Namba" },
      { title: "Shinkansen al dia siguiente", body: "Tokyo Station puede facilitar equipaje y salidas tempranas a Kyoto u Osaka.", label: "Alojamiento antes del Shinkansen" },
    ],
    allRoutesLabel: "Todas las guias de traslado",
    allRoutesTitle: "Mantener todas las rutas existentes faciles de encontrar",
    lateArrival: "Llegada tarde",
    continueLabel: "Continuar planificando",
    continueCards: [
      { title: "Elegir donde alojarte", body: "Elige ciudad y zona de hotel antes de reservar." },
      { title: "Comprar eSIM de Japon", body: "Configura mapas y transporte antes de aterrizar." },
      { title: "Revisar asiento Shinkansen", body: "Encuentra el lado del Fuji antes de reservar tren." },
      { title: "Abrir itinerario de 7 dias", body: "Conecta llegada, Tokyo, Fuji, Kyoto y Osaka." },
    ],
  },
  ko: {
    metaTitle: "일본 공항 교통 — 나리타, 하네다, 간사이 공항 | fujiseat",
    metaDescription: "도쿄와 간사이 공항 이동 방법을 비교하세요. 나리타, 하네다, 간사이 공항에서 신주쿠, 아사쿠사, 교토, 난바, 우메다로 가는 노선을 정리했습니다.",
    ogTitle: "일본 공항 교통 — 나리타, 하네다, 간사이",
    ogDescription: "도쿄와 간사이 공항 이동 옵션을 비교합니다. 나리타, 하네다, KIX 노선.",
    breadcrumbHome: "홈",
    breadcrumbCurrent: "공항 교통",
    heroLabel: "도착 교통 가이드",
    heroTitle: "일본 공항 교통",
    heroBody: "호텔 지역을 예약하기 전에 나리타, 하네다, 간사이 공항에서 첫 이동 경로를 정하세요. 최적의 선택은 짐, 도착 시간, 숙박 지역에 따라 달라집니다.",
    heroPrimary: "도쿄 공항 노선부터 보기",
    heroSecondary: "간사이 공항 노선 보기",
    heroImageAlt: "일본 공항 도착과 교통 계획",
    quickLabel: "빠른 답변",
    quickTitle: "첫날 밤 어디서 잘지부터 정하세요",
    quickAnswers: [
      { title: "신주쿠에 숙박", copy: "나리타에서는 Narita Express가 단순합니다. 하네다에서는 전철이나 리무진 버스가 보통 쉽습니다.", label: "나리타에서 신주쿠" },
      { title: "우에노 / 아사쿠사에 숙박", copy: "나리타가 꽤 편리할 수 있습니다. Skyliner 또는 Keisei/Asakusa Line 직통 경로가 잘 맞는 경우가 많습니다.", label: "나리타에서 우에노 / 아사쿠사" },
      { title: "이른 신칸센", copy: "Tokyo Station 근처는 교토나 오사카로 가는 날 짐 스트레스를 줄일 수 있습니다.", label: "도쿄 숙박 지역 가이드" },
      { title: "늦은 도착", copy: "공항에서 먼 호텔을 예약하기 전에 막차와 공항 호텔을 확인하세요.", label: "늦은 도착 가이드" },
    ],
    chooseLabel: "도착 공항 선택",
    chooseTitle: "공항과 첫 호텔 지역을 맞추기",
    airportCards: {
      narita: { title: "나리타 공항", body: "도쿄 중심부에서는 멀지만, 올바른 경로를 고르면 우에노, 아사쿠사, Tokyo Station, 신주쿠에 좋습니다.", imageAlt: "나리타 공항 도착 교통 구역" },
      haneda: { title: "하네다 공항", body: "도쿄 중심부와 가깝습니다. 신주쿠, Tokyo Station, 아사쿠사, 우에노, 늦은 도착에 좋습니다.", imageAlt: "하네다 공항 도착 교통 구역" },
      kansai: { title: "간사이 공항", body: "교토와 오사카의 관문입니다. 첫 호텔 지역에 따라 Haruka, Nankai, 버스, transfer를 고르세요.", imageAlt: "간사이 공항 도착 교통 구역" },
    },
    problemLabel: "여행 문제별 선택",
    problemTitle: "도착 후 중요한 이동 결정",
    problems: [
      { title: "짐이 많음", body: "가장 저렴한 환승 경로보다 직통 열차, 공항버스, private transfer를 우선하세요.", label: "짐이 편한 경로 비교" },
      { title: "늦은 도착", body: "공항에서 먼 호텔을 고르기 전에 막차 위험을 확인하세요.", label: "늦은 도착 가이드 열기" },
      { title: "도쿄 첫 방문", body: "첫 도쿄 숙박지와 공항 경로를 함께 정하세요.", label: "도쿄 숙박 지역 선택" },
      { title: "교토 첫날 밤", body: "KIX에 도착해 교토에서 자는 경우 Haruka, 버스, transfer를 비교하세요.", label: "KIX에서 교토" },
      { title: "오사카 음식/밤문화", body: "난바는 음식과 밤 분위기를 위해 첫 목적지로 실용적인 경우가 많습니다.", label: "KIX에서 난바" },
      { title: "다음날 신칸센", body: "Tokyo Station은 짐과 이른 교토/오사카 출발을 쉽게 만들 수 있습니다.", label: "신칸센 전 숙박" },
    ],
    allRoutesLabel: "모든 공항 이동 가이드",
    allRoutesTitle: "기존 노선을 쉽게 찾을 수 있게 유지",
    lateArrival: "늦은 도착",
    continueLabel: "계속 계획하기",
    continueCards: [
      { title: "숙박 지역 선택", body: "예약 전에 도시와 호텔 지역을 고르세요." },
      { title: "일본 eSIM 받기", body: "도착 전에 지도와 교통 앱을 준비하세요." },
      { title: "신칸센 좌석 확인", body: "철도 예약 전에 후지산 쪽 좌석을 찾으세요." },
      { title: "7일 일정 열기", body: "도착, 도쿄, 후지, 교토, 오사카를 연결하세요." },
    ],
  },
  "zh-TW": {
    metaTitle: "日本機場交通 — 成田、羽田、關西機場 | fujiseat",
    metaDescription: "比較東京與關西的機場交通，包括成田、羽田、關西機場前往新宿、淺草、京都、難波與梅田的路線。",
    ogTitle: "日本機場交通 — 成田、羽田與關西",
    ogDescription: "比較東京與關西的機場交通選擇。成田、羽田與 KIX 路線整理。",
    breadcrumbHome: "首頁",
    breadcrumbCurrent: "機場交通",
    heroLabel: "抵達交通指南",
    heroTitle: "日本機場交通",
    heroBody: "預訂飯店區域前，先選好從成田、羽田或關西機場出發的第一段路線。最佳選擇取決於行李、抵達時間與住宿地點。",
    heroPrimary: "先看東京機場路線",
    heroSecondary: "看關西機場路線",
    heroImageAlt: "日本機場抵達與交通規劃",
    quickLabel: "快速答案",
    quickTitle: "先從第一晚住哪裡開始",
    quickAnswers: [
      { title: "住在新宿", copy: "從成田搭 Narita Express 很單純。從羽田出發，電車或利木津巴士通常更容易。", label: "成田到新宿" },
      { title: "住在上野 / 淺草", copy: "成田會很實用。Skyliner 或京成/淺草線直通路線通常很合適。", label: "成田到上野 / 淺草" },
      { title: "一早搭新幹線", copy: "東京車站可以減少前往京都或大阪當天的行李壓力。", label: "東京住宿區域指南" },
      { title: "晚到", copy: "預訂遠離機場的飯店前，先確認末班車與機場飯店。", label: "晚到指南" },
    ],
    chooseLabel: "選擇抵達機場",
    chooseTitle: "把機場和第一晚飯店區域搭配起來",
    airportCards: {
      narita: { title: "成田機場", body: "離東京市中心較遠，但選對路線時很適合上野、淺草、東京車站與新宿。", imageAlt: "成田機場抵達交通區域" },
      haneda: { title: "羽田機場", body: "更接近東京市中心。適合新宿、東京車站、淺草、上野與晚到。", imageAlt: "羽田機場抵達交通區域" },
      kansai: { title: "關西機場", body: "前往京都與大阪的入口。依第一晚飯店區域選擇 Haruka、南海、巴士或接送。", imageAlt: "關西機場抵達交通區域" },
    },
    problemLabel: "依旅行問題選擇",
    problemTitle: "落地後真正重要的路線決策",
    problems: [
      { title: "行李很多", body: "優先考慮直達列車、機場巴士或私人接送，而不是最便宜但要上下樓梯轉乘的路線。", label: "比較行李友善路線" },
      { title: "晚到", body: "選擇離機場很遠的飯店前，先確認末班車風險。", label: "開啟晚到指南" },
      { title: "第一次到東京", body: "把機場路線和第一個東京住宿區域一起決定。", label: "選擇東京住宿區域" },
      { title: "京都第一晚", body: "如果抵達 KIX 後直接住京都，請比較 Haruka、巴士與接送。", label: "KIX 到京都" },
      { title: "大阪美食/夜生活", body: "難波通常是美食和夜間氣氛的實用第一站。", label: "KIX 到難波" },
      { title: "隔天搭新幹線", body: "東京車站能讓行李和早班京都/大阪出發更輕鬆。", label: "新幹線前住宿" },
    ],
    allRoutesLabel: "所有機場交通指南",
    allRoutesTitle: "讓所有既有路線都容易找到",
    lateArrival: "晚到",
    continueLabel: "繼續規劃",
    continueCards: [
      { title: "選擇住宿地點", body: "預訂前先選城市和飯店區域。" },
      { title: "取得日本 eSIM", body: "落地前準備好地圖與交通。" },
      { title: "確認新幹線座位", body: "訂鐵路前先找富士山側座位。" },
      { title: "開啟 7 天行程", body: "串起抵達、東京、富士、京都與大阪。" },
    ],
  },
  "zh-CN": {
    metaTitle: "日本机场交通 — 成田、羽田、关西机场 | fujiseat",
    metaDescription: "比较东京和关西机场交通，包括成田、羽田、关西机场前往新宿、浅草、京都、难波和梅田的路线。",
    ogTitle: "日本机场交通 — 成田、羽田与关西",
    ogDescription: "比较东京和关西机场交通选择。成田、羽田和 KIX 路线整理。",
    breadcrumbHome: "首页",
    breadcrumbCurrent: "机场交通",
    heroLabel: "抵达交通指南",
    heroTitle: "日本机场交通",
    heroBody: "预订酒店区域前，先选好从成田、羽田或关西机场出发的第一段路线。最佳选择取决于行李、抵达时间和住宿地点。",
    heroPrimary: "先看东京机场路线",
    heroSecondary: "看关西机场路线",
    heroImageAlt: "日本机场抵达与交通规划",
    quickLabel: "快速答案",
    quickTitle: "先从第一晚住哪里开始",
    quickAnswers: [
      { title: "住在新宿", copy: "从成田搭 Narita Express 很简单。从羽田出发，电车或利木津巴士通常更容易。", label: "成田到新宿" },
      { title: "住在上野 / 浅草", copy: "成田会很实用。Skyliner 或京成/浅草线直通路线通常很合适。", label: "成田到上野 / 浅草" },
      { title: "一早搭新干线", copy: "东京站可以减少前往京都或大阪当天的行李压力。", label: "东京住宿区域指南" },
      { title: "晚到", copy: "预订远离机场的酒店前，先确认末班车和机场酒店。", label: "晚到指南" },
    ],
    chooseLabel: "选择抵达机场",
    chooseTitle: "把机场和第一晚酒店区域搭配起来",
    airportCards: {
      narita: { title: "成田机场", body: "离东京市中心较远，但选对路线时很适合上野、浅草、东京站和新宿。", imageAlt: "成田机场抵达交通区域" },
      haneda: { title: "羽田机场", body: "更接近东京市中心。适合新宿、东京站、浅草、上野和晚到。", imageAlt: "羽田机场抵达交通区域" },
      kansai: { title: "关西机场", body: "前往京都和大阪的入口。根据第一晚酒店区域选择 Haruka、南海、巴士或接送。", imageAlt: "关西机场抵达交通区域" },
    },
    problemLabel: "按旅行问题选择",
    problemTitle: "落地后真正重要的路线决策",
    problems: [
      { title: "行李很多", body: "优先考虑直达列车、机场巴士或私人接送，而不是最便宜但要上下楼梯换乘的路线。", label: "比较行李友好路线" },
      { title: "晚到", body: "选择离机场很远的酒店前，先确认末班车风险。", label: "打开晚到指南" },
      { title: "第一次到东京", body: "把机场路线和第一个东京住宿区域一起决定。", label: "选择东京住宿区域" },
      { title: "京都第一晚", body: "如果抵达 KIX 后直接住京都，请比较 Haruka、巴士和接送。", label: "KIX 到京都" },
      { title: "大阪美食/夜生活", body: "难波通常是美食和夜间氛围的实用第一站。", label: "KIX 到难波" },
      { title: "隔天搭新干线", body: "东京站能让行李和早班京都/大阪出发更轻松。", label: "新干线前住宿" },
    ],
    allRoutesLabel: "所有机场交通指南",
    allRoutesTitle: "让所有既有路线都容易找到",
    lateArrival: "晚到",
    continueLabel: "继续规划",
    continueCards: [
      { title: "选择住宿地点", body: "预订前先选城市和酒店区域。" },
      { title: "获取日本 eSIM", body: "落地前准备好地图和交通。" },
      { title: "确认新干线座位", body: "订铁路前先找富士山侧座位。" },
      { title: "打开 7 天行程", body: "串起抵达、东京、富士、京都和大阪。" },
    ],
  },
  fr: {
    metaTitle: "Transferts aeroport au Japon — Narita, Haneda et Kansai | fujiseat",
    metaDescription: "Comparez les transferts aeroport pour Tokyo et le Kansai, avec les routes Narita, Haneda et Kansai vers Shinjuku, Asakusa, Kyoto, Namba et Umeda.",
    ogTitle: "Transferts aeroport au Japon — Narita, Haneda et Kansai",
    ogDescription: "Comparez les options de transfert pour Tokyo et le Kansai. Routes Narita, Haneda et KIX.",
    breadcrumbHome: "Accueil",
    breadcrumbCurrent: "Transferts aeroport",
    heroLabel: "Guide de transfert a l'arrivee",
    heroTitle: "Transferts aeroport au Japon",
    heroBody: "Choisissez votre premiere route depuis Narita, Haneda ou Kansai avant de reserver votre quartier d'hotel. Le meilleur choix depend des bagages, de l'heure d'arrivee et de votre base.",
    heroPrimary: "Commencer par les routes de Tokyo",
    heroSecondary: "Voir les routes de Kansai Airport",
    heroImageAlt: "Arrivees aeroport et planification de transfert au Japon",
    quickLabel: "Reponse rapide",
    quickTitle: "Commencez par l'endroit ou vous dormez la premiere nuit",
    quickAnswers: [
      { title: "Sejour a Shinjuku", copy: "Le Narita Express est simple depuis Narita. Depuis Haneda, train ou limousine bus est souvent plus facile.", label: "Narita vers Shinjuku" },
      { title: "Sejour a Ueno / Asakusa", copy: "Narita peut etre tres pratique. Skyliner ou les routes directes Keisei/Asakusa Line fonctionnent souvent bien.", label: "Narita vers Ueno / Asakusa" },
      { title: "Shinkansen tot", copy: "Tokyo Station peut reduire le stress des bagages avant Kyoto ou Osaka.", label: "Guide des quartiers de Tokyo" },
      { title: "Arrivee tardive", copy: "Verifiez les derniers trains et hotels d'aeroport avant de reserver loin de l'aeroport.", label: "Guides arrivee tardive" },
    ],
    chooseLabel: "Choisir votre aeroport d'arrivee",
    chooseTitle: "Relier l'aeroport a votre premier quartier d'hotel",
    airportCards: {
      narita: { title: "Aeroport de Narita", body: "Plus loin du centre de Tokyo, mais fort pour Ueno, Asakusa, Tokyo Station et Shinjuku avec la bonne route.", imageAlt: "Zone d'arrivee et transfert de Narita" },
      haneda: { title: "Aeroport de Haneda", body: "Plus proche du centre de Tokyo. Bon pour Shinjuku, Tokyo Station, Asakusa, Ueno et les arrivees tardives.", imageAlt: "Zone d'arrivee et transfert de Haneda" },
      kansai: { title: "Aeroport de Kansai", body: "Porte d'entree vers Kyoto et Osaka. Choisissez Haruka, Nankai, bus ou transfert selon votre premier quartier d'hotel.", imageAlt: "Zone d'arrivee et transfert de Kansai" },
    },
    problemLabel: "Choisir par probleme de voyage",
    problemTitle: "Les decisions de route importantes apres l'atterrissage",
    problems: [
      { title: "Bagages lourds", body: "Priorisez trains directs, bus aeroport ou transfert prive plutot que la route la moins chere avec escaliers et correspondances.", label: "Comparer les routes faciles avec bagages" },
      { title: "Arrivee tardive", body: "Verifiez le risque du dernier train avant de choisir un hotel loin de l'aeroport.", label: "Ouvrir le guide tardif" },
      { title: "Premiere fois a Tokyo", body: "Choisissez la route aeroport avec votre premiere base a Tokyo.", label: "Choisir le quartier a Tokyo" },
      { title: "Premiere nuit a Kyoto", body: "Si vous arrivez a KIX et dormez a Kyoto, comparez Haruka, bus et transfert.", label: "KIX vers Kyoto" },
      { title: "Base food/nightlife a Osaka", body: "Namba est souvent la premiere cible pratique pour manger et sortir.", label: "KIX vers Namba" },
      { title: "Shinkansen le lendemain", body: "Tokyo Station peut faciliter les bagages et les departs tot vers Kyoto ou Osaka.", label: "Dormir avant le Shinkansen" },
    ],
    allRoutesLabel: "Tous les guides de transfert",
    allRoutesTitle: "Garder toutes les routes existantes faciles a trouver",
    lateArrival: "Arrivee tardive",
    continueLabel: "Continuer la planification",
    continueCards: [
      { title: "Choisir ou dormir", body: "Choisissez la ville et le quartier avant de reserver." },
      { title: "Obtenir une eSIM Japon", body: "Preparez cartes et transports avant l'atterrissage." },
      { title: "Verifier le siege Shinkansen", body: "Trouvez le cote Fuji avant de reserver le train." },
      { title: "Ouvrir l'itineraire 7 jours", body: "Reliez arrivee, Tokyo, Fuji, Kyoto et Osaka." },
    ],
  },
  de: {
    metaTitle: "Flughafentransfers in Japan — Narita, Haneda und Kansai | fujiseat",
    metaDescription: "Vergleiche Flughafentransfers fuer Tokyo und Kansai, inklusive Narita, Haneda und Kansai Airport nach Shinjuku, Asakusa, Kyoto, Namba und Umeda.",
    ogTitle: "Flughafentransfers in Japan — Narita, Haneda und Kansai",
    ogDescription: "Vergleiche Transferoptionen fuer Tokyo und Kansai. Narita-, Haneda- und KIX-Routen.",
    breadcrumbHome: "Start",
    breadcrumbCurrent: "Flughafentransfers",
    heroLabel: "Ankunftstransfer-Guide",
    heroTitle: "Flughafentransfers in Japan",
    heroBody: "Waehle deine erste Route ab Narita, Haneda oder Kansai Airport, bevor du die Hotelgegend buchst. Die beste Option haengt von Gepaeck, Ankunftszeit und Unterkunft ab.",
    heroPrimary: "Mit Tokyo-Flughafenrouten starten",
    heroSecondary: "Kansai-Airport-Routen ansehen",
    heroImageAlt: "Flughafenankunft und Transferplanung in Japan",
    quickLabel: "Kurzantwort",
    quickTitle: "Beginne mit dem Ort deiner ersten Nacht",
    quickAnswers: [
      { title: "Aufenthalt in Shinjuku", copy: "Der Narita Express ist ab Narita einfach. Ab Haneda sind Zug oder Limousine Bus meist leichter.", label: "Narita nach Shinjuku" },
      { title: "Aufenthalt in Ueno / Asakusa", copy: "Narita kann sehr praktisch sein. Skyliner oder direkte Keisei/Asakusa-Line-Routen passen oft gut.", label: "Narita nach Ueno / Asakusa" },
      { title: "Frueher Shinkansen", copy: "Tokyo Station kann Gepaeckstress vor Kyoto- oder Osaka-Tagen reduzieren.", label: "Tokyo Unterkunfts-Guide" },
      { title: "Spaete Ankunft", copy: "Pruefe letzte Zuege und Flughafenhotels, bevor du weit vom Flughafen buchst.", label: "Guides fuer spaete Ankunft" },
    ],
    chooseLabel: "Ankunftsflughafen waehlen",
    chooseTitle: "Flughafen und erste Hotelgegend zusammen denken",
    airportCards: {
      narita: { title: "Narita Airport", body: "Weiter vom Zentrum Tokyos entfernt, aber stark fuer Ueno, Asakusa, Tokyo Station und Shinjuku mit der richtigen Route.", imageAlt: "Ankunfts- und Transferbereich am Narita Airport" },
      haneda: { title: "Haneda Airport", body: "Naeher am Zentrum Tokyos. Gut fuer Shinjuku, Tokyo Station, Asakusa, Ueno und spaete Ankuenfte.", imageAlt: "Ankunfts- und Transferbereich am Haneda Airport" },
      kansai: { title: "Kansai Airport", body: "Tor nach Kyoto und Osaka. Waehle Haruka, Nankai, Bus oder Transfer je nach erster Hotelgegend.", imageAlt: "Ankunfts- und Transferbereich am Kansai Airport" },
    },
    problemLabel: "Nach Reiseproblem waehlen",
    problemTitle: "Routenentscheidungen nach der Landung",
    problems: [
      { title: "Viel Gepaeck", body: "Priorisiere Direktzuege, Flughafenbusse oder private Transfers statt der billigsten Route mit Treppen und Umstiegen.", label: "Gepaeckfreundliche Routen vergleichen" },
      { title: "Spaete Ankunft", body: "Pruefe das Risiko des letzten Zuges, bevor du ein Hotel weit vom Flughafen waehlst.", label: "Guide fuer spaete Ankunft oeffnen" },
      { title: "Erstes Mal Tokyo", body: "Waehle die Flughafenroute zusammen mit deiner ersten Tokyo-Basis.", label: "Tokyo-Gegend waehlen" },
      { title: "Erste Nacht Kyoto", body: "Wenn du in KIX landest und in Kyoto schlaefst, vergleiche Haruka, Bus und Transfer.", label: "KIX nach Kyoto" },
      { title: "Osaka Essen/Nachtleben", body: "Namba ist oft das praktische erste Ziel fuer Essen und Abendenergie.", label: "KIX nach Namba" },
      { title: "Shinkansen am naechsten Tag", body: "Tokyo Station kann Gepaeck und fruehe Abfahrten nach Kyoto oder Osaka erleichtern.", label: "Vor dem Shinkansen uebernachten" },
    ],
    allRoutesLabel: "Alle Transfer-Routenguides",
    allRoutesTitle: "Alle bestehenden Routen leicht erreichbar halten",
    lateArrival: "Spaete Ankunft",
    continueLabel: "Weiter planen",
    continueCards: [
      { title: "Unterkunftsgegend waehlen", body: "Waehle Stadt und Hotelgegend vor der Buchung." },
      { title: "Japan eSIM holen", body: "Karten und Transit vor der Landung einrichten." },
      { title: "Shinkansen-Sitz pruefen", body: "Fuji-Seite vor der Bahnbuchung finden." },
      { title: "7-Tage-Route oeffnen", body: "Ankunft, Tokyo, Fuji, Kyoto und Osaka verbinden." },
    ],
  },
  ru: {
    metaTitle: "Трансферы из аэропортов Японии — Нарита, Ханэда и Кансай | fujiseat",
    metaDescription: "Сравните трансферы из аэропортов для Токио и Кансая: маршруты из Нариты, Ханэды и KIX в Синдзюку, Асакусу, Киото, Намбу и Умэду.",
    ogTitle: "Трансферы из аэропортов Японии — Нарита, Ханэда и Кансай",
    ogDescription: "Сравнение трансферов для Токио и Кансая. Маршруты Нарита, Ханэда и KIX.",
    breadcrumbHome: "Главная",
    breadcrumbCurrent: "Трансферы из аэропорта",
    heroLabel: "Гид по трансферу после прилета",
    heroTitle: "Трансферы из аэропортов Японии",
    heroBody: "Выберите первый маршрут из Нариты, Ханэды или аэропорта Кансай до бронирования района отеля. Лучший вариант зависит от багажа, времени прилета и места проживания.",
    heroPrimary: "Начать с маршрутов аэропортов Токио",
    heroSecondary: "Смотреть маршруты аэропорта Кансай",
    heroImageAlt: "Прилет в аэропорт и планирование трансфера в Японии",
    quickLabel: "Короткий ответ",
    quickTitle: "Начните с места первой ночи",
    quickAnswers: [
      { title: "Проживание в Синдзюку", copy: "Из Нариты Narita Express самый простой. Из Ханэды обычно удобнее поезд или limousine bus.", label: "Нарита в Синдзюку" },
      { title: "Проживание в Уэно / Асакусе", copy: "Нарита может быть очень практична. Skyliner или прямые маршруты Keisei/Asakusa Line часто подходят.", label: "Нарита в Уэно / Асакусу" },
      { title: "Ранний синкансэн", copy: "Tokyo Station может снизить стресс с багажом перед поездкой в Киото или Осаку.", label: "Гид по районам Токио" },
      { title: "Поздний прилет", copy: "Проверьте последние поезда и отели у аэропорта до бронирования далеко от аэропорта.", label: "Гиды для позднего прилета" },
    ],
    chooseLabel: "Выберите аэропорт прилета",
    chooseTitle: "Свяжите аэропорт с районом первого отеля",
    airportCards: {
      narita: { title: "Аэропорт Нарита", body: "Дальше от центра Токио, но удобен для Уэно, Асакусы, Tokyo Station и Синдзюку при правильном маршруте.", imageAlt: "Зона прилета и трансфера аэропорта Нарита" },
      haneda: { title: "Аэропорт Ханэда", body: "Ближе к центру Токио. Хорош для Синдзюку, Tokyo Station, Асакусы, Уэно и поздних прилетов.", imageAlt: "Зона прилета и трансфера аэропорта Ханэда" },
      kansai: { title: "Аэропорт Кансай", body: "Ворота в Киото и Осаку. Выбирайте Haruka, Nankai, автобус или трансфер по району первого отеля.", imageAlt: "Зона прилета и трансфера аэропорта Кансай" },
    },
    problemLabel: "Выбор по задаче поездки",
    problemTitle: "Важные решения по маршруту после посадки",
    problems: [
      { title: "Тяжелый багаж", body: "Выбирайте прямые поезда, автобусы аэропорта или частный трансфер вместо самого дешевого маршрута с лестницами и пересадками.", label: "Сравнить удобные маршруты с багажом" },
      { title: "Поздний прилет", body: "Проверьте риск последнего поезда перед выбором отеля далеко от аэропорта.", label: "Открыть гид позднего прилета" },
      { title: "Первый раз в Токио", body: "Выбирайте маршрут из аэропорта вместе с первой базой в Токио.", label: "Выбрать район Токио" },
      { title: "Первая ночь в Киото", body: "Если вы прилетаете в KIX и ночуете в Киото, сравните Haruka, автобус и трансфер.", label: "KIX в Киото" },
      { title: "Еда/ночная жизнь Осаки", body: "Намба часто практичная первая цель для еды и вечерней атмосферы.", label: "KIX в Намбу" },
      { title: "Синкансэн на следующий день", body: "Tokyo Station может упростить багаж и ранние отправления в Киото или Осаку.", label: "Ночь перед синкансэном" },
    ],
    allRoutesLabel: "Все гиды по трансферам",
    allRoutesTitle: "Все существующие маршруты легко доступны",
    lateArrival: "Поздний прилет",
    continueLabel: "Продолжить планирование",
    continueCards: [
      { title: "Выбрать район проживания", body: "Выберите город и район отеля до бронирования." },
      { title: "Получить eSIM для Японии", body: "Подготовьте карты и транспорт до прилета." },
      { title: "Проверить место в синкансэне", body: "Найдите сторону Фудзи перед бронированием поезда." },
      { title: "Открыть маршрут на 7 дней", body: "Свяжите прилет, Токио, Фудзи, Киото и Осаку." },
    ],
  },
};

const routeUiCopies: Record<AirportLocale, RouteUiCopy> = {
  en: {
    breadcrumb: "Airport transfers",
    recommended: "Recommended",
    luggageNote: "Luggage note",
    lateArrival: "Late arrival",
    quickAnswer: "Quick answer",
    compareTitle: "Compare your options",
    compareBody: "Sorted by what matters most — speed, ease, or cost.",
    fareDisclaimer: "Fares and travel times are approximate and can change by date, provider, service type, and booking channel. Always check the latest price and schedule before booking.",
    luggageLabel: "Luggage note",
    luggageBody: "With two or more large suitcases, prioritize direct trains or buses over the cheapest transfer. Station stairs and rush-hour platforms are the hidden cost.",
    lateQuestion: "Late arrival?",
    arrivalTitle: "Choose your hotel area around your arrival route",
    arrivalCta: "Choose stay area",
    nextCards: [
      { title: "Choose stay area", body: "Match your first hotel area to your airport route.", label: "Open guide" },
      { title: "Get Japan eSIM", body: "Set up maps, translation, and transit before landing.", label: "Get eSIM" },
      { title: "Check Shinkansen seat", body: "Find the Fuji-side seat before booking your rail day.", label: "Open checker" },
      { title: "Open itinerary", body: "Connect arrival, Tokyo, Fuji, Kyoto, and Osaka in order.", label: "Open itinerary" },
    ],
    badges: { fastest: "Fastest", easiest: "Easiest", cheapest: "Cheapest" },
    bestFor: {
      fastest: "Best for travelers who want the quickest route after landing.",
      cheapest: "Best if you are traveling light and want to keep costs low.",
      luggageLate: "Best for heavy luggage, families, or tired late arrivals.",
      luggage: "Best if luggage ease matters more than raw speed.",
      default: "Best when you want a simpler arrival choice.",
    },
    pros: "Pros",
    cons: "Cons",
    helperBoth: "Use Klook to book a specific ticket. Use Omio to compare trains, buses, and route options.",
    helperKlook: "Use Klook to book this transport product.",
    noBooking: "No booking needed",
    noBookingIc: "No booking needed - use IC card",
    preBook: "Pre-book if needed",
    actionDefault: "Book or compare this route",
    compareRouteTitle: "Not sure which transfer is best?",
    compareRouteBody: "Compare trains, buses, and route options before booking.",
  },
  "pt-BR": {
    breadcrumb: "Traslados de aeroporto",
    recommended: "Recomendado",
    luggageNote: "Nota sobre bagagem",
    lateArrival: "Chegada tarde",
    quickAnswer: "Resposta rapida",
    compareTitle: "Compare suas opcoes",
    compareBody: "Ordenado pelo que mais importa: velocidade, facilidade ou custo.",
    fareDisclaimer: "Tarifas e tempos sao aproximados e podem mudar por data, empresa, tipo de servico e canal de reserva. Confira o preco e horario mais recentes antes de reservar.",
    luggageLabel: "Nota sobre bagagem",
    luggageBody: "Com duas ou mais malas grandes, priorize trens ou onibus diretos em vez do traslado mais barato. Escadas de estacao e plataformas lotadas sao o custo escondido.",
    lateQuestion: "Chegada tarde?",
    arrivalTitle: "Escolha a area do hotel ao redor da sua rota de chegada",
    arrivalCta: "Escolher area",
    nextCards: [
      { title: "Escolher area", body: "Combine o primeiro hotel com sua rota do aeroporto.", label: "Abrir guia" },
      { title: "Comprar eSIM do Japao", body: "Configure mapas, traducao e transporte antes de pousar.", label: "Comprar eSIM" },
      { title: "Ver assento do Shinkansen", body: "Encontre o assento do lado Fuji antes do dia de trem.", label: "Abrir verificador" },
      { title: "Abrir roteiro", body: "Conecte chegada, Tokyo, Fuji, Kyoto e Osaka em ordem.", label: "Abrir roteiro" },
    ],
    badges: { fastest: "Mais rapido", easiest: "Mais facil", cheapest: "Mais barato" },
    bestFor: {
      fastest: "Melhor para quem quer a rota mais rapida depois do pouso.",
      cheapest: "Melhor se voce viaja leve e quer economizar.",
      luggageLate: "Melhor para bagagem pesada, familias ou chegadas tardias cansativas.",
      luggage: "Melhor quando facilidade com bagagem importa mais que velocidade.",
      default: "Melhor quando voce quer uma chegada mais simples.",
    },
    pros: "Pontos fortes",
    cons: "Pontos fracos",
    helperBoth: "Use Klook para reservar um bilhete especifico. Use Omio para comparar trens, onibus e rotas.",
    helperKlook: "Use Klook para reservar este produto de transporte.",
    noBooking: "Reserva nao necessaria",
    noBookingIc: "Reserva nao necessaria - use IC card",
    preBook: "Reserve antes se necessario",
    actionDefault: "Reservar ou comparar esta rota",
    compareRouteTitle: "Ainda nao sabe qual transfer e melhor?",
    compareRouteBody: "Compare trens, onibus e opcoes de rota antes de reservar.",
  },
  es: {
    breadcrumb: "Traslados de aeropuerto",
    recommended: "Recomendado",
    luggageNote: "Nota de equipaje",
    lateArrival: "Llegada tarde",
    quickAnswer: "Respuesta rapida",
    compareTitle: "Compara tus opciones",
    compareBody: "Ordenado por lo que mas importa: rapidez, facilidad o coste.",
    fareDisclaimer: "Las tarifas y tiempos son aproximados y pueden cambiar segun fecha, proveedor, tipo de servicio y canal de reserva. Revisa siempre el precio y horario actual antes de reservar.",
    luggageLabel: "Nota de equipaje",
    luggageBody: "Con dos o mas maletas grandes, prioriza trenes o buses directos frente al traslado mas barato. Las escaleras de estacion y andenes en hora punta son el coste oculto.",
    lateQuestion: "Llegada tarde?",
    arrivalTitle: "Elige tu zona de hotel segun la ruta de llegada",
    arrivalCta: "Elegir zona",
    nextCards: [
      { title: "Elegir zona", body: "Relaciona tu primer hotel con la ruta desde el aeropuerto.", label: "Abrir guia" },
      { title: "Comprar eSIM Japon", body: "Configura mapas, traduccion y transporte antes de aterrizar.", label: "Comprar eSIM" },
      { title: "Revisar asiento Shinkansen", body: "Encuentra el lado del Fuji antes de tu dia de tren.", label: "Abrir verificador" },
      { title: "Abrir itinerario", body: "Conecta llegada, Tokyo, Fuji, Kyoto y Osaka en orden.", label: "Abrir itinerario" },
    ],
    badges: { fastest: "Mas rapido", easiest: "Mas facil", cheapest: "Mas barato" },
    bestFor: {
      fastest: "Mejor para viajeros que quieren la ruta mas rapida tras aterrizar.",
      cheapest: "Mejor si viajas ligero y quieres ahorrar.",
      luggageLate: "Mejor para equipaje pesado, familias o llegadas tardias con cansancio.",
      luggage: "Mejor si la facilidad con equipaje importa mas que la velocidad.",
      default: "Mejor si quieres una llegada mas sencilla.",
    },
    pros: "Ventajas",
    cons: "Desventajas",
    helperBoth: "Usa Klook para reservar un billete concreto. Usa Omio para comparar trenes, buses y rutas.",
    helperKlook: "Usa Klook para reservar este producto de transporte.",
    noBooking: "No hace falta reservar",
    noBookingIc: "No hace falta reservar - usa IC card",
    preBook: "Reserva antes si hace falta",
    actionDefault: "Reservar o comparar esta ruta",
    compareRouteTitle: "No sabes que traslado conviene?",
    compareRouteBody: "Compara trenes, buses y opciones de ruta antes de reservar.",
  },
  ko: {
    breadcrumb: "공항 교통",
    recommended: "추천",
    luggageNote: "짐 메모",
    lateArrival: "늦은 도착",
    quickAnswer: "빠른 답변",
    compareTitle: "옵션 비교",
    compareBody: "속도, 편의성, 비용 중 중요한 기준에 따라 정리했습니다.",
    fareDisclaimer: "요금과 소요 시간은 대략적인 정보이며 날짜, 업체, 서비스 종류, 예약 채널에 따라 달라질 수 있습니다. 예약 전 최신 가격과 시간을 확인하세요.",
    luggageLabel: "짐 메모",
    luggageBody: "큰 여행가방이 두 개 이상이면 가장 저렴한 이동보다 직통 열차나 버스를 우선하세요. 역 계단과 출퇴근 시간 플랫폼이 숨은 부담입니다.",
    lateQuestion: "늦은 도착인가요?",
    arrivalTitle: "도착 경로에 맞춰 호텔 지역 선택",
    arrivalCta: "숙박 지역 선택",
    nextCards: [
      { title: "숙박 지역 선택", body: "첫 호텔 지역을 공항 경로와 맞추세요.", label: "가이드 열기" },
      { title: "일본 eSIM 받기", body: "도착 전에 지도, 번역, 교통 앱을 준비하세요.", label: "eSIM 받기" },
      { title: "신칸센 좌석 확인", body: "철도 이동일 전에 후지산 쪽 좌석을 찾으세요.", label: "체커 열기" },
      { title: "일정 열기", body: "도착, 도쿄, 후지, 교토, 오사카를 순서대로 연결하세요.", label: "일정 열기" },
    ],
    badges: { fastest: "가장 빠름", easiest: "가장 쉬움", cheapest: "가장 저렴" },
    bestFor: {
      fastest: "도착 후 가장 빠른 경로를 원하는 여행자에게 좋습니다.",
      cheapest: "짐이 적고 비용을 줄이고 싶을 때 좋습니다.",
      luggageLate: "짐이 많거나 가족 여행, 피곤한 늦은 도착에 좋습니다.",
      luggage: "속도보다 짐 이동의 편함이 중요할 때 좋습니다.",
      default: "더 단순한 도착 방법을 원할 때 좋습니다.",
    },
    pros: "장점",
    cons: "주의점",
    helperBoth: "Klook은 특정 티켓 예약에, Omio는 열차와 버스 경로 비교에 사용하세요.",
    helperKlook: "이 교통 상품은 Klook에서 예약할 수 있습니다.",
    noBooking: "예약 필요 없음",
    noBookingIc: "예약 필요 없음 - IC card 사용",
    preBook: "필요하면 사전 예약",
    actionDefault: "이 경로 예약 또는 비교",
    compareRouteTitle: "어떤 이동이 좋을지 모르겠나요?",
    compareRouteBody: "예약 전에 열차, 버스, 경로 옵션을 비교하세요.",
  },
  "zh-TW": {
    breadcrumb: "機場交通",
    recommended: "推薦",
    luggageNote: "行李提示",
    lateArrival: "晚到",
    quickAnswer: "快速答案",
    compareTitle: "比較你的選項",
    compareBody: "依最重要的速度、方便度或費用整理。",
    fareDisclaimer: "票價與所需時間為概算，可能因日期、業者、服務類型與預訂管道而改變。預訂前請確認最新價格與時刻。",
    luggageLabel: "行李提示",
    luggageBody: "有兩件以上大型行李時，請優先選直達列車或巴士，而不是最便宜的轉乘。車站樓梯和尖峰時段月台才是隱藏成本。",
    lateQuestion: "晚到嗎？",
    arrivalTitle: "依抵達路線選擇飯店區域",
    arrivalCta: "選擇住宿區域",
    nextCards: [
      { title: "選擇住宿區域", body: "把第一晚飯店區域和機場路線搭配起來。", label: "開啟指南" },
      { title: "取得日本 eSIM", body: "落地前準備好地圖、翻譯和交通。", label: "取得 eSIM" },
      { title: "確認新幹線座位", body: "鐵路日之前找到富士山側座位。", label: "開啟查詢" },
      { title: "開啟行程", body: "依序串起抵達、東京、富士、京都和大阪。", label: "開啟行程" },
    ],
    badges: { fastest: "最快", easiest: "最簡單", cheapest: "最便宜" },
    bestFor: {
      fastest: "適合想在落地後最快抵達的旅客。",
      cheapest: "適合行李少、想控制費用時。",
      luggageLate: "適合行李多、家庭或疲憊的晚到。",
      luggage: "適合行李方便度比速度更重要時。",
      default: "適合想要更單純的抵達方式時。",
    },
    pros: "優點",
    cons: "注意點",
    helperBoth: "Klook 適合預訂具體票券。Omio 適合比較列車、巴士與路線。",
    helperKlook: "可使用 Klook 預訂這個交通商品。",
    noBooking: "不需預訂",
    noBookingIc: "不需預訂 - 使用 IC card",
    preBook: "需要時請事先預訂",
    actionDefault: "預訂或比較這條路線",
    compareRouteTitle: "還不確定哪種交通最好？",
    compareRouteBody: "預訂前比較列車、巴士與路線選項。",
  },
  "zh-CN": {
    breadcrumb: "机场交通",
    recommended: "推荐",
    luggageNote: "行李提示",
    lateArrival: "晚到",
    quickAnswer: "快速答案",
    compareTitle: "比较你的选项",
    compareBody: "按最重要的速度、方便度或费用整理。",
    fareDisclaimer: "票价和所需时间为概算，可能因日期、供应商、服务类型和预订渠道而改变。预订前请确认最新价格和时刻。",
    luggageLabel: "行李提示",
    luggageBody: "有两件以上大型行李时，请优先选直达列车或巴士，而不是最便宜的换乘。车站楼梯和高峰时段站台才是隐藏成本。",
    lateQuestion: "晚到吗？",
    arrivalTitle: "按抵达路线选择酒店区域",
    arrivalCta: "选择住宿区域",
    nextCards: [
      { title: "选择住宿区域", body: "把第一晚酒店区域和机场路线搭配起来。", label: "打开指南" },
      { title: "获取日本 eSIM", body: "落地前准备好地图、翻译和交通。", label: "获取 eSIM" },
      { title: "确认新干线座位", body: "铁路日前找到富士山侧座位。", label: "打开查询" },
      { title: "打开行程", body: "依次串起抵达、东京、富士、京都和大阪。", label: "打开行程" },
    ],
    badges: { fastest: "最快", easiest: "最简单", cheapest: "最便宜" },
    bestFor: {
      fastest: "适合想在落地后最快抵达的旅客。",
      cheapest: "适合行李少、想控制费用时。",
      luggageLate: "适合行李多、家庭或疲惫的晚到。",
      luggage: "适合行李方便度比速度更重要时。",
      default: "适合想要更简单的抵达方式时。",
    },
    pros: "优点",
    cons: "注意点",
    helperBoth: "Klook 适合预订具体票券。Omio 适合比较列车、巴士和路线。",
    helperKlook: "可使用 Klook 预订这个交通产品。",
    noBooking: "不需预订",
    noBookingIc: "不需预订 - 使用 IC card",
    preBook: "需要时请事先预订",
    actionDefault: "预订或比较这条路线",
    compareRouteTitle: "还不确定哪种交通最好？",
    compareRouteBody: "预订前比较列车、巴士和路线选项。",
  },
  fr: {
    breadcrumb: "Transferts aeroport",
    recommended: "Recommande",
    luggageNote: "Note bagages",
    lateArrival: "Arrivee tardive",
    quickAnswer: "Reponse rapide",
    compareTitle: "Comparez vos options",
    compareBody: "Trie selon ce qui compte le plus : vitesse, facilite ou cout.",
    fareDisclaimer: "Les tarifs et temps de trajet sont approximatifs et peuvent changer selon la date, le prestataire, le type de service et le canal de reservation. Verifiez toujours le prix et l'horaire avant de reserver.",
    luggageLabel: "Note bagages",
    luggageBody: "Avec deux grosses valises ou plus, privilegiez trains ou bus directs plutot que le transfert le moins cher. Les escaliers en gare et les quais en heure de pointe sont le cout cache.",
    lateQuestion: "Arrivee tardive ?",
    arrivalTitle: "Choisissez votre quartier d'hotel autour de la route d'arrivee",
    arrivalCta: "Choisir le quartier",
    nextCards: [
      { title: "Choisir le quartier", body: "Reliez votre premier hotel a la route depuis l'aeroport.", label: "Ouvrir le guide" },
      { title: "Obtenir une eSIM Japon", body: "Preparez cartes, traduction et transport avant l'atterrissage.", label: "Obtenir eSIM" },
      { title: "Verifier le siege Shinkansen", body: "Trouvez le cote Fuji avant votre jour de train.", label: "Ouvrir l'outil" },
      { title: "Ouvrir l'itineraire", body: "Reliez arrivee, Tokyo, Fuji, Kyoto et Osaka dans l'ordre.", label: "Ouvrir" },
    ],
    badges: { fastest: "Le plus rapide", easiest: "Le plus simple", cheapest: "Le moins cher" },
    bestFor: {
      fastest: "Ideal si vous voulez l'itineraire le plus rapide apres l'atterrissage.",
      cheapest: "Ideal si vous voyagez leger et voulez reduire les couts.",
      luggageLate: "Ideal pour bagages lourds, familles ou arrivees tardives fatiguees.",
      luggage: "Ideal si la facilite avec les bagages compte plus que la vitesse.",
      default: "Ideal si vous voulez une arrivee plus simple.",
    },
    pros: "Avantages",
    cons: "Inconvenients",
    helperBoth: "Utilisez Klook pour reserver un billet precis. Utilisez Omio pour comparer trains, bus et routes.",
    helperKlook: "Utilisez Klook pour reserver ce produit de transport.",
    noBooking: "Reservation non necessaire",
    noBookingIc: "Reservation non necessaire - utilisez IC card",
    preBook: "Reservez a l'avance si besoin",
    actionDefault: "Reserver ou comparer cette route",
    compareRouteTitle: "Vous ne savez pas quel transfert choisir ?",
    compareRouteBody: "Comparez trains, bus et options de route avant de reserver.",
  },
  de: {
    breadcrumb: "Flughafentransfers",
    recommended: "Empfohlen",
    luggageNote: "Gepaeckhinweis",
    lateArrival: "Spaete Ankunft",
    quickAnswer: "Kurzantwort",
    compareTitle: "Optionen vergleichen",
    compareBody: "Sortiert nach dem, was zaehlt: Tempo, Einfachheit oder Kosten.",
    fareDisclaimer: "Fahrpreise und Zeiten sind ungefaehr und koennen je nach Datum, Anbieter, Serviceart und Buchungskanal variieren. Pruefe vor der Buchung immer aktuelle Preise und Fahrplaene.",
    luggageLabel: "Gepaeckhinweis",
    luggageBody: "Mit zwei oder mehr grossen Koffern sind Direktzuege oder Busse oft besser als der billigste Transfer. Bahnhofstreppen und Rush-Hour-Bahnsteige sind die versteckten Kosten.",
    lateQuestion: "Spaete Ankunft?",
    arrivalTitle: "Waehle die Hotelgegend passend zur Ankunftsroute",
    arrivalCta: "Gegend waehlen",
    nextCards: [
      { title: "Gegend waehlen", body: "Passe die erste Hotelgegend an deine Flughafenroute an.", label: "Guide oeffnen" },
      { title: "Japan eSIM holen", body: "Karten, Uebersetzung und Transit vor der Landung einrichten.", label: "eSIM holen" },
      { title: "Shinkansen-Sitz pruefen", body: "Finde die Fuji-Seite vor deinem Bahntag.", label: "Checker oeffnen" },
      { title: "Route oeffnen", body: "Ankunft, Tokyo, Fuji, Kyoto und Osaka in Reihenfolge verbinden.", label: "Route oeffnen" },
    ],
    badges: { fastest: "Schnellste", easiest: "Einfachste", cheapest: "Guensigste" },
    bestFor: {
      fastest: "Am besten, wenn du nach der Landung die schnellste Route willst.",
      cheapest: "Am besten, wenn du leicht reist und Kosten sparen willst.",
      luggageLate: "Am besten fuer viel Gepaeck, Familien oder muede spaete Ankuenfte.",
      luggage: "Am besten, wenn Gepaeckkomfort wichtiger ist als Geschwindigkeit.",
      default: "Am besten, wenn du eine einfachere Ankunft willst.",
    },
    pros: "Vorteile",
    cons: "Nachteile",
    helperBoth: "Nutze Klook fuer konkrete Tickets. Nutze Omio zum Vergleich von Zuegen, Bussen und Routen.",
    helperKlook: "Nutze Klook, um dieses Transportprodukt zu buchen.",
    noBooking: "Keine Buchung noetig",
    noBookingIc: "Keine Buchung noetig - IC card nutzen",
    preBook: "Bei Bedarf vorbuchen",
    actionDefault: "Diese Route buchen oder vergleichen",
    compareRouteTitle: "Noch unsicher, welcher Transfer passt?",
    compareRouteBody: "Vergleiche Zuege, Busse und Routenoptionen vor der Buchung.",
  },
  ru: {
    breadcrumb: "Трансферы из аэропорта",
    recommended: "Рекомендуется",
    luggageNote: "Про багаж",
    lateArrival: "Поздний прилет",
    quickAnswer: "Короткий ответ",
    compareTitle: "Сравните варианты",
    compareBody: "Сортировано по главному: скорость, простота или стоимость.",
    fareDisclaimer: "Тарифы и время в пути приблизительные и могут меняться по дате, провайдеру, типу сервиса и каналу бронирования. Всегда проверяйте актуальную цену и расписание перед бронированием.",
    luggageLabel: "Про багаж",
    luggageBody: "С двумя и более большими чемоданами выбирайте прямые поезда или автобусы вместо самого дешевого трансфера. Лестницы на станциях и платформы в час пик — скрытая цена.",
    lateQuestion: "Поздний прилет?",
    arrivalTitle: "Выберите район отеля под ваш маршрут прибытия",
    arrivalCta: "Выбрать район",
    nextCards: [
      { title: "Выбрать район", body: "Свяжите первый район отеля с маршрутом из аэропорта.", label: "Открыть гид" },
      { title: "Получить eSIM Япония", body: "Настройте карты, перевод и транспорт до посадки.", label: "Получить eSIM" },
      { title: "Проверить место в синкансэне", body: "Найдите сторону Фудзи до дня поездки.", label: "Открыть проверку" },
      { title: "Открыть маршрут", body: "Соедините прилет, Токио, Фудзи, Киото и Осаку по порядку.", label: "Открыть маршрут" },
    ],
    badges: { fastest: "Самый быстрый", easiest: "Самый простой", cheapest: "Самый дешевый" },
    bestFor: {
      fastest: "Лучше для тех, кто хочет самый быстрый маршрут после прилета.",
      cheapest: "Лучше, если вы едете налегке и хотите снизить расходы.",
      luggageLate: "Лучше для тяжелого багажа, семей или уставших поздних прилетов.",
      luggage: "Лучше, если удобство с багажом важнее скорости.",
      default: "Лучше, если нужен более простой вариант прибытия.",
    },
    pros: "Плюсы",
    cons: "Минусы",
    helperBoth: "Klook — для бронирования конкретного билета. Omio — для сравнения поездов, автобусов и маршрутов.",
    helperKlook: "Используйте Klook для бронирования этого транспортного продукта.",
    noBooking: "Бронирование не нужно",
    noBookingIc: "Бронирование не нужно - используйте IC card",
    preBook: "Забронируйте заранее при необходимости",
    actionDefault: "Забронировать или сравнить маршрут",
    compareRouteTitle: "Не уверены, какой трансфер лучше?",
    compareRouteBody: "Сравните поезда, автобусы и варианты маршрутов перед бронированием.",
  },
};

const routeNames: Record<AirportLocale, Record<string, string>> = {
  en: {},
  "pt-BR": { options: "opcoes de traslado", guide: "guia de chegada tarde" },
  es: { options: "opciones de traslado", guide: "guia de llegada tarde" },
  ko: { options: "공항 이동 옵션", guide: "늦은 도착 가이드" },
  "zh-TW": { options: "機場交通選項", guide: "晚到指南" },
  "zh-CN": { options: "机场交通选项", guide: "晚到指南" },
  fr: { options: "options de transfert", guide: "guide arrivee tardive" },
  de: { options: "Transferoptionen", guide: "Guide fuer spaete Ankunft" },
  ru: { options: "варианты трансфера", guide: "гид для позднего прилета" },
};

const routeSpecificCopy: Record<string, Partial<Record<AirportLocale, { quickTitle: string; quickBody: string; luggageNote: string; arrivalSetupBody: string }>>> = {
  "narita-to-shinjuku": {
    "pt-BR": {
      quickTitle: "A maioria dos viajantes deve comecar pelo Narita Express.",
      quickBody: "Ele e direto, reservado, bom para bagagem e evita baldeacoes. Se seu hotel fica perto de uma parada do limousine bus ou voce tem muita bagagem, o bus pode ser mais facil.",
      luggageNote: "Com duas ou mais malas grandes, compare N'EX e Limousine Bus pelo lado exato do seu hotel em Shinjuku.",
      arrivalSetupBody: "Antes de reservar hotel em Shinjuku, veja se ele fica mais perto de Shinjuku Station, Busta Shinjuku, Nishi-Shinjuku ou da area East Exit/Kabukicho.",
    },
    es: {
      quickTitle: "La mayoria deberia empezar con Narita Express.",
      quickBody: "Es directo, con asiento reservado, comodo con equipaje y evita transbordos. Si tu hotel esta cerca de una parada de limousine bus o llevas mucho equipaje, el bus puede ser mas facil.",
      luggageNote: "Con dos o mas maletas grandes, compara N'EX y Limousine Bus segun el lado exacto de tu hotel en Shinjuku.",
      arrivalSetupBody: "Antes de reservar hotel en Shinjuku, revisa si esta mas cerca de Shinjuku Station, Busta Shinjuku, Nishi-Shinjuku o la zona East Exit/Kabukicho.",
    },
    ko: {
      quickTitle: "대부분은 Narita Express부터 비교하는 것이 좋습니다.",
      quickBody: "직통, 지정석, 짐 이동이 편하고 환승을 피할 수 있습니다. 호텔이 리무진 버스 정류장 근처이거나 짐이 많다면 버스가 더 쉬울 수 있습니다.",
      luggageNote: "큰 짐이 두 개 이상이면 정확한 신주쿠 호텔 위치를 기준으로 N'EX와 Limousine Bus를 비교하세요.",
      arrivalSetupBody: "신주쿠 호텔을 예약하기 전에 Shinjuku Station, Busta Shinjuku, Nishi-Shinjuku, East Exit/Kabukicho 중 어디에 가까운지 확인하세요.",
    },
    "zh-TW": {
      quickTitle: "多數旅客可以先看 Narita Express。",
      quickBody: "它直達、有指定席、行李友善，也能避免轉乘。如果飯店靠近利木津巴士站或行李很多，巴士可能更輕鬆。",
      luggageNote: "有兩件以上大型行李時，請依新宿飯店的實際位置比較 N'EX 與利木津巴士。",
      arrivalSetupBody: "預訂新宿飯店前，確認飯店更靠近 Shinjuku Station、Busta Shinjuku、Nishi-Shinjuku，還是 East Exit/Kabukicho。",
    },
    "zh-CN": {
      quickTitle: "多数旅客可以先看 Narita Express。",
      quickBody: "它直达、有指定席、行李友好，也能避免换乘。如果酒店靠近利木津巴士站或行李很多，巴士可能更轻松。",
      luggageNote: "有两件以上大型行李时，请按新宿酒店的实际位置比较 N'EX 和利木津巴士。",
      arrivalSetupBody: "预订新宿酒店前，确认酒店更靠近 Shinjuku Station、Busta Shinjuku、Nishi-Shinjuku，还是 East Exit/Kabukicho。",
    },
    fr: {
      quickTitle: "La plupart des voyageurs devraient commencer par le Narita Express.",
      quickBody: "Il est direct, reserve, pratique avec les bagages et evite les correspondances. Si votre hotel est pres d'un arret de limousine bus ou si vous avez beaucoup de bagages, le bus peut etre plus simple.",
      luggageNote: "Avec deux grosses valises ou plus, comparez N'EX et Limousine Bus selon le cote exact de votre hotel a Shinjuku.",
      arrivalSetupBody: "Avant de reserver a Shinjuku, verifiez si l'hotel est plus proche de Shinjuku Station, Busta Shinjuku, Nishi-Shinjuku ou du cote East Exit/Kabukicho.",
    },
    de: {
      quickTitle: "Die meisten Reisenden sollten mit dem Narita Express beginnen.",
      quickBody: "Er ist direkt, reserviert, gepaeckfreundlich und vermeidet Umstiege. Liegt dein Hotel nahe einer Limousine-Bus-Haltestelle oder hast du viel Gepaeck, kann der Bus einfacher sein.",
      luggageNote: "Mit zwei oder mehr grossen Koffern vergleiche N'EX und Limousine Bus anhand der genauen Hotelseite in Shinjuku.",
      arrivalSetupBody: "Pruefe vor der Hotelbuchung in Shinjuku, ob dein Hotel naeher an Shinjuku Station, Busta Shinjuku, Nishi-Shinjuku oder East Exit/Kabukicho liegt.",
    },
    ru: {
      quickTitle: "Большинству путешественников стоит начать с Narita Express.",
      quickBody: "Он прямой, с резервированными местами, удобен с багажом и без пересадок. Если отель рядом с остановкой limousine bus или багажа много, автобус может быть проще.",
      luggageNote: "С двумя и более большими чемоданами сравните N'EX и Limousine Bus по точной стороне вашего отеля в Синдзюку.",
      arrivalSetupBody: "Перед бронированием отеля в Синдзюку проверьте, ближе ли он к Shinjuku Station, Busta Shinjuku, Nishi-Shinjuku или East Exit/Kabukicho.",
    },
  },
  "haneda-to-shinjuku": {
    es: { quickTitle: "La mayoria puede elegir tren o limousine bus.", quickBody: "Haneda esta mas cerca que Narita. Los trenes son rapidos y economicos; el bus es mas facil si tu hotel esta cerca de una parada o llevas maletas grandes.", luggageNote: "Haneda esta lo bastante cerca como para que bus o taxi merezcan la pena si llegas cansado con maletas grandes.", arrivalSetupBody: "Haneda es facil, pero la ubicacion del hotel en Shinjuku sigue importando. Paradas de bus y salidas de estacion pueden cambiar la mejor ruta." },
    "pt-BR": { quickTitle: "A maioria pode escolher trem ou limousine bus.", quickBody: "Haneda fica mais perto que Narita. Trens sao rapidos e economicos; o bus e mais facil se seu hotel fica perto de uma parada ou voce tem malas grandes.", luggageNote: "Haneda e perto o bastante para bus ou taxi valerem a pena quando voce chega cansado com malas grandes.", arrivalSetupBody: "Haneda e facil, mas a localizacao do hotel em Shinjuku ainda importa. Paradas de bus e saidas da estacao podem mudar a rota mais facil." },
    ko: { quickTitle: "대부분은 전철 또는 리무진 버스를 고르면 됩니다.", quickBody: "하네다는 나리타보다 가깝습니다. 전철은 빠르고 저렴하며, 호텔이 정류장 근처이거나 큰 짐이 있으면 버스가 더 쉽습니다.", luggageNote: "하네다는 가까워서 큰 짐을 들고 피곤하게 도착했다면 버스나 택시도 고려할 만합니다.", arrivalSetupBody: "하네다는 쉽지만 신주쿠 호텔 위치는 여전히 중요합니다. 버스 정류장과 역 출구에 따라 쉬운 경로가 달라집니다." },
    "zh-TW": { quickTitle: "多數旅客可選電車或利木津巴士。", quickBody: "羽田比成田近。電車快速且便宜；如果飯店靠近巴士站或有大型行李，巴士更輕鬆。", luggageNote: "羽田距離夠近，帶大型行李且很累時，巴士或計程車也值得考慮。", arrivalSetupBody: "羽田很方便，但新宿飯店位置仍然重要。巴士站和車站出口會改變最簡單的路線。" },
    "zh-CN": { quickTitle: "多数旅客可选电车或利木津巴士。", quickBody: "羽田比成田近。电车快速且便宜；如果酒店靠近巴士站或有大型行李，巴士更轻松。", luggageNote: "羽田距离够近，带大型行李且很累时，巴士或出租车也值得考虑。", arrivalSetupBody: "羽田很方便，但新宿酒店位置仍然重要。巴士站和车站出口会改变最简单的路线。" },
    fr: { quickTitle: "La plupart peuvent choisir train ou limousine bus.", quickBody: "Haneda est plus proche que Narita. Les trains sont rapides et abordables; le bus est plus simple si votre hotel est pres d'un arret ou si vous avez de gros bagages.", luggageNote: "Haneda est assez proche pour que bus ou taxi valent la peine avec de grosses valises et de la fatigue.", arrivalSetupBody: "Haneda est facile, mais l'emplacement de l'hotel a Shinjuku compte encore. Arrets de bus et sorties de gare peuvent changer la meilleure route." },
    de: { quickTitle: "Die meisten koennen Zug oder Limousine Bus waehlen.", quickBody: "Haneda liegt naeher als Narita. Zuege sind schnell und guenstig; der Bus ist einfacher, wenn dein Hotel nahe einer Haltestelle liegt oder du grosses Gepaeck hast.", luggageNote: "Haneda ist nah genug, dass Bus oder Taxi mit grossen Koffern und Muedigkeit sinnvoll sein koennen.", arrivalSetupBody: "Haneda ist einfach, aber die Lage deines Hotels in Shinjuku bleibt wichtig. Bushaltestellen und Bahnhofsausgaenge koennen die beste Route aendern." },
    ru: { quickTitle: "Большинство может выбрать поезд или limousine bus.", quickBody: "Ханэда ближе Нариты. Поезда быстрые и недорогие, а автобус проще, если отель рядом с остановкой или у вас крупный багаж.", luggageNote: "Ханэда достаточно близко, поэтому автобус или такси могут быть разумны при усталости и больших чемоданах.", arrivalSetupBody: "Ханэда удобна, но расположение отеля в Синдзюку все равно важно. Остановки автобусов и выходы станции могут изменить лучший маршрут." },
  },
  "kansai-airport-to-kyoto": {
    es: { quickTitle: "La mayoria deberia empezar con JR Haruka.", quickBody: "Es la ruta en tren mas sencilla a Kyoto Station. Bus de aeropuerto o transfer privado puede ser mas facil con mucho equipaje o llegadas tardias.", luggageNote: "Si llegas tarde o llevas varias maletas grandes, compara Haruka con bus y transfer privado antes de decidir.", arrivalSetupBody: "Si llegas a Kansai Airport y vas directo a Kyoto, alojarte cerca de Kyoto Station puede reducir el estres de la primera noche." },
    "pt-BR": { quickTitle: "A maioria deve comecar pelo JR Haruka.", quickBody: "E a rota de trem mais simples para Kyoto Station. Onibus de aeroporto ou transfer privado pode ser mais facil com muita bagagem ou chegada tarde.", luggageNote: "Se voce chega tarde ou leva varias malas grandes, compare Haruka com bus e transfer privado antes de decidir.", arrivalSetupBody: "Se voce chega em Kansai Airport e vai direto para Kyoto, ficar perto de Kyoto Station reduz o estresse da primeira noite." },
    ko: { quickTitle: "대부분은 JR Haruka부터 보는 것이 좋습니다.", quickBody: "Kyoto Station까지 가장 단순한 열차 경로입니다. 짐이 많거나 늦게 도착하면 공항버스나 private transfer가 더 쉬울 수 있습니다.", luggageNote: "늦게 도착하거나 큰 짐이 여러 개라면 Haruka와 공항버스, private transfer를 비교하세요.", arrivalSetupBody: "Kansai Airport에서 바로 교토로 간다면 Kyoto Station 근처 숙박이 첫날 밤 짐 스트레스를 줄입니다." },
    "zh-TW": { quickTitle: "多數旅客可以先看 JR Haruka。", quickBody: "這是到 Kyoto Station 最單純的列車路線。行李很多或晚到時，機場巴士或私人接送可能更輕鬆。", luggageNote: "如果晚到或有多件大型行李，決定前請比較 Haruka、機場巴士與私人接送。", arrivalSetupBody: "如果抵達 Kansai Airport 後直接去京都，住在 Kyoto Station 附近可減少第一晚行李壓力。" },
    "zh-CN": { quickTitle: "多数旅客可以先看 JR Haruka。", quickBody: "这是到 Kyoto Station 最简单的列车路线。行李很多或晚到时，机场巴士或私人接送可能更轻松。", luggageNote: "如果晚到或有多件大型行李，决定前请比较 Haruka、机场巴士和私人接送。", arrivalSetupBody: "如果抵达 Kansai Airport 后直接去京都，住在 Kyoto Station 附近可减少第一晚行李压力。" },
    fr: { quickTitle: "La plupart devraient commencer par JR Haruka.", quickBody: "C'est la route en train la plus simple vers Kyoto Station. Bus aeroport ou transfert prive peut etre plus facile avec beaucoup de bagages ou une arrivee tardive.", luggageNote: "Si vous arrivez tard ou avec plusieurs grosses valises, comparez Haruka, bus et transfert prive avant de choisir.", arrivalSetupBody: "Si vous arrivez a Kansai Airport et partez directement a Kyoto, dormir pres de Kyoto Station peut reduire le stress des bagages la premiere nuit." },
    de: { quickTitle: "Die meisten sollten mit JR Haruka beginnen.", quickBody: "Das ist die einfachste Zugroute nach Kyoto Station. Flughafenbus oder privater Transfer kann mit viel Gepaeck oder spaeter Ankunft einfacher sein.", luggageNote: "Bei spaeter Ankunft oder mehreren grossen Koffern vergleiche Haruka mit Bus und privatem Transfer.", arrivalSetupBody: "Wenn du am Kansai Airport landest und direkt nach Kyoto faehrst, reduziert ein Hotel nahe Kyoto Station den Gepaeckstress der ersten Nacht." },
    ru: { quickTitle: "Большинству стоит начать с JR Haruka.", quickBody: "Это самый простой поезд до Kyoto Station. Автобус аэропорта или частный трансфер могут быть проще с большим багажом или поздним прилетом.", luggageNote: "Если вы прилетаете поздно или с несколькими большими чемоданами, сравните Haruka с автобусом и частным трансфером.", arrivalSetupBody: "Если вы прилетаете в Kansai Airport и сразу едете в Киото, проживание рядом с Kyoto Station снизит стресс с багажом в первую ночь." },
  },
};

export function getAirportTransferHubCopy(locale?: string): HubCopy {
  return hubCopies[normalizeLocale(locale)];
}

export function getAirportRouteUiCopy(locale?: string): RouteUiCopy {
  return routeUiCopies[normalizeLocale(locale)];
}

export function localizedRouteTitle(page: TransferPage, locale?: string) {
  const loc = normalizeLocale(locale);
  if (loc === "en") return page.title;
  const label = page.slug.includes("late-arrival") ? routeNames[loc].guide : routeNames[loc].options;
  return `${page.from} → ${page.to} — ${label}`;
}

export function localizedRouteDescription(page: TransferPage, locale?: string) {
  const loc = normalizeLocale(locale);
  if (loc === "en") return page.description;
  const map: Record<AirportLocale, string> = {
    en: page.description,
    "pt-BR": `Compare as principais opcoes de transporte de ${page.from} para ${page.to}, com dicas de bagagem, chegada tarde e escolha de area do hotel.`,
    es: `Compara las principales opciones de transporte de ${page.from} a ${page.to}, con consejos de equipaje, llegada tarde y zona de hotel.`,
    ko: `${page.from}에서 ${page.to}까지 주요 이동 옵션을 비교하고, 짐, 늦은 도착, 호텔 지역 선택 팁을 확인하세요.`,
    "zh-TW": `比較從 ${page.from} 到 ${page.to} 的主要交通選項，包含行李、晚到與飯店區域提示。`,
    "zh-CN": `比较从 ${page.from} 到 ${page.to} 的主要交通选项，包含行李、晚到和酒店区域提示。`,
    fr: `Comparez les principales options de transport de ${page.from} a ${page.to}, avec conseils bagages, arrivee tardive et quartier d'hotel.`,
    de: `Vergleiche die wichtigsten Transportoptionen von ${page.from} nach ${page.to}, mit Tipps zu Gepaeck, spaeter Ankunft und Hotelgegend.`,
    ru: `Сравните основные варианты транспорта из ${page.from} в ${page.to}, с советами по багажу, позднему прилету и району отеля.`,
  };
  return map[loc];
}

export function localizedLateArrivalNote(page: TransferPage, locale?: string) {
  const loc = normalizeLocale(locale);
  if (loc === "en") return page.lateArrivalNote;
  const map: Record<AirportLocale, string> = {
    en: page.lateArrivalNote,
    "pt-BR": `Para chegada tarde em ${page.to}, confirme os ultimos trens e onibus antes do voo. Se houver risco de perder o ultimo servico, considere hotel perto do aeroporto ou transfer privado.`,
    es: `Para una llegada tarde a ${page.to}, confirma los ultimos trenes y buses antes del vuelo. Si hay riesgo de perder el ultimo servicio, considera hotel de aeropuerto o transfer privado.`,
    ko: `${page.to}에 늦게 도착하는 경우 비행 전 막차와 마지막 버스를 확인하세요. 마지막 교통편을 놓칠 위험이 있으면 공항 근처 숙박이나 private transfer를 고려하세요.`,
    "zh-TW": `如果晚到 ${page.to}，請在出發前確認末班列車與巴士。若有錯過末班的風險，請考慮機場附近住宿或私人接送。`,
    "zh-CN": `如果晚到 ${page.to}，请在出发前确认末班列车和巴士。若有错过末班的风险，请考虑机场附近住宿或私人接送。`,
    fr: `Pour une arrivee tardive a ${page.to}, verifiez les derniers trains et bus avant le vol. S'il y a un risque de manquer le dernier service, envisagez un hotel aeroport ou un transfert prive.`,
    de: `Bei spaeter Ankunft in ${page.to} pruefe letzte Zuege und Busse vor dem Flug. Wenn du den letzten Service verpassen koenntest, plane ein Flughafenhotel oder einen privaten Transfer.`,
    ru: `При позднем прибытии в ${page.to} проверьте последние поезда и автобусы до вылета. Если есть риск не успеть, рассмотрите отель у аэропорта или частный трансфер.`,
  };
  return map[loc];
}

export function localizedProTip(page: TransferPage, locale?: string) {
  const loc = normalizeLocale(locale);
  if (loc === "en") return page.proTip;
  const map: Record<AirportLocale, string> = {
    en: page.proTip,
    "pt-BR": `Dica: escolha a rota de ${page.from} para ${page.to} pensando no lado exato do hotel, quantidade de malas e horario de chegada. A opcao mais barata nem sempre e a mais facil no primeiro dia.`,
    es: `Consejo: elige la ruta de ${page.from} a ${page.to} segun el lado exacto del hotel, cantidad de maletas y hora de llegada. La opcion mas barata no siempre es la mas facil el primer dia.`,
    ko: `팁: ${page.from}에서 ${page.to}까지의 경로는 호텔의 정확한 위치, 짐의 양, 도착 시간 기준으로 고르세요. 첫날에는 가장 저렴한 선택이 항상 가장 쉬운 선택은 아닙니다.`,
    "zh-TW": `提示：選擇 ${page.from} 到 ${page.to} 的路線時，請看飯店實際位置、行李量與抵達時間。第一天最便宜的選項不一定最輕鬆。`,
    "zh-CN": `提示：选择 ${page.from} 到 ${page.to} 的路线时，请看酒店实际位置、行李量和抵达时间。第一天最便宜的选项不一定最轻松。`,
    fr: `Conseil : choisissez la route de ${page.from} a ${page.to} selon le cote exact de l'hotel, le volume de bagages et l'heure d'arrivee. Le moins cher n'est pas toujours le plus simple le premier jour.`,
    de: `Tipp: Waehle die Route von ${page.from} nach ${page.to} nach genauer Hotellage, Gepaeckmenge und Ankunftszeit. Die guenstigste Option ist am ersten Tag nicht immer die einfachste.`,
    ru: `Совет: выбирайте маршрут из ${page.from} в ${page.to} с учетом точной стороны отеля, количества багажа и времени прилета. В первый день самый дешевый вариант не всегда самый простой.`,
  };
  return map[loc];
}

export function routeSpecific(locale: string | undefined, slug: string) {
  const loc = normalizeLocale(locale);
  return routeSpecificCopy[slug]?.[loc];
}

export function localizeTripPick(pick: TripPick, locale?: string): TripPick {
  const loc = normalizeLocale(locale);
  if (loc === "en") return pick;
  const generic: Record<string, Partial<Record<AirportLocale, Pick<TripPick, "title" | "description" | "cta">>>> = {
    esim: {
      "pt-BR": { title: "Comprar eSIM do Japao", description: "Ative antes de pousar para mapas, traducao e horarios.", cta: "Comprar eSIM" },
      es: { title: "Comprar eSIM de Japon", description: "Activalo antes de aterrizar para mapas, traduccion y horarios.", cta: "Comprar eSIM" },
      ko: { title: "일본 eSIM 받기", description: "지도, 번역, 실시간 시간표를 위해 도착 전에 준비하세요.", cta: "eSIM 받기" },
      "zh-TW": { title: "取得日本 eSIM", description: "落地前準備好地圖、翻譯與時刻查詢。", cta: "取得 eSIM" },
      "zh-CN": { title: "获取日本 eSIM", description: "落地前准备好地图、翻译和时刻查询。", cta: "获取 eSIM" },
      fr: { title: "Obtenir une eSIM Japon", description: "Activez-la avant l'atterrissage pour cartes, traduction et horaires.", cta: "Obtenir eSIM" },
      de: { title: "Japan eSIM holen", description: "Vor der Landung fuer Karten, Uebersetzung und Fahrplaene aktivieren.", cta: "eSIM holen" },
      ru: { title: "Получить eSIM для Японии", description: "Активируйте до прилета для карт, перевода и расписаний.", cta: "Получить eSIM" },
    },
    transfer: {
      "pt-BR": { title: "Reservar traslado de aeroporto", description: "Compare trem, onibus e transfer privado.", cta: "Comparar traslados" },
      es: { title: "Reservar traslado de aeropuerto", description: "Compara tren, bus y transfer privado.", cta: "Comparar traslados" },
      ko: { title: "공항 교통 예약", description: "열차, 버스, private transfer를 비교하세요.", cta: "교통 비교" },
      "zh-TW": { title: "預訂機場交通", description: "比較列車、巴士與私人接送。", cta: "比較交通" },
      "zh-CN": { title: "预订机场交通", description: "比较列车、巴士和私人接送。", cta: "比较交通" },
      fr: { title: "Reserver le transfert aeroport", description: "Comparez train, bus et transfert prive.", cta: "Comparer" },
      de: { title: "Flughafentransfer buchen", description: "Vergleiche Zug, Bus und privaten Transfer.", cta: "Vergleichen" },
      ru: { title: "Забронировать трансфер", description: "Сравните поезд, автобус и частный трансфер.", cta: "Сравнить" },
    },
    "stay-tokyo": {
      "pt-BR": { title: "Onde ficar em Tokyo", description: "Compare areas de Tokyo conforme sua chegada.", cta: "Comparar areas" },
      es: { title: "Donde alojarse en Tokyo", description: "Compara zonas de Tokyo segun tu llegada.", cta: "Comparar zonas" },
      ko: { title: "도쿄 어디에 머물까", description: "도착 경로에 맞춰 도쿄 지역을 비교하세요.", cta: "지역 비교" },
      "zh-TW": { title: "東京住哪裡", description: "依抵達路線比較東京住宿區域。", cta: "比較區域" },
      "zh-CN": { title: "东京住哪里", description: "按抵达路线比较东京住宿区域。", cta: "比较区域" },
      fr: { title: "Ou dormir a Tokyo", description: "Comparez les quartiers selon votre arrivee.", cta: "Comparer" },
      de: { title: "Wo in Tokyo uebernachten", description: "Vergleiche Gegenden passend zur Ankunft.", cta: "Gegenden vergleichen" },
      ru: { title: "Где жить в Токио", description: "Сравните районы Токио под маршрут прилета.", cta: "Сравнить районы" },
    },
  };
  return { ...pick, ...(generic[pick.id]?.[loc] ?? generic[pick.category]?.[loc] ?? {}) };
}
