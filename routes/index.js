var express = require('express');
var router = express.Router();
//使用 path.join 时 需要引入 path module
var path = require('path');
//使用 mysql 数据库 需要引入的 mysql module
var mysql = require('mysql');
// 数据库连接信息
var dbinfo = {
    //主机地址
    host: '127.0.0.1',
    //用户名
    user: 'root',
    //密码
    password: 'root',
    //端口
    port: '3306',
    //具体的数据库
    database: 'xj2014'
};
//-------------------------------------------------------------------------- 页面处理 begin
//返回主页面
router.get('/', function(req, res, next) {
    //读取静态文件返回
    // path.join()链接路径
    // __dirname 内置变量 指 当前文件路径
    //'../views/index.html' 相对路径
    res.sendFile(path.join(__dirname, '../views/index.html'));
    //直接读取文件
    // res.sendFile('/views/add.html');
    //另外的 拼接方式
    // res.sendFile('index.html', { root: path.join(__dirname, '../views') });
    //直接渲染模板 文件(index.ejs) 传递数据 tetle
    // res.render('index', { title: 'Express' });
});
//返回主页面
router.get('/index', function(req, res, next) {
    //读取静态文件返回
    res.sendFile(path.join(__dirname, '../views/index.html'));
});
//返回列表页面
router.get('/info', function(req, res, next) {
    //读取静态文件返回
    res.sendFile(path.join(__dirname, '../views/info.html'));
});
//返回添加页面
router.get('/add', function(req, res, next) {
    //读取静态文件返回
    res.sendFile(path.join(__dirname, '../views/add.html'));
});
//返回修改页面
router.get('/edit', function(req, res, next) {
    //读取静态文件返回
    res.sendFile(path.join(__dirname, '../views/edit.html'));
});
//------------------------------------------------------------------------页面处理 end

//数据处理
//首页数据
//all ->主要包括 get && post 方便调试 实际项目中需要做限制
router.all('/info/getpage', function(req, res, next) {
    //添加响应头的 "Access-Control-Allow-Origin", "*" 
    //允许跨域访问 * 代表所有
    res.header("Access-Control-Allow-Origin", "*");
    //准备变量
    var resData = {};
    //关键字
    var key;
    //页索引
    var pi;
    //每一页的大小
    var ps;
    //获取参数--POST  全部大写
    if (req.method == 'POST') {
        key = req.body.key || '';
        //如果转换成 10进制数失败则 置为 1
        if (isNaN(parseInt(req.body.pi, 10))) {
            pi = 1;
        } else {
            pi = parseInt(req.body.pi, 10);
        }
        //如果转换成 10进制数失败则 置为 1
        if (isNaN(parseInt(req.body.ps, 10))) {
            ps = 1;
        } else {
            ps = parseInt(req.body.ps, 10);
        }
    } else { //获取参数--get
        key = req.query.key || '';
        //如果转换成 10进制数失败则置为 1
        if (isNaN(parseInt(req.query.pi, 10))) {
            pi = 1;
        } else {
            pi = parseInt(req.query.pi, 10);
        }
        //如果转换成 10进制数失败则置为 1
        if (isNaN(parseInt(req.query.ps, 10))) {
            ps = 1;
        } else {
            ps = parseInt(req.query.ps, 10);
        }
    }

    //创建数据库连接
    var connect = mysql.createConnection(dbinfo);
    //打开数据库连接
    connect.connect();
    //执行数据库语句
    //callback 根据前面的 sql 的不同 会有不同的参数
    //connect.query(sql,param,callback)

    //查询数据
    connect.query('select * from userinfo where name like concat("%",?,"%") limit ?,? ', [key, ps * (pi - 1), ps], function(err, data, fidlds) {
        if (!err) {
            //保存数据
            resData.data = data;
            //查询数据总条数 用来计算分页
            connect.query('select count(*) as counts from userinfo where name like concat("%",?,"%")', [key], function(err1, data1, fidlds1) {
                if (!err1) {
                    //保存数据总条数
                    resData.count = data1[0].counts;
                    //关闭数据库连接
                    connect.end();
                    //返回数据给浏览器 json
                    res.send({ status: 1, message: resData });
                } else {
                    //返回数据给浏览器 json
                    res.send({ status: 0, message: err1 });
                }
            });
        } else {
            //返回数据给浏览器 json
            res.send({ status: 0, message: err });
        }
    });
});
//删除数据
router.post('/info/delinfo', function(req, res, next) {
    var id;
    //如果转换成 10进制数失败则返回错误信息
    if (isNaN(parseInt(req.body.id, 10))) {
        res.send({ status: 0, message: '非法的操作' });
    } else {
        id = parseInt(req.body.id, 10);
    }
    //创建数据库连接
    var connect = mysql.createConnection(dbinfo);
    //打开数据库连接
    connect.connect();
    //执行数据库语句
    connect.query('delete from userinfo where id=?', [id], function(err, data, fidlds) {
        //关闭数据库连接
        connect.end();
        //执行没有出错 并且 只操作了一条数据--------合理的话应该涉及到 事务回滚
        //返回相应的 json格式数据 
        if (!err && data.affectedRows == 1) {
            res.send({ status: 1, message: data });
        } else {
            res.send({ status: 0, message: err });
        }
    });
});
//获取单条数据
router.all('/info/oneinfo', function(req, res, next) {
    //定义变量
    var id;
    //获取参数--POST  全部大写
    if (req.method == "POST") {
        //如果转换成 10进制数失败则 置为 0
        if (isNaN(parseInt(req.body.id, 10))) {
            id = 0;
        } else {
            id = parseInt(req.body.id, 10);
        }
    } else { //get
        //如果转换成 10进制数失败则 置为 0
        if (isNaN(parseInt(req.query.id, 10))) {
            id = 0;
        } else {
            id = parseInt(req.query.id, 10);
        }
    }
    //id == 0 则表示出错了
    if (id != 0) {
        //创建数据库连接
        var connect = mysql.createConnection(dbinfo);
        //打开数据库连接
        connect.connect();
        //执行数据库语句
        connect.query('select * from userinfo where id=?', [id], function(err, data, fidlds) {
            connect.end();
            if (!err && data.length == 1) {
                //数据返回一个数字 我们查询的结果只是 第一条数据
                res.send({ status: 1, message: data[0] });
            } else {
                res.send({ status: 0, message: "未查询到相应数据" });
            }
        });
    } else {
        //参数错误则返回提示
        res.send({ status: 0, message: "参数id错误" });
    }
});

//修改数据
router.post('/edit/updinfo', function(req, res, next) {

    //post 
    //如果转换成 10进制数失败则 返回错误信息
    if (!isNaN(parseInt(req.body.id, 10))) {
        var id = parseInt(req.body.id, 10);
        if (req.body.num && req.body.classs && req.body.name && req.body.sex && req.body.nation && req.body.address) {
            //创建数据库连接
            var connect = mysql.createConnection(dbinfo);
            //打开数据库连接
            connect.connect();
            //执行数据库语句
            connect.query('update  userinfo set num=?,classs=?,name=?,sex=?,nation=?,address=? where id=?', [req.body.num, req.body.classs, req.body.name, req.body.sex, req.body.nation, req.body.address, req.body.id], function(err, data, fidlds) {
                //关闭连接
                connect.end();
                //没有错误 并且 影响行数为1--------合理的话应该涉及到 事务回滚
                if (!err && data.affectedRows == 1) {
                    res.send({ status: 1, message: data });
                } else {
                    res.send({ status: 0, message: err });
                }
            });
        } else {
            res.send({ status: 0, message: "参数错误" });
        }
    } else {
        res.send({ status: 0, message: "参数错误" });
    }
});

//添加数据
router.post('/add', function(req, res, next) {
    //判断修改字段是否存在
    if (req.body.num && req.body.classs && req.body.name && req.body.sex && req.body.nation && req.body.address) {
        //创建数据库连接
        var connect = mysql.createConnection(dbinfo);
        //打开数据库连接
        connect.connect();
        //执行数据库语句
        connect.query('insert into userinfo (num,classs,name,sex,nation,address ) values (?,?,?,?,?,?)', [req.body.num, req.body.classs, req.body.name, req.body.sex, req.body.nation, req.body.address], function(err, data, fidlds) {
            //关闭连接
            connect.end();
            //没有错误 并且 影响行数为1--------合理的话应该涉及到 事务回滚
            if (!err && data.affectedRows == 1) {
                res.send({ status: 1, message: data });
            } else {
                res.send({ status: 0, message: err });
            }
        });
    } else { //不都存在
        res.send({ status: 0, message: "参数错误" });
    }
});
module.exports = router;