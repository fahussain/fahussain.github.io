var app = angular.module('app',[]);
app.directive('compareTo', [ function() {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function(scope, element, attributes, ngModel) {
            ngModel.$validators.compareTo = function(modelValue) {
                return modelValue == scope.otherModelValue;
            };
 
            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
}]);
app.directive('validPwd', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        var containsLetter = /[a-z]/i.test(viewValue),
            containsDigit = /\d/.test(viewValue),
            hasCorrectLength = viewValue.length > 7;

        ctrl.$setValidity('letter', containsLetter);
        ctrl.$setValidity('number', containsDigit);
        ctrl.$setValidity('length', hasCorrectLength);
        if (containsLetter && containsDigit && hasCorrectLength) {
          return viewValue;
        } 
        else {
          return undefined;
        }
      });
    }
  };
});
app.controller('ChangePwdController', ['$scope', function($scope){
    var form = document.getElementById('change-password');
    form.addEventListener(
        'submit',
        function(e) {
            //$scope.changePassword.$submitted = true;
            //$scope.$apply();
            //!$scope.changePassword.$valid && e.preventDefault();
        },
        false
    );
    $scope.submit = function(){
        if ($scope.changePassword.$valid){
	    	document.getElementById('changePassword:theForm:psw').value = $scope.password;
     		document.getElementById('changePassword:theForm:vpsw').value = $scope.confirmPwd;
       		document.getElementById('changePassword:theForm').submit();
        }
    }
}]);
