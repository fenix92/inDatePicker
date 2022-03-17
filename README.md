# jQuery-datePicker

**jQuery** plugin that convert an input (type text) to reicive a DATE value **DD/MM/YYYY** (day/month/year) by creating a calendar. It can have a single date, or a start -> end date.

online-example : none

Please consider the following html :

    <input type="text" id="foo">

Note that the value is not used. To make the calendar working :

    <script type="text/javascript" src="script-inDatePicker.js"></script>
    <script type="text/javascript">
        var inputDatePicker = $("#foo").inDatePicker();
        // or (with all options)
        var inputDatePicker = $("#foo").inDatePicker({
            multiDays:true,
            dateCalendarFirst:'today',
            dateCalendarLast:'',
            date_start:'',
            date_end:'',
            placeholderFirstDate:'date de Location',
            placeholderEndDate:'date de retour de Location'
        });
    </script>

for a quick explaination,

    multiDays             : allow the calendar to have 2 dates to choose (start + end)
    dateCalendarFirst     : define the first selectable date if any. has to be dd/mm/yyyy format, or 'today'
    dateCalendarLast      : define the last selectable date if any. has to be dd/mm/yyyy format, or 'today'
    date_start            : set a selected first date. has to be dd/mm/yyyy format, or 'today'
    date_end              : set a selected last date. has to be dd/mm/yyyy format, or 'today'
    placeholderFirstDate  : placeholder of the first date
    placeholderEndDate    : placeholder of the last date

once the plugin is launched, at any moment you can access to this methods :

    inputDatePicker.show();                     : display the calendar
    inputDatePicker.hide();                     : slideUp the calendar
    inputDatePicker.getFirstDay(true);          : return the selected first day "Jeudi 15 Fevrier 2022"
    inputDatePicker.getFirstDay(false);         : return the selected first day "15/2/2022"
    inputDatePicker.getLastDay(true);           : return the selected last day "Jeudi 15 Fevrier 2022"
    inputDatePicker.getLastDay(false);          : return the selected last day "15/2/2022"
    inputDatePicker.getNumberDays();            : return the number of days in the selection
    inputDatePicker.setFirstDay("26/09/1985")	: set the fist day to a date. accept date "dd/mm/yyy", date object, timestamp, "today" or null (to reset). If you have multiDays activated, use the function twice to set the last day.
    inputDatePicker.setDayFirst("26/09/1985")	: set the fist possible date to be choosen (= dateCalendarFirst). accept date "dd/mm/yyy", date object, timestamp, "today" or null (to reset).
    inputDatePicker.setDayLast("26/09/1985")	: set the last possible date to be choosen (= dateCalendarLast). accept date "dd/mm/yyy", date object, timestamp, "today" or null (to reset).
    inputDatePicker.setPlaceholder("foo","bar")	: Change the placeholder of the input. The function accept one or two arguments


When you call the plugin on a input, you can personalise few values (above). The rest are considered as defaults values, that can be edited on the beginnig of the JS file (below):

	var	multiDays_default		= false;         // allow the calendar to select one single date, or more
	var	dateCalendarFirst_default	= null;    // first available date in the calendar, if null, no restriction
	var	dateCalendarLast_default	= null;    // last available date in the calendar, if null, no restriction
	var	listMonths = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
	var	listDays = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
	var	placeholderFirstDate_default = 'date de départ';
	var	placeholderEndDate_default = 'date de fin';
	var	closeButton = 'ok';		// text to close the calendar &#8593;
	var	howManyDays = 'nombre de jours sélectionnés :';		// text to intoduce the number of day
	var	date_start_default = null;		// first date selected, with format dd/mm/yyyy . If null, no date is pre-selected
	var	date_end_default = null;		// if multiDays_default is set to true ; last date selected, with format dd/mm/yyyy . If null, no date is pre-selected.
	var	speedAnimation = 400;		// animation speed

You cannot edit with the keyboard the values, everything has to be done with the mouse


### Ideas of upgrade :

 - make the values editable with keyboard
 - make the navigation possible with the mouse


Any comments or suggestions are welcome !
Cheers
