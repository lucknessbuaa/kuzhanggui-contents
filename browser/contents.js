var $ = require('jquery');

require('node-django-csrf-support')();
var Backbone = require('backbone');
Backbone.$ = $;
var multiline = require("multiline");
var _ = require("underscore");
var modals = require('kuzhanggui-modals');
var formProto = require('kuzhanggui-formix');

function reload(delay) {
    setTimeout(function() {
        window.location.reload();
    }, delay || 0);
}

function addVote(name, pd1, pd2, pd3, pd4) {
    return $.post("/contents/backend/add", {
        name: name,
        spt_bp: pd1,
        spt_ar: pd2,
        spt_im: pd3,
        spt_vi: pd4
    }, "json");
}

function editVote(pk, name, pd1, pd2, pd3, pd4) {
    return $.post("/contents/backend/edit", {
        pk: pk,
        name: name,
        spt_bp: pd1,
        spt_ar: pd2,
        spt_im: pd3,
        spt_vi: pd4
    }, "json");
}

function deleteVote(pk) {
    return $.post("/contents/backend/delete", {
        pk: pk
    }, "json");
}

var VoteFormTpl = _.template(multiline(function() {
    /*@preserve
        <form role="form" class="form form-horizontal">
            <input type="hidden" name="pk">
            <div class="alert" style="display: none"></div>
            <div class="form-group">
                <div class="col-sm-4 control-label required">
                    <label for="id_name">名称</label>
                </div>
                <div class="col-sm-6">
                    <input type="text" id="id_name" class="form-control" 
                        name="name" maxlength=20>
                </div>
            </div> 
            <div class="form-group">
                <div class="col-sm-4 control-label">
                    <label for="id_name"></label>
                </div>
                <div class="col-sm-6">
                    <div class="checkbox">
                        <label>
                            <input type="checkbox" id="spt_bp" name="spt_bp">支持焦点图
                        </label>
                    </div>
                </div>
            </div>  
            <div class="form-group">
                <div class="col-sm-4 control-label">
                    <label for="id_name"></label>
                </div>
                <div class="col-sm-6">
                    <div class="checkbox">
                        <label>
                            <input type="checkbox" id="spt_ar" name="spt_ar">支持新闻
                        </label>
                    </div>
                </div>
            </div>  
            <div class="form-group">
                <div class="col-sm-4 control-label">
                    <label for="id_name"></label>
                </div>
                <div class="col-sm-6">
                    <div class="checkbox">
                        <label>
                            <input type="checkbox" id="spt_im" name="spt_im">支持图片
                        </label>
                    </div>
                </div>
            </div>  
            <div class="form-group">
                <div class="col-sm-4 control-label">
                    <label for="id_name"></label>
                </div>
                <div class="col-sm-6">
                    <div class="checkbox">
                        <label>
                            <input type="checkbox" id="spt_vi" name="spt_vi">支持视频
                        </label>
                    </div>
                </div>
            </div>              
        </form>
         */
    console.log
}).trim());

var VoteForm = Backbone.View.extend(_.extend(formProto, {
    initialize: function() {
        this.setElement($(VoteFormTpl())[0]);
        this.$alert = this.$("div.alert");
    },

    setVote: function(vote) {
        _.each(['pk', 'name', 'spt_bp', 'spt_ar', 'spt_im', 'spt_vi'], _.bind(function(attr) {
            if (attr == 'pk' || attr == 'name') {
                $(this.el[attr]).val(vote[attr]).trigger('change');
            } else {
                this.el[attr].checked = vote[attr];
            }

        }, this));
    },

    bind: function(data) {},

    onShow: function() {},

    onHide: function() {
        var defaults = {
            'pk': '',
            'name': '',
            'spt_bp': '',
            'spt_ar': '',
            'spt_im': '',
            'spt_vi': '',
        };
        _.each(['pk', 'name', 'spt_bp', 'spt_ar', 'spt_im', 'spt_vi'], _.bind(function(attr) {
            $(this.el[attr]).val(defaults[attr]).trigger('change');
        }, this));
        this.clearErrors();
    },

    isBPEnabled: function() {
        return this.el.spt_bp.checked;
    },

    isArticleEnabled: function() {
        return this.el.spt_ar.checked;
    },

    isVideoEnabled: function() {
        return this.el.spt_vi.checked;
    },

    isImageEnabled: function() {
        return this.el.spt_im.checked;
    },

    save: function() {
        var onComplete = _.bind(function() {
            this.trigger('save');
        }, this);

        if (this.el.name.value === '') {
            this.addError('name', 'Name is required');
            return;
        }

        var onReject = _.bind(function() {
            this.tip('系统异常！', 'error');
        }, this);

        var onFinish = _.bind(function() {
            this.tip('操作成功!', 'success');
            reload(500);
        }, this);

        if (this.el.pk.value !== "") {
            editVote(this.el.pk.value, this.el.name.value, this.isBPEnabled(),
                this.isArticleEnabled(), this.isImageEnabled(), this.isVideoEnabled())
                .then(onFinish, onReject)
                .always(onComplete);
        } else {
            addVote(this.el.name.value, this.isBPEnabled(), this.isArticleEnabled(),
                this.isImageEnabled(), this.isVideoEnabled())
                .then(onFinish, onReject)
                .always(onComplete);
        }
    }
}));

$(function() {
    var form = new VoteForm();
    var modal = new modals.FormModal();
    modal.setForm(form);
    $(modal.el).appendTo(document.body);
    $create = $("#create-column");
    $create.click(function() {
        modal.show();
        modal.setTitle('创建栏目');
        modal.setSaveText("创建", "创建...");
    });

    $("table").on("click", ".edit", function() {
        modal.setTitle('编辑栏目');
        modal.setSaveText("保存", "保存...");
        var vote = $(this).parent().data();
        form.setVote(vote);
        modal.show();
    });
});

$(function() {
    var modal = new modals.ActionModal();
    modal.setAction(function(pk) {
        var ret = deleteVote(pk).then(function() {
            reload(500);
        });
        ret.ensure = ret.always;
        return ret;
    });

    modal.setTitle('删除栏目');
    modal.tip('确定要删除吗?');
    modal.setSaveText('删除', '删除...');
    modal.on('succeed', function() {
        reload(500);
    });

    $("table").on("click", ".delete", function() {
        modal.setData($(this).parent().data('pk'));
        modal.show();
    });
});

