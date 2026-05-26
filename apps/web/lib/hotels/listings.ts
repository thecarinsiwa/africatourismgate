export type HotelType = 'hotel' | 'resort' | 'lodge' | 'riad';

export type HotelAmenity = 'wifi' | 'pool' | 'breakfast' | 'spa' | 'parking';

export type HotelListing = {
  id: string;
  name: string;
  destinations: string[];
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
};

export const HOTEL_LISTINGS: HotelListing[] = [
  {
    id: 'serengeti-lodge',
    name: 'Serengeti Horizon Lodge',
    destinations: ['Nairobi', 'Kenya'],
    location: 'Masai Mara',
    country: 'Kenya',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg/1280px-Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg',
    stars: 5,
    rating: 9.4,
    reviews: 328,
    price: 289,
    type: 'lodge',
    amenities: ['wifi', 'pool', 'breakfast', 'spa'],
    featured: true,
  },
  {
    id: 'nairobi-skyline',
    name: 'Nairobi Skyline Hotel',
    destinations: ['Nairobi', 'Kenya'],
    location: 'Westlands',
    country: 'Kenya',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/A_giraffe_with_a_beautiful_background_of_Nairobi_City_Skyline_%28cropped%29.jpg/1280px-A_giraffe_with_a_beautiful_background_of_Nairobi_City_Skyline_%28cropped%29.jpg',
    stars: 4,
    rating: 8.7,
    reviews: 412,
    price: 145,
    type: 'hotel',
    amenities: ['wifi', 'breakfast', 'parking'],
  },
  {
    id: 'table-bay',
    name: 'Table Bay Grand Resort',
    destinations: ['Le Cap', 'Cape Town'],
    location: 'V&A Waterfront',
    country: 'South Africa',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Table_Mountain_DanieVDM.jpg/1280px-Table_Mountain_DanieVDM.jpg',
    stars: 5,
    rating: 9.2,
    reviews: 567,
    price: 220,
    type: 'resort',
    amenities: ['wifi', 'pool', 'spa', 'parking'],
    featured: true,
  },
  {
    id: 'cape-luxury',
    name: 'Atlantic View Boutique',
    destinations: ['Le Cap', 'Cape Town'],
    location: 'Camps Bay',
    country: 'South Africa',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Table_Mountain_DanieVDM.jpg/1280px-Table_Mountain_DanieVDM.jpg',
    stars: 4,
    rating: 8.9,
    reviews: 198,
    price: 175,
    type: 'hotel',
    amenities: ['wifi', 'pool', 'breakfast'],
  },
  {
    id: 'riad-marrakech',
    name: 'Riad Al Bahia',
    destinations: ['Marrakech'],
    location: 'Médina',
    country: 'Morocco',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Koutoubia_Mosque%2C_Marrakech.jpg/1280px-Koutoubia_Mosque%2C_Marrakech.jpg',
    stars: 5,
    rating: 9.6,
    reviews: 445,
    price: 165,
    type: 'riad',
    amenities: ['wifi', 'breakfast', 'spa'],
    featured: true,
  },
  {
    id: 'atlas-palace',
    name: 'Atlas Palace Marrakech',
    destinations: ['Marrakech'],
    location: 'Hivernage',
    country: 'Morocco',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Serengeti_sunset-1001.jpg/1280px-Serengeti_sunset-1001.jpg',
    stars: 4,
    rating: 8.5,
    reviews: 276,
    price: 120,
    type: 'hotel',
    amenities: ['wifi', 'pool', 'parking'],
  },
  {
    id: 'zanzibar-pearl',
    name: 'Zanzibar Pearl Resort',
    destinations: ['Zanzibar'],
    location: 'Nungwi Beach',
    country: 'Tanzania',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Zanzibar_beach.jpg/1280px-Zanzibar_beach.jpg',
    stars: 5,
    rating: 9.3,
    reviews: 389,
    price: 245,
    type: 'resort',
    amenities: ['wifi', 'pool', 'breakfast', 'spa'],
    featured: true,
  },
  {
    id: 'spice-island',
    name: 'Spice Island Retreat',
    destinations: ['Zanzibar'],
    location: 'Stone Town',
    country: 'Tanzania',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Forodhani_Gardens%2C_Stone_Town%2C_Zanzibar.jpg/1280px-Forodhani_Gardens%2C_Stone_Town%2C_Zanzibar.jpg',
    stars: 4,
    rating: 8.8,
    reviews: 214,
    price: 135,
    type: 'hotel',
    amenities: ['wifi', 'breakfast'],
  },
  {
    id: 'kigali-heights',
    name: 'Kigali Heights Hotel',
    destinations: ['Kigali', 'Rwanda'],
    location: 'City Center',
    country: 'Rwanda',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Mountain_gorilla_from_Susa_Group_in_Karisimbi_thicket_of_Volcanoes_National_Park_in_Rwanda._Emmanuel_Kwizera.jpg/1280px-Mountain_gorilla_from_Susa_Group_in_Karisimbi_thicket_of_Volcanoes_National_Park_in_Rwanda._Emmanuel_Kwizera.jpg',
    stars: 4,
    rating: 8.6,
    reviews: 156,
    price: 110,
    type: 'hotel',
    amenities: ['wifi', 'breakfast', 'parking'],
  },
];

export function filterHotelsByDestination(destination?: string): HotelListing[] {
  if (!destination?.trim()) {
    return [...HOTEL_LISTINGS].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }
  const q = destination.trim().toLowerCase();
  const filtered = HOTEL_LISTINGS.filter((h) =>
    h.destinations.some((d) => d.toLowerCase().includes(q) || q.includes(d.toLowerCase())),
  );
  return filtered.length > 0 ? filtered : HOTEL_LISTINGS;
}
