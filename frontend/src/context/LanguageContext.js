import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'en';
  });

  const translations = {
    en: {
      // Auth
      login: 'Login',
      signup: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone Number',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember Me',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      loginWith: 'Or login with',
      signupWith: 'Or sign up with',
      
      // Dashboard
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      profile: 'Profile',
      account: 'Account',
      services: 'Services',
      bookings: 'Bookings',
      payments: 'Payments',
      settings: 'Settings',
      
      // Services
      chef: 'Chef',
      bartender: 'Bartender',
      maid: 'Maid',
      waiter: 'Waiter',
      personalDriver: 'Personal Driver',
      bookNow: 'Book Now',
      viewDetails: 'View Details',
      
      // Profile
      editProfile: 'Edit Profile',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
      deleteAccount: 'Delete Account',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      country: 'Country',
      phoneNumber: 'Phone Number',
      personalInformation: 'Personal Information',
      quickActions: 'Quick Actions',
      browseServices: 'Browse Services',
      accountSettings: 'Account Settings',
      recentActivity: 'Recent Activity',
      profileUpdated: 'Profile Updated',
      serviceRated: 'Service Rated',
      
      // Common
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      submit: 'Submit',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      refresh: 'Refresh',
      
      // Theme
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      toggleTheme: 'Toggle Theme',
      
      // Language
      english: 'English',
      spanish: 'Spanish',
      french: 'French',
      german: 'German',
      chinese: 'Chinese',
      japanese: 'Japanese',
      arabic: 'Arabic',
      hindi: 'Hindi',
      
      // Navigation
      home: 'Home',
      about: 'About',
      contact: 'Contact',
      help: 'Help',
      logout: 'Logout',
      
      // Messages
      welcomeMessage: 'Welcome to our service platform!',
      loginSuccess: 'Login successful!',
      signupSuccess: 'Account created successfully!',
      logoutSuccess: 'Logged out successfully!',
      emailVerificationRequired: 'Please verify your email to continue.',
      invalidCredentials: 'Invalid email or password.',
      emailAlreadyExists: 'Email already registered.',
      passwordMismatch: 'Passwords do not match.',
      requiredField: 'This field is required.',
      invalidEmail: 'Please enter a valid email address.',
      passwordTooShort: 'Password must be at least 6 characters.',
    },
    hi: {
      login: 'लॉगिन',
      signup: 'साइन अप',
      email: 'ईमेल',
      password: 'पासवर्ड',
      confirmPassword: 'पासवर्ड की पुष्टि करें',
      firstName: 'पहला नाम',
      lastName: 'अंतिम नाम',
      phone: 'फ़ोन नंबर',
      dashboard: 'डैशबोर्ड',
      profile: 'प्रोफाइल',
      settings: 'सेटिंग्स',
      saveChanges: 'परिवर्तन सहेजें',
      cancel: 'रद्द करें',
      lightMode: 'लाइट मोड',
      darkMode: 'डार्क मोड',
      toggleTheme: 'थीम बदलें',
      english: 'अंग्रेज़ी',
      spanish: 'स्पैनिश',
      french: 'फ़्रेंच',
      german: 'जर्मन',
      chinese: 'चीनी',
      japanese: 'जापानी',
      arabic: 'अरबी',
      hindi: 'हिंदी',
    },
    bn: {
      login: 'লগইন',
      signup: 'সাইন আপ',
      email: 'ইমেইল',
      password: 'পাসওয়ার্ড',
      confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
      firstName: 'প্রথম নাম',
      lastName: 'শেষ নাম',
      phone: 'ফোন নম্বর',
      dashboard: 'ড্যাশবোর্ড',
      profile: 'প্রোফাইল',
      settings: 'সেটিংস',
      saveChanges: 'পরিবর্তন সংরক্ষণ',
      cancel: 'বাতিল',
      lightMode: 'লাইট মোড',
      darkMode: 'ডার্ক মোড',
      toggleTheme: 'থিম পরিবর্তন',
      english: 'ইংরেজি',
      spanish: 'স্প্যানিশ',
      french: 'ফরাসি',
      german: 'জার্মান',
      chinese: 'চীনা',
      japanese: 'জাপানি',
      arabic: 'আরবি',
      hindi: 'হিন্দি',
    },
    ja: {
      login: 'ログイン',
      signup: 'サインアップ',
      email: 'メール',
      password: 'パスワード',
      confirmPassword: 'パスワード確認',
      firstName: '名',
      lastName: '姓',
      phone: '電話番号',
      dashboard: 'ダッシュボード',
      profile: 'プロフィール',
      settings: '設定',
      saveChanges: '変更を保存',
      cancel: 'キャンセル',
      lightMode: 'ライトモード',
      darkMode: 'ダークモード',
      toggleTheme: 'テーマを切替',
      english: '英語',
      spanish: 'スペイン語',
      french: 'フランス語',
      german: 'ドイツ語',
      chinese: '中国語',
      japanese: '日本語',
      arabic: 'アラビア語',
      hindi: 'ヒンディー語',
    },
    ko: {
      login: '로그인',
      signup: '가입하기',
      email: '이메일',
      password: '비밀번호',
      confirmPassword: '비밀번호 확인',
      firstName: '이름',
      lastName: '성',
      phone: '전화번호',
      dashboard: '대시보드',
      profile: '프로필',
      settings: '설정',
      saveChanges: '변경사항 저장',
      cancel: '취소',
      lightMode: '라이트 모드',
      darkMode: '다크 모드',
      toggleTheme: '테마 전환',
      english: '영어',
      spanish: '스페인어',
      french: '프랑스어',
      german: '독일어',
      chinese: '중국어',
      japanese: '일본어',
      arabic: '아랍어',
      hindi: '힌디어',
    },
    es: {
      // Auth
      login: 'Iniciar Sesión',
      signup: 'Registrarse',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      firstName: 'Nombre',
      lastName: 'Apellido',
      phone: 'Número de Teléfono',
      forgotPassword: '¿Olvidaste tu contraseña?',
      rememberMe: 'Recordarme',
      alreadyHaveAccount: '¿Ya tienes una cuenta?',
      dontHaveAccount: '¿No tienes una cuenta?',
      loginWith: 'O inicia sesión con',
      signupWith: 'O regístrate con',
      
      // Dashboard
      welcome: 'Bienvenido',
      dashboard: 'Panel de Control',
      profile: 'Perfil',
      account: 'Cuenta',
      services: 'Servicios',
      bookings: 'Reservas',
      payments: 'Pagos',
      settings: 'Configuración',
      
      // Services
      chef: 'Chef',
      bartender: 'Bartender',
      maid: 'Ama de Casa',
      waiter: 'Camarero',
      personalDriver: 'Conductor Personal',
      bookNow: 'Reservar Ahora',
      viewDetails: 'Ver Detalles',
      
      // Profile
      editProfile: 'Editar Perfil',
      saveChanges: 'Guardar Cambios',
      cancel: 'Cancelar',
      deleteAccount: 'Eliminar Cuenta',
      gender: 'Género',
      male: 'Masculino',
      female: 'Femenino',
      other: 'Otro',
      country: 'País',
      phoneNumber: 'Número de Teléfono',
      personalInformation: 'Información Personal',
      quickActions: 'Acciones Rápidas',
      browseServices: 'Explorar Servicios',
      accountSettings: 'Configuración de Cuenta',
      recentActivity: 'Actividad Reciente',
      profileUpdated: 'Perfil Actualizado',
      serviceRated: 'Servicio Calificado',
      
      // Common
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      submit: 'Enviar',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
      close: 'Cerrar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      view: 'Ver',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      refresh: 'Actualizar',
      
      // Theme
      lightMode: 'Modo Claro',
      darkMode: 'Modo Oscuro',
      toggleTheme: 'Cambiar Tema',
      
      // Language
      english: 'Inglés',
      spanish: 'Español',
      french: 'Francés',
      german: 'Alemán',
      chinese: 'Chino',
      japanese: 'Japonés',
      arabic: 'Árabe',
      hindi: 'Hindi',
      
      // Navigation
      home: 'Inicio',
      about: 'Acerca de',
      contact: 'Contacto',
      help: 'Ayuda',
      logout: 'Cerrar Sesión',
      
      // Messages
      welcomeMessage: '¡Bienvenido a nuestra plataforma de servicios!',
      loginSuccess: '¡Inicio de sesión exitoso!',
      signupSuccess: '¡Cuenta creada exitosamente!',
      logoutSuccess: '¡Sesión cerrada exitosamente!',
      emailVerificationRequired: 'Por favor verifica tu correo para continuar.',
      invalidCredentials: 'Correo o contraseña inválidos.',
      emailAlreadyExists: 'El correo ya está registrado.',
      passwordMismatch: 'Las contraseñas no coinciden.',
      requiredField: 'Este campo es requerido.',
      invalidEmail: 'Por favor ingresa un correo válido.',
      passwordTooShort: 'La contraseña debe tener al menos 6 caracteres.',
    },
    fr: {
      // Auth
      login: 'Se Connecter',
      signup: "S'inscrire",
      email: 'E-mail',
      password: 'Mot de Passe',
      confirmPassword: 'Confirmer le Mot de Passe',
      firstName: 'Prénom',
      lastName: 'Nom de Famille',
      phone: 'Numéro de Téléphone',
      forgotPassword: 'Mot de passe oublié ?',
      rememberMe: 'Se souvenir de moi',
      alreadyHaveAccount: 'Vous avez déjà un compte ?',
      dontHaveAccount: "Vous n'avez pas de compte ?",
      loginWith: 'Ou connectez-vous avec',
      signupWith: 'Ou inscrivez-vous avec',
      
      // Dashboard
      welcome: 'Bienvenue',
      dashboard: 'Tableau de Bord',
      profile: 'Profil',
      account: 'Compte',
      services: 'Services',
      bookings: 'Réservations',
      payments: 'Paiements',
      settings: 'Paramètres',
      
      // Services
      chef: 'Chef',
      bartender: 'Barman',
      maid: 'Femme de Ménage',
      waiter: 'Serveur',
      personalDriver: 'Chauffeur Personnel',
      bookNow: 'Réserver Maintenant',
      viewDetails: 'Voir les Détails',
      
      // Profile
      editProfile: 'Modifier le Profil',
      saveChanges: 'Sauvegarder les Modifications',
      cancel: 'Annuler',
      deleteAccount: 'Supprimer le Compte',
      gender: 'Genre',
      male: 'Masculin',
      female: 'Féminin',
      other: 'Autre',
      country: 'Pays',
      phoneNumber: 'Numéro de Téléphone',
      personalInformation: 'Informations Personnelles',
      quickActions: 'Actions Rapides',
      browseServices: 'Parcourir les Services',
      accountSettings: 'Paramètres du Compte',
      recentActivity: 'Activité Récente',
      profileUpdated: 'Profil Mis à Jour',
      serviceRated: 'Service Évalué',
      
      // Common
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      submit: 'Soumettre',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      close: 'Fermer',
      save: 'Sauvegarder',
      delete: 'Supprimer',
      edit: 'Modifier',
      view: 'Voir',
      search: 'Rechercher',
      filter: 'Filtrer',
      sort: 'Trier',
      refresh: 'Actualiser',
      
      // Theme
      lightMode: 'Mode Clair',
      darkMode: 'Mode Sombre',
      toggleTheme: 'Changer de Thème',
      
      // Language
      english: 'Anglais',
      spanish: 'Espagnol',
      french: 'Français',
      german: 'Allemand',
      chinese: 'Chinois',
      japanese: 'Japonais',
      arabic: 'Arabe',
      hindi: 'Hindi',
      
      // Navigation
      home: 'Accueil',
      about: 'À Propos',
      contact: 'Contact',
      help: 'Aide',
      logout: 'Se Déconnecter',
      
      // Messages
      welcomeMessage: 'Bienvenue sur notre plateforme de services !',
      loginSuccess: 'Connexion réussie !',
      signupSuccess: 'Compte créé avec succès !',
      logoutSuccess: 'Déconnexion réussie !',
      emailVerificationRequired: 'Veuillez vérifier votre e-mail pour continuer.',
      invalidCredentials: 'E-mail ou mot de passe invalide.',
      emailAlreadyExists: 'Cet e-mail est déjà enregistré.',
      passwordMismatch: 'Les mots de passe ne correspondent pas.',
      requiredField: 'Ce champ est requis.',
      invalidEmail: 'Veuillez entrer une adresse e-mail valide.',
      passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères.',
    }
  };

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.setAttribute('lang', language);
    document.documentElement.classList.toggle('rtl', language === 'ar');
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const value = {
    language,
    changeLanguage,
    t,
    translations: translations[language],
    availableLanguages: Object.keys(translations)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

