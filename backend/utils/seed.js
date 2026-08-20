/**
 * BRICKSBRAIN-AI Database Seeder
 * Run: node utils/seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User     = require('../models/User');
const Property = require('../models/Property');

const USERS = [
  { name:'Admin User',    email:'admin@bricksbrain.ai',  password:'admin123',  role:'admin',  city:'Delhi',     state:'Delhi'      },
  { name:'Rahul Buyer',   email:'buyer@bricksbrain.ai',  password:'buyer123',  role:'buyer',  city:'Delhi',     state:'Delhi'      },
  { name:'Priya Mehta',   email:'agent@bricksbrain.ai',  password:'agent123',  role:'agent',  city:'Mumbai',    state:'Maharashtra',
    agentProfile: { speciality:'Luxury Homes', experience:8, rating:4.8, totalDeals:142 } },
  { name:'Raj Sharma',    email:'seller@bricksbrain.ai', password:'seller123', role:'seller', city:'Gurugram',  state:'Haryana'    },
];

const PROPERTIES = [
  { title:'3BHK Premium Apartment', type:'Flat', listType:'Sale', price:8250000,  city:'Delhi',     state:'Delhi',      locality:'Dwarka Sec 12',  area:1050, bedrooms:3, bathrooms:2, floor:8,  totalFloors:15, ageYears:3,  metroDistKm:0.4, bricksbrainScore:88, roi5yr:42, verified:true,  featured:true  },
  { title:'4BHK Luxury Flat',       type:'Flat', listType:'Sale', price:12000000, city:'Gurugram',  state:'Haryana',    locality:'Sector 56',      area:1400, bedrooms:4, bathrooms:3, floor:14, totalFloors:25, ageYears:1,  metroDistKm:1.2, bricksbrainScore:75, roi5yr:35, verified:true,  featured:false },
  { title:'2BHK Cozy Apartment',    type:'Flat', listType:'Rent', price:28000,    city:'Noida',     state:'UP',         locality:'Sector 137',     area:820,  bedrooms:2, bathrooms:2, floor:3,  totalFloors:10, ageYears:5,  metroDistKm:0.8, bricksbrainScore:82, roi5yr:38, verified:false, featured:false },
  { title:'5BHK Sea-facing Villa',  type:'Villa',listType:'Sale', price:21000000, city:'Mumbai',    state:'Maharashtra',locality:'Bandra West',    area:2800, bedrooms:5, bathrooms:4, floor:0,  totalFloors:3,  ageYears:2,  metroDistKm:1.0, bricksbrainScore:91, roi5yr:44, verified:true,  featured:true  },
  { title:'Corner Residential Plot',type:'Plot', listType:'Sale', price:4500000,  city:'Bengaluru', state:'Karnataka',  locality:'Sarjapur Road',  area:1350, bedrooms:0, bathrooms:0, floor:0,  totalFloors:0,  ageYears:0,  metroDistKm:2.1, bricksbrainScore:68, roi5yr:30, verified:true,  featured:false },
  { title:'IT Park Office Space',   type:'Commercial',listType:'Rent',price:65000,city:'Hyderabad',state:'Telangana',  locality:'Hitech City',    area:1800, bedrooms:0, bathrooms:2, floor:6,  totalFloors:12, ageYears:4,  metroDistKm:0.2, bricksbrainScore:79, roi5yr:36, verified:true,  featured:true  },
  { title:'3BHK Garden Apartment',  type:'Flat', listType:'Sale', price:6800000,  city:'Pune',      state:'Maharashtra',locality:'Koregaon Park',  area:950,  bedrooms:3, bathrooms:2, floor:4,  totalFloors:8,  ageYears:6,  metroDistKm:0.6, bricksbrainScore:80, roi5yr:37, verified:false, featured:false },
  { title:'4BHK Gated Community',   type:'Flat', listType:'Sale', price:15500000, city:'Hyderabad', state:'Telangana',  locality:'Gachibowli',     area:1650, bedrooms:4, bathrooms:3, floor:12, totalFloors:22, ageYears:1,  metroDistKm:0.5, bricksbrainScore:85, roi5yr:40, verified:true,  featured:true  },
  { title:'2BHK Modern Apartment',  type:'Flat', listType:'Rent', price:35000,    city:'Chennai',   state:'Tamil Nadu', locality:'Anna Nagar',     area:900,  bedrooms:2, bathrooms:1, floor:2,  totalFloors:5,  ageYears:8,  metroDistKm:1.1, bricksbrainScore:74, roi5yr:32, verified:true,  featured:false },
  { title:'5BHK Sky Penthouse',     type:'Flat', listType:'Sale', price:18000000, city:'Kolkata',   state:'West Bengal',locality:'Salt Lake Sec V', area:2200, bedrooms:5, bathrooms:4, floor:18, totalFloors:20, ageYears:2,  metroDistKm:0.3, bricksbrainScore:86, roi5yr:38, verified:true,  featured:true  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bricksbrain');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Property.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const users = await User.create(USERS);
    console.log(`👤 Created ${users.length} users`);

    // Assign seller to properties
    const agentUser  = users.find(u => u.role === 'agent');
    const sellerUser = users.find(u => u.role === 'seller');

    const propertiesWithSellers = PROPERTIES.map((p, i) => ({
      ...p,
      seller: {
        userId: i % 2 === 0 ? agentUser._id : sellerUser._id,
        name:   i % 2 === 0 ? agentUser.name : sellerUser.name,
        phone:  '+91-9876543210',
        email:  i % 2 === 0 ? agentUser.email : sellerUser.email,
      },
      sellerType: i % 2 === 0 ? 'agent' : 'owner',
    }));

    const properties = await Property.insertMany(propertiesWithSellers);
    console.log(`🏠 Created ${properties.length} properties`);

    console.log('\n✅ Database seeded successfully!');
    console.log('📧 Test accounts:');
    USERS.forEach(u => console.log(`   ${u.role}: ${u.email} / ${u.password}`));

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
