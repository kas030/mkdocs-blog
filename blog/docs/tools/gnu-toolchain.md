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

**常用指令和参数**

启动与运行：

- `gdb <program>` 启动 gdb，可以有参数：
    - `--args` 调试带参数的可执行程序，如 `gdb --args ./program arg1 arg2`
    - `q` 安静模式，不打印 gdb 的版本信息和版权声明
    - `-p <pid>` 调试一个正在运行的进程
    - `-tui` 开启 TUI 模式，可以在上方看到源码，下方输入命令
- `run (r)` 开始执行程序，可以带参数，例如 `r arg1 arg2`
- `start` 启动程序并停在 `main` 函数的第一行
- `quit (q)` 退出 gdb

断点管理：

- `break <loc> (b)` 在指定位置设断点，例如：
    - `b 15` 第 15 行
    - `b main` 函数开头
    - `b file.c:20` 指定文件的行
- `rbreak <regex>` 通过正则表达式设断点，只匹配函数名，需要有符号信息
- `tbreak <func>` 临时断点，触发一次后自动删除
- `break <func> + <offset>` 偏移量断点
- `break *<addr>` 地址断点
- `info breakpoints (i b)` 查看所有断点
- `delete <n> (d)` 删除编号为 n 的断点
- `disable <n>` 禁用断点
- `enable <n>` 启用断点

执行控制：

- `continue (c)` 继续运行直到断点
- `next (n)` 单步步过，不进入函数
- `step (s)` 单步步入，进入函数
- `finish` 执行到当前函数返回
- `until <line> (u)` 运行到指定行，常用于跳出循环
- `nexti (ni)` 执行下一条汇编指令，不进入函数
- `stepi (si)` 执行下一条汇编指令，进入函数

查看数据与状态：

- `list (l)` 列出源代码，可加行号或函数名，连续输入 `l` 会继续向下显示
- `layout src` 开启 TUI 模式
- `display <expr>` 每次程序停止时都自动显示该表达式
- `print/<fmt> <expr> (p)` 打印变量或表达式的值，常用格式：
    - `d` 有符号十进制
    - `-u` 无符号十进制
    - `x` 十六进制
    - `o` 八进制
    - `t` 二进制
    - `f` 浮点数
    - `c` 字符
    - `a` 地址（符号 + 偏移）
    - `s` 字符串
- `x/<n><f><u> <addr>` 查看内存地址内容
    - `n` 显示多少单元
    - `f` 格式，比 `p` 多一个格式 `i`，表示指令（反汇编）格式
    - `u` 单位
        - `b` 字节
        - `h` 半字（2 字节）
        - `w` 字（4 字节）
        - `g` 双字（8 字节）
- `info locals` 显示当前函数的所有局部变量
- `info args` 显示当前函数的参数
- `info registers (i r)` 查看所有通用寄存器的值
- `info all-registers` 查看包括浮点、向量（SSE/AVX）在内的所有寄存器

!!! tip "p 和 x 指令中格式的区别"

    `p` 是带类型的表达式求值，格式依赖类型，可以理解为强制类型转换；
    而 `x` 的本质是内存的位级重新解释。

堆栈：

- `backtrace (bt)` 查看当前的函数调用栈
- `frame <n> (f)` 切换到第 n 层栈帧
- `info stack` 查看当前栈帧的详细信息

汇编相关：

- `layout asm` 开启 TUI 模式，上半部分实时显示汇编指令
- `layout regs` 在汇编模式基础上，再开启一个窗口显示寄存器的实时数值
- `set disassembly-flavor intel` 将汇编格式设为 Intel 格式
- `set disassembly-flavor att` 设为 AT&amp;T 格式
- `disassemble (disas)` 反汇编当前函数
    - `disas <func_name>` 反汇编指定函数
    - `disas <start_addr>, <end_addr>` 反汇编特定地址区间
    - `disas /m <func_name>` 混合模式，同时显示源码和对应的汇编指令
    - `disas /r <func_name>` 显示十六进制机器码

多线程：

- `info threads` 查看所有线程
- `thread <id>` 切换到指定线程

调试技巧：

1. gdb 默认执行上一次输入的命令，直接回车可以快速连续执行相同指令。
2. 通过 `set var <name>=<value>` 在调试过程中直接修改变量的值，可以测试不同路径。
3. 如果程序崩溃并生成了 core 文件，可以通过
    ```shell
    gdb <program> <core_file>
    bt
    ```
    进行 Core Dump 调试。
4. 快速定位段错误：
    ```shell
    run
    bt
    ```

## objdump

**常用参数**

- `-d`/ `--disassemble` 反汇编
- `D` / `--disassemble-all` 反汇编所有段的内容
- `S` / `--source` 混合显示源码与汇编，前提是编译时加了 `-g` 参数
- `h` / `--section-headers` 显示各个段的汇总信息
- `j <section_name>` 仅查看特定段
