function People() {
    this.firstName = arguments[0];
    this.lastName = arguments[1];
}
let obj1 = new People('li', 'qunpeng');
let obj2 = new People('shi', 'shengzhe');


function addMethod(classObj, methodName, fn) {
    let oldFn = classObj[methodName];
    classObj[methodName] = function () {
        if (arguments.length === fn.length) {
            return fn.apply(this, arguments);
        } else if (typeof oldFn === 'function') {
            return oldFn.apply(this, arguments);
        }
    }
}

addMethod(People.prototype, 'gan', (firstName) => {
    console.log("A", firstName);
});

addMethod(People.prototype, 'gan', () => {
    console.log("B");
});
addMethod(People.prototype, 'gan', (firstName, lastName) => {
    console.log("C", firstName, lastName);
});

obj1.gan('1');
obj1.gan('2', '3');
obj1.gan('3', '4');
obj1.gan('3', '4','0');
obj1.gan();
