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

**Crate：构建项目的基本单元**

Crate 是 Rust 的编译单元。当运行编译命令时，rustc 总是以一个 Crate 为单位进行处理。

它主要分为两种类型：

- 二进制 Crate（Binary Crates）：

    这是一个可以编译成可执行文件的项目。必须包含一个 `main.rs` 文件，作为程序的入口点。一个项目可以有任意多个。

- 库 Crate (Library Crates):

    这类项目没有 `main` 函数，不能直接运行。通常包含一个 `lib.rs` 文件。一个项目只能包含一个。

**一个简单程序**

???+ code "main.rs"

    ```rust linenums="1"
    use std::io::stdin;
    
    fn main() {
        let mut msg = String::new();
        println!("Please enter a message:");
        stdin().read_line(&mut msg).unwrap();
        println!("Message is {}", msg);
    }
    ```
