"use strict";
angular.module('capi').constant('capi.ums.urls', {
    auth: 'api/0.1/users/auth',
    logout: 'api/0.1/users/logout',
    current_user: 'api/0.1/users/current_user'
})
.factory('capi.ums', ['$http', '$q', 'capi.ums.urls',
    function($http, $q, urls) {
        function UserManagementSystem() {
            this.current_user = null;
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
            instance.current_user = null;
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
            return $http.get(urls.current_user)
            .then(function(response) {
                return response.data;
            })
            .catch(function(error) {
                if (error.status == 403) {
                    return null; // A+ promises 2.2.7.1
                }
                throw error;
            });
        };

        UserManagementSystem.prototype.update_current_user = function() {
            var instance = this;
            return instance.get_current_user().then(function(user_info) {
                instance.current_user = user_info;
            });
        }

        UserManagementSystem.prototype.is_logged_in = function() {
            return !!this.current_user;
        };

        UserManagementSystem.prototype.logout = function() {
            this.current_user = null;
            return $http.post(urls.logout);
        };
        return new UserManagementSystem();
    }]
);
