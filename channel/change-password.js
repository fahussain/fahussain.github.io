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
app.controller('ChangePasswordController', ['$scope', function($scope){
   $scope.submit = function(){
       if ($scope.formChangePassword.$valid){
            document.querySelector('.sf-input-new-password').value = $scope.password;
            document.querySelector('.sf-input-confirm-password').value = $scope.confirmPassword;
            invokeActionFunction();
        }
    };
    
}]);
app.controller('LoginController', ['$scope', function($scope){
    $scope.submit = function(){
        if ($scope.formLogin.$valid){
            document.getElementById('changePassword:theForm:psw').value = $scope.password;
            document.getElementById('changePassword:theForm:vpsw').value = $scope.confirmPwd;
            invokeActionFunction();
        }
    };
    
}]);
app.controller('ResetPasswordController', ['$scope','$document', function($scope, $document){
    $scope.submit = function(){ 
        if ($scope.formResetPassword.$valid){
            document.querySelector('.sf-input-username').value = $scope.username;
            document.querySelector('.sf-input-password').value = $scope.password;
            invokeActionFunction();
        }
    };
    
}]);
