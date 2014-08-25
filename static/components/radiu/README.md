#radiu
>utilities to get and set radio buttons' value

##usage

```html
<form id='radiu'>
	<input type='radio' name='test' value='1' checked>
	<input type='radio' name='test' value='2'>
</form>
```

```javascript
define(function(require) {
	var radiu = require("radiu");

	$(function() {
		var $radio = $("#radiu [name=test]");
		radiu.value($radio)
		// result --> 1

		radiu.check($radio, '2');
		radiu.value($radio)
		// result --> 2
	});
});
```
