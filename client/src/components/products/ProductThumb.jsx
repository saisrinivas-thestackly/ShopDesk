import { useState } from 'react';

export default function ProductThumb({ name, src }) {
  const [broken, setBroken] = useState(false);

  if (src && !broken) {
    return <img src={src} alt="" loading="lazy" onError={() => setBroken(true)} className="size-9 shrink-0 rounded-control object-cover" />;
  }
  return (
    <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-control bg-stat-purple font-semibold text-brand">
      {name?.[0]?.toUpperCase()}
    </span>
  );
}
