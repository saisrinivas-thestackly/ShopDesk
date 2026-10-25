import { useState } from 'react';
import { initials } from '../../utils/format';

export default function Avatar({ name, src, size = 24 }) {
  const [broken, setBroken] = useState(false);
  const style = { width: size, height: size, fontSize: Math.max(10, size * 0.38) };

  if (src && !broken) {
    return <img src={src} alt="" style={style} onError={() => setBroken(true)} className="shrink-0 rounded-full object-cover" />;
  }

  return (
    <span style={style} aria-hidden="true" className="grid shrink-0 place-items-center rounded-full bg-stat-blue font-semibold text-brand">
      {initials(name) || '?'}
    </span>
  );
}
