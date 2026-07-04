---
tags:
  - Rust
  - RustRover
---

# Rust 基础

## 快速开始

**创建项目**

使用 cargo 创建新项目：

```shell
cargo new hello_world
```

用 RustRover 打开：

```shell
cd hello_world
rustrover .
```

### cargo 与 rustc

**rustc：Rust 编译器**

`rustc` 是 Rust 的编译器，负责把 Rust 源代码编译成可执行文件或库文件。对于单个源文件，可以直接使用 `rustc` 编译：

```shell
rustc main.rs
```

`rustc` 更接近底层编译工具，适合编译简单的单文件程序。

**cargo：Rust 包管理器和构建工具**

`cargo` 是 Rust 官方的包管理器和构建系统。日常开发中通常使用 `cargo`，而不是直接调用 `rustc`。它会负责创建项目、下载依赖、调用 `rustc` 编译代码、运行测试和生成文档。

常用命令如下：

```text
cargo new hello_world  # 创建新项目
cargo build            # 编译项目
cargo run              # 编译并运行项目
cargo test             # 运行测试
cargo check            # 快速检查代码是否可以通过编译
cargo doc --open       # 生成并打开文档
```

项目依赖通常写在 `Cargo.toml` 中，`cargo` 会根据配置下载依赖并维护 `Cargo.lock`，保证项目构建结果稳定。

**Crate：构建项目的基本单元**

Crate 是 Rust 的编译单元。当运行编译命令时，rustc 总是以一个 Crate 为单位进行处理。

它主要分为两种类型：

- 二进制 Crate（Binary Crates）：

    这是一个可以编译成可执行文件的项目。必须包含一个 `main.rs` 文件，作为程序的入口点。一个项目可以有任意多个。

- 库 Crate (Library Crates):

    这类项目没有 `main` 函数，不能直接运行。通常包含一个 `lib.rs` 文件。一个项目只能包含一个。

## 基本数据类型

### 整型

无符号整型包括：

```rust
u8, u16, u32, u64, u128, usize
```

有符号整型包括：

```rust
i8, i16, i32, i64, i128, isize
```

其中 `usize` 和 `isize` 大小等于机器字长，类似 C++ 中的 `size_t` 和 `ptrdiff_t`。

**整型字面量**

整型字面量可以使用不同进制书写：

```rust
let a = 98_222;      // 十进制
let b = 0xff;        // 十六进制
let c = 0o77;        // 八进制
let d = 0b1111_0000; // 二进制
let e = b'A';        // 字节字面量，只能用于 u8
let f = b'\x1b';     // 使用任意两位十六进制数编码字节字面量
```

数字中可以使用 `_` 分隔，提高可读性。分隔符不会影响数值本身：

```rust
let x = 1_000_000;
let y = 0b1010_1100;
```

字面量可以带类型后缀，直接指定类型：

```rust
let x = 42u8;
let y = 100_i64;
let z = 0xff_u32;
```

如果没有后缀，Rust 会根据上下文推断类型：

```rust
let x: u8 = 42;      // 根据变量类型推断为 u8
let y = 42u64;       // 根据后缀推断为 u64
let z = 42;          // 没有上下文时，默认推断为 i32
```

**类型自身的方法调用**

Rust 的基本类型也有自身关联的常量和方法，可以通过 `类型::成员` 调用：

```rust
let max = i32::MAX;
let min = i32::MIN;
let x = u32::from_str_radix("ff", 16).unwrap();
```

对于普通方法，既可以通过值调用，也可以显式写成类型调用：

```rust
let x = (-10i32).abs();
let y = i32::abs(-10);

let a = 10u32.max(20);
let b = u32::max(10, 20);
```

`x.method(y)` 本质上可以理解为 `Type::method(x, y)` 的语法糖。多数情况下使用值调用更自然；当需要强调具体类型，或者没有现成的值作为接收者时，可以使用类型调用。

**检查、回绕、饱和、溢出**

普通整数运算发生溢出时，调试模式下会触发 panic，发布模式下通常按补码规则回绕。需要明确控制溢出行为时，可以使用整数类型提供的方法。

检查运算使用 `checked_*`，溢出时返回 `None`：

```rust
assert_eq!(255u8.checked_add(1), None);
assert_eq!(10u8.checked_add(20), Some(30));
```

回绕运算使用 `wrapping_*`，结果按固定宽度整数回绕：

```rust
assert_eq!(255u8.wrapping_add(1), 0);
assert_eq!(0u8.wrapping_sub(1), 255);
```

饱和运算使用 `saturating_*`，结果会停在类型的最小值或最大值：

```rust
assert_eq!(255u8.saturating_add(1), 255);
assert_eq!(0u8.saturating_sub(1), 0);
```

溢出运算使用 `overflowing_*`，返回计算结果和是否溢出的标记：

```rust
assert_eq!(255u8.overflowing_add(1), (0, true));
assert_eq!(10u8.overflowing_add(20), (30, false));
```

运算前缀后面可以跟的运算名称如下：

```text
add, sub, mul, div, rem, pow, shl, shr, neg, abs
```

其中 `neg` 和 `abs` 只适用于有符号整型。

注意，`saturating_` 只支持:

```text
add, sub, mul, pow, neg, abs
```

### 浮点类型

Rust 的浮点类型包括 `f32` 和 `f64`，分别对应 IEEE 单精度浮点数和双精度浮点数。

**浮点字面量**

浮点字面量可以使用小数、指数和类型后缀：

```rust
let a = 5.;        // 可使用单独的小数点
let b = 2.0f32;    // 使用后缀指定为 f32
let c = 1_000.5;   // 可以使用“_”分隔数字
let d = 1e6;       // 科学计数法
let e = 2.5e-3f64; // 科学计数法和类型后缀
```

需要注意，必须存在浮点部分、指数和类型后缀中的至少一个，才是浮点字面量。

没有明确类型约束时，浮点字面量默认推断为 `f64`。

**特殊值**

浮点数包含正无穷、负无穷和非数值：

```rust
let inf = f64::INFINITY;
let neg_inf = f64::NEG_INFINITY;
let nan = f64::NAN;
```

常用判断方法包括：

```rust
assert!(x.is_finite());
assert!(!x.is_infinite());
assert!(!x.is_nan());
```

**数学常量**

常用数学常量在 `std::f32::consts` 和 `std::f64::consts` 中：

```rust
let pi = std::f64::consts::PI;
let e = std::f64::consts::E;
let sqrt_2 = std::f64::consts::SQRT_2;
```

也可以先导入再使用：

```rust
use std::f64::consts::{E, PI};

let area = PI * 2.0 * 2.0;
let growth = E.powf(2.0);
```

!!! info "隐式和显式转换"

    Rust 不会在整型和浮点型之间做隐式转换，也不会在 `f32` 和 `f64` 之间自动转换：

    ```rust
    let x: f32 = 1.0;
    let y: f64 = x; // 编译错误
    ```

    需要使用 `as` 进行显式转换：

    ```rust
    let x: f32 = 1.0;
    let y: f64 = x as f64;

    let a: i32 = 10;
    let b: f64 = a as f64;
    ```

    浮点数转换为整数时，小数部分会被截断；如果值超出目标整数类型范围，结果会饱和到目标类型的边界：

    ```rust
    assert_eq!(3.9f64 as i32, 3);
    assert_eq!((-3.9f64) as i32, -3);
    assert_eq!(300.0f32 as u8, u8::MAX);
    ```

### 布尔类型

布尔类型是 `bool`，只有两个值：`true` 和 `false`。

```rust
let t = true;
let f: bool = false;
```

**控制结构条件**

Rust 的控制结构条件必须是 `bool`，不会把整数、指针或其他类型隐式当作真假值。

下面的写法不能通过编译：

```rust
let x = 1;

if x {
    println!("x is true");
}
```

`while`、`if`、`if let` 等控制结构也遵循这个规则。需要判断数字是否为零、集合是否为空等情况时，应显式写出条件：

```rust
let numbers = vec![1, 2, 3];

if !numbers.is_empty() {
    println!("has elements");
}
```

**类型转换**

`bool` 可以使用 `as` 转换为整数，`false` 转换为 `0`，`true` 转换为 `1`：

```rust
assert_eq!(false as i32, 0);
assert_eq!(true as i32, 1);
```

整数不能使用 `as` 直接转换为 `bool`。需要通过比较表达式得到布尔值：

```rust
let x = 10;
let is_nonzero = x != 0;
let is_positive = x > 0;
```

### 字符

Rust 的字符类型是 `char`，字面量使用单引号。`char` 表示一个 Unicode 标量值，占 4 个字节，不等同于 C/C++ 中的 `char`。

```rust
let a = 'a';
let zh = '中';
```

**转义字符**

字符字面量中可以使用常见转义字符：`'\n'`、`'\t'`、`'\r'`、`'\\'`、`'\''`、`'\0'` 等。

也可以使用十六进制转义表示 ASCII 字符：

```rust
let escape = '\x1b';
let letter_a = '\x41';
```

**Unicode 码点写法**

Unicode 码点字面量使用 `\u{...}`，花括号中可写最多六位十六进制码点：

```rust
let heart = '\u{2764}';
let crab = '\u{1F980}';
```

码点必须是合法的 Unicode 标量值，不能是代理项范围等非法值。

**类型转换**

`char` 可以使用 `as` 转换为整数，得到对应的 Unicode 码点：

```rust
assert_eq!('A' as u32, 65);
assert_eq!('中' as u32, 0x4E2D);
```

从 `u8` 到 `char` 可以使用 `as`，也可以使用 `char::from`，它会按 Unicode 码点值转换：
    
```rust
let a = b'A' as char;
let b = char::from(b'B');
```

从 `u32` 到 `char` 需要使用 `char::from_u32`，因为不是所有 `u32` 都是合法的 Unicode 标量值：

```rust
let heart = char::from_u32(0x2764);
let invalid = char::from_u32(0xD800);

assert_eq!(heart, Some('❤'));
assert_eq!(invalid, None);
```

### 元组

元组（tuple）可以把多个不同类型的值组合成一个复合值。元组长度固定，一旦声明后不能改变元素个数。

```rust
let person = ("Alice", 18, true);
let point: (i32, i32) = (3, 4);
let mixed: (i32, f64, char) = (10, 3.14, 'x');
```

元组类型由每个位置上的元素类型共同决定。

**访问元素**

可以使用点号加下标访问元组元素，下标从 `0` 开始：

```rust
let person = ("Alice", 18, true);

let name = person.0;
let age = person.1;
let active = person.2;
```

元组下标必须是编译期已知的数字，不能使用变量作为下标。

**解构元组**

可以使用模式匹配一次性取出元组中的多个值：

```rust
let point = (3, 4);
let (x, y) = point;
```

如果只关心部分元素，可以使用 `_` 忽略不需要的值：

```rust
let rgb = (255, 128, 0);
let (red, _, blue) = rgb;
```

元组也常用于函数返回多个值：

```rust
fn divide(dividend: i32, divisor: i32) -> (i32, i32) {
    (dividend / divisor, dividend % divisor)
}

let (quotient, remainder) = divide(10, 3);
```

**可变元组**

如果元组绑定本身是可变的，可以修改其中的元素，但新值必须和原位置的类型一致：

```rust
let mut point = (0, 0);
point.0 = 3;
point.1 = 4;
```

下面的写法不能通过编译，因为元素类型不匹配：

```rust
let mut pair = (1, 2);
pair.0 = "one";
```

**单元素元组和空元组**

单元素元组必须带逗号，否则括号只表示普通分组：

```rust
let tuple = (1,);
let number = (1);
```

元组的最后一个元素后可以添加额外的尾随逗号。Rust 允许在所有能用逗号的地方使用尾随逗号，包括函数参数、数组、结构体和枚举定义等。

空元组写作 `()`，它既是一个类型，也是这个类型唯一的值。

```rust
let unit = ();
```

没有返回值的函数实际返回 `()`。

### 指针类型

Rust 中常见的指针类型包括引用、智能指针和裸指针。引用是最常用的安全指针；`Box<T>` 是拥有所有权的堆分配指针；裸指针主要用于底层编程和与 C 语言交互。

**引用**

引用允许在不转移所有权的情况下访问值，类型写作 `&T`。创建引用的过程称为借用。

```rust
let x = 10;
let r: &i32 = &x;

assert_eq!(*r, 10);
```

`*r` 表示解引用，用来访问引用指向的值。很多情况下 Rust 会自动解引用，因此方法调用时通常不需要手动写 `*`。

可变引用写作 `&mut T`，允许通过引用修改原值：

```rust
let mut x = 10;
let r: &mut i32 = &mut x;

*r += 1;

assert_eq!(x, 11);
```

引用必须遵守借用规则：同一时间可以有多个不可变引用，或者一个可变引用，但不能两者同时存在。

```rust
let mut x = 10;

let a = &x;
let b = &x;

assert_eq!(*a + *b, 20);

let c = &mut x;
*c += 1;
```

**Box**

`Box<T>` 是标准库提供的智能指针，它把值存放在堆上，并在离开作用域时自动释放内存。

```rust
let x = Box::new(10);

assert_eq!(*x, 10);
```

`Box<T>` 拥有其中的值，因此移动 `Box<T>` 时，所有权也会一起移动：

```rust
let a = Box::new(String::from("hello"));
let b = a;

println!("{b}");
```

`Box<T>` 常用于需要固定大小指针包装的场景，例如递归类型：

```rust
enum List {
    Cons(i32, Box<List>),
    Nil,
}

let list = List::Cons(1, Box::new(List::Cons(2, Box::new(List::Nil))));
```

如果没有 `Box<List>`，`List` 会直接包含自身，编译器无法确定类型大小。

**裸指针**

裸指针分为不可变裸指针 `*const T` 和可变裸指针 `*mut T`。创建裸指针是安全的，但解引用裸指针是不安全的，必须放在 `unsafe` 块中。

```rust
let x = 10;
let p: *const i32 = &x;

unsafe {
    assert_eq!(*p, 10);
}
```

可变裸指针可以通过可变引用创建：

```rust
let mut x = 10;
let p: *mut i32 = &mut x;

unsafe {
    *p += 1;
}

assert_eq!(x, 11);
```

裸指针不受借用检查器保护，可以为空、悬垂，或者同时存在多个指向同一位置的可变指针。因此它主要用于 FFI、操作系统、嵌入式、手写数据结构等需要绕过 Rust 安全抽象的场景。

```rust
let null: *const i32 = std::ptr::null();
let mut_null: *mut i32 = std::ptr::null_mut();
```

使用裸指针时，程序员需要自己保证指针有效、对齐正确，并且没有违反别名和可变性规则。

### 数组、向量和切片

数组、向量和切片都表示一段连续的同类型元素，但它们的所有权和长度特性不同：

- 数组 `[T; N]`：长度固定，长度是类型的一部分。
- 向量 `Vec<T>`：长度可变，数据存放在堆上。
- 切片 `[T]`：一段连续元素的视图，分为共享切片 `&[T]` 和可变切片 `&mut [T]`。

**数组**

数组的类型写作 `[T; N]`，其中 `T` 是元素类型，`N` 是长度。

```rust
let a = [1, 2, 3, 4, 5];
let b: [i32; 3] = [10, 20, 30];
```

如果所有元素相同，可以使用 `[value; len]` 初始化：

```rust
let zeros = [0; 5];

assert_eq!(zeros, [0, 0, 0, 0, 0]);
```

Rust 没有定义未初始化数组的写法。

访问元素和获取数组长度：

```rust
let a = [1, 2, 3];

assert_eq!(a[0], 1);
assert_eq!(a.len(), 3);
```

数组下标类型必须是 `usize`，不能使用任何其他整型作为索引。注意，越界访问会在运行时触发 panic。

**向量**

`Vec<T>` 是长度可变的数组类型，可在运行时增删元素。

```rust
let mut v = Vec::new();

v.push(1);
v.push(2);
v.push(3);
```

可以使用 `vec!` 宏创建向量：

```rust
let v = vec![1, 2, 3];
let zeros = vec![0; 5];
```

可以使用 `Vec::with_capacity` 确定向量的初始容量：

```rust
let mut v = Vec::with_capacity(5);
assert_eq!(v.capacity(), 5);
```

也可以从迭代器生成的值构建一个向量：

```rust
let v: Vec<i32> = (0..5).collect();
assert_eq!(v, [0, 1, 2, 3, 4]);
```

使用 `collect` 时，通常要指定类型，因为它可以构建出不同种类的集合。

常用操作包括访问、追加、弹出和遍历：

```rust
let mut v = vec![10, 20, 30];

assert_eq!(v[0], 10);
assert_eq!(v.get(1), Some(&20));
assert_eq!(v.get(10), None);

v.push(40);
assert_eq!(v.pop(), Some(40));

for x in &v {
    println!("{x}");
}
```

使用 `v.get(index)` 会返回 `Option<&T>`；使用 `v.pop()` 会返回 `Option<T>`。

**切片**

切片表示数组或向量中的一段连续元素。切片本身大小不固定，通常通过引用使用：

```rust
let a = [1, 2, 3, 4, 5];
let s: &[i32] = &a[1..4];
assert_eq!(s, &[2, 3, 4]);
```

切片范围使用 `start..end`，左闭右开：

```rust
let v = vec![1, 2, 3, 4, 5];
let all = &v[..];
let from_two = &v[2..];
let to_three = &v[..3];
let middle = &v[1..4];
```

可变切片可以修改原数据：

```rust
let mut a = [1, 2, 3, 4];
let s = &mut a[1..3];
s[0] = 20;
s[1] = 30;
assert_eq!(a, [1, 20, 30, 4]);
```

函数参数中经常使用切片引用，这样同一个函数既能接收数组，也能接收向量：

```rust
fn sum(values: &[i32]) -> i32 {
    values.iter().sum()
}

let a = [1, 2, 3];
let v = vec![4, 5, 6];

assert_eq!(sum(&a), 6);
assert_eq!(sum(&v), 15);
```

**调用切片方法**

数组和向量都可以调用切片方法。原因是数组可以自动借用为切片，`Vec<T>` 也会通过 `Deref` 自动转换为切片。

```rust
let a = [1, 2, 3, 4, 5];
let v = vec![1, 2, 3, 4, 5];

assert_eq!(a.first(), Some(&1));
assert_eq!(v.first(), Some(&1));

assert_eq!(a.last(), Some(&5));
assert_eq!(v.last(), Some(&5));

assert!(a.contains(&3));
assert!(v.contains(&3));
```

!!! note "常量提升"

    `first` 返回的是 `Option<&T>`，所以这里要和 `Some(&1)` 比较。

    `&1` 看起来像是引用了一个临时整数，但 Rust 会在满足条件时进行常量提升，把这个只读常量提升到静态存储位置，因此 `&1` 可以安全地作为引用使用。

    这类提升只适用于不会产生运行时副作用、不会依赖局部变量、也不包含内部可变性的常量表达式。

!!! note "解引用比较"

    `assert_eq!(a.first(), Some(&1))` 比较的是两个 `Option<&i32>`，不是比较引用地址。

    Rust 为引用实现了 `PartialEq`，比较 `&T` 时会比较引用指向的值。因此只要两个引用指向的整数值相同，比较结果就是相等。

    也就是说，`Some(&a[0]) == Some(&1)` 成立，是因为 `a[0] == 1`，而不是因为这两个引用指向同一个内存地址。

只读切片方法示例：

```rust
let a = [1, 2, 3, 4, 5];

assert_eq!(a.len(), 5);
assert!(!a.is_empty());
assert_eq!(a.binary_search(&3), Ok(2));
```

也可以使用迭代相关的切片方法：

```rust
let a = [1, 2, 3, 4];

for window in a.windows(2) {
    println!("{window:?}");
}

for chunk in a.chunks(2) {
    println!("{chunk:?}");
}
```

可变数组和可变向量可以调用需要 `&mut [T]` 的切片方法：

```rust
let mut a = [3, 1, 4, 2];
let mut v = vec![3, 1, 4, 2];

a.sort();
v.sort();

assert_eq!(a, [1, 2, 3, 4]);
assert_eq!(v, [1, 2, 3, 4]);
```

如果需要显式得到切片，可以写成 `&a[..]`、`&v[..]`、`a.as_slice()` 或 `v.as_slice()`：

```rust
let a = [1, 2, 3];
let v = vec![4, 5, 6];

let s1: &[i32] = &a[..];
let s2: &[i32] = v.as_slice();

assert_eq!(s1, &[1, 2, 3]);
assert_eq!(s2, &[4, 5, 6]);
```

### 字符串类型

Rust 的字符串使用 UTF-8 编码。常见字符串类型包括 `String` 和 `str`：

- `String`：可增长、可修改、拥有所有权的字符串，数据存放在堆上。
- `str`：字符串切片类型，大小不固定，通常通过 `&str` 使用。

字符串字面量的类型是 `&'static str`：

```rust
let s: &str = "hello";
```

这里的 `&'static str` 表示这个字符串内容存放在程序的静态区域中，引用在整个程序运行期间都有效。

**创建字符串**

可以使用 `String::new` 创建空字符串：

```rust
let mut s = String::new();

s.push_str("hello");
```

也可以从字符串字面量创建 `String`：

```rust
let a = String::from("hello");
let b = "hello".to_string();
let c = "hello".to_owned();
```

`String` 可以自动借用为 `&str`，因此函数参数通常优先写成 `&str`，这样既能接收字符串字面量，也能接收 `String`：

```rust
fn print_message(message: &str) {
    println!("{message}");
}

let s = String::from("hello");

print_message("world");
print_message(&s);
```

**修改字符串**

`String` 支持追加字符串和字符：

```rust
let mut s = String::from("hello");

s.push(' ');
s.push_str("world");

assert_eq!(s, "hello world");
```

可以使用 `+` 拼接字符串。需要注意，`+` 会移动左侧的 `String`：

```rust
let a = String::from("hello");
let b = String::from(" world");
let c = a + &b;

assert_eq!(c, "hello world");
```

如果需要更灵活的拼接，通常使用 `format!`：

```rust
let name = "Alice";
let age = 18;
let message = format!("{name} is {age}");
```

**长度和索引**

`len` 返回的是字节数，不是字符数：

```rust
let a = "hello";
let b = "你好";

assert_eq!(a.len(), 5);
assert_eq!(b.len(), 6);
```

Rust 字符串不能使用整数下标访问单个字符：

```rust
let s = "你好";
let ch = s[0]; // 编译错误
```

原因是 Rust 字符串使用 UTF-8 编码，一个 Unicode 字符可能占多个字节。按整数下标访问容易混淆“字节位置”和“字符位置”。

**遍历字符串**

如果需要按字符遍历，可以使用 `chars`：

```rust
let s = "你好";

for ch in s.chars() {
    println!("{ch}");
}
```

如果需要按字节遍历，可以使用 `bytes`：

```rust
let s = "abc";

for byte in s.bytes() {
    println!("{byte}");
}
```

**字符串切片**

字符串可以使用范围语法创建 `&str` 切片，但切片边界必须落在合法的 UTF-8 字符边界上：

```rust
let s = "hello world";
let hello = &s[0..5];

assert_eq!(hello, "hello");
```

对中文等多字节字符切片时，需要格外注意字节边界：

```rust
let s = "你好";
let first = &s[0..3];

assert_eq!(first, "你");
```

如果范围没有落在字符边界上，会在运行时触发 panic：

```rust
let s = "你好";
let invalid = &s[0..1]; // panic
```

**原始字符串字面量**

原始字符串字面量以 `r` 开头，不会处理反斜杠转义，适合正则表达式、Windows 路径或包含引号的文本：

```rust
let path = r"C:\Users\Alice\notes.txt";
let text = r#"He said: "hello""#;
```

如果字符串内部也包含 `"#`，可以增加 `#` 的数量：

```rust
let text = r##"A raw string containing "# inside"##;
```

**常用方法**

字符串提供了很多常用方法：

```rust
let s = "  hello rust  ";

assert_eq!(s.trim(), "hello rust");
assert!(s.contains("rust"));
assert!(s.starts_with("  hello"));
assert!(s.ends_with("  "));
assert_eq!(s.replace("rust", "Rust"), "  hello Rust  ");
```

按分隔符拆分字符串：

```rust
let parts: Vec<&str> = "a,b,c".split(',').collect();

assert_eq!(parts, ["a", "b", "c"]);
```

将多个字符串片段拼接起来：

```rust
let words = ["hello", "rust"];
let message = words.join(" ");

assert_eq!(message, "hello rust");
```
