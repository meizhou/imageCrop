imageCrop
=========

图片裁切
    介绍：根据canvas提前在浏览器上加载出来，遮罩框选出裁切大小，返回后端裁切；
          主要用于类似移动客户端对图片比例要求高的地方；
          界面不好看，不过用于的后台，裁切起来还是很方便的；
    用法：
          ImageCrop.defaults = {
              wrap: ".imageCrop",      //产生缩略图的地方
              defaultShowWidth: 400,   //默认的缩略图的大小px
              cropMinWidth: 640,       //裁切图最小多大
              cropMinHeight: 300,      //最小高
              cropMaxHeight: 640,      //最大高
              onChange: function() {}  //产生缩略图完成时回调的函数
          }
          可以在$("#id").imageCrop({/*可以在这里面修改配置项*/})；
          拖拽框拖拽完毕以后，要调用$("#id").imageCrop('getVal'),得到当前的裁剪信息；结构是
          400,328,268,126,39,61  
          width  默认的缩略图宽(400px)
          height 默认的缩略图高(400px*比例)
          width  要裁剪的宽px
          height 裁剪的高px
          left   距离左边px
          top    距离上边px
          #id为要监听的input name='file'

	
