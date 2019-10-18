class DropSort {
  constructor(opt) {
    this.editCon = (typeof opt.editCon === 'object' ? opt.editCon : document.querySelector(opt.editCon)) || null;
    this.addCon = (typeof opt.addCon === 'object' ? opt.addCon : document.querySelector(opt.addCon)) || null;
    this.editData = Object.prototype.toString.call(opt.editData) === "[object Array]" && [...opt.editData] || null;
    this.addData = Object.prototype.toString.call(opt.addData) === "[object Array]" && [...opt.addData] || null;
    this.W = 0;
    this.editConL = 0;
    this.editConT = 0;
    this.amount = 4;
    this.interval = 0; // 初始化时，每个item的左右间距
    this.timer = null;
    this.state = 0; // 1: 移动中 2：触发对换位置
    this.offsetLeftItem = 0; // 拖动item时，拖动点相对于item自身的左上角的位置
    this.offsetTopItem = 0;
    this.Z = 1000;
    this.unit = 40;
    this.rowInt = 108;
    this.animation = opt.animation || 'all 0.2s ease';
    this.activeItemInfo = null; // 处于拖动元素的信息
    this.activeChangeInfo = null; // 处于准备被交换位置元素的信息
    // 存储editData每一个的有效触碰范围，和index值
    // eg: {XXX: {xL: 0, xR: 0, yT: 0, yB: 0, index: 0, dom: dom}};
    this.editDataInfo = {};
    this.init();
  }
  init () {
    this.checkOptAndInit();
    this.render();
  }
  checkOptAndInit () {
    if (this.editCon === null) throw Error("获取挂载Dom节点失败");
    if (this.editData === null) throw Error("传入的数组不能为空");
    this.W = this.editCon.offsetWidth;
    this.editConL = this.editCon.offsetLeft;
    this.editConT = this.editCon.offsetTop;
  }
  render () {
    this.renderEditDataHtml();
    this.renderAddDataHtml();
    const editData = document.querySelectorAll('.editData');
    const addData = document.querySelectorAll('.addData');
    this.setDataPosAndDomH(editData, 'edit');
    this.setDataPosAndDomH(addData, 'add');
    this.setEditDataInfo(editData);
    this.bindEventToEditData(editData);
    this.bindEventToAddData(addData);
  }
  renderEditDataHtml () {
    let html = '';
    this.editData.length > 0 ? this.editData.map(item => {
      html += `<span class="drag-sort-item editData"><i class="drag-sort-item-del">x</i>${item}</span>`;
    }) : html = '';
    this.editCon.innerHTML = html;
  }
  renderAddDataHtml () {
    let html = '', addData = this.addData.filter(item => this.editData.indexOf(item) === -1);
    addData.map(item => html += `<span class="drag-sort-item addData">${item}</span>`);
    this.addCon.innerHTML = html;
  }
  setDataPosAndDomH (data, type) {
    if (data.length <= 0) return '';
    const len = data.length, itemW = data[0].offsetWidth;
    this.interval = (this.W - this.amount*itemW) / (this.amount - 1);
    (type === 'edit' ? this.editCon : this.addCon).style.height = ((parseInt((len - 1)/this.amount) + 1) *108)/this.unit + 'rem';
    [...data].map((item, index) => {
      item.style.left = (this.interval + itemW) * (index - this.amount*(parseInt(index/this.amount)))  + 'px';
      item.style.top = (this.rowInt) * parseInt(index/this.amount)/this.unit + 'rem';
      item.style.transition = item.style.WebkitTransition = this.animation;
    });
  }
  bindEventToEditData (editData) {
    [...editData].map((item, index) => {
      // 点击删除按钮触发删除
      item.children[0].addEventListener("touchstart", (event) => {
        event.stopPropagation();
        event.preventDefault();
        item = null;
        this.editData.splice(index, 1);
        this.render();
      })
      item.children[0].addEventListener("touchend", (event) => {
        event.stopPropagation();
        event.preventDefault();
      })
      item.addEventListener("touchstart", (event) => {
        const startX = event.touches[0].pageX;
        const startY = event.touches[0].pageY;
        event.preventDefault();
        item.style.transition = item.style.WebkitTransition = '';
        this.state = 1;
        this.offsetLeftItem = startX - this.editConL - item.offsetLeft;
        this.offsetTopItem = startY - this.editConT - item.offsetTop;
        item.style.zIndex = ++this.Z;
        item.style.transform = item.style.WebkitTransform = "scale(1.1, 1.1)";
        item.style.opacity = 0.7;
        Object.keys(this.editDataInfo).map(name => {
          if (this.editDataInfo[name].index === index) this.activeItemInfo = this.editDataInfo[name];
        })
      }, false);

      item.addEventListener("touchmove", (event) => {
        event.preventDefault();
        if (item === null) return;
        const x = item.offsetLeft + item.offsetWidth / 2,
              y = item.offsetTop + item.offsetHeight / 2,
              itemIndex = index;
        const moveX = event.touches[0].pageX;
        const moveY = event.touches[0].pageY;
        Object.keys(this.editDataInfo).map(name => {
          const editDataItem = this.editDataInfo[name];
          if (editDataItem.index === itemIndex) return;
          if ((x >= editDataItem.xL) && (x <= editDataItem.xR) && (y >= editDataItem.yT) && (y <= editDataItem.yB)) {
            if (this.state !== 3) {
              this.activeChangeInfo = editDataItem;
              this.state = 3;
              this.changeChangerPosition(editDataItem, 'change');
            }
          }
        })

        const actInfo = this.activeChangeInfo;
        if (this.state === 3 && (x < actInfo.xL || x > actInfo.xR || y < actInfo.yT || y > actInfo.yB)) {
          this.state = 1;
          this.changeChangerPosition(null, 'back');
        }

        if (this.state === 1 || this.state === 3) {
          let left = moveX - this.editConL - this.offsetLeftItem;
          let top = moveY - this.editConT - this.offsetTopItem;
          if (left < -item.offsetWidth / 2) left = -item.offsetWidth / 2;
          else if (left > (this.W - item.offsetWidth / 2)) left = this.W - item.offsetWidth / 2;
          if (top < 0) top = 0;
          else if (top > (this.editCon.offsetHeight - item.offsetHeight))
            top = this.editCon.offsetHeight - item.offsetHeight;
          item.style.left = left + 'px';
          item.style.top = top + 'px';
        }
      }, false);

      item.addEventListener("touchend", (event) => {
        event.preventDefault();
        item.style.transition = item.style.WebkitTransition = this.animation;
        if (this.activeChangeInfo) {
          this.state = 2;
          this.readyChangePosition({dom: item, index}, this.activeChangeInfo);
          this.activeChangeInfo = null;
        }
        if (this.state !== 2) {
          item.style.left = this.activeItemInfo.xL + 'px';
          item.style.top = this.activeItemInfo.yT + 'px';
          item.style.transform = item.style.WebkitTransform = "scale(1, 1)";
          item.style.opacity = 1;
          this.activeItemInfo = null;
          this.state = 0;
        }
      }, false);
    });
  }
  bindEventToAddData (addData) {
    [...addData].map(addItem => {
      addItem.addEventListener('touchstart', (event) => {
        event.preventDefault();
        this.editData.push(addItem.textContent);
        this.render();
      })
    })
  }
  setEditDataInfo (editData) {
    if (editData.length === 0) return '';
    this.editDataInfo = {};
    this.editData.map((name, index) => {
      const item = editData[index];
      this.editDataInfo[name] = {
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
    cDom.style.left = this.activeItemInfo.xL + 'px';
    cDom.style.top = this.activeItemInfo.yT + 'px';
    this.activeItemInfo = null;
    this.updateEditData(origin.index, changer.index);
    this.render();
  }
  changeChangerPosition (changer, type) {
    const cDom = changer && changer.dom || this.activeChangeInfo.dom;
    if (type === 'change') {
      cDom.style.left = this.activeItemInfo.xL + 'px';
      cDom.style.top = this.activeItemInfo.yT + 'px';
    } else {
      cDom.style.left = this.activeChangeInfo.xL + 'px';
      cDom.style.top = this.activeChangeInfo.yT + 'px';
      this.activeChangeInfo = null;
    }
  }
  updateEditData (originIndex, changerIndex) {
    const arr = [...this.editData],
          orN = arr[originIndex],
          chN = arr[changerIndex];
    arr[originIndex] = chN;
    arr[changerIndex] = orN;
    this.editData = arr;
  }
  returnEditData () {
    return this.editData;
  }
}

export default DropSort;
