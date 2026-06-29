export interface ActivityProvider {
    id: string;
    destinationId: string;
    name: string;
    createdAt: string;
    updatedAt: string | null;
}
export interface CreateActivityProviderRequest {
    destinationId: string;
    name: string;
}
export type UpdateActivityProviderRequest = Partial<CreateActivityProviderRequest>;
export interface ActivityProvidersListQuery {
    page?: number;
    limit?: number;
    search?: string;
    destinationId?: string;
}
export declare const ACTIVITY_DIFFICULTY_LEVELS: readonly ["easy", "moderate", "hard", "expert"];
export type ActivityDifficultyLevel = (typeof ACTIVITY_DIFFICULTY_LEVELS)[number];
export interface Activity {
    id: string;
    providerId: string;
    title: string;
    description: string | null;
    durationMinutes: number | null;
    difficultyLevel: ActivityDifficultyLevel | null;
    priceCents: number;
    currency: string;
    createdAt: string;
    updatedAt: string | null;
}
export interface CreateActivityRequest {
    providerId: string;
    title: string;
    description?: string;
    durationMinutes?: number;
    difficultyLevel?: ActivityDifficultyLevel | null;
    priceCents: number;
    currency: string;
}
export type UpdateActivityRequest = Partial<CreateActivityRequest>;
export interface ActivitiesListQuery {
    page?: number;
    limit?: number;
    search?: string;
    providerId?: string;
    destinationId?: string;
}
export interface ActivitySchedule {
    id: string;
    activityId: string;
    startDatetime: string;
    capacity: number;
    bookedCount: number;
    createdAt: string;
    updatedAt: string | null;
}
export interface CreateActivityScheduleRequest {
    activityId: string;
    startDatetime: string;
    capacity: number;
}
export type UpdateActivityScheduleRequest = Partial<Omit<CreateActivityScheduleRequest, 'activityId'>>;
export interface ActivitySchedulesListQuery {
    page?: number;
    limit?: number;
    activityId?: string;
    destinationId?: string;
}
export interface ActivityImage {
    id: string;
    activityId: string;
    url: string;
    caption: string | null;
    sortOrder: number;
    createdAt: string;
    updatedAt: string | null;
}
export interface CreateActivityImageRequest {
    activityId: string;
    url: string;
    caption?: string;
    sortOrder?: number;
}
export type UpdateActivityImageRequest = Partial<Omit<CreateActivityImageRequest, 'activityId'>>;
export interface ActivityImagesListQuery {
    page?: number;
    limit?: number;
    activityId?: string;
}
