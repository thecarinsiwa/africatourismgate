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
    myAccount: string;
    signIn: string;
    signOut: string;
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
  hotels: {
    metaTitle: string;
    metaDescription: string;
    breadcrumbHome: string;
    breadcrumbHotels: string;
    heroTitle: string;
    heroSubtitle: string;
    resultsFor: string;
    allAfrica: string;
    propertiesFound: string;
    sortBy: string;
    sortRecommended: string;
    sortPriceLow: string;
    sortPriceHigh: string;
    sortRating: string;
    loading: string;
    loadError: string;
    retry: string;
    filters: string;
    filterStars: string;
    filterType: string;
    types: {
      hotel: string;
      resort: string;
      apartment: string;
      villa: string;
      hostel: string;
      other: string;
    };
    perNight: string;
    viewDetails: string;
    bookNow: string;
    freeCancel: string;
    amenities: { wifi: string; pool: string; breakfast: string; spa: string; parking: string };
    excellent: string;
    veryGood: string;
    modifySearch: string;
    checkIn: string;
    checkOut: string;
    guests: string;
    noResults: string;
    noResultsHint: string;
    backHome: string;
    previewNotice: string;
    stars: string;
    allTypes: string;
    allStars: string;
    reviews: string;
    featuredBadge: string;
    detailMetaDescription: string;
    galleryAria: string;
    amenitiesTitle: string;
    roomsTitle: string;
    descriptionTitle: string;
    calendarTitle: string;
    selectRoom: string;
    selectRoomHint: string;
    totalStay: string;
    nightsLabel: string;
    nightSingular: string;
    nightPlural: string;
    unavailable: string;
    updateDates: string;
    notFound: string;
    notFoundHint: string;
    backToList: string;
    prevMonth: string;
    nextMonth: string;
    fromPrice: string;
    selectDatesHint: string;
    maxGuests: string;
    bedConfig: string;
    reserveSection: string;
  };
  account: {
    title: string;
    subtitle: string;
    browseSite: string;
    navAria: string;
    loading: string;
    nav: {
      profile: string;
      addresses: string;
      reservations: string;
      paymentMethods: string;
    };
    profile: {
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
      language: string;
      save: string;
      saving: string;
      saved: string;
      loadError: string;
      saveError: string;
      personalInfo: string;
      personalInfoHint: string;
      preferences: string;
      preferencesHint: string;
      emailHint: string;
      memberId: string;
      quickLinks: string;
      viewReservations: string;
      statusActive: string;
      statusSuspended: string;
      statusDeleted: string;
      reset: string;
      unsavedChanges: string;
    };
    addresses: {
      empty: string;
      addNew: string;
      add: string;
      saving: string;
      cancel: string;
      delete: string;
      deleteConfirm: string;
      deleteError: string;
      loadError: string;
      saveError: string;
      defaultBadge: string;
      isDefault: string;
      label: string;
      line1: string;
      line2: string;
      city: string;
      countryCode: string;
    };
    reservations: {
      empty: string;
      reference: string;
      date: string;
      status: string;
      total: string;
      view: string;
      back: string;
      notFound: string;
      loadError: string;
      detail: {
        bookedOn: string;
        itemsCount: string;
        itemsTitle: string;
        noItems: string;
        item: string;
        dates: string;
        quantity: string;
        lineTotal: string;
        actions: string;
        payNow: string;
        paying: string;
        payError: string;
        cancelBooking: string;
        cancelling: string;
        cancelConfirm: string;
        cancelError: string;
        title: string;
      };
    };
    paymentMethods: {
      empty: string;
      addNew: string;
      add: string;
      saving: string;
      cancel: string;
      delete: string;
      deleteConfirm: string;
      deleteError: string;
      loadError: string;
      saveError: string;
      defaultBadge: string;
      isDefault: string;
      typeCard: string;
      typePaypal: string;
      typeOther: string;
      provider: string;
      lastFour: string;
    };
  };
  booking: {
    login: {
      title: string;
      subtitle: string;
      divider: string;
      google: string;
      backToHotels: string;
      form: {
        emailLabel: string;
        emailPlaceholder: string;
        passwordLabel: string;
        passwordPlaceholder: string;
        submit: string;
        submitLoading: string;
      };
      errors: {
        network: string;
        generic: string;
        envMissing: string;
        unauthorized: string;
      };
    };
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
    myAccount: 'Mon compte',
    signIn: 'Connexion',
    signOut: 'Se déconnecter',
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
  hotels: {
    metaTitle: 'Hébergements en Afrique',
    metaDescription:
      'Comparez hôtels, lodges et resorts en Afrique. Trouvez le séjour idéal avec Africa Tourism Gate.',
    breadcrumbHome: 'Accueil',
    breadcrumbHotels: 'Hébergements',
    heroTitle: 'Hébergements d\'exception en Afrique',
    heroSubtitle:
      'Lodges de safari, riads authentiques et resorts en bord de mer — sélectionnés par nos experts voyage.',
    resultsFor: 'Résultats pour',
    allAfrica: 'Toute l\'Afrique',
    propertiesFound: 'établissements',
    sortBy: 'Trier par',
    sortRecommended: 'Recommandés',
    sortPriceLow: 'Prix croissant',
    sortPriceHigh: 'Prix décroissant',
    sortRating: 'Meilleures notes',
    loading: 'Recherche des hébergements…',
    loadError: 'Impossible de charger les résultats. Vérifiez que l’API est démarrée.',
    retry: 'Réessayer',
    filters: 'Filtres',
    filterStars: 'Étoiles',
    filterType: 'Type',
    types: {
      hotel: 'Hôtel',
      resort: 'Resort',
      apartment: 'Appartement',
      villa: 'Villa',
      hostel: 'Auberge',
      other: 'Autre',
    },
    perNight: '/ nuit',
    viewDetails: 'Voir détails',
    bookNow: 'Réserver',
    freeCancel: 'Annulation gratuite',
    amenities: {
      wifi: 'Wi-Fi',
      pool: 'Piscine',
      breakfast: 'Petit-déjeuner',
      spa: 'Spa',
      parking: 'Parking',
    },
    excellent: 'Exceptionnel',
    veryGood: 'Très bien',
    modifySearch: 'Modifier la recherche',
    checkIn: 'Arrivée',
    checkOut: 'Départ',
    guests: 'Voyageurs',
    noResults: 'Aucun hébergement pour ces critères',
    noResultsHint: 'Élargissez votre recherche ou explorez toutes nos destinations.',
    backHome: 'Retour à l\'accueil',
    previewNotice:
      'Prix affichés : minimum par nuit pour votre séjour. La réservation en ligne arrive bientôt.',
    stars: 'étoiles',
    allTypes: 'Tous les types',
    allStars: 'Toutes',
    reviews: 'avis',
    featuredBadge: 'Coup de cœur',
    detailMetaDescription: 'Réservez votre séjour à {name}. Galerie, équipements et chambres.',
    galleryAria: 'Galerie photos',
    amenitiesTitle: 'Équipements',
    roomsTitle: 'Chambres',
    descriptionTitle: 'Description',
    calendarTitle: 'Disponibilités et tarifs',
    selectRoom: 'Choisir cette chambre',
    selectRoomHint: 'Sélectionnez une chambre pour réserver.',
    totalStay: 'Total séjour',
    nightsLabel: 'nuits',
    nightSingular: 'nuit',
    nightPlural: 'nuits',
    unavailable: 'Indisponible',
    updateDates: 'Modifier les dates',
    notFound: 'Hébergement introuvable',
    notFoundHint: 'Cet établissement n’existe pas ou n’est plus disponible.',
    backToList: 'Retour aux résultats',
    prevMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    fromPrice: 'À partir de',
    selectDatesHint: 'Choisissez vos dates d’arrivée et de départ.',
    maxGuests: 'jusqu’à {n} voyageurs',
    bedConfig: 'Literie',
    reserveSection: 'Réserver',
  },
  account: {
    title: 'Mon compte',
    subtitle: 'Gérez votre profil, vos adresses et vos réservations.',
    browseSite: 'Explorer les hébergements',
    navAria: 'Navigation du compte',
    loading: 'Chargement…',
    nav: {
      profile: 'Profil',
      addresses: 'Adresses',
      reservations: 'Réservations',
      paymentMethods: 'Moyens de paiement',
    },
    profile: {
      email: 'E-mail',
      firstName: 'Prénom',
      lastName: 'Nom',
      phone: 'Téléphone',
      language: 'Langue préférée',
      save: 'Enregistrer',
      saving: 'Enregistrement…',
      saved: 'Profil mis à jour avec succès.',
      loadError: 'Impossible de charger le profil.',
      saveError: 'Impossible de mettre à jour le profil.',
      personalInfo: 'Informations personnelles',
      personalInfoHint: 'Vos coordonnées utilisées pour les réservations.',
      preferences: 'Préférences',
      preferencesHint: 'Langue d’affichage du site et des communications.',
      emailHint: 'L’adresse e-mail ne peut pas être modifiée ici.',
      memberId: 'Identifiant client',
      quickLinks: 'Accès rapide',
      viewReservations: 'Mes réservations',
      statusActive: 'Compte actif',
      statusSuspended: 'Compte suspendu',
      statusDeleted: 'Compte supprimé',
      reset: 'Annuler les modifications',
      unsavedChanges: 'Modifications non enregistrées',
    },
    addresses: {
      empty: 'Aucune adresse enregistrée.',
      addNew: 'Ajouter une adresse',
      add: 'Ajouter',
      saving: 'Enregistrement…',
      cancel: 'Annuler',
      delete: 'Supprimer',
      deleteConfirm: 'Supprimer cette adresse ?',
      deleteError: 'Impossible de supprimer l’adresse.',
      loadError: 'Impossible de charger les adresses.',
      saveError: 'Impossible d’enregistrer l’adresse.',
      defaultBadge: 'Par défaut',
      isDefault: 'Adresse par défaut',
      label: 'Libellé (ex. Domicile)',
      line1: 'Adresse ligne 1',
      line2: 'Adresse ligne 2',
      city: 'Ville',
      countryCode: 'Code pays (ex. CD)',
    },
    reservations: {
      empty: 'Aucune réservation pour le moment.',
      reference: 'Référence',
      date: 'Date',
      status: 'Statut',
      total: 'Total',
      view: 'Voir',
      back: 'Retour aux réservations',
      notFound: 'Réservation introuvable.',
      loadError: 'Impossible de charger les réservations.',
      detail: {
        bookedOn: 'Réservée le',
        itemsCount: 'Articles',
        itemsTitle: 'Détail de la réservation',
        noItems: 'Aucun article enregistré.',
        item: 'Prestation',
        dates: 'Dates',
        quantity: 'Qté',
        lineTotal: 'Montant',
        actions: 'Actions',
        payNow: 'Payer maintenant',
        paying: 'Redirection vers le paiement…',
        payError: 'Impossible d’ouvrir la page de paiement.',
        cancelBooking: 'Annuler la réservation',
        cancelling: 'Annulation…',
        cancelConfirm: 'Annuler cette réservation ?',
        cancelError: 'Impossible d’annuler la réservation.',
        title: 'Détail de la réservation',
      },
    },
    paymentMethods: {
      empty: 'Aucun moyen de paiement enregistré.',
      addNew: 'Ajouter un moyen de paiement',
      add: 'Ajouter',
      saving: 'Enregistrement…',
      cancel: 'Annuler',
      delete: 'Supprimer',
      deleteConfirm: 'Supprimer ce moyen de paiement ?',
      deleteError: 'Impossible de supprimer.',
      loadError: 'Impossible de charger les moyens de paiement.',
      saveError: 'Impossible d’enregistrer.',
      defaultBadge: 'Par défaut',
      isDefault: 'Par défaut',
      typeCard: 'Carte bancaire',
      typePaypal: 'PayPal',
      typeOther: 'Autre',
      provider: 'Fournisseur (ex. visa)',
      lastFour: '4 derniers chiffres',
    },
  },
  booking: {
    login: {
      title: 'Connexion client',
      subtitle:
        'Connectez-vous avec votre e-mail et mot de passe, ou utilisez Google pour poursuivre votre réservation.',
      divider: 'ou',
      google: 'Se connecter avec Google',
      backToHotels: 'Retour aux hôtels',
      form: {
        emailLabel: 'Adresse e-mail',
        emailPlaceholder: 'vous@exemple.com',
        passwordLabel: 'Mot de passe',
        passwordPlaceholder: '••••••••',
        submit: 'Se connecter',
        submitLoading: 'Connexion…',
      },
      errors: {
        network: 'Impossible de joindre le serveur. Vérifiez votre connexion.',
        generic: 'Une erreur est survenue. Veuillez réessayer.',
        envMissing: 'Configuration API manquante (NEXT_PUBLIC_API_URL).',
        unauthorized: 'Adresse e-mail ou mot de passe incorrect.',
      },
    },
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
    myAccount: 'My account',
    signIn: 'Sign in',
    signOut: 'Sign out',
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
  hotels: {
    metaTitle: 'Stays in Africa',
    metaDescription:
      'Compare hotels, lodges and resorts across Africa. Find your perfect stay with Africa Tourism Gate.',
    breadcrumbHome: 'Home',
    breadcrumbHotels: 'Stays',
    heroTitle: 'Exceptional stays across Africa',
    heroSubtitle:
      'Safari lodges, authentic riads and beach resorts — curated by our travel experts.',
    resultsFor: 'Results for',
    allAfrica: 'All Africa',
    propertiesFound: 'properties',
    sortBy: 'Sort by',
    sortRecommended: 'Recommended',
    sortPriceLow: 'Price: low to high',
    sortPriceHigh: 'Price: high to low',
    sortRating: 'Top rated',
    loading: 'Searching accommodations…',
    loadError: 'Could not load results. Make sure the API is running.',
    retry: 'Retry',
    filters: 'Filters',
    filterStars: 'Stars',
    filterType: 'Type',
    types: {
      hotel: 'Hotel',
      resort: 'Resort',
      apartment: 'Apartment',
      villa: 'Villa',
      hostel: 'Hostel',
      other: 'Other',
    },
    perNight: '/ night',
    viewDetails: 'View details',
    bookNow: 'Book now',
    freeCancel: 'Free cancellation',
    amenities: {
      wifi: 'Wi-Fi',
      pool: 'Pool',
      breakfast: 'Breakfast',
      spa: 'Spa',
      parking: 'Parking',
    },
    excellent: 'Exceptional',
    veryGood: 'Very good',
    modifySearch: 'Modify search',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    guests: 'Guests',
    noResults: 'No properties match your criteria',
    noResultsHint: 'Broaden your search or browse all destinations.',
    backHome: 'Back to home',
    previewNotice:
      'Prices shown are the minimum per night for your stay. Online booking is coming soon.',
    stars: 'stars',
    allTypes: 'All types',
    allStars: 'All',
    reviews: 'reviews',
    featuredBadge: 'Top pick',
    detailMetaDescription: 'Book your stay at {name}. Gallery, amenities and rooms.',
    galleryAria: 'Photo gallery',
    amenitiesTitle: 'Amenities',
    roomsTitle: 'Rooms',
    descriptionTitle: 'Description',
    calendarTitle: 'Availability and rates',
    selectRoom: 'Select this room',
    selectRoomHint: 'Select a room to book.',
    totalStay: 'Stay total',
    nightsLabel: 'nights',
    nightSingular: 'night',
    nightPlural: 'nights',
    unavailable: 'Unavailable',
    updateDates: 'Change dates',
    notFound: 'Property not found',
    notFoundHint: 'This property does not exist or is no longer available.',
    backToList: 'Back to results',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    fromPrice: 'From',
    selectDatesHint: 'Choose your check-in and check-out dates.',
    maxGuests: 'up to {n} guests',
    bedConfig: 'Bedding',
    reserveSection: 'Book',
  },
  account: {
    title: 'My account',
    subtitle: 'Manage your profile, addresses and bookings.',
    browseSite: 'Browse accommodations',
    navAria: 'Account navigation',
    loading: 'Loading…',
    nav: {
      profile: 'Profile',
      addresses: 'Addresses',
      reservations: 'Bookings',
      paymentMethods: 'Payment methods',
    },
    profile: {
      email: 'Email',
      firstName: 'First name',
      lastName: 'Last name',
      phone: 'Phone',
      language: 'Preferred language',
      save: 'Save',
      saving: 'Saving…',
      saved: 'Profile updated successfully.',
      loadError: 'Could not load profile.',
      saveError: 'Could not update profile.',
      personalInfo: 'Personal information',
      personalInfoHint: 'Your contact details used for bookings.',
      preferences: 'Preferences',
      preferencesHint: 'Site display language and communications.',
      emailHint: 'Email address cannot be changed here.',
      memberId: 'Customer ID',
      quickLinks: 'Quick links',
      viewReservations: 'My bookings',
      statusActive: 'Active account',
      statusSuspended: 'Suspended account',
      statusDeleted: 'Deleted account',
      reset: 'Discard changes',
      unsavedChanges: 'Unsaved changes',
    },
    addresses: {
      empty: 'No saved addresses.',
      addNew: 'Add address',
      add: 'Add',
      saving: 'Saving…',
      cancel: 'Cancel',
      delete: 'Delete',
      deleteConfirm: 'Delete this address?',
      deleteError: 'Could not delete address.',
      loadError: 'Could not load addresses.',
      saveError: 'Could not save address.',
      defaultBadge: 'Default',
      isDefault: 'Default address',
      label: 'Label (e.g. Home)',
      line1: 'Address line 1',
      line2: 'Address line 2',
      city: 'City',
      countryCode: 'Country code (e.g. CD)',
    },
    reservations: {
      empty: 'No bookings yet.',
      reference: 'Reference',
      date: 'Date',
      status: 'Status',
      total: 'Total',
      view: 'View',
      back: 'Back to bookings',
      notFound: 'Booking not found.',
      loadError: 'Could not load bookings.',
      detail: {
        bookedOn: 'Booked on',
        itemsCount: 'Items',
        itemsTitle: 'Booking details',
        noItems: 'No items recorded.',
        item: 'Service',
        dates: 'Dates',
        quantity: 'Qty',
        lineTotal: 'Amount',
        actions: 'Actions',
        payNow: 'Pay now',
        paying: 'Redirecting to payment…',
        payError: 'Could not open the payment page.',
        cancelBooking: 'Cancel booking',
        cancelling: 'Cancelling…',
        cancelConfirm: 'Cancel this booking?',
        cancelError: 'Could not cancel the booking.',
        title: 'Booking details',
      },
    },
    paymentMethods: {
      empty: 'No payment methods saved.',
      addNew: 'Add payment method',
      add: 'Add',
      saving: 'Saving…',
      cancel: 'Cancel',
      delete: 'Delete',
      deleteConfirm: 'Delete this payment method?',
      deleteError: 'Could not delete.',
      loadError: 'Could not load payment methods.',
      saveError: 'Could not save.',
      defaultBadge: 'Default',
      isDefault: 'Default',
      typeCard: 'Card',
      typePaypal: 'PayPal',
      typeOther: 'Other',
      provider: 'Provider (e.g. visa)',
      lastFour: 'Last 4 digits',
    },
  },
  booking: {
    login: {
      title: 'Customer sign in',
      subtitle:
        'Sign in with your email and password, or use Google to continue your booking.',
      divider: 'or',
      google: 'Sign in with Google',
      backToHotels: 'Back to hotels',
      form: {
        emailLabel: 'Email address',
        emailPlaceholder: 'you@example.com',
        passwordLabel: 'Password',
        passwordPlaceholder: '••••••••',
        submit: 'Sign in',
        submitLoading: 'Signing in…',
      },
      errors: {
        network: 'Could not reach the server. Check your connection.',
        generic: 'Something went wrong. Please try again.',
        envMissing: 'Missing API configuration (NEXT_PUBLIC_API_URL).',
        unauthorized: 'Incorrect email or password.',
      },
    },
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
    myAccount: 'Mi cuenta',
    signIn: 'Iniciar sesión',
    signOut: 'Cerrar sesión',
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
  hotels: {
    metaTitle: 'Alojamientos en África',
    metaDescription:
      'Compare hoteles, lodges y resorts en África. Encuentre su estancia ideal con Africa Tourism Gate.',
    breadcrumbHome: 'Inicio',
    breadcrumbHotels: 'Alojamientos',
    heroTitle: 'Alojamientos excepcionales en África',
    heroSubtitle:
      'Lodges de safari, riads auténticos y resorts en la playa — seleccionados por nuestros expertos.',
    resultsFor: 'Resultados para',
    allAfrica: 'Toda África',
    propertiesFound: 'establecimientos',
    sortBy: 'Ordenar por',
    sortRecommended: 'Recomendados',
    sortPriceLow: 'Precio: menor a mayor',
    sortPriceHigh: 'Precio: mayor a menor',
    sortRating: 'Mejor valorados',
    loading: 'Buscando alojamientos…',
    loadError: 'No se pudieron cargar los resultados. Compruebe que la API esté en marcha.',
    retry: 'Reintentar',
    filters: 'Filtros',
    filterStars: 'Estrellas',
    filterType: 'Tipo',
    types: {
      hotel: 'Hotel',
      resort: 'Resort',
      apartment: 'Apartamento',
      villa: 'Villa',
      hostel: 'Hostal',
      other: 'Otro',
    },
    perNight: '/ noche',
    viewDetails: 'Ver detalles',
    bookNow: 'Reservar',
    freeCancel: 'Cancelación gratuita',
    amenities: {
      wifi: 'Wi-Fi',
      pool: 'Piscina',
      breakfast: 'Desayuno',
      spa: 'Spa',
      parking: 'Aparcamiento',
    },
    excellent: 'Excepcional',
    veryGood: 'Muy bien',
    modifySearch: 'Modificar búsqueda',
    checkIn: 'Entrada',
    checkOut: 'Salida',
    guests: 'Huéspedes',
    noResults: 'Ningún alojamiento coincide con sus criterios',
    noResultsHint: 'Amplíe su búsqueda o explore todos los destinos.',
    backHome: 'Volver al inicio',
    previewNotice:
      'Precios mostrados: mínimo por noche para su estancia. La reserva en línea llegará pronto.',
    stars: 'estrellas',
    allTypes: 'Todos los tipos',
    allStars: 'Todas',
    reviews: 'opiniones',
    featuredBadge: 'Favorito',
    detailMetaDescription: 'Reserve su estancia en {name}. Galería, servicios y habitaciones.',
    galleryAria: 'Galería de fotos',
    amenitiesTitle: 'Servicios',
    roomsTitle: 'Habitaciones',
    descriptionTitle: 'Descripción',
    calendarTitle: 'Disponibilidad y tarifas',
    selectRoom: 'Elegir esta habitación',
    selectRoomHint: 'Seleccione una habitación para reservar.',
    totalStay: 'Total estancia',
    nightsLabel: 'noches',
    nightSingular: 'noche',
    nightPlural: 'noches',
    unavailable: 'No disponible',
    updateDates: 'Cambiar fechas',
    notFound: 'Alojamiento no encontrado',
    notFoundHint: 'Este establecimiento no existe o ya no está disponible.',
    backToList: 'Volver a resultados',
    prevMonth: 'Mes anterior',
    nextMonth: 'Mes siguiente',
    fromPrice: 'Desde',
    selectDatesHint: 'Elija fechas de entrada y salida.',
    maxGuests: 'hasta {n} viajeros',
    bedConfig: 'Camas',
    reserveSection: 'Reservar',
  },
  account: {
    title: 'Mi cuenta',
    subtitle: 'Gestione su perfil, direcciones y reservas.',
    browseSite: 'Explorar alojamientos',
    navAria: 'Navegación de la cuenta',
    loading: 'Cargando…',
    nav: {
      profile: 'Perfil',
      addresses: 'Direcciones',
      reservations: 'Reservas',
      paymentMethods: 'Medios de pago',
    },
    profile: {
      email: 'Correo',
      firstName: 'Nombre',
      lastName: 'Apellido',
      phone: 'Teléfono',
      language: 'Idioma preferido',
      save: 'Guardar',
      saving: 'Guardando…',
      saved: 'Perfil actualizado con éxito.',
      loadError: 'No se pudo cargar el perfil.',
      saveError: 'No se pudo actualizar el perfil.',
      personalInfo: 'Información personal',
      personalInfoHint: 'Sus datos de contacto para las reservas.',
      preferences: 'Preferencias',
      preferencesHint: 'Idioma del sitio y comunicaciones.',
      emailHint: 'El correo no se puede modificar aquí.',
      memberId: 'ID de cliente',
      quickLinks: 'Accesos rápidos',
      viewReservations: 'Mis reservas',
      statusActive: 'Cuenta activa',
      statusSuspended: 'Cuenta suspendida',
      statusDeleted: 'Cuenta eliminada',
      reset: 'Descartar cambios',
      unsavedChanges: 'Cambios sin guardar',
    },
    addresses: {
      empty: 'Sin direcciones guardadas.',
      addNew: 'Añadir dirección',
      add: 'Añadir',
      saving: 'Guardando…',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      deleteConfirm: '¿Eliminar esta dirección?',
      deleteError: 'No se pudo eliminar.',
      loadError: 'No se pudieron cargar las direcciones.',
      saveError: 'No se pudo guardar.',
      defaultBadge: 'Predeterminada',
      isDefault: 'Dirección predeterminada',
      label: 'Etiqueta (ej. Casa)',
      line1: 'Dirección línea 1',
      line2: 'Dirección línea 2',
      city: 'Ciudad',
      countryCode: 'Código país (ej. CD)',
    },
    reservations: {
      empty: 'Sin reservas por ahora.',
      reference: 'Referencia',
      date: 'Fecha',
      status: 'Estado',
      total: 'Total',
      view: 'Ver',
      back: 'Volver a reservas',
      notFound: 'Reserva no encontrada.',
      loadError: 'No se pudieron cargar las reservas.',
      detail: {
        bookedOn: 'Reservada el',
        itemsCount: 'Artículos',
        itemsTitle: 'Detalle de la reserva',
        noItems: 'Sin artículos registrados.',
        item: 'Servicio',
        dates: 'Fechas',
        quantity: 'Cant.',
        lineTotal: 'Importe',
        actions: 'Acciones',
        payNow: 'Pagar ahora',
        paying: 'Redirigiendo al pago…',
        payError: 'No se pudo abrir la página de pago.',
        cancelBooking: 'Cancelar reserva',
        cancelling: 'Cancelando…',
        cancelConfirm: '¿Cancelar esta reserva?',
        cancelError: 'No se pudo cancelar la reserva.',
        title: 'Detalle de la reserva',
      },
    },
    paymentMethods: {
      empty: 'Sin medios de pago guardados.',
      addNew: 'Añadir medio de pago',
      add: 'Añadir',
      saving: 'Guardando…',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      deleteConfirm: '¿Eliminar este medio de pago?',
      deleteError: 'No se pudo eliminar.',
      loadError: 'No se pudieron cargar los medios de pago.',
      saveError: 'No se pudo guardar.',
      defaultBadge: 'Predeterminado',
      isDefault: 'Predeterminado',
      typeCard: 'Tarjeta',
      typePaypal: 'PayPal',
      typeOther: 'Otro',
      provider: 'Proveedor (ej. visa)',
      lastFour: 'Últimos 4 dígitos',
    },
  },
  booking: {
    login: {
      title: 'Inicio de sesión',
      subtitle:
        'Inicie sesión con su correo y contraseña, o use Google para continuar su reserva.',
      divider: 'o',
      google: 'Iniciar sesión con Google',
      backToHotels: 'Volver a hoteles',
      form: {
        emailLabel: 'Correo electrónico',
        emailPlaceholder: 'usted@ejemplo.com',
        passwordLabel: 'Contraseña',
        passwordPlaceholder: '••••••••',
        submit: 'Iniciar sesión',
        submitLoading: 'Conectando…',
      },
      errors: {
        network: 'No se pudo contactar el servidor. Compruebe su conexión.',
        generic: 'Ha ocurrido un error. Inténtelo de nuevo.',
        envMissing: 'Falta la configuración de la API (NEXT_PUBLIC_API_URL).',
        unauthorized: 'Correo o contraseña incorrectos.',
      },
    },
  },
};

export const translations: Record<Locale, Translations> = { fr, en, es };
