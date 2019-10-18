### 前言
> 项目地址：https://github.com/zhengjunxiang/drap-sort

由于，项目中使用App混合开发，要实现频道编辑功能；在没找到合适的解决方案的情况下，自己写了这个库；已经在项目中跑了2年多，有不错的可用性；写下这篇文章分享下😁

### 启动项目

```
git clone https://github.com/zhengjunxiang/drap-sort.git && cd drap-sort
yarn install
yarn run dev
```

预览效果：
> 使用浏览器的 device toolbar 或手机浏览器浏览

![预览效果](https://user-gold-cdn.xitu.io/2019/10/18/16dddef56c7329e5?w=500&h=799&f=gif&s=786599)

### 使用样例说明
项目中的 [main.js](https://github.com/zhengjunxiang/drap-sort/blob/master/src/main.js) 使用样例：
```javascript
import './style/DragSort.less'
import './style/index.less'
import DragSort from './js/DragSort.js'

// 模拟从服务器请求回来后，当前显示的数据；
// editData：当前已选数据
// addData：所有数据
const editData = ['热点', '推荐', '最新', '科技', '国际'],
  addData = ['热点', '推荐', '最新', '科技', '娱乐', '体育', '军事', '影视', '星座', '美食', '音乐', '健身', '宠物', '问答', '旅行', '宗教', '历史', '国际'];
var instance = new DragSort({
  editCon: document.querySelector('#switchCoinExitCoinContent'),
  editData: editData,
  addCon: document.querySelector('#addCoinContent'),
  addData: addData
});

document.querySelector('#handleGetRet').onclick = function () {
  console.log(instance.returnEditData()); // ['热点', '推荐', '最新', '科技', ...]
}
```
引入该类，然后传入初始参数，实例化出实例 `instance` ；得到改实例后，在用户一顿操作后，调用实例 `instance` 的 `returnEditData` 方法，返回出当前编辑好的顺序数组。
### 参数说明
| 名称 | 是否必须 | 备注 | 类型 |
|------|------------|------------|---|
| editData  | 是    | 当前已选数据 | Array |
| addData  | 是     | 所有数据   | Array |
| editCon  | 是     | 编辑选项的容器 | String / Dom |
| addCon | 是  | 添加选项的容器 | String / Dom |
| animation| 否 | 动画设置 | String（default: 'all 0.2s ease'）|

### 结束语
仿头频道编辑功能效果比较复杂，该库实现的代码比较简单，没完全实现所有的效果，但基本满足开发需求；希望可以给到有相关需求的同学一些参考。TX