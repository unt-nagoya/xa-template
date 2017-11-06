/* global jQuery */

/**
 * jQueryオブジェクトの拡張
 *
 * @date 2016-06-02
 */
(function($) {
  /**
   * userAgent判定フラグ
   *
   * @date 2016-06-02
   */
  const ua = navigator.userAgent.toLowerCase();
  $.ua = {
    // Windows
    isWindows: /windows/.test(ua),
    // Mac
    isMac: /macintosh/.test(ua),
    // IE
    isIE: /msie (\d+)|trident/.test(ua),
    // IE9未満
    isLtIE9: /msie (\d+)/.test(ua) && RegExp.$1 < 9,
    // IE10未満
    isLtIE10: /msie (\d+)/.test(ua) && RegExp.$1 < 10,
    // Firefox
    isFirefox: /firefox/.test(ua),
    // WebKit
    isWebKit: /applewebkit/.test(ua),
    // Chrome
    isChrome: /chrome/.test(ua),
    // Safari
    isSafari: /safari/.test(ua)&&(!/chrome/.test(ua))&&(!/mobile/.test(ua)),
    // iOS
    isIOS: /i(phone|pod|pad)/.test(ua),
    // iOS Chrome
    isIOSChrome: /crios/.test(ua),
    // iPhone、iPod touch
    isIPhone: /i(phone|pod)/.test(ua),
    // iPad
    isIPad: /ipad/.test(ua),
    // Android
    isAndroid: /android/.test(ua),
    // モバイル版Android
    isAndroidMobile: /android(.+)?mobile/.test(ua),
    // タッチデバイス
    isTouchDevice: 'ontouchstart' in window,
    // スマートフォン
    isMobile: /i(phone|pod)/.test(ua)||/android(.+)?mobile/.test(ua),
    // タブレット型端末
    isTablet: /ipad/.test(ua)||/android/.test(ua)&&(!/mobile/.test(ua))
  };


  /**
   * ロールオーバー
   *
   * @date 2012-10-01
   *
   * @example $('.rollover').rollover();
   * @example $('.rollover').rollover({ over: '-ov' });
   * @example $('.rollover').rollover({ current: '_cr', currentOver: '_cr_ov' });
   * @example $('.rollover').rollover({ down: '_click' });
   */
  $.fn.rollover = function(options) {
    var defaults = {
      over: '_ov',
      current: null,
      currentOver: null,
      down: null
    };
    var settings = $.extend({}, defaults, options);
    var over = settings.over;
    var current = settings.current;
    var currentOver = settings.currentOver;
    var down = settings.down;
    return this.each(function() {
      var src = this.src;
      var ext = /\.(gif|jpe?g|png)(\?.*)?/.exec(src)[0];
      var isCurrent = current && new RegExp(current + ext).test(src);
      if (isCurrent && !currentOver) return;
      var search = (isCurrent && currentOver) ? current + ext : ext;
      var replace = (isCurrent && currentOver) ? currentOver + ext : over + ext;
      var overSrc = src.replace(search, replace);
      new Image().src = overSrc;
      $(this).mouseout(function() {
        this.src = src;
      }).mouseover(function() {
        this.src = overSrc;
      });

      if (down) {
        var downSrc = src.replace(search, down + ext);
        new Image().src = downSrc;
        $(this).mousedown(function() {
          this.src = downSrc;
        });
      }
    });
  };


  /**
   * フェードロールオーバー
   *
   * @date 2012-11-21
   *
   * @example $('.faderollover').fadeRollover();
   * @example $('.faderollover').fadeRollover({ over: '-ov' });
   * @example $('.faderollover').fadeRollover({ current: '_cr', currentOver: '_cr_ov' });
   */
  $.fn.fadeRollover = function(options) {
    var defaults = {
      over: '_ov',
      current: null,
      currentOver: null
    };
    var settings = $.extend({}, defaults, options);
    var over = settings.over;
    var current = settings.current;
    var currentOver = settings.currentOver;
    return this.each(function() {
      var src = this.src;
      var ext = /\.(gif|jpe?g|png)(\?.*)?/.exec(src)[0];
      var isCurrent = current && new RegExp(current + ext).test(src);
      if (isCurrent && !currentOver) return;
      var search = (isCurrent && currentOver) ? current + ext : ext;
      var replace = (isCurrent && currentOver) ? currentOver + ext : over + ext;
      var overSrc = src.replace(search, replace);
      new Image().src = overSrc;

      $(this).parent()
        .css('display','block')
        .css('width',$(this).attr('width'))
        .css('height',$(this).attr('height'))
        .css('background','url("'+overSrc+'") no-repeat');

      $(this).parent().hover(function() {
        $(this).find('img').stop().animate({opacity: 0}, 200);
      }, function() {
        $(this).find('img').stop().animate({opacity: 1}, 200);
      });
    });
  };


  /**
   * スムーズスクロール
   *
   * @date 2014-12-01
   *
   * @example $.scroller();
   * @example $.scroller({ hashMarkEnabled: true });
   * @example $.scroller({ scopeSelector: '#container', noScrollSelector: '.no-scroll' });
   * @example $.scroller('#content');
   * @example $.scroller('#content', { pitch: 20, delay: 5, marginTop: 200, callback: function(){} });
   */
  $.scroller = function() {
    var self = $.scroller.prototype;
    if (!arguments[0] || typeof arguments[0] == 'object') {
      self.init.apply(self, arguments);
    } else {
      self.scroll.apply(self, arguments);
    }
  };

  // プロトタイプにメンバを定義
  $.scroller.prototype = {
    // 初期設定
    defaults: {
      hashMarkEnabled: false,
      scopeSelector: 'body',
      noScrollSelector: '.noscroll',
      pitch: 10,
      delay: 10,
      marginTop: 0,
      callback: function() {}
    },

    // 初期化
    init: function(options) {
      var self = this;
      var settings = this.settings = $.extend({}, this.defaults, options);
      $(settings.scopeSelector).find('a[href^="#"]').not(settings.noScrollSelector).each(function() {
        var hash = this.hash || '#';
        var eventName = 'click.scroller';
        $(this).off(eventName).on(eventName, function(e) {
          e.preventDefault();
          this.blur();
          self.scroll(hash, settings);
        });
      });
    },

    // スクロールを実行
    scroll: function(id, options) {
      if (this.timer) this.clearScroll();
      var settings = (options) ? $.extend({}, this.defaults, options) : (this.settings) ? this.settings : this.defaults;
      if (!settings.hashMarkEnabled && id == '#') return;
      var self = this;
      var win = window;
      var $win = $(win);
      var d = document;
      var pitch = settings.pitch;
      var delay = settings.delay;
      var scrollLeft = $win.scrollLeft();
      if (($.ua.isIPhone || $.ua.isAndroidMobile) && win.pageYOffset === 0) win.scrollTo(scrollLeft, (($.ua.isAndroidMobile) ? 1 : 0));
      var scrollEnd = (id == '#') ? 0 : $(id + ', a[name="' + id.substr(1) + '"]').eq(0).offset().top;
      var windowHeight = ($.ua.isAndroidMobile) ? Math.ceil(win.innerWidth / win.outerWidth * win.outerHeight) : win.innerHeight || d.documentElement.clientHeight;
      var scrollableEnd = $(d).height() - windowHeight;
      if (scrollableEnd < 0) scrollableEnd = 0;
      scrollEnd = scrollEnd - settings.marginTop;
      if (scrollEnd > scrollableEnd) scrollEnd = scrollableEnd;
      if (scrollEnd < 0) scrollEnd = 0;
      scrollEnd = Math.floor(scrollEnd);

      if ($.ua.isAndroid && scrollEnd === 0) scrollEnd = 1;
      var dir = (scrollEnd > $win.scrollTop()) ? 1 : -1;
      (function _scroll() {
        var prev = self.prev;
        var current = self.current || $win.scrollTop();
        if (current == scrollEnd || typeof prev == 'number' && (dir > 0 && current < prev || dir < 0 && current > prev)) {
          self.clearScroll();
          settings.callback();
          return;
        }
        var next = current + (scrollEnd - current) / pitch + dir;
        if (dir > 0 && next > scrollEnd || dir < 0 && next < scrollEnd) next = scrollEnd;
        win.scrollTo(scrollLeft, next);
        self.prev = current;
        self.current = next;
        self.timer = setTimeout(function() {
          _scroll();
        }, delay);
      })();
    },

    // スクロールを解除
    clearScroll: function() {
      clearTimeout(this.timer);
      this.timer = null;
      this.prev = null;
      this.current = null;
    }
  };


  /**
   * 文字列からオブジェクトに変換したクエリを取得
   *
   * @example $.getQuery();
   * @example $.getQuery('a=foo&b=bar&c=foobar');
   */
  $.getQuery = function(str) {
    if (!str) str = location.search;
    str = str.replace(/^.*?\?/, '');
    let query = {};
    const temp = str.split(/&/);
    for (var i = 0, l = temp.length; i < l; i++) {
      let param = temp[i].split(/=/);
      query[param[0]] = decodeURIComponent(param[1]);
    }
    return query;
  };


  /**
   * 画像をプリロード
   *
   * @date 2012-09-12
   *
   * @example $.preLoadImages('/img/01.jpg');
   */
  var cache = [];
  $.preLoadImages = function() {
    var args_len = arguments.length;
    for (var i = args_len; i--;) {
      var cacheImage = document.createElement('img');
      cacheImage.src = arguments[i];
      cache.push(cacheImage);
    }
  };
})(jQuery);



/**
 * __PROJECT_NAME__
 *
 * @date 2017-08-04
 */
const __NAMESPACE__ = function($) {
  // 初期化
  const _init = function() {
    $win = $(window);
    $body = $('body');

    console.log('main');

    $(function() {
      responsiveImg.init();
      if(!$.ua.isTouchDevice) {
        $('.rollover').rollover();
      }
      $.scroller({
        marginTop: 0,
        easing: 'easeOutExpo'
      });
    });
  };


  /****
   *
   * レスポンシブ画像切替
   *
   */
  const responsiveImg = function() {
    let defaultViewState = 'SP';

    const _init = function() {
      _bind();
      _eventBreakpoints();
    };

    const _bind = function() {
      $win.on('enterSP', function() {
        _changeSrc('SP');
      });

      $win.on('enterPC', function() {
        _changeSrc('PC');
      });
    }

    const _changeSrc = function(viewState) {
      if (viewState === defaultViewState) {
        defaultViewState = null;
        return;
      }
      defaultViewState = null;

      $('img.js-responsiveImg').each(function() {
        const $this = $(this);
        let modifier = (viewState === 'PC') ? '.' : '_sp.';
        let reg = (viewState === 'PC') ? /_sp\.(jpg|png|gif)/ : /\.(jpg|png|gif)/;
        let result = $this.attr('src').match(reg);
        let dataSrc = $this.attr('data-src');

        if (result) {
          if (dataSrc) {
            $this.attr('data-src', $this.attr('src'));
            $this.attr('src', dataSrc);
          } else {
            $this.attr('src', $this.attr('src').replace(result[0], modifier + RegExp.$1));
          }
          $this.on('load', function() {
            $this.css('visibility', 'visible');
          });
        }
      });
    };

    // ブレークポイントイベント
    const _eventBreakpoints = function() {
      Breakpoints({
        SP: {
          min: 0,
          max: 767
        },
        PC: {
          min: 768,
          max: Infinity
        }
      });
      $win.trigger('enter' + Breakpoints.current().name);
      Breakpoints.on('change', function() {
        $win.trigger('enter' + this.current.name);
      });
    };

    return {
      init: _init
    }
  }();

  return {
    init: _init
  };
}(jQuery);

__NAMESPACE__.init();
