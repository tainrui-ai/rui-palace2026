document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById("cookie-consent");
    const acceptBtn = document.getElementById("accept-btn");
    const rejectBtn = document.getElementById("reject-btn");

    // 1. 统一检查逻辑：同时检查 Cookie 和 LocalStorage
    // 获取具体的同意状态值（true / false / null）
    const getConsentValue = () => {
        const cookieMatch = document.cookie.split('; ').find(row => row.startsWith('cookie_consent='));
        if (cookieMatch) {
            return cookieMatch.split('=')[1];
        }
        return localStorage.getItem('cookie_consent');
    };

    const consentValue = getConsentValue();

    // 如果已做过选择（不论是同意还是拒绝），直接隐藏弹窗，不再重复弹出
    if (consentValue !== null) {
        if (modal) modal.style.display = "none";
        // 如果之前选择的是同意，则立即初始化统计脚本
        if (consentValue === 'true') {
            initAnalytics();
        }
    } else {
        // 未做选择时强制显示弹窗，通过遮罩层实现事前拦截
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
            // 写入跨子域 Cookie 和 LocalStorage（同意状态）
            document.cookie = "cookie_consent=true; domain=rui-palace.com; path=/; max-age=31536000; SameSite=Lax";
            localStorage.setItem("cookie_consent", "true");
            dismiss();
            // 用户点击同意后，即刻释放并初始化统计与时长记录模块
            initAnalytics();
        };
    }

    if (rejectBtn) {
        rejectBtn.onclick = function() {
            // 【修补漏洞】：写入拒绝状态，确保记住用户的拒绝，绝不重复弹窗，且不触发统计
            document.cookie = "cookie_consent=false; domain=rui-palace.com; path=/; max-age=31536000; SameSite=Lax";
            localStorage.setItem("cookie_consent", "false");
            dismiss();
        };
    }
});


// ==========================================
// 蕊宫 - 访问统计与时长记录模块（合规封装版）
// ==========================================
function initAnalytics() {
    // 请在此处填入您的真实 Supabase 配置
    const SUPABASE_URL = 'https://tbridsdkmqcbhnqodwzt.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_FmUorhl55A1wfmL3K4nB5w_t3NwSa9S';

    // 检查是否引入了 Supabase SDK，如果没有则动态补上
    if (typeof supabase === 'undefined') {
        let script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        document.head.appendChild(script);
    }

    const fileName = window.location.pathname.split("/").pop() || "index.html";
    const clickDate = new Date().toISOString().split('T')[0];
    let startTime = Date.now();

    // 封装发送数据的函数
    function sendVisitData(durationSeconds) {
        if (durationSeconds <= 0) return;
        
        try {
            // 使用标准的 fetch 直接走 Supabase 的 REST 接口，在关闭页面时比 SDK 更不易被拦截
            const url = `${SUPABASE_URL}/rest/v1/page_stats`;
            const data = JSON.stringify({
                file_name: fileName,
                click_date: clickDate,
                duration: durationSeconds
            });

            // navigator.sendBeacon 是专门用来在页面关闭时向服务器发送数据的黄金标准，绝不会丢失
            if (navigator.sendBeacon) {
                const blob = new Blob([data], { type: 'application/json' });
                navigator.sendBeacon(url, blob);
            } else {
                // 降级普通请求
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`
                    },
                    body: data,
                    keepalive: true // 关键参数：允许页面关闭后继续发送
                });
            }
        } catch (err) {
            console.error("数据上报异常", err);
        }
    }

    // 页面加载后延迟 1 秒初始上报一次（代表有效访问已建立）
    setTimeout(() => {
        sendVisitData(5); 
    }, 1000);

    // 当用户离开页面（关闭、跳转、刷新）时触发，精确计算并补全停留时长
    window.addEventListener('beforeunload', () => {
        let durationSeconds = Math.round((Date.now() - startTime) / 1000);
        sendVisitData(durationSeconds);
    });
}
