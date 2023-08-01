const Transform =require('stream').Transform

class ArrayTransform extends Transform {
    constructor(options) {
        super(options)
        this._index = 0
    }

    _transform(data, encoding, done) {
        if (!(this._index++)) {
            // first element, add opening bracket
            this.push('[')
        } else {
            // following element, prepend comma
            this.push(',')
        }
        this.push(data)
        done()
    }

    _flush(done) {
        if (!(this._index++)) {
            // empty
            this.push('[]')
        } else {
            // append closing bracket
            this.push(']')
        }
        done()
    }
}

module.exports = ArrayTransform;
