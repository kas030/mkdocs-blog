---
tags:
  - 组合数学
---

# 卡特兰数

卡特兰数（Catalan Number）是很多组合问题的数学模型。

卡特兰数第 $n$ 项通常记为 $C_n$，前几项为：

$$
1, 1, 2, 5, 14, 42, 132, \cdots
$$

其中 $C_0 = 1$，$C_1 = 1$。

## 常见公式

卡特兰数有三种常见计算方法。

第一种是使用组合数闭式：

$$
C_n
= \dfrac{1}{n + 1}\dbinom{2n}{n}
= \dbinom{2n}{n} - \dbinom{2n}{n + 1}
= \dbinom{2n}{n} - \dbinom{2n}{n - 1}
$$

!!! tip "为什么这几个形式是等价的？"

    因为
    $
    \dbinom{2n}{n + 1} = \dbinom{2n}{n - 1}
    $
    ，且
    $
    \dbinom{2n}{n + 1}
    = \dbinom{2n}{n} \cdot \dfrac{n}{n + 1}
    $
    ，所以
    $
    \dbinom{2n}{n} - \dbinom{2n}{n + 1}
    = \dfrac{1}{n + 1}\dbinom{2n}{n}
    $
    。

第二种是使用卷积递推式：

$$
C_n = \sum_{i = 0}^{n - 1} C_i C_{n - 1 - i}
$$

其中 $n \ge 1$，递推边界为 $C_0 = 1$。

第三种是使用相邻两项的递推式：

$$
C_n = \dfrac{4n - 2}{n + 1} C_{n - 1}
$$

其中 $n \ge 1$，递推边界同样为 $C_0 = 1$。

## 典型模型

很多看起来不同的问题，本质上都可以转化为卡特兰数。

### 不越过对角线的路径

从 $(0, 0)$ 走到 $(n, n)$，每一步只能向右或向上，并且路径不能越过直线 $y = x$ 的方案数为 $C_n$。

如果把向右看作左括号，向上看作右括号，那么“不越过对角线”就等价于任意前缀中向上的次数不超过向右的次数。

???+ note "André's Reflection 证明"

    先考虑从 $(0, 0)$ 走到 $(n, n)$ 的所有路径。

    每条路径一共需要走 $n$ 步向右和 $n$ 步向上，所以总方案数为：

    $$
    \dbinom{2n}{n}
    $$

    现在要求路径不能越过直线 $y = x$，也就是任意前缀中向上的步数不能超过向右的步数。

    不合法路径一定存在第一个位置，使得向上的步数比向右的步数多 $1$。设这个位置是第一次到达直线 $y = x + 1$ 的位置。

    对不合法路径中从起点到这个位置的前缀做反射：把这一段里的向右和向上互换。反射后，整条路径会变成一条从 $(-1, 1)$ 走到 $(n, n)$ 的路径。

    从 $(-1, 1)$ 到 $(n, n)$ 需要走 $n + 1$ 步向右和 $n - 1$ 步向上，总步数仍然是 $2n$，方案数为：

    $$
    \dbinom{2n}{n + 1}
    $$

    这个反射是双射，因此不合法路径数量为 $\dbinom{2n}{n + 1}$。所以合法路径数量为：

    $$
    C_n = \dbinom{2n}{n} - \dbinom{2n}{n + 1}
    $$

### 合法括号序列

由 $n$ 个左括号和 $n$ 个右括号组成的合法括号序列数量为 $C_n$。

把左括号看作向右走一步，右括号看作向上走一步。合法括号序列要求任意前缀中右括号数量不能超过左括号数量，这正好等价于路径始终不越过直线 $y = x$，因此方案数为卡特兰数。

### 栈出栈序列

有 $n$ 个元素按 $1, 2, \cdots, n$ 的顺序入栈，所有可能的合法出栈序列数量为 $C_n$。

可以把入栈看作左括号，出栈看作右括号。任何时刻都不能在栈为空时出栈，所以前缀中出栈次数不能超过入栈次数，这与合法括号序列完全对应。

### 二叉树形态数量

有 $n$ 个节点的不同二叉树形态数量为 $C_n$。

若根节点的左子树有 $i$ 个节点，那么右子树有 $n - 1 - i$ 个节点，因此：

$$
C_n = \sum_{i = 0}^{n - 1} C_i C_{n - 1 - i}
$$

这正好对应卡特兰数的递推式。

## 代码模板

当模数 `mod` 是质数，并且需要多次计算卡特兰数时，可以预处理阶乘和逆元。

```cpp linenums="1"
using i64 = long long;

i64 qpow(i64 a, i64 b, i64 mod) {
    i64 res = 1;
    while (b) {
        if (b & 1) res = res * a % mod;
        a = a * a % mod;
        b >>= 1;
    }
    return res;
}

struct Comb {
    int n;
    i64 mod;
    vector<i64> fac, ifac;

    Comb(int n, i64 mod) : n(n), mod(mod), fac(n + 1), ifac(n + 1) {
        fac[0] = 1;
        for (int i = 1; i <= n; i++) {
            fac[i] = fac[i - 1] * i % mod;
        }

        ifac[n] = qpow(fac[n], mod - 2, mod);
        for (int i = n; i >= 1; i--) {
            ifac[i - 1] = ifac[i] * i % mod;
        }
    }

    i64 C(int a, int b) {
        if (b < 0 || b > a) return 0;
        return fac[a] * ifac[b] % mod * ifac[a - b] % mod;
    }
};

i64 catalan(int n, Comb& comb) {
    return (comb.C(2 * n, n) - comb.C(2 * n, n + 1) + comb.mod) % comb.mod;
}
```

如果只需要计算单个 $C_n$，也可以使用：

$$
C_n = \dfrac{1}{n + 1}\dbinom{2n}{n}
$$

即：

```cpp linenums="1"
i64 catalan(int n, Comb& comb) {
    return comb.C(2 * n, n) * qpow(n + 1, comb.mod - 2, comb.mod) % comb.mod;
}
```
