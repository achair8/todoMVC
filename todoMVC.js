//筛选元素
var $ = function (el) {
    return document.querySelector(el);
};
var $All = function (el) {
    return document.querySelectorAll(el);
};
//修正当前时间格式
function translate(prop) {
    if (prop <= 9) {
        return "0" + prop;
    }
    else {
        return prop
    }
}
//根据model中item某一属性进行排序
function sortArr(attr) {
    return function (a, b) {
        if (attr == 'datetime')
            return Date.parse(b[attr].replace(/-/g, "/")) - Date.parse(a[attr].replace(/-/g, "/"));
        else
            return a[attr] - b[attr];
    }
}
//页面内容更新
function update() {
    //存储model
    model.flush();
    var data = model.data;
    //如果数据为空，就显示提示信息
    var none = $('.none');
    if (data.items == '') {
        none.style.display = 'block';
    }
    else {
        none.style.display = 'none';
    }
    //更改键位的显示
    var cmp_all = $('.cmp-all');
    if (data.cmpall)
        cmp_all.querySelector('span').innerHTML = "全部完成";
    else
        cmp_all.querySelector('span').innerHTML = "全部取消";
    //对数据进行排序
    if (data.sort == 'no')//根据添加时间排序
        data.items.sort(sortArr('id'));
    else if (data.sort == 'level-fst')//按优先级排序
        data.items.sort(sortArr('level'));
    else //根据时间排序
        data.items.sort(sortArr('datetime'));

    //对数据进行筛选
    var active_num = 0;
    var todo_list = $('#todo-list');
    todo_list.innerHTML = '';
    data.items.forEach(function (item, index) {
        if (!item.cmp) active_num++;
        if (data.filter == 'all'
            || (data.filter == 'notcmp' && !item.cmp)
            || (data.filter == 'cmp' && item.cmp)) {//满足筛选条件
            //创建待办事件结点
            var element = document.createElement('li');
            if (item.cmp) {
                element.classList.add('completed');
            }
            var level = '!';
            if (item.level == 1) {
                level = '!!';
            }
            else if (item.level == 2)
                level = '!!!';
            element.innerHTML = [
                "<div class='view'>",
                "<span class='cmp-btn'><embed src='assets/cmp.svg'/></span>",
                "<input class='toggle' type='checkbox' />",
                "<input class='edit' type='text'/>",
                "<label class='todo-label'>" + item.msg + "</label>",
                "<span class='todo-level'>" + level + "</span>",
                "<span class='datetime'>",
                "<span class='date'>" + item.date + "</span>",
                "<br/>",
                "<span class='time'>" + item.time + "</span>",
                "</span>",
                "<span class='del-btn'><embed src='assets/delete.svg'/></span>",
                "</div>"].join('');
            //修改结点的checked
            var toggle = element.querySelector('.toggle');
            toggle.checked = item.cmp;
            //双击实现重新编辑
            var label = element.querySelector('.todo-label');
            var i = 0;
            label.addEventListener('touchstart', function (ev) {//模拟双击
                ev.stopPropagation();
                i++;
                setTimeout(function () {
                    i = 0;
                }, 500);
                if (i > 1) {
                    label.style.display = 'none';
                    var edit = element.querySelector('.edit');
                    edit.setAttribute('value', label.innerHTML);
                    edit.style.display = 'inline';
                    edit.focus();
                    i = 0;
                }
            }, false);
            //输入框失焦完成编辑
            var edit = element.querySelector('.edit');
            edit.addEventListener('blur', function () {
                edit.style.display = 'none';
                label.style.display = 'inline';
            }, false);
            //输入框对键盘事件的响应
            edit.addEventListener('keyup', function (ev) {
                if (ev.keyCode == 27) { // Esc
                    edit.style.display = 'none';
                    label.style.display = 'inline';
                }
                else if (ev.keyCode == 13) {// Enter
                    if (edit.value == '') {
                        console.warn('输入不得为空');
                        return;
                    }
                    else {
                        label.innerHTML = edit.value;
                        item.msg = edit.value;
                        edit.style.display = 'none';
                        label.style.display = 'inline';
                    }
                    update();
                }
            }, false);
            //给checkbox绑定事件
            var checkbox = element.querySelector('.toggle');
            checkbox.addEventListener('touchstart', function (ev) {
                ev.stopPropagation();
                item.cmp = !item.cmp;
                update();
            }, false);
            //绑定touch事件，左滑删除
            var initX;
            var moveX;
            var x = 0;
            var objX = 0;
            element.addEventListener('touchstart', function (ev) {
                ev.preventDefault();
                initX = ev.targetTouches[0].pageX;
                objX = (element.style.WebkitTransform.replace(/translateX\(/g, "").replace(/px\)/g, "")) * 1;
                if (objX == 0) {
                    element.addEventListener('touchmove', function (ev) {
                        ev.preventDefault();
                        moveX = ev.targetTouches[0].pageX;
                        x = moveX - initX;
                        var l = Math.abs(x);
                        if (x >= 0) {//右滑
                            element.style.WebkitTransform = "translateX(" + l + "px)";
                            if (l > 300) {
                                l = 300;
                                element.style.WebkitTransform = "translateX(" + l + "px)";
                            }
                        }
                        else if (x < 0) {//左滑
                            element.style.WebkitTransform = "translateX(" + -l + "px)";
                            if (l > 300) {
                                l = 300;
                                element.style.WebkitTransform = "translateX(" + -l + "px)";
                            }
                        }
                    });
                }
            }, false);
            element.addEventListener('touchend', function (event) {
                event.preventDefault();
                objX = (element.style.WebkitTransform.replace(/translateX\(/g, "").replace(/px\)/g, "")) * 1;
                if (objX > -80 && objX < 80) {//没有触发任何事件
                    element.style.WebkitTransform = "translateX(" + 0 + "px)";
                    objX = 0;
                } else if (objX <= -80) {//触发删除
                    data.items.splice(index, 1);
                    element.style.WebkitTransform = "translateX(" + -300 + "px)";
                    update();
                }
                else {//触发完成
                    item.cmp = 1;
                    element.style.WebkitTransform = "translateX(" + 300 + "px)";
                    update();
                }
            })
            todo_list.insertBefore(element, todo_list.firstChild);
        }

    });
    //修改未完成数
    var list_num = $('.list-num');
    list_num.innerHTML = "剩余：" + active_num;
    //修改筛选和排序选项
    var is_cmp = $('.is-cmp');
    is_cmp.value = data.filter;
    var sort_level = $('.sort-level');
    sort_level = data.sort;
}
//加载页面
window.onload = function () {
    model.init(function () {
        var data = model.data;
        //点击实现清单隐藏或显示
        var icon = $('.icon');
        icon.addEventListener('click', function () {
            var todo_list = $('#todo-list');
            if (todo_list.style.display == 'block')
                todo_list.style.display = 'none';
            else
                todo_list.style.display = 'block';
        }, false);


        //使表单默认显示当前日期和时间
        var input_date = $('.input-date')
        var input_time = $('.input-time')
        var date = new Date();
        var month = ((date.getMonth() + 1) > 9) ? (date.getMonth() + 1) : ("0" + (date.getMonth() + 1));
        var dateString = date.getFullYear() + "-" + month + "-" + translate(date.getDate());
        var timeString = translate(date.getHours()) + ":" + translate(date.getMinutes());
        input_time.value = timeString;
        input_date.value = dateString;

        //点击+号实现输入框显示
        var input = $('.input-btn');
        input.addEventListener('click', function (ev) {
            var input_box = $('.input-box');
            input_box.style.display = 'block';
            var cover = $('#cover');
            cover.style.height = window.screen.height + "px";
            cover.style.display = "block";
            var input_text = $('.input-text');
            input_text.focus();
            ev.stopPropagation();
        }, false);

        //不聚焦在表单之后表单进行隐藏
        document.addEventListener('click', function () {
            var input_box = $('.input-box');
            if (input_box.style.display == 'block') {
                input_box.style.display = 'none';
                var cover = $('#cover');
                cover.style.display = "none";
            }
        }, false);
        //绑定form本身的click，防止调用document的click
        var input_box = $('.input-box');
        input_box.addEventListener('click', function (ev) {
            ev.stopPropagation();
        }, false);
        //给输入控件绑定键盘事件
        var text = $('.input-text');
        text.addEventListener('keyup', function (ev) {
            if (ev.keyCode != 13) return; // Enter
            if (text.value == '') {
                console.warn('输入不得为空！');
                return;
            }
            var input_date = $('.input-date').value;
            var input_time = $('.input-time').value;
            var input_level = $('.input-level');
            var level_num = 2;
            if (input_level.value == 'low') level_num = 0;
            else if (input_level.value == 'middle') level_num = 1;
            data.items.push({
                id: data.number, msg: text.value, cmp: false,
                datetime: input_date + '-' + input_time, date: input_date, time: input_time, level: level_num
            });
            data.number++;
            data.cmpall = 1;
            update();
        }, false);
        //给输入控件绑定submit事件
        var submit = $('.submit');
        submit.addEventListener('click', function (ev) {
            if (text.value != '') {
                var input_date = $('.input-date').value;
                var input_time = $('.input-time').value;
                var input_level = $('.input-level');
                var level_num = 2;
                if (input_level.value == 'low') level_num = 0;
                else if (input_level.value == 'middle') level_num = 1;
                data.items.push({
                    id: data.number, msg: text.value, cmp: false,
                    datetime: input_date + ' ' + input_time, date: input_date, time: input_time, level: level_num
                });
                data.number++;
                data.cmpall = 1;
                update();
            }
        }, false);
        //给排序选择框绑定事件
        var sort_level = $('.sort-level');
        sort_level.addEventListener('change', function () {
            data.sort = sort_level.value;
            update();
        }, false);
        //给筛选选择框绑定事件
        var is_cmp = $('.is-cmp');
        is_cmp.addEventListener('change', function () {
            data.filter = is_cmp.value;
            update();
        }, false);
        //给全部完成/取消按钮绑定事件
        var cmp_all = $('.cmp-all');
        cmp_all.addEventListener('click', function (ev) {
            data.items.forEach(function (item) {
                if (data.cmpall) item.cmp = true;
                else item.cmp = false;
            });
            data.cmpall = !data.cmpall;
            update();
        }, false);
        //给删除已完成按钮绑定事件
        var clr_cmp = $('.clr-cmp');
        clr_cmp.addEventListener('click', function (ev) {
            var newItems = [];
            data.items.forEach(function (item) {
                if (!item.cmp)
                    newItems.push(item);
            });
            data.items = newItems;
            update();
        }, false);
        update();
    })
}