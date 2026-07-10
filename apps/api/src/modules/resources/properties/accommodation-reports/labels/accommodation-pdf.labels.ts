import type { AccommodationReportLocale } from './accommodation-reports.labels';

export type AccommodationPdfLabels = {
  generatedOn: string;
  kpi: {
    documentTitle: string;
    summarySection: string;
    properties: string;
    rooms: string;
    amenities: string;
    destinations: string;
    byTypeSection: string;
    colType: string;
    colCount: string;
  };
  catalog: {
    documentTitle: string;
    colName: string;
    colType: string;
    colDestination: string;
    colStars: string;
    colRooms: string;
    empty: string;
  };
  bookings: {
    documentTitle: string;
    periodSection: string;
    periodFrom: string;
    periodTo: string;
    colProperty: string;
    colRoom: string;
    colReference: string;
    colStatus: string;
    colStay: string;
    colAmount: string;
    empty: string;
    statusLabels: Record<string, string>;
  };
  dossier: {
    documentTitle: string;
    infoSection: string;
    name: string;
    slug: string;
    type: string;
    stars: string;
    destination: string;
    address: string;
    description: string;
    roomsSection: string;
    colRoomName: string;
    colRoomType: string;
    colMaxGuests: string;
    colBasePrice: string;
    amenitiesSection: string;
    colAmenityCode: string;
    colAmenityName: string;
    emptyRooms: string;
    emptyAmenities: string;
  };
  propertyTypes: Record<string, string>;
};

const LABELS: Record<AccommodationReportLocale, AccommodationPdfLabels> = {
  fr: {
    generatedOn: 'Document généré le',
    kpi: {
      documentTitle: 'Synthèse KPI — Hébergements',
      summarySection: 'Indicateurs clés',
      properties: 'Hébergements',
      rooms: 'Chambres',
      amenities: 'Équipements',
      destinations: 'Destinations couvertes',
      byTypeSection: 'Répartition par type',
      colType: 'Type',
      colCount: 'Nombre',
    },
    catalog: {
      documentTitle: 'Catalogue hébergements',
      colName: 'Nom',
      colType: 'Type',
      colDestination: 'Destination',
      colStars: 'Étoiles',
      colRooms: 'Chambres',
      empty: 'Aucun hébergement dans le périmètre sélectionné.',
    },
    bookings: {
      documentTitle: 'Réservations hébergements',
      periodSection: 'Période',
      periodFrom: 'Du',
      periodTo: 'Au',
      colProperty: 'Hébergement',
      colRoom: 'Chambre',
      colReference: 'Référence',
      colStatus: 'Statut',
      colStay: 'Séjour',
      colAmount: 'Montant',
      empty: 'Aucune réservation chambre sur cette période.',
      statusLabels: {
        draft: 'Brouillon',
        pending_approval: 'En attente validation',
        pending_payment: 'En attente paiement',
        confirmed: 'Confirmée',
        cancelled: 'Annulée',
        refunded: 'Remboursée',
      },
    },
    dossier: {
      documentTitle: 'Fiche hébergement',
      infoSection: 'Informations',
      name: 'Nom',
      slug: 'Slug',
      type: 'Type',
      stars: 'Étoiles',
      destination: 'Destination',
      address: 'Adresse',
      description: 'Description',
      roomsSection: 'Chambres',
      colRoomName: 'Nom',
      colRoomType: 'Type',
      colMaxGuests: 'Capacité',
      colBasePrice: 'Prix de base',
      amenitiesSection: 'Équipements',
      colAmenityCode: 'Code',
      colAmenityName: 'Nom',
      emptyRooms: 'Aucune chambre enregistrée.',
      emptyAmenities: 'Aucun équipement associé.',
    },
    propertyTypes: {
      hotel: 'Hôtel',
      resort: 'Resort',
      apartment: 'Appartement',
      villa: 'Villa',
      hostel: 'Auberge',
      other: 'Autre',
    },
  },
  en: {
    generatedOn: 'Document generated on',
    kpi: {
      documentTitle: 'KPI summary — Accommodations',
      summarySection: 'Key metrics',
      properties: 'Properties',
      rooms: 'Rooms',
      amenities: 'Amenities',
      destinations: 'Destinations covered',
      byTypeSection: 'Breakdown by type',
      colType: 'Type',
      colCount: 'Count',
    },
    catalog: {
      documentTitle: 'Accommodation catalog',
      colName: 'Name',
      colType: 'Type',
      colDestination: 'Destination',
      colStars: 'Stars',
      colRooms: 'Rooms',
      empty: 'No properties in the selected scope.',
    },
    bookings: {
      documentTitle: 'Accommodation bookings',
      periodSection: 'Period',
      periodFrom: 'From',
      periodTo: 'To',
      colProperty: 'Property',
      colRoom: 'Room',
      colReference: 'Reference',
      colStatus: 'Status',
      colStay: 'Stay',
      colAmount: 'Amount',
      empty: 'No room bookings in this period.',
      statusLabels: {
        draft: 'Draft',
        pending_approval: 'Pending approval',
        pending_payment: 'Pending payment',
        confirmed: 'Confirmed',
        cancelled: 'Cancelled',
        refunded: 'Refunded',
      },
    },
    dossier: {
      documentTitle: 'Property dossier',
      infoSection: 'Details',
      name: 'Name',
      slug: 'Slug',
      type: 'Type',
      stars: 'Stars',
      destination: 'Destination',
      address: 'Address',
      description: 'Description',
      roomsSection: 'Rooms',
      colRoomName: 'Name',
      colRoomType: 'Type',
      colMaxGuests: 'Capacity',
      colBasePrice: 'Base price',
      amenitiesSection: 'Amenities',
      colAmenityCode: 'Code',
      colAmenityName: 'Name',
      emptyRooms: 'No rooms registered.',
      emptyAmenities: 'No amenities linked.',
    },
    propertyTypes: {
      hotel: 'Hotel',
      resort: 'Resort',
      apartment: 'Apartment',
      villa: 'Villa',
      hostel: 'Hostel',
      other: 'Other',
    },
  },
  es: {
    generatedOn: 'Documento generado el',
    kpi: {
      documentTitle: 'Resumen KPI — Alojamientos',
      summarySection: 'Indicadores clave',
      properties: 'Alojamientos',
      rooms: 'Habitaciones',
      amenities: 'Equipamientos',
      destinations: 'Destinos cubiertos',
      byTypeSection: 'Distribución por tipo',
      colType: 'Tipo',
      colCount: 'Cantidad',
    },
    catalog: {
      documentTitle: 'Catálogo de alojamientos',
      colName: 'Nombre',
      colType: 'Tipo',
      colDestination: 'Destino',
      colStars: 'Estrellas',
      colRooms: 'Habitaciones',
      empty: 'Ningún alojamiento en el alcance seleccionado.',
    },
    bookings: {
      documentTitle: 'Reservas de alojamiento',
      periodSection: 'Período',
      periodFrom: 'Desde',
      periodTo: 'Hasta',
      colProperty: 'Alojamiento',
      colRoom: 'Habitación',
      colReference: 'Referencia',
      colStatus: 'Estado',
      colStay: 'Estancia',
      colAmount: 'Importe',
      empty: 'Ninguna reserva de habitación en este período.',
      statusLabels: {
        draft: 'Borrador',
        pending_approval: 'Pendiente de validación',
        pending_payment: 'Pendiente de pago',
        confirmed: 'Confirmada',
        cancelled: 'Cancelada',
        refunded: 'Reembolsada',
      },
    },
    dossier: {
      documentTitle: 'Ficha de alojamiento',
      infoSection: 'Información',
      name: 'Nombre',
      slug: 'Slug',
      type: 'Tipo',
      stars: 'Estrellas',
      destination: 'Destino',
      address: 'Dirección',
      description: 'Descripción',
      roomsSection: 'Habitaciones',
      colRoomName: 'Nombre',
      colRoomType: 'Tipo',
      colMaxGuests: 'Capacidad',
      colBasePrice: 'Precio base',
      amenitiesSection: 'Equipamientos',
      colAmenityCode: 'Código',
      colAmenityName: 'Nombre',
      emptyRooms: 'Ninguna habitación registrada.',
      emptyAmenities: 'Ningún equipamiento asociado.',
    },
    propertyTypes: {
      hotel: 'Hotel',
      resort: 'Resort',
      apartment: 'Apartamento',
      villa: 'Villa',
      hostel: 'Albergue',
      other: 'Otro',
    },
  },
};

export function getAccommodationPdfLabels(locale: AccommodationReportLocale): AccommodationPdfLabels {
  return LABELS[locale];
}

export function accommodationPropertyTypeLabel(
  locale: AccommodationReportLocale,
  propertyType: string,
): string {
  return LABELS[locale].propertyTypes[propertyType] ?? propertyType;
}

export function kpiSummaryPdfFilename(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `kpi-hebergements-${date}.pdf`;
}

export function catalogPdfFilename(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `catalogue-hebergements-${date}.pdf`;
}

export function bookingsPdfFilename(dateFrom: string, dateTo: string): string {
  return `reservations-hebergements-${dateFrom.slice(0, 10)}_${dateTo.slice(0, 10)}.pdf`;
}

export function propertyDossierPdfFilename(slug: string): string {
  const safe = slug.trim().replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/-+/g, '-');
  return `fiche-${safe || 'hebergement'}.pdf`;
}

export function bookingRefLabel(bookingId: string): string {
  return bookingId.slice(0, 8).toUpperCase();
}
