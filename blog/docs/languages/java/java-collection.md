# Java集合

## Collection

Collection 集合体系：

- Collection&lt;E&gt;
    + List&lt;E&gt;
        * ArrayList&lt;E&gt;
        * LinkedList&lt;E&gt;
    + Set&lt;E&gt;
        * HashSet&lt;E&gt;
            - LinkedHashSet&lt;E&gt;
        * TreeSet&lt;E&gt;

其中 `Collection<E>`、`List<E>`、`Set<E>` 为接口，其余为实现类。

### 常用方法

- `public boolean add(E e)`：添加元素，添加成功返回 `true`
- `public void clear()`：清空集合元素
- `public boolean isEmpty()`：判断集合是否为空
- `public int size()`：获取集合大小
- `public boolean contains(Object obj)`：判断集合中是否包含某个元素
- `public boolean remove(E e)`：删除某个元素，默认删除首次出现的元素
- `public Object[] toArray()`：把集合转换成数组

### 遍历方式

#### 迭代器

Collection 集合获取迭代器的方法：

`Iterator<E> iterator()`，该迭代器默认指向集合的第一个元素

Iterator 的常用方法：

- `boolean hasNext()`：当前位置是否有元素存在
- `E next()`：获取当前位置元素，并将迭代器指向下一个元素

#### 增强 for

#### Lambda 表达式