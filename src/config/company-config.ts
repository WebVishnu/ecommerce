import companyConfig from './company-config.json';

export interface CompanyConfig {
  company: {
    name: string;
    shortName: string;
    tagline: string;
    description: string;
    website: string;
    founded: string;
  };
  contact: {
    phone: {
      primary: string;
      secondary: string;
      whatsapp: string;
    };
    email: {
      primary: string;
      support: string;
      sales: string;
    };
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
      full: string;
    };
    businessHours: {
      monday: string;
      tuesday: string;
      wednesday: string;
      thursday: string;
      friday: string;
      saturday: string;
      sunday: string;
    };
  };
  branding: {
    colors: {
      primary: {
        main: string;
        light: string;
        dark: string;
        contrast: string;
      };
      secondary: {
        main: string;
        light: string;
        dark: string;
        contrast: string;
      };
      accent: {
        main: string;
        light: string;
        dark: string;
        contrast: string;
      };
      background: {
        primary: string;
        secondary: string;
        tertiary: string;
        dark: string;
      };
      text: {
        primary: string;
        secondary: string;
        disabled: string;
        inverse: string;
      };
      status: {
        success: string;
        warning: string;
        error: string;
        info: string;
      };
    };
    logo: {
      primary: string;
      secondary: string;
      favicon: string;
      alt: string;
    };
    fonts: {
      primary: string;
      secondary: string;
      mono: string;
    };
  };
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    youtube: string;
  };
  features: {
    enableOTP: boolean;
    enableWhatsApp: boolean;
    enableReviews: boolean;
    enableWishlist: boolean;
    enableCompare: boolean;
    enableNewsletter: boolean;
    enableLiveChat: boolean;
    enableMultiLanguage: boolean;
    enableMultiCurrency: boolean;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
    author: string;
    ogImage: string;
  };
  payment: {
    methods: string[];
    currencies: string[];
    taxRate: number;
    shipping: {
      freeThreshold: number;
      baseRate: number;
      expressRate: number;
    };
  };
  content: {
    hero: {
      title: string;
      subtitle: string;
      cta: string;
    };
    about: {
      title: string;
      description: string;
      highlights: string[];
    };
    footer: {
      description: string;
      quickLinks: string[];
    };
  };
  categories: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
  }>;
}

export const config: CompanyConfig = companyConfig;

// Helper functions for easy access to common config values
export const getCompanyName = () => config.company.name;
export const getCompanyShortName = () => config.company.shortName;
export const getPrimaryColor = () => config.branding.colors.primary.main;
export const getSecondaryColor = () => config.branding.colors.secondary.main;
export const getPrimaryPhone = () => config.contact.phone.primary;
export const getPrimaryEmail = () => config.contact.email.primary;
export const getFullAddress = () => config.contact.address.full;
export const getLogo = () => config.branding.logo.primary;
export const getLogoWhite = () => config.branding.logo.secondary;

export default config; 