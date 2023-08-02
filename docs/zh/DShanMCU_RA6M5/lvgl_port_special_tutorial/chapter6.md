
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

<center>本节完</center>

<div STYLE="page-break-after: always;"></div>
