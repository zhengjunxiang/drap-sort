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
