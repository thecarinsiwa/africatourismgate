"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_BOOKING_ITEM_TYPE_MODES = exports.BOOKING_ITEM_TYPE_KEYS = void 0;
exports.isBookingMode = isBookingMode;
exports.normalizeBookingItemTypeModes = normalizeBookingItemTypeModes;
exports.resolveBookingModeForItemType = resolveBookingModeForItemType;
exports.resolveCheckoutBookingMode = resolveCheckoutBookingMode;
exports.BOOKING_ITEM_TYPE_KEYS = [
    'room',
    'flight_class',
    'vehicle',
    'cabin',
    'activity_schedule',
    'package',
];
exports.DEFAULT_BOOKING_ITEM_TYPE_MODES = {
    room: 'immediate',
    flight_class: 'immediate',
    vehicle: 'immediate',
    cabin: 'immediate',
    activity_schedule: 'assisted',
    package: 'assisted',
};
const BOOKING_MODE_VALUES = new Set(['immediate', 'assisted']);
function isBookingMode(value) {
    return typeof value === 'string' && BOOKING_MODE_VALUES.has(value);
}
function normalizeBookingItemTypeModes(raw) {
    const result = { ...exports.DEFAULT_BOOKING_ITEM_TYPE_MODES };
    if (!raw || typeof raw !== 'object') {
        return result;
    }
    for (const key of exports.BOOKING_ITEM_TYPE_KEYS) {
        const value = raw[key];
        if (isBookingMode(value)) {
            result[key] = value;
        }
    }
    return result;
}
function resolveBookingModeForItemType(itemType, modes = exports.DEFAULT_BOOKING_ITEM_TYPE_MODES) {
    if (itemType === 'package') {
        return modes.package;
    }
    if (exports.BOOKING_ITEM_TYPE_KEYS.includes(itemType)) {
        return modes[itemType];
    }
    return 'immediate';
}
function resolveCheckoutBookingMode(input) {
    const modes = input.modes ?? exports.DEFAULT_BOOKING_ITEM_TYPE_MODES;
    if (input.packageId) {
        return modes.package;
    }
    if (input.itemTypes.length === 0) {
        return 'immediate';
    }
    const resolved = input.itemTypes.map((itemType) => resolveBookingModeForItemType(itemType, modes));
    if (resolved.every((mode) => mode === 'immediate')) {
        return 'immediate';
    }
    if (resolved.every((mode) => mode === 'assisted')) {
        return 'assisted';
    }
    return 'assisted';
}
