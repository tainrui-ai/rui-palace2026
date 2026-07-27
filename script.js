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
// 蕊宫 - 访问统计与时长记录模块（即时测试版）
// ==========================================

const SUPABASE_URL = 'https://tbridsdkmqcbhnqodwzt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FmUorhl55A1wfmL3K4nB5w_t3NwSa9S';

window.addEventListener('DOMContentLoaded', () => {
    if (typeof supabase === 'undefined') {
        let script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        document.head.appendChild(script);
    }

    const fileName = window.location.pathname.split("/").pop() || "index.html";
    const clickDate = new Date().toISOString().split('T')[0];
    let startTime = Date.now();

    function sendVisitData(durationSeconds) {
        try {
            const url = `${SUPABASE_URL}/rest/v1/page_stats`;
            const data = JSON.stringify({
                file_name: fileName,
                click_date: clickDate,
                duration: durationSeconds
            });

            // 用标准 fetch 替代，方便在控制台看请求结果
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY},
                    'Prefer': 'return=minimal'
                },
                body: data
            }).then(res => {
                console.log("数据上报状态:", res.status);
            }).catch(err => {
                console.error("上报出错:", err);
            });
        } catch (err) {
            console.error("异常", err);
        }
    }

    // 【测试修改】页面一加载完就立刻发送一条 1 秒的测试记录，确保能马上在后台看到！
    setTimeout(() => {
        sendVisitData(1);
    }, 1500);

    // 正常离开时再报一次真实时长
    window.addEventListener('beforeunload', () => {
        let durationSeconds = Math.round((Date.now() - startTime) / 1000);
        if (durationSeconds > 0) {
            sendVisitData(durationSeconds);
        }
    });
});
