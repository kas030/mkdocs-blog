# Java 基础

## 基本知识

### JRE 和 JDK

关系：

![JRE 和 JDK 的关系](java-basic-assets/img/p1-light.svg#only-light)
![JRE 和 JDK 的关系](java-basic-assets/img/p1-dark.svg#only-dark)

### IDEA 管理 java 程序的结构

> 1. project
> 2. module
> 3. package
> 4. class

### Hello World

???+ code "代码"

    ```java linenums="1" title="HelloWorld.java"
    --8<-- "languages/java/java-basic-assets/code/HelloWorld.java"
    ```

注意：

- 文件名必须与类名一致
- 编译：`javac HelloWorld.java`
- 运行：`java HelloWorld`
- Java11 开始可以直接用 `java` 命令运行源代码

## 语法基础

### 注释

- 单行注释 `//`
- 多行注释
  ```java
  /*
  ...
  */
  ```
- 文档注释
  ```java
  /**
   * ...
   */
  ```

### 数据类型

<table>
    <tr>
        <th align="center" colspan="2">类型</th>
        <th align="center">字节数</th>
    </tr>
    <tr>
        <td align="center" rowspan="4">整型</td>
        <td align="center">byte</td>
        <td align="center">1</td>
    </tr>
    <tr>
        <td align="center">short</td>
        <td align="center">2</td>
    </tr>
    <tr>
        <td align="center">int</td>
        <td align="center">4</td>
    </tr>
    <tr>
        <td align="center">long</td>
        <td align="center">8</td>
    </tr>
    <tr>
        <td align="center" rowspan="2">浮点型</td>
        <td align="center">float</td>
        <td align="center">4</td>
    </tr>
    <tr>
        <td align="center">double</td>
        <td align="center">8</td>
    </tr>
    <tr>
        <td align="center">字符型</td>
        <td align="center">char</td>
        <td align="center">2</td>
    </tr>
    <tr>
        <td align="center">布尔型</td>
        <td align="center">boolean</td>
        <td align="center">1</td>
    </tr>
</table>

### 字面量

- 整数，小数，字符，字符串，布尔值与 C++ 基本相同
- 空值：`null`
- 二进制字面量以 `0b` 或 `0B` 开头，十六进制字面量以 `0x` 或 `0X` 开头
- 整型字面量默认为 `int` 类型，浮点型字面量默认为 `double` 类型。
- `long` 字面量后缀为 `l` 或 `L`
- `float` 字面量后缀为 `f` 或 `F`

### 类型转换

- **自动类型转换：** <br> 范围小的变量可直接赋值给范围大的变量，包括初始化。
- **类型提升：** <br> 与 C++ 类似。`byte`，`short`，`char` 会直接转换为 `int` 类型运算。
- **强制类型转换：** <br> 范围大的变量不能直接赋值给范围小的变量，需要强制转换。但复合赋值运算符会**隐式**强制类型转换。

### 运算符

- `+` 可作为连接符：能加就加，不能加就转换为字符串连接。
- `=` 赋值运算符不能隐式收缩转换
- `? :` 三元运算符与 C++ 相同

### Scanner

当使用的类不是 `java.lang` 包中的时，需要导入。

`Scanner` 位于 `java.util.Scanner`。

创建 `Scanner`：

```java
Scanner sc = new Scanner(System.in);
```

| 方法                      | 作用                               |
| ------------------------- | ---------------------------------- |
| `String nextLine()`       | 读取下一行输入                     |
| `String next()`           | 读取下一个单词                     |
| `int nextInt()`           | 读取下一个整数                     |
| `double nextDouble()`     | 读取下一个浮点数                   |
| `boolean hasNext()`       | 检测输入流中是否还有单词           |
| `boolean hasNextInt()`    | 检测下一个字符序列是否是一个整数   |
| `boolean hasNextDouble()` | 检测下一个字符序列是否是一个浮点数 |

### 随机数

`Random` 位于 `java.util.Random`。

生成 0 ~ 99 间的随机数：

```java
Random r = new Random();
int rs = r.nextInt(100);
```

### 数组

**声明和创建：**

```java
int[] a;
int[] b = new int[100]; //动态
int[] c = new int[]{1, 2, 3}; //静态
int[] d = {4, 5, 6}; //简写
```

静态初始化和动态初始化时独立的，不能混用：

```java
int[] a = new int[3]{1, 2, 3}; //错误
```

动态初始化数组时，数值类型元素会初始化为 `0` 或 `false`，对象类型元素初始化为 `null`。

**数组长度：** `a.length`

数组拷贝会引用同一个数组对象。

### 访问修饰符

**对成员修饰：**

|  修饰符   |        本类         |    同包中其他类     |    任意包中子类     |   任意包中任意类    |
| :-------: | :-----------------: | :-----------------: | :-----------------: | :-----------------: |
|  private  | :octicons-check-24: |   :octicons-x-24:   |   :octicons-x-24:   |   :octicons-x-24:   |
|   默认    | :octicons-check-24: | :octicons-check-24: |   :octicons-x-24:   |   :octicons-x-24:   |
| protected | :octicons-check-24: | :octicons-check-24: | :octicons-check-24: |   :octicons-x-24:   |
|  public   | :octicons-check-24: | :octicons-check-24: | :octicons-check-24: | :octicons-check-24: |

**对类修饰：**

|修饰符|可见性|
|:---:|:---:|
|private|不允许声明|
|默认|同一包内的类|
|protected|不允许声明|
|public|所有类|

## 常用 API

### String

**构造器：**

- `String()`
- `String(String original)`
- `String(char[] chars)`
- `String(byte[] bytes)`

**常用方法：**

- `int length()`
- `char charAt(int index)`
- `char[] toCharArray()`
- `boolean equals(Object anObject)`
- `boolean equalsIgnoreCase(String anotherString)`
- `String substring(int beginIndex, int endIndex)`
- `String substring(int beginIndex)`
- `String replace(CharSequence target, CharSequence replacement)`
- `boolean contains(CharSequence s)`
- `boolean startsWith(String prefix)`
- `String[] split(String regex)`

### ArrayList&lt;E&gt;

**构造器：**

- `ArrayList()`：创建一个初始容量为 10 的数组列表
- `ArrayList(int initialCapacity)`

**常用方法：**

- `boolean add(E e)`：成功返回 `true`
- `E get(int index)`
- `void add(int index, E element)`
- `int size()`
- `E remove(int index)`：返回被删除的元素
- `boolean remove(Object o)`：删除指定元素，返回之前是否存在
- `E set(int index, E element)`：返回被修改的元素

注意，`ArrayList` 不能使用基本数据类型，要使用对应的包装类。

### Object 类

- `public String toString()`：
    - 默认得到地址
    - 重写后改变输出
- `public boolean equals(Object o)`：
    - 默认比较地址，与 `==` 作用相同
    - 一般重写为比较内容
- `protected Object clone()`：
    - 默认无法通过子类对象访问
    - 需要重写，提供 `public` 修饰符
    - 不可变成员可以直接浅拷贝
    - 要实现 `Cloneable` 接口，这是一个标记接口

### Objects 类

- `public static boolean equals(Object a, Object b)`：先做 `null` 判断，再比较两个对象
- `public static boolean isNull(Object obj)`：等价于 `obj == null`
- `public static boolean nonNull(Object obj)`：等价于 `obj != null`

### 包装类

`int` 类型对应的包装类是 `Integer`，`char` 是 `Character`，其他基本类型只需要首字母大写。

`Integer.valueOf(int i)`：会对小范围整数对象进行缓存，效率更高。因此构造器被弃用。

自动装箱、拆箱：直接与 `int` 混用。

常用方法：

- `public static String toString(int i)`：转换为字符串
- `public static String toString(int i, int radix)`：转换为目标进制字符串
- `public String toString()`：在包装类对象上调用
- `public static int parseInt(String s)`：转换为整数
- `public static Integer valueOf(String s)`：转换为整数并装箱
- `public static int parseInt(String s, int radix)`：某进制字符串转换为整数
- `public static Integer valueOf(String s, int radix)`：某进制字符串转换为整数并装箱

### StringBuilder 和 StringBuffer

#### StringBuilder

**构造器：**

- `StringBuilder()`：空构建器，初始容量为 16 字符
- `StringBuilder(int capacity)`：指定初始容量
- `StringBuilder(CharSequence seq)`：指定初始内容为 `seq`
- `StringBuilder(String str)`：指定初始内容为 `str`

**常用方法：**

- `StringBuilder append(...)`：支持追加各种类型数据，返回对象本身
- `StringBuilder reverse()`：反转内容
- `int length()`：返回长度
- `String toString()`：转换为字符串

#### StringBuffer

- 用法与 `StringBuilder` 相同
- 区别是 `StringBuffer` 是线程安全的

### StringJoiner

从 JDK 8 开始加入，有些场景下操作字符串更简洁。

**构造器：**

- `StringJoiner(间隔符号)`
- `StringJoiner(间隔符号, 开始符号, 结束符号)`

**常用方法：**

- `StringJoiner add(添加内容)`：添加数据，并返回对象本身
- `int length()`
- `String toString()`

### Math

- `int abs(int a)`
- `double ceil(double a)`
- `double floor(double a)`
- `int round(float a)`
- `int max(int a, int b)`
- `double pow(double a, double b)`
- `double random()`：随机值范围 $\left[\,0, 1\right)$

### System

- `void exit(int status)`：实际调用的是 `Runtime` 对象的方法
- `long currentTimeMillis()`：返回 `1970-1-1 0:00` 到当前的毫秒数

### Runtime

代表程序的运行环境，是一个单例类。可以使用 `getRuntime()` 方法获得当前运行时对象。

**常见方法：**

- `void exit(int status)`
- `int availableProcessors()`：返回 Java 虚拟机可用的处理器数
- `long totalMemory()`：返回虚拟机中的内存总量
- `long freeMemory()`：返回虚拟机中的可用内存
- `Process exec(String commnad)`：启动某个程序，并返回代表该程序的对象

### BigDecimal

**构造器：**

- `BigDecimal(double val)`：不推荐
- `BigDecimal(String val)`

**常用方法：**

- `static BigDecimal(double val)`
- 运算：`add`、`substract`、`multiply`、`divide`
- `BigDecimal divide(对象, 精度, 舍入模式)`
- `double doubleValue()`

除法如果不能精确表示结果会产生异常，必须指定如何舍入。<br>
四舍五入：`RoundingMode.HALF_UP`。

### JDK 8 之前的日期和时间

#### Date

**构造器：**

- `Date()`：构造一个 `Date` 对象，代表当前日期和时间
- `Date(long time)`：由时间毫秒值构造日期对象

**常用方法：**

- `long getTime()`：返回时间毫秒数
- `void setTime(long time)`：设置对象时间为时间毫秒数对应的时间

#### SimpleDateFormat

**构造器：**

- `SimpleDateFormat(String pattern)`：创建对象并封装时间的格式

**格式描述方法：**

|  y  |  M  |  d  |  H  |  m  |  s  | EEE  |     a     |
| :-: | :-: | :-: | :-: | :-: | :-: | :--: | :-------: |
| 年  | 月  | 日  | 时  | 分  | 秒  | 星期 | 上午/下午 |

示例用法：`"yyyy年MM月dd日 HH:mm:ss EEE a"`

**常用方法：**

- `final String format(Date date)`：将日期格式化为日期/时间字符串
- `final String format(Object time)`：将时间毫秒值格式化为日期/时间字符串
- `Date parse(String source)`：把字符串时间解析成日期对象，格式不一致会抛出异常

### JDK 8 之后的日期和时间

#### 对比

- JDK 8 之前：都是可变对象，线程不安全，只能精确到毫秒
- JDK 8 之后：都是不可变对象，线程安全，能精确到毫秒、纳秒

#### 新增的 API

<table>
    <tr>
        <th>作用</th>
        <th colspan="2">API</th>
    </tr>
    <tr>
        <td rowspan="5">代替 Calendar</td>
        <td>LocalDate</td>
        <td>年、月、日、星期</td>
    <tr>
        <td>LocalTime</td>
        <td>时、分、秒、纳秒</td>
    </tr>
    <tr>
        <td>LocalDateTime</td>
        <td>两者结合</td>
    </tr>
    <tr>
        <td>ZoneId</td>
        <td>时区</td>
    </tr>
    <tr>
        <td>ZoneDateTime</td>
        <td>带时区的时间</td>
    </tr>
    <tr>
        <td>代替 Date</td>
        <td>Instant</td>
        <td>时间戳/时间线</td>
    </tr>
    <tr>
        <td>代替 SimpleDateFormat</td>
        <td>DateTimeFormatter</td>
        <td>时间格式化和解析</td>
    </tr>
    <tr>
        <td rowspan="2">其他补充</td>
        <td>Period</td>
        <td>时间间隔（年、月、日）</td>
    </tr>
    <tr>
        <td>Duration</td>
        <td>时间间隔（时、分、秒、纳秒）</td>
    </tr>
</table>

#### LocalDate、LocalTime 和 LocalDateTime

**获取对象：** 调用静态方法 `now()` 方法获取当前时间对应的对象

**用法：**

**LocalDate：**

- 输出：`年-月-日`
- 获取对象中的信息：
  - 年：`getYear()`
  - 月：`getMonthValue()`
  - 日：`getDayOfMonth()`
  - 一年中的第几天：`getDayOfYear()`
  - 星期几：`getDayOfWeek().getValue()`
- 修改某个信息：`withYear`、`withMonth`、`withDayOfMonth`、`withDayOfYear`
- 把某个信息加多少：`plusYears`、`plusMonths`、`plusDays`、`plusWeeks`
- 把某个信息减多少：改成 `minus`
- 获取指定日期的对象：`LocalDate.of(年, 月, 日)`
- 比较两个日期对象：`equals`、`isBefore`、`isAfter`

**LocalTime：**

- 输出：`时:分:秒.纳秒`
- 获取对象中的信息：`getHour`、`getMinute`、`getSecond`、`getNano`
- 修改某个信息：改成 `with`
- 加减：`plus`、`minus`
- 比较：同上

**LocalDateTime：**

- 输出：`年-月-日T时:分:秒.纳秒`
- 包含前两者的方法
- 转换：
  - `toLocalDate()`
  - `toLocalTime()`
  - `of(LocalDate date, LocalTime time)`

#### ZoneId 和 ZoneDateTime

**ZoneId：**

- 获取系统默认时区：使用 `static ZoneId systemDefault()` 获取 `ZoneId` 对象，使用 `String getId()` 方法获取时区。默认以 `getId` 内容输出。
- 获取 Java 支持的全部时区 Id：`static Set<String> getAvailableZoneIds()`
- 把某个时区 Id 封装成 ZoneId 对象：`static ZoneId of(String zoneId)`

**ZoneDateTime：** 带时区的时间

- 获取某个时区的 ZoneDateTime 对象：`static ZoneDateTime now(ZoneId zone)`
- 获取系统默认时区的 ZoneDateTime 对象：`static ZoneDateTime now()`
- 获取世界标准时间：`ZoneDateTime.now(Clock.systemUTC())`
- 其他方法与 LocalDateTime 相同

#### Instant

通过 Instant 可以拿到此刻的时间，包括从 1970 开始的总秒数和不够一秒的纳秒数。

**常用方法：**

- `static Instant now()`： 获取当前 Instant 对象
- `long getEpochSecond()`：获取 1970 开始的秒数
- `int getNano()`：获取不足一秒的纳秒数
- 增加时间：`plusSeconds`、`plusMillis`、`plusNanos`
- 减少时间：改为 `minus`
- 比较时间：`equals`、`isBefore`、`isAfter`

#### DateTimeFormatter

**常用方法：**

- `static DateTimeFormatter ofPattern(时间格式)`：获取格式化器对象
- `String format(时间对象)`：格式化时间

时间对象也可以调用自己的 `format` 方法，传入一个 DateTimeFormatter 对象。

解析时间：一般用 LocalDateTime 提供的方法解析，调用 `static parse(字符串, 格式化器)`。

#### Period

用于计算两个 LocalDate 对象相差的年、月、日。

**常用方法：**

- 得到 Period 对象：`static Period between(LocalDate start, LocalDate end)`
- 得到间隔：`getYears`、`getMonths`、`getDays`

#### Duration

用于计算相差的天数、时、分、秒、纳秒。支持 LocalTime、LocalDateTime、Instant。

**常用方法：**

- 得到对象：`static Duration between(开始对象, 截止对象)`
- 计算间隔：`toDays`、`toHours`、`toMinutes`、`toSeconds`、`toMillis`、`toNanos`

### Arrays

用于操作数组的一个工具类。

**常用方法：**

- `static String toString(T[] arr)`：返回数组内容
- `static T[] copyOfRange(T[] arr, int begin, int end)`：拷贝数组
- `static T[] copyOf(T[] arr, int newLength)`：拷贝数组，不足的数据会值初始化
- `static void setAll(T[] arr, IntFunction<? extends T> generator)`：把数组中原数据修改为新数据
- `static void sort(T[] arr)`：排序

**排序：**

自定义排序规则：

- 实现 `Comparable<T>` 接口，重写 `compareTo(T o)` 方法
- 使用 `static <T> void sort(T[] arr, Comparator<? super T> c)`

## 面向对象高级

### 初始化块

**静态代码块：**

- 格式：`static {...}`
- 类加载时执行

**实例代码块：**

- 格式：`{...}`
- 执行流程：
    1. 执行委托构造
    2. 将所有实例字段值初始化
    3. 按照类中声明顺序，执行字段初始化和初始化块
    4. 执行构造器主体代码

### 单例模式

**饿汉式单例**：拿对象时，已经创建好了

```java linenums="1"
public class A {
    private static A instance = new A();
    private A() {}
    public static A getInstance() {
        return instance;
    }
}
```

**懒汉式单例**：拿对象时，才创建对象

```java linenums="1"
public class A {
    private static A instance;
    private A() {}
    public static A getInstance() {
        if (instance == null) {
            instance = new A();
        }
        return instance;
    }
}
```

### 方法重写

与 C++ 不同，不需要使用 `virtual` 即可重写方法。

可以使用 `@Override` 注解检查重写是否正确，与 Python 装饰器使用格式相同。

重写支持协变返回类型。

重写 `toString()` 方法可改变默认输出。

重写方法的访问权限必须大于等于父类被重写方法的访问权限。私有方法，静态方法不能重写。

### 成员隐藏

子类与父类同名的成员会隐藏父类的成员，可使用 `super` 访问。

局部变量也会隐藏成员变量，可使用 `this` 访问。

### 子类构造器

- 子类构造器都会先调用父类构造器
- 默认调用父类无参构造器
- 可使用 `super(...)` 调用父类其他构造器，尤其是父类没有无参构造器的时候

### final

- 修饰类：不能被继承
- 修饰方法：不能被重写
- 修饰变量：只能被赋值一次

**常量：**

使用 `static final` 修饰的成员变量被称为常量。
编译后，常量会被宏替换。

### 抽象类

- 抽象类中不一定有抽象方法，包含抽象方法的一定要被声明为抽象类
- 抽象类不能创建实例，但可以创建抽象类的对象变量（指针）
- 没有抽象方法的抽象类也不能创建实例
- 子类重写全部抽象方法后，就可以去掉 `abstract` 修饰

### 接口

**语法格式：**

```java
public interface 接口名  {
    // 成员变量（常量，不用加 public static final）
    // 成员方法（抽象方法，不用加 public abstract）
}
```

接口中所有方法都自动是 `public` 方法。

接口不能创建对象，用于被类实现，实现接口的类被称为实现类：

```java
访问修饰符 class 实现类 implements 接口1, 接口2, ... {
    ...
}
```

实现类必须重写全部接口的全部抽象方法，否则需要被定义为抽象类。

- **默认方法** (since JDK 8)：用 `default` 修饰，带有方法体。可通过实现类调用。
- **私有方法** (since JDK 9)：用 `private` 修饰，可在其他方法中访问。
- **静态方法** (since JDK 8)：用 `static` 修饰，可通过接口名调用。

### 内部类

#### 成员内部类

**使用内部类的原因：**

- 内部类可以对同一个包中的其他类隐藏
- 内部类可以访问外部类中定义的私有数据

```java
public class Outer {
    public class Inner {
        ...
    }
}
```

在类的内部定义的类，基本与类相同。JDK 16 开始支持在内部类中定义静态成员。

内部类实例只能由外部类实例创建，有一个对创建它的外部类实例的隐式引用。

内部类可以是私有的。

- 外部类引用：`OuterClass.this`
- 构造内部类对象：`outerObject.new InnerClass(...)`
- 在外部类作用域之外表示内部类：`OuterClass.InnerClass`

#### 静态内部类

**使用静态内部类的原因：**

- 把一个类隐藏在一个类的内部
- 不需要内部类有外部类对象的引用

```java
public class Outer {
    public static class Inner {
        ...
    }
}
```

构造静态内部类对象：`new OuterClass.InnerClass()`

#### 局部内部类

在一个方法中可定义局部内部类，对外界完全隐藏。

声明局部类时不能有访问说明符。

#### 匿名内部类

**格式：**

```java
new 类或接口(构造参数...) {
    类体(一般是方法重写);
}
```

匿名内部类是一个子类，并且会立即创建一个子类对象。

不能有任何构造参数，参数会直接传递给超类构造器。可以有初始化块。

匿名内部类在开发中通常直接作为参数传递给方法。

### 枚举

**语法格式**：

```java
修饰符 enum 枚举类名 {
    名称1, 名称2, ...;
    其他成员...
}
```

- 枚举类的第一行只能是一些名称，都是常量，表示枚举类对象
- 枚举类的构造器都是私有的
- 枚举都是最终类，不能被继承
- 枚举类继承 `java.lang.Enum` 类
- 在 `switch` 中使用枚举时**不用**枚举类前缀

假设有 `public enum A`，常用方法：

- `A[] values()`：拿到全部枚举对象
- `A valueOf(String name)`：根据名字获得枚举对象
- `String object.name()`：枚举对象名
- `int object.ordinal()`：枚举对象索引

#### 抽象枚举

???+ example "示例"

    ```java linenums="1"
    public enum Color {
        R("Red") {
            @Override
            public void dipict() {
                System.out.println(getName() + ": #ff0000");
            }
        },
        G("Green") {
            @Override
            public void dipict() {
                System.out.println(getName() + ": #00ff00");
            }
        },
        B("Blue") {
            @Override
            public void dipict() {
                System.out.println(getName() + ": #0000ff");
            }
        };

        private String name;

        Color(String name) {
            this.name = name;
        }

        public abstract void dipict();

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
    ```

### 泛型

**泛型类：**

```java
修饰符 class 类名<类型1, 类型2, ...> {
    ...
}
```

**泛型接口：**

```java
修饰符 interface 接口名<类型1, 类型2, ...> {
    ...
}
```

**泛型方法**：

```java
修饰符 <类型1, 类型2, ...> 返回值类型 方法名(形参列表) {
    ...
}
```

显式指定类型参数： `<类型1, 类型2, ...>方法名(形参列表)`。

**类型变量限定：**

使用 `<T extends ...>` 限定类型变量，限定类型用 `&` 分隔。

限定可以有多个接口，但只能有一个类，且必须是限定列表中的第一个。

类型擦除后，原始类型为第一个限定。为提高效率，应将标记接口（没有方法的接口）放在限定列表的末尾。

**通配符类型：**

- 任意类型：`<?>`
- 子类型限定：`<? extends ...>`
  - set 方法：只能传入子类型的子类型，范围不确定，无法使用
  - get 方法：返回值是 `?` 的子类型，可用 `?` 及其超类型接收
- 超类型限定：`<? super ...>`
  - set 方法：可传递 `?` 超类型的子类型，故 `?` 的子类型一定能传递
  - get 方法：返回值是 `?` 的超类型，范围不确定，只能用 `Object` 接收

**泛型限制：**

大多数限制都是由类型擦除引起的。

- 不能用基本类型作为类型参数
- `instanceof` 只检查原始类型是否匹配，对泛型类型使用可能得到编译错误或警告
- 不能创建参数化类型（`class<T>`）的数组
- 不能实例化类型变量（`new T()`）
- 不能构造泛型数组（`new T[n]`）
- 不能在静态方法或字段中使用类型变量

## JDK8 新特性

### Lambda 表达式

**作用：** 简化函数式接口匿名内部类的代码写法

> 函数式接口：只有一个抽象方法的接口<br>
> 通常加 `@FunctionalInterface` 注解，有该注解的必定是函数式接口

**格式：**

```java
(被重写方法的形参列表) -> {
    被重写方法的方法体代码;
}
```

**省略写法：**

- 参数类型可以不写
- 如果只有一个参数，参数类型可以省略，同时 `()` 也可以省略
- 如果方法体代码只有一行，可以省略 `{}`，同时要省略分号；如果这行代码是 `return` 语句，也必须去掉 `return` 不写

### 方法引用

#### 静态方法引用

如果一个 Lambda 表达式里只是调用一个静态方法，并且前后参数形式一致，就可以使用静态方法引用。

格式：`类名::静态方法`

#### 实例方法引用

如果一个 Lambda 表达式里只是调用一个实例方法，并且千后参数形式一致，就可以使用实例方法引用。

格式：`对象名::实例方法`

#### 特定类型方法引用

如果一个 Lambda 表达式里只是调用一个实例方法，并且前面参数列表中的第一个参数是作为方法的主调，后面的所有参数都是作为该方法的入参，则可以使用特定类型方法引用。

格式：`类型::方法`

???+ example "示例：忽略字符串大小写排序"

    ```java linenums="1"
    // 原代码
    Arrays.sort(names, new Comparator<String>() {
        @Override
        public int compare(String o1, String o2) {
            return o1.compareToIgnoreCase(o2);
        } 
    });

    // 简化
    Arrays.sort(names, (o1, o2) -> o1.compareToIgnoreCase(o2));

    // 特定类型方法引用
    Arrays.sort(names, String::compareToIgnoreCase);
    ```

#### 构造器引用

如果一个 Lambda 表达式里只是在创建对象，并且前后参数情况一致，就可以使用构造器引用。

格式：`类名::new`
