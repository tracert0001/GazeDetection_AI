
//點下方圖片觸發
$('div #test >div >div').on('click', function(){
  //將上方圖片標題、價格、路徑、敘述 暫存
  let title =$(this).children('h4').text();
  let price =$(this).children('h5').text();
  const des_display=$(this).children('p').html();
  const pic_src=$(this).children('img').attr('src');

  //將下方替換為上方
  $(this).children('h4').text($('h1.name').text());
  $(this).children('h5').text($('#activeDiv > h2').text());
  $(this).children('img').attr('src',$('img.active').attr('src'));
  $(this).children('p').html($('div.description >p').html());

  //將上方替換為下方
  $('h1.name').text(title);
  $('#activeDiv > h2').text(price);
  $('div.description >p').html(des_display);
  $('img.active').attr('src',pic_src);
})