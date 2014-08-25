define(function(require) {
    require('jquery');
    require('bootstrap');
    require('jquery-placeholder');
    require('django-csrf-support');
    var multiline = require("multiline");
    var when = require('components/when/when');
    var _ = require("underscore");

    var utils = require('js/utils');
    var handleErrors = utils.handleErrors;
    var modals = require('js/modals');
    var formProto = require("js/formProto");
    var vaFormProto = require("js/formValidationProto");

    function addVote(name,pd1,pd2,pd3,pd4) {
        return when($.post("/contents/backend/add", {
            name: name,
            spt_bp:pd1,
            spt_ar:pd2,
            spt_im:pd3,
            spt_vi:pd4
        }, "json")).then(utils.mapErrors, utils.throwNetError);
    }

    function editVote(pk, name,pd1,pd2,pd3,pd4) {
        return when($.post("/contents/backend/edit", {
            pk: pk,
            name: name,
            spt_bp:pd1,
            spt_ar:pd2,
            spt_im:pd3,
            spt_vi:pd4
        }, "json")).then(utils.mapErrors, utils.throwNetError);
    }

    function deleteVote(pk) {
        return when($.post("/contents/backend/delete", {
            pk: pk
        }, "json")).then(utils.mapErrors, utils.throwNetError);
    }

    var VoteFormTpl = _.template(multiline(function() {
        /*@preserve
        <form role="form" class="form form-horizontal">
            <input type="hidden" name="pk">
            <div class="alert" style="display: none"></div>
            <div class="form-group">
                <div class="col-sm-4 control-label required">
                    <label for="id_name">Title</label>
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
                            <input type="checkbox" id="spt_bp" name="spt_bp">Support Big Picture
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
                            <input type="checkbox" id="spt_ar" name="spt_ar">Support Article
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
                            <input type="checkbox" id="spt_im" name="spt_im">Support Image
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
                            <input type="checkbox" id="spt_vi" name="spt_vi">Support Video
                        </label>
                    </div>
                </div>
            </div>              
        </form>
         */
        console.log
    }).trim());

    var VoteForm = Backbone.View.extend(_.extend({}, formProto, vaFormProto, {
        initialize: function() {
            this.setElement($(VoteFormTpl())[0]);
            this.$alert = this.$("div.alert");
        },

        setVote: function(vote) {
            _.each(['pk', 'name', 'spt_bp', 'spt_ar', 'spt_im', 'spt_vi'], _.bind(function(attr) {
                if(attr=='pk'||attr=='name'){
                    $(this.el[attr]).val(vote[attr]).trigger('change');
                }else{
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

        save: function() {
            var onComplete = _.bind(function() {
                this.trigger('save');
            }, this);

            if (this.el.name.value === '') {
                this.addError('name', 'Name is required');
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
                this.tip('Succeed!', 'success');
                utils.reload(500);
            }, this);

            if (this.el.pk.value !== "") {
                editVote(this.el.pk.value, this.el.name.value, this.el.spt_bp.checked,
                this.el.spt_ar.checked,this.el.spt_im.checked,this.el.spt_vi.checked)
                    .then(onFinish, onReject)
                    .ensure(onComplete);
            } else {
                addVote(this.el.name.value,this.el.spt_bp.checked,this.el.spt_ar.checked,
                this.el.spt_im.checked,this.el.spt_vi.checked)
                    .then(onFinish, onReject)
                    .ensure(onComplete);
            }
        }
    }));

    $(function() {
        var form = new VoteForm();
        var modal = new modals.FormModal();
        modal.setForm(form);
        $(modal.el).appendTo(document.body);
        document.getElementById("spt_bp").checked=true; 
        document.getElementById("spt_bp").disabled=true
        $create = $("#create-column");
        $create.click(function() {
            modal.show();
            modal.setTitle('Create Column');
            modal.setSaveText("Create", "Creating...");
        });


        $("table").on("click", ".edit", function() {
            modal.setTitle('Edit Column');
            modal.setSaveText("Save", "Saving...");
            var vote = $(this).parent().data();
            form.setVote(vote);
            modal.show();
        });
    });

    $(function() {
        var modal = new modals.ActionModal();
        modal.setAction(function(pk) {
            return deleteVote(pk).then(function() {
                utils.reload(500);
            });
        });
        modal.setTitle('Delete Column');
        modal.tip('Are you sure?');
        modal.setSaveText('Delete', 'Deleting...');
        modal.on('succeed', function() {
            utils.reload(500);
        });
        $("table").on("click", ".delete", function() {
            modal.setId($(this).parent().data('pk'));
            modal.show();
        });
    });
});
