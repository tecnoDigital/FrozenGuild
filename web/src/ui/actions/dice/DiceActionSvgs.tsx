export function FishGlyph({ className }: { className?: string | undefined }) {
  return (
    <svg className={className} viewBox="0 0 120 90" aria-hidden="true">
      <path d="M14 45C31 20 72 17 96 45C72 73 31 70 14 45Z" />
      <path d="M91 45L114 25L108 45L114 65Z" />
      <circle cx="37" cy="39" r="4.2" />
      <path d="M58 28C53 37 53 52 58 62" />
    </svg>
  );
}

export function SpyGlyph({ className }: { className?: string | undefined }) {
  return (
    <svg className={className} viewBox="0 0 120 90" aria-hidden="true">
      <path d="M10 45C29 19 91 19 110 45C91 71 29 71 10 45Z" />
      <circle cx="60" cy="45" r="17" />
      <circle cx="60" cy="45" r="7" />
      <path d="M18 23L31 35M102 23L89 35" />
      <path d="M38 76L49 62M82 76L71 62" />
      <path d="M60 13V23M60 67V77" />
    </svg>
  );
}

export function SwapGlyph({ className }: { className?: string | undefined }) {
  return (
    <svg className={className} viewBox="0 0 120 90" aria-hidden="true">
      <rect x="17" y="22" width="30" height="42" rx="5" />
      <rect x="73" y="26" width="30" height="42" rx="5" />
      <path d="M27 17C45 7 75 8 93 25" />
      <path d="M93 25L80 24L88 14" />
      <path d="M93 73C75 83 45 82 27 65" />
      <path d="M27 65L40 66L32 76" />
      <path d="M25 36H39M81 50H95" />
    </svg>
  );
}

export function PadrinoGlyph({ className }: { className?: string | undefined }) {
  return (
    <svg className={className} viewBox="0 0 120 90" aria-hidden="true">
      <path d="M19 54L101 54L88 30L75 45L60 18L45 45L32 30Z" />
      <path d="M28 54L35 73H85L92 54" />
      <circle cx="32" cy="30" r="4" />
      <circle cx="60" cy="18" r="5" />
      <circle cx="88" cy="30" r="4" />
      <path d="M39 66H81" />
      <path d="M60 33V55" />
    </svg>
  );
}

export function FishingRod({ className }: { className?: string | undefined }) {
  return (
    <svg className={className} viewBox="0 0 140 180" aria-hidden="true">
      <path className="rodLine" d="M113 8C77 26 54 61 43 106" />
      <path className="rodMain" d="M118 6C86 23 61 55 47 103" />
      <path className="rodString" d="M48 102C57 126 70 139 87 146" />
      <path className="hook" d="M86 145C96 148 101 158 94 166C88 173 76 169 78 158" />
      <path className="iceShard" d="M78 112L108 123L100 157L68 147Z" />
      <path className="iceShardLine" d="M80 124L97 130M76 140L96 148" />
    </svg>
  );
}
