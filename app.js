// Polyfill
if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
      'use strict';
  
      if (search instanceof RegExp) {
        throw TypeError('first argument must not be a RegExp');
      }
      if (start === undefined) { start = 0; }
      return this.indexOf(search, start) !== -1;
    };
}

function Validator( selector){
    var formElement= document.querySelector( selector);
    var checkList= {};
    var _this= this;
    var formRules= {
        required: function( value){
            if( value.trim()){
                return undefined;
            }
            else{
                return 'Vui lòng nhập trường này.'
            }
        },
        email: function( value){
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test( value))
            {
               return undefined;
            }
            return 'Email không hợp lệ.'
        },
        min: function( minLength){
            return function( value){
                if( value.length >= minLength) return undefined;
                else return `Bạn phải nhập tối thiểu ${ minLength} kí tự.`;
            }
        },
        max: function( maxLength){
            return function( value){
                if( value.length <= maxLength) return undefined;
                else return `Trường này chỉ cho phép nhập tối đa ${ maxLength} kí tự.`;
            }
        },
        similar: function( value){
            var inputElement = formElement.querySelector('#password_confirm');
            var prevInput= findDad(inputElement).previousElementSibling;
            var inputPassValue= prevInput.querySelector('input').value;
            if( inputPassValue=== value) return undefined;
            else return 'Xác nhận mật khẩu không chính xác.';
        } 
    };
    if( formElement){
        var inputElements= formElement.querySelectorAll( '[name]');
        inputElements= Array.from( inputElements);
        inputElements.forEach( function( input){
            if( input.getAttribute( 'rules')){
                var rules= input.getAttribute( 'rules').split('|');
                var ruleInfors;
                for( rule of rules){
                    var hasSpit= false;
                    if( rule.includes(':')){
                        hasSpit= true;
                        ruleInfors= rule.split(':');
                        rule= ruleInfors[0];
                    }
                    if( !Array.isArray( checkList[ input.name])) checkList[input.name]= [];
                    if( hasSpit){
                        checkList[input.name].push( formRules[ rule]( ruleInfors[1]));
                    }
                    else checkList[ input.name].push( formRules[ rule]);
                }
                input.onblur= blurHandle;
                input.oninput= inputHandle;                
            }
        });
    }
    function findDad( inputElement){
        var goal= '.form__group';
        while( inputElement.parentElement){
            if( inputElement.parentElement.matches( goal)){
                return inputElement.parentElement;
            }
            else inputElement= inputElement.parentElement;
        }
        alert( 'Không tìm được '+ goal);
    }
    function blurHandle( e){
        var inputElement=e.target;
        var checks= checkList[inputElement.name];
        for( check of checks){
            var errorMessage= check( inputElement.value);
            if( errorMessage){
                var formGroupElement= findDad( inputElement);
                var errorElement= formGroupElement.querySelector( '.form__message');
                errorElement.innerText= errorMessage;
                formGroupElement.classList.add( 'invalid');
                break;
            }
        }
    }
    function inputHandle( e){
        var inputElement=e.target;
        var formGroupElement= findDad( inputElement);
        var errorElement= formGroupElement.querySelector( '.form__message');
        errorElement.innerText= '';
        formGroupElement.classList.remove( 'invalid');
    }
    formElement.onsubmit = function( e){
        e.preventDefault();
        var isSuccess= true;
        var formData= {};
        function switchCaseHandle( inputElement){
            switch( inputElement.type){
                case 'file':
                    formData[ inputElement.name]= inputElement.files;
                    break;
                case 'radio':
                    if( inputElement.matches( ':checked')){
                        formData[ inputElement.name]= inputElement.value;
                    }
                    break;
                case 'checkbox':
                    if( !Array.isArray( formData[ inputElement.name])){
                        formData[ inputElement.name]= [];
                    }
                    if( inputElement.matches( ':checked')){
                        formData[ inputElement.name].push( inputElement.value);
                    }
                    break;
                case 'options':
                    break;
                default:
                    formData[ inputElement.name]= inputElement.value;
            }
        }
        var inputElements= formElement.querySelectorAll( '[name]');
        inputElements.forEach( function( inputElement){
            if( checkList[inputElement.name]){
                var isChecked;
                switch( inputElement.type){
                    case 'checkbox':
                    case 'radio':
                        isChecked= false;
                }
                var checks= checkList[inputElement.name];
                for( check of checks){
                    var errorMessage;
                    switch( inputElement.type){
                        case 'radio':
                        case 'checkbox':
                            var formGroupElement= findDad( inputElement);
                            var checkedInput= formGroupElement.querySelector( ':checked');
                            if( checkedInput) isChecked= true;
                            break;
                        default:
                            errorMessage= check( inputElement.value);
                    }
                    switch( inputElement.type){
                        case 'checkbox':
                        case 'radio':
                            if( isChecked){
                                errorMessage= '';
                            }
                            else errorMessage= 'Vui lòng chọn trường này';
                    }
                    if( errorMessage){
                        isSuccess= false;
                        var formGroupElement= findDad( inputElement);
                        var errorElement= formGroupElement.querySelector( '.form__message');
                        errorElement.innerText= errorMessage;
                        formGroupElement.classList.add( 'invalid');
                        break;
                    }
                }
                if( isSuccess) switchCaseHandle( inputElement);
            }
            else switchCaseHandle( inputElement);
        });
        if( isSuccess){
            if( _this.onSubmit){
                _this.onSubmit( formData);
            }
            else{
                formElement.submit();
            }
        }
    }
}