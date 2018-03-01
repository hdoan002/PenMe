
var userArray = new Array(0)

//handle setup new event logic
$('.setup-event-btn').on("click", function () {

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
	else {
		createEvent();
	}

});

$('#form-add-attend-btn').on("click", function () {

	$('#inviteModal').css("display", "block");

});

$('#closeBtn').on("click", function () {

	$('#inviteModal').css("display", "none");

});

// use add button instead? 
$('.addUser').on('click', function (event) {

	event.preventDefault();

	var inviteEmail = $('#form-invitedUser').val();

	if (inviteEmail === "") {
		alert("Enter a valid email");
	}
	else {
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
        else
        {
        	alert("no invited users");
        }

    });

};