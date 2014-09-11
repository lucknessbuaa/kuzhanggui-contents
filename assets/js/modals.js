define(function(require) {
    require("jquery");
    var _ = require("underscore");
    require("backbone/backbone");
    var multiline = require("multiline");

    var modalProto = {
        setTitle: function(title) {
            this.$title.html(title);
        },

        show: function() {
            this.$el.modal('show');
        }
    };

    var formModalTpl = _.template(multiline(function() {
        /*@preserve
        <div class="modal fade">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" 
                        aria-hidden="true">&times;</button>
                    <h4 class="modal-title"><%= title %></h4>
                </div>
                <div class="modal-body"></div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary save" 
                        data-loading-text='<%= loading %>'><%= save %></button>
                    <button type="button" class="btn btn-default cancel" 
                        data-loading-text='Cancel' data-dismiss="modal">取消</button>
                </div>
            </div>
        </div>
        </div>
        */
        console.log
    }));

    var FormModal = Backbone.View.extend(_.extend(modalProto, {
        initialize: function(options) {
            options = options || {};
            var defaults = {
                title: '',
                loading: 'Saving...',
                save: 'Save',
            };
            options = _.extend(defaults, options);
            this.setElement($(formModalTpl(options).trim())[0]);
            this.$el.modal({
                show: false
            });
            this.$title = this.$el.find(".modal-title");
            this.$save = this.$el.find(".save");
            this.$body = this.$el.find(".modal-body");
        },

        events: {
            'click .save': 'onSave',
            'show.bs.modal': 'onShow',
            'hide.bs.modal': 'onHide'
        },

        setForm: function(form) {
            this.form = form;
            this.$form = $(this.form.el).appendTo(this.$body);
            this.$form.submit($.bind(this.onSave, this));
            this.form.on('save', _.bind(function() {
                this.$el.modal('unlock');
                this.$save.button('reset');
            }, this));
        },

        onSave: function(e) {
            e.preventDefault();

            if (this.form) {
                this.$el.modal('lock');
                this.$save.button('loading');
                this.form.save();
            }
        },

        onShow: function() {
            if (this.form) {
                this.form.onShow();
            }
        },

        onHide: function() {
            if (this.form) {
                this.form.onHide();
            }
        },

        setSaveText: function(save, loading) {
            this.$save.html(save);
            this.$save.data("loading-text", loading);
        }
    }));

    var largeModalTpl = _.template(multiline(function() {
        /*@preserve
        <div class="modal fade">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" 
                        aria-hidden="true">&times;</button>
                    <h4 class="modal-title"><%= title %></h4>
                </div>
                <div class="modal-body"></div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary save" 
                        data-loading-text='<%= loading %>'><%= save %></button>
                    <button type="button" class="btn btn-default cancel" 
                        data-loading-text='Cancel' data-dismiss="modal">Cancel</button>
                </div>
            </div>
        </div>
        </div>
        */
        console.log
    }));

    var LargeModal = Backbone.View.extend(_.extend(modalProto, {
        initialize: function(options) {
            options = options || {};
            var defaults = {
                title: '',
                loading: 'Saving...',
                save: 'Save',
            };
            options = _.extend(defaults, options);
            this.setElement($(largeModalTpl(options).trim())[0]);
            this.$el.modal({
                show: false
            });
            this.$title = this.$el.find(".modal-title");
            this.$save = this.$el.find(".save");
            this.$body = this.$el.find(".modal-body");
        },

        events: {
            'click .save': 'onSave',
            'show.bs.modal': 'onShow',
            'hide.bs.modal': 'onHide'
        },

        setForm: function(form) {
            this.form = form;
            this.$form = $(this.form.el).appendTo(this.$body);
            this.$form.submit($.bind(this.onSave, this));
            this.form.on('save', _.bind(function() {
                this.$el.modal('unlock');
                this.$save.button('reset');
            }, this));
        },

        onSave: function(e) {
            e.preventDefault();

            if (this.form) {
                this.$el.modal('lock');
                this.$save.button('loading');
                this.form.save();
            }
        },

        onShow: function() {
            if (this.form) {
                this.form.onShow();
            }
        },

        onHide: function() {
            if (this.form) {
                this.form.onHide();
            }
        },

        setSaveText: function(save, loading) {
            this.$save.html(save);
            this.$save.data("loading-text", loading);
        }
    }));

    var chartModalTpl = _.template(multiline(function() {
        /*@preserve
        <div class="modal fade">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" 
                        aria-hidden="true">&times;</button>
                    <h4 class="modal-title"><%= title %></h4>
                </div>
                <div class="modal-body"></div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default cancel" 
                        data-loading-text='Cancel' data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
        </div>
        */
        console.log
    }));

    var ChartModal = Backbone.View.extend(_.extend(modalProto, {
        initialize: function(options) {
            options = options || {}; 
            var defaults = { 
                title: '', 
                loading: 'Saving...',
                save: 'Save',
            };  
            options = _.extend(defaults, options);
            this.setElement($(chartModalTpl(options).trim())[0]);
            this.$el.modal({
                show: false
            }); 
            this.$title = this.$el.find(".modal-title");
            this.$save = this.$el.find(".save");
            this.$body = this.$el.find(".modal-body");
        },  

        events: {
            'click .save': 'onSave',
            'show.bs.modal': 'onShow',
            'hide.bs.modal': 'onHide'
        },  
        setForm: function(form) {
            this.form = form;
            this.$form = $(this.form.el).appendTo(this.$body);
            this.$form.submit($.bind(this.onSave, this));
            this.form.on('save', _.bind(function() {
                this.$el.modal('unlock');
                this.$save.button('reset');
            }, this));
        },

        onSave: function(e) {
            e.preventDefault();

            if (this.form) {
                this.$el.modal('lock');
                this.$save.button('loading');
                this.form.save();
            }
        },

        onShow: function() {
            if (this.form) {
                this.form.onShow();
            }
        },

        onHide: function() {
            if (this.form) {
                this.form.onHide();
            }
        },

        setSaveText: function(save, loading) {
            this.$save.html(save);
            this.$save.data("loading-text", loading);
        }
    }));



    var actionModalTpl = _.template(multiline(function() {
        /*@preserve
        <div class="modal fade">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" 
                        aria-hidden="true">&times;</button>
                    <h4 class="modal-title"><%= title %></h4>
                </div>
                <div class="modal-body">
                    <div class='tip alert alert-warning' style="margin-bottom: 0px; display: none"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger save btn-block" 
                        data-loading-text='<%= loading %>'><%= save %></button>
                </div>
            </div>
        </div>
        </div>
        */
        console.log
    }));

    var ActionModal = Backbone.View.extend(_.extend(modalProto, {
        initialize: function(options) {
            options = options || {};
            var defaults = {
                title: '',
                loading: 'Confirm',
                save: 'Confirm',
            };
            options = _.extend(defaults, options);
            this.setElement($(actionModalTpl(options).trim())[0]);

            this.$el.modal({
                show: false
            });

            this.$tip = this.$el.find(".tip");
            this.$title = this.$el.find(".modal-title");
            this.$save = this.$el.find(".save");
        },

        events: {
            'click .save': 'onSave'
        },

        tip: function(tip) {
            this.$tip.html(tip).show();
        },

        setAction: function(action) {
            this.action = action;
        },

        setId: function(id) {
            this.id = id;
        },

        onSave: function() {
            if (!_.isFunction(this.action)) {
                return;
            }

            this.$save.button('loading');
            this.$el.modal('lock');
            this.action.call(null, this.id).ensure(_.bind(function() {
                this.$el.modal('unlock');
                this.$save.button('reset');
            }, this));
        }
    }));

    return {
        FormModal: FormModal,
        ActionModal: ActionModal,
        LargeModal: LargeModal,
        ChartModal: ChartModal
    };
});
