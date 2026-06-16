/** @type {Record<'fr' | 'en' | 'es', object>} */
export const pagesI18n = {
  fr: {
    meta: {
      editUser: "Modifier l'utilisateur",
      editEmployee: "Modifier l'employé",
      editOrganization: "Modifier l'organisation",
      editAccommodation: "Modifier l'hébergement",
      editActivity: "Modifier l'activité",
      editDestination: "Modifier la destination",
      editVehicle: "Modifier le véhicule",
      editFlight: "Modifier le vol",
      editPackage: "Modifier le forfait",
      editRole: "Modifier le rôle",
      editPromoCode: "Modifier le code promo",
      editPromotion: "Modifier la promotion",
      viewPackage: 'Voir le forfait',
      detailBooking: 'Détail réservation',
      detailTicket: 'Détail ticket',
      detailReview: 'Détail avis',
      sailingDetail: 'Départ',
      shipDetail: 'Navire',
      classAvailability: 'Disponibilités classe',
      roomAvailability: 'Disponibilités chambre',
      itineraryStops: 'Escales itinéraire',
    },
    utilisateurs: {
      description: 'Comptes plateforme. Filtrez par statut ou organisation.',
      nouveau: {
        metaTitle: 'Nouvel utilisateur',
        description: 'Créer un compte utilisateur.',
      },
      id: { metaTitle: "Modifier l'utilisateur" },
      employes: {
        description: 'Profils employés liés aux utilisateurs et organisations.',
        nouveau: {
          metaTitle: 'Nouvel employé',
          description: 'Lier un utilisateur existant à une organisation.',
        },
        id: { metaTitle: "Modifier l'employé" },
      },
      adresses: { description: 'Adresses enregistrées par les utilisateurs.' },
      'moyens-paiement': {
        description: 'Cartes et moyens de paiement enregistrés par les utilisateurs.',
      },
      sessions: {
        description: "Sessions actives. Révoquez une session pour déconnecter l'utilisateur.",
      },
      'journaux-securite': {
        description: "Événements de sécurité et audit d'accès.",
      },
    },
    hebergements: {
      title: 'Hébergements',
      description: 'Propriétés, chambres et équipements. Filtrez par destination.',
      nouveau: {
        metaTitle: 'Nouvel hébergement',
        description: 'Créez la propriété puis ajoutez images, équipements et chambres.',
      },
      id: {
        metaTitle: "Modifier l'hébergement",
        chambres: {
          roomId: {
            disponibilites: { metaTitle: 'Disponibilités chambre' },
          },
        },
      },
      equipements: {
        description: 'Catalogue global réutilisable sur les hébergements (Wi-Fi, piscine, etc.).',
      },
    },
    organisations: {
      title: 'Organisations',
      description: 'Partenaires et entités de la plateforme. Recherche par nom ou slug.',
      nouveau: {
        metaTitle: 'Nouvelle organisation',
        description: 'Créer une organisation partenaire.',
      },
      id: { metaTitle: "Modifier l'organisation" },
    },
    fidelite: {
      comptes: {
        title: 'Comptes fidélité',
        description:
          'Programme OneKey — solde de points, paliers et dernière activité. Ajustement manuel réservé au super administrateur.',
      },
    },
    produits: {
      activites: {
        title: 'Activités & tours',
        description: 'Expériences, fournisseurs et créneaux par destination.',
        actions: { providers: 'Fournisseurs', new: 'Nouvelle activité' },
        nouveau: {
          metaTitle: 'Nouvelle activité',
          description: "Créez une expérience puis ajoutez des créneaux sur la page d'édition.",
        },
        fournisseurs: {
          title: "Fournisseurs d'activités",
          description: 'Opérateurs liés aux destinations.',
        },
        id: { metaTitle: "Modifier l'activité" },
      },
      destinations: {
        title: 'Destinations',
        description: "Géographie et points d'intérêt. Recherche par nom, slug ou code pays.",
        actions: { new: 'Nouvelle destination' },
        nouveau: {
          metaTitle: 'Nouvelle destination',
          description:
            "Créez la destination puis ajoutez des points d'intérêt sur la page de modification.",
        },
        id: { metaTitle: 'Modifier la destination' },
      },
      locations: {
        title: 'Locations véhicules',
        description: 'Véhicules par agence, catégories et créneaux de disponibilité.',
        links: { agencies: 'Agences de location', categories: 'Catégories véhicules' },
        agences: {
          title: 'Agences de location',
          description: 'Référentiel des agences liées aux destinations.',
        },
        categories: {
          title: 'Catégories véhicules',
          description: 'Types de véhicules (compact, SUV, premium, etc.).',
        },
        nouveau: {
          metaTitle: 'Nouveau véhicule',
          description:
            'Associez une agence et une catégorie, puis définissez les créneaux de disponibilité.',
          backLabel: 'Retour aux véhicules',
        },
        id: { metaTitle: 'Modifier le véhicule' },
      },
      vols: {
        description: 'Catalogue des vols, classes cabine et disponibilités. Recherche par code vol.',
        links: { airlines: 'Compagnies aériennes', airports: 'Aéroports' },
        nouveau: {
          metaTitle: 'Nouveau vol',
          backLabel: 'Retour aux vols',
          description: 'Définissez le trajet, puis ajoutez les classes cabine sur la fiche vol.',
        },
        compagnies: {
          description: 'Référentiel des compagnies (code IATA 2 lettres).',
          backLabel: 'Retour aux vols',
        },
        aeroports: {
          description: 'Référentiel des aéroports (code IATA 3 lettres).',
          backLabel: 'Retour aux vols',
        },
        id: {
          metaTitle: 'Modifier le vol',
          classes: {
            classId: {
              disponibilites: { metaTitle: 'Disponibilités classe' },
            },
          },
        },
      },
      croisieres: {
        description: 'Départs programmés, itinéraires, cabines et disponibilités.',
        links: {
          ships: 'Navires',
          lines: 'Lignes de croisière',
          ports: 'Ports',
          newSailing: 'Nouveau départ',
        },
        nouveau: {
          metaTitle: 'Nouveau départ',
          description: 'Associez un itinéraire existant à une date de départ.',
        },
        lignes: { description: 'Référentiel des compagnies / lignes.' },
        ports: { description: 'Référentiel des escales.' },
        navires: {
          description: 'Navires, itinéraires, escales et cabines.',
          links: { backToSailings: '← Départs' },
          nouveau: {
            metaTitle: 'Nouveau navire',
            description: 'Créez un navire puis ajoutez itinéraires et cabines.',
          },
          shipId: {
            metaTitle: 'Navire',
            itineraires: { itineraryId: { metaTitle: 'Escales itinéraire' } },
          },
        },
        id: { metaTitle: 'Départ' },
      },
      forfaits: {
        description: 'Packages combinés avec remise et prix calculé à partir des produits inclus.',
        nouveau: {
          metaTitle: 'Nouveau forfait',
          description: 'Créez le forfait puis ajoutez des items sur la page d’édition.',
        },
        id: {
          metaTitle: 'Modifier le forfait',
          voir: { metaTitle: 'Voir le forfait' },
        },
      },
    },
    reservations: {
      description:
        'Liste paginée des réservations (données API live). Filtres par statut, date, client et organisation. Accès requis : bookings.read.',
      lignes: {
        description:
          'Tableau global des articles par réservation (données API live). Filtres par type, statut de la réservation et identifiant booking. Accès requis : bookings.read.',
      },
    },
    paiements: {
      description:
        'Transactions et remboursements Stripe (mode test). Filtres par statut, dates et organisation (super admin). Accès : payments.read ; remboursement : payments.write.',
      'codes-promo': {
        intro:
          "Créez et gérez les codes utilisables dans le checkout (preview web). Validation des dates, unicité du code et plafond d'utilisations. Voir aussi les promotions. Accès : promo_codes.read / write.",
        linkPromotions: 'promotions',
        nouveau: {
          metaTitle: 'Nouveau code promo',
          description:
            'Le code sera normalisé en majuscules et pourra être saisi tel quel dans le checkout.',
        },
        id: { metaTitle: 'Modifier le code promo' },
      },
      promotions: {
        intro:
          'Campagnes marketing avec réduction optionnelle (checkout via promotionId). Complémentaire aux codes promo. Accès : promo_codes.read / write.',
        linkPromoCodes: 'codes promo',
        nouveau: {
          metaTitle: 'Nouvelle promotion',
          description:
            'Définissez la campagne, la réduction éventuelle et les dates de validité.',
        },
        id: { metaTitle: 'Modifier la promotion' },
      },
    },
    contenu: {
      tickets: {
        description:
          "Demandes d'assistance clients. Filtres par statut et priorité. Accès : support_tickets.read / support_tickets.write.",
        id: { metaTitle: 'Détail ticket' },
      },
      avis: {
        description:
          'Modération des notes et commentaires clients. Filtres par note, propriété et statut. Actions : approuver, masquer ou supprimer. Accès : reviews.read / reviews.write.',
        id: { metaTitle: 'Détail avis' },
      },
    },
    systeme: {
      roles: {
        title: 'Rôles et permissions',
        description:
          'Gérez les rôles, la matrice des permissions et les assignations utilisateurs.',
        actions: {
          permissions: 'Permissions',
          assignments: 'Assignations',
          new: 'Nouveau rôle',
        },
        nouveau: {
          metaTitle: 'Nouveau rôle',
          description: 'Créer un rôle personnalisé et définir ses permissions.',
        },
        permissions: {
          title: 'Catalogue des permissions',
          description: 'Liste en lecture seule des permissions disponibles sur la plateforme.',
        },
        assignations: {
          title: 'Assignations de rôles',
          description: 'Attribuer ou révoquer des rôles pour les utilisateurs (tous périmètres).',
        },
        id: { metaTitle: 'Modifier le rôle' },
      },
      audit: {
        title: 'Audit RBAC',
        description:
          'Journal des événements de sécurité et des changements de permissions (lecture seule).',
      },
    },
    parametres: {
      metaTitle: 'Paramètres',
      comptes: { metaTitle: 'Comptes bancaires' },
      emails: { metaTitle: 'E-mails' },
    },
    dashboard: {
      bookings: { id: { metaTitle: 'Détail réservation' } },
    },
  },
  en: {
    meta: {
      editUser: 'Edit user',
      editEmployee: 'Edit employee',
      editOrganization: 'Edit organization',
      editAccommodation: 'Edit accommodation',
      editActivity: 'Edit activity',
      editDestination: 'Edit destination',
      editVehicle: 'Edit vehicle',
      editFlight: 'Edit flight',
      editPackage: 'Edit package',
      editRole: 'Edit role',
      editPromoCode: 'Edit promo code',
      editPromotion: 'Edit promotion',
      viewPackage: 'View package',
      detailBooking: 'Booking detail',
      detailTicket: 'Ticket detail',
      detailReview: 'Review detail',
      sailingDetail: 'Sailing',
      shipDetail: 'Ship',
      classAvailability: 'Class availability',
      roomAvailability: 'Room availability',
      itineraryStops: 'Itinerary stops',
    },
    utilisateurs: {
      description: 'Platform accounts. Filter by status or organization.',
      nouveau: { metaTitle: 'New user', description: 'Create a user account.' },
      id: { metaTitle: 'Edit user' },
      employes: {
        description: 'Employee profiles linked to users and organizations.',
        nouveau: {
          metaTitle: 'New employee',
          description: 'Link an existing user to an organization.',
        },
        id: { metaTitle: 'Edit employee' },
      },
      adresses: { description: 'Addresses saved by users.' },
      'moyens-paiement': { description: 'Cards and payment methods saved by users.' },
      sessions: {
        description: 'Active sessions. Revoke a session to sign the user out.',
      },
      'journaux-securite': { description: 'Security events and access audit.' },
    },
    hebergements: {
      title: 'Accommodations',
      description: 'Properties, rooms and amenities. Filter by destination.',
      nouveau: {
        metaTitle: 'New accommodation',
        description: 'Create the property then add images, amenities and rooms.',
      },
      id: {
        metaTitle: 'Edit accommodation',
        chambres: {
          roomId: {
            disponibilites: { metaTitle: 'Room availability' },
          },
        },
      },
      equipements: {
        description: 'Global catalog reused across accommodations (Wi-Fi, pool, etc.).',
      },
    },
    organisations: {
      title: 'Organizations',
      description: 'Platform partners and entities. Search by name or slug.',
      nouveau: {
        metaTitle: 'New organization',
        description: 'Create a partner organization.',
      },
      id: { metaTitle: 'Edit organization' },
    },
    fidelite: {
      comptes: {
        title: 'Loyalty accounts',
        description:
          'OneKey program — point balance, tiers and last activity. Manual adjustment reserved for super admin.',
      },
    },
    produits: {
      activites: {
        title: 'Activities & tours',
        description: 'Experiences, providers and time slots by destination.',
        actions: { providers: 'Providers', new: 'New activity' },
        nouveau: {
          metaTitle: 'New activity',
          description: 'Create an experience then add schedules on the edit page.',
        },
        fournisseurs: {
          title: 'Activity providers',
          description: 'Operators linked to destinations.',
        },
        id: { metaTitle: 'Edit activity' },
      },
      destinations: {
        title: 'Destinations',
        description: 'Geography and points of interest. Search by name, slug or country code.',
        actions: { new: 'New destination' },
        nouveau: {
          metaTitle: 'New destination',
          description: 'Create the destination then add points of interest on the edit page.',
        },
        id: { metaTitle: 'Edit destination' },
      },
      locations: {
        title: 'Vehicle rentals',
        description: 'Vehicles by agency, categories and availability slots.',
        links: { agencies: 'Rental agencies', categories: 'Vehicle categories' },
        agences: {
          title: 'Rental agencies',
          description: 'Agency directory linked to destinations.',
        },
        categories: {
          title: 'Vehicle categories',
          description: 'Vehicle types (compact, SUV, premium, etc.).',
        },
        nouveau: {
          metaTitle: 'New vehicle',
          description: 'Link an agency and category, then set availability slots.',
          backLabel: 'Back to vehicles',
        },
        id: { metaTitle: 'Edit vehicle' },
      },
      vols: {
        description: 'Flight catalog, cabin classes and availability. Search by flight code.',
        links: { airlines: 'Airlines', airports: 'Airports' },
        nouveau: {
          metaTitle: 'New flight',
          backLabel: 'Back to flights',
          description: 'Define the route, then add cabin classes on the flight page.',
        },
        compagnies: {
          description: 'Airline directory (2-letter IATA code).',
          backLabel: 'Back to flights',
        },
        aeroports: {
          description: 'Airport directory (3-letter IATA code).',
          backLabel: 'Back to flights',
        },
        id: {
          metaTitle: 'Edit flight',
          classes: {
            classId: {
              disponibilites: { metaTitle: 'Class availability' },
            },
          },
        },
      },
      croisieres: {
        description: 'Scheduled departures, itineraries, cabins and availability.',
        links: {
          ships: 'Ships',
          lines: 'Cruise lines',
          ports: 'Cruise ports',
          newSailing: 'New sailing',
        },
        nouveau: {
          metaTitle: 'New sailing',
          description: 'Link an existing itinerary to a departure date.',
        },
        lignes: { description: 'Cruise line directory.' },
        ports: { description: 'Port directory.' },
        navires: {
          description: 'Ships, itineraries, ports and cabins.',
          links: { backToSailings: '← Sailings' },
          nouveau: {
            metaTitle: 'New ship',
            description: 'Create a ship then add itineraries and cabins.',
          },
          shipId: {
            metaTitle: 'Ship',
            itineraires: { itineraryId: { metaTitle: 'Itinerary stops' } },
          },
        },
        id: { metaTitle: 'Sailing' },
      },
      forfaits: {
        description: 'Combined packages with discount and price calculated from included products.',
        nouveau: {
          metaTitle: 'New package',
          description: 'Create the package then add items on the edit page.',
        },
        id: { metaTitle: 'Edit package', voir: { metaTitle: 'View package' } },
      },
    },
    reservations: {
      description:
        'Paginated booking list (live API data). Filter by status, date, customer and organization. Requires bookings.read.',
      lignes: {
        description:
          'Global line items per booking (live API data). Filter by type, booking status and booking ID. Requires bookings.read.',
      },
    },
    paiements: {
      description:
        'Stripe transactions and refunds (test mode). Filter by status, dates and organization (super admin). Access: payments.read; refund: payments.write.',
      'codes-promo': {
        intro:
          'Codes entered at checkout (e.g. WELCOME10). Complements promotions. Access: promo_codes.read / write.',
        linkPromotions: 'promotions',
        nouveau: {
          metaTitle: 'New promo code',
          description: 'The code will be uppercased and can be entered as-is at checkout.',
        },
        id: { metaTitle: 'Edit promo code' },
      },
      promotions: {
        intro:
          'Marketing campaigns with optional discount (checkout via promotionId). Complements promo codes. Access: promo_codes.read / write.',
        linkPromoCodes: 'promo codes',
        nouveau: {
          metaTitle: 'New promotion',
          description: 'Define the campaign, optional discount and validity dates.',
        },
        id: { metaTitle: 'Edit promotion' },
      },
    },
    contenu: {
      tickets: {
        description:
          'Customer support requests. Filter by status and priority. Access: support_tickets.read / support_tickets.write.',
        id: { metaTitle: 'Ticket detail' },
      },
      avis: {
        description:
          'Moderate customer ratings and comments. Filter by score, property and status. Actions: approve, hide or delete. Access: reviews.read / reviews.write.',
        id: { metaTitle: 'Review detail' },
      },
    },
    systeme: {
      roles: {
        title: 'Roles & permissions',
        description: 'Manage roles, permission matrix and user assignments.',
        actions: {
          permissions: 'Permissions',
          assignments: 'Assignments',
          new: 'New role',
        },
        nouveau: {
          metaTitle: 'New role',
          description: 'Create a custom role and define its permissions.',
        },
        permissions: {
          title: 'Permission catalog',
          description: 'Read-only list of permissions available on the platform.',
        },
        assignations: {
          title: 'Role assignments',
          description: 'Assign or revoke roles for users (all scopes).',
        },
        id: { metaTitle: 'Edit role' },
      },
      audit: {
        title: 'RBAC audit',
        description: 'Security event log and permission changes (read-only).',
      },
    },
    parametres: {
      metaTitle: 'Settings',
      comptes: { metaTitle: 'Bank accounts' },
      emails: { metaTitle: 'Emails' },
    },
    dashboard: {
      bookings: { id: { metaTitle: 'Booking detail' } },
    },
  },
  es: {
    meta: {
      editUser: 'Editar usuario',
      editEmployee: 'Editar empleado',
      editOrganization: 'Editar organización',
      editAccommodation: 'Editar alojamiento',
      editActivity: 'Editar actividad',
      editDestination: 'Editar destino',
      editVehicle: 'Editar vehículo',
      editFlight: 'Editar vuelo',
      editPackage: 'Editar paquete',
      editRole: 'Editar rol',
      editPromoCode: 'Editar código promocional',
      editPromotion: 'Editar promoción',
      viewPackage: 'Ver paquete',
      detailBooking: 'Detalle de reserva',
      detailTicket: 'Detalle de ticket',
      detailReview: 'Detalle de reseña',
      sailingDetail: 'Salida',
      shipDetail: 'Barco',
      classAvailability: 'Disponibilidad de clase',
      roomAvailability: 'Disponibilidad de habitación',
      itineraryStops: 'Escalas del itinerario',
    },
    utilisateurs: {
      description: 'Cuentas de la plataforma. Filtre por estado u organización.',
      nouveau: { metaTitle: 'Nuevo usuario', description: 'Crear una cuenta de usuario.' },
      id: { metaTitle: 'Editar usuario' },
      employes: {
        description: 'Perfiles de empleados vinculados a usuarios y organizaciones.',
        nouveau: {
          metaTitle: 'Nuevo empleado',
          description: 'Vincular un usuario existente a una organización.',
        },
        id: { metaTitle: 'Editar empleado' },
      },
      adresses: { description: 'Direcciones guardadas por los usuarios.' },
      'moyens-paiement': { description: 'Tarjetas y métodos de pago guardados por los usuarios.' },
      sessions: {
        description: 'Sesiones activas. Revoque una sesión para desconectar al usuario.',
      },
      'journaux-securite': { description: 'Eventos de seguridad y auditoría de acceso.' },
    },
    hebergements: {
      title: 'Alojamientos',
      description: 'Propiedades, habitaciones y equipamientos. Filtre por destino.',
      nouveau: {
        metaTitle: 'Nuevo alojamiento',
        description: 'Cree la propiedad y luego añada imágenes, equipamientos y habitaciones.',
      },
      id: {
        metaTitle: 'Editar alojamiento',
        chambres: {
          roomId: {
            disponibilites: { metaTitle: 'Disponibilidad de habitación' },
          },
        },
      },
      equipements: {
        description: 'Catálogo global reutilizable en alojamientos (Wi-Fi, piscina, etc.).',
      },
    },
    organisations: {
      title: 'Organizaciones',
      description: 'Socios y entidades de la plataforma. Busque por nombre o slug.',
      nouveau: {
        metaTitle: 'Nueva organización',
        description: 'Crear una organización socia.',
      },
      id: { metaTitle: 'Editar organización' },
    },
    fidelite: {
      comptes: {
        title: 'Cuentas de fidelidad',
        description:
          'Programa OneKey — saldo de puntos, niveles y última actividad. Ajuste manual reservado al superadministrador.',
      },
    },
    produits: {
      activites: {
        title: 'Actividades y tours',
        description: 'Experiencias, proveedores y franjas horarias por destino.',
        actions: { providers: 'Proveedores', new: 'Nueva actividad' },
        nouveau: {
          metaTitle: 'Nueva actividad',
          description: 'Cree una experiencia y luego añada horarios en la página de edición.',
        },
        fournisseurs: {
          title: 'Proveedores de actividades',
          description: 'Operadores vinculados a destinos.',
        },
        id: { metaTitle: 'Editar actividad' },
      },
      destinations: {
        title: 'Destinos',
        description: 'Geografía y puntos de interés. Busque por nombre, slug o código de país.',
        actions: { new: 'Nuevo destino' },
        nouveau: {
          metaTitle: 'Nuevo destino',
          description: 'Cree el destino y luego añada puntos de interés en la página de edición.',
        },
        id: { metaTitle: 'Editar destino' },
      },
      locations: {
        title: 'Alquiler de vehículos',
        description: 'Vehículos por agencia, categorías y franjas de disponibilidad.',
        links: { agencies: 'Agencias de alquiler', categories: 'Categorías de vehículos' },
        agences: {
          title: 'Agencias de alquiler',
          description: 'Directorio de agencias vinculadas a destinos.',
        },
        categories: {
          title: 'Categorías de vehículos',
          description: 'Tipos de vehículos (compacto, SUV, premium, etc.).',
        },
        nouveau: {
          metaTitle: 'Nuevo vehículo',
          description: 'Vincule una agencia y categoría, luego defina las franjas de disponibilidad.',
          backLabel: 'Volver a vehículos',
        },
        id: { metaTitle: 'Editar vehículo' },
      },
      vols: {
        description: 'Catálogo de vuelos, clases de cabina y disponibilidad. Busque por código de vuelo.',
        links: { airlines: 'Aerolíneas', airports: 'Aeropuertos' },
        nouveau: {
          metaTitle: 'Nuevo vuelo',
          backLabel: 'Volver a vuelos',
          description: 'Defina la ruta y luego añada clases de cabina en la ficha del vuelo.',
        },
        compagnies: {
          description: 'Directorio de aerolíneas (código IATA de 2 letras).',
          backLabel: 'Volver a vuelos',
        },
        aeroports: {
          description: 'Directorio de aeropuertos (código IATA de 3 letras).',
          backLabel: 'Volver a vuelos',
        },
        id: {
          metaTitle: 'Editar vuelo',
          classes: {
            classId: {
              disponibilites: { metaTitle: 'Disponibilidad de clase' },
            },
          },
        },
      },
      croisieres: {
        description: 'Salidas programadas, itinerarios, cabinas y disponibilidad.',
        links: {
          ships: 'Barcos',
          lines: 'Líneas de crucero',
          ports: 'Puertos de crucero',
          newSailing: 'Nueva salida',
        },
        nouveau: {
          metaTitle: 'Nueva salida',
          description: 'Vincule un itinerario existente a una fecha de salida.',
        },
        lignes: { description: 'Directorio de líneas de crucero.' },
        ports: { description: 'Directorio de puertos.' },
        navires: {
          description: 'Barcos, itinerarios, puertos y cabinas.',
          links: { backToSailings: '← Salidas' },
          nouveau: {
            metaTitle: 'Nuevo barco',
            description: 'Cree un barco y luego añada itinerarios y cabinas.',
          },
          shipId: {
            metaTitle: 'Barco',
            itineraires: { itineraryId: { metaTitle: 'Escalas del itinerario' } },
          },
        },
        id: { metaTitle: 'Salida' },
      },
      forfaits: {
        description: 'Paquetes combinados con descuento y precio calculado a partir de los productos incluidos.',
        nouveau: {
          metaTitle: 'Nuevo paquete',
          description: 'Cree el paquete y luego añada elementos en la página de edición.',
        },
        id: { metaTitle: 'Editar paquete', voir: { metaTitle: 'Ver paquete' } },
      },
    },
    reservations: {
      description:
        'Lista paginada de reservas (datos API en vivo). Filtre por estado, fecha, cliente y organización. Requiere bookings.read.',
      lignes: {
        description:
          'Tabla global de artículos por reserva (datos API en vivo). Filtre por tipo, estado de reserva e ID de reserva. Requiere bookings.read.',
      },
    },
    paiements: {
      description:
        'Transacciones y reembolsos Stripe (modo prueba). Filtre por estado, fechas y organización (super admin). Acceso: payments.read; reembolso: payments.write.',
      'codes-promo': {
        intro:
          'Códigos introducidos en el checkout (ej. BIENVENUE10). Complementa las promociones. Acceso: promo_codes.read / write.',
        linkPromotions: 'promociones',
        nouveau: {
          metaTitle: 'Nuevo código promocional',
          description: 'El código se normalizará en mayúsculas y podrá introducirse tal cual en el checkout.',
        },
        id: { metaTitle: 'Editar código promocional' },
      },
      promotions: {
        intro:
          'Campañas de marketing con descuento opcional (checkout vía promotionId). Complementa los códigos promocionales. Acceso: promo_codes.read / write.',
        linkPromoCodes: 'códigos promocionales',
        nouveau: {
          metaTitle: 'Nueva promoción',
          description: 'Defina la campaña, el descuento opcional y las fechas de validez.',
        },
        id: { metaTitle: 'Editar promoción' },
      },
    },
    contenu: {
      tickets: {
        description:
          'Solicitudes de asistencia al cliente. Filtre por estado y prioridad. Acceso: support_tickets.read / support_tickets.write.',
        id: { metaTitle: 'Detalle de ticket' },
      },
      avis: {
        description:
          'Modere valoraciones y comentarios de clientes. Filtre por nota, propiedad y estado. Acciones: aprobar, ocultar o eliminar. Acceso: reviews.read / reviews.write.',
        id: { metaTitle: 'Detalle de reseña' },
      },
    },
    systeme: {
      roles: {
        title: 'Roles y permisos',
        description: 'Gestione roles, matriz de permisos y asignaciones de usuarios.',
        actions: {
          permissions: 'Permisos',
          assignments: 'Asignaciones',
          new: 'Nuevo rol',
        },
        nouveau: {
          metaTitle: 'Nuevo rol',
          description: 'Cree un rol personalizado y defina sus permisos.',
        },
        permissions: {
          title: 'Catálogo de permisos',
          description: 'Lista de solo lectura de permisos disponibles en la plataforma.',
        },
        assignations: {
          title: 'Asignaciones de roles',
          description: 'Asigne o revoque roles para usuarios (todos los ámbitos).',
        },
        id: { metaTitle: 'Editar rol' },
      },
      audit: {
        title: 'Auditoría RBAC',
        description: 'Registro de eventos de seguridad y cambios de permisos (solo lectura).',
      },
    },
    parametres: {
      metaTitle: 'Configuración',
      comptes: { metaTitle: 'Cuentas bancarias' },
      emails: { metaTitle: 'Correos electrónicos' },
    },
    dashboard: {
      bookings: { id: { metaTitle: 'Detalle de reserva' } },
    },
  },
};
