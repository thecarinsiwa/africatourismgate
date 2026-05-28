export type HotelType = 'hotel' | 'resort' | 'lodge' | 'riad';
export type HotelAmenity = 'wifi' | 'pool' | 'breakfast' | 'spa' | 'parking';

export type HotelListing = {
  id: string;
  name: string;
  slug: string;
  location: string;
  country: string;
  image: string;
  stars: number;
  rating: number;
  reviews: number;
  price: number;
  type: HotelType;
  amenities: HotelAmenity[];
  featured?: boolean;
  destinationName?: string;
};

export type HotelDetails = HotelListing & {
  description?: string;
  addressLine?: string;
  gallery: string[];
  rooms: Array<{
    id: string;
    name: string;
    roomType: string;
    maxGuests: number;
    bedConfig: string;
    price: number;
    currency: string;
  }>;
};