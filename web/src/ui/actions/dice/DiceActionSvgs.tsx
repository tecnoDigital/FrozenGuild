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
      <path d="M10 45C30 20 90 20 110 45C90 70 30 70 10 45Z" />
      <circle cx="60" cy="45" r="14" />
      <circle cx="60" cy="45" r="6" />
      <path d="M35 25L45 35M85 25L75 35" />
    </svg>
  );
}

export function SwapGlyph({ className }: { className?: string | undefined }) {
  return (
    <svg className={className} viewBox="0 0 120 90" aria-hidden="true">
      <path d="M25 35L45 35L40 30M45 35L40 40" />
      <path d="M95 55L75 55L80 50M75 55L80 60" />
      <path d="M25 35C45 20 75 20 95 35" />
      <path d="M95 55C75 70 45 70 25 55" />
    </svg>
  );
}

export function PadrinoGlyph({ className }: { className?: string | undefined }) {
  return (
    <svg className={className} viewBox="0 0 120 90" aria-hidden="true">
      <path d="M20 50L100 50L85 30L35 30Z" />
      <path d="M50 30L60 15L70 30" />
      <circle cx="60" cy="55" r="5" />
      <path d="M60 60L60 72" />
      <path d="M45 72L75 72" />
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
