"use strict";
angular.module('capi').constant('capi.ums.urls', {
    auth: 'api/0.1/users/auth',
    logout: 'api/0.1/users/logout',
    current_user: 'api/0.1/users/current_user',
    profiles: 'api/0.1/user_profile/:user_id'
})
.factory('capi.ums', ['$http', '$q', 'capi.ums.urls', '$resource',
    function($http, $q, urls, $resource) {
        var current_user_db = $resource(urls.current_user);
        function UserManagementSystem() {
            this.scope = {};
            this.scope.current_user = null;
        }

        UserManagementSystem.prototype.authenticate = function(username, password) {
            return $http.post(urls.auth, {username: username, password: password})
            .then(function(response) {
                if (response.status == 204) {
                    return true;
                }
                response.data = {message: 'invalid service response'};
                throw response;
            })
        };

        UserManagementSystem.prototype.login = function(username, password) {
            var instance = this;
            instance.scope.current_user = null;
            return instance.authenticate(username, password).then(function(result) {
                if (result) {
                    return instance.update_current_user().then(function() {
                        return result;
                    });
                }
                return result;
            });
        };

        UserManagementSystem.prototype.get_current_user = function() {
            var res = current_user_db.get();
            return res.$promise.then(function(result) {
                return res;
            })
            .catch(function(error) {
                if (error.status == 401) {
                    return null; // A+ promises 2.2.7.1
                }
                throw error;
            });
        };

        UserManagementSystem.prototype.update_current_user = function() {
            var instance = this;
            return instance.get_current_user().then(function(current_user) {
                instance.scope.current_user = current_user;
            });
        }

        UserManagementSystem.prototype.change_password = function(old_password, new_password) {
            return $http.post(urls.current_user, {old_password: old_password, new_password: new_password});
        };

        UserManagementSystem.prototype.is_logged_in = function() {
            return !!(this.scope.current_user);
        };

        UserManagementSystem.prototype.logout = function() {
            this.scope.current_user = null;
            return $http.post(urls.logout);
        };

        UserManagementSystem.prototype.profiles = $resource(urls.profiles);

        return new UserManagementSystem();
    }]
);
