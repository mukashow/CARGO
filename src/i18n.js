import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '@locales/en.json';
import ru from '@locales/ru.json';
import zhHans from '@locales/zhHans.json';

const resources = {
  en: {
    translation: en,
  },
  ru: {
    translation: ru,
  },
  zhHans: {
    translation: zhHans,
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: 'ru',
    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });
export default i18n;
