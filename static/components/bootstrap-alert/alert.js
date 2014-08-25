define(function(require) {
	require("jquery");

	return function($el, message, type) {
		$el.hide()
			.empty()
			.attr('class', 'alert alert-' + type)
			.html(message)
			.fadeIn();
	};
});
