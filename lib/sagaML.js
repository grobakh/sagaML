exports.sagaML = function (html, inFile) {
    require('./htmlparser');
    var path = require('path');
    var pathSep = path.sep;

    var toJSON = require('./toJSON');
    var extensionParser = require('./extensionParser');

    var current = {};
    var stack = [];

    var handler = {
        start: function (tag, attrs, unary) {
            var started = { nodeName: tag };


            for (var i = 0; i < attrs.length; i++) {
                var key = attrs[i].name;
                var value = attrs[i].escaped;

                if (key.indexOf('data-') === 0) {
                    var cleanKey = key.slice('data-'.length);
                    started.props = started.props || {};

                    // In false case do not create key!
                    if (value && (value.indexOf("@") === 0 || value.indexOf("{") === 0)) {
                        started.canChange = started.canChange || {};
                        started.canChange[cleanKey] = true;
                        started.props[cleanKey] = extensionParser.parse(value);
                    } else {
                        started.props[cleanKey] = value;

                    }

                } else {
                    started.attrs = started.attrs || {};
                    started.attrs[key] = value;
                }
            }

            if (started.props && started.props.property) {
                if (started.props.crop) {
                    started.nodeName = "";
                    started.isFragment = true;
                    current.props = current.props || {};
                    current.props[started.props.property] = started;
                } else {
                    current.props = current.props || {};
                    current.props[started.props.property] = { children: [started], isFragment: true };
                }

                delete started.props.property;
                if (Object.keys(started.props).length === 0) {
                    delete started.props;
                }
            }
            else {
                current.children = current.children || [];
                current.children.push(started);
            }

            if (unary) {
                started.unary = true;
            } else {
                stack.push(current);
                current = started;
            }
        },
        end: function (tag) {
            current = stack.pop();
        },
        chars: function (text) {
            if (text) {
                text = text.trim();
                if (text.length > 0) {
                    current.children = current.children || [];
                    current.children.push({ value: text, unary: true });
                }
            }
        },
        comment: function (text) {
        }
    };

    //incoming path  C:\Lookfi\0.3.7 json\tomcat\lookfi\client\svidurr\metro\controls\folder\button.xhtml
    var moduleName = inFile.replace(new RegExp(".*\\" + pathSep + "client\\" + pathSep), '')
        .replace(new RegExp("([^\\" + pathSep + "]*\\" + pathSep + "){2}"), '')
        .replace(new RegExp("\\" + pathSep, "g"), '/');
    //var moduleName = inFile.replace(/.*\\client\\/, '').replace(/([^\\]*\\){2}/, '').replace(/\\/g,'/');
    //result should be "controls/folder/button.xhtml"

    var css = moduleName.replace(/\./g, "_").replace(/\//g, "_");
    if (css.indexOf('_xhtml') === css.length - 6) {
        css = css.substr(0, css.length - 6);
    }
    current.templateCss = css;

    HTMLParser(html, handler);

    var result = 'define("' + moduleName + '", {}, function () {\n    return ';
    result += toJSON.toJSON(current, 2);
    result += "\n});";


    return result;
};