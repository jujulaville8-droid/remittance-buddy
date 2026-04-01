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

const PROVIDER_FAVICONS: Record<string, string> = {
  'Remitly':       'https://www.google.com/s2/favicons?domain=remitly.com&sz=64',
  'Wise':          'https://www.google.com/s2/favicons?domain=wise.com&sz=64',
  'Western Union': 'https://www.google.com/s2/favicons?domain=westernunion.com&sz=64',
  'MoneyGram':     'https://www.google.com/s2/favicons?domain=moneygram.com&sz=64',
  'Xoom':          'https://www.google.com/s2/favicons?domain=xoom.com&sz=64',
  'WorldRemit':    'https://www.google.com/s2/favicons?domain=worldremit.com&sz=64',
  'Pangea':        'https://www.google.com/s2/favicons?domain=pangeamoneytransfer.com&sz=64',
};

interface ProviderLogoProps {
  readonly provider: string;
  readonly size?: 'sm' | 'md';
}

export function ProviderLogo({ provider, size = 'sm' }: ProviderLogoProps) {
  const favicon = PROVIDER_FAVICONS[provider];
  const fallback = PROVIDER_LOGOS[provider] ?? { bg: '#6B7280', text: 'white', letter: provider.charAt(0) };
  const px = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';
  const textSize = size === 'sm' ? 'text-[9px]' : 'text-[11px]';

  if (favicon) {
    return (
      <img
        src={favicon}
        alt={provider}
        className={`${px} rounded-lg object-contain`}
        onError={(e) => {
          // If favicon fails, replace with letter fallback
          const target = e.currentTarget;
          target.style.display = 'none';
          target.nextElementSibling?.classList.remove('hidden');
        }}
      />
    );
  }

  return (
    <div
      className={`${px} rounded-lg flex items-center justify-center shrink-0 font-bold ${textSize}`}
      style={{ backgroundColor: fallback.bg, color: fallback.text }}
    >
      {fallback.letter}
    </div>
  );
}
