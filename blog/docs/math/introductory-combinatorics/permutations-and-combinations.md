# 排列与组合

## 四个基本计数原理

集合划分的定义：

<div class="math-def" data-title="集合的划分" markdown="1">

集合 $S$ 的一个{{abbr:划分|partition}}是满足下面条件的 $S$ 的子集 $S_1,S_2,\ldots,S_m$ 的集合：

$$
S=S_1\cup S_2\cup \cdots S_m\\
S_i\cap S_j=\varnothing\quad(i\neq j)
$$

</div>

集合 $S$ 的对象数目记作 $|S|$，有时称之为 $S$ 的{{abbr:大小|size}}。

<div class="math-thm" data-title="加法原理" markdown="1">

设集合 $S$ 被划分成两两不相交的部分 $S_1,S_2,\ldots,S_m$，则 $S$ 的对象数目可以通过确定它的每一个部分的对象数目并相加得到：

$$
|S|=|S_1|+|S_2|+\cdots+|S_m|
$$

</div>

运用加法原理的技巧是把集合分成少量的易处理部分。

<div class="math-thm" data-title="乘法原理" markdown="1">

令 $S$ 是对象的有序对 $(a,b)$ 的集合，其中 $a$ 来自大小为 $p$ 的一个集合，对于 $a$ 的每个选择，对象 $b$ 有 $q$ 种选择，则：

$$
|S|=p\times q
$$

</div>

乘法原理可以推广到任意有限多个集合的情形。

<div class="math-thm" data-title="减法原理" markdown="1">

令 $A$ 是一个集合，$U$ 是包含 $A$ 的更大集合。设

$$
\bar{A}=U\setminus A=\{x\in U \colon x\notin A\}
$$

是 $A$ 在 $U$ 中的{{abbr:补|complement}}，那么

$$
|A|=|U| - |\bar{A}|
$$

</div>

应用减法原理时，集合 $U$ 通常是包含讨论中所有对象的某个自然集合，即{{abbr:泛集|universal set}}。

<div class="math-thm" data-title="除法原理" markdown="1">

令 $S$ 是一个有限集合，把它划分成 $k$ 个大小相同的部分，设每部分大小为 $t$，则

$$
k=\frac{|S|}{t}
$$

</div>

在计数问题中，有时候不区分是否允许对象重复，而区分是从集合还是{{abbr:多重集合|multiset}}中进行选择会更方便。

通常我们通过指出不同元素出现的次数给出多重集合：$M=\{3\cdot a,\ 1\cdot b,\ 2\cdot c,\ 4\cdot d\}$，数 $3,1,2,4$ 是多重集合 $M$ 的重复数。允许有无限大的重复数。

## 集合的排列

$n$ 元素集合 $S$ 的 $r$ 排列表示 $n$ 个元素中 $r$ 个元素的有序放置。例如 $S=\{a,b,c\}$，则 $S$ 有 $6$ 个 $2$ 排列：

$$ab\quad ac\quad ba\quad bc\quad ca\quad cb$$

<div class="math-thm" markdown="1">

对于 $n,r\in \mathbb{Z}^+$，我们用 $P(n,r)$ 表示 $n$ 元素集合的 $r$ 排列的数目。若 $r\leqslant n$，有

$$
P(n,r)=\frac{n!}{(n-r)!}=n\times(n-1)\times\cdots\times(n-r+1)
$$

</div>

$n$ 元素集合 $S$ 的 $n$ 排列可简称为 $S$ 的排列或 $n$ 个元素的排列。

除了线性排列，还有循环排列：

<div class="math-thm" markdown="1">

$n$ 元素集合的循环 $r$ 排列的数目是

$$
\frac{P(n,r)}{r}=\frac{n!}{r\cdot(n-r)!}
$$

</div>

## 集合的组合（子集）

集合 $S$ 的一个组合表示集合 $S$ 的元素的一个无序选择，选择的结果是 $S$ 的元素构成的一个{{abbr:子集|subset}}。

设 $r\in\mathbb{N}$，$n$ 元素集合 $S$ 的一个 $r$ 组合表示在 $S$ 的 $n$ 个对象中选取 $r$ 个对象的一个无序选择。一个 $r$ 组合的结果是 $S$ 的一个 $r$ 子集。

我们用 $\dbinom{n}{r}$ 表示 $n$ 元素集合的 $r$ 子集的数目。

<div class="math-thm" markdown="1">

对于 $0\leqslant r\leqslant n$，有

$$
\binom{n}{r}=\frac{n!}{r!(n-r)!}
$$

</div>

可以直接推出一个重要性质：

<div class="math-cor" markdown="1">

对于 $0\leqslant r\leqslant n$，有

$$
\binom{n}{r}=\binom{n}{n-r}
$$

</div>

还有两个重要性质：

<div class="math-thm" data-title="帕斯卡公式" markdown="1">

对于 $1\leqslant k\leqslant n-1$，有

$$
\binom{n}{k}=\binom{n-1}{k}+\binom{n-1}{k-1}
$$

</div>

<div class="math-thm" markdown="1">

对于 $n\geqslant 0$，有

$$
\binom{n}{0}+\binom{n}{1}+\binom{n}{2}+\cdots+\binom{n}{n}=2^n
$$

</div>

可以从 $n$ 元素集合的子集数量的两种计数方式理解。

## 多重集合的排列

如果 $S$ 是一个多重集合，$S$ 的一个 $r$ 排列是 $S$ 中 $r$ 个对象的一个有序放置。若 $S$ 的对象总数是 $n$，$S$ 的 $n$ 排列也称为 $S$ 的排列。

无限重复数多重集合排列数：

<div class="math-thm" markdown="1">

设 $S$ 是有 $k$ 种不同类型对象的多重集合，每个元素都有无限重复数，则 $S$ 的 $r$ 排列的数目是 $k^r$。

</div>

有限重复数多重集合排列数：

<div class="math-thm" id="thm-multiset-permutation" markdown="1">

设 $S$ 是多重集合，有 $k$ 种不同类型的对象，对象分别具有有限重复数 $n_1,n_2,\ldots,n_k$。设 $S$ 的大小为 $n=n_1+n_2+\cdots+n_k$，则 $S$ 的排列数为 $\dfrac{n!}{n_1!n_2!\cdots n_k!}$。

</div>

这个排列数还有另外一种解释：

<div class="math-thm" markdown="1">

设 $n\in\mathbb{Z}^+$，并设 $n_1,n_2,\ldots,n_k$ 是正整数且 $n=\sum_{i=1}^k n_i$。把 $n$ 对象集合划分成 $k$ 个有标签的盒子，且第 $i$ 个盒子中有 $n_i$ 个对象，这样的划分方法数等于

$$
\frac{n!}{n_1!n_2!\cdots n_k!}
$$

如果这些盒子没有标签，且 $n_1=n_2=\cdots=n_k$，则划分数等于

$$
\frac{n!}{k!n_1!n_2!\cdots n_k!}
$$

</div>

## 多重集合的组合

设 $S$ 是一个多重集合，$S$ 的 $r$ 组合是 $S$ 中 $r$ 个对象的无序选择。$S$ 的一个 $r$ 组合的结果是 $S$ 的一个多重 $r$ 子集。

所有元素重复数无限的多重集合的 $r$ 组合数有：

<div class="math-thm" id="thm-multiset-combination" markdown="1">

设 $S$ 是有 $k$ 种类型对象的多重集合，每种元素均具有无限重复数。则 $S$ 的 $r$ 组合数等于

$$
\binom{r+k-1}{r}=\binom{r+k-1}{k-1}
$$

</div>

<div class="math-proof" markdown="1">

设 $S=\{\infty\cdot a_1,\ \infty\cdot a_2,\ \ldots,\ \infty\cdot a_k\}$，其中 $x_1,x_2,\ldots,x_k$ 皆为非负数，且 $x_1+x_2+\cdots+x_k=r$。$S$ 的 $r$ 组合个数等于方程

$$
x_1+x_2+\cdots+x_k=r
$$

解的个数。使用插板法易得，解的个数为多重集合

$$
T=\{r\cdot 1,\ (k-1)\cdot *\}
$$

的排列的个数。由 <a class="math-ref" href="#thm-multiset-permutation"></a> 可知这个结果为

$$
\frac{(r+k-1)!}{r!(k-1)!}=\binom{r+k-1}{r}
$$

</div>


注意，$S$ 的 $k$ 个不同对象重复数都至少是 $r$ 时 <a class="math-ref" href="#thm-multiset-combination"></a> 仍成立。

## 有限概率

设有一个实验 $\epsilon$，进行此实验产生的结果是某有限结果集合中的一个。假设每个结果都是{{abbr:等可能的|equally likely}}，则称这个实验是随机的。所有可能结果的集合被称为{{abbr:样本空间|sample space}}，记作 $S$。

设 $S=\{s_1,s_2,\ldots,s_n\}$，则有 $\mathrm{Prob}(s_i)=1/n\quad(i=1,2,\ldots,n)$。

一个{{abbr:事件|event}}是样本空间 $S$ 的一个子集 $E$，我们有：

$$
\mathrm{Prob}(E)=\frac{|E|}{|S|},\quad 0\leqslant\mathrm{Prob}(E)\leqslant 1
$$

其中 $\mathrm{Prob}(E)=0$ 当且仅当 $E$ 是一个空事件 $\varnothing$，而 $\mathrm{Prob}(E)=1$ 当且仅当 $E=S$。

有限概率问题最终将被还原为计数问题。
