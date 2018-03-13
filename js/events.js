
var userArray = new Array(0)
var verifiedIDs = [];
function TimeDivider(start_or_end, timeInt) {
    this.type = start_or_end;
    this.time = timeInt;
}
function AvailableTime(myDay, startTime, endTime) {
	this.day = myDay;
	this.start = startTime;
	this.end = endTime;
}

//handle setup new event logic
$('.setup-event-btn').on("click", function () {

    firebase.auth().onAuthStateChanged(function(user) {

    	if(user)
    	{

    		var userID = user.uid;

			var eventTitle = $('#form-title').val();

			var eventLocation = $('#form-location').val();

			var eventTimezone = $('#form-timezone').val();

			var eventDescription = $('#form-desc').val();

			var eventDate = $('#datepicker').val();

			var eventStart = $('#startTime').val();

			var eventEnd = $('#endTime').val();

			if (eventTitle === "" || eventLocation === "" || eventTimezone === "" || eventDescription === ""
				|| eventDate === "" || eventStart === "" || eventEnd === "") {
				alert("Please fill in the required fields");
			}
			else
			{
				var checkFieldsResult = checkFields(eventDate, eventStart, eventEnd).then(function() {

					checkOverlapEvents(eventStart, eventEnd, eventDate, userID).then(function() {

						createEvent();

					}).catch(function() {

						alert("Current event times overlap with other events on your schedule. Please change");

					});	

				}).catch(function(error) {

					alert("ERROR: " + error);

				});	

			}

    	}
    	else
    	{
    		alert("Must be logged in to create event");
    	}

    });

});

$('#form-add-attend-btn').on("click", function () {

	let assumedDuration;

	let curStart = $('#startTime').val();
	let curEnd = $('#endTime').val();
	if (curStart != "" && curEnd != "") {
		let curStartInt = parseInt(curStart.substring(0,2)+curStart.substring(3));
		let curEndInt = parseInt(curEnd.substring(0,2)+curEnd.substring(3));
		let curStartMins = Math.floor(curStartInt/100) * 60 + (curStartInt%100);
		let curEndMins = Math.floor(curEndInt/100) * 60 + (curEndInt%100);
		assumedDuration = curEndMins - curStartMins;
		if (assumedDuration % 60 == 59) assumedDuration += 1;
	}
	else {
		assumedDuration = 60; // default = 1 hour -- to be set by user in a text box
	}
	document.getElementById("durationHr").value = Math.floor(assumedDuration/60);
	document.getElementById("durationMin").value = assumedDuration%60;

	$('#inviteModal').css("display", "block");

});

$('#closeBtn').on("click", function () {
	$('#inviteModal').css("display", "none");

	let inputStartTime = $('#startTime').val();
	if (inputStartTime == "") {
		inputStartTime = 0;
	}
	else {
		inputStartTime = parseInt(inputStartTime.substring(0,2)+inputStartTime.substring(3));
	}

	let inputDurationHr = parseInt($('#durationHr').val());
	let inputDurationMin = parseInt($('#durationMin').val());
	DurationInMinutes = inputDurationHr*60+inputDurationMin;

	let checkDate= $('#datepicker').val();
	if (checkDate != "") {
		matchSchedules(checkDate, inputStartTime, DurationInMinutes);
	}
	else {
		let today = new Date();
		let dd = today.getDate();
		let mm = today.getMonth()+1; //January is 0
		let yyyy = today.getFullYear();
		if(dd<10){
			dd='0'+dd;
		} 
		if(mm<10){
			mm='0'+mm;
		} 
		today = yyyy+'-'+mm+'-'+dd;
		matchSchedules(today, inputStartTime, DurationInMinutes);
	}

});

// use add button instead? 
$('.addUser').on('click', function (event) {

	event.preventDefault();

	var inviteEmail = $('#form-invitedUser').val();

	if (inviteEmail === "") 
	{
		alert("Enter a valid email");
	}
	else
	{

		searchUsersList(inviteEmail).then(function() {

			//create a list element of for each user to invite
			var newLi = document.createElement('li');

			newLi.setAttribute('id', 'invitedUser');

			document.getElementById('userList').appendChild(newLi);

			var newEmailSpan = document.createElement('span');

			newEmailSpan.setAttribute('class', 'userSpan');

			document.getElementById('invitedUser').appendChild(newEmailSpan);

			var newCloseSpan = document.createElement('span');

			newCloseSpan.setAttribute('class', 'closeSpan')

			document.getElementById('invitedUser').appendChild(newCloseSpan);

			newEmailSpan.innerHTML = inviteEmail;

			newCloseSpan.innerHTML = "&times;";

			newLi.removeAttribute('id');

			document.getElementById('form-invitedUser').value = "";

			userArray.push(inviteEmail);

			$('.closeSpan').on("click", function () {

				var pos = userArray.indexOf(inviteEmail);

				var removedItem = userArray.splice(pos, 1);

				$(this).parent().remove();

				//remove user from userArray

			});

		}).catch(function() {

			alert("User with specfied email not found. Please make sure they have created an account");

		});

	}


});

// When the user clicks anywhere outside of the modal, it should be closed
window.onclick = function (event) {
	if (event.target == document.getElementById('inviteModal')) {
		$('#inviteModal').css("display", "none");
	}
}

function createEvent() {
	var i;

	//array to hold the checkboxes for repititions
	var repArray = new Array(0);

	var eventDate = $('#datepicker').val();

	var eventStart = $('#startTime').val();

	var eventEnd = $('#endTime').val();

	var eventTitle = $('#form-title').val();

	var eventLocation = $('#form-location').val();

	var eventTimezone = $('#form-timezone').val();

	var eventDescription = $('#form-desc').val();

	var eventRepetition = document.querySelectorAll('.rep-box');

	for (i = 0; i < eventRepetition.length; i++) {
		if (eventRepetition[i].checked) {
			repArray.push(eventRepetition[i].value);
		}
	}

	var repFrequency = $('#rep').val();

	var eventReminders = $('#form-reminders').val();

	var privacyValue = $('#privacy').val();

	var eventID = generateToken();

	writeUserData(eventID, eventDate, eventStart, eventEnd, eventTitle, eventLocation,
		eventTimezone, eventDescription, repArray, repFrequency, eventReminders,
		privacyValue, userArray);

};

//take form data and create a JSON object of all the data and
//upload to firebase database /eventss
function writeUserData(eI, eDay, eS, eE, eT, eL, eTz, eDesc, rA, rF, eR, pV, iA) {

	// if these values are not entered in the form, assign them as null or else they aren't added to FireBase database
	if(rA.length == 0)
	{
		rA = "none";
	}
	if(iA.length == 0)
	{
		iA = "none";
	}
	if(eR == "")
	{
		eR = "none";
	}

	//set() overwrites data at the specified location (here events/eventID)
	firebase.auth().onAuthStateChanged(function (user) {

		if (user) {
			//user is signed in
			firebase.database().ref('events/' + eI).set(
				{
					eventOwner: firebase.auth().currentUser.displayName,
					eventOwnerEmail: firebase.auth().currentUser.email,
					eventID: eI,
					eventDate: eDay,
					eventStartTime: eS,
					eventEndTime: eE,
					eventTitle: eT,
					eventLocation: eL,
					eventTimezone: eTz,
					eventDescription: eDesc,
					repetitionDaysArray: rA,
					repetitionFrequency: rF,
					eventReminders: eR,
					privacySetting: pV,
					invitedUsers: iA

				}).then(function () {

					addInvitedUsers(eI);

					//add the newly created event to the user's list of participating events
					var userID = firebase.auth().currentUser.uid;
					var userEmail = firebase.auth().currentUser.email;

					firebase.database().ref('users/' + userID).once('value').then(function (snapshot) {

						var eventArray = snapshot.val().events;

						if (eventArray[0] === "0") {
							eventArray.shift();
							eventArray.push(eI);
							updateEventsArray(eventArray, userEmail, userID);
						}
						else {
							eventArray.push(eI);
							updateEventsArray(eventArray, userEmail, userID);
						}

						alert("Event created successfully!");

						window.location.href = "index.html"

					});

				}).catch(function (error) {

					var errorMessage = error.message;

					alert("ERROR: " + errorMessage);

				});
		}
		else {
			//user is not signed in
			alert("ERROR: Must be logged in to setup a new event");
		}

	});

}

function rand() {

    return Math.random().toString(36).slice(2, 10); // remove `0.`
};

function generateToken() {

	//return token of length 16
	return rand() + rand();

};

//redirect to homepage if user logs out/tries to access unauthorised
$(document).ready(function () {

	firebase.auth().onAuthStateChanged(function (user) {

		//if user is signed out, redirect to home page
		if (!user) {
			window.location.href = "index.html"
		}

	});

});

function updateEventsArray(eventsArr, userEmail, userID) {

	firebase.auth().onAuthStateChanged(function (user) {

		if (user) {
			//user is signed in
			firebase.database().ref('users/' + userID).set(
				{

					userEmail: userEmail,
					events: eventsArr

				});

		}
		else {
			// no user signed in
			alert("Must be logged in to do that");
		}

	});

};

function addInvitedUsers(eventID) {

	var invitedUsers;

    firebase.database().ref('events/' + eventID).once("value").then(function(snapshot) {

        invitedUsers = snapshot.val().invitedUsers.slice();

        if(invitedUsers !== "none")
        {

	        firebase.database().ref('users/').once("value").then(function(snapshot) {

	            snapshot.forEach(function(childSnapshot) {

	                var userEmail = childSnapshot.val().userEmail;
	                if(invitedUsers.indexOf(userEmail) >= 0)
	                {
	                    //the userEmail is in the list of invited users, add the event to their collection

	                    var userID = childSnapshot.key;
	                    //get a copy of the events array that holds events belonging to user
	                    var eventArray = childSnapshot.val().events.slice();

                        // add this event to the collection of events for this user
						if (eventArray[0] === "0") 
						{
							eventArray.shift();
							eventArray.push(eventID);
							updateEventsArray(eventArray, userEmail, userID);
						}
						else 
						{
							eventArray.push(eventID);
							updateEventsArray(eventArray, userEmail, userID);
						}

	                }

	            });

	        });
        	
        }
        // else
        // {
        // 	alert("no invited users");
        // }

    });

};

//function to see if the invited user has an existing account
function searchUsersList(inviteEmail) {

	return new Promise(function(resolve, reject) {

	    firebase.database().ref('users/').once("value").then(function(snapshot) {

	        snapshot.forEach(function(childSnapshot) {

	            var userEmail = childSnapshot.val().userEmail;

	            if(userEmail === inviteEmail)
	            {
					verifiedIDs.push(childSnapshot.key);
	                return resolve();

	            }

	        });

	       return reject();

	    });

	});


};

function checkOverlapEvents(eventStart, eventEnd, eventDate, userID) {

	return new Promise(function(resolve, reject) {

		   firebase.database().ref('users/' + userID).once("value").then(function(snapshot) {

		            var userEvents = snapshot.val().events.slice();

		            userEvents.forEach(function(data, index, array) {
				    
				if(data == "0")
		            	{
					return resolve();
		            	}

		            	if(data == "0")
		            	{
		            		return resolve();
		            	}

		            	firebase.database().ref('events/' + data).once("value").then(function(res) {

		            		//check to see if user's events overlap with the newly inputted start times and end times
							var newStartTime = eventStart;
							var eventStartTime = res.val().eventStartTime;

							var newEndTime = eventEnd;
							var eventEndTime = res.val().eventEndTime;    								

							if(eventDate === res.val().eventDate)
							{
								if(newStartTime >= eventStartTime && newStartTime < eventEndTime ||
								eventStartTime >= newStartTime && eventStartTime < newEndTime)
								{
									//overlap found
									return reject();
								}
							}
							else if(index === array.length - 1) //at last index of array (no overlaps found)
							{
								return resolve();
							}    								

		            	});

		            });

		    });

		});

};

function checkFields(eventDate, start, end) {

    return new Promise(function(resolve, reject) {

        var inputtedYear = eventDate.substr(0, 4);
        var inputtedMonth = eventDate.substr(5, 2);
        var inputtedDay = eventDate.substr(8, 2);

        var today = new Date();

        var dd = today.getDate();

        var mm = today.getMonth()+1;

        var yyyy = today.getFullYear();

        if(dd < 10)
        {
            dd = '0' + dd;
        }

        if(mm < 10)
        {
            mm = '0' + mm;
        }

        if (inputtedYear < yyyy)
        {
            return reject("Date can not be before current date");
        }
        else if(inputtedYear == yyyy)
        {
            if(inputtedMonth < mm)
            {
                return reject("Date can not be before current date");
            }
            else if(inputtedMonth == mm)
            {
                if(inputtedDay < dd) //date is before current day
                {
                    return reject("Date can not be before current date");
                }
                else if(inputtedDay == dd) //date is the same as current day
                {
                    var hh = today.getHours();

                    if(hh < 10)
                    {
                        hh = '0' + hh;
                    }

                    var mm = today.getMinutes();

                    if(mm < 10)
                    {
                        mm = '0' + mm;
                    }

                    var time = hh + ":" + mm;

                    //if the event end time is less than current time
                    if(start < time)
                    {
                        return reject("Event start time can not be before current time");
                    }
                    else if(end < time)
                    {
                        return reject("Event end time can not be before current time"); //if event time is after current time
                    }
                    else if(start == end)
                    {
                        return reject("Event starting and ending times can not be the same");
                    }
                    else
                    {
                        return resolve();
                    }

                }
                else if(inputtedDay > dd) //date is after current day
                {
                    //if the event end time is less than current time
                    if(start > end)
                    {
                        return reject("Event start time can not be greater than ending event time");
                    }
                    else if(start == end)
                    {
                        return reject("Event starting and ending times can not be the same");
                    }
                    else
                    {
                        return resolve();
                    }
                }
            } 
            else if(inputtedMonth > mm)
            {
                //if the event end time is less than current time
                if(start > end)
                {
                    return reject("Event start time can not be greater than ending event time");
                }
                else if(start == end)
                {
                    return reject("Event starting and ending times can not be the same");
                }
                else
                {
                    return resolve();
                }
            }

        }
        else if(inputtedYear > yyyy)
        {
            //if the event end time is less than current time
            if(start > end)
            {
                return reject("Event start time can not be greater than ending event time");
            }
            else if(start == end)
            {
                return reject("Event starting and ending times can not be the same");
            }
            else
            {
                return resolve();
            }
        }

    });

};

function insertTime(allEvents, start_or_end, time) {
	let timeInt = time.substring(0,2)+time.substring(3);
	let t = new TimeDivider(start_or_end, parseInt(timeInt));

						// ##################################################
						// #  TODO: REMOVE THIS TEST TO STOP PRINTING TEST  #
						// ##################################################
						console.log(start_or_end+": "+time);
						if (start_or_end == "end") console.log('\n');

	let allEventsLength = allEvents.length;
	for (let i = 0; i < allEventsLength; ++i) {
		if (t.time < allEvents[i].time) {
			allEvents.splice(i, 0, t);
			return Promise.resolve();
		}
	}
	allEvents.push(t);
	return Promise.resolve();
};

// Matching schedules looks at each day and splits up events if that event overlaps midnight, it gets cutoff at midnight
async function matchSchedules(day, minStartTime, duration) {
	/* overlapping day event-choosing algorithm
		// for each event, check if not in map
			// if startDay==day
				//push event ID into set
				// if endDay == day
					// insertion sort event start time
					// insertion sort event end time
				// else // (overlap night)
					// insertion sort event start time
					// insertion sort midnight as "end" time
			// else if endDay==day // (overlap morning)
				// push event ID into set
				// insertion sort 00:00 as "start" time
				// insertion sort event end time
	*/
	
	// if verified users.size == 0, quit
	if (verifiedIDs.length == 0) {
		console.log("There are no verifiedIDs");
		return;
	}
	// Get events for each user in verified users
	let checkedEvents = new Set();
	let allEvents = [];
	await Promise.all(verifiedIDs.map(async function(userID) {
		
		await checkOverlapEvents($('#startTime').val(), $('#endTime').val(), day, userID).catch(function() {
			alert("Your input event times overlaps with an attendee's schedule. Please choose one of the available times from the list.");
			document.getElementById("startTime").value = "";
			document.getElementById("endTime").value = "";
		});

		await firebase.database().ref('users/'+userID+'/events/').once("value")
		.then(async function(eventIDs) {
			return await Promise.all(eventIDs.val().map(async function(eventID) {
				if (!checkedEvents.has(eventID)) {
					checkedEvents.add(eventID);
					// insertion sort event start time as "start"
					await firebase.database().ref('events/'+eventID+'/').once("value")
					.then(async function(eventSnapshot) {

						// ###################################################################
						// #  TODO: REMOVE commented-if-statement TO FILTER BY SELECTED DAY  #
						// ###################################################################

						if (1/*eventSnapshot.val().eventDate == day*/) {
							let startTime = eventSnapshot.val().eventStartTime;
							let endTime = eventSnapshot.val().eventEndTime;
							await insertTime(allEvents, "start", startTime);
							await insertTime(allEvents, "end", endTime);
						}
					});
				}

			})); // after inner map
		});

	})); // after outer map
	let testLength = allEvents.length;
	if (testLength == 0 || testLength % 2 != 0) {
		console.log("Error: Something went wrong gathering start/end times for all invitees.");
		console.log("allEvents.length: "+testLength);
		return;
	}
	
	let availableStart = -1;
	if (allEvents[0].time != 0) {
		availableStart = 0;
	}
	// go through timeline of all events
	let availabilities = [];
	let stack = [];
	let allEventsLength = allEvents.length;
	for (let i = 0; i < allEventsLength; ++i) {
		if (allEvents[i].type == "start") {
			stack.push(allEvents[i].time);
			if (availableStart != -1) {
				if (availableStart != allEvents[i].time) {
					let startMins = await militaryToMinutes(availableStart);
					let endMins = await militaryToMinutes(allEvents[i].time);
					if ((endMins - startMins) == duration && availableStart >= minStartTime) {
						availabilities.push(new AvailableTime(day, availableStart, allEvents[i].time));
					}
					else if ((endMins - startMins) > duration) {
						// if startTime is before the minimum start time, shift it up before splitting by duration
						if (availableStart < minStartTime) {
							startMins = Math.floor(minStartTime/100) * 60 + (minStartTime%100);
						}
						while ((endMins - startMins) >= duration) {
							let militaryStart = await minutesToMilitary(startMins);
							startMins += duration;
							let militaryEnd = await minutesToMilitary(startMins);
							availabilities.push(new AvailableTime(day, militaryStart, militaryEnd));
						}
					}
				}
				availableStart = -1;
			}
		}
		else {
			stack.pop();
			if (stack.length == 0) {
				availableStart = allEvents[i].time;
			}
		}
	}
	if (availableStart == -1) {
		console.log("Midnight was not capped for the day. The last event was cut off at midnight");
	}
	else if (stack.length == 0) {
		let midnight = 2400;
		if (availableStart != midnight) {
			let startMins = await militaryToMinutes(availableStart);
			let endMins = await militaryToMinutes(midnight);
			if ((endMins - startMins) == duration && availableStart >= minStartTime) {
				availabilities.push(new AvailableTime(day, availableStart, midnight));
			}
			else if ((endMins - startMins) > duration) {
				// if startTime is before the minimum start time, shift it up before splitting by duration
				if (availableStart < minStartTime) {
					startMins = Math.floor(minStartTime/100) * 60 + (minStartTime%100);
				}
				while ((endMins - startMins) >= duration) {
					let militaryStart = await minutesToMilitary(startMins);
					startMins += duration;
					let militaryEnd = await minutesToMilitary(startMins);
					availabilities.push(new AvailableTime(day, militaryStart, militaryEnd));
				}
			}
		}
	}
	verifiedIDs = [];

						// ##################################################
						// #  TODO: REMOVE THIS TEST TO STOP PRINTING TEST  #
						// ##################################################
						/*console.log("available times:");
						availabilities.map((avail) => {console.log(avail);});*/

	displayAvailabilities(availabilities);
};

function insertTime(allEvents, start_or_end, time) {
	let timeInt = time.substring(0,2)+time.substring(3);
	let t = new TimeDivider(start_or_end, parseInt(timeInt));

						// ##################################################
						// #  TODO: REMOVE THIS TEST TO STOP PRINTING TEST  #
						// ##################################################
						/*console.log(start_or_end+": "+time);
						if (start_or_end == "end") console.log('\n');*/

	let allEventsLength = allEvents.length;
	for (let i = 0; i < allEventsLength; ++i) {
		if (t.time < allEvents[i].time) {
			allEvents.splice(i, 0, t);
			return Promise.resolve();
		}
	}
	allEvents.push(t);
	return Promise.resolve();
};

async function displayAvailabilities(availabilities) {
	
	let availabilitiesList = document.getElementById('availablilities-list');
	$(availabilitiesList).empty();
	let availLength = availabilities.length;
	for (let i = 0; i < availLength; ++i) {
		
		let newButton = document.createElement("button");
		newButton.setAttribute("class", "btn-availability");
		newButton.onclick = availabilityButton;
		availabilitiesList.appendChild(newButton);
		
		let newRow = document.createElement("div");
		newRow.setAttribute("class", "row");
		newButton.appendChild(newRow);

		let newCol1 = document.createElement("div");
		newCol1.setAttribute("class", "col-md-6");
		newCol1.innerHTML = availabilities[i].day;

		newRow.appendChild(newCol1);

		let newCol2 = document.createElement("div");
		newCol2.setAttribute("class", "col-md-6");
		let startTime = await militaryTo12Hour(availabilities[i].start);
		let endTime = availabilities[i].end;
		endTime = await militaryTo12Hour(endTime);
		newCol2.innerHTML = startTime + "<br>" + endTime;
		newRow.appendChild(newCol2);

		// Add custom data attributes
		$(newButton).attr("date", availabilities[i].day);
		$(newButton).attr("startTime", availabilities[i].start);
		$(newButton).attr("endTime", availabilities[i].end);
	}
};

function militaryToMinutes(military) {
	let resultMins = Math.floor(military/100) * 60 + (military%100);
	return Promise.resolve(resultMins);
};

function minutesToMilitary(minutes) {
	let hours = Math.floor(minutes / 60);
	minutes -= hours * 60;
	let military = hours * 100 + minutes;
	return Promise.resolve(military);
};

function militaryTo12Hour(intTime) {
	if (intTime == 0) {
		return Promise.resolve("12:00 AM");
	}
	else if (intTime == 2400) {
		return Promise.resolve("11:59 PM");
	}
	let hour = Math.floor(intTime/100);
	let timePeriod = (hour < 12) ? "AM" : "PM";
	hour = (hour == 0 || hour == 12) ? "12" : (hour % 12).toString();
	let minute = intTime % 100;
	if (minute < 10) minute = '0'+minute.toString();
	return Promise.resolve(hour + ':' + minute + ' ' + timePeriod);
};

function militaryToString(intTime) {
	if (intTime == 0) {
		return Promise.resolve("00:00");
	}
	else if (intTime == 2400) {
		return Promise.resolve("23:59");
	}
	let hour = Math.floor(intTime/100).toString();
	if (hour.length == 1) hour = '0' + hour;
	let minute = intTime % 100;
	if (minute < 10) {
		minute = "0"+minute.toString();
	}
	return Promise.resolve(hour + ':' + minute);
};

async function availabilityButton() {
	document.getElementById("datepicker").value = this.getAttribute("date");

	let startTime = this.getAttribute("startTime");
	startTime = await militaryToString(startTime);
	document.getElementById("startTime").value = startTime;

	let endTime = this.getAttribute("endTime");
	endTime = await militaryToString(endTime);
	document.getElementById("endTime").value = endTime
};
