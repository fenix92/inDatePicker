//<![CDATA[

	/* ============================================ In Date Picker ============================================ *\

		plugin that open & manage a input supposed to received a date value. The script opens a calendar
		
		USE -
			to use it, considering the following html :
			<input id="foo" type="text">

			var inputDatePicker = $("#foo").inDatePicker({
				multiDays		: true,		// allow you to choose a start date + end date (true). Or a single one (false)
				dateCalendarFirst	: 'today',	// define the first selectable date if any. has to be dd/mm/yyyy format, or 'today'
				dateCalendarLast	: '',		// define the last selectable date if any. has to be dd/mm/yyyy format, or 'today'
				date_start		: '26/09/1985',	// set a selected first date. has to be dd/mm/yyyy format, or 'today'
				date_end		: '',		// set a selected last date. has to be dd/mm/yyyy format, or 'today'
				placeholderFirstDate	: 'Start Date',	// placeholder of the first date
				placeholderEndDate	: 'End Date',	// placeholder of the last date
			});
			-or-
			var inputDatePicker = $("#foo").inDatePicker();
			list of available methods
			inputDatePicker.show();			// display the calendar
			inputDatePicker.hide();			// slideUp the calendar
			inputDatePicker.getFirstDay(true);	// return the selected first day "Jeudi 15 Fevrier 2022"
			inputDatePicker.getFirstDay(false);	// return the selected first day "15/2/2022"
			inputDatePicker.getLastDay(true);	// return the selected last day "Jeudi 15 Fevrier 2022"
			inputDatePicker.getLastDay(false);	// return the selected last day "15/2/2022"
			inputDatePicker.getNumberDays();	// return the number of days in the selection

		CREDIT -
			Sebastien Pipet (https://www.facebook.com/sebastien.pipet)
		VERSION -
			0.1
		DISCLAIMER -
			All this code is free : you can use, redistribute and/or modify it without any consentement.
			Please just leave my name on it ;-)
		DEFAULT VALUES -
			you can customise the defaults values below :

	/* ========================================= DEFAULT VALUES ============================================ */

	var	listeSeparatorsID = [];				// list of the separators.
			// below are the authorised separators : the char + the keyCode + keyUp associated. Note also that order matter : only the firt one will be displayed.
			listeSeparatorsID.push(['/',47,191]);
			listeSeparatorsID.push(['-',45,173]);
			listeSeparatorsID.push([' ',32,32]);
			listeSeparatorsID.push(['.',46,190]);
	var	linkCSS = "inDatePicker.css";			// link of the attached CSS file, if not already loaded in the html page
	var	multiDays_default		= false;	// allow the calendar to select one single date, or more
	var	dateCalendarFirst_default	= null;		// first available date in the calendar, if null, no restriction
	var	dateCalendarLast_default	= null;		// last available date in the calendar, if null, no restriction
	var	listMonths			= ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
	var	listDays			= ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
	var	placeholderFirstDate_default	= 'date de départ';
	var	placeholderEndDate_default	= 'date de fin';
	var	closeButton			= 'ok';		// text to close the calendar &#8593;
	var	howManyDays			= 'nombre de jours sélectionnés :';		// text to intoduce the number of day
	var	date_start_default		= null;		// first date selected, with format dd/mm/yyyy . If null, no date is pre-selected
	var	date_end_default		= null;		// if multiDays_default is set to true ; last date selected, with format dd/mm/yyyy . If null, no date is pre-selected.
	var	speedAnimation			= 400;		// animation speed

	/* =================================================================================================== */


(function ( $ ) {

	// loading CSS file
	if(!document.getElementById("inDatePickerCSS")){
		var head  = document.getElementsByTagName('head')[0];
		var link  = document.createElement('link');
		link.id   = "inDatePickerCSS";
		link.rel  = 'stylesheet';
		link.type = 'text/css';
		link.href = linkCSS;
		link.media = 'all';
		head.appendChild(link);
	}
	// loading all occurs of the plugin into an object
	var listInDatePicker = {};

	$.fn.inDatePicker = function(params) {

		// if multiple elements, we split them. Only once they are "alone", we keep doing further
		if (this.length > 1){
			this.each(function() { $(this).inDatePicker(params) });
			return this;
		}


		// ================= PRIVATE PROPERTIES =================


		var	inDatePicker = this;

		var	heightInput		= inDatePicker.outerHeight(false),
			widthInput		= inDatePicker.outerWidth(false),
			animationInProgress	= false,		// prevent user to click while an animation is in progress
			focusOnDateStart	= true,			// tells the pluggin that we are checking the first date
			isCalendarHidden	= true,			// tells if the calendar is visible or hidden
			calendarGlobalContainer,inputsContainer,calendarFooter,calendarContainer;	// var with global scope

		// customizable parameters available, with the default values
		params = $.extend({
			multiDays		: multiDays_default,
			dateCalendarFirst	: dateCalendarFirst_default,
			dateCalendarLast	: dateCalendarLast_default,
			date_start		: date_start_default,
			date_end		: date_end_default,
			placeholderFirstDate	: placeholderFirstDate_default,
			placeholderEndDate	: placeholderEndDate_default
		}, params);


		// ================= PUBLIC PROPERTIES =================


		inDatePicker.credit = 'sebastien pipet';


		// ================= PRIVATE FUNCTIONS =================


		// init the plugin : instanciation
		var DP_intialize = function() {
			// we create a custom ID (wich is actually a (unique) class)
			counter = DP_countItems();
			iname = "inDatePicker_input_"+counter;
			inDatePicker.addClass(iname);

			// the plugin HAS TO BE used on input (of text type). We first check it.
			if(! $("."+iname).is('input:text') ){
				console.log("inDatePicker plugin : fail, it has to be used on a input of type text.");
				return false;
			}else{
				// we store the element into the inDatePickerList
				listInDatePicker[counter] = inDatePicker;

				DP_initCalendar();
				return inDatePicker;
			}
		};
		// function that counts the number of items (for old browsers)
		var DP_countItems = function() {
			var count = 0;
			for (var i in listInDatePicker) {
				if (listInDatePicker.hasOwnProperty(i)) {
					count++;
				}
			}
			// we get the value
			return count;
		};
		// creating the calendar
		var DP_initCalendar = function(){
			// we warp the input into a brand-new-div to be able to manage the absolute positionning
			$("."+iname).wrap('<div id="'+iname+'_globalContainer" class="calendarGlobalContainer"></div>');
			// creating the skeleton of the calendar -
			calendarGlobalContainer = $("#"+iname+"_globalContainer");
			calendarGlobalContainer.append('<div class="inputContainer"></div><div class="calendarContainer"><div class="calendarHeaderPrev ns">&#8592;</div><div class="calendarHeaderNext ns">&#8594;</div><div class="calendarFooter"><div class="calendarFooterText"></div><div class="calendarFooterClose ns">'+closeButton+'</div></div></div>');
			inputsContainer	= calendarGlobalContainer.find(".inputContainer");
			calendarFooter	= calendarGlobalContainer.find(".calendarFooter");
			// we set the same border as the original <input>
			calendarGlobalContainer.css({
				"border-width" :	$("."+iname).css("border-width"),
				"border-style" :	$("."+iname).css("border-style"),
				"border-color" :	$("."+iname).css("border-color")
			});
			if(params.multiDays){
				inputsContainer.append('<input class="inputDateStart" value="" type="text" placeholder="'+params.placeholderFirstDate+'" onClick="this.setSelectionRange(0, this.value.length)" readonly="readonly" data-value=""/><div class="split ns">&#8594;</div><input class="inputDateEnd" value="" type="text" placeholder="'+params.placeholderEndDate+'" onClick="this.setSelectionRange(0, this.value.length)" readonly="readonly" data-value=""/>');
				calendarGlobalContainer.find('.inputDateEnd').focusin(function(){
					focusOnDateStart = false;
					DP_openCalendar();
				});
			}else{
				inputsContainer.append('<input class="inputDateStart" value="" type="text" placeholder="'+params.placeholderFirstDate+'" onClick="this.setSelectionRange(0, this.value.length)" readonly="readonly" data-value=""/>');
			}
			calendarGlobalContainer.find('.inputDateStart').focusin(function(){
				focusOnDateStart = true;
				DP_openCalendar();
			});
			calendarContainer	= calendarGlobalContainer.find(".calendarContainer");
			calendarGlobalContainer.find('.calendarHeaderPrev').click(function() {
				DP_showMore('prev');
			});
			calendarGlobalContainer.find('.calendarHeaderNext').click(function() {
				DP_showMore('next');
			});
			calendarGlobalContainer.find('.calendarFooterClose').click(function() {
				DP_closeCalendar();
			});
			var borderWidth_calendarContainer = parseInt($("."+iname).css("border-left-width"),10) + parseInt($("."+iname).css("border-right-width"),10) - parseInt(calendarContainer.css("border-left-width"),10) - parseInt(calendarContainer.css("border-right-width"),10);
			calendarContainer.css({
				"top" :		(heightInput+parseInt($("."+iname).css("border-bottom-width"),10))+"px",
				"left" :	'-'+($("."+iname).css("border-left-width")),
				"width" :	"calc(100% + "+borderWidth_calendarContainer+"px)"
			});
			// we check if any start_date, end_date has been filled
			if(params.date_start == null || params.date_start.length == 0){
				// params.date_start = new Date();
			}else{
				var reg = (params.date_start).match(new RegExp('^([0-9]*)'+DP_arraySeparators()+'([0-9]*)'+DP_arraySeparators()+'([0-9]*)$'));
				if(params.date_start.toLowerCase() == "today"){
					params.date_start = new Date();
					params.date_start.setHours(0, 0, 0, 0);
				}else if(reg){
					params.date_start = DP_convertToDate(params.date_start);
				}else{
					params.date_start = date_start_default
				}
				// generate the full readable date
				if(params.date_start != null){
					calendarGlobalContainer.find(".inputDateStart").val(DP_convertToReadingDate(params.date_start)).attr('data-value', DP_convertToFormatedDate(params.date_start));
					if(!params.multiDays){
						calendarGlobalContainer.find(".calendarFooterText").html(howManyDays+' '+DP_howManyDays());
						DP_overrideInput();
					}
				}
			}
			if(params.date_end == null || params.date_end.length == 0){
				// params.date_end = new Date();
			}else{
				var reg = (params.date_end).match(new RegExp('^([0-9]*)'+DP_arraySeparators()+'([0-9]*)'+DP_arraySeparators()+'([0-9]*)$'));
				if(params.date_end.toLowerCase() == "today"){
					params.date_end = new Date();
					params.date_end.setHours(0, 0, 0, 0);
				}else if(reg){
					params.date_end = DP_convertToDate(params.date_end);
				}else{
					params.date_end = date_end_default
				}
				// generate the full readable date
				if(params.date_end != null){
					if(	params.date_start!=null && params.date_start instanceof Date &&
						params.date_end!=null && params.date_end instanceof Date &&
						params.multiDays){
						if(params.date_start>params.date_end){
							// we switch the dates if start > end
							var temp = params.date_start;
							params.date_start = params.date_end;
							params.date_end = temp;
							calendarGlobalContainer.find(".inputDateStart").val(DP_convertToReadingDate(params.date_start)).attr('data-value', DP_convertToFormatedDate(params.date_start));
						}
						calendarGlobalContainer.find(".calendarFooterText").html(howManyDays+' '+DP_howManyDays());
					}
					calendarGlobalContainer.find(".inputDateEnd").val(DP_convertToReadingDate(params.date_end)).attr('data-value', DP_convertToFormatedDate(params.date_end));
					if(params.multiDays){
						DP_overrideInput();
					}

				}
			}
			if(params.dateCalendarFirst.toLowerCase() == "today"){
				var d = new Date();
				params.dateCalendarFirst = DP_convertToFormatedDate(d);
			}
			if(params.dateCalendarLast.toLowerCase() == "today"){
				var d = new Date();
				params.dateCalendarLast = DP_convertToFormatedDate(d);
			}
			// suivant les cas, on a besoin d'une date ou de deux (debut/fin)
			if(params.multiDays){
				// on en veut deux
				var date_calendar = new Date();
				if(params.date_start!=null && params.date_start instanceof Date && params.multiDays){
					date_calendar = params.date_start;
				}
				// on ajoute une class speciale a calendarContainer
				calendarContainer.addClass("split");
				calendarContainer.append('<div class="calendar" data-month="'+date_calendar.getMonth()+'" data-year="'+date_calendar.getFullYear()+'"></div>');
				// next mont
				var nextMonth = new Date(date_calendar.getTime()); nextMonth.setMonth((date_calendar).getMonth()+1);
				calendarContainer.append('<div class="calendar" data-month="'+nextMonth.getMonth()+'" data-year="'+nextMonth.getFullYear()+'"></div>');
				var calendar1 = calendarContainer.find('.calendar[data-month="'+date_calendar.getMonth()+'"][data-year="'+date_calendar.getFullYear()+'"]');
				calendar1.css({
					"left" :	0
				}).append(DP_getCalendarHTML(date_calendar.getMonth(),date_calendar.getFullYear()));
				var calendar2 = calendarContainer.find('.calendar[data-month="'+nextMonth.getMonth()+'"][data-year="'+nextMonth.getFullYear()+'"]')
				calendar2.css({
					"right" :	0
				}).append(DP_getCalendarHTML(nextMonth.getMonth(),nextMonth.getFullYear()));
				// on ajuste la taille de .calendarContainer
				calendarContainer.height(Math.max(calendar1.height(),calendar2.height())+calendarFooter.height());
			}else{
				// on en veut qu'un
				var date_calendar = new Date();
				if(params.date_start!=null && params.date_start instanceof Date && params.multiDays){
					date_calendar = params.date_start;
				}
				calendarContainer.append('<div class="calendar" data-month="'+date_calendar.getMonth()+'" data-year="'+date_calendar.getFullYear()+'"></div>');
				var calendar = $('.calendar[data-month="'+date_calendar.getMonth()+'"][data-year="'+date_calendar.getFullYear()+'"]');
				calendarContainer.find('.calendar[data-month="'+date_calendar.getMonth()+'"][data-year="'+date_calendar.getFullYear()+'"]').append(DP_getCalendarHTML(date_calendar.getMonth(),date_calendar.getFullYear()));
				calendarContainer.height(calendar.height()+calendarFooter.height());
			}
			// check if some cells must be selected
			DP_checkDaysSelected();
			// check if arrows has to be toggled
			DP_checkArrows();
			// attach a listener on the day cells
			calendarContainer.on("click", ".day:not(.day_ns)", function() {
				var timestamp = $(this).attr("data-id");
				DP_selectDay(timestamp);
			});
			calendarContainer.on({
				mouseenter: function(){
					// we highlight the days in between
					if(params.date_start!=null && params.date_start instanceof Date && params.multiDays){
						var currentDateTimestamp = $(this).attr("data-id");
						var date_startTimestamp = params.date_start.getTime();
						$("#"+iname+"_globalContainer .day").each(function(i,d){
							if($(d).attr("data-id") < currentDateTimestamp && $(d).attr("data-id") > date_startTimestamp){
								// if the 2 dates are selected...
								if(params.date_end==null){
									$(d).addClass("day_selection_hover");
								}
							}else{
								$(d).removeClass("day_selection_hover");
							}
						});
					}
				},mouseleave: function(){
					$("#"+iname+"_globalContainer .day_selection_hover").removeClass("day_selection_hover");
				}
			}, ".day:not(.day_ns)");
			// we hide it immediatelly
			calendarContainer.css({
				"display" :	"none",
				"visibility" :	"visible"
			});
		};
		// function to display a calendar with a given month/year
		var DP_getCalendarHTML = function(m,y) {
			// on cree le header avec les mois/annee
			var html = "";
			html += '<div class="calendarHeaderMonths ns">'+(listMonths[m])+' '+(y)+'</div>';
			html += '<div class="calendarHeaderDays">';
			for(i = 0; i < 7; i++) {
				html+='<div class="ns">'+(listDays[i].substring(0, 3))+"</div>";
			}
			html+='</div>';
			html+= '<div class="calendarCells">';
			// on calcule le nombre de jours dans ce mois
			var nbr_jrs_mois = new Date(y, m+1, 0).getDate();
			// on regarde le jour du 1er du mois
			var premier_jour = new Date(y, m, 1);
			premier_jour = (premier_jour.getDay()+6)%7 ;
			for(i = 0; i < premier_jour; i++) {
				html+='<div class="calendarCell ns not_this_month"></div>';
			}
			var today = new Date();today.setHours(0, 0, 0, 0);
			var dateCalendarFirst = DP_convertToDate(params.dateCalendarFirst);
			var dateCalendarLast = DP_convertToDate(params.dateCalendarLast);
			for(i = 1; i <= nbr_jrs_mois; i++) {
				var currentDate = new Date(y,m,i);
				// on regarde si la date est aujourd'hui
				var addon_css = "";
				if(today.getTime() == currentDate.getTime()){
					addon_css += " today";
				}
				// on regarde si la date n'est pas avant la date autorisee
				if(	(	dateCalendarFirst!=null &&	dateCalendarFirst.getTime() > currentDate.getTime()	)||
					(	dateCalendarLast!=null &&	dateCalendarLast.getTime() < currentDate.getTime()	)){
					addon_css += " day_ns";
				}
				html+='<div class="calendarCell ns day'+addon_css+'" title="'+DP_convertToReadingDate(currentDate.getTime())+'" data-id="'+currentDate.getTime()+'">'+i+'</div>';
			}
			// et on ajoute les cell qui manquent
			for(i = 0; i < (7-(nbr_jrs_mois+premier_jour)%7); i++) {
				html+='<div class="calendarCell ns not_this_month"></div>';
			}
			html+= '</div>';
			return html;
		};
		// function that displays the preview / next month, and give a smooth slide
		var DP_showMore = function(who){
			if(!animationInProgress){	// if an animation is already in progress, we wait
				animationInProgress = true;	// we lock the prev/next butons
				// we set a reference one the calendar closest from the one we will insert (work with 1 or 2 calendars)
				if(who=="prev"){
					var c = calendarGlobalContainer.find('.calendar').first();
				}else{
					var c = calendarGlobalContainer.find('.calendar').last();
				}
				// we extract the current month-year to calcul the new one
				var m = c.attr("data-month");
				var y = c.attr("data-year");
				// we will need to adapt the globalContainer's height with the new calendars
				var finalHeight = c.height();
				// we calcul the new wanted date
				if(who=="prev"){
					var newMonth = new Date(y,m,1); newMonth.setMonth((newMonth).getMonth()-1);
				}else{
					var newMonth = new Date(y,m,1); newMonth.setMonth((newMonth).getMonth()+1);
				}
				m = newMonth.getMonth();
				y = newMonth.getFullYear();
				// and we calcul the absolute position then html content
				var newPosition = 0;
				if(who=="prev"){
					if(params.multiDays){
						newPosition = -calendarGlobalContainer.find('.calendar').last().position().left;
					}else{
						newPosition = -calendarContainer.width();
					}
				}else{
					if(params.multiDays){
						var margin_padding_calendar = parseInt(calendarGlobalContainer.find('.calendar').last().css('paddingLeft'), 10) + parseInt(calendarGlobalContainer.find('.calendar').last().css('marginLeft'), 10) + parseInt(calendarGlobalContainer.find('.calendar').last().css('paddingRight'), 10) + parseInt(calendarGlobalContainer.find('.calendar').last().css('marginRight'), 10);
						newPosition = calendarContainer.width() + calendarGlobalContainer.find('.calendar').last().position().left - calendarGlobalContainer.find('.calendar').first().width() - margin_padding_calendar;
					}else{
						newPosition = calendarContainer.width();
					}
				}
				// we insert the new calendar, in the correct HTML place
				if(who=="prev"){
					calendarContainer.prepend('<div class="calendar" data-month="'+m+'" data-year="'+y+'"></div>');
				}else{
					calendarContainer.append('<div class="calendar" data-month="'+m+'" data-year="'+y+'"></div>');
				}
				var newCalendar = $('.calendar[data-month="'+m+'"][data-year="'+y+'"]');
				newCalendar.css({
					"left" : newPosition+'px'
				}).append(DP_getCalendarHTML(m,y));
				// check if some cells must be selected
				DP_checkDaysSelected();
				// we calcul the wished height of the global container
				if(params.multiDays){
					finalHeight = Math.max(finalHeight,newCalendar.height());
				}else{
					finalHeight = newCalendar.height();
				}
				// animations
				$(".calendar").each(function(index){
					if(who=="prev"){
						$(this).animate({
							left:($(this).position().left - newPosition)+"px"
						},speedAnimation, function() {
							// responsive compatible
							if(index === 1) {	// on second element = right calendar
								$(this).css({
									"left":'',
									"right":0
								});
							}
						});
					}else{
						$(this).animate({
							left:($(this).position().left - calendarGlobalContainer.find('.calendar').eq(1).position().left)+"px"
						},speedAnimation, function() {
							// responsive compatible
							if(index === ($(".calendar").length - 1)) {	// on last element = right calendar
								$(this).css({
									"left":'',
									"right":0
								});
							}
						});
					}
				});
				finalHeight += calendarFooter.height();
				calendarContainer.animate({
					height:finalHeight+"px"
				},speedAnimation,function(){
					if(who=="prev"){
						calendarGlobalContainer.find('.calendar').last().remove();
						animationInProgress = false;
					}else{
						calendarGlobalContainer.find('.calendar').first().remove();
						animationInProgress = false;
					}
					// check if arrows has to be toggled
					DP_checkArrows();
				});
			}
		};
		// function to check if arrows has to be displayed/removed
		var DP_checkArrows = function(){
			// left = prev arrow
			var dateCalendarFirst = DP_convertToDate(params.dateCalendarFirst);
			if(dateCalendarFirst!=null){
				// we check the first date of the left calendar
				var c = calendarGlobalContainer.find('.calendar').first();
				// we extract the current month-year
				var m = parseInt(c.attr("data-month"),10);
				var y = c.attr("data-year");
				var minDate = new Date(y,m,1);
				if(minDate.getTime() > dateCalendarFirst.getTime()){
					calendarGlobalContainer.find(".calendarHeaderPrev").show();
				}else{
					calendarGlobalContainer.find(".calendarHeaderPrev").hide();
				}
			}
			// right = next arrow
			var dateCalendarLast = DP_convertToDate(params.dateCalendarLast);
			if(dateCalendarLast!=null){
				// we check the last date of the right calendar
				var c = calendarGlobalContainer.find('.calendar').last();
				// we extract the current month-year
				var m = parseInt(c.attr("data-month"),10);
				var y = c.attr("data-year");
				var maxDate = new Date(y,m+1,0);
				if(maxDate.getTime() < dateCalendarLast.getTime()){
					calendarGlobalContainer.find(".calendarHeaderNext").show();
				}else{
					calendarGlobalContainer.find(".calendarHeaderNext").hide();
				}
			}
		};
		// function that returns a timestamp to a human-readable date
		var DP_convertToReadingDate = function(timestamp){
			var d = new Date(timestamp);
			if(d instanceof Date){
				return listDays[(d.getDay()+6)%7]+" "+d.getDate()+" "+listMonths[d.getMonth()]+" "+d.getFullYear();
			}else{
				return '';
			}
		};
		// function that convert a date into a string dd/mm/yyyy
		var DP_convertToFormatedDate = function(d){
			if(d instanceof Date){
				return d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear();
			}else{
				return '';
			}
		};
		// function that convert a string dd/mm/yyyy into a date object
		var DP_convertToDate = function(string){
			// string must be dd/mm/yyyy
			if(typeof string == "undefined" || string == null || string.length == null){
				return null;
			}else if(string instanceof Date){
				// already a date object, no needed process
				return string;
			}else{
				var d,m,y;
				// while reading the regex, different separators types can be applied.
				var separatoRegex = DP_arraySeparators();
				var reg = string.match(new RegExp('^([0-9]*)'+separatoRegex+'([0-9]*)'+separatoRegex+'([0-9]*)$'));
				if(reg){
					// clean return of values
					d = reg[1];
					m = (reg[2]-1);
					y = reg[3];
					if(y.length == 2){
						var actualYear = (new Date).getFullYear().toString().substr(-2);
						if(actualYear>=y){
							y = '20'+y;
						}else{
							y = '19'+y;
						}
					}
					return new Date(y,m,d);
				}else{
					
				}
			}
			return null;
		};
		// function that calcul the number of selected days
		var DP_howManyDays = function(){
			var howMany = 0;
			// a day is no exactly 24*60*60*1000ms ....
			var millisecondsPerDay = 24 * 60 * 60 * 1000;
			function treatAsUTC(date) {
				var result = new Date(date);
				result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
				return result;
			}
			if(params.multiDays){
				if(params.date_start!=null	&& params.date_start.length!=0	&& params.date_start instanceof Date &&
				   params.date_end!=null	&& params.date_end.length!=0	&& params.date_end instanceof Date){
					howMany += 1+(treatAsUTC(params.date_end) - treatAsUTC(params.date_start)) / millisecondsPerDay;
				}
			}else{
				if(	params.date_start!=null	&& params.date_start.length!=0	&& params.date_start instanceof Date){
					howMany += 1;
				}
			}
			return howMany;
		};
		// fonction qui retourne un array des separateurs possibles, pour etre utilise dans les regex
		var DP_arraySeparators = function(){
			var separatoRegex = '[';
			if(typeof separatoRegex != "undefined" && separatoRegex != null && separatoRegex.length != null && separatoRegex.length > 0){
				RegExp.escape = function(string) {
					return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
				};
				$.each(listeSeparatorsID, function( index, value ) {
					separatoRegex = separatoRegex + RegExp.escape(value[0]);
				});
				
			}else{
				separator[0][0] = "/";
				separatoRegex += '\\'+separator[0][0];	// si pas de separateur, on force celui la.
			}
			separatoRegex+="]";
			return separatoRegex;
		};
		// function that handle the click on a date
		var DP_selectDay = function(timestamp){
			var dateClicked = new Date(parseInt(timestamp,10));
			if(dateClicked instanceof Date){
				// we need to know which date is concerned : first / last ?
				if(focusOnDateStart){
					// when we click on a FirstDate, the End Date (if existing) is deleted
					calendarGlobalContainer.find(".inputDateStart").val(DP_convertToReadingDate(dateClicked)).attr('data-value', DP_convertToFormatedDate(dateClicked));
					calendarGlobalContainer.find(".inputDateEnd").val("").focus().select().attr('data-value', "");
					params.date_start = dateClicked;
					params.date_end = null;
					calendarGlobalContainer.find(".day_selection_hover").removeClass("day_selection_hover");
					if(params.multiDays){
						calendarGlobalContainer.find(".calendarFooterText").html("");
					}else{
						// DP_closeCalendar();
					}
				}else{
					// if there are a second date - 
					if(params.date_start==null || params.date_start.length==0 || params.date_start.getTime() > timestamp){
						// if we click before (or params.date_start wrong), we reset the first day, else we have our last day
						calendarGlobalContainer.find(".inputDateStart").focus().select();
						DP_selectDay(timestamp);
					}else{
						if(params.multiDays){
							if(params.date_end==null || params.date_end.length==0){
								// we rightly set the second date. If the END date is before the START sate, we switch 'em
								calendarGlobalContainer.find(".inputDateEnd").val(DP_convertToReadingDate(dateClicked)).attr('data-value', DP_convertToFormatedDate(dateClicked));
								params.date_end = dateClicked;
								calendarGlobalContainer.find(".calendarFooterText").html(howManyDays+' '+DP_howManyDays());
								// DP_closeCalendar();
							}else{
								// if we already have a End Date, we reset all the process
								calendarGlobalContainer.find(".inputDateStart").focus().select();
								DP_selectDay(timestamp);
							}
						}
					}
				}
				// check if some cells must be selected
				DP_checkDaysSelected();
			}else{
			}
			DP_overrideInput();
		};
		// function that override the original input (in case of webmaster needs)
		var DP_overrideInput = function(){
			if(params.multiDays){
				if(params.date_start!=null && params.date_start.length!=0 && params.date_start instanceof Date &&
				   params.date_end!=null && params.date_end.length!=0 && params.date_end instanceof Date){
					$("."+iname).val(DP_convertToFormatedDate(params.date_start)+" - "+DP_convertToFormatedDate(params.date_end));
				}else{
					$("."+iname).val(DP_convertToFormatedDate(""));
				}
			}else{
				if(params.date_start!=null && params.date_start.length!=0 && params.date_start instanceof Date){
					$("."+iname).val(DP_convertToFormatedDate(params.date_start));
				}else{
					$("."+iname).val(DP_convertToFormatedDate(""));
				}
			}
		};
		// function that set the cells as choosen or not
		var DP_checkDaysSelected = function(){
			calendarContainer.find(".day_start").removeClass("day_start");
			calendarContainer.find(".day_end").removeClass("day_end");
			calendarContainer.find(".day_between").removeClass("day_between");
			if(params.date_start instanceof Date && params.date_start!=null){
				// do we have the START ?
				var date_startTimestamp = params.date_start.getTime();
				var cellStart = calendarContainer.find('.day[data-id="'+date_startTimestamp+'"]');
				if(cellStart.length!=0){
					cellStart.addClass("day_start");
				}
				if(params.multiDays){
					// do we have the END ?
					if(params.date_end instanceof Date && params.date_end!=null){
						date_endTimestamp = params.date_end.getTime();
						var cellEnd = calendarContainer.find('.day[data-id="'+date_endTimestamp+'"]');
						if(cellEnd.length!=0){
							cellEnd.addClass("day_end");
						}
						// do we have a BETWEEN ?
						$("#"+iname+"_globalContainer .day").each(function(i,d){
							if($(d).attr("data-id") > date_startTimestamp && $(d).attr("data-id") < date_endTimestamp){
								$(d).addClass("day_between");
							}
						});
					}
				}
			}
		};
		// function that open/show a calendar
		var DP_openCalendar = function(){
			if(isCalendarHidden){
				isCalendarHidden = false;
				calendarContainer.slideDown(speedAnimation/2);
			}
		};
		// function that close a calendar
		var DP_closeCalendar = function(){
			if(!isCalendarHidden){
				calendarContainer.slideUp((speedAnimation/2), function(){
					isCalendarHidden = true;
				});
			}
		};
		// function that clear the calendar
		var DP_clearCalendar = function(){
			calendarContainer.find(".day_start").removeClass("day_start");
			calendarContainer.find(".day_end").removeClass("day_end");
			calendarContainer.find(".day_between").removeClass("day_between");
			params.date_start = null;
			params.date_end = null;
			calendarGlobalContainer.find('.inputDateStart').val("");
			if(params.multiDays){
				calendarGlobalContainer.find('.inputDateEnd').val("");
			}
		};



		// ================= PUBLIC FUNCTIONS =================

		// fonction called from the DOM to open the calendar
		inDatePicker.show = function() {
			calendarGlobalContainer.find(".inputDateStart").focus().select();
		};
		// fonction called from the DOM to hide the calendar
		inDatePicker.hide = function() {
			DP_closeCalendar();
		};
		// fonction called from the DOM to get the first date
		inDatePicker.getFirstDay = function(isReadable) {
			var ret;
			if(isReadable){
				// return date type "Monday 1st, ..."
				ret = calendarGlobalContainer.find(".inputDateStart").val();
			}else{
				// return dd/mm/yyy
				ret = calendarGlobalContainer.find(".inputDateStart").data("value");
			}
			if(typeof ret == "undefined" || ret == null){
				ret = '';
			}
			return ret;
		};
		// fonction called from the DOM to get the last date
		inDatePicker.getLastDay = function(isReadable) {
			var ret;
			if(isReadable){
				// return date type "Monday 1st, ..."
				if(params.multiDays){
					ret = calendarGlobalContainer.find(".inputDateEnd").val();
				}else{
					ret = calendarGlobalContainer.find(".inputDateStart").val();
				}
			}else{
				// return dd/mm/yyy
				if(params.multiDays){
					ret = calendarGlobalContainer.find(".inputDateEnd").data("value");
				}else{
					ret = calendarGlobalContainer.find(".inputDateStart").data("value");
				}
			}
			if(typeof ret == "undefined" || ret == null){
				ret = '';
			}
			return ret;
		};
		// fonction called from the DOM to get the number of selected days
		inDatePicker.getNumberDays = function() {
			return DP_howManyDays();
		};

		return DP_intialize();
	}
}( jQuery ));


 // ]]>
