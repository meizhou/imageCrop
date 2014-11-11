<?php
    echo $_POST['imgCropInfo'];
    $upload = $_FILES["file"];
    var_dump($upload);
    //todo 要判断一下$_POST['imgCropInfo']传进来的数据是否为零，合法;
    getCropImage($upload, $_POST['imgCropInfo'], "crop.jpg");
    /**
     * 获取图片格式
     *
     * @param file $file 要判断的文件
     * @return string png/jpeg 返回的类型
     */
    function getFileType($file) {
        $info = getimagesize($file);
        return explode("/", $info['mime'])[1];
    }

    /**
     * 从上传的文件中得到裁剪图
     *
     * @param file $upload 上传的文件
     * @param string $cropInfo 图片裁剪的数据
     * @param string $target 上传服务器的路径
     * @return null
     */
    function getCropImage($upload, $cropInfo, $target) {
        $cropInfo = explode(',', $cropInfo);
        $type = getFileType($upload['tmp_name']);
        $fun = "imagecreatefrom{$type}";
        $uploadImg = $fun($upload['tmp_name']);
        $info = getimagesize($upload["tmp_name"]);
        $scale = $info[0] / $cropInfo[0];
        $imgCrop = imagecreatetruecolor($cropInfo[2] * $scale, $cropInfo[3] * $scale);
        $color = imagecolorallocate($imgCrop, 255, 255, 255);
        imagefill($imgCrop, 0, 0, $color);
        imagecopyresampled($imgCrop, $uploadImg, 0, 0, $cropInfo[4] * $scale, $cropInfo[5] * $scale, $cropInfo[2] * $scale,
        $cropInfo[3] * $scale, $cropInfo[2] * $scale, $cropInfo[3] * $scale);
        imagedestroy($uploadImg);
        $funCreate = "image{$type}";
        $funCreate($imgCrop,$target);
    }

 ?>