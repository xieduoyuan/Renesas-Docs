# 第14章 QSPI

本章目标

- 使用RASC快速配置QSPI模块
- 学会使用QSPI的API对W25Q64进行数据读写

## 14.1 认识QSPI

QSPI是Quad SPI的简写，是Motorola公司推出的SPI接口的扩展协议，比普通SPI增加了两条数据线。

### 14.1.1 SPI和QSPI的区别

普通SPI协议有很多扩展：Dual SPI、Quad SPI等。

通过前面章节对SPI接口协议的分析已经知道，普通SPI有4个IO控制：CS/SCK/MOSI/MISO，在通信的时候由主机通过CS选中从机设备，发出SCK时钟，主机把数据驱动到MOSI线上发给从机，主机从MISO线上将数据读进来。

对于Dual SPI（双线串行外设接口），它同样也由4根线共同完成通信：CS/SCK/IO0/IO1，和SPI不同的是，Dual SPI在收发数据的时候是使用2根数据线IO0和IO1进行的，而不是像SPI那样收发数据分别只使用1条数据线。因而，在单向数据传输上，Dual SPI的传输速度是SPI的2倍。Dual SPI是半双工的。

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image1.png" style="zoom:150%;" /> 

对于Quad SPI（四线串行外设接口），它较之于Dual SPI则是多了2根数据线IO2/IO3。在通信的时候，收发数据使用4根数据线进行，在单向传输上，速率是SPI的4倍，是Dual SPI的2倍。Quad SPI是半双工的。

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image2.png" style="zoom:150%;" />  

### 14.1.2 RA6M5系列的QSPI

1. QSPI框图

RA6M5的QSPI框图如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image3.png)  

通过QSPI模块，可以方便地编写程序，使用QSPI协议访问外设。

2. SPI总线协议

QSPI向下兼容普通SPI、Dual SPI。所以它支持的SPI总线协议有3种：Single SPI/Dual SPI/Quad SPI，这三种协议需要的控制线和数据线看下表：

| IO         | Single SPI | Dual SPI | Quad SPI |
| ---------- | ---------- | -------- | -------- |
| QSSL/CS    | ☑          | ☑        | ☑        |
| QSPCLK/SCK | ☑          | ☑        | ☑        |
| QIO0       | ☑          | ☑        | ☑        |
| QIO1       | ☑          | ☑        | ☑        |
| QIO2       | ☒          | ☒        | ☑        |
| QIO3       | ☒          | ☒        | ☑        |

3. SPI模式

RA6M5的QSPI有2种SPI模式：SPI Mode0和SPI Mode3，对应的特点如下：

- SPI Mode 0：时钟信号线QSPCLK在SPI总线空闲地时候呈低电平；
- SPI Mode 3：时钟信号线QSPCLK在SPI总线空闲地时候呈高电平；

4. QSPI的内存映射

当使用QSPI连接外部存储设备时，RA6M5系列处理器的地址和外部存储设备的地址映射如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image4.png)  

从图中可以看出，其映射首地址是0x60000000，结束地址是0x68000000，共有128MB大，但是用于映射外部存储器的大小只有低64MB的空间——这就是一个Bank的大小。还可通过QSPI.EXT[5:0]来选择64个Bank（只使用63个Bank），所以QSPI可以访问的最大容量为64MB*63。

使用QSPI的直接通信模式时，并不涉及这些映射关系，直接发出存储设备上的偏移地址即可。

使用XIP模式时，才需要使用这样的地址：0x60000000+存储设备偏移地址。

### 14.1.3 QSPI的XIP控制

XIP，execute in place，直接翻译过来就是“就地执行”。就地执行什么？就地执行存储设备上的程序。使用XIP的好处是不用将存储设备的程序复制到RAM上才能运行，而是直接就地执行。

RA6M5的QSPI就支持XIP控制方法，通过寄存器SFMXD[7:0]和SFMSDC实现进入和退出XIP控制模式。

什么情况下XIP方法呢？当内部Flash不足需要把程序保存到QSPI外设上，并且RAM也不够大导致无法把QSPI外设的程序读到RAM里运行，才会考虑这种方式。但是使用这种方式时，程序执行效率会慢一些，毕竟使用QSPI读取指令的速度远低于从RAM上读取指令的速度。

### 14.1.4 直接通信模式

对于RA6M5的QSPI，它还有一种通信模式叫做直接通信模式Direct Communication Mode。瑞萨考虑到市面上的外部存储设备有不同的访问方法，需要使用直接通信模式来发送定制化的指令以读写数据。

## 14.2 QSPI模块的使用

### 14.2.1 配置QSPI模块

本章实验驱动的W25Q64模块为板载模块，原理图如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image5.png)  

W25Q64连接到QSPI0模块，使用的GPIO引脚如下：

| 序号 | 模块引脚 | 芯片SPI0引脚 |
| ---- | -------- | ------------ |
| 1    | CS       | P306         |
| 2    | SCK      | P305         |
| 3    | IO0      | P307         |
| 4    | IO1      | P308         |
| 5    | IO2      | P309         |
| 6    | IO3      | P310         |

其中CS是QSPI的片选信号引脚，IO0~IO3是QSPI的4根数据线。

在RASC中配置QSPI，首先在RASC的“Pin Configuration”中的“Peripherals”里展开“Storage:QSPI”，选中里面的QSPI0，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image6.png)  

配置QSPI的引脚时，“Pin Group Selection”选择组别时，有混合型Mixed和组别独有型，如图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image7.png" style="zoom:150%;" />  

在不清楚引脚属于哪一个组别的情况下可以使用Mixed组别来手动指定。

对于QSPI的操作模式“Operation Mode”，支持自定义Custom模式、Single SPI和Dual SPI模式以及Quad SPI模式。如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image8.png" style="zoom:150%;" />  

本章选择的是Quad SPI模式。

配置完引脚和操作模式后，就要去“Stacks”里添加QSPI的Stack模块。点击“New Stack”，选择里面的“Storage”中的“QSPI(r_qspi)”,如图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image9.png)  

添加了QSPI的Stack模块后再去配置参数。首先是General通用参数，需要在这里设置QSPI的协议、地址位数、读写模式、空闲时钟和页大小等，下图是根据W25Q64的特点进行的设置：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image10.png" style="zoom:150%;" />  

具体参数参考下表：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image11.PNG)

接着是命令定义，也就是设置QSPI通信设备的一些控制命令。FSP默认的一些命令能够满足大部分都QSPI设备，如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image12.png" style="zoom:150%;" /> 

这些命令需要根据通信的设备来设置，需要仔细核对。对于本章使用的W25Q64而言，这些命令都是可以使用的，本章没有对其进行修改，使用的是默认的指令。

最后是QSPI总线的时间设置，如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image13.png" style="zoom:150%;" /> 

在RASC中仅设置QSPI的时钟分频系数、在失能（Deselect）后的片选信号保持高电平的最小时钟个数。同样的也是需要根据通信设备的要求来设置，本章这里还是使用的是默认设置。

设置好QSPI的Stack模块之后，点击右上角的“Generate Project Content”生成代码。接下来就是去工程中看一下RASC的配置在工程中是如何体现的。

### 14.2.2 配置信息解读

配置信息分为两部分：引脚的配置信息、QSPI模块的配置信息。

QSPI涉及的引脚，它们配置信息在工程的pin_data.c中生成。在RASC里配置的每一个引脚，都会在pin_data.c生成一个ioport_pin_cfg_t数组项，里面的内容跟配置时选择的参数一致。代码如下：

```c
const ioport_pin_cfg_t g_bsp_pin_cfg_data[] = {
    ......（省略内容）
    {   .pin = BSP_IO_PORT_03_PIN_05,
        .pin_cfg = ((uint32_t) IOPORT_CFG_PERIPHERAL_PIN 
                  | (uint32_t) IOPORT_PERIPHERAL_QSPI)},
    {   .pin = BSP_IO_PORT_03_PIN_06,
        .pin_cfg = ((uint32_t) IOPORT_CFG_PERIPHERAL_PIN 
                  | (uint32_t) IOPORT_PERIPHERAL_QSPI)},
    {   .pin = BSP_IO_PORT_03_PIN_07,
        .pin_cfg = ((uint32_t) IOPORT_CFG_PERIPHERAL_PIN 
                  | (uint32_t) IOPORT_PERIPHERAL_QSPI)},
    {   .pin = BSP_IO_PORT_03_PIN_08,
        .pin_cfg = ((uint32_t) IOPORT_CFG_PERIPHERAL_PIN 
                  | (uint32_t) IOPORT_PERIPHERAL_QSPI)},
    {   .pin = BSP_IO_PORT_03_PIN_09,
        .pin_cfg = ((uint32_t) IOPORT_CFG_PERIPHERAL_PIN 
                  | (uint32_t) IOPORT_PERIPHERAL_QSPI)},
    {   .pin = BSP_IO_PORT_03_PIN_10,
        .pin_cfg = ((uint32_t) IOPORT_CFG_PERIPHERAL_PIN 
                  | (uint32_t) IOPORT_PERIPHERAL_QSPI)},
    ......（省略内容）
};
```

这段代码将QSPI的引脚P305~P310配置为QSPI外设复用功能，当使用GPIO的open函数时就会配置好这些引脚。

QSPI的配置信息，是在hal_data.c中生成。它定义了一个spi_flash_cfg_t结构体常量g_qspi0_cfg：

```c
const spi_flash_cfg_t g_qspi0_cfg =
{
    .spi_protocol        = SPI_FLASH_PROTOCOL_EXTENDED_SPI,
    .read_mode           = SPI_FLASH_READ_MODE_FAST_READ_QUAD_IO,
    .address_bytes       = SPI_FLASH_ADDRESS_BYTES_3,
    .dummy_clocks        = SPI_FLASH_DUMMY_CLOCKS_4,
    .page_program_address_lines = SPI_FLASH_DATA_LINES_1,
    .page_size_bytes     = 256,
    .page_program_command = 0x02,
    .write_enable_command = 0x06,
    .status_command = 0x05,
    .write_status_bit    = 0,
    .xip_enter_command   = 0x20,
    .xip_exit_command    = 0xFF,
    .p_erase_command_list = &g_qspi0_erase_command_list[0],
    .erase_command_list_length = sizeof(g_qspi0_erase_command_list) / sizeof(g_qspi0_erase_command_list[0]),
    .p_extend            = &g_qspi0_extended_cfg,
};
```

这个结构体的成员就包含了QSPI的协议、模式、地址位数等配置信息。

### 14.2.3 API接口及其用法

在路径1401_qspi_w25q/ra/fsp/inc/api/r_spi_flash_api.h中定义了SPI Flash模块的接口，它定义了一个结构体类型spi_flash_api_t，内容如下：

```c
/** SPI flash implementations follow this API. */
typedef struct st_spi_flash_api
{
    fsp_err_t (* open)(spi_flash_ctrl_t * p_ctrl, 
                       spi_flash_cfg_t const * const p_cfg);
    fsp_err_t (* directWrite)(spi_flash_ctrl_t * p_ctrl, 
                              uint8_t const * const p_src, 
                              uint32_t const bytes,
                              bool const read_after_write);
    fsp_err_t (* directRead)(spi_flash_ctrl_t * p_ctrl, 
                             uint8_t * const p_dest, 
                             uint32_t const bytes);
    fsp_err_t (* directTransfer)(spi_flash_ctrl_t * p_ctrl, 
                                 spi_flash_direct_transfer_t * const p_transfer,
                                 spi_flash_direct_transfer_dir_t direction);
    fsp_err_t (* spiProtocolSet)(spi_flash_ctrl_t * p_ctrl, 
                                 spi_flash_protocol_t spi_protocol);
    fsp_err_t (* write)(spi_flash_ctrl_t * p_ctrl, 
                        uint8_t const * const p_src, 
                        uint8_t * const p_dest,
                        uint32_t byte_count);
    fsp_err_t (* erase)(spi_flash_ctrl_t * p_ctrl, 
                        uint8_t * const p_device_address, 
                        uint32_t byte_count);
    fsp_err_t (* statusGet)(spi_flash_ctrl_t * p_ctrl, 
                            spi_flash_status_t * const p_status);
    fsp_err_t (* xipEnter)(spi_flash_ctrl_t * p_ctrl);
    fsp_err_t (* xipExit)(spi_flash_ctrl_t * p_ctrl);
    fsp_err_t (* bankSet)(spi_flash_ctrl_t * p_ctrl, uint32_t bank);
    fsp_err_t (* autoCalibrate)(spi_flash_ctrl_t * p_ctrl);
    fsp_err_t (* close)(spi_flash_ctrl_t * p_ctrl);
} spi_flash_api_t;
```

在r_qspi.c中实现了上述结构体：

```c
const spi_flash_api_t g_qspi_on_spi_flash =
{
    .open           = R_QSPI_Open,
    .directWrite    = R_QSPI_DirectWrite,
    .directRead     = R_QSPI_DirectRead,
    .directTransfer = R_QSPI_DirectTransfer,
    .spiProtocolSet = R_QSPI_SpiProtocolSet,
    .write          = R_QSPI_Write,
    .erase          = R_QSPI_Erase,
    .statusGet      = R_QSPI_StatusGet,
    .xipEnter       = R_QSPI_XipEnter,
    .xipExit        = R_QSPI_XipExit,
    .bankSet        = R_QSPI_BankSet,
    .autoCalibrate  = R_QSPI_AutoCalibrate,
    .close          = R_QSPI_Close,
};
```

对于QSPI的操作，开发者可以使用spi_flash_api_t结构体的函数指针，也可以直接调用r_qspi.c实现的R_QSPI_xxx()函数。本书使用的是面向对象的编程思想，选择使用函数指针的操作方式。

接下来我们就来看下FSP中QSPI的一些基本操作。

1. 打开QSPI设备

打开QSPI设备的函数指针原型如下：

```c
fsp_err_t (* open)(spi_flash_ctrl_t * p_ctrl, 
                   spi_flash_cfg_t const * const p_cfg);
```

它有两个参数：

- spi_flash_ctrl_t：这是一个void类型指针，实际会指向一个qspi_instance_ctrl_t的结构体变量，qspi_instance_ctrl_t的原型如下：

```c
typedef struct st_qspi_instance_ctrl
{
    spi_flash_cfg_t const * p_cfg;            // Pointer to initial configuration
    spi_flash_data_lines_t  data_lines;       // Data lines
    uint32_t                total_size_bytes; // Total size of the flash in bytes
    uint32_t                open;             // Whether or not driver is open
} qspi_instance_ctrl_t;
```

这个结构体会指明QSPI设备的open状态和配置参数spi_flash_cfg_t；

- spi_flash_cfg_t：QSPI设备的配置参数结构体，其原型如下：

```c
typedef struct st_spi_flash_cfg
{
    spi_flash_protocol_t      spi_protocol;                      ///< Initial SPI protocol.  SPI protocol can be changed in @ref spi_flash_api_t::spiProtocolSet.
    spi_flash_read_mode_t     read_mode;                         ///< Read mode
    spi_flash_address_bytes_t address_bytes;                     ///< Number of bytes used to represent the address
    spi_flash_dummy_clocks_t  dummy_clocks;                      ///< Number of dummy clocks to use for fast read operations

    /** Number of lines used to send address for page program command. This should either be 1 or match the number of lines used in
     * the selected read mode. */
    spi_flash_data_lines_t            page_program_address_lines;
    uint8_t                           write_status_bit;          ///< Which bit determines write status
    uint8_t                           write_enable_bit;          ///< Which bit determines write status
    uint32_t                          page_size_bytes;           ///< Page size in bytes (maximum number of bytes for page program). Used to specify single continuous write size (bytes) in case of OSPI RAM.
    uint8_t                           page_program_command;      ///< Page program command
    uint8_t                           write_enable_command;      ///< Command to enable write or erase, typically 0x06
    uint8_t                           status_command;            ///< Command to read the write status
    uint8_t                           read_command;              ///< Read command - OSPI SPI mode only
    uint8_t                           xip_enter_command;         ///< Command to enter XIP mode
    uint8_t                           xip_exit_command;          ///< Command to exit XIP mode
    uint8_t                           erase_command_list_length; ///< Length of erase command list
    spi_flash_erase_command_t const * p_erase_command_list;      ///< List of all erase commands and associated sizes
    void const                      * p_extend;                  ///< Pointer to implementation specific extended configurations
} spi_flash_cfg_t;
```

在使用RASC配置QSPI的参数并生成工程后，会在hal_data.c定义一个常量g_qspi0_cfg，在调用open函数时就会用到g_qspi0_cfg（下列代码的g_qspi0.p_cfg）：

```c
fsp_err_t err = g_qspi0.p_api->open(g_qspi0.p_ctrl, g_qspi0.p_cfg);
if(FSP_SUCCESS != err)
    printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
```

2. QSPI的直接写和直接读

QSPI的直接写函数原型如下：

```c
fsp_err_t (* directWrite)(spi_flash_ctrl_t * p_ctrl, 
                          uint8_t const * const p_src, 
                          uint32_t const bytes,
                          bool const read_after_write);
```

- p_ctrl：spi flash控制结构体指针；
- p_src：源数据（要发送的数据）地址；
- bytes：发送数据的个数；
- read_after_write：发送数据结束后是否要立即读数据的标志位，true-会立即读；

QSPI直接读的函数原型如下：

```c
fsp_err_t (* directRead)(spi_flash_ctrl_t * p_ctrl, 
                         uint8_t * const p_dest, 
                         uint32_t const bytes);
```

- p_ctrl：spi flash控制结构体指针；
- p_src：源数据（要发送的数据）地址；
- bytes：读取数据的个数；

对于很多QSPI接口的存储器而言，想要读取它们的某些信息，比如ID、储存的数据等，往往都是要先发送读取指令，接着发送读取地址后，主机才能读到数据。因而对于读操作，需要先发起写操作。

下面是一个例子，读取W25Q64的ID：

```c
unsigned int W25QDrvReadID(void)
{
    uint8_t cmd = 0x9F;
    uint8_t id[3] = {0};
    g_qspi0.p_api->directWrite(g_qspi0.p_ctrl, 
                               &cmd, 
                               1, 
                               true);
    g_qspi0.p_api->directRead(g_qspi0.p_ctrl, id, 3);
    unsigned int ID = (id[0]<<16) | (id[1]<<8) | (id[2]);
    return ID;
}
```

- 第03行：读取ID的指令是0x9F；
- 第05~08行：使用直接写函数发送读ID指令，并且表明紧跟着会读取数据；
- 第09行：使用直接读函数将读到的ID保存到数据id中；
- 第10~11行：组合ID并返回给调用者；

3. 使用QSPI对存储设备进行页写

QSPI封装了一个对QSPI接口存储器的页写函数，原型如下：

```c
fsp_err_t (* write)(spi_flash_ctrl_t * p_ctrl, 
                    uint8_t const * const p_src, 
                    uint8_t * const p_dest,
                    uint32_t byte_count);
```

- p_ctrl：spi flash控制指针；
- p_src：源数据（要发送的数据）地址；
- p_dest：存储设备的目标地址；
- byte_count：数据个数

这是一个页写功能的函数，如果byte_count超过RASC中配置的页大小，则写入失败。

要用好此函数，必须配合外部存储器的内存特性进行计算，得到地址偏移。

本章后面，会把扇区擦除、状态获取、页写函数等，封装出一个更好用的写函数，供读者参考使用。

4. 使用QSPI擦除存储设备的扇区

对于一些ROM型的外部存储器，要想写入数据，必须先擦除。

以本章使用的实验对象W25Q64而言，它的最小擦除单位是1个扇区（一个扇区是由16个页组成），而FSP恰好也封装了一个对扇区的擦除函数，原型如下：

```c
fsp_err_t (* erase)(spi_flash_ctrl_t * p_ctrl, 
                    uint8_t * const p_device_address, 
                    uint32_t byte_count);
```

- p_device_address：要擦除的外部存储器的起始地址；
- byte_count：要擦除的数据个数；

执行此函数时，byte_count必须等于可擦除块的大小（可能有多个取值，比如4096、32768、65536、SPI_FLASH_ERASE_SIZE_CHIP_ERASE）。

5. 状态获取

在写、擦除QSPI之前，需要判断上一个操作是否完成。FSP也对这个功能进行了封装，函数原型如下：

```c
fsp_err_t (* statusGet)(spi_flash_ctrl_t * p_ctrl, 
                        spi_flash_status_t * const p_status);
```

-  p_status：指向保存状态值的地址，是一个spi_flash_status_t结构体类型，此结构体的原型是：

```c
typedef struct st_spi_flash_status
{
    bool write_in_progress;
} spi_flash_status_t;
```

只有一个bool成员write_in_progress，用来表示外部存储器是否“正在处理写操作”。

读者可以参考以下代码来获取状态值：

```c
spi_flash_status_t status = {.write_in_progress = true};
while(status.write_in_progress == true)
{
    fsp_err_t err = g_qspi0.p_api->statusGet(g_qspi0.p_ctrl, &status);
    if(FSP_SUCCESS != err)
    {
        printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
        return;
    }
}
```



## 14.3 QSPI读写外部Flash

### 14.3.1 硬件连接

使用QSPI连接W25Q64的原理图如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image14.png) 

### 14.3.2 W25Q64驱动解析

W25Q64是华邦电子的一款支持SPI、扩展SPI（Single/Dual/Quad SPI）接口的外部存储器，存储大小是64M-bit。

写操作的单位是页，每一页有256 bytes。擦除操作的单位是扇区，每16页为一个扇区，也就是进行擦除操作时，最小的擦除单位是16*256 bytes=4096 bytes。

1. W25Q64的指令表

对于W25Q64的所有操作都是执行对应的指令，因而需要先了解W25Q64支持哪些指令，指令表如下：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image15.PNG)

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image16.png)

- MF7-MF0：制造商ID；
- ID15-ID8：内存类型；
- ID7-ID0：生产ID；

2. 读取W25Q64的ID

从指令表中可以看到读取ID有好几个指令：0xAB/0x90/0x4B/0x9F，也不难看出指令0x9F获取的ID内容是最丰富的，因而常用的就是0x9F。

对于W25Q64的各个ID的描述，在手册中有说明，如下图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image17.png) 

如果使用0x9F去读取ID，那么Byte2~Byte4组合起来就是0xEF4017。

读取JEDEC ID的时序是先发送指令0x9F，然后连续读取3个字节即可。

3. W25Q64的写使能

要想对W25Q64进行写操作或者擦除操作，必须要先使能对W25Q64的写功能。写使能的指令是0x06，操作时序是主机发送一个0x06给W25Q64即可。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image18.png) 

4. 读取W25Q64的状态寄存器

W25Q64的状态寄存器有2个：register-1和register-2。它们表示W25Q64不同的控制状态，如下表所示：

|            | S7   | S6   | S5   | S4   | S3   | S2   | S1   | S0   |
| ---------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| register-1 | SRP0 | SEC  | TB   | BP2  | BP1  | BP0  | WEL  | BUSY |
|            | S15  | S14  | S13  | S12  | S11  | S10  | S9   | S8   |
| register-2 | R    | R    | R    | R    | R    | R    | QE   | SRP1 |

- BUSY:Erase or Write in process;1-busy;0-free;
- WEL:Write Enable Latch；
- BP1~BP2：Block Protect;
- TB：Top/Bottom Write Protect;
- SEC：Sector Protect;
- SRP0：Status Register Protect;
- SRP1: Status Register Protect 1;
- QE：Quad Enable;

指令0x05读取状态寄存器1；指令0x35读取状态寄存器2。

5. W25Q64的数据写操作

W25Q64有两种写操作：Page Program和Quad Input Page Program。这两者都是页写功能，它们有2个差别：指令不同（Page Program的指令是0x02，而Quad Input Page Program的指令是0x32），使用的数据线不同（Page Program使用1根数据线，Quad Input Page Program使用4跟数据线）。

下图是Page Program的时序图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image19.png) 

下图是Quad Input Page Program的时序图： 

 ![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image20.png)

不管是Page Program还是Quad Input Page Program，都只能在已经擦除过的地方写数据，并且必须先发送使能指令0x01。

在页写的时候，如果写入的数据个数少于一页，且和该页已写的数据加起来也不会超过一页的数据量，那么从该页已写数据的末地址开始写入新数据的话不会影响之前已写的数据。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image21.png) 

当写入的数据加上该页已写入的数据超过一页的数据量，那么超过的数据将会被舍弃，并不会写入到下一页。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image22.png) 

6. W25Q64的数据擦除操作

W25Q64有4种擦除方式：扇区擦除(0x20)、32KB块擦除(0x52)、64KB块擦除(0xD8)和整片擦除(0xC7/0x60)。

使用扇区擦除、块擦除需要在发送指令后，紧接着发送要擦除的扇区地址或者块地址，地址必须是扇区地址或块地址的整数倍。

当芯片内部执行擦除操纵时，状态标志寄存器1的BUSY会被置1，表示“处于忙状态”。

7. W25Q64的数据读操作

W25Q64的读操作就有很多种方式了：

a) Read Data(0x03)

b) Fast Read Data(0x08)

c) Fast Read Dual Output(0x3B)

d) Fast Read Quad Output(0x6B)

e) Fast Read Dual IO(0xBB)

f) Fast Read Quad IO(0xEB)

不管是哪种读方式，都必须是在QSPI总线处于空闲状态下才能执行。

使用上述6种方式中的哪一种，需要结合QSPI模式来考虑。比如硬件上使用Quad模式，那么为了提高读取速度，软件上也应该使用Quad的方式去读。

只是在使用Fast Read读取数据的时候，需要根据手册的时序图来设置空读时钟，例如Fast Read Data方式下就需要空读一个字节，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image23.png) 

### 14.3.3 W25Q64驱动程序

在介绍QSPI的API的时候已经知道，FSP已经封装了直接读写函数、扇区擦除函数和页写函数，本章实验是在这些函数的基础上封装了3个函数：读ID、状态等待、读写任意地址任意大小的数据。

1. 读取ID

在分析W25Q64的ID读取到时候就已经清楚，要想读ID，首先要发送一个字节的指令数据，然后读3个字节的数据即可。函数代码如下：

```c
unsigned int W25QDrvReadID(void)
{
    uint8_t cmd = 0x9F;
    uint8_t id[3] = {0};
    g_qspi0.p_api->directWrite(g_qspi0.p_ctrl, &cmd, 1, true);
    g_qspi0.p_api->directRead(g_qspi0.p_ctrl, id, 3);
    unsigned int ID = (id[0]<<16) | (id[1]<<8) | (id[2]);
    return ID;
}
```

- 第05行：使用直接写函数发送cmd指令，且表示紧跟着会读取数据；
- 第06行：读取3个字节的ID；
- 第07行：将ID组合以便当作返回值提供给调用者；

2. 等待擦除或写数据完成

在擦除或者写数据的时候，需要在QSPI总线空闲地时候进行，也就是状态寄存器1的BUSY位为0才可，因而设计了如下的等待函数：

```c
static void W25QDrvWaitXfer(void)
{
    spi_flash_status_t status = {.write_in_progress = true};
    while(status.write_in_progress == true)
    {
        fsp_err_t err = g_qspi0.p_api->statusGet(g_qspi0.p_ctrl, &status);
        if(FSP_SUCCESS != err)
        {
            printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
            return;
        }
    }
}
```



3. 读取数据

本章使用的数据读取方式就是普通的QSPI Read Data方式，使用的指令是0x03。根据它的时序图，需要先用直接写函数发送1个字节的指令，再发送3个字节的地址，紧接着读取n字节的数据，因而封装了如下代码：

```c
int W25QDrvRead(unsigned int dwAddr, unsigned char *buf, unsigned int dwSize)
{
    dwAddr = QSPI_DEVICE_START_ADDRESS + dwAddr;
    unsigned char cmd[4] = {0};
    cmd[0] = 0x03;  // read data command
    cmd[1] = (dwAddr>>16)&0xFF;
    cmd[2] = (dwAddr>>8)&0xFF;
    cmd[3] = (dwAddr)&0xFF;
    W25QDrvWaitXfer();
    fsp_err_t err = g_qspi0.p_api->directWrite(g_qspi0.p_ctrl, cmd, 4, true);
    if(FSP_SUCCESS != err)
    {
        printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
        return -1;
    }
    err = g_qspi0.p_api->directRead(g_qspi0.p_ctrl, buf, dwSize);
    if(FSP_SUCCESS != err)
    {
        printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
        return -1;
    }
    // 返回独处数据的个数
    return (int)dwSize;
}
```

- 第03行：因为QSPI接的外部存储器在内存中的映射起始地址是0x60000000，为了方便使用，调用者在调用读取数据的函数时只需要传入0~64MB的地址值即可，在此函数内部做内存映射偏移；
- 第09行：需要等待QSPI总线空闲时才能读；
- 第10行：使用直接写函数发送4字节数据：指令和地址，并且表示紧接着会读取数据；
- 第16行：使用直接读函数从dwAddr处读取dwSize个字节的数据，存到buf；

4. 写数据

要想在任意地址写入任意大小的数据，就稍微有点复杂了。需要考虑以下几个问题：

a) 要写入到这片区域是否擦除了？要擦除几个扇区？
b) 要写入到这个地址是否和页地址对齐？
c) 要写入到数据个数是否超过一页？
d) 数据个数超过一页又该如何写？

考虑到这些问题，本章设计了如下图这样的流程图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image24.png) 

再根据此流程图设计了下面的函数：可以在任意地址处写入任意个数据。

```c
int W25QDrvWrite(unsigned int dwAddr, unsigned char *buf, unsigned int dwSize)
{
    /* 第1步 擦除扇区 */
    unsigned int dwOffsetAddr = 0;
    unsigned int dwStartAddr = dwAddr/4096*4096;
    unsigned int dwSectorCount = (dwSize + dwAddr%4096)/4096 + 1;
    while(dwSectorCount--)
    {
        unsigned int nAddr = dwStartAddr + dwOffsetAddr;
        fsp_err_t  err = g_qspi0.p_api->erase(g_qspi0.p_ctrl, (uint8_t*)(QSPI_DEVICE_START_ADDRESS+nAddr), 4096);
        if(FSP_SUCCESS != err)
        {
            printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
            return -1;
        }
        W25QDrvWaitXfer();
        dwOffsetAddr += 4096;
    }

    /* 第2部 分页写 */
    unsigned int dwPageCount = (dwSize + dwAddr%256)/256 + 1;
    // 如果从起始地址开始偏移dwSize都没有超过一页就从起始地址开始写dwSize字节
    if(dwPageCount == 1)
    {
        fsp_err_t err = g_qspi0.p_api->write(g_qspi0.p_ctrl, buf, (uint8_t*)(QSPI_DEVICE_START_ADDRESS+dwAddr), dwSize);
        if(FSP_SUCCESS != err)
        {
            printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
            return -1;
        }
        W25QDrvWaitXfer();
    }
    else
    {
        unsigned int nAddr = dwAddr;
        // 如果超过了一页则先将起始地址所在页填充满
        unsigned int dwFirstBytes = 256 - dwAddr%256;
        // 计算出写满起始地址所在页后剩余要写的数据个数
        unsigned int dwRestBytes = dwSize - dwFirstBytes;
        // 填充起始地址所在页
        fsp_err_t err = g_qspi0.p_api->write(g_qspi0.p_ctrl, buf, (uint8_t*)(QSPI_DEVICE_START_ADDRESS+nAddr), dwFirstBytes);
        if(FSP_SUCCESS != err)
        {
            printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
            return -1;
        }
        W25QDrvWaitXfer();

        // 将W25Q的地址偏移到下一页的起始地址
        nAddr += dwFirstBytes;
        // 要写入的数据buff地址也要更新
        buf += dwFirstBytes;
        // 开始将剩下的数据写入到W25Q
        while(dwRestBytes != 0)
        {
            unsigned int nBytes = 0;
            // 剩下的数据个数不满一页的话
            // 最后一次就将剩下的数据全部写入到最后要写的这一页
            if(dwRestBytes <= 256)
                nBytes = dwRestBytes;
            else
                nBytes = 256;

            err = g_qspi0.p_api->write(g_qspi0.p_ctrl, buf, (uint8_t*)(QSPI_DEVICE_START_ADDRESS+nAddr), nBytes);
            if(FSP_SUCCESS != err)
            {
                printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
                return -1;
            }
            W25QDrvWaitXfer();

            // W25Q地址和buf地址偏移，剩余个数递减刚才写入的数据个数
            nAddr += nBytes;
            buf += nBytes;
            dwRestBytes -= nBytes;
        }
    }
    // 返回写入数据的个数
    return (int)dwSize;
}
```

### 14.3.4 测试程序

本章使用QSPI驱动测试W25Q64，就是读取它的ID，以及在随机地址处写入随机大小的数据进去，然后再读出比较，测试代码如下：

```c
#define TEST_SIZE       (300)
uint8_t wBuf[TEST_SIZE] = {0};
uint8_t rBuf[TEST_SIZE] = {0};

void W25QAppTest(void)
{
    W25QDrvInit();
    
    printf("Device ID: 0x%.8x\r\n", W25QDrvReadID());

    for(uint16_t i=0; i<TEST_SIZE; i++)
        wBuf[i] = (uint8_t)(rand()%256);

    uint32_t dwAddr = (uint32_t)rand()%1000;
    uint32_t dwSize = (uint32_t)rand()%TEST_SIZE;
    W25QDrvWrite(dwAddr, wBuf, dwSize);
    W25QDrvRead(dwAddr, rBuf, dwSize);
    uint16_t wCnt = 0;
    for(uint16_t i=0; i<dwSize; i++)
    {
        if(wBuf[i] != rBuf[i])
            wCnt++;
    }
    printf("\tRW Addr: 0x%.4x\r\n\tRW Size: %d\r\n\tError count: %d\r\n", dwAddr, dwSize, wCnt);
}
```

### 14.3.5 上机实验

在hal_entry.c中的hal_enter()函数调用测试函数，例如下代码：

```c
#include "app.h"
#include "hal_systick.h"
#include "drv_w25q.h"
#include "drv_uart.h"
#include "hal_data.h"

void hal_entry(void)
{
    /* TODO: add your own code here */
    SystickInit();
    UARTDrvInit();
    W25QAppTest();
}
```

将编译出来的二进制可执行文件烧录到处理器中运行，然后在串口助手中可以看到如下图这样的调试打印信息：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-14\image25.png" style="zoom:150%;" /> 

读者自行测试的时候，读写的地址和数据个数可能会和本书的不一样。