export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

export const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'development';
export const IS_DEVELOPMENT = ENVIRONMENT === 'development';
export const IS_HOMOLOGATION = ENVIRONMENT === 'homologation' || ENVIRONMENT === 'staging';
export const IS_PRODUCTION = ENVIRONMENT === 'production';

export const IS_HOMOLOGATION_OR_DEV = IS_HOMOLOGATION || IS_DEVELOPMENT;


