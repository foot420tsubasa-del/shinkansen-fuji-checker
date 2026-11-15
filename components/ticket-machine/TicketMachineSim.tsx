"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Check, RotateCcw } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

/*
 * A ticket machine you can practise on: the photograph is the machine, and an
 * interactive screen sits exactly over the photographed one, with the slots,
 * the cancel button and the amount display live where they are on the real
 * thing. Two missions — top up an IC card, buy a single ticket — in the five
 * languages the real screen offers.
 *
 * Positions are percentages of the 1024×1536 photograph, so everything scales
 * with it; text inside the screen is sized in container units (cqw).
 */

type Lang = "ja" | "en" | "zh-CN" | "zh-TW" | "ko";
type Mission = "charge" | "ticket";
type Stage =
  | "menu"
  | "fares"
  | "pay"
  | "issuing"
  | "takeTicket"
  | "insertCard"
  | "chargeAmount"
  | "chargePay"
  | "charging"
  | "takeCard"
  | "done";

const LANGS: { id: Lang; label: string }[] = [
  { id: "ja", label: "日本語" },
  { id: "en", label: "English" },
  { id: "zh-CN", label: "简体中文" },
  { id: "zh-TW", label: "繁體中文" },
  { id: "ko", label: "한국어" },
];

const S: Record<string, Record<Lang, string>> = {
  tickets: { ja: "きっぷ", en: "Tickets", "zh-CN": "车票", "zh-TW": "車票", ko: "승차권" },
  commuter: { ja: "定期券", en: "Commuter Pass", "zh-CN": "定期票", "zh-TW": "定期票", ko: "정기권" },
  green: { ja: "グリーン券", en: "Green Car Ticket", "zh-CN": "绿色车厢票", "zh-TW": "綠色車廂票", ko: "그린권" },
  discount: { ja: "おトクなきっぷ", en: "Discount Ticket", "zh-CN": "优惠车票", "zh-TW": "優惠車票", ko: "할인 승차권" },
  charge: { ja: "チャージ", en: "Charge", "zh-CN": "充值", "zh-TW": "儲值", ko: "충전" },
  refund: { ja: "買いまちがい払いもどし", en: "Refund for incorrect purchase", "zh-CN": "购买错误退款", "zh-TW": "購買錯誤退款", ko: "잘못 구매 환불" },
  icFirst: {
    ja: "ICカードをお持ちのお客さまは先に入れてください。",
    en: "If you have an IC card, please insert it first.",
    "zh-CN": "持有IC卡的乘客请先插入卡。",
    "zh-TW": "持有IC卡的旅客請先插入卡片。",
    ko: "IC카드를 가지신 분은 먼저 넣어 주십시오.",
  },
  searchNo: { ja: "駅番号検索", en: "Search by Station No.", "zh-CN": "按车站编号搜索", "zh-TW": "依車站編號搜尋", ko: "역 번호 검색" },
  searchName: { ja: "駅名検索", en: "Search by Station Name", "zh-CN": "按车站名搜索", "zh-TW": "依車站名稱搜尋", ko: "역 이름 검색" },
  platform: { ja: "入場券", en: "Platform Ticket", "zh-CN": "站台票", "zh-TW": "月台票", ko: "입장권" },
  people: { ja: "人数を選んでください", en: "Select the number of passengers", "zh-CN": "请选择人数", "zh-TW": "請選擇人數", ko: "인원수를 선택하십시오" },
  adult1: { ja: "大人 1人", en: "1 Adult", "zh-CN": "成人 1名", "zh-TW": "成人 1位", ko: "어른 1명" },
  adult2: { ja: "大人 2人", en: "2 Adults", "zh-CN": "成人 2名", "zh-TW": "成人 2位", ko: "어른 2명" },
  child1: { ja: "小児 1人", en: "1 Child", "zh-CN": "儿童 1名", "zh-TW": "兒童 1位", ko: "어린이 1명" },
  fare: { ja: "運賃", en: "Fare", "zh-CN": "票价", "zh-TW": "票價", ko: "운임" },
  insert: { ja: "お金を入れてください", en: "Please insert money", "zh-CN": "请投入现金", "zh-TW": "請投入現金", ko: "돈을 넣어 주십시오" },
  due: { ja: "お支払い金額", en: "Amount due", "zh-CN": "应付金额", "zh-TW": "應付金額", ko: "지불 금액" },
  inserted: { ja: "投入金額", en: "Inserted", "zh-CN": "已投入", "zh-TW": "已投入", ko: "투입 금액" },
  issuing: { ja: "発券中です。しばらくお待ちください", en: "Printing your ticket. Please wait", "zh-CN": "正在出票，请稍候", "zh-TW": "正在出票，請稍候", ko: "발권 중입니다. 잠시 기다려 주십시오" },
  takeTicket: { ja: "きっぷとおつりをお取りください", en: "Please take your ticket and change", "zh-CN": "请取走车票和找零", "zh-TW": "請取走車票和找零", ko: "승차권과 거스름돈을 받아 주십시오" },
  insertCard: { ja: "ICカードを入れてください", en: "Please insert your IC card", "zh-CN": "请插入IC卡", "zh-TW": "請插入IC卡", ko: "IC카드를 넣어 주십시오" },
  balance: { ja: "残額", en: "Balance", "zh-CN": "余额", "zh-TW": "餘額", ko: "잔액" },
  chooseCharge: { ja: "チャージする金額を選んでください", en: "Select the amount to add", "zh-CN": "请选择充值金额", "zh-TW": "請選擇儲值金額", ko: "충전할 금액을 선택하십시오" },
  charging: { ja: "チャージ中です。カードを取らないでください", en: "Charging. Do not remove your card", "zh-CN": "正在充值，请勿取出卡片", "zh-TW": "正在儲值，請勿取出卡片", ko: "충전 중입니다. 카드를 빼지 마십시오" },
  takeCard: { ja: "ICカードとおつりをお取りください", en: "Please take your IC card and change", "zh-CN": "请取走IC卡和找零", "zh-TW": "請取走IC卡和找零", ko: "IC카드와 거스름돈을 받아 주십시오" },
  newBalance: { ja: "チャージ後の残額", en: "New balance", "zh-CN": "充值后余额", "zh-TW": "儲值後餘額", ko: "충전 후 잔액" },
  change: { ja: "おつり", en: "Change", "zh-CN": "找零", "zh-TW": "找零", ko: "거스름돈" },
  thanks: { ja: "ありがとうございました", en: "Thank you", "zh-CN": "谢谢", "zh-TW": "謝謝", ko: "감사합니다" },
  select: { ja: "ご希望のボタンを押してください", en: "Please choose what you need", "zh-CN": "请选择所需的服务", "zh-TW": "請選擇所需的服務", ko: "원하시는 버튼을 눌러 주십시오" },
  selectFare: { ja: "人数を確認して、運賃のボタンを押してください", en: "Check the number of people, then press your fare", "zh-CN": "请确认人数后按票价按钮", "zh-TW": "請確認人數後按票價按鈕", ko: "인원을 확인한 뒤 운임 버튼을 눌러 주십시오" },
  receipt: { ja: "領収書", en: "Receipt", "zh-CN": "收据", "zh-TW": "收據", ko: "영수증" },
  back: { ja: "もどる", en: "Back", "zh-CN": "返回", "zh-TW": "返回", ko: "뒤로" },
};

const FARES = [150, 170, 180, 210, 230, 320, 410, 490, 580, 590, 660, 680, 740, 770, 830, 860, 950, 990, 1110, 1170, 1280, 1340, 1520, 1690];
const CHARGES = [1000, 2000, 3000, 4000, 5000, 10000];
const START_BALANCE = 420;
const MISSION_FARE = 210;
const MISSION_CHARGE = 2000;

/** Percent boxes on the 1024×1536 photograph. */
const BOX = {
  screen: { left: 19.24, top: 36.13, width: 68.16, height: 31.58 },
  amount: { left: 29.2, top: 71.8, width: 30.8, height: 3.6 },
  cancel: { left: 22.0, top: 73.0, width: 4.3, height: 2.9 },
  cardSlot: { left: 13.7, top: 83.2, width: 15.4, height: 5.3 },
  billSlot: { left: 38.6, top: 81.7, width: 16.9, height: 7.8 },
  coinSlot: { left: 65.9, top: 80.1, width: 29.3, height: 4.6 },
  ticketTray: { left: 14.2, top: 94.2, width: 16.6, height: 4.2 },
  changeTray: { left: 34.2, top: 94.2, width: 26.4, height: 5.4 },
};
const pos = (b: { left: number; top: number; width: number; height: number }): CSSProperties => ({
  position: "absolute",
  left: `${b.left}%`,
  top: `${b.top}%`,
  width: `${b.width}%`,
  height: `${b.height}%`,
});
const yen = (n: number) => `¥${n.toLocaleString("en-US")}`;

const STEPS: Record<Mission, { stage: Stage[]; text: string }[]> = {
  charge: [
    { stage: ["menu"], text: "The machine opens on a menu, not on fares. Tap Charge (チャージ) — or simply insert your IC card." },
    { stage: ["insertCard"], text: "Insert your IC card into the ticket slot (きっぷ・定期券)." },
    { stage: ["chargeAmount"], text: `Check your balance, then choose ${yen(MISSION_CHARGE)}.` },
    { stage: ["chargePay", "charging"], text: "Feed cash into the bill slot (紙幣) or coin slot (硬貨). IC cards are topped up with cash." },
    { stage: ["takeCard", "done"], text: "Take your card back from the tray — and any change." },
  ],
  ticket: [
    { stage: ["menu"], text: "The machine opens on a menu. Tap Tickets (きっぷ)." },
    { stage: ["fares"], text: `Check the number of people at the top (1 adult is set). Find your fare on the map above the machines — Tokyo → Shinjuku is ${yen(MISSION_FARE)} — and press it.` },
    { stage: ["pay", "issuing"], text: "Insert cash. Most machines also take credit cards for single tickets." },
    { stage: ["takeTicket", "done"], text: "Take your ticket from the tray, and your change." },
  ],
};

function Btn({
  children,
  onClick,
  className = "",
  style,
  glow = false,
  label,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  glow?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={style}
      className={["relative transition-[filter,transform] active:scale-[0.97] active:brightness-90", glow ? "ts-glow" : "", className].join(" ")}
    >
      {children}
    </button>
  );
}

export function TicketMachineSim({ initialLang = "en" }: { initialLang?: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [mission, setMission] = useState<Mission>("charge");
  const [stage, setStage] = useState<Stage>("menu");
  const [pax, setPax] = useState<"adult1" | "adult2" | "child1">("adult1");
  const [fare, setFare] = useState(0);
  const [people, setPeople] = useState(1);
  const [chargeAmount, setChargeAmount] = useState(0);
  const [inserted, setInserted] = useState(0);
  const [balance, setBalance] = useState(START_BALANCE);
  const [hint, setHint] = useState<string | null>(null);
  const L = (k: keyof typeof S) => S[k][lang];

  const due = stage === "chargePay" || stage === "charging" ? chargeAmount : fare * people;
  const changeDue = Math.max(0, inserted - due);
  const paying = stage === "pay" || stage === "chargePay";

  const flash = (text: string) => setHint(text);
  useEffect(() => {
    if (!hint) return;
    const timer = setTimeout(() => setHint(null), 2600);
    return () => clearTimeout(timer);
  }, [hint]);

  const reset = (next: Mission = mission) => {
    setMission(next);
    setStage("menu");
    setPax("adult1");
    setFare(0);
    setPeople(1);
    setChargeAmount(0);
    setInserted(0);
    setBalance(START_BALANCE);
    setHint(null);
  };

  // Money in: once it covers the amount due, the machine gets on with it.
  useEffect(() => {
    if (!paying || inserted < due || due === 0) return;
    const next: Stage = stage === "pay" ? "issuing" : "charging";
    const timer = setTimeout(() => {
      setStage(next);
    }, 350);
    return () => clearTimeout(timer);
  }, [paying, inserted, due, stage]);

  useEffect(() => {
    if (stage !== "issuing" && stage !== "charging") return;
    const timer = setTimeout(() => {
      if (stage === "issuing") setStage("takeTicket");
      else {
        setBalance((b) => b + chargeAmount);
        setStage("takeCard");
      }
    }, 1600);
    return () => clearTimeout(timer);
  }, [stage, chargeAmount]);

  useEffect(() => {
    if (stage === "done") trackEvent({ action: "ticket_sim_complete", category: "station_practice", label: `${mission}|${lang}` });
  }, [stage, mission, lang]);

  const insertMoney = (amount: number) => {
    if (!paying) {
      flash("The machine is not asking for money yet — follow the screen.");
      return;
    }
    setInserted((v) => v + amount);
  };

  const onCancel = () => {
    if (inserted > 0 && paying) flash(`Cancelled — ${yen(inserted)} returned to the change tray.`);
    reset();
  };

  const stepIndex = STEPS[mission].findIndex((s) => s.stage.includes(stage));
  const want = {
    charge: stage === "menu" && mission === "charge",
    tickets: stage === "menu" && mission === "ticket",
    card: stage === "insertCard",
    cash: paying,
    ticketTray: stage === "takeTicket",
    cardTray: stage === "takeCard",
  };

  const fs = (n: number): CSSProperties => ({ fontSize: `${n}cqw` });

  // ── The screen ───────────────────────────────────────────────────────────
  const menu = (
    <div className="flex h-full flex-col gap-[1.2cqw] bg-[#dfe3e7] p-[1.2cqw]" style={{ width: "21.5%" }}>
      {[
        { k: "tickets" as const, active: stage === "fares" || stage === "pay", onClick: () => (stage !== "fares" ? flash("Finish or cancel this purchase first.") : undefined) },
        { k: "commuter" as const },
        { k: "green" as const },
        { k: "discount" as const },
      ].map((item) => (
        <Btn
          key={item.k}
          onClick={item.onClick ?? (() => flash("Not part of this practice."))}
          className={[
            "flex flex-col items-start rounded-[0.6cqw] px-[1.2cqw] py-[0.9cqw] text-left leading-tight shadow-[0_1px_0_rgba(0,0,0,0.15)]",
            item.active ? "bg-[#2f9a3f] text-white" : "bg-white text-[#222]",
          ].join(" ")}
        >
          <span className="font-bold" style={fs(2.1)}>{S[item.k].ja}</span>
          <span style={fs(1.45)}>{lang === "ja" ? S[item.k].en : L(item.k)}</span>
        </Btn>
      ))}
      <div className="flex-1" />
      <Btn
        glow={want.charge}
        onClick={() => {
          if (stage !== "fares") return flash("Finish or cancel this purchase first.");
          setMission("charge");
          setStage("insertCard");
        }}
        className={["flex flex-col items-start rounded-[0.6cqw] px-[1.2cqw] py-[0.9cqw] text-left leading-tight shadow-[0_1px_0_rgba(0,0,0,0.15)]", stage === "insertCard" || stage === "chargeAmount" || stage === "chargePay" ? "bg-[#2f9a3f] text-white" : "bg-white text-[#222]"].join(" ")}
      >
        <span className="font-bold" style={fs(2.1)}>{S.charge.ja}</span>
        <span style={fs(1.45)}>{lang === "ja" ? S.charge.en : L("charge")}</span>
      </Btn>
      <Btn onClick={() => flash("Refunds: ask staff at the window or press Call.")} className="rounded-[0.6cqw] bg-[#ffe100] px-[1.2cqw] py-[0.9cqw] text-left leading-tight text-[#222]">
        <span className="block font-bold" style={fs(1.6)}>{S.refund.ja}</span>
        <span className="block" style={fs(1.25)}>{lang === "ja" ? S.refund.en : L("refund")}</span>
      </Btn>
    </div>
  );

  const paxFare = (base: number) => (pax === "child1" ? Math.floor(base / 2 / 10) * 10 : base);

  let body: ReactNode = null;
  if (stage === "menu") {
    // The real machine opens on what you want to do; fares come after.
    const tile = "flex flex-col items-center justify-center rounded-[0.8cqw] px-[1cqw] text-center leading-tight shadow-[0_2px_0_rgba(0,0,0,0.18)]";
    body = (
      <div className="flex h-full flex-col p-[1.8cqw]">
        <p className="text-center font-bold text-[#222]" style={fs(2.3)}>{L("select")}</p>
        <p className="mt-[0.4cqw] text-center text-[#444]" style={fs(1.45)}>{L("icFirst")}</p>
        <div className="mt-[1.6cqw] grid flex-1 grid-cols-3 grid-rows-2 gap-[1.2cqw]">
          <Btn
            glow={want.tickets}
            onClick={() => {
              setMission("ticket");
              setStage("fares");
            }}
            className={[tile, "row-span-2 bg-[#2f9a3f] text-white"].join(" ")}
          >
            <span className="font-bold" style={fs(3.4)}>{S.tickets.ja}</span>
            <span className="mt-[0.4cqw]" style={fs(1.9)}>{lang === "ja" ? S.tickets.en : L("tickets")}</span>
          </Btn>
          <Btn
            glow={want.charge}
            onClick={() => {
              setMission("charge");
              setStage("insertCard");
            }}
            className={[tile, "bg-[#1d6fd1] text-white"].join(" ")}
          >
            <span className="font-bold" style={fs(2.6)}>{S.charge.ja}</span>
            <span style={fs(1.6)}>{lang === "ja" ? S.charge.en : L("charge")}</span>
          </Btn>
          {(["commuter", "green", "discount"] as const).map((k) => (
            <Btn key={k} onClick={() => flash("Not part of this practice.")} className={[tile, "bg-white text-[#222]"].join(" ")}>
              <span className="font-bold" style={fs(2.1)}>{S[k].ja}</span>
              <span style={fs(1.35)}>{lang === "ja" ? S[k].en : L(k)}</span>
            </Btn>
          ))}
        </div>
        <div className="mt-[1.2cqw] flex justify-between gap-[1cqw]">
          <Btn onClick={() => flash("Receipts are offered after you pay.")} className="rounded-[0.5cqw] bg-white px-[1.6cqw] py-[0.6cqw] text-[#222] shadow-[0_1px_0_rgba(0,0,0,0.15)]" style={fs(1.5)}>
            {S.receipt.ja} {lang === "ja" ? S.receipt.en : L("receipt")}
          </Btn>
          <Btn onClick={() => flash("Refunds: ask staff at the window or press Call.")} className="rounded-[0.5cqw] bg-[#ffe100] px-[1.6cqw] py-[0.6cqw] text-[#222]" style={fs(1.4)}>
            {S.refund.ja}
          </Btn>
        </div>
      </div>
    );
  } else if (stage === "fares") {
    body = (
      <div className="flex h-full flex-col p-[1.4cqw]">
        <div className="flex items-start justify-between gap-[1cqw]">
          <div className="flex gap-[0.6cqw]">
            {(["adult1", "adult2", "child1"] as const).map((k) => (
              <Btn
                key={k}
                onClick={() => setPax(k)}
                className={["rounded-[0.5cqw] px-[1.1cqw] py-[0.6cqw] font-bold", pax === k ? "bg-[#2f9a3f] text-white" : "bg-white text-[#222] shadow-[0_1px_0_rgba(0,0,0,0.15)]"].join(" ")}
                style={fs(1.6)}
              >
                {L(k)}
              </Btn>
            ))}
          </div>
          <div className="flex shrink-0 gap-[0.8cqw]">
            {(["searchNo", "searchName"] as const).map((k) => (
              <Btn key={k} onClick={() => flash("In practice: use the fare buttons. Fare maps hang above the machines.")} className="rounded-[0.5cqw] bg-[#ffe100] px-[1cqw] py-[0.6cqw] leading-tight text-[#222]">
                <span className="block font-bold" style={fs(1.7)}>{S[k].ja}</span>
                <span className="block" style={fs(1.05)}>{S[k].en}</span>
              </Btn>
            ))}
          </div>
        </div>
        <p className="mt-[0.8cqw] text-[#333]" style={fs(1.5)}>{L("selectFare")}</p>
        <div className="mt-[0.8cqw] grid flex-1 grid-cols-6 gap-[0.9cqw]">
          {FARES.map((f) => (
            <Btn
              key={f}
              glow={mission === "ticket" && f === MISSION_FARE}
              onClick={() => {
                setMission("ticket");
                setFare(paxFare(f));
                setPeople(pax === "adult2" ? 2 : 1);
                setStage("pay");
              }}
              className="rounded-[0.5cqw] bg-[linear-gradient(#3a3d42,#1d1f23)] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
              style={fs(2.7)}
            >
              {paxFare(f)}
            </Btn>
          ))}
        </div>
        <div className="mt-[1cqw] grid grid-cols-3 gap-[0.9cqw]">
          {[
            ["成田エクスプレス", "N'EX"],
            ["新幹線", "Shinkansen"],
            ["東京モノレール", "Tokyo Monorail"],
          ].map(([ja, en]) => (
            <Btn key={en} onClick={() => flash("Limited express and Shinkansen tickets: use these buttons, or the reserved-seat machines.")} className="rounded-[0.5cqw] bg-[linear-gradient(#3a3d42,#1d1f23)] py-[0.6cqw] leading-tight text-white">
              <span className="block font-bold" style={fs(1.5)}>{ja}</span>
              <span className="block" style={fs(1.15)}>{en}</span>
            </Btn>
          ))}
        </div>
        <div className="mt-[0.9cqw] flex justify-between">
          <Btn onClick={() => setStage("menu")} className="rounded-[0.5cqw] bg-[#cfd5db] px-[2cqw] py-[0.5cqw] text-[#222]" style={fs(1.6)}>
            {L("back")}
          </Btn>
          <Btn onClick={() => flash("Platform tickets let you see someone off. Not part of this practice.")} className="rounded-[0.5cqw] bg-[linear-gradient(#3a3d42,#1d1f23)] px-[2.4cqw] py-[0.5cqw] leading-tight text-white">
            <span className="block font-bold" style={fs(1.5)}>{S.platform.ja}</span>
            <span className="block" style={fs(1.1)}>{S.platform.en} 150</span>
          </Btn>
        </div>
      </div>
    );
  } else if (stage === "pay" || stage === "chargePay") {
    body = (
      <div className="flex h-full flex-col items-center justify-center p-[2cqw] text-center">
        <p className="font-bold text-[#222]" style={fs(3)}>{L("insert")}</p>
        <div className="mt-[2cqw] grid w-[70%] grid-cols-2 gap-y-[1cqw] rounded-[0.8cqw] bg-white p-[2cqw] text-left shadow-sm" style={fs(2.1)}>
          <span className="text-[#555]">{L("due")}</span>
          <span className="text-right font-bold text-[#222]">{yen(due)}</span>
          <span className="text-[#555]">{L("inserted")}</span>
          <span className="text-right font-bold text-[#2f9a3f]">{yen(inserted)}</span>
        </div>
        <p className="mt-[1.6cqw] text-[#555]" style={fs(1.5)}>
          1000 · 2000 · 5000 · 10000 / 10 · 50 · 100 · 500
        </p>
      </div>
    );
  } else if (stage === "issuing" || stage === "charging") {
    body = (
      <div className="flex h-full flex-col items-center justify-center p-[2cqw] text-center">
        <div className="h-[6cqw] w-[6cqw] animate-spin rounded-full border-[0.8cqw] border-[#2f9a3f] border-t-transparent" />
        <p className="mt-[2cqw] font-bold text-[#222]" style={fs(2.6)}>{L(stage === "issuing" ? "issuing" : "charging")}</p>
      </div>
    );
  } else if (stage === "takeTicket" || stage === "takeCard") {
    body = (
      <div className="flex h-full flex-col items-center justify-center p-[2cqw] text-center">
        <p className="font-bold text-[#222]" style={fs(3)}>{L(stage)}</p>
        <Btn onClick={() => flash("Receipt printed — it comes out with your ticket.")} className="mt-[1.2cqw] rounded-[0.5cqw] bg-white px-[2cqw] py-[0.6cqw] text-[#222] shadow-[0_1px_0_rgba(0,0,0,0.15)]" style={fs(1.6)}>
          {S.receipt.ja} {lang === "ja" ? S.receipt.en : L("receipt")}
        </Btn>
        <div className="mt-[2cqw] grid w-[70%] grid-cols-2 gap-y-[1cqw] rounded-[0.8cqw] bg-white p-[2cqw] text-left shadow-sm" style={fs(2.1)}>
          {stage === "takeCard" ? (
            <>
              <span className="text-[#555]">{L("newBalance")}</span>
              <span className="text-right font-bold text-[#2f9a3f]">{yen(balance)}</span>
            </>
          ) : null}
          <span className="text-[#555]">{L("change")}</span>
          <span className="text-right font-bold text-[#222]">{yen(changeDue)}</span>
        </div>
      </div>
    );
  } else if (stage === "insertCard") {
    body = (
      <div className="flex h-full flex-col items-center justify-center p-[2cqw] text-center">
        <p className="font-bold text-[#222]" style={fs(3)}>{L("insertCard")}</p>
        <div className="mt-[2.4cqw] flex items-center gap-[2cqw]">
          <div className="flex h-[9cqw] w-[14cqw] items-center justify-center rounded-[1cqw] bg-[linear-gradient(135deg,#1fb36b,#0b7a49)] font-bold text-white shadow" style={fs(2.2)}>
            IC
          </div>
          <span className="animate-bounce text-[#2f9a3f]" style={fs(5)}>↓</span>
        </div>
        <Btn onClick={() => setStage("menu")} className="mt-[3cqw] rounded-[0.5cqw] bg-[#cfd5db] px-[2cqw] py-[0.8cqw] text-[#222]" style={fs(1.7)}>
          {L("back")}
        </Btn>
      </div>
    );
  } else if (stage === "chargeAmount") {
    body = (
      <div className="flex h-full flex-col p-[2cqw]">
        <div className="flex items-baseline justify-between">
          <p className="font-bold text-[#222]" style={fs(2.4)}>{L("chooseCharge")}</p>
          <p className="text-[#444]" style={fs(1.9)}>
            {L("balance")} <b className="text-[#222]">{yen(balance)}</b>
          </p>
        </div>
        <div className="mt-[2cqw] grid grid-cols-3 gap-[1.4cqw]">
          {CHARGES.map((amount) => (
            <Btn
              key={amount}
              glow={amount === MISSION_CHARGE}
              onClick={() => {
                setChargeAmount(amount);
                setStage("chargePay");
              }}
              className="rounded-[0.8cqw] bg-[linear-gradient(#3a3d42,#1d1f23)] py-[2.2cqw] font-bold text-white"
              style={fs(2.8)}
            >
              {amount.toLocaleString("en-US")}
            </Btn>
          ))}
        </div>
      </div>
    );
  } else if (stage === "done") {
    body = (
      <div className="flex h-full flex-col items-center justify-center p-[2cqw] text-center">
        <p className="font-bold text-[#2f9a3f]" style={fs(3.4)}>{L("thanks")}</p>
        {mission === "charge" ? (
          <p className="mt-[1.2cqw] text-[#333]" style={fs(2)}>
            {L("balance")} {yen(balance)}
          </p>
        ) : null}
      </div>
    );
  }

  const screen = (
    <div className="absolute flex flex-col overflow-hidden bg-[#eef0f2]" style={{ ...pos(BOX.screen), containerType: "inline-size" }}>
      <div className="flex shrink-0 items-center justify-end gap-[0.6cqw] bg-[#c9cfd5] px-[1.2cqw] py-[0.7cqw]">
        <span className="mr-[0.6cqw] text-[#333]" style={fs(1.6)}>Language 🌐</span>
        {LANGS.map((l) => (
          <Btn
            key={l.id}
            onClick={() => setLang(l.id)}
            className={["rounded-[0.4cqw] px-[1.1cqw] py-[0.4cqw]", lang === l.id ? "bg-[#2b2f35] text-white" : "bg-white text-[#222]"].join(" ")}
            style={fs(1.55)}
          >
            {l.label}
          </Btn>
        ))}
      </div>
      <div className="flex min-h-0 flex-1">
        {stage === "menu" ? null : menu}
        <div className="min-w-0 flex-1">{body}</div>
      </div>
      {hint ? (
        <div className="absolute inset-x-[6%] bottom-[5%] rounded-[1cqw] bg-[#1d1f23]/90 px-[2cqw] py-[1.2cqw] text-center text-white" style={fs(1.8)}>
          {hint}
        </div>
      ) : null}
    </div>
  );

  // ── Physical parts ───────────────────────────────────────────────────────
  const hot = "absolute rounded-[6px] outline-none focus-visible:ring-4 focus-visible:ring-amber-300";
  const glowClass = "ts-glow-box";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,520px)_1fr] lg:items-start">
      <style>{`
        @keyframes ts-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,214,0,.9), 0 0 0 0 rgba(255,214,0,.5); } 50% { box-shadow: 0 0 0 3px rgba(255,214,0,.95), 0 0 18px 6px rgba(255,214,0,.55); } }
        .ts-glow { animation: ts-pulse 1.3s ease-in-out infinite; z-index: 2; }
        .ts-glow-box { animation: ts-pulse 1.3s ease-in-out infinite; background: rgba(255,214,0,.12); }
      `}</style>

      <div className="relative mx-auto w-full max-w-[520px] select-none overflow-hidden rounded-[18px] shadow-[0_24px_60px_rgba(11,18,32,0.25)]">
        <Image src="/images/ticket-machine/jr-ticket-machine.webp" alt="A JR ticket and IC card machine" width={1024} height={1536} priority className="block h-auto w-full" />
        {screen}

        <div className="absolute flex items-center justify-end pr-[9%] font-mono font-bold text-[#7dff9a]" style={{ ...pos(BOX.amount), fontSize: "clamp(10px, 2.6vw, 15px)" }}>
          {paying && inserted > 0 ? inserted.toLocaleString("en-US") : ""}
        </div>

        <button type="button" aria-label="Cancel (とりけし)" onClick={onCancel} className={hot} style={pos(BOX.cancel)} />
        <button
          type="button"
          aria-label="Ticket and IC card slot"
          onClick={() => {
            // Inserting the card first is how most people do it: the machine
            // reads it and goes straight to the charge screen.
            if (want.card || stage === "menu") {
              setMission("charge");
              setStage("chargeAmount");
            } else flash("Nothing to insert here right now.");
          }}
          className={[hot, want.card || want.charge ? glowClass : ""].join(" ")}
          style={pos(BOX.cardSlot)}
        />
        <button
          type="button"
          aria-label="Bill slot: insert a 1,000 yen note"
          onClick={() => insertMoney(1000)}
          className={[hot, want.cash ? glowClass : ""].join(" ")}
          style={pos(BOX.billSlot)}
        />
        <button
          type="button"
          aria-label="Coin slot: insert a 100 yen coin"
          onClick={() => insertMoney(100)}
          className={[hot, want.cash ? glowClass : ""].join(" ")}
          style={pos(BOX.coinSlot)}
        />
        <button
          type="button"
          aria-label="Ticket and card tray"
          onClick={() => {
            if (want.ticketTray || want.cardTray) setStage("done");
            else flash("Nothing in the tray yet.");
          }}
          className={[hot, want.ticketTray || want.cardTray ? glowClass : ""].join(" ")}
          style={pos(BOX.ticketTray)}
        >
          {want.ticketTray ? (
            <span className="absolute left-1/2 top-[-60%] -translate-x-1/2 rounded-[3px] bg-[#f3e9c6] px-2 py-[2px] text-[10px] font-bold text-[#5a4a1a] shadow">TICKET</span>
          ) : null}
          {want.cardTray ? (
            <span className="absolute left-1/2 top-[-60%] -translate-x-1/2 rounded-[3px] bg-[#1fb36b] px-2 py-[2px] text-[10px] font-bold text-white shadow">IC</span>
          ) : null}
        </button>
        <div className={["pointer-events-none absolute rounded-[6px]", (want.ticketTray || want.cardTray) && changeDue > 0 ? glowClass : ""].join(" ")} style={pos(BOX.changeTray)} />

        {paying ? (
          <div className="absolute flex gap-1" style={{ left: "38.6%", top: "90.2%" }}>
            {[1000, 5000, 10000].map((note) => (
              <button key={note} type="button" onClick={() => insertMoney(note)} className="rounded-md bg-[#e8f1e3] px-1.5 py-[2px] text-[10px] font-bold text-[#1d4a2a] shadow ring-1 ring-[#9cc39a]">
                {yen(note)}
              </button>
            ))}
          </div>
        ) : null}
        {paying ? (
          <div className="absolute flex gap-1" style={{ left: "66%", top: "85.4%" }}>
            {[10, 50, 100, 500].map((coin) => (
              <button key={coin} type="button" onClick={() => insertMoney(coin)} className="h-6 min-w-6 rounded-full bg-[#d9c48a] px-1 text-[9.5px] font-bold text-[#4a3a10] shadow ring-1 ring-[#b39a52]">
                {coin}
              </button>
            ))}
          </div>
        ) : null}

        <span className="absolute bottom-1.5 right-2 text-[10px] font-medium text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">Illustrative image</span>
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(11,18,32,0.06)] lg:sticky lg:top-20">
        <div className="grid grid-cols-2 gap-2 rounded-full bg-slate-100 p-1">
          {(["charge", "ticket"] as Mission[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => reset(m)}
              className={["rounded-full px-3 py-2 text-sm font-bold transition-colors", mission === m ? "bg-ink text-white" : "text-slate-600 hover:text-ink"].join(" ")}
            >
              {m === "charge" ? "Top up an IC card" : "Buy a ticket"}
            </button>
          ))}
        </div>
        <ol className="mt-4 grid gap-2">
          {STEPS[mission].map((step, i) => {
            const doneStep = stage === "done" || i < stepIndex;
            const current = i === stepIndex && stage !== "done";
            return (
              <li
                key={step.text}
                className={[
                  "flex gap-3 rounded-2xl px-3 py-2.5 text-[14.5px] leading-6",
                  current ? "bg-amber-50 ring-1 ring-amber-300" : "",
                  doneStep ? "text-slate-400" : "text-slate-800",
                ].join(" ")}
              >
                <span
                  className={[
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    doneStep ? "bg-emerald-600 text-white" : current ? "bg-ink text-white" : "bg-slate-200 text-slate-600",
                  ].join(" ")}
                >
                  {doneStep ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span>{step.text}</span>
              </li>
            );
          })}
        </ol>
        {stage === "done" ? (
          <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
            <b>Done.</b> {mission === "charge" ? `Your card now holds ${yen(balance)}.` : `Ticket bought${changeDue ? `, ${yen(changeDue)} change` : ""}.`} The real machine works the same way, one screen at a time.
          </div>
        ) : null}
        <button type="button" onClick={() => reset()} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 underline underline-offset-2 hover:text-ink">
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Start again
        </button>
        <p className="mt-4 border-t border-slate-100 pt-3 text-[11.5px] leading-5 text-slate-500">
          Tip: the screen languages work like the real machine — tap English, 简体中文, 繁體中文 or 한국어 at the top. The red button is Cancel (とりけし) and returns your money. Practice only: an illustrative machine, not affiliated with any railway.
        </p>
      </div>
    </div>
  );
}
