import type { AccommodationReportLocale } from './accommodation-reports.labels';

export type AccommodationWorkbookLabels = {
  sheets: {
    catalog: string;
    rooms: string;
    availability: string;
    amenities: string;
  };
  catalog: {
    id: string;
    name: string;
    slug: string;
    type: string;
    stars: string;
    destination: string;
    address: string;
    description: string;
  };
  rooms: {
    property: string;
    roomId: string;
    name: string;
    roomType: string;
    maxGuests: string;
    bedConfig: string;
    basePrice: string;
    currency: string;
  };
  availability: {
    property: string;
    room: string;
    date: string;
    availableUnits: string;
    price: string;
    currency: string;
  };
  amenities: {
    property: string;
    code: string;
    name: string;
  };
  propertyTypes: Record<string, string>;
};

const LABELS: Record<AccommodationReportLocale, AccommodationWorkbookLabels> = {
  fr: {
    sheets: {
      catalog: 'Catalogue',
      rooms: 'Inventaire chambres',
      availability: 'Disponibilités',
      amenities: 'Équipements',
    },
    catalog: {
      id: 'ID',
      name: 'Nom',
      slug: 'Slug',
      type: 'Type',
      stars: 'Étoiles',
      destination: 'Destination',
      address: 'Adresse',
      description: 'Description',
    },
    rooms: {
      property: 'Hébergement',
      roomId: 'ID chambre',
      name: 'Nom',
      roomType: 'Type',
      maxGuests: 'Capacité max.',
      bedConfig: 'Configuration lits',
      basePrice: 'Prix de base',
      currency: 'Devise',
    },
    availability: {
      property: 'Hébergement',
      room: 'Chambre',
      date: 'Date',
      availableUnits: 'Unités disponibles',
      price: 'Prix',
      currency: 'Devise',
    },
    amenities: {
      property: 'Hébergement',
      code: 'Code',
      name: 'Nom',
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
    sheets: {
      catalog: 'Catalog',
      rooms: 'Room inventory',
      availability: 'Availability',
      amenities: 'Amenities',
    },
    catalog: {
      id: 'ID',
      name: 'Name',
      slug: 'Slug',
      type: 'Type',
      stars: 'Stars',
      destination: 'Destination',
      address: 'Address',
      description: 'Description',
    },
    rooms: {
      property: 'Property',
      roomId: 'Room ID',
      name: 'Name',
      roomType: 'Type',
      maxGuests: 'Max guests',
      bedConfig: 'Bed configuration',
      basePrice: 'Base price',
      currency: 'Currency',
    },
    availability: {
      property: 'Property',
      room: 'Room',
      date: 'Date',
      availableUnits: 'Available units',
      price: 'Price',
      currency: 'Currency',
    },
    amenities: {
      property: 'Property',
      code: 'Code',
      name: 'Name',
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
    sheets: {
      catalog: 'Catálogo',
      rooms: 'Inventario habitaciones',
      availability: 'Disponibilidad',
      amenities: 'Equipamientos',
    },
    catalog: {
      id: 'ID',
      name: 'Nombre',
      slug: 'Slug',
      type: 'Tipo',
      stars: 'Estrellas',
      destination: 'Destino',
      address: 'Dirección',
      description: 'Descripción',
    },
    rooms: {
      property: 'Alojamiento',
      roomId: 'ID habitación',
      name: 'Nombre',
      roomType: 'Tipo',
      maxGuests: 'Capacidad máx.',
      bedConfig: 'Configuración camas',
      basePrice: 'Precio base',
      currency: 'Moneda',
    },
    availability: {
      property: 'Alojamiento',
      room: 'Habitación',
      date: 'Fecha',
      availableUnits: 'Unidades disponibles',
      price: 'Precio',
      currency: 'Moneda',
    },
    amenities: {
      property: 'Alojamiento',
      code: 'Código',
      name: 'Nombre',
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

export function getAccommodationWorkbookLabels(
  locale: AccommodationReportLocale,
): AccommodationWorkbookLabels {
  return LABELS[locale];
}

export function accommodationWorkbookFilename(dateFrom: string, dateTo: string): string {
  const from = dateFrom.slice(0, 10);
  const to = dateTo.slice(0, 10);
  return `hebergements-${from}_${to}.xlsx`;
}
