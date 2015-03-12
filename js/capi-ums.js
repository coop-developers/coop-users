"use strict";
angular.module('capi').constant('capi.ums.urls', {
    auth: '~/users/auth!',
    logout: '~/users/logout!',
    current_user: '~/users/current_user!',
})
.factory('capi.ums', ['$http', '$q', 'capi.ums.urls', '$resource',
    function($http, $q, urls, $resource) {
        function UserManagementSystem() {
            this.scope = {};
            this.scope.current_user = null;
        }

        UserManagementSystem.prototype.current_user_model = $resource(urls.current_user);
        UserManagementSystem.prototype.create_new_user = function() {
            return new this.current_user_model();
        }
        UserManagementSystem.prototype.save_new_user = function(user) {
            user.new = true;
            return user.$save();
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
            var res = this.current_user_model.get();
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

        return new UserManagementSystem();
    }]
);
