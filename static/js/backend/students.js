define(function(require) {
    require('jquery');
    require('bootstrap');
    require('jquery-placeholder');
    require('django-csrf-support');
    var multiline = require("multiline");
    var when = require('components/when/when');
    var _ = require("underscore");

    require('ajax_upload');
    var utils = require('js/utils');
    var handleErrors = utils.handleErrors;
    var modals = require('js/modals');
    var formProto = require("js/formProto");
    var vaFormProto = require("js/formValidationProto");


    function addStudent(name, avatar) {
        return when($.post("/backend/students/add", {
            name: name,
            avatar: avatar
        }, "json")).then(utils.mapErrors, utils.throwNetError);
    }

    function editStudent(pk, name, avatar) {
        return when($.post("/backend/students/edit", {
            pk: pk,
            name: name,
            avatar: avatar
        }, "json")).then(utils.mapErrors, utils.throwNetError);
    }

    function deleteStudent(pk) {
        return when($.post("/backend/students/delete", {
            pk: pk
        }, "json")).then(utils.mapErrors, utils.throwNetError);
    }

    function startPlaying(pk) {
        return when($.post("/backend/students/play", {
            pk: pk
        }, "json")).then(utils.mapErrors, utils.throwNetError);
    }

    function stopPlaying() {
        return when($.post("/backend/students/stop", {}, "json"))
            .then(utils.mapErrors, utils.throwNetError);
    }

    var StudentForm = Backbone.View.extend(_.extend({}, formProto, vaFormProto, {
        initialize: function() {
            this.setElement($(StudentForm.tpl())[0]);
            this.$alert = this.$("div.alert");
            this.ajaxUploadWidget = new AjaxUploadWidget(this.el.avatar, {
                'changeButtonText': '修改',
                'removeButtonText': '删除'
            });
        },

        setStudent: function(student) {
            _.each(['pk', 'name', 'avatar'], _.bind(function(attr) {
                $(this.el[attr]).val(student[attr]).trigger('change');
            }, this));
        },

        bind: function(data) {},

        onShow: function() {},

        onHide: function() {
            var defaults = {
                'pk': '',
                'name': '',
                'avatar': ''
            };
            _.each(['pk', 'name', 'avatar'], _.bind(function(attr) {
                $(this.el[attr]).val(defaults[attr]).trigger('change');
            }, this));
            this.clearErrors();
            this.ajaxUploadWidget.abort();
        },

        save: function() {
            var onComplete = _.bind(function() {
                this.trigger('save');
            }, this);


            if (this.el.name.value === '') {
                this.addError('name', '学员姓名不能为空');
                return setTimeout(onComplete, 0);
            }

            if (this.el.avatar.value === '') {
                this.addError('avatar', '学员头像不能为空');
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
                this.tip('操作成功', 'success');
                utils.reload(500);
            }, this);

            if (this.el.pk.value !== "") {
                editStudent(this.el.pk.value, this.el.name.value, this.el.avatar.value)
                    .then(onFinish, onReject)
                    .ensure(onComplete);
            } else {
                addStudent(this.el.name.value, this.el.avatar.value)
                    .then(onFinish, onReject)
                    .ensure(onComplete);
            }
        }
    }));

    $(function() {
        StudentForm.tpl = _.template($("#form_tpl").html().trim());

        var form = new StudentForm();
        var modal = new modals.FormModal();
        modal.setForm(form);
        $(modal.el).appendTo(document.body);

        $create = $("#create-student");
        $create.click(function() {
            modal.show();
            modal.setTitle('创建学员信息');
            modal.setSaveText("创建", "创建中...");
        });


        $("table").on("click", ".edit", function() {
            modal.setTitle('编辑学员信息');
            modal.setSaveText("保存", "保存...");
            var student = $(this).parent().data();
            form.setStudent(student);
            modal.show();
        });
    });

    $(function() {
        var modal = new modals.ActionModal();
        modal.setAction(function(pk) {
            return deleteStudent(pk).then(function() {
                utils.reload(500);
            }, function(err) {
                if (err instanceof errors.AuthFailure) {
                    window.location = "/welcome";
                }

                throw err;
            });
        });
        modal.setTitle('删除学员信息');
        modal.tip('确定要删除吗？');
        modal.setSaveText('删除', '删除...');
        modal.on('succeed', function() {
            utils.reload(500);
        });
        $("table").on("click", ".delete", function() {
            modal.setId($(this).parent().data('pk'));
            modal.show();
        });
    });

    $(function() {
        var tpl = _.template(multiline(function() {
            /*@preserve
        <div class="modal fade">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-body">
                    <div class='loader'>
                        <img src='/static/img/loading.gif'>
                    </div>
                    <div class='alert' style='margin-bottom: 0px;display: none'></div> 
                </div>
            </div>
        </div>
        </div>
        */
            console.log
        }));
        var $loading = $(tpl().trim());

        $loading.clear = function() {
            $loading.find('.alert')
                .hide()
                .removeClass('danger')
                .removeClass('success')
                .empty('');
            $loading.find('.loader').show();
        }
        $loading.tip = function(type, content) {
            $loading.clear();
            $loading.find('.loader').hide();
            $loading.find('.alert').addClass('alert-' + type).html(content).fadeIn();
        };
        $loading.appendTo(document.body);
        $loading.modal('hide');
        $loading.on('hidden', function() {
            $loading.clear();
            $loading.modal('hide')
        });

        $("table").on("click", ".turn", function() {
            var $this = $(this);
            $loading.modal('show');
            $loading.modal('lock');
            startPlaying($this.parent().data('pk')).then(function() {
                $loading.tip('success', '操作成功');
                utils.reload(1000);
            }, function() {
                $loading.tip('danger', '操作失败！');
            }).ensure(function() {
                $loading.modal('unlock');
            });
        });

        $("#stop-student").click(function() {
            $loading.modal('show');
            $loading.modal('lock');
            stopPlaying().then(function() {
                $loading.tip('success', '操作成功');
                utils.reload(500);
            }, function() {
                $loading.tip('danger', '操作失败！');
            }).ensure(function() {
                $loading.modal('unlock');
            });
        });
    });
});