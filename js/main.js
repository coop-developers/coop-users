var user_management_system = angular.module(
    'user_management_system',
    ['ngRoute', 'capi']
);

user_management_system.factory('http_error_alert', ['$q',
    function($q) {
        return function(promise, error_prefix) {
            if (error_prefix) {
                error_prefix += ': ';
            } else {
                error_prefix = '';
            }
            return promise.catch(function(http_result) {
                console.error(http_result);
                alert(error_prefix + String(http_result.data && (http_result.data.message || http_result.data) || http_result.status || 'Connection refused'));
                return $q.reject(http_result);
            });
        };
    }]
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
        .when('/change_password', {
            templateUrl: 'pages/change_password.html',
            controller: 'ChangePasswordCtrl',
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

user_management_system.controller('LoginCtrl', ['$scope', 'capi.ums', '$location', 'is_logged_in', 'http_error_alert',
    function($scope, ums, $location, is_logged_in, http_error_alert) {
        if (is_logged_in) {
            $location.path('/profile');
        }
        $scope.creds = {username: '', password: ''};
        $scope.busy = false;
        $scope.login = function() {
            $scope.busy = true;
            http_error_alert(
                ums.login($scope.creds.username, $scope.creds.password),
                'Authentication failed'
            )
            .then(function(res) {
                $location.path('/profile');
            })
            .catch(function() {})
            .finally(function() {
                $scope.busy = false;
            });
        }
    }]
);

user_management_system.controller('ProfileCtrl', ['$scope', 'capi.ums', '$location',
    function($scope, ums, $location) {
        $scope.profile = ums.profiles.get({'user_id': ums.scope.current_user.id});
        $scope.current_user = ums.scope.current_user;
    }]
);

user_management_system.controller('LoginStateCtrl', ['$scope', 'capi.ums', '$location',
    function ($scope, ums, $location) {
        $scope.ums = ums.scope;
        $scope.logout = function() {
            ums.logout().then(function() {
                $location.path('/login');
            });
        }
    }]
);
user_management_system.controller('ChangePasswordCtrl', ['$scope', 'capi.ums', '$location', 'http_error_alert',
    function ($scope, ums, $location, http_error_alert) {
        $scope.change_password_params = {old_password: '', new_password: ''};
        $scope.new_password2 = '';
        $scope.busy = false;
        $scope.change_password = function() {
            if ($scope.change_password_params.new_password !== $scope.new_password2) {
                alert('New passwords do not match');
                return;
            }
            $scope.busy = true;
            http_error_alert(
                ums.change_password(
                    $scope.change_password_params.old_password,
                    $scope.change_password_params.new_password
                ),
                'Change password'
            )
            .then(function() {
                $location.path('/profile');
            })
            .catch(function(){})
            .finally(function() {
                $scope.busy = false;
            });
        };
    }]
);
