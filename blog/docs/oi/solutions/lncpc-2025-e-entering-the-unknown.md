---
tags:
  - LNCPC
  - 前缀和
---

# LNCPC 2025 E Entering the unknown

## 题目

???+ note "[E. Entering the unknown](https://codeforces.com/gym/106380/problem/E)"

    Given an array of positive integers of length $n$, determine how many **non-empty subarrays** $^{\text{*}}$ satisfy the following condition: the sum of the elements in the subarray is divisible by the largest **digit** $^{\text{†}}$ appearing in the subarray.

    $^{\text{*}}$ An array $a$ is a non-empty subarray of array $b$ if and only if $a$ can be obtained by deleting zero or more elements from the beginning of $b$ and zero or more elements from the end of $b$, and $a$ contains at least one element.

    $^{\text{†}}$ A digit refers to any of the numbers $0,1,2,3,4,5,6,7,8,9$ that compose a number. For example, the array $[213]$ contains the digits $1,2,3$, so the largest digit is $3$; the array $[2025,11,15]$ contains the digits $0,1,2,5$, so the largest digit is $5$.
    
**输入：**

Each test contains multiple test cases. The first line contains an integer $T(1 \le T \le 10^4)$, indicating the number of test cases.

For each test case:

The first line gives an integer $n(1\le n\le 10^5)$, representing the array length.

The second line contains $n$ positive integers $x_1, x_2, \ldots, x_n$ ($1 \le x_i \le 10^9$), representing the array.

It is guaranteed that the sum of all $n$ values across all test cases does not exceed $10^5$.

**输出：**

For each test case, output one line containing an integer representing the number of non-empty subarrays that satisfy the condition.

???+ abstract "样例"

    === "输入"
    
        ```text linenums="1"
        2
        3
        213 12 21
        7
        314 880 246 170 493 474 129
        ```
    
    === "输出"
    
        ```text linenums="1"
        4
        7
        ```

## 分析

把问题按最大数字 $d \in \{1, \ldots, 9\}$ 分类，对于每个 $d$ 统计子数组中最大数字等于 $d$ 且子数组和能被 $d$ 整除的子数组数，然后把结果加起来

注意到：对于固定的 $d$，任何包含最大数字 $>d$ 的元素的子数组都不是可行解，
因此把数组按「元素的最大数字是否 $>d$」分割成若干段，段内所有元素的最大数字都 $\leq d$．

在每一段内我们只需计算：

- 所有和能被 $d$ 整除的子数组总数
- 不包含任何最大数字等于 $d$ 的元素，且和能被 $d$ 整除的子数组总数

两者之差就是该段中含有最大数字等于 $d$ 的元素并且和能被 $d$ 整除的子数组数量．
对所有段求和，再对 $d = 1 \ldots 9$ 求和就是答案．

对于第二点，可在段内再按「元素的最大数字是否 $=d$」分段，更小的段内所有元素的最大数字都严格 $<d$．两者计算方式是相同的，只有分段标准不同．

下面考虑如何求某一段内和能被 $d$ 整除的子数组总数．

先计算出原数组在模 $d$ 意义下的前缀和 $P[0..n]$，即 $P_t \equiv \sum_{i=1}^t a_i \pmod{d}$．特别的，令 $P_0=0$．

设当前需要计算的段区间为 $[L, R]$，在区间 $[L-1, R]$ 上统计所有模值出现的次数．设模值 $r \in [0, d)$ 出现的次数为 $c_r$，则再这一段上和能被 $d$ 整除的非空子数组总数为

$$\sum_{r=0}^{d-1}\binom{c_r}{2}=\sum_{r} \frac{c_r(c_r-1)}{2},$$

因为任意一对相同模值的前缀对应一个和可被 $d$ 整除的子数组．

???+ code "完整代码"

    ```cpp linenums="1"
    --8<-- "oi/solutions/lncpc-2025-e-entering-the-unknown-assets/code/solution.cpp"
    ```
