$(function() {
    var ImageCrop = function(el, option) {
        this.$file = el;
        this.options = option;
        this.expendable = false;
        this.dragable = false;
        this._init();
    }
    ImageCrop.defaults = {
        wrap: ".imageCrop",      //产生缩略图的地方
        defaultShowWidth: 400,   //默认的缩略图的大小px
        cropMinWidth: 640,       //裁切图最小多大
        cropMinHeight: 300,      //最小高
        cropMaxHeight: 640,      //最大高
        onChange: function() {}  //产生缩略图完成时回调的函数
    }
    ImageCrop.prototype = {
        _init: function() {
            var that = this;
            var $wrap = that.wrap = $(this.options.wrap);
            var html = "<div class='img-crop'><div class='img-crop-modal'><div class='img-crop-function'><div class='img-crop-expendwidth'></div><div class='img-crop-expendheight'></div><div class='img-crop-expendwh'></div></div></div><div class='img-crop-content'><img id='preview'></div></div>";
            $wrap.append(html);
            that.imgModal = $wrap.find('.img-crop-modal');
            that.change();
        },
        controlSize: function() {
            var that = this;
            var imgModal = this.imgModal,
                imgContent = this.imgContent,
                modalWidth = imgModal.width(),
                modalHeight = imgModal.height(),
                modalLeft = imgModal.offset().left,
                modalTop = imgModal.offset().top,
                contentWidth = imgContent.width(),
                contentHeight = imgContent.height(),
                contentLeft = imgContent.offset().left,
                contentTop = imgContent.offset().top;

            function extendHeightControl() {
                if (modalHeight > contentHeight) {
                    imgModal.height(contentHeight);
                };
                var nowModalWidth = imgModal.width();
                var nowModalHeight = imgModal.height();
                var minModalHeight = (that.minHeightScale) * nowModalWidth;
                var maxModalHeight = (that.maxHeightScale) * nowModalWidth;
                if (nowModalHeight < minModalHeight) {
                    imgModal.height(minModalHeight);
                };
                if (nowModalHeight > maxModalHeight) {
                    imgModal.height(maxModalHeight);
                };
            }

            function expendWidthControl() {
                if (modalWidth > contentWidth) {
                    imgModal.width(contentWidth);
                };
                if (modalWidth < (that.minModalWidth)) {
                    imgModal.width(that.minModalWidth);
                };
            }
            if (this.expendable) {
                if (imgModal.hasClass('expendwidth')) {
                    expendWidthControl();
                } else if (imgModal.hasClass('expendheight')) {
                    extendHeightControl();
                } else if (imgModal.hasClass('expendwh')) {
                    expendWidthControl();
                    extendHeightControl();
                }
            };
            if (this.dragable) {
                if ((modalTop - contentTop) < 0) {
                    imgModal.offset({
                        top: contentTop
                    });
                }
                if ((modalLeft - contentLeft) < 0) {
                    imgModal.offset({
                        left: contentLeft
                    });
                }
                if ((modalLeft + modalWidth) > (contentLeft + contentWidth)) {
                    imgModal.offset({
                        left: (contentLeft + contentWidth - modalWidth)
                    })
                }
                if ((modalTop + modalHeight) > (contentTop + contentHeight)) {
                    imgModal.offset({
                        top: (contentTop + contentHeight - modalHeight)
                    })
                }
            };
        },
        change: function() {
            var that = this;
            var defaultShowWidth = this.options.defaultShowWidth;
            var imgModal = that.imgModal;
            that.$file.on('click', function() {
                that.$file.val("");
            })
            that.$file.on('change', function(event) {
                var file = $(this)[0].files[0],
                    reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function() {
                    var blob = new Blob([this.result], {
                        type: file.type
                    });
                    var imgContent = $(that.options.wrap).find('img').first().attr("style", "");
                    var img = new Image();
                    img.src = this.result;
                    img.onload = function() {
                        imgContent[0].src = img.src;
                        that.imgContent = imgContent;
                        var width = img.width,
                            height = img.height,
                            scale = width / height;
                        if (that.decideImage(width, height)) {
                            imgContent.width(defaultShowWidth);
                            imgContent.height(defaultShowWidth / scale);
                            imgModal.css({
                                width: imgContent.width(),
                                height: (imgContent.width()) * (that.minHeightScale)
                            }).show(0);
                            that.bindOn();
                            that.options.onChange();
                        } else {
                            that.$file.val("");
                        }
                    }
                }
            });
        },
        decideImage: function(oWidth, oHeight) {
            oScale = oHeight / oWidth,
            minWidth = this.options.cropMinWidth,
            minHeightScale = this.minHeightScale = (this.options.cropMinHeight) / minWidth,
            maxHeightScale = this.maxHeightScale = (this.options.cropMaxHeight) / minWidth;
            this.minModalWidth = minWidth / oWidth * (this.options.defaultShowWidth);
            if ((oWidth >= minWidth) && (minHeightScale <= oScale)) {
                return true;
            } else {
                if (oWidth < minWidth) {
                    alert("图片宽度小于规定参数" + minWidth + "px,当前尺寸为" + oWidth + 'px');
                } else if (minHeightScale > oScale) {
                    alert("高度比例小于" + (minHeightScale * 100) + "%");
                };
                return false;
            };
        },
        bindOn: function() {
            var that = this;
            var imgModal = this.imgModal;
            var imgContent = this.imgContent;
            var x, y;

            function mousedownModal() {
                imgModal.on('mousedown.drag', function(e) {
                    e.preventDefault();
                    x = e.pageX - imgModal.offset().left;
                    y = e.pageY - imgModal.offset().top;
                    that.dragable = true;
                });
            }
            mousedownModal();
            that.wrap.find('.img-crop').on("mousemove.drag", function(e) {
                e.preventDefault();
                if (that.dragable) {
                    imgModal.offset({
                        "left": e.pageX - x,
                        "top": e.pageY - y
                    });
                }
                if (that.expendable) {
                    if (imgModal.hasClass('expendwidth')) {
                        imgModal.width(e.pageX - imgModal.offset().left);
                    } else if (imgModal.hasClass('expendheight')) {
                        imgModal.height(e.pageY - imgModal.offset().top);
                    } else if (imgModal.hasClass('expendwh')) {
                        imgModal.css({
                            width: (e.pageX - imgModal.offset().left),
                            height: (e.pageY - imgModal.offset().top)
                        });
                    }
                };
                that.controlSize();
            });
            $(document).on("mouseup.drag", function(e) {
                e.preventDefault();
                if (imgModal.hasClass('expendheight') || imgModal.hasClass('expendwidth') || imgModal.hasClass('expendwh')) {
                    mousedownModal(imgModal);
                    imgModal.removeClass('expendheight').removeClass('expendwidth').removeClass('expendwh');
                    that.expendable = false;
                } else {
                    that.dragable = false;
                };
            });
            $('.img-crop-expendheight').on('mousedown.expendheight', function(event) {
                imgModal.off('mousedown.drag').addClass('expendheight');
                that.expendable = true;
            });
            $('.img-crop-expendwidth').on('mousedown.expendheight', function(event) {
                imgModal.off('mousedown.drag').addClass('expendwidth');
                that.expendable = true;
            });
            $('.img-crop-expendwh').on('mousedown.expendwh', function(event) {
                imgModal.off('mousedown.drag').addClass('expendwh');
                that.expendable = true;
            });
        },
        getVal: function() {
            var imgContent = $(this.options.wrap).find('img').first(),
                imgModal = $(this.options.wrap).find('.img-crop-modal');

            var str = imgContent.width() + ',' + imgContent.height() + ',' + imgModal.width() + ',' + imgModal.height() + ',' + (imgModal.position().left) + ',' + (imgModal.position().top);
            return str;
        }
    };
    $.fn.imageCrop = function(options) {
        var data = this.data('imageCrop');
        var option = $.extend({}, ImageCrop.defaults, typeof options == 'object' && options);
        if (!data) {
            this.data('imageCrop', data = new ImageCrop(this, option))
        };
        if (options == 'getVal') {
            return data[options]();
        };
    }
});
