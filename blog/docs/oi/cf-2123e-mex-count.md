---
tags:
  - 算法
  - C++
  - Codeforces
---

# Codeforces 2123E MEX Count

## 题目

???+ note "[2123E MEX Count](https://codeforces.com/problemset/problem/2123/E)"

    定义一个数组的 $\mathrm{MEX}$ 值为：数组中最小的未出现的非负整数。例如：

    - $\mathrm{MEX}([2, 2, 1]) = 0$，因为 $0$ 不在这个数组中。
    - $\mathrm{MEX}([3, 1, 0, 1]) = 2$，因为 $0$ 和 $1$ 在数组中但 $2$ 不在。
    - $\mathrm{MEX}([0, 3, 1, 2]) = 4$，因为 $0, 1, 2, 3$ 都在数组中，但 $4$ 不在。

    给定一个含 $n$ 个非负整数的数组 $a$，对于所有 $k \ (0 \le k \le n)$，计算从 $a$ 中移除 $k$ 个值后 $\mathrm{MEX}(a)$ 可能的取值个数。

**输入：**

第一行为一个整数 $t \ (1 \le t \le 10^4)$，表示数据组数。接下来是 $t$ 组数据。对于每组数据：

第一行为一个整数 $n \ (1 \le n \le 2 \cdot 10^5)$，表示数组的大小。

第二行为 $n$ 个整数，$a_1, a_2, \cdots , a_n \ (0 \le a_i \le n)$。

保证所有 $n$ 之和不超过 $2 \cdot 10^5$。

**输出：**

对于每组数据，输出一行，包含 $n + 1$ 个整数，分别表示移除 $k$ 个值后 $\mathrm{MEX}(a)$ 可能的取值个数，其中 $k = 0, 1, \cdots , n$。

???+ abstract "样例"

    === "输入"

        ```text linenums="1"
        5
        5
        1 0 0 1 2
        6
        3 2 0 4 5 1
        6
        1 2 0 1 3 2
        4
        0 3 4 1
        5
        0 0 0 0 0
        ```

    === "输出"

        ```text linenums="1"
        1 2 4 3 2 1
        1 6 5 4 3 2 1
        1 3 5 4 3 2 1
        1 3 3 2 1
        1 1 1 1 1 1
        ```

## 分析

首先很容易发现删除 $0$ 个值（即不删除值）时 $\mathrm{MEX}$ 值是唯一的。

此时要么 $\exists p \in [0, n], \ \forall i \in \left[0, p \right), \ i \in a$ 并且 $p \notin a$ ；要么 $0 \notin a$。后一种情况下答案显然全是 $1$，后面忽略。

然后考虑 $k > 0$ 的情况。

对于 $a$ 中所有小于 $p$ 的值，如果出现的次数不多于 $k$，则都可以被删完，每删完一个值都会产生一个新的 $\mathrm{MEX}$。

出现次数多于 $k$ 的数和大于 $p$ 的数，删除后都不影响 $\mathrm{MEX}$。

但这并不完全正确。

例如考虑 $a = [0, 1, \cdots, n-1]$ 的情况，删除多于一个数都会让最初的 $\mathrm{MEX} = n$ 无法取到，也就是说删除后不影响 $\mathrm{MEX}$ 值的数不够删了（此例中没有删除后不影响 $\mathrm{MEX}$ 值的数），因此还要统计一下这些数的个数。

在 $k$ 较大时，这些数可以作为缓冲，如果把这些数删完后 $k$ 还有剩余，则需要相应减少 $\mathrm{MEX}$ 的可能数。

## 代码实现

由于 $a$ 中数值范围较小，可以直接统计一下出现次数：

```cpp linenums="1"
vector<int> v(n + 1);
for (int i = 1; i <= n; i++) {
    int x;
    cin >> x;
    v[x]++;
}
```

然后计算 $p$。$b_i$ 表示出现次数小于等于 $i$ 的数的个数，$l$ 和 $r$ 分别表示下小于和大于 $p$ 的数的个数，$u$ 为删除后不影响 $\mathrm{MEX}$ 值的数的个数。

```cpp linenums="1"
int p, l{};
vector<int> b(n + 1);
for (p = 0; p <= n; p++) {
    if (!v[p]) break;
    b[v[p]]++;
    l += v[p];
}
for (int i = 1; i <= n; i++) {
    b[i] += b[i - 1];
}
int r = n - l, s1 = l - p;
int u = s1 + r;
```

最后当 $u \ge k$ 时答案为 $b_k + 1$，否则为 $p + u - k + 1$。
根据变量间的关系，表达式实际上还可以化简，只需要知道 $p$ 的值即可。

??? code "完整代码"

    ```cpp linenums="1"
    --8<-- "oi/cf-2123e-mex-count-assets/code/solution.cpp"
    ```
