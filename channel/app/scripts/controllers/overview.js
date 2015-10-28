
var app = angular.module('ssi.channel', ['ngRoute', 'ngSanitize', 'ui.select']);
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
