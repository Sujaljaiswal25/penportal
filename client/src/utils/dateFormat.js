// Simple date formatting utility to avoid dependency on date-fns
export const format = (date, formatStr) => {
  const d = new Date(date);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthsFull = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();

  // Format patterns
  const patterns = {
    "MMM d, yyyy": `${months[month]} ${day}, ${year}`,
    "MMMM d, yyyy": `${monthsFull[month]} ${day}, ${year}`,
    "MMM d, yyyy · HH:mm": `${months[month]} ${day}, ${year} · ${String(
      hours
    ).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
    "yyyy-MM-dd": `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`,
    "HH:mm": `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`,
  };

  return patterns[formatStr] || d.toLocaleDateString();
};
