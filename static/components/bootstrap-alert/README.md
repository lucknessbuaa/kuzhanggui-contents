#bootstrap-alert
> shortcut to show message using bootstrap's alert

#install

```Bash
$ bower install bootstrap-alert
```

#usage

```html
<p class='alert'></p>
```

```javascript
define(function(require) {
	require("jquery");
	var alert = require("bootstrap-alert");

	$(function() {
		var $el = $(".alert");
		alert($el, 'Error!', 'danger');
		alert($el, 'Succeed!', 'success');
	});
});
```
