// Defensive lookups for employee identity fields on leave-request-shaped
// objects. Confirmed against a real GET /leave-requests/{id} response:
// the live backend sends `userName` (e.g. "Rahul Sharma") and no nested
// `employee`/`employeeCode` at all — it does NOT match the OpenAPI spec,
// which documents `employeeName` at the top level plus a nested
// `employee: User` object. We check the confirmed real field first, then
// fall back through the documented shape and other variants seen
// elsewhere in this codebase, in case different endpoints differ.

export const getEmployeeName = (record) => {
  if (!record) return '';
  return (
    record.userName ||
    record.employeeName ||
    record.employee?.fullName ||
    record.user?.fullName ||
    record.applicantName ||
    record.requesterName ||
    record.name ||
    ''
  );
};

export const getEmployeeCode = (record, fallbackUserId) => {
  if (!record) return '';
  return (
    record.employee?.employeeCode ||
    record.employeeCode ||
    record.user?.employeeCode ||
    (fallbackUserId != null ? `EMP-${String(fallbackUserId).padStart(4, '0')}` : '')
  );
};
