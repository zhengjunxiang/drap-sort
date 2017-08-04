import './style/dragSort.less'
import dragSort from './js/dragSort.js'

// 模拟从服务器请求回来后，当前显示的币种；
// editCoins：当前存在的币种
// addCoins：所有币种
const editCoins = ['BTC', 'LTC', 'ETH', 'ZEC'],
      addCoins = ['BTC', 'LTC', 'ETH', 'ZEC', 'GXS', 'DASH'];
let dragSortObj = null;
dragSortObj = new dragSort({
  editCon: document.querySelector('#switchCoinExitCoinContent'),
  editCoins: editCoins,
  addCon: document.querySelector('#addCoinContent'),
  addCoins: addCoins
});
