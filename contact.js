/**
 * 联系表单验证
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    if (!form) return;
    
    const lastNameInput = document.getElementById('lastname');
    const emailInput = document.getElementById('email');
    const messageTextarea = document.querySelector('textarea');
    const submitButton = form.querySelector('input[type="submit"]');
    
    // 简单的邮箱验证函数
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // 显示错误消息
    function showError(input, message) {
        const fieldset = input.closest('fieldset');
        let errorElement = fieldset.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.style.color = 'red';
            errorElement.style.fontSize = '0.9em';
            errorElement.style.marginTop = '5px';
            fieldset.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        input.style.borderColor = 'red';
    }
    
    // 清除错误消息
    function clearError(input) {
        const fieldset = input.closest('fieldset');
        const errorElement = fieldset.querySelector('.error-message');
        
        if (errorElement) {
            errorElement.remove();
        }
        
        input.style.borderColor = '';
    }
    
    // 验证单个字段
    function validateField(input) {
        clearError(input);
        
        if (input.hasAttribute('required') && !input.value.trim()) {
            showError(input, '此字段为必填项');
            return false;
        }
        
        if (input.type === 'email' && input.value.trim() && !isValidEmail(input.value.trim())) {
            showError(input, '请输入有效的电子邮件地址');
            return false;
        }
        
        if (input.tagName === 'TEXTAREA') {
            const minLength = parseInt(input.getAttribute('minlength')) || 10;
            const maxLength = parseInt(input.getAttribute('maxlength')) || 50;
            const value = input.value.trim();
            
            if (value.length < minLength) {
                showError(input, `消息长度至少为 ${minLength} 个字符`);
                return false;
            }
            
            if (value.length > maxLength) {
                showError(input, `消息长度不能超过 ${maxLength} 个字符`);
                return false;
            }
        }
        
        return true;
    }
    
    // 实时验证
    [lastNameInput, emailInput, messageTextarea].forEach(input => {
        if (input) {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearError(this);
            });
        }
    });
    
    // 表单提交验证
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        let isValid = true;
        
        if (!validateField(lastNameInput)) isValid = false;
        if (!validateField(emailInput)) isValid = false;
        if (!validateField(messageTextarea)) isValid = false;
        
        if (isValid) {
            // 简单成功提示
            alert('感谢您的留言！我会尽快回复。');
            form.reset();
        } else {
            alert('请检查表单中的错误');
        }
    });
});