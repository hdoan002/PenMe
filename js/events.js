
var userArray = new Array(0)
	
//handle setup new event logic
//TO-DO: Handle required fields (data-required)
$('.setup-event-btn').on("click", function() {

	var eventTitle = $('#form-title').val();

	var eventLocation = $('#form-location').val();

	var eventTimezone = $('#form-timezone').val();

	var eventDescription = $('#form-desc').val();

	var eventDate = $('#datepicker').val();

	var eventStart = $('#startTime').val();

	var eventEnd = $('#endTime').val();

	if(eventTitle === "" || eventLocation === "" || eventTimezone === "" || eventDescription === ""
		|| eventDate === "" || eventStart === "" || eventEnd === "")
	{
		alert("Please fill in the required fields");
	}
	else
	{
		createEvent();
	}

});

$('#form-add-attend-btn').on("click", function() {

	$('#inviteModal').css("display","block");

});

$('#closeBtn').on("click", function() {

	$('#inviteModal').css("display","none");

});

// use add button instead? 
$('.addUser').on('click', function(event) {

	event.preventDefault();

	var inviteEmail = $('#form-invitedUser').val();

	if(inviteEmail === "")
	{
		alert("Enter a valid email");
	}
	else
	{
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

		$('.closeSpan').on("click", function() {

			var pos = userArray.indexOf(inviteEmail);

			var removedItem = userArray.splice(pos, 1);

			$(this).parent().remove();

			//remove user from userArray

		});
	}

});

// When the user clicks anywhere outside of the modal, it should be closed
window.onclick = function(event) {
    if (event.target == document.getElementById('inviteModal')) 
    {
		$('#inviteModal').css("display","none");
    }
}

function createEvent()
{
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

	for(i = 0; i < eventRepetition.length; i++)
	{
		if(eventRepetition[i].checked)
		{
			repArray.push(eventRepetition[i].value);
		}
	}

	var repFrequency = $('#rep').val();

	var eventReminders = $('#form-reminders').val();

	var privacyValue = $('#privacy').val();

	var eventID = generateToken();

	//get participants (invited people)
	writeUserData(eventID, eventDate, eventStart, eventEnd, eventTitle, eventLocation, 
		eventTimezone, eventDescription, repArray, repFrequency, eventReminders, 
		privacyValue, userArray);		

};

//take form data and create a JSON object of all the data and
//upload to firebase database /eventss
function writeUserData(eI, eDay, eS, eE, eT, eL, eTz, eDesc, rA, rF, eR, pV, iA) {
	//set() overwrites data at the specified location (here events/eventID)
	firebase.auth().onAuthStateChanged(function(user) {

		if(user)
		{
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
				repetitionaDaysArray: rA, 
				repetitionFrequency: rF, 
				eventReminders: eR,
				privacySetting: pV, 
				invitedUsers: iA

			}).then(function() {

				alert("Event created successfully!");

				window.location.href = "index.html"

			}).catch(function(error) {

				var errorMessage = error.message;

				alert("ERROR: " + errorMessage);

			});		
		}
		else
		{
			//user is not signed in
			alert("ERROR: Must be logged in to setup a new event");
		}

	});

}	

function rand() {

    return Math.random().toString(36).substr(2); // remove `0.`

};

function generateToken() {

    return rand() + rand(); // to make it longer

};

//redirect to homepage if user logs out/tries to access unauthorised
$(document).ready(function()
{

  firebase.auth().onAuthStateChanged(function(user) {

    //if user is signed out, redirect to home page
    if(!user)
    {
      window.location.href = "index.html"
    }

  });

});