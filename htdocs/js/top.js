/* global jQuery */

/**
 * __PAGE_NAME__
 *
 * @date 2017-08-04
 */

(function ($) {
  var __NAMESPACE__ = window.__NAMESPACE__ || {};

  __NAMESPACE__.Top = function () {
    // 初期化
    var _init = function _init() {
      console.log('top');
    };

    return {
      init: _init
    };
  }();

  __NAMESPACE__.Top.init();
})(jQuery);