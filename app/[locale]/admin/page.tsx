"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { LinkConfig } from "@/src/affiliateLinks";
import type { BookingHotelDestinationConfig } from "@/lib/booking-hotel-destinations";
import type { HotelAffiliateLinkConfig } from "@/lib/hotel-affiliate-links";
import type { HotelLinkConfig } from "@/lib/hotel-links";
import type { AgodaHotelMapConfig } from "@/lib/agoda-hotel-maps";
import { DEFAULT_STAY_AREA_MAP_DISCLAIMER } from "@/lib/stay-area-map-constants";
import type { StayAreaMapConfig } from "@/lib/stay-area-maps";

// ─── Types ──────────────────────────────────────────────────────────────────

type LinkEntry = { id: string } & LinkConfig;
type HotelEntry = { id: string } & HotelLinkConfig;
type BookingDestinationEntry = { id: string } & BookingHotelDestinationConfig;
type HotelAffiliateEntry = { id: string } & HotelAffiliateLinkConfig;
type StayHotelPickEntry = {
  id: string;
  name: string;
  area: string;
  price: string;
  hotelKey: string;
  tag?: string;
  tripUrl: string;
  label: string;
};
type StayHotelPickGroup = { slug: string; picks: StayHotelPickEntry[] };
type HotelPickLinkEntry = {
  id: string;
  name: string;
  hotelKey: string;
  primaryProvider?: "agoda" | "trip";
  agodaUrl?: string;
  tripUrl: string;
  label: string;
  lastChecked?: string;
};

type FormState = {
  id: string;
  label: string;
  provider: string;
  adid: string;
  klookPath: string;
  directUrl: string;
  usedOn: string;
};

type HotelFormState = {
  id: string;
  areaName: string;
  city: string;
  label: string;
  primaryProvider: "agoda" | "trip";
  agodaUrl: string;
  tripUrl: string;
  fallbackProvider: "trip" | "agoda" | "klook";
  fallbackLinkId: string;
  checkinType: "dynamic_offset" | "fixed_date";
  lastChecked: string;
};

type HotelAffiliateFormState = HotelAffiliateEntry;
type BookingDestinationFormState = BookingDestinationEntry;

type HotelPickLinkFormState = HotelPickLinkEntry;
type AgodaHotelMapEntry = AgodaHotelMapConfig;
type AgodaHotelMapFormState = AgodaHotelMapConfig;
type StayAreaMapEntry = StayAreaMapConfig;
type StayAreaMapFormState = StayAreaMapConfig;
type LocalHotelPickEntry = {
  id: string;
  city: string;
  area: string;
  hotelName: string;
  bestFor: string;
  localReason: string;
  notIdealFor: string;
  tags: string[];
  agodaUrl: string;
  tripFallbackUrl: string;
  officialUrl: string;
  status: "active" | "draft" | "disabled";
  lastChecked: string;
};
type LocalHotelPickFormState = LocalHotelPickEntry;
type LocalHotelPickCityFilter = "all" | "Tokyo" | "Kyoto" | "Osaka";
type LocalHotelPickStatusFilter = "all" | "active" | "draft" | "disabled";
type LocalHotelPickAgodaFilter = "all" | "missing" | "present";

type HotelPickProviderFilter = "all" | "agoda" | "trip";
type HotelPickAgodaFilter = "all" | "missing" | "present";
type HotelPickHealthFilter =
  | "all"
  | "primary-agoda-missing"
  | "agoda-present-trip-primary"
  | "missing-all-urls"
  | "possible-mismatch"
  | "used-3-plus";

const EMPTY_FORM: FormState = {
  id: "",
  label: "",
  provider: "klook",
  adid: "1165791",
  klookPath: "",
  directUrl: "",
  usedOn: "",
};

// ─── Setup status helpers ───────────────────────────────────────────────────

const DEFAULT_KLOOK_ADID = "1165791";

type SetupStatus = "done" | "needs-adid" | "needs-url";
type MissingTransportAffiliate = {
  id: string;
  provider: "klook" | "omio";
  label: string;
  product: string;
  targetUrl: string;
  usedOn: string;
  note: string;
};

function getStatus(entry: LinkEntry): SetupStatus {
  if (entry.directUrl) return "done";
  if (entry.provider === "klook") {
    return entry.adid && entry.adid !== DEFAULT_KLOOK_ADID ? "done" : "needs-adid";
  }
  return "needs-url";
}

const STATUS_CONFIG = {
  done: { label: "設定済み", dot: "bg-emerald-400", bg: "" },
  "needs-adid": { label: "adid 未設定", dot: "bg-amber-400", bg: "bg-amber-50/50" },
  "needs-url": { label: "URL 未設定", dot: "bg-red-400", bg: "bg-red-50/50" },
};

const AGODA_HOTEL_MAP_DISABLED_REASON =
  "Currently disabled / not used. Agoda Hotel Map embeds can include fixed checkIn / checkOut dates, external scripts, limited UI control, and extra page weight.";

const RECOMMENDED_TRANSPORT_AFFILIATE_LINKS: MissingTransportAffiliate[] = [
  {
    id: "omioJapanAirportTransfer",
    provider: "omio",
    label: "Compare Japan airport transfers on Omio",
    product: "airport_route_compare",
    targetUrl: "https://www.omio.com/airport-japan-transfers",
    usedOn: "Transfers, Airport route comparison",
    note: "Omioの空港送迎/交通比較。affiliate/deeplink化して directUrl に貼る。",
  },
  {
    id: "hanedaLimousineBus",
    provider: "klook",
    label: "Haneda Airport Limousine Bus",
    product: "airport_bus",
    targetUrl: "https://www.klook.com/activity/150434-haneda-airport-limousine-bus-tokyo/",
    usedOn: "Transfers",
    note: "羽田バス専用。Narita Limousine Bus URLを流用しない。",
  },
  {
    id: "jrHaruka",
    provider: "klook",
    label: "JR Haruka Airport Express",
    product: "airport_train",
    targetUrl: "https://www.klook.com/activity/18400-jr-haruka-airport-express-train-tickets-osaka/",
    usedOn: "Transfers",
    note: "KIX⇔KyotoのHaruka用。affiliate URL化後にCTA表示対象。",
  },
  {
    id: "kixLimousineBus",
    provider: "klook",
    label: "Kansai Airport Limousine Bus",
    product: "airport_bus",
    targetUrl: "https://www.klook.com/activity/18203-kansai-airport-one-way-transfer-osaka/",
    usedOn: "Transfers",
    note: "KIX bus専用。Narita Limousine Bus URLを流用しない。",
  },
  {
    id: "nankaiRapit",
    provider: "klook",
    label: "Nankai Rapi:t",
    product: "airport_train",
    targetUrl: "https://www.klook.com/activity/599-kansai-airport-namba-train-ticket-osaka/",
    usedOn: "Transfers",
    note: "KIX⇔NambaのNankai Rapi:t用。",
  },
  {
    id: "naritaPrivateTransfer",
    provider: "klook",
    label: "Narita private airport transfer",
    product: "airport_private_transfer",
    targetUrl: "https://www.klook.com/airport-transfers/service/nrt-narita-international-airport/",
    usedOn: "Transfers",
    note: "成田private transfer専用。既存airportTransferはN'EXなので使わない。",
  },
  {
    id: "hanedaPrivateTransfer",
    provider: "klook",
    label: "Haneda private airport transfer",
    product: "airport_private_transfer",
    targetUrl: "https://www.klook.com/airport-transfers/service/hnd-tokyo-haneda-international-airport/",
    usedOn: "Transfers",
    note: "羽田private transfer専用。",
  },
  {
    id: "airportPrivateTransfer",
    provider: "klook",
    label: "Airport private transfer",
    product: "airport_private_transfer",
    targetUrl: "https://www.klook.com/airport-transfers/",
    usedOn: "Transfers",
    note: "汎用fallback。できれば空港別URLを優先。",
  },
  {
    id: "klookTokyoTransport",
    provider: "klook",
    label: "Tokyo transport on Klook",
    product: "transport",
    targetUrl: "https://www.klook.com/destination/c28-tokyo/4-transport/",
    usedOn: "Transfers",
    note: "東京transportカテゴリfallback。個別商品URLがない場合のみ検討。",
  },
  {
    id: "klookAirportTransfers",
    provider: "klook",
    label: "Klook airport transfers",
    product: "airport_private_transfer",
    targetUrl: "https://www.klook.com/airport-transfers/",
    usedOn: "Transfers",
    note: "Klook airport transfer hub fallback。個別空港URLがない場合のみ検討。",
  },
];

const AGODA_PRIORITY_HOTEL_PICKS = [
  "Hotel Granvia Kyoto",
  "Hotel The Celestine Kyoto Gion",
  "Sowaka",
  "Hotel Metropolitan Tokyo Marunouchi",
  "Hotel Ryumeikan Tokyo",
  "NOHGA Hotel Ueno Tokyo",
  "Gate Hotel Kaminarimon",
  "Cross Hotel Osaka",
  "Remm Shin-Osaka",
  "Courtyard by Marriott Shin-Osaka Station",
];

const AGODA_PRIORITY_AREA_LINK_IDS = [
  "shinjuku",
  "ueno",
  "asakusa",
  "tokyoStation",
  "kyotoStation",
  "gionKawaramachi",
  "namba",
  "umeda",
  "shinOsaka",
];

const HOTEL_URL_STOP_WORDS = new Set([
  "and",
  "the",
  "hotel",
  "hotels",
  "tokyo",
  "kyoto",
  "osaka",
  "station",
  "premier",
]);

function normalizeHotelToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getTripUrlPath(value: string) {
  try {
    return new URL(value).pathname.toLowerCase();
  } catch {
    return value.toLowerCase();
  }
}

function hasPossibleHotelUrlMismatch(entry: HotelPickLinkEntry) {
  if (!entry.tripUrl.trim()) return false;
  const urlPath = getTripUrlPath(entry.tripUrl);
  const tokens = normalizeHotelToken(entry.name)
    .split(/\s+/)
    .filter((token) => token.length >= 4 && !HOTEL_URL_STOP_WORDS.has(token));
  if (tokens.length === 0) return false;
  return !tokens.some((token) => urlPath.includes(token));
}

// ─── Placement Map ──────────────────────────────────────────────────────────

type Placement = { page: string; section: string; emoji: string };

const PLACEMENTS: Record<string, Placement[]> = {
  jrPass: [
    { page: "Planner", section: "チェックリスト / サイドバー", emoji: "📋" },
    { page: "TripPicks", section: "チェックリスト", emoji: "✅" },
    { page: "全コンテンツ", section: "次のステップ", emoji: "📄" },
  ],
  esim: [
    { page: "Home", section: "eSIM バナー", emoji: "🏠" },
    { page: "Planner", section: "チェックリスト / サイドバー", emoji: "📋" },
    { page: "全コンテンツ", section: "次のステップ", emoji: "📄" },
  ],
  insurance: [
    { page: "Planner", section: "チェックリスト / サイドバー", emoji: "📋" },
    { page: "TripPicks", section: "チェックリスト", emoji: "✅" },
  ],
  airportTransfer: [{ page: "Guide", section: "必需品グリッド", emoji: "📖" }],
  carRental: [{ page: "Guide", section: "必需品グリッド", emoji: "📖" }],
  nex: [{ page: "Transfers", section: "成田→新宿 / 東京駅", emoji: "✈️" }],
  skyliner: [{ page: "Transfers", section: "成田→新宿", emoji: "✈️" }],
  limousineBus: [{ page: "Transfers", section: "全4ルート", emoji: "✈️" }],
  hanedaMonorail: [{ page: "Transfers", section: "羽田→新宿 / 浅草", emoji: "✈️" }],
  hotelTokyo: [{ page: "Stay", section: "東京エリアカード", emoji: "🏨" }],
  hotelShinjuku: [{ page: "Stay + Itineraries", section: "DayCard", emoji: "🏨" }],
  hotelUeno: [{ page: "Stay + Itineraries", section: "DayCard", emoji: "🏨" }],
  hotelAsakusa: [{ page: "Stay + Itineraries", section: "DayCard", emoji: "🏨" }],
  hotelKyoto: [{ page: "Stay", section: "京都エリアカード", emoji: "🏨" }],
  hotelKyotoStation: [{ page: "Stay + Itineraries", section: "DayCard", emoji: "🏨" }],
  hotelGion: [{ page: "Stay", section: "京都エリアカード", emoji: "🏨" }],
  hotelKawaguchiko: [{ page: "Stay + Itineraries", section: "DayCard", emoji: "🏨" }],
  cityTokyo: [{ page: "Itineraries", section: "DayCard CTA", emoji: "🗺️" }],
  cityNikko: [{ page: "Itineraries", section: "DayCard CTA", emoji: "🗺️" }],
  cityKyoto: [{ page: "Itineraries", section: "DayCard CTA", emoji: "🗺️" }],
  cityOsaka: [{ page: "Itineraries", section: "DayCard CTA", emoji: "🗺️" }],
  cityHiroshima: [{ page: "Itineraries", section: "DayCard CTA", emoji: "🗺️" }],
};

const PROVIDER_STYLES: Record<string, { dot: string; badge: string; label: string; color: string }> = {
  klook: { dot: "bg-orange-400", badge: "bg-orange-100 text-orange-800 border-orange-200", label: "Klook", color: "border-orange-300 bg-orange-50" },
  trip: { dot: "bg-blue-500", badge: "bg-blue-100 text-blue-800 border-blue-200", label: "Trip.com", color: "border-blue-300 bg-blue-50" },
  agoda: { dot: "bg-red-400", badge: "bg-red-100 text-red-800 border-red-200", label: "Agoda", color: "border-red-300 bg-red-50" },
  omio: { dot: "bg-indigo-500", badge: "bg-indigo-100 text-indigo-800 border-indigo-200", label: "Omio", color: "border-indigo-300 bg-indigo-50" },
  getyourguide: { dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "GetYourGuide", color: "border-emerald-300 bg-emerald-50" },
  safetywing: { dot: "bg-cyan-500", badge: "bg-cyan-100 text-cyan-800 border-cyan-200", label: "SafetyWing", color: "border-cyan-300 bg-cyan-50" },
  other: { dot: "bg-slate-400", badge: "bg-slate-100 text-slate-700 border-slate-200", label: "Other", color: "border-slate-300 bg-slate-50" },
};

function ps(provider: string) {
  return PROVIDER_STYLES[provider] ?? PROVIDER_STYLES.other;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [links, setLinks] = useState<LinkEntry[]>([]);
  const [hotelLinks, setHotelLinks] = useState<HotelEntry[]>([]);
  const [bookingDestinations, setBookingDestinations] = useState<BookingDestinationEntry[]>([]);
  const [hotelAffiliateLinks, setHotelAffiliateLinks] = useState<HotelAffiliateEntry[]>([]);
  const [stayHotelPicks, setStayHotelPicks] = useState<StayHotelPickGroup[]>([]);
  const [hotelPickLinks, setHotelPickLinks] = useState<HotelPickLinkEntry[]>([]);
  const [agodaHotelMaps, setAgodaHotelMaps] = useState<AgodaHotelMapEntry[]>([]);
  const [stayAreaMaps, setStayAreaMaps] = useState<StayAreaMapEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showAdd, setShowAdd] = useState(false);
  const [klookUrlInput, setKlookUrlInput] = useState("");
  const [tab, setTab] = useState<"hotel" | "hotel-affiliate" | "booking-destinations" | "stay-picks" | "local-picks" | "stay-maps" | "agoda-maps" | "todo" | "all">("hotel");
  const [adminToken, setAdminToken] = useState("");
  const [editingHotelId, setEditingHotelId] = useState<string | null>(null);
  const [hotelForm, setHotelForm] = useState<HotelFormState | null>(null);
  const [editingHotelAffiliateId, setEditingHotelAffiliateId] = useState<string | null>(null);
  const [hotelAffiliateForm, setHotelAffiliateForm] = useState<HotelAffiliateFormState | null>(null);
  const [editingBookingDestinationId, setEditingBookingDestinationId] = useState<string | null>(null);
  const [bookingDestinationForm, setBookingDestinationForm] = useState<BookingDestinationFormState | null>(null);
  const [editingHotelPickLinkId, setEditingHotelPickLinkId] = useState<string | null>(null);
  const [hotelPickLinkForm, setHotelPickLinkForm] = useState<HotelPickLinkFormState | null>(null);
  const [editingAgodaHotelMapId, setEditingAgodaHotelMapId] = useState<string | null>(null);
  const [agodaHotelMapForm, setAgodaHotelMapForm] = useState<AgodaHotelMapFormState | null>(null);
  const [editingStayAreaMapId, setEditingStayAreaMapId] = useState<string | null>(null);
  const [stayAreaMapForm, setStayAreaMapForm] = useState<StayAreaMapFormState | null>(null);
  const [hotelPickProviderFilter, setHotelPickProviderFilter] = useState<HotelPickProviderFilter>("all");
  const [hotelPickAgodaFilter, setHotelPickAgodaFilter] = useState<HotelPickAgodaFilter>("all");
  const [hotelPickPageFilter, setHotelPickPageFilter] = useState("all");
  const [hotelPickAreaFilter, setHotelPickAreaFilter] = useState("all");
  const [hotelPickHealthFilter, setHotelPickHealthFilter] = useState<HotelPickHealthFilter>("all");
  const [localHotelPicks, setLocalHotelPicks] = useState<LocalHotelPickEntry[]>([]);
  const [editingLocalPickId, setEditingLocalPickId] = useState<string | null>(null);
  const [localPickForm, setLocalPickForm] = useState<LocalHotelPickFormState | null>(null);
  const [localPickCityFilter, setLocalPickCityFilter] = useState<LocalHotelPickCityFilter>("all");
  const [localPickStatusFilter, setLocalPickStatusFilter] = useState<LocalHotelPickStatusFilter>("all");
  const [localPickAgodaFilter, setLocalPickAgodaFilter] = useState<LocalHotelPickAgodaFilter>("all");

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/affiliate-links", {
        headers: adminToken ? { "x-admin-token": adminToken } : {},
      });
      if (res.status === 401) {
        setMessage({ text: "管理トークンを入力してください", ok: false });
        return;
      }
      const data = await res.json();
      setLinks(
        Object.entries(data).map(([id, config]) => ({
          id,
          ...(config as LinkConfig),
        })),
      );
    } catch {
      setMessage({ text: "データの読み込みに失敗しました", ok: false });
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  const fetchHotelLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/hotel-links", {
        headers: adminToken ? { "x-admin-token": adminToken } : {},
      });
      if (res.status === 401) return;
      const data = await res.json();
      setHotelLinks(
        Object.entries(data).map(([id, config]) => ({
          id,
          ...(config as HotelLinkConfig),
        })),
      );
    } catch {
      setMessage({ text: "ホテルリンクの読み込みに失敗しました", ok: false });
    }
  }, [adminToken]);

  const fetchHotelAffiliateLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/hotel-affiliate-links", {
        headers: adminToken ? { "x-admin-token": adminToken } : {},
      });
      if (res.status === 401) return;
      const data = await res.json();
      setHotelAffiliateLinks(
        Object.entries(data).map(([id, config]) => ({
          id,
          ...(config as HotelAffiliateLinkConfig),
        })),
      );
    } catch {
      setMessage({ text: "Hotel Affiliate Linksの読み込みに失敗しました", ok: false });
    }
  }, [adminToken]);

  const fetchBookingDestinations = useCallback(async () => {
    try {
      const res = await fetch("/api/booking-hotel-destinations", {
        headers: adminToken ? { "x-admin-token": adminToken } : {},
      });
      if (res.status === 401) return;
      const data = await res.json();
      setBookingDestinations(
        Object.entries(data).map(([id, config]) => ({
          id,
          ...(config as BookingHotelDestinationConfig),
        })),
      );
    } catch {
      setMessage({ text: "Booking Destinationsの読み込みに失敗しました", ok: false });
    }
  }, [adminToken]);

  const fetchStayHotelPicks = useCallback(async () => {
    try {
      const res = await fetch("/api/stay-hotel-picks", {
        headers: adminToken ? { "x-admin-token": adminToken } : {},
      });
      if (res.status === 401) return;
      const data = await res.json();
      setStayHotelPicks(
        Object.entries(data).map(([slug, picks]) => ({
          slug,
          picks: Array.isArray(picks) ? (picks as StayHotelPickEntry[]) : [],
        })),
      );
    } catch {
      setMessage({ text: "おすすめホテルの読み込みに失敗しました", ok: false });
    }
  }, [adminToken]);

  const fetchHotelPickLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/hotel-pick-links", {
        headers: adminToken ? { "x-admin-token": adminToken } : {},
      });
      if (res.status === 401) return;
      const data = await res.json();
      setHotelPickLinks(
        Object.entries(data).map(([id, config]) => ({
          id,
          ...(config as Omit<HotelPickLinkEntry, "id">),
        })),
      );
    } catch {
      setMessage({ text: "ホテル個別リンクの読み込みに失敗しました", ok: false });
    }
  }, [adminToken]);

  const fetchAgodaHotelMaps = useCallback(async () => {
    try {
      const res = await fetch("/api/agoda-hotel-maps", {
        headers: adminToken ? { "x-admin-token": adminToken } : {},
      });
      if (res.status === 401) return;
      const data = await res.json();
      setAgodaHotelMaps(
        Object.entries(data).map(([id, config]) => ({
          ...(config as AgodaHotelMapConfig),
          id,
        })),
      );
    } catch {
      setMessage({ text: "Agoda Hotel Mapの読み込みに失敗しました", ok: false });
    }
  }, [adminToken]);

  const fetchStayAreaMaps = useCallback(async () => {
    try {
      const res = await fetch("/api/stay-area-maps", {
        headers: adminToken ? { "x-admin-token": adminToken } : {},
      });
      if (res.status === 401) return;
      const data = await res.json();
      setStayAreaMaps(
        Object.entries(data).map(([id, config]) => ({
          ...(config as StayAreaMapConfig),
          id,
        })),
      );
    } catch {
      setMessage({ text: "Stay Area Mapsの読み込みに失敗しました", ok: false });
    }
  }, [adminToken]);

  const fetchLocalHotelPicks = useCallback(async () => {
    try {
      const res = await fetch("/api/local-hotel-picks", {
        headers: adminToken ? { "x-admin-token": adminToken } : {},
      });
      if (res.status === 401) return;
      const data = await res.json();
      setLocalHotelPicks(
        Object.entries(data).map(([id, config]) => ({
          ...(config as Omit<LocalHotelPickEntry, "id">),
          id,
        })),
      );
    } catch {
      setMessage({ text: "Local Hotel Picksの読み込みに失敗しました", ok: false });
    }
  }, [adminToken]);

  useEffect(() => {
    const saved = sessionStorage.getItem("fujiseat_admin_token") || "";
    setAdminToken(saved);
  }, []);

  useEffect(() => {
    fetchLinks();
    fetchHotelLinks();
    fetchBookingDestinations();
    fetchHotelAffiliateLinks();
    fetchStayHotelPicks();
    fetchHotelPickLinks();
    fetchAgodaHotelMaps();
    fetchStayAreaMaps();
    fetchLocalHotelPicks();
  }, [fetchLinks, fetchHotelLinks, fetchBookingDestinations, fetchHotelAffiliateLinks, fetchStayHotelPicks, fetchHotelPickLinks, fetchAgodaHotelMaps, fetchStayAreaMaps, fetchLocalHotelPicks]);

  const flash = (text: string, ok: boolean) => {
    setMessage({ text, ok });
    setTimeout(() => setMessage(null), 3000);
  };

  const startEdit = (entry: LinkEntry) => {
    setEditingId(entry.id);
    setShowAdd(false);
    setKlookUrlInput("");
    setForm({
      id: entry.id,
      label: entry.label,
      provider: entry.provider,
      adid: entry.adid,
      klookPath: entry.klookPath,
      directUrl: entry.directUrl,
      usedOn: entry.usedOn.join(", "),
    });
  };

  const startAdd = () => {
    setEditingId(null);
    setShowAdd(true);
    setForm(EMPTY_FORM);
  };

  const startAddTransportAffiliate = (item: MissingTransportAffiliate) => {
    setEditingId(null);
    setShowAdd(true);
    setKlookUrlInput("");
    setForm({
      id: item.id,
      label: item.label,
      provider: item.provider,
      adid: item.provider === "klook" ? "" : "",
      klookPath: "",
      directUrl: "",
      usedOn: item.usedOn,
    });
    setTab("todo");
  };

  const cancel = () => {
    setEditingId(null);
    setShowAdd(false);
    setKlookUrlInput("");
  };

  const startHotelEdit = (entry: HotelEntry) => {
    setEditingHotelId(entry.id);
    setHotelForm({
      id: entry.id,
      areaName: entry.areaName,
      city: entry.city,
      label: entry.label,
      primaryProvider: entry.primaryProvider ?? "trip",
      agodaUrl: entry.agodaUrl ?? "",
      tripUrl: entry.tripUrl,
      fallbackProvider: entry.fallbackProvider ?? "trip",
      fallbackLinkId: entry.fallbackLinkId,
      checkinType: entry.checkinType ?? "dynamic_offset",
      lastChecked: entry.lastChecked ?? "",
    });
    setEditingId(null);
    setShowAdd(false);
  };

  const cancelHotelEdit = () => {
    setEditingHotelId(null);
    setHotelForm(null);
  };

  const updateHotelForm = (field: keyof HotelFormState, value: string) =>
    setHotelForm((prev) => (prev ? { ...prev, [field]: value } : prev));

  const startHotelAffiliateEdit = (entry: HotelAffiliateEntry) => {
    setEditingHotelAffiliateId(entry.id);
    setHotelAffiliateForm({ ...entry });
    setEditingId(null);
    setShowAdd(false);
    cancelHotelEdit();
  };

  const cancelHotelAffiliateEdit = () => {
    setEditingHotelAffiliateId(null);
    setHotelAffiliateForm(null);
  };

  const updateHotelAffiliateForm = (field: keyof HotelAffiliateFormState, value: string | boolean | number) =>
    setHotelAffiliateForm((prev) => (prev ? { ...prev, [field]: value } : prev));

  const startBookingDestinationEdit = (entry: BookingDestinationEntry) => {
    setEditingBookingDestinationId(entry.id);
    setBookingDestinationForm({ ...entry });
    setEditingId(null);
    setShowAdd(false);
    cancelHotelEdit();
    cancelHotelAffiliateEdit();
  };

  const cancelBookingDestinationEdit = () => {
    setEditingBookingDestinationId(null);
    setBookingDestinationForm(null);
  };

  const updateBookingDestinationForm = (field: keyof BookingDestinationFormState, value: string) =>
    setBookingDestinationForm((prev) => (prev ? { ...prev, [field]: value } : prev));

  const startHotelPickLinkEdit = (entry: HotelPickLinkEntry) => {
    setEditingHotelPickLinkId(entry.id);
    setHotelPickLinkForm({
      id: entry.id,
      name: entry.name,
      hotelKey: entry.hotelKey,
      primaryProvider: entry.primaryProvider ?? "trip",
      agodaUrl: entry.agodaUrl ?? "",
      tripUrl: entry.tripUrl,
      label: entry.label,
      lastChecked: entry.lastChecked ?? "",
    });
    setEditingId(null);
    setShowAdd(false);
    cancelHotelEdit();
  };

  const startAgodaHotelMapEdit = (entry: AgodaHotelMapEntry) => {
    setEditingAgodaHotelMapId(entry.id);
    setAgodaHotelMapForm({ ...entry });
    setEditingId(null);
    setShowAdd(false);
    cancelHotelEdit();
    cancelHotelPickLinkEdit();
  };

  const startStayAreaMapEdit = (entry: StayAreaMapEntry) => {
    setEditingStayAreaMapId(entry.id);
    setStayAreaMapForm({
      ...entry,
      disclaimer: entry.disclaimer || DEFAULT_STAY_AREA_MAP_DISCLAIMER,
    });
    setEditingId(null);
    setShowAdd(false);
    cancelHotelEdit();
    cancelHotelPickLinkEdit();
    cancelAgodaHotelMapEdit();
  };

  const cancelHotelPickLinkEdit = () => {
    setEditingHotelPickLinkId(null);
    setHotelPickLinkForm(null);
  };

  const cancelAgodaHotelMapEdit = () => {
    setEditingAgodaHotelMapId(null);
    setAgodaHotelMapForm(null);
  };

  const cancelStayAreaMapEdit = () => {
    setEditingStayAreaMapId(null);
    setStayAreaMapForm(null);
  };

  const updateHotelPickLinkForm = (field: keyof HotelPickLinkFormState, value: string) =>
    setHotelPickLinkForm((prev) => (prev ? { ...prev, [field]: value } : prev));

  const updateAgodaHotelMapForm = (field: keyof AgodaHotelMapFormState, value: string) =>
    setAgodaHotelMapForm((prev) => (prev ? { ...prev, [field]: value } : prev));

  const updateStayAreaMapForm = (field: keyof StayAreaMapFormState, value: string) =>
    setStayAreaMapForm((prev) => (prev ? { ...prev, [field]: value } : prev));

  const startLocalPickEdit = (entry: LocalHotelPickEntry) => {
    setEditingLocalPickId(entry.id);
    setLocalPickForm({ ...entry });
    setEditingId(null);
    setShowAdd(false);
    cancelHotelEdit();
    cancelHotelPickLinkEdit();
    cancelAgodaHotelMapEdit();
    cancelStayAreaMapEdit();
  };

  const cancelLocalPickEdit = () => {
    setEditingLocalPickId(null);
    setLocalPickForm(null);
  };

  const updateLocalPickForm = (field: keyof LocalHotelPickFormState, value: string | string[]) =>
    setLocalPickForm((prev) => (prev ? { ...prev, [field]: value } : prev));

  const saveLocalPick = async () => {
    if (!localPickForm) return;
    setSaving(true);
    try {
      const config: LocalHotelPickEntry = {
        id: localPickForm.id,
        city: localPickForm.city.trim(),
        area: localPickForm.area.trim(),
        hotelName: localPickForm.hotelName.trim(),
        bestFor: localPickForm.bestFor.trim(),
        localReason: localPickForm.localReason.trim(),
        notIdealFor: localPickForm.notIdealFor.trim(),
        tags: localPickForm.tags.map((t) => t.trim()).filter(Boolean),
        agodaUrl: localPickForm.agodaUrl.trim(),
        tripFallbackUrl: localPickForm.tripFallbackUrl.trim(),
        officialUrl: localPickForm.officialUrl.trim(),
        status: localPickForm.status,
        lastChecked: localPickForm.lastChecked.trim(),
      };
      const res = await fetch("/api/local-hotel-picks", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
        body: JSON.stringify({ id: localPickForm.id, config }),
      });
      if (!res.ok) throw new Error();
      flash("Local Hotel Pickを保存しました", true);
      cancelLocalPickEdit();
      await fetchLocalHotelPicks();
    } catch {
      flash("Local Hotel Pickの保存に失敗しました", false);
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    const id = form.id.trim();
    if (!id || !form.label.trim()) {
      flash("ID と商品名は必須です", false);
      return;
    }
    setSaving(true);
    try {
      const existingEntry = links.find((entry) => entry.id === id);
      const existingConfig: Partial<LinkConfig> = existingEntry ? { ...existingEntry } : {};
      delete (existingConfig as Partial<LinkConfig> & { id?: string }).id;
      const config: LinkConfig = {
        ...existingConfig,
        label: form.label.trim(),
        provider: form.provider,
        adid: form.adid.trim(),
        klookPath: form.klookPath.trim(),
        directUrl: form.directUrl.trim(),
        usedOn: form.usedOn.split(",").map((s) => s.trim()).filter(Boolean),
        ...(form.provider === "omio" && form.directUrl.trim() ? { urlStatus: "ready" as const } : {}),
      };
      const res = await fetch("/api/affiliate-links", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
        body: JSON.stringify({ id, config }),
      });
      if (!res.ok) throw new Error();
      flash(showAdd ? "追加しました" : "保存しました", true);
      cancel();
      await fetchLinks();
    } catch {
      flash("保存に失敗しました（本番環境では編集不可）", false);
    } finally {
      setSaving(false);
    }
  };

  const saveHotel = async () => {
    if (!hotelForm) return;
    setSaving(true);
    try {
      const config: HotelLinkConfig = {
        areaName: hotelForm.areaName.trim(),
        city: hotelForm.city.trim(),
        label: hotelForm.label.trim(),
        primaryProvider: hotelForm.primaryProvider,
        agodaUrl: hotelForm.agodaUrl.trim(),
        tripUrl: hotelForm.tripUrl.trim(),
        fallbackProvider: hotelForm.fallbackProvider,
        fallbackLinkId: hotelForm.fallbackLinkId.trim(),
        checkinType: hotelForm.checkinType,
        lastChecked: hotelForm.lastChecked.trim(),
      };
      const res = await fetch("/api/hotel-links", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
        body: JSON.stringify({ id: hotelForm.id, config }),
      });
      if (!res.ok) throw new Error();
      flash("Trip.comホテルリンクを保存しました", true);
      cancelHotelEdit();
      await fetchHotelLinks();
    } catch {
      flash("ホテルリンクの保存に失敗しました", false);
    } finally {
      setSaving(false);
    }
  };

  const saveHotelAffiliate = async () => {
    if (!hotelAffiliateForm) return;
    setSaving(true);
    try {
      const config: HotelAffiliateLinkConfig = {
        provider: "booking_travelpayouts",
        area_id: hotelAffiliateForm.area_id.trim(),
        locale: hotelAffiliateForm.locale.trim() || "all",
        placement: hotelAffiliateForm.placement,
        page_group: hotelAffiliateForm.page_group?.trim() || "",
        destination_ref: hotelAffiliateForm.destination_ref?.trim() || "",
        destination_url: hotelAffiliateForm.destination_url.trim(),
        affiliate_url: hotelAffiliateForm.affiliate_url.trim(),
        sub_id: hotelAffiliateForm.sub_id.trim(),
        enabled: hotelAffiliateForm.enabled,
        priority: Number(hotelAffiliateForm.priority) || 10,
        last_checked_at: hotelAffiliateForm.last_checked_at.trim(),
        notes: hotelAffiliateForm.notes.trim(),
      };
      const res = await fetch("/api/hotel-affiliate-links", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
        body: JSON.stringify({ id: hotelAffiliateForm.id, config }),
      });
      if (!res.ok) throw new Error();
      flash("Hotel Affiliate Linkを保存しました", true);
      cancelHotelAffiliateEdit();
      await fetchHotelAffiliateLinks();
    } catch {
      flash("Hotel Affiliate Linkの保存に失敗しました", false);
    } finally {
      setSaving(false);
    }
  };

  const saveBookingDestination = async () => {
    if (!bookingDestinationForm) return;
    setSaving(true);
    try {
      const config: BookingHotelDestinationConfig = {
        area_id: bookingDestinationForm.area_id.trim(),
        label: bookingDestinationForm.label.trim(),
        booking_query_label: bookingDestinationForm.booking_query_label.trim(),
        booking_scope: bookingDestinationForm.booking_scope,
        destination_url: bookingDestinationForm.destination_url.trim(),
        affiliate_url: bookingDestinationForm.affiliate_url.trim(),
        inventory_confidence: bookingDestinationForm.inventory_confidence,
        url_status: bookingDestinationForm.url_status,
        last_checked_at: bookingDestinationForm.last_checked_at.trim(),
        notes: bookingDestinationForm.notes.trim(),
      };
      const res = await fetch("/api/booking-hotel-destinations", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
        body: JSON.stringify({ id: bookingDestinationForm.id, config }),
      });
      if (!res.ok) throw new Error();
      flash("Booking Destinationを保存しました", true);
      cancelBookingDestinationEdit();
      await fetchBookingDestinations();
    } catch {
      flash("Booking Destinationの保存に失敗しました", false);
    } finally {
      setSaving(false);
    }
  };

  const saveHotelPickLink = async () => {
    if (!hotelPickLinkForm) return;
    setSaving(true);
    try {
      const config = {
        name: hotelPickLinkForm.name.trim(),
        hotelKey: hotelPickLinkForm.hotelKey.trim(),
        primaryProvider: hotelPickLinkForm.primaryProvider ?? "trip",
        agodaUrl: hotelPickLinkForm.agodaUrl?.trim() ?? "",
        tripUrl: hotelPickLinkForm.tripUrl.trim(),
        label: hotelPickLinkForm.label.trim() || `Check ${hotelPickLinkForm.name.trim()}`,
        lastChecked: hotelPickLinkForm.lastChecked?.trim() || "",
      };
      const res = await fetch("/api/hotel-pick-links", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
        body: JSON.stringify({ id: hotelPickLinkForm.id, config }),
      });
      if (!res.ok) throw new Error();
      flash("ホテル個別リンクを保存しました", true);
      cancelHotelPickLinkEdit();
      await fetchHotelPickLinks();
    } catch {
      flash("ホテル個別リンクの保存に失敗しました", false);
    } finally {
      setSaving(false);
    }
  };

  const saveAgodaHotelMap = async () => {
    if (!agodaHotelMapForm) return;
    setSaving(true);
    try {
      const config: AgodaHotelMapConfig = {
        id: agodaHotelMapForm.id,
        label: agodaHotelMapForm.label.trim(),
        areaName: agodaHotelMapForm.areaName.trim(),
        city: agodaHotelMapForm.city.trim(),
        country: agodaHotelMapForm.country.trim(),
        status: agodaHotelMapForm.status,
        placementDefault: agodaHotelMapForm.placementDefault.trim(),
        embedCode: agodaHotelMapForm.embedCode.trim(),
        scriptUrl: agodaHotelMapForm.scriptUrl.trim(),
        iframeUrl: agodaHotelMapForm.iframeUrl.trim(),
        notes: agodaHotelMapForm.notes.trim(),
        lastChecked: agodaHotelMapForm.lastChecked.trim(),
      };
      const res = await fetch("/api/agoda-hotel-maps", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
        body: JSON.stringify({ id: agodaHotelMapForm.id, config }),
      });
      if (!res.ok) throw new Error();
      flash("Agoda Hotel Mapを保存しました", true);
      cancelAgodaHotelMapEdit();
      await fetchAgodaHotelMaps();
    } catch {
      flash("Agoda Hotel Mapの保存に失敗しました", false);
    } finally {
      setSaving(false);
    }
  };

  const saveStayAreaMap = async () => {
    if (!stayAreaMapForm) return;
    if (!stayAreaMapForm.alt.trim()) {
      flash("alt は必須です", false);
      return;
    }
    setSaving(true);
    try {
      const config: StayAreaMapConfig = {
        id: stayAreaMapForm.id,
        src: stayAreaMapForm.src.trim(),
        title: stayAreaMapForm.title?.trim() ?? "",
        alt: stayAreaMapForm.alt.trim(),
        caption: stayAreaMapForm.caption?.trim() ?? "",
        disclaimer: stayAreaMapForm.disclaimer?.trim() || DEFAULT_STAY_AREA_MAP_DISCLAIMER,
        status: stayAreaMapForm.status,
        lastChecked: stayAreaMapForm.lastChecked.trim(),
      };
      const res = await fetch("/api/stay-area-maps", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
        body: JSON.stringify({ id: stayAreaMapForm.id, config }),
      });
      if (!res.ok) throw new Error();
      flash("Stay Area Mapを保存しました", true);
      cancelStayAreaMapEdit();
      await fetchStayAreaMaps();
    } catch {
      flash("Stay Area Mapの保存に失敗しました", false);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(`「${id}」を削除しますか？`)) return;
    try {
      const res = await fetch("/api/affiliate-links", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      flash("削除しました", true);
      if (editingId === id) cancel();
      await fetchLinks();
    } catch {
      flash("削除に失敗しました", false);
    }
  };

  const updateForm = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const parseKlookUrl = (url: string) => {
    setKlookUrlInput(url);
    try {
      const u = new URL(url.trim());
      const adid = u.searchParams.get("aff_adid");
      if (adid) {
        setForm((prev) => ({ ...prev, adid, directUrl: url.trim() }));
        flash(`設定完了！そのまま保存してください`, true);
      }
    } catch { /* not a valid URL, ignore */ }
  };

  // ─── Computed ─────────────────────────────────────────────────────────────

  const byProvider = (provider: string) =>
    links.filter((l) => l.provider === provider);

  const todoItems = links.filter((l) => getStatus(l) !== "done");
  const doneItems = links.filter((l) => getStatus(l) === "done");
  const missingTransportAffiliateItems = RECOMMENDED_TRANSPORT_AFFILIATE_LINKS.filter((item) => !links.some((link) => link.id === item.id && getStatus(link) === "done"));
  const tripHotelDoneCount = hotelLinks.filter((h) => h.tripUrl.trim()).length;
  const bookingDestinationActiveCount = bookingDestinations.filter((destination) => destination.url_status === "active" && destination.affiliate_url.trim()).length;
  const bookingHotelReadyCount = hotelAffiliateLinks.filter((link) => {
    if (!link.enabled) return false;
    if (link.destination_ref?.trim()) {
      const destination = bookingDestinations.find((item) => item.id === link.destination_ref);
      return Boolean(destination && destination.url_status === "active" && destination.affiliate_url.trim());
    }
    return Boolean(link.affiliate_url.trim());
  }).length;
  const hotelPickLinkUrlCount = hotelPickLinks.filter((pick) => pick.tripUrl.trim()).length;
  const stayAreaMapActiveCount = stayAreaMaps.filter((map) => map.status === "active").length;

  const localPickActiveCount = localHotelPicks.filter((p) => p.status === "active").length;
  const localPickDraftCount = localHotelPicks.filter((p) => p.status === "draft").length;
  const localPickAgodaFilledCount = localHotelPicks.filter((p) => p.agodaUrl.trim()).length;
  const localPickAgodaMissingCount = localHotelPicks.filter((p) => !p.agodaUrl.trim()).length;
  const filteredLocalPicks = localHotelPicks.filter((p) => {
    if (localPickCityFilter !== "all" && p.city !== localPickCityFilter) return false;
    if (localPickStatusFilter !== "all" && p.status !== localPickStatusFilter) return false;
    if (localPickAgodaFilter === "missing" && p.agodaUrl.trim()) return false;
    if (localPickAgodaFilter === "present" && !p.agodaUrl.trim()) return false;
    return true;
  });

  const hotelPickUsage = stayHotelPicks.reduce<Record<string, { slug: string; area: string; tag?: string }[]>>((acc, group) => {
    for (const pick of group.picks) {
      if (!acc[pick.id]) acc[pick.id] = [];
      acc[pick.id].push({ slug: group.slug, area: pick.area, tag: pick.tag });
    }
    return acc;
  }, {});

  const todoByProvider = Object.entries(
    todoItems.reduce<Record<string, LinkEntry[]>>((acc, l) => {
      const key = l.provider;
      if (!acc[key]) acc[key] = [];
      acc[key].push(l);
      return acc;
    }, {}),
  );

  const hotelAreaPrimaryAgodaMissing = hotelLinks.filter(
    (entry) => entry.primaryProvider === "agoda" && !entry.agodaUrl?.trim(),
  );
  const hotelAreaAgodaPriorityLinks = AGODA_PRIORITY_AREA_LINK_IDS.map((id) => hotelLinks.find((entry) => entry.id === id))
    .filter((entry): entry is HotelEntry => Boolean(entry));
  const hotelAreaAgodaPriorityMissing = hotelAreaAgodaPriorityLinks.filter((entry) => !entry.agodaUrl?.trim());
  const hotelPickPrimaryAgodaMissing = hotelPickLinks.filter(
    (entry) => entry.primaryProvider === "agoda" && !entry.agodaUrl?.trim(),
  );
  const hotelPickAgodaPresentTripPrimary = hotelPickLinks.filter(
    (entry) => Boolean(entry.agodaUrl?.trim()) && (entry.primaryProvider ?? "trip") === "trip",
  );
  const hotelPickMissingAllUrls = hotelPickLinks.filter(
    (entry) => !entry.agodaUrl?.trim() && !entry.tripUrl.trim(),
  );
  const hotelPickPossibleMismatches = hotelPickLinks.filter(hasPossibleHotelUrlMismatch);
  const hotelPickUsedThreePlus = hotelPickLinks.filter((entry) => (hotelPickUsage[entry.id] ?? []).length >= 3);
  const hotelPickPageOptions = stayHotelPicks.map((group) => group.slug).sort();
  const hotelPickAreaOptions = Array.from(new Set(hotelPickLinks.map((entry) => entry.hotelKey))).sort();
  const filteredHotelPickLinks = hotelPickLinks.filter((entry) => {
    const usages = hotelPickUsage[entry.id] ?? [];
    const hasAgodaUrl = Boolean(entry.agodaUrl?.trim());
    const hasTripUrl = Boolean(entry.tripUrl.trim());
    const provider = entry.primaryProvider ?? "trip";

    if (hotelPickProviderFilter !== "all" && provider !== hotelPickProviderFilter) return false;
    if (hotelPickAgodaFilter === "missing" && hasAgodaUrl) return false;
    if (hotelPickAgodaFilter === "present" && !hasAgodaUrl) return false;
    if (hotelPickPageFilter !== "all" && !usages.some((usage) => usage.slug === hotelPickPageFilter)) return false;
    if (hotelPickAreaFilter !== "all" && entry.hotelKey !== hotelPickAreaFilter) return false;
    if (hotelPickHealthFilter === "primary-agoda-missing" && !(provider === "agoda" && !hasAgodaUrl)) return false;
    if (hotelPickHealthFilter === "agoda-present-trip-primary" && !(hasAgodaUrl && provider === "trip")) return false;
    if (hotelPickHealthFilter === "missing-all-urls" && (hasAgodaUrl || hasTripUrl)) return false;
    if (hotelPickHealthFilter === "possible-mismatch" && !hasPossibleHotelUrlMismatch(entry)) return false;
    if (hotelPickHealthFilter === "used-3-plus" && usages.length < 3) return false;
    return true;
  });

  // ─── Inline Form ─────────────────────────────────────────────────────────

  const formUI = (
    <div className="space-y-3 rounded-xl border border-sky-200 bg-sky-50/50 p-4">
      <p className="text-xs font-semibold text-sky-900">
        {showAdd ? "新しいリンクを追加" : `「${form.label}」を編集中`}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-[10px] font-semibold text-slate-500">ID（英数字）</label>
          <input
            value={form.id}
            onChange={(e) => updateForm("id", e.target.value)}
            disabled={editingId !== null}
            placeholder="bookingShinjuku"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-sky-300 disabled:bg-slate-100 disabled:text-slate-400"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-slate-500">商品名</label>
          <input
            value={form.label}
            onChange={(e) => updateForm("label", e.target.value)}
            placeholder="Shinjuku Hotels"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-sky-300"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-slate-500">プロバイダー</label>
          <select
            value={form.provider}
            onChange={(e) => updateForm("provider", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-sky-300"
          >
            <option value="klook">Klook</option>
            <option value="omio">Omio</option>
            <option value="trip">Trip.com</option>
            <option value="agoda">Agoda</option>
            <option value="getyourguide">GetYourGuide</option>
            <option value="safetywing">SafetyWing</option>
            <option value="other">その他</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-slate-500">使用場所（カンマ区切り）</label>
          <input
            value={form.usedOn}
            onChange={(e) => updateForm("usedOn", e.target.value)}
            placeholder="Stay, Itineraries"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-sky-300"
          />
        </div>
      </div>

      {form.provider === "klook" ? (
        <div>
          <label className="text-[10px] font-bold text-orange-700">
            Klook のアフィリエイトURLを貼り付け
          </label>
          <input
            value={klookUrlInput || form.directUrl}
            onChange={(e) => parseKlookUrl(e.target.value)}
            placeholder="https://affiliate.klook.com/redirect?aid=104861&aff_adid=...&k_site=..."
            className="mt-1 w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-xs outline-none focus:border-orange-400"
          />
          {form.directUrl ? (
            <p className="mt-1 text-[10px] font-medium text-emerald-600">
              URL 設定済み（Ad ID: {form.adid}）— このまま保存でOK
            </p>
          ) : (
            <p className="mt-1 text-[10px] text-orange-600">
              Klook で生成したアフィリエイトURLをそのまま貼るだけ！
            </p>
          )}
        </div>
      ) : (
        <div>
          <label className="text-[10px] font-semibold text-slate-500">
            アフィリエイトURL（{ps(form.provider).label} で生成したリンクを貼る）
          </label>
          <input
            value={form.directUrl}
            onChange={(e) => updateForm("directUrl", e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-sky-300"
          />
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存する"}
        </button>
        <button
          onClick={cancel}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          キャンセル
        </button>
      </div>
    </div>
  );

  // ─── Link Card ────────────────────────────────────────────────────────────

  function LinkCard({ entry }: { entry: LinkEntry }) {
    const style = ps(entry.provider);
    const status = getStatus(entry);
    const sc = STATUS_CONFIG[status];
    const placements = PLACEMENTS[entry.id];

    if (editingId === entry.id) return <div key={entry.id}>{formUI}</div>;

    return (
      <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${sc.bg}`}>
        <div className="px-4 py-3">
          <div className="flex items-start gap-3">
            {/* Status dot */}
            <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${sc.dot}`} title={sc.label} />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">{entry.label}</p>
                <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${style.badge}`}>
                  {style.label}
                </span>
                {status !== "done" && (
                  <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${status === "needs-adid" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                    {sc.label}
                  </span>
                )}
              </div>
              {/* What this link currently points to */}
              <p className="mt-0.5 text-[10px] text-slate-400">
                {status === "done"
                  ? entry.provider === "klook"
                    ? `klook.com/${entry.klookPath.slice(0, 40)}… (adid: ${entry.adid})`
                    : entry.directUrl.slice(0, 60) + "…"
                  : entry.provider === "klook"
                    ? `Klook で「${entry.label}」の広告を作成 → adid を取得してここに入力`
                    : `${style.label} で「${entry.label}」のアフィリエイトリンクを生成 → ここに貼る`}
              </p>
              {(entry.adminTitle || entry.routeFrom || entry.routeTo || entry.targetUrl || entry.urlStatus) && (
                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] leading-4 text-slate-600">
                  <div className="flex flex-wrap gap-2">
                    {entry.adminTitle ? <span className="font-bold text-slate-800">{entry.adminTitle}</span> : null}
                    {entry.urlStatus ? <span className="rounded bg-white px-1.5 py-0.5 font-bold text-slate-700">status: {entry.urlStatus}</span> : null}
                    {entry.product ? <span className="rounded bg-white px-1.5 py-0.5 font-bold text-slate-700">{entry.product}</span> : null}
                  </div>
                  {entry.routeFrom || entry.routeTo ? (
                    <p className="mt-1">Route: {entry.routeFrom || "?"} → {entry.routeTo || "?"}</p>
                  ) : null}
                  {entry.targetUrl ? <p className="mt-1 break-all">Target: {entry.targetUrl}</p> : null}
                  {entry.adminNotes ? <p className="mt-1 text-slate-500">{entry.adminNotes}</p> : null}
                </div>
              )}
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => startEdit(entry)}
                className={`rounded-lg px-2.5 py-1.5 text-[10px] font-medium ${status !== "done" ? "bg-sky-100 text-sky-700 hover:bg-sky-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {status !== "done" ? "設定する" : "編集"}
              </button>
              <button
                onClick={() => remove(entry.id)}
                className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-medium text-red-500 hover:bg-red-50"
              >
                削除
              </button>
            </div>
          </div>

          {/* Where this link is used */}
          {placements && (
            <div className="mt-2 flex flex-wrap gap-1.5 pl-6">
              {placements.map((p, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[10px] text-slate-600">
                  <span>{p.emoji}</span>
                  <span className="font-medium">{p.page}</span>
                  <span className="text-slate-400">·</span>
                  <span>{p.section}</span>
                </span>
              ))}
            </div>
          )}
          {!placements && (
            <p className="mt-2 pl-6 text-[10px] text-slate-400">
              コードで <code className="rounded bg-slate-100 px-1">getAffUrl(&quot;{entry.id}&quot;)</code> を使って配置
            </p>
          )}
        </div>
      </div>
    );
  }

  function HotelLinkCard({ entry }: { entry: HotelEntry }) {
    const hasTripUrl = Boolean(entry.tripUrl.trim());
    const hasAgodaUrl = Boolean(entry.agodaUrl?.trim());
    const isEditing = editingHotelId === entry.id && hotelForm;
    const primaryProvider = entry.primaryProvider ?? "trip";
    const showAgodaEmptyWarning = primaryProvider === "agoda" && !hasAgodaUrl;

    if (isEditing) {
      const editingAgodaEmptyWarning = hotelForm.primaryProvider === "agoda" && !hotelForm.agodaUrl.trim();
      return (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-500">エリアID</label>
              <input
                value={hotelForm.id}
                disabled
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">表示エリア名</label>
              <input
                value={hotelForm.areaName}
                onChange={(e) => updateHotelForm("areaName", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-300"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">都市</label>
              <input
                value={hotelForm.city}
                onChange={(e) => updateHotelForm("city", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-300"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">未設定時のfallback ID</label>
              <input
                value={hotelForm.fallbackLinkId}
                onChange={(e) => updateHotelForm("fallbackLinkId", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-300"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="text-[10px] font-semibold text-slate-500">ボタン文言</label>
            <input
              value={hotelForm.label}
              onChange={(e) => updateHotelForm("label", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-300"
            />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Primary provider</label>
              <select
                value={hotelForm.primaryProvider}
                onChange={(e) => updateHotelForm("primaryProvider", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-red-300"
              >
                <option value="trip">Trip.com primary</option>
                <option value="agoda">Agoda primary (optional broad city link only)</option>
              </select>
              <p className="mt-1 text-[10px] text-slate-500">
                Area links should usually stay Trip.com primary.
              </p>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Fallback provider</label>
              <select
                value={hotelForm.fallbackProvider}
                onChange={(e) => updateHotelForm("fallbackProvider", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-red-300"
              >
                <option value="trip">Trip.com fallback</option>
                <option value="agoda">Agoda fallback</option>
                <option value="klook">Klook fallback</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="text-[10px] font-bold text-red-700">Agoda URL (optional broad city link only)</label>
            <input
              value={hotelForm.agodaUrl}
              onChange={(e) => updateHotelForm("agodaUrl", e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-xs outline-none focus:border-red-400"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Use only for broad city links. Fine area links such as Shinjuku, Ueno, Kyoto Station, Namba and Umeda should usually use Trip.com.
            </p>
            {editingAgodaEmptyWarning ? (
              <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-semibold text-amber-800">
                Agoda URL is empty. For area links, Trip.com should usually be the primary provider.
              </p>
            ) : null}
          </div>
          <div className="mt-3">
            <label className="text-[10px] font-bold text-blue-700">Trip.com area search affiliate URL</label>
            <input
              value={hotelForm.tripUrl}
              onChange={(e) => updateHotelForm("tripUrl", e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-400"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Main field for Hotel Area Links. This keeps the existing dynamic redirect and GA4 provider=trip flow.
            </p>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-500">日付タイプ</label>
              <select
                value={hotelForm.checkinType}
                onChange={(e) => updateHotelForm("checkinType", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-300"
              >
                <option value="dynamic_offset">クリック時に today +45 / +46 へ更新</option>
                <option value="fixed_date">Trip.com URL内の日付をそのまま使う</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">最終確認日</label>
              <input
                value={hotelForm.lastChecked}
                onChange={(e) => updateHotelForm("lastChecked", e.target.value)}
                placeholder="2026-05-02"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-300"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={saveHotel}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存する"}
            </button>
            <button
              onClick={cancelHotelEdit}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              キャンセル
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={`rounded-2xl border bg-white p-4 shadow-sm ${hasAgodaUrl ? "border-red-200" : hasTripUrl ? "border-blue-200" : "border-amber-200 bg-amber-50/30"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">{entry.areaName}</p>
              <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${primaryProvider === "trip" ? "border-blue-200 bg-blue-100 text-blue-800" : "border-red-200 bg-red-100 text-red-800"}`}>
                Primary: {primaryProvider}
              </span>
              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${hasAgodaUrl ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                {hasAgodaUrl ? "Agoda URL 設定済み" : "Agoda URL 未設定"}
              </span>
              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${hasTripUrl ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {hasTripUrl ? "Trip URL 設定済み" : "Trip URL 未設定"}
              </span>
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                {entry.checkinType === "fixed_date" ? "固定日付" : "動的日付"}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              {entry.city} / fallback: <code className="rounded bg-slate-100 px-1">{entry.fallbackProvider ?? "trip"} → {entry.fallbackLinkId}</code>
            </p>
            <p className="mt-1 truncate text-[10px] text-slate-400">
              {hasAgodaUrl ? entry.agodaUrl : hasTripUrl ? entry.tripUrl : "未設定時は既存fallbackリンクを使用"}
            </p>
            {showAgodaEmptyWarning ? (
              <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-semibold text-amber-800">
                Agoda URL is empty. For area links, Trip.com should usually be the primary provider.
              </p>
            ) : null}
          </div>
          <button
            onClick={() => startHotelEdit(entry)}
            className="shrink-0 rounded-lg bg-blue-100 px-3 py-1.5 text-[10px] font-semibold text-blue-700 hover:bg-blue-200"
          >
            編集
          </button>
        </div>
      </div>
    );
  }

  function HotelPickLinkCard({ entry }: { entry: HotelPickLinkEntry }) {
    const isEditing = editingHotelPickLinkId === entry.id && hotelPickLinkForm;
    const hasSpecificUrl = Boolean(entry.tripUrl.trim());
    const hasAgodaUrl = Boolean(entry.agodaUrl?.trim());
    const usages = hotelPickUsage[entry.id] ?? [];
    const primaryProvider = entry.primaryProvider ?? "trip";
    const possibleMismatch = hasPossibleHotelUrlMismatch(entry);
    const warningMessages = [
      primaryProvider === "agoda" && !hasAgodaUrl
        ? "Agoda URL is empty. Use Agoda only when agodaUrl is filled; otherwise use Trip.com."
        : "",
      hasAgodaUrl && primaryProvider === "trip"
        ? "Agoda URL is available. Consider setting primaryProvider to agoda."
        : "",
      !hasAgodaUrl && !hasSpecificUrl
        ? "No Agoda or Trip.com URL is set. This pick will fall back to the area search link."
        : "",
      possibleMismatch ? "Possible URL mismatch: hotel name and URL slug look different." : "",
    ].filter(Boolean);

    if (isEditing) {
      const editingHasAgodaUrl = Boolean(hotelPickLinkForm.agodaUrl?.trim());
      const editingHasTripUrl = Boolean(hotelPickLinkForm.tripUrl.trim());
      const editingPrimaryProvider = hotelPickLinkForm.primaryProvider ?? "trip";
      const editingWarnings = [
        editingPrimaryProvider === "agoda" && !editingHasAgodaUrl
          ? "Agoda URL is empty. Use Agoda only when agodaUrl is filled; otherwise use Trip.com."
          : "",
        editingHasAgodaUrl && editingPrimaryProvider === "trip"
          ? "Agoda URL is available. Consider setting primaryProvider to agoda."
          : "",
        !editingHasAgodaUrl && !editingHasTripUrl
          ? "No Agoda or Trip.com URL is set. This pick will fall back to the area search link."
          : "",
      ].filter(Boolean);
      return (
        <div className="rounded-2xl border border-orange-200 bg-orange-50/40 p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-500">ホテルID</label>
              <input
                value={hotelPickLinkForm.id}
                disabled
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">ホテル名</label>
              <input
                value={hotelPickLinkForm.name}
                onChange={(e) => updateHotelPickLinkForm("name", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-orange-300"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">fallback エリア hotelKey</label>
              <select
                value={hotelPickLinkForm.hotelKey}
                onChange={(e) => updateHotelPickLinkForm("hotelKey", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-orange-300"
              >
                {hotelLinks.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.id} / {hotel.areaName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">最終確認日</label>
              <input
                value={hotelPickLinkForm.lastChecked ?? ""}
                onChange={(e) => updateHotelPickLinkForm("lastChecked", e.target.value)}
                placeholder="2026-05-03"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-orange-300"
              />
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Primary provider</label>
              <select
                value={hotelPickLinkForm.primaryProvider ?? "trip"}
                onChange={(e) => updateHotelPickLinkForm("primaryProvider", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-red-300"
              >
                <option value="agoda">Agoda primary</option>
                <option value="trip">Trip.com primary</option>
              </select>
              <p className="mt-1 text-[10px] text-slate-500">
                Use Agoda only when agodaUrl is filled. Otherwise use Trip.com.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!editingHasAgodaUrl}
              onClick={() => updateHotelPickLinkForm("primaryProvider", "agoda")}
              className="rounded-lg bg-red-100 px-3 py-1.5 text-[10px] font-semibold text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Set primary to Agoda
            </button>
            <button
              type="button"
              onClick={() => updateHotelPickLinkForm("primaryProvider", "trip")}
              className="rounded-lg bg-blue-100 px-3 py-1.5 text-[10px] font-semibold text-blue-700 hover:bg-blue-200"
            >
              Set primary to Trip.com
            </button>
          </div>
          <div className="mt-3">
            <label className="text-[10px] font-bold text-red-700">Agoda individual hotel affiliate URL</label>
            <input
              value={hotelPickLinkForm.agodaUrl ?? ""}
              onChange={(e) => updateHotelPickLinkForm("agodaUrl", e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-xs outline-none focus:border-red-400"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Add Agoda URLs here only for specific hotel recommendation cards.
            </p>
          </div>
          <div className="mt-3">
            <label className="text-[10px] font-bold text-orange-700">Trip.com individual hotel fallback URL</label>
            <input
              value={hotelPickLinkForm.tripUrl}
              onChange={(e) => updateHotelPickLinkForm("tripUrl", e.target.value)}
              placeholder="https://www.trip.com/t/..."
              className="mt-1 w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-xs outline-none focus:border-orange-400"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Agoda URLが空の場合のfallbackとして残します。同じホテルが複数ページに出ていても、この1箇所を保存すれば全ページに反映されます。
            </p>
          </div>
          {editingWarnings.length > 0 ? (
            <div className="mt-3 space-y-2">
              {editingWarnings.map((warning) => (
                <p key={warning} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-semibold text-amber-800">
                  {warning}
                </p>
              ))}
            </div>
          ) : null}
          <div className="mt-3">
            <label className="text-[10px] font-semibold text-slate-500">ボタン文言</label>
            <input
              value={hotelPickLinkForm.label}
              onChange={(e) => updateHotelPickLinkForm("label", e.target.value)}
              placeholder="Check Hotel Name on Trip.com"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-orange-300"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={saveHotelPickLink}
              disabled={saving}
              className="rounded-lg bg-[#ff7a00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e66700] disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存する"}
            </button>
            <button
              onClick={cancelHotelPickLinkEdit}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              キャンセル
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={`rounded-2xl border bg-white p-4 shadow-sm ${hasAgodaUrl ? "border-red-200" : hasSpecificUrl ? "border-orange-200" : "border-slate-200"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">{entry.name}</p>
              <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${primaryProvider === "agoda" ? "border-red-200 bg-red-100 text-red-800" : "border-blue-200 bg-blue-100 text-blue-800"}`}>
                Primary: {primaryProvider}
              </span>
              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${hasAgodaUrl ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                {hasAgodaUrl ? "Agoda URL" : "Agoda未設定"}
              </span>
              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${hasSpecificUrl ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"}`}>
                {hasSpecificUrl ? "Trip URL" : "エリア検索fallback"}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              {usages.length}ページで使用 / fallback: <code className="rounded bg-slate-100 px-1">{entry.hotelKey}</code>
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {usages.map((usage) => (
                <span key={`${usage.slug}-${usage.area}-${usage.tag ?? ""}`} className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] text-slate-600">
                  {usage.slug} / {usage.area}{usage.tag ? ` / ${usage.tag}` : ""}
                </span>
              ))}
            </div>
            <p className="mt-1 truncate text-[10px] text-slate-400">
              {hasAgodaUrl ? entry.agodaUrl : hasSpecificUrl ? entry.tripUrl : "未設定時はエリア検索リンクを使用"}
            </p>
            {warningMessages.length > 0 ? (
              <div className="mt-2 space-y-1">
                {warningMessages.map((warning) => (
                  <p key={warning} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-semibold text-amber-800">
                    {warning}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
          <button
            onClick={() => startHotelPickLinkEdit(entry)}
            className="shrink-0 rounded-lg bg-orange-100 px-3 py-1.5 text-[10px] font-semibold text-orange-700 hover:bg-orange-200"
          >
            編集
          </button>
        </div>
      </div>
    );
  }

  function LocalHotelPickCard({ entry }: { entry: LocalHotelPickEntry }) {
    const isEditing = editingLocalPickId === entry.id && localPickForm;
    const hasAgodaUrl = Boolean(entry.agodaUrl.trim());
    const hasTripFallbackUrl = Boolean(entry.tripFallbackUrl.trim());
    const statusTone =
      entry.status === "active"
        ? "bg-emerald-100 text-emerald-700"
        : entry.status === "disabled"
          ? "bg-slate-100 text-slate-600"
          : "bg-amber-100 text-amber-700";
    const warningMessages = [
      !entry.hotelName.trim() ? "Hotel name is empty." : "",
      !entry.city.trim() ? "City is empty." : "",
      !entry.localReason.trim() ? "Local reason is empty." : "",
      !hasAgodaUrl && !hasTripFallbackUrl ? "No Agoda or Trip.com URL is set. The public card will not show a provider button." : "",
      entry.status === "active" && !hasAgodaUrl && !hasTripFallbackUrl
        ? "Active pick without provider URL. Add Agoda URL or Trip.com URL before promoting this pick."
        : "",
    ].filter(Boolean);

    if (isEditing) {
      return (
        <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-500">ID</label>
              <input value={localPickForm.id} disabled className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-500" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Hotel name</label>
              <input
                value={localPickForm.hotelName}
                onChange={(e) => updateLocalPickForm("hotelName", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-purple-300"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">City</label>
              <select
                value={localPickForm.city}
                onChange={(e) => updateLocalPickForm("city", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-purple-300"
              >
                <option value="Tokyo">Tokyo</option>
                <option value="Kyoto">Kyoto</option>
                <option value="Osaka">Osaka</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Area</label>
              <input
                value={localPickForm.area}
                onChange={(e) => updateLocalPickForm("area", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-purple-300"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Status</label>
              <select
                value={localPickForm.status}
                onChange={(e) => updateLocalPickForm("status", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-purple-300"
              >
                <option value="active">active</option>
                <option value="draft">draft</option>
                <option value="disabled">disabled</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Last checked</label>
              <input
                value={localPickForm.lastChecked}
                onChange={(e) => updateLocalPickForm("lastChecked", e.target.value)}
                placeholder="2026-05-07"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-purple-300"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="text-[10px] font-semibold text-slate-500">Best for</label>
            <input
              value={localPickForm.bestFor}
              onChange={(e) => updateLocalPickForm("bestFor", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-purple-300"
            />
          </div>
          <div className="mt-3">
            <label className="text-[10px] font-semibold text-slate-500">Why this local pick</label>
            <textarea
              value={localPickForm.localReason}
              onChange={(e) => updateLocalPickForm("localReason", e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-purple-300"
            />
          </div>
          <div className="mt-3">
            <label className="text-[10px] font-semibold text-slate-500">Not ideal for</label>
            <input
              value={localPickForm.notIdealFor}
              onChange={(e) => updateLocalPickForm("notIdealFor", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-purple-300"
            />
          </div>
          <div className="mt-3">
            <label className="text-[10px] font-semibold text-slate-500">Tags (comma-separated)</label>
            <input
              value={localPickForm.tags.join(", ")}
              onChange={(e) => updateLocalPickForm("tags", e.target.value.split(",").map((t) => t.trim()))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-purple-300"
            />
          </div>
          <div className="mt-3">
            <label className="text-[10px] font-bold text-purple-700">Agoda URL</label>
            <input
              value={localPickForm.agodaUrl}
              onChange={(e) => updateLocalPickForm("agodaUrl", e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-xs outline-none focus:border-purple-400"
            />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-semibold text-blue-700">Trip.com URL</label>
              <input
                value={localPickForm.tripFallbackUrl}
                onChange={(e) => updateLocalPickForm("tripFallbackUrl", e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-purple-300"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Official URL (optional)</label>
              <input
                value={localPickForm.officialUrl}
                onChange={(e) => updateLocalPickForm("officialUrl", e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-purple-300"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={saveLocalPick}
              disabled={saving}
              className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存する"}
            </button>
            <button
              onClick={cancelLocalPickEdit}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              キャンセル
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={`rounded-2xl border bg-white p-4 shadow-sm ${hasAgodaUrl ? "border-purple-200" : "border-slate-200"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">{entry.hotelName}</p>
              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${statusTone}`}>
                {entry.status}
              </span>
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                {entry.city}
              </span>
              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${hasAgodaUrl ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"}`}>
                {hasAgodaUrl ? "Agoda URL" : "Agoda未設定"}
              </span>
              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${hasTripFallbackUrl ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                {hasTripFallbackUrl ? "Trip.com URL" : "Trip.com未設定"}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              {entry.area} · {entry.bestFor}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-slate-400">
              {hasAgodaUrl ? entry.agodaUrl : hasTripFallbackUrl ? entry.tripFallbackUrl : "Provider URL未設定 — 公開カードには予約ボタンを表示しません"}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {entry.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500">
                  {tag}
                </span>
              ))}
            </div>
            {entry.lastChecked ? (
              <p className="mt-1 text-[10px] text-slate-400">Last checked: {entry.lastChecked}</p>
            ) : null}
            {warningMessages.length > 0 ? (
              <div className="mt-2 space-y-1">
                {warningMessages.map((warning) => (
                  <p key={warning} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-semibold text-amber-800">
                    {warning}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col gap-1.5">
            <button
              onClick={() => startLocalPickEdit(entry)}
              className="rounded-lg bg-purple-100 px-3 py-1.5 text-[10px] font-semibold text-purple-700 hover:bg-purple-200"
            >
              編集
            </button>
            <Link
              href="/local-hotel-picks"
              target="_blank"
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-center text-[10px] font-semibold text-slate-600 hover:bg-slate-200"
            >
              確認
            </Link>
          </div>
        </div>
      </div>
    );
  }

  function AgodaHotelMapCard({ entry }: { entry: AgodaHotelMapEntry }) {
    const isEditing = editingAgodaHotelMapId === entry.id && agodaHotelMapForm;
    const hasEmbed = Boolean(entry.embedCode.trim() || entry.iframeUrl.trim() || entry.scriptUrl.trim());
    const statusTone =
      entry.status === "active"
        ? "bg-emerald-100 text-emerald-700"
        : entry.status === "disabled"
          ? "bg-slate-100 text-slate-600"
          : "bg-amber-100 text-amber-700";

    if (isEditing) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50/40 p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Map ID</label>
              <input
                value={agodaHotelMapForm.id}
                disabled
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Status</label>
              <select
                value={agodaHotelMapForm.status}
                onChange={(e) => updateAgodaHotelMapForm("status", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-red-300"
              >
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="disabled">disabled</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Label</label>
              <input
                value={agodaHotelMapForm.label}
                onChange={(e) => updateAgodaHotelMapForm("label", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-red-300"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Area name</label>
              <input
                value={agodaHotelMapForm.areaName}
                onChange={(e) => updateAgodaHotelMapForm("areaName", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-red-300"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">City</label>
              <input
                value={agodaHotelMapForm.city}
                onChange={(e) => updateAgodaHotelMapForm("city", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-red-300"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Country</label>
              <input
                value={agodaHotelMapForm.country}
                onChange={(e) => updateAgodaHotelMapForm("country", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-red-300"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Default placement</label>
              <input
                value={agodaHotelMapForm.placementDefault}
                onChange={(e) => updateAgodaHotelMapForm("placementDefault", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-red-300"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Last checked</label>
              <input
                value={agodaHotelMapForm.lastChecked}
                onChange={(e) => updateAgodaHotelMapForm("lastChecked", e.target.value)}
                placeholder="2026-05-07"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-red-300"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="text-[10px] font-bold text-red-700">Embed code / HTML snippet</label>
            <textarea
              value={agodaHotelMapForm.embedCode}
              onChange={(e) => updateAgodaHotelMapForm("embedCode", e.target.value)}
              rows={5}
              placeholder="<div>...</div>"
              className="mt-1 w-full rounded-lg border border-red-200 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-red-400"
            />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-bold text-red-700">Script URL</label>
              <input
                value={agodaHotelMapForm.scriptUrl}
                onChange={(e) => updateAgodaHotelMapForm("scriptUrl", e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-xs outline-none focus:border-red-400"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-red-700">Iframe URL</label>
              <input
                value={agodaHotelMapForm.iframeUrl}
                onChange={(e) => updateAgodaHotelMapForm("iframeUrl", e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-xs outline-none focus:border-red-400"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="text-[10px] font-semibold text-slate-500">Notes</label>
            <textarea
              value={agodaHotelMapForm.notes}
              onChange={(e) => updateAgodaHotelMapForm("notes", e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-red-300"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={saveAgodaHotelMap}
              disabled={saving}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存する"}
            </button>
            <button
              onClick={cancelAgodaHotelMapEdit}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              キャンセル
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={`rounded-2xl border bg-white p-4 shadow-sm ${hasEmbed ? "border-red-200" : "border-slate-200"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">{entry.label}</p>
              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${statusTone}`}>{entry.status}</span>
              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${hasEmbed ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                {hasEmbed ? "embed設定あり" : "embed未設定"}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              <code className="rounded bg-slate-100 px-1">{entry.id}</code> / {entry.city} / {entry.areaName}
            </p>
            <p className="mt-1 truncate text-[10px] text-slate-400">
              {entry.iframeUrl || entry.scriptUrl || entry.notes || "Agoda Hotel Mapを貼り付けてください"}
            </p>
          </div>
          <button
            onClick={() => startAgodaHotelMapEdit(entry)}
            className="shrink-0 rounded-lg bg-red-100 px-3 py-1.5 text-[10px] font-semibold text-red-700 hover:bg-red-200"
          >
            編集
          </button>
        </div>
      </div>
    );
  }

  function StayAreaMapCard({ entry }: { entry: StayAreaMapEntry }) {
    const isEditing = editingStayAreaMapId === entry.id && stayAreaMapForm;
    const hasSrc = Boolean(entry.src.trim());
    const statusTone =
      entry.status === "active"
        ? "bg-emerald-100 text-emerald-700"
        : entry.status === "disabled"
          ? "bg-slate-100 text-slate-600"
          : "bg-amber-100 text-amber-700";

    if (isEditing) {
      return (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Map ID</label>
              <input
                value={stayAreaMapForm.id}
                disabled
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Status</label>
              <select
                value={stayAreaMapForm.status}
                onChange={(e) => updateStayAreaMapForm("status", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-300"
              >
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="disabled">disabled</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="text-[10px] font-semibold text-slate-500">画像パス</label>
            <input
              value={stayAreaMapForm.src}
              onChange={(e) => updateStayAreaMapForm("src", e.target.value)}
              placeholder="/images/stay-area-maps/shinjuku-stay-map.png"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-300"
            />
          </div>
          <div className="mt-3">
            <label className="text-[10px] font-semibold text-slate-500">Title</label>
            <input
              value={stayAreaMapForm.title ?? ""}
              onChange={(e) => updateStayAreaMapForm("title", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-300"
            />
          </div>
          <div className="mt-3">
            <label className="text-[10px] font-bold text-emerald-700">Alt（必須）</label>
            <textarea
              value={stayAreaMapForm.alt}
              onChange={(e) => updateStayAreaMapForm("alt", e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-400"
            />
          </div>
          <div className="mt-3">
            <label className="text-[10px] font-semibold text-slate-500">Caption</label>
            <textarea
              value={stayAreaMapForm.caption ?? ""}
              onChange={(e) => updateStayAreaMapForm("caption", e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-300"
            />
          </div>
          <div className="mt-3">
            <label className="text-[10px] font-semibold text-slate-500">Disclaimer</label>
            <textarea
              value={stayAreaMapForm.disclaimer || DEFAULT_STAY_AREA_MAP_DISCLAIMER}
              onChange={(e) => updateStayAreaMapForm("disclaimer", e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-300"
            />
            <button
              type="button"
              onClick={() => updateStayAreaMapForm("disclaimer", DEFAULT_STAY_AREA_MAP_DISCLAIMER)}
              className="mt-2 rounded-lg bg-white px-3 py-1.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-50"
            >
              標準disclaimerを入れる
            </button>
          </div>
          <div className="mt-3">
            <label className="text-[10px] font-semibold text-slate-500">Last checked</label>
            <input
              value={stayAreaMapForm.lastChecked}
              onChange={(e) => updateStayAreaMapForm("lastChecked", e.target.value)}
              placeholder="2026-05-07"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-300"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={saveStayAreaMap}
              disabled={saving}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存する"}
            </button>
            <button
              onClick={cancelStayAreaMapEdit}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              キャンセル
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={`rounded-2xl border bg-white p-4 shadow-sm ${entry.status === "active" ? "border-emerald-200" : "border-slate-200"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">{entry.title || entry.id}</p>
              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${statusTone}`}>{entry.status}</span>
              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${hasSrc ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                {hasSrc ? "画像パスあり" : "画像パスなし"}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              <code className="rounded bg-slate-100 px-1">{entry.id}</code> / {entry.src}
            </p>
            <p className="mt-1 truncate text-[10px] text-slate-400">
              {entry.caption || "caption未設定"}
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Static guide image. Not an Agoda map or affiliate widget.
            </p>
          </div>
          <button
            onClick={() => startStayAreaMapEdit(entry)}
            className="shrink-0 rounded-lg bg-emerald-100 px-3 py-1.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-200"
          >
            編集
          </button>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-sky-700">Admin</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">アフィリエイトリンク管理</h1>
            <p className="mt-1 text-sm text-slate-500">
              Trip.comホテル導線と、Klook等の汎用リンクを分けて管理します。
            </p>
          </div>
          <Link href="/" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50">
            ← サイトに戻る
          </Link>
        </div>

        {/* Flash message */}
        {message && (
          <div className={`mb-4 rounded-xl border px-4 py-3 text-xs font-medium ${message.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
            {message.text}
          </div>
        )}

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="block text-xs font-semibold text-slate-700">
            管理トークン
            <div className="mt-2 flex gap-2">
              <input
                type="password"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                placeholder="Vercel の ADMIN_TOKEN"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem("fujiseat_admin_token", adminToken);
                  fetchLinks();
                  fetchHotelLinks();
                  fetchBookingDestinations();
                  fetchHotelAffiliateLinks();
                  fetchStayHotelPicks();
                  fetchHotelPickLinks();
                  fetchAgodaHotelMaps();
                  fetchStayAreaMaps();
                  fetchLocalHotelPicks();
                  flash("トークンを保存しました", true);
                }}
                className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                読み込み
              </button>
            </div>
          </label>
          <p className="mt-2 text-[11px] leading-5 text-slate-500">
            本番環境では ADMIN_TOKEN がないとリンク一覧の取得・編集はできません。
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-sky-200 bg-sky-50/80 p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-950">Hotel affiliate management guide</p>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-700">
            <li>Use Hotel Area Links for broad area search CTAs. These should usually use Trip.com.</li>
            <li>Use Hotel Pick Links for specific hotel recommendations. Add Agoda individual hotel URLs here.</li>
            <li>Stay Hotel Picks control which hotels appear on each stay page. Hotel Pick Links manage the actual affiliate URLs.</li>
            <li>Use Local Hotel Picks for curated hotel cards on /local-hotel-picks. Add Agoda and Trip.com provider URLs there when available.</li>
            <li>Do not use Agoda Hotel Map for now. {AGODA_HOTEL_MAP_DISABLED_REASON}</li>
            <li>Stay Area Maps are static visual guide images, not affiliate widgets.</li>
          </ul>
          <p className="mt-3 rounded-xl border border-sky-200 bg-white px-3 py-2 text-[11px] leading-5 text-slate-600">
            On Vercel, JSON edits are not persistent. Use this admin locally, then commit and deploy the updated JSON.
          </p>
        </div>

        {/* Summary cards */}
        {!loading && (
          <div className="mb-6 grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-700">{doneItems.length}</p>
              <p className="text-[10px] font-medium text-emerald-600">設定済み</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
              <p className="text-2xl font-bold text-amber-700">
                {todoItems.filter((l) => getStatus(l) === "needs-adid").length}
              </p>
              <p className="text-[10px] font-medium text-amber-600">Klook adid 未設定</p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center">
              <p className="text-2xl font-bold text-red-700">
                {todoItems.filter((l) => getStatus(l) === "needs-url").length}
              </p>
              <p className="text-[10px] font-medium text-red-600">URL 未設定</p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center">
              <p className="text-2xl font-bold text-rose-700">{missingTransportAffiliateItems.length}</p>
              <p className="text-[10px] font-medium text-rose-600">空港送迎 未設定</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{tripHotelDoneCount}/{hotelLinks.length}</p>
              <p className="text-[10px] font-medium text-blue-600">Tripホテル設定</p>
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-center">
              <p className="text-2xl font-bold text-sky-700">{bookingDestinationActiveCount}/{bookingDestinations.length}</p>
              <p className="text-[10px] font-medium text-sky-600">Booking destination</p>
            </div>
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-center">
              <p className="text-2xl font-bold text-orange-700">{hotelPickLinkUrlCount}/{hotelPickLinks.length}</p>
              <p className="text-[10px] font-medium text-orange-600">具体ホテルURL</p>
            </div>
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-3 text-center">
              <p className="text-2xl font-bold text-purple-700">{localPickAgodaFilledCount}/{localHotelPicks.length}</p>
              <p className="text-[10px] font-medium text-purple-600">Local Agoda URL</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-700">{stayAreaMapActiveCount}/{stayAreaMaps.length}</p>
              <p className="text-[10px] font-medium text-emerald-600">Stay Map active</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setTab("hotel")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${tab === "hotel" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Hotel Area Links ({tripHotelDoneCount}/{hotelLinks.length})
          </button>
          <button
            onClick={() => setTab("hotel-affiliate")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${tab === "hotel-affiliate" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Hotel Affiliate Links ({bookingHotelReadyCount}/{hotelAffiliateLinks.length})
          </button>
          <button
            onClick={() => setTab("booking-destinations")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${tab === "booking-destinations" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Booking Destinations ({bookingDestinationActiveCount}/{bookingDestinations.length})
          </button>
          <button
            onClick={() => setTab("stay-picks")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${tab === "stay-picks" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Hotel Pick Links ({hotelPickLinkUrlCount}/{hotelPickLinks.length})
          </button>
          <button
            onClick={() => setTab("local-picks")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${tab === "local-picks" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Local Hotel Picks ({localPickAgodaFilledCount}/{localHotelPicks.length})
          </button>
          <button
            onClick={() => setTab("stay-maps")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${tab === "stay-maps" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Stay Area Maps ({stayAreaMapActiveCount}/{stayAreaMaps.length})
          </button>
          <button
            onClick={() => setTab("todo")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${tab === "todo" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            やることリスト ({todoItems.length + missingTransportAffiliateItems.length})
          </button>
          <button
            onClick={() => setTab("all")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${tab === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            すべてのリンク ({links.length})
          </button>
        </div>

        {/* Add form */}
        {showAdd && <div className="mb-4">{formUI}</div>}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        )}

        {!loading && tab === "booking-destinations" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#003b95]" />
                <p className="text-sm font-bold text-slate-900">Booking Destinations — area-level Booking.com URL master</p>
              </div>
              <div className="mt-3 grid gap-2 text-xs leading-5 text-slate-700 md:grid-cols-2">
                <p className="rounded-xl bg-white px-3 py-2">ここは area_id ごとのBooking.com検索URLマスターです。</p>
                <p className="rounded-xl bg-white px-3 py-2">affiliate_url が空なら、表示設定がenabledでもボタンは出ません。</p>
                <p className="rounded-xl bg-white px-3 py-2">url_status=active のdestinationだけが本番表示対象です。</p>
                <p className="rounded-xl bg-white px-3 py-2">top3/detail/locale/SubID は Hotel Affiliate Links 側で管理します。</p>
                <p className="rounded-xl bg-white px-3 py-2">Use English Booking.com search result URLs for now.</p>
                <p className="rounded-xl bg-white px-3 py-2">Paste the generated Travelpayouts link into affiliate_url.</p>
                <p className="rounded-xl bg-white px-3 py-2">Set url_status to active only after checking the destination.</p>
                <p className="rounded-xl bg-white px-3 py-2">Language-specific Booking.com URLs can be added later if needed.</p>
              </div>
            </div>

            <div className="space-y-2">
              {bookingDestinations
                .slice()
                .sort((a, b) => a.area_id.localeCompare(b.area_id))
                .map((entry) => {
                  const editing = editingBookingDestinationId === entry.id && bookingDestinationForm;
                  const active = entry.url_status === "active" && Boolean(entry.affiliate_url.trim());
                  if (editing) {
                    return (
                      <div key={entry.id} className="rounded-2xl border border-sky-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-bold text-slate-900">{entry.id}</p>
                          <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {active ? "active" : "hidden"}
                          </span>
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                          <label className="text-[10px] font-semibold text-slate-500">
                            area_id
                            <input value={bookingDestinationForm.area_id} onChange={(e) => updateBookingDestinationForm("area_id", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-sky-300" />
                          </label>
                          <label className="text-[10px] font-semibold text-slate-500">
                            label
                            <input value={bookingDestinationForm.label} onChange={(e) => updateBookingDestinationForm("label", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-sky-300" />
                          </label>
                          <label className="text-[10px] font-semibold text-slate-500">
                            booking_query_label
                            <input value={bookingDestinationForm.booking_query_label} onChange={(e) => updateBookingDestinationForm("booking_query_label", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-sky-300" />
                          </label>
                          <label className="text-[10px] font-semibold text-slate-500">
                            booking_scope
                            <select value={bookingDestinationForm.booking_scope} onChange={(e) => updateBookingDestinationForm("booking_scope", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-sky-300">
                              <option value="station">station</option>
                              <option value="neighborhood">neighborhood</option>
                              <option value="area_cluster">area_cluster</option>
                              <option value="city_fallback">city_fallback</option>
                            </select>
                          </label>
                          <label className="text-[10px] font-semibold text-slate-500">
                            inventory_confidence
                            <select value={bookingDestinationForm.inventory_confidence} onChange={(e) => updateBookingDestinationForm("inventory_confidence", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-sky-300">
                              <option value="high">high</option>
                              <option value="medium">medium</option>
                              <option value="low">low</option>
                            </select>
                          </label>
                          <label className="text-[10px] font-semibold text-slate-500">
                            url_status
                            <select value={bookingDestinationForm.url_status} onChange={(e) => updateBookingDestinationForm("url_status", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-sky-300">
                              <option value="active">active</option>
                              <option value="needs_review">needs_review</option>
                              <option value="too_broad">too_broad</option>
                              <option value="too_narrow">too_narrow</option>
                            </select>
                          </label>
                        </div>
                        <label className="mt-3 block text-[10px] font-semibold text-slate-500">
                          destination_url
                          <input value={bookingDestinationForm.destination_url} onChange={(e) => updateBookingDestinationForm("destination_url", e.target.value)} placeholder="https://www.booking.com/searchresults..." className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-sky-300" />
                        </label>
                        <label className="mt-3 block text-[10px] font-semibold text-slate-500">
                          affiliate_url
                          <input value={bookingDestinationForm.affiliate_url} onChange={(e) => updateBookingDestinationForm("affiliate_url", e.target.value)} placeholder="Travelpayouts Booking.com affiliate URL" className="mt-1 w-full rounded-lg border border-sky-200 px-3 py-2 text-xs outline-none focus:border-sky-400" />
                        </label>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <label className="text-[10px] font-semibold text-slate-500">
                            last_checked_at
                            <input value={bookingDestinationForm.last_checked_at} onChange={(e) => updateBookingDestinationForm("last_checked_at", e.target.value)} placeholder="2026-06-02" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-sky-300" />
                          </label>
                          <label className="text-[10px] font-semibold text-slate-500">
                            notes
                            <input value={bookingDestinationForm.notes} onChange={(e) => updateBookingDestinationForm("notes", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-sky-300" />
                          </label>
                        </div>
                        {bookingDestinationForm.url_status === "active" && !bookingDestinationForm.affiliate_url.trim() ? (
                          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-semibold text-amber-800">
                            Warning: active にする場合は affiliate_url が必要です。空のままだとボタンは表示されません。
                          </p>
                        ) : null}
                        <div className="mt-4 flex gap-2">
                          <button onClick={saveBookingDestination} disabled={saving} className="rounded-lg bg-[#003b95] px-4 py-2 text-xs font-semibold text-white hover:bg-[#002f78] disabled:opacity-50">
                            {saving ? "保存中..." : "保存する"}
                          </button>
                          <button onClick={cancelBookingDestinationEdit} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
                            キャンセル
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={entry.id} className={`rounded-2xl border bg-white p-4 shadow-sm ${active ? "border-emerald-200" : "border-slate-200"}`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">{entry.label}</p>
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-700">{entry.area_id}</span>
                            <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-800">{entry.booking_scope}</span>
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-700">{entry.inventory_confidence}</span>
                            <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                              {entry.url_status}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-500">{entry.id}</p>
                          <p className="mt-1 text-[11px] text-slate-500">query: {entry.booking_query_label}</p>
                          <p className="mt-1 text-[11px] text-slate-500">affiliate_url: {entry.affiliate_url.trim() ? "set" : "empty"}</p>
                        </div>
                        <button onClick={() => startBookingDestinationEdit(entry)} className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100">
                          編集
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {!loading && tab === "hotel-affiliate" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#003b95]" />
                <p className="text-sm font-bold text-slate-900">Hotel Affiliate Links — Booking.com via Travelpayouts</p>
              </div>
              <div className="mt-3 grid gap-2 text-xs leading-5 text-slate-700 md:grid-cols-2">
                <p className="rounded-xl bg-white px-3 py-2">affiliate_url が空ならBooking.comボタンは表示されません。</p>
                <p className="rounded-xl bg-white px-3 py-2">enabled=false ならBooking.comボタンは表示されません。</p>
                <p className="rounded-xl bg-white px-3 py-2">destination_ref がある場合は Booking Destinations 側の active URL を優先します。</p>
                <p className="rounded-xl bg-white px-3 py-2">destination側が needs_review / too_broad / too_narrow なら表示されません。</p>
                <p className="rounded-xl bg-white px-3 py-2">SubIDがaffiliate_url内に含まれているか目視確認してください。</p>
                <p className="rounded-xl bg-white px-3 py-2">Vercel上のJSON編集は永続化されません。ローカル編集→commit→deploy前提です。</p>
              </div>
              <div className="mt-3 rounded-xl border border-blue-200 bg-white px-3 py-2 text-[11px] leading-5 text-slate-600">
                <span className="font-semibold text-slate-900">SubID rule:</span>{" "}
                <code className="rounded bg-slate-100 px-1">fs_{"{page}"}_{"{placement}"}_{"{area}"}_{"{locale}"}</code>
                <span className="ml-2">Top3例: </span>
                <code className="rounded bg-slate-100 px-1">fs_tkidx_top3_ueno_en</code>
                <span className="ml-2">Detail例: </span>
                <code className="rounded bg-slate-100 px-1">fs_tkidx_detail_ueno_en</code>
              </div>
            </div>

            <div className="space-y-2">
              {hotelAffiliateLinks
                .slice()
                .sort((a, b) => a.area_id.localeCompare(b.area_id) || a.placement.localeCompare(b.placement) || a.locale.localeCompare(b.locale))
                .map((entry) => {
                  const editing = editingHotelAffiliateId === entry.id && hotelAffiliateForm;
                  const destination = entry.destination_ref ? bookingDestinations.find((item) => item.id === entry.destination_ref) : null;
                  const ready = entry.enabled && (destination ? destination.url_status === "active" && Boolean(destination.affiliate_url.trim()) : Boolean(entry.affiliate_url.trim()));
                  if (editing) {
                    return (
                      <div key={entry.id} className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-bold text-slate-900">{entry.id}</p>
                          <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">Booking.com</span>
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                          <label className="text-[10px] font-semibold text-slate-500">
                            provider
                            <input value={hotelAffiliateForm.provider} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs" />
                          </label>
                          <label className="text-[10px] font-semibold text-slate-500">
                            area_id
                            <input value={hotelAffiliateForm.area_id} onChange={(e) => updateHotelAffiliateForm("area_id", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-300" />
                          </label>
                          <label className="text-[10px] font-semibold text-slate-500">
                            locale
                            <input value={hotelAffiliateForm.locale} onChange={(e) => updateHotelAffiliateForm("locale", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-300" />
                          </label>
                          <label className="text-[10px] font-semibold text-slate-500">
                            placement
                            <select value={hotelAffiliateForm.placement} onChange={(e) => updateHotelAffiliateForm("placement", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-300">
                              <option value="top3">top3</option>
                              <option value="detail">detail</option>
                              <option value="tokyo_first_time_card">tokyo_first_time_card</option>
                              <option value="before_shinkansen_card">before_shinkansen_card</option>
                              <option value="airport_page_first_night_cta">airport_page_first_night_cta</option>
                              <option value="comparison_area_cta">comparison_area_cta</option>
                            </select>
                          </label>
                          <label className="text-[10px] font-semibold text-slate-500">
                            priority
                            <input type="number" value={hotelAffiliateForm.priority} onChange={(e) => updateHotelAffiliateForm("priority", Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-300" />
                          </label>
                          <label className="text-[10px] font-semibold text-slate-500">
                            destination_ref
                            <input value={hotelAffiliateForm.destination_ref ?? ""} onChange={(e) => updateHotelAffiliateForm("destination_ref", e.target.value)} placeholder="booking_ueno" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-300" />
                          </label>
                          <label className="text-[10px] font-semibold text-slate-500">
                            page_group
                            <input value={hotelAffiliateForm.page_group ?? ""} onChange={(e) => updateHotelAffiliateForm("page_group", e.target.value)} placeholder="asakusa-vs-ueno" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-300" />
                          </label>
                          <label className="flex items-end gap-2 text-[10px] font-semibold text-slate-500">
                            <input type="checkbox" checked={hotelAffiliateForm.enabled} onChange={(e) => updateHotelAffiliateForm("enabled", e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                            enabled
                          </label>
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <label className="text-[10px] font-semibold text-slate-500">
                            destination_url
                            <input value={hotelAffiliateForm.destination_url} onChange={(e) => updateHotelAffiliateForm("destination_url", e.target.value)} placeholder="https://www.booking.com/..." className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-300" />
                          </label>
                          <label className="text-[10px] font-semibold text-slate-500">
                            sub_id
                            <input value={hotelAffiliateForm.sub_id} onChange={(e) => updateHotelAffiliateForm("sub_id", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-300" />
                          </label>
                        </div>
                        <label className="mt-3 block text-[10px] font-semibold text-slate-500">
                          affiliate_url
                          <input value={hotelAffiliateForm.affiliate_url} onChange={(e) => updateHotelAffiliateForm("affiliate_url", e.target.value)} placeholder="Travelpayouts affiliate URL" className="mt-1 w-full rounded-lg border border-blue-200 px-3 py-2 text-xs outline-none focus:border-blue-400" />
                        </label>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <label className="text-[10px] font-semibold text-slate-500">
                            last_checked_at
                            <input value={hotelAffiliateForm.last_checked_at} onChange={(e) => updateHotelAffiliateForm("last_checked_at", e.target.value)} placeholder="2026-06-02" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-300" />
                          </label>
                          <label className="text-[10px] font-semibold text-slate-500">
                            notes
                            <input value={hotelAffiliateForm.notes} onChange={(e) => updateHotelAffiliateForm("notes", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-300" />
                          </label>
                        </div>
                        {hotelAffiliateForm.destination_ref ? (
                          <p className="mt-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-[10px] font-semibold text-sky-800">
                            destination_ref 使用中: 表示URLは Booking Destinations 側の affiliate_url / url_status で決まります。
                          </p>
                        ) : null}
                        {hotelAffiliateForm.sub_id && hotelAffiliateForm.affiliate_url && !hotelAffiliateForm.affiliate_url.includes(hotelAffiliateForm.sub_id) ? (
                          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-semibold text-amber-800">
                            Warning: sub_id が affiliate_url 内に見つかりません。Travelpayouts側のSubID設定を確認してください。
                          </p>
                        ) : null}
                        <div className="mt-4 flex gap-2">
                          <button onClick={saveHotelAffiliate} disabled={saving} className="rounded-lg bg-[#003b95] px-4 py-2 text-xs font-semibold text-white hover:bg-[#002f78] disabled:opacity-50">
                            {saving ? "保存中..." : "保存する"}
                          </button>
                          <button onClick={cancelHotelAffiliateEdit} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
                            キャンセル
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={entry.id} className={`rounded-2xl border bg-white p-4 shadow-sm ${ready ? "border-emerald-200" : "border-slate-200"}`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">{entry.area_id}</p>
                            <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-800">{entry.placement}</span>
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-700">{entry.locale}</span>
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-700">priority {entry.priority}</span>
                            <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${ready ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                              {ready ? "ready" : "hidden"}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-500">{entry.id}</p>
                          <p className="mt-1 text-[11px] text-slate-500">destination_ref: {entry.destination_ref || "legacy direct URL"}</p>
                          <p className="mt-1 text-[11px] text-slate-500">sub_id: {entry.sub_id || "missing"}</p>
                        </div>
                        <button onClick={() => startHotelAffiliateEdit(entry)} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                          編集
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {!loading && tab === "hotel" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-500" />
                <p className="text-sm font-bold text-slate-900">Hotel Area Links — Trip.com area search CTAs</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                Use this for wider hotel search by area. Trip.com works better for fine area links such as Shinjuku,
                Ueno, Asakusa, Kyoto Station, Namba and Umeda. Do not put Agoda individual hotel URLs here.
              </p>
              <div className="mt-3 rounded-xl bg-white px-3 py-2 text-[11px] leading-5 text-slate-600">
                <span className="font-semibold text-slate-800">Rule:</span>
                Keep primaryProvider=trip unless a real broad Agoda city link exists. Empty Agoda URLs should not be used for area CTAs.
              </div>
              {hotelAreaPrimaryAgodaMissing.length > 0 ? (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-800">
                  <span className="font-semibold">Warning:</span>{" "}
                  {hotelAreaPrimaryAgodaMissing.map((entry) => entry.id).join(", ")} have primaryProvider=agoda but no agodaUrl.
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-900">Stay area Agoda CTA backlog</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Add broad Agoda area URLs here only when the URL clearly matches the area. Public pages will show Agoda buttons automatically after agodaUrl is filled.
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-purple-700 ring-1 ring-purple-100">
                  {hotelAreaAgodaPriorityMissing.length}/{hotelAreaAgodaPriorityLinks.length} missing
                </span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {hotelAreaAgodaPriorityLinks.map((entry) => {
                  const hasAgodaUrl = Boolean(entry.agodaUrl?.trim());
                  return (
                    <div key={entry.id} className={`rounded-xl border bg-white px-3 py-2 text-[11px] ${hasAgodaUrl ? "border-emerald-100" : "border-purple-100"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">{entry.city}: {entry.areaName}</span>
                        <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${hasAgodaUrl ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700"}`}>
                          {hasAgodaUrl ? "Agoda ready" : "Add Agoda"}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-500">{entry.id}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              {([
                ["Tokyo", hotelLinks.filter((h) => h.city === "Tokyo")],
                ["Kyoto", hotelLinks.filter((h) => h.city === "Kyoto")],
                ["Osaka", hotelLinks.filter((h) => h.city === "Osaka")],
                ["Other", hotelLinks.filter((h) => !["Tokyo", "Kyoto", "Osaka"].includes(h.city))],
              ] as Array<[string, HotelEntry[]]>).map(([city, cityItems]) => {
                if (cityItems.length === 0) return null;
                return (
                  <section key={city}>
                    <div className="mb-2 flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-700">{city}</p>
                      <span className="text-[10px] text-slate-400">
                        {cityItems.filter((h) => h.tripUrl.trim()).length}/{cityItems.length} 設定済み
                      </span>
                    </div>
                    <div className="space-y-2">
                      {cityItems.map((entry) => (
                        <HotelLinkCard key={entry.id} entry={entry} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        )}

        {!loading && tab === "stay-picks" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-orange-500" />
                <p className="text-sm font-bold text-slate-900">Hotel Pick Links — Individual hotel recommendations</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                Use this for specific hotel cards shown on stay pages. Add Agoda individual hotel affiliate URLs here.
                If agodaUrl is present, this pick can use Agoda. If not, it falls back to Trip.com.
              </p>
              <div className="mt-3 rounded-xl bg-white px-3 py-2 text-[11px] leading-5 text-slate-600">
                <span className="font-semibold text-slate-800">Rule:</span>
                Agoda is for individual hotel picks only. Use Agoda only when agodaUrl is filled; otherwise use Trip.com.
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
              <div>
                <p className="text-2xl font-bold text-slate-900">{hotelPickLinks.length}</p>
                <p className="text-[10px] font-medium text-slate-500">Total hotel picks</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{hotelPickLinks.filter((entry) => entry.agodaUrl?.trim()).length}</p>
                <p className="text-[10px] font-medium text-red-600">Agoda URLs filled</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{hotelPickLinks.filter((entry) => !entry.agodaUrl?.trim()).length}</p>
                <p className="text-[10px] font-medium text-amber-600">Agoda URLs missing</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{hotelPickLinks.filter((entry) => entry.tripUrl.trim()).length}</p>
                <p className="text-[10px] font-medium text-blue-600">Trip URLs filled</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{hotelPickPossibleMismatches.length}</p>
                <p className="text-[10px] font-medium text-amber-600">Possible mismatches</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{hotelPickPrimaryAgodaMissing.length}</p>
                <p className="text-[10px] font-medium text-red-600">Agoda primary without URL</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{hotelPickAgodaPresentTripPrimary.length}</p>
                <p className="text-[10px] font-medium text-amber-600">Agoda URL but Trip primary</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{hotelPickMissingAllUrls.length}</p>
                <p className="text-[10px] font-medium text-red-600">Missing all URLs</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-700">{hotelPickUsedThreePlus.length}</p>
                <p className="text-[10px] font-medium text-orange-600">Picks used on 3+ pages</p>
              </div>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 shadow-sm">
              <p className="text-xs font-bold text-slate-900">Agoda URL priority picks</p>
              <p className="mt-1 text-[11px] leading-5 text-slate-600">
                Start with these individual hotel picks when adding Agoda affiliate URLs.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {AGODA_PRIORITY_HOTEL_PICKS.map((name) => (
                  <span key={name} className="rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-semibold text-red-700 ring-1 ring-red-100">
                    {name}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setHotelPickAgodaFilter("missing")}
                  className="rounded-lg bg-amber-100 px-3 py-1.5 text-[10px] font-semibold text-amber-800 hover:bg-amber-200"
                >
                  Show only Agoda URL missing
                </button>
                <button
                  type="button"
                  onClick={() => setHotelPickHealthFilter("possible-mismatch")}
                  className="rounded-lg bg-red-100 px-3 py-1.5 text-[10px] font-semibold text-red-700 hover:bg-red-200"
                >
                  Show only possible URL mismatch
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHotelPickProviderFilter("all");
                    setHotelPickAgodaFilter("all");
                    setHotelPickPageFilter("all");
                    setHotelPickAreaFilter("all");
                    setHotelPickHealthFilter("all");
                  }}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Clear filters
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-5">
                <label className="text-[10px] font-semibold text-slate-500">
                  Provider
                  <select
                    value={hotelPickProviderFilter}
                    onChange={(e) => setHotelPickProviderFilter(e.target.value as HotelPickProviderFilter)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-orange-300"
                  >
                    <option value="all">all</option>
                    <option value="agoda">agoda</option>
                    <option value="trip">trip</option>
                  </select>
                </label>
                <label className="text-[10px] font-semibold text-slate-500">
                  Agoda URL
                  <select
                    value={hotelPickAgodaFilter}
                    onChange={(e) => setHotelPickAgodaFilter(e.target.value as HotelPickAgodaFilter)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-orange-300"
                  >
                    <option value="all">all</option>
                    <option value="missing">missing</option>
                    <option value="present">present</option>
                  </select>
                </label>
                <label className="text-[10px] font-semibold text-slate-500">
                  Page slug
                  <select
                    value={hotelPickPageFilter}
                    onChange={(e) => setHotelPickPageFilter(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-orange-300"
                  >
                    <option value="all">all</option>
                    {hotelPickPageOptions.map((slug) => (
                      <option key={slug} value={slug}>{slug}</option>
                    ))}
                  </select>
                </label>
                <label className="text-[10px] font-semibold text-slate-500">
                  hotelKey / area
                  <select
                    value={hotelPickAreaFilter}
                    onChange={(e) => setHotelPickAreaFilter(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-orange-300"
                  >
                    <option value="all">all</option>
                    {hotelPickAreaOptions.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </label>
                <label className="text-[10px] font-semibold text-slate-500">
                  Health
                  <select
                    value={hotelPickHealthFilter}
                    onChange={(e) => setHotelPickHealthFilter(e.target.value as HotelPickHealthFilter)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-orange-300"
                  >
                    <option value="all">all</option>
                    <option value="primary-agoda-missing">agoda primary without URL</option>
                    <option value="agoda-present-trip-primary">agoda present but trip primary</option>
                    <option value="missing-all-urls">missing all URLs</option>
                    <option value="possible-mismatch">possible URL mismatch</option>
                    <option value="used-3-plus">used count 3+</option>
                  </select>
                </label>
              </div>
              <p className="mt-3 text-[10px] text-slate-500">
                Showing {filteredHotelPickLinks.length}/{hotelPickLinks.length} picks.
              </p>
            </div>

            <div className="space-y-2">
              {filteredHotelPickLinks.map((entry) => (
                <HotelPickLinkCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        )}

        {!loading && tab === "local-picks" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-purple-500" />
                <p className="text-sm font-bold text-slate-900">Local Hotel Picks — Agoda curated hotel cards</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                Use this section for curated individual hotel picks shown on /local-hotel-picks.
                Add Agoda and Trip.com individual hotel affiliate URLs here.
                These are separate from the existing Trip.com Hotel Picks.
              </p>
              <div className="mt-3 rounded-xl bg-white px-3 py-2 text-[11px] leading-5 text-slate-600">
                <span className="font-semibold text-slate-800">Rule:</span>
                {" "}Use agodaUrl for Agoda individual hotel links and tripFallbackUrl for Trip.com individual hotel links.
                Do not paste Trip.com area search URLs into individual hotel picks.
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-5">
              <div>
                <p className="text-2xl font-bold text-slate-900">{localHotelPicks.length}</p>
                <p className="text-[10px] font-medium text-slate-500">Total picks</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">{localPickActiveCount}</p>
                <p className="text-[10px] font-medium text-emerald-600">Active</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{localPickDraftCount}</p>
                <p className="text-[10px] font-medium text-amber-600">Draft</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700">{localPickAgodaFilledCount}</p>
                <p className="text-[10px] font-medium text-purple-600">Agoda URLs filled</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{localPickAgodaMissingCount}</p>
                <p className="text-[10px] font-medium text-red-600">Agoda URLs missing</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setLocalPickAgodaFilter("missing")}
                  className="rounded-lg bg-red-100 px-3 py-1.5 text-[10px] font-semibold text-red-700 hover:bg-red-200"
                >
                  Show only Agoda URL missing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLocalPickCityFilter("all");
                    setLocalPickStatusFilter("all");
                    setLocalPickAgodaFilter("all");
                  }}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Clear filters
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <label className="text-[10px] font-semibold text-slate-500">
                  City
                  <select
                    value={localPickCityFilter}
                    onChange={(e) => setLocalPickCityFilter(e.target.value as LocalHotelPickCityFilter)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-purple-300"
                  >
                    <option value="all">all</option>
                    <option value="Tokyo">Tokyo</option>
                    <option value="Kyoto">Kyoto</option>
                    <option value="Osaka">Osaka</option>
                  </select>
                </label>
                <label className="text-[10px] font-semibold text-slate-500">
                  Status
                  <select
                    value={localPickStatusFilter}
                    onChange={(e) => setLocalPickStatusFilter(e.target.value as LocalHotelPickStatusFilter)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-purple-300"
                  >
                    <option value="all">all</option>
                    <option value="active">active</option>
                    <option value="draft">draft</option>
                    <option value="disabled">disabled</option>
                  </select>
                </label>
                <label className="text-[10px] font-semibold text-slate-500">
                  Agoda URL
                  <select
                    value={localPickAgodaFilter}
                    onChange={(e) => setLocalPickAgodaFilter(e.target.value as LocalHotelPickAgodaFilter)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-purple-300"
                  >
                    <option value="all">all</option>
                    <option value="missing">missing</option>
                    <option value="present">present</option>
                  </select>
                </label>
              </div>
              <p className="mt-3 text-[10px] text-slate-500">
                Showing {filteredLocalPicks.length}/{localHotelPicks.length} picks.
              </p>
            </div>

            <div className="space-y-2">
              {filteredLocalPicks.map((entry) => (
                <LocalHotelPickCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        )}

        {/* Agoda Hotel Map is intentionally not exposed in normal admin navigation.
            Currently disabled / not used: fixed dates, external scripts, limited UI control, and page weight do not fit the hotel CTA strategy. */}
        {!loading && tab === "agoda-maps" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-red-200 bg-red-50/70 p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <p className="text-sm font-bold text-slate-900">Agoda Hotel Map管理</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                駅周辺や細かいエリアはHotelCTAではなく、Agoda公式Hotel Mapを補助ブロックとして設置します。
                statusをactiveにし、embedCode / iframeUrl / scriptUrl のいずれかを設定したMapだけページに表示されます。
              </p>
              <div className="mt-3 rounded-xl bg-white px-3 py-2 text-[11px] leading-5 text-slate-600">
                <span className="font-semibold text-slate-800">注意：</span>
                embedCodeはadmin-only入力前提で表示します。外部scriptは必要なMapが表示されるページだけで遅延読み込みします。
              </div>
            </div>

            <div className="space-y-6">
              {([
                ["Tokyo", agodaHotelMaps.filter((map) => map.city === "Tokyo")],
                ["Kyoto", agodaHotelMaps.filter((map) => map.city === "Kyoto")],
                ["Osaka", agodaHotelMaps.filter((map) => map.city === "Osaka")],
                ["Other", agodaHotelMaps.filter((map) => !["Tokyo", "Kyoto", "Osaka"].includes(map.city))],
              ] as Array<[string, AgodaHotelMapEntry[]]>).map(([city, cityItems]) => {
                if (cityItems.length === 0) return null;
                return (
                  <section key={city}>
                    <div className="mb-2 flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-700">{city}</p>
                      <span className="text-[10px] text-slate-400">
                        {cityItems.filter((map) => map.status === "active").length}/{cityItems.length} active
                      </span>
                    </div>
                    <div className="space-y-2">
                      {cityItems.map((entry) => (
                        <AgodaHotelMapCard key={entry.id} entry={entry} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        )}

        {!loading && tab === "stay-maps" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <p className="text-sm font-bold text-slate-900">Stay Area Maps — Static visual guide images</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                Use this for simplified local guide maps. These are static guide images used to explain hotel-area logic.
                They are not Agoda maps or affiliate widgets.
              </p>
              <div className="mt-3 rounded-xl bg-white px-3 py-2 text-[11px] leading-5 text-slate-600">
                <span className="font-semibold text-slate-800">標準注釈：</span>
                {DEFAULT_STAY_AREA_MAP_DISCLAIMER}
              </div>
            </div>

            <div className="space-y-2">
              {stayAreaMaps.map((entry) => (
                <StayAreaMapCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        )}

        {!loading && tab === "todo" && (
          <div className="space-y-6">
            {showAdd && editingId === null && form.id ? (
              <div>{formUI}</div>
            ) : null}

            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-950">空港送迎 affiliate 未設定</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Canonical target は分かっているが、admin に affiliate/deeplink URL が未登録のものです。raw URL はCTAに出しません。
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-rose-700">
                  {missingTransportAffiliateItems.length} 件
                </span>
              </div>

              {missingTransportAffiliateItems.length === 0 ? (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
                  空港送迎の推奨 affiliate はすべて設定済みです。
                </div>
              ) : (
                <div className="mt-4 grid gap-3">
                  {missingTransportAffiliateItems.map((item) => {
                    const style = ps(item.provider);
                    return (
                      <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <code className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-800">{item.id}</code>
                              <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${style.badge}`}>{style.label}</span>
                              <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">未設定</span>
                              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">{item.product}</span>
                            </div>
                            <p className="mt-2 text-sm font-semibold text-slate-950">{item.label}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-600">{item.note}</p>
                            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">Canonical target</p>
                              <p className="mt-1 break-all text-[11px] leading-5 text-slate-700">{item.targetUrl}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => startAddTransportAffiliate(item)}
                            className="rounded-lg bg-slate-950 px-3 py-2 text-[11px] font-semibold text-white hover:bg-slate-800"
                          >
                            入力フォームにセット
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {todoItems.length === 0 && missingTransportAffiliateItems.length === 0 ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
                <p className="text-lg font-bold text-emerald-800">すべて設定済み！</p>
                <p className="mt-1 text-xs text-emerald-600">全リンクが正しく設定されています。</p>
              </div>
            ) : (
              todoByProvider.map(([provider, items]) => {
                const style = ps(provider);
                const isKlook = provider === "klook";
                return (
                  <div key={provider}>
                    {/* Provider header with instructions */}
                    <div className={`mb-3 rounded-xl border p-4 ${style.color}`}>
                      <div className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${style.dot}`} />
                        <p className="text-sm font-bold text-slate-900">
                          {style.label}
                          <span className="ml-2 text-xs font-normal text-slate-500">
                            {items.length} 件の設定が必要
                          </span>
                        </p>
                      </div>
                      <div className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-[11px] leading-5 text-slate-700">
                        {isKlook ? (
                          <>
                            <span className="font-semibold">手順：</span>
                            Klook アフィリエイト管理画面 → 広告作成 → 生成されたURLをコピー → 下の「設定する」でURL欄に貼り付けるだけ！
                          </>
                        ) : (
                          <>
                            <span className="font-semibold">手順：</span>
                            {style.label} のアフィリエイト管理画面 → 対象の商品ページを検索 → アフィリエイトリンクを生成 → 下の「設定する」で URL に貼り付け
                          </>
                        )}
                      </div>
                    </div>

                    {/* Items needing setup */}
                    <div className="space-y-2">
                      {items.map((entry) => (
                        <LinkCard key={entry.id} entry={entry} />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ALL tab */}
        {!loading && tab === "all" && (
          <div className="space-y-6">
            {/* Add button */}
            {!showAdd && editingId === null && (
              <button
                onClick={startAdd}
                className="w-full rounded-xl border-2 border-dashed border-slate-300 py-3 text-xs font-semibold text-slate-500 transition-colors hover:border-sky-400 hover:text-sky-600"
              >
                ＋ 新しいリンクを追加
              </button>
            )}

            {/* Group by provider */}
            {(["klook", "omio", "agoda"] as const).map((provider) => {
              const items = byProvider(provider);
              if (items.length === 0) return null;
              const style = ps(provider);
              return (
                <div key={provider}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                    <p className="text-xs font-bold text-slate-700">{style.label}</p>
                    <span className="text-[10px] text-slate-400">{items.length} 件</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((entry) => (
                      <LinkCard key={entry.id} entry={entry} />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Other providers */}
            {links.filter((l) => !["klook", "agoda"].includes(l.provider)).length > 0 && (
              <div>
                <p className="mb-2 text-xs font-bold text-slate-700">その他</p>
                <div className="space-y-2">
                  {links
                    .filter((l) => !["klook", "agoda"].includes(l.provider))
                    .map((entry) => <LinkCard key={entry.id} entry={entry} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Provider setup guides */}
        <div className="mt-8 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">各サイトでの設定方法</h2>

          {/* Klook */}
          <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-orange-400" />
              <p className="text-xs font-bold text-slate-900">Klook — URL を貼るだけ！</p>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-600">
              Klook で生成したアフィリエイト URL をそのまま貼り付ければ、Ad ID が自動で入ります。
            </p>
            <div className="mt-3 rounded-xl bg-white p-3">
              <p className="text-[10px] font-semibold text-slate-700">手順</p>
              <ol className="mt-1 list-inside list-decimal space-y-1 text-[11px] leading-5 text-slate-600">
                <li>Klook Affiliate にログイン</li>
                <li>「広告管理」→「新しい広告を作成」</li>
                <li>リンクしたい商品ページの URL を入力</li>
                <li>生成されたアフィリエイトリンクをコピー</li>
                <li>この管理画面で「設定する」→ URL 欄に貼り付け → 自動で Ad ID が入る → 保存</li>
              </ol>
            </div>
          </div>

          {/* Trip.com */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-500" />
              <p className="text-xs font-bold text-slate-900">Trip.com — ホテルは専用タブで管理</p>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-600">
              ホテル検索deeplinkは上部の「Trip.comホテル」タブに貼ります。KlookのホテルIDを書き換えないでください。
            </p>
            <div className="mt-3 rounded-xl bg-white p-3">
              <p className="text-[10px] font-semibold text-slate-700">手順</p>
              <ol className="mt-1 list-inside list-decimal space-y-1 text-[11px] leading-5 text-slate-600">
                <li>Trip.com Affiliate のdeeplink作成画面を開く</li>
                <li>Shinjuku / Ueno などエリア別のホテル検索URLを生成</li>
                <li>できれば日付固定なしURLを使う</li>
                <li>この管理画面の「Trip.comホテル」タブで該当エリアに貼り付け</li>
              </ol>
            </div>
          </div>

          {/* Agoda */}
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <p className="text-xs font-bold text-slate-900">Agoda — アフィリエイトURL を丸ごと貼る</p>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-600">
              Agoda は完成したアフィリエイトリンクをそのまま貼ります。
            </p>
            <div className="mt-3 rounded-xl bg-white p-3">
              <p className="text-[10px] font-semibold text-slate-700">手順</p>
              <ol className="mt-1 list-inside list-decimal space-y-1 text-[11px] leading-5 text-slate-600">
                <li>Agoda Partner Hub にログイン</li>
                <li>「Tools」→「Deep Link」を開く</li>
                <li>リンクしたいページの URL を入力</li>
                <li>生成されたアフィリエイトリンクをコピー</li>
                <li>この管理画面で「設定する」→ URL に貼り付け → 保存</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Hotel link strategy */}
        <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/50 p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-900">ホテルリンクの戦略ガイド</p>
          <p className="mt-1 text-[11px] text-slate-500">
            「検索結果一覧」と「具体的なホテル」の2種類を使い分ける
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400">A. 検索結果一覧リンク</p>
              <p className="mt-1 text-xs font-semibold text-slate-800">「新宿のホテル一覧」型</p>
              <p className="mt-1 text-[11px] leading-4 text-slate-600">
                ユーザーが自分で比較・選択できるので信頼感が高い。ただし選択肢が多く離脱しやすい。
              </p>
              <div className="mt-2 rounded-lg bg-emerald-50 px-2 py-1.5 text-[10px] text-emerald-800">
                <span className="font-semibold">使う場所：</span> Stay のエリアカード、Planner サイドバーの「Where to stay」
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400">B. 具体的なホテルリンク</p>
              <p className="mt-1 text-xs font-semibold text-slate-800">「おすすめ: ○○ Hotel」型</p>
              <p className="mt-1 text-[11px] leading-4 text-slate-600">
                「筆者おすすめ」として紹介するとCTR・CVR が高い。ただし在庫切れ・価格変動リスクあり。
              </p>
              <div className="mt-2 rounded-lg bg-emerald-50 px-2 py-1.5 text-[10px] text-emerald-800">
                <span className="font-semibold">使う場所：</span> Itinerary DayCard、Stay のおすすめホテルセクション
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-violet-200 bg-white p-3">
            <p className="text-[10px] font-bold text-violet-800">ページごとの推奨パターン</p>
            <div className="mt-2 space-y-2">
              {[
                {
                  page: "Stay エリアカード",
                  pattern: "検索結果一覧",
                  reason: "エリア比較が目的のページなので、エリア全体の一覧が適切",
                  color: "bg-indigo-50 text-indigo-700",
                },
                {
                  page: "Itinerary DayCard",
                  pattern: "具体ホテル 1-2 件 ＋ 一覧リンク",
                  reason: "「この日はここに泊まる」が決まる文脈。具体的な推しでCVR向上",
                  color: "bg-sky-50 text-sky-700",
                },
                {
                  page: "Planner サイドバー",
                  pattern: "具体ホテル 1 件 ＋ 一覧リンク",
                  reason: "予約を後押しする場所。おすすめ1件 + 「もっと見る」が効果的",
                  color: "bg-violet-50 text-violet-700",
                },
                {
                  page: "Stay おすすめセクション（将来）",
                  pattern: "具体ホテル 2-3 件（予算帯別）",
                  reason: "Budget / Mid / Premium で分けると幅広いユーザーに刺さる",
                  color: "bg-amber-50 text-amber-700",
                },
              ].map((row) => (
                <div key={row.page} className={`flex items-start gap-3 rounded-lg px-3 py-2 ${row.color}`}>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold">{row.page}</p>
                    <p className="text-[10px] opacity-80">{row.reason}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-white/70 px-2 py-0.5 text-[10px] font-bold">
                    {row.pattern}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
            <span className="font-semibold">おすすめホテルの選び方：</span>
            各エリア 2-3 件を予算帯で分ける（Budget ¥5,000〜 / Mid ¥10,000〜 / Premium ¥25,000〜）。
            駅近・口コミ高評価・外国人フレンドリーを基準に選ぶと良い。
          </div>
        </div>

        {/* How it works */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-900">保存の仕組み</p>
          <div className="mt-2 space-y-2 text-xs leading-5 text-slate-600">
            <p>
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white">1</span>
              <span className="ml-2">各アフィリエイトサイトでリンク / Ad ID を取得</span>
            </p>
            <p>
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white">2</span>
              <span className="ml-2">この画面で「設定する」→ 貼り付けて保存（<code className="rounded bg-slate-100 px-1 text-[10px]">data/affiliate-links.json</code> に書き込み）</span>
            </p>
            <p>
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white">3</span>
              <span className="ml-2">開発サーバーが JSON の変更を検知 → 自動リロード → サイトに即反映</span>
            </p>
            <p>
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white">4</span>
              <span className="ml-2">本番に出すときは commit & deploy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
