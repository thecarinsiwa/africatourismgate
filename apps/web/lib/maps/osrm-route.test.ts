import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getOsrmBaseUrl, straightLineLatLngs } from './osrm-route';

describe('osrm-route', () => {
  it('straightLineLatLngs maps points to [lat, lng]', () => {
    assert.deepEqual(
      straightLineLatLngs([
        {
          id: 'a',
          label: 'A',
          latitude: -4.3,
          longitude: 15.3,
        },
        {
          id: 'b',
          label: 'B',
          latitude: -5.8,
          longitude: 13.5,
        },
      ]),
      [
        [-4.3, 15.3],
        [-5.8, 13.5],
      ],
    );
  });

  it('getOsrmBaseUrl defaults to public OSRM demo', () => {
    const prev = process.env.NEXT_PUBLIC_OSRM_URL;
    delete process.env.NEXT_PUBLIC_OSRM_URL;
    try {
      assert.equal(getOsrmBaseUrl(), 'https://router.project-osrm.org');
    } finally {
      if (prev === undefined) {
        delete process.env.NEXT_PUBLIC_OSRM_URL;
      } else {
        process.env.NEXT_PUBLIC_OSRM_URL = prev;
      }
    }
  });
});
