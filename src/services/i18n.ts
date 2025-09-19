import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import pt from "../locales/pt.json"
import en from "../locales/en.json"
import es from "../locales/es.json"

i18n.use(initReactI18next).init({
    lng:"pt",//Idioma padrão
    fallbackLng:"en",//fallback se não encontrar tradução
    resources:{
        pt:{translation:pt},
        en:{translation:en},
        es:{translation:es}
    },
    interpolation:{
        escapeValue:false
    }
})
export default i18n

