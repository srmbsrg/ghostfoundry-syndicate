/**
 * Dark Factory - Generation API
 * POST /api/dark-factory/generate
 * 
 * Accepts natural language requests and generates code
 */

import { NextRequest, NextResponse } from 'next/server';
import { runDarkFactory } from '@/lib/dark-factory';
import { GenerationRequest } from '@/lib/types/dark-factory';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for generation

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: prompt' },
        { status: 400 }
      );
    }

    // Build generation request
    const generationRequest: GenerationRequest = {
      id: uuidv4(),
      prompt: body.prompt,
      context: body.context || undefined,
      priority: body.priority || 'normal',
      requestedBy: body.requestedBy || 'human',
      createdAt: new Date(),
    };

    // Run the Dark Factory pipeline
    const result = await runDarkFactory(generationRequest);

    return NextResponse.json({
      success: true,
      taskId: result.taskId,
      status: result.status,
      artifactCount: result.artifacts.length,
      stages: result.stages.map(s => ({
        name: s.name,
        status: s.status,
        duration: s.completedAt && s.startedAt 
          ? new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime() 
          : null,
      })),
      error: result.error,
    });

  } catch (error) {
    console.error('Dark Factory generation error:', error);
    return NextResponse.json(
      { 
        error: 'Generation failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
