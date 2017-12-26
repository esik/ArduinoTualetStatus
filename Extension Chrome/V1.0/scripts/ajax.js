"use strict";

const READY_STATE = {
    UNSENT           : 0,
    OPENED           : 1,
    HEADERS_RECEIVED : 2,
    LOADING          : 3,
    DONE             : 4
};

let _ = {
    excluded_headers : [
        "content-length",
        "connection"
    ],

    /**
     * RAW AJAX call
     * @see: https://xhr.spec.whatwg.org/
     *
     * @param options array
     *  - url
     *  - method
     *  - async
     *  - data
     *  - dataType [auto, html, text, json, xml]
     *  - contentType
     *  - charset
     *  - headers
     *  - success
     *  - failure
     *  - onloadstart
     *  - onprogress
     *  - onabort
     *  - onerror
     *  - onload
     *  - ontimeout
     *  - onloadend
     * @returns {boolean}
     */
    ajax : function (options) {
        if (!options || !options.url) return false;
        options.method = options.method || "GET";
        options.async = options.async ? !!options.async : true;

        let xmlhttp = null;
        try {
            xmlhttp = new XMLHttpRequest();
            ["loadstart", "progress", "abort", "error", "load", "timeout", "loadend"].forEach((item/*, index, array*/) => {
                if (options["on" + item] && options["on" + item] instanceof Function) {
                    xmlhttp.addEventListener(item, options["on" + item], false);
                }
            });
            xmlhttp.onreadystatechange = (/*event*/) => {
                /*
                 * 0 - Unitialized
                 * 1 - Loading
                 * 2 - Loaded
                 * 3 - Interactive
                 * 4 - Complete
                 */
                if (xmlhttp.readyState === READY_STATE.DONE) {
                    if (xmlhttp.status === 200) {
                        if (options.success) {
                            let response = null;
                            if (options.dataType.indexOf("json") !== -1) {
                                response = JSON.parse("" + xmlhttp.response);
                            } else if (options.dataType.indexOf("xml") !== -1) {
                                response = xmlhttp.responseXML;
                            } else if (options.dataType.indexOf("plain") !== -1) {
                                response = xmlhttp.responseText;
                            } else {
                                switch (xmlhttp.responseType) {
                                    case "json":
                                        response = JSON.parse("" + xmlhttp.response);
                                        break;
                                    case "text":
                                        response = xmlhttp.responseText;
                                        break;
                                    case "":
                                    case "arraybuffer":
                                    case "blob":
                                    case "document":
                                    default:
                                        response = xmlhttp.response;
                                }
                            }
                            options.success(response, xmlhttp);
                        }
                    } else if (xmlhttp.status >= 400 || xmlhttp.status < 100) {
                        if (options.failure) {
                            options.failure(xmlhttp.response, xmlhttp);
                        }
                    }
                }
            };
            let data = null,
                contentType = options.contentType || null;
            if (options.data) {
                if (options.data instanceof Object) {
                    data = [];
                    Object.keys(options.data).forEach((item/*, index, array*/) => {
                        data.push(encodeURIComponent(item) + "=" + encodeURIComponent(options.data[item]));
                    });
                    data = data.join("&");
                    contentType = "application/x-www-form-urlencoded";
                } else {
                    data = "" + options.data;
                }
            }
            if (options.method === "GET" && data !== null && data.length > 0) {
                options.url += (options.url.indexOf("?") === -1 ? "?" : "&") + data;
            }
            /* xmlhttp.open
             *  - method
             *  - url
             *  - async
             *  - user
             *  - password
             */
            xmlhttp.open(options.method, options.url, options.async);
            if (options.headers && options.headers instanceof Object) {
                Object.keys(options.headers).forEach((item/*, index, array*/) => {
                    if (this.excluded_headers.indexOf(item.toLowerCase()) === -1) {
                        xmlhttp.setRequestHeader(item, options.headers[item]);
                    }
                });
            }
            if (contentType === null) {
                options.dataType = options.dataType || "html";
                switch (options.dataType) {
                    case "text":
                        contentType = "text/plain";
                        break;
                    case "json":
                        contentType = "text/json";
                        break;
                    case "xml":
                        contentType = "text/xml";
                        break;
                    case "html":
                    default :
                        contentType = "text/html";
                }
            }
            if (options.charset) {
                contentType += "; charset=" + encodeURIComponent(options.charset);
            }
            //xmlhttp.overrideMimeType(contentType);
            xmlhttp.setRequestHeader("Content-Type", contentType);
            xmlhttp.send(data);
        } catch (e) {
            if (options.failure) {
                options.failure("Message: " + e.message + "\nStack: " + e.stack, xmlhttp);
            }
            return false;
        }
        return true;
    }
};

/**
 * AJAX OPTIONS / GET / HEAD / POST / PUT / PATCH / DELETE / TRACE / CONNECT
 *
 * @param url
 * @param options
 *  - async
 *  - data
 *  - dataType [auto, html, text, json, xml]
 *  - contentType
 *  - charset
 *  - headers
 *  - onloadstart
 *  - onprogress
 *  - onabort
 *  - onerror
 *  - onload
 *  - ontimeout
 *  - onloadend
 * @param success
 * @param failure
 * @returns {boolean}
 */
["options", "get", "head", "post", "put", "patch", "delete", "trace", "connect", // HTTP
    "link", "unlink", "purge", "view",
    "propfind", "proppatch", "mkcol", "copy", "move", "lock", "unlock" // WebDAV
].forEach((item/*, index, array*/) => {

    /**
     * Form Data
     *
     * @param url
     * @param params
     * @param success
     * @param failure
     * @returns {*}
     */
    _[item] = _[item + "Form"] = function (url, params, success, failure) {
        if (!url) return false;
        if (params instanceof Function) {
            if (success && success instanceof Function) {
                failure = success;
            }
            success = params;
            params = {};
        }
        let options = {
            method   : item.toUpperCase(),
            url      : url,
            data     : params,
            dataType : "auto"
        };
        if (success && success instanceof Function) {
            options.success = success;
        }
        if (failure && failure instanceof Function) {
            options.failure = failure;
        }

        return this.ajax(options);
    };

    /**
     * Request Payload
     *
     * @param url
     * @param options
     * @param success
     * @param failure
     * @returns {*}
     */
    _[item + "Native"] = function (url, options, success, failure) {
        if (!url) return false;
        if (options instanceof Function) {
            if (success && success instanceof Function) {
                failure = success;
            }
            success = options;
            options = {};
        }
        options = options || {};
        options.method = item.toUpperCase();
        options.url = url;
        if (success && success instanceof Function) {
            options.success = success;
        }
        if (failure && failure instanceof Function) {
            options.failure = failure;
        }

        return this.ajax(options);
    };
});
