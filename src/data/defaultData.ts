import { AppData } from '../types';

export const initialData: AppData = {
  companies: [
    {
      id: 'comp_zeiss',
      name: 'ZEISS',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'comp_essilor',
      name: 'Essilor',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'comp_hoya',
      name: 'Hoya',
      createdAt: new Date().toISOString(),
    },
  ],
  lensTypes: [
    {
      id: 'type_single_vision',
      name: 'Single Vision',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'type_blue_cut',
      name: 'Blue Cut',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'type_photochromic',
      name: 'Photochromic',
      createdAt: new Date().toISOString(),
    },
  ],
  pricingRules: [
    // ZEISS + Single Vision
    {
      id: 'rule_1',
      companyId: 'comp_zeiss',
      lensTypeId: 'type_single_vision',
      minRange: 0.0,
      maxRange: 2.0,
      price: 200,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rule_2',
      companyId: 'comp_zeiss',
      lensTypeId: 'type_single_vision',
      minRange: 2.25,
      maxRange: 4.0,
      price: 300,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rule_3',
      companyId: 'comp_zeiss',
      lensTypeId: 'type_single_vision',
      minRange: 4.25,
      maxRange: 6.0,
      price: 450,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rule_4',
      companyId: 'comp_zeiss',
      lensTypeId: 'type_single_vision',
      minRange: 6.25,
      maxRange: 8.0,
      price: 650,
      createdAt: new Date().toISOString(),
    },

    // ZEISS + Blue Cut
    {
      id: 'rule_5',
      companyId: 'comp_zeiss',
      lensTypeId: 'type_blue_cut',
      minRange: 0.0,
      maxRange: 2.0,
      price: 350,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rule_6',
      companyId: 'comp_zeiss',
      lensTypeId: 'type_blue_cut',
      minRange: 2.25,
      maxRange: 4.0,
      price: 480,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rule_7',
      companyId: 'comp_zeiss',
      lensTypeId: 'type_blue_cut',
      minRange: 4.25,
      maxRange: 6.0,
      price: 650,
      createdAt: new Date().toISOString(),
    },

    // ZEISS + Photochromic
    {
      id: 'rule_8',
      companyId: 'comp_zeiss',
      lensTypeId: 'type_photochromic',
      minRange: 0.0,
      maxRange: 2.0,
      price: 550,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rule_9',
      companyId: 'comp_zeiss',
      lensTypeId: 'type_photochromic',
      minRange: 2.25,
      maxRange: 4.0,
      price: 750,
      createdAt: new Date().toISOString(),
    },

    // Essilor + Single Vision
    {
      id: 'rule_10',
      companyId: 'comp_essilor',
      lensTypeId: 'type_single_vision',
      minRange: 0.0,
      maxRange: 2.0,
      price: 180,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rule_11',
      companyId: 'comp_essilor',
      lensTypeId: 'type_single_vision',
      minRange: 2.25,
      maxRange: 4.0,
      price: 280,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rule_12',
      companyId: 'comp_essilor',
      lensTypeId: 'type_single_vision',
      minRange: 4.25,
      maxRange: 6.0,
      price: 420,
      createdAt: new Date().toISOString(),
    },

    // Essilor + Blue Cut
    {
      id: 'rule_13',
      companyId: 'comp_essilor',
      lensTypeId: 'type_blue_cut',
      minRange: 0.0,
      maxRange: 2.0,
      price: 320,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rule_14',
      companyId: 'comp_essilor',
      lensTypeId: 'type_blue_cut',
      minRange: 2.25,
      maxRange: 4.0,
      price: 450,
      createdAt: new Date().toISOString(),
    },

    // Hoya + Single Vision
    {
      id: 'rule_15',
      companyId: 'comp_hoya',
      lensTypeId: 'type_single_vision',
      minRange: 0.0,
      maxRange: 2.0,
      price: 190,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rule_16',
      companyId: 'comp_hoya',
      lensTypeId: 'type_single_vision',
      minRange: 2.25,
      maxRange: 4.0,
      price: 290,
      createdAt: new Date().toISOString(),
    },
  ],
  customers: [],
  orders: [],
};
