// ============================================================
// pool.js — Generic Object Pooling System
// ============================================================

class ObjectPool {
    /**
     * @param {Function} createFn  - Factory function to create a new object
     * @param {Function} resetFn   - Function to reset/reinitialize an object
     * @param {number}   initialSize - Pre-allocate this many objects
     */
    constructor(createFn, resetFn, initialSize = 50) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.active = [];

        // Pre-allocate
        for (let i = 0; i < initialSize; i++) {
            const obj = this.createFn();
            obj._poolActive = false;
            this.pool.push(obj);
        }
    }

    /**
     * Get an object from the pool (or create a new one if empty)
     * @param  {...any} args - Arguments passed to the reset function
     * @returns {Object}
     */
    get(...args) {
        let obj;
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else {
            obj = this.createFn();
        }
        obj._poolActive = true;
        this.resetFn(obj, ...args);
        this.active.push(obj);
        return obj;
    }

    /**
     * Release an object back to the pool
     * @param {Object} obj
     */
    release(obj) {
        obj._poolActive = false;
        this.pool.push(obj);
    }

    /**
     * Release and remove an active object by index in O(1)
     * @param {number} index
     */
    releaseActiveAt(index) {
        if (index < 0 || index >= this.active.length) return false;
        const obj = this.active[index];
        this.release(obj);

        const lastIndex = this.active.length - 1;
        if (index !== lastIndex) {
            this.active[index] = this.active[lastIndex];
        }
        this.active.pop();
        return true;
    }

    /**
     * Release and remove an active object in O(1)
     * @param {Object} obj
     */
    releaseActive(obj) {
        const index = this.active.indexOf(obj);
        if (index === -1) return false;
        return this.releaseActiveAt(index);
    }

    /**
     * Release all active objects that match a predicate
     * @param {Function} predicate - Return true to release
     */
    releaseWhere(predicate) {
        for (let i = this.active.length - 1; i >= 0; i--) {
            if (predicate(this.active[i])) {
                this.releaseActiveAt(i);
            }
        }
    }

    /**
     * Update all active objects
     * @param {Function} updateFn - (obj, dt) => void. Return true to release.
     * @param {number} dt
     */
    updateAll(updateFn, dt) {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const shouldRelease = updateFn(this.active[i], dt);
            if (shouldRelease) {
                this.releaseActiveAt(i);
            }
        }
    }

    /**
     * Draw all active objects
     * @param {Function} drawFn - (ctx, obj) => void
     * @param {CanvasRenderingContext2D} ctx
     */
    drawAll(drawFn, ctx) {
        for (let i = 0; i < this.active.length; i++) {
            drawFn(ctx, this.active[i]);
        }
    }

    /** Number of active objects */
    get activeCount() {
        return this.active.length;
    }

    /** Release all active objects */
    releaseAll() {
        while (this.active.length > 0) {
            const obj = this.active.pop();
            this.release(obj);
        }
    }
}
