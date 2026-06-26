---
tags:
  - 计算机系统
  - CSAPP
  - C
---

# 程序的机器级表示

## 基本

### 汇编基础

**汇编程序员视角**

![img](./cmu-cs15-213-csappp-assets/img/assembly-view.png){ width="500" }
{.center-img}

程序员可见的状态：

- 程序计数器
- 寄存器文件
- 条件码
- 内存

**汇编数据类型**

- 1、2、4、8 字节的整数数据
    - 数值
    - 地址（无类型指针）
- 4、8、10 字节的浮点数据
- SIMD 向量数据类型
- 代码：字节序列编码的一系列指令

**IA32 通用寄存器**

![img](cmu-cs15-213-csappp-assets/img/ia32-regs.png){ width="550" }
{.center-img}

寄存器的细粒度访问如图所示。

**x86-64 通用寄存器**

![img](cmu-cs15-213-csappp-assets/img/x86-64-regs.png){ width="500" }
{.center-img}

在 x86-64 中，%rbp 通常已不再作为帧指针，可以当做普通寄存器使用。

!!! note "x86-64 寄存器的细粒度访问"

    1. 传统寄存器（RAX、RBX、RCX、RDX）
    
        - 32-bit：EAX、EBX、ECX、EDX
        - 16-bit：AX、BX、CX、DX
        - High 8-bit：AH、BH、CH、DH
        - Low 8-bit：AL、BL、CL、DL
    
    2. 指针与变址寄存器（RSI、RDI、RBP、RSP）
    
        - 32-bit：ESI、EDI、EBP、ESP
        - 16-bit：SI、DI、BP、SP
        - 8-bit：SIL、DIL、BPL、SPL
    
    3. 新增寄存器（R8 ~ R15）
    
        - 32-bit：R8D ~ R15D
        - 16-bit：R8W ~ R15W
        - 8-bit：R8B ~ R15B

**数据长度后缀**

再次注意：在 Intel 术语中，为了保持兼容性，字始终定义为 16 位。

- `b`（byte）：单字节
- `w`（word）：字，2 字节
- `l`（long）：双字，4 字节
- `q`（quad）：四字，8 字节

**AT&T 格式和 Intel 格式**

| 特性           | AT&T                               | Intel                                                     |
| -------------- | ---------------------------------- | --------------------------------------------------------- |
| 操作数顺序     | src &rarr; dst                     | dst &larr; src                                            |
| 寄存器         | 需要加 %                           | 直接写寄存器名称                                          |
| 立即数         | 需要加 $                           | 直接写数字                                                |
| 内存寻址       | `disp(base, index, scale)`         | `[base + index*scale + disp]`                             |
| 操作数大小表示 | 通过指令后缀<br>`b`、`w`、`l`、`q` | 通过关键字或上下文<br>`byte ptr`、`word ptr`、`dword ptr` |
| 注释           | `#`                                | `;`                                                       |

示例：

```asm
# AT&T
movb $1, (%eax)

; Intel
mov byte ptr [eax], 1
```

### 操作数格式

| 类型   | 格式                 | 操作数值                         | 名称                    |
| ------ | -------------------- | -------------------------------- | ----------------------- |
| 立即数 | $\text{\$}Imm$       | $Imm$                            | 立即数寻址              |
| 寄存器 | $r_a$                | $R[r_a]$                         | 寄存器寻址              |
| 存储器 | $Imm$                | $M[Imm]$                         | 绝对寻址                |
| 存储器 | $\left(r_a\right)$   | $M[R[r_a]]$                      | 间接寻址                |
| 存储器 | $Imm\left(r_b\right)$ | $M[Imm + R[r_b]]$                | （基址 + 偏移量）寻址   |
| 存储器 | $\left(r_b, r_i\right)$ | $M[R[r_b] + R[r_i]]$             | 变址寻址                |
| 存储器 | $Imm\left(r_b, r_i\right)$ | $M[Imm + R[r_b] + R[r_i]]$       | 变址寻址                |
| 存储器 | $\left(, r_i, s\right)$ | $M[R[r_i] \cdot s]$              | 比例变址寻址            |
| 存储器 | $Imm\left(, r_i, s\right)$ | $M[Imm + R[r_i] \cdot s]$        | 比例变址寻址            |
| 存储器 | $\left(r_b, r_i, s\right)$ | $M[R[r_b] + R[r_i] \cdot s]$     | 比例变址寻址            |
| 存储器 | $Imm\left(r_b, r_i, s\right)$ | $M[Imm + R[r_b] + R[r_i] \cdot s]$ | 比例变址寻址          |

操作数分为三类：

- 立即数：常量值，AT&T 格式中以 `$` 开头。
- 寄存器：寄存器中的值，用 $R[r_a]$ 表示寄存器 $r_a$ 的内容。
- 存储器：根据有效地址访问内存，用 $M[Addr]$ 表示地址 $Addr$ 处的值。

通用内存引用格式为 $Imm\left(r_b, r_i, s\right)$，有效地址为：

$$
Imm + R[r_b] + R[r_i] \cdot s
$$

其中，$Imm$ 是偏移量，$r_b$ 是基址寄存器，$r_i$ 是变址寄存器，$s$ 是比例因子且只能取 $1$、$2$、$4$ 或 $8$。基址和变址寄存器都必须是 64 位寄存器。

其他形式都是这种通用形式的特殊情况，只是省略了某些部分。

### 数据传送指令

数据传送指令用于把源操作数 $S$ 复制到目的操作数 $D$ 或寄存器 $R$ 中。

#### 普通传送

- `movb S, D`、`movw S, D`、`movl S, D`、`movq S, D`
    - 效果：$D \leftarrow S$
    - 后缀决定传送的数据长度。
- `movabsq I, R`
    - 效果：$R \leftarrow I$
    - 将绝对四字立即数传送到寄存器。

!!! info "movl 的例外"

    `movl` 以寄存器为目的操作数时，会把该寄存器的高 4 字节置为 $0$。

    原因是 x86-64 约定：任何为寄存器生成 32 位值的指令，都会把目的寄存器的高位部分置为 $0$。

#### 扩展传送

扩展传送用于把较小的数据传送到较大的寄存器中，目的操作数只能是寄存器。

**零扩展 movz：**高位补 $0$，常用于无符号数。

- `movzbw S, R`
- `movzbl S, R`
- `movzwl S, R`
- `movzbq S, R`
- `movzwq S, R`

**符号扩展 movs：**高位补符号位，常用于有符号数。

- `movsbw S, R`
- `movsbl S, R`
- `movswl S, R`
- `movsbq S, R`
- `movswq S, R`
- `movslq S, R`
- `cltq`
    - 效果：将 `%eax` 符号扩展到 `%rax`
    - 没有显式操作数，只作用于 `%eax` 和 `%rax`

!!! info "扩展传送限制"

    注意，`movz` 和 `movs` 的源操作数可以来自寄存器或内存，但目的操作数必须是寄存器。

### 压入和弹出栈

x86-64 中，栈向低地址方向增长，`%rsp` 保存栈顶地址。

**压栈 push：**先移动栈顶，再写入数据。

- `pushq S`：`%rsp` 减 $8$，然后把 $S$ 写入新的栈顶位置
- 等价于：

```asm
subq $8, %rsp
movq S, (%rsp)
```

**弹栈 pop：**先读出数据，再移动栈顶。

- `popq D`：把栈顶数据写入 $D$，然后 `%rsp` 加 $8$
- 等价于：

```asm
movq (%rsp), D
addq $8, %rsp
```

### 算术和逻辑操作

算术和逻辑指令会把结果写回目的操作数。

**一元操作：**只有一个操作数，直接更新 $D$。

- `inc D`：$D \leftarrow D + 1$
- `dec D`：$D \leftarrow D - 1$
- `neg D`：$D \leftarrow -D$
- `not D`：$D \leftarrow \sim D$

**二元操作：**第一个操作数是源，第二个操作数既是源也是目的。

- `add S, D`：$D \leftarrow D + S$
- `sub S, D`：$D \leftarrow D - S$
- `imul S, D`：$D \leftarrow D \cdot S$
- `xor S, D`：$D \leftarrow D \oplus S$
- `or S, D`：$D \leftarrow D \lor S$
- `and S, D`：$D \leftarrow D \land S$

!!! info "操作数限制"

    二元操作的源操作数可以是立即数、寄存器或内存，目的操作数可以是寄存器或内存，但两个操作数不能同时是内存。

### 特殊算术操作

特殊算术操作会隐式使用 `%rax` 和 `%rdx`，常用于需要双字长结果的乘法和除法。

**乘法 mul 和 imul**

- `mulq S`：无符号全乘法，计算 $S \cdot \text{\%rax}$
- `imulq S`：有符号全乘法，计算 $S \cdot \text{\%rax}$
- 结果放在 `%rdx:%rax` 中：`%rdx` 保存高 64 位，`%rax` 保存低 64 位

!!! note "imul 的两种用法"

    `imul S, D` 是普通二元乘法，只保留截断后的结果；`imulq S` 是特殊的一元乘法，会产生 128 位结果。

**除法 div 和 idiv**

- `divq S`：无符号除法
- `idivq S`：有符号除法
- 被除数放在 `%rdx:%rax` 中，除数是 $S$
- 结果：`%rax` 保存商，`%rdx` 保存余数

**clto / cqto**

- 作用：把 `%rax` 符号扩展到 `%rdx:%rax`
- 用途：在执行有符号除法 `idivq` 前准备被除数
- 没有显式操作数，只隐式使用 `%rax` 和 `%rdx`

### 移位操作

移位指令的目的操作数 $D$ 可以是寄存器或内存，移位量 $k$ 可以是立即数，也可以放在 `%cl` 中。

- `sal k, D` 或 `shl k, D`：左移，$D \leftarrow D \ll k$
- `sar k, D`：算术右移，用符号位填充高位
- `shr k, D`：逻辑右移，高位补 $0$

### 加载有效地址

`leaq` 的形式类似内存引用，但它只计算有效地址，不会访问内存。

- `leaq S, D`
    - 效果：$D \leftarrow S$ 的有效地址
    - 源操作数 $S$ 是内存地址表达式
    - 目的操作数 $D$ 必须是寄存器

`leaq` 常用于生成地址，也常被编译器用来做简单整数运算。例如：

```asm
leaq 7(%rdx,%rdx,4), %rax
```

上面的指令不会读取内存，而是计算：$\text{\%rax} \leftarrow 5 \cdot \text{\%rdx} + 7$。

## 控制

### 条件码

条件码是一组单个位寄存器，用来记录最近一次算术或逻辑操作的结果属性。

- `CF`：进位标志。加法产生进位，或减法需要借位时置位，用来表示无符号溢出。
- `ZF`：零标志。结果为 $0$ 时置位。
- `SF`：符号标志。结果为负数时置位。
- `OF`：溢出标志。最近一次操作产生有符号溢出时置位。

**指令对条件码的影响**

- `add`、`sub`、`imul` 等算术指令会设置条件码。
- `and`、`or`、`xor` 等逻辑指令会设置 `ZF` 和 `SF`，并把 `CF` 和 `OF` 置为 $0$。
- `cmp S1, S2` 根据 $S2 - S1$ 设置条件码，但不保存结果。
- `test S1, S2` 根据 $S1 \mathbin{\&} S2$ 设置条件码，但不保存结果。

!!! info "条件码更新的例外"

    - `leaq` 只计算有效地址，不会改变条件码。
    - `mov`、`push`、`pop` 等数据传送指令不会改变条件码。
    - `inc` 和 `dec` 会设置 `ZF`、`SF`、`OF`，但不会改变 `CF`。这样可以在多字长加减法中更新某一部分的值，而不破坏前面保存的进位或借位信息。

### 访问条件码

条件码通常不会直接读取，而是通过条件设置、条件跳转或条件传送使用。

**条件设置 set**

`setX D` 根据条件 `X` 是否成立，把目的操作数 $D$ 设置为 $0$ 或 $1$。目的操作数通常是单字节寄存器。

| 指令 | 条件 | 说明 |
| ---- | ---- | ---- |
| `sete` / `setz` | $ZF$ | 相等 / 为零 |
| `setne` / `setnz` | $\lnot ZF$ | 不相等 / 非零 |
| `sets` | $SF$ | 负数 |
| `setns` | $\lnot SF$ | 非负数 |
| `setg` / `setnle` | $\lnot(SF \oplus OF) \land \lnot ZF$ | 有符号大于 |
| `setge` / `setnl` | $\lnot(SF \oplus OF)$ | 有符号大于等于 |
| `setl` / `setnge` | $SF \oplus OF$ | 有符号小于 |
| `setle` / `setng` | $(SF \oplus OF) \lor ZF$ | 有符号小于等于 |
| `seta` / `setnbe` | $\lnot CF \land \lnot ZF$ | 无符号大于 |
| `setae` / `setnb` | $\lnot CF$ | 无符号大于等于 |
| `setb` / `setnae` | $CF$ | 无符号小于 |
| `setbe` / `setna` | $CF \lor ZF$ | 无符号小于等于 |

!!! note "有符号和无符号条件"

    条件码本身不区分数据类型。比较有符号数还是无符号数，取决于后续使用哪一组条件指令。

### 跳转指令

跳转指令通过修改程序计数器改变控制流。

**无条件跳转**

- `jmp Label`：直接跳转到标签
- `jmp *Operand`：跳转到操作数给出的地址

**条件跳转**

条件跳转通常跟在 `cmp` 或 `test` 后，根据条件码决定是否跳转。`jX` 和 `setX` 使用同一套条件后缀，只是 `jX` 的效果是跳转。

- 相等性：`je` / `jz`、`jne` / `jnz`
- 符号：`js`、`jns`
- 有符号比较：`jg` / `jnle`、`jge` / `jnl`、`jl` / `jnge`、`jle` / `jng`
- 无符号比较：`ja` / `jnbe`、`jae` / `jnb`、`jb` / `jnae`、`jbe` / `jna`

```asm
cmpq %rsi, %rdi
jg .L1
```

这段代码按有符号数比较 `%rdi` 和 `%rsi`，若 `%rdi > %rsi` 则跳转到 `.L1`。

### 条件传送指令

条件传送指令根据条件码决定是否把源操作数复制到目的寄存器。

- `cmovX S, R`
    - 条件 `X` 成立时：$R \leftarrow S$
    - 条件 `X` 不成立时：$R$ 保持不变

条件传送常用于编译简单的条件表达式，避免分支预测失败带来的开销。

!!! info "条件传送限制"

    条件传送的源操作数可以是寄存器或内存，目的操作数必须是寄存器。即使条件不成立，处理器也可能已经读取了源操作数，所以源地址必须是安全可访问的。

### 循环

循环通常会被翻译成条件测试和跳转。

**do-while**

`do-while` 先执行循环体，再测试条件。

```c
do {
    Body
} while (Test);
```

```c
loop:
    Body
    if (Test)
        goto loop;
```

**while：jump-to-middle 形式**

这种形式会先跳到测试位置，常见于 `-Og`。

```c
goto test;
loop:
    Body
test:
    if (Test)
        goto loop;
done:
```

**while：do-while 形式**

这种形式先处理初始测试，再把主体改写成 `do-while` 结构，常见于 `-O1`。

```c
if (!Test)
    goto done;
loop:
    Body
    if (Test)
        goto loop;
done:
```

**for**

`for` 循环通常先改写成 `while`，再按 `while` 的方式翻译。

```c
for (Init; Test; Update)
    Body
```

等价于：

```c
Init;
while (Test) {
    Body
    Update;
}
```

### Switch

`switch` 会根据 case 的数量和取值范围选择不同翻译方式。

- case 较少或取值稀疏时，通常翻译成一串条件分支。
- case 较多且取值密集时，通常使用跳转表。

跳转表是一个地址数组，下标由 `switch` 表达式计算得到。

```c
switch (x) {
    case 0: goto loc_A;
    case 1: goto loc_B;
    case 2: goto loc_C;
    default: goto loc_def;
}
```

对应的控制流可以理解为：

```c
if ((unsigned) x > 2)
    goto loc_def;
goto *jump_table[x];
```
