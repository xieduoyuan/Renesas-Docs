
# 5. 配置PYOCD(Windows)

在windows系统上配置好PYOCD之后才可以在e2stduio上使用，因此我们要先在windows系统中配置好PYOCD，下面是配置步骤。

在文件管理器中打开 `C盘` ，新建 `100ASK_PYOCD` 目录，如下图所示：

![DShanMCU-RA6M5-DAP-013](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-013.png)

进入新建的 `100ASK_PYOCD` 目录，将资料包位于 `6_使用软件/PYOCD/` 的 **pyocd.yaml** 和 **MDK_Device_Packs_v4.5.0.zip** 复制到刚刚新建位于C盘的 `100ASK_PYOCD` 目录中，如下图所示：

![DShanMCU-RA6M5-DAP-014](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-014.png)

使用解压缩工具解压 **MDK_Device_Packs_v4.5.0.zip** 得到 **Renesas.RA_DFP.4.5.0.pack**

![DShanMCU-RA6M5-DAP-015](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-015.png)

继续使用解压缩工具解压 **Renesas.RA_DFP.4.5.0.pack** ，得到 `Renesas.RA_DFP.4.5.0` 文件夹：

![DShanMCU-RA6M5-DAP-016](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-016.png)

将文件夹 `Renesas.RA_DFP.4.5.0` **重命名** 为 `Renesas.RA_DFP`：

![DShanMCU-RA6M5-DAP-017](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-017.png)

安装位于资料包的 `6_使用软件/Everything-1.4.1.1024.x64-Setup.exe` ,安装之后打开 `Everything`，按照下图**输入搜索** `pyocd`

![DShanMCU-RA6M5-DAP-018](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-018.png)

在上面的搜索结果中，我们重点关注 `pyocd.exe` 与 `pyocd-gdbserver.exe`，这两者的目录都是一样的，位于：`C:\Users\biubiu\AppData\Roaming\Python\Python311\Scripts` 不同电脑不同系统都可能会不一样，以自己实际得出的为准。请将这个路径要记下来，后面还需要用到一次。

按下键盘的 **win+r** 键，在屏幕左下角会弹出一个小窗口，在其输入框中输入 `cmd` 之后按下回车键进入windows命令行窗口，在窗口中输入 **C:\Users\biubiu\AppData\Roaming\Python\Python311\Scripts\pyocd.exe list --targets --config C:\100ASK_PYOCD\pyocd.yaml** 按下回车键执行，如下图所示：

![DShanMCU-RA6M5-DAP-019](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-019.png)

到这里，配置PYOCD(Windows)已完成！


<center>本节完</center>

<div STYLE="page-break-after: always;"></div>
