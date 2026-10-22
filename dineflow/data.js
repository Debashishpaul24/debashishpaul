/**
 * ==============================================================================
 * DineFlow Multi-Tenant Seed Database
 * Pre-populated with The Urban Plate flagship demo restaurant data:
 * - 32 Menu items across 10 categories
 * - 20 Tables (Indoor, Patio, Rooftop)
 * - 10 Initial sample orders
 * - 10 Customer profiles
 * - 5 Active promotional offers & coupons
 * - 10 Detailed customer reviews
 * ==============================================================================
 */

const DINEFLOW_DEFAULT_DATA = {
  // Active Authentication Session
  session: {
    isAuthenticated: false,
    role: 'CUSTOMER', // 'CUSTOMER' | 'RESTAURANT_ADMIN' | 'SUPER_ADMIN'
    user: null,
    tenantId: 'the-urban-plate'
  },

  // Operational Audio & Notification Settings
  settings: {
    toneProfile: 'executive' // 'executive' | 'concierge' | 'marimba' | 'minimal' | 'mute'
  },

  // Pre-configured Staff & Admin Accounts for Instant Demo Access
  staffAccounts: [
    {
      id: 'staff-01',
      name: 'Chef Vikram Rao',
      roleTitle: 'Kitchen Operations Manager',
      role: 'RESTAURANT_ADMIN',
      tenantId: 'the-urban-plate',
      pin: '1234',
      email: 'manager@theurbanplate.in',
      password: 'admin',
      avatarEmoji: '👨‍🍳',
      department: 'Kitchen & Floor'
    },
    {
      id: 'staff-02',
      name: 'Debashish Paul',
      roleTitle: 'SaaS Platform Super Admin',
      role: 'SUPER_ADMIN',
      tenantId: null,
      pin: '9999',
      email: 'debashish@dineflow.io',
      password: 'admin',
      avatarEmoji: '⚡',
      department: 'Platform Operations & HQ'
    },
    {
      id: 'staff-03',
      name: 'Marco Rossi',
      roleTitle: 'Trattoria Floor Manager',
      role: 'RESTAURANT_ADMIN',
      tenantId: 'bella-vista',
      pin: '5678',
      email: 'manager@bellavista.in',
      password: 'admin',
      avatarEmoji: '🍕',
      department: 'Italian Cuisine Operations'
    },
    {
      id: 'staff-04',
      name: 'Kenji Sato',
      roleTitle: 'Izakaya Floor Manager',
      role: 'RESTAURANT_ADMIN',
      tenantId: 'sakura-asian',
      pin: '4321',
      email: 'manager@sakuraasian.in',
      password: 'admin',
      avatarEmoji: '🍱',
      department: 'Asian Cuisine Operations'
    }
  ],

  // Platform Audit & Security Logs (Real-time Manager Activity Ledger)
  auditLogs: [
    {
      id: 'log-101',
      timestamp: 'Today, 2:42 PM',
      isoTime: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      managerId: 'staff-01',
      managerName: 'Chef Vikram Rao',
      tenantId: 'the-urban-plate',
      tenantName: 'The Urban Plate',
      category: 'DISCOUNT',
      action: 'VIP Comp Discount Applied',
      details: 'Applied 15% VIP Courtesy Discount on Table T04',
      orderId: 'ORD-1048',
      amount: 1850,
      paymentMethod: 'UPI',
      severity: 'alert',
      securityFlag: '🚨 Review Comp'
    },
    {
      id: 'log-102',
      timestamp: 'Today, 2:15 PM',
      isoTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      managerId: 'staff-01',
      managerName: 'Chef Vikram Rao',
      tenantId: 'the-urban-plate',
      tenantName: 'The Urban Plate',
      category: 'PAYMENT',
      action: 'Bill Settled via Direct UPI',
      details: 'Table T12 payment completed via PhonePe QR',
      orderId: 'ORD-1046',
      amount: 2450,
      paymentMethod: 'UPI',
      severity: 'info',
      securityFlag: '✓ Verified'
    },
    {
      id: 'log-103',
      timestamp: 'Today, 1:52 PM',
      isoTime: new Date(Date.now() - 68 * 60 * 1000).toISOString(),
      managerId: 'staff-03',
      managerName: 'Marco Rossi',
      tenantId: 'bella-vista',
      tenantName: 'Bella Vista Trattoria',
      category: 'OVERRIDE',
      action: 'Manual Table Override',
      details: 'Table T02 manually marked Available (Guests departed)',
      orderId: 'ORD-1042',
      amount: 3150,
      paymentMethod: 'Card',
      severity: 'warning',
      securityFlag: '⚠️ Manual Clear'
    },
    {
      id: 'log-104',
      timestamp: 'Today, 1:20 PM',
      isoTime: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
      managerId: 'staff-04',
      managerName: 'Kenji Sato',
      tenantId: 'sakura-asian',
      tenantName: 'Sakura Asian Kitchen',
      category: 'STOCK',
      action: 'Menu Item 86ed (Sold Out)',
      details: 'Bluefin Tuna Sashimi marked out-of-stock for dinner rush',
      orderId: 'N/A',
      amount: 0,
      paymentMethod: 'N/A',
      severity: 'warning',
      securityFlag: '⚠️ Stock Cut'
    },
    {
      id: 'log-105',
      timestamp: 'Today, 12:45 PM',
      isoTime: new Date(Date.now() - 135 * 60 * 1000).toISOString(),
      managerId: 'staff-01',
      managerName: 'Chef Vikram Rao',
      tenantId: 'the-urban-plate',
      tenantName: 'The Urban Plate',
      category: 'PAYMENT',
      action: 'Bill Settled via POS Terminal',
      details: 'Table T07 paid via HDFC Credit Card EDC swipe',
      orderId: 'ORD-1038',
      amount: 4200,
      paymentMethod: 'Card',
      severity: 'info',
      securityFlag: '✓ Batch Synced'
    },
    {
      id: 'log-106',
      timestamp: 'Today, 12:10 PM',
      isoTime: new Date(Date.now() - 170 * 60 * 1000).toISOString(),
      managerId: 'staff-03',
      managerName: 'Marco Rossi',
      tenantId: 'bella-vista',
      tenantName: 'Bella Vista Trattoria',
      category: 'RECONCILIATION',
      action: 'Cash Register Reconciliation',
      details: 'Mid-day cash drop of ₹14,280 deposited into safe. Discrepancy: ₹0.00',
      orderId: 'CASH-DROP-01',
      amount: 14280,
      paymentMethod: 'Cash',
      severity: 'info',
      securityFlag: '✓ Reconciled'
    },
    {
      id: 'log-107',
      timestamp: 'Today, 11:30 AM',
      isoTime: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
      managerId: 'staff-04',
      managerName: 'Kenji Sato',
      tenantId: 'sakura-asian',
      tenantName: 'Sakura Asian Kitchen',
      category: 'PAYMENT',
      action: 'Bill Settled via Direct UPI',
      details: 'Table T05 QR payment settled to merchant Kotak Bank',
      orderId: 'ORD-1031',
      amount: 3890,
      paymentMethod: 'UPI',
      severity: 'info',
      securityFlag: '✓ Verified'
    },
    {
      id: 'log-108',
      timestamp: 'Today, 10:45 AM',
      isoTime: new Date(Date.now() - 255 * 60 * 1000).toISOString(),
      managerId: 'staff-01',
      managerName: 'Chef Vikram Rao',
      tenantId: 'the-urban-plate',
      tenantName: 'The Urban Plate',
      category: 'SHIFT',
      action: 'Shift Clock-In & Station Open',
      details: 'Morning operations shift started. Cash float verified: ₹5,000',
      orderId: 'SHIFT-09',
      amount: 5000,
      paymentMethod: 'Cash',
      severity: 'info',
      securityFlag: '✓ Verified'
    }
  ],

  // Current active session / tenant
  currentTenantId: 'the-urban-plate',
  currentRole: 'CUSTOMER', // CUSTOMER | RESTAURANT_ADMIN | SUPER_ADMIN
  currentTableId: 'T12',

  // Platform Tenants (Multi-Restaurant SaaS)
  tenants: {
    'the-urban-plate': {
      id: 'the-urban-plate',
      name: 'The Urban Plate',
      slug: 'the-urban-plate',
      tagline: 'Good Food. Great Moments.',
      branch: 'Kolkata • Sector V',
      address: 'Plot 12, Block EP & GP, Sector V, Salt Lake, Kolkata 700091',
      phone: '+91 98301 23456',
      email: 'dine@theurbanplate.in',
      currency: '₹',
      taxRate: 5, // 5% GST
      serviceChargeRate: 5, // 5% Service Charge
      primaryColor: '#E5A93C',
      secondaryColor: '#0F172A',
      coverImage: 'images/cover-the-urban-plate.jpg',
      logoEmoji: '🍽️',
      wifiName: 'UrbanPlate_Guest',
      wifiPass: 'GoodFood2026',
      plan: 'Enterprise Pro',
      status: 'active',
      createdAt: '2026-01-15'
    },
    'bella-vista': {
      id: 'bella-vista',
      name: 'Bella Vista Trattoria',
      slug: 'bella-vista',
      tagline: 'Authentic Wood-Fired Italian Gastronomy',
      branch: 'Park Street, Kolkata',
      address: '42A Park Street, Kolkata 700016',
      phone: '+91 98302 98765',
      email: 'ciao@bellavista.in',
      currency: '₹',
      taxRate: 5,
      serviceChargeRate: 7.5,
      primaryColor: '#10B981',
      secondaryColor: '#1E1B4B',
      coverImage: 'images/cover-bella-vista.jpg',
      logoEmoji: '🍕',
      wifiName: 'BellaVista_5G',
      wifiPass: 'PizzaPasta2026',
      plan: 'Growth Tier',
      status: 'active',
      createdAt: '2026-02-10'
    },
    'sakura-asian': {
      id: 'sakura-asian',
      name: 'Sakura Modern Asian',
      slug: 'sakura-asian',
      tagline: 'Artisanal Sushi & Pan-Asian Wok',
      branch: 'Ballygunge Circular Road, Kolkata',
      address: '18/1 Ballygunge Circular Rd, Kolkata 700019',
      phone: '+91 98303 54321',
      email: 'hello@sakuraasian.in',
      currency: '₹',
      taxRate: 5,
      serviceChargeRate: 10,
      primaryColor: '#E11D48',
      secondaryColor: '#0B0F19',
      coverImage: 'images/cover-sakura-asian.jpg',
      logoEmoji: '🥢',
      wifiName: 'Sakura_VIP',
      wifiPass: 'SushiTokyo26',
      plan: 'Enterprise Pro',
      status: 'active',
      createdAt: '2026-03-01'
    }
  },

  // Categories for The Urban Plate
  categories: [
    { id: 'cat-specials', name: "Chef's Specials", icon: '👨‍🍳', tenantId: 'the-urban-plate' },
    { id: 'cat-starters', name: 'Starters & Small Plates', icon: '🥟', tenantId: 'the-urban-plate' },
    { id: 'cat-biryani', name: 'Biryani & Pulao', icon: '🍲', tenantId: 'the-urban-plate' },
    { id: 'cat-pizza', name: 'Gourmet Pizzas', icon: '🍕', tenantId: 'the-urban-plate' },
    { id: 'cat-burgers', name: 'Artisanal Burgers', icon: '🍔', tenantId: 'the-urban-plate' },
    { id: 'cat-pasta', name: 'Handcrafted Pastas', icon: '🍝', tenantId: 'the-urban-plate' },
    { id: 'cat-mains', name: 'Main Course & Curries', icon: '🥘', tenantId: 'the-urban-plate' },
    { id: 'cat-kebabs', name: 'Tandoor & Kebabs', icon: '🍢', tenantId: 'the-urban-plate' },
    { id: 'cat-desserts', name: 'Decadent Desserts', icon: '🍰', tenantId: 'the-urban-plate' },
    { id: 'cat-beverages', name: 'Craft Beverages & Shakes', icon: '🍹', tenantId: 'the-urban-plate' }
  ],

  // 32 Detailed Menu Items for The Urban Plate
  menuItems: [
    // Chef Specials
    {
      id: 'item-01',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-specials',
      name: 'Royal Dum Handi Chicken Biryani',
      description: 'Slow-cooked fragrant aged basmati rice layered with tender marinated chicken, saffron milk, caramelized shallots, and whole roasted garam masala.',
      price: 389,
      isVeg: false,
      spiceLevel: 'medium', // mild | medium | spicy | hot
      isBestseller: true,
      isRecommended: true,
      isAvailable: true,
      image: 'images/item-01.jpg',
      allergens: ['Dairy'],
      addOns: [
        { name: 'Extra Boneless Chicken', price: 90 },
        { name: 'Spiced Boiled Egg (2 pcs)', price: 30 },
        { name: 'Burani Garlic Raita', price: 45 },
        { name: 'Mirchi Ka Salan Bowl', price: 40 }
      ],
      customizationOptions: [
        { title: 'Choose Spice Level', type: 'radio', options: ['Mild Fragrant', 'Classic Kolkata Medium', 'Fiery Hyderabadi Spicy'] }
      ]
    },
    {
      id: 'item-02',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-specials',
      name: 'Truffle & Forest Mushroom Risotto',
      description: 'Arborio rice slowly simmered in porcini reduction, finished with black winter truffle butter and aged 24-month Parmigiano-Reggiano.',
      price: 495,
      isVeg: true,
      spiceLevel: 'mild',
      isBestseller: false,
      isRecommended: true,
      isAvailable: true,
      image: 'images/item-02.jpg',
      allergens: ['Dairy', 'Gluten'],
      addOns: [
        { name: 'Extra Shaved Truffle', price: 120 },
        { name: 'Toasted Garlic Focaccia', price: 65 }
      ],
      customizationOptions: [
        { title: 'Cheese Preference', type: 'radio', options: ['Standard Aged Parmesan', 'Extra Creamy Burrata Top (+₹85)'] }
      ]
    },
    {
      id: 'item-03',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-specials',
      name: 'Smoked Butter Garlic Tiger Prawns',
      description: 'Jumbo bay prawns tossed in clarified herb butter, roasted garlic flakes, crushed birds-eye chili, and deglazed with lemon zest.',
      price: 549,
      isVeg: false,
      spiceLevel: 'medium',
      isBestseller: true,
      isRecommended: true,
      isAvailable: true,
      image: 'images/item-03.jpg',
      allergens: ['Shellfish', 'Dairy'],
      addOns: [
        { name: 'Herb Butter Rice', price: 80 },
        { name: 'Cheesy Garlic Breadsticks', price: 70 }
      ]
    },

    // Starters
    {
      id: 'item-04',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-starters',
      name: 'Crispy Corn & Water Chestnut Salt & Pepper',
      description: 'Golden fried sweet corn niblets and diced water chestnuts wok-tossed with scallions, cracked pepper, and cilantro.',
      price: 249,
      isVeg: true,
      spiceLevel: 'mild',
      isBestseller: true,
      isRecommended: false,
      isAvailable: true,
      image: 'images/item-04.jpg',
      allergens: ['Gluten'],
      addOns: [{ name: 'Spicy Schezwan Dip', price: 30 }]
    },
    {
      id: 'item-05',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-starters',
      name: 'Pan-Seared Chicken & Chive Gyoza',
      description: 'Delicate steamed dumplings with tender spiced minced chicken, pan-crisped to golden brown with chili sesame dipping oil.',
      price: 289,
      isVeg: false,
      spiceLevel: 'medium',
      isBestseller: false,
      isRecommended: true,
      isAvailable: true,
      image: 'images/item-05.jpg',
      allergens: ['Gluten', 'Soy', 'Sesame'],
      addOns: [{ name: 'Extra Dim Sum Sauce', price: 25 }]
    },
    {
      id: 'item-06',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-starters',
      name: 'Cheesy Jalapeño Potato Croquettes',
      description: 'Golden panko-crusted Idaho potato spheres filled with melted Monterey Jack, cream cheese, and fiery pickled jalapeños.',
      price: 229,
      isVeg: true,
      spiceLevel: 'spicy',
      isBestseller: true,
      isRecommended: false,
      isAvailable: true,
      image: 'images/item-06.jpg',
      allergens: ['Dairy', 'Gluten'],
      addOns: [{ name: 'Chipotle Mayo Dip', price: 35 }]
    },

    // Biryani & Pulao
    {
      id: 'item-07',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-biryani',
      name: 'Awadhi Mutton Dum Biryani',
      description: 'Melt-in-mouth cuts of prime mutton simmered in fragrant brown onion gravy, layered with aged basmati, kewra water, and saffron.',
      price: 469,
      isVeg: false,
      spiceLevel: 'medium',
      isBestseller: true,
      isRecommended: true,
      isAvailable: true,
      image: 'images/item-07.jpg',
      allergens: ['Dairy'],
      addOns: [
        { name: 'Extra Mutton Boti (2 pcs)', price: 140 },
        { name: 'Tandoori Raita', price: 40 }
      ]
    },
    {
      id: 'item-08',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-biryani',
      name: 'Zaffrani Subz Biryani (Veg)',
      description: 'Garden fresh broccoli, baby corn, French beans, carrots, and cottage cheese infused with cardamom and basmati rice.',
      price: 299,
      isVeg: true,
      spiceLevel: 'mild',
      isBestseller: false,
      isRecommended: false,
      isAvailable: true,
      image: 'images/item-08.jpg',
      allergens: ['Dairy', 'Nuts'],
      addOns: [
        { name: 'Extra Malai Paneer Cubes', price: 60 },
        { name: 'Cucumber Mint Raita', price: 35 }
      ]
    },

    // Pizzas
    {
      id: 'item-09',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-pizza',
      name: 'Burrata Margherita Pizza (12-inch)',
      description: 'Hand-stretched sourdough crust with San Marzano tomato coulis, fresh buffalo mozzarella, artisanal creamy burrata, and basil.',
      price: 429,
      isVeg: true,
      spiceLevel: 'mild',
      isBestseller: true,
      isRecommended: true,
      isAvailable: true,
      image: 'images/item-09.jpg',
      allergens: ['Gluten', 'Dairy'],
      addOns: [
        { name: 'Extra Burrata Cheese Ball', price: 95 },
        { name: 'Sun-Dried Tomatoes & Olives', price: 50 }
      ],
      customizationOptions: [
        { title: 'Crust Choice', type: 'radio', options: ['Artisanal Thin Sourdough', 'Cheese Burst Crust (+₹75)'] }
      ]
    },
    {
      id: 'item-10',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-pizza',
      name: 'Fiery BBQ Smoked Chicken Pizza',
      description: 'Smoked hickory BBQ glazed shredded chicken breast, red onions, pickled jalapeños, and four-cheese Italian mozzarella blend.',
      price: 479,
      isVeg: false,
      spiceLevel: 'spicy',
      isBestseller: true,
      isRecommended: false,
      isAvailable: true,
      image: 'images/item-10.jpg',
      allergens: ['Gluten', 'Dairy'],
      addOns: [
        { name: 'Extra Chicken Bacon Strips', price: 80 },
        { name: 'Garlic Butter Crust Dip', price: 35 }
      ]
    },
    {
      id: 'item-11',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-pizza',
      name: 'Quattro Formaggi Bianca',
      description: 'White base pizza with roasted garlic olive oil, Gorgonzola dolce, Fontina, Fior di Latte mozzarella, and aged Pecorino.',
      price: 460,
      isVeg: true,
      spiceLevel: 'mild',
      isBestseller: false,
      isRecommended: true,
      isAvailable: true,
      image: 'images/item-11.jpg',
      allergens: ['Gluten', 'Dairy']
    },

    // Burgers
    {
      id: 'item-12',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-burgers',
      name: 'The Big Boss Truffle Smash Burger',
      description: 'Double grilled tenderloin patties with molten cheddar, caramelized bourbon onions, black truffle aioli in toasted brioche.',
      price: 419,
      isVeg: false,
      spiceLevel: 'medium',
      isBestseller: true,
      isRecommended: true,
      isAvailable: true,
      image: 'images/item-12.jpg',
      allergens: ['Gluten', 'Dairy', 'Egg'],
      addOns: [
        { name: 'Crispy Peri-Peri Fries', price: 75 },
        { name: 'Crisp Fried Egg on Top', price: 25 },
        { name: 'Extra Patty & Cheese', price: 110 }
      ]
    },
    {
      id: 'item-13',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-burgers',
      name: 'Nashville Hot Crunchy Chicken Burger',
      description: 'Crispy fried chicken thigh dipped in fiery Nashville cayenne chili butter, creamy purple cabbage slaw, and dill pickles.',
      price: 369,
      isVeg: false,
      spiceLevel: 'spicy',
      isBestseller: true,
      isRecommended: false,
      isAvailable: true,
      image: 'images/item-13.jpg',
      allergens: ['Gluten', 'Dairy'],
      addOns: [{ name: 'Seasoned Potato Wedges', price: 70 }]
    },
    {
      id: 'item-14',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-burgers',
      name: 'Herb Halloumi & Roasted Portobello Burger',
      description: 'Pan-seared Cypriot halloumi slab, balsamic glazed portobello mushroom cap, baby rocket leaves, and sun-dried tomato pesto.',
      price: 349,
      isVeg: true,
      spiceLevel: 'mild',
      isBestseller: false,
      isRecommended: true,
      isAvailable: true,
      image: 'images/item-14.jpg',
      allergens: ['Gluten', 'Dairy']
    },

    // Handcrafted Pastas
    {
      id: 'item-15',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-pasta',
      name: 'Slow-Simmered Chicken Penne Alfredo',
      description: 'Al dente Italian penne tossed in velvety cream sauce of churned European butter, freshly grated parmesan, and herbed grilled chicken.',
      price: 379,
      isVeg: false,
      spiceLevel: 'mild',
      isBestseller: true,
      isRecommended: false,
      isAvailable: true,
      image: 'images/item-15.jpg',
      allergens: ['Gluten', 'Dairy'],
      addOns: [{ name: 'Toasted Garlic Herb Loaf', price: 60 }]
    },
    {
      id: 'item-16',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-pasta',
      name: 'Spaghetti Aglio Olio e Peperoncino',
      description: 'Bronze-die spaghetti swirled with extra virgin cold-pressed olive oil, golden garlic slivers, chili flakes, Kalamata olives, and fresh parsley.',
      price: 329,
      isVeg: true,
      spiceLevel: 'medium',
      isBestseller: false,
      isRecommended: true,
      isAvailable: true,
      image: 'images/item-16.jpg',
      allergens: ['Gluten'],
      addOns: [{ name: 'Add Grilled Herb Chicken', price: 75 }]
    },

    // Main Course & Curries
    {
      id: 'item-17',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-mains',
      name: 'Dhaba Style Handi Butter Chicken',
      description: 'Charcoal-smoked tandoori chicken tikka chunks simmered in a rich tomato, butter, and cashew nut velvet makhani gravy.',
      price: 399,
      isVeg: false,
      spiceLevel: 'mild',
      isBestseller: true,
      isRecommended: true,
      isAvailable: true,
      image: 'images/item-17.jpg',
      allergens: ['Dairy', 'Nuts'],
      addOns: [
        { name: 'Butter Garlic Naan', price: 55 },
        { name: 'Laccha Paratha', price: 45 }
      ]
    },
    {
      id: 'item-18',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-mains',
      name: 'Paneer Lababdar Awadhi Kadhai',
      description: 'Soft cottage cheese batons tossed with roasted bell peppers, crushed coriander seeds, and a lush spiced onion-cashew satin gravy.',
      price: 339,
      isVeg: true,
      spiceLevel: 'medium',
      isBestseller: true,
      isRecommended: false,
      isAvailable: true,
      image: 'images/item-18.jpg',
      allergens: ['Dairy', 'Nuts'],
      addOns: [{ name: 'Amritsari Kulcha', price: 65 }]
    },
    {
      id: 'item-19',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-mains',
      name: 'Dal Makhani Bukhara (Slow Simmered 24-Hrs)',
      description: 'Whole black lentils gently slow-cooked overnight over charcoal embers, enriched with fresh white butter and dairy cream.',
      price: 299,
      isVeg: true,
      spiceLevel: 'mild',
      isBestseller: true,
      isRecommended: true,
      isAvailable: true,
      image: 'images/item-19.jpg',
      allergens: ['Dairy'],
      addOns: [{ name: 'Tandoori Roti (2 pcs)', price: 40 }]
    },

    // Tandoor & Kebabs
    {
      id: 'item-20',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-kebabs',
      name: 'Bhatti Da Murgh Tangdi (3 pcs)',
      description: 'Chicken drumsticks marinated in mustard oil, roasted cumin, hung curd, and stone-ground Kashmiri chilies, char-grilled in clay tandoor.',
      price: 389,
      isVeg: false,
      spiceLevel: 'spicy',
      isBestseller: true,
      isRecommended: false,
      isAvailable: true,
      image: 'images/item-20.jpg',
      allergens: ['Dairy'],
      addOns: [{ name: 'Mint Chutney & Laccha Onion', price: 20 }]
    },
    {
      id: 'item-21',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-kebabs',
      name: 'Angara Paneer Tikka Shashlik',
      description: 'Farm-fresh cottage cheese cubes, sweet bell peppers, and shallots marinated in carom seeds, yogurt, and smoked yellow chili.',
      price: 319,
      isVeg: true,
      spiceLevel: 'medium',
      isBestseller: false,
      isRecommended: true,
      isAvailable: true,
      image: 'images/item-21.jpg',
      allergens: ['Dairy']
    },
    {
      id: 'item-22',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-kebabs',
      name: 'Melt-in-Mouth Galouti Kebab with Sheermal',
      description: 'Finely minced spiced mutton patties infused with 16 royal spices, served on warm mini saffron sheermal breads.',
      price: 449,
      isVeg: false,
      spiceLevel: 'mild',
      isBestseller: true,
      isRecommended: true,
      isAvailable: true,
      image: 'images/item-22.jpg',
      allergens: ['Dairy', 'Gluten']
    },

    // Desserts
    {
      id: 'item-23',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-desserts',
      name: 'Belgian Molten Chocolate Lava Cake',
      description: 'Warm dark chocolate souffle with a molten Callebaut chocolate center, served with Madagascan vanilla bean ice cream.',
      price: 249,
      isVeg: true,
      spiceLevel: 'mild',
      isBestseller: true,
      isRecommended: true,
      isAvailable: true,
      image: 'images/item-23.jpg',
      allergens: ['Dairy', 'Gluten', 'Egg'],
      addOns: [{ name: 'Extra Scoop Vanilla Gelato', price: 50 }]
    },
    {
      id: 'item-24',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-desserts',
      name: 'Saffron & Pistachio Shahi Tukda Brioche',
      description: 'Crispy butter-fried brioche steeped in cardamom saffron syrup, blanketed with slow-reduced thick rabri and toasted silvered pistachios.',
      price: 219,
      isVeg: true,
      spiceLevel: 'mild',
      isBestseller: false,
      isRecommended: true,
      isAvailable: true,
      image: 'images/item-24.jpg',
      allergens: ['Dairy', 'Gluten', 'Nuts']
    },
    {
      id: 'item-25',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-desserts',
      name: 'Classic New York Blueberry Cheesecake',
      description: 'Creamy Philadelphia cream cheese filling baked over a buttery graham cracker crust, topped with artisanal wild blueberry coulis.',
      price: 269,
      isVeg: true,
      spiceLevel: 'mild',
      isBestseller: true,
      isRecommended: false,
      isAvailable: true,
      image: 'images/item-25.jpg',
      allergens: ['Dairy', 'Gluten']
    },

    // Beverages
    {
      id: 'item-26',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-beverages',
      name: 'Signature Passionfruit & Basil Mojito',
      description: 'Fresh passionfruit pulp muddled with garden sweet basil, lime juice, brown cane sugar, and sparkling club soda over crushed ice.',
      price: 189,
      isVeg: true,
      spiceLevel: 'mild',
      isBestseller: true,
      isRecommended: true,
      isAvailable: true,
      image: 'images/item-26.jpg',
      allergens: []
    },
    {
      id: 'item-27',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-beverages',
      name: 'Belgian Dark Chocolate Hazelnut Shake',
      description: 'Rich dark chocolate gelato whipped with Nutella hazelnut paste, cold milk, topped with roasted hazelnut crumble and chocolate swirl.',
      price: 229,
      isVeg: true,
      spiceLevel: 'mild',
      isBestseller: true,
      isRecommended: false,
      isAvailable: true,
      image: 'images/item-27.jpg',
      allergens: ['Dairy', 'Nuts']
    },
    {
      id: 'item-28',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-beverages',
      name: 'Cold Brew Peach Iced Tea',
      description: 'Artisanal Darjeeling black tea slow-steeped for 18 hours, infused with natural white peach puree and fresh mint sprigs.',
      price: 169,
      isVeg: true,
      spiceLevel: 'mild',
      isBestseller: false,
      isRecommended: true,
      isAvailable: true,
      image: 'images/item-28.jpg',
      allergens: []
    },
    {
      id: 'item-29',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-beverages',
      name: 'Freshly Squeezed Valencia Orange & Basil',
      description: 'Pure cold-pressed seasonal oranges with chia seeds and subtle touch of pink Himalayan rock salt.',
      price: 179,
      isVeg: true,
      spiceLevel: 'mild',
      isBestseller: false,
      isRecommended: false,
      isAvailable: true,
      image: 'images/item-29.jpg',
      allergens: []
    },

    // Additional Starters & Mains for complete 32 catalog
    {
      id: 'item-30',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-starters',
      name: 'Crispy Calamari Rings with Garlic Aioli',
      description: 'Tender squid rings lightly dusted with seasoned semolina, flash-fried till golden, accompanied by roasted garlic saffron mayo.',
      price: 369,
      isVeg: false,
      spiceLevel: 'mild',
      isBestseller: false,
      isRecommended: true,
      isAvailable: true,
      image: 'images/item-30.jpg',
      allergens: ['Shellfish', 'Egg', 'Gluten']
    },
    {
      id: 'item-31',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-mains',
      name: 'Smoked Dal Tadka with Jeera Rice',
      description: 'Yellow arhar lentils tempered with ghee, cumin seeds, garlic, red chilies, and smoked with dhungar method, served with cumin basmati.',
      price: 259,
      isVeg: true,
      spiceLevel: 'medium',
      isBestseller: false,
      isRecommended: false,
      isAvailable: true,
      image: 'images/item-31.jpg',
      allergens: ['Dairy']
    },
    {
      id: 'item-32',
      tenantId: 'the-urban-plate',
      categoryId: 'cat-desserts',
      name: 'Artisanal Alphonso Mango Kulfi',
      description: 'Dense traditional condensed milk kulfi infused with pure Ratnagiri Alphonso mango pulp, saffron strands, and green cardamom.',
      price: 189,
      isVeg: true,
      spiceLevel: 'mild',
      isBestseller: true,
      isRecommended: false,
      isAvailable: true,
      image: 'images/item-32.jpg',
      allergens: ['Dairy']
    }
  ],

  // Tables partitioned by restaurant tenantId
  tables: [
    // --------------------------------------------------------------------------
    // The Urban Plate (12 Private Tables) - Bandra West
    // --------------------------------------------------------------------------
    { id: 'T01', tenantId: 'the-urban-plate', name: 'Table T01', section: 'Indoor AC Dining', capacity: 2, status: 'available', qrScans: 48, lastScanned: '10 mins ago' },
    { id: 'T02', tenantId: 'the-urban-plate', name: 'Table T02', section: 'Indoor AC Dining', capacity: 2, status: 'available', qrScans: 35, lastScanned: '25 mins ago' },
    { id: 'T03', tenantId: 'the-urban-plate', name: 'Table T03', section: 'Indoor AC Dining', capacity: 4, status: 'available', qrScans: 82, lastScanned: 'Just now' },
    { id: 'T04', tenantId: 'the-urban-plate', name: 'Table T04', section: 'Indoor AC Dining', capacity: 4, status: 'occupied', qrScans: 64, lastScanned: '5 mins ago' }, // ORD-1047
    { id: 'T05', tenantId: 'the-urban-plate', name: 'Table T05', section: 'Indoor AC Dining', capacity: 6, status: 'available', qrScans: 41, lastScanned: '1 hr ago' },
    { id: 'T06', tenantId: 'the-urban-plate', name: 'Table T06', section: 'Indoor AC Dining', capacity: 6, status: 'available', qrScans: 59, lastScanned: '15 mins ago' },
    { id: 'T07', tenantId: 'the-urban-plate', name: 'Table T07', section: 'Indoor Family Booth', capacity: 8, status: 'occupied', qrScans: 93, lastScanned: '8 mins ago' }, // ORD-1046
    { id: 'T08', tenantId: 'the-urban-plate', name: 'Table T08', section: 'Indoor Family Booth', capacity: 8, status: 'available', qrScans: 27, lastScanned: '3 hrs ago' },
    { id: 'T09', tenantId: 'the-urban-plate', name: 'Table T09', section: 'Garden Patio (Outdoor)', capacity: 2, status: 'available', qrScans: 52, lastScanned: '45 mins ago' },
    { id: 'T10', tenantId: 'the-urban-plate', name: 'Table T10', section: 'Garden Patio (Outdoor)', capacity: 2, status: 'available', qrScans: 77, lastScanned: '12 mins ago' },
    { id: 'T11', tenantId: 'the-urban-plate', name: 'Table T11', section: 'Garden Patio (Outdoor)', capacity: 4, status: 'available', qrScans: 68, lastScanned: '2 mins ago' },
    { id: 'T12', tenantId: 'the-urban-plate', name: 'Table T12', section: 'Garden Patio (Outdoor)', capacity: 4, status: 'occupied', qrScans: 142, lastScanned: 'Just now' }, // ORD-1048 primary demo

    // --------------------------------------------------------------------------
    // Bella Vista Trattoria (8 Private Tables) - Park Street
    // --------------------------------------------------------------------------
    { id: 'BV-01', tenantId: 'bella-vista', name: 'Terrazza 01', section: 'Main Trattoria', capacity: 2, status: 'available', qrScans: 38, lastScanned: '15 mins ago' },
    { id: 'BV-02', tenantId: 'bella-vista', name: 'Terrazza 02', section: 'Main Trattoria', capacity: 4, status: 'occupied', qrScans: 62, lastScanned: '3 mins ago' }, // ORD-2001
    { id: 'BV-03', tenantId: 'bella-vista', name: 'Terrazza 03', section: 'Main Trattoria', capacity: 4, status: 'available', qrScans: 29, lastScanned: '40 mins ago' },
    { id: 'BV-04', tenantId: 'bella-vista', name: 'Patio Fresco 04', section: 'Patio Fresco', capacity: 2, status: 'available', qrScans: 44, lastScanned: '1 hr ago' },
    { id: 'BV-05', tenantId: 'bella-vista', name: 'Patio Fresco 05', section: 'Patio Fresco', capacity: 6, status: 'occupied', qrScans: 81, lastScanned: '8 mins ago' }, // ORD-2002
    { id: 'BV-06', tenantId: 'bella-vista', name: 'Sala Privata 06', section: 'Sala Privata', capacity: 8, status: 'available', qrScans: 19, lastScanned: '2 hrs ago' },
    { id: 'BV-07', tenantId: 'bella-vista', name: 'Cantina 07', section: 'Wine Cellar', capacity: 2, status: 'available', qrScans: 53, lastScanned: '25 mins ago' },
    { id: 'BV-08', tenantId: 'bella-vista', name: 'Cantina 08', section: 'Wine Cellar', capacity: 4, status: 'available', qrScans: 67, lastScanned: '18 mins ago' },

    // --------------------------------------------------------------------------
    // Sakura Asian Delights (8 Private Tables) - Indiranagar
    // --------------------------------------------------------------------------
    { id: 'SK-01', tenantId: 'sakura-asian', name: 'Tatami 01', section: 'Tatami Room', capacity: 4, status: 'occupied', qrScans: 42, lastScanned: '5 mins ago' }, // ORD-3001
    { id: 'SK-02', tenantId: 'sakura-asian', name: 'Tatami 02', section: 'Tatami Room', capacity: 4, status: 'available', qrScans: 31, lastScanned: '35 mins ago' },
    { id: 'SK-03', tenantId: 'sakura-asian', name: 'Sushi Bar 03', section: 'Counter Seating', capacity: 2, status: 'available', qrScans: 55, lastScanned: '12 mins ago' },
    { id: 'SK-04', tenantId: 'sakura-asian', name: 'Sushi Bar 04', section: 'Counter Seating', capacity: 2, status: 'available', qrScans: 63, lastScanned: '20 mins ago' },
    { id: 'SK-05', tenantId: 'sakura-asian', name: 'Zen Dining 05', section: 'Zen Hall', capacity: 6, status: 'available', qrScans: 37, lastScanned: '1 hr ago' },
    { id: 'SK-06', tenantId: 'sakura-asian', name: 'Zen Dining 06', section: 'Zen Hall', capacity: 6, status: 'available', qrScans: 48, lastScanned: '45 mins ago' },
    { id: 'SK-07', tenantId: 'sakura-asian', name: 'Bamboo Garden 07', section: 'Outdoor Bamboo', capacity: 4, status: 'available', qrScans: 22, lastScanned: '3 hrs ago' },
    { id: 'SK-08', tenantId: 'sakura-asian', name: 'Bamboo Garden 08', section: 'Outdoor Bamboo', capacity: 8, status: 'available', qrScans: 18, lastScanned: '4 hrs ago' }
  ],

  // Promotional Offers partitioned by tenantId
  offers: [
    {
      id: 'off-1',
      tenantId: 'the-urban-plate',
      code: 'LUNCH20',
      title: '20% OFF on Mains & Biryanis',
      description: 'Valid everyday from 12:00 PM to 4:00 PM on orders above ₹500.',
      type: 'percentage',
      value: 20,
      minOrder: 500,
      maxDiscount: 200,
      categoryScope: 'cat-biryani',
      expiry: '31 Oct 2026',
      isActive: true
    },
    {
      id: 'off-2',
      tenantId: 'the-urban-plate',
      code: 'FIRSTBITE',
      title: 'Flat ₹100 OFF First Order',
      description: 'Exclusive welcome treat for first-time digital QR diners.',
      type: 'flat',
      value: 100,
      minOrder: 600,
      maxDiscount: 100,
      categoryScope: 'all',
      expiry: '30 Nov 2026',
      isActive: true
    },
    {
      id: 'off-3',
      tenantId: 'bella-vista',
      code: 'BELLAPIZZA',
      title: 'Buy 1 Gourmet Pizza, Get 50% on 2nd',
      description: 'Applies automatically to any two artisanal pizzas in cart.',
      type: 'percentage',
      value: 25,
      minOrder: 700,
      maxDiscount: 250,
      categoryScope: 'cat-pizza',
      expiry: '15 Nov 2026',
      isActive: true
    },
    {
      id: 'off-4',
      tenantId: 'bella-vista',
      code: 'DOLCE50',
      title: 'Flat ₹50 OFF on Italian Desserts',
      description: 'Satisfy your sweet tooth with our chef-crafted gourmet desserts.',
      type: 'flat',
      value: 50,
      minOrder: 300,
      maxDiscount: 50,
      categoryScope: 'cat-desserts',
      expiry: '31 Dec 2026',
      isActive: true
    },
    {
      id: 'off-5',
      tenantId: 'sakura-asian',
      code: 'SAKURA15',
      title: '15% OFF Sushi & Asian Specialties',
      description: 'Exclusive dining privilege on orders above ₹800.',
      type: 'percentage',
      value: 15,
      minOrder: 800,
      maxDiscount: 300,
      categoryScope: 'all',
      expiry: '31 Dec 2026',
      isActive: true
    }
  ],

  // 10 Initial Sample Orders (Representing live restaurant state)
  orders: [
    {
      id: 'ORD-1048',
      tenantId: 'the-urban-plate',
      tableId: 'T12',
      customerName: 'Rahul Verma',
      customerPhone: '+91 98311 00223',
      status: 'PREPARING', // RECEIVED | CONFIRMED | PREPARING | READY | SERVED | COMPLETED
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      items: [
        {
          id: 'item-01',
          name: 'Royal Dum Handi Chicken Biryani',
          price: 389,
          quantity: 2,
          customizations: { spice: 'Medium', addOns: ['Burani Garlic Raita'] },
          specialInstructions: 'Please make it fresh and aromatic.'
        },
        {
          id: 'item-26',
          name: 'Signature Passionfruit & Basil Mojito',
          price: 189,
          quantity: 2,
          customizations: {},
          specialInstructions: 'Extra ice please'
        }
      ],
      subtotal: 1156,
      discount: 100, // FIRSTBITE applied
      tax: 52.8,
      serviceCharge: 52.8,
      total: 1161.6,
      paymentMethod: 'UPI',
      paymentStatus: 'PENDING',
      estimatedMinutes: 20
    },
    {
      id: 'ORD-1047',
      tenantId: 'the-urban-plate',
      tableId: 'T04',
      customerName: 'Sneha Roy',
      status: 'CONFIRMED',
      timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
      items: [
        { id: 'item-09', name: 'Burrata Margherita Pizza', price: 429, quantity: 1, customizations: { crust: 'Sourdough' } },
        { id: 'item-27', name: 'Belgian Dark Chocolate Hazelnut Shake', price: 229, quantity: 1, customizations: {} }
      ],
      subtotal: 658,
      discount: 0,
      tax: 32.9,
      serviceCharge: 32.9,
      total: 723.8,
      paymentMethod: 'CARD',
      paymentStatus: 'PENDING',
      estimatedMinutes: 15
    },
    {
      id: 'ORD-1046',
      tenantId: 'the-urban-plate',
      tableId: 'T07',
      customerName: 'Vikram Sengupta',
      status: 'READY',
      timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
      items: [
        { id: 'item-20', name: 'Bhatti Da Murgh Tangdi', price: 389, quantity: 2, customizations: {} },
        { id: 'item-17', name: 'Dhaba Style Handi Butter Chicken', price: 399, quantity: 1, customizations: {} },
        { id: 'item-06', name: 'Cheesy Jalapeño Potato Croquettes', price: 229, quantity: 1, customizations: {} }
      ],
      subtotal: 1406,
      discount: 150,
      tax: 62.8,
      serviceCharge: 62.8,
      total: 1381.6,
      paymentMethod: 'CASH',
      paymentStatus: 'PENDING',
      estimatedMinutes: 0
    },
    {
      id: 'ORD-1045',
      tenantId: 'the-urban-plate',
      tableId: 'T15',
      customerName: 'Priya Mukherjee',
      status: 'SERVED',
      timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      items: [
        { id: 'item-12', name: 'The Big Boss Truffle Smash Burger', price: 419, quantity: 2, customizations: {} },
        { id: 'item-23', name: 'Belgian Molten Chocolate Lava Cake', price: 249, quantity: 1, customizations: {} }
      ],
      subtotal: 1087,
      discount: 0,
      tax: 54.35,
      serviceCharge: 54.35,
      total: 1195.7,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      estimatedMinutes: 0
    },
    {
      id: 'ORD-1044',
      tenantId: 'the-urban-plate',
      tableId: 'T01',
      customerName: 'Amitava Bose',
      status: 'COMPLETED',
      timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
      items: [
        { id: 'item-02', name: 'Truffle & Forest Mushroom Risotto', price: 495, quantity: 1, customizations: {} },
        { id: 'item-28', name: 'Cold Brew Peach Iced Tea', price: 169, quantity: 1, customizations: {} }
      ],
      subtotal: 664,
      discount: 50,
      tax: 30.7,
      serviceCharge: 30.7,
      total: 675.4,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      estimatedMinutes: 0
    },
    {
      id: 'ORD-1043',
      tenantId: 'the-urban-plate',
      tableId: 'T03',
      customerName: 'Ananya Dutta',
      status: 'COMPLETED',
      timestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
      items: [
        { id: 'item-07', name: 'Awadhi Mutton Dum Biryani', price: 469, quantity: 2, customizations: {} }
      ],
      subtotal: 938,
      discount: 0,
      tax: 46.9,
      serviceCharge: 46.9,
      total: 1031.8,
      paymentMethod: 'CARD',
      paymentStatus: 'PAID'
    },
    {
      id: 'ORD-1042',
      tenantId: 'the-urban-plate',
      tableId: 'T10',
      customerName: 'Debabrata Das',
      status: 'COMPLETED',
      timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
      items: [
        { id: 'item-10', name: 'Fiery BBQ Smoked Chicken Pizza', price: 479, quantity: 1, customizations: {} },
        { id: 'item-27', name: 'Belgian Dark Chocolate Hazelnut Shake', price: 229, quantity: 2, customizations: {} }
      ],
      subtotal: 937,
      discount: 100,
      tax: 41.8,
      serviceCharge: 41.8,
      total: 920.6,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID'
    },
    {
      id: 'ORD-1041',
      tenantId: 'the-urban-plate',
      tableId: 'T18',
      customerName: 'Sanjay Kapoor',
      status: 'COMPLETED',
      timestamp: new Date(Date.now() - 130 * 60 * 1000).toISOString(),
      items: [
        { id: 'item-17', name: 'Dhaba Style Handi Butter Chicken', price: 399, quantity: 2, customizations: {} },
        { id: 'item-19', name: 'Dal Makhani Bukhara', price: 299, quantity: 1, customizations: {} }
      ],
      subtotal: 1097,
      discount: 0,
      tax: 54.8,
      serviceCharge: 54.8,
      total: 1206.6,
      paymentMethod: 'CARD',
      paymentStatus: 'PAID'
    },
    {
      id: 'ORD-1040',
      tenantId: 'the-urban-plate',
      tableId: 'T11',
      customerName: 'Tanvi Chawla',
      status: 'COMPLETED',
      timestamp: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
      items: [
        { id: 'item-04', name: 'Crispy Corn & Water Chestnut', price: 249, quantity: 1, customizations: {} },
        { id: 'item-15', name: 'Chicken Penne Alfredo', price: 379, quantity: 1, customizations: {} },
        { id: 'item-26', name: 'Passionfruit & Basil Mojito', price: 189, quantity: 1, customizations: {} }
      ],
      subtotal: 817,
      discount: 50,
      tax: 38.3,
      serviceCharge: 38.3,
      total: 843.6,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID'
    },
    {
      id: 'ORD-1039',
      tenantId: 'the-urban-plate',
      tableId: 'T19',
      customerName: 'Rohan Mehra',
      status: 'COMPLETED',
      timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      items: [
        { id: 'item-03', name: 'Tiger Prawns', price: 549, quantity: 2, customizations: {} },
        { id: 'item-22', name: 'Galouti Kebab', price: 449, quantity: 2, customizations: {} },
        { id: 'item-23', name: 'Molten Lava Cake', price: 249, quantity: 2, customizations: {} }
      ],
      subtotal: 2494,
      discount: 250,
      tax: 112.2,
      serviceCharge: 112.2,
      total: 2468.4,
      paymentMethod: 'CARD',
      paymentStatus: 'PAID'
    },
    // Bella Vista Trattoria Sample Orders
    {
      id: 'ORD-2001',
      tenantId: 'bella-vista',
      tableId: 'BV-02',
      customerName: 'Giulia Moretti',
      customerPhone: '+91 98201 44552',
      status: 'CONFIRMED',
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      items: [
        { id: 'item-bv-01', name: 'Woodfired Margherita Burrata Pizza', price: 480, quantity: 1, customizations: { crust: 'Neapolitan' } },
        { id: 'item-bv-02', name: 'Truffle Porcini Fettuccine', price: 410, quantity: 1, customizations: {} }
      ],
      subtotal: 890,
      discount: 0,
      tax: 44.5,
      serviceCharge: 44.5,
      total: 979.0,
      paymentMethod: 'CARD',
      paymentStatus: 'PENDING',
      estimatedMinutes: 18
    },
    {
      id: 'ORD-2002',
      tenantId: 'bella-vista',
      tableId: 'BV-05',
      customerName: 'Alessandro Conti',
      customerPhone: '+91 98203 99881',
      status: 'PREPARING',
      timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
      items: [
        { id: 'item-bv-03', name: 'Four Cheese Quattro Formaggi', price: 520, quantity: 1, customizations: {} },
        { id: 'item-bv-04', name: 'Traditional Espresso Tiramisu', price: 290, quantity: 2, customizations: {} }
      ],
      subtotal: 1100,
      discount: 50,
      tax: 52.5,
      serviceCharge: 52.5,
      total: 1155.0,
      paymentMethod: 'UPI',
      paymentStatus: 'PENDING',
      estimatedMinutes: 22
    },
    // Sakura Asian Kitchen Sample Orders
    {
      id: 'ORD-3001',
      tenantId: 'sakura-asian',
      tableId: 'SK-01',
      customerName: 'Kenji Tanaka',
      customerPhone: '+91 98199 11224',
      status: 'PREPARING',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      items: [
        { id: 'item-sk-01', name: 'Salmon & Bluefin Nigiri Combo (8 pcs)', price: 680, quantity: 1, customizations: {} },
        { id: 'item-sk-02', name: 'Black Garlic Tonkotsu Ramen', price: 480, quantity: 1, customizations: { broth: 'Rich Tonkotsu' } }
      ],
      subtotal: 1160,
      discount: 100,
      tax: 53.0,
      serviceCharge: 53.0,
      total: 1166.0,
      paymentMethod: 'UPI',
      paymentStatus: 'PENDING',
      estimatedMinutes: 15
    }
  ],

  // Active Staff Call Requests partitioned by tenantId
  staffRequests: [
    { id: 'REQ-101', tenantId: 'the-urban-plate', tableId: 'T12', type: 'WATER', label: 'Need Chilled Water', status: 'PENDING', time: '2 mins ago' },
    { id: 'REQ-102', tenantId: 'the-urban-plate', tableId: 'T04', type: 'CUTLERY', label: 'Need Extra Spoons & Napkins', status: 'PENDING', time: '6 mins ago' },
    { id: 'REQ-103', tenantId: 'the-urban-plate', tableId: 'T11', type: 'WAITER', label: 'Call Server to Table', status: 'ATTENDING', time: '10 mins ago' },
    { id: 'REQ-201', tenantId: 'bella-vista', tableId: 'BV-05', type: 'WAITER', label: 'Call Server for Sommelier / Wine List', status: 'PENDING', time: '4 mins ago' },
    { id: 'REQ-301', tenantId: 'sakura-asian', tableId: 'SK-01', type: 'WASABI', label: 'Extra Fresh Grated Wasabi & Pickled Ginger', status: 'PENDING', time: '5 mins ago' }
  ],

  // Active Bill Requests partitioned by tenantId
  billRequests: [
    { id: 'BILL-101', tenantId: 'the-urban-plate', tableId: 'T07', amount: 1381.6, paymentMethod: 'UPI', status: 'PENDING', time: '3 mins ago' },
    { id: 'BILL-201', tenantId: 'bella-vista', tableId: 'BV-02', amount: 979.0, paymentMethod: 'CARD', status: 'PENDING', time: '5 mins ago' }
  ],

  // 10 Customer Profiles (CRM)
  customers: [
    { id: 'CUST-01', name: 'Rahul Verma', phone: '+91 98311 00223', email: 'rahul.v@gmail.com', ordersCount: 8, totalSpend: 8450, favDish: 'Royal Dum Handi Chicken Biryani', lastVisit: 'Today' },
    { id: 'CUST-02', name: 'Sneha Roy', phone: '+91 98305 77665', email: 'sneharoy@outlook.com', ordersCount: 5, totalSpend: 4200, favDish: 'Burrata Margherita Pizza', lastVisit: 'Today' },
    { id: 'CUST-03', name: 'Vikram Sengupta', phone: '+91 98302 11988', email: 'vikram.sengupta@tcs.com', ordersCount: 14, totalSpend: 16800, favDish: 'Awadhi Mutton Dum Biryani', lastVisit: 'Today' },
    { id: 'CUST-04', name: 'Priya Mukherjee', phone: '+91 98314 44556', email: 'priya.m@techcorp.in', ordersCount: 3, totalSpend: 3100, favDish: 'Truffle Smash Burger', lastVisit: 'Today' },
    { id: 'CUST-05', name: 'Amitava Bose', phone: '+91 98309 33221', email: 'amitava.bose@gmail.com', ordersCount: 11, totalSpend: 12500, favDish: 'Truffle Mushroom Risotto', lastVisit: 'Today' },
    { id: 'CUST-06', name: 'Ananya Dutta', phone: '+91 98318 66778', email: 'ananya.d@gmail.com', ordersCount: 6, totalSpend: 5900, favDish: 'Molten Lava Cake', lastVisit: 'Yesterday' },
    { id: 'CUST-07', name: 'Debabrata Das', phone: '+91 98301 99887', email: 'debabrata.das@wipro.com', ordersCount: 9, totalSpend: 9200, favDish: 'Bhatti Da Murgh Tangdi', lastVisit: '2 days ago' },
    { id: 'CUST-08', name: 'Sanjay Kapoor', phone: '+91 98312 88990', email: 'sanjay.k@venture.in', ordersCount: 7, totalSpend: 7800, favDish: 'Handi Butter Chicken', lastVisit: '3 days ago' },
    { id: 'CUST-09', name: 'Tanvi Chawla', phone: '+91 98304 22334', email: 'tanvi.c@designstudio.com', ordersCount: 4, totalSpend: 3950, favDish: 'Passionfruit Mojito', lastVisit: '4 days ago' },
    { id: 'CUST-10', name: 'Rohan Mehra', phone: '+91 98307 11223', email: 'rohan.mehra@lawllp.in', ordersCount: 16, totalSpend: 24500, favDish: 'Melt-in-Mouth Galouti Kebab', lastVisit: '5 days ago' }
  ],

  // 10 Detailed Customer Reviews
  reviews: [
    {
      id: 'rev-01',
      customerName: 'Rahul Verma',
      ratingOverall: 5,
      ratingFood: 5,
      ratingService: 5,
      ratingAmbience: 5,
      comment: 'Scanning the QR code and ordering directly from Table T12 was blazing fast! The Biryani arrived piping hot in 18 minutes. Elite digital dining experience.',
      tableId: 'T12',
      date: 'Today, 2:15 PM'
    },
    {
      id: 'rev-02',
      customerName: 'Sneha Roy',
      ratingOverall: 5,
      ratingFood: 5,
      ratingService: 4,
      ratingAmbience: 5,
      comment: 'The sourdough pizza crust is truly authentic Italian. Loved being able to call the server for extra chili flakes right from the phone without waving hands!',
      tableId: 'T04',
      date: 'Today, 1:40 PM'
    },
    {
      id: 'rev-03',
      customerName: 'Vikram Sengupta',
      ratingOverall: 5,
      ratingFood: 5,
      ratingService: 5,
      ratingAmbience: 5,
      comment: 'Awadhi Mutton Biryani is the finest in Sector V. The real-time order tracker on my phone kept us updated at every stage.',
      tableId: 'T07',
      date: 'Today, 1:10 PM'
    },
    {
      id: 'rev-04',
      customerName: 'Priya Mukherjee',
      ratingOverall: 4,
      ratingFood: 5,
      ratingService: 4,
      ratingAmbience: 5,
      comment: 'Rooftop ambience at Table T15 is magical. Lava cake was decadent and molten. Will definitely return with friends.',
      tableId: 'T15',
      date: 'Today, 12:50 PM'
    },
    {
      id: 'rev-05',
      customerName: 'Amitava Bose',
      ratingOverall: 5,
      ratingFood: 5,
      ratingService: 5,
      ratingAmbience: 4,
      comment: 'Truffle risotto was rich and aromatic. Requesting the bill through the web app took just 1 click and staff arrived with the card machine immediately.',
      tableId: 'T01',
      date: 'Today, 12:20 PM'
    },
    {
      id: 'rev-06',
      customerName: 'Ananya Dutta',
      ratingOverall: 5,
      ratingFood: 5,
      ratingService: 5,
      ratingAmbience: 5,
      comment: 'Zero friction QR ordering. No downloading clunky apps. So smooth and clean!',
      tableId: 'T03',
      date: 'Yesterday'
    },
    {
      id: 'rev-07',
      customerName: 'Debabrata Das',
      ratingOverall: 4,
      ratingFood: 4,
      ratingService: 5,
      ratingAmbience: 4,
      comment: 'Bhatti Da Murgh had that authentic smoky tandoor flavor. Great hospitality and fast service.',
      tableId: 'T10',
      date: '2 days ago'
    },
    {
      id: 'rev-08',
      customerName: 'Sanjay Kapoor',
      ratingOverall: 5,
      ratingFood: 5,
      ratingService: 4,
      ratingAmbience: 5,
      comment: 'Butter chicken and garlic naan are top tier. The garden patio setting was serene.',
      tableId: 'T18',
      date: '3 days ago'
    },
    {
      id: 'rev-09',
      customerName: 'Tanvi Chawla',
      ratingOverall: 5,
      ratingFood: 5,
      ratingService: 5,
      ratingAmbience: 5,
      comment: 'Loved the allergen information and spice levels marked on every dish. Makes dining so peaceful.',
      tableId: 'T11',
      date: '4 days ago'
    },
    {
      id: 'rev-10',
      customerName: 'Rohan Mehra',
      ratingOverall: 5,
      ratingFood: 5,
      ratingService: 5,
      ratingAmbience: 5,
      comment: 'The private cabana experience is benchmark quality. High value for corporate dinners.',
      tableId: 'T19',
      date: '5 days ago'
    }
  ]
};

// Store helper for localStorage persistence with state change broadcast
const DineFlowStore = {
  KEY: 'DINEFLOW_SaaS_STORE_v3',
  broadcastChannel: null,

  init() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('dineflow_realtime_sync');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'SYNC') {
          // Trigger local render callback if registered
          if (typeof window.onDineFlowRemoteSync === 'function') {
            window.onDineFlowRemoteSync(event.data);
          }
        }
      };
    }
  },

  get() {
    try {
      // Migrate previous v1 / v2 localStorage stores if v3 is not yet populated
      let stored = localStorage.getItem(this.KEY);
      if (!stored) {
        stored = localStorage.getItem('DINEFLOW_SaaS_STORE_v2') || localStorage.getItem('DINEFLOW_SaaS_STORE_v1');
      }
      if (stored) {
        const data = JSON.parse(stored);
        // Resilient corporate VPN migration: ensure all dish images reference local bundled assets
        if (data && Array.isArray(data.menuItems)) {
          let updated = false;
          data.menuItems.forEach((item) => {
            if (!item.image || item.image.includes('unsplash.com')) {
              item.image = 'images/' + item.id + '.jpg';
              updated = true;
            }
          });
          if (data.tenants) {
            if (data.tenants['the-urban-plate'] && data.tenants['the-urban-plate'].coverImage.includes('unsplash.com')) {
              data.tenants['the-urban-plate'].coverImage = 'images/cover-the-urban-plate.jpg';
              updated = true;
            }
            if (data.tenants['bella-vista'] && data.tenants['bella-vista'].coverImage.includes('unsplash.com')) {
              data.tenants['bella-vista'].coverImage = 'images/cover-bella-vista.jpg';
              updated = true;
            }
            if (data.tenants['sakura-asian'] && data.tenants['sakura-asian'].coverImage.includes('unsplash.com')) {
              data.tenants['sakura-asian'].coverImage = 'images/cover-sakura-asian.jpg';
              updated = true;
            }
          }
          if (!data.staffAccounts || !Array.isArray(data.staffAccounts)) {
            data.staffAccounts = JSON.parse(JSON.stringify(DINEFLOW_DEFAULT_DATA.staffAccounts));
            updated = true;
          }
          if (!data.session) {
            data.session = JSON.parse(JSON.stringify(DINEFLOW_DEFAULT_DATA.session));
            updated = true;
          }
          if (!data.settings || typeof data.settings.toneProfile !== 'string') {
            data.settings = { toneProfile: 'executive' };
            updated = true;
          }
          if (!data.auditLogs || !Array.isArray(data.auditLogs) || data.auditLogs.length === 0) {
            data.auditLogs = JSON.parse(JSON.stringify(DINEFLOW_DEFAULT_DATA.auditLogs || []));
            updated = true;
          }

          // Multi-Tenant Isolation Migration: Ensure partitioned tables exist
          if (!Array.isArray(data.tables) || !data.tables.some(t => t.tenantId === 'bella-vista')) {
            data.tables = JSON.parse(JSON.stringify(DINEFLOW_DEFAULT_DATA.tables));
            updated = true;
          } else {
            // Ensure every table has tenantId
            data.tables.forEach(t => {
              if (!t.tenantId) {
                t.tenantId = 'the-urban-plate';
                updated = true;
              }
            });
          }

          // Multi-Tenant Isolation Migration: Ensure offers are partitioned
          if (!Array.isArray(data.offers) || !data.offers.some(o => o.tenantId === 'bella-vista')) {
            data.offers = JSON.parse(JSON.stringify(DINEFLOW_DEFAULT_DATA.offers));
            updated = true;
          }

          // Multi-Tenant Isolation Migration: Ensure orders have tenantId and other restaurants have sample orders
          if (Array.isArray(data.orders)) {
            data.orders.forEach(o => {
              if (!o.tenantId) {
                o.tenantId = 'the-urban-plate';
                updated = true;
              }
            });
            if (!data.orders.some(o => o.tenantId === 'bella-vista')) {
              const bvOrders = DINEFLOW_DEFAULT_DATA.orders.filter(o => o.tenantId === 'bella-vista');
              data.orders.push(...JSON.parse(JSON.stringify(bvOrders)));
              updated = true;
            }
            if (!data.orders.some(o => o.tenantId === 'sakura-asian')) {
              const skOrders = DINEFLOW_DEFAULT_DATA.orders.filter(o => o.tenantId === 'sakura-asian');
              data.orders.push(...JSON.parse(JSON.stringify(skOrders)));
              updated = true;
            }
          }

          // Multi-Tenant Isolation Migration: Ensure staffRequests & billRequests have tenantId
          if (Array.isArray(data.staffRequests)) {
            data.staffRequests.forEach(r => {
              if (!r.tenantId) {
                r.tenantId = 'the-urban-plate';
                updated = true;
              }
            });
            if (!data.staffRequests.some(r => r.tenantId === 'bella-vista')) {
              const bvReqs = DINEFLOW_DEFAULT_DATA.staffRequests.filter(r => r.tenantId === 'bella-vista' || r.tenantId === 'sakura-asian');
              data.staffRequests.push(...JSON.parse(JSON.stringify(bvReqs)));
              updated = true;
            }
          }
          if (Array.isArray(data.billRequests)) {
            data.billRequests.forEach(b => {
              if (!b.tenantId) {
                b.tenantId = 'the-urban-plate';
                updated = true;
              }
            });
            if (!data.billRequests.some(b => b.tenantId === 'bella-vista')) {
              const bvBills = DINEFLOW_DEFAULT_DATA.billRequests.filter(b => b.tenantId === 'bella-vista');
              data.billRequests.push(...JSON.parse(JSON.stringify(bvBills)));
              updated = true;
            }
          }

          // Tenant-Isolated Auto-reconciliation of table statuses using composite keys: `${tenantId}::${tableId}`
          if (Array.isArray(data.tables) && Array.isArray(data.orders)) {
            const activeTableKeys = new Set(
              data.orders
                .filter(o => o.status && o.status !== 'COMPLETED' && o.status !== 'CANCELLED')
                .map(o => `${o.tenantId || 'the-urban-plate'}::${o.tableId}`)
            );
            if (Array.isArray(data.billRequests)) {
              data.billRequests.filter(b => b.status === 'PENDING').forEach(b => activeTableKeys.add(`${b.tenantId || 'the-urban-plate'}::${b.tableId}`));
            }
            if (Array.isArray(data.staffRequests)) {
              data.staffRequests.filter(s => s.status === 'PENDING').forEach(s => activeTableKeys.add(`${s.tenantId || 'the-urban-plate'}::${s.tableId}`));
            }
            data.tables.forEach(table => {
              const tableKey = `${table.tenantId || 'the-urban-plate'}::${table.id}`;
              if (activeTableKeys.has(tableKey) || table.manuallyOccupied === true) {
                if (table.status !== 'occupied') {
                  table.status = 'occupied';
                  updated = true;
                }
              } else {
                if (table.status !== 'available') {
                  table.status = 'available';
                  updated = true;
                }
              }
            });
          }

          if (updated || !localStorage.getItem(this.KEY)) {
            this.save(data);
          }
        }
        return data;
      }
    } catch (e) {
      console.warn('Failed reading localStorage', e);
    }
    // Return clone of default
    const fresh = JSON.parse(JSON.stringify(DINEFLOW_DEFAULT_DATA));
    this.save(fresh);
    return fresh;
  },

  save(data, meta = {}) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({
          type: 'SYNC',
          payload: data,
          meta: meta,
          timestamp: Date.now()
        });
      }
      if (meta && meta.action && typeof window !== 'undefined' && window.DineFlowCloudSync && typeof window.DineFlowCloudSync.broadcast === 'function') {
        window.DineFlowCloudSync.broadcast(meta);
      }
    } catch (e) {
      console.error('Failed saving localStorage', e);
    }
  },

  recordLog(entry) {
    try {
      const data = this.get();
      if (!Array.isArray(data.auditLogs)) {
        data.auditLogs = JSON.parse(JSON.stringify(DINEFLOW_DEFAULT_DATA.auditLogs || []));
      }
      const tenant = (data.tenants && entry.tenantId && data.tenants[entry.tenantId]) ? data.tenants[entry.tenantId] : null;
      const tenantName = entry.tenantName || (tenant ? tenant.name : 'The Urban Plate');
      const now = new Date();
      const timeStr = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      
      const newLog = {
        id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        timestamp: timeStr,
        isoTime: now.toISOString(),
        managerId: entry.managerId || (data.session?.user?.id || 'staff-01'),
        managerName: entry.managerName || (data.session?.user?.name || 'Chef Vikram Rao'),
        tenantId: entry.tenantId || (data.session?.tenantId || 'the-urban-plate'),
        tenantName: tenantName,
        category: entry.category || 'INFO',
        action: entry.action || 'Manager Operation',
        details: entry.details || '',
        orderId: entry.orderId || 'N/A',
        amount: typeof entry.amount === 'number' ? entry.amount : 0,
        paymentMethod: entry.paymentMethod || 'UPI',
        severity: entry.severity || 'info',
        securityFlag: entry.securityFlag || '✓ Verified'
      };

      data.auditLogs.unshift(newLog);
      if (data.auditLogs.length > 150) {
        data.auditLogs = data.auditLogs.slice(0, 150);
      }
      this.save(data, { action: 'AUDIT_LOG_RECORDED', log: newLog });
      return newLog;
    } catch (e) {
      console.warn('Failed recording audit log', e);
      return null;
    }
  },

  saveLocalOnly(data) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed saving localStorage local-only', e);
    }
  },

  reset() {
    localStorage.removeItem(this.KEY);
    return this.get();
  }
};

DineFlowStore.init();
