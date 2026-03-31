---
tags:
  - ICPC
  - 根号分治
---

# 2025 ICPC Wuhan Invitational Contest - G Path Summing Problem

## 题目

???+ note "[QOj G. Path Summing Problem](https://qoj.ac/contest/2025/problem/10742)"

    There is a grid with $n$ rows and $m$ columns. Each cell of the grid has an integer in it, where $a_{i,j}$ indicates the integer in the cell located at the $i$-th row and the $j$-th column.
    
    Let $(i,j)$ be the cell located at the $i$-th row and the $j$-th column. You now start from $(1,1)$ and need to reach $(n,m)$. When you are in cell $(i,j)$, you can either move to its right cell $(i,j + 1)$ if $j < m$ or move to its bottom cell $(i + 1,j)$ if $i < n$.
    
    Let $\mathbb{S}$ be the set consisting of integers in each cell on your path, including $a_{1,1}$ and $a_{n,m}$. The value of a path is defined as the number of elements in $\mathbb{S}$ (recall that sets do not contain duplicated elements). For all possible paths, calculate the sum of their values.

    **Input**

    There are multiple test cases. The first line of the input contains an integer $T\ (1 \leq T \leq 10^3)$ indicating the number of test cases. For each test case:
    
    The first line contains two integers $n$ and $m\ (1 \leq n, m \leq 10^5,\ 1 \leq n\times m \leq 10^5)$ indicating the number of rows and columns of the grid.
    
    For the following $n$ lines, the $i$-th line contains $m$ integers $a_{i,1},a_{i,2},\ldots,a_{i,m}\ (1 \leq a_{i,j} \leq n\times m)$ where $a_{i,j}$ indicates the integer in cell $(i,j)$.

    It's guaranteed that the sum of $n \times m$ of all test cases will not exceed $10^5$.

    **Output**

    For each test case, output one line containing one integer indicating the sum of values of all possible paths. As the answer might be large, output it modulo $998\,244\,353$.

???+ abstract "样例"

    === "输入"
    
        ```text linenums="1"
        3
        2 3
        5 2 1
        1 5 5
        1 1
        1
        2 3
        3 3 3
        3 3 3
        ```
    
    === "输出"
    
        ```text linenums="1"
        7
        1
        3
        ```

## 分析

### 两种方法

考虑计算每个格子的贡献．

当一条路径第一次经过数字 $a_{i,j}$ 时，格子 $(i,j)$ 就产生了 $1$ 的贡献．因此，格子 $(i,j)$ 对最终答案的贡献等于：从 $(1,1)$ 走到 $(i,j)$ 不经过数字 $a_{i,j}$ 的路径数，乘以从 $(i,j)$ 走到 $(n,m)$ 的路径数．

其中从 $(x_1,y_1)$ 走到 $(x_2,y_2)$ 的路径数等于 $\displaystyle \binom{x_2+y_2-x_1-y_1}{x_2-x_1}$，可以 $\mathcal{O}(nm)$ 递推预处理得到，也可以计算组合数．

对所有格子求贡献相加即可．

???+ tip "为什么路径数可以这样计算？"

    从 $(x_1,y_1)$ 走到 $(x_2,y_2)$ 一共有 $x_2+y_2-x_1-y_1$ 步，其中有 $x_2-x_1$ 步可以选择向下走，剩下 $y_2-y_1$ 选择向右走，因此可以用组合数计算．

现在问题变为：如何求从 $(1,1)$ 走到 $(i,j)$ 不经过数字 $a_{i,j}$ 的路径数．

设一共有 $t\ (1\leq t\leq nm)$ 种不同的数字，数字 $d$ 一共有 $k$ 个．有两种方法，复杂度依赖于 $t$ 和 $k$．

**方法一：DP**

定义 $dp_{i,j}$ 表示从 $(1,1)$ 走到 $(i,j)$ 不经过数字 $d$ 的路径数，有

$$dp_{i,j}=\begin{cases}dp_{i-1,j}+dp_{i,j-1},&a_{i,j}\neq d\\0,&a_{i,j}=d\end{cases}，$$

最后某个元素 $d$ 贡献就等于 $\displaystyle \binom{n+m-2}{n-1}-dp_{n,m}$，即从起点到终点的路径数减不经过 $d$ 的路径数．

单次 DP 的复杂度为 $\mathcal{O}(nm)$，对所有不同元素求和，总复杂度为 $\mathcal{O}(t\cdot nm)$．

**方法二：容斥**

设第 $i$ 个数字 $d$ 位于格子 $(x_i,y_i)$，其中 $1\leq i\leq k$．

设 $f_i$ 表示从 $(1,1)$ 到 $(x_i,y_i)$ 不提前经过数字 $d$ 的路径数，有

$$f_i=\binom{x_i+y_i-2}{x_i-1}-\sum_{j\in S_i} f_j \cdot \binom{x_i+y_i-x_j-y_j}{x_i-x_j}，$$

其中 $S_i=\{\, j \mid x_j \le x_i,\; y_j \le y_i \,\}$，即所有在 $(x_i,y_i)$ 左上角的相同数字．计算时按行列顺序求各点的 $f$ 值，这样左上角点的 $f$ 值会先被求出．

对一种元素求解的复杂度为 $\mathcal{O}(k^2)$，总复杂度为 $\mathcal{O}(t\cdot k^2)$

### 根号分治

对于前面两种方法，最坏的情况下无论哪种都会退化到 $\mathcal{O}[(nm)^2]$．因此考虑使用根号分治，可以将复杂度限制在 $\mathcal{O}(nm\sqrt{nm})$．

即：对于 $k\leq \sqrt{nm}$ 的元素，使用第二种方法；对于其他元素，使用第一种方法．

**复杂度证明**

设集合 $L=\{\, k \mid k_i\le \sqrt{nm}\,\},\; |L|=s\ (s\leq t)$，即有 $s$ 种不同数字满足 $k\leq \sqrt{nm}$，则有

$$
T_1=\mathcal{O}\!\left(\sum_{k\in L} k^2 \le (\max L)\sum_{k\in L} k \le nm\sqrt{nm}\right)；
$$

对于数量 $k>\sqrt{nm}$ 的数字，最多有 $\displaystyle \frac{\ \ \ nm}{\sqrt{nm}}=\sqrt{nm}$ 个，每个求解的复杂度为 $\mathcal{O}(nm)$，总时间复杂度为 $T_2=\mathcal{O}(nm\sqrt{nm})$．

???+ code "完整代码"

    ```cpp linenums="1"
    --8<-- "oi/2025-icpc-wuhan-invitational-contest-g-assets/solution.cpp"
    ```
