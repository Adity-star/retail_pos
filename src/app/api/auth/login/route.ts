// src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate with Supabase
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      );
    }

    // Find user in Prisma database
    const user = await db.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      // Sign out from Supabase if user not found in database
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: 'User account is deactivated' },
        { status: 403 }
      );
    }

    // Update last login
     await db.user.update({
       where: { id: user.id },
       data: { lastLoginAt: new Date() },
     });

     // Update Supabase user metadata with tenant_id and role
     await supabase.auth.updateUser({
       data: {
         tenant_id: user.tenantId,
         role: user.role,
       },
     });

     return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
