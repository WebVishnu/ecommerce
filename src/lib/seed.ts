import dbConnect from './db';
import Product from '@/models/Product';
import User from '@/models/User';
import OTP from '@/models/OTP';

const sampleProducts = [
  {
    name: "Exide Inverter Battery 150Ah",
    description: "High-performance inverter battery with long backup time and maintenance-free operation.",
    price: 8500,
    originalPrice: 9500,
    category: "inverter",
    brand: "Exide",
    model: "150Ah",
    capacity: "150Ah",
    voltage: "12V",
    warranty: "3 Years",
    stock: 25,
    images: [
      "https://example.com/exide-150ah-1.jpg",
      "https://example.com/exide-150ah-2.jpg"
    ],
    specifications: {
      "Type": "Tubular",
      "Technology": "Lead Acid",
      "Backup Time": "8-10 hours",
      "Cycle Life": "1200 cycles",
      "Weight": "45 kg"
    },
    features: [
      "Maintenance-free operation",
      "Long backup time",
      "High cycle life",
      "Tubular technology",
      "Corrosion resistant"
    ],
    rating: 4.5,
    reviews: 128,
    isActive: true,
    isFeatured: true
  },
  {
    name: "Amaron Automotive Battery 35Ah",
    description: "Reliable automotive battery with excellent starting power and durability.",
    price: 3200,
    originalPrice: 3800,
    category: "automotive",
    brand: "Amaron",
    model: "35Ah",
    capacity: "35Ah",
    voltage: "12V",
    warranty: "2 Years",
    stock: 40,
    images: [
      "https://example.com/amaron-35ah-1.jpg",
      "https://example.com/amaron-35ah-2.jpg"
    ],
    specifications: {
      "Type": "Maintenance Free",
      "Technology": "Lead Acid",
      "CCA": "520A",
      "Reserve Capacity": "65 minutes",
      "Weight": "12 kg"
    },
    features: [
      "Maintenance-free design",
      "High CCA rating",
      "Vibration resistant",
      "Long service life",
      "Quick charging"
    ],
    rating: 4.3,
    reviews: 95,
    isActive: true,
    isFeatured: false
  },
  {
    name: "Luminous Solar Battery 200Ah",
    description: "Deep cycle solar battery designed for solar power systems and renewable energy applications.",
    price: 12500,
    originalPrice: 14000,
    category: "solar",
    brand: "Luminous",
    model: "200Ah",
    capacity: "200Ah",
    voltage: "12V",
    warranty: "5 Years",
    stock: 15,
    images: [
      "https://example.com/luminous-200ah-1.jpg",
      "https://example.com/luminous-200ah-2.jpg"
    ],
    specifications: {
      "Type": "Deep Cycle",
      "Technology": "Lead Acid",
      "Depth of Discharge": "80%",
      "Cycle Life": "1500 cycles",
      "Weight": "62 kg"
    },
    features: [
      "Deep cycle design",
      "High depth of discharge",
      "Long cycle life",
      "Solar optimized",
      "Low maintenance"
    ],
    rating: 4.7,
    reviews: 67,
    isActive: true,
    isFeatured: true
  },
  {
    name: "Microtek UPS Battery 100Ah",
    description: "Reliable UPS battery for uninterrupted power supply systems.",
    price: 6800,
    originalPrice: 7500,
    category: "ups",
    brand: "Microtek",
    model: "100Ah",
    capacity: "100Ah",
    voltage: "12V",
    warranty: "3 Years",
    stock: 30,
    images: [
      "https://example.com/microtek-100ah-1.jpg",
      "https://example.com/microtek-100ah-2.jpg"
    ],
    specifications: {
      "Type": "Sealed",
      "Technology": "VRLA",
      "Backup Time": "4-6 hours",
      "Cycle Life": "800 cycles",
      "Weight": "32 kg"
    },
    features: [
      "Sealed design",
      "No maintenance required",
      "Safe operation",
      "Long backup time",
      "Compact size"
    ],
    rating: 4.2,
    reviews: 89,
    isActive: true,
    isFeatured: false
  },
  {
    name: "Exide Industrial Battery 500Ah",
    description: "Heavy-duty industrial battery for commercial and industrial applications.",
    price: 25000,
    originalPrice: 28000,
    category: "industrial",
    brand: "Exide",
    model: "500Ah",
    capacity: "500Ah",
    voltage: "12V",
    warranty: "7 Years",
    stock: 8,
    images: [
      "https://example.com/exide-500ah-1.jpg",
      "https://example.com/exide-500ah-2.jpg"
    ],
    specifications: {
      "Type": "Tubular",
      "Technology": "Lead Acid",
      "Backup Time": "20-24 hours",
      "Cycle Life": "2000 cycles",
      "Weight": "120 kg"
    },
    features: [
      "Industrial grade",
      "Extended backup time",
      "High cycle life",
      "Rugged construction",
      "Temperature resistant"
    ],
    rating: 4.8,
    reviews: 34,
    isActive: true,
    isFeatured: true
  }
];

const sampleUsers = [
  {
    name: "Admin User",
    email: "admin@shivangibattery.com",
    phone: "9876543210",
    address: {
      street: "Ramghat Road",
      city: "Atrauli",
      state: "Uttar Pradesh",
      pincode: "202280"
    },
    role: "admin",
    isActive: true,
    phoneVerified: true,
    profileCompleted: true
  },
  {
    name: "John Doe",
    email: "john@example.com",
    phone: "9876543211",
    address: {
      street: "123 Main Street",
      city: "Aligarh",
      state: "Uttar Pradesh",
      pincode: "202001"
    },
    role: "customer",
    isActive: true,
    phoneVerified: true,
    profileCompleted: true
  }
];

export async function seedDatabase() {
  try {
    await dbConnect();
    
    console.log('Starting database seeding...');

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    await OTP.deleteMany({});

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${products.length} products`);

    // Insert sample users
    const users = await User.insertMany(sampleUsers);
    console.log(`Inserted ${users.length} users`);

    console.log('Database seeding completed successfully!');
    
    return { products, users };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
} 