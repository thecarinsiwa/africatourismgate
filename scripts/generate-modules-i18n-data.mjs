import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { phase3cModulesFr } from './phase3c-modules-i18n-fr.mjs';
import { productsModulesFr } from './products-modules-i18n-fr.mjs';

function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      deepMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

const fr = {
  common: {
    accountStatus: { active: 'Actif', suspended: 'Suspendu', deleted: 'Supprimé' },
    boolean: { yes: 'Oui', no: 'Non' },
    empty: { dash: '—' },
    filters: {
      all: 'Tous',
      allFeminine: 'Toutes',
      none: 'Aucune',
      clear: 'Effacer le filtre',
      apply: 'Appliquer',
      dateFrom: 'Du',
      dateTo: 'Au',
      searchByEmailOrName: 'Rechercher par e-mail ou nom…',
      searchByEmailOrNameAria: 'Rechercher par e-mail ou nom',
      searchByNameOrSlug: 'Rechercher par nom ou slug…',
      searchByNameOrSlugAria: 'Rechercher par nom ou slug',
    },
    columns: {
      user: 'Utilisateur',
      organization: 'Organisation',
      status: 'Statut',
      actions: 'Actions',
      date: 'Date',
      type: 'Type',
      amount: 'Montant',
      client: 'Client',
      label: 'Libellé',
      address: 'Adresse',
      country: 'Pays',
      default: 'Par défaut',
      provider: 'Fournisseur',
      method: 'Méthode',
      role: 'Rôle',
      quantityShort: 'Qté',
      unitPrice: 'Prix unit.',
      dates: 'Dates',
      booking: 'Réservation',
      employees: 'Employés',
      end: 'Fin',
      addedAt: 'Ajouté le',
    },
    pagination: {
      session: 'session',
      address: 'adresse',
      paymentMethod: 'moyen de paiement',
      user: 'utilisateur',
      organization: 'organisation',
      booking: 'réservation',
      line: 'ligne',
      payment: 'paiement',
    },
    loading: 'Chargement…',
    sessionStatus: { active: 'Active', expired: 'Expirée', title: 'Session' },
    dates: { createdAt: 'Créée le', expiresAt: 'Expire le' },
  },
  users: {
    list: {
      newUser: 'Nouvel utilisateur',
      emptyDefault: 'Aucun utilisateur pour le moment.',
      emptyFiltered: 'Aucun utilisateur ne correspond à vos critères.',
      ariaLabel: 'Liste des utilisateurs',
      deleteConfirm:
        "Supprimer l'utilisateur « {email} » ? Cette action est réversible côté base.",
    },
    filters: { status: 'Statut', organization: 'Organisation', role: 'Rôle' },
    form: {
      email: 'E-mail',
      passwordCreate: 'Mot de passe',
      passwordEdit: 'Nouveau mot de passe (optionnel)',
      passwordHintCreate: 'Minimum 8 caractères.',
      passwordHintEdit: 'Laissez vide pour conserver le mot de passe actuel.',
      firstName: 'Prénom',
      lastName: 'Nom',
      phone: 'Téléphone',
      preferredLanguage: 'Langue préférée',
      preferredLanguageHint: 'Code ISO à 2 lettres (ex. fr, en).',
      organization: 'Organisation',
      organizationNone: 'Aucune',
      status: 'Statut',
      submitCreate: "Créer l'utilisateur",
      submitEdit: 'Enregistrer',
      validation: {
        emailRequired: "L'adresse e-mail est obligatoire.",
        passwordMinLength: 'Le mot de passe doit contenir au moins 8 caractères.',
        firstNameRequired: 'Le prénom est obligatoire.',
        lastNameRequired: 'Le nom est obligatoire.',
      },
    },
    detail: {
      title: "Modifier l'utilisateur",
      tabsAria: 'Sections du compte utilisateur',
      tabs: {
        profile: 'Profil',
        addresses: 'Adresses',
        paymentMethods: 'Moyens paiement',
        sessions: 'Sessions',
        roles: 'Rôles',
      },
    },
    userIdFilter: { label: 'Utilisateur', allUsers: 'Tous les utilisateurs' },
    addresses: {
      emptyDefault: 'Aucune adresse enregistrée.',
      emptyFiltered: 'Aucune adresse pour cet utilisateur.',
      ariaLabel: 'Liste des adresses utilisateur',
    },
    paymentMethods: {
      lastFourMasked: '•••• {lastFour}',
      emptyDefault: 'Aucun moyen de paiement enregistré.',
      emptyFiltered: 'Aucun moyen de paiement pour cet utilisateur.',
      ariaLabel: 'Liste des moyens de paiement',
    },
    sessions: {
      revokeConfirm:
        "Révoquer cette session ? L'utilisateur devra se reconnecter.",
      emptyDefault: 'Aucune session active.',
      emptyFiltered: 'Aucune session active pour cet utilisateur.',
      ariaLabel: 'Liste des sessions utilisateur',
    },
    stats: {
      total: { label: 'Utilisateurs', subtitle: 'Comptes enregistrés' },
      active: { label: 'Actifs', subtitle: 'Comptes actifs' },
      suspended: { label: 'Suspendus', subtitle: 'Comptes suspendus' },
      employees: { label: 'Employés', subtitle: 'Profils employés' },
    },
    roles: {
      assignedTitle: 'Rôles assignés',
      empty: 'Aucun rôle actif pour cet utilisateur.',
      assignFormTitle: 'Assigner un rôle',
      user: 'Utilisateur',
      role: 'Rôle',
      selectPlaceholder: 'Sélectionner…',
      scope: 'Périmètre (scope)',
      scopeId: 'ID du scope (UUID)',
      scopeIdHint: 'Ex. ID propriété, agence ou file support.',
      expiresAt: 'Expiration (optionnel)',
      superAdminWarning:
        'Réservé aux super administrateurs — périmètre forcé à Global.',
      superAdminConfirm:
        "Attribuer le rôle « {roleName} » ? Cet utilisateur obtiendra un accès complet à la plateforme.",
      validation: {
        userAndRoleRequired: 'Utilisateur et rôle sont obligatoires.',
        scopeIdRequired: "L'identifiant de scope est obligatoire pour ce périmètre.",
      },
      scopeTypes: {
        global: 'Global',
        property: 'Propriété',
        agency: 'Agence',
        support_queue: 'File support',
      },
      scopeDisplay: {
        global: 'Global',
        property: 'Établissement',
        agency: 'Agence',
        support_queue: 'File support',
        withId: '{label} · {idPrefix}…',
      },
      revokeDialog: {
        title: 'Révoquer le rôle',
        description: 'Retirer ce rôle pour cet utilisateur ?',
      },
      toast: {
        revokedTitle: 'Rôle révoqué',
        revokedMessage: "L'assignation a été retirée.",
        revokeFailedTitle: 'Échec de la révocation',
      },
    },
  },
  organizations: {
    list: {
      emptyTitleSearch: 'Aucune organisation ne correspond à votre recherche',
      emptyTitleDefault: 'Aucune organisation pour le moment',
      emptyDescriptionSearch: 'Essayez un autre nom ou slug.',
      emptyDescriptionDefault: 'Créez une organisation partenaire pour commencer.',
      emptyTableSearch: 'Aucune organisation ne correspond à votre recherche.',
      emptyTableDefault: 'Aucune organisation pour le moment.',
      ariaLabel: 'Liste des organisations',
      columns: { type: 'Type' },
      deleteDialog: {
        title: "Supprimer l'organisation",
        description:
          "Supprimer l'organisation « {name} » ? Cette action est réversible côté base.",
      },
    },
    form: {
      sections: {
        identity: 'Identité',
        contact: 'Contact',
        legal: 'Juridique',
        configuration: 'Configuration',
      },
      name: 'Nom',
      slug: 'Slug',
      slugHint: "Identifiant unique dans l'URL (ex. africa-tourism-gate).",
      description: 'Description',
      website: 'Site web',
      websitePlaceholder: 'https://',
      contactEmail: 'E-mail de contact',
      contactPhone: 'Téléphone',
      legalForm: 'Forme juridique',
      rccm: 'RCCM',
      rccmHint: 'Registre du Commerce et du Crédit Mobilier',
      idNat: 'ID. Nat.',
      idNatHint: 'Identification Nationale',
      nif: 'NIF',
      nifHint: "Numéro d'Identification Fiscale",
      cnss: 'CNSS',
      cnssHint: 'Caisse Nationale de Sécurité Sociale',
      currency: 'Devise',
      status: 'Statut',
      submitCreate: "Créer l'organisation",
      submitEdit: 'Enregistrer',
      validation: {
        nameRequired: 'Le nom est obligatoire.',
        slugRequired: 'Le slug est obligatoire.',
        slugInvalid:
          'Slug invalide : minuscules, chiffres et tirets uniquement (ex. mon-organisation).',
        currencyInvalid: 'La devise doit comporter 3 lettres (ex. USD, CDF).',
      },
      toast: {
        savedTitle: 'Organisation enregistrée',
        errorTitle: "Erreur d'enregistrement",
      },
    },
    legalForm: {
      unspecified: 'Non renseigné',
      SARL: 'SARL',
      SA: 'SA',
      SAS: 'SAS',
      Ets: 'Établissement (Ets)',
      SNC: 'SNC',
      ASBL: 'ASBL',
    },
    detail: {
      title: 'Organisation',
      tabsAria: "Sections de l'organisation",
      tabs: { infos: 'Infos', users: 'Utilisateurs', settings: 'Paramètres' },
      settingsIntro:
        "Configuration de l'organisation : coordonnées, locale, réservation et branding.",
    },
    selector: { defaultLabel: 'Organisation' },
  },
  bookings: {
    status: {
      draft: 'Brouillon',
      pending_payment: 'En attente de paiement',
      confirmed: 'Confirmée',
      cancelled: 'Annulée',
      refunded: 'Remboursée',
    },
    itemTypes: {
      room: 'Chambre',
      flight_class: 'Vol',
      vehicle: 'Véhicule',
      cabin: 'Cabine',
      activity_schedule: 'Activité',
      package: 'Forfait',
    },
    catalogLink: {
      referencePrefix: 'Réf. {idPrefix}',
      ariaLabel: 'Voir {typeLabel} : {title}',
    },
    list: {
      emptyDefault: 'Aucune réservation pour le moment.',
      emptyFiltered: 'Aucune réservation ne correspond à vos critères.',
      ariaLabel: 'Liste des réservations',
      filters: { client: 'Client' },
    },
    itemsList: {
      filters: {
        type: 'Type',
        bookingStatus: 'Statut réservation',
        bookingId: 'ID réservation',
        bookingIdPlaceholder: 'UUID complet',
      },
      emptyDefault: 'Aucune ligne de réservation pour le moment.',
      emptyFiltered: 'Aucune ligne ne correspond à vos critères.',
      ariaLabel: 'Lignes de réservation',
    },
    detail: {
      title: 'Réservation',
      backLink: 'Retour aux réservations',
      reference: 'Réf. {idPrefix}',
      sections: {
        client: 'Client',
        status: 'Statut',
        actions: 'Actions',
        bookingLines: 'Lignes de réservation',
        payments: 'Paiements',
      },
      clientFields: {
        email: 'E-mail',
        name: 'Nom',
        organization: 'Organisation',
        total: 'Total',
        createdAt: 'Créée le',
      },
      actions: {
        changeStatus: 'Changer le statut',
        statusReason: 'Motif (historique)',
        statusReasonPlaceholder: 'Ex. confirmation manuelle, remboursement…',
        applyStatus: 'Appliquer le statut',
        cancellation: 'Annulation',
        cancelReason: "Motif d'annulation",
        cancelReasonPlaceholder: 'Ex. demande client, indisponibilité…',
        cancelBooking: 'Annuler la réservation',
        readOnly:
          'Modification réservée aux comptes avec la permission bookings.write.',
      },
      linesEmpty: 'Aucune ligne.',
      linesAriaLabel: 'Lignes de réservation',
      paymentsEmpty: 'Aucun paiement enregistré pour cette réservation.',
      paymentsAriaLabel: 'Paiements',
      statusDialog: {
        title: 'Confirmer le changement de statut',
        description:
          'Passer la réservation de « {fromStatus} » à « {toStatus} » ?{reasonSuffix}',
        reasonSuffix: ' Motif : {reason}',
      },
      cancelDialog: {
        title: 'Annuler la réservation',
        description:
          'Annuler cette réservation ? Le stock des produits sera libéré (moteur de réservation).',
        confirm: 'Annuler la réservation',
        cancel: 'Retour',
      },
      paymentStatus: {
        pending: 'En attente',
        succeeded: 'Réussi',
        failed: 'Échoué',
        refunded: 'Remboursé',
      },
    },
    timeline: {
      progressAria: 'Progression du statut de réservation',
      finalStatus: 'Statut final',
      history: 'Historique',
      historyAria: 'Historique des changements de statut',
      historyEmpty: 'Aucun changement de statut enregistré.',
      transition: '{fromStatus} → {toStatus}',
    },
    stats: {
      bookings: {
        total: { label: 'Réservations', subtitle: 'Toutes les réservations' },
        confirmed: { label: 'Confirmées', subtitle: 'Réservations confirmées' },
        pending_payment: { label: 'En attente', subtitle: 'Paiement en attente' },
        lines: { label: 'Lignes', subtitle: 'Articles réservés' },
      },
      items: {
        total: { label: 'Lignes', subtitle: 'Toutes les lignes' },
        confirmed: { label: 'Confirmées', subtitle: 'Lignes de réservations confirmées' },
        pending_payment: { label: 'En attente', subtitle: 'Lignes en attente de paiement' },
        bookings: { label: 'Réservations', subtitle: 'Voir toutes les réservations' },
      },
    },
  },
  payments: {
    status: {
      pending: 'En attente',
      succeeded: 'Réussi',
      failed: 'Échoué',
      refunded: 'Remboursé',
    },
    providers: { stripe: 'Stripe', cash: 'Espèces' },
    refundLabels: {
      partial: 'Remboursement partiel',
      full: 'Remboursement total',
      generic: 'Remboursement',
    },
    subnav: {
      ariaLabel: 'Navigation paiements et promotions',
      transactions: 'Transactions',
      promoCodes: 'Codes promo',
      promotions: 'Promotions',
    },
    list: {
      emptyDefault: 'Aucun paiement pour le moment.',
      emptyFiltered: 'Aucun paiement ne correspond à vos critères.',
      ariaLabel: 'Liste des paiements',
      accessDenied: 'Accès refusé : permission payments.read requise.',
      notFoundError: 'Paiement introuvable.',
      toast: {
        refundSuccessTitle: 'Remboursement effectué',
        refundSuccessMessage: '{amount} remboursé avec succès.',
      },
    },
    detail: {
      title: 'Détail du paiement',
      sections: {
        summary: 'Résumé',
        stripeIds: 'Identifiants Stripe',
        booking: 'Réservation',
        refundHistory: 'Historique des remboursements',
      },
      fields: {
        amount: 'Montant',
        status: 'Statut',
        method: 'Méthode',
        date: 'Date',
        client: 'Client',
        stripePaymentIntent: 'Payment Intent Stripe',
        internalPaymentId: 'ID paiement (interne)',
        viewBooking: 'Voir la réservation',
        stripeStatus: 'Stripe : {status}',
      },
      refundHistoryEmpty: 'Aucun remboursement enregistré.',
      cancelBookingFirst: "Remboursement Stripe : annulez d'abord la réservation.",
    },
    refundModal: {
      title: 'Confirmer le remboursement',
      description: 'Remboursement Stripe — maximum remboursable : {maxAmount}.',
      refundTypeLegend: 'Type de remboursement',
      refundTypeTotal: 'Total ({amount})',
      refundTypePartial: 'Partiel',
      partialAmountLabel: 'Montant partiel ({currency})',
      partialAmountPlaceholder: 'Ex. 10,00',
      partialAmountHint: 'Maximum : {maxAmount}',
      reasonLabel: 'Raison du remboursement',
      reasonPlaceholder: 'Ex. Annulation client, erreur de facturation…',
      reasonHint:
        'Minimum {minLength} caractères (usage interne, non envoyé à Stripe).',
      preview: 'Aperçu',
      previewRefunded: 'Montant remboursé',
      previewRemaining: 'Reste remboursable',
      previewReason: 'Motif',
      confirm: 'Confirmer le remboursement',
      validation: {
        reasonMinLength: 'La raison doit contenir au moins {minLength} caractères.',
        noRefundableAmount: 'Aucun montant remboursable restant.',
        partialAmountRequired: 'Indiquez un montant partiel.',
        partialAmountInvalid: 'Montant partiel invalide.',
        partialAmountExceeds: 'Le montant ne peut pas dépasser {maxAmount}.',
      },
    },
    stats: {
      total: { label: 'Transactions', subtitle: 'Tous les paiements' },
      succeeded: { label: 'Réussis', subtitle: 'Paiements encaissés' },
      pending: { label: 'En attente', subtitle: 'Paiements pending' },
      revenue: { label: 'Revenus', subtitle: 'Total paiements réussis' },
    },
  },
};

deepMerge(fr, productsModulesFr);
deepMerge(fr, phase3cModulesFr);

/** @type {Array<[string, string]>} */
const enReplacements = [
  ["Supprimer l'utilisateur « {email} » ? Cette action est réversible côté base.", "Delete user « {email} »? This action is reversible in the database."],
  ["Créer l'utilisateur", 'Create user'],
  ["L'adresse e-mail est obligatoire.", 'Email address is required.'],
  ["Modifier l'utilisateur", 'Edit user'],
  ["Révoquer cette session ? L'utilisateur devra se reconnecter.", 'Revoke this session? The user will need to sign in again.'],
  ["Attribuer le rôle « {roleName} » ? Cet utilisateur obtiendra un accès complet à la plateforme.", 'Assign role « {roleName} »? This user will get full platform access.'],
  ["L'identifiant de scope est obligatoire pour ce périmètre.", 'Scope ID is required for this scope.'],
  ["L'assignation a été retirée.", 'Assignment removed.'],
  ["Supprimer l'organisation", 'Delete organization'],
  ["Supprimer l'organisation « {name} » ? Cette action est réversible côté base.", 'Delete organization « {name} »? This action is reversible in the database.'],
  ["Identifiant unique dans l'URL (ex. africa-tourism-gate).", 'Unique URL identifier (e.g. africa-tourism-gate).'],
  ["Numéro d'Identification Fiscale", 'Tax identification number'],
  ["Créer l'organisation", 'Create organization'],
  ["Erreur d'enregistrement", 'Save error'],
  ["Sections de l'organisation", 'Organization sections'],
  ["Configuration de l'organisation : coordonnées, locale, réservation et branding.", 'Organization settings: contact details, locale, booking and branding.'],
  ["Motif d'annulation", 'Cancellation reason'],
  ["Remboursement Stripe : annulez d'abord la réservation.", 'Stripe refund: cancel the booking first.'],
];

/** @type {Record<string, string>} */
const esReplacements = [
  ["Supprimer l'utilisateur « {email} » ? Cette action est réversible côté base.", '¿Eliminar usuario « {email} »? Esta acción es reversible en la base de datos.'],
  ["Créer l'utilisateur", 'Crear usuario'],
  ["L'adresse e-mail est obligatoire.", 'La dirección de correo es obligatoria.'],
  ["Modifier l'utilisateur", 'Editar usuario'],
  ["Révoquer cette session ? L'utilisateur devra se reconnecter.", '¿Revocar esta sesión? El usuario deberá volver a iniciar sesión.'],
  ["Attribuer le rôle « {roleName} » ? Cet utilisateur obtiendra un accès complet à la plateforme.", '¿Asignar el rol « {roleName} »? Este usuario obtendrá acceso completo a la plataforma.'],
  ["L'identifiant de scope est obligatoire pour ce périmètre.", 'El identificador de ámbito es obligatorio para este ámbito.'],
  ["L'assignation a été retirée.", 'La asignación fue retirada.'],
  ["Supprimer l'organisation", 'Eliminar organización'],
  ["Supprimer l'organisation « {name} » ? Cette action est réversible côté base.", '¿Eliminar organización « {name} »? Esta acción es reversible en la base de datos.'],
  ["Identifiant unique dans l'URL (ex. africa-tourism-gate).", 'Identificador único en la URL (ej. africa-tourism-gate).'],
  ["Numéro d'Identification Fiscale", 'Número de Identificación Fiscal'],
  ["Créer l'organisation", 'Crear organización'],
  ["Erreur d'enregistrement", 'Error al guardar'],
  ["Sections de l'organisation", 'Secciones de la organización'],
  ["Configuration de l'organisation : coordonnées, locale, réservation et branding.", 'Configuración de la organización: datos de contacto, idioma, reservas y marca.'],
  ["Motif d'annulation", 'Motivo de cancelación'],
  ["Remboursement Stripe : annulez d'abord la réservation.", 'Reembolso Stripe: cancele primero la reserva.'],
];

const wordEn = new Map([
  ['Actif', 'Active'], ['Suspendu', 'Suspended'], ['Supprimé', 'Deleted'],
  ['Oui', 'Yes'], ['Non', 'No'], ['Tous', 'All'], ['Toutes', 'All'], ['Aucune', 'None'],
  ['Effacer le filtre', 'Clear filter'], ['Appliquer', 'Apply'], ['Du', 'From'], ['Au', 'To'],
  ['Utilisateur', 'User'], ['Organisation', 'Organization'], ['Statut', 'Status'], ['Actions', 'Actions'],
  ['Montant', 'Amount'], ['Client', 'Customer'], ['Libellé', 'Label'], ['Adresse', 'Address'],
  ['Pays', 'Country'], ['Par défaut', 'Default'], ['Fournisseur', 'Provider'], ['Méthode', 'Method'],
  ['Rôle', 'Role'], ['Qté', 'Qty'], ['Prix unit.', 'Unit price'], ['Réservation', 'Booking'],
  ['Employés', 'Employees'], ['Ajouté le', 'Added on'], ['Chargement…', 'Loading…'],
  ['Expirée', 'Expired'], ['Session', 'Session'], ['Créée le', 'Created on'], ['Expire le', 'Expires on'],
  ['E-mail', 'Email'], ['Mot de passe', 'Password'], ['Prénom', 'First name'], ['Nom', 'Name'],
  ['Téléphone', 'Phone'], ['Enregistrer', 'Save'], ['Profil', 'Profile'], ['Adresses', 'Addresses'],
  ['Sessions', 'Sessions'], ['Rôles', 'Roles'], ['Utilisateurs', 'Users'], ['Actifs', 'Active'],
  ['Suspendus', 'Suspended'], ['Employés', 'Employees'], ['Global', 'Global'], ['Propriété', 'Property'],
  ['Agence', 'Agency'], ['Brouillon', 'Draft'], ['Confirmée', 'Confirmed'], ['Annulée', 'Cancelled'],
  ['Remboursée', 'Refunded'], ['Chambre', 'Room'], ['Vol', 'Flight'], ['Véhicule', 'Vehicle'],
  ['Cabine', 'Cabin'], ['Activité', 'Activity'], ['Forfait', 'Package'], ['Paiements', 'Payments'],
  ['Réussi', 'Succeeded'], ['Échoué', 'Failed'], ['Remboursé', 'Refunded'], ['En attente', 'Pending'],
  ['Historique', 'History'], ['Lignes', 'Lines'], ['Espèces', 'Cash'], ['Transactions', 'Transactions'],
  ['Promotions', 'Promotions'], ['Résumé', 'Summary'], ['Partiel', 'Partial'], ['Aperçu', 'Preview'],
  ['Motif', 'Reason'], ['Revenus', 'Revenue'], ['Réussis', 'Succeeded'], ['Devise', 'Currency'],
  ['Description', 'Description'], ['Contact', 'Contact'], ['Configuration', 'Settings'],
  ['Identité', 'Identity'], ['Juridique', 'Legal'], ['Paramètres', 'Settings'], ['Infos', 'Info'],
  ['Annulation', 'Cancellation'], ['Retour', 'Back'], ['Total', 'Total'], ['Date', 'Date'],
  ['Type', 'Type'], ['Slug', 'Slug'], ['Non renseigné', 'Not specified'],
  ['Hébergement', 'Accommodation'], ['Hébergements', 'Accommodations'], ['Chambre', 'Room'],
  ['Chambres', 'Rooms'], ['Équipement', 'Amenity'], ['Équipements', 'Amenities'],
  ['Vols', 'Flights'], ['Compagnie', 'Airline'], ['Compagnies', 'Airlines'],
  ['Aéroport', 'Airport'], ['Aéroports', 'Airports'], ['Navire', 'Ship'], ['Navires', 'Ships'],
  ['Croisière', 'Cruise'], ['Départ', 'Departure'], ['Départs', 'Departures'],
  ['Itinéraire', 'Itinerary'], ['Itinéraires', 'Itineraries'], ['Port', 'Port'], ['Ports', 'Ports'],
  ['Escales', 'Ports of call'], ['Cabine', 'Cabin'], ['Cabines', 'Cabins'],
  ['Forfait', 'Package'], ['Forfaits', 'Packages'], ['Destination', 'Destination'],
  ['Destinations', 'Destinations'], ['Difficulté', 'Difficulty'], ['Durée', 'Duration'],
  ['Capacité', 'Capacity'], ['Prix', 'Price'], ['Remise', 'Discount'], ['Titre', 'Title'],
  ['Créneau', 'Slot'], ['Créneaux', 'Slots'], ['Fournisseur', 'Provider'],
  ['Fournisseurs', 'Providers'], ['Disponibilités', 'Availability'], ['Disponible', 'Available'],
  ['Loué', 'Rented'], ['Maintenance', 'Maintenance'], ['Facile', 'Easy'], ['Modérée', 'Moderate'],
  ['Difficile', 'Hard'], ['Expert', 'Expert'], ['Économique', 'Economy'], ['Affaires', 'Business'],
  ['Première', 'First'], ['Hôtel', 'Hotel'], ['Appartement', 'Apartment'], ['Villa', 'Villa'],
  ['Auberge', 'Hostel'], ['Autre', 'Other'], ['Inactif', 'Inactive'],
]);

const wordEs = new Map([
  ['Actif', 'Activo'], ['Suspendu', 'Suspendido'], ['Supprimé', 'Eliminado'],
  ['Oui', 'Sí'], ['Non', 'No'], ['Tous', 'Todos'], ['Toutes', 'Todas'], ['Aucune', 'Ninguna'],
  ['Effacer le filtre', 'Borrar filtro'], ['Appliquer', 'Aplicar'], ['Du', 'Desde'], ['Au', 'Hasta'],
  ['Utilisateur', 'Usuario'], ['Organisation', 'Organización'], ['Statut', 'Estado'], ['Actions', 'Acciones'],
  ['Montant', 'Importe'], ['Client', 'Cliente'], ['Libellé', 'Etiqueta'], ['Adresse', 'Dirección'],
  ['Pays', 'País'], ['Par défaut', 'Predeterminado'], ['Fournisseur', 'Proveedor'], ['Méthode', 'Método'],
  ['Rôle', 'Rol'], ['Qté', 'Cant.'], ['Prix unit.', 'Precio unit.'], ['Réservation', 'Reserva'],
  ['Employés', 'Empleados'], ['Ajouté le', 'Añadido el'], ['Chargement…', 'Cargando…'],
  ['Expirée', 'Expirada'], ['Session', 'Sesión'], ['Créée le', 'Creada el'], ['Expire le', 'Expira el'],
  ['E-mail', 'Correo'], ['Mot de passe', 'Contraseña'], ['Prénom', 'Nombre'], ['Nom', 'Apellido'],
  ['Téléphone', 'Teléfono'], ['Enregistrer', 'Guardar'], ['Profil', 'Perfil'], ['Adresses', 'Direcciones'],
  ['Sessions', 'Sesiones'], ['Rôles', 'Roles'], ['Utilisateurs', 'Usuarios'], ['Actifs', 'Activos'],
  ['Suspendus', 'Suspendidos'], ['Employés', 'Empleados'], ['Global', 'Global'], ['Propriété', 'Propiedad'],
  ['Agence', 'Agencia'], ['Brouillon', 'Borrador'], ['Confirmée', 'Confirmada'], ['Annulée', 'Cancelada'],
  ['Remboursée', 'Reembolsada'], ['Chambre', 'Habitación'], ['Vol', 'Vuelo'], ['Véhicule', 'Vehículo'],
  ['Cabine', 'Camarote'], ['Activité', 'Actividad'], ['Forfait', 'Paquete'], ['Paiements', 'Pagos'],
  ['Réussi', 'Exitoso'], ['Échoué', 'Fallido'], ['Remboursé', 'Reembolsado'], ['En attente', 'Pendiente'],
  ['Historique', 'Historial'], ['Lignes', 'Líneas'], ['Espèces', 'Efectivo'], ['Transactions', 'Transacciones'],
  ['Promotions', 'Promociones'], ['Résumé', 'Resumen'], ['Partiel', 'Parcial'], ['Aperçu', 'Vista previa'],
  ['Motif', 'Motivo'], ['Revenus', 'Ingresos'], ['Réussis', 'Exitosos'], ['Devise', 'Moneda'],
  ['Description', 'Descripción'], ['Contact', 'Contacto'], ['Configuration', 'Configuración'],
  ['Identité', 'Identidad'], ['Juridique', 'Legal'], ['Paramètres', 'Ajustes'], ['Infos', 'Info'],
  ['Annulation', 'Cancelación'], ['Retour', 'Volver'], ['Total', 'Total'], ['Date', 'Fecha'],
  ['Type', 'Tipo'], ['Slug', 'Slug'], ['Non renseigné', 'No especificado'],
  ['Hébergement', 'Alojamiento'], ['Hébergements', 'Alojamientos'], ['Chambre', 'Habitación'],
  ['Chambres', 'Habitaciones'], ['Équipement', 'Equipamiento'], ['Équipements', 'Equipamientos'],
  ['Vols', 'Vuelos'], ['Compagnie', 'Aerolínea'], ['Compagnies', 'Aerolíneas'],
  ['Aéroport', 'Aeropuerto'], ['Aéroports', 'Aeropuertos'], ['Navire', 'Barco'], ['Navires', 'Barcos'],
  ['Croisière', 'Crucero'], ['Départ', 'Salida'], ['Départs', 'Salidas'],
  ['Itinéraire', 'Itinerario'], ['Itinéraires', 'Itinerarios'], ['Port', 'Puerto'], ['Ports', 'Puertos'],
  ['Escales', 'Escalas'], ['Cabine', 'Camarote'], ['Cabines', 'Camarotes'],
  ['Forfait', 'Paquete'], ['Forfaits', 'Paquetes'], ['Destination', 'Destino'],
  ['Destinations', 'Destinos'], ['Difficulté', 'Dificultad'], ['Durée', 'Duración'],
  ['Capacité', 'Capacidad'], ['Prix', 'Precio'], ['Remise', 'Descuento'], ['Titre', 'Título'],
  ['Créneau', 'Franja'], ['Créneaux', 'Franjas'], ['Fournisseur', 'Proveedor'],
  ['Fournisseurs', 'Proveedores'], ['Disponibilités', 'Disponibilidad'], ['Disponible', 'Disponible'],
  ['Loué', 'Alquilado'], ['Maintenance', 'Mantenimiento'], ['Facile', 'Fácil'], ['Modérée', 'Moderada'],
  ['Difficile', 'Difícil'], ['Expert', 'Experto'], ['Économique', 'Económica'], ['Affaires', 'Ejecutiva'],
  ['Première', 'Primera'], ['Hôtel', 'Hotel'], ['Appartement', 'Apartamento'], ['Villa', 'Villa'],
  ['Auberge', 'Albergue'], ['Autre', 'Otro'], ['Inactif', 'Inactivo'],
]);

function translateString(str, locale) {
  if (locale === 'fr') return str;
  const replacements = locale === 'en' ? enReplacements : esReplacements;
  let out = str;
  for (const [from, to] of replacements) {
    out = out.split(from).join(to);
  }
  const wordMap = locale === 'en' ? wordEn : wordEs;
  for (const [from, to] of wordMap) {
    out = out.split(from).join(to);
  }
  if (locale === 'en') {
    out = out
      .replace(/Rechercher par e-mail ou nom…/g, 'Search by email or name…')
      .replace(/Rechercher par e-mail ou nom/g, 'Search by email or name')
      .replace(/Rechercher par nom ou slug…/g, 'Search by name or slug…')
      .replace(/Rechercher par nom ou slug/g, 'Search by name or slug')
      .replace(/Nouvel utilisateur/g, 'New user')
      .replace(/Aucun utilisateur pour le moment\./g, 'No users yet.')
      .replace(/Aucun utilisateur ne correspond à vos critères\./g, 'No users match your criteria.')
      .replace(/Liste des utilisateurs/g, 'User list')
      .replace(/Nouveau mot de passe \(optionnel\)/g, 'New password (optional)')
      .replace(/Minimum 8 caractères\./g, 'At least 8 characters.')
      .replace(/Laissez vide pour conserver le mot de passe actuel\./g, 'Leave blank to keep the current password.')
      .replace(/Langue préférée/g, 'Preferred language')
      .replace(/Code ISO à 2 lettres \(ex\. fr, en\)\./g, '2-letter ISO code (e.g. fr, en).')
      .replace(/Le mot de passe doit contenir au moins 8 caractères\./g, 'Password must be at least 8 characters.')
      .replace(/Le prénom est obligatoire\./g, 'First name is required.')
      .replace(/Le nom est obligatoire\./g, 'Last name is required.')
      .replace(/Sections du compte utilisateur/g, 'User account sections')
      .replace(/Moyens paiement/g, 'Payment methods')
      .replace(/Tous les utilisateurs/g, 'All users')
      .replace(/Comptes enregistrés/g, 'Registered accounts')
      .replace(/Comptes actifs/g, 'Active accounts')
      .replace(/Comptes suspendus/g, 'Suspended accounts')
      .replace(/Profils employés/g, 'Employee profiles')
      .replace(/En attente de paiement/g, 'Pending payment')
      .replace(/Accès refusé : permission payments\.read requise\./g, 'Access denied: payments.read permission required.');
  }
  if (locale === 'es') {
    out = out
      .replace(/Rechercher par e-mail ou nom…/g, 'Buscar por correo o nombre…')
      .replace(/Rechercher par e-mail ou nom/g, 'Buscar por correo o nombre')
      .replace(/Rechercher par nom ou slug…/g, 'Buscar por nombre o slug…')
      .replace(/Rechercher par nom ou slug/g, 'Buscar por nombre o slug')
      .replace(/Nouvel utilisateur/g, 'Nuevo usuario')
      .replace(/Aucun utilisateur pour le moment\./g, 'Ningún usuario por el momento.')
      .replace(/Aucun utilisateur ne correspond à vos critères\./g, 'Ningún usuario coincide con sus criterios.')
      .replace(/Liste des utilisateurs/g, 'Lista de usuarios')
      .replace(/Nouveau mot de passe \(optionnel\)/g, 'Nueva contraseña (opcional)')
      .replace(/Minimum 8 caractères\./g, 'Mínimo 8 caracteres.')
      .replace(/Laissez vide pour conserver le mot de passe actuel\./g, 'Deje vacío para conservar la contraseña actual.')
      .replace(/Langue préférée/g, 'Idioma preferido')
      .replace(/Code ISO à 2 lettres \(ex\. fr, en\)\./g, 'Código ISO de 2 letras (ej. fr, en).')
      .replace(/Le mot de passe doit contenir au moins 8 caractères\./g, 'La contraseña debe tener al menos 8 caracteres.')
      .replace(/Le prénom est obligatoire\./g, 'El nombre es obligatorio.')
      .replace(/Le nom est obligatoire\./g, 'El apellido es obligatorio.')
      .replace(/Sections du compte utilisateur/g, 'Secciones de la cuenta de usuario')
      .replace(/Moyens paiement/g, 'Métodos de pago')
      .replace(/Tous les utilisateurs/g, 'Todos los usuarios')
      .replace(/Comptes enregistrés/g, 'Cuentas registradas')
      .replace(/Comptes actifs/g, 'Cuentas activas')
      .replace(/Comptes suspendus/g, 'Cuentas suspendidas')
      .replace(/Profils employés/g, 'Perfiles de empleados')
      .replace(/En attente de paiement/g, 'Pago pendiente')
      .replace(/Accès refusé : permission payments\.read requise\./g, 'Acceso denegado: se requiere el permiso payments.read.');
  }
  return out;
}

function deepTranslate(obj, locale) {
  if (typeof obj === 'string') return translateString(obj, locale);
  if (Array.isArray(obj)) return obj.map((v) => deepTranslate(v, locale));
  const out = {};
  for (const [k, v] of Object.entries(obj)) out[k] = deepTranslate(v, locale);
  return out;
}

const modulesI18n = {
  fr,
  en: deepTranslate(fr, 'en'),
  es: deepTranslate(fr, 'es'),
};

const outPath = join(dirname(fileURLToPath(import.meta.url)), 'modules-i18n-data.mjs');
writeFileSync(
  outPath,
  `/** @type {Record<'fr' | 'en' | 'es', object>} */\nexport const modulesI18n = ${JSON.stringify(modulesI18n, null, 2)};\n`,
  'utf8',
);
console.log(`Wrote ${outPath}`);
