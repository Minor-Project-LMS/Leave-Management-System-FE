// The backend's DelegationDto ships nested objects — delegationId,
// delegator: { id, name, avatarUrl }, delegate: { ... }, scope: {
// departmentIds, categoryIds, allTypes } — and never computes a
// status. The delegation table/modal components (built for the Manager
// Delegation page, reused here for HR) expect a flat shape instead:
// id, delegatorId/delegatorName, delegateId/delegateName,
// departmentIds/categoryIds directly, and a computedStatus string.
// Mock data is already flat, so every field here falls back to the
// already-flat name first via `??` — this works unchanged against
// either shape.
export const computeDelegationStatus = (d) => {
  if (d.isActive === false) return 'REVOKED';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(d.startDate);
  const end = new Date(d.endDate);

  if (today < start) return 'UPCOMING';
  if (today > end) return 'PAST';
  return 'ACTIVE';
};

export const normalizeDelegation = (d) => {
  const normalized = {
    id: d.id ?? d.delegationId,
    delegatorId: d.delegatorId ?? d.delegator?.id,
    delegatorName: d.delegatorName ?? d.delegator?.name,
    delegatorAvatarUrl: d.delegatorAvatarUrl ?? d.delegator?.avatarUrl,
    delegateId: d.delegateId ?? d.delegate?.id,
    delegateName: d.delegateName ?? d.delegate?.name,
    delegateAvatarUrl: d.delegateAvatarUrl ?? d.delegate?.avatarUrl,
    startDate: d.startDate,
    endDate: d.endDate,
    isActive: d.isActive,
    createdAt: d.createdAt,
    departmentIds: d.departmentIds ?? d.scope?.departmentIds ?? [],
    categoryIds: d.categoryIds ?? d.scope?.categoryIds ?? [],
    allTypes: d.allTypes ?? d.scope?.allTypes,
  };

  normalized.computedStatus = d.computedStatus ?? computeDelegationStatus(normalized);

  return normalized;
};
