const parseDueDate = (raw: unknown): { ok: true; value: Date | null } | { ok: false; message: string } => {
  if (raw === undefined || raw === null || raw === '') return { ok: true, value: null }; // optional
  if (typeof raw !== 'string') return { ok: false, message: 'dueDate must be an ISO date string' };

  const d = new Date(raw);
  if (Number.isNaN(d.getTime()) || d.toISOString() !== raw) {
    return { ok: false, message: 'dueDate is not a valid ISO 8601 date' };
  }

  // Allow "today": compare with the start of today (UTC), not the current instant
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  if (d < startOfToday) return { ok: false, message: 'dueDate cannot be in the past' };

  return { ok: true, value: d };
};

export default parseDueDate;