import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, contactName, email, companySize, useCase } = body ?? {};

    if (!companyName || !contactName || !email || !companySize || !useCase) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const submission = await prisma.designPartnerSubmission.create({
      data: {
        companyName,
        contactName,
        email,
        companySize,
        useCase,
      },
    });

    return NextResponse.json({ success: true, id: submission.id });
  } catch (error) {
    console.error('Design partner submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
