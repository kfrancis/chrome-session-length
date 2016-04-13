/// <reference path="../scripts/typings/chrome/chrome.d.ts" />
/// <reference path="../scripts/typings/jquery/jquery.d.ts" />

var refreshDisplayTimeout;
var bgpage = chrome.extension.getBackgroundPage();

module sessionTester {
    export var activeTabId: number;

    /**
     * Load
     */
    export function load() {
        console.log("load");
    }                          

    /**
     * StartTimer
     */
    export function startTimer() {
        console.log("start");
        chrome.tabs.query({
            active:true,
            currentWindow: true
        }, (tabs: chrome.tabs.Tab[]) => {
            if (tabs) {
                var tab = tabs[0];
                if (tab) {               
                    //debugger;
                    this.activeTabId = tab.id;
                    // reload it to refresh the session for the purpose of this test
                    var code = 'window.location.reload(true);';
                    chrome.tabs.executeScript(this.activeTabId, { code: code }, (t) => {
                        //debugger;
                        (<any>bgpage).sessionTester.background.start({ scheduleRequest: true, tabId: this.activeTabId }, updateDisplay);
                    });
                }
            }
        });
    }

    /**
     * StopTimer
     */
    export function stopTimer() {
        console.log("stop");
        (<any>bgpage).sessionTester.background.stop();
    }

    function updateDisplay(delay: number) {
        console.log("trying to update display with this: " + (delay * 60 * 1000).toString());
        $("#displayTxt").text((delay * 60 * 1000).toString().toHHMMSS());    
    }
}

interface String {
    toHHMMSS(): string;
}

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    var hourStr = "";
    var minuteStr = "";
    var secondStr = "";
    if (hours < 10) { hourStr = "0" + hours; }
    if (minutes < 10) { minuteStr = "0" + minutes; }
    if (seconds < 10) { secondStr = "0" + seconds; }
    var time = hourStr + ':' + minuteStr + ':' + secondStr;
    return time;
}

// Run our kitten generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
    sessionTester.load();
    $("#start").click(function (e) {
        sessionTester.startTimer();  
    });
    $("#stop").click(function (e) {
        sessionTester.stopTimer();
    });
});