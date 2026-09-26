import { describe, expect, it } from 'vitest';
import {
  emptyManifestEntryDraft,
  manifestDraftToPayload,
} from './checkout-manifest-form';
import {
  emptyEmergencyContactDraft,
  emergencyContactDraftFromApi,
  emergencyContactDraftToPayload,
} from './booking-emergency-contact-form';

describe('checkout manifest adapters', () => {
  it('manifestDraftToPayload omits deprecated emergency fields', () => {
    const draft = emptyManifestEntryDraft();
    draft.fullName = 'Marie Dupont';
    draft.nationality = 'CD';
    draft.idNumber = 'P100001';
    draft.age = '34';
    draft.allergies = 'Pollen';

    const payload = manifestDraftToPayload(draft, 0);

    expect(payload).toEqual(
      expect.objectContaining({
        fullName: 'Marie Dupont',
        nationality: 'CD',
        idNumber: 'P100001',
        age: 34,
        allergies: 'Pollen',
        sortOrder: 0,
      }),
    );
    expect(payload).not.toHaveProperty('emergencyContactName');
    expect(payload).not.toHaveProperty('emergencyContactPhone');
    expect(payload).not.toHaveProperty('emergencyContactEmail');
  });

  it('emergencyContactDraftToPayload maps booking-level contact', () => {
    const draft = emptyEmergencyContactDraft();
    draft.name = 'Paul Urgence';
    draft.phone = '+243900000001';
    draft.email = 'paul@example.com';
    draft.country = 'CD';
    draft.address = 'Kinshasa';

    expect(emergencyContactDraftToPayload(draft)).toEqual({
      name: 'Paul Urgence',
      phone: '+243900000001',
      email: 'paul@example.com',
      country: 'CD',
      address: 'Kinshasa',
    });
  });

  it('emergencyContactDraftFromApi clears empty contact to blank draft', () => {
    expect(emergencyContactDraftFromApi(null)).toEqual(emptyEmergencyContactDraft());
    expect(
      emergencyContactDraftFromApi({
        name: 'Alice',
        phone: '+2431',
        email: null,
        country: null,
        address: null,
      }),
    ).toEqual({
      name: 'Alice',
      phone: '+2431',
      email: '',
      country: '',
      address: '',
    });
  });
});
