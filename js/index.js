

//if signed in, remove option to sign up on homepage (firebase authentication)

//handle logic to display logout button when logged in, otherwise show signup/login 
$(document).ready(function()
{

	firebase.auth().onAuthStateChanged(function(user) {

		//if user is signed in
		if(user)
		{

			$('.sign-up-btn').css("display","none");
			$('.login-btn').css("display","none");

			$('.logout-btn').css("display","block");
			$('#setup-nav-btn').css("display","block");
			$('#import-nav-btn').css("display","block");
			$('#search-nav-btn').css("display","block");

		}
		else
		{
			//if no user is signed in
			$('.sign-up-btn').css("display","block");
			$('.login-btn').css("display","block");	

			$('.logout-btn').css("display","none");
			$('#setup-nav-btn').css("display","none");
			$('#import-nav-btn').css("display","none")
			$('#search-nav-btn').css("display","none")
		}

	});

});

// function to handle signing out
$('.logout-btn').on("click", function() {

	firebase.auth().signOut().then(function() {

		//signed out successfully
		$('.logout-btn').css("display","none");

		$('.sign-up-btn').css("display","block");
		$('.login-btn').css("display","block");

	});

});

$('#searchEvents').on("click", function() {
    $('#searchEventsModal').css('display', 'block');
});

$('#setupEvent').on("click", function() {
    $('#setupEventModal').css('display', 'block');
})

$('#importSchedule').on("click", function() {
    $('#importScheduleModal').css('display', 'block');
})

//Close the modal if the user clicks anywhere outside of the modal.
window.onclick = function(event) {
    if(event.target == document.getElementById("searchEventsModal")) {
        $('#searchEventsModal').css("display", "none");
    }
    else if(event.target == document.getElementById("importScheduleModal")) {
        $('#importScheduleModal').css("display", "none");
    }
    else if(event.target == document.getElementById("setupEventModal")) {
        $('#setupEventModal').css("display", "none");
    }
};

$(document).ready(function () {

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');

       	if($('#sidebar').hasClass("active"))
       	{
	        $('.img-collapse').css("display", "block");
       	}
       	else
       	{
	        $('.img-collapse').css("display", "none");
       	}
    });

});