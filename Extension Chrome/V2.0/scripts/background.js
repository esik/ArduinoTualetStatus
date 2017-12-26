"use strict";

const TIMER = "timer",
      REST_API_URL = "http://192.168.0.171/";

chrome.browserAction.onClicked.addListener((/*tab*/) => {
    update();
});

chrome.alarms.onAlarm.addListener((alarm) => {
    alarm.name === TIMER && update();
});

chrome.alarms.create(TIMER, {
    "delayInMinutes"  : 0,
    "periodInMinutes" : 1 // 1 минута
    /*
     * In order to reduce the load on the user's machine, Chrome limits alarms to at most once every
     * 1 minute but may delay them an arbitrary amount more. That is, setting delayInMinutes or
     * periodInMinutes to less than 1 will not be honored and will cause a warning. when can be set to
     * less than 1 minute after "now" without warning but won't actually cause the alarm to fire for
     * at least 1 minute.
     */
});

function update() {
    _.get(REST_API_URL, (data/*, xhr*/) => {
        let json = JSON.parse(data.replace(/\s+/, "")),
            count = 0,
            color = "";
        if (json.status) {
            json.status.first.open && count++;
            json.status.second.open && count++;
        }
        count === 0 && (color = "red");
        count === 1 && (color = "yellow");
        count === 2 && (color = "green");

        chrome.browserAction.setBadgeBackgroundColor({"color": color});

    });
}

chrome.browserAction.setBadgeText({"text": "  "});
