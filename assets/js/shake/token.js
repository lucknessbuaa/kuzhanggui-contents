define(function() {
    var token = localStorage.getItem("audience-token");
    if (!token) {
        token = new String(new Date().getTime());
        localStorage.setItem("audience-token", token);
    }

    return token
});