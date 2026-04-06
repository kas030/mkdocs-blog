# GNU 工具链

## gcc

gcc（GNU C Compiler）是 GCC（GNU Compiler Collection）的一部分，实际上是一个驱动程序，它的主要作用是根据文件后缀名，去调用后台各种专用的编译器和工具。

**常用参数**

- `-E` 预处理
- `-S` 预处理和编译
- `-c` 预处理、编译和汇编
- `-o <file>` 指定输出目标文件名
- `-g` 生成调试信息
- `-Wall` 启用所有警告
- `-w` 禁止所有警告
- `-O0`、`-O1`、`-O2`、`-O3` 优化级别，数字越大优化越激进
- `-save-temps` 不删除中间文件
- `-std=<standard>` 指定 C 标准，如 `c11`、`c17` 等
- `-I<dir>` 添加头文件搜索路径
- `-L<dir>` 添加库文件搜索路径
- `-B<directory>` 添加搜索路径
- `-m32` 生成32位程序
- `-fPIE`、`-fPIC` 生成位置无关代码
- `-pie` 生成位置无关可执行文件
- `-no-pie` 生成非位置无关可执行文件
- `shared` 生成共享库
- `static` 生成静态库

!!! tip "gcc 的参数有顺序要求吗？"

    对于普通的编译参数顺序通常无所谓，但对于链接库参数（如 `-l`），顺序至关重要。
    
    链接器（ld）在处理库文件时，是从左到右单次扫描的，被依赖的项要放在后面。
    
    例如，如果一个程序依赖库 A，而库 A 又依赖库 B，那么顺序应该是：`gcc main.c -lA -lB`。

??? example "例子：分步编译 C 代码"
    
    预处理：
    ```shell
    gcc -E hello.c -o hello.i
    ```

    编译：
    ```shell
    gcc -S hello.i -o hello.s
    ```
    
    汇编：
    ```shell
    gcc -c hello.s -o hello.o
    ```
    
    链接：
    ```shell
    gcc hello.o -o hello
    ```

## as

as（GNU Assembler）是 GNU 工具链中负责汇编阶段的核心工具。它的主要任务是将汇编语言源文件翻译成机器能够识别的目标文件。在 Linux 中，它也被称为 GAS（GNU Assembler）。

as 默认使用 AT&amp;T 语法。

**常用参数**

- `-o <file>` 指定输出文件名。如果不加这个参数，默认生成 `a.out`
- `-g` 或 `--gdwarf-2` 生成调试信息
- `--32` / `--64` 指定目标架构
- `-W` 关闭所有警告信息
- `--fatal-warnings` 将所有警告视为错误
- `-I <path>` 指定 .include 伪指令搜索头文件的路径
- `D <symbol>` 定义一个宏，供汇编代码中的条件判断使用

## ld

ld 是 GNU 工具链中的链接器（Linker），将多个目标文件和库文件合并成一个可执行文件或共享库，负责处理内存布局、符号解析和库依赖。

**常用参数**

- `-o <output>` 指定输出文件名，默认是 `a.out`
- `-e <entry>` 指定程序入口点，默认通常是 `_start`
- `-m <emulation>` 指定仿真器 / 架构，例如在 64 位系统链接 32 位程序时，需要用 `-m elf_i386`
- `-s` 剔除（Strip）所有符号信息
- `-S` 仅剔除调试符号
- `-l<library>` 链接指定的库
- `L<searchdir>` 指定库文件的搜索路径
- `static` 强制进行静态链接，不使用共享库，将所有代码打包进可执行文件
- `shared` 创建一个共享库（`.so` 文件）而非可执行文件
- `T <script>` 指定链接脚本，允许精确定义代码段、数据段在内存中的物理地址
- `Ttext <address>` 快速指定代码段的起始地址
- `Tbss` / `-Tdata <address>` 分别指定 BSS 段和数据段的起始地址
- `--gc-sections` 垃圾回收，配合 gcc 的 `-ffunction-sections` 使用，可以删除代码中从未被调用过的函数
- `--print-map` 输出详细的链接地图
- `--verbose` 打印详细的链接过程，包括 ld 默认使用的内部链接脚本
- `-Map=<file>` 将链接地图保存到指定文件
- `--fatal-warnings` 将警告视为错误

## gdb

**常用参数和指令**

启动时参数：

- `--args` 调试带参数的可执行程序，如 `gdb --args ./app arg1 arg2`
- `q` 安静模式，不打印 GDB 的版本信息和版权声明
- `-p <PID>` 附加到正在运行的进程上
- `-c <core file>` 用于调试程序崩溃后产生的 core dump 文件
- `-tui` 启动文本用户界面，可以在上方看到源码，下方输入命令

常用调试指令：
