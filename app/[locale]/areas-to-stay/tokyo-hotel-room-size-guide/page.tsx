import type { Metadata } from "next";
import { Ruler, SearchCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { SiteFooter } from "@/components/content/SiteFooter";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { AdSlot } from "@/components/ads/AdSlot";
import { getAlternates } from "@/i18n/hreflang";
import { SiteHeader } from "../../components/SiteHeader";

type Props = {
  params: Promise<{ locale: string }>;
};

const pagePath = "/areas-to-stay/tokyo-hotel-room-size-guide";

type RoomSizeCopy = {
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
  rangesTitle: string;
  roomRanges: Array<[string, string]>;
  nuance: string;
  checkTitle: string;
  bookingChecks: string[];
  areaTitle: string;
  areaBody: string;
  planningTitle: string;
  planningBody: string;
  stayGuideLink: string;
  continueTitle: string;
  continueLinks: Array<[string, string]>;
};

const roomSizeCopyByLocale: Record<string, RoomSizeCopy> = {
  en: {
    metadataTitle: "Tokyo Hotel Room Size Guide: How Small Is Too Small?",
    metadataDescription:
      "Tokyo hotel rooms can feel compact with luggage. Learn what room sizes mean for two travelers, families, large suitcases, and Tokyo hotel-base planning.",
    breadcrumbHome: "Home",
    breadcrumbStay: "Where to stay",
    breadcrumbTokyo: "Tokyo",
    breadcrumbCurrent: "Room size guide",
    eyebrow: "Tokyo hotel planning",
    title: "Tokyo Hotel Room Size Guide: How Small Is Too Small?",
    intro:
      "Tokyo hotel rooms can feel compact compared with hotels or apartments in some countries. Photos can make rooms look easier than they feel once you add suitcases, beds, and a compact bathroom.",
    quickTitle: "Quick answer",
    quickBody:
      "For two travelers, rooms under 18㎡ can feel tight with large suitcases. Around 22-26㎡ is usually workable, and 30㎡+ is generally comfortable for two by Tokyo hotel standards. For families or 3-4 travelers, room type and bed setup matter more than area name alone.",
    rangesTitle: "Room size ranges for Tokyo hotels",
    roomRanges: [
      ["Under 18㎡", "Very compact for two travelers with large luggage."],
      ["19-22㎡", "Workable for short stays, but still compact if you have two large suitcases."],
      ["23-26㎡", "Safer for two travelers who want to open luggage more comfortably."],
      ["27-30㎡", "Comfortable by Tokyo hotel standards for two travelers."],
      ["30㎡+", "Generally comfortable for two by Tokyo hotel standards, but not necessarily large by every country's standards."],
      ["35㎡+", "Better for families, groups, long stays, or apartment-style layouts."],
    ],
    nuance: "30㎡+ is comfortable for two by Tokyo hotel standards. It is not universally large, especially if you are comparing it with apartments or hotels in roomier destinations.",
    checkTitle: "What to check before booking",
    bookingChecks: [
      "Room size in square meters",
      "Bed type: double, twin, triple, family room",
      "Number of beds, sofa beds, or futons",
      "Whether large suitcases can be opened",
      "Reviews mentioning small room or luggage",
      "Bathroom layout",
      "Elevator access from station to hotel",
      "Luggage storage before check-in or after check-out",
      "Late check-in availability",
      "Cancellation policy",
      "Street noise or nightlife noise in reviews",
    ],
    areaTitle: "Why room size changes the best Tokyo area",
    areaBody:
      "The best area is not only about attractions. If you have large suitcases, children, older family members, or a long stay, the best hotel area may change because some areas make larger rooms, calmer streets, or easier station access more practical.",
    planningTitle: "How to use this with area planning",
    planningBody:
      "Room size is only one part of the hotel-base decision. Compare it with airport access, Shinkansen plans, luggage, and neighborhood noise before you choose where to book.",
    stayGuideLink: "Open Tokyo stay area guide",
    continueTitle: "Continue planning",
    continueLinks: [
      ["/areas-to-stay/tokyo-first-time", "Tokyo stay area guide"],
      ["/local-hotel-picks", "Local hotel examples"],
      ["/airport-transfers", "Airport transfers"],
      ["/guide", "Shinkansen Seat E guide"],
    ],
  },
  "pt-BR": {
    metadataTitle: "Guia de tamanho de quarto de hotel em Tokyo: quando é pequeno demais?",
    metadataDescription: "Quartos de hotel em Tokyo podem parecer compactos com malas. Entenda tamanhos para casais, famílias, malas grandes e escolha de base em Tokyo.",
    breadcrumbHome: "Início",
    breadcrumbStay: "Onde ficar",
    breadcrumbTokyo: "Tokyo",
    breadcrumbCurrent: "Guia de tamanho de quarto",
    eyebrow: "Planejamento de hotel em Tokyo",
    title: "Guia de tamanho de quarto de hotel em Tokyo: quando é pequeno demais?",
    intro: "Quartos de hotel em Tokyo podem parecer compactos em comparação com hotéis ou apartamentos de alguns países. Fotos podem parecer mais espaçosas antes de você considerar malas, camas e um banheiro compacto.",
    quickTitle: "Resposta rápida",
    quickBody: "Para duas pessoas, quartos abaixo de 18㎡ podem ficar apertados com malas grandes. Cerca de 22-26㎡ costuma funcionar, e 30㎡+ geralmente é confortável para duas pessoas pelos padrões de hotel de Tokyo. Para famílias ou 3-4 viajantes, tipo de quarto e configuração das camas importam mais que o nome da área.",
    rangesTitle: "Faixas de tamanho de quarto em hotéis de Tokyo",
    roomRanges: [
      ["Abaixo de 18㎡", "Muito compacto para duas pessoas com malas grandes."],
      ["19-22㎡", "Funciona para estadias curtas, mas ainda é compacto com duas malas grandes."],
      ["23-26㎡", "Mais seguro para duas pessoas que querem abrir malas com mais conforto."],
      ["27-30㎡", "Confortável pelos padrões de hotel de Tokyo para duas pessoas."],
      ["30㎡+", "Geralmente confortável para duas pessoas pelos padrões de Tokyo, mas não necessariamente grande em todos os países."],
      ["35㎡+", "Melhor para famílias, grupos, estadias longas ou layouts tipo apartamento."],
    ],
    nuance: "30㎡+ é confortável para duas pessoas pelos padrões de hotel de Tokyo. Não é universalmente grande, especialmente se você compara com apartamentos ou hotéis em destinos mais espaçosos.",
    checkTitle: "O que verificar antes de reservar",
    bookingChecks: ["Tamanho do quarto em metros quadrados", "Tipo de cama: casal, twin, triplo, familiar", "Número de camas, sofá-camas ou futons", "Se malas grandes podem ser abertas", "Avaliações mencionando quarto pequeno ou malas", "Layout do banheiro", "Acesso por elevador da estação ao hotel", "Guarda-volumes antes do check-in ou depois do check-out", "Check-in tarde disponível", "Política de cancelamento", "Ruído da rua ou vida noturna nas avaliações"],
    areaTitle: "Por que o tamanho do quarto muda a melhor área em Tokyo",
    areaBody: "A melhor área não depende só das atrações. Com malas grandes, crianças, familiares idosos ou estadia longa, a melhor base pode mudar porque algumas áreas tornam quartos maiores, ruas mais calmas ou acesso mais fácil à estação mais práticos.",
    planningTitle: "Como usar isso no planejamento da área",
    planningBody: "Tamanho do quarto é só uma parte da decisão de base. Compare com acesso ao aeroporto, planos de Shinkansen, bagagem e ruído do bairro antes de escolher onde reservar.",
    stayGuideLink: "Abrir guia de áreas de Tokyo",
    continueTitle: "Continue planejando",
    continueLinks: [["/areas-to-stay/tokyo-first-time", "Guia de áreas de Tokyo"], ["/local-hotel-picks", "Exemplos de hotéis locais"], ["/airport-transfers", "Traslados do aeroporto"], ["/guide", "Guia Seat E do Shinkansen"]],
  },
  es: {
    metadataTitle: "Guía de tamaño de habitación en hoteles de Tokio: ¿cuándo es demasiado pequeña?",
    metadataDescription: "Las habitaciones de hotel en Tokio pueden sentirse compactas con equipaje. Aprende qué significan los tamaños para parejas, familias, maletas grandes y la elección de zona.",
    breadcrumbHome: "Inicio",
    breadcrumbStay: "Dónde alojarse",
    breadcrumbTokyo: "Tokio",
    breadcrumbCurrent: "Guía de tamaño de habitación",
    eyebrow: "Planificación de hotel en Tokio",
    title: "Guía de tamaño de habitación en hoteles de Tokio: ¿cuándo es demasiado pequeña?",
    intro: "Las habitaciones de hotel en Tokio pueden sentirse compactas comparadas con hoteles o apartamentos de algunos países. Las fotos pueden parecer más cómodas antes de sumar maletas, camas y un baño compacto.",
    quickTitle: "Respuesta rápida",
    quickBody: "Para dos viajeros, las habitaciones de menos de 18㎡ pueden sentirse ajustadas con maletas grandes. Alrededor de 22-26㎡ suele funcionar, y 30㎡+ suele ser cómodo para dos según los estándares hoteleros de Tokio. Para familias o 3-4 viajeros, el tipo de habitación y las camas importan más que el nombre de la zona.",
    rangesTitle: "Rangos de tamaño para hoteles en Tokio",
    roomRanges: [["Menos de 18㎡", "Muy compacto para dos viajeros con equipaje grande."], ["19-22㎡", "Funciona para estancias cortas, pero sigue siendo compacto con dos maletas grandes."], ["23-26㎡", "Más seguro para dos viajeros que quieren abrir equipaje con más comodidad."], ["27-30㎡", "Cómodo para dos según los estándares hoteleros de Tokio."], ["30㎡+", "Generalmente cómodo para dos según Tokio, pero no necesariamente grande en todos los países."], ["35㎡+", "Mejor para familias, grupos, estancias largas o diseños tipo apartamento."]],
    nuance: "30㎡+ es cómodo para dos según los estándares hoteleros de Tokio. No es universalmente grande, sobre todo si lo comparas con apartamentos u hoteles en destinos más espaciosos.",
    checkTitle: "Qué revisar antes de reservar",
    bookingChecks: ["Tamaño de habitación en metros cuadrados", "Tipo de cama: doble, twin, triple, familiar", "Número de camas, sofás cama o futones", "Si se pueden abrir maletas grandes", "Reseñas que mencionen habitación pequeña o equipaje", "Distribución del baño", "Acceso con ascensor desde la estación al hotel", "Guardaequipaje antes del check-in o después del check-out", "Disponibilidad de check-in tarde", "Política de cancelación", "Ruido de calle o vida nocturna en reseñas"],
    areaTitle: "Por qué el tamaño de habitación cambia la mejor zona de Tokio",
    areaBody: "La mejor zona no depende solo de las atracciones. Si llevas maletas grandes, niños, familiares mayores o una estancia larga, la mejor base puede cambiar porque algunas zonas hacen más práctico encontrar habitaciones más amplias, calles tranquilas o mejor acceso a la estación.",
    planningTitle: "Cómo usar esto con la planificación de zona",
    planningBody: "El tamaño de habitación es solo una parte de la decisión. Compáralo con acceso al aeropuerto, planes de Shinkansen, equipaje y ruido del barrio antes de elegir dónde reservar.",
    stayGuideLink: "Abrir guía de zonas de Tokio",
    continueTitle: "Continuar planificación",
    continueLinks: [["/areas-to-stay/tokyo-first-time", "Guía de zonas de Tokio"], ["/local-hotel-picks", "Ejemplos de hoteles locales"], ["/airport-transfers", "Traslados de aeropuerto"], ["/guide", "Guía Seat E del Shinkansen"]],
  },
  ko: {
    metadataTitle: "도쿄 호텔 객실 크기 가이드: 어느 정도면 너무 작을까?",
    metadataDescription: "도쿄 호텔 객실은 짐이 있으면 작게 느껴질 수 있습니다. 2인 여행, 가족, 큰 캐리어, 숙소 지역 선택에 객실 크기가 어떤 의미인지 확인하세요.",
    breadcrumbHome: "홈",
    breadcrumbStay: "숙소 지역",
    breadcrumbTokyo: "도쿄",
    breadcrumbCurrent: "객실 크기 가이드",
    eyebrow: "도쿄 호텔 계획",
    title: "도쿄 호텔 객실 크기 가이드: 어느 정도면 너무 작을까?",
    intro: "도쿄 호텔 객실은 일부 국가의 호텔이나 아파트보다 작게 느껴질 수 있습니다. 사진은 넓어 보여도 캐리어, 침대, 작은 욕실을 더하면 체감이 달라집니다.",
    quickTitle: "빠른 답변",
    quickBody: "2인 여행이라면 18㎡ 미만 객실은 큰 캐리어가 있을 때 답답할 수 있습니다. 22-26㎡ 정도는 대체로 무난하고, 30㎡ 이상은 도쿄 호텔 기준으로 2인에게 편안한 편입니다. 가족이나 3-4명 여행은 지역 이름보다 객실 타입과 침대 구성이 더 중요합니다.",
    rangesTitle: "도쿄 호텔 객실 크기 범위",
    roomRanges: [["18㎡ 미만", "큰 짐이 있는 2인에게는 매우 컴팩트합니다."], ["19-22㎡", "짧은 숙박은 가능하지만 큰 캐리어 두 개가 있으면 여전히 좁습니다."], ["23-26㎡", "짐을 조금 더 편하게 펼치고 싶은 2인에게 더 안전합니다."], ["27-30㎡", "도쿄 호텔 기준으로 2인에게 편안합니다."], ["30㎡+", "도쿄 기준으로는 2인에게 대체로 편안하지만 모든 나라 기준으로 큰 방은 아닙니다."], ["35㎡+", "가족, 그룹, 장기 숙박, 아파트형 객실에 더 좋습니다."]],
    nuance: "30㎡ 이상은 도쿄 호텔 기준으로 2인에게 편안합니다. 하지만 더 넓은 도시의 아파트나 호텔과 비교하면 보편적으로 큰 방은 아닐 수 있습니다.",
    checkTitle: "예약 전 확인할 것",
    bookingChecks: ["객실 크기(㎡)", "침대 타입: 더블, 트윈, 트리플, 패밀리룸", "침대, 소파베드, 이불 개수", "큰 캐리어를 펼칠 수 있는지", "작은 방 또는 짐 관련 리뷰", "욕실 구조", "역에서 호텔까지 엘리베이터 접근", "체크인 전/체크아웃 후 짐 보관", "늦은 체크인 가능 여부", "취소 정책", "거리 소음 또는 유흥가 소음 리뷰"],
    areaTitle: "객실 크기가 도쿄 숙소 지역 선택을 바꾸는 이유",
    areaBody: "좋은 지역은 관광지만으로 결정되지 않습니다. 큰 캐리어, 아이, 고령 가족, 장기 숙박이 있다면 더 넓은 객실, 조용한 거리, 쉬운 역 접근이 가능한 지역이 더 실용적일 수 있습니다.",
    planningTitle: "지역 계획과 함께 사용하는 방법",
    planningBody: "객실 크기는 숙소 지역 결정의 한 요소입니다. 공항 접근, 신칸센 일정, 짐, 동네 소음을 함께 비교한 뒤 예약 지역을 정하세요.",
    stayGuideLink: "도쿄 숙소 지역 가이드 열기",
    continueTitle: "계속 계획하기",
    continueLinks: [["/areas-to-stay/tokyo-first-time", "도쿄 숙소 지역 가이드"], ["/local-hotel-picks", "로컬 호텔 예시"], ["/airport-transfers", "공항 이동"], ["/guide", "신칸센 Seat E 가이드"]],
  },
  "zh-TW": {
    metadataTitle: "東京飯店房間大小指南：多小算太小？",
    metadataDescription: "東京飯店房間加上行李後可能會覺得緊湊。了解雙人、家庭、大行李箱與住宿區域選擇時該怎麼看坪數。",
    breadcrumbHome: "首頁",
    breadcrumbStay: "住宿區域",
    breadcrumbTokyo: "東京",
    breadcrumbCurrent: "房間大小指南",
    eyebrow: "東京飯店規劃",
    title: "東京飯店房間大小指南：多小算太小？",
    intro: "東京飯店房間和某些國家的飯店或公寓相比可能偏小。照片看起來舒服，但加上行李箱、床和緊湊浴室後，實際感受可能不同。",
    quickTitle: "快速答案",
    quickBody: "兩位旅客若有大型行李，18㎡以下可能會覺得擁擠。22-26㎡通常可接受，30㎡以上以東京飯店標準來說通常對兩人較舒適。家庭或3-4人同行時，房型和床型比區域名稱更重要。",
    rangesTitle: "東京飯店房間大小範圍",
    roomRanges: [["18㎡以下", "兩人加大型行李會非常緊湊。"], ["19-22㎡", "短住可行，但兩個大型行李箱仍會覺得小。"], ["23-26㎡", "想較舒服打開行李的兩人較安全。"], ["27-30㎡", "以東京飯店標準來說，兩人算舒適。"], ["30㎡+", "以東京標準通常對兩人舒適，但不代表在所有國家都算大。"], ["35㎡+", "較適合家庭、團體、長住或公寓式房型。"]],
    nuance: "30㎡以上以東京飯店標準來說對兩人舒適，但若和空間較大的城市、公寓或飯店相比，不一定算非常大。",
    checkTitle: "預訂前要確認",
    bookingChecks: ["房間面積（㎡）", "床型：雙人、雙床、三人、家庭房", "床、沙發床或日式床墊數量", "大型行李箱能否打開", "提到小房間或行李的評價", "浴室配置", "從車站到飯店的電梯動線", "入住前或退房後行李寄放", "是否可晚入住", "取消政策", "評價中的街道或夜生活噪音"],
    areaTitle: "為什麼房間大小會改變東京住宿區域選擇",
    areaBody: "最佳區域不只看景點。若有大型行李、孩子、年長家人或長住需求，有些區域因較容易找到大房間、安靜街道或簡單車站動線，可能更實用。",
    planningTitle: "如何和住宿區域規劃一起使用",
    planningBody: "房間大小只是住宿基地決策的一部分。選擇預訂區域前，請一起比較機場交通、新幹線計畫、行李和街區噪音。",
    stayGuideLink: "打開東京住宿區域指南",
    continueTitle: "繼續規劃",
    continueLinks: [["/areas-to-stay/tokyo-first-time", "東京住宿區域指南"], ["/local-hotel-picks", "在地飯店例子"], ["/airport-transfers", "機場交通"], ["/guide", "新幹線 Seat E 指南"]],
  },
  "zh-CN": {
    metadataTitle: "东京酒店房间大小指南：多小算太小？",
    metadataDescription: "东京酒店房间加上行李后可能会显得紧凑。了解双人、家庭、大行李箱和住宿区域选择时如何看面积。",
    breadcrumbHome: "首页",
    breadcrumbStay: "住宿区域",
    breadcrumbTokyo: "东京",
    breadcrumbCurrent: "房间大小指南",
    eyebrow: "东京酒店规划",
    title: "东京酒店房间大小指南：多小算太小？",
    intro: "东京酒店房间和一些国家的酒店或公寓相比可能偏小。照片看起来宽松，但加上行李箱、床和紧凑浴室后，实际感受可能不同。",
    quickTitle: "快速答案",
    quickBody: "两位旅客如果带大行李，18㎡以下可能会觉得拥挤。22-26㎡通常可用，30㎡以上按东京酒店标准通常对两人较舒适。家庭或3-4人同行时，房型和床型比区域名称更重要。",
    rangesTitle: "东京酒店房间大小范围",
    roomRanges: [["18㎡以下", "两人加大行李会非常紧凑。"], ["19-22㎡", "短住可行，但两个大行李箱仍会显得紧。"], ["23-26㎡", "想更舒服打开行李的两人更稳妥。"], ["27-30㎡", "按东京酒店标准，两人较舒适。"], ["30㎡+", "按东京标准通常对两人舒适，但不代表在所有国家都算大。"], ["35㎡+", "更适合家庭、团体、长住或公寓式布局。"]],
    nuance: "30㎡以上按东京酒店标准对两人较舒适，但如果和更宽敞城市的公寓或酒店相比，不一定算非常大。",
    checkTitle: "预订前要检查",
    bookingChecks: ["房间面积（㎡）", "床型：双人、双床、三人、家庭房", "床、沙发床或日式床垫数量", "大行李箱能否打开", "提到小房间或行李的评价", "浴室布局", "从车站到酒店的电梯动线", "入住前或退房后行李寄存", "是否可晚入住", "取消政策", "评价中的街道或夜生活噪音"],
    areaTitle: "为什么房间大小会改变东京住宿区域选择",
    areaBody: "最佳区域不只看景点。如果有大行李、孩子、年长家人或长住需求，有些区域因为更容易找到较大房间、安静街道或简单车站动线，可能更实用。",
    planningTitle: "如何配合住宿区域规划使用",
    planningBody: "房间大小只是住宿基地决策的一部分。选择预订区域前，请一起比较机场交通、新干线计划、行李和街区噪音。",
    stayGuideLink: "打开东京住宿区域指南",
    continueTitle: "继续规划",
    continueLinks: [["/areas-to-stay/tokyo-first-time", "东京住宿区域指南"], ["/local-hotel-picks", "本地酒店示例"], ["/airport-transfers", "机场交通"], ["/guide", "新干线 Seat E 指南"]],
  },
  fr: {
    metadataTitle: "Guide des tailles de chambres d'hôtel à Tokyo : quand est-ce trop petit ?",
    metadataDescription: "Les chambres d'hôtel à Tokyo peuvent sembler compactes avec des bagages. Comprenez les tailles pour deux voyageurs, familles, grosses valises et choix de quartier.",
    breadcrumbHome: "Accueil",
    breadcrumbStay: "Où loger",
    breadcrumbTokyo: "Tokyo",
    breadcrumbCurrent: "Guide taille de chambre",
    eyebrow: "Planifier son hôtel à Tokyo",
    title: "Guide des tailles de chambres d'hôtel à Tokyo : quand est-ce trop petit ?",
    intro: "Les chambres d'hôtel à Tokyo peuvent paraître compactes par rapport à certains hôtels ou appartements ailleurs. Les photos semblent parfois faciles à vivre avant d'ajouter valises, lits et salle de bain compacte.",
    quickTitle: "Réponse rapide",
    quickBody: "Pour deux voyageurs, moins de 18㎡ peut être serré avec de grosses valises. Environ 22-26㎡ est souvent praticable, et 30㎡+ est généralement confortable pour deux selon les standards hôteliers de Tokyo. Pour les familles ou 3-4 voyageurs, le type de chambre et les lits comptent plus que le nom du quartier.",
    rangesTitle: "Fourchettes de taille pour les hôtels à Tokyo",
    roomRanges: [["Moins de 18㎡", "Très compact pour deux voyageurs avec de gros bagages."], ["19-22㎡", "Possible pour un court séjour, mais encore compact avec deux grosses valises."], ["23-26㎡", "Plus sûr pour deux voyageurs qui veulent ouvrir leurs bagages plus confortablement."], ["27-30㎡", "Confortable pour deux selon les standards hôteliers de Tokyo."], ["30㎡+", "Généralement confortable pour deux à Tokyo, mais pas forcément grand partout."], ["35㎡+", "Mieux pour familles, groupes, longs séjours ou formats appartement."]],
    nuance: "30㎡+ est confortable pour deux selon les standards hôteliers de Tokyo. Ce n'est pas universellement grand, surtout si vous comparez avec des appartements ou hôtels dans des destinations plus spacieuses.",
    checkTitle: "À vérifier avant de réserver",
    bookingChecks: ["Surface en mètres carrés", "Type de lit : double, twin, triple, familial", "Nombre de lits, canapés-lits ou futons", "Possibilité d'ouvrir de grosses valises", "Avis mentionnant petite chambre ou bagages", "Disposition de la salle de bain", "Accès ascenseur entre station et hôtel", "Consigne avant check-in ou après check-out", "Possibilité d'arrivée tardive", "Politique d'annulation", "Bruit de rue ou de vie nocturne dans les avis"],
    areaTitle: "Pourquoi la taille de chambre change le meilleur quartier à Tokyo",
    areaBody: "Le meilleur quartier ne dépend pas seulement des attractions. Avec de grosses valises, des enfants, des proches âgés ou un long séjour, une autre base peut devenir plus pratique si elle offre des chambres plus grandes, des rues calmes ou un accès station plus simple.",
    planningTitle: "Comment l'utiliser avec le choix de quartier",
    planningBody: "La taille de chambre n'est qu'une partie du choix de base hôtelière. Comparez-la avec l'accès aéroport, les plans Shinkansen, les bagages et le bruit du quartier avant de réserver.",
    stayGuideLink: "Ouvrir le guide des quartiers de Tokyo",
    continueTitle: "Continuer la planification",
    continueLinks: [["/areas-to-stay/tokyo-first-time", "Guide des quartiers de Tokyo"], ["/local-hotel-picks", "Exemples d'hôtels locaux"], ["/airport-transfers", "Transferts aéroport"], ["/guide", "Guide Seat E Shinkansen"]],
  },
  de: {
    metadataTitle: "Tokyo Hotelzimmer-Größen: Wie klein ist zu klein?",
    metadataDescription: "Hotelzimmer in Tokyo können mit Gepäck kompakt wirken. Verstehe Größen für zwei Reisende, Familien, große Koffer und die Wahl der Hotelbasis.",
    breadcrumbHome: "Start",
    breadcrumbStay: "Unterkunft",
    breadcrumbTokyo: "Tokyo",
    breadcrumbCurrent: "Zimmergrößen-Guide",
    eyebrow: "Tokyo Hotelplanung",
    title: "Tokyo Hotelzimmer-Größen: Wie klein ist zu klein?",
    intro: "Hotelzimmer in Tokyo können im Vergleich zu manchen Hotels oder Apartments in anderen Ländern kompakt wirken. Fotos sehen oft einfacher aus, bevor Koffer, Betten und ein kompaktes Bad dazukommen.",
    quickTitle: "Kurzantwort",
    quickBody: "Für zwei Reisende können Zimmer unter 18㎡ mit großen Koffern eng werden. Etwa 22-26㎡ ist meist machbar, und 30㎡+ ist nach Tokyo-Hotelstandard für zwei normalerweise komfortabel. Für Familien oder 3-4 Reisende sind Zimmertyp und Betten wichtiger als der Gebietsname allein.",
    rangesTitle: "Zimmergrößen in Tokyo Hotels",
    roomRanges: [["Unter 18㎡", "Sehr kompakt für zwei Reisende mit großem Gepäck."], ["19-22㎡", "Für kurze Aufenthalte machbar, aber mit zwei großen Koffern noch kompakt."], ["23-26㎡", "Sicherer für zwei Reisende, die Gepäck bequemer öffnen möchten."], ["27-30㎡", "Nach Tokyo-Hotelstandard bequem für zwei Reisende."], ["30㎡+", "Nach Tokyo-Standard meist komfortabel für zwei, aber nicht überall als groß zu verstehen."], ["35㎡+", "Besser für Familien, Gruppen, längere Aufenthalte oder Apartment-Layouts."]],
    nuance: "30㎡+ ist nach Tokyo-Hotelstandard für zwei komfortabel. Es ist nicht überall groß, besonders im Vergleich mit Apartments oder Hotels in geräumigeren Reisezielen.",
    checkTitle: "Vor der Buchung prüfen",
    bookingChecks: ["Zimmergröße in Quadratmetern", "Bettart: Doppelbett, Twin, Triple, Familienzimmer", "Anzahl der Betten, Schlafsofas oder Futons", "Ob große Koffer geöffnet werden können", "Bewertungen mit kleinen Zimmern oder Gepäck", "Badaufteilung", "Aufzugzugang vom Bahnhof zum Hotel", "Gepäckaufbewahrung vor Check-in oder nach Check-out", "Später Check-in möglich", "Stornierungsbedingungen", "Straßen- oder Nachtlärm in Bewertungen"],
    areaTitle: "Warum Zimmergröße die beste Gegend in Tokyo verändert",
    areaBody: "Die beste Gegend hängt nicht nur von Sehenswürdigkeiten ab. Mit großen Koffern, Kindern, älteren Familienmitgliedern oder längerem Aufenthalt kann eine andere Hotelbasis praktischer sein, weil größere Zimmer, ruhigere Straßen oder einfacherer Bahnhofszugang wichtiger werden.",
    planningTitle: "So nutzt du das bei der Gebietsplanung",
    planningBody: "Zimmergröße ist nur ein Teil der Hotelbasis-Entscheidung. Vergleiche sie mit Flughafenzugang, Shinkansen-Plänen, Gepäck und Nachbarschaftslärm, bevor du buchst.",
    stayGuideLink: "Tokyo Unterkunfts-Guide öffnen",
    continueTitle: "Weiter planen",
    continueLinks: [["/areas-to-stay/tokyo-first-time", "Tokyo Unterkunfts-Guide"], ["/local-hotel-picks", "Lokale Hotelbeispiele"], ["/airport-transfers", "Flughafentransfers"], ["/guide", "Shinkansen Seat E Guide"]],
  },
  ru: {
    metadataTitle: "Размер номера в отеле Токио: когда слишком тесно?",
    metadataDescription: "Номера в отелях Токио могут казаться компактными с багажом. Узнайте, что означают размеры для пары, семьи, больших чемоданов и выбора района.",
    breadcrumbHome: "Главная",
    breadcrumbStay: "Где остановиться",
    breadcrumbTokyo: "Токио",
    breadcrumbCurrent: "Размер номера",
    eyebrow: "Планирование отеля в Токио",
    title: "Размер номера в отеле Токио: когда слишком тесно?",
    intro: "Номера в отелях Токио могут казаться компактными по сравнению с отелями или апартаментами в некоторых странах. На фото номер может выглядеть удобнее, чем он ощущается с чемоданами, кроватями и компактной ванной.",
    quickTitle: "Короткий ответ",
    quickBody: "Для двух путешественников номера меньше 18㎡ могут быть тесными с большими чемоданами. Около 22-26㎡ обычно приемлемо, а 30㎡+ по стандартам отелей Токио обычно комфортно для двоих. Для семей или 3-4 человек тип номера и кровати важнее одного названия района.",
    rangesTitle: "Диапазоны размеров номеров в Токио",
    roomRanges: [["Меньше 18㎡", "Очень компактно для двоих с большим багажом."], ["19-22㎡", "Подходит для короткого пребывания, но с двумя большими чемоданами все еще тесно."], ["23-26㎡", "Безопаснее для двоих, если нужно удобнее открыть багаж."], ["27-30㎡", "Комфортно для двоих по стандартам отелей Токио."], ["30㎡+", "Обычно комфортно для двоих по токийским стандартам, но не обязательно большое по меркам всех стран."], ["35㎡+", "Лучше для семей, групп, долгих поездок или апартаментного формата."]],
    nuance: "30㎡+ комфортно для двоих по стандартам отелей Токио. Это не универсально большой номер, особенно если сравнивать с апартаментами или отелями в более просторных направлениях.",
    checkTitle: "Что проверить перед бронированием",
    bookingChecks: ["Площадь номера в квадратных метрах", "Тип кровати: double, twin, triple, family room", "Количество кроватей, диванов-кроватей или футонов", "Можно ли открыть большие чемоданы", "Отзывы о маленьком номере или багаже", "Планировка ванной", "Доступ на лифте от станции до отеля", "Хранение багажа до check-in или после check-out", "Поздний check-in", "Политика отмены", "Шум улицы или ночной жизни в отзывах"],
    areaTitle: "Почему размер номера меняет лучший район в Токио",
    areaBody: "Лучший район зависит не только от достопримечательностей. С большими чемоданами, детьми, пожилыми родственниками или долгим проживанием более практичной может стать зона с большими номерами, спокойными улицами или более простым доступом к станции.",
    planningTitle: "Как использовать это при выборе района",
    planningBody: "Размер номера - только часть решения о базе в Токио. Сравните его с доступом из аэропорта, планами Shinkansen, багажом и шумом района до бронирования.",
    stayGuideLink: "Открыть гид по районам Токио",
    continueTitle: "Продолжить планирование",
    continueLinks: [["/areas-to-stay/tokyo-first-time", "Гид по районам Токио"], ["/local-hotel-picks", "Примеры местных отелей"], ["/airport-transfers", "Трансферы из аэропорта"], ["/guide", "Гид Shinkansen Seat E"]],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const copy = roomSizeCopyByLocale[locale] ?? roomSizeCopyByLocale.en;
  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates(pagePath, locale),
  };
}

export default async function TokyoHotelRoomSizeGuidePage({ params }: Props) {
  const { locale } = await params;
  const copy = roomSizeCopyByLocale[locale] ?? roomSizeCopyByLocale.en;

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
          <h2 className="text-2xl font-semibold text-slate-950">{copy.rangesTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {copy.roomRanges.map(([title, body]) => (
              <article key={title} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                <Ruler className="h-5 w-5 text-[#106b43]" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
          <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            {copy.nuance}
          </p>
        </section>

        <AdSlot placement="room_size_mid_article" format="horizontal" />

        <section className="mt-10 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">{copy.checkTitle}</h2>
          <ul className="mt-5 grid gap-2 text-sm leading-6 text-slate-700 md:grid-cols-2">
            {copy.bookingChecks.map((item) => (
              <li key={item} className="flex gap-2 rounded-2xl bg-slate-50 px-4 py-3">
                <SearchCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#168a56]" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">{copy.areaTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {copy.areaBody}
            </p>
          </div>
          <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/70 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">{copy.planningTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {copy.planningBody}
            </p>
            <TrackedInternalLink
              href="/areas-to-stay/tokyo-first-time"
              sourcePage={pagePath}
              placement="room_size_pack_cta"
              label="Tokyo stay area guide"
              locale={locale}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#106b43] underline underline-offset-4"
            >
              {copy.stayGuideLink} →
            </TrackedInternalLink>
          </div>
        </section>

        <section className="mt-10 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">{copy.continueTitle}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {copy.continueLinks.map(([href, label]) => (
              <TrackedInternalLink
                key={href}
                href={href}
                sourcePage={pagePath}
                placement="room_size_pack_cta"
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
