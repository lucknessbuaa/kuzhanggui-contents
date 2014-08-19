define(function(require) {
    require("jquery");
    var codes = require("js/codes");
    var errors = require("js/errors");
    var _ = require("underscore");

    var select2_tip_options = {
        formatSearching: function() {
            return "搜索中...";
        },
        formatNoMatches: function() {
            return "没有搜索结果";
        },
    };

    function reload(delay) {
        setTimeout(function() {
            window.location.reload();
        }, delay || 2000);
    }

    function delay(fn, millies) {
        return function() {
            var args = arguments;
            if (_.isFunction(fn)) {
                setTimeout(_.bind(fn, window, args), millies || 2000);
            }
        }
    }

    function mapErrors(result, fn) {
        switch (result.ret_code) {
            case codes.AuthFailure:
                throw new errors.AuthFailure();
            case codes.FormInvalid:
                throw new errors.FormInvalidError();
        }

        return _.isFunction(fn) ? fn.call(null, result) : result;
    }

    function throwNetError() {
        throw new errors.NetworkError();
    }

    function handleErrors(err) {
        var handlers = Array.prototype.slice.call(arguments, 1);
        for (var i = 0; i < handlers.length; i++) {
            var handler = handlers[i];
            if (handler.call(null, err) === true) {
                break;
            }
        }
    }

    return {
        select2_tip_options: select2_tip_options,
        reload: reload,
        mapErrors: mapErrors,
        throwNetError: throwNetError,
        handleErrors: handleErrors
    };
});