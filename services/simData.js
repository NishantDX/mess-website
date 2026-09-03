/**
 * Shared helpers for the synthetic (demo) dataset.
 *
 * Every simulated student has a student_id that starts with SIM_PREFIX, so the
 * simulator and the cleanup scripts can always tell demo data apart from real
 * records and never touch the latter.
 */

const SIM_PREFIX = "SIM";

const FIRST = [
  "Aarav", "Vivaan", "Aditya", "Ananya", "Diya", "Ishaan", "Kabir", "Meera",
  "Rohan", "Saanvi", "Arjun", "Kavya", "Nikhil", "Priya", "Rahul", "Sneha",
  "Varun", "Isha", "Karan", "Riya", "Aryan", "Tara", "Dev", "Anjali",
  "Sahil", "Neha", "Yash", "Pooja", "Manav", "Simran",
];
const LAST = [
  "Sharma", "Verma", "Patel", "Gupta", "Singh", "Reddy", "Nair", "Iyer",
  "Das", "Bose", "Mehta", "Jain", "Kapoor", "Malhotra", "Chauhan", "Yadav",
  "Mishra", "Pillai", "Rao", "Bhat",
];
const DEPARTMENTS = [
  "ECE", "CSE", "EEE", "Mechanical", "Civil", "Chemical",
  "Biotechnology", "Metallurgy", "Production", "Architecture",
];

// Typical share of students who turn up for each meal on a weekday.
const BASE_RATES = { breakfast: 0.62, lunch: 0.88, dinner: 0.79 };

function pad(n, width) {
  return String(n).padStart(width, "0");
}

/** Deterministic student record for index i (1-based). */
function makeStudent(i) {
  const sid = `${SIM_PREFIX}${2027}${pad(i, 3)}`; // e.g. SIM2027001
  const name = `${FIRST[i % FIRST.length]} ${LAST[(i * 7) % LAST.length]}`;
  return {
    uid: `sim-${sid}`, // no Firebase user — demo students can't log in
    student_id: sid,
    name,
    email: `${sid.toLowerCase()}@sim.messdemo.local`,
    phone: `+9199${pad((i * 811) % 100000000, 8)}`,
    department: DEPARTMENTS[(i * 3) % DEPARTMENTS.length],
  };
}

/** Attendance rate for a meal on a given YYYY-MM-DD, with weekend dip + jitter. */
function rateFor(meal, dateStr) {
  const day = new Date(dateStr + "T00:00:00Z").getUTCDay(); // 0 Sun .. 6 Sat
  const weekend = day === 0 || day === 6 ? 0.7 : 1;
  const jitter = (Math.random() - 0.5) * 0.12;
  return Math.max(0.15, Math.min(0.97, BASE_RATES[meal] * weekend + jitter));
}

module.exports = { SIM_PREFIX, DEPARTMENTS, makeStudent, rateFor, BASE_RATES };
