# 1. 软件和硬件准备

## 1.1 本节要点

本节学习如何搭建开发环境，硬件接线，为我们后续的学习做好基础必要的准备。

## 1.2资料准备 

本文档所有用到的资料获取页面： [http://download.100ask.net/boards/Renesas/DShanMCU-RA6M5/index.html](http://download.100ask.net/boards/Renesas/DShanMCU-RA6M5/index.html)

## 1.3 软件准备

确保你的 windows 系统电脑已经安装(或以上版本) **setup_fsp_v4_5_0_e2s_v2023-04.exe** ： 

- Renesas官网获取：[https://www.renesas.cn/cn/zh/software-tool/e2studio-information-ra-family](https://www.renesas.cn/cn/zh/software-tool/e2studio-information-ra-family)
- Renesas官方仓库获取[https://github.com/renesas/fsp/releases](https://github.com/renesas/fsp/releases)

## 1.4 硬件准备

我们将用到如下开发套件：

| 名称                          | 数量 |
| :----------------------------- | :---- |
| [DShanMCU-RA6M5开发板（板载DAP）](https://item.taobao.com/item.htm?id=728461040949)         | 1块    |
| 320*480分辨率3.5寸带触摸LCD屏 | 1块    |
| 瑞萨 EZ-CUBE3 MCU调试器/烧录器(可选) | 1个 |
| EZ-CUBE3调试器转接线(可选) | 1根 |
| USB Type-C数据线          | 1根     |
| MB-102面包板          | 1块     |
| 面包板线         | 1扎(65根)     |
| 按键          | 10个     |
| 单色LED灯(红、绿、蓝各3个)          | 共9个     |
| 220欧电阻            | 10个     |
| EC11旋转编码器模块            | 1个     |


> 上面表格中除去可选部分的其他硬件可以在这里获取(选LVGL学习套餐)： [https://item.taobao.com/item.htm?id=728461040949](https://item.taobao.com/item.htm?id=728461040949)

套件所有内容(不包含可选部分)，如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-1/chapter-1_001-1.jpg" alt="chapter-1_001" style="zoom: 67%;" />



### 1.4.1 硬件接线

1. DShanMCU-RA6M5开发板和屏幕的接线，默认是已经接好，不需要额外接线。

> 如果使用板载DAP并且不使用EZ-CUBE3，则不需要阅读下面2-5点。板载DAP的配置请阅读：[在e2studio中使用DAP进行开发调试](../e2studio_use_dap/chapter1.md)

2. DShanMCU-RA6M5开发板和调试器转接线接线，按照下图接好：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-1/chapter-1_002.png" alt="chapter-1_002" style="zoom:80%;" />

3. 调试器转接线和瑞萨 EZ-CUBE3 的接线，请认真对比接线，没接对则无法进行烧写、调试，接线示意图：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-1/chapter-1_003.png" alt="chapter-1_003" style="zoom:80%;" />

4. EZ-CUBE3 的接线拨码开关按下图拨动：

![chapter-1_003-2](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-1/chapter-1_003-1.png)

5. DShanMCU-RA6M5开发板+调试器转接线+瑞萨 EZ-CUBE3的整体接线如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-1/chapter-1_003-2.png" alt="chapter-1_003-1" style="zoom:80%;" />

6. DShanMCU-RA6M5开发板和EC11旋转编码器的接线，请认真对比接线，没结对则无法通过编码器操作LVGL的UI，接线示意图：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-1/chapter-1_004.png" alt="chapter-1_004" style="zoom:80%;" />

7. DShanMCU-RA6M5开发板有两个Type-C接口，一个是Debug功能接口(下图左侧)，一个是OTG功能接口(下图右侧)，一般情况下只接Debug接口即可，接线示意图：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-1/chapter-1_005.png" alt="chapter-1_005" style="zoom: 67%;" />

## 1.5 EZ-CUBE3调试器使用注意事项

> 如果使用板载DAP并且不使用EZ-CUBE3，则不需要阅读这里。板载DAP的配置请阅读：[在e2studio中使用DAP进行开发调试](../e2studio_use_dap/chapter1.md)

- 调试器连接到电脑不要通过usb hub(供电不稳定)。
- 调试器并没有对板子供电，因此板子要额外单独供电。
- 调试器转接线接到板子上要确保，板子上两排排针都已经接上，没有裸露出来的排针(参考上面第2步接线图)。
- 将e2studio中原有的debug配置删除之后，再新建自己的debug配置。
- 如果出现调试器无法工作的情况，将调试器接到电脑的usb线重新插拔，并且删除、新建debug配置之后再重新尝试。
- 如果上述方法都未解决问题，请检查硬件接线是否正确。之后在e2stduio中检查 `Debug Configuration...->(选择相应的debug配置文件)->Debugger->Connection Settings` 中的 **TrustZone** 是否为 **No**。
- 最后，如果仍未解决问题，请在社区留言： [https://forums.100ask.net/c/renesas/ra6m5/78](https://forums.100ask.net/c/renesas/ra6m5/78)


<center>本节完</center>

<div STYLE="page-break-after: always;"></div>
