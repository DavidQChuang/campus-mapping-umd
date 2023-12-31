class MinHeap {
    constructor(valueFn) {
        this.arr = [];
        this.valueFn = valueFn ?? ((x) => x);
    }

    get length() {
        return this.arr.length;
    }

    swap(i, j) {
        var temp = this.arr[i];
        this.arr[i] = this.arr[j];
        this.arr[j] = temp;
    }

    contains(item, equalFn) {
        if(typeof(equalFn) != 'function')
            equalFn = (x, y) => x == y;

        for(var obj of this.arr) {
            if(equalFn(obj[1], item))
                return true;
        }
        return false;
    }

    siftUp(i) {
        var p = Math.floor((i-1) / 2);
        
        // sift up
        while(p >= 0) {
            // if parent is larger, sift up
            if(this.arr[p][0] > this.arr[i][0]) {
                this.swap(p, i);
                i = p;
                p = Math.floor((p-1) / 2);
            } else {
                break;
            }
        }

        return i;
    }

    siftDown(p) {
        // sift down
        while(p < Math.floor(this.arr.length / 2)) {
            var left = p*2 + 1;
            var right = p*2 + 2;

            // If a child is lesser, swap it with the parent
            if(right >= this.arr.length || this.arr[left][0] < this.arr[right][0]) {
                if(this.arr[left][0] < this.arr[p][0]) {
                    this.swap(left, p);
                    p = left;
                }
                // If the lesser child is greater than the parent,
                // both must be greater and we now have a heap.
                else {
                    break;
                }
            } else {
                if(this.arr[right][0] < this.arr[p][0]) {
                    this.swap(right, p);
                    p = right;
                }
                // see above
                else {
                    break;
                }
            }
        }

        return p;
    }

    push(item) {
        var i = this.arr.length;
        this.arr.push([this.valueFn(item), item]);
        
        this.siftUp(i)
    }

    replace(item, equalFn) {
        if(typeof(equalFn) != 'function')
            equalFn = (x, y) => x == y;

        for(var i = 0; i < this.arr.length; i++) {
            var obj = this.arr[i];
            if(equalFn(obj[1], item)){
                this.arr[i] = [this.valueFn(item), item];
                i = this.siftUp(i);
                this.siftDown(i);
                return true;
            }
        }

        return false;
    }

    pop() {
        if(this.arr.length == 0)
            throw new RangeError("No elements to pop");

        // pop smallest element and swap the last element to it
        var p = 0;
        this.swap(0, this.arr.length - 1);
        var value = this.arr.pop();
        // console.log("Popped " + JSON.stringify(value), this);

        // sift down
        while(p < Math.floor(this.arr.length / 2)) {
            var left = p*2 + 1;
            var right = p*2 + 2;

            // If a child is lesser, swap it with the parent
            if(right >= this.arr.length || this.arr[left][0] < this.arr[right][0]) {
                if(this.arr[left][0] < this.arr[p][0]) {
                    this.swap(left, p);
                    p = left;
                }
                // If the lesser child is greater than the parent,
                // both must be greater and we now have a heap.
                else {
                    break;
                }
            } else {
                if(this.arr[right][0] < this.arr[p][0]) {
                    this.swap(right, p);
                    p = right;
                }
                // see above
                else {
                    break;
                }
            }
        }

        // return smallest element
        return value[1];
    }
}