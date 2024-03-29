_.extend = function () {
    var deep = (typeof arguments[0] == "boolean" ? arguments[0] == true : false);
    var sindex = (deep ? 2 : 1);
    var obj = arguments[(deep ? 1 : 0)];
    _.each(Array.prototype.slice.call(arguments, 1), function(source) {
        if (source) {
            for (var prop in source) {
                if (obj[prop] != undefined && deep) {
                    if (_.isFunction(obj[prop])){
                        obj[prop] = source[prop];
                    }
                    else if (_.isObject(obj[prop])) {
                        obj[prop] = _.extend(deep, obj[prop], source[prop]);
                    } else {
                        obj[prop] = source[prop];
                    }
                } else {
                    obj[prop] = source[prop];
                }
            }
        }
    });
    return obj;
};
_.deepClone = function (obj, acceptKeys) {
    if (acceptKeys != undefined) {
        if (acceptKeys.length == 0) {
            return null;
        }
    }
    acceptKeys = (acceptKeys == undefined ? [] : acceptKeys);
    if (!_.isObject(obj)) return obj;
    var ret;
    if (_.isArray(obj)) {
        ret = [];
        for (var x = 0; x < obj.length; x++) {
            ret[x] = _.deepClone(obj[x],(acceptKeys.length==0 ? undefined : acceptKeys));
        }
    } else {
        switch (toString.call(obj)) {
            case '[object String]':
            case '[object Date]':
            case '[object Function]':
            case '[object RegExp]':
                ret = obj;
                break;
            default:
                if (obj.clone != undefined) {
                    ret = obj.clone();
                } else {
                    ret = {};
                    for(var x=0;x<acceptKeys.length;x++){
                        ret[acceptKeys[x]] = _.deepClone(obj[acceptKeys[x]], (acceptKeys.length == 0 ? undefined : acceptKeys));
                    }
                }
                break;
        }
    }
    return ret;
};

_.extractUTCDate = function (date) {
    var ret = date;
    if (!(date instanceof Date)) {
        ret = new Date(date);
    }
    return Date.UTC(ret.getUTCFullYear(), ret.getUTCMonth(), ret.getUTCDate(), ret.getUTCHours(), ret.getUTCMinutes(), ret.getUTCSeconds());
};