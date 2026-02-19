'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-darkBase/70">Share</span>
      <button
        type="button"
        onClick={copyLink}
        className="rounded-lg border border-darkBase/20 px-3 py-1.5 text-xs font-medium text-darkBase transition hover:bg-darkBase/10"
      >
        {copied ? 'Copied!' : 'Copy link'}
      </button>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-darkBase/20 px-3 py-1.5 text-xs font-medium text-darkBase transition hover:bg-darkBase/10"
      >
        Twitter
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-darkBase/20 px-3 py-1.5 text-xs font-medium text-darkBase transition hover:bg-darkBase/10"
      >
        Facebook
      </a>
    </div>
  );
}
