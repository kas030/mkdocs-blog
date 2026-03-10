# Java正则表达式

String 提供了以下方法进行正则表达式匹配：

```java
public boolean matches(String regex);
```

## 书写规则

### 字符类

匹配单个字符。

| 表达式         | 匹配内容           |
| -------------- | ------------------ |
| `[abc]`        | a、b或c            |
| `[^abc]`       | 除了a、b或c（补）  |
| `[a-zA-Z]`     | a到z或A到Z（范围） |
| `[a-d[m-p]]`   | a到d或m到p（并）   |
| `[a-z&&[def]]` | d、e或f（交）      |
| `[a-z&&[^bc]]` | a到z除b和c（减）   |

<!--more-->

### 预定义字符

匹配单个字符。

| 预定义字符 | 匹配内容   |
| ---------- | ---------- |
| `.`        | 任何字符   |
| `\d`       | 数字       |
| `\D`       | 非数字     |
| `\s`       | 空白字符   |
| `\S`       | 非空白字符 |
| `\w`       | 单词字符   |
| `\W`       | 非单词字符 |

> 单词字符：`[a-zA-Z_0-9]`

### 数量词

| 表达式   | 匹配内容              |
| -------- | --------------------- |
| `X?`     | X，0次或1次           |
| `X*`     | X，0次或多次          |
| `X+`     | X，1次或多次          |
| `X{n}`   | X，n次                |
| `X{n,}`  | X，至少n次            |
| `X{n,m}` | X，至少n次，不超过m次 |

### 其他符号

- `(?i)`：忽略大小写
- `|`：或
- `()`：分组

## 应用

### 内容查找

???+ note "案例"

    ```java linenums="1"
    String data = "...";
    String regex = "...";
    Pattern pattern = Pattern.compile(regex);
    Matcher matcher = pattern.matcher(data);
    while(matcher.find()) {
        System.out.println(matcher.group());
    }
    ```

### 搜索替换、分割内容

String 提供了以下方法用于替换、分割内容：

- `public String replaceAll(String regex, String newStr)`：按照正则表达式匹配的内容进行替换
- `public String[] split(String regex)`：按照正则表达式匹配的内容进行分割字符串，返回字符串数组

???+ note "案例：将重复字符只保留一个"

    ```java linenums="1"
    String st = "aaabbccccc";
    st = st.replaceAll("(.)\\1+", "$1"); // (1)!
    ```

    1.  `\\1` 用于声明组号