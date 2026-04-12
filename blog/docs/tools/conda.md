# Conda

## 基础环境操作

查看所有环境：

```sh
conda env list
```

或者

```sh
conda info --envs
```

创建新环境：

```sh
conda create --name <env-name> python=<version>
```

激活环境：

```sh
conda activate <name>
```

退出当前环境：

```sh
conda deactivate
```

删除环境：

```sh
conda remove --name <env-name> --all
```

## 管理包

在激活某个环境后，可以安装需要的包。

安装包：

```sh
conda install <package>[=<version>]
```

查看已安装的包：

```sh
conda list
```

卸载包：

```sh
conda remove <package>
```

更新包：

```sh
conda update <package>
```

## 导出与共享

导出配置文件 (environment.yml)：

```sh
conda env export > environment.yml
```

通过配置文件创建环境：

```sh
conda env create -f environment.yml
```
