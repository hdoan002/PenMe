// Listen for form submit
document
  .getElementById("scheduleForm")
  .addEventListener("submit", saveSchedule);

// Save schedule
function saveSchedule(e) {
  // Get form values
  var eventName = document.getElementById("eventName").value;
  var eventDay = document.getElementById("eventDay").value;
  var eventStart = document.getElementById("eventStart").value;
  var eventEnd = document.getElementById("eventEnd").value;
  var eventLocation = document.getElementById("eventLocation").value;

  //Form validation
  if (!validateForm(eventName, eventStart, eventEnd, eventLocation)) {
    return false;
  }

  var event = {
    name: eventName,
    day: eventDay,
    start: eventStart,
    end: eventEnd,
    location: eventLocation
  };

  // Test if schedule is null
  if (localStorage.getItem("schedule") === null) {
    // Init array
    var schedule = [];
    // Add to array
    schedule.push(event);
    // Set to localStorage
    localStorage.setItem("schedule", JSON.stringify(schedule));
  } else {
    // Get schedule from localStorage
    var schedule = JSON.parse(localStorage.getItem("schedule"));
    // Add schedule to array
    schedule.push(event);
    // Re-set back to localStorage
    localStorage.setItem("schedule", JSON.stringify(schedule));
  }
  // Clear form
  document.getElementById("scheduleForm").reset();

  // Re-fetch schedule
  fetchSchedule();

  // Prevent form from submitting
  e.preventDefault();
}

// Fetch events
function fetchSchedule() {
  // Get schedule from localStorage
  var schedule = JSON.parse(localStorage.getItem("schedule"));
  // Get output id
  var scheduleResults = document.getElementById("scheduleResults");

  // Build output
  scheduleResults.innerHTML = "";
  for (var i = 0; i < schedule.length; i++) {
    var name = schedule[i].name;
    var day = schedule[i].day;
    var start = schedule[i].start;
    var end = schedule[i].end;
    var location = schedule[i].location;

    scheduleResults.innerHTML +=
      '<div class="card">' +
      '<div class="card-body">' +
      "<h4>" +
      name +
      "</h4>" +
      "<h5>Day: " +
      day +
      "</h5>" +
      "<h5>Start time: " +
      start +
      "</h5>" +
      "<h5>End time: " +
      end +
      "</h5>" +
      "<h5>Location: " +
      location +
      "</h5>" +
      " <a onclick=\"deleteEvent('" +
      name +
      '\')" class="btn btn-danger" href="#">Delete</a> ' +
      "</div>" +
      "</div>";
  }
}

// Delete event
function deleteEvent(name) {
  // Get bookmarks from localStorage
  var schedule = JSON.parse(localStorage.getItem("schedule"));
  // Loop through the bookmarks
  for (var i = 0; i < schedule.length; i++) {
    if (schedule[i].name == name) {
      // Remove from array
      schedule.splice(i, 1);
    }
  }
  // Re-set back to localStorage
  localStorage.setItem("schedule", JSON.stringify(schedule));

  // Re-fetch bookmarks
  fetchSchedule();
}

// Validate Form
function validateForm(name, start, end, location) {
  if (!name || !start || !end || !location) {
    alert("Please fill in the form");
    return false;
  }

  var expression = /\b((1[0-2]|0?[1-9]):([0-5][0-9]) ([AaPp][Mm]))/;
  var regex = new RegExp(expression);

  if (!start.match(regex)) {
    alert("Please use a valid start time");
    return false;
  }
  if (!end.match(regex)) {
    alert("Please use a valid end time");
    return false;
  }

  return true;
}
