exports.parse = function (expression) {
    function createExtension(extensionName, params) {
        if (!extensionName) {
            throw "Extension name is empty!"
        }

        var extension = {extensionName: extensionName, params: params};
        return extension;
    }

    function atDecode(value) {
        var i = 0;

        //в цикле присваивается переменной i значение,  указывающее на следующий символ после @
        //если в строке не осталось @, indexOf возвращает -1, i =0 и цикл заканчивается.
        while (i = value.indexOf("@", i) + 1) { //Ничего не могу с собой поделать, непонятно, но красиво )

            if ((value.charAt(i) === "@") || (value.charAt(i) === "{") || (value.charAt(i) === "}")) {
                value = value.slice(0, i - 1) + value.slice(i);
            } else {
                throw "errors.incorrectExtensionCall " + [value];
                //_.onErrorCode("errors.incorrectExtensionCall", [value]);
            }
        }
        return value;
    }

    function getParamValue(tail) {
        var getTail = /^\s*[,\s]\s*(.*)$/; // получаем "хвост" после пробела, запятой.
        var getValueAndTail = /^([\w\$]+([.\-]\w+)*)[,\s]?\s*(.*)$/; // [Значение, разделитель, пробелы, "хвост"]
        if (tail) {
            var match = [];
            if (tail.charAt(0) === "{") {
                var mustacheCounter = 1;
                var i = 1;
                var value = "";
                while (mustacheCounter && tail.charAt(i)) {
                    if (tail.charAt(i) === "@") {
                        value = value + tail.charAt(i++) + tail.charAt(i++);
                    } else if (tail.charAt(i) === "{") {
                        mustacheCounter++;
                        value = value + tail.charAt(i++);
                    } else if (tail.charAt(i) === "}") {
                        mustacheCounter--;
                        if (mustacheCounter) {
                            value = value + tail.charAt(i);
                        }
                        i++;
                    } else {
                        value = value + tail.charAt(i++);
                    }
                }
                if (tail.charAt(i)) {
                    match = getTail.exec(tail.slice(i));
                    return { value: getDescriptor(value), tail: match[1]};
                } else {
                    return { value: getDescriptor(value), tail: ''};
                }
            } else {
                match = getValueAndTail.exec(tail);
                return { value: atDecode(match[1]), tail: match[3]};
            }
        } else {
            return { value: undefined, tail: ""};
        }
    }


    function getDescriptor(expression) {
        var descriptor;
        // [1:Путь команды, 2:собственное имя команды, 3:параметры ]
        var splitToCommandAndParams = /^@((\w+\/?)*)\s*(.*)\s*$/;

        // [1:полное имя параметра, 2:собственное имя параметра, 3:всё остальное,
        // 4: применённый символ разделителя, 5:очищеный "хвост" (остальные параметры) или пустая строка
        var splitToFirstParamNameAndTail = /^(\w+([\-\.]\w+)*)(\s*$|\s*([=:\s,])\s*([\w\{\$].*)?$)/;

        var trimmedExpression = expression.replace(/\r?\n|\r/gm, ' ').trim();
        if (/^{.*[^@]}$/.test(trimmedExpression)) {
            descriptor = getDescriptor(trimmedExpression.slice(1, -1));

            return descriptor;
        } else {
            var parser = splitToCommandAndParams.exec(trimmedExpression);
            if (parser !== null) {
                var tail = parser[3];
                var tailParser;
                var params = {}; //Сюда собираем параметры для команды

                while (tailParser = splitToFirstParamNameAndTail.exec(tail)) { //присвоение, не сравнение.

                    if ((tailParser[4] === "=") || (tailParser[4] === ":")) {
                        var parts = getParamValue(tailParser[5]);

                        params[tailParser[1]] = parts.value;
                        tail = parts.tail;
                    } else {
                        params.path = tailParser[1];
                        tail = tailParser[5] || ""; //заменяем undefined на пустую строку
                    }
                }

                descriptor = createExtension(parser[1], params);

                return descriptor;
            } else {
                descriptor = atDecode(trimmedExpression);

                return descriptor;
            }
        }
    }

    return getDescriptor(expression);

}
