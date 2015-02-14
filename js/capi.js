angular.module('capi', ['ngResource']);
angular.module('capi').constant('capi.urls', {
    update_csrf: 'api/0.1/update_csrf'
});
angular.module('capi').factory('capi_csrf_reload_interceptor',
    ['$injector', '$q', 'capi.urls',
        function($injector, $q, urls) {
            return {
                responseError: function(error) {
                    var $http = $injector.get('$http');
                    if (error.config.do_not_retry) return $q.reject(error);
                    if (error.status === 403 && error.data && error.data.cause === 'invalid_csrf') {
                        console.log(error);
                        return $http.post(urls.update_csrf).then(function () {
                            // retry original request after updating csrf token
                            error.config.do_not_retry = true;
                            return $http(error.config);
                        },
                        // Must not be second .catch, because it will catch
                        // errors in the above $http request
                        function(e) {
                            console.log(e);
                            return $q.reject(error);
                        });
                    }
                    return $q.reject(error);
                }
            };
        }
    ]
)
.config(function($httpProvider) {
    $httpProvider.interceptors.push('capi_csrf_reload_interceptor');
});

