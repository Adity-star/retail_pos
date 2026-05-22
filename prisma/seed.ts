// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import "dotenv/config";


const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // Create a test tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Jet Kids International School',
      slug: 'jetkids',
      contactEmail: 'admin@jetkids.com',
      contactPhone: '+91 9876543210',
      address: 'Nagpur, Maharashtra',
      plan: 'premium',
      isActive: true,
    },
  });
  
  console.log('✅ Created tenant:', tenant.name);
  
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@jetkids.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'SCHOOL_ADMIN',
      tenantId: tenant.id,
      isActive: true,
    },
  });
  
  console.log('✅ Created admin user:', adminUser.email);
  
  // Create staff user
  const staffUser = await prisma.user.create({
    data: {
      email: 'staff@jetkids.com',
      password: await bcrypt.hash('staff123', 10),
      name: 'Staff User',
      role: 'STAFF',
      tenantId: tenant.id,
      isActive: true,
    },
  });
  
  console.log('✅ Created staff user:', staffUser.email);
  
  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Shirts',
        description: 'School shirts and t-shirts',
        tenantId: tenant.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Pants',
        description: 'School pants and trousers',
        tenantId: tenant.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Accessories',
        description: 'Ties, belts, socks',
        tenantId: tenant.id,
      },
    }),
  ]);
  
  console.log('✅ Created categories:', categories.length);
  
  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        sku: 'JKIS-SHIRT-WHITE-S',
        barcode: '1234567890001',
        name: 'White Shirt - Small',
        description: 'Official school white shirt',
        categoryId: categories[0].id,
        tenantId: tenant.id,
        class: 'Grade 1-5',
        size: 'S',
        color: 'White',
        gender: 'Unisex',
        purchasePrice: 250,
        sellingPrice: 350,
        mrp: 400,
        stock: 50,
        minStockLevel: 10,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'JKIS-SHIRT-WHITE-M',
        barcode: '1234567890002',
        name: 'White Shirt - Medium',
        description: 'Official school white shirt',
        categoryId: categories[0].id,
        tenantId: tenant.id,
        class: 'Grade 6-8',
        size: 'M',
        color: 'White',
        gender: 'Unisex',
        purchasePrice: 280,
        sellingPrice: 380,
        mrp: 430,
        stock: 45,
        minStockLevel: 10,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'JKIS-PANT-NAVY-30',
        barcode: '1234567890003',
        name: 'Navy Blue Pant - 30',
        description: 'Official school navy blue pant',
        categoryId: categories[1].id,
        tenantId: tenant.id,
        class: 'Grade 6-12',
        size: '30',
        color: 'Navy Blue',
        gender: 'Boys',
        purchasePrice: 400,
        sellingPrice: 550,
        mrp: 600,
        stock: 30,
        minStockLevel: 8,
        isActive: true,
      },
    }),
  ]);
  
  console.log('✅ Created products:', products.length);
  
  // Create a supplier
  const supplier = await prisma.supplier.create({
    data: {
      name: 'Guruganesh Enterprises',
      contactPerson: 'Rajesh Kumar',
      email: 'rajesh@guruganesh.com',
      phone: '+91 9876543210',
      address: 'Mumbai, Maharashtra',
      tenantId: tenant.id,
      isActive: true,
    },
  });
  
  console.log('✅ Created supplier:', supplier.name);
  
  console.log('');
  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('📝 Test Credentials:');
  console.log('Admin: admin@jetkids.com / admin123');
  console.log('Staff: staff@jetkids.com / staff123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });