(function () {
    if (typeof String.prototype.includes === 'undefined') {
        String.prototype.includes = function includes(subStr) {
            if (typeof subStr !== 'string')
                throw new TypeError('subStr is not string, you pass ' + subStr + '!');
            return this.indexOf(subStr) !== -1;
        };
    }

    if (typeof String.prototype.endsWith === 'undefined') {
        String.prototype.endsWith = function endsWith(searchString, endPosition) {
            // This works much better than >= because
            // it compensates for NaN:
            if (!(endPosition < this.length)) endPosition = this.length;
            else endPosition |= 0; // round position
            return (
                this.substr(endPosition - searchString.length, searchString.length) === searchString
            );
        };
    }

    if (typeof String.prototype.replaceAll === 'undefined') {
        String.prototype.replaceAll = function replaceAll(searchValue, replaceValue) {
            // eslint-disable-next-line consistent-this
            var result = this;
            var newResult = result.replace(searchValue, replaceValue);

            while (newResult !== result) {
                result = newResult;
                newResult = result.replace(searchValue, replaceValue);
            }

            return result;
        };
    }

    // https://github.com/tc39/proposal-relative-indexing-method#polyfill
    if (typeof String.prototype.at === 'undefined') {
        String.prototype.at = function at(n) {
            // ToInteger() abstract op
            n = Math.trunc(n) || 0;
            // Allow negative indexing from the end
            if (n < 0) n += this.length;
            // OOB access is guaranteed to return undefined
            if (n < 0 || n >= this.length) return undefined;
            // Otherwise, this is just normal property access
            return this[n];
        };
    }
})();
