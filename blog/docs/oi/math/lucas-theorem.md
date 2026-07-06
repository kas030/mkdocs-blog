---
tags:
  - 算法
  - 数学
  - 组合数学
---

# 卢卡斯定理

卢卡斯定理（Lucas Theorem）用于在模质数 $p$ 的意义下快速计算组合数：

$$
\binom{n}{m} \bmod p
$$

当 $n$、$m$ 很大，但模数 $p$ 是质数且相对较小时，它尤其常用。

!!! tip "适用条件"

    这里的模数 $p$ 必须是质数。若模数不是质数，需要考虑扩展卢卡斯定理或使用其他组合数取模方法。

## 定理内容

把 $n$ 和 $m$ 写成 $p$ 进制：

$$
n = n_kp^k + n_{k - 1}p^{k - 1} + \cdots + n_1p + n_0
$$

$$
m = m_kp^k + m_{k - 1}p^{k - 1} + \cdots + m_1p + m_0
$$

其中 $0 \le n_i, m_i < p$。则有：

$$
\binom{n}{m} \equiv \prod_{i = 0}^{k} \binom{n_i}{m_i} \pmod p
$$

如果某一位上 $m_i > n_i$，则这一项组合数为 $0$，整体结果也为 $0$。

## 递归写法

根据 $p$ 进制拆位，卢卡斯定理也可以写成更适合代码实现的递归形式：

$$
\binom{n}{m} \equiv \binom{n \bmod p}{m \bmod p}
\cdot
\binom{\left\lfloor n / p \right\rfloor}{\left\lfloor m / p \right\rfloor}
\pmod p
$$

注意上式中第二个组合数是在递归意义下继续计算。更准确地说：

$$
Lucas(n, m) =
\binom{n \bmod p}{m \bmod p}
\cdot Lucas(\left\lfloor n / p \right\rfloor, \left\lfloor m / p \right\rfloor)
\pmod p
$$

递归边界为 $m = 0$，此时答案为 $1$。

## 定理证明

考虑二项式展开：

$$
(1 + x)^n = \sum_{i = 0}^{n} \binom{n}{i} x^i
$$

在模质数 $p$ 的意义下，由于对 $1 \le i \le p - 1$，都有 $p \mid \dbinom{p}{i}$，所以：

$$
(1 + x)^p \equiv 1 + x^p \pmod p
$$

进一步可得：

$$
(1 + x)^{p^i} \equiv 1 + x^{p^i} \pmod p
$$

把 $n$ 写成 $p$ 进制：

$$
n = n_kp^k + n_{k - 1}p^{k - 1} + \cdots + n_1p + n_0
$$

则：

$$
\begin{aligned}
(1 + x)^n
&= \prod_{i = 0}^{k} (1 + x)^{n_ip^i} \\
&\equiv \prod_{i = 0}^{k} (1 + x^{p^i})^{n_i} \pmod p
\end{aligned}
$$

展开右侧，每一项 $x^m$ 的系数来自于从第 $i$ 个因子中选出 $m_i$ 个 $x^{p^i}$：

$$
m = m_kp^k + m_{k - 1}p^{k - 1} + \cdots + m_1p + m_0
$$

因此 $x^m$ 的系数为：

$$
\prod_{i = 0}^{k} \binom{n_i}{m_i}
$$

而左侧 $x^m$ 的系数是 $\dbinom{n}{m}$，所以：

$$
\binom{n}{m} \equiv \prod_{i = 0}^{k} \binom{n_i}{m_i} \pmod p
$$

## 代码模板

当 $p$ 是质数时，可以先用阶乘和逆元预处理 $0 \sim p - 1$ 范围内的组合数，再递归套用卢卡斯定理。

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

i64 C(i64 n, i64 m, i64 p, const vector<i64>& fac, const vector<i64>& ifac) {
    if (m < 0 || m > n) return 0;
    return fac[n] * ifac[m] % p * ifac[n - m] % p;
}

i64 lucas(i64 n, i64 m, i64 p, const vector<i64>& fac, const vector<i64>& ifac) {
    if (m == 0) return 1;
    return C(n % p, m % p, p, fac, ifac) * lucas(n / p, m / p, p, fac, ifac) % p;
}
```

预处理部分：

```cpp linenums="1"
vector<i64> fac(p), ifac(p);

fac[0] = 1;
for (int i = 1; i < p; i++) {
    fac[i] = fac[i - 1] * i % p;
}

ifac[p - 1] = qpow(fac[p - 1], p - 2, p);
for (int i = p - 2; i >= 0; i--) {
    ifac[i] = ifac[i + 1] * (i + 1) % p;
}
```
