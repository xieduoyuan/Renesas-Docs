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


<center>本节完</center>

<div STYLE="page-break-after: always;"></div>
