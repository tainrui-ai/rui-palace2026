document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById("cookie-consent");
    const acceptBtn = document.getElementById("accept-btn");
    const rejectBtn = document.getElementById("reject-btn");

    // 1. 统一检查逻辑：同时检查 Cookie 和 LocalStorage
    // 注意：我们将标识符统一为 'cookie_consent' 以保持逻辑一致
    const hasConsent = document.cookie.split('; ').find(row => row.startsWith('cookie_consent=true')) || 
                       localStorage.getItem('cookie_consent') === 'true';

    // 如果已确认，直接隐藏，不需要显示
    if (hasConsent) {
        if (modal) modal.style.display = "none";
    } else {
        // 未确认时显示
        if (modal) modal.style.display = "flex";
    }

    // 2. 淡出动画函数
    function dismiss() {
        if (modal) {
            modal.style.transition = "opacity 0.5s ease";
            modal.style.opacity = "0";
            setTimeout(() => {
                modal.style.display = "none";
            }, 500);
        }
    }

    // 3. 绑定点击逻辑
    if (acceptBtn) {
        acceptBtn.onclick = function() {
            // 写入跨子域 Cookie 和 LocalStorage
            document.cookie = "cookie_consent=true; domain=rui-palace.com; path=/; max-age=31536000; SameSite=Lax";
            localStorage.setItem("cookie_consent", "true");
            dismiss();
        };
    }

    if (rejectBtn) {
        rejectBtn.onclick = function() {
            dismiss();
        };
    }
});



// ==========================================
// 蕊宫 - 访问统计调试版
// ==========================================
const SUPABASE_URL = 'https://tbridsdkmqcbhnqodwzt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FmUorhl55A1wfmL3K4nB5w_t3NwSa9S';

window.addEventListener('DOMContentLoaded', () => {
    // 动态加载 Supabase SDK
    if (typeof supabase === 'undefined') {
        let tag = document.createElement('script');
        tag.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        document.head.appendChild(tag);
    }

    const fileName = window.location.pathname.split("/").pop() || "index.html";
    const clickDate = new Date().toISOString().split('T')[0];

    // 延时 1 秒直接发送测试数据，方便我们在控制台看结果
    setTimeout(() => {
        try {
            fetch(`${SUPABASE_URL}/rest/v1/page_stats`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    file_name: fileName,
                    click_date: clickDate,
                    duration: 5
                })
            })
            .then(response => {
                console.log("Supabase 响应状态码:", response.status);
                return response.text();
            })
            .then(text => {
                console.log("Supabase 返回内容:", text);
            })
            .catch(err => {
                console.error("网络请求报错:", err);
            });
        } catch (e) {
            console.error("捕获到异常:", e);
        }
    }, 1000);
});
