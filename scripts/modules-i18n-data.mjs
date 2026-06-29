/** @type {Record<'fr' | 'en' | 'es', object>} */
export const modulesI18n = {
  "fr": {
    "common": {
      "accountStatus": {
        "active": "Actif",
        "suspended": "Suspendu",
        "deleted": "Supprimé"
      },
      "boolean": {
        "yes": "Oui",
        "no": "Non"
      },
      "empty": {
        "dash": "—"
      },
      "filters": {
        "all": "Tous",
        "allFeminine": "Toutes",
        "none": "Aucune",
        "clear": "Effacer le filtre",
        "apply": "Appliquer",
        "dateFrom": "Du",
        "dateTo": "Au",
        "searchByEmailOrName": "Rechercher par e-mail ou nom…",
        "searchByEmailOrNameAria": "Rechercher par e-mail ou nom",
        "searchByNameOrSlug": "Rechercher par nom ou slug…",
        "searchByNameOrSlugAria": "Rechercher par nom ou slug"
      },
      "columns": {
        "user": "Utilisateur",
        "organization": "Organisation",
        "status": "Statut",
        "actions": "Actions",
        "date": "Date",
        "type": "Type",
        "amount": "Montant",
        "client": "Client",
        "label": "Libellé",
        "address": "Adresse",
        "country": "Pays",
        "default": "Par défaut",
        "provider": "Fournisseur",
        "method": "Méthode",
        "role": "Rôle",
        "quantityShort": "Qté",
        "unitPrice": "Prix unitaire",
        "dates": "Dates",
        "booking": "Réservation",
        "employees": "Employés",
        "end": "Fin",
        "addedAt": "Ajouté le",
        "slug": "Slug",
        "name": "Nom",
        "preview": "Aperçu",
        "url": "URL",
        "caption": "Légende",
        "sortOrder": "Ordre",
        "source": "Source",
        "price": "Prix",
        "basePrice": "Prix de base",
        "discount": "Remise",
        "total": "Total",
        "active": "Actif",
        "capacity": "Capacité",
        "duration": "Durée",
        "difficulty": "Difficulté",
        "rating": "Note",
        "iata": "IATA",
        "city": "Ville",
        "code": "Code",
        "route": "Trajet",
        "period": "Période",
        "start": "Début",
        "arrival": "Arrivée",
        "departure": "Départ",
        "nights": "Nuits",
        "year": "Année",
        "line": "Ligne",
        "ship": "Navire",
        "itinerary": "Itinéraire",
        "licensePlate": "Immatriculation",
        "pricePerDay": "Prix / jour",
        "exampleModel": "Modèle type",
        "reserved": "Réservés",
        "available": "Disponibles",
        "product": "Produit",
        "category": "Catégorie"
      },
      "pagination": {
        "session": "session",
        "address": "adresse",
        "paymentMethod": "moyen de paiement",
        "user": "utilisateur",
        "organization": "organisation",
        "booking": "réservation",
        "line": "ligne",
        "payment": "paiement",
        "property": "hébergement",
        "room": "chambre",
        "flight": "vol",
        "vehicle": "véhicule",
        "sailing": "départ",
        "destination": "destination",
        "package": "forfait",
        "provider": "fournisseur",
        "category": "catégorie",
        "agency": "agence",
        "airport": "aéroport",
        "airline": "compagnie",
        "ship": "navire",
        "itinerary": "itinéraire",
        "port": "port",
        "amenity": "équipement",
        "review": "avis",
        "ticket": "tickets",
        "loyaltyAccount": "comptes"
      },
      "loading": "Chargement…",
      "sessionStatus": {
        "active": "Active",
        "expired": "Expirée",
        "title": "Session"
      },
      "dates": {
        "createdAt": "Créée le",
        "expiresAt": "Expire le"
      },
      "select": {
        "choose": "Choisir…",
        "chooseDash": "— Choisir —",
        "chooseFeminine": "— Choisir —"
      },
      "back": {
        "toList": "← Retour à la liste"
      },
      "form": {
        "description": "Description",
        "currency": "Devise",
        "optional": "Optionnel",
        "priceCents": "Prix (centimes)",
        "basePriceCents": "Prix de base (centimes)",
        "dailyPriceCents": "Prix journalier (centimes)",
        "pricePerNightCents": "Prix/nuit (centimes)",
        "priceCentsShort": "Prix (centimes)",
        "durationMinutes": "Durée (minutes)",
        "durationMinutesOptional": "Durée (minutes, optionnel)",
        "durationNights": "Durée (nuits)",
        "durationDays": "Durée (jours)",
        "dateFrom": "Du",
        "dateTo": "Au",
        "latitude": "Latitude",
        "longitude": "Longitude",
        "externalUrlOptional": "URL externe (optionnel si upload)",
        "displayOrder": "Ordre d'affichage",
        "image": "Image",
        "chooseFile": "Choisir un fichier",
        "uploading": "Upload en cours…",
        "imageFormatHint": "JPEG, PNG ou WebP, max 5 Mo",
        "centsHint": "Ex. 8500 = 85,00",
        "urlPlaceholder": "https://..."
      },
      "validation": {
        "nameRequired": "Le nom est obligatoire.",
        "titleRequired": "Le titre est obligatoire.",
        "slugRequired": "Le slug est obligatoire.",
        "slugInvalid": "Slug invalide (minuscules, chiffres, tirets).",
        "slugInvalidLong": "Slug invalide : minuscules, chiffres et tirets uniquement (ex. kinshasa).",
        "destinationRequired": "La destination est obligatoire.",
        "providerRequired": "Le fournisseur est obligatoire.",
        "invalidPriceCents": "Prix invalide (centimes).",
        "invalidPrice": "Prix invalide.",
        "invalidCapacity": "Capacité invalide.",
        "invalidSeats": "Nombre de sièges invalide.",
        "invalidSeatsShort": "Sièges invalides.",
        "invalidStock": "Stock invalide.",
        "invalidDuration": "Durée invalide.",
        "invalidDurationMinutes": "Durée invalide (minutes).",
        "currencyThreeLetters": "Devise à 3 lettres.",
        "currencyThreeLettersExample": "Devise à 3 lettres (ex. USD).",
        "starRatingRange": "Note entre 0 et 5.",
        "countryCodeTwoLetters": "Le code pays doit comporter 2 lettres (ex. CD, KE).",
        "coordsBothRequired": "Renseignez latitude et longitude ensemble.",
        "latitudeInvalid": "Latitude invalide (−90 à 90).",
        "latitudeOutOfRange": "Latitude hors plage (-90 à 90).",
        "longitudeInvalid": "Longitude invalide (−180 à 180).",
        "longitudeOutOfRange": "Longitude hors plage (-180 à 180).",
        "imageFormat": "Format accepté : JPEG, PNG ou WebP.",
        "imageTooLarge": "Image trop lourde (max 5 Mo).",
        "sessionExpiredRetry": "Session expirée. Reconnectez-vous puis réessayez.",
        "urlRequired": "L'URL est obligatoire.",
        "uploadFailed": "Impossible d'uploader l'image locale.",
        "dateRangeInvalid": "La date de début doit être avant la date de fin.",
        "discountRange": "La remise doit être entre 0 et 100.",
        "durationDaysRange": "La durée doit être entre 1 et 365 jours.",
        "selectProduct": "Sélectionnez un produit.",
        "invalidCabinCount": "Nombre de cabines invalide.",
        "datesRequired": "Les dates de début et de fin sont obligatoires.",
        "iataAndNameRequired": "Code IATA (2 lettres) et nom sont obligatoires."
      },
      "toast": {
        "saved": "Enregistré",
        "saveError": "Erreur d'enregistrement",
        "deleteError": "Erreur de suppression",
        "availabilitySaved": "Disponibilité enregistrée",
        "availabilityDeleted": "Disponibilité supprimée",
        "amenitiesSavedTitle": "Équipements enregistrés",
        "amenitiesSavedMessage": "La sélection a été mise à jour.",
        "propertySavedTitle": "Hébergement enregistré",
        "deletedProperty": "L'hébergement « {name} » a été supprimé."
      },
      "availabilityCalendar": {
        "previousMonth": "Mois précédent",
        "nextMonth": "Mois suivant",
        "today": "Aujourd'hui",
        "weekdays": {
          "mon": "lun.",
          "tue": "mar.",
          "wed": "mer.",
          "thu": "jeu.",
          "fri": "ven.",
          "sat": "sam.",
          "sun": "dim."
        },
        "bulkSuccess": "{count} jour(s) mis à jour.",
        "stockUnits": "Stock (unités)",
        "availableSeats": "Sièges disponibles",
        "seatsAria": "Sièges {date}"
      },
      "imagesGallery": {
        "title": "Photos",
        "titleProperty": "Images",
        "titlePackage": "Galerie photos",
        "intro": "Gérez les photos de cet élément.",
        "introPackage": "Ajoutez des photos manuellement ou choisissez parmi les images des produits inclus.",
        "newPhoto": "Nouvelle photo",
        "editPhoto": "Modifier la photo",
        "addPhoto": "Ajouter une photo",
        "deleteConfirm": "Supprimer cette image ?",
        "emptyDefault": "Aucune photo.",
        "emptyRoom": "Aucune photo pour cette chambre.",
        "emptyProperty": "Aucune image.",
        "emptyPackage": "Aucune photo dans la galerie du forfait.",
        "sourceIncluded": "Produit inclus",
        "sourceManual": "Manuelle",
        "suggestionsTitle": "Suggestions depuis la composition",
        "suggestionsLoading": "Chargement des suggestions…",
        "suggestionsEmpty": "Aucune photo disponible dans les produits inclus. Ajoutez des produits au forfait ou uploadez une photo manuellement.",
        "alreadyAdded": "Ajoutée",
        "addFromSuggestion": "Ajouter"
      },
      "flightClass": {
        "economy": "Économique",
        "premium_economy": "Économique premium",
        "business": "Affaires",
        "first": "Première"
      },
      "packageItemType": {
        "property": "Hébergement",
        "flight": "Vol",
        "vehicle": "Véhicule",
        "cruise": "Cabine (croisière)",
        "activity": "Activité"
      },
      "activityDifficulty": {
        "unspecified": "— Non renseignée —",
        "easy": "Facile",
        "moderate": "Modérée",
        "hard": "Difficile",
        "expert": "Expert"
      },
      "vehicleAvailabilityStatus": {
        "available": "Disponible",
        "maintenance": "Maintenance",
        "rented": "Loué"
      },
      "vehicleSpecs": {
        "seats": "Places",
        "transmission": "Transmission",
        "fuel": "Carburant",
        "transmissionManual": "Manuelle",
        "transmissionAutomatic": "Automatique",
        "fuelPetrol": "Essence",
        "fuelDiesel": "Diesel",
        "fuelHybrid": "Hybride"
      },
      "packageStatus": {
        "active": "Actif",
        "inactive": "Inactif"
      },
      "seatsCount": "{count} sièges",
      "maxGuests": "{count} voyageurs max",
      "daysCount": "{count} jour",
      "daysCountPlural": "{count} jours",
      "productsCount": "{count} produit",
      "productsCountPlural": "{count} produits",
      "photosCount": "{count} photo",
      "photosCountPlural": "{count} photos",
      "rbacScope": {
        "scopeTypes": {
          "global": "Global",
          "property": "Propriété",
          "agency": "Agence",
          "support_queue": "File support"
        },
        "global": "Global",
        "property": "Établissement",
        "agency": "Agence",
        "support_queue": "File support",
        "withId": "{label} · {idPrefix}…"
      }
    },
    "users": {
      "list": {
        "newUser": "Nouvel utilisateur",
        "emptyDefault": "Aucun utilisateur pour le moment.",
        "emptyFiltered": "Aucun utilisateur ne correspond à vos critères.",
        "ariaLabel": "Liste des utilisateurs",
        "deleteConfirm": "Supprimer l'utilisateur « {email} » ? Cette action est réversible côté base."
      },
      "filters": {
        "status": "Statut",
        "organization": "Organisation",
        "role": "Rôle"
      },
      "form": {
        "email": "E-mail",
        "passwordCreate": "Mot de passe",
        "passwordEdit": "Nouveau mot de passe (optionnel)",
        "passwordHintCreate": "Minimum 8 caractères.",
        "passwordHintEdit": "Laissez vide pour conserver le mot de passe actuel.",
        "firstName": "Prénom",
        "lastName": "Nom",
        "phone": "Téléphone",
        "preferredLanguage": "Langue préférée",
        "preferredLanguageHint": "Code ISO à 2 lettres (ex. fr, en).",
        "organization": "Organisation",
        "organizationNone": "Aucune",
        "status": "Statut",
        "submitCreate": "Créer l'utilisateur",
        "submitEdit": "Enregistrer",
        "validation": {
          "emailRequired": "L'adresse e-mail est obligatoire.",
          "passwordMinLength": "Le mot de passe doit contenir au moins 8 caractères.",
          "firstNameRequired": "Le prénom est obligatoire.",
          "lastNameRequired": "Le nom est obligatoire."
        }
      },
      "detail": {
        "title": "Modifier l'utilisateur",
        "tabsAria": "Sections du compte utilisateur",
        "tabs": {
          "profile": "Profil",
          "addresses": "Adresses",
          "paymentMethods": "Moyens paiement",
          "sessions": "Sessions",
          "roles": "Rôles"
        }
      },
      "userIdFilter": {
        "label": "Utilisateur",
        "allUsers": "Tous les utilisateurs"
      },
      "addresses": {
        "emptyDefault": "Aucune adresse enregistrée.",
        "emptyFiltered": "Aucune adresse pour cet utilisateur.",
        "ariaLabel": "Liste des adresses utilisateur"
      },
      "paymentMethods": {
        "lastFourMasked": "•••• {lastFour}",
        "emptyDefault": "Aucun moyen de paiement enregistré.",
        "emptyFiltered": "Aucun moyen de paiement pour cet utilisateur.",
        "ariaLabel": "Liste des moyens de paiement"
      },
      "sessions": {
        "revokeConfirm": "Révoquer cette session ? L'utilisateur devra se reconnecter.",
        "emptyDefault": "Aucune session active.",
        "emptyFiltered": "Aucune session active pour cet utilisateur.",
        "ariaLabel": "Liste des sessions utilisateur"
      },
      "stats": {
        "total": {
          "label": "Utilisateurs",
          "subtitle": "Comptes enregistrés"
        },
        "active": {
          "label": "Actifs",
          "subtitle": "Comptes actifs"
        },
        "suspended": {
          "label": "Suspendus",
          "subtitle": "Comptes suspendus"
        },
        "employees": {
          "label": "Employés",
          "subtitle": "Profils employés"
        }
      },
      "roles": {
        "assignedTitle": "Rôles assignés",
        "empty": "Aucun rôle actif pour cet utilisateur.",
        "assignFormTitle": "Assigner un rôle",
        "user": "Utilisateur",
        "role": "Rôle",
        "selectPlaceholder": "Sélectionner…",
        "scope": "Périmètre (scope)",
        "scopeId": "ID du scope (UUID)",
        "scopeIdHint": "Ex. ID propriété, agence ou file support.",
        "expiresAt": "Expiration (optionnel)",
        "superAdminWarning": "Réservé aux super administrateurs — périmètre forcé à Global.",
        "superAdminConfirm": "Attribuer le rôle « {roleName} » ? Cet utilisateur obtiendra un accès complet à la plateforme.",
        "validation": {
          "userAndRoleRequired": "Utilisateur et rôle sont obligatoires.",
          "scopeIdRequired": "L'identifiant de scope est obligatoire pour ce périmètre."
        },
        "scopeTypes": {
          "global": "Global",
          "property": "Propriété",
          "agency": "Agence",
          "support_queue": "File support"
        },
        "scopeDisplay": {
          "global": "Global",
          "property": "Établissement",
          "agency": "Agence",
          "support_queue": "File support",
          "withId": "{label} · {idPrefix}…"
        },
        "revokeDialog": {
          "title": "Révoquer le rôle",
          "description": "Retirer ce rôle pour cet utilisateur ?"
        },
        "toast": {
          "revokedTitle": "Rôle révoqué",
          "revokedMessage": "L'assignation a été retirée.",
          "revokeFailedTitle": "Échec de la révocation"
        }
      }
    },
    "organizations": {
      "list": {
        "emptyTitleSearch": "Aucune organisation ne correspond à votre recherche",
        "emptyTitleDefault": "Aucune organisation pour le moment",
        "emptyDescriptionSearch": "Essayez un autre nom ou slug.",
        "emptyDescriptionDefault": "Créez une organisation partenaire pour commencer.",
        "emptyTableSearch": "Aucune organisation ne correspond à votre recherche.",
        "emptyTableDefault": "Aucune organisation pour le moment.",
        "ariaLabel": "Liste des organisations",
        "columns": {
          "type": "Type"
        },
        "deleteDialog": {
          "title": "Supprimer l'organisation",
          "description": "Supprimer l'organisation « {name} » ? Cette action est réversible côté base."
        }
      },
      "form": {
        "sections": {
          "identity": "Identité",
          "contact": "Contact",
          "legal": "Juridique",
          "configuration": "Configuration"
        },
        "name": "Nom",
        "slug": "Slug",
        "slugHint": "Identifiant unique dans l'URL (ex. africa-tourism-gate).",
        "description": "Description",
        "website": "Site web",
        "websitePlaceholder": "https://",
        "contactEmail": "E-mail de contact",
        "contactPhone": "Téléphone",
        "legalForm": "Forme juridique",
        "rccm": "RCCM",
        "rccmHint": "Registre du Commerce et du Crédit Mobilier",
        "idNat": "ID. Nat.",
        "idNatHint": "Identification Nationale",
        "nif": "NIF",
        "nifHint": "Numéro d'Identification Fiscale",
        "cnss": "CNSS",
        "cnssHint": "Caisse Nationale de Sécurité Sociale",
        "currency": "Devise",
        "status": "Statut",
        "submitCreate": "Créer l'organisation",
        "submitEdit": "Enregistrer",
        "validation": {
          "nameRequired": "Le nom est obligatoire.",
          "slugRequired": "Le slug est obligatoire.",
          "slugInvalid": "Slug invalide : minuscules, chiffres et tirets uniquement (ex. mon-organisation).",
          "currencyInvalid": "La devise doit comporter 3 lettres (ex. USD, CDF)."
        },
        "toast": {
          "savedTitle": "Organisation enregistrée",
          "errorTitle": "Erreur d'enregistrement"
        }
      },
      "legalForm": {
        "unspecified": "Non renseigné",
        "SARL": "SARL",
        "SA": "SA",
        "SAS": "SAS",
        "Ets": "Établissement (Ets)",
        "SNC": "SNC",
        "ASBL": "ASBL"
      },
      "detail": {
        "title": "Organisation",
        "tabsAria": "Sections de l'organisation",
        "tabs": {
          "infos": "Infos",
          "users": "Utilisateurs",
          "settings": "Paramètres"
        },
        "settingsIntro": "Configuration de l'organisation : coordonnées, locale, réservation et branding."
      },
      "selector": {
        "defaultLabel": "Organisation"
      }
    },
    "bookings": {
      "status": {
        "draft": "Brouillon",
        "pending_payment": "En attente de paiement",
        "confirmed": "Confirmée",
        "cancelled": "Annulée",
        "refunded": "Remboursée"
      },
      "itemTypes": {
        "room": "Chambre",
        "flight_class": "Vol",
        "vehicle": "Véhicule",
        "cabin": "Cabine",
        "activity_schedule": "Activité",
        "package": "Forfait"
      },
      "catalogLink": {
        "referencePrefix": "Réf. {idPrefix}",
        "ariaLabel": "Voir {typeLabel} : {title}"
      },
      "list": {
        "emptyDefault": "Aucune réservation pour le moment.",
        "emptyFiltered": "Aucune réservation ne correspond à vos critères.",
        "ariaLabel": "Liste des réservations",
        "filters": {
          "client": "Client"
        }
      },
      "itemsList": {
        "filters": {
          "type": "Type",
          "bookingStatus": "Statut réservation",
          "bookingId": "ID réservation",
          "bookingIdPlaceholder": "UUID complet"
        },
        "emptyDefault": "Aucune ligne de réservation pour le moment.",
        "emptyFiltered": "Aucune ligne ne correspond à vos critères.",
        "ariaLabel": "Lignes de réservation"
      },
      "detail": {
        "title": "Réservation",
        "backLink": "Retour aux réservations",
        "reference": "Réf. {idPrefix}",
        "sections": {
          "client": "Client",
          "status": "Statut",
          "actions": "Actions",
          "bookingLines": "Lignes de réservation",
          "payments": "Paiements"
        },
        "clientFields": {
          "email": "E-mail",
          "name": "Nom",
          "organization": "Organisation",
          "total": "Total",
          "createdAt": "Créée le"
        },
        "actions": {
          "changeStatus": "Changer le statut",
          "statusReason": "Motif (historique)",
          "statusReasonPlaceholder": "Ex. confirmation manuelle, remboursement…",
          "applyStatus": "Appliquer le statut",
          "cancellation": "Annulation",
          "cancelReason": "Motif d'annulation",
          "cancelReasonPlaceholder": "Ex. demande client, indisponibilité…",
          "cancelBooking": "Annuler la réservation",
          "readOnly": "Modification réservée aux comptes avec la permission bookings.write."
        },
        "linesEmpty": "Aucune ligne.",
        "linesAriaLabel": "Lignes de réservation",
        "paymentsEmpty": "Aucun paiement enregistré pour cette réservation.",
        "paymentsAriaLabel": "Paiements",
        "statusDialog": {
          "title": "Confirmer le changement de statut",
          "description": "Passer la réservation de « {fromStatus} » à « {toStatus} » ?{reasonSuffix}",
          "reasonSuffix": " Motif : {reason}"
        },
        "cancelDialog": {
          "title": "Annuler la réservation",
          "description": "Annuler cette réservation ? Le stock des produits sera libéré (moteur de réservation).",
          "confirm": "Annuler la réservation",
          "cancel": "Retour"
        },
        "paymentStatus": {
          "pending": "En attente",
          "succeeded": "Réussi",
          "failed": "Échoué",
          "refunded": "Remboursé"
        }
      },
      "timeline": {
        "progressAria": "Progression du statut de réservation",
        "finalStatus": "Statut final",
        "history": "Historique",
        "historyAria": "Historique des changements de statut",
        "historyEmpty": "Aucun changement de statut enregistré.",
        "transition": "{fromStatus} → {toStatus}"
      },
      "stats": {
        "bookings": {
          "total": {
            "label": "Réservations",
            "subtitle": "Toutes les réservations"
          },
          "confirmed": {
            "label": "Confirmées",
            "subtitle": "Réservations confirmées"
          },
          "pending_payment": {
            "label": "En attente",
            "subtitle": "Paiement en attente"
          },
          "lines": {
            "label": "Lignes",
            "subtitle": "Articles réservés"
          }
        },
        "items": {
          "total": {
            "label": "Lignes",
            "subtitle": "Toutes les lignes"
          },
          "confirmed": {
            "label": "Confirmées",
            "subtitle": "Lignes de réservations confirmées"
          },
          "pending_payment": {
            "label": "En attente",
            "subtitle": "Lignes en attente de paiement"
          },
          "bookings": {
            "label": "Réservations",
            "subtitle": "Voir toutes les réservations"
          }
        }
      }
    },
    "payments": {
      "status": {
        "pending": "En attente",
        "succeeded": "Réussi",
        "failed": "Échoué",
        "refunded": "Remboursé"
      },
      "providers": {
        "stripe": "Stripe",
        "cash": "Espèces"
      },
      "refundLabels": {
        "partial": "Remboursement partiel",
        "full": "Remboursement total",
        "generic": "Remboursement"
      },
      "subnav": {
        "ariaLabel": "Navigation paiements et promotions",
        "transactions": "Transactions",
        "promoCodes": "Codes promo",
        "promotions": "Promotions"
      },
      "list": {
        "emptyDefault": "Aucun paiement pour le moment.",
        "emptyFiltered": "Aucun paiement ne correspond à vos critères.",
        "ariaLabel": "Liste des paiements",
        "accessDenied": "Accès refusé : permission payments.read requise.",
        "notFoundError": "Paiement introuvable.",
        "toast": {
          "refundSuccessTitle": "Remboursement effectué",
          "refundSuccessMessage": "{amount} remboursé avec succès."
        }
      },
      "detail": {
        "title": "Détail du paiement",
        "sections": {
          "summary": "Résumé",
          "stripeIds": "Identifiants Stripe",
          "booking": "Réservation",
          "refundHistory": "Historique des remboursements"
        },
        "fields": {
          "amount": "Montant",
          "status": "Statut",
          "method": "Méthode",
          "date": "Date",
          "client": "Client",
          "stripePaymentIntent": "Payment Intent Stripe",
          "internalPaymentId": "ID paiement (interne)",
          "viewBooking": "Voir la réservation",
          "stripeStatus": "Stripe : {status}"
        },
        "refundHistoryEmpty": "Aucun remboursement enregistré.",
        "cancelBookingFirst": "Remboursement Stripe : annulez d'abord la réservation."
      },
      "refundModal": {
        "title": "Confirmer le remboursement",
        "description": "Remboursement Stripe — maximum remboursable : {maxAmount}.",
        "refundTypeLegend": "Type de remboursement",
        "refundTypeTotal": "Total ({amount})",
        "refundTypePartial": "Partiel",
        "partialAmountLabel": "Montant partiel ({currency})",
        "partialAmountPlaceholder": "Ex. 10,00",
        "partialAmountHint": "Maximum : {maxAmount}",
        "reasonLabel": "Raison du remboursement",
        "reasonPlaceholder": "Ex. Annulation client, erreur de facturation…",
        "reasonHint": "Minimum {minLength} caractères (usage interne, non envoyé à Stripe).",
        "preview": "Aperçu",
        "previewRefunded": "Montant remboursé",
        "previewRemaining": "Reste remboursable",
        "previewReason": "Motif",
        "confirm": "Confirmer le remboursement",
        "validation": {
          "reasonMinLength": "La raison doit contenir au moins {minLength} caractères.",
          "noRefundableAmount": "Aucun montant remboursable restant.",
          "partialAmountRequired": "Indiquez un montant partiel.",
          "partialAmountInvalid": "Montant partiel invalide.",
          "partialAmountExceeds": "Le montant ne peut pas dépasser {maxAmount}."
        }
      },
      "stats": {
        "total": {
          "label": "Transactions",
          "subtitle": "Tous les paiements"
        },
        "succeeded": {
          "label": "Réussis",
          "subtitle": "Paiements encaissés"
        },
        "pending": {
          "label": "En attente",
          "subtitle": "Paiements pending"
        },
        "revenue": {
          "label": "Revenus",
          "subtitle": "Total paiements réussis"
        }
      }
    },
    "properties": {
      "list": {
        "newProperty": "Nouvel hébergement",
        "amenitiesLink": "Équipements",
        "emptyDefault": "Aucun hébergement pour le moment.",
        "ariaLabel": "Liste des hébergements",
        "searchPlaceholder": "Rechercher par nom ou slug…",
        "searchAria": "Rechercher un hébergement"
      },
      "filters": {
        "destination": "Destination"
      },
      "columns": {
        "property": "Hébergement",
        "destination": "Destination",
        "propertyType": "Type"
      },
      "dialogs": {
        "deleteTitle": "Supprimer l'hébergement",
        "deleteDescription": "Supprimer l'hébergement « {name} » ? Cette action est irréversible."
      },
      "form": {
        "submitCreate": "Créer l'hébergement",
        "sections": {
          "identity": "Identité",
          "location": "Localisation",
          "classification": "Classification"
        },
        "name": "Nom",
        "slug": "Slug",
        "type": "Type",
        "destination": "Destination",
        "address": "Adresse",
        "starRating": "Classement (étoiles)",
        "starRatingHint": "Optionnel, 0 à 5",
        "validation": {
          "destinationRequired": "La destination est obligatoire."
        }
      },
      "status": {
        "propertyType": {
          "hotel": "Hôtel",
          "resort": "Resort",
          "apartment": "Appartement",
          "villa": "Villa",
          "hostel": "Auberge",
          "other": "Autre"
        }
      },
      "detail": {
        "title": "Modifier l'hébergement",
        "backToList": "← Retour à la liste",
        "tabsAria": "Sections de l'hébergement",
        "tabs": {
          "infos": "Infos",
          "rooms": "Chambres",
          "amenities": "Équipements",
          "availability": "Disponibilités"
        }
      },
      "sections": {
        "rooms": {
          "title": "Chambres",
          "intro": "Types de chambres pour cet hébergement.",
          "addRoom": "Ajouter une chambre",
          "newRoom": "Nouvelle chambre",
          "editRoom": "Modifier la chambre",
          "roomType": "Type de chambre",
          "roomTypePlaceholder": "standard, suite…",
          "maxCapacity": "Capacité max.",
          "bedConfig": "Configuration lits",
          "empty": "Aucune chambre.",
          "deleteConfirm": "Supprimer la chambre « {name} » ?",
          "photosAction": "Photos"
        },
        "amenities": {
          "title": "Équipements",
          "intro": "Sélectionnez les équipements disponibles pour cet hébergement.",
          "saveSelection": "Enregistrer la sélection",
          "emptyGlobal": "Aucun équipement global.",
          "createLink": "Créer des équipements"
        },
        "availability": {
          "title": "Disponibilités",
          "loadingRooms": "Chargement des chambres…",
          "room": "Chambre",
          "stockHint": "Stock et prix par nuit ({currency}).",
          "noRooms": "Aucune chambre pour cet hébergement. Créez une chambre pour gérer les disponibilités.",
          "goToRoomsTab": "Aller à l'onglet Chambres",
          "roomMismatch": "Cette chambre n'appartient pas à cet hébergement."
        }
      },
      "amenitiesList": {
        "newAmenity": "Nouvel équipement",
        "empty": "Aucun équipement.",
        "searchPlaceholder": "Rechercher un équipement…",
        "deleteConfirm": "Supprimer l'équipement « {name} » ?",
        "ariaLabel": "Liste des équipements"
      },
      "stats": {
        "properties": {
          "label": "Hébergements",
          "subtitle": "Propriétés publiées"
        },
        "rooms": {
          "label": "Chambres",
          "subtitle": "Types de chambres"
        },
        "amenities": {
          "label": "Équipements",
          "subtitle": "Référentiel global"
        },
        "destinations": {
          "label": "Destinations",
          "subtitle": "Zones géographiques"
        }
      }
    },
    "flights": {
      "list": {
        "newFlight": "Nouveau vol",
        "emptyDefault": "Aucun vol pour le moment.",
        "emptySearch": "Aucun vol ne correspond à ce code.",
        "searchPlaceholder": "Rechercher par code vol (ex. ET302)…",
        "searchAria": "Rechercher un vol",
        "deleteConfirm": "Supprimer le vol « {flightNumber} » ?"
      },
      "columns": {
        "flightNumber": "Code vol",
        "airline": "Compagnie",
        "route": "Trajet",
        "departure": "Départ"
      },
      "form": {
        "submitCreate": "Créer le vol",
        "airline": "Compagnie",
        "flightNumber": "Code vol",
        "flightNumberHint": "Ex. ET302, 9S101",
        "departure": "Départ",
        "arrival": "Arrivée",
        "departureTime": "Heure de départ",
        "arrivalTime": "Heure d'arrivée",
        "durationMinutes": "Durée (minutes)",
        "durationHint": "Ex. 390 pour 6 h 30",
        "validation": {
          "airlineRequired": "Compagnie obligatoire.",
          "flightNumberRequired": "Code vol obligatoire.",
          "departureAirportRequired": "Aéroport de départ obligatoire.",
          "arrivalAirportRequired": "Aéroport d'arrivée obligatoire.",
          "airportsMustDiffer": "Le départ et l'arrivée doivent être différents.",
          "departureTimeRequired": "Heure de départ obligatoire.",
          "arrivalTimeRequired": "Heure d'arrivée obligatoire."
        }
      },
      "detail": {
        "title": "Modifier le vol",
        "backLink": "Retour aux vols",
        "tabsAria": "Sections du vol",
        "tabs": {
          "flight": "Vol",
          "classes": "Classes"
        },
        "timelineAria": "Trajet du vol",
        "durationAria": "Durée du vol : {label}"
      },
      "sections": {
        "classes": {
          "title": "Classes cabine",
          "intro": "Cabines et tarifs de base pour ce vol.",
          "addClass": "Ajouter une classe",
          "newClass": "Nouvelle classe",
          "editClass": "Modifier la classe",
          "cabinType": "Type de cabine",
          "totalSeats": "Sièges totaux",
          "empty": "Aucune classe cabine.",
          "deleteConfirm": "Supprimer cette classe ?"
        },
        "availability": {
          "title": "Disponibilités",
          "backToFlight": "Retour au vol",
          "classMismatch": "Cette classe n'appartient pas à ce vol."
        }
      },
      "referential": {
        "airlines": {
          "new": "Nouvelle compagnie",
          "edit": "Modifier la compagnie",
          "emptyDefault": "Aucune compagnie.",
          "emptySearch": "Aucune compagnie ne correspond à cette recherche.",
          "searchPlaceholder": "Rechercher par code IATA ou nom…",
          "searchAria": "Rechercher une compagnie",
          "iataCode": "Code IATA",
          "deleteConfirm": "Supprimer « {name} » ?"
        },
        "airports": {
          "new": "Nouvel aéroport",
          "edit": "Modifier l'aéroport",
          "emptyDefault": "Aucun aéroport.",
          "emptySearch": "Aucun aéroport ne correspond à cette recherche.",
          "searchPlaceholder": "Rechercher par IATA, nom ou ville…",
          "searchAria": "Rechercher un aéroport",
          "airport": "Aéroport",
          "countryCode": "Code pays"
        }
      },
      "stats": {
        "flights": {
          "label": "Vols",
          "subtitle": "Lignes catalogue"
        },
        "classes": {
          "label": "Classes cabine",
          "subtitle": "Tarifs par vol"
        },
        "airlines": {
          "label": "Compagnies",
          "subtitle": "Référentiel IATA"
        },
        "airports": {
          "label": "Aéroports",
          "subtitle": "Référentiel mondial"
        }
      }
    },
    "locations": {
      "list": {
        "newVehicle": "Nouveau véhicule",
        "emptyDefault": "Aucun véhicule pour le moment.",
        "emptyFiltered": "Aucun véhicule ne correspond aux filtres.",
        "searchPlaceholder": "Rechercher par plaque…",
        "deleteConfirm": "Supprimer le véhicule « {label} » ?",
        "fallbackLabel": "Véhicule"
      },
      "filters": {
        "agency": "Agence",
        "allAgencies": "Toutes les agences"
      },
      "columns": {
        "agency": "Agence",
        "category": "Catégorie",
        "licensePlate": "Immatriculation",
        "pricePerDay": "Prix / jour"
      },
      "form": {
        "submitCreate": "Créer le véhicule",
        "rentalAgency": "Agence de location",
        "category": "Catégorie",
        "licensePlate": "Plaque d'immatriculation",
        "dailyPriceCents": "Prix journalier (centimes)",
        "validation": {
          "agencyRequired": "Agence obligatoire.",
          "categoryRequired": "Catégorie obligatoire."
        }
      },
      "detail": {
        "title": "Modifier le véhicule",
        "backLink": "Retour aux véhicules"
      },
      "sections": {
        "availability": {
          "title": "Disponibilités",
          "intro": "Créneaux de disponibilité par dates (location, maintenance, loué).",
          "addSlot": "Ajouter un créneau",
          "newSlot": "Nouveau créneau",
          "editSlot": "Modifier le créneau",
          "filterFrom": "Filtrer du",
          "filterTo": "au",
          "status": "Statut",
          "empty": "Aucun créneau sur cette période.",
          "deleteConfirm": "Supprimer ce créneau ?"
        }
      },
      "referential": {
        "categories": {
          "new": "Nouvelle catégorie",
          "edit": "Modifier la catégorie",
          "empty": "Aucune catégorie.",
          "searchPlaceholder": "Rechercher par nom ou modèle…",
          "exampleModel": "Modèle type"
        },
        "agencies": {
          "empty": "Aucune agence.",
          "searchPlaceholder": "Rechercher par nom ou adresse…",
          "agency": "Agence",
          "address": "Adresse"
        }
      },
      "stats": {
        "vehicles": {
          "label": "Véhicules",
          "subtitle": "Flotte catalogue"
        },
        "categories": {
          "label": "Catégories",
          "subtitle": "Types de véhicules"
        },
        "agencies": {
          "label": "Agences",
          "subtitle": "Points de location"
        }
      }
    },
    "cruises": {
      "list": {
        "newSailing": "Nouveau départ",
        "viewList": "Liste",
        "viewCalendar": "Calendrier",
        "emptySailings": "Aucun départ programmé.",
        "deleteSailingConfirm": "Supprimer le départ « {label} » ?",
        "fallbackDeparture": "Départ"
      },
      "columns": {
        "departure": "Départ",
        "itinerary": "Itinéraire",
        "ship": "Navire",
        "nights": "Nuits",
        "line": "Ligne",
        "year": "Année",
        "port": "Port"
      },
      "filters": {
        "line": "Filtrer par ligne",
        "searchShip": "Rechercher un navire…",
        "searchLine": "Rechercher une ligne…",
        "searchPort": "Rechercher par code ou nom…"
      },
      "form": {
        "ship": {
          "submitCreate": "Créer le navire",
          "line": "Ligne",
          "shipName": "Nom du navire",
          "builtYear": "Année de construction (optionnel)",
          "validation": "Ligne et nom du navire sont obligatoires."
        },
        "sailing": {
          "submitCreate": "Créer le départ",
          "itinerary": "Itinéraire",
          "departureDate": "Date de départ",
          "itineraryOption": "{name} ({shipName}) — {nights} nuits",
          "validation": "Itinéraire et date de départ sont obligatoires."
        },
        "itinerary": {
          "new": "Nouvel itinéraire",
          "edit": "Modifier l'itinéraire",
          "durationNights": "Durée (nuits)",
          "empty": "Aucun itinéraire.",
          "deleteConfirm": "Supprimer cet itinéraire ?",
          "validation": "Nom et durée (nuits) invalides."
        },
        "port": {
          "new": "Nouveau port de croisière",
          "edit": "Modifier le port",
          "countryIso": "Pays (ISO)",
          "empty": "Aucun port.",
          "deleteConfirm": "Supprimer le port « {name} » ?"
        },
        "line": {
          "new": "Nouvelle ligne de croisière",
          "edit": "Modifier la ligne",
          "empty": "Aucune ligne de croisière.",
          "deleteConfirm": "Supprimer la ligne « {name} » ?"
        },
        "cabin": {
          "new": "Nouvelle cabine",
          "edit": "Modifier la cabine",
          "category": "Catégorie",
          "maxGuests": "Voyageurs max",
          "empty": "Aucune cabine.",
          "deleteConfirm": "Supprimer cette cabine ?",
          "validationCategory": "Catégorie et capacité invalides.",
          "validationPrice": "Prix de base invalide."
        }
      },
      "detail": {
        "shipTitle": "Modifier le navire",
        "sailingTitle": "Modifier le départ",
        "backToShips": "← Retour aux navires",
        "escalesTitle": "Escales",
        "backToShip": "Retour au navire",
        "timelineAria": "Schéma des escales"
      },
      "sections": {
        "itineraryPorts": {
          "day": "Jour",
          "arrivalTime": "Heure d'arrivée (HH:MM)",
          "departureTime": "Heure de départ (HH:MM)",
          "arrivalPlaceholder": "08:00",
          "departurePlaceholder": "18:00",
          "empty": "Aucune escale.",
          "deleteConfirm": "Supprimer cette escale ?"
        },
        "cabinAvailability": {
          "title": "Cabines réservables",
          "intro": "Stock et prix par catégorie pour ce départ.",
          "stopsLabel": "Escales : ",
          "noStopsWarning": "Aucune escale sur cet itinéraire — ajoutez-en depuis la fiche navire.",
          "cabinMeta": "max {maxGuests} · base {basePrice}",
          "cabinsAvailableAria": "Cabines disponibles",
          "priceCentsAria": "Prix en centimes",
          "update": "Mettre à jour",
          "makeBookable": "Rendre réservable",
          "empty": "Aucune cabine sur ce navire. Ajoutez des cabines sur la fiche navire."
        }
      },
      "dialogs": {
        "deleteShip": "Supprimer le navire « {name} » ?"
      },
      "calendar": {
        "ariaLabel": "Calendrier des départs — {month}",
        "today": "Aujourd'hui"
      },
      "stats": {
        "sailings": {
          "label": "Départs",
          "subtitle": "Croisières programmées"
        },
        "ships": {
          "label": "Navires",
          "subtitle": "Flotte catalogue"
        },
        "lines": {
          "label": "Lignes",
          "subtitle": "Compagnies de croisière"
        },
        "ports": {
          "label": "Ports",
          "subtitle": "Escales référencées"
        }
      }
    },
    "activities": {
      "list": {
        "emptyDefault": "Aucune activité pour le moment.",
        "ariaLabel": "Liste des activités",
        "searchPlaceholder": "Rechercher par titre…",
        "deleteConfirm": "Supprimer l'activité « {title} » ?"
      },
      "columns": {
        "activity": "Activité",
        "provider": "Fournisseur",
        "price": "Prix",
        "duration": "Durée",
        "difficulty": "Difficulté"
      },
      "form": {
        "submitCreate": "Créer",
        "provider": "Fournisseur",
        "title": "Titre",
        "difficulty": "Difficulté",
        "priceCents": "Prix (centimes)"
      },
      "detail": {
        "title": "Modifier l'activité",
        "backLink": "Retour aux activités",
        "tabsAria": "Sections de l'activité",
        "tabs": {
          "activity": "Activité",
          "schedules": "Créneaux"
        }
      },
      "sections": {
        "schedules": {
          "title": "Créneaux",
          "addSlot": "Nouveau créneau",
          "editSlot": "Modifier le créneau",
          "dateTime": "Date et heure",
          "capacity": "Capacité",
          "empty": "Aucun créneau pour cette activité.",
          "deleteConfirm": "Supprimer ce créneau ?",
          "validationCapacity": "La capacité doit être au moins 1.",
          "viewList": "Liste",
          "viewTimeline": "Frise",
          "timelineAria": "Timeline des créneaux horaires",
          "fillAria": "Remplissage du créneau : {percent} %"
        }
      },
      "referential": {
        "providers": {
          "new": "Nouveau fournisseur",
          "edit": "Modifier le fournisseur",
          "empty": "Aucun fournisseur.",
          "searchPlaceholder": "Rechercher un fournisseur…",
          "ratingTitle": "Note moyenne (à venir)",
          "deleteConfirm": "Supprimer « {name} » ?",
          "validation": {
            "destinationRequired": "La destination est obligatoire."
          }
        }
      },
      "stats": {
        "activities": {
          "label": "Activités",
          "subtitle": "Expériences catalogue"
        },
        "providers": {
          "label": "Fournisseurs",
          "subtitle": "Opérateurs locaux"
        },
        "schedules": {
          "label": "Créneaux",
          "subtitle": "Horaires programmés"
        }
      }
    },
    "destinations": {
      "list": {
        "emptyDefault": "Aucune destination pour le moment.",
        "emptySearch": "Aucune destination ne correspond à votre recherche.",
        "searchPlaceholder": "Rechercher par nom, slug ou pays…",
        "searchAria": "Rechercher une destination",
        "ariaLabel": "Liste des destinations",
        "deleteConfirm": "Supprimer la destination « {name} » ? Les points d'intérêt associés seront également supprimés."
      },
      "columns": {
        "destination": "Destination",
        "country": "Pays"
      },
      "form": {
        "submitCreate": "Créer la destination",
        "previewName": "Nouvelle destination",
        "sections": {
          "identity": "Identité",
          "presentation": "Présentation",
          "geography": "Géographie"
        },
        "slugHint": "Identifiant unique (ex. kinshasa).",
        "countryCode": "Code pays (ISO)",
        "countryCodeHint": "2 lettres, ex. CD, KE, ZA.",
        "heroImageUrl": "URL image hero",
        "heroImageHint": "Affichée dans le bandeau. Laissez vide pour un dégradé.",
        "geographyIntro": "Coordonnées du centre de la destination pour la carte statique.",
        "latitudeHint": "Optionnel, -90 à 90",
        "longitudeHint": "Optionnel, -180 à 180",
        "mapPreview": "Aperçu carte"
      },
      "detail": {
        "title": "Modifier la destination",
        "backLink": "Retour aux destinations",
        "mapTitle": "Carte de la destination"
      },
      "sections": {
        "pois": {
          "new": "Nouveau point d'intérêt",
          "edit": "Modifier le point d'intérêt",
          "empty": "Aucun point d'intérêt pour cette destination.",
          "ariaLabel": "Points d'intérêt de la destination",
          "deleteConfirm": "Supprimer le point d'intérêt « {name} » ?"
        },
        "related": {
          "properties": {
            "label": "Hébergements",
            "subtitle": "Propriétés rattachées"
          },
          "activities": {
            "label": "Activités",
            "subtitle": "Expériences locales"
          },
          "packages": {
            "label": "Forfaits",
            "subtitle": "Packages incluant des produits locaux"
          }
        }
      },
      "stats": {
        "destinations": {
          "label": "Destinations",
          "subtitle": "Villes et régions catalogue"
        },
        "pois": {
          "label": "Points d'intérêt",
          "subtitle": "Lieux remarquables liés"
        },
        "countries": {
          "label": "Pays couverts",
          "subtitle": "Codes ISO distincts"
        }
      }
    },
    "packages": {
      "list": {
        "newPackage": "Nouveau forfait",
        "emptyDefault": "Aucun forfait pour le moment.",
        "searchPlaceholder": "Rechercher un forfait…",
        "deleteConfirm": "Supprimer le forfait « {name} » ?"
      },
      "columns": {
        "package": "Forfait",
        "discount": "Remise",
        "total": "Total",
        "active": "Actif"
      },
      "form": {
        "submitCreate": "Créer",
        "sections": {
          "identity": "Identité",
          "pricing": "Tarification",
          "publication": "Publication"
        },
        "packageName": "Nom du forfait",
        "descriptionPlaceholder": "Décrivez le forfait, les inclusions, les conditions…",
        "discountPercent": "Remise (%)",
        "durationDays": "Durée (jours)",
        "activeLabel": "Forfait actif"
      },
      "detail": {
        "editTitle": "Modifier le forfait",
        "viewTitle": "Voir le forfait",
        "backLink": "Retour aux forfaits",
        "viewButton": "Voir le forfait",
        "editButton": "Modifier le forfait",
        "notFound": "Forfait introuvable.",
        "invalidResponse": "Réponse forfait invalide.",
        "discountBadge": "Remise {percent}%",
        "description": "Description",
        "includedProducts": "Produits inclus",
        "includedProductsIntro": "{count} produit(s) dans ce forfait.",
        "photoGallery": "Galerie photos",
        "photoGalleryIntro": "{count} photo(s) associée(s) au forfait.",
        "noPhotos": "Aucune photo pour ce forfait.",
        "noIncludedProducts": "Aucun produit inclus."
      },
      "sections": {
        "items": {
          "title": "Items du forfait",
          "intro": "Produits combinés (hébergement, vol, activité, etc.).",
          "addItem": "Ajouter un item",
          "newItem": "Nouvel item",
          "empty": "Aucun item dans ce forfait.",
          "removeConfirm": "Retirer « {label} » du forfait ?",
          "flightLabel": "Vol {flightNumber}"
        },
        "composition": {
          "title": "Composition",
          "summary": "{productCount} produit(s) inclus",
          "summaryWithTypes": "{productCount} produit(s) inclus · {typeCount} types",
          "ariaLabel": "Composition du forfait"
        },
        "pricingRecap": {
          "title": "Récapitulatif tarifaire",
          "empty": "Ajoutez des items pour calculer le prix du forfait.",
          "separatePrice": "Prix séparé",
          "packagePrice": "Prix forfait",
          "separatePriceAria": "Prix des composants achetés séparément",
          "savings": "Économie de {amount} par rapport à l'achat séparé des composants."
        },
        "preview": {
          "ariaLabel": "Aperçu client du forfait",
          "header": "Aperçu client",
          "eyebrow": "Forfait",
          "includedCount": "{count} produit(s) inclus",
          "discountOnBundle": "Remise de {percent}% sur le bundle",
          "suggestedDuration": "Durée suggérée : {days} jour(s)",
          "packagePrice": "Prix forfait"
        }
      },
      "stats": {
        "packages": {
          "label": "Forfaits",
          "subtitle": "Packages combinés"
        },
        "active": {
          "label": "Forfaits actifs",
          "subtitle": "Publiés sur le catalogue"
        },
        "items": {
          "label": "Produits inclus",
          "subtitle": "Lignes de composition"
        },
        "photos": {
          "label": "Photos forfaits",
          "subtitle": "Galerie admin"
        }
      }
    },
    "rbac": {
      "subnav": {
        "ariaLabel": "Navigation RBAC",
        "roles": "Rôles",
        "permissions": "Permissions",
        "assignments": "Assignations",
        "audit": "Audit"
      },
      "unsavedChanges": {
        "title": "Modifications non enregistrées",
        "description": "Des changements n'ont pas été enregistrés. Quitter sans sauvegarder ?",
        "confirm": "Quitter sans enregistrer",
        "cancel": "Continuer l'édition"
      },
      "permissionDomains": {
        "amenities": "Équipements",
        "bookings": "Réservations",
        "cruises": "Croisières",
        "destinations": "Destinations",
        "employees": "Employés",
        "flights": "Vols",
        "loyalty": "Fidélité",
        "organizations": "Organisations",
        "payments": "Paiements",
        "permissions": "Permissions",
        "promo_codes": "Codes promo",
        "properties": "Hébergements",
        "promotions": "Promotions",
        "reviews": "Avis",
        "roles": "Rôles",
        "support": "Support",
        "users": "Utilisateurs",
        "vehicles": "Locations",
        "activities": "Activités",
        "packages": "Forfaits"
      },
      "permissionActions": {
        "read": "Lecture",
        "write": "Écriture",
        "delete": "Suppression",
        "manage": "Gestion",
        "approve": "Approbation"
      },
      "roles": {
        "searchPlaceholder": "Rechercher par code ou nom…",
        "empty": "Aucun rôle trouvé.",
        "ariaLabel": "Liste des rôles",
        "paginationItem": "rôle",
        "systemReadOnlyHint": "Rôle système (lecture seule)",
        "codeHint": "Minuscules, chiffres et underscore (ex. sales_manager).",
        "createSubmit": "Créer le rôle",
        "backToList": "← Retour aux rôles",
        "type": {
          "system": "Système",
          "custom": "Personnalisé"
        },
        "validation": {
          "codeRequired": "Le code est obligatoire.",
          "nameRequired": "Le nom est obligatoire."
        },
        "editTitle": {
          "system": "Rôle système",
          "custom": "Modifier le rôle"
        },
        "deleteDialog": {
          "title": "Supprimer le rôle",
          "description": "Supprimer définitivement le rôle « {name} » ?"
        },
        "toast": {
          "deletedTitle": "Rôle supprimé",
          "deletedMessage": "Le rôle « {name} » a été supprimé.",
          "deleteFailedTitle": "Échec de la suppression"
        }
      },
      "permissions": {
        "intro": "Catalogue des permissions (lecture seule). Modifiez les droits via la matrice sur chaque rôle.",
        "searchPlaceholder": "Rechercher…",
        "empty": "Aucune permission.",
        "paginationItem": "permission",
        "columns": {
          "resource": "Ressource"
        }
      },
      "matrix": {
        "title": "Matrice des permissions",
        "loading": "Chargement de la matrice…",
        "descriptionReadOnly": "Rôle système : consultation seule.",
        "descriptionEditable": "Cochez les permissions accordées à ce rôle, regroupées par domaine.",
        "columns": {
          "scope": "Périmètre"
        },
        "wholeDomain": "Tout le domaine",
        "perAction": "Par action",
        "ariaToggleDomain": "Tout {domain} — {action}",
        "toast": {
          "savedTitle": "Permissions enregistrées",
          "savedMessage": "La matrice du rôle a été mise à jour.",
          "saveFailedTitle": "Échec de l'enregistrement"
        }
      },
      "assignments": {
        "loading": "Chargement des assignations…",
        "empty": "Aucune assignation active.",
        "revoke": "Révoquer",
        "revokeDialog": {
          "title": "Révoquer l'assignation",
          "description": "Retirer ce rôle pour l'utilisateur sur ce périmètre ?"
        },
        "toast": {
          "revokedTitle": "Assignation révoquée",
          "revokedMessage": "Le rôle a été retiré pour cet utilisateur.",
          "revokeFailedTitle": "Échec de la révocation"
        }
      },
      "audit": {
        "checkingAccess": "Vérification des droits…",
        "accessDenied": "Cette page est réservée au super administrateur. Connectez-vous avec admin@africatourismgate.local ou un compte disposant du rôle super_admin.",
        "empty": "Aucun événement pour ces critères.",
        "paginationItem": "événement",
        "hideDetail": "Masquer le détail",
        "showDetailJson": "Voir le détail JSON",
        "actorFallback": "Acteur : {actorId}…",
        "targetLabel": "Cible",
        "ipLabel": "IP",
        "filters": {
          "eventType": "Type d'événement",
          "actorUser": "Utilisateur (acteur)"
        },
        "toast": {
          "loadFailedTitle": "Erreur de chargement"
        },
        "eventTypes": {
          "role_created": "Rôle créé",
          "role_updated": "Rôle modifié",
          "role_deleted": "Rôle supprimé",
          "permission_created": "Permission créée",
          "permission_updated": "Permission modifiée",
          "permission_deleted": "Permission supprimée",
          "role_permission_granted": "Permission accordée au rôle",
          "role_permission_revoked": "Permission retirée du rôle",
          "user_role_granted": "Rôle assigné",
          "user_role_revoked": "Rôle révoqué",
          "user_role_extended": "Assignation prolongée",
          "impersonation_started": "Impersonation démarrée",
          "impersonation_ended": "Impersonation terminée",
          "permission_denied": "Accès refusé"
        }
      }
    },
    "reviews": {
      "status": {
        "pending": "En attente",
        "approved": "Approuvé",
        "hidden": "Masqué"
      },
      "actions": {
        "approve": "Approuver",
        "hide": "Masquer",
        "delete": "Supprimer"
      },
      "toast": {
        "approved": {
          "title": "Avis approuvé",
          "message": "L'avis est visible côté client."
        },
        "hidden": {
          "title": "Avis masqué",
          "message": "L'avis n'est plus affiché publiquement."
        },
        "deleted": {
          "title": "Avis supprimé",
          "message": "L'avis a été retiré de la modération."
        }
      },
      "deleteDialog": {
        "title": "Supprimer cet avis",
        "description": "Suppression logique : l'avis ne sera plus visible dans la modération."
      },
      "detail": {
        "title": "Avis",
        "backLink": "Retour aux avis",
        "sections": {
          "context": "Contexte",
          "comment": "Commentaire"
        },
        "fields": {
          "author": "Auteur",
          "property": "Propriété",
          "entity": "Entité",
          "booking": "Réservation",
          "publishedAt": "Publié le"
        },
        "viewBooking": "Voir la réservation",
        "noComment": "Aucun commentaire.",
        "moderationActionsAria": "Actions de modération"
      },
      "list": {
        "columns": {
          "author": "Auteur",
          "property": "Propriété"
        },
        "filters": {
          "apply": "Appliquer les filtres"
        },
        "empty": {
          "default": {
            "title": "Aucun avis en attente",
            "description": "La file de modération est vide. Les nouveaux avis clients apparaîtront ici.",
            "tableMessage": "Aucun avis pour le moment."
          },
          "filtered": {
            "title": "Aucun avis ne correspond aux filtres",
            "description": "Modifiez les filtres ou affichez tous les statuts pour élargir la recherche.",
            "tableMessage": "Aucun avis ne correspond aux filtres."
          }
        },
        "ariaLabel": "Liste des avis à modérer"
      }
    },
    "support": {
      "status": {
        "open": "Ouvert",
        "pending": "En cours",
        "resolved": "Résolu",
        "closed": "Fermé"
      },
      "priority": {
        "low": "Basse",
        "normal": "Normale",
        "high": "Haute",
        "urgent": "Urgente"
      },
      "assignee": {
        "unassigned": "Non assigné"
      },
      "detail": {
        "title": "Ticket support",
        "backToList": "Retour à la liste",
        "openedOn": "Ouvert le {date}",
        "sections": {
          "client": "Client",
          "handling": "Traitement",
          "messages": "Messages",
          "reply": "Répondre au client"
        },
        "fields": {
          "priority": "Priorité",
          "agentMessage": "Message agent"
        },
        "advanceStatus": "Passer à « {status} »",
        "noMessages": "Aucun message.",
        "messageAuthor": {
          "staff": "Agent",
          "customer": "Client"
        },
        "replyPlaceholder": "Votre réponse au client…",
        "replyMinLength": "Le message doit contenir au moins 10 caractères.",
        "sending": "Envoi…",
        "sendReply": "Envoyer la réponse"
      },
      "list": {
        "filters": {
          "priority": "Priorité",
          "apply": "Appliquer les filtres"
        },
        "assignedLabel": "Assigné :",
        "empty": {
          "default": {
            "title": "Aucun ticket pour le moment",
            "description": "Les demandes d'assistance clients apparaîtront ici dès qu'elles seront créées."
          },
          "filtered": {
            "title": "Aucun ticket ne correspond aux filtres",
            "description": "Élargissez les critères de statut ou de priorité pour afficher plus de demandes."
          }
        },
        "ariaLabel": "Boîte de réception des tickets support"
      }
    },
    "loyalty": {
      "tiers": {
        "member": "Membre",
        "silver": "Silver",
        "gold": "Gold",
        "platinum": "Platinum"
      },
      "progress": {
        "ariaToward": "Progression vers {tier}",
        "ariaMaxReached": "Palier maximum atteint",
        "pointsBeforeTier": "{points} pts avant {tier}",
        "maxTier": "Palier maximum"
      },
      "stats": {
        "accounts": {
          "label": "Comptes fidélité",
          "subtitle": "Comptes OneKey actifs"
        },
        "points": {
          "label": "Points cumulés",
          "subtitle": "Sur les 100 premiers comptes"
        },
        "topBalance": {
          "label": "Meilleur solde",
          "emptySubtitle": "Aucun compte"
        }
      },
      "list": {
        "columns": {
          "program": "Programme",
          "balanceProgress": "Solde & progression",
          "tier": "Palier",
          "lastActivity": "Dernière activité"
        },
        "actions": {
          "history": "Historique"
        },
        "empty": {
          "title": "Aucun compte fidélité",
          "description": "Les comptes OneKey sont créés automatiquement lors des premiers paiements réussis. Ajustements manuels réservés au super administrateur.",
          "tableMessage": "Aucun compte fidélité pour le moment."
        },
        "ariaLabel": "Liste des comptes fidélité"
      },
      "adjust": {
        "deltaRequired": "Indiquez une variation entière non nulle (+ ou −).",
        "title": "Ajustement manuel des points",
        "currentBalance": "solde actuel",
        "fields": {
          "delta": "Variation (+ ou −)",
          "reason": "Motif (optionnel)"
        },
        "deltaPlaceholder": "Ex. 100 ou -50",
        "reasonPlaceholder": "Ex. geste commercial",
        "apply": "Appliquer"
      },
      "history": {
        "title": "Historique des transactions",
        "close": "Fermer",
        "currentBalance": "Solde actuel",
        "pointsUnit": "points",
        "apiUnavailable": "L'API d'historique des transactions n'est pas encore disponible. La structure ci-dessous anticipe le futur journal des mouvements de points.",
        "columns": {
          "delta": "Variation",
          "balanceAfter": "Solde après"
        },
        "transactionTypes": {
          "paymentCredit": "Crédit paiement",
          "manualAdjust": "Ajustement manuel"
        }
      }
    },
    "promotions": {
      "status": {
        "active": "Active",
        "inactive": "Inactive"
      },
      "validity": {
        "active": "En cours",
        "upcoming": "À venir",
        "expired": "Expiré",
        "noDateLimit": "Sans limite de dates",
        "fromDate": "À partir du {from}",
        "untilDate": "Jusqu'au {until}",
        "range": "{from} → {until}"
      },
      "discount": {
        "informative": "Campagne informative",
        "pending": "Réduction…",
        "percentFormat": "−{value} %",
        "fixedFormat": "−{value}"
      },
      "list": {
        "deleteConfirm": "Supprimer la promotion « {name} » ?",
        "columns": {
          "campaign": "Campagne",
          "validity": "Validité",
          "usage": "Utilisations",
          "status": "Statut"
        },
        "emptySearch": "Aucune promotion ne correspond à votre recherche.",
        "emptyDefault": "Aucune promotion pour le moment.",
        "searchPlaceholder": "Rechercher par titre ou description…",
        "searchAria": "Rechercher une promotion",
        "newButton": "Nouvelle promotion",
        "tableAria": "Liste des promotions",
        "paginationItem": "promotion"
      },
      "edit": {
        "pageTitle": "Modifier la promotion"
      },
      "preview": {
        "defaultName": "Nouvelle campagne",
        "ariaLabel": "Aperçu promotion {name}",
        "badge": "Promotion",
        "usage": "Utilisations : {usage}"
      },
      "form": {
        "info": {
          "codesVsPromotions": "Les codes promo sont saisis par le client au checkout. Les promotions sont des campagnes visibles (bannières, pages) — la réduction peut être optionnelle.",
          "managePromoCodesLink": "Gérer les codes promo",
          "targetHint": "Cible produit / destination (optionnel, pour affichage marketing)."
        },
        "validation": {
          "nameRequired": "Le titre est obligatoire.",
          "discountPositive": "La valeur doit être positive.",
          "percentMax": "Le pourcentage ne peut pas dépasser 100.",
          "endAfterStart": "La date de fin doit être après la date de début.",
          "maxRedemptionsInvalid": "Nombre max. invalide (entier ≥ 1)."
        },
        "fields": {
          "name": "Titre de la campagne",
          "descriptionPlaceholder": "Ex. −20 % sur les hébergements…",
          "hasDiscount": "Appliquer une réduction au checkout",
          "discountType": "Type de réduction",
          "discountTypePercent": "Pourcentage (%)",
          "discountTypeFixed": "Montant fixe",
          "discountValuePercent": "Pourcentage",
          "discountValueFixed": "Montant fixe",
          "validFromOptional": "Valide du (optionnel)",
          "validUntilOptional": "Valide au (optionnel)",
          "maxRedemptions": "Utilisations max.",
          "active": "Campagne active"
        },
        "hints": {
          "discountPercent": "Pourcentage (ex. 15 pour −15 %).",
          "discountFixed": "Montant fixe en unités monétaires (ex. 10 pour −10 USD).",
          "maxRedemptions": "Laisser vide pour illimité."
        },
        "usage": {
          "label": "Utilisations :",
          "unlimited": "(illimité)"
        },
        "checkoutId": "ID checkout :",
        "saving": "Enregistrement…",
        "createButton": "Créer la promotion",
        "saveButton": "Enregistrer",
        "cancelButton": "Annuler"
      }
    },
    "promoCodes": {
      "status": {
        "active": "Actif",
        "inactive": "Inactif"
      },
      "list": {
        "deleteConfirm": "Supprimer le code promo « {code} » ?",
        "columns": {
          "code": "Code",
          "discount": "Réduction",
          "validity": "Validité",
          "usage": "Utilisations",
          "status": "Statut"
        },
        "emptySearch": "Aucun code promo ne correspond à votre recherche.",
        "emptyDefault": "Aucun code promo pour le moment.",
        "searchPlaceholder": "Rechercher par code…",
        "searchAria": "Rechercher un code promo",
        "newButton": "Nouveau code promo",
        "tableAria": "Liste des codes promo",
        "paginationItem": "code promo"
      },
      "edit": {
        "pageTitle": "Modifier le code promo"
      },
      "form": {
        "validation": {
          "codeRequired": "Le code est obligatoire.",
          "codeFormat": "Lettres majuscules, chiffres, tirets et underscores uniquement.",
          "discountPositive": "La valeur doit être positive.",
          "percentMax": "Le pourcentage ne peut pas dépasser 100.",
          "validFromRequired": "Date de début obligatoire.",
          "validUntilRequired": "Date de fin obligatoire.",
          "endAfterStart": "La date de fin doit être après la date de début.",
          "maxRedemptionsInvalid": "Nombre d'utilisations max. invalide (entier ≥ 1)."
        },
        "fields": {
          "code": "Code",
          "discountType": "Type de réduction",
          "discountTypePercent": "Pourcentage (%)",
          "discountTypeFixed": "Montant fixe",
          "discountValuePercent": "Pourcentage",
          "discountValueFixed": "Montant fixe",
          "validFrom": "Valide du",
          "validUntil": "Valide au",
          "maxRedemptions": "Utilisations max.",
          "active": "Code actif (utilisable au checkout)"
        },
        "hints": {
          "code": "Saisi en majuscules ; comparé sans distinction de casse au checkout.",
          "discountPercent": "Pourcentage de réduction (ex. 20 pour −20 %).",
          "discountFixed": "Montant fixe en unités monétaires (ex. 10 pour −10 USD).",
          "maxRedemptions": "Laisser vide pour un nombre illimité."
        },
        "usage": {
          "recorded": "Utilisations enregistrées :",
          "unlimited": "(illimité)"
        },
        "saving": "Enregistrement…",
        "createButton": "Créer le code promo",
        "saveButton": "Enregistrer",
        "cancelButton": "Annuler"
      },
      "usage": {
        "format": "{count} / {max}",
        "unlimitedMax": "∞"
      }
    },
    "settings": {
      "nav": {
        "ariaLabel": "Navigation paramètres",
        "settings": "Paramètres",
        "emails": "E-mails",
        "bankAccounts": "Comptes bancaires"
      },
      "page": {
        "title": "Paramètres",
        "intro": "Configuration de l'organisation : coordonnées, locale, réservation et branding.",
        "denied": "Vous n'avez pas la permission de consulter les paramètres."
      },
      "unsaved": {
        "title": "Modifications non enregistrées",
        "description": "Des changements n'ont pas été enregistrés. Quitter sans sauvegarder ?",
        "confirm": "Quitter sans enregistrer",
        "cancel": "Continuer l'édition"
      },
      "form": {
        "loading": "Chargement…",
        "dirty": "Modifications non enregistrées",
        "clean": "Aucune modification en attente",
        "cancel": "Annuler",
        "saving": "Enregistrement…",
        "save": "Enregistrer",
        "upload": {
          "invalidImage": "Veuillez sélectionner une image valide.",
          "tooLarge": "Image trop lourde (max 2 MB)."
        },
        "validation": {
          "contactEmailInvalid": "L'e-mail de contact doit être valide.",
          "currencyInvalid": "La devise doit comporter 3 lettres (ex. USD, CDF).",
          "holdMinutesInvalid": "Durée de retenue invalide (entier positif).",
          "displayNameRequired": "Le nom affiché est obligatoire.",
          "loyaltyRateInvalid": "Le taux de points doit être un entier positif ou nul.",
          "programCodeInvalid": "Le code programme est obligatoire (32 caractères max)."
        },
        "sections": {
          "contact": {
            "title": "Coordonnées",
            "description": "Affichées dans le bandeau et le pied de page du site public.",
            "phone": "Téléphone",
            "email": "E-mail de contact",
            "location": "Adresse / localisation",
            "locationPlaceholder": "Kinshasa, RD Congo",
            "facebookUrl": "URL Facebook",
            "twitterUrl": "URL X / Twitter",
            "instagramUrl": "URL Instagram",
            "currency": "Devise"
          },
          "locale": {
            "title": "Locale",
            "language": "Langue",
            "timezone": "Fuseau horaire"
          },
          "booking": {
            "title": "Réservation",
            "holdMinutes": "Durée de retenue (minutes)",
            "allowGuestCheckout": "Autoriser la commande invité"
          },
          "loyalty": {
            "title": "Fidélité OneKey",
            "description": "Points crédités après paiement confirmé : floor(montant en centimes / 100) × taux ci-dessous.",
            "enabled": "Activer le crédit de points OneKey",
            "pointsPerMajorUnit": "Points par unité majeure de devise",
            "programCode": "Code programme"
          },
          "branding": {
            "title": "Branding",
            "displayName": "Nom affiché",
            "primaryColor": "Couleur primaire",
            "primaryColorHint": "Couleur dominante de l'interface (boutons, liens, accents).",
            "secondaryColor": "Couleur secondaire",
            "secondaryColorHint": "Couleur d'accompagnement (badges, éléments secondaires).",
            "logoUrl": "URL du logo",
            "uploading": "Upload en cours…",
            "chooseLogo": "Choisir un logo local",
            "logoFormatHint": "PNG/JPG/SVG/WebP, max 2 MB",
            "faviconUrl": "URL de l'icône (favicon)",
            "chooseFavicon": "Choisir une icône locale",
            "faviconFormatHint": "PNG/ICO/SVG, max 2 MB"
          },
          "authVisual": {
            "title": "Panneau connexion"
          }
        },
        "preview": {
          "title": "Preview live",
          "description": "Le rendu se met a jour instantanement, sans sauvegarde.",
          "logoAlt": "Logo organisation",
          "adminBadge": "Admin",
          "primaryButton": "Bouton principal"
        }
      },
      "colorPalette": {
        "contrastWarning": "Contraste insuffisant avec le texte blanc : {ratio} (minimum {min} pour WCAG AA). Les boutons et liens actifs peuvent être difficiles à lire.",
        "currentAria": "Couleur actuelle ({value})",
        "currentTitle": "Couleur enregistrée — {value}",
        "currentLabel": "Actuelle",
        "selection": "Sélection :",
        "swatches": {
          "atg-primary": "Vert ATG",
          "atg-primary-hover": "Vert foncé",
          "atg-primary-light": "Vert clair",
          "forest": "Forêt",
          "emerald": "Émeraude",
          "teal": "Sarcelle",
          "atg-secondary": "Secondaire ATG",
          "lime": "Lime",
          "gold": "Or",
          "amber": "Ambre",
          "sunset": "Coucher de soleil",
          "ocean": "Océan",
          "indigo": "Indigo",
          "slate": "Ardoise",
          "earth": "Terre",
          "burgundy": "Bordeaux"
        }
      },
      "authVisual": {
        "description": "Icônes décoratives affichées sur le panneau vert de connexion / inscription.",
        "reset": "Réinitialiser",
        "add": "Ajouter une icône",
        "empty": "Aucune icône configurée. Ajoutez-en une ou réinitialisez les valeurs par défaut.",
        "iconLabel": "Icône {n}",
        "remove": "Supprimer",
        "type": "Type",
        "position": "Position",
        "size": "Taille",
        "opacity": "Opacité ({n}%)",
        "imageUrl": "URL de l'image",
        "uploading": "Upload en cours…",
        "chooseImage": "Choisir une image locale",
        "preview": "Aperçu",
        "presets": {
          "pin": "Épingle (localisation)",
          "compass": "Boussole",
          "globe": "Globe",
          "star": "Étoile",
          "custom": "Image personnalisée"
        },
        "positions": {
          "bottom-right": "Bas droite",
          "top-right": "Haut droite",
          "bottom-left": "Bas gauche",
          "top-left": "Haut gauche"
        },
        "sizes": {
          "sm": "Petite",
          "md": "Moyenne",
          "lg": "Grande"
        }
      },
      "emails": {
        "page": {
          "title": "E-mails",
          "intro": "Personnalisez l'apparence des e-mails transactionnels (bienvenue, confirmation de réservation).",
          "denied": "Vous n'avez pas la permission de consulter les paramètres e-mail."
        },
        "form": {
          "validation": {
            "displayNameRequired": "Le nom affiché est obligatoire."
          },
          "success": "Paramètres e-mail enregistrés.",
          "upload": {
            "invalidImage": "Veuillez sélectionner une image valide.",
            "tooLarge": "Image trop lourde (max 2 MB).",
            "failed": "Échec de l'upload du logo. Réessayez."
          },
          "displayName": "Nom affiché",
          "logoUrl": "URL du logo",
          "chooseLogo": "Choisir un logo local",
          "logoFormatHint": "PNG/JPG/SVG/WebP, max 2 MB",
          "logoPreview": "Aperçu du logo",
          "primaryColor": "Couleur primaire",
          "primaryColorHint": "Couleur dominante des e-mails (en-têtes, boutons).",
          "secondaryColor": "Couleur secondaire",
          "secondaryColorHint": "Couleur d'accompagnement (optionnel).",
          "footerText": "Texte de pied de page",
          "footerPlaceholder": "© Africa Tourism Gate — Tous droits réservés",
          "welcomeSubject": "Sujet — e-mail de bienvenue",
          "welcomeSubjectPlaceholder": "Bienvenue chez {displayName}",
          "welcomeSubjectHint": "Variables : {displayName}",
          "bookingSubject": "Sujet — confirmation de réservation",
          "bookingSubjectPlaceholder": "Confirmation de réservation — {ref}",
          "bookingSubjectHint": "Variables : {ref}, {displayName}",
          "previewTemplate": "Modèle à prévisualiser",
          "templateWelcome": "Bienvenue (création de compte)",
          "templateBooking": "Confirmation de réservation",
          "previewing": "Prévisualisation…",
          "previewButton": "Prévisualiser",
          "save": "Enregistrer",
          "cancel": "Annuler",
          "saving": "Enregistrement…",
          "dirty": "Modifications non enregistrées",
          "clean": "Aucune modification en attente",
          "readOnlyHint": "Vous pouvez consulter ces paramètres mais pas les modifier (permission organization_settings.write requise)."
        },
        "preview": {
          "closeAria": "Fermer la prévisualisation",
          "title": "Prévisualisation",
          "subject": "Sujet :",
          "close": "Fermer",
          "iframeTitle": "Aperçu e-mail"
        }
      },
      "bankAccounts": {
        "page": {
          "title": "Comptes bancaires",
          "intro": "Comptes B2B de l'organisation pour les virements et paiements hors ligne.",
          "denied": "Vous n'avez pas la permission de consulter les comptes bancaires."
        },
        "list": {
          "deleteConfirm": "Supprimer ce compte bancaire ?",
          "columns": {
            "bank": "Banque",
            "account": "Compte",
            "accountNumber": "N° compte",
            "currency": "Devise",
            "isDefault": "Défaut"
          },
          "newButton": "Nouveau compte",
          "orgSelectAria": "Organisation",
          "empty": "Aucun compte bancaire."
        },
        "form": {
          "validation": {
            "bankNameRequired": "Le nom de la banque est obligatoire.",
            "accountNameRequired": "Le nom du compte est obligatoire.",
            "accountNumberRequired": "Le numéro de compte est obligatoire.",
            "accountNumberNoMask": "Saisissez le numéro complet (sans masque).",
            "currencyInvalid": "La devise doit comporter 3 lettres (ex. USD, CDF)."
          },
          "editTitle": "Modifier le compte",
          "createTitle": "Nouveau compte bancaire",
          "bankName": "Banque",
          "accountName": "Nom du compte",
          "accountNumberEdit": "Numéro de compte (laisser vide pour conserver)",
          "accountNumberCreate": "Numéro de compte / IBAN",
          "storedValue": "Valeur enregistrée: {masked}",
          "swiftBic": "SWIFT / BIC",
          "currency": "Devise",
          "isDefault": "Compte par défaut",
          "update": "Mettre à jour",
          "create": "Créer",
          "cancel": "Annuler",
          "save": "Enregistrer",
          "saving": "Enregistrement…",
          "dirty": "Modifications non enregistrées",
          "clean": "Aucune modification en attente"
        }
      }
    }
  },
  "en": {
    "common": {
      "accountStatus": {
        "active": "Active",
        "suspended": "Suspended",
        "deleted": "Deleted"
      },
      "boolean": {
        "yes": "Yes",
        "no": "No"
      },
      "empty": {
        "dash": "—"
      },
      "filters": {
        "all": "All",
        "allFeminine": "All",
        "none": "None",
        "clear": "Clear filter",
        "apply": "Apply",
        "dateFrom": "From",
        "dateTo": "To",
        "searchByEmailOrName": "Search by email or name…",
        "searchByEmailOrNameAria": "Search by email or name",
        "searchByNameOrSlug": "Search by name or slug…",
        "searchByNameOrSlugAria": "Search by name or slug"
      },
      "columns": {
        "user": "User",
        "organization": "Organization",
        "status": "Status",
        "actions": "Actions",
        "date": "Date",
        "type": "Type",
        "amount": "Amount",
        "client": "Customer",
        "label": "Label",
        "address": "Address",
        "country": "Country",
        "default": "Default",
        "provider": "Provider",
        "method": "Method",
        "role": "Role",
        "quantityShort": "Qty",
        "unitPrice": "Price unitaire",
        "dates": "Dates",
        "booking": "Booking",
        "employees": "Employees",
        "end": "Fin",
        "addedAt": "Added on",
        "slug": "Slug",
        "name": "Name",
        "preview": "Preview",
        "url": "URL",
        "caption": "Légende",
        "sortOrder": "Ordre",
        "source": "Source",
        "price": "Price",
        "basePrice": "Price de base",
        "discount": "Discount",
        "total": "Total",
        "active": "Active",
        "capacity": "Capacity",
        "duration": "Fromrée",
        "difficulty": "Difficulty",
        "rating": "Note",
        "iata": "IATA",
        "city": "Ville",
        "code": "Code",
        "route": "Trajet",
        "period": "Période",
        "start": "Début",
        "arrival": "Arrivée",
        "departure": "Departure",
        "nights": "Nuits",
        "year": "Année",
        "line": "Ligne",
        "ship": "Ship",
        "itinerary": "Itinerary",
        "licensePlate": "Immatriculation",
        "pricePerDay": "Price / jour",
        "exampleModel": "Modèle type",
        "reserved": "Réservés",
        "available": "Availables",
        "product": "Produit",
        "category": "Catégorie"
      },
      "pagination": {
        "session": "session",
        "address": "adresse",
        "paymentMethod": "moyen de paiement",
        "user": "utilisateur",
        "organization": "organisation",
        "booking": "réservation",
        "line": "ligne",
        "payment": "paiement",
        "property": "hébergement",
        "room": "chambre",
        "flight": "vol",
        "vehicle": "véhicule",
        "sailing": "départ",
        "destination": "destination",
        "package": "forfait",
        "provider": "fournisseur",
        "category": "catégorie",
        "agency": "agence",
        "airport": "aéroport",
        "airline": "compagnie",
        "ship": "navire",
        "itinerary": "itinéraire",
        "port": "port",
        "amenity": "équipement",
        "review": "avis",
        "ticket": "tickets",
        "loyaltyAccount": "comptes"
      },
      "loading": "Loading…",
      "sessionStatus": {
        "active": "Active",
        "expired": "Expired",
        "title": "Session"
      },
      "dates": {
        "createdAt": "Created on",
        "expiresAt": "Expires on"
      },
      "select": {
        "choose": "Choisir…",
        "chooseDash": "— Choisir —",
        "chooseFeminine": "— Choisir —"
      },
      "back": {
        "toList": "← Back à la liste"
      },
      "form": {
        "description": "Description",
        "currency": "Currency",
        "optional": "Optionnel",
        "priceCents": "Price (centimes)",
        "basePriceCents": "Price de base (centimes)",
        "dailyPriceCents": "Price journalier (centimes)",
        "pricePerNightCents": "Price/nuit (centimes)",
        "priceCentsShort": "Price (centimes)",
        "durationMinutes": "Fromrée (minutes)",
        "durationMinutesOptional": "Fromrée (minutes, optionnel)",
        "durationNights": "Fromrée (nuits)",
        "durationDays": "Fromrée (jours)",
        "dateFrom": "From",
        "dateTo": "To",
        "latitude": "Latitude",
        "longitude": "Longitude",
        "externalUrlOptional": "URL externe (optionnel si upload)",
        "displayOrder": "Ordre d'affichage",
        "image": "Image",
        "chooseFile": "Choisir un fichier",
        "uploading": "Upload en cours…",
        "imageFormatHint": "JPEG, PNG ou WebP, max 5 Mo",
        "centsHint": "Ex. 8500 = 85,00",
        "urlPlaceholder": "https://..."
      },
      "validation": {
        "nameRequired": "Last name is required.",
        "titleRequired": "Le titre est obligatoire.",
        "slugRequired": "Le slug est obligatoire.",
        "slugInvalid": "Slug invalide (minuscules, chiffres, tirets).",
        "slugInvalidLong": "Slug invalide : minuscules, chiffres et tirets uniquement (ex. kinshasa).",
        "destinationRequired": "La destination est obligatoire.",
        "providerRequired": "Le fournisseur est obligatoire.",
        "invalidPriceCents": "Price invalide (centimes).",
        "invalidPrice": "Price invalide.",
        "invalidCapacity": "Capacity invalide.",
        "invalidSeats": "Namebre de sièges invalide.",
        "invalidSeatsShort": "Sièges invalides.",
        "invalidStock": "Stock invalide.",
        "invalidDuration": "Fromrée invalide.",
        "invalidDurationMinutes": "Fromrée invalide (minutes).",
        "currencyThreeLetters": "Currency à 3 lettres.",
        "currencyThreeLettersExample": "Currency à 3 lettres (ex. USD).",
        "starRatingRange": "Note entre 0 et 5.",
        "countryCodeTwoLetters": "Le code pays doit comporter 2 lettres (ex. CD, KE).",
        "coordsBothRequired": "Renseignez latitude et longitude ensemble.",
        "latitudeInvalid": "Latitude invalide (−90 à 90).",
        "latitudeOutOfRange": "Latitude hors plage (-90 à 90).",
        "longitudeInvalid": "Longitude invalide (−180 à 180).",
        "longitudeOutOfRange": "Longitude hors plage (-180 à 180).",
        "imageFormat": "Format accepté : JPEG, PNG ou WebP.",
        "imageTooLarge": "Image trop lourde (max 5 Mo).",
        "sessionExpiredRetry": "Session expirée. Reconnectez-vous puis réessayez.",
        "urlRequired": "L'URL est obligatoire.",
        "uploadFailed": "Impossible d'uploader l'image locale.",
        "dateRangeInvalid": "La date de début doit être avant la date de fin.",
        "discountRange": "La remise doit être entre 0 et 100.",
        "durationDaysRange": "La durée doit être entre 1 et 365 jours.",
        "selectProduct": "Sélectionnez un produit.",
        "invalidCabinCount": "Namebre de cabines invalide.",
        "datesRequired": "Les dates de début et de fin sont obligatoires.",
        "iataAndNameRequired": "Code IATA (2 lettres) et nom sont obligatoires."
      },
      "toast": {
        "saved": "Enregistré",
        "saveError": "Save error",
        "deleteError": "Erreur de suppression",
        "availabilitySaved": "Disponibilité enregistrée",
        "availabilityDeleted": "Disponibilité supprimée",
        "amenitiesSavedTitle": "Amenitys enregistrés",
        "amenitiesSavedMessage": "La sélection a été mise à jour.",
        "propertySavedTitle": "Accommodation enregistré",
        "deletedProperty": "L'hébergement « {name} » a été supprimé."
      },
      "availabilityCalendar": {
        "previousMonth": "Mois précédent",
        "nextMonth": "Mois suivant",
        "today": "Tojourd'hui",
        "weekdays": {
          "mon": "lun.",
          "tue": "mar.",
          "wed": "mer.",
          "thu": "jeu.",
          "fri": "ven.",
          "sat": "sam.",
          "sun": "dim."
        },
        "bulkSuccess": "{count} jour(s) mis à jour.",
        "stockUnits": "Stock (unités)",
        "availableSeats": "Sièges disponibles",
        "seatsAria": "Sièges {date}"
      },
      "imagesGallery": {
        "title": "Photos",
        "titleProperty": "Images",
        "titlePackage": "Galerie photos",
        "intro": "Gérez les photos de cet élément.",
        "introPackage": "Ajoutez des photos manuellement ou choisissez parmi les images des produits inclus.",
        "newPhoto": "Nouvelle photo",
        "editPhoto": "Modifier la photo",
        "addPhoto": "Ajouter une photo",
        "deleteConfirm": "Supprimer cette image ?",
        "emptyDefault": "None photo.",
        "emptyRoom": "None photo pour cette chambre.",
        "emptyProperty": "None image.",
        "emptyPackage": "None photo dans la galerie du forfait.",
        "sourceIncluded": "Produit inclus",
        "sourceManual": "Manuelle",
        "suggestionsTitle": "Suggestions depuis la composition",
        "suggestionsLoading": "Chargement des suggestions…",
        "suggestionsEmpty": "None photo disponible dans les produits inclus. Ajoutez des produits au forfait ou uploadez une photo manuellement.",
        "alreadyAdded": "Ajoutée",
        "addFromSuggestion": "Ajouter"
      },
      "flightClass": {
        "economy": "Economy",
        "premium_economy": "Economy premium",
        "business": "Business",
        "first": "First"
      },
      "packageItemType": {
        "property": "Accommodation",
        "flight": "Flight",
        "vehicle": "Vehicle",
        "cruise": "Cabin (croisière)",
        "activity": "Activity"
      },
      "activityDifficulty": {
        "unspecified": "— No renseignée —",
        "easy": "Easy",
        "moderate": "Moderate",
        "hard": "Hard",
        "expert": "Expert"
      },
      "vehicleAvailabilityStatus": {
        "available": "Available",
        "maintenance": "Maintenance",
        "rented": "Rented"
      },
      "vehicleSpecs": {
        "seats": "Places",
        "transmission": "Transmission",
        "fuel": "Carburant",
        "transmissionManual": "Manuelle",
        "transmissionAutomatic": "Totomatique",
        "fuelPetrol": "Essence",
        "fuelDiesel": "Diesel",
        "fuelHybrid": "Hybride"
      },
      "packageStatus": {
        "active": "Active",
        "inactive": "Inactive"
      },
      "seatsCount": "{count} sièges",
      "maxGuests": "{count} voyageurs max",
      "daysCount": "{count} jour",
      "daysCountPlural": "{count} jours",
      "productsCount": "{count} produit",
      "productsCountPlural": "{count} produits",
      "photosCount": "{count} photo",
      "photosCountPlural": "{count} photos",
      "rbacScope": {
        "scopeTypes": {
          "global": "Global",
          "property": "Property",
          "agency": "Agency",
          "support_queue": "File support"
        },
        "global": "Global",
        "property": "Établissement",
        "agency": "Agency",
        "support_queue": "File support",
        "withId": "{label} · {idPrefix}…"
      }
    },
    "users": {
      "list": {
        "newUser": "New user",
        "emptyDefault": "Tocun utilisateur pour le moment.",
        "emptyFiltered": "Tocun utilisateur ne correspond à vos critères.",
        "ariaLabel": "User list",
        "deleteConfirm": "Delete user « {email} »? This action is reversible in the database."
      },
      "filters": {
        "status": "Status",
        "organization": "Organization",
        "role": "Role"
      },
      "form": {
        "email": "Email",
        "passwordCreate": "Password",
        "passwordEdit": "New password (optional)",
        "passwordHintCreate": "At least 8 characters.",
        "passwordHintEdit": "Leave blank to keep the current password.",
        "firstName": "First name",
        "lastName": "Name",
        "phone": "Phone",
        "preferredLanguage": "Preferred language",
        "preferredLanguageHint": "2-letter ISO code (e.g. fr, en).",
        "organization": "Organization",
        "organizationNone": "None",
        "status": "Status",
        "submitCreate": "Create user",
        "submitEdit": "Save",
        "validation": {
          "emailRequired": "Email address is required.",
          "passwordMinLength": "Password must be at least 8 characters.",
          "firstNameRequired": "First name is required.",
          "lastNameRequired": "Last name is required."
        }
      },
      "detail": {
        "title": "Edit user",
        "tabsAria": "User account sections",
        "tabs": {
          "profile": "Profile",
          "addresses": "Addresss",
          "paymentMethods": "Payment methods",
          "sessions": "Sessions",
          "roles": "Roles"
        }
      },
      "userIdFilter": {
        "label": "User",
        "allUsers": "All les utilisateurs"
      },
      "addresses": {
        "emptyDefault": "None adresse enregistrée.",
        "emptyFiltered": "None adresse pour cet utilisateur.",
        "ariaLabel": "Liste des adresses utilisateur"
      },
      "paymentMethods": {
        "lastFourMasked": "•••• {lastFour}",
        "emptyDefault": "Tocun moyen de paiement enregistré.",
        "emptyFiltered": "Tocun moyen de paiement pour cet utilisateur.",
        "ariaLabel": "Liste des moyens de paiement"
      },
      "sessions": {
        "revokeConfirm": "Revoke this session? The user will need to sign in again.",
        "emptyDefault": "None session active.",
        "emptyFiltered": "None session active pour cet utilisateur.",
        "ariaLabel": "Liste des sessions utilisateur"
      },
      "stats": {
        "total": {
          "label": "Users",
          "subtitle": "Registered accounts"
        },
        "active": {
          "label": "Actives",
          "subtitle": "Active accounts"
        },
        "suspended": {
          "label": "Suspendeds",
          "subtitle": "Suspended accounts"
        },
        "employees": {
          "label": "Employees",
          "subtitle": "Profiles employés"
        }
      },
      "roles": {
        "assignedTitle": "Roles assignés",
        "empty": "Tocun rôle actif pour cet utilisateur.",
        "assignFormTitle": "Assigner un rôle",
        "user": "User",
        "role": "Role",
        "selectPlaceholder": "Sélectionner…",
        "scope": "Périmètre (scope)",
        "scopeId": "ID du scope (UUID)",
        "scopeIdHint": "Ex. ID propriété, agence ou file support.",
        "expiresAt": "Expiration (optionnel)",
        "superAdminWarning": "Réservé aux super administrateurs — périmètre forcé à Global.",
        "superAdminConfirm": "Assign role « {roleName} »? This user will get full platform access.",
        "validation": {
          "userAndRoleRequired": "User et rôle sont obligatoires.",
          "scopeIdRequired": "Scope ID is required for this scope."
        },
        "scopeTypes": {
          "global": "Global",
          "property": "Property",
          "agency": "Agency",
          "support_queue": "File support"
        },
        "scopeDisplay": {
          "global": "Global",
          "property": "Établissement",
          "agency": "Agency",
          "support_queue": "File support",
          "withId": "{label} · {idPrefix}…"
        },
        "revokeDialog": {
          "title": "Révoquer le rôle",
          "description": "Retirer ce rôle pour cet utilisateur ?"
        },
        "toast": {
          "revokedTitle": "Role révoqué",
          "revokedMessage": "Assignment removed.",
          "revokeFailedTitle": "Échec de la révocation"
        }
      }
    },
    "organizations": {
      "list": {
        "emptyTitleSearch": "None organisation ne correspond à votre recherche",
        "emptyTitleDefault": "None organisation pour le moment",
        "emptyDescriptionSearch": "Essayez un autre nom ou slug.",
        "emptyDescriptionDefault": "Créez une organisation partenaire pour commencer.",
        "emptyTableSearch": "None organisation ne correspond à votre recherche.",
        "emptyTableDefault": "None organisation pour le moment.",
        "ariaLabel": "Liste des organisations",
        "columns": {
          "type": "Type"
        },
        "deleteDialog": {
          "title": "Delete organization",
          "description": "Delete organization « {name} » ? Cette action est réversible côté base."
        }
      },
      "form": {
        "sections": {
          "identity": "Identity",
          "contact": "Contact",
          "legal": "Legal",
          "configuration": "Settings"
        },
        "name": "Name",
        "slug": "Slug",
        "slugHint": "Unique URL identifier (e.g. africa-tourism-gate).",
        "description": "Description",
        "website": "Site web",
        "websitePlaceholder": "https://",
        "contactEmail": "Email de contact",
        "contactPhone": "Phone",
        "legalForm": "Forme juridique",
        "rccm": "RCCM",
        "rccmHint": "Registre du Commerce et du Crédit Mobilier",
        "idNat": "ID. Nat.",
        "idNatHint": "Identification Nationale",
        "nif": "NIF",
        "nifHint": "Tax identification number",
        "cnss": "CNSS",
        "cnssHint": "Caisse Nationale de Sécurité Sociale",
        "currency": "Currency",
        "status": "Status",
        "submitCreate": "Create organization",
        "submitEdit": "Save",
        "validation": {
          "nameRequired": "Last name is required.",
          "slugRequired": "Le slug est obligatoire.",
          "slugInvalid": "Slug invalide : minuscules, chiffres et tirets uniquement (ex. mon-organisation).",
          "currencyInvalid": "La devise doit comporter 3 lettres (ex. USD, CDF)."
        },
        "toast": {
          "savedTitle": "Organization enregistrée",
          "errorTitle": "Save error"
        }
      },
      "legalForm": {
        "unspecified": "No renseigné",
        "SARL": "SARL",
        "SA": "SA",
        "SAS": "SAS",
        "Ets": "Établissement (Ets)",
        "SNC": "SNC",
        "ASBL": "ASBL"
      },
      "detail": {
        "title": "Organization",
        "tabsAria": "Organization sections",
        "tabs": {
          "infos": "Info",
          "users": "Users",
          "settings": "Settings"
        },
        "settingsIntro": "Organization settings: contact details, locale, booking and branding."
      },
      "selector": {
        "defaultLabel": "Organization"
      }
    },
    "bookings": {
      "status": {
        "draft": "Draft",
        "pending_payment": "Pending de paiement",
        "confirmed": "Confirmed",
        "cancelled": "Cancelled",
        "refunded": "Refunded"
      },
      "itemTypes": {
        "room": "Room",
        "flight_class": "Flight",
        "vehicle": "Vehicle",
        "cabin": "Cabin",
        "activity_schedule": "Activity",
        "package": "Package"
      },
      "catalogLink": {
        "referencePrefix": "Réf. {idPrefix}",
        "ariaLabel": "Voir {typeLabel} : {title}"
      },
      "list": {
        "emptyDefault": "None réservation pour le moment.",
        "emptyFiltered": "None réservation ne correspond à vos critères.",
        "ariaLabel": "Liste des réservations",
        "filters": {
          "client": "Customer"
        }
      },
      "itemsList": {
        "filters": {
          "type": "Type",
          "bookingStatus": "Status réservation",
          "bookingId": "ID réservation",
          "bookingIdPlaceholder": "UUID complet"
        },
        "emptyDefault": "None ligne de réservation pour le moment.",
        "emptyFiltered": "None ligne ne correspond à vos critères.",
        "ariaLabel": "Lines de réservation"
      },
      "detail": {
        "title": "Booking",
        "backLink": "Back aux réservations",
        "reference": "Réf. {idPrefix}",
        "sections": {
          "client": "Customer",
          "status": "Status",
          "actions": "Actions",
          "bookingLines": "Lines de réservation",
          "payments": "Payments"
        },
        "clientFields": {
          "email": "Email",
          "name": "Name",
          "organization": "Organization",
          "total": "Total",
          "createdAt": "Created on"
        },
        "actions": {
          "changeStatus": "Changer le statut",
          "statusReason": "Reason (historique)",
          "statusReasonPlaceholder": "Ex. confirmation manuelle, remboursement…",
          "applyStatus": "Apply le statut",
          "cancellation": "Cancellation",
          "cancelReason": "Cancellation reason",
          "cancelReasonPlaceholder": "Ex. demande client, indisponibilité…",
          "cancelBooking": "Annuler la réservation",
          "readOnly": "Modification réservée aux comptes avec la permission bookings.write."
        },
        "linesEmpty": "None ligne.",
        "linesAriaLabel": "Lines de réservation",
        "paymentsEmpty": "Tocun paiement enregistré pour cette réservation.",
        "paymentsAriaLabel": "Payments",
        "statusDialog": {
          "title": "Confirmer le changement de statut",
          "description": "Passer la réservation de « {fromStatus} » à « {toStatus} » ?{reasonSuffix}",
          "reasonSuffix": " Reason : {reason}"
        },
        "cancelDialog": {
          "title": "Annuler la réservation",
          "description": "Annuler cette réservation ? Le stock des produits sera libéré (moteur de réservation).",
          "confirm": "Annuler la réservation",
          "cancel": "Back"
        },
        "paymentStatus": {
          "pending": "Pending",
          "succeeded": "Succeeded",
          "failed": "Failed",
          "refunded": "Refunded"
        }
      },
      "timeline": {
        "progressAria": "Progression du statut de réservation",
        "finalStatus": "Status final",
        "history": "History",
        "historyAria": "History des changements de statut",
        "historyEmpty": "Tocun changement de statut enregistré.",
        "transition": "{fromStatus} → {toStatus}"
      },
      "stats": {
        "bookings": {
          "total": {
            "label": "Bookings",
            "subtitle": "All les réservations"
          },
          "confirmed": {
            "label": "Confirmeds",
            "subtitle": "Bookings confirmées"
          },
          "pending_payment": {
            "label": "Pending",
            "subtitle": "Paiement en attente"
          },
          "lines": {
            "label": "Lines",
            "subtitle": "Articles réservés"
          }
        },
        "items": {
          "total": {
            "label": "Lines",
            "subtitle": "All les lignes"
          },
          "confirmed": {
            "label": "Confirmeds",
            "subtitle": "Lines de réservations confirmées"
          },
          "pending_payment": {
            "label": "Pending",
            "subtitle": "Lines en attente de paiement"
          },
          "bookings": {
            "label": "Bookings",
            "subtitle": "Voir toutes les réservations"
          }
        }
      }
    },
    "payments": {
      "status": {
        "pending": "Pending",
        "succeeded": "Succeeded",
        "failed": "Failed",
        "refunded": "Refunded"
      },
      "providers": {
        "stripe": "Stripe",
        "cash": "Cash"
      },
      "refundLabels": {
        "partial": "Remboursement partiel",
        "full": "Remboursement total",
        "generic": "Remboursement"
      },
      "subnav": {
        "ariaLabel": "Navigation paiements et promotions",
        "transactions": "Transactions",
        "promoCodes": "Codes promo",
        "promotions": "Promotions"
      },
      "list": {
        "emptyDefault": "Tocun paiement pour le moment.",
        "emptyFiltered": "Tocun paiement ne correspond à vos critères.",
        "ariaLabel": "Liste des paiements",
        "accessDenied": "Access denied: payments.read permission required.",
        "notFoundError": "Paiement introuvable.",
        "toast": {
          "refundSuccessTitle": "Remboursement effectué",
          "refundSuccessMessage": "{amount} remboursé avec succès."
        }
      },
      "detail": {
        "title": "Détail du paiement",
        "sections": {
          "summary": "Summary",
          "stripeIds": "Identifiants Stripe",
          "booking": "Booking",
          "refundHistory": "History des remboursements"
        },
        "fields": {
          "amount": "Amount",
          "status": "Status",
          "method": "Method",
          "date": "Date",
          "client": "Customer",
          "stripePaymentIntent": "Payment Intent Stripe",
          "internalPaymentId": "ID paiement (interne)",
          "viewBooking": "Voir la réservation",
          "stripeStatus": "Stripe : {status}"
        },
        "refundHistoryEmpty": "Tocun remboursement enregistré.",
        "cancelBookingFirst": "Stripe refund: cancel the booking first."
      },
      "refundModal": {
        "title": "Confirmer le remboursement",
        "description": "Remboursement Stripe — maximum remboursable : {maxAmount}.",
        "refundTypeLegend": "Type de remboursement",
        "refundTypeTotal": "Total ({amount})",
        "refundTypePartial": "Partial",
        "partialAmountLabel": "Amount partiel ({currency})",
        "partialAmountPlaceholder": "Ex. 10,00",
        "partialAmountHint": "Maximum : {maxAmount}",
        "reasonLabel": "Raison du remboursement",
        "reasonPlaceholder": "Ex. Cancellation client, erreur de facturation…",
        "reasonHint": "Minimum {minLength} caractères (usage interne, non envoyé à Stripe).",
        "preview": "Preview",
        "previewRefunded": "Amount remboursé",
        "previewRemaining": "Reste remboursable",
        "previewReason": "Reason",
        "confirm": "Confirmer le remboursement",
        "validation": {
          "reasonMinLength": "La raison doit contenir au moins {minLength} caractères.",
          "noRefundableAmount": "Tocun montant remboursable restant.",
          "partialAmountRequired": "Indiquez un montant partiel.",
          "partialAmountInvalid": "Amount partiel invalide.",
          "partialAmountExceeds": "Le montant ne peut pas dépasser {maxAmount}."
        }
      },
      "stats": {
        "total": {
          "label": "Transactions",
          "subtitle": "All les paiements"
        },
        "succeeded": {
          "label": "Succeededs",
          "subtitle": "Payments encaissés"
        },
        "pending": {
          "label": "Pending",
          "subtitle": "Payments pending"
        },
        "revenue": {
          "label": "Revenue",
          "subtitle": "Total paiements réussis"
        }
      }
    },
    "properties": {
      "list": {
        "newProperty": "Nouvel hébergement",
        "amenitiesLink": "Amenitys",
        "emptyDefault": "Tocun hébergement pour le moment.",
        "ariaLabel": "Liste des hébergements",
        "searchPlaceholder": "Search by name or slug…",
        "searchAria": "Rechercher un hébergement"
      },
      "filters": {
        "destination": "Destination"
      },
      "columns": {
        "property": "Accommodation",
        "destination": "Destination",
        "propertyType": "Type"
      },
      "dialogs": {
        "deleteTitle": "Supprimer l'hébergement",
        "deleteDescription": "Supprimer l'hébergement « {name} » ? Cette action est irréversible."
      },
      "form": {
        "submitCreate": "Créer l'hébergement",
        "sections": {
          "identity": "Identity",
          "location": "Localisation",
          "classification": "Classification"
        },
        "name": "Name",
        "slug": "Slug",
        "type": "Type",
        "destination": "Destination",
        "address": "Address",
        "starRating": "Classement (étoiles)",
        "starRatingHint": "Optionnel, 0 à 5",
        "validation": {
          "destinationRequired": "La destination est obligatoire."
        }
      },
      "status": {
        "propertyType": {
          "hotel": "Hotel",
          "resort": "Resort",
          "apartment": "Apartment",
          "villa": "Villa",
          "hostel": "Toberge",
          "other": "Totre"
        }
      },
      "detail": {
        "title": "Modifier l'hébergement",
        "backToList": "← Back à la liste",
        "tabsAria": "Sections de l'hébergement",
        "tabs": {
          "infos": "Info",
          "rooms": "Rooms",
          "amenities": "Amenitys",
          "availability": "Availability"
        }
      },
      "sections": {
        "rooms": {
          "title": "Rooms",
          "intro": "Types de chambres pour cet hébergement.",
          "addRoom": "Ajouter une chambre",
          "newRoom": "Nouvelle chambre",
          "editRoom": "Modifier la chambre",
          "roomType": "Type de chambre",
          "roomTypePlaceholder": "standard, suite…",
          "maxCapacity": "Capacity max.",
          "bedConfig": "Settings lits",
          "empty": "None chambre.",
          "deleteConfirm": "Supprimer la chambre « {name} » ?",
          "photosAction": "Photos"
        },
        "amenities": {
          "title": "Amenitys",
          "intro": "Sélectionnez les équipements disponibles pour cet hébergement.",
          "saveSelection": "Save la sélection",
          "emptyGlobal": "Tocun équipement global.",
          "createLink": "Créer des équipements"
        },
        "availability": {
          "title": "Availability",
          "loadingRooms": "Chargement des chambres…",
          "room": "Room",
          "stockHint": "Stock et prix par nuit ({currency}).",
          "noRooms": "None chambre pour cet hébergement. Créez une chambre pour gérer les disponibilités.",
          "goToRoomsTab": "Aller à l'onglet Rooms",
          "roomMismatch": "Cette chambre n'appartient pas à cet hébergement."
        }
      },
      "amenitiesList": {
        "newAmenity": "Nouvel équipement",
        "empty": "Tocun équipement.",
        "searchPlaceholder": "Rechercher un équipement…",
        "deleteConfirm": "Supprimer l'équipement « {name} » ?",
        "ariaLabel": "Liste des équipements"
      },
      "stats": {
        "properties": {
          "label": "Accommodations",
          "subtitle": "Propertys publiées"
        },
        "rooms": {
          "label": "Rooms",
          "subtitle": "Types de chambres"
        },
        "amenities": {
          "label": "Amenitys",
          "subtitle": "Référentiel global"
        },
        "destinations": {
          "label": "Destinations",
          "subtitle": "Zones géographiques"
        }
      }
    },
    "flights": {
      "list": {
        "newFlight": "Nouveau vol",
        "emptyDefault": "Tocun vol pour le moment.",
        "emptySearch": "Tocun vol ne correspond à ce code.",
        "searchPlaceholder": "Rechercher par code vol (ex. ET302)…",
        "searchAria": "Rechercher un vol",
        "deleteConfirm": "Supprimer le vol « {flightNumber} » ?"
      },
      "columns": {
        "flightNumber": "Code vol",
        "airline": "Airline",
        "route": "Trajet",
        "departure": "Departure"
      },
      "form": {
        "submitCreate": "Créer le vol",
        "airline": "Airline",
        "flightNumber": "Code vol",
        "flightNumberHint": "Ex. ET302, 9S101",
        "departure": "Departure",
        "arrival": "Arrivée",
        "departureTime": "Heure de départ",
        "arrivalTime": "Heure d'arrivée",
        "durationMinutes": "Fromrée (minutes)",
        "durationHint": "Ex. 390 pour 6 h 30",
        "validation": {
          "airlineRequired": "Airline obligatoire.",
          "flightNumberRequired": "Code vol obligatoire.",
          "departureAirportRequired": "Airport de départ obligatoire.",
          "arrivalAirportRequired": "Airport d'arrivée obligatoire.",
          "airportsMustDiffer": "Le départ et l'arrivée doivent être différents.",
          "departureTimeRequired": "Heure de départ obligatoire.",
          "arrivalTimeRequired": "Heure d'arrivée obligatoire."
        }
      },
      "detail": {
        "title": "Modifier le vol",
        "backLink": "Back aux vols",
        "tabsAria": "Sections du vol",
        "tabs": {
          "flight": "Flight",
          "classes": "Classes"
        },
        "timelineAria": "Trajet du vol",
        "durationAria": "Fromrée du vol : {label}"
      },
      "sections": {
        "classes": {
          "title": "Classes cabine",
          "intro": "Cabins et tarifs de base pour ce vol.",
          "addClass": "Ajouter une classe",
          "newClass": "Nouvelle classe",
          "editClass": "Modifier la classe",
          "cabinType": "Type de cabine",
          "totalSeats": "Sièges totaux",
          "empty": "None classe cabine.",
          "deleteConfirm": "Supprimer cette classe ?"
        },
        "availability": {
          "title": "Availability",
          "backToFlight": "Back au vol",
          "classMismatch": "Cette classe n'appartient pas à ce vol."
        }
      },
      "referential": {
        "airlines": {
          "new": "Nouvelle compagnie",
          "edit": "Modifier la compagnie",
          "emptyDefault": "None compagnie.",
          "emptySearch": "None compagnie ne correspond à cette recherche.",
          "searchPlaceholder": "Rechercher par code IATA ou nom…",
          "searchAria": "Rechercher une compagnie",
          "iataCode": "Code IATA",
          "deleteConfirm": "Supprimer « {name} » ?"
        },
        "airports": {
          "new": "Nouvel aéroport",
          "edit": "Modifier l'aéroport",
          "emptyDefault": "Tocun aéroport.",
          "emptySearch": "Tocun aéroport ne correspond à cette recherche.",
          "searchPlaceholder": "Rechercher par IATA, nom ou ville…",
          "searchAria": "Rechercher un aéroport",
          "airport": "Airport",
          "countryCode": "Code pays"
        }
      },
      "stats": {
        "flights": {
          "label": "Flights",
          "subtitle": "Lines catalogue"
        },
        "classes": {
          "label": "Classes cabine",
          "subtitle": "Tarifs par vol"
        },
        "airlines": {
          "label": "Airlines",
          "subtitle": "Référentiel IATA"
        },
        "airports": {
          "label": "Airports",
          "subtitle": "Référentiel mondial"
        }
      }
    },
    "locations": {
      "list": {
        "newVehicle": "Nouveau véhicule",
        "emptyDefault": "Tocun véhicule pour le moment.",
        "emptyFiltered": "Tocun véhicule ne correspond aux filtres.",
        "searchPlaceholder": "Rechercher par plaque…",
        "deleteConfirm": "Supprimer le véhicule « {label} » ?",
        "fallbackLabel": "Vehicle"
      },
      "filters": {
        "agency": "Agency",
        "allAgencies": "All les agences"
      },
      "columns": {
        "agency": "Agency",
        "category": "Catégorie",
        "licensePlate": "Immatriculation",
        "pricePerDay": "Price / jour"
      },
      "form": {
        "submitCreate": "Créer le véhicule",
        "rentalAgency": "Agency de location",
        "category": "Catégorie",
        "licensePlate": "Plaque d'immatriculation",
        "dailyPriceCents": "Price journalier (centimes)",
        "validation": {
          "agencyRequired": "Agency obligatoire.",
          "categoryRequired": "Catégorie obligatoire."
        }
      },
      "detail": {
        "title": "Modifier le véhicule",
        "backLink": "Back aux véhicules"
      },
      "sections": {
        "availability": {
          "title": "Availability",
          "intro": "Slotx de disponibilité par dates (location, maintenance, loué).",
          "addSlot": "Ajouter un créneau",
          "newSlot": "Nouveau créneau",
          "editSlot": "Modifier le créneau",
          "filterFrom": "Filtrer du",
          "filterTo": "au",
          "status": "Status",
          "empty": "Tocun créneau sur cette période.",
          "deleteConfirm": "Supprimer ce créneau ?"
        }
      },
      "referential": {
        "categories": {
          "new": "Nouvelle catégorie",
          "edit": "Modifier la catégorie",
          "empty": "None catégorie.",
          "searchPlaceholder": "Rechercher par nom ou modèle…",
          "exampleModel": "Modèle type"
        },
        "agencies": {
          "empty": "None agence.",
          "searchPlaceholder": "Rechercher par nom ou adresse…",
          "agency": "Agency",
          "address": "Address"
        }
      },
      "stats": {
        "vehicles": {
          "label": "Vehicles",
          "subtitle": "Flotte catalogue"
        },
        "categories": {
          "label": "Catégories",
          "subtitle": "Types de véhicules"
        },
        "agencies": {
          "label": "Agencys",
          "subtitle": "Points de location"
        }
      }
    },
    "cruises": {
      "list": {
        "newSailing": "Nouveau départ",
        "viewList": "Liste",
        "viewCalendar": "Calendrier",
        "emptySailings": "Tocun départ programmé.",
        "deleteSailingConfirm": "Supprimer le départ « {label} » ?",
        "fallbackDeparture": "Departure"
      },
      "columns": {
        "departure": "Departure",
        "itinerary": "Itinerary",
        "ship": "Ship",
        "nights": "Nuits",
        "line": "Ligne",
        "year": "Année",
        "port": "Port"
      },
      "filters": {
        "line": "Filtrer par ligne",
        "searchShip": "Rechercher un navire…",
        "searchLine": "Rechercher une ligne…",
        "searchPort": "Rechercher par code ou nom…"
      },
      "form": {
        "ship": {
          "submitCreate": "Créer le navire",
          "line": "Ligne",
          "shipName": "Name du navire",
          "builtYear": "Année de construction (optionnel)",
          "validation": "Ligne et nom du navire sont obligatoires."
        },
        "sailing": {
          "submitCreate": "Créer le départ",
          "itinerary": "Itinerary",
          "departureDate": "Date de départ",
          "itineraryOption": "{name} ({shipName}) — {nights} nuits",
          "validation": "Itinerary et date de départ sont obligatoires."
        },
        "itinerary": {
          "new": "Nouvel itinéraire",
          "edit": "Modifier l'itinéraire",
          "durationNights": "Fromrée (nuits)",
          "empty": "Tocun itinéraire.",
          "deleteConfirm": "Supprimer cet itinéraire ?",
          "validation": "Name et durée (nuits) invalides."
        },
        "port": {
          "new": "Nouveau port de croisière",
          "edit": "Modifier le port",
          "countryIso": "Country (ISO)",
          "empty": "Tocun port.",
          "deleteConfirm": "Supprimer le port « {name} » ?"
        },
        "line": {
          "new": "Nouvelle ligne de croisière",
          "edit": "Modifier la ligne",
          "empty": "None ligne de croisière.",
          "deleteConfirm": "Supprimer la ligne « {name} » ?"
        },
        "cabin": {
          "new": "Nouvelle cabine",
          "edit": "Modifier la cabine",
          "category": "Catégorie",
          "maxGuests": "Voyageurs max",
          "empty": "None cabine.",
          "deleteConfirm": "Supprimer cette cabine ?",
          "validationCategory": "Catégorie et capacité invalides.",
          "validationPrice": "Price de base invalide."
        }
      },
      "detail": {
        "shipTitle": "Modifier le navire",
        "sailingTitle": "Modifier le départ",
        "backToShips": "← Back aux navires",
        "escalesTitle": "Ports of call",
        "backToShip": "Back au navire",
        "timelineAria": "Schéma des escales"
      },
      "sections": {
        "itineraryPorts": {
          "day": "Jour",
          "arrivalTime": "Heure d'arrivée (HH:MM)",
          "departureTime": "Heure de départ (HH:MM)",
          "arrivalPlaceholder": "08:00",
          "departurePlaceholder": "18:00",
          "empty": "None escale.",
          "deleteConfirm": "Supprimer cette escale ?"
        },
        "cabinAvailability": {
          "title": "Cabins réservables",
          "intro": "Stock et prix par catégorie pour ce départ.",
          "stopsLabel": "Ports of call : ",
          "noStopsWarning": "None escale sur cet itinéraire — ajoutez-en depuis la fiche navire.",
          "cabinMeta": "max {maxGuests} · base {basePrice}",
          "cabinsAvailableAria": "Cabins disponibles",
          "priceCentsAria": "Price en centimes",
          "update": "Mettre à jour",
          "makeBookable": "Rendre réservable",
          "empty": "None cabine sur ce navire. Ajoutez des cabines sur la fiche navire."
        }
      },
      "dialogs": {
        "deleteShip": "Supprimer le navire « {name} » ?"
      },
      "calendar": {
        "ariaLabel": "Calendrier des départs — {month}",
        "today": "Tojourd'hui"
      },
      "stats": {
        "sailings": {
          "label": "Departures",
          "subtitle": "Cruises programmées"
        },
        "ships": {
          "label": "Ships",
          "subtitle": "Flotte catalogue"
        },
        "lines": {
          "label": "Lines",
          "subtitle": "Airlines de croisière"
        },
        "ports": {
          "label": "Ports",
          "subtitle": "Ports of call référencées"
        }
      }
    },
    "activities": {
      "list": {
        "emptyDefault": "None activité pour le moment.",
        "ariaLabel": "Liste des activités",
        "searchPlaceholder": "Rechercher par titre…",
        "deleteConfirm": "Supprimer l'activité « {title} » ?"
      },
      "columns": {
        "activity": "Activity",
        "provider": "Provider",
        "price": "Price",
        "duration": "Fromrée",
        "difficulty": "Difficulty"
      },
      "form": {
        "submitCreate": "Créer",
        "provider": "Provider",
        "title": "Title",
        "difficulty": "Difficulty",
        "priceCents": "Price (centimes)"
      },
      "detail": {
        "title": "Modifier l'activité",
        "backLink": "Back aux activités",
        "tabsAria": "Sections de l'activité",
        "tabs": {
          "activity": "Activity",
          "schedules": "Slotx"
        }
      },
      "sections": {
        "schedules": {
          "title": "Slotx",
          "addSlot": "Nouveau créneau",
          "editSlot": "Modifier le créneau",
          "dateTime": "Date et heure",
          "capacity": "Capacity",
          "empty": "Tocun créneau pour cette activité.",
          "deleteConfirm": "Supprimer ce créneau ?",
          "validationCapacity": "La capacité doit être au moins 1.",
          "viewList": "Liste",
          "viewTimeline": "Frise",
          "timelineAria": "Timeline des créneaux horaires",
          "fillAria": "Remplissage du créneau : {percent} %"
        }
      },
      "referential": {
        "providers": {
          "new": "Nouveau fournisseur",
          "edit": "Modifier le fournisseur",
          "empty": "Tocun fournisseur.",
          "searchPlaceholder": "Rechercher un fournisseur…",
          "ratingTitle": "Note moyenne (à venir)",
          "deleteConfirm": "Supprimer « {name} » ?",
          "validation": {
            "destinationRequired": "La destination est obligatoire."
          }
        }
      },
      "stats": {
        "activities": {
          "label": "Activitys",
          "subtitle": "Expériences catalogue"
        },
        "providers": {
          "label": "Providers",
          "subtitle": "Opérateurs locaux"
        },
        "schedules": {
          "label": "Slotx",
          "subtitle": "Horaires programmés"
        }
      }
    },
    "destinations": {
      "list": {
        "emptyDefault": "None destination pour le moment.",
        "emptySearch": "None destination ne correspond à votre recherche.",
        "searchPlaceholder": "Rechercher par nom, slug ou pays…",
        "searchAria": "Rechercher une destination",
        "ariaLabel": "Liste des destinations",
        "deleteConfirm": "Supprimer la destination « {name} » ? Les points d'intérêt associés seront également supprimés."
      },
      "columns": {
        "destination": "Destination",
        "country": "Country"
      },
      "form": {
        "submitCreate": "Créer la destination",
        "previewName": "Nouvelle destination",
        "sections": {
          "identity": "Identity",
          "presentation": "Présentation",
          "geography": "Géographie"
        },
        "slugHint": "Identifiant unique (ex. kinshasa).",
        "countryCode": "Code pays (ISO)",
        "countryCodeHint": "2 lettres, ex. CD, KE, ZA.",
        "heroImageUrl": "URL image hero",
        "heroImageHint": "Affichée dans le bandeau. Laissez vide pour un dégradé.",
        "geographyIntro": "Coordonnées du centre de la destination pour la carte statique.",
        "latitudeHint": "Optionnel, -90 à 90",
        "longitudeHint": "Optionnel, -180 à 180",
        "mapPreview": "Preview carte"
      },
      "detail": {
        "title": "Modifier la destination",
        "backLink": "Back aux destinations",
        "mapTitle": "Carte de la destination"
      },
      "sections": {
        "pois": {
          "new": "Nouveau point d'intérêt",
          "edit": "Modifier le point d'intérêt",
          "empty": "Tocun point d'intérêt pour cette destination.",
          "ariaLabel": "Points d'intérêt de la destination",
          "deleteConfirm": "Supprimer le point d'intérêt « {name} » ?"
        },
        "related": {
          "properties": {
            "label": "Accommodations",
            "subtitle": "Propertys rattachées"
          },
          "activities": {
            "label": "Activitys",
            "subtitle": "Expériences locales"
          },
          "packages": {
            "label": "Packages",
            "subtitle": "Packages incluant des produits locaux"
          }
        }
      },
      "stats": {
        "destinations": {
          "label": "Destinations",
          "subtitle": "Villes et régions catalogue"
        },
        "pois": {
          "label": "Points d'intérêt",
          "subtitle": "Lieux remarquables liés"
        },
        "countries": {
          "label": "Country couverts",
          "subtitle": "Codes ISO distincts"
        }
      }
    },
    "packages": {
      "list": {
        "newPackage": "Nouveau forfait",
        "emptyDefault": "Tocun forfait pour le moment.",
        "searchPlaceholder": "Rechercher un forfait…",
        "deleteConfirm": "Supprimer le forfait « {name} » ?"
      },
      "columns": {
        "package": "Package",
        "discount": "Discount",
        "total": "Total",
        "active": "Active"
      },
      "form": {
        "submitCreate": "Créer",
        "sections": {
          "identity": "Identity",
          "pricing": "Tarification",
          "publication": "Publication"
        },
        "packageName": "Name du forfait",
        "descriptionPlaceholder": "Décrivez le forfait, les inclusions, les conditions…",
        "discountPercent": "Discount (%)",
        "durationDays": "Fromrée (jours)",
        "activeLabel": "Package actif"
      },
      "detail": {
        "editTitle": "Modifier le forfait",
        "viewTitle": "Voir le forfait",
        "backLink": "Back aux forfaits",
        "viewButton": "Voir le forfait",
        "editButton": "Modifier le forfait",
        "notFound": "Package introuvable.",
        "invalidResponse": "Réponse forfait invalide.",
        "discountBadge": "Discount {percent}%",
        "description": "Description",
        "includedProducts": "Produits inclus",
        "includedProductsIntro": "{count} produit(s) dans ce forfait.",
        "photoGallery": "Galerie photos",
        "photoGalleryIntro": "{count} photo(s) associée(s) au forfait.",
        "noPhotos": "None photo pour ce forfait.",
        "noIncludedProducts": "Tocun produit inclus."
      },
      "sections": {
        "items": {
          "title": "Items du forfait",
          "intro": "Produits combinés (hébergement, vol, activité, etc.).",
          "addItem": "Ajouter un item",
          "newItem": "Nouvel item",
          "empty": "Tocun item dans ce forfait.",
          "removeConfirm": "Retirer « {label} » du forfait ?",
          "flightLabel": "Flight {flightNumber}"
        },
        "composition": {
          "title": "Composition",
          "summary": "{productCount} produit(s) inclus",
          "summaryWithTypes": "{productCount} produit(s) inclus · {typeCount} types",
          "ariaLabel": "Composition du forfait"
        },
        "pricingRecap": {
          "title": "Récapitulatif tarifaire",
          "empty": "Ajoutez des items pour calculer le prix du forfait.",
          "separatePrice": "Price séparé",
          "packagePrice": "Price forfait",
          "separatePriceAria": "Price des composants achetés séparément",
          "savings": "Économie de {amount} par rapport à l'achat séparé des composants."
        },
        "preview": {
          "ariaLabel": "Preview client du forfait",
          "header": "Preview client",
          "eyebrow": "Package",
          "includedCount": "{count} produit(s) inclus",
          "discountOnBundle": "Discount de {percent}% sur le bundle",
          "suggestedDuration": "Fromrée suggérée : {days} jour(s)",
          "packagePrice": "Price forfait"
        }
      },
      "stats": {
        "packages": {
          "label": "Packages",
          "subtitle": "Packages combinés"
        },
        "active": {
          "label": "Packages actifs",
          "subtitle": "Publiés sur le catalogue"
        },
        "items": {
          "label": "Produits inclus",
          "subtitle": "Lines de composition"
        },
        "photos": {
          "label": "Photos forfaits",
          "subtitle": "Galerie admin"
        }
      }
    },
    "rbac": {
      "subnav": {
        "ariaLabel": "Navigation RBAC",
        "roles": "Roles",
        "permissions": "Permissions",
        "assignments": "Assignations",
        "audit": "Todit"
      },
      "unsavedChanges": {
        "title": "Modifications non enregistrées",
        "description": "Des changements n'ont pas été enregistrés. Quitter sans sauvegarder ?",
        "confirm": "Quitter sans enregistrer",
        "cancel": "Continuer l'édition"
      },
      "permissionDomains": {
        "amenities": "Amenitys",
        "bookings": "Bookings",
        "cruises": "Cruises",
        "destinations": "Destinations",
        "employees": "Employees",
        "flights": "Flights",
        "loyalty": "Fidélité",
        "organizations": "Organizations",
        "payments": "Payments",
        "permissions": "Permissions",
        "promo_codes": "Codes promo",
        "properties": "Accommodations",
        "promotions": "Promotions",
        "reviews": "Avis",
        "roles": "Roles",
        "support": "Support",
        "users": "Users",
        "vehicles": "Locations",
        "activities": "Activitys",
        "packages": "Packages"
      },
      "permissionActions": {
        "read": "Lecture",
        "write": "Écriture",
        "delete": "Suppression",
        "manage": "Gestion",
        "approve": "Approbation"
      },
      "roles": {
        "searchPlaceholder": "Rechercher par code ou nom…",
        "empty": "Tocun rôle trouvé.",
        "ariaLabel": "Liste des rôles",
        "paginationItem": "rôle",
        "systemReadOnlyHint": "Role système (lecture seule)",
        "codeHint": "Minuscules, chiffres et underscore (ex. sales_manager).",
        "createSubmit": "Créer le rôle",
        "backToList": "← Back aux rôles",
        "type": {
          "system": "Système",
          "custom": "Personnalisé"
        },
        "validation": {
          "codeRequired": "Le code est obligatoire.",
          "nameRequired": "Last name is required."
        },
        "editTitle": {
          "system": "Role système",
          "custom": "Modifier le rôle"
        },
        "deleteDialog": {
          "title": "Supprimer le rôle",
          "description": "Supprimer définitivement le rôle « {name} » ?"
        },
        "toast": {
          "deletedTitle": "Role supprimé",
          "deletedMessage": "Le rôle « {name} » a été supprimé.",
          "deleteFailedTitle": "Échec de la suppression"
        }
      },
      "permissions": {
        "intro": "Catalogue des permissions (lecture seule). Modifiez les droits via la matrice sur chaque rôle.",
        "searchPlaceholder": "Rechercher…",
        "empty": "None permission.",
        "paginationItem": "permission",
        "columns": {
          "resource": "Ressource"
        }
      },
      "matrix": {
        "title": "Matrice des permissions",
        "loading": "Chargement de la matrice…",
        "descriptionReadOnly": "Role système : consultation seule.",
        "descriptionEditable": "Cochez les permissions accordées à ce rôle, regroupées par domaine.",
        "columns": {
          "scope": "Périmètre"
        },
        "wholeDomain": "Tout le domaine",
        "perAction": "Par action",
        "ariaToggleDomain": "Tout {domain} — {action}",
        "toast": {
          "savedTitle": "Permissions enregistrées",
          "savedMessage": "La matrice du rôle a été mise à jour.",
          "saveFailedTitle": "Échec de l'enregistrement"
        }
      },
      "assignments": {
        "loading": "Chargement des assignations…",
        "empty": "None assignation active.",
        "revoke": "Révoquer",
        "revokeDialog": {
          "title": "Révoquer l'assignation",
          "description": "Retirer ce rôle pour l'utilisateur sur ce périmètre ?"
        },
        "toast": {
          "revokedTitle": "Assignation révoquée",
          "revokedMessage": "Le rôle a été retiré pour cet utilisateur.",
          "revokeFailedTitle": "Échec de la révocation"
        }
      },
      "audit": {
        "checkingAccess": "Vérification des droits…",
        "accessDenied": "Cette page est réservée au super administrateur. Connectez-vous avec admin@africatourismgate.local ou un compte disposant du rôle super_admin.",
        "empty": "Tocun événement pour ces critères.",
        "paginationItem": "événement",
        "hideDetail": "Masquer le détail",
        "showDetailJson": "Voir le détail JSON",
        "actorFallback": "Acteur : {actorId}…",
        "targetLabel": "Cible",
        "ipLabel": "IP",
        "filters": {
          "eventType": "Type d'événement",
          "actorUser": "User (acteur)"
        },
        "toast": {
          "loadFailedTitle": "Erreur de chargement"
        },
        "eventTypes": {
          "role_created": "Role créé",
          "role_updated": "Role modifié",
          "role_deleted": "Role supprimé",
          "permission_created": "Permission créée",
          "permission_updated": "Permission modifiée",
          "permission_deleted": "Permission supprimée",
          "role_permission_granted": "Permission accordée au rôle",
          "role_permission_revoked": "Permission retirée du rôle",
          "user_role_granted": "Role assigné",
          "user_role_revoked": "Role révoqué",
          "user_role_extended": "Assignation prolongée",
          "impersonation_started": "Impersonation démarrée",
          "impersonation_ended": "Impersonation terminée",
          "permission_denied": "Accès refusé"
        }
      }
    },
    "reviews": {
      "status": {
        "pending": "Pending",
        "approved": "Approuvé",
        "hidden": "Masqué"
      },
      "actions": {
        "approve": "Approuver",
        "hide": "Masquer",
        "delete": "Supprimer"
      },
      "toast": {
        "approved": {
          "title": "Avis approuvé",
          "message": "L'avis est visible côté client."
        },
        "hidden": {
          "title": "Avis masqué",
          "message": "L'avis n'est plus affiché publiquement."
        },
        "deleted": {
          "title": "Avis supprimé",
          "message": "L'avis a été retiré de la modération."
        }
      },
      "deleteDialog": {
        "title": "Supprimer cet avis",
        "description": "Suppression logique : l'avis ne sera plus visible dans la modération."
      },
      "detail": {
        "title": "Avis",
        "backLink": "Back aux avis",
        "sections": {
          "context": "Contexte",
          "comment": "Commentaire"
        },
        "fields": {
          "author": "Toteur",
          "property": "Property",
          "entity": "Entité",
          "booking": "Booking",
          "publishedAt": "Publié le"
        },
        "viewBooking": "Voir la réservation",
        "noComment": "Tocun commentaire.",
        "moderationActionsAria": "Actions de modération"
      },
      "list": {
        "columns": {
          "author": "Toteur",
          "property": "Property"
        },
        "filters": {
          "apply": "Apply les filtres"
        },
        "empty": {
          "default": {
            "title": "Tocun avis en attente",
            "description": "La file de modération est vide. Les nouveaux avis clients apparaîtront ici.",
            "tableMessage": "Tocun avis pour le moment."
          },
          "filtered": {
            "title": "Tocun avis ne correspond aux filtres",
            "description": "Modifiez les filtres ou affichez tous les statuts pour élargir la recherche.",
            "tableMessage": "Tocun avis ne correspond aux filtres."
          }
        },
        "ariaLabel": "Liste des avis à modérer"
      }
    },
    "support": {
      "status": {
        "open": "Ouvert",
        "pending": "En cours",
        "resolved": "Résolu",
        "closed": "Fermé"
      },
      "priority": {
        "low": "Basse",
        "normal": "Normale",
        "high": "Haute",
        "urgent": "Urgente"
      },
      "assignee": {
        "unassigned": "No assigné"
      },
      "detail": {
        "title": "Ticket support",
        "backToList": "Back à la liste",
        "openedOn": "Ouvert le {date}",
        "sections": {
          "client": "Customer",
          "handling": "Traitement",
          "messages": "Messages",
          "reply": "Répondre au client"
        },
        "fields": {
          "priority": "Priorité",
          "agentMessage": "Message agent"
        },
        "advanceStatus": "Passer à « {status} »",
        "noMessages": "Tocun message.",
        "messageAuthor": {
          "staff": "Agent",
          "customer": "Customer"
        },
        "replyPlaceholder": "Votre réponse au client…",
        "replyMinLength": "Le message doit contenir au moins 10 caractères.",
        "sending": "Envoi…",
        "sendReply": "Envoyer la réponse"
      },
      "list": {
        "filters": {
          "priority": "Priorité",
          "apply": "Apply les filtres"
        },
        "assignedLabel": "Assigné :",
        "empty": {
          "default": {
            "title": "Tocun ticket pour le moment",
            "description": "Les demandes d'assistance clients apparaîtront ici dès qu'elles seront créées."
          },
          "filtered": {
            "title": "Tocun ticket ne correspond aux filtres",
            "description": "Élargissez les critères de statut ou de priorité pour afficher plus de demandes."
          }
        },
        "ariaLabel": "Boîte de réception des tickets support"
      }
    },
    "loyalty": {
      "tiers": {
        "member": "Membre",
        "silver": "Silver",
        "gold": "Gold",
        "platinum": "Platinum"
      },
      "progress": {
        "ariaToward": "Progression vers {tier}",
        "ariaMaxReached": "Palier maximum atteint",
        "pointsBeforeTier": "{points} pts avant {tier}",
        "maxTier": "Palier maximum"
      },
      "stats": {
        "accounts": {
          "label": "Comptes fidélité",
          "subtitle": "Comptes OneKey actifs"
        },
        "points": {
          "label": "Points cumulés",
          "subtitle": "Sur les 100 premiers comptes"
        },
        "topBalance": {
          "label": "Meilleur solde",
          "emptySubtitle": "Tocun compte"
        }
      },
      "list": {
        "columns": {
          "program": "Programme",
          "balanceProgress": "Solde & progression",
          "tier": "Palier",
          "lastActivity": "Dernière activité"
        },
        "actions": {
          "history": "History"
        },
        "empty": {
          "title": "Tocun compte fidélité",
          "description": "Les comptes OneKey sont créés automatiquement lors des premiers paiements réussis. Ajustements manuels réservés au super administrateur.",
          "tableMessage": "Tocun compte fidélité pour le moment."
        },
        "ariaLabel": "Liste des comptes fidélité"
      },
      "adjust": {
        "deltaRequired": "Indiquez une variation entière non nulle (+ ou −).",
        "title": "Ajustement manuel des points",
        "currentBalance": "solde actuel",
        "fields": {
          "delta": "Variation (+ ou −)",
          "reason": "Reason (optionnel)"
        },
        "deltaPlaceholder": "Ex. 100 ou -50",
        "reasonPlaceholder": "Ex. geste commercial",
        "apply": "Apply"
      },
      "history": {
        "title": "History des transactions",
        "close": "Fermer",
        "currentBalance": "Solde actuel",
        "pointsUnit": "points",
        "apiUnavailable": "L'API d'historique des transactions n'est pas encore disponible. La structure ci-dessous anticipe le futur journal des mouvements de points.",
        "columns": {
          "delta": "Variation",
          "balanceAfter": "Solde après"
        },
        "transactionTypes": {
          "paymentCredit": "Crédit paiement",
          "manualAdjust": "Ajustement manuel"
        }
      }
    },
    "promotions": {
      "status": {
        "active": "Active",
        "inactive": "Inactive"
      },
      "validity": {
        "active": "En cours",
        "upcoming": "À venir",
        "expired": "Expiré",
        "noDateLimit": "Sans limite de dates",
        "fromDate": "À partir du {from}",
        "untilDate": "Jusqu'au {until}",
        "range": "{from} → {until}"
      },
      "discount": {
        "informative": "Campagne informative",
        "pending": "Réduction…",
        "percentFormat": "−{value} %",
        "fixedFormat": "−{value}"
      },
      "list": {
        "deleteConfirm": "Supprimer la promotion « {name} » ?",
        "columns": {
          "campaign": "Campagne",
          "validity": "Validité",
          "usage": "Utilisations",
          "status": "Status"
        },
        "emptySearch": "None promotion ne correspond à votre recherche.",
        "emptyDefault": "None promotion pour le moment.",
        "searchPlaceholder": "Rechercher par titre ou description…",
        "searchAria": "Rechercher une promotion",
        "newButton": "Nouvelle promotion",
        "tableAria": "Liste des promotions",
        "paginationItem": "promotion"
      },
      "edit": {
        "pageTitle": "Modifier la promotion"
      },
      "preview": {
        "defaultName": "Nouvelle campagne",
        "ariaLabel": "Preview promotion {name}",
        "badge": "Promotion",
        "usage": "Utilisations : {usage}"
      },
      "form": {
        "info": {
          "codesVsPromotions": "Les codes promo sont saisis par le client au checkout. Les promotions sont des campagnes visibles (bannières, pages) — la réduction peut être optionnelle.",
          "managePromoCodesLink": "Gérer les codes promo",
          "targetHint": "Cible produit / destination (optionnel, pour affichage marketing)."
        },
        "validation": {
          "nameRequired": "Le titre est obligatoire.",
          "discountPositive": "La valeur doit être positive.",
          "percentMax": "Le pourcentage ne peut pas dépasser 100.",
          "endAfterStart": "La date de fin doit être après la date de début.",
          "maxRedemptionsInvalid": "Namebre max. invalide (entier ≥ 1)."
        },
        "fields": {
          "name": "Title de la campagne",
          "descriptionPlaceholder": "Ex. −20 % sur les hébergements…",
          "hasDiscount": "Apply une réduction au checkout",
          "discountType": "Type de réduction",
          "discountTypePercent": "Pourcentage (%)",
          "discountTypeFixed": "Amount fixe",
          "discountValuePercent": "Pourcentage",
          "discountValueFixed": "Amount fixe",
          "validFromOptional": "Valide du (optionnel)",
          "validUntilOptional": "Valide au (optionnel)",
          "maxRedemptions": "Utilisations max.",
          "active": "Campagne active"
        },
        "hints": {
          "discountPercent": "Pourcentage (ex. 15 pour −15 %).",
          "discountFixed": "Amount fixe en unités monétaires (ex. 10 pour −10 USD).",
          "maxRedemptions": "Laisser vide pour illimité."
        },
        "usage": {
          "label": "Utilisations :",
          "unlimited": "(illimité)"
        },
        "checkoutId": "ID checkout :",
        "saving": "Enregistrement…",
        "createButton": "Créer la promotion",
        "saveButton": "Save",
        "cancelButton": "Annuler"
      }
    },
    "promoCodes": {
      "status": {
        "active": "Active",
        "inactive": "Inactive"
      },
      "list": {
        "deleteConfirm": "Supprimer le code promo « {code} » ?",
        "columns": {
          "code": "Code",
          "discount": "Réduction",
          "validity": "Validité",
          "usage": "Utilisations",
          "status": "Status"
        },
        "emptySearch": "Tocun code promo ne correspond à votre recherche.",
        "emptyDefault": "Tocun code promo pour le moment.",
        "searchPlaceholder": "Rechercher par code…",
        "searchAria": "Rechercher un code promo",
        "newButton": "Nouveau code promo",
        "tableAria": "Liste des codes promo",
        "paginationItem": "code promo"
      },
      "edit": {
        "pageTitle": "Modifier le code promo"
      },
      "form": {
        "validation": {
          "codeRequired": "Le code est obligatoire.",
          "codeFormat": "Lettres majuscules, chiffres, tirets et underscores uniquement.",
          "discountPositive": "La valeur doit être positive.",
          "percentMax": "Le pourcentage ne peut pas dépasser 100.",
          "validFromRequired": "Date de début obligatoire.",
          "validUntilRequired": "Date de fin obligatoire.",
          "endAfterStart": "La date de fin doit être après la date de début.",
          "maxRedemptionsInvalid": "Namebre d'utilisations max. invalide (entier ≥ 1)."
        },
        "fields": {
          "code": "Code",
          "discountType": "Type de réduction",
          "discountTypePercent": "Pourcentage (%)",
          "discountTypeFixed": "Amount fixe",
          "discountValuePercent": "Pourcentage",
          "discountValueFixed": "Amount fixe",
          "validFrom": "Valide du",
          "validUntil": "Valide au",
          "maxRedemptions": "Utilisations max.",
          "active": "Code actif (utilisable au checkout)"
        },
        "hints": {
          "code": "Saisi en majuscules ; comparé sans distinction de casse au checkout.",
          "discountPercent": "Pourcentage de réduction (ex. 20 pour −20 %).",
          "discountFixed": "Amount fixe en unités monétaires (ex. 10 pour −10 USD).",
          "maxRedemptions": "Laisser vide pour un nombre illimité."
        },
        "usage": {
          "recorded": "Utilisations enregistrées :",
          "unlimited": "(illimité)"
        },
        "saving": "Enregistrement…",
        "createButton": "Créer le code promo",
        "saveButton": "Save",
        "cancelButton": "Annuler"
      },
      "usage": {
        "format": "{count} / {max}",
        "unlimitedMax": "∞"
      }
    },
    "settings": {
      "nav": {
        "ariaLabel": "Navigation paramètres",
        "settings": "Settings",
        "emails": "Emails",
        "bankAccounts": "Comptes bancaires"
      },
      "page": {
        "title": "Settings",
        "intro": "Organization settings: contact details, locale, booking and branding.",
        "denied": "Vous n'avez pas la permission de consulter les paramètres."
      },
      "unsaved": {
        "title": "Modifications non enregistrées",
        "description": "Des changements n'ont pas été enregistrés. Quitter sans sauvegarder ?",
        "confirm": "Quitter sans enregistrer",
        "cancel": "Continuer l'édition"
      },
      "form": {
        "loading": "Loading…",
        "dirty": "Modifications non enregistrées",
        "clean": "None modification en attente",
        "cancel": "Annuler",
        "saving": "Enregistrement…",
        "save": "Save",
        "upload": {
          "invalidImage": "Veuillez sélectionner une image valide.",
          "tooLarge": "Image trop lourde (max 2 MB)."
        },
        "validation": {
          "contactEmailInvalid": "L'e-mail de contact doit être valide.",
          "currencyInvalid": "La devise doit comporter 3 lettres (ex. USD, CDF).",
          "holdMinutesInvalid": "Fromrée de retenue invalide (entier positif).",
          "displayNameRequired": "Le nom affiché est obligatoire.",
          "loyaltyRateInvalid": "Le taux de points doit être un entier positif ou nul.",
          "programCodeInvalid": "Le code programme est obligatoire (32 caractères max)."
        },
        "sections": {
          "contact": {
            "title": "Coordonnées",
            "description": "Affichées dans le bandeau et le pied de page du site public.",
            "phone": "Phone",
            "email": "Email de contact",
            "location": "Address / localisation",
            "locationPlaceholder": "Kinshasa, RD Congo",
            "facebookUrl": "URL Facebook",
            "twitterUrl": "URL X / Twitter",
            "instagramUrl": "URL Instagram",
            "currency": "Currency"
          },
          "locale": {
            "title": "Locale",
            "language": "Langue",
            "timezone": "Fuseau horaire"
          },
          "booking": {
            "title": "Booking",
            "holdMinutes": "Fromrée de retenue (minutes)",
            "allowGuestCheckout": "Totoriser la commande invité"
          },
          "loyalty": {
            "title": "Fidélité OneKey",
            "description": "Points crédités après paiement confirmé : floor(montant en centimes / 100) × taux ci-dessous.",
            "enabled": "Activer le crédit de points OneKey",
            "pointsPerMajorUnit": "Points par unité majeure de devise",
            "programCode": "Code programme"
          },
          "branding": {
            "title": "Branding",
            "displayName": "Name affiché",
            "primaryColor": "Couleur primaire",
            "primaryColorHint": "Couleur dominante de l'interface (boutons, liens, accents).",
            "secondaryColor": "Couleur secondaire",
            "secondaryColorHint": "Couleur d'accompagnement (badges, éléments secondaires).",
            "logoUrl": "URL du logo",
            "uploading": "Upload en cours…",
            "chooseLogo": "Choisir un logo local",
            "logoFormatHint": "PNG/JPG/SVG/WebP, max 2 MB",
            "faviconUrl": "URL de l'icône (favicon)",
            "chooseFavicon": "Choisir une icône locale",
            "faviconFormatHint": "PNG/ICO/SVG, max 2 MB"
          },
          "authVisual": {
            "title": "Panneau connexion"
          }
        },
        "preview": {
          "title": "Preview live",
          "description": "Le rendu se met a jour instantanement, sans sauvegarde.",
          "logoAlt": "Logo organisation",
          "adminBadge": "Admin",
          "primaryButton": "Bouton principal"
        }
      },
      "colorPalette": {
        "contrastWarning": "Contraste insuffisant avec le texte blanc : {ratio} (minimum {min} pour WCAG AA). Les boutons et liens actifs peuvent être difficiles à lire.",
        "currentAria": "Couleur actuelle ({value})",
        "currentTitle": "Couleur enregistrée — {value}",
        "currentLabel": "Actuelle",
        "selection": "Sélection :",
        "swatches": {
          "atg-primary": "Vert ATG",
          "atg-primary-hover": "Vert foncé",
          "atg-primary-light": "Vert clair",
          "forest": "Forêt",
          "emerald": "Émeraude",
          "teal": "Sarcelle",
          "atg-secondary": "Secondaire ATG",
          "lime": "Lime",
          "gold": "Or",
          "amber": "Ambre",
          "sunset": "Coucher de soleil",
          "ocean": "Océan",
          "indigo": "Indigo",
          "slate": "Ardoise",
          "earth": "Terre",
          "burgundy": "Bordeaux"
        }
      },
      "authVisual": {
        "description": "Icônes décoratives affichées sur le panneau vert de connexion / inscription.",
        "reset": "Réinitialiser",
        "add": "Ajouter une icône",
        "empty": "None icône configurée. Ajoutez-en une ou réinitialisez les valeurs par défaut.",
        "iconLabel": "Icône {n}",
        "remove": "Supprimer",
        "type": "Type",
        "position": "Position",
        "size": "Taille",
        "opacity": "Opacité ({n}%)",
        "imageUrl": "URL de l'image",
        "uploading": "Upload en cours…",
        "chooseImage": "Choisir une image locale",
        "preview": "Preview",
        "presets": {
          "pin": "Épingle (localisation)",
          "compass": "Boussole",
          "globe": "Globe",
          "star": "Étoile",
          "custom": "Image personnalisée"
        },
        "positions": {
          "bottom-right": "Bas droite",
          "top-right": "Haut droite",
          "bottom-left": "Bas gauche",
          "top-left": "Haut gauche"
        },
        "sizes": {
          "sm": "Petite",
          "md": "Moyenne",
          "lg": "Grande"
        }
      },
      "emails": {
        "page": {
          "title": "Emails",
          "intro": "Personnalisez l'apparence des e-mails transactionnels (bienvenue, confirmation de réservation).",
          "denied": "Vous n'avez pas la permission de consulter les paramètres e-mail."
        },
        "form": {
          "validation": {
            "displayNameRequired": "Le nom affiché est obligatoire."
          },
          "success": "Settings e-mail enregistrés.",
          "upload": {
            "invalidImage": "Veuillez sélectionner une image valide.",
            "tooLarge": "Image trop lourde (max 2 MB).",
            "failed": "Échec de l'upload du logo. Réessayez."
          },
          "displayName": "Name affiché",
          "logoUrl": "URL du logo",
          "chooseLogo": "Choisir un logo local",
          "logoFormatHint": "PNG/JPG/SVG/WebP, max 2 MB",
          "logoPreview": "Preview du logo",
          "primaryColor": "Couleur primaire",
          "primaryColorHint": "Couleur dominante des e-mails (en-têtes, boutons).",
          "secondaryColor": "Couleur secondaire",
          "secondaryColorHint": "Couleur d'accompagnement (optionnel).",
          "footerText": "Texte de pied de page",
          "footerPlaceholder": "© Africa Tourism Gate — All droits réservés",
          "welcomeSubject": "Sujet — e-mail de bienvenue",
          "welcomeSubjectPlaceholder": "Bienvenue chez {displayName}",
          "welcomeSubjectHint": "Variables : {displayName}",
          "bookingSubject": "Sujet — confirmation de réservation",
          "bookingSubjectPlaceholder": "Confirmation de réservation — {ref}",
          "bookingSubjectHint": "Variables : {ref}, {displayName}",
          "previewTemplate": "Modèle à prévisualiser",
          "templateWelcome": "Bienvenue (création de compte)",
          "templateBooking": "Confirmation de réservation",
          "previewing": "Prévisualisation…",
          "previewButton": "Prévisualiser",
          "save": "Save",
          "cancel": "Annuler",
          "saving": "Enregistrement…",
          "dirty": "Modifications non enregistrées",
          "clean": "None modification en attente",
          "readOnlyHint": "Vous pouvez consulter ces paramètres mais pas les modifier (permission organization_settings.write requise)."
        },
        "preview": {
          "closeAria": "Fermer la prévisualisation",
          "title": "Prévisualisation",
          "subject": "Sujet :",
          "close": "Fermer",
          "iframeTitle": "Preview e-mail"
        }
      },
      "bankAccounts": {
        "page": {
          "title": "Comptes bancaires",
          "intro": "Comptes B2B de l'organisation pour les virements et paiements hors ligne.",
          "denied": "Vous n'avez pas la permission de consulter les comptes bancaires."
        },
        "list": {
          "deleteConfirm": "Supprimer ce compte bancaire ?",
          "columns": {
            "bank": "Banque",
            "account": "Compte",
            "accountNumber": "N° compte",
            "currency": "Currency",
            "isDefault": "Défaut"
          },
          "newButton": "Nouveau compte",
          "orgSelectAria": "Organization",
          "empty": "Tocun compte bancaire."
        },
        "form": {
          "validation": {
            "bankNameRequired": "Le nom de la banque est obligatoire.",
            "accountNameRequired": "Le nom du compte est obligatoire.",
            "accountNumberRequired": "Le numéro de compte est obligatoire.",
            "accountNumberNoMask": "Saisissez le numéro complet (sans masque).",
            "currencyInvalid": "La devise doit comporter 3 lettres (ex. USD, CDF)."
          },
          "editTitle": "Modifier le compte",
          "createTitle": "Nouveau compte bancaire",
          "bankName": "Banque",
          "accountName": "Name du compte",
          "accountNumberEdit": "Numéro de compte (laisser vide pour conserver)",
          "accountNumberCreate": "Numéro de compte / IBAN",
          "storedValue": "Valeur enregistrée: {masked}",
          "swiftBic": "SWIFT / BIC",
          "currency": "Currency",
          "isDefault": "Compte par défaut",
          "update": "Mettre à jour",
          "create": "Créer",
          "cancel": "Annuler",
          "save": "Save",
          "saving": "Enregistrement…",
          "dirty": "Modifications non enregistrées",
          "clean": "None modification en attente"
        }
      }
    }
  },
  "es": {
    "common": {
      "accountStatus": {
        "active": "Activo",
        "suspended": "Suspendido",
        "deleted": "Eliminado"
      },
      "boolean": {
        "yes": "Sí",
        "no": "No"
      },
      "empty": {
        "dash": "—"
      },
      "filters": {
        "all": "Todos",
        "allFeminine": "Todas",
        "none": "Ninguna",
        "clear": "Borrar filtro",
        "apply": "Aplicar",
        "dateFrom": "Desde",
        "dateTo": "Hasta",
        "searchByEmailOrName": "Buscar por correo o nombre…",
        "searchByEmailOrNameAria": "Buscar por correo o nombre",
        "searchByNameOrSlug": "Buscar por nombre o slug…",
        "searchByNameOrSlugAria": "Buscar por nombre o slug"
      },
      "columns": {
        "user": "Usuario",
        "organization": "Organización",
        "status": "Estado",
        "actions": "Acciones",
        "date": "Fecha",
        "type": "Tipo",
        "amount": "Importe",
        "client": "Cliente",
        "label": "Etiqueta",
        "address": "Dirección",
        "country": "País",
        "default": "Predeterminado",
        "provider": "Proveedor",
        "method": "Método",
        "role": "Rol",
        "quantityShort": "Cant.",
        "unitPrice": "Precio unitaire",
        "dates": "Fechas",
        "booking": "Reserva",
        "employees": "Empleados",
        "end": "Fin",
        "addedAt": "Añadido el",
        "slug": "Slug",
        "name": "Apellido",
        "preview": "Vista previa",
        "url": "URL",
        "caption": "Légende",
        "sortOrder": "Ordre",
        "source": "Source",
        "price": "Precio",
        "basePrice": "Precio de base",
        "discount": "Descuento",
        "total": "Total",
        "active": "Activo",
        "capacity": "Capacidad",
        "duration": "Desderée",
        "difficulty": "Dificultad",
        "rating": "Note",
        "iata": "IATA",
        "city": "Ville",
        "code": "Code",
        "route": "Trajet",
        "period": "Période",
        "start": "Début",
        "arrival": "Arrivée",
        "departure": "Salida",
        "nights": "Nuits",
        "year": "Année",
        "line": "Ligne",
        "ship": "Barco",
        "itinerary": "Itinerario",
        "licensePlate": "Immatriculation",
        "pricePerDay": "Precio / jour",
        "exampleModel": "Modèle type",
        "reserved": "Réservés",
        "available": "Disponibles",
        "product": "Produit",
        "category": "Catégorie"
      },
      "pagination": {
        "session": "session",
        "address": "adresse",
        "paymentMethod": "moyen de paiement",
        "user": "utilisateur",
        "organization": "organisation",
        "booking": "réservation",
        "line": "ligne",
        "payment": "paiement",
        "property": "hébergement",
        "room": "chambre",
        "flight": "vol",
        "vehicle": "véhicule",
        "sailing": "départ",
        "destination": "destination",
        "package": "forfait",
        "provider": "fournisseur",
        "category": "catégorie",
        "agency": "agence",
        "airport": "aéroport",
        "airline": "compagnie",
        "ship": "navire",
        "itinerary": "itinéraire",
        "port": "port",
        "amenity": "équipement",
        "review": "avis",
        "ticket": "tickets",
        "loyaltyAccount": "comptes"
      },
      "loading": "Cargando…",
      "sessionStatus": {
        "active": "Active",
        "expired": "Expirada",
        "title": "Sesión"
      },
      "dates": {
        "createdAt": "Creada el",
        "expiresAt": "Expira el"
      },
      "select": {
        "choose": "Choisir…",
        "chooseDash": "— Choisir —",
        "chooseFeminine": "— Choisir —"
      },
      "back": {
        "toList": "← Volver à la liste"
      },
      "form": {
        "description": "Descripción",
        "currency": "Moneda",
        "optional": "Optionnel",
        "priceCents": "Precio (centimes)",
        "basePriceCents": "Precio de base (centimes)",
        "dailyPriceCents": "Precio journalier (centimes)",
        "pricePerNightCents": "Precio/nuit (centimes)",
        "priceCentsShort": "Precio (centimes)",
        "durationMinutes": "Desderée (minutes)",
        "durationMinutesOptional": "Desderée (minutes, optionnel)",
        "durationNights": "Desderée (nuits)",
        "durationDays": "Desderée (jours)",
        "dateFrom": "Desde",
        "dateTo": "Hasta",
        "latitude": "Latitude",
        "longitude": "Longitude",
        "externalUrlOptional": "URL externe (optionnel si upload)",
        "displayOrder": "Ordre d'affichage",
        "image": "Image",
        "chooseFile": "Choisir un fichier",
        "uploading": "Upload en cours…",
        "imageFormatHint": "JPEG, PNG ou WebP, max 5 Mo",
        "centsHint": "Ex. 8500 = 85,00",
        "urlPlaceholder": "https://..."
      },
      "validation": {
        "nameRequired": "El apellido es obligatorio.",
        "titleRequired": "Le titre est obligatoire.",
        "slugRequired": "Le slug est obligatoire.",
        "slugInvalid": "Slug invalide (minuscules, chiffres, tirets).",
        "slugInvalidLong": "Slug invalide : minuscules, chiffres et tirets uniquement (ex. kinshasa).",
        "destinationRequired": "La destination est obligatoire.",
        "providerRequired": "Le fournisseur est obligatoire.",
        "invalidPriceCents": "Precio invalide (centimes).",
        "invalidPrice": "Precio invalide.",
        "invalidCapacity": "Capacidad invalide.",
        "invalidSeats": "Apellidobre de sièges invalide.",
        "invalidSeatsShort": "Sièges invalides.",
        "invalidStock": "Stock invalide.",
        "invalidDuration": "Desderée invalide.",
        "invalidDurationMinutes": "Desderée invalide (minutes).",
        "currencyThreeLetters": "Moneda à 3 lettres.",
        "currencyThreeLettersExample": "Moneda à 3 lettres (ex. USD).",
        "starRatingRange": "Note entre 0 et 5.",
        "countryCodeTwoLetters": "Le code pays doit comporter 2 lettres (ex. CD, KE).",
        "coordsBothRequired": "Renseignez latitude et longitude ensemble.",
        "latitudeInvalid": "Latitude invalide (−90 à 90).",
        "latitudeOutOfRange": "Latitude hors plage (-90 à 90).",
        "longitudeInvalid": "Longitude invalide (−180 à 180).",
        "longitudeOutOfRange": "Longitude hors plage (-180 à 180).",
        "imageFormat": "Format accepté : JPEG, PNG ou WebP.",
        "imageTooLarge": "Image trop lourde (max 5 Mo).",
        "sessionExpiredRetry": "Sesión expirée. Reconnectez-vous puis réessayez.",
        "urlRequired": "L'URL est obligatoire.",
        "uploadFailed": "Impossible d'uploader l'image locale.",
        "dateRangeInvalid": "La date de début doit être avant la date de fin.",
        "discountRange": "La remise doit être entre 0 et 100.",
        "durationDaysRange": "La durée doit être entre 1 et 365 jours.",
        "selectProduct": "Sélectionnez un produit.",
        "invalidCabinCount": "Apellidobre de cabines invalide.",
        "datesRequired": "Les dates de début et de fin sont obligatoires.",
        "iataAndNameRequired": "Code IATA (2 lettres) et nom sont obligatoires."
      },
      "toast": {
        "saved": "Enregistré",
        "saveError": "Error al guardar",
        "deleteError": "Erreur de suppression",
        "availabilitySaved": "Disponibilité enregistrée",
        "availabilityDeleted": "Disponibilité supprimée",
        "amenitiesSavedTitle": "Equipamientos enregistrés",
        "amenitiesSavedMessage": "La sélection a été mise à jour.",
        "propertySavedTitle": "Alojamiento enregistré",
        "deletedProperty": "L'hébergement « {name} » a été supprimé."
      },
      "availabilityCalendar": {
        "previousMonth": "Mois précédent",
        "nextMonth": "Mois suivant",
        "today": "Hastajourd'hui",
        "weekdays": {
          "mon": "lun.",
          "tue": "mar.",
          "wed": "mer.",
          "thu": "jeu.",
          "fri": "ven.",
          "sat": "sam.",
          "sun": "dim."
        },
        "bulkSuccess": "{count} jour(s) mis à jour.",
        "stockUnits": "Stock (unités)",
        "availableSeats": "Sièges disponibles",
        "seatsAria": "Sièges {date}"
      },
      "imagesGallery": {
        "title": "Photos",
        "titleProperty": "Images",
        "titlePackage": "Galerie photos",
        "intro": "Gérez les photos de cet élément.",
        "introPackage": "Ajoutez des photos manuellement ou choisissez parmi les images des produits inclus.",
        "newPhoto": "Nouvelle photo",
        "editPhoto": "Modifier la photo",
        "addPhoto": "Ajouter une photo",
        "deleteConfirm": "Supprimer cette image ?",
        "emptyDefault": "Ninguna photo.",
        "emptyRoom": "Ninguna photo pour cette chambre.",
        "emptyProperty": "Ninguna image.",
        "emptyPackage": "Ninguna photo dans la galerie du forfait.",
        "sourceIncluded": "Produit inclus",
        "sourceManual": "Manuelle",
        "suggestionsTitle": "Suggestions depuis la composition",
        "suggestionsLoading": "Chargement des suggestions…",
        "suggestionsEmpty": "Ninguna photo disponible dans les produits inclus. Ajoutez des produits au forfait ou uploadez une photo manuellement.",
        "alreadyAdded": "Ajoutée",
        "addFromSuggestion": "Ajouter"
      },
      "flightClass": {
        "economy": "Económica",
        "premium_economy": "Económica premium",
        "business": "Ejecutiva",
        "first": "Primera"
      },
      "packageItemType": {
        "property": "Alojamiento",
        "flight": "Vuelo",
        "vehicle": "Vehículo",
        "cruise": "Camarote (croisière)",
        "activity": "Actividad"
      },
      "activityDifficulty": {
        "unspecified": "— No renseignée —",
        "easy": "Fácil",
        "moderate": "Moderada",
        "hard": "Difícil",
        "expert": "Experto"
      },
      "vehicleAvailabilityStatus": {
        "available": "Disponible",
        "maintenance": "Mantenimiento",
        "rented": "Alquilado"
      },
      "vehicleSpecs": {
        "seats": "Places",
        "transmission": "Transmission",
        "fuel": "Carburant",
        "transmissionManual": "Manuelle",
        "transmissionAutomatic": "Hastatomatique",
        "fuelPetrol": "Essence",
        "fuelDiesel": "Diesel",
        "fuelHybrid": "Hybride"
      },
      "packageStatus": {
        "active": "Activo",
        "inactive": "Inactivo"
      },
      "seatsCount": "{count} sièges",
      "maxGuests": "{count} voyageurs max",
      "daysCount": "{count} jour",
      "daysCountPlural": "{count} jours",
      "productsCount": "{count} produit",
      "productsCountPlural": "{count} produits",
      "photosCount": "{count} photo",
      "photosCountPlural": "{count} photos",
      "rbacScope": {
        "scopeTypes": {
          "global": "Global",
          "property": "Propiedad",
          "agency": "Agencia",
          "support_queue": "File support"
        },
        "global": "Global",
        "property": "Établissement",
        "agency": "Agencia",
        "support_queue": "File support",
        "withId": "{label} · {idPrefix}…"
      }
    },
    "users": {
      "list": {
        "newUser": "Nuevo usuario",
        "emptyDefault": "Hastacun utilisateur pour le moment.",
        "emptyFiltered": "Hastacun utilisateur ne correspond à vos critères.",
        "ariaLabel": "Lista de usuarios",
        "deleteConfirm": "¿Eliminar usuario « {email} »? Esta acción es reversible en la base de datos."
      },
      "filters": {
        "status": "Estado",
        "organization": "Organización",
        "role": "Rol"
      },
      "form": {
        "email": "Correo",
        "passwordCreate": "Contraseña",
        "passwordEdit": "Nueva contraseña (opcional)",
        "passwordHintCreate": "Mínimo 8 caracteres.",
        "passwordHintEdit": "Deje vacío para conservar la contraseña actual.",
        "firstName": "Apellidobre",
        "lastName": "Apellido",
        "phone": "Teléfono",
        "preferredLanguage": "Idioma preferido",
        "preferredLanguageHint": "Código ISO de 2 letras (ej. fr, en).",
        "organization": "Organización",
        "organizationNone": "Ninguna",
        "status": "Estado",
        "submitCreate": "Crear usuario",
        "submitEdit": "Guardar",
        "validation": {
          "emailRequired": "La dirección de correo es obligatoria.",
          "passwordMinLength": "La contraseña debe tener al menos 8 caracteres.",
          "firstNameRequired": "El nombre es obligatorio.",
          "lastNameRequired": "El apellido es obligatorio."
        }
      },
      "detail": {
        "title": "Editar usuario",
        "tabsAria": "Secciones de la cuenta de usuario",
        "tabs": {
          "profile": "Perfil",
          "addresses": "Direccións",
          "paymentMethods": "Métodos de pago",
          "sessions": "Sesións",
          "roles": "Rols"
        }
      },
      "userIdFilter": {
        "label": "Usuario",
        "allUsers": "Todos les utilisateurs"
      },
      "addresses": {
        "emptyDefault": "Ninguna adresse enregistrée.",
        "emptyFiltered": "Ninguna adresse pour cet utilisateur.",
        "ariaLabel": "Liste des adresses utilisateur"
      },
      "paymentMethods": {
        "lastFourMasked": "•••• {lastFour}",
        "emptyDefault": "Hastacun moyen de paiement enregistré.",
        "emptyFiltered": "Hastacun moyen de paiement pour cet utilisateur.",
        "ariaLabel": "Liste des moyens de paiement"
      },
      "sessions": {
        "revokeConfirm": "¿Revocar esta sesión? El usuario deberá volver a iniciar sesión.",
        "emptyDefault": "Ninguna session active.",
        "emptyFiltered": "Ninguna session active pour cet utilisateur.",
        "ariaLabel": "Liste des sessions utilisateur"
      },
      "stats": {
        "total": {
          "label": "Usuarios",
          "subtitle": "Cuentas registradas"
        },
        "active": {
          "label": "Activos",
          "subtitle": "Cuentas activas"
        },
        "suspended": {
          "label": "Suspendidos",
          "subtitle": "Cuentas suspendidas"
        },
        "employees": {
          "label": "Empleados",
          "subtitle": "Perfils employés"
        }
      },
      "roles": {
        "assignedTitle": "Rols assignés",
        "empty": "Hastacun rôle actif pour cet utilisateur.",
        "assignFormTitle": "Assigner un rôle",
        "user": "Usuario",
        "role": "Rol",
        "selectPlaceholder": "Sélectionner…",
        "scope": "Périmètre (scope)",
        "scopeId": "ID du scope (UUID)",
        "scopeIdHint": "Ex. ID propriété, agence ou file support.",
        "expiresAt": "Expiration (optionnel)",
        "superAdminWarning": "Réservé aux super administrateurs — périmètre forcé à Global.",
        "superAdminConfirm": "¿Asignar el rol « {roleName} »? Este usuario obtendrá acceso completo a la plataforma.",
        "validation": {
          "userAndRoleRequired": "Usuario et rôle sont obligatoires.",
          "scopeIdRequired": "El identificador de ámbito es obligatorio para este ámbito."
        },
        "scopeTypes": {
          "global": "Global",
          "property": "Propiedad",
          "agency": "Agencia",
          "support_queue": "File support"
        },
        "scopeDisplay": {
          "global": "Global",
          "property": "Établissement",
          "agency": "Agencia",
          "support_queue": "File support",
          "withId": "{label} · {idPrefix}…"
        },
        "revokeDialog": {
          "title": "Révoquer le rôle",
          "description": "Retirer ce rôle pour cet utilisateur ?"
        },
        "toast": {
          "revokedTitle": "Rol révoqué",
          "revokedMessage": "La asignación fue retirada.",
          "revokeFailedTitle": "Échec de la révocation"
        }
      }
    },
    "organizations": {
      "list": {
        "emptyTitleSearch": "Ninguna organisation ne correspond à votre recherche",
        "emptyTitleDefault": "Ninguna organisation pour le moment",
        "emptyDescriptionSearch": "Essayez un autre nom ou slug.",
        "emptyDescriptionDefault": "Créez une organisation partenaire pour commencer.",
        "emptyTableSearch": "Ninguna organisation ne correspond à votre recherche.",
        "emptyTableDefault": "Ninguna organisation pour le moment.",
        "ariaLabel": "Liste des organisations",
        "columns": {
          "type": "Tipo"
        },
        "deleteDialog": {
          "title": "Eliminar organización",
          "description": "Eliminar organización « {name} » ? Cette action est réversible côté base."
        }
      },
      "form": {
        "sections": {
          "identity": "Identidad",
          "contact": "Contacto",
          "legal": "Legal",
          "configuration": "Configuración"
        },
        "name": "Apellido",
        "slug": "Slug",
        "slugHint": "Identificador único en la URL (ej. africa-tourism-gate).",
        "description": "Descripción",
        "website": "Site web",
        "websitePlaceholder": "https://",
        "contactEmail": "Correo de contact",
        "contactPhone": "Teléfono",
        "legalForm": "Forme juridique",
        "rccm": "RCCM",
        "rccmHint": "Registre du Commerce et du Crédit Mobilier",
        "idNat": "ID. Nat.",
        "idNatHint": "Identification Nationale",
        "nif": "NIF",
        "nifHint": "Número de Identificación Fiscal",
        "cnss": "CNSS",
        "cnssHint": "Caisse Nationale de Sécurité Sociale",
        "currency": "Moneda",
        "status": "Estado",
        "submitCreate": "Crear organización",
        "submitEdit": "Guardar",
        "validation": {
          "nameRequired": "El apellido es obligatorio.",
          "slugRequired": "Le slug est obligatoire.",
          "slugInvalid": "Slug invalide : minuscules, chiffres et tirets uniquement (ex. mon-organisation).",
          "currencyInvalid": "La devise doit comporter 3 lettres (ex. USD, CDF)."
        },
        "toast": {
          "savedTitle": "Organización enregistrée",
          "errorTitle": "Error al guardar"
        }
      },
      "legalForm": {
        "unspecified": "No renseigné",
        "SARL": "SARL",
        "SA": "SA",
        "SAS": "SAS",
        "Ets": "Établissement (Ets)",
        "SNC": "SNC",
        "ASBL": "ASBL"
      },
      "detail": {
        "title": "Organización",
        "tabsAria": "Secciones de la organización",
        "tabs": {
          "infos": "Info",
          "users": "Usuarios",
          "settings": "Ajustes"
        },
        "settingsIntro": "Configuración de la organización: datos de contacto, idioma, reservas y marca."
      },
      "selector": {
        "defaultLabel": "Organización"
      }
    },
    "bookings": {
      "status": {
        "draft": "Borrador",
        "pending_payment": "Pendiente de paiement",
        "confirmed": "Confirmada",
        "cancelled": "Cancelada",
        "refunded": "Reembolsada"
      },
      "itemTypes": {
        "room": "Habitación",
        "flight_class": "Vuelo",
        "vehicle": "Vehículo",
        "cabin": "Camarote",
        "activity_schedule": "Actividad",
        "package": "Paquete"
      },
      "catalogLink": {
        "referencePrefix": "Réf. {idPrefix}",
        "ariaLabel": "Voir {typeLabel} : {title}"
      },
      "list": {
        "emptyDefault": "Ninguna réservation pour le moment.",
        "emptyFiltered": "Ninguna réservation ne correspond à vos critères.",
        "ariaLabel": "Liste des réservations",
        "filters": {
          "client": "Cliente"
        }
      },
      "itemsList": {
        "filters": {
          "type": "Tipo",
          "bookingStatus": "Estado réservation",
          "bookingId": "ID réservation",
          "bookingIdPlaceholder": "UUID complet"
        },
        "emptyDefault": "Ninguna ligne de réservation pour le moment.",
        "emptyFiltered": "Ninguna ligne ne correspond à vos critères.",
        "ariaLabel": "Líneas de réservation"
      },
      "detail": {
        "title": "Reserva",
        "backLink": "Volver aux réservations",
        "reference": "Réf. {idPrefix}",
        "sections": {
          "client": "Cliente",
          "status": "Estado",
          "actions": "Acciones",
          "bookingLines": "Líneas de réservation",
          "payments": "Pagos"
        },
        "clientFields": {
          "email": "Correo",
          "name": "Apellido",
          "organization": "Organización",
          "total": "Total",
          "createdAt": "Creada el"
        },
        "actions": {
          "changeStatus": "Changer le statut",
          "statusReason": "Motivo (historique)",
          "statusReasonPlaceholder": "Ex. confirmation manuelle, remboursement…",
          "applyStatus": "Aplicar le statut",
          "cancellation": "Cancelación",
          "cancelReason": "Motivo de cancelación",
          "cancelReasonPlaceholder": "Ex. demande client, indisponibilité…",
          "cancelBooking": "Annuler la réservation",
          "readOnly": "Modification réservée aux comptes avec la permission bookings.write."
        },
        "linesEmpty": "Ninguna ligne.",
        "linesAriaLabel": "Líneas de réservation",
        "paymentsEmpty": "Hastacun paiement enregistré pour cette réservation.",
        "paymentsAriaLabel": "Pagos",
        "statusDialog": {
          "title": "Confirmer le changement de statut",
          "description": "Passer la réservation de « {fromStatus} » à « {toStatus} » ?{reasonSuffix}",
          "reasonSuffix": " Motivo : {reason}"
        },
        "cancelDialog": {
          "title": "Annuler la réservation",
          "description": "Annuler cette réservation ? Le stock des produits sera libéré (moteur de réservation).",
          "confirm": "Annuler la réservation",
          "cancel": "Volver"
        },
        "paymentStatus": {
          "pending": "Pendiente",
          "succeeded": "Exitoso",
          "failed": "Fallido",
          "refunded": "Reembolsado"
        }
      },
      "timeline": {
        "progressAria": "Progression du statut de réservation",
        "finalStatus": "Estado final",
        "history": "Historial",
        "historyAria": "Historial des changements de statut",
        "historyEmpty": "Hastacun changement de statut enregistré.",
        "transition": "{fromStatus} → {toStatus}"
      },
      "stats": {
        "bookings": {
          "total": {
            "label": "Reservas",
            "subtitle": "Todas les réservations"
          },
          "confirmed": {
            "label": "Confirmadas",
            "subtitle": "Reservas confirmées"
          },
          "pending_payment": {
            "label": "Pendiente",
            "subtitle": "Paiement en attente"
          },
          "lines": {
            "label": "Líneas",
            "subtitle": "Articles réservés"
          }
        },
        "items": {
          "total": {
            "label": "Líneas",
            "subtitle": "Todas les lignes"
          },
          "confirmed": {
            "label": "Confirmadas",
            "subtitle": "Líneas de réservations confirmées"
          },
          "pending_payment": {
            "label": "Pendiente",
            "subtitle": "Líneas en attente de paiement"
          },
          "bookings": {
            "label": "Reservas",
            "subtitle": "Voir toutes les réservations"
          }
        }
      }
    },
    "payments": {
      "status": {
        "pending": "Pendiente",
        "succeeded": "Exitoso",
        "failed": "Fallido",
        "refunded": "Reembolsado"
      },
      "providers": {
        "stripe": "Stripe",
        "cash": "Efectivo"
      },
      "refundLabels": {
        "partial": "Remboursement partiel",
        "full": "Remboursement total",
        "generic": "Remboursement"
      },
      "subnav": {
        "ariaLabel": "Navigation paiements et promotions",
        "transactions": "Transacciones",
        "promoCodes": "Codes promo",
        "promotions": "Promociones"
      },
      "list": {
        "emptyDefault": "Hastacun paiement pour le moment.",
        "emptyFiltered": "Hastacun paiement ne correspond à vos critères.",
        "ariaLabel": "Liste des paiements",
        "accessDenied": "Acceso denegado: se requiere el permiso payments.read.",
        "notFoundError": "Paiement introuvable.",
        "toast": {
          "refundSuccessTitle": "Remboursement effectué",
          "refundSuccessMessage": "{amount} remboursé avec succès."
        }
      },
      "detail": {
        "title": "Détail du paiement",
        "sections": {
          "summary": "Resumen",
          "stripeIds": "Identifiants Stripe",
          "booking": "Reserva",
          "refundHistory": "Historial des remboursements"
        },
        "fields": {
          "amount": "Importe",
          "status": "Estado",
          "method": "Método",
          "date": "Fecha",
          "client": "Cliente",
          "stripePaymentIntent": "Payment Intent Stripe",
          "internalPaymentId": "ID paiement (interne)",
          "viewBooking": "Voir la réservation",
          "stripeStatus": "Stripe : {status}"
        },
        "refundHistoryEmpty": "Hastacun remboursement enregistré.",
        "cancelBookingFirst": "Reembolso Stripe: cancele primero la reserva."
      },
      "refundModal": {
        "title": "Confirmer le remboursement",
        "description": "Remboursement Stripe — maximum remboursable : {maxAmount}.",
        "refundTypeLegend": "Tipo de remboursement",
        "refundTypeTotal": "Total ({amount})",
        "refundTypePartial": "Parcial",
        "partialAmountLabel": "Importe partiel ({currency})",
        "partialAmountPlaceholder": "Ex. 10,00",
        "partialAmountHint": "Maximum : {maxAmount}",
        "reasonLabel": "Raison du remboursement",
        "reasonPlaceholder": "Ex. Cancelación client, erreur de facturation…",
        "reasonHint": "Minimum {minLength} caractères (usage interne, non envoyé à Stripe).",
        "preview": "Vista previa",
        "previewRefunded": "Importe remboursé",
        "previewRemaining": "Reste remboursable",
        "previewReason": "Motivo",
        "confirm": "Confirmer le remboursement",
        "validation": {
          "reasonMinLength": "La raison doit contenir au moins {minLength} caractères.",
          "noRefundableAmount": "Hastacun montant remboursable restant.",
          "partialAmountRequired": "Indiquez un montant partiel.",
          "partialAmountInvalid": "Importe partiel invalide.",
          "partialAmountExceeds": "Le montant ne peut pas dépasser {maxAmount}."
        }
      },
      "stats": {
        "total": {
          "label": "Transacciones",
          "subtitle": "Todos les paiements"
        },
        "succeeded": {
          "label": "Exitosos",
          "subtitle": "Pagos encaissés"
        },
        "pending": {
          "label": "Pendiente",
          "subtitle": "Pagos pending"
        },
        "revenue": {
          "label": "Ingresos",
          "subtitle": "Total paiements réussis"
        }
      }
    },
    "properties": {
      "list": {
        "newProperty": "Nouvel hébergement",
        "amenitiesLink": "Equipamientos",
        "emptyDefault": "Hastacun hébergement pour le moment.",
        "ariaLabel": "Liste des hébergements",
        "searchPlaceholder": "Buscar por nombre o slug…",
        "searchAria": "Rechercher un hébergement"
      },
      "filters": {
        "destination": "Destino"
      },
      "columns": {
        "property": "Alojamiento",
        "destination": "Destino",
        "propertyType": "Tipo"
      },
      "dialogs": {
        "deleteTitle": "Supprimer l'hébergement",
        "deleteDescription": "Supprimer l'hébergement « {name} » ? Cette action est irréversible."
      },
      "form": {
        "submitCreate": "Créer l'hébergement",
        "sections": {
          "identity": "Identidad",
          "location": "Localisation",
          "classification": "Classification"
        },
        "name": "Apellido",
        "slug": "Slug",
        "type": "Tipo",
        "destination": "Destino",
        "address": "Dirección",
        "starRating": "Classement (étoiles)",
        "starRatingHint": "Optionnel, 0 à 5",
        "validation": {
          "destinationRequired": "La destination est obligatoire."
        }
      },
      "status": {
        "propertyType": {
          "hotel": "Hotel",
          "resort": "Resort",
          "apartment": "Apartamento",
          "villa": "Villa",
          "hostel": "Hastaberge",
          "other": "Hastatre"
        }
      },
      "detail": {
        "title": "Modifier l'hébergement",
        "backToList": "← Volver à la liste",
        "tabsAria": "Sections de l'hébergement",
        "tabs": {
          "infos": "Info",
          "rooms": "Habitacións",
          "amenities": "Equipamientos",
          "availability": "Disponibilidad"
        }
      },
      "sections": {
        "rooms": {
          "title": "Habitacións",
          "intro": "Tipos de chambres pour cet hébergement.",
          "addRoom": "Ajouter une chambre",
          "newRoom": "Nouvelle chambre",
          "editRoom": "Modifier la chambre",
          "roomType": "Tipo de chambre",
          "roomTypePlaceholder": "standard, suite…",
          "maxCapacity": "Capacidad max.",
          "bedConfig": "Configuración lits",
          "empty": "Ninguna chambre.",
          "deleteConfirm": "Supprimer la chambre « {name} » ?",
          "photosAction": "Photos"
        },
        "amenities": {
          "title": "Equipamientos",
          "intro": "Sélectionnez les équipements disponibles pour cet hébergement.",
          "saveSelection": "Guardar la sélection",
          "emptyGlobal": "Hastacun équipement global.",
          "createLink": "Créer des équipements"
        },
        "availability": {
          "title": "Disponibilidad",
          "loadingRooms": "Chargement des chambres…",
          "room": "Habitación",
          "stockHint": "Stock et prix par nuit ({currency}).",
          "noRooms": "Ninguna chambre pour cet hébergement. Créez une chambre pour gérer les disponibilités.",
          "goToRoomsTab": "Aller à l'onglet Habitacións",
          "roomMismatch": "Cette chambre n'appartient pas à cet hébergement."
        }
      },
      "amenitiesList": {
        "newAmenity": "Nouvel équipement",
        "empty": "Hastacun équipement.",
        "searchPlaceholder": "Rechercher un équipement…",
        "deleteConfirm": "Supprimer l'équipement « {name} » ?",
        "ariaLabel": "Liste des équipements"
      },
      "stats": {
        "properties": {
          "label": "Alojamientos",
          "subtitle": "Propiedads publiées"
        },
        "rooms": {
          "label": "Habitacións",
          "subtitle": "Tipos de chambres"
        },
        "amenities": {
          "label": "Equipamientos",
          "subtitle": "Référentiel global"
        },
        "destinations": {
          "label": "Destinos",
          "subtitle": "Zones géographiques"
        }
      }
    },
    "flights": {
      "list": {
        "newFlight": "Nouveau vol",
        "emptyDefault": "Hastacun vol pour le moment.",
        "emptySearch": "Hastacun vol ne correspond à ce code.",
        "searchPlaceholder": "Rechercher par code vol (ex. ET302)…",
        "searchAria": "Rechercher un vol",
        "deleteConfirm": "Supprimer le vol « {flightNumber} » ?"
      },
      "columns": {
        "flightNumber": "Code vol",
        "airline": "Aerolínea",
        "route": "Trajet",
        "departure": "Salida"
      },
      "form": {
        "submitCreate": "Créer le vol",
        "airline": "Aerolínea",
        "flightNumber": "Code vol",
        "flightNumberHint": "Ex. ET302, 9S101",
        "departure": "Salida",
        "arrival": "Arrivée",
        "departureTime": "Heure de départ",
        "arrivalTime": "Heure d'arrivée",
        "durationMinutes": "Desderée (minutes)",
        "durationHint": "Ex. 390 pour 6 h 30",
        "validation": {
          "airlineRequired": "Aerolínea obligatoire.",
          "flightNumberRequired": "Code vol obligatoire.",
          "departureAirportRequired": "Aeropuerto de départ obligatoire.",
          "arrivalAirportRequired": "Aeropuerto d'arrivée obligatoire.",
          "airportsMustDiffer": "Le départ et l'arrivée doivent être différents.",
          "departureTimeRequired": "Heure de départ obligatoire.",
          "arrivalTimeRequired": "Heure d'arrivée obligatoire."
        }
      },
      "detail": {
        "title": "Modifier le vol",
        "backLink": "Volver aux vols",
        "tabsAria": "Sections du vol",
        "tabs": {
          "flight": "Vuelo",
          "classes": "Classes"
        },
        "timelineAria": "Trajet du vol",
        "durationAria": "Desderée du vol : {label}"
      },
      "sections": {
        "classes": {
          "title": "Classes cabine",
          "intro": "Camarotes et tarifs de base pour ce vol.",
          "addClass": "Ajouter une classe",
          "newClass": "Nouvelle classe",
          "editClass": "Modifier la classe",
          "cabinType": "Tipo de cabine",
          "totalSeats": "Sièges totaux",
          "empty": "Ninguna classe cabine.",
          "deleteConfirm": "Supprimer cette classe ?"
        },
        "availability": {
          "title": "Disponibilidad",
          "backToFlight": "Volver au vol",
          "classMismatch": "Cette classe n'appartient pas à ce vol."
        }
      },
      "referential": {
        "airlines": {
          "new": "Nouvelle compagnie",
          "edit": "Modifier la compagnie",
          "emptyDefault": "Ninguna compagnie.",
          "emptySearch": "Ninguna compagnie ne correspond à cette recherche.",
          "searchPlaceholder": "Rechercher par code IATA ou nom…",
          "searchAria": "Rechercher une compagnie",
          "iataCode": "Code IATA",
          "deleteConfirm": "Supprimer « {name} » ?"
        },
        "airports": {
          "new": "Nouvel aéroport",
          "edit": "Modifier l'aéroport",
          "emptyDefault": "Hastacun aéroport.",
          "emptySearch": "Hastacun aéroport ne correspond à cette recherche.",
          "searchPlaceholder": "Rechercher par IATA, nom ou ville…",
          "searchAria": "Rechercher un aéroport",
          "airport": "Aeropuerto",
          "countryCode": "Code pays"
        }
      },
      "stats": {
        "flights": {
          "label": "Vuelos",
          "subtitle": "Líneas catalogue"
        },
        "classes": {
          "label": "Classes cabine",
          "subtitle": "Tarifs par vol"
        },
        "airlines": {
          "label": "Aerolíneas",
          "subtitle": "Référentiel IATA"
        },
        "airports": {
          "label": "Aeropuertos",
          "subtitle": "Référentiel mondial"
        }
      }
    },
    "locations": {
      "list": {
        "newVehicle": "Nouveau véhicule",
        "emptyDefault": "Hastacun véhicule pour le moment.",
        "emptyFiltered": "Hastacun véhicule ne correspond aux filtres.",
        "searchPlaceholder": "Rechercher par plaque…",
        "deleteConfirm": "Supprimer le véhicule « {label} » ?",
        "fallbackLabel": "Vehículo"
      },
      "filters": {
        "agency": "Agencia",
        "allAgencies": "Todas les agences"
      },
      "columns": {
        "agency": "Agencia",
        "category": "Catégorie",
        "licensePlate": "Immatriculation",
        "pricePerDay": "Precio / jour"
      },
      "form": {
        "submitCreate": "Créer le véhicule",
        "rentalAgency": "Agencia de location",
        "category": "Catégorie",
        "licensePlate": "Plaque d'immatriculation",
        "dailyPriceCents": "Precio journalier (centimes)",
        "validation": {
          "agencyRequired": "Agencia obligatoire.",
          "categoryRequired": "Catégorie obligatoire."
        }
      },
      "detail": {
        "title": "Modifier le véhicule",
        "backLink": "Volver aux véhicules"
      },
      "sections": {
        "availability": {
          "title": "Disponibilidad",
          "intro": "Franjax de disponibilité par dates (location, maintenance, loué).",
          "addSlot": "Ajouter un créneau",
          "newSlot": "Nouveau créneau",
          "editSlot": "Modifier le créneau",
          "filterFrom": "Filtrer du",
          "filterTo": "au",
          "status": "Estado",
          "empty": "Hastacun créneau sur cette période.",
          "deleteConfirm": "Supprimer ce créneau ?"
        }
      },
      "referential": {
        "categories": {
          "new": "Nouvelle catégorie",
          "edit": "Modifier la catégorie",
          "empty": "Ninguna catégorie.",
          "searchPlaceholder": "Rechercher par nom ou modèle…",
          "exampleModel": "Modèle type"
        },
        "agencies": {
          "empty": "Ninguna agence.",
          "searchPlaceholder": "Rechercher par nom ou adresse…",
          "agency": "Agencia",
          "address": "Dirección"
        }
      },
      "stats": {
        "vehicles": {
          "label": "Vehículos",
          "subtitle": "Flotte catalogue"
        },
        "categories": {
          "label": "Catégories",
          "subtitle": "Tipos de véhicules"
        },
        "agencies": {
          "label": "Agencias",
          "subtitle": "Points de location"
        }
      }
    },
    "cruises": {
      "list": {
        "newSailing": "Nouveau départ",
        "viewList": "Liste",
        "viewCalendar": "Calendrier",
        "emptySailings": "Hastacun départ programmé.",
        "deleteSailingConfirm": "Supprimer le départ « {label} » ?",
        "fallbackDeparture": "Salida"
      },
      "columns": {
        "departure": "Salida",
        "itinerary": "Itinerario",
        "ship": "Barco",
        "nights": "Nuits",
        "line": "Ligne",
        "year": "Année",
        "port": "Puerto"
      },
      "filters": {
        "line": "Filtrer par ligne",
        "searchShip": "Rechercher un navire…",
        "searchLine": "Rechercher une ligne…",
        "searchPort": "Rechercher par code ou nom…"
      },
      "form": {
        "ship": {
          "submitCreate": "Créer le navire",
          "line": "Ligne",
          "shipName": "Apellido du navire",
          "builtYear": "Année de construction (optionnel)",
          "validation": "Ligne et nom du navire sont obligatoires."
        },
        "sailing": {
          "submitCreate": "Créer le départ",
          "itinerary": "Itinerario",
          "departureDate": "Fecha de départ",
          "itineraryOption": "{name} ({shipName}) — {nights} nuits",
          "validation": "Itinerario et date de départ sont obligatoires."
        },
        "itinerary": {
          "new": "Nouvel itinéraire",
          "edit": "Modifier l'itinéraire",
          "durationNights": "Desderée (nuits)",
          "empty": "Hastacun itinéraire.",
          "deleteConfirm": "Supprimer cet itinéraire ?",
          "validation": "Apellido et durée (nuits) invalides."
        },
        "port": {
          "new": "Nouveau port de croisière",
          "edit": "Modifier le port",
          "countryIso": "País (ISO)",
          "empty": "Hastacun port.",
          "deleteConfirm": "Supprimer le port « {name} » ?"
        },
        "line": {
          "new": "Nouvelle ligne de croisière",
          "edit": "Modifier la ligne",
          "empty": "Ninguna ligne de croisière.",
          "deleteConfirm": "Supprimer la ligne « {name} » ?"
        },
        "cabin": {
          "new": "Nouvelle cabine",
          "edit": "Modifier la cabine",
          "category": "Catégorie",
          "maxGuests": "Voyageurs max",
          "empty": "Ninguna cabine.",
          "deleteConfirm": "Supprimer cette cabine ?",
          "validationCategory": "Catégorie et capacité invalides.",
          "validationPrice": "Precio de base invalide."
        }
      },
      "detail": {
        "shipTitle": "Modifier le navire",
        "sailingTitle": "Modifier le départ",
        "backToShips": "← Volver aux navires",
        "escalesTitle": "Escalas",
        "backToShip": "Volver au navire",
        "timelineAria": "Schéma des escales"
      },
      "sections": {
        "itineraryPorts": {
          "day": "Jour",
          "arrivalTime": "Heure d'arrivée (HH:MM)",
          "departureTime": "Heure de départ (HH:MM)",
          "arrivalPlaceholder": "08:00",
          "departurePlaceholder": "18:00",
          "empty": "Ninguna escale.",
          "deleteConfirm": "Supprimer cette escale ?"
        },
        "cabinAvailability": {
          "title": "Camarotes réservables",
          "intro": "Stock et prix par catégorie pour ce départ.",
          "stopsLabel": "Escalas : ",
          "noStopsWarning": "Ninguna escale sur cet itinéraire — ajoutez-en depuis la fiche navire.",
          "cabinMeta": "max {maxGuests} · base {basePrice}",
          "cabinsAvailableAria": "Camarotes disponibles",
          "priceCentsAria": "Precio en centimes",
          "update": "Mettre à jour",
          "makeBookable": "Rendre réservable",
          "empty": "Ninguna cabine sur ce navire. Ajoutez des cabines sur la fiche navire."
        }
      },
      "dialogs": {
        "deleteShip": "Supprimer le navire « {name} » ?"
      },
      "calendar": {
        "ariaLabel": "Calendrier des départs — {month}",
        "today": "Hastajourd'hui"
      },
      "stats": {
        "sailings": {
          "label": "Salidas",
          "subtitle": "Cruceros programmées"
        },
        "ships": {
          "label": "Barcos",
          "subtitle": "Flotte catalogue"
        },
        "lines": {
          "label": "Líneas",
          "subtitle": "Aerolíneas de croisière"
        },
        "ports": {
          "label": "Puertos",
          "subtitle": "Escalas référencées"
        }
      }
    },
    "activities": {
      "list": {
        "emptyDefault": "Ninguna activité pour le moment.",
        "ariaLabel": "Liste des activités",
        "searchPlaceholder": "Rechercher par titre…",
        "deleteConfirm": "Supprimer l'activité « {title} » ?"
      },
      "columns": {
        "activity": "Actividad",
        "provider": "Proveedor",
        "price": "Precio",
        "duration": "Desderée",
        "difficulty": "Dificultad"
      },
      "form": {
        "submitCreate": "Créer",
        "provider": "Proveedor",
        "title": "Título",
        "difficulty": "Dificultad",
        "priceCents": "Precio (centimes)"
      },
      "detail": {
        "title": "Modifier l'activité",
        "backLink": "Volver aux activités",
        "tabsAria": "Sections de l'activité",
        "tabs": {
          "activity": "Actividad",
          "schedules": "Franjax"
        }
      },
      "sections": {
        "schedules": {
          "title": "Franjax",
          "addSlot": "Nouveau créneau",
          "editSlot": "Modifier le créneau",
          "dateTime": "Fecha et heure",
          "capacity": "Capacidad",
          "empty": "Hastacun créneau pour cette activité.",
          "deleteConfirm": "Supprimer ce créneau ?",
          "validationCapacity": "La capacité doit être au moins 1.",
          "viewList": "Liste",
          "viewTimeline": "Frise",
          "timelineAria": "Timeline des créneaux horaires",
          "fillAria": "Remplissage du créneau : {percent} %"
        }
      },
      "referential": {
        "providers": {
          "new": "Nouveau fournisseur",
          "edit": "Modifier le fournisseur",
          "empty": "Hastacun fournisseur.",
          "searchPlaceholder": "Rechercher un fournisseur…",
          "ratingTitle": "Note moyenne (à venir)",
          "deleteConfirm": "Supprimer « {name} » ?",
          "validation": {
            "destinationRequired": "La destination est obligatoire."
          }
        }
      },
      "stats": {
        "activities": {
          "label": "Actividads",
          "subtitle": "Expériences catalogue"
        },
        "providers": {
          "label": "Proveedors",
          "subtitle": "Opérateurs locaux"
        },
        "schedules": {
          "label": "Franjax",
          "subtitle": "Horaires programmés"
        }
      }
    },
    "destinations": {
      "list": {
        "emptyDefault": "Ninguna destination pour le moment.",
        "emptySearch": "Ninguna destination ne correspond à votre recherche.",
        "searchPlaceholder": "Rechercher par nom, slug ou pays…",
        "searchAria": "Rechercher une destination",
        "ariaLabel": "Liste des destinations",
        "deleteConfirm": "Supprimer la destination « {name} » ? Les points d'intérêt associés seront également supprimés."
      },
      "columns": {
        "destination": "Destino",
        "country": "País"
      },
      "form": {
        "submitCreate": "Créer la destination",
        "previewName": "Nouvelle destination",
        "sections": {
          "identity": "Identidad",
          "presentation": "Présentation",
          "geography": "Géographie"
        },
        "slugHint": "Identifiant unique (ex. kinshasa).",
        "countryCode": "Code pays (ISO)",
        "countryCodeHint": "2 lettres, ex. CD, KE, ZA.",
        "heroImageUrl": "URL image hero",
        "heroImageHint": "Affichée dans le bandeau. Laissez vide pour un dégradé.",
        "geographyIntro": "Coordonnées du centre de la destination pour la carte statique.",
        "latitudeHint": "Optionnel, -90 à 90",
        "longitudeHint": "Optionnel, -180 à 180",
        "mapPreview": "Vista previa carte"
      },
      "detail": {
        "title": "Modifier la destination",
        "backLink": "Volver aux destinations",
        "mapTitle": "Carte de la destination"
      },
      "sections": {
        "pois": {
          "new": "Nouveau point d'intérêt",
          "edit": "Modifier le point d'intérêt",
          "empty": "Hastacun point d'intérêt pour cette destination.",
          "ariaLabel": "Points d'intérêt de la destination",
          "deleteConfirm": "Supprimer le point d'intérêt « {name} » ?"
        },
        "related": {
          "properties": {
            "label": "Alojamientos",
            "subtitle": "Propiedads rattachées"
          },
          "activities": {
            "label": "Actividads",
            "subtitle": "Expériences locales"
          },
          "packages": {
            "label": "Paquetes",
            "subtitle": "Packages incluant des produits locaux"
          }
        }
      },
      "stats": {
        "destinations": {
          "label": "Destinos",
          "subtitle": "Villes et régions catalogue"
        },
        "pois": {
          "label": "Points d'intérêt",
          "subtitle": "Lieux remarquables liés"
        },
        "countries": {
          "label": "País couverts",
          "subtitle": "Codes ISO distincts"
        }
      }
    },
    "packages": {
      "list": {
        "newPackage": "Nouveau forfait",
        "emptyDefault": "Hastacun forfait pour le moment.",
        "searchPlaceholder": "Rechercher un forfait…",
        "deleteConfirm": "Supprimer le forfait « {name} » ?"
      },
      "columns": {
        "package": "Paquete",
        "discount": "Descuento",
        "total": "Total",
        "active": "Activo"
      },
      "form": {
        "submitCreate": "Créer",
        "sections": {
          "identity": "Identidad",
          "pricing": "Tarification",
          "publication": "Publication"
        },
        "packageName": "Apellido du forfait",
        "descriptionPlaceholder": "Décrivez le forfait, les inclusions, les conditions…",
        "discountPercent": "Descuento (%)",
        "durationDays": "Desderée (jours)",
        "activeLabel": "Paquete actif"
      },
      "detail": {
        "editTitle": "Modifier le forfait",
        "viewTitle": "Voir le forfait",
        "backLink": "Volver aux forfaits",
        "viewButton": "Voir le forfait",
        "editButton": "Modifier le forfait",
        "notFound": "Paquete introuvable.",
        "invalidResponse": "Réponse forfait invalide.",
        "discountBadge": "Descuento {percent}%",
        "description": "Descripción",
        "includedProducts": "Produits inclus",
        "includedProductsIntro": "{count} produit(s) dans ce forfait.",
        "photoGallery": "Galerie photos",
        "photoGalleryIntro": "{count} photo(s) associée(s) au forfait.",
        "noPhotos": "Ninguna photo pour ce forfait.",
        "noIncludedProducts": "Hastacun produit inclus."
      },
      "sections": {
        "items": {
          "title": "Items du forfait",
          "intro": "Produits combinés (hébergement, vol, activité, etc.).",
          "addItem": "Ajouter un item",
          "newItem": "Nouvel item",
          "empty": "Hastacun item dans ce forfait.",
          "removeConfirm": "Retirer « {label} » du forfait ?",
          "flightLabel": "Vuelo {flightNumber}"
        },
        "composition": {
          "title": "Composition",
          "summary": "{productCount} produit(s) inclus",
          "summaryWithTypes": "{productCount} produit(s) inclus · {typeCount} types",
          "ariaLabel": "Composition du forfait"
        },
        "pricingRecap": {
          "title": "Récapitulatif tarifaire",
          "empty": "Ajoutez des items pour calculer le prix du forfait.",
          "separatePrice": "Precio séparé",
          "packagePrice": "Precio forfait",
          "separatePriceAria": "Precio des composants achetés séparément",
          "savings": "Économie de {amount} par rapport à l'achat séparé des composants."
        },
        "preview": {
          "ariaLabel": "Vista previa client du forfait",
          "header": "Vista previa client",
          "eyebrow": "Paquete",
          "includedCount": "{count} produit(s) inclus",
          "discountOnBundle": "Descuento de {percent}% sur le bundle",
          "suggestedDuration": "Desderée suggérée : {days} jour(s)",
          "packagePrice": "Precio forfait"
        }
      },
      "stats": {
        "packages": {
          "label": "Paquetes",
          "subtitle": "Packages combinés"
        },
        "active": {
          "label": "Paquetes actifs",
          "subtitle": "Publiés sur le catalogue"
        },
        "items": {
          "label": "Produits inclus",
          "subtitle": "Líneas de composition"
        },
        "photos": {
          "label": "Photos forfaits",
          "subtitle": "Galerie admin"
        }
      }
    },
    "rbac": {
      "subnav": {
        "ariaLabel": "Navigation RBAC",
        "roles": "Rols",
        "permissions": "Permissions",
        "assignments": "Assignations",
        "audit": "Hastadit"
      },
      "unsavedChanges": {
        "title": "Modifications non enregistrées",
        "description": "Des changements n'ont pas été enregistrés. Quitter sans sauvegarder ?",
        "confirm": "Quitter sans enregistrer",
        "cancel": "Continuer l'édition"
      },
      "permissionDomains": {
        "amenities": "Equipamientos",
        "bookings": "Reservas",
        "cruises": "Cruceros",
        "destinations": "Destinos",
        "employees": "Empleados",
        "flights": "Vuelos",
        "loyalty": "Fidélité",
        "organizations": "Organizacións",
        "payments": "Pagos",
        "permissions": "Permissions",
        "promo_codes": "Codes promo",
        "properties": "Alojamientos",
        "promotions": "Promociones",
        "reviews": "Avis",
        "roles": "Rols",
        "support": "Support",
        "users": "Usuarios",
        "vehicles": "Locations",
        "activities": "Actividads",
        "packages": "Paquetes"
      },
      "permissionActions": {
        "read": "Lecture",
        "write": "Écriture",
        "delete": "Suppression",
        "manage": "Gestion",
        "approve": "Approbation"
      },
      "roles": {
        "searchPlaceholder": "Rechercher par code ou nom…",
        "empty": "Hastacun rôle trouvé.",
        "ariaLabel": "Liste des rôles",
        "paginationItem": "rôle",
        "systemReadOnlyHint": "Rol système (lecture seule)",
        "codeHint": "Minuscules, chiffres et underscore (ex. sales_manager).",
        "createSubmit": "Créer le rôle",
        "backToList": "← Volver aux rôles",
        "type": {
          "system": "Système",
          "custom": "Personnalisé"
        },
        "validation": {
          "codeRequired": "Le code est obligatoire.",
          "nameRequired": "El apellido es obligatorio."
        },
        "editTitle": {
          "system": "Rol système",
          "custom": "Modifier le rôle"
        },
        "deleteDialog": {
          "title": "Supprimer le rôle",
          "description": "Supprimer définitivement le rôle « {name} » ?"
        },
        "toast": {
          "deletedTitle": "Rol supprimé",
          "deletedMessage": "Le rôle « {name} » a été supprimé.",
          "deleteFailedTitle": "Échec de la suppression"
        }
      },
      "permissions": {
        "intro": "Catalogue des permissions (lecture seule). Modifiez les droits via la matrice sur chaque rôle.",
        "searchPlaceholder": "Rechercher…",
        "empty": "Ninguna permission.",
        "paginationItem": "permission",
        "columns": {
          "resource": "Ressource"
        }
      },
      "matrix": {
        "title": "Matrice des permissions",
        "loading": "Chargement de la matrice…",
        "descriptionReadOnly": "Rol système : consultation seule.",
        "descriptionEditable": "Cochez les permissions accordées à ce rôle, regroupées par domaine.",
        "columns": {
          "scope": "Périmètre"
        },
        "wholeDomain": "Tout le domaine",
        "perAction": "Par action",
        "ariaToggleDomain": "Tout {domain} — {action}",
        "toast": {
          "savedTitle": "Permissions enregistrées",
          "savedMessage": "La matrice du rôle a été mise à jour.",
          "saveFailedTitle": "Échec de l'enregistrement"
        }
      },
      "assignments": {
        "loading": "Chargement des assignations…",
        "empty": "Ninguna assignation active.",
        "revoke": "Révoquer",
        "revokeDialog": {
          "title": "Révoquer l'assignation",
          "description": "Retirer ce rôle pour l'utilisateur sur ce périmètre ?"
        },
        "toast": {
          "revokedTitle": "Assignation révoquée",
          "revokedMessage": "Le rôle a été retiré pour cet utilisateur.",
          "revokeFailedTitle": "Échec de la révocation"
        }
      },
      "audit": {
        "checkingAccess": "Vérification des droits…",
        "accessDenied": "Cette page est réservée au super administrateur. Connectez-vous avec admin@africatourismgate.local ou un compte disposant du rôle super_admin.",
        "empty": "Hastacun événement pour ces critères.",
        "paginationItem": "événement",
        "hideDetail": "Masquer le détail",
        "showDetailJson": "Voir le détail JSON",
        "actorFallback": "Acteur : {actorId}…",
        "targetLabel": "Cible",
        "ipLabel": "IP",
        "filters": {
          "eventType": "Tipo d'événement",
          "actorUser": "Usuario (acteur)"
        },
        "toast": {
          "loadFailedTitle": "Erreur de chargement"
        },
        "eventTypes": {
          "role_created": "Rol créé",
          "role_updated": "Rol modifié",
          "role_deleted": "Rol supprimé",
          "permission_created": "Permission créée",
          "permission_updated": "Permission modifiée",
          "permission_deleted": "Permission supprimée",
          "role_permission_granted": "Permission accordée au rôle",
          "role_permission_revoked": "Permission retirée du rôle",
          "user_role_granted": "Rol assigné",
          "user_role_revoked": "Rol révoqué",
          "user_role_extended": "Assignation prolongée",
          "impersonation_started": "Impersonation démarrée",
          "impersonation_ended": "Impersonation terminée",
          "permission_denied": "Accès refusé"
        }
      }
    },
    "reviews": {
      "status": {
        "pending": "Pendiente",
        "approved": "Approuvé",
        "hidden": "Masqué"
      },
      "actions": {
        "approve": "Approuver",
        "hide": "Masquer",
        "delete": "Supprimer"
      },
      "toast": {
        "approved": {
          "title": "Avis approuvé",
          "message": "L'avis est visible côté client."
        },
        "hidden": {
          "title": "Avis masqué",
          "message": "L'avis n'est plus affiché publiquement."
        },
        "deleted": {
          "title": "Avis supprimé",
          "message": "L'avis a été retiré de la modération."
        }
      },
      "deleteDialog": {
        "title": "Supprimer cet avis",
        "description": "Suppression logique : l'avis ne sera plus visible dans la modération."
      },
      "detail": {
        "title": "Avis",
        "backLink": "Volver aux avis",
        "sections": {
          "context": "Contexte",
          "comment": "Commentaire"
        },
        "fields": {
          "author": "Hastateur",
          "property": "Propiedad",
          "entity": "Entité",
          "booking": "Reserva",
          "publishedAt": "Publié le"
        },
        "viewBooking": "Voir la réservation",
        "noComment": "Hastacun commentaire.",
        "moderationActionsAria": "Acciones de modération"
      },
      "list": {
        "columns": {
          "author": "Hastateur",
          "property": "Propiedad"
        },
        "filters": {
          "apply": "Aplicar les filtres"
        },
        "empty": {
          "default": {
            "title": "Hastacun avis en attente",
            "description": "La file de modération est vide. Les nouveaux avis clients apparaîtront ici.",
            "tableMessage": "Hastacun avis pour le moment."
          },
          "filtered": {
            "title": "Hastacun avis ne correspond aux filtres",
            "description": "Modifiez les filtres ou affichez tous les statuts pour élargir la recherche.",
            "tableMessage": "Hastacun avis ne correspond aux filtres."
          }
        },
        "ariaLabel": "Liste des avis à modérer"
      }
    },
    "support": {
      "status": {
        "open": "Ouvert",
        "pending": "En cours",
        "resolved": "Résolu",
        "closed": "Fermé"
      },
      "priority": {
        "low": "Basse",
        "normal": "Normale",
        "high": "Haute",
        "urgent": "Urgente"
      },
      "assignee": {
        "unassigned": "No assigné"
      },
      "detail": {
        "title": "Ticket support",
        "backToList": "Volver à la liste",
        "openedOn": "Ouvert le {date}",
        "sections": {
          "client": "Cliente",
          "handling": "Traitement",
          "messages": "Messages",
          "reply": "Répondre au client"
        },
        "fields": {
          "priority": "Priorité",
          "agentMessage": "Message agent"
        },
        "advanceStatus": "Passer à « {status} »",
        "noMessages": "Hastacun message.",
        "messageAuthor": {
          "staff": "Agent",
          "customer": "Cliente"
        },
        "replyPlaceholder": "Votre réponse au client…",
        "replyMinLength": "Le message doit contenir au moins 10 caractères.",
        "sending": "Envoi…",
        "sendReply": "Envoyer la réponse"
      },
      "list": {
        "filters": {
          "priority": "Priorité",
          "apply": "Aplicar les filtres"
        },
        "assignedLabel": "Assigné :",
        "empty": {
          "default": {
            "title": "Hastacun ticket pour le moment",
            "description": "Les demandes d'assistance clients apparaîtront ici dès qu'elles seront créées."
          },
          "filtered": {
            "title": "Hastacun ticket ne correspond aux filtres",
            "description": "Élargissez les critères de statut ou de priorité pour afficher plus de demandes."
          }
        },
        "ariaLabel": "Boîte de réception des tickets support"
      }
    },
    "loyalty": {
      "tiers": {
        "member": "Membre",
        "silver": "Silver",
        "gold": "Gold",
        "platinum": "Platinum"
      },
      "progress": {
        "ariaToward": "Progression vers {tier}",
        "ariaMaxReached": "Palier maximum atteint",
        "pointsBeforeTier": "{points} pts avant {tier}",
        "maxTier": "Palier maximum"
      },
      "stats": {
        "accounts": {
          "label": "Comptes fidélité",
          "subtitle": "Comptes OneKey actifs"
        },
        "points": {
          "label": "Points cumulés",
          "subtitle": "Sur les 100 premiers comptes"
        },
        "topBalance": {
          "label": "Meilleur solde",
          "emptySubtitle": "Hastacun compte"
        }
      },
      "list": {
        "columns": {
          "program": "Programme",
          "balanceProgress": "Solde & progression",
          "tier": "Palier",
          "lastActivity": "Dernière activité"
        },
        "actions": {
          "history": "Historial"
        },
        "empty": {
          "title": "Hastacun compte fidélité",
          "description": "Les comptes OneKey sont créés automatiquement lors des premiers paiements réussis. Ajustements manuels réservés au super administrateur.",
          "tableMessage": "Hastacun compte fidélité pour le moment."
        },
        "ariaLabel": "Liste des comptes fidélité"
      },
      "adjust": {
        "deltaRequired": "Indiquez une variation entière non nulle (+ ou −).",
        "title": "Ajustement manuel des points",
        "currentBalance": "solde actuel",
        "fields": {
          "delta": "Variation (+ ou −)",
          "reason": "Motivo (optionnel)"
        },
        "deltaPlaceholder": "Ex. 100 ou -50",
        "reasonPlaceholder": "Ex. geste commercial",
        "apply": "Aplicar"
      },
      "history": {
        "title": "Historial des transactions",
        "close": "Fermer",
        "currentBalance": "Solde actuel",
        "pointsUnit": "points",
        "apiUnavailable": "L'API d'historique des transactions n'est pas encore disponible. La structure ci-dessous anticipe le futur journal des mouvements de points.",
        "columns": {
          "delta": "Variation",
          "balanceAfter": "Solde après"
        },
        "transactionTypes": {
          "paymentCredit": "Crédit paiement",
          "manualAdjust": "Ajustement manuel"
        }
      }
    },
    "promotions": {
      "status": {
        "active": "Active",
        "inactive": "Inactive"
      },
      "validity": {
        "active": "En cours",
        "upcoming": "À venir",
        "expired": "Expiré",
        "noDateLimit": "Sans limite de dates",
        "fromDate": "À partir du {from}",
        "untilDate": "Jusqu'au {until}",
        "range": "{from} → {until}"
      },
      "discount": {
        "informative": "Campagne informative",
        "pending": "Réduction…",
        "percentFormat": "−{value} %",
        "fixedFormat": "−{value}"
      },
      "list": {
        "deleteConfirm": "Supprimer la promotion « {name} » ?",
        "columns": {
          "campaign": "Campagne",
          "validity": "Validité",
          "usage": "Utilisations",
          "status": "Estado"
        },
        "emptySearch": "Ninguna promotion ne correspond à votre recherche.",
        "emptyDefault": "Ninguna promotion pour le moment.",
        "searchPlaceholder": "Rechercher par titre ou description…",
        "searchAria": "Rechercher une promotion",
        "newButton": "Nouvelle promotion",
        "tableAria": "Liste des promotions",
        "paginationItem": "promotion"
      },
      "edit": {
        "pageTitle": "Modifier la promotion"
      },
      "preview": {
        "defaultName": "Nouvelle campagne",
        "ariaLabel": "Vista previa promotion {name}",
        "badge": "Promotion",
        "usage": "Utilisations : {usage}"
      },
      "form": {
        "info": {
          "codesVsPromotions": "Les codes promo sont saisis par le client au checkout. Les promotions sont des campagnes visibles (bannières, pages) — la réduction peut être optionnelle.",
          "managePromoCodesLink": "Gérer les codes promo",
          "targetHint": "Cible produit / destination (optionnel, pour affichage marketing)."
        },
        "validation": {
          "nameRequired": "Le titre est obligatoire.",
          "discountPositive": "La valeur doit être positive.",
          "percentMax": "Le pourcentage ne peut pas dépasser 100.",
          "endAfterStart": "La date de fin doit être après la date de début.",
          "maxRedemptionsInvalid": "Apellidobre max. invalide (entier ≥ 1)."
        },
        "fields": {
          "name": "Título de la campagne",
          "descriptionPlaceholder": "Ex. −20 % sur les hébergements…",
          "hasDiscount": "Aplicar une réduction au checkout",
          "discountType": "Tipo de réduction",
          "discountTypePercent": "Pourcentage (%)",
          "discountTypeFixed": "Importe fixe",
          "discountValuePercent": "Pourcentage",
          "discountValueFixed": "Importe fixe",
          "validFromOptional": "Valide du (optionnel)",
          "validUntilOptional": "Valide au (optionnel)",
          "maxRedemptions": "Utilisations max.",
          "active": "Campagne active"
        },
        "hints": {
          "discountPercent": "Pourcentage (ex. 15 pour −15 %).",
          "discountFixed": "Importe fixe en unités monétaires (ex. 10 pour −10 USD).",
          "maxRedemptions": "Laisser vide pour illimité."
        },
        "usage": {
          "label": "Utilisations :",
          "unlimited": "(illimité)"
        },
        "checkoutId": "ID checkout :",
        "saving": "Enregistrement…",
        "createButton": "Créer la promotion",
        "saveButton": "Guardar",
        "cancelButton": "Annuler"
      }
    },
    "promoCodes": {
      "status": {
        "active": "Activo",
        "inactive": "Inactivo"
      },
      "list": {
        "deleteConfirm": "Supprimer le code promo « {code} » ?",
        "columns": {
          "code": "Code",
          "discount": "Réduction",
          "validity": "Validité",
          "usage": "Utilisations",
          "status": "Estado"
        },
        "emptySearch": "Hastacun code promo ne correspond à votre recherche.",
        "emptyDefault": "Hastacun code promo pour le moment.",
        "searchPlaceholder": "Rechercher par code…",
        "searchAria": "Rechercher un code promo",
        "newButton": "Nouveau code promo",
        "tableAria": "Liste des codes promo",
        "paginationItem": "code promo"
      },
      "edit": {
        "pageTitle": "Modifier le code promo"
      },
      "form": {
        "validation": {
          "codeRequired": "Le code est obligatoire.",
          "codeFormat": "Lettres majuscules, chiffres, tirets et underscores uniquement.",
          "discountPositive": "La valeur doit être positive.",
          "percentMax": "Le pourcentage ne peut pas dépasser 100.",
          "validFromRequired": "Fecha de début obligatoire.",
          "validUntilRequired": "Fecha de fin obligatoire.",
          "endAfterStart": "La date de fin doit être après la date de début.",
          "maxRedemptionsInvalid": "Apellidobre d'utilisations max. invalide (entier ≥ 1)."
        },
        "fields": {
          "code": "Code",
          "discountType": "Tipo de réduction",
          "discountTypePercent": "Pourcentage (%)",
          "discountTypeFixed": "Importe fixe",
          "discountValuePercent": "Pourcentage",
          "discountValueFixed": "Importe fixe",
          "validFrom": "Valide du",
          "validUntil": "Valide au",
          "maxRedemptions": "Utilisations max.",
          "active": "Code actif (utilisable au checkout)"
        },
        "hints": {
          "code": "Saisi en majuscules ; comparé sans distinction de casse au checkout.",
          "discountPercent": "Pourcentage de réduction (ex. 20 pour −20 %).",
          "discountFixed": "Importe fixe en unités monétaires (ex. 10 pour −10 USD).",
          "maxRedemptions": "Laisser vide pour un nombre illimité."
        },
        "usage": {
          "recorded": "Utilisations enregistrées :",
          "unlimited": "(illimité)"
        },
        "saving": "Enregistrement…",
        "createButton": "Créer le code promo",
        "saveButton": "Guardar",
        "cancelButton": "Annuler"
      },
      "usage": {
        "format": "{count} / {max}",
        "unlimitedMax": "∞"
      }
    },
    "settings": {
      "nav": {
        "ariaLabel": "Navigation paramètres",
        "settings": "Ajustes",
        "emails": "Correos",
        "bankAccounts": "Comptes bancaires"
      },
      "page": {
        "title": "Ajustes",
        "intro": "Configuración de la organización: datos de contacto, idioma, reservas y marca.",
        "denied": "Vous n'avez pas la permission de consulter les paramètres."
      },
      "unsaved": {
        "title": "Modifications non enregistrées",
        "description": "Des changements n'ont pas été enregistrés. Quitter sans sauvegarder ?",
        "confirm": "Quitter sans enregistrer",
        "cancel": "Continuer l'édition"
      },
      "form": {
        "loading": "Cargando…",
        "dirty": "Modifications non enregistrées",
        "clean": "Ninguna modification en attente",
        "cancel": "Annuler",
        "saving": "Enregistrement…",
        "save": "Guardar",
        "upload": {
          "invalidImage": "Veuillez sélectionner une image valide.",
          "tooLarge": "Image trop lourde (max 2 MB)."
        },
        "validation": {
          "contactEmailInvalid": "L'e-mail de contact doit être valide.",
          "currencyInvalid": "La devise doit comporter 3 lettres (ex. USD, CDF).",
          "holdMinutesInvalid": "Desderée de retenue invalide (entier positif).",
          "displayNameRequired": "Le nom affiché est obligatoire.",
          "loyaltyRateInvalid": "Le taux de points doit être un entier positif ou nul.",
          "programCodeInvalid": "Le code programme est obligatoire (32 caractères max)."
        },
        "sections": {
          "contact": {
            "title": "Coordonnées",
            "description": "Affichées dans le bandeau et le pied de page du site public.",
            "phone": "Teléfono",
            "email": "Correo de contact",
            "location": "Dirección / localisation",
            "locationPlaceholder": "Kinshasa, RD Congo",
            "facebookUrl": "URL Facebook",
            "twitterUrl": "URL X / Twitter",
            "instagramUrl": "URL Instagram",
            "currency": "Moneda"
          },
          "locale": {
            "title": "Locale",
            "language": "Langue",
            "timezone": "Fuseau horaire"
          },
          "booking": {
            "title": "Reserva",
            "holdMinutes": "Desderée de retenue (minutes)",
            "allowGuestCheckout": "Hastatoriser la commande invité"
          },
          "loyalty": {
            "title": "Fidélité OneKey",
            "description": "Points crédités après paiement confirmé : floor(montant en centimes / 100) × taux ci-dessous.",
            "enabled": "Activer le crédit de points OneKey",
            "pointsPerMajorUnit": "Points par unité majeure de devise",
            "programCode": "Code programme"
          },
          "branding": {
            "title": "Branding",
            "displayName": "Apellido affiché",
            "primaryColor": "Couleur primaire",
            "primaryColorHint": "Couleur dominante de l'interface (boutons, liens, accents).",
            "secondaryColor": "Couleur secondaire",
            "secondaryColorHint": "Couleur d'accompagnement (badges, éléments secondaires).",
            "logoUrl": "URL du logo",
            "uploading": "Upload en cours…",
            "chooseLogo": "Choisir un logo local",
            "logoFormatHint": "PNG/JPG/SVG/WebP, max 2 MB",
            "faviconUrl": "URL de l'icône (favicon)",
            "chooseFavicon": "Choisir une icône locale",
            "faviconFormatHint": "PNG/ICO/SVG, max 2 MB"
          },
          "authVisual": {
            "title": "Panneau connexion"
          }
        },
        "preview": {
          "title": "Preview live",
          "description": "Le rendu se met a jour instantanement, sans sauvegarde.",
          "logoAlt": "Logo organisation",
          "adminBadge": "Admin",
          "primaryButton": "Bouton principal"
        }
      },
      "colorPalette": {
        "contrastWarning": "Contraste insuffisant avec le texte blanc : {ratio} (minimum {min} pour WCAG AA). Les boutons et liens actifs peuvent être difficiles à lire.",
        "currentAria": "Couleur actuelle ({value})",
        "currentTitle": "Couleur enregistrée — {value}",
        "currentLabel": "Actuelle",
        "selection": "Sélection :",
        "swatches": {
          "atg-primary": "Vert ATG",
          "atg-primary-hover": "Vert foncé",
          "atg-primary-light": "Vert clair",
          "forest": "Forêt",
          "emerald": "Émeraude",
          "teal": "Sarcelle",
          "atg-secondary": "Secondaire ATG",
          "lime": "Lime",
          "gold": "Or",
          "amber": "Ambre",
          "sunset": "Coucher de soleil",
          "ocean": "Océan",
          "indigo": "Indigo",
          "slate": "Ardoise",
          "earth": "Terre",
          "burgundy": "Bordeaux"
        }
      },
      "authVisual": {
        "description": "Icônes décoratives affichées sur le panneau vert de connexion / inscription.",
        "reset": "Réinitialiser",
        "add": "Ajouter une icône",
        "empty": "Ninguna icône configurée. Ajoutez-en une ou réinitialisez les valeurs par défaut.",
        "iconLabel": "Icône {n}",
        "remove": "Supprimer",
        "type": "Tipo",
        "position": "Position",
        "size": "Taille",
        "opacity": "Opacité ({n}%)",
        "imageUrl": "URL de l'image",
        "uploading": "Upload en cours…",
        "chooseImage": "Choisir une image locale",
        "preview": "Vista previa",
        "presets": {
          "pin": "Épingle (localisation)",
          "compass": "Boussole",
          "globe": "Globe",
          "star": "Étoile",
          "custom": "Image personnalisée"
        },
        "positions": {
          "bottom-right": "Bas droite",
          "top-right": "Haut droite",
          "bottom-left": "Bas gauche",
          "top-left": "Haut gauche"
        },
        "sizes": {
          "sm": "Petite",
          "md": "Moyenne",
          "lg": "Grande"
        }
      },
      "emails": {
        "page": {
          "title": "Correos",
          "intro": "Personnalisez l'apparence des e-mails transactionnels (bienvenue, confirmation de réservation).",
          "denied": "Vous n'avez pas la permission de consulter les paramètres e-mail."
        },
        "form": {
          "validation": {
            "displayNameRequired": "Le nom affiché est obligatoire."
          },
          "success": "Ajustes e-mail enregistrés.",
          "upload": {
            "invalidImage": "Veuillez sélectionner une image valide.",
            "tooLarge": "Image trop lourde (max 2 MB).",
            "failed": "Échec de l'upload du logo. Réessayez."
          },
          "displayName": "Apellido affiché",
          "logoUrl": "URL du logo",
          "chooseLogo": "Choisir un logo local",
          "logoFormatHint": "PNG/JPG/SVG/WebP, max 2 MB",
          "logoPreview": "Vista previa du logo",
          "primaryColor": "Couleur primaire",
          "primaryColorHint": "Couleur dominante des e-mails (en-têtes, boutons).",
          "secondaryColor": "Couleur secondaire",
          "secondaryColorHint": "Couleur d'accompagnement (optionnel).",
          "footerText": "Texte de pied de page",
          "footerPlaceholder": "© Africa Tourism Gate — Todos droits réservés",
          "welcomeSubject": "Sujet — e-mail de bienvenue",
          "welcomeSubjectPlaceholder": "Bienvenue chez {displayName}",
          "welcomeSubjectHint": "Variables : {displayName}",
          "bookingSubject": "Sujet — confirmation de réservation",
          "bookingSubjectPlaceholder": "Confirmation de réservation — {ref}",
          "bookingSubjectHint": "Variables : {ref}, {displayName}",
          "previewTemplate": "Modèle à prévisualiser",
          "templateWelcome": "Bienvenue (création de compte)",
          "templateBooking": "Confirmation de réservation",
          "previewing": "Prévisualisation…",
          "previewButton": "Prévisualiser",
          "save": "Guardar",
          "cancel": "Annuler",
          "saving": "Enregistrement…",
          "dirty": "Modifications non enregistrées",
          "clean": "Ninguna modification en attente",
          "readOnlyHint": "Vous pouvez consulter ces paramètres mais pas les modifier (permission organization_settings.write requise)."
        },
        "preview": {
          "closeAria": "Fermer la prévisualisation",
          "title": "Prévisualisation",
          "subject": "Sujet :",
          "close": "Fermer",
          "iframeTitle": "Vista previa e-mail"
        }
      },
      "bankAccounts": {
        "page": {
          "title": "Comptes bancaires",
          "intro": "Comptes B2B de l'organisation pour les virements et paiements hors ligne.",
          "denied": "Vous n'avez pas la permission de consulter les comptes bancaires."
        },
        "list": {
          "deleteConfirm": "Supprimer ce compte bancaire ?",
          "columns": {
            "bank": "Banque",
            "account": "Compte",
            "accountNumber": "N° compte",
            "currency": "Moneda",
            "isDefault": "Défaut"
          },
          "newButton": "Nouveau compte",
          "orgSelectAria": "Organización",
          "empty": "Hastacun compte bancaire."
        },
        "form": {
          "validation": {
            "bankNameRequired": "Le nom de la banque est obligatoire.",
            "accountNameRequired": "Le nom du compte est obligatoire.",
            "accountNumberRequired": "Le numéro de compte est obligatoire.",
            "accountNumberNoMask": "Saisissez le numéro complet (sans masque).",
            "currencyInvalid": "La devise doit comporter 3 lettres (ex. USD, CDF)."
          },
          "editTitle": "Modifier le compte",
          "createTitle": "Nouveau compte bancaire",
          "bankName": "Banque",
          "accountName": "Apellido du compte",
          "accountNumberEdit": "Numéro de compte (laisser vide pour conserver)",
          "accountNumberCreate": "Numéro de compte / IBAN",
          "storedValue": "Valeur enregistrée: {masked}",
          "swiftBic": "SWIFT / BIC",
          "currency": "Moneda",
          "isDefault": "Compte par défaut",
          "update": "Mettre à jour",
          "create": "Créer",
          "cancel": "Annuler",
          "save": "Guardar",
          "saving": "Enregistrement…",
          "dirty": "Modifications non enregistrées",
          "clean": "Ninguna modification en attente"
        }
      }
    }
  }
};
