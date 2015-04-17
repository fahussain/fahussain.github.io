	var d = document,
		randomText = ['Lorem ipsum','dolor sit amet','consectetur adipiscing','sed do eiusmod','tempor incididunt','ut labore et dolore'],
		icons = ['icon-phone-md','icon-folder-md','icon-envelope-md','icon-crown-md', 'icon-check-sm'],
		phases = [], timeline = null,
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

var items4 = [
  {
    "type": "range",
    "stack": false,
    "start": "2015-02-10T00:00:00.000Z",
    "className": "phase0",
    "content": "Phase 0",
    "phase": 0,
    "text": "Lorem ipsum",
    "end": "2015-04-11T00:00:00.000Z",
    "id": "2deadedc-f729-a6ed-cbd5-172310b146"
  },
  {
    "type": "box",
    "start": "2015-02-11T06:18:57.603Z",
    "className": "phase0",
    "phase": 0,
    "text": "consectetur adipiscing",
    "content": "<span class=\"inner-icon icon-crown-md\"> </span>",
    "id": "50eb37bf-4455-a9dc-3754-ecd383e2b843"
  },
  {
    "type": "box",
    "start": "2015-03-22T14:47:21.802Z",
    "className": "phase0",
    "phase": 0,
    "text": "ut labore et dolore",
    "content": "<span class=\"inner-icon icon-check-sm\"> </span>",
    "id": "a312306d-c9b3-aa3c-c545-d07b6d1f96ad"
  },
  {
    "type": "range",
    "stack": false,
    "start": "2015-04-11T00:00:00.000Z",
    "className": "phase1",
    "content": "Phase 1",
    "phase": 1,
    "text": "Lorem ipsum",
    "end": "2015-06-10T00:00:00.000Z",
    "id": "2a5b3e8e-c0ab-9caf-6233-4f056d2a79c9"
  },
  {
    "type": "box",
    "start": "2015-05-07T07:00:12.762Z",
    "className": "phase1-complete",
    "phase": 1,
    "text": "sed do eiusmod",
    "content": "<span class=\"inner-icon icon-crown-md\"> </span>",
    "id": "6866e155-2d3e-a2a2-3a0e-f2c26b5458e1"
  },
  {
    "type": "box",
    "start": "2015-04-19T21:38:42.245Z",
    "className": "phase1",
    "phase": 1,
    "text": "Lorem ipsum",
    "content": "<span class=\"inner-icon icon-envelope-md\"> </span>",
    "id": "d435c539-8edf-9414-3fe6-819163e2dac1"
  }
];
var getItemById = function(id){
	return timeline.itemSet.items[id];
};
var onItemSelect = function(props){
	var item = getItemById(props.items[0]);
	showTooltip(item.dom.box,item.data);
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
		container = d.getElementById('visualization');
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
		phase = {type:'range', stack:false, start: startDate, className:'phase' + phaseCount, 
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
	console.log(data);
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
