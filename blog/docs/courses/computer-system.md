# 计算机系统

## GNU 工具链

### GCC 指令

???+ note "常用参数"

    - `-E` 只激活预处理
    - `-S` 只激活预处理和编译
    - `-c` 只激活预处理、编译和汇编
    - `-o` 制定目标名称

预处理：

```shell
gcc -E hello.c -o hello.i
```

生成汇编代码：

```shell
gcc -S hello.i -o hello.s
```

生成可重定向目标代码：

```shell
gcc -c hello.s -o hello.o
```

生成可执行文件：

```shell
gcc hello.o -o hello
```
