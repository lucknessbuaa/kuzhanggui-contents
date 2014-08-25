define(function(require) {
    require('jquery');
    require('bootstrap');
    require('jquery-placeholder');
    require('django-csrf-support');

    var $form = null;
    var form = null;
    var $submit = null;
    var $tip = null;

    function tip(message) {
        $tip.html(message).hide().fadeIn();
    }

    function login(username, password) {
        return $.post("/votes/login", {
            username: username,
            password: password
        }, 'json').then(function(result) {
            return result.ret_code === 0;
        });
    }

    $(function() {
        $form = $("form");
        $form.find("#password, #username").placeholder();
        $tip = $form.find(".alert-danger");
        form = $form[0];
        $submit = $("#submit");
        $form.submit(function(e) {
            e.preventDefault();

            var username = form.username.value;
            var password = form.password.value;
            $submit.button('loading');
            login(username, password).then(function(authenticated) {
                if (!authenticated) {
                    return tip("用户名或密码不正确");
                }

                window.location = "welcome";
            }, function() {
                return tip("网络异常");
            }).always(function() {
                $submit.button('reset');
            });
        });
    });
});
