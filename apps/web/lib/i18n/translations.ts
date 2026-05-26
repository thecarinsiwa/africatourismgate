import type { Locale } from './types';

export type Translations = {
  meta: { homeTitle: string; homeDescription: string };
  nav: {
    home: string;
    about: string;
    gallery: string;
    pages: string;
    blog: string;
    contact: string;
    hotels: string;
    flights: string;
    cars: string;
    cruises: string;
    tours: string;
    mainAria: string;
    mobileAria: string;
    menu: string;
  };
  theme: { lightMode: string; darkMode: string; enableLight: string; enableDark: string };
  language: { label: string; select: string };
  hero: {
    slides: { subtitle: string; title: string; description: string }[];
    prev: string;
    next: string;
  };
  search: {
    tablistAria: string;
    tabs: { flights: string; hotels: string; cars: string; cruises: string; tours: string };
    search: string;
    departDate: string;
    returnDate: string;
    checkIn: string;
    checkOut: string;
    from: string;
    to: string;
    adults: string;
    destination: string;
    roomType: string;
    pickUp: string;
    dropOff: string;
    country: string;
    city: string;
    location: string;
    startDate: string;
    endDate: string;
    sailTo: string;
    sailFrom: string;
    ship: string;
    days: string;
    cityPh: string;
    destinationPh: string;
    selectPh: string;
    countryPh: string;
    locationPh: string;
    allDestinations: string;
    allPorts: string;
    shipPh: string;
    departCityPh: string;
    destinationPh2: string;
    roomTypes: string[];
    countries: string[];
    locations: string[];
  };
  whyUs: {
    title: string;
    subtitle: string;
    learnMore: string;
    items: { title: string; description: string }[];
  };
  promo: {
    title: string;
    description: string;
    priceFrom: string;
    perPerson: string;
    details: string;
  };
  destinations: {
    title: string;
    subtitle: string;
    reviews: string;
    details: string;
    items: { title: string; subtitle: string; description: string }[];
  };
  customers: {
    title: string;
    subtitle: string;
    p1: string;
    p2: string;
    clients: string;
    imageAlt: string;
    bars: { flights: string; hotels: string; cars: string; cruises: string };
  };
  footer: {
    tagline: string;
    learnMore: string;
    specialists: string;
    specialistLinks: { premium: string; flights: string; safaris: string; cruises: string };
    newsletter: string;
    newsletterDesc: string;
    emailPlaceholder: string;
    contact: string;
    location: string;
    privacy: string;
    about: string;
    faq: string;
    designedBy: string;
  };
};

const fr: Translations = {
  meta: {
    homeTitle: 'Réservez votre voyage en Afrique',
    homeDescription:
      'Comparez hôtels, vols et expériences en Afrique. Recherchez des hébergements et planifiez votre prochain séjour avec Africa Tourism Gate.',
  },
  nav: {
    home: 'Accueil',
    about: 'À propos',
    gallery: 'Galerie',
    pages: 'Pages',
    blog: 'Blog',
    contact: 'Contacts',
    hotels: 'Hôtels',
    flights: 'Vols',
    cars: 'Location de Voitures',
    cruises: 'Croisières',
    tours: 'Tours',
    mainAria: 'Navigation principale',
    mobileAria: 'Navigation mobile',
    menu: 'Menu',
  },
  theme: {
    lightMode: 'Mode clair',
    darkMode: 'Mode sombre',
    enableLight: 'Activer le mode clair',
    enableDark: 'Activer le mode sombre',
  },
  language: { label: 'Langue', select: 'Choisir la langue' },
  hero: {
    slides: [
      {
        subtitle: 'Bienvenue chez',
        title: 'AFRICA TOURISM GATE',
        description:
          'Votre passerelle vers les plus belles destinations africaines. Explorez, réservez et vivez des expériences inoubliables.',
      },
      {
        subtitle: 'Safari de 7 jours',
        title: 'MASAI MARA MAGIQUE',
        description:
          "Découvrez la migration des gnous et les Big Five dans la réserve la plus célèbre d'Afrique.",
      },
      {
        subtitle: '5 jours à',
        title: 'MARRAKECH (Perle du Sud)',
        description:
          'Plongez dans les souks, les riads et les saveurs épicées de la ville ocre du Maroc.',
      },
      {
        subtitle: 'Croisière de 12 jours',
        title: 'ZANZIBAR À MADAGASCAR',
        description:
          "Navigation côtière le long de l'Océan Indien — plages de rêve et faune unique.",
      },
    ],
    prev: 'Diapositive précédente',
    next: 'Diapositive suivante',
  },
  search: {
    tablistAria: 'Type de recherche',
    tabs: { flights: 'Vols', hotels: 'Hôtels', cars: 'Voitures', cruises: 'Croisières', tours: 'Tours' },
    search: 'Rechercher',
    departDate: 'Date départ',
    returnDate: 'Date retour',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    from: 'De :',
    to: 'Vers :',
    adults: 'Adultes :',
    destination: 'Destination :',
    roomType: 'Type de chambre :',
    pickUp: 'Prise en charge',
    dropOff: 'Retour',
    country: 'Pays :',
    city: 'Ville :',
    location: 'Lieu :',
    startDate: 'Date début',
    endDate: 'Date fin',
    sailTo: 'Naviguer vers :',
    sailFrom: 'Naviguer de :',
    ship: 'Navire :',
    days: 'Jours :',
    cityPh: 'Ville',
    destinationPh: 'Destination ou hôtel',
    selectPh: 'Sélectionner',
    countryPh: 'Pays',
    locationPh: 'Lieu',
    allDestinations: 'Toutes destinations',
    allPorts: 'Tous les ports',
    shipPh: 'Navire',
    departCityPh: 'Ville de départ',
    destinationPh2: 'Destination',
    roomTypes: ['Chambre Double', 'Chambre Simple', 'Suite'],
    countries: ['Kenya', 'Tanzanie', 'Maroc', 'Afrique du Sud', 'Rwanda', 'RDC'],
    locations: ['Aéroport', 'Centre-ville', 'Gare'],
  },
  whyUs: {
    title: 'Pourquoi nous choisir',
    subtitle:
      "Africa Tourism Gate vous offre une expérience de voyage unique avec les meilleurs services et un accompagnement personnalisé pour découvrir l'Afrique.",
    learnMore: 'En savoir plus',
    items: [
      {
        title: 'Voyages Incroyables',
        description:
          'Des destinations uniques sélectionnées avec soin à travers tout le continent africain pour des expériences inoubliables.',
      },
      {
        title: 'Découvertes',
        description:
          "Explorez la richesse culturelle, les paysages époustouflants et la faune sauvage de l'Afrique.",
      },
      {
        title: 'Réservation Facile',
        description:
          'Réservez vos hébergements, vols et activités en quelques clics grâce à notre plateforme intuitive.',
      },
      {
        title: 'Support 24/7',
        description:
          'Notre équipe de spécialistes du voyage est disponible jour et nuit pour vous accompagner.',
      },
    ],
  },
  promo: {
    title: 'Safari au Kenya — Forfait Vacances',
    description:
      "Découvrez les plaines infinies du Masai Mara, observez les Big Five dans leur habitat naturel et profitez d'hébergements de luxe au cœur de la savane. Une expérience qui changera votre vision de l'Afrique.",
    priceFrom: 'À partir de :',
    perPerson: '/personne',
    details: 'Détails',
  },
  destinations: {
    title: 'Destinations Populaires',
    subtitle:
      'Découvrez nos destinations africaines les plus prisées. Des safaris aux plages paradisiaques, chaque voyage est une aventure unique.',
    reviews: 'Avis',
    details: 'Détails',
    items: [
      {
        title: 'Safari au Masai Mara',
        subtitle: 'De Nairobi, Kenya',
        description: 'Safari de 7 jours au départ de Nairobi. Big Five et migration des gnous.',
      },
      {
        title: 'Escapade au Cap',
        subtitle: 'Le Cap, Afrique du Sud',
        description: 'Explorez Table Mountain, le Cap de Bonne Espérance et les vignobles.',
      },
      {
        title: 'Médina de Marrakech',
        subtitle: '5 jours, Maroc',
        description: 'Perdez-vous dans les souks, savourez les épices et dormez dans un riad.',
      },
      {
        title: 'Plages de Zanzibar',
        subtitle: 'Tanzanie, 6 jours',
        description: "Sable blanc, eaux turquoise et épices — le paradis de l'Océan Indien.",
      },
    ],
  },
  customers: {
    title: 'Clients Satisfaits',
    subtitle: 'La satisfaction de nos voyageurs est notre priorité absolue.',
    p1: "Depuis notre lancement, nous avons accompagné des milliers de voyageurs dans la découverte de l'Afrique. Notre engagement envers un service d'excellence et des expériences authentiques nous a valu la confiance de notre communauté grandissante.",
    p2: "Chaque retour positif nous motive à continuer d'améliorer nos services et à proposer des voyages toujours plus mémorables à travers le continent.",
    clients: 'Clients',
    imageAlt: 'Voyageurs heureux en Afrique',
    bars: { flights: 'Vols', hotels: 'Hôtels', cars: 'Voitures', cruises: 'Croisières' },
  },
  footer: {
    tagline:
      'Votre passerelle vers les meilleures expériences de voyage en Afrique. Découvrez des destinations uniques et réservez en toute confiance.',
    learnMore: 'En savoir plus',
    specialists: 'Spécialistes Voyage',
    specialistLinks: {
      premium: 'Hébergements Premium',
      flights: 'Vols Première Classe',
      safaris: 'Safaris & Tours',
      cruises: 'Croisières Côtières',
    },
    newsletter: 'Newsletter',
    newsletterDesc: 'Inspiration, idées de voyages, bons plans et actualités.',
    emailPlaceholder: 'Adresse email',
    contact: 'Contact',
    location: 'Kinshasa, RD Congo',
    privacy: 'Politique de Confidentialité',
    about: 'À propos',
    faq: 'FAQ',
    designedBy: 'Conçu par',
  },
};

const en: Translations = {
  meta: {
    homeTitle: 'Book your trip to Africa',
    homeDescription:
      'Compare hotels, flights and experiences across Africa. Search accommodations and plan your next stay with Africa Tourism Gate.',
  },
  nav: {
    home: 'Home',
    about: 'About',
    gallery: 'Gallery',
    pages: 'Pages',
    blog: 'Blog',
    contact: 'Contact',
    hotels: 'Hotels',
    flights: 'Flights',
    cars: 'Car Rental',
    cruises: 'Cruises',
    tours: 'Tours',
    mainAria: 'Main navigation',
    mobileAria: 'Mobile navigation',
    menu: 'Menu',
  },
  theme: {
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
    enableLight: 'Enable light mode',
    enableDark: 'Enable dark mode',
  },
  language: { label: 'Language', select: 'Select language' },
  hero: {
    slides: [
      {
        subtitle: 'Welcome to',
        title: 'AFRICA TOURISM GATE',
        description:
          'Your gateway to the finest African destinations. Explore, book and enjoy unforgettable experiences.',
      },
      {
        subtitle: '7-day safari',
        title: 'MAGICAL MASAI MARA',
        description:
          'Witness the wildebeest migration and the Big Five in Africa’s most famous reserve.',
      },
      {
        subtitle: '5 days in',
        title: 'MARRAKECH (Pearl of the South)',
        description:
          'Immerse yourself in souks, riads and the spiced flavors of Morocco’s ochre city.',
      },
      {
        subtitle: '12-day cruise',
        title: 'ZANZIBAR TO MADAGASCAR',
        description:
          'Coastal sailing along the Indian Ocean — dream beaches and unique wildlife.',
      },
    ],
    prev: 'Previous slide',
    next: 'Next slide',
  },
  search: {
    tablistAria: 'Search type',
    tabs: { flights: 'Flights', hotels: 'Hotels', cars: 'Cars', cruises: 'Cruises', tours: 'Tours' },
    search: 'Search',
    departDate: 'Departure date',
    returnDate: 'Return date',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    from: 'From:',
    to: 'To:',
    adults: 'Adults:',
    destination: 'Destination:',
    roomType: 'Room type:',
    pickUp: 'Pick-up',
    dropOff: 'Drop-off',
    country: 'Country:',
    city: 'City:',
    location: 'Location:',
    startDate: 'Start date',
    endDate: 'End date',
    sailTo: 'Sail to:',
    sailFrom: 'Sail from:',
    ship: 'Ship:',
    days: 'Days:',
    cityPh: 'City',
    destinationPh: 'Destination or hotel',
    selectPh: 'Select',
    countryPh: 'Country',
    locationPh: 'Location',
    allDestinations: 'All destinations',
    allPorts: 'All ports',
    shipPh: 'Ship',
    departCityPh: 'Departure city',
    destinationPh2: 'Destination',
    roomTypes: ['Double Room', 'Single Room', 'Suite'],
    countries: ['Kenya', 'Tanzania', 'Morocco', 'South Africa', 'Rwanda', 'DRC'],
    locations: ['Airport', 'City center', 'Train station'],
  },
  whyUs: {
    title: 'Why choose us',
    subtitle:
      'Africa Tourism Gate offers a unique travel experience with top services and personalized support to discover Africa.',
    learnMore: 'Learn more',
    items: [
      {
        title: 'Amazing Trips',
        description:
          'Hand-picked unique destinations across the African continent for unforgettable experiences.',
      },
      {
        title: 'Discoveries',
        description:
          'Explore rich cultures, breathtaking landscapes and Africa’s incredible wildlife.',
      },
      {
        title: 'Easy Booking',
        description:
          'Book accommodations, flights and activities in a few clicks with our intuitive platform.',
      },
      {
        title: '24/7 Support',
        description: 'Our travel specialists are available day and night to assist you.',
      },
    ],
  },
  promo: {
    title: 'Kenya Safari — Holiday Package',
    description:
      'Discover the endless plains of the Masai Mara, spot the Big Five in their natural habitat and enjoy luxury lodges in the heart of the savanna. An experience that will change how you see Africa.',
    priceFrom: 'From:',
    perPerson: '/person',
    details: 'Details',
  },
  destinations: {
    title: 'Popular Destinations',
    subtitle:
      'Discover our most sought-after African destinations. From safaris to paradise beaches, every trip is a unique adventure.',
    reviews: 'Reviews',
    details: 'Details',
    items: [
      {
        title: 'Masai Mara Safari',
        subtitle: 'From Nairobi, Kenya',
        description: '7-day safari from Nairobi. Big Five and wildebeest migration.',
      },
      {
        title: 'Cape Town Getaway',
        subtitle: 'Cape Town, South Africa',
        description: 'Explore Table Mountain, Cape of Good Hope and vineyards.',
      },
      {
        title: 'Marrakech Medina',
        subtitle: '5 days, Morocco',
        description: 'Get lost in the souks, savor spices and sleep in a riad.',
      },
      {
        title: 'Zanzibar Beaches',
        subtitle: 'Tanzania, 6 days',
        description: 'White sand, turquoise waters and spices — Indian Ocean paradise.',
      },
    ],
  },
  customers: {
    title: 'Happy Customers',
    subtitle: 'Our travelers’ satisfaction is our top priority.',
    p1: 'Since launch, we have helped thousands of travelers discover Africa. Our commitment to excellence and authentic experiences has earned the trust of our growing community.',
    p2: 'Every positive review motivates us to keep improving and offering ever more memorable journeys across the continent.',
    clients: 'Clients',
    imageAlt: 'Happy travelers in Africa',
    bars: { flights: 'Flights', hotels: 'Hotels', cars: 'Cars', cruises: 'Cruises' },
  },
  footer: {
    tagline:
      'Your gateway to the best travel experiences in Africa. Discover unique destinations and book with confidence.',
    learnMore: 'Learn more',
    specialists: 'Travel Specialists',
    specialistLinks: {
      premium: 'Premium Stays',
      flights: 'First Class Flights',
      safaris: 'Safaris & Tours',
      cruises: 'Coastal Cruises',
    },
    newsletter: 'Newsletter',
    newsletterDesc: 'Inspiration, travel ideas, deals and news.',
    emailPlaceholder: 'Email address',
    contact: 'Contact',
    location: 'Kinshasa, DR Congo',
    privacy: 'Privacy Policy',
    about: 'About',
    faq: 'FAQ',
    designedBy: 'Designed by',
  },
};

const es: Translations = {
  meta: {
    homeTitle: 'Reserve su viaje por África',
    homeDescription:
      'Compare hoteles, vuelos y experiencias en África. Busque alojamientos y planifique su próxima estancia con Africa Tourism Gate.',
  },
  nav: {
    home: 'Inicio',
    about: 'Acerca de',
    gallery: 'Galería',
    pages: 'Páginas',
    blog: 'Blog',
    contact: 'Contacto',
    hotels: 'Hoteles',
    flights: 'Vuelos',
    cars: 'Alquiler de coches',
    cruises: 'Cruceros',
    tours: 'Tours',
    mainAria: 'Navegación principal',
    mobileAria: 'Navegación móvil',
    menu: 'Menú',
  },
  theme: {
    lightMode: 'Modo claro',
    darkMode: 'Modo oscuro',
    enableLight: 'Activar modo claro',
    enableDark: 'Activar modo oscuro',
  },
  language: { label: 'Idioma', select: 'Elegir idioma' },
  hero: {
    slides: [
      {
        subtitle: 'Bienvenido a',
        title: 'AFRICA TOURISM GATE',
        description:
          'Su puerta de entrada a los mejores destinos africanos. Explore, reserve y viva experiencias inolvidables.',
      },
      {
        subtitle: 'Safari de 7 días',
        title: 'MASAI MARA MÁGICO',
        description:
          'Descubra la migración de ñus y los Cinco Grandes en la reserva más famosa de África.',
      },
      {
        subtitle: '5 días en',
        title: 'MARRAKECH (Perla del Sur)',
        description:
          'Sumérjase en los zocos, los riads y los sabores especiados de la ciudad ocre de Marruecos.',
      },
      {
        subtitle: 'Crucero de 12 días',
        title: 'ZANZÍBAR A MADAGASCAR',
        description:
          'Navegación costera por el Océano Índico — playas de ensueño y fauna única.',
      },
    ],
    prev: 'Diapositiva anterior',
    next: 'Diapositiva siguiente',
  },
  search: {
    tablistAria: 'Tipo de búsqueda',
    tabs: { flights: 'Vuelos', hotels: 'Hoteles', cars: 'Coches', cruises: 'Cruceros', tours: 'Tours' },
    search: 'Buscar',
    departDate: 'Fecha de salida',
    returnDate: 'Fecha de regreso',
    checkIn: 'Entrada',
    checkOut: 'Salida',
    from: 'Desde:',
    to: 'Hacia:',
    adults: 'Adultos:',
    destination: 'Destino:',
    roomType: 'Tipo de habitación:',
    pickUp: 'Recogida',
    dropOff: 'Devolución',
    country: 'País:',
    city: 'Ciudad:',
    location: 'Lugar:',
    startDate: 'Fecha inicio',
    endDate: 'Fecha fin',
    sailTo: 'Navegar hacia:',
    sailFrom: 'Navegar desde:',
    ship: 'Barco:',
    days: 'Días:',
    cityPh: 'Ciudad',
    destinationPh: 'Destino u hotel',
    selectPh: 'Seleccionar',
    countryPh: 'País',
    locationPh: 'Lugar',
    allDestinations: 'Todos los destinos',
    allPorts: 'Todos los puertos',
    shipPh: 'Barco',
    departCityPh: 'Ciudad de salida',
    destinationPh2: 'Destino',
    roomTypes: ['Habitación doble', 'Habitación individual', 'Suite'],
    countries: ['Kenia', 'Tanzania', 'Marruecos', 'Sudáfrica', 'Ruanda', 'RDC'],
    locations: ['Aeropuerto', 'Centro ciudad', 'Estación'],
  },
  whyUs: {
    title: 'Por qué elegirnos',
    subtitle:
      'Africa Tourism Gate le ofrece una experiencia de viaje única con los mejores servicios y acompañamiento personalizado para descubrir África.',
    learnMore: 'Saber más',
    items: [
      {
        title: 'Viajes Increíbles',
        description:
          'Destinos únicos seleccionados con cuidado en todo el continente africano para experiencias inolvidables.',
      },
      {
        title: 'Descubrimientos',
        description:
          'Explore la riqueza cultural, paisajes impresionantes y la fauna salvaje de África.',
      },
      {
        title: 'Reserva Fácil',
        description:
          'Reserve alojamientos, vuelos y actividades en pocos clics con nuestra plataforma intuitiva.',
      },
      {
        title: 'Soporte 24/7',
        description:
          'Nuestro equipo de especialistas en viajes está disponible día y noche para acompañarle.',
      },
    ],
  },
  promo: {
    title: 'Safari en Kenia — Paquete vacacional',
    description:
      'Descubra las llanuras infinitas del Masai Mara, observe los Cinco Grandes en su hábitat natural y disfrute de alojamientos de lujo en el corazón de la sabana. Una experiencia que cambiará su visión de África.',
    priceFrom: 'Desde:',
    perPerson: '/persona',
    details: 'Detalles',
  },
  destinations: {
    title: 'Destinos Populares',
    subtitle:
      'Descubra nuestros destinos africanos más solicitados. De safaris a playas paradisíacas, cada viaje es una aventura única.',
    reviews: 'Opiniones',
    details: 'Detalles',
    items: [
      {
        title: 'Safari en Masai Mara',
        subtitle: 'Desde Nairobi, Kenia',
        description: 'Safari de 7 días desde Nairobi. Cinco Grandes y migración de ñus.',
      },
      {
        title: 'Escapada al Cabo',
        subtitle: 'Ciudad del Cabo, Sudáfrica',
        description: 'Explore Table Mountain, el Cabo de Buena Esperanza y viñedos.',
      },
      {
        title: 'Medina de Marrakech',
        subtitle: '5 días, Marruecos',
        description: 'Piérdase en los zocos, saboree especias y duerma en un riad.',
      },
      {
        title: 'Playas de Zanzíbar',
        subtitle: 'Tanzania, 6 días',
        description: 'Arena blanca, aguas turquesas y especias — paraíso del Índico.',
      },
    ],
  },
  customers: {
    title: 'Clientes Satisfechos',
    subtitle: 'La satisfacción de nuestros viajeros es nuestra prioridad absoluta.',
    p1: 'Desde nuestro lanzamiento, hemos acompañado a miles de viajeros en el descubrimiento de África. Nuestro compromiso con la excelencia y experiencias auténticas nos ha valido la confianza de una comunidad en crecimiento.',
    p2: 'Cada reseña positiva nos motiva a seguir mejorando y ofrecer viajes cada vez más memorables por el continente.',
    clients: 'Clientes',
    imageAlt: 'Viajeros felices en África',
    bars: { flights: 'Vuelos', hotels: 'Hoteles', cars: 'Coches', cruises: 'Cruceros' },
  },
  footer: {
    tagline:
      'Su puerta de entrada a las mejores experiencias de viaje en África. Descubra destinos únicos y reserve con confianza.',
    learnMore: 'Saber más',
    specialists: 'Especialistas en Viajes',
    specialistLinks: {
      premium: 'Alojamientos Premium',
      flights: 'Vuelos Primera Clase',
      safaris: 'Safaris y Tours',
      cruises: 'Cruceros Costeros',
    },
    newsletter: 'Boletín',
    newsletterDesc: 'Inspiración, ideas de viaje, ofertas y noticias.',
    emailPlaceholder: 'Correo electrónico',
    contact: 'Contacto',
    location: 'Kinshasa, RD Congo',
    privacy: 'Política de Privacidad',
    about: 'Acerca de',
    faq: 'FAQ',
    designedBy: 'Diseñado por',
  },
};

export const translations: Record<Locale, Translations> = { fr, en, es };
