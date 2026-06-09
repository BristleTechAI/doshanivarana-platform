export interface PoojaItem {
  id: number;
  title: string;
  temple: string;
  deity: string;
  duration: string;
  price: string;
  purpose: string;
  category: 'Abhishekam' | 'Homam' | 'Archana' | 'Special Poojas';
  imageUrl: string;
}

export const poojaCatalog: PoojaItem[] = [
  // Abhishekam Category
  {
    id: 1,
    title: 'Rudrabhishekam',
    temple: 'Rameshwaram Temple',
    deity: 'Lord Shiva',
    duration: '45 mins',
    price: '₹1,200',
    purpose: 'Sacred bathing ritual for Lord Shiva for spiritual purification',
    category: 'Abhishekam',
    imageUrl: 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 2,
    title: 'Vishnu Abhishekam',
    temple: 'Tirumala Temple',
    deity: 'Lord Vishnu',
    duration: '40 mins',
    price: '₹1,100',
    purpose: 'Divine bathing ceremony for Lord Vishnu for prosperity and peace',
    category: 'Abhishekam',
    imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 3,
    title: 'Lakshmi Abhishekam',
    temple: 'Madurai Temple',
    deity: 'Goddess Lakshmi',
    duration: '35 mins',
    price: '₹900',
    purpose: 'Sacred bathing ritual for Goddess Lakshmi to attract wealth',
    category: 'Abhishekam',
    imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 4,
    title: 'Ganesha Abhishekam',
    temple: 'Siddhi Vinayak Temple',
    deity: 'Lord Ganesha',
    duration: '30 mins',
    price: '₹800',
    purpose: 'Remove obstacles and invoke blessings for new beginnings',
    category: 'Abhishekam',
    imageUrl: 'https://images.unsplash.com/photo-1772787429537-77ba39d3f855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBmbG93ZXIlMjBvZmZlcmluZ3MlMjBpbmNlbnNlfGVufDF8fHx8MTc3MzgyNTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 5,
    title: 'Saraswati Abhishekam',
    temple: 'Varanasi Temple',
    deity: 'Goddess Saraswati',
    duration: '35 mins',
    price: '₹850',
    purpose: 'Enhance knowledge, wisdom, and artistic abilities',
    category: 'Abhishekam',
    imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  // Homam Category
  {
    id: 6,
    title: 'Ganapathi Homam',
    temple: 'Siddhi Vinayak Temple',
    deity: 'Lord Ganesha',
    duration: '90 mins',
    price: '₹2,500',
    purpose: 'Fire ritual to remove obstacles and ensure success in endeavors',
    category: 'Homam',
    imageUrl: 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 7,
    title: 'Navagraha Homam',
    temple: 'Kumbakonam Temple',
    deity: 'Nine Planets',
    duration: '120 mins',
    price: '₹3,500',
    purpose: 'Balances planetary influences and removes doshas',
    category: 'Homam',
    imageUrl: 'https://images.unsplash.com/photo-1772787429537-77ba39d3f855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBmbG93ZXIlMjBvZmZlcmluZ3MlMjBpbmNlbnNlfGVufDF8fHx8MTc3MzgyNTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 8,
    title: 'Lakshmi Kubera Homam',
    temple: 'Madurai Temple',
    deity: 'Goddess Lakshmi',
    duration: '100 mins',
    price: '₹2,800',
    purpose: 'Attracts wealth, prosperity, and financial abundance',
    category: 'Homam',
    imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 9,
    title: 'Sudarshana Homam',
    temple: 'Tirumala Temple',
    deity: 'Lord Vishnu',
    duration: '85 mins',
    price: '₹2,200',
    purpose: 'Protection from negative energies and evil forces',
    category: 'Homam',
    imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 10,
    title: 'Maha Mrityunjaya Homam',
    temple: 'Rameshwaram Temple',
    deity: 'Lord Shiva',
    duration: '110 mins',
    price: '₹3,000',
    purpose: 'Promotes health, longevity, and victory over death',
    category: 'Homam',
    imageUrl: 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  // Archana Category
  {
    id: 11,
    title: 'Sahasranama Archana',
    temple: 'Tirumala Temple',
    deity: 'Lord Vishnu',
    duration: '30 mins',
    price: '₹500',
    purpose: 'Chanting 1000 names of Lord Vishnu for divine blessings',
    category: 'Archana',
    imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 12,
    title: 'Lalita Sahasranama Archana',
    temple: 'Madurai Temple',
    deity: 'Goddess Lalita',
    duration: '35 mins',
    price: '₹600',
    purpose: 'Invoke divine feminine energy and blessings',
    category: 'Archana',
    imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 13,
    title: 'Ashtottara Shatanamavali',
    temple: 'Siddhi Vinayak Temple',
    deity: 'Lord Ganesha',
    duration: '25 mins',
    price: '₹400',
    purpose: 'Offering 108 names for quick blessings and obstacle removal',
    category: 'Archana',
    imageUrl: 'https://images.unsplash.com/photo-1772787429537-77ba39d3f855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBmbG93ZXIlMjBvZmZlcmluZ3MlMjBpbmNlbnNlfGVufDF8fHx8MTc3MzgyNTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 14,
    title: 'Hanuman Chalisa Archana',
    temple: 'Varanasi Temple',
    deity: 'Lord Hanuman',
    duration: '20 mins',
    price: '₹350',
    purpose: 'Gain strength, courage, and protection from difficulties',
    category: 'Archana',
    imageUrl: 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 15,
    title: 'Durga Ashtottara Archana',
    temple: 'Kolkata Temple',
    deity: 'Goddess Durga',
    duration: '30 mins',
    price: '₹550',
    purpose: 'Divine mother\'s blessings for protection and strength',
    category: 'Archana',
    imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  // Special Poojas Category
  {
    id: 16,
    title: 'Satyanarayana Vratam',
    temple: 'Tirumala Temple',
    deity: 'Lord Satyanarayan',
    duration: '120 mins',
    price: '₹1,800',
    purpose: 'Complete vratam for fulfillment of wishes and prosperity',
    category: 'Special Poojas',
    imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 17,
    title: 'Varalakshmi Vratam',
    temple: 'Madurai Temple',
    deity: 'Goddess Lakshmi',
    duration: '90 mins',
    price: '₹1,500',
    purpose: 'Special vratam for family well-being and abundance',
    category: 'Special Poojas',
    imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 18,
    title: 'Kalasabhishekam',
    temple: 'Rameshwaram Temple',
    deity: 'Lord Shiva',
    duration: '75 mins',
    price: '₹2,000',
    purpose: 'Grand abhishekam with sacred pots for complete purification',
    category: 'Special Poojas',
    imageUrl: 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 19,
    title: 'Pradosham Special Pooja',
    temple: 'Chidambaram Temple',
    deity: 'Lord Shiva',
    duration: '60 mins',
    price: '₹1,300',
    purpose: 'Performed during pradosham time for liberation from sins',
    category: 'Special Poojas',
    imageUrl: 'https://images.unsplash.com/photo-1772787429537-77ba39d3f855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBmbG93ZXIlMjBvZmZlcmluZ3MlMjBpbmNlbnNlfGVufDF8fHx8MTc3MzgyNTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 20,
    title: 'Ekadashi Special Pooja',
    temple: 'Tirupati Temple',
    deity: 'Lord Vishnu',
    duration: '80 mins',
    price: '₹1,600',
    purpose: 'Auspicious pooja on Ekadashi for spiritual elevation',
    category: 'Special Poojas',
    imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

export const getTempleKey = (templeName: string): string => {
  const clean = templeName.toLowerCase();
  if (clean.includes('rameshwaram')) return 'rameshwaram';
  if (clean.includes('tirumala') || clean.includes('tirupati')) return 'tirumala';
  if (clean.includes('madurai')) return 'madurai';
  if (clean.includes('varanasi') || clean.includes('kashi')) return 'varanasi';
  if (clean.includes('siddhi vinayak') || clean.includes('siddhivinayak')) return 'siddhiVinayak';
  
  // Fallbacks for extra temples in the catalog
  if (clean.includes('kumbakonam')) return 'tirumala';
  if (clean.includes('kolkata')) return 'madurai';
  if (clean.includes('chidambaram')) return 'rameshwaram';
  return 'rameshwaram'; // default fallback
};

export const getTranslatedDeity = (deityName: string, t: (k: string) => string) => {
  const clean = deityName.toLowerCase().replace('lord ', '').replace('goddess ', '').trim();
  if (clean === 'shiva') return t('deity.shiva');
  if (clean === 'vishnu') return t('deity.vishnu');
  if (clean === 'lakshmi') return t('deity.lakshmi');
  if (clean === 'ganesha') return t('deity.ganesha');
  if (clean === 'saraswati') return t('deity.saraswati');
  if (clean === 'hanuman') return t('deity.hanuman');
  if (clean === 'durga') return t('deity.durga');
  if (clean === 'murugan') return t('deity.murugan');
  if (clean === 'lalita') return t('deity.lalita');
  if (clean.includes('satyanarayan')) return t('deity.satyanarayan');
  if (clean.includes('planets')) return t('deity.ninePlanets');
  return deityName;
};

export const getTranslatedTemple = (templeName: string, t: (k: string) => string) => {
  const clean = templeName.toLowerCase().replace(' temple', '').trim();
  if (clean.includes('kalahasti') || clean.includes('shivalayam')) return t('templeDb.tirumala.name');
  if (clean.includes('kashi') || clean.includes('varanasi')) return t('templeDb.varanasi.name');
  if (clean.includes('tirumala')) return t('templeDb.tirumala.name');
  if (clean.includes('rameshwaram')) return t('templeDb.rameshwaram.name');
  if (clean.includes('madurai')) return t('templeDb.madurai.name');
  if (clean.includes('siddhi vinayak') || clean.includes('siddhivinayak')) return t('templeDb.siddhiVinayak.name');
  return templeName;
};

export const getCategorySteps = (category: string) => {
  const cat = category.toLowerCase().trim();
  if (cat.includes('homam')) {
    return [
      { nameKey: 'poojaDetail.homamStep1Name', descKey: 'poojaDetail.homamStep1Desc' },
      { nameKey: 'poojaDetail.homamStep2Name', descKey: 'poojaDetail.homamStep2Desc' },
      { nameKey: 'poojaDetail.homamStep3Name', descKey: 'poojaDetail.homamStep3Desc' },
      { nameKey: 'poojaDetail.homamStep4Name', descKey: 'poojaDetail.homamStep4Desc' },
      { nameKey: 'poojaDetail.homamStep5Name', descKey: 'poojaDetail.homamStep5Desc' },
    ];
  } else if (cat.includes('archana')) {
    return [
      { nameKey: 'poojaDetail.archanaStep1Name', descKey: 'poojaDetail.archanaStep1Desc' },
      { nameKey: 'poojaDetail.archanaStep2Name', descKey: 'poojaDetail.archanaStep2Desc' },
      { nameKey: 'poojaDetail.archanaStep3Name', descKey: 'poojaDetail.archanaStep3Desc' },
      { nameKey: 'poojaDetail.archanaStep4Name', descKey: 'poojaDetail.archanaStep4Desc' },
      { nameKey: 'poojaDetail.archanaStep5Name', descKey: 'poojaDetail.archanaStep5Desc' },
    ];
  } else if (cat.includes('special')) {
    return [
      { nameKey: 'poojaDetail.specialStep1Name', descKey: 'poojaDetail.specialStep1Desc' },
      { nameKey: 'poojaDetail.specialStep2Name', descKey: 'poojaDetail.specialStep2Desc' },
      { nameKey: 'poojaDetail.specialStep3Name', descKey: 'poojaDetail.specialStep3Desc' },
      { nameKey: 'poojaDetail.specialStep4Name', descKey: 'poojaDetail.specialStep4Desc' },
      { nameKey: 'poojaDetail.specialStep5Name', descKey: 'poojaDetail.specialStep5Desc' },
    ];
  } else {
    return [
      { nameKey: 'poojaDetail.step1Name', descKey: 'poojaDetail.step1Desc' },
      { nameKey: 'poojaDetail.step2Name', descKey: 'poojaDetail.step2Desc' },
      { nameKey: 'poojaDetail.step3Name', descKey: 'poojaDetail.step3Desc' },
      { nameKey: 'poojaDetail.step4Name', descKey: 'poojaDetail.step4Desc' },
      { nameKey: 'poojaDetail.step5Name', descKey: 'poojaDetail.step5Desc' },
    ];
  }
};

export const getCategoryBlessings = (category: string) => {
  const cat = category.toLowerCase().trim();
  if (cat.includes('homam')) {
    return ['wealthProsperity', 'protectionNegative', 'peaceMind'];
  } else if (cat.includes('archana')) {
    return ['devotionGrace', 'wishFulfillment', 'peaceMind'];
  } else if (cat.includes('special')) {
    return ['familyWellbeing', 'wealthProsperity', 'peaceMind'];
  } else {
    return ['healthLongevity', 'removalObstacles', 'peaceMind'];
  }
};

export const getCategoryRashis = (category: string) => {
  const cat = category.toLowerCase().trim();
  if (cat.includes('homam')) {
    return ['Mesha', 'Vrishabha', 'Tula'];
  } else if (cat.includes('archana')) {
    return ['Kanya', 'Mithuna', 'Dhanu'];
  } else if (cat.includes('special')) {
    return ['Meena', 'Kumbha', 'Vrishchika'];
  } else {
    return ['Makara', 'Kumbha', 'Simha'];
  }
};
