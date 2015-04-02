(function () {

    var amp = /&amp;/g;
    var lt = /&lt;/g;
    var gt = /&gt;/g;
    var quot = /&quot;/g;
    var apost = /&#x39;/g;
    var slash = /&#x2F;/g;
    var space = /&nbsp;/g;
    var _amp = /&/g;
    var _lt = /</g;
    var _gt = />/g;
    var _quot = /"/g;
    var _apost = /'/g;
    var _slash = /\//g;
    var _space = RegExp(String.fromCharCode(0x00a0), 'g');

    var _ = {
        decodeHTML: function (s) {
            return ('' + s).replace(amp, '&').replace(lt, '<').replace(gt, '>').replace(quot, '"')
                .replace(apost, '\'').replace(slash, '/').replace(space, String.fromCharCode(0x00a0));
        },

        encodeHTML: function (s) {
            return ('' + s).replace(_amp, '&amp;').replace(_lt, '&lt;').replace(_gt, '&gt;')
                .replace(_quot, '&quot;').replace(_apost, '&#39;').replace(_slash, '&#47;').replace(_space, '&nbsp;');
        },
        escapeJSON: function (s) {
            return  ('' + s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        },
        toJSON: function (source, objects, offset) {
            offset = offset || 0;
            var spaceBefore = new Array(offset * 4 + 1).join(' ');
            var spaceExitBlock = offset > 0 ? new Array((offset - 1) * 4 + 1).join(' ') : "";

            var result = "";

            if (source === null || source === void 0 || typeof source === 'function') {
                return "null";
            }

            if (source === true) {
                return "true";
            }

            if (source === false) {
                return "false";
            }

            if (typeof source === "number") {
                return source.toString();
            }

            if (typeof source === "string") {
                return '"' + _.escapeJSON(source) + '"';
            }

            objects = objects || [];

            if (objects.indexOf(source) !== -1) {
                result = '{ "@ref": null }';
                return result;
            }
            else {
                objects.push(source);
            }

            if (Object.prototype.toString.call(source) === '[object Array]') {
                result = "[";

                for (var index = 0, length = source.length; index < length; index++) {
                    result += (index ? ",\n" : "\n");
                    result += spaceBefore;
                    result += _.toJSON(source[index], objects, offset + 1);
                }

                result += "\n";
                result += spaceExitBlock;
                result += "]";

                return result;
            }

            if (source === Object(source)) {

                result = "{";
                var propIndex = 0;

                for (var key in source) {
                    if (source.hasOwnProperty(key) && key.charAt(0) !== '_') {
                        result += (propIndex++ ? ",\n" : "\n");
                        result += spaceBefore;
                        result += '"' + _.escapeJSON(key) + '": ' + _.toJSON(source[key], objects, offset + 1);
                    }
                }

                result += "\n";
                result += spaceExitBlock;
                result += "}";

                return result;
            }
        }
    };

    exports.toJSON = function (source, offset) {
        return _.toJSON(source, [], offset);
    };

    exports.decodeHTML = _.decodeHTML;

}).call(this);