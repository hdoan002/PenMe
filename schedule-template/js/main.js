var currentWeek = 0;

jQuery(document).ready(function($){
	var transitionEnd = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';
	var transitionsSupported = ( $('.csstransitions').length > 0 );
	//if browser does not support transitions - use a different event to trigger them
	if( !transitionsSupported ) transitionEnd = 'noTransition';
	
    $('#last_wk_btn').on('click', function() {
        if(currentWeek - 1 < 0)
        {
            window.alert('Cannot go back previous weeks! (For now)');
        }
        else
        {
            currentWeek -= 1;
            displayWeek(currentWeek);
        }
    });
    
    $('#next_wk_btn').on('click', function() {
        currentWeek += 1;
        displayWeek(currentWeek);
    });
    
    
    
	//should add a loding while the events are organized 
	function SchedulePlan( element ) {
		this.element = element;
		this.timeline = this.element.find('.timeline');
		this.timelineItems = this.timeline.find('li');
		this.timelineItemsNumber = this.timelineItems.length;
		this.timelineStart = getScheduleTimestamp(this.timelineItems.eq(0).text());
		//need to store delta (in our case half hour) timestamp
		this.timelineUnitDuration = getScheduleTimestamp(this.timelineItems.eq(1).text()) - getScheduleTimestamp(this.timelineItems.eq(0).text());

		this.eventsWrapper = this.element.find('.events');
		this.eventsGroup = this.eventsWrapper.find('.events-group');
		this.singleEvents = this.eventsGroup.find('.single-event');
		this.eventSlotHeight = this.eventsGroup.eq(0).children('.top-info').outerHeight();

		this.modal = this.element.find('.event-modal');
		this.modalHeader = this.modal.find('.header');
		this.modalHeaderBg = this.modal.find('.header-bg');
		this.modalBody = this.modal.find('.body'); 
		this.modalBodyBg = this.modal.find('.body-bg'); 
		this.modalMaxWidth = 800;
		this.modalMaxHeight = 480;

		this.animating = false;

		this.initSchedule();
	}

	SchedulePlan.prototype.initSchedule = function() {
        this.scheduleReset();
		this.initEvents();
	};

	SchedulePlan.prototype.scheduleReset = function() {
		var mq = this.mq();
		if( mq == 'desktop' && !this.element.hasClass('js-full') ) {
			//in this case you are on a desktop version (first load or resize from mobile)
			this.eventSlotHeight = this.eventsGroup.eq(0).children('.top-info').outerHeight();
			this.element.addClass('js-full');
			this.placeEvents();
			this.element.hasClass('modal-is-open') && this.checkEventModal();
		} else if(  mq == 'mobile' && this.element.hasClass('js-full') ) {
			//in this case you are on a mobile version (first load or resize from desktop)
			this.element.removeClass('js-full loading');
			this.eventsGroup.children('ul').add(this.singleEvents).removeAttr('style');
			this.eventsWrapper.children('.grid-line').remove();
			this.element.hasClass('modal-is-open') && this.checkEventModal();
		} else if( mq == 'desktop' && this.element.hasClass('modal-is-open')){
			//on a mobile version with modal open - need to resize/move modal window
			this.checkEventModal('desktop');
			this.element.removeClass('loading');
		} else {
			this.element.removeClass('loading');
		}
	};

	SchedulePlan.prototype.initEvents = function() {
		var self = this;

		this.singleEvents.each(function(){
			//create the .event-date element for each event
			var durationLabel = '<span class="event-date">'+$(this).data('start')+' - '+$(this).data('end')+'</span>';
			$(this).children('a').prepend($(durationLabel));

			//detect click on the event and open the modal
			$(this).on('click', 'a', function(event){
				event.preventDefault();
				if( !self.animating ) self.openModal($(this));
			});
		});

		//close modal window
		this.modal.on('click', '.close', function(event){
			event.preventDefault();
			if( !self.animating ) self.closeModal(self.eventsGroup.find('.selected-event'));
		});
		this.element.on('click', '.cover-layer', function(event){
			if( !self.animating && self.element.hasClass('modal-is-open') ) self.closeModal(self.eventsGroup.find('.selected-event'));
		});
	};

	SchedulePlan.prototype.placeEvents = function() {
		var self = this;
		this.singleEvents.each(function(){
			//place each event in the grid -> need to set top position and height
			var start = getScheduleTimestamp($(this).attr('data-start')),
				duration = getScheduleTimestamp($(this).attr('data-end')) - start;

			var eventTop = self.eventSlotHeight*(start - self.timelineStart)/self.timelineUnitDuration,
				eventHeight = self.eventSlotHeight*duration/self.timelineUnitDuration;
			
			$(this).css({
				top: (eventTop-1) +'px',
				height: (eventHeight+1)+'px'
			});
		});

		this.element.removeClass('loading');
	};

	SchedulePlan.prototype.openModal = function(event) {
		var self = this;
		var mq = self.mq();
		this.animating = true;

		//update event name and time
		this.modalHeader.find('.event-name').text(event.find('.event-name').text());
		this.modalHeader.find('.event-date').text(event.find('.event-date').text());
		this.modal.attr('data-event', event.parent().attr('data-event'));

		//update event content
		this.modalBody.find('.event-info').load(event.parent().attr('data-content')+'.html .event-info > *', function(data){
			//once the event content has been loaded
			self.element.addClass('content-loaded');
		});

		this.element.addClass('modal-is-open');

		setTimeout(function(){
			//fixes a flash when an event is selected - desktop version only
			event.parent('li').addClass('selected-event');
		}, 10);

		if( mq == 'mobile' ) {
			self.modal.one(transitionEnd, function(){
				self.modal.off(transitionEnd);
				self.animating = false;
			});
		} else {
			var eventTop = event.offset().top - $(window).scrollTop(),
				eventLeft = event.offset().left,
				eventHeight = event.innerHeight(),
				eventWidth = event.innerWidth();

			var windowWidth = $(window).width(),
				windowHeight = $(window).height();

			var modalWidth = ( windowWidth*.8 > self.modalMaxWidth ) ? self.modalMaxWidth : windowWidth*.8,
				modalHeight = ( windowHeight*.8 > self.modalMaxHeight ) ? self.modalMaxHeight : windowHeight*.8;

			var modalTranslateX = parseInt((windowWidth - modalWidth)/2 - eventLeft),
				modalTranslateY = parseInt((windowHeight - modalHeight)/2 - eventTop);
			
			var HeaderBgScaleY = modalHeight/eventHeight,
				BodyBgScaleX = (modalWidth - eventWidth);

			//change modal height/width and translate it
			self.modal.css({
				top: eventTop+'px',
				left: eventLeft+'px',
				height: modalHeight+'px',
				width: modalWidth+'px',
			});
			transformElement(self.modal, 'translateY('+modalTranslateY+'px) translateX('+modalTranslateX+'px)');

			//set modalHeader width
			self.modalHeader.css({
				width: eventWidth+'px',
			});
			//set modalBody left margin
			self.modalBody.css({
				marginLeft: eventWidth+'px',
			});

			//change modalBodyBg height/width ans scale it
			self.modalBodyBg.css({
				height: eventHeight+'px',
				width: '1px',
			});
			transformElement(self.modalBodyBg, 'scaleY('+HeaderBgScaleY+') scaleX('+BodyBgScaleX+')');

			//change modal modalHeaderBg height/width and scale it
			self.modalHeaderBg.css({
				height: eventHeight+'px',
				width: eventWidth+'px',
			});
			transformElement(self.modalHeaderBg, 'scaleY('+HeaderBgScaleY+')');
			
			self.modalHeaderBg.one(transitionEnd, function(){
				//wait for the  end of the modalHeaderBg transformation and show the modal content
				self.modalHeaderBg.off(transitionEnd);
				self.animating = false;
				self.element.addClass('animation-completed');
			});
		}

		//if browser do not support transitions -> no need to wait for the end of it
		if( !transitionsSupported ) self.modal.add(self.modalHeaderBg).trigger(transitionEnd);
	};

	SchedulePlan.prototype.closeModal = function(event) {
		var self = this;
		var mq = self.mq();

		this.animating = true;

		if( mq == 'mobile' ) {
			this.element.removeClass('modal-is-open');
			this.modal.one(transitionEnd, function(){
				self.modal.off(transitionEnd);
				self.animating = false;
				self.element.removeClass('content-loaded');
				event.removeClass('selected-event');
			});
		} else {
			var eventTop = event.offset().top - $(window).scrollTop(),
				eventLeft = event.offset().left,
				eventHeight = event.innerHeight(),
				eventWidth = event.innerWidth();

			var modalTop = Number(self.modal.css('top').replace('px', '')),
				modalLeft = Number(self.modal.css('left').replace('px', ''));

			var modalTranslateX = eventLeft - modalLeft,
				modalTranslateY = eventTop - modalTop;

			self.element.removeClass('animation-completed modal-is-open');

			//change modal width/height and translate it
			this.modal.css({
				width: eventWidth+'px',
				height: eventHeight+'px'
			});
			transformElement(self.modal, 'translateX('+modalTranslateX+'px) translateY('+modalTranslateY+'px)');
			
			//scale down modalBodyBg element
			transformElement(self.modalBodyBg, 'scaleX(0) scaleY(1)');
			//scale down modalHeaderBg element
			transformElement(self.modalHeaderBg, 'scaleY(1)');

			this.modalHeaderBg.one(transitionEnd, function(){
				//wait for the  end of the modalHeaderBg transformation and reset modal style
				self.modalHeaderBg.off(transitionEnd);
				self.modal.addClass('no-transition');
				setTimeout(function(){
					self.modal.add(self.modalHeader).add(self.modalBody).add(self.modalHeaderBg).add(self.modalBodyBg).attr('style', '');
				}, 10);
				setTimeout(function(){
					self.modal.removeClass('no-transition');
				}, 20);

				self.animating = false;
				self.element.removeClass('content-loaded');
				event.removeClass('selected-event');
			});
		}

		//browser do not support transitions -> no need to wait for the end of it
		if( !transitionsSupported ) self.modal.add(self.modalHeaderBg).trigger(transitionEnd);
	}

	SchedulePlan.prototype.mq = function(){
		//get MQ value ('desktop' or 'mobile') 
		var self = this;
		return window.getComputedStyle(this.element.get(0), '::before').getPropertyValue('content').replace(/["']/g, '');
	};

	SchedulePlan.prototype.checkEventModal = function(device) {
		this.animating = true;
		var self = this;
		var mq = this.mq();

		if( mq == 'mobile' ) {
			//reset modal style on mobile
			self.modal.add(self.modalHeader).add(self.modalHeaderBg).add(self.modalBody).add(self.modalBodyBg).attr('style', '');
			self.modal.removeClass('no-transition');	
			self.animating = false;	
		} else if( mq == 'desktop' && self.element.hasClass('modal-is-open') ) {
			self.modal.addClass('no-transition');
			self.element.addClass('animation-completed');
			var event = self.eventsGroup.find('.selected-event');

			var eventTop = event.offset().top - $(window).scrollTop(),
				eventLeft = event.offset().left,
				eventHeight = event.innerHeight(),
				eventWidth = event.innerWidth();

			var windowWidth = $(window).width(),
				windowHeight = $(window).height();

			var modalWidth = ( windowWidth*.8 > self.modalMaxWidth ) ? self.modalMaxWidth : windowWidth*.8,
				modalHeight = ( windowHeight*.8 > self.modalMaxHeight ) ? self.modalMaxHeight : windowHeight*.8;

			var HeaderBgScaleY = modalHeight/eventHeight,
				BodyBgScaleX = (modalWidth - eventWidth);

			setTimeout(function(){
				self.modal.css({
					width: modalWidth+'px',
					height: modalHeight+'px',
					top: (windowHeight/2 - modalHeight/2)+'px',
					left: (windowWidth/2 - modalWidth/2)+'px',
				});
				transformElement(self.modal, 'translateY(0) translateX(0)');
				//change modal modalBodyBg height/width
				self.modalBodyBg.css({
					height: modalHeight+'px',
					width: '1px',
				});
				transformElement(self.modalBodyBg, 'scaleX('+BodyBgScaleX+')');
				//set modalHeader width
				self.modalHeader.css({
					width: eventWidth+'px',
				});
				//set modalBody left margin
				self.modalBody.css({
					marginLeft: eventWidth+'px',
				});
				//change modal modalHeaderBg height/width and scale it
				self.modalHeaderBg.css({
					height: eventHeight+'px',
					width: eventWidth+'px',
				});
				transformElement(self.modalHeaderBg, 'scaleY('+HeaderBgScaleY+')');
			}, 10);

			setTimeout(function(){
				self.modal.removeClass('no-transition');
				self.animating = false;	
			}, 20);
		}
	};
    
	$(window).on('resize', function(){
		if( !windowResize ) {
			windowResize = true;
			(!window.requestAnimationFrame) ? setTimeout(checkResize) : window.requestAnimationFrame(checkResize);
		}
	});

	$(window).keyup(function(event) {
		if (event.keyCode == 27) {
			objSchedulesPlan.forEach(function(element){
				element.closeModal(element.eventsGroup.find('.selected-event'));
			});
		}
	});

	function checkResize(){
		objSchedulesPlan.forEach(function(element){
			element.scheduleReset();
		});
		windowResize = false;
	}

	function getScheduleTimestamp(time) {
		//accepts hh:mm format - convert hh:mm to timestamp
		time = time.replace(/ /g,'');
		var timeArray = time.split(':');
		var timeStamp = parseInt(timeArray[0])*60 + parseInt(timeArray[1]);
		return timeStamp;
	}

	function transformElement(element, value) {
		element.css({
		    '-moz-transform': value,
		    '-webkit-transform': value,
			'-ms-transform': value,
			'-o-transform': value,
			'transform': value
		});
	}
    
    function displaySchedule(weeksFromNow)
    {
        populateSchedule(weeksFromNow).then(function() {
              var newSchedule = new SchedulePlan($('.cd-schedule'));
              objSchedulesPlan.push(newSchedule);
              //Place the new events here.
              newSchedule.placeEvents();
        	   if( schedules.length > 0 ) {
		          schedules.each(function(){
			         //create SchedulePlan objects
                     //TODO: Handle some sort of deletion of old objs

		          });
	           }
        });
    }
    
    //Gets the first day of the current week. May need to change this for multiple weeks.
    function getDatesOfWeek(weeksFromNow)
    {
        //Get today's date
        var datesOfWeek = [];
        var currentDay = new Date();
        //Take the current days month and subtract it by the number assigned to the day the date is assigned to. Date objects assume that getDay() is 1-6=Monday-Saturday and 0=Sunday, so this always returns the Sunday of the previous week
        currentDay.setDate(currentDay.getDate() - currentDay.getDay() + (weeksFromNow * 7) - 1);
        
        //Loop for one whole week, setting the date to one day forward for 7 days total
        for( i = 0; i < 7; i++)
        {
            currentDay.setDate(currentDay.getDate() + 1);
            var day = currentDay.getDate();
            var month = currentDay.getMonth() + 1;
            var year = currentDay.getFullYear();
            if(day < 10)
            {
                day = '0' + day;
            }
            if(month < 10)
            {
                month = '0' + month;
            }
            var date = year + '-' + month + '-' + day;
            datesOfWeek.push(date);
        }
        console.log(datesOfWeek);
        return datesOfWeek;
    }
    
    //Obtains the earliest meeting for a week
    function setEarliestTime()
    {
        var currentDate = new Date();
        var hours = currentDate.getHours().toString();
        var minutes = "";
        if(currentDate.getMinutes() >= 30) //For half hour
        {
            minutes = "30";
        }
        else
        {
            minutes = "00";
        }
        return '#' + hours + minutes;
    }
    
    //Parses date from firebase and returns a Date object with the correct date.
    function parseDate(date)
    {
        //Split data into an array
        //The format should be YYYY-MM-DD
        var splicedData = date.split("-");
        var year = splicedData[0];
        //Date creation assumes month is 0-based
        var month = splicedData[1] - 1; 
        var day = splicedData[2]
        return new Date(year, month, day);
    }
    
    //Displays the day of the month of the current week on the schedule.
    function displayDays(weekDates)
    {
        var weekDays = [];
        for(i = 0; i < weekDates.length; i++)
        {
            weekDays.push(parseDate(weekDates[i]));
        }
        for(i = 0; i < weekDays.length; i++)
        {
            $("#date-label-" + i.toString()).html(weekDays[i].getDate());
        }
    }
    
    //Generates HTML for events on schedule
    function populateSchedule(weeksFromNow) {
        return new Promise(function (resolve, reject) {
            var eventsRef = firebase.database().ref('events');
            //Get the dates of the current week
            var currentWeekDates = getDatesOfWeek(weeksFromNow);
            displayDays(currentWeekDates);

            eventsRef.once("value")
                .then(function(snapshot) {
                      snapshot.forEach(function(eventSnapshot) {
        
                            var key = eventSnapshot.key;
        
                            //only display events that belong to current logged in user
                            var userID = firebase.auth().currentUser.uid;
        
                            firebase.database().ref('users/' + userID).once("value").then(function(res) {
        
                                var eventsArrayCopy = res.val().events.slice();
        
                                eventsArrayCopy.forEach(function(data) {
                                    
                                    if(key === data && currentWeekDates.includes(eventSnapshot.val().eventDate))
                                    {
                                        //Grab database data
                                        var eventData = eventSnapshot.val();
                                        var date = parseDate(eventData.eventDate);
                                        var newEvent = $('<li></li>').addClass('single-event');
                                        var newHref = $('<a></a>');
                                        var title = $('<em></em>').addClass('event-name');
                                        newEvent.attr('data-start', eventData.eventStartTime);
                                        newEvent.attr('data-end', eventData.eventEndTime);
                                        newEvent.attr('data-event', 'event-1');
                                        newHref.attr('href', '#0');
                                        title.html(eventData.eventTitle);
                                        newHref.append(title);
                                        newEvent.append(newHref);
                                        if(date.getDay() == 1)
                                        {
                                            $('#MondayInfo').append(newEvent);
                                        }
                                        else if(date.getDay() == 2)
                                        {
                                            $('#TuesdayInfo').append(newEvent);
                                        }
                                        else if(date.getDay() == 3)
                                        {
                                            $('#WednesdayInfo').append(newEvent);
                                        }
                                        else if(date.getDay() == 4)
                                        {
                                            $('#ThursdayInfo').append(newEvent);
                                        }
                                        else if(date.getDay() == 5)
                                        {
                                            $('#FridayInfo').append(newEvent);
                                        }
                                        else if(date.getDay() == 6)
                                        {
                                            $('#SaturdayInfo').append(newEvent);
                                        }
                                        else if(date.getDay() == 0)
                                        {
                                            $('#SundayInfo').append(newEvent);
                                        }
                                			//detect click on the event and open the modal
			                            $(newEvent).on('click', 'a', function(event){
			                            	fillEventInfo(eventData)
			                            });
                                        
                                    }
        
                                });
                                return resolve();
        
                            });                    
        
                      });
                });
                
            });

    }
    
    function displayWeek(week)
    {
        $('.single-event').remove();
        displaySchedule(week);
    }
    
    //Helper function to fill event modal data with the correct event information
    function fillEventInfo(data)
    {
        //House the event ID in the modal to capture for editing events
        $('#eventID').css("display", "none");
        $('#eventID').html(data.eventID);
        
        var eventText = $('#event-text').text(
        "Title: " + data.eventTitle + "\n" +
        "Owner: " + data.eventOwner + "\n" +
        "Description: " + data.eventDescription + "\n" +
        "Privacy: " + data.privacySetting + "\n"); 
        eventText.html(eventText.html().replace(/\n/g,'</br>'));
    }
    
    //This will create schedule plan objects
	var schedules = $('.cd-schedule');
	var objSchedulesPlan = [],
		windowResize = false;
    //Populate the schedule with events from firebase
    displaySchedule(currentWeek);
    //Scrolls the schedule down to the current time today.
    var offset = $(setEarliestTime()).offset().top - $('#schedule').offset().top;      
    $('#schedule').animate({scrollTop: offset}, 'slow');
    
});