
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

<center>本节完</center>

<div STYLE="page-break-after: always;"></div>
