(function ($) {
  if (!$ || !$.fn.select2) return;

  $(function () {
    const $businessNature = $('#businessNature');

    if ($businessNature.length) {
      $businessNature.select2({
        width: '100%',
        placeholder: $businessNature.data('placeholder'),
        minimumResultsForSearch: Infinity
      });
    }
  });
})(window.jQuery);
