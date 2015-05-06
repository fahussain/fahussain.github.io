	var d = document,
		randomText = ['Lorem ipsum','dolor sit amet','consectetur adipiscing','sed do eiusmod','tempor incididunt','ut labore et dolore'],
		icons = ['srevicon-phone-md','srevicon-folder-md','srevicon-envelope-md','srevicon-crown-md', 'srevicon-check-sm'],
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
var onRangeChanged = function(props){
	var currentEventTime = (new Date()).getMilliseconds(),
		eventInterval = currentEventTime - lastEventTime,
		currentEventAction = setTimeout(function(props){
			_printProps(props);
		}, 500);
	console.log(eventInterval); 
	if (eventInterval < 500){
		clearTimeout(lastEventAction);
		lastEventTime = currentEventTime;
		lastEventAction = currentEventAction;
	}
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
	timeline = new vis.Timeline(container, generateData(startDate, endDate, totalPhases, tasks), options);
	//timeline = new vis.Timeline(container, items4, options);

	// add event listener
	timeline.on('select', onItemSelect);
	timeline.on('rangechanged', onRangeChanged);
	timeline.on('click', onTimelineClick);
	zoom(startDate, endDate, true);
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
		//phaseMonths = (endDate.getTime() - startDate.getMonth()
	// generate phases
	for (;phaseCount < maxPhases ; phaseCount++){
		phase = {type:'range', start: startDate, className:'phase' + phaseCount, 
			content: "Phase "+phaseCount,phase: phaseCount, text: randomText[Math.floor(Math.random()*6)]}; 
		phase.end = new Date(Math.floor(startDate.getTime() + phaseMilliseconds));
		phases.push(phase);
		data.push(phase);
		startDate = phase.end;
		// generate tasks for each phase
		var maxTasksPerPhase = Math.floor(maxTasks / maxPhases);
		taskCount = 0;
		for ( ; taskCount < maxTasksPerPhase ; taskCount++ ){
			task = { type:'box', start: randomDate(phase.start,phase.end), 
					className:'phase'+phaseCount+(Math.random() < 0.5 ? '' : '-complete'),
					phase: phaseCount, text: randomText[Math.floor(Math.random()*6)]};
			task.content = generateItemContent(task);
			data.push(task);
		}
	}
	return data; 
}; 

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
  $('<div class="item-tooltip"><div class="line1">'+content.start+'</div><div class="line2">'+content.text+'</div></div>')
        .appendTo(element);
  //changeTooltipPosition(element);
};

var hideTooltip = function() {
   $('div.item-tooltip').remove();
};

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
        columnDefs: [{field:'actions', displayName:'', cellTemplate:'<li style="list-style:none;"><i class="icon-phone"></i><i class="icon-remove"></i><i class="icon-ok"></i></li>'}, 
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