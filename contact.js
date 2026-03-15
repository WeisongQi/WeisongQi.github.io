/**
 * 联系表单验证和提交处理
 * 支持 Formspree 后端服务
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const subjectInput = document.getElementById('subject');
    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');
    const charCount = document.getElementById('char-count');
    
    // 邮箱验证正则
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // 显示字段错误
    function showFieldError(input, message) {
        const errorEl = document.getElementById(`${input.id}-error`);
        if (errorEl) {
            errorEl.textContent = message;
        }
        input.classList.add('invalid');
        input.setAttribute('aria-invalid', 'true');
    }
    
    // 清除字段错误
    function clearFieldError(input) {
        const errorEl = document.getElementById(`${input.id}-error`);
        if (errorEl) {
            errorEl.textContent = '';
        }
        input.classList.remove('invalid');
        input.setAttribute('aria-invalid', 'false');
    }
    
    // 验证单个字段
    function validateField(input) {
        clearFieldError(input);
        const value = input.value.trim();
        
        if (input.hasAttribute('required') && !value) {
            showFieldError(input, 'This field is required');
            return false;
        }
        
        if (input.type === 'email' && value && !emailRegex.test(value)) {
            showFieldError(input, 'Please enter a valid email address');
            return false;
        }
        
        if (input.id === 'message') {
            const minLength = parseInt(input.getAttribute('minlength')) || 10;
            if (value.length < minLength) {
                showFieldError(input, `Message must be at least ${minLength} characters`);
                return false;
            }
        }
        
        return true;
    }
    
    // 显示表单状态
    function showFormStatus(message, type) {
        formStatus.textContent = message;
        formStatus.className = `form-status ${type}`;
        formStatus.style.display = 'block';
        
        // 滚动到状态消息
        formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // 设置按钮加载状态
    function setLoading(isLoading) {
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        if (isLoading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-flex';
            submitBtn.disabled = true;
        } else {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    }
    
    // 字符计数
    if (messageInput && charCount) {
        messageInput.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;
            charCount.parentElement.style.color = count > 900 ? '#e74c3c' : '';
        });
    }
    
    // 实时验证
    [nameInput, emailInput, messageInput].forEach(input => {
        if (input) {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        }
    });
    
    // 表单提交
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // 验证所有必填字段
        let isValid = true;
        [nameInput, emailInput, messageInput].forEach(input => {
            if (input && !validateField(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            showFormStatus('Please correct the errors above', 'error');
            return;
        }
        
        // 检查是否配置了 Formspree
        const formAction = form.getAttribute('action');
        if (formAction.includes('YOUR_FORM_ID')) {
            showFormStatus(
                'Form backend not configured. Please replace YOUR_FORM_ID in the form action with your Formspree form ID. See comments in contact.html for instructions.',
                'warning'
            );
            return;
        }
        
        // 提交表单
        setLoading(true);
        formStatus.style.display = 'none';
        
        try {
            const formData = new FormData(form);
            
            const response = await fetch(formAction, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                showFormStatus('Thank you! Your message has been sent successfully. I will get back to you soon.', 'success');
                form.reset();
                if (charCount) charCount.textContent = '0';
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showFormStatus(
                'Sorry, there was an error sending your message. Please try again or email me directly at contact@6699366.xyz',
                'error'
            );
        } finally {
            setLoading(false);
        }
    });
});
