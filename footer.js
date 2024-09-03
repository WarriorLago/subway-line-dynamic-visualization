// 获取模态框元素并添加点击事件，点击后将其class属性设置为"modal"
var modal = document.getElementById('modal');
modal.onclick = function (ev) {
modal.setAttribute('class', 'modal');
};

// 获取添加行按钮元素并添加点击事件，点击后调用add_select_data函数
var oBtn = document.getElementById('add_line');
oBtn.onclick = function () {
add_select_data();
};

// 调用oBtn的点击事件
oBtn.onclick();

// 获取容器元素和SVG元素并设置SVG的宽度和高度
var div = document.getElementById('container');
var svg = document.getElementById('map');
svg.setAttribute('width', div.offsetWidth);
svg.setAttribute('height', div.offsetHeight);

// 获取下载按钮元素并添加点击事件，点击后生成SVG图片并将其下载
var oBtn2 = document.getElementById('download');
oBtn2.onclick = function () {
// 创建一个临时的div元素并设置SVG图片的视口范围
var temp = document.createElement("div");
var x = min_x - 50;
if (x < 0) x = 0;
var y = min_y - 50;
if (y < 0) y = 0;
var w = (max_x + 50) - x;
if (w > 3486) w = 3486;
var h = (max_y + 50) - y;
if (h > 1821) h = 1821;
var viewBox = '' + x + ' ' + y + ' ' + w + ' ' + h;
// 将SVG数据添加到临时div元素中
temp.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ' + w + ' ' + h + '"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="' + viewBox + '" xlink="http://www.w3.org/1999/xlink">' + svg_data + '</svg><svg>';
// 判断下载类型，如果为false则生成图片并显示在模态框中，否则直接下载图片
if (!download_type) {
modal.setAttribute('class', 'modal is-active');
var app_div = document.getElementById("app");

    var div = document.getElementById("map_img_div");

    if (div == null) {
        div = document.createElement("div");
        div.setAttribute('id', 'map_img_div');
    }

    div.innerHTML = '<div class="notification is-info">图片生成中，完成后需手动保存下面图片：</div>';

    var img = document.createElement("img");
    svgAsPngUri(temp.firstChild, {'backgroundColor': '#ffffff', scale: 0.58}, function (uir) {
        img.src = uir;
    });
    div.appendChild(img);
    app_div.appendChild(div);

}
else {
    saveSvgAsPng(temp.firstChild, "diagram.png", {'backgroundColor': '#ffffff', scale: 0.8});

}
};

// 获取切换按钮元素并添加点击事件，点击后更改下载类型并显示按钮文本
var oBtn3 = document.getElementById('change');
oBtn3.onclick = function () {
download_type = !download_type;
if (download_type)
oBtn2.innerHTML = '<span style="padding-left: 10px">下载图片</span>'
else
oBtn2.innerHTML = '<span style="padding-left: 10px">生成图片</span>';
};

// 使用svgPanZoom插件对SVG进行缩放和拖动操作
zoomSvg = svgPanZoom('#map', {
zoomEnabled: true,
controlIconsEnabled: true,
fit: false,
center: true,
zoomScaleSensitivity: 0.5
});

// 调用flush_svg函数对SVG元素进行初始化
flush_svg();
init_flag = false; // 初始化标志位