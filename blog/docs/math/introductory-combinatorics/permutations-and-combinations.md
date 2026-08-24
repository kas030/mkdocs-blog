# 排列与组合

## 四个基本计数原理

集合划分的定义：

<div class="math-def" markdown="1">

**集合的划分**

集合 $S$ 的一个划分是满足下面条件的 $S$ 的子集 $S_1,S_2,\ldots,S_m$ 的集合：

$$
S=S_1\cup S_2\cup \cdots S_m\\
S_i\cap S_j=\varnothing\quad(i\neq j)
$$

</div>

集合 $S$ 的对象数目记作 $|S|$，有时称之为 $S$ 的大小。

<div class="math-thm" markdown="1">

**加法原理**

设集合 $S$ 被划分成两两不相交的部分 $S_1,S_2,\ldots,S_m$，则 $S$ 的对象数目可以通过确定它的每一个部分的对象数目并相加得到：

$$
|S|=|S_1|+|S_2|+\cdots+|S_m|
$$

</div>

运用加法原理的技巧是把集合分成少量的易处理部分。

<div class="math-thm" markdown="1">

**乘法原理**

令 $S$ 是对象的有序对 $(a,b)$ 的集合，其中 $a$ 来自大小为 $p$ 的一个集合，对于 $a$ 的每个选择，对象 $b$ 有 $q$ 种选择，则：

$$
|S|=p\times q
$$

</div>

乘法原理可以推广到任意有限多个集合的情形。
