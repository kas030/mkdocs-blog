# C++14 新特性

C++14 是对 C++11 的增量完善，主要目标是简化泛型编程和编译期计算。

## 泛型 Lambda

Lambda 的形参可以使用 `auto`：

```cpp
auto add = [](const auto& a, const auto& b) {
    return a + b;
};

auto x = add(1, 2);
auto y = add(std::string{"C++"}, std::string{"14"});
```

每一组实参类型都会实例化一个对应的函数调用运算符。

每个 `auto` 形参对应一个独立的隐式模板形参，因此两个 `auto` 不要求类型相同。需要保留实参值类别时，可使用 `auto&&` 和 `decltype`：

```cpp
auto call = [](auto&& function, auto&& argument) -> decltype(auto) {
    return std::forward<decltype(function)>(function)(
        std::forward<decltype(argument)>(argument));
};
```

!!! info "泛型 Lambda 仍然是闭包类型"

    泛型 Lambda 不是普通函数模板，而是一个闭包对象，其 `operator()` 是函数模板。同一个 Lambda 表达式只对应一种唯一闭包类型。

## Lambda 初始化捕获

```cpp
auto pointer = std::make_unique<Widget>();
auto task = [object = std::move(pointer)] {
    object->run();
};
```

初始化捕获可以创建新的闭包成员，也能把只移动对象转入 Lambda。

```cpp
int value = 10;
auto by_value = [copy = value + 1] { return copy; };
auto by_reference = [&alias = value] { return ++alias; };
```

!!! danger "引用初始化捕获可能悬空"

    `&alias = value` 只是为引用捕获起一个新名字，不会延长 `value` 的生命周期。异步保存 Lambda 时，应优先捕获具有清晰所有权的值。

## 返回类型推导和 decltype(auto)

```cpp
auto square(int value) {
    return value * value;
}

template <class Container>
decltype(auto) first(Container& container) {
    return (container.front());
}
```

`auto` 按普通模板推导规则返回值，`decltype(auto)` 按 `decltype` 规则推导，可以保留引用。返回表达式外层的括号会影响 `decltype(auto)` 的推导结果。

!!! info "auto 返回类型的限制"

    所有未丢弃的 `return` 语句都必须推导出同一类型，不会像条件运算符那样寻找公共类型。直接返回花括号列表也无法推导。

    ```cpp
    auto choose(bool flag) {
        if (flag) return 1;
        return 2.0; // 错误：int 与 double 不一致
    }

    auto values() {
        return {1, 2, 3}; // 错误：无法从花括号列表推导
    }
    ```

!!! danger "decltype(auto) 返回局部变量"

    下面的例子中，`return local` 按特殊标识符规则推导为值类型，`return (local)` 则按左值规则推导为引用。后者在函数返回后立即悬空。

    ```cpp
    decltype(auto) safe() {
        int local = 1;
        return local; // int
    }

    decltype(auto) dangling() {
        int local = 1;
        return (local); // int&
    }
    ```

## constexpr 限制放宽

C++14 的 `constexpr` 函数可以包含局部变量、分支和循环：

```cpp
constexpr int factorial(int n) {
    int result = 1;
    for (int i = 2; i <= n; ++i) {
        result *= i;
    }
    return result;
}

static_assert(factorial(5) == 120, "unexpected result");
```

C++14 中仍不能在常量求值路径上执行 `goto`、`try` 等不允许的操作，也不能调用非 `constexpr` 函数。但某个分支不被执行时，其中的普通调用不会阻止另一条路径在编译期求值。

## 变量模板

```cpp
template <class T>
constexpr T pi = T{3.1415926535897932385L};

auto circumference = 2.0 * pi<double> * radius;
```

!!! note "头文件中的变量模板"

    C++17 的 inline 变量出现之前，要格外注意头文件中变量模板特化的链接性和单一定义规则。不需要地址唯一性时，`constexpr` 变量模板是常见写法，需要唯一实体时应明确安排定义。

## 二进制字面量和数字分隔符

```cpp
auto mask = 0b1111'0000;
auto population = 1'000'000;
```

`'` 可放在数字序列中，不影响数值和类型，也可用于十六进制、二进制和浮点字面量。不能以分隔符开头或结尾，也不能把前缀与数字分开。

## 库特性

- `std::make_unique`：安全、简洁地创建 `unique_ptr`
- `std::integer_sequence`：在编译期生成整数序列
- `std::exchange`：用新值替换对象，并返回旧值
- `std::quoted`：读写带引号的字符串
- `std::chrono` 的 `h`、`min`、`s`、`ms` 等时长字面量

!!! note "make_unique 的数组形式"

    `std::make_unique<T[]>(n)` 创建动态长度数组并值初始化元素，`std::make_unique<T[N]>(...)` 被删除。固定长度数组通常应使用 `std::array<T, N>`。

!!! example "integer_sequence 的典型用途"

    `integer_sequence` 常用于把 tuple 的下标在编译期展开为参数包。C++14 提供 `std::index_sequence` 和 `std::make_index_sequence<N>` 作为 `std::size_t` 特化的便利别名。
