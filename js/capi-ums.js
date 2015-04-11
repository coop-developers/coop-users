"use strict";
angular.module('capi').constant('capi.ums.urls', {
    auth: '~/users/auth!',
    logout: '~/users/logout!',
    current_user: '~/users/user!',
})
.factory('capi.ums', ['$http', '$q', 'capi.ums.urls', '$resource', 'capi.urls',
    function($http, $q, urls, $resource, curls) {
        function UserManagementSystem() {
            this.scope = {};
            this.scope.current_user = null;
        }

        UserManagementSystem.prototype.user_model = $resource(
            urls.current_user + '?id=:id',
            {'id': '@id'},
            {
                save: { method: 'PUT' },
                create: { method: 'POST' },
                get_current: { method: 'GET', url: urls.current_user + '?id=current' },
                query: { method: 'GET', url: urls.current_user, isArray: true }
            }
        );
        UserManagementSystem.prototype.create_new_user = function() {
            return new this.user_model();
        }
        UserManagementSystem.prototype.save_new_user = function(user) {
            return user.$create();
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

        UserManagementSystem.prototype._get_current_user = function() {
            var res = this.user_model.get_current();
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

        UserManagementSystem.prototype.get_current_user = function() {
            var instance = this;
            if (this.is_logged_in()) {
                var deferred = $q.defer();
                deferred.resolve(instance.scope.current_user);
                return deferred.promise;
            }
            return this.update_current_user().then(function(user) {
                if (!user) {
                    location.href = curls.login_url + '?redirect_to=' + escape(location.pathname + (location.query || '') + (location.hash || ''));
                    // Not actually logged, redirect to the login service
                    throw {status: 401, data: {mesasge: 'Not authenticated'}};
                }
                return user;
            });
        }

        UserManagementSystem.prototype.update_current_user = function() {
            var instance = this;
            return instance._get_current_user().then(function(current_user) {
                instance.scope.current_user = current_user;
                return current_user;
            });
        }

        UserManagementSystem.prototype.change_current_password = function(old_password, new_password) {
            return $http.put(urls.current_user + '?id=current', {old_password: old_password, new_password: new_password});
        };

        UserManagementSystem.prototype.delete_user = function(id, confirm_email) {
            return $http.delete(urls.current_user + '?id=' + String(id), {headers: {'X-CONFIRM-EMAIL': confirm_email}});
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
