// scripts/sync-users-to-supabase.ts
// Run this script once to sync existing Prisma users to Supabase Auth

import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import "dotenv/config";

const prisma = new PrismaClient();

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncUsersToSupabase() {
  console.log('🔄 Syncing users to Supabase Auth...');
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      password: true,
      name: true,
    },
  });

  console.log(`Found ${users.length} users in database`);

  for (const user of users) {
    try {
      // Create user in Supabase Auth
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name,
        },
      });

      if (error) {
        if (error.message.includes('already been registered')) {
          console.log(`✓ User ${user.email} already exists in Supabase Auth`);
          continue;
        }
        console.error(`✗ Failed to create user ${user.email}:`, error.message);
        continue;
      }

      console.log(`✓ Created user ${user.email} in Supabase Auth`);
    } catch (error) {
      console.error(`✗ Error processing user ${user.email}:`, error);
    }
  }

  console.log('\n✅ Sync complete!');
  console.log('\n⚠️  IMPORTANT: Supabase Auth uses its own password hashing.');
  console.log('   You need to set passwords via Supabase Dashboard or use the password reset flow.');
  console.log('   For testing, you can create users directly in Supabase Auth dashboard.');
}

syncUsersToSupabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
