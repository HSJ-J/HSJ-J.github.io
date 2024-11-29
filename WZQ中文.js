"use strict";

//弹出信息
var 弹出信息_flag = true; //true 弹出信息 ;false no 弹出信息
var 弹出信息_timer;
function 弹出信息(msg, color, time) {
  if (!弹出信息_flag) return;
  var tobj = document.querySelector("#弹出信息");
  tobj.style.color = color;
  tobj.style.opacity = 1;
  tobj.innerHTML = msg;
  clearTimeout(弹出信息_timer);

  var ttime = 2000;
  if (time) ttime = time;
  弹出信息_timer = setTimeout(function () {
    var tobj = document.querySelector("#弹出信息");
    tobj.style.opacity = 0;
    tobj.style.color = "#fff";
  }, ttime);
}
function 弹出信息_flag_change(flag) {
  弹出信息_flag = flag;
}

弹出信息("加载中...");

//复制粘贴
function 复制内容(text) {
  var input = document.createElement("input");
  input.style.opacity = 0;
  input.style.pointerEvents = "none";
  document.body.appendChild(input);
  input.value = text;
  input.select();
  input.setSelectionRange(0, text.length);
  document.execCommand("copy");
  document.body.removeChild(input);
}

function 粘贴内容() {
  var copy = navigator.clipboard.readText();
  copy.then(function (text) {
    console.log(text);
    return text;
  });
}

var 我的名称 = ""; // 自己填写的名称
var 对方名称 = "对方"; // 初始的对方名称

function 保存名称() {
  const 用户名 = document.getElementById("用户名").value.trim();

  if (!用户名) {
    弹出信息("请先输入您的名称", "red"); // 提示用户输入
    return;
  }

  我的名称 = 用户名; // 保存自己的名称

  // 隐藏名称输入框，显示角色选择按钮
  document.querySelector(".用户名输入").style.display = "none";
  document.querySelector(".连接信息").style.display = "flex";
}

var canvas = document.querySelector("#canvas");
var ctx = canvas.getContext("2d");

var 总宽度, 总高度, 基础宽度, 基础高度, 基础宽高;

//window resize
function windowResize() {
  总宽度 = window.innerWidth * window.devicePixelRatio;
  总高度 = window.innerHeight * window.devicePixelRatio;

  var tcanvas = document.querySelectorAll(".canvas");
  for (var i = 0; i < tcanvas.length; i++) {
    tcanvas[i].style = "transform: scale(" + 1 / window.devicePixelRatio + ")";
    tcanvas[i].style.width = 总宽度 + "px";
    tcanvas[i].style.height = 总高度 + "px";
    tcanvas[i].width = 总宽度;
    tcanvas[i].height = 总高度;
  }

  基础宽度 = 总宽度 / 100;
  基础高度 = 总高度 / 100;

  基础宽高 = Math.min(基础宽度, 基础高度);
}
windowResize();

window.onresize = function () {
  windowResize();
};

//用户数据 Control-->
var 用户数据 = { x: 0, y: 0, z: 0, oldx: 0, oldy: 0, 缩放: 8 };
var 点击数据 = { 按下: { x: -1, y: -1 }, 移动: { x: -1, y: -1 }, 状态: "无" };

function 放大() {
  用户数据.缩放 *= 2;
  if (用户数据.缩放 > 32) 用户数据.缩放 = 32;
  重绘标志 = true;
}

function 缩小() {
  用户数据.缩放 /= 2;
  if (用户数据.缩放 < 1 / 32) 用户数据.缩放 = 1 / 32;
  重绘标志 = true;
}

function 中心位置() {
  用户数据.x = 0;
  用户数据.y = 0;
  用户数据.z = 0;
  用户数据.oldx = 0;
  用户数据.oldy = 0;
  重绘标志 = true;
}

//局域网联机
var 主机端标志 = false;
var 客户端标志 = false;

var 主机端 = {};
var 客户端 = {};

function 显示粘贴连接() {
  var tobj = document.querySelector(".粘贴信息");
  tobj.style.opacity = 1;
  tobj.style.pointerEvents = "auto";
}
//主机端初始化，生成RTC连接
function 主机端初始化() {
  主机端 = new RTCPeerConnection();
  主机端.主机端频道 = 主机端.createDataChannel("channel");
  主机端.主机端频道.onmessage = function (e) {
    主机端处理(JSON.parse(e.data), "客户端");
    const 数据 = JSON.parse(e.data); // 确保解析数据
    if (数据.类型 === "初始化信息") {
      对方名称 = 数据.名称; // 接收客户端发送的名称
      显示游戏数据(); // 更新显示
    }
  };
  主机端.主机端频道.onopen = function (e) {
    弹出信息("主机端连接开启");
    主机端发送信息({ 类型: "初始化信息", 名称: 我的名称 });
  };
  主机端.onicecandidate = function (e) {
    复制内容(JSON.stringify(主机端.localDescription));
    弹出信息("已复制连接信息");
    显示粘贴连接();
  };

  主机端
    .createOffer()
    .then((o) => 主机端.setLocalDescription(o))
    .then((a) => {
      弹出信息("成功设置主机端连接");
    });
}
//客户端初始化，生成RTC连接
function 客户端初始化(主机端连接信息) {
  客户端 = new RTCPeerConnection();
  客户端.onicecandidate = function (e) {
    复制内容(JSON.stringify(客户端.localDescription));
    弹出信息("已复制连接信息");
  };
  客户端.ondatachannel = function (e) {
    客户端.客户端频道 = e.channel;
    客户端.客户端频道.onmessage = function (e) {
      客户端处理(JSON.parse(e.data));
      if (数据.类型 === "初始化信息") {
        对方名称 = 数据.名称; // 接收主机端发送的名称
        显示游戏数据(); // 更新显示
      }
    };
    客户端.客户端频道.onopen = function (e) {
      弹出信息("客户端开启连接");
      if (客户端.客户端频道.readyState === "open") {
        客户端发送信息({ 类型: "初始化信息", 名称: 我的名称 }); // 发送自己的名称
      }
    };
  };
  客户端
    .setRemoteDescription(主机端连接信息)
    .then((a) => 弹出信息("客户端成功设置主机端端连接信息"));
  客户端
    .createAnswer()
    .then((a) => 客户端.setLocalDescription(a))
    .then((a) => 弹出信息("成功设置客户端回复主机端连接"));
}

function 主机端连接客户端(客户端连接信息) {
  主机端.setRemoteDescription(客户端连接信息);
  setTimeout(function () {
    游戏初始化();
    全局游戏数据.游戏开始 = true;
    连接信息隐藏();
  }, 1000);
}

function 主机端发送信息(data) {
  if (主机端.主机端频道.bufferedAmount > 0) return;
  if (主机端.主机端频道.readyState != "open") return;

  //拆分大消息为小消息
  var tdata = JSON.stringify(data);
  if (tdata.length > 1000) {
    //拆分消息
    var ttime = new Date().getTime();
    for (var i = 0; i < tdata.length; i += 1000) {
      var tlastflag = false;
      if (tdata.length - i < 1000) {
        tlastflag = true;
      }
      try {
        主机端.主机端频道.send(
          JSON.stringify({
            类型: "分数据",
            数据: {
              结束: tlastflag,
              编号: i,
              时间: ttime,
              数据: tdata.slice(i, i + 1000),
            },
          })
        );
      } catch (e) {
        console.log(e);
        弹出信息("连接断开");
        全局游戏数据.游戏开始 = false;
      }
    }
    return;
  }

  try {
    主机端.主机端频道.send(JSON.stringify(data)); //主机端发送信息
  } catch (e) {
    console.log(e);
    弹出信息("连接断开");
    全局游戏数据.游戏开始 = false;
  }
}

function 客户端发送信息(data) {
  客户端.客户端频道.send(JSON.stringify(data)); //客户端发送信息
}
//选择主机端或者是客户端
function 选择主机端() {
  主机端标志 = true;
  客户端标志 = false;
  对方名称 = "等待对方连接";
  var tobj = document.querySelector(".选择按钮背景");
  tobj.innerHTML = "主机端";
  tobj.style = "justify-content:center";

  主机端初始化();
  显示游戏数据();
}

function 选择客户端() {
  客户端标志 = true;
  主机端标志 = false;
  对方名称 = "等待对方连接";
  var tobj = document.querySelector(".选择按钮背景");
  tobj.innerHTML = "客户端";
  tobj.style = "justify-content:center";
  显示粘贴连接();
  显示游戏数据();
}
//连接信息确认
var 对方连接信息;
function 粘贴连接信息() {
  var copy = navigator.clipboard.readText();
  copy.then(function (text) {
    对方连接信息 = text;
    对方连接信息确认();
  });
}

function 对方连接信息确认() {
  if (客户端标志) {
    客户端初始化(JSON.parse(对方连接信息));
    对方名称 = "主机端玩家";
    显示游戏数据();
    return true;
  }
  if (主机端标志) {
    主机端连接客户端(JSON.parse(对方连接信息));
    对方名称 = "客户端玩家";
    显示游戏数据();
    return true;
  }
  弹出信息("请先选择主机端或客户端");
  return false;
}

var 连接信息显示 = true;
function 连接信息隐藏() {
  if (!连接信息显示) return;
  连接信息显示 = false;
  开始游戏后关闭界面();
}

function 开始游戏后关闭界面() {
  if (连接信息显示) return;
  var tobj = document.querySelector(".连接信息");
  tobj.style.opacity = 0;
  tobj.style.pointerEvents = "none";
  var tobj = document.querySelector(".粘贴信息");
  tobj.style.pointerEvents = "none";
}

//自定义信息处理
//统一操作通道
//{类型:"操作数据",数据:操作数据}
function 操作数据(data) {
  if (客户端标志) {
    客户端发送信息(data, "客户端");
  } else {
    主机端处理(data, "主机端");
  }
}

function 主机端处理(数据, 来源) {
  switch (数据.类型) {
    case "操作数据":
      if (全局游戏数据.步数 != 数据.数据.步数) return;
      //???
      if (数据.数据.位置.x < 0) return;
      if (数据.数据.位置.y < 0) return;
      if (数据.数据.位置.x > 全局游戏数据.棋盘尺寸) return;
      if (数据.数据.位置.y > 全局游戏数据.棋盘尺寸) return;

      if (主机端标志 && 全局游戏数据.结束 != "") {
        if (全局游戏数据.颜色.主机端 == 全局游戏数据.结束) {
          全局游戏数据.比分.主机端++;
        } else if (全局游戏数据.颜色.客户端 == 全局游戏数据.结束) {
          全局游戏数据.比分.客户端++;
        }
        全局游戏数据初始化(true);
        return;
      } else if (客户端标志 && 全局游戏数据.结束 != "") {
        return;
      }

      if (全局游戏数据.下棋方 != 来源) return;

      if (全局游戏数据.棋盘[数据.数据.位置.x][数据.数据.位置.y] != 0) return;
      var tcolor = "黑";
      switch (全局游戏数据.下棋方) {
        case "主机端":
          tcolor = 全局游戏数据.颜色.主机端;
          break;
        case "客户端":
          tcolor = 全局游戏数据.颜色.客户端;
          break;
      }

      if (tcolor == "黑") {
        tcolor = 1;
      } else {
        tcolor = 2;
      }

      全局游戏数据.棋盘[数据.数据.位置.x][数据.数据.位置.y] = tcolor;

      全局游戏数据.步数++;
      if (全局游戏数据.下棋方 == "主机端") {
        全局游戏数据.下棋方 = "客户端";
      } else {
        全局游戏数据.下棋方 = "主机端";
      }

      //判断游戏是否结束
      var endflag = false;
      var tcolor;
      //从一个子开始 向右 向下 斜向下 查找连续5个同色
      for (var i = 0; i <= 全局游戏数据.棋盘尺寸; i++) {
        for (var j = 0; j <= 全局游戏数据.棋盘尺寸; j++) {
          tcolor = 全局游戏数据.棋盘[i][j];
          if (tcolor == 0) continue;
          endflag = true;
          //向右
          if (i + 4 <= 全局游戏数据.棋盘尺寸) {
            for (var d = 1; d < 5; d++) {
              var ttcolor = 全局游戏数据.棋盘[i + d][j];
              if (tcolor != ttcolor) {
                endflag = false;
                break;
              }
            }
          } else {
            endflag = false;
          }
          if (endflag) {
            break;
          }
          endflag = true;
          //向下
          if (j + 4 <= 全局游戏数据.棋盘尺寸) {
            for (var d = 1; d < 5; d++) {
              var ttcolor = 全局游戏数据.棋盘[i][j + d];
              if (tcolor != ttcolor) {
                endflag = false;
                break;
              }
            }
          } else {
            endflag = false;
          }
          if (endflag) {
            break;
          }
          endflag = true;
          //斜向右下
          if (
            i + 4 <= 全局游戏数据.棋盘尺寸 &&
            j + 4 <= 全局游戏数据.棋盘尺寸
          ) {
            for (var d = 1; d < 5; d++) {
              var ttcolor = 全局游戏数据.棋盘[i + d][j + d];
              if (tcolor != ttcolor) {
                endflag = false;
                break;
              }
            }
          } else {
            endflag = false;
          }
          if (endflag) {
            break;
          }
          endflag = true;
          //斜向左下
          if (i - 4 >= 0 && j + 4 <= 全局游戏数据.棋盘尺寸) {
            for (var d = 1; d < 5; d++) {
              var ttcolor = 全局游戏数据.棋盘[i - d][j + d];
              if (tcolor != ttcolor) {
                endflag = false;
                break;
              }
            }
          } else {
            endflag = false;
          }
          if (endflag) {
            break;
          }
        }
        if (endflag) {
          break;
        }
      }
      if (endflag) {
        switch (tcolor) {
          case 1:
            全局游戏数据.结束 = "黑";
            break;
          case 2:
            全局游戏数据.结束 = "白";
            break;
        }
      } else {
        for (var i = 0; i <= 全局游戏数据.棋盘尺寸; i++) {
          for (var j = 0; j <= 全局游戏数据.棋盘尺寸; j++) {
            tcolor = 全局游戏数据.棋盘[i][j];
            if (tcolor == 0) return;
          }
        }
        全局游戏数据.结束 = "平局";
      }
      break;
    default:
      return;
  }
}

var 客户端分数据缓存 = { 时间: -1, 上个编号: -1, 数据: [] };
function 客户端处理(数据) {
  switch (数据.类型) {
    case "初始化信息":
      对方名称 = 数据.名称; // 更新对方名称
      显示游戏数据();
      break;
    case "分数据":
      //过期数据
      if (客户端分数据缓存.时间 > 数据.数据.时间) break;
      if (
        客户端分数据缓存.时间 == 数据.数据.时间 &&
        客户端分数据缓存.编号 >= 数据.数据.编号
      )
        break;
      //新数据
      if (客户端分数据缓存.时间 < 数据.数据.时间) {
        客户端分数据缓存.时间 = 数据.数据.时间;
        客户端分数据缓存.上个编号 = 数据.数据.编号;
        客户端分数据缓存.数据 = 数据.数据.数据;
        break;
      }
      //连续数据
      客户端分数据缓存.上个编号 = 数据.数据.编号;
      客户端分数据缓存.数据 = 客户端分数据缓存.数据.concat(数据.数据.数据);
      //最后一个数据
      if (数据.数据.结束) {
        //合成一个完整数据
        try {
          客户端处理(JSON.parse(客户端分数据缓存.数据));
        } catch (e) {
          //客户端分数据缓存.数据=[];
          break;
        }
      }
      break;
    case "全局游戏数据":
      更新全局游戏数据(数据.数据);
      连接信息隐藏();
      break;
    case "提示信息":
      弹出信息(数据.数据);
      break;
    default:
      return;
  }
}

//游戏-五子棋
var 全局游戏数据 = {};

function 游戏初始化() {
  全局游戏数据初始化();
  显示游戏数据();
}

function 全局游戏数据初始化(结束) {
  if (结束) {
    全局游戏数据.棋盘 = [];
    for (var i = 0; i <= 全局游戏数据.棋盘尺寸; i++) {
      全局游戏数据.棋盘[i] = [];
      for (var j = 0; j <= 全局游戏数据.棋盘尺寸; j++) {
        全局游戏数据.棋盘[i][j] = 0;
      }
    }
    全局游戏数据.步数 = 0;
    全局游戏数据.结束 = "";
    return;
  }
  全局游戏数据 = {
    游戏开始: false,
    棋盘尺寸: 19,
    棋盘: [],
    下棋方: "主机端",
    颜色: { 主机端: "黑", 客户端: "白" },
    比分: { 主机端: 0, 客户端: 0 },
    步数: 0,
    结束: "",
  };
  for (var i = 0; i <= 全局游戏数据.棋盘尺寸; i++) {
    全局游戏数据.棋盘[i] = [];
    for (var j = 0; j <= 全局游戏数据.棋盘尺寸; j++) {
      全局游戏数据.棋盘[i][j] = 0;
    }
  }
}

function 更新全局游戏数据(数据) {
  全局游戏数据 = 数据;
  显示游戏数据();
}

function 发送更新数据() {
  var t显示数据 = JSON.parse(JSON.stringify(全局游戏数据));
  主机端发送信息({ 类型: "全局游戏数据", 数据: t显示数据 });
}

function 显示游戏数据() {
  ctx.clearRect(0, 0, 总宽度, 总高度);

  var t缩放 = 用户数据.缩放;
  var tsize = (t缩放 * 基础宽高) / 2;
  var Ux = t缩放 * 用户数据.x;
  var Uy = t缩放 * 用户数据.y;

  //???
  //显示棋盘

  //绘制棋盘背景
  ctx.fillStyle = "#dab487";
  ctx.fillRect(
    Ux + 总宽度 / 2 + (-1 - 全局游戏数据.棋盘尺寸 / 2) * tsize,
    Uy + 总高度 / 2 + (-1 - 全局游戏数据.棋盘尺寸 / 2) * tsize,
    tsize * (全局游戏数据.棋盘尺寸 + 2),
    tsize * (全局游戏数据.棋盘尺寸 + 2)
  );

  //绘制外框
  ctx.strokeStyle = "#000";
  ctx.lineWidth = tsize / 10;
  ctx.strokeRect(
    Ux + 总宽度 / 2 + (-1 - 全局游戏数据.棋盘尺寸 / 2) * tsize,
    Uy + 总高度 / 2 + (-1 - 全局游戏数据.棋盘尺寸 / 2) * tsize,
    tsize * (全局游戏数据.棋盘尺寸 + 2),
    tsize * (全局游戏数据.棋盘尺寸 + 2)
  );

  //绘制内框
  ctx.strokeRect(
    Ux + 总宽度 / 2 + (0 - 全局游戏数据.棋盘尺寸 / 2) * tsize,
    Uy + 总高度 / 2 + (0 - 全局游戏数据.棋盘尺寸 / 2) * tsize,
    tsize * 全局游戏数据.棋盘尺寸,
    tsize * 全局游戏数据.棋盘尺寸
  );

  //绘制内线
  ctx.lineWidth = tsize / 20;
  for (var i = 1; i < 全局游戏数据.棋盘尺寸; i++) {
    //横线
    ctx.beginPath();
    ctx.moveTo(
      Ux + 总宽度 / 2 + (0 - 全局游戏数据.棋盘尺寸 / 2) * tsize,
      Uy + 总高度 / 2 + (i - 全局游戏数据.棋盘尺寸 / 2) * tsize,
      tsize * 全局游戏数据.棋盘尺寸,
      tsize * 全局游戏数据.棋盘尺寸
    );
    ctx.lineTo(
      Ux +
        总宽度 / 2 +
        (全局游戏数据.棋盘尺寸 - 全局游戏数据.棋盘尺寸 / 2) * tsize,
      Uy + 总高度 / 2 + (i - 全局游戏数据.棋盘尺寸 / 2) * tsize,
      tsize * 全局游戏数据.棋盘尺寸,
      tsize * 全局游戏数据.棋盘尺寸
    );
    ctx.stroke();
    //竖线
    ctx.beginPath();
    ctx.moveTo(
      Ux + 总宽度 / 2 + (i - 全局游戏数据.棋盘尺寸 / 2) * tsize,
      Uy + 总高度 / 2 + (0 - 全局游戏数据.棋盘尺寸 / 2) * tsize,
      tsize * 全局游戏数据.棋盘尺寸,
      tsize * 全局游戏数据.棋盘尺寸
    );
    ctx.lineTo(
      Ux + 总宽度 / 2 + (i - 全局游戏数据.棋盘尺寸 / 2) * tsize,
      Uy +
        总高度 / 2 +
        (全局游戏数据.棋盘尺寸 - 全局游戏数据.棋盘尺寸 / 2) * tsize,
      tsize * 全局游戏数据.棋盘尺寸,
      tsize * 全局游戏数据.棋盘尺寸
    );
    ctx.stroke();
  }

  //显示棋子
  for (var i = 0; i <= 全局游戏数据.棋盘尺寸; i++) {
    for (var j = 0; j <= 全局游戏数据.棋盘尺寸; j++) {
      var tobj = 全局游戏数据.棋盘[i][j];
      switch (tobj) {
        case 0:
          continue;
          break;
        case 1:
          ctx.fillStyle = "#000";
          break;
        case 2:
          ctx.fillStyle = "#fff";
          break;
      }
      ctx.beginPath();
      ctx.arc(
        Ux + 总宽度 / 2 + (i - 全局游戏数据.棋盘尺寸 / 2) * tsize,
        Uy + 总高度 / 2 + (j - 全局游戏数据.棋盘尺寸 / 2) * tsize,
        tsize / 2.2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  //显示信息
  //显示下棋方
  ctx.fillStyle = "#222";
  var tstr;
  var twidth, theight;
  var tx, ty;
  tx = 总宽度 / 2;

  ctx.font = 基础宽高 * 4 + "px Arial";
  theight = ctx.measureText("O").width * 1.5;

  // 拼接主机端和客户端的名称
  var 主机名称 = 主机端标志 ? 我的名称 : 对方名称; // 主机端的名称
  var 客户名称 = 主机端标志 ? 对方名称 : 我的名称; // 客户端的名称
  var 名称字符串 = 主机名称 + " : " + 客户名称;

  // 计算文本宽度并居中绘制
  var 文本宽度 = ctx.measureText(名称字符串).width;
  var 文本位置X = (总宽度 - 文本宽度) / 2; // 居中位置
  var 文本位置Y = 2 * 基础宽高 + ctx.measureText("O").width * 1.5; // 距顶部的高度

  ctx.fillText(名称字符串, 文本位置X, 文本位置Y);

  tstr = 全局游戏数据.比分.主机端 + ":" + 全局游戏数据.比分.客户端;
  twidth = ctx.measureText(tstr).width;
  ty = 10 * 基础宽高;
  ctx.fillText(tstr, tx - twidth / 2, ty + theight);

  if (全局游戏数据.结束 != "") {
    ctx.fillStyle = "#dd2222";
    ctx.font = 基础宽高 * 10 + "px Arial";
    theight = ctx.measureText("O").width * 1.5;

    tstr = "你失败了 继续努力";

    if (全局游戏数据.结束 == "黑" && 主机端标志) {
      tstr = "你赢了";
    } else if (全局游戏数据.结束 == "白" && 客户端标志) {
      tstr = "你赢了";
    } else if (全局游戏数据.结束 == "平局") {
      tstr = "平局";
    }

    twidth = ctx.measureText(tstr).width;
    ty = 总高度 / 2;
    ctx.fillText(tstr, tx - twidth / 2, ty - theight);
  } else {
    tstr = "下棋方:" + (全局游戏数据.下棋方 === "主机端" ? "主机端" : "客户端");
    twidth = ctx.measureText(tstr).width;
    ty = 总高度 - 2 * 基础宽高;
    ctx.fillText(tstr, tx - twidth / 2, ty - theight);

    if (
      (全局游戏数据.下棋方 == "主机端" && 主机端标志) ||
      (全局游戏数据.下棋方 == "客户端" && 客户端标志)
    ) {
      ctx.fillStyle = "#22dd22";
      tstr = "到你了(";
      if (全局游戏数据.下棋方 === "主机端") {
        tstr = "到你了(黑)";
      } else {
        tstr = "到你了(白)";
      }
      twidth = ctx.measureText(tstr).width;
      ty = 总高度 - 10 * 基础宽高;
      ctx.fillText(tstr, tx - twidth / 2, ty - theight);
    } else {
      ctx.fillStyle = "#dddd22";
      tstr = "请等待(";
      if (全局游戏数据.下棋方 === "主机端") {
        tstr = "请等待(白)";
      } else {
        tstr = "请等待(黑)";
      }
      twidth = ctx.measureText(tstr).width;
      ty = 总高度 - 10 * 基础宽高;
      ctx.fillText(tstr, tx - twidth / 2, ty - theight);
    }
  }
}

var 上次发送数据时间 = Date.now();
var 重绘标志 = false;
function 游戏运作() {
  if (!全局游戏数据 || !全局游戏数据.游戏开始) {
    requestAnimationFrame(游戏运作);
    return;
  }

  if (主机端标志 && Date.now() - 上次发送数据时间 > 100) {
    //???
    发送更新数据();
    上次发送数据时间 = Date.now();

    显示游戏数据();
  } else {
    if (重绘标志) {
      重绘标志 = false;
    }
  }

  显示游戏数据();

  requestAnimationFrame(游戏运作);
}
游戏运作();

//控制事件
canvas.onmousedown = function (e) {
  var x = e.clientX * window.devicePixelRatio;
  var y = e.clientY * window.devicePixelRatio;

  点击数据.状态 = "按下";
  点击数据.按下.x = x;
  点击数据.按下.y = y;
  重绘标志 = true;
};

canvas.onmousemove = function (e) {
  var x = e.clientX * window.devicePixelRatio;
  var y = e.clientY * window.devicePixelRatio;

  点击数据.移动.x = x;
  点击数据.移动.y = y;

  if (点击数据.状态 == "按下" || 点击数据.状态 == "拖动") {
    点击数据.状态 = "拖动";
    用户数据.x =
      (点击数据.移动.x - 点击数据.按下.x) / 用户数据.缩放 + 用户数据.oldx;
    用户数据.y =
      (点击数据.移动.y - 点击数据.按下.y) / 用户数据.缩放 + 用户数据.oldy;
  } else {
    点击数据.状态 = "移动";
  }
  重绘标志 = true;
};

canvas.onmouseup = function (e) {
  var x = e.clientX * window.devicePixelRatio;
  var y = e.clientY * window.devicePixelRatio;

  if (点击数据.状态 == "按下") {
    if (
      (全局游戏数据.下棋方 == "主机端" && 主机端标志) ||
      全局游戏数据.结束 != "" ||
      (全局游戏数据.下棋方 == "客户端" && 客户端标志)
    ) {
      var tx = 点击数据.按下.x;
      var ty = 点击数据.按下.y;
      //转换为棋盘位置
      var t缩放 = 用户数据.缩放;
      var tsize = (t缩放 * 基础宽高) / 2;
      var Ux = t缩放 * 用户数据.x;
      var Uy = t缩放 * 用户数据.y;

      var nx, ny;
      nx = Math.floor(
        (点击数据.按下.x - Ux - 总宽度 / 2) / tsize +
          全局游戏数据.棋盘尺寸 / 2 +
          0.5
      );
      ny = Math.floor(
        (点击数据.按下.y - Uy - 总高度 / 2) / tsize +
          全局游戏数据.棋盘尺寸 / 2 +
          0.5
      );

      if (
        nx >= 0 &&
        ny >= 0 &&
        nx <= 全局游戏数据.棋盘尺寸 &&
        ny <= 全局游戏数据.棋盘尺寸
      ) {
        操作数据({
          类型: "操作数据",
          数据: { 位置: { x: nx, y: ny }, 步数: 全局游戏数据.步数 },
        });
      }
    }
  }

  点击数据.状态 = "无";

  用户数据.oldx = 用户数据.x;
  用户数据.oldy = 用户数据.y;
  重绘标志 = true;
};

//touch events
canvas.ontouchstart = function (e) {
  e.preventDefault();
  var x = e.touches[0].clientX * window.devicePixelRatio;
  var y = e.touches[0].clientY * window.devicePixelRatio;

  点击数据.状态 = "按下";
  点击数据.按下.x = x;
  点击数据.按下.y = y;
  重绘标志 = true;
};

canvas.ontouchmove = function (e) {
  var x = e.touches[0].clientX * window.devicePixelRatio;
  var y = e.touches[0].clientY * window.devicePixelRatio;

  点击数据.移动.x = x;
  点击数据.移动.y = y;

  if (点击数据.状态 == "按下" || 点击数据.状态 == "拖动") {
    //防抖动
    if (
      Math.abs(点击数据.移动.x - 点击数据.按下.x) +
        Math.abs(点击数据.移动.y - 点击数据.按下.y) <
      10 * window.devicePixelRatio
    )
      return;
    点击数据.状态 = "拖动";
    用户数据.x =
      (点击数据.移动.x - 点击数据.按下.x) / 用户数据.缩放 + 用户数据.oldx;
    用户数据.y =
      (点击数据.移动.y - 点击数据.按下.y) / 用户数据.缩放 + 用户数据.oldy;
  } else {
    点击数据.状态 = "移动";
  }
  重绘标志 = true;
};

canvas.ontouchend = function (e) {
  if (点击数据.状态 == "按下") {
    if (
      (全局游戏数据.下棋方 == "主机端" && 主机端标志) ||
      全局游戏数据.结束 != "" ||
      (全局游戏数据.下棋方 == "客户端" && 客户端标志)
    ) {
      var tx = 点击数据.按下.x;
      var ty = 点击数据.按下.y;
      //转换为棋盘位置
      var t缩放 = 用户数据.缩放;
      var tsize = (t缩放 * 基础宽高) / 2;
      var Ux = t缩放 * 用户数据.x;
      var Uy = t缩放 * 用户数据.y;

      var nx, ny;
      nx = Math.floor(
        (点击数据.按下.x - Ux - 总宽度 / 2) / tsize +
          全局游戏数据.棋盘尺寸 / 2 +
          0.5
      );
      ny = Math.floor(
        (点击数据.按下.y - Uy - 总高度 / 2) / tsize +
          全局游戏数据.棋盘尺寸 / 2 +
          0.5
      );

      if (
        nx >= 0 &&
        ny >= 0 &&
        nx <= 全局游戏数据.棋盘尺寸 &&
        ny <= 全局游戏数据.棋盘尺寸
      ) {
        操作数据({
          类型: "操作数据",
          数据: { 位置: { x: nx, y: ny }, 步数: 全局游戏数据.步数 },
        });
      }
    }
  }

  点击数据.状态 = "无";
  用户数据.oldx = 用户数据.x;
  用户数据.oldy = 用户数据.y;
  重绘标志 = true;
};
