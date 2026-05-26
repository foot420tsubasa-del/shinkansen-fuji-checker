"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import {
  trackInternalLinkClick,
  trackStayAreaContinueClick,
  trackStayAreaDetailSelect,
  trackStayAreaFilterClick,
} from "@/lib/analytics";

export function TrackedStayAreaFilterLink({
  href,
  children,
  className,
  filterId,
  filterLabel,
  pagePath,
  resultCount,
  topAreaIdAfterFilter,
  topAreaScoreAfterFilter,
  ariaCurrent,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  filterId: string;
  filterLabel: string;
  pagePath: string;
  resultCount: number;
  topAreaIdAfterFilter: string;
  topAreaScoreAfterFilter: number;
  ariaCurrent?: "true";
}) {
  return (
    <a
      href={href}
      className={className}
      aria-current={ariaCurrent}
      onClick={() =>
        trackStayAreaFilterClick({
          filter_id: filterId,
          filter_label: filterLabel,
          page_path: pagePath,
          result_count: resultCount,
          top_area_id_after_filter: topAreaIdAfterFilter,
          top_area_score_after_filter: topAreaScoreAfterFilter,
        })
      }
    >
      {children}
    </a>
  );
}

export function TrackedStayAreaDetailLink({
  href,
  children,
  className,
  areaId,
  areaName,
  overallScore,
  rankPosition,
  matchLabel,
  crowdLevel,
  complexityLevel,
  pagePath,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  areaId: string;
  areaName: string;
  overallScore: number;
  rankPosition: number;
  matchLabel: string;
  crowdLevel: string;
  complexityLevel: string;
  pagePath: string;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() =>
        trackStayAreaDetailSelect({
          area_id: areaId,
          area_name: areaName,
          overall_score: overallScore,
          rank_position: rankPosition,
          match_label: matchLabel,
          crowd_level: crowdLevel,
          complexity_level: complexityLevel,
          page_path: pagePath,
        })
      }
    >
      {children}
    </a>
  );
}

export function TrackedStayAreaContinueLink({
  href,
  children,
  className,
  sourcePage,
  placement,
  label,
  locale,
  areaId,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  sourcePage: string;
  placement: string;
  label: string;
  locale?: string;
  areaId?: string;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        trackStayAreaContinueClick({
          area_id: areaId,
          target_path: href,
          link_label: label,
          placement,
          page_path: sourcePage,
        });
        trackInternalLinkClick({
          source_page: sourcePage,
          placement,
          target_path: href,
          link_label: label,
          locale,
        });
      }}
    >
      {children}
    </Link>
  );
}
