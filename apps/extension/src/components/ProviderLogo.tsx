const PROVIDER_LOGOS: Record<string, { bg: string; text: string; letter: string }> = {
  'Remitly':        { bg: '#00A651', text: 'white', letter: 'R' },
  'Wise':           { bg: '#9FE870', text: '#163300', letter: 'W' },
  'Western Union':  { bg: '#FFDD00', text: '#000000', letter: 'WU' },
  'MoneyGram':      { bg: '#FF6600', text: 'white', letter: 'MG' },
  'Xoom':           { bg: '#003087', text: 'white', letter: 'X' },
  'WorldRemit':     { bg: '#512D6D', text: 'white', letter: 'WR' },
  'Pangea':         { bg: '#1B75BC', text: 'white', letter: 'P' },
  'LBC':            { bg: '#E31937', text: 'white', letter: 'LBC' },
  'Kabayan Remit':  { bg: '#0047AB', text: 'white', letter: 'KR' },
  'iRemit':         { bg: '#FF0000', text: 'white', letter: 'iR' },
  'GCash':          { bg: '#007DFE', text: 'white', letter: 'G' },
  'Maya':           { bg: '#00C853', text: 'white', letter: 'M' },
  'Coins.ph':       { bg: '#1A73E8', text: 'white', letter: 'C' },
};

interface ProviderLogoProps {
  readonly provider: string;
  readonly size?: 'sm' | 'md';
}

export function ProviderLogo({ provider, size = 'sm' }: ProviderLogoProps) {
  const config = PROVIDER_LOGOS[provider] ?? { bg: '#6B7280', text: 'white', letter: provider.charAt(0) };
  const px = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';
  const textSize = size === 'sm' ? 'text-[9px]' : 'text-[11px]';

  return (
    <div
      className={`${px} rounded-lg flex items-center justify-center shrink-0 font-bold ${textSize}`}
      style={{ backgroundColor: config.bg, color: config.text }}
      role="img"
      aria-label={provider}
    >
      {config.letter}
    </div>
  );
}
