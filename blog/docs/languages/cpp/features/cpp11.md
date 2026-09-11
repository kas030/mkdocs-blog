# C++11 新特性

C++11 奠定了现代 C++ 的基础：类型推导、移动语义、Lambda、智能指针和并发库都在这一版中引入。

## auto 和 decltype

`auto` 使编译器根据初始化表达式推导变量类型：

```cpp
auto count = 42;              // int
auto price = 3.14;            // double
auto iter = values.begin();   // 迭代器类型
```

`auto` 一般会丢弃顶层 `const` 和引用，需要保留时要显式写出：

```cpp
const int value = 10;
auto a = value;         // int
const auto b = value;   // const int
const auto& c = value;  // const int&
```

`auto` 的推导大致沿用函数模板形参推导规则，声明形式会影响结果：

```cpp
const int cx = 1;
const int& rx = cx;

auto a = rx;         // int：丢弃引用和顶层 const
auto& b = rx;        // const int&
auto&& c = rx;       // const int&：引用折叠
auto&& d = 42;       // int&&
const auto* p = &cx; // const int*
```

!!! info "顶层 const 与底层 const"

    `const int` 的 `const` 修饰对象本身，是顶层 `const`；`const int*` 中的 `const` 修饰指针指向的对象，是底层 `const`。

    按值推导 `auto` 会丢弃顶层 `const`，保留底层 `const`。

数组和函数在按值推导时会退化为指针，引用声明则保留原类型：

```cpp
int array[3]{};
int function(double);

auto x = array;      // int*
auto& y = array;     // int (&)[3]
auto f = function;   // int (*)(double)
auto& g = function;  // int (&)(double)
```

!!! warning "auto 与花括号"

    C++11 中 `auto values = {1, 2, 3};` 推导为 `std::initializer_list<int>`，但元素必须能推导为同一类型。
    `auto bad = {1, 2.0};` 因元素类型不一致而错误。`auto empty = {};` 也无法推导元素类型。

`decltype(expr)` 获取表达式的类型，不对表达式求值：

```cpp
int x = 0;
decltype(x) y = 1;     // int
decltype((x)) ref = x; // int&，因为 (x) 是左值表达式
```

`decltype` 的完整判定规则如下：

1. 如果表达式是未加括号的标识符表达式或成员访问，结果是该实体声明时的类型。
2. 否则，按值类别判断：
    1. 表达式是将亡值（xvalue）时，结果是 `T&&`。
    2. 表达式是左值（lvalue）时，结果是 `T&`。
    3. 表达式是纯右值（prvalue），结果是 `T`。

```cpp
struct Record {
    double value;
};

Record record{};

decltype(record.value) a = 1.0;            // double：未加括号，特殊规则
decltype((record.value)) b = a;            // double&：左值
decltype(std::move(record.value)) c = 1.0; // double&&：将亡值
decltype(Record{}.value) d = 1.0;          // double：未加括号的成员访问
decltype((Record{}.value)) e = 1.0;        // double&&：将亡值
decltype(1.0) f = 1.0;                     // double：纯右值
```

!!! tip "decltype 与返回类型"

    `decltype(f())` 不会调用 `f`，可用于依赖表达式的返回类型。C++11 中常与尾置返回类型配合：

    ```cpp
    template <class T, class U>
    auto add(T&& left, U&& right)
        -> decltype(std::forward<T>(left) + std::forward<U>(right)) {
        return std::forward<T>(left) + std::forward<U>(right);
    }
    ```

## 统一初始化

C++11 将花括号初始化扩展到内置类型、聚合、容器和普通类对象。

这种语法常被称为统一初始化，但不同类型有不同的初始化规则。同样的 `{...}` 可能表示聚合初始化、调用构造函数、构造 `std::initializer_list` 或对标量执行列表初始化，必须结合目标类型和上下文判断具体行为。

### 基本形式

花括号列表可以用在变量定义、函数实参、`return` 语句、`new` 表达式和成员初始化等位置：

```cpp
int x{42};
std::vector<int> numbers{1, 2, 3};
std::pair<int, std::string> item{1, "apple"};
```

### {{abbr:聚合初始化|aggregate initialization}}

聚合是一类可以直接按元素顺序初始化的复合类型。数组是聚合。类类型必须满足当前语言标准对聚合类的限制。

在 C++11 中，聚合类需要满足：

- 没有用户提供的构造函数
- 非静态数据成员没有类内初始值
- 没有 `private` 或 `protected` 的非静态数据成员
- 没有基类
- 没有虚函数

```cpp
struct Point {
    int x;
    int y;
};

Point origin{0, 0};
Point point{3, 4};
```

聚合初始化按数组下标或非静态数据成员的声明顺序进行，不会根据初始值的名称或类型重新排列：

```cpp
struct User {
    int id;
    std::string name;
};

User user{1, "Alice"}; // 先初始化 id，再初始化 name
```

聚合可以嵌套，内层花括号能明确表示每个子对象：

```cpp
struct Line {
    Point begin;
    Point end;
};

Line line{{0, 0}, {3, 4}};
int matrix[2][2]{{1, 2}, {3, 4}};
```

!!! warning "初始值数量与成员顺序"

    初始值多于聚合元素时程序非法。初始值少于聚合元素时，剩余元素从空列表初始化。因此，聚合的接口依赖成员声明顺序，调整成员顺序可能静默改变旧初始化代码的含义。

!!! info "用户提供与用户声明的构造函数"

    C++11 的规则是「没有用户提供的构造函数」，不是「没有用户声明的构造函数」。在首次声明处写 `Aggregate() = default` 的构造函数不是用户提供的，因而这不会破坏 C++11 的聚合资格。

    C++20 将这项改为了更严格的「没有用户声明或继承的构造函数」。

!!! info "聚合的定义随标准的变化"

    C++14 允许聚合具有类内成员初始值，C++17 在满足限制时允许聚合包含基类，C++20 又收紧了构造函数条件。C++17 起可使用 `std::is_aggregate_v<T>` 检查某个具体类型在当前语言模式下是否为聚合。

### 空花括号

空花括号通常表示值初始化：

```cpp
int number{};       // 0
double ratio{};     // 0.0
int* pointer{};     // nullptr
int values[3]{};    // 所有元素为 0
std::string text{}; // 调用默认构造函数，得到空字符串
```

在 C++11 中对聚合使用空花括号时，每个成员都从空列表初始化：

```cpp
struct Options {
    int retries;
    bool verbose;
};

Options options{}; // retries == 0，verbose == false
```

C++14 起，聚合可以具有类内成员初始值。此时未显式提供的成员优先使用该初始值，否则才从空列表初始化。

!!! warning "空花括号不总是选择 initializer_list 构造"

    对非聚合类，若列表为空且类存在默认构造函数，会先选择默认构造函数，非空列表才会优先尝试 `initializer_list` 构造函数。

    ```cpp
    struct Example {
        Example();
        Example(std::initializer_list<int>);
    };

    Example a{};  // Example()
    Example b{1}; // Example(initializer_list<int>)
    ```

### 直接列表初始化与拷贝列表初始化

`T{...}` 是直接列表初始化，`T x = {...}` 是拷贝列表初始化。后者如果最终选中 `explicit` 构造函数，程序非法：

```cpp
struct Id {
    explicit Id(int);
};

Id first{1};     // 正确
Id second = {1}; // 错误：拷贝列表初始化不能使用 explicit 构造函数
```

### 窄化转换

花括号会禁止可能丢失信息的窄化转换：

```cpp
int a = 3.14; // 允许，但丢失小数部分
int b{3.14};  // 编译错误
```

### initializer_list

`std::initializer_list` 允许自定义类接收列表初始化：

```cpp
class Numbers {
public:
    Numbers(std::initializer_list<int> values) : data(values) {}

private:
    std::vector<int> data;
};

Numbers numbers{1, 2, 3};
```

!!! warning "initializer_list 的优先级"

    如果类同时存在 `std::initializer_list` 构造函数和其他构造函数，花括号初始化会尽量选择前者。例如 `std::vector<int>{10, 20}` 创建两个元素，`std::vector<int>(10, 20)` 则创建十个值为 `20` 的元素。

!!! danger "initializer_list 的元素是 const"

    `std::initializer_list<T>` 背后的临时数组元素具有 `const T` 属性，因此不能从列表中移动只移动类型。
    `std::vector<std::unique_ptr<int>>{...}` 在许多直观写法下无法编译，可改为先创建容器，再逐个 `emplace_back`。

## 范围 for 循环

```cpp
for (const auto& value : values) {
    std::cout << value << '\n';
}

for (auto& value : values) {
    value *= 2;
}
```

只读遍历复杂对象时，通常使用 `const auto&`，避免不必要的拷贝。

!!! note "循环变量的类型"

    - `auto value`：拷贝元素，适合廉价小对象或需要副本的情况。
    - `auto& value`：修改原元素，不能绑定临时元素。
    - `const auto& value`：只读引用，可绑定普通元素和临时元素。
    - `auto&& value`：保留迭代器解引用结果的值类别，泛型代码中最灵活。

!!! danger "临时范围中的悬空引用"

    范围 `for` 会延长顶层临时范围的生命周期，但 C++23 之前不会普遍延长该表达式内部其他临时对象的生命周期。
    `for (auto x : make_owner().items())` 如果 `items()` 返回对所有者内部数据的引用，循环就可能访问已销毁对象。应先把所有者保存到局部变量。

## nullptr

`nullptr` 是专用的空指针字面量，避免 `0` 或 `NULL` 在重载解析中被当作整数：

```cpp
void process(int);
void process(const char*);

process(nullptr); // 调用指针版本
```

`nullptr` 的类型是 `std::nullptr_t`，可转换为任意对象指针或成员指针，但不会像 `0` 一样参与整数重载。

!!! warning "多个指针重载仍可能歧义"

    如果同时存在 `f(int*)` 和 `f(double*)`，`f(nullptr)` 仍然无法确定选哪一个。需要显式转换为目标指针类型。

## Lambda 表达式

```cpp
int offset = 10;
auto add = [offset](int value) -> int {
    return value + offset;
};
```

常用捕获方式：

| 写法 | 含义 |
| --- | --- |
| `[]` | 不捕获 |
| `[x]` | 按值捕获 `x` |
| `[&x]` | 按引用捕获 `x` |
| `[=]` | 默认按值捕获 |
| `[&]` | 默认按引用捕获 |
| `[this]` | 捕获当前对象指针 |

按值捕获的变量默认不能在 Lambda 体内修改，可以使用 `mutable`：

```cpp
int count = 0;
auto counter = [count]() mutable {
    return ++count;
};
```

Lambda 对象的每个实例都有自己的按值捕获成员，`mutable` 只使这些副本可修改，不会修改外部变量。

!!! danger "引用捕获与 this 捕获的生命周期"

    `[&]` 不会延长局部变量的生命周期。如果 Lambda 离开当前作用域后才执行，引用捕获可能悬空。
    C++11 的 `[this]` 只拷贝指针，不拷贝对象，对象销毁后调用该 Lambda 同样危险。

!!! note "Lambda 转换为函数指针"

    不捕获的 Lambda 可隐式转换为具有相同参数和返回类型的函数指针，有捕获的 Lambda 不可以。

    ```cpp
    int (*operation)(int) = [](int x) { return x * 2; };
    ```

## 移动语义和转发引用

移动语义解决：临时对象或不再需要的对象如何转移资源，完美转发解决：函数模板如何保留实参原本的类型和值类别，两者都与右值引用相关。

### 右值引用与移动语义

右值通常表示临时值或即将被移动的对象。`T&&` 可以绑定到右值，使重载函数有机会复用其资源：

```cpp
void consume(const std::string& text); // 可接收左值，不取走资源
void consume(std::string&& text);      // 接收右值，可移动资源

std::string name = "Alice";
consume(name);               // 左值，选择 const std::string&
consume(std::string{"Bob"}); // 右值，选择 std::string&&
```

对于只包含标准容器和 RAII 成员的类，通常可以直接默认生成移动操作：

```cpp
class Buffer {
public:
    Buffer() = default;
    explicit Buffer(std::size_t size) : data(size) {}

    Buffer(const Buffer&) = default;
    Buffer& operator=(const Buffer&) = default;
    Buffer(Buffer&&) = default;
    Buffer& operator=(Buffer&&) = default;

private:
    std::vector<int> data;
};
```

如果类手动管理裸资源，移动操作需要在接管资源后把源对象留在可析构状态。除非必须自行管理资源，否则应优先遵循零法则，让成员类型自动完成移动。

### std::move

`std::move(expression)` 本身不移动数据，它本质上是将对象转换为右值引用的工具。真正的资源转移发生在之后选中的移动构造函数或移动赋值运算符中：

```cpp
std::string source = "a long string";
std::string target = std::move(source); // target 的构造函数执行移动
```

!!! note "命名的右值引用是左值"

    变量的声明类型可以是 `T&&`，但只要通过它的名字构成表达式，该表达式就是左值。手写移动构造函数时，因此仍需对 `other.member` 使用 `std::move`。

    ```cpp
    void relay(std::string&& value) {
        consume(value);            // value 是左值表达式
        consume(std::move(value)); // 显式允许 consume 移动它
    }
    ```

!!! info "const 对象通常不能真正移动"

    `std::move(const_object)` 得到 `const T&&`，而常见移动构造函数接收 `T&&`。因此它往往退化为拷贝，甚至无法编译。

### 移动操作与 noexcept

移动构造和移动赋值在满足实际语义的情况下，应尽可能声明为 `noexcept`。

!!! tip "noexcept 对容器的重要性"

    `std::vector` 扩容时需要维持异常安全。如果元素的移动构造可能抛出异常且元素可拷贝，容器可能选择拷贝而不是移动。`std::move_if_noexcept` 封装了类似选择：优先安全移动，否则在可拷贝时退回拷贝。

!!! info "声明析构或拷贝操作会影响隐式移动"

    用户声明的析构函数、拷贝构造或拷贝赋值可以抑制移动操作的隐式生成。一旦类需要自定义其中一个特殊成员函数，就应根据五法则检查其余操作，更理想的做法是通过 RAII 成员遵循零法则。

### 转发引用

在泛型代码中，如果既想接受左值和右值，又希望在继续传递参数时保留实参原本的左右值属性，可以使用转发引用。

当函数模板的形参类型是对待推导的、无 CV 限定的模板类型参数的右值引用时，形如 T&& 的形参是转发引用：

```cpp
template <class T>
void f1(T&& value); // 转发引用

template <class T>
void f2(const T&&); // 有 const 限定：普通右值引用
```

使用 `auto` 会进行类型推导，因此也可能产生转发引用：

```cpp
auto&& x = expr;

for (auto&& x : container) {
    ...
}
```

但花括号初始化列表是特殊情况：

```cpp
auto&& x = {1, 2, 3}; // x 不是转发引用
```

并不是所有形如 `T&&` 的类型都是转发引用，转发引用的 `T` 必须是当前函数调用过程中需要进行模板参数推导的、无 CV 限定的模板类型参数。

例如：

```cpp
template<class T>
struct A {
    void f(T&& x); // 普通右值引用

    template<class U>
    void g(U&& x); // 转发引用
};
```

对于 `A<int> a`，类模板参数 `T` 已经确定为 `int`，因此成员函数 `f` 被调用时不会再根据实参推导 `T`，所以这里的 `T&&` 只是普通右值引用：

```cpp
int x = 10;
a.f(10); // OK
a.f(x);  // 错误：int&& 不能绑定到左值
```

而成员函数模板 `g` 中的 `U` 会在每次调用时根据实参重新推导，因此 `U&&` 是转发引用。

转发引用有单独的模板参数推导规则，标准规定：如果传入的是左值，那么这个参数会被视为左值引用类型来参与推导。

以传入 `int` 参数为例：

| 实参             | `T` 推导结果 | `T&&` 类型      | `T&&` 折叠后类型 |
| ---------------- | ------------ | --------------- | ---------------- |
| `int` 左值       | `int&`       | `int& &&`       | `int&`           |
| `const int` 左值 | `const int&` | `const int& &&` | `const int&`     |
| `int` 右值       | `int`        | `int&&`         | `int&&`          |
| `const int` 右值 | `const int`  | `const int&&`   | `const int&&`    |

这个规则配合引用折叠，是完美转发成立的前提条件。

注意，推导结果 `int&` 本质上就是一个正常的左值引用，可以在函数内修改原对象。

### 引用折叠

推导或类型别名可能形成「引用的引用」。C++ 通过引用折叠将它归一化：

| 组合     | 折叠结果 |
| -------- | -------- |
| `T& &`   | `T&`     |
| `T& &&`  | `T&`     |
| `T&& &`  | `T&`     |
| `T&& &&` | `T&&`    |

可以记为：只有两边都是 `&&` 时结果才是 `&&`，只要出现 `&` 就折叠为 `&`。

### std::forward 保留值类别

转发引用可自动得到左值或右值，但形参变量本身仍然是左值。

例如：

```cpp
void g(int&);
void g(int&&);

template<class T>
void f(T&& x) {
    g(x);
}
```

此时调用 `f(10)` 仍然会调用 `g(int&)`，因为表达式 `x` 是左值。

`std::forward<T>(value)` 利用已推导的 `T` 恢复调用者传入时的值类别：

```cpp
template <class T>
void wrapper(T&& value) {
    consume(std::forward<T>(value));
}

std::string text = "hello";
wrapper(text);              // 转发为左值
wrapper(std::string{"hi"}); // 转发为右值
```

`std::move` 无条件地将表达式转换为 `xvalue`，`std::forward<T>` 则仅在原实参是右值时恢复右值。

### 完美转发

完美转发的目标是：一个中间函数接收到参数以后，再把参数传给下一个函数时，尽可能完整地保留这个参数原本的类型属性，包括左右值属性。

完美转发依赖转发引用、模板参数推导、引用折叠、std::forward协同工作。

完美转发示例：

```cpp
void g(int&) {
    std::cout << "lvalue\n";
}

void g(int&&) {
    std::cout << "rvalue\n";
}

template<class T>
void f(T&& x) {
    g(std::forward<T>(x));
}

int a = 10;

f(a);  // g(int&)
f(10); // g(int&&)
```

传入左值 `a` 时，`T` 被推导为 `int&`，折叠后形参类型为 `int&`。由于左值属性被保留在 `T` 中，调用 `g` 时等价于 `g(std::forward<int&>(x))`，传入 `g` 的依然为左值。

传入右值时同理，最终传入 `g` 的保持为右值。

## constexpr

### constexpr 变量

`constexpr` 变量表示它的值必须能够在编译期确定。声明时必须立即初始化，且初始化器必须是常量表达式：

```cpp
constexpr int max_size = 100;
constexpr int buffer_size = max_size * 2;
```

`constexpr` 变量隐含 `const`，初始化后不能修改。

!!! note "constexpr 指针"

    对指针使用 `constexpr` 时，隐含的 `const` 修饰指针本身，而不是它指向的对象。指针必须由空指针、函数地址或具有静态存储期的对象地址等常量表达式初始化：

    ```cpp
    int global_value = 0;

    constexpr int* pointer = &global_value; // int* const
    *pointer = 42;                          // 正确：指向的 int 并非 const
    // pointer = nullptr;                   // 错误：pointer 本身不可修改

    constexpr const int* read_only = &global_value; // const int* const
    ```

变量的类型必须是字面值类型。除整数和浮点数等标量类型外，满足条件的类也可以创建 `constexpr` 对象：

```cpp
struct Point {
    constexpr Point(int x, int y) : x(x), y(y) {}

    int x;
    int y;
};

constexpr Point origin(0, 0);
```

### constexpr 函数

C++11 的 `constexpr` 函数限制较严，函数体基本只能包含一个 `return`：

```cpp
constexpr int square(int value) {
    return value * value;
}
```

`constexpr` 函数在常量上下文中必须在编译期求值，在普通上下文中也可以在运行时调用。

`constexpr` 函数是否必须在编译期求值由使用上下文决定。数组长度、枚举值、`static_assert` 条件等需要常量表达式，普通局部变量初始化不会强制编译期求值。

```cpp
int runtime_value();

constexpr int a = square(4);     // 必须在编译期求值
int b = square(runtime_value()); // 可在运行时求值
```

## 类定义增强

```cpp
class Base {
public:
    virtual ~Base() = default;
    virtual void run() = 0;
};

class Task final : public Base {
public:
    Task() = default;
    Task(const Task&) = delete;
    Task& operator=(const Task&) = delete;

    void run() override {}
};
```

- `= default`：要求编译器生成默认实现
- `= delete`：禁止某个函数被调用
- `override`：让编译器检查函数是否真的重写了虚函数
- `final`：可禁止类继续被继承，或禁止虚函数继续被重写
- 委托构造：允许一个构造函数调用同类的另一个构造函数
- 类内成员初始值：初始值可以直接写在成员声明处

!!! info "= delete 也参与重载解析"

    删除函数不是从候选集中移除。重载解析可以先选中它，然后报错，因此它可用于禁止不希望的隐式转换：

    ```cpp
    void process(int value);
    void process(double) = delete;

    process(1);   // 正确
    process(1.5); // 错误：选中已删除的精确匹配
    ```

!!! tip "零法则优先于五法则"

    如果成员类型已能正确管理资源，尽量不要手写析构、拷贝和移动操作。一旦需要手写其中之一，就应检查析构、拷贝构造、拷贝赋值、移动构造和移动赋值五个操作的行为。

## 强类型枚举

```cpp
enum class Color : unsigned char {
    red,
    green,
    blue,
};
```

`enum class` 的枚举项不会泄漏到外层作用域，也不会隐式转换为整数。

!!! note "枚举的底层类型"

    显式指定底层类型可以稳定存储大小和 ABI，但仍需要 `static_cast` 才能取得整数值。C++23 可使用 `std::to_underlying`。

## 可变参数模板

```cpp
template <class... Args>
void print_all(const Args&... args) {
    using swallow = int[];
    (void)swallow{0, ((std::cout << args << ' '), 0)...};
}
```

`Args...` 是模板参数包，`args...` 是函数参数包。C++17 引入折叠表达式后，这类展开可以写得更简洁。

可以用 `sizeof...(Args)` 或 `sizeof...(args)` 获取参数包长度。C++11 中递归处理参数包时，必须提供终止重载：

```cpp
void print() {
    std::cout << '\n';
}

template <class First, class... Rest>
void print(const First& first, const Rest&... rest) {
    std::cout << first << ' ';
    print(rest...);
}
```

!!! note "展开模式"

    省略号会重复它前面的最大可用模式。`f(std::forward<Args>(args)...)` 会对每个 `args` 分别应用对应的 `Args` 和 `std::forward`，再将结果作为多个实参。

## 智能指针

```cpp
auto unique = std::unique_ptr<Widget>(new Widget{});
auto shared = std::make_shared<Widget>();
std::weak_ptr<Widget> observer = shared;
```

| 类型                 | 所有权                                     |
| -------------------- | ------------------------------------------ |
| `std::unique_ptr<T>` | 独占所有权，只能移动                       |
| `std::shared_ptr<T>` | 通过引用计数共享所有权                     |
| `std::weak_ptr<T>`   | 不增加引用计数的弱引用，可用于打破循环引用 |

应优先使用 `std::make_unique`（C++14）和 `std::make_shared`，避免显式写 `new`。只有当所有权确实需要共享时才使用 `shared_ptr`。

!!! danger "不要用同一裸指针构造多个 shared_ptr"

    每次直接从裸指针构造 `shared_ptr` 都会创建新的控制块。两个独立控制块最终会重复释放同一对象。应拷贝已存在的 `shared_ptr`，或使用 `std::make_shared`。

!!! note "make_shared 的内存取舍"

    `make_shared` 通常将对象和控制块一次分配，更紧凑也更高效。但当对象已销毁而仍有 `weak_ptr` 指向控制块时，这块合并分配的内存可能要等到最后一个 `weak_ptr` 消失才释放。

`weak_ptr::lock()` 会原子地尝试获取 `shared_ptr`，对象已销毁时返回空指针：

```cpp
if (auto object = observer.lock()) {
    object->run();
}
```

## 并发支持

C++11 将线程和内存模型纳入标准，常用类型包括：

- `std::thread`、`std::mutex`、`std::lock_guard`、`std::condition_variable`
- `std::atomic<T>`
- `std::future<T>`、`std::promise<T>`、`std::async`

```cpp
std::mutex mutex;
int result = 0;

std::thread worker([&] {
    std::lock_guard<std::mutex> lock(mutex);
    result = 42;
});

worker.join();
```

!!! danger "thread 析构前必须 join 或 detach"

    对仍为 joinable 的 `std::thread` 执行析构会调用 `std::terminate`，异常路径也必须保证线程被处理。C++20 的 `std::jthread` 能自动请求停止并 `join`。

!!! warning "数据竞争是未定义行为"

    多个线程无同步地访问同一内存位置，且至少一个访问是写操作时，就会产生数据竞争。`volatile` 不提供线程同步，应使用互斥量或合适内存序的原子操作。

`condition_variable::wait` 应使用谓词形式，以处理虚假唤醒：

```cpp
std::unique_lock<std::mutex> lock(mutex);
condition.wait(lock, [&] { return ready; });
```

## 其他常用库特性

- `std::array`、`std::tuple`、`std::unordered_map`、`std::unordered_set`、`std::forward_list`
- `<chrono>` 时钟、时间点和时长
- `<random>` 随机数引擎与分布
- 正则表达式库 `<regex>`
- `std::to_string`
- `std::begin`、`std::end`
