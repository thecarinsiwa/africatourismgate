export type BookingDetailPdfLocale = 'fr' | 'en' | 'es';

export type BookingDetailPdfLabels = {
  documentTitle: string;
  generatedOn: string;
  reference: string;
  status: string;
  statusPendingPayment: string;
  customerSection: string;
  customerName: string;
  customerEmail: string;
  visitPeriod: string;
  visitFrom: string;
  visitTo: string;
  itemsSection: string;
  colItem: string;
  colType: string;
  colDates: string;
  colQty: string;
  colUnitPrice: string;
  colLineTotal: string;
  itinerarySection: string;
  travelersSection: string;
  colTravelerIndex: string;
  colTraveler: string;
  colAge: string;
  colSex: string;
  colNationality: string;
  colIdNumber: string;
  colTravelerPrice: string;
  colTravelerNotes: string;
  guidesSection: string;
  colGuideName: string;
  colGuideRole: string;
  guideRolePrimary: string;
  guideRoleSecondary: string;
  summarySection: string;
  bookingCreatedAt: string;
  paymentsSection: string;
  colPaymentDate: string;
  colPaymentAmount: string;
  colPaymentStatus: string;
  colPaymentProvider: string;
  sexM: string;
  sexF: string;
  sexOther: string;
  total: string;
  nextStepsSection: string;
  nextStepsBody: string;
  accountLink: string;
  chatLink: string;
  itemTypes: Record<string, string>;
};

const LABELS: Record<BookingDetailPdfLocale, BookingDetailPdfLabels> = {
  fr: {
    documentTitle: 'Récapitulatif de réservation',
    generatedOn: 'Document généré le',
    reference: 'Référence',
    status: 'Statut',
    statusPendingPayment: 'En attente de paiement',
    customerSection: 'Client',
    customerName: 'Nom',
    customerEmail: 'E-mail',
    visitPeriod: 'Période de visite',
    visitFrom: 'Départ',
    visitTo: 'Retour',
    itemsSection: 'Lignes de réservation',
    colItem: 'Prestation',
    colType: 'Type',
    colDates: 'Dates',
    colQty: 'Qté',
    colUnitPrice: 'Prix unit.',
    colLineTotal: 'Sous-total',
    itinerarySection: 'Itinéraire',
    travelersSection: 'Liste des voyageurs',
    colTravelerIndex: 'N°',
    colTraveler: 'Voyageur',
    colAge: 'Âge',
    colSex: 'Sexe',
    colNationality: 'Nationalité',
    colIdNumber: 'N° document',
    colTravelerPrice: 'Montant',
    colTravelerNotes: 'Notes',
    guidesSection: 'Guides assignés',
    colGuideName: 'Guide',
    colGuideRole: 'Rôle',
    guideRolePrimary: 'Principal',
    guideRoleSecondary: 'Secondaire',
    summarySection: 'Informations complémentaires',
    bookingCreatedAt: 'Réservation créée le',
    paymentsSection: 'Paiements enregistrés',
    colPaymentDate: 'Date',
    colPaymentAmount: 'Montant',
    colPaymentStatus: 'Statut',
    colPaymentProvider: 'Fournisseur',
    sexM: 'H',
    sexF: 'F',
    sexOther: 'Autre',
    total: 'Total',
    nextStepsSection: 'Prochaines étapes',
    nextStepsBody:
      'Votre demande a été approuvée. Échangez avec notre équipe via la messagerie, puis procédez au paiement lorsque vous serez prêt.',
    accountLink: 'Mon compte',
    chatLink: 'Conversation',
    itemTypes: {
      room: 'Hébergement',
      flight_class: 'Vol',
      vehicle: 'Véhicule',
      cabin: 'Cabine',
      activity_schedule: 'Activité',
      package: 'Forfait',
    },
  },
  en: {
    documentTitle: 'Booking summary',
    generatedOn: 'Document generated on',
    reference: 'Reference',
    status: 'Status',
    statusPendingPayment: 'Pending payment',
    customerSection: 'Customer',
    customerName: 'Name',
    customerEmail: 'Email',
    visitPeriod: 'Visit period',
    visitFrom: 'Departure',
    visitTo: 'Return',
    itemsSection: 'Booking lines',
    colItem: 'Service',
    colType: 'Type',
    colDates: 'Dates',
    colQty: 'Qty',
    colUnitPrice: 'Unit price',
    colLineTotal: 'Subtotal',
    itinerarySection: 'Itinerary',
    travelersSection: 'Traveler list',
    colTravelerIndex: '#',
    colTraveler: 'Traveler',
    colAge: 'Age',
    colSex: 'Sex',
    colNationality: 'Nationality',
    colIdNumber: 'ID no.',
    colTravelerPrice: 'Amount',
    colTravelerNotes: 'Notes',
    guidesSection: 'Assigned guides',
    colGuideName: 'Guide',
    colGuideRole: 'Role',
    guideRolePrimary: 'Lead',
    guideRoleSecondary: 'Secondary',
    summarySection: 'Additional information',
    bookingCreatedAt: 'Booking created on',
    paymentsSection: 'Recorded payments',
    colPaymentDate: 'Date',
    colPaymentAmount: 'Amount',
    colPaymentStatus: 'Status',
    colPaymentProvider: 'Provider',
    sexM: 'M',
    sexF: 'F',
    sexOther: 'Other',
    total: 'Total',
    nextStepsSection: 'Next steps',
    nextStepsBody:
      'Your request has been approved. Chat with our team, then complete payment when you are ready.',
    accountLink: 'My account',
    chatLink: 'Conversation',
    itemTypes: {
      room: 'Accommodation',
      flight_class: 'Flight',
      vehicle: 'Vehicle',
      cabin: 'Cabin',
      activity_schedule: 'Activity',
      package: 'Package',
    },
  },
  es: {
    documentTitle: 'Resumen de reserva',
    generatedOn: 'Documento generado el',
    reference: 'Referencia',
    status: 'Estado',
    statusPendingPayment: 'Pendiente de pago',
    customerSection: 'Cliente',
    customerName: 'Nombre',
    customerEmail: 'Correo',
    visitPeriod: 'Período de visita',
    visitFrom: 'Salida',
    visitTo: 'Regreso',
    itemsSection: 'Líneas de reserva',
    colItem: 'Servicio',
    colType: 'Tipo',
    colDates: 'Fechas',
    colQty: 'Cant.',
    colUnitPrice: 'Precio unit.',
    colLineTotal: 'Subtotal',
    itinerarySection: 'Itinerario',
    travelersSection: 'Lista de viajeros',
    colTravelerIndex: 'N.º',
    colTraveler: 'Viajero',
    colAge: 'Edad',
    colSex: 'Sexo',
    colNationality: 'Nacionalidad',
    colIdNumber: 'N.º documento',
    colTravelerPrice: 'Importe',
    colTravelerNotes: 'Notas',
    guidesSection: 'Guías asignados',
    colGuideName: 'Guía',
    colGuideRole: 'Rol',
    guideRolePrimary: 'Principal',
    guideRoleSecondary: 'Secundario',
    summarySection: 'Información complementaria',
    bookingCreatedAt: 'Reserva creada el',
    paymentsSection: 'Pagos registrados',
    colPaymentDate: 'Fecha',
    colPaymentAmount: 'Importe',
    colPaymentStatus: 'Estado',
    colPaymentProvider: 'Proveedor',
    sexM: 'H',
    sexF: 'M',
    sexOther: 'Otro',
    total: 'Total',
    nextStepsSection: 'Próximos pasos',
    nextStepsBody:
      'Su solicitud ha sido aprobada. Intercambie con nuestro equipo y realice el pago cuando esté listo.',
    accountLink: 'Mi cuenta',
    chatLink: 'Conversación',
    itemTypes: {
      room: 'Alojamiento',
      flight_class: 'Vuelo',
      vehicle: 'Vehículo',
      cabin: 'Camarote',
      activity_schedule: 'Actividad',
      package: 'Paquete',
    },
  },
};

export function resolvePdfLocale(language?: string | null): BookingDetailPdfLocale {
  const code = language?.trim().toLowerCase().slice(0, 2);
  if (code === 'en' || code === 'es') {
    return code;
  }
  return 'fr';
}

export function getBookingDetailPdfLabels(locale: BookingDetailPdfLocale): BookingDetailPdfLabels {
  return LABELS[locale];
}

export function bookingDetailPdfFilename(bookingId: string): string {
  return `reservation-${bookingId.slice(0, 8)}.pdf`;
}
