/**
 * GFS Workflow Runtime - Executes multi-step workflows
 */

import { prisma } from '@/lib/db';
import { executeTask } from './executor';

export interface WorkflowContext {
  [key: string]: unknown;
}

export async function startWorkflow(
  workflowId: string,
  initialContext: WorkflowContext = {}
) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: { workflowSteps: { orderBy: { order: 'asc' } } },
  });

  if (!workflow) {
    throw new Error(`Workflow ${workflowId} not found`);
  }

  if (workflow.status !== 'active') {
    throw new Error(`Workflow ${workflowId} is not active (status: ${workflow.status})`);
  }

  // Create execution
  const execution = await prisma.workflowExecution.create({
    data: {
      workflowId,
      status: 'running',
      currentStep: workflow.workflowSteps[0]?.id || null,
      context: JSON.parse(JSON.stringify(initialContext)),
    },
  });

  // Start first step
  if (workflow.workflowSteps.length > 0) {
    await executeWorkflowStep(execution.id, workflow.workflowSteps[0].id);
  } else {
    // No steps, complete immediately
    await prisma.workflowExecution.update({
      where: { id: execution.id },
      data: { status: 'completed', completedAt: new Date() },
    });
  }

  return execution;
}

export async function executeWorkflowStep(executionId: string, stepId: string) {
  const execution = await prisma.workflowExecution.findUnique({
    where: { id: executionId },
    include: {
      workflow: {
        include: { workflowSteps: { orderBy: { order: 'asc' } } },
      },
    },
  });

  if (!execution) {
    throw new Error(`Execution ${executionId} not found`);
  }

  const step = execution.workflow.workflowSteps.find((s) => s.id === stepId);
  if (!step) {
    throw new Error(`Step ${stepId} not found in workflow`);
  }

  const stepAction = step.action as Record<string, unknown> || {};
  const context = execution.context as WorkflowContext;

  // Check if step requires human gate
  if (stepAction.requiresHumanGate) {
    const gate = await prisma.humanGate.create({
      data: {
        executionId,
        stepId,
        status: 'pending',
        description: stepAction.gateDescription as string || `Approval required for step: ${step.name}`,
        requiredApprovers: (stepAction.requiredApprovers as number) || 1,
      },
    });

    // Update execution to waiting state
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: { status: 'waiting_approval', currentStep: stepId },
    });

    return { status: 'waiting_approval', gateId: gate.id };
  }

  // Execute the step action
  if (step.agentId && stepAction.taskType) {
    // Create and execute task
    const inputData = stepAction.input as Record<string, unknown> || {};
    const task = await prisma.task.create({
      data: {
        executionId,
        agentId: step.agentId,
        type: stepAction.taskType as string,
        input: JSON.parse(JSON.stringify({ ...context, ...inputData })),
        priority: (stepAction.priority as number) || 50,
      },
    });

    const result = await executeTask(task.id);

    // Update context with output
    const newContext = {
      ...context,
      [`step_${step.order}_output`]: result.output,
    };

    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: { context: JSON.parse(JSON.stringify(newContext)) },
    });

    if (!result.success) {
      await prisma.workflowExecution.update({
        where: { id: executionId },
        data: { status: 'failed', completedAt: new Date() },
      });
      return { status: 'failed', error: result.error };
    }
  }

  // Move to next step
  const currentIndex = execution.workflow.workflowSteps.findIndex((s) => s.id === stepId);
  const nextStep = execution.workflow.workflowSteps[currentIndex + 1];

  if (nextStep) {
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: { currentStep: nextStep.id },
    });
    return executeWorkflowStep(executionId, nextStep.id);
  } else {
    // Workflow complete
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: { status: 'completed', completedAt: new Date() },
    });
    return { status: 'completed' };
  }
}

export async function approveHumanGate(gateId: string, approver: string) {
  const gate = await prisma.humanGate.findUnique({
    where: { id: gateId },
  });

  if (!gate) {
    throw new Error(`Gate ${gateId} not found`);
  }

  if (gate.status !== 'pending') {
    throw new Error(`Gate ${gateId} is not pending (status: ${gate.status})`);
  }

  const currentApprovers = (gate.approvedBy as string[]) || [];
  const newApprovers = [...currentApprovers, approver];

  if (newApprovers.length >= gate.requiredApprovers) {
    // Gate approved, continue workflow
    await prisma.humanGate.update({
      where: { id: gateId },
      data: {
        status: 'approved',
        approvedBy: JSON.parse(JSON.stringify(newApprovers)),
        resolvedAt: new Date(),
      },
    });

    // Resume workflow if executionId exists
    if (gate.executionId) {
      const execution = await prisma.workflowExecution.findUnique({
        where: { id: gate.executionId },
        include: { workflow: { include: { workflowSteps: { orderBy: { order: 'asc' } } } } },
      });

      if (execution && execution.workflow) {
        const currentStepIndex = execution.workflow.workflowSteps.findIndex(
          (s: { id: string }) => s.id === gate.stepId
        );
        const nextStep = execution.workflow.workflowSteps[currentStepIndex + 1];

        if (nextStep) {
          await prisma.workflowExecution.update({
            where: { id: execution.id },
            data: { status: 'running', currentStep: nextStep.id },
          });
          return executeWorkflowStep(execution.id, nextStep.id);
        } else {
          await prisma.workflowExecution.update({
            where: { id: execution.id },
            data: { status: 'completed', completedAt: new Date() },
          });
          return { status: 'completed' };
        }
      }
    }

    return { status: 'approved' };
  } else {
    // More approvers needed
    await prisma.humanGate.update({
      where: { id: gateId },
      data: { approvedBy: JSON.parse(JSON.stringify(newApprovers)) },
    });
    return { status: 'pending', approvalsReceived: newApprovers.length, approvalsNeeded: gate.requiredApprovers };
  }
}
