---
tags:
  - 计算机图形学
---

# 变换

## 二维变换

线性变换：

$$\bm{x}' = \bm{M} \bm{x}$$

### 缩放（Scale）

坐标关系：

$$
\begin{aligned} x'&=sx\\ y'&=sy \end{aligned}
$$

写成矩阵形式：

$$
\begin{bmatrix} x'\\ y' \end{bmatrix} =
\begin{bmatrix} s & 0 \\ 0 & s \end{bmatrix}
\begin{bmatrix} x\\ y \end{bmatrix}
$$

非均匀（non-uniform）缩放：

$$
\begin{bmatrix} x'\\ y' \end{bmatrix} =
\begin{bmatrix} s_x & 0 \\ 0 & s_y \end{bmatrix}
\begin{bmatrix} x\\ y \end{bmatrix}
$$

### 镜像（Reflection）

水平镜像：

$$
\begin{bmatrix} x'\\ y' \end{bmatrix} =
\begin{bmatrix} -1 & 0 \\ 0 & 1 \end{bmatrix}
\begin{bmatrix} x\\ y \end{bmatrix}
$$

### 切变（Shear）

![shear](games101-assets/img/shear.png){ width="500" }
{.center-img}

矩阵形式：

$$
\begin{bmatrix} x'\\ y' \end{bmatrix} =
\begin{bmatrix} 1 & a \\ 0 & 1 \end{bmatrix}
\begin{bmatrix} x\\ y \end{bmatrix}
$$

可以理解为基变换为 $[1, 0]^\top$、$[a, 1]^\top$。

### 旋转（Rotate）

默认关于原点旋转，逆时针方向（CCW）。

![rotate](games101-assets/img/rotate.png){ width="500" }
{.center-img}

矩阵形式：

$$
\begin{bmatrix} x'\\ y' \end{bmatrix} =
\begin{bmatrix} \cos \theta & -\sin \theta \\ \sin \theta & \cos \theta \end{bmatrix}
\begin{bmatrix} x\\ y \end{bmatrix}
$$

从基变换的角度理解：

![rotate-basis](games101-assets/img/rotate-basis.png){ width="500" }
{.center-img}

基变换为 $[\cos \theta, \sin \theta]^\top$、$[-\sin \theta, \cos \theta]^\top$。

一个重要性质（正交性）：

$$\bm{R}_{-\theta} = \bm{R} _\theta ^{-1} = \bm{R} _\theta ^\top$$

## 齐次坐标

平移（translation）变换：

$$
\begin{aligned} x' &= x + t_x\\ y' &= y + t_y \end{aligned}
$$

不是线性变换，无法被表示为矩阵形式。为了避免其特殊性，我们引入齐次坐标（Homogeneous Coordinates）的概念。

添加第 3 个坐标（W 坐标）：

- 二维点表示为 $[x, y, 1] ^ \top$
- 二维向量表示为 $[x, y, 0] ^ \top$

这样平移变换的矩阵表示为：

$$
\begin{bmatrix} x'\\ y'\\ w' \end{bmatrix} =
\begin{bmatrix} 1 & 0 & t_x \\ 0 & 1 & t_y \\ 0 & 0 & 1 \end{bmatrix}
\begin{bmatrix} x\\ y\\ 1 \end{bmatrix} =
\begin{bmatrix} x + t_x\\ y + t_y\\ 1 \end{bmatrix}
$$

从基变换的角度可以理解为空间切变操作将整个 $z=1$ 平面进行了平移。

点和向量互相运算的结果：

- 向量 + 向量 = 向量
- 点 - 点 = 向量
- 点 + 向量 = 点

对于点于点之间的运算，我们规定：

$[x, y, w] ^ \top$ 表示二维点 $[x / w, y / w, 1] ^ \top$，$w \neq 0$，这样两个点相加的效果为取两个点的中点。

### 仿射变换

仿射变换（Affine Transformation）可以写成线性变换 + 平移变换的形式：

$$
\begin{bmatrix} x'\\ y' \end{bmatrix} =
\begin{bmatrix} a & b \\ c & d \end{bmatrix}
\begin{bmatrix} x\\ y \end{bmatrix} +
\begin{bmatrix} t_x\\ t_y \end{bmatrix}
$$

写成齐次坐标的形式：

$$
\begin{bmatrix} x'\\ y'\\ 1 \end{bmatrix} =
\begin{bmatrix} a & b & t_x \\ c & d & t_y \\ 0 & 0 & 1 \end{bmatrix}
\begin{bmatrix} x\\ y\\ 1 \end{bmatrix}
$$

## 逆变换和复合变换

$\bm{M} ^ {-1}$ 是 $\bm{M}$ 的逆矩阵，其对应变换互为逆变换。

矩阵乘法对应变换的复合：

![composite-transformation](games101-assets/img/composite-transformation.png){ width="600" }
{.center-img}

矩阵乘法不具有交换律，对应复合也没有交换律。

变换的应用顺序应按右结合顺序理解。矩阵乘法有结合律，矩阵先相乘得到的是复合变换对应的矩阵。

对 $\bm{x}$ 应用一个仿射变换序列 $A_1, A_2, A_3, \ldots$，可写为：

$$
A_n(\ldots A_2(A_1(\bm{x}))) = \bm{A_n} \cdots \bm{A_2} \cdot \bm{A_1} \cdot [x, y, 1] ^ \top 
$$

## 复杂变换的分解

绕着给定点 $\bm{c}$ 旋转可分解为：

![decomposing-transformation](games101-assets/img/decomposing-transformation.png)
{.center-img}

用矩阵表示为 $\bm{T}(\bm{c}) \cdot \bm{R}(\alpha) \cdot \bm{T}(-\bm{c})$。

## 三维变换

三维下的齐次坐标：

- 点表示为 $[x, y, z, 1] ^ \top$
- 向量表示为 $[x, y, z, 0] ^ \top$

$[x, y, z, w] ^ \top$ 表示三维点 $[x / w, y / w, z / w, 1] ^ \top$，$w \neq 0$。

三维下用 $4 \times 4$ 矩阵表示仿射变换：

$$
\begin{bmatrix} x'\\ y'\\ z'\\ 1 \end{bmatrix} =
\begin{bmatrix} a & b & c & t_x \\ d & e & f & t_y \\ g & h & i & t_z\\ 0 & 0 & 0 & 1 \end{bmatrix}
\begin{bmatrix} x\\ y\\ z\\ 1 \end{bmatrix}
$$

缩放矩阵：

$$
\bm{S}(s_x, s_y, s_z) =
\begin{bmatrix} s_x & 0 & 0 & 0 \\ 0 & s_y & 0 & 0 \\ 0 & 0 & s_z & 0\\ 0 & 0 & 0 & 1 \end{bmatrix}
$$

平移矩阵：

$$
\bm{T}(t_x, t_y, t_z) =
\begin{bmatrix} 1 & 0 & 0 & t_x \\ 0 & 1 & 0 & t_y \\ 0 & 0 & 1 & t_z\\ 0 & 0 & 0 & 1 \end{bmatrix}
$$

绕 $x$、$y$、$z$ 轴旋转矩阵：

$$
\bm{R}_x(\alpha) =
\begin{bmatrix} 1 & 0 & 0 & 0 \\ 0 & \cos\alpha & -\sin\alpha & 0 \\ 0 & \sin\alpha & \cos\alpha & 0\\ 0 & 0 & 0 & 1 \end{bmatrix}
$$

$$
\bm{R}_y(\alpha) =
\begin{bmatrix} \cos\alpha & 0 & \sin\alpha & 0 \\ 0 & 1 & 0 & 0 \\ -\sin\alpha & 0 & \cos\alpha & 0\\ 0 & 0 & 0 & 1 \end{bmatrix}
$$

$$
\bm{R}_z(\alpha) =
\begin{bmatrix} \cos\alpha & -\sin\alpha & 0 & 0 \\ \sin\alpha & \cos\alpha & 0 & 0 \\ 0 & 0 & 1 & 0\\ 0 & 0 & 0 & 1 \end{bmatrix}
$$

一般三维旋转用基本旋转的复合来处理：

$$\bm{R}_{xyz}(\alpha, \beta, \gamma) = \bm{R}_x(\alpha) \bm{R}_y(\beta) \bm{R}_z(\gamma)$$

其中 $\alpha, \beta, \gamma$ 被成为欧拉角。

对于绕轴 $\bm{n}$ 旋转角为 $\alpha$ 的旋转，使用罗德里格旋转公式（Rodrigues’ Rotation Formula）处理：

$$
\bm{R}(\bm{n},\alpha) = 
\cos(\alpha)\bm{I} +
(1-\cos(\alpha))\bm{n}\bm{n}^{\top} +
\sin(\alpha)\bm{N}$$

其中

$$
\bm{N} =
\begin{bmatrix} 0 & -n_z & n_y\\ n_z & 0 & -n_x\\ -n_y & n_x & 0 \end{bmatrix}
$$

对于轴不过原点的旋转，通过平移和旋转的复合处理。

##  观测变换

观测变换（viewing transformation）是指通过观测获得一张照片的过程：

- 模型变换（model transformation）
- 视图变换（view / camera transformation）
- 投影变换（projection transformation）

简称 MVP 变换。

### 视图变换

首先定义相机参数：

- 位置：$\bm{e}$
- 观测方向：$\hat{\bm{g}}$
- 向上方向：$\hat{\bm{t}}$

当相机和物体同时运动时，得到的照片保持不变，因此我们将相机固定在原点，观测方向为 $-z$，向上方向为 $y$：

![fixed-camera](games101-assets/img/fixed-camera.png){ width="650" }
{.center-img}
