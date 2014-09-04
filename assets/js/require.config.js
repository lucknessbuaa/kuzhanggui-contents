var require = {
    baseUrl: "/contents/static",
    paths: {
        'underscore': 'components/underscore/underscore.js',
        'jquery': 'components/jquery/jquery.min',
        'jquery.iframe-transport': 'components/jquery.iframe-transport/jquery.iframe-transport',
        'select2': 'components/select2/select2',
        'bootstrap': 'components/bootstrap/dist/js/bootstrap.min',
        'jquery-placeholder': 'components/jquery-placeholder/jquery.placeholder',
        'jquery.cookie': 'components/jquery.cookie/jquery.cookie',
        'jquery.serializeObject': 'components/jQuery.serializeObject/dist/jquery.serializeObject.min',
        'django-csrf-support': 'components/django-csrf-support/index',
        'underscore': 'components/underscore/underscore',
        'multiline': 'components/multiline/browser',
        'backbone': 'components/backbone',
        'shake': 'components/shake.js/shake',
        'ajax_upload': 'ajax_upload/js/ajax-upload-widget',
        'swiper': 'components/swiper/dist/idangerous.swiper.min',
        'velocity': 'components/velocity/jquery.velocity.min',
        'wechat-share': 'components/wechat-share/browser',
        'ckeditor': 'ckeditor/ckeditor',
        'options':'js/options',
        'login': 'js/login',
        'moment':'components/moment/moment',
        'promotion': 'js/promotion/promotion',
        'bootstrap-datetimepicker': "components/smalot-bootstrap-datetimepicker/js/bootstrap-datetimepicker.min",
    },
    shim: {
        'jquery-placeholder': {
            deps: ['jquery']
        },
        'jquery.serializeObject': {
            deps: ['jquery']
        },
        'velocity': {
            deps: ['jquery']
        },
        'select2': {
            deps: ['jquery']
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'jquery.cookie': {
            deps: ['jquery']
        },
        'jquery.iframe-transport': {
            deps: ['jquery']
        },
        'ajax_upload': {
            deps: ['jquery', 'jquery.iframe-transport']
        },
        'bootstrap-datetimepicker': {
            deps: ['jquery', 'bootstrap']
        }   
    }
};
