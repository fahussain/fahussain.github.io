	var d = document,
		dataById = [],
		randomText = ['Lorem ipsum','dolor sit amet','consectetur adipiscing','sed do eiusmod','tempor incididunt','ut labore et dolore'],
		icons = ['srevicon-phone-md','srevicon-folder-md','srevicon-email-md','srevicon-coins-md', 'srevicon-check-sm'],
		subjects = ['Customer Adoption Task','Customer Reminder Task','Review Quote', 'Verify Offer value', 'Email Quote'],
		status = ['complete','uncomplete'],
		assignedTo = ['Omer Candy','Latia Davalos','Dania Stelling','Sophia Colman','Lana Caviness','Bertie Cunha'],
		play = [],
		phases = [], timeline = null, queue = [],lastEventTime = (new Date()).getMilliseconds(), lastEventAction = null,
		options = {
	  	onMoving: function (item, callback) {
	  		// Editing not allowed if task is complete
		    if (item.className.indexOf("complete") > -1) {
		        callback(null);
		    } /*else if(item.type && item.type === 'range'){
		    	// Do not let the phases overlap
		    	// item is the current phase
		    	// get the next phase and the start date of next phase

		    	var nextPhaseStartMilliseconds = (phases[item.phase+1])? phases[item.phase+1].start.getTime() : Infinity;
		    	var previousPhaseEndMilliseconds = (phases[item.phase-1]) ? phases[item.phase-1].end.getTime() : 0;
		    	console.log( "end:"+item.end.getTime()+"  nextstart:"+nextPhaseStartMilliseconds);
		    	if (item.end.getTime() >= nextPhaseStartMilliseconds
		    		|| item.start.getTime() <= previousPhaseEndMilliseconds){
		    		callback(null);
		    	}else {
		    		callback(item);
		    	}

		    } */else{
		    	// change the className 
		    	/*
		    	if (item.start.getTime() >= phases[item.phase+1].start.getTime()){
		    		item.className = 'phase'+item.phase+1;
		    		item.phase = item.phase+1;
		    	}else if (item.start.getTime() <= phases[item.phase-1].end.getTime()){
		    		item.className = 'phase'+item.phase-1;
		    		item.phase = item.phase - 1;
		    	}*/
		        callback(item); // do something with the changed item data
		    }
		},
		dataAttributes: ['id'],
	    editable: true,
	    margin: {
	    	showCurrentTime: true,
	      item: 5,
	      axis: 10
	    },
	    editable: {
		    add: false,         // add new items by double tapping
		    updateTime: true,  // drag items horizontally
		    updateGroup: false, // drag items from one group to another
		    remove: false       // delete an item by tapping the delete button top right
	  	}
	  };

// note that months are zero-based in the JavaScript Date object
var items = new vis.DataSet([
				{ start: new Date(2010,7,23), className: 'phase1-complete', selectable:false, content: '<span class="icon-folder-md inner-icon" ></span>'},
				{type:'range', start: new Date(2010,7,15), end: new Date(2010,7,27), className: 'phase1', content: 'Phase 1'},
				{start: new Date(2010,7,23,23,0,0), className: 'phase1-complete',content: '<span class="icon-phone-md inner-icon" ></span>'},
				{start: new Date(2010,7,24,16,0,0), className: 'phase1',content: '<span class="icon-phone-md inner-icon" ></span>'},
				{ start: new Date(2010,7,28), className: 'phase2-complete', content: '<span class="icon-phone-md inner-icon" ></span>'},
				{ start: new Date(2010,7,29),className: 'phase2-complete', content: '<span class="icon-folder-md inner-icon" ></span>'},
				{ start: new Date(2010,7,30),className: 'phase2-complete', content: '<span class="icon-envelope-md inner-icon" ></span>'},
				//{group:"A", start: new Date(2010,7,31),className: 'phase2-complete', content: '<span class="icon-crown-md inner-icon" ></span>'},
				{type:'range', start: new Date(2010,7,28), end: new Date(2010,8,15), className: 'phase2', content: 'Phase 2'},
				{ start: new Date(2010,8,4,12,0,0), className: 'phase2', content: '<span class="icon-folder-md inner-icon" ></span>'}
			]);
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
var debounce = function (func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};
var getItemById = function(id){
	return timeline.itemSet.items[id];
};
var onItemSelect = function(props){
	var item = getItemById(props.items[0]);
	item && item.data.type !== 'range' && showTooltip(item.dom.box,item.data);
};
var onTimelineClick = function(props){
	if (props.what !== 'item'){
		hideTooltip();
	}
};
var onTimelineMouseover = function(props){
	console.log("hover");
};
var onRangeChanged = function(props){
	console.log("range changed");
	/*
	var currentEventTime = (new Date()).getMilliseconds(),
		eventInterval = currentEventTime - lastEventTime,
		currentEventAction = setTimeout(function(props){
			_printProps(props);
		}, 500);
	//console.log(eventInterval); 
	if (eventInterval < 500){
		clearTimeout(lastEventAction);
		lastEventTime = currentEventTime;
		lastEventAction = currentEventAction;
	}*/
};
var _printProps = function(props){
	console.log(props);
};
// Next page on clicking the right arrow
var onRightClick = function(){
	var range = timeline.range.getRange();
	zoom(new Date(range.end), new Date(range.end + (range.end - range.start)), true );
};
// Previous page on clicking the left arrow
var onLeftClick = function(){
	var range = timeline.range.getRange();
	zoom(new Date(range.start - (range.end - range.start)), new Date(range.start), true);
}
// Reset the the zoom window based on chosen start and end date
var setZoom = function(){
	var startDate = new Date(d.getElementById("fromDate").value);
	var endDate = new Date(d.getElementById("toDate").value);
	zoom(startDate, endDate, true);
}
var setData = function(){
	var startDate = new Date(d.getElementById("sDate").value),
		endDate = new Date(d.getElementById("eDate").value),
		totalPhases = Number(d.getElementById("phases").value),
		tasks = Number(d.getElementById("tasks").value),
		container = d.getElementById('timeline-container');
	options.min = new Date(d.getElementById("minDate").value);
	options.max = new Date(d.getElementById("maxDate").value);
	options.zoomMin = Number(d.getElementById("minInterval").value) * 1000 * 60 * 60 * 24;
	options.zoomMax = Number(d.getElementById("maxInterval").value) * 1000 * 60 * 60 * 24;
	if (timeline !== null){
		timeline.destroy();
	}
	var data = generateData(startDate, endDate, totalPhases, tasks);
	timeline = new vis.Timeline(container, data, options);
	//timeline = new vis.Timeline(container, items4, options);

	// add event listener
	//timeline.on('select', onItemSelect);
	// for range change multiple events are fired in close intervals
	// so debounce the events to fire only one event at each range change
	timeline.on('rangechanged', debounce( function(props){
		filterData(data,props.start,props.end);
	}, 150));
	//timeline.on('click', onTimelineClick);
	$( "div.group" ).on( "mouseenter", "div[class^='item box']", function( event ) {
	    showTooltip(this,dataById[$( this ).attr( "data-id")]);
	});
	$( "div.group" ).on( "mouseleave", "div[class^='item box']", function( event ) {
	    hideTooltip();
	});
	zoom(startDate, endDate, true);
	refreshData(data);
};
var generateData = function(startDate, endDate, totalPhases, tasks){
	var today = new Date(),
		startDate = startDate || new Date((new Date()).setMonth(today.getMonth()-1)),
		endDate = endDate || new Date((new Date()).setMonth(today.getMonth()+4)),
		maxTasks = tasks || 30, 
		task = null,
		phase = null,
		phaseCount = 0,
		maxPhases = totalPhases || 3,
		phaseMonths = 0,
		phaseStart = startDate,
		taskCount = 0, 
		data = [],
		phaseMilliseconds = (endDate.getTime() - startDate.getTime())/maxPhases;
	var addMore = function(obj){
		//{actions: "", duedate: '02-17-2014', subject:'Customer Adoption Task', status:'Not Started', assignedto:'Jon Smith',play:'Account Adoption', playdates:'02-15-2014'}
		obj.actions = "";
		obj.duedate = obj.start;
		obj.subject = subjects[Math.floor(Math.random()*subjects.length)];
		obj.assignedto = assignedTo[Math.floor(Math.random()*assignedTo.length)];
		obj.play = 'Account Adoption';
		obj.playdates = '02-15-2014';
	}
	// generate phases
	for (;phaseCount < maxPhases ; phaseCount++){
		phase = {type:'range', 
			start: startDate, 
			className:'phase' + phaseCount, 
			content: "Phase "+phaseCount,
			phase: phaseCount, 
			text: randomText[Math.floor(Math.random()*6)]}; 
		phase.end = new Date(Math.floor(startDate.getTime() + phaseMilliseconds));
		phase.id = phaseCount * 1000;
		addMore(phase);
		phases.push(phase);
		data.push(phase);
		dataById[phase.id] = phase;
		startDate = phase.end;
		// generate tasks for each phase
		var maxTasksPerPhase = Math.floor(maxTasks / maxPhases);
		taskCount = 0;
		for ( ; taskCount < maxTasksPerPhase ; taskCount++ ){
			task = { type:'box', 
				start: randomDate(phase.start,phase.end), 
				className:'phase'+phaseCount+(Math.random() < 0.5 ? '' : '-complete'),
				phase: phaseCount, 
				text: randomText[Math.floor(Math.random()*6)]};
			task.content = generateItemContent(task);
			task.id = (phaseCount * 1000)+ taskCount+1;
			addMore(task);
			data.push(task);
			dataById[task.id] = task;
		}
	}
	return data; 
}; 
var getUniqueNumber = function(){
	return (new Date()).getTime();
}
var generateItemContent = function(task){
	return '<span class="inner-icon '+icons[Math.floor(Math.random()*5)]+'"> </span>';
};

var randomDate = function(start,end){
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

var defaultZoom = function(){
	// default zoom is past month + three months
	zoom(new Date(2015,2,10), new Date(2015,7,10), true);
};

var zoom = function(startDate, endDate, animate){
	timeline.range.setRange(startDate, endDate, animate,true);
};

var changeTooltipPosition = function(element) {
	var position = $(element).offset();
	position.left += $(element).width()+1;
  $('div.item-tooltip').css(position);
};
	 
var showTooltip = function(element,content) {
  $('div.item-tooltip').remove();
  $('<div style="display:none;" class="item-tooltip"><div class="line1">'+content.start+'</div><div class="line2">'+content.text+'</div></div>')
        .appendTo(element);
  $('div.item-tooltip').fadeIn();
  //changeTooltipPosition(element);
};

var hideTooltip = function() {
	//$('div.item-tooltip').fadeOut(500,function(){$('div.item-tooltip').remove();});
   $('div.item-tooltip').remove();
};
var filterData = function(data,start,end){
	var arr = $.grep(data, function( item, index ) {
	  return ( item.start.getTime() >= start.getTime() &&
	  		item.start.getTime() <= end.getTime());
	});
	refreshData(arr);
}
var refreshData = function(data){
	var scope = angular.element('[ng-controller=GridCtrl]').scope();
	if( scope ){
		scope.$apply(function(){
		        scope.myData = data;
		});
	}
}
var visApp = angular.module('visApp',['ui.bootstrap','ngGrid']);
visApp.controller('TabsCtrl', function ($scope, $window) {
	$scope.alertMe = function() {
		setTimeout(function() {
		  $window.alert('You\'ve selected the alert tab!');
		});
	};
});
visApp.factory('taskFactory', function() {
    var tasks = [];
    var factory = {};
    var generateData = function() {

    };
    factory.getTasks = function() {
        if (tasks.length < 1){

        }
    };

    return factory;
});

visApp.controller('GridCtrl',['$scope', function($scope){
	$scope.myData = [{actions: "", duedate: '02-17-2014', subject:'Customer Adoption Task', status:'Not Started', assignedto:'Jon Smith',play:'Account Adoption', playdates:'02-15-2014'},
                     {actions: "", duedate: '02-17-2014', subject:'Customer Adoption Task', status:'Not Started', assignedto:'Jon Smith',play:'Account Adoption', playdates:'02-15-2014'},
                        {actions: "", duedate: '02-17-2014', subject:'Customer Adoption Task', status:'Not Started', assignedto:'Jon Smith',play:'Account Adoption', playdates:'02-15-2014'},
                        {actions: "", duedate: '02-17-2014', subject:'Customer Adoption Task', status:'Not Started', assignedto:'Jon Smith',play:'Account Adoption', playdates:'02-15-2014'},
                        {actions: "", duedate: '02-17-2014', subject:'Customer Adoption Task', status:'Not Started', assignedto:'Jon Smith',play:'Account Adoption', playdates:'02-15-2014'},
                        {actions: "", duedate: '02-17-2014', subject:'Customer Adoption Task', status:'Not Started', assignedto:'Jon Smith',play:'Account Adoption', playdates:'02-15-2014'},
                        {actions: "", duedate: '02-17-2014', subject:'Customer Adoption Task', status:'Not Started', assignedto:'Jon Smith',play:'Account Adoption', playdates:'02-15-2014'},];
    $scope.gridOptions = { 
    	rowHeight: 45,
        data: 'myData',
        plugins: [new ngGridFlexibleHeightPlugin()],
        columnDefs: [{field:'actions', displayName:'', cellTemplate:'<div class="ngCellText"><div class="outer-circle phase1-complete">	<span class="task-img srevicon-phone-md "> </span>	</div>	<span class="task-img srevicon-check-sm"> </span><span class="task-img srevicon-remove-sm"> </span></div>'}, 
                     {field:'duedate', displayName:'Due Date'},
                    {field:'subject', displayName:'Subject'},
                    {field:'status', displayName:'Status'},
                    {field:'assignedto', displayName:'Assigned to'},
                    {field:'play', displayName:'Play'},
                     {field:'playdates', displayName:'Play Enter/Exit Dates'},]}
}]);
visApp.controller('CollapseCtrl', function ($scope) {
	$scope.isCollapsed = true;
});
visApp.controller('TimelineController', ['$scope', function($scope) {
  $scope.hi = "Hello";
}])
.directive('timeline', function() {
  return {
    template: '<div>something something</div>'
  };
});