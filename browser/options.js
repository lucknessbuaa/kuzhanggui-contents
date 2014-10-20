var $ = require('jquery');
require('bootstrap');
require("bootstrap-datetimepicker");
require('jquery-placeholder');
require('node-django-csrf-support')();
require("select2");

require('ajax_upload');

var Backbone = require("backbone");
Backbone.$ = $;

var moment = require("moment");
var _ = require("underscore");
var modals = require('kuzhanggui-modals');
var formProto = require("kuzhanggui-formix");
var $form, form;

function reload(delay) {
    setTimeout(function() {
        window.location.reload();
    }, delay || 0);
}

var begin = moment(moment().subtract(7, 'days').calendar(), "MM/DD/YYYY").valueOf() / 1000;
var end = moment(moment().format("YYYY-MM-DD"), "YYYY-MM-DD").valueOf() / 1000;
var option_name, option_id;

var Highcharts = require('highcharts');
window.CKEDITOR_BASEPATH = '/contents/static/components/ckeditor/';
var CKEDITOR = require('ckeditor');

function getData() {
    return $.post("/contents/API/chart", {
        'date_begin': begin,
        'date_end': end,
        'option_id': option_id
    }, "json");
}

function makeChart() {
    getData().then(function(data) {
        var chart = null;
        $("#container").ready(function() {
            chart = new Highcharts.Chart({
            chart: {
                        renderTo: 'container'
            },
            title: {
                text: '「' + option_name + '」',
                x: -20 //center
            },
            subtitle: {
                text: 'uv、pv统计',
                x: -20
            },
            xAxis: {
                categories: data.date
            },
            yAxis: {
                title: {
                    text: '总数'
                },
                min: 0,
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            credits: {
                enabled: false
            },
            tooltip: {
                valueSuffix: ''
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            },
            series: [{
                name: '用户数量',
                data: data.user
            }, {
                name: '访问数量',
                data: data.visit
            }]
        });

    });
    })
}

function addOption(name, image, type, description, contents, url) {
    return $.post("addopt", {
        name: name,
        type: type,
        image: image,
        description: description,
        contents: contents,
        url: url
    }, "json");
}

function editOption(pk, name, image, type, description, contents, url) {
    return $.post("editopt", {
        pk: pk,
        name: name,
        image: image,
        type: type,
        description: description,
        contents: contents,
        url: url
    }, "json");
}

function deleteOption(pk) {
    return $.post("deleteopt", {
        pk: pk
    }, "json");
}

function addBigpicture(name, image, contents, url) {
    return $.post("addbp", {
        name: name,
        image: image,
        contents: contents,
        url: url
    }, "json");
}

function editBigpicture(pk, name, image, contents, url) {
    return $.post("editbp", {
        pk: pk,
        name: name,
        image: image,
        contents: contents,
        url: url
    }, "json");
}

function deleteBigpicture(pk) {
    return $.post("deletebp", {
        pk: pk
    }, "json");
}


var StudentForm = Backbone.View.extend(_.extend({}, formProto, {
    initialize: function() {
        this.setElement($(StudentForm.tpl())[0]);
        this.$alert = this.$("div.alert");
        this.ajaxUploadWidget = new AjaxUploadWidget(this.el.image, {
            'changeButtonText': '修改',
            'removeButtonText': '删除'
        });
    },
    events: {
        'click input[name=name]' : "remove_error_msg",
        'click input[name=url]'  : 'remove_error_msg',
        'click textarea[name=description]' : "remove_error_msg",
        'click input[id=id_image]' : 'remove_error_msg'
    },
    remove_error_msg: function(event) {
        this.clearError($(event.currentTarget));
    },

    setStudent: function(student) {
        _.each(['pk', 'type', 'name', 'image', 'description', 'contents', 'url'], _.bind(function(attr) {
            if (attr === 'contents') {
                CKEDITOR.instances.id_contents.setData(student[attr])
            } else
            if (attr === 'image')
                $(this.el[attr]).val(student[attr]).trigger('change');
            else {
                $(this.el[attr]).val(student[attr]).trigger('change');
            }
        }, this));
    },

    bind: function(data) {},

    onShow: function() {},

    onHide: function() {
        var defaults = {
            'pk': '',
            'type': '',
            'name': '',
            'image': '',
            'description': '',
            'contents': '',
            'url': '',
        };
        _.each(['pk', 'type', 'name', 'image', 'description', 'contents', 'url'], _.bind(function(attr) {
            if (attr === 'contents') CKEDITOR.instances.id_contents.setData(defaults[attr]);
            else $(this.el[attr]).val(defaults[attr]).trigger('change');
        }, this));
        this.clearErrors(['pk', 'type', 'name', 'image', 'description', 'contents', 'url']);
        this.ajaxUploadWidget.abort();
        $(".al").css({
            "display": "None"
        });
    },

    save: function() {
        var onComplete = _.bind(function() {
            this.trigger('save');
        }, this);

        this.el.type = type;
        this.el.contents.value = CKEDITOR.instances.id_contents.getData();

        if (this.el.name.value === '') {
            this.addError(this.el.name, '名称不能为空');
            return this.trigger('save');
        }

        if (this.el.image.value === '') {
            this.addError(this.el.image, '封面不能为空');
            return this.trigger('save');
        }

        if (this.el.description.value === '' && this.el.type === 3) {
            this.addError(this.el.description, '描述不能为空');
            return this.trigger('save');
        }

        if (this.el.url.value === '' && this.el.type === 3) {
            this.addError(this.el.url, '链接不能为空');
            return this.trigger('save');
        }

        if (this.el.contents.value === '' && this.el.type === 1) {
            this.addError(this.el.contents, '内容不能为空');
            return this.trigger('save');
        }

        var onReject = _.bind(function(err) {
            this.tip('网络异常', 'success');
        }, this);

        var onFinish = _.bind(function() {
            this.tip('操作成功!', 'success');
            reload(500);
        }, this);

        if (this.el.pk.value !== "") {
            editOption(this.el.pk.value, this.el.name.value, this.el.image.value, this.el.type,
                this.el.description.value, this.el.contents.value, this.el.url.value)
                .then(onFinish, onReject)
                .always(onComplete);
        } else {
            addOption(this.el.name.value, this.el.image.value, this.el.type,
                this.el.description.value, this.el.contents.value, this.el.url.value)
                .then(onFinish, onReject)
                .always(onComplete);
        }
    }
}));

var ChartForm = Backbone.View.extend(_.extend({}, formProto, {
    initialize: function() {
        this.setElement($(ChartForm.tpl())[0]);
        this.$alert = this.$("div.alert");
        this.ajaxUploadWidget = new AjaxUploadWidget(this.el.image, {
            'changeButtonText': '修改',
            'removeButtonText': '删除'
        });
    },
    events: {
        'click input[name=name]' : "remove_error_msg",
    },
    remove_error_msg: function(event) {
        this.clearError($(event.currentTarget));
    },

    setStudent: function(student) {
        _.each(['pk', 'start', 'end'], _.bind(function(attr) {
            if (attr === 'start') {
                $(this.el[attr]).val(begin)
            }
            $(form1.start).val(moment(moment().subtract(7, 'days').calendar()).format("YYYY-MM-DD"));
            $(form1.stop).val(moment().format("YYYY-MM-DD"), "YYYY-MM-DD");
        }, this));
    },

    bind: function(data) {},

    onShow: function() {},

    onHide: function() {
        var defaults = {
            'pk': '',
        };
        _.each(['pk', 'start', 'end'], _.bind(function(attr) {
            if (attr === 'contents') CKEDITOR.instances.id_contents.setData(defaults[attr]);
            else $(this.el[attr]).val(defaults[attr]).trigger('change');
        }, this));
    },

    save: function() {
        var onComplete = _.bind(function() {
            this.trigger('save');
        }, this);

        this.el.type = type;
        this.el.contents.value = CKEDITOR.instances.id_contents.getData();

        if (this.el.name.value === '') {
            this.addError(this.el.name, '名称不能为空');
            return setTimeout(onComplete, 0);
        }
        var onReject = _.bind(function(err) {
            handleErrors(err,
                _.bind(this.onAuthFailure, this),
                _.bind(this.onCommonErrors, this),
                _.bind(this.onUnknownError, this)
            );
        }, this);

        var onFinish = _.bind(function() {
            this.tip('操作成功!', 'success');
            reload(500);
        }, this);

        if (this.el.pk.value !== "") {
            editOption(this.el.pk.value, this.el.name.value, this.el.image.value, this.el.type,
                this.el.description.value, this.el.contents.value, this.el.url.value)
                .then(onFinish, onReject)
                .ensure(onComplete);
        } else {
            addOption(this.el.name.value, this.el.image.value, this.el.type,
                this.el.description.value, this.el.contents.value, this.el.url.value)
                .then(onFinish, onReject)
                .ensure(onComplete);
        }
    }
}));

var BigpictureForm = Backbone.View.extend(_.extend({}, formProto, {

    events: {
        'click input[id=id_name]' : "remove_error_msg",
        'click input[name=url]' : "remove_error_msg",
        'click input[id=id_image]' : 'remove_error_msg',

    },
    remove_error_msg: function(event) {
        this.clearError($(event.currentTarget));
    },
    initialize: function() {
        this.setElement($(BigpictureForm.tpl())[0]);
        this.$alert = this.$("div.alert");
        $(this.el['contents']).select2();
        this.ajaxUploadWidget = new AjaxUploadWidget(this.el.image, {
            'changeButtonText': '修改',
            'removeButtonText': '删除'
        });
    },

    setStudent: function(student) {
        _.each(['pk', 'name', 'image', 'contents', 'url'], _.bind(function(attr) {
            if (attr === 'image')
                $(this.el[attr]).val(student[attr]).trigger('change');
            else
            if (attr === 'contents') {
                if (student[attr] === '') {
                    $("#check-url").prop('checked', true);
                    $("#change-url").css({
                        "display": "block"
                    });
                    $("#change-content").css({
                        "display": "None"
                    });
                    $("#change-content").select2('val', '');
                } else
                    $(this.el[attr]).select2('val', student[attr]);
            } else {
                $(this.el[attr]).val(student[attr]).trigger('change');
            }
        }, this));
    },

    bind: function(data) {},

    onShow: function() {},

    onHide: function() {
        var defaults = {
            'pk': '',
            'name': '',
            'image': '',
            'contents': '',
            'url': '',
        };
        _.each(['pk', 'name', 'image', 'contents', 'url'], _.bind(function(attr) {
            if (attr == 'contents') {
                $(this.el[attr]).select2('val', '');
            }
            $(this.el[attr]).val(defaults[attr]).trigger('change');
        }, this));
        this.clearErrors(['pk', 'name', 'image', 'contents', 'url']);
        this.ajaxUploadWidget.abort();
    },

    save: function() {
        var onComplete = _.bind(function() {
            this.trigger('save');
        }, this);


        if (this.el.name.value === '') {
            this.addError(this.el.name, '名称不能为空');
            return setTimeout(onComplete, 0);
        }

        if (this.el.image.value === '') {
            this.addError(this.el.image, '图片不能为空');
            return setTimeout(onComplete, 0);
        }

        if ($("#check-content").is(":checked"))
            if (this.el.contents.value === '') {
                this.addError(this.el.contents, '内容不能为空');
                return setTimeout(onComplete, 0);
            } else
                this.el.url.value = '';
        if ($("#check-url").is(":checked"))
            if (this.el.url.value === '') {
                this.addError(this.el.url, '连接不能为空');
                return setTimeout(onComplete, 0);
            } else
                this.el.contents.value = '';
        var onReject = _.bind(function(err) {
            handleErrors(err,
                _.bind(this.onAuthFailure, this),
                _.bind(this.onCommonErrors, this),
                _.bind(this.onUnknownError, this)
            );
        }, this);
        var onFinish = _.bind(function() {
            this.tip('操作成功!', 'success');
            reload(500);
        }, this);

        if (this.el.pk.value !== "") {
            editBigpicture(this.el.pk.value, this.el.name.value, this.el.image.value,
                this.el.contents.value, this.el.url.value)
                .then(onFinish, onReject)
                .always(onComplete);
        } else {
            addBigpicture(this.el.name.value, this.el.image.value,
                this.el.contents.value, this.el.url.value)
                .then(onFinish, onReject)
                .always(onComplete);
        }
    }
}));

$(function() {
    StudentForm.tpl = _.template($("#form_tpl").html().trim());

    var form = new StudentForm();
    var modal = new modals.FormModal({
        size: 'large'
    });
    modal.setForm(form);
    $(modal.el).appendTo(document.body);
    CKEDITOR.replace("id_contents", {
        // "filebrowserWindowWidth": 940,
        "toolbar_Basic": [
            ["Source", "-", "Bold", "Italic"]
        ],
        "toolbar_Full": [
            ["Styles", "Format", "Bold", "Italic", "Underline", "Strike", "SpellChecker", "Undo", "Redo"],
            ["Image", "Flash", "Table", "HorizontalRule"],
            ["TextColor", "BGColor"],
            ["Smiley", "SpecialChar"],
            ["Source"]
        ],
        "filebrowserUploadUrl": "/ckeditor/upload/",
        // "height": 300,
        // "width": 650,
        "filebrowserBrowseUrl": "/ckeditor/browse/",
        "skin": "bootstrap-skin-ckeditor",
        // "filebrowserWindowHeight": 725,
        "toolbar": "Full",
        language:"zh-cn",
        removePlugins : 'wordcount, symbol, oembed'


    });

    $create = $("#create-article");
    $create.click(function() {
        $(".ar").css({
            "display": "block"
        });
        type = 1;
        modal.show();
        modal.setTitle('创建资讯');
        modal.setSaveText("创建", "创建...");
    });
    $create2 = $("#create-image");
    $create2.click(function() {
        $(".im").css({
            "display": "block"
        });
        type = 2;
        modal.show();
        modal.setTitle('创建图片');
        modal.setSaveText("创建", "创建...");
    });
    $create3 = $("#create-video");
    $create3.click(function() {
        $(".vi").css({
            "display": "block"
        });
        $("#vi-required").addClass('required');
        type = 3;
        modal.show();
        modal.setTitle('创建视频');
        modal.setSaveText("创建", "创建...");
    });

    $("table").on("click", ".edit", function() {
        var student = $(this).parent().data();
        var name;
        if (student.type === 1) {
            type = 1;
            name = '资讯';
            $(".ar").css({
                "display": "block"
            });
        } else
        if (student.type === 2) {
            type = 2;
            name = '图片';
            $(".im").css({
                "display": "block"
            });
        } else
        if (student.type === 3) {
            type = 3;
            name = '视频';
            $(".vi").css({
                "display": "block"
            });
            $("#vi-required").addClass('required');
        }
        modal.setTitle('编辑' + name);
        modal.setSaveText("保存", "保存...");
        var student = $(this).parent().data();
        form.setStudent(student);
        modal.show();
    });
});

$(function() {
    var modal = new modals.ActionModal();
    modal.setAction(function(pk) {
        return deleteOption(pk).then(function() {
            reload(500);
        }, function(err) {
            if (err instanceof errors.AuthFailure) {
                window.location = "/welcome";
            }

            throw err;
        });
    });
    modal.setTitle('删除内容');
    modal.tip('确定要删除吗?');
    modal.setSaveText('删除', '删除...');
    modal.on('succeed', function() {
        reload(500);
    });
    $("table").on("click", ".delete", function() {
        modal.setId($(this).parent().data('pk'));
        modal.show();
    });
});

$(function() {
    ChartForm.tpl = _.template($("#form_tpl3").html().trim());

    var form = new ChartForm();
    var modal = new modals.FormModal({
        size: 'large'
    });
    modal.$save.hide();
    modal.setForm(form);
    $(modal.el).appendTo(document.body);
    $("table").on("click", ".data", function() {
        var student = $(this).parent().data();

        var name = student.name;
        var pk = student.pk;
        option_id = pk;
        option_name = name;
        begin = moment(moment().subtract(7, 'days').calendar(), "MM/DD/YYYY").valueOf() / 1000;
        end = moment(moment().format("YYYY-MM-DD"), "YYYY-MM-DD").valueOf() / 1000;
        $form1 = $("form.form-inline");
        form1 = $form1[0];

        $(form1.start).datetimepicker({
            maxView: 2,
            minView: 2,
            viewSelect: 'month',
            format: 'yyyy-mm-dd'
        });
        $(form1.stop).datetimepicker({
            maxView: 2,
            minView: 2,
            viewSelect: 'month',
            format: 'yyyy-mm-dd'
        });

        $(form1.start).val(moment(moment().subtract(7, 'days').calendar()).format("YYYY-MM-DD"));
        $(form1.stop).val(moment().format("YYYY-MM-DD"), "YYYY-MM-DD");

        $(form1.stop).datetimepicker('setEndDate', moment().format("YYYY-MM-DD"));
        $(form1.start).datetimepicker('setEndDate', $(form1.stop).val());


        $(form1.start).change(function() {
            begin = moment($(form1.start).val(), "YYYY-MM-DD").valueOf() / 1000;
        });
        $(form1.stop).change(function() {
            end = moment($(form1.stop).val(), "YYYY-MM-DD").valueOf() / 1000;
        });

        $("#datebutton").on('click', function() {
            option_name = name;
            option_id = pk;


            if (begin > end) {
                begin = end;
                $(form1.start).val($(form1.stop).val());
            }
            if (Math.abs(moment(begin*1000).diff(moment(end*1000), 'days')) > 30)
            {
                var errorList = $(this).siblings('ul');
                errorList.empty();
                $("<li>30 days at most</li>").appendTo(errorList);
                errorList.fadeIn();

            }
            else
            {
                var errorList = $(this).siblings('ul');
                errorList.empty()
                errorList.hide();
                makeChart();
            }
        })
        var errorList = $("#datebutton").siblings('ul');
        errorList.empty()
        errorList.hide();


        var myDate = new Date();
        makeChart();
        modal.setTitle('数据报表');
        modal.setSaveText("保存", "保存...");
        form.setStudent(student);
        modal.show();
    });
});

$(function() {
    BigpictureForm.tpl = _.template($("#form_tpl2").html().trim());

    var form = new BigpictureForm();
    var modal = new modals.FormModal();
    modal.setForm(form);
    $(modal.el).appendTo(document.body);

    $(".field").change(function() {
        if ($("#check-content").is(":checked")) {
            $("#change-content").css({
                "display": "block"
            });
            $("#change-url").css({
                "display": "None"
            });
            $("#change-url").val("")
        }
        if ($("#check-url").is(":checked")) {
            $("#change-url").css({
                "display": "block"
            });
            $("#change-content").css({
                "display": "None"
            });
            $("#change-content").select2('val', '');
        }
    });

    $create = $("#create-bigpicture");
    $create.click(function() {
        modal.show();
        modal.setTitle('创建焦点图');
        modal.setSaveText("创建", "创建...");
    });
    $create = $("#create-bigpicture2");
    $create.click(function() {
        modal.show();
        modal.setTitle('创建焦点图');
        modal.setSaveText("创建", "创建...");
    });
    $("table").on("click", ".bpedit", function() {
        var student = $(this).parent().data();
        modal.setTitle('编辑焦点图');
        modal.setSaveText("保存", "保存...");
        form.setStudent(student);
        modal.show();
    });
});

$(function() {
    var modal = new modals.ActionModal();
    modal.setAction(function(pk) {
        return deleteBigpicture(pk).then(function() {
            reload(500);
        }, function(err) {
            if (err instanceof errors.AuthFailure) {
                window.location = "/welcome";
            }

            throw err;
        });
    });
    modal.setTitle('删除焦点图');
    modal.tip('确定要删除吗?');
    modal.setSaveText('删除', '删除...');
    modal.on('succeed', function() {
        reload(500);
    });
    $("table").on("click", ".bpdelete", function() {
        modal.setId($(this).parent().data('pk'));
        modal.show();
    });
});
