define(function(require) {
    require("jquery");
    require("bootstrap");
    require("velocity");
    require("shake");
    require("components/howler.js/howler.min");
    var alertify = require("js/alertify");
    var wechatShare = require('wechat-share');
    var _ = require("underscore");
    var multiline = require("multiline");
    var Backbone = require('backbone/backbone');
    var token = require('js/shake/token');
    var player = new Howl({
        urls: [
            "/static/music/shake_sound_male.ogg",
            "/static/music/shake_sound_male.mp3"
        ],
        onload: function() {},
        volume: 1,
        onloaderror: function() {},
        onplay: function() {}
    });

    var CODE_NO_PLAYING_STUDENT = 2001;

    wechatShare({
        link: "http://wx.jdb.cn/shake/",
        desc: '全民摇一摇',
        title: '边看好声音边投票，世界上第一款直播摇一摇投票神器',
        imgUrl: "http://wx.jdb.cn/static/img/share.jpg"
    });

    function getVotes() {
        return $.get("/students/vote", {}, "json");
    }

    function vote() {
        return $.post("/students/vote", {
            'audience': token
        }, "json");
    }

    var ENTERING = "entering";
    var VOTING = "voting";
    var status = ENTERING;
    var voting = false;

    var $container;
    var $votes;
    var $entry;
    var $rules;
    var $rulesOverlay;
    var $shareFlyOverlay;

    $(function() {
        $container = $(".container");
        $entry = $(".entry");
        $votes = $(".votes");
        $rules = $(".rules");
        $rulesOverlay = $(".rules-overlay");
        $shareFlyOverlay = $(".share-fly-overlay");

        $shareFlyOverlay.click(function() {
            $shareFlyOverlay.velocity('fadeOut');
        });

        $rulesOverlay.click(function() {
            $rules.velocity('fadeOut');
            $rulesOverlay.velocity('fadeOut');
        });
        $rules.on('click', '.exit', function() {
            $rules.velocity('fadeOut');
            $rulesOverlay.velocity('fadeOut');
        });

        $(".button-bar .left").click(function() {
            $rules.velocity('fadeIn');
            $rulesOverlay.velocity('fadeIn');
        });

        $(".button-bar .right").click(function() {
            window.location = "./rank";
        });

        function switchToVote(e) {
            e.preventDefault();

            status = VOTING;
            $entry.hide();
            $container.addClass("shake blur");
            $votes.show();
            onVote();
        }
        $entry.find("a").click(switchToVote);
        $entry.find("a").on('touchstart', switchToVote);
    });

    function onVote() {

        var $loaderOverlay = $('<div class="loader-overlay" style="display: none;"></div>');
        $loaderOverlay.appendTo(document.body);

        var LoaderTpl = multiline(function() {
            /*@preserve
        <div class="loader" style="display: none;">
            <img class='preloader' src="/static/img/shake/loading.gif" alt="">
            <div class='selection' style="display: none;">
                <img src="/static/img/shake/vote-head.png"/>
                <ul>
                    <li><a class='btn btn-block' href="#vote">继续投票</a></li>
                    <li><a class='btn btn-block' href="#lottery">进入抽奖</a></li>
                    <li><a class='btn btn-block' href="#rank">查看排名</a></li>
                    <li><a class='btn btn-block' href="#share">马上分享</a></li>
                </ul>
            </div>
        </div>
        */
            console.log
        }).trim();

        var Loader = Backbone.View.extend({
            initialize: function() {
                this.setElement($(LoaderTpl)[0]);
                this.$selection = this.$el.find(".selection");
                this.$preloader = this.$el.find(".preloader");
            },

            events: {
                'click a[href=#vote]': 'onVote',
                'click a[href=#share]': 'onShare',
                'click a[href=#rank]': 'onRank',
                'click a[href=#lottery]': 'onLottery',
            },

            onRank: function() {
                window.location = "./rank";
            },

            onLottery: function() {
                window.location = "./lottery";
            },

            onShare: function() {
                $shareFlyOverlay.velocity('fadeIn');
            },

            onVote: function() {
                this.hide();
            },

            show: function() {
                $loaderOverlay.show();
                this.$el.show();
            },

            hide: function() {
                this.$el.hide();
                $loaderOverlay.hide();

                this.$selection.hide();
                this.$preloader.show();
                this.trigger('hide');
            },

            tip: function() {
                this.$selection.show();
                this.$preloader.hide();
            }
        });

        var loader = new Loader();
        loader.on('hide', function() {
            voting = false;
        });

        function stopRrefreshVotes() {
            timestamp = new Date().getTime();
        }

        function startRefreshVotes() {
            refreshVotes();
        }

        function getVotes() {
            return $.get("/students/vote", {}, "json");
        }

        function vote() {
            return $.post("/students/vote", {
                'audience': token
            }, "json");
        }

        function refreshVotes() {
            setTimeout(function() {
                var _timestamp = new Date().getTime();
                timestamp = _timestamp;
                getVotes().then(function(data) {
                    if(timestamp !== _timestamp) {
                        return;
                    }

                    studentPlaying = data.ret_code !== CODE_NO_PLAYING_STUDENT;
                    if (data.ret_code === 0) {
                        $tickets.html(data.count);
                    } else {
                        $tickets.html(0);
                    }
                }).always(function() {
                    refreshVotes();
                });
            }, 1000);
        }

        function onShake() {
            if (voting) {
                return console.log("Voting, ignore shake event!");
            }

            voting = true;

            player.play();
            $(".shakehands").addClass("shakehands-work");
            setTimeout(function() {
                $(".shakehands").removeClass("shakehands-work");

                var _timestamp = new Date().getTime();
                timestamp = _timestamp;

                if (!studentPlaying) {
                    voting = false;
                    alertify.set({
                        delay: 2000
                    });
                    return alertify.log("非常抱歉，学员还没有上场，目前还不能投票。");
                }

                loader.show();
                vote().then(function(data) {
                    if (data.ret_code === 0 && timestamp === _timestamp) {
                        $tickets.html(data.count);
                    }
                    loader.tip();
                }, function() {
                    loader.tip();
                });
            }, 1500);
        }

        loader.$el.appendTo(document.body);
        $tickets = $votes.find(".tickets");
        refreshVotes();
        window.addEventListener('shake', onShake, false);
    }
});