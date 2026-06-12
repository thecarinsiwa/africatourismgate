import type { Locale } from './types';
import { es } from './translations-es';

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
    passengers: string;
    airportPh: string;
    flightRequired: string;
    flightReturnAfterDeparture: string;
    flightReturnRequired: string;
    flightSameAirport: string;
    swapAirports: string;
    tripTypeAria: string;
    oneWay: string;
    roundTrip: string;
    viewAllFlights: string;
    carsRequired: string;
    carsReturnAfterPickup: string;
    viewAllCars: string;
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
  flights: {
    metaTitle: string;
    metaDescription: string;
    breadcrumbHome: string;
    breadcrumbFlights: string;
    heroTitle: string;
    heroSubtitle: string;
    resultsFor: string;
    anyRoute: string;
    flightsFound: string;
    sortBy: string;
    sortRecommended: string;
    sortPriceLow: string;
    sortPriceHigh: string;
    sortDuration: string;
    loading: string;
    loadError: string;
    retry: string;
    modifySearch: string;
    departureDate: string;
    returnDate: string;
    passengers: string;
    passengerSingular: string;
    passengerPlural: string;
    noResults: string;
    noResultsHint: string;
    noSearchParams: string;
    noSearchParamsHint: string;
    browseAllHint: string;
    startSearch: string;
    backHome: string;
    viewDetails: string;
    bookNow: string;
    roundTripBadge: string;
    roundTripFrom: string;
    fromPrice: string;
    perPassenger: string;
    direct: string;
    departure: string;
    arrival: string;
    itineraryTitle: string;
    classesTitle: string;
    selectClass: string;
    selectClassHint: string;
    seatsLeft: string;
    unavailable: string;
    insufficientSeats: string;
    totalFlight: string;
    reserveSection: string;
    notFound: string;
    notFoundHint: string;
    backToList: string;
    classNames: {
      economy: string;
      premium_economy: string;
      business: string;
      first: string;
    };
  };
  cars: {
    metaTitle: string;
    metaDescription: string;
    breadcrumbHome: string;
    breadcrumbCars: string;
    heroTitle: string;
    heroSubtitle: string;
    resultsFor: string;
    anyLocation: string;
    vehiclesFound: string;
    sortBy: string;
    sortRecommended: string;
    sortPriceLow: string;
    sortPriceHigh: string;
    loading: string;
    loadError: string;
    retry: string;
    modifySearch: string;
    pickupDate: string;
    returnDate: string;
    pickupLocation: string;
    noResults: string;
    noResultsHint: string;
    noSearchParams: string;
    noSearchParamsHint: string;
    browseAllHint: string;
    startSearch: string;
    backHome: string;
    viewDetails: string;
    bookNow: string;
    perDay: string;
    totalRental: string;
    daySingular: string;
    dayPlural: string;
    selectDatesHint: string;
    reserveSection: string;
    notFound: string;
    notFoundHint: string;
    backToList: string;
    agencyTitle: string;
    categoryTitle: string;
    licensePlate: string;
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
    passengers: 'Passagers',
    airportPh: 'Aéroport',
    flightRequired: 'Indiquez le départ, la destination et la date de départ.',
    flightReturnAfterDeparture: 'La date de retour doit être après la date de départ.',
    flightReturnRequired: 'Indiquez la date de retour pour un aller-retour.',
    flightSameAirport: 'Le départ et la destination doivent être différents.',
    swapAirports: 'Inverser départ et arrivée',
    tripTypeAria: 'Type de vol',
    oneWay: 'Aller simple',
    roundTrip: 'Aller-retour',
    viewAllFlights: 'Voir tous les vols disponibles',
    carsRequired: 'Indiquez la ville, la date de prise en charge et la date de retour.',
    carsReturnAfterPickup: 'La date de retour doit être après la date de prise en charge.',
    viewAllCars: 'Voir toutes les locations',
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
    loadError: "Impossible de charger les résultats. Vérifiez que l'API est démarrée.",
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
    notFoundHint: "Cet établissement n'existe pas ou n'est plus disponible.",
    backToList: 'Retour aux résultats',
    prevMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    fromPrice: 'À partir de',
    selectDatesHint: "Choisissez vos dates d'arrivée et de départ.",
    maxGuests: "jusqu'à {n} voyageurs",
    bedConfig: 'Literie',
    reserveSection: 'Réserver',
    guestRating: 'Note clients',
    reviewsTitle: 'Avis des voyageurs',
    noReviews: 'Aucun avis pour le moment.',
    reviewsLoading: 'Chargement des avis…',
    reviewsLoadError: 'Impossible de charger les avis.',
    loadMoreReviews: "Afficher plus d'avis",
    anonymousGuest: 'Voyageur',
  },
  flights: {
    metaTitle: 'Vols en Afrique',
    metaDescription:
      'Comparez et réservez des vols vers les principales destinations africaines avec Africa Tourism Gate.',
    breadcrumbHome: 'Accueil',
    breadcrumbFlights: 'Vols',
    heroTitle: 'Vols vers l\'Afrique',
    heroSubtitle:
      'Comparez les compagnies, horaires et tarifs pour votre prochain voyage continental.',
    resultsFor: 'Résultats pour',
    anyRoute: 'Toutes les routes',
    flightsFound: 'vols',
    sortBy: 'Trier par',
    sortRecommended: 'Recommandés',
    sortPriceLow: 'Prix croissant',
    sortPriceHigh: 'Prix décroissant',
    sortDuration: 'Durée la plus courte',
    loading: 'Recherche des vols…',
    loadError: "Impossible de charger les vols. Vérifiez que l'API est démarrée.",
    retry: 'Réessayer',
    modifySearch: 'Modifier la recherche',
    departureDate: 'Date de départ',
    returnDate: 'Date de retour',
    passengers: 'Passagers',
    passengerSingular: 'passager',
    passengerPlural: '{n} passagers',
    noResults: 'Aucun vol pour ces critères',
    noResultsHint: 'Essayez d\'autres dates ou aéroports (ex. Kinshasa → Nairobi).',
    noSearchParams: 'Lancez une recherche de vols',
    noSearchParamsHint: 'Indiquez un départ, une destination et une date de départ.',
    browseAllHint: 'Tous les vols disponibles — tarifs à la prochaine date avec places libres.',
    startSearch: 'Lancer une recherche',
    backHome: 'Retour à l\'accueil',
    viewDetails: 'Voir détails',
    bookNow: 'Réserver',
    roundTripBadge: 'Aller-retour',
    roundTripFrom: 'À partir de (A/R)',
    fromPrice: 'À partir de',
    perPassenger: '/ passager',
    direct: 'Direct',
    departure: 'Départ',
    arrival: 'Arrivée',
    itineraryTitle: 'Itinéraire',
    classesTitle: 'Classes disponibles',
    selectClass: 'Choisir cette classe',
    selectClassHint: 'Sélectionnez une classe pour réserver.',
    seatsLeft: '{n} siège(s) disponible(s)',
    unavailable: 'Complet',
    insufficientSeats: 'Pas assez de places pour ce nombre de passagers.',
    totalFlight: 'Total vol',
    reserveSection: 'Réserver',
    notFound: 'Vol introuvable',
    notFoundHint: "Ce vol n'existe pas ou n'est plus disponible pour cette date.",
    backToList: 'Retour aux résultats',
    classNames: {
      economy: 'Économique',
      premium_economy: 'Économique premium',
      business: 'Affaires',
      first: 'Première',
    },
  },
  cars: {
    metaTitle: 'Location de voitures en Afrique',
    metaDescription:
      'Comparez et réservez des véhicules de location aux principales destinations africaines avec Africa Tourism Gate.',
    breadcrumbHome: 'Accueil',
    breadcrumbCars: 'Voitures',
    heroTitle: 'Location de voitures en Afrique',
    heroSubtitle:
      'SUV, berlines et 4×4 auprès d\'agences locales de confiance — tarif journalier transparent.',
    resultsFor: 'Résultats pour',
    anyLocation: 'Toutes les villes',
    vehiclesFound: 'véhicules',
    sortBy: 'Trier par',
    sortRecommended: 'Recommandés',
    sortPriceLow: 'Prix croissant',
    sortPriceHigh: 'Prix décroissant',
    loading: 'Recherche des véhicules…',
    loadError: "Impossible de charger les véhicules. Vérifiez que l'API est démarrée.",
    retry: 'Réessayer',
    modifySearch: 'Modifier la recherche',
    pickupDate: 'Date de prise en charge',
    returnDate: 'Date de retour',
    pickupLocation: 'Lieu de prise en charge',
    noResults: 'Aucun véhicule pour ces critères',
    noResultsHint: 'Essayez d\'autres dates ou une autre ville (ex. Kinshasa).',
    noSearchParams: 'Lancez une recherche de location',
    noSearchParamsHint: 'Indiquez un lieu, une date de prise en charge et une date de retour.',
    browseAllHint: 'Saisissez vos dates et votre ville pour voir les véhicules disponibles.',
    startSearch: 'Lancer une recherche',
    backHome: 'Retour à l\'accueil',
    viewDetails: 'Voir détails',
    bookNow: 'Réserver',
    perDay: '/ jour',
    totalRental: 'Total location',
    daySingular: 'jour',
    dayPlural: 'jours',
    selectDatesHint: 'Choisissez vos dates de prise en charge et de retour.',
    reserveSection: 'Réserver',
    notFound: 'Véhicule introuvable',
    notFoundHint: "Ce véhicule n'existe pas ou n'est pas disponible pour cette période.",
    backToList: 'Retour aux résultats',
    agencyTitle: 'Agence de location',
    categoryTitle: 'Catégorie',
    licensePlate: 'Immatriculation',
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
      loyalty: 'Fidélité OneKey',
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
      preferencesHint: "Langue d'affichage du site et des communications.",
      emailHint: "L'adresse e-mail ne peut pas être modifiée ici.",
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
      deleteError: "Impossible de supprimer l'adresse.",
      loadError: 'Impossible de charger les adresses.',
      saveError: "Impossible d'enregistrer l'adresse.",
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
        payError: "Impossible d'ouvrir la page de paiement.",
        cancelBooking: 'Annuler la réservation',
        cancelling: 'Annulation…',
        cancelConfirm: 'Annuler cette réservation ?',
        cancelError: "Impossible d'annuler la réservation.",
        title: 'Détail de la réservation',
        leaveReview: 'Laisser un avis',
        leaveReviewHint: 'Partagez votre expérience après votre séjour.',
        yourReview: 'Votre avis',
        reviewRating: 'Note',
        reviewTitle: 'Titre (optionnel)',
        reviewTitlePlaceholder: 'Ex. Séjour parfait',
        reviewBody: 'Commentaire (optionnel)',
        reviewBodyPlaceholder: "Qu'avez-vous apprécié ?",
        submitReview: 'Publier mon avis',
        submittingReview: 'Publication…',
        reviewSubmitError: "Impossible de publier l'avis.",
        reviewRatingRequired: 'Veuillez choisir une note entre 1 et 5.',
        reviewStarAria: '{n} sur 5',
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
      saveError: "Impossible d'enregistrer.",
      defaultBadge: 'Par défaut',
      isDefault: 'Par défaut',
      typeCard: 'Carte bancaire',
      typePaypal: 'PayPal',
      typeOther: 'Autre',
      provider: 'Fournisseur (ex. visa)',
      lastFour: '4 derniers chiffres',
    },
    loyalty: {
      empty:
        'Votre compte OneKey sera créé automatiquement après votre premier paiement confirmé.',
      loadError: 'Impossible de charger votre fidélité OneKey.',
      programLabel: 'Programme',
      pointsLabel: 'points OneKey',
      pointsShort: 'pts',
      earnHint:
        'Les points sont crédités après chaque paiement de réservation confirmé, selon les règles du programme.',
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
      'Consultez la FAQ Africa Tourism Gate ou contactez notre équipe pour vos réservations et votre compte.',
    pageTitle: "Centre d'aide",
    pageSubtitle:
      'Réponses aux questions fréquentes et formulaire pour joindre notre équipe support.',
    faqTitle: 'Questions fréquentes',
    formTitle: 'Contacter le support',
    formSubtitle:
      'Décrivez votre demande : nous créons un ticket et vous répondons par e-mail.',
    signInPrompt: 'Connectez-vous pour envoyer une demande au support.',
    signInCta: 'Se connecter',
    checkingSession: 'Vérification de la session…',
    subjectLabel: 'Sujet',
    subjectPlaceholder: 'Ex. Question sur ma réservation #…',
    messageLabel: 'Message',
    messagePlaceholder: 'Décrivez votre situation en quelques phrases…',
    submit: 'Envoyer la demande',
    submitting: 'Envoi en cours…',
    successTitle: 'Demande enregistrée',
    successMessage:
      'Merci. Votre ticket a été créé. Conservez cette référence : {ticketId}. Notre équipe vous répondra sous 24 à 48 h ouvrées.',
    subjectRequired: 'Le sujet est obligatoire.',
    messageTooShort: 'Le message doit contenir au moins 10 caractères.',
    submitError: "Impossible d'envoyer votre demande. Veuillez réessayer.",
    faq: {
      booking: {
        question: 'Comment modifier ou annuler une réservation ?',
        answer:
          "Ouvrez Mon compte → Réservations, sélectionnez votre séjour puis suivez les options disponibles (paiement, annulation). Si le bouton n'apparaît pas, contactez-nous avec votre numéro de réservation.",
      },
      payment: {
        question: 'Quels moyens de paiement acceptez-vous ?',
        answer:
          "Les paiements en ligne sécurisés (carte bancaire via Stripe) sont proposés au moment de la confirmation. Le débit et la facture dépendent de l'établissement et du type de produit réservé.",
      },
      cancellation: {
        question: "Quelle est votre politique d'annulation ?",
        answer:
          "Les conditions varient selon l'hébergement ou le prestataire. Consultez les détails sur la fiche produit et dans votre confirmation. En cas de doute, ouvrez un ticket avec votre référence de réservation.",
      },
      account: {
        question: 'Comment mettre à jour mon profil ou mes adresses ?',
        answer:
          "Depuis Mon compte, rubriques Profil et Adresses. La langue d'affichage peut être modifiée dans vos préférences.",
      },
      contact: {
        question: 'Quel délai de réponse du support ?',
        answer:
          'Nous traitons les demandes du lundi au vendredi. La plupart des tickets reçoivent une première réponse sous 24 à 48 h ouvrées.',
      },
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
          'Witness the wildebeest migration and the Big Five in Africa�"s most famous reserve.',
      },
      {
        subtitle: '5 days in',
        title: 'MARRAKECH (Pearl of the South)',
        description:
          'Immerse yourself in souks, riads and the spiced flavors of Morocco�"s ochre city.',
      },
      {
        subtitle: '12-day cruise',
        title: 'ZANZIBAR TO MADAGASCAR',
        description:
          'Coastal sailing along the Indian Ocean � dream beaches and unique wildlife.',
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
    passengers: 'Passengers',
    airportPh: 'Airport',
    flightRequired: 'Enter departure, destination and departure date.',
    flightReturnAfterDeparture: 'Return date must be after departure date.',
    flightReturnRequired: 'Enter a return date for a round trip.',
    flightSameAirport: 'Departure and destination must be different.',
    swapAirports: 'Swap departure and arrival',
    tripTypeAria: 'Trip type',
    oneWay: 'One way',
    roundTrip: 'Round trip',
    viewAllFlights: 'View all available flights',
    carsRequired: 'Enter city, pick-up date and return date.',
    carsReturnAfterPickup: 'Return date must be after pick-up date.',
    viewAllCars: 'View all car rentals',
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
          'Explore rich cultures, breathtaking landscapes and Africa�"s incredible wildlife.',
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
    title: 'Kenya Safari � Holiday Package',
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
        description: 'White sand, turquoise waters and spices � Indian Ocean paradise.',
      },
    ],
  },
  customers: {
    title: 'Happy Customers',
    subtitle: 'Our travelers�" satisfaction is our top priority.',
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
      'Safari lodges, authentic riads and beach resorts � curated by our travel experts.',
    resultsFor: 'Results for',
    allAfrica: 'All Africa',
    propertiesFound: 'properties',
    sortBy: 'Sort by',
    sortRecommended: 'Recommended',
    sortPriceLow: 'Price: low to high',
    sortPriceHigh: 'Price: high to low',
    sortRating: 'Top rated',
    loading: 'Searching accommodations⬦',
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
    reviewsLoading: 'Loading reviews⬦',
    reviewsLoadError: 'Could not load reviews.',
    loadMoreReviews: 'Show more reviews',
    anonymousGuest: 'Guest',
  },
  flights: {
    metaTitle: 'Flights in Africa',
    metaDescription:
      'Compare and book flights to major African destinations with Africa Tourism Gate.',
    breadcrumbHome: 'Home',
    breadcrumbFlights: 'Flights',
    heroTitle: 'Flights to Africa',
    heroSubtitle:
      'Compare airlines, schedules and fares for your next continental trip.',
    resultsFor: 'Results for',
    anyRoute: 'All routes',
    flightsFound: 'flights',
    sortBy: 'Sort by',
    sortRecommended: 'Recommended',
    sortPriceLow: 'Price: low to high',
    sortPriceHigh: 'Price: high to low',
    sortDuration: 'Shortest duration',
    loading: 'Searching flights…',
    loadError: 'Could not load flights. Make sure the API is running.',
    retry: 'Retry',
    modifySearch: 'Modify search',
    departureDate: 'Departure date',
    returnDate: 'Return date',
    passengers: 'Passengers',
    passengerSingular: 'passenger',
    passengerPlural: '{n} passengers',
    noResults: 'No flights match your criteria',
    noResultsHint: 'Try different dates or airports (e.g. Kinshasa → Nairobi).',
    noSearchParams: 'Start a flight search',
    noSearchParamsHint: 'Enter departure, destination and a departure date.',
    browseAllHint: 'All available flights — fares shown for the next date with seats.',
    startSearch: 'Start search',
    backHome: 'Back to home',
    viewDetails: 'View details',
    bookNow: 'Book now',
    roundTripBadge: 'Round trip',
    roundTripFrom: 'From (round trip)',
    fromPrice: 'From',
    perPassenger: '/ passenger',
    direct: 'Direct',
    departure: 'Departure',
    arrival: 'Arrival',
    itineraryTitle: 'Itinerary',
    classesTitle: 'Available classes',
    selectClass: 'Select this class',
    selectClassHint: 'Select a class to book.',
    seatsLeft: '{n} seat(s) available',
    unavailable: 'Sold out',
    insufficientSeats: 'Not enough seats for this number of passengers.',
    totalFlight: 'Flight total',
    reserveSection: 'Book',
    notFound: 'Flight not found',
    notFoundHint: 'This flight does not exist or is no longer available for this date.',
    backToList: 'Back to results',
    classNames: {
      economy: 'Economy',
      premium_economy: 'Premium economy',
      business: 'Business',
      first: 'First',
    },
  },
  cars: {
    metaTitle: 'Car rental in Africa',
    metaDescription:
      'Compare and book rental cars at major African destinations with Africa Tourism Gate.',
    breadcrumbHome: 'Home',
    breadcrumbCars: 'Cars',
    heroTitle: 'Car rental in Africa',
    heroSubtitle:
      'SUVs, sedans and 4×4 from trusted local agencies — transparent daily rates.',
    resultsFor: 'Results for',
    anyLocation: 'All cities',
    vehiclesFound: 'vehicles',
    sortBy: 'Sort by',
    sortRecommended: 'Recommended',
    sortPriceLow: 'Price: low to high',
    sortPriceHigh: 'Price: high to low',
    loading: 'Searching vehicles…',
    loadError: 'Could not load vehicles. Make sure the API is running.',
    retry: 'Retry',
    modifySearch: 'Modify search',
    pickupDate: 'Pick-up date',
    returnDate: 'Return date',
    pickupLocation: 'Pick-up location',
    noResults: 'No vehicles match your criteria',
    noResultsHint: 'Try different dates or another city (e.g. Kinshasa).',
    noSearchParams: 'Start a car rental search',
    noSearchParamsHint: 'Enter a location, pick-up date and return date.',
    browseAllHint: 'Enter your dates and city to see available vehicles.',
    startSearch: 'Start search',
    backHome: 'Back to home',
    viewDetails: 'View details',
    bookNow: 'Book now',
    perDay: '/ day',
    totalRental: 'Rental total',
    daySingular: 'day',
    dayPlural: 'days',
    selectDatesHint: 'Choose your pick-up and return dates.',
    reserveSection: 'Book',
    notFound: 'Vehicle not found',
    notFoundHint: 'This vehicle does not exist or is not available for this period.',
    backToList: 'Back to results',
    agencyTitle: 'Rental agency',
    categoryTitle: 'Category',
    licensePlate: 'License plate',
  },
  account: {
    title: 'My account',
    subtitle: 'Manage your profile, addresses and bookings.',
    browseSite: 'Browse accommodations',
    navAria: 'Account navigation',
    loading: 'Loading⬦',
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
      saving: 'Saving⬦',
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
      saving: 'Saving⬦',
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
        paying: 'Redirecting to payment⬦',
        payError: 'Could not open the payment page.',
        cancelBooking: 'Cancel booking',
        cancelling: 'Cancelling⬦',
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
        submittingReview: 'Submitting⬦',
        reviewSubmitError: 'Could not submit your review.',
        reviewRatingRequired: 'Please select a rating from 1 to 5.',
        reviewStarAria: '{n} out of 5',
      },
    },
    paymentMethods: {
      empty: 'No payment methods saved.',
      addNew: 'Add payment method',
      add: 'Add',
      saving: 'Saving⬦',
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
    formSubtitle: 'Describe your request � we open a ticket and reply by email.',
    signInPrompt: 'Sign in to send a request to support.',
    signInCta: 'Sign in',
    checkingSession: 'Checking session⬦',
    subjectLabel: 'Subject',
    subjectPlaceholder: 'e.g. Question about booking #⬦',
    messageLabel: 'Message',
    messagePlaceholder: 'Describe your situation in a few sentences⬦',
    submit: 'Send request',
    submitting: 'Sending⬦',
    successTitle: 'Request received',
    successMessage:
      'Thank you. Your ticket was created. Keep this reference: {ticketId}. Our team will reply within 1�2 business days.',
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
          'We handle requests Monday�Friday. Most tickets get a first reply within 1�2 business days.',
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
        passwordPlaceholder: '⬢⬢⬢⬢⬢⬢⬢⬢',
        submit: 'Sign in',
        submitLoading: 'Signing in⬦',
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
export const translations: Record<Locale, Translations> = { fr, en, es };
