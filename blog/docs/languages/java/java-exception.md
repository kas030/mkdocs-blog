# Java异常

## Java 异常体系

- Java.lang.Throwable
    + Error
        * 虚拟机错误 - VirtualMachineError
        * 内存溢出 - OutOfMemoryError
        * 线程死锁 - ThreadDeath
    + Exception
        * RuntimeException
            - 空指针异常 - NullPointerException
            - 数组下标越界异常 - ArrayIndexOutOfBoundsException
            - 算术异常 - ArithmeticException
            - 类型转换异常 - ClassCastExcepption
        * IO 异常 - IOException
        * SQL 异常 - SQLException
        * ...

**错误（Error）：** 无法被处理，属于严重问题。<br>
**异常（Exception）：** 可以被处理

- 运行时异常：`RuntimeException` 及其子类，运行时才会出现的异常。
- 编译时异常：`Exception` 及其子类，必须在编译时处理，否则程序无法通过编译。

## 自定义异常

### 运行时异常

定义一个异常类继承 `RuntimeException`，并重写构造器：

```java
public class 异常类 extends RuntimeException {
    public 异常类() {
    }
    public 异常类(String message) {
        super(message);
    }
}
```

通过 `throw new 异常类(...)` 来创建异常对象并抛出。

### 编译时异常

异常类改为继承 `Exception` 类，抛出异常的方法需要使用 `throws` 继续将编译时异常向上层抛出。

## 异常的处理

### 抛出异常（throws）

```java
方法 throws 异常1, 异常2, 异常3, ... {
    ...
}
```

或直接

```java
方法 throws Exception {
    ...
}
```

### 捕获异常（try...catch）

```java
try {
    ...
} catch(异常类型1 e) {
    ...
} catch(异常类型2 e) {
    ...
}
```

或直接

```java
try {
    ...
} catch(Exception e) {
    e.printStackTrace();
}
```
