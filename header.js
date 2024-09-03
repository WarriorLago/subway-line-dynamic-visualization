// 存储线路名字的数组
var lines = [];

// 存储每个线路的站点名字的二维数组
var line_stations = [];

// 记录当前选择的 select 元素数量
var select_count = 0;

// 存储 SVG 数据的字符串
var svg_data = '';

// 标记是否第一次加载页面
var init_flag = true;

// 存储 SVG 数据的字符串（备份）
var svg_data2 = '';

// 标记下载的文件类型（SVG 或 PNG）
var download_type = true;

// SVG 画布左上角的最小 x 坐标
var min_x = 3486;

// SVG 画布左上角的最小 y 坐标
var min_y = 1821;

// SVG 画布右下角的最大 x 坐标
var max_x = 0;

// SVG 画布右下角的最大 y 坐标
var max_y = 0;

// 遍历数据（DATA）数组，将线路名字和站点名字存储到 lines 和 line_stations 数组中
for (var i = 0; i < DATA.length; i++) {
    lines.push(DATA[i]['name']);
    var temp = [];
    var stations = DATA[i]['stations'];
    for (var j = 0; j < stations.length; j++) {
        temp.push(stations[j]['name']);
    }
    line_stations.push(temp);
}

// 创建一个带有 select 标签的 div 元素，并返回该元素
function create_select_tag(id, options, mtype, onchange) {
    var style_div = document.createElement("div");
    style_div.setAttribute('class', 'select is-rounded');

    var select = document.createElement("select");

    for (var i = 0; i < options.length; i++) {
        select.options.add(new Option(options[i], i));
    }
    select.setAttribute('id', id);
    select.setAttribute('mtype', mtype);

    select.onchange = onchange;
    style_div.appendChild(select);
    style_div.SELECT = select;
    return style_div;
}

// 添加一个 select 元素组到页面中
function add_select_data() {
    select_count++;
    var select_data = document.getElementById('select_data');

    var group_div = document.createElement("div");
    group_div.setAttribute('id', "select_group_" + select_count);
    group_div.setAttribute('style', "margin-bottom: 10px");

    // 创建线路选择下拉框
    var select_line = create_select_tag("select_line_" + select_count, lines, "line", function () {
        var pos = this.value;
        var stations = line_stations[pos];
        var start = this.parentNode.nextSibling.SELECT;
        var end = start.parentNode.nextSibling.SELECT;
        start.options.length = 0;
        end.options.length = 0;
        for (i = 0; i < stations.length; i++) {
            start.options.add(new Option(stations[i], i));
            end.options.add(new Option(stations[i], i));
        }
        end.options[i - 1].selected = true;
        if (!init_flag)
            flush_svg()
            ;

    });

    // 创建起点站选择下拉框
    var select_start_station = create_select_tag("select_station_" + select_count, ['---'], 'start', function () {
        var end = this.parentNode.nextSibling.SELECT;
        if (parseInt(end.value) < parseInt(this.value)) {
            alert("终点站在始发站后面");
            return;
        }
        flush_svg()
        ;
    });

    // 创建终点站选择下拉框
    var select_end_station = create_select_tag("select_station_" + select_count, ['---'], 'end', function () {

        var start = this.parentNode.previousSibling.SELECT;
        if (parseInt(this.value) < parseInt(start.value)) {
            alert("终点站在始发站后面");
            return;
        }
        flush_svg();
    });

    select_line.setAttribute('style', 'padding:3px;font-size: 0.9rem;');
    select_start_station.setAttribute('style', 'padding:3px;font-size: 0.9rem;');
    select_end_station.setAttribute('style', 'padding:3px;font-size: 0.9rem;');

    group_div.appendChild(select_line);
    group_div.appendChild(select_start_station);
    group_div.appendChild(select_end_station);

    select_data.appendChild(group_div);

    select_line.SELECT.onchange();

    var max_width = select_line.offsetWidth;
    select_line.SELECT.setAttribute('style', 'width: ' + max_width + 'px;');
    select_start_station.SELECT.setAttribute('style', 'width: ' + max_width + 'px;');
    select_end_station.SELECT.setAttribute('style', 'width: ' + max_width + 'px;');
}

// 绘制一条地铁线路
function draw_line(line, start, end) {
    var svg = document.getElementById('map');
    var name = line['name'];
    var color = line['color'];
    var stations = line['stations'];
    var is_reverse = reverse.has(name);
    var first = true;
    var path_data = '';
    var draw_name_img = '';    for (var i = start; i < end + 1; i++) {
        var s = stations[i];
        draw_name_img += s['draw_name'];
        draw_name_img += s['draw_img'];
        var x=parseInt(s['xy'].split(',')[0]);
        var y=parseInt(s['xy'].split(',')[1]);
        if ( x< min_x)
            min_x = x;
        if (y < min_y)
            min_y = y;

        if (x > max_x)
            max_x = x;
        if (y > max_y)
            max_y = y;

        if (first) {
            path_data += 'M' + s['xy'];
            first = false;
            continue;
        }
        if (is_reverse) {
            if (s['draw_type'] == 'L') path_data += 'L' + s['xy'];
            path_data += s['draw_args'];
        }
        else {
            path_data += s['draw_args'];
            if (s['draw_type'] == 'L') path_data += 'L' + s['xy'];
        }
    }

    var draw_path = '<path d="' + path_data + '" eletype="1" fill="none" stroke="' + color + '" stroke-width="8"></path>';
    var draw_group = '<g id="' + name + '">' + draw_path + draw_name_img + '</g>';

    svg.innerHTML += draw_group;
}

// 刷新 SVG 画布
function flush_svg() {
    var svg = document.getElementById('map');
    if (zoomSvg != null)
        zoomSvg.destroy();
    svg.innerHTML = '';

    var select_data = document.getElementById('select_data').children;
    for (var i = 0; i < select_data.length; i++) {
        var temp = select_data[i].childNodes;
        var select_line = temp[0].SELECT;
        var select_start_station = temp[1].SELECT;
        var select_end_station = temp[2].SELECT;
        draw_line(DATA[parseInt(select_line.value)], parseInt(select_start_station.value), parseInt(select_end_station.value));
    }
    svg_data = svg.innerHTML;

    zoomSvg = svgPanZoom('#map', {
        zoomEnabled: true,
        controlIconsEnabled: true,
        fit: true,
        center: true,
        zoomScaleSensitivity: 0.5
    });
}
