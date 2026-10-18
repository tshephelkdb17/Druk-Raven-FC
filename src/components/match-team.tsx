import Image from 'next/image';

const badges: Record<string,string> = {
  drfc: '/images/drfc_logo.jpeg',
  annerley: '/images/annerleyfc.jpg',
  annerleyfc: '/images/annerleyfc.jpg',
  southsudan: '/images/southsudanfc.jpeg',
  southsudanfc: '/images/southsudanfc.jpeg',
};

export function Team({name}:{name:string}) {
  const badge = badges[name.toLowerCase().replace(/[^a-z0-9]/g,'')];
  return <div className="flex min-w-0 flex-col items-center gap-3 text-center">
    {badge ? <Image src={badge} alt="" width={64} height={64} className="h-14 w-14 bg-white object-contain p-1 sm:h-16 sm:w-16"/> :
      <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center border border-white/20 text-lg font-bold text-neutral-400">{name.split(/\s+/).map(word=>word[0]).join('').slice(0,3)}</span>}
    <span className="text-sm font-bold sm:text-lg">{name}</span>
  </div>;
}

