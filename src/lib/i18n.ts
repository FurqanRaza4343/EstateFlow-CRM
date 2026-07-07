/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { PropertyInterestedType } from '../types';

export type LanguageCode = 'en' | 'ur' | 'roman-urdu';
export type CurrencyCode = 'USD' | 'AED' | 'PKR';
export type PropertySchemeType = 'global' | 'regional';

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Navigation & Shell
    'nav.home': 'Home',
    'nav.leads': 'Leads',
    'nav.hotEstates': 'Hot Estates',
    'nav.schedules': 'Schedules',
    'nav.whatsapp': 'WhatsApp',
    'nav.more': 'More',
    'saas.console': 'SaaS Console',
    'saas.admin': 'Super Admin',
    'simulated.agent': 'Simulated Agent',
    'notifications': 'Notifications',
    'mark.all.read': 'Mark all read',

    // Dashboard
    'dash.welcome': 'Welcome to your Dashboard',
    'dash.leadsToday': 'New Leads Today',
    'dash.callsToday': 'Completed Calls',
    'dash.followupsDue': 'Schedules Due',
    'dash.hotLeads': 'Hot Leads Active',
    'dash.siteVisits': 'Site Visits',
    'dash.availableInventory': 'Available listings',
    'dash.activeAgents': 'Active Agents On-field',
    'dash.quickActions': 'Quick Actions',
    'dash.timeline': 'Live Activity Ledger',
    'dash.noActivity': 'No activity registered on ledger.',

    // Lead Statuses
    'status.New': 'New',
    'status.Contacted': 'Contacted',
    'status.Interested': 'Interested',
    'status.Site Visit Scheduled': 'Site Visit Scheduled',
    'status.Negotiation': 'Negotiation',
    'status.Won': 'Won',
    'status.Lost': 'Lost',
    'status.Not Responding': 'Not Responding',

    // Lead Temperatures
    'temp.Cold': 'Cold',
    'temp.Warm': 'Warm',
    'temp.Hot': 'Hot',

    // Fields & Actions
    'field.fullName': 'Full Name',
    'field.phone': 'WhatsApp / Phone',
    'field.email': 'Email Address',
    'field.source': 'Lead Source',
    'field.propertyType': 'Property Type',
    'field.budget': 'Budget Range',
    'field.budgetMin': 'Min Budget',
    'field.budgetMax': 'Max Budget',
    'field.location': 'Preferred Location',
    'field.temperature': 'Temperature',
    'field.notes': 'Counseling Notes',
    'field.assignedAgent': 'Assigned Agent',
    'field.status': 'Lead Status',

    // Action Labels
    'action.saveContact': 'Save New Contact',
    'action.createLead': 'Manual Lead Intake',
    'action.whatsappFollowup': 'WhatsApp Follow-up',
    'action.addNote': 'Add Note',
    'action.saveNote': 'Save Note',
    'action.scheduleVisit': 'Schedule Site Visit',
    'action.saveLead': 'Save Lead',
    'action.catalogProperty': 'Catalog Property',
    'action.shareProperty': 'Share Property Details',
    'action.search': 'Search...',
    'action.all': 'All',
    'action.cancel': 'Cancel',
    'action.submit': 'Submit',
    'action.snooze': 'Snooze',
    'action.complete': 'Complete',

    // Property-specific fields
    'prop.title': 'Property Title',
    'prop.location': 'Location Sector',
    'prop.address': 'Exact Address',
    'prop.price': 'Price',
    'prop.size': 'Size (Sq-Ft / BHK)',
    'prop.bedrooms': 'Bedrooms',
    'prop.bathrooms': 'Bathrooms',
    'prop.floor': 'Floor No.',
    'prop.furnishing': 'Furnishing Status',
    'prop.description': 'Description',
    'prop.amenities': 'Amenities',
    'prop.ownerInfo': 'Owner Contact Info',
    'prop.ownerRole': 'Owner / Broker Role',
    'prop.tags': 'Aesthetic Tags',
    'prop.inventory': 'Exclusive Inventory',
    'prop.available': 'Available',
    'prop.sold': 'Sold',
    'prop.hold': 'Hold',
    'prop.rented': 'Rented'
  },
  ur: {
    // Navigation & Shell
    'nav.home': 'ڈیش بورڈ',
    'nav.leads': 'لیڈز',
    'nav.hotEstates': 'اہم جائیدادیں',
    'nav.schedules': 'شیڈول',
    'nav.whatsapp': 'واٹس ایپ',
    'nav.more': 'مزید',
    'saas.console': 'سیس پورٹل',
    'saas.admin': 'سپر ایڈمن',
    'simulated.agent': 'سیمولیٹڈ ایجنٹ',
    'notifications': 'اطلاعات',
    'mark.all.read': 'سب پڑھے ہوئے نشان زد کریں',

    // Dashboard
    'dash.welcome': 'آپ کے ڈیش بورڈ میں خوش آمدید',
    'dash.leadsToday': 'آج کی نئی لیڈز',
    'dash.callsToday': 'مکمل شدہ کالیں',
    'dash.followupsDue': 'بقایا شیڈول',
    'dash.hotLeads': 'گرم لیڈز سرگرم',
    'dash.siteVisits': 'سائٹ وزٹ',
    'dash.availableInventory': 'دستیاب فہرستیں',
    'dash.activeAgents': 'سرگرم ایجنٹ فیلڈ پر',
    'dash.quickActions': 'فوری کارروائیاں',
    'dash.timeline': 'سرگرمی لیجر',
    'dash.noActivity': 'لیجر پر کوئی سرگرمی ریکارڈ نہیں کی گئی۔',

    // Lead Statuses
    'status.New': 'نئی لیڈ',
    'status.Contacted': 'رابطہ کیا گیا',
    'status.Interested': 'دلچسپی ہے',
    'status.Site Visit Scheduled': 'سائٹ وزٹ طے شدہ',
    'status.Negotiation': 'بات چیت جاری',
    'status.Won': 'کامیاب ڈیل',
    'status.Lost': 'ناکام ڈیل',
    'status.Not Responding': 'جواب نہیں مل رہا',

    // Lead Temperatures
    'temp.Cold': 'ٹھنڈا (Cold)',
    'temp.Warm': 'درمیانہ (Warm)',
    'temp.Hot': 'گرم (Hot)',

    // Fields & Actions
    'field.fullName': 'پورا نام',
    'field.phone': 'واٹس ایپ / فون',
    'field.email': 'ای میل ایڈریس',
    'field.source': 'لیڈ کا ذریعہ',
    'field.propertyType': 'جائیداد کی قسم',
    'field.budget': 'بجٹ کی حد',
    'field.budgetMin': 'کم از کم بجٹ',
    'field.budgetMax': 'زیادہ سے زیادہ بجٹ',
    'field.location': 'پسندیدہ مقام',
    'field.temperature': 'درجہ حرارت',
    'field.notes': 'مشاورتی نوٹ',
    'field.assignedAgent': 'مقرر کردہ ایجنٹ',
    'field.status': 'لیڈ کی حالت',

    // Action Labels
    'action.saveContact': 'نیا رابطہ محفوظ کریں',
    'action.createLead': 'لیڈ کا اندراج',
    'action.whatsappFollowup': 'واٹس ایپ فالو اپ',
    'action.addNote': 'نوٹ لکھیں',
    'action.saveNote': 'نوٹ محفوظ کریں',
    'action.scheduleVisit': 'سائٹ وزٹ طے کریں',
    'action.saveLead': 'لیڈ محفوظ کریں',
    'action.catalogProperty': 'جائیداد شامل کریں',
    'action.shareProperty': 'تفصیلات شیئر کریں',
    'action.search': 'تلاش کریں...',
    'action.all': 'تمام',
    'action.cancel': 'منسوخ کریں',
    'action.submit': 'جمع کریں',
    'action.snooze': 'ملتوی کریں',
    'action.complete': 'مکمل کریں',

    // Property-specific fields
    'prop.title': 'جائیداد کا نام',
    'prop.location': 'مقام / سیکٹر',
    'prop.address': 'مکمل پتہ',
    'prop.price': 'قیمت',
    'prop.size': 'سائز (مرلہ / کنال / گز)',
    'prop.bedrooms': 'کمرے',
    'prop.bathrooms': 'غسل خانے',
    'prop.floor': 'منزل نمبر',
    'prop.furnishing': 'فرنشننگ کی حالت',
    'prop.description': 'تفصیل',
    'prop.amenities': 'سہولیات',
    'prop.ownerInfo': 'مالک کا رابطہ',
    'prop.ownerRole': 'مالک یا بروکر',
    'prop.tags': 'ٹیگز',
    'prop.inventory': 'خصوصی انوینٹری',
    'prop.available': 'دستیاب',
    'prop.sold': 'فروخت شدہ',
    'prop.hold': 'روک دی گئی',
    'prop.rented': 'کرائے پر دی گئی'
  },
  'roman-urdu': {
    // Navigation & Shell
    'nav.home': 'Dashboard',
    'nav.leads': 'Leads',
    'nav.hotEstates': 'Hot Property',
    'nav.schedules': 'Schedules',
    'nav.whatsapp': 'WhatsApp Tools',
    'nav.more': 'Mazeed Options',
    'saas.console': 'SaaS Portal',
    'saas.admin': 'Super Admin',
    'simulated.agent': 'Simulated Agent',
    'notifications': 'Notifs',
    'mark.all.read': 'Sab read karein',

    // Dashboard
    'dash.welcome': 'Aapke Dashboard par khushamdeed',
    'dash.leadsToday': 'Nayi Leads Aaj Ki',
    'dash.callsToday': 'Completed Calls',
    'dash.followupsDue': 'Schedules Due',
    'dash.hotLeads': 'Hot Leads Active',
    'dash.siteVisits': 'Site Visits',
    'dash.availableInventory': 'Available Listings',
    'dash.activeAgents': 'Field Pe Active Agents',
    'dash.quickActions': 'Fauri Actions',
    'dash.timeline': 'Live Activity Ledger',
    'dash.noActivity': 'Ledger par koi activity nahi hai.',

    // Lead Statuses
    'status.New': 'Nayi Lead',
    'status.Contacted': 'Rabta Kiya Gaya',
    'status.Interested': 'Interested',
    'status.Site Visit Scheduled': 'Site Visit Scheduled',
    'status.Negotiation': 'Baat Cheet Jari',
    'status.Won': 'Deal Kamyab',
    'status.Lost': 'Deal Naakaam',
    'status.Not Responding': 'Jawab Nahi De Rahe',

    // Lead Temperatures
    'temp.Cold': 'Cold (Thanda)',
    'temp.Warm': 'Warm (Darmiana)',
    'temp.Hot': 'Hot (Sargarram)',

    // Fields & Actions
    'field.fullName': 'Poora Naam',
    'field.phone': 'WhatsApp / Phone No.',
    'field.email': 'Email Address',
    'field.source': 'Lead ka Source',
    'field.propertyType': 'Property ki Qisam',
    'field.budget': 'Budget Range',
    'field.budgetMin': 'Min Budget',
    'field.budgetMax': 'Max Budget',
    'field.location': 'Pasandida Jagah',
    'field.temperature': 'Mizaj (Temp)',
    'field.notes': 'Mashwarati Notes',
    'field.assignedAgent': 'Muqarrar Agent',
    'field.status': 'Lead ki Halat',

    // Action Labels
    'action.saveContact': 'Naya Contact Save Karein',
    'action.createLead': 'Nayi Lead Banayein',
    'action.whatsappFollowup': 'WhatsApp Follow-up',
    'action.addNote': 'Note Likhein',
    'action.saveNote': 'Note Save Karein',
    'action.scheduleVisit': 'Site Visit Schedule Karein',
    'action.saveLead': 'Lead Save Karein',
    'action.catalogProperty': 'Property Catalog Karein',
    'action.shareProperty': 'Brochure Share Karein',
    'action.search': 'Talaash karein...',
    'action.all': 'Sab',
    'action.cancel': 'Cancel',
    'action.submit': 'Submit',
    'action.snooze': 'Snooze Karein',
    'action.complete': 'Complete Karein',

    // Property-specific fields
    'prop.title': 'Property ka Naam',
    'prop.location': 'Malaqa / Sector',
    'prop.address': 'Poora Pata',
    'prop.price': 'Qeemat',
    'prop.size': 'Size (Guz / Marla / Kanal)',
    'prop.bedrooms': 'Kamre (Bedrooms)',
    'prop.bathrooms': 'Bathrooms',
    'prop.floor': 'Manzil (Floor)',
    'prop.furnishing': 'Furnishing Status',
    'prop.description': 'Tafseel (Details)',
    'prop.amenities': 'Suhooliyat',
    'prop.ownerInfo': 'Owner Rabta',
    'prop.ownerRole': 'Owner / Agent Role',
    'prop.tags': 'Tags',
    'prop.inventory': 'Exclusive Inventory',
    'prop.available': 'Dastiyab',
    'prop.sold': 'Sold',
    'prop.hold': 'Roki hui',
    'prop.rented': 'Rent par'
  }
};

// Key translations look up helper
export function t(key: string, lang: LanguageCode = 'en'): string {
  const dictionary = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return dictionary[key] || TRANSLATIONS.en[key] || key;
}

// Multi-Currency Converter Display Engine
export function formatCurrency(amount: number, currency: CurrencyCode = 'USD', formatType: 'standard' | 'regional' = 'regional'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0 
    }).format(amount);
  }
  
  if (currency === 'AED') {
    return new Intl.NumberFormat('en-AE', { 
      style: 'currency', 
      currency: 'AED', 
      maximumFractionDigits: 0 
    }).format(amount);
  }
  
  // PKR Lakh/Crore system or PKR Rs format
  if (currency === 'PKR') {
    if (formatType === 'regional') {
      if (amount >= 10000000) { // 1 Crore
        const value = amount / 10000000;
        return `PKR ${value.toFixed(2)} Cr`;
      } else if (amount >= 100000) { // 1 Lakh
        const value = amount / 100000;
        return `PKR ${value.toFixed(2)} Lakh`;
      }
    }
    // Standard PKR Rs. format
    return `Rs. ${new Intl.NumberFormat('en-PK').format(amount)}`;
  }
  
  return amount.toLocaleString();
}

// Property localization mapping helper
export const GLOBAL_PROPERTY_TYPES = {
  Apartment: 'Apartment / Condo',
  Villa: 'Villa / House',
  Plot: 'Plot / Land',
  Commercial: 'Commercial Space',
  Rental: 'Rental Suite'
};

export const REGIONAL_PK_PROPERTY_TYPES = {
  Apartment: 'Flat / Portion',
  Villa: 'House / Kothi',
  Plot: 'Plot / Acre / Kanal',
  Commercial: 'Commercial Plaza / Shop',
  Rental: 'Rent House / Portion'
};

export function getLocalizedPropertyType(
  type: PropertyInterestedType, 
  scheme: PropertySchemeType = 'global', 
  lang: LanguageCode = 'en'
): string {
  const isPk = scheme === 'regional';
  const mapping = isPk ? REGIONAL_PK_PROPERTY_TYPES : GLOBAL_PROPERTY_TYPES;
  const standardLabel = mapping[type] || type;

  // Urdu translates standard labels dynamically or we output standard
  if (lang === 'ur') {
    switch(type) {
      case 'Apartment': return isPk ? 'فلیٹ / پورشن' : 'اپارٹمنٹ / کنڈو';
      case 'Villa': return isPk ? 'مکان / کوٹھی' : 'ولا / ہاؤس';
      case 'Plot': return isPk ? 'پلاٹ / ایکڑ / کنال' : 'پلاٹ / زمین';
      case 'Commercial': return isPk ? 'کمرشل پلازہ / دکان' : 'کمرشل جگہ';
      case 'Rental': return isPk ? 'کرائے کا مکان / پورشن' : 'کرائے کا یونٹ';
      default: return standardLabel;
    }
  }

  if (lang === 'roman-urdu') {
    switch(type) {
      case 'Apartment': return isPk ? 'Flat / Portion' : 'Apartment / Condo';
      case 'Villa': return isPk ? 'House / Kothi' : 'Villa / Bungalow';
      case 'Plot': return isPk ? 'Plot / Acre / Kanal' : 'Plot / Zameen';
      case 'Commercial': return isPk ? 'Commercial Plaza / Shop' : 'Commercial Space';
      case 'Rental': return isPk ? 'Rent House / Portion' : 'Kiraye Ka Unit';
      default: return standardLabel;
    }
  }

  return standardLabel;
}
