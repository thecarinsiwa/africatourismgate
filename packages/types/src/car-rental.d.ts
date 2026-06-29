export type VehicleAvailabilityStatus = 'available' | 'maintenance' | 'rented';
export interface RentalAgency {
    id: string;
    name: string;
    destinationId: string | null;
    address: string | null;
    createdAt: string;
    updatedAt: string | null;
}
export interface CreateRentalAgencyRequest {
    name: string;
    destinationId?: string | null;
    address?: string;
}
export type UpdateRentalAgencyRequest = Partial<CreateRentalAgencyRequest>;
export interface RentalAgenciesListQuery {
    page?: number;
    limit?: number;
    search?: string;
    destinationId?: string;
}
export interface VehicleCategory {
    id: string;
    name: string;
    exampleModel: string | null;
    createdAt: string;
    updatedAt: string | null;
}
export interface CreateVehicleCategoryRequest {
    name: string;
    exampleModel?: string;
}
export type UpdateVehicleCategoryRequest = Partial<CreateVehicleCategoryRequest>;
export interface VehicleCategoriesListQuery {
    page?: number;
    limit?: number;
    search?: string;
}
export interface Vehicle {
    id: string;
    agencyId: string;
    categoryId: string;
    licensePlate: string | null;
    dailyPriceCents: number;
    currency: string;
    createdAt: string;
    updatedAt: string | null;
}
export interface CreateVehicleRequest {
    agencyId: string;
    categoryId: string;
    licensePlate?: string;
    dailyPriceCents: number;
    currency: string;
}
export type UpdateVehicleRequest = Partial<Omit<CreateVehicleRequest, 'agencyId' | 'categoryId'>> & {
    agencyId?: string;
    categoryId?: string;
};
export interface VehiclesListQuery {
    page?: number;
    limit?: number;
    search?: string;
    agencyId?: string;
    categoryId?: string;
}
export interface VehicleImage {
    id: string;
    vehicleId: string;
    url: string;
    caption: string | null;
    sortOrder: number;
    createdAt: string;
    updatedAt: string | null;
}
export interface CreateVehicleImageRequest {
    vehicleId: string;
    url: string;
    caption?: string;
    sortOrder?: number;
}
export type UpdateVehicleImageRequest = Partial<Omit<CreateVehicleImageRequest, 'vehicleId'>>;
export interface VehicleImagesListQuery {
    page?: number;
    limit?: number;
    vehicleId?: string;
}
export interface VehicleAvailability {
    id: string;
    vehicleId: string;
    startDatetime: string;
    endDatetime: string;
    status: VehicleAvailabilityStatus;
    createdAt: string;
    updatedAt: string | null;
}
export interface CreateVehicleAvailabilityRequest {
    vehicleId: string;
    startDatetime: string;
    endDatetime: string;
    status?: VehicleAvailabilityStatus;
}
export type UpdateVehicleAvailabilityRequest = Partial<Omit<CreateVehicleAvailabilityRequest, 'vehicleId'>>;
export interface VehicleAvailabilityListQuery {
    vehicleId: string;
    page?: number;
    limit?: number;
    startFrom?: string;
    endTo?: string;
}
