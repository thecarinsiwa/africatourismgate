import type { Locale } from './types';
import { es } from './translations-es';

export type Translations = {
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
    payWithCash: string;
    cashSubmitting: string;
    paymentMethodTitle: string;
    paymentMethodHint: string;
    paymentMethodRequired: string;
    paymentMethodStripe: string;
    paymentMethodStripeHint: string;
    paymentMethodCash: string;
    paymentMethodCashHint: string;
    paymentMethodBankTransfer: string;
    paymentMethodBankTransferHint: string;
    payWithBankTransfer: string;
    bankTransferSubmitting: string;
    bankTransferAccountsTitle: string;
    bankTransferAccountsEmpty: string;
    bankTransferHolder: string;
    bankTransferAccountNumber: string;
    bankTransferSwift: string;
    bankTransferCurrency: string;
    bankTransferReferenceHint: string;
    paymentMethodMobileMoney: string;
    paymentMethodMobileMoneyHint: string;
    payWithMobileMoney: string;
    mobileMoneySubmitting: string;
    mobileMoneyTitle: string;
    mobileMoneyEmpty: string;
    mobileMoneyCountry: string;
    mobileMoneyOperator: string;
    mobileMoneyPhone: string;
    mobileMoneyLabel: string;
    mobileMoneyReferenceHint: string;
    mobileMoneySelectCountry: string;
    mobileMoneySelectOperator: string;
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
      titleCashPending: string;
      titleBankTransferPending: string;
      titleMobileMoneyPending: string;
      subtitle: string;
      subtitleConfirmed: string;
      subtitleCashPending: string;
      subtitleBankTransferPending: string;
      subtitleMobileMoneyPending: string;
      bookingIdLabel: string;
      statusLabel: string;
      statusConfirmed: string;
      statusPendingPayment: string;
      statusPendingHint: string;
      statusCashPending: string;
      statusCashPendingHint: string;
      statusBankTransferPending: string;
      statusBankTransferPendingHint: string;
      statusMobileMoneyPending: string;
      statusMobileMoneyPendingHint: string;
      totalLabel: string;
      paidLabel: string;
      balanceLabel: string;
      depositDueLabel: string;
      cancellationPolicyTitle: string;
      cancellationPolicyBody: string;
      verifying: string;
      statusUnavailable: string;
      backHome: string;
      browseHotels: string;
      viewAccount: string;
      signOut: string;
      nextStepsTitle: string;
      nextStepEmail: string;
      nextStepAccount: string;
      nextStepCash: string;
      nextStepBankTransfer: string;
      nextStepMobileMoney: string;
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
      nationalityPlaceholder: string;
      nationalitySearch: string;
      nationalityEmpty: string;
      idNumber: string;
      medicalSection: string;
      allergies: string;
      allergiesPlaceholder: string;
      seriousMedicalConditions: string;
      seriousMedicalConditionsPlaceholder: string;
      currentMedications: string;
      currentMedicationsPlaceholder: string;
      dietaryNotes: string;
      dietaryNotesPlaceholder: string;
      emergencyContactSection: string;
      emergencyContactName: string;
      emergencyContactPhone: string;
      emergencyContactEmail: string;
      emergencyContactCountry: string;
      emergencyContactAddress: string;
      emergencyContactAddressPlaceholder: string;
      fullNameRequired: string;
      nationalityRequired: string;
      idNumberRequired: string;
      emergencyContactNameRequired: string;
      emergencyContactPhoneRequired: string;
      idDocument: string;
      idDocumentHint: string;
      idDocumentSelected: string;
      idDocumentRemove: string;
      viewDocument: string;
      takePhoto: string;
      cameraCapture: string;
      cameraRetake: string;
      cameraConfirm: string;
      cameraCancel: string;
      cameraError: string;
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
      photo: string;
      photoHint: string;
      photoAdd: string;
      photoChange: string;
      photoUploading: string;
      photoUploadError: string;
      photoTooLarge: string;
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
        paidLabel: string;
        balanceLabel: string;
        depositDueLabel: string;
        cancellationPolicyTitle: string;
        cancellationPolicyBody: string;
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
        downloadConfirmation: string;
        downloadingConfirmation: string;
        downloadConfirmationError: string;
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
        cashPaymentPending: string;
        bankTransferPaymentPending: string;
        mobileMoneyPaymentPending: string;
        paymentProofs: {
          title: string;
          subtitle: string;
          empty: string;
          upload: string;
          uploading: string;
          takePhoto: string;
          fileHint: string;
          uploadError: string;
          fileTooLarge: string;
          view: string;
          viewing: string;
          viewError: string;
          statusLabel: string;
          amountLabel: string;
          methods: {
            bank_transfer: string;
            mobile_money: string;
          };
          statuses: {
            pending_review: string;
            approved: string;
            resubmit_requested: string;
            rejected: string;
          };
          camera: {
            capture: string;
            retake: string;
            confirm: string;
            cancel: string;
            cameraError: string;
          };
        };
        identityDocuments: {
          title: string;
          subtitle: string;
          empty: string;
          loading: string;
          traveler: string;
          travelerRequired: string;
          travelerEmpty: string;
          unlinkedTitle: string;
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
          viewDocuments: string;
          viewDocument: string;
          docsTitle: string;
          docsEmpty: string;
          docsLoadError: string;
          docsUnlinkedTitle: string;
          addTitle: string;
          editTitle: string;
          formHint: string;
          fullNameRequired: string;
          nationalityRequired: string;
          idNumberRequired: string;
          emergencyContactNameRequired: string;
          emergencyContactPhoneRequired: string;
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
            nationalityPlaceholder: string;
            nationalitySearch: string;
            nationalityEmpty: string;
            idNumber: string;
            medicalSection: string;
            allergies: string;
            allergiesPlaceholder: string;
            seriousMedicalConditions: string;
            seriousMedicalConditionsPlaceholder: string;
            currentMedications: string;
            currentMedicationsPlaceholder: string;
            dietaryNotes: string;
            dietaryNotesPlaceholder: string;
            legacyConditions: string;
            emergencyContactSection: string;
            emergencyContactName: string;
            emergencyContactPhone: string;
            emergencyContactEmail: string;
            emergencyContactCountry: string;
            emergencyContactAddress: string;
            emergencyContactAddressPlaceholder: string;
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

const fr = {
  nav: {
    home: 'Accueil',
    about: 'À propos',
    gallery: 'Galerie',
    pages: 'Nos Produits',
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
  checkout: {
    stepperAriaLabel: 'Étapes de réservation',
    stepCart: 'Panier',
    stepRecap: 'Récap',
    stepPayment: 'Paiement',
    stepRequest: 'Demande',
    stepConfirmation: 'Confirmation',
    stepCancelled: 'Annulé',
    cartTitle: 'Panier réservation',
    recapTitle: 'Récapitulatif',
    continueToRecap: 'Continuer vers récap',
    backToCart: 'Retour panier',
    payWithStripe: 'Payer avec Stripe',
    payWithCash: 'Confirmer — paiement sur place',
    cashSubmitting: 'Enregistrement…',
    paymentMethodTitle: 'Mode de paiement',
    paymentMethodHint: 'Choisissez comment vous souhaitez régler cette réservation.',
    paymentMethodRequired: 'Sélectionnez un mode de paiement pour continuer.',
    paymentMethodStripe: 'Carte (Stripe)',
    paymentMethodStripeHint: 'Paiement sécurisé en ligne immédiat.',
    paymentMethodCash: 'Espèces sur place',
    paymentMethodCashHint: 'Réservation en attente — paiement en agence ou à l’arrivée.',
    paymentMethodBankTransfer: 'Virement bancaire',
    paymentMethodBankTransferHint:
      'Réservation en attente — réglez par virement ; validation par notre équipe.',
    payWithBankTransfer: 'Confirmer — paiement par virement',
    bankTransferSubmitting: 'Enregistrement…',
    bankTransferAccountsTitle: 'Coordonnées bancaires',
    bankTransferAccountsEmpty:
      'Aucun compte bancaire n’est publié pour le moment. Contactez-nous pour obtenir les coordonnées.',
    bankTransferHolder: 'Titulaire',
    bankTransferAccountNumber: 'N° de compte / IBAN',
    bankTransferSwift: 'SWIFT / BIC',
    bankTransferCurrency: 'Devise',
    bankTransferReferenceHint: 'Indiquez la référence {ref} dans le libellé du virement.',
    paymentMethodMobileMoney: 'Mobile Money',
    paymentMethodMobileMoneyHint:
      'Réservation en attente — payez via Mobile Money puis envoyez une preuve.',
    payWithMobileMoney: 'Confirmer — paiement Mobile Money',
    mobileMoneySubmitting: 'Enregistrement…',
    mobileMoneyTitle: 'Paiement Mobile Money',
    mobileMoneyEmpty:
      'Aucune configuration Mobile Money n’est publiée pour le moment. Contactez-nous pour obtenir les numéros.',
    mobileMoneyCountry: 'Pays',
    mobileMoneyOperator: 'Opérateur',
    mobileMoneyPhone: 'Numéro',
    mobileMoneyLabel: 'Libellé',
    mobileMoneyReferenceHint: 'Indiquez la référence {ref} dans le message du transfert.',
    mobileMoneySelectCountry: 'Sélectionner un pays',
    mobileMoneySelectOperator: 'Sélectionner un opérateur',
    requestBooking: 'Demander une réservation',
    requestSubmitting: 'Envoi de la demande…',
    stripeRedirecting: 'Redirection Stripe…',
    estimatedTotal: 'Total estimé',
    loading: 'Chargement…',
    authRequiredNext: 'Connexion client requise au prochain écran.',
    authRequiredPayment: 'Connexion client requise pour lancer le paiement.',
    authRequiredRequest: 'Connexion client requise pour envoyer votre demande.',
    invalidDraft: 'Données de réservation incomplètes. Reprenez depuis une fiche produit.',
    invalidDraftBack: 'Retour aux hébergements',
    invalidRecap: 'Données de réservation invalides. Revenez au panier.',
    modifySelection: 'Modifier la sélection',
    resumeSearch: 'Reprendre la recherche',
    stripeError: {
      authTitle: 'Connexion requise',
      authDescription: 'Authentification requise pour continuer vers le paiement.',
      authHint: 'Connectez-vous puis relancez le paiement depuis le récapitulatif.',
      networkTitle: 'Connexion interrompue',
      networkHint: 'Vérifiez votre réseau et réessayez dans quelques instants.',
      paymentTitle: 'Paiement refusé',
      paymentHint: 'Vérifiez votre carte ou essayez un autre moyen de paiement.',
      genericTitle: 'Paiement impossible',
      genericHint: 'Réessayez ou revenez au panier pour vérifier votre sélection.',
      dismiss: 'Fermer',
    },
    success: {
      title: 'Confirmation en cours',
      titleConfirmed: 'Réservation confirmée',
      titleCashPending: 'Réservation enregistrée',
      titleBankTransferPending: 'Réservation enregistrée',
      titleMobileMoneyPending: 'Réservation enregistrée',
      subtitle:
        'Votre paiement Stripe est reçu. Nous finalisons la confirmation de votre réservation…',
      subtitleConfirmed:
        'Votre paiement a été reçu et votre réservation est confirmée.',
      subtitleCashPending:
        'Cette réservation est en paiement espèces. Elle reste en attente jusqu’à l’encaissement en agence (même si le cash n’est plus proposé au checkout web).',
      subtitleBankTransferPending:
        'Vous avez choisi le virement bancaire. Votre réservation reste en attente jusqu’à validation du virement par notre équipe.',
      subtitleMobileMoneyPending:
        'Vous avez choisi Mobile Money. Votre réservation reste en attente jusqu’à validation du paiement par notre équipe.',
      bookingIdLabel: 'Réf. réservation :',
      statusLabel: 'Statut :',
      statusConfirmed: 'Confirmée',
      statusPendingPayment: 'En attente de paiement',
      statusPendingHint:
        'La confirmation prend plus de temps que prévu. Consultez votre compte dans quelques instants ou contactez le support si le statut ne change pas.',
      statusCashPending: 'En attente de paiement cash',
      statusCashPendingHint:
        'Présentez-vous en agence ou réglez à l’arrivée avec le montant dû. Notre équipe confirmera la réservation après encaissement.',
      statusBankTransferPending: 'En attente de virement',
      statusBankTransferPendingHint:
        'Effectuez le virement avec la référence indiquée. La réservation sera confirmée après validation par notre équipe.',
      statusMobileMoneyPending: 'En attente de paiement Mobile Money',
      statusMobileMoneyPendingHint:
        'Effectuez le transfert Mobile Money avec la référence indiquée, puis envoyez une preuve. La réservation sera confirmée après validation.',
      totalLabel: 'Total :',
      paidLabel: 'Déjà payé :',
      balanceLabel: 'Solde restant :',
      depositDueLabel: 'À régler maintenant :',
      cancellationPolicyTitle: 'Politique d’annulation (indicative)',
      cancellationPolicyBody:
        'En cas d’acompte, le solde doit être réglé avant la date de service. L’acompte n’est généralement pas remboursable sauf accord contraire. Cette mention est informative — contactez-nous pour toute question.',
      verifying: 'Vérification du statut en cours…',
      statusUnavailable:
        'Statut détaillé indisponible pour le moment. Rechargez la page dans quelques instants.',
      backHome: 'Retour accueil',
      browseHotels: 'Voir les hôtels',
      viewAccount: 'Mon compte',
      signOut: 'Se déconnecter',
      nextStepsTitle: 'Prochaines étapes',
      nextStepEmail: 'Un e-mail de confirmation vous sera envoyé sous peu.',
      nextStepAccount: 'Consultez vos réservations depuis votre espace compte.',
      nextStepCash:
        'Préparez le montant en espèces pour le règlement en agence ou à l’arrivée — la confirmation suit l’encaissement.',
      nextStepBankTransfer:
        'Effectuez le virement en indiquant la référence de réservation dans le libellé.',
      nextStepMobileMoney:
        'Effectuez le transfert Mobile Money puis envoyez une preuve de paiement.',
    },
    requestSuccess: {
      title: 'Demande envoyée',
      subtitle:
        'Votre demande de réservation a bien été transmise à notre équipe. Vous serez contacté sous 24 à 48 h.',
      bookingIdLabel: 'Réf. demande :',
      statusLabel: 'Statut :',
      totalLabel: 'Total estimé :',
      verifying: 'Vérification du statut en cours…',
      statusUnavailable:
        'Statut détaillé indisponible pour le moment. Rechargez la page dans quelques instants.',
      backHome: 'Retour accueil',
      browseActivities: 'Voir les activités',
      viewAccount: 'Mon compte',
      signOut: 'Se déconnecter',
      nextStepsTitle: 'Prochaines étapes',
      nextStepContact: 'Notre équipe validera votre demande et vous contactera par e-mail.',
      nextStepAccount: "Suivez l\u2019avancement depuis votre espace compte.",
    },
    manifest: {
      title: 'Informations des voyageurs',
      subtitle:
        'Renseignez les informations de chaque voyageur. Nom, nationalité, n° de pièce et contact d’urgence (nom + téléphone) sont obligatoires. Le genre est optionnel.',
      travelerN: 'Voyageur {n}',
      fullName: 'Nom complet',
      age: 'Âge',
      sex: 'Genre',
      sexUnspecified: 'Non précisé',
      sexM: 'Homme',
      sexF: 'Femme',
      sexOther: 'Autre',
      nationality: 'Nationalité',
      nationalityPlaceholder: 'Choisir un pays',
      nationalitySearch: 'Rechercher un pays…',
      nationalityEmpty: 'Aucun pays trouvé.',
      idNumber: "N° pièce d'identité",
      medicalSection: 'Informations médicales',
      allergies: 'Allergies',
      allergiesPlaceholder: 'Ex. pollen, arachides…',
      seriousMedicalConditions: 'Conditions médicales graves',
      seriousMedicalConditionsPlaceholder: 'Ex. asthme, diabète…',
      currentMedications: 'Traitements en cours',
      currentMedicationsPlaceholder: 'Ex. médicaments quotidiens…',
      dietaryNotes: 'Notes alimentaires',
      dietaryNotesPlaceholder: 'Ex. végétarien, sans gluten…',
      emergencyContactSection: "Contact d'urgence",
      emergencyContactName: 'Nom du contact',
      emergencyContactPhone: 'Téléphone',
      emergencyContactEmail: 'E-mail',
      emergencyContactCountry: 'Pays',
      emergencyContactAddress: 'Adresse',
      emergencyContactAddressPlaceholder: 'Rue, ville…',
      fullNameRequired: 'Le nom complet du voyageur {n} est obligatoire.',
      nationalityRequired: 'La nationalité du voyageur {n} est obligatoire.',
      idNumberRequired: "Le n° de pièce d'identité du voyageur {n} est obligatoire.",
      emergencyContactNameRequired:
        "Le nom du contact d'urgence du voyageur {n} est obligatoire.",
      emergencyContactPhoneRequired:
        "Le téléphone du contact d'urgence du voyageur {n} est obligatoire.",
      idDocument: "Pièce d'identité",
      idDocumentHint: 'JPEG, PNG, WebP ou PDF — 10 Mo max.',
      idDocumentSelected: 'Choisir un fichier',
      idDocumentRemove: 'Retirer',
      viewDocument: 'Voir le document',
      takePhoto: 'Prendre une photo',
      cameraCapture: 'Capturer',
      cameraRetake: 'Reprendre',
      cameraConfirm: 'Confirmer',
      cameraCancel: 'Annuler',
      cameraError: "Impossible d'accéder à la caméra. Vérifiez les autorisations.",
    },
    cancel: {
      title: 'Paiement annulé',
      subtitle:
        "Aucun débit n'a été confirmé. Vous pouvez reprendre votre réservation quand vous voulez.",
      backToCart: 'Revenir au panier',
      continueSearch: 'Continuer la recherche',
    },
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
      photo: 'Photo de profil',
      photoHint: 'JPEG, PNG ou WebP — 5 Mo max.',
      photoAdd: 'Ajouter une photo',
      photoChange: 'Changer la photo',
      photoUploading: 'Envoi…',
      photoUploadError: "Impossible d'envoyer la photo.",
      photoTooLarge: 'Fichier trop volumineux (5 Mo max).',
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
      empty: 'Aucune réservation pour le moment',
      emptyDescription:
        'Vos voyages réservés via Africa Tourism Gate apparaîtront ici. Commencez par explorer hôtels, vols et activités.',
      emptyBrowse: 'Explorer les offres',
      emptyFilter: 'Aucune réservation ne correspond à ce filtre.',
      reference: 'Référence',
      date: 'Date',
      status: 'Statut',
      total: 'Total',
      view: 'Voir',
      back: 'Retour aux réservations',
      notFound: 'Réservation introuvable.',
      loadError: 'Impossible de charger les réservations.',
      filterAll: 'Toutes',
      filterConfirmed: 'Validées',
      filterPending: 'En attente',
      filterCancelled: 'Annulées',
      filterAria: 'Filtrer par statut',
      actionRequired: 'Action requise',
      leaveReviewCta: 'Laisser un avis',
      reviewPrompt:
        'Vous avez {count} s\u00e9jour(s) termin\u00e9(s) en attente d\u2019avis \u2014 partagez votre exp\u00e9rience.',
      detail: {
        bookedOn: 'Réservée le',
        itemsCount: 'Articles',
        paidLabel: 'Déjà payé',
        balanceLabel: 'Solde restant',
        depositDueLabel: 'À régler maintenant',
        cancellationPolicyTitle: 'Politique d’annulation (indicative)',
        cancellationPolicyBody:
          'En cas d’acompte, le solde doit être réglé avant la date de service. L’acompte n’est généralement pas remboursable sauf accord contraire. Cette mention est informative — contactez-nous pour toute question.',
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
        downloadConfirmation: 'Télécharger la confirmation',
        downloadingConfirmation: 'Téléchargement…',
        downloadConfirmationError: 'Impossible de télécharger le PDF de confirmation.',
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
        reviewCharCount: '{current} / {max}',
        reviewPublished: 'Merci, votre avis a été publié.',
        reviewStarAria: '{n} sur 5',
        timelineTitle: 'Suivi de la réservation',
        timelinePlaceholder:
          'Historique détaillé non disponible — étapes estimées selon le statut actuel.',
        timelineStepCreated: 'Réservation créée',
        timelineStepPending: 'En attente de paiement',
        timelineStepConfirmed: 'Confirmée',
        timelineStepCancelled: 'Annulée',
        timelineStepRefunded: 'Remboursée',
        timelineStepRequest: 'Demande envoyée',
        timelineStepValidation: "Validation par l'équipe",
        timelineStepDiscussion: 'Échanges',
        timelineStepPayment: 'Paiement',
        timelineCurrent: 'Étape en cours',
        timelineUpcoming: 'À venir',
        proceedToPayment: 'Procéder au paiement',
        paymentInvitePending:
          'Vous recevrez un e-mail avec le lien de paiement dès que votre demande sera validée.',
        cashPaymentPending:
          'Cette réservation est en paiement espèces. Réglez en agence ou à l’arrivée — confirmation après encaissement (le cash n’est plus proposé par défaut au checkout web).',
        bankTransferPaymentPending:
          'Vous avez choisi le virement bancaire. Effectuez le virement avec la référence de réservation — validation par notre équipe requise.',
        mobileMoneyPaymentPending:
          'Vous avez choisi Mobile Money. Effectuez le transfert avec la référence de réservation puis envoyez une preuve — validation par notre équipe requise.',
        paymentProofs: {
          title: 'Preuve de paiement',
          subtitle:
            'Déposez le bordereau ou une photo du justificatif (acompte ou solde). Notre équipe validera le paiement.',
          empty: 'Aucune preuve déposée pour le moment.',
          upload: 'Envoyer un fichier',
          uploading: 'Envoi…',
          takePhoto: 'Prendre une photo',
          fileHint: 'JPEG, PNG, WebP ou PDF — 10 Mo max.',
          uploadError: "Impossible d'envoyer la preuve.",
          fileTooLarge: 'Fichier trop volumineux (10 Mo max).',
          view: 'Voir',
          viewing: 'Ouverture…',
          viewError: "Impossible d'ouvrir la preuve.",
          statusLabel: 'Statut',
          amountLabel: 'Montant',
          methods: {
            bank_transfer: 'Virement bancaire',
            mobile_money: 'Mobile Money',
          },
          statuses: {
            pending_review: 'En attente de vérification',
            approved: 'Validée',
            resubmit_requested: 'Nouvelle preuve demandée',
            rejected: 'Refusée',
          },
          camera: {
            capture: 'Prendre la photo',
            retake: 'Reprendre',
            confirm: 'Utiliser cette photo',
            cancel: 'Annuler',
            cameraError: "Impossible d'accéder à la caméra.",
          },
        },
        identityDocuments: {
          title: "Pièce d'identité",
          subtitle:
            "Déposez une pièce d'identité lisible (passeport, carte d'identité…) pour chaque voyageur.",
          empty: 'Aucun document déposé pour le moment.',
          loading: 'Chargement…',
          traveler: 'Voyageur',
          travelerRequired: 'Sélectionnez un voyageur.',
          travelerEmpty: 'Aucun document pour ce voyageur.',
          unlinkedTitle: 'Documents non rattachés',
          documentType: 'Type de document',
          file: 'Fichier',
          fileHint: 'JPEG, PNG, WebP ou PDF — 10 Mo max.',
          upload: 'Envoyer le document',
          uploading: 'Envoi…',
          uploadError: "Impossible d'envoyer le document.",
          fileTooLarge: 'Fichier trop volumineux (10 Mo max).',
          view: 'Voir',
          viewing: 'Ouverture…',
          viewError: "Impossible d'ouvrir le document.",
          statusLabel: 'Statut',
          types: {
            passport: 'Passeport',
            national_id: "Carte d'identité",
            drivers_license: 'Permis de conduire',
            other: 'Autre',
          },
          statuses: {
            pending_review: 'En cours de vérification',
            approved: 'Validé',
            resubmit_requested: 'Version plus claire demandée',
            rejected: 'Refusé',
          },
        },
        manifest: {
          title: 'Liste des voyageurs',
          subtitle: 'Renseignez les informations de chaque voyageur inclus dans cette réservation.',
          empty: 'Aucun voyageur renseigné pour le moment.',
          loading: 'Chargement…',
          loadError: 'Impossible de charger la liste des voyageurs.',
          addTraveler: 'Ajouter un voyageur',
          viewDocuments: 'Pièces jointes',
          viewDocument: 'Voir',
          docsTitle: 'Documents déposés',
          docsEmpty: 'Aucun document déposé pour cette réservation.',
          docsLoadError: 'Impossible de charger les documents.',
          docsUnlinkedTitle: 'Documents non rattachés',
          addTitle: 'Ajouter un voyageur',
          editTitle: 'Modifier le voyageur',
          formHint:
            'Nom, nationalité, n° de pièce et contact d’urgence (nom + téléphone) sont obligatoires. Le genre est optionnel.',
          fullNameRequired: 'Le nom complet est obligatoire.',
          nationalityRequired: 'La nationalité est obligatoire.',
          idNumberRequired: "Le n° de pièce d'identité est obligatoire.",
          emergencyContactNameRequired: "Le nom du contact d'urgence est obligatoire.",
          emergencyContactPhoneRequired: "Le téléphone du contact d'urgence est obligatoire.",
          save: 'Enregistrer',
          saving: 'Enregistrement…',
          saveError: "Impossible d'enregistrer le voyageur.",
          edit: 'Modifier',
          delete: 'Supprimer',
          deleting: 'Suppression…',
          deleteError: 'Impossible de supprimer le voyageur.',
          deleteTitle: 'Supprimer ce voyageur ?',
          deleteDescription: 'Confirmer la suppression de {name} de la liste des voyageurs.',
          cancel: 'Annuler',
          sex: {
            unspecified: 'Non précisé',
            M: 'Homme',
            F: 'Femme',
            other: 'Autre',
          },
          fields: {
            fullName: 'Nom complet',
            age: 'Âge',
            sex: 'Genre',
            nationality: 'Nationalité',
            nationalityPlaceholder: 'Choisir un pays',
            nationalitySearch: 'Rechercher un pays…',
            nationalityEmpty: 'Aucun pays trouvé.',
            idNumber: "N° pièce d'identité",
            medicalSection: 'Informations médicales',
            allergies: 'Allergies',
            allergiesPlaceholder: 'Ex. pollen, arachides…',
            seriousMedicalConditions: 'Conditions médicales graves',
            seriousMedicalConditionsPlaceholder: 'Ex. asthme, diabète…',
            currentMedications: 'Traitements en cours',
            currentMedicationsPlaceholder: 'Ex. médicaments quotidiens…',
            dietaryNotes: 'Notes alimentaires',
            dietaryNotesPlaceholder: 'Ex. végétarien, sans gluten…',
            legacyConditions: 'Anciennes notes',
            emergencyContactSection: "Contact d'urgence",
            emergencyContactName: 'Nom du contact',
            emergencyContactPhone: 'Téléphone',
            emergencyContactEmail: 'E-mail',
            emergencyContactCountry: 'Pays',
            emergencyContactAddress: 'Adresse',
            emergencyContactAddressPlaceholder: 'Rue, ville…',
            comment: 'Commentaire',
            commentPlaceholder: 'Informations complémentaires…',
            other: 'Autres informations',
            otherPlaceholder: 'Toute autre information utile?',
          },
        },
        messages: {
          title: 'Conversation',
          subtitle: 'Échangez avec notre équipe au sujet de votre demande.',
          loading: 'Chargement des messages?',
          empty: 'Aucun message pour le moment. Notre équipe vous répondra ici.',
          threadAria: 'Fil de messages de la réservation',
          authorStaff: 'Équipe',
          authorCustomer: 'Vous',
          replyTitle: 'Votre message',
          replyLabel: 'Message',
          replyPlaceholder: 'Écrivez votre message…',
          sendReply: 'Envoyer',
          loadError: 'Impossible de charger la conversation.',
          sendError: "Impossible d'envoyer le message.",
          newStaffMessageToast: 'Nouveau message de notre équipe',
          fabAriaLabel: 'Ouvrir la conversation',
          fabAriaLabelWithUnread: 'Ouvrir la conversation ({count} non lu(s))',
          pickerTitle: 'Vos conversations',
          pickerSubtitle: 'Sélectionnez une réservation pour ouvrir le chat.',
          pickerEmpty: 'Aucune réservation avec conversation active.',
          pickerLoading: 'Chargement de vos réservations…',
          backToReservations: 'Retour aux réservations',
          viewBooking: 'Voir la réservation',
          unreadBadge: '{count} message(s) non lu(s)',
        },
        guideReviews: {
          sectionTitle: 'Votre guide',
          sectionHint:
            'Partagez votre expérience avec le ou les guides assignés à votre séjour.',
          rolePrimary: 'Guide principal',
          roleSecondary: 'Guide secondaire',
          leaveReview: 'Noter ce guide',
          leaveReviewHint: "Votre avis sera publié après modération par notre équipe.",
          submitReview: "Envoyer l'avis",
          yourReview: 'Votre avis',
          reviewPublished: "Merci, votre avis a été envoyé et sera publié après modération.",
        },
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
      provider: 'Prestataire (ex. visa)',
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

const en = {
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
    payWithCash: 'Confirm — pay on site',
    cashSubmitting: 'Saving…',
    paymentMethodTitle: 'Payment method',
    paymentMethodHint: 'Choose how you want to pay for this booking.',
    paymentMethodRequired: 'Select a payment method to continue.',
    paymentMethodStripe: 'Card (Stripe)',
    paymentMethodStripeHint: 'Secure online payment now.',
    paymentMethodCash: 'Cash on site',
    paymentMethodCashHint: 'Booking held — pay at the agency or on arrival.',
    paymentMethodBankTransfer: 'Bank transfer',
    paymentMethodBankTransferHint:
      'Booking held — pay by transfer; our team confirms after receipt.',
    payWithBankTransfer: 'Confirm — pay by bank transfer',
    bankTransferSubmitting: 'Saving…',
    bankTransferAccountsTitle: 'Bank details',
    bankTransferAccountsEmpty:
      'No bank account is published yet. Contact us to get the transfer details.',
    bankTransferHolder: 'Account holder',
    bankTransferAccountNumber: 'Account number / IBAN',
    bankTransferSwift: 'SWIFT / BIC',
    bankTransferCurrency: 'Currency',
    bankTransferReferenceHint: 'Include reference {ref} in the transfer description.',
    paymentMethodMobileMoney: 'Mobile Money',
    paymentMethodMobileMoneyHint:
      'Booking held — pay via Mobile Money then upload a proof.',
    payWithMobileMoney: 'Confirm — pay with Mobile Money',
    mobileMoneySubmitting: 'Saving…',
    mobileMoneyTitle: 'Mobile Money payment',
    mobileMoneyEmpty:
      'No Mobile Money configuration is published yet. Contact us to get the payment numbers.',
    mobileMoneyCountry: 'Country',
    mobileMoneyOperator: 'Operator',
    mobileMoneyPhone: 'Number',
    mobileMoneyLabel: 'Label',
    mobileMoneyReferenceHint: 'Include reference {ref} in the transfer message.',
    mobileMoneySelectCountry: 'Select a country',
    mobileMoneySelectOperator: 'Select an operator',
    requestBooking: 'Request a booking',
    requestSubmitting: 'Submitting request?',
    stripeRedirecting: 'Redirecting to Stripe?',
    estimatedTotal: 'Estimated total',
    loading: 'Loading?',
    authRequiredNext: 'Customer sign-in required on the next step.',
    authRequiredPayment: 'Customer sign-in required to start payment.',
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
      titleCashPending: 'Booking registered',
      titleBankTransferPending: 'Booking registered',
      titleMobileMoneyPending: 'Booking registered',
      subtitle:
        'Your Stripe payment was received. We are finalizing your booking confirmation?',
      subtitleConfirmed: 'Your payment was received and your booking is confirmed.',
      subtitleCashPending:
        'This booking is set to cash payment. It stays pending until collection at the agency (even if cash is no longer offered on web checkout).',
      subtitleBankTransferPending:
        'You chose bank transfer. Your booking stays pending until our team validates the transfer.',
      subtitleMobileMoneyPending:
        'You chose Mobile Money. Your booking stays pending until our team validates the payment.',
      bookingIdLabel: 'Booking ref:',
      statusLabel: 'Status:',
      statusConfirmed: 'Confirmed',
      statusPendingPayment: 'Pending payment',
      statusPendingHint:
        'Confirmation is taking longer than expected. Check your account shortly or contact support if the status does not update.',
      statusCashPending: 'Awaiting cash payment',
      statusCashPendingHint:
        'Pay at the agency or on arrival with the amount due. Our team will confirm the booking after collection.',
      statusBankTransferPending: 'Awaiting bank transfer',
      statusBankTransferPendingHint:
        'Complete the transfer with the reference shown. The booking will be confirmed after staff validation.',
      statusMobileMoneyPending: 'Awaiting Mobile Money payment',
      statusMobileMoneyPendingHint:
        'Complete the Mobile Money transfer with the reference shown, then upload a proof. The booking will be confirmed after staff validation.',
      totalLabel: 'Total:',
      paidLabel: 'Paid:',
      balanceLabel: 'Balance due:',
      depositDueLabel: 'Due now:',
      cancellationPolicyTitle: 'Cancellation policy (informational)',
      cancellationPolicyBody:
        'When a deposit is paid, the remaining balance must be settled before the service date. Deposits are generally non-refundable unless otherwise agreed. This notice is informational — contact us with any questions.',
      verifying: 'Checking status?',
      statusUnavailable: 'Detailed status is unavailable for now. Refresh in a moment.',
      backHome: 'Back to home',
      browseHotels: 'Browse hotels',
      viewAccount: 'My account',
      signOut: 'Sign out',
      nextStepsTitle: 'What happens next',
      nextStepEmail: 'A confirmation email will be sent shortly.',
      nextStepAccount: 'View your bookings in your account area.',
      nextStepCash:
        'Have the cash amount ready for payment at the agency or on arrival — confirmation follows collection.',
      nextStepBankTransfer:
        'Make the transfer and include the booking reference in the description.',
      nextStepMobileMoney:
        'Complete the Mobile Money transfer then upload a payment proof.',
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
      subtitle:
        'Fill in the details for each traveler. Full name, nationality, ID / passport number and emergency contact (name + phone) are required. Gender is optional.',
      travelerN: 'Traveler {n}',
      fullName: 'Full name',
      age: 'Age',
      sex: 'Gender',
      sexUnspecified: 'Not specified',
      sexM: 'Male',
      sexF: 'Female',
      sexOther: 'Other',
      nationality: 'Nationality',
      nationalityPlaceholder: 'Select a country',
      nationalitySearch: 'Search for a country…',
      nationalityEmpty: 'No country found.',
      idNumber: 'ID / Passport number',
      medicalSection: 'Medical information',
      allergies: 'Allergies',
      allergiesPlaceholder: 'e.g. pollen, peanuts…',
      seriousMedicalConditions: 'Serious medical conditions',
      seriousMedicalConditionsPlaceholder: 'e.g. asthma, diabetes…',
      currentMedications: 'Current medications',
      currentMedicationsPlaceholder: 'e.g. daily medication…',
      dietaryNotes: 'Dietary notes',
      dietaryNotesPlaceholder: 'e.g. vegetarian, gluten-free…',
      emergencyContactSection: 'Emergency contact',
      emergencyContactName: 'Contact name',
      emergencyContactPhone: 'Phone',
      emergencyContactEmail: 'Email',
      emergencyContactCountry: 'Country',
      emergencyContactAddress: 'Address',
      emergencyContactAddressPlaceholder: 'Street, city…',
      fullNameRequired: 'Full name of traveler {n} is required.',
      nationalityRequired: 'Nationality of traveler {n} is required.',
      idNumberRequired: 'ID / passport number of traveler {n} is required.',
      emergencyContactNameRequired: 'Emergency contact name of traveler {n} is required.',
      emergencyContactPhoneRequired: 'Emergency contact phone of traveler {n} is required.',
      idDocument: 'Identity document',
      idDocumentHint: 'JPEG, PNG, WebP or PDF ? 10 MB max.',
      idDocumentSelected: 'Choose a file',
      idDocumentRemove: 'Remove',
      viewDocument: 'View document',
      takePhoto: 'Take a photo',
      cameraCapture: 'Capture',
      cameraRetake: 'Retake',
      cameraConfirm: 'Confirm',
      cameraCancel: 'Cancel',
      cameraError: 'Cannot access camera. Please check permissions.',
    },
    cancel: {
      title: 'Payment cancelled',
      subtitle: 'No charge was confirmed. You can resume your booking whenever you like.',
      backToCart: 'Return to cart',
      continueSearch: 'Continue browsing',
    },
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
      photo: 'Profile photo',
      photoHint: 'JPEG, PNG or WebP — 5 MB max.',
      photoAdd: 'Add a photo',
      photoChange: 'Change photo',
      photoUploading: 'Uploading…',
      photoUploadError: 'Could not upload the photo.',
      photoTooLarge: 'File too large (5 MB max).',
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
        paidLabel: 'Paid',
        balanceLabel: 'Balance due',
        depositDueLabel: 'Due now',
        cancellationPolicyTitle: 'Cancellation policy (informational)',
        cancellationPolicyBody:
          'When a deposit is paid, the remaining balance must be settled before the service date. Deposits are generally non-refundable unless otherwise agreed. This notice is informational — contact us with any questions.',
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
        downloadConfirmation: 'Download confirmation',
        downloadingConfirmation: 'Downloading…',
        downloadConfirmationError: 'Could not download the confirmation PDF.',
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
        cashPaymentPending:
          'This booking is set to cash payment. Pay at the agency or on arrival — confirmation after collection (cash is no longer offered by default on web checkout).',
        bankTransferPaymentPending:
          'You chose bank transfer. Complete the transfer with the booking reference — staff validation is required.',
        mobileMoneyPaymentPending:
          'You chose Mobile Money. Complete the transfer with the booking reference then upload a proof — staff validation is required.',
        paymentProofs: {
          title: 'Payment proof',
          subtitle:
            'Upload the transfer slip or a photo of the receipt (deposit or balance). Our team will validate the payment.',
          empty: 'No proof uploaded yet.',
          upload: 'Upload a file',
          uploading: 'Uploading…',
          takePhoto: 'Take a photo',
          fileHint: 'JPEG, PNG, WebP or PDF — 10 MB max.',
          uploadError: 'Could not upload the proof.',
          fileTooLarge: 'File too large (10 MB max).',
          view: 'View',
          viewing: 'Opening…',
          viewError: 'Could not open the proof.',
          statusLabel: 'Status',
          amountLabel: 'Amount',
          methods: {
            bank_transfer: 'Bank transfer',
            mobile_money: 'Mobile Money',
          },
          statuses: {
            pending_review: 'Awaiting verification',
            approved: 'Approved',
            resubmit_requested: 'New proof requested',
            rejected: 'Rejected',
          },
          camera: {
            capture: 'Take photo',
            retake: 'Retake',
            confirm: 'Use this photo',
            cancel: 'Cancel',
            cameraError: 'Could not access the camera.',
          },
        },
        identityDocuments: {
          title: 'Identity document',
          subtitle:
            'Upload a readable identity document (passport, national ID…) for each traveler.',
          empty: 'No document uploaded yet.',
          loading: 'Loading…',
          traveler: 'Traveler',
          travelerRequired: 'Select a traveler.',
          travelerEmpty: 'No document for this traveler.',
          unlinkedTitle: 'Unlinked documents',
          documentType: 'Document type',
          file: 'File',
          fileHint: 'JPEG, PNG, WebP or PDF — 10 MB max.',
          upload: 'Upload document',
          uploading: 'Uploading…',
          uploadError: 'Could not upload the document.',
          fileTooLarge: 'File too large (10 MB max).',
          view: 'View',
          viewing: 'Opening…',
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
          loading: 'Loading…',
          loadError: 'Could not load the traveler list.',
          addTraveler: 'Add traveler',
          viewDocuments: 'Attachments',
          viewDocument: 'View',
          docsTitle: 'Uploaded documents',
          docsEmpty: 'No documents uploaded for this booking.',
          docsLoadError: 'Could not load documents.',
          docsUnlinkedTitle: 'Unlinked documents',
          addTitle: 'Add a traveler',
          editTitle: 'Edit traveler',
          formHint:
            'Full name, nationality, ID / passport number and emergency contact (name + phone) are required. Gender is optional.',
          fullNameRequired: 'Full name is required.',
          nationalityRequired: 'Nationality is required.',
          idNumberRequired: 'ID / passport number is required.',
          emergencyContactNameRequired: 'Emergency contact name is required.',
          emergencyContactPhoneRequired: 'Emergency contact phone is required.',
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
            nationalityPlaceholder: 'Select a country',
            nationalitySearch: 'Search for a country…',
            nationalityEmpty: 'No country found.',
            idNumber: 'ID / Passport number',
            medicalSection: 'Medical information',
            allergies: 'Allergies',
            allergiesPlaceholder: 'e.g. pollen, peanuts…',
            seriousMedicalConditions: 'Serious medical conditions',
            seriousMedicalConditionsPlaceholder: 'e.g. asthma, diabetes…',
            currentMedications: 'Current medications',
            currentMedicationsPlaceholder: 'e.g. daily medication…',
            dietaryNotes: 'Dietary notes',
            dietaryNotesPlaceholder: 'e.g. vegetarian, gluten-free…',
            legacyConditions: 'Legacy notes',
            emergencyContactSection: 'Emergency contact',
            emergencyContactName: 'Contact name',
            emergencyContactPhone: 'Phone',
            emergencyContactEmail: 'Email',
            emergencyContactCountry: 'Country',
            emergencyContactAddress: 'Address',
            emergencyContactAddressPlaceholder: 'Street, city…',
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
export const translations: Record<Locale, Translations> = {
  fr: fr as Translations,
  en: en as Translations,
  es: es as Translations,
};
