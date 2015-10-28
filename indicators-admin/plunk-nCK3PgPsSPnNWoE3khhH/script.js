// Code goes here
var app = angular.module("app", ['ui.bootstrap','ngAnimate','ngSanitize', 'ui.select', 'ngDraggable']);
app.controller("IndicatorGroupsController", ['$scope','$http', function($scope, $http) {
    $scope.groups = []; 
    $scope.indicatorOptions = [];
    $scope.selected = {};
    $scope.datePickerStatus = {
        "successFrom":false,
        "successTo":false,
        "meetFrom":false,
        "meetTo": false,
        "failFrom":false,
        "failTo":false
    };
   $http.get('data.json').
        success(function(data, status, headers, config) {
           angular.extend($scope, data);
        }).
        error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    $scope.addIndicator = function(group) {
        group.collapsed = false;
        var indicator = {
            "editing": true,
            "id": "12",
            "name": "Satisfaction",
            "dataType": "Date",
            "goalCriteria": {
                "meetFrom": 12,
                "meetTo": 20,
                "successFrom": 12,
                "successTo": 50,
                "failFrom": 0,
                "failTo": 10
            }
        }; 
        group.indicators.push(indicator);
    };
    $scope.addGroup = function() {
        var group = {
            "name": "Group1",
            "collapsed": false,
            "indicators": []
        };
        $scope.groups.push(group);
    };
    $scope.removeGroup = function(group) {
        var index = $scope.groups.indexOf(group);
        $scope.groups.splice(index, 1);
    };
    $scope.removeIndicator = function(indicator, group) {
        var index = group.indicators.indexOf(indicator);
        group.indicators.splice(index, 1);
    };
   
    $scope.onDropComplete = function(data, event, targetGroup, targetIndex) {
        if (!data) return;
        var sourceGroup = data.group, indicator = data.indicator;
        sourceGroup.indicators.splice(sourceGroup.indicators.indexOf(indicator), 1);
        targetGroup.indicators.splice(targetIndex, 0, indicator);
    };
    $scope.editRow = function(indicator, group){
       // hide all other editing icons except this row
       $scope.doneEditing();
        indicator.editing = true;
    };
    $scope.doneEditing = function(){
        angular.forEach($scope.groups, function(group){
            angular.forEach(group.indicators, function(indicator){
                indicator.editing = false;
            });
        });
    };
    $scope.openDatePicker = function($event, which){
       $scope.datePickerStatus[which] = true; 
    };
    $scope.onIndicatorSelect = function($item, $model, indicator){
        indicator.dataType = $item.dataType;
    };
    $scope.onIndicatorBlur = function(indicator){
        if(indicator.editing) indicator.editing = false;
    };
    $scope.saveRow = function(indicator, group){
        indicator.editing = false;
    }
}]);

app.directive('indicatorDisplayRow', function() {
  return {
    templateUrl: 'indicator-display-row.html'
  };
});
app.directive('indicatorEditorRow', function() {
  return {
    templateUrl: 'indicator-editor-row.html'
  };
});