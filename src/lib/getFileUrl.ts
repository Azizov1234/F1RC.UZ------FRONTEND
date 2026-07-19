const staticImageMappings: Record<string, string> = {
  // Categories
  '/uploads/categories/f1.png': 'https://images.unsplash.com/photo-1610992015732-2449b76344cc?auto=format&fit=crop&w=800&q=80',
  '/uploads/categories/drift.png': 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80',
  '/uploads/categories/buggy.png': 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=800&q=80',
  '/uploads/categories/fpv.png': 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
  '/uploads/categories/monster.png': 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=800&q=80',
  '/uploads/categories/default.png': 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80',

  // Arenas
  '/uploads/arenas/tashkent.png': 'https://images.unsplash.com/photo-1594911773418-406a4b12dfcb?auto=format&fit=crop&w=800&q=80',
  '/uploads/arenas/samarkand.png': 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80',
  '/uploads/arenas/bukhara.png': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',

  // Vehicles
  '/uploads/vehicles/red-bull-rb19-replica.png': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80',
  '/uploads/vehicles/ferrari-sf-23-replica.png': 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
  '/uploads/vehicles/mercedes-w14-replica.png': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
  '/uploads/vehicles/mclaren-mcl60-replica.png': 'https://images.unsplash.com/photo-1625217527288-93919c996509?auto=format&fit=crop&w=800&q=80',
};

export function getFileUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Check if there is a static mapping first
  if (staticImageMappings[normalizedPath]) {
    return staticImageMappings[normalizedPath];
  }

  // Handle pattern-based seeded paths for vehicles/arenas
  if (normalizedPath.startsWith('/uploads/vehicles/vehicle-model-')) {
    return 'https://images.unsplash.com/photo-1594911773418-406a4b12dfcb?auto=format&fit=crop&w=800&q=80';
  }
  if (normalizedPath.startsWith('/uploads/arenas/rc-arena-')) {
    return 'https://images.unsplash.com/photo-1594911773418-406a4b12dfcb?auto=format&fit=crop&w=800&q=80';
  }

  const apiUrl = import.meta.env.VITE_API_URL || '';
  return `${apiUrl}${normalizedPath}`;
}
