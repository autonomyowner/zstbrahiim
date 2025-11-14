import type { SellerCategory } from '@/lib/supabase/types'

export type ProductType = 'Parfum Femme' | 'Parfum Homme' | 'Eau de Parfum' | 'Eau de Toilette'
export type ProductNeed = 'Journée' | 'Soirée' | 'Quotidien' | 'Spécial'

export type AdditionalInfo = {
  shipping: string
  returns: string
  payment: string
  exclusiveOffers?: string
}

export type ProductVideoAsset = {
  url: string
  thumbnailUrl: string
  durationSeconds: number
  fileSizeBytes: number
}

export const productCategoryOptions = [
  'Téléphones & Accessoires',
  'Informatique',
  'Électroménager & Électronique',
  'Automobiles & Véhicules',
  'Pièces détachées',
  'Meubles & Maison',
  'Matériaux & Équipement',
  'Vêtements & Mode',
  'Santé & Beauté',
  'Loisirs & Divertissements',
  'Parfums',
  'Accessoires',
]

export type Product = {
  id: string
  slug: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  image: string
  images: string[]
  category: string
  productType: ProductType
  need?: ProductNeed
  inStock: boolean
  isPromo: boolean
  rating?: number
  isNew?: boolean
  description: string
  benefits: string[]
  ingredients: string
  usageInstructions: string
  deliveryEstimate: string
  viewersCount: number
  countdownEndDate?: string
  additionalInfo: AdditionalInfo
  video?: ProductVideoAsset
  sellerCategory?: SellerCategory | null
}

export function getProductById(id: string): Product | undefined {
  // Check in main products first
  const product = products.find((p) => p.id === id)
  if (product) return product
  
  // Check in winter clothes
  try {
    const { winterClothes } = require('./winter-clothes')
    return winterClothes.find((p: Product) => p.id === id)
  } catch {
    return undefined
  }
}

// Women's Perfumes (for purple boutique - home page)
export const womenPerfumes: Product[] = [
  {
    id: 'wf-1',
    slug: 'parfum-femme-11800',
    name: 'Parfum Femme Élégance',
    brand: 'ZST',
    price: 11800,
    originalPrice: 11800,
    image: '/perfums/11800.jpg',
    images: ['/perfums/11800.jpg'],
    category: 'Santé & Beauté',
    productType: 'Parfum Femme',
    need: 'Soirée',
    inStock: true,
    isPromo: false,
    rating: 4.8,
    isNew: true,
    description: 'Un parfum féminin raffiné et élégant, parfait pour les occasions spéciales. Une fragrance envoûtante qui révèle votre personnalité unique.',
    benefits: [
      'Fragrance longue tenue',
      'Notes florales délicates',
      'Bouteille élégante de 10ml',
      'Parfait pour tous les jours'
    ],
    ingredients: 'Eau de Parfum, Alcools, Fragrance',
    usageInstructions: 'Vaporiser sur les zones de pulsation : poignets, cou, derrière les oreilles. 10ml - Parfait pour tester ou voyager.',
    deliveryEstimate: 'Livraison estimée sous 2-3 jours',
    viewersCount: 45,
    additionalInfo: {
      shipping: 'Livraison gratuite à partir de 20000 DA. Expédition sous 24-48h.',
      returns: 'Retours acceptés sous 7 jours.',
      payment: 'Paiement sécurisé par carte bancaire ou espèces à la livraison.',
      exclusiveOffers: 'Code promo WELCOME10 pour 10% de réduction sur votre première commande.',
    },
  },
  {
    id: 'wf-2',
    slug: 'parfum-femme-68000',
    name: 'Parfum Femme Prestige',
    brand: 'ZST',
    price: 68000,
    originalPrice: 68000,
    image: '/perfums/68000.jpg',
    images: ['/perfums/68000.jpg'],
    category: 'Santé & Beauté',
    productType: 'Parfum Femme',
    need: 'Soirée',
    inStock: true,
    isPromo: false,
    rating: 4.9,
    description: 'Un parfum de luxe exceptionnel pour la femme moderne. Une fragrance sophistiquée et mémorable.',
    benefits: [
      'Fragrance de luxe',
      'Tenue exceptionnelle',
      'Bouteille de 10ml',
      'Notes orientales envoûtantes'
    ],
    ingredients: 'Eau de Parfum, Alcools, Fragrance',
    usageInstructions: 'Vaporiser sur les zones de pulsation : poignets, cou, derrière les oreilles. 10ml - Parfait pour tester ou voyager.',
    deliveryEstimate: 'Livraison estimée sous 2-3 jours',
    viewersCount: 32,
    additionalInfo: {
      shipping: 'Livraison gratuite à partir de 20000 DA. Expédition sous 24-48h.',
      returns: 'Retours acceptés sous 7 jours.',
      payment: 'Paiement sécurisé par carte bancaire ou espèces à la livraison.',
    },
  },
  {
    id: 'wf-3',
    slug: 'parfum-femme-11500',
    name: 'Parfum Femme Délicat',
    brand: 'ZST',
    price: 11500,
    originalPrice: 11500,
    image: '/perfums/11500.jpg',
    images: ['/perfums/11500.jpg'],
    category: 'Santé & Beauté',
    productType: 'Parfum Femme',
    need: 'Quotidien',
    inStock: true,
    isPromo: false,
    rating: 4.6,
    description: 'Une fragrance douce et délicate, idéale pour un usage quotidien. Parfait pour la femme active.',
    benefits: [
      'Fragrance légère et fraîche',
      'Parfait pour tous les jours',
      'Bouteille de 10ml',
      'Notes florales subtiles'
    ],
    ingredients: 'Eau de Parfum, Alcools, Fragrance',
    usageInstructions: 'Vaporiser sur les zones de pulsation : poignets, cou, derrière les oreilles. 10ml - Parfait pour tester ou voyager.',
    deliveryEstimate: 'Livraison estimée sous 2-3 jours',
    viewersCount: 28,
    additionalInfo: {
      shipping: 'Livraison gratuite à partir de 20000 DA. Expédition sous 24-48h.',
      returns: 'Retours acceptés sous 7 jours.',
      payment: 'Paiement sécurisé par carte bancaire ou espèces à la livraison.',
    },
  },
  {
    id: 'wf-4',
    slug: 'parfum-femme-11800da',
    name: 'Parfum Femme Classique',
    brand: 'ZST',
    price: 11800,
    originalPrice: 11800,
    image: '/perfums/11800da 10ml.jpg',
    images: ['/perfums/11800da 10ml.jpg'],
    category: 'Santé & Beauté',
    productType: 'Parfum Femme',
    need: 'Journée',
    inStock: true,
    isPromo: false,
    rating: 4.7,
    description: 'Un classique intemporel qui ne se démode jamais. Une fragrance élégante pour la femme moderne.',
    benefits: [
      'Fragrance classique',
      'Tenue longue durée',
      'Bouteille de 10ml',
      'Notes sophistiquées'
    ],
    ingredients: 'Eau de Parfum, Alcools, Fragrance',
    usageInstructions: 'Vaporiser sur les zones de pulsation : poignets, cou, derrière les oreilles. 10ml - Parfait pour tester ou voyager.',
    deliveryEstimate: 'Livraison estimée sous 2-3 jours',
    viewersCount: 35,
    additionalInfo: {
      shipping: 'Livraison gratuite à partir de 20000 DA. Expédition sous 24-48h.',
      returns: 'Retours acceptés sous 7 jours.',
      payment: 'Paiement sécurisé par carte bancaire ou espèces à la livraison.',
    },
  },
  {
    id: 'wf-5',
    slug: 'parfum-femme-8000da',
    name: 'Parfum Femme Fraîcheur',
    brand: 'ZST',
    price: 8000,
    originalPrice: 8000,
    image: '/perfums/8000da 10ml.jpg',
    images: ['/perfums/8000da 10ml.jpg'],
    category: 'Santé & Beauté',
    productType: 'Parfum Femme',
    need: 'Quotidien',
    inStock: true,
    isPromo: true,
    rating: 4.5,
    description: 'Une fragrance fraîche et énergisante, parfaite pour commencer la journée avec entrain.',
    benefits: [
      'Fragrance fraîche',
      'Idéal pour le quotidien',
      'Bouteille de 10ml',
      'Notes agrumes et florales'
    ],
    ingredients: 'Eau de Parfum, Alcools, Fragrance',
    usageInstructions: 'Vaporiser sur les zones de pulsation : poignets, cou, derrière les oreilles. 10ml - Parfait pour tester ou voyager.',
    deliveryEstimate: 'Livraison estimée sous 2-3 jours',
    viewersCount: 42,
    additionalInfo: {
      shipping: 'Livraison gratuite à partir de 20000 DA. Expédition sous 24-48h.',
      returns: 'Retours acceptés sous 7 jours.',
      payment: 'Paiement sécurisé par carte bancaire ou espèces à la livraison.',
    },
  },
  {
    id: 'wf-6',
    slug: 'parfum-femme-7800da',
    name: 'Parfum Femme Sensuel',
    brand: 'ZST',
    price: 7800,
    originalPrice: 7800,
    image: '/perfums/7800da 10ml.jpg',
    images: ['/perfums/7800da 10ml.jpg'],
    category: 'Santé & Beauté',
    productType: 'Parfum Femme',
    need: 'Soirée',
    inStock: true,
    isPromo: false,
    rating: 4.6,
    description: 'Une fragrance sensuelle et envoûtante, parfaite pour les soirées romantiques.',
    benefits: [
      'Fragrance sensuelle',
      'Parfait pour les soirées',
      'Bouteille de 10ml',
      'Notes orientales chaudes'
    ],
    ingredients: 'Eau de Parfum, Alcools, Fragrance',
    usageInstructions: 'Vaporiser sur les zones de pulsation : poignets, cou, derrière les oreilles. 10ml - Parfait pour tester ou voyager.',
    deliveryEstimate: 'Livraison estimée sous 2-3 jours',
    viewersCount: 38,
    additionalInfo: {
      shipping: 'Livraison gratuite à partir de 20000 DA. Expédition sous 24-48h.',
      returns: 'Retours acceptés sous 7 jours.',
      payment: 'Paiement sécurisé par carte bancaire ou espèces à la livraison.',
    },
  },
  {
    id: 'wf-7',
    slug: 'parfum-femme-7500',
    name: 'Parfum Femme Élégance',
    brand: 'ZST',
    price: 7500,
    originalPrice: 7500,
    image: '/perfums/7500.jpg',
    images: ['/perfums/7500.jpg'],
    category: 'Santé & Beauté',
    productType: 'Parfum Femme',
    need: 'Journée',
    inStock: true,
    isPromo: false,
    rating: 4.7,
    description: 'Une fragrance élégante et raffinée qui met en valeur votre féminité.',
    benefits: [
      'Fragrance élégante',
      'Tenue moyenne',
      'Bouteille de 10ml',
      'Notes florales raffinées'
    ],
    ingredients: 'Eau de Parfum, Alcools, Fragrance',
    usageInstructions: 'Vaporiser sur les zones de pulsation : poignets, cou, derrière les oreilles. 10ml - Parfait pour tester ou voyager.',
    deliveryEstimate: 'Livraison estimée sous 2-3 jours',
    viewersCount: 29,
    additionalInfo: {
      shipping: 'Livraison gratuite à partir de 20000 DA. Expédition sous 24-48h.',
      returns: 'Retours acceptés sous 7 jours.',
      payment: 'Paiement sécurisé par carte bancaire ou espèces à la livraison.',
    },
  },
  {
    id: 'wf-8',
    slug: 'parfum-femme-6800',
    name: 'Parfum Femme Douceur',
    brand: 'ZST',
    price: 6800,
    originalPrice: 6800,
    image: '/perfums/6800.jpg',
    images: ['/perfums/6800.jpg'],
    category: 'Santé & Beauté',
    productType: 'Parfum Femme',
    need: 'Quotidien',
    inStock: true,
    isPromo: false,
    rating: 4.5,
    description: 'Une fragrance douce et apaisante, idéale pour un usage quotidien.',
    benefits: [
      'Fragrance douce',
      'Parfait pour tous les jours',
      'Bouteille de 10ml',
      'Notes vanillées subtiles'
    ],
    ingredients: 'Eau de Parfum, Alcools, Fragrance',
    usageInstructions: 'Vaporiser sur les zones de pulsation : poignets, cou, derrière les oreilles. 10ml - Parfait pour tester ou voyager.',
    deliveryEstimate: 'Livraison estimée sous 2-3 jours',
    viewersCount: 33,
    additionalInfo: {
      shipping: 'Livraison gratuite à partir de 20000 DA. Expédition sous 24-48h.',
      returns: 'Retours acceptés sous 7 jours.',
      payment: 'Paiement sécurisé par carte bancaire ou espèces à la livraison.',
    },
  },
  {
    id: 'wf-9',
    slug: 'parfum-femme-6800da',
    name: 'Parfum Femme Charme',
    brand: 'ZST',
    price: 6800,
    originalPrice: 6800,
    image: '/perfums/6800da 10ml.jpg',
    images: ['/perfums/6800da 10ml.jpg'],
    category: 'Santé & Beauté',
    productType: 'Parfum Femme',
    need: 'Journée',
    inStock: true,
    isPromo: false,
    rating: 4.6,
    description: 'Un parfum charmeur qui révèle votre personnalité unique et séduisante.',
    benefits: [
      'Fragrance charmeuse',
      'Tenue moyenne',
      'Bouteille de 10ml',
      'Notes fruitées et florales'
    ],
    ingredients: 'Eau de Parfum, Alcools, Fragrance',
    usageInstructions: 'Vaporiser sur les zones de pulsation : poignets, cou, derrière les oreilles. 10ml - Parfait pour tester ou voyager.',
    deliveryEstimate: 'Livraison estimée sous 2-3 jours',
    viewersCount: 27,
    additionalInfo: {
      shipping: 'Livraison gratuite à partir de 20000 DA. Expédition sous 24-48h.',
      returns: 'Retours acceptés sous 7 jours.',
      payment: 'Paiement sécurisé par carte bancaire ou espèces à la livraison.',
    },
  },
]

// Men's Perfumes (for other boutique - services page)
export const menPerfumes: Product[] = [
  {
    id: 'm-1',
    slug: 'parfum-homme-7500louis',
    name: 'Parfum Homme Prestige',
    brand: 'ZST',
    price: 7500,
    originalPrice: 7500,
    image: '/perfums/7500louis.jpg',
    images: ['/perfums/7500louis.jpg'],
    category: 'Santé & Beauté',
    productType: 'Parfum Homme',
    need: 'Soirée',
    inStock: true,
    isPromo: false,
    rating: 4.8,
    isNew: true,
    description: 'Un parfum masculin prestigieux et sophistiqué, parfait pour l\'homme moderne et élégant.',
    benefits: [
      'Fragrance masculine puissante',
      'Tenue exceptionnelle',
      'Bouteille élégante de 10ml',
      'Parfait pour les occasions spéciales'
    ],
    ingredients: 'Eau de Parfum, Alcools, Fragrance',
    usageInstructions: 'Vaporiser sur les zones de pulsation : poignets, cou, derrière les oreilles. 10ml - Parfait pour tester ou voyager.',
    deliveryEstimate: 'Livraison estimée sous 2-3 jours',
    viewersCount: 52,
    additionalInfo: {
      shipping: 'Livraison gratuite à partir de 20000 DA. Expédition sous 24-48h.',
      returns: 'Retours acceptés sous 7 jours.',
      payment: 'Paiement sécurisé par carte bancaire ou espèces à la livraison.',
      exclusiveOffers: 'Code promo WELCOME10 pour 10% de réduction sur votre première commande.',
    },
  },
  {
    id: 'm-2',
    slug: 'parfum-homme-6800da',
    name: 'Parfum Homme Fraîcheur',
    brand: 'ZST',
    price: 6800,
    originalPrice: 6800,
    image: '/perfums/6800da 10.jpg',
    images: ['/perfums/6800da 10.jpg'],
    category: 'Santé & Beauté',
    productType: 'Parfum Homme',
    need: 'Quotidien',
    inStock: true,
    isPromo: false,
    rating: 4.6,
    description: 'Une fragrance fraîche et énergisante, idéale pour l\'homme actif au quotidien.',
    benefits: [
      'Fragrance fraîche',
      'Parfait pour tous les jours',
      'Bouteille de 10ml',
      'Notes agrumes et boisées'
    ],
    ingredients: 'Eau de Parfum, Alcools, Fragrance',
    usageInstructions: 'Vaporiser sur les zones de pulsation : poignets, cou, derrière les oreilles. 10ml - Parfait pour tester ou voyager.',
    deliveryEstimate: 'Livraison estimée sous 2-3 jours',
    viewersCount: 41,
    additionalInfo: {
      shipping: 'Livraison gratuite à partir de 20000 DA. Expédition sous 24-48h.',
      returns: 'Retours acceptés sous 7 jours.',
      payment: 'Paiement sécurisé par carte bancaire ou espèces à la livraison.',
    },
  },
  {
    id: 'm-3',
    slug: 'parfum-homme-6800-10ml',
    name: 'Parfum Homme Intense',
    brand: 'ZST',
    price: 6800,
    originalPrice: 6800,
    image: '/perfums/6800 10ml.jpg',
    images: ['/perfums/6800 10ml.jpg'],
    category: 'Santé & Beauté',
    productType: 'Parfum Homme',
    need: 'Soirée',
    inStock: true,
    isPromo: false,
    rating: 4.7,
    description: 'Un parfum intense et charismatique qui révèle votre personnalité forte.',
    benefits: [
      'Fragrance intense',
      'Tenue longue durée',
      'Bouteille de 10ml',
      'Notes boisées et épicées'
    ],
    ingredients: 'Eau de Parfum, Alcools, Fragrance',
    usageInstructions: 'Vaporiser sur les zones de pulsation : poignets, cou, derrière les oreilles. 10ml - Parfait pour tester ou voyager.',
    deliveryEstimate: 'Livraison estimée sous 2-3 jours',
    viewersCount: 36,
    additionalInfo: {
      shipping: 'Livraison gratuite à partir de 20000 DA. Expédition sous 24-48h.',
      returns: 'Retours acceptés sous 7 jours.',
      payment: 'Paiement sécurisé par carte bancaire ou espèces à la livraison.',
    },
  },
  {
    id: 'm-4',
    slug: 'parfum-homme-6200',
    name: 'Parfum Homme Élégance',
    brand: 'ZST',
    price: 6200,
    originalPrice: 6200,
    image: '/perfums/6200.jpg',
    images: ['/perfums/6200.jpg'],
    category: 'Santé & Beauté',
    productType: 'Parfum Homme',
    need: 'Journée',
    inStock: true,
    isPromo: false,
    rating: 4.5,
    description: 'Une fragrance élégante et raffinée pour l\'homme distingué.',
    benefits: [
      'Fragrance élégante',
      'Tenue moyenne',
      'Bouteille de 10ml',
      'Notes classiques masculines'
    ],
    ingredients: 'Eau de Parfum, Alcools, Fragrance',
    usageInstructions: 'Vaporiser sur les zones de pulsation : poignets, cou, derrière les oreilles. 10ml - Parfait pour tester ou voyager.',
    deliveryEstimate: 'Livraison estimée sous 2-3 jours',
    viewersCount: 31,
    additionalInfo: {
      shipping: 'Livraison gratuite à partir de 20000 DA. Expédition sous 24-48h.',
      returns: 'Retours acceptés sous 7 jours.',
      payment: 'Paiement sécurisé par carte bancaire ou espèces à la livraison.',
    },
  },
  {
    id: 'm-5',
    slug: 'parfum-homme-5800',
    name: 'Parfum Homme Sport',
    brand: 'ZST',
    price: 5800,
    originalPrice: 5800,
    image: '/perfums/5800.jpg',
    images: ['/perfums/5800.jpg'],
    category: 'Santé & Beauté',
    productType: 'Parfum Homme',
    need: 'Quotidien',
    inStock: true,
    isPromo: true,
    rating: 4.4,
    description: 'Une fragrance dynamique et sportive, parfaite pour l\'homme actif.',
    benefits: [
      'Fragrance dynamique',
      'Idéal pour le sport',
      'Bouteille de 10ml',
      'Notes fraîches et énergisantes'
    ],
    ingredients: 'Eau de Parfum, Alcools, Fragrance',
    usageInstructions: 'Vaporiser sur les zones de pulsation : poignets, cou, derrière les oreilles. 10ml - Parfait pour tester ou voyager.',
    deliveryEstimate: 'Livraison estimée sous 2-3 jours',
    viewersCount: 44,
    additionalInfo: {
      shipping: 'Livraison gratuite à partir de 20000 DA. Expédition sous 24-48h.',
      returns: 'Retours acceptés sous 7 jours.',
      payment: 'Paiement sécurisé par carte bancaire ou espèces à la livraison.',
    },
  },
  {
    id: 'm-6',
    slug: 'parfum-homme-5500',
    name: 'Parfum Homme Classic',
    brand: 'ZST',
    price: 5500,
    originalPrice: 5500,
    image: '/perfums/5500.jpg',
    images: ['/perfums/5500.jpg'],
    category: 'Santé & Beauté',
    productType: 'Parfum Homme',
    need: 'Journée',
    inStock: true,
    isPromo: false,
    rating: 4.5,
    description: 'Un classique intemporel qui ne se démode jamais. Une fragrance masculine authentique.',
    benefits: [
      'Fragrance classique',
      'Tenue moyenne',
      'Bouteille de 10ml',
      'Notes boisées traditionnelles'
    ],
    ingredients: 'Eau de Parfum, Alcools, Fragrance',
    usageInstructions: 'Vaporiser sur les zones de pulsation : poignets, cou, derrière les oreilles. 10ml - Parfait pour tester ou voyager.',
    deliveryEstimate: 'Livraison estimée sous 2-3 jours',
    viewersCount: 28,
    additionalInfo: {
      shipping: 'Livraison gratuite à partir de 20000 DA. Expédition sous 24-48h.',
      returns: 'Retours acceptés sous 7 jours.',
      payment: 'Paiement sécurisé par carte bancaire ou espèces à la livraison.',
    },
  },
  {
    id: 'm-7',
    slug: 'parfum-homme-4900',
    name: 'Parfum Homme Essence',
    brand: 'ZST',
    price: 4900,
    originalPrice: 4900,
    image: '/perfums/4900.jpg',
    images: ['/perfums/4900.jpg'],
    category: 'Santé & Beauté',
    productType: 'Parfum Homme',
    need: 'Quotidien',
    inStock: true,
    isPromo: false,
    rating: 4.3,
    description: 'Une essence masculine pure et authentique, parfaite pour un usage quotidien.',
    benefits: [
      'Fragrance authentique',
      'Parfait pour tous les jours',
      'Bouteille de 10ml',
      'Notes épicées subtiles'
    ],
    ingredients: 'Eau de Parfum, Alcools, Fragrance',
    usageInstructions: 'Vaporiser sur les zones de pulsation : poignets, cou, derrière les oreilles. 10ml - Parfait pour tester ou voyager.',
    deliveryEstimate: 'Livraison estimée sous 2-3 jours',
    viewersCount: 25,
    additionalInfo: {
      shipping: 'Livraison gratuite à partir de 20000 DA. Expédition sous 24-48h.',
      returns: 'Retours acceptés sous 7 jours.',
      payment: 'Paiement sécurisé par carte bancaire ou espèces à la livraison.',
    },
  },
  {
    id: 'm-8',
    slug: 'parfum-homme-580',
    name: 'Parfum Homme Fresh',
    brand: 'ZST',
    price: 580,
    originalPrice: 580,
    image: '/perfums/580.jpg',
    images: ['/perfums/580.jpg'],
    category: 'Santé & Beauté',
    productType: 'Parfum Homme',
    need: 'Quotidien',
    inStock: true,
    isPromo: true,
    rating: 4.2,
    description: 'Une fragrance fraîche et légère, idéale pour un usage quotidien à petit prix.',
    benefits: [
      'Fragrance fraîche',
      'Excellent rapport qualité-prix',
      'Bouteille de 10ml',
      'Notes agrumes légères'
    ],
    ingredients: 'Eau de Parfum, Alcools, Fragrance',
    usageInstructions: 'Vaporiser sur les zones de pulsation : poignets, cou, derrière les oreilles. 10ml - Parfait pour tester ou voyager.',
    deliveryEstimate: 'Livraison estimée sous 2-3 jours',
    viewersCount: 48,
    additionalInfo: {
      shipping: 'Livraison gratuite à partir de 20000 DA. Expédition sous 24-48h.',
      returns: 'Retours acceptés sous 7 jours.',
      payment: 'Paiement sécurisé par carte bancaire ou espèces à la livraison.',
    },
  },
  {
    id: 'm-9',
    slug: 'parfum-homme-490',
    name: 'Parfum Homme Essential',
    brand: 'ZST',
    price: 490,
    originalPrice: 490,
    image: '/perfums/490.jpg',
    images: ['/perfums/490.jpg'],
    category: 'Santé & Beauté',
    productType: 'Parfum Homme',
    need: 'Quotidien',
    inStock: true,
    isPromo: true,
    rating: 4.1,
    description: 'Un parfum essentiel et abordable, parfait pour découvrir notre collection.',
    benefits: [
      'Fragrance essentielle',
      'Prix abordable',
      'Bouteille de 10ml',
      'Notes légères et agréables'
    ],
    ingredients: 'Eau de Parfum, Alcools, Fragrance',
    usageInstructions: 'Vaporiser sur les zones de pulsation : poignets, cou, derrière les oreilles. 10ml - Parfait pour tester ou voyager.',
    deliveryEstimate: 'Livraison estimée sous 2-3 jours',
    viewersCount: 39,
    additionalInfo: {
      shipping: 'Livraison gratuite à partir de 20000 DA. Expédition sous 24-48h.',
      returns: 'Retours acceptés sous 7 jours.',
      payment: 'Paiement sécurisé par carte bancaire ou espèces à la livraison.',
    },
  },
]

// Combined products array (for backward compatibility)
export const products: Product[] = [...womenPerfumes, ...menPerfumes]

export type SortOption = 'best-sellers' | 'price-asc' | 'price-desc' | 'newest' | 'highest-rated'

export type FilterState = {
  availability: 'all' | 'in-stock' | 'out-of-stock'
  brands: string[]
  priceRange: { min: number; max: number }
  productTypes: ProductType[]
  needs: ProductNeed[]
  category: string // Format: 'categoryId' or 'categoryId-subcategoryIndex'
}

// Marketplace category mappings to product categories
export const categoryMappings: Record<string, string[]> = {
  // Main categories
  'electronics': ['Électronique', 'Technologie', 'Informatique', 'Téléphones', 'Ordinateurs', 'Électroménager'],
  'transportation': ['Automobiles', 'Véhicules', 'Pièces', 'Auto'],
  'home': ['Maison', 'Jardin', 'Meubles', 'Équipement', 'Matériaux'],
  'personal': ['Vêtements', 'Mode', 'Santé', 'Beauté', 'Parfum'],
  'lifestyle': ['Loisirs', 'Divertissements', 'Sport', 'Jeux'],

  // Subcategories - specific matching
  'electronics-0': ['Téléphones', 'Accessoires', 'Mobile', 'Phone'],
  'electronics-1': ['Informatique', 'Ordinateurs', 'PC', 'Laptop'],
  'electronics-2': ['Électroménager', 'Électronique', 'Appliance'],
  'transportation-0': ['Automobiles', 'Véhicules', 'Voiture', 'Car'],
  'transportation-1': ['Pièces détachées', 'Pièces', 'Parts'],
  'home-0': ['Meubles', 'Maison', 'Furniture', 'Home'],
  'home-1': ['Matériaux', 'Équipement', 'Material', 'Equipment'],
  'personal-0': ['Vêtements', 'Mode', 'Clothes', 'Fashion', 'Clothing'],
  'personal-1': ['Santé', 'Beauté', 'Health', 'Beauty', 'Parfum', 'Cosmétique'],
  'lifestyle-0': ['Loisirs', 'Divertissements', 'Entertainment', 'Leisure'],
  'lifestyle-1': ['Sport', 'Fitness', 'Sports'],
}

// Helper function to check if a product matches a category filter
export function matchesCategory(productCategory: string, filterCategoryId: string): boolean {
  if (!filterCategoryId) return true // No filter applied

  const categoryKeywords = categoryMappings[filterCategoryId] || []
  return categoryKeywords.some(keyword =>
    productCategory.toLowerCase().includes(keyword.toLowerCase())
  )
}
