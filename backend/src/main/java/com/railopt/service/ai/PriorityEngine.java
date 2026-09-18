package com.railopt.service.ai;

import com.railopt.dto.AiBlockPlanGenerateRequest;
import com.railopt.dto.AiBlockPlanResponse;
import com.railopt.dto.DashboardPrioritySummary;
import com.railopt.dto.TaskPriorityEvaluation;
import com.railopt.entity.MaintenanceTask;

import java.util.List;

/**
 * AI Priority Engine abstraction.
 *
 * Compiles railway operational data from MongoDB and computes deterministic,
 * explainable multi-factor priority scores, recommended operational actions,
 * and Pareto-optimal maintenance block windows.
 *
 * Decoupled so that rule-based implementations can be replaced by
 * Python FastAPI (MILP / OR-Tools / XGBoost) services without altering REST contracts.
 */
public interface PriorityEngine {

    /**
     * Evaluates a single maintenance task using the 12-factor operational model.
     *
     * @param task the maintenance task to evaluate
     * @return structured priority evaluation with score, tier, and recommendations
     */
    TaskPriorityEvaluation evaluateTaskPriority(MaintenanceTask task);

    /**
     * Evaluates all tasks and returns the highest priority ones.
     *
     * @param limit maximum number of evaluations to return
     * @return sorted list of top task priority evaluations
     */
    List<TaskPriorityEvaluation> evaluateTopPriorities(int limit);

    /**
     * Aggregates AI priority telemetry for dashboard visualization.
     *
     * @return summary with top priority score and recommended operational action
     */
    DashboardPrioritySummary getDashboardPrioritySummary();

    /**
     * Optimizes maintenance block windows based on train traffic, corridor capacity,
     * cross-departmental shadow bundling, and conflict minimization.
     *
     * @param request block generation parameters
     * @return AI recommended block plan response
     */
    AiBlockPlanResponse optimizeBlockPlan(AiBlockPlanGenerateRequest request);
}
