var oldChromeVersion = !chrome.runtime;
var requestTimerId;
var urlSet;
var tabUrl = "";
var callbackFunction;
var sessionTester;
(function (sessionTester) {
    var background;
    (function (background) {
        background.delay = 1;
        background.targetTabId = -1;
        function onAlarm(alarm) {
            if (sessionTester.background.targetTabId && sessionTester.background.targetTabId !== -1) {
                console.log('Got alarm', alarm);
                if (callbackFunction) {
                    callbackFunction(sessionTester.background.delay);
                }
                console.log(sessionTester.background.targetTabId);
                chrome.tabs.get(sessionTester.background.targetTabId, function (tab) {
                    if (tabUrl !== tab.url) {
                        console.log("Session expired after " + sessionTester.background.delay + " minute(s).");
                    }
                    else {
                        console.log("Current tab url is still '" + tabUrl + "'.");
                        var code = 'window.location.reload(true);';
                        chrome.tabs.executeScript(tab.id, { code: code }, (t) => {
                        });
                    }
                });
                start({ scheduleRequest: true, tabId: sessionTester.background.targetTabId }, callbackFunction);
            }
        }
        background.onAlarm = onAlarm;
        function onInit() {
            console.log('onInit');
            start({ scheduleRequest: true });
        }
        background.onInit = onInit;
        function start(params, callback) {
            if (callback)
                callbackFunction = callback;
            console.log('start');
            if (params && params.scheduleRequest) {
                sessionTester.background.targetTabId = params.tabId;
                if (!params.tabId) {
                    chrome.tabs.query({
                        active: true,
                        currentWindow: true
                    }, (tabs) => {
                        if (tabs) {
                            var tab = tabs[0];
                            if (tab) {
                                params.tabId = tab.id;
                            }
                        }
                    });
                    sessionTester.background.targetTabId = params.tabId;
                }
                chrome.tabs.get(params.tabId, (tab) => {
                    if (tab) {
                        if (!urlSet) {
                            tabUrl = tab.url;
                            urlSet = true;
                            console.log("Current tab url is '" + tabUrl + "'.");
                        }
                    }
                });
                schedule();
            }
        }
        background.start = start;
        function stop() {
            if (oldChromeVersion) {
                if (requestTimerId) {
                    window.clearTimeout(requestTimerId);
                    console.log('refresh alarm cleared');
                }
            }
            else {
                chrome.alarms.clear('refresh', (wasCleared) => {
                    console.log('refresh alarm cleared');
                });
            }
        }
        background.stop = stop;
        function schedule() {
            console.log('scheduleRequest');
            console.log('Scheduling for: ' + sessionTester.background.delay + ' mins');
            if (oldChromeVersion) {
                if (requestTimerId) {
                    window.clearTimeout(requestTimerId);
                }
                else {
                    requestTimerId = window.setTimeout(onAlarm, sessionTester.background.delay * 60 * 1000);
                }
            }
            else {
                console.log('Creating alarm');
                chrome.alarms.create('refresh', { periodInMinutes: sessionTester.background.delay });
            }
            sessionTester.background.delay += 1;
        }
    })(background = sessionTester.background || (sessionTester.background = {}));
})(sessionTester || (sessionTester = {}));
if (oldChromeVersion) {
}
else {
    chrome.alarms.onAlarm.addListener(sessionTester.background.onAlarm);
}
//# sourceMappingURL=background.js.map