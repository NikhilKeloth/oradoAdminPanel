export const mockRestaurants = [
  { id: '1', name: 'Pizza Palace' },
  { id: '2', name: 'Burger Corner' },
  { id: '3', name: 'Taco Bell' },
  { id: '4', name: 'Chinese Delight' },
  { id: '5', name: 'Italian Bistro' },
  { id: '6', name: 'Sushi House' }
];

export const mockProducts = [
  { id: '1', name: 'Margherita Pizza', restaurantId: '1' },
  { id: '2', name: 'Pepperoni Pizza', restaurantId: '1' },
  { id: '3', name: 'Classic Burger', restaurantId: '2' },
  { id: '4', name: 'Cheese Burger', restaurantId: '2' },
  { id: '5', name: 'French Fries', restaurantId: '2' },
  { id: '6', name: 'Chicken Tacos', restaurantId: '3' },
  { id: '7', name: 'Beef Tacos', restaurantId: '3' },
  { id: '8', name: 'Fried Rice', restaurantId: '4' },
  { id: '9', name: 'Sweet & Sour Chicken', restaurantId: '4' },
  { id: '10', name: 'Pasta Alfredo', restaurantId: '5' },
  { id: '11', name: 'Carbonara', restaurantId: '5' },
  { id: '12', name: 'California Roll', restaurantId: '6' },
  { id: '13', name: 'Salmon Nigiri', restaurantId: '6' }
];

export const mockOffers = [
  {
    id: '1',
    title: '50% OFF Weekend Special',
    description: 'Get 50% off on orders above ₹500',
    applicableLevel: 'RESTAURANT',
    selectedRestaurants: ['1', '2'],
    minimumOrderValue: 500,
    discountType: 'PERCENTAGE',
    discountValue: 50,
    maxDiscount: 200,
    validFrom: '2025-01-01',
    validTill: '2025-12-31',
    usageLimitPerUser: 5,
    totalUsageLimit: 1000,
    createdBy: 'Admin',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Burger Combo Deal',
    description: 'Special combo offer for burger lovers',
    applicableLevel: 'PRODUCT',
    selectedRestaurants: ['2'],
    selectedProducts: ['3', '4', '5'],
    offerType: 'COMBO',
    comboGroups: [
      {
        name: 'Burger + Fries Combo',
        products: ['3', '5'],
        quantities: [1, 1],
        comboPrice: 299
      }
    ],
    validFrom: '2025-01-15',
    validTill: '2025-02-15',
    usageLimitPerUser: 3,
    totalUsageLimit: 500,
    createdBy: 'Restaurant',
    isActive: false,
    createdAt: '2025-01-15T00:00:00Z'
  },
  {
    id: '3',
    title: 'Flat ₹99 Off',
    description: 'Flat discount on selected items',
    applicableLevel: 'PRODUCT',
    selectedRestaurants: ['1'],
    selectedProducts: ['1', '2'],
    offerType: 'FLAT',
    discountValue: 99,
    validFrom: '2025-01-10',
    validTill: '2025-03-10',
    usageLimitPerUser: 2,
    totalUsageLimit: 200,
    createdBy: 'Admin',
    isActive: true,
    createdAt: '2025-01-10T00:00:00Z'
  },
  {
    id: '4',
    title: 'Buy 1 Get 1 Pizza',
    description: 'Buy any pizza and get another one free',
    applicableLevel: 'PRODUCT',
    selectedRestaurants: ['1'],
    selectedProducts: ['1', '2'],
    offerType: 'BOGO',
    bogoConfig: {
      buyProduct: '1',
      buyQty: 1,
      getProduct: '2',
      getQty: 1
    },
    validFrom: '2025-01-20',
    validTill: '2025-02-20',
    usageLimitPerUser: 1,
    totalUsageLimit: 100,
    createdBy: 'Restaurant',
    isActive: true,
    createdAt: '2025-01-20T00:00:00Z'
  }
];