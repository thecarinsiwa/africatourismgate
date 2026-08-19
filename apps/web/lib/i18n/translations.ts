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
    goToSlide: string;
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
    viewAllHotels: string;
    carsRequired: string;
    carsReturnAfterPickup: string;
    carsDurationHint: string;
    pickupLocationPh: string;
    viewAllCars: string;
    cruisesRequired: string;
    cruisesEndAfterStart: string;
    cruisesSamePort: string;
    viewAllCruises: string;
    viewAllActivities: string;
    toursRequired: string;
    participants: string;
    roomTypes: string[];
    countries: string[];
    locations: string[];
  };
  listing: {
    clearFilters: string;
    applyFilters: string;
    filtersToggle: string;
    previousPage: string;
    nextPage: string;
    navAriaLabel: string;
    pageAria: (page: number) => string;
    range: (params: {
      start: number;
      end: number;
      total: number;
      itemLabel: string;
      pluralSuffix: string;
    }) => string;
    pageOf: (params: { page: number; totalPages: number }) => string;
    resultItem: string;
  };
  bookingSidebar: {
    trustDemoCatalog: string;
    trustTransparentPricing: string;
    trustSupport: string;
    mobileConfigure: string;
    closeDrawer: string;
    decreaseGuests: string;
    increaseGuests: string;
  };
  checkout: {
    stepperAriaLabel: string;
    stepCart: string;
    stepRecap: string;
    stepPayment: string;
    stepRequest: string;
    stepConfirmation: string;
    stepCancelled: string;
    cartTitle: string;
    recapTitle: string;
    continueToRecap: string;
    backToCart: string;
    payWithStripe: string;
    requestBooking: string;
    requestSubmitting: string;
    stripeRedirecting: string;
    estimatedTotal: string;
    loading: string;
    authRequiredNext: string;
    authRequiredPayment: string;
    authRequiredRequest: string;
    invalidDraft: string;
    invalidDraftBack: string;
    invalidRecap: string;
    modifySelection: string;
    resumeSearch: string;
    stripeError: {
      authTitle: string;
      authDescription: string;
      authHint: string;
      networkTitle: string;
      networkHint: string;
      paymentTitle: string;
      paymentHint: string;
      genericTitle: string;
      genericHint: string;
      dismiss: string;
    };
    success: {
      title: string;
      titleConfirmed: string;
      subtitle: string;
      subtitleConfirmed: string;
      bookingIdLabel: string;
      statusLabel: string;
      statusConfirmed: string;
      statusPendingPayment: string;
      statusPendingHint: string;
      totalLabel: string;
      verifying: string;
      statusUnavailable: string;
      backHome: string;
      browseHotels: string;
      viewAccount: string;
      signOut: string;
      nextStepsTitle: string;
      nextStepEmail: string;
      nextStepAccount: string;
    };
    requestSuccess: {
      title: string;
      subtitle: string;
      bookingIdLabel: string;
      statusLabel: string;
      totalLabel: string;
      verifying: string;
      statusUnavailable: string;
      backHome: string;
      browseActivities: string;
      viewAccount: string;
      signOut: string;
      nextStepsTitle: string;
      nextStepContact: string;
      nextStepAccount: string;
    };
    manifest: {
      title: string;
      subtitle: string;
      travelerN: string;
      fullName: string;
      age: string;
      sex: string;
      sexUnspecified: string;
      sexM: string;
      sexF: string;
      sexOther: string;
      nationality: string;
      idNumber: string;
      conditions: string;
      conditionsPlaceholder: string;
      fullNameRequired: string;
    };
    cancel: {
      title: string;
      subtitle: string;
      backToCart: string;
      continueSearch: string;
    };
  };
  verticalSearch: {
    backHome: string;
    resultsTitle: string;
    exploreHint: string;
    forDestination: string;
    noResults: string;
    noResultsHint: string;
    continue: string;
    verticals: {
      hotels: string;
      flights: string;
      cars: string;
      cruises: string;
      tours: string;
    };
  };
  whyUs: {
    title: string;
    subtitle: string;
    learnMore: string;
    items: { title: string; description: string }[];
  };
  promo: {
    badge: string;
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
    loading: string;
    loadError: string;
    empty: string;
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
  activitiesMap: {
    title: string;
    subtitle: string;
    loading: string;
    loadError: string;
    empty: string;
    browseAll: string;
    mapAria: string;
    nextDate: string;
    viewActivity: string;
  };
  customerReviews: {
    title: string;
    subtitle: string;
    loadError: string;
    anonymous: string;
    carouselAria: string;
    prev: string;
    next: string;
    items: Array<{
      rating: number;
      title?: string;
      body: string;
      author: string;
    }>;
  };
  gapImpact: {
    title: string;
    subtitle: string;
    cta: string;
    programNameFallback: string;
  };
  footer: {
    tagline: string;
    learnMore: string;
    specialists: string;
    products: string;
    specialistLinks: {
      premium: string;
      flights: string;
      safaris: string;
      cruises: string;
      cars: string;
      packages: string;
    };
    newsletter: string;
    newsletterDesc: string;
    emailPlaceholder: string;
    newsletterSubmit: string;
    contact: string;
    location: string;
    privacy: string;
    about: string;
    aboutPages: string;
    gap: string;
    faq: string;
    designedBy: string;
  };
  hotels: {
    metaTitle: string;
    metaDescription: string;
    breadcrumbHome: string;
    breadcrumbHotels: string;
    breadcrumbHotelsDetail: string;
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
    galleryOpenLightbox: string;
    galleryClose: string;
    galleryPrevious: string;
    galleryNext: string;
    galleryCounter: (current: number, total: number) => string;
    amenitiesTitle: string;
    roomsTitle: string;
    descriptionTitle: string;
    calendarTitle: string;
    calendarLegendTitle: string;
    calendarLegendAvailable: string;
    calendarLegendSelected: string;
    calendarLegendUnavailable: string;
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
    guestSingular: string;
    guestPlural: string;
    perRoomPriceNote: string;
    noRoomsForGuests: string;
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
    breadcrumbFlightsDetail: string;
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
    layoverSingular: string;
    layoverPlural: string;
    layoverDuration: string;
    departure: string;
    arrival: string;
    itineraryTitle: string;
    classesTitle: string;
    selectClass: string;
    selectClassHint: string;
    selectedClass: string;
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
    galleryAria: string;
    galleryOpenLightbox: string;
    galleryClose: string;
    galleryPrevious: string;
    galleryNext: string;
    galleryCounter: (current: number, total: number) => string;
  };
  cars: {
    metaTitle: string;
    metaDescription: string;
    breadcrumbHome: string;
    breadcrumbCars: string;
    breadcrumbCarsDetail: string;
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
    infoTitle: string;
    equipmentTitle: string;
    conditionsTitle: string;
    rentalPeriod: string;
    imagePlaceholderAria: string;
    specs: {
      seats: string;
      airConditioningYes: string;
      airConditioningNo: string;
      listAria: string;
    };
    transmission: {
      manual: string;
      automatic: string;
    };
    fuel: {
      petrol: string;
      diesel: string;
      hybrid: string;
      electric: string;
    };
    equipment: {
      airConditioning: string;
      bluetooth: string;
      gps: string;
      usb: string;
    };
    conditionItems: {
      minAge: string;
      deposit: string;
      mileage: string;
      insurance: string;
      fuelPolicy: string;
    };
    galleryAria: string;
    galleryOpenLightbox: string;
    galleryClose: string;
    galleryPrevious: string;
    galleryNext: string;
    galleryCounter: (current: number, total: number) => string;
  };
  cruises: {
    metaTitle: string;
    metaDescription: string;
    breadcrumbHome: string;
    breadcrumbCruises: string;
    breadcrumbCruisesDetail: string;
    heroTitle: string;
    heroSubtitle: string;
    resultsFor: string;
    anyRoute: string;
    sailingsFound: string;
    sortBy: string;
    sortRecommended: string;
    sortPriceLow: string;
    sortPriceHigh: string;
    loading: string;
    loadError: string;
    retry: string;
    modifySearch: string;
    startDate: string;
    endDate: string;
    sailFrom: string;
    sailTo: string;
    guests: string;
    guestSingular: string;
    guestPlural: string;
    noResults: string;
    noResultsHint: string;
    noSearchParams: string;
    noSearchParamsHint: string;
    browseAllHint: string;
    startSearch: string;
    backHome: string;
    viewDetails: string;
    bookNow: string;
    fromPrice: string;
    perGuest: string;
    departure: string;
    arrival: string;
    itineraryTitle: string;
    dayLabel: string;
    portArrival: string;
    portDeparture: string;
    cabinsTitle: string;
    selectCabin: string;
    selectCabinHint: string;
    selectedCabin: string;
    capacityLabel: string;
    deckLabel: string;
    deck: {
      main: string;
      upper: string;
      promenade: string;
    };
    cabinsLeft: string;
    unavailable: string;
    insufficientCabins: string;
    totalCruise: string;
    reserveSection: string;
    notFound: string;
    notFoundHint: string;
    backToList: string;
    shipLabel: string;
    cruiseLineLabel: string;
    nightSingular: string;
    nightPlural: string;
    searchRequired: string;
    endAfterStart: string;
    galleryAria: string;
    galleryOpenLightbox: string;
    galleryClose: string;
    galleryPrevious: string;
    galleryNext: string;
    galleryCounter: (current: number, total: number) => string;
  };
  activities: {
    metaTitle: string;
    metaDescription: string;
    breadcrumbHome: string;
    breadcrumbActivities: string;
    heroTitle: string;
    heroSubtitle: string;
    resultsFor: string;
    anyDestination: string;
    activitiesFound: string;
    sortBy: string;
    sortRecommended: string;
    sortPriceLow: string;
    sortPriceHigh: string;
    loading: string;
    loadError: string;
    destinationsLoading: string;
    destinationsLoadError: string;
    retry: string;
    modifySearch: string;
    destination: string;
    date: string;
    participants: string;
    participantSingular: string;
    participantPlural: string;
    noResults: string;
    noResultsHint: string;
    noSearchParams: string;
    noSearchParamsHint: string;
    browseHint: string;
    noUpcomingSlot: string;
    backHome: string;
    viewDetails: string;
    bookNow: string;
    fromPrice: string;
    perParticipant: string;
    schedulesTitle: string;
    selectSchedule: string;
    selectScheduleHint: string;
    placesLeft: string;
    unavailable: string;
    insufficientPlaces: string;
    totalActivity: string;
    reserveSection: string;
    notFound: string;
    notFoundHint: string;
    backToList: string;
    providerLabel: string;
    durationLabel: string;
    difficultyLabel: string;
    hourSingular: string;
    hourPlural: string;
    minuteSingular: string;
    minutePlural: string;
    searchRequired: string;
    descriptionTitle: string;
    nextSlot: string;
    schedulesAvailable: string;
    noSchedulesTitle: string;
    noSchedulesHint: string;
    selectedScheduleLabel: string;
    difficultyEasy: string;
    difficultyModerate: string;
    difficultyHard: string;
    difficultyExpert: string;
    ratingAria: string;
    reviewCount: string;
    galleryAria: string;
    galleryOpenLightbox: string;
    galleryClose: string;
    galleryPrevious: string;
    galleryNext: string;
    galleryCounter: (current: number, total: number) => string;
    itineraryTitle: string;
    itineraryMapAria: string;
    itineraryStopLabel: string;
    itineraryStopDuration: string;
  };
  packages: {
    metaTitle: string;
    metaDescription: string;
    breadcrumbHome: string;
    breadcrumbPackages: string;
    heroTitle: string;
    heroSubtitle: string;
    cardBadge: string;
    resultsFor: string;
    packagesFound: string;
    sortBy: string;
    sortRecommended: string;
    sortPriceLow: string;
    sortPriceHigh: string;
    displayModeLabel: string;
    displayModeCards: string;
    displayModeList: string;
    displayModeCompact: string;
    loading: string;
    loadingDetail: string;
    loadError: string;
    retry: string;
    modifySearch: string;
    searchLabel: string;
    searchPlaceholder: string;
    searchSubmit: string;
    browseHint: string;
    noResults: string;
    noResultsHint: string;
    backHome: string;
    viewDetails: string;
    bookNow: string;
    packagePrice: string;
    discountBadge: string;
    discountSummary: string;
    itemsIncluded: string;
    itemsTitle: string;
    noItems: string;
    viewProduct: string;
    itemDetailClose: string;
    itemDetailLoading: string;
    itemDetailError: string;
    itemDetailPriceLabel: string;
    itemDetailGenericHint: string;
    itemDetailViewFullPage: string;
    pricingTitle: string;
    youSave: string;
    configurePackage: string;
    activityConfigureHint: string;
    mixedConfigureHint: string;
    configureTitle: string;
    selectDateHint: string;
    configureOnProduct: string;
    configureOnProductHint: string;
    mixedCheckoutDisabled: string;
    loadingActivitySchedules: string;
    activitySchedulesError: string;
    noActivitySchedules: string;
    schedulesProgress: string;
    itemsProgress: string;
    allSchedulesRequired: string;
    allItemsRequired: string;
    selectStayDatesHint: string;
    loadingPropertyRooms: string;
    propertyRoomsError: string;
    selectDepartureDateHint: string;
    loadingFlightClasses: string;
    flightClassesError: string;
    selectRentalDatesHint: string;
    loadingVehicleAvailability: string;
    vehicleAvailabilityError: string;
    vehicleDatesConfirmed: string;
    selectSailingHint: string;
    sailingIdLabel: string;
    sailingIdPlaceholder: string;
    loadingCruiseCabins: string;
    cruiseCabinsError: string;
    addToCart: string;
    packageCartInvalid: string;
    modifySelection: string;
    departureDateLabel: string;
    returnDateLabel: string;
    travelersLabel: string;
    durationDaysLabel: string;
    packageBookingHint: string;
    selectDepartureHint: string;
    includedServicesTitle: string;
    resolvingPackage: string;
    resolvingItem: string;
    itemAutoResolved: string;
    itemUnavailable: string;
    itemMissing: string;
    itemResolveError: string;
    someItemsUnavailable: string;
    someItemsMissing: string;
    notFound: string;
    notFoundHint: string;
    backToList: string;
    itemTypes: {
      property: string;
      flight: string;
      vehicle: string;
      cruise: string;
      activity: string;
    };
    galleryAria: string;
    galleryOpenLightbox: string;
    galleryClose: string;
    galleryPrevious: string;
    galleryNext: string;
    galleryCounter: (current: number, total: number) => string;
    attachmentsTitle: string;
    attachmentsCount: string;
    openAttachment: string;
    attachmentImageAlt: string;
    attachmentFallbackName: string;
    descriptionShowMore: string;
    descriptionShowLess: string;
    stepOverview: string;
    stepConfigure: string;
    stepBook: string;
    stepRecap: string;
    stepOverviewShort: string;
    stepConfigureShort: string;
    stepBookShort: string;
    stepRecapShort: string;
    compositionStepperAria: string;
    configureProgress: string;
    bookingReadyHint: string;
    bookingPendingHint: string;
    assistedBookingServicesHint: string;
    assistedItemPendingSchedule: string;
    travelerSingular: string;
    travelerPlural: string;
    estimatedPackageTotal: string;
    startConfiguration: string;
    stepBack: string;
    viewRecap: string;
    recapTitle: string;
    recapHint: string;
    configureSchedulesTitle: string;
    itemConfigured: string;
    itemPending: string;
    recapActivityLine: string;
    recapPropertyLine: string;
    recapFlightLine: string;
    recapVehicleLine: string;
    recapCruiseLine: string;
    estimatedSavings: string;
    itineraryMapTitle: string;
    itineraryMapAria: string;
    itineraryMapLegendTitle: string;
    itineraryMapLegendPoints: string;
    itineraryMapPartialHint: string;
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
      emptyDescription: string;
      emptyBrowse: string;
      emptyFilter: string;
      reference: string;
      date: string;
      status: string;
      total: string;
      view: string;
      back: string;
      notFound: string;
      loadError: string;
      filterAll: string;
      filterConfirmed: string;
      filterPending: string;
      filterCancelled: string;
      filterAria: string;
      actionRequired: string;
      leaveReviewCta: string;
      reviewPrompt: string;
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
        reviewCharCount: string;
        reviewPublished: string;
        reviewStarAria: string;
        timelineTitle: string;
        timelinePlaceholder: string;
        timelineStepCreated: string;
        timelineStepPending: string;
        timelineStepConfirmed: string;
        timelineStepCancelled: string;
        timelineStepRefunded: string;
        timelineStepRequest: string;
        timelineStepValidation: string;
        timelineStepDiscussion: string;
        timelineStepPayment: string;
        timelineCurrent: string;
        timelineUpcoming: string;
        proceedToPayment: string;
        paymentInvitePending: string;
        identityDocuments: {
          title: string;
          subtitle: string;
          empty: string;
          documentType: string;
          file: string;
          fileHint: string;
          upload: string;
          uploading: string;
          uploadError: string;
          fileTooLarge: string;
          view: string;
          viewing: string;
          viewError: string;
          statusLabel: string;
          types: {
            passport: string;
            national_id: string;
            drivers_license: string;
            other: string;
          };
          statuses: {
            pending_review: string;
            approved: string;
            resubmit_requested: string;
            rejected: string;
          };
        };
        manifest: {
          title: string;
          subtitle: string;
          empty: string;
          loading: string;
          loadError: string;
          addTraveler: string;
          addTitle: string;
          editTitle: string;
          formHint: string;
          fullNameRequired: string;
          save: string;
          saving: string;
          saveError: string;
          edit: string;
          delete: string;
          deleting: string;
          deleteError: string;
          deleteTitle: string;
          deleteDescription: string;
          cancel: string;
          sex: {
            unspecified: string;
            M: string;
            F: string;
            other: string;
          };
          fields: {
            fullName: string;
            age: string;
            sex: string;
            nationality: string;
            idNumber: string;
            conditions: string;
            conditionsPlaceholder: string;
            comment: string;
            commentPlaceholder: string;
            other: string;
            otherPlaceholder: string;
          };
        };
        messages: {
          title: string;
          subtitle: string;
          loading: string;
          empty: string;
          threadAria: string;
          authorStaff: string;
          authorCustomer: string;
          replyTitle: string;
          replyLabel: string;
          replyPlaceholder: string;
          sendReply: string;
          loadError: string;
          sendError: string;
          newStaffMessageToast: string;
          fabAriaLabel: string;
          fabAriaLabelWithUnread: string;
          pickerTitle: string;
          pickerSubtitle: string;
          pickerEmpty: string;
          pickerLoading: string;
          backToReservations: string;
          viewBooking: string;
          unreadBadge: string;
        };
        guideReviews: {
          sectionTitle: string;
          sectionHint: string;
          rolePrimary: string;
          roleSecondary: string;
          leaveReview: string;
          leaveReviewHint: string;
          submitReview: string;
          yourReview: string;
          reviewPublished: string;
        };
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
  blog: {
    metaTitle: string;
    metaDescription: string;
    heroTitle: string;
    heroSubtitle: string;
    readMore: string;
    loading: string;
    loadError: string;
    retry: string;
    noResults: string;
    noResultsHint: string;
    localeFallback: string;
    backToBlog: string;
    publishedOn: string;
    breadcrumbHome: string;
    breadcrumbBlog: string;
  };
  about: {
    heroTitle: string;
    heroSubtitle: string;
    sidebarAria: string;
    breadcrumbHome: string;
    breadcrumbAbout: string;
    loading: string;
    loadError: string;
    emptyPage: string;
    emptyPageHint: string;
    localeFallback: string;
    nav: {
      whoWeAre: string;
      history: string;
      team: string;
      howWeWork: string;
      governance: string;
      reports: string;
      responsibility: string;
      media: string;
      contact: string;
    };
    team: {
      empty: string;
    };
    timeline: {
      intro: string;
      empty: string;
      readMore: string;
      sidebarAria: string;
    };
    resources: {
      empty: string;
      download: string;
      openLink: string;
      publishedOn: string;
    };
    contact: {
      subtitle: string;
      infoTitle: string;
      formTitle: string;
      formSubtitle: string;
    };
    meta: Record<
      | 'whoWeAre'
      | 'history'
      | 'team'
      | 'howWeWork'
      | 'governance'
      | 'reports'
      | 'responsibility'
      | 'media'
      | 'contact',
      { title: string; description: string }
    >;
  };
  comingSoon: {
    badge: string;
    title: string;
    siteBody: string;
    body: string;
    backToSearch: string;
    backHome: string;
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
    homeTitle: 'R?servez votre voyage en Afrique',
    homeDescription:
      'Comparez h?tels, vols et exp?riences en Afrique. Recherchez des h?bergements et planifiez votre prochain s?jour avec Africa Tourism Gate.',
  },
  nav: {
    home: 'Accueil',
    about: '? propos',
    gallery: 'Galerie',
    pages: 'Nos Produits',
    blog: 'Blog',
    contact: 'Contacts',
    hotels: 'H?tels',
    flights: 'Vols',
    cars: 'Location de Voitures',
    cruises: 'Croisi?res',
    tours: 'Tours',
    mainAria: 'Navigation principale',
    mobileAria: 'Navigation mobile',
    menu: 'Menu',
    myAccount: 'Mon compte',
    signIn: 'Connexion',
    signOut: 'Se d?connecter',
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
          'Votre passerelle vers les plus belles destinations africaines. Explorez, r?servez et vivez des exp?riences inoubliables.',
      },
      {
        subtitle: 'Safari de 7 jours',
        title: 'MASAI MARA MAGIQUE',
        description:
          "D?couvrez la migration des gnous et les Big Five dans la r?serve la plus c?l?bre d'Afrique.",
      },
      {
        subtitle: '5 jours ?',
        title: 'MARRAKECH (Perle du Sud)',
        description:
          'Plongez dans les souks, les riads et les saveurs ?pic?es de la ville ocre du Maroc.',
      },
      {
        subtitle: 'Croisi?re de 12 jours',
        title: 'ZANZIBAR ? MADAGASCAR',
        description:
          "Navigation c?ti?re le long de l'Oc?an Indien ? plages de r?ve et faune unique.",
      },
    ],
    prev: 'Diapositive pr?c?dente',
    next: 'Diapositive suivante',
    goToSlide: 'Aller ? la diapositive {n}',
  },
  search: {
    tablistAria: 'Type de recherche',
    tabs: { flights: 'Vols', hotels: 'H?tels', cars: 'Voitures', cruises: 'Croisi?res', tours: 'Tours' },
    search: 'Rechercher',
    departDate: 'Date d?part',
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
    startDate: 'Date d?but',
    endDate: 'Date fin',
    sailTo: 'Naviguer vers :',
    sailFrom: 'Naviguer de :',
    ship: 'Navire :',
    days: 'Jours :',
    cityPh: 'Ville',
    destinationPh: 'Destination ou h?tel',
    selectPh: 'S?lectionner',
    countryPh: 'Pays',
    locationPh: 'Lieu',
    allDestinations: 'Toutes destinations',
    allPorts: 'Tous les ports',
    shipPh: 'Navire',
    departCityPh: 'Ville de d?part',
    destinationPh2: 'Destination',
    passengers: 'Passagers',
    airportPh: 'A?roport',
    flightRequired: 'Indiquez le d?part, la destination et la date de d?part.',
    flightReturnAfterDeparture: 'La date de retour doit ?tre apr?s la date de d?part.',
    flightReturnRequired: 'Indiquez la date de retour pour un aller-retour.',
    flightSameAirport: 'Le d?part et la destination doivent ?tre diff?rents.',
    swapAirports: 'Inverser d?part et arriv?e',
    tripTypeAria: 'Type de vol',
    oneWay: 'Aller simple',
    roundTrip: 'Aller-retour',
    viewAllFlights: 'Voir tous les vols disponibles',
    viewAllHotels: 'Voir tous les h?tels',
    carsRequired: 'Indiquez la ville, la date de prise en charge et la date de retour.',
    carsReturnAfterPickup: 'La date de retour doit ?tre apr?s la date de prise en charge.',
    carsDurationHint: 'S?lectionnez les dates pour voir la dur?e',
    pickupLocationPh: 'Ville ou a?roport',
    viewAllCars: 'Voir toutes les locations',
    cruisesRequired: 'Indiquez les ports de d?part et d\'arriv?e ainsi que la plage de dates.',
    cruisesEndAfterStart: 'La date de fin doit ?tre apr?s la date de d?but.',
    cruisesSamePort: 'Les ports de d?part et d\'arriv?e doivent ?tre diff?rents.',
    viewAllCruises: 'Voir toutes les croisi?res',
    viewAllActivities: 'Voir toutes les activit?s',
    toursRequired: 'Indiquez une date.',
    participants: 'Participants',
    roomTypes: ['Chambre Double', 'Chambre Simple', 'Suite'],
    countries: ['Kenya', 'Tanzanie', 'Maroc', 'Afrique du Sud', 'Rwanda', 'RDC'],
    locations: ['A?roport', 'Centre-ville', 'Gare'],
  },
  listing: {
    clearFilters: 'Effacer les filtres',
    applyFilters: 'Appliquer',
    filtersToggle: 'Filtres',
    previousPage: 'Page pr?c?dente',
    nextPage: 'Page suivante',
    navAriaLabel: 'Pagination des r?sultats',
    pageAria: (page) => `Page ${page}`,
    range: ({ start, end, total, itemLabel, pluralSuffix }) =>
      `${start}?${end} sur ${total} ${itemLabel}${pluralSuffix}`,
    pageOf: ({ page, totalPages }) => `page ${page} / ${totalPages}`,
    resultItem: 'r?sultat',
  },
  bookingSidebar: {
    trustDemoCatalog:
      'Tarifs indicatifs ? la r?servation en ligne arrive bient?t.',
    trustTransparentPricing: 'Montant affich? sans frais cach?s.',
    trustSupport: 'Une question ? Notre ?quipe vous accompagne.',
    mobileConfigure: 'Options',
    closeDrawer: 'Fermer',
    decreaseGuests: 'Diminuer le nombre de voyageurs',
    increaseGuests: 'Augmenter le nombre de voyageurs',
  },
  checkout: {
    stepperAriaLabel: '?tapes de r?servation',
    stepCart: 'Panier',
    stepRecap: 'R?cap',
    stepPayment: 'Paiement',
    stepRequest: 'Demande',
    stepConfirmation: 'Confirmation',
    stepCancelled: 'Annul?',
    cartTitle: 'Panier r?servation',
    recapTitle: 'Recapitulatif',
    continueToRecap: 'Continuer vers r?cap',
    backToCart: 'Retour panier',
    payWithStripe: 'Payer avec Stripe',
    requestBooking: 'Demander une r?servation',
    requestSubmitting: 'Envoi de la demande?',
    stripeRedirecting: 'Redirection Stripe?',
    estimatedTotal: 'Total estim?',
    loading: 'Chargement?',
    authRequiredNext: 'Connexion client requise au prochain ?cran.',
    authRequiredPayment: 'Connexion client requise pour lancer Stripe Checkout.',
    authRequiredRequest: 'Connexion client requise pour envoyer votre demande.',
    invalidDraft: 'Donn?es de r?servation incompl?tes. Reprenez depuis une fiche produit.',
    invalidDraftBack: 'Retour aux h?bergements',
    invalidRecap: 'Donnees de reservation invalides. Revenez au panier.',
    modifySelection: 'Modifier la s?lection',
    resumeSearch: 'Reprendre la recherche',
    stripeError: {
      authTitle: 'Connexion requise',
      authDescription: 'Authentification requise pour continuer vers le paiement.',
      authHint: 'Connectez-vous puis relancez le paiement depuis le r?capitulatif.',
      networkTitle: 'Connexion interrompue',
      networkHint: 'V?rifiez votre r?seau et r?essayez dans quelques instants.',
      paymentTitle: 'Paiement refus?',
      paymentHint: 'V?rifiez votre carte ou essayez un autre moyen de paiement.',
      genericTitle: 'Paiement impossible',
      genericHint: 'R?essayez ou revenez au panier pour v?rifier votre s?lection.',
      dismiss: 'Fermer',
    },
    success: {
      title: 'Confirmation en cours',
      titleConfirmed: 'R?servation confirm?e',
      subtitle:
        'Votre paiement Stripe est re?u. Nous finalisons la confirmation de votre r?servation?',
      subtitleConfirmed:
        'Votre paiement a ?t? re?u et votre r?servation est confirm?e.',
      bookingIdLabel: 'R?f. r?servation :',
      statusLabel: 'Statut :',
      statusConfirmed: 'Confirm?e',
      statusPendingPayment: 'En attente de paiement',
      statusPendingHint:
        'La confirmation prend plus de temps que pr?vu. Consultez votre compte dans quelques instants ou contactez le support si le statut ne change pas.',
      totalLabel: 'Total :',
      verifying: 'V?rification du statut en cours?',
      statusUnavailable:
        'Statut d?taill? indisponible pour le moment. Rechargez la page dans quelques instants.',
      backHome: 'Retour accueil',
      browseHotels: 'Voir les h?tels',
      viewAccount: 'Mon compte',
      signOut: 'Se d?connecter',
      nextStepsTitle: 'Prochaines ?tapes',
      nextStepEmail: 'Un e-mail de confirmation vous sera envoy? sous peu.',
      nextStepAccount: 'Consultez vos r?servations depuis votre espace compte.',
    },
    requestSuccess: {
      title: 'Demande envoy?e',
      subtitle:
        'Votre demande de r?servation a bien ?t? transmise ? notre ?quipe. Vous serez contact? sous 24 ? 48 h.',
      bookingIdLabel: 'R?f. demande :',
      statusLabel: 'Statut :',
      totalLabel: 'Total estim? :',
      verifying: 'V?rification du statut en cours?',
      statusUnavailable:
        'Statut d?taill? indisponible pour le moment. Rechargez la page dans quelques instants.',
      backHome: 'Retour accueil',
      browseActivities: 'Voir les activit?s',
      viewAccount: 'Mon compte',
      signOut: 'Se d?connecter',
      nextStepsTitle: 'Prochaines ?tapes',
      nextStepContact: 'Notre ?quipe validera votre demande et vous contactera par e-mail.',
      nextStepAccount: 'Suivez l?avancement depuis votre espace compte.',
    manifest: {
      title: 'Informations des voyageurs',
      subtitle: 'Renseignez les informations de chaque voyageur. Seul le nom complet est obligatoire.',
      travelerN: 'Voyageur {n}',
      fullName: 'Nom complet',
      age: '?ge',
      sex: 'Genre',
      sexUnspecified: 'Non pr?cis?',
      sexM: 'Homme',
      sexF: 'Femme',
      sexOther: 'Autre',
      nationality: 'Nationalit?',
      idNumber: "N? pi?ce d'identit?",
      conditions: 'Conditions m?dicales',
      conditionsPlaceholder: 'Allergies, traitements, besoins particuliers?',
      fullNameRequired: 'Le nom complet du voyageur {n} est obligatoire.',
    },
    cancel: {
      title: 'Paiement annule',
      subtitle:
        "Aucun debit n'a ete confirme. Vous pouvez reprendre votre reservation quand vous voulez.",
      backToCart: 'Revenir au panier',
      continueSearch: 'Continuer la recherche',
    },
  },
  verticalSearch: {
    backHome: 'Retour ? l\'accueil',
    resultsTitle: 'R?sultats',
    exploreHint: 'Explorez les options disponibles.',
    forDestination: 'R?sultats pour {destination}.',
    noResults: 'Aucun r?sultat pour cette recherche.',
    noResultsHint: 'Modifiez vos crit?res ou revenez ? l\'accueil.',
    continue: 'Continuer',
    verticals: {
      hotels: 'H?bergements',
      flights: 'Vols',
      cars: 'Locations de v?hicules',
      cruises: 'Croisi?res',
      tours: 'Activit?s & tours',
    },
  },
  whyUs: {
    title: 'Pourquoi nous choisir',
    subtitle:
      "Africa Tourism Gate vous offre une exp?rience de voyage unique avec les meilleurs services et un accompagnement personnalis? pour d?couvrir l'Afrique.",
    learnMore: 'En savoir plus',
    items: [
      {
        title: 'Voyages Incroyables',
        description:
          'Des destinations uniques s?lectionn?es avec soin ? travers tout le continent africain pour des exp?riences inoubliables.',
      },
      {
        title: 'D?couvertes',
        description:
          "Explorez la richesse culturelle, les paysages ?poustouflants et la faune sauvage de l'Afrique.",
      },
      {
        title: 'R?servation Facile',
        description:
          'R?servez vos h?bergements, vols et activit?s en quelques clics gr?ce ? notre plateforme intuitive.',
      },
      {
        title: 'Support 24/7',
        description:
          'Notre ?quipe de sp?cialistes du voyage est disponible jour et nuit pour vous accompagner.',
      },
    ],
  },
  promo: {
    badge: 'Offre sp?ciale',
    title: 'Safari au Kenya ? Forfait Vacances',
    description:
      "D?couvrez les plaines infinies du Masai Mara, observez les Big Five dans leur habitat naturel et profitez d'h?bergements de luxe au c?ur de la savane. Une exp?rience qui changera votre vision de l'Afrique.",
    priceFrom: '? partir de :',
    perPerson: '/personne',
    details: 'D?tails',
  },
  destinations: {
    title: 'Destinations Populaires',
    subtitle:
      'D?couvrez nos destinations africaines les plus pris?es. Des safaris aux plages paradisiaques, chaque voyage est une aventure unique.',
    reviews: 'Avis',
    details: 'D?tails',
    loading: 'Chargement des destinations?',
    loadError: 'Impossible de charger les destinations.',
    empty: 'Aucune destination mise en avant pour le moment.',
    items: [
      {
        title: 'Safari au Masai Mara',
        subtitle: 'De Nairobi, Kenya',
        description: 'Safari de 7 jours au d?part de Nairobi. Big Five et migration des gnous.',
      },
      {
        title: 'Escapade au Cap',
        subtitle: 'Le Cap, Afrique du Sud',
        description: 'Explorez Table Mountain, le Cap de Bonne Esp?rance et les vignobles.',
      },
      {
        title: 'M?dina de Marrakech',
        subtitle: '5 jours, Maroc',
        description: 'Perdez-vous dans les souks, savourez les ?pices et dormez dans un riad.',
      },
      {
        title: 'Plages de Zanzibar',
        subtitle: 'Tanzanie, 6 jours',
        description: "Sable blanc, eaux turquoise et ?pices ? le paradis de l'Oc?an Indien.",
      },
    ],
  },
  customers: {
    title: 'Clients Satisfaits',
    subtitle: 'La satisfaction de nos voyageurs est notre priorit? absolue.',
    p1: "Depuis notre lancement, nous avons accompagn? des milliers de voyageurs dans la d?couverte de l'Afrique. Notre engagement envers un service d'excellence et des exp?riences authentiques nous a valu la confiance de notre communaut? grandissante.",
    p2: "Chaque retour positif nous motive ? continuer d'am?liorer nos services et ? proposer des voyages toujours plus m?morables ? travers le continent.",
    clients: 'Clients',
    imageAlt: 'Voyageurs heureux en Afrique',
    bars: { flights: 'Vols', hotels: 'H?tels', cars: 'Voitures', cruises: 'Croisi?res' },
  },
  activitiesMap: {
    title: 'Activit?s ? venir',
    subtitle:
      'Explorez les exp?riences disponibles ? travers l\'Afrique. Cliquez sur un point pour voir le d?tail et r?server.',
    loading: 'Chargement de la carte?',
    loadError: 'Impossible de charger les activit?s sur la carte.',
    empty: 'Aucune activit? disponible avec localisation pour le moment.',
    browseAll: 'Voir toutes les activit?s',
    mapAria: 'Carte des activit?s disponibles en Afrique',
    nextDate: 'Prochaine date',
    viewActivity: 'Voir l\'activit?',
  },
  customerReviews: {
    title: 'Avis de nos clients',
    subtitle:
      'D?couvrez ce que nos voyageurs disent de leurs exp?riences avec Africa Tourism Gate.',
    loadError: 'Impossible de charger les avis en ligne. Affichage des t?moignages par d?faut.',
    anonymous: 'Voyageur',
    carouselAria: 'Carrousel des avis clients',
    prev: 'Avis pr?c?dent',
    next: 'Avis suivant',
    items: [
      {
        rating: 5,
        title: 'Safari inoubliable',
        body: 'Organisation impeccable du d?but ? la fin. L\'?quipe a su r?pondre ? toutes nos attentes pour notre premier safari en Afrique de l\'Est.',
        author: 'Marie L.',
      },
      {
        rating: 5,
        body: 'R?servation simple, support r?actif et h?bergements de qualit?. Je recommande vivement pour d?couvrir l\'Afrique en toute s?r?nit?.',
        author: 'Thomas K.',
      },
      {
        rating: 4,
        title: 'Tr?s belle exp?rience',
        body: 'Des activit?s vari?es et des guides passionn?s. Nous avons ador? notre s?jour ? Zanzibar et le suivi personnalis? de l\'agence.',
        author: 'Sophie M.',
      },
      {
        rating: 5,
        body: 'Une plateforme fiable pour planifier un voyage en Afrique. Tout s\'est d?roul? comme pr?vu, avec une excellente communication.',
        author: 'David R.',
      },
    ],
  },
  gapImpact: {
    title: 'Notre impact',
    subtitle: 'D?couvrez les r?sultats concrets du programme GAP en faveur des communaut?s et de la conservation.',
    cta: 'D?couvrir {programName}',
    programNameFallback: 'GAP',
  },
  footer: {
    tagline:
      'Votre passerelle vers les meilleures exp?riences de voyage en Afrique. D?couvrez des destinations uniques et r?servez en toute confiance.',
    learnMore: 'En savoir plus',
    specialists: 'Sp?cialistes Voyage',
    products: 'Nos Produits',
    specialistLinks: {
      premium: 'H?bergements Premium',
      flights: 'Vols Premi?re Classe',
      safaris: 'Safaris & Tours',
      cruises: 'Croisi?res C?ti?res',
      cars: 'Location de Voitures',
      packages: 'Forfaits',
    },
    newsletter: 'Newsletter',
    newsletterDesc: 'Inspiration, id?es de voyages, bons plans et actualit?s.',
    emailPlaceholder: 'Adresse email',
    newsletterSubmit: 'OK',
    contact: 'Contact',
    location: 'Kinshasa, RD Congo',
    privacy: 'Politique de Confidentialit?',
    about: '? propos',
    aboutPages: '? propos',
    gap: 'GAP',
    faq: 'FAQ',
    designedBy: 'Con?u par',
  },
  hotels: {
    metaTitle: 'H?bergements en Afrique',
    metaDescription:
      'Comparez h?tels, lodges et resorts en Afrique. Trouvez le s?jour id?al avec Africa Tourism Gate.',
    breadcrumbHome: 'Accueil',
    breadcrumbHotels: 'H?bergements',
    breadcrumbHotelsDetail: 'H?tels',
    heroTitle: 'H?bergements d\'exception en Afrique',
    heroSubtitle:
      'Lodges de safari, riads authentiques et resorts en bord de mer ? s?lectionn?s par nos experts voyage.',
    resultsFor: 'R?sultats pour',
    allAfrica: 'Toute l\'Afrique',
    propertiesFound: '?tablissements',
    sortBy: 'Trier par',
    sortRecommended: 'Recommand?s',
    sortPriceLow: 'Prix croissant',
    sortPriceHigh: 'Prix d?croissant',
    sortRating: 'Meilleures notes',
    loading: 'Recherche des h?bergements?',
    loadError: "Impossible de charger les r?sultats. V?rifiez que l'API est d?marr?e.",
    retry: 'R?essayer',
    filters: 'Filtres',
    filterStars: '?toiles',
    filterType: 'Type',
    types: {
      hotel: 'H?tel',
      resort: 'Resort',
      apartment: 'Appartement',
      villa: 'Villa',
      hostel: 'Auberge',
      other: 'Autre',
    },
    perNight: '/ nuit',
    viewDetails: 'Voir d?tails',
    bookNow: 'R?server',
    freeCancel: 'Annulation gratuite',
    amenities: {
      wifi: 'Wi-Fi',
      pool: 'Piscine',
      breakfast: 'Petit-d?jeuner',
      spa: 'Spa',
      parking: 'Parking',
    },
    excellent: 'Exceptionnel',
    veryGood: 'Tr?s bien',
    modifySearch: 'Modifier la recherche',
    checkIn: 'Arriv?e',
    checkOut: 'D?part',
    guests: 'Voyageurs',
    noResults: 'Aucun h?bergement pour ces crit?res',
    noResultsHint: '?largissez votre recherche ou explorez toutes nos destinations.',
    backHome: 'Retour ? l\'accueil',
    previewNotice:
      'Prix affich?s : minimum par nuit pour votre s?jour. La r?servation en ligne arrive bient?t.',
    stars: '?toiles',
    allTypes: 'Tous les types',
    allStars: 'Toutes',
    reviews: 'avis',
    featuredBadge: 'Coup de c?ur',
    detailMetaDescription: 'R?servez votre s?jour ? {name}. Galerie, ?quipements et chambres.',
    galleryAria: 'Galerie photos',
    galleryOpenLightbox: 'Agrandir la photo',
    galleryClose: 'Fermer la galerie',
    galleryPrevious: 'Photo pr?c?dente',
    galleryNext: 'Photo suivante',
    galleryCounter: (current, total) => `Photo ${current} sur ${total}`,
    amenitiesTitle: '?quipements',
    roomsTitle: 'Chambres',
    descriptionTitle: 'Description',
    calendarTitle: 'Disponibilit?s et tarifs',
    calendarLegendTitle: 'L?gende',
    calendarLegendAvailable: 'Disponible',
    calendarLegendSelected: 'Dates s?lectionn?es',
    calendarLegendUnavailable: 'Indisponible',
    selectRoom: 'Choisir cette chambre',
    selectRoomHint: 'S?lectionnez une chambre pour r?server.',
    totalStay: 'Total s?jour',
    nightsLabel: 'nuits',
    nightSingular: 'nuit',
    nightPlural: 'nuits',
    unavailable: 'Indisponible',
    updateDates: 'Modifier les dates',
    notFound: 'H?bergement introuvable',
    notFoundHint: "Cet ?tablissement n'existe pas ou n'est plus disponible.",
    backToList: 'Retour aux r?sultats',
    prevMonth: 'Mois pr?c?dent',
    nextMonth: 'Mois suivant',
    fromPrice: '? partir de',
    selectDatesHint: "Choisissez vos dates d'arriv?e et de d?part.",
    guestSingular: '1 voyageur',
    guestPlural: '{n} voyageurs',
    perRoomPriceNote: 'Tarif par chambre (non multipli? par personne)',
    noRoomsForGuests: 'Aucune chambre disponible pour {n} voyageurs.',
    maxGuests: "jusqu'? {n} voyageurs",
    bedConfig: 'Literie',
    reserveSection: 'R?server',
    guestRating: 'Note clients',
    reviewsTitle: 'Avis des voyageurs',
    noReviews: 'Aucun avis pour le moment.',
    reviewsLoading: 'Chargement des avis?',
    reviewsLoadError: 'Impossible de charger les avis.',
    loadMoreReviews: "Afficher plus d'avis",
    anonymousGuest: 'Voyageur',
  },
  flights: {
    metaTitle: 'Vols en Afrique',
    metaDescription:
      'Comparez et r?servez des vols vers les principales destinations africaines avec Africa Tourism Gate.',
    breadcrumbHome: 'Accueil',
    breadcrumbFlights: 'Vols',
    breadcrumbFlightsDetail: 'Vols',
    heroTitle: 'Vols vers l\'Afrique',
    heroSubtitle:
      'Comparez les compagnies, horaires et tarifs pour votre prochain voyage continental.',
    resultsFor: 'R?sultats pour',
    anyRoute: 'Toutes les routes',
    flightsFound: 'vols',
    sortBy: 'Trier par',
    sortRecommended: 'Recommand?s',
    sortPriceLow: 'Prix croissant',
    sortPriceHigh: 'Prix d?croissant',
    sortDuration: 'Dur?e la plus courte',
    loading: 'Recherche des vols?',
    loadError: "Impossible de charger les vols. V?rifiez que l'API est d?marr?e.",
    retry: 'R?essayer',
    modifySearch: 'Modifier la recherche',
    departureDate: 'Date de d?part',
    returnDate: 'Date de retour',
    passengers: 'Passagers',
    passengerSingular: 'passager',
    passengerPlural: '{n} passagers',
    noResults: 'Aucun vol pour ces crit?res',
    noResultsHint: 'Essayez d\'autres dates ou a?roports (ex. Kinshasa ? Nairobi).',
    noSearchParams: 'Lancez une recherche de vols',
    noSearchParamsHint: 'Indiquez un d?part, une destination et une date de d?part.',
    browseAllHint: 'Tous les vols disponibles ? tarifs ? la prochaine date avec places libres.',
    startSearch: 'Lancer une recherche',
    backHome: 'Retour ? l\'accueil',
    viewDetails: 'Voir d?tails',
    bookNow: 'R?server',
    roundTripBadge: 'Aller-retour',
    roundTripFrom: '? partir de (A/R)',
    fromPrice: '? partir de',
    perPassenger: '/ passager',
    direct: 'Direct',
    layoverSingular: '1 escale',
    layoverPlural: '{n} escales',
    layoverDuration: 'Escale {duration}',
    departure: 'D?part',
    arrival: 'Arriv?e',
    itineraryTitle: 'Itin?raire',
    classesTitle: 'Classes disponibles',
    selectClass: 'Choisir cette classe',
    selectClassHint: 'S?lectionnez une classe pour r?server.',
    selectedClass: 'S?lectionn?e',
    seatsLeft: '{n} si?ge(s) disponible(s)',
    unavailable: 'Complet',
    insufficientSeats: 'Pas assez de places pour ce nombre de passagers.',
    totalFlight: 'Total vol',
    reserveSection: 'R?server',
    notFound: 'Vol introuvable',
    notFoundHint: "Ce vol n'existe pas ou n'est plus disponible pour cette date.",
    backToList: 'Retour aux r?sultats',
    classNames: {
      economy: '?conomique',
      premium_economy: '?conomique premium',
      business: 'Affaires',
      first: 'Premi?re',
    },
    galleryAria: 'Galerie photos du vol',
    galleryOpenLightbox: 'Agrandir la photo',
    galleryClose: 'Fermer la galerie',
    galleryPrevious: 'Photo pr?c?dente',
    galleryNext: 'Photo suivante',
    galleryCounter: (current, total) => `Photo ${current} sur ${total}`,
  },
  cars: {
    metaTitle: 'Location de voitures en Afrique',
    metaDescription:
      'Comparez et r?servez des v?hicules de location aux principales destinations africaines avec Africa Tourism Gate.',
    breadcrumbHome: 'Accueil',
    breadcrumbCars: 'Voitures',
    breadcrumbCarsDetail: 'Locations',
    heroTitle: 'Location de voitures en Afrique',
    heroSubtitle:
      'SUV, berlines et 4?4 aupr?s d\'agences locales de confiance ? tarif journalier transparent.',
    resultsFor: 'R?sultats pour',
    anyLocation: 'Toutes les villes',
    vehiclesFound: 'v?hicules',
    sortBy: 'Trier par',
    sortRecommended: 'Recommand?s',
    sortPriceLow: 'Prix croissant',
    sortPriceHigh: 'Prix d?croissant',
    loading: 'Recherche des v?hicules?',
    loadError: "Impossible de charger les v?hicules. V?rifiez que l'API est d?marr?e.",
    retry: 'R?essayer',
    modifySearch: 'Modifier la recherche',
    pickupDate: 'Date de prise en charge',
    returnDate: 'Date de retour',
    pickupLocation: 'Lieu de prise en charge',
    noResults: 'Aucun v?hicule pour ces crit?res',
    noResultsHint: 'Essayez d\'autres dates ou une autre ville (ex. Kinshasa).',
    noSearchParams: 'Lancez une recherche de location',
    noSearchParamsHint: 'Indiquez un lieu, une date de prise en charge et une date de retour.',
    browseAllHint:
      'Tous les v?hicules disponibles ? tarifs sur la prochaine plage de location.',
    startSearch: 'Lancer une recherche',
    backHome: 'Retour ? l\'accueil',
    viewDetails: 'Voir d?tails',
    bookNow: 'R?server',
    perDay: '/ jour',
    totalRental: 'Total location',
    daySingular: 'jour',
    dayPlural: 'jours',
    selectDatesHint: 'Choisissez vos dates de prise en charge et de retour.',
    reserveSection: 'R?server',
    notFound: 'V?hicule introuvable',
    notFoundHint: "Ce v?hicule n'existe pas ou n'est pas disponible pour cette p?riode.",
    backToList: 'Retour aux r?sultats',
    agencyTitle: 'Agence de location',
    categoryTitle: 'Cat?gorie',
    licensePlate: 'Immatriculation',
    infoTitle: 'Informations',
    equipmentTitle: '?quipements',
    conditionsTitle: 'Conditions de location',
    rentalPeriod: 'P?riode de location',
    imagePlaceholderAria: 'Illustration du v?hicule',
    specs: {
      seats: '{n} places',
      airConditioningYes: 'Climatisation',
      airConditioningNo: 'Sans climatisation',
      listAria: 'Caract?ristiques du v?hicule',
    },
    transmission: {
      manual: 'Manuelle',
      automatic: 'Automatique',
    },
    fuel: {
      petrol: 'Essence',
      diesel: 'Diesel',
      hybrid: 'Hybride',
      electric: '?lectrique',
    },
    equipment: {
      airConditioning: 'Climatisation',
      bluetooth: 'Bluetooth',
      gps: 'GPS',
      usb: 'Ports USB',
    },
    conditionItems: {
      minAge:
        'Conducteur ?g? d\'au moins 21 ans avec permis valide depuis 1 an minimum.',
      deposit:
        'Caution remboursable exig?e ? la prise en charge (carte bancaire au nom du conducteur).',
      mileage: 'Kilom?trage illimit? sur le territoire indiqu? par l\'agence.',
      insurance:
        'Assurance responsabilit? civile incluse ; options sans franchise disponibles sur place.',
      fuelPolicy:
        'Politique plein / plein : restituez le v?hicule avec le m?me niveau de carburant.',
    },
    galleryAria: 'Galerie photos du v?hicule',
    galleryOpenLightbox: 'Agrandir la photo',
    galleryClose: 'Fermer la galerie',
    galleryPrevious: 'Photo pr?c?dente',
    galleryNext: 'Photo suivante',
    galleryCounter: (current, total) => `Photo ${current} sur ${total}`,
  },
  cruises: {
    metaTitle: 'Croisi?res fluviales en Afrique',
    metaDescription:
      'Comparez et r?servez des croisi?res sur le fleuve Congo et les c?tes africaines avec Africa Tourism Gate.',
    breadcrumbHome: 'Accueil',
    breadcrumbCruises: 'Croisi?res',
    breadcrumbCruisesDetail: 'Croisi?res',
    heroTitle: 'Croisi?res en Afrique',
    heroSubtitle:
      'Itin?raires fluviaux et c?tiers ? choisissez votre cabine et embarquez en toute s?r?nit?.',
    resultsFor: 'R?sultats pour',
    anyRoute: 'Toutes les routes',
    sailingsFound: 'd?parts',
    sortBy: 'Trier par',
    sortRecommended: 'Recommand?s',
    sortPriceLow: 'Prix croissant',
    sortPriceHigh: 'Prix d?croissant',
    loading: 'Recherche des croisi?res?',
    loadError: "Impossible de charger les croisi?res. V?rifiez que l'API est d?marr?e.",
    retry: 'R?essayer',
    modifySearch: 'Modifier la recherche',
    startDate: 'Date de d?but',
    endDate: 'Date de fin',
    sailFrom: 'Port de d?part',
    sailTo: 'Port d\'arriv?e',
    guests: 'Voyageurs',
    guestSingular: 'voyageur',
    guestPlural: '{n} voyageurs',
    noResults: 'Aucune croisi?re pour ces crit?res',
    noResultsHint: 'Essayez d\'autres dates ou ports (ex. CDKIN ? CDBNW).',
    noSearchParams: 'Lancez une recherche de croisi?res',
    noSearchParamsHint: 'Indiquez les ports, une plage de dates de d?part et le nombre de voyageurs.',
    browseAllHint: 'Toutes les croisi?res disponibles ? tarifs pour les cabines en stock.',
    startSearch: 'Lancer une recherche',
    backHome: 'Retour ? l\'accueil',
    viewDetails: 'Voir d?tails',
    bookNow: 'R?server',
    fromPrice: '? partir de',
    perGuest: '/ voyageur',
    departure: 'D?part',
    arrival: 'Arriv?e',
    itineraryTitle: 'Itin?raire',
    dayLabel: 'Jour {n}',
    portArrival: 'Arriv?e',
    portDeparture: 'D?part',
    cabinsTitle: 'Cabines disponibles',
    selectCabin: 'Choisir cette cabine',
    selectCabinHint: 'S?lectionnez une cabine pour r?server.',
    selectedCabin: 'S?lectionn?e',
    capacityLabel: '{n} voyageurs max',
    deckLabel: 'Pont',
    deck: {
      main: 'Pont principal',
      upper: 'Pont sup?rieur',
      promenade: 'Pont promenade',
    },
    cabinsLeft: '{n} cabine(s) disponible(s)',
    unavailable: 'Complet',
    insufficientCabins: 'Pas assez de cabines pour ce nombre de voyageurs.',
    totalCruise: 'Total croisi?re',
    reserveSection: 'R?server',
    notFound: 'Croisi?re introuvable',
    notFoundHint: 'Ce d?part n\'existe pas ou n\'est plus disponible.',
    backToList: 'Retour aux r?sultats',
    shipLabel: 'Navire',
    cruiseLineLabel: 'Compagnie',
    nightSingular: 'nuit',
    nightPlural: 'nuits',
    searchRequired: 'Indiquez les ports et les dates de d?part.',
    endAfterStart: 'La date de fin doit ?tre apr?s la date de d?but.',
    galleryAria: 'Galerie photos du navire',
    galleryOpenLightbox: 'Agrandir la photo',
    galleryClose: 'Fermer la galerie',
    galleryPrevious: 'Photo pr?c?dente',
    galleryNext: 'Photo suivante',
    galleryCounter: (current, total) => `Photo ${current} sur ${total}`,
  },
  activities: {
    metaTitle: 'Activit?s et tours en Afrique',
    metaDescription:
      'R?servez des activit?s et tours guid?s en Afrique avec Africa Tourism Gate.',
    breadcrumbHome: 'Accueil',
    breadcrumbActivities: 'Activit?s',
    heroTitle: 'Activit?s & tours en Afrique',
    heroSubtitle:
      'Excursions guid?es et exp?riences locales ? choisissez votre cr?neau et r?servez en ligne.',
    resultsFor: 'R?sultats pour',
    anyDestination: 'Toutes les destinations',
    activitiesFound: 'activit?s',
    sortBy: 'Trier par',
    sortRecommended: 'Recommand?s',
    sortPriceLow: 'Prix croissant',
    sortPriceHigh: 'Prix d?croissant',
    loading: 'Recherche des activit?s?',
    loadError: "Impossible de charger les activit?s. V?rifiez que l'API est d?marr?e.",
    destinationsLoading: 'Chargement?',
    destinationsLoadError: 'Impossible de charger les destinations.',
    retry: 'R?essayer',
    modifySearch: 'Modifier la recherche',
    destination: 'Destination',
    date: 'Date',
    participants: 'Participants',
    participantSingular: 'participant',
    participantPlural: '{n} participants',
    noResults: 'Aucune activit? pour ces crit?res',
    noResultsHint: 'Essayez une autre date ou destination (ex. Kinshasa).',
    noSearchParams: 'Lancez une recherche d\'activit?s',
    noSearchParamsHint: 'Indiquez une destination, une date et le nombre de participants.',
    browseHint: 'Parcourez les activit?s disponibles ou affinez avec destination, date et participants.',
    noUpcomingSlot: 'Aucun cr?neau ? venir',
    backHome: 'Retour ? l\'accueil',
    viewDetails: 'Voir d?tails',
    bookNow: 'R?server',
    fromPrice: '? partir de',
    perParticipant: '/ participant',
    schedulesTitle: 'Cr?neaux disponibles',
    selectSchedule: 'Choisir ce cr?neau',
    selectScheduleHint: 'S?lectionnez un cr?neau pour r?server.',
    placesLeft: '{n} place(s) restante(s)',
    unavailable: 'Complet',
    insufficientPlaces: 'Pas assez de places pour ce nombre de participants.',
    totalActivity: 'Total activit?',
    reserveSection: 'R?server',
    notFound: 'Activit? introuvable',
    notFoundHint: 'Cette activit? n\'existe pas ou aucun cr?neau n\'est disponible.',
    backToList: 'Retour aux r?sultats',
    providerLabel: 'Prestataire',
    durationLabel: 'Dur?e',
    difficultyLabel: 'Difficult?',
    hourSingular: '1 h',
    hourPlural: '{n} h',
    minuteSingular: '1 min',
    minutePlural: '{n} min',
    searchRequired: 'Indiquez une date.',
    descriptionTitle: 'Description',
    nextSlot: 'Prochain cr?neau',
    schedulesAvailable: '{n} cr?neau(x) disponible(s)',
    noSchedulesTitle: 'Aucun cr?neau pour cette date',
    noSchedulesHint: 'Essayez une autre date ou modifiez votre recherche.',
    selectedScheduleLabel: 'Cr?neau s?lectionn?',
    difficultyEasy: 'Facile',
    difficultyModerate: 'Mod?r?',
    difficultyHard: 'Difficile',
    difficultyExpert: 'Expert',
    ratingAria: 'Note moyenne {rating} sur 5',
    reviewCount: '{n} avis',
    galleryAria: 'Galerie photos de l\'activit?',
    galleryOpenLightbox: 'Agrandir la photo',
    galleryClose: 'Fermer la galerie',
    galleryPrevious: 'Photo pr?c?dente',
    galleryNext: 'Photo suivante',
    galleryCounter: (current, total) => `Photo ${current} sur ${total}`,
    itineraryTitle: 'Itin?raire',
    itineraryMapAria: 'Carte de l\'itin?raire de l\'activit?',
    itineraryStopLabel: 'Coordonn?es',
    itineraryStopDuration: 'Dur?e',
  },
  packages: {
    metaTitle: 'Forfaits combin?s en Afrique',
    metaDescription:
      '?conomisez avec nos forfaits combin?s : activit?s, h?bergements et plus sur Africa Tourism Gate.',
    breadcrumbHome: 'Accueil',
    breadcrumbPackages: 'Forfaits',
    heroTitle: 'Forfaits combin?s en Afrique',
    heroSubtitle:
      'Regroupez plusieurs prestations ? prix r?duit ? comparez le prix catalogue et le prix forfait.',
    cardBadge: 'Forfait combin?',
    resultsFor: 'Forfaits disponibles',
    packagesFound: 'forfaits',
    sortBy: 'Trier par',
    sortRecommended: 'Recommand?s',
    sortPriceLow: 'Prix croissant',
    sortPriceHigh: 'Prix d?croissant',
    displayModeLabel: 'Affichage',
    displayModeCards: 'Cartes',
    displayModeList: 'Liste',
    displayModeCompact: 'Compact',
    loading: 'Chargement des forfaits?',
    loadingDetail: 'Chargement du forfait?',
    loadError: "Impossible de charger les forfaits. V?rifiez que l'API est d?marr?e.",
    retry: 'R?essayer',
    modifySearch: 'Modifier la recherche',
    searchLabel: 'Recherche',
    searchPlaceholder: 'Nom du forfait?',
    searchSubmit: 'Rechercher',
    browseHint: 'Parcourez tous les forfaits actifs ou recherchez par nom.',
    noResults: 'Aucun forfait trouv?',
    noResultsHint: 'Essayez un autre mot-cl? ou revenez plus tard.',
    backHome: 'Retour ? l\'accueil',
    viewDetails: 'Voir d?tails',
    bookNow: 'R?server',
    packagePrice: 'Prix forfait',
    discountBadge: '-{n} %',
    discountSummary: 'Remise forfait : {n} %',
    itemsIncluded: '{n} prestation(s) incluse(s)',
    itemsTitle: 'Prestations incluses',
    noItems: 'Ce forfait ne contient pas encore de prestations.',
    viewProduct: 'Voir la fiche',
    itemDetailClose: 'Fermer',
    itemDetailLoading: 'Chargement de la prestation?',
    itemDetailError: 'Impossible de charger les d?tails de cette prestation.',
    itemDetailPriceLabel: 'Prix indicatif',
    itemDetailGenericHint:
      'Consultez la fiche compl?te pour voir tous les d?tails de cette prestation.',
    itemDetailViewFullPage: 'Voir la fiche compl?te',
    pricingTitle: 'Tarif du forfait',
    youSave: 'Vous ?conomisez {amount}',
    configurePackage: 'Configurer le forfait',
    activityConfigureHint:
      'S?lectionnez les cr?neaux pour chaque activit? incluse, puis ajoutez le forfait au panier.',
    mixedConfigureHint:
      'Configurez chaque prestation incluse dans le forfait, puis ajoutez le tout au panier.',
    configureTitle: 'R?server le forfait',
    selectDateHint: 'Indiquez une date pour afficher les cr?neaux disponibles.',
    configureOnProduct: 'Configurer sur la fiche',
    configureOnProductHint: 'R?servation ? finaliser sur la fiche produit d?di?e.',
    mixedCheckoutDisabled:
      'La remise forfait s\'applique au checkout group? une fois toutes les prestations configur?es.',
    loadingActivitySchedules: 'Chargement des cr?neaux?',
    activitySchedulesError: 'Impossible de charger les cr?neaux pour cette activit?.',
    noActivitySchedules: 'Aucun cr?neau disponible pour cette date.',
    schedulesProgress: '{selected} / {total} activit?(s) configur?e(s)',
    itemsProgress: '{selected} / {total} prestation(s) configur?e(s)',
    allSchedulesRequired: 'S?lectionnez un cr?neau pour chaque activit? du forfait.',
    allItemsRequired: 'Configurez chaque prestation du forfait avant d\'ajouter au panier.',
    selectStayDatesHint: 'Indiquez les dates d\'arriv?e et de d?part pour choisir une chambre.',
    loadingPropertyRooms: 'Chargement des chambres?',
    propertyRoomsError: 'Impossible de charger les chambres pour cet h?bergement.',
    selectDepartureDateHint: 'Indiquez la date de d?part du vol.',
    loadingFlightClasses: 'Chargement des classes?',
    flightClassesError: 'Impossible de charger les classes pour ce vol.',
    selectRentalDatesHint: 'Indiquez les dates de prise en charge et de retour.',
    loadingVehicleAvailability: 'V?rification de la disponibilit?',
    vehicleAvailabilityError: 'V?hicule indisponible pour ces dates.',
    vehicleDatesConfirmed: 'V?hicule disponible pour ces dates',
    selectSailingHint: 'Indiquez l\'identifiant du d?part croisi?re (sailingId).',
    sailingIdLabel: 'Identifiant du d?part',
    sailingIdPlaceholder: '00000000-0000-4000-8000-000000003036',
    loadingCruiseCabins: 'Chargement des cabines?',
    cruiseCabinsError: 'Impossible de charger les cabines pour ce d?part.',
    addToCart: 'Ajouter au panier',
    packageCartInvalid: 'Configuration du forfait invalide ou incompl?te.',
    modifySelection: 'Modifier la s?lection',
    departureDateLabel: 'Date de d?part',
    returnDateLabel: 'Date de retour',
    travelersLabel: 'Voyageurs',
    durationDaysLabel: '{days} jour(s)',
    packageBookingHint:
      'Choisissez la date de d?part et le nombre de voyageurs. Les cr?neaux horaires seront confirm?s par notre ?quipe apr?s votre demande.',
    selectDepartureHint: 'Indiquez une date de d?part pour pr?parer la r?servation.',
    includedServicesTitle: 'Prestations incluses',
    assistedBookingServicesHint:
      'Les horaires pr?cis seront attribu?s apr?s validation de votre demande par notre ?quipe.',
    resolvingPackage: 'V?rification des disponibilit?s?',
    resolvingItem: 'En cours?',
    itemAutoResolved: 'Inclus',
    itemUnavailable: 'Indisponible',
    itemMissing: 'Non configur?',
    itemResolveError: 'Erreur',
    someItemsUnavailable:
      'Certaines prestations ne sont pas disponibles pour ces dates. Essayez une autre date de d?part.',
    someItemsMissing:
      'Certaines prestations du forfait n?ont pas pu ?tre associ?es au catalogue.',
    notFound: 'Forfait introuvable',
    notFoundHint: 'Ce forfait n\'existe pas ou n\'est plus disponible.',
    backToList: 'Retour aux forfaits',
    itemTypes: {
      property: 'H?bergement',
      flight: 'Vol',
      vehicle: 'V?hicule',
      cruise: 'Cabine croisi?re',
      activity: 'Activit?',
    },
    galleryAria: 'Galerie photos du forfait',
    galleryOpenLightbox: 'Agrandir la photo',
    galleryClose: 'Fermer la galerie',
    galleryPrevious: 'Photo pr?c?dente',
    galleryNext: 'Photo suivante',
    galleryCounter: (current, total) => `Photo ${current} sur ${total}`,
    attachmentsTitle: 'Pi?ces jointes',
    attachmentsCount: '{count} pi?ce(s) jointe(s)',
    openAttachment: 'Ouvrir le fichier',
    attachmentImageAlt: 'Pi?ce jointe image',
    attachmentFallbackName: 'Pi?ce jointe',
    descriptionShowMore: 'Voir plus',
    descriptionShowLess: 'Voir moins',
    stepOverview: 'Aper?u des prestations',
    stepConfigure: 'Configuration',
    stepBook: 'R?server',
    stepRecap: 'R?capitulatif',
    stepOverviewShort: 'Aper?u',
    stepConfigureShort: 'Config.',
    stepBookShort: 'R?server',
    stepRecapShort: 'R?cap',
    compositionStepperAria: '?tapes de composition du forfait',
    configureProgress: '{done} / {total} prestation(s) configur?e(s)',
    bookingReadyHint: 'Dates et voyageurs renseign?s',
    bookingPendingHint: 'Indiquez une date de d?part',
    assistedItemPendingSchedule: 'Cr?neau ? confirmer apr?s validation',
    travelerSingular: 'voyageur',
    travelerPlural: 'voyageurs',
    estimatedPackageTotal: 'Total estim?',
    startConfiguration: 'R?server ce forfait',
    stepBack: 'Retour',
    viewRecap: 'Voir le r?capitulatif',
    recapTitle: 'R?capitulatif du forfait',
    recapHint:
      'V?rifiez les informations de voyage avant d?ajouter le forfait au panier. La demande sera trait?e par notre ?quipe.',
    configureSchedulesTitle: 'Choisir les cr?neaux horaires',
    itemConfigured: 'Configur?',
    itemPending: '? configurer',
    recapActivityLine: '{n} participant(s) ? cr?neau s?lectionn?',
    recapPropertyLine: 'S?jour du {checkIn} au {checkOut}',
    recapFlightLine: 'D?part le {date}',
    recapVehicleLine: 'Du {pickup} au {return}',
    recapCruiseLine: '{guests} passager(s) ? cabine s?lectionn?e',
    estimatedSavings: '?conomie estim?e : {amount}',
    itineraryMapTitle: 'Carte du forfait',
    itineraryMapAria: 'Carte des lieux inclus dans le forfait',
    itineraryMapLegendTitle: 'L?gende',
    itineraryMapLegendPoints: '({count})',
    itineraryMapPartialHint:
      'Certains services (v?hicule, croisi?re) ne sont pas affich?s sur la carte faute de coordonn?es g?ographiques.',
  },
  account: {
    title: 'Mon compte',
    subtitle: 'G?rez votre profil, vos adresses et vos r?servations.',
    browseSite: 'Explorer les h?bergements',
    navAria: 'Navigation du compte',
    loading: 'Chargement?',
    nav: {
      profile: 'Profil',
      addresses: 'Adresses',
      reservations: 'R?servations',
      loyalty: 'Fid?lit? OneKey',
      paymentMethods: 'Moyens de paiement',
    },
    profile: {
      email: 'E-mail',
      firstName: 'Pr?nom',
      lastName: 'Nom',
      phone: 'T?l?phone',
      language: 'Langue pr?f?r?e',
      save: 'Enregistrer',
      saving: 'Enregistrement?',
      saved: 'Profil mis ? jour avec succ?s.',
      loadError: 'Impossible de charger le profil.',
      saveError: 'Impossible de mettre ? jour le profil.',
      personalInfo: 'Informations personnelles',
      personalInfoHint: 'Vos coordonn?es utilis?es pour les r?servations.',
      preferences: 'Pr?f?rences',
      preferencesHint: "Langue d'affichage du site et des communications.",
      emailHint: "L'adresse e-mail ne peut pas ?tre modifi?e ici.",
      memberId: 'Identifiant client',
      quickLinks: 'Acc?s rapide',
      viewReservations: 'Mes r?servations',
      statusActive: 'Compte actif',
      statusSuspended: 'Compte suspendu',
      statusDeleted: 'Compte supprim?',
      reset: 'Annuler les modifications',
      unsavedChanges: 'Modifications non enregistr?es',
    },
    addresses: {
      empty: 'Aucune adresse enregistr?e.',
      addNew: 'Ajouter une adresse',
      add: 'Ajouter',
      saving: 'Enregistrement?',
      cancel: 'Annuler',
      delete: 'Supprimer',
      deleteConfirm: 'Supprimer cette adresse ?',
      deleteError: "Impossible de supprimer l'adresse.",
      loadError: 'Impossible de charger les adresses.',
      saveError: "Impossible d'enregistrer l'adresse.",
      defaultBadge: 'Par d?faut',
      isDefault: 'Adresse par d?faut',
      label: 'Libell? (ex. Domicile)',
      line1: 'Adresse ligne 1',
      line2: 'Adresse ligne 2',
      city: 'Ville',
      countryCode: 'Code pays (ex. CD)',
    },
    reservations: {
      empty: 'Aucune r?servation pour le moment',
      emptyDescription:
        'Vos voyages r?serv?s via Africa Tourism Gate appara?tront ici. Commencez par explorer h?tels, vols et activit?s.',
      emptyBrowse: 'Explorer les offres',
      emptyFilter: 'Aucune r?servation ne correspond ? ce filtre.',
      reference: 'R?f?rence',
      date: 'Date',
      status: 'Statut',
      total: 'Total',
      view: 'Voir',
      back: 'Retour aux r?servations',
      notFound: 'R?servation introuvable.',
      loadError: 'Impossible de charger les r?servations.',
      filterAll: 'Toutes',
      filterConfirmed: 'Valid?es',
      filterPending: 'En attente',
      filterCancelled: 'Annul?es',
      filterAria: 'Filtrer par statut',
      actionRequired: 'Action requise',
      leaveReviewCta: 'Laisser un avis',
      reviewPrompt:
        'Vous avez {count} s?jour(s) termin?(s) en attente d?avis ? partagez votre exp?rience.',
      detail: {
        bookedOn: 'R?serv?e le',
        itemsCount: 'Articles',
        itemsTitle: 'D?tail de la r?servation',
        noItems: 'Aucun article enregistr?.',
        item: 'Prestation',
        dates: 'Dates',
        quantity: 'Qt?',
        lineTotal: 'Montant',
        actions: 'Actions',
        payNow: 'Payer maintenant',
        paying: 'Redirection vers le paiement?',
        payError: "Impossible d'ouvrir la page de paiement.",
        cancelBooking: 'Annuler la r?servation',
        cancelling: 'Annulation?',
        cancelConfirm: 'Annuler cette r?servation ?',
        cancelError: "Impossible d'annuler la r?servation.",
        title: 'D?tail de la r?servation',
        leaveReview: 'Laisser un avis',
        leaveReviewHint: 'Partagez votre exp?rience apr?s votre s?jour.',
        yourReview: 'Votre avis',
        reviewRating: 'Note',
        reviewTitle: 'Titre (optionnel)',
        reviewTitlePlaceholder: 'Ex. S?jour parfait',
        reviewBody: 'Commentaire (optionnel)',
        reviewBodyPlaceholder: "Qu'avez-vous appr?ci? ?",
        submitReview: 'Publier mon avis',
        submittingReview: 'Publication?',
        reviewSubmitError: "Impossible de publier l'avis.",
        reviewRatingRequired: 'Veuillez choisir une note entre 1 et 5.',
        reviewCharCount: '{current} / {max}',
        reviewPublished: 'Merci, votre avis a ?t? publi?.',
        reviewStarAria: '{n} sur 5',
        timelineTitle: 'Suivi de la r?servation',
        timelinePlaceholder:
          'Historique d?taill? non disponible ? ?tapes estim?es selon le statut actuel.',
        timelineStepCreated: 'R?servation cr??e',
        timelineStepPending: 'En attente de paiement',
        timelineStepConfirmed: 'Confirm?e',
        timelineStepCancelled: 'Annul?e',
        timelineStepRefunded: 'Rembours?e',
        timelineStepRequest: 'Demande envoy?e',
        timelineStepValidation: 'Validation par l\'?quipe',
        timelineStepDiscussion: '?changes',
        timelineStepPayment: 'Paiement',
        timelineCurrent: '?tape en cours',
        timelineUpcoming: '? venir',
        proceedToPayment: 'Proc?der au paiement',
        paymentInvitePending:
          'Vous recevrez un e-mail avec le lien de paiement d?s que votre demande sera valid?e.',
        identityDocuments: {
          title: "Pi?ce d'identit?",
          subtitle:
            'D?posez une pi?ce d\'identit? lisible (passeport, carte d\'identit?) pour valider votre r?servation.',
          empty: 'Aucun document d?pos? pour le moment.',
          documentType: 'Type de document',
          file: 'Fichier',
          fileHint: 'JPEG, PNG, WebP ou PDF ? 10 Mo max.',
          upload: 'Envoyer le document',
          uploading: 'Envoi?',
          uploadError: "Impossible d'envoyer le document.",
          fileTooLarge: 'Fichier trop volumineux (10 Mo max).',
          view: 'Voir',
          viewing: 'Ouverture?',
          viewError: 'Impossible d\'ouvrir le document.',
          statusLabel: 'Statut',
          types: {
            passport: 'Passeport',
            national_id: "Carte d'identit?",
            drivers_license: 'Permis de conduire',
            other: 'Autre',
          },
          statuses: {
            pending_review: 'En cours de v?rification',
            approved: 'Valid?',
            resubmit_requested: 'Version plus claire demand?e',
            rejected: 'Refus?',
          },
        },
        manifest: {
          title: 'Liste des voyageurs',
          subtitle: 'Renseignez les informations de chaque voyageur inclus dans cette r?servation.',
          empty: 'Aucun voyageur renseign? pour le moment.',
          loading: 'Chargement?',
          loadError: 'Impossible de charger la liste des voyageurs.',
          addTraveler: 'Ajouter un voyageur',
          addTitle: 'Ajouter un voyageur',
          editTitle: 'Modifier le voyageur',
          formHint: 'Seul le nom complet est obligatoire.',
          fullNameRequired: 'Le nom complet est obligatoire.',
          save: 'Enregistrer',
          saving: 'Enregistrement?',
          saveError: 'Impossible d\'enregistrer le voyageur.',
          edit: 'Modifier',
          delete: 'Supprimer',
          deleting: 'Suppression?',
          deleteError: 'Impossible de supprimer le voyageur.',
          deleteTitle: 'Supprimer ce voyageur ?',
          deleteDescription: 'Confirmer la suppression de {name} de la liste des voyageurs.',
          cancel: 'Annuler',
          sex: {
            unspecified: 'Non pr?cis?',
            M: 'Homme',
            F: 'Femme',
            other: 'Autre',
          },
          fields: {
            fullName: 'Nom complet',
            age: '?ge',
            sex: 'Genre',
            nationality: 'Nationalit?',
            idNumber: 'N? pi?ce d\'identit?',
            conditions: 'Conditions m?dicales',
            conditionsPlaceholder: 'Allergies, traitements en cours, besoins particuliers?',
            comment: 'Commentaire',
            commentPlaceholder: 'Informations compl?mentaires?',
            other: 'Autres informations',
            otherPlaceholder: 'Toute autre information utile?',
          },
        },
        messages: {
          title: 'Conversation',
          subtitle: '?changez avec notre ?quipe au sujet de votre demande.',
          loading: 'Chargement des messages?',
          empty: 'Aucun message pour le moment. Notre ?quipe vous r?pondra ici.',
          threadAria: 'Fil de messages de la r?servation',
          authorStaff: '?quipe',
          authorCustomer: 'Vous',
          replyTitle: 'Votre message',
          replyLabel: 'Message',
          replyPlaceholder: '?crivez votre message?',
          sendReply: 'Envoyer',
          loadError: 'Impossible de charger la conversation.',
          sendError: 'Impossible d\'envoyer le message.',
          newStaffMessageToast: 'Nouveau message de notre ?quipe',
          fabAriaLabel: 'Ouvrir la conversation',
          fabAriaLabelWithUnread: 'Ouvrir la conversation ({count} non lu(s))',
          pickerTitle: 'Vos conversations',
          pickerSubtitle: 'S?lectionnez une r?servation pour ouvrir le chat.',
          pickerEmpty: 'Aucune r?servation avec conversation active.',
          pickerLoading: 'Chargement de vos r?servations?',
          backToReservations: 'Retour aux r?servations',
          viewBooking: 'Voir la r?servation',
          unreadBadge: '{count} message(s) non lu(s)',
        },
        guideReviews: {
          sectionTitle: 'Votre guide',
          sectionHint:
            'Partagez votre exp?rience avec le ou les guides assign?s ? votre s?jour.',
          rolePrimary: 'Guide principal',
          roleSecondary: 'Guide secondaire',
          leaveReview: 'Noter ce guide',
          leaveReviewHint: 'Votre avis sera publi? apr?s mod?ration par notre ?quipe.',
          submitReview: 'Envoyer l\'avis',
          yourReview: 'Votre avis',
          reviewPublished: 'Merci, votre avis a ?t? envoy? et sera publi? apr?s mod?ration.',
        },
      },
    },
    paymentMethods: {
      empty: 'Aucun moyen de paiement enregistr?.',
      addNew: 'Ajouter un moyen de paiement',
      add: 'Ajouter',
      saving: 'Enregistrement?',
      cancel: 'Annuler',
      delete: 'Supprimer',
      deleteConfirm: 'Supprimer ce moyen de paiement ?',
      deleteError: 'Impossible de supprimer.',
      loadError: 'Impossible de charger les moyens de paiement.',
      saveError: "Impossible d'enregistrer.",
      defaultBadge: 'Par d?faut',
      isDefault: 'Par d?faut',
      typeCard: 'Carte bancaire',
      typePaypal: 'PayPal',
      typeOther: 'Autre',
      provider: 'Fournisseur (ex. visa)',
      lastFour: '4 derniers chiffres',
    },
    loyalty: {
      empty:
        'Votre compte OneKey sera cr?? automatiquement apr?s votre premier paiement confirm?.',
      loadError: 'Impossible de charger votre fid?lit? OneKey.',
      programLabel: 'Programme',
      pointsLabel: 'points OneKey',
      pointsShort: 'pts',
      earnHint:
        'Les points sont cr?dit?s apr?s chaque paiement de r?servation confirm?, selon les r?gles du programme.',
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
      'Consultez la FAQ Africa Tourism Gate ou contactez notre ?quipe pour vos r?servations et votre compte.',
    pageTitle: "Centre d'aide",
    pageSubtitle:
      'R?ponses aux questions fr?quentes et formulaire pour joindre notre ?quipe support.',
    faqTitle: 'Questions fr?quentes',
    formTitle: 'Contacter le support',
    formSubtitle:
      'D?crivez votre demande : nous cr?ons un ticket et vous r?pondons par e-mail.',
    signInPrompt: 'Connectez-vous pour envoyer une demande au support.',
    signInCta: 'Se connecter',
    checkingSession: 'V?rification de la session?',
    subjectLabel: 'Sujet',
    subjectPlaceholder: 'Ex. Question sur ma r?servation #?',
    messageLabel: 'Message',
    messagePlaceholder: 'D?crivez votre situation en quelques phrases?',
    submit: 'Envoyer la demande',
    submitting: 'Envoi en cours?',
    successTitle: 'Demande enregistr?e',
    successMessage:
      'Merci. Votre ticket a ?t? cr??. Conservez cette r?f?rence : {ticketId}. Notre ?quipe vous r?pondra sous 24 ? 48 h ouvr?es.',
    subjectRequired: 'Le sujet est obligatoire.',
    messageTooShort: 'Le message doit contenir au moins 10 caract?res.',
    submitError: "Impossible d'envoyer votre demande. Veuillez r?essayer.",
    faq: {
      booking: {
        question: 'Comment modifier ou annuler une r?servation ?',
        answer:
          "Ouvrez Mon compte ? R?servations, s?lectionnez votre s?jour puis suivez les options disponibles (paiement, annulation). Si le bouton n'appara?t pas, contactez-nous avec votre num?ro de r?servation.",
      },
      payment: {
        question: 'Quels moyens de paiement acceptez-vous ?',
        answer:
          "Les paiements en ligne s?curis?s (carte bancaire via Stripe) sont propos?s au moment de la confirmation. Le d?bit et la facture d?pendent de l'?tablissement et du type de produit r?serv?.",
      },
      cancellation: {
        question: "Quelle est votre politique d'annulation ?",
        answer:
          "Les conditions varient selon l'h?bergement ou le prestataire. Consultez les d?tails sur la fiche produit et dans votre confirmation. En cas de doute, ouvrez un ticket avec votre r?f?rence de r?servation.",
      },
      account: {
        question: 'Comment mettre ? jour mon profil ou mes adresses ?',
        answer:
          "Depuis Mon compte, rubriques Profil et Adresses. La langue d'affichage peut ?tre modifi?e dans vos pr?f?rences.",
      },
      contact: {
        question: 'Quel d?lai de r?ponse du support ?',
        answer:
          'Nous traitons les demandes du lundi au vendredi. La plupart des tickets re?oivent une premi?re r?ponse sous 24 ? 48 h ouvr?es.',
      },
    },
  },
  blog: {
    metaTitle: 'Blog voyage en Afrique',
    metaDescription:
      'Conseils, guides et inspirations pour pr?parer votre prochain voyage en Afrique avec Africa Tourism Gate.',
    heroTitle: 'Blog',
    heroSubtitle: 'Guides, conseils et inspirations pour voyager en Afrique.',
    readMore: 'Lire la suite',
    loading: 'Chargement des articles?',
    loadError: "Impossible de charger le blog. V?rifiez que l'API est d?marr?e.",
    retry: 'R?essayer',
    noResults: 'Aucun article publi?',
    noResultsHint: 'Revenez bient?t pour d?couvrir nos nouveaux contenus.',
    localeFallback:
      'Aucun article dans votre langue pour le moment ? affichage des articles disponibles dans les autres langues.',
    backToBlog: 'Retour au blog',
    publishedOn: 'Publi? le',
    breadcrumbHome: 'Accueil',
    breadcrumbBlog: 'Blog',
  },
  about: {
    heroTitle: '? propos',
    heroSubtitle:
      'D?couvrez notre mission, notre ?quipe et nos engagements pour un tourisme africain responsable.',
    sidebarAria: 'Sections ? propos',
    breadcrumbHome: 'Accueil',
    breadcrumbAbout: '? propos',
    loading: 'Chargement?',
    loadError: 'Impossible de charger le contenu. V?rifiez que l?API est d?marr?e.',
    emptyPage: 'Contenu en cours de pr?paration',
    emptyPageHint: 'Cette section sera bient?t disponible. Contactez-nous pour en savoir plus.',
    localeFallback:
      'Contenu affich? dans une autre langue ? la version dans votre langue sera publi?e prochainement.',
    nav: {
      whoWeAre: 'Qui nous sommes',
      history: 'Notre histoire',
      team: 'Notre ?quipe',
      howWeWork: 'Comment nous travaillons',
      governance: 'Notre gouvernance',
      reports: 'Rapports et finances',
      responsibility: 'Responsabilit?',
      media: 'M?dias & ressources',
      contact: 'Nous contacter',
    },
    team: {
      empty: 'Aucun membre de l??quipe publi? pour le moment.',
    },
    timeline: {
      intro:
        'Parcourez les ?tapes cl?s qui ont fa?onn? Africa Tourism Gate, de la gen?se du projet ? notre vision pour l?avenir.',
      empty: 'Aucun jalon publi? pour le moment.',
      readMore: 'En savoir plus',
      sidebarAria: 'P?riodes de l?historique',
    },
    resources: {
      empty: 'Aucun document disponible pour le moment.',
      download: 'T?l?charger',
      openLink: 'Ouvrir le lien',
      publishedOn: 'Publi? le',
    },
    contact: {
      subtitle: 'Notre ?quipe est ? votre ?coute pour toute question.',
      infoTitle: 'Coordonn?es',
      formTitle: 'Envoyer un message',
      formSubtitle: 'D?crivez votre demande ? nous vous r?pondrons dans les meilleurs d?lais.',
    },
    meta: {
      whoWeAre: {
        title: 'Qui nous sommes',
        description:
          'D?couvrez Africa Tourism Gate : notre mission, notre vision et notre engagement pour le tourisme en Afrique.',
      },
      history: {
        title: 'Notre histoire',
        description:
          'Retracez les grandes ?tapes du d?veloppement d?Africa Tourism Gate ? travers une frise chronologique interactive.',
      },
      team: {
        title: 'Notre ?quipe',
        description:
          'Rencontrez les femmes et les hommes qui font vivre Africa Tourism Gate au quotidien.',
      },
      howWeWork: {
        title: 'Comment nous travaillons',
        description:
          'Notre approche qualit?, transparence et partenariat local pour des voyages en Afrique.',
      },
      governance: {
        title: 'Notre gouvernance',
        description:
          'Structure de gouvernance, d?cisions et transparence institutionnelle d?Africa Tourism Gate.',
      },
      reports: {
        title: 'Rapports et finances',
        description:
          'Consultez les rapports d?activit? et documents financiers publi?s par Africa Tourism Gate.',
      },
      responsibility: {
        title: 'Responsabilit?',
        description:
          'Nos engagements pour un tourisme durable, ?thique et responsable en Afrique.',
      },
      media: {
        title: 'M?dias & ressources',
        description:
          'Kit presse, logos et ressources m?dias pour parler d?Africa Tourism Gate.',
      },
      contact: {
        title: 'Nous contacter',
        description:
          'Contactez l??quipe Africa Tourism Gate par t?l?phone, e-mail ou formulaire de support.',
      },
    },
  },
  comingSoon: {
    badge: 'Bient?t disponible',
    title: 'Bient?t disponible',
    siteBody:
      'Cette section du site est en cours de pr?paration. Revenez bient?t pour d?couvrir de nouvelles fonctionnalit?s sur Africa Tourism Gate.',
    body: 'La r?servation en ligne pour cette cat?gorie arrive prochainement. Vos crit?res de recherche ont ?t? conserv?s dans l?URL.',
    backToSearch: 'Modifier ma recherche',
    backHome: 'Retour ? l?accueil',
  },
  booking: {
    login: {
      title: 'Connexion client',
      subtitle:
        'Connectez-vous avec votre e-mail et mot de passe, ou utilisez Google pour poursuivre votre r?servation.',
      divider: 'ou',
      google: 'Se connecter avec Google',
      backToHotels: 'Retour aux h?tels',
      form: {
        emailLabel: 'Adresse e-mail',
        emailPlaceholder: 'vous@exemple.com',
        passwordLabel: 'Mot de passe',
        passwordPlaceholder: '????????',
        submit: 'Se connecter',
        submitLoading: 'Connexion?',
      },
      errors: {
        network: 'Impossible de joindre le serveur. V?rifiez votre connexion.',
        generic: 'Une erreur est survenue. Veuillez r?essayer.',
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
    pages: 'Our Products',
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
          'Witness the wildebeest migration and the Big Five in Africa?"s most famous reserve.',
      },
      {
        subtitle: '5 days in',
        title: 'MARRAKECH (Pearl of the South)',
        description:
          'Immerse yourself in souks, riads and the spiced flavors of Morocco?"s ochre city.',
      },
      {
        subtitle: '12-day cruise',
        title: 'ZANZIBAR TO MADAGASCAR',
        description:
          'Coastal sailing along the Indian Ocean ? dream beaches and unique wildlife.',
      },
    ],
    prev: 'Previous slide',
    next: 'Next slide',
    goToSlide: 'Go to slide {n}',
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
    viewAllHotels: 'View all hotels',
    carsRequired: 'Enter city, pick-up date and return date.',
    carsReturnAfterPickup: 'Return date must be after pick-up date.',
    carsDurationHint: 'Select dates to see rental duration',
    pickupLocationPh: 'City or airport',
    viewAllCars: 'View all car rentals',
    cruisesRequired: 'Enter departure and arrival ports plus a date range.',
    cruisesEndAfterStart: 'End date must be after start date.',
    cruisesSamePort: 'Departure and arrival ports must be different.',
    viewAllCruises: 'View all cruises',
    viewAllActivities: 'View all activities',
    toursRequired: 'Enter a date.',
    participants: 'Participants',
    roomTypes: ['Double Room', 'Single Room', 'Suite'],
    countries: ['Kenya', 'Tanzania', 'Morocco', 'South Africa', 'Rwanda', 'DRC'],
    locations: ['Airport', 'City center', 'Train station'],
  },
  listing: {
    clearFilters: 'Clear filters',
    applyFilters: 'Apply',
    filtersToggle: 'Filters',
    previousPage: 'Previous page',
    nextPage: 'Next page',
    navAriaLabel: 'Results pagination',
    pageAria: (page) => `Page ${page}`,
    range: ({ start, end, total, itemLabel, pluralSuffix }) =>
      `${start}?${end} of ${total} ${itemLabel}${pluralSuffix}`,
    pageOf: ({ page, totalPages }) => `page ${page} / ${totalPages}`,
    resultItem: 'result',
  },
  bookingSidebar: {
    trustDemoCatalog: 'Indicative prices ? online booking coming soon.',
    trustTransparentPricing: 'No hidden fees on the amount shown.',
    trustSupport: 'Questions? Our team is here to help.',
    mobileConfigure: 'Options',
    closeDrawer: 'Close',
    decreaseGuests: 'Decrease number of guests',
    increaseGuests: 'Increase number of guests',
  },
  checkout: {
    stepperAriaLabel: 'Booking steps',
    stepCart: 'Cart',
    stepRecap: 'Summary',
    stepPayment: 'Payment',
    stepRequest: 'Request',
    stepConfirmation: 'Confirmation',
    stepCancelled: 'Cancelled',
    cartTitle: 'Booking cart',
    recapTitle: 'Summary',
    continueToRecap: 'Continue to summary',
    backToCart: 'Back to cart',
    payWithStripe: 'Pay with Stripe',
    requestBooking: 'Request a booking',
    requestSubmitting: 'Submitting request?',
    stripeRedirecting: 'Redirecting to Stripe?',
    estimatedTotal: 'Estimated total',
    loading: 'Loading?',
    authRequiredNext: 'Customer sign-in required on the next step.',
    authRequiredPayment: 'Customer sign-in required to start Stripe Checkout.',
    authRequiredRequest: 'Customer sign-in required to submit your booking request.',
    invalidDraft: 'Incomplete booking data. Start again from a product page.',
    invalidDraftBack: 'Back to hotels',
    invalidRecap: 'Invalid booking data. Return to the cart.',
    modifySelection: 'Change selection',
    resumeSearch: 'Resume search',
    stripeError: {
      authTitle: 'Sign-in required',
      authDescription: 'Authentication is required to continue to payment.',
      authHint: 'Sign in, then retry payment from the summary page.',
      networkTitle: 'Connection interrupted',
      networkHint: 'Check your network and try again in a moment.',
      paymentTitle: 'Payment declined',
      paymentHint: 'Check your card or try another payment method.',
      genericTitle: 'Payment could not start',
      genericHint: 'Try again or return to the cart to review your selection.',
      dismiss: 'Dismiss',
    },
    success: {
      title: 'Confirming booking',
      titleConfirmed: 'Booking confirmed',
      subtitle:
        'Your Stripe payment was received. We are finalizing your booking confirmation?',
      subtitleConfirmed: 'Your payment was received and your booking is confirmed.',
      bookingIdLabel: 'Booking ref:',
      statusLabel: 'Status:',
      statusConfirmed: 'Confirmed',
      statusPendingPayment: 'Pending payment',
      statusPendingHint:
        'Confirmation is taking longer than expected. Check your account shortly or contact support if the status does not update.',
      totalLabel: 'Total:',
      verifying: 'Checking status?',
      statusUnavailable: 'Detailed status is unavailable for now. Refresh in a moment.',
      backHome: 'Back to home',
      browseHotels: 'Browse hotels',
      viewAccount: 'My account',
      signOut: 'Sign out',
      nextStepsTitle: 'What happens next',
      nextStepEmail: 'A confirmation email will be sent shortly.',
      nextStepAccount: 'View your bookings in your account area.',
    },
    requestSuccess: {
      title: 'Request submitted',
      subtitle:
        'Your booking request has been sent to our team. You will be contacted within 24?48 hours.',
      bookingIdLabel: 'Request ref:',
      statusLabel: 'Status:',
      totalLabel: 'Estimated total:',
      verifying: 'Checking status?',
      statusUnavailable: 'Detailed status is unavailable for now. Refresh in a moment.',
      backHome: 'Back to home',
      browseActivities: 'Browse activities',
      viewAccount: 'My account',
      signOut: 'Sign out',
      nextStepsTitle: 'What happens next',
      nextStepContact: 'Our team will review your request and contact you by email.',
      nextStepAccount: 'Track progress from your account area.',
    },
    manifest: {
      title: 'Traveler information',
      subtitle: 'Fill in the details for each traveler. Only the full name is required.',
      travelerN: 'Traveler {n}',
      fullName: 'Full name',
      age: 'Age',
      sex: 'Gender',
      sexUnspecified: 'Not specified',
      sexM: 'Male',
      sexF: 'Female',
      sexOther: 'Other',
      nationality: 'Nationality',
      idNumber: 'ID / Passport number',
      conditions: 'Medical conditions',
      conditionsPlaceholder: 'Allergies, treatments, special needs?',
      fullNameRequired: 'Full name of traveler {n} is required.',
    },
    cancel: {
      title: 'Payment cancelled',
      subtitle: 'No charge was confirmed. You can resume your booking whenever you like.',
      backToCart: 'Return to cart',
      continueSearch: 'Continue browsing',
    },
  },
  verticalSearch: {
    backHome: 'Back to home',
    resultsTitle: 'Results',
    exploreHint: 'Explore available options.',
    forDestination: 'Showing results for {destination}.',
    noResults: 'No results found for this search.',
    noResultsHint: 'Adjust your criteria or return to the homepage.',
    continue: 'Continue',
    verticals: {
      hotels: 'Hotels',
      flights: 'Flights',
      cars: 'Car rentals',
      cruises: 'Cruises',
      tours: 'Tours & activities',
    },
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
          'Explore rich cultures, breathtaking landscapes and Africa?"s incredible wildlife.',
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
    badge: 'Special offer',
    title: 'Kenya Safari ? Holiday Package',
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
    loading: 'Loading destinations?',
    loadError: 'Could not load destinations.',
    empty: 'No featured destinations at the moment.',
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
        description: 'White sand, turquoise waters and spices ? Indian Ocean paradise.',
      },
    ],
  },
  customers: {
    title: 'Happy Customers',
    subtitle: 'Our travelers?" satisfaction is our top priority.',
    p1: 'Since launch, we have helped thousands of travelers discover Africa. Our commitment to excellence and authentic experiences has earned the trust of our growing community.',
    p2: 'Every positive review motivates us to keep improving and offering ever more memorable journeys across the continent.',
    clients: 'Clients',
    imageAlt: 'Happy travelers in Africa',
    bars: { flights: 'Flights', hotels: 'Hotels', cars: 'Cars', cruises: 'Cruises' },
  },
  activitiesMap: {
    title: 'Upcoming Activities',
    subtitle:
      'Explore available experiences across Africa. Click a marker to view details and book.',
    loading: 'Loading map?',
    loadError: 'Could not load activities on the map.',
    empty: 'No activities with location available at the moment.',
    browseAll: 'Browse all activities',
    mapAria: 'Map of available activities in Africa',
    nextDate: 'Next date',
    viewActivity: 'View activity',
  },
  customerReviews: {
    title: 'What our travelers say',
    subtitle: 'Read feedback from guests who explored Africa with Africa Tourism Gate.',
    loadError: 'Could not load live reviews. Showing default testimonials.',
    anonymous: 'Traveler',
    carouselAria: 'Customer reviews carousel',
    prev: 'Previous review',
    next: 'Next review',
    items: [
      {
        rating: 5,
        title: 'Unforgettable safari',
        body: 'Flawless organization from start to finish. The team exceeded our expectations on our first East Africa safari.',
        author: 'Marie L.',
      },
      {
        rating: 5,
        body: 'Easy booking, responsive support and quality stays. I highly recommend them for discovering Africa with peace of mind.',
        author: 'Thomas K.',
      },
      {
        rating: 4,
        title: 'Wonderful experience',
        body: 'Varied activities and passionate guides. We loved our Zanzibar trip and the personalized follow-up from the agency.',
        author: 'Sophie M.',
      },
      {
        rating: 5,
        body: 'A reliable platform to plan a trip in Africa. Everything went as expected with excellent communication.',
        author: 'David R.',
      },
    ],
  },
  gapImpact: {
    title: 'Our impact',
    subtitle: 'See the measurable results of the GAP program for communities and conservation.',
    cta: 'Discover {programName}',
    programNameFallback: 'GAP',
  },
  footer: {
    tagline:
      'Your gateway to the best travel experiences in Africa. Discover unique destinations and book with confidence.',
    learnMore: 'Learn more',
    specialists: 'Travel Specialists',
    products: 'Our Products',
    specialistLinks: {
      premium: 'Premium Stays',
      flights: 'First Class Flights',
      safaris: 'Safaris & Tours',
      cruises: 'Coastal Cruises',
      cars: 'Car Rental',
      packages: 'Packages',
    },
    newsletter: 'Newsletter',
    newsletterDesc: 'Inspiration, travel ideas, deals and news.',
    emailPlaceholder: 'Email address',
    newsletterSubmit: 'OK',
    contact: 'Contact',
    location: 'Kinshasa, DR Congo',
    privacy: 'Privacy Policy',
    about: 'About',
    aboutPages: 'About us',
    gap: 'GAP',
    faq: 'FAQ',
    designedBy: 'Designed by',
  },
  hotels: {
    metaTitle: 'Stays in Africa',
    metaDescription:
      'Compare hotels, lodges and resorts across Africa. Find your perfect stay with Africa Tourism Gate.',
    breadcrumbHome: 'Home',
    breadcrumbHotels: 'Stays',
    breadcrumbHotelsDetail: 'Hotels',
    heroTitle: 'Exceptional stays across Africa',
    heroSubtitle:
      'Safari lodges, authentic riads and beach resorts ? curated by our travel experts.',
    resultsFor: 'Results for',
    allAfrica: 'All Africa',
    propertiesFound: 'properties',
    sortBy: 'Sort by',
    sortRecommended: 'Recommended',
    sortPriceLow: 'Price: low to high',
    sortPriceHigh: 'Price: high to low',
    sortRating: 'Top rated',
    loading: 'Searching accommodations?',
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
    galleryOpenLightbox: 'Enlarge photo',
    galleryClose: 'Close gallery',
    galleryPrevious: 'Previous photo',
    galleryNext: 'Next photo',
    galleryCounter: (current, total) => `Photo ${current} of ${total}`,
    amenitiesTitle: 'Amenities',
    roomsTitle: 'Rooms',
    descriptionTitle: 'Description',
    calendarTitle: 'Availability and rates',
    calendarLegendTitle: 'Legend',
    calendarLegendAvailable: 'Available',
    calendarLegendSelected: 'Selected dates',
    calendarLegendUnavailable: 'Unavailable',
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
    guestSingular: '1 guest',
    guestPlural: '{n} guests',
    perRoomPriceNote: 'Price per room (not multiplied by guests)',
    noRoomsForGuests: 'No rooms available for {n} guests.',
    maxGuests: 'up to {n} guests',
    bedConfig: 'Bedding',
    reserveSection: 'Book',
    guestRating: 'Guest rating',
    reviewsTitle: 'Guest reviews',
    noReviews: 'No reviews yet.',
    reviewsLoading: 'Loading reviews?',
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
    breadcrumbFlightsDetail: 'Flights',
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
    loading: 'Searching flights?',
    loadError: 'Could not load flights. Make sure the API is running.',
    retry: 'Retry',
    modifySearch: 'Modify search',
    departureDate: 'Departure date',
    returnDate: 'Return date',
    passengers: 'Passengers',
    passengerSingular: 'passenger',
    passengerPlural: '{n} passengers',
    noResults: 'No flights match your criteria',
    noResultsHint: 'Try different dates or airports (e.g. Kinshasa ? Nairobi).',
    noSearchParams: 'Start a flight search',
    noSearchParamsHint: 'Enter departure, destination and a departure date.',
    browseAllHint: 'All available flights ? fares shown for the next date with seats.',
    startSearch: 'Start search',
    backHome: 'Back to home',
    viewDetails: 'View details',
    bookNow: 'Book now',
    roundTripBadge: 'Round trip',
    roundTripFrom: 'From (round trip)',
    fromPrice: 'From',
    perPassenger: '/ passenger',
    direct: 'Direct',
    layoverSingular: '1 stop',
    layoverPlural: '{n} stops',
    layoverDuration: 'Layover {duration}',
    departure: 'Departure',
    arrival: 'Arrival',
    itineraryTitle: 'Itinerary',
    classesTitle: 'Available classes',
    selectClass: 'Select this class',
    selectClassHint: 'Select a class to book.',
    selectedClass: 'Selected',
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
    galleryAria: 'Flight photo gallery',
    galleryOpenLightbox: 'Enlarge photo',
    galleryClose: 'Close gallery',
    galleryPrevious: 'Previous photo',
    galleryNext: 'Next photo',
    galleryCounter: (current, total) => `Photo ${current} of ${total}`,
  },
  cars: {
    metaTitle: 'Car rental in Africa',
    metaDescription:
      'Compare and book rental cars at major African destinations with Africa Tourism Gate.',
    breadcrumbHome: 'Home',
    breadcrumbCars: 'Cars',
    breadcrumbCarsDetail: 'Car rental',
    heroTitle: 'Car rental in Africa',
    heroSubtitle:
      'SUVs, sedans and 4?4 from trusted local agencies ? transparent daily rates.',
    resultsFor: 'Results for',
    anyLocation: 'All cities',
    vehiclesFound: 'vehicles',
    sortBy: 'Sort by',
    sortRecommended: 'Recommended',
    sortPriceLow: 'Price: low to high',
    sortPriceHigh: 'Price: high to low',
    loading: 'Searching vehicles?',
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
    browseAllHint:
      'All available vehicles ? prices shown for the next available rental window.',
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
    infoTitle: 'Information',
    equipmentTitle: 'Equipment',
    conditionsTitle: 'Rental conditions',
    rentalPeriod: 'Rental period',
    imagePlaceholderAria: 'Vehicle illustration',
    specs: {
      seats: '{n} seats',
      airConditioningYes: 'Air conditioning',
      airConditioningNo: 'No A/C',
      listAria: 'Vehicle specifications',
    },
    transmission: {
      manual: 'Manual',
      automatic: 'Automatic',
    },
    fuel: {
      petrol: 'Petrol',
      diesel: 'Diesel',
      hybrid: 'Hybrid',
      electric: 'Electric',
    },
    equipment: {
      airConditioning: 'Air conditioning',
      bluetooth: 'Bluetooth',
      gps: 'GPS',
      usb: 'USB ports',
    },
    conditionItems: {
      minAge:
        'Driver must be at least 21 years old with a valid licence held for at least 1 year.',
      deposit:
        'Refundable security deposit required at pick-up (credit card in the main driver\'s name).',
      mileage: 'Unlimited mileage within the territory specified by the agency.',
      insurance:
        'Third-party liability insurance included; excess waiver options available on site.',
      fuelPolicy:
        'Full-to-full policy: return the vehicle with the same fuel level as at pick-up.',
    },
    galleryAria: 'Vehicle photo gallery',
    galleryOpenLightbox: 'Enlarge photo',
    galleryClose: 'Close gallery',
    galleryPrevious: 'Previous photo',
    galleryNext: 'Next photo',
    galleryCounter: (current, total) => `Photo ${current} of ${total}`,
  },
  cruises: {
    metaTitle: 'River & coastal cruises in Africa',
    metaDescription:
      'Compare and book Congo River and African coastal cruises with Africa Tourism Gate.',
    breadcrumbHome: 'Home',
    breadcrumbCruises: 'Cruises',
    breadcrumbCruisesDetail: 'Cruises',
    heroTitle: 'Cruises in Africa',
    heroSubtitle:
      'River and coastal itineraries ? pick your cabin and sail with confidence.',
    resultsFor: 'Results for',
    anyRoute: 'All routes',
    sailingsFound: 'sailings',
    sortBy: 'Sort by',
    sortRecommended: 'Recommended',
    sortPriceLow: 'Price: low to high',
    sortPriceHigh: 'Price: high to low',
    loading: 'Searching cruises?',
    loadError: 'Could not load cruises. Check that the API is running.',
    retry: 'Retry',
    modifySearch: 'Modify search',
    startDate: 'Start date',
    endDate: 'End date',
    sailFrom: 'Departure port',
    sailTo: 'Arrival port',
    guests: 'Guests',
    guestSingular: 'guest',
    guestPlural: '{n} guests',
    noResults: 'No cruises for these criteria',
    noResultsHint: 'Try other dates or ports (e.g. CDKIN ? CDBNW).',
    noSearchParams: 'Start a cruise search',
    noSearchParamsHint: 'Enter ports, a departure date range, and guest count.',
    browseAllHint: 'All available cruises ? fares for cabins in stock.',
    startSearch: 'Start search',
    backHome: 'Back to home',
    viewDetails: 'View details',
    bookNow: 'Book now',
    fromPrice: 'From',
    perGuest: '/ guest',
    departure: 'Departure',
    arrival: 'Arrival',
    itineraryTitle: 'Itinerary',
    dayLabel: 'Day {n}',
    portArrival: 'Arrival',
    portDeparture: 'Departure',
    cabinsTitle: 'Available cabins',
    selectCabin: 'Select this cabin',
    selectCabinHint: 'Select a cabin to book.',
    selectedCabin: 'Selected',
    capacityLabel: 'Up to {n} guests',
    deckLabel: 'Deck',
    deck: {
      main: 'Main deck',
      upper: 'Upper deck',
      promenade: 'Promenade deck',
    },
    cabinsLeft: '{n} cabin(s) available',
    unavailable: 'Sold out',
    insufficientCabins: 'Not enough cabins for this guest count.',
    totalCruise: 'Cruise total',
    reserveSection: 'Book',
    notFound: 'Cruise not found',
    notFoundHint: 'This sailing does not exist or is no longer available.',
    backToList: 'Back to results',
    shipLabel: 'Ship',
    cruiseLineLabel: 'Cruise line',
    nightSingular: 'night',
    nightPlural: 'nights',
    searchRequired: 'Enter ports and departure dates.',
    endAfterStart: 'End date must be after start date.',
    galleryAria: 'Ship photo gallery',
    galleryOpenLightbox: 'Enlarge photo',
    galleryClose: 'Close gallery',
    galleryPrevious: 'Previous photo',
    galleryNext: 'Next photo',
    galleryCounter: (current, total) => `Photo ${current} of ${total}`,
  },
  activities: {
    metaTitle: 'Activities & tours in Africa',
    metaDescription: 'Book guided activities and tours in Africa with Africa Tourism Gate.',
    breadcrumbHome: 'Home',
    breadcrumbActivities: 'Activities',
    heroTitle: 'Activities & tours in Africa',
    heroSubtitle:
      'Guided excursions and local experiences ? pick your time slot and book online.',
    resultsFor: 'Results for',
    anyDestination: 'All destinations',
    activitiesFound: 'activities',
    sortBy: 'Sort by',
    sortRecommended: 'Recommended',
    sortPriceLow: 'Price: low to high',
    sortPriceHigh: 'Price: high to low',
    loading: 'Searching activities?',
    loadError: 'Could not load activities. Check that the API is running.',
    destinationsLoading: 'Loading?',
    destinationsLoadError: 'Could not load destinations.',
    retry: 'Retry',
    modifySearch: 'Modify search',
    destination: 'Destination',
    date: 'Date',
    participants: 'Participants',
    participantSingular: 'participant',
    participantPlural: '{n} participants',
    noResults: 'No activities for these criteria',
    noResultsHint: 'Try another date or destination (e.g. Kinshasa).',
    noSearchParams: 'Start an activity search',
    noSearchParamsHint: 'Enter a destination, date and participant count.',
    browseHint: 'Browse available activities or refine by destination, date and participants.',
    noUpcomingSlot: 'No upcoming slots',
    backHome: 'Back to home',
    viewDetails: 'View details',
    bookNow: 'Book now',
    fromPrice: 'From',
    perParticipant: '/ participant',
    schedulesTitle: 'Available time slots',
    selectSchedule: 'Select this slot',
    selectScheduleHint: 'Select a time slot to book.',
    placesLeft: '{n} place(s) left',
    unavailable: 'Sold out',
    insufficientPlaces: 'Not enough places for this participant count.',
    totalActivity: 'Activity total',
    reserveSection: 'Book',
    notFound: 'Activity not found',
    notFoundHint: 'This activity does not exist or has no available time slots.',
    backToList: 'Back to results',
    providerLabel: 'Provider',
    durationLabel: 'Duration',
    difficultyLabel: 'Difficulty',
    hourSingular: '1 hr',
    hourPlural: '{n} hr',
    minuteSingular: '1 min',
    minutePlural: '{n} min',
    searchRequired: 'Enter a date.',
    descriptionTitle: 'Description',
    nextSlot: 'Next slot',
    schedulesAvailable: '{n} slot(s) available',
    noSchedulesTitle: 'No time slots for this date',
    noSchedulesHint: 'Try another date or modify your search.',
    selectedScheduleLabel: 'Selected time slot',
    difficultyEasy: 'Easy',
    difficultyModerate: 'Moderate',
    difficultyHard: 'Hard',
    difficultyExpert: 'Expert',
    ratingAria: 'Average rating {rating} out of 5',
    reviewCount: '{n} reviews',
    galleryAria: 'Activity photo gallery',
    galleryOpenLightbox: 'Enlarge photo',
    galleryClose: 'Close gallery',
    galleryPrevious: 'Previous photo',
    galleryNext: 'Next photo',
    galleryCounter: (current, total) => `Photo ${current} of ${total}`,
    itineraryTitle: 'Itinerary',
    itineraryMapAria: 'Activity itinerary map',
    itineraryStopLabel: 'Coordinates',
    itineraryStopDuration: 'Duration',
  },
  packages: {
    metaTitle: 'Combined packages in Africa',
    metaDescription:
      'Save with bundled travel packages ? activities, stays and more on Africa Tourism Gate.',
    breadcrumbHome: 'Home',
    breadcrumbPackages: 'Packages',
    heroTitle: 'Combined packages in Africa',
    heroSubtitle:
      'Bundle multiple services at a discount ? compare catalog price and package price.',
    cardBadge: 'Combined package',
    resultsFor: 'Available packages',
    packagesFound: 'packages',
    sortBy: 'Sort by',
    sortRecommended: 'Recommended',
    sortPriceLow: 'Price: low to high',
    sortPriceHigh: 'Price: high to low',
    displayModeLabel: 'View',
    displayModeCards: 'Cards',
    displayModeList: 'List',
    displayModeCompact: 'Compact',
    loading: 'Loading packages?',
    loadingDetail: 'Loading package?',
    loadError: 'Could not load packages. Check that the API is running.',
    retry: 'Retry',
    modifySearch: 'Modify search',
    searchLabel: 'Search',
    searchPlaceholder: 'Package name?',
    searchSubmit: 'Search',
    browseHint: 'Browse all active packages or search by name.',
    noResults: 'No packages found',
    noResultsHint: 'Try another keyword or check back later.',
    backHome: 'Back to home',
    viewDetails: 'View details',
    bookNow: 'Book now',
    packagePrice: 'Package price',
    discountBadge: '-{n}%',
    discountSummary: 'Package discount: {n}%',
    itemsIncluded: '{n} included service(s)',
    itemsTitle: 'Included services',
    noItems: 'This package has no services yet.',
    viewProduct: 'View product',
    itemDetailClose: 'Close',
    itemDetailLoading: 'Loading service details?',
    itemDetailError: 'Could not load details for this service.',
    itemDetailPriceLabel: 'Indicative price',
    itemDetailGenericHint: 'Open the full product page to see all details for this service.',
    itemDetailViewFullPage: 'View full product page',
    pricingTitle: 'Package pricing',
    youSave: 'You save {amount}',
    configurePackage: 'Configure package',
    activityConfigureHint:
      'Pick a time slot for each included activity, then add the package to your cart.',
    mixedConfigureHint:
      'Configure each included service, then add the full package to your cart.',
    configureTitle: 'Book this package',
    selectDateHint: 'Enter a date to show available time slots.',
    configureOnProduct: 'Configure on product page',
    configureOnProductHint: 'Complete booking on the dedicated product page.',
    mixedCheckoutDisabled:
      'The package discount applies to grouped checkout once every service is configured.',
    loadingActivitySchedules: 'Loading time slots?',
    activitySchedulesError: 'Could not load time slots for this activity.',
    noActivitySchedules: 'No time slots available for this date.',
    schedulesProgress: '{selected} / {total} activity(ies) configured',
    itemsProgress: '{selected} / {total} service(s) configured',
    allSchedulesRequired: 'Select a time slot for every activity in the package.',
    allItemsRequired: 'Configure every service in the package before adding to cart.',
    selectStayDatesHint: 'Enter check-in and check-out dates to choose a room.',
    loadingPropertyRooms: 'Loading rooms?',
    propertyRoomsError: 'Could not load rooms for this property.',
    selectDepartureDateHint: 'Enter the flight departure date.',
    loadingFlightClasses: 'Loading fare classes?',
    flightClassesError: 'Could not load classes for this flight.',
    selectRentalDatesHint: 'Enter pickup and return dates.',
    loadingVehicleAvailability: 'Checking availability?',
    vehicleAvailabilityError: 'Vehicle unavailable for these dates.',
    vehicleDatesConfirmed: 'Vehicle available for these dates',
    selectSailingHint: 'Enter the cruise sailing ID (sailingId).',
    sailingIdLabel: 'Sailing ID',
    sailingIdPlaceholder: '00000000-0000-4000-8000-000000003036',
    loadingCruiseCabins: 'Loading cabins?',
    cruiseCabinsError: 'Could not load cabins for this sailing.',
    addToCart: 'Add to cart',
    packageCartInvalid: 'Package configuration is unavailable or incomplete.',
    modifySelection: 'Modify selection',
    departureDateLabel: 'Departure date',
    returnDateLabel: 'Return date',
    travelersLabel: 'Travelers',
    durationDaysLabel: '{days} day(s)',
    packageBookingHint:
      'Pick a departure date and number of travelers. Time slots will be confirmed by our team after your request.',
    selectDepartureHint: 'Enter a departure date to prepare your booking.',
    includedServicesTitle: 'Included services',
    assistedBookingServicesHint:
      'Exact time slots will be assigned after our team validates your request.',
    resolvingPackage: 'Checking availability?',
    resolvingItem: 'Pending?',
    itemAutoResolved: 'Included',
    itemUnavailable: 'Unavailable',
    itemMissing: 'Not configured',
    itemResolveError: 'Error',
    someItemsUnavailable:
      'Some included services are unavailable for these dates. Try another departure date.',
    someItemsMissing:
      'Some package services could not be matched to catalog entries.',
    notFound: 'Package not found',
    notFoundHint: 'This package does not exist or is no longer available.',
    backToList: 'Back to packages',
    itemTypes: {
      property: 'Stay',
      flight: 'Flight',
      vehicle: 'Vehicle',
      cruise: 'Cruise cabin',
      activity: 'Activity',
    },
    galleryAria: 'Package photo gallery',
    galleryOpenLightbox: 'Enlarge photo',
    galleryClose: 'Close gallery',
    galleryPrevious: 'Previous photo',
    galleryNext: 'Next photo',
    galleryCounter: (current, total) => `Photo ${current} of ${total}`,
    attachmentsTitle: 'Attachments',
    attachmentsCount: '{count} attachment(s)',
    openAttachment: 'Open file',
    attachmentImageAlt: 'Attached image',
    attachmentFallbackName: 'Attachment',
    descriptionShowMore: 'Show more',
    descriptionShowLess: 'Show less',
    stepOverview: 'Included services overview',
    stepConfigure: 'Configure each service',
    stepBook: 'Book',
    stepRecap: 'Summary',
    stepOverviewShort: 'Overview',
    stepConfigureShort: 'Config',
    stepBookShort: 'Book',
    stepRecapShort: 'Summary',
    compositionStepperAria: 'Package composition steps',
    configureProgress: '{done} / {total} service(s) configured',
    bookingReadyHint: 'Dates and travelers set',
    bookingPendingHint: 'Enter a departure date',
    assistedItemPendingSchedule: 'Time slot to be confirmed after approval',
    travelerSingular: 'traveler',
    travelerPlural: 'travelers',
    estimatedPackageTotal: 'Estimated total',
    startConfiguration: 'Book this package',
    stepBack: 'Back',
    viewRecap: 'View summary',
    recapTitle: 'Package summary',
    recapHint:
      'Review your travel details before adding the package to your cart. Your request will be handled by our team.',
    configureSchedulesTitle: 'Choose time slots',
    itemConfigured: 'Configured',
    itemPending: 'Pending',
    recapActivityLine: '{n} participant(s) ? slot selected',
    recapPropertyLine: 'Stay from {checkIn} to {checkOut}',
    recapFlightLine: 'Departure on {date}',
    recapVehicleLine: 'From {pickup} to {return}',
    recapCruiseLine: '{guests} guest(s) ? cabin selected',
    estimatedSavings: 'Estimated savings: {amount}',
    itineraryMapTitle: 'Package map',
    itineraryMapAria: 'Map of locations included in this package',
    itineraryMapLegendTitle: 'Legend',
    itineraryMapLegendPoints: '({count})',
    itineraryMapPartialHint:
      'Some services (vehicle, cruise) are not shown on the map because geographic coordinates are unavailable.',
  },
  account: {
    title: 'My account',
    subtitle: 'Manage your profile, addresses and bookings.',
    browseSite: 'Browse accommodations',
    navAria: 'Account navigation',
    loading: 'Loading?',
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
      saving: 'Saving?',
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
      saving: 'Saving?',
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
      empty: 'No bookings yet',
      emptyDescription:
        'Trips you book through Africa Tourism Gate will appear here. Start by exploring hotels, flights, and activities.',
      emptyBrowse: 'Browse offers',
      emptyFilter: 'No bookings match this filter.',
      reference: 'Reference',
      date: 'Date',
      status: 'Status',
      total: 'Total',
      view: 'View',
      back: 'Back to bookings',
      notFound: 'Booking not found.',
      loadError: 'Could not load bookings.',
      filterAll: 'All',
      filterConfirmed: 'Completed',
      filterPending: 'Pending',
      filterCancelled: 'Cancelled',
      filterAria: 'Filter by status',
      actionRequired: 'Action required',
      leaveReviewCta: 'Leave a review',
      reviewPrompt:
        'You have {count} completed stay(s) waiting for a review ? share your experience.',
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
        paying: 'Redirecting to payment?',
        payError: 'Could not open the payment page.',
        cancelBooking: 'Cancel booking',
        cancelling: 'Cancelling?',
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
        submittingReview: 'Submitting?',
        reviewSubmitError: 'Could not submit your review.',
        reviewRatingRequired: 'Please select a rating from 1 to 5.',
        reviewCharCount: '{current} / {max}',
        reviewPublished: 'Thank you, your review has been published.',
        reviewStarAria: '{n} out of 5',
        timelineTitle: 'Booking progress',
        timelinePlaceholder:
          'Detailed history unavailable ? steps estimated from current status.',
        timelineStepCreated: 'Booking created',
        timelineStepPending: 'Awaiting payment',
        timelineStepConfirmed: 'Confirmed',
        timelineStepCancelled: 'Cancelled',
        timelineStepRefunded: 'Refunded',
        timelineStepRequest: 'Request submitted',
        timelineStepValidation: 'Team validation',
        timelineStepDiscussion: 'Conversation',
        timelineStepPayment: 'Payment',
        timelineCurrent: 'Current step',
        timelineUpcoming: 'Upcoming',
        proceedToPayment: 'Proceed to payment',
        paymentInvitePending:
          'You will receive an email with the payment link once your request is approved.',
        identityDocuments: {
          title: 'Identity document',
          subtitle:
            'Upload a readable identity document (passport, national ID?) to validate your booking.',
          empty: 'No document uploaded yet.',
          documentType: 'Document type',
          file: 'File',
          fileHint: 'JPEG, PNG, WebP or PDF ? 10 MB max.',
          upload: 'Upload document',
          uploading: 'Uploading?',
          uploadError: 'Could not upload the document.',
          fileTooLarge: 'File too large (10 MB max).',
          view: 'View',
          viewing: 'Opening?',
          viewError: 'Could not open the document.',
          statusLabel: 'Status',
          types: {
            passport: 'Passport',
            national_id: 'National ID',
            drivers_license: "Driver's license",
            other: 'Other',
          },
          statuses: {
            pending_review: 'Under review',
            approved: 'Approved',
            resubmit_requested: 'Clearer version requested',
            rejected: 'Rejected',
          },
        },
        manifest: {
          title: 'Traveler list',
          subtitle: 'Fill in the details for each traveler included in this booking.',
          empty: 'No travelers added yet.',
          loading: 'Loading?',
          loadError: 'Could not load the traveler list.',
          addTraveler: 'Add traveler',
          addTitle: 'Add a traveler',
          editTitle: 'Edit traveler',
          formHint: 'Only the full name is required.',
          fullNameRequired: 'Full name is required.',
          save: 'Save',
          saving: 'Saving?',
          saveError: 'Could not save the traveler.',
          edit: 'Edit',
          delete: 'Remove',
          deleting: 'Removing?',
          deleteError: 'Could not remove the traveler.',
          deleteTitle: 'Remove this traveler?',
          deleteDescription: 'Confirm removal of {name} from the traveler list.',
          cancel: 'Cancel',
          sex: {
            unspecified: 'Not specified',
            M: 'Male',
            F: 'Female',
            other: 'Other',
          },
          fields: {
            fullName: 'Full name',
            age: 'Age',
            sex: 'Gender',
            nationality: 'Nationality',
            idNumber: 'ID / Passport number',
            conditions: 'Medical conditions',
            conditionsPlaceholder: 'Allergies, ongoing treatments, special needs?',
            comment: 'Comment',
            commentPlaceholder: 'Additional information?',
            other: 'Other information',
            otherPlaceholder: 'Any other relevant information?',
          },
        },
        messages: {
          title: 'Conversation',
          subtitle: 'Chat with our team about your booking request.',
          loading: 'Loading messages?',
          empty: 'No messages yet. Our team will reply here.',
          threadAria: 'Booking message thread',
          authorStaff: 'Team',
          authorCustomer: 'You',
          replyTitle: 'Your message',
          replyLabel: 'Message',
          replyPlaceholder: 'Write your message?',
          sendReply: 'Send',
          loadError: 'Could not load the conversation.',
          sendError: 'Could not send your message.',
          newStaffMessageToast: 'New message from our team',
          fabAriaLabel: 'Open conversation',
          fabAriaLabelWithUnread: 'Open conversation ({count} unread)',
          pickerTitle: 'Your conversations',
          pickerSubtitle: 'Select a booking to open the chat.',
          pickerEmpty: 'No bookings with an active conversation.',
          pickerLoading: 'Loading your bookings?',
          backToReservations: 'Back to bookings',
          viewBooking: 'View booking',
          unreadBadge: '{count} unread message(s)',
        },
        guideReviews: {
          sectionTitle: 'Your guide',
          sectionHint: 'Share your experience with the guide(s) assigned to your stay.',
          rolePrimary: 'Primary guide',
          roleSecondary: 'Secondary guide',
          leaveReview: 'Rate this guide',
          leaveReviewHint: 'Your review will be published after our team moderates it.',
          submitReview: 'Submit review',
          yourReview: 'Your review',
          reviewPublished: 'Thank you ? your review was submitted and will be published after moderation.',
        },
      },
    },
    paymentMethods: {
      empty: 'No payment methods saved.',
      addNew: 'Add payment method',
      add: 'Add',
      saving: 'Saving?',
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
    formSubtitle: 'Describe your request ? we open a ticket and reply by email.',
    signInPrompt: 'Sign in to send a request to support.',
    signInCta: 'Sign in',
    checkingSession: 'Checking session?',
    subjectLabel: 'Subject',
    subjectPlaceholder: 'e.g. Question about booking #?',
    messageLabel: 'Message',
    messagePlaceholder: 'Describe your situation in a few sentences?',
    submit: 'Send request',
    submitting: 'Sending?',
    successTitle: 'Request received',
    successMessage:
      'Thank you. Your ticket was created. Keep this reference: {ticketId}. Our team will reply within 1?2 business days.',
    subjectRequired: 'Subject is required.',
    messageTooShort: 'Message must be at least 10 characters.',
    submitError: 'Could not send your request. Please try again.',
    faq: {
      booking: {
        question: 'How do I change or cancel a booking?',
        answer:
          'Open My account ? Bookings, select your stay and use the available actions (pay, cancel). If an option is missing, contact us with your booking reference.',
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
          'We handle requests Monday?Friday. Most tickets get a first reply within 1?2 business days.',
      },
    },
  },
  blog: {
    metaTitle: 'Africa travel blog',
    metaDescription:
      'Tips, guides and inspiration to plan your next trip to Africa with Africa Tourism Gate.',
    heroTitle: 'Blog',
    heroSubtitle: 'Guides, tips and inspiration for traveling in Africa.',
    readMore: 'Read more',
    loading: 'Loading articles?',
    loadError: 'Could not load the blog. Check that the API is running.',
    retry: 'Retry',
    noResults: 'No published articles',
    noResultsHint: 'Check back soon for new content.',
    localeFallback:
      'No articles in your language yet ? showing posts available in other languages.',
    backToBlog: 'Back to blog',
    publishedOn: 'Published on',
    breadcrumbHome: 'Home',
    breadcrumbBlog: 'Blog',
  },
  about: {
    heroTitle: 'About us',
    heroSubtitle:
      'Discover our mission, team and commitment to responsible tourism across Africa.',
    sidebarAria: 'About sections',
    breadcrumbHome: 'Home',
    breadcrumbAbout: 'About',
    loading: 'Loading?',
    loadError: 'Could not load content. Check that the API is running.',
    emptyPage: 'Content coming soon',
    emptyPageHint: 'This section will be available shortly. Contact us to learn more.',
    localeFallback:
      'Showing content in another language ? your language version will be published soon.',
    nav: {
      whoWeAre: 'Who we are',
      history: 'Our history',
      team: 'Our team',
      howWeWork: 'How we work',
      governance: 'Our governance',
      reports: 'Reports & finances',
      responsibility: 'Responsibility',
      media: 'Media & resources',
      contact: 'Contact us',
    },
    team: {
      empty: 'No team members published yet.',
    },
    timeline: {
      intro:
        'Explore the key milestones that shaped Africa Tourism Gate, from our beginnings to our vision for the future.',
      empty: 'No timeline milestones published yet.',
      readMore: 'Read more',
      sidebarAria: 'History periods',
    },
    resources: {
      empty: 'No documents available yet.',
      download: 'Download',
      openLink: 'Open link',
      publishedOn: 'Published on',
    },
    contact: {
      subtitle: 'Our team is here to answer your questions.',
      infoTitle: 'Contact details',
      formTitle: 'Send a message',
      formSubtitle: 'Describe your request ? we will get back to you as soon as possible.',
    },
    meta: {
      whoWeAre: {
        title: 'Who we are',
        description:
          'Discover Africa Tourism Gate: our mission, vision and commitment to tourism across Africa.',
      },
      history: {
        title: 'Our history',
        description:
          'Trace the major milestones in Africa Tourism Gate?s development through an interactive timeline.',
      },
      team: {
        title: 'Our team',
        description: 'Meet the people behind Africa Tourism Gate.',
      },
      howWeWork: {
        title: 'How we work',
        description:
          'Our approach to quality, transparency and local partnerships for travel in Africa.',
      },
      governance: {
        title: 'Our governance',
        description:
          'Governance structure, decision-making and institutional transparency at Africa Tourism Gate.',
      },
      reports: {
        title: 'Reports & finances',
        description:
          'Browse activity reports and financial documents published by Africa Tourism Gate.',
      },
      responsibility: {
        title: 'Responsibility',
        description:
          'Our commitments to sustainable, ethical and responsible tourism in Africa.',
      },
      media: {
        title: 'Media & resources',
        description: 'Press kit, logos and media resources about Africa Tourism Gate.',
      },
      contact: {
        title: 'Contact us',
        description:
          'Reach the Africa Tourism Gate team by phone, email or support form.',
      },
    },
  },
  comingSoon: {
    badge: 'Coming soon',
    title: 'Coming soon',
    siteBody:
      'This section of the site is being prepared. Check back soon for new features on Africa Tourism Gate.',
    body: 'Online booking for this category is launching soon. Your search criteria have been kept in the URL.',
    backToSearch: 'Change my search',
    backHome: 'Back to home',
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
        passwordPlaceholder: '????????',
        submit: 'Sign in',
        submitLoading: 'Signing in?',
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
