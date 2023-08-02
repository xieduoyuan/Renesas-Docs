![chapter-1_000](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-1/chapter-1_000.png)

<div STYLE="page-break-after: always;"></div>

# 目录

[toc]

<div STYLE="page-break-after: always;"></div>

# 学习资源

- 瑞萨电子官网： [https://www.renesas.cn](https://www.renesas.cn)
- 瑞萨 RA MCU 生态社区： [https://www.ramcu.cn](https://www.ramcu.cn)
- DShanMCU-RA6M5技术交流QQ群： [881706770](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=LwH6qzFGzSNVwsIQtMta9JZrMcuzfTcb&authKey=96jtabNBcdn%2BbHCPa85j79brjcgntsG1d2YDRMiAvmO3DPRAyi9Vi7KGOAbbOYAP&noverify=0&group_code=881706770)
- DShanMCU-RA6M5开发板配套资料： [http://download.100ask.net/boards/Renesas/DShanMCU-RA6M5/index.html](http://download.100ask.net/boards/Renesas/DShanMCU-RA6M5/index.html)
- DShanMCU-RA6M5开发板购买链接： [https://100ask.taobao.com](https://100ask.taobao.com)
- 百问网在线学习平台： [https://www.100ask.net](https://www.100ask.net)
- 百问网bilibili： [https://space.bilibili.com/275908810](https://space.bilibili.com/275908810)
- 百问网技术交流社区： [https://forums.100ask.net](https://forums.100ask.net)

<div STYLE="page-break-after: always;"></div>


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
| [DShanMCU-RA6M5开发板](https://item.taobao.com/item.htm?id=728461040949)         | 1    |
| 瑞萨 EZ-CUBE3 MCU调试器/烧录器 | 1 |
| 调试器转接线 | 1 |
| 320*480分辨率3.5寸带触摸LCD屏 | 1    |
| EC11旋转编码器                   | 1     |
| 公对母杜邦线 | 1(排) |
| USB Type-C数据线 | 1 |

> DShanMCU-RA6M5开发板购买链接： [https://item.taobao.com/item.htm?id=728461040949](https://item.taobao.com/item.htm?id=728461040949)

套件所有内容，如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-1/chapter-1_001.png" alt="chapter-1_001" style="zoom: 67%;" />



### 1.4.1 硬件接线

1. DShanMCU-RA6M5开发板和屏幕的接线，默认是已经接好，不需要额外接线。

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

## 1.5 调试器使用注意事项
- 调试器连接到电脑不要通过usb hub(供电不稳定)。
- 调试器并没有对板子供电，因此板子要额外单独供电。
- 调试器转接线接到板子上要确保，板子上两排排针都已经接上，没有裸露出来的排针(参考上面第2步接线图)。
- 将e2studio中原有的debug配置删除之后，再新建自己的debug配置。
- 如果出现调试器无法工作的情况，将调试器接到电脑的usb线重新插拔，并且删除、新建debug配置之后再重新尝试。

-----

<center>本节完</center>

<div STYLE="page-break-after: always;"></div>

# 2. 创建第一个工程适配串口打印功能

本次实验我们通过创建一个简单的工程，在其基础上完成串口打印功能，从而熟悉[ e2stduio](https://www.renesas.cn/cn/zh/software-tool/e-studio)（Renesas MCU的一个基于Eclipse的集成开发环境（IDE）)）和[FSP](https://www.renesas.cn/cn/zh/software-tool/flexible-software-package-fsp)（灵活配置软件包）开发环境。在实验中我们的会比较详细地学习了解，如何在e2studio中对我们的硬件资源进行配置，如何在自己编写代码调用FSP帮我们配置好的 HAL 驱动程序，最终完成我们的任务需求。

这次实验我们的目标是完成串口打印，并能能通过使用 **printf** 函数打印信息。

> 注意：我们的内容比较多，课堂时间非常有限，因此在这第一个实验中，我们会尽可能将一些软件上的用法、一些需要注意的细节等等会尽可能得进行详细地讲解，在后面不会再进行详细地说明讲解，比如后续不会讲解工程如何创建、如何查看代码、如何翻阅帮助文档等等。

## 2.1创建步骤

### 2.1.1 创建项目

1. 打开 e2 studio，并打开 workspace 执行如下步骤：
2. 在菜单中选择 `“New"`。
3. 选择 `"Renesas C/C++ project"`。
4. 下拉菜单中选择 `"Renesas RA"`。

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_001.png" alt="chapter-2_001" style="zoom: 80%;" />

5. 在弹出的新窗口按照如下操作：

![chapter-2_002](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_002.png)

6. 在弹出的新窗口中的 `"Project name"` 处输入项目名称： **00_dshanmcu_ra6m5_uart_printf**，您也可以自定义名称。（注意不可以有中文、特殊字符！）

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_003.png" alt="chapter-2_003" style="zoom:67%;" />

7. 在弹出的新窗口中，需要进行一些配置，操作如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_004.png" alt="chapter-2_004" style="zoom:67%;" />

8. 下面两个窗口按照默认配置，点击 `"Next"` 按钮即可：

工程类型：` Flat (Non-TrustZone) Project`

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_005.png" alt="chapter-2_005" style="zoom:67%;" />

不使用RTOS：`No RTOS`

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_006.png" alt="chapter-2_006" style="zoom:67%;" />

> 如果后续要使用 RTOS 需要重新创建工程，这在实际使用中需要注意。

9. 最后一个窗口，也不需要进行配置，按照下图所示点击 `"Finish"` 按钮即可：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_007.png" alt="chapter-2_007" style="zoom:67%;" />

10. 点击 `"Finish"` 按钮之后稍等软件进行处理，完成之后会提示这个是否打开 `"FSP Configuration perspective"` 点击 `"Open Perspective"` 按钮即可：

![chapter-2_008](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_008.png)

11. 最后，我们的 workspce 会呈现这样的界面，下图对默认的 workspace 布局进行简单的说明：

![chapter-2_009](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_009.png)

> 注意：这是使用默认的布局的说明，当你对e2stduio比较熟悉之后可以根据自己的习惯自定义 workspace 布局。如果需要恢复默认的布局，请按照上图的说明进行操作。

### 2.1.2 调试器配置

> 调试器使用注意点： 
> 1. 调试器连接到电脑不要通过usb hub(供电不稳定)。
> 2. 调试器并没有对板子供电，因此板子要额外单独供电。
> 3. 调试器转接线接到板子上要确保，板子上两排排针都已经接上，没有裸露出来的排针(参考第一章第2步接线图)。
> 4. 将e2studio中原有的debug配置删除之后，再新建自己的debug配置。
> 5. 如果出现调试器无法工作的情况，将调试器接到电脑的usb线重新插拔，并且删除、新建debug配置之后再重新尝试。

在上面成功创建工程之后，先验证调试器是否可以正常使用，这个过程每个工程只需要配置一次即可，后面我们就是通过这个方式，将代码烧写到开发板中并且进行调试。

1. 按照下图所示，打开配置页面：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_009-1.png" alt="chapter-2_009-1" style="zoom: 67%;" />

2. 进入配置页面后，先创建新的配置文件，如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_009-2.png" alt="chapter-2_009-2" style="zoom: 50%;" />

3. 继续按下图所示进行操作：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_009-3.png" alt="chapter-2_009-3"  />

4. 如下图所示切换到 Debugger 页面继续进行操作，Target Device粘贴 **R7FA6M5BF**，注意检查 **Connection Settings**下的 **TrustZone** 是否为 `No`：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_009-4-2.png" alt="chapter-2_009-4-2" style="zoom:67%;" />

5. 在上图点击 **debug** 按钮之后会自动下载代码进入调试模式，如果失败，请返回到第一步逐步进行检查，并且检查硬件接线是否正确。

6. 如果修改代码之后，需要再次进入进行debug操作，按照下图所示操作：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_009-6.png" alt="chapter-2_009-6" style="zoom:80%;" />

> 一般来说直接点击上图的debug按钮即可，如果点击debug按钮无法进行调试(报错)，请按照上图所示继续操作。


### 2.1.3 添加 Stacks(r_sci_uart)

1. 打开 FSP Configuration 视图：双击项目文件夹中的  `configuration.xml` 文件。

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_010.png" alt="chapter-2_010" style="zoom:80%;" />

2. 按照下图所示，添加  `r_sci_uart` 模块：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_011.png" alt="chapter-2_011" style="zoom:80%;" />

3. 点击刚刚添加的`r_sci_uart` 模块会看到底部窗口的 `Properties` 选项卡出现内容了，我们将会在这里对我们的uart进行配置：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_012.png" alt="chapter-2_012" style="zoom: 67%;" />

### 2.1.4 配置 Stacks(r_sci_uart)

首先进行引脚的配置，先打开原理图确认使用哪一个UART。打开位于`03硬件资料\1_开发板原理图\ DshanMCU_RA6M5_V4.0.pdf` 的开发板原理图，电路图如下，引脚号是 **P613 (TX)** 和 **P614 (RX)** ，它使用 **TXD7/RXD7** ，记住这个编号 **7**，接下来我们根据这个信息对 r_sci_uart 进行配置。

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_013.png" alt="chapter-2_013"  />

在 `"General"` 下，修改名称和通道：

- Name： g_uart7
- Channel： 7

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_014.png" alt="chapter-2_014" style="zoom:80%;" />

在 `"Baud`" 下，配置通信波特率为 115200：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_015.png" alt="chapter-2_015" style="zoom:80%;" />

在 `"Flow Control"` 下，不要修改默认配置，如果修改了需要按下图修改回去：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_016.png" alt="chapter-2_016" style="zoom:80%;" />

在 `"Interrupts`" 下，设置 Callback 为 `"uart7_callback"`（这个函数需要我们实现)，其他使用默认配置：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_017.png" alt="chapter-2_017" style="zoom:80%;" />

在 `"Pins`" 下，确认 TXD7 、 TXD6 分别为 P613 、 P614 ，点击下图所示的按钮进行配置：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_018.png" alt="chapter-2_018" style="zoom:80%;" />

之后在下图所示的区域进行配置：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_019.png" alt="chapter-2_019" style="zoom: 67%;" />

最后检查确认无误，点击右上角的 `“Generate Project Content”` e2studio就会根据我们对FSP的配置自动配置项目、生成相应的代码。

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_020.png" alt="chapter-2_020" style="zoom:80%;" />


## 2.2 配置信息解读

### 2.2.1 引脚配置信息

该信息会在 `ra_gen\pin_data.c` 文件中生成。

在RASC里配置的每一个引脚，都会生成一个 **ioport_pin_cfg_t** 数组项，里面的内容跟配置时选择的参数一致。代码如下：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_021.png" alt="chapter-2_021" style="zoom:80%;" />


### 2.2.2 UART配置信息

该信息会在 `ra_gen\hal_data.c` 文件中生成。

指定的UART使用哪个SCI通道、指定了它的,数据格式（数据位/校验位/停止位）、指定了波特率等信息，这些配置信息都被放入一个 **uart_cfg_t** 结构体：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_022.png" alt="chapter-2_022" style="zoom: 67%;" />

结构体 **g_uart7_cfg** 里引用到了另一个结构体 **g_uart7_cfg_extend** ，里面含有时钟、FIFO、流量控制等信息；其中引用了 **g_uart7_baud_setting**  结构体，代码如下：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_023.png" alt="chapter-2_023" style="zoom:67%;" />


### 2.2.3 API接口

在 `\ra\fsp\inc\api\r_uart_api.h` 中定义了uart模块的接口，它定义了一个结构体类型 **uart_api_t** ，内容如下：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_024.png" alt="chapter-2_024" style="zoom: 80%;" />


在具体的C文件中，实现了一个 **uart_api_t** 结构体，比如在 `r_sci_uart.c` 里实现了如下结构体：

![chapter-2_025](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_025.png)

要使用UART收发数据时，可以调用结构体 **g_uart_on_sci** 里的各个函数指针，也可以直接调用`r_sci_uart.c` 里实现的各个函数（比如R_SCI_UART_Open、R_SCI_UART_Read）。

### 2.2.4 中断回调函数

操作一个UART引脚时，要先打开它（open），open 函数会配置UART；然后再调用 read、write 函数读、写串口。需要注意的是，sci_uart 模块里的读、写函数，只是 “启动” 读、写功能，这些函数返0回时并不表示读、写已经完成。后续的读、写操作是由中断函数实现的。在传输过程中，中断函数会调用回调函数来处理各种状态（传输完成？出错？）。
回调函数原型在 `\ra_gen\hal_data.h` 中定义，如下：

![chapter-2_026](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_026.png)

它的 p_args 参数是 **uart_callback_args_t** 结构体类型，如下：

![chapter-2_027](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_027.png)

- 对于接收，有2个event：UART_EVENT_RX_COMPLETE、UART_EVENT_RX_CHAR。前者被调用的时机是：调用read后接收到所有数据时；后者被调用的时机是：未调用read函数，但是接收到了数据。
- 对于发送，有2个event：UART_EVENT_TX_DATA_EMPTY、UART_EVENT_TX_COMPLETE。以发送2个字节的数据为例，前者被调用的时机是：第1个字节已经成功发送完毕，第2个字节已经被移入发送器但是还没发送完毕；后者被调用的时机是：这2个字节都发送完毕。前者先被调用，在“最后一个字节被发送，但是未发送完毕”时被调用；后者在“最后一个字节也完全发送完毕后”被调用。

对于普通的读写操作，可以在回调函数里设置状态标记，用来表示读、写是否已经完成。这样，使用read、write函数启动读、写操作后，就可以轮询这些状态以等待操作完成。

## 2.3 初始化 uart 并完成串口打印

### 2.3.1 编写中断回调函数

在初始化uart之前，先确保已经编写uart的中断回调函数，可以在 `src\hal_entry.c` 文件中添加如下示例代码：
```C
static volatile int g_uart7_tx_complete = 0;
static volatile int g_uart7_rx_complete = 0;

void uart7_callback(uart_callback_args_t * p_args)
{
    switch (p_args->event)
    {
        case UART_EVENT_TX_COMPLETE:
        {
            g_uart7_tx_complete  = 1;
            break;
        }
        case UART_EVENT_RX_COMPLETE:
        {
            g_uart7_rx_complete = 1;
            break;
        }
        default:
        {
            break;
        }
    }
}

void uart7_wait_for_tx(void)
{
    while (!g_uart7_tx_complete);
    g_uart7_tx_complete = 0;
}
void uart7_wait_for_rx(void)
{
    while (!g_uart7_rx_complete);
    g_uart7_rx_complete = 0;
}
```

- 在回调函数里设置全局变量 **g_uart7_tx_complete** ，表示发送完毕。用户程序在调用write启动UART发送后，就可以调用 **uart7_wait_for_tx** 以等待发送完毕。
- 在回调函数里设置全局变量 **g_uart7_rx_complete**，表示接收完毕。用户程序在调用read启动UART接收后，就可以调用 **uart7_wait_for_rx** 以等待接收完毕。


### 2.3.2 初始化及进行串口发送

在 `src\hal_entry.c` 文件中的 **hal_entry()** 函数里添加如下代码：

```c
void hal_entry(void)
{
    fsp_err_t err;
    uint8_t msg_len = 0;
    uint8_t *p_msg = "Hello, DShanMCU-RA6M5!\r\n";

    msg_len = ((uint8_t)(strlen((char *)p_msg)));

    /* 配置串口 */
    err = g_uart7.p_api->open(g_uart7.p_ctrl, g_uart7.p_cfg);
    if(FSP_SUCCESS != err) __BKPT();

    while (1)
    {
        /* 启动发送字符 */
        g_uart7.p_api->write(g_uart7.p_ctrl, p_msg, msg_len);
        /* 等待发送完毕 */
        uart7_wait_for_tx();

        R_BSP_SoftwareDelay(1000, BSP_DELAY_UNITS_MILLISECONDS);  // delay 1000ms
    }
}

```

### 2.3.3 验证效果

点击编译按钮，再点击debug按钮，将程序烧写到开发板中，如下图所示：

![chapter-2_028](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_028.png)

运行代码，如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_029.png" alt="chapter-2_029" style="zoom:80%;" />

打开串口工具，可以看到每隔1s，打印输出如下信息：

```shell
Hello, DShanMCU-RA6M5!
```

## 2.4 优化代码

### 2.4.1 新建一些目录

随着课程的深入，我们的工程会越来越大，代码也会越来越多，因此不能将所有的代码都放在一个文件中，所以我们从这里就开始管理好我们地代码，为后面的实验打下好的基础！

我们可以直接在e2studio中新建目录以及文件，首先在 **00_dshanmcu_ra6m5_uart_printf** 工程目录下并新建 `dshanmcu_ra6m5` 目录，如下图所示：

![chapter-2_030](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_030.png)

在弹出的窗口中的输入框中输入 `dshanmcu_ra6m5`，如下图所示：

![chapter-2_030](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_031.png)

按照上面的操作，选中新建的`dshanmcu_ra6m5` 目录，继续在 `dshanmcu_ra6m5` 中新建三个目录：

- applications：存放我们编写的应用程序，由 `src\hal_entry.c` 文件中的 **hal_entry()** 函数调用。
- drivers：存放我们编写的各种驱动，比如uart，spi屏、iic触摸、ec11编码器驱动。
- Middlewares：存放我们所使用的第三方库，比如后面使用到的lvgl库。


![chapter-2_031](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_031-1.png)

重复上图的步骤三次分别三个目录之后，就能得到下图所示的三个目录：

![chapter-2_031](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_031-2.png)


### 2.4.2 添加uart驱动

在 `00_dshanmcu_ra6m5_uart_printf\dshanmcu_ra6m5\drivers` 添加uart驱动， 在e2studio中打开 `drivers` 目录，新建两个文件 `drv_uart.c` 和 `drv_uart.h`，如下图所示：

![chapter-2_032](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_032.png)

也可以直接在windows资源管理器中找到对应的目录添加文件或目录，这样添加的文件或目录也会自动同步在e2studio的项目列表中。

![chapter-2_032-1](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_032-1.png)

在e2studio中点击打开 `00_dshanmcu_ra6m5_uart_printf\dshanmcu_ra6m5\drivers\drv_uart.c` 添加下面的代码：

```c
/***********************************************************************************************************************
 * Includes
 **********************************************************************************************************************/
#include "drv_uart.h"


/**********************************************************************************************************************
 * Macro definitions
 **********************************************************************************************************************/


/**********************************************************************************************************************
 * Typedef definitions
 **********************************************************************************************************************/


/***********************************************************************************************************************
 * Private function prototypes
 **********************************************************************************************************************/


/***********************************************************************************************************************
 * Private global variables
 **********************************************************************************************************************/
static volatile int g_uart7_tx_complete = 0;
static volatile int g_uart7_rx_complete = 0;


/***********************************************************************************************************************
 * Functions
 **********************************************************************************************************************/

fsp_err_t drv_uart_init(void)
{
    fsp_err_t err;

    /* 打开串口 */
    err = g_uart7.p_api->open(g_uart7.p_ctrl, g_uart7.p_cfg);
    if(FSP_SUCCESS != err) __BKPT();

    return err;
}

fsp_err_t drv_uart_test(uint8_t *p_msg)
{
    fsp_err_t err;
    uint8_t msg_len = 0;
    char *p_temp_ptr = (char *)p_msg;

    /* 计算长度 */
    msg_len = ((uint8_t)(strlen((char *)p_temp_ptr)));

    /* 启动发送 */
    err = g_uart7.p_api->write(g_uart7.p_ctrl, p_msg, msg_len);
    /* 等待发送完毕 */
    drv_uart_wait_for_tx();

    return err;
}

void drv_uart_wait_for_tx(void)
{
    while (!g_uart7_tx_complete); // 阻塞等待
    g_uart7_tx_complete = 0;
}

void drv_uart_wait_for_rx(void)
{
    while (!g_uart7_rx_complete); // 阻塞等待
    g_uart7_rx_complete = 0;
}


void uart7_callback(uart_callback_args_t * p_args)
{
    switch (p_args->event)
    {
        case UART_EVENT_TX_COMPLETE:
        {
            g_uart7_tx_complete  = 1;
            break;
        }
        case UART_EVENT_RX_COMPLETE:
        {
            g_uart7_rx_complete = 1;
            break;
        }
        default:
        {
            break;
        }
    }
}


/***********************************************************************************************************************
 * Private Functions
 **********************************************************************************************************************/

```

在e2studio中点击打开 `00_dshanmcu_ra6m5_uart_printf\dshanmcu_ra6m5\drivers\drv_uart.h` 添加下面的代码：

```c
#ifndef DRV_UART_H
#define DRV_UART_H

/***********************************************************************************************************************
 * Includes
 **********************************************************************************************************************/
#include "hal_data.h"

/**********************************************************************************************************************
 * Macro definitions
 **********************************************************************************************************************/

/**********************************************************************************************************************
 * Typedef definitions
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Exported global variables
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Exported global functions (to be accessed by other files)
 **********************************************************************************************************************/
fsp_err_t drv_uart_init(void);

fsp_err_t drv_uart_test(uint8_t *p_msg);

void drv_uart_wait_for_tx(void);

void drv_uart_wait_for_rx(void);

void uart7_callback(uart_callback_args_t * p_args);


#endif /*DRV_UART_H*/

```

### 2.4.3 添加 app 程序

对于比较小的裸机程序，一般直接在 `src\hal_entry.c` 下编写即可，然而我们的程序会越来越大，功能会越来越多，并且每个实验之间也需要进行区分，因此现在起我们(用户)程序会放在 `dshanmcu_ra6m5\applications` 目录下。

在 `00_dshanmcu_ra6m5_uart_printf\dshanmcu_ra6m5\applications` 目录下新建两个 `app_uart_test.c` 和 `app.h` 文件，如下图所示：

![chapter-2_032-2](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_032-2.png)

打开 `app_uart_test.c` 添加如下代码：

```c
/***********************************************************************************************************************
 * Includes
 **********************************************************************************************************************/
#include "app.h"
#include "drv_uart.h"

/**********************************************************************************************************************
 * Macro definitions
 **********************************************************************************************************************/


/**********************************************************************************************************************
 * Typedef definitions
 **********************************************************************************************************************/


/***********************************************************************************************************************
 * Private function prototypes
 **********************************************************************************************************************/
static fsp_err_t uart_write_msg(uint8_t *p_msg);

/***********************************************************************************************************************
 * Private global variables
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Functions
 **********************************************************************************************************************/
void app_uart_test(void)
{
    fsp_err_t err;
    uint8_t *p_msg = (uint8_t *)"Hello, DShanMCU-RA6M5!\r\n";

    err = drv_uart_init();
    if(FSP_SUCCESS != err) __BKPT();

    while (1)
    {
        uart_write_msg(p_msg);
        R_BSP_SoftwareDelay(1000, BSP_DELAY_UNITS_MILLISECONDS);  // delay 1000ms
    }
}

static fsp_err_t uart_write_msg(uint8_t *p_msg)
{
    fsp_err_t err;
    uint8_t msg_len = 0;
    char *p_temp_ptr = (char *)p_msg;

    /* 计算长度 */
    msg_len = ((uint8_t)(strlen((char *)p_temp_ptr)));

    /* 启动发送 */
    err = g_uart7.p_api->write(g_uart7.p_ctrl, p_msg, msg_len);
    /* 等待发送完毕 */
    drv_uart_wait_for_tx();

    return err;
}


/***********************************************************************************************************************
 * Private Functions
 **********************************************************************************************************************/

```

打开 `app.h` 添加如下代码：

```c
#ifndef APP_TEST_H
#define APP_TEST_H

/***********************************************************************************************************************
 * Includes
 **********************************************************************************************************************/
#include "hal_data.h"

/**********************************************************************************************************************
 * Macro definitions
 **********************************************************************************************************************/

/**********************************************************************************************************************
 * Typedef definitions
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Exported global variables
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Exported global functions (to be accessed by other files)
 **********************************************************************************************************************/

void app_uart_test(void);

#endif /*APP_TEST_H*/

```

### 2.4.4 调用app

在e2studio中点击打开 `00_dshanmcu_ra6m5_uart_printf\src\hal_entry.c` ，按照如下步骤进行修改：

1. 添加头文件包含：

```c
#include "app.h"
```

2. 将 `hal_entry` 函数修改为如下所示的代码：

```c
void hal_entry(void)
{
    /* TODO: add your own code here */
    app_uart_test();

#if BSP_TZ_SECURE_BUILD
    /* Enter non-secure code */
    R_BSP_NonSecureEnter();
#endif
}
```

### 2.4.5 添加编译包含

按照上面的步骤操作之后，点击编译会不通过，因为我们的项目编译配置并不知道我们添加了新的内容，下面进行配置：

1. 打开配置窗口：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_033.png" alt="chapter-2_033" style="zoom:80%;" />

2. 添加头文件检索路径：

   按照下图的步骤依次，添加这三个路径：

   - /${ProjName}/dshanmcu_ra6m5/applications
   - /${ProjName}/dshanmcu_ra6m5/drivers
   - /${ProjName}/dshanmcu_ra6m5/Middlewares

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_034.png" alt="chapter-2_034" style="zoom:80%;" />

添加上面三个路径之后点击 `Apply and Close`按钮：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_034-1.png" alt="chapter-2_034-1" style="zoom:80%;" />

3. 添加源文件检索路径：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_035.png" alt="chapter-2_035" style="zoom:80%;" />

如此配置之后，再点击编译按钮，会发现编译通过了。点击 **debug按钮** ，将程序跑起来，会发现运行现象和之前实验的一样。

上述操作只需要进行一次，之后可直接往该文件夹中添加新的代码文件。

## 2.5 printf输出重定向到串口

这里我们继续优化 `drv_uart` 的功能，让其能像平时使用c语言那样使用 **printf** 函数输出打印信息。

点击打开 `00_dshanmcu_ra6m5_uart_printf\dshanmcu_ra6m5\drivers\drv_uart.c` 加入下面的代码：

```c
/*printf输出重定向到串口*/
int __io_putchar(int ch)
{
    fsp_err_t err = FSP_SUCCESS;

    err = g_uart7.p_api->write(g_uart7.p_ctrl, (uint8_t*)&ch, 1);

    if(FSP_SUCCESS != err) __BKPT();
    drv_uart_wait_for_tx();

    return ch;
}

int _write(int fd, char *pBuffer, int size)
{
	((void)fd);
	
    for(int i=0;i<size;i++)
    {
        __io_putchar(*pBuffer++);
    }
    return size;
}

```

在`dshanmcu_ra6m5\drivers\drv_uart.h` 添加头文件包含和函数声明(去除编译警告)：

```c
#include <stdio.h>

/*printf输出重定向到串口*/
int __io_putchar(int ch);
int _write(int fd, char *pBuffer, int size);
```

> 在其他需要调用 printf 函数的源文件中，添加 #include <stdio.h>  即可正常使用。

打开`00_dshanmcu_ra6m5_uart_printf\dshanmcu_ra6m5\applications\app_uart_test.c` 做如下修改：

1. 添加头文件包含：

```c
#include <stdio.h>
```

2.  在 **uart_write_msg** 函数修改为如下所示的代码：
```c
static fsp_err_t uart_write_msg(uint8_t *p_msg)
{
    fsp_err_t err;
    uint8_t msg_len = 0;
    char *p_temp_ptr = (char *)p_msg;

    /* 计算长度 */
    msg_len = ((uint8_t)(strlen((char *)p_temp_ptr)));

    /* 启动发送 */
    err = g_uart7.p_api->write(g_uart7.p_ctrl, p_msg, msg_len);
    /* 等待发送完毕 */
    drv_uart_wait_for_tx();

    /*printf打印输出*/
    printf("[printf] %s", p_msg);

    return err;
}
```

此时还不能编译，因为还需要配置两个地方：堆栈大小和链接配置

1. 修改堆栈大小，我们将默认的stack和heap修改为如下所示：

   	- Main stack size (bytes)： 0x1000
   	
   	- Heap size (bytes)： 0x2000

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_036.png" alt="chapter-2_036" style="zoom: 67%;" />

2. 修改链接配置：
打开配置窗口：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_033.png" alt="chapter-2_033" style="zoom:67%;" />

进行配置

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-2/chapter-2_037.png" alt="chapter-2_037" style="zoom:67%;" />

如此配置之后，再点击编译按钮，会发现编译通过了。点击debug按钮，将程序跑起来，会发现运行现象和之前实验的一样，不同的是多了一个如下所示的 “**[printf]**” 开头的输出，说明**printf函数已经可以正常使用**。

```shell
Hello, DShanMCU-RA6M5!
[printf] Hello, DShanMCU-RA6M5!
Hello, DShanMCU-RA6M5!
[printf] Hello, DShanMCU-RA6M5!
Hello, DShanMCU-RA6M5!
[printf] Hello, DShanMCU-RA6M5!
Hello, DShanMCU-RA6M5!
[printf] Hello, DShanMCU-RA6M5!
Hello, DShanMCU-RA6M5!
[printf] Hello, DShanMCU-RA6M5!
```

到这里，我们第一个实验已经完成！

-----

<center>本节完</center>

<div STYLE="page-break-after: always;"></div>

# 3. 驱动触摸屏(I2C)

本次实验我们在上一次实验的基础上驱动I2C触摸屏。从这次实验开始，我们不需要重新创建工程，而是在上一次实验项目的基础添加新的功能。

上次实验我们已经能通过使用 printf 函数打印输出信息，这次实验我们的目标是当触摸屏被按下时，打印当前被按下的触摸点的坐标信息(x, y)。

> 每个实验都是在原有的基础上添加更多的功能，因此请确保每次实验都完成并得到预期的效果。

## 3.1 复制工程

上次实验得出的工程我们可以通过复制在原有的基础上得到一个新的工程，操作步骤：

1. 复制工程：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-3/chapter-3_001.png" alt="chapter-3_001" style="zoom:67%;" />

2. 粘贴工程

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-3/chapter-3_002.png" alt="chapter-3_002" style="zoom:67%;" />

3. 复制确认窗口中，重命名项目为 `01_dshanmcu_ra6m5_i2c_touchpad`，点击 **copy** 按钮：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-3/chapter-3_003.png" alt="chapter-3_003" style="zoom:67%;" />

4. 得到重命名后的独立项目

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-3/chapter-3_004.png" alt="chapter-3_004" style="zoom:80%;" />

5. 为了后续开发的方便(避免混淆)，将之前的项目关闭：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-3/chapter-3_005.png" alt="chapter-3_005" style="zoom:67%;" />

6. 关闭后的项目可以随时打开进行操作：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-3/chapter-3_006.png" alt="chapter-3_006" style="zoom:67%;" />


## 3.2 配置FSP

### 3.2.1 查看硬件资料

1. 打开位于 `03硬件资料\1_开发板原理图\ DshanMCU_RA6M5_V4.0.pdf` 的开发板原理图，确认使用哪一个I2C，电路图如下，引脚号是 **P409 (SDA2) ** 和 **P410(SCL2) **，它使用 **SDA2/SCL2** ，记住这个编号 **2**，接下来我们根据这个信息对 r_iic_master 进行配置。

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-3/chapter-3_007.png" alt="chapter-3_007" style="zoom:80%;" />

2.  打开位于 `4_模块资料\02_GT911触控芯片手册\GT911 DataSheet Rev11.pdf` 的触摸屏数据手册，跳转到如下位置：

![chapter-3_007-1](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-3/chapter-3_007-1.png)

我们选择使用 **0x28** 也就是 **0x14** 的地址进行通信(我们使用的地址模式是7-bit，因此剔除最低一位，也就是将0x28右移一位的到0x14)。那么在使用iic进行通信之前，需要操作GT911的Reset引脚（P403）和INT引脚（P408），设置（告知）GT911我们想使用的通信地址。

> (参考阅读 “1_用户手册\ARM嵌入式系统中面向对象的模块编程方法.pdf” 6.13 I2C协议章节)

### 3.2.2 添加 Stacks(r_iic_master)
1. 打开 FSP Configuration 视图：双击项目文件夹中的  `configuration.xml` 文件。
2. 按照下图所示，添加  `r_sci_uart` 模块：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-3/chapter-3_008.png" alt="chapter-3_008" style="zoom: 67%;" />

3. 点击刚刚添加的`r_iic_master` 在底部窗口的 `Properties` 选项卡中对其进行配置，将其配置为与下图一致：
   - Name： g_i2c_master2
   - Channel： 2
   - Slave Address： 0x14
   - Callback： i2c_master2_callback 

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-3/chapter-3_009.png" alt="chapter-3_009" style="zoom: 80%;" />



### 3.2.3 配置 Reset 和INT引脚

这2个引脚，在上面的原理图中有标注，分别是：

- Reset引脚 (P403)
- INT引脚     (P408)

根据上面找到的数据手册的描述，在FSP对其进行配置：

1. 按下图所示操作，打开配置IO引脚页面：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-3/chapter-3_009-1.png" alt="chapter-3_009-1" style="zoom:80%;" />

2. 按下图所示操作，配置Reset引脚(P403)

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-3/chapter-3_009-2.png" alt="chapter-3_009-2" style="zoom: 80%;" />

3. 按下图所示操作，配置INT引脚(P408)

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-3/chapter-3_009-3.png" alt="chapter-3_009-3" style="zoom:80%;" />

最后，检查确认无误，点击右上角的 `“Generate Project Content”` e2studio就会根据我们对FSP的配置自动配置项目、生成相应的代码。


## 3.3 编写触摸屏驱动代码

在e2studio中打开 `01_dshanmcu_ra6m5_i2c_touchpad\dshanmcu_ra6m5\drivers` 目录，新建如下两个文件 `drv_i2c_touchpad.c` 和 `drv_i2c_touchpad.h`：

![chapter-3_010](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-3/chapter-3_010.png)

> 如果你不清楚怎么在e2studio中创建文件，请参考阅读上一节实验中新建文件的说明教程。

也可以直接在windows资源管理器中找到对应的目录添加文件或目录，这样添加的文件或目录也会自动同步在e2studio的项目列表中

![chapter-3_011](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-3/chapter-3_011.png)

在e2studio中点击打开 `01_dshanmcu_ra6m5_i2c_touchpad\dshanmcu_ra6m5\drivers\drv_i2c_touchpad.c` 添加下面的代码：

```c
/***********************************************************************************************************************
 * Includes
 **********************************************************************************************************************/
#include "drv_i2c_touchpad.h"
#include <stdlib.h>

/**********************************************************************************************************************
 * Macro definitions
 **********************************************************************************************************************/
#define GT911_RESET_PIN             BSP_IO_PORT_04_PIN_03
#define GT911_INT_PIN               BSP_IO_PORT_04_PIN_08

//GT911 部分寄存器定义
#define GT_CTRL_REG                 0x8040  //GT911控制寄存器
#define GT_CFGS_REG                 0x8047  //GT911配置起始地址寄存器
#define GT_CHECK_REG                0x80FF  //GT911校验和寄存器
#define GT_PID_REG                  0x8140  //GT911产品ID寄存器

#define GT_GSTID_REG                0x814E  //GT911当前检测到的触摸情况
#define GT_TP1_REG                  0x814F  //第一个触摸点数据地址
#define GT_TP2_REG                  0x8157  //第二个触摸点数据地址
#define GT_TP3_REG                  0x815F  //第三个触摸点数据地址
#define GT_TP4_REG                  0x8167  //第四个触摸点数据地址
#define GT_TP5_REG                  0x816F  //第五个触摸点数据地址

#define GT911_READ_X_MAX_REG        0x8048  /* X输出最大值 */
#define GT911_READ_Y_MAX_REG        0x804a  /* X输出最大值 */

#define GT911_READ_XY_REG           0x814E  /* 坐标寄存器 */
#define GT911_CLEARBUF_REG          0x814E  /* 清除坐标寄存器 */
#define GT911_CONFIG_REG            0x8047  /* 配置参数寄存器 */
#define GT911_COMMAND_REG           0x8040  /* 实时命令 */
#define GT911_PRODUCT_ID_REG        0x8140  /* productid */
#define GT911_VENDOR_ID_REG         0x814A  /* 当前模组选项信息 */
#define GT911_CONFIG_VERSION_REG    0x8047  /* 配置文件版本号 */
#define GT911_CONFIG_CHECKSUM_REG   0x80FF  /* 配置文件校验码 */
#define GT911_FIRMWARE_VERSION_REG  0x8144  /* 固件版本号 */

/**********************************************************************************************************************
 * Typedef definitions
 **********************************************************************************************************************/

/**用于存放每一个触控点的id，坐标，大小**/
typedef struct
{
    uint8_t id;
    uint16_t x;
    uint16_t y;
    uint16_t size;
} tp_point_info_t;

/**类结构体**/
typedef struct
{
    uint8_t tp_dev_addr;
    uint16_t height;
    uint16_t width;
    tp_rotation_t rotation;
    tp_point_info_t points_info[TOUCH_POINT_TOTAL]; //用于存储五个触控点的坐标
} tp_drv_t;

/***********************************************************************************************************************
 * Private function prototypes
 **********************************************************************************************************************/
static void i2c2_wait_for_tx(void);
static void i2c2_wait_for_rx(void);

static fsp_err_t gt911_write_reg(uint16_t reg, uint8_t *buf, uint8_t len);
static fsp_err_t gt911_read_reg(uint16_t reg, uint8_t *buf, uint8_t len);
static void gt911_clear_buf();
static void gt911_soft_reset(void);
static void gt911_get_gstid(uint8_t *buf);
static void gt911_get_version(uint8_t *buf);
static void gt911_get_vendor_id(uint8_t *buf);
static void gt911_get_product_id(uint8_t *buf);
static void gt911_get_max_x(uint8_t *buf);
static void gt911_get_max_y(uint8_t *buf);

/***********************************************************************************************************************
 * Private global variables
 **********************************************************************************************************************/
static tp_drv_t g_tp_drv;

static volatile bool g_i2c2_tx_complete = false;
static volatile bool g_i2c2_rx_complete = false;

/***********************************************************************************************************************
 * Functions
 **********************************************************************************************************************/
fsp_err_t drv_i2c_touchpad_test(void)
{
    fsp_err_t err;
    uint16_t x = 0, y = 0;

    err = touchpad_is_touched ();

    if (FSP_SUCCESS == err)
    {
        //循环读取每个触控点的位置值
        for (int i = 0; i < TOUCH_POINT_TOTAL; ++i)
        {
            touchpad_get_pos (&x, &y, i);
            printf ("No: %d, touched x: %d, touched y: %d\r\n", i, x, y);
        }
    }
    return err;
}

fsp_err_t drv_i2c_touchpad_init(void)
{
    fsp_err_t err;
    uint8_t buf[4];

    /* 初始化I2C驱动 */
    err = g_i2c_master2.p_api->open (g_i2c_master2.p_ctrl, g_i2c_master2.p_cfg);
    if (FSP_SUCCESS != err)
    {
        printf ("%s %d\r\n", __FUNCTION__, __LINE__);
        return err;
    }

    /* 选择地址 */
    // 0x14
    g_ioport.p_api->pinWrite (g_ioport.p_ctrl, GT911_RESET_PIN, BSP_IO_LEVEL_LOW);
    g_ioport.p_api->pinWrite (g_ioport.p_ctrl, GT911_INT_PIN, BSP_IO_LEVEL_HIGH);
    R_BSP_SoftwareDelay (10, BSP_DELAY_UNITS_MILLISECONDS);

    g_ioport.p_api->pinWrite (g_ioport.p_ctrl, GT911_RESET_PIN, BSP_IO_LEVEL_HIGH);
    R_BSP_SoftwareDelay (100, BSP_DELAY_UNITS_MILLISECONDS);

    g_ioport.p_api->pinCfg (g_ioport.p_ctrl, GT911_INT_PIN, IOPORT_CFG_PORT_DIRECTION_INPUT);
    R_BSP_SoftwareDelay (100, BSP_DELAY_UNITS_MILLISECONDS);

    touchpad_set_rotation (TP_ROT_NONE);

    /* 读ID */
    // 厂商标识id
    gt911_get_vendor_id (buf);
    printf ("gt911 vendor id = %02x %02x %02x %02x\r\n", buf[0], buf[1], buf[2], buf[3]);

    // 产品id
    gt911_get_product_id (buf);
    printf ("gt911 product id = %02x %02x %02x %02x\r\n", buf[0], buf[1], buf[2], buf[3]);

    // 触摸芯片固件版本
    gt911_get_version (buf);
    printf ("version = 0x%x\r\n", buf[0]);

    gt911_get_max_x (buf);
    g_tp_drv.width = (uint16_t) ((buf[1] << 8) | buf[0]);
    printf ("touchpad max x = %d\r\n", g_tp_drv.width);

    gt911_get_max_y (buf);
    g_tp_drv.height = (uint16_t) ((buf[1] << 8) | buf[0]);
    printf ("touchpad max y = %d\r\n", g_tp_drv.height);

    return err;
}

fsp_err_t touchpad_is_touched(void)
{
    uint8_t touched_state, touch_num, buffer_status;

    gt911_get_gstid (&touched_state);
    touch_num = touched_state & 0xf;            //触点数量
    buffer_status = (touched_state >> 7) & 1;   // 帧状态
    //printf("touch_num: %d\r\n", touch_num);

    if (buffer_status == 1 && (touch_num <= TOUCH_POINT_TOTAL) && (touch_num > 0))
    {
        uint16_t pointers_regs[TOUCH_POINT_TOTAL] =
        { GT_TP1_REG, GT_TP2_REG, GT_TP3_REG, GT_TP4_REG, GT_TP5_REG };
        // 获取每个触控点的坐标值并保存
        for (int i = 0; i < touch_num; ++i)
        {
            uint8_t point_info_per_size = 7;
            uint8_t *point_info_p = malloc (point_info_per_size * sizeof(uint8_t ));
            gt911_read_reg (pointers_regs[i], point_info_p, point_info_per_size);

            g_tp_drv.points_info[i].id = point_info_p[0];
            g_tp_drv.points_info[i].x = (uint16_t) (point_info_p[1] + (point_info_p[2] << 8));
            g_tp_drv.points_info[i].y = (uint16_t) (point_info_p[3] + (point_info_p[4] << 8));
            g_tp_drv.points_info[i].size = (uint16_t) (point_info_p[5] + (point_info_p[6] << 8));

            free (point_info_p);

            //旋转方向
            uint16_t temp;
            switch (g_tp_drv.rotation)
            {
                case TP_ROT_NONE:
                    g_tp_drv.points_info[i].x = g_tp_drv.width - g_tp_drv.points_info[i].x;
                    g_tp_drv.points_info[i].y = g_tp_drv.height - g_tp_drv.points_info[i].y;
                break;
                case TP_ROT_270:
                    temp = g_tp_drv.points_info[i].x;
                    g_tp_drv.points_info[i].x = g_tp_drv.width - g_tp_drv.points_info[i].y;
                    g_tp_drv.points_info[i].y = temp;
                break;
                case TP_ROT_180:
                    //g_tp_drv.points_info[i].x = g_tp_drv.points_info[i].x;
                    //g_tp_drv.points_info[i].y = g_tp_drv.points_info[i].y;
                break;
                case TP_ROT_90:
                    temp = g_tp_drv.points_info[i].x;
                    g_tp_drv.points_info[i].x = g_tp_drv.points_info[i].y;
                    g_tp_drv.points_info[i].y = g_tp_drv.height - temp;
                break;
                default:
                break;
            }
        }
        gt911_clear_buf ();
        return FSP_SUCCESS;
    }
    //必须给GT911_POINT_INFO缓冲区置0,不然读取的数据一直为128！！！！
    gt911_clear_buf ();

    return FSP_ERR_INVALID_DATA;
}

void touchpad_set_rotation(tp_rotation_t rotation)
{
    g_tp_drv.rotation = rotation;
}

void touchpad_get_pos(uint16_t *x, uint16_t *y, int index)
{
    *x = g_tp_drv.points_info[index].x;
    *y = g_tp_drv.points_info[index].y;
}

void i2c_master2_callback(i2c_master_callback_args_t *p_args)
{
    switch (p_args->event)
    {
        case I2C_MASTER_EVENT_TX_COMPLETE:
        {
            g_i2c2_tx_complete = true;
            break;
        }
        case I2C_MASTER_EVENT_RX_COMPLETE:
        {
            g_i2c2_rx_complete = true;
            break;
        }
        default:
        {
            g_i2c2_tx_complete = g_i2c2_rx_complete = false;
            break;
        }
    }
}

/***********************************************************************************************************************
 * Private Functions
 **********************************************************************************************************************/
static void i2c2_wait_for_tx(void)
{
    while (!g_i2c2_tx_complete)
        ;
    g_i2c2_tx_complete = 0;
}

static void i2c2_wait_for_rx(void)
{
    while (!g_i2c2_rx_complete)
        ;
    g_i2c2_rx_complete = 0;
}

static void gt911_soft_reset(void)
{
    uint8_t buf[1];
    buf[0] = 0x02;
    gt911_write_reg (GT911_COMMAND_REG, (uint8_t*) buf, 1);
    R_BSP_SoftwareDelay (100, BSP_DELAY_UNITS_MILLISECONDS);
    buf[0] = 0x0;
    gt911_write_reg (GT911_COMMAND_REG, (uint8_t*) buf, 1);
    R_BSP_SoftwareDelay (100, BSP_DELAY_UNITS_MILLISECONDS);
}

static void gt911_clear_buf()
{
    uint8_t buf[1] =
    { 0 };
    gt911_write_reg (GT911_CLEARBUF_REG, buf, 1);
}

static fsp_err_t gt911_write_reg(uint16_t reg, uint8_t *buf, uint8_t len)
{
    fsp_err_t err;

    uint8_t regl = (uint8_t) (reg & 0xff);
    uint8_t regh = (uint8_t) (reg >> 8);
    uint8_t *write_package = malloc ((len + 2) * sizeof(uint8_t));
    memcpy (write_package, &regh, 1);
    memcpy (write_package + 1, &regl, 1);
    memcpy (write_package + 2, buf, len);

    err = g_i2c_master2.p_api->write (g_i2c_master2.p_ctrl, write_package, len + 2, 0);

    i2c2_wait_for_tx ();
    free (write_package);
    return err;
}

static fsp_err_t gt911_read_reg(uint16_t reg, uint8_t *buf, uint8_t len)
{
    fsp_err_t err;
    uint8_t tmpbuf[2];

    tmpbuf[0] = (uint8_t) (reg >> 8);
    tmpbuf[1] = (uint8_t) (reg & 0xff);

    err = g_i2c_master2.p_api->write (g_i2c_master2.p_ctrl, tmpbuf, 2, 0);

    i2c2_wait_for_tx ();

    err = g_i2c_master2.p_api->read (g_i2c_master2.p_ctrl, buf, len, 0);

    i2c2_wait_for_rx ();

    return err;
}

static void gt911_get_max_x(uint8_t *buf)
{
    gt911_read_reg (GT911_READ_X_MAX_REG, buf, 2);
}

static void gt911_get_max_y(uint8_t *buf)
{
    gt911_read_reg (GT911_READ_Y_MAX_REG, buf, 2);
}

static void gt911_get_product_id(uint8_t *buf)
{
    gt911_read_reg (GT911_PRODUCT_ID_REG, buf, 4);
}

static void gt911_get_vendor_id(uint8_t *buf)
{
    gt911_read_reg (GT911_VENDOR_ID_REG, buf, 4);
}

static void gt911_get_version(uint8_t *buf)
{
    gt911_read_reg (GT911_CONFIG_VERSION_REG, buf, 1);
}

static void gt911_get_gstid(uint8_t *buf)
{
    gt911_read_reg (GT_GSTID_REG, buf, 1);
}

```


在e2studio中点击打开 `01_dshanmcu_ra6m5_i2c_touchpad\dshanmcu_ra6m5\drivers\drv_i2c_touchpad.h` 添加下面的代码：

```c
#ifndef DRV_I2C_TOUCHPAD_H
#define DRV_I2C_TOUCHPAD_H

/***********************************************************************************************************************
 * Includes
 **********************************************************************************************************************/
#include "hal_data.h"
#include <stdio.h>

/**********************************************************************************************************************
 * Macro definitions
 **********************************************************************************************************************/
#define TOUCH_POINT_TOTAL           (5)     /* 此芯片最多支持五点触控 */

/**********************************************************************************************************************
 * Typedef definitions
 **********************************************************************************************************************/
typedef enum
{
    TP_ROT_NONE = 0,
    TP_ROT_90,
    TP_ROT_180,
    TP_ROT_270
} tp_rotation_t;

/***********************************************************************************************************************
 * Exported global variables
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Exported global functions (to be accessed by other files)
 **********************************************************************************************************************/

fsp_err_t drv_i2c_touchpad_init(void);

fsp_err_t drv_i2c_touchpad_test(void);

void touchpad_set_rotation(tp_rotation_t rotation);

fsp_err_t touchpad_is_touched(void);

void touchpad_get_pos(uint16_t *x, uint16_t *y, int index);

#endif /*DRV_I2C_TOUCHPAD_H*/

```

## 3.4 编写app

在 `01_dshanmcu_ra6m5_i2c_touchpad\dshanmcu_ra6m5\applications` 目录下新建两个 `app_i2c_touchpad_test.c` 文件，如下图所示：

![chapter-3_012](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-3/chapter-3_012.png)

打开 `app_i2c_touchpad_test.c` 添加如下代码：

```c
/***********************************************************************************************************************
 * Includes
 **********************************************************************************************************************/
#include "app.h"
#include "drv_uart.h"
#include "drv_i2c_touchpad.h"
#include <stdio.h>

/**********************************************************************************************************************
 * Macro definitions
 **********************************************************************************************************************/


/**********************************************************************************************************************
 * Typedef definitions
 **********************************************************************************************************************/


/***********************************************************************************************************************
 * Private function prototypes
 **********************************************************************************************************************/
static fsp_err_t i2c_touchpad_read(void);

/***********************************************************************************************************************
 * Private global variables
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Functions
 **********************************************************************************************************************/

void app_i2c_touchpad_test(void)
{
    fsp_err_t err;

    err = drv_uart_init();
    if(FSP_SUCCESS != err) __BKPT();

    err = drv_i2c_touchpad_init();
    if(FSP_SUCCESS != err) __BKPT();

    while (1)
    {
        i2c_touchpad_read();
    }
}

static fsp_err_t i2c_touchpad_read(void)
{
    fsp_err_t err;
    uint16_t x = 0, y = 0;

    err = touchpad_is_touched ();

    if (FSP_SUCCESS == err)
    {
        //循环读取每个触控点的位置值
        for (int i = 0; i < TOUCH_POINT_TOTAL; ++i)
        {
            touchpad_get_pos (&x, &y, i);
            printf ("No: %d, touched x: %d, touched y: %d\r\n", i, x, y);
        }
    }
    return err;
}

/***********************************************************************************************************************
 * Private Functions
 **********************************************************************************************************************/
```

将 `app.h` 改为如下代码：

```c
#ifndef APP_TEST_H
#define APP_TEST_H

/***********************************************************************************************************************
 * Includes
 **********************************************************************************************************************/
#include "hal_data.h"

/**********************************************************************************************************************
 * Macro definitions
 **********************************************************************************************************************/

/**********************************************************************************************************************
 * Typedef definitions
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Exported global variables
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Exported global functions (to be accessed by other files)
 **********************************************************************************************************************/

void app_uart_test(void);

void app_i2c_touchpad_test(void);

#endif /*APP_TEST_H*/

```

## 3.5 调用app

打开 `01_dshanmcu_ra6m5_i2c_touchpad\src\hal_entry.c` ，按照如下步骤进行修改：

将 `hal_entry` 函数修改为如下所示的代码：

```c
void hal_entry(void)
{
    /* TODO: add your own code here */
    //app_uart_test();
    app_i2c_touchpad_test();

#if BSP_TZ_SECURE_BUILD
    /* Enter non-secure code */
    R_BSP_NonSecureEnter();
#endif
}
```

## 3.6 验证效果

点击编译按钮，再点击 debug 按钮，将程序烧写到开发板中。打开串口工具，在e2stduio点击运行代码，会看到串口工具有信息输出，此时触摸屏幕会将所有触摸点的数值打印出来，串口输出现象：

```shell
gt911 vendor id = 00 00 00 00
gt911 product id = 39 31 31 00
version = 0x7d
touchpad max x = 320
touchpad max y = 480
No: 0, touched x: 117, touched y: 447
No: 1, touched x: 0, touched y: 0
No: 2, touched x: 0, touched y: 0
No: 3, touched x: 0, touched y: 0
No: 4, touched x: 0, touched y: 0
No: 0, touched x: 117, touched y: 447
No: 1, touched x: 0, touched y: 0
No: 2, touched x: 0, touched y: 0
No: 3, touched x: 0, touched y: 0
No: 4, touched x: 0, touched y: 0
```

-----

<center>本节完</center>

<div STYLE="page-break-after: always;"></div>

# 4. 驱动LCD屏(SPI)

本次实验我们在上一次实验的基础上驱动 LCD屏(SPI)。

上次实验我们已经能驱动触摸屏(I2C)并打印触摸点坐标，这次实验我们的目标是点亮LCD屏，向屏幕依次刷写红绿蓝三种不同的颜色，并在串口终端打印当前刷新的颜色文本信息。

## 4.1 复制工程

上次实验得出的工程我们可以通过复制在原有的基础上得到一个新的工程。

> 如果你不清楚复制工程的步骤，请参考阅读第2章实验的步骤教程。

本次实验我们的项目命名为：**02_dshanmcu_ra6m5_spi_display**

![chapter-4_001](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-4/chapter-4_001.png)

## 4.2 配置FSP

### 4.2.1 查看硬件资料

打开位于 `03硬件资料\1_开发板原理图\ DshanMCU_RA6M5_V4.0.pdf` 的开发板原理图，确认SPI引脚，电路图如下：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-4/chapter-4_002.png" alt="chapter-4_003" style="zoom:80%;" />

可以看到原理图并没有像之前那样直接就能确定使用的是哪一路spi，因此需要打开位于 `03硬件资料\5_官方资料\RA6M5 Group User's Manual Hardware.pdf` 的文档，跳转到下图所示的位置，确定使用的是 spi1：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-4/chapter-4_003.png" alt="chapter-4_003" style="zoom: 67%;" />


`03硬件资料\5_官方资料\RA6M5 Group User's Manual Hardware.pdf` 的文档，跳转到下图所示的位置，确定SPI时钟频率计算公式：

![chapter-4_003-1](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-4/chapter-4_003-1.png)

打开 e2studio 如下窗口，确定当前的 PCLKA：
由下图可知 PCLKA 为 200MHz，因此可得出支持的SPI最大时钟频率为：`100/ (2*(0+1) * 2^0) = 100 / 2 = 50Mbps`

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-4/chapter-4_003-2.png" alt="chapter-4_003-3" style="zoom:67%;" />


打开位于 `4_模块资料\01_ST7796显示器芯片手册\ST7796U2_SPEC_V1.0.pdf` 的文档，跳转到下图所示的位置：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-4/chapter-4_003-3.png" alt="chapter-4_003-3" style="zoom:67%;" />

通过换算可得出时钟频率： 1000000000 / 15= 66,666,666.66666667 ≈ 66.5Mhz

接下来我们根据这些信息对 `r_spi` 进行配置。

### 4.2.2 添加 Stacks(r_spi_master)
1. 打开 `FSP Configuration` 视图：双击项目文件夹中的  `configuration.xml` 文件。
2. 按照下图所示，添加  `r_spi` 模块：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-4/chapter-4_004.png" alt="chapter-4_005" style="zoom:67%;" />

3. 点击刚刚添加的 `r_spi` 在底部窗口的 `Properties` 选项卡中对其进行配置，将其配置为与下图一致：

   - Name： g_spi1
   - Channel： 1
   - Callback： spi1_callback
   - Bitrate： 50000000

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-4/chapter-4_005.png" alt="chapter-4_006" style="zoom:80%;" />

配置完成之后，如果马上编译会发现编译出错、可以根据错误信息进行解决，也可以在编译前参考下图解决：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-4/chapter-4_006.png" alt="chapter-4_007" style="zoom: 67%;" />

点击刚刚添加的 `r_dmac` 在底部窗口的 `Properties` 选项卡中对其进行配置，将其配置为与下图一致：

- Name： g_transfer1
- Channel：1

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-4/chapter-4_007.png" alt="chapter-4_008" style="zoom:67%;" />

### 4.2.3 配置RS、RESET、PWM引脚

这三个引脚，在上面的原理图中有标注，负责的功能分别是：

- RS引脚(P104)：低电平代表发送的是指令，高电平代表发送的是数据
- RESET引脚(P105)：控制LCD屏的复位
- PWM引脚(P608)：可以自由调节背光亮度调节，给高电平常亮

根据他们负责的功能特性，在FSP对其进行配置：

1. 按下图所示操作，打开配置IO引脚页面：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-4/chapter-4_008.png" alt="chapter-4_009" style="zoom:67%;" />

2. 按下图所示操作，配置RS引脚(P104)

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-4/chapter-4_009.png" alt="chapter-4_010" style="zoom:67%;" />

3. 按下图所示操作，配置RESET引脚(P105)

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-4/chapter-4_010.png" alt="chapter-4_011" style="zoom:67%;" />

4. 按下图所示操作，配置PWM引脚(P608)

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-4/chapter-4_011.png" alt="chapter-4_012" style="zoom:67%;" />

最后检查确认无误，点击右上角的 `“Generate Project Content”` e2studio就会根据我们对FSP的配置自动配置项目、生成相应的代码。

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-4/chapter-4_012.png" alt="chapter-4_012" style="zoom:67%;" />

## 4.3 编写LCD驱动代码

在e2studio中进入 `02_dshanmcu_ra6m5_spi_display\dshanmcu_ra6m5\drivers` 目录，新建如下两个文件 `drv_spi_display.c` 和 `drv_spi_display.h`：

![chapter-4_012](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-4/chapter-4_013.png)

在e2studio中点击打开 `02_dshanmcu_ra6m5_spi_display\dshanmcu_ra6m5\drivers\drv_spi_display.c` 添加下面的代码：

```c
/***********************************************************************************************************************
 * Includes
 **********************************************************************************************************************/
#include "drv_spi_display.h"
#include <stdio.h>

/**********************************************************************************************************************
 * Macro definitions
 **********************************************************************************************************************/
#define LCD_DC_PIN              BSP_IO_PORT_01_PIN_04
#define LCD_RESET_PIN           BSP_IO_PORT_01_PIN_05
#define LCD_PWM_PIN             BSP_IO_PORT_06_PIN_08

#define SPI_SEND_DATA           BSP_IO_LEVEL_HIGH
#define SPI_SEND_CMD            BSP_IO_LEVEL_LOW

/* ST7796S部分寄存器定义 */
#define LCD_DISPLAY_CMD_RAMCTRL           0xb0 // RAM Control
#define LCD_DISPLAY_CMD_CASET             0x2a // Column address set
#define LCD_DISPLAY_CMD_RASET             0x2b // Row address set
#define LCD_DISPLAY_CMD_RAMWR             0x2c // Memory write

/**********************************************************************************************************************
 * Typedef definitions
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Private function prototypes
 **********************************************************************************************************************/
static void spi1_wait_for_tx(void);
static void spi_display_init(void);

static fsp_err_t spi_send_data_cmd(uint8_t * uc_data, bsp_io_level_t uc_cmd, uint32_t len);
static fsp_err_t spi_display_backlight_opt(bsp_io_level_t opt);
static fsp_err_t spi_display_reset(void);

/***********************************************************************************************************************
 * Private global variables
 **********************************************************************************************************************/
/* Event flags for master */
static volatile spi_event_t g_master_event_flag;    // Master Transfer Event completion flag

/***********************************************************************************************************************
 * Functions
 **********************************************************************************************************************/

fsp_err_t drv_spi_display_init(void)
{
    fsp_err_t err;

    /* 初始化I2C驱动 */
    err = g_spi1.p_api->open(&g_spi1_ctrl, &g_spi1_cfg);
    if (FSP_SUCCESS != err)
    {
        printf ("%s %d\r\n", __FUNCTION__, __LINE__);
        return err;
    }

    spi_display_init();

    return err;
}

void spi_display_set_window(uint16_t x1, uint16_t y1, uint16_t x2, uint16_t y2)
{
    uint8_t caset[4];
    uint8_t raset[4];

    caset[0] = (uint8_t)(x1 >> 8) & 0xFF;
    caset[1] = (uint8_t)(x1 & 0xff);
    caset[2] = (uint8_t)(x2 >> 8) & 0xFF;
    caset[3] = (uint8_t)(x2 & 0xff) ;

    raset[0] = (uint8_t)(y1 >> 8) & 0xFF;
    raset[1] = (uint8_t)(y1 & 0xff);
    raset[2] = (uint8_t)(y2 >> 8) & 0xFF;
    raset[3] = (uint8_t)(y2 & 0xff);

    spi_send_data_cmd((uint8_t []){LCD_DISPLAY_CMD_CASET}, SPI_SEND_CMD, 1); // Horiz
    spi_send_data_cmd(caset, SPI_SEND_DATA, 4);
    spi_send_data_cmd((uint8_t []){LCD_DISPLAY_CMD_RASET}, SPI_SEND_CMD, 1); // Vert
    spi_send_data_cmd(raset, SPI_SEND_DATA, 4);
    spi_send_data_cmd((uint8_t []){LCD_DISPLAY_CMD_RAMWR}, SPI_SEND_CMD, 1); // Memory write
}

fsp_err_t drv_spi_display_flush_data(uint8_t * data, uint32_t len)
{
    fsp_err_t err;

    err = spi_send_data_cmd(data, SPI_SEND_DATA, len);
    if (FSP_SUCCESS != err)
    {
        printf ("%s %d\r\n", __FUNCTION__, __LINE__);
        return err;
    }

    return err;
}


void spi1_callback(spi_callback_args_t *p_args)
{
    /* 判断是否是发送完成触发的中断 */
    /* 如果是的话就将发送完成标志位置1 */
    if (SPI_EVENT_TRANSFER_COMPLETE == p_args->event)
    {
        g_master_event_flag = SPI_EVENT_TRANSFER_COMPLETE;
    }
    else
    {
        g_master_event_flag = SPI_EVENT_TRANSFER_ABORTED;
    }
}

/***********************************************************************************************************************
 * Private Functions
 **********************************************************************************************************************/
static void spi1_wait_for_tx(void)
{
    while(!g_master_event_flag);
    g_master_event_flag = false;
}


static void spi_display_init(void)
{
    spi_display_reset();
    spi_display_backlight_opt(BSP_IO_LEVEL_HIGH); // backlight on

    spi_send_data_cmd((uint8_t []){0x11}, SPI_SEND_CMD, 1);
    spi_send_data_cmd((uint8_t []){0x00}, SPI_SEND_DATA, 1);
    R_BSP_SoftwareDelay(120, BSP_DELAY_UNITS_MILLISECONDS);     //延时120ms

    spi_send_data_cmd((uint8_t []){0xf0}, SPI_SEND_CMD, 1);
    spi_send_data_cmd((uint8_t []){0xc3}, SPI_SEND_DATA, 1);
    spi_send_data_cmd((uint8_t []){0xf0}, SPI_SEND_CMD, 1);
    spi_send_data_cmd((uint8_t []){0x96}, SPI_SEND_DATA, 1);
    spi_send_data_cmd((uint8_t []){0x36}, SPI_SEND_CMD, 1);
    spi_send_data_cmd((uint8_t []){0x48}, SPI_SEND_DATA, 1);    // RGB
    spi_send_data_cmd((uint8_t []){0xb4}, SPI_SEND_CMD, 1);
    spi_send_data_cmd((uint8_t []){0x01}, SPI_SEND_DATA, 1);
    spi_send_data_cmd((uint8_t []){0xb7}, SPI_SEND_CMD, 1);
    spi_send_data_cmd((uint8_t []){0xc6}, SPI_SEND_DATA, 1);

    spi_send_data_cmd((uint8_t []){0xe8}, SPI_SEND_CMD, 1);
    spi_send_data_cmd((uint8_t []){0x40, 0x8A, 0x00, 0x00, 0x29, 0x19, 0xA5, 0x33}, SPI_SEND_DATA, 8);

    spi_send_data_cmd((uint8_t []){0xc1}, SPI_SEND_CMD, 1);
    spi_send_data_cmd((uint8_t []){0x06}, SPI_SEND_DATA, 1);
    spi_send_data_cmd((uint8_t []){0xc2}, SPI_SEND_CMD, 1);
    spi_send_data_cmd((uint8_t []){0xa7}, SPI_SEND_DATA, 1);
    spi_send_data_cmd((uint8_t []){0xc5}, SPI_SEND_CMD, 1);
    spi_send_data_cmd((uint8_t []){0x18}, SPI_SEND_DATA, 1);

    spi_send_data_cmd((uint8_t []){0xe0}, SPI_SEND_CMD, 1);
    spi_send_data_cmd((uint8_t []){0xF0, 0x09, 0x0B, 0x06, 0x04, 0x15, 0x2F, 0x54, 0x42, 0x3C, 0x17, 0x14, 0x18, 0x1B}, SPI_SEND_DATA, 14);

    spi_send_data_cmd((uint8_t []){0xe1}, SPI_SEND_CMD, 1);
    spi_send_data_cmd((uint8_t []){0xF0, 0x09, 0x0B, 0x06, 0x04, 0x03, 0x2D, 0x43, 0x42, 0x3B, 0x16, 0x14, 0x17, 0x1B}, SPI_SEND_DATA, 14);

    spi_send_data_cmd((uint8_t []){0xf0}, SPI_SEND_CMD, 1);
    spi_send_data_cmd((uint8_t []){0x3c}, SPI_SEND_DATA, 1);
    spi_send_data_cmd((uint8_t []){0xf0}, SPI_SEND_CMD, 1);
    spi_send_data_cmd((uint8_t []){0x69}, SPI_SEND_DATA, 1);
    spi_send_data_cmd((uint8_t []){0x3a}, SPI_SEND_CMD, 1);
    spi_send_data_cmd((uint8_t []){0x55}, SPI_SEND_DATA, 1);
    R_BSP_SoftwareDelay(120, BSP_DELAY_UNITS_MILLISECONDS);     //延时120ms

    spi_send_data_cmd((uint8_t []){0x29}, SPI_SEND_CMD, 1);

    /*rotation*/
    spi_send_data_cmd((uint8_t []){0x36}, SPI_SEND_CMD, 1);
    spi_send_data_cmd((uint8_t []){0x48}, SPI_SEND_DATA, 1);    // 0

}

static fsp_err_t spi_send_data_cmd(uint8_t * uc_data, bsp_io_level_t uc_cmd, uint32_t len)
{
    fsp_err_t err = FSP_SUCCESS;     // Error status

    /* Master send data to device */
    err = g_ioport.p_api->pinWrite(g_ioport.p_ctrl, LCD_DC_PIN, uc_cmd);
    if(FSP_SUCCESS != err)
    {
        printf ("%s %d\r\n", __FUNCTION__, __LINE__);
        return err;
    }

    err = g_spi1.p_api->write(g_spi1.p_ctrl, uc_data, len, SPI_BIT_WIDTH_8_BITS);
    if(FSP_SUCCESS != err)
    {
        printf ("%s %d\r\n", __FUNCTION__, __LINE__);
        return err;
    }

    spi1_wait_for_tx();

    return err;
}

static fsp_err_t spi_display_backlight_opt(bsp_io_level_t opt)
{
    fsp_err_t err = FSP_SUCCESS;     // Error status

    g_ioport.p_api->pinWrite((ioport_ctrl_t * const )&g_ioport.p_ctrl, LCD_PWM_PIN, opt);
    return err;
}


static fsp_err_t spi_display_reset(void)
{
    fsp_err_t err = FSP_SUCCESS;     // Error status

    g_ioport.p_api->pinWrite((ioport_ctrl_t * const )&g_ioport.p_ctrl, LCD_RESET_PIN, BSP_IO_LEVEL_LOW);
    R_BSP_SoftwareDelay(120, BSP_DELAY_UNITS_MILLISECONDS); //延时120ms
    g_ioport.p_api->pinWrite((ioport_ctrl_t * const )&g_ioport.p_ctrl, LCD_RESET_PIN, BSP_IO_LEVEL_HIGH);
    R_BSP_SoftwareDelay(120, BSP_DELAY_UNITS_MILLISECONDS); //延时120ms

    return err;
}

```

在e2studio中点击打开 `02_dshanmcu_ra6m5_spi_display\dshanmcu_ra6m5\drivers\drv_spi_display.h` 添加下面的代码：

```c
#ifndef DRV_SPI_DISPLAY_H
#define DRV_SPI_DISPLAY_H

/***********************************************************************************************************************
 * Includes
 **********************************************************************************************************************/
#include "hal_data.h"

/**********************************************************************************************************************
 * Macro definitions
 **********************************************************************************************************************/
#define LCD_SCREEN_WIDTH        (320)
#define LCD_SCREEN_HEIGHT       (480)

#define LCD_COLOR_RED           (0xF800)
#define LCD_COLOR_GREEN         (0x07E0)
#define LCD_COLOR_BLUE          (0x001F)

/**********************************************************************************************************************
 * Typedef definitions
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Exported global variables
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Exported global functions (to be accessed by other files)
 **********************************************************************************************************************/

fsp_err_t drv_spi_display_init(void);

void spi_display_set_window(uint16_t x1, uint16_t y1, uint16_t x2, uint16_t y2);

fsp_err_t drv_spi_display_flush_data(uint8_t * data, uint32_t len);

#endif /*DRV_SPI_DISPLAY_H*/

```

将 `src\hal_entry.c` 文件中的 **hal_entry()** 函数代码改为如下：

```c
void hal_entry(void)
{
    /* TODO: add your own code here */
    fsp_err_t err;

    err = drv_uart_init();
    if(FSP_SUCCESS != err) __BKPT();

    err = drv_spi_display_init();
    if(FSP_SUCCESS != err)
    {
        printf ("%s %d\r\n", __FUNCTION__, __LINE__);
        __BKPT();
    }

    while (1)
    {
        drv_spi_display_test((uint16_t)LCD_COLOR_RED);
        printf ("Full screen display in red\r\n");
        R_BSP_SoftwareDelay(500, BSP_DELAY_UNITS_MILLISECONDS); //延时500ms

        drv_spi_display_test((uint16_t)LCD_COLOR_GREEN);
        printf ("Full screen display in green\r\n");
        R_BSP_SoftwareDelay(500, BSP_DELAY_UNITS_MILLISECONDS); //延时500ms

        drv_spi_display_test((uint16_t)LCD_COLOR_BLUE);
        printf ("Full screen display in blue\r\n");
        R_BSP_SoftwareDelay(500, BSP_DELAY_UNITS_MILLISECONDS); //延时500ms
    }

#if BSP_TZ_SECURE_BUILD
    /* Enter non-secure code */
    R_BSP_NonSecureEnter();
#endif
}
```

## 4.4 编写app

在 `02_dshanmcu_ra6m5_spi_display\dshanmcu_ra6m5\applications` 目录下新建 `app_spi_display_test.c` 文件，如下图所示：

![chapter-4_014](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-4/chapter-4_014.png)

打开 `app_spi_display_test.c` 添加如下代码：

```c
/***********************************************************************************************************************
 * Includes
 **********************************************************************************************************************/
#include "app.h"
#include "drv_uart.h"
#include "drv_spi_display.h"
#include <stdio.h>

/**********************************************************************************************************************
 * Macro definitions
 **********************************************************************************************************************/

/**********************************************************************************************************************
 * Typedef definitions
 **********************************************************************************************************************/


/***********************************************************************************************************************
 * Private function prototypes
 **********************************************************************************************************************/
static void spi_display_show_color(uint16_t color_le);

/***********************************************************************************************************************
 * Private global variables
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Functions
 **********************************************************************************************************************/
void app_spi_display_test(void)
{
    fsp_err_t err;

    err = drv_uart_init();
    if(FSP_SUCCESS != err) __BKPT();

    err = drv_spi_display_init();
    if(FSP_SUCCESS != err)
    {
        printf ("%s %d\r\n", __FUNCTION__, __LINE__);
        __BKPT();
    }

    while(1)
    {
        spi_display_show_color((uint16_t)LCD_COLOR_RED);
        printf ("Full screen display in red\r\n");
        R_BSP_SoftwareDelay(500, BSP_DELAY_UNITS_MILLISECONDS); //延时500ms

        spi_display_show_color((uint16_t)LCD_COLOR_GREEN);
        printf ("Full screen display in green\r\n");
        R_BSP_SoftwareDelay(500, BSP_DELAY_UNITS_MILLISECONDS); //延时500ms

        spi_display_show_color((uint16_t)LCD_COLOR_BLUE);
        printf ("Full screen display in blue\r\n");
        R_BSP_SoftwareDelay(500, BSP_DELAY_UNITS_MILLISECONDS); //延时500ms
    }

}


static void spi_display_show_color(uint16_t color_le)
{
    uint8_t color_be[2];
    color_be [0] = (uint8_t)((color_le & 0xff00) >> 8);
    color_be [1] = (uint8_t)(color_le & 0xff);

    spi_display_set_window(0, 0, LCD_SCREEN_WIDTH, LCD_SCREEN_HEIGHT);

    for(uint16_t x = 0; x < LCD_SCREEN_WIDTH; x++)
        for(uint16_t y = 0; y < LCD_SCREEN_HEIGHT; y++)
            drv_spi_display_flush_data(color_be, 2);
}
/***********************************************************************************************************************
 * Private Functions
 **********************************************************************************************************************/

```

将 `app.h` 改为如下代码：

```c
#ifndef APP_TEST_H
#define APP_TEST_H

/***********************************************************************************************************************
 * Includes
 **********************************************************************************************************************/
#include "hal_data.h"

/**********************************************************************************************************************
 * Macro definitions
 **********************************************************************************************************************/

/**********************************************************************************************************************
 * Typedef definitions
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Exported global variables
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Exported global functions (to be accessed by other files)
 **********************************************************************************************************************/

void app_uart_test(void);

void app_i2c_touchpad_test(void);

void app_spi_display_test(void);

#endif /*APP_TEST_H*/

```

## 4.5 调用app

打开 `02_dshanmcu_ra6m5_spi_display\src\hal_entry.c` ，按照如下步骤进行修改：

将 `hal_entry` 函数修改为如下所示的代码：

```c
void hal_entry(void)
{
    /* TODO: add your own code here */
    //app_uart_test();
    //app_i2c_touchpad_test();
    app_spi_display_test();

#if BSP_TZ_SECURE_BUILD
    /* Enter non-secure code */
    R_BSP_NonSecureEnter();
#endif
}
```

## 4.6 验证效果

点击编译按钮，再点击 debug 按钮，将程序烧写到开发板中。会看到屏幕依次循环刷红、绿、蓝三种颜色。


-----

<center>本节完</center>


<div STYLE="page-break-after: always;"></div>


# 5. 添加LVGL库，对接显示和触摸驱动

本次实验我们会融合前面实验的成果，添加LVGL库，对接显示和触摸驱动，让屏幕能显示UI、能触摸操作。

## 5.1 复制工程

上次实验得出的工程我们可以通过复制在原有的基础上得到一个新的工程。

> 如果你不清楚复制工程的步骤，请参考阅读第2章实验的步骤教程。

本次实验我们的项目命名为：**03_dshanmcu_ra6m5_lvgl_display_touchpad**

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-5/chapter-5_001.png" alt="chapter-5_001" style="zoom:80%;" />

## 5.2 创建代码文件

### 5.2.1 添加lvgl库

在 **windows的文件资源管理** 中将资料包中的压缩包 `2_配套源码\02_LVGL培训示例代码\lvgl-8.3.8.zip` 解压到 `03_dshanmcu_ra6m5_lvgl_display_touchpad\dshanmcu_ra6m5\Middlewares` 目录，并将解压出来的目录重命名为 lvgl，如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-5/chapter-5_002.png" alt="chapter-5_002" style="zoom:67%;" />

打开 e2stduio 可以看到自动同步了文件夹，点开 `lvgl` 文件夹可以看到里面的内容，如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-5/chapter-5_003.png" alt="chapter-5_003" style="zoom:80%;" />

### 5.2.1 添加lvgl配置文件

lvgl本身内置有一个名为 **lv_conf_template.h** 的配置文件，对于lvgl的一些基础配置，功能裁剪都是在这里进行修改，但是这个是包含在lvgl中的文件我们不能直接对其进行修改，并且其名称后缀 **_template** 也表明这是一个模板，我们通过阅读lvgl库根目录下的 `README_zh.md` 文件，可知需要将其复制到与 lvgl 同级目录中，具体操作如下：

将 `lvgl` 文件夹中的 **lv_conf_template.h** 文件复制到上一级目录，即复制到 `03_dshanmcu_ra6m5_lvgl_display_touchpad\dshanmcu_ra6m5\Middlewares` 目录下，并将其重命名为 **lv_conf.h** （也就是将 _template 后缀去掉），如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-5/chapter-5_004.png" alt="chapter-5_004" style="zoom:80%;" />

### 5.2.2 添加lvgl显示输出、控制输入驱动接口文件

显示、输入设备驱动的对接，lvgl也有对应的模板文件，我们可以将其复制到自定义位置，但是不能直接在lvgl库进行修改，具体操作如下：

将 `lvgl\examples\porting` 中的 **lv_port_disp_template.c**、 **lv_port_disp_template.h**、**lv_port_indev_template.c**、**lv_port_indev_template.h** 复制 `03_dshanmcu_ra6m5_lvgl_display_touchpad\dshanmcu_ra6m5\drivers` 目录中，并重命名去掉 **_template** 后缀，操作如下所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-5/chapter-5_005.png" alt="chapter-5_005" style="zoom:80%;" />

### 5.2.3 新建app_lvgl_test.c

在 `03_dshanmcu_ra6m5_lvgl_display_touchpad\dshanmcu_ra6m5\applications` 目录下新建名为 `app_lvgl_test.c` 文件，如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-5/chapter-5_006.png" alt="chapter-5_006" style="zoom:80%;" />

## 5.3 修改接口文件对接驱动

### 5.3.1 修改lvgl配置文件

打开 `03_dshanmcu_ra6m5_lvgl_display_touchpad\dshanmcu_ra6m5\Middlewares\lv_conf.h` 文件，下面对其进行修改适配我们的工程：

1. 修改第 15 行为：

```c
#if 1 /*Set it to "1" to enable content*/
```

2. 修改第 27 行为：

```c
#define LV_COLOR_DEPTH 16
```

3. 修改第 30 行为：

```c
#define LV_COLOR_16_SWAP 1
```

4. 修改第 282 行为：

```c
#define LV_USE_PERF_MONITOR 1
```

5. 修改第 731 行为：

```c
#define LV_BUILD_EXAMPLES 0
```

6. 修改第 738 行为：

```c
#define LV_USE_DEMO_WIDGETS 1
```

### 5.3.2 修改显示驱动接口文件

打开 `03_dshanmcu_ra6m5_lvgl_display_touchpad\dshanmcu_ra6m5\drivers\lv_port_disp.c` 文件，下面对其进行修改适配我们的工程：

1. 修改第 7 行为：
```c
#if 1
```

2. 修改 12 行为：

```c
#include "lv_port_disp.h"
```

3. 在 15 行空白处添加头文件包含：
```c
#include "drv_spi_display.h"
#include <stdio.h>
```

4. 在 20 行空白处添加下面两行代码：
```c
#define MY_DISP_HOR_RES    320
#define MY_DISP_VER_RES    480
```

5. 修改 `lv_port_disp_init` 函数为如下代码：

```c
void lv_port_disp_init(void)
{
    /*-------------------------
     * Initialize your display
     * -----------------------*/
    disp_init();

    /*-----------------------------
     * Create a buffer for drawing
     *----------------------------*/

    /**
     * LVGL requires a buffer where it internally draws the widgets.
     * Later this buffer will passed to your display driver's `flush_cb` to copy its content to your display.
     * The buffer has to be greater than 1 display row
     *
     * There are 3 buffering configurations:
     * 1. Create ONE buffer:
     *      LVGL will draw the display's content here and writes it to your display
     *
     * 2. Create TWO buffer:
     *      LVGL will draw the display's content to a buffer and writes it your display.
     *      You should use DMA to write the buffer's content to the display.
     *      It will enable LVGL to draw the next part of the screen to the other buffer while
     *      the data is being sent form the first buffer. It makes rendering and flushing parallel.
     *
     * 3. Double buffering
     *      Set 2 screens sized buffers and set disp_drv.full_refresh = 1.
     *      This way LVGL will always provide the whole rendered screen in `flush_cb`
     *      and you only need to change the frame buffer's address.
     */

    /* Example for 1) */
    //static lv_disp_draw_buf_t draw_buf_dsc_1;
    //static lv_color_t buf_1[MY_DISP_HOR_RES * 10];                          /*A buffer for 10 rows*/
    //lv_disp_draw_buf_init(&draw_buf_dsc_1, buf_1, NULL, MY_DISP_HOR_RES * 10);   /*Initialize the display buffer*/

    /* Example for 2) */
    static lv_disp_draw_buf_t draw_buf_dsc_2;
    static lv_color_t buf_2_1[MY_DISP_HOR_RES * 10];                        /*A buffer for 10 rows*/
    static lv_color_t buf_2_2[MY_DISP_HOR_RES * 10];                        /*An other buffer for 10 rows*/
    lv_disp_draw_buf_init(&draw_buf_dsc_2, buf_2_1, buf_2_2, MY_DISP_HOR_RES * 10);   /*Initialize the display buffer*/

    /* Example for 3) also set disp_drv.full_refresh = 1 below*/
    //static lv_disp_draw_buf_t draw_buf_dsc_3;
    //static lv_color_t buf_3_1[MY_DISP_HOR_RES * MY_DISP_VER_RES];            /*A screen sized buffer*/
    //static lv_color_t buf_3_2[MY_DISP_HOR_RES * MY_DISP_VER_RES];            /*Another screen sized buffer*/
    //lv_disp_draw_buf_init(&draw_buf_dsc_3, buf_3_1, buf_3_2,
    //                      MY_DISP_VER_RES * LV_VER_RES_MAX);   /*Initialize the display buffer*/

    /*-----------------------------------
     * Register the display in LVGL
     *----------------------------------*/

    static lv_disp_drv_t disp_drv;                         /*Descriptor of a display driver*/
    lv_disp_drv_init(&disp_drv);                    /*Basic initialization*/

    /*Set up the functions to access to your display*/

    /*Set the resolution of the display*/
    disp_drv.hor_res = MY_DISP_HOR_RES;
    disp_drv.ver_res = MY_DISP_VER_RES;

    /*Used to copy the buffer's content to the display*/
    disp_drv.flush_cb = disp_flush;

    /*Set a display buffer*/
    disp_drv.draw_buf = &draw_buf_dsc_2;

    /*Required for Example 3)*/
    //disp_drv.full_refresh = 1;

    /* Fill a memory array with a color if you have GPU.
     * Note that, in lv_conf.h you can enable GPUs that has built-in support in LVGL.
     * But if you have a different GPU you can use with this callback.*/
    //disp_drv.gpu_fill_cb = gpu_fill;

    /*Finally register the driver*/
    lv_disp_drv_register(&disp_drv);
}
```

6. 修改 `disp_init` 函数为如下代码：

```c
static void disp_init(void)
{
    /*You code here*/
    fsp_err_t err;

    err = drv_spi_display_init();
    if(FSP_SUCCESS != err)
    {
        printf ("%s %d\r\n", __FUNCTION__, __LINE__);
        __BKPT();
    }
}
```

7. 修改 `disp_flush` 函数为如下代码：
```c
static void disp_flush(lv_disp_drv_t * disp_drv, const lv_area_t * area, lv_color_t * color_p)
{
#if 0
    if(disp_flush_enabled) {
        /*The most simple case (but also the slowest) to put all pixels to the screen one-by-one*/

        int32_t x;
        int32_t y;
        for(y = area->y1; y <= area->y2; y++) {
            for(x = area->x1; x <= area->x2; x++) {
                /*Put a pixel to the display. For example:*/
                /*put_px(x, y, *color_p)*/
                color_p++;
            }
        }
    }
#endif

    if(disp_flush_enabled) {
        uint32_t size = lv_area_get_width(area) * lv_area_get_height(area);
        spi_display_set_window(area->x1, area->y1, area->x2, area->y2);
        drv_spi_display_flush_data((uint8_t *)color_p, size * 2);
    }
    /*IMPORTANT!!!
     *Inform the graphics library that you are ready with the flushing*/
    lv_disp_flush_ready(disp_drv);
}
```

8. 打开 `03_dshanmcu_ra6m5_lvgl_display_touchpad\dshanmcu_ra6m5\drivers\lv_port_disp.h` 文件这里只需修改一个地方，修改第 7-10 行为：

```c
#if 1

#ifndef LV_PORT_DISP_H
#define LV_PORT_DISP_H
```

### 5.3.3 修改输入驱动接口文件

打开 `03_dshanmcu_ra6m5_lvgl_display_touchpad\dshanmcu_ra6m5\drivers\lv_port_indev.c` 文件，下面对其进行修改适配我们的工程：

1. 修改第 7 行为：
```c
#if 1
```

2. 修改 12 行为：

```c
#include "lv_port_indev.h"
```

3. 在 15 行空白处添加头文件包含：
```c
#include "drv_i2c_touchpad.h"
#include <stdio.h>
```

4. 修改 `lv_port_indev_init` 函数为如下代码：

```c
void lv_port_indev_init(void)
{
    /**
     * Here you will find example implementation of input devices supported by LittelvGL:
     *  - Touchpad
     *  - Mouse (with cursor support)
     *  - Keypad (supports GUI usage only with key)
     *  - Encoder (supports GUI usage only with: left, right, push)
     *  - Button (external buttons to press points on the screen)
     *
     *  The `..._read()` function are only examples.
     *  You should shape them according to your hardware
     */

    static lv_indev_drv_t indev_drv;

    /*------------------
     * Touchpad
     * -----------------*/

    /*Initialize your touchpad if you have*/
    touchpad_init();

    /*Register a touchpad input device*/
    lv_indev_drv_init(&indev_drv);
    indev_drv.type = LV_INDEV_TYPE_POINTER;
    indev_drv.read_cb = touchpad_read;
    indev_touchpad = lv_indev_drv_register(&indev_drv);

    /*------------------
     * Mouse
     * -----------------*/

    /*Initialize your mouse if you have*/
    //mouse_init();

    /*Register a mouse input device*/
    //lv_indev_drv_init(&indev_drv);
    //indev_drv.type = LV_INDEV_TYPE_POINTER;
    //indev_drv.read_cb = mouse_read;
    //indev_mouse = lv_indev_drv_register(&indev_drv);

    /*Set cursor. For simplicity set a HOME symbol now.*/
    //lv_obj_t * mouse_cursor = lv_img_create(lv_scr_act());
    //lv_img_set_src(mouse_cursor, LV_SYMBOL_HOME);
    //lv_indev_set_cursor(indev_mouse, mouse_cursor);

    /*------------------
     * Keypad
     * -----------------*/

    /*Initialize your keypad or keyboard if you have*/
    //keypad_init();

    /*Register a keypad input device*/
    //lv_indev_drv_init(&indev_drv);
    //indev_drv.type = LV_INDEV_TYPE_KEYPAD;
    //indev_drv.read_cb = keypad_read;
    //indev_keypad = lv_indev_drv_register(&indev_drv);

    /*Later you should create group(s) with `lv_group_t * group = lv_group_create()`,
     *add objects to the group with `lv_group_add_obj(group, obj)`
     *and assign this input device to group to navigate in it:
     *`lv_indev_set_group(indev_keypad, group);`*/

    /*------------------
     * Encoder
     * -----------------*/

    /*Initialize your encoder if you have*/
    //encoder_init();

    /*Register a encoder input device*/
    //lv_indev_drv_init(&indev_drv);
    //indev_drv.type = LV_INDEV_TYPE_ENCODER;
    //indev_drv.read_cb = encoder_read;
    //indev_encoder = lv_indev_drv_register(&indev_drv);

    /*Later you should create group(s) with `lv_group_t * group = lv_group_create()`,
     *add objects to the group with `lv_group_add_obj(group, obj)`
     *and assign this input device to group to navigate in it:
     *`lv_indev_set_group(indev_encoder, group);`*/

    /*------------------
     * Button
     * -----------------*/

    /*Initialize your button if you have*/
    //button_init();

    /*Register a button input device*/
    //lv_indev_drv_init(&indev_drv);
    //indev_drv.type = LV_INDEV_TYPE_BUTTON;
    //indev_drv.read_cb = button_read;
    //indev_button = lv_indev_drv_register(&indev_drv);

    /*Assign buttons to points on the screen*/
    //static const lv_point_t btn_points[2] = {
    //    {10, 10},   /*Button 0 -> x:10; y:10*/
    //    {40, 100},  /*Button 1 -> x:40; y:100*/
    //};
    //lv_indev_set_button_points(indev_button, btn_points);
}
```

5. 修改 `touchpad_init` 函数为如下代码：

```c
static void touchpad_init(void)
{
    /*Your code comes here*/
    fsp_err_t err;

    err = drv_i2c_touchpad_init();
    if(FSP_SUCCESS != err)
    {
        printf ("%s %d\r\n", __FUNCTION__, __LINE__);
        __BKPT();
    }
}
```

6. 修改 `touchpad_read` 函数为如下代码：
```c
static void touchpad_read(lv_indev_drv_t * indev_drv, lv_indev_data_t * data)
{
    fsp_err_t err;
    static lv_coord_t last_x = 0;
    static lv_coord_t last_y = 0;

    /*Save the pressed coordinates and the state*/
    err = touchpad_is_touched();
    if(FSP_SUCCESS == err) {
        touchpad_get_pos((uint16_t *)&last_x, (uint16_t *)&last_y, 0);
        data->state = LV_INDEV_STATE_PR;
    }
    else {
        data->state = LV_INDEV_STATE_REL;
    }

    /*Set the last pressed coordinates*/
    data->point.x = last_x;
    data->point.y = last_y;
}
```

7. 打开 `03_dshanmcu_ra6m5_lvgl_display_touchpad\dshanmcu_ra6m5\drivers\lv_port_indev.h` 文件这里只需修改一个地方，修改第 8 - 11 行为：

```c
#if 1

#ifndef LV_PORT_INDEV_H
#define LV_PORT_INDEV_H
```

## 5.4 配置FSP

这里的配置主要是为lvgl提供心跳支持。

### 5.4.1 添加 Stacks(r_gpt)

1. 打开 `FSP Configuration` 视图：双击项目文件夹中的  `configuration.xml` 文件。
2. 按照下图所示，添加  `r_gpt` 模块：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-5/chapter-5_007.png" alt="chapter-5_007" style="zoom:67%;" />

点击刚刚添加的 `r_gpt` 在底部窗口的 `Properties` 选项卡中对其进行配置，将其配置为与下图一致：

- Name： g_timer0
- Channel： 0
- period：1
- Callback： periodic_timer0_cb

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-5/chapter-5_008.png" alt="chapter-5_008" style="zoom:67%;" />


### 5.4.2 添加r_gpt 使用驱动代码

在 `03_dshanmcu_ra6m5_lvgl_display_touchpad\dshanmcu_ra6m5\drivers` 目录中新建 `drv_gpt_timer.c` 和 `drv_gpt_timer.h` 两个文件：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-5/chapter-5_009.png" alt="chapter-5_009" style="zoom:80%;" />


创建之后，先打开 `drv_gpt_timer.c`，添加如下代码：

```c
/***********************************************************************************************************************
 * Includes
 **********************************************************************************************************************/
#include "drv_gpt_timer.h"
#include "lvgl.h"

#include <stdio.h>

/**********************************************************************************************************************
 * Macro definitions
 **********************************************************************************************************************/


/**********************************************************************************************************************
 * Typedef definitions
 **********************************************************************************************************************/


/***********************************************************************************************************************
 * Private function prototypes
 **********************************************************************************************************************/
static fsp_err_t gpt_timer_init(gpt_instance_ctrl_t * p_timer_ctrl, const timer_cfg_t * p_timer_cfg);

/***********************************************************************************************************************
 * Private global variables
 **********************************************************************************************************************/


/***********************************************************************************************************************
 * Functions
 **********************************************************************************************************************/

fsp_err_t drv_gpt_timer_init(void)
{
    fsp_err_t err;

    /* Start GPT timer to 'Give' Semaphore periodically at 1sec for semaphore_task */
    err = gpt_timer_init(&g_timer0_ctrl, &g_timer0_cfg );
    if(FSP_SUCCESS != err)
    {
        printf ("%s %d\r\n", __FUNCTION__, __LINE__);
    }

    return err;
}

void periodic_timer0_cb(timer_callback_args_t *p_args)
{
    FSP_PARAMETER_NOT_USED(p_args);

    lv_tick_inc(1);

}

static fsp_err_t gpt_timer_init(gpt_instance_ctrl_t * p_timer_ctrl, const timer_cfg_t * p_timer_cfg)
{
    fsp_err_t fsp_err = FSP_SUCCESS;

    /* Open GPT timer instance */
    fsp_err = R_GPT_Open(p_timer_ctrl, p_timer_cfg);
    /* Handle error */
    if ( FSP_SUCCESS != fsp_err )
    {
        /* Print out in case of error */
        //APP_ERR_PRINT ("\r\nGPT Timer open API failed\r\n");
        return fsp_err;
    }


    /* Start GPT Timer instance */
    fsp_err = R_GPT_Start(p_timer_ctrl);
    /* Handle error */
    if (FSP_SUCCESS != fsp_err)
    {
        /* Close timer if failed to start */
        if ( FSP_SUCCESS  != R_GPT_Close(p_timer_ctrl) )
        {
            /* Print out in case of error */
            //APP_ERR_PRINT ("\r\nGPT Timer Close API failed\r\n");
        }

       // APP_ERR_PRINT ("\r\nGPT Timer Start API failed\r\n");
        return fsp_err;
    }

    return fsp_err;
}


/***********************************************************************************************************************
 * Private Functions
 **********************************************************************************************************************/
```

打开 `drv_gpt_timer.h`，添加如下代码：

```c
#ifndef DRV_GPT_TIMER_H
#define DRV_GPT_TIMER_H

/***********************************************************************************************************************
 * Includes
 **********************************************************************************************************************/
#include "hal_data.h"
#include <stdio.h>

/**********************************************************************************************************************
 * Macro definitions
 **********************************************************************************************************************/

/**********************************************************************************************************************
 * Typedef definitions
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Exported global variables
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Exported global functions (to be accessed by other files)
 **********************************************************************************************************************/
fsp_err_t drv_gpt_timer_init(void);

#endif /*DRV_GPT_TIMER_H*/

```

## 5.5 编写 app 程序

打开 `03_dshanmcu_ra6m5_lvgl_display_touchpad\dshanmcu_ra6m5\applications\app_lvgl_test.c` 文件 ， 添加如下代码：

```c
/***********************************************************************************************************************
 * Includes
 **********************************************************************************************************************/
#include "app.h"
#include "drv_uart.h"
#include "drv_gpt_timer.h"
#include "lv_port_disp.h"
#include "lv_port_indev.h"
#include "lvgl.h"
#include "lvgl/demos/lv_demos.h"

#include <stdio.h>

/**********************************************************************************************************************
 * Macro definitions
 **********************************************************************************************************************/


/**********************************************************************************************************************
 * Typedef definitions
 **********************************************************************************************************************/


/***********************************************************************************************************************
 * Private function prototypes
 **********************************************************************************************************************/


/***********************************************************************************************************************
 * Private global variables
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Functions
 **********************************************************************************************************************/
void app_lvgl_test(void)
{
    fsp_err_t err;

    err = drv_uart_init();
    if(FSP_SUCCESS != err) __BKPT();

    err = drv_gpt_timer_init();
    if(FSP_SUCCESS != err)
    {
        printf ("%s %d\r\n", __FUNCTION__, __LINE__);
        __BKPT();
    }

    lv_init();

    lv_port_disp_init();

    lv_port_indev_init();

    /* create lvgl demo */
    lv_demo_widgets();

    while(1)
    {
        lv_task_handler();
        R_BSP_SoftwareDelay(5, BSP_DELAY_UNITS_MILLISECONDS);  // delay 5ms
    }

}

/***********************************************************************************************************************
 * Private Functions
 **********************************************************************************************************************/

```

打开 `03_dshanmcu_ra6m5_lvgl_display_touchpad\dshanmcu_ra6m5\applications\app.h` 文件 ， 在31行添加函数声明：

```c
void app_lvgl_test(void);
```

打开 `03_dshanmcu_ra6m5_lvgl_display_touchpad\dshanmcu_ra6m5\src\hal_entry.c` 将 hal_entry 函数修改为如下所示的代码：

```c

void hal_entry(void)
{
    /* TODO: add your own code here */
    //app_uart_test();
    //app_i2c_touchpad_test();
    //app_spi_display_test();
    app_lvgl_test();

#if BSP_TZ_SECURE_BUILD
    /* Enter non-secure code */
    R_BSP_NonSecureEnter();
#endif
}

```

## 5.6 解决编译问题

### 5.6.1 编译报错问题

此时如果点击编译，会发现编译报错，报错信息如下：

![chapter-5_010](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-5/chapter-5_010.png)

这是提示 lvgl.h 找不到，因为之前的头文件检索只到了 
`03_dshanmcu_ra6m5_lvgl_display_touchpad\dshanmcu_ra6m5\Middlewares` 如果不想修改头文件检索范围，可以在报错的地方修改为 `#include "lvgl/lvgl.h"`，为了避免后续更多不必要的问题，最好修改一下头文件检索范围，操作如下：



1. 打开 `C/C++ Project Settings`，按照下图操作进入配置页面：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-5/chapter-5_011.png" alt="chapter-5_011" style="zoom:80%;" />

2. 在配置页面中，按如下操作添加 **/${ProjName}/dshanmcu_ra6m5/Middlewares/lvgl** ：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-5/chapter-5_012.png" alt="chapter-5_012" style="zoom:80%;" />

### 5.6.2 编译警告过多问题

解决报错问题之后，编译会发现没有报错了，编译能顺利完成，但是编译过程产生的警告非常多，如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-5/chapter-5_013.png" alt="chapter-5_013" style="zoom:80%;" />

我们再次进入  `C/C++ Project Settings`，解决编译警告，在配置页面中，按如下操作添加 warning flags：

```text
 -Wno-conversion -Wno-aggregate-return -Wno-type-limits -Wno-unused-parameter -Wno-unused-function
```

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-5/chapter-5_014.png" alt="chapter-5_014" style="zoom:80%;" />

按照上图配置之后再次点击编译，会发现编译警告都没有了，并且编译花费的时间也大大提高：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-5/chapter-5_015.png" alt="chapter-5_015" style="zoom:80%;" />


## 5.7 验证效果

点击编译按钮，再点击 debug 按钮，将程序烧写到开发板中。会看到屏幕亮起一个漂亮的UI界面，并且可以通过点击触摸屏进行交互。

-----

<center>本节完</center>

<div STYLE="page-break-after: always;"></div>


# 6. 驱动EC11旋转编码器(GPIO)

本次实验我们驱动EC11旋转编码器。

## 6.1 复制工程

上次实验得出的工程我们可以通过复制在原有的基础上得到一个新的工程。

> 如果你不清楚复制工程的步骤，请参考阅读第三章实验的步骤教程。

本次实验我们的项目命名为：**04_dshanmcu_ra6m5_ec11_encoder**

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-6/chapter-6_001.png" alt="chapter-6_001" style="zoom:80%;" />

## 6.2 配置FSP

### 6.2.1 查看硬件资料

驱动EC11旋转编码器，驱动原理：

![chapter-6_001-1](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-6/chapter-6_001-1.png)

需要用到 **3个GPIO**，我们实验使用的引脚是：

- S1     <----->   P202
- S2     <----->  P203
- KEY  <----->   P205

这三个引脚对应开发板上的这三个引脚，引脚位置及接线，如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-6/chapter-6_002.png" alt="chapter-6_002" style="zoom:80%;" />


打开位于 `03硬件资料\\5_官方资料\RA6M5 Group User's Manual Hardware.pdf` 的文档，跳转到下图所示的位置：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-6/chapter-6_003.png" alt="chapter-6_003" style="zoom: 67%;" />


根据上图中列表的内容，可以得出以下对应关系：

- KEY  <----->   P205   (IRQ1)
- S1     <----->   P202   (IRQ2)
- S2     <----->  P203   (IRQ3)

接下来根据以上信息，在 e2stduio 中对 `r_icu` 进行配置。

### 6.2.2 添加 Stacks(r_icu)

1. 打开 `FSP Configuration` 视图：双击项目文件夹中的  `configuration.xml` 文件。
2. 按照下图所示，添加 **3个**  `r_icu` 模块：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-6/chapter-6_004.png" alt="chapter-6_004" style="zoom: 80%;" />

3. 点击刚刚添加的第一个 `r_icu` 在底部窗口的 `Properties` 选项卡中对其进行配置，将其配置为与下图一致：

   - Name： g_external_irq1_key
   - Channel： 1
   - Callback： external_irq1_key_callback

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-6/chapter-6_005.png" alt="chapter-6_005" style="zoom:80%;" />

4. 点击刚刚添加的第一个 `r_icu` 在底部窗口的 `Properties` 选项卡中对其进行配置，将其配置为与下图一致：

   - Name： g_external_irq2_s2
   - Channel： 2
   - Callback： external_irq2_s2_callback

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-6/chapter-6_006.png" alt="chapter-6_006" style="zoom:80%;" />

5. 点击刚刚添加的第一个 `r_icu` 在底部窗口的 `Properties` 选项卡中对其进行配置，将其配置为与下图一致：

   - Name： g_external_irq3_s1
   - Channel： 3
   - Callback： external_irq3_s1_callback

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-6/chapter-6_007.png" alt="chapter-6_007" style="zoom:80%;" />

最后检查确认无误，点击右上角的 `“Generate Project Content”` e2studio就会根据我们对FSP的配置自动配置项目、生成相应的代码。

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-6/chapter-6_008.png" alt="chapter-6_008" style="zoom:80%;" />


## 6.3 编写EC11驱动代码

在e2studio中进入 `04_dshanmcu_ra6m5_ec11_encoder\dshanmcu_ra6m5\drivers` 目录，新建如下两个文件 `drv_gpio_ec11.c` 和 `drv_gpio_ec11.h`：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-6/chapter-6_009.png" alt="chapter-6_009" style="zoom:80%;" />

在e2studio中点击打开 `04_dshanmcu_ra6m5_ec11_encoder\dshanmcu_ra6m5\drivers\drv_gpio_ec11.c` 添加下面的代码：

```c
/***********************************************************************************************************************
 * Includes
 **********************************************************************************************************************/
#include "drv_gpio_ec11.h"

/**********************************************************************************************************************
 * Macro definitions
 **********************************************************************************************************************/
#define DRV_GPIO_EC11_USE_LVGL  (1)

#if DRV_GPIO_EC11_USE_LVGL == 1
#include "lvgl.h"
#endif

/**********************************************************************************************************************
 * Typedef definitions
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Private function prototypes
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Private global variables
 **********************************************************************************************************************/
static uint32_t ec11_key_press_tick = 0;
static uint32_t ec11_s1_press_tick = 0;
static uint32_t ec11_s2_press_tick = 0;

static bool ec11_key_state = false;
static bool ec11_s1_state = false;
static bool ec11_s2_state = false;


/***********************************************************************************************************************
 * Functions
 **********************************************************************************************************************/

fsp_err_t drv_gpio_ec11_init(void)
{
    fsp_err_t err;

    // external irq 1
    err = g_external_irq1_key.p_api->open(g_external_irq1_key.p_ctrl,
                                          g_external_irq1_key.p_cfg);
    if(FSP_SUCCESS != err)
    {
        return err;
    }
    err = g_external_irq1_key.p_api->enable(g_external_irq1_key.p_ctrl);
    if(FSP_SUCCESS != err)
    {
        return err;
    }

    // external irq 2
    err = g_external_irq2_s2.p_api->open(g_external_irq2_s2.p_ctrl,
                                         g_external_irq2_s2.p_cfg);
    if(FSP_SUCCESS != err)
    {
        return err;
    }
    err = g_external_irq2_s2.p_api->enable(g_external_irq2_s2.p_ctrl);
    if(FSP_SUCCESS != err)
    {
        return err;
    }

    // external irq 3
    err = g_external_irq3_s1.p_api->open(g_external_irq3_s1.p_ctrl,
                                         g_external_irq3_s1.p_cfg);
    if(FSP_SUCCESS != err)
    {
        return err;
    }
    err = g_external_irq3_s1.p_api->enable(g_external_irq3_s1.p_ctrl);
    if(FSP_SUCCESS != err)
    {
        return err;
    }

    return err;
}

uint32_t drv_gpio_ec11_get_pin_press_tick(bsp_io_port_pin_t pin)
{
    uint32_t pin_press_tick = 0;

    switch(pin){
        case EC11_PIN_KEY:
            pin_press_tick = ec11_key_press_tick;
            break;
        case EC11_PIN_S1:
            pin_press_tick = ec11_s1_press_tick;
            break;
        case EC11_PIN_S2:
            pin_press_tick = ec11_s2_press_tick;
            break;
        default:
            pin_press_tick = 0;
            break;
    }

    return pin_press_tick;
}

bool drv_gpio_ec11_get_pin_state(bsp_io_port_pin_t pin)
{
    bool pin_state = false;

    switch(pin){
        case EC11_PIN_KEY:
            pin_state = ec11_key_state;
            break;
        case EC11_PIN_S1:
            pin_state = ec11_s1_state;
            break;
        case EC11_PIN_S2:
            pin_state = ec11_s2_state;
            break;
        default:
            pin_state = false;
            break;
    }

    return pin_state;
}


void drv_gpio_ec11_set_pin_state(bsp_io_port_pin_t pin, bool state)
{
    switch(pin){
        case EC11_PIN_KEY:
            ec11_key_state = state;
            break;
        case EC11_PIN_S1:
             ec11_s1_state = state;
            break;
        case EC11_PIN_S2:
            ec11_s2_state = state;
            break;
        default:
            break;
    }
}


void external_irq1_key_callback(external_irq_callback_args_t * p_args)
{
    if(p_args->channel == 1)
    {
        ec11_key_state = true;
#if DRV_GPIO_EC11_USE_LVGL == 0
        ec11_key_press_tick = 20;
#else
        ec11_key_press_tick = lv_tick_get() + 20;;
#endif
    }
}

void external_irq2_s2_callback(external_irq_callback_args_t * p_args)
{
    if(p_args->channel == 2)
    {
        bsp_io_level_t level;
        g_ioport.p_api->pinRead(&g_ioport_ctrl, EC11_PIN_S1, &level);
        if(level)
        {
            ec11_s2_state = true;
#if DRV_GPIO_EC11_USE_LVGL == 0
        ec11_s2_press_tick = 20;
#else
        ec11_s2_press_tick = lv_tick_get() + 20;;
#endif
        }
    }
}

void external_irq3_s1_callback(external_irq_callback_args_t * p_args)
{
    if(p_args->channel == 3)
    {
        bsp_io_level_t level;
        g_ioport.p_api->pinRead(&g_ioport_ctrl, EC11_PIN_S2, &level);
        if(level)
        {
            ec11_s1_state = true;
#if DRV_GPIO_EC11_USE_LVGL == 0
            ec11_s1_press_tick = 20;
#else
        ec11_s1_press_tick = lv_tick_get() + 20;;
#endif
        }

    }
}

/***********************************************************************************************************************
 * Private Functions
 **********************************************************************************************************************/

```

在e2studio中点击打开 `04_dshanmcu_ra6m5_ec11_encoder\dshanmcu_ra6m5\drivers\drv_gpio_ec11.h` 添加下面的代码：

```c
#ifndef DRV_GPIO_EC11_H
#define DRV_GPIO_EC11_H

/***********************************************************************************************************************
 * Includes
 **********************************************************************************************************************/
#include "hal_data.h"

/**********************************************************************************************************************
 * Macro definitions
 **********************************************************************************************************************/
#define EC11_PIN_KEY    BSP_IO_PORT_02_PIN_05
#define EC11_PIN_S1     BSP_IO_PORT_02_PIN_02
#define EC11_PIN_S2     BSP_IO_PORT_02_PIN_03

/**********************************************************************************************************************
 * Typedef definitions
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Exported global variables
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Exported global functions (to be accessed by other files)
 **********************************************************************************************************************/
fsp_err_t drv_gpio_ec11_init(void);

uint32_t drv_gpio_ec11_get_pin_press_tick(bsp_io_port_pin_t pin);

void drv_gpio_ec11_set_pin_state(bsp_io_port_pin_t pin, bool state);

bool drv_gpio_ec11_get_pin_state(bsp_io_port_pin_t pin);

#endif /*DRV_GPIO_EC11_H*/


```

## 6.4 编写app

在 `04_dshanmcu_ra6m5_ec11_encoder\dshanmcu_ra6m5\applications` 目录下新建 `app_ec11_test.c` 文件，如下图所示：

![chapter-6_010](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-6/chapter-6_010.png)

打开 `app_ec11_test.c` 添加如下代码：

```c
/***********************************************************************************************************************
 * Includes
 **********************************************************************************************************************/
#include "app.h"
#include "drv_uart.h"
#include "drv_gpio_ec11.h"
#include <stdio.h>

/**********************************************************************************************************************
 * Macro definitions
 **********************************************************************************************************************/


/**********************************************************************************************************************
 * Typedef definitions
 **********************************************************************************************************************/


/***********************************************************************************************************************
 * Private function prototypes
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Private global variables
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Functions
 **********************************************************************************************************************/
void app_ec11_test(void)
{
    fsp_err_t err;

    err = drv_uart_init();
    if(FSP_SUCCESS != err) __BKPT();

    err = drv_gpio_ec11_init();
    if(FSP_SUCCESS != err)
    {
        printf ("%s %d\r\n", __FUNCTION__, __LINE__);
        __BKPT();
    }

    while (1)
    {
        if(drv_gpio_ec11_get_pin_state(EC11_PIN_KEY))
        {
            R_BSP_SoftwareDelay(drv_gpio_ec11_get_pin_press_tick(EC11_PIN_KEY), BSP_DELAY_UNITS_MILLISECONDS);
            drv_gpio_ec11_set_pin_state(EC11_PIN_KEY, 0);
            printf("EC11 pressed (KEY)!\r\n");
        }
        else if(drv_gpio_ec11_get_pin_state(EC11_PIN_S1))
        {
            R_BSP_SoftwareDelay(drv_gpio_ec11_get_pin_press_tick(EC11_PIN_S1), BSP_DELAY_UNITS_MILLISECONDS);
            drv_gpio_ec11_set_pin_state(EC11_PIN_S1, 0);
            printf("EC11 turn right(S1)!\r\n");
        }
        else if(drv_gpio_ec11_get_pin_state(EC11_PIN_S2))
        {
            R_BSP_SoftwareDelay(drv_gpio_ec11_get_pin_press_tick(EC11_PIN_S2), BSP_DELAY_UNITS_MILLISECONDS);
            drv_gpio_ec11_set_pin_state(EC11_PIN_S2, 0);
            printf("EC11 turn left(S2)!\r\n");
        }

    }
}


/***********************************************************************************************************************
 * Private Functions
 **********************************************************************************************************************/

```

将 `app.h` 改为如下代码：

```c
#ifndef APP_TEST_H
#define APP_TEST_H

/***********************************************************************************************************************
 * Includes
 **********************************************************************************************************************/
#include "hal_data.h"

/**********************************************************************************************************************
 * Macro definitions
 **********************************************************************************************************************/

/**********************************************************************************************************************
 * Typedef definitions
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Exported global variables
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * Exported global functions (to be accessed by other files)
 **********************************************************************************************************************/

void app_uart_test(void);

void app_i2c_touchpad_test(void);

void app_spi_display_test(void);

void app_lvgl_test(void);

void app_ec11_test(void);

#endif /*APP_TEST_H*/

```

## 6.5 调用app

打开 `04_dshanmcu_ra6m5_ec11_encoder\src\hal_entry.c` ，将 `hal_entry` 函数修改为如下所示的代码：

```c
void hal_entry(void)
{
    /* TODO: add your own code here */
    //app_uart_test();
    //app_i2c_touchpad_test();
    //app_spi_display_test();
    //app_lvgl_test();
    app_ec11_test();

#if BSP_TZ_SECURE_BUILD
    /* Enter non-secure code */
    R_BSP_NonSecureEnter();
#endif
}
```

## 6.6 验证效果

点击编译按钮，再点击 debug 按钮，将程序烧写到开发板中。打开串口工具，操作EC11编码器(左转、右转、按下)同时会看到串口中断打印出相应的提示信息，如下所示：

```shell
EC11 pressed (KEY)!
EC11 pressed (KEY)!
EC11 turn right(S1)!
EC11 turn right(S1)!
EC11 turn left(S2)!
EC11 turn left(S2)!
```

-----

<center>本节完</center>

<div STYLE="page-break-after: always;"></div>


# 7. LVGL对接EC11旋转编码器驱动

本次实验我们向LVGL库中对接EC11旋转编码器驱动，让我们能通过EC11旋转编码器操作UI。

## 7.1 复制工程

上次实验得出的工程我们可以通过复制在原有的基础上得到一个新的工程。

> 如果你不清楚复制工程的步骤，请参考阅读第三章实验的步骤教程。

本次实验我们的项目命名为：**05_dshanmcu_ra6m5_lvgl_display_touchpad_encoder**

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-7/chapter-7_001.png" alt="chapter-7_001" style="zoom:80%;" />


## 7.2 对接驱动

打开 `05_dshanmcu_ra6m5_lvgl_display_touchpad_encoder\dshanmcu_ra6m5\drivers\drv_gpio_ec11.c` 文件，做如下修改：

将第 9 行的代码改为如下：

```c
#define DRV_GPIO_EC11_USE_LVGL  (1)
```

打开 `05_dshanmcu_ra6m5_lvgl_display_touchpad_encoder\dshanmcu_ra6m5\drivers\lv_port_indev.c` 文件，下面对其进行修改适配我们的工程：

1. 在第 14 行空白处添加头文件包含：

```c
#include "drv_gpio_ec11.h"
```

2. 修改 `lv_port_indev_init` 函数为如下代码：

```c
void lv_port_indev_init(void)
{
    /**
     * Here you will find example implementation of input devices supported by LittelvGL:
     *  - Touchpad
     *  - Mouse (with cursor support)
     *  - Keypad (supports GUI usage only with key)
     *  - Encoder (supports GUI usage only with: left, right, push)
     *  - Button (external buttons to press points on the screen)
     *
     *  The `..._read()` function are only examples.
     *  You should shape them according to your hardware
     */
    /*------------------
     * Touchpad
     * -----------------*/

    /*Initialize your touchpad if you have*/
    touchpad_init();

    /*Register a touchpad input device*/
    static lv_indev_drv_t indev_pointer_drv;
    lv_indev_drv_init(&indev_pointer_drv);
    indev_pointer_drv.type = LV_INDEV_TYPE_POINTER;
    indev_pointer_drv.read_cb = touchpad_read;
    indev_touchpad = lv_indev_drv_register(&indev_pointer_drv);

    /*------------------
     * Mouse
     * -----------------*/

    /*Initialize your mouse if you have*/
    //mouse_init();

    /*Register a mouse input device*/
    //lv_indev_drv_init(&indev_drv);
    //indev_drv.type = LV_INDEV_TYPE_POINTER;
    //indev_drv.read_cb = mouse_read;
    //indev_mouse = lv_indev_drv_register(&indev_drv);

    /*Set cursor. For simplicity set a HOME symbol now.*/
    //lv_obj_t * mouse_cursor = lv_img_create(lv_scr_act());
    //lv_img_set_src(mouse_cursor, LV_SYMBOL_HOME);
    //lv_indev_set_cursor(indev_mouse, mouse_cursor);

    /*------------------
     * Keypad
     * -----------------*/

    /*Initialize your keypad or keyboard if you have*/
    //keypad_init();

    /*Register a keypad input device*/
    //lv_indev_drv_init(&indev_drv);
    //indev_drv.type = LV_INDEV_TYPE_KEYPAD;
    //indev_drv.read_cb = keypad_read;
    //indev_keypad = lv_indev_drv_register(&indev_drv);

    /*Later you should create group(s) with `lv_group_t * group = lv_group_create()`,
     *add objects to the group with `lv_group_add_obj(group, obj)`
     *and assign this input device to group to navigate in it:
     *`lv_indev_set_group(indev_keypad, group);`*/

    /*------------------
     * Encoder
     * -----------------*/

    /*Initialize your encoder if you have*/
    encoder_init();

    /*Register a encoder input device*/
    static lv_indev_drv_t indev_encoder_drv;
    lv_indev_drv_init(&indev_encoder_drv);
    indev_encoder_drv.type = LV_INDEV_TYPE_ENCODER;
    indev_encoder_drv.read_cb = encoder_read;
    indev_encoder = lv_indev_drv_register(&indev_encoder_drv);

    /*Later you should create group(s) with `lv_group_t * group = lv_group_create()`,
     *add objects to the group with `lv_group_add_obj(group, obj)`
     *and assign this input device to group to navigate in it:
     *`lv_indev_set_group(indev_encoder, group);`*/

    /*------------------
     * Button
     * -----------------*/

    /*Initialize your button if you have*/
    //button_init();

    /*Register a button input device*/
    //lv_indev_drv_init(&indev_drv);
    //indev_drv.type = LV_INDEV_TYPE_BUTTON;
    //indev_drv.read_cb = button_read;
    //indev_button = lv_indev_drv_register(&indev_drv);

    /*Assign buttons to points on the screen*/
    //static const lv_point_t btn_points[2] = {
    //    {10, 10},   /*Button 0 -> x:10; y:10*/
    //    {40, 100},  /*Button 1 -> x:40; y:100*/
    //};
    //lv_indev_set_button_points(indev_button, btn_points);

    lv_group_t *g = lv_group_create();
    lv_group_set_default(g);
    lv_indev_set_group(indev_touchpad, g);
    lv_indev_set_group(indev_encoder, g);
}
```

3. 修改 `encoder_init` 函数为如下代码：

```c
static void encoder_init(void)
{
    /*Your code comes here*/
    fsp_err_t err;

    err = drv_gpio_ec11_init();
    if(FSP_SUCCESS != err)
    {
        printf ("%s %d\r\n", __FUNCTION__, __LINE__);
        __BKPT();
    }
}

```

4. 修改 `encoder_read` 函数为如下代码：

```c
/*Will be called by the library to read the encoder*/
static void encoder_read(lv_indev_drv_t * indev_drv, lv_indev_data_t * data)
{
    uint32_t handler_start = lv_tick_get();

    if(drv_gpio_ec11_get_pin_state(EC11_PIN_KEY))
    {
        if(handler_start >= drv_gpio_ec11_get_pin_press_tick(EC11_PIN_KEY))
        {
            encoder_diff = 0;
            encoder_state = LV_INDEV_STATE_PR;
            drv_gpio_ec11_set_pin_state(EC11_PIN_KEY, 0);
        }
    }
    else if(drv_gpio_ec11_get_pin_state(EC11_PIN_S1))
    {
        if(handler_start >= drv_gpio_ec11_get_pin_press_tick(EC11_PIN_S1))
        {
            encoder_diff -= 1;
            drv_gpio_ec11_set_pin_state(EC11_PIN_S1, 0);
        }
    }
    else if(drv_gpio_ec11_get_pin_state(EC11_PIN_S2))
    {
        if(handler_start >= drv_gpio_ec11_get_pin_press_tick(EC11_PIN_S2))
        {
            encoder_diff += 1;
            drv_gpio_ec11_set_pin_state(EC11_PIN_S2, 0);
        }
    }
    else
    {
        bsp_io_level_t level;
        g_ioport.p_api->pinRead(&g_ioport_ctrl, EC11_PIN_KEY, &level);
        if(level)
        {
            encoder_state = LV_INDEV_STATE_REL;
            encoder_diff = 0;
        }
    }

    data->enc_diff = encoder_diff;
    data->state = encoder_state;
}
```

## 7.3 调用app

打开 `05_dshanmcu_ra6m5_lvgl_display_touchpad_encoder\dshanmcu_ra6m5\src\hal_entry.c` 将 hal_entry 函数修改为如下所示的代码：

```c
void hal_entry(void)
{
    /* TODO: add your own code here */
    //app_uart_test();
    //app_i2c_touchpad_test();
    //app_spi_display_test();
    app_lvgl_test();
    //app_ec11_test();

#if BSP_TZ_SECURE_BUILD
    /* Enter non-secure code */
    R_BSP_NonSecureEnter();
#endif
}
```

## 7.4 验证效果

点击编译按钮，再点击 debug 按钮，将程序烧写到开发板中。操作EC11编码器(左转、右转、按下)会看到UI也会跟着变化。

-----

<center>本节完</center>

<div STYLE="page-break-after: always;"></div>

# 8. LVGL对接串口打印

本次实验我们为LVGL库对接串口的打印功能。

## 8.1 复制工程

上次实验得出的工程我们可以通过复制在原有的基础上得到一个新的工程。

> 如果你不清楚复制工程的步骤，请参考阅读第三章实验的步骤教程。

本次实验我们的项目命名为：**06_dshanmcu_ra6m5_lvgl_display_touchpad_encoder_log**

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter-8/chapter-8_001.png" alt="chapter-8_001" style="zoom:80%;" />


## 8.2 修改lvgl配置文件

打开 `06_dshanmcu_ra6m5_lvgl_display_touchpad_encoder_log\dshanmcu_ra6m5\Middlewares\lv_conf.h` 文件，下面对其进行修改适配我们的串口打印驱动：

1. 修改第 233 行为：

```c
#define LV_USE_LOG 1
```

2. 修改第 247 行为：

```c
#define LV_LOG_PRINTF 1
```

## 8.3 修改app程序


打开 `06_dshanmcu_ra6m5_lvgl_display_touchpad_encoder_log\dshanmcu_ra6m5\applications\app_lvgl_test.c` ，将 `app_lvgl_test` 函数修改为如下所示的代码：

```c
void app_lvgl_test(void)
{
    fsp_err_t err;

    err = drv_uart_init();
    if(FSP_SUCCESS != err) __BKPT();

    err = drv_gpt_timer_init();
    if(FSP_SUCCESS != err)
    {
        printf ("%s %d\r\n", __FUNCTION__, __LINE__);
        __BKPT();
    }

    lv_init();
    LV_LOG_USER("lv_init ok!\r\n");

    lv_port_disp_init();
    LV_LOG_USER("lv_port_disp_init ok!\r\n");

    lv_port_indev_init();
    LV_LOG_USER("lv_port_indev_init ok!\r\n");

    /* create lvgl demo */
    lv_demo_widgets();

    while(1)
    {
        lv_task_handler();
        R_BSP_SoftwareDelay(5, BSP_DELAY_UNITS_MILLISECONDS);  // delay 5ms
    }

}
```

## 8.4 验证效果

点击编译按钮，再点击 debug 按钮，将程序烧写到开发板中。打开串口工具，会看到串口终端多了如下信息：

```shell
[User]  (0.513, +24)     app_lvgl_test: lv_port_indev_init ok!	(in app_lvgl_test.c line #57)
[User]     (0.000, +0)      app_lvgl_test: lv_init ok!	(in app_lvgl_test.c line #51)
[User]     (0.489, +489)    app_lvgl_test: lv_port_disp_init ok!	(in app_lvgl_test.c line #54)
```

-----

<center>本节完</center>


<div STYLE="page-break-after: always;"></div>


<img src="./images/wechat_official_account_renesas-mcu.jpg" alt="wechat_official_account_renesas-mcu" style="zoom: 33%;" />

<center>瑞萨MCU小百科微信公众号</center>



<img src="./images/wechat_official_account_100ask.jpg" alt="wechat_official_account_100ask" style="zoom:33%;" />

<center>深圳百问网微信公众号</center>