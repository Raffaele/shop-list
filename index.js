class Storage {
    constructor(key) {
        this.key = key;
        const stored = localStorage.getItem(this.key);
        this.store = stored ? JSON.parse(stored) : [];
    }
    get length() {
        return this.store.length;
    }
    _update() {
        const valueToStore = JSON.stringify(this.store);
        localStorage.setItem(this.key, valueToStore);
    }
    getItem(index) {
        return this.store[index];
    }
    remove(index) {
        this.store.splice(index, 1);
        this._update();
    }
    add(item) {
        this.store.push(item);
        this._update();
    }
    forEach(callback) {
        this.store.forEach(callback);
    }
    map(callback) {
        return this.store.map(callback);
    }
    filter(callback) {
        return this.store.filter(callback);
    }
    find(callback) {
        return this.store.find(callback);
    }
}

$(() => {
    const $window = $(window);
    const $footerNav = $('.footer-nav');
    const $pages = $('.page');
    const $addShopCta = $('#add-shop-cta');

    const $addShopSubmit = $('#add-shop-submit');
    const $addShopCancel = $('#add-shop-cancel-cta');
    const $addShopForm = $('#add-shop-form');
    const $shopName = $('#shop-name');
    const $shopList = $('#shop-list');

    const $addItemForm = $('#add-item-form');
    const $addItemsCta = $('#add-items-cta');
    const $addItemsCancelCta = $('#add-item-cancel-cta');
    const $itemName = $('#item-name');
    const $addItemSubmit = $('#add-item-submit');
    const $shopTitle = $('#shop-title');
    const $itemQuantity = $('#item-quantity');
    const $increaseItemQuantity = $('#item-quantity-plus');
    const $decreaseItemQuantity = $('#item-quantity-minus');
    const $itemList = $('#item-list');
    const $homeLink = $('#home-link');
    let selectedShop;

    const shopStorage = new Storage('shops');
    const itemStorage = new Storage('items');
    updateShopList();

    $window.on('hashchange', updateHash);
    $addShopCta.on('click',  () => {
        $addShopForm.removeClass('hidden');
        resetAddShopForm();
    });
    $addShopCancel.on('click', () => $addShopForm.addClass('hidden'));
    $addShopForm.on('submit', addShop);
    $shopName.on('keyup', () => {
        $addShopSubmit.prop('disabled', !$shopName.val());
    });
    location.hash = '';
    updateHash();
    function updateShopList() {
        shopStorage
            .map(getShopLi)
            .forEach(li => {
                $shopList.append(li);
                li.on('touchmove', evt => {console.log(evt.touches[0])})
            });
    }
    function getShopLi({ name, creationTime}) {
        return $(`<li data-time-creation="${creationTime}"><a href="#page-type=shop&c=${creationTime}">${name}</a></li>`);
    }
    function updateHash() {
        updateNavbar();
        updateVisiblePage();
    }
    function updateNavbar() {
        const href = location.hash || '#';
        $footerNav.find('.active').removeClass('active');
        $footerNav.find(`[href="${href}"]`).addClass('active');
    }
    function updateVisiblePage() {
        const hashParams = location.hash.replace(/^#/, '')
            .split('&')
            .map(portion => {
                const [key, value] = portion.split('=');
                return {key, value};
            });

        const pageInfo = hashParams.find(({key}) => key === 'page-type') || {
            value: 'home'
        };
        const isHome = pageInfo.value === 'home';
        $pages.hide();
        $pages.filter(`[data-path="${pageInfo.value}"]`).show();
        if (isHome) {
            $homeLink.addClass('hidden');
        } else {
            $homeLink.removeClass('hidden');
        }
        if (pageInfo.value === 'shop') {
            const shopId = +hashParams.find(({key}) => key==='c').value;
            selectedShop = shopStorage.find(({creationTime})=>{
                return creationTime === shopId
            });
            $shopTitle.text(selectedShop.name);
            $itemList.text('');
            itemStorage
                .filter(item => item.shopId === shopId)
                .map(getItemLi)
                .forEach(li => {
                    $itemList.append(li);
                });
        }
    }
    function getItemLi(item) {
        const {name, quantity} = item;
        return $(`<li>${quantity} -- ${name}</li>`);
    }
    function addShop(evt) {
        evt.preventDefault();
        const newShop = {
            name: $shopName.val(),
            creationTime: (new Date()).getTime()
        };
        shopStorage.add(newShop);
        const shopLi = getShopLi(newShop);
        $shopList.append(shopLi);
        resetAddShopForm();
    }
    function resetAddShopForm() {
        $shopName.val('').focus();
        $addShopSubmit.prop('disabled', true);
    }

    $addItemsCta.on('click', () => {
        updateItemName();
        $itemQuantity.text(1);
        $decreaseItemQuantity.prop('disabled', true);
        $addItemForm.removeClass('hidden');
        $itemName.val('').focus();
    });
    $increaseItemQuantity.on('click', () => {
        $itemQuantity.text(+$itemQuantity.text()+1);
        $decreaseItemQuantity.prop('disabled', false);
    });
    $decreaseItemQuantity.on('click', () => {
        const newValue = $itemQuantity.text()-1;
        $itemQuantity.text(newValue);
        $decreaseItemQuantity.prop('disabled', !newValue);
    });
    $addItemsCancelCta.on('click', () => {
        $addItemForm.addClass('hidden');
    });
    $itemName.on('keyup', updateItemName);
    function updateItemName() {
        $addItemSubmit.prop('disabled', !$itemName.val());
    }

    $addItemForm.on('submit', (evt) => {
        evt.preventDefault();
        const itemName = $itemName.val();
        const newItem = {
            name: itemName,
            shopId: selectedShop.creationTime,
            quantity: +$itemQuantity.text()
        };
        $itemName.val('').focus();
        $addItemSubmit.prop('disabled', true);
        itemStorage.add(newItem);
        const newLi = getItemLi(newItem);
        newLi.on('touchmove', evt => {
            console.log(evt);
        });
        $itemList.append(newLi);
    })
});

