var user_management_system = angular.module('user_management_system', [
        'ngRoute']);

user_management_system.config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.
                when('/login', {
                    templateUrl: 'pages/login.html',
                    controller: 'LogicCtrl'
                }).
            otherwise({
                redirectTo: '/login'
            });
        }]);

user_management_system.controller('LogicCtrl',
        function($scope) {
            $scope.creds = {};
            $scope.login = function() {
                alert(JSON.stringify($scope.creds));
            }
        });
