// ==UserScript==
// @name                DailyGammon Tools.
// @version             0.0.1 26/07/2009
// @namespace           Tanaydin Sirin
// @description         DailyGammon Toolz.
// @include             http://*.dailygammon.com/*
// @features            Colorize current user's nickname at tournament pages
// @features            Refreshes top page every 5 seconds if there is no game to play
// ==/UserScript==

function dailyGammonTools(e) {
    const cPage = window.location.href;

    const XPFirst = XPathResult.FIRST_ORDERED_NODE_TYPE;
    const XPList = XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE;

    function find(xpath, xpres, startnode = document) {
        const ret = document.evaluate(xpath, startnode, null, xpres, null);
        return xpres === XPFirst ? ret.singleNodeValue : ret;
    }
    
    function getHtml(xpath) {
        const t = find(xpath, XPFirst);
        return t ? t.innerHTML : false;
    }
    
    function setCookie(c_name, value, expiredays) {
        const exdate = new Date();
        exdate.setDate(exdate.getDate() + expiredays);
        document.cookie = `${c_name}=${encodeURIComponent(value)}${expiredays === null ? "" : `;expires=${exdate.toGMTString()}`}`;
    }
    
    function getCookie(c_name) {
        const c_start = document.cookie.indexOf(`${c_name}=`);
        if (c_start !== -1) {
            const c_end = document.cookie.indexOf(";", c_start + c_name.length + 1);
            return decodeURIComponent(document.cookie.substring(c_start + c_name.length + 1, c_end !== -1 ? c_end : document.cookie.length));
        }
        return "";
    }
    
    function getNick() {
        const match = /Welcome to DailyGammon, (.*?)\./i.exec(getHtml('/html/body/h2'));
        if (match) {
            setCookie('dgUserName', match[1], 365);
        }
        checkAvailableGame();
    }
    
    function getDarkerColor(h) {
        const R = Math.max(0, parseInt(h.substring(1, 3), 16) - 48);
        const G = Math.max(0, parseInt(h.substring(3, 5), 16) - 48);
        const B = Math.max(0, parseInt(h.substring(5, 7), 16) - 48);
        return `#${toHex(R)}${toHex(G)}${toHex(B)}`;
    }
    
    function toHex(N) {
        const hex = Math.max(0, Math.min(255, Math.round(N)).toString(16).toUpperCase());
        return hex.length === 1 ? `0${hex}` : hex;
    }
    
    function colorizeNick() {
        const nicktds = find("//td", XPList);
        const nickPattern = new RegExp(getCookie('dgUserName'));
        for (let tds = 1; tds < nicktds.snapshotLength; tds++) {
            if (nickPattern.exec(nicktds.snapshotItem(tds).firstChild.innerHTML)) {
                nicktds.snapshotItem(tds).bgColor = getDarkerColor(document.bgColor);
            }
        }
    }

    function checkAvailableGame() {
        const match = /There are no matches where you can move\./.exec(getHtml('/html/body'));
        if (match) {
            setTimeout(() => {
                document.location = '/bg/top';
            }, 5000);
        } else {
            const aList = find("//a", XPList);
            if (aList.snapshotLength === 21) {
                for (let ass = 1; ass < aList.snapshotLength; ass++) {
                    if (aList.snapshotItem(ass).innerHTML === "Play") {
                        document.location = aList.snapshotItem(ass).href;
                    }
                }
            }
        }
    }

    if (/\/bg\/top|\/bg\/login/.test(cPage) || /\/bg\/move/.test(cPage)) { 
        getNick(); 
    }
    if (/\/bg\/event\//.test(cPage)) { 
        colorizeNick(); 
    }
}

if (window.addEventListener) {
    window.addEventListener('load', dailyGammonTools, false);
} else {
    window.attachEvent('onload', dailyGammonTools);
}
