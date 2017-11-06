/* global jQuery */

/**
 * __PAGE_NAME__
 *
 * @date 2017-08-04
 */


(function($) {
  const __NAMESPACE__ = window.__NAMESPACE__ || {};

  __NAMESPACE__.Top = function() {
    // 初期化
    const _init = function() {
      console.log('top');
    };

    return {
      init: _init
    };
  }();

  __NAMESPACE__.Top.init();
})(jQuery);
