var app = angular.module('app', ['ngTouch', 'ui.grid', 'ui.grid.pagination']);

app.controller('MainCtrl', ['$scope', '$http', '$filter', function ($scope, $http, $filter) {
  $scope.gridOptions1 = {
    paginationPageSizes: [25, 50, 75],
    paginationPageSize: 25,
    columnDefs: [
      { name: 'name' },
      { name: 'gender' },
      { name: 'company' }
    ]
  };

  $scope.gridOptions2 = {
    enablePaginationControls: false,
    paginationPageSize: 25,
    columnDefs: [
      { name: 'name' },
      { name: 'gender' },
      { name: 'company' }
    ]
  };

  $scope.gridOptions2.onRegisterApi = function (gridApi) {
    $scope.gridApi2 = gridApi;
  }

  $http.get('https://cdn.rawgit.com/angular-ui/ui-grid.info/gh-pages/data/100.json')
  .success(function (data) {
    $scope.Data = data;
    //$scope.gridOptions1.data = data;
    $scope.gridOptions2.data = data;
  });
  
  //$scope.search;
  //$scope.gridOptions2 = {};
  $scope.gridOptions2.data = $scope.Data;
  //$scope.search = "Waters";

  $scope.refreshData = function (termObj) {
        $scope.gridOptions2.data = $scope.Data;

        while (termObj) {
            var oSearchArray = termObj.split(' ');
            $scope.gridOptions2.data = $filter('filter')($scope.gridOptions2.data, oSearchArray[0], undefined);
            oSearchArray.shift();
            termObj = (oSearchArray.length !== 0) ? oSearchArray.join(' ') : '';
        }
    };
}]);
