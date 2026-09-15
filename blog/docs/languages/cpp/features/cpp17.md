# C++17 新特性

C++17 引入了大量能直接简化日常代码的语法，标准库也增加了多个通用工具类型。

## 结构化绑定

```cpp
std::map<std::string, int> scores{{"Alice", 90}, {"Bob", 85}};

for (const auto& [name, score] : scores) {
    std::cout << name << ": " << score << '\n';
}
```

结构化绑定可解构数组、聚合类型以及类似 `std::tuple` 的类型。是否写 `&` 会决定绑定到原对象还是副本。

!!! note "绑定与隐藏对象"

    `auto [x, y] = expression;` 会先创建一个隐藏对象，再让 `x` 和 `y` 绑定其子对象。
    
    `const auto& [x, y]` 能延长顶层临时对象的生命周期，`auto [x, y]` 则会创建副本。

## if 和 switch 初始化语句

```cpp
if (auto iter = scores.find("Alice"); iter != scores.end()) {
    std::cout << iter->second << '\n';
}

switch (int code = read_code(); code) {
case 0:
    break;
default:
    report(code);
}
```

初始化的变量作用域仅限于对应的 `if` / `else` 或 `switch`。

注意，`if` 中创建的对象在 `else` 分支中也仍存活，直到整个 `if` 语句结束才销毁。

## if constexpr

`if constexpr` 根据编译期条件丢弃不适用的分支：

```cpp
template <class T>
void print_value(const T& value) {
    if constexpr (std::is_pointer_v<T>) {
        std::cout << *value;
    } else {
        std::cout << value;
    }
}
```

它可替代许多 SFINAE 辅助函数，但条件仍必须能在编译期求值。

注意，丢弃分支仍必须通过基本语法检查。在模板中，依赖于模板形参的非法代码可以因分支被丢弃而不实例化，与模板形参无关、始终非法的代码仍可能立即报错。

## 折叠表达式

折叠表达式用一个二元运算符，把参数包中的元素连接成一个表达式。它常用于可变参数模板，可以省去逐个取出参数、递归处理剩余参数的写法。

### 从参数包到表达式

```cpp
template <class... Args>
auto sum(Args... args) {
    return (args + ...);
}
```

这里三处 `...` 的含义为：

- `class... Args` 声明类型参数包，可以接收任意多个类型。
- `Args... args` 声明函数参数包，每个参数的类型对应 `Args` 中的一个类型。
- `(args + ...)` 对参数包进行折叠，用 `+` 连接各个参数。

### 四种形式与展开方向

下面用 `pack` 表示包含未展开参数包的表达式，假设它依次生成 `a`、`b`、`c`。`init` 是不含未展开参数包的初始表达式，`op` 是折叠使用的运算符。

| 形式                    | 名称       | 三个元素时的展开结果        |
| ----------------------- | ---------- | --------------------------- |
| `(... op pack)`         | 一元左折叠 | `((a op b) op c)`           |
| `(pack op ...)`         | 一元右折叠 | `(a op (b op c))`           |
| `(init op ... op pack)` | 二元左折叠 | `(((init op a) op b) op c)` |
| `(pack op ... op init)` | 二元右折叠 | `(a op (b op (c op init)))` |

「一元」和「二元」指是否带有额外的初始表达式，折叠使用的 `op` 始终是二元运算符。

!!! info "结合方式不等于求值顺序"

    左折叠并不统一保证各个操作数从左到右求值，右折叠也不表示从右到左执行。求值顺序仍由具体运算符决定。需要依次执行操作时，可以使用内建逗号运算符。

???+ example "逗号折叠"

    折叠的对象可以是包含参数包的整个表达式，并不限于参数名本身：

    ```cpp
    #include <iostream>

    template <class... Args>
    void print_all(const Args&... args) {
        (static_cast<void>(std::cout << args << ' '), ...);
    }
    ```

    这里折叠的运算符是逗号，展开模式是 `static_cast<void>(std::cout << args << ' ')`。

    内建逗号运算符先求值左侧，再求值右侧，所以即使这里使用右折叠，输出仍按参数顺序进行。转换为 `void` 可以确保使用内建逗号运算符，避免表达式返回的类类型引入重载逗号运算符。

    如果只需要连续输出、不加分隔符，也可以直接用二元左折叠 `(std::cout << ... << args)`，展开为 `((std::cout << a) << b) << c`。

???+ example "逻辑折叠"

    对于普通数值类型，`args > 0` 产生 `bool`，折叠使用内建逻辑运算符，保留短路行为。
    
    ```cpp
    template <class... Args>
    constexpr bool all_positive(Args... args) {
        return ((args > 0) && ...);
    }

    template <class... Args>
    constexpr bool any_positive(Args... args) {
        return ((args > 0) || ...);
    }

    static_assert(all_positive(1, 2, 3));
    static_assert(any_positive(-1, 0, 3));
    static_assert(all_positive());
    static_assert(!any_positive());
    ```

### 初始值与空参数包

一元折叠只有下面三种运算符允许空包：

| 运算符 | 空包结果                     |
| ------ | ---------------------------- |
| `&&`   | `true`                       |
| `||`   | `false`                      |
| `,`    | `void()`，即不产生值的空操作 |

带初始值的二元折叠可以接收空参数包：

```cpp
template <class... Args>
constexpr auto sum_or_zero(Args... args) {
    return (0 + ... + args);
}

static_assert(sum_or_zero() == 0);
```

二元折叠的参数包为空时，结果就是 `init`。

初始值也是一个真正参与运算的操作数，会影响类型转换和运算符重载选择。

!!! tip "语法注意点"

    - 最外层圆括号不能省略。`return (args + ...);` 合法，`return args + ...;` 不合法。
    - 二元折叠两侧必须使用相同运算符。`(0 + ... + args)` 合法，`(0 + ... - args)` 不合法。
    - 二元折叠只能有一侧包含未展开参数包。`(args + ... + args)` 不合法。
    - 复杂操作数需要额外括号。折叠两端在语法上要求是 cast-expression；当顶层包含优先级低于类型转换的运算符时，应先把它括起来。例如求平方和写成 `(0 + ... + (args * args))`，不能写成 `(0 + ... + args * args)`。

## 类模板实参推导（CTAD）

```cpp
std::pair point{1, 2.5};     // std::pair<int, double>
std::vector values{1, 2, 3}; // std::vector<int>
```

编译器可以根据构造函数实参推导类模板实参。对自定义类型，必要时可以编写推导指引：

```cpp
template <class Iter>
Range(Iter, Iter) -> Range<typename std::iterator_traits<Iter>::value_type>;
```

!!! info "CTAD 与函数模板实参推导的区别"

    CTAD 只在从初始化器构造类模板对象时工作，不会从赋值目标或函数返回类型倒推模板实参。列表初始化还可能优先命中 `initializer_list` 推导候选。

## inline 变量

```cpp
class Settings {
public:
    inline static const std::string name = "app";
};
```

`inline` 变量可定义在头文件中，同一实体的多个定义不会违反单一定义规则。

!!! note "inline 不保证内联优化"

    这里的核心语义是允许多个翻译单元出现等价定义，程序中仍表示同一实体。它与编译器是否把访问点展开成内联代码无必然关系。

## 保证的拷贝消除

```cpp
Widget make_widget() {
    return Widget{};
}

Widget widget = make_widget();
```

对某些纯右值场景，C++17 规定直接在目标位置构造对象，不再要求类型具有可访问的拷贝或移动构造函数。这不等于所有命名返回值优化都被强制执行。

!!! note "强制消除与 NRVO"

    `return Widget{};` 返回与函数返回类型相同的纯右值，直接在结果对象中构造。`Widget value; return value;` 是 NRVO，仍是可选优化，未执行时通常尝试隐式移动。

## 其他语言特性

- `namespace a::b {}` 嵌套命名空间简写
- `[[nodiscard]]`、`[[maybe_unused]]`、`[[fallthrough]]` 标准属性
- `constexpr` Lambda
- Lambda 中使用 `[*this]` 按值捕获当前对象
- 十六进制浮点字面量

## optional、variant 和 any

`std::optional<T>` 表示可能没有值：

```cpp
std::optional<int> find_score(std::string_view name);

if (auto score = find_score("Alice")) {
    std::cout << *score;
}
```

`std::variant<Ts...>` 是类型安全的标签联合：

```cpp
using Result = std::variant<int, std::string>;

Result result = "error";
std::visit([](const auto& value) { std::cout << value; }, result);
```

`std::any` 可存储任意可拷贝类型，读取时需要 `std::any_cast`。如果可能的类型集合已知，优先使用 `variant`。

!!! info "optional 不是指针"

    `optional<T>` 直接包含 `T` 对象，不进行堆分配。C++17 不允许 `optional<T&>`，如果需要可空引用语义，可使用指针或 `optional<reference_wrapper<T>>`。`value()` 在空状态下抛出 `bad_optional_access`，`operator*` 则要求调用者先确认有值。

!!! info "variant 可能 valueless_by_exception"

    `variant` 通常总是持有某个备选值，但在切换备选类型时，如果构造或移动抛出异常，它可能进入 `valueless_by_exception()` 状态。访问前可用 `holds_alternative<T>` 或 `index()` 检查。当备选列表中同一类型出现多次时，必须按下标访问。

!!! note "any_cast 要求精确类型"

    `std::any_cast<double>` 不会把内部的 `int` 转换为 `double`。值形式类型不匹配时抛出 `bad_any_cast`，指针形式 `std::any_cast<T>(&object)` 则返回空指针。

## string_view

`std::string_view` 是不拥有字符数据的连续视图：

```cpp
bool starts_with_http(std::string_view text) {
    return text.substr(0, 4) == "http";
}
```

`string_view` 不会延长底层字符串的生命周期，不要让它指向已销毁的临时 `std::string`，也不要在底层字符串可能重新分配后继续使用旧视图。

## 文件系统库

```cpp
#include <filesystem>

namespace fs = std::filesystem;

for (const auto& entry : fs::directory_iterator{"."}) {
    std::cout << entry.path() << '\n';
}
```

!!! tip "filesystem 有异常与 error_code 两套接口"

    很多 `filesystem` 操作同时提供抛出 `filesystem_error` 的重载和填充 `std::error_code&` 的非抛出重载。批量扫描目录、错误属于正常分支时，后者通常更容易局部处理。

## 其他库特性

- `std::byte`：表示原始字节
- `std::from_chars` / `std::to_chars`：不依赖 locale、不分配内存的数字转换
- `std::apply`：将 tuple 展开为函数实参
- `std::invoke`：统一调用普通可调用对象和成员指针
- `std::gcd` / `std::lcm`
- `std::clamp`
- `std::shared_mutex` 与 `std::scoped_lock`
- 标准算法的并行执行策略
