/// <reference path="../scripts/typings/chrome/chrome.d.ts" />
/// <reference path="../scripts/typings/jquery/jquery.d.ts" />

var oldChromeVersion: boolean = !chrome.runtime;
var requestTimerId: number;


var urlSet: boolean;
var tabUrl: string = "";
var callbackFunction: Function;

module sessionTester.background {
    export var delay: number = 1;
    export var targetTabId: number = -1;
    interface IStartParams {
        scheduleRequest: boolean,
        tabId?: number
    }
    export function onAlarm(alarm: chrome.alarms.Alarm) {
        if (sessionTester.background.targetTabId && sessionTester.background.targetTabId !== -1) {
            console.log('Got alarm', alarm);
            if (callbackFunction) {
                callbackFunction(sessionTester.background.delay);
            }
            //debugger;
            console.log(sessionTester.background.targetTabId);
            chrome.tabs.get(sessionTester.background.targetTabId, function (tab) {
                if (tabUrl !== tab.url) {
                    // uh! something changed! Did the session expire?
                    console.log("Session expired after " + sessionTester.background.delay + " minute(s).");
                } else {
                    console.log("Current tab url is still '" + tabUrl + "'.");
                    var code = 'window.location.reload(true);';
                    chrome.tabs.executeScript(tab.id, { code: code }, (t) => {
                        //debugger;
                    });
                }
            });
            start({ scheduleRequest: true, tabId: sessionTester.background.targetTabId }, callbackFunction);
        }
    }
    export function onInit() {
        console.log('onInit');
        start({ scheduleRequest: true });
    }
    export function start(params: IStartParams, callback?: Function) {
        if (callback) callbackFunction = callback;
        console.log('start');
        if (params && params.scheduleRequest) {
            //debugger;
            sessionTester.background.targetTabId = params.tabId;
            if (!params.tabId) {
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, (tabs: chrome.tabs.Tab[]) => {
                    if (tabs) {
                        var tab = tabs[0];
                        if (tab) {
                            params.tabId = tab.id;
                        }
                    }
                });

                sessionTester.background.targetTabId = params.tabId;
            }

            chrome.tabs.get(params.tabId, (tab: chrome.tabs.Tab) => {
                if (tab) {
                    if (!urlSet) {
                        // only set once
                        tabUrl = tab.url;
                        urlSet = true;
                        console.log("Current tab url is '" + tabUrl + "'.");
                    }
                }
            });

            schedule();
        }
    }
    export function stop() {
        if (oldChromeVersion) {
            if (requestTimerId) {
                window.clearTimeout(requestTimerId);
                console.log('refresh alarm cleared');
            }
        } else {
            chrome.alarms.clear('refresh', (wasCleared: boolean) => {
                console.log('refresh alarm cleared');
            });
        }
    }
    function schedule() {
        console.log('scheduleRequest');
        console.log('Scheduling for: ' + sessionTester.background.delay + ' mins');
        if (oldChromeVersion) {
            if (requestTimerId) {
                window.clearTimeout(requestTimerId);
            } else {
                requestTimerId = window.setTimeout(onAlarm, sessionTester.background.delay * 60 * 1000);
            }
        } else {
            console.log('Creating alarm');
            chrome.alarms.create('refresh', { periodInMinutes: sessionTester.background.delay });
        }
        sessionTester.background.delay += 1;
    }
}

if (oldChromeVersion) {
    //sessionTester.background.onInit();
} else {
    //chrome.runtime.onInstalled.addListener(sessionTester.background.onInit);
    chrome.alarms.onAlarm.addListener(sessionTester.background.onAlarm);
}