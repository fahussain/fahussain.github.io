var app = angular.module('ssi.channel', ['ngRoute', 'ngSanitize', 'ui.select']);


app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/accounts', {
            templateUrl: 'templates/accounts.html',
            controller: 'TasksController'
        }).
        when('/overview', {
            templateUrl: 'templates/overview.html',
            controller: 'OverviewController'
        }).
        when('/opportunities', {
            templateUrl: 'templates/opportunities.html',
            controller: 'AccountPlansController'
        }).
        otherwise({
            redirectTo: '/overview'
        });
    }
]);
app.factory('sfhttp', ['$q', '$rootScope', function($q, $rootScope) {

    return function(inputString, remoteActionName) {
        var deferred = $q.defer();
        Visualforce.remoting.Manager.invokeAction(
            '{!$RemoteAction.'+remoteActionName+'}',
            inputString,
            function(result, event) {
                $rootScope.$apply(function() {
                    if (event.status) {
                        deferred.resolve(result);
                    } else {
                        deferred.reject(event);
                    }
                })
            }, {
                buffer: true,
                escape: true,
                timeout: 30000
            }
        );
        return deferred.promise;
    }

}]);
app.filter('propsFilter', function() {
    return function(items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function(item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
});
app.controller('MasterController', ['$scope', '$element', '$timeout',
    function($scope, $element, $timeout) {
        var selected = null;
        $scope.overview = function() {
            underline('#overview');
        };
        $scope.accounts = function() {
            underline('#accounts');
        };
        $scope.opportunities = function() {
            underline('#opportunities');
        };
        $scope.requests = function() {
            underline('#opportunities');
        };
        $scope.aboutMe = function() {
            underline('#opportunities');
        };
        var underline = function(item) {
            var ele = angular.element($element[0].querySelector('a[href="' + item + '"]'));
            var selected = angular.element($element[0].querySelector('.nav-item.selected'));
            selected && selected.removeClass('selected');
            ele && ele.parent().addClass('selected');
        };

    }
]);
app.controller('TasksController', function($scope) {

});


app.controller('OverviewController', ['$scope', '$http', function($scope, $http) {
    $scope.pageData = {}
    $scope.pageData.countries = [];

    var chartOptions = {
        chart: {
            type: 'column',
            marginBottom: 80,
        },
        title: {
            text: ''
        },
        credits: {
            enabled: false
        },
        colors: ['#FA9241', '#40ADD1'],
        xAxis: {
            categories: ['Unquoted', 'Quoted', 'Confirmed', 'Closed', 'No Service'],
            tickWidth: 0
        },
        yAxis: {
            gridLineWidth: 0,
            min: 0,
            title: {
                text: ''
            },
            stackLabels: {
                enabled: false,
                style: {
                    fontWeight: 'bold',
                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                }
            }
        },
        legend: {
            align: 'right',
            x: -200,
            verticalAlign: 'bottom',
            y: 25,
            floating: true,
            backgroundColor: 'white',
            borderColor: '#CCC',
            borderWidth: 0,
            shadow: false,
            layout: 'vertical',
            itemStyle: {
                fontWeight: 'normal'
            },
            itemMarginBottom: 10
        },
        tooltip: {
            formatter: function() {
                return '<b>' + this.x + '</b><br/>' +
                    this.series.name + ': ' + this.y + '<br/>' +
                    'Total: ' + this.point.stackTotal;
            }
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: false,
                    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                    style: {
                        textShadow: '0 0 3px black'
                    }
                }
            }
        }
    };
    $http.get('data/overview-initial.json')
        .success(function(data) {
            $scope.pageData = data;
            $scope.refreshChart();
        });
    var drawChart = function(chartData) {
        var chart = $('#chart-container').highcharts();
        if (chart) chart.destroy();
        $('#chart-container').highcharts(chartData);
    };
    $scope.refreshChart = function() {
        // get selected values and send them as a query
        $http.get('data/chart-opps.json', $scope.selected).
        success(function(data, status, headers, config) {
            chartOptions.series = data;
            drawChart(chartOptions);
        }).
        error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

    };

}]);

app.controller('AccountPlansController', function($scope) {

    $scope.message = 'This is Show orders screen';

});