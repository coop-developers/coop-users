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
        .when('/profile/:id?', {
            templateUrl: 'pages/profile.html',
            controller: 'ProfileCtrl',
            requiresLogin: true
        })
        .when('/edit_profile/:id?', {
            templateUrl: 'pages/edit-profile.html',
            controller: 'ProfileCtrl',
            requiresLogin: true
        })
        .when('/register', {
            templateUrl: 'pages/edit-profile.html',
            controller: 'RegisterCtrl',
            requiresLogin: false
        })
        .when('/change_password', {
            templateUrl: 'pages/change_password.html',
            controller: 'ChangePasswordCtrl',
            requiresLogin: true
        })
        .when('/profiles', {
            templateUrl: 'pages/profile-list.html',
            controller: 'ListProfileCtrl',
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
            var target_url = $location.path();
            if (next.requiresLogin && !ums.is_logged_in()) {
                console.log(next);
                console.log("DENIED");
                event.preventDefault();
                $rootScope.$evalAsync(function() {
                    $location.path('/login').search('from', target_url);
                });
            }
        });
    }]
);

user_management_system.controller('LoginCtrl', ['$scope', 'capi.ums', '$location', 'is_logged_in', 'http_error_alert',
    function($scope, ums, $location, is_logged_in, http_error_alert) {
        function to_next_page() {
            if ($location.search().redirect_to) {
                location.href = $location.search().redirect_to;
            } else if ($location.search().from) {
                $location.path($location.search().from).search('from', null);
            } else {
                $location.path('/profile');
            }
        }
        if (is_logged_in) {
            to_next_page();
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
                to_next_page();
            })
            .catch(function() {
                $('#login-password').focus().select();
            })
            .finally(function() {
                $scope.busy = false;
            });
        }
    }]
);

user_management_system.controller('ProfileCtrl', ['$scope', 'capi.ums', '$location', 'http_error_alert', '$q', '$routeParams',
    function($scope, ums, $location, http_error_alert, $q, $routeParams) {
        $scope.current_user = ums.scope.current_user;
        if (!$routeParams.id) {
            $scope.user = angular.copy(ums.scope.current_user);
        } else {
            $scope.user = ums.user_model.get({id: $routeParams.id});
        }
        if (!$scope.user.permissions) {
            $scope.user.permissions = {};
        }
        $scope.editing_permissions = false;
        $scope.busy = true;
        $scope.busy = false;

        $scope.edit_permissions = function() {
            $scope.editing_permissions = true;
        }


        $scope.save_profile = function() {
            $scope.busy = true;
            $q.all([
                http_error_alert($scope.user.$save().then(function() {
                    if (ums.scope.current_user.id == $scope.user.id) {
                        ums.scope.current_user = $scope.user;
                    }
                }), 'Basic Information')
            ]).catch(function() {})
            .then(function() {
                $location.path('/profile/' + $scope.user.id);
            })
            .finally(function() {
                $scope.busy = false;
            });
        }
    }]
);

user_management_system.controller('RegisterCtrl', ['$scope', 'capi.ums', '$location', 'http_error_alert', '$q',
    function($scope, ums, $location, http_error_alert, $q) {
        $scope.user = ums.create_new_user();
        $scope.user.new = true;
        $scope.busy = true;
        $scope.busy = false;
        $scope.new = true;


        $scope.save_profile = function() {
            $scope.busy = true;
            $q.all([
                http_error_alert(ums.save_new_user($scope.user), 'Basic Information')
            ]).catch(function() {})
            .then(function() {
                $location.path('/profile');
            })
            .finally(function() {
                $scope.busy = false;
            });
        }
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
user_management_system.controller('ChangePasswordCtrl', ['$scope', 'capi.ums', '$location', 'http_error_alert', '$routeParams',
    function ($scope, ums, $location, http_error_alert, $routeParams) {
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
                ums.change_current_password(
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

user_management_system.controller('ListProfileCtrl', ['$scope', 'capi.ums', '$location', 'http_error_alert',
    function($scope, ums, $location, http_error_alert) {
        $scope.users = ums.user_model.query();
        $scope.view = function(user) {
            $location.path('/profile/' + String(user.id));
        }
        $scope.edit = function(user) {
            $location.path('/edit_profile/' + String(user.id));
        }
    }]
);
