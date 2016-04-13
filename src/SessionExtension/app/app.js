var refreshDisplayTimeout;
var bgpage = chrome.extension.getBackgroundPage();
var sessionTester;
(function (sessionTester) {
    function load() {
        console.log("load");
    }
    sessionTester.load = load;
    function startTimer() {
        console.log("start");
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, (tabs) => {
            if (tabs) {
                var tab = tabs[0];
                if (tab) {
                    this.activeTabId = tab.id;
                    var code = 'window.location.reload(true);';
                    chrome.tabs.executeScript(this.activeTabId, { code: code }, (t) => {
                        bgpage.sessionTester.background.start({ scheduleRequest: true, tabId: this.activeTabId }, updateDisplay);
                    });
                }
            }
        });
    }
    sessionTester.startTimer = startTimer;
    function stopTimer() {
        console.log("stop");
        bgpage.sessionTester.background.stop();
    }
    sessionTester.stopTimer = stopTimer;
    function updateDisplay(delay) {
        console.log("trying to update display with this: " + (delay * 60 * 1000).toString());
        $("#displayTxt").text((delay * 60 * 1000).toString().toHHMMSS());
    }
})(sessionTester || (sessionTester = {}));
String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    var hourStr = "";
    var minuteStr = "";
    var secondStr = "";
    if (hours < 10) {
        hourStr = "0" + hours;
    }
    if (minutes < 10) {
        minuteStr = "0" + minutes;
    }
    if (seconds < 10) {
        secondStr = "0" + seconds;
    }
    var time = hourStr + ':' + minuteStr + ':' + secondStr;
    return time;
};
document.addEventListener('DOMContentLoaded', function () {
    sessionTester.load();
    $("#start").click(function (e) {
        sessionTester.startTimer();
    });
    $("#stop").click(function (e) {
        sessionTester.stopTimer();
    });
});
//# sourceMappingURL=app.js.map