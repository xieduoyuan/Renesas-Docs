

# 第19章 RTC

本章目标
- 了解瑞萨处理器RTC模块的使用

## 19.1 RTC模块的使用

### 19.1.1 RTC简介

RA6M5的RTC(Real Time Clock)外设，实质是一个掉电后还继续运行的定时器。RA6M5的实时时钟(RTC)有两种计数模式：日历计数模式、二进制计数模式，可以通过寄存器的设置来切换模式。对于日历计数模式，RTC具有从2000年到2099年的100年日历，并自动调整闰年的日期。对于二进制计数模式，RTC计数秒，并保留信息作为串行值。二进制计数模式可用于公历(西历)以外的日历。

可以选择作子时钟振荡器或LOCO作为时间计数器的计数源。RTC使用128Hz的时钟，通过将计数源除以预分频器的值获得。

### 19.1.2 RTC特征

瑞萨处理器的RTC有如下特征：
- 计数模式：日历计数模式和二进制计数模式。
- 时钟源：子时钟或LOCO。
- l 日历计数模式：年，月，日，星期，小时，分钟，秒计数。
-  二进制计数模式：32位二进制计数器。
-  闹钟中断：在日历计数模式下，可以与年，月，日，星期，小时，分钟和秒进行比较。在二进制计数模式下则与32位2进制计数器进行对比。
-  周期性中断：可以选择2秒，1秒，1/2秒，1/4秒，1/8秒，1/16秒，1/32秒，1/64秒、1/128秒或1/256秒作为中断周期。
-  进位中断：当从64HZ计数器到二进制计数器的进位时和当改变64Hz计数器和R64同时读取CNT寄存器时进行中断。
-  输入捕获：当检测到捕获时间输入引脚的电平发生跳变时（上升沿或者下降沿时），可以进行输入捕获。 该输入捕获可以用日历计数或者二进制计数。电平跳变时可以产生中断。与GPT相同的是，该输入捕获也能使用噪声滤波器。
-  事件关联：周期性输出事件。
-  TrustZone过滤器：可以设置安全属性。

### 19.1.3 RTC的系统框图

瑞萨处理器的RTC系统框图大致分为以下几部分：

1. 外部引脚：

- XCIN/XCOUT，连接到外部32.768kHz晶振；
- RTCOUT：输出1Hz或64Hz的方波，无法在待机模式下使用。
- RTCICn（n = 0,1,2）：输入捕获引脚。

2. 计数器

这个计数器可以在VBAT供电下使用，由以下寄存器（同时也是计数器）构成：

- R64CNT：R64CNT是一个8位的计数器，由128Hz的时钟脉冲驱动，实际只使用[6:0]位，故其最大计数值为128次， 也就是1秒就会产生一次进位，并驱动RSECCNT/BCNT计数器+1。
- RSECCNT：用于统计R64CNT每秒产生的进位信号，表示“秒”，设置范围为0-59，如果设置其他值，会导致RTC工作异常。
- RMINCNT：用于统计RSECCNT每分钟产生的进位信号，表示“分”，设置范围为0-59，如果设置其他值，会导致RTC工作异常。
- RHRCNT：用于统计RMINCNT每小时产生的进位信号，表示“时”，当RTC设置为24小时制，则设置范围时0-23。 当RTC设置为12小时制，则设置范围时0-11。如果设置其他值，会导致RTC工作异常。
- RDAYCNT：用于统计RHRCNT的每天时产生进位信号，表示“日”，计数范围取决于月份以及这一年是否为闰年。设置范围为1-31，如果设置其他值，会导致RTC工作异常。
- RWKCNT：用于统计RHRCNT的每天产生的进位信号，表示“星期”，计数范围为0-6，如果设置其他值，会导致RTC工作异常。
- RMONCNT：用于统计RDAYCNT每个月产生的进位信号，表示“月”，计数范围为1-12，如果设置其他值，会导致RTC工作异常。
- RYRCNT：用于统计RMONCNT每个月产生的进位信号，表示“年”，计数范围为0-99，如果设置其他值，会导致RTC工作异常。

在二进制模式下，RSECCNT、RMINCNT、RHRCNT、RWKCNT共同构成BCNT（Binary Counter），是一个32位向上递增的计数器。通过统计R64CNT的进位次数进行计数。

3. 闹钟功能

在日历计数模式下，闹钟可以按年、月、日、周、时、分、秒或它们的任意组合来设置。在设置闹钟时，往涉及的寄存器的ENB位（都是最高位）写1， 并在低位设置比较值；对于不涉及的寄存器，往它的ENB位写入0。例如，设置闹钟为每天的8点30分， 则在RMINAR（分闹钟寄存器）的最高位写入1，同时低位为30。RHRAR（时闹钟寄存器）最高位写入1，同时低位写8。其他寄存器则在最高位写0。

在二进制计数模式下，时间值是32位的数值，设置闹钟时，要比较哪些位？在BCNTnAER中，将需要比较的位写1，不需要比较的位写0。这些位的比较值是什么？BCNTnAR中设置比较值。

需要注意的是，在日历计数模式下，闹钟寄存器的比较值使用BCD码。

4. 中断控制

RTC支持的中断请求有以下三种：

- 闹钟中断请求
- 周期计数中断请求
- 捕获比较中断请求

5. 输入捕获控制单元

整体框图如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-19/image1.png)

### 19.1.4 配置RTC模块

配置RTC时，需要配置引脚和Stack模块。

1. 配置RTC引脚

在RASC的配置界面中去“Pins”里的“Peripherals”找到“Timers:RTC”，选择RTC0后,在右侧使能它的操作模式，如果不输出RTC时钟或者捕获采样信号，就不需要选择引脚，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-19/image2.png)

2. 加配置RTC的Stack模块

首先需要去“Stacks”中添加RTC的Stack，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-19/image3.png)

然后去配置RTC Stack的参数。

RTC的Stack参数分为3个板块：

1. Common：配置RTC的通用参数，所有的RTC模块都会使用到这个板块的参数配置；
2. Module：指定RTC模块的定制参数，包括模块名称、时钟源、中断回调函数、中断优先级等；
3. Pins：RTC的引脚；

RTC的Common板块中比较重要的参数是“Set Source Clock in Open”，如果使能了这个参数且后续使用的时钟源是子时钟，那么用户在代码中就不需要使用函数手动设置时钟源；如果不使能，就需要在代码中调用函数手动设置RTC的时钟源。默认是“Enabled”。

而RTC的Module板块需要配置的参数比较多，详见下表：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-19/image4.jpg)

下图是设置万年历实验的RTC Stack模块参数配置图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-19/image5.png)

在万年历实验中，选择的时钟源是子时钟系统，使能了周期计数中断，它的优先级选择为比较低的10级优先级，中断回调函数的函数名设置为rtc_callback。

### 19.1.5 配置信息解读

因为没有使用RTC的输入/输出引脚，因而使用RASC配置好RTC并生成工程后，只会在hal_data.c中生成RTC设备对象的配置信息代码。

在hal_data.c中，定义了一个rtc_instance_t类型的全局变量g_rtc0，它含有控制参数、配置信息、接口信息：

```c
const rtc_instance_t g_rtc0 =
{
    .p_ctrl        = &g_rtc0_ctrl,
    .p_cfg         = &g_rtc0_cfg,
    .p_api         = &g_rtc_on_rtc
};
```

- p_ctrl：RTC控制参数，它指向结构体变量g_rtc0_ctrl，g_rtc0_ctrl结构体原型如下：

```c
typedef struct st_rtc_ctrl
{
    uint32_t          open;                     ///< Whether or not driver is open
    const rtc_cfg_t * p_cfg;                    ///< Pointer to initial configurations
    volatile bool     carry_isr_triggered;      ///< Was the carry isr triggered

    void (* p_callback)(rtc_callback_args_t *); // Pointer to callback that is called when a rtc_event_t occurs.
    rtc_callback_args_t * p_callback_memory;    // Pointer to non-secure memory that can be used to pass arguments to a callback in non-secure memory.

    void const * p_context;                     // Pointer to context to be passed into callback function
} rtc_instance_ctrl_t;
```

- p_cfg：RTC配置参数，它指向全局常量g_rtc0_cfg，此常量成员的取值来自用户在RASC中对RTC的配置；以万年历的配置为例，此常量的赋值代码如下：

```c
const rtc_cfg_t g_rtc0_cfg =
{
    .clock_source            = RTC_CLOCK_SOURCE_SUBCLK,
    .freq_compare_value_loco = 255,
    .p_err_cfg               = &g_rtc0_err_cfg,
    .p_callback              = rtc_callback,
......（省略内容）
};
```

- p_api：RTC操作函数的封装，指向结构体g_rtc_on_rtc，后面讲解。

### 19.1.6 中断回调函数

在RASC中设置了RTC的中断回调函数名字，会在hal_data.h中声明此函数：

```c
#ifndef rtc_callback
void rtc_callback(rtc_callback_args_t * p_args);
#endif
```

用户需要在自己的程序中实现此函数，例如：

```c
void rtc_callback(rtc_callback_args_t * p_args)
{
      if(RTC_EVENT_PERIODIC_IRQ == p_args->event)
      {
      }
}
```

用户可以根据参数p_args的event成员判断是什么触发了RTC的中断，RTC的中断事件有以下这些：

```c
/** Events that can trigger a callback function */
typedef enum e_rtc_event
{
    RTC_EVENT_ALARM_IRQ,               ///< Real Time Clock ALARM IRQ
    RTC_EVENT_PERIODIC_IRQ,            ///< Real Time Clock PERIODIC IRQ
} rtc_event_t;
```

只有2种原因：闹铃中断、周期计数中断。

### 19.1.7 API接口及其用法

RTC模块的操作方法封装到了结构体rtc_api_t中，此结构体的原型如下：

```c
typedef struct st_rtc_api
{
    fsp_err_t (* open)(rtc_ctrl_t * const p_ctrl, 
                       rtc_cfg_t const * const p_cfg);
    fsp_err_t (* close)(rtc_ctrl_t * const p_ctrl);
    fsp_err_t (* clockSourceSet)(rtc_ctrl_t * const p_ctrl);
    fsp_err_t (* calendarTimeSet)(rtc_ctrl_t * const p_ctrl, 
                                  rtc_time_t * const p_time);
    fsp_err_t (* calendarTimeGet)(rtc_ctrl_t * const p_ctrl, 
                                  rtc_time_t * const p_time);
    fsp_err_t (* calendarAlarmSet)(rtc_ctrl_t * const p_ctrl, 
                                   rtc_alarm_time_t * const p_alarm);
    fsp_err_t (* calendarAlarmGet)(rtc_ctrl_t * const p_ctrl, 
                                   rtc_alarm_time_t * const p_alarm);
    fsp_err_t (* periodicIrqRateSet)(rtc_ctrl_t * const p_ctrl, 
                                     rtc_periodic_irq_select_t const rate);
    fsp_err_t (* errorAdjustmentSet)(rtc_ctrl_t * const p_ctrl, 
                                     rtc_error_adjustment_cfg_t const * const err_adj_cfg);
    fsp_err_t (* callbackSet)(rtc_ctrl_t * const p_ctrl, 
                              void (* p_callback)(rtc_callback_args_t *),
                              void const * const p_context, 
                              rtc_callback_args_t * const p_callback_memory);
    fsp_err_t (* infoGet)(rtc_ctrl_t * const p_ctrl, 
                          rtc_info_t * const p_rtc_info);
} rtc_api_t;
```

瑞萨在r_rtc.c中实现了一个rtc_api_t结构体，里面填充了各个函数指针，如下：

```c
const rtc_api_t g_rtc_on_rtc =
{
    .open               = R_RTC_Open,
    .close              = R_RTC_Close,
    .clockSourceSet     = R_RTC_ClockSourceSet,
    .calendarTimeGet    = R_RTC_CalendarTimeGet,
    .calendarTimeSet    = R_RTC_CalendarTimeSet,
    .calendarAlarmGet   = R_RTC_CalendarAlarmGet,
    .calendarAlarmSet   = R_RTC_CalendarAlarmSet,
    .periodicIrqRateSet = R_RTC_PeriodicIrqRateSet,
    .infoGet            = R_RTC_InfoGet,
    .errorAdjustmentSet = R_RTC_ErrorAdjustmentSet,
    .callbackSet        = R_RTC_CallbackSet,
};
```

接下来介绍这些操作函数。

1. 打开RTC设备

```c
fsp_err_t (* open)(rtc_ctrl_t * const p_ctrl, 
                   rtc_cfg_t const * const p_cfg);
```

- p_ctrl：rtc_ctrl_t结构体类型，用来记录一些状态信息；
- p_cfg：rtc_cfg_t结构体类型，含有RTC的配置信息；

用户可以参考以下代码调用此函数初始化RTC的配置：

```c
fsp_err_t err = g_rtc0.p_api->open(g_rtc0.p_ctrl, g_rtc0.p_cfg);
if(FSP_SUCCESS != err)
{
	printf("Error in %s on %d\r\n", __FUNCTION__, __LINE__);
}
```

2. 关闭RTC设备

```c
fsp_err_t (* close)(rtc_ctrl_t * const p_ctrl);
```

关闭RTC设备只需要传入RTC的控制参数即可，此函数会将控制参数p_ctrl中的状态标志位open成员改变位CLOSED。

用户可以参考以下代码关闭RTC设备：

```c
fsp_err_t err = g_rtc0.p_api->close(g_rtc0.p_ctrl);
if(FSP_SUCCESS != err)
{
    printf("Error in %s on %d\r\n", __FUNCTION__, __LINE__);
}
```

3. 设置RTC的时钟源

```c
fsp_err_t (* clockSourceSet)(rtc_ctrl_t * const p_ctrl);
```

如果用户在RASC的配置中没有将“Set Source Clock in Open”设置为“Enabled”，就需要在代码中调用此函数手动设置使能RTC的时钟源。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-19/image6.png)

用户可以参考以下代码手动设置使能RTC的时钟源：

```c
fsp_err_t err = g_rtc0.p_api->clockSourceSet(g_rtc0.p_ctrl);
if(FSP_SUCCESS != err)
{
    printf("Error in %s on %d\r\n", __FUNCTION__, __LINE__);
}
```

4. 设置RTC的计数起始时间

```c
fsp_err_t (* calendarTimeSet)(rtc_ctrl_t * const p_ctrl, 
                              rtc_time_t * const p_time);
```

- p_time：rtc_time_t结构体类型，此结构体成员表示日常的时间值（年月日，时分秒和星期），原型如下：

```c
struct tm {
    int tm_sec;   /* seconds after the minute, 0 to 60
                     (0 - 60 allows for the occasional leap second) */
    int tm_min;   /* minutes after the hour, 0 to 59 */
    int tm_hour;  /* hours since midnight, 0 to 23 */
    int tm_mday;  /* day of the month, 1 to 31 */
    int tm_mon;   /* months since January, 0 to 11 */
    int tm_year;  /* years since 1900 */
    int tm_wday;  /* days since Sunday, 0 to 6 */
    int tm_yday;  /* days since January 1, 0 to 365 */
    int tm_isdst; /* Daylight Savings Time flag */
};
typedef struct tm rtc_time_t;
```

在注释中已经解释了这些成员的取值范围。

用户需要先定义一个rtc_time_t结构体，将其各成员赋值后再调用函数calendarTimeSet函数，它会设置RTC从这个时间开始计数。

用户可以参考以下代码来设置RTC的初始计数时间：

```c
rtc_time_t SetTime = {
    .tm_sec = 0,  //秒
    .tm_min = 0,  //分
    .tm_hour = 0,  //小时
    .tm_mday = 29,  //日（一个月中）
    .tm_wday = 1,   //星期
    .tm_mon = 5,   //月份
    .tm_year = 2023-1900, //年份（如今年是2008，则这里输入2008-1900=108）
};
fsp_err_t err = g_rtc0.p_api->calendarTimeSet(g_rtc0.p_ctrl, &SetTime);
FSP_Assert(FSP_SUCCESS == err);
```

此段代码将RTC的初始时间设置为2023年5月29日星期一的0时0分0秒。

5. 获取RTC的当前计数时间

```c
fsp_err_t (* calendarTimeGet)(rtc_ctrl_t * const p_ctrl, 
                              rtc_time_t * const p_time);
```

此函数是获取RTC当前计数的时间，和设置时间使用的是同一个结构体。用户可以参考以下代码获取当前时间：

```c
void rtc_callback(rtc_callback_args_t * p_args)
{
      if(RTC_EVENT_PERIODIC_IRQ == p_args->event)
      {
         /*若是周期中断，获取日期*/
         gRtcPeriodFlag = true;
         g_rtc0.p_api->calendarTimeGet(g_rtc0.p_ctrl, (rtc_time_t*)&gCurTime);
      }
}
```

上述代码是在RTC的中断回调函数中，更新一个全局变量gCurTime，它被用来记录时间值。

可以使用如下函数返回gCurTime，获得当前时间：

```c
rtc_time_t RTCDrvGetTime(void)
{
    RTCDrvWaitPeriodInt();
    return gCurTime;
}
```

6. 设置RTC的闹铃时间

```c
fsp_err_t (* calendarAlarmSet)(rtc_ctrl_t * const p_ctrl, 
                               rtc_alarm_time_t * const p_alarm);
```

- p_alarm：rtc_alarm_time_t结构体类型，用于指定闹铃匹配规则、匹配值，此结构体原型如下：

```c
typedef struct st_rtc_alarm_time
{
    rtc_time_t time;                   ///< Time structure
    bool       sec_match;  ///< Enable the alarm based on a match of the seconds field
    bool       min_match;  ///< Enable the alarm based on a match of the minutes field
    bool       hour_match; ///< Enable the alarm based on a match of the hours field
    bool       mday_match; ///< Enable the alarm based on a match of the days field
    bool       mon_match;  ///< Enable the alarm based on a match of the months field
    bool       year_match; ///< Enable the alarm based on a match of the years field
    bool dayofweek_match; ///< Enable the alarm based on a match of the dayofweek field
} rtc_alarm_time_t;
```

- 第03行：闹铃匹配的时间，结构体内容见前文；
- 第04~10行：RTC闹铃匹配规则，根据需求决定匹配哪个时间点，true-匹配，false-不匹配；

用户需要在程序中设定好匹配规则、匹配值后，再调用calendarAlarmSet函数进行设置，例如：

```c
rtc_alarm_time_t AlarmTime = {
    .time = {
        .tm_sec = 30,  //秒
        .tm_min = 0,  //分
        .tm_hour = 0,  //小时
        .tm_mday = 29,  //日（一个月中）
        .tm_wday = 1,   //星期
        .tm_mon = 5,   //月份
        .tm_year = 2023-1900, //年份（如今年是2023，则这里输入2023-1900=123）
    },
    .year_match = 0,
    .mon_match = 0,
    .mday_match = 0,
    .dayofweek_match = 0,
    .hour_match = 0,
    .min_match = 0,
    .sec_match = 1,
};
err = g_rtc0.p_api->calendarAlarmSet(g_rtc0.p_ctrl, &AlarmTime);
assert(FSP_SUCCESS == err);
```

- 第02~10行：将闹铃时间设置为2023-5-29.0:0:30；
- 第11~17行：匹配规则为仅匹配秒时间段，即每分钟的第30秒会匹配一次闹铃；
- 第19行：调用函数完成闹铃设置；

7. 获取RTC的闹铃时间

```c
fsp_err_t (* calendarAlarmGet)(rtc_ctrl_t * const p_ctrl, 
                               rtc_alarm_time_t * const p_alarm);
```

获取闹铃设置信息的使用比较简单，仅是帮助用户获知当前RTC设置的闹铃的匹配规则、匹配值。参数和设置闹铃时间函数的参数是同一结构体类型。

8. 设置RTC的中断周期

```c
fsp_err_t (* periodicIrqRateSet)(rtc_ctrl_t * const p_ctrl, 
                                 rtc_periodic_irq_select_t const rate);
```

rate：rtc_periodic_irq_select_t结构体类型，表示触发RTC周期中断的间隔时间，支持的时间如下：

```c
typedef enum e_rtc_periodic_irq_select
{
    RTC_PERIODIC_IRQ_SELECT_1_DIV_BY_256_SECOND = 6,
    RTC_PERIODIC_IRQ_SELECT_1_DIV_BY_128_SECOND = 7,
    RTC_PERIODIC_IRQ_SELECT_1_DIV_BY_64_SECOND  = 8,
    RTC_PERIODIC_IRQ_SELECT_1_DIV_BY_32_SECOND  = 9,
    RTC_PERIODIC_IRQ_SELECT_1_DIV_BY_16_SECOND  = 10,
    RTC_PERIODIC_IRQ_SELECT_1_DIV_BY_8_SECOND   = 11,
    RTC_PERIODIC_IRQ_SELECT_1_DIV_BY_4_SECOND   = 12,
    RTC_PERIODIC_IRQ_SELECT_1_DIV_BY_2_SECOND   = 13,
    RTC_PERIODIC_IRQ_SELECT_1_SECOND            = 14,
    RTC_PERIODIC_IRQ_SELECT_2_SECOND            = 15,
} rtc_periodic_irq_select_t;
```

根据枚举成员的命名可以知道，周期间隔中断时间是1/256秒、1/128秒……1秒、2秒，通常选用1秒的间隔，例如：

```c
err 
= g_rtc0.p_api->periodicIrqRateSet(g_rtc0.p_ctrl, RTC_PERIODIC_IRQ_SELECT_1_SECOND);
assert(FSP_SUCCESS == err);
```

9. 获取RTC的配置信息

```c
fsp_err_t (* infoGet)(rtc_ctrl_t * const p_ctrl, 
                      rtc_info_t * const p_rtc_info);
```

p_rtc_info：RTC的配置信息和运行状态信息，配置信息指时钟源信息，运行状态则是指RTC是处于停滞状态还是运行状态：

```c
typedef struct st_rtc_info
{
    rtc_clock_source_t clock_source;   ///< Clock source for the RTC block
    rtc_status_t       status;         ///< RTC run status
} rtc_info_t;
```

运行状态的枚举成员如下：

```c
typedef enum e_rtc_status
{
    RTC_STATUS_STOPPED = 0,            ///< RTC counter is stopped
    RTC_STATUS_RUNNING = 1             ///< RTC counter is running
} rtc_status_t;
```


## 19.2 万年历实验

### 19.2.1 设计目的

学会使用瑞萨处理器的RTC FSP库函数接口，获取RTC的计数时间并且将之打印出来观察。

### 19.2.2 硬件连接

作为例程实验，本书没有连接外部电池电源VBAT，断电后无法保存维持RTC时钟，但是不影响本实验。

### 19.2.3 驱动程序

1. 初始化RTC

需要设置RTC的起始计数时间，并设置周期性中断的时间值，代码如下：

```c
int RTCDrvInit(void)
{
    rtc_time_t SetTime = {
        .tm_sec = 0,  //秒
        .tm_min = 0,  //分
        .tm_hour = 0,  //小时
        .tm_mday = 29,  //日（一个月中）
        .tm_wday = 1,   //星期
        .tm_mon = 5,   //月份
        .tm_year = 2023-1900, //年份（如今年是2008，则这里输入2008-1900=108）
    };

    fsp_err_t err = g_rtc0.p_api->open(g_rtc0.p_ctrl, g_rtc0.p_cfg);
    assert(FSP_SUCCESS == err);
    
    err = g_rtc0.p_api->calendarTimeSet(g_rtc0.p_ctrl, &SetTime);
    assert(FSP_SUCCESS == err);
    
    err = g_rtc0.p_api->periodicIrqRateSet(g_rtc0.p_ctrl, RTC_PERIODIC_IRQ_SELECT_1_SECOND);
    assert(FSP_SUCCESS == err);
    
    return true;
}
```

2. 中断回调函数和周期等待函数

本次实验，先在中断回调函数中判断触发中断的原因是否为“周期中断”，在全局变量gCurTime中更新当前时间值：

```c
void rtc_callback(rtc_callback_args_t * p_args)
{
    if(RTC_EVENT_PERIODIC_IRQ == p_args->event)
    {
     /*若是周期中断，获取日期*/
     gRtcPeriodFlag = true;
     g_rtc0.p_api->calendarTimeGet(g_rtc0.p_ctrl, (rtc_time_t*)&gCurTime);
    }
}
```

在此基础上封装一个周期中断的等待函数：

```c
static int RTCDrvWaitPeriodInt(void)
{
    int ret = (int)gRtcPeriodFlag;
    gRtcPeriodFlag = false;
    return ret;
}
```

此函数如果返回true则表明时间已经更新。

3.时间获取函数

实际上，这个函数可以直接读取当前时间gCurTime，下面的代码中先判断是否发生了RTC周期性中断，只是想得到更新后的时间值（以免多次调用都得到同样的时间值）：

```c
int RTCDrvGetTime(rtc_time_t *time)
{
    if(RTCDrvWaitPeriodInt())
    {
        *time = gCurTime;
        return true;
    }
    return false;
}
```

此函数返回true才表明获取到了最新一次更新的时间，调用者根据返回值和输出参数time做处理。

### 19.2.4 测试程序

本次实验测试方法很简单，就是获取更新的时间再打印出来，代码如下：

```c
void RTCAppTest(void)
{
    UARTDrvInit();
    RTCDrvInit();
    printf("RTC Test!\r\n");
    while(1)
    {
        rtc_time_t time;
        if(RTCDrvGetTime(&time))
        {
            printf ("%.4d-%.2d-%.2d-%.2d:%.2d:%.2d\r", 
                    time.tm_year + 1900, 
                    time.tm_mon, 
                    time.tm_mday,
                    time.tm_hour, 
                    time.tm_min, 
                    time.tm_sec);
        }
    }
}
```

为了对齐以便观察，打印的年份使用4个数字，而月日时分秒使用2个数字表示。

### 19.2.5 测试结果

在hal_entry()函数中调用测试函数，将编译出来的二进制文件烧录到处理器中运行可以看到一直在计数的时间：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-19/image7.png)

![image8](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-19/image8.png)

上图只是观察变化，因为RTC的起始计数时刻并未和网络时间统一校准，会出现一定的偏差。

## 19.3 闹铃实验

### 19.3.1设计目的

FSP库的RTC函数，设计一个简单的闹铃匹配程序。

### 19.3.2 RTC模块配置

和万年历实验相比，本节实验的RTC模块需要使能RTC的Alarm中断：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-19/image9.png)

### 19.3.3驱动程序

1.初始化RTC

本次实验初始化RTC的时候除了设置RTC的起始计数时间以外，还要设置RTC的闹铃匹配规则和匹配值：

```c
int RTCDrvInit(void)
{
    rtc_time_t SetTime = {
        .tm_sec = 0,  //秒
        .tm_min = 0,  //分
        .tm_hour = 0,  //小时
        .tm_mday = 29,  //日（一个月中）
        .tm_wday = 1,   //星期
        .tm_mon = 5,   //月份
        .tm_year = 2023-1900, //年份（如今年是2023，则这里输入2023-1900=123）
    };
    
    rtc_alarm_time_t AlarmTime = {
        .time = {
            .tm_sec = 30,  //秒
            .tm_min = 0,  //分
            .tm_hour = 0,  //小时
            .tm_mday = 29,  //日（一个月中）
            .tm_wday = 1,   //星期
            .tm_mon = 5,   //月份
            .tm_year = 2023-1900, //年份（如今年是2023，则这里输入2023-1900=123）
        },
        .year_match = 0,
        .mon_match = 0,
        .mday_match = 0,
        .dayofweek_match = 0,
        .hour_match = 0,
        .min_match = 0,
        .sec_match = 1,
    };

    fsp_err_t err = g_rtc0.p_api->open(g_rtc0.p_ctrl, g_rtc0.p_cfg);
    assert(FSP_SUCCESS == err);
    /* 设置起始计数时间 */
    err = g_rtc0.p_api->calendarTimeSet(g_rtc0.p_ctrl, &SetTime);
    assert(FSP_SUCCESS == err);
    /* 设置闹铃匹配时间和匹配规则 */
    err = g_rtc0.p_api->calendarAlarmSet(g_rtc0.p_ctrl, &AlarmTime);
    assert(FSP_SUCCESS == err);
    /* 设置触发周期中断的时间间隔 */
    err = g_rtc0.p_api->periodicIrqRateSet(g_rtc0.p_ctrl, RTC_PERIODIC_IRQ_SELECT_1_SECOND);
    assert(FSP_SUCCESS == err);
    
    return true;
}
```

2. 中断回调函数和闹铃中断等待函数

本次实验的中断回调函数除了处理周期性中断外，还要处理闹铃中断，在闹铃中断事件中将闹铃事件标志置true：

```c
void rtc_callback(rtc_callback_args_t * p_args)
{
    switch(p_args->event)
    {
        case (RTC_EVENT_ALARM_IRQ):
        {
            /* 如果是闹铃事件，则闹铃标志设置true */
            gRtcAlarmFlag = true;
            break;
        }
        case (RTC_EVENT_PERIODIC_IRQ):
        {
            /*若是周期中断，获取日期*/
            gRtcPeriodFlag = true;
            g_rtc0.p_api->calendarTimeGet(g_rtc0.p_ctrl, (rtc_time_t*)&gCurTime);
            break;
        }
        default:break;
    } 
}
```

然后再封装一个闹铃事件等待函数：

```c
static int RTCDrvAlarmEvent(void)
{
    if(gRtcAlarmFlag)
    {
        gRtcAlarmFlag = false;
        return true;
    }
    return false;
}
```

用户通过调用此函数来判断是否触发闹铃事件。

3. 时间获取函数

此函数就是移植的上一小节万年历实验的驱动函数，此处不再说明。

### 19.3.4 测试程序

本节实验既要实时获取并打印RTC的计数时间，也要实时判断是否发生了闹铃匹配，如果发生了闹铃匹配那么就打印信息：

```c
void RTCAppTest(void)
{
    UARTDrvInit();
    RTCDrvInit();
    while(1)
    {
        rtc_time_t time;
        if(RTCDrvGetTime(&time))
        {
            printf ("%.4d-%.2d-%.2d-%.2d:%.2d:%.2d\r", 
                    time.tm_year + 1900, 
                    time.tm_mon, 
                    time.tm_mday,
                    time.tm_hour, 
                    time.tm_min, 
                    time.tm_sec);
        }
        if(RTCDrvAlarmEvent())
        {
            printf("\r\nAlarm Time!\r\n");
        }
    }
}
```

### 19.3.5 测试结果

在hal_entry()函数中调用测试函数，将编译出来的二进制文件烧录到处理器中运行观察可以发现，RTC计数时间的每个分钟的第30秒都会触发一次闹铃事件：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-19/image10.png)
