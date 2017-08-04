class drapSort {
  constructor(opt) {
    this.editCon = (typeof opt.editCon === 'object' ? opt.editCon : document.querySelector(opt.editCon)) || null;
    this.addCon = (typeof opt.addCon === 'object' ? opt.addCon : document.querySelector(opt.addCon)) || null;
    this.editCoins = Object.prototype.toString.call(opt.editCoins) === "[object Array]" && [...opt.editCoins] || null;
    this.addCoins = Object.prototype.toString.call(opt.addCoins) === "[object Array]" && [...opt.addCoins] || null;
    this.W = 0;
    this.editConL = 0;
    this.editConT = 0;
    this.startX = 0;
    this.startY = 0;
    this.moveX = 0;
    this.moveY = 0;
    this.aniTimes = opt.aniTimes || 0.2;
    this.amount = 4;
    this.interval = 0;
    this.timer = null;
    this.state = 0; // 1: 移动中 2：触发对换位置
    this.offsetLeftItem = 0; // 拖动item时，拖动点相对于item的左上角的位置
    this.offsetTopItem = 0;
    this.Z = 1000;
    this.unit = 40;
    this.rowInt = 108;
    this.animation = opt.aniTimes ? `all ${opt.aniTimes}` : `all ${this.aniTimes}s ease`;
    this.activeCoinInfo = null; // 处于拖动元素的信息
    this.activeChangeInfo = null; // 处于准备被交换位置元素的信息
    // 存储editCoins每一个的有效触碰范围，和index值
    // eg: {BTC: {xL: 0, xR: 0, yT: 0, yB: 0, index: 0, dom: dom}};
    this.editCoinsInfo = {};
    this.isNeedReadAdd = true;
    this.init();
  }
  checkOptAndInit () {
    if (this.editCon === null) throw Error("获取挂载Dom节点失败");
    if (this.editCoins === null) throw Error("传入的数组不能为空");
    if (this.addCon === null || this.addCoins === null) this.isNeedReadAdd = false;
    this.W = this.editCon.offsetWidth;
    this.editConL = this.editCon.offsetLeft;
    this.editConT = this.editCon.offsetTop;
  }
  bindEventToEditCoins (editCoins) {
    [...editCoins].map((item, index) => {
      // 点击删除按钮触发删除
      item.children[0].addEventListener("touchstart", (event) => {
        event.stopPropagation();
        event.preventDefault();
        this.delEditCoins(item, index);
        this.reRenderEditCoins();
      })
      item.children[0].addEventListener("touchend", (event) => {
        event.stopPropagation();
        event.preventDefault();
      })
      item.addEventListener("touchstart", (event) => {
        this.startX = event.touches[0].pageX;
        this.startY = event.touches[0].pageY;
        event.preventDefault();
        this.state = 1;
        this.offsetLeftItem = this.startX - this.editConL - item.offsetLeft;
        this.offsetTopItem = this.startY - this.editConT - item.offsetTop;
        item.style.zIndex = ++this.Z;
        item.style.transform = "scale(1.1, 1.1)";
        item.style.WebkitTransform = "scale(1.1, 1.1)";
        item.style.opacity = 0.7;
        Object.keys(this.editCoinsInfo).map(name => {
          if (this.editCoinsInfo[name].index === index) {
            this.activeCoinInfo = this.editCoinsInfo[name];
          }
        })
        setTimeout(() => {
          item.style.transition = '';
          item.style.WebkitTransition = '';
        }, this.aniTimes*1000);
      }, false);

      item.addEventListener("touchmove", (event) => {
        event.preventDefault();
        const x = item.offsetLeft + item.offsetWidth / 2,
              y = item.offsetTop + item.offsetHeight / 2,
              itemIndex = index;
        this.moveX = event.touches[0].pageX;
        this.moveY = event.touches[0].pageY;
        Object.keys(this.editCoinsInfo).map(name => {
          const editCoinsItem = this.editCoinsInfo[name];
          if ((x >= editCoinsItem.xL) && (x <= editCoinsItem.xR) && (y >= editCoinsItem.yT) && (y <= editCoinsItem.yB)) {
            if ((editCoinsItem.index !== itemIndex) && (this.state !== 3)) {
              this.activeChangeInfo = editCoinsItem;
              this.state = 3;
              this.changeChangerPosition(editCoinsItem, 'change');
            }
          }
        })

        if (this.state === 3) {
          if ((x < this.activeChangeInfo.xL) || (x > this.activeChangeInfo.xR) ||
            (y < this.activeChangeInfo.yT) || (y > this.activeChangeInfo.yB)) {
            this.state = 1;
            this.changeChangerPosition(null, 'back');
          }
        }

        if (this.state === 1 || this.state === 3) {
          let left = this.moveX - this.editConL - this.offsetLeftItem;
          let top = this.moveY - this.editConT - this.offsetTopItem;
          if (left < -item.offsetWidth / 2) {
            left = -item.offsetWidth / 2;
          } else if (left > (this.W - item.offsetWidth / 2)) {
            left = this.W - item.offsetWidth / 2;
          }
          if (top < 0) {
            top = 0;
          } else if (top > (this.editCon.offsetHeight - item.offsetHeight)) {
            top = this.editCon.offsetHeight - item.offsetHeight;
          }
          item.style.left = left + 'px';
          item.style.top = top + 'px';
        }
      }, false);

      item.addEventListener("touchend", (event) => {
        event.preventDefault();
        item.style.transition = this.animation;
        item.style.WebkitTransition = this.animation;
        if (this.activeChangeInfo) {
           this.state = 2;
           this.readyChangePosition({dom: item, index}, this.activeChangeInfo);
           this.activeChangeInfo = null;
        }
        if (this.state !== 2) {
          item.style.left = this.activeCoinInfo.xL + 'px';
          item.style.top = this.activeCoinInfo.yT + 'px';
          item.style.transform = "scale(1, 1)";
          item.style.WebkitTransform = "scale(1, 1)";
          item.style.opacity = 1;
          setTimeout(() => {
            item.style.transition = '';
            item.style.WebkitTransition = '';
            this.activeCoinInfo = null;
            this.state = 0;
          }, this.aniTimes*1000);
        }
      }, false);
    });
  }
  bindEventToAddCoins (addCoins) {
    if (!this.isNeedReadAdd) return '';
    [...addCoins].map(addItem => {
      addItem.addEventListener('touchstart', (event) => {
        event.preventDefault();
        let judge = true;
        this.editCoins.map(editItem => {
          if (editItem === addItem.textContent) {
            judge = false;
          }
        })
        if (judge) {
          this.editCoins.push(addItem.textContent);
          this.reRenderEditCoins();
        }
      })
    })
  }
  setCoinsPosAndDomH (Coins, type) {
    if (!this.isNeedReadAdd && (type === 'add')) return '';
    if (Coins.length <= 0) return '';
    const len = Coins.length,
          W = this.W,
          itemW = Coins[0].offsetWidth,
          con = type === 'edit' ? this.editCon : this.addCon;
    this.interval = (W - this.amount*itemW) / (this.amount - 1);
    con.style.height = ((parseInt((len - 1)/this.amount) + 1) *108)/this.unit + 'rem';
    [...Coins].map((item, index) => {
      item.style.left = (this.interval + itemW) * (index - this.amount*(parseInt(index/this.amount)))  + 'px';
      item.style.top = (this.rowInt) * parseInt(index/this.amount)/this.unit + 'rem';
    });
  }
  renderEditCoinsHtml () {
    let html = '';
    this.editCon.innerHTML = html;
    this.editCoins.length > 0 ? this.editCoins.map(item => {
      html += `<span class="coin-btn editCoins">
      <i class="coin-btn-del">x</i>
      ${item}</span>`;
    }) : html = '';
    this.editCon.innerHTML = html;
  }
  renderAddCoinsHtml () {
    if (!this.isNeedReadAdd) return '';
    let html = '',
        addCoins = this.addCoins.filter(item => {
          let judge = false;
          this.editCoins.map(it => {
            it === item ? judge = true : null;
          });
          return !judge;
        });
    this.addCon.innerHTML = html;
    addCoins.map((item, index) => {
      html += `<span class="coin-btn addCoins">${item}</span>`;
    });
    this.addCon.innerHTML = html;
  }
  reRenderEditCoins () {
    this.renderEditCoinsHtml();
    this.renderAddCoinsHtml();
    const editCoins = document.querySelectorAll('.editCoins');
    const addCoins = document.querySelectorAll('.addCoins');
    this.bindEventToEditCoins(editCoins);
    this.bindEventToAddCoins(addCoins);
    this.setCoinsPosAndDomH(editCoins, 'edit');
    this.setCoinsPosAndDomH(addCoins, 'add');
    this.setEditCoinsInfo(editCoins);
  }
  setEditCoinsInfo (editCoins) {
    if (editCoins.length === 0) return '';
    this.editCoinsInfo = {};
    this.editCoins.map((name, index) => {
      const item = editCoins[index];
      this.editCoinsInfo[name] = {
        xL: item.offsetLeft,
        xR: item.offsetLeft + item.offsetWidth,
        yT: item.offsetTop,
        yB: item.offsetTop + item.offsetHeight,
        dom: item,
        index
      }
    })
  }
  readyChangePosition (origin, changer) {
    const oDom = origin.dom,
          cDom = changer.dom;
    oDom.style.left = changer.xL + 'px';
    oDom.style.top = changer.yT + 'px';
    cDom.style.left = this.activeCoinInfo.xL + 'px';
    cDom.style.top = this.activeCoinInfo.yT + 'px';
    this.activeCoinInfo = null;
    setTimeout(() => {
      this.updateEditCoins(origin.index, changer.index);
      this.reRenderEditCoins();
    }, this.aniTimes*1000);
  }
  changeChangerPosition (changer, type) {
    const cDom = changer && changer.dom || this.activeChangeInfo.dom;
    cDom.style.transition = this.animation;
    cDom.style.WebkitTransition = this.animation;
    if (type === 'change') {
      cDom.style.left = this.activeCoinInfo.xL + 'px';
      cDom.style.top = this.activeCoinInfo.yT + 'px';
    } else {
      cDom.style.left = this.activeChangeInfo.xL + 'px';
      cDom.style.top = this.activeChangeInfo.yT + 'px';
      this.activeChangeInfo = null;
    }
    setTimeout(() => {
      cDom.style.transition = '';
      cDom.style.WebkitTransition = '';
    }, this.aniTimes*1000);
  }
  delEditCoins (item, index) {
    item = null;
    this.editCoins.splice(index, 1);
  }
  updateEditCoins (originIndex, changerIndex) {
    const arr = [...this.editCoins],
          orN = arr[originIndex],
          chN = arr[changerIndex];
    arr[originIndex] = chN;
    arr[changerIndex] = orN;
    this.editCoins = arr;
  }
  setAnimationToItems (editCoins) {
    [...editCoins].map(item => {
      item.style.transition = this.animation;
      item.style.WebkitTransition = this.animation;
    });
  }
  returnEditCoins () {
    return this.editCoins;
  }
  init () {
    const editCoins = document.querySelectorAll('.editCoins');
    this.checkOptAndInit();
    this.reRenderEditCoins();
    this.setAnimationToItems(editCoins);
  }
}

export default drapSort;
