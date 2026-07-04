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
  travelersSection: string;
  colTraveler: string;
  colAge: string;
  colTravelerPrice: string;
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
    itemsSection: 'Prestations réservées',
    colItem: 'Prestation',
    colType: 'Type',
    colDates: 'Dates',
    colQty: 'Qté',
    colUnitPrice: 'Prix unit.',
    colLineTotal: 'Sous-total',
    travelersSection: 'Voyageurs et tarifs',
    colTraveler: 'Voyageur',
    colAge: 'Âge',
    colTravelerPrice: 'Montant',
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
    itemsSection: 'Booked services',
    colItem: 'Service',
    colType: 'Type',
    colDates: 'Dates',
    colQty: 'Qty',
    colUnitPrice: 'Unit price',
    colLineTotal: 'Subtotal',
    travelersSection: 'Travelers and pricing',
    colTraveler: 'Traveler',
    colAge: 'Age',
    colTravelerPrice: 'Amount',
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
    itemsSection: 'Servicios reservados',
    colItem: 'Servicio',
    colType: 'Tipo',
    colDates: 'Fechas',
    colQty: 'Cant.',
    colUnitPrice: 'Precio unit.',
    colLineTotal: 'Subtotal',
    travelersSection: 'Viajeros y tarifas',
    colTraveler: 'Viajero',
    colAge: 'Edad',
    colTravelerPrice: 'Importe',
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
