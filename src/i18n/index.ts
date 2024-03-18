import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

export const DEFAULT_LOCALE = {
	default: true,
	code: 'en',
	language: 'English',
	worldCountriesLocale: 'en',
	cca3: 'USA',
	iso6391: 'en',
} as const;

export const fallbackLng = 'en';
export const defaultNS = 'nls';

i18next
	.use(Backend)
	.use(LanguageDetector)
	.use(initReactI18next)
	.use(resourcesToBackend((language: string, namespace: string) => import(`./${namespace}/${language}.json`)))
	.init({
		fallbackLng: 'en',
		fallbackNS: 'nls',
		ns: ['nls'],
		detection: {
			order: ['localStorage', 'querystring', 'htmlTag', 'navigator'],
			lookupCookie: 'locale',
		},
		interpolation: {
			escapeValue: false,
		},
		react: {
			useSuspense: false,
		},
	});

export default i18next;
