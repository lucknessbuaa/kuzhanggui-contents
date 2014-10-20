define(function() {
    function AuthFailure() {}

    function InternalError() {}

    function UnknownError() {}

    function FormInvalidError() {}

    function NetworkError() {}

    return {
        AuthFailure: AuthFailure,
        InternalError: InternalError,
        NetworkError: NetworkError,
        FormInvalidError: FormInvalidError
    };
});