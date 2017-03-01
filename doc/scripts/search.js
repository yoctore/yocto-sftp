// only if document is ready ?
$(document).ready(function () {
  // parse all parent
  $('nav > ul > li').each(function () {
    $(this).addClass('parent');
  });
  // parse all child
  $('nav > ul > li > ul > li').each(function () {
    $(this).addClass('child');
  });

  // custom search
  $('.search').keyup(function() {
    var value = $(this).val();
    $('.child').each(function() {
      // get value
      var childValue = $(this).children().text();
      // value is include 
      if (!_.includes(_.trim(childValue).toLowerCase(), _.trim(value).toLowerCase())) {
        $(this).addClass('thide').hide();
        // parse all parent
        $('.parent').each(function() {
          // mapping
          if ($(this).find('.thide').length === $(this).find('.child').length) {
            $(this).hide();
          }
        });
      } else {
        $(this).show().removeClass('thide');
        // parse all parent
        $('.parent').each(function() {
          // mapping
          if ($(this).find('.thide').length !== $(this).find('.child').length) {
            $(this).show();
          }
        });
      }
    });
  });
});
