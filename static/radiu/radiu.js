define(function(require) {
    require("jquery");

    function check($el, value) {
        $el.each(function() {
            $(this).prop('checked', this.value === value);
        });
    }

    function value($el) {
        return $el.filter(":checked").val();
    }

    return {
        check: check,
        value: value
    };
});
