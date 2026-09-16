export const parseDateRange = (startDateStr, endDateStr, DefaultDaysBack = 30) => {
  // Set end of range (defaults to end of today)
  const end = endDateStr && !isNaN(Date.parse(endDateStr))
    ? new Date(endDateStr)
    : new Date();
  end.setHours(23, 59, 59, 999);

  // Set start of range (defaults to DefaultDaysBack ago at midnight)
  let start;
  if (startDateStr && !isNaN(Date.parse(startDateStr))) {
    start = new Date(startDateStr);
  } else {
    start = new Date();
    start.setDate(start.getDate() - DefaultDaysBack);
  }
  start.setHours(0, 0, 0, 0);

  return { start, end };
};