var user_management_system = angular.module(
    'user_management_system',
    ['ngRoute', 'capi']
);

user_management_system.config(['$routeProvider',
    function($routeProvider, ums) {
        $routeProvider.
        when('/login', {
            templateUrl: 'pages/login.html',
            controller: 'LoginCtrl',
            resolve: {
                is_logged_in: ['capi.ums', function(ums) {
                    return ums.update_current_user().then(function () {
                        return ums.is_logged_in();
                    });
                }]
            }
        })
        .when('/profile', {
            templateUrl: 'pages/profile.html',
            controller: 'ProfileCtrl',
            requiresLogin: true
        })
        .otherwise({
            redirectTo: '/profile'
        });
    }]
);

user_management_system.run(['$rootScope', '$location', 'capi.ums',
    function($rootScope, $location, ums) {
        $rootScope.$on('$routeChangeStart', function(event, next) {
            if (next.requiresLogin && !ums.is_logged_in()) {
                console.log("DENIED");
                event.preventDefault();
                $rootScope.$evalAsync(function() {
                    $location.path('/login');
                });
            }
        });
    }]
);

user_management_system.controller('LoginCtrl', ['$scope', 'capi.ums', '$location', 'is_logged_in',
    function($scope, ums, $location, is_logged_in) {
        if (is_logged_in) {
            $location.path('/profile');
        }
        $scope.creds = {};
        $scope.login = function() {
            ums.login($scope.creds.username, $scope.creds.password).then(function(res) {
                $location.path('/profile');
            })
            .catch(function(e) {
                alert('Authentication failed due to: ' + String(e.data.message || e.data));
            });
            return false;
        }
    }]
);

user_management_system.controller('ProfileCtrl', ['$scope', 'capi.ums', '$location',
    function($scope, ums, $location) {
        $scope.profile = ums.profiles.get({'user_id': ums.current_user.id});
        $scope.current_user = ums.current_user;
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
