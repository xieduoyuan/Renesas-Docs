# 第7章 UART

本章目标

- 使用RASC快速操作UART
- 理解它的内部流程，改进程序

## 7.1 sci_uart模块的使用

### 7.1.1 使用RASC配置

本节的源码是“0701_UART”。

使用RASC配置UART时，需要进行两方面的配置：引脚配置、UART本身的配置。

首先进行引脚的配置，先打开原理图确认使用哪一个UART，比如引脚使用TXD0/RXD0、TXD1/RXD1、……中的哪一个，电路图如下，它使用TXD7/RXD7，记住这个编号7（TXDn/RXDn使用SCIn）：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-7/image1.png" style="zoom:150%;" /> 

然后在RASC配置界面点击Pins页面，在左侧找到“Peripherals > Connectivity:SCI”，点击里面的SCI7，配置它工作于UART模式、选择引脚为P613、P614，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-7/image2.png) 

配置好引脚后，就需要配置UART本身了。点击Stack页面，点击“New Stack”然后找到“Connectivity > UART(r_sci_uart)”，添加新的Stack。如下图操作：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-7/image3.png)  

下一步要要配置新添加的r_sci_uart，如下图所示，先选中刚新建的r_sci_uart，点击“Properties”，然后设置：

- 在“General”下，设置变量名称，比如“g_uart7”；选择对应的UART通道，比如把Channel设置为7，然后设置数据位（Data Bits）为8、检验位（Parity）为None、停止位（Stop Bits）为1。

- 在“Baud”下，设置波特率（Baud Rate）为115200。
- 在“Flow Control”下，不要修改默认配置，如果修改了需要按图改回去
- 在“Interrupts”下，指定“Callback”为“uart7_callback”（这个函数需要我们实现）
- 在“Pins”下，确认TXD7、TXD6分别为P613、P614，跟前面在“Pins”页面的设置保持一致。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-7/image4.png)  

配置好引脚和UART后，点击右上角的“Generate Project Content”就会生成代码。

### 7.1.2 配置信息解读

使用RASC配置UART后，生成了引脚配置信息、UART本身的配置信息。

1. 引脚配置信息

该信息会在0701_UART\ra_gen\pin_data.c文件里生成。

在RASC里配置的每一个引脚，都会生成一个ioport_pin_cfg_t数组项，里面的内容跟配置时选择的参数一致。代码如下：

```c
const ioport_pin_cfg_t g_bsp_pin_cfg_data[] = {
    {
        .pin = BSP_IO_PORT_06_PIN_13,
        .pin_cfg = ((uint32_t) IOPORT_CFG_PERIPHERAL_PIN 
| (uint32_t) IOPORT_PERIPHERAL_SCI1_3_5_7_9)
    },
    {
        .pin = BSP_IO_PORT_06_PIN_14,
        .pin_cfg = ((uint32_t) IOPORT_CFG_PERIPHERAL_PIN 
| (uint32_t) IOPORT_PERIPHERAL_SCI1_3_5_7_9)
    },
};
```

- 第3~6行被用来配置P613;

- 第7~10行被用来配置P614。它们都被配置为“IOPORT_CFG_PERIPHERAL_PIN”，也就是要连接到芯片的其它模块（非GPIO）;

连接到哪个模块呢？另一个参数“IOPORT_PERIPHERAL_SCI1_3_5_7_9)”表示它们被连接到SCI模块。

2. UART配置信息

该信息会在0701_UART\ra_gen\hal_data.c文件里生成。

在RASC里指定了UART使用哪个SCI通道、指定了它的数据格式（数据位/校验位/停止位）、指定了波特率等信息，这些配置信息都被放入一个uart_cfg_t结构体，部分代码摘录如下：

```c
const uart_cfg_t g_uart7_cfg =
{
    .channel             = 7,
    .data_bits           = UART_DATA_BITS_8,
    .parity              = UART_PARITY_OFF,
    .stop_bits           = UART_STOP_BITS_1,
    .p_callback          = uart7_callback,
    ......(省略内容)
}
```

结构体g_uart7_cfg里引用到了另一个结构体g_uart7_cfg_extend，里面含有时钟、FIFO、流量控制等信息，代码如下：

```c
const sci_uart_extended_cfg_t g_uart7_cfg_extend =
{
    .clock                = SCI_UART_CLOCK_INT,
    .rx_edge_start          = SCI_UART_START_BIT_FALLING_EDGE,
    .noise_cancel         = SCI_UART_NOISE_CANCELLATION_DISABLE,
    .rx_fifo_trigger        = SCI_UART_RX_FIFO_TRIGGER_MAX,
    .p_baud_setting         = &g_uart7_baud_setting,
    .flow_control           = SCI_UART_FLOW_CONTROL_RTS,
    ......(省略内容)
}
```

- 第04~06行指定了数据格式，第07行指定了用户提供的回调函函数。
- 第12~15行指定了时钟等硬件信息;
- 还在第16行引用了另一个结构体g_uart7_baud_setting。在RASC里配置了波特率为115200，RASC会计算出各个寄存器的值，存放在结构体g_uart7_baud_setting里，代码如下：

  ```c
  baud_setting_t    g_uart7_baud_setting =
  {
      /* Baud rate calculated with 0.469% error. */ 
      .semr_baudrate_bits_b.abcse = 0, 
      .semr_baudrate_bits_b.abcs = 0, 
      .semr_baudrate_bits_b.bgdm = 1, 
      .cks = 0, .brr = 53, 
      .mddr = (uint8_t) 256, 
      .semr_baudrate_bits_b.brme = false
  };
  ```

### 7.1.3 API接口

在0701_UART\ra\fsp\inc\api\r_uart_api.h中定义了uart模块的接口，它定义了一个结构体类型uart_api_t，内容如下：

```c
typedef struct st_uart_api
{
    fsp_err_t (* open)(uart_ctrl_t * const p_ctrl, uart_cfg_t const * const p_cfg);
    fsp_err_t (* read)(uart_ctrl_t * const p_ctrl, 
                       uint8_t * const p_dest, 
                       uint32_t const bytes);
    fsp_err_t (* write)(uart_ctrl_t * const p_ctrl, 
                        uint8_t const * const p_src, 
                        uint32_t const bytes);
    fsp_err_t (* baudSet)(uart_ctrl_t * const p_ctrl, 
                          void const * const p_baudrate_info);
    fsp_err_t (* infoGet)(uart_ctrl_t * const p_ctrl, uart_info_t * const p_info);
    fsp_err_t (* communicationAbort)(uart_ctrl_t * const p_ctrl, 
                                     uart_dir_t communication_to_abort);
    fsp_err_t (* callbackSet)(uart_ctrl_t * const p_api_ctrl, 
                              void (* p_callback)(uart_callback_args_t *),
                              void const * const p_context, 
                              uart_callback_args_t * const p_callback_memory);
    fsp_err_t (* close)(uart_ctrl_t * const p_ctrl);
    fsp_err_t (* readStop)(uart_ctrl_t * const p_ctrl, uint32_t * remaining_bytes);
} uart_api_t;
```

在具体的C文件中，需要实现一个uart_api_t结构体，比如在r_sci_uart.c里实现了如下结构体：

```c
/* UART on SCI HAL API mapping for UART interface */
const uart_api_t g_uart_on_sci =
{
  .open        = R_SCI_UART_Open,
  .close        = R_SCI_UART_Close,
  .write        = R_SCI_UART_Write,
  .read        = R_SCI_UART_Read,
  .infoGet       = R_SCI_UART_InfoGet,
  .baudSet       = R_SCI_UART_BaudSet,
  .communicationAbort = R_SCI_UART_Abort,
  .callbackSet     = R_SCI_UART_CallbackSet,
  .readStop      = R_SCI_UART_ReadStop,
};
```

要使用UART收发数据时，可以调用结构体g_uart_on_sci里的各个函数指针，也可以直接调用r_sci_uart.c里实现的各个函数（比如R_SCI_UART_Open、R_SCI_UART_Read）。

### 7.1.4 中断回调函数

操作一个UART引脚时，要先打开它（open），open函数会配置UART；然后再调用read、write函数读、写串口。需要注意的是，sci_uart模块里的读、写函数，只是“启动”读、写功能，这些函数返回时并不表示读、写已经完成。后续的读、写操作是由中断函数实现的。在传输过程中，中断函数会调用回调函数来处理各种状态（传输完成？出错？）。

回调函数原型在0701_UART\ra_gen\hal_data.h中定义，如下：

```c
void uart7_callback(uart_callback_args_t * p_args);
```

它的p_args参数是uart_callback_args_t结构体类型，如下：

```c
typedef struct st_uart_callback_arg
{
    uint32_t     channel;              /// 哪一个UART通道
    uart_event_t event;                /// event，什么原因

    /** 当event是UART_EVENT_RX_CHAR或UART_EVENT_ERR_PARITY时，data为刚接收到的字符
     * 当event是UART_EVENT_ERR_FRAMING或UART_EVENT_ERR_OVERFLOW时，data未被使用 */
    uint32_t     data;
    void const * p_context;            ///< Context provided to user during callback
} uart_callback_args_t;
```

回调函数被调用时，参数里的event表示原因，它是一个uart_event_t枚举类型，取值如下：

```c
/** UART Event codes */
typedef enum e_sf_event
{
    UART_EVENT_RX_COMPLETE   = (1UL << 0), /// 使用read函数启动接收后，接收完毕
    UART_EVENT_TX_COMPLETE   = (1UL << 1), /// 发送完毕
    UART_EVENT_RX_CHAR       = (1UL << 2), /// 未调用read启动接收，但是接收到了数据
    UART_EVENT_ERR_PARITY    = (1UL << 3), /// 校验错误
    UART_EVENT_ERR_FRAMING   = (1UL << 4), /// < Mode fault error event
    UART_EVENT_ERR_OVERFLOW  = (1UL << 5), /// FIFO溢出
    UART_EVENT_BREAK_DETECT  = (1UL << 6), /// < Break detect error event
    UART_EVENT_TX_DATA_EMPTY = (1UL << 7), /// 最后一个字节已经发送出去了，但是还没发送完毕
} uart_event_t;
```

- 对于接收，有2个event：UART_EVENT_RX_COMPLETE、UART_EVENT_RX_CHAR。前者被调用的时机是：调用read后接收到所有数据时；后者被调用的时机是：未调用read函数，但是接收到了数据。
- 对于发送，有2个event：UART_EVENT_TX_DATA_EMPTY、UART_EVENT_TX_COMPLETE。以发送2个字节的数据为例，前者被调用的时机是：第1个字节已经成功发送完毕，第2个字节已经被移入发送器但是还没发送完毕；后者被调用的时机是：这2个字节都发送完毕。前者先被调用，在“最后一个字节被发送，但是未发送完毕”时被调用；后者在“最后一个字节也完全发送完毕后”被调用。

对于普通的读写操作，可以在回调函数里设置状态标记，用来表示读、写是否已经完成。这样，使用read、write函数启动读、写操作后，就可以轮询这些状态以等待操作完成。示例代码在0701_UART\src\hal_entry.c文件中，如下：

```c
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

- 第8~12行，在回调函数里设置全局变量g_uart7_tx_complete，表示发送完毕。用户程序在调用write启动UART发送后，就可以调用第25行的uart7_wait_for_tx以等待发送完毕。
- 第13~17行，在回调函数里设置全局变量g_uart7_rx_complete，表示接收完毕。用户程序在调用read启动UART接收后，就可以调用第31行的uart7_wait_for_rx以等待接收完毕。

### 7.1.5 API接口用法

sci_uart模块的接口在文件0701_UART\ra\fsp\inc\api\r_uart_api.h中定义。

1. 打开UART设备

此函数用于配置UART，并且标记转态为“已经打开”。函数原型：

```c
fsp_err_t (* open)(uart_ctrl_t * const p_ctrl, uart_cfg_t const * const p_cfg);
```

此函数指针有两个参数，p_ctrl是一个uart_ctrl_t指针，它的定义如下：

```c
typedef void uart_ctrl_t;
```

所以在r_uart_api.h文件里，p_ctrl实际上是一个void指针，它可以指向任意类型的数据类型，这是一种良好的编程思想：封装内部实现的细节。在r_sci_uart.h里，这个参数实际的类型是sci_uart_instance_ctrl_t结构体，定义如下：

```c
/** UART instance control block. */
typedef struct st_sci_uart_instance_ctrl
{
    /* Parameters to control UART peripheral device */
    uint8_t  fifo_depth;               // FIFO深度
    uint8_t  rx_transfer_in_progress;  // 1表示当前正在处理一个“接收传输”
    ……
    uint32_t open;                     // 表示状态，当前UART是否已经被打开、被配置
    ……
    /* 发数据时的源数据buffer */
    uint8_t const * p_tx_src;
    /* 还有多少数据未发送 */
    uint32_t tx_src_bytes;
    /* 收数据时的目的buffer */
    uint8_t const * p_rx_dest;
    /* 还有多少数据未接收 */
    uint32_t rx_dest_bytes;
    /* 这个UART通道的寄存器基地址 */
    R_SCI0_Type * p_reg;
    void (* p_callback)(uart_callback_args_t *); // 回调函数
    ……
} sci_uart_instance_ctrl_t;
```

结构体sci_uart_instance_ctrl_t的open成员被用来表示串口的状态，其他成员被用来实现读、写函数。比p_tx_src指向数据buffer，tx_src_bytes等于要发送的数据长度，每发送完n个数据中断函数里会把tx_src_bytes减去n，当中断函数发现tx_src_bytes等于0时，就会调用p_callback（它指向RASC里指定的回调函数）。

第二个参数p_cfg是一个uart_cfg_t结构体指针，在《7.1.2配置信息解读》里有详细描述。

2. 关闭UART设备

关闭UART设备的函数指针是close，传入的参数是uart_ctrl_t结构体变量：

```c
fsp_err_t (* close)(uart_ctrl_t * const p_ctrl);
```

这个函数指针在使用FSP生成到工程中会指向R_SCI_UART_Close，代码如下：

```c
fsp_err_t R_SCI_UART_Close (uart_ctrl_t * const p_api_ctrl)
{
    sci_uart_instance_ctrl_t * p_ctrl = (sci_uart_instance_ctrl_t *) p_api_ctrl;
    ……
    /* 修改状态位0，表示已经关闭 */
    p_ctrl->open = 0U;
    /* 禁止UART通道: 关闭中断、关闭时钟等 */
    p_ctrl->p_reg->SCR = 0U;
    ……
    /* 禁止中断 */
    R_BSP_IrqDisable(p_ctrl->p_cfg->rxi_irq);
    R_BSP_IrqDisable(p_ctrl->p_cfg->eri_irq);

    /* 关闭这个UART通道的电源 */
    R_BSP_MODULE_STOP(FSP_IP_SCI, p_ctrl->p_cfg->channel);

    ……;
    return FSP_SUCCESS;
}
```

3. 发送数据

使用write函数来“启动”发送，函数返回时并不表示数据已经全部发送完毕。原型如下：

```c
fsp_err_t (* write)(uart_ctrl_t * const p_ctrl, uint8_t const * const p_src, uint32_t const bytes);
```

4. 读取数据

使用read函数来“启动”接收，函数返回时并不表示数据已经全部接收完毕。原型如下：

```
fsp_err_t (* read)(uart_ctrl_t * const p_ctrl,
                   uint8_t * const p_dest, 
                   uint32_t const bytes);
```

如果在调用read函数来“启动接收”之前，UART已经接收到了数据，中断函数也会调用回调函数（event为UART_EVENT_RX_CHAR）。

## 7.2 UART读写实验

本实验的源码是“0701_UART”，使用串口工具给开发板发送字符，开发板接收到后把字符加1，再发给PC。

### 7.2.1 配置UART

参考《7.1.1使用RASC配置》进行配置，参考《7.1.4中断回调函数》添加代码。

### 7.2.2 应用程序

在hal_entry.c文件中的hal_entry()函数里添加如下代码：

```c
/* TODO: add your own code here */
fsp_err_t err;
uint8_t c;

/* 配置串口 */
err = g_uart7.p_api->open(g_uart7.p_ctrl, g_uart7.p_cfg);
/* 启动发送字符 */
g_uart7.p_api->write(g_uart7.p_ctrl, "100ask\r\n", 8);
/* 等待发送完毕 */
uart7_wait_for_tx();
while (1)
{
    /* 启动接收字符 */
    err = g_uart7.p_api->read(g_uart7.p_ctrl, &c, 1);
    if (!err)
    {
        /* 等待接收完毕 */
        uart7_wait_for_rx();

        c++; /* 加1 */

        /* 启动发送字符 */
        g_uart7.p_api->write(g_uart7.p_ctrl, &c, 1);

        /* 等待发送完毕 */
        uart7_wait_for_tx();
    }
}
```

### 7.2.3 上机实验

先使用串口工具打开开发板自带的USB串口，波特率设置为115200，数据位为8，停止位为1，无校验位，不使用流控。

程序运行后，在串口工具里可以看到打印出“100ask”，然后输入“1234abc”会显示出“2345bcd”，示例如下：

```
100ask
2345bcd
```

## 7.3 stdio实验

本实验的源码是“0702_stdio”，它的功能是：使用printf、scanf。

### 7.3.1 实现思路

printf、scanf本身的代码来自于C库，或者MicroLIB库。要在串口上使用printf、scanf，实现串口相关的fputc、fgetc函数即可。

在使用scanf时，使用“回显功能”体验更好。“回显”就是：在PC机上使用串口工具发送一个字符给开发板，开发板接收到后把同样的字符发回给PC机，这样串口工具就会显示出这个字符。如果不使用回显功能，我们在串口工具上输入时没有任何显示，相当于“盲打”。

如何实现“回显”？在fgetc函数里，接收到PC发来的字符后，再使用fputc把它发送给PC即可。如果发现接收到回车字符（'\r’），则还需要发送换行字符（'\n’），否则我们在串口工具上按下回车键时，光标只会回到行首而不会调到下一行。

### 7.3.2 编写程序

“0702_stdio”是在“0701_UART”的基础上修改的。在src\hal_entry.c中实现了fputc、fgetc函数，代码如下：

/* 重写这个函数,重定向printf */

```c
int fputc(int ch, FILE * f)
{
    (void)f;

    /* 启动发送字符 */
    g_uart7.p_api->write(g_uart7.p_ctrl, (uint8_t const * const)&ch, 1);

    /* 等待发送完毕 */
    uart7_wait_for_tx();

    return ch;
}

/* 重写这个函数,重定向scanf */
int fgetc(FILE *f)
{
    uint8_t ch;

    (void)f;

    /* 启动接收字符 */
    g_uart7.p_api->read(g_uart7.p_ctrl, &ch, 1);

    /* 等待接收完毕 */
    uart7_wait_for_rx();

    /* 回显 */
    {
        fputc(ch, NULL);

        /* 回车之后加换行 */
        if (ch == '\r')
        {
            fputc('\n', NULL);;
        }
    }

    return (int)ch;
}
```

示例代码如下，从串口上读入两个整数，求和后输出：

```c
void hal_entry(void)
{
    /* TODO: add your own code here */
    fsp_err_t err;
    uint32_t a, b;

    /* 配置串口 */
    err = g_uart7.p_api->open(g_uart7.p_ctrl, g_uart7.p_cfg);

    printf("www.100ask.net\r\n");

    while (1)
    {
        printf("Please enter two number:\r\n");
        scanf("%d%d", &a, &b);
        printf("%d+%d=%d\r\n", a, b, a+b);
    }
}
```

### 7.3.3 上机实验

在Keil工程里，确保选择了MicroLIB，如下图确认：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-7/image5.png) 

程序烧写、运行后，在串口工具上看到“Please enter two number:”时，输入一个数值并回车，再输入第2个数值并回车，即可看到效果。如下图：

```c
www.100ask.net
Please enter two number:
12
34
12+34=46
Please enter two number:
```

## 7.4 接收大量数据

本实验的源码是“0703_circle_buffer”，它的能接收大量的串口数据。板子使用串口连接其他模块（比如WIFI模块）时，这些模块有可能突然发来大量的数据。怎样确保数据不丢失？

### 7.4.1 问题与解决思路

使用sci_uart模块接收串口数据时，有两种方法：

1) 程序调用read函数“启动接收”，中断回调函数里确定参数event等于UART_EVENT_RX_COMPLETE，表示接收到指定数目的数据了
2) 程序没有调用read函数，中断回调函数确定参数event等于UART_EVENT_RX_CHAR，然后保存数据

假设函数A读取串口数据、处理，示例代码如下：

```c
void A(void)
{
    while (1)
    {
        /* 启动接收字符 */
        err = g_uart7.p_api->read(g_uart7.p_ctrl, &c, 1);
        /* 等待接收完毕 */
        uart7_wait_for_rx();
        /* 处理 */
        process_data();
    }
}
```

考虑这个场景：

- 第6行代码启动“接收”，在第8行等待接收成功
- 第10行的process_data函数非常耗时
- 在第10行的函数执行期间，外接的模块继续发来大量的数据，这个时候就会出现问题

中断程序得到其他字符时会调用回调函数：event为UART_EVENT_RX_CHAR，而不是UART_EVENT_RX_COMPLETE：因为process_data未执行完，导致第6行的代码还没有被调用。

所以，我们需要在回调函数里处理event为UART_EVENT_RX_CHAR的情况：以存储“来不及处理的字符”。既然如此，干脆把所有接收到的字符存入一个buffer，同时修改fgetc让它直接返回buffer里的数据。

对于这个buffer，中断函数的回调函数从UART得到数据后写入buffer，程序从中读取数据，非常适合使用环形缓冲区。

### 7.4.2 环形缓冲区

环形缓冲区特别适合这种场景：

- 一方写buffer
- 另一方读buffer。

环形缓冲区实际上还是一维数组，假设有N个数组项，从第0个数组项开始遍历，访问完第N-1个数组项后，再从0开始——这就是“环形”的含义，如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-7/image6.png" style="zoom:150%;" />

环形缓冲区的工作原理如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-7/image7.png)

① 有读位置、写位置：r、w，它们表示“下一个要读的位置”、“下一个要写的位置”。初始值都是0。
② 写数据时：把数据写入buffer[w]，然后调整w指向下一个位置（当w越界后要从0开始）。
③ 读数据时：从buffer[r]读出数据，然后调整r指向下一个位置（当r越界后要从0开始）。
④ 判断buffer为空：r等于w时表示空
⑤ 判断buffer为满：“下一个写位置”等于当前读位置

### 7.4.3 环形缓冲区编程

以面向对象的编程思想，针对环形缓冲区先定义一个结构体类型，代码在0703_circle_buffer\src\circle_buf.h文件中，如下：

```c
typedef struct circle_buf {
    uint32_t r;
    uint32_t w;
    uint32_t max_len;
    uint8_t  *buffer;    
    int32_t (*put)(struct circle_buf *pcb, uint8_t v);
    int32_t (*get)(struct circle_buf *pcb, uint8_t *pv);
}circle_buf_t;
```

- 第2~5行分别是读位置、写位置、buffer大小、buffer指针。
- 第6、7行是两个函数指针：写buffer、读buffer。

在0703_circle_buffer\src\circle_buf.c中，定义并初始化了一个环形缓冲区结构体，代码如下：

```c
static uint8_t rx_buf[64];
circle_buf_t g_rx_buf;

void circlebuf_init(void)
{
    g_rx_buf.r = g_rx_buf.w = 0;
    g_rx_buf.buffer  = rx_buf;
    g_rx_buf.max_len = sizeof(rx_buf);
    g_rx_buf.get = circlebuf_get;
    g_rx_buf.put = circlebuf_put;
}
```

- 第01行定义了一个buffer，在第50行里它被赋给环形缓冲区结构体。
- 第02行定义了一个全局的环形缓冲区结构体变量g_rx_buf，以后会直接使用这个变量。
- 第04行的circlebuf_init函数被用来初始化g_rx_buf。
- 第09、10行给g_rx_buf设置了两个函数，这是环形缓冲区的核心操作函数。

1. 写环形缓冲区的代码

   ```c
   static int32_t circlebuf_put(struct circle_buf *pcb, uint8_t v)
   {
       uint32_t next_w;
   
       /* 计算"下一个写位置的下一个", 如果越界就要设置为0 */
       next_w = pcb->w + 1;
       if (next_w == pcb->max_len)
           next_w = 0;
   
       /* 未满? */
       if (next_w != pcb->r)
       {
           /* 写入数据 */
           pcb->buffer[pcb->w] = v;
   
           /* 设置下一个写位置 */
           pcb->w = next_w;
           return 0;
       }
       return -1;
   }
   ```

2. 读环形缓冲区的代码

   ```c
    static int32_t circlebuf_get(struct circle_buf *pcb, uint8_t *pv)
    {
        /* 不空? */
        if (pcb->w != pcb->r)
        {
            /* 读出数据 */
            *pv = pcb->buffer[pcb->r];
   
            /* 计算"下一个读位置", 如果越界就要设置为0 */
            pcb->r++;
            if (pcb->r == pcb->max_len)
                pcb->r = 0;
   
            return 0;
        }
        return -1;
    }
   ```

### 7.4.4 改造程序

使用环形缓冲区后，应用程序无需调用UART的read函数来“启动读取”，只需要读取环形缓冲区即可。

谁给环形缓冲区提供数据？板子接收到串口数据时，中断函数被调用，中断函数会调用回调函数，回调函数里把数据写入环形缓冲区。

在0703_circle_buffer\src\hal_entry.c里，回调函数代码如下：

```c
static volatile int g_uart7_tx_complete = 0;

void uart7_callback(uart_callback_args_t * p_args)
{
    switch (p_args->event)
    {
        case UART_EVENT_TX_COMPLETE:
        {
            g_uart7_tx_complete  = 1;
            break;
        }
        case UART_EVENT_RX_CHAR:
        {
            g_rx_buf.put(&g_rx_buf, (uint8_t)p_args->data);
            break;
        }
        default:
        {
            break;
        }
    }
}
```

- 第12~16行，把接收到在字符放入环形缓冲区g_rx_buf里。

现在可以修改fgetc函数了，代码在0703_circle_buffer\src\console.c里，如下：

```c
/* 重写这个函数,重定向scanf */
int fgetc(FILE *f)
{
     uint8_t ch;

    (void)f;
     while (g_rx_buf.get(&g_rx_buf, &ch)){};

    /* 回显 */
    {
        fputc(ch, NULL);

        /* 回车之后加换行 */
        if (ch == '\r')
        {
            fputc('\n', NULL);;
        }
    }

    return (int)ch;
}
```

- 第07行从环形缓冲区中得到数据：如果失败则再次读取。
- 第09~18行是回显操作。

为了测试“唤醒缓冲区可以不丢数据”，修改应用程序代码在0703_circle_buffer\src\hal_entry.c，如下：

```c
void hal_entry(void)
{
    /* TODO: add your own code here */
    fsp_err_t err;
    int a = 1, b =2 ;

    /* 初始化环形缓冲区 */
    circlebuf_init();

    /* 配置串口 */
    err = g_uart7.p_api->open(g_uart7.p_ctrl, g_uart7.p_cfg);

    printf("www.100ask.net\r\n");
    printf("waiting 10 seconds, you can enter datas too.\r\n");
    // 延时10秒
    R_BSP_SoftwareDelay(1, 10*BSP_DELAY_UNITS_SECONDS);

    while (1)
    {
             printf("Please enter two number:\r\n");
             scanf("%d%d", &a, &b);
             printf("%d + %d = %d\r\n", a, b, a+b);
    }
}
```

- 第16行里故意延时10秒，你可以在这个时间里输入字符。

### 7.4.5 上机实验

当程序打印出“waiting 10 seconds, you can enter datas too.”时，可以输入1并回车、输入2并回车（盲打，这时没有回显），然后等待。最后可以看到打印后续结果：

```
www.100ask.net
waiting 10 seconds, you can enter datas too.
Please enter two number:
1
2
1 + 2 = 3
Please enter two numbe
```

