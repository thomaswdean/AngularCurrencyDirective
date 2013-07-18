'use strict';

define(['app'], function (app) {

    app.register.directive('currency', function () {

        String.prototype.splice = function (idx, rem, s) {
            return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
        };
        
        function isEmpty(value) {
            return angular.isUndefined(value) || value === '' || value === null || value !== value;
        }

        var p = function (viewValue) {
            var numbs = viewValue.toString().replace(/[^\d.]/g, '');
            return numbs;
        };

        var f = function (modelValue, setdec) {
            setdec = setdec !== undefined ? setdec : true;
            var decimalSplit = modelValue.toString().split(".");
            var intPart = decimalSplit[0];
            var decPart = decimalSplit[1];

            intPart = intPart.replace(/[^\d]/g, '');
            if (intPart.length > 3) {
                var intDiv = Math.floor(intPart.length / 3);
                while (intDiv > 0) {
                    var lastComma = intPart.indexOf(",");
                    if (lastComma < 0) {
                        lastComma = intPart.length;
                    }

                    if (lastComma - 3 > 0) {
                        intPart = intPart.splice(lastComma - 3, 0, ",");
                    }
                    intDiv--;
                }
            }

            if (decPart === undefined) {
                if (setdec)
                    decPart = ".00";
                else
                    decPart = "";
            }
            else {
                if (setdec) {
                    if (decPart.length > 2)
                        decPart = decPart.slice(0, 2);
                    while (decPart.length < 2) {
                        decPart = decPart + "0"
                    }
                }
                decPart = "." + decPart;
            }

            return [intPart, decPart].join('');
        };

        return {
            require: '?ngModel',
            restrict: 'A',
            link: function (scope, element, attr, ctrl) {
                scope.$watch(function () { return { min: attr.min } }, function () { ctrl.$setViewValue(ctrl.$viewValue); }, true);
                scope.$watch(function () { return { max: attr.max } }, function () { ctrl.$setViewValue(ctrl.$viewValue); }, true);

                var minValidator = function (value) {
                    var min = scope.$eval(attr.min) || 0;
                    if (!isEmpty(value) && value < min) {
                        ctrl.$setValidity('min', false);
                        return undefined;
                    } else {
                        ctrl.$setValidity('min', true);
                        return value;
                    }
                };

                var maxValidator = function (value) {
                    var max = scope.$eval(attr.max) || Infinity;
                    if (!isEmpty(value) && value > max) {
                        ctrl.$setValidity('max', false);
                        return undefined;
                    } else {
                        ctrl.$setValidity('max', true);
                        return value;
                    }
                };

                element.bind('keypress', function (e) {
                    if (e.charCode !== 0 && String.fromCharCode(e.charCode).match(/[^\d.]/g)) {
                        e.preventDefault();
                        return;
                    }
                    if ($(this).val().indexOf(".") != -1 && e.charCode == 46) {
                        e.preventDefault();
                        return;
                    }
                    var newVal = $(this).val() + (e.charCode !== 0 ? String.fromCharCode(e.charCode) : '');
                    if ($(this).val().search(/(.*)\.[0-9][0-9]/) === 0 && newVal.length > $(this).val().length) {
                        e.preventDefault();
                        return;
                    }
                });

                $(element).bind('blur paste', function (e) {
                    element.val(f($(this).val()));
                });

                $(element).bind('keyup', function (e) {
                    element.val(f($(this).val(), false));
                });

                ctrl.$parsers.unshift(f);
                ctrl.$formatters.unshift(f);
                ctrl.$parsers.push(minValidator);
                ctrl.$formatters.push(minValidator);
                ctrl.$parsers.push(maxValidator);
                ctrl.$formatters.push(maxValidator);
            }
        };
    });
});
