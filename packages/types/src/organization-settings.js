"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_LOYALTY_ONEKEY_SETTING = exports.DEFAULT_EMAIL_BRANDING = exports.DEFAULT_PUBLIC_CONTACT = exports.DEFAULT_AUTH_VISUAL_ICONS = exports.AUTH_VISUAL_ICON_SIZES = exports.AUTH_VISUAL_ICON_POSITIONS = exports.AUTH_VISUAL_ICON_PRESETS = void 0;
exports.AUTH_VISUAL_ICON_PRESETS = [
    'pin',
    'compass',
    'globe',
    'star',
    'custom',
];
exports.AUTH_VISUAL_ICON_POSITIONS = [
    'bottom-right',
    'top-right',
    'bottom-left',
    'top-left',
];
exports.AUTH_VISUAL_ICON_SIZES = ['sm', 'md', 'lg'];
exports.DEFAULT_AUTH_VISUAL_ICONS = [
    {
        preset: 'pin',
        opacity: 25,
        size: 'lg',
        position: 'bottom-right',
        enabled: true,
    },
    {
        preset: 'pin',
        opacity: 60,
        size: 'sm',
        position: 'top-right',
        enabled: true,
    },
];
exports.DEFAULT_PUBLIC_CONTACT = {
    phone: '+243 815 000 000',
    email: 'support@africatourismgate.com',
    location: 'Kinshasa, RD Congo',
    facebookUrl: 'https://www.facebook.com/africatourismgate/',
    twitterUrl: 'https://x.com/Congotourismga1',
    instagramUrl: 'https://www.instagram.com/africatourismgate/',
};
exports.DEFAULT_EMAIL_BRANDING = {
    displayName: 'Africa Tourism Gate',
    primaryColor: '#0d9488',
    footerText: '© Africa Tourism Gate',
};
exports.DEFAULT_LOYALTY_ONEKEY_SETTING = {
    enabled: true,
    pointsPerMajorUnit: 1,
    programCode: 'ONEKEY',
};
