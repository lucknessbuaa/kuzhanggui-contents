define(function(require) {
    require("jquery");
    var _ = require("underscore");

    return {
        addError: function(el, msg) {
            var $errorList = $(el).siblings('ul.parsley-error-list');
            $errorList.empty();
            $("<li>" + msg + "</li>").appendTo($errorList);
            $errorList.fadeIn();
        },

        clearError: function(el) {
            var $errorList = $(el).siblings('ul.parsley-error-list');
            $errorList.empty().hide();
        },

        clearErrors: function(fields) {
            _.each(fields, _.bind(function(field) {
                this.clearError(this.el[field]);
            }, this));
        }
    };
});