define(function(require) {
    require("jquery");
    require("bootstrap");
    require("velocity");
    require("shake");
    var wechatShare = require('wechat-share');
    var _ = require("underscore");
    var Backbone = require('backbone/backbone');
    var token = require('js/shake/token');
    var lottery = null;

    function draw(phone) {
        return $.post("/shake/try", {
            phone: phone
        });
    }

    function hit(phone, lottery) {
        return $.post("/shake/hit", {
            phone: phone,
            lottery: lottery
        });
    }

    wechatShare({
        link: "http://wx.jdb.cn/shake/",
        desc: '全民摇一摇',
        title: '差点就刮到加多宝中国好声音总决赛门票了',
        imgUrl: "http://wx.jdb.cn/static/img/share.jpg"
    });

    var $container;
    var $rules;
    var $rulesOverlay;
    var $form;
    var form;
    var $lotteryResult;
    var $lotteryResultOverlay;
    var phone;
    var canvas;
    var $canvas;
    var ctx;

    function initCanvas() {
        canvas = document.querySelector('canvas');
        $canvas = $(canvas);
        ctx = canvas.getContext('2d');
        var w = canvas.width,
            h = canvas.height;

        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#DF0422';
        //ctx.fillStyle = '#ccc';
        ctx.fillRect(0, 0, w, h);
    }

    function Matcher(size, startX, stopX, startY, stopY) {
        var rects = [];

        for (var i = startY; i < stopY; i++) {
            var row = [];
            for (var j = startX; j < stopX; j++) {
                row.push(false);
            }
            rects.push(row);
        }
        console.log(rects);

        return function(x, y) {
            console.log('x, y:', x, y);
            var j = Math.floor(x / size);
            var i = Math.floor(y / size);
            console.log(i, j);
            var rows = rects.length;
            var cols = rects[0].length;
            if (startY <= i && i < stopY && startX <= j && j < stopX) {
                rects[i - startY][j - startX] = true;
                var count = 0;
                rects.forEach(function(row) {
                    row.forEach(function(cell) {
                        if (cell) {
                            count++;
                        }
                    });
                });
                console.log('count:', count);
                return count >= cols * rows * 0.5;
            } else {
                return false;
            }
        }
    }

    function onLotteryMatch() {
        if (!lottery) {
            $lotteryResult.velocity('fadeIn');
            $lotteryResultOverlay.velocity('fadeIn');
            return;
        }

        hit(phone, lottery).then(function(data) {
            if (data.ret_code === 0) {
                $lotteryResult.addClass(lottery).velocity('fadeIn');
                $lotteryResultOverlay.velocity('fadeIn');
            } else {
                if (lottery) {
                    alert('OH!太牛气了！恭喜中奖！点击【确定】小宝就记录收到您的中奖信息啦！也可以拨打01067718828确认！');
                } else {
                    $lotteryResult.velocity('fadeIn');
                    $lotteryResultOverlay.velocity('fadeIn');
                }
            }
        }, function() {
            if (lottery) {
                alert('OH!太牛气了！恭喜中奖！点击【确定】小宝就记录收到您的中奖信息啦！也可以拨打01067718828确认！');
            } else {
                $lotteryResult.velocity('fadeIn');
                $lotteryResultOverlay.velocity('fadeIn');
            }
        });
    }

    function lauchCanvas() {
        console.log('lottery?', lottery);
        var match = lottery ? Matcher(10, 0, 9, 11, 14) : Matcher(10, 3, 6, 0, 14);
        var down = false;
        var over = false;

        var w = canvas.width,
            h = canvas.height;

        function eventDown(e) {
            down = true;
        }

        function eventUp(e) {
            down = false;
        }

        function eventMove(e) {
            if (!down || over) {
                return;
            }

            e.preventDefault();
            var offset = $(canvas).offset();
            if (e.changedTouches) {
                e = e.changedTouches[e.changedTouches.length - 1];
            }

            var x = e.pageX - offset.left,
                y = e.pageY - offset.top;
            with(ctx) {
                beginPath()
                arc(x, y, 10, 0, Math.PI * 2);
                fill();
            }

            if (!over && match(x, y)) {
                over = true;
                onLotteryMatch();
            }
        }

        ctx.globalCompositeOperation = 'destination-out';
        document.body.addEventListener('touchmove', eventMove, false);
        document.body.addEventListener('mousemove', eventMove, false);
        document.body.addEventListener('touchstart', eventDown, false);
        document.body.addEventListener('touchend', eventUp, false);
        document.body.addEventListener('mousedown', eventDown, false);
        document.body.addEventListener('mouseup', eventUp, false);
    }

    $(function() {
        $lotteryResult = $(".lottery-result");
        $lotteryResultOverlay = $(".lottery-result-overlay");

        initCanvas();
        $form = $(".phone-prompt-form");
        form = $form[0];
        $container = $(".container");
        $rules = $(".rules");
        $rulesOverlay = $(".rules-overlay");

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

        $(".button-bar .right").click(function() {});

        var studentPlaying = $("#playing").val() === 'true';
        if (!studentPlaying) {
            alert("非常抱歉，学员还没有上场，目前还不能投票");
        }

        $form.submit(function(e) {
            e.preventDefault();
            
            if (!studentPlaying) {
                return;
            }

            if (form.phone.value === '') {
                return;
            }

            phone = form.phone.value;
            draw(phone).then(function(data) {
                lottery = data.ret_code === 0 ? data.lottery : null;
                $canvas.addClass(lottery || 'try-again');
            }, function() {
                lottery = null;
                $canvas.addClass('try-again');
            }).always(function() {
                $form.parent().velocity('fadeOut');
                $(".prompt-overlay").velocity('fadeOut');
                lauchCanvas();
            });
        });
    });
});