// Input parameters
const WEEKDAY = true;
const MAX_HOURS = 4;
const PROCRASTINATE = false;

// JSON array of assignments
const assignments = [
  {
    "due_date": "2023-12-05",
    "time_for_completion": 10,
    "title": "EECS281 Project 4",
  },
  {
    "due_date": "2023-11-29",
    "time_for_completion": 10,
    "title": "Math homework",
  },
  {
    "due_date": "2023-11-29",
    "time_for_completion": 4,
    "title": "stalk linkedin",
  },

  // Add more assignments here
];

function createWorkSchedule(assignments) {
  let schedule = {};

  assignments.forEach(assignment => {
    const dueDate = new Date(assignment.due_date);
    const currentDate = new Date();
    const totalHours = assignment.time_for_completion;

    let availableDays = [];
    for (let d = new Date(currentDate); d <= dueDate; d.setDate(d.getDate() + 1)) {
      if (WEEKDAY && (d.getDay() === 0 || d.getDay() === 6)) continue; // Skip weekends
      availableDays.push(new Date(d));
    }

    const dailyHours = PROCRASTINATE ?
      calculateHoursProcrastinate(totalHours, availableDays.length) :
      Array(availableDays.length).fill(Math.min(MAX_HOURS, totalHours / availableDays.length));

    availableDays.forEach((date, i) => {
      const dateString = date.toISOString().split('T')[0];
      if (dailyHours[i] > 0) {
        if (!schedule[dateString]) {
          schedule[dateString] = [];
        }
        schedule[dateString].push({
          "title": assignment.title,
          "hours": dailyHours[i]
        });
      }
    });
  });

  return schedule;
}

function calculateHoursProcrastinate(totalHours, availableDays) {
  const hours = Array(availableDays).fill(0);
  let remainingHours = totalHours;
  for (let i = availableDays - 1; i >= 0 && remainingHours > 0; i--) {
    const hoursForDay = Math.min(remainingHours, MAX_HOURS);
    hours[i] = hoursForDay;
    remainingHours -= hoursForDay;
  }
  return hours;
}

const workSchedule = createWorkSchedule(assignments);
console.log(JSON.stringify(workSchedule, null, 2));
