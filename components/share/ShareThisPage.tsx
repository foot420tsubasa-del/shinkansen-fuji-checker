"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { trackShareClick } from "@/lib/analytics";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 1.09.048 1.592.145v3.258c-.43-.045-.985-.067-1.569-.067-1.015 0-1.406.39-1.406 1.404v2.818h2.87l-.493 3.667h-2.377v8.073C18.78 22.87 22.5 18.03 22.5 12.426c0-6.213-4.787-11.25-10.694-11.25S1.112 6.213 1.112 12.426c0 5.076 3.056 9.555 7.989 11.265z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

type ShareThisPageProps = {
  title: string;
  url?: string;
  placement: string;
  description?: string;
  className?: string;
  locale?: string;
};

export function ShareThisPage({
  title,
  url,
  placement,
  description,
  className,
  locale,
}: ShareThisPageProps) {
  const [copied, setCopied] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState("");
  const [supportsNativeShare, setSupportsNativeShare] = useState(false);

  useEffect(() => {
    if (!url) {
      const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR requires effect-based DOM query for canonical URL
      setResolvedUrl(canonical?.href ?? window.location.href);
    }
    setSupportsNativeShare(!!navigator.share);
  }, [url]);

  const shareUrl = url || resolvedUrl;
  if (!shareUrl) return null;

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const xIntentUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      trackShareClick({ platform: "copy", locale, placement, label: "Copy link" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, url: shareUrl });
      trackShareClick({ platform: "native", locale, placement, label: "Share" });
    } catch {
      /* user cancelled or not supported */
    }
  };

  const btnBase =
    "inline-flex items-center justify-center rounded-xl border h-10 w-10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300";

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className ?? ""}`}>
      {description && (
        <p className="mb-4 text-sm leading-6 text-slate-500">{description}</p>
      )}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* X — official Web Intent */}
        <a
          href={xIntentUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X"
          onClick={() =>
            trackShareClick({ platform: "x", locale, placement, label: "Share on X" })
          }
          className={`${btnBase} border-slate-200 bg-white text-slate-800 hover:bg-slate-50`}
        >
          <XIcon className="h-4.5 w-4.5" />
        </a>

        {/* Facebook — official sharer URL */}
        <a
          href={fbShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Facebook"
          onClick={() =>
            trackShareClick({ platform: "facebook", locale, placement, label: "Share on Facebook" })
          }
          className={`${btnBase} border-[#1877f2]/20 bg-white text-[#1877f2] hover:bg-[#1877f2]/5`}
        >
          <FacebookIcon className="h-4.5 w-4.5" />
        </a>

        {/* LinkedIn — official share-offsite URL */}
        <a
          href={linkedInShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
          onClick={() =>
            trackShareClick({ platform: "linkedin", locale, placement, label: "Share on LinkedIn" })
          }
          className={`${btnBase} border-[#0a66c2]/20 bg-white text-[#0a66c2] hover:bg-[#0a66c2]/5`}
        >
          <LinkedInIcon className="h-4.5 w-4.5" />
        </a>

        {/* Copy link */}
        <button
          type="button"
          aria-label={copied ? "Copied" : "Copy link"}
          onClick={handleCopyLink}
          className={`${btnBase} ${
            copied
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          {copied ? <Check className="h-4.5 w-4.5" /> : <Copy className="h-4.5 w-4.5" />}
        </button>

        {/* Native share — only when supported */}
        {supportsNativeShare && (
          <button
            type="button"
            aria-label="Share"
            onClick={handleNativeShare}
            className={`${btnBase} border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}
          >
            <Share2 className="h-4.5 w-4.5" />
          </button>
        )}
      </div>
    </div>
  );
}
