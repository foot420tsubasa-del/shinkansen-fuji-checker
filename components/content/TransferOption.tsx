"use client";

import { Check, Clock, Luggage, Wallet, Zap } from "lucide-react";
import { TransferOptionCard } from "@/components/airport/AirportTransferUi";
import type { AffiliateClickParams } from "@/lib/analytics";
import { getAffUrl } from "@/src/affiliateLinks";

type TransferOptionProps = {
  name: string;
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

const omioJapanTrainUrl = getAffUrl("omioJapanTrain");
const omioJapanBusUrl = getAffUrl("omioJapanBus");
const omioJapanAirportTransferUrl = getAffUrl("omioJapanAirportTransfer");
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
  return text.includes("private") || text.includes("taxi");
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

function actionTitleForOption(name: string) {
  const text = normalizedName(name);
  if (text.includes("private")) return "Private airport transfer";
  if (text.includes("narita express") || text.includes("n'ex")) return "Book or compare Narita Express";
  if (text.includes("skyliner")) return "Book or compare Skyliner";
  if (text.includes("haruka")) return "Book or compare JR Haruka";
  if (isAirportBus(name)) return "Book or compare airport bus";
  return "Book or compare this route";
}

function transportTypeForOption(name: string) {
  if (isPrivateTransfer(name)) return "private_transfer";
  if (isAirportBus(name)) return "airport_bus";
  if (isAirportTrain(name)) return "airport_train";
  return undefined;
}

function omioForOption(name: string) {
  if (isPrivateTransfer(name)) return null;
  if (isAirportBus(name)) {
    if (omioJapanAirportTransferUrl) return { href: omioJapanAirportTransferUrl, linkId: "omioJapanAirportTransfer", transportType: "airport_route_compare" };
    return omioJapanBusUrl ? { href: omioJapanBusUrl, linkId: "omioJapanBus", transportType: "airport_bus" } : null;
  }
  if (isAirportTrain(name)) {
    if (omioJapanAirportTransferUrl) return { href: omioJapanAirportTransferUrl, linkId: "omioJapanAirportTransfer", transportType: "airport_route_compare" };
    return omioJapanTrainUrl ? { href: omioJapanTrainUrl, linkId: "omioJapanTrain", transportType: "airport_train" } : null;
  }
  return null;
}

function linkIdForKlookOption(name: string, pagePath?: string) {
  const text = normalizedName(name);
  if (text.includes("narita express") || text.includes("n'ex")) return "nex";
  if (text.includes("skyliner")) return "keiseiSkyliner";
  if (text.includes("haruka")) return "jrHaruka";
  if (text.includes("nankai") || text.includes("rapi")) return "nankaiRapit";
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
  if (text.includes("nankai") || text.includes("rapi")) return nankaiRapitUrl;
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

function validKlookBookingLink(name: string, href?: string, pagePath?: string) {
  const configuredHref = configuredKlookHrefForOption(name, pagePath);
  if (configuredHref) return configuredHref;
  if (!href) return undefined;
  if (isPrivateTransfer(name) && href === legacyAirportTransferUrl) return undefined;
  if (isAirportBus(name) && href === naritaLimousineBusUrl && !pagePath?.includes("narita")) return undefined;
  return href;
}

const badgeConfig = {
  fastest: { label: "Fastest", icon: Zap },
  easiest: { label: "Easiest with luggage", icon: Check },
  cheapest: { label: "Cheapest", icon: Wallet },
};

function bestForCopy(badge: TransferOptionProps["badge"], luggageFriendly: boolean, lateOk: boolean) {
  if (badge === "fastest") return "Best for travelers who want the quickest route after landing.";
  if (badge === "cheapest") return "Best if you are traveling light and want to keep costs low.";
  if (luggageFriendly && lateOk) return "Best for heavy luggage, families, or tired late arrivals.";
  if (luggageFriendly) return "Best if luggage ease matters more than raw speed.";
  return "Best when you want a simpler arrival choice.";
}

export function TransferOption({
  name, badge, duration, cost, pros, cons,
  luggageFriendly, lateOk, bookingLink, bookingLabel = "Book ticket", locale = "en", pagePath, placement = "airport_transfer",
}: TransferOptionProps) {
  const b = badgeConfig[badge];
  const BadgeIcon = b.icon;
  const effectiveBookingLink = validKlookBookingLink(name, bookingLink, pagePath);
  const omio = effectiveBookingLink ? omioForOption(name) : null;
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
          product: isPrivateTransfer(name) ? "airport_private_transfer" : isAirportBus(name) ? "airport_bus" : "airport_train",
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
      price={cost}
      bestFor={bestForCopy(badge, luggageFriendly, lateOk)}
      pros={pros}
      cons={cons}
      tags={[
        { label: b.label, tone: badge === "fastest" ? "amber" : badge === "easiest" ? "green" : "slate", icon: <BadgeIcon className="h-3 w-3" /> },
        { label: luggageFriendly ? "Luggage friendly" : "Luggage difficult", tone: luggageFriendly ? "green" : "slate", icon: <Luggage className="h-3 w-3" /> },
        { label: lateOk ? "Late arrival OK" : "Ends early evening", tone: lateOk ? "green" : "amber", icon: <Clock className="h-3 w-3" /> },
      ]}
      ctas={providerCtas}
      actionTitle={actionTitleForOption(name)}
      helperText={
        providerCtas.length > 1
          ? "Use Klook to book a specific ticket. Use Omio to compare trains, buses, and route options."
          : bookingLink
            ? "Use Klook to book this transport product."
            : undefined
      }
      note={effectiveBookingLink ? undefined : isPrivateTransfer(name) ? "Pre-book if needed" : bookingLabel}
      placement={placement}
    />
  );
}
