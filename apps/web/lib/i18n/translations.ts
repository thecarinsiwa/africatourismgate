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
    guestRating: string;
    reviewsTitle: string;
    noReviews: string;
    reviewsLoading: string;
    reviewsLoadError: string;
    loadMoreReviews: string;
    anonymousGuest: string;
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
      loyalty: string;
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
        leaveReview: string;
        leaveReviewHint: string;
        yourReview: string;
        reviewRating: string;
        reviewTitle: string;
        reviewTitlePlaceholder: string;
        reviewBody: string;
        reviewBodyPlaceholder: string;
        submitReview: string;
        submittingReview: string;
        reviewSubmitError: string;
        reviewRatingRequired: string;
        reviewStarAria: string;
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
    loyalty: {
      empty: string;
      loadError: string;
      programLabel: string;
      pointsLabel: string;
      pointsShort: string;
      earnHint: string;
      allPrograms: string;
      tierMember: string;
      tierSilver: string;
      tierGold: string;
      tierPlatinum: string;
    };
  };
  support: {
    metaTitle: string;
    metaDescription: string;
    pageTitle: string;
    pageSubtitle: string;
    faqTitle: string;
    formTitle: string;
    formSubtitle: string;
    signInPrompt: string;
    signInCta: string;
    checkingSession: string;
    subjectLabel: string;
    subjectPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successMessage: string;
    subjectRequired: string;
    messageTooShort: string;
    submitError: string;
    faq: {
      booking: { question: string; answer: string };
      payment: { question: string; answer: string };
      cancellation: { question: string; answer: string };
      account: { question: string; answer: string };
      contact: { question: string; answer: string };
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
    homeTitle: 'RÃ©servez votre voyage en Afrique',
    homeDescription:
      'Comparez hÃ´tels, vols et expÃ©riences en Afrique. Recherchez des hÃ©bergements et planifiez votre prochain sÃ©jour avec Africa Tourism Gate.',
  },
  nav: {
    home: 'Accueil',
    about: 'Ã€ propos',
    gallery: 'Galerie',
    pages: 'Pages',
    blog: 'Blog',
    contact: 'Contacts',
    hotels: 'HÃ´tels',
    flights: 'Vols',
    cars: 'Location de Voitures',
    cruises: 'CroisiÃ¨res',
    tours: 'Tours',
    mainAria: 'Navigation principale',
    mobileAria: 'Navigation mobile',
    menu: 'Menu',
    myAccount: 'Mon compte',
    signIn: 'Connexion',
    signOut: 'Se dÃ©connecter',
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
          'Votre passerelle vers les plus belles destinations africaines. Explorez, rÃ©servez et vivez des expÃ©riences inoubliables.',
      },
      {
        subtitle: 'Safari de 7 jours',
        title: 'MASAI MARA MAGIQUE',
        description:
          "DÃ©couvrez la migration des gnous et les Big Five dans la rÃ©serve la plus cÃ©lÃ¨bre d'Afrique.",
      },
      {
        subtitle: '5 jours Ã ',
        title: 'MARRAKECH (Perle du Sud)',
        description:
          'Plongez dans les souks, les riads et les saveurs Ã©picÃ©es de la ville ocre du Maroc.',
      },
      {
        subtitle: 'CroisiÃ¨re de 12 jours',
        title: 'ZANZIBAR Ã€ MADAGASCAR',
        description:
          "Navigation cÃ´tiÃ¨re le long de l'OcÃ©an Indien â€” plages de rÃªve et faune unique.",
      },
    ],
    prev: 'Diapositive prÃ©cÃ©dente',
    next: 'Diapositive suivante',
  },
  search: {
    tablistAria: 'Type de recherche',
    tabs: { flights: 'Vols', hotels: 'HÃ´tels', cars: 'Voitures', cruises: 'CroisiÃ¨res', tours: 'Tours' },
    search: 'Rechercher',
    departDate: 'Date dÃ©part',
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
    startDate: 'Date dÃ©but',
    endDate: 'Date fin',
    sailTo: 'Naviguer vers :',
    sailFrom: 'Naviguer de :',
    ship: 'Navire :',
    days: 'Jours :',
    cityPh: 'Ville',
    destinationPh: 'Destination ou hÃ´tel',
    selectPh: 'SÃ©lectionner',
    countryPh: 'Pays',
    locationPh: 'Lieu',
    allDestinations: 'Toutes destinations',
    allPorts: 'Tous les ports',
    shipPh: 'Navire',
    departCityPh: 'Ville de dÃ©part',
    destinationPh2: 'Destination',
    roomTypes: ['Chambre Double', 'Chambre Simple', 'Suite'],
    countries: ['Kenya', 'Tanzanie', 'Maroc', 'Afrique du Sud', 'Rwanda', 'RDC'],
    locations: ['AÃ©roport', 'Centre-ville', 'Gare'],
  },
  whyUs: {
    title: 'Pourquoi nous choisir',
    subtitle:
      "Africa Tourism Gate vous offre une expÃ©rience de voyage unique avec les meilleurs services et un accompagnement personnalisÃ© pour dÃ©couvrir l'Afrique.",
    learnMore: 'En savoir plus',
    items: [
      {
        title: 'Voyages Incroyables',
        description:
          'Des destinations uniques sÃ©lectionnÃ©es avec soin Ã  travers tout le continent africain pour des expÃ©riences inoubliables.',
      },
      {
        title: 'DÃ©couvertes',
        description:
          "Explorez la richesse culturelle, les paysages Ã©poustouflants et la faune sauvage de l'Afrique.",
      },
      {
        title: 'RÃ©servation Facile',
        description:
          'RÃ©servez vos hÃ©bergements, vols et activitÃ©s en quelques clics grÃ¢ce Ã  notre plateforme intuitive.',
      },
      {
        title: 'Support 24/7',
        description:
          'Notre Ã©quipe de spÃ©cialistes du voyage est disponible jour et nuit pour vous accompagner.',
      },
    ],
  },
  promo: {
    title: 'Safari au Kenya â€” Forfait Vacances',
    description:
      "DÃ©couvrez les plaines infinies du Masai Mara, observez les Big Five dans leur habitat naturel et profitez d'hÃ©bergements de luxe au cÅ“ur de la savane. Une expÃ©rience qui changera votre vision de l'Afrique.",
    priceFrom: 'Ã€ partir de :',
    perPerson: '/personne',
    details: 'DÃ©tails',
  },
  destinations: {
    title: 'Destinations Populaires',
    subtitle:
      'DÃ©couvrez nos destinations africaines les plus prisÃ©es. Des safaris aux plages paradisiaques, chaque voyage est une aventure unique.',
    reviews: 'Avis',
    details: 'DÃ©tails',
    items: [
      {
        title: 'Safari au Masai Mara',
        subtitle: 'De Nairobi, Kenya',
        description: 'Safari de 7 jours au dÃ©part de Nairobi. Big Five et migration des gnous.',
      },
      {
        title: 'Escapade au Cap',
        subtitle: 'Le Cap, Afrique du Sud',
        description: 'Explorez Table Mountain, le Cap de Bonne EspÃ©rance et les vignobles.',
      },
      {
        title: 'MÃ©dina de Marrakech',
        subtitle: '5 jours, Maroc',
        description: 'Perdez-vous dans les souks, savourez les Ã©pices et dormez dans un riad.',
      },
      {
        title: 'Plages de Zanzibar',
        subtitle: 'Tanzanie, 6 jours',
        description: "Sable blanc, eaux turquoise et Ã©pices â€” le paradis de l'OcÃ©an Indien.",
      },
    ],
  },
  customers: {
    title: 'Clients Satisfaits',
    subtitle: 'La satisfaction de nos voyageurs est notre prioritÃ© absolue.',
    p1: "Depuis notre lancement, nous avons accompagnÃ© des milliers de voyageurs dans la dÃ©couverte de l'Afrique. Notre engagement envers un service d'excellence et des expÃ©riences authentiques nous a valu la confiance de notre communautÃ© grandissante.",
    p2: "Chaque retour positif nous motive Ã  continuer d'amÃ©liorer nos services et Ã  proposer des voyages toujours plus mÃ©morables Ã  travers le continent.",
    clients: 'Clients',
    imageAlt: 'Voyageurs heureux en Afrique',
    bars: { flights: 'Vols', hotels: 'HÃ´tels', cars: 'Voitures', cruises: 'CroisiÃ¨res' },
  },
  footer: {
    tagline:
      'Votre passerelle vers les meilleures expÃ©riences de voyage en Afrique. DÃ©couvrez des destinations uniques et rÃ©servez en toute confiance.',
    learnMore: 'En savoir plus',
    specialists: 'SpÃ©cialistes Voyage',
    specialistLinks: {
      premium: 'HÃ©bergements Premium',
      flights: 'Vols PremiÃ¨re Classe',
      safaris: 'Safaris & Tours',
      cruises: 'CroisiÃ¨res CÃ´tiÃ¨res',
    },
    newsletter: 'Newsletter',
    newsletterDesc: 'Inspiration, idÃ©es de voyages, bons plans et actualitÃ©s.',
    emailPlaceholder: 'Adresse email',
    contact: 'Contact',
    location: 'Kinshasa, RD Congo',
    privacy: 'Politique de ConfidentialitÃ©',
    about: 'Ã€ propos',
    faq: 'FAQ',
    designedBy: 'ConÃ§u par',
  },
  hotels: {
    metaTitle: 'HÃ©bergements en Afrique',
    metaDescription:
      'Comparez hÃ´tels, lodges et resorts en Afrique. Trouvez le sÃ©jour idÃ©al avec Africa Tourism Gate.',
    breadcrumbHome: 'Accueil',
    breadcrumbHotels: 'HÃ©bergements',
    heroTitle: 'HÃ©bergements d\'exception en Afrique',
    heroSubtitle:
      'Lodges de safari, riads authentiques et resorts en bord de mer â€” sÃ©lectionnÃ©s par nos experts voyage.',
    resultsFor: 'RÃ©sultats pour',
    allAfrica: 'Toute l\'Afrique',
    propertiesFound: 'Ã©tablissements',
    sortBy: 'Trier par',
    sortRecommended: 'RecommandÃ©s',
    sortPriceLow: 'Prix croissant',
    sortPriceHigh: 'Prix dÃ©croissant',
    sortRating: 'Meilleures notes',
    loading: 'Recherche des hÃ©bergementsâ€¦',
    loadError: 'Impossible de charger les rÃ©sultats. VÃ©rifiez que lâ€™API est dÃ©marrÃ©e.',
    retry: 'RÃ©essayer',
    filters: 'Filtres',
    filterStars: 'Ã‰toiles',
    filterType: 'Type',
    types: {
      hotel: 'HÃ´tel',
      resort: 'Resort',
      apartment: 'Appartement',
      villa: 'Villa',
      hostel: 'Auberge',
      other: 'Autre',
    },
    perNight: '/ nuit',
    viewDetails: 'Voir dÃ©tails',
    bookNow: 'RÃ©server',
    freeCancel: 'Annulation gratuite',
    amenities: {
      wifi: 'Wi-Fi',
      pool: 'Piscine',
      breakfast: 'Petit-dÃ©jeuner',
      spa: 'Spa',
      parking: 'Parking',
    },
    excellent: 'Exceptionnel',
    veryGood: 'TrÃ¨s bien',
    modifySearch: 'Modifier la recherche',
    checkIn: 'ArrivÃ©e',
    checkOut: 'DÃ©part',
    guests: 'Voyageurs',
    noResults: 'Aucun hÃ©bergement pour ces critÃ¨res',
    noResultsHint: 'Ã‰largissez votre recherche ou explorez toutes nos destinations.',
    backHome: 'Retour Ã  l\'accueil',
    previewNotice:
      'Prix affichÃ©s : minimum par nuit pour votre sÃ©jour. La rÃ©servation en ligne arrive bientÃ´t.',
    stars: 'Ã©toiles',
    allTypes: 'Tous les types',
    allStars: 'Toutes',
    reviews: 'avis',
    featuredBadge: 'Coup de cÅ“ur',
    detailMetaDescription: 'RÃ©servez votre sÃ©jour Ã  {name}. Galerie, Ã©quipements et chambres.',
    galleryAria: 'Galerie photos',
    amenitiesTitle: 'Ã‰quipements',
    roomsTitle: 'Chambres',
    descriptionTitle: 'Description',
    calendarTitle: 'DisponibilitÃ©s et tarifs',
    selectRoom: 'Choisir cette chambre',
    selectRoomHint: 'SÃ©lectionnez une chambre pour rÃ©server.',
    totalStay: 'Total sÃ©jour',
    nightsLabel: 'nuits',
    nightSingular: 'nuit',
    nightPlural: 'nuits',
    unavailable: 'Indisponible',
    updateDates: 'Modifier les dates',
    notFound: 'HÃ©bergement introuvable',
    notFoundHint: 'Cet Ã©tablissement nâ€™existe pas ou nâ€™est plus disponible.',
    backToList: 'Retour aux rÃ©sultats',
    prevMonth: 'Mois prÃ©cÃ©dent',
    nextMonth: 'Mois suivant',
    fromPrice: 'Ã€ partir de',
    selectDatesHint: 'Choisissez vos dates dâ€™arrivÃ©e et de dÃ©part.',
    maxGuests: 'jusquâ€™Ã  {n} voyageurs',
    bedConfig: 'Literie',
    reserveSection: 'RÃ©server',
    guestRating: 'Note clients',
    reviewsTitle: 'Avis des voyageurs',
    noReviews: 'Aucun avis pour le moment.',
    reviewsLoading: 'Chargement des avisâ€¦',
    reviewsLoadError: 'Impossible de charger les avis.',
    loadMoreReviews: 'Afficher plus dâ€™avis',
    anonymousGuest: 'Voyageur',
  },
  account: {
    title: 'Mon compte',
    subtitle: 'GÃ©rez votre profil, vos adresses et vos rÃ©servations.',
    browseSite: 'Explorer les hÃ©bergements',
    navAria: 'Navigation du compte',
    loading: 'Chargementâ€¦',
    nav: {
      profile: 'Profil',
      addresses: 'Adresses',
      reservations: 'RÃ©servations',
      loyalty: 'FidÃ©litÃ© OneKey',
      paymentMethods: 'Moyens de paiement',
    },
    profile: {
      email: 'E-mail',
      firstName: 'PrÃ©nom',
      lastName: 'Nom',
      phone: 'TÃ©lÃ©phone',
      language: 'Langue prÃ©fÃ©rÃ©e',
      save: 'Enregistrer',
      saving: 'Enregistrementâ€¦',
      saved: 'Profil mis Ã  jour avec succÃ¨s.',
      loadError: 'Impossible de charger le profil.',
      saveError: 'Impossible de mettre Ã  jour le profil.',
      personalInfo: 'Informations personnelles',
      personalInfoHint: 'Vos coordonnÃ©es utilisÃ©es pour les rÃ©servations.',
      preferences: 'PrÃ©fÃ©rences',
      preferencesHint: 'Langue dâ€™affichage du site et des communications.',
      emailHint: 'Lâ€™adresse e-mail ne peut pas Ãªtre modifiÃ©e ici.',
      memberId: 'Identifiant client',
      quickLinks: 'AccÃ¨s rapide',
      viewReservations: 'Mes rÃ©servations',
      statusActive: 'Compte actif',
      statusSuspended: 'Compte suspendu',
      statusDeleted: 'Compte supprimÃ©',
      reset: 'Annuler les modifications',
      unsavedChanges: 'Modifications non enregistrÃ©es',
    },
    addresses: {
      empty: 'Aucune adresse enregistrÃ©e.',
      addNew: 'Ajouter une adresse',
      add: 'Ajouter',
      saving: 'Enregistrementâ€¦',
      cancel: 'Annuler',
      delete: 'Supprimer',
      deleteConfirm: 'Supprimer cette adresse ?',
      deleteError: 'Impossible de supprimer lâ€™adresse.',
      loadError: 'Impossible de charger les adresses.',
      saveError: 'Impossible dâ€™enregistrer lâ€™adresse.',
      defaultBadge: 'Par dÃ©faut',
      isDefault: 'Adresse par dÃ©faut',
      label: 'LibellÃ© (ex. Domicile)',
      line1: 'Adresse ligne 1',
      line2: 'Adresse ligne 2',
      city: 'Ville',
      countryCode: 'Code pays (ex. CD)',
    },
    reservations: {
      empty: 'Aucune rÃ©servation pour le moment.',
      reference: 'RÃ©fÃ©rence',
      date: 'Date',
      status: 'Statut',
      total: 'Total',
      view: 'Voir',
      back: 'Retour aux rÃ©servations',
      notFound: 'RÃ©servation introuvable.',
      loadError: 'Impossible de charger les rÃ©servations.',
      detail: {
        bookedOn: 'RÃ©servÃ©e le',
        itemsCount: 'Articles',
        itemsTitle: 'DÃ©tail de la rÃ©servation',
        noItems: 'Aucun article enregistrÃ©.',
        item: 'Prestation',
        dates: 'Dates',
        quantity: 'QtÃ©',
        lineTotal: 'Montant',
        actions: 'Actions',
        payNow: 'Payer maintenant',
        paying: 'Redirection vers le paiementâ€¦',
        payError: 'Impossible dâ€™ouvrir la page de paiement.',
        cancelBooking: 'Annuler la rÃ©servation',
        cancelling: 'Annulationâ€¦',
        cancelConfirm: 'Annuler cette rÃ©servation ?',
        cancelError: 'Impossible dâ€™annuler la rÃ©servation.',
        title: 'DÃ©tail de la rÃ©servation',
        leaveReview: 'Laisser un avis',
        leaveReviewHint: 'Partagez votre expÃ©rience aprÃ¨s votre sÃ©jour.',
        yourReview: 'Votre avis',
        reviewRating: 'Note',
        reviewTitle: 'Titre (optionnel)',
        reviewTitlePlaceholder: 'Ex. SÃ©jour parfait',
        reviewBody: 'Commentaire (optionnel)',
        reviewBodyPlaceholder: 'Quâ€™avez-vous apprÃ©ciÃ© ?',
        submitReview: 'Publier mon avis',
        submittingReview: 'Publicationâ€¦',
        reviewSubmitError: 'Impossible de publier lâ€™avis.',
        reviewRatingRequired: 'Veuillez choisir une note entre 1 et 5.',
        reviewStarAria: '{n} sur 5',
      },
    },
    paymentMethods: {
      empty: 'Aucun moyen de paiement enregistrÃ©.',
      addNew: 'Ajouter un moyen de paiement',
      add: 'Ajouter',
      saving: 'Enregistrementâ€¦',
      cancel: 'Annuler',
      delete: 'Supprimer',
      deleteConfirm: 'Supprimer ce moyen de paiement ?',
      deleteError: 'Impossible de supprimer.',
      loadError: 'Impossible de charger les moyens de paiement.',
      saveError: 'Impossible dâ€™enregistrer.',
      defaultBadge: 'Par dÃ©faut',
      isDefault: 'Par dÃ©faut',
      typeCard: 'Carte bancaire',
      typePaypal: 'PayPal',
      typeOther: 'Autre',
      provider: 'Fournisseur (ex. visa)',
      lastFour: '4 derniers chiffres',
    },
    loyalty: {
      empty:
        'Votre compte OneKey sera crÃ©Ã© automatiquement aprÃ¨s votre premier paiement confirmÃ©.',
      loadError: 'Impossible de charger votre fidÃ©litÃ© OneKey.',
      programLabel: 'Programme',
      pointsLabel: 'points OneKey',
      pointsShort: 'pts',
      earnHint:
        'Les points sont crÃ©ditÃ©s aprÃ¨s chaque paiement de rÃ©servation confirmÃ©, selon les rÃ¨gles du programme.',
      allPrograms: 'Tous vos programmes',
      tierMember: 'Membre',
      tierSilver: 'Silver',
      tierGold: 'Gold',
      tierPlatinum: 'Platinum',
    },
  },
  support: {
    metaTitle: 'Aide et support',
    metaDescription:
      'Consultez la FAQ Africa Tourism Gate ou contactez notre Ã©quipe pour vos rÃ©servations et votre compte.',
    pageTitle: 'Centre dâ€™aide',
    pageSubtitle:
      'RÃ©ponses aux questions frÃ©quentes et formulaire pour joindre notre Ã©quipe support.',
    faqTitle: 'Questions frÃ©quentes',
    formTitle: 'Contacter le support',
    formSubtitle:
      'DÃ©crivez votre demande : nous crÃ©ons un ticket et vous rÃ©pondons par e-mail.',
    signInPrompt: 'Connectez-vous pour envoyer une demande au support.',
    signInCta: 'Se connecter',
    checkingSession: 'VÃ©rification de la sessionâ€¦',
    subjectLabel: 'Sujet',
    subjectPlaceholder: 'Ex. Question sur ma rÃ©servation #â€¦',
    messageLabel: 'Message',
    messagePlaceholder: 'DÃ©crivez votre situation en quelques phrasesâ€¦',
    submit: 'Envoyer la demande',
    submitting: 'Envoi en coursâ€¦',
    successTitle: 'Demande enregistrÃ©e',
    successMessage:
      'Merci. Votre ticket a Ã©tÃ© crÃ©Ã©. Conservez cette rÃ©fÃ©rence : {ticketId}. Notre Ã©quipe vous rÃ©pondra sous 24 Ã  48 h ouvrÃ©es.',
    subjectRequired: 'Le sujet est obligatoire.',
    messageTooShort: 'Le message doit contenir au moins 10 caractÃ¨res.',
    submitError: 'Impossible dâ€™envoyer votre demande. Veuillez rÃ©essayer.',
    faq: {
      booking: {
        question: 'Comment modifier ou annuler une rÃ©servation ?',
        answer:
          'Ouvrez Mon compte â†’ RÃ©servations, sÃ©lectionnez votre sÃ©jour puis suivez les options disponibles (paiement, annulation). Si le bouton nâ€™apparaÃ®t pas, contactez-nous avec votre numÃ©ro de rÃ©servation.',
      },
      payment: {
        question: 'Quels moyens de paiement acceptez-vous ?',
        answer:
          'Les paiements en ligne sÃ©curisÃ©s (carte bancaire via Stripe) sont proposÃ©s au moment de la confirmation. Le dÃ©bit et la facture dÃ©pendent de lâ€™Ã©tablissement et du type de produit rÃ©servÃ©.',
      },
      cancellation: {
        question: 'Quelle est votre politique dâ€™annulation ?',
        answer:
          'Les conditions varient selon lâ€™hÃ©bergement ou le prestataire. Consultez les dÃ©tails sur la fiche produit et dans votre confirmation. En cas de doute, ouvrez un ticket avec votre rÃ©fÃ©rence de rÃ©servation.',
      },
      account: {
        question: 'Comment mettre Ã  jour mon profil ou mes adresses ?',
        answer:
          'Depuis Mon compte, rubriques Profil et Adresses. La langue dâ€™affichage peut Ãªtre modifiÃ©e dans vos prÃ©fÃ©rences.',
      },
      contact: {
        question: 'Quel dÃ©lai de rÃ©ponse du support ?',
        answer:
          'Nous traitons les demandes du lundi au vendredi. La plupart des tickets reÃ§oivent une premiÃ¨re rÃ©ponse sous 24 Ã  48 h ouvrÃ©es.',
      },
    },
  },
  booking: {
    login: {
      title: 'Connexion client',
      subtitle:
        'Connectez-vous avec votre e-mail et mot de passe, ou utilisez Google pour poursuivre votre rÃ©servation.',
      divider: 'ou',
      google: 'Se connecter avec Google',
      backToHotels: 'Retour aux hÃ´tels',
      form: {
        emailLabel: 'Adresse e-mail',
        emailPlaceholder: 'vous@exemple.com',
        passwordLabel: 'Mot de passe',
        passwordPlaceholder: 'â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢',
        submit: 'Se connecter',
        submitLoading: 'Connexionâ€¦',
      },
      errors: {
        network: 'Impossible de joindre le serveur. VÃ©rifiez votre connexion.',
        generic: 'Une erreur est survenue. Veuillez rÃ©essayer.',
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
          'Witness the wildebeest migration and the Big Five in Africaâ€™s most famous reserve.',
      },
      {
        subtitle: '5 days in',
        title: 'MARRAKECH (Pearl of the South)',
        description:
          'Immerse yourself in souks, riads and the spiced flavors of Moroccoâ€™s ochre city.',
      },
      {
        subtitle: '12-day cruise',
        title: 'ZANZIBAR TO MADAGASCAR',
        description:
          'Coastal sailing along the Indian Ocean â€” dream beaches and unique wildlife.',
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
          'Explore rich cultures, breathtaking landscapes and Africaâ€™s incredible wildlife.',
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
    title: 'Kenya Safari â€” Holiday Package',
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
        description: 'White sand, turquoise waters and spices â€” Indian Ocean paradise.',
      },
    ],
  },
  customers: {
    title: 'Happy Customers',
    subtitle: 'Our travelersâ€™ satisfaction is our top priority.',
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
      'Safari lodges, authentic riads and beach resorts â€” curated by our travel experts.',
    resultsFor: 'Results for',
    allAfrica: 'All Africa',
    propertiesFound: 'properties',
    sortBy: 'Sort by',
    sortRecommended: 'Recommended',
    sortPriceLow: 'Price: low to high',
    sortPriceHigh: 'Price: high to low',
    sortRating: 'Top rated',
    loading: 'Searching accommodationsâ€¦',
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
    guestRating: 'Guest rating',
    reviewsTitle: 'Guest reviews',
    noReviews: 'No reviews yet.',
    reviewsLoading: 'Loading reviewsâ€¦',
    reviewsLoadError: 'Could not load reviews.',
    loadMoreReviews: 'Show more reviews',
    anonymousGuest: 'Guest',
  },
  account: {
    title: 'My account',
    subtitle: 'Manage your profile, addresses and bookings.',
    browseSite: 'Browse accommodations',
    navAria: 'Account navigation',
    loading: 'Loadingâ€¦',
    nav: {
      profile: 'Profile',
      addresses: 'Addresses',
      reservations: 'Bookings',
      loyalty: 'OneKey loyalty',
      paymentMethods: 'Payment methods',
    },
    profile: {
      email: 'Email',
      firstName: 'First name',
      lastName: 'Last name',
      phone: 'Phone',
      language: 'Preferred language',
      save: 'Save',
      saving: 'Savingâ€¦',
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
      saving: 'Savingâ€¦',
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
        paying: 'Redirecting to paymentâ€¦',
        payError: 'Could not open the payment page.',
        cancelBooking: 'Cancel booking',
        cancelling: 'Cancellingâ€¦',
        cancelConfirm: 'Cancel this booking?',
        cancelError: 'Could not cancel the booking.',
        title: 'Booking details',
        leaveReview: 'Leave a review',
        leaveReviewHint: 'Share your experience after your stay.',
        yourReview: 'Your review',
        reviewRating: 'Rating',
        reviewTitle: 'Title (optional)',
        reviewTitlePlaceholder: 'e.g. Perfect stay',
        reviewBody: 'Comment (optional)',
        reviewBodyPlaceholder: 'What did you enjoy?',
        submitReview: 'Submit review',
        submittingReview: 'Submittingâ€¦',
        reviewSubmitError: 'Could not submit your review.',
        reviewRatingRequired: 'Please select a rating from 1 to 5.',
        reviewStarAria: '{n} out of 5',
      },
    },
    paymentMethods: {
      empty: 'No payment methods saved.',
      addNew: 'Add payment method',
      add: 'Add',
      saving: 'Savingâ€¦',
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
    loyalty: {
      empty:
        'Your OneKey account will be created automatically after your first confirmed payment.',
      loadError: 'Could not load your OneKey loyalty.',
      programLabel: 'Program',
      pointsLabel: 'OneKey points',
      pointsShort: 'pts',
      earnHint:
        'Points are credited after each confirmed booking payment, according to program rules.',
      allPrograms: 'All your programs',
      tierMember: 'Member',
      tierSilver: 'Silver',
      tierGold: 'Gold',
      tierPlatinum: 'Platinum',
    },
  },
  support: {
    metaTitle: 'Help & support',
    metaDescription:
      'Browse the Africa Tourism Gate FAQ or contact our team about bookings and your account.',
    pageTitle: 'Help centre',
    pageSubtitle: 'Frequently asked questions and a form to reach our support team.',
    faqTitle: 'Frequently asked questions',
    formTitle: 'Contact support',
    formSubtitle: 'Describe your request â€” we open a ticket and reply by email.',
    signInPrompt: 'Sign in to send a request to support.',
    signInCta: 'Sign in',
    checkingSession: 'Checking sessionâ€¦',
    subjectLabel: 'Subject',
    subjectPlaceholder: 'e.g. Question about booking #â€¦',
    messageLabel: 'Message',
    messagePlaceholder: 'Describe your situation in a few sentencesâ€¦',
    submit: 'Send request',
    submitting: 'Sendingâ€¦',
    successTitle: 'Request received',
    successMessage:
      'Thank you. Your ticket was created. Keep this reference: {ticketId}. Our team will reply within 1â€“2 business days.',
    subjectRequired: 'Subject is required.',
    messageTooShort: 'Message must be at least 10 characters.',
    submitError: 'Could not send your request. Please try again.',
    faq: {
      booking: {
        question: 'How do I change or cancel a booking?',
        answer:
          'Open My account â†’ Bookings, select your stay and use the available actions (pay, cancel). If an option is missing, contact us with your booking reference.',
      },
      payment: {
        question: 'Which payment methods do you accept?',
        answer:
          'Secure online card payments (Stripe) are offered at checkout. Charges and invoices depend on the property and product booked.',
      },
      cancellation: {
        question: 'What is your cancellation policy?',
        answer:
          'Terms vary by property or provider. Check the product page and your confirmation email. If unsure, open a ticket with your booking reference.',
      },
      account: {
        question: 'How do I update my profile or addresses?',
        answer:
          'From My account, use Profile and Addresses. You can change display language in your preferences.',
      },
      contact: {
        question: 'How fast does support reply?',
        answer:
          'We handle requests Mondayâ€“Friday. Most tickets get a first reply within 1â€“2 business days.',
      },
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
        passwordPlaceholder: 'â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢',
        submit: 'Sign in',
        submitLoading: 'Signing inâ€¦',
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
export const translations: Record<Locale, Translations> = { fr, en };
