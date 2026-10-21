import apiClient from './api';

// Fallback authoritative catalogue definitions adhering to Step 7 requirements
const FALLBACK_CATEGORIES = [
  {
    id: 'food',
    name: 'Food',
    code: 'food',
    emoji: '🍲',
    tagline: 'Prepared nutritious meals & non-perishable food grains',
    description: 'Wholesome cooked meals, ration kits, dry legumes, rice, and sealed packaged nutrition.',
    units: ['portions', 'packets', 'kg', 'boxes'],
    defaultUnit: 'portions',
    supportedHubCategoryKey: 'food',
    isActive: true,
    guidance: {
      packingTimeRequirement: 'Prepared cooked meals must be deposited within 2 hours of packaging.',
      consumptionDeadline: 'Cooked food must have a minimum 4-hour shelf life before expiry at time of deposit.',
      safetyConditions: [
        'Food must be packed in clean, food-grade airtight containers or sealed foil packets.',
        'Clear labeling indicating vegetarian/non-vegetarian and preparation timestamp.',
        'Must not be spoiled, sour, fermented, or stored in direct sunlight.',
        'Raw ingredients/grains must be unexpired, moisture-free, and sealed.'
      ],
      volunteerProvidedInfo: [
        'Meal description and preparation timestamp',
        'Vegetarian or non-vegetarian classification',
        'Declared portion count and packaging container type'
      ],
      hubPhysicalChecks: [
        'Visual inspection of seal integrity and container sanitation',
        'Temperature and freshness verification by kiosk supervisor',
        'Weighing and batch labeling at self-service terminal'
      ]
    }
  },
  {
    id: 'cloth',
    name: 'Cloth',
    code: 'clothing',
    emoji: '👕',
    tagline: 'Wearable garments, warm winter wear, and clean blankets',
    description: "Men's, women's, and children's everyday clothing, warm woolens, sweaters, jackets, and clean bedsheets.",
    units: ['items', 'sets', 'pairs', 'bundles'],
    defaultUnit: 'items',
    supportedHubCategoryKey: 'clothing',
    isActive: true,
    guidance: {
      cleanliness: 'Must be freshly laundered, completely dry, and free of mildew or odors.',
      condition: 'Gently worn or new. All buttons, zippers, and seams must be intact.',
      restrictions: [
        'Strictly no undergarments or intimate apparel.',
        'No torn, stained, bleached, or frayed garments.',
        'No industrial rags or heavily soiled workwear.'
      ],
      priorities: "High demand for children's school clothes, winter blankets, and warm jackets.",
      volunteerProvidedInfo: [
        'Item category (menswear, womenswear, kidswear, linens)',
        'Estimated item count and condition declaration'
      ],
      hubPhysicalChecks: [
        'Sanitation and smell inspection at sorting bay',
        'Fabric condition and zip/button check',
        'Barcode tagging and shelf placement'
      ]
    }
  },
  {
    id: 'books',
    name: 'Books',
    code: 'books',
    emoji: '📚',
    tagline: 'Educational textbooks, storybooks, and study stationery',
    description: 'School curriculum textbooks (grades 1–12), storybooks, encyclopedias, unused notebooks, and stationery kits.',
    units: ['books', 'sets', 'bundles', 'kits'],
    defaultUnit: 'books',
    supportedHubCategoryKey: 'books',
    isActive: true,
    guidance: {
      condition: 'Readable, complete pages, intact bindings. Minor pencil markings acceptable if text is clear.',
      usability: 'Current curriculum textbooks (CBSE, ICSE, State Board) and wholesome children literature prioritized.',
      restrictions: [
        'No torn or water-damaged books with missing chapters.',
        'No commercial advertisements, catalogs, or promotional pamphlets.',
        'No adult or offensive material.'
      ],
      volunteerProvidedInfo: [
        'Book types (School Textbook, Storybook, Reference, Notebooks)',
        'Language and grade level (where applicable)'
      ],
      hubPhysicalChecks: [
        'Integrity check for missing pages',
        'Cataloguing into educational lending ledger',
        'Shelf allocation by age group'
      ]
    }
  },
  {
    id: 'other',
    name: 'Other',
    code: 'medical',
    emoji: '📦',
    tagline: 'Personal hygiene kits, first aid supplies & essential utility items',
    description: 'Unopened personal care kits, sanitary napkins, antiseptics, bandages, school bags, and durable umbrellas.',
    units: ['kits', 'packs', 'items', 'units'],
    defaultUnit: 'kits',
    supportedHubCategoryKey: 'medical',
    isActive: true,
    guidance: {
      allowedSubtypes: [
        'Personal hygiene items (soaps, toothbrushes, toothpaste, sanitary pads)',
        'First aid & wellness (unopened bandages, cotton, antiseptics, face masks)',
        'Essential utility (school backpacks, water bottles, umbrellas, flashlights)'
      ],
      safetyConditions: [
        'All hygiene and medical products must be brand-new, unopened, and within validity expiry.',
        'Strictly no prescription medicines or opened syrups.',
        'Strictly no hazardous, sharp, flammable, or toxic chemicals.',
        'Household utility goods must be functional and undamaged.'
      ],
      restrictions: [
        'No broken electronics, hazardous batteries, or expired consumables.'
      ],
      volunteerProvidedInfo: [
        'Sub-type declaration and expiry date (for wellness/hygiene)',
        'Quantity and unopened status verification'
      ],
      hubPhysicalChecks: [
        'Packaging seal verification and expiry date inspection',
        'Safety quarantine check before shelf allocation'
      ]
    }
  }
];

export const catalogueService = {
  /**
   * Fetch all resource catalogue categories with guidance and rules
   */
  async getCategories() {
    try {
      const res = await apiClient.get('/catalogue/categories');
      if (res.data?.data?.categories && Array.isArray(res.data.data.categories)) {
        return res.data.data.categories;
      }
      return FALLBACK_CATEGORIES;
    } catch (err) {
      // Graceful fallback to established standards if network or API is unreachable
      console.warn('Catalogue API unreachable, using authoritative default catalogue:', err.message);
      return FALLBACK_CATEGORIES;
    }
  },

  /**
   * Fetch a single category by ID or code
   */
  async getCategoryById(id) {
    try {
      const res = await apiClient.get(`/catalogue/categories/${id}`);
      if (res.data?.data?.category) {
        return res.data.data.category;
      }
      return FALLBACK_CATEGORIES.find((c) => c.id === id || c.code === id) || null;
    } catch (err) {
      return FALLBACK_CATEGORIES.find((c) => c.id === id || c.code === id) || null;
    }
  }
};

export default catalogueService;
