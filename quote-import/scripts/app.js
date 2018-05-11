var app = angular.module("ss.lowtouch", ["ngRoute", "jsonFormatter", 'ngSanitize', 'ui.bootstrap', 'ui.select']);
app.factory('appConfig', ['$timeout', '$interval', '$rootScope', 'db', function($timeout, $interval, $rootScope, db) {
    var conf = this.config = {
        "analytics": {
            "traits": {
                'TENANT_ID': 'REDHAT_ID',
                'TENANT_NAME': 'RedHat',
                'ACCOUNT_ID': 'GOLDWATER_ID',
                'ACCOUNT_NAME': 'Goldwater',
                'ACCOUNT_TYPE': 'Reseller',
                'USER_ID': 'FAHEEM_ID',
                'USER_NAME': 'Faheem Hussain'
            },
            "event": {
                "login": "Login",
                "download": "Download",
                "view": "View",
                "create": "Create",
                "change": "Change",
                "forgot": "Forgot",
                "click": "Click",
                "report": "Report"
            },
            "category": {
                "web": "Web",
                "opportunity": "Opportunity",
                "account": "Account",
                "request": "Request",
                "password": "Password",
                "helpLink": "Help Link",
                "users": "Users"
            },
            "label": {
                "success": "Success",
                "Failure": "Failure",
                "pdf": "pdf",
                "csv": "csv",
                "topSearchResults": "Top Search Results",
                "searchResultsTab": "Search Results Tab",
                "standaloneOpps": "Opportunities",
                "accountDetailsOpps": "Account Details Subtab",
                "emailSent": "Email Sent",
                "all": "All"
            }
        },
        "interpolate": function(str, obj) {
            var start = str.indexOf('[['),
                end = -1,
                varName = '';
            while (start > -1) {
                end = str.indexOf(']]', start);
                varName = str.substring(start + 2, end);
                str = str.replace("[[" + varName + "]]", obj[varName]);
                start = str.indexOf('[[');
            }
            return str;
        },
        "multiCurrency": true,
        "session": {
            "timeout": 10000,
            "warnTime": 5,
            "$timestamp": 0,
            "$warnTimer": null,
            "$idleTimer": null,
            "$warnPollInterval": 1,
            "remainingTime": 500,
            "logoutUrl": "/secur/logout.jsp",
            "reset": function() {
                this.$timestamp = (new Date()).getTime();
                db.set('idleTimestamp', this.$timestamp);
                db.set('idleTimeout', false);
                this.$setTimer();
            },
            "$setTimer": function() {
                $timeout.cancel(this.$idleTimer);
                $interval.cancel(this.$warnTimer);
                this.$timer = this.$getTimer();
            },
            "$getTimer": function() {
                var self = this,
                    timer;
                var getIdleTimer = function() {
                    var delaySeconds = self.timeout - self.$getIdleTime() - self.warnTime;
                    return $timeout(function() {
                        self.$setTimer();
                    }, delaySeconds * 1000);
                };
                var getWarnTimer = function() {
                    self.remainingTime = self.warnTime;
                    return $interval(function() {
                        self.remainingTime -= self.$warnPollInterval;
                        if (self.$isIdle()) {
                            $interval.cancel(self.$warnTimer);
                            self.$setTimer();
                        } else {
                            if (self.remainingTime > 0) {
                                $rootScope.$broadcast("IdleWarn", self.remainingTime);
                            } else {
                                $interval.cancel(self.$warnTimer);
                                db.set('idleTimeout', true);
                                $rootScope.$broadcast("IdleTimeout", self.remainingTime);
                            }

                        }
                    }, self.$warnPollInterval * 1000);
                };
                if (this.$isIdle()) {
                    $rootScope.$broadcast("IdleEnd");
                    this.$idleTimer = timer = getIdleTimer();
                } else {
                    $rootScope.$broadcast("IdleStart");
                    this.$warnTimer = timer = getWarnTimer();
                }
                return timer;
            },
            "$isIdle": function() {
                return (this.$getIdleTime() < (this.timeout - this.warnTime));
            },
            "$getIdleTime": function() {
                var idleTime = Math.round(((new Date()).getTime() - db.get('idleTimestamp')) / 1000);
                return idleTime;
            },
            "logout": function() {
                location.href = this.logoutUrl;
            }
        },
        "lang": {
            "common": {
                "CHL_SEARCH": "Search...",
                "CHL_SEL_OR_SEARCH": "Select or search...",
                "CHL_NO_RECORDS": "No matching records found.",
                "CHL_GENERIC_ERROR": "Oops! Something went wrong.",
                "CHL_HEAP_ERROR": "Search results limit exceeded. Please refine your search parameters to narrow your results. If you continue to experience difficulties, please submit a [[CHL_SALES_REQUEST]].",
                "CHL_SALES_REQUEST": "Sales Request",
                "CHL_RESULTS_LIMIT_EXCEEDED": "Search Results Limit Exceeded"
            }
        }
    };
    var cn = '趍滱漮笢笣紽鄻鎟霣憢耇胇珶珸珿婰婜孲釂鱞鋱粞絧絏厗垌壴妶岯滘嶵嶯幯鱐鱍鱕裍裚詷諙蚔趵';
    var lang = this.config.lang;
    var fakeTranslate = function() {
            Object.keys(lang).forEach(function(view) {
                Object.keys(lang[view]).forEach(function(key) {
                    lang[view][key] = cn.substr(1, Math.ceil(lang[view][key].length / 3));
                });
            });
        }
        //fakeTranslate();
    return this.config;
}]);
app.factory("sf", ['$q', '$timeout', function($q, $timeout) {
    var attachFile = function(file, parentId) {
        var deferred = $q.defer();
        var reader = new FileReader();
        // Keep a reference to the File in the FileReader so it can be accessed in callbacks
        reader.file = file;
        reader.onload = function(e) {
            var att = new sforce.SObject("Attachment");
            att.Name = this.file.name;
            att.ContentType = this.file.type;
            att.ParentId = parentId;

            var binary = "";
            var bytes = new Uint8Array(e.target.result);
            var length = bytes.byteLength;

            for (var i = 0; i < length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            att.Body = (new sforce.Base64Binary(binary)).toString();
            sforce.connection.create([att], {
                onSuccess: function(result, source) {
                    if (result[0].getBoolean("success")) {
                        deferred.resolve(result, source);
                    } else {
                        deferred.reject(result, source);
                    }
                },
                onFailure: function(error, source) {
                    deferred.reject(error, source);
                }
            });
        };
        reader.readAsArrayBuffer(file);
        return deferred.promise;
    };
    var attach = function(attachments) {
        var promises = [],
            promise;
        var eventualPromise = null;
        if (angular.isArray(attachments)) {
            angular.forEach(attachments, function(attachment) {
                promises.push(attachFile(attachment.file, attachment.parentId));
            });
            promise = $q.all(promises);
        } else if (angular.isObject(attachments)) {
            promise = attachFile(attachments.file, attachments.parentId);
        }
        return promise;
    };


    return {
        "attach": attach
    };
}]);
app.service('db', ['localStorageService', function(localStorageService) {
    var localState = {},
        dbName = 'ss.lt';
    this.set = function(property, value) {
        localState = angular.fromJson(localStorageService.get(dbName));
        if (localState) {
            localState[property] = value;
        } else {
            localState = {};
            localState[property] = value;
        }
        localStorageService.set(dbName, angular.toJson(localState));
    };
    this.get = function(property) {
        var returnValue = null;
        localState = angular.fromJson(localStorageService.get(dbName));
        localState && (returnValue = localState[property]);
        return returnValue;
    };
}]);

app.config(['$routeProvider', '$locationProvider', '$sceDelegateProvider', function($routeProvider, $locationProvider, $sceDelegateProvider) {

    $sceDelegateProvider.resourceUrlWhitelist([
        'self',
        'https://localhost:4433/**',
        'https://*.ssi-cloud.com',
        "http://run.plnkr.co"
    ]);

    $routeProvider.
    when('/', {
            templateUrl: 'views/import.html',
            controller: 'ImportController',
            href: '#account'
        }).
        /*when('/', {
            templateUrl: 'views/opportunity.html',
            controller: 'HomeController',
            href: '#account'
        }).*/

    when('/api-tool', {
        templateUrl: 'views/api-tool.html',
        controller: 'ApiToolController',
        href: '#account'
    }).
    otherwise({
        redirectTo: '/error'
    });
    //$locationProvider.hashPrefix('');
}]);
app.factory('api', [function() {
    var mode = "debug";
    var debugMap = {
        "getOpportunity": "data/opportunity-sf.json",
        "getCase": "data/case-sf.json",
        "getContact": "data/contact.json",
        "getCancelReasons": "data/cancel-reasons.json",
        "getBulkQuote": "data/get-quote.json",
        "getDelimiters": "data/delimiters.json",
        "getDateFormats": "data/date-formats.json",
        "getNumberFormats": "data/number-formats.json",
        "getPicklistData": "data/picklist-data.json",
        "createQuote": "data/post-quote-response.json",
        "getS3SignedUrl": "data/s3signedurl.json",
        "moveRlis": "data/move-rlis.json"
    };
    var prodMap = {

    };
    var getUrl = function(name) {
        return (mode === "debug" ? debugMap : (angular.isDefined($sf) ? $sf.api : prodMap))[name];
    };
    var fromStr = function(data, key, obj) {
        if (angular.isArray(data) || angular.isObject(data)) {
            angular.forEach(data, function(value, key, obj) {
                fromStr(value, key, obj);
            });
        } else if (data === 'true' || data === 'false') {
            obj[key] = (data === 'true');
        } else if (data !== '' && data !== null && !isNaN(data)) {
            obj[key] = Number(data);
        }
    };
    var toStr = function(data, key, obj) {
        if (angular.isArray(data) || angular.isObject(data)) {
            angular.forEach(data, function(value, key, obj) {
                toStr(value, key, obj);
            });
        } else if (data === true || data === false) {
            obj[key] = (data === true ? 'true' : 'false');
        } else if (data !== '' && data !== null && !isNaN(data)) {
            obj[key] = data.toString();
        }
    };
    return {
        "mode":mode,
        "getUrl": getUrl,
        "fromStr": fromStr,
        "toStr": toStr
    };
    
}]);

app.factory('xhr', ['$q', '$rootScope', '$http', 'api',
    /*'appConfig',*/
    '$httpParamSerializer' /*,'notify'*/ ,
    function($q, $rootScope, $http, api, /*appConfig,*/ $httpParamSerializer /*, notify*/ ) {

        var xhr = null,
            $sf = {
                "api": ""
            },
            sfActionMap = $sf.api,
            /*showHeapError = function(){
                var labels = appConfig.lang.common;
                var params = $httpParamSerializer({"tp":"General Assistance", "sb":labels.CHL_RESULTS_LIMIT_EXCEEDED});
                var salesRequetLink = '<a style="text-decoration:underline;" href="#/new-request?'+params+'">'+labels.CHL_SALES_REQUEST+'</a>';
                var messageTemplate = '<span>'+appConfig.interpolate(labels.CHL_HEAP_ERROR, {"CHL_SALES_REQUEST":salesRequetLink})+'</span>';

                notify({
                    messageTemplate: messageTemplate,
                    classes: ['notify-error'],
                    templateUrl: '',
                    duration: 0,
                    position: 'center',
                });  
            },*/
            sfhttp = function(urlName, requestData, type) {
                var deferred = $q.defer(),
                    requestString = (typeof requestData === 'object') ? angular.toJson(requestData) : requestData,
                    response,
                    remoteActionName = api.getUrl(urlName);
                Visualforce.remoting.Manager.invokeAction(
                    remoteActionName,
                    requestString,
                    function(result, event) {
                        if (event.statusCode === 500 && event.message === "Page not allowed for the profile") {
                            appConfig.session.logout();
                        }
                        if (event.statusCode === 400 && event.type === "exception" && event.message.includes("heap")) {
                            showHeapError();
                        }
                        appConfig.session && appConfig.session.reset();
                        if (typeof result === 'string' &&
                            (/^\s*{/.test(result) && /}\s*$/.test(result) || /^\s*\[/.test(result) && /]\s*$/.test(result))) {
                            result = angular.fromJson(angular.element('<textarea />').html(result).text());
                        }
                        response = {
                            "data": result,
                            "status": event.statusCode,
                            "sfAction": event.action,
                            "sfMethod": event.method,
                            "statusText": "",
                            "event": event
                        };
                        $rootScope.$apply(function() {
                            if (event.status) {
                                deferred.resolve(response);
                            } else {
                                deferred.reject(response);
                            }
                        });
                    }, {
                        buffer: true,
                        escape: false,
                        timeout: 30000
                    }
                );
                return deferred.promise;
            },
            http = function(urlName, requestData, type) {
                return $http.get(api.getUrl(urlName), requestData);
            };

        return (api.mode === "debug") ? http : sfhttp;
    }
]);
app.factory('util', [function() {
    return {
        "interpolate": function(str, obj) {
            var start = str.indexOf('[['),
                end = -1,
                varName = '';
            while (start > -1) {
                end = str.indexOf(']]', start);
                varName = str.substring(start + 2, end);
                str = str.replace("[[" + varName + "]]", obj[varName]);
                start = str.indexOf('[[');
            }
            return str;
        }
    };
}]);
app.directive('uiSelectRequired', [function() {
    return {
        restrict: "A",
        require: '^ngModel',
        scope: {
            uiSelectRequired: "="
        },
        link: function(scope, elm, attrs, ngModel) {
            if (scope.uiSelectRequired){
                ngModel.$validators.uiSelectRequired = function(modelValue, viewValue) {
                    var hasValue = false;
                    if (modelValue) {
                        if (angular.isArray(modelValue)) {
                            hasValue = modelValue.length > 0;
                        } else if (angular.isString(modelValue)) {
                            hasValue = modelValue.length > 0;
                        } else {
                            hasValue = true;
                        }
                    }
                    return hasValue;
                };
            }
            
        }
    };
}]);
app.directive('fileAttachment', [function() {
    return {
        scope: {
            'files': '=',
            'faMin': '@',
            'faMax': '@',
            'faMaxSize': '@',
            'faValid': '=',
            'faBusy': '=',
            'faText': '@',
            'faAccept': '@',
            'onFileAdd': '&',
            'onFileRemove': '&'
        },
        //require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
            scope.fileButtonId = "btn-file" + Math.floor((Math.random() * 10000) + 1);
            scope.fileButton = element[0].querySelector(".btn-file");
            var attachmentBox = element[0].querySelector(".attachment-box");

            angular.element(scope.fileButton).bind("change", function(changeEvent) {
                angular.forEach(changeEvent.target.files, function(file) {
                    !exists(file) && addFile(file); //scope.files.push(file);

                });
                scope.safeApply();
            });

            var exists = function(file) {
                var fileExists = false;
                angular.forEach(scope.files, function(existingFile) {
                    fileExists = (file.name === existingFile.name && file.size === existingFile.size);
                });
                return fileExists;
            };
            var addFile = function(file) {
                var f = {
                    "status": "SELECTED", //UPLOADING, UPLOADED, UPLOAD_ERROR
                    "file": file
                };
                scope.safeApply(function(){
                    scope.files.push(f);
                    scope.onFileAdd({"$file":f});
                });
            };
            attachmentBox.addEventListener(
                'dragover',
                function(e) {
                    e.dataTransfer.dropEffect = 'move';
                    // allows us to drop
                    if (e.preventDefault) e.preventDefault();
                    this.classList.add('over');
                    return false;
                },
                false
            );
            attachmentBox.addEventListener(
                'dragenter',
                function(e) {
                    this.classList.add('over');
                    return false;
                },
                false
            );

            attachmentBox.addEventListener(
                'dragleave',
                function(e) {
                    this.classList.remove('over');
                    return false;
                },
                false
            );
            attachmentBox.addEventListener(
                'drop',
                function(e) {
                    // Stops some browsers from redirecting.
                    if (e.stopPropagation) e.stopPropagation();
                    e.preventDefault();

                    this.classList.remove('over');
                    angular.forEach(e.dataTransfer.files, function(file) {
                        !exists(file) && addFile(file); //scope.files.push(file);
                    });
                    //scope.safeApply();
                    return false;
                },
                false
            );

        },
        controller: ['$scope', 'util', function($scope, util) {
            $scope.randomId = Math.floor(Math.random() * 1000);
            $scope.labels = {
                "CHL_DROP_HERE": "Drop files here or click to upload.",
                "CHL_CANCEL": "Cancel",
                "CHL_UPLOAD": "Upload",
                "CHL_UPLOADING": "Uploading...",
                "CHL_TOO_MANY_FILES": "No more than [[maxFiles]] attachments allowed",
                "CHL_FILE_TOO_BIG": "Each file should be less than [[maxSize]] MB."
            }; //appConfig.lang.fileAttachment;
            $scope.labels.CHL_TOO_MANY_FILES = util.interpolate($scope.labels.CHL_TOO_MANY_FILES, {
                "maxFiles": $scope.faMax
            });
            $scope.labels.CHL_FILE_TOO_BIG = util.interpolate($scope.labels.CHL_FILE_TOO_BIG, {
                "maxSize": ($scope.faMaxSize / 1000000)
            });
            $scope.validity = {
                count: false,
                size: false
            };
            $scope.$watchCollection('files', function(newVal) {
                $scope.validity.count = (newVal.length > $scope.faMax);
                $scope.validity.size = false;
                angular.forEach(newVal, function(file) {
                    (file.size > $scope.faMaxSize) && ($scope.validity.size = true);
                });
                $scope.faValid = (!$scope.validity.size && !$scope.validity.count);
            });
            $scope.safeApply = function(fn) {
                var phase = this.$root.$$phase;
                if (phase == '$apply' || phase == '$digest') {
                    if (fn && (typeof(fn) === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };
            // https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
            $scope.formatBytes = function(a, b) {
                if (0 === a) return "0 Bytes";
                var c = 1024,
                    d = b || 2,
                    e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
                    f = Math.floor(Math.log(a) / Math.log(c));
                return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f]
            };
            $scope.removeFile = function(file) {
                var idx = $scope.files.indexOf(file);
                if (idx !== -1) {
                    $scope.files.splice(idx, 1);
                }
                $scope.onFileRemove({"$file":file});
            };
        }],
        templateUrl: 'views/file-attachment.html'
    };
}]);

app.controller('ImportController', ['$scope', '$timeout', '$http', '$filter', 'xhr','api', 
    function($scope, $timeout, $http, $filter,  xhr, api) {
    $scope.dataFiles = [];
    $scope.model = {
        "files": [],
        "quotes": [],
        "quote": null,
        "tab": "IMPORT",
        "presignedUrl":"",
        "_isOpen":false,
        "createQuotes": true,
        "quotePropsGrid":[],
        "dataFile": {
            "files":[],
            "delimiters":[],
            "dateFormats": [],
            "numberFormats": [],
            "selected": {
                "delimiter":null,
                "dateFormat": null,
                "numberFormat": null
            }
        }
        
    };

    $scope.selectTab = function(name) {
        $scope.model.tab = name;
    };
    $scope.setPrimary = function(selectedQuote) {
        angular.forEach($scope.model.quotes, function(quote) {
            quote.primary = false;
        });
        selectedQuote.primary = true;
    };
    var fakeUpload = function(file) {
        file.status = 'UPLOADING';
        $timeout(function() {
            file.status = 'UPLOADED';
        }, Math.floor(Math.random() * 5) * 1000);
    };
    var getPresignedUrl = function() {
        return $http.get('https://sbx.dev.ssi-cloud.com/upload/dell/opportunity/PresignedUrl');
    };
    var uploadToS3 = function(file) {
        file.status = 'UPLOADING';
        console.log($scope.model.presignedUrl);
        $http.put($scope.model.presignedUrl, file.file , {
                headers: {
                    'Content-Type': "multipart/form-data"
                }
            })
            .then(function(resp) {
                file.status = 'UPLOADED';
                console.log(resp);
            }, function(resp) {
                file.status = 'SELECTED';
                console.log(resp);
            });
    };
    var getDataFileOptions = function(apiName, modelProperty){
        var dataOptions = [{
            "apiName": "getDelimiters",
            "modelProperty":"delimiters"
        },{
            "apiName": "getDateFormats", 
            "modelProperty": "dateFormats"
        },{ 
            "apiName":"getNumberFormats", 
            "modelProperty":"numberFormats"
        }];
        angular.forEach(dataOptions, function(option){
            xhr(option.apiName, {}).then(function(res){
                api.fromStr(res.data);
                $scope.model.dataFile[option.modelProperty] = res.data.data;
            }, function(){

            })
        });
        
    };
    var getBulkQuote = function() {
        var props = [], sorted = [], row = [], grid = []; 
        xhr("getBulkQuote", {}).then(function(res) {
            api.fromStr(res.data);
            $scope.model.quote = res.data;
            angular.forEach(res.data.meta.definitions.quote.properties, function(value, key) {
                props.push(value);
                //$scope.quoteProps.push(value);
            });
            sorted = $filter('orderBy')(props, 'order');
            for (var index = 0; index < sorted.length; index += 2){
                row = [];
                sorted[index] && row.push(sorted[index]);
                sorted[index+1] && row.push(sorted[index+1]);
                grid.push(row);
            }
            $scope.model.quotePropsGrid = grid;
            $scope.addQuote();
        });
    };
    var createQuote = function(quote){
        xhr("createQuote", quote.quote).then(function(res){
            angular.forEach(quote.files, function(file){
                fakeUpload(file, res.data.data[0].id, );
            });
        }, function(err){

        });
    };
    var attachToQuote = function(quoteId, file){

    };
    $scope.onAddFile = function(file, quote){
        if (quote.files.length < 2){
            var name = file.file.name.substring(0, file.file.name.lastIndexOf('.'));
            quote.quote.data[0].attributes.name = name;
        }
    };
    $scope.onRemoveFile = function(file,quote){
        if (quote.files.length === 0){
            quote.quote.data[0].attributes.name = "";
        }
    };
    $scope.getPicklistData = function(store, url){
        console.log(arguments);
        var optionsGet = {
            "links":{
                "self": url
            },
            "action":"GET"
        };
        xhr("getPicklistData", optionsGet).then(function(res){
            api.fromStr(res.data);
            store.options = res.data.data;
        }, function(err){

        });
    };
    $scope.addQuote = function() {
        var quoteCopy = angular.merge({}, $scope.model.quote);
        $scope.model.quotes.push({
            "quote": quoteCopy,
            "primary": false,
            "uploading": false,
            "files": []
        });
    };
    $scope.onSubmit = function() {
        angular.forEach($scope.model.quotes, function(quote) {
            angular.forEach(quote.files, function(file) {
                uploadToS3(file);
                //fakeUpload(file);
            });
        });
    };
    getDataFileOptions();
    getBulkQuote();
}]);
app.controller('ApiToolController', ['$scope', '$timeout', 'xhr', function($scope, $timeout, xhr) {
    $scope.model = {
        "renderType": "TREE",
        "requestJson": null,
        "responseJson": {},
        "tab": "REQUEST",
        "url": ""
    };
    $scope.requestJsonString = "{}";
    $scope.$watch('requestJsonString', function(newValue, oldValue) {
        $scope.model.requestJson = angular.fromJson(newValue);
    });
    var expand = function() {
        $timeout(function() {
            $scope.autoExpand('request-json-textarea');
        }, 100);

    };
    $scope.autoExpand = function(e) {
        var element = typeof e === 'object' ? e.target : document.getElementById(e);
        if (element) {
            var scrollHeight = element.scrollHeight; // replace 60 by the sum of padding-top and padding-bottom
            element.style.height = scrollHeight + "px";
        }
    };
    $scope.onSubmit = function() {
        xhr("getOpportunity", $scope.model.requestJson).then(function(response) {
            $scope.model.responseJson = response.data;
            $scope.model.requestJsonString = angular.toJson($scope.model.responseJson, 4); //$filter('json')($scope.model.responseJson, 4);
            expand();
        });
    };
    $scope.changeTab = function(tabName) {
        $scope.model.tab = tabName;
        expand();
    };


}]);