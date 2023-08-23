# 第1章 内部温度传感器-TSN

本章目标

- 了解RA6M5处理器的内部温度及其换算公式；
- 学会使用RASC配置内部温度传感器并获取CPU实时温度值； 

## 1.1 TSN模块的使用

TSN本身集成在瑞萨RA6M5的ADC模块之中，使用TSN其实就是使用ADC0或ADC1里面的TSN通道而已。

不需要在FSP的Pins中添加TSN引脚，只需要在ADC的Stack模块中，依次进入如下配置界面：Module->Input->Channel Scan Mask，勾选“Temperature Sensor”，其它的配置和《第23章ADC与DSP》里对于ADC的配置一样。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-24/image1.png)

用户需要重点关心的是，怎样把采样值换算为处理器的温度。这在RA6M5处理器的用户手册中有说明（用户手册第45章），换算公式：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-24/image2.jpg)

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-24/image3.png)

典型值是4.0mV每℃，在程序中就取这个值。实际的使用中，V1是MCU的校准电压值，对于T1，厂商给的是127℃。

## 24.2 获取处理器内部温度实验

### 24.2.1 设计目的

让用户学会使用处理器的ADC采样MCU的内部温度，并了解换算公式。

### 24.2.2 驱动程序

本节实验使用的是《第23章ADC与DSP》中《23.4 直流电压采样实验》的驱动程序，只是在构造ADCDev时，里面的通道值随意指定为0xFF（无需特定的通道）了，代码如下：

```c
static struct ADCDev gAdcDev = {
    .name = "Temperature",
    .channel = 0xFF,
    .Init = ADCDrvInit,
    .Read = ADCDrvRead
};
```

上述代码的channel值没有被使用，在ADCDrvRead函数中使用如下代码读取TSN的ADC值：

```c
g_adc0.p_api->scanStart(g_adc0.p_ctrl);
ADCWaitConvCplt();
fsp_err_t err = g_adc0.p_api->read(g_adc0.p_ctrl, ADC_CHANNEL_TEMPERATURE, &value[i]);
```

在第03行代码中，使用第2个参数ADC_CHANNEL_TEMPERATURE表示要读取的是TSN的采样值。

### 24.2.3 测试程序

本次实验在获取到内部温度的采样值之后通过公式计算温度值：

```c
void ADCAppTest(void)
{
    SystickInit();
    UARTDrvInit();
    ADCDevTypeDef *ptAdcDev = ADCGetDevice();
    if(NULL == ptAdcDev)
    {
        printf("Error. Not found ADC device!\r\n");
        return;
    }
    ptAdcDev->Init(ptAdcDev);
    while(1)
    {
        uint16_t buf[4] = {0};
        ptAdcDev->Read(ptAdcDev, buf, 4);
        uint16_t value = 0;
        for(uint16_t i=0; i<4; i++)
        {
            value += buf[i];
        }
        value  = value/4;
        int32_t    cal127;
        adc_info_t adc_info;
        (void) R_ADC_InfoGet(&g_adc0_ctrl, &adc_info);
        cal127 = (int32_t) adc_info.calibration_data;
        float slope = 4.0/1000;
        float v1= 3.3 * cal127 / 4096;
        float vs = 3.3 * value /4096;
        float temperature = (vs - v1) / slope + 127;
        printf("CPU Temperature: %f℃\r\n", temperature);
        HAL_Delay(1000);
    }
}
```

- 第14~21行：连续采样4次算出内部温度采样值的平均值；
- 第23~25行：获取厂方校验值；
- 第26~29行：计算公式中各项的数值，并且按照公式计算出温度值；

### 24.2.4 测试结果

在hal_entry()中调用测试函数，将编译出来的二进制可执行文件烧录到板子上并运行，会得到例如下图这样的打印信息：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-24/image4.png)
