export interface ContactInfo {
  id: string;
  companyName: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  businessHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export const DEFAULT_CONTACT: ContactInfo = {
  id: '1',
  companyName: 'P.C. Resource',
  phone: '810-874-2069',
  email: 'sales@buypcr.com',
  address: {
    street: '',
    city: '',
    state: '',
    zip: ''
  },
  businessHours: {
    weekdays: 'Monday - Friday: 9:00 AM - 6:00 PM',
    saturday: 'Saturday: 10:00 AM - 4:00 PM',
    sunday: 'Sunday: Closed'
  },
  socialMedia: {
    facebook: '',
    twitter: '',
    linkedin: ''
  }
};

export function getContactInfo(): ContactInfo {
  if (typeof window === 'undefined') {
    return DEFAULT_CONTACT;
  }

  const stored = localStorage.getItem('contactInfo');
  return stored ? JSON.parse(stored) : DEFAULT_CONTACT;
}

export function saveContactInfo(contact: ContactInfo): void {
  localStorage.setItem('contactInfo', JSON.stringify(contact));
}
