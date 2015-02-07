var user_management_system = angular.module(
    'user_management_system',
    ['ngRoute', 'capi']
);

user_management_system.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/login', {
            templateUrl: 'pages/login.html',
            controller: 'LoginCtrl'
        })
        .when('/profile', {
            templateUrl: 'pages/profile.html',
            controller: 'ProfileCtrl'
        })
        .otherwise({
            redirectTo: '/login'
        });
    }]
);

user_management_system.run(['$rootScope', '$location', 'capi.ums',
    function($rootScope, $location, ums) {
        $rootScope.$on('$routeChangeStart', function(event, next) {
            console.log(event);
            if (next.controller != 'LoginCtrl' && !ums.is_logged_in()) {
                console.log("DENIED");
                event.preventDefault();
                $rootScope.$evalAsync(function() {
                    $location.path('/login');
                });
            }
        });
    }]
);

user_management_system.controller('LoginCtrl', ['$scope', 'capi.ums', '$location',
    function($scope, ums, $location) {
        ums.update_current_user().then(function() {
            // Only works if logged in, but whatever
            if (ums.is_logged_in()) {
                $location.path('/profile');
            }
        });
        $scope.creds = {};
        $scope.login = function() {
            ums.login($scope.creds.username, $scope.creds.password).then(function(res) {
                $location.path('/profile');
            })
            .catch(function(e) {
                alert('authentication failed due to: ' + String(e.data.message || e.data));
            });
            return false;
        }
    }]
);

user_management_system.controller('ProfileCtrl', ['$scope', 'capi.ums', '$location',
    function($scope, ums, $location) {
        if (!ums.is_logged_in()) {
            $location.path('/login');
        }
    }]
);

user_management_system.controller('LoginStateCtrl', ['$scope', 'capi.ums', '$location',
    function ($scope, ums, $location) {
        $scope.ums = ums;
        $scope.logout = function() {
            ums.logout().then(function() {
                $location.path('/login');
            });
        }
    }]
);
