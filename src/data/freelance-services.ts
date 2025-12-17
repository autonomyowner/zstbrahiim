export type ServiceCategory =
  | 'Développement Web'
  | 'Design Graphique'
  | 'Montage Vidéo'
  | 'Marketing Digital'
  | 'Rédaction'
  | 'Photographie'
  | 'Traduction'
  | 'Consultation'

export type ExperienceLevel = 'Débutant' | 'Intermédiaire' | 'Expert'

export type FreelanceService = {
  id: string
  slug: string
  providerName: string
  providerAvatar: string
  serviceTitle: string
  category: ServiceCategory
  experienceLevel: ExperienceLevel
  rating: number
  reviewsCount: number
  completedProjects: number
  responseTime: string
  price: number
  priceType: 'fixed' | 'hourly' | 'starting-at'
  description: string
  shortDescription: string
  skills: string[]
  portfolio: {
    title: string
    image: string
    description: string
  }[]
  deliveryTime: string
  revisions: number | 'unlimited'
  languages: string[]
  availability: 'available' | 'busy' | 'unavailable'
  featured?: boolean
  verified?: boolean
  topRated?: boolean
}

export const freelanceServices: FreelanceService[] = [
  {
    id: 'fs-1',
    slug: 'developpement-site-web-professionnel',
    providerName: 'Ahmed Bensalem',
    providerAvatar: '/avatars/avatar-1.jpg',
    serviceTitle: 'Je développerai votre site web professionnel avec React et Next.js',
    category: 'Développement Web',
    experienceLevel: 'Expert',
    rating: 4.9,
    reviewsCount: 47,
    completedProjects: 152,
    responseTime: '1 heure',
    price: 50000,
    priceType: 'starting-at',
    description: `Je suis développeur web full-stack avec plus de 5 ans d'expérience. Je crée des sites web modernes, rapides et responsive qui convertissent vos visiteurs en clients.

**Ce que vous obtiendrez:**
- Site web entièrement responsive (mobile, tablette, desktop)
- Design moderne et élégant
- Optimisation SEO complète
- Performance optimale (temps de chargement rapide)
- Intégration avec vos réseaux sociaux
- Formulaires de contact fonctionnels
- Hébergement et déploiement inclus

**Mon processus:**
1. Discussion de vos besoins et objectifs
2. Création de maquettes et validation
3. Développement du site
4. Tests et ajustements
5. Déploiement et formation

Je travaille principalement avec React, Next.js, TypeScript et Tailwind CSS pour créer des sites web de haute qualité.`,
    shortDescription: 'Site web professionnel avec React et Next.js - Design moderne, SEO optimisé, 100% responsive',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'MongoDB', 'SEO'],
    portfolio: [
      {
        title: 'Site E-commerce Parfumerie',
        image: '/portfolio/web-1.jpg',
        description: 'Site e-commerce complet avec panier, paiement et gestion des commandes'
      },
      {
        title: 'Portfolio Photographe',
        image: '/portfolio/web-2.jpg',
        description: 'Portfolio élégant avec galerie d\'images optimisée'
      },
      {
        title: 'Application SaaS',
        image: '/portfolio/web-3.jpg',
        description: 'Application web avec authentification et tableau de bord'
      }
    ],
    deliveryTime: '7-14 jours',
    revisions: 3,
    languages: ['Français', 'Arabe', 'Anglais'],
    availability: 'available',
    featured: true,
    verified: true,
    topRated: true
  },
  {
    id: 'fs-2',
    slug: 'montage-video-professionnel-reels-youtube',
    providerName: 'Yasmine Louafi',
    providerAvatar: '/avatars/avatar-2.jpg',
    serviceTitle: 'Montage vidéo professionnel pour YouTube, TikTok et Instagram',
    category: 'Montage Vidéo',
    experienceLevel: 'Expert',
    rating: 5.0,
    reviewsCount: 89,
    completedProjects: 234,
    responseTime: '30 minutes',
    price: 8000,
    priceType: 'starting-at',
    description: `Monteuse vidéo professionnelle spécialisée dans le contenu pour les réseaux sociaux. Je transforme vos vidéos brutes en contenus engageants qui captivent votre audience.

**Services inclus:**
- Montage vidéo professionnel avec transitions fluides
- Correction des couleurs et de l'audio
- Sous-titres stylisés et animés
- Effets visuels et animations
- Musique et sound design
- Miniatures accrocheuses (thumbnails)
- Formats optimisés pour chaque plateforme

**Spécialisations:**
- YouTube (vlogs, tutoriels, reviews)
- TikTok et Instagram Reels (contenu viral)
- Publicités et promotions
- Vidéos corporate et témoignages
- Clips musicaux

Je travaille avec Adobe Premiere Pro, After Effects et DaVinci Resolve pour garantir une qualité professionnelle.`,
    shortDescription: 'Montage vidéo pro pour YouTube, TikTok, Instagram - Transitions, effets, sous-titres, miniatures',
    skills: ['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Color Grading', 'Sound Design', 'Motion Graphics'],
    portfolio: [
      {
        title: 'Vidéo YouTube - Tech Review',
        image: '/portfolio/video-1.jpg',
        description: 'Montage dynamique avec effets et transitions pour review tech'
      },
      {
        title: 'Instagram Reels Viral',
        image: '/portfolio/video-2.jpg',
        description: 'Série de reels avec +100K vues chacun'
      },
      {
        title: 'Publicité Produit',
        image: '/portfolio/video-3.jpg',
        description: 'Vidéo publicitaire professionnelle avec motion graphics'
      }
    ],
    deliveryTime: '2-3 jours',
    revisions: 'unlimited',
    languages: ['Français', 'Arabe', 'Anglais'],
    availability: 'available',
    featured: true,
    verified: true,
    topRated: true
  },
  {
    id: 'fs-3',
    slug: 'design-logo-identite-visuelle-professionnelle',
    providerName: 'Karim Messaoudi',
    providerAvatar: '/avatars/avatar-3.jpg',
    serviceTitle: 'Design de logo et identité visuelle professionnelle pour votre marque',
    category: 'Design Graphique',
    experienceLevel: 'Expert',
    rating: 4.8,
    reviewsCount: 63,
    completedProjects: 178,
    responseTime: '2 heures',
    price: 15000,
    priceType: 'starting-at',
    description: `Designer graphique passionné avec une expertise en création d'identité visuelle. Je crée des designs mémorables qui font ressortir votre marque.

**Package complet inclut:**
- 3-5 concepts de logo originaux
- Logo en plusieurs variations (couleur, noir & blanc, monochrome)
- Palette de couleurs de marque
- Guide de style de marque
- Fichiers sources modifiables (AI, PSD, SVG)
- Fichiers finaux en tous formats (PNG, JPG, PDF, SVG)
- Mockups réalistes de votre logo
- Révisions illimitées jusqu'à satisfaction

**Domaines d'expertise:**
- Identité de marque complète
- Logo minimaliste et moderne
- Design pour réseaux sociaux
- Packaging et étiquettes
- Brochures et flyers
- Cartes de visite

Je maîtrise Adobe Illustrator, Photoshop et Figma pour créer des designs de haute qualité.`,
    shortDescription: 'Logo professionnel et identité visuelle - 3-5 concepts, fichiers sources, révisions illimitées',
    skills: ['Adobe Illustrator', 'Photoshop', 'Figma', 'Branding', 'Typography', 'Color Theory'],
    portfolio: [
      {
        title: 'Identité Visuelle Restaurant',
        image: '/portfolio/design-1.jpg',
        description: 'Logo, menu, cartes de visite et signalétique complète'
      },
      {
        title: 'Branding Startup Tech',
        image: '/portfolio/design-2.jpg',
        description: 'Identité de marque moderne pour startup technologique'
      },
      {
        title: 'Packaging Produit Cosmétique',
        image: '/portfolio/design-3.jpg',
        description: 'Design d\'emballage élégant pour ligne de cosmétiques'
      }
    ],
    deliveryTime: '3-5 jours',
    revisions: 'unlimited',
    languages: ['Français', 'Arabe'],
    availability: 'available',
    featured: true,
    verified: true,
    topRated: true
  },
  {
    id: 'fs-4',
    slug: 'marketing-digital-gestion-reseaux-sociaux',
    providerName: 'Samia Khelifi',
    providerAvatar: '/avatars/avatar-4.jpg',
    serviceTitle: 'Gestion complète de vos réseaux sociaux et stratégie marketing',
    category: 'Marketing Digital',
    experienceLevel: 'Expert',
    rating: 4.9,
    reviewsCount: 52,
    completedProjects: 87,
    responseTime: '1 heure',
    price: 35000,
    priceType: 'starting-at',
    description: `Experte en marketing digital et gestion des réseaux sociaux. J'aide les entreprises à développer leur présence en ligne et à atteindre leurs objectifs commerciaux.

**Services proposés:**
- Stratégie de contenu personnalisée
- Création et planification de posts (Facebook, Instagram, LinkedIn, TikTok)
- Gestion de campagnes publicitaires (Facebook Ads, Instagram Ads)
- Création de visuels et de vidéos engageants
- Analyse des performances et reporting mensuel
- Growth hacking et augmentation de l'engagement
- Community management et réponses aux commentaires
- Collaboration avec influenceurs

**Résultats garantis:**
- Augmentation de la visibilité de votre marque
- Croissance organique de votre audience
- Engagement accru avec votre communauté
- ROI mesurable sur vos campagnes publicitaires

Je travaille avec des outils professionnels comme Meta Business Suite, Hootsuite, Canva Pro et Google Analytics.`,
    shortDescription: 'Gestion réseaux sociaux complète - Stratégie, contenu, publicités, croissance organique',
    skills: ['Facebook Ads', 'Instagram Marketing', 'Content Strategy', 'Canva', 'Analytics', 'Community Management', 'SEO'],
    portfolio: [
      {
        title: 'Croissance Instagram +50K',
        image: '/portfolio/marketing-1.jpg',
        description: 'Compte passé de 5K à 55K abonnés en 6 mois'
      },
      {
        title: 'Campagne Facebook Ads',
        image: '/portfolio/marketing-2.jpg',
        description: 'ROI de 450% sur campagne publicitaire e-commerce'
      },
      {
        title: 'Stratégie de Contenu',
        image: '/portfolio/marketing-3.jpg',
        description: 'Calendrier éditorial et visuels pour startup'
      }
    ],
    deliveryTime: 'Mensuel',
    revisions: 'unlimited',
    languages: ['Français', 'Arabe', 'Anglais'],
    availability: 'busy',
    featured: true,
    verified: true,
    topRated: true
  },
  {
    id: 'fs-5',
    slug: 'photographie-professionnelle-produits-evenements',
    providerName: 'Riad Hamidi',
    providerAvatar: '/avatars/avatar-5.jpg',
    serviceTitle: 'Photographie professionnelle - Produits, événements et portraits',
    category: 'Photographie',
    experienceLevel: 'Expert',
    rating: 5.0,
    reviewsCount: 71,
    completedProjects: 195,
    responseTime: '3 heures',
    price: 12000,
    priceType: 'starting-at',
    description: `Photographe professionnel basé à Alger avec plus de 7 ans d'expérience. Je capture vos moments précieux et sublime vos produits avec des photos de haute qualité.

**Services de photographie:**
- Photographie de produits (e-commerce, catalogue)
- Événements (mariages, anniversaires, corporate)
- Portraits professionnels et CV
- Photographie immobilière
- Photographie culinaire (restaurants, cafés)
- Shooting mode et lifestyle
- Photos pour réseaux sociaux

**Ce qui est inclus:**
- Séance photo professionnelle
- Retouche et édition de toutes les photos
- Photos en haute résolution
- Livraison rapide (48-72h)
- Droits d'utilisation commerciale
- Photos optimisées pour web et print

**Équipement professionnel:**
- Canon EOS R5 et R6
- Objectifs professionnels (24-70mm, 70-200mm, 50mm f/1.2)
- Éclairage studio complet
- Retouche avec Lightroom et Photoshop

Disponible pour déplacements dans toute l'Algérie.`,
    shortDescription: 'Photos professionnelles produits, événements, portraits - Haute résolution, retouche incluse',
    skills: ['Photographie Produit', 'Portrait', 'Lightroom', 'Photoshop', 'Studio Lighting', 'Event Photography'],
    portfolio: [
      {
        title: 'Photographie Produits Parfums',
        image: '/portfolio/photo-1.jpg',
        description: 'Shooting produits pour marque de parfums de luxe'
      },
      {
        title: 'Mariage à Alger',
        image: '/portfolio/photo-2.jpg',
        description: 'Couverture complète de mariage - 300+ photos'
      },
      {
        title: 'Portraits Corporate',
        image: '/portfolio/photo-3.jpg',
        description: 'Séance photos professionnelles pour équipe d\'entreprise'
      }
    ],
    deliveryTime: '2-3 jours',
    revisions: 2,
    languages: ['Français', 'Arabe'],
    availability: 'available',
    verified: true,
    topRated: true
  },
  {
    id: 'fs-6',
    slug: 'redaction-contenu-web-articles-blog-seo',
    providerName: 'Leila Benkhaled',
    providerAvatar: '/avatars/avatar-6.jpg',
    serviceTitle: 'Rédaction web SEO - Articles de blog, contenu web et copywriting',
    category: 'Rédaction',
    experienceLevel: 'Expert',
    rating: 4.9,
    reviewsCount: 44,
    completedProjects: 312,
    responseTime: '2 heures',
    price: 5000,
    priceType: 'starting-at',
    description: `Rédactrice web SEO professionnelle spécialisée dans la création de contenu optimisé qui convertit. J'aide les entreprises à améliorer leur visibilité en ligne et à engager leur audience.

**Services de rédaction:**
- Articles de blog optimisés SEO (500-2000 mots)
- Pages web (About, Services, Landing pages)
- Descriptions de produits e-commerce
- Newsletters et emails marketing
- Scripts vidéos YouTube
- Posts réseaux sociaux
- Livres blancs et études de cas

**Garanties:**
- Contenu 100% original et unique
- Optimisation SEO complète (mots-clés, balises, structure)
- Recherche approfondie sur le sujet
- Ton adapté à votre audience
- Révisions incluses
- Respect des délais
- Plagiat 0% (vérification Copyscape)

**Domaines d'expertise:**
- Technologie et digital
- Santé et bien-être
- E-commerce et retail
- Finance et business
- Lifestyle et beauté

Je crée du contenu en français et en arabe, optimisé pour le marché algérien et francophone.`,
    shortDescription: 'Rédaction web SEO - Articles blog, pages web, contenu optimisé pour Google, 100% unique',
    skills: ['SEO Writing', 'Copywriting', 'Content Marketing', 'WordPress', 'Keyword Research', 'Email Marketing'],
    portfolio: [
      {
        title: 'Blog Tech - 50 Articles',
        image: '/portfolio/writing-1.jpg',
        description: 'Série d\'articles techniques qui ont généré +100K visites'
      },
      {
        title: 'Pages Web E-commerce',
        image: '/portfolio/writing-2.jpg',
        description: 'Descriptions produits qui ont augmenté les conversions de 35%'
      },
      {
        title: 'Guide Complet SEO',
        image: '/portfolio/writing-3.jpg',
        description: 'Livre blanc de 5000 mots sur le SEO pour débutants'
      }
    ],
    deliveryTime: '2-4 jours',
    revisions: 2,
    languages: ['Français', 'Arabe'],
    availability: 'available',
    verified: true,
    topRated: true
  },
  {
    id: 'fs-7',
    slug: 'traduction-francais-arabe-anglais-professionnelle',
    providerName: 'Nabil Djebbar',
    providerAvatar: '/avatars/avatar-7.jpg',
    serviceTitle: 'Traduction professionnelle Français ⟷ Arabe ⟷ Anglais',
    category: 'Traduction',
    experienceLevel: 'Expert',
    rating: 5.0,
    reviewsCount: 38,
    completedProjects: 267,
    responseTime: '1 heure',
    price: 3000,
    priceType: 'starting-at',
    description: `Traducteur professionnel certifié avec plus de 8 ans d'expérience. Je fournis des traductions précises et naturelles qui préservent le sens et le ton de votre message original.

**Services de traduction:**
- Documents officiels et administratifs
- Sites web et applications
- Contenu marketing et publicitaire
- Manuels et guides techniques
- Contrats et documents juridiques
- Sous-titrage vidéo
- Transcription et traduction audio

**Langues:**
- Français ⟷ Arabe (natif bilingue)
- Anglais ⟷ Français
- Anglais ⟷ Arabe

**Garanties qualité:**
- Traduction humaine 100% (pas de Google Translate)
- Respect du contexte culturel
- Relecture et vérification approfondie
- Livraison dans le format original
- Confidentialité absolue
- Révisions gratuites
- Certification si nécessaire

**Spécialisations:**
- Traduction commerciale et marketing
- Traduction technique (IT, ingénierie)
- Traduction médicale
- Traduction légale et administrative

Tarif: 3000 DA par 500 mots. Remises pour projets volumineux.`,
    shortDescription: 'Traduction pro FR ⟷ AR ⟷ EN - Documents, sites web, sous-titres, 100% humaine',
    skills: ['Traduction', 'Localisation', 'Révision', 'Sous-titrage', 'Transcription', 'Interprétation'],
    portfolio: [
      {
        title: 'Site Web E-commerce',
        image: '/portfolio/translation-1.jpg',
        description: 'Traduction complète site web FR → AR (5000+ mots)'
      },
      {
        title: 'Manuel Technique',
        image: '/portfolio/translation-2.jpg',
        description: 'Traduction manuel logiciel EN → FR → AR'
      },
      {
        title: 'Vidéo Corporate',
        image: '/portfolio/translation-3.jpg',
        description: 'Sous-titrage et traduction vidéo promotionnelle'
      }
    ],
    deliveryTime: '1-3 jours',
    revisions: 2,
    languages: ['Français', 'Arabe', 'Anglais'],
    availability: 'available',
    verified: true
  },
  {
    id: 'fs-8',
    slug: 'consultation-business-strategie-entrepreneuriat',
    providerName: 'Farid Meziane',
    providerAvatar: '/avatars/avatar-8.jpg',
    serviceTitle: 'Consultation business et stratégie pour entrepreneurs et startups',
    category: 'Consultation',
    experienceLevel: 'Expert',
    rating: 4.8,
    reviewsCount: 29,
    completedProjects: 56,
    responseTime: '4 heures',
    price: 25000,
    priceType: 'hourly',
    description: `Consultant en stratégie business avec 12 ans d'expérience dans l'accompagnement d'entrepreneurs et de startups. J'aide les porteurs de projets à transformer leurs idées en entreprises prospères.

**Services de consultation:**
- Élaboration de business plan complet
- Étude de marché et analyse de la concurrence
- Stratégie de lancement et go-to-market
- Modèle économique et pricing
- Recherche de financement (investors, banques, subventions)
- Optimisation des opérations et processus
- Stratégie de croissance et scaling
- Pivot et restructuration d'entreprise

**Domaines d'expertise:**
- E-commerce et retail
- SaaS et tech startups
- Services B2B
- Food & beverage
- Import/export

**Format des sessions:**
- Consultation initiale gratuite (30 min)
- Sessions de travail (1-2 heures)
- Suivi et support continu
- Documents livrables (business plan, études, présentations)
- Accès à mon réseau d'entrepreneurs et investisseurs

**Résultats clients:**
- +15 startups accompagnées avec succès
- 8 levées de fonds réussies (total +50M DA)
- Taux de réussite de 85% sur 3 ans

Diplômé d'une grande école de commerce, j'ai dirigé plusieurs entreprises avant de me consacrer au conseil.`,
    shortDescription: 'Consultation business pour startups - Business plan, stratégie, financement, croissance',
    skills: ['Business Strategy', 'Business Plan', 'Market Research', 'Fundraising', 'Financial Modeling', 'Lean Startup'],
    portfolio: [
      {
        title: 'Startup E-commerce',
        image: '/portfolio/consulting-1.jpg',
        description: 'Accompagnement complet de 0 à 5M DA de CA en 18 mois'
      },
      {
        title: 'Levée de Fonds',
        image: '/portfolio/consulting-2.jpg',
        description: 'Aide à la levée de 10M DA pour startup tech'
      },
      {
        title: 'Pivot Stratégique',
        image: '/portfolio/consulting-3.jpg',
        description: 'Restructuration et pivot réussi pour entreprise en difficulté'
      }
    ],
    deliveryTime: 'Flexible',
    revisions: 'unlimited',
    languages: ['Français', 'Arabe', 'Anglais'],
    availability: 'available',
    verified: true,
    topRated: true
  },
  {
    id: 'fs-9',
    slug: 'developpement-application-mobile-android-ios',
    providerName: 'Sofiane Boudiaf',
    providerAvatar: '/avatars/avatar-9.jpg',
    serviceTitle: 'Développement d\'application mobile native Android et iOS',
    category: 'Développement Web',
    experienceLevel: 'Expert',
    rating: 4.9,
    reviewsCount: 33,
    completedProjects: 74,
    responseTime: '2 heures',
    price: 80000,
    priceType: 'starting-at',
    description: `Développeur mobile senior spécialisé dans la création d'applications natives performantes. Je transforme vos idées en applications mobiles professionnelles.

**Services:**
- Développement d'applications Android (Kotlin/Java)
- Développement d'applications iOS (Swift)
- Applications cross-platform (React Native, Flutter)
- Design UI/UX mobile
- Intégration API et backend
- Publication sur Play Store et App Store
- Maintenance et mises à jour

**Type d'applications:**
- E-commerce et marketplace
- Réseaux sociaux
- Applications de livraison
- Applications de gestion
- Jeux et divertissement
- Applications éducatives
- Fitness et santé

**Technologies:**
- React Native / Flutter pour cross-platform
- Kotlin / Swift pour native
- Firebase / AWS pour backend
- REST API / GraphQL
- Push notifications
- Paiement en ligne
- Géolocalisation

Processus agile avec livraisons régulières et tests approfondis.`,
    shortDescription: 'App mobile Android/iOS - Native ou cross-platform, UI/UX, API, publication stores',
    skills: ['React Native', 'Flutter', 'Kotlin', 'Swift', 'Firebase', 'API Integration', 'UI/UX Design'],
    portfolio: [
      {
        title: 'App Livraison Food',
        image: '/portfolio/mobile-1.jpg',
        description: 'Application de livraison complète avec paiement et tracking'
      },
      {
        title: 'App E-learning',
        image: '/portfolio/mobile-2.jpg',
        description: 'Plateforme éducative mobile avec vidéos et quiz'
      },
      {
        title: 'App Fitness',
        image: '/portfolio/mobile-3.jpg',
        description: 'Application de suivi d\'entraînement et nutrition'
      }
    ],
    deliveryTime: '14-30 jours',
    revisions: 3,
    languages: ['Français', 'Arabe', 'Anglais'],
    availability: 'busy',
    verified: true,
    topRated: true
  },
  {
    id: 'fs-10',
    slug: 'motion-design-animation-2d-explainer-videos',
    providerName: 'Meriem Sadouki',
    providerAvatar: '/avatars/avatar-10.jpg',
    serviceTitle: 'Motion design et animation 2D - Explainer videos et publicités animées',
    category: 'Montage Vidéo',
    experienceLevel: 'Intermédiaire',
    rating: 4.7,
    reviewsCount: 26,
    completedProjects: 68,
    responseTime: '3 heures',
    price: 12000,
    priceType: 'starting-at',
    description: `Motion designer créative spécialisée dans les animations 2D engageantes. Je donne vie à vos idées avec des animations professionnelles qui captivent votre audience.

**Services d'animation:**
- Explainer videos (vidéos explicatives)
- Publicités animées pour réseaux sociaux
- Animations de logo
- Infographies animées
- Présentations animées
- Intros et outros YouTube
- GIFs et stickers animés

**Style d'animation:**
- Motion design moderne et minimaliste
- Personnages 2D et storytelling
- Animation flat design
- Animation de texte et typography
- Transitions fluides et dynamiques

**Processus de travail:**
1. Brief et discussion du concept
2. Storyboard et validation
3. Création des assets graphiques
4. Animation et effets
5. Sound design et voix off (si nécessaire)
6. Révisions et livraison

**Outils:**
- After Effects
- Illustrator
- Premiere Pro
- Audition

Idéal pour startups, entreprises et créateurs de contenu qui veulent se démarquer.`,
    shortDescription: 'Motion design 2D - Explainer videos, publicités animées, animations logo, infographies',
    skills: ['After Effects', 'Motion Graphics', '2D Animation', 'Illustrator', 'Storyboarding', 'Sound Design'],
    portfolio: [
      {
        title: 'Explainer Video Startup',
        image: '/portfolio/motion-1.jpg',
        description: 'Vidéo explicative 90 secondes pour application mobile'
      },
      {
        title: 'Publicité Animée Produit',
        image: '/portfolio/motion-2.jpg',
        description: 'Animation publicitaire pour lancement de produit'
      },
      {
        title: 'Animation Logo',
        image: '/portfolio/motion-3.jpg',
        description: 'Logo animé avec plusieurs variations'
      }
    ],
    deliveryTime: '5-7 jours',
    revisions: 3,
    languages: ['Français', 'Arabe'],
    availability: 'available',
    verified: true
  },
  {
    id: 'fs-11',
    slug: 'architecture-systeme-developpement-fullstack',
    providerName: 'Azeddine Zellag',
    providerAvatar: '/avatars/avatar-11.jpg',
    serviceTitle: 'Architecture système et développement Full Stack - Solutions sur mesure',
    category: 'Développement Web',
    experienceLevel: 'Expert',
    rating: 5.0,
    reviewsCount: 5,
    completedProjects: 5,
    responseTime: '30 minutes',
    price: 120000,
    priceType: 'starting-at',
    description: `Architecte système et développeur Full Stack Expert avec plus de 10 ans d'expérience dans la conception et le développement de solutions logicielles complexes et évolutives. Je transforme vos défis techniques en systèmes robustes et performants.

**Expertise en Architecture Système:**
- Conception d'architectures microservices et distribuées
- Architecture cloud-native (AWS, Azure, Google Cloud)
- Design patterns et principes SOLID
- Architecture scalable et haute disponibilité
- Optimisation des performances et coûts infrastructure
- Sécurité système et DevSecOps
- Migration legacy vers architecture moderne
- Documentation technique complète

**Développement Full Stack:**
- Frontend moderne: React, Next.js, TypeScript, Vue.js
- Backend robuste: Node.js, Python, Go, Java
- Bases de données: PostgreSQL, MongoDB, Redis, Supabase
- API Design: REST, GraphQL, WebSocket, gRPC
- DevOps: Docker, Kubernetes, CI/CD, Infrastructure as Code
- Cloud: AWS, GCP, Azure, Vercel, Netlify
- Testing: Jest, Cypress, Playwright, TDD/BDD
- Real-time: WebRTC, Socket.io, Server-Sent Events

**Services proposés:**
- Audit et refonte d'architecture existante
- Conception de solutions techniques sur mesure
- Développement d'applications web complexes
- Plateforme e-commerce multi-vendor
- Solutions SaaS B2B et B2C
- APIs et intégrations tierces
- Systèmes de paiement sécurisés
- Applications temps réel et collaborative
- Formation et mentorat technique
- Consulting technique et code review

**Méthodologie de travail:**
1. Analyse approfondie des besoins métier et techniques
2. Conception de l'architecture avec documentation détaillée
3. Validation technique et revue des choix technologiques
4. Développement itératif avec livraisons régulières
5. Tests automatisés et assurance qualité
6. Déploiement et monitoring production
7. Support et maintenance continue
8. Transfert de compétences à votre équipe

**Projets réalisés:**
- Architecture et développement de plateforme marketplace multi-vendor
- Systèmes de gestion d'entreprise (ERP, CRM)
- Applications fintech avec paiement sécurisé
- Plateformes d'apprentissage en ligne (LMS)
- Solutions IoT et dashboards temps réel
- Applications mobile native et cross-platform

**Stack technique maîtrisé:**
- **Frontend**: React, Next.js, TypeScript, Tailwind CSS, Redux, Zustand
- **Backend**: Node.js, Express, NestJS, Python, FastAPI, Django
- **Database**: PostgreSQL, MongoDB, Redis, Supabase, Firebase
- **Cloud**: AWS (EC2, S3, Lambda, RDS), Docker, Kubernetes
- **Tools**: Git, GitHub Actions, Jenkins, Terraform, Ansible

**Garanties:**
- Code propre et maintenable (Clean Code)
- Documentation technique complète
- Tests unitaires et d'intégration
- Performance optimale
- Sécurité renforcée (OWASP)
- Scalabilité garantie
- Support post-livraison
- Respect des délais et du budget

Je travaille en français, arabe et anglais. Disponible pour missions courtes et projets long terme. Déplacement possible en Algérie et à l'international.`,
    shortDescription: 'Architecture système & Full Stack Expert - React, Next.js, Node.js, Cloud, Microservices, Solutions évolutives',
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'System Architecture', 'PostgreSQL', 'AWS', 'Docker', 'Microservices', 'DevOps', 'Python', 'API Design', 'Cloud Native', 'Supabase'],
    portfolio: [
      {
        title: 'Plateforme Marketplace ZST',
        image: '/portfolio/fullstack-1.jpg',
        description: 'Architecture et développement complet d\'une plateforme marketplace multi-vendor avec système de commandes, paiement et gestion vendeurs'
      },
      {
        title: 'Solution SaaS Enterprise',
        image: '/portfolio/fullstack-2.jpg',
        description: 'Architecture microservices pour plateforme SaaS B2B avec +100K utilisateurs, système de facturation et analytics'
      },
      {
        title: 'Application Fintech',
        image: '/portfolio/fullstack-3.jpg',
        description: 'Système de paiement sécurisé avec architecture cloud-native, haute disponibilité et conformité bancaire'
      },
      {
        title: 'Plateforme E-learning',
        image: '/portfolio/fullstack-4.jpg',
        description: 'LMS complet avec streaming vidéo, système de quiz, certificats et dashboard analytics'
      }
    ],
    deliveryTime: 'Sur mesure',
    revisions: 'unlimited',
    languages: ['Français', 'Arabe', 'Anglais'],
    availability: 'available',
    featured: true,
    verified: true,
    topRated: true
  }
]

export function getServiceById(id: string): FreelanceService | undefined {
  return freelanceServices.find(s => s.id === id)
}

export function getServicesByCategory(category: ServiceCategory): FreelanceService[] {
  return freelanceServices.filter(s => s.category === category)
}

export function getFeaturedServices(): FreelanceService[] {
  return freelanceServices.filter(s => s.featured === true)
}

export const serviceCategories: ServiceCategory[] = [
  'Développement Web',
  'Design Graphique',
  'Montage Vidéo',
  'Marketing Digital',
  'Rédaction',
  'Photographie',
  'Traduction',
  'Consultation'
]
