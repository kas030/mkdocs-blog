---
tags:
  - C
  - C++
---

# C / C++ static 与 inline

## 基础概念

### 存储期

存储期决定一个对象的存储空间建立、结束的时间，常见的存储期包括：

| 存储期     | 典型对象                | 特点                           |
| ---------- | ----------------------- | ------------------------------ |
| 自动存储期 | 普通局部变量            | 通常随所在块的执行建立和结束   |
| 静态存储期 | 全局变量、静态局部变量  | 存储空间在整个程序运行期间存在 |
| 线程存储期 | C++11 thread_local 变量 | 每个线程拥有自己的对象         |
| 动态存储期 | C++ new 分配的对象      | 由动态分配与释放控制           |

注意，静态存储期描述的是对象存储空间的存在时间，并不意味着对象一定在程序启动时完成动态初始化。

### 翻译单元与 ODR

一个 `.cpp` 文件经过预处理，展开它包含的头文件后，得到的内容就是一个翻译单元。

C++ {{abbr:单一定义规则|One Definition Rule, ODR}}：

- 一个翻译单元内，同一实体最多只能有一个定义。
- 整个程序中，被 ODR-use 的非 inline 函数或变量，必须有且仅有一个定义。
- 对于满足条件的类、模板、内联函数以及 C++17 起的内联变量等实体，允许不同翻译单元存在多个定义，但必须满足对应的 ODR 要求。

ODR-use 的非正式定义（cppreference）：

> 如果对象的的值被读取（除非它是编译时常量）或写入，其地址被获取，或一个引用绑定到它，则该对象被 ODR-use。
> 
> 如果引用被使用且其指向的实体在编译时未知，则该引用被 ODR-use。
> 
> 如果函数被调用或其地址被获取，则该函数被 ODR-use。


## static：存储期、链接属性与成员归属

`static` 的含义主要取决于声明位置。

### 块作用域：静态局部变量

块作用域的 `static` 变量具有静态存储期，但依然为块作用域，也没有链接属性。

```cpp
int counter() {
    static int count = 0;
    return ++count;
}
```

!!! note "静态局部变量的初始化时机"
    
    C++ 中，静态局部变量的初始化分为不同情况。
    
    **静态初始化**（零初始化或常量初始化）可以在首次进入声明之前完成：
    
    ```cpp
    void f() {
        static int x = 42;
    }
    ```

    **动态初始化**通常在控制流第一次经过声明时发生：
    
    ```cpp
    int initialize();

    void f() {
        static int x = initialize();
    }
    ```

    如果初始化抛出异常，则初始化没有完成，下次控制流经过声明时会重新尝试。

!!! info "C 与 C++ 的初始化差异"

    C 中具有静态存储期的对象通常要求使用符合规定的常量初始化表达式，因此不能照搬 C++ 中任意的动态初始化写法。

### 文件 / 命名空间作用域：内部链接

#### 静态变量

```cpp title="config.cpp"
static int buffer_size = 1024;
```

`buffer_size` 具有命名空间作用域，具有静态存储期，`static` 使其链接属性为内部链接。

#### 静态函数

```cpp title="utils.cpp"
static int helper(int x) {
    return x * 2;
}
```

`helper` 为内部链接，其他翻译单元无法通过普通的外部链接声明引用这个函数实体。

需要注意，对于内部链接的函数，外部代码仍然可能通过函数指针调用它。

!!! tip "文件作用域 static 与匿名命名空间"

    C++ 支持匿名命名空间：
    
    ```cpp
    namespace {

    int value = 10;

    int helper(int x) {
        return x * 2;
    }

    }
    ```

    匿名命名空间可以用于组织当前翻译单元内部的实现细节。

    相较于文件作用域 `static`，它还可以容纳类、别名、模板等多种声明，因此在现代 C++ 实现文件中通常更推荐匿名命名空间。

    但二者并非完全等价，特别是在涉及实体类型、模板和匿名命名空间中特殊链接规则时。

### 类作用域：静态成员（C++）

类中的 `static` 表示成员属于类而不属于实例。

#### 静态数据成员

```cpp
struct Counter {
    static int count;
};

int Counter::count = 0;
```

多个 `Counter` 对象共享同一个静态数据成员。

#### 静态成员函数

```cpp
struct Counter {
    static int count;

    static void increment() {
        ++count;
    }
};
```

静态成员函数的限制：

- 没有隐式 `this` 指针
- 不能直接访问需要具体对象的非静态数据成员
- 不能声明为虚函数

### 其他特殊用法：C99 数组形参中的 static

C99 引入了数组形参中的 `static`：

```c
void process(int arr[static 10]);
```

它表示调用者必须保证传入的指针能够访问至少 10 个 `int` 元素。

不满足要求时，行为未定义。

## inline：内联函数与多定义规则

### inline 与内联展开

{{abbr:内联展开|Inlining}} 是编译器优化技术，通常指用函数体的等效代码替代函数调用。

需要注意，`inline` 是对编译器的内联优化建议，而非强制要求。编译器可以忽略该建议，也可以内联未声明为 `inline` 的函数。标准 C/C++ 不提供保证函数内联展开的机制。

现代 C++ 中，`inline` 的主要意义是规定满足条件的函数或变量如何在多个翻译单元中定义。

### C++ 内联函数

#### 多翻译单元定义

对于具有外部链接的内联函数：

- 可以在不同翻译单元中出现多个定义
- 各定义必须满足 ODR 的一致性要求
- 每个声明该函数的相关翻译单元都必须满足 inline 声明要求
- 使用它的翻译单元必须能够获得对应的定义
- 不同翻译单元引用的是同一个函数实体，函数地址相同

```cpp title="math.hpp"
#pragma once

inline int add(int a, int b) {
    return a + b;
}
```

多个 `.cpp` 文件包含该头文件，不会仅仅因为存在多份相同的 `add` 定义而违反 ODR。

#### 相同函数地址

假设：

```cpp title="a.cpp"
#include "math.hpp"

auto get_a() {
    return &add;
}
```

```cpp title="b.cpp"
#include "math.hpp"

auto get_b() {
    return &add;
}
```

在满足 ODR 条件的情况下，`get_a() == get_b()` 为真，因为两个翻译单元引用的是同一个具有外部链接的内联函数实体。

#### 静态局部变量共享

```cpp title="counter.hpp"
inline int next() {
    static int count = 0;
    return ++count;
}
```

无论多少个翻译单元包含该头文件，它们都共享同一个 `count`。这里的共享性来自具有外部链接的内联函数的实体语义，而不仅仅来自 `count` 的静态存储期。

### 类内定义的成员函数隐式 inline

```cpp
class Calculator {
public:
    int add(int a, int b) {
        return a + b;
    }
};
```

在通常的非模块场景中，类内定义的成员函数（包括静态成员函数）隐含 `inline` 属性。

类外定义的成员函数不会自动隐含 `inline`。如果该定义放在被多个翻译单元包含的头文件中，需要显示添加 `inline`：

```cpp
inline int Calculator::add(int a, int b) {
    return a + b;
}
```

!!! info "C++20 具名模块的例外"

    C++20 起，如果类内定义的函数附属于具名模块，则不会自动隐含 `inline` 属性。

    对于传统的头文件加源文件的编程方式，这条隐式内联规则仍然成立。

### C++17 内联变量

C++17 将 `inline` 扩展到了变量。

传统的头文件中不能直接定义普通外部链接变量，因为多个翻译单元包含时可能违反 ODR。

传统解决方案：

```cpp title="config.hpp"
extern int count;
```

```cpp title="config.cpp"
int count = 0;
```

C++17 起可以直接使用：

```cpp title="config.hpp"
inline int count = 0;
```

只要满足相应的 ODR 条件，不同翻译单元中的定义共同表示同一个内联变量实体。不同翻译单元共享状态，获取变量地址的结果相同。

## static inline

### 文件作用域的 static inline 函数

```cpp title="helper.hpp"
static inline int square(int x) {
    return x * x;
}
```

这里两个关键字分别发挥作用：

- `static`：使函数具有内部链接。
- `inline`：使函数具有内联属性，并可能作为编译器优化提示。

每个包含该头文件的翻译单元，都拥有独立的函数实体。

### C++17 类内 inline static 数据成员 {#cpp17-inline-static}

C++17 允许在类定义中直接定义内联静态数据成员：

```cpp
class Counter {
public:
    inline static int count = 0;
};
```

其中：

- `static`：表示 `count` 是类的静态数据成员
- `inline`：允许在类定义中直接定义，并支持符合 ODR 条件的跨翻译单元多定义

另外，关键字顺序可以交换：

```cpp
static inline int count = 0;
inline static int count = 0;
```

在适用的声明上下文中二者语义相同。

## static、inline 与 const 系列关键字

### 类内 static const 数据成员

在 C++17 之前，某些 `static const` 数据成员虽然能够在类内初始化，但发生 ODR-use 时仍需要类外定义。

```cpp
struct Config {
    static const int N = 10;
};

int a[Config::N];    // 通常不需要类外定义
auto p = &Config::N; // 需要类外定义
```

从 C++17 开始，可以直接在类内定义内联静态数据成员，详见 [C++17 类内 inline static 数据成员](#cpp17-inline-static)。

### 类内 static constexpr 数据成员

在 C++11 / C++14 中，与类内 `static const` 数据成员一样，`static constexpr` 数据成员被 ODR-use 时通常需要在类外定义。

C++17 及以后，`static constexpr` 数据成员隐含 `inline`，类内声明同时构成定义，不再需要额外的类外定义。

### constexpr 和 consteval 函数

C++11 起，`constexpr` 函数隐含 `inline`，且具有外部链接：

```cpp
constexpr int square(int x) {
    return x * x;
}
```

C++20 引入的 `consteval` 函数同样隐含 `inline`，但它具有更严格的立即函数调用及常量求值要求。

### 命名空间作用域的 const

C++ 中，命名空间作用域的非 `extern`、非 `inline` 的 `const` 变量通常默认具有内部链接。因此，如果放在头文件中，不同翻译单元通常会拥有各自独立的对象。

C 语言则不同，文件作用域的 `const` 不会自动赋予内部链接。

### 命名空间作用域的 constexpr

普通 `constexpr` 变量不隐含 `inline`。因隐含顶层 `const`，其具有内部链接。

如果需要跨翻译单元共享一个常量实体，可以用 `inline constexpr`，具有外部链接。

### constinit 变量

C++20 的 `constinit` 用于要求变量具有静态初始化，即零初始化和常量初始化，用于解决具有静态存储期变量的初始化顺序问题。

`constinit` 不隐含 inline，也不意味着变量是常量。

## C99 inline

C99 正式引入 `inline`，其含义不仅是建议编译器内联展开，还涉及函数定义的链接与生成规则。

对于文件作用域的函数，常见形式如下：

=== "`static inline`"
    
    ```c
    static inline int square(int x) {
        return x * x;
    }
    ```
    
    - 函数具有内部链接，不同翻译单元中的同名函数是不同实体。
    - 适合直接定义在头文件中，多个翻译单元包含该头文件不会造成外部符号的重复定义。

=== "`inline`"
    
    ```c
    inline int square(int x) {
        return x * x;
    }
    ```
    
    函数具有外部链接，但此处只提供一个内联定义，不提供外部定义。
    
    因此，如果函数被使用，整个程序中仍然需要恰好一个外部定义，否则在无法完成内联展开时可能出现链接错误。

=== "`extern inline`"
    
    ```c
    extern inline int square(int x) {
        return x * x;
    }
    ```
    
    在 C99 中，这种形式通常提供一个外部定义，可以生成供其他翻译单元调用的函数实体。
    
    需要注意，是否属于内联定义，需要综合当前翻译单元中的所有文件作用域声明判断，而不能只看函数定义本身。
    
    典型用法为：在头文件中提供内联定义，并在一个翻译单元中提供外部定义。
    
    ```c title="math_utils.h"
    #ifndef MATH_UTILS_H
    #define MATH_UTILS_H

    inline int square(int x) {
        return x * x;
    }

    #endif
    ```
    
    ```c title="math_utils.c"
    #include "math_utils.h"

    extern int square(int);
    ```

    其他源文件直接包含 `math_utils.h` 即可。
    
    这里的 `extern` 声明会使 `math_utils.c` 中的定义成为外部定义，而其他翻译单元仍然只有内联定义。这种机制避免了多个翻译单元同时生成同一个外部函数定义的问题。

## GNU89 inline 扩展

C89（C90）标准不支持 `inline` 关键字，GCC 在 C89 基础上提供了自己的 `inline` 扩展。

`static inline` 在 C99 和 GNU89 中具有一致的核心语义，也是编写头文件内联函数时最稳妥的选择。

但 GNU89 中的 `inline` 和 `extern inline`，在是否提供外部定义方面与 C99 相反：

| 定义形式        | C99            | GNU89          |
| --------------- | -------------- | -------------- |
| `inline`        | 不提供外部定义 | 提供外部定义   |
| `extern inline` | 提供外部定义   | 不提供外部定义 |

GNU89 下的 `extern inline` 通常用于在头文件中提供仅用于内联优化的函数实现，而在某个源文件中另外提供普通函数定义。

## 标准版本演进

**C 语言**

| 标准    | 重要变化                                                 |
| ------- | -------------------------------------------------------- |
| C89/C90 | 支持 `static`，尚无标准 `inline`                         |
| C99     | 引入 `inline`，支持数组形参中的 `static`                 |
| C11     | 引入 `_Thread_local`，基本保留 C99 的 `inline` 规则      |
| C17     | 基本延续相关规则                                         |
| C23     | 引入 `constexpr` 等特性，基本保留 C99 风格的内联函数机制 |

**C++ 语言**

| 标准  | 重要变化                                                             |
| ----- | -------------------------------------------------------------------- |
| C++98 | 支持内联函数、类静态数据成员                                         |
| C++11 | 引入 `constexpr`、`thread_local`，规定线程安全的局部静态初始化       |
| C++14 | 放宽 `constexpr` 函数限制，引入变量模板                              |
| C++17 | 引入内联变量，`static constexpr` 数据成员隐含 `inline`               |
| C++20 | 引入模块、`consteval`、`constinit`，部分隐式内联规则存在模块相关例外 |
| C++23 | 继续扩展常量求值能力，沿用 C++17 的主要内联变量机制                  |

## 工程实践

哪些函数适合定义在头文件中：

- 普通外部链接函数：采用头文件中声明、源文件中定义的形式，这种方式适合普通库函数，可以减少头文件中的实现依赖。
- C++ 头文件中的非模板 `inline` 函数：当确实希望把函数定义放在头文件中时，可以使用 `inline`。
- 函数模板：通常直接定义在头文件中，不需要为了跨翻译单元实例化而添加 `inline`。

头文件共享变量：

- C++17 之前：采用头文件中 `extern` 声明、源文件中定义的形式。
- C++17 及以后：使用 `inline` 直接在头文件中定义。

类静态常量的推荐写法（C++17）：

```cpp
class Config {
public:
    static constexpr int BufferSize = 4096;
};
```

需要动态初始化的非编译期常量对象（C++17）：

```cpp
#include <string>

class Config {
public:
    inline static const std::string Name = "Example";
};
```

可修改的共享成员（C++17）：

```cpp
class Counter {
public:
    inline static int count = 0;
};
```
