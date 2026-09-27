import { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

const translations = {
  en: {
    home: "Home",
    findJobs: "Find Jobs",
    dashboard: "Dashboard",
    profile: "Profile",
    postJob: "Post Job",
    applicants: "Applicants",
    login: "Login",
    register: "Register",
    logout: "Logout",
  },

  hi: {
    home: "होम",
    findJobs: "नौकरी खोजें",
    dashboard: "डैशबोर्ड",
    profile: "प्रोफ़ाइल",
    postJob: "नौकरी पोस्ट करें",
    applicants: "आवेदक",
    login: "लॉगिन",
    register: "रजिस्टर",
    logout: "लॉगआउट",
  },

  mr: {
    home: "मुख्यपृष्ठ",
    findJobs: "नोकरी शोधा",
    dashboard: "डॅशबोर्ड",
    profile: "प्रोफाइल",
    postJob: "नोकरी पोस्ट करा",
    applicants: "अर्जदार",
    login: "लॉगिन",
    register: "नोंदणी",
    logout: "लॉगआउट",
  },
};

function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    localStorage.getItem("lokrozgar_language") || "en"
  );

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem(
      "lokrozgar_language",
      newLanguage
    );
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

function useLanguage() {
  return useContext(LanguageContext);
}

export {
  LanguageProvider,
  useLanguage,
};