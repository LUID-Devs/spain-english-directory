# TASK-698: AGENTS.md Context Optimization Research

## Source
[Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?](https://arxiv.org/abs/2602.11988) (Feb 2026)

## Key Findings

### Problem
- **Context files reduce task success rates** compared to no context
- Increases inference cost by **20%+**
- Agents tend to **over-explore** when given comprehensive context files

### Root Cause Analysis
1. **Information Overload**: Large context files distract agents from the actual task
2. **Premature Optimization**: Agents spend time understanding context before addressing the issue
3. **Over-confidence**: Agents assume they understand the codebase from the context file

## Optimization Strategy Applied

### Before (Generic Template)
- ~7,000+ tokens of generic AI assistant advice
- No TaskLuid-specific context
- Extensive guidelines on social behavior, memory, etc.

### After (Optimized)
- ~600 tokens of essential TaskLuid context
- Project-specific information only
- Focused on patterns, structure, and critical rules

### Changes Made
1. **Removed**: Generic social interaction guidelines
2. **Removed**: Extensive memory management instructions
3. **Removed**: Heartbeat/cron detailed explanations
4. **Kept**: Project structure, tech stack, key patterns
5. **Added**: Quick reference format for faster parsing

## Expected Benefits
- **~90% token reduction** (7,000 → 600 tokens)
- **Reduced inference costs** by ~20%
- **Faster task completion** with less over-exploration
- **Better focus** on actual coding tasks

## Testing Recommendations
1. A/B test with agents using old vs new AGENTS.md
2. Measure token usage per task
3. Track task completion rates
4. Monitor time to first meaningful action

## References
- arXiv:2602.11988 - Original research paper
- PR #212 - Related AGENTS.md improvements
