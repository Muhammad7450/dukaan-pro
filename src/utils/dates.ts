/**
 * Date Utilities
 * Helper functions for date operations and formatting
 */

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Get date X days ago in YYYY-MM-DD format
 */
export function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

/**
 * Get start of week (Monday) in YYYY-MM-DD format
 */
export function getWeekStartDate(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

/**
 * Get start of month in YYYY-MM-DD format
 */
export function getMonthStartDate(): string {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  return firstDay.toISOString().split('T')[0];
}

/**
 * Get date range for a period
 */
export function getDateRange(period: 'today' | 'week' | 'month'): { start: string; end: string } {
  const end = getTodayDate();
  let start = end;

  if (period === 'week') {
    start = getWeekStartDate();
  } else if (period === 'month') {
    start = getMonthStartDate();
  }

  return { start, end };
}

/**
 * Format date for display (e.g., "Jan 15, 2026")
 */
export function formatDateForDisplay(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date and time for display (e.g., "Jan 15, 2026 2:30 PM")
 */
export function formatDateTimeForDisplay(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get day name from date
 */
export function getDayName(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Get last 7 days array for weekly chart
 */
export function getLast7Days(): Array<{ date: string; day: string }> {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = getDateDaysAgo(i);
    days.push({
      date,
      day: getDayName(date),
    });
  }
  return days;
}
