/**
 * Volatile transport facts used by more than one editorial page.
 * Keep exact timetables out of evergreen copy; link to the operator instead.
 */
export const TRANSPORT_FACTS = {
  skyliner: {
    fastestToNippori: "36 min",
    fastestToKeiseiUeno: "41 min",
    timetableUrl: "https://www.keisei.co.jp/keisei/tetudou/skyliner/us/traffic/skyliner_1123.php",
  },
  naritaAccessExpress: {
    timetableUrl: "https://keisei.ekitan.com/naritaacs/timetable/station/682-7/d1",
    serviceNote:
      "Late Access Express trains do not all continue through Oshiage and Asakusa; check the destination on the official timetable.",
    revisionNote:
      "Keisei's announced timetable applies from November 21, 2026 on weekends/holidays and November 24 on weekdays. From Narita Airport Terminal 1, it shows the last direct Asakusa Line train at 21:09 on weekdays and 20:35 on weekends/holidays; later Access Express services terminate at Keisei-Ueno or Keisei-Takasago.",
  },
  shinjukuToTokyo: "about 14–15 min on the JR Chuo Rapid before station walking time",
  fares: {
    tokyoKyotoNozomiReservedRegular: "¥14,170",
    tokyoKyotoNonReserved: "¥13,320",
    jrPassOrdinary: {
      officialSite: { sevenDay: "¥50,000", fourteenDay: "¥80,000", twentyOneDay: "¥100,000" },
      overseasAgency: { sevenDay: "¥53,000", fourteenDay: "¥84,000", twentyOneDay: "¥105,000" },
    },
  },
} as const;
