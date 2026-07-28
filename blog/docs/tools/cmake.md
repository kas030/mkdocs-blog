# CMake

CMake 是一个跨平台构建系统生成器，会根据 `CMakeLists.txt` 生成 Ninja、Makefile、Visual Studio 工程等后端构建文件，再由对应工具完成实际编译。

现代 CMake 的核心思路是：围绕 target 描述构建目标，把头文件路径、编译选项、链接库等信息绑定到 target 上。

## 基本流程

推荐使用 out-of-source build，即把构建产物放到源码目录外的 `build/` 中。

```sh
cmake -S . -B build
cmake --build build
```

其中 `cmake -S . -B build` 是配置项目：

- `-S .` 指定源码目录是当前目录，CMake 会在这里查找 `CMakeLists.txt`
- `-B build` 指定构建目录是 `build/`，生成的构建文件和缓存会放在这里

执行后，CMake 会读取源码目录中的配置，生成后端构建系统文件。真正编译项目的是：

```sh
cmake --build build
```

指定构建类型：

```sh
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build
```

常见构建类型：

- `Debug`：保留调试信息，通常不优化
- `Release`：开启优化
- `RelWithDebInfo`：优化并保留调试信息
- `MinSizeRel`：偏向最小体积

!!! note "单配置生成器与多配置生成器"

    - 单配置生成器：`build/` 目录对应一种构建类型
    - 多配置生成器：同一个 `build/` 目录支持多种构建类型

    Ninja、Unix Makefiles 通常是单配置生成器，构建类型在配置阶段通过 `CMAKE_BUILD_TYPE` 指定。

    Visual Studio、Xcode 通常是多配置生成器，构建类型在构建阶段指定：

    ```sh
    cmake --build build --config Debug
    ```

## 最小项目

一个最小的 C++ 项目可以这样写：

```cmake
cmake_minimum_required(VERSION 3.20)
project(hello LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_executable(hello main.cpp)
```

- `cmake_minimum_required(VERSION 3.20)` 指定项目要求的最低 CMake 版本。
- `project(hello LANGUAGES CXX)` 声明项目名是 `hello`，并启用 C++ 语言。`CXX` 是 CMake 中表示 C++ 的语言名。
- `set(CMAKE_CXX_STANDARD_REQUIRED ON)` 表示必须使用上面指定的标准。如果编译器不支持 C++17，配置阶段或构建阶段会报错。
- `set(CMAKE_CXX_EXTENSIONS OFF)` 关闭编译器扩展，尽量使用标准 C++。
- `add_executable(hello main.cpp)` 创建一个名为 `hello` 的可执行程序，它由 `main.cpp` 编译得到。

这个项目通常对应这样的文件结构：

```text
project/
├── CMakeLists.txt
└── main.cpp
```

## Target

常见 target 类型：

```cmake
add_executable(app main.cpp)
add_library(core STATIC core.cpp)
add_library(utils SHARED utils.cpp)
add_library(headers INTERFACE)
```

- `add_executable` 创建可执行文件
- `STATIC` 创建静态库
- `SHARED` 创建动态库
- `INTERFACE` 创建只有使用需求、没有自身编译产物的库，常用于 header-only 库

给 target 添加源文件：

```cmake
target_sources(app PRIVATE
    main.cpp
    app.cpp
)
```

给 target 添加头文件搜索路径：

```cmake
target_include_directories(core
    PUBLIC
        include
    PRIVATE
        src
)
```

作用域含义：

- `PRIVATE`：只影响当前 target
- `PUBLIC`：影响当前 target，也传递给链接它的 target
- `INTERFACE`：不影响当前 target，只传递给链接它的 target

## 链接库

假设 `app` 依赖 `core`：

```cmake
target_link_libraries(app PRIVATE core)
```

如果 `core` 的公共头文件中暴露了另一个库的类型，那么这个依赖应该是 `PUBLIC`：

```cmake
target_link_libraries(core PUBLIC fmt::fmt)
```

如果依赖只在 `.cpp` 文件内部使用，则应该是 `PRIVATE`。

!!! tip "优先使用 target 写法"

    尽量使用 `target_include_directories`、`target_compile_options`、`target_compile_definitions`、`target_link_libraries`，少用 `include_directories`、`add_compile_options` 这类全局命令。

## 编译选项与宏

添加编译选项：

```cmake
target_compile_options(app PRIVATE
    -Wall
    -Wextra
)
```

添加宏定义：

```cmake
target_compile_definitions(app PRIVATE
    ENABLE_LOG=1
)
```

按编译器区分选项：

```cmake
if(MSVC)
    target_compile_options(app PRIVATE /W4)
else()
    target_compile_options(app PRIVATE -Wall -Wextra -Wpedantic)
endif()
```

## 子目录组织

常见项目结构：

```text
project/
├── CMakeLists.txt
├── include/
│   └── core/
│       └── core.hpp
├── src/
│   └── core.cpp
└── app/
    ├── CMakeLists.txt
    └── main.cpp
```

根目录：

```cmake
cmake_minimum_required(VERSION 3.20)
project(example LANGUAGES CXX)

add_library(core src/core.cpp)
target_include_directories(core PUBLIC include)

add_subdirectory(app)
```

`app/CMakeLists.txt`：

```cmake
add_executable(app main.cpp)
target_link_libraries(app PRIVATE core)
```

## 查找依赖

如果依赖包提供了 CMake 配置文件，优先使用 `find_package`：

```cmake
find_package(fmt CONFIG REQUIRED)
target_link_libraries(app PRIVATE fmt::fmt)
```

常见模式：

```cmake
find_package(OpenSSL REQUIRED)
target_link_libraries(app PRIVATE OpenSSL::SSL OpenSSL::Crypto)
```

导入第三方源码可以使用 `add_subdirectory`：

```cmake
add_subdirectory(third_party/somelib)
target_link_libraries(app PRIVATE somelib)
```

??? note "FetchContent 示例"

    `FetchContent` 可以在配置阶段拉取依赖。它使用方便，但会让配置过程依赖网络，更适合小项目或实验项目。

    ```cmake
    include(FetchContent)

    FetchContent_Declare(
        fmt
        GIT_REPOSITORY https://github.com/fmtlib/fmt.git
        GIT_TAG 11.0.2
    )
    FetchContent_MakeAvailable(fmt)

    target_link_libraries(app PRIVATE fmt::fmt)
    ```

## 安装

安装目标文件：

```cmake
install(TARGETS app
    RUNTIME DESTINATION bin
)
```

安装库和头文件：

```cmake
install(TARGETS core
    ARCHIVE DESTINATION lib
    LIBRARY DESTINATION lib
    RUNTIME DESTINATION bin
)

install(DIRECTORY include/ DESTINATION include)
```

执行安装：

```sh
cmake --install build --prefix install
```

## 常用变量

- `CMAKE_SOURCE_DIR`：顶层源码目录
- `CMAKE_BINARY_DIR`：顶层构建目录
- `CMAKE_CURRENT_SOURCE_DIR`：当前 `CMakeLists.txt` 所在源码目录
- `CMAKE_CURRENT_BINARY_DIR`：当前目录对应的构建目录
- `CMAKE_BUILD_TYPE`：单配置生成器的构建类型
- `CMAKE_INSTALL_PREFIX`：默认安装前缀
- `CMAKE_EXPORT_COMPILE_COMMANDS`：是否导出 `compile_commands.json`

生成 `compile_commands.json`：

```sh
cmake -S . -B build -DCMAKE_EXPORT_COMPILE_COMMANDS=ON
```

## 常用命令速查

重新配置：

```sh
cmake -S . -B build
```

并行构建：

```sh
cmake --build build --parallel
```

清理后构建：

```sh
cmake --build build --clean-first
```

指定生成器：

```sh
cmake -S . -B build -G Ninja
```

查看可用生成器：

```sh
cmake --help
```

打开详细构建输出：

```sh
cmake --build build --verbose
```
