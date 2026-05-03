"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { LinkConfig } from "@/src/affiliateLinks";
import type { HotelLinkConfig } from "@/lib/hotel-links";

// ─── Types ──────────────────────────────────────────────────────────────────

type LinkEntry = { id: string } & LinkConfig;
type HotelEntry = { id: string } & HotelLinkConfig;
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
  tripUrl: string;
  fallbackLinkId: string;
  checkinType: "dynamic_offset" | "fixed_date";
  lastChecked: string;
};

type HotelPickLinkFormState = HotelPickLinkEntry;

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
  const [stayHotelPicks, setStayHotelPicks] = useState<StayHotelPickGroup[]>([]);
  const [hotelPickLinks, setHotelPickLinks] = useState<HotelPickLinkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showAdd, setShowAdd] = useState(false);
  const [klookUrlInput, setKlookUrlInput] = useState("");
  const [tab, setTab] = useState<"hotel" | "stay-picks" | "todo" | "all">("hotel");
  const [adminToken, setAdminToken] = useState("");
  const [editingHotelId, setEditingHotelId] = useState<string | null>(null);
  const [hotelForm, setHotelForm] = useState<HotelFormState | null>(null);
  const [editingHotelPickLinkId, setEditingHotelPickLinkId] = useState<string | null>(null);
  const [hotelPickLinkForm, setHotelPickLinkForm] = useState<HotelPickLinkFormState | null>(null);

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

  useEffect(() => {
    const saved = sessionStorage.getItem("fujiseat_admin_token") || "";
    setAdminToken(saved);
  }, []);

  useEffect(() => {
    fetchLinks();
    fetchHotelLinks();
    fetchStayHotelPicks();
    fetchHotelPickLinks();
  }, [fetchLinks, fetchHotelLinks, fetchStayHotelPicks, fetchHotelPickLinks]);

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
      tripUrl: entry.tripUrl,
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

  const startHotelPickLinkEdit = (entry: HotelPickLinkEntry) => {
    setEditingHotelPickLinkId(entry.id);
    setHotelPickLinkForm({
      id: entry.id,
      name: entry.name,
      hotelKey: entry.hotelKey,
      tripUrl: entry.tripUrl,
      label: entry.label,
      lastChecked: entry.lastChecked ?? "",
    });
    setEditingId(null);
    setShowAdd(false);
    cancelHotelEdit();
  };

  const cancelHotelPickLinkEdit = () => {
    setEditingHotelPickLinkId(null);
    setHotelPickLinkForm(null);
  };

  const updateHotelPickLinkForm = (field: keyof HotelPickLinkFormState, value: string) =>
    setHotelPickLinkForm((prev) => (prev ? { ...prev, [field]: value } : prev));

  const save = async () => {
    const id = form.id.trim();
    if (!id || !form.label.trim()) {
      flash("ID と商品名は必須です", false);
      return;
    }
    setSaving(true);
    try {
      const config: LinkConfig = {
        label: form.label.trim(),
        provider: form.provider,
        adid: form.adid.trim(),
        klookPath: form.klookPath.trim(),
        directUrl: form.directUrl.trim(),
        usedOn: form.usedOn.split(",").map((s) => s.trim()).filter(Boolean),
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
        tripUrl: hotelForm.tripUrl.trim(),
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

  const saveHotelPickLink = async () => {
    if (!hotelPickLinkForm) return;
    setSaving(true);
    try {
      const config = {
        name: hotelPickLinkForm.name.trim(),
        hotelKey: hotelPickLinkForm.hotelKey.trim(),
        tripUrl: hotelPickLinkForm.tripUrl.trim(),
        label: hotelPickLinkForm.label.trim() || `Check ${hotelPickLinkForm.name.trim()} on Trip.com`,
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
  const tripHotelDoneCount = hotelLinks.filter((h) => h.tripUrl.trim()).length;
  const hotelPickLinkUrlCount = hotelPickLinks.filter((pick) => pick.tripUrl.trim()).length;

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
    const isEditing = editingHotelId === entry.id && hotelForm;

    if (isEditing) {
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
          <div className="mt-3">
            <label className="text-[10px] font-bold text-blue-700">Trip.com affiliate / deeplink URL</label>
            <input
              value={hotelForm.tripUrl}
              onChange={(e) => updateHotelForm("tripUrl", e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-400"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              空欄ならKlookホテルリンクへfallbackします。Trip.com URLを入れるとGA4 providerも trip になります。
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
      <div className={`rounded-2xl border bg-white p-4 shadow-sm ${hasTripUrl ? "border-blue-200" : "border-amber-200 bg-amber-50/30"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">{entry.areaName}</p>
              <span className="rounded-md border border-blue-200 bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-800">
                Trip.com hotel
              </span>
              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${hasTripUrl ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {hasTripUrl ? "Trip URL 設定済み" : "Trip URL 未設定"}
              </span>
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                {entry.checkinType === "fixed_date" ? "固定日付" : "動的日付"}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              {entry.city} / fallback: <code className="rounded bg-slate-100 px-1">{entry.fallbackLinkId}</code>
            </p>
            <p className="mt-1 truncate text-[10px] text-slate-400">
              {hasTripUrl ? entry.tripUrl : "未設定時は既存Klookホテルリンクを使用"}
            </p>
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
    const usages = hotelPickUsage[entry.id] ?? [];

    if (isEditing) {
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
          <div className="mt-3">
            <label className="text-[10px] font-bold text-orange-700">具体ホテルのTrip.com affiliate URL</label>
            <input
              value={hotelPickLinkForm.tripUrl}
              onChange={(e) => updateHotelPickLinkForm("tripUrl", e.target.value)}
              placeholder="https://www.trip.com/t/..."
              className="mt-1 w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-xs outline-none focus:border-orange-400"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              空欄の場合は hotelKey のエリア検索リンクへfallbackします。同じホテルが複数ページに出ていても、この1箇所を保存すれば全ページに反映されます。
            </p>
          </div>
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
      <div className={`rounded-2xl border bg-white p-4 shadow-sm ${hasSpecificUrl ? "border-orange-200" : "border-slate-200"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">{entry.name}</p>
              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${hasSpecificUrl ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"}`}>
                {hasSpecificUrl ? "具体ホテルURL" : "エリア検索fallback"}
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
              {hasSpecificUrl ? entry.tripUrl : "未設定時はエリア検索のTrip.comリンクを使用"}
            </p>
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

        {/* Summary cards */}
        {!loading && (
          <div className="mb-6 grid gap-3 sm:grid-cols-5">
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
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{tripHotelDoneCount}/{hotelLinks.length}</p>
              <p className="text-[10px] font-medium text-blue-600">Tripホテル設定</p>
            </div>
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-center">
              <p className="text-2xl font-bold text-orange-700">{hotelPickLinkUrlCount}/{hotelPickLinks.length}</p>
              <p className="text-[10px] font-medium text-orange-600">具体ホテルURL</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setTab("hotel")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${tab === "hotel" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Trip.comホテル ({tripHotelDoneCount}/{hotelLinks.length})
          </button>
          <button
            onClick={() => setTab("stay-picks")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${tab === "stay-picks" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            おすすめホテル ({hotelPickLinkUrlCount}/{hotelPickLinks.length})
          </button>
          <button
            onClick={() => setTab("todo")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${tab === "todo" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            やることリスト ({todoItems.length})
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

        {!loading && tab === "hotel" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-500" />
                <p className="text-sm font-bold text-slate-900">Trip.comホテルURL管理</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                Trip.com管理画面で生成したホテル検索deeplinkを、エリアごとに貼り付けます。
                空欄のエリアは既存Klookホテルリンクへfallbackします。
              </p>
              <div className="mt-3 rounded-xl bg-white px-3 py-2 text-[11px] leading-5 text-slate-600">
                <span className="font-semibold text-slate-800">運用ルール：</span>
                日付固定なしの検索URLを優先。日付固定URLしか作れない場合も、ここを差し替えるだけで全ページに反映されます。
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
                <p className="text-sm font-bold text-slate-900">Stayページのおすすめホテル管理</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                Stayページに表示される具体的なホテル名・Trip.com個別URLを、ホテル単位でまとめて管理します。
                同じホテルが複数ページに出ていても、ここで1回設定すれば全ページに反映されます。
              </p>
              <div className="mt-3 rounded-xl bg-white px-3 py-2 text-[11px] leading-5 text-slate-600">
                <span className="font-semibold text-slate-800">運用ルール：</span>
                具体ホテルを推す場合のみ Trip.com の個別ホテルdeeplinkを設定。未確認なら空欄のままエリア検索に逃がします。タグや表示エリアは各ページ側の文脈として保持します。
              </div>
            </div>

            <div className="space-y-2">
              {hotelPickLinks.map((entry) => (
                <HotelPickLinkCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        )}

        {!loading && tab === "todo" && (
          <div className="space-y-6">
            {todoItems.length === 0 ? (
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
            {(["klook", "agoda"] as const).map((provider) => {
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
