/**
 * GFS Testing API
 * GET /api/gfs/testing - List available tests
 * POST /api/gfs/testing - Run tests
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllTests, runTests, runTest } from '@/lib/gfs/testing';
import type { TestCase } from '@/lib/gfs/testing';

export const dynamic = 'force-dynamic';

export async function GET() {
  const tests = getAllTests();
  
  // Group by type
  const byType = tests.reduce((acc, test) => {
    if (!acc[test.type]) acc[test.type] = [];
    acc[test.type].push(test);
    return acc;
  }, {} as Record<string, TestCase[]>);
  
  return NextResponse.json({
    total: tests.length,
    tests,
    byType,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.testId) {
      // Run single test
      const tests = getAllTests();
      const test = tests.find(t => t.id === body.testId);
      
      if (!test) {
        return NextResponse.json(
          { error: 'Test not found' },
          { status: 404 }
        );
      }
      
      const result = await runTest(test);
      return NextResponse.json({ result });
    }
    
    if (body.testIds && Array.isArray(body.testIds)) {
      // Run multiple tests
      const run = await runTests(body.testIds);
      return NextResponse.json({ run });
    }
    
    return NextResponse.json(
      { error: 'Provide testId or testIds array' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Testing error:', error);
    return NextResponse.json(
      { error: 'Failed to run tests' },
      { status: 500 }
    );
  }
}
